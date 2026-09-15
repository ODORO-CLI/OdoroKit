/**
 * Check of the live demonstrations, entry by entry.
 *
 * ## What this check answers
 *
 * Two questions, in this order.
 *
 * **Does every published entry have a preview?** The page of an entry without
 * a demonstration shows a notice saying so. It is honest, and there must be
 * none of them left: that is the first assertion.
 *
 * **Does the preview do anything?** A frame that contains a component but
 * stays inert passes every type check. So we act on each one — scroll, move
 * the pointer, click — and we look at what moved in the document.
 *
 * The four scrolling components are the most exposed: they measure against a
 * container, and the default container is the window. Placed in a frame that
 * scrolls, they do not fail — nothing simply happens.
 *
 * Usage:
 *
 *   node scripts/check-demos.mjs [url]
 */

import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const catalogue = JSON.parse(
  readFileSync('packages/odoro-bits/dist/registry/index.json', 'utf8'),
)

/** URL segment of each category. */
const SEGMENTS = {
  background: 'backgrounds',
  hero: 'heros',
  text: 'text',
  effect: 'effects',
  image: 'images',
  section: 'sections',
  hooks: 'hooks',
}

/**
 * What we do to a preview, and what must have changed afterwards.
 *
 * An entry absent from this table is only checked for the presence of its
 * preview: that is already what the other checks cover for the backgrounds,
 * the text effects and the images.
 */
const ACTIONS = {
  'effect/parallax': 'scroll',
  'effect/scroll-progress': 'scroll',
  'section/sticky-stack': 'scroll',
  'section/scroll-steps': 'scroll',
  'hooks/use-pointer-damped': 'pointer',
  'hooks/use-poster': 'buttons',
}

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const failures = []
let withPreview = 0

for (const entry of catalogue.entries) {
  const segment = SEGMENTS[entry.category]
  if (segment === undefined) continue

  const errors = []
  const onConsole = (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 160))
  }
  const onError = (e) => errors.push(String(e).slice(0, 200))
  page.on('console', onConsole)
  page.on('pageerror', onError)

  await page.goto(`${base}/${segment === '' ? '' : `docs/${segment}`}/${entry.name}`, {
    waitUntil: 'networkidle',
  })

  const problem = []

  // The absence notice is the most direct signal: the page says it itself.
  const withoutPreview = await page
    .getByText('n a pas encore de demonstration vivante')
    .count()
  if (withoutPreview > 0) problem.push('no live demonstration')
  else withPreview += 1

  const frame = page.locator('[data-o-atelier-frame]').first()
  const action = ACTIONS[entry.id]

  if (problem.length === 0 && action !== undefined) {
    await frame.waitFor({ state: 'visible', timeout: 10_000 })
    await page.waitForTimeout(900)

    // The hash: the transforms and the widths set inline, plus the text.
    // Everything a demonstration can move goes through there.
    const hash = () =>
      frame.evaluate((node) =>
        [...node.querySelectorAll('*')]
          .map((child) => `${child.getAttribute('style') ?? ''}|${child.className}`)
          .join('~')
          .slice(0, 20_000),
      )

    const before = await hash()

    if (action === 'scroll') {
      // The overflow handled, and not merely a taller content: a box in
      // `overflow: hidden` containing an oversized image also answers the
      // second condition, and setting a `scrollTop` on it does nothing. It is
      // that trap which first made two previews look inert while they were
      // working.
      const scrolled = await frame.evaluate((node) => {
        const target = [node, ...node.querySelectorAll('*')].find((child) => {
          const style = getComputedStyle(child)
          return (
            /auto|scroll/.test(style.overflowY) && child.scrollHeight > child.clientHeight
          )
        })
        if (target === undefined) return false
        target.scrollTop = target.scrollHeight
        return target.scrollTop > 0
      })
      if (!scrolled) problem.push('no container of the frame scrolls')
      await page.waitForTimeout(900)
    } else if (action === 'pointer') {
      const box = await frame.boundingBox()
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3)
      await page.waitForTimeout(200)
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, {
        steps: 12,
      })
      await page.waitForTimeout(700)
    } else {
      await frame.getByRole('button', { name: 'La scene est prete' }).click()
      await page.waitForTimeout(900)
    }

    if ((await hash()) === before) {
      problem.push(`inert after ${action}: nothing moved in the frame`)
    }
  }

  if (errors.length > 0) problem.push(`console: ${errors.join(' | ')}`)

  if (problem.length > 0) {
    console.log(`! ${entry.id.padEnd(28)} ${problem.join(' ; ')}`)
    failures.push(`${entry.id}: ${problem.join(' ; ')}`)
  } else if (action !== undefined) {
    console.log(`  ${entry.id.padEnd(28)} reacts to ${action}`)
  }

  page.off('console', onConsole)
  page.off('pageerror', onError)
}

await browser.close()

console.log(
  `\n${String(withPreview)} entry(ies) out of ${String(catalogue.entries.length)} have a preview.`,
)

if (failures.length > 0) {
  console.error(`\n${String(failures.length)} problem(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
