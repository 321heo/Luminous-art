/* LUMINOUS ART — interaction */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var gallery = document.getElementById('gallery');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.g-card'));
  var visible = cards.slice();

  /* ---------- header state ---------- */
  function onScroll() {
    if (window.scrollY > 24) header.classList.add('is-stuck');
    else header.classList.remove('is-stuck');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820 && nav.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- portfolio filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  function applyFilter(cat) {
    visible = [];
    cards.forEach(function (card) {
      var show = cat === 'all' || card.dataset.cat === cat;
      card.classList.toggle('is-hidden', !show);
      if (show) visible.push(card);
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      applyFilter(chip.dataset.filter);
    });
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle');
  var lbDesc = document.getElementById('lbDesc');
  var lbCount = document.getElementById('lbCount');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var index = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function render() {
    var card = visible[index];
    if (!card) return;
    var img = card.querySelector('img');
    lbImg.src = card.dataset.src;
    lbImg.alt = img ? img.alt : card.dataset.title;
    lbTitle.textContent = card.dataset.title;
    lbDesc.textContent = card.dataset.desc || '';
    lbCount.textContent = pad(index + 1) + ' / ' + pad(visible.length);
    var single = visible.length < 2;
    lbPrev.style.visibility = single ? 'hidden' : 'visible';
    lbNext.style.visibility = single ? 'hidden' : 'visible';
  }

  function openLb(card) {
    index = visible.indexOf(card);
    if (index < 0) index = 0;
    lastFocus = card;
    render();
    lb.hidden = false;
    // force reflow so the opacity transition runs
    void lb.offsetWidth;
    lb.classList.add('is-open');
    document.body.classList.add('is-locked');
    lbClose.focus();
  }

  function closeLb() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () {
      lb.hidden = true;
      lbImg.removeAttribute('src');
    }, 300);
    if (lastFocus) lastFocus.focus();
  }

  function go(step) {
    if (visible.length < 2) return;
    index = (index + step + visible.length) % visible.length;
    render();
  }

  cards.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', (card.dataset.title || '사진') + ' 크게 보기');
    card.addEventListener('click', function () { openLb(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLb(card);
      }
    });
  });

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function () { go(-1); });
  lbNext.addEventListener('click', function () { go(1); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLb();
  });

  /* swipe on touch devices */
  var touchX = null;
  lb.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
      return;
    }
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  /* ---------- sanity ---------- */
  if (gallery && !cards.length) console.warn('portfolio cards not found');
})();
