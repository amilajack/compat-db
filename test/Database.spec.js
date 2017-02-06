import {
  insertRecord,
  insertBulkRecords,
  findSameVersionCompatRecord,
  initializeDatabaseConnection,
  migrate } from '../src/database/TmpDatabase';


describe('TmpDatabase', () => {
  afterEach(async () => {
    await migrate();
  });

  it('should migrate database', async () => {
    const Database = await migrate();
    expect(await Database.count()).toEqual(0);
  });

  it('should insert records', async () => {
    const { Database } = initializeDatabaseConnection();
    expect(await Database.count()).toEqual(0);

    await new Database({
      protoChainId: 'some',
      caniuseId: 'chrome',
      type: 'js-api',
      name: 'chrome',
      version: 'loo',
      isSupported: 'y'
    })
    .save();

    expect(await Database.count()).toEqual(1);

    expect(
      await findSameVersionCompatRecord({
        protoChainId: 'some',
        caniuseId: 'chrome',
        type: 'js-api',
        name: 'chrome',
        version: 'loo',
        isSupported: 'y'
      }, 'chrome')
    )
    .toEqual([{
      protoChainId: 'some',
      caniuseId: 'chrome',
      type: 'js-api',
      name: 'chrome',
      id: 1,
      version: 'loo',
      isSupported: 'y'
    }]);
  });

  it('should create bulk version records: insertBulkRecord()', async () => {
    const { Database } = initializeDatabaseConnection();
    expect(await Database.count()).toEqual(0);

    await insertBulkRecords(
      {
        protoChainId: 'window.alert()',
        type: 'js-api'
      },
      'chrome',
      ['6.0', '11.0', '16.0'],
      false
    );

    expect(await Database.count()).toEqual(3);

    expect(
      await findSameVersionCompatRecord({
        protoChainId: 'window.alert()',
        type: 'js-api'
      },
      'chrome')
    )
    .toEqual([
      {
        protoChainId: 'window.alert()',
        caniuseId: 'chrome',
        name: 'chrome',
        version: '6.0',
        id: 1,
        type: 'js-api',
        isSupported: 'n'
      },
      {
        protoChainId: 'window.alert()',
        caniuseId: 'chrome',
        name: 'chrome',
        version: '11.0',
        id: 2,
        type: 'js-api',
        isSupported: 'n'
      },
      {
        protoChainId: 'window.alert()',
        caniuseId: 'chrome',
        name: 'chrome',
        version: '16.0',
        type: 'js-api',
        id: 3,
        isSupported: 'n'
      }
    ]);
  });

  it('should update database record with insertRecord()', async () => {
    const { Database } = initializeDatabaseConnection();
    expect(await Database.count()).toEqual(0);

    const record = {
      protoChainId: 'window.alert()',
      caniuseId: 'chrome',
      type: 'js-api',
      name: 'chrome',
      version: 'loo',
      isSupported: 'y'
    };

    await insertRecord(record, 'chrome', '48', false);

    expect(
      await findSameVersionCompatRecord(record, 'chrome')
    )
    .toEqual([{
      protoChainId: 'window.alert()',
      caniuseId: 'chrome',
      type: 'js-api',
      id: 1,
      name: 'chrome',
      version: '48',
      isSupported: 'n'
    }]);
  });
});
