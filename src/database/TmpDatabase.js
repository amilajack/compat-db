/**
 * A temporary in-memory database used to store records returned from saucelabs.
 * @flow
 */
import { join } from 'path';
import Sequelize from 'sequelize';
import type { RecordType } from '../providers/ProviderType';


/* eslint fp/no-let: 0, fp/no-loops: 0, fp/no-mutation: 0, fp/no-throw: 0 */

type str = string;
type num = number;

type recordExists = Promise<Array<{
  version: num,
  isSupported: 'y' | 'n' | 'n/a'
}>>;

export function initializeDatabase() {
  return new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
      max: 18,
      min: 0,
      idle: 10000
    },
    logging: false,
    storage: join(__dirname, '..', '..', 'tmp-db-records', 'database.sqlite')
  });
}

export async function insertTmpDatabaseRecord(
  database: Sequelize,
  record: RecordType,
  caniuseId: str,
  version: num,
  isSupported: bool
) {
  // Find the record to update
  return (await database).create({
    name: caniuseId,
    protoChainId: record.protoChainId,
    isSupported: isSupported ? 'y' : 'n',
    caniuseId,
    version
  });
}

export async function migrate() {
  const database = initializeDatabase();

  const Records = database.define('Records', {
    protoChainId: { type: Sequelize.STRING, primaryKey: true, unique: true },
    caniuseId: { type: Sequelize.STRING, allowNull: true, unique: false },
    name: { type: Sequelize.STRING, allowNull: true, unique: false },
    version: { type: Sequelize.STRING, allowNull: true, unique: false },
    isSupported: { type: Sequelize.STRING, allowNull: true, unique: false }
  }, {
    timestamps: true
  });

  await Records.drop();
  await Records.sync({ force: true });

  return Records;
}

/**
 * Find all the compatability records for every version of the same browser
 */
export async function findSameVersionCompatRecord(
  database: Sequelize, caniuseId: str, record: RecordType): recordExists {
  return (await database).findAll({
    where: {
      name: caniuseId,
      protoChainId: record.protoChainId
    }
  });
}
