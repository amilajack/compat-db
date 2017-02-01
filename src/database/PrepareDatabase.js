// @flow
// $FlowFixMe: Flow requires type definition
import { agents } from 'caniuse-db/fulldata-json/data-2.0.json'; // eslint-disable-line
import { writeFileSync, readFileSync, existsSync } from 'fs';
import type { ProviderAPIResponse } from '../providers/ProviderType';


/* eslint fp/no-mutation: 0 */

/**
 * Update a single record in the database
 * @TODO: Refactor for better performance. Use in-memory database instead of JSON
 */
export function updateDatabaseRecord(
  databasePath: string,
  record: ProviderAPIResponse,
  caniuseId: string,
  version: number,
  isSupported: bool
) {
  const { records } = existsSync(databasePath)
    ? JSON.parse(readFileSync(databasePath).toString())
    : {
      records: {}
    };

  const recordToInsert = {
    targets: {
      [caniuseId]: {
        [String(Math.floor(version))]: isSupported ? 'y' : 'n'
      }
    }
  };

  records[record.protoChainId] = recordToInsert;

  writeFileSync(databasePath, JSON.stringify({ records }));
}

// @TODO
//   * Map Opera versions to corresponding chrome versions
// export function PostProcessDatabase() {}

export function readDatabase(databasePath: string): Object {
  return JSON.parse(readFileSync(databasePath).toString());
}

export function findDatabaseRecord(databasePath: string, record: ProviderAPIResponse): Object {
  return JSON.parse(
    readFileSync(databasePath).toString()
  )
  .records.find((_record) =>
    _record.id === record.id &&
    _record.protoChainId === record.protoChainId
  );
}

/**
 * Prepare the database for compat-tests. This includes formatting the layout of
 * the database to fit our 'schema'. Here' we initialize certain fields and can
 * remove unnecessary ones
 *
 * @TODO: Remove vendor-prefixed records
 * @TODO: Implement `DatabaseType` type
 */
export default function PrepareDatabase(records: Array<ProviderAPIResponse>, databasePath: string) {
  const database = {
    agents,
    records: records.map(record => ({
      ...record,
      targets: {
        chrome: {},
        firefox: {},
        opera: {},
        safari: {},
        ie: {},
        edge: {}
      }
    }))
  };

  writeFileSync(databasePath, JSON.stringify(database));
}
