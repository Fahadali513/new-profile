/* ==========================================================================
   NEXA TECH DEV — cursor.js
   Custom glowing cursor with two elements: a tight dot that tracks
   instantly, and a ring that eases toward the pointer for a fluid,
   trailing feel. Grows over cards/buttons and shows "VIEW PROJECT" over
   project panels. Disabled entirely on touch devices.
   ========================================================================== */

(function () {
  'use strict';

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) return;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.cursor === 'off') return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring is-hidden';
    document.body.append(dot, ring);
    document.documentElement.classList.add('has-custom-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let shown = false;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      if (!shown) { ring.classList.remove('is-hidden'); shown = true; }
    }, { passive: true });

    window.addEventListener('mouseleave', () => ring.classList.add('is-hidden'));

    function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function setState(el) {
      ring.classList.remove('is-card', 'is-button', 'is-project');
      if (!el) return;
      if (el.closest('[data-cursor="project"]')) ring.classList.add('is-project');
      else if (el.closest('button, .btn, a[data-cursor="button"]')) ring.classList.add('is-button');
      else if (el.closest('.glass, [data-cursor="card"]')) ring.classList.add('is-card');
    }

    document.addEventListener('mouseover', (e) => setState(e.target));
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) setState(null);
    });

    document.addEventListener('nexa:settings-applied', () => {
      if (document.body.dataset.cursor === 'off') {
        dot.style.display = 'none';
        ring.style.display = 'none';
      } else {
        dot.style.display = '';
        ring.style.display = '';
      }
    });
  });
})();
