import { DisplayBuffer } from './DisplayBuffer.js';
import { DisplayBufferPair } from './DisplayBufferPair.js';
import { MarqueeText } from './MarqueeText.js';
import { DefaultController } from '../../3rd-party/led-matrix-controllers/led-matrix-controllers.browser.mjs';

console.log('Worker Created');

const controller1 = new DefaultController();
const controller2 = new DefaultController();
const displayBuffers = [new DisplayBuffer(), new DisplayBuffer()];
const display = new DisplayBufferPair(...displayBuffers);
const textMarquee = new MarqueeText(display);

async function loadWord(word) {
  await textMarquee.load(word);
}

async function connect1() {
  await controller1.connect();
  displayBuffers[0].sinks = [controller1];
  await displayBuffers[0].clear();
}

async function connect2() {
  await controller2.connect();
  displayBuffers[1].sinks = [controller2];
  await displayBuffers[1].clear();
}

onmessage = async (e) => {
  if (e.data.type == 'word') {
    await loadWord(e.data?.word);
  } else if (e.data.type == 'connect1') {
    await connect1();
    postMessage('connect1-success');
  } else if (e.data.type == 'connect2') {
    await connect2();
    postMessage('connect2-success');
  } else if (e.data.type == 'portSwap') {
    await display.swap();
  }
}

// Throttles to 1hz when focus is lost.
setInterval(async () => {
  await textMarquee.nextFrame();
  await display.flush();
}, 50);
