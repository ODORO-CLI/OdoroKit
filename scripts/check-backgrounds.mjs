/**
 * Check of the animated backgrounds, one by one, in a real browser.
 *
 * ## Why this script exists separately
 *
 * A shader is only a string of characters to TypeScript: it compiles without
 * flinching, then fails at run time. `check-gallery` covered five of them;
 * there are now more than twenty, and each has its own way of failing — a
 * reserved word of the language, a loop with non-constant bounds, a division
 * by zero that only shows at the exact centre of the frame.
 *
 * ## The three questions asked of each background
 *
 * 1. **Did the shader compile?** The surface does not fail loudly: the backend
 *    reports the error in the console and renders a black surface. So we
 *    listen to the warnings as much as to the errors.
 *
 * 2. **Was anything painted?** A shader that compiles may still render a
 *    uniform black — a missing uniform, a colour read too early. The capture
 *    is of the surface itself, never of the frame: the demonstration content
 *    would give weight to an empty image. A flat image compresses to a few
 *    hundred bytes, a pattern cannot.
 *
 * 3. **Does it move?** Two captures half a second apart must differ. A frozen
 *    background passes the first two questions and fails the only one that
 *    matters for an animated background.
 *
 * Usage:
 *
 *   node scripts/check-backgrounds.mjs [url]
 */

import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const catalogue = JSON.parse(
  readFileSync('packages/odoro-bits/dist/registry/index.json', 'utf8'),
)
// A background without a backend has no surface to check: `grid-lines` is two
// repeated gradients, and that is precisely what makes it interesting.
const backgrounds = catalogue.entries
  .filter((entry) => entry.category === 'background' && entry.backend !== false)
  .map((entry) => entry.name)

/** Below this, the capture is a flat fill: nothing was painted. */
const MINIMAL_WEIGHT = 3000

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const failures = []

for (const name of backgrounds) {
  const errors = []
  const onConsole = (message) => {
    // A shader that does not compile comes out as a warning, not an error: the
    // backend reports it and carries on rendering black.
    if (message.type() !== 'error' && message.type() !== 'warning') return

    const text = message.text()
    // The captures read the surface, which the driver reports as a pipeline
    // stall. That is the price of the check, not a defect of the shader.
    if (text.includes('GL Driver Message')) return

    errors.push(text)
  }
  const onError = (cause) => errors.push(String(cause))
  page.on('console', onConsole)
  page.on('pageerror', onError)

  await page.goto(`${base}/docs/backgrounds/${name}`, { waitUntil: 'networkidle' })

  const frame = page.locator('[data-o-atelier-frame]').first()
  await frame.waitFor({ state: 'visible', timeout: 10_000 })

  // The heavy scenes sit behind a switch: a component that downloads a hundred
  // and thirty kilobytes must not mount just because the page scrolled to it.
  //
  // The check has to flip it. Without this, every gated entry was reported as
  // "no surface mounted" — a failure that says nothing about the shader, only
  // about the switch. A check that cries wolf on a third of its subjects is a
  // check nobody reads.
  const gate = page.getByRole('switch').first()
  if ((await gate.count()) > 0 && (await gate.getAttribute('aria-checked')) === 'false') {
    await gate.click()
    // Downloading the backend, then compiling the shaders.
    await page.waitForTimeout(2500)
  }

  // The backend is loaded on demand: the first frame arrives afterwards.
  await page.waitForTimeout(1200)

  const state = await frame.evaluate((node) => {
    const canvas = node.querySelector('canvas')
    return canvas === null ? null : { w: canvas.width, h: canvas.height }
  })

  // The capture is of the surface, not of the frame: the demonstration content
  // would give weight to an entirely black image.
  const surface = frame.locator('canvas').first()
  const mounted = state !== null && state.w > 1 && state.h > 1
  const first = mounted ? await surface.screenshot() : Buffer.alloc(0)
  await page.waitForTimeout(600)
  const second = mounted ? await surface.screenshot() : Buffer.alloc(0)

  const problem = []
  if (errors.length > 0) problem.push(`console: ${errors.join(' | ')}`)
  if (!mounted) problem.push('no surface mounted')
  else {
    if (first.length < MINIMAL_WEIGHT) {
      problem.push(`flat capture (${String(first.length)} bytes): nothing was painted`)
    }
    if (first.equals(second)) problem.push('two identical captures: nothing moves')
  }

  const verdict = problem.length === 0 ? 'ok' : problem.join(' ; ')
  console.log(
    `${problem.length === 0 ? '  ' : '! '}${name.padEnd(14)} ${String(first.length).padStart(7)} b  ${verdict}`,
  )
  if (problem.length > 0) failures.push(`${name}: ${verdict}`)

  page.off('console', onConsole)
  page.off('pageerror', onError)
}

await browser.close()

if (failures.length > 0) {
  console.error(`\n${String(failures.length)} background(s) failed:`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`\n${String(backgrounds.length)} background(s) checked.`)
