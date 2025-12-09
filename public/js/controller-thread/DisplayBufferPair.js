import { HEIGHT, WIDTH } from '../../3rd-party/led-matrix-controllers/led-matrix-controllers.browser.mjs';

export class DisplayBufferPair {
  constructor(bufferLeft, bufferRight) {
    this.width = 2 * WIDTH;
    this.height = HEIGHT;
    this.#bufferLeft = bufferLeft;
    this.#bufferRight = bufferRight;
  }

  setPixel(r, c, val) {
    if (c < WIDTH) {
      this.#bufferLeft.setPixel(r, c, val);
    } else {
      this.#bufferRight.setPixel(r, c - WIDTH, val);
    }
  }

  async swap() {
    let temp = this.#bufferLeft.sinks;
    this.#bufferLeft.sinks = this.#bufferRight.sinks;
    this.#bufferRight.sinks = temp;
    await this.forceTx();
  }

  async clear() {
    await Promise.all([
      this.#bufferLeft.clear(),
      this.#bufferRight.clear()
    ]);
  }

  async flush() {
    await Promise.all([
      this.#bufferLeft.flush(),
      this.#bufferRight.flush()
    ]);
  }

  async forceTx() {
    await Promise.all([
      this.#bufferLeft.forceTx(),
      this.#bufferRight.forceTx()
    ]);
  }

  #bufferLeft;
  #bufferRight;
}
