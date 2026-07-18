// ─── Weave Background Service Worker ───

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set defaults on first install
    chrome.storage.sync.set({
      weaveState: {
        enabled: true,
        replacements: [{ find: '', replace: '', active: true }],
        theme: 'default',
        codeEnhance: false,
        fontSize: 100,
        lineHeight: 150,
        letterSpacing: 0,
        maxWidth: 720,
      },
      weaveSites: {}
    });
  }
});

// Listen for tab updates to re-apply settings
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Notify content script to reload state (it fetches from storage on init)
    chrome.tabs.sendMessage(tabId, { type: 'PAGE_LOADED' }).catch(() => {
      // Content script may not be injected yet on some pages
    });
  }
});

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    // Default action is handled by Chrome
  }
});
