import {
  camelCaseToHyphen,
  interceptAndFormat } from '../src/providers/microsoft-api-catalog/MicrosoftAPICatalogProvider';


describe('APICatalog', () => {
  describe('Helpers', () => {
    it('should format camelcase string to hypenated string', () => {
      expect(camelCaseToHyphen('fontSize')).toEqual('font-size');
      expect(camelCaseToHyphen('font')).toEqual('font');
      expect(camelCaseToHyphen('backgroundImage')).toEqual('background-image');
    });

    it('should intercept and format protoChain IDs', () => {
      expect(interceptAndFormat('Window')).toEqual('window');
      expect(interceptAndFormat('Console')).toEqual('console');
      expect(interceptAndFormat('Atomics')).toEqual('Atomics');
    });
  });
});
