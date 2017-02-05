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

type SequalizeType = Promise<Sequelize>;

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
  database: SequalizeType,
  record: RecordType,
  caniuseId: str,
  version: str,
  isSupported: bool
) {
  // Find the record to update
  return (await database).create({
    name: caniuseId,
    type: record.type,
    protoChainId: record.protoChainId,
    isSupported: isSupported ? 'y' : 'n',
    caniuseId,
    version
  });
}

export function defineSchema(database: any) {
  const Records = database.define('Records', {
    protoChainId: { type: Sequelize.STRING, allowNull: false, unique: false },
    caniuseId: { type: Sequelize.STRING, allowNull: false, unique: false },
    name: { type: Sequelize.STRING, allowNull: false, unique: false },
    type: { type: Sequelize.STRING, allowNull: false, unique: false },
    version: { type: Sequelize.STRING, allowNull: false, unique: false },
    isSupported: { type: Sequelize.STRING, allowNull: false, unique: false }
  }, {
    timestamps: true
  });

  Records.sync();

  return Records;
}

export async function migrate() {
  const database = initializeDatabase();
  const Records = defineSchema(database);

  await Records.drop();
  await Records.sync({ force: true });

  return Records;
}

/**
 * Find all the compatibility records for every version of the same browser
 */
export async function findSameVersionCompatRecord(
  database: SequalizeType, caniuseId: str, record: RecordType): recordExists {
  return (await database).findAll({
    where: {
      name: caniuseId,
      type: record.type,
      protoChainId: record.protoChainId
    }
  });
}

export const database = initializeDatabase();

export const Records = defineSchema(database);
