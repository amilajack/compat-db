// @flow
import { ofAPIType } from '../src/providers/Providers';
import JobQueue from '../src/database/JobQueueDatabase';
import { browserNameToCaniuseMappings } from '../src/helpers/Constants';
import {
  convertCaniuseToBrowserName,
  filterDuplicateTargets,
  allTargets,
  getVersionsToMark } from '../src/helpers/GenerateVersions';


export type browserCapabilityType = {
  browserName: string,
  version: string,
  platform: string
};

export default async function createJobsFromRecords(): Promise<Array<browserCapabilityType>> {
  const queue = new JobQueue();
  const records = ofAPIType('js');

  // If there are jobs in the queue already, skip the following steps
  if ((await queue.count()) === 0) {
    const caniuseIds: Array<string> = Object.values(browserNameToCaniuseMappings); // eslint-disable-line
    const jobs = [];

    // If no jobs are in the JobQueue, create a job for every record and caniuseId
    records
      .slice(
        parseInt(process.env.PROVIDERS_INDEX_START, 10) || 0,
        parseInt(process.env.PROVIDERS_INDEX_END, 10) || records.length - 1
      )
      .forEach(record => {
        caniuseIds.forEach((caniuseId) => {
          const version = getVersionsToMark([], caniuseId).middle;
          const browserName = convertCaniuseToBrowserName(caniuseId);
          const { platform } = allTargets.find(e => // eslint-disable-line
            e.browserName === browserName &&
            e.version === version
          );

          jobs.push({
            name: caniuseId,
            record: JSON.stringify(record),
            protoChainId: record.protoChainId,
            type: record.type,
            platform,
            browserName,
            version,
            caniuseId
          });
        });
      });

    await queue.insertBulk(jobs);
  }

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

  return targets;
}

// @TODO
// PrepareDatabase(records, join(__dirname, '..', 'lib', 'all.json'));
