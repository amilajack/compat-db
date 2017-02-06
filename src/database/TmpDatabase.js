/**
 * A temporary in-memory database used to store records returned from saucelabs.
 * @flow
 */
import { join } from 'path';
import Knex from 'knex';
import bookshelf from 'bookshelf';
import type { RecordType as RType } from '../providers/ProviderType';


/* eslint fp/no-let: 0, fp/no-loops: 0, fp/no-mutation: 0, fp/no-throw: 0 */

type str = string;

export type schemaType = {
  name: string,
  version: string,
  isSupported: 'y' | 'n' | 'n/a'
};

type recordExists = Promise<Array<schemaType>>;

export function initializeDatabaseConnection() {
  const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: join(__dirname, '..', '..', 'tmp-db-records', 'database.sqlite')
    }
  });

  const Bookshelf = bookshelf(knex);

  const Database = Bookshelf.Model.extend({
    tableName: 'records'
  });

  return { knex, Database };
}

export async function migrate() {
  const { knex, Database } = initializeDatabaseConnection();

  /* eslint-disable */
  // $FlowFixMe: Flow definition issue
  await knex.schema.dropTableIfExists('records').createTable('records', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('version');
    table.string('protoChainId');
    table.string('isSupported');
    table.string('type');
    table.string('caniuseId');
  });
  /* eslint-enable */

  return Database;
}

export const Database = initializeDatabaseConnection().Database;

export function insertRecord(record: RType, caniuseId: str, version: str, isSupported: bool) {
  // Find the record to update
  return new Database({
    name: caniuseId,
    type: record.type,
    protoChainId: record.protoChainId,
    isSupported: isSupported ? 'y' : 'n',
    caniuseId,
    version
  })
  .save();
}

export function insertBulkRecords(
  record: RType,
  caniuseId: str,
  versions: Array<str>,
  isSupported: bool
) {
  return Promise.all(versions.map((version) => new Database({
    name: caniuseId,
    type: record.type,
    protoChainId: record.protoChainId,
    isSupported: isSupported ? 'y' : 'n',
    caniuseId,
    version
  })
  .save()));
}

/**
 * Find all the compatibility records for every version of the same browser
 */
export function findSameVersionCompatRecord(record: RType, caniuseId: str): recordExists {
  return Database.where({
    name: caniuseId,
    type: record.type,
    protoChainId: record.protoChainId,
    caniuseId
  })
  .fetchAll()
  .then((user) => user.toJSON());
}
