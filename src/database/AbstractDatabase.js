// @flow
import { join } from 'path';
import Knex from 'knex';
import bookshelf from 'bookshelf';
import dotenv from 'dotenv';
import type { RecordType as RType } from '../providers/RecordType';


dotenv.config();

type str = string;

export type AbstractDatabaseRecordType = {
  name: str,
  versions: {
    [version: str]: 'y' | 'n' | 'n/a'
  }
};

export default class AbstractDatabase {

  tableName: str

  connection: {
    knex: Object,
    Database: Class, // eslint-disable-line
    Bookshelf: Object
  }

  constructor(tableName: string) {
    this.tableName = tableName;
    this.connection = this.initializeDatabaseConnection(tableName);
  }

  /**
   * Initialize a database connection to either sqlite or mysql. Defaults to
   * sqlite for easier out-of-the-box setup.
   *
   * @NOTE: If you get the error 'connection.query is not a function',
   *        this is probably because the mysql server has not been started
   */
  initializeDatabaseConnection() {
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
      },
      acquireConnectionTimeout: 1000000
    };

    const sqliteConfig = {
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: join(__dirname, 'database.sqlite')
      }
    };

    const knex = Knex(
      process.env.USE_SQLITE === 'false'
        ? mysqlConfig
        : sqliteConfig
    );
    const Bookshelf = bookshelf(knex);
    const Database = Bookshelf.Model.extend({ tableName: this.tableName });

    return { knex, Database, Bookshelf };
  }

  where(whereClause: Object): Array<Object> {
    return this.connection
      .Database
      .where(whereClause);
  }

  /**
   * Get all records in the database
   */
  getAll(): Promise<Array<Object>> {
    return this.connection.Database
      .forge()
      .fetchAll()
      .then(records => records.toJSON());
  }

  /**
   * Remove an item in the database
   */
  remove(whereStatement: Object) {
    return this.connection.Database.where(whereStatement).destroy();
  }

  count() {
    return new this.connection.Database().count();
  }

  /**
   * Drop the databases and re-migrate them
   */
  async migrate(createTable: (table: Object) => void) {
    const { knex, Database } = this.initializeDatabaseConnection(this.tableName);

    await knex.schema.dropTableIfExists(this.tableName);
    await knex.schema.createTable(this.tableName, createTable);

    return Database;
  }

  /**
   * Find all the compatibility records for every version of the same browser
   */
  findSameVersionCompatRecord(record: RType, caniuseId: str): Promise<AbstractDatabaseRecordType> {
    return this.connection.Database.where({
      name: caniuseId,
      type: record.type,
      protoChainId: record.protoChainId,
      caniuseId
    })
    .fetchAll()
    .then(records => records.toJSON());
  }

  /**
   * Efficiently insert a large number of records into the database. This is
   * handled natively by knex and bookshelf
   */
  insertBulk(recordsToInsert: Array<Object>) {
    return this.connection.knex
      .batchInsert(this.tableName, recordsToInsert).returning('id');
  }
}
