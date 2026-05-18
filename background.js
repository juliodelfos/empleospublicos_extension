// Service Worker para la extensión
// Maneja eventos globales

chrome.runtime.onInstalled.addListener(() => {
  // Inicializar storage cuando se instala la extensión
  chrome.storage.local.set({
    filters: [],
    rubros: [],
    blockedCount: 0,
    viewMode: 'grid',
    paused: false,
  });

  console.log('[Filtro Empleos] Extensión instalada');
});

// Actualizar badge cuando cambia blockedCount
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockedCount) {
    const count = changes.blockedCount.newValue || 0;
    
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
  
  // Actualizar badge cuando cambia el estado de pausa
  if (namespace === 'local' && changes.paused) {
    if (changes.paused.newValue) {
      chrome.action.setBadgeText({ text: '⏸' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    } else {
      // Restaurar badge al count actual
      chrome.storage.local.get(['blockedCount'], (result) => {
        const count = result.blockedCount || 0;
        if (count > 0) {
          chrome.action.setBadgeText({ text: count.toString() });
          chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
        } else {
          chrome.action.setBadgeText({ text: '' });
        }
      });
    }
  }
});
