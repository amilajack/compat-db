// @flow

/* eslint import/prefer-default-export: off */

export const browserNameToCaniuseMappings = {
  chrome: 'chrome',
  firefox: 'firefox',
  safari: 'safari',
  MicrosoftEdge: 'edge',
  'internet explorer': 'ie'
  // @TODO @NOTE: Mobile devices require Appium
  // '': 'ios_saf',
  // '': 'and_chr',
  // '': 'and_ff',
  // '': 'android'
  // '': 'op_mini',
  // '': 'bb',
  // '': 'op_mob',
  // '': 'ie_mob',
  // '': 'and_uc',
  // '': 'samsung'
};

export const caniuseToSeleniumMappings = {
  chrome: 'chrome',
  firefox: 'firefox',
  safari: 'safari',
  ie: 'internet explorer',
  edge: 'MicrosoftEdge'
};

export const caniuseBrowsers = Object.keys(browserNameToCaniuseMappings);

export const fixedBrowserVersions = [
  // Edge: 2 versions
  { browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '14.14393' },
  { browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '13.10586' },
  // Safari: 5 versions
  { browserName: 'safari', platform: 'OS X 10.12', version: '10.0' },
  { browserName: 'safari', platform: 'OS X 10.11', version: '9.0' },
  { browserName: 'safari', platform: 'OS X 10.10', version: '8.0' },
  { browserName: 'safari', platform: 'OS X 10.9', version: '7.0' },
  { browserName: 'safari', platform: 'OS X 10.8', version: '6.0' },
  // IE: 6 versions
  { browserName: 'internet explorer', platform: 'Windows 7', version: '11.0' },
  { browserName: 'internet explorer', platform: 'Windows 7', version: '10.0' },
  { browserName: 'internet explorer', platform: 'Windows 7', version: '9.0' },
  { browserName: 'internet explorer', platform: 'Windows 7', version: '8.0' },
  { browserName: 'internet explorer', platform: 'Windows XP', version: '7.0' },
  { browserName: 'internet explorer', platform: 'Windows XP', version: '6.0' }
];
