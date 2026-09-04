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

  /* Testimonials carousel */
  var quoteTrack = $('quoteTrack');
  if (quoteTrack) {
    var quoteCards = Array.prototype.slice.call(quoteTrack.children);
    var quoteDots = Array.prototype.slice.call(document.querySelectorAll('.quote-dots__dot'));
    var quotePrev = $('quotePrev');
    var quoteNext = $('quoteNext');
    var quoteActive = 0;

    var scrollToQuote = function (i) {
      i = Math.max(0, Math.min(i, quoteCards.length - 1));
      var card = quoteCards[i];
      quoteTrack.scrollTo({ left: card.offsetLeft - quoteTrack.offsetLeft, behavior: 'smooth' });
    };

    quoteDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { scrollToQuote(i); });
    });

    if (quotePrev) quotePrev.addEventListener('click', function () { scrollToQuote(quoteActive - 1); });
    if (quoteNext) quoteNext.addEventListener('click', function () { scrollToQuote(quoteActive + 1); });

    var updateQuoteState = function () {
      var trackLeft = quoteTrack.getBoundingClientRect().left;
      var closest = 0, closestDist = Infinity;
      quoteCards.forEach(function (card, i) {
        var dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      quoteActive = closest;
      quoteDots.forEach(function (d, i) { d.classList.toggle('is-active', i === quoteActive); });

      var max = quoteTrack.scrollWidth - quoteTrack.clientWidth - 2;
      if (quotePrev) quotePrev.disabled = quoteTrack.scrollLeft <= 0;
      if (quoteNext) quoteNext.disabled = quoteTrack.scrollLeft >= max;
    };

    var quoteTicking = false;
    quoteTrack.addEventListener('scroll', function () {
      if (!quoteTicking) {
        window.requestAnimationFrame(function () { updateQuoteState(); quoteTicking = false; });
        quoteTicking = true;
      }
    }, { passive: true });

    updateQuoteState();
    window.addEventListener('resize', updateQuoteState);
  }

  /* Hero slider — auto-advances through its slides, always entering from the
     right and exiting to the left, regardless of which direction it just came from. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroSlider = $('heroSlider');
  if (heroSlider && !reduceMotion) {
    var heroSlides = Array.prototype.slice.call(heroSlider.querySelectorAll('.hero__slide'));
    if (heroSlides.length > 1) {
      var slideActive = 0;
      window.setInterval(function () {
        var next = (slideActive + 1) % heroSlides.length;
        var outgoing = heroSlides[slideActive];
        var incoming = heroSlides[next];

        outgoing.classList.remove('is-active');
        outgoing.classList.add('is-prev');
        incoming.classList.add('is-active');

        window.setTimeout(function () {
          outgoing.style.transition = 'none';
          outgoing.classList.remove('is-prev');
          void outgoing.offsetWidth;
          outgoing.style.transition = '';
        }, 1150);

        slideActive = next;
      }, 5500);
    }
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

  /* Load more — reveals the remaining shots, then re-applies whichever
     category filter is currently active so the newly-shown ones respect it. */
  var loadMoreBtn = $('loadMore');
  var galleryMore = document.querySelector('.gallery__more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      document.querySelectorAll('.shot--more').forEach(function (s) {
        s.classList.remove('shot--more');
        if (s.getBoundingClientRect().top < window.innerHeight) {
          s.classList.add('is-in');
        } else {
          io.observe(s);
        }
      });
      var active = document.querySelector('.filter.is-active');
      applyFilter(active ? active.dataset.filter : 'all');
      if (galleryMore) galleryMore.classList.add('is-done');
    });
  }

  /* Lightbox — the image flies out from its thumbnail's exact position/size on
     open, and shrinks back to that same spot on close ("FLIP" technique). */
  var lb = $('lightbox');
  var lbImg = $('lbImg');
  var index = 0;

  if (lb && lbImg && shots.length) {
    var FLIP_MS = 480;
    var reduceMotionLb = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var closing = false;

    var visibleShots = function () {
      return shots.filter(function (s) {
        return !s.classList.contains('is-hidden') && !s.classList.contains('shot--more');
      });
    };

    var show = function (i) {
      var list = visibleShots();
      if (!list.length) return;
      index = (i + list.length) % list.length;
      var img = list[index].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
    };

    var currentThumbImg = function () {
      var list = visibleShots();
      var shot = list[index];
      return shot ? shot.querySelector('img') : null;
    };

    /* Sets a transform that makes lbImg *look* like it's still sitting at
       `fromRect`, then clears it — the browser animates the difference. */
    var flyFrom = function (fromRect) {
      var toRect = lbImg.getBoundingClientRect();
      var sx = fromRect.width / toRect.width;
      var sy = fromRect.height / toRect.height;
      var tx = (fromRect.left + fromRect.width / 2) - (toRect.left + toRect.width / 2);
      var ty = (fromRect.top + fromRect.height / 2) - (toRect.top + toRect.height / 2);

      lbImg.style.transition = 'none';
      lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sx + ',' + sy + ')';
      lbImg.getBoundingClientRect(); /* force reflow so the next line animates */
      lbImg.style.transition = 'transform ' + FLIP_MS + 'ms var(--ease)';
      lbImg.style.transform = 'translate(0,0) scale(1,1)';
    };

    /* Animates lbImg from its current spot down to `toRect`, then runs `done`. */
    var flyTo = function (toRect, done) {
      var fromRect = lbImg.getBoundingClientRect();
      var sx = toRect.width / fromRect.width;
      var sy = toRect.height / fromRect.height;
      var tx = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
      var ty = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);

      lbImg.style.transition = 'transform ' + FLIP_MS + 'ms var(--ease)';
      lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sx + ',' + sy + ')';
      window.setTimeout(done, FLIP_MS);
    };

    var resetTransform = function () {
      lbImg.style.transition = '';
      lbImg.style.transform = '';
    };

    var openLb = function (shot) {
      index = visibleShots().indexOf(shot);
      show(index);

      var originImg = shot.querySelector('img');
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (reduceMotionLb || !originImg) return;
      var startRect = originImg.getBoundingClientRect();
      /* lbImg's rect is only meaningful once the browser knows its natural size
         — tie the animation to that directly rather than guessing with rAF. */
      if (lbImg.complete) {
        flyFrom(startRect);
      } else {
        lbImg.addEventListener('load', function () { flyFrom(startRect); }, { once: true });
      }
    };

    var closeLb = function () {
      if (closing) return;
      var originImg = currentThumbImg();

      if (reduceMotionLb || !originImg) {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        return;
      }

      closing = true;
      lb.classList.remove('is-open'); /* backdrop starts fading now, in parallel */
      var targetRect = originImg.getBoundingClientRect();
      flyTo(targetRect, function () {
        resetTransform();
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        closing = false;
      });
    };

    shots.forEach(function (shot) {
      shot.addEventListener('click', function () { openLb(shot); });
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
