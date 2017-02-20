// @flow
import { expect as chaiExpect } from 'chai';
import Nightmare from 'nightmare';
import { ofAPIType } from '../src/providers/Providers';
import AssertionFormatter from '../src/assertions/AssertionFormatter';
import RecordMetadataDatabase from '../src/database/RecordMetadataDatabase';
import type { RecordType } from '../src/providers/RecordType';


/* eslint no-eval: 0, max-len: ['error', 120] */

type RecordMetadataType = Promise<Array<{
  astNodeType: 'MemberExpression' | 'CallExpression' | 'NewExpression',
  isStatic: bool,
  record: RecordType
}>>;

async function RecordMetadata(startIndex: number = 0, endIndex?: number): RecordMetadataType {
  const filteredRecords =
    ofAPIType('js')
      .filter(record => !record.protoChain.includes('RegExp'));

  const records = filteredRecords.slice(startIndex, endIndex || filteredRecords.length - 1);

  const isSupportedTests = await Nightmare()
    .goto('https://example.com')
    .evaluate(
      (compatTest) => eval(compatTest),
      `(function() {
        return [${records.map(record => AssertionFormatter(record).apiIsSupported).join(',')}];
      })()`
    )
    .end();

  const tests = isSupportedTests
    .map((each, index) => ({
      record: records[index],
      isSupported: each
    }))
    .filter(each => each.isSupported === true)
    .map(({ record }) => ({
      assertions: AssertionFormatter(record),
      record
    }));

  const determineASTNodeTypeTests: Array<string> =
    tests.map(test => test.assertions.determineASTNodeType); // eslint-disable-line

  const determineIsStaticTests: Array<string> =
    tests.map(test => test.assertions.determineIsStatic); // eslint-disable-line

  determineASTNodeTypeTests.forEach((test) => {
    chaiExpect(test).to.be.a('string');
    try {
      eval(test);
    } catch (error) {
      console.log(error, test);
    }
  });
  determineIsStaticTests.forEach((test) => {
    chaiExpect(test).to.be.a('string');
    try {
      eval(test);
    } catch (error) {
      console.log(error, test);
    }
  });

  const astNodeTypeResults = await Nightmare()
    .goto('https://example.com')
    .evaluate(
      (compatTest) => eval(compatTest),
      `(function() {
        return [${determineASTNodeTypeTests.join(',')}];
      })()`
    )
    .end()
    .then(finishedTests => finishedTests.map(each => each[0]));

  const isStaticResults = await Nightmare()
    .goto('https://example.com')
    .evaluate(
      (compatTest) => eval(compatTest),
      `(function() {
        return [${determineIsStaticTests.join(',')}];
      })()`
    )
    .end();

  chaiExpect(isStaticResults.length).to.equal(astNodeTypeResults.length);

  return records.map((record, index) => ({
    record,
    astNodeType: astNodeTypeResults[index],
    isStatic: isStaticResults[index]
  }))
  .filter(each =>
    !!each.astNodeType &&
    !!each.isStatic &&
    !!each.record
  );
}

export default RecordMetadata;

/**
 * Migrate the 'record-metadata' table and write the records to it
 */
export async function writeRecordMetadataToDB() {
  const metadata = await RecordMetadata();

  const recordMetadataDatabase = new RecordMetadataDatabase();
  await recordMetadataDatabase.migrate();

  const metadataToInsert = metadata.map(each => ({
    protoChainId: each.record.protoChainId,
    astNodeType: each.astNodeType,
    isStatic: each.isStatic
  }));

  await recordMetadataDatabase.insertBulk(metadataToInsert);

  return metadataToInsert;
}
