/* eslint fp/no-mutation: 0 */

// @TODO: Add Safari Tech Preview support
exports.config = {
  specs: ['./compat-tests/CanaryTestRunner.js'],
  maxInstances: 40,
  capabilities: [{
    browserName: 'chrome',
    platform: 'MAC',
    chromeOptions: {
      args: [
        '--flag-switches-begin',
        '--enable-canvas-2d-dynamic-rendering-mode-switching',
        '--enable-es3-apis',
        '--enable-experimental-canvas-features',
        '--enable-experimental-web-platform-features',
        '--javascript-harmony',
        '--enable-quic',
        '--enable-webvr',
        '--touch-events=enabled',
        '--enable-features=AsmJsToWebAssembly,BackgroundVideoTrackOptimization,GamepadExtensions,GenericSensor,MaterialDesignBookmarks,MaterialDesignHistory,MaterialDesignSettings,MaterialDesignUserMenu,NativeNotifications,SharedArrayBuffer,V8Future,WebAssembly,WebUSB,brotli-encoding',
        '--flag-switches-end'
      ],
      binary: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
    },
    maxInstances: 1,
    seleniumProtocol: 'WebDriver'
  }],
  sync: false,
  logLevel: 'error',
  coloredLogs: true,
  screenshotOnReject: false,
  services: ['selenium-standalone'],
  framework: 'mocha',
  reporters: ['dot'],
  reporterOptions: {
    outputDir: './'
  },
  mochaOpts: {
    ui: 'bdd',
    compilers: ['js:babel-register']
  }
};
