// Gallery motion. Plain JS rather than a framework so the page stays a static
// file GitHub Pages can serve with no build. Everything degrades: if this never
// runs the page is simply already in its finished state.

(function () {
  'use strict';

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split the headline into words so they can rise in sequence out of a clip.
  function splitHeadline() {
    const h = document.getElementById('headline');
    if (!h) return;
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'word';
      const inner = document.createElement('span');
      inner.textContent = w;
      inner.style.transitionDelay = (i * 70) + 'ms';
      outer.appendChild(inner);
      h.appendChild(outer);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  }

  // Cards arrive in sequence as the row reaches the viewport.
  function revealCards() {
    const cards = [...document.querySelectorAll('.card')];
    if (!cards.length || still) return;

    cards.forEach((c) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(26px)';
      c.style.transition =
        'opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1),' +
        ' border-color .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1)';
    });

    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
        }, i * 90);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    cards.forEach((c) => io.observe(c));

    // If the observer has not got to a card within two seconds, show it anyway.
    // Hidden content that depends on a callback firing is a bug waiting to
    // happen, and an invisible page is worse than one without the animation.
    setTimeout(() => {
      cards.forEach((c) => {
        if (c.style.opacity === '0') { c.style.opacity = '1'; c.style.transform = 'none'; }
      });
    }, 2000);
  }

  // Bronze hairline across the top showing how far down the page you are.
  function progress() {
    const bar = document.getElementById('prog');
    if (!bar) return;
    let ticking = false;
    const draw = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    }, { passive: true });
    draw();
  }

  function init() {
    splitHeadline();
    const yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
    progress();
    revealCards();
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
