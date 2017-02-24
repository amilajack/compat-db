/* eslint import/prefer-default-export: 0 */
import JobQueueDatabase from '../src/database/JobQueueDatabase';


export const baseJob = {
  name: 'chrome',
  browserName: 'chrome',
  protoChainId: 'document.alert',
  platform: 'Windows 10',
  version: '48',
  record: JSON.stringify({
    protoChainId: 'document.alert',
    caniuseId: 'chrome'
  }),
  type: 'js-api',
  caniuseId: 'chrome'
};

describe('JobQueueDatabase', () => {
  it('should insert bulk and get all records', async () => {
    const jobQueue = new JobQueueDatabase('job-queue-test-3');
    await jobQueue.migrate();

    await jobQueue.insertBulk([
      {
        name: 'chrome',
        browserName: 'chrome',
        protoChainId: 'document.alert',
        version: '48',

        record: JSON.stringify({
          protoChainId: 'document.alert',
          caniuseId: 'chrome'
        }),
        type: 'js-api',
        platform: 'Windows 10',
        caniuseId: 'chrome'
      },
      {
        name: 'firefox',
        browserName: 'firefox',
        protoChainId: 'document.alert',
        version: '24',
        record: JSON.stringify({
          protoChainId: 'document.alert',
          caniuseId: 'firefox'
        }),
        type: 'js-api',
        platform: 'Windows 10',
        caniuseId: 'firefox'
      }
    ]);

    expect(await jobQueue.count()).toEqual(2);

    expect(await jobQueue.getAll()).toEqual([
      {
        id: 1,
        name: 'chrome',
        browserName: 'chrome',
        protoChainId: 'document.alert',
        version: '48',
        record: JSON.stringify({
          protoChainId: 'document.alert',
          caniuseId: 'chrome'
        }),
        status: 'queued',
        type: 'js-api',
        platform: 'Windows 10',
        caniuseId: 'chrome'
      },
      {
        id: 2,
        name: 'firefox',
        browserName: 'firefox',
        protoChainId: 'document.alert',
        version: '24',
        record: JSON.stringify({
          protoChainId: 'document.alert',
          caniuseId: 'firefox'
        }),
        status: 'queued',
        type: 'js-api',
        platform: 'Windows 10',
        caniuseId: 'firefox'
      }
    ]);
  });

  it('should mark jobs as running', async () => {
    const jobQueue = new JobQueueDatabase('job-queue-test-4');
    await jobQueue.migrate();

    expect(await jobQueue.count()).toEqual(0);

    await jobQueue.insertBulk([
      baseJob,
      baseJob
    ]);

    expect(await jobQueue.count()).toEqual(2);

    await jobQueue.markJobsStatus(
      {
        browserName: baseJob.browserName,
        platform: 'Windows 10',
        protoChainId: baseJob.protoChainId
      },
      'running'
    );

    const allJobs = await jobQueue.getAll();
    expect(await jobQueue.count()).toEqual(2);
    expect(allJobs.map((job) => job.status)).toEqual(['running', 'running']);
  });

  it('should remove job', async () => {
    const jobQueue = new JobQueueDatabase('job-queue-test-5');
    await jobQueue.migrate();

    expect(await jobQueue.count()).toEqual(0);

    await jobQueue.insertBulk([
      baseJob,
      {
        ...baseJob,
        protoChainId: 'document.write',
        record: JSON.stringify({
          protoChainId: 'document.write',
          caniuseId: 'chrome'
        })
      }
    ]);

    expect(await jobQueue.count()).toEqual(2);

    await jobQueue.remove({
      name: 'chrome',
      protoChainId: 'document.write'
    });

    expect(await jobQueue.count()).toEqual(1);
  });
});
