/**
 * Check of the vertical slice, in a real browser.
 *
 * A shader is only a string of characters to TypeScript: it compiles without
 * flinching, then fails at run time. This script has already earned its place
 * twice — a reserved word of the language used as a variable name, and a grave
 * accent inside the template, which closed it early.
 *
 * The last pass is the most important: under reduced motion, none of this must
 * mount, and the fallbacks must hold the page on their own.
 *
 * Usage:
 *
 *   node scripts/check-gallery.mjs [url]
 *
 * The playground development server must be running at that address.
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')
const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(`${base}/docs/registry/gallery`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

const failures = []

// 1. The text was indeed split, and the wait lifted.
const split = await page.evaluate(() => {
  const host = [...document.querySelectorAll('p')].find((node) =>
    (node.getAttribute('aria-label') ?? node.textContent ?? '').startsWith('Construisez'),
  )
  if (host === undefined) return { present: false }
  return {
    present: true,
    pending: host.hasAttribute('data-o-split-pending'),
    fragments: host.querySelectorAll('*').length,
    opacity: getComputedStyle(host).opacity,
    label: host.getAttribute('aria-label'),
  }
})
console.log('split-reveal :', JSON.stringify(split))
if (!split.present) failures.push('split-reveal : element absent')
if (split.pending) failures.push('split-reveal : wait never lifted')
if (split.opacity === '0') failures.push('split-reveal : stays invisible')
if ((split.fragments ?? 0) < 10) {
  failures.push(`split-reveal : ${split.fragments} fragments, dubious splitting`)
}

// 2. The aurora paints something other than a flat fill.
const auroraShot = await page.locator('canvas').first().screenshot()
const auroraValues = new Set()
for (let i = 0; i < auroraShot.length; i += 89) auroraValues.add(auroraShot[i])
console.log('aurore : distinct values =', auroraValues.size)
if (auroraValues.size < 8) failures.push('aurore : uniform canvas')

// 3. Molten: mount the scene, then check that it paints.
await page.getByRole('button', { name: 'Monter la scene' }).click()
await page.waitForTimeout(4000)

const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length)
console.log('canvases after mounting :', canvases)
if (canvases < 2)
  failures.push(`molten : ${canvases} canvases, the scene was not mounted`)

if (canvases >= 2) {
  const shot = await page.locator('canvas').nth(1).screenshot()
  const values = new Set()
  for (let i = 0; i < shot.length; i += 89) values.add(shot[i])
  console.log('molten : distinct values =', values.size)
  if (values.size < 8) failures.push('molten : uniform canvas — silent shader ?')
}

// 4. The Molten fallback has indeed gone away.
const poster = await page.evaluate(() => {
  const hero = document.querySelector('[data-o-detail]')
  return hero === null ? null : hero.querySelectorAll(':scope > div').length
})
console.log('fallbacks left in the hero :', poster)

const glErrors = errors.filter((e) => /shader|GL_|WebGL|glsl/i.test(e))
if (glErrors.length > 0) failures.push(`graphics errors : ${glErrors.join(' | ')}`)
for (const error of errors) failures.push(`console : ${error}`)

// 5. The five shader backgrounds compile and paint.
//
// A shader is only a string to TypeScript: it has to be compiled to know. They
// are tried one by one, the arbiter granting only one context.
const backgrounds = await browser.newPage()
backgrounds.on('pageerror', (e) => failures.push(`backgrounds : ${String(e)}`))
backgrounds.on('console', (m) => {
  if (m.type() === 'error') failures.push(`backgrounds : ${m.text().slice(0, 160)}`)
})
await backgrounds.goto(`${base}/docs/backgrounds`, { waitUntil: 'networkidle' })
await backgrounds.waitForTimeout(2000)

for (const name of ['aurore', 'ondes', 'points', 'faisceaux', 'nappe']) {
  await backgrounds.getByRole('button', { name, exact: true }).click()
  await backgrounds.waitForTimeout(1500)

  const canvas = await backgrounds.evaluate(
    () => document.querySelectorAll('canvas').length,
  )
  const shot = await backgrounds.locator('canvas').first().screenshot()
  const values = new Set()
  for (let i = 0; i < shot.length; i += 89) values.add(shot[i])

  console.log(
    `background ${name.padEnd(11)} canvases ${String(canvas)}, ${String(values.size)} values`,
  )
  if (canvas !== 1) failures.push(`${name} : ${String(canvas)} canvases instead of 1`)
  if (values.size < 8) failures.push(`${name} : uniform canvas, silent shader ?`)
}
await backgrounds.close()

// 6. The five sections render, and the single-open FAQ holds.
const sec = await browser.newPage()
sec.on('pageerror', (e) => failures.push('sections : ' + String(e)))
sec.on('console', (m) => {
  if (m.type() === 'error') failures.push('sections : ' + m.text().slice(0, 160))
})
await sec.goto(`${base}/docs/sections`, { waitUntil: 'networkidle' })
await sec.waitForTimeout(2000)

const state = await sec.evaluate(() => {
  const grid = document.querySelector('[data-o-reveal-grid]')
  const details = [...document.querySelectorAll('details')]
  return {
    gridRevealed: grid?.hasAttribute('data-o-reveal-grid-shown') ?? false,
    gridOpacity: grid?.firstElementChild
      ? getComputedStyle(grid.firstElementChild).opacity
      : null,
    stuck: [...document.querySelectorAll('.o-sticky')].length,
    steps: document.querySelectorAll('[aria-current="step"]').length,
    questions: details.length,
    sharedNames: new Set(details.map((d) => d.getAttribute('name'))).size,
    logos: document.querySelectorAll('[data-o-marquee]').length,
  }
})
console.log(JSON.stringify(state))
if (!state.gridRevealed) failures.push('grid : never revealed')
if (state.gridOpacity === '0') failures.push('grid : stays invisible')
if (state.stuck < 4) failures.push(`stack : ${state.stuck} stuck cards`)
if (state.steps !== 1) failures.push(`steps : ${state.steps} active step`)
if (state.questions < 3) failures.push('faq : questions absent')
if (state.sharedNames !== 1)
  failures.push('faq : the shared name is missing, single opening will not work')
if (state.logos !== 1) failures.push('logos : the banner is missing')

// Only one question open at a time.
await sec.locator('summary').nth(0).click()
await sec.waitForTimeout(200)
await sec.locator('summary').nth(1).click()
await sec.waitForTimeout(200)
const open = await sec.evaluate(() => document.querySelectorAll('details[open]').length)
console.log('questions open after two clicks :', open)
if (open !== 1) failures.push(`faq : ${open} questions open instead of one`)

await sec.close()

// 7. Under reduced motion: no scene, no canvas, the fallbacks alone.
const plain = await browser.newPage()
plain.on('pageerror', (e) => failures.push(`reduced motion : ${String(e)}`))
await plain.emulateMedia({ reducedMotion: 'reduce' })
await plain.goto(`${base}/docs/registry/gallery`, { waitUntil: 'networkidle' })

// Wait for the element rather than a fixed delay. Too short a delay made this
// check fail one time out of two, accusing the title of being invisible when it
// had not been rendered yet: a test that names the wrong culprit is worse than
// a test that fails.
const plainTitle = plain.locator('p', { hasText: /^Construisez/ }).first()
await plainTitle.waitFor({ state: 'attached', timeout: 10000 })

const reduced = await plain.evaluate(() => {
  // The hero is not mounted on this pass: it waits for a click, and that click
  // does not happen. Here it is the aurora and the title that prove the rule.
  const title = [...document.querySelectorAll('p')].find((node) =>
    (node.textContent ?? '').startsWith('Construisez'),
  )
  return {
    canvas: document.querySelectorAll('canvas').length,
    titleFound: title !== undefined,
    titleVisible: title !== undefined && getComputedStyle(title).opacity !== '0',
    titleWaiting: title?.hasAttribute('data-o-split-pending') ?? false,
  }
})
console.log('reduced motion :', JSON.stringify(reduced))

if (reduced.canvas !== 0) {
  failures.push(`reduced motion : ${reduced.canvas} canvases, none was expected`)
}
if (!reduced.titleFound) {
  failures.push('reduced motion : the title was not rendered at all')
} else if (!reduced.titleVisible) {
  // The gravest possible defect: the neutralised animation took the final state
  // away with it.
  failures.push('reduced motion : the title is rendered but invisible')
}
if (reduced.titleWaiting) {
  failures.push(
    'reduced motion : waiting attribute set when there is nothing to wait for',
  )
}

await browser.close()

if (failures.length > 0) {
  console.error(`\nFailure — ${failures.length} problem(s) :\n`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exitCode = 1
} else {
  console.log('\nThe vertical slice renders correctly.\n')
}
