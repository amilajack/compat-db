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
    { browserName: 'firefox', platform: 'Windows 10', version: '41.0' },
    { browserName: 'chrome', platform: 'OS X 10.10', version: '45.0' },
    { browserName: 'internet explorer', platform: 'Windows 7', version: '10' }
  ],
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: 'http://saucelabs.github.io',
  // waitforTimeout: 10000,
  // connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['sauce'],
  framework: 'mocha',
  reporters: ['dot'],
  reporterOptions: {
    outputDir: './'
  },
  mochaOpts: {
    ui: 'bdd'
  }
};
