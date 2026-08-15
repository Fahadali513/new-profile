/* ==========================================================================
   NEXA TECH DEV — main.js
   Shared chrome (navbar + footer), the cinematic intro sequence, the
   NEXA CORE hero visual, and general page wiring. Runs on every page.
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     NAVBAR + FOOTER — injected so markup stays in one place
     --------------------------------------------------------------------- */
  const NAV_LINKS = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'about.html', label: 'About', key: 'about' },
    { href: 'projects.html', label: 'Projects', key: 'projects' },
    { href: 'contact.html', label: 'Contact', key: 'contact' }
  ];

  function currentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '' || path === 'index.html') return 'home';
    return path.replace('.html', '');
  }

  function buildNavbar() {
    const root = document.getElementById('navbar-root');
    if (!root) return;
    const active = currentPage();
    const links = NAV_LINKS.map(l =>
      `<a href="${l.href}" class="${active === l.key ? 'is-active' : ''}">${l.label}</a>`
    ).join('');
    const drawerLinks = NAV_LINKS.map(l =>
      `<a href="${l.href}">${l.label}</a>`
    ).join('');

    root.innerHTML = `
      <nav class="navbar" id="navbar">
        <div class="navbar__inner">
          <a href="index.html" class="navbar__brand">
            <img src="assets/images/logo.png" alt="Nexa Tech Dev logo">
            NEXA TECH DEV
          </a>
          <div class="navbar__links">${links}</div>
          <a href="contact.html" class="btn btn--primary navbar__cta">Start a Project</a>
          <button class="navbar__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
            <span></span>
          </button>
        </div>
      </nav>
      <div class="navbar__drawer" id="navDrawer">
        ${drawerLinks}
        <a href="contact.html" class="btn btn--primary">Start a Project</a>
      </div>`;

    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('navDrawer');
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
    }));

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  function buildFooter() {
    const root = document.getElementById('footer-root');
    if (!root) return;
    root.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer__top">
            <div class="footer__brand">
              <a href="index.html" class="navbar__brand">
                <img src="assets/images/logo.png" alt="Nexa Tech Dev logo">
                NEXA TECH DEV
              </a>
              <p>Digital products built for the future — websites, platforms and business systems engineered end to end.</p>
            </div>
            <div class="footer__cols">
              <div class="footer__col">
                <h4>Navigate</h4>
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="projects.html">Projects</a>
                <a href="contact.html">Contact</a>
              </div>
              <div class="footer__col">
                <h4>Services</h4>
                <a href="index.html#services">Web Development</a>
                <a href="index.html#services">Business Systems</a>
                <a href="index.html#services">E-Commerce</a>
                <a href="index.html#services">UI/UX Design</a>
              </div>
              <div class="footer__col">
                <h4>Contact</h4>
                <a href="mailto:hello@nexatechdev.com" data-contact-email>hello@nexatechdev.com</a>
                <a href="tel:+15550194420" data-contact-phone>+1 (555) 019-4420</a>
              </div>
            </div>
          </div>
          <div class="footer__bottom">
            <span>&copy; ${new Date().getFullYear()} Nexa Tech Dev. All rights reserved.</span>
            <div class="footer__socials">
              <a href="#" data-social="github" aria-label="GitHub">GH</a>
              <a href="#" data-social="linkedin" aria-label="LinkedIn">IN</a>
              <a href="#" data-social="twitter" aria-label="Twitter / X">X</a>
              <a href="#" data-social="instagram" aria-label="Instagram">IG</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  /* ---------------------------------------------------------------------
     CINEMATIC INTRO — only plays once per browser session, home page only
     --------------------------------------------------------------------- */
  function playIntro() {
    const intro = document.getElementById('intro');
    if (!intro) { revealHero(); return; }

    const seen = sessionStorage.getItem('nexa_intro_seen');
    if (seen || reduceMotion) {
      intro.remove();
      revealHero();
      return;
    }

    document.body.classList.add('no-scroll');
    const words = intro.querySelectorAll('.intro__word');
    let i = 0;
    function showNext() {
      words.forEach(w => w.classList.remove('is-active'));
      if (i < words.length) {
        words[i].classList.add('is-active');
        i++;
        setTimeout(showNext, 1050);
      } else {
        setTimeout(() => {
          intro.classList.add('is-hidden');
          document.body.classList.remove('no-scroll');
          sessionStorage.setItem('nexa_intro_seen', '1');
          setTimeout(() => intro.remove(), 1100);
          revealHero();
        }, 500);
      }
    }
    setTimeout(showNext, 400);
  }

  function revealHero() {
    document.querySelectorAll('.hero__content, .core-wrap').forEach(el => el.classList.add('reveal'));
  }

  /* ---------------------------------------------------------------------
     NEXA CORE — the hero's signature rotating energy-core visual
     --------------------------------------------------------------------- */
  function buildCore() {
    const wrap = document.querySelector('.core-wrap svg');
    if (!wrap) return;

    const nodeCount = 10;
    let nodes = '';
    for (let i = 0; i < nodeCount; i++) {
      const angle = (Math.PI * 2 * i) / nodeCount;
      const r = 190 + (i % 3) * 22;
      const x = 300 + Math.cos(angle) * r;
      const y = 300 + Math.sin(angle) * r;
      nodes += `<circle class="core-node" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#4fe0ff" style="animation-delay:${(i * 0.3).toFixed(1)}s"/>`;
    }

    wrap.setAttribute('viewBox', '0 0 600 600');
    wrap.innerHTML = `
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4fe0ff" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#4fe0ff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4fe0ff"/>
          <stop offset="100%" stop-color="#8a5cff"/>
        </linearGradient>
      </defs>
      <circle cx="300" cy="300" r="240" fill="url(#coreGlow)"/>
      <g class="core-ring core-ring--1" fill="none" stroke="url(#ringGrad)" stroke-width="1" opacity="0.55">
        <ellipse cx="300" cy="300" rx="230" ry="230"/>
      </g>
      <g class="core-ring core-ring--2" fill="none" stroke="url(#ringGrad)" stroke-width="1" opacity="0.4">
        <ellipse cx="300" cy="300" rx="230" ry="90"/>
      </g>
      <g class="core-ring core-ring--3" fill="none" stroke="url(#ringGrad)" stroke-width="1" opacity="0.3">
        <ellipse cx="300" cy="300" rx="90" ry="230"/>
      </g>
      <circle cx="300" cy="300" r="150" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>
      <circle cx="300" cy="300" r="60" fill="none" stroke="#4fe0ff" stroke-width="1.5" opacity="0.7"/>
      <circle cx="300" cy="300" r="34" fill="rgba(79,224,255,.12)" stroke="#4fe0ff" stroke-width="1"/>
      ${nodes}`;

    if (reduceMotion) return;

    // subtle mouse-driven rotation + scroll-driven depth
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
    const container = document.querySelector('.core-wrap');
    window.addEventListener('mousemove', (e) => {
      if (document.body.dataset.parallax === 'off') return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetRY = ((e.clientX - cx) / rect.width) * 16;
      targetRX = -((e.clientY - cy) / rect.height) * 16;
    }, { passive: true });

    function tick() {
      curRX += (targetRX - curRX) * 0.06;
      curRY += (targetRY - curRY) * 0.06;
      wrap.style.transform = `perspective(900px) rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    window.addEventListener('scroll', () => {
      const scrolled = Math.min(window.scrollY / 900, 1);
      container.style.transform = `translateY(${scrolled * 40}px) scale(${1 - scrolled * 0.06})`;
      container.style.opacity = String(1 - scrolled * 0.5);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     BACKDROP BLOB MARKUP — injected once per page that has .backdrop
     --------------------------------------------------------------------- */
  function ensureBackdrop() {
    const backdrop = document.querySelector('.backdrop');
    if (!backdrop || backdrop.dataset.built) return;
    backdrop.dataset.built = '1';
    backdrop.innerHTML = `
      <div class="blob-parallax" style="top:-10%; right:-8%;">
        <div class="backdrop__blob blob-a" style="width:640px;height:640px;background:radial-gradient(circle at 35% 35%, #3d6bff, #8a5cff 55%, transparent 75%);"></div>
      </div>
      <div class="blob-parallax" style="bottom:-14%; left:-10%;">
        <div class="backdrop__blob blob-b" style="width:560px;height:560px;background:radial-gradient(circle at 60% 40%, #23e6c8, #3d6bff 60%, transparent 75%);"></div>
      </div>
      <div class="blob-parallax" style="top:34%; left:38%;">
        <div class="backdrop__blob blob-c" style="width:420px;height:420px;background:radial-gradient(circle, #8a5cff, transparent 70%); opacity:.35;"></div>
      </div>
      <div class="blob-parallax" style="top:6%; left:4%;">
        <div class="backdrop__blob blob-d" style="width:260px;height:260px;background:radial-gradient(circle, #4fe0ff, transparent 70%); opacity:.28;"></div>
      </div>
      <div class="backdrop__lines" id="backdrop-lines"></div>
      <div class="backdrop__grain"></div>
      <div class="backdrop__glow" id="backdrop-glow"></div>`;
  }

  function init() {
    ensureBackdrop();
    buildNavbar();
    buildFooter();
    buildCore();
    playIntro();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
