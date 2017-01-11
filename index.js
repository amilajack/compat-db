const webdriverio = require('webdriverio');
const options = { desiredCapabilities: { browserName: 'chrome' } };
const client = webdriverio.remote(options);
// var client = require('webdriverio').remote({
//     desiredCapabilities: {
//     	platformName: 'iOS',
//         app: 'net.company.SafariLauncher',
//         udid: '123123123123abc',
//         deviceName: 'iPhone',
//     }
// });
