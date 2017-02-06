require('babel-register');
const { browserNameToCaniuseMappings } = require('./src/helpers/Constants');
const { allTargets, getVersionsToMark } = require('./src/helpers/GenerateVersions');
require('dotenv').config();


/* eslint fp/no-mutation: 0 */

const caniuseIds = Object.values(browserNameToCaniuseMappings);
const items = [];

caniuseIds.forEach(curr => {
  const { middle } = getVersionsToMark([], curr);
  allTargets
    .filter(item =>
      browserNameToCaniuseMappings[item.browserName] === curr &&
      item.version === middle
    )
    .forEach(e => items.push(e));
});

exports.config = {
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  specs: ['./compat-tests/Compat.spec.js'],
  maxInstances: 40,

  // @TODO: Test against all supported browsers caniuse supports. Create a
  //        helper function for this
  //
  // @NOTE: Use the Platform Configurator to help with finding platforms:
  //        https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  //        https://saucelabs.com/platforms
  //
  // @NOTE: 93 total targets being tested. ~14K records. ~1,358,000 tests/records total

  capabilities: items.map(e => Object.assign({}, e, { 'idle-timeout': 30000 })),
  sync: false,
  logLevel: 'error',
  execArgv: ['--max_old_space_size=4096'],
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
