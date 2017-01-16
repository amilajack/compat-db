const webdriverio = require('webdriverio');

const options = {
  desiredCapabilities: {
    browserName: 'chrome',
    version: '27.0'
  }
};

const client = webdriverio.remote(options);

describe('Compat', () => {
  it('should run basic type assertion', () =>
    client
      .init()
      .url('http://www.example.com')
      // document.defaultView.getComputedStyle(document.body, '')
      // http://stackoverflow.com/questions/2614963/how-do-i-get-all-supported-css-properties-in-webkit
      // console.log(document.body.style)
      .execute('return typeof fetch', [])
      .then(e => console.log(e.value))
      .end()
  );
});
