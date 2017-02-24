/**
 * `JobQueue` is responsible for queueing up new tests to be run again on
 * @flow
 */
import AbstractDatabase from './AbstractDatabase';


export default class RecordMetabaseDatabase extends AbstractDatabase {
  constructor(name: string = 'record-metadata') {
    super(name);
  }

  migrate() {
    return super.migrate((table) => {
      table.increments('id').primary();
      table.string('protoChainId');
      table.string('astNodeType');
      table.boolean('isStatic');
      table.boolean('polyfillable');
      table.enu('type', ['js-api', 'css-api', 'html-api']);
    });
  }

  getAll(): Promise<Array<Object>> {
    return this.connection.Database
      .forge()
      .fetchAll()
      .then(records => records.toJSON())
      .then(records => records.map(each => ({
        ...each,
        isStatic: Boolean(each.isStatic)
      })));
  }
}
