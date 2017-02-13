import JobQueueDatabase from '../src/database/JobQueueDatabase';


const baseRecord = {
  name: 'chrome',
  browserName: 'chrome',
  protoChainId: 'document.alert',
  version: '48',
  record: JSON.stringify({
    protoChainId: 'document.alert',
    caniuseId: 'chrome'
  }),
  type: 'js-api',
  caniuseId: 'chrome'
};

describe('JobQueueDatabase', () => {
  beforeEach(async () => {
    const jobQueue = new JobQueueDatabase();
    await jobQueue.migrate();
  });

  afterEach(async () => {
    const jobQueue = new JobQueueDatabase();
    await jobQueue.migrate();
  });

  it('should insert bulk and get all records', async () => {
    const jobQueue = new JobQueueDatabase();

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
        type: 'js-api',
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
        type: 'js-api',
        caniuseId: 'firefox'
      }
    ]);
  });

  it('should should remove job', async () => {
    const jobQueue = new JobQueueDatabase();

    expect(await jobQueue.count()).toEqual(0);

    await jobQueue.insertBulk([
      baseRecord,
      {
        ...baseRecord,
        protoChainId: 'document.write',
        record: JSON.stringify({
          protoChainId: 'document.write',
          caniuseId: 'chrome'
        })
      }
    ]);

    expect(await jobQueue.count()).toEqual(2);

    jobQueue.remove({
      name: 'chrome',
      protoChainId: 'document.write'
    });

    expect(await jobQueue.count()).toEqual(1);
  });
});
