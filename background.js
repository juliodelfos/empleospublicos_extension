// Background service worker de la extensión.
// Mantiene defaults sin sobrescribir preferencias existentes al actualizar.

const DEFAULT_STORAGE = {
  filters: [],
  rubros: [],
  blockedCount: 0,
  viewMode: 'grid',
  paused: false,
  lastRegion: '',
};

function initializeMissingStorageKeys() {
  const keys = Object.keys(DEFAULT_STORAGE);

  chrome.storage.local.get(keys, (currentValues) => {
    const missingValues = {};

    keys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(currentValues, key)) {
        missingValues[key] = DEFAULT_STORAGE[key];
      }
    });

    if (Object.keys(missingValues).length > 0) {
      chrome.storage.local.set(missingValues);
    }
  });
}

function updateBadge(count, paused, tabId) {
  const target = Number.isInteger(tabId) ? { tabId } : {};

  if (paused) {
    chrome.action.setBadgeText({ ...target, text: '⏸' });
    chrome.action.setBadgeBackgroundColor({ ...target, color: '#f59e0b' });
    return;
  }

  if (count > 0) {
    chrome.action.setBadgeText({ ...target, text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ ...target, color: '#3b82f6' });
    return;
  }

  chrome.action.setBadgeText({ ...target, text: '' });
}

chrome.runtime.onInstalled.addListener(() => {
  initializeMissingStorageKeys();
});

chrome.runtime.onStartup.addListener(() => {
  initializeMissingStorageKeys();
  updateBadge(0, false);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action !== 'updateTabBadge' || !sender.tab?.id) return;
  updateBadge(Number(message.hidden) || 0, Boolean(message.paused), sender.tab.id);
});
