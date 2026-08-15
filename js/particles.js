/* ==========================================================================
   NEXA TECH DEV — particles.js
   A light, canvas-based particle field: tiny, dim, slowly floating points
   with an occasional pulse. Kept intentionally sparse so it reads as
   atmosphere rather than noise, and scales down on mobile / low intensity.
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('particle-canvas');
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h, dpr;
  let running = true;
  let mouseX = -9999, mouseY = -9999;

  const COLORS = ['79,224,255', '138,92,255', '255,255,255'];

  function countForIntensity() {
    const intensity = document.body.dataset.intensity || 'medium';
    const isMobile = window.innerWidth < 720;
    const base = { low: 26, medium: 46, high: 70 }[intensity] || 46;
    return isMobile ? Math.round(base * 0.5) : base;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.5,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08 - 0.03,
      baseAlpha: Math.random() * 0.35 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulseSpeed: Math.random() * 0.015 + 0.004,
      pulsePhase: Math.random() * Math.PI * 2
    };
  }

  function seed() {
    const n = countForIntensity();
    particles = new Array(n).fill(0).map(makeParticle);
  }

  function step(time) {
    if (!running) { requestAnimationFrame(step); return; }
    ctx.clearRect(0, 0, w, h);

    if (document.body.dataset.particles !== 'off') {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // gentle attraction toward cursor, very subtle
        if (document.body.dataset.parallax !== 'off') {
          const dx = mouseX - p.x, dy = mouseY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160) {
            p.x += dx * 0.0018;
            p.y += dy * 0.0018;
          }
        }

        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.35 + 0.65;
        const alpha = p.baseAlpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.shadowColor = `rgba(${p.color},${alpha})`;
        ctx.shadowBlur = 4;
        ctx.fill();
      });
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => { resize(); seed(); });
  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  resize();
  seed();
  requestAnimationFrame(step);
})();
