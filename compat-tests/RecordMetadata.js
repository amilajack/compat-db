// @flow
import { expect as chaiExpect } from 'chai';
import { join } from 'path';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
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
export async function parallelizeBrowserTests(tests: Array<string | bool>, useNightmare: bool = true) {
  if (useNightmare) {
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
    .then(([first, second]) => first.concat(second));
  }

  writeFileSync(
    join(__dirname, 'tests'),
    `return (function() {
      return [${tests.join(',')}];
    })()`
  );

  try {
    execSync('npm run wdio');
  } catch (err) {} // eslint-disable-line

  return JSON.parse(readFileSync(join(__dirname, 'test-results')).toString());
}

function logUnsupportedAPIs(records: Array<RecordType>, supportedAPITests) {
  const allSet = new Set(records.map((record) => record.protoChainId));
  const supportedSet = new Set(supportedAPITests.map((record) => record.protoChainId));

  allSet.forEach(protoChainId => {
    if (!supportedSet.has(protoChainId)) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`"${protoChainId}" is not supported`);
      }
    }
  });
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
      .filter(record => !record.protoChain.includes('RegExp')); // @HACK: Dont hardcode 'RegExp'

  // @HACK: For some reason, the last 200 records do not work on the second browser. This
  //        this forces us to remove the last 500 tests
  const records = filteredRecords.slice(startIndex, endIndex || filteredRecords.length - 500);
  // const records = filteredRecords.slice(startIndex, endIndex || filteredRecords.length);

  const supportedAPITests = (await parallelizeBrowserTests(
    records.map(record => AssertionFormatter(record).apiIsSupported)
  ))
  .map((each, index) => ({
    record: records[index],
    isSupported: each
  }))
  .filter(each => each.isSupported === true);

  logUnsupportedAPIs(records, supportedAPITests);

  if (process.env.NODE_ENV !== 'test' || !process.env.CI) {
    console.log(`${records.length} records`);
    console.log(`${supportedAPITests.length} apis are supported`);
  }

  const tests = supportedAPITests.map(({ record }) => ({
    assertions: AssertionFormatter(record),
    record
  }));

  const determineASTNodeTypeTests: Array<string> =
    tests.map(test => test.assertions.determineASTNodeType);

  const determineIsStaticTests: Array<string> =
    tests.map(test => test.assertions.determineIsStatic);

  // Test length of test arrays
  chaiExpect(determineASTNodeTypeTests.length).to.equal(supportedAPITests.length);
  chaiExpect(determineIsStaticTests.length).to.equal(supportedAPITests.length);

  const astNodeTypeResults =
    await parallelizeBrowserTests(determineASTNodeTypeTests).then(finishedTests =>
      finishedTests.map(JSON.stringify)
    );

  const isStaticResults =
    await parallelizeBrowserTests(determineIsStaticTests);

  // Test length of result arrays
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
export async function writeRecordMetadataToDB(start?: number, end?: number, tableName: string = 'record-metadata') {
  const metadata = await RecordMetadata(start, end);
  const recordMetadataDatabase = new RecordMetadataDatabase(tableName);
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
