// @flow
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import AssertionFormatter from '../src/assertions/AssertionFormatter';
import {
  insertBulkRecords,
  findSameVersionCompatRecord } from '../src/database/TmpDatabase';
import { getVersionsToMark } from '../src/helpers/GenerateVersions';
import { browserNameToCaniuseMappings } from '../src/helpers/Constants';
import JobQueue from '../src/database/JobQueueDatabase';
import type { RecordType } from '../src/providers/ProviderType';
import type { schemaType as JobQueueType } from '../src/database/JobQueueDatabase';


declare var browser: Object;

type browserType = {
  desiredCapabilities: {
    browserName: string,
    version: number,
    platform: string,
  }
};

const shouldLogCompatSpecResults =
  process.env.LOG_COMPAT_SPEC_RESULTS
    ? process.env.LOG_COMPAT_SPEC_RESULTS === 'true'
    : true;

// @NOTE: If you only want to test a few of these, remember to .slice(0, x) to
//        test only the first x records. There's hundreds of records so this may
//        take a while
//
// @TODO: Iterate through each job in the JobQueue where the job's browserName
//        and version match the current browserName and version

const { browserName, platform, version } = (browser: browserType).desiredCapabilities;
const caniuseId = browserNameToCaniuseMappings[browserName];

function getJobs() {
  execSync('babel-node jobs.js');

  return JSON.parse(
    readFileSync(join(__dirname, 'jobs.json')).toString()
  )
  .filter(e =>
    e.browserName === browserName &&
    e.version === version
  );
}

function log(record: Object, isSupported: bool) {
  if (shouldLogCompatSpecResults) {
    console.log([
      `"${record.protoChainId}" ${isSupported ? 'IS ✅ ' : 'is NOT ❌ '}`,
      `API supported in ${browserName} ${version} on ${platform}`
    ].join(' '));
  }
}

describe('Compat Tests', () => {
  const jobs = getJobs();

  browser.url('http://example.com/');

  const jobQueue = new JobQueue();

  // Dynamically generate compat-tests for each record and each browser
  jobs
    .slice(
      parseInt(process.env.PROVIDERS_INDEX_START, 10) || 0,
      parseInt(process.env.PROVIDERS_INDEX_END, 10) || jobs.length - 1
    )
    .forEach((job: JobQueueType) => {
      const record = (JSON.parse(job.record): RecordType);

      it(`${record.protoChainId} Compat Tests`, async () => {
        const existingRecordTargetVersions =
          await findSameVersionCompatRecord(record, caniuseId);

        // If we have records for the current browser version, the tests are done
        const recordAlreadyExists = existingRecordTargetVersions
          ? Object
              .keys(existingRecordTargetVersions.versions)
              .find(target => (target === String(version)))
          : false;

        if (recordAlreadyExists) {
          console.log(
            `**"${record.protoChainId}" record already exists for ${browserName} ${version} **`
          );
          return true;
        }

        const assertions = AssertionFormatter(record);
        const isSupported = (await browser.execute(`return (${assertions.apiIsSupported})`)).value;

        if (typeof isSupported !== 'boolean') {
          throw new Error([
            'Invalid JS execution value returned from Sauce Labs.',
            `Received ${isSupported} and expected boolean`
          ].join((' ')));
        }

        // If newer version does not support API, current browser version doesn't support it
        // If older version does support API, current browser version does support it
        const { left, right } = getVersionsToMark(
          existingRecordTargetVersions
            ? Object.keys(existingRecordTargetVersions.versions)
            : [],
          caniuseId
        );

        // If middle is supported, mark all right as supported. Otherwise, mark
        // all left as unsupported
        await insertBulkRecords(
          record,
          caniuseId,
          [
            ...(isSupported ? right : left),
            String(version)
          ],
          isSupported
        );
        log(record, isSupported);

        // Fetch the updated records from the TmpDatabase
        const newExistingRecordTargetVersions =
          await findSameVersionCompatRecord(record, caniuseId);

        // Create new jobs if there are more versions of the target to test
        const newVersions = getVersionsToMark(
          Object.keys(newExistingRecordTargetVersions.versions),
          caniuseId
        );
        if (newVersions.middle) {
          await jobQueue.insertBulk([{
            name: caniuseId,
            record: JSON.stringify(record),
            version: newVersions.middle,
            protoChainId: record.protoChainId,
            type: record.type,
            browserName,
            caniuseId
          }]);
        }

        // Remove the finished job from the JobQueue
        await jobQueue.remove({
          name: caniuseId,
          protoChainId: record.protoChainId,
          type: record.type,
          record: JSON.stringify(record),
          version: String(version),
          browserName,
          caniuseId
        });
      });

      return true;
    });
});
