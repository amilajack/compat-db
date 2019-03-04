// @flow
import TmpRecordDatabase from './TmpRecordDatabase';
import JobQueueDatabase from './JobQueueDatabase';
import RecordMetadataDatabase from './RecordMetadataDatabase';

const tmpRecordDatabase = new TmpRecordDatabase();
const jobQueue = new JobQueueDatabase();
const recordMetadata = new RecordMetadataDatabase();

Promise.all([
  tmpRecordDatabase.migrate(),
  jobQueue.migrate(),
  recordMetadata.migrate()
])
.then(() => process.exit(0))
.catch(console.log);
