import { camelToHyphen } from '../src/providers/api-catalog/APICatalogProvider';
// import APICatalog, { camelToHyphen } from '../src/providers/api-catalog/APICatalogProvider';
// import Database from '../src/providers/api-catalog/apicatalogdata.json';


describe('APICatalog', () => {
  describe('Helpers', () => {
    it('should format camelcase string to hypenated string', () => {
      expect(camelToHyphen('fontSize')).toEqual('font-size');
      expect(camelToHyphen('font')).toEqual('font');
      expect(camelToHyphen('backgroundImage')).toEqual('background-image');
    });
  });
});
