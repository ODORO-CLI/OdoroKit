/**
 * Verification de bout en bout d'un projet servi par le moteur.
 *
 * Le navigateur est le seul oracle exact. Une premiere version de ce script
 * extrayait les imports par expression reguliere : elle signalait comme
 * manquants les exports cites dans des exemples de code au sein d'une page de
 * documentation. C'est precisement le defaut contre lequel le moteur se
 * premunit dans sa propre reecriture d'imports — une chaine de caracteres
 * contenant le mot `import` suffit a mettre une regex en defaut.
 *
 * On ne parse donc plus rien : on charge la page, on observe ce que le
 * navigateur demande reellement, et on ecoute ce qu'il refuse.
 *
 * Trois passes :
 *
 * 1. **Reseau** — toute reponse insatisfaisante, et tout module de secours
 *    servi a la place d'un vrai.
 * 2. **Execution** — erreurs de console, erreurs de page, et DOM effectivement
 *    produit. Une page blanche ne se voit ni dans un statut HTTP, ni dans un
 *    test unitaire.
 * 3. **Navigation** — un lien suivi ne doit pas recharger le document, doit
 *    declencher une transition de page, et le retour arriere doit revenir au
 *    bon endroit.
 *
 * Usage :
 *
 *   node scripts/smoke.mjs [url]
 *
 * Le serveur de developpement doit tourner a l'adresse indiquee.
 */

const base = (process.argv[2] ?? 'http://localhost:5180').replace(/\/$/, '')

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

/** Reponses jugees insatisfaisantes. */
const network = []
/** Erreurs remontees par le navigateur. */
const runtime = []
/** Modules effectivement charges. */
let modules = 0

page.on('response', (response) => {
  const url = response.url()
  if (!url.startsWith(base)) return

  const status = response.status()
  if (status >= 400) {
    network.push(`${status} sur ${new URL(url).pathname}`)
    return
  }

  const type = response.request().resourceType()
  if (type !== 'script' && type !== 'fetch' && type !== 'xhr') return

  modules += 1
  void response
    .text()
    .then((body) => {
      // Le serveur repond par un module `throw` quand il ne sait pas resoudre
      // une dependance : le navigateur ne s'en plaint qu'indirectement.
      if (body.startsWith('throw new Error')) {
        network.push(`module de secours servi : ${new URL(url).pathname}`)
      }
    })
    .catch(() => undefined)
})

page.on('console', (message) => {
  if (message.type() === 'error') runtime.push(message.text())
})
page.on('pageerror', (error) => runtime.push(String(error)))

console.log(`\n[1/3] Reseau — ${base}`)

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

console.log(`  ${modules} modules charges`)
for (const problem of [...new Set(network)]) console.log(`  ✗ ${problem}`)
if (network.length === 0) console.log('  ✓ toutes les reponses sont satisfaisantes')

console.log(`\n[2/3] Execution`)

const rendered = await page.locator('#root').innerHTML()
const heading = await page
  .locator('h1')
  .first()
  .textContent()
  .catch(() => null)

console.log(`  ${rendered.length} caracteres rendus dans #root`)
console.log(`  premier titre : ${JSON.stringify(heading?.slice(0, 60) ?? null)}`)
for (const error of [...new Set(runtime)]) console.log(`  ✗ ${error}`)
if (runtime.length === 0 && rendered.length > 100) {
  console.log('  ✓ la page rend sans erreur')
}

console.log(`\n[3/3] Navigation et transitions de page`)

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
  navigation.push('aucun lien interne a suivre')
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
  console.log(`  documents redemandes au serveur : ${documents}`)
  console.log(
    `  transitions declenchees : ${transitions}${supported ? '' : ' (API absente)'}`,
  )

  if (after === before) navigation.push('la navigation n a pas change l URL')
  if (documents > 0) navigation.push('la page a ete rechargee au lieu d etre routee')
  if (supported && transitions === 0) navigation.push('aucune transition declenchee')

  await page.goBack()
  await page.waitForTimeout(400)
  if (page.url().replace(/\/$/, '') !== before.replace(/\/$/, '')) {
    navigation.push(`le retour arriere a mene a ${page.url()}`)
  } else {
    console.log('  retour arriere : correct')
  }
}

for (const problem of navigation) console.log(`  ✗ ${problem}`)
if (navigation.length === 0) console.log('  ✓ navigation client, sans rechargement')

await browser.close()

const ok =
  network.length === 0 &&
  runtime.length === 0 &&
  navigation.length === 0 &&
  rendered.length > 100

console.log(ok ? '\nTout est vert.\n' : '\nEchec.\n')
process.exit(ok ? 0 : 1)
