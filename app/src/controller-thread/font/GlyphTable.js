/**
 * char id=# x=# y=# width=# height=# xoffset=# yoffset=# xadvance=# page=# chnl=#
 * @typedef {object} GlyphMetadata
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} xoffset
 * @property {number} yoffset
 * @property {number} xadvance
 * @property {number} page
 * @property {number} chnl
 */

export class GlyphTable {
  /** @type {Map<number, GlyphMetadata> */
  #glyphs = new Map();

  /**
   * @param {object} fontData Parsed BMFont JSON object
   */
  constructor(fontData) {
    if (Array.isArray(fontData?.chars)) {
      for (const glyph of fontData.chars) {
        this.#glyphs.set(glyph.id, glyph);
      }
    }
  }

  /**
   * Fetches and parses a converted BMFont JSON file.
   * @param {string} url
   * @returns {Promise<GlyphTable>}
   */
  static async load(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load font from "${url}": ${response.status} ${response.statusText}`);
    }

    const fontData = await response.json();
    return new GlyphTable(fontData);
  }

  /**
   * Returns BMFont sprite metadata for a given character.
   * @param {string} char A single Unicode character.
   * @returns {GlyphMetadata | null}
   */
  lookup(char) {
    if (!char) return null;
    const codepoint = char.codePointAt(0);
    return this.#glyphs.get(codepoint) ?? null;
  }
}
