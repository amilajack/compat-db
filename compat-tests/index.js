/* eslint no-undef: 0 */
describe('Typecheck', () => {
  it('searches for WebdriverIO', () => {
    browser.url('http://example.com/');
    const item = browser.execute('return typeof ServiceWorker');
    const { browserName, platform, version } = browser.desiredCapabilities;
    console.log(`
      fetch() API supported in ${browserName} ${version} on ${platform}, typeof fetch === ${item.value}
    `);
  });
});
