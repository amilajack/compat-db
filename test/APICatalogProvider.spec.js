import { camelToHyphen } from '../src/providers/api-catalog/APICatalogProvider';


describe('APICatalog', () => {
  describe('Helpers', () => {
    it('should format camelcase string to hypenated string', () => {
      expect(camelToHyphen('fontSize')).toEqual('font-size');
      expect(camelToHyphen('font')).toEqual('font');
      expect(camelToHyphen('backgroundImage')).toEqual('background-image');
    });
  });
});
