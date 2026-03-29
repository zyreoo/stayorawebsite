

(function () {
  function initLoad() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('loaded');
      });
    });
  }


  function initReveal() {
    var reveal = document.querySelectorAll('.reveal');
    if (!reveal.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
      }
    );

    reveal.forEach(function (el) {
      observer.observe(el);
    });
  }

  // -------- Header: sticky + scrolled state --------
  function initHeaderScroll() {
    var bar = document.querySelector('.header-sticky');
    if (!bar) return;
    function update() {
      bar.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // -------- Feature tabs (Web App / Mobile) --------
  function initTabs() {
    document.querySelectorAll('.feature-tabs').forEach(function (group) {
      var tabs = group.querySelectorAll('.tab');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
        });
      });
    });
  }

  // -------- Pricing toggle (Annually / Monthly) --------
  function initPricingToggle() {
    var section = document.querySelector('.pricing');
    var btn = document.querySelector('.toggle-billing');
    if (!section || !btn) return;
    btn.addEventListener('click', function () {
      var isAnnual = section.classList.toggle('pricing-annual');
      section.classList.toggle('pricing-monthly', !isAnnual);
    });
    // Start as monthly (default)
    section.classList.add('pricing-monthly');
    section.classList.remove('pricing-annual');
  }

  // -------- Mobile nav: hamburger toggle --------
  function initNavToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) close();
      else open();
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        close();
      });
    });
  }

  // -------- Nav: logo → top of page, anchor links → smooth scroll (native, like Framer) --------
  function initNav() {
    function scrollToTop(e) {
      e.preventDefault();
      var topEl = document.getElementById('top');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    document.querySelectorAll('.logo-home').forEach(function (logo) {
      logo.addEventListener('click', scrollToTop);
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // -------- Run on DOM ready --------
  function run() {
    initLoad();
    initReveal();
    initHeaderScroll();
    initNavToggle();
    initTabs();
    initPricingToggle();
    initNav();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
