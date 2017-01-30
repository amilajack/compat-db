/**
 * Determine if a css or javascript attribute is vendor-prefixed
 * @flow
 */

const vendorPrefixMappings = {
  chrome: 'webkit',
  safari: 'webkit',
  firefox: 'moz',
  edge: 'ms',
  ie: 'ms'
};

/**
 * Determine if a css or js value is prefixed
 * ex. hasPrefix('document.mozOffscreenWidth()') => true
 * ex. hasPrefix('document.offscreenWidth()') => false
 */
export default function PrefixHandler(property: string): bool {
  const prefixes = Object.values(vendorPrefixMappings);
  // $FlowFixMe: Waiting on github.com/facebook/flow/issues/2174
  return prefixes.some(prefix => property.includes(prefix)); // eslint-disable-line
}
