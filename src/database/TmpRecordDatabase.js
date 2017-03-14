/**
 * A temporary in-memory database used to store records returned from saucelabs.
 * @flow
 */
import AbstractDatabase from './AbstractDatabase';
import type { RecordType as RType } from '../providers/RecordType';


type str = string;

export type TmpRecordDatabaseRecordType = {
  name: str,
  versions: {
    [version: str]: 'y' | 'n' | 'n/a'
  }
};

type sameRecordType = Promise<TmpRecordDatabaseRecordType>;

type rQueryType = {
  type: 'js-api' | 'css-api' | 'html-api',
  protoChainId: str,
};

export default class TmpRecordDatabase extends AbstractDatabase {
  constructor(tableName: str = 'tmp-records') {
    super(tableName);
  }

  migrate() {
    return super.migrate(table => {
      table.increments('id');
      table.string('name');
      table.string('protoChainId');
      table.string('versions', 1000);
      table.enu('type', ['js-api', 'css-api', 'html-api']);
      table.string('caniuseId');
    });
  }

  /**
   * Find all the compatibility records for every version of the same browser
   */
  findSameVersionCompatRecord(record: rQueryType, caniuseId: str): sameRecordType {
    return this.connection.Database
      .where({
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

  async insertBulkRecords(record: RType, caniuseId: str, versions: Array<str>, isSupported: bool) {
    const newlyGenerateRecordVersions = {};

    versions.forEach((version) => {
      newlyGenerateRecordVersions[version] = isSupported ? 'y' : 'n';
    });

    return this.connection.Database
      .where({
        caniuseId,
        name: caniuseId,
        protoChainId: record.protoChainId
      })
      .save({
        name: caniuseId,
        type: record.type,
        protoChainId: record.protoChainId,
        versions: JSON.stringify(newlyGenerateRecordVersions),
        caniuseId
      });
  }
}
