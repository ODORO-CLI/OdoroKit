/**
 * Check of the icons module, in a real browser.
 *
 * ## What can break without being seen
 *
 * An icon is data translated into SVG elements. Three ways of failing, all of
 * them silent:
 *
 * 1. **An untranslated dashed attribute.** React expects `fillRule`, not
 *    `fill-rule`, and ignores the incorrect form without a word. Paths with
 *    holes then fill entirely: an `o` becomes a disc. It only shows to the
 *    eye, or by measuring the painted area.
 *
 * 2. **An inverted mode.** A stroked path rendered in solid mode becomes a
 *    black blot; a solid glyph rendered as a stroke becomes invisible. Both
 *    pass every type check.
 *
 * 3. **The colour that does not follow the text.** A `fill` surviving the
 *    import would freeze the icon in black, which is only noticed in dark
 *    theme.
 *
 * So the check opens each pack, looks in it for an icon chosen for what it
 * exercises, and reads from the DOM what was actually set: the mode
 * attributes, the dashed ones, and the computed colour.
 *
 * Usage:
 *
 *   node scripts/check-icons.mjs [url]
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

/** One icon per pack, chosen because it has holes or thin strokes. */
const PACKS = [
  { module: 'outline', search: 'circle-alert' },
  // This one declares `fill-rule`: it is the only pack that uses it, and it is
  // the attribute React silently ignores if it is not translated.
  { module: 'compact', search: 'align-end', rule: true },
  { module: 'classic', search: 'circle-info' },
  { module: 'extended', search: 'home' },
  { module: 'brands', search: 'github' },
]

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))

const failures = []

for (const { module, search, rule } of PACKS) {
  await page.goto(`${base}/docs/icons/${module}`, { waitUntil: 'networkidle' })

  const field = page.getByRole('searchbox')
  await field.waitFor({ state: 'visible', timeout: 20_000 })
  await field.fill(search)

  const cells = page.locator('ul li button')
  await cells.first().waitFor({ state: 'visible', timeout: 10_000 })

  const measure = await cells.first().evaluate((node) => {
    const svg = node.querySelector('svg')
    if (svg === null) return undefined

    return {
      name: node.querySelector('span')?.textContent ?? '',
      nodes: svg.children.length,
      box: svg.getAttribute('viewBox'),
      fill: svg.getAttribute('fill'),
      stroke: svg.getAttribute('stroke'),
      // Untranslated dashed attributes never reach the DOM: their absence on a
      // path that declares them is the symptom.
      rules: svg.querySelectorAll('[fill-rule], [clip-rule]').length,
      // The effective colour must come from the text, never from an attribute.
      colour: getComputedStyle(svg).color,
    }
  })

  const problem = []
  if (measure === undefined) problem.push('no SVG rendered')
  else {
    if (measure.nodes === 0) problem.push('SVG without a single node')
    if (measure.box === null) problem.push('no box')
    // Both attributes are set together: the mode decides which one carries the
    // colour, and the other must be `none` or absent.
    const stroked = measure.stroke === 'currentColor'
    if (stroked && measure.fill !== 'none')
      problem.push('stroked path without fill="none"')
    if (!stroked && measure.fill !== 'currentColor')
      problem.push('solid glyph without fill')
    if (measure.colour === 'rgb(0, 0, 0)') {
      problem.push('black colour : it does not follow the text')
    }
    if (rule === true && measure.rules === 0) {
      problem.push('fill-rule absent from the DOM : the camel case translation is broken')
    }
  }

  const verdict = problem.length === 0 ? 'ok' : problem.join(' ; ')
  console.log(
    `${problem.length === 0 ? '  ' : '! '}${module.padEnd(10)} ${(measure?.name ?? '—').padEnd(16)} ${String(measure?.nodes ?? 0).padStart(2)} node(s)  ${verdict}`,
  )
  if (problem.length > 0) failures.push(`${module} : ${verdict}`)
}

// The site is the first consumer of the module: its own icons come from the
// filaire pack. A category added to the side column without an entry in the
// table falls back on a circle — visible, but nobody notices it.
await page.goto(`${base}/`, { waitUntil: 'networkidle' })
const circles = await page.evaluate(
  () =>
    [...document.querySelectorAll('aside svg')].filter(
      (svg) => svg.children.length === 1 && svg.firstElementChild?.tagName === 'circle',
    ).length,
)
console.log(`
side column : ${String(circles)} category(ies) without an icon of their own`)
if (circles > 0) {
  failures.push(
    `${String(circles)} category(ies) of the side column fall back on the default circle`,
  )
}

// The overview page shows only a handful of icons, but it is the only one that
// imports them without going through a lazy route.
await page.goto(`${base}/docs/icons`, { waitUntil: 'networkidle' })
const hues = await page.evaluate(() =>
  [...document.querySelectorAll('svg')]
    .map((svg) => getComputedStyle(svg).color)
    .filter((colour, index, all) => all.indexOf(colour) === index),
)
console.log(`\noverview : ${String(hues.length)} distinct colours`)
if (hues.length < 4) {
  failures.push('overview : the icons do not take the colour of the text')
}

await browser.close()

if (errors.length > 0) failures.push(`console : ${errors.join(' | ')}`)

if (failures.length > 0) {
  console.error(`\n${String(failures.length)} problem(s) :`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`\n${String(PACKS.length)} pack(s) checked.`)
