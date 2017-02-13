// @flow
import { join } from 'path';
import { writeFileSync } from 'fs';
import Providers from '../src/providers/Providers';
import PrepareDatabase from '../src/database/PrepareDatabase';
import JobQueue from '../src/database/JobQueueDatabase';
import writeAllJobsToJSON from './jobs';
import { browserNameToCaniuseMappings } from '../src/helpers/Constants';
import {
  convertCaniuseToBrowserName,
  filterDuplicateTargets,
  allTargets,
  getVersionsToMark } from '../src/helpers/GenerateVersions';


const records = Providers();

/**
 * Create 'capabilities' by writing to the temporary file `capabilities.json`.
 *
 * For every job in the JobQueue, remove duplicate targets and format the results
 * to capabilities. `wdio.js` will read the `capabilities.json` file
 */
async function writeCapabilities() {
  const queue = new JobQueue();

  // If there are jobs in the queue already, skip the following steps
  if ((await queue.count()) > 0) return;

  const caniuseIds = (Object.values(browserNameToCaniuseMappings): Array<string>); // eslint-disable-line
  const jobs = [];

  // If no jobs are in the JobQueue, create a job for every record and caniuseId
  records.forEach(record => {
    caniuseIds.forEach((caniuseId) => {
      jobs.push({
        name: caniuseId,
        browserName: convertCaniuseToBrowserName(caniuseId),
        record: JSON.stringify(record),
        version: getVersionsToMark([], caniuseId).middle,
        protoChainId: record.protoChainId,
        type: record.type,
        caniuseId
      });
    });
  });

  await queue.insertBulk(jobs);

  // Take all the targets in JobQueue. Filter duplicates
  const targets = filterDuplicateTargets(
    (await queue.getAll())
      .filter(e =>
        !!e.browserName &&
        !!e.version
      )
      .map(job => ({
        browserName: job.browserName,
        version: job.version,
        platform: allTargets.find(e =>
          e.browserName === job.browserName &&
          e.version === job.version
        ).platform  // eslint-disable-line
      }))
  );

  writeFileSync(
    join(__dirname, '..', 'capabilities.json'),
    JSON.stringify(targets)
  );

  await writeAllJobsToJSON();

  process.exit(0);
}

PrepareDatabase(records, join(__dirname, '..', 'lib', 'all.json'));
writeCapabilities();
