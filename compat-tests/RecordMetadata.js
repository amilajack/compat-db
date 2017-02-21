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
  record: RecordType,
  type: 'js-api' | 'css-api' | 'html-api'
}>>;

/**
 * @HACK: Tests wont run unless the tests are parallelized across browsers
 *        This is a temporary solution that creates two browser sessions and
 *        runs tests on them
 */
export function parallelizeBrowserTests(tests: Array<string>) {
  const middle = Math.floor(tests.length / 2);

  return Promise.all([
    Nightmare()
      .goto('https://example.com')
      .evaluate(
        (compatTest) => eval(compatTest),
        `(function() {
          return [${tests.slice(0, middle).join(',')}];
        })()`
      )
      .end(),
    Nightmare()
      .goto('https://example.com')
      .evaluate(
        (compatTest) => eval(compatTest),
        `(function() {
          return [${tests.slice(middle).join(',')}];
        })()`
      )
      .end()
  ])
  .then(res => res.reduce((p, c) => [...c, ...p]));
  // .then(([first, second]) => first.concat(second));
}

/**
 * Find all the records that are supported by our local testing browser (nightmare)
 * For every supported API, determine it's ast node type and if it is static or
 * an instance method or property
 *
 * @TODO; Determine if an API is polyfillable
 * @TODO; Determine if type of the api (ex. number, string, function, etc)
 */
async function RecordMetadata(startIndex: number = 0, endIndex?: number): RecordMetadataType {
  const filteredRecords =
    ofAPIType('js')
      .filter(record => !record.protoChain.includes('RegExp'));

  const records = filteredRecords.slice(startIndex, endIndex || filteredRecords.length - 1);

  const supportedAPITests = (await parallelizeBrowserTests(
    records.map(record => AssertionFormatter(record).apiIsSupported)
  ))
  .map((each, index) => ({
    record: records[index],
    isSupported: each
  }))
  .filter(each => each.isSupported === true);

  console.log(`${records.length} records`);
  console.log(`${supportedAPITests.length} apis are supported`);

  const tests = supportedAPITests.map(({ record }) => ({
    assertions: AssertionFormatter(record),
    record
  }));

  const determineASTNodeTypeTests: Array<string> =
    tests.map(test => test.assertions.determineASTNodeType); // eslint-disable-line

  const determineIsStaticTests: Array<string> =
    tests.map(test => test.assertions.determineIsStatic); // eslint-disable-line

  chaiExpect(determineASTNodeTypeTests.length).to.equal(supportedAPITests.length);
  chaiExpect(determineIsStaticTests.length).to.equal(supportedAPITests.length);

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

  const astNodeTypeResults =
    await parallelizeBrowserTests(determineASTNodeTypeTests).then(finishedTests =>
      finishedTests.map(JSON.stringify)
    );

  const isStaticResults =
    await parallelizeBrowserTests(determineIsStaticTests);

  chaiExpect(determineASTNodeTypeTests.length).to.equal(astNodeTypeResults.length);
  chaiExpect(determineIsStaticTests.length).to.equal(isStaticResults.length);
  chaiExpect(isStaticResults.length).to.equal(astNodeTypeResults.length);
  chaiExpect(tests.length).to.equal(astNodeTypeResults.length);

  console.log(`${astNodeTypeResults.length} ast node types found`);
  console.log(`${isStaticResults.length} static apis`);

  return tests.map((record, index) => ({
    record: record.record,
    astNodeType: astNodeTypeResults[index],
    isStatic: isStaticResults[index],
    type: 'js-api'
  }));
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
    isStatic: each.isStatic,
    type: each.type
  }));

  await recordMetadataDatabase.insertBulk(metadataToInsert);

  return metadataToInsert;
}
