/**
 * COMPONENT: Password Input
 * FILE: components/password-input/password-input.js
 * Requires: textbox.js (UITextbox)
 *
 * Exposes a global: UIPassword
 *
 * API:
 *   UIPassword.init(fieldEl)
 *   UIPassword.initAll(scope?)
 *   UIPassword.getValue(fieldEl)          → raw value (not trimmed)
 *   UIPassword.validate(fieldEl, opts)    → { required, minLength }
 *   UIPassword.show(fieldEl) / hide(fieldEl)
 *   UIPassword.setError(fieldEl, msg)
 *   UIPassword.clearError(fieldEl)
 */
const UIPassword = (() => {
  'use strict';

  const inp = f => f.querySelector('.ui-field__input');
  const btn = f => f.querySelector('[data-pw-toggle]');

  function show(f) {
    const i = inp(f), b = btn(f);
    if (i) i.type = 'text';
    f.dataset.vis = '1';
    if (b) b.setAttribute('aria-label', 'Hide password');
  }

  function hide(f) {
    const i = inp(f), b = btn(f);
    if (i) i.type = 'password';
    f.dataset.vis = '0';
    if (b) b.setAttribute('aria-label', 'Show password');
  }

  const getValue = f => { const i = inp(f); return i ? i.value : ''; };

  function validate(f, opts = {}) {
    const { required = false, minLength } = opts;
    const val = getValue(f);
    if (required && !val)                           { UITextbox.setError(f, 'Password is required.');                          return false; }
    if (val && minLength && val.length < minLength) { UITextbox.setError(f, `Password must be at least ${minLength} characters.`); return false; }
    UITextbox.clearError(f);
    return true;
  }

  function init(f) {
    if (f.dataset.uiPwInit) return;
    if (typeof UITextbox !== 'undefined') UITextbox.init(f);
    const b = btn(f);
    if (b) {
      b.addEventListener('click', e => {
        e.preventDefault();
        f.dataset.vis === '1' ? hide(f) : show(f);
        inp(f)?.focus();
      });
    }
    f.dataset.uiPwInit = '1';
  }

  function initAll(scope = document) {
    scope.querySelectorAll('[data-pw-field]').forEach(init);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => initAll())
    : initAll();

  return {
    init, initAll, getValue, validate, show, hide,
    setError:   (f, m) => UITextbox.setError(f, m),
    clearError: f      => UITextbox.clearError(f),
  };
})();
