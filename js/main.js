/* ============================================================
   MAIN.JS — Navigation, scroll, micro-interactions
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV SCROLL SHADOW ───────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── HAMBURGER / MOBILE MENU ─────────────────────────── */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────────── */
  (function setActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .footer__nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split('/').pop();
      if (
        linkPage === currentPath ||
        (currentPath === '' && linkPage === 'index.html') ||
        (currentPath === 'index.html' && linkPage === 'index.html')
      ) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ── MEDIA PAGE TABS ─────────────────────────────────── */
  const mediaTabs = document.querySelectorAll('.media-tab');
  const mediaPanels = document.querySelectorAll('.media-panel');

  if (mediaTabs.length > 0) {
    mediaTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        mediaTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        mediaPanels.forEach(p => {
          p.hidden = p.id !== 'panel-' + target;
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      });
    });
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── LAZY-LOAD IMAGES ────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const imgObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('img[data-src]').forEach(img => imgObs.observe(img));
  }

  /* ── YEAR IN FOOTER ──────────────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

})();
