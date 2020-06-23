import { ready, fire, find, closest, on, addClass, removeClass } from 'domassist';
import tinybounce from 'tinybounce';

class Sticky {
  constructor(el, options = {}) {
    this.el = el;
    this.transformTop = 0;

    this.parseOptions(options);

    this.mobileMedia = window.matchMedia(this.options.mobileMatch);

    this.scrollHandler = this.onScroll.bind(this);
    this.resizeHandler = tinybounce(this.calcBounds.bind(this), 150);

    this.calcBounds();

    on(window, 'scroll', this.scrollHandler);
    on(window, 'resize', this.resizeHandler);

    /*
      Prevents a bug on Blink+Webkit in which scroll is always 0 until around
      400 milliseconds due to anchor scrolling features.
     */
    setTimeout(this.onScroll.bind(this), 400);
  }

  parseOptions(options = {}) {
    const {
      stickyOffset,
      stickyContainer,
      stickyClass,
      stickyMobileEnabled,
      stickyMobileMatch
    } = this.el.dataset;

    const containerSelector = options.container || stickyContainer;

    this.options = {
      offset: parseInt(options.offset || stickyOffset, 10) || 0,
      container: containerSelector ? closest(this.el, containerSelector) : this.el.parentElement,
      class: options.class || stickyClass || '',
      mobileEnabled: options.mobileEnabled || stickyMobileEnabled || false,
      mobileMatch: options.mobileMatch || stickyMobileMatch || '(max-width: 767px)'
    };
  }

  /**
   * Scroll handler
   */
  onScroll() {
    const scroll = this.scrollTop();

    if (this.isMobile()) {
      this.transformTop = 0;
      this.el.style.transform = '';

      if (this.options.class) {
        removeClass(this.el, this.options.class);
      }

      return;
    }

    if (scroll < this.start || scroll > this.end) {
      return;
    }

    this.inView();
  }

  /**
   * Fired when the element is visible
   */
  inView() {
    const scroll = this.scrollTop() - this.start;

    if (this.options.class) {
      addClass(this.el, this.options.class);
    }

    requestAnimationFrame(() => {
      this.transformTop = scroll;
      this.el.style.transform = `translate3d(0, ${scroll}px, 0)`;
    });
  }

  /**
   * Calculate element and container boundaries
   */
  calcBounds() {
    const { top: startElTop, height: startElHeight } = this.el.getBoundingClientRect();
    const scrollY = this.scrollTop();
    this.start = startElTop + scrollY - this.transformTop + this.options.offset;

    const { height: endElHeight } = this.options.container.getBoundingClientRect();
    this.end = this.start + (endElHeight - startElHeight);

    this.onScroll();
  }

  /**
   * Returns scrolled distance from top
   */
  scrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  /**
   * Returns whether viewport is mobile or not
   */
  isMobile() {
    return this.mobileMedia.matches;
  }
}

const init = () => {
  const elements = find('[data-sticky]');
  const instances = [];

  elements.forEach(element => instances.push(new Sticky(element)));

  // Fire resize when images are loaded
  on('img', 'load', () => fire(window, 'resize'));

  return instances;
};

if (document.readyState !== 'complete') {
  // Avoid image loading impacting on calculations
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') {
      fire(window, 'resize');
    }
  });
}

ready(init);
