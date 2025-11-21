export class PortOperations {
  constructor(port) {
    this.#port = port;
  }

  async rx(length, timeout=3000) {
    if (this.#port === null) {
      throw new Error('attempted RX before port initialization.');
    }

    /*
     * ReadableStream's built-in locking mechanism cannot be awaited or otherwise
     * asynchronously acquired. A PortMutex must be used.
     */
    if (this.#port.readable.locked) {
      throw new Error('attempted RX while port locked.');
    }

    const response = [];
    const reader = this.#port.readable.getReader();
    const timeoutHandle = setTimeout(() => reader.cancel(), timeout);

    try {
      // Response may be divided across multiple reads
      while (response.length < length) {
        const { value, done } = await reader.read();
        response.push(...(value ?? []));
        if (done || !value) break;
      }
    } finally {
      clearTimeout(timeoutHandle);
      reader.releaseLock();
    }

    return response;
  }

  async tx(buffer) {
    if (this.#port === null) {
      throw new Error('attempted TX before port initialization.');
    }
    
    /*
     * WritableStream's built-in locking mechanism cannot be awaited or otherwise
     * asynchronously acquired. A PortMutex must be used.
     */
    if (this.#port.writable.locked) {
      throw new Error('attempted TX while port locked.');
    }

    const writer = this.#port.writable.getWriter();

    try {
      await writer.write(new Uint8Array(buffer));
    } finally {
      /* 
       * The writer must be completely torn down between every single write.
       * Many parsers can't handle delayed flushing and write coalescing.
       * Command sequences will fail if `releaseLock()` is used here.
       */
      await writer.close();
    }
  }

  #port;
}
