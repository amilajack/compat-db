/* eslint no-eval: 0 */
import Nightmare from 'nightmare';
import AssertionFormatter, { determineASTNodeType } from '../src/assertions/AssertionFormatter';


async function testDetermineASTNodeType(protoChain: Array<string>) {
  const compatTest = determineASTNodeType({ protoChain });
  const nightmare = Nightmare();
  return nightmare
    .goto('https://example.com')
    .evaluate((compatTest) => eval(compatTest), compatTest) // eslint-disable-line
    .end();
}

describe('determineASTNodeType()', () => {
  it('should determine MemberExpressions', async () => {
    expect(await testDetermineASTNodeType(['window', 'fetch']))
      .toEqual(['CallExpression']);
  });

  it('should determine NewExpression', async () => {
    expect(await testDetermineASTNodeType(['window', 'Array']))
      .toEqual(['CallExpression', 'NewExpression']);
  });

  it('should determine MemberExpression', async () => {
    expect(await testDetermineASTNodeType(['window', 'Array', 'push']))
      .toEqual(['MemberExpression']);
  });
});

describe('AssertionFormatter', () => {
  it('should create assertions for CSS API records', async () => {
    const cssAPIRecord = {
      id: 'border-width',
      name: 'border-width',
      specNames: ['css21', 'css-background-3'],
      type: 'css-api',
      specIsFinished: false,
      protoChain: ['window', 'CSSStyleDeclaration', 'borderWidth']
    };

    const { assertion } = AssertionFormatter(cssAPIRecord);
    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), assertion)
        .end()
    )
    .toEqual(true);
  });

  it('should create assertions for CSS API records', async () => {
    const cssAPIRecord = {
      id: 'super-width',
      name: 'super-width',
      specNames: ['css21', 'css-background-3'],
      type: 'css-api',
      specIsFinished: false,
      protoChain: ['window', 'CSSStyleDeclaration', 'superWidth']
    };

    const { assertion } = AssertionFormatter(cssAPIRecord);
    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), assertion)
        .end()
    )
    .toEqual(false);
  });

  it('should create assertions for JS API records', () => {
    const jsAPIRecord = {
      id: 'ownerElement',
      name: 'ownerElement',
      specNames: ['dom-level-3-xpath'],
      type: 'js-api',
      specIsFinished: false,
      protoChain: ['window', 'XPathNamespace', 'ownerElement']
    };

    expect(AssertionFormatter(jsAPIRecord)).toEqual({
      ...jsAPIRecord,
      assertion: 'return typeof window.XPathNamespace.ownerElement !== undefined'
    });
  });
});
