/* ==========================================================================
   NEXA TECH DEV — storage.js
   Single data-access layer. Everything that touches localStorage goes
   through here so the persistence mechanism can be swapped for a real
   API later without touching the rest of the app.
   ========================================================================== */

(function (window) {
  'use strict';

  const KEYS = {
    projects: 'nexa_projects',
    services: 'nexa_services',
    messages: 'nexa_messages',
    settings: 'nexa_settings',
    technologies: 'nexa_technologies',
    testimonials: 'nexa_testimonials',
    session: 'nexa_admin_session'
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[storage] read failed for', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[storage] write failed for', key, e);
      return false;
    }
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------------------------------------------------------------------
     DEFAULT SEED DATA
     --------------------------------------------------------------------- */

  const DEFAULT_PROJECTS = [
    {
      id: 'p1', name: 'Academy Management System', category: 'management systems',
      tags: ['education', 'management systems'],
      description: 'A full academic operations platform covering admissions, attendance, grading and staff scheduling for multi-campus institutions.',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: true, order: 1
    },
    {
      id: 'p2', name: 'LMS — Learning Universe', category: 'education',
      tags: ['education', 'web apps'],
      description: 'Course authoring, live cohorts and analytics dashboards built for a growing online academy.',
      technologies: ['Next.js', 'MongoDB', 'Prisma'],
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: true, order: 2
    },
    {
      id: 'p3', name: 'Real Estate Platform', category: 'real estate',
      tags: ['real estate', 'web apps'],
      description: 'Listing discovery, virtual tours and agent CRM unified into a single property marketplace.',
      technologies: ['React', 'Node.js', 'MySQL'],
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 3
    },
    {
      id: 'p4', name: 'Hospital Management System', category: 'healthcare',
      tags: ['healthcare', 'management systems'],
      description: 'Patient records, ward scheduling and billing engineered for demanding clinical environments.',
      technologies: ['PHP', 'MySQL', 'REST API'],
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: true, order: 4
    },
    {
      id: 'p5', name: 'E-Commerce Platform', category: 'e-commerce',
      tags: ['e-commerce', 'web apps'],
      description: 'Headless storefront with real-time inventory, dynamic pricing and a modular checkout flow.',
      technologies: ['Next.js', 'Node.js', 'MongoDB'],
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 5
    },
    {
      id: 'p6', name: 'Travel Agency Platform', category: 'business',
      tags: ['business', 'booking'],
      description: 'Itinerary building, package bundling and payment orchestration for a boutique travel agency.',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 6
    },
    {
      id: 'p7', name: 'POS System', category: 'business',
      tags: ['business', 'management systems'],
      description: 'Offline-capable point of sale with inventory sync, staff permissions and daily reporting.',
      technologies: ['JavaScript', 'Node.js', 'MySQL'],
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 7
    },
    {
      id: 'p8', name: 'Test Maker', category: 'education',
      tags: ['education', 'web apps'],
      description: 'Adaptive exam builder with question banks, timed sessions and instant auto-grading.',
      technologies: ['React', 'Node.js', 'MongoDB'],
      image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 8
    },
    {
      id: 'p9', name: 'Restaurant Website', category: 'websites',
      tags: ['websites', 'business'],
      description: 'A reservation-ready brand site with a live menu system and table booking widget.',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 9
    },
    {
      id: 'p10', name: 'Hotel Booking System', category: 'booking',
      tags: ['booking', 'e-commerce'],
      description: 'Real-time room availability, rate management and guest messaging in one booking engine.',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 10
    },
    {
      id: 'p11', name: 'Event Management Website', category: 'business',
      tags: ['business', 'booking'],
      description: 'Ticketing, seat mapping and organizer dashboards for multi-track live events.',
      technologies: ['Next.js', 'Node.js', 'MySQL'],
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 11
    },
    {
      id: 'p12', name: 'Portfolio Systems', category: 'websites',
      tags: ['websites'],
      description: 'A themeable portfolio framework used to ship dozens of creator sites from one codebase.',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=1200&auto=format&fit=crop',
      demoUrl: '', githubUrl: '', status: 'published', featured: false, order: 12
    }
  ];

  const DEFAULT_SERVICES = [
    { id: 's1', title: 'Web Development', icon: 'globe', description: 'Fast, accessible, motion-rich websites built on clean semantic foundations.' },
    { id: 's2', title: 'Full-Stack Development', icon: 'layers', description: 'End-to-end product builds spanning interface, API and database.' },
    { id: 's3', title: 'Business Management Systems', icon: 'grid', description: 'Internal tools that replace spreadsheets with real operational software.' },
    { id: 's4', title: 'E-Commerce', icon: 'cart', description: 'Storefronts engineered for conversion, speed and clean checkout flows.' },
    { id: 's5', title: 'Booking Systems', icon: 'calendar', description: 'Real-time scheduling engines for service, hospitality and events.' },
    { id: 's6', title: 'Custom Software', icon: 'terminal', description: 'Purpose-built systems designed around a workflow no template fits.' },
    { id: 's7', title: 'UI/UX Design', icon: 'cursor', description: 'Interfaces designed around clarity first, atmosphere second.' },
    { id: 's8', title: 'WordPress Development', icon: 'wp', description: 'Structured, maintainable WordPress builds for content-first teams.' }
  ];

  const DEFAULT_TECHNOLOGIES = [
    { id: 't1', name: 'HTML5', group: 'frontend' },
    { id: 't2', name: 'CSS3', group: 'frontend' },
    { id: 't3', name: 'JavaScript', group: 'frontend' },
    { id: 't4', name: 'React', group: 'frontend' },
    { id: 't5', name: 'Next.js', group: 'frontend' },
    { id: 't6', name: 'Node.js', group: 'backend' },
    { id: 't7', name: 'PHP', group: 'backend' },
    { id: 't8', name: 'MySQL', group: 'data' },
    { id: 't9', name: 'MongoDB', group: 'data' },
    { id: 't10', name: 'PostgreSQL', group: 'data' },
    { id: 't11', name: 'Prisma', group: 'data' },
    { id: 't12', name: 'WordPress', group: 'cms' },
    { id: 't13', name: 'Git', group: 'tooling' },
    { id: 't14', name: 'GitHub', group: 'tooling' },
    { id: 't15', name: 'REST API', group: 'tooling' }
  ];

  const DEFAULT_SETTINGS = {
    heroLabel: 'NEXA TECH DEV / DIGITAL INNOVATION',
    heroHeading: 'WE BUILD DIGITAL EXPERIENCES FOR THE FUTURE.',
    heroDescription: 'Modern websites, intelligent business systems and powerful digital platforms engineered for ambitious businesses.',
    stats: [
      { value: 25, suffix: '+', label: 'Projects' },
      { value: 15, suffix: '+', label: 'Technologies' },
      { value: 10, suffix: '+', label: 'Industries' },
      { value: 30, suffix: '+', label: 'Digital Solutions' }
    ],
    contactEmail: 'hello@nexatechdev.com',
    contactPhone: '+1 (555) 019-4420',
    socials: { github: '#', linkedin: '#', twitter: '#', instagram: '#' },
    animation: {
      fluidBackground: true,
      particles: true,
      customCursor: true,
      parallax: true,
      card3d: true,
      ambientGlow: true,
      intensity: 'medium' // low | medium | high
    }
  };

  function ensureSeeded() {
    if (read(KEYS.projects, null) === null) write(KEYS.projects, DEFAULT_PROJECTS);
    if (read(KEYS.services, null) === null) write(KEYS.services, DEFAULT_SERVICES);
    if (read(KEYS.technologies, null) === null) write(KEYS.technologies, DEFAULT_TECHNOLOGIES);
    if (read(KEYS.messages, null) === null) write(KEYS.messages, []);
    if (read(KEYS.settings, null) === null) write(KEYS.settings, DEFAULT_SETTINGS);
  }

  /* ---------------------------------------------------------------------
     PUBLIC API
     --------------------------------------------------------------------- */

  const NexaStorage = {
    KEYS,

    getProjects() {
      ensureSeeded();
      return read(KEYS.projects, []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    addProject(project) {
      const projects = this.getProjects();
      const newProject = Object.assign({
        id: uid('p'), status: 'published', featured: false,
        order: projects.length + 1, tags: [], technologies: []
      }, project);
      projects.push(newProject);
      write(KEYS.projects, projects);
      return newProject;
    },
    updateProject(id, patch) {
      const projects = this.getProjects();
      const idx = projects.findIndex(p => p.id === id);
      if (idx === -1) return null;
      projects[idx] = Object.assign({}, projects[idx], patch);
      write(KEYS.projects, projects);
      return projects[idx];
    },
    deleteProject(id) {
      const projects = this.getProjects().filter(p => p.id !== id);
      write(KEYS.projects, projects);
      return true;
    },

    getServices() {
      ensureSeeded();
      return read(KEYS.services, []);
    },
    saveServices(services) {
      write(KEYS.services, services);
      return services;
    },

    getTechnologies() {
      ensureSeeded();
      return read(KEYS.technologies, []);
    },
    saveTechnologies(list) {
      write(KEYS.technologies, list);
      return list;
    },

    getMessages() {
      ensureSeeded();
      return read(KEYS.messages, []).slice().reverse();
    },
    saveMessage(message) {
      const messages = read(KEYS.messages, []);
      const newMessage = Object.assign({
        id: uid('m'), receivedAt: new Date().toISOString(), read: false
      }, message);
      messages.push(newMessage);
      write(KEYS.messages, messages);
      return newMessage;
    },
    markMessageRead(id) {
      const messages = read(KEYS.messages, []);
      const idx = messages.findIndex(m => m.id === id);
      if (idx === -1) return null;
      messages[idx].read = true;
      write(KEYS.messages, messages);
      return messages[idx];
    },
    deleteMessage(id) {
      const messages = read(KEYS.messages, []).filter(m => m.id !== id);
      write(KEYS.messages, messages);
      return true;
    },

    getSettings() {
      ensureSeeded();
      return read(KEYS.settings, DEFAULT_SETTINGS);
    },
    saveSettings(settings) {
      const merged = Object.assign({}, this.getSettings(), settings);
      write(KEYS.settings, merged);
      return merged;
    },

    /* very small admin session flag — not real auth, just gates the demo admin UI */
    setSession(active) {
      write(KEYS.session, { active: !!active, at: Date.now() });
    },
    hasSession() {
      const s = read(KEYS.session, { active: false });
      return !!s.active;
    }
  };

  ensureSeeded();
  window.NexaStorage = NexaStorage;
})(window);
