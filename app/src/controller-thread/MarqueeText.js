import { ScrollEffect } from './effects.js';
import { JFDot } from './font/JFDot.js';
import { loadJfdot } from './font/load-jfdot.js';

export class MarqueeText {
  constructor(display) {
    this.#display = display;;
    
    this.scrollOptions = {
      toWidth: this.#display.width,
      toHeight: this.#display.height,
      rowsPerSec: 16,
      rowGap: 10,
      columnsPerSec: 0,
      columnGap: 2,
    };

    this.#jfdot = null;
  }

  async load(text) {
    const rasterHeight = 17 * text.length;
    const rasterWidth = 16;

    const scrollOptions = {
      ...this.scrollOptions,
      fromWidth: rasterWidth,
      fromHeight: rasterHeight,
    };

    // Vertical scroll only if entire word can't fit
    if (rasterHeight > this.#display.height) {
      scrollOptions.rowGap = 10;
    } else {
      scrollOptions.rowGap = this.#display.height - rasterHeight;
      scrollOptions.rowsPerSec = 0;
    }

    /** @type {JFDot} */
    this.#jfdot = await loadJfdot();

    this.#scrollEffect = (async () => {
      const raster = [...Array(rasterHeight)].map(() => Array(rasterWidth).fill(0));

      this.#jfdot.write(text, (r, c, v) => raster[r][c] = v);

      return new ScrollEffect(
        scrollOptions,
        (r, c) => raster[r][c] > 0.50 ? 1 : 0,
        (r, c, v) => this.#display.setPixel(r, c + 1, v)
      );
    })();
  }

  async nextFrame() {
    // nextFrame() may be be called before load() is complete
    (await this.#scrollEffect)?.apply();
  }

  #jfdot;
  #display;
  #scrollEffect;
}
