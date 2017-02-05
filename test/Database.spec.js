import {
  insertTmpDatabaseRecord,
  initializeDatabase,
  defineSchema,
  migrate } from '../src/database/TmpDatabase';


describe('TmpDatabase', () => {
  beforeEach(async () => {
    await migrate();
  });

  it('should migrate database', async () => {
    const Records = await migrate();
    expect(await (await Records).count()).toEqual(0);
  });

  it('should clear database', async () => {
    const Records = defineSchema(initializeDatabase());
    expect(await (await Records).count()).toEqual(0);
  });

  it('should insert records', async () => {
    const Records = defineSchema(initializeDatabase());

    expect(await (await Records).count()).toEqual(0);

    await Records.create({
      protoChainId: 'some',
      caniuseId: 'moo',
      type: 'js-api',
      name: 'foo',
      version: 'loo',
      isSupported: 'y'
    });

    expect(await (await Records).count()).toEqual(1);

    expect(
      await Records.findOne({
        protoChainId: 'some'
      })
      .then(record => ({
        protoChainId: record.protoChainId,
        caniuseId: record.caniuseId,
        name: record.name,
        version: record.version,
        isSupported: record.isSupported
      }))
    )
    .toEqual({
      protoChainId: 'some',
      caniuseId: 'moo',
      name: 'foo',
      version: 'loo',
      isSupported: 'y'
    });
  });

  it('should update database record with insertTmpDatabaseRecord()', async () => {
    const Records = defineSchema(initializeDatabase());
    expect(await (await Records).count()).toEqual(0);

    await insertTmpDatabaseRecord(
      Records,
      {
        protoChainId: 'window.alert()',
        type: 'js-api'
      },
      'chrome',
      '48',
      false
    );

    expect(
      await Records.findOne({
        protoChainId: 'window.alert()'
      })
      .then(record => ({
        protoChainId: record.protoChainId,
        caniuseId: record.caniuseId,
        name: record.name,
        version: record.version,
        isSupported: record.isSupported
      }))
    )
    .toEqual({
      protoChainId: 'window.alert()',
      caniuseId: 'chrome',
      name: 'chrome',
      version: '48',
      isSupported: 'n'
    });
  });
});
