# LinkScrub

![CI](https://img.shields.io/github/actions/workflow/status/FoxSecIntel/Linkscrub/ci.yml?branch=main&label=CI)
![License](https://img.shields.io/github/license/FoxSecIntel/Linkscrub)
![Latest Release](https://img.shields.io/github/v/release/FoxSecIntel/Linkscrub)

Chrome extension (Manifest V3) that adds a right-click action to copy a cleaned URL without common tracking parameters.

## What it does

- Adds **Copy clean link** to the link context menu
- Removes common tracking parameters from URLs, including:
  - `utm_*`
  - `fbclid`
  - `gclid`
  - `ref` and related referrer keys
- Copies the cleaned link to clipboard using an offscreen document (MV3-safe)

## Project structure

```text
src/
  manifest.json
  background.js
  offscreen.html
  offscreen.js
```

## Install locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `src` directory

## Notes

- Built for Manifest V3 service worker architecture
- Uses offscreen document flow for reliable clipboard access
