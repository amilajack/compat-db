import { expect as chaiExpect } from 'chai';
import RecordMetadata, { writeRecordMetadataToDB } from '../compat-tests/RecordMetadata';
import { ofAPIType } from '../src/providers/Providers';
import RecordMetadataDatabase from '../src/database/RecordMetadataDatabase';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000; // eslint-disable-line

describe('RecordMetadata', () => {
  it('should have the expected fields', async () => {
    const recordMetadata = await RecordMetadata();

    recordMetadata.forEach(({ record, isStatic, astNodeType }) => {
      chaiExpect(record).to.be.an('object');
      chaiExpect(isStatic).to.be.a('boolean');
      chaiExpect(astNodeType).to.be.a('string');
      chaiExpect(astNodeType).to.be.oneOf(['MemberExpression', 'NewExpression', 'CallExpression']);
    });
  });

  it.skip('should have expected length', async () => {
    expect((await RecordMetadata()).length).to.equal(ofAPIType('js').length);
  });

  it('should write metadata records to database', async () => {
    const database = new RecordMetadataDatabase();
    await database.migrate();

    expect(await database.count()).toEqual(0);

    const metadata = await writeRecordMetadataToDB();
    const insertedMetadata = await database.getAll();

    expect(insertedMetadata.length).toEqual(metadata.length);
    expect(await database.count()).toEqual(metadata.length);

    expect(metadata).toEqual(insertedMetadata.map(each => ({
      protoChainId: each.protoChainId,
      astNodeType: each.astNodeType,
      isStatic: each.isStatic
    })));
  });
});
