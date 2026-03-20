/**
 * COMPONENT: Footer
 * FILE: components/footer/footer.js
 *
 * Exposes a global: UIFooter
 *
 * Handles:
 *   - Auto copyright year injection into [data-footer-year]
 *
 * API:
 *   UIFooter.init(footerEl)
 *   UIFooter.initAll(scope?)
 */
const UIFooter = (() => {
  'use strict';

  function init(footerEl) {
    if (!footerEl || footerEl.dataset.uiFooterInit) return;
    // Inject current year into any [data-footer-year] element
    footerEl.querySelectorAll('[data-footer-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
    footerEl.dataset.uiFooterInit = '1';
  }

  function initAll(scope = document) {
    scope.querySelectorAll('[data-footer]').forEach(init);
    // Also handle loose year spans not inside [data-footer]
    scope.querySelectorAll('[data-footer-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => initAll())
    : initAll();

  return { init, initAll };
})();
