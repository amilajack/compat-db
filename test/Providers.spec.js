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

    describe('Specific API Tests', () => {
      const records = ofAPIType('js');

      describe('JS APIs', () => {
        it('should get have non-style related APIs', () => {
          records.filter(record => record.protoChain.includes('navigator'));
        });

        it('should have navigator.serviceWorker', () => {
          expect(records.find(record =>
            record.protoChain.includes('window') &&
            record.protoChain.includes('Navigator') &&
            record.protoChain.includes('serviceWorker')
          )).toBeDefined();

          expect(records.find(record =>
            record.protoChain.includes('window') &&
            record.protoChain.includes('requestAnimationFrame')
          )).toBeDefined();

          expect(records.find(record =>
            record.protoChain.includes('window') &&
            record.protoChain.includes('ServiceWorkerRegistration') &&
            record.protoChain.includes('getNotifications')
          )).toBeDefined();

          expect(records.find(record =>
            record.protoChain.includes('window') &&
            record.protoChain.includes('ServiceWorkerRegistration') &&
            record.protoChain.includes('getNotifications')
          )).toBeDefined();

          expect(records.find(record =>
            record.protoChain.includes('window') &&
            record.protoChain.includes('ServiceWorkerMessageEvent') &&
            record.protoChain.includes('ports')
          )).toBeDefined();

          expect(records.find(record =>
            record.protoChain.includes('window') &&
            record.protoChain.includes('ServiceWorkerMessageEvent') &&
            record.protoChain.includes('source')
          )).toBeDefined();
        });
      });

      describe('CSS APIs', () => {
        it('should not have capital letters in id and name', () => {
          for (const record of ofAPIType('css')) {
            expect(record.id).toEqual(record.id.toLocaleLowerCase());
            expect(record.name).toEqual(record.name.toLocaleLowerCase());
          }
        });
      });

      it('should get borderTopRightRadius', () => {
        expect(find('borderTopRightRadius')).toEqual({
          id: 'borderTopRightRadius',
          name: 'borderTopRightRadius',
          specNames: ['css-background-3'],
          type: 'js-api',
          specIsFinished: false,
          protoChain: ['window', 'CSSStyleDeclaration', 'borderTopRightRadius']
        });
      });

      it('should get border-top-right-radius', () => {
        expect(find('border-top-right-radius')).toEqual({
          id: 'border-top-right-radius',
          name: 'border-top-right-radius',
          specNames: ['css-background-3'],
          type: 'css-api',
          specIsFinished: false,
          protoChain: ['window', 'CSSStyleDeclaration', 'borderTopRightRadius']
        });
      });

      it('should get css flex', () => {
        expect(ofAPIType('css').find(record => record.id === 'flex')).toEqual({
          id: 'flex',
          name: 'flex',
          specNames: ['css-flexbox-1'],
          type: 'css-api',
          specIsFinished: false,
          protoChain: ['window', 'CSSStyleDeclaration', 'flex']
        });
      });

      it('should get js flex', () => {
        expect(ofAPIType('js').find(record => record.id === 'flex')).toEqual({
          id: 'flex',
          name: 'flex',
          specNames: ['css-flexbox-1'],
          type: 'js-api',
          specIsFinished: false,
          protoChain: ['window', 'CSSStyleDeclaration', 'flex']
        });
      });
    });
  });
});
