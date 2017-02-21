import { expect as chaiExpect } from 'chai';
import RecordMetadata, { writeRecordMetadataToDB } from '../compat-tests/RecordMetadata';
import { ofAPIType } from '../src/providers/Providers';
import RecordMetadataDatabase from '../src/database/RecordMetadataDatabase';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000000; // eslint-disable-line

describe('RecordMetadata', () => {
  it.skip('should have objects with the expected properties', async () => {
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

  it.only('should write metadata records to database', async () => {
    const database = new RecordMetadataDatabase();
    await database.migrate();

    expect(await database.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB();
    const insertedMetadata = await database.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await database.count()).toEqual(metadata.length);
  });

  it.skip('should have exact match', async () => {
    const database = new RecordMetadataDatabase();
    await database.migrate();

    expect(await database.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB();
    const insertedMetadata = await database.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await database.count()).toEqual(metadata.length);

    const metadataSet = new Set(metadata.map(JSON.stringify));
    const insertedMetadataSet = new Set(insertedMetadata.map(JSON.stringify));

    for (const item of metadataSet) {
      expect(insertedMetadataSet.has(item)).toEqual(true);
    }
  });
});
