# LED Matrix Vocab

Put your LED Matrix Modules to work and study Japanese vocabulary!

Live demo: https://jpadgett314.github.io/led-matrix-vocab

![Animation of scrolling text on LED Matrix modules](/docs/demo.webp)

## Installation

This app can be saved to your desktop! See [instructions](https://www.installpwa.com/from/jpadgett314.github.io%2Fled-matrix-vocab).

There is no need to flash firmware, since default firmware is expected. 

> [!NOTE]  
> This app uses the Web Serial API, which is only supported on Chromium-based browsers.

## Development

Ensure you have Node.js installed on your system before proceeding.

First, setup yarn: 

```
corepack enable
yarn
```

Then build and start the app:

```
yarn build
yarn preview
```

## Contributing

Please contribute your suggestions and/or your code! All pull requests welcome.

## Credits

This repository includes the following third-party assets:

- **Font: jiskan16**
  - License: Public Domain
  - Source: http://jikasei.me/font/jf-dotfont/

- **Dataset: jlpt-words-by-level**
  - License: CC BY 4.0
  - Source: https://www.kaggle.com/datasets/robinpourtaud/jlpt-words-by-level

- **Dataset: jawiki-2022-08-29**
  - License: MIT
  - Source: https://github.com/IlyaSemenov/wikipedia-word-frequency
