require('dotenv').config();


/* eslint fp/no-mutation: 0, no-mixed-operators: 0, global-require: 0 */

/**
 * Range: 4 - 50
 */
function getFirefoxCapabilities() {
  const max = 50;
  const min = 4;
  const firefoxRange = max - min + 1;
  return Array(firefoxRange).fill({}).map((each, i) => ({
    browserName: 'firefox',
    platform: 'Windows 10',
    version: `${i + min}.0`,
    specs: [
      i + min === 50
        ? './compat-tests/*.spec.js'
        : './compat-tests/Compat.spec.js'
    ]
  }));
}

/**
 * Range: 26 - 55
 */
function getChromeCapabilities() {
  const max = 55;
  const min = 26;
  const chromeRange = max - min + 1;
  return Array(chromeRange).fill({}).map((each, i) => ({
    browserName: 'chrome',
    platform: 'Windows 10',
    version: `${i + min}.0`,
    specs: [
      i + min === 55
        ? './compat-tests/*.spec.js'
        : './compat-tests/Compat.spec.js'
    ]
  }));
}

exports.config = {
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  specs: [
    './compat-tests/Compat.spec.js'
  ],
  maxInstances: 40,
  capabilities: [
    // @TODO: Test against all supported browsers caniuse supports. Create a
    //        helper function for this
    // @NOTE: Use the Platform Configurator to help with finding platforms:
    //        https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    //        https://saucelabs.com/platforms
    // Firefox
    ...getFirefoxCapabilities(),
    // Chrome
    ...getChromeCapabilities(),
    // Opera
    { browserName: 'opera', platform: 'Windows 7', version: '12.12' },
    { browserName: 'opera', platform: 'Windows 7', version: '11.64' },
    // Edge
    { browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '14.14393' },
    { browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '13.10586' },
    // Safari
    { browserName: 'safari', platform: 'OS X 10.12', version: '10.0' },
    { browserName: 'safari', platform: 'OS X 10.11', version: '9.0' },
    { browserName: 'safari', platform: 'OS X 10.10', version: '8.0' },
    { browserName: 'safari', platform: 'OS X 10.9', version: '7.0' },
    { browserName: 'safari', platform: 'OS X 10.8', version: '6.0' },
    // IE
    { browserName: 'internet explorer', platform: 'Windows 7', version: '11.0' },
    { browserName: 'internet explorer', platform: 'Windows 7', version: '10.0' },
    { browserName: 'internet explorer', platform: 'Windows 7', version: '9.0' },
    { browserName: 'internet explorer', platform: 'Windows 7', version: '8.0' },
    { browserName: 'internet explorer', platform: 'Windows XP', version: '7.0' },
    { browserName: 'internet explorer', platform: 'Windows XP', version: '6.0' }
  ].map(e => Object.assign({}, e, { 'idle-timeout': 30000 })),
  sync: false,
  logLevel: 'error',
  coloredLogs: true,
  screenshotOnReject: false,
  baseUrl: 'http://saucelabs.github.io',
  waitforTimeout: 100000,
  connectionRetryCount: 3,
  services: ['sauce'],
  framework: 'mocha',
  reporters: ['dot'],
  reporterOptions: {
    outputDir: './'
  },
  mochaOpts: {
    ui: 'bdd',
    compilers: ['js:babel-register'],
    timeout: 30000
  }
};
