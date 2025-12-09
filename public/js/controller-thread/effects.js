export class ScrollEffect {
  /**
   * @param {Object} options - Scroll Effect options
   * @param {number} options.fromWidth - # columns in source buffer
   * @param {number} options.fromHeight - # rows is source buffer
   * @param {number} options.toWidth - # columns in dest buffer
   * @param {number} options.toHeight - # rows in dest buffer
   * @param {number} options.rowsPerSec - horizontal scroll speed
   * @param {number} options.rowGap - # rows between tiled images
   * @param {number} options.columnsPerSec - vertical scroll speed
   * @param {number} options.columnGap - columns between tiled images
   * @param {function} get - source img reader (r, c) => {}
   * @param {function} set - dest img writer (r, c, v) => {}
  */ 
  constructor(options, get, set) {
    this.#options = options;
    this.#get = get;
    this.#set = set;
    this.#t0 = Date.now();
  }

  apply() {
    const o = this.#options;
    
    const dt = (Date.now() - this.#t0) / 1000;

    const _get = (r, c) => {
      r += Math.round(o.rowsPerSec * dt);
      r %= o.fromHeight + o.rowGap;
      c += Math.round(o.columnsPerSec * dt);
      c %= o.fromWidth + o.columnGap;

      if (r >= o.fromHeight) {
        return 0.0;
      } else if (c >= o.fromWidth) {
        return 0.0;
      } else {
        return this.#get(r, c);
      }
    }

    for (let r = 0; r < o.toHeight; r++) {
      for (let c = 0; c < o.toWidth; c++) {
        this.#set(r, c, _get(r, c));
      }
    }
  }

  #options;
  #get;
  #set;
  #t0;
}

export class StrobeEffect {
  /**
   * @param {Object} options - Strobe Effect options
   * @param {number} options.width - buffer width
   * @param {number} options.height - buffer height
   * @param {number} options.secondsOn - duration inverted
   * @param {number} options.secondsOff - duration not inverted
   * @param {function} get - source img reader (r, c) => {}
   * @param {function} set - dest img writer (r, c, v) => {}
   */ 
  constructor(options, get, set) {
    this.#options = options;
    this.#get = get;
    this.#set = set;
    this.#t0 = Date.now();
  }

  apply() {
    const o = this.#options;
    const dt = (Date.now() - this.#t0) / 1000;
    const on = (dt % (o.secondsOn + o.secondsOff)) > o.secondsOn;

    if (on) {
      for (let r = 0; r < o.height; r++) {
        for (let c = 0; c < o.width; c++) {
          this.#set(r, c, 1 - this.#get(r, c));          
        }
      }      
    } else {
      for (let r = 0; r < o.height; r++) {
        for (let c = 0; c < o.width; c++) {
          this.#set(r, c, this.#get(r, c));
        }
      }
    }
  }

  #options
  #get;
  #set;
  #t0
}
