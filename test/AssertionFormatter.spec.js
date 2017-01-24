import AssertionFormatter from '../src/assertions/AssertionFormatter';
import Providers from '../src/providers/Providers';


describe('AssertionFormatter', () => {
  it('should return typeof assertion for every record', () => {
    const records = Providers();
    for (const record of records) {
      expect(AssertionFormatter(record).assertion).toContain('return typeof');
    }
  });

  it('should create assertions for CSS API records', () => {
    const cssAPIRecord = {
      id: 'border-width',
      name: 'border-width',
      specNames: ['css21', 'css-background-3'],
      type: 'css-api',
      specIsFinished: false,
      protoChain: ['window', 'CSSStyleDeclaration', 'borderWidth']
    };

    expect(AssertionFormatter(cssAPIRecord)).toEqual({
      ...cssAPIRecord,
      assertion: "return typeof Array.prototype.slice.call(document.defaultView.getComputedStyle(document.body, ''),0).indexOf('borderWidth') > -1"
    });
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
