/**
 * Determine if a css or javascript attribute is vendor-prefixed
 * @flow
 */

export const vendorPrefixMappings = {
  chrome: 'webkit',
  safari: 'webkit',
  firefox: 'moz',
  edge: 'ms',
  ie: 'ms'
};

export const prefixes = Object.values(vendorPrefixMappings);

/**
 * Determine if a css or js value is prefixed
 * ex. hasPrefix('document.mozOffscreenWidth()') => true
 * ex. hasPrefix('document.offscreenWidth()') => false
 */
export default function PrefixHandler(property: string): bool {
  // $FlowFixMe: Waiting on github.com/facebook/flow/issues/2174
  return prefixes.some(prefix => property.includes(prefix)); // eslint-disable-line
}
