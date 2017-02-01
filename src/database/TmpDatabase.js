/**
 * A temporary in-memory database used to store records returned from saucelabs.
 * @flow
 */
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ProviderAPIResponse } from '../providers/ProviderType';

type str = string;
type num = number;

type TmpDatabaseType = {
  name: string,
  version: number,
  records: {
    [protoChainId: string]: 'y' | 'n' | 'prefixed'
  }
};

export function updateTmpDatabaseRecord(
  databasePath: string,
  record: ProviderAPIResponse,
  caniuseId: string,
  version: number,
  isSupported: bool
) {
  const database = (existsSync(databasePath)
    ? JSON.parse(readFileSync(databasePath).toString())
    : {
      name: caniuseId,
      version,
      records: {}
    }: TmpDatabaseType);

  database.records[record.protoChainId] = isSupported ? 'y' : 'n'; // eslint-disable-line

  writeFileSync(databasePath, JSON.stringify(database));
}

export function findTmpDatabaseRecord(databasePath: string, record: ProviderAPIResponse): Object {
  return JSON.parse(
    readFileSync(databasePath).toString()
  )
  .records[record.protoChainId];
}

/**
 * Find all the compatability records for each browser
 */
export function checkCompatRecordExists(
  caniuseId: str,
  ownVersion: num,
  record: ProviderAPIResponse
) {
  const versionPaths = join(__dirname, '..', '..', 'tmp-db-records');

  return readdirSync(versionPaths)
    // Keep all the records of the same browser and remove the current browser's version
    .filter(file =>
      file.includes(caniuseId) &&
      !file.includes(String(ownVersion))
    )
    .map(file => {
      const { records, version } = JSON.parse(readFileSync(join(versionPaths, file)).toString());
      return {
        version,
        supports: records[record.protoChainId]
      };
    });
}
