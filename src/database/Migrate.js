import { migrate } from './TmpDatabase';
import JobQueueDatabase from '../../src/database/JobQueueDatabase';


migrate();

const jobQueue = new JobQueueDatabase();

jobQueue
  .migrate()
  .then(() => process.exit(0))
  .catch(console.log);
