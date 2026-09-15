/**
 * Check of the engine and registry pages, in a real browser.
 *
 * What is checked is not "the page answers 200" — it would answer 200 while
 * being blank. We look at what the browser really produces: text, a frame
 * counter that advances, and pixels that differ from one another in the WebGL
 * canvas.
 *
 * This script has already earned its place: it reported that the surfaces page
 * displayed two of them when the arbiter grants only one per backend. The
 * second was refused and showed its fallback — a page that contradicted what
 * it explained, invisible to the compiler as to the unit test.
 *
 * Usage:
 *
 *   node scripts/check-engine.mjs [url]
 *
 * The playground development server must be running at that address.
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const { chromium } = await import('playwright')
const browser = await chromium.launch()

const PAGES = [
  '/docs/engine',
  '/docs/engine/loop',
  '/docs/engine/motion-policy',
  '/docs/engine/webgl',
  '/docs/engine/diagnostics',
  '/docs/registry',
  '/docs/registry/cli',
  '/docs/registry/contract',
  '/docs/registry/gallery',
  '/docs/backgrounds',
  '/docs/text',
  '/docs/motion/library',
  '/docs/images',
  '/docs/components/select-menu',
  '/docs/sections',
]

const failures = []

for (const path of PAGES) {
  const page = await browser.newPage()
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const text = await page.evaluate(() => document.body.innerText.trim())
  if (text.length < 400) {
    failures.push(`${path} : content nearly empty (${text.length} characters)`)
  }
  for (const error of errors) failures.push(`${path} : ${error}`)

  // The frame counter must advance: a frozen value signals a loop that
  // dispatches nothing.
  if (path === '/docs/engine/loop') {
    const read = () =>
      page.evaluate(() => {
        const nodes = [...document.querySelectorAll('span.o-tabular-nums')]
        return nodes.map((node) => node.textContent?.trim() ?? '')
      })
    const first = await read()
    await page.waitForTimeout(600)
    const second = await read()
    if (JSON.stringify(first) === JSON.stringify(second)) {
      failures.push(`${path} : the frame counter does not advance (${first.join(', ')})`)
    }
  }

  // The canvas must paint something other than a flat fill.
  if (path === '/docs/engine/webgl') {
    const canvases = await page.evaluate(() => {
      return [...document.querySelectorAll('canvas')].map((canvas) => ({
        width: canvas.width,
        height: canvas.height,
      }))
    })
    // A single surface: the arbiter grants only one context per backend.
    if (canvases.length !== 1) {
      failures.push(`${path} : ${canvases.length} canvases instead of 1`)
    }
    for (const [index, canvas] of canvases.entries()) {
      if (canvas.width < 10 || canvas.height < 10) {
        failures.push(
          `${path} : canvas ${index} of size ${canvas.width}x${canvas.height}`,
        )
      }
    }

    const shot = await page.locator('canvas').first().screenshot()
    const unique = new Set()
    for (let offset = 0; offset < shot.length; offset += 97) unique.add(shot[offset])
    if (unique.size < 8) {
      failures.push(`${path} : the canvas looks uniform (${unique.size} values)`)
    }
  }

  // The contract page renders a component installed by the CLI, imported
  // through the project alias: if the chain breaks anywhere, it is empty.
  if (path === '/docs/registry/contract') {
    const bars = await page.evaluate(
      () => document.querySelectorAll('[role="progressbar"]').length,
    )
    if (bars !== 2) {
      failures.push(`${path} : ${bars} progress bars instead of 2`)
    }
  }

  await page.close()
}

await browser.close()

if (failures.length > 0) {
  console.error(`\nFailure — ${failures.length} problem(s) :\n`)
  for (const failure of failures) console.error(`  · ${failure}`)
  console.error('')
  process.exitCode = 1
} else {
  console.log(`\n${PAGES.length} pages checked, nothing to report.\n`)
}
