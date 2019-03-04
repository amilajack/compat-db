// @flow
import JobQueueDatabase from '../src/database/JobQueueDatabase';
import Compat, {
  executeTests,
  executeTestsParallel,
  handleFinishedTest,
  handleCapability
} from '../compat-tests/Compat';
import setup from '../compat-tests/setup';
import TmpRecordDatabase from '../src/database/TmpRecordDatabase';
import { baseRecord } from './JobQueueDatabase.spec';

jest.setTimeout(100000);

const capability = {
  browserName: 'chrome',
  version: '48.0',
  platform: 'Windows 10'
};
const records = [
  {
    protoChain: ['document', 'querySelector'],
    protoChainId: 'document.querySelector',
    name: 'document.querySelector',
    type: 'js-api'
  },
  {
    protoChain: ['CSSStyleDeclaration', 'borderWidth'],
    protoChainId: 'CSSStyleDeclaration.borderWidth',
    name: 'CSSStyleDeclaration.borderWidth',
    type: 'css-api'
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
  it.concurrent('should execute tests', async () => {
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

  it.concurrent('should execute tests in parallel', async () => {
    expect(
      await executeTestsParallel(
        {
          browserName: 'chrome',
          version: '48.0',
          platform: 'Windows 10'
        },
        [true, false, true, true, false, true]
      )
    ).toEqual([true, false, true, true, false, true]);

    const exampleTest = `(function exampleTest() {
      return 'some';
    })()`;

    expect(
      await executeTestsParallel(
        {
          browserName: 'firefox',
          version: '42.0',
          platform: 'Windows 10'
        },
        [
          exampleTest,
          exampleTest,
          exampleTest,
          exampleTest,
          exampleTest,
          exampleTest
        ]
      )
    ).toEqual(['some', 'some', 'some', 'some', 'some', 'some']);
  });

  it.concurrent('should handle finished tests', async () => {
    const jobQueue = new JobQueueDatabase('compat-test-1');
    const tmpRecordDatabase = new TmpRecordDatabase(
      'tmp-record-database-compat-1'
    );

    await jobQueue.migrate();
    await tmpRecordDatabase.migrate();

    expect(await jobQueue.count()).toEqual(0);
    expect(await tmpRecordDatabase.count()).toEqual(0);

    const [finishedTest] = await executeTests(capability, jobs);
    await handleFinishedTest(finishedTest, 'tmp-record-database-compat-1');

    console.log(await tmpRecordDatabase.getAll());

    // There should be one newly created record
    expect(await tmpRecordDatabase.count()).toEqual(1);

    const items = await tmpRecordDatabase.getAll();

    const result = [
      {
        id: 1,
        name: 'chrome',
        protoChainId: 'document.querySelector',
        versions:
          '{"41.0":"y","42.0":"y","43.0":"y","44.0":"y","45.0":"y","46.0":"y","47.0":"y","48.0":"y","49.0":"y","50.0":"y","51.0":"y","52.0":"y","53.0":"y","54.0":"y","55.0":"y","56.0":"y"}',
        type: 'js-api',
        caniuseId: 'chrome'
      }
    ];

    expect(result).toEqual(items);
  });

  it.concurrent('should handle capability', async () => {
    const result = await handleCapability({
      browserName: 'chrome',
      version: '48.0',
      caniuseId: 'chrome',
      platform: 'Windows 10'
    });

    expect(result).toEqual([]);
  });

  it.skip('should run e2e', async () => {
    const jobQueue = new JobQueueDatabase('compat-test-e2e');
    const tmpRecordDatabase = new TmpRecordDatabase(
      'tmp-record-database-compat-2'
    );

    await jobQueue.migrate();

    // Initially, JobQueue should have no records
    expect(await jobQueue.count()).toEqual(0);
    expect(await tmpRecordDatabase.count()).toEqual(0);
    const firstRun = await jobQueue.getAll();

    await setup();

    // When running the jobs again, the jobs should not be the same
    await Compat();
    expect(await jobQueue.count()).toEqual(1);
    expect(await tmpRecordDatabase.count()).toEqual(1);
    const secondRun = await jobQueue.getAll();

    await Compat();
    expect(await jobQueue.count()).toEqual(1);
    expect(await tmpRecordDatabase.count()).toEqual(1);
    const thirdRun = await jobQueue.getAll();

    expect(firstRun).not.toEqual(secondRun);
    expect(thirdRun).not.toEqual(secondRun);
  });

  it.skip('should persist job on failure', async () => {
    const jobQueue = new JobQueueDatabase('job-queue-should-persist');
    expect(await jobQueue.count()).toEqual(0);

    await jobQueue.insertBulk([
      {
        ...baseRecord,
        version: '35.0',
        type: 'js-api',
        protoChainId: 'document.write',
        record: JSON.stringify({
          protoChain: ['document', 'write'],
          protoChainId: 'document.write',
          type: 'js-api'
        })
      }
    ]);

    expect(await jobQueue.getAll()).toEqual([
      {
        id: 1,
        name: 'chrome',
        browserName: 'chrome',
        platform: 'Windows 10',
        protoChainId: 'document.write',
        version: '35.0',
        type: 'js-api',
        record:
          '{"protoChain":["document","write"],"protoChainId":"document.write","type":"js-api"}',
        caniuseId: 'chrome',
        status: 'queued'
      }
    ]);

    expect(await jobQueue.count()).toEqual(1);

    await Compat();

    expect(await jobQueue.count()).toEqual(1);
  });

  // @TODO
  // it.skip('should handle capabilities', () => {});
});
