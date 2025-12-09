# Changelog

## 0.2.0 - 2025-11-21

### Added

* Support for LED Matrix Modules with the following firmware: [sigroot/FW_LED_Matrix_Firmware](https://github.com/sigroot/FW_LED_Matrix_Firmware/tree/main/rp2040_firmware)

## 0.3.0 - 2025-11-24

### Added

* New "Custom Word Lists" panel with controls for creating, editing and deleting custom collections of words.

## 0.3.1 - 2025-12-09

### Changed

* LED Matrix control moved to background thread.
* LED Matrix control implementation moved to NPM package `led-matrix-controllers`.

### Fixed

* Animation no longer throttles to 1hz when tab is inactive. (#1)
