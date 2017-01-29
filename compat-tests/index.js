// @flow
/* eslint no-undef: 0 */
import Providers from '../src/providers/Providers';
import AssertionFormatter from '../src/assertions/AssertionFormatter';


/**
 * @NOTE: If you only want to test a few of these, remember to .slice(0, x) to
 *        test only the first x records. There's hundreds of records so this may
 *        take a while
 */
const records = Providers().map(record => ({
  ...record,
  ...AssertionFormatter(record)
}));

// A mapping of caniuse target ID's to their correspodning saucelabs names
// See saucelabs.com/platforms for all supported saucelabs platforms
export default {
  chrome: 'chrome',
  firefox: 'firefox',
  opera: '',
  safari: 'safari',
  ie: 'internet explorer',
  edge: 'MicrosoftEdge'
  // @NOTE: Mobile devices require Appium
  // ios_saf: '',
  // and_chr: '',
  // and_ff: '',
  // android: ''
  // op_mini: '',
  // bb: '',
  // op_mob: '',
  // ie_mob: '',
  // and_uc: '',
  // samsung: ''
};

describe('Compat Tests', () => {
  // $FlowFixMe: Flow requires type definition
  browser.url('http://example.com/'); // eslint-disable-line

  records.forEach(record => {
    const compatTest = `return (${record.apiIsSupported})`;

    it(`${record.name} Compat Tests`, () => {
      const { value } = browser.execute(compatTest);
      const { browserName, platform, version } = browser.desiredCapabilities;
      console.log(`
        "${record.name}" ${value ? 'IS ✅ ' : 'is NOT ❌ '} API supported in ${browserName} ${version} on ${platform}
      `);
    });
  });
});
