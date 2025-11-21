export class PortMutex {
  constructor(portOperations) {
    this.#lockName = `port-mutex-${Math.random().toString()}`;
    this.#deduper = new Map();
    this.#portOps = portOperations;
  }

  async acquire(fn) {
    const trace = new Error('created bad cb').stack;

    await this.#enqueue(async () => {
      try {
        await fn(this.#portOps);
      } catch (e) {
        console.error('Error occured in anonymous callback.');
        console.error('Original error:', e);
        console.error('--- This callback was created at ---\n', trace);
      }
    });
  }

  async acquireIdempotent(key, fn) {
    const trace = new Error('created bad cb').stack;

    if  (this.#deduper.has(key)) {
      console.info(`"${key}" request coalesced.`);
    }

    this.#deduper.set(key, async () => {
      try {
        await fn(this.#portOps);
      } catch (e) {
        console.error('Error occured in anonymous callback.');
        console.error('Original error:', e);
        console.error('--- This callback was created at ---\n', trace);
      }
    });

    await this.#enqueue(() => this.#execDedupedOp(key));
  }

  async #enqueue(fn) {
    // `navigator.locks` maintains queue and provides mutual exclusion.
    return navigator.locks.request(this.#lockName, fn);
  }

  async #execDedupedOp(key) {
    if (this.#deduper.has(key)) {
      const fn = this.#deduper.get(key);
      this.#deduper.delete(key);
      await fn();
    }
  }

  #lockName;
  #deduper;
  #portOps;
}
