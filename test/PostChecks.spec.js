import TmpRecordDatabase from '../src/database/TmpRecordDatabase';
import PostChecks from '../compat-tests/PostChecks';
import RecordMetadataDatabase from '../src/database/RecordMetadataDatabase';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;

describe('PostChecks', () => {
  it('should take records and return deduped results', async () => {
    const record = {
      type: 'js-api',
      protoChainId: 'Array.push'
    };

    const recordMetadataDatabase = new RecordMetadataDatabase('test-post-checks-record-metadata');
    const tmpRecordDatabase = new TmpRecordDatabase('tmp-record-database-post-checks');

    await tmpRecordDatabase.migrate();
    await recordMetadataDatabase.migrate();

    // Simulate duplicate TmpRecordDatabase insertions
    await tmpRecordDatabase.insertBulkRecords(
      record,
      'safari',
      ['6.0', '7.0', '8.0', '9.0'],
      true
    );
    await tmpRecordDatabase.insertBulkRecords(
      record,
      'safari',
      ['10.0'],
      true
    );

    await recordMetadataDatabase.insertBulk([
      {
        id: 1,
        protoChainId: 'Array.push',
        astNodeType: 'MemberExpression',
        isStatic: false,
        polyfillable: true,
        type: 'js-api'
      }
    ]);

    expect(await tmpRecordDatabase.count()).toEqual(2);
    expect(await recordMetadataDatabase.count()).toEqual(1);

    const finalRecords = await PostChecks('test-post-checks-record-metadata');

    // expect the result to be deduped and of correct format
    expect(finalRecords).toEqual({
      records: [
        {
          id: 1,
          protoChainId: 'Array.push',
          astNodeType: 'MemberExpression',
          isStatic: false,
          polyfillable: 1,
          type: 'js-api',
          targets: {
            'internet explorer': {},
            MicrosoftEdge: {},
            safari: { '6.0': 'y', '7.0': 'y', '8.0': 'y', '9.0': 'y', '10.0': 'y' },
            opera: {},
            firefox: {},
            chrome: {}
          }
        }
      ]
    });
  });
});
