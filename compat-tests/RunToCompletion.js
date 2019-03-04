// @flow
import { execSync } from 'child_process';
import JobQueueDatabase from '../src/database/JobQueueDatabase';

/* eslint no-await-in-loop: 0, prefer-const: 0, fp/no-let: 0, fp/no-loops: 0 */

const jobQueueDatabase = new JobQueueDatabase();

(async function RunToCompletion() {
  let iteration = 0;

  while ((await jobQueueDatabase.count()) > 0) {
    iteration += 1;
    console.log(`On iteration #${iteration} ...`);
    const result = execSync('npm run build-compat-db').toString();
    console.log(result);
  }
})();
