import hasPrefix from '../src/helpers/PrefixHandler';


describe('PrefixHandler', () => {
  describe('isPrefixed', () => {
    it('should check prefixes for JS APIs', () => {
      expect(hasPrefix('document.mozFullscreen()')).toBe(true);
      expect(hasPrefix('document.webkitFullscreen()')).toBe(true);
      expect(hasPrefix('document.msFullscreen()')).toBe(true);
      expect(hasPrefix('document.fullscreen()')).toBe(false);
    });

    it('should check prefixes for CSS APIs', () => {
      expect(hasPrefix('display: -webkit-box;')).toBe(true);
      expect(hasPrefix('display: -ms-flexbox;')).toBe(true);
      expect(hasPrefix('display: flex;')).toBe(false);
      expect(hasPrefix('-webkit-transition: all .5s;')).toBe(true);
      expect(hasPrefix('transition: all .5s;')).toBe(false);
      expect(hasPrefix('-webkit-user-select: none;')).toBe(true);
      expect(hasPrefix('-moz-user-select: none;')).toBe(true);
      expect(hasPrefix('-ms-user-select: none;')).toBe(true);
      expect(hasPrefix('user-select: none;')).toBe(false);
      expect(hasPrefix('background: -webkit-linear-gradient(top, white, black);')).toBe(true);
      expect(hasPrefix('background: linear-gradient(to bottom, white, black);')).toBe(false);
    });
  });
});
