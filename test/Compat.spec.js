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

process.on('uncaughtException', err => {
  throw err;
});

const BROWSER_CAPABILITY = {
  browserName: 'chrome',
  version: '48.0',
  platform: 'Windows 10'
};

const TEST_RECORDS = [
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

const [querySelectorRecord, borderWidthRecord] = TEST_RECORDS;

const TEST_JOBS = [
  {
    ...BROWSER_CAPABILITY,
    ...querySelectorRecord,
    record: JSON.stringify(querySelectorRecord),
    caniuseId: 'query-selector'
  },
  {
    ...BROWSER_CAPABILITY,
    ...borderWidthRecord,
    record: JSON.stringify(borderWidthRecord),
    caniuseId: 'border-width'
  }
];

const [querySelectorJob, borderWidthJob] = TEST_JOBS;

describe('Comapt', () => {
  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  it('should execute tests', async () => {
    expect(await executeTests(BROWSER_CAPABILITY, TEST_JOBS)).toEqual([
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

  it('should execute tests in parallel', async () => {
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

  it('should handle finished tests', async () => {
    const jobQueue = new JobQueueDatabase('compat-test-1');
    const tmpRecordDatabase = new TmpRecordDatabase(
      'tmp-record-database-compat-1'
    );
    await jobQueue.migrate();
    await tmpRecordDatabase.migrate();

    // There should be no rows initially
    expect(await jobQueue.count()).toEqual(0);
    expect(await tmpRecordDatabase.count()).toEqual(0);

    // Manually insert initial jobs into job queue
    await jobQueue.connection.knex('compat-test-1').insert(
      TEST_JOBS.map(e => {
        delete e.protoChain;
        return e;
      })
    );
    expect(await jobQueue.count()).not.toEqual(0);

    const [finishedTest] = await executeTests(BROWSER_CAPABILITY, TEST_JOBS);
    expect(await jobQueue.count()).not.toEqual(0);
    await handleFinishedTest(
      finishedTest,
      'tmp-record-database-compat-1',
      jobQueue
    );
    expect(await jobQueue.count()).not.toEqual(0);

    // There should be one newly created record
    expect(await tmpRecordDatabase.count()).toEqual(1);
    await expect(tmpRecordDatabase.getAll()).resolves.toMatchSnapshot();

    // There should be one job left (because we created two jobs)
    expect(await jobQueue.count()).toEqual(1);
    await expect(tmpRecordDatabase.getAll()).resolves.toMatchSnapshot();
  });

  it('should handle capability', async () => {
    const jobQueue = new JobQueueDatabase('job-queue-test-handle-capability');
    await jobQueue.migrate();
    const result = await handleCapability(
      {
        browserName: 'chrome',
        version: '48.0',
        caniuseId: 'chrome',
        platform: 'Windows 10'
      },
      jobQueue
    );
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
