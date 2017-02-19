import { expect as chaiExpect } from 'chai';
import RecordMetadata from '../compat-tests/RecordMetadata';
import { ofAPIType } from '../src/providers/Providers';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000; // eslint-disable-line

describe('RecordMetadata', () => {
  it('should have the expected fields', async () => {
    const recordMetadata = await RecordMetadata();

    recordMetadata.forEach(({ record, isStatic, astNodeType }) => {
      chaiExpect(record).to.be.an('object');
      chaiExpect(astNodeType).to.be.an('string');
      chaiExpect(isStatic).to.be.an('boolean');
      chaiExpect(astNodeType).to.be.oneOf(['MemberExpression', 'NewExpression', 'CallExpression']);
    });
  });

  it.skip('should have expected length', async () => {
    expect((await RecordMetadata()).length).to.equal(ofAPIType('js').length);
  });
});
