// @flow
import Nightmare from 'nightmare';
import { ofAPIType } from '../src/providers/Providers';
import AssertionFormatter from '../src/assertions/AssertionFormatter';


/* eslint no-eval: 0 */

export default async function RecordMetadata(startIndex: number, endIndex: number) {
  const tests = ofAPIType('js')
    .slice(startIndex, endIndex)
    .map(record => ({
      assertions: AssertionFormatter(record),
      record
    }));

  const determineASTNodeTypeTests: Array<string> =
    tests.map(test => test.assertions.determineASTNodeType); // eslint-disable-line

  const literal = `
    (function() {
      return [${determineASTNodeTypeTests.join(',')}];
    })()
  `;

  const nightmare = Nightmare();

  return nightmare
    .goto('https://example.com')
    .evaluate((compatTest) => eval(compatTest), literal)
    .end()
    .then(res => res.map(e => e[0]));
}
