import { migrate } from './TmpDatabase';
import JobQueue from '../../src/database/JobQueueDatabase';


migrate();

const jobQueue = new JobQueue();

jobQueue
  .migrate()
  .then(() => process.exit(0))
  .catch(console.log);
