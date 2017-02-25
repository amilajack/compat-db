// @flow
import { migrate } from './TmpDatabase';
import JobQueueDatabase from '../../src/database/JobQueueDatabase';
import RecordMetadataDatabase from '../../src/database/RecordMetadataDatabase';


// Migrate RecordMetadataDatabase
const recordMetadata = new RecordMetadataDatabase();
recordMetadata.migrate();

// Migrate TmpdDatabase
migrate();

// Migrate JobQueueDatabase
const jobQueue = new JobQueueDatabase();
jobQueue.migrate();
