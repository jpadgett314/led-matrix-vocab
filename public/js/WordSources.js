async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    return await response.json();
  }
}

class OfflineJlptSource {
  static async init() {
    OfflineJlptSource.#entries = await fetchJson(
      'datasets/jlpt-words-by-level.json'
    );

    const lvls = Object.groupBy(OfflineJlptSource.#entries, e => e.lvl);
    OfflineJlptSource.#n1 = lvls.N1;
    OfflineJlptSource.#n2 = lvls.N2;
    OfflineJlptSource.#n3 = lvls.N3;
    OfflineJlptSource.#n4 = lvls.N4;
    OfflineJlptSource.#n5 = lvls.N5;
  }

  static async getEntry(level = null) {
    if (!this.#entries) await this.init();

    let arr = this.#entries;

    if (level == 'N1') {
      arr = OfflineJlptSource.#n1;
    } else if (level == 'N2') {
      arr = OfflineJlptSource.#n2;
    } else if (level == 'N3') {
      arr = OfflineJlptSource.#n3;
    } else if (level == 'N4') {
      arr = OfflineJlptSource.#n4;
    } else if (level == 'N5') {
      arr = OfflineJlptSource.#n5;
    }

    let len = arr?.length;

    if (arr && len > 0) {
      const entry = arr[Math.trunc(Math.random() * len)];
      entry.jp.replaceAll('; ', '・');
      entry.jp.replaceAll(', ', '・');
      return entry;
    } else {
      throw new Error("Invalid word source");
    }
  }

  static #entries;
  static #n1;
  static #n2;
  static #n3;
  static #n4;
  static #n5;
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
    title: 'JLPT N1',
    value: 'jlpt-n1',
    fetch: async () => (await OfflineJlptSource.getEntry('N1')).jp,
  },
  {
    title: 'JLPT N2',
    value: 'jlpt-n2',
    fetch: async () => (await OfflineJlptSource.getEntry('N2')).jp,
  },
  {
    title: 'JLPT N3',
    value: 'jlpt-n3',
    fetch: async () => (await OfflineJlptSource.getEntry('N3')).jp,
  },
  {
    title: 'JLPT N4',
    value: 'jlpt-n4',
    fetch: async () => (await OfflineJlptSource.getEntry('N4')).jp,
  },
  {
    title: 'JLPT N5',
    value: 'jlpt-n5',
    fetch: async () => (await OfflineJlptSource.getEntry('N5')).jp,
  },
  {
    title: 'JLPT (all)',
    value: 'jlpt1',
    fetch: async () => (await OfflineJlptSource.getEntry()).jp,
  },
  // {
  //   title: 'JLPT (online)',
  //   value: 'jlpt2',
  //   fetch: async () => (await OnlineJlptSource.getEntry()).word,
  // },
  {
    title: 'Wikipedia Articles',
    value: 'wiki',
    fetch: async () => (await OfflineWikipediaSource.getEntry()).w,
  },
];

export class WordSources {
  constructor(customLists) {
    this.#customLists = customLists;
  }

  get() {
    return [
      ...WORD_SOURCES, 
      ...this.#customLists.getListMetadata().map(list => ({
        title: `Custom List: ${list.name}`,
        value: `custom-${list.id}`,
        fetch: async () => this.#customLists.getRandomWord(list.id)
      }))
    ];
  }

  #customLists
}
