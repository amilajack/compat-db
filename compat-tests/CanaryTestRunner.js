/**
 * @TODO: Move this to helpers or separate test-runners directory
 * @flow
 */
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

process.on('uncaughtException', err => {
  throw err;
});

/* eslint no-undef: off */

describe('Foo', () => {
  it('should foo', async () => {
    // @HACK: Read the tests from a local JSON file
    const tests = readFileSync(join(__dirname, 'tests')).toString();

    await browser.url('https://example.com');
    const testResults = (await browser.execute(tests)).value;

    // @HACK: Write the tests to a local JSON file
    writeFileSync(join(__dirname, 'test-results'), JSON.stringify(testResults));

    await browser.close();
    await browser.end();
  });
});
