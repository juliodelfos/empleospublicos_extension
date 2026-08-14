// Orquestador de la extensión en empleospublicos.cl.
// La lógica pura vive en filter-core.js y el contrato DOM en portal-adapter.js.

function shouldRunOnThisPage() {
  const pathname = window.location.pathname.toLowerCase();

  if (
    pathname.includes('/pub/convocatorias/convpostularavisotrabajo.aspx') ||
    pathname.includes('/pub/convocatorias/convficha.aspx') ||
    pathname.includes('/pub/convocatorias/avisotrabajoficha.aspx') ||
    (pathname.includes('/pub/convocatorias/') && pathname.includes('avisotrabajo')) ||
    (pathname.includes('/pub/convocatorias/') && pathname.includes('postular'))
  ) {
    return false;
  }

  return !(
    pathname.includes('/pub/usuarios/') ||
    pathname.includes('/login') ||
    pathname.includes('/logout')
  );
}

if (shouldRunOnThisPage()) {
  (() => {
    'use strict';

    const core = globalThis.EPFilterCore;
    const portal = globalThis.EPPortalAdapter;

    if (!core || !portal) {
      document.documentElement.classList.remove('ep-filter-booting');
      return;
    }

    const FILTERED_CLASS = 'ep-filtered-hidden';
    const LIST_MODE_CLASS = 'ep-list-mode';
    const SELECTED_CLASS = 'ep-keyboard-selected';
    const REVEAL_CLASS = 'ep-reveal-hidden';
    const REGION_STORAGE_KEY = 'lastRegion';
    const MIN_VISIBLE_RESULTS = 6;
    const MAX_AUTO_LOAD_ATTEMPTS = 4;

    let filters = [];
    let rubros = [];
    let isPaused = false;
    let viewMode = 'grid';
    let revealHidden = false;
    let compiledRules = core.compileRules();
    let selectedListIndex = -1;
    let resultsObserver = null;
    let pageObserver = null;
    let filterControlsObserver = null;
    let observerTimer = null;
    let autoLoadAttempts = 0;
    let lastAutoLoadSignature = '';
    let savedRegionToApply = '';
    let hasStoredRegionPreference = false;
    let hasAppliedSavedRegion = false;
    let isApplyingSavedRegion = false;
    let regionInitAttempts = 0;

    const pendingCards = new Set();
    const cardTextCache = new WeakMap();

    function hasActiveRules() {
      return compiledRules.keywordRules.length > 0 || compiledRules.rubroRules.length > 0;
    }

    function getRubroDefinitions() {
      if (typeof getRubros !== 'function') return {};
      return Object.fromEntries(getRubros().map((rubro) => [rubro.id, rubro]));
    }

    function compileCurrentRules() {
      compiledRules = core.compileRules({
        filters,
        rubros,
        definitions: getRubroDefinitions(),
      });
    }

    function finishInitialBoot() {
      window.clearTimeout(window.__epFilterBootTimeout);
      document.documentElement.classList.remove('ep-filter-booting');
    }

    function isVisibleInPage(element) {
      if (!element?.isConnected) return false;
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
      return element.offsetParent !== null || element.getClientRects().length > 0;
    }

    function getCardText(element, invalidate = false) {
      if (invalidate) cardTextCache.delete(element);
      if (!cardTextCache.has(element)) {
        cardTextCache.set(element, portal.getJobText(element));
      }
      return cardTextCache.get(element);
    }

    function formatReasons(reasons) {
      return reasons.map((reason) => {
        if (reason.type === 'keyword') return `palabra: ${reason.label}`;
        return `rubro: ${reason.label} — ${reason.keyword}`;
      }).join(' · ');
    }

    function updateReasonBadge(element, reasons) {
      let badge = element.querySelector(':scope > .ep-filter-reason');

      if (reasons.length === 0) {
        badge?.remove();
        return;
      }

      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'ep-filter-reason';
        badge.dataset.epOwned = 'true';
        element.prepend(badge);
      }

      badge.textContent = `Oculta por ${formatReasons(reasons)}`;
    }

    function processJob(element, { invalidateText = false } = {}) {
      if (!element?.isConnected) return;

      const match = (!isPaused && hasActiveRules())
        ? core.matchText(getCardText(element, invalidateText), compiledRules)
        : { blocked: false, reasons: [] };

      element.classList.toggle(FILTERED_CLASS, match.blocked);

      if (match.blocked) {
        element.dataset.filteredByExtension = 'true';
      } else {
        delete element.dataset.filteredByExtension;
      }

      updateReasonBadge(element, match.reasons);
      enhanceJobCard(element);
    }

    function filterAllJobs({ invalidateText = false } = {}) {
      const jobElements = portal.findJobElements();
      jobElements.forEach((element) => processJob(element, { invalidateText }));

      clampSelectedListItem();
      applyRevealMode();
      updateInterfaceState();
      maybeAutoLoadMoreResults(jobElements);

      if (jobElements.length > 0 || isPaused || !hasActiveRules()) {
        finishInitialBoot();
      }
    }

    function getFilterState() {
      const jobs = portal.findJobElements();
      const hidden = jobs.filter((job) => job.classList.contains(FILTERED_CLASS)).length;

      return {
        total: jobs.length,
        visible: Math.max(0, jobs.length - hidden),
        hidden,
        paused: isPaused,
        viewMode,
        revealHidden,
      };
    }

    function updateInterfaceState() {
      const state = getFilterState();
      updateToolbar(state);

      chrome.runtime.sendMessage({
        action: 'updateTabBadge',
        hidden: state.hidden,
        paused: state.paused,
      }, () => void chrome.runtime.lastError);
    }

    function createToolbar() {
      const container = portal.getResultsContainer();
      if (!container) return null;

      let toolbar = document.getElementById('ep-filter-toolbar');
      if (toolbar) return toolbar;

      toolbar = document.createElement('section');
      toolbar.id = 'ep-filter-toolbar';
      toolbar.dataset.epOwned = 'true';
      toolbar.setAttribute('aria-label', 'Estado del filtro de la extensión');
      toolbar.innerHTML = `
        <span id="ep-filter-summary" aria-live="polite"></span>
        <span class="ep-filter-toolbar__actions">
          <button type="button" class="ep-filter-toolbar__button" id="ep-toggle-hidden"></button>
          <button type="button" class="ep-filter-toolbar__button" id="ep-refresh-filter">Actualizar filtro</button>
        </span>
      `;

      toolbar.querySelector('#ep-toggle-hidden').addEventListener('click', () => {
        revealHidden = !revealHidden;
        clearSelectedListItem();
        applyRevealMode();
        updateInterfaceState();
      });

      toolbar.querySelector('#ep-refresh-filter').addEventListener('click', () => {
        filterAllJobs({ invalidateText: true });
      });

      container.parentNode.insertBefore(toolbar, container);
      return toolbar;
    }

    function updateToolbar(state) {
      const toolbar = createToolbar();
      if (!toolbar) return;

      const summary = toolbar.querySelector('#ep-filter-summary');
      const toggleButton = toolbar.querySelector('#ep-toggle-hidden');

      if (state.paused) {
        summary.textContent = `${state.total} ofertas · filtrado en pausa`;
      } else {
        summary.textContent = `${state.total} ofertas · ${state.visible} visibles · ${state.hidden} ocultas`;
      }

      toggleButton.hidden = state.hidden === 0 || state.paused;
      toggleButton.textContent = state.revealHidden ? 'Volver a ocultar' : 'Mostrar ocultas';
      toggleButton.setAttribute('aria-pressed', state.revealHidden ? 'true' : 'false');
    }

    function applyRevealMode() {
      const container = portal.getResultsContainer();
      if (!container) return;
      container.classList.toggle(REVEAL_CLASS, revealHidden && !isPaused);
    }

    function maybeAutoLoadMoreResults(jobElements) {
      const container = document.querySelector('#results-cards');
      const button = document.querySelector('#load-more-btn');

      if (!hasActiveRules() || isPaused || !container || !button) {
        autoLoadAttempts = 0;
        lastAutoLoadSignature = '';
        return;
      }

      const visibleCount = jobElements.filter((element) => !element.classList.contains(FILTERED_CLASS)).length;
      if (visibleCount >= MIN_VISIBLE_RESULTS) {
        autoLoadAttempts = 0;
        lastAutoLoadSignature = '';
        return;
      }

      const canLoad = (
        !button.hidden &&
        !button.disabled &&
        !button.hasAttribute('data-fetching') &&
        isVisibleInPage(button)
      );

      if (!canLoad || autoLoadAttempts >= MAX_AUTO_LOAD_ATTEMPTS) return;

      const signature = `${jobElements.length}:${visibleCount}:${button.textContent}`;
      if (signature === lastAutoLoadSignature) return;

      lastAutoLoadSignature = signature;
      autoLoadAttempts += 1;
      window.setTimeout(() => {
        if (button.isConnected && !button.hidden && !button.disabled) button.click();
      }, 100);
    }

    function iconSvg(name) {
      const icons = {
        calendarPlus: '<svg class="ep-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path><path d="M12 14v4"></path><path d="M10 16h4"></path></svg>',
        copy: '<svg class="ep-action-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
      };
      return icons[name] || '';
    }

    function enhanceJobCard(element) {
      normalizeExistingCalendarButton(element);
      enhanceGoogleCalendarButton(element);
      enhanceCopyLinkButton(element);
      hideSocialShareBlock(element);
    }

    function normalizeExistingCalendarButton(element) {
      element.querySelectorAll('.calendar-link, .card-footer .cronograma').forEach((button) => {
        if (button.dataset.epCalendarReady === 'true') return;
        button.dataset.epCalendarReady = 'true';
        button.classList.add('ep-action-button', 'ep-calendarization-button');
        button.title = 'Ver calendarización';
        button.setAttribute('aria-label', 'Ver calendarización');
      });
    }

    function enhanceGoogleCalendarButton(element) {
      if (element.querySelector('.ep-google-calendar-button')) return;
      const actionGroup = portal.getActionGroup(element);
      if (!actionGroup) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ep-action-button ep-google-calendar-button';
      button.dataset.epOwned = 'true';
      button.title = 'Añadir fecha de cierre a Google Calendar';
      button.setAttribute('aria-label', button.title);
      button.innerHTML = `${iconSvg('calendarPlus')}<span>Añadir a Google Calendar</span>`;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const calendarUrl = buildGoogleCalendarUrl(element);
        if (!calendarUrl) {
          showTemporaryButtonLabel(button, 'Sin fecha');
          return;
        }
        window.open(calendarUrl, '_blank', 'noopener');
      });

      const nativeCalendar = actionGroup.querySelector('.calendar-link, .cronograma');
      if (nativeCalendar?.nextSibling) {
        actionGroup.insertBefore(button, nativeCalendar.nextSibling);
      } else {
        actionGroup.prepend(button);
      }
    }

    function enhanceCopyLinkButton(element) {
      if (element.querySelector('.ep-copy-link-button')) return;
      const actionGroup = portal.getActionGroup(element);
      if (!actionGroup) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ep-action-button ep-copy-link-button';
      button.dataset.epOwned = 'true';
      button.title = 'Copiar link del concurso';
      button.setAttribute('aria-label', button.title);
      button.innerHTML = `${iconSvg('copy')}<span class="ep-copy-link-text">Copiar link</span>`;

      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const copied = await copyText(portal.getJobLink(element));
        showCopyFeedback(button, copied ? 'Copiado' : 'No se pudo copiar');
      });

      const shareBlock = actionGroup.querySelector('.share-links, .compartir-social');
      if (shareBlock) actionGroup.insertBefore(button, shareBlock);
      else actionGroup.appendChild(button);
    }

    function hideSocialShareBlock(element) {
      element.querySelectorAll('.share-links, .compartir-social').forEach((shareBlock) => {
        shareBlock.classList.add('ep-social-hidden');
        shareBlock.setAttribute('aria-hidden', 'true');
      });
    }

    function getApplicationDeadlineDate(element) {
      const timestamp = portal.getDeadlineTimestamp(element);
      if (timestamp && /^\d+$/.test(timestamp)) {
        const date = new Date(Number(timestamp));
        if (!Number.isNaN(date.getTime())) return date;
      }

      const match = portal.getDeadlineText(element).match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
      if (!match) return null;

      const [, day, month, year] = match;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatCalendarDate(date) {
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }

    function buildGoogleCalendarUrl(element) {
      const closeDate = getApplicationDeadlineDate(element);
      if (!closeDate) return '';

      const nextDate = new Date(closeDate);
      nextDate.setDate(closeDate.getDate() + 1);
      const jobLink = portal.getJobLink(element);

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `[Postulación] ${portal.getJobTitle(element)}`,
        dates: `${formatCalendarDate(closeDate)}/${formatCalendarDate(nextDate)}`,
        details: [
          'Fecha de cierre de postulación.',
          '',
          jobLink,
          '',
          'Creado con Filtrar ofertas empleospublicos.cl https://link.yaob.cl/empleos-publicos',
        ].join('\n'),
      });

      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    async function copyText(text) {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (error) {
        // El fallback cubre navegadores sin permiso de Clipboard API.
      }

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.readOnly = true;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      textarea.remove();
      return copied;
    }

    function showTemporaryButtonLabel(button, label) {
      const originalHtml = button.innerHTML;
      button.textContent = label;
      window.clearTimeout(button.epTemporaryLabelTimer);
      button.epTemporaryLabelTimer = window.setTimeout(() => {
        button.innerHTML = originalHtml;
      }, 1400);
    }

    function showCopyFeedback(button, label) {
      const text = button.querySelector('.ep-copy-link-text');
      const originalLabel = text?.textContent || 'Copiar link';
      button.classList.add('ep-copy-link-button--copied');
      if (text) text.textContent = label;

      window.clearTimeout(button.epCopyFeedbackTimer);
      button.epCopyFeedbackTimer = window.setTimeout(() => {
        button.classList.remove('ep-copy-link-button--copied');
        if (text) text.textContent = originalLabel;
      }, 1400);
    }

    function createViewToggleButton() {
      if (!portal.getResultsContainer() || document.getElementById('ep-view-toggle')) return;

      const button = document.createElement('button');
      button.id = 'ep-view-toggle';
      button.type = 'button';
      button.dataset.epOwned = 'true';
      button.setAttribute('aria-label', 'Cambiar entre vista de grilla y lista');
      button.addEventListener('click', () => {
        viewMode = viewMode === 'list' ? 'grid' : 'list';
        chrome.storage.local.set({ viewMode }, () => {
          applyViewMode();
          button.blur();
          updateInterfaceState();
        });
      });

      document.body.appendChild(button);
      applyViewMode();
    }

    function applyViewMode() {
      const container = portal.getResultsContainer();
      const button = document.getElementById('ep-view-toggle');
      if (!container) return;

      const isList = viewMode === 'list';
      container.classList.toggle(LIST_MODE_CLASS, isList);

      if (button) {
        button.textContent = isList ? '☰' : '⊞';
        button.title = isList ? 'Cambiar a vista de grilla' : 'Cambiar a vista de lista';
        button.setAttribute('aria-pressed', isList ? 'true' : 'false');
      }

      if (!isList) clearSelectedListItem();
    }

    function getNavigableJobs() {
      return portal.findJobElements().filter((element) => {
        const allowedByFilter = revealHidden || !element.classList.contains(FILTERED_CLASS);
        return allowedByFilter && isVisibleInPage(element);
      });
    }

    function setupKeyboardNavigation() {
      if (document.body.dataset.epKeyboardNavigationReady === 'true') return;
      document.body.dataset.epKeyboardNavigationReady = 'true';

      document.addEventListener('keydown', (event) => {
        if (shouldIgnoreKeyboardShortcut(event)) return;
        const key = event.key.toLowerCase();
        if (!['j', 'k', 'enter'].includes(key)) return;

        const container = portal.getResultsContainer();
        if (!container?.classList.contains(LIST_MODE_CLASS)) return;

        if (key === 'enter') {
          const selected = getNavigableJobs()[selectedListIndex];
          const link = selected?.querySelector('a[data-card-link][href], h3 a[href], a[href*="convocatorias"][href]');
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
      const tagName = event.target?.tagName?.toLowerCase();
      return ['input', 'textarea', 'select', 'button'].includes(tagName) || event.target?.isContentEditable;
    }

    function moveListSelection(delta) {
      const jobs = getNavigableJobs();
      if (jobs.length === 0) {
        clearSelectedListItem();
        return;
      }

      selectedListIndex = selectedListIndex < 0 ? 0 : selectedListIndex + delta;
      if (selectedListIndex < 0) selectedListIndex = jobs.length - 1;
      if (selectedListIndex >= jobs.length) selectedListIndex = 0;

      portal.findJobElements().forEach((job) => job.classList.remove(SELECTED_CLASS));
      jobs[selectedListIndex].classList.add(SELECTED_CLASS);
      jobs[selectedListIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function clearSelectedListItem() {
      portal.findJobElements().forEach((job) => job.classList.remove(SELECTED_CLASS));
      selectedListIndex = -1;
    }

    function clampSelectedListItem() {
      const jobs = getNavigableJobs();
      if (selectedListIndex >= jobs.length) selectedListIndex = jobs.length - 1;
      if (jobs.length === 0) clearSelectedListItem();
    }

    function isExtensionNode(node) {
      return node instanceof Element && Boolean(
        node.dataset.epOwned === 'true' || node.closest('[data-ep-owned="true"]')
      );
    }

    function scheduleObserverFlush() {
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(() => {
        const cards = Array.from(pendingCards);
        pendingCards.clear();
        cards.forEach((card) => processJob(card, { invalidateText: true }));
        applyViewMode();
        applyRevealMode();
        updateInterfaceState();
        maybeAutoLoadMoreResults(portal.findJobElements());
        if (portal.findJobElements().length > 0) finishInitialBoot();
      }, 150);
    }

    function setupResultsObserver() {
      const container = portal.getResultsContainer();
      if (!container || resultsObserver?.epTarget === container) return;
      resultsObserver?.disconnect();

      resultsObserver = new MutationObserver((mutations) => {
        let shouldRefresh = false;

        mutations.forEach((mutation) => {
          if (isExtensionNode(mutation.target)) return;
          if (mutation.removedNodes.length > 0) shouldRefresh = true;

          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element) || isExtensionNode(node)) return;
            const cards = portal.findJobElementsIn(node);
            cards.forEach((card) => {
              pendingCards.add(card);
              cardTextCache.delete(card);
            });
            if (cards.length > 0) shouldRefresh = true;
          });
        });

        if (shouldRefresh) scheduleObserverFlush();
      });

      resultsObserver.epTarget = container;
      resultsObserver.observe(container, { childList: true, subtree: true });
    }

    function setupPageObserver() {
      if (pageObserver || portal.getResultsContainer()) return;

      pageObserver = new MutationObserver(() => {
        if (!portal.getResultsContainer()) return;
        pageObserver.disconnect();
        pageObserver = null;
        setupResultsObserver();
        createViewToggleButton();
        createToolbar();
        filterAllJobs();
      });

      pageObserver.observe(document.documentElement, { childList: true, subtree: true });
      window.setTimeout(() => {
        pageObserver?.disconnect();
        pageObserver = null;
      }, 12000);
    }

    function normalizeRegionValue(value) {
      return core.normalizeText(value)
        .replace(/\bo\b/g, '')
        .replace(/gral\./g, 'general')
        .replace(/[’']/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function findMatchingOptionValue(select, value) {
      if (!select) return null;
      if (!value) return '';

      const options = Array.from(select.options || []);
      const exact = options.find((option) => option.value === value);
      if (exact) return exact.value;

      const normalized = normalizeRegionValue(value);
      const match = options.find((option) => (
        normalizeRegionValue(option.value) === normalized ||
        normalizeRegionValue(option.textContent) === normalized
      ));
      return match ? match.value : null;
    }

    function syncRegionSelect(select, value) {
      const matchingValue = findMatchingOptionValue(select, value);
      if (!select || matchingValue === null) return false;

      select.value = matchingValue;
      if (select._comboSelect?.reset) select._comboSelect.reset(matchingValue);
      else if (window.refreshSearchableSelect) window.refreshSearchableSelect(select);
      return true;
    }

    function persistSelectedRegion(select) {
      if (isApplyingSavedRegion) return;
      chrome.storage.local.set({ [REGION_STORAGE_KEY]: select?.value || '' });
    }

    function setupRegionPersistence() {
      portal.getRegionSelects().forEach((select) => {
        if (select.dataset.epRegionPersistenceReady === 'true') return;
        select.dataset.epRegionPersistenceReady = 'true';
        ['change', 'input', 'blur'].forEach((eventName) => {
          select.addEventListener(eventName, () => persistSelectedRegion(select));
        });
      });
      setupFilterControlsObserver();
    }

    function applySavedRegionWhenReady() {
      setupRegionPersistence();
      if (!hasStoredRegionPreference || hasAppliedSavedRegion) return true;

      const targetSelect = portal.getRegionSelects().find((select) => (
        findMatchingOptionValue(select, savedRegionToApply) !== null
      ));
      if (!targetSelect) return false;

      isApplyingSavedRegion = true;
      const filterSelect = document.querySelector('#filter-region');
      const heroSelect = document.querySelector('#hero-region-select');
      const appliedFilter = syncRegionSelect(filterSelect, savedRegionToApply);
      const appliedHero = syncRegionSelect(heroSelect, savedRegionToApply);
      syncRegionSelect(targetSelect, savedRegionToApply);

      const dispatch = (select) => {
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };

      if (appliedHero) dispatch(heroSelect);
      if (appliedFilter) dispatch(filterSelect);
      if (!appliedHero && !appliedFilter) dispatch(targetSelect);

      hasAppliedSavedRegion = true;
      window.setTimeout(() => { isApplyingSavedRegion = false; }, 0);
      return true;
    }

    function initializeRegionPersistence() {
      if (applySavedRegionWhenReady() || regionInitAttempts >= 120) return;
      regionInitAttempts += 1;
      window.setTimeout(initializeRegionPersistence, 250);
    }

    function setupFilterControlsObserver() {
      const root = document.querySelector('.filters-sidebar, .hero-home') || document.body;
      if (!root || filterControlsObserver?.epTarget === root) return;
      filterControlsObserver?.disconnect();

      filterControlsObserver = new MutationObserver((mutations) => {
        const changed = mutations.some((mutation) => Array.from(mutation.addedNodes).some((node) => (
          node instanceof Element && (
            node.matches('select[aria-label*="Regi"], select[id*="region" i], option') ||
            node.querySelector('select[aria-label*="Regi"], select[id*="region" i], option')
          )
        )));
        if (!changed) return;
        setupRegionPersistence();
        initializeRegionPersistence();
      });

      filterControlsObserver.epTarget = root;
      filterControlsObserver.observe(root, { childList: true, subtree: true });
    }

    function loadState(callback) {
      chrome.storage.local.get(['filters', 'rubros', 'paused', 'viewMode', REGION_STORAGE_KEY], (result) => {
        filters = Array.isArray(result.filters) ? result.filters : [];
        rubros = Array.isArray(result.rubros) ? result.rubros : [];
        isPaused = Boolean(result.paused);
        viewMode = result.viewMode === 'list' ? 'list' : 'grid';
        hasStoredRegionPreference = Object.prototype.hasOwnProperty.call(result, REGION_STORAGE_KEY);
        savedRegionToApply = result[REGION_STORAGE_KEY] || '';
        compileCurrentRules();
        callback?.();
      });
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'getFilterState') {
        sendResponse(getFilterState());
        return;
      }

      if (message.action === 'setRevealHidden') {
        revealHidden = Boolean(message.value);
        clearSelectedListItem();
        applyRevealMode();
        updateInterfaceState();
        sendResponse(getFilterState());
        return;
      }

      if (message.action === 'refilter') {
        loadState(() => {
          if (isPaused) revealHidden = false;
          applyViewMode();
          initializeRegionPersistence();
          filterAllJobs();
          sendResponse(getFilterState());
        });
        return true;
      }
    });

    setupKeyboardNavigation();
    setupPageObserver();
    setupResultsObserver();
    createViewToggleButton();
    createToolbar();

    loadState(() => {
      applyViewMode();
      initializeRegionPersistence();
      filterAllJobs();
    });

    window.setTimeout(() => {
      setupResultsObserver();
      createViewToggleButton();
      createToolbar();
      filterAllJobs();
    }, 800);
  })();
} else {
  document.documentElement.classList.remove('ep-filter-booting');
}
