var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'chrome' } };
var client = webdriverio.remote(options);
// var client = require('webdriverio').remote({
//     desiredCapabilities: {
//     	platformName: 'iOS',
//         app: 'net.company.SafariLauncher',
//         udid: '123123123123abc',
//         deviceName: 'iPhone',
//     }
// });
