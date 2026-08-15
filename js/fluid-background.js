/* ==========================================================================
   NEXA TECH DEV — fluid-background.js
   Builds the decorative line layer and drives the mouse-reactive ambient
   glow + subtle blob parallax. The blobs themselves drift via CSS
   keyframes (animations.css); this module only nudges their position
   in response to the cursor and scroll, and generates the low-opacity
   technical line artwork.
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildLines(container) {
    if (!container) return;
    const w = 1600, h = 1000;
    const parts = [];

    // large orbit rings, off-canvas centers so only arcs are visible
    const orbits = [
      { cx: 220, cy: 120, r: 260 },
      { cx: 1420, cy: 780, r: 340 },
      { cx: 1500, cy: 80, r: 160 },
      { cx: 60, cy: 900, r: 200 }
    ];
    orbits.forEach(o => {
      parts.push(`<circle cx="${o.cx}" cy="${o.cy}" r="${o.r}" fill="none" stroke="url(#lineGrad)" stroke-width="1"/>`);
    });

    // faint grid ticks along the top and bottom edges
    for (let i = 0; i < 14; i++) {
      const x = (w / 14) * i;
      parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="18" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`);
      parts.push(`<line x1="${x}" y1="${h}" x2="${x}" y2="${h - 18}" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`);
    }

    // technical polyline path, like a circuit trace
    parts.push(`<path d="M0,420 L180,420 L230,360 L520,360 L560,400 L900,400 L940,340 L1250,340 L1290,400 L1600,400"
      fill="none" stroke="url(#lineGrad)" stroke-width="1"/>`);
    parts.push(`<path d="M0,700 L140,700 L180,650 L460,650 L500,700 L840,700 L880,640 L1180,640 L1220,700 L1600,700"
      fill="none" stroke="url(#lineGrad)" stroke-width="1"/>`);

    container.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4fe0ff" stop-opacity=".8"/>
            <stop offset="100%" stop-color="#8a5cff" stop-opacity=".2"/>
          </linearGradient>
        </defs>
        ${parts.join('')}
      </svg>`;
  }

  function initGlow(glowEl) {
    if (!glowEl || reduceMotion) return;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let curX = targetX;
    let curY = targetY;
    let active = false;

    window.addEventListener('mousemove', (e) => {
      if (document.body.dataset.parallax === 'off') return;
      targetX = e.clientX;
      targetY = e.clientY;
      active = true;
      glowEl.style.opacity = '1';
    }, { passive: true });

    window.addEventListener('mouseleave', () => { glowEl.style.opacity = '0'; });

    function tick() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      if (active && document.body.dataset.fluid !== 'off') {
        glowEl.style.left = curX + 'px';
        glowEl.style.top = curY + 'px';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initBlobParallax(wrappers) {
    if (reduceMotion || !wrappers.length) return;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    function tick() {
      if (document.body.dataset.parallax !== 'off') {
        wrappers.forEach((wrap, i) => {
          const strength = (i + 1) * 7;
          wrap.style.transform = `translate3d(${(mx * strength).toFixed(2)}px, ${(my * strength).toFixed(2)}px, 0)`;
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function applyVisibility() {
    const backdrop = document.querySelector('.backdrop');
    if (!backdrop) return;
    const on = document.body.dataset.fluid !== 'off';
    backdrop.querySelectorAll('.backdrop__blob').forEach(b => {
      b.style.opacity = on ? '' : '0';
    });
    const glow = document.getElementById('backdrop-glow');
    if (glow) glow.style.display = document.body.dataset.glow === 'off' ? 'none' : '';
  }

  function init() {
    buildLines(document.getElementById('backdrop-lines'));
    initGlow(document.getElementById('backdrop-glow'));
    initBlobParallax(Array.from(document.querySelectorAll('.blob-parallax')));
    applyVisibility();
    document.addEventListener('nexa:settings-applied', applyVisibility);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
