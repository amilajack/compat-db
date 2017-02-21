/**
 * Takes a record from a provider and creates assertions out of it. These
 * assertions are used to check if a browser supports a certain api. When the
 * assertions are evaluated, they will return true if the API is supported
 *
 * @flow
 */
import type { RecordType } from '../providers/RecordType';


/* eslint fp/no-throw: 0 */

type AssertionFormatterType = {
  apiIsSupported: string
}
& ({
  // Only used for CSS API's
  allCSSProperties: string,
  allCSSValues: string,
}
| {
  // Only used for JS API's
  determineASTNodeType: string,
  determineIsStatic: string
});

/**
 * Check if the JS API is defined
 * ex. ['ServiceWorker'] => 'ServiceWorker'
 * @TODO: Support checking if API is 'prefixed'
 * @HACK: Method's that throw errors upon property access are usually supported
 */
function formatJSAssertion(record: RecordType): string {
  const remainingProtoObject = record.protoChain.filter((e, i) => i > 0);
  const formattedStaticProtoChain = record.protoChain.join('.');
  const lowercaseParentObject = record.protoChain[0].toLowerCase();
  const exceptions = new Set(['crypto', 'Crypto']);
  const lowercaseSupportTest = `
    if (${String(lowercaseParentObject !== 'function' && !exceptions.has(record.protoChain[0]))}) {
      ${lowercaseParentObject === 'function' || lowercaseParentObject === record.protoChain[0]
        ? ''
        : `if (typeof ${lowercaseParentObject} !== 'undefined') {
          throw new Error('${record.protoChain[0]} is not supported but ${lowercaseParentObject} is supported')
        }`}
    }
  `;
  return `
    (function () {
      ${lowercaseSupportTest}
      try {
        // a
        if (typeof window === 'undefined') { return false }
        // a
        if (typeof ${record.protoChain[0]} === 'undefined') { return false }
        // a.b
        if (typeof ${formattedStaticProtoChain} !== 'undefined')  { return true }
        // a.prototype.b
        if (typeof ${record.protoChain[0]}.prototype !== 'undefined') {
          if (${remainingProtoObject.length} === 0) { return false }
          return typeof ${[record.protoChain[0], 'prototype'].concat(remainingProtoObject).join('.')} !== 'undefined'
        }
        return false
      } catch (e) {
        // TypeError thrown on property access and all prototypes are defined,
        // item usually experiences getter error
        // Ex. HTMLInputElement.prototype.indeterminate
        // -> 'The HTMLInputElement.indeterminate getter can only be used on instances of HTMLInputElement'
        return (e instanceof TypeError)
      }
    })()
  `;
}

/**
 * Takes a `protoChain` and returns bool if supported. Should only be run if
 * supported. Evaluation returns true if defined
 *
 * ex. ['Array', 'push'] => false
 * ex. ['document', 'querySelector'] => true
 */
export function determineIsStatic(record: RecordType): string {
  return `
    (function () {
      try {
        var protoChainIdType = typeof ${record.protoChain.join('.')}
        return protoChainIdType !== 'undefined'
      } catch (e) {
        return e instanceof TypeError
      }
    })()
  `;
}

/**
 * Create assertion to check if a CSS property is supported
 * @TODO: Support checking if API is 'prefixed'
 */
function formatCSSAssertion(record: RecordType): string {
  const cssPropertyName = record.protoChain[record.protoChain.length - 1];
  return `
    (function () {
      // Check CSS properties
      var properties = document.body.style
      if ('${cssPropertyName}' in properties) return true

      // Check CSS values
      var values = document.createElement('div').style;
      if ('${cssPropertyName}' in values) return true

      return false
    })()
  `;
}

export function determineASTNodeType(record: RecordType): string {
  const api = record.protoChain.join('.');
  const { length } = record.protoChain;

  return `
    (function() {
      var items = []
      if (${length} <= 1 &&typeof ${api} === 'function') {
        items.push('CallExpression')
      }
      try {
        new ${api}()
        items.push('NewExpression')
      } catch (e) {
        if (${length} > 1) {
          items.push('MemberExpression')
        }
      }
      return items
    })()
  `;
}

/**
 * Get all the supported css values. Evaluation will return an array of camel-cased
 * values.
 */
export function getAllSupportCSSValues(): string {
  return `
    (function () {
      var styles = document.createElement('div').style;
      var stylesList = []
      for (var style in styles) {
        stylesList.push(style)
      }
      return stylesList
    })()
  `;
}

/**
 * Get all the supported css properties. Evaluation will return an array of
 * camel-cased properties.
 */
export function getAllSupportCSSProperties(): string {
  return `
    (function () {
      var properties = document.body.style
      var stylesList = []
      for (var property in properties) {
        stylesList.push(property)
      }
      return stylesList
    })()
  `;
}

/**
 * Create a list of browser API assertions to check if an API is supported
 */
export default function AssertionFormatter(record: RecordType): AssertionFormatterType {
  switch (record.type) {
    case 'css-api':
      return {
        apiIsSupported: formatCSSAssertion(record),
        allCSSValues: getAllSupportCSSValues(record),
        allCSSProperties: getAllSupportCSSProperties(record)
      };
    case 'js-api':
      return {
        apiIsSupported: formatJSAssertion(record),
        determineASTNodeType: determineASTNodeType(record),
        determineIsStatic: determineIsStatic(record)
      };
    default:
      throw new Error(`Invalid API type: "${record.type}"`);
  }
}
