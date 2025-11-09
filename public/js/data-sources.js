class OfflineJlptSource {
  static async init() {
    OfflineJlptSource.#words = await $.getJSON(
      'datasets/jlpt-words-by-level.json'
    );
  }

  static async getEntry(filter = () => true) {
    if (!this.#words) await this.init();

    const arr = this.#words.filter(filter);

    if (arr && arr.length > 0) {
      const entry = arr[Math.trunc(Math.random() * arr.length)];
      entry.jp.replaceAll('; ', '・');
      entry.jp.replaceAll(', ', '・');
      return entry;
    } else {
      throw new Error("Invalid word source");
    }
  }

  static #words;
}

class OfflineWikipediaSource {
  static async init() {
    OfflineWikipediaSource.#words = await $.getJSON(
      'datasets/jawiki-2022-08-29.json'
    );
  }

  static async getEntry() {
    if (!this.#words) await this.init();

    const arr = this.#words;
    const len = arr?.length;

    if (arr && len > 0) {
      return arr[Math.trunc(Math.random() * len)];
    } else {
      throw new Error("Invalid word source");
    }
  }

  static #words;
}

class OnlineJlptSource {
  static async init() {
    const url = 'https://jlpt-vocab-api.vercel.app/api/words/random';

    OnlineJlptSource.#cache = (async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
      } else {
        return await res.json();
      }
    })();

    await OnlineJlptSource.#cache;
  }

  static async getEntry() {
    if (!this.#cache) await this.init();

    // getWord() may be called before init()/getWord() returns
    const entry = await this.#cache;
    this.#cache = null;
    this.init();

    return entry;
  }

  static #cache;
}

/*
* Word Source Master List - Add Word Sources Here
*/
const WORD_SOURCES = [
  {
    title: 'JLPT (offline)',
    value: 'jlpt1',
    fetch: async () => (await OfflineJlptSource.getEntry()).jp,
  },
  {
    title: 'Wikipedia Articles',
    value: 'wiki',
    fetch: async () => (await OfflineWikipediaSource.getEntry()).w,
  },
  {
    title: 'JLPT (online)',
    value: 'jlpt2',
    fetch: async () => (await OnlineJlptSource.getEntry()).word,
  },
];  

export function getSources() {
  return WORD_SOURCES;
}
