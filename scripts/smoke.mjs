/**
 * End-to-end check of a project served by the engine.
 *
 * The browser is the only exact oracle. A first version of this script
 * extracted the imports with a regular expression: it reported as missing the
 * exports quoted in code examples inside a documentation page. That is
 * precisely the defect the engine guards against in its own import rewriting —
 * a string of characters containing the word `import` is enough to defeat a
 * regex.
 *
 * So we no longer parse anything: we load the page, we observe what the
 * browser really requests, and we listen to what it refuses.
 *
 * Three passes:
 *
 * 1. **Network** — every unsatisfactory response, and every fallback module
 *    served in place of a real one.
 * 2. **Execution** — console errors, page errors, and the DOM actually
 *    produced. A blank page shows neither in an HTTP status, nor in a unit
 *    test.
 * 3. **Navigation** — a followed link must not reload the document, must
 *    trigger a page transition, and going back must return to the right place.
 *
 * Usage:
 *
 *   node scripts/smoke.mjs [url]
 *
 * The development server must be running at the given address.
 */

const base = (process.argv[2] ?? 'http://localhost:5180').replace(/\/$/, '')

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

/** Responses judged unsatisfactory. */
const network = []
/** Errors reported by the browser. */
const runtime = []
/** Modules actually loaded. */
let modules = 0

page.on('response', (response) => {
  const url = response.url()
  if (!url.startsWith(base)) return

  const status = response.status()
  if (status >= 400) {
    network.push(`${status} on ${new URL(url).pathname}`)
    return
  }

  const type = response.request().resourceType()
  if (type !== 'script' && type !== 'fetch' && type !== 'xhr') return

  modules += 1
  void response
    .text()
    .then((body) => {
      // The server answers with a `throw` module when it cannot resolve a
      // dependency: the browser only complains about it indirectly.
      if (body.startsWith('throw new Error')) {
        network.push(`fallback module served : ${new URL(url).pathname}`)
      }
    })
    .catch(() => undefined)
})

page.on('console', (message) => {
  if (message.type() === 'error') runtime.push(message.text())
})
page.on('pageerror', (error) => runtime.push(String(error)))

console.log(`\n[1/3] Network — ${base}`)

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

console.log(`  ${modules} modules loaded`)
for (const problem of [...new Set(network)]) console.log(`  ✗ ${problem}`)
if (network.length === 0) console.log('  ✓ every response is satisfactory')

console.log(`\n[2/3] Execution`)

const rendered = await page.locator('#root').innerHTML()
const heading = await page
  .locator('h1')
  .first()
  .textContent()
  .catch(() => null)

console.log(`  ${rendered.length} characters rendered in #root`)
console.log(`  first heading : ${JSON.stringify(heading?.slice(0, 60) ?? null)}`)
for (const error of [...new Set(runtime)]) console.log(`  ✗ ${error}`)
if (runtime.length === 0 && rendered.length > 100) {
  console.log('  ✓ the page renders without error')
}

console.log(`\n[3/3] Navigation and page transitions`)

const navigation = []

await page.addInitScript(() => {
  window.__odoroTransitions = 0
  const original = document.startViewTransition?.bind(document)
  if (original !== undefined) {
    document.startViewTransition = (callback) => {
      window.__odoroTransitions += 1
      return original(callback)
    }
  }
})

await page.goto(base, { waitUntil: 'networkidle' })

const links = page.locator('a[href^="/"]')
const linkCount = await links.count()

if (linkCount === 0) {
  navigation.push('no internal link to follow')
} else {
  const before = page.url()
  let documents = 0
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documents += 1
  })

  await links.nth(linkCount - 1).click()
  await page.waitForTimeout(700)

  const after = page.url()
  const transitions = await page.evaluate(() => window.__odoroTransitions)
  const supported = await page.evaluate(() => 'startViewTransition' in document)

  console.log(`  ${before} -> ${after}`)
  console.log(`  documents requested from the server : ${documents}`)
  console.log(
    `  transitions triggered : ${transitions}${supported ? '' : ' (API absent)'}`,
  )

  if (after === before) navigation.push('the navigation did not change the URL')
  if (documents > 0) navigation.push('the page was reloaded instead of being routed')
  if (supported && transitions === 0) navigation.push('no transition triggered')

  await page.goBack()
  await page.waitForTimeout(400)
  if (page.url().replace(/\/$/, '') !== before.replace(/\/$/, '')) {
    navigation.push(`going back led to ${page.url()}`)
  } else {
    console.log('  going back : correct')
  }
}

for (const problem of navigation) console.log(`  ✗ ${problem}`)
if (navigation.length === 0) console.log('  ✓ client navigation, without a reload')

await browser.close()

const ok =
  network.length === 0 &&
  runtime.length === 0 &&
  navigation.length === 0 &&
  rendered.length > 100

console.log(ok ? '\nAll green.\n' : '\nFailure.\n')
process.exit(ok ? 0 : 1)
