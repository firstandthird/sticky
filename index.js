import { ready, fire, find, findOne, closest, on, off } from 'domassist';
import tinybounce from 'tinybounce';
import aug from 'aug';

const Events = {
  Enter: 'sticky:enter',
  Leave: 'sticky:leave'
};

class Sticky {
  constructor(el, options = {}) {
    this.el = findOne(el);

    const {
      stickyOffset: offset,
      stickyTarget: target,
      stickyContainer: container,
      stickyMatchMedia: matchMedia
    } = this.el.dataset;

    this.options = aug({
      offset: parseInt(offset || 0, 10),
      target,
      container,
      matchMedia: window.matchMedia(matchMedia || '(min-width: 768px)')
    }, options);

    this.targets = [];

    this.options.container = this.options.container ? closest(this.el, this.options.container) : this.el.parentElement;

    find(this.options.target).forEach(targetEl => {
      const { top, height } = targetEl.getBoundingClientRect();

      this.targets.push({
        el: targetEl,
        top: this.scrollTop() + top - height
      });
    });

    this.transformTop = 0;
    this.current = null;

    this.scrollHandler = this.onScroll.bind(this);
    this.resizeHandler = tinybounce(this.onResize.bind(this), 150);

    this.init();

    return this.el;
  }

  init() {
    this.calcBounds();

    if ('IntersectionObserver' in window) {
      // eslint-disable-next-line compat/compat
      this.observer = new IntersectionObserver(this.onIntersect.bind(this));
      this.observer.observe(this.el);
    } else {
      this.addListeners();
    }
  }

  /**
   * Attach event listeners
   *
   */
  addListeners() {
    on(window, 'scroll', this.scrollHandler);
    on(window, 'resize', this.resizeHandler);
  }

  /**
   * Destroy event listeners
   *
   */
  destroyListeners() {
    off(window, 'resize');
    off(window, 'scroll');
  }

  /**
   * Resets variables and styles applied by this module
   *
   */
  clearTransfoms() {
    this.transformTop = 0;

    requestAnimationFrame(() => this.el.removeAttribute('style'));
  }

  /**
   * Resize handler
   *
   */
  onResize() {
    if (this.matchesMedia()) {
      this.calcBounds();
    } else {
      this.clearTransfoms();
      this.destroyListeners();

      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  /**
   * Determines whether the matchMedia settings matches the viewport size or not
   *
   * @returns {boolean}
   */
  matchesMedia() {
    return this.options.matchMedia.matches;
  }

  /**
   * Scroll handler
   *
   */
  onScroll() {
    const scrollTop = this.scrollTop();

    if (scrollTop < this.startPosition || scrollTop > this.endPosition) {
      return;
    }

    const scroll = scrollTop - this.startPosition;

    requestAnimationFrame(() => {
      this.transformTop = scroll;
      this.el.style.transform = `translate3d(0, ${scroll}px, 0)`;
    });

    if (!this.targets.length) {
      return;
    }

    const [targetEl] = this.targets.filter(target => scrollTop >= target.top).slice(-1);

    if (targetEl && targetEl.el !== this.current) {
      fire(this.el, Events.Leave, { detail: this.current });
      fire(this.el, Events.Enter, { detail: targetEl.el });

      this.current = targetEl.el;

      this.inView({ el: this.el, target: this.current });
    }
  }

  /**
   * On intersect handler
   *
   * @param {array} entries Observed items
   */
  onIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.addListeners();
      } else {
        this.destroyListeners();
      }
    });
  }

  /**
   * Called upon element it's visible
   *
   * @interface
   * @param {HTMLElement} element Current target element
   */
  inView() {}

  /**
   * Calculate element boundaries
   *
   */
  calcBounds() {
    const scrollY = this.scrollTop();
    const { top: startElTop, height: startElHeight } = this.el.getBoundingClientRect();
    const { height: endElHeight } = this.options.container.getBoundingClientRect();

    this.startPosition = startElTop + scrollY - this.transformTop + this.options.offset;
    this.endPosition = this.startPosition + (endElHeight - startElHeight);

    this.targets = this.targets.map(({ el }) => {
      const { top } = el.getBoundingClientRect();

      return {
        el,
        top: scrollY + top - (startElHeight / 2)
      };
    });
  }

  /**
   * Returns the number of pixels the page is currently vertically scrolled
   *
   * @returns {number}
   */
  scrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}

const init = () => {
  const elements = find('[data-sticky]');
  const instances = [];

  elements.forEach(element => instances.push(new Sticky(element)));
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

export { Events, Sticky };
