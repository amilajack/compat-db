/**
 * A temporary in-memory database used to store records returned from saucelabs.
 * @flow
 */
import { join } from 'path';
import Knex from 'knex';
import bookshelf from 'bookshelf';
import dotenv from 'dotenv';
import type { RecordType as RType } from '../providers/ProviderType';


/* eslint fp/no-let: 0, fp/no-loops: 0, fp/no-mutation: 0, fp/no-throw: 0 */
// @TODO: Extend AbstractDatabase

dotenv.config();

type str = string;

export type schemaType = {
  name: string,
  versions: {
    [version: string]: 'y' | 'n' | 'n/a'
  }
};

export function initializeDatabaseConnection() {
  const mysqlConfig = {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_IP_ADDRESS || '127.0.0.1',
      user: 'username',
      password: 'secret',
      database: 'compat-db',
      charset: 'utf8'
    },
    pool: {
      min: 0,
      max: 30
    }
  };
  const sqliteConfig = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: join(__dirname, '..', '..', 'tmp-db-records', 'database.sqlite')
    }
  };

  const knex = Knex(
    process.env.USE_SQLITE === 'false'
      ? mysqlConfig
      : sqliteConfig
  );
  const Bookshelf = bookshelf(knex);
  const Database = Bookshelf.Model.extend({ tableName: 'records' });

  return { knex, Database, Bookshelf };
}

export async function migrate() {
  const { knex, Database } = initializeDatabaseConnection();

  /* eslint-disable */
  // $FlowFixMe: Flow definition issue
  await knex.schema.dropTableIfExists('records').createTable('records', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('protoChainId');
    table.string('versions', 1000);
    table.enu('type', ['js-api', 'css-api', 'html-api']);
    table.string('caniuseId');
  });
  await knex.schema.dropTableIfExists('jobs').createTable('jobs', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('browserName');
    table.string('protoChainId');
    table.string('version');
    table.enu('type', ['js-api', 'css-api', 'html-api']);
    table.string('record', 1000);
    table.string('caniuseId');
  });
  /* eslint-enable */

  return Database;
}

export const { Database } = initializeDatabaseConnection();

/**
 * Find all the compatibility records for every version of the same browser
 */
export function findSameVersionCompatRecord(record: RType, caniuseId: str): Promise<schemaType> {
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

  return new Database({
    protoChainId: record.protoChainId
  })
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
