import JobQueue from '../src/database/JobQueueDatabase';
import Compat, {
  executeTests,
  handleFinishedTest,
  handleCapability } from '../compat-tests/Compat';
import setup from '../compat-tests/setup';
import * as TmpRecordDatabase from '../src/database/TmpDatabase';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const capability = {
  browserName: 'chrome',
  version: '48.0',
  platform: 'Windows 10'
};
const records = [
  {
    protoChain: ['window', 'Document', 'querySelector'],
    protoChainId: 'window.Document.querySelector',
    name: 'document.querySelector',
    type: 'js-api'
  },
  {
    type: 'css-api',
    protoChainId: 'window.CSSStyleDeclaration.borderWidth',
    protoChain: ['window', 'CSSStyleDeclaration', 'borderWidth']
  }
];

const [querySelectorRecord, borderWidthRecord] = records;

const jobs = [
  Object.assign({}, capability, {
    record: JSON.stringify(querySelectorRecord),
    caniuseId: 'chrome'
  }),
  Object.assign({}, capability, {
    record: JSON.stringify(borderWidthRecord),
    caniuseId: 'chrome'
  })
];

const [querySelectorJob, borderWidthJob] = jobs;

describe('Comapt', () => {
  beforeAll(async () => {
    await TmpRecordDatabase.migrate();
    const jobQueue = new JobQueue();
    await jobQueue.migrate();
  });

  afterEach(async () => {
    await TmpRecordDatabase.migrate();
    const jobQueue = new JobQueue();
    await jobQueue.migrate();
  });

  it('should execute tests', async () => {
    expect(await executeTests(capability, jobs)).toEqual([
      {
        job: querySelectorJob,
        record: querySelectorRecord,
        isSupported: true
      },
      {
        job: borderWidthJob,
        record: borderWidthRecord,
        isSupported: true
      }
    ]);
  });

  it('should handle finished tests', async () => {
    const [finishedTest] = await executeTests(capability, jobs);
    await handleFinishedTest(finishedTest);

    // There should be one newly created record
    const count = await TmpRecordDatabase.Database.count();
    expect(count).toEqual(1);

    // There should be one job
    const jobQueue = new JobQueue();
    expect(await jobQueue.count()).toEqual(1);

    const items = await TmpRecordDatabase.Database
      .fetchAll()
      .then(res => res.toJSON());

    const result = [{
      id: 1,
      name: 'chrome',
      protoChainId: 'window.Document.querySelector',
      versions: '{"41.0":"y","42.0":"y","43.0":"y","44.0":"y","45.0":"y","46.0":"y","47.0":"y","48.0":"y","49.0":"y","50.0":"y","51.0":"y","52.0":"y","53.0":"y","54.0":"y","55.0":"y","56.0":"y"}',
      type: 'js-api',
      caniuseId: 'chrome'
    }];

    expect(result).toEqual(items);
  });

  it('should handle capability', async () => {
    const result = await handleCapability({
      browserName: 'chrome',
      version: '48.0',
      caniuseId: 'chrome',
      platform: 'Windows 10'
    });

    expect(result).toEqual([]);
  });

  it.skip('should run e2e', async () => {
    const jobQueue = new JobQueue();

    // Initially, JobQueue should have no records
    expect(await jobQueue.count()).toEqual(0);
    expect(await TmpRecordDatabase.Database.count()).toEqual(0);
    const firstRun = await jobQueue.getAll();

    await setup();

    // When running the jobs again, the jobs should not be the same
    await Compat();
    expect(await jobQueue.count()).toEqual(1);
    expect(await TmpRecordDatabase.Database.count()).toEqual(1);
    const secondRun = await jobQueue.getAll();

    await Compat();
    expect(await jobQueue.count()).toEqual(1);
    expect(await TmpRecordDatabase.Database.count()).toEqual(1);
    const thirdRun = await jobQueue.getAll();

    expect(firstRun).not.toEqual(secondRun);
    expect(thirdRun).not.toEqual(secondRun);
  });

  // it.skip('should handle capabilities', () => {});
});
