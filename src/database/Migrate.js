import * as TmpRecordDatabase from './TmpRecordDatabase';
import JobQueueDatabase from '../../src/database/JobQueueDatabase';
import RecordMetadataDatabase from '../../src/database/RecordMetadataDatabase';


TmpRecordDatabase.migrate();

const jobQueue = new JobQueueDatabase();
jobQueue
  .migrate()
  .then(() => process.exit(0))
  .catch(console.log);

const recordMetadata = new RecordMetadataDatabase();
recordMetadata.migrate();
