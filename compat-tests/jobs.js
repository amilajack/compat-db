// @flow
import { join } from 'path';
import { writeFileSync } from 'fs';
import JobQueue from '../src/database/JobQueueDatabase';


export default async function writeAllJobsToJSON() {
  const jobQueue = new JobQueue();

  writeFileSync(
    join(__dirname, 'jobs.json'),
    JSON.stringify(await jobQueue.getAll()),
  );
}
