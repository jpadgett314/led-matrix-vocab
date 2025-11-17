import { getSources } from './data-sources.js'
import { BitDepth } from './constants.js';
import { DisplayBuffer } from './DisplayBuffer.js';
import { DisplayBufferPair } from './DisplayBufferPair.js';
import { MarqueeText } from './MarqueeText.js';
import { ModuleController } from './ModuleController.js';

class LetMatrixVocabApp {
  constructor() {
    this.modules = [
      new ModuleController(BitDepth.MONO_1BIT, 'left'),
      new ModuleController(BitDepth.MONO_1BIT, 'right')
    ];

    this.buffers = [
      new DisplayBuffer([this.modules[0]]),
      new DisplayBuffer([this.modules[1]])
    ];

    this.display = new DisplayBufferPair(
      this.buffers[0], 
      this.buffers[1]
    );

    // Application state
    this.autoUpdate = false;
    this.timeLastUpdated = Date.now();
    this.waitPeriod = 0;
    this.wordSource = getSources()[0]; // assume 1st selected
    this.wordMarquee = new MarqueeText(this.display);
  }

  async init() {
    // Check for Web Serial API support
    if (!('serial' in navigator)) {
      document.getElementById('unsupportedBrowserWarning')
        .style.display = 'block';
      document.querySelectorAll('#connect-btn-1, #connect-btn-2')
        .forEach(btn => btn.disabled = true);
    }

    // Populate the word source dropdown
    const select = document.getElementById('word-source-select');
    for (const s of getSources()) {
      const option = document.createElement('option');
      option.value = s.value;
      option.textContent = s.title;
      select.appendChild(option);
    }

    // Set initial state from DOM
    this.waitPeriod = document.getElementById('delay-input').value;
    this.autoUpdate = document.getElementById('auto-mode-switch').checked;

    await this.loadWord('単語');

    this.bindEvents();

    this.startUpdateLoop();
  }

  bindEvents() {
    // Connect Buttons
    this.modules.forEach((_, index) => {
      document.getElementById(`connect-btn-${index + 1}`)
        .addEventListener('click', () => this.handleConnectClick(index));
    });

    // Control Inputs
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

    // Light/Dark Mode 
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.addEventListener('click', (e) => {
        document.documentElement.setAttribute('data-bs-theme', e.target.getAttribute('data-bs-theme-value'));
      });
    });
  }

  // --- Event Handlers ---

  async handleConnectClick(index) {
    const module = this.modules[index];
    const buffer = this.buffers[index];
    const buttonSelector = `#connect-btn-${index + 1}`;

    this.statusConnecting(index);

    try {
      await module.connect();
      const ver = await module.getFirmwareVersion();
      if (ver) {
        this.statusConnected(index, ver);
        document.querySelector(buttonSelector).disabled = true;
        await buffer.clear();
      } else {
        throw new Error('No firmware version received.');
      }
    } catch (error) {
      console.error(`Failed to connect to module ${index + 1}:`, error);
      this.statusFail(index);
    }
  }

  async handleSwapPorts() {
    ModuleController.swapPorts(...this.modules);

    await this.display.forceTx();

    // Swap port status HTML
    const status1 = document.getElementById('status-display-1').innerHTML;
    const status2 = document.getElementById('status-display-2').innerHTML;
    document.getElementById('status-display-1').innerHTML = status2;
    document.getElementById('status-display-2').innerHTML = status1;
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
    this.wordSource = getSources().find(s => s.value === selectedValue);
    this.wordSource ??= getSources()[0];
  }

  // --- Helper Methods ---

  async loadWord(word) {
    this.wordMarquee.load(word);
    document.getElementById('current-word').innerHTML = word;
    document.getElementById('jisho-link')
      .setAttribute('href', `https://jisho.org/search/${word}`);
  }

  statusConnected(index, ver) {
    document.getElementById(`status-display-${index + 1}`).innerHTML = `
      <span class="status-indicator status-connected"></span>
      <span class="text-muted">Connected! Firmware Ver. ${ver.major}.${ver.minor}.${ver.patch}</span>
    `;
  }

  statusConnecting(index) {
    document.getElementById(`status-display-${index + 1}`).innerHTML = `
      <span class="status-indicator status-disconnected"></span>
      <span class="text-muted">Connecting...</span>
    `;
  }

  statusFail(index) {
    document.getElementById(`status-display-${index + 1}`).innerHTML = `
      <span class="status-indicator status-disconnected"></span>
      <span class="text-muted">Failed to connect</span>
    `;
  }

  startUpdateLoop() {
    // Check/update word update timer
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
    
    // Update word animation frame. Throttles to 1hz when focus is lost.
    setInterval(async () => {
      if (this.wordMarquee) {
        await this.wordMarquee.nextFrame();
        await this.display.flush();
      }
    }, 50);
  }
}

// --- Run App ---
document.addEventListener('DOMContentLoaded', async () => {
  const app = new LetMatrixVocabApp();
  await app.init();
});
