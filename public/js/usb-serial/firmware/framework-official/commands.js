// All replies to all commands are 32 bytes
export const RX_PACKET_SZ = 32;

export const Command = Object.freeze({
  ANIMATE: 0x04,
  BRIGHTNESS: 0x00,
  BOOTLOADER: 0x02,
  DRAW: 0x06,
  DRAW_GREY_COL_BUFFER: 0x08,
  GAME_CTRL: 0x11,
  GAME_STATUS: 0x12,
  PANIC: 0x05,
  PATTERN: 0x01,
  SLEEP: 0x03,
  STAGE_GREY_COL: 0x07,
  START_GAME: 0x10,
  VERSION: 0x20,
});

// Used with Command.PATTERN
export const Pattern = Object.freeze({
  DISPLAY_LOTUS_HORIZONTAL: 0x03,
  DISPLAY_LOTUS_VERTICAL: 0x07,
  DISPLAY_PANIC: 0x06,
  DOUBLE_GRADIENT: 0x02,
  FULL_BRIGHTNESS: 0x05,
  GRADIENT: 0x01,
  PERCENTAGE: 0x00,
  ZIG_ZAG: 0x04,
});

// DRAW vs DRAW_GREY_COL_BUFFER?
export const BitDepth = Object.freeze({
  GRAY_8BIT: { text: '8-bit Grayscale' },
  MONO_1BIT: { text: '1-bit Monochrome' },
})
