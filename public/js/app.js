import { CustomWordLists } from './CustomWordLists.js';
import { WordSources } from './WordSources.js'
import { requestPortForWorker, PortSelectionCancelled } from '../3rd-party/led-matrix-controllers/led-matrix-controllers.browser.mjs';

class LetMatrixVocabApp {
  constructor() {
    this.worker = new Worker('js/controller-thread/worker.js', { type: 'module' });
    this.customLists = new CustomWordLists();
    this.wordSources = new WordSources(this.customLists);
    this.wordSource = this.wordSources.get()[0]; // assume 1st selected
    this.autoUpdate = false;
    this.timeLastUpdated = Date.now();
    this.waitPeriod = 0;
  }

  async init() {
    // Check for Web Serial API support
    if (!('serial' in navigator)) {
      document.getElementById('unsupportedBrowserWarning')
        .style.display = 'block';
      document.querySelectorAll('#connect-btn-1, #connect-btn-2')
        .forEach(btn => btn.disabled = true);
    }

    this.customListSelect = document.getElementById('custom-list-select');
    this.listControls = document.getElementById('list-controls');
    this.listNameInput = document.getElementById('list-name-input');
    this.customListTextarea = document.getElementById('custom-list-textarea');
    this.wordSourceSelect = document.getElementById('word-source-select');
    this.waitPeriod = document.getElementById('delay-input').value;
    this.autoUpdate = document.getElementById('auto-mode-switch').checked;
    this.currentCustomListId = this.customListSelect.value;

    this.worker.onmessage = (e) => {
      if (e.data == 'connect1-success') {
        this.statusGood(0, 'Connected');
      } else if (e.data == 'connect2-success') {
        this.statusGood(1, 'Connected');
      }
    }

    await this.loadWord('単語');

    this.bindEvents();

    this.updateCustomListDropdown();

    this.updateWordSourceDropdown();

    this.startUpdateLoop();
  }

  bindEvents() {
    document.getElementById('connect-btn-1')
      .addEventListener('click', () => this.handleConnectClick(0));
    document.getElementById('connect-btn-2')
      .addEventListener('click', () => this.handleConnectClick(1));
    document.getElementById('swap-ports-btn')
      .addEventListener('click', () => this.handleSwapPorts());
    document.getElementById('new-word-btn')
      .addEventListener('click', () => this.handleNewWord());
    document.getElementById('auto-mode-switch')
      .addEventListener('change', (e) => this.handleAutoModeChange(e));
    document.getElementById('delay-input')
      .addEventListener('change', (e) => this.handleDelayChange(e));
    document.getElementById('word-source-select')
      .addEventListener('change', (e) => this.handleSourceChange(e));
    document.getElementById('add-list-btn')
      .addEventListener('click', () => this.handleAddList());
    document.getElementById('edit-list-btn')
      .addEventListener('click', () => this.handleEditList());
    document.getElementById('delete-list-btn')
      .addEventListener('click', () => this.handleDeleteList());
    document.getElementById('save-list-btn')
      .addEventListener('click', () => this.handleSaveList());
    document.getElementById('cancel-edit-btn')
      .addEventListener('click', () => this.handleCancelEdit());
    this.customListSelect.addEventListener('change',
      (e) => this.handleListChange(e.target.value)
    );

    // Light/Dark Mode 
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.addEventListener('click', (e) => {
        document.documentElement.setAttribute('data-bs-theme',
          e.target.getAttribute('data-bs-theme-value')
        );
      });
    });
  }

  // --- Event Handlers ---

  async handleConnectClick(index) {
    this.statusFail(index, 'Connecting...');
    try {
      await requestPortForWorker();
      this.worker.postMessage({ type: `connect${index + 1}` });
    } catch (error) {
      if (error instanceof PortSelectionCancelled) {
        this.statusFail(index, 'Cancelled Port Selection');
      } else {
        console.error(`Failed to connect to module ${index + 1}:`, error);
        this.statusFail(index);
      }
    }
  }

  async handleSwapPorts() {
    this.worker.postMessage({ type: 'portSwap' });

    // Swap port status HTML
    [
      document.getElementById('status-display-1').innerHTML,
      document.getElementById('status-display-2').innerHTML,
    ] = [
      document.getElementById('status-display-2').innerHTML,
      document.getElementById('status-display-1').innerHTML,
    ];
  }

  async handleNewWord() {
    try {
      const word = await this.wordSource.fetch();
      await this.loadWord(word);
      this.timeLastUpdated = Date.now(); // Reset timer on manual change
    } catch (error) {
      console.error("Failed to fetch or render new word:", error);
      document.getElementById('current-word').innerHTML = "Error";
    }
  }

  handleAutoModeChange(e) {
    this.timeLastUpdated = Date.now();
    this.autoUpdate = e.currentTarget.checked;
  }

  handleDelayChange(e) {
    this.timeLastUpdated = Date.now();
    this.waitPeriod = e.currentTarget.value;
  }

  handleSourceChange(e) {
    const selectedValue = e.currentTarget.value;
    this.wordSource = this.wordSources.get().find(s => s.value === selectedValue);
    this.wordSource ??= this.wordSources.get()[0];
  }

  handleAddList() {
    const id = this.customLists.createList('New List');
    this.currentCustomListId = id;
    this.updateCustomListDropdown();
    this.listNameInput.value = 'New List';
    this.customListTextarea.value = '';
    this.listControls.style.display = 'block';
  }

  handleListChange(id) {
    this.currentCustomListId = id;
    if (id) {
      this.listControls.style.display = 'none';
    }
  }

  handleEditList() {
    if (!this.currentCustomListId) return;
    const list = this.customLists.getList(this.currentCustomListId);
    if (!list) return;
    this.listNameInput.value = list.name;
    this.customListTextarea.value = list.words.join('\n');
    this.listControls.style.display = 'block';
  }

  handleSaveList() {
    if (!this.currentCustomListId) return;

    const list = this.customLists.getList(this.currentCustomListId);
    list.name = this.listNameInput.value.trim() ?? 'Untitled List';
    list.words = this.customListTextarea.value
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    this.customLists.saveLists();

    this.updateCustomListDropdown();
    this.updateWordSourceDropdown();
    this.listControls.style.display = 'none';
  }

  handleCancelEdit() {
    this.listControls.style.display = 'none';
  }

  handleDeleteList() {
    const list = this.customLists.getList(this.currentCustomListId);
    if (!confirm(`Delete list "${list.name}"? This cannot be undone.`)) {
      return;
    }

    this.customLists.deleteList(this.currentCustomListId);
    this.currentCustomListId = null;
    this.updateCustomListDropdown();
    this.updateWordSourceDropdown();
    this.listControls.style.display = 'none';
  }

  // --- Helper Methods ---

  async loadWord(word) {
    this.worker.postMessage({ type: 'word', word });
    document.getElementById('current-word').innerHTML = word;
    document.getElementById('jisho-link')
      .setAttribute('href', `https://jisho.org/search/${word}`);
  }

  statusGood(index, message) {
    document.getElementById(`status-display-${index + 1}`).innerHTML = `
      <span class="status-indicator status-connected"></span>
      <span class="text-muted">${message}</span>
    `;
  }

  statusFail(index, message='Failed to connect') {
    document.getElementById(`status-display-${index + 1}`).innerHTML = `
      <span class="status-indicator status-disconnected"></span>
      <span class="text-muted">${message}</span>
    `;
  }

  updateCustomListDropdown() {
    const lists = this.customLists.getListMetadata();

    this.customListSelect.innerHTML = '';

    if (lists.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No custom lists';
      this.customListSelect.appendChild(option);
      this.listControls.style.display = 'none';
    } else {
      lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = `${list.name} (${list.wordCount} words)`;
        this.customListSelect.appendChild(option);
      });

      // Restore previous selection if it still exists
      if (this.currentCustomListId && this.customLists.getList(this.currentCustomListId)) {
        this.customListSelect.value = this.currentCustomListId;
      } else {
        this.currentCustomListId = this.customListSelect.value;
      }
    }
  }

  updateWordSourceDropdown() {
    const select = this.wordSourceSelect;
    select.innerHTML = '';
    for (const s of this.wordSources.get()) {
      const option = document.createElement('option');
      option.value = s.value;
      option.textContent = s.title;
      select.appendChild(option);
    }
  }

  startUpdateLoop() {
    setInterval(async () => {
      if (this.autoUpdate) {
        const elapsed = (Date.now() - this.timeLastUpdated) / 1000;
        let timeLeftSec = this.waitPeriod - elapsed;
        let timeLeftShown = Math.max(0, Math.round(timeLeftSec));
        
        document.getElementById('countdown-text').innerHTML = 
          `New word in: ${timeLeftShown}s`;

        if (timeLeftSec < 0.5) {
          // This method also resets the timer
          await this.handleNewWord(); 
        }
      }
    }, 1000); 
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new LetMatrixVocabApp();
  await app.init();
});
