import { expect as chaiExpect } from 'chai';
import { find, ofAPIType } from '../src/providers/Providers';


describe('Providers', () => {
  describe('API Filtering', () => {
    it('should return filtered CSS APIs', () => {
      const filteredAPIs = ofAPIType('css');

      for (const api of filteredAPIs) {
        chaiExpect(api)
          .to.have.property('type')
          .that.equals('css-api');
      }
    });

    it('should return filtered JS APIs', () => {
      const filteredAPIs = ofAPIType('js');

      for (const api of filteredAPIs) {
        chaiExpect(api)
          .to.have.property('type')
          .that.equals('js-api');
      }
    });

    it('should return filtered HTML APIs', () => {
      const filteredAPIs = ofAPIType('html');

      for (const api of filteredAPIs) {
        chaiExpect(api)
          .to.have.property('type')
          .that.equals('html-api');
      }
    });
  });

  describe('API Resolution', () => {
    it('should resolve HTML API', () => {
      const api = find('width');
      expect(api).toBeDefined();
    });

    it('should resolve CSS API', () => {
      for (const api of ['width', 'display', 'flex', 'grid', 'font-size']) {
        const resolved = find(api);

        chaiExpect(resolved)
          .to.have.property('type')
          .that.equals('css-api');
        chaiExpect(resolved)
          .to.have.property('type')
          .that.equals('css-api');
      }
    });
  });
});
