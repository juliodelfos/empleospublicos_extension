// Motor puro de reglas de filtrado, compartido por el content script y las pruebas.
(function exposeFilterCore(globalScope) {
  'use strict';

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compileRules({ filters = [], rubros = [], definitions = {} } = {}) {
    const keywordRules = [];
    const seenKeywords = new Set();

    filters.forEach((filter) => {
      const normalized = normalizeText(filter);
      if (!normalized || seenKeywords.has(normalized)) return;

      seenKeywords.add(normalized);
      keywordRules.push({
        type: 'keyword',
        label: String(filter).trim(),
        normalized,
      });
    });

    const rubroRules = rubros.flatMap((rubroId) => {
      const definition = definitions[rubroId];
      if (!definition) return [];

      const keywords = [];
      const seen = new Set();

      (definition.keywords || []).forEach((keyword) => {
        const normalized = normalizeText(keyword);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        keywords.push({ label: String(keyword).trim(), normalized });
      });

      if (keywords.length === 0) return [];

      return [{
        type: 'rubro',
        id: rubroId,
        label: definition.label || rubroId,
        keywords,
      }];
    });

    return { keywordRules, rubroRules };
  }

  function matchText(text, compiledRules, maxReasons = 3) {
    const normalizedText = normalizeText(text);
    const reasons = [];
    const rules = compiledRules || { keywordRules: [], rubroRules: [] };

    for (const rule of rules.keywordRules || []) {
      if (!normalizedText.includes(rule.normalized)) continue;
      reasons.push({ type: 'keyword', label: rule.label, keyword: rule.label });
      if (reasons.length >= maxReasons) return { blocked: true, reasons };
    }

    for (const rule of rules.rubroRules || []) {
      const match = rule.keywords.find((keyword) => normalizedText.includes(keyword.normalized));
      if (!match) continue;

      reasons.push({
        type: 'rubro',
        id: rule.id,
        label: rule.label,
        keyword: match.label,
      });

      if (reasons.length >= maxReasons) break;
    }

    return { blocked: reasons.length > 0, reasons };
  }

  globalScope.EPFilterCore = Object.freeze({
    normalizeText,
    compileRules,
    matchText,
  });
})(globalThis);
