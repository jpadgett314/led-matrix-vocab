export class GlyphTextures {
  /** @type {ImageBitmap[]} */
  #pages = [];

  constructor(pages) {
    this.#pages = pages;
  }

  /**
   * Loads BMFont atlas pages.
   * @param {string} baseUrl Directory containing the atlas images.
   * @param {string[]} filenames font.pages
   * @returns {Promise<GlyphTextures>}
   */
  static async load(baseUrl, filenames) {
    const pages = await Promise.all(
      filenames.map(async (filename) => {
        const response = await fetch(`${baseUrl}/${filename}`);
        const blob = await response.blob();
        return await createImageBitmap(blob);
      })
    );

    return new GlyphTextures(pages);
  }

  /**
   * Draws glyph sprite according to sprite metadata.
   * @param {object} metadata 
   * @param {CanvasRenderingContext2D} context 
   * @param {number} x0 
   * @param {number} y0 
   */
  draw(metadata, context, x0, y0) {
    context.drawImage(
      this.#pages[metadata.page],
      metadata.x,
      metadata.y,
      metadata.width,
      metadata.height,
      metadata.xoffset + x0,
      metadata.yoffset + y0,
      metadata.width,
      metadata.height
    );
  }
}
