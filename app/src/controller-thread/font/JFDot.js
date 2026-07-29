import { GlyphTable } from './GlyphTable.js';
import { GlyphTextures } from './GlyphTextures.js';

class JFDot {
  constructor(table, textures) {
    /** @type {GlyphTable} */
    this.#table = table;
    /** @type {GlyphTextures} */
    this.#textures = textures;
  }

  /**
   * @param {string} text 
   * @param {(r: number, c: number, v: number) => null} setter 
   */
  write(text, setter) {
    /** @type {import('./GlyphTable.js').GlyphMetadata} */
    const glyphs = [];
    const spaceBetween = 1;
    let width = 0;
    let height = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      glyphs.push(this.#table.lookup(c || '?') || this.#table.lookup('?'));
      width = Math.max(glyphs[i].width, width);
      height += glyphs[i].height + spaceBetween;
    }

    /** @type {CanvasRenderingContext2D} */
    const ctx = new OffscreenCanvas(width, height).getContext("2d");

    let y = 0; 
    for (let i = 0; i < text.length; i++) {
      this.#textures.draw(glyphs[i], ctx, 0, y);
      y += glyphs[i].height + spaceBetween;
    }

    /** @type {Uint8ClampedArray} */
    const buf = ctx.getImageData(0, 0, width, height).data;
    
    for (let y = 0; y < height; y++) {
      let row = y * width * 4;
      for (let x = 0; x < width; x++) {
        const i = row + x * 4;
        const r = buf[i];
        const g = buf[i + 1];
        const b = buf[i + 2];
        const a = buf[i + 3];
        const v = (a / 255) * (r + g + b) / 3;
        setter(y, x, v);
      }
    }
  }

  #table;
  #textures;
}  

export { JFDot };
