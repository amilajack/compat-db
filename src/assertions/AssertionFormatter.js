/**
 * Take a record from a provider and create an assertion out of it. These
 * assertions are used to check if a browser supports a certain api. When the
 * assertions are evaluated, they will return true if the API is supported
 *
 * @flow
 */

/* eslint fp/no-throw: 0 */

import type { ProviderAPIResponse } from '../providers/ProviderType';


type AssertionFormatterType = ProviderAPIResponse & {
  apiIsSupported: string,

};

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
      var items = document.body.style
      return '${cssPropertyName}' in items
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
 * properties.
 */
export function getAllSupportCSSProperties(): string {
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
 * Create a list of browser API assertions to check if an API is supported
 */
export default function AssertionFormatter(record: ProviderAPIResponse): AssertionFormatterType {
  switch (record.type) {
    case 'css-api':
      return {
        ...record,
        apiIsSupported: formatCSSAssertion(record)
      };
    case 'js-api':
      return {
        ...record,
        apiIsSupported: formatJSAssertion(record)
      };
    default:
      throw new Error(`Invalid API type: "${record.type}"`);
  }
}
