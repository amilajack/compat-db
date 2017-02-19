import { expect } from 'chai';
import Providers from '../providers/Providers';
import * as TmpDatabase from '../database/TmpDatabase';
import { caniuseToSeleniumMappings, fixedBrowserVersions, caniuseBrowsers } from './Constants';
import { allTargets } from './GenerateVersions';


/* eslint no-unused-expressions: 0, fp/no-let: 0 */

export function validateRecords(records) {
  records.forEach((record) => {
    try {
      expect(record.name).to.be.a('string');
      expect(record.caniuseId).to.be.a('string');
      expect(record.versions).to.be.an('object');
      expect(record.protoChainId).to.be.a('string');
      expect(record.type).to.exist;
      return true;
    } catch (error) {
      throw new Error(`Incompatible record ${record.protoChainId} in ${record.caniuseId}`);
    }
  });
}

export function hasDuplicates(records) {
  records.forEach((record) => {
    records.forEach((comparedRecord) => {
      let count = 0;
      if (
        record.caniuseId === comparedRecord.caniuseId &&
        record.protoChainId === comparedRecord.protoChainId
      ) {
        count += 1;
      }
      if (count > 1) {
        throw new Error(`Duplicate record ${record.protoChainId} in ${record.caniuseId}`);
      }
      return true;
    });
  });
}

export function isBrowserMissing(records) {
  records.forEach((record) => {
    const seleniumId = caniuseToSeleniumMappings[record.caniuseId];
    if (seleniumId !== 'chrome' || seleniumId !== 'firefox') {
      const browserVersions = fixedBrowserVersions
      .filter(browserVersion => browserVersion.browserName === seleniumId);
      const recordVersions = Object.keys(record.versions);
      browserVersions.forEach((version) => {
        if (!recordVersions.includes(version.version)) {
          throw new Error(`Record ${record.protoChainId} missing in ${version.browserName} version: ${version.version}`);
        }
      });
    } else {
      const allBrowserVersions = allTargets();
      const browserVersions = allBrowserVersions
      .filter(browserVersion => browserVersion.browserName === seleniumId);
      const recordVersions = Object.keys(record.versions);
      browserVersions.forEach((version) => {
        if (!recordVersions.includes(version.version)) {
          throw new Error(`Record ${record.protoChainId} missing in ${version.browserName} version: ${version.version}`);
        }
      });
    }
  });
}

export function isRecordMissing(records) {
  const requiredRecords = Providers();
  const browsers = caniuseBrowsers;
  requiredRecords.forEach((requiredRecord) => {
    const validatedRecords = [];
    records.forEach((record) => {
      if (requiredRecord.protoChainId === record.protoChainId) {
        validateRecords.push(record.caniuseId);
      }
    });
    browsers.forEach((browser) => {
      if (!validatedRecords.includes(browser)) {
        throw new Error(`ProtoChainId ${requiredRecord.protoChainId} is missing from: ${browser}`);
      }
    });
  });
}

export async function RecordsValidator() {
  const records = await TmpDatabase.getAll();
  validateRecords(records);
  hasDuplicates(records);
  isBrowserMissing(records);
  isRecordMissing(records);
}
