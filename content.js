// Script que se ejecuta en empleospublicos.cl y filtra empleos

// Guard: Solo ejecutar en la página de búsqueda de empleos
// NO ejecutar en sitio privado, dashboard, u otras páginas
function shouldRunOnThisPage() {
  const url = window.location.href;
  const pathname = window.location.pathname;
  
  // NO ejecutar en estas páginas:
  const blockedPages = [
    '/pub/usuarios/usrPostulanteDashboard.aspx',  // Sitio privado/dashboard
    '/pub/usuarios/',                              // Cualquier página de usuario
    '/login',                                      // Login
    '/logout',                                     // Logout
  ];
  
  for (const page of blockedPages) {
    if (pathname.includes(page)) {
      console.log('[Filtro Empleos] Página excluida, no filtrando');
      return false;
    }
  }
  
  // SÍ ejecutar si estamos en la página de búsqueda
  // Patrón: /pub/convocatorias/ o /convocatorias/
  if (pathname.includes('/pub/convocatorias/') || pathname.includes('/convocatorias/')) {
    return true;
  }
  
  // SÍ ejecutar si la página contiene elementos de trabajo (.items)
  if (document.querySelector('.items')) {
    return true;
  }
  
  console.log('[Filtro Empleos] No es página de búsqueda de empleos');
  return false;
}

// Verificar si debemos ejecutar en esta página
if (!shouldRunOnThisPage()) {
  console.log('[Filtro Empleos] Deshabilitado para esta página');
  // No ejecutar nada más - simplemente terminar aquí
} else {

let blockedCount = 0;
let filters = [];
let rubros = [];  // Rubros seleccionados

// Normalizar texto: quitar acentos y convertir a minúsculas
// "Médico" → "medico", "MÉDICO" → "medico"
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')                    // Descomponer caracteres acentuados (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '');   // Remover marcas diacríticas
}

// Cargar filtros y rubros al iniciar
chrome.storage.local.get(['filters', 'rubros'], (result) => {
  filters = result.filters || [];
  rubros = result.rubros || [];
  filterJobs();
});

// Escuchar cambios en los filtros desde el popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'refilter') {
    // Recargar filtros y rubros, luego volver a filtrar
    chrome.storage.local.get(['filters', 'rubros'], (result) => {
      filters = result.filters || [];
      rubros = result.rubros || [];
      resetJobs();
      filterJobs();
    });
  }
});

function filterJobs() {
  blockedCount = 0;

  // Intentar encontrar los trabajos en la página
  // empleospublicos.cl usa diferentes estructuras según la página
  const jobElements = findJobElements();

  if (jobElements.length === 0) {
    console.warn('[Filtro Empleos] No se encontraron elementos de trabajo en esta página');
    updateBlockedCount();
    return;
  }

  jobElements.forEach((element) => {
    // Saltar si ya fue procesado previamente
    if (element.dataset.filteredByExtension === 'true') {
      if (element.style.visibility === 'hidden') {
        blockedCount++;
      }
      return;
    }

    if (shouldBlockJob(element)) {
      // Usar visibility + height para permitir reflow del grid
      element.style.visibility = 'hidden';
      element.style.height = '0';
      element.style.overflow = 'hidden';
      element.style.padding = '0';
      element.style.margin = '0';
      element.style.border = '0';
      element.dataset.filteredByExtension = 'true';
      blockedCount++;
    }
  });

  updateBlockedCount();
  console.log(`[Filtro Empleos] Filtrado completado: ${blockedCount} trabajos ocultos de ${jobElements.length}`);
}

function findJobElements() {
  // Intentar múltiples selectores comunes para encontrar trabajos
  // NOTA: Probamos selectores más específicos primero para mejor precisión
  const selectors = [
    // empleospublicos.cl específicos (ACTUALIZADOS - Primero los más precisos)
    '.items[visible="true"]',          // Elementos visibles específicamente
    '.items:not([style*="display: none"])',  // Elementos no ocultos
    '.items',                          // Selector principal (fallback general)
    '.items.col-md-4',                 // Variante con tamaño
    '.todas-convocatorias .items',     // Con contenedor padre
    '.items .item',                    // Items anidados
    
    // empleospublicos.cl alternativas
    '.panel-oferta',
    '.oferta-item',
    '.job-offer',
    '.resultado',
    
    // Genéricos
    '.oferta', 
    '.job-item', 
    '.job-card',
    '[data-job]',
    '.item-oferta',
    '.resultado-busqueda',
    '.card-oferta',
    'article.resultado',
    'article[role="listitem"]',
    '[role="listitem"]',
    
    // Por clase parcial (menos específicos, como fallback)
    'div[class*="oferta"]',
    'div[class*="job"]',
    'div[class*="resultado"]',
    'div[class*="vacancy"]',
  ];

  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`[Filtro Empleos] Encontrados ${elements.length} trabajos usando selector: ${selector}`);
        return elements;
      }
    } catch (e) {
      // Algunos selectores pueden ser inválidos, ignorar y continuar
      console.debug(`[Filtro Empleos] Selector inválido: ${selector}`, e);
    }
  }

  // Si no encontramos con selectores específicos, buscar divs con contenido de trabajo
  return findJobsByContent();
}

function findJobsByContent() {
  // Estrategia alternativa: buscar elementos que contienen palabras clave de trabajo
  const allElements = document.querySelectorAll('div, article, section');
  const jobElements = [];

  for (const element of allElements) {
    const text = element.textContent?.toLowerCase() || '';
    // Buscar elementos que contengan palabras típicas de trabajos
    if (
      (text.includes('institución') || 
       text.includes('región') || 
       text.includes('sueldo') ||
       text.includes('plazo')) &&
      element.children.length > 0 &&
      element.offsetHeight > 50
    ) {
      // Verificar que no sea un contenedor muy grande
      if (element.offsetHeight < 1000) {
        jobElements.push(element);
      }
    }
  }

  return jobElements;
}

function shouldBlockJob(element) {
  if (filters.length === 0 && rubros.length === 0) {
    return false;
  }

  const text = normalizeText(element.textContent || '');
  
  // Bloquear si coincide con palabra clave personalizada
  if (filters.some((filter) => {
    const filterLower = normalizeText(filter);
    return text.includes(filterLower);
  })) {
    return true;
  }
  
  // Bloquear si coincide con algún rubro seleccionado
  if (rubros.length > 0) {
    for (const rubroId of rubros) {
      const keywords = getRubroKeywords(rubroId);
      for (const keyword of keywords) {
        if (text.includes(normalizeText(keyword))) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function resetJobs() {
  // Restaurar todos los trabajos filtrados
  const hiddenJobs = document.querySelectorAll('[data-filtered-by-extension="true"]');
  hiddenJobs.forEach((element) => {
    element.style.visibility = '';  // Restaurar visibilidad
    element.style.height = '';      // Restaurar altura
    element.style.overflow = '';    // Restaurar overflow
    element.style.padding = '';     // Restaurar padding
    element.style.margin = '';      // Restaurar margin
    element.style.border = '';      // Restaurar border
    delete element.dataset.filteredByExtension;
  });
  blockedCount = 0;
  console.log(`[Filtro Empleos] Restaurados ${hiddenJobs.length} trabajos`);
}

function updateBlockedCount() {
  // Guardar el contador para que se muestre en el popup
  chrome.storage.local.set({ blockedCount });
}

// Volver a filtrar cuando el DOM cambia (para sitios dinámicos)
const observer = new MutationObserver(() => {
  // Debounce para no filtrar constantemente
  clearTimeout(filterJobs.debounceTimer);
  filterJobs.debounceTimer = setTimeout(() => {
    resetJobs();
    filterJobs();
  }, 500);
});

// Observar cambios en el body
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

console.log('[Filtro Empleos] Content script cargado');

} // Fin del else - cierre del guard clause
