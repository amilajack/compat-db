import {
  insertBulkRecords,
  findSameVersionCompatRecord,
  initializeDatabaseConnection,
  migrate } from '../src/database/TmpRecordDatabase';


describe('TmpRecordDatabase', () => {
  beforeEach(async () => {
    await migrate();
  });

  afterEach(async () => {
    await migrate();
  });

  it('should migrate database', async () => {
    const Database = await migrate();
    expect(await Database.count()).toEqual(0);
  });

  it('should find same record versions', async () => {
    const { Database } = initializeDatabaseConnection();
    expect(await Database.count()).toEqual(0);

    await new Database({
      protoChainId: 'some',
      caniuseId: 'chrome',
      type: 'js-api',
      name: 'chrome',
      versions: JSON.stringify({
        50: 'y',
        49: 'y'
      })
    })
    .save();

    expect(await Database.count()).toEqual(1);

    expect(
      await findSameVersionCompatRecord({
        protoChainId: 'some-protochain-id',
        type: 'js-api'
      }, 'chrome')
    )
    .toEqual({
      protoChainId: 'some-protochain-id',
      type: 'js-api',
      id: 1,
      versions: {
        50: 'y',
        49: 'y'
      }
    });
  });

  it('should insert bulk version records', async () => {
    const { Database } = initializeDatabaseConnection();
    expect(await Database.count()).toEqual(0);

    await insertBulkRecords(
      {
        protoChainId: 'alert',
        type: 'js-api'
      },
      'chrome',
      ['6.0', '11.0', '16.0'],
      false
    );

    expect(await Database.count()).toEqual(1);

    expect(
      await findSameVersionCompatRecord({
        protoChainId: 'alert',
        type: 'js-api'
      },
      'chrome')
    )
    .toEqual({
      protoChainId: 'alert',
      caniuseId: 'chrome',
      name: 'chrome',
      versions: {
        '6.0': 'n',
        '11.0': 'n',
        '16.0': 'n'
      },
      id: 1,
      type: 'js-api'
    });
  });

  it('should handle multiple bulk version inserts', async () => {
    const { Database } = initializeDatabaseConnection();
    expect(await Database.count()).toEqual(0);

    await insertBulkRecords(
      {
        protoChainId: 'alert',
        type: 'js-api'
      },
      'chrome',
      ['6.0', '11.0', '16.0'],
      false
    );

    await insertBulkRecords(
      {
        protoChainId: 'foo()',
        type: 'js-api'
      },
      'chrome',
      ['21.0', '11.0', '19.0'],
      true
    );

    expect(await Database.count()).toEqual(2);

    const items = (await Promise.all([
      findSameVersionCompatRecord({
        protoChainId: 'alert',
        type: 'js-api'
      }, 'chrome'),
      findSameVersionCompatRecord({
        protoChainId: 'foo()',
        type: 'js-api'
      }, 'chrome')
    ]))
    .map(e => ({ protoChainId: e.protoChainId, versions: e.versions }));

    expect(items).toEqual([
      {
        protoChainId: 'alert',
        versions: {
          '6.0': 'n',
          '11.0': 'n',
          '16.0': 'n'
        }
      },
      {
        protoChainId: 'foo()',
        versions: {
          '21.0': 'y',
          '11.0': 'y',
          '19.0': 'y'
        }
      }
    ]);
  });
});
