/* ==========================================================================
   NEXA TECH DEV — animations.js
   Scroll choreography: reveal-on-enter, animated counters, the process
   timeline fill, the technology network lines, and 3D card tilt.
   Uses IntersectionObserver + requestAnimationFrame throughout, never
   scroll-position polling.
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     GENERIC REVEAL — any [data-reveal] element fades/slides in once
     --------------------------------------------------------------------- */
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal], .service-card, .stat-card');
    if (!targets.length) return;

    if (reduceMotion) {
      targets.forEach(t => t.classList.add('reveal'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((t, i) => {
      if (!t.style.getPropertyValue('--d')) {
        const staggerGroup = t.closest('.services-grid, .stats, .projects-grid');
        if (staggerGroup) {
          const siblings = Array.from(staggerGroup.children);
          const idx = siblings.indexOf(t);
          t.style.setProperty('--d', (idx * 0.09) + 's');
        }
      }
      io.observe(t);
    });
  }

  /* ---------------------------------------------------------------------
     ANIMATED COUNTERS
     --------------------------------------------------------------------- */
  function initCounters() {
    const cards = document.querySelectorAll('[data-stat]');
    if (!cards.length) return;

    const animate = (card) => {
      const target = parseFloat(card.dataset.value || '0');
      const suffix = card.dataset.suffix || '';
      const numEl = card.querySelector('[data-stat-num]');
      if (!numEl) return;
      if (reduceMotion) { numEl.textContent = target + suffix; return; }

      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        numEl.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    cards.forEach(c => io.observe(c));
  }

  /* ---------------------------------------------------------------------
     PROCESS TIMELINE — fill line + active stage as it scrolls through
     --------------------------------------------------------------------- */
  function initTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    const fill = timeline.querySelector('.timeline__track-fill');
    const items = Array.from(timeline.querySelectorAll('.timeline__item'));

    function update() {
      const rect = timeline.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.55;
      const total = rect.height;
      const progressed = Math.min(Math.max(viewportCenter - rect.top, 0), total);
      const pct = total ? (progressed / total) * 100 : 0;
      if (fill) fill.style.height = pct + '%';

      items.forEach(item => {
        const iRect = item.getBoundingClientRect();
        item.classList.toggle('is-active', iRect.top < viewportCenter);
      });
    }

    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { update(); raf = null; });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------
     TECHNOLOGY NETWORK — connecting lines drawn between node positions
     --------------------------------------------------------------------- */
  function initTechNetwork() {
    const network = document.querySelector('.tech-network');
    if (!network) return;
    const svg = network.querySelector('svg');
    const nodesWrap = network.querySelector('.tech-nodes');
    if (!svg || !nodesWrap) return;

    function buildLines() {
      const nodes = Array.from(nodesWrap.querySelectorAll('.tech-node'));
      const wrapRect = network.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);
      svg.innerHTML = '';

      const centers = nodes.map(n => {
        const r = n.getBoundingClientRect();
        return {
          x: r.left - wrapRect.left + r.width / 2,
          y: r.top - wrapRect.top + r.height / 2,
          el: n
        };
      });

      // connect each node to its two nearest neighbors for an organic mesh
      centers.forEach((c, i) => {
        const distances = centers
          .map((o, j) => ({ j, d: Math.hypot(o.x - c.x, o.y - c.y) }))
          .filter(o => o.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);

        distances.forEach(({ j }) => {
          const o = centers[j];
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', c.x); line.setAttribute('y1', c.y);
          line.setAttribute('x2', o.x); line.setAttribute('y2', o.y);
          line.dataset.a = i; line.dataset.b = j;
          svg.appendChild(line);
        });
      });

      nodes.forEach((node, i) => {
        node.addEventListener('mouseenter', () => {
          svg.querySelectorAll('line').forEach(line => {
            if (line.dataset.a == i || line.dataset.b == i) line.classList.add('is-lit');
          });
        });
        node.addEventListener('mouseleave', () => {
          svg.querySelectorAll('line').forEach(line => line.classList.remove('is-lit'));
        });
      });
    }

    buildLines();
    window.addEventListener('resize', () => {
      clearTimeout(window.__nexaTechResize);
      window.__nexaTechResize = setTimeout(buildLines, 200);
    });
  }

  /* ---------------------------------------------------------------------
     CARD 3D TILT — subtle perspective tilt following the cursor
     --------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion) return;
    const cards = document.querySelectorAll('.service-card, .project-card, .stat-card');
    cards.forEach(card => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        if (document.body.dataset.card3d === 'off') return;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (py * -8).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  function init() {
    initReveal();
    initCounters();
    initTimeline();
    initTechNetwork();
    initTilt();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
