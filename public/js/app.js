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
      $('#unsupportedBrowserWarning').show();
      $('#connect-btn-1, #connect-btn-2').prop('disabled', true);
    }

    // Populate the word source dropdown
    const $select = $('#word-source-select');
    for (const s of getSources()) {
      $select.append(
        $(`<option value="${s.value}">${s.title}</option>`)
      );
    }

    // Set initial state from DOM
    this.waitPeriod = $('#delay-input').val();
    this.autoUpdate = $('#auto-mode-switch').is(':checked');

    await this.loadWord('単語');

    this.bindEvents();

    this.startUpdateLoop();
  }

  bindEvents() {
    // Connect Buttons
    this.modules.forEach((_, index) => {
      $(`#connect-btn-${index + 1}`).on('click', () => this.handleConnectClick(index));
    });

    // Control Inputs
    $('#swap-ports-btn').on('click', () => this.handleSwapPorts());
    $('#new-word-btn').on('click', () => this.handleNewWord());
    $('#auto-mode-switch').on('change', (e) => this.handleAutoModeChange(e));
    $('#delay-input').on('change', (e) => this.handleDelayChange(e));
    $('#word-source-select').on('change', (e) => this.handleSourceChange(e));

    // Light/Dark Mode 
    $('[data-bs-theme-value]').on('click', (e) => {
      $('html').attr('data-bs-theme', $(e.target).attr('data-bs-theme-value'));
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
        $(buttonSelector).prop('disabled', true);
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
    const status1 = $('#status-display-1').html();
    const status2 = $('#status-display-2').html();
    $('#status-display-1').html(status2);
    $('#status-display-2').html(status1);
  }

  async handleNewWord() {
    try {
      const word = await this.wordSource.fetch();
      await this.loadWord(word);
      this.timeLastUpdated = Date.now(); // Reset timer on manual change
    } catch (error) {
      console.error("Failed to fetch or render new word:", error);
      $('#current-word').html("Error");
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
    const selectedValue = $(e.currentTarget).val();
    this.wordSource = getSources().find(s => s.value === selectedValue);
    this.wordSource ??= getSources()[0];
  }

  // --- Helper Methods ---

  async loadWord(word) {
    this.wordMarquee.load(word);
    $('#current-word').html(word);
    $('#jisho-link').prop('href', `https://jisho.org/search/${word}`);
  }

  statusConnected(index, ver) {
    $(`#status-display-${index + 1}`).html(`
      <span class="status-indicator status-connected"></span>
      <span class="text-muted">Connected! Firmware Ver. ${ver.major}.${ver.minor}.${ver.patch}</span>
    `);
  }

  statusConnecting(index) {
    $(`#status-display-${index + 1}`).html(`
      <span class="status-indicator status-disconnected"></span>
      <span class="text-muted">Connecting...</span>
    `);
  }

  statusFail(index) {
    $(`#status-display-${index + 1}`).html(`
      <span class="status-indicator status-disconnected"></span>
      <span class="text-muted">Failed to connect</span>
    `);
  }

  startUpdateLoop() {
    // Check/update word update timer
    setInterval(async () => {
      if (this.autoUpdate) {
        const elapsed = (Date.now() - this.timeLastUpdated) / 1000;
        let timeLeftSec = this.waitPeriod - elapsed;
        let timeLeftShown = Math.max(0, Math.round(timeLeftSec));

        $('#countdown-text').html(`New word in: ${timeLeftShown}s`);

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
$(async function() {
  const app = new LetMatrixVocabApp();
  await app.init();
});
