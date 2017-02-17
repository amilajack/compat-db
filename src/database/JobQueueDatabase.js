/**
 * `JobQueue` is responsible for queueing up new tests to be run again on
 * @flow
 */
import AbstractDatabase from './AbstractDatabase';


/* eslint fp/no-this: 0, fp/no-class: 0, class-methods-use-this: 0 */

export type schemaType = {
  name: string,
  browserName: string,
  protoChainId: string,
  platform: string,
  version: string,
  record: string,
  type: 'js-api' | 'css-api' | 'html-api',
  caniuseId: string,
};

type JobQueueType = schemaType;

type whereClauseType = {
  browserName: string,
  protoChainId?: string
}
& (
  { caniuseId: string }
  | { browserName: string }
);

export default class JobQueue extends AbstractDatabase {
  constructor(tableName: string = 'jobs') {
    super(tableName);
  }

  migrate() {
    return super.migrate((table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('browserName');
      table.string('platform');
      table.string('protoChainId');
      table.string('version');
      table.enu('type', ['js-api', 'css-api', 'html-api']);
      table.string('record', 1000);
      table.string('caniuseId');
      table.enu('status', ['queued', 'running']).defaultTo('queued');
    });
  }

  markJobsStatus(whereClause: whereClauseType, status: 'running' | 'queued') {
    return this.connection
      .Database
      .where(whereClause)
      .save({ status }, { method: 'update', patch: true });
  }

  /**
   * Override paramater type with stricter 'Array<schemaType>'
   */
  insertBulk(recordsToInsert: Array<schemaType>) {
    return super.insertBulk(recordsToInsert);
  }

  remove(whereStatement: schemaType) {
    return super.remove(whereStatement);
  }

  /**
   * Find all the compatibility records for every version of the same browser
   */
  find(whereClause: whereClauseType): Promise<Array<JobQueueType>> {
    return this.connection.Database.where(whereClause)
      .fetchAll()
      .then(records => records.toJSON());
  }
}
