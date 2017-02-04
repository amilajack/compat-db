import HasPrefix from '../src/helpers/HasPrefix';


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
