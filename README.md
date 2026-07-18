# Weave — Page Transformer

> Transform any webpage to match how you want to read, work, and focus.

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-violet)
![Chrome](https://img.shields.io/badge/chrome-120+-brightgreen)
![Manifest](https://img.shields.io/badge/manifest-v3-important)

---

## ✨ Features

### 🔄 Text Replacement
Replace any text on any webpage — custom word swaps, inside jokes, accessibility tweaks, or language substitutions. Multiple replacements run simultaneously with per-rule toggles.

### 🎨 Reading Modes
Six carefully crafted themes:
| Theme | Vibe |
|-------|------|
| **Default** | Original page styles |
| **Dark** | Inverted, easy on the eyes |
| **Sepia** | Warm, book-like reading |
| **Mono** | Distraction-free grayscale |
| **Noir** | High contrast, dramatic |
| **Forest** | Calm green tones |

### 📐 Typography Controls
Fine-tune how pages read:
- Font size (60%–150%)
- Line height (1.0–2.0)
- Letter spacing (0–5px)
- Max width (400–1200px)

### 💻 Code Block Enhancer
Enable to add copy buttons and language badges to code blocks on any site. Works with GitHub, documentation, blogs, and more.

### 🧠 Per-Site Settings
Your preferences are saved per domain. Set up different rules for different sites — they persist between visits.

### ⚡ Keyboard Shortcut
`Ctrl+Shift+W` (Windows/Linux) or `Cmd+Shift+W` (Mac) to open Weave instantly.

---

## 🚀 Installation

### Developer Mode (current)
1. Download or clone this repo:
   ```bash
   git clone https://github.com/cuqz/weave.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `weave` folder

### Chrome Web Store (coming soon)
Once published, you'll be able to install with one click from the Chrome Web Store.

---

## 🛠 Usage

1. Click the Weave icon in your toolbar (or press `Ctrl+Shift+W`)
2. **Transform** tab: Add text replacements (e.g., "JavaScript" → "JS")
3. **Read** tab: Choose a reading theme, toggle code enhancement
4. **Typography** tab: Adjust font size, line height, spacing, max width
5. Toggle the extension on/off per page using the switch

All changes apply instantly. Settings are saved per domain.

---

## 📁 Project Structure

```
weave/
├── manifest.json        # Extension manifest (MV3)
├── popup.html           # Popup interface
├── popup.css            # Popup styles (glassmorphism)
├── popup.js             # Popup logic & state management
├── content.js           # Content script (transformations)
├── background.js        # Service worker
├── icons/               # Extension icons
├── README.md            # This file
└── LICENSE              # MIT license
```

---

## 🧪 Development

```bash
# No build step required — vanilla JS, works out of the box.
# Load as unpacked extension in Chrome.
```

To modify the popup UI, edit `popup.html`, `popup.css`, and `popup.js`.
To change how pages are transformed, edit `content.js`.

---

## 📸 Screenshots

> *Add screenshots here before submitting*

1. **Popup** — The main control panel with tabs
2. **Text Replacement** — Active replacements in action
3. **Reading Mode** — Sepia theme applied to a documentation page
4. **Code Enhancement** — Copy button and language badge on code blocks

---

## 📝 License

MIT — see [LICENSE](LICENSE).

---

## 🙌 Made for Hack Club Widget

Built as part of the [Widget YSWS](https://widget.hackclub.com/) — build a browser extension, ship it, get hardware.

[![Hack Club](https://img.shields.io/badge/Hack%20Club-Widget-violet)](https://widget.hackclub.com/)
