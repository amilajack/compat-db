// @flow
import 'babel-polyfill';
import bluebird from 'bluebird';
import dotenv from 'dotenv';
import webdriver from 'selenium-webdriver';
import AssertionFormatter from '../src/assertions/AssertionFormatter';
import TmpRecordDatabase from '../src/database/TmpRecordDatabase';
import { getVersionsToMark } from '../src/helpers/GenerateVersions';
import JobQueueDatabase from '../src/database/JobQueueDatabase';
import setup from './setup';
import type { RecordType } from '../src/providers/RecordType';
import type { JobQueueType } from '../src/database/JobQueueDatabase';
import type { browserCapabilityType } from './setup';


// Replace native Promise implementation with bluebird for better stack
// traces from Promises
global.Promise = bluebird;

global.Promise.config({
  longStackTraces: true
});

/* eslint no-console: 0 */

const jobQueue = new JobQueueDatabase();

dotenv.config();

type finishedTestType = {
  job: JobQueueType,
  record: RecordType,
  isSupported: bool
};

type capabilityType = {
  browserName: string,
  version: string,
  platform: string,
};

type exTestType = Promise<Array<finishedTestType>>;

export async function executeTestsParallel(capability: capabilityType, tests: Array<string>) {
  const { browserName, platform, version } = capability;
  const username = process.env.SAUCE_USERNAME;
  const accessKey = process.env.SAUCE_ACCESS_KEY;

  if (!accessKey || !username) {
    throw new Error('Invalid Sauce Labs API key or username');
  }

  const driver = new webdriver
    .Builder()
    .withCapabilities({
      browserName,
      platform,
      version,
      username,
      accessKey,
      'idle-timeout': 3000
    })
    .usingServer(
      `http://${username}:${accessKey}@ondemand.saucelabs.com:80/wd/hub`
    )
    .build();

  await driver.get('http://example.com');

  const items = await driver.executeScript(
    `return (function() {
      return [${tests.join(',')}];
    })()`
  );

  await driver.quit();

  return items;
}

/**
 * Take an array of records, generate and run tests, and return the results
 * @TODO: Optimization: Batch tests
 */
export async function executeTests(capability: capabilityType, jobs: JobQueueType[]): exTestType {
  const { browserName, platform, version } = capability;

  const logMessage = `Executing ${jobs.length} tests in parallel on ${platform} ${browserName} ${version}`;
  console.log(logMessage);
  console.log(logMessage.split('').map(() => '-').join(''));

  return executeTestsParallel(
    capability,
    jobs.map(job => AssertionFormatter(JSON.parse(job.record)).apiIsSupported)
  )
  .then((testResults: Array<bool>) => testResults.map((isSupported, index) => {
    const job = jobs[index];
    const record: RecordType = JSON.parse(job.record);

    if (typeof isSupported !== 'boolean') {
      throw new Error([
        'Invalid JS execution value returned from Sauce Labs.',
        `Received ${isSupported} and expected boolean`
      ].join((' ')));
    }
    return { record, isSupported, job };
  }))
  .catch(console.log);
}

function log(browserName, version, platform, record: Object, isSupported: bool) {
  const shouldLogCompatSpecResults =
    process.env.LOG_COMPAT_SPEC_RESULTS
      ? process.env.LOG_COMPAT_SPEC_RESULTS === 'true'
      : true;

  if (shouldLogCompatSpecResults) {
    console.log([
      `"${record.protoChainId}" ${isSupported ? 'IS ✅ ' : 'is NOT ❌ '}`,
      `API supported in ${browserName} ${version} on ${platform}`
    ].join(' '));
  }
}

/**
 * Handle the respective results
 */
export async function handleFinishedTest(finishedTest: finishedTestType, tableName: string = 'tmp-records') {
  const tmpRecordDatabase = new TmpRecordDatabase(tableName);
  const { job, record, isSupported } = finishedTest;
  const { caniuseId, browserName, platform, version } = job;

  const existingRecordTargetVersions =
    await tmpRecordDatabase.findSameVersionCompatRecord(record, caniuseId);

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
  await tmpRecordDatabase.insertBulkRecords(
    record,
    caniuseId,
    [
      ...(isSupported ? right : left),
      String(version)
    ],
    isSupported
  );

  log(browserName, version, platform, record, isSupported);

  // Fetch the updated records from the TmpRecordDatabase
  const newExistingRecordTargetVersions =
    await tmpRecordDatabase.findSameVersionCompatRecord(record, caniuseId);

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
      platform,
      browserName,
      caniuseId
    }]);
  }

  // Remove the finished job from the JobQueue
  return jobQueue.remove({
    name: caniuseId,
    protoChainId: record.protoChainId,
    type: record.type,
    record: JSON.stringify(record),
    version: String(version),
    platform,
    browserName,
    caniuseId
  });
}

type handleCapabilityType = Promise<Array<Promise<any>>>;

/**
 * @TODO: Optimizations:
 *          * Pass references to records instead of values. Possibly use ID in
 *            database. JSON.parse/stringify are expensive
 */
export async function handleCapability(capability: browserCapabilityType): handleCapabilityType {
  const { browserName, version } = capability;

  // Find all the jobs that match the current capability's browserName, version,
  // and platform
  const allJobs: Array<JobQueueType> = (await jobQueue.find({
    // @TODO @HACK: Jobs that fail do not change their status back to 'queued'
    //              For the timebeing, lets ignore the status when querying
    //              the job queue
    // status: 'queued',
    browserName,
    version
  }))
  .filter(each => each.browserName !== 'safari');

  const jobsEndIndex = process.env.NODE_ENV === 'test'
    ? 10
    : process.env.JOBS_INDEX_END;

  const jobs = allJobs.slice(
    parseInt(process.env.JOBS_INDEX_START, 10) || 0,
    parseInt(jobsEndIndex, 10) || allJobs.length
  );

  await Promise.all(jobs.map(job => jobQueue.markJobsStatus(job, 'running'))); // eslint-disable-line

  return (await executeTests(capability, jobs)).map(handleFinishedTest);
}

/**
 * @NOTE: If you only want to test a few of these, remember to .slice(0, x) to
 *        test only the first x records. There's hundreds of records so this may
 *        take a while
 *
 * @TODO: Batch tests on browsers
 *
 * @TODO: Throttle promise
 */
async function Compat() {
  const browserCapabilities: browserCapabilityType[] = await setup();

  if (typeof browserCapabilities === 'boolean') {
    console.log('Jobs already exist in queue. No need to generate more');
    return process.exit(0);
  }

  // Dynamically generate compat-tests for each record and each browser
  await Promise.all(browserCapabilities.map(handleCapability));

  return process.exit(0);
}

export default Compat;

Compat();
