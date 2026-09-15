/**
 * Checks that hot reloading preserves the state of the application.
 *
 * The only criterion that counts: after a file edit, the state of the page
 * must survive, and the new text must appear. If the page reloads, the state
 * starts from zero — a check that merely verified that the text had changed
 * would not see the difference.
 *
 * ## Why the probe does not touch the interface
 *
 * The previous version clicked on a "Compter" button of the template. It
 * stopped working the day that button disappeared from the home page, and
 * nobody saw it: the check is not in continuous integration.
 *
 * The probe is therefore placed on `window`, where nothing in the template can
 * take it away. It survives a module replacement and disappears on a document
 * reload — which is exactly the distinction to measure, and it will hold
 * whatever the page.
 *
 * Usage:
 *
 *   node scripts/hmr-check.mjs <project-root> [url]
 *
 * The development server must be running on that project.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? '.')
const base = (process.argv[3] ?? 'http://localhost:5180').replace(/\/$/, '')

// All the content of the page lives in `App.tsx`: it is the file to edit, and
// the only one present whatever was ticked at creation time.
const target = join(root, 'src', 'App.tsx')
const original = readFileSync(target, 'utf8')

/** Puts the file back in its initial state, whatever happens. */
function restore() {
  writeFileSync(target, original, 'utf8')
}

process.on('exit', restore)
process.on('SIGINT', () => process.exit(130))

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

/** Counts the documents requested again: a page reload produces one. */
let documentRequests = 0
page.on('request', (request) => {
  if (request.resourceType() === 'document') documentRequests += 1
})

await page.goto(base, { waitUntil: 'networkidle' })

// We install an observable state, outside the interface: a value set on
// `window`. A module replacement leaves it in place; a document reload starts
// from a fresh context and erases it.
const PROBE = 'odoro-sonde-hmr'
await page.evaluate((token) => {
  Object.assign(window, { [token]: 3 })
}, PROBE)

const stateBefore = await page.evaluate(
  (token) => String(Reflect.get(window, token) ?? ''),
  PROBE,
)
console.log(`state before edit : probe = ${stateBefore}`)

documentRequests = 0

// Real edit of the source file.
const edited = original.replace('already alive', 'hot swapped')
if (edited === original) {
  console.error('The text to replace cannot be found in the file.')
  await browser.close()
  process.exit(1)
}
writeFileSync(target, edited, 'utf8')

await page
  .getByRole('heading', { name: /remplace a chaud/ })
  .waitFor({ timeout: 8000 })
  .catch(() => undefined)

await page.waitForTimeout(400)

const heading = await page.locator('h1').first().textContent()
const stateAfter = await page.evaluate(
  (token) => String(Reflect.get(window, token) ?? ''),
  PROBE,
)

console.log(`heading after edit : ${JSON.stringify(heading)}`)
console.log(`state after edit   : probe = ${stateAfter}`)
console.log(`documents requested again : ${documentRequests}`)
for (const error of errors) console.log(`  error : ${error}`)

const applied = heading?.includes('remplace a chaud') === true
const preserved = stateAfter === stateBefore && stateBefore !== ''
const noReload = documentRequests === 0

console.log('')
console.log(`  change applied  : ${applied ? 'yes' : 'NO'}`)
console.log(`  state preserved : ${preserved ? 'yes' : 'NO'}`)
console.log(`  without reload  : ${noReload ? 'yes' : 'NO'}`)

// Second scenario: adding a hook to an already mounted component. It is the
// case that crashes without signatures — React would try to reuse a state
// whose hook order no longer matches. The correct behaviour is to remount the
// component, not to keep the state.
console.log('\nadding a hook to a mounted component')

const withHook = edited.replace(
  '  const [copied, setCopied] = useState(false)',
  [
    '  const [copied, setCopied] = useState(false)',
    '  const [added] = useState(7)',
    '  void added',
  ].join('\n'),
)

if (withHook === edited) {
  console.log('  pattern not found : scenario skipped')
} else {
  errors.length = 0
  writeFileSync(target, withHook, 'utf8')
  await page.waitForTimeout(2500)

  const stillRendering = (await page.locator('#root').innerHTML()).length > 100
  const hookCrash = errors.some((error) => /Rendered more hooks|hooks/i.test(error))

  console.log(`  page still rendered : ${stillRendering ? 'yes' : 'NO'}`)
  console.log(`  crash on the hook order : ${hookCrash ? 'YES' : 'no'}`)
  for (const error of errors) console.log(`  error : ${error}`)

  if (!stillRendering || hookCrash) {
    await browser.close()
    console.log(`\n[31mFailure on the signature change.[0m\n`)
    process.exit(1)
  }
}

await browser.close()

const ok = applied && preserved && noReload
console.log(
  ok ? '\n[32mHot reloading with state preservation.[0m\n' : '\n[31mFailure.[0m\n',
)
process.exit(ok ? 0 : 1)
