// import { createArray } from '../../../util.js';
import { GAMMA } from '../../../hardware.js';
import { Command, IDENT_STR_LEN, IDENT_STR_REGEX } from './commands.js';

export class CommandAbstractionLayer {
  constructor(portMutex) {
    this.#portMutex = portMutex;
  }

  async verifyFirmware() {
    let ident = null;

    await this.#portMutex.acquire(async p => {
      await p.tx([Command.IDENT]);
      ident = await p.rx(IDENT_STR_LEN);
    });

    ident = String.fromCharCode(...ident);

    return ident.match(IDENT_STR_REGEX);
  }

  async version() {
    let ident = null;

    await this.#portMutex.acquire(async p => {
      await p.tx([Command.IDENT]);
      ident = await p.rx(IDENT_STR_LEN);
    });

    ident = String.fromCharCode(...ident);

    const match = ident.match(IDENT_STR_REGEX);

    if (match && match.length == 3) {
      return {
        major: match[1],
        minor: match[2]
      }
    } else {
      return null;
    }
  }

  async draw(matrix) {
    if (!this.#scaleInitialized) {
      await this.#portMutex.acquire(
        async p => {
          await p.tx([Command.SET_CONST_SCALE, 0x20]);
        }
      );
      this.#scaleInitialized = true;
    }

    const bytes = matrix.flat().map(v => 
      GAMMA[Math.floor((v ?? 0) * 255)]
    );

    // Only execute the most recent call 
    await this.#portMutex.acquireIdempotent(
      'drawMatrix', 
      async p => {
        await p.tx([Command.DRAW_PWM, ...bytes]);
      }
    );
  }

  #portMutex;
  #scaleInitialized;
}
