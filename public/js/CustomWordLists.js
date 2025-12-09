export class CustomWordLists {
  constructor() {
    this.storageKey = 'custom-word-lists';
    this.lists = this.loadLists();
  }

  loadLists() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  saveLists() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.lists));
  }

  createList(name) {
    if (!name || name.trim() === '') {
      throw new Error('List name cannot be empty');
    }

    const id = 'list-' + Date.now();
    this.lists[id] = {
      id,
      name: name.trim(),
      words: [],
      created: new Date().toISOString(),
    };

    this.saveLists();
    return id;
  }

  deleteList(id) {
    if (this.lists[id]) {
      delete this.lists[id];
      this.saveLists();
    }
  }

  getList(id) {
    return this.lists[id];
  }

  getListMetadata() {
    return Object.values(this.lists).map(list => ({
      id: list.id,
      name: list.name,
      wordCount: list.words.length,
    }));
  }

  getRandomWord(id) {
    const list = this.lists[id];
    if (!list || list.words.length === 0) {
      throw new Error('List is empty or not found');
    }
    return list.words[Math.floor(Math.random() * list.words.length)];
  }
}
