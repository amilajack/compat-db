import TmpRecordDatabase from '../src/database/TmpRecordDatabase';


describe('TmpRecordDatabase', () => {
  it('should migrate database', async () => {
    const tmpRecordDatabase = new TmpRecordDatabase('tmp-record-test-1');
    await tmpRecordDatabase.migrate();
    expect(await tmpRecordDatabase.count()).toEqual(0);
  });

  it('should find same record versions', async () => {
    const tmpRecordDatabase = new TmpRecordDatabase('tmp-record-test-2');
    await tmpRecordDatabase.migrate();

    expect(await tmpRecordDatabase.count()).toEqual(0);

    await tmpRecordDatabase.insertBulkRecords(
      {
        protoChainId: 'some-protochain-id',
        caniuseId: 'chrome',
        type: 'js-api',
        name: 'chrome',
        versions: JSON.stringify({
          50: 'y',
          49: 'y'
        })
      },
      'chrome',
      ['49', '50'],
      true
    );

    expect(await tmpRecordDatabase.count()).toEqual(1);

    expect(
      await tmpRecordDatabase.findSameVersionCompatRecord(
        {
          protoChainId: 'some-protochain-id',
          type: 'js-api'
        },
        'chrome',
        ['49', '50'],
        true
      )
    )
    .toEqual({
      protoChainId: 'some-protochain-id',
      name: 'chrome',
      caniuseId: 'chrome',
      type: 'js-api',
      id: 1,
      versions: {
        50: 'y',
        49: 'y'
      }
    });
  });

  it('should insert bulk version records', async () => {
    const tmpRecordDatabase = new TmpRecordDatabase('tmp-record-test-3');
    await tmpRecordDatabase.migrate();

    expect(await tmpRecordDatabase.count()).toEqual(0);

    await tmpRecordDatabase.insertBulkRecords(
      {
        protoChainId: 'alert',
        type: 'js-api'
      },
      'chrome',
      ['6.0', '11.0', '16.0'],
      false
    );

    expect(await tmpRecordDatabase.count()).toEqual(1);

    expect(
      await tmpRecordDatabase.findSameVersionCompatRecord({
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
    const tmpRecordDatabase = new TmpRecordDatabase('tmp-record-test-4');
    await tmpRecordDatabase.migrate();

    expect(await tmpRecordDatabase.count()).toEqual(0);

    await tmpRecordDatabase.insertBulkRecords(
      {
        protoChainId: 'alert',
        type: 'js-api'
      },
      'chrome',
      ['6.0', '11.0', '16.0'],
      false
    );

    await tmpRecordDatabase.insertBulkRecords(
      {
        protoChainId: 'foo()',
        type: 'js-api'
      },
      'chrome',
      ['21.0', '11.0', '19.0'],
      true
    );

    expect(await tmpRecordDatabase.count()).toEqual(2);

    const items = (await Promise.all([
      tmpRecordDatabase.findSameVersionCompatRecord({
        protoChainId: 'alert',
        type: 'js-api'
      }, 'chrome'),
      tmpRecordDatabase.findSameVersionCompatRecord({
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
