import { HEIGHT, WIDTH } from './constants.js';
import { createArray } from './util.js';

export class DisplayBuffer {
  constructor(sinks) {
    this.#buffer = createArray(HEIGHT, WIDTH);
    this.#dirty = true;
    this.#optimizationEnabled = true;
    this.#sinks = sinks;
  }

  setPixel(r, c, val) {
    if (this.#buffer[r][c] != val) {
      this.#buffer[r][c] = val;
      this.#dirty = true;
    }
  }

  async clear() {
    this.#buffer = createArray(HEIGHT, WIDTH);
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
        this.#sinks.map(sink =>
          typeof sink.setImage === 'function'
            ? sink.setImage(this.#buffer)
            : Promise.reject('No "setImage" method:', sink)
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
  #sinks;
}
