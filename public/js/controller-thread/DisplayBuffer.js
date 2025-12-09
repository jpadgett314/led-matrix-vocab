import { HEIGHT, WIDTH } from '../../3rd-party/led-matrix-controllers/led-matrix-controllers.browser.mjs';

const createMatrix = (r, c) => [...Array(r)].map(() => Array(c).fill(0));

export class DisplayBuffer {
  constructor() {
    this.#buffer = createMatrix(HEIGHT, WIDTH);
    this.#dirty = true;
    this.#optimizationEnabled = true;
    this.sinks = [];
  }

  setPixel(r, c, val) {
    if (this.#buffer[r][c] != val) {
      this.#buffer[r][c] = val;
      this.#dirty = true;
    }
  }

  async clear() {
    this.#buffer = createMatrix(HEIGHT, WIDTH);
    this.#dirty = true;
    await this.flush();
  }

  async flush() {
    if (this.#dirty || !this.#optimizationEnabled) {
      /* 
       * The buffer lacks mutual exclusion, so it could be modified externally
       * after flushing it, but before clearing `dirty`. This scenario is 
       * avoided by clearing `dirty` before flushing the buffer. 
       */
      this.#dirty = false;

      // Update sinks concurrently
      await Promise.all(
        this.sinks.map(sink =>
          typeof sink.draw === 'function'
            ? sink.draw(this.#buffer)
            : Promise.reject('No "draw" method:', sink)
        )
      );
    }
  }

  async forceTx() {
    const temp1 = this.#optimizationEnabled;
    const temp2 = this.#dirty;
    this.#optimizationEnabled = false;
    this.#dirty = true;

    // Guaranteed to trigger TX
    await this.flush();

    this.#optimizationEnabled = temp1;
    this.#dirty = temp2
  }

  #buffer;
  #dirty;
  #optimizationEnabled;
}
