/**
 * COMPONENT: Data Table
 * FILE: components/data-table/data-table.js
 *
 * Exposes a global: UIDataTable
 *
 * API:
 *   UIDataTable.create(containerEl, config) → instance
 *
 * Config:
 *   columns:    [{ key, label, sortable?, render?(value, row) }]
 *   data:       []
 *   perPage:    10
 *   searchKeys: ['key1', 'key2']
 *   onEdit(row)
 *   onDelete(row)
 *   emptyTitle: string
 *   emptyDesc:  string
 *
 * Instance:
 *   .setData(rows)
 *   .addRow(row)
 *   .updateRow(key, value, newRow)
 *   .deleteRow(key, value)
 *   .getData()
 */
const UIDataTable = (() => {
  'use strict';

  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const EDIT_ICON   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const DELETE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  const SEARCH_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  const SORT_ICON   = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  const PREV_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
  const NEXT_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
  const EMPTY_ICON  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`;

  function create(container, cfg = {}) {
    const {
      columns    = [],
      data       = [],
      perPage    = 10,
      searchKeys = [],
      onEdit, onDelete,
      emptyTitle = 'No records found',
      emptyDesc  = 'Add a new entry using the form above.',
    } = cfg;

    let _data     = [...data];
    let _filtered = [...data];
    let _page     = 1;
    let _perPage  = perPage;
    let _search   = '';
    let _sortKey  = null;
    let _sortDir  = 'asc';

    /* ---- Build skeleton ---- */
    container.innerHTML = `
      <div class="ui-table-wrap">
        <div class="ui-table-toolbar">
          <div class="ui-table-toolbar__left">
            <div class="ui-table-search">
              <span class="ui-table-search__icon">${SEARCH_ICON}</span>
              <input class="ui-table-search__input" type="search" placeholder="Search…" aria-label="Search records" />
            </div>
          </div>
          <div class="ui-table-toolbar__right">
            <span class="ui-table-count"></span>
          </div>
        </div>
        <div class="ui-table-scroll">
          <table class="ui-table" role="grid">
            <thead><tr>
              ${columns.map(col => `
                <th class="${col.sortable ? 'sortable' : ''}" data-key="${esc(col.key)}">
                  ${esc(col.label)}
                  ${col.sortable ? `<span class="sort-icon" aria-hidden="true">${SORT_ICON}</span>` : ''}
                </th>`).join('')}
              <th>Actions</th>
            </tr></thead>
            <tbody class="ui-table-body"></tbody>
          </table>
        </div>
        <div class="ui-table-pagination">
          <div class="ui-table-pagination__info"></div>
          <div class="ui-table-pagination__pages"></div>
          <div class="ui-table-perpage">
            Rows per page:
            <select aria-label="Rows per page">
              ${[5, 10, 25, 50].map(n =>
                `<option value="${n}"${n === _perPage ? ' selected' : ''}>${n}</option>`
              ).join('')}
            </select>
          </div>
        </div>
      </div>`;

    const searchInput = container.querySelector('.ui-table-search__input');
    const countEl     = container.querySelector('.ui-table-count');
    const tbody       = container.querySelector('.ui-table-body');
    const pagesEl     = container.querySelector('.ui-table-pagination__pages');
    const infoEl      = container.querySelector('.ui-table-pagination__info');
    const perpageEl   = container.querySelector('.ui-table-perpage select');
    const headers     = container.querySelectorAll('th[data-key]');

    /* ---- Filter + sort ---- */
    function applyFilter() {
      const q = _search.toLowerCase().trim();
      const keys = searchKeys.length ? searchKeys : columns.map(c => c.key);
      _filtered = q
        ? _data.filter(row => keys.some(k => String(row[k] ?? '').toLowerCase().includes(q)))
        : [..._data];

      if (_sortKey) {
        _filtered.sort((a, b) => {
          const av = String(a[_sortKey] ?? '').toLowerCase();
          const bv = String(b[_sortKey] ?? '').toLowerCase();
          return _sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      _page = 1;
      render();
    }

    /* ---- Render ---- */
    function render() {
      const total = _filtered.length;
      const pages = Math.max(1, Math.ceil(total / _perPage));
      _page = Math.min(_page, pages);
      const start = (_page - 1) * _perPage;
      const slice = _filtered.slice(start, start + _perPage);

      countEl.textContent = total === _data.length
        ? `${total} record${total !== 1 ? 's' : ''}`
        : `${total} of ${_data.length} record${_data.length !== 1 ? 's' : ''}`;

      if (slice.length === 0) {
        tbody.innerHTML = `
          <tr><td colspan="${columns.length + 1}" style="padding:0">
            <div class="ui-table-empty">
              <div class="ui-table-empty__icon">${EMPTY_ICON}</div>
              <div class="ui-table-empty__title">${esc(emptyTitle)}</div>
              <div class="ui-table-empty__desc">${esc(emptyDesc)}</div>
            </div>
          </td></tr>`;
      } else {
        tbody.innerHTML = slice.map((row, i) => `
          <tr data-idx="${start + i}">
            ${columns.map(col => `<td>${col.render ? col.render(row[col.key], row) : esc(row[col.key])}</td>`).join('')}
            <td>
              <div class="ui-table-actions">
                <button class="ui-icon-btn ui-icon-btn--edit"   data-action="edit"   data-idx="${start + i}" title="Edit"   aria-label="Edit record">${EDIT_ICON}</button>
                <button class="ui-icon-btn ui-icon-btn--delete" data-action="delete" data-idx="${start + i}" title="Delete" aria-label="Delete record">${DELETE_ICON}</button>
              </div>
            </td>
          </tr>`).join('');
      }

      const from = total === 0 ? 0 : start + 1;
      const to   = Math.min(start + _perPage, total);
      infoEl.textContent = total === 0 ? 'No records' : `${from}–${to} of ${total}`;
      renderPages(pages);

      headers.forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.key === _sortKey)
          th.classList.add(_sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      });
    }

    function renderPages(total) {
      if (total <= 1) { pagesEl.innerHTML = ''; return; }
      const btns = [];
      const btn  = (label, page, active, disabled) =>
        `<button class="ui-page-btn${active ? ' active' : ''}" ${disabled ? 'disabled' : ''} data-goto="${page}" aria-label="Page ${page}">${label}</button>`;

      btns.push(`<button class="ui-page-btn" data-goto="${_page - 1}" ${_page === 1 ? 'disabled' : ''} aria-label="Previous">${PREV_ICON}</button>`);

      if (total <= 7) {
        for (let i = 1; i <= total; i++) btns.push(btn(i, i, i === _page, false));
      } else {
        btns.push(btn(1, 1, _page === 1, false));
        if (_page > 3) btns.push(`<span class="ui-page-sep">…</span>`);
        for (let i = Math.max(2, _page - 1); i <= Math.min(total - 1, _page + 1); i++)
          btns.push(btn(i, i, i === _page, false));
        if (_page < total - 2) btns.push(`<span class="ui-page-sep">…</span>`);
        btns.push(btn(total, total, _page === total, false));
      }

      btns.push(`<button class="ui-page-btn" data-goto="${_page + 1}" ${_page === total ? 'disabled' : ''} aria-label="Next">${NEXT_ICON}</button>`);
      pagesEl.innerHTML = btns.join('');
    }

    /* ---- Events ---- */
    searchInput.addEventListener('input', e => { _search = e.target.value; applyFilter(); });
    perpageEl.addEventListener('change', e => { _perPage = Number(e.target.value); _page = 1; render(); });

    headers.forEach(th => {
      if (!th.classList.contains('sortable')) return;
      th.addEventListener('click', () => {
        _sortKey  = _sortKey === th.dataset.key && _sortDir === 'asc' ? _sortKey : th.dataset.key;
        _sortDir  = _sortKey === th.dataset.key && _sortDir === 'asc' ? 'desc' : 'asc';
        // Simpler: toggle or set
        if (_sortKey === th.dataset.key) {
          _sortDir = _sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          _sortKey = th.dataset.key;
          _sortDir = 'asc';
        }
        applyFilter();
      });
    });

    tbody.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const row = _filtered[Number(btn.dataset.idx)];
      if (!row) return;
      if (btn.dataset.action === 'edit'   && typeof onEdit   === 'function') onEdit(row);
      if (btn.dataset.action === 'delete' && typeof onDelete === 'function') onDelete(row);
    });

    pagesEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-goto]');
      if (!btn || btn.disabled) return;
      _page = Number(btn.dataset.goto);
      render();
    });

    applyFilter();

    return {
      setData(rows)              { _data = [...rows]; _page = 1; _search = ''; searchInput.value = ''; applyFilter(); },
      addRow(row)                { _data.push(row); applyFilter(); },
      updateRow(key, val, patch) { const i = _data.findIndex(r => r[key] === val); if (i !== -1) { _data[i] = { ..._data[i], ...patch }; applyFilter(); } },
      deleteRow(key, val)        { _data = _data.filter(r => r[key] !== val); applyFilter(); },
      getData()                  { return [..._data]; },
    };
  }

  return { create };
})();