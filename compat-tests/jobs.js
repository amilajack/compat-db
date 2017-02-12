// @flow
import { join } from 'path';
import { writeFileSync } from 'fs';
import JobQueue from '../src/database/JobQueueDatabase';


async function getAllJobs() {
  const jobQueue = new JobQueue();
  writeFileSync(JSON.stringify(await jobQueue.getAll()), join(__dirname, 'jobs.json'));
  process.exit(0);
}

getAllJobs();
