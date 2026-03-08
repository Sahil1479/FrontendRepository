/**
 * COMPONENT: Button
 * FILE: components/button/button.js
 *
 * Exposes a global: UIButton
 *
 * API:
 *   UIButton.setLoading(btnEl, isLoading)
 *   UIButton.setDisabled(btnEl, isDisabled)
 */
const UIButton = (() => {
  'use strict';

  function setLoading(btn, on) {
    if (!btn) return;
    btn.classList.toggle('ui-btn--loading', on);
    on ? btn.setAttribute('aria-busy', 'true') : btn.removeAttribute('aria-busy');
  }

  function setDisabled(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    on ? btn.setAttribute('aria-disabled', 'true') : btn.removeAttribute('aria-disabled');
  }

  return { setLoading, setDisabled };
})();
