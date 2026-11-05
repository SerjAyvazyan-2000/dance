(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  doc.classList.add('js');

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- preloader ---------- */
  var pre = document.getElementById('preloader');
  function loaded() {
    if (doc.classList.contains('is-loaded')) return;
    if (pre) pre.classList.add('is-done');
    doc.classList.add('is-loaded');
    document.body.classList.add('is-loaded');
  }
  window.addEventListener('load', function () { setTimeout(loaded, reduce ? 0 : 900); });
  setTimeout(loaded, 2200); // страховка, если какая-то картинка грузится долго

  /* ---------- header, progress, fab ---------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  var fab = document.getElementById('fab');
  var formEl = document.getElementById('form');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 20);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (fab && formEl) {
      var r = formEl.getBoundingClientRect();
      var formVisible = r.top < window.innerHeight && r.bottom > 0;
      fab.classList.toggle('is-show', y > window.innerHeight * 0.8 && !formVisible);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- burger ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('lock', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); closeLb(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) setMenu(false);
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal, .path__step');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(sib, 5) * 0.08 + 's';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- hero spotlight + parallax ---------- */
  var hero = document.getElementById('hero');
  var spot = document.getElementById('spot');
  var layers = document.querySelectorAll('#heroVisual [data-depth]');
  if (finePointer && !reduce && hero) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      spot.style.setProperty('--mx', (x * 100) + '%');
      spot.style.setProperty('--my', (y * 100) + '%');
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth'));
        l.style.transform = 'translate3d(' + ((x - .5) * -22 * d) + 'px,' + ((y - .5) * -22 * d) + 'px,0)';
      });
    });
    hero.addEventListener('mouseleave', function () {
      layers.forEach(function (l) { l.style.transform = ''; });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        b.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.3 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    document.querySelectorAll('.g').forEach(function (g) {
      g.addEventListener('mousemove', function (e) {
        var r = g.getBoundingClientRect();
        g.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
        g.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- direction filter ---------- */
  var tabs = document.querySelectorAll('.tab');
  var dirs = document.querySelectorAll('.dir');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-filter');
      tabs.forEach(function (x) {
        var on = x === t;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-selected', String(on));
      });
      dirs.forEach(function (d) {
        var cats = d.getAttribute('data-cat').split(' ');
        var show = f === 'all' || cats.indexOf(f) > -1;
        d.classList.toggle('is-hidden', !show);
        if (show) { d.classList.add('is-in'); }
      });
    });
  });

  /* ---------- prefill group from CTA ---------- */
  var select = document.getElementById('f-group');
  var groupMap = {
    'Бусинки / Сладкоежки': 0, 'Мандаринки': 1, 'Искры': 2, 'Красотки / Фиалки': 3,
    'Подкачка + растяжка': 4, 'Сольная постановка': 5, 'Мастер-класс на день рождения': 6
  };
  document.querySelectorAll('[data-group]').forEach(function (a) {
    a.addEventListener('click', function () {
      var i = groupMap[a.getAttribute('data-group')];
      if (select && i !== undefined) select.selectedIndex = i;
    });
  });

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.getAttribute('data-count'), t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var items = Array.prototype.slice.call(document.querySelectorAll('.g'));
  var cur = 0, lastFocus = null;
  function openLb(i) {
    cur = (i + items.length) % items.length;
    var it = items[cur];
    lbImg.src = it.getAttribute('data-src');
    lbImg.alt = it.querySelector('img').alt;
    if (lb.hidden) { lastFocus = document.activeElement; }
    lb.hidden = false;
    document.body.classList.add('lock');
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove('lock');
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (it, i) { it.addEventListener('click', function () { openLb(i); }); });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { openLb(cur - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { openLb(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'ArrowLeft') openLb(cur - 1);
    if (e.key === 'ArrowRight') openLb(cur + 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) openLb(cur + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- phone mask ---------- */
  var phone = document.getElementById('f-phone');
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d && d.charAt(0) !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '';
    if (d.length) out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    phone.value = out;
    phone.classList.remove('is-error');
  });

  /* ---------- form ---------- */
  var msg = document.getElementById('formMsg');
  var name = document.getElementById('f-name');
  var agree = document.getElementById('f-agree');
  name.addEventListener('input', function () { name.classList.remove('is-error'); });
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    msg.className = 'form-msg';
    if (name.value.trim().length < 2) { name.classList.add('is-error'); ok = false; }
    if (phone.value.replace(/\D/g, '').length < 11) { phone.classList.add('is-error'); ok = false; }
    if (!ok) { msg.textContent = 'Проверьте имя и номер телефона.'; msg.classList.add('err'); return; }
    if (!agree.checked) { msg.textContent = 'Нужно согласие на обработку данных.'; msg.classList.add('err'); return; }
    // Здесь подключается отправка: Telegram-бот, CRM или почта.
    msg.textContent = 'Спасибо, ' + name.value.trim() + '! Заявка принята, перезвоним в течение дня.';
    msg.classList.add('ok');
    formEl.reset();
    agree.checked = true;
  });

  /* ---------- cookie ---------- */
  var cookie = document.getElementById('cookie');
  if (!store('adance-cookie')) {
    setTimeout(function () { cookie.hidden = false; }, 1800);
  }
  function closeCookie(v) { store('adance-cookie', v); cookie.hidden = true; }
  document.getElementById('cookieOk').addEventListener('click', function () { closeCookie('all'); });
  document.getElementById('cookieNo').addEventListener('click', function () { closeCookie('necessary'); });
})();
