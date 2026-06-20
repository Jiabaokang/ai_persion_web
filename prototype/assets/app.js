/* ==========================================================================
   AI Personal Website — Interactions
   Theme toggle | Mobile drawer | Tag filter | Nav active state
   ========================================================================== */

(function () {
  'use strict';

  const html = document.documentElement;
  const body = document.body;

  /* ---------- Theme persistence ---------- */
  const THEME_KEY = 'ai-personal-website-theme';
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const themeBtn = document.querySelector('[data-theme-toggle]');
    if (themeBtn) {
      const isLight = theme === 'light';
      themeBtn.setAttribute('aria-label', isLight ? '切换到深色模式' : '切换到浅色模式');
    }
  }
  setTheme(getTheme());

  /* ---------- Theme toggle buttons ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Mobile drawer ---------- */
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const drawer = document.querySelector('[data-drawer]');
  const drawerOverlay = document.querySelector('[data-drawer-overlay]');
  const drawerClose = document.querySelector('[data-drawer-close]');

  function openDrawer() {
    drawer?.classList.add('is-open');
    drawerOverlay?.classList.add('is-open');
    body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer?.classList.remove('is-open');
    drawerOverlay?.classList.remove('is-open');
    body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('is-open')) closeDrawer();
  });

  /* ---------- Active nav link (by data-page) ---------- */
  const currentPage = document.body.getAttribute('data-page');
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    if (link.getAttribute('data-nav-link') === currentPage) {
      link.classList.add('is-active');
    }
  });

  /* ---------- Tag filter (list pages) ---------- */
  const filterBar = document.querySelector('[data-tag-filter]');
  const cardsContainer = document.querySelector('[data-cards]');

  if (filterBar && cardsContainer) {
    const cards = Array.from(cardsContainer.querySelectorAll('[data-card]'));

    function getSelectedTags() {
      const params = new URLSearchParams(location.search);
      const fromUrl = (params.get('tag') || '').split(',').filter(Boolean);
      const fromUI = Array.from(
        filterBar.querySelectorAll('.tag.is-selected')
      ).map((el) => el.getAttribute('data-tag'));
      // Prefer UI state, fallback to URL
      return fromUI.length ? fromUI : fromUrl;
    }

    function applyFilter(tags) {
      let visible = 0;
      cards.forEach((card) => {
        const cardTags = (card.getAttribute('data-tags') || '').split(',').filter(Boolean);
        const match = tags.length === 0 || cardTags.some((t) => tags.includes(t));
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      const empty = cardsContainer.querySelector('[data-empty]');
      if (empty) empty.style.display = visible === 0 ? '' : 'none';
    }

    function syncURL(tags) {
      const url = new URL(location.href);
      if (tags.length) url.searchParams.set('tag', tags.join(','));
      else url.searchParams.delete('tag');
      history.replaceState(null, '', url.toString());
    }

    // Initialize from URL
    const initial = new URLSearchParams(location.search).get('tag');
    if (initial) {
      const tags = initial.split(',').filter(Boolean);
      filterBar.querySelectorAll('.tag').forEach((el) => {
        if (tags.includes(el.getAttribute('data-tag'))) el.classList.add('is-selected');
      });
      applyFilter(tags);
    }

    filterBar.addEventListener('click', (e) => {
      const tag = e.target.closest('.tag');
      if (!tag) return;
      tag.classList.toggle('is-selected');
      const selected = Array.from(filterBar.querySelectorAll('.tag.is-selected')).map(
        (el) => el.getAttribute('data-tag')
      );
      applyFilter(selected);
      syncURL(selected);
    });

    // Clear all
    const clearBtn = document.querySelector('[data-tag-clear]');
    clearBtn?.addEventListener('click', () => {
      filterBar.querySelectorAll('.tag.is-selected').forEach((el) => el.classList.remove('is-selected'));
      applyFilter([]);
      syncURL([]);
    });
  }

  /* ---------- Search input (visual only) ---------- */
  const searchInput = document.querySelector('[data-search]');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('[data-card]');
    cards.forEach((card) => {
      const text = (card.textContent || '').toLowerCase();
      card.style.display = q === '' || text.includes(q) ? '' : 'none';
    });
  });

  /* ---------- Reveal on scroll (lightweight) ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }
})();
