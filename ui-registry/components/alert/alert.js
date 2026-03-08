/**
 * COMPONENT: Alert / Notification Banner
 * FILE: components/alert/alert.js
 *
 * Exposes a global: UIAlert
 *
 * API:
 *   UIAlert.show(alertEl)
 *   UIAlert.hide(alertEl)
 *   UIAlert.setMessage(alertEl, title, message)
 *   UIAlert.create(type, message, title?, dismissible?)   → HTMLElement
 *   UIAlert.showInContainer(containerEl, type, message, title?, autoDismissMs?)
 *
 *   type: 'error' | 'warning' | 'success' | 'info'
 */
const UIAlert = (() => {
  'use strict';

  const ICONS = {
    error:   `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    success: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    info:    `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const CLOSE_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const esc = s => String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function show(el) {
    if (!el) return;
    el.hidden = false;
    el.classList.remove('hidden', 'dismissing');
  }

  // function hide(el) {
  //   if (!el) return;
  //   el.classList.add('dismissing');
  //   const done = () => {
  //     el.hidden = true;
  //     el.classList.remove('dismissing');
  //     el.removeEventListener('animationend', done);
  //   };
  //   el.addEventListener('animationend', done);
  // }

  function hide(el) {
    if (!el || el.classList.contains('dismissing')) return;
    
    el.classList.add('dismissing');

    const removeEl = () => {
      if (el.parentNode) {
        el.remove();
      }
    };

    // Listen for the CSS animation to finish
    el.addEventListener('animationend', removeEl, { once: true });

    // Fallback: If for some reason the animation fails/blocked, remove after 400ms
    setTimeout(removeEl, 400);
  }

  function setMessage(el, title, message) {
    if (!el) return;
    const t = el.querySelector('.ui-alert__title');
    const m = el.querySelector('.ui-alert__msg');
    if (t && title   !== undefined) t.textContent = title;
    if (m && message !== undefined) m.textContent = message;
  }

  function create(type, message, title, dismissible = true) {
    const el = document.createElement('div');
    el.className = `ui-alert ui-alert--${type}${dismissible ? ' ui-alert--dismissible' : ''}`;
    el.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    el.setAttribute('aria-live', type === 'error' || type === 'warning' ? 'assertive' : 'polite');
    el.setAttribute('data-alert', '');

    el.innerHTML = `
      <span class="ui-alert__icon" aria-hidden="true">${ICONS[type] || ICONS.info}</span>
      <div class="ui-alert__body">
        ${title ? `<span class="ui-alert__title">${esc(title)}</span>` : ''}
        <span class="ui-alert__msg">${esc(message)}</span>
      </div>
      ${dismissible ? `<button type="button" class="ui-alert__x" aria-label="Dismiss alert" data-alert-close>${CLOSE_SVG}</button>` : ''}
    `;

    el.querySelector('[data-alert-close]')?.addEventListener('click', () => hide(el));
    return el;
  }

  function showInContainer(container, type, message, title, autoDismissMs) {
    if (!container) return;
    // Replace any existing alert of the same type
    container.querySelectorAll(`.ui-alert--${type}`).forEach(a => a.remove());
    const el = create(type, message, title);
    container.appendChild(el);
    if (autoDismissMs) setTimeout(() => hide(el), autoDismissMs);
    return el;
  }

  // Bind dismiss buttons on static HTML
  function bindAll(scope = document) {
    scope.querySelectorAll('[data-alert-close]').forEach(b => {
      b.addEventListener('click', () => {
        const a = b.closest('[data-alert]');
        if (a) hide(a);
      });
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => bindAll())
    : bindAll();

  return { show, hide, setMessage, create, showInContainer };
})();
