/* eslint no-eval: 0 */
import Nightmare from 'nightmare';
import CSSProperties from './CSSProperties.json';
import AssertionFormatter, {
  determineASTNodeType,
  getAllSupportCSSProperties
} from '../src/assertions/AssertionFormatter';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // eslint-disable-line

async function testDetermineASTNodeType(protoChain: Array<string>) {
  const determineNodeTest = determineASTNodeType({ protoChain });
  const nightmare = Nightmare();
  return nightmare
    .goto('https://example.com')
    .evaluate((compatTest) => eval(compatTest), determineNodeTest)
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

describe('getAllSupportCSSProperties()', () => {
  it('should get all supported css properties', async () => {
    const nightmare = Nightmare();
    const supportedCSSProperties = new Set(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), getAllSupportCSSProperties())
        .end()
    );
    for (const property of new Set(CSSProperties)) {
      expect(supportedCSSProperties).toContain(property);
    }
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

    const { apiIsSupported } = AssertionFormatter(cssAPIRecord);
    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), apiIsSupported)
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

    const { apiIsSupported } = AssertionFormatter(cssAPIRecord);
    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), apiIsSupported)
        .end()
    )
    .toEqual(false);
  });
});
