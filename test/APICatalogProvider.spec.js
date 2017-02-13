import { camelCaseToHyphen } from '../src/providers/api-catalog/APICatalogProvider';


describe('APICatalog', () => {
  describe('Helpers', () => {
    it('should format camelcase string to hypenated string', () => {
      expect(camelCaseToHyphen('fontSize')).toEqual('font-size');
      expect(camelCaseToHyphen('font')).toEqual('font');
      expect(camelCaseToHyphen('backgroundImage')).toEqual('background-image');
    });
  });
});
