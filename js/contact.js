/* ============================================================
   CONTACT.JS — Client-side validation & form submission
   ============================================================ */

(function () {
  'use strict';

  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const btn    = document.getElementById('form-submit');

  if (!form) return;

  /* ── HELPERS ─────────────────────────────────────────── */
  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  function showStatus(type, msg) {
    status.className = type;
    status.textContent = msg;
    status.style.display = 'block';
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearStatus() {
    status.className = '';
    status.textContent = '';
    status.style.display = 'none';
  }

  function setFieldError(field, msg) {
    field.setAttribute('aria-invalid', 'true');
    let err = document.getElementById(field.id + '-error');
    if (!err) {
      err = document.createElement('span');
      err.id = field.id + '-error';
      err.className = 'field-error';
      err.style.cssText = 'display:block;color:#b93d3d;font-size:0.8rem;margin-top:4px;';
      field.parentNode.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearFieldErrors() {
    form.querySelectorAll('[aria-invalid]').forEach(f => {
      f.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.field-error').forEach(e => e.remove());
  }

  /* ── VALIDATE ────────────────────────────────────────── */
  function validate() {
    clearFieldErrors();
    let valid = true;

    const name    = form.querySelector('#contact-name');
    const email   = form.querySelector('#contact-email');
    const subject = form.querySelector('#contact-subject');
    const message = form.querySelector('#contact-message');

    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, 'Please enter your full name (at least 2 characters).');
      valid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      setFieldError(email, 'Please enter a valid email address.');
      valid = false;
    }

    if (!subject.value.trim() || subject.value.trim().length < 3) {
      setFieldError(subject, 'Please enter a subject.');
      valid = false;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      setFieldError(message, 'Your message must be at least 10 characters.');
      valid = false;
    }

    return valid;
  }

  /* ── SUBMIT ──────────────────────────────────────────── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    if (!validate()) {
      showStatus('error', 'Please fix the errors above before submitting.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = new FormData(form);

    try {
      const response = await fetch('php/contact-form.php', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        showStatus('success', result.message || 'Your message has been sent. I will get back to you shortly.');
        form.reset();
      } else {
        showStatus('error', result.message || 'Something went wrong. Please try again or send an email directly.');
      }
    } catch (err) {
      showStatus('error', 'Unable to send the message. If the problem persists, please contact me by email directly.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });

})();
