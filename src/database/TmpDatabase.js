/**
 * A temporary in-memory database used to store records returned from saucelabs.
 * @flow
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import type { ProviderAPIResponse } from '../providers/ProviderType';


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
  const { records } = (existsSync(databasePath)
    ? JSON.parse(readFileSync(databasePath).toString())
    : {
      name: caniuseId,
      version,
      records: {}
    }: TmpDatabaseType);

  records[record.protoChainId] = isSupported ? 'y' : 'n'; // eslint-disable-line

  writeFileSync(databasePath, JSON.stringify({ records }));
}

export function findTmpDatabaseRecord(databasePath: string, record: ProviderAPIResponse): Object {
  return JSON.parse(
    readFileSync(databasePath).toString()
  )
  .records[record.protoChainId];
}
