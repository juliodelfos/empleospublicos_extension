// Contrato DOM del portal actual y fallback pequeño para el listado antiguo.
(function exposePortalAdapter(globalScope) {
  'use strict';

  const CURRENT_CARD_SELECTOR = '#results-cards .job-card';
  const LEGACY_CARD_SELECTOR = '.todas-convocatorias .items, .panel-oferta, .oferta-item, .card-oferta';
  const ALL_CARD_SELECTOR = `${CURRENT_CARD_SELECTOR}, ${LEGACY_CARD_SELECTOR}`;

  function dedupe(elements) {
    return Array.from(new Set(elements.filter(Boolean)));
  }

  function getResultsContainer() {
    return (
      document.querySelector('#results-cards') ||
      document.querySelector('.todas-convocatorias') ||
      document.querySelector('[data-results-container]')
    );
  }

  function findJobElements() {
    const currentCards = Array.from(document.querySelectorAll(CURRENT_CARD_SELECTOR));
    if (currentCards.length > 0) return currentCards;
    return dedupe(Array.from(document.querySelectorAll(LEGACY_CARD_SELECTOR)));
  }

  function findJobElementsIn(node) {
    if (!(node instanceof Element)) return [];

    const elements = [];
    if (node.matches(ALL_CARD_SELECTOR)) elements.push(node);

    const closest = node.closest(ALL_CARD_SELECTOR);
    if (closest) elements.push(closest);

    elements.push(...node.querySelectorAll(ALL_CARD_SELECTOR));
    return dedupe(elements);
  }

  function getJobText(element) {
    if (element.matches('.job-card')) {
      const parts = [
        element.querySelector('.deadline-pill'),
        element.querySelector('h3'),
        element.querySelector('.job-card__org'),
        element.querySelector('.job-card__body'),
        element.querySelector('.job-card__tags'),
      ];

      return parts.filter(Boolean).map((part) => part.textContent).join(' ');
    }

    return element.textContent || '';
  }

  function getJobLink(element) {
    const rawHref =
      element.getAttribute('data-href') ||
      element.querySelector('[data-calendar-url]')?.getAttribute('data-calendar-url') ||
      element.querySelector('a[data-card-link][href]')?.getAttribute('href') ||
      element.querySelector('.top h3 a[href], h3 a[href], a[href*="convocatorias"][href], a[href*="postular"][href]')?.getAttribute('href');

    if (!rawHref) return window.location.href;

    try {
      return new URL(rawHref, window.location.href).href;
    } catch (error) {
      return window.location.href;
    }
  }

  function getJobTitle(element) {
    return (
      element.querySelector('[data-calendar-title]')?.getAttribute('data-calendar-title') ||
      element.querySelector('h3 a, h3, h2 a, h2, .top h3')?.textContent?.trim() ||
      'Concurso Empleos Públicos'
    );
  }

  function getActionGroup(element) {
    const currentActions = element.querySelector('.job-card__footer-actions');
    if (currentActions) return currentActions;

    const footer = element.querySelector('.card-footer, .job-card__footer') || element;
    let actionGroup = footer.querySelector('.ep-card-actions');

    if (!actionGroup) {
      actionGroup = document.createElement('div');
      actionGroup.className = 'ep-card-actions';
      actionGroup.dataset.epOwned = 'true';
      footer.appendChild(actionGroup);
    }

    return actionGroup;
  }

  function getDeadlineTimestamp(element) {
    return element.querySelector('[data-calendar-close-ts]')?.getAttribute('data-calendar-close-ts') || '';
  }

  function getDeadlineText(element) {
    return [
      element.querySelector('[data-calendar-close]')?.getAttribute('data-calendar-close'),
      element.querySelector('.deadline-pill, .label-estado')?.textContent,
      element.textContent,
    ].filter(Boolean).join(' ');
  }

  function getRegionSelects() {
    return dedupe([
      document.querySelector('#filter-region'),
      document.querySelector('#hero-region-select'),
      ...document.querySelectorAll('select[aria-label*="Regi"], select[id*="region" i]'),
    ]);
  }

  globalScope.EPPortalAdapter = Object.freeze({
    CURRENT_CARD_SELECTOR,
    LEGACY_CARD_SELECTOR,
    getResultsContainer,
    findJobElements,
    findJobElementsIn,
    getJobText,
    getJobLink,
    getJobTitle,
    getActionGroup,
    getDeadlineTimestamp,
    getDeadlineText,
    getRegionSelects,
  });
})(globalThis);
