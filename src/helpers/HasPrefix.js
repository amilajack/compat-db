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
 * ex. HasPrefix('document.mozOffscreenWidth()') => true
 * ex. HasPrefix('document.offscreenWidth()') => false
 */
export default function HasPrefix(property: string): boolean {
  const lowerCaseProperty = property.toLowerCase();
  // $FlowFixMe: Waiting on github.com/facebook/flow/issues/2174
  return prefixes.some(prefix => lowerCaseProperty.includes(prefix));
}
