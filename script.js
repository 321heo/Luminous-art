/* LUMINOUS ART — interaction */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var projects = document.getElementById('projects');

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

  /* ---------- portfolio: 카테고리 → 현장 갤러리 모달 ---------- */
  var openers = Array.prototype.slice.call(document.querySelectorAll('[data-open]'));
  var modals = Array.prototype.slice.call(document.querySelectorAll('.pmodal'));
  var activeModal = null;
  var lastFocus = null;

  var catModal = document.getElementById('pm-cat');
  var catBody = catModal ? catModal.querySelector('.pm-body') : null;
  var catEyebrow = document.getElementById('pm-cat-cat');
  var catTitle = document.getElementById('pm-cat-title');
  var catCount = document.getElementById('pm-cat-count');
  var catSummary = document.getElementById('pm-cat-summary');
  var catFoot = document.getElementById('pm-cat-foot');
  var backBtn = catModal ? catModal.querySelector('[data-back]') : null;
  var catViews = catModal ? Array.prototype.slice.call(catModal.querySelectorAll('.pm-view')) : [];
  var currentCatView = null;

  /* 1단계(현장 목록) / 2단계(현장 사진) 뷰 전환 */
  function showCatView(id) {
    var view = id ? document.getElementById(id) : null;
    if (!view || !catBody) return;
    catViews.forEach(function (v) {
      v.classList.toggle('is-active', v === view);
    });
    if (catEyebrow) catEyebrow.textContent = view.dataset.eyebrow || '';
    if (catTitle) catTitle.textContent = view.dataset.title || '';
    if (catCount) catCount.textContent = view.dataset.count || '';
    if (catSummary) catSummary.textContent = view.dataset.summary || '';
    if (catFoot) catFoot.textContent = view.dataset.foot || '';
    if (backBtn) backBtn.hidden = view.dataset.level !== 'detail';
    currentCatView = view;
    catBody.scrollTop = 0;

    // 바뀐 뷰의 첫 조작 지점으로 초점 이동
    var target = view.dataset.level === 'detail'
      ? backBtn
      : view.querySelector('.pm-site');
    if (target) target.focus({ preventScroll: true });
  }

  function focusables(scope) {
    return Array.prototype.slice.call(
      scope.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
    );
  }

  function openModal(modal, trigger) {
    if (!modal) return;
    lastFocus = trigger || null;
    modal.hidden = false;
    void modal.offsetWidth; // let the open transition run
    modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    activeModal = modal;
    var body = modal.querySelector('.pm-body');
    if (body) body.scrollTop = 0;
    var first = modal.querySelector('.pm-close');
    if (first) first.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!activeModal) return;
    var modal = activeModal;
    activeModal = null;
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () {
      modal.hidden = true;
    }, 320);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  openers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = document.getElementById(btn.dataset.open);
      openModal(modal, btn);
      if (modal && modal === catModal) showCatView(btn.dataset.view || 'cv-fitness');
    });
  });

  modals.forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      var goto = e.target.closest('[data-goto]');
      if (goto) {
        showCatView(goto.dataset.goto);
        return;
      }
      var back = e.target.closest('[data-back]');
      if (back) {
        showCatView(currentCatView && currentCatView.dataset.parent ? currentCatView.dataset.parent : 'cv-fitness');
        return;
      }
      if (e.target.closest('[data-close]')) {
        closeModal();
        return;
      }
      // 바깥(어두운 배경) 클릭으로 닫기
      if (!e.target.closest('.pmodal-sheet')) closeModal();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (activeModal) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'Tab') {
        // 모달 안에서 초점이 돌도록
        var items = focusables(activeModal);
        if (!items.length) return;
        var firstItem = items[0];
        var lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
      return;
    }
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- sanity ---------- */
  if (projects && !openers.length) console.warn('portfolio projects not found');
})();
