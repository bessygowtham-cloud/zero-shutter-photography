(function () {
  'use strict';

  /* Loader */
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.getElementById('loader').classList.add('is-done');
    }, 500);
  });

  /* Sticky header */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

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
    btn.addEventListener('click', function () {
      applyFilter(btn.dataset.filter);
    });
  });

  document.querySelectorAll('[data-filter][href="#work"]').forEach(function (link) {
    link.addEventListener('click', function () {
      applyFilter(link.dataset.filter);
    });
  });

  /* Lightbox */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var index = 0;

  function visibleShots() {
    return shots.filter(function (s) { return !s.classList.contains('is-hidden'); });
  }

  function show(i) {
    var list = visibleShots();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    var img = list[index].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }

  function openLb(shot) {
    index = visibleShots().indexOf(shot);
    show(index);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  shots.forEach(function (shot) {
    shot.addEventListener('click', function () { openLb(shot); });
  });

  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function (e) {
    e.stopPropagation(); show(index - 1);
  });
  document.getElementById('lbNext').addEventListener('click', function (e) {
    e.stopPropagation(); show(index + 1);
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  /* Enquiry form → WhatsApp */
  var form = document.getElementById('enquiryForm');
  var note = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = (data.get('name') || '').trim();
    var phone = (data.get('phone') || '').trim();

    if (!name || !phone) {
      note.textContent = 'Please add your name and phone number.';
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

    note.textContent = 'Opening WhatsApp with your enquiry…';
    window.open('https://wa.me/917358561772?text=' + encodeURIComponent(lines.join('\n')), '_blank');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
