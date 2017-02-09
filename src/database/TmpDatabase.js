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
  versions: {
    [version: string]: 'y' | 'n' | 'n/a'
  }
};

type recordExists = Promise<schemaType>;

export function initializeDatabaseConnection() {
  const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: join(__dirname, '..', '..', 'tmp-db-records', 'database.sqlite')
    },
    pool: {
      min: 0,
      max: 30
    }
  });
  const Bookshelf = bookshelf(knex);
  const Database = Bookshelf.Model.extend({ tableName: 'records' });

  return { knex, Database };
}

export async function migrate() {
  const { knex, Database } = initializeDatabaseConnection();

  /* eslint-disable */
  // $FlowFixMe: Flow definition issue
  await knex.schema.dropTableIfExists('records').createTable('records', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('protoChainId');
    table.string('versions');
    table.string('type');
    table.string('caniuseId');
  });
  /* eslint-enable */

  return Database;
}

export const { Database } = initializeDatabaseConnection();

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
  .then(records => records.toJSON())
  .then(records => records.map(_record => ({
    ..._record,
    versions: JSON.parse(_record.versions)
  })))
  .then(_records => (_records.length ? _records[0] : null));
}

export async function insertBulkRecords(
  record: RType,
  caniuseId: str,
  versions: Array<str>,
  isSupported: bool
) {
  const newlyGenerateRecordVersions = {};

  versions.forEach((version) => {
    newlyGenerateRecordVersions[version] = isSupported ? 'y' : 'n';
  });

  const compatRecord = await findSameVersionCompatRecord(record, caniuseId);

  return new Database({ protoChainId: record.protoChainId })
    .save({
      name: caniuseId,
      type: record.type,
      protoChainId: record.protoChainId,
      versions: JSON.stringify({
        ...(compatRecord || {}),
        ...newlyGenerateRecordVersions
      }),
      caniuseId
    });
}
