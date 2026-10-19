/* KCCFT site scripts — vanilla JS, no dependencies */
(function () {
  'use strict';
  var d = document;
  d.documentElement.classList.remove('no-js');

  /* ---- mobile menu ---- */
  var toggle = d.querySelector('.menu-toggle');
  var nav = d.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- reveal on scroll ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = [].slice.call(d.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- count-up numbers ---- */
  var nums = [].slice.call(d.querySelectorAll('[data-count]'));
  function fmt(n) { return n.toLocaleString('en-US'); }
  function run(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var start = null, dur = 1400;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(end);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io2.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io2.observe(el); });
  }

  /* ---- table of contents highlight ---- */
  var tocLinks = [].slice.call(d.querySelectorAll('.toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) io3.observe(s); });
  }

  /* ---- gallery: filters + lightbox ---- */
  var grid = d.querySelector('.masonry');
  if (grid) {
    var figs = [].slice.call(grid.querySelectorAll('figure'));
    var btns = [].slice.call(d.querySelectorAll('.filters button'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var f = b.getAttribute('data-filter');
        figs.forEach(function (fig) { fig.hidden = !(f === 'all' || fig.getAttribute('data-cat') === f); });
      });
    });

    var lb = d.querySelector('.lightbox');
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var idx = 0, lastFocus = null;
    function visible() { return figs.filter(function (f) { return !f.hidden; }); }
    function show(i) {
      var list = visible(); if (!list.length) return;
      idx = (i + list.length) % list.length;
      var btn = list[idx].querySelector('button');
      lbImg.src = btn.getAttribute('data-full');
      lbImg.alt = btn.getAttribute('data-alt') || '';
      lbCap.textContent = btn.getAttribute('data-alt') || '';
    }
    function open(fig) {
      lastFocus = d.activeElement;
      idx = visible().indexOf(fig);
      lb.classList.add('open');
      d.body.style.overflow = 'hidden';
      show(idx);
      lb.querySelector('.close').focus();
    }
    function close() {
      lb.classList.remove('open');
      d.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    }
    figs.forEach(function (fig) {
      fig.querySelector('button').addEventListener('click', function () { open(fig); });
    });
    lb.querySelector('.close').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---- contact form: opens the visitor's email app with the message filled in ---- */
  var form = d.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return (d.getElementById(id) || {}).value || ''; };
      var subject = 'Website enquiry: ' + v('reason');
      var body = 'Name: ' + v('name') + '\nPhone: ' + v('phone') + '\n\n' + v('message');
      window.location.href = 'mailto:info@kenyacervicalcancertrust.org?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---- motion extras: progress bar, header shadow, staggered reveals ---- */
  var bar = d.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
  var hdr = d.querySelector('.site-header'), ticking = false;
  function onScroll() {
    var h = d.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(h.scrollTop / max, 1) : 0) + ')';
    if (hdr) hdr.classList.toggle('scrolled', h.scrollTop > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  [].slice.call(d.querySelectorAll('.features, .camps, .values, .people, .partners-grid, .partner-row, .ways, .give, .stats, .steps, .faq, .facts')).forEach(function (g) {
    [].slice.call(g.children).forEach(function (c, i) { c.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); });
  });
  [].slice.call(d.querySelectorAll('.split > .reveal')).forEach(function (el, i) {
    if (!el.classList.contains('from-left') && !el.classList.contains('from-right')) el.classList.add(el.parentNode.firstElementChild === el ? 'from-left' : 'from-right');
  });
  [].slice.call(d.querySelectorAll('.svc.reveal, .person.reveal')).forEach(function (el) { el.classList.add('zoom'); });
  var filterBtns = d.querySelectorAll('.filters button');
  [].slice.call(filterBtns).forEach(function (b) {
    b.addEventListener('click', function () {
      [].slice.call(d.querySelectorAll('.masonry figure:not([hidden])')).forEach(function (f, i) {
        f.classList.remove('pop'); void f.offsetWidth; f.style.animationDelay = (i * 0.04) + 's'; f.classList.add('pop');
      });
    });
  });
})();
