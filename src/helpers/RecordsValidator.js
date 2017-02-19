import { expect } from 'chai';
import Providers from '../providers/Providers';
import * as TmpDatabase from '../database/TmpDatabase';


/* eslint no-unused-expressions: 0, fp/no-let: 0 */

function validateRecords(records) {
  records.forEach((record) => {
    try {
      expect(record.name).to.be.a('string');
      expect(record.id).to.be.a('string');
      expect(record.specNames).to.be.an('array');
      expect(record.specIsFinished).to.be.a('boolean');
      expect(record.protoChain).to.be.an('array');
      expect(record.protoChainId).to.be.a('string');
      expect(record.type).to.exist;
      return true;
    } catch (error) {
      throw new Error(`Incompatible record: ${record}`);
    }
  });
}

function hasDuplicates(records) {
  records.forEach((record) => {
    records.forEach((comparedRecord) => {
      let count = 0;
      if (
        record.caniuseId === comparedRecord.caniuseId &&
        record.protoChainId === comparedRecord.protoChainId
      ) {
        count += 1;
      }
      if (count > 1) {
        throw new Error(`Duplicate record: ${record}`);
      }
      return true;
    });
  });
}

function isBrowserMissing(records) {

}

export default async function RecordsValidator() {
  const records = await TmpDatabase.getAll();
  validateRecords(records);
  hasDuplicates(records);
}
