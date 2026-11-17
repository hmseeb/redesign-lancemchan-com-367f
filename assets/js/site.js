/* Lance McHan - site interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------- nav ---------------------------------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var drawer = document.getElementById('mobile-nav');
    if (toggle && drawer) {
      toggle.addEventListener('click', function () {
        var open = drawer.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    // dropdowns: keyboard / touch support
    document.querySelectorAll('.has-sub > .navbtn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var li = btn.parentNode;
        var open = li.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('click', function (e) {
      document.querySelectorAll('.has-sub.open').forEach(function (li) {
        if (!li.contains(e.target)) {
          li.classList.remove('open');
          var b = li.querySelector('.navbtn');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ---------------------------- fade-up reveal --------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });

    // Safety net: never leave content invisible (print, screenshot tools,
    // anchor jumps or a stalled observer).
    window.setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains('in')) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, 1800);
  }

  /* --------------------------- steps progress ---------------------------- */
  function initSteps() {
    var steps = document.querySelectorAll('[data-steps]');
    if (!steps.length) return;
    if (!('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('is-filled'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-filled');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------ chooser -------------------------------- */
  function initChooser() {
    var chooser = document.querySelector('[data-chooser]');
    if (!chooser) return;
    var tabs = chooser.querySelectorAll('[data-chooser-tab]');
    var panels = chooser.querySelectorAll('[data-chooser-panel]');
    function select(key) {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.dataset.chooserTab === key ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        var match = p.dataset.chooserPanel === key;
        p.hidden = !match;
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t.dataset.chooserTab); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(t);
        var next = e.key === 'ArrowRight' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
        list[next].focus();
        select(list[next].dataset.chooserTab);
      });
    });
  }

  /* ----------------------------- carousel -------------------------------- */
  function initCarousel() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('.carousel-track');
      var slides = root.querySelectorAll('.carousel-slide');
      var prev = root.querySelector('[data-carousel-prev]');
      var next = root.querySelector('[data-carousel-next]');
      var dotWrap = root.querySelector('[data-carousel-dots]');
      var controls = root.querySelector('.carousel-controls');
      if (!track || !slides.length) return;
      var index = 0;

      function perView() { return window.innerWidth >= 980 ? 3 : 1; }
      function maxIndex() { return Math.max(0, slides.length - perView()); }

      // With everything on screen there is nothing to page through, so the
      // arrows and dots are hidden rather than shown disabled.
      function syncControls() {
        if (controls) controls.hidden = maxIndex() === 0;
      }

      function renderDots() {
        if (!dotWrap) return;
        dotWrap.innerHTML = '';
        if (maxIndex() === 0) return;
        for (var i = 0; i <= maxIndex(); i++) {
          (function (i) {
            var b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', 'Show reviews starting at ' + (i + 1));
            b.setAttribute('aria-current', i === index ? 'true' : 'false');
            b.addEventListener('click', function () { go(i); });
            dotWrap.appendChild(b);
          })(i);
        }
      }

      function go(i) {
        index = Math.min(Math.max(i, 0), maxIndex());
        // measure the slide itself so the flex gap between cards is respected
        var offset = slides[index] ? slides[index].offsetLeft : 0;
        track.style.transform = 'translateX(-' + offset + 'px)';
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index >= maxIndex();
        if (dotWrap) {
          Array.prototype.forEach.call(dotWrap.children, function (d, di) {
            d.setAttribute('aria-current', di === index ? 'true' : 'false');
          });
        }
        slides.forEach(function (s, si) {
          var visible = si >= index && si < index + perView();
          s.setAttribute('aria-hidden', visible ? 'false' : 'true');
        });
      }

      if (prev) prev.addEventListener('click', function () { go(index - 1); });
      if (next) next.addEventListener('click', function () { go(index + 1); });

      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          syncControls(); renderDots(); go(Math.min(index, maxIndex()));
        }, 150);
      });

      syncControls();
      renderDots();
      go(0);
    });
  }

  /* ------------------------- review "read more" -------------------------- */
  function initReviewClamp() {
    document.querySelectorAll('[data-review-grid] .review').forEach(function (card) {
      var quote = card.querySelector('blockquote');
      if (!quote) return;
      card.classList.add('is-clamped');
      // nothing hidden once clamped? then the quote is already short enough
      if (quote.scrollHeight - quote.clientHeight < 4) {
        card.classList.remove('is-clamped');
        return;
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'read-more';
      btn.textContent = 'Read more';
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var clamped = card.classList.toggle('is-clamped');
        btn.textContent = clamped ? 'Read more' : 'Read less';
        btn.setAttribute('aria-expanded', clamped ? 'false' : 'true');
      });
      quote.insertAdjacentElement('afterend', btn);
    });
  }

  /* -------------------------------- FAQ ---------------------------------- */
  function initFaq() {
    document.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ----------------------------- calculator ------------------------------ */
  function initCalc() {
    var form = document.querySelector('[data-calc]');
    if (!form) return;
    var scope = form.closest('.calc') || document;
    var out = scope.querySelector('[data-calc-out]');
    var detail = scope.querySelector('[data-calc-detail]');
    if (!out || !detail) return;

    function num(name) {
      var el = form.querySelector('[name="' + name + '"]');
      if (!el) return NaN;
      var v = parseFloat(String(el.value).replace(/[^0-9.]/g, ''));
      return isNaN(v) ? NaN : v;
    }

    function money(v) {
      return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    // money inputs are shown with a $ and thousands separators while typing
    function formatMoneyFields() {
      form.querySelectorAll('[data-money]').forEach(function (el) {
        var raw = String(el.value).replace(/[^0-9.]/g, '');
        if (!raw) return;
        var v = parseFloat(raw);
        if (isNaN(v)) return;
        var next = money(v);
        if (el.value !== next) el.value = next;
      });
    }

    function calc() {
      var price = num('Home price');
      var down = num('Down payment');
      var rate = num('Interest rate');
      var years = num('Loan term');
      if (isNaN(price) || price <= 0 || isNaN(rate) || isNaN(years) || years <= 0) {
        out.textContent = '--';
        detail.textContent = 'Enter a home price, down payment, interest rate and loan term to see an estimate.';
        return;
      }
      if (isNaN(down)) down = 0;
      var principal = Math.max(price - down, 0);
      var n = Math.round(years * 12);
      var i = rate / 100 / 12;
      var payment = i === 0 ? principal / n : principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      if (!isFinite(payment)) {
        out.textContent = '--';
        return;
      }
      out.textContent = money(payment);
      detail.textContent = 'Based on a ' + money(principal) + ' loan over ' + n + ' payments at the rate shown. Principal and interest only; taxes, insurance and HOA dues are not included.';
    }

    form.addEventListener('input', calc);
    form.addEventListener('change', function () { formatMoneyFields(); calc(); });
    form.addEventListener('focusout', function () { formatMoneyFields(); calc(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    formatMoneyFields();
    calc();
  }

  /* -------------------------------- forms -------------------------------- */
  function showSuccess(container) {
    var box = container.querySelector('[data-form-success]');
    var form = container.querySelector('form');
    if (box) {
      box.hidden = false;
      box.setAttribute('tabindex', '-1');
      box.focus({ preventScroll: true });
      box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    if (form) form.hidden = true;
  }

  function initForms() {
    var href = window.location.href;
    document.querySelectorAll('[data-page]').forEach(function (input) { input.value = href; });

    var submitted = new URLSearchParams(window.location.search).get('submitted');
    if (submitted === '1') {
      document.querySelectorAll('[data-form-wrap]').forEach(function (wrap) { showSuccess(wrap); });
    }

    document.querySelectorAll('[data-form-wrap] form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        if (!window.fetch || !window.FormData) return; // plain POST fallback
        e.preventDefault();
        var wrap = form.closest('[data-form-wrap]');
        var btn = form.querySelector('button[type="submit"]');
        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
        var data = new FormData(form);
        var payload = {};
        data.forEach(function (value, key) { payload[key] = value; });
        payload._page = window.location.href;

        try {
          var ghlName = String(payload.name || '').trim();
          var ghlParts = ghlName.split(/\s+/);
          var ghlFirst = ghlParts.shift() || '';
          var ghlLast = ghlParts.join(' ');
          var ghlForm = String(payload._form || '').trim();
          var ghlPath = window.location.pathname;
          if (!payload._gotcha) {
            fetch('https://services.leadconnectorhq.com/hooks/4q70HDVbuHdM42CGJq10/webhook-trigger/a40dba9b-61f8-4dde-a7b9-8cd54c30a8b1', {
              method: 'POST',
              mode: 'cors',
              keepalive: true,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: ghlName,
                first_name: ghlFirst,
                last_name: ghlLast,
                email: payload.email || '',
                phone: payload.phone || '',
                form: ghlForm,
                page: ghlPath,
                property_address: payload['Property address'] || '',
                property_type: payload['Property type'] || '',
                timeline: payload['Timeline'] || '',
                need: payload['Need'] || '',
                message: payload['Message'] || '',
                source: 'Website form: ' + (ghlForm || ghlPath)
              })
            }).catch(function () {});
          }
        } catch (ghlErr) {}

        fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (res) {
          return res.json().catch(function () { return { ok: res.ok }; });
        }).then(function (json) {
          if (json && json.ok) {
            showSuccess(wrap);
          } else {
            form.submit();
          }
        }).catch(function () {
          form.submit();
        }).then(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
      });
    });
  }

  /* --------------------- warm up below-the-fold images -------------------- */
  function initImageWarmup() {
    // Images below the fold load lazily for a fast first paint, then warm up
    // once the page is idle so scrolling (and printing) never waits on them.
    window.setTimeout(function () {
      document.querySelectorAll('img[loading="lazy"]').forEach(function (im) {
        im.loading = 'eager';
      });
    }, 1500);
  }

  /* ------------------------------- year ---------------------------------- */
  function initYear() {
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initNav();
    initReveal();
    initSteps();
    initChooser();
    initCarousel();
    initReviewClamp();
    initFaq();
    initCalc();
    initForms();
    initImageWarmup();
    initYear();
  });
})();
