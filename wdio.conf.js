/* eslint fp/no-mutation: 0 */

require('dotenv').config();

exports.config = {
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  specs: [
    './compat-tests/*.js'
  ],
  maxInstances: 40,
  capabilities: [
    // @TODO: Test against all supported browsers caniuse supports. Create a
    //        helper function for this
    // @NOTE: Use the Platform Configurator to help with finding platforms:
    //        https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    { browserName: 'firefox', platform: 'Windows 10', version: '41.0' },
    { browserName: 'chrome', platform: 'Windows 10', version: '45.0' },
    { browserName: 'opera', platform: 'Windows 7', version: '12.12' },
    { browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '14.14393' },
    { browserName: 'safari', platform: 'OS X 10.12', version: '10.0' },
    { browserName: 'internet explorer', platform: 'Windows 7', version: '10.0' }
  ],
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  screenshotPath: './errorShots/',
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
    compilers: ['js:babel-register']
  }
};
