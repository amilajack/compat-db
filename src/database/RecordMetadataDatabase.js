/**
 * `JobQueue` is responsible for queueing up new tests to be run again on
 * @flow
 */
import AbstractDatabase from './AbstractDatabase';


export default class RecordMetabaseDatabase extends AbstractDatabase {
  constructor() {
    super('record-metadata');
  }
}
