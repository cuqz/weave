# Weave

A browser extension that lets you change how any webpage looks and reads. Replace text, switch themes, tweak fonts — whatever helps you actually focus on what you're reading.

Built for Hack Club Widget YSWS.

---

## What it does

**Text replacement** — Swap any word or phrase on any page. I use it to replace "the cloud" with "someone else's computer" but you do you. Multiple replacements run at the same time and you can toggle each one on/off.

**Reading themes** — Six themes: Default, Dark, Sepia (warm tones, good for reading articles), Mono (grayscale, no distractions), Noir (high contrast), Forest (green, calm). I mostly use Sepia for docs.

**Typography controls** — Font size, line height, letter spacing, max width. Some sites have terrible typography so this lets you override it.

**Code block enhancer** — Adds a copy button + language badge to code blocks on GitHub, docs sites, blogs. Works automatically.

**Per-site settings** — Every setting saves per domain. So you can have different text replacements on Twitter vs Reddit vs docs. They stick around when you come back.

**Keyboard shortcut** — `Ctrl+Shift+W` (Windows) or `Cmd+Shift+W` (Mac) pops it open.

---

## How to install

1. Clone or download this repo
2. Go to `chrome://extensions`
3. Toggle **Developer mode** (top right)
4. Click **Load unpacked** and pick the folder

That's it. No build step, no npm install, nothing.

---

## How to use

Click the icon in your toolbar or hit the keyboard shortcut. The popup has three tabs:

- **Transform** — Add text replacements. Type what you want to replace and what you want it to become.
- **Read** — Pick a theme and toggle code enhancement.
- **Typography** — Adjust font size, line height, spacing, width.

Everything applies instantly. Settings save per domain automatically.

---

## Project structure

```
weave/
├── manifest.json       # Extension manifest v3
├── popup.html          # The popup you see when clicking the icon
├── popup.css           # Styles for the popup
├── popup.js            # Popup logic, state, settings handling
├── content.js          # Runs on pages — does the actual transforms
├── background.js       # Service worker
├── icons/              # Icons for the extension
├── README.md           # This
└── LICENSE             # MIT
```

## Dev stuff

No build tools. No framework. Just vanilla JS. Open the files, edit, reload the extension in `chrome://extensions`. That's the whole workflow.

---
MIT license.
