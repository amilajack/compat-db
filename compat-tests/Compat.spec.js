// @flow
import Providers from '../src/providers/Providers';
import AssertionFormatter from '../src/assertions/AssertionFormatter';
import {
  insertBulkRecords,
  findSameVersionCompatRecord } from '../src/database/TmpDatabase';
import { getVersionsToMark } from '../src/helpers/GenerateVersions';
import type { RecordType } from '../src/providers/ProviderType';


declare var browser: Object;

type browserType = {
  desiredCapabilities: {
    browserName: string,
    version: number,
    platform: string,
  }
};

const shouldLogCompatSpecResults =
  process.env.LOG_COMPAT_SPEC_RESULTS
    ? process.env.LOG_COMPAT_SPEC_RESULTS === 'true'
    : true;

// @NOTE: If you only want to test a few of these, remember to .slice(0, x) to
//        test only the first x records. There's hundreds of records so this may
//        take a while
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

const { browserName, platform, version } = (browser: browserType).desiredCapabilities;
const caniuseId = mappings[browserName];


function log(record: Object, isSupported: bool) {
  if (shouldLogCompatSpecResults) {
    console.log(`
      "${record.protoChainId}" ${isSupported ? 'IS ✅ ' : 'is NOT ❌ '} API supported in ${browserName} ${version} on ${platform}
    `);
  }
}

describe('Compat Tests', () => {
  browser.url('http://example.com/');

  // Dynamically generate compat-tests for each record and each browser
  records.forEach((record: RecordType) => {
    it(`${record.protoChainId} Compat Tests`, async () => {
      // If newer version does not support API, current browser version doesn't support it
      // If older version does support API, current browser version does support it
      const existingRecordTargetVersions =
        await findSameVersionCompatRecord(record, caniuseId);

      // If the record already exists, skip tests
      const recordAlreadyExists = existingRecordTargetVersions
        ? Object
            .keys(existingRecordTargetVersions.versions)
            .find(target => (target === String(version)))
        : false;

      if (recordAlreadyExists) {
        console.log('**Record already exists**');
        return true;
      }

      const assertions = AssertionFormatter(record);
      const isSupported = (await browser.execute(`return (${assertions.apiIsSupported})`)).value;

      if (typeof isSupported !== 'boolean') {
        throw new Error([
          'Invalid JS execution value returned from Sauce Labs.',
          `Received ${isSupported} and expected boolean`
        ].join((' ')));
      }

      const { left, right } = getVersionsToMark(
        existingRecordTargetVersions
          ? Object.keys(existingRecordTargetVersions.versions)
          : [],
        caniuseId
      );

      // If middle is supported, mark all right as supported. Otherwise, mark
      // all left as unsupported
      insertBulkRecords(
        record,
        caniuseId,
        [
          ...(isSupported ? right : left),
          String(version)
        ],
        isSupported
      );
      log(record, isSupported);
    });

    return true;
  });
});
