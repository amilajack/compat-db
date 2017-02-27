// @flow
import { expect } from 'chai';
import { execSync } from 'child_process';
import * as TmpDatabase from '../database/TmpDatabase';
import { caniuseToSeleniumMappings } from './Constants';
import { allTargets } from './GenerateVersions';


/* eslint no-unused-expressions: 0, fp/no-let: 0 */

type tmpRecordType = {
  name: string,
  protoChainId: string,
  caniuseId: string,
  type: string,
  versions: string
};

export function validateRecordTypes(tmpRecords: Array<tmpRecordType>) {
  tmpRecords.forEach((record) => {
    try {
      expect(record.name).to.be.a('string');
      expect(record.caniuseId).to.be.a('string');
      expect(JSON.parse(record.versions)).to.be.an('object');
      expect(record.protoChainId).to.be.a('string');
      expect(record.type).to.exist;
    } catch (error) {
      console.log(error);
      throw new Error(`Invalid record "${record.protoChainId}" in "${record.caniuseId}", ${error}`);
    }
  });
}

export function checkHasDuplicates(tmpRecords: Array<tmpRecordType>) {
  const duplicates: Array<{
    protoChainId: string,
    caniuseId: string
  }> = [];

  tmpRecords.forEach((record, recordIndex) => {
    tmpRecords.forEach((comparedRecord, comparedRecordIndex) => {
      if (
        record.caniuseId === comparedRecord.caniuseId &&
        record.protoChainId === comparedRecord.protoChainId &&
        recordIndex !== comparedRecordIndex
      ) {
        duplicates.push({
          protoChainId: record.protoChainId,
          caniuseId: record.caniuseId
        });
      }
    });
  });

  if (duplicates.length > 0) {
    duplicates.forEach(duplicate =>
      console.log(`Duplicate record "${duplicate.protoChainId}" in "${duplicate.caniuseId}"`)
    );
    throw new Error('Duplicate records found');
  }
}

export function checkBrowserMissing(tmpRecords: Array<tmpRecordType>) {
  tmpRecords.forEach((record) => {
    const browserName = caniuseToSeleniumMappings[record.caniuseId];
    const recordVersions: Array<string> = Object.keys(JSON.parse(record.versions));
    const browserNameVersions = allTargets
      .filter(browserVersion =>
        browserVersion.browserName === browserName
      )
      .map(each => each.version);

    browserNameVersions.forEach((version) => {
      if (!recordVersions.includes(String(version))) {
        throw new Error(`Record "${record.protoChainId}" missing in ${browserName}@${version}`);
      }
    });
  });
}

export async function RecordsValidator(defaultTmpDatabaseRecords?: Array<tmpRecordType>) {
  const tmpDatabaseRecords = defaultTmpDatabaseRecords || await TmpDatabase.getAll();

  execSync('npm run build-compat-db');

  expect(tmpDatabaseRecords).to.have.length.above(1);
  console.log(`Testing ${tmpDatabaseRecords.length} temporary database records`);

  validateRecordTypes(tmpDatabaseRecords);
  checkHasDuplicates(tmpDatabaseRecords);
  checkBrowserMissing(tmpDatabaseRecords);

  console.log('✅   No validation errors found');
}
