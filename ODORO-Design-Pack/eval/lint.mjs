#!/usr/bin/env node
/**
 * ODORO page lint — the mechanical floor of the doctrine (prompts/00-system-core.md).
 * Only rules decidable from the markup and the plan live here; judgement calls belong to the reviewer
 * (prompts/30-reviewer.md). No dependencies.
 *
 *   node eval/lint.mjs page.html plan.json [--json]
 *
 * Exit code 0 = no FAIL, 1 = at least one FAIL. WARNs never fail the run.
 */
import { readFileSync } from 'node:fs';

const [htmlPath, planPath] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const asJson = process.argv.includes('--json');
if (!htmlPath || !planPath) {
  console.error('usage: node eval/lint.mjs page.html plan.json [--json]');
  process.exit(2);
}
const html = readFileSync(htmlPath, 'utf8');
const plan = JSON.parse(readFileSync(planPath, 'utf8'));

/* ------------------------------------------------------------ tiny HTML tree --- */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);

function parse(src) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null, text: '' };
  let node = root;
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[5] !== undefined) {
      const chunk = m[5].replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, ' ');
      for (let n = node; n; n = n.parent) n.text += chunk;
      continue;
    }
    const [, closing, rawTag, rawAttrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      let n = node;
      while (n && n.tag !== tag) n = n.parent;
      if (n && n.parent) node = n.parent;
      continue;
    }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([^\s=>/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[a[1].toLowerCase()] = a[3] ?? a[4] ?? a[5] ?? '';
    }
    const el = { tag, attrs, children: [], parent: node, text: '', line: src.slice(0, m.index).split('\n').length };
    node.children.push(el);
    if (RAW.has(tag)) {
      const end = src.indexOf(`</${tag}`, re.lastIndex);
      el.text = end === -1 ? '' : src.slice(re.lastIndex, end);
      re.lastIndex = end === -1 ? src.length : end;
      continue;
    }
    if (!VOID.has(tag) && !selfClose) node = el;
  }
  return root;
}

const all = [];
(function walk(n) { for (const c of n.children) { all.push(c); walk(c); } })(parse(html));
const cls = (el) => (el.attrs.class || '').split(/\s+/).filter(Boolean);
const closest = (el, pred) => { for (let n = el.parent; n && n.tag !== '#root'; n = n.parent) if (pred(n)) return n; return null; };
const sectionOf = (el) => (el.attrs['data-od-section'] !== undefined ? el : closest(el, (n) => n.attrs['data-od-section'] !== undefined));
const where = (el) => `${sectionOf(el)?.attrs['data-od-section'] ?? 'page'}:L${el.line}`;

/* ------------------------------------------------------------------ report --- */
const results = [];
const report = (level, rule, message, at = 'page') => results.push({ level, rule, message, at });

/* R1 — colour only through token utilities */
const PALETTE = '(?:black|white|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
const COLOR_UTIL = new RegExp(`^(?:[\\w-]+:)*-?(?:text|bg|border(?:-[trblxy])?|from|via|to|fill|stroke|ring|outline|decoration|divide|placeholder|caret|accent|shadow)-${PALETTE}(?:-\\d{2,3})?(?:/\\d+)?$`);
const ARBITRARY_COLOR = /\[(?:#|rgb|rgba|hsl|hsla|oklch|oklab|color-mix)/i;
for (const el of all) {
  for (const c of cls(el)) {
    if (COLOR_UTIL.test(c) || ARBITRARY_COLOR.test(c)) report('FAIL', 'R1 colour-tokens', `"${c}" bypasses the Style tokens`, where(el));
  }
  if (el.attrs.style && /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(el.attrs.style)) report('FAIL', 'R1 colour-tokens', 'inline style sets a raw colour', where(el));
}

/* R2 — every planned section is built, to its composition, in order */
const built = all.filter((el) => el.attrs['data-od-section'] !== undefined && el.attrs['data-od-section'] !== 'header');
const plannedIds = plan.sections.map((s) => s.id);
for (const s of plan.sections) {
  const el = built.find((b) => b.attrs['data-od-section'] === s.id);
  if (!el) { report('FAIL', 'R2 sections', `planned section "${s.id}" is missing`); continue; }
  if (el.attrs['data-composition'] !== s.compositionId) report('FAIL', 'R2 sections', `"${s.id}" declares composition "${el.attrs['data-composition']}", plan says "${s.compositionId}"`, where(el));
}
const builtIds = built.map((b) => b.attrs['data-od-section']).filter((id) => plannedIds.includes(id));
if (builtIds.join() !== plannedIds.filter((id) => builtIds.includes(id)).join()) report('WARN', 'R2 sections', `section order ${builtIds.join(' → ')} differs from the plan`);
for (const b of built) if (!plannedIds.includes(b.attrs['data-od-section'])) report('WARN', 'R2 sections', `section "${b.attrs['data-od-section']}" is not in the plan`, where(b));

/* R3 — one h1, in the hero; headings do not skip levels */
const h1s = all.filter((el) => el.tag === 'h1');
const heroId = plan.sections.find((s) => s.gate)?.id ?? plan.sections[0]?.id;
if (h1s.length !== 1) report('FAIL', 'R3 headings', `expected exactly one h1, found ${h1s.length}`);
for (const h of h1s) if (sectionOf(h)?.attrs['data-od-section'] !== heroId) report('FAIL', 'R3 headings', 'the h1 must live in the hero', where(h));
let prevLevel = 0;
for (const el of all.filter((e) => /^h[1-6]$/.test(e.tag))) {
  const level = Number(el.tag[1]);
  if (prevLevel && level > prevLevel + 1) report('WARN', 'R3 headings', `${el.tag} follows h${prevLevel}`, where(el));
  prevLevel = level;
}

/* R4 — the gate: only the header and the hero */
for (const el of all.filter((e) => e.attrs['data-od-gate'] !== undefined)) {
  const id = el.attrs['data-od-section'];
  if (id !== heroId && id !== 'header' && el.tag !== 'header') report('FAIL', 'R4 gate', 'data-od-gate outside the header and the hero', where(el));
}
const hero = built.find((b) => b.attrs['data-od-section'] === heroId);
if (hero && hero.attrs['data-od-gate'] === undefined) report('WARN', 'R4 gate', 'the hero is not gated; its reveals will not wait for the loader', where(hero));

/* R5 — loader: once for landing/site plans with loader.enabled, never otherwise */
const loaders = all.filter((e) => e.attrs['data-od-loader'] !== undefined);
if (plan.loader?.enabled && loaders.length !== 1) report('FAIL', 'R5 loader', `plan enables the loader; found ${loaders.length}`);
if (!plan.loader?.enabled && loaders.length) report('FAIL', 'R5 loader', 'loader present but the plan disables it');
for (const l of loaders) {
  if (!all.some((e) => closest(e, (n) => n === l) && e.attrs['data-od-loader-count'] !== undefined)) report('FAIL', 'R5 loader', 'loader has no [data-od-loader-count]', where(l));
}

/* R6 — reveal attributes follow the choreography */
const REVEALS = new Set(['words', 'letters', 'fade', 'stagger', 'rule']);
for (const el of all.filter((e) => e.attrs['data-reveal'] !== undefined)) {
  const type = el.attrs['data-reveal'];
  const text = el.text.replace(/\s+/g, ' ').trim();
  if (!REVEALS.has(type)) { report('FAIL', 'R6 reveal', `unknown data-reveal="${type}"`, where(el)); continue; }
  if (type === 'letters' && text.length > 24) report('FAIL', 'R6 reveal', `letters on ${text.length} characters (max 24): "${text.slice(0, 40)}…"`, where(el));
  if (type === 'words' && text.split(' ').length > 70) report('WARN', 'R6 reveal', 'words on a long passage; paragraphs should fade as a block', where(el));
  if (type === 'words' && (cls(el).includes('overflow-hidden') || cls(el.parent).includes('overflow-hidden'))) report('FAIL', 'R6 reveal', 'a words reveal is clipped by overflow-hidden (shears the blur)', where(el));
  if (cls(el).some((c) => /(^|:)-?(translate|scale|rotate|skew)-/.test(c) && !/group-hover|hover|focus/.test(c))) report('WARN', 'R6 reveal', 'transform utilities on a revealed element; wrap it instead', where(el));
  const step = el.attrs['data-reveal-step'];
  const ranges = { words: [10, 90], letters: [20, 70], stagger: [60, 140] };
  if (step && ranges[type] && (step < ranges[type][0] || step > ranges[type][1])) report('WARN', 'R6 reveal', `data-reveal-step=${step} outside ${ranges[type].join('–')} for ${type}`, where(el));
}
for (const el of all) if (cls(el).some((c) => /(^|:)animate-/.test(c))) report('FAIL', 'R6 reveal', 'animate-* utility: motion belongs to the runtime', where(el));
for (const el of all.filter((e) => e.tag === 'script' && !e.attrs.src)) {
  if (!/classList\.add\(['"]od-js['"]\)/.test(el.text)) report('FAIL', 'R6 reveal', 'inline <script> in generated markup', where(el));
}

/* R7 — type system */
const DISPLAY_SERIFS = ['cormorant', 'libre-caslon-display', 'baskervville'];
const displayIsSerif = DISPLAY_SERIFS.includes(plan.style?.fonts?.display?.id);
for (const el of all) {
  const c = cls(el);
  if (c.some((x) => /(^|:)font-(sans|serif)$/.test(x))) report('WARN', 'R7 type', 'font-sans/font-serif bypass the Style fonts', where(el));
  if (displayIsSerif && c.includes('font-display')) {
    const small = c.find((x) => /(^|:)text-(xs|sm|base|lg|xl)$/.test(x) || /(^|:)text-\[(1[0-9]|2[0-7])px\]$/.test(x));
    if (small) report('FAIL', 'R7 type', `display serif set small ("${small}"): headline-only below ~28px`, where(el));
    if (['button', 'label', 'input'].includes(el.tag) || (el.tag === 'a' && closest(el, (n) => n.tag === 'nav'))) report('FAIL', 'R7 type', `display serif on a ${el.tag}`, where(el));
  }
}

/* R8 — accent rationing */
for (const s of built) {
  const inside = all.filter((e) => e === s || closest(e, (n) => n === s));
  const uses = inside.reduce((n, e) => n + cls(e).filter((c) => /(^|:)(text|bg|border|fill|stroke|from|to|via|decoration)-accent(\/\d+)?$/.test(c)).length, 0);
  if (uses > 3) report('WARN', 'R8 accent', `${uses} accent utilities in one section; the accent is one moment per viewport`, where(s));
}

/* R9 — images and links */
for (const el of all.filter((e) => e.tag === 'img')) {
  if (el.attrs.alt === undefined) report('FAIL', 'R9 a11y', 'img without alt', where(el));
  if (!el.attrs.src && el.attrs['data-od-placeholder'] === undefined) report('FAIL', 'R9 a11y', 'img with neither src nor data-od-placeholder', where(el));
}
for (const el of all.filter((e) => e.tag === 'a')) if (!el.attrs.href) report('WARN', 'R9 a11y', 'a without href', where(el));

/* R10 — page rhythm, from the plan */
const levels = ['still', 'subtle', 'lively', 'intense'];
const budget = levels.indexOf(plan.brief.motionEnergy);
plan.sections.forEach((s, i) => {
  const d = Math.abs(levels.indexOf(s.motion) - budget);
  if (d > 1 && !(i === 0 && s.motion === 'intense')) report('WARN', 'R10 rhythm', `"${s.id}" motion "${s.motion}" is more than one step from the brief's "${plan.brief.motionEnergy}"`);
  if (i >= 2 && [0, 1, 2].every((k) => plan.sections[i - k].density === 'dense')) report('WARN', 'R10 rhythm', `three dense sections in a row ending at "${s.id}"`);
});
if (plan.sections.filter((s) => s.gate).length !== 1 || !plan.sections[0]?.gate) report('WARN', 'R10 rhythm', 'exactly one gated section, first in the page, is expected');
const fams = [plan.style.fonts.display.id, plan.style.fonts.body.id].filter((v, i, a) => a.indexOf(v) === i);
if (DISPLAY_SERIFS.includes(plan.style.fonts.body.id)) report('FAIL', 'R10 rhythm', `body font "${plan.style.fonts.body.id}" is a headline-only display serif`);
if (fams.length > 2) report('FAIL', 'R10 rhythm', 'more than two type families');

/* ------------------------------------------------------------------ output --- */
const fails = results.filter((r) => r.level === 'FAIL').length;
const warns = results.filter((r) => r.level === 'WARN').length;
if (asJson) {
  console.log(JSON.stringify({ pass: fails === 0, fails, warns, results }, null, 2));
} else {
  for (const r of results) console.log(`${r.level.padEnd(4)}  ${r.rule.padEnd(16)} ${r.at.padEnd(18)} ${r.message}`);
  console.log(`\n${fails} FAIL, ${warns} WARN — ${fails ? 'not shippable' : 'passes the floor (now run the reviewer)'}`);
}
process.exit(fails ? 1 : 0);
