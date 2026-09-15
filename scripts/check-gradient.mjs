/**
 * Checks that a gradient is actually painted.
 *
 * A gradient whose colour stops do not exist produces a background image that
 * is syntactically valid but entirely transparent: the direction class
 * applies, the colours are missing, and nothing reports it. Neither an HTTP
 * status, nor a console error, nor an assertion on the DOM catches it — only
 * the computed value reveals it.
 *
 * Usage:
 *
 *   node scripts/check-gradient.mjs <url>
 */

const url = process.argv[2] ?? 'http://localhost:5190/docs/styles/degrades'

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

const findings = await page.evaluate(() => {
  const results = []

  for (const element of document.querySelectorAll('[class*="o-bg-gradient"]')) {
    const style = getComputedStyle(element)
    const image = style.backgroundImage

    // Every colour notation counts: the browser gives the values back in the
    // original space, often `oklch`.
    const stops = [
      ...image.matchAll(/(?:rgba?|oklch|oklab|hsla?|lab|lch|color)\([^)]*\)/g),
    ].map((match) => match[0])
    // A missing stop leaves the colour entirely transparent.
    const transparent = stops.filter((stop) => /[,/]\s*0\s*\)$/.test(stop))

    results.push({
      classes: element.className,
      image: image.slice(0, 120),
      stops: stops.length,
      transparent: transparent.length,
    })
  }

  return results
})

const gradients = findings.filter((entry) => entry.image !== 'none')

console.log(`\n${gradients.length} element(s) with a gradient on ${url}\n`)

let broken = 0
for (const entry of gradients) {
  const ok = entry.stops > 1 && entry.transparent < entry.stops
  if (!ok) broken += 1
  console.log(`  ${ok ? '✓' : '✗'} ${entry.classes.slice(0, 70)}`)
  console.log(`      ${entry.stops} stops, of which ${entry.transparent} transparent`)
  if (!ok) console.log(`      ${entry.image}`)
}

if (gradients.length === 0) {
  console.log('  No gradient found on this page.')
}

await browser.close()

console.log(
  broken === 0 && gradients.length > 0 ? '\nGradients painted.\n' : '\nFailure.\n',
)
process.exit(broken === 0 && gradients.length > 0 ? 0 : 1)
