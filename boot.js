// Oculta brevemente el listado mientras se aplica el primer filtrado.
(function startFilterBoot() {
  'use strict';

  const pathname = window.location.pathname.toLowerCase();
  const isHome = pathname === '/' || pathname.endsWith('/index.aspx');
  if (!isHome) return;

  document.documentElement.classList.add('ep-filter-booting');
  window.__epFilterBootTimeout = window.setTimeout(() => {
    document.documentElement.classList.remove('ep-filter-booting');
  }, 1500);
})();
