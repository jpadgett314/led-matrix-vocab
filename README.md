# LED Matrix Vocab

Put your LED Matrix Modules to work and study Japanese vocabulary!

Live demo: https://jpadgett314.github.io/led-matrix-vocab

![Animation of scrolling text on LED Matrix modules](/docs/demo.webp)

## Getting Started (User)

This app can be saved to your desktop, enabling offline use. An install button will appear in the address bar or browser menu, if your browser supports Progressive Web Apps (all modern browsers).

Having trouble? See [Installation Instructions](https://www.installpwa.com/from/jpadgett314.github.io%2Fled-matrix-vocab).

That's it!

One caveat: this app uses the Web Serial API, which is only supported on Chromium-based browsers.

## Getting Started (Developer)

This project features a minimalist development workflow. There is currently no bundler; in fact, there is no build. The source code is served directly from the `public` directory.

Due to the use of ECMAScript modules, a web server is required. Options include:

1. Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VSCode extension.
2. From the `public` directory, invoke python's built-in module: `python3 -m http.server`

By default, this puts up the site on `http://127.0.0.1:5500/` (Live Server) `http://127.0.0.1:8000` (http.server).

## Contributing

Please contribute your suggestions and/or your code!

This project is still in early stages. Feel free to submit drafts as PRs; I will help finalize them.

## Attributions

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
