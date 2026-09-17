// La feuille du projet, importee par l entree : elle entre ainsi dans le
// graphe du moteur, qui la hache et pose son <link> dans la tete a la
// construction. Le document ne la reference plus lui-meme.
import './styles.css'

/* ══════════════════════════════════════════════════════════════════════════
   ODORO — main.js
   One damped scroll clock drives a scrubbed 1080p video, four pinned chapters,
   hairlines, a chapter rail and the parallax layers. Reveal choreography:
   honest loader → gate flips at the START of the curtain exit → words arrive
   through the departing columns → below-the-fold is plain viewport-entry.
   ══════════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

  /* ── CHAPTERS — the visit's timeline, measured on the real footage ─────────
     Each chapter: [move t0→tHold] then [hold tHold→t1]. `w` is the scroll weight
     of each leg: the holds get MORE scroll than their seconds, so the camera
     parks in the room while the reader reads. `textIn` is the video time at
     which the chapter's copy arrives (as the camera decelerates). */
  const CHAPTERS = [
    { id: 0, label: "L'arrivée",  t0: 0.00, tHold: 3.20, t1: 4.70,  wMove: 0.9, wHold: 0.8, textIn: 0.00 },
    { id: 1, label: 'Le hall',    t0: 4.75, tHold: 8.00, t1: 9.70,  wMove: 1.0, wHold: 1.3, textIn: 7.60 },
    { id: 2, label: 'Le salon',   t0: 9.75, tHold: 12.2, t1: 14.40, wMove: 1.0, wHold: 1.3, textIn: 11.7 },
    { id: 3, label: 'La terrasse',t0: 14.5, tHold: 17.2, t1: 20.00, wMove: 1.0, wHold: 1.5, textIn: 16.8 },
  ];
  const VIDEO_END = 20.0;

  // Build the piecewise scroll→time map from the chapter legs.
  const LEGS = [];
  {
    let acc = 0;
    for (const c of CHAPTERS) {
      LEGS.push({ p0: acc, p1: acc + c.wMove, t0: c.t0, t1: c.tHold, ch: c.id, hold: false }); acc += c.wMove;
      LEGS.push({ p0: acc, p1: acc + c.wHold, t0: c.tHold, t1: c.t1, ch: c.id, hold: true });  acc += c.wHold;
    }
    for (const l of LEGS) { l.p0 /= acc; l.p1 /= acc; }
  }
  const progressToTime = p => {
    p = clamp(p, 0, 1);
    for (const l of LEGS) if (p <= l.p1 || l === LEGS[LEGS.length - 1]) {
      const u = (p - l.p0) / (l.p1 - l.p0);
      return lerp(l.t0, l.t1, clamp(u, 0, 1));
    }
    return VIDEO_END;
  };
  const timeToProgress = t => {
    for (const l of LEGS) if (t <= l.t1 || l === LEGS[LEGS.length - 1]) {
      const u = (t - l.t0) / (l.t1 - l.t0);
      return lerp(l.p0, l.p1, clamp(u, 0, 1));
    }
    return 1;
  };
  const chapterAt = t => {
    for (let i = CHAPTERS.length - 1; i >= 0; i--) if (t >= CHAPTERS[i].t0 - 0.001) return CHAPTERS[i];
    return CHAPTERS[0];
  };

  /* ── word splitting (keeps <em> and .line structure; nbsp stays glued) ──── */
  function splitWords(el) {
    if (el.dataset.split) return $$('.w', el);
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/( +)/);
          const frag = document.createDocumentFragment();
          parts.forEach(part => {
            if (!part) return;
            if (/^ +$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.classList.contains('w')) walk(child);
      });
    };
    walk(el);
    el.dataset.split = '1';
    return $$('.w', el);
  }
  // One sweep per chapter: eyebrow → title (75ms/word) → body (22ms/word) → rest.
  function scheduleChapter(ch) {
    let delay = 0;
    const order = [
      ['.chapter__eyebrow', 30],
      ['.chapter__title',   75],
      ['.chapter__body',    22],
      ['.chapter__metrics', 28],
      ['.chapter__cta',     40],
      ['.chapter__cue',     40],
    ];
    order.forEach(([sel, step]) => {
      const el = $(sel, ch); if (!el) return;
      const words = splitWords(el);
      words.forEach(w => { w.style.setProperty('--d', `${delay}ms`); delay += step; });
      delay += 90; // a beat between designed lines
    });
  }
  // Generic below-the-fold word blocks: 52ms per word (forma), one sweep per block.
  function scheduleBlock(el) {
    const words = splitWords(el);
    words.forEach((w, i) => w.style.setProperty('--d', `${i * 52}ms`));
  }

  /* ── DOM ──────────────────────────────────────────────────────────────── */
  const body      = document.body;
  const loader    = $('#loader');
  const loaderNum = $('#loaderNum');
  const loaderCnt = $('#loaderCount');
  const loaderFill= $('#loaderFill');
  const masthead  = $('#masthead');
  const rail      = $('#rail');
  const railItems = $$('.rail__item');
  const track     = $('#filmTrack');
  const stage     = $('#filmStage');
  const media     = $('#filmMedia');
  const video     = $('#filmVideo');
  const lines     = $('#filmLines');
  const chapters  = $$('.chapter');
  const footIdx   = $('#footIdx');
  const footFill  = $('#footFill');
  const footLabel = $('#footLabel');
  const footer    = $('#contact');
  const spacer    = $('#footerSpacer');

  chapters.forEach(scheduleChapter);
  $$('[data-reveal="words"]').filter(el => !el.closest('.chapter')).forEach(scheduleBlock);

  /* ── CHAPTER STATE MACHINE ─────────────────────────────────────────────── */
  const chapterState = new Map(chapters.map(c => [c, 'hidden']));
  function setChapterState(ch, state) {
    if (chapterState.get(ch) === state) return;
    chapterState.set(ch, state);
    ch.classList.toggle('is-in',  state === 'in');
    ch.classList.toggle('is-out', state === 'out');
  }

  /* ── VIDEO SOURCE — 1080p by default, 720p on narrow / data-saver ─────── */
  (() => {
    const narrow = window.innerWidth < 900;
    const saver  = navigator.connection && navigator.connection.saveData;
    const src = $('source', video);
    const fastQA = new URLSearchParams(location.search).get('fast') === '1';
    if ((narrow || saver || fastQA) && src) src.src = '/video/odoro-visite-720.mp4';
    video.load();
  })();

  /* ── READINESS — "ready" means ≥ 1 drawn frame, not a resolved promise ── */
  let videoReady = false;
  const whenVideoReady = new Promise(resolve => {
    let done = false;
    const finish = () => { if (done) return; done = true; videoReady = true; resolve(); };
    const tryDraw = () => {
      if (video.readyState < 2) return;
      const onSeeked = () => { video.removeEventListener('seeked', onSeeked); finish(); };
      video.addEventListener('seeked', onSeeked);
      try { video.currentTime = 0.04; } catch (e) { finish(); }
      setTimeout(finish, 1500); // Safari sometimes swallows the seeked event on a cold cache
    };
    if (video.readyState >= 2) tryDraw();
    else {
      video.addEventListener('loadeddata', tryDraw, { once: true });
      video.addEventListener('canplay', tryDraw, { once: true });
    }
    // Mobile Safari only fetches media after a gesture: nudge it on first touch.
    const nudge = () => { video.play().then(() => video.pause()).catch(() => {}); };
    window.addEventListener('touchstart', nudge, { once: true, passive: true });
  });
  const whenFontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  function fmt(n, dec) { return dec ? n.toFixed(dec).replace('.', ',') : Math.round(n).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' '); }

  /* ── LOADER — asset-backed counter with a 92 holding ceiling ───────────
     v crawls toward 92 while loading, runs to 100 once ready, and snaps the
     last 0.6%. MIN_VISIBLE 1300ms so a warm cache doesn't flash; CAP 7000ms so
     a stalled asset never traps the visitor. Gate flips at the START of exit. */
  const Q = new URLSearchParams(location.search);
  const FAST = Q.get('fast') === '1';           // QA harness: no anti-flash floor, short cap, instant transitions
  if (FAST) body.classList.add('is-fast');
  const SIM = FAST && Q.get('sim') !== null ? clamp(parseFloat(Q.get('sim')) || 0, 0, 1) : null;
  if (FAST && Q.get('y')) { document.body.style.transform = `translateY(-${parseInt(Q.get('y'), 10) || 0}px)`; }
  const MIN_VISIBLE = FAST ? 0 : (REDUCED ? 300 : 1300);
  const CAP = FAST ? 2500 : 7000;
  let ready = false;
  Promise.all([whenVideoReady, whenFontsReady]).then(() => { ready = true; });
  setTimeout(() => { ready = true; }, CAP);

  const tStart = performance.now();
  let v = 0, last = tStart, exited = false;

  function loaderTick(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const canFinish = ready && (now - tStart) >= MIN_VISIBLE;
    if (canFinish && v >= 99.4) v = 100;
    else { const ceiling = canFinish ? 100 : 92; v += (ceiling - v) * (canFinish ? 6 : 1.7) * dt; }
    const shown = Math.floor(v);
    loaderNum.textContent = shown;
    loaderFill.style.width = `${v}%`;
    // the percentage walks from the left edge to the right edge of the rule:
    // left:v% + translateX(-v%) lands flush left at 0 and flush right at 100, no measuring
    loaderCnt.style.left = `calc(var(--inset) + (100% - 2 * var(--inset)) * ${(v / 100).toFixed(4)})`;
    loaderCnt.style.setProperty('--x', `${(-v).toFixed(2)}%`);
    if (v >= 100 && !exited) { exitLoader(); return; }
    requestAnimationFrame(loaderTick);
  }
  function exitLoader() {
    exited = true;
    loader.classList.add('is-exiting');
    // GATE FLIPS NOW — content animates in THROUGH the departing columns.
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
    setChapterState(chapters[0], 'in');
    rail.classList.add('is-visible');
    // debug/deep-link: ?p=0.42 jumps the clock to a progress once the gate is open
    const qp = Q.get('p'), qto = Q.get('to');
    if (qp !== null || qto) {
      const targetY = () => {
        measure();
        if (qp !== null) return trackTop + clamp(parseFloat(qp) || 0, 0, 1) * (trackH - vh);
        if (qto === 'contact') return document.documentElement.scrollHeight;
        const el = document.getElementById(qto); return el ? el.getBoundingClientRect().top + window.scrollY - 64 : 0;
      };
      let n = 0;
      const push = () => { body.style.overflow = ''; window.scrollTo(0, targetY()); if (++n < 12) setTimeout(push, 40); else if (FAST) console.log('[odoro] scrolled to', window.scrollY, 'prog', prog.toFixed(3)); };
      setTimeout(push, 40);
    }
    // scroll release is separate: on the curtain's rest.
    const rest = (REDUCED || FAST) ? 50 : 1250;
    setTimeout(() => { loader.classList.add('is-done'); body.style.overflow = ''; }, rest);
  }
  body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  if (FAST) { v = 100; exitLoader(); $$('[data-reveal]').forEach(el => el.classList.add('is-in')); $$('[data-count]').forEach(el => { el.textContent = fmt(parseFloat(el.dataset.count), +(el.dataset.decimals || 0)) + (el.dataset.suffix || ''); }); }
  else requestAnimationFrame(loaderTick);

  /* ── THE CLOCK — one damped progress value; everything reads from it ──── */
  let raw = 0, prog = 0, vh = window.innerHeight, trackTop = 0, trackH = 1;
  let smoothT = 0;          // damped video time
  let seeking = false, seekTimer = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0; // pointer parallax (target / smoothed)
  let lastFrame = performance.now();
  let inFilm = false, activeIdx = -1;
  const DAMP = 4.2;         // τ ≈ 240ms — the lag IS the weight

  function measure() {
    vh = window.innerHeight;
    const r = track.getBoundingClientRect();
    trackTop = r.top + window.scrollY;
    trackH = r.height;
    // footer spacer
    const fh = footer.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--footer-h', `${fh}px`);
  }
  measure();
  window.addEventListener('resize', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(footer);

  video.addEventListener('seeked', () => { seeking = false; clearTimeout(seekTimer); });

  function applyTime(t) {
    if (video.readyState < 1) return; // metadata not in yet
    if (seeking) return;
    if (Math.abs(video.currentTime - t) < 0.018) return; // sub-frame: skip
    seeking = true;
    try { video.currentTime = t; } catch (e) { seeking = false; return; }
    clearTimeout(seekTimer);
    seekTimer = setTimeout(() => { seeking = false; }, 260); // never let a lost event freeze the scrub
  }

  function frame(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.1); lastFrame = now;
    const k = 1 - Math.exp(-DAMP * dt);

    const y = window.scrollY;
    raw = clamp((y - trackTop) / Math.max(1, trackH - vh), 0, 1);
    if (SIM !== null) raw = SIM; // QA: headless screenshots cannot scroll, so the clock is driven directly
    prog += (raw - prog) * ((REDUCED || FAST) ? 1 : k);
    const t = progressToTime(prog);
    smoothT = t;
    applyTime(t);

    inFilm = y < trackTop + trackH - vh * 0.5;
    // footer is uncovered by the spacer: hidden until the spacer's top enters the viewport
    const spTop = spacer.getBoundingClientRect().top;
    footer.classList.toggle('is-covered', spTop >= vh);
    masthead.classList.toggle('is-solid', !inFilm || y > 40);
    rail.classList.toggle('is-visible', inFilm && body.classList.contains('is-ready'));

    // chapters
    const cur = chapterAt(t);
    const legHold = t >= cur.tHold;
    const u = clamp((t - cur.t0) / (cur.t1 - cur.t0), 0, 1);      // 0..1 through the chapter
    chapters.forEach(el => {
      const c = CHAPTERS[+el.dataset.chapter];
      const state = chapterState.get(el);
      if (c.id === cur.id) {
        const arrived = t >= c.textIn - 0.001 || (c.id === 0 && body.classList.contains('is-ready'));
        if (arrived) setChapterState(el, 'in');
        else if (state !== 'hidden') setChapterState(el, 'hidden');
      } else if (c.id < cur.id) {
        if (state === 'in') setChapterState(el, 'out');
        else if (state !== 'out') setChapterState(el, 'hidden');
      } else {
        setChapterState(el, 'hidden');
      }
      if (c.id === cur.id && !REDUCED) {
        // scroll parallax within the chapter: title and aside travel at different rates
        el.style.setProperty('--py',  `${(0.5 - u) * 2.6}rem`);
        el.style.setProperty('--py2', `${(0.5 - u) * -1.1}rem`);
      }
    });

    // rail + foot readout
    if (activeIdx !== cur.id) {
      activeIdx = cur.id;
      railItems.forEach(li => li.classList.toggle('is-active', +li.dataset.chapter === cur.id));
      footIdx.textContent = String(cur.id + 1).padStart(2, '0');
      footLabel.textContent = cur.label;
    }
    footFill.style.setProperty('--p', u.toFixed(3));

    // hairlines: dip while the camera moves, settle at the holds
    lines.style.setProperty('--lines', legHold ? '0.9' : '0.38');

    // media parallax: pointer drift + a slow push-in over each hold
    if (!REDUCED) {
      mx += (tmx - mx) * k; my += (tmy - my) * k;
      const push = legHold ? 1.02 + 0.035 * clamp((t - cur.tHold) / Math.max(0.5, cur.t1 - cur.tHold), 0, 1) : 1.02;
      media.style.transform = `translate3d(${(mx * 14).toFixed(2)}px, ${(my * 10).toFixed(2)}px, 0) scale(${push.toFixed(4)})`;
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if (FINE_POINTER && !REDUCED) {
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    stage.addEventListener('pointerleave', () => { tmx = 0; tmy = 0; });
  }

  /* ── seek links (gallery cards, nav) → scroll to a chapter's hold ─────── */
  function scrollToChapter(idx) {
    const c = CHAPTERS[idx]; if (!c) return;
    const p = timeToProgress(c.tHold + 0.35);
    const y = trackTop + p * (trackH - vh);
    window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
  }
  $$('[data-seek]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollToChapter(+a.dataset.seek); }));
  $$('a[href^="#"]').forEach(a => {
    if (a.dataset.seek) return;
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1); const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (id === 'film' || id === 'top') { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
      if (id === 'contact') { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* ── below the fold: plain viewport-entry, once, latched at 35% ────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').filter(el => !el.closest('.chapter') && !el.closest('.masthead')).forEach((el, i) => {
    // siblings stagger on a 110ms grid within their section
    const sect = el.closest('section, footer');
    const sibs = sect ? $$('[data-reveal]', sect) : [el];
    el.style.setProperty('--d', `${(sibs.indexOf(el) % 6) * 110}ms`);
    io.observe(el);
  });
  // masthead brand words arrive with the gate
  splitWords($('.masthead__brand')).forEach((w, i) => w.style.setProperty('--d', `${300 + i * 60}ms`));
  const gateObs = new MutationObserver(() => { if (body.classList.contains('is-ready')) { $('.masthead__brand').classList.add('is-in'); gateObs.disconnect(); } });
  gateObs.observe(body, { attributes: true, attributeFilter: ['class'] });

  /* ── stats: count up on a 2.2s drum (drops 1.25rem and blurs as it lands) */
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; statObs.unobserve(el);
      const target = parseFloat(el.dataset.count); const dec = +(el.dataset.decimals || 0); const suffix = el.dataset.suffix || '';
      if (REDUCED) { el.textContent = fmt(target, dec) + suffix; return; }
      el.classList.add('is-counting');
      const t0 = performance.now(), D = 2200;
      const step = now => {
        const p = clamp((now - t0) / D, 0, 1);
        el.textContent = fmt(target * easeOutCubic(p), dec) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => statObs.observe(el));

  /* ── keyboard: arrows step through the chapters ─────────────────────── */
  window.addEventListener('keydown', e => {
    if (!inFilm) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { if (activeIdx < CHAPTERS.length - 1) { e.preventDefault(); scrollToChapter(activeIdx + 1); } }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { if (activeIdx > 0) { e.preventDefault(); scrollToChapter(activeIdx - 1); } }
  });

  // expose the clock for tuning in the console
  window.ODORO = { CHAPTERS, LEGS, progressToTime, timeToProgress, get time() { return smoothT; }, get progress() { return prog; } };
})();
