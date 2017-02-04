import { insertTmpDatabaseRecord, migrate } from '../src/database/TmpDatabase';


describe('TmpDatabase', () => {
  it('should clear database', async () => {
    const Records = await migrate();
    await Records.create({
      protoChainId: 'some',
      caniuseId: 'moo',
      name: 'foo',
      version: 'loo',
      isSupported: 'y'
    });

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

  it('should update database record', async () => {
    const Records = await migrate();

    insertTmpDatabaseRecord(
      Records,
      { protoChainId: 'window.alert()' },
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
