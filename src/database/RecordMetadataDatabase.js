/**
 * `JobQueue` is responsible for queueing up new tests to be run again on
 * @flow
 */
import AbstractDatabase from './AbstractDatabase';

type RecordMetadataType = {
  protoChainId: string,
  astNodeType: string,
  isStatic: boolean,
  polyfillable: boolean,
  type: 'js-api' | 'css-api' | 'html-api'
};

export default class RecordMetabaseDatabase extends AbstractDatabase {
  constructor(name: string = 'record-metadata') {
    super(name);
  }

  migrate() {
    return super.migrate(table => {
      table.increments('id');
      table.string('protoChainId');
      table.string('astNodeType');
      table.boolean('isStatic');
      table.boolean('polyfillable').defaultTo(false);
      table.enu('type', ['js-api', 'css-api', 'html-api']);
    });
  }

  getAll(): Promise<Array<RecordMetadataType>> {
    return (
      this.connection.Database.forge()
        .fetchAll()
        .then(records => records.toJSON())
        // @HACK: Find a proper way to cast `isStatic` to a boolean
        .then(records =>
          records.map(each => ({
            ...each,
            isStatic: Boolean(each.isStatic)
          }))
        )
    );
  }
}
