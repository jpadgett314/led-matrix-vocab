export const Command = Object.freeze({
  /* 000 */ NOOP: 0x00,
  /* 'd' */ ANIM_DIAMOND: 0x64,
  /* 'b' */ ANIM_FIRE: 0x62,
  /* 'f' */ ANIM_FIREPLACE: 0x66,
  /* 'g' */ ANIM_GEAR: 0x67,
  /* 'r' */ ANIM_RING: 0x72,
  /* 'a' */ ANIM_STARTUP: 0x61,
  /* 'A' */ ANIM_STARTUP_ONCE: 0x41,
  /* 'e' */ BOOTLOADER: 0x65,
  /* 'm' */ DRAW_PWM: 0x6D,
  /* 'M' */ DRAW_PWM_BLOCKING: 0x4D,
  /* 'n' */ DRAW_SCALE: 0x6E,
  /* 'N' */ DRAW_SCALE_BLOCKING: 0x4E,
  /* 'c' */ FLUSH_CMD_QUEUE: 0x63,
  /* 't' */ TEST_PATTERN: 0x74,
  /* 'w' */ SET_CONST_PWM: 0x77,
  /* 's' */ SET_CONST_SCALE: 0x73,
  /* 'p' */ SET_PX_PWM: 0x70,
  /* 'q' */ SET_PX_SCALE: 0x71,
  /* 127 */ IDENT: 0x7F,
});

export const IDENT_STR_LEN = 25;

export const IDENT_STR_REGEX = /^Sig\sFW\sLED\sMatrix\sFW\sV(\d+)\.(\d+)$/;

export const IDENT_STR_PREFIX = 'Sig FW LED Matrix FW';
