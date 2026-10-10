// Shared behaviour for all six templates. Three things: reveal-on-scroll, the showcase bar, and the
// hidden-page gate.

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll. Elements ship visible and are hidden here, so a script failure leaves a
  // readable page rather than an invisible one.
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length || reduced) return;

    items.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.dataset.revealDelay || 0);
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach((el) => io.observe(el));
  }

  // The showcase bar. Lets the client move
  // between templates without going back to the gallery every time.
  const TEMPLATES = [
    { dir: 't1-draught',   name: 'Draught',    tag: 'Editorial heritage' },
    { dir: 't2-brass',     name: 'Brass & Bone', tag: 'Deco liner' },
    { dir: 't3-tidewater', name: 'Tidewater',  tag: 'Light & air' },
    { dir: 't4-blueprint', name: 'Blueprint',  tag: 'Clyde-built' },
    { dir: 't5-nocturne',  name: 'Nocturne',   tag: 'Evening sailing' },
    { dir: 't6-cruises',   name: 'Queen Mary Cruises', tag: 'Commercial · for investors' }
  ];

  function initShowbar() {
    const current = document.body.dataset.template;
    if (!current) return;

    const index = TEMPLATES.findIndex((t) => t.dir === current);
    const me = TEMPLATES[index];
    if (!me) return;

    const prev = TEMPLATES[(index - 1 + TEMPLATES.length) % TEMPLATES.length];
    const next = TEMPLATES[(index + 1) % TEMPLATES.length];

    const bar = document.createElement('div');
    bar.className = 'showbar';
    bar.innerHTML =
      '<a class="showbar__back" href="../index.html">&#8592;&nbsp; All six</a>' +
      '<span class="showbar__name">' + (index + 1) + '. ' + me.name + '</span>' +
      '<span class="showbar__meta">' + me.tag + '</span>' +
      '<span class="showbar__spacer"></span>' +
      '<span class="showbar__hint">Hidden page code <b>1234</b></span>' +
      '<span class="showbar__nav">' +
        '<a href="../' + prev.dir + '/" title="Previous: ' + prev.name + '" aria-label="Previous template">&#8249;</a>' +
        '<a href="../' + next.dir + '/" title="Next: ' + next.name + '" aria-label="Next template">&#8250;</a>' +
      '</span>';

    document.body.appendChild(bar);

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowLeft' && e.altKey) location.href = '../' + prev.dir + '/';
      if (e.key === 'ArrowRight' && e.altKey) location.href = '../' + next.dir + '/';
    });
  }

  // The hidden page. A four-digit gate, 1234,
  // held in the browser only.
  const CODE = '1234';

  function initVault() {
    document.querySelectorAll('[data-vault]').forEach((vault) => {
      const gate = vault.querySelector('[data-vault-gate]');
      const content = vault.querySelector('[data-vault-content]');
      const form = vault.querySelector('[data-vault-form]');
      const input = vault.querySelector('[data-vault-input]');
      const error = vault.querySelector('[data-vault-error]');
      if (!gate || !content || !form || !input) return;

      content.hidden = true;

      const open = () => {
        vault.dataset.vaultState = 'open';
        gate.hidden = true;
        content.hidden = false;
        content.dispatchEvent(new CustomEvent('vault:open', { bubbles: true }));
        const h = content.querySelector('h1, h2, [tabindex="-1"]');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      };

      // Remembered per tab only, so a refresh mid-demo does not lock you out.
      try { if (sessionStorage.getItem('tsqm-demo-vault') === '1') open(); } catch (_) {}

      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 4);
        if (error) error.textContent = '';
        if (input.value.length === 4) form.requestSubmit();
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value === CODE) {
          try { sessionStorage.setItem('tsqm-demo-vault', '1'); } catch (_) {}
          open();
          return;
        }
        if (error) error.textContent = 'Not that one. Try 1234.';
        vault.dataset.vaultState = 'refused';
        input.value = '';
        input.focus();
        setTimeout(() => { vault.dataset.vaultState = ''; }, 600);
      });
    });
  }

  // Header that solidifies on scroll
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    const onScroll = () => header.toggleAttribute('data-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu
  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-menu]');
    if (!toggle || !panel) return;

    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.toggleAttribute('data-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    panel.addEventListener('click', (e) => { if (e.target.tagName === 'A') set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  function init() {
    initReveal(); initShowbar(); initVault(); initHeader(); initMenu(); photoMotion();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
