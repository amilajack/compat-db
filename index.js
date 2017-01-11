const webdriverio = require('webdriverio');
const options = {
  desiredCapabilities: {
    browserName: 'chrome',
    version: '27.0',
  },
};
const client = webdriverio.remote(options);

describe('Compat', () => {
  it('description', () =>
    client
      .init()
      .url('http://www.example.com')
      .execute('return typeof fetch', [])
      .then(e => console.log(e.value))
      .end()
  );
});
