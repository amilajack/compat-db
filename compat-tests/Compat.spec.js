// @flow
// $FlowFixMe: Flow requires type definition
import Shuffle from 'lodash/shuffle'; // eslint-disable-line
import Providers from '../src/providers/Providers';
import AssertionFormatter from '../src/assertions/AssertionFormatter';
import {
  insertTmpDatabaseRecord,
  findSameVersionCompatRecord } from '../src/database/TmpDatabase';


const Sequelize = require('sequelize');
const { join } = require('path');


const database = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 18,
    min: 0,
    idle: 10000
  },
  logging: false,
  storage: join(__dirname, '..', 'tmp-db-records', 'database.sqlite')
});

const Records = database.define('Records', {
  protoChainId: { type: Sequelize.STRING, allowNull: false, unique: false },
  caniuseId: { type: Sequelize.STRING, allowNull: false, unique: false },
  name: { type: Sequelize.STRING, allowNull: false, unique: false },
  type: { type: Sequelize.STRING, allowNull: false, unique: false },
  version: { type: Sequelize.STRING, allowNull: false, unique: false },
  isSupported: { type: Sequelize.STRING, allowNull: false, unique: false }
}, {
  timestamps: true
});

Records.sync();

/* eslint no-undef: 0, fp/no-mutation: 0, no-let: 0, fp/no-throw: 0, consistent-return: 0 */

/**
 * @NOTE: If you only want to test a few of these, remember to .slice(0, x) to
 *        test only the first x records. There's hundreds of records so this may
 *        take a while
 */
const records = Shuffle(Providers()).slice(
  parseInt(process.env.PROVIDERS_INDEX_START, 10) || 0,
  parseInt(process.env.PROVIDERS_INDEX_END, 10) || Providers().length - 1,
);

// A mapping of saucelabs names to their correspodning caniuse target ID's
// See saucelabs.com/platforms for all supported saucelabs platforms
const mappings = {
  chrome: 'chrome',
  firefox: 'firefox',
  opera: 'opera',
  safari: 'safari',
  'internet explorer': 'ie',
  MicrosoftEdge: 'edge'
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

// $FlowFixMe: Flow requires type definition
const { browserName, platform, version } = browser.desiredCapabilities; // eslint-disable-line
const caniuseId = mappings[browserName];


describe('Compat Tests', () => {
  browser.url('http://example.com/');

  // Dynamically generate compat-tests for each record and each browser
  records.forEach(record => {
    it(`${record.protoChainId} Compat Tests`, async () => {
      // If newer version does not support API, current browser version doesn't support it
      // If older version does support API, current browser version does support it
      const existingRecordTargetVersions =
        await findSameVersionCompatRecord(Records, caniuseId, version, record);

      // If the record already exists, skip tests
      const recordAlreadyExists = existingRecordTargetVersions.find(target => (
        target.version === String(version)
      ));
      if (recordAlreadyExists) {
        console.log('**Record already exists**');
        return true;
      }

      const earlierNotSupports = existingRecordTargetVersions.find(target => (
        target.version > version &&
        target.caniuseId === caniuseId &&
        target.protoChainId === record.protoChainId &&
        target.isSupported === 'n'
      ));

      if (earlierNotSupports) {
        console.log('version', earlierNotSupports.version);
        console.log('isSupported', earlierNotSupports.isSupported);
        console.log('chain', record.protoChainId);
      }

      const olderSupports = existingRecordTargetVersions.find(target => (
        target.version < version &&
        target.caniuseId === caniuseId &&
        target.protoChainId === record.protoChainId &&
        target.isSupported === 'y'
      ));

      if (olderSupports) {
        console.log('version', olderSupports.version);
        console.log('isSupported', olderSupports.isSupported);
        console.log('chain', record.protoChainId);
      }

      if (earlierNotSupports || olderSupports) {
        console.log('************ USING SHORTCUT ******************');
        console.log(earlierNotSupports ? 'earlierNotSupports' : 'olderSupports');
        console.log(`
          "${record.protoChainId}" API ${earlierNotSupports ? 'is NOT ❌ ' : 'is ✅ '} supported in ${browserName} ${version} on ${platform}
        `);

        return insertTmpDatabaseRecord(
          Records,
          record,
          caniuseId,
          version,
          earlierNotSupports
            ? false
            : (olderSupports ? true : false) // eslint-disable-line
        );
      }

      const assertions = AssertionFormatter(record);
      const { value } = await browser.execute(`return (${assertions.apiIsSupported})`);

      console.log(`
        "${record.protoChainId}" ${value ? 'IS ✅ ' : 'is NOT ❌ '} API supported in ${browserName} ${version} on ${platform}
      `);

      if (typeof value !== 'boolean') {
        throw new Error(`Invalid JS execution value returned from Sauce Labs. Received ${value} and expected boolean`);
      }

      insertTmpDatabaseRecord(
        Records,
        record,
        caniuseId,
        version,
        value
      );
    });

    return true;
  });
});
