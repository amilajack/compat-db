// @flow
import * as TmpRecordDatabase from './TmpRecordDatabase';
import JobQueueDatabase from '../../src/database/JobQueueDatabase';
import RecordMetadataDatabase from '../../src/database/RecordMetadataDatabase';


const jobQueue = new JobQueueDatabase();
const recordMetadata = new RecordMetadataDatabase();

Promise.all([
  TmpRecordDatabase.migrate(),
  jobQueue.migrate(),
  recordMetadata.migrate()
])
.then(() => process.exit(0))
.catch(console.log);
