/**
 * Take a record from a provider and create an assertion out of it. These
 * assertions are used to check if a browser supports a certain api
 *
 * @flow
 */

/* eslint fp/no-throw: 0 */

import type { ProviderAPIResponse } from '../providers/ProviderType';


type AssertionFormatterType = ProviderAPIResponse & { assertion: string };

/**
 * ex. ['window', 'ServiceWorker'] => 'window.ServiceWorker'
 */
function formatJSAssertion(record: ProviderAPIResponse): string {
  const formattedProtoChain = record.protoChain.join('.');
  return `return typeof ${formattedProtoChain} !== undefined`;
}

function formatCSSAssertion(record: ProviderAPIResponse): string {
  const cssPropertyName = record.protoChain[record.protoChain.length - 1];
  return `return typeof Array.prototype.slice.call(document.defaultView.getComputedStyle(document.body, ''),0).indexOf('${cssPropertyName}') > -1`;
}

// function formatCSSPropertyAssertion(record: ProviderAPIResponse): string {
//   return `CSS.supports ? CSS.supports('${record.}') : false`
// }

export default function AssertionFormatter(record: ProviderAPIResponse): AssertionFormatterType {
  switch (record.type) {
    case 'css-api':
      return {
        ...record,
        assertion: formatCSSAssertion(record)
      };
    case 'js-api':
      return {
        ...record,
        assertion: formatJSAssertion(record)
      };
    default:
      throw new Error(`Invalid API type: "${record.type}"`);
  }
}
