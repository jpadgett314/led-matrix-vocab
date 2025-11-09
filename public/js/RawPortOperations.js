import { RX_PACKET_SZ, VID, VID_ARR } from './constants.js';

export class RawPortOperations {
  constructor() {
    this.#port = null;
  }

  async pickPort() {
    this.#port = await navigator.serial.requestPort({
      filters: [{ usbVendorId: VID }]
    });

    if (this.#port.connected) {
      await this.#port.open({ baudRate: 115200 });
    }

    return this.#port.getInfo();
  }

  async rx() {
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

    const packet = [];
    const reader = this.#port.readable.getReader();
    const timeout = setTimeout(() => reader.cancel(), 5000);

    try {
      // Response may be divided across multiple reads
      while (packet.length < RX_PACKET_SZ) {
        const { value, done } = await reader.read();
        packet.push(...(value ?? []));
        if (done || !value) break;
      }
    } finally {
      clearTimeout(timeout);
      reader.releaseLock();
    }

    return packet;
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
      const bytes = [...VID_ARR, ...buffer];
      const data = new Uint8Array(bytes);
      await writer.write(data);
    } finally {
      /* 
       * The writer must be completely torn down between every single write.
       * Some parsers can't handle delayed flushing and write coalescing.
       * Command sequences will fail if `releaseLock()` is used here.
       */
      await writer.close();
    }
  }

  #port;
}
