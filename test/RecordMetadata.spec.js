import { expect as chaiExpect } from 'chai';
import RecordMetadata from '../compat-tests/RecordMetadata';
import Providers from '../src/providers/Providers';


describe('RecordMetadata', () => {
  it('should have the expected fields', async () => {
    const records = Providers();
    const middle = Math.floor(records.length / 2);
    const metadata = await RecordMetadata(0, middle);
    // await RecordMetadata(middle + 1, records.length - 1);

    chaiExpect(metadata).to.be.an('array');

    for (const record of metadata) {
      chaiExpect(record).to.be.a('string');
      chaiExpect(record).to.be.oneOf(['MemberExpression', 'NewExpression', 'CallExpression']);
    }

    // expect(metadata).toContain('NewExpression');
    // expect(metadata).toContain('CallExpression');
  });
});
