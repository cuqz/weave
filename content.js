// ─── Weave Content Script ───
// Applies text transformations, reading themes, and typography to any webpage.

let state = {
  enabled: true,
  replacements: [],
  theme: 'default',
  codeEnhance: false,
  fontSize: 100,
  lineHeight: 150,
  letterSpacing: 0,
  maxWidth: 720,
};
let styleEl = null;
let appliedTheme = null;

// ─── Receive State from Popup ───
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'UPDATE_STATE') {
    state = msg.state;
    applyAll();
    sendResponse({ ok: true });
  }
  if (msg.type === 'RESET') {
    resetAll();
    sendResponse({ ok: true });
  }
  if (msg.type === 'GET_STATE') {
    sendResponse(state);
  }
});

// ─── Load Saved State ───
async function loadState() {
  const result = await chrome.storage.sync.get(['weaveState']);
  if (result.weaveState) {
    state = { ...state, ...result.weaveState };
    // Per-domain overrides
    const domain = window.location.hostname;
    const siteResult = await chrome.storage.sync.get(['weaveSites']);
    const sites = siteResult.weaveSites || {};
    if (sites[domain]) {
      state = { ...state, ...sites[domain] };
    }
    applyAll();
  }
}

// ─── Apply All Effects ───
function applyAll() {
  if (!state.enabled) {
    removeStyles();
    return;
  }
  
  applyTheme();
  applyTypography();
  applyReplacements();
  enhanceCodeBlocks();
}

// ─── Theme Application ───
function applyTheme() {
  if (appliedTheme === state.theme) return;
  
  removeStyles();
  appliedTheme = state.theme;
  
  if (state.theme === 'default') return;

  styleEl = document.createElement('style');
  styleEl.id = 'weave-styles';
  styleEl.textContent = getThemeCSS(state.theme);
  document.head.appendChild(styleEl);
}

function getThemeCSS(theme) {
  const themes = {
    dark: `
      html { filter: invert(0.9) hue-rotate(180deg) !important; }
      img, video, canvas, svg, [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }
      body { background: #000 !important; color: #ddd !important; }
    `,
    sepia: `
      body { background: #fbf0d9 !important; color: #5b4636 !important; }
      a { color: #8b5cf6 !important; }
      * { scrollbar-color: #d4c5a9 #fbf0d9 !important; }
    `,
    mono: `
      body { background: #f5f5f5 !important; color: #333 !important; }
      img, video { filter: grayscale(100%) !important; }
      a { color: #666 !important; text-decoration: underline !important; }
    `,
    noir: `
      body { background: #000 !important; color: #aaa !important; }
      a { color: #fff !important; }
      * { border-color: #222 !important; }
      img, video { filter: brightness(0.7) contrast(1.2) !important; }
    `,
    forest: `
      body { background: #1b3a2b !important; color: #b8d4b0 !important; }
      a { color: #7cbf6b !important; }
      * { border-color: #2d5a3d !important; }
    `,
  };
  return themes[theme] || '';
}

// ─── Typography ───
function applyTypography() {
  const typoId = 'weave-typography';
  let typoEl = document.getElementById(typoId);
  
  if (state.fontSize === 100 && state.lineHeight === 150 && state.letterSpacing === 0 && state.maxWidth === 720) {
    if (typoEl) typoEl.remove();
    return;
  }

  if (!typoEl) {
    typoEl = document.createElement('style');
    typoEl.id = typoId;
    document.head.appendChild(typoEl);
  }

  const rules = [];
  if (state.fontSize !== 100) {
    rules.push(`font-size: ${state.fontSize}% !important`);
  }
  if (state.lineHeight !== 150) {
    rules.push(`line-height: ${state.lineHeight / 100} !important`);
  }
  if (state.letterSpacing !== 0) {
    rules.push(`letter-spacing: ${state.letterSpacing}px !important`);
  }
  if (state.maxWidth !== 720) {
    rules.push(`max-width: ${state.maxWidth}px !important`);
    rules.push('margin-left: auto !important');
    rules.push('margin-right: auto !important');
  }

  typoEl.textContent = `
    body, p, li, blockquote, td, th, article, section, .post, .content, .entry {
      ${rules.join('; ')}
    }
  `;
}

// ─── Text Replacements ───
function applyReplacements() {
  const activeReplacements = state.replacements.filter(r => r.active && r.find);
  if (activeReplacements.length === 0) return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script, style, noscript, textarea, input
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'textarea', 'input', 'select', 'option'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let textNode;
  let modified = false;
  
  while ((textNode = walker.nextNode())) {
    let value = textNode.nodeValue;
    let changed = false;

    for (const rep of activeReplacements) {
      if (rep.find && value.includes(rep.find)) {
        // Escape special regex chars in the find string
        const escaped = rep.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        const newValue = value.replace(regex, rep.replace);
        if (newValue !== value) {
          value = newValue;
          changed = true;
        }
      }
    }

    if (changed) {
      textNode.nodeValue = value;
      modified = true;
    }
  }

  if (modified) {
    document.dispatchEvent(new CustomEvent('weave-transformed'));
  }
}

// ─── Code Block Enhancement ───
function enhanceCodeBlocks() {
  if (!state.codeEnhance) return;

  document.querySelectorAll('pre code, pre, .highlight').forEach(block => {
    // Skip already enhanced
    if (block.dataset.weaveEnhanced) return;
    block.dataset.weaveEnhanced = 'true';

    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'weave-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.style.cssText = `
      position: absolute; top: 6px; right: 6px;
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      background: rgba(167, 139, 250, 0.15); color: #a78bfa;
      border: 1px solid rgba(167, 139, 250, 0.25);
      border-radius: 6px; cursor: pointer;
      font-family: system-ui, sans-serif;
      opacity: 0; transition: opacity 0.2s;
      z-index: 10;
    `;
    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.style.background = 'rgba(167, 139, 250, 0.25)';
    });
    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.style.background = 'rgba(167, 139, 250, 0.15)';
    });
    copyBtn.addEventListener('click', async () => {
      const code = block.tagName === 'CODE' ? block : block.querySelector('code') || block;
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      } catch {
        copyBtn.textContent = 'Failed';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      }
    });

    // Make parent relative for positioning
    const parent = block.parentElement;
    if (parent) {
      const existingStyle = parent.style.position;
      if (!existingStyle || existingStyle === 'static') {
        parent.style.position = 'relative';
      }
    }

    // Show copy button on hover
    block.addEventListener('mouseenter', () => { copyBtn.style.opacity = '1'; });
    block.addEventListener('mouseleave', () => { copyBtn.style.opacity = '0'; });

    // Add language badge if it's a code block with class
    if (block.tagName === 'CODE' && block.className) {
      const langMatch = block.className.match(/language-(\w+)/);
      if (langMatch) {
        const badge = document.createElement('span');
        badge.className = 'weave-lang-badge';
        badge.textContent = langMatch[1];
        badge.style.cssText = `
          position: absolute; top: 6px; left: 6px;
          padding: 2px 8px; font-size: 10px; font-weight: 700;
          color: rgba(167, 139, 250, 0.7); text-transform: uppercase;
          letter-spacing: 0.05em; z-index: 10;
          font-family: system-ui, sans-serif;
        `;
        block.parentElement?.appendChild(badge);
      }
    }

    block.parentElement?.appendChild(copyBtn);
  });
}

// ─── Remove Styles ───
function removeStyles() {
  document.getElementById('weave-styles')?.remove();
  document.getElementById('weave-typography')?.remove();
  appliedTheme = null;
}

function resetAll() {
  removeStyles();
  document.querySelectorAll('[data-weave-enhanced]').forEach(el => {
    delete el.dataset.weaveEnhanced;
  });
  document.querySelectorAll('.weave-copy-btn, .weave-lang-badge').forEach(el => el.remove());
}

// ─── Observe Dynamic Content ───
const observer = new MutationObserver(() => {
  if (state.enabled && state.codeEnhance) {
    enhanceCodeBlocks();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// ─── Init ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadState);
} else {
  loadState();
}
