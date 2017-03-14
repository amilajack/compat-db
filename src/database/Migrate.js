// @flow
import TmpRecordDatabase from './TmpRecordDatabase';
import JobQueueDatabase from '../../src/database/JobQueueDatabase';
import RecordMetadataDatabase from '../../src/database/RecordMetadataDatabase';


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
