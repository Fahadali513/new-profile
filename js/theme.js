/* ==========================================================================
   NEXA TECH DEV — theme.js
   Reads settings from storage.js and applies them to the live page:
   hero copy, stats, contact details, socials, and the animation toggles
   that other modules (fluid-background, particles, cursor) read from
   document.body dataset before they boot.
   ========================================================================== */

(function () {
  'use strict';

  function applyAnimationFlags(settings) {
    const anim = settings.animation || {};
    const body = document.body;
    body.dataset.fluid = anim.fluidBackground === false ? 'off' : 'on';
    body.dataset.particles = anim.particles === false ? 'off' : 'on';
    body.dataset.cursor = anim.customCursor === false ? 'off' : 'on';
    body.dataset.parallax = anim.parallax === false ? 'off' : 'on';
    body.dataset.card3d = anim.card3d === false ? 'off' : 'on';
    body.dataset.glow = anim.ambientGlow === false ? 'off' : 'on';
    body.dataset.intensity = anim.intensity || 'medium';
  }

  function applyHeroCopy(settings) {
    const label = document.querySelector('[data-hero-label]');
    const heading = document.querySelector('[data-hero-heading]');
    const desc = document.querySelector('[data-hero-desc]');
    if (label && settings.heroLabel) label.textContent = settings.heroLabel;
    if (heading && settings.heroHeading) heading.textContent = settings.heroHeading;
    if (desc && settings.heroDescription) desc.textContent = settings.heroDescription;
  }

  function applyStats(settings) {
    const nodes = document.querySelectorAll('[data-stat]');
    if (!nodes.length || !settings.stats) return;
    nodes.forEach((node, i) => {
      const s = settings.stats[i];
      if (!s) return;
      node.dataset.value = s.value;
      node.dataset.suffix = s.suffix || '';
      const label = node.querySelector('[data-stat-label]');
      if (label) label.textContent = s.label;
      const num = node.querySelector('[data-stat-num]');
      if (num) num.textContent = '0' + (s.suffix || '');
    });
  }

  function applyContact(settings) {
    document.querySelectorAll('[data-contact-email]').forEach(el => {
      el.textContent = settings.contactEmail;
      if (el.tagName === 'A') el.href = 'mailto:' + settings.contactEmail;
    });
    document.querySelectorAll('[data-contact-phone]').forEach(el => {
      el.textContent = settings.contactPhone;
      if (el.tagName === 'A') el.href = 'tel:' + settings.contactPhone.replace(/[^\d+]/g, '');
    });
    if (settings.socials) {
      Object.keys(settings.socials).forEach(key => {
        document.querySelectorAll('[data-social="' + key + '"]').forEach(el => {
          el.href = settings.socials[key] || '#';
        });
      });
    }
  }

  function init() {
    if (!window.NexaStorage) return;
    const settings = window.NexaStorage.getSettings();
    applyAnimationFlags(settings);
    applyHeroCopy(settings);
    applyStats(settings);
    applyContact(settings);
    document.dispatchEvent(new CustomEvent('nexa:settings-applied', { detail: settings }));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
