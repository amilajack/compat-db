var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'firefox',
        version: '27.0'
    }
};
var client = webdriverio.remote(options);

describe('Compat', () => {
    it('description', () => {
        return client
            .init()
            .url('http://www.example.com')
            .execute("return typeof fetch", [])
            .then(e => console.log(e.value))
            .end()
    });
});
