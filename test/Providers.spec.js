import { expect as chaiExpect } from 'chai';
import { join } from 'path';
import { writeFileSync } from 'fs';
import Providers, { find, ofAPIType } from '../src/providers/Providers';


// Temporary way of outputing providers
const ProvidersJSON = JSON.stringify(Providers());
writeFileSync(join(__dirname, '..', 'compat-db.json'), ProvidersJSON);

describe('Providers', () => {
  describe('Constraints', () => {
    it('should be below length of 2000', () => {
      expect(ofAPIType('css').length).toBeLessThan(2000);
      expect(ofAPIType('js').length).toBeLessThan(12000);
    });
  });

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
        it('should get contain non-style related APIs', () => {
          records.filter(record => record.protoChain.includes('navigator'));
        });

        it('should contain requestAnimationFrame record', () => {
          const record = find('requestAnimationFrame');
          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('requestAnimationFrame');
        });

        it.skip('should contain currentScript record', () => {
          const record = find('currentScript');
          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('document');
          expect(record.protoChain).toContain('currentScript');
        });

        it('should contain PaymentRequest record', () => {
          const [record] = records
            .filter(e => e.protoChain.includes('window'))
            .filter(e => e.protoChain.includes('PaymentRequest'));

          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('PaymentRequest');
        });

        it.skip('should contain WebAssembly record', () => {
          const [record] = records
            .filter(e => e.protoChain.includes('window'))
            .filter(e => e.protoChain.includes('WebAssembly'));

          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('WebAssembly');
        });

        it.skip('should contain WebAssembly.compile record', () => {
          const [record] = records
            .filter(e => e.protoChain.includes('window'))
            .filter(e => e.protoChain.includes('WebAssembly'))
            .filter(e => e.protoChain.includes('compile'));

          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('WebAssembly');
          expect(record.protoChain).toContain('compile');
        });

        it('should contain supports record', () => {
          const [record] = records
            .filter(e => e.protoChain.includes('CSS'))
            .filter(e => e.protoChain.includes('supports'));

          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('CSS');
          expect(record.protoChain).toContain('supports');
        });

        it('should contain fetch record', () => {
          const [record] = records
            .filter(e => e.protoChain.includes('window'))
            .filter(e => e.protoChain.includes('fetch'));

          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('fetch');
        });

        it('description', () => {

        });

        it('should contain applicationCache record', () => {
          const record = find('applicationCache');
          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('applicationCache');
        });

        it('should contain math record', () => {
          const methods = ['cos', 'acos', 'sin', 'asin', 'asin'];
          for (const method of methods) {
            const record = find(method);
            expect(record).toBeDefined();
            expect(record.protoChain).toContain('Math');
            expect(record.protoChain).toContain(method);
          }
        });

        it('should contain requestIdleCallback record', () => {
          const record = find('requestIdleCallback');
          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('requestIdleCallback');
        });

        it.skip('should contain IntersectionObserver record', () => {
          const record = find('IntersectionObserver');
          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('IntersectionObserver');
        });

        it('should contain createImageBitmap record', () => {
          const record = find('createImageBitmap');
          expect(record).toBeDefined();
          expect(record.protoChain).toContain('window');
          expect(record.protoChain).toContain('createImageBitmap');
        });

        it('should contain navigator.serviceWorker record', () => {
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
