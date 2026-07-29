import { GlyphTable } from './GlyphTable.js';
import { GlyphTextures } from './GlyphTextures.js';
import { JFDot } from './JFDot.js';

/**
 * @returns {Promise<JFDot>}
 */
async function loadJfdot() {
  const baseUrl = '/fonts';
  const imgName = 'JF-Dot-jiskan16-inverted-bitdepth1-spritesheet.png';
  const fntName = 'JF-Dot-jiskan16.fnt.json';
  const table = await GlyphTable.load(`${baseUrl}/${fntName}`);
  const textures = await GlyphTextures.load(baseUrl, [imgName]);

  return new JFDot(table, textures);
}

export { loadJfdot };
