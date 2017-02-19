import Nightmare from 'nightmare';
import CSSProperties from './CSSProperties.json';
import AssertionFormatter, {
  determineASTNodeType,
  getAllSupportCSSProperties,
  determineIsStatic } from '../src/assertions/AssertionFormatter';


/* eslint no-await-in-loop: 0 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;

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
    expect(await testDetermineASTNodeType(['fetch']))
      .toEqual(['CallExpression']);
  });

  it('should determine NewExpression', async () => {
    expect(await testDetermineASTNodeType(['Array']))
      .toEqual(['CallExpression', 'NewExpression']);
  });

  it('should determine MemberExpression', async () => {
    expect(await testDetermineASTNodeType(['Array', 'push']))
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

/**
 * @TODO: Refactor, add additional tests
 */
describe('AssertionFormatter', () => {
  it('should test against multiple records', async () => {
    const records = [
      {
        id: 'border-width',
        name: 'border-width',
        specNames: ['css21', 'css-background-3'],
        type: 'css-api',
        specIsFinished: false,
        protoChain: ['CSSStyleDeclaration', 'borderWidth']
      },
      {
        id: 'document-querySelector',
        name: 'document-querySelector',
        specNames: ['css21', 'css-background-3'],
        type: 'js-api',
        specIsFinished: false,
        protoChain: ['Element', 'querySelector']
      },
      {
        id: 'array-push',
        name: 'array-push',
        specNames: ['array', 'push'],
        type: 'js-api',
        specIsFinished: false,
        protoChain: ['Array', 'push']
      }
    ];

    for (const record of records) {
      const { apiIsSupported } = AssertionFormatter(record);
      const nightmare = Nightmare();

      expect(
        await nightmare
          .goto('https://example.com')
          .evaluate((compatTest) => eval(compatTest), apiIsSupported)
          .end()
      )
      .toEqual(true);
    }
  });

  it('should create assertions for CSS property API records', async () => {
    const cssAPIRecord = {
      id: 'border-width',
      name: 'border-width',
      specNames: ['css21', 'css-background-3'],
      type: 'css-api',
      specIsFinished: false,
      protoChain: ['CSSStyleDeclaration', 'borderWidth']
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

  it('should create assertions for CSS value API records', async () => {
    const cssAPIRecord = {
      id: 'flex',
      name: 'flex',
      specNames: ['css21', 'css-background-3'],
      type: 'css-api',
      specIsFinished: false,
      protoChain: ['CSSStyleDeclaration', 'flex']
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
      protoChain: ['CSSStyleDeclaration', 'superWidth']
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

  describe('AssertionFormatter', () => {
    const assertions = [
      {
        protoChain: ['document', 'querySelector'],
        isStatic: true
      },
      {
        protoChain: ['Array', 'push'],
        isStatic: false
      },
      {
        protoChain: ['alert'],
        isStatic: true
      }
    ].map(assertion => ({
      ...assertion,
      assertions: Nightmare()
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), determineIsStatic(assertion))
        .end()
    }));

    for (const assertion of assertions) {
      it(`should determine ${assertion.protoChain.join('.')} is static or non-static`, async () => {
        expect(await assertion.assertions).toEqual(assertion.isStatic);
      });
    }
  });
});
