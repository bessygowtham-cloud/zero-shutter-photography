(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* Loader */
  var loader = $('loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () { loader.classList.add('is-done'); }, 500);
    });
  }

  /* Hero parallax — the three panes drift at different speeds as you scroll past. */
  var hero = $('hero');
  var panes = hero ? Array.prototype.slice.call(hero.querySelectorAll('.hero__pane-img')) : [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero && panes.length && !reduceMotion) {
    var speeds = [0.12, 0.2, 0.28];
    var ticking = false;

    var applyParallax = function () {
      var y = Math.min(window.scrollY, hero.offsetHeight);
      panes.forEach(function (img, i) {
        img.style.transform = 'translateY(' + (y * speeds[i % speeds.length]) + 'px)';
      });
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
    applyParallax();
  }

  /* Sticky header */
  var header = $('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile nav */
  var burger = $('burger');
  var nav = $('nav');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        // The services trigger opens a submenu on mobile rather than navigating.
        if (a.classList.contains('nav__drop-trigger') && isMobileNav()) return;
        closeNav();
      });
    });
  }

  /* Services dropdown — hover on desktop (CSS), tap to expand on mobile */
  var drop = document.querySelector('.has-drop');
  var dropTrigger = document.querySelector('.nav__drop-trigger');

  function isMobileNav() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  if (drop && dropTrigger) {
    dropTrigger.addEventListener('click', function (e) {
      if (!isMobileNav()) return;          // desktop: let the link through to services.html
      e.preventDefault();
      var open = drop.classList.toggle('is-open');
      dropTrigger.setAttribute('aria-expanded', String(open));
    });

    // Keyboard: Escape closes the panel and returns focus to the trigger.
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        drop.classList.remove('is-open');
        dropTrigger.setAttribute('aria-expanded', 'false');
        dropTrigger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (!isMobileNav()) {
        drop.classList.remove('is-open');
        dropTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el, i) {
    // Anything already at or above the fold (deep links, restored scroll) never
    // intersects, so show it outright instead of leaving it invisible.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('is-in');
      return;
    }
    el.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(el);
  });

  /* Portfolio filters */
  var filters = document.querySelectorAll('.filter');
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));

  function applyFilter(cat) {
    filters.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.filter === cat);
    });
    shots.forEach(function (shot) {
      shot.classList.toggle('is-hidden', cat !== 'all' && shot.dataset.cat !== cat);
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () { applyFilter(btn.dataset.filter); });
  });

  document.querySelectorAll('[data-filter][href="#work"]').forEach(function (link) {
    link.addEventListener('click', function () { applyFilter(link.dataset.filter); });
  });

  /* A #work deep link carrying ?filter= (from a service page) preselects that set. */
  var wanted = new URLSearchParams(location.search).get('filter');
  if (wanted && document.querySelector('.filter[data-filter="' + wanted + '"]')) {
    applyFilter(wanted);
  }

  /* Lightbox */
  var lb = $('lightbox');
  var lbImg = $('lbImg');
  var index = 0;

  if (lb && lbImg && shots.length) {
    var visibleShots = function () {
      return shots.filter(function (s) { return !s.classList.contains('is-hidden'); });
    };

    var show = function (i) {
      var list = visibleShots();
      if (!list.length) return;
      index = (i + list.length) % list.length;
      var img = list[index].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
    };

    var closeLb = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    shots.forEach(function (shot) {
      shot.addEventListener('click', function () {
        index = visibleShots().indexOf(shot);
        show(index);
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    var lbClose = $('lbClose');
    var lbPrev = $('lbPrev');
    var lbNext = $('lbNext');

    if (lbClose) lbClose.addEventListener('click', closeLb);
    if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); show(index - 1); });
    if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); show(index + 1); });

    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* Enquiry form → WhatsApp */
  var form = $('enquiryForm');
  var note = $('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').trim();
      var phone = (data.get('phone') || '').trim();

      if (!name || !phone) {
        if (note) note.textContent = 'Please add your name and phone number.';
        return;
      }

      var lines = [
        'Enquiry from the Zero Shutter website',
        'Name: ' + name,
        'Phone: ' + phone,
        'Date: ' + (data.get('date') || 'Not decided'),
        'Service: ' + data.get('service'),
        'Details: ' + ((data.get('message') || '').trim() || '—')
      ];

      if (note) note.textContent = 'Opening WhatsApp with your enquiry…';
      window.open('https://wa.me/917358561772?text=' + encodeURIComponent(lines.join('\n')), '_blank');
    });
  }

  var year = $('year');
  if (year) year.textContent = new Date().getFullYear();
})();
