import { GlyphTable } from './GlyphTable.js';
import { GlyphTextures } from './GlyphTextures.js';
import { JFDot } from './JFDot.js';

/**
 * @returns {Promise<JFDot>}
 */
async function loadJfdot() {
  const baseUrl = new URL(`${import.meta.env.BASE_URL}fonts/`, self.location.origin).href;
  const fontName = 'JF-Dot-jiskan16.fnt.json';
  const fontUrl = new URL(fontName, baseUrl).href;
  const imgName = 'JF-Dot-jiskan16-inverted-bitdepth1-spritesheet.png';
  const table = await GlyphTable.load(fontUrl);
  const textures = await GlyphTextures.load(baseUrl, [imgName]);

  return new JFDot(table, textures);
}

export { loadJfdot };
