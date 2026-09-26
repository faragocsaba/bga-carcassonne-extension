# 🏰 BGA Carcassonne Real-Time Tile Counter

A lightweight Google Chrome extension (Manifest V3) that provides a real-time, visual tile counter for **Carcassonne** matches played on **Board Game Arena (BGA)**.

It automatically detects played tiles on the board, parses game sprites, and calculates remaining tile probabilities in a sleek, non-intrusive floating overlay panel.

---

## ✨ Features

- ⚡ **Real-Time Auto-Updating:** Automatically updates tile counts as turns progress using dynamic DOM observers (`MutationObserver`).
- 🖼️ **Visual Tile Grid:** Displays recognizable image previews for all base game tile types rather than plain text or abstract codes.
- 🔢 **Remaining Tile Indicators:** Displays badges on each tile showing how many are left in the draw deck.
- 🌑 **Out-of-Stock Highlighting:** Depleted tile types automatically dim and turn grayscale for quick tactical assessment.
- 📌 **Collapsible Overlay UI:** Built directly into the BGA interface; click the header to expand or minimize the tracker at any time.
- 🧩 **Base Game Mapping:** Pre-configured with all 29 standard Carcassonne tile variants (72 total base tiles).

---

## 🛠️ Installation Guide

Follow these steps to install the extension manually in developer mode:

1. **Download or Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/bga-carcassonne-tile-counter.git
   ```
   *(Or download the repository as a ZIP file and extract it).*

2. **Open Chrome Extensions Page:**
   - In Google Chrome, navigate to `chrome://extensions/` in your address bar.
   - Alternatively, click the **Three Dots Menu (`⋮`)** in the top-right corner $\rightarrow$ **Extensions** $\rightarrow$ **Manage Extensions**.

3. **Enable Developer Mode:**
   - Turn on the **Developer mode** toggle switch located in the top-right corner of the Extensions page.

4. **Load the Unpacked Extension:**
   - Click the **Load unpacked** button in the top-left corner.
   - Select the root directory containing the extension files (`manifest.json`, `content.js`, etc.).

---

## 🎮 How to Use

1. Start or observe any standard **Carcassonne** match on [Board Game Arena](https://boardgamearena.com/).
2. The **Carcassonne Tracker** panel will automatically appear in the upper-left corner of the game screen once the board loads.
3. Use the **▼ / ▲ toggle** on the header bar to collapse or expand the visual grid as needed.

---

## 📁 File Structure

```text
.
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # Core script: frame detection, sprite parser, tile tracker
├── styles.css          # Styling for the floating panel, badges, and visual grid
└── tiles/              # Visual tile artwork (.png images mapped by tile code)
```

---

## ⚠️ Disclaimer

This is an unofficial fan-made extension designed for quality-of-life improvement on Board Game Arena. It is not affiliated with, maintained, authorized, or endorsed by Board Game Arena, Hans im Glück, or Z-Man Games.
