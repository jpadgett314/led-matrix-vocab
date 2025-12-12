# LED Matrix Vocab

Put your LED Matrix Modules to work and study Japanese vocabulary!

Live demo: https://jpadgett314.github.io/led-matrix-vocab

![Animation of scrolling text on LED Matrix modules](/docs/demo.webp)

## Installation

This app can be saved to your desktop! See [instructions](https://www.installpwa.com/from/jpadgett314.github.io%2Fled-matrix-vocab).

There is no need to flash firmware, since default firmware is expected. [FW_LED_Matrix_Firmware](github.com/sigroot/FW_LED_Matrix_Firmware) is also supported and automatically detected if present. 

> [!NOTE]  
> This app uses the Web Serial API, which is only supported on Chromium-based browsers.

## Development

There is no bundler, no build. The source code is served directly from the `public` directory.

However, a web server is required. Options include:

1. Use Yarn: `yarn install`, `yarn serve`.
2. Use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VSCode extension.
3. From the `public` directory, invoke python's built-in module: `python3 -m http.server`

## Contributing

Please contribute your suggestions and/or your code!

This project is still in early stages. Feel free to submit drafts as PRs; I will help finalize them.

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
