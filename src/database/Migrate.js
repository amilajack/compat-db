// @flow
import TmpRecordDatabase from './TmpRecordDatabase';
import JobQueueDatabase from './JobQueueDatabase';
import RecordMetadataDatabase from './RecordMetadataDatabase';

const tmpRecordDatabase = new TmpRecordDatabase();
const jobQueue = new JobQueueDatabase();
const recordMetadata = new RecordMetadataDatabase();

process.on('uncaughtException', err => {
  throw err;
});

Promise.all([
  tmpRecordDatabase.migrate(),
  jobQueue.migrate(),
  recordMetadata.migrate()
])
  .then(() => process.exit(0))
  .catch(e => {
    throw new Error(e);
  });
