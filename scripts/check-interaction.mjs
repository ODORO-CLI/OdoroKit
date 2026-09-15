/**
 * Checks that the interactive components hold up with the keyboard alone.
 *
 * ## Why this check is separate
 *
 * A component can be perfectly rendered and remain unusable: a drop-down that
 * only opens on a click, a comparator the arrow keys do not move. None of that
 * shows up in a render test, nor in a screenshot, nor at compile time. You
 * have to press the keys.
 *
 * Three things are checked here: the combobox pattern of the SelectMenu, the
 * comparison slider, and the fact that the engine loop really does write into
 * the displacement filter — a filter that is set but motionless would look
 * correct in a capture.
 *
 * Usage:
 *
 *   node scripts/check-interaction.mjs [url]
 *
 * The playground development server must be running at that address.
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const fails = []

// --- SelectMenu: the combobox pattern must hold up with the keyboard alone.
const page = await browser.newPage()
page.on('pageerror', (e) => fails.push('select : ' + String(e)))
await page.goto(`${base}/docs/components/select-menu`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const combo = page.getByRole('combobox').first()
await combo.focus()
await page.keyboard.press('ArrowDown')
await page.waitForTimeout(200)
const opened = await page.evaluate(() => {
  const c = document.querySelector('[role="combobox"]')
  return {
    expanded: c?.getAttribute('aria-expanded'),
    activedescendant: c?.getAttribute('aria-activedescendant') !== null,
    // The page carries other lists — the documentation search is one of them:
    // we only count the one the combobox designates.
    listbox: document.getElementById(c?.getAttribute('aria-controls') ?? '') !== null,
    options:
      document
        .getElementById(c?.getAttribute('aria-controls') ?? '')
        ?.querySelectorAll('[role="option"]').length ?? 0,
  }
})
console.log('selectmenu opened :', JSON.stringify(opened))
if (opened.expanded !== 'true') fails.push('select : does not open on the arrow key')
if (!opened.listbox) fails.push('select : aria-controls designates no list')
if (opened.options < 4) fails.push(`select : ${opened.options} options`)

await page.keyboard.press('ArrowDown')
await page.keyboard.press('Enter')
await page.waitForTimeout(200)
const closed = await page.evaluate(() => ({
  expanded: document.querySelector('[role="combobox"]')?.getAttribute('aria-expanded'),
  hidden: document.querySelector('input[type="hidden"]')?.getAttribute('value'),
}))
console.log('after Enter :', JSON.stringify(closed))
if (closed.expanded !== 'false') fails.push('select : stays open after Enter')
if (!closed.hidden) fails.push('select : the hidden value is empty')
await page.close()

// --- Images: filter set, comparison with the keyboard.
const img = await browser.newPage()
img.on('pageerror', (e) => fails.push('images : ' + String(e)))
await img.goto(`${base}/docs/images`, { waitUntil: 'networkidle' })
await img.waitForTimeout(1500)

const state = await img.evaluate(() => {
  // The serialised value carries quotes: `url("#id")`.
  const deformed = [...document.querySelectorAll('div')].filter((d) =>
    d.style.filter.startsWith('url('),
  ).length
  const scales = [...document.querySelectorAll('feDisplacementMap')].map((n) =>
    Number(n.getAttribute('scale')),
  )
  const offsets = [...document.querySelectorAll('feOffset')].map((n) =>
    n.getAttribute('dx'),
  )
  const slider = document.querySelector('[role="slider"]')
  return {
    filters: deformed,
    turbulences: document.querySelectorAll('feTurbulence').length,
    slider: slider !== null,
    value: slider?.getAttribute('aria-valuenow'),
    scales,
    offsets,
  }
})
console.log('images :', JSON.stringify(state))
if (state.filters < 2) fails.push(`images : ${state.filters} deformed elements`)
if (state.turbulences < 2) fails.push('images : SVG filters absent')
if (!state.scales.some((v) => v > 0))
  fails.push('images : zero displacement, the filter deforms nothing')

// The field must drift: it is the loop that writes `dx`.
await img.waitForTimeout(700)
const after = await img.evaluate(() =>
  [...document.querySelectorAll('feOffset')].map((n) => n.getAttribute('dx')),
)
if (JSON.stringify(after) === JSON.stringify(state.offsets)) {
  fails.push('images : the field does not drift, the loop writes nothing')
}
console.log('field drift :', state.offsets.join(','), '->', after.join(','))
if (!state.slider) fails.push('images : no comparison slider')

await img.locator('[role="slider"]').first().focus()
await img.keyboard.press('ArrowRight')
await img.waitForTimeout(150)
const moved = await img.evaluate(() =>
  document.querySelector('[role="slider"]')?.getAttribute('aria-valuenow'),
)
console.log('comparison after arrow key :', state.value, '->', moved)
if (moved === state.value)
  fails.push('images : the slider does not move with the keyboard')

await browser.close()
if (fails.length > 0) {
  console.error('\nFailure :')
  for (const f of fails) console.error('  · ' + f)
  process.exitCode = 1
} else console.log('\nBatch 4 : nothing to report.')
