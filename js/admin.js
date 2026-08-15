/* ==========================================================================
   NEXA TECH DEV — admin.js
   Drives the admin shell: sidebar injection, a lightweight session guard
   (demo-only — NOT real authentication), and the dashboard / projects /
   messages / settings pages. Everything persists through storage.js.
   ========================================================================== */

(function () {
  'use strict';

  const NAV_ITEMS = [
    { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
    { href: 'projects.html', label: 'Projects', key: 'projects' },
    { href: 'messages.html', label: 'Messages', key: 'messages' },
    { href: 'settings.html', label: 'Settings', key: 'settings' }
  ];

  function currentAdminPage() {
    return (window.location.pathname.split('/').pop() || 'dashboard.html').replace('.html', '');
  }

  function guardSession() {
    const page = currentAdminPage();
    if (page === 'login') return;
    if (!window.NexaStorage || !window.NexaStorage.hasSession()) {
      window.location.href = 'login.html';
    }
  }

  function buildSidebar() {
    const root = document.getElementById('adminSidebar');
    if (!root) return;
    const active = currentAdminPage();
    const links = NAV_ITEMS.map(item =>
      `<a href="${item.href}" class="${active === item.key ? 'is-active' : ''}"><span class="dot"></span>${item.label}</a>`
    ).join('');

    root.innerHTML = `
      <div class="admin-side__brand">
        <img src="../assets/images/logo.png" alt="Nexa logo"> NEXA / ADMIN
      </div>
      <nav class="admin-nav">${links}</nav>
      <div class="admin-side__footer">
        <a href="../index.html">&larr; View live site</a><br><br>
        <a href="#" id="logoutLink">Log out</a>
      </div>`;

    const logout = document.getElementById('logoutLink');
    if (logout) logout.addEventListener('click', (e) => {
      e.preventDefault();
      window.NexaStorage.setSession(false);
      window.location.href = 'login.html';
    });
  }

  /* ---------------------------------------------------------------------
     LOGIN — demo-only gate, no real backend to authenticate against
     --------------------------------------------------------------------- */
  function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    if (window.NexaStorage.hasSession()) {
      window.location.href = 'dashboard.html';
      return;
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.NexaStorage.setSession(true);
      window.location.href = 'dashboard.html';
    });
  }

  /* ---------------------------------------------------------------------
     DASHBOARD
     --------------------------------------------------------------------- */
  function initDashboard() {
    const grid = document.getElementById('dashStats');
    if (!grid) return;
    const projects = window.NexaStorage.getProjects();
    const messages = window.NexaStorage.getMessages();
    const services = window.NexaStorage.getServices();
    const unread = messages.filter(m => !m.read).length;

    grid.innerHTML = `
      <div class="admin-card"><b>${projects.length}</b><span>Total Projects</span></div>
      <div class="admin-card"><b>${projects.filter(p => p.status === 'published').length}</b><span>Published</span></div>
      <div class="admin-card"><b>${services.length}</b><span>Services Listed</span></div>
      <div class="admin-card"><b>${unread}</b><span>Unread Messages</span></div>`;

    const recent = document.getElementById('dashRecentMessages');
    if (recent) {
      if (!messages.length) {
        recent.innerHTML = '<div class="empty-state">No messages received yet.</div>';
      } else {
        recent.innerHTML = `
          <table class="admin-table">
            <thead><tr><th>From</th><th>Project Type</th><th>Received</th><th>Status</th></tr></thead>
            <tbody>
              ${messages.slice(0, 5).map(m => `
                <tr>
                  <td class="row-title">${m.name}</td>
                  <td>${m.projectType || '—'}</td>
                  <td>${new Date(m.receivedAt).toLocaleDateString()}</td>
                  <td><span class="badge ${m.read ? 'badge--draft' : 'badge--unread'}">${m.read ? 'Read' : 'Unread'}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>`;
      }
    }
  }

  /* ---------------------------------------------------------------------
     PROJECTS ADMIN
     --------------------------------------------------------------------- */
  function initProjectsAdmin() {
    const table = document.getElementById('projectsTableBody');
    if (!table) return;

    const modalOverlay = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const modalTitle = document.getElementById('projectModalTitle');

    function renderTable() {
      const projects = window.NexaStorage.getProjects();
      if (!projects.length) {
        table.innerHTML = '<tr><td colspan="6"><div class="empty-state">No projects yet — add your first one.</div></td></tr>';
        return;
      }
      table.innerHTML = projects.map(p => `
        <tr data-id="${p.id}">
          <td><img src="${p.image}" alt=""></td>
          <td class="row-title">${p.name}</td>
          <td>${p.category}</td>
          <td><span class="badge badge--${p.status === 'published' ? 'published' : 'draft'}">${p.status}</span>
            ${p.featured ? '<span class="badge badge--featured">Featured</span>' : ''}</td>
          <td>${p.order || '—'}</td>
          <td>
            <button class="icon-btn" data-action="edit" title="Edit">✎</button>
            <button class="icon-btn" data-action="feature" title="Toggle featured">★</button>
            <button class="icon-btn" data-action="publish" title="Toggle publish">⤴</button>
            <button class="icon-btn danger" data-action="delete" title="Delete">✕</button>
          </td>
        </tr>`).join('');
    }

    function openModal(project) {
      form.reset();
      form.dataset.editId = project ? project.id : '';
      modalTitle.textContent = project ? 'Edit Project' : 'Add Project';
      if (project) {
        form.name.value = project.name || '';
        form.category.value = project.category || '';
        form.description.value = project.description || '';
        form.technologies.value = (project.technologies || []).join(', ');
        form.image.value = project.image || '';
        form.demoUrl.value = project.demoUrl || '';
        form.githubUrl.value = project.githubUrl || '';
        form.status.value = project.status || 'published';
        form.order.value = project.order || '';
      }
      modalOverlay.classList.add('is-open');
    }
    function closeModal() { modalOverlay.classList.remove('is-open'); }

    document.getElementById('addProjectBtn').addEventListener('click', () => openModal(null));
    document.getElementById('projectModalClose').addEventListener('click', closeModal);
    document.getElementById('projectModalCancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        name: form.name.value.trim(),
        category: form.category.value.trim(),
        description: form.description.value.trim(),
        technologies: form.technologies.value.split(',').map(t => t.trim()).filter(Boolean),
        image: form.image.value.trim(),
        demoUrl: form.demoUrl.value.trim(),
        githubUrl: form.githubUrl.value.trim(),
        status: form.status.value,
        order: parseInt(form.order.value, 10) || 0
      };
      const editId = form.dataset.editId;
      if (editId) window.NexaStorage.updateProject(editId, payload);
      else window.NexaStorage.addProject(payload);
      closeModal();
      renderTable();
    });

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const project = window.NexaStorage.getProjects().find(p => p.id === id);
      if (!project) return;

      if (btn.dataset.action === 'edit') openModal(project);
      if (btn.dataset.action === 'feature') window.NexaStorage.updateProject(id, { featured: !project.featured });
      if (btn.dataset.action === 'publish') window.NexaStorage.updateProject(id, { status: project.status === 'published' ? 'draft' : 'published' });
      if (btn.dataset.action === 'delete') {
        if (confirm('Delete "' + project.name + '"? This cannot be undone.')) {
          window.NexaStorage.deleteProject(id);
        }
      }
      renderTable();
    });

    renderTable();
  }

  /* ---------------------------------------------------------------------
     MESSAGES ADMIN
     --------------------------------------------------------------------- */
  function initMessagesAdmin() {
    const table = document.getElementById('messagesTableBody');
    if (!table) return;

    function renderTable() {
      const messages = window.NexaStorage.getMessages();
      if (!messages.length) {
        table.innerHTML = '<tr><td colspan="6"><div class="empty-state">No project requests yet.</div></td></tr>';
        return;
      }
      table.innerHTML = messages.map(m => `
        <tr data-id="${m.id}">
          <td class="row-title">${m.name}</td>
          <td>${m.email}</td>
          <td>${m.projectType || '—'}</td>
          <td>${m.budget || '—'}</td>
          <td>${new Date(m.receivedAt).toLocaleDateString()}
            ${!m.read ? '<span class="badge badge--unread">New</span>' : ''}</td>
          <td>
            <button class="icon-btn" data-action="view" title="View message">👁</button>
            <button class="icon-btn danger" data-action="delete" title="Delete">✕</button>
          </td>
        </tr>`).join('');
    }

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const row = btn.closest('tr');
      const id = row.dataset.id;
      const message = window.NexaStorage.getMessages().find(m => m.id === id);
      if (!message) return;

      if (btn.dataset.action === 'view') {
        window.NexaStorage.markMessageRead(id);
        alert(
          'From: ' + message.name + ' <' + message.email + '>\n' +
          'Phone: ' + (message.phone || '—') + '\n' +
          'Company: ' + (message.company || '—') + '\n' +
          'Project: ' + (message.projectType || '—') + '\n' +
          'Budget: ' + (message.budget || '—') + '\n\n' +
          message.message
        );
      }
      if (btn.dataset.action === 'delete') {
        if (confirm('Delete this message?')) window.NexaStorage.deleteMessage(id);
      }
      renderTable();
    });

    renderTable();
  }

  /* ---------------------------------------------------------------------
     SETTINGS ADMIN — content + animation controls
     --------------------------------------------------------------------- */
  function initSettingsAdmin() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    const settings = window.NexaStorage.getSettings();

    form.heroLabel.value = settings.heroLabel || '';
    form.heroHeading.value = settings.heroHeading || '';
    form.heroDescription.value = settings.heroDescription || '';
    form.contactEmail.value = settings.contactEmail || '';
    form.contactPhone.value = settings.contactPhone || '';
    form.socialGithub.value = settings.socials?.github || '';
    form.socialLinkedin.value = settings.socials?.linkedin || '';
    form.socialTwitter.value = settings.socials?.twitter || '';
    form.socialInstagram.value = settings.socials?.instagram || '';

    (settings.stats || []).forEach((s, i) => {
      if (form['statValue' + i]) form['statValue' + i].value = s.value;
      if (form['statLabel' + i]) form['statLabel' + i].value = s.label;
    });

    const anim = settings.animation || {};
    ['fluidBackground', 'particles', 'customCursor', 'parallax', 'card3d', 'ambientGlow'].forEach(key => {
      if (form[key]) form[key].checked = anim[key] !== false;
    });
    if (form.intensity) form.intensity.value = anim.intensity || 'medium';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const stats = [0, 1, 2, 3].map(i => ({
        value: parseInt(form['statValue' + i].value, 10) || 0,
        suffix: '+',
        label: form['statLabel' + i].value.trim()
      }));

      window.NexaStorage.saveSettings({
        heroLabel: form.heroLabel.value.trim(),
        heroHeading: form.heroHeading.value.trim(),
        heroDescription: form.heroDescription.value.trim(),
        contactEmail: form.contactEmail.value.trim(),
        contactPhone: form.contactPhone.value.trim(),
        socials: {
          github: form.socialGithub.value.trim(),
          linkedin: form.socialLinkedin.value.trim(),
          twitter: form.socialTwitter.value.trim(),
          instagram: form.socialInstagram.value.trim()
        },
        stats,
        animation: {
          fluidBackground: form.fluidBackground.checked,
          particles: form.particles.checked,
          customCursor: form.customCursor.checked,
          parallax: form.parallax.checked,
          card3d: form.card3d.checked,
          ambientGlow: form.ambientGlow.checked,
          intensity: form.intensity.value
        }
      });

      const status = document.getElementById('settingsStatus');
      if (status) {
        status.textContent = 'Settings saved.';
        setTimeout(() => { status.textContent = ''; }, 2500);
      }
    });
  }

  function init() {
    guardSession();
    buildSidebar();
    initLogin();
    initDashboard();
    initProjectsAdmin();
    initMessagesAdmin();
    initSettingsAdmin();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
