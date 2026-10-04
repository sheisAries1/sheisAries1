// Atelier Ma — quiet interactions: reveals, header state, mobile menu, enquiry form.
(function () {
  'use strict';

  // Reveal on scroll: fades, image masks and drawn lines.
  var targets = document.querySelectorAll('.reveal, .mask, .line');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Header gains a hairline once the page moves.
  var header = document.querySelector('[data-header]');
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Mobile menu.
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var label = toggle.querySelector('.nav-toggle__label');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    label.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.querySelector('a').focus();
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && nav.classList.contains('is-open')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 48em)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  // Enquiry form — client-side validation and a calm confirmation.
  var form = document.querySelector('[data-form]');
  var status = document.querySelector('[data-form-status]');

  function setError(input, message) {
    var err = document.getElementById(input.id + '-err');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message;
  }

  function validate(input) {
    if (input.validity.valueMissing) {
      setError(input, input.name === 'email' ? 'Please share an email so we can reply.' : 'Please tell us your name.');
      return false;
    }
    if (input.validity.typeMismatch) {
      setError(input, 'This email address doesn’t look quite right.');
      return false;
    }
    setError(input, '');
    return true;
  }

  form.querySelectorAll('[required]').forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value) validate(input); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validate(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      if (!validate(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    var name = form.elements.name.value.trim().split(' ')[0];
    status.textContent = 'Thank you, ' + name + '. We will be in touch within two working days.';
    form.reset();
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
