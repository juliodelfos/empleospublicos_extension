// Interfaz de configuración de la extensión.

const filterInput = document.getElementById('filterInput');
const addBtn = document.getElementById('addBtn');
const filterList = document.getElementById('filterList');
const filterStats = document.getElementById('filterStats');
const rubrosList = document.getElementById('rubrosList');
const undoBtn = document.getElementById('undoBtn');
const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
const tabContents = Array.from(document.querySelectorAll('[role="tabpanel"]'));

let undoState = null;

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

document.addEventListener('DOMContentLoaded', () => {
  loadFilters();
  loadRubros();
  loadViewMode();
  loadPauseState();
  loadActiveTabState();
  setupTabs();
  setupViewModeToggle();
  setupPauseToggle();
  setupUndo();
});

function setupTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
      const currentIndex = tabButtons.indexOf(button);
      let nextIndex = currentIndex;

      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabButtons.length;
      else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabButtons.length - 1;
      else return;

      event.preventDefault();
      activateTab(tabButtons[nextIndex].dataset.tab, true);
    });
  });
}

function activateTab(tabId, focus = false) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isActive ? 0 : -1;
    if (isActive && focus) button.focus();
  });

  tabContents.forEach((content) => {
    const isActive = content.id === `${tabId}-tab`;
    content.classList.toggle('active', isActive);
    content.hidden = !isActive;
  });
}

addBtn.addEventListener('click', addFilter);
filterInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addFilter();
});

function loadFilters() {
  chrome.storage.local.get(['filters'], (result) => {
    const filters = Array.isArray(result.filters) ? result.filters : [];
    renderFilters(filters);
  });
}

function renderFilters(filters) {
  filterList.innerHTML = '';

  if (filters.length === 0) {
    filterList.innerHTML = '<div class="empty-state">No hay filtros configurados</div>';
    updateKeywordsBadge(0);
    return;
  }

  filters.forEach((filter) => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      <span class="label">${escapeHtml(filter)}</span>
      <button class="remove-btn" type="button" title="Eliminar ${escapeAttr(filter)}" aria-label="Eliminar ${escapeAttr(filter)}">✕</button>
    `;
    tag.querySelector('.remove-btn').addEventListener('click', () => removeFilter(filter));
    filterList.appendChild(tag);
  });

  updateKeywordsBadge(filters.length);
}

function updateKeywordsBadge(count) {
  const badge = document.getElementById('keywordsBadge');
  if (!badge) return;
  badge.textContent = count > 0 ? String(count) : '';
  badge.dataset.count = count;
}

function addFilter() {
  const value = filterInput.value.trim();
  if (!value) {
    filterInput.focus();
    return;
  }

  chrome.storage.local.get(['filters'], (result) => {
    const filters = Array.isArray(result.filters) ? result.filters : [];
    const normalizedValue = normalizeText(value);

    if (filters.some((filter) => normalizeText(filter) === normalizedValue)) {
      filterInput.value = '';
      return;
    }

    setUndoState({ filters: [...filters] });
    const nextFilters = [...filters, value];
    chrome.storage.local.set({ filters: nextFilters }, () => {
      filterInput.value = '';
      renderFilters(nextFilters);
      notifyContentScriptOfChanges();
    });
  });
}

function removeFilter(filter) {
  chrome.storage.local.get(['filters'], (result) => {
    const filters = Array.isArray(result.filters) ? result.filters : [];
    setUndoState({ filters: [...filters] });
    const nextFilters = filters.filter((item) => item !== filter);

    chrome.storage.local.set({ filters: nextFilters }, () => {
      renderFilters(nextFilters);
      notifyContentScriptOfChanges();
    });
  });
}

function loadRubros() {
  chrome.storage.local.get(['rubros'], (result) => {
    const selectedRubros = Array.isArray(result.rubros) ? result.rubros : [];
    renderRubros(selectedRubros);
  });
}

function renderRubros(selectedRubros) {
  rubrosList.innerHTML = '';
  const rubros = getRubros();

  if (rubros.length === 0) {
    rubrosList.innerHTML = '<div class="empty-state">No hay rubros disponibles</div>';
    updateRubrosBadge(0);
    return;
  }

  rubros.forEach((rubro) => {
    const item = document.createElement('div');
    item.className = 'rubro-item';
    const isSelected = selectedRubros.includes(rubro.id);

    item.innerHTML = `
      <input type="checkbox" id="rubro-${escapeAttr(rubro.id)}" ${isSelected ? 'checked' : ''}>
      <label for="rubro-${escapeAttr(rubro.id)}">
        <span class="rubro-icon" aria-hidden="true">${rubro.icon}</span>
        ${escapeHtml(rubro.label)}
      </label>
    `;

    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => updateRubro(rubro.id, checkbox.checked));
    rubrosList.appendChild(item);
  });

  updateRubrosBadge(selectedRubros.length);
}

function updateRubrosBadge(count) {
  const badge = document.getElementById('rubrosBadge');
  if (!badge) return;
  badge.textContent = count > 0 ? String(count) : '';
  badge.dataset.count = count;
}

function updateRubro(rubroId, checked) {
  chrome.storage.local.get(['rubros'], (result) => {
    const rubros = Array.isArray(result.rubros) ? result.rubros : [];
    setUndoState({ rubros: [...rubros] });

    const nextRubros = checked
      ? Array.from(new Set([...rubros, rubroId]))
      : rubros.filter((item) => item !== rubroId);

    chrome.storage.local.set({ rubros: nextRubros }, () => {
      renderRubros(nextRubros);
      notifyContentScriptOfChanges();
    });
  });
}

function loadViewMode() {
  chrome.storage.local.get(['viewMode'], (result) => {
    renderViewMode(result.viewMode === 'list' ? 'list' : 'grid');
  });
}

function renderViewMode(mode) {
  document.querySelectorAll('input[name="viewMode"]').forEach((radio) => {
    radio.checked = radio.value === mode;
  });
}

function setupViewModeToggle() {
  document.querySelectorAll('input[name="viewMode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      chrome.storage.local.set({ viewMode: radio.value }, notifyContentScriptOfChanges);
    });
  });
}

function loadPauseState() {
  chrome.storage.local.get(['paused'], (result) => {
    document.getElementById('pauseToggle').checked = Boolean(result.paused);
  });
}

function setupPauseToggle() {
  const pauseToggle = document.getElementById('pauseToggle');
  pauseToggle.addEventListener('change', () => {
    chrome.storage.local.set({ paused: pauseToggle.checked }, notifyContentScriptOfChanges);
  });
}

function setupUndo() {
  undoBtn.addEventListener('click', () => {
    if (!undoState) return;
    const previous = undoState;
    undoState = null;
    undoBtn.hidden = true;

    chrome.storage.local.set(previous, () => {
      if (previous.filters) renderFilters(previous.filters);
      if (previous.rubros) renderRubros(previous.rubros);
      notifyContentScriptOfChanges();
      filterStats.textContent = 'Último cambio deshecho';
    });
  });
}

function setUndoState(previous) {
  undoState = previous;
  undoBtn.hidden = false;
}

function loadActiveTabState() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      showUnavailableStats();
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'getFilterState' }, (state) => {
      if (chrome.runtime.lastError || !state) {
        showUnavailableStats();
        return;
      }
      updateStats(state);
    });
  });
}

function updateStats(state) {
  if (state.paused) {
    filterStats.textContent = `${state.total} ofertas · filtrado en pausa`;
    return;
  }
  filterStats.textContent = `${state.total} ofertas · ${state.visible} visibles · ${state.hidden} ocultas`;
}

function showUnavailableStats() {
  filterStats.textContent = 'Abre el listado de Empleos Públicos para ver estadísticas';
}

function notifyContentScriptOfChanges() {
  chrome.tabs.query({ url: '*://*.empleospublicos.cl/*' }, (tabs) => {
    if (tabs.length === 0) {
      showUnavailableStats();
      return;
    }

    let pending = tabs.length;
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'refilter' }, (state) => {
        void chrome.runtime.lastError;
        pending -= 1;
        if (tab.active && state) updateStats(state);
        else if (pending === 0) loadActiveTabState();
      });
    });
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'local') return;
  if (changes.filters) updateKeywordsBadge((changes.filters.newValue || []).length);
  if (changes.rubros) updateRubrosBadge((changes.rubros.newValue || []).length);
  if (changes.paused || changes.viewMode) window.setTimeout(loadActiveTabState, 100);
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text || '');
  return div.innerHTML;
}

function escapeAttr(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
