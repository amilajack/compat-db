import { expect as chaiExpect } from 'chai';
import RecordMetadata, {
  writeRecordMetadataToDB,
  parallelizeBrowserTests } from '../compat-tests/RecordMetadata';
import { ofAPIType } from '../src/providers/Providers';
import RecordMetadataDatabase from '../src/database/RecordMetadataDatabase';

jest.setTimeout(2000000);

const experimentalAPIsToSupport = [
  'VRDisplay', 'Atomics', 'WebAssembly', 'SharedArrayBuffer', 'WebGL2RenderingContext'
];

describe('RecordMetadataDatabase', () => {
  it.concurrent('should have objects with the expected properties', async () => {
    const recordMetadata = await RecordMetadata();

    recordMetadata.forEach(({ record, isStatic, astNodeType }) => {
      chaiExpect(record).to.be.an('object');
      chaiExpect(isStatic).to.be.a('boolean');
      chaiExpect(astNodeType).to.be.a('string');
    });
  });

  /**
   * @TODO: Check that we have at least a certain amount of record metadata
   */
  it.concurrent('should have expected length', async () => {
    const recordMetadata = await RecordMetadata();
    expect(recordMetadata.length).toBeLessThan(ofAPIType('js').length);
    expect(recordMetadata.length).toBeGreaterThan(ofAPIType('js').length / 2);
  });

  it.concurrent('should write metadata records to database', async () => {
    const recordMetadataDatabase = new RecordMetadataDatabase('test-record-metadata-1');
    await recordMetadataDatabase.migrate();

    expect(await recordMetadataDatabase.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB(undefined, undefined, 'test-record-metadata-1');
    const insertedMetadata = await recordMetadataDatabase.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await recordMetadataDatabase.count()).toEqual(metadata.length);
  });

  it.concurrent('should parallelize tests across browsers and retain order of test results', async () => {
    // If not running in CI, run against local chrome installation
    if (!process.env.CI) {
      expect(await parallelizeBrowserTests([
        true, false, false, true, false, true, false, false
      ]))
      .toEqual([
        true, false, false, true, false, true, false, false
      ]);
    }

    expect(
      await parallelizeBrowserTests([
        true, false, false, true, false, true, false, false
      ])
    )
    .toEqual([
      true, false, false, true, false, true, false, false
    ]);
  });

  it.concurrent('should have exact match', async () => {
    const testExperimentalAPIs = false;
    const recordMetadataDatabase = new RecordMetadataDatabase('test-record-metadata-2');
    await recordMetadataDatabase.migrate();

    expect(await recordMetadataDatabase.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB(undefined, undefined, 'test-record-metadata-2');
    const insertedMetadata = await recordMetadataDatabase.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await recordMetadataDatabase.count()).toEqual(metadata.length);

    // String escapes in astNodeType prevent us from doing an elegant
    // equality comparison. For now, lets remove the astNodeType from the
    // tests

    /* eslint-disable */
    const metadataSet = metadata.map(e => {
      const item = delete e.astNodeType;
      return item;
    });
    const insertedMetadataSet = new Set(insertedMetadata.map(e => {
      const item = delete e.astNodeType;
      return item;
    }));
    /* eslint-enable */

    for (const item of metadataSet) {
      expect(insertedMetadataSet.has(item)).toEqual(true);
    }

    const protoChainIDs = metadata.map(each => each.protoChainId);

    if (testExperimentalAPIs) {
      for (const api of experimentalAPIsToSupport) {
        expect(protoChainIDs).toContain(api);
      }
    }
  });
});
