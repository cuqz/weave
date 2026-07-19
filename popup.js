// ─── State ───
let state = {
  enabled: true,
  replacements: [{ find: '', replace: '', active: true }],
  theme: 'default',
  codeEnhance: false,
  fontSize: 100,
  lineHeight: 150,
  letterSpacing: 0,
  maxWidth: 720,
};

// ─── DOM Refs ───
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const replaceList = $('#replaceList');
const addBtn = $('#addReplace');
const enabledToggle = $('#enabledToggle');
const statusDot = $('#statusDot');
const statusText = $('#statusText');
const replaceCount = $('#replaceCount');
const resetBtn = $('#resetBtn');
const codeEnhance = $('#codeEnhance');
const fontSize = $('#fontSize');
const lineHeight = $('#lineHeight');
const letterSpacing = $('#letterSpacing');
const maxWidth = $('#maxWidth');
const fontSizeValue = $('#fontSizeValue');
const lineHeightValue = $('#lineHeightValue');
const letterSpacingValue = $('#letterSpacingValue');
const maxWidthValue = $('#maxWidthValue');

// ─── Tab Switching ───
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ─── Load State from Storage ───
async function loadState() {
  const result = await chrome.storage.sync.get(['weaveState']);
  if (result.weaveState) {
    state = { ...state, ...result.weaveState };
    applyState();
  }
  // Get current tab settings
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.startsWith('http')) {
      const domain = new URL(tab.url).hostname;
      const siteResult = await chrome.storage.sync.get(['weaveSites']);
      const sites = siteResult.weaveSites || {};
      if (sites[domain]) {
        state = { ...state, ...sites[domain] };
        applyState();
      }
    }
  } catch (e) {
    // Not on a web page (chrome://, about:, etc.)
  }
}

function applyState() {
  enabledToggle.checked = state.enabled;
  codeEnhance.checked = state.codeEnhance || false;
  fontSize.value = state.fontSize;
  lineHeight.value = state.lineHeight;
  letterSpacing.value = state.letterSpacing;
  maxWidth.value = state.maxWidth;
  fontSizeValue.textContent = `${state.fontSize}%`;
  lineHeightValue.textContent = (state.lineHeight / 100).toFixed(1);
  letterSpacingValue.textContent = `${state.letterSpacing}px`;
  maxWidthValue.textContent = `${state.maxWidth}px`;
  updateStatus(state.enabled);

  // Replacements
  if (state.replacements && state.replacements.length > 0) {
    renderReplacements(state.replacements);
  }
  updateReplaceCount();

  // Theme
  $$('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
}

function updateStatus(enabled) {
  statusDot.classList.toggle('inactive', !enabled);
  statusText.textContent = enabled ? 'Active' : 'Paused';
}

function updateReplaceCount() {
  const active = state.replacements.filter(r => r.active && r.find).length;
  replaceCount.textContent = `${active} active`;
}

// ─── Replacements ───
function renderReplacements(replacements) {
  replaceList.innerHTML = '';
  replacements.forEach((rep, i) => {
    const row = document.createElement('div');
    row.className = 'replace-row';
    row.innerHTML = `
      <input type="text" class="replace-input" placeholder="Find" value="${escapeHtml(rep.find)}" data-index="${i}" data-find />
      <svg class="replace-arrow" viewBox="0 0 16 16" width="16" height="16">
        <path d="M1 8h12M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>
      <input type="text" class="replace-input" placeholder="Replace" value="${escapeHtml(rep.replace)}" data-index="${i}" data-replace />
      <button class="replace-toggle ${rep.active ? '' : 'disabled'}" data-index="${i}" data-toggle>
        <svg width="14" height="14" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" style="opacity: ${rep.active ? 1 : 0}"/>
        </svg>
      </button>
      <button class="replace-delete" data-index="${i}" data-delete>
        <svg width="14" height="14" viewBox="0 0 16 16">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    // Input events
    row.querySelector('[data-find]').addEventListener('input', (e) => {
      state.replacements[i].find = e.target.value;
      saveAndUpdate();
    });
    row.querySelector('[data-replace]').addEventListener('input', (e) => {
      state.replacements[i].replace = e.target.value;
      saveAndUpdate();
    });
    row.querySelector('[data-toggle]').addEventListener('click', () => {
      state.replacements[i].active = !state.replacements[i].active;
      renderReplacements(state.replacements);
      updateReplaceCount();
      saveAndUpdate();
    });
    row.querySelector('[data-delete]').addEventListener('click', () => {
      state.replacements.splice(i, 1);
      if (state.replacements.length === 0) {
        state.replacements.push({ find: '', replace: '', active: true });
      }
      renderReplacements(state.replacements);
      updateReplaceCount();
      saveAndUpdate();
    });

    replaceList.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Add Replacement ───
addBtn.addEventListener('click', () => {
  state.replacements.push({ find: '', replace: '', active: true });
  renderReplacements(state.replacements);
  updateReplaceCount();
  // Scroll to bottom
  replaceList.scrollTop = replaceList.scrollHeight;
});

// ─── Toggle Enabled ───
enabledToggle.addEventListener('change', () => {
  state.enabled = enabledToggle.checked;
  updateStatus(state.enabled);
  saveAndUpdate();
});

// ─── Themes ───
$$('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.theme = btn.dataset.theme;
    saveAndUpdate();
  });
});

// ─── Code Enhance ───
codeEnhance.addEventListener('change', () => {
  state.codeEnhance = codeEnhance.checked;
  saveAndUpdate();
});

// ─── Typography Controls ───
fontSize.addEventListener('input', () => {
  state.fontSize = parseInt(fontSize.value);
  fontSizeValue.textContent = `${state.fontSize}%`;
  saveAndUpdate();
});

lineHeight.addEventListener('input', () => {
  state.lineHeight = parseInt(lineHeight.value);
  lineHeightValue.textContent = (state.lineHeight / 100).toFixed(1);
  saveAndUpdate();
});

letterSpacing.addEventListener('input', () => {
  state.letterSpacing = parseFloat(letterSpacing.value);
  letterSpacingValue.textContent = `${state.letterSpacing}px`;
  saveAndUpdate();
});

maxWidth.addEventListener('input', () => {
  state.maxWidth = parseInt(maxWidth.value);
  maxWidthValue.textContent = `${state.maxWidth}px`;
  saveAndUpdate();
});

// ─── Reset ───
resetBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'RESET' }).catch(() => {});
  }
  // Reset state
  state = {
    enabled: true,
    replacements: [{ find: '', replace: '', active: true }],
    theme: 'default',
    codeEnhance: false,
    fontSize: 100,
    lineHeight: 150,
    letterSpacing: 0,
    maxWidth: 720,
  };
  applyState();
  updateReplaceCount();
  saveState();
});

// ─── Save & Notify ───
async function saveAndUpdate() {
  await saveState();
  notifyContent();
}

async function saveState() {
  await chrome.storage.sync.set({ weaveState: state });

  // Save per-domain
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.startsWith('http')) {
      const domain = new URL(tab.url).hostname;
      const result = await chrome.storage.sync.get(['weaveSites']);
      const sites = result.weaveSites || {};
      sites[domain] = state;
      await chrome.storage.sync.set({ weaveSites: sites });
    }
  } catch (e) {
    // Not on a web page
  }
}

async function notifyContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_STATE', state }).catch(() => {});
  }
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', loadState);
