import { expect as chaiExpect } from 'chai';
import RecordMetadata, {
  writeRecordMetadataToDB,
  parallelizeBrowserTests } from '../compat-tests/RecordMetadata';
import { ofAPIType } from '../src/providers/Providers';
import RecordMetadataDatabase from '../src/database/RecordMetadataDatabase';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000000; // eslint-disable-line

describe('RecordMetadata', () => {
  it('should have objects with the expected properties', async () => {
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
  it('should have expected length', async () => {
    expect((await RecordMetadata()).length).toBeLessThan(ofAPIType('js').length);
    expect((await RecordMetadata()).length).toBeGreaterThan(ofAPIType('js').length / 2);
  });

  it('should write metadata records to database', async () => {
    const database = new RecordMetadataDatabase();
    await database.migrate();

    expect(await database.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB();
    const insertedMetadata = await database.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await database.count()).toEqual(metadata.length);
  });

  it('should parallelize tests across browsers and retain order of test results', async () => {
    const tests = await parallelizeBrowserTests([
      true, false, false, true, false, true, false, false
    ]);
    expect(tests).toEqual([
      true, false, false, true, false, true, false, false
    ]);
  });

  it('should have exact match', async () => {
    const database = new RecordMetadataDatabase();
    await database.migrate();

    expect(await database.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB();
    const insertedMetadata = await database.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await database.count()).toEqual(metadata.length);

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
  });
});
