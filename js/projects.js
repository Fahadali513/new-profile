/* ==========================================================================
   NEXA TECH DEV — projects.js
   Renders project cards from storage.js and drives the animated filter
   system on the full projects page. On the homepage it renders a
   featured-only preview grid with no filter UI.
   ========================================================================== */

(function () {
  'use strict';

  function cardHTML(p) {
    const tags = (p.technologies || []).slice(0, 3).map(t => `<span>${t}</span>`).join('');
    return `
      <article class="project-card glass" data-cursor="project" data-category="${(p.category || '').toLowerCase()}" data-id="${p.id}">
        <div class="glass__sweep"></div>
        <div class="project-card__media">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <span class="project-card__tag">${p.category}</span>
        </div>
        <div class="project-card__body">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div class="project-card__tech">${tags}</div>
        </div>
      </article>`;
  }

  function renderFeatured() {
    const grid = document.getElementById('featuredProjects');
    if (!grid || !window.NexaStorage) return;
    const projects = window.NexaStorage.getProjects()
      .filter(p => p.status === 'published' && p.featured);
    grid.innerHTML = projects.slice(0, 6).map(cardHTML).join('');
  }

  function renderFullGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid || !window.NexaStorage) return;

    const projects = window.NexaStorage.getProjects().filter(p => p.status === 'published');
    grid.innerHTML = projects.map(cardHTML).join('');

    const filterBar = document.getElementById('projectsFilter');
    if (!filterBar) return;

    const categories = ['all', ...new Set(projects.map(p => (p.category || '').toLowerCase()))];
    filterBar.innerHTML = categories.map(c =>
      `<button data-filter="${c}" class="${c === 'all' ? 'is-active' : ''}">${c}</button>`
    ).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter, grid);
    });
  }

  function applyFilter(filter, grid) {
    const cards = Array.from(grid.querySelectorAll('.project-card'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (reduceMotion) {
        card.style.display = match ? '' : 'none';
        return;
      }
      if (match) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.classList.remove('fade-out');
          card.classList.add('fade-in');
        });
      } else {
        card.classList.remove('fade-in');
        card.classList.add('fade-out');
        setTimeout(() => { if (card.classList.contains('fade-out')) card.style.display = 'none'; }, 350);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderFeatured();
    renderFullGrid();
  });
})();
