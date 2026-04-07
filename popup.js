// Popup.js - Interfaz del filtro de empleos

const filterInput = document.getElementById('filterInput');
const addBtn = document.getElementById('addBtn');
const filterList = document.getElementById('filterList');
const filterStats = document.getElementById('filterStats');
const rubrosList = document.getElementById('rubrosList');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Normalizar texto: quitar acentos y convertir a minúsculas
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ===== TABS =====
document.addEventListener('DOMContentLoaded', () => {
  loadFilters();
  loadRubros();
  setupTabs();
});

function setupTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // Desactivar todos los tabs
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));
      
      // Activar el tab seleccionado
      btn.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// ===== PALABRAS CLAVE =====
addBtn.addEventListener('click', addFilter);

filterInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addFilter();
  }
});

function loadFilters() {
  chrome.storage.local.get(['filters', 'blockedCount'], (result) => {
    const filters = result.filters || [];
    const blockedCount = result.blockedCount || 0;

    renderFilters(filters);
    updateStats(blockedCount);
  });
}

function renderFilters(filters) {
  filterList.innerHTML = '';

  if (filters.length === 0) {
    filterList.innerHTML = '<div class="empty-state">No hay filtros configurados</div>';
    return;
  }

  filters.forEach((filter) => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      <span class="label">${escapeHtml(filter)}</span>
      <button class="remove-btn" title="Eliminar" data-filter="${escapeAttr(filter)}">
        ✕
      </button>
    `;

    const removeBtn = tag.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => removeFilter(filter));

    filterList.appendChild(tag);
  });
}

function addFilter() {
  const value = filterInput.value.trim();

  if (!value) {
    filterInput.focus();
    return;
  }

  chrome.storage.local.get(['filters'], (result) => {
    let filters = result.filters || [];

    // Evitar duplicados usando normalización de acentos
    const normalizedValue = normalizeText(value);
    if (filters.some((f) => normalizeText(f) === normalizedValue)) {
      filterInput.value = '';
      return;
    }

    filters.push(value);
    chrome.storage.local.set({ filters }, () => {
      filterInput.value = '';
      renderFilters(filters);

      // Notificar al content script que hay cambios
      notifyContentScriptOfChanges();
    });
  });
}

function removeFilter(filter) {
  chrome.storage.local.get(['filters'], (result) => {
    let filters = result.filters || [];
    filters = filters.filter((f) => f !== filter);

    chrome.storage.local.set({ filters }, () => {
      renderFilters(filters);

      // Notificar al content script que hay cambios
      notifyContentScriptOfChanges();
    });
  });
}

// ===== RUBROS =====
function loadRubros() {
  chrome.storage.local.get(['rubros'], (result) => {
    const selectedRubros = result.rubros || [];
    renderRubros(selectedRubros);
  });
}

function renderRubros(selectedRubros) {
  rubrosList.innerHTML = '';

  const rubros = getRubros();
  
  if (rubros.length === 0) {
    rubrosList.innerHTML = '<div class="empty-state">No hay rubros disponibles</div>';
    return;
  }

  rubros.forEach((rubro) => {
    const item = document.createElement('div');
    item.className = 'rubro-item';
    
    const isSelected = selectedRubros.includes(rubro.id);
    
    item.innerHTML = `
      <input type="checkbox" id="rubro-${rubro.id}" ${isSelected ? 'checked' : ''}>
      <label for="rubro-${rubro.id}">
        <span class="rubro-icon">${rubro.icon}</span>
        ${rubro.label}
      </label>
    `;

    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => updateRubro(rubro.id, checkbox.checked));

    rubrosList.appendChild(item);
  });
}

function updateRubro(rubroId, checked) {
  chrome.storage.local.get(['rubros'], (result) => {
    let rubros = result.rubros || [];

    if (checked) {
      if (!rubros.includes(rubroId)) {
        rubros.push(rubroId);
      }
    } else {
      rubros = rubros.filter((r) => r !== rubroId);
    }

    chrome.storage.local.set({ rubros }, () => {
      renderRubros(rubros);
      notifyContentScriptOfChanges();
    });
  });
}

// ===== ESTADÍSTICAS =====
function updateStats(blockedCount) {
  if (blockedCount === 0) {
    filterStats.textContent = '✅ Sin trabajos filtrados en esta página';
  } else if (blockedCount === 1) {
    filterStats.textContent = `🔍 1 trabajo filtrado`;
  } else {
    filterStats.textContent = `🔍 ${blockedCount} trabajos filtrados`;
  }
}

// Actualizar estadísticas cada 500ms
setInterval(() => {
  chrome.storage.local.get(['blockedCount'], (result) => {
    const blockedCount = result.blockedCount || 0;
    updateStats(blockedCount);
  });
}, 500);

// ===== NOTIFICACIÓN AL CONTENT SCRIPT =====
function notifyContentScriptOfChanges() {
  // Notificar a todas las pestañas de empleospublicos.cl
  chrome.tabs.query({ url: '*://*.empleospublicos.cl/*' }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'refilter' }).catch(() => {
        // Ignorar errores si el script no está activo
      });
    });
  });
}

// ===== FUNCIONES AUXILIARES =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
