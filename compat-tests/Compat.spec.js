// @flow
import { join } from 'path';
import Providers from '../src/providers/Providers';
import AssertionFormatter from '../src/assertions/AssertionFormatter';
import { updateDatabaseRecord, findDatabaseRecord } from '../src/database/PrepareDatabase';


/* eslint no-undef: 0, fp/no-mutation: 0, no-let: 0 */

/**
 * @NOTE: If you only want to test a few of these, remember to .slice(0, x) to
 *        test only the first x records. There's hundreds of records so this may
 *        take a while
 */
const records = Providers().slice(
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

const allowCrossProcessReads = false;
const databasePath = join(__dirname, '..', 'lib', 'all.json');
// $FlowFixMe: Flow requires type definition
const { browserName, platform, version } = browser.desiredCapabilities; // eslint-disable-line
const caniuseId = mappings[browserName];

describe('Compat Tests', () => {
  browser.url('http://example.com/');

  // Dynamically generate compat-tests for each record and each browser
  records.forEach(record => {
    // If newer version does not support API, current browser version doesn't support it
    // If older version does support API, current browser version does support it
    if (allowCrossProcessReads) {
      const databaseRecordTargets = findDatabaseRecord(databasePath, record).targets;
      const existingRecordTargetVersions = Object.keys(databaseRecordTargets);

      const earlierNotSupports = existingRecordTargetVersions.every(targetVersion => (
        targetVersion > version &&
        databaseRecordTargets[targetVersion] === 'n'
      ));

      const olderSupports = existingRecordTargetVersions.every(targetVersion => (
        targetVersion < version &&
        databaseRecordTargets[targetVersion] === 'y'
      ));

      if (earlierNotSupports || olderSupports) {
        console.log(`
          "${record.name}" API ${earlierNotSupports ? 'is NOT ❌ ' : 'is ✅ '} supported in ${browserName} ${version} on ${platform}
        `);

        return updateDatabaseRecord(
          databasePath,
          record,
          caniuseId,
          version,
          earlierNotSupports ? false : (olderSupports ? true : false) // eslint-disable-line
        );
      }
    }

    it(`${record.name} Compat Tests`, () => {
      const assertions = AssertionFormatter(record);
      const { value } = browser.execute(`return (${assertions.apiIsSupported})`);

      console.log(`
        "${record.name}" ${value ? 'IS ✅ ' : 'is NOT ❌ '} API supported in ${browserName} ${version} on ${platform}
      `);

      updateDatabaseRecord(
        databasePath,
        record,
        caniuseId,
        version,
        value
      );
    });

    return true;
  });
});
