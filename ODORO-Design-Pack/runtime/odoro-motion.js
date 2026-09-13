/*! ODORO Motion runtime v1.0
 *
 * Plays the house reveal choreography from HTML attributes. No dependencies.
 * Load at the end of <body> (or with `defer`), after odoro-motion.css.
 *
 *   data-reveal="words|letters|fade|stagger|rule"   what to reveal and how
 *   data-reveal-delay="ms"                           base delay
 *   data-reveal-step="ms"                            stagger step (words, letters, stagger)
 *   data-od-gate                                     on the header and the hero: reveals wait for the loader
 *   data-od-loader                                   the counter + curtain (label + count children)
 *
 * Events on document: `od:gate-open` (content starts revealing), `od:unlock` (scroll released).
 *
 * LOADER TIMING IS THE ASSET — do not "tidy" it: a linear 2000 ms count, labels blink out
 * (300 ms), a 200 ms hold, then a tension-90 / friction-20 spring lifts the plate; scroll
 * unlocks on the spring's REST. Gated content starts 500 ms after the count ends, so it rises
 * through the departing curtain. If fonts/images are not ready when the count ends, the number
 * parks at 99 until they are (capped), and the content clock shifts by the same amount.
 */
(function () {
  'use strict';

  var CONFIG = {
    COUNT_MS: 2000,
    WIPE_DELAY_MS: 200,
    WIPE_SPRING: { tension: 90, friction: 20, mass: 1 },
    REVEAL_AFTER_COUNT: 500,
    CAP_MS: 7000,
    NO_LOADER_CAP_MS: 1200,
    WORD_STEP: 60,
    WORD_MAX: 1600,
    LETTER_STEP: 52,
    STAGGER_STEP: 90,
    IO_THRESHOLD: 0.2,
    IO_MARGIN: '0px 0px -12% 0px'
  };

  var root = document.documentElement;
  root.classList.add('od-js');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function num(value, fallback) {
    var n = parseFloat(value);
    return isNaN(n) ? fallback : n;
  }

  /* ---------------------------------------------------------------- split --- */

  // per word, keeping inline elements (<em>, <strong>, <a>, <br>) intact
  function splitWords(el, base, step) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (token) {
            if (!token) return;
            if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(token)); return; }
            var w = document.createElement('span');
            w.className = 'od-w';
            w.textContent = token;
            w.style.setProperty('--od-d', Math.min(CONFIG.WORD_MAX, base + i * step) + 'ms');
            frag.appendChild(w);
            i++;
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(el);
  }

  // one mask per letter — short display type only
  function splitLetters(el, base, step) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
    el.textContent = '';
    Array.from(text).forEach(function (ch, n) {
      var mask = document.createElement('span');
      mask.className = 'od-lm';
      mask.setAttribute('aria-hidden', 'true');
      var letter = document.createElement('span');
      letter.className = 'od-lt';
      letter.textContent = ch === ' ' ? ' ' : ch;
      letter.style.setProperty('--od-d', base + n * step + 'ms');
      mask.appendChild(letter);
      el.appendChild(mask);
    });
  }

  function prepare(el) {
    var type = el.getAttribute('data-reveal');
    var base = num(el.getAttribute('data-reveal-delay'), 0);
    var step = el.getAttribute('data-reveal-step');
    if (type === 'words') splitWords(el, base, num(step, CONFIG.WORD_STEP));
    else if (type === 'letters') splitLetters(el, base, num(step, CONFIG.LETTER_STEP));
    else if (type === 'stagger') {
      Array.prototype.slice.call(el.children).forEach(function (child, i) {
        child.style.setProperty('--od-d', base + i * num(step, CONFIG.STAGGER_STEP) + 'ms');
      });
    } else el.style.setProperty('--od-d', base + 'ms');
  }

  /* --------------------------------------------------------------- spring --- */
  // react-spring's integrator: fixed 1 ms steps, tension x 1e-6, friction x 1e-3
  function spring(opts) {
    var tension = opts.config.tension, friction = opts.config.friction, mass = opts.config.mass || 1;
    var from = opts.from, to = opts.to;
    var precision = Math.min(1, Math.abs(to - from) * 0.001);
    var position = from, velocity = 0, last = null;
    function tick(now) {
      if (last === null) last = now;
      var elapsed = Math.min(64, now - last);
      last = now;
      for (var i = 0; i < elapsed; i++) {
        var force = -tension * 0.000001 * (position - to) - friction * 0.001 * velocity;
        velocity += force / mass;
        position += velocity;
      }
      var atRest = Math.abs(velocity) < precision && Math.abs(to - position) <= precision;
      if (atRest) position = to;
      opts.onChange(position);
      if (atRest) opts.onRest();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ run --- */
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  targets.forEach(prepare);

  var gated = [];
  var free = [];
  targets.forEach(function (el) { (el.closest('[data-od-gate]') ? gated : free).push(el); });

  function reveal(el) { el.classList.add('od-in'); }

  // below the fold is plain viewport entry, once — only the gate waits for the loader
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: CONFIG.IO_THRESHOLD, rootMargin: CONFIG.IO_MARGIN });
    free.forEach(function (el) { io.observe(el); });
  } else {
    free.forEach(reveal);
  }

  function openGate() {
    gated.forEach(reveal);
    document.dispatchEvent(new CustomEvent('od:gate-open'));
  }
  function unlock() {
    root.classList.remove('od-gated');
    document.dispatchEvent(new CustomEvent('od:unlock'));
  }

  // "ready" = fonts resolved and the page's images loaded
  var fontsReady = !document.fonts;
  var pageReady = document.readyState === 'complete';
  if (document.fonts) document.fonts.ready.then(function () { fontsReady = true; });
  window.addEventListener('load', function () { pageReady = true; });
  function isReady() { return fontsReady && pageReady; }

  var loader = document.querySelector('[data-od-loader]');
  var t0 = performance.now();

  if (!loader || reduced) {
    if (loader) loader.parentNode.removeChild(loader);
    (function wait() {
      if (isReady() || performance.now() - t0 > CONFIG.NO_LOADER_CAP_MS) { openGate(); unlock(); }
      else requestAnimationFrame(wait);
    })();
    return;
  }

  root.classList.add('od-gated');
  window.scrollTo(0, 0);
  var countEl = loader.querySelector('[data-od-loader-count] span') || loader.querySelector('[data-od-loader-count]');

  (function count(now) {
    var elapsed = now - t0;
    var p = Math.min(1, elapsed / CONFIG.COUNT_MS);
    var ready = isReady() || elapsed > CONFIG.CAP_MS;

    if (p < 1 || !ready) {
      if (countEl) countEl.textContent = String(Math.min(99, Math.round(p * 100)));
      requestAnimationFrame(count);
      return;
    }

    if (countEl) countEl.textContent = '100';
    setTimeout(openGate, CONFIG.REVEAL_AFTER_COUNT);
    loader.classList.add('od-done');

    setTimeout(function () {
      spring({
        from: 0,
        to: 1,
        config: CONFIG.WIPE_SPRING,
        onChange: function (v) { loader.style.transform = 'translate3d(0,' + v * -100 + '%,0)'; },
        onRest: function () {
          loader.style.visibility = 'hidden';
          loader.style.pointerEvents = 'none';
          unlock();
        }
      });
    }, CONFIG.WIPE_DELAY_MS);
  })(t0);
})();
