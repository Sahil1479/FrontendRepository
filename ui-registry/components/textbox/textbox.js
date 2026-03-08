/**
 * COMPONENT: Text Box Input
 * FILE: components/textbox/textbox.js
 *
 * Exposes a global: UITextbox
 *
 * API:
 *   UITextbox.init(fieldEl)
 *   UITextbox.initAll(scope?)
 *   UITextbox.setError(fieldEl, msg)
 *   UITextbox.clearError(fieldEl)
 *   UITextbox.getValue(fieldEl)           → trimmed string
 *   UITextbox.validate(fieldEl, opts)
 *     opts: { required, minLength, maxLength, pattern, patternMsg, label }
 */
const UITextbox = (() => {
  'use strict';

  const q = (el, s) => el.querySelector(s);

  function setError(fieldEl, msg) {
    fieldEl.classList.add('ui-field--error');
    fieldEl.classList.remove('ui-field--success');
    const e = q(fieldEl, '.ui-field__err');  if (e) e.textContent = msg;
    const i = q(fieldEl, '.ui-field__input'); if (i) i.setAttribute('aria-invalid', 'true');
  }

  function clearError(fieldEl) {
    fieldEl.classList.remove('ui-field--error');
    const e = q(fieldEl, '.ui-field__err');  if (e) e.textContent = '';
    const i = q(fieldEl, '.ui-field__input'); if (i) i.removeAttribute('aria-invalid');
  }

  function getValue(fieldEl) {
    const i = q(fieldEl, '.ui-field__input');
    return i ? i.value.trim() : '';
  }

  function validate(fieldEl, opts = {}) {
    const {
      required = false, minLength, maxLength,
      pattern, patternMsg = 'Invalid format', label
    } = opts;
    const lbl = label
      || (q(fieldEl, '.ui-field__label')?.textContent.replace('*', '').trim())
      || 'This field';
    const val = getValue(fieldEl);

    if (required && !val)                            { setError(fieldEl, `${lbl} is required.`);                          return false; }
    if (val && minLength && val.length < minLength)  { setError(fieldEl, `${lbl} must be at least ${minLength} characters.`); return false; }
    if (val && maxLength && val.length > maxLength)  { setError(fieldEl, `${lbl} must not exceed ${maxLength} characters.`);  return false; }
    if (val && pattern && !new RegExp(pattern).test(val)) { setError(fieldEl, patternMsg); return false; }

    clearError(fieldEl);
    return true;
  }

  function init(fieldEl) {
    const input = q(fieldEl, '.ui-field__input');
    if (!input || input.dataset.uiInit) return;
    input.addEventListener('input', () => {
      if (fieldEl.classList.contains('ui-field--error')) clearError(fieldEl);
    });
    input.dataset.uiInit = '1';
  }

  function initAll(scope = document) {
    scope.querySelectorAll('.ui-field[data-field]').forEach(init);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => initAll())
    : initAll();

  return { init, initAll, setError, clearError, getValue, validate };
})();
