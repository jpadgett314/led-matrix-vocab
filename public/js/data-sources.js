import { fetchJson } from "./util.js";

class OfflineJlptSource {
  static async init() {
    OfflineJlptSource.#words = await fetchJson(
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
    OfflineWikipediaSource.#words = await fetchJson(
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

    OnlineJlptSource.#cache = (async () => fetchJson(url))();

    await OnlineJlptSource.#cache;
  }

  static async getEntry() {
    if (!this.#cache) await this.init();

    // getEntry() may be called before init()/getWord() returns
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
