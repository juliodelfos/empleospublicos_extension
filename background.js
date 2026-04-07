// Service Worker para la extensión
// Maneja eventos globales

chrome.runtime.onInstalled.addListener(() => {
  // Inicializar storage cuando se instala la extensión
  chrome.storage.local.get(['filters'], (result) => {
    if (!result.filters) {
      chrome.storage.local.set({
        filters: [],
        blockedCount: 0,
      });
    }
  });

  console.log('[Filtro Empleos] Extensión instalada');
});
