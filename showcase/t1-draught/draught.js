// Motion for this template. Plain JS so the page stays a static file: the hero
// photograph drifts and scales against the scroll, the restoration strip slides
// the other way, and the waterline fills once. All of it is skipped under
// reduced motion, and none of it is needed for the page to read.

(function () {
  'use strict';

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero parallax, driven off scroll position and nudged by the pointer.
  // One rAF loop for both so they never fight each other.
  function hero() {
    const media = document.getElementById('heroMedia');
    const strip = document.getElementById('stripRow');
    if (still || (!media && !strip)) return;

    let mx = 0, my = 0, target = { x: 0, y: 0 }, queued = false;

    const frame = () => {
      queued = false;
      const y = window.scrollY;

      if (media && y < window.innerHeight * 1.2) {
        // Ease the pointer offset so it trails the cursor rather than snapping.
        mx += (target.x - mx) * 0.08;
        my += (target.y - my) * 0.08;
        const scale = 1 + Math.min(y / window.innerHeight, 1) * 0.12;
        media.style.transform =
          `translate3d(${mx}px, ${y * 0.22 + my}px, 0) scale(${scale.toFixed(4)})`;
      }

      if (strip) {
        const r = strip.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          // Drift the row left as its section crosses the viewport.
          const p = 1 - (r.top + r.height) / (innerHeight + r.height);
          strip.style.transform = `translate3d(${(-p * 160).toFixed(1)}px, 0, 0)`;
        }
      }
    };

    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };

    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue, { passive: true });
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      target.x = (e.clientX / innerWidth - 0.5) * 26;
      target.y = (e.clientY / innerHeight - 0.5) * 16;
      queue();
    }, { passive: true });

    // Keep easing while the pointer offset is still settling.
    setInterval(() => { if (Math.abs(target.x - mx) > 0.3) queue(); }, 60);
    queue();
  }

  // The waterline rises once, on first view, and never again.
  function waterline() {
    const fill = document.getElementById('waterfill');
    if (!fill) return;
    const level = 'translateY(0)';
    if (still) { fill.style.transform = level; return; }
    new IntersectionObserver((es, o) => {
      es.forEach((e) => { if (e.isIntersecting) { fill.style.transform = level; o.disconnect(); } });
    }, { threshold: 0.4 }).observe(fill.closest('figure'));
  }

  const go = () => { hero(); waterline(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
