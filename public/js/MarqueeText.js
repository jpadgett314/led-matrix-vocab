import { toGrayscaleMatrix } from './util.js';
import { ScrollEffect } from './effects.js';

async function rasterizeCjkColor(text, w, h, x0, y0, dx, dy, bg, fg, font) {
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.font = font;
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'ideographic';  
  ctx.imageSmoothingEnabled = false;

  await document.fonts.load(font);

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x0 + i * dx, y0 + i * dy);
  }

  return ctx.getImageData(0, 0, w, h);
}

async function rasterizeCjk(text, opts) {
  const fontFamily = opts.fontFamily ?? 'monospace';
  const fontPx = opts.fontPx ?? 16;
  const pitch = opts.pitch ?? 16;
  const direction = opts.direction ?? 'horizontal';
  const bgColor = opts.bgColor ?? 'black';
  const fgColor = opts.fgColor ?? 'white';

  const imageData = await rasterizeCjkColor(
    text,
    direction == 'horizontal' ? pitch * text.length : pitch,
    direction == 'horizontal' ? pitch : pitch * text.length,
    Math.round(pitch / 2),
    Math.round((pitch + fontPx) / 2),
    direction == 'horizontal' ? pitch : 0,
    direction == 'horizontal' ? 0 : pitch,
    bgColor,
    fgColor,
    `${fontPx}px ${fontFamily}`
  );

  return toGrayscaleMatrix(imageData);
}

export class MarqueeText {
  constructor(display) {
    this.#display = display;

    // Best readability on Framework 16 LED Matrix Module    
    this.rasterOptions = {
      fontFamily: 'Shinonome16, jiskan16, "MS Gothic", monospace',
      fontPx: 16,
      pitch: 17,
      direction: 'vertical',
      bgColor: '#000',
      fgColor: '#fff',
    };
    
    this.scrollOptions = {
      fromWidth: this.rasterOptions.pitch,
      fromHeight: this.rasterOptions.pitch,
      toWidth: this.#display.width,
      toHeight: this.#display.height,
      rowsPerSec: 16,
      rowGap: 10,
      columnsPerSec: 0,
      columnGap: 0,
    };
  }

  async load(text) {
    const rasterHeight = this.rasterOptions.pitch * text.length;
    const scrollOptions = {
      ...this.scrollOptions,
      fromHeight: rasterHeight,
    };

    // Vertical scroll only if entire word can't fit
    if (rasterHeight > this.#display.height) {
      scrollOptions.rowGap = 10;
    } else {
      scrollOptions.rowGap = this.#display.height - rasterHeight;
      scrollOptions.rowsPerSec = 0;
    }

    this.#scrollEffect = (async () => {
      const raster = await rasterizeCjk(text, this.rasterOptions);

      return new ScrollEffect(
        scrollOptions,
        (r, c) => raster[r][c] > 0.75 ? 1 : 0,
        (r, c, v) => this.#display.setPixel(r, c, v)
      );
    })();
  }

  async nextFrame() {
    // nextFrame() may be be called before load() is complete
    (await this.#scrollEffect)?.apply();
  }

  #display;
  #scrollEffect;
}
