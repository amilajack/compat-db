/**
 * Takes a record from a provider and creates assertions out of it. These
 * assertions are used to check if a browser supports a certain api. When the
 * assertions are evaluated, they will return true if the API is supported
 *
 * @flow
 */

/* eslint fp/no-throw: 0 */

import type { ProviderAPIResponse } from '../providers/ProviderType';


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
  determineASTNodeType: string
});

/**
 * Check if the JS API is defined
 * ex. ['window', 'ServiceWorker'] => 'window.ServiceWorker'
 */
function formatJSAssertion(record: ProviderAPIResponse): string {
  const formattedProtoChain = record.protoChain.join('.');
  return `return typeof ${formattedProtoChain} !== undefined`;
}

/**
 * Create assertion to check if a CSS property is supported
 */
function formatCSSAssertion(record: ProviderAPIResponse): string {
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

export function determineASTNodeType(record: ProviderAPIResponse): string {
  const api = record.protoChain.join('.');
  const { length } = record.protoChain;

  return `
    (function() {
      var items = []
      if (
        ${length} <= 2 &&
        typeof ${api} === 'function'
      ) {
        items.push('CallExpression')
      }

      try {
        new ${api}()
        items.push('NewExpression')
      } catch (e) {
        if (${length} > 2) {
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
export default function AssertionFormatter(record: ProviderAPIResponse): AssertionFormatterType {
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
        determineASTNodeType: determineASTNodeType(record)
      };
    default:
      throw new Error(`Invalid API type: "${record.type}"`);
  }
}
