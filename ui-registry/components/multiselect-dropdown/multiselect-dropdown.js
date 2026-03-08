/**
 * COMPONENT: Multiselect Dropdown
 * FILE: components/multiselect-dropdown/multiselect-dropdown.js
 *
 * Exposes a global: UIMultiselect
 *
 * API:
 *   UIMultiselect.init(fieldEl)
 *   UIMultiselect.initAll(scope?)
 *   UIMultiselect.getValues(fieldEl)         → string[]
 *   UIMultiselect.setError(fieldEl, msg)
 *   UIMultiselect.clearError(fieldEl)
 *   UIMultiselect.validate(fieldEl, opts)    — { required }
 *   UIMultiselect.open(fieldEl)
 *   UIMultiselect.close(fieldEl)
 */
const UIMultiselect = (() => {
  'use strict';

  const esc = s => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const $  = (el, s) => el.querySelector(s);
  const $$ = (el, s) => [...el.querySelectorAll(s)];

  const getTrigger = f => $(f, '[data-ms-trigger]');
  const getPanel   = f => $(f, '[data-ms-panel]');
  const getSearch  = f => $(f, '[data-ms-srch]');
  const getTags    = f => $(f, '[data-ms-tags]');
  const getPH      = f => $(f, '[data-ms-ph]');
  const getCount   = f => $(f, '[data-ms-count]');
  const getEmpty   = f => $(f, '[data-ms-empty]');
  const getOpts    = f => $$(f, '[data-ms-opt]');
  const getErrEl   = f => $(f, '.ui-field__err');

  const isOpen = f => getTrigger(f)?.getAttribute('aria-expanded') === 'true';
  const isSel  = o => o.getAttribute('aria-selected') === 'true';

  /* ---- Open / Close ---- */
  function open(f) {
    getTrigger(f)?.setAttribute('aria-expanded', 'true');
    getPanel(f)?.classList.add('open');
    const s = getSearch(f);
    if (s) { s.value = ''; filter(f, ''); s.focus(); }
  }

  function close(f) {
    getTrigger(f)?.setAttribute('aria-expanded', 'false');
    getPanel(f)?.classList.remove('open');
    $$(f, '.focused').forEach(o => o.classList.remove('focused'));
  }

  /* ---- Tag rendering ---- */
  function renderTags(f) {
    const tagsEl = getTags(f), ph = getPH(f), cnt = getCount(f);
    if (!tagsEl) return;
    const sel = getOpts(f).filter(isSel);
    tagsEl.innerHTML = '';
    sel.forEach(o => {
      const val   = o.dataset.msVal;
      const label = ($(o, '.ui-ms-lbl')?.textContent || '').trim();
      const t = document.createElement('span');
      t.className = 'ui-tag';
      t.innerHTML = `<span>${esc(label)}</span><button type="button" class="ui-tag__x" aria-label="Remove ${esc(label)}" data-rm="${esc(val)}">&#215;</button>`;
      tagsEl.appendChild(t);
    });
    tagsEl.querySelectorAll('[data-rm]').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const o = f.querySelector(`[data-ms-opt][data-ms-val="${b.dataset.rm}"]`);
        if (o) o.setAttribute('aria-selected', 'false');
        renderTags(f);
      });
    });
    if (ph)  ph.classList.toggle('hidden', sel.length > 0);
    if (cnt) cnt.textContent = sel.length ? `${sel.length} selected` : '';
  }

  /* ---- Filter ---- */
  function filter(f, q) {
    const query = q.toLowerCase().trim();
    let vis = 0;
    getOpts(f).forEach(o => {
      const lbl   = ($(o, '.ui-ms-lbl')?.textContent || '').toLowerCase();
      const match = !query || lbl.includes(query);
      o.classList.toggle('filtered', !match);
      if (match) vis++;
    });
    const emp = getEmpty(f);
    if (emp) emp.hidden = vis > 0;
  }

  /* ---- Keyboard navigation ---- */
  function moveFocus(f, dir) {
    const vis = getOpts(f).filter(o => !o.classList.contains('filtered'));
    const cur = vis.findIndex(o => o.classList.contains('focused'));
    vis.forEach(o => o.classList.remove('focused'));
    let nx = cur + dir;
    if (nx < 0) nx = vis.length - 1;
    if (nx >= vis.length) nx = 0;
    vis[nx]?.classList.add('focused');
    vis[nx]?.scrollIntoView({ block: 'nearest' });
  }

  function handleKey(e, f) {
    if (!isOpen(f)) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); open(f); }
      return;
    }
    switch (e.key) {
      case 'Escape':    e.preventDefault(); close(f); getTrigger(f)?.focus(); break;
      case 'ArrowDown': e.preventDefault(); moveFocus(f,  1); break;
      case 'ArrowUp':   e.preventDefault(); moveFocus(f, -1); break;
      case 'Enter':
      case ' ': {
        const fc = $(f, '.focused');
        if (fc) {
          e.preventDefault();
          fc.setAttribute('aria-selected', isSel(fc) ? 'false' : 'true');
          renderTags(f);
          clearError(f);
        }
        break;
      }
    }
  }

  /* ---- Error / Validation ---- */
  function setError(f, msg) {
    f.classList.add('ui-field--error');
    const e = getErrEl(f); if (e) e.textContent = msg;
  }

  function clearError(f) {
    f.classList.remove('ui-field--error');
    const e = getErrEl(f); if (e) e.textContent = '';
  }

  function getValues(f) {
    return getOpts(f).filter(isSel).map(o => o.dataset.msVal);
  }

  function validate(f, opts = {}) {
    const { required = false } = opts;
    if (required && getValues(f).length === 0) {
      setError(f, 'Please select at least one option.');
      return false;
    }
    clearError(f);
    return true;
  }

  /* ---- Init ---- */
  function init(f) {
    if (f.dataset.uiMsInit) return;
    renderTags(f);

    const trigger = getTrigger(f);
    const search  = getSearch(f);

    trigger?.addEventListener('click',   () => isOpen(f) ? close(f) : open(f));
    trigger?.addEventListener('keydown', e  => handleKey(e, f));

    getOpts(f).forEach(o => {
      o.addEventListener('click', () => {
        o.setAttribute('aria-selected', isSel(o) ? 'false' : 'true');
        renderTags(f);
        clearError(f);
        search?.focus();
      });
    });

    search?.addEventListener('input',   e => {
      filter(f, e.target.value);
      $$(f, '.focused').forEach(o => o.classList.remove('focused'));
    });
    search?.addEventListener('keydown', e => handleKey(e, f));

    $(f, '[data-ms-clear]')?.addEventListener('click', () => {
      getOpts(f).forEach(o => o.setAttribute('aria-selected', 'false'));
      renderTags(f);
    });

    document.addEventListener('click', e => { if (!f.contains(e.target)) close(f); });

    f.dataset.uiMsInit = '1';
  }

  function initAll(scope = document) {
    scope.querySelectorAll('[data-ms-field]').forEach(init);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => initAll())
    : initAll();

  return { init, initAll, getValues, setError, clearError, validate, open, close };
})();
