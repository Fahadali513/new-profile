/* ==========================================================================
   NEXA TECH DEV — contact.js
   Client-side validation, save-to-storage, and the "transmit" submission
   sequence: TRANSMITTING... -> REQUEST TRANSMITTED -> THANK YOU.
   ========================================================================== */

(function () {
  'use strict';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validators(form) {
    return {
      name: () => form.name.value.trim().length >= 2 || 'Enter your full name.',
      email: () => EMAIL_RE.test(form.email.value.trim()) || 'Enter a valid email address.',
      message: () => form.message.value.trim().length >= 10 || 'Tell us a little more about the project.'
    };
  }

  function setError(field, message) {
    const wrap = field.closest('.field');
    if (!wrap) return;
    const errEl = wrap.querySelector('.field-error');
    if (message) {
      wrap.classList.add('has-error');
      if (errEl) errEl.textContent = message;
    } else {
      wrap.classList.remove('has-error');
    }
  }

  function validateField(form, name) {
    const rules = validators(form);
    const rule = rules[name];
    if (!rule) return true;
    const result = rule();
    setError(form[name], result === true ? '' : result);
    return result === true;
  }

  function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const statusEl = document.getElementById('submitStatus');
    const submitBtn = form.querySelector('button[type="submit"]');

    ['name', 'email', 'message'].forEach(name => {
      if (form[name]) {
        form[name].addEventListener('blur', () => validateField(form, name));
        form[name].addEventListener('input', () => {
          if (form[name].closest('.field').classList.contains('has-error')) validateField(form, name);
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = ['name', 'email', 'message'];
      const allValid = fields.map(n => validateField(form, n)).every(Boolean);
      if (!allValid) {
        statusEl.textContent = 'Please fix the highlighted fields.';
        return;
      }

      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone ? form.phone.value.trim() : '',
        company: form.company ? form.company.value.trim() : '',
        projectType: form.projectType ? form.projectType.value : '',
        budget: form.budget ? form.budget.value : '',
        message: form.message.value.trim()
      };

      submitBtn.disabled = true;
      submitBtn.classList.add('is-transmitting');
      statusEl.textContent = 'TRANSMITTING...';

      setTimeout(() => {
        if (window.NexaStorage) window.NexaStorage.saveMessage(data);
        statusEl.textContent = 'REQUEST TRANSMITTED';
        setTimeout(() => {
          statusEl.textContent = "THANK YOU. WE'LL BE IN TOUCH.";
          form.reset();
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-transmitting');
          form.querySelectorAll('.field select').forEach(s => s.classList.remove('has-value'));
        }, 900);
      }, 1100);
    });

    form.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        select.classList.toggle('has-value', !!select.value);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initForm);
})();
