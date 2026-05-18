// Script que se ejecuta en empleospublicos.cl y filtra empleos

// Guard: Solo ejecutar en empleospublicos.cl excepto sitio privado
// NO ejecutar en sitio privado o dashboard
function shouldRunOnThisPage() {
  const pathname = window.location.pathname;
  const normalizedPathname = pathname.toLowerCase();

  // BLOQUEAR: Páginas de detalle/postulación de una convocatoria.
  // Si hay filtros activos, el fallback por contenido puede confundir el detalle
  // completo con una "tarjeta" de trabajo y ocultar la página completa.
  if (
    normalizedPathname.includes('/pub/convocatorias/convpostularavisotrabajo.aspx') ||
    (normalizedPathname.includes('/pub/convocatorias/') && normalizedPathname.includes('avisotrabajo')) ||
    (normalizedPathname.includes('/pub/convocatorias/') && normalizedPathname.includes('postular'))
  ) {
    return false;
  }
  
  // BLOQUEAR: Sitio privado del usuario
  if (normalizedPathname.includes('/pub/usuarios/')) {
    return false;
  }
  
  // BLOQUEAR: Login/Logout
  if (normalizedPathname.includes('/login') || normalizedPathname.includes('/logout')) {
    return false;
  }
  
  // PERMITIR: Todo lo demás en empleospublicos.cl
  return true;
}

// Verificar si debemos ejecutar en esta página
if (!shouldRunOnThisPage()) {
  chrome.storage.local.set({ blockedCount: 0 });
  // No ejecutar nada más - simplemente terminar aquí
} else {
  // Encapsular todo en IIFE para evitar variables globales
  (function() {
    'use strict';

    // Flag de debug - poner en false para producción
    const DEBUG = false;

    function log(...args) {
      if (DEBUG) console.log('[Filtro Empleos]', ...args);
    }

    function warn(...args) {
      if (DEBUG) console.warn('[Filtro Empleos]', ...args);
    }

    let blockedCount = 0;
    let filters = [];
    let rubros = [];  // Rubros seleccionados
    let isPaused = false;  // Estado de pausa
    let selectedListIndex = -1;

// Normalizar texto: quitar acentos y convertir a minúsculas
// "Médico" → "medico", "MÉDICO" → "medico"
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')                    // Descomponer caracteres acentuados (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '');   // Remover marcas diacríticas
}

// Cargar filtros, rubros y estado de pausa al iniciar
chrome.storage.local.get(['filters', 'rubros', 'paused'], (result) => {
  filters = result.filters || [];
  rubros = result.rubros || [];
  isPaused = result.paused || false;
  // Esperar un poco para asegurar que el DOM esté listo
  setTimeout(() => {
    filterJobs();
  }, 150);
});

// Escuchar cambios en los filtros desde el popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'refilter') {
    // Recargar filtros, rubros y estado de pausa, luego volver a filtrar
    chrome.storage.local.get(['filters', 'rubros', 'paused'], (result) => {
      filters = result.filters || [];
      rubros = result.rubros || [];
      isPaused = result.paused || false;
      resetJobs();
      filterJobs();
      applySavedViewMode();
    });
  }
});

function filterJobs() {
  blockedCount = 0;

  // Revalidar por si el sitio cambia de URL/contenido sin recargar completamente.
  // Esto evita que la vista de detalle sea ocultada al navegar desde un listado.
  if (!shouldRunOnThisPage()) {
    resetJobs();
    updateBlockedCount();
    return;
  }

  // Si el filtrado está pausado, restaurar todos los trabajos y salir
  if (isPaused) {
    resetJobs();
    updateBlockedCount();
    return;
  }

  // Intentar encontrar los trabajos en la página
  // empleospublicos.cl usa diferentes estructuras según la página
  const jobElements = findJobElements();
  enhanceJobCards(jobElements);

  if (jobElements.length === 0) {
    warn('No se encontraron elementos de trabajo en esta página');
    updateBlockedCount();
    return;
  }

  jobElements.forEach((element) => {
    if (!element.dataset.filteredByExtension && !isVisibleInPage(element)) {
      return;
    }

    // Saltar si ya fue procesado previamente
    if (element.dataset.filteredByExtension === 'true') {
      if (element.classList.contains('ep-filtered-hidden')) {
        blockedCount++;
      }
      return;
    }

    if (shouldBlockJob(element)) {
      element.classList.add('ep-filtered-hidden');
      element.dataset.filteredByExtension = 'true';
      blockedCount++;
    }
  });

  updateBlockedCount();
  log(`Filtrado completado: ${blockedCount} trabajos ocultos de ${jobElements.length}`);
}

function findJobElements() {
  // Intentar múltiples selectores comunes para encontrar trabajos
  // NOTA: Usamos selectores que encuentren TODOS los elementos, incluso los ocultos
  const selectors = [
    // empleospublicos.cl específicos (primero los más precisos)
    '.todas-convocatorias .items',     // Con contenedor padre (más específico)
    '.items',                          // Selector principal
    '.items.col-md-4',                 // Variante con tamaño
    '.items.col-lg-4',                 // Otra variante con tamaño
    
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
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        log(`Encontrados ${elements.length} trabajos usando selector: ${selector}`);
        return elements;
      }
    } catch (e) {
      // Algunos selectores pueden ser inválidos, ignorar y continuar
    }
  }

  // Si no encontramos con selectores específicos, buscar divs con contenido de trabajo
  return findJobsByContent();
}

function isVisibleInPage(element) {
  if (!element.isConnected) return false;

  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    return false;
  }

  if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  return element.offsetParent !== null || element.getClientRects().length > 0;
}

function getVisibleJobElements() {
  return findJobElements().filter((element) => (
    !element.dataset.filteredByExtension &&
    isVisibleInPage(element)
  ));
}

function findJobsByContent() {
  // Estrategia alternativa: buscar elementos que contienen palabras clave de trabajo
  // Solo buscar dentro del contenedor de convocatorias para evitar falsos positivos
  const container = document.querySelector('.todas-convocatorias');
  const searchRoot = container || document.body;

  const allElements = searchRoot.querySelectorAll('div, article');
  const jobElements = [];
  const seenElements = new Set();

  for (const element of allElements) {
    // Evitar duplicados
    if (seenElements.has(element)) continue;

    // Ignorar elementos muy pequeños o muy grandes
    if (element.offsetHeight < 80 || element.offsetHeight > 800) continue;

    // Verificar que tenga estructura de card de trabajo
    const hasTitle = element.querySelector('h3, h4, h5');
    const hasLink = element.querySelector('a[href*="convocatorias"], a[href*="postular"]');
    const hasInstitution = element.textContent?.toLowerCase().includes('ministerio') ||
                           element.textContent?.toLowerCase().includes('servicio de salud');

    if (hasTitle && hasLink && hasInstitution) {
      // Verificar que no sea un contenedor padre de otro elemento ya encontrado
      const isParentOfExisting = jobElements.some((existing) => existing.contains(element));
      if (!isParentOfExisting) {
        // Remover elementos hijos que ya estén en la lista
        const childrenToRemove = jobElements.filter((existing) => element.contains(existing));
        childrenToRemove.forEach((child) => {
          jobElements.splice(jobElements.indexOf(child), 1);
          seenElements.delete(child);
        });

        jobElements.push(element);
        seenElements.add(element);
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
    element.classList.remove('ep-filtered-hidden');
    delete element.dataset.filteredByExtension;
  });
  blockedCount = 0;
  log(`Restaurados ${hiddenJobs.length} trabajos`);
}

function getJobLink(element) {
  const link = element.querySelector(
    '.top h3 a[href], h3 a[href], a[href*="convocatorias"][href], a[href*="postular"][href]'
  );

  return link ? new URL(link.getAttribute('href'), window.location.href).href : window.location.href;
}

function enhanceJobCards(jobElements = findJobElements()) {
  jobElements.forEach((element) => {
    const socialBlock = element.querySelector('.card-footer .compartir-social');
    if (!socialBlock || socialBlock.dataset.epCopyReady === 'true') return;

    socialBlock.dataset.epCopyReady = 'true';
    socialBlock.classList.add('ep-copy-link-wrapper');
    socialBlock.innerHTML = '';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ep-copy-link-button';
    button.title = 'Copiar link del concurso';
    button.setAttribute('aria-label', 'Copiar link del concurso');
    button.innerHTML = `
      <span class="ep-copy-link-icon" aria-hidden="true">⧉</span>
      <span class="ep-copy-link-text">Copiar link</span>
    `;

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const link = getJobLink(element);
      const copied = await copyText(link);
      showCopyFeedback(button, copied ? 'Copiado' : 'No se pudo copiar');
    });

    socialBlock.appendChild(button);
  });
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    warn('Clipboard API falló, usando fallback', e);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (e) {
    warn('Fallback de copiado falló', e);
  }

  textarea.remove();
  return copied;
}

function showCopyFeedback(button, label) {
  const text = button.querySelector('.ep-copy-link-text');
  const originalLabel = text?.textContent || 'Copiar link';

  button.classList.add('ep-copy-link-button--copied');
  if (text) text.textContent = label;

  clearTimeout(button.epCopyFeedbackTimer);
  button.epCopyFeedbackTimer = setTimeout(() => {
    button.classList.remove('ep-copy-link-button--copied');
    if (text) text.textContent = originalLabel;
  }, 1400);
}

function updateBlockedCount() {
  // Guardar el contador para que se muestre en el popup
  chrome.storage.local.set({ blockedCount });
}

// Volver a filtrar cuando el DOM cambia (para sitios dinámicos)
let observer = null;

function setupObserver() {
  // Observar solo el contenedor de convocatorias, no todo el body
  const target = document.querySelector('.todas-convocatorias');
  if (!target || observer) return;

  observer = new MutationObserver(() => {
    // Debounce para no filtrar constantemente
    clearTimeout(filterJobs.debounceTimer);
    filterJobs.debounceTimer = setTimeout(() => {
      resetJobs();
      filterJobs();
      enhanceJobCards();
      clampSelectedListItem();
    }, 800);
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });

  log('Observer configurado en .todas-convocatorias');
}

// Esperar a que el contenedor exista antes de configurar observer y botón de vista
let initComplete = false;

function initializeWhenReady() {
  if (initComplete) return;

  const container = document.querySelector('.todas-convocatorias');
  if (!container) return;

  initComplete = true;
  setupObserver();
  createViewToggleButton();
  applySavedViewMode();
  enhanceJobCards();
  setupKeyboardNavigation();
}

// Polling para esperar el contenedor
const waitForContainer = setInterval(() => {
  initializeWhenReady();
}, 300);

// Timeout de seguridad
setTimeout(() => {
  clearInterval(waitForContainer);
  if (!initComplete) {
    warn('No se encontró .todas-convocatorias en 10 segundos');
  }
}, 10000);

// ===== MODO DE VISTA (GRID / LISTA) =====

// Inyectar estilos CSS para el botón flotante y el modo lista
function injectViewModeStyles() {
  if (document.getElementById('ep-view-mode-styles')) return;

  const style = document.createElement('style');
  style.id = 'ep-view-mode-styles';
  style.textContent = `
    /* Botón flotante de cambio de vista */
    #ep-view-toggle {
      position: fixed;
      top: 80px;
      right: 16px;
      z-index: 99999;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #374151;
      transition: all 0.2s ease;
    }
    #ep-view-toggle:hover {
      background: #f3f4f6;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
      transform: scale(1.05);
    }
    #ep-view-toggle:active {
      transform: scale(0.95);
    }
    .ep-filtered-hidden {
      display: none !important;
    }
    /* Responsive para pantallas pequeñas */
    @media (max-width: 768px) {
      #ep-view-toggle {
        top: auto;
        bottom: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        font-size: 18px;
      }
    }
    @media (max-width: 480px) {
      #ep-view-toggle {
        bottom: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        font-size: 16px;
      }
    }

    /* Override del grid de Bootstrap para reacomodar cards automáticamente */
    .todas-convocatorias {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
      gap: 16px !important;
      width: 100% !important;
      max-width: none !important;
    }
    .todas-convocatorias .items,
    .todas-convocatorias .items.col-md-4,
    .todas-convocatorias .items.col-lg-4 {
      width: 100% !important;
      max-width: none !important;
      flex: 0 0 100% !important;
      flex-basis: 100% !important;
      float: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      clear: both !important;
    }
    .todas-convocatorias .items .item {
      height: 100% !important;
      box-sizing: border-box !important;
    }
    .todas-convocatorias .items .item .card-footer .ep-copy-link-wrapper {
      display: block;
    }
    .todas-convocatorias .items .item .card-footer .ep-copy-link-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      padding: 6px 10px;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      background: #eff6ff;
      color: #0f4c81;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .todas-convocatorias .items .item .card-footer .ep-copy-link-button:hover {
      background: #dbeafe;
      border-color: #93c5fd;
      color: #063b67;
    }
    .todas-convocatorias .items .item .card-footer .ep-copy-link-button:active {
      transform: scale(0.98);
    }
    .todas-convocatorias .items .item .card-footer .ep-copy-link-button--copied {
      background: #ecfdf5;
      border-color: #6ee7b7;
      color: #047857;
    }
    .todas-convocatorias .items .item .card-footer .ep-copy-link-icon {
      display: inline-block;
      font-size: 17px;
      line-height: 1;
    }

    /* Modo lista: override del grid de Bootstrap */
    .todas-convocatorias.ep-list-mode {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
      width: 100% !important;
      max-width: none !important;
      grid-template-columns: none !important;
    }
    .todas-convocatorias.ep-list-mode .items,
    .todas-convocatorias.ep-list-mode .items.col-md-4,
    .todas-convocatorias.ep-list-mode .items.col-lg-4 {
      width: 100% !important;
      max-width: none !important;
      flex: 0 0 100% !important;
      flex-basis: 100% !important;
      float: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      clear: both !important;
    }
    .todas-convocatorias.ep-list-mode .items .item {
      padding: 12px 16px !important;
      background: #ffffff !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 6px !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .todas-convocatorias.ep-list-mode .items.ep-keyboard-selected .item {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18), 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    }
    /* Fecha arriba */
    .todas-convocatorias.ep-list-mode .items .item .top .label-estado {
      font-size: 11px !important;
      padding: 2px 8px !important;
      display: inline-block !important;
      margin-bottom: 6px !important;
    }
    /* Título */
    .todas-convocatorias.ep-list-mode .items .item .top h3 {
      margin: 0 0 4px 0 !important;
      font-size: 15px !important;
      line-height: 1.4 !important;
      font-weight: 600 !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .top h3 a {
      color: #1a1a1a !important;
      text-decoration: none !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .top h3 a:hover {
      color: #2563eb !important;
      text-decoration: underline !important;
    }
    /* Lugar de trabajo */
    .todas-convocatorias.ep-list-mode .items .item .top > p {
      margin: 0 0 8px 0 !important;
      font-size: 13px !important;
      color: #6b7280 !important;
    }
    /* Separador */
    .todas-convocatorias.ep-list-mode .items .item hr {
      margin: 8px 0 !important;
      border-color: #f3f4f6 !important;
    }
    /* Ministerio, región y calendarización en una sola fila */
    .todas-convocatorias.ep-list-mode .items .item .cnt {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 4px !important;
      font-size: 13px !important;
      color: #4b5563 !important;
      flex-wrap: wrap !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .cnt p {
      margin: 0 !important;
      display: inline !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .cnt p:first-child::after {
      content: "·" !important;
      margin: 0 6px !important;
      color: #d1d5db !important;
    }
    /* Footer: solo calendarización, en línea con el texto */
    .todas-convocatorias.ep-list-mode .items .item .card-footer {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .card-footer > div {
      display: contents !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .card-footer .cronograma {
      font-size: 12px !important;
      padding: 2px 8px !important;
      margin: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .card-footer .cronograma::before {
      content: "·" !important;
      margin: 0 6px 0 0 !important;
      color: #d1d5db !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .card-footer .ep-copy-link-wrapper {
      display: inline-flex !important;
      margin-left: 8px !important;
    }
    .todas-convocatorias.ep-list-mode .items .item .card-footer .ep-copy-link-button {
      min-height: 28px !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
    }
    /* Ocultar contenido vacío del footer */
    .todas-convocatorias.ep-list-mode .items .item .card-footer-contenido {
      display: none !important;
    }
    .todas-convocatorias.ep-list-mode .items .box {
      display: none !important;
    }
    .todas-convocatorias.ep-list-mode .items .alert {
      margin: 6px 0 0 0 !important;
      font-size: 12px !important;
      padding: 4px 10px !important;
      display: inline-block !important;
    }
  `;
  document.head.appendChild(style);
}

// Crear botón flotante de cambio de vista
function createViewToggleButton() {
  if (document.getElementById('ep-view-toggle')) return;

  const button = document.createElement('button');
  button.id = 'ep-view-toggle';
  button.setAttribute('aria-label', 'Cambiar entre vista de grilla y lista');

  // Determinar icono según modo actual
  const isListMode = document.querySelector('.todas-convocatorias')?.classList.contains('ep-list-mode');
  button.textContent = isListMode ? '☰' : '⊞';
  updateViewToggleTooltip(button, isListMode);

  button.addEventListener('click', () => {
    const container = document.querySelector('.todas-convocatorias');
    if (!container) return;

    const isCurrentlyList = container.classList.contains('ep-list-mode');

    if (isCurrentlyList) {
      container.classList.remove('ep-list-mode');
      clearSelectedListItem();
      button.textContent = '⊞';
      updateViewToggleTooltip(button, false);
      chrome.storage.local.set({ viewMode: 'grid' });
    } else {
      container.classList.add('ep-list-mode');
      button.textContent = '☰';
      updateViewToggleTooltip(button, true);
      chrome.storage.local.set({ viewMode: 'list' });
      clampSelectedListItem();
    }
  });

  document.body.appendChild(button);
}

function updateViewToggleTooltip(button, isListMode) {
  button.title = isListMode
    ? 'Vista actual: Lista. Clic para cambiar a Grilla'
    : 'Vista actual: Grilla. Clic para cambiar a Lista';
}

// Aplicar modo de vista guardado
function applySavedViewMode() {
  chrome.storage.local.get(['viewMode'], (result) => {
    const viewMode = result.viewMode || 'grid';
    const container = document.querySelector('.todas-convocatorias');
    const button = document.getElementById('ep-view-toggle');

    if (!container || !button) return;

    if (viewMode === 'list') {
      container.classList.add('ep-list-mode');
      button.textContent = '☰';
      updateViewToggleTooltip(button, true);
    } else {
      container.classList.remove('ep-list-mode');
      clearSelectedListItem();
      button.textContent = '⊞';
      updateViewToggleTooltip(button, false);
    }
  });
}

function setupKeyboardNavigation() {
  if (document.body.dataset.epKeyboardNavigationReady === 'true') return;
  document.body.dataset.epKeyboardNavigationReady = 'true';

  document.addEventListener('keydown', (event) => {
    if (shouldIgnoreKeyboardShortcut(event)) return;

    const key = event.key.toLowerCase();
    if (key !== 'j' && key !== 'k' && key !== 'enter') return;

    const container = document.querySelector('.todas-convocatorias');
    if (!container?.classList.contains('ep-list-mode')) return;

    if (key === 'enter') {
      const selected = getVisibleJobElements()[selectedListIndex];
      if (!selected) return;

      const link = selected.querySelector('.top h3 a[href], h3 a[href], a[href*="convocatorias"][href], a[href*="postular"][href]');
      if (!link) return;

      event.preventDefault();
      link.click();
      return;
    }

    event.preventDefault();
    moveListSelection(key === 'j' ? 1 : -1);
  });
}

function shouldIgnoreKeyboardShortcut(event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return true;

  const target = event.target;
  if (!target) return false;

  const tagName = target.tagName?.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    tagName === 'button'
  );
}

function moveListSelection(direction) {
  const visibleJobs = getVisibleJobElements();
  if (visibleJobs.length === 0) {
    clearSelectedListItem();
    return;
  }

  const nextIndex = selectedListIndex < 0
    ? (direction > 0 ? 0 : visibleJobs.length - 1)
    : Math.max(0, Math.min(visibleJobs.length - 1, selectedListIndex + direction));

  selectListItem(nextIndex, visibleJobs);
}

function selectListItem(index, visibleJobs = getVisibleJobElements()) {
  clearSelectedListItem();

  const element = visibleJobs[index];
  if (!element) {
    selectedListIndex = -1;
    return;
  }

  selectedListIndex = index;
  element.classList.add('ep-keyboard-selected');
  element.setAttribute('tabindex', '-1');
  element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function clearSelectedListItem() {
  document.querySelectorAll('.ep-keyboard-selected').forEach((element) => {
    element.classList.remove('ep-keyboard-selected');
    element.removeAttribute('tabindex');
  });
  selectedListIndex = -1;
}

function clampSelectedListItem() {
  const container = document.querySelector('.todas-convocatorias');
  if (!container?.classList.contains('ep-list-mode')) {
    clearSelectedListItem();
    return;
  }

  const visibleJobs = getVisibleJobElements();
  if (visibleJobs.length === 0) {
    clearSelectedListItem();
    return;
  }

  if (selectedListIndex >= visibleJobs.length) {
    selectedListIndex = visibleJobs.length - 1;
  }

  if (selectedListIndex >= 0) {
    selectListItem(selectedListIndex, visibleJobs);
  }
}

// Inicializar modo de vista
function initViewMode() {
  injectViewModeStyles();
  // El botón y la aplicación del modo se manejan en initializeWhenReady()
  // para evitar duplicación con el observer
}

// ===== INICIALIZACIÓN =====
initViewMode();

log('Content script cargado');

  })(); // Fin del IIFE
} // Fin del else - cierre del guard clause
