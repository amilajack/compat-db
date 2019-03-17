// @flow
import { execSync } from 'child_process';
import JobQueueDatabase from '../src/database/JobQueueDatabase';

process.on('uncaughtException', err => {
  throw err;
});

/* eslint no-await-in-loop: off */

async function RunToCompletion() {
  const jobQueueDatabase = new JobQueueDatabase();
  let iteration = 0;

  while ((await jobQueueDatabase.count()) > 0) {
    iteration += 1;
    console.log(`On iteration #${iteration} ...`);
    const result = execSync('npm run build-compat-db').toString();
    console.log(result);
  }
}

if (require.main === module) {
  RunToCompletion();
}
