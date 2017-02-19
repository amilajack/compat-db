import HasPrefix from '../src/helpers/HasPrefix';
import {
  getAllVersionsOfTarget,
  getCapabilities,
  convertCaniuseToBrowserName,
  convertBrowserNametoCaniuse,
  filterDuplicateTargets,
  getVersionsToMark } from '../src/helpers/GenerateVersions';
import {
  validateRecords,
  hasDuplicates,
  isBrowserMissing,
  isRecordMissing,
  RecordsValidator
} from '../src/helpers/RecordsValidator';

describe('HasPrefix', () => {
  it('should check vendor prefixes for JS APIs', () => {
    expect(HasPrefix('document.mozFullscreen()')).toEqual(true);
    expect(HasPrefix('document.webkitFullscreen()')).toEqual(true);
    expect(HasPrefix('document.msFullscreen()')).toEqual(true);
    expect(HasPrefix('document.fullscreen()')).toEqual(false);
    expect(HasPrefix('-moz-animation')).toEqual(true);
  });

  it('should check vendor prefixes for uppercase APIs', () => {
    expect(HasPrefix('document.WEBKIT_FULLSCREEN()')).toEqual(true);
    expect(HasPrefix('document.-MOZ-SOME()')).toEqual(true);
  });

  it('should convert caniuseIds to browserNames', () => {
    expect(convertCaniuseToBrowserName('chrome')).toEqual('chrome');
    expect(convertCaniuseToBrowserName('edge')).toEqual('MicrosoftEdge');
    expect(convertCaniuseToBrowserName('ie')).toEqual('internet explorer');
  });

  it('should convert browserNames to caniuseId', () => {
    expect(convertBrowserNametoCaniuse('chrome')).toEqual('chrome');
    expect(convertBrowserNametoCaniuse('MicrosoftEdge')).toEqual('edge');
    expect(convertBrowserNametoCaniuse('internet explorer')).toEqual('ie');
  });

  it('should check vendor prefixes for CSS APIs', () => {
    expect(HasPrefix('display: -webkit-box;')).toEqual(true);
    expect(HasPrefix('display: -ms-flexbox;')).toEqual(true);
    expect(HasPrefix('display: flex;')).toEqual(false);
    expect(HasPrefix('-webkit-transition: all .5s;')).toEqual(true);
    expect(HasPrefix('transition: all .5s;')).toEqual(false);
    expect(HasPrefix('-webkit-user-select: none;')).toEqual(true);
    expect(HasPrefix('-moz-user-select: none;')).toEqual(true);
    expect(HasPrefix('-ms-user-select: none;')).toEqual(true);
    expect(HasPrefix('user-select: none;')).toEqual(false);
    expect(HasPrefix('background: -webkit-linear-gradient(top, white, black);')).toEqual(true);
    expect(HasPrefix('background: linear-gradient(to bottom, white, black);')).toEqual(false);
  });
});

describe('GenerateVersions', () => {
  it('should filter duplicate targets with filterDuplicateTargets()', () => {
    expect(filterDuplicateTargets([
      { browserName: 'chrome', version: '48.0', platform: 'Windows 10' },
      { browserName: 'chrome', version: '30.0', platform: 'Windows 10' },
      { browserName: 'chrome', version: '48.0', platform: 'Windows 10' },
      { browserName: 'chrome', version: '47.0', platform: 'Windows 10' }
    ]))
    .toEqual([
      { browserName: 'chrome', version: '48.0', platform: 'Windows 10' },
      { browserName: 'chrome', version: '30.0', platform: 'Windows 10' },
      { browserName: 'chrome', version: '47.0', platform: 'Windows 10' }
    ]);
  });

  it('should get capabilities', () => {
    expect(getCapabilities({
      browserName: 'firefox',
      minVersion: 50.0,
      maxVersion: 51.0
    }))
    .toEqual([
      {
        browserName: 'firefox',
        version: '50.0',
        platform: 'Windows 10'
      },
      {
        browserName: 'firefox',
        version: '51.0',
        platform: 'Windows 10'
      }
    ]);
  });

  it('should get versions to mark: getVersionsToMark()', () => {
    // All safari versions:  ['6.0', '7.0', '8.0', '9.0', '10.0']
    expect(getVersionsToMark(['6.0', '7.0', '8.0'], 'safari')).toEqual({
      left: ['9.0'],
      right: ['10.0'],
      middle: '10.0'
    });
    expect(getVersionsToMark(['6.0', '7.0', '10.0'], 'safari')).toEqual({
      left: ['8.0'],
      right: ['9.0'],
      middle: '9.0'
    });
    expect(getVersionsToMark(['6.0', '10.0'], 'safari')).toEqual({
      left: ['7.0'],
      right: ['8.0', '9.0'],
      middle: '8.0'
    });
    expect(getVersionsToMark(['6.0', '7.0', '9.0', '10.0'], 'safari')).toEqual({
      left: [],
      right: ['8.0'],
      middle: '8.0'
    });
    expect(getVersionsToMark(['6.0', '7.0', '8.0', '9.0', '10.0'], 'safari')).toEqual({
      left: [],
      right: [],
      middle: undefined
    });
    // All IE versions: ['11.0', '10.0', '9.0', '8.0', '7.0', '6.0']
    expect(getVersionsToMark(['6.0', '11.0'], 'ie')).toEqual({
      left: ['7.0', '8.0'],
      right: ['9.0', '10.0'],
      middle: '9.0'
    });
  });

  it('should should get all target versions: getAllVersionsOfTarget()', () => {
    expect(getAllVersionsOfTarget('safari'))
      .toEqual(['6.0', '7.0', '8.0', '9.0', '10.0']);
  });
});

describe('validateRecords', () => {
  it('should throw an error if a record is missing a property', () => {
    const brokenRecords = [
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AbstractView.document', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.Animation.cancel', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AnalyserNode.getByteFrequencyData', type: 'js-api' }
    ];
    expect(validateRecords(brokenRecords)).toThrow();
  });
});

describe('hasDuplicates', () => {
  it('should throw an error if a record is missing a property', () => {
    const brokenRecords = [
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AbstractView.document', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.Animation.cancel', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' }
    ];
    expect(hasDuplicates(brokenRecords)).toThrow();
  });
});

describe('isBrowserMissing', () => {
  it('should throw an error if a record is missing a property', () => {
    const brokenRecords = [
      { name: 'chrome', caniuseId: 'chrome', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'safari', caniuseId: 'safari', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'firefox', caniuseId: 'firefox', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'ie', caniuseId: 'ie', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' }
    ];
    expect(isBrowserMissing(brokenRecords)).toThrow();
  });
});

describe('isRecordMissing', () => {
  it('should throw an error if a record is missing a property', () => {
    const brokenRecords = [
      { name: 'chrome', caniuseId: 'chrome', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'safari', caniuseId: 'safari', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'firefox', caniuseId: 'firefox', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'ie', caniuseId: 'ie', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' }
    ];
    expect(isRecordMissing(brokenRecords)).toThrow();
  });
});

describe('RecordsValidator', () => {
  it('should throw an error if a record is missing a property', () => {
    const brokenRecords = [
      { name: 'chrome', caniuseId: 'chrome', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'safari', caniuseId: 'safari', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'firefox', caniuseId: 'firefox', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'opera', caniuseId: 'opera', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' },
      { name: 'ie', caniuseId: 'ie', versions: { 11.64: 'n', 12.12: 'n' }, protoChainId: 'window.AmbientLightSensorReading.illuminance', type: 'js-api' }
    ];
    expect(RecordsValidator(brokenRecords)).toThrow();
  });
});
