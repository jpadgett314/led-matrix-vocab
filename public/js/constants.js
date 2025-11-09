export const WIDTH = 9;
export const HEIGHT = 34;
export const VID = 0x32AC;
export const VID_ARR = [0x32, 0xAC];
export const PID = 0x0020;
export const PID_ARR = [0x00, 0x20];

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

export const BitDepth = Object.freeze({
  GRAY_8BIT: { text: '8-bit Grayscale' },
  MONO_1BIT: { text: '1-bit Monochrome' },
});

export const GAMMA = Object.freeze([
  0, 0, 0, 0, 0, 0, 0, 1, 
  1, 1, 1, 1, 1, 1, 1, 1, 
  1, 1, 1, 1, 1, 1, 1, 1, 
  1, 1, 1, 1, 1, 1, 1, 1, 
  1, 1, 1, 2, 2, 2, 2, 2, 
  2, 2, 2, 2, 3, 3, 3, 3, 
  3, 3, 3, 4, 4, 4, 4, 4, 
  4, 5, 5, 5, 5, 6, 6, 6, 
  6, 6, 7, 7, 7, 7, 8, 8, 
  8, 9, 9, 9, 10, 10, 10, 11, 
  11, 11, 12, 12, 12, 13, 13, 14, 
  14, 14, 15, 15, 16, 16, 17, 17, 
  17, 18, 18, 19, 19, 20, 20, 21, 
  22, 22, 23, 23, 24, 24, 25, 26, 
  26, 27, 27, 28, 29, 29, 30, 31, 
  32, 32, 33, 34, 34, 35, 36, 37, 
  38, 38, 39, 40, 41, 42, 42, 43, 
  44, 45, 46, 47, 48, 49, 50, 51, 
  52, 53, 54, 55, 56, 57, 58, 59, 
  60, 61, 62, 63, 64, 66, 67, 68, 
  69, 70, 71, 73, 74, 75, 76, 78, 
  79, 80, 82, 83, 84, 86, 87, 88, 
  90, 91, 93, 94, 96, 97, 99, 100, 
  102, 103, 105, 106, 108, 110, 111, 113, 
  115, 116, 118, 120, 121, 123, 125, 127, 
  128, 130, 132, 134, 136, 138, 140, 141, 
  143, 145, 147, 149, 151, 153, 155, 157, 
  159, 161, 164, 166, 168, 170, 172, 174, 
  177, 179, 181, 183, 186, 188, 190, 193, 
  195, 197, 200, 202, 205, 207, 210, 212, 
  215, 217, 220, 222, 225, 228, 230, 233, 
  236, 238, 241, 244, 247, 249, 252, 255
]);
