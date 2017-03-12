import Nightmare from 'nightmare';
import CSSProperties from './CSSProperties.json';
import AssertionFormatter, {
  determineASTNodeType,
  getAllSupportCSSProperties } from '../src/assertions/AssertionFormatter';


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
  it('should determine CallExpression', async () => {
    expect(await testDetermineASTNodeType(['fetch'])).toEqual(['CallExpression']);
  });

  it('should determine NewExpression', async () => {
    expect(await testDetermineASTNodeType(['Array'])).toEqual(['CallExpression', 'NewExpression']);
    expect(await testDetermineASTNodeType(['IntersectionObserver'])).toEqual(['NewExpression']);
    expect(await testDetermineASTNodeType(['DocumentFragment'])).toEqual(['NewExpression']);
  });

  it('should determine MemberExpression', async () => {
    expect(await testDetermineASTNodeType(['Array', 'push'])).toEqual(['MemberExpression']);
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
  it('should create assertions for CSS property API records', async () => {
    const cssAPIRecord = {
      id: 'border-width',
      name: 'border-width',
      specNames: ['css21', 'css-background-3'],
      type: 'css-api',
      specIsFinished: false,
      protoChain: ['CSSStyleDeclaration', 'borderWidth']
    };

    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), AssertionFormatter(cssAPIRecord).apiIsSupported)
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

    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), AssertionFormatter(cssAPIRecord).apiIsSupported)
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

    const nightmare = Nightmare();

    expect(
      await nightmare
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), AssertionFormatter(cssAPIRecord).apiIsSupported)
        .end()
    )
    .toEqual(false);
  });

  describe('AssertionFormatter', () => {
    type assertionType = {
      protoChain: Array<string>,
      isSupported: bool,
      isStatic: bool,
      type: string
    };

    const isStaticTests: Array<assertionType> = [
      { protoChain: ['document', 'querySelector'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['document', 'currentScript'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['alert'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['navigator', 'serviceWorker'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['Array', 'push'], isStatic: false, isSupported: true, type: 'js-api' },
      { protoChain: ['Array', 'from'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['Array', 'of'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['RemotePlayback', 'state'], isStatic: false, isSupported: true, type: 'js-api' },
      { protoChain: ['Array', 'reduce'], isStatic: false, isSupported: true, type: 'js-api' },
      { protoChain: ['Array', 'map'], isStatic: false, isSupported: true, type: 'js-api' },
      { protoChain: ['IDBMutableFile', 'getFile'], isStatic: false, isSupported: false, type: 'js-api' },
      { protoChain: ['SVGPointList'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['MessageEvent', 'data'], isStatic: false, isSupported: true, type: 'js-api' },
      { protoChain: ['Uint8ClampedArray', 'values'], isStatic: false, isSupported: true, type: 'js-api' },
      { protoChain: ['WebGL2RenderingContext', 'VERTEX_ATTRIB_ARRAY_ENABLED'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['alert'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['CSSStyleDeclaration', 'borderWidth'], isStatic: true, isSupported: true, type: 'css-api' },
      { protoChain: ['document', 'querySelector'], isStatic: true, isSupported: true, type: 'js-api' },
      { protoChain: ['Array', 'push'], isStatic: false, isSupported: true, type: 'js-api' }
    ]
    .map(record => ({
      ...record,
      assertion: Nightmare()
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), AssertionFormatter(record).determineIsStatic)
        .end()
    }));

    const isSupportedTests = isStaticTests.map(record => ({
      ...record,
      assertion: Nightmare()
        .goto('https://example.com')
        .evaluate((compatTest) => eval(compatTest), AssertionFormatter(record).apiIsSupported)
        .end()
    }));

    for (const assertion of isStaticTests.filter(test => test.type === 'js-api')) {
      it(`should determine ${assertion.protoChain.join('.')} is static or non-static`, async () => {
        expect(await assertion.assertion).toEqual(assertion.isStatic);
      });
    }

    for (const assertion of isSupportedTests) {
      it(`should determine ${assertion.protoChain.join('.')} is support or not`, async () => {
        expect(await assertion.assertion).toEqual(assertion.isSupported);
      });
    }
  });
});
