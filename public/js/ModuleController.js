import { BitDepth, Command, HEIGHT, WIDTH } from './constants.js';
import { PortMutex } from './PortMutex.js';

export class ModuleController {
  constructor(bitDepth, logLabel) {
    this.#portMutex = new PortMutex();
    this.#connected = false;
    this.#bitDepth = bitDepth;
    this.#logLabel = logLabel;
  }

  async connect() {
    await this.#portMutex.acquire(async p => {
      try {
        const { usbProductId, usbVendorId } = await p.pickPort();
        this.#connected = true;
        this.#log('Selected port:', p);
        this.#log(`VID:PID ${usbVendorId}:${usbProductId}`);
      } catch (e) {
        if (e.name == 'NotFoundError') {
          this.#log('User cancelled port selection.');
        } else if (e.name == 'InvalidStateError') {
          this.#log('Selected port already in use.');
        } else {
          throw e;
        }
      }
    });
  }

  async getFirmwareVersion() {
    if (!this.#connected) return;

    let ver = {};

    await this.#portMutex.acquire(async p => {
      await p.tx([Command.VERSION]);
      const response = await p.rx();

      // MMMMMMMM mmmmPPPP 0000000p
      ver.major = response[0];
      ver.minor = response[1] >> 4;
      ver.patch = response[1] & 0x0F;
      ver.preRelease = response[2] == 1;
    });

    return ver;
  }

  async setImage(matrix) {
    if (!this.#connected) return;

    if (this.#bitDepth == BitDepth.GRAY_8BIT) {
      const cols = createArray(WIDTH, HEIGHT);
      
      // Transpose & Gamma Correction
      for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
          cols[i][j] = GAMMA[Math.floor((matrix[j][i] ?? 0) * 255)];
        }
      }

      // Only execute the most recent call 
      await this.#portMutex.acquireIdempotent(
        'setImage', 
        async p => {
          for (let i = 0; i < WIDTH; i++) {
            await p.tx([Command.STAGE_GREY_COL, i, ...cols[i]]);
          }
          await p.tx([Command.DRAW_GREY_COL_BUFFER]);
        }
      );
    }

    else if (this.#bitDepth == BitDepth.MONO_1BIT) {
      let index = 0;
      let output = new Uint8Array(39).fill(0);

      // Pack cells into bits
      for (let r = 0; r < HEIGHT; r++) {
        for (let c = 0; c < WIDTH; c++) {
          if (matrix[r][c]) {
            output[index >> 3] |= 1 << index % 8;
          }
          index++;
        }
      }

      await this.#portMutex.acquireIdempotent(
        'setImage', 
        async p => {
          await p.tx([Command.DRAW, ...output]);
        }
      );
    }
  }
  
  static swapPorts(obj1, obj2) {
    // swap ports
    let temp = obj1.#portMutex;
    obj1.#portMutex = obj2.#portMutex;
    obj2.#portMutex = temp;

    // swap connected flag 
    temp = obj1.#connected;
    obj1.#connected = obj2.#connected;
    obj2.#connected = temp
  }
  
  #log(...args) {
    if (!this.disableLogging) {
      console.log(`[LedMatrixModule:${this.#logLabel}]`, ...args);
    }
  }

  #bitDepth
  #connected;
  #logLabel;
  #portMutex;
}
