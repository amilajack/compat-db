// @flow
// $FlowFixMe: Flow requires type definition
import { agents } from 'caniuse-db/fulldata-json/data-2.0.json'; // eslint-disable-line
import { writeFileSync } from 'fs';
import type { RecordType } from '../providers/ProviderType';


/* eslint fp/no-mutation: 0 */

/**
 * Prepare the database for compat-tests. This includes formatting the layout of
 * the database to fit our 'schema'. Here' we initialize certain fields and can
 * remove unnecessary ones
 *
 * @TODO: Remove vendor-prefixed records
 * @TODO: Implement `DatabaseType` type
 */
export default function PrepareDatabase(records: Array<RecordType>, databasePath: string) {
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
