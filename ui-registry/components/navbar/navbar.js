/**
 * COMPONENT: Navigation Bar
 * FILE: components/navbar/navbar.js
 *
 * Exposes a global: UINavbar
 *
 * API:
 *   UINavbar.init(navEl)
 *   UINavbar.initAll(scope?)
 *   UINavbar.setActive(navEl, href)
 *   UINavbar.setUser(navEl, { name, email, role, initials, avatarUrl })
 *   UINavbar.onLogout(navEl, callback)
 *
 * Markup contract:
 *   [data-nav]           root <nav>
 *   [data-nav-toggle]    dropdown trigger button
 *   [data-nav-dropdown]  dropdown panel
 *   [data-nav-hamburger] mobile menu toggle button
 *   [data-nav-mobile]    mobile drawer panel (sibling of <nav>, NOT inside it)
 *   [data-nav-logout]    logout button(s)
 *   [data-nav-username]  user name injection targets
 *   [data-nav-email]     user email injection targets
 *   [data-nav-role]      user role injection targets
 *   [data-nav-initials]  avatar initials injection targets
 *   [data-nav-avatar]    avatar <img> elements
 *   [data-page]          href value for active-state matching
 */
const UINavbar = (() => {
  'use strict';

  const esc = s => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const $   = (el, s) => el.querySelector(s);
  const $$  = (el, s) => [...el.querySelectorAll(s)];

  // Must match CSS breakpoint in navbar.css: @media (max-width: 768px)
  const MOBILE_BREAKPOINT = 768;

  /* Close all open desktop dropdowns */
  function closeAllDropdowns(nav) {
    $$(nav, '.ui-nav__item--open').forEach(item => {
      item.classList.remove('ui-nav__item--open');
      const btn = $(item, '[data-nav-toggle]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* Close all open accordion items inside the mobile drawer */
  function closeMobItems(panel) {
    (panel || document).querySelectorAll('.ui-nav__mob-item--open').forEach(item => {
      item.classList.remove('ui-nav__mob-item--open');
    });
  }

  /* Fully reset mobile drawer to closed state */
  function closeMobileDrawer(panel, hamburger) {
    panel.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    closeMobItems(panel);
  }

  /* Desktop dropdown logic */
  function initDropdowns(nav) {
    $$(nav, '[data-nav-toggle]').forEach(btn => {
      const item = btn.closest('.ui-nav__item');
      if (!item) return;

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = item.classList.contains('ui-nav__item--open');
        closeAllDropdowns(nav);
        if (!isOpen) {
          item.classList.add('ui-nav__item--open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      btn.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeAllDropdowns(nav); btn.focus(); }
      });

      const dropdown = $(item, '[data-nav-dropdown]');
      if (dropdown) {
        dropdown.addEventListener('keydown', e => {
          if (e.key === 'Escape') { closeAllDropdowns(nav); btn.focus(); }
        });
      }
    });

    document.addEventListener('click', () => closeAllDropdowns(nav));
  }

  /* Mobile drawer logic */
  function initMobile(nav) {
    const hamburger = $(nav, '[data-nav-hamburger]');
    if (!hamburger) return;

    // The drawer lives OUTSIDE <nav> as a sibling, so $(nav, ...) won't find it.
    // Use aria-controls to locate it by ID — that's what aria-controls is for.
    const panelId = hamburger.getAttribute('aria-controls');
    const panel   = (panelId && document.getElementById(panelId))
                 || (nav.parentElement && nav.parentElement.querySelector('[data-nav-mobile]'))
                 || document.querySelector('[data-nav-mobile]');

    if (!panel) return;

    // Toggle open/close
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      if (panel.classList.contains('open')) {
        closeMobileDrawer(panel, hamburger);
      } else {
        panel.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    // Accordion submenus
    $$(panel, '[data-mob-toggle]').forEach(btn => {
      const item = btn.closest('.ui-nav__mob-item');
      if (!item) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('ui-nav__mob-item--open');
        closeMobItems(panel);
        if (!isOpen) item.classList.add('ui-nav__mob-item--open');
      });
    });

    // Close when a link is followed
    $$(panel, 'a').forEach(a => {
      a.addEventListener('click', () => closeMobileDrawer(panel, hamburger));
    });

    // ------------------------------------------------------------------
    // AUTO-CLOSE WHEN RESIZING BACK TO DESKTOP
    //
    // Problem: user opens mobile drawer → drags viewport wider →
    //   hamburger hides via CSS but the drawer stays open and
    //   body overflow stays 'hidden', making the page unscrollable.
    //
    // Fix: watch the nav element's rendered width with ResizeObserver.
    //   The moment it exceeds the mobile breakpoint, close the drawer.
    //   This fires immediately on resize (not debounced), ensuring the
    //   page never gets stuck in a broken scroll state.
    // ------------------------------------------------------------------
    function handleResize(width) {
      if (width > MOBILE_BREAKPOINT && panel.classList.contains('open')) {
        closeMobileDrawer(panel, hamburger);
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(entries => handleResize(entries[0].contentRect.width)).observe(nav);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', () => handleResize(window.innerWidth));
    }
  }

  /* Active link management */
  function setActive(nav, href) {
    $$(nav, '.ui-nav__link, .ui-nav__drop-item, .ui-nav__mob-link, .ui-nav__mob-sub-link')
      .forEach(el => {
        const match = el.getAttribute('href') === href || el.dataset.page === href;
        el.classList.toggle('active', match);
      });
  }

  function autoActive(nav) {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    setActive(nav, path);
    $$(nav, '[data-page]').forEach(el => {
      if (el.dataset.page === path) el.classList.add('active');
    });
  }

  /* User data injection */
  function setUser(nav, user = {}) {
    const { name = '', email = '', role = '', initials = '', avatarUrl = '' } = user;
    const derived = initials || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

    $$(nav, '[data-nav-username]').forEach(el => { el.textContent = name; });
    $$(nav, '[data-nav-email]').forEach(el => { el.textContent = email; });
    $$(nav, '[data-nav-role]').forEach(el => {
      el.textContent = role;
      if (!role) el.style.display = 'none';
    });
    $$(nav, '[data-nav-initials]').forEach(el => {
      if (avatarUrl) { el.innerHTML = `<img src="${esc(avatarUrl)}" alt="${esc(name)}" />`; }
      else           { el.textContent = derived; }
    });
    $$(nav, '[data-nav-avatar]').forEach(img => {
      if (avatarUrl) { img.src = avatarUrl; img.alt = name; img.style.display = ''; }
      else           { img.style.display = 'none'; }
    });
  }

  /* Logout handler */
  function onLogout(nav, cb) {
    $$(document, '[data-nav-logout]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        closeAllDropdowns(nav);
        if (typeof cb === 'function') cb(e);
      });
    });
  }

  /* Init */
  function init(nav) {
    if (!nav || nav.dataset.uiNavInit) return;
    initDropdowns(nav);
    initMobile(nav);
    autoActive(nav);
    nav.dataset.uiNavInit = '1';
  }

  function initAll(scope = document) {
    scope.querySelectorAll('[data-nav]').forEach(init);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => initAll())
    : initAll();

  return { init, initAll, setActive, setUser, onLogout };
})();
