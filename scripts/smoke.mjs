/**
 * Verification de bout en bout d'un projet servi par le moteur.
 *
 * Deux passes, parce qu'un code 200 ne prouve rien :
 *
 * 1. **Parcours du graphe de modules** — suit chaque import a partir du
 *    document, et signale un module de secours servi a la place d'un vrai, ou
 *    un export nomme attendu mais absent. C'est ce qui attrape les ruptures de
 *    resolution et les frontieres CommonJS mal franchies, avant meme que le
 *    navigateur ne s'en mele.
 * 2. **Rendu dans un vrai navigateur** — charge la page et verifie qu'elle
 *    produit du DOM sans erreur de console. Une page blanche ne se voit ni
 *    dans un statut HTTP, ni dans un test unitaire.
 *
 * Usage :
 *
 *   node scripts/smoke.mjs [url]
 *
 * Le serveur de developpement doit tourner a l'adresse indiquee.
 */

const base = (process.argv[2] ?? 'http://localhost:5180').replace(/\/$/, '')

const seen = new Set()
const problems = []
let visited = 0

/** Extrait les specificateurs importes d'un module JavaScript. */
function importsOf(code) {
  const found = []
  const patterns = [
    /(?:^|[\s;}])import\s[^'"]*from\s*["']([^"']+)["']/g,
    /(?:^|[\s;}])import\s*["']([^"']+)["']/g,
    /(?:^|[\s;}])export\s[^'"]*from\s*["']([^"']+)["']/g,
  ]
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) found.push(match[1])
  }
  return found
}

/** Noms importes depuis un specificateur donne. */
function namedImportsOf(code, specifier) {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*["']${escaped}["']`).exec(
    code,
  )
  if (match === null) return []
  return match[1]
    .split(',')
    .map((part) =>
      part
        .trim()
        .split(/\s+as\s+/)[0]
        .trim(),
    )
    .filter(Boolean)
}

/** Verifie qu'un module declare bien un export donne. */
function declaresExport(code, name) {
  return (
    new RegExp(`\\bexport\\s+(?:const|let|var|function|class)\\s+${name}\\b`).test(
      code,
    ) ||
    new RegExp(`\\bexport\\s*\\{[^}]*\\b${name}\\b`).test(code) ||
    new RegExp(`\\bexport\\s+const\\s*\\{[^}]*\\b${name}\\b`).test(code) ||
    new RegExp(`\\bas\\s+${name}\\b`).test(code)
  )
}

const bodies = new Map()

/** Recupere un module une seule fois. */
async function fetchModule(url) {
  if (bodies.has(url)) return bodies.get(url)
  const response = await fetch(url)
  const body = response.ok ? await response.text() : null
  bodies.set(url, body)
  return body
}

async function visit(url, from) {
  if (seen.has(url)) return
  seen.add(url)

  const code = await fetchModule(url)
  if (code === null) {
    problems.push(`inaccessible : ${url}  (importe par ${from})`)
    return
  }

  visited += 1

  if (code.startsWith('throw new Error')) {
    problems.push(`module de secours servi : ${url}  (importe par ${from})`)
    return
  }

  for (const specifier of importsOf(code)) {
    if (/^https?:/.test(specifier) || specifier.startsWith('data:')) continue
    const target = new URL(specifier, url).href

    await visit(target, url)

    const names = namedImportsOf(code, specifier)
    if (names.length === 0) continue

    const body = await fetchModule(target)
    if (body === null) continue

    for (const name of names) {
      if (!declaresExport(body, name)) {
        problems.push(
          `export "${name}" absent de ${new URL(target).pathname}  (attendu par ${url})`,
        )
      }
    }
  }
}

console.log(`\n[1/3] Parcours du graphe de modules — ${base}`)

const html = await (await fetch(`${base}/`)).text()
const entries = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map(
  (match) => new URL(match[1], base).href,
)

if (entries.length === 0) {
  console.error('  Aucun script de type module dans le document.')
  process.exit(1)
}

for (const entry of entries) await visit(entry, 'index.html')

console.log(`  ${visited} modules parcourus`)
for (const problem of [...new Set(problems)]) console.log(`  ✗ ${problem}`)
if (problems.length === 0) console.log('  ✓ graphe complet et coherent')

console.log(`\n[2/3] Rendu dans un navigateur`)

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

const consoleErrors = []
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('pageerror', (error) => consoleErrors.push(String(error)))

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

const rendered = await page.locator('#root').innerHTML()
const heading = await page
  .locator('h1')
  .first()
  .textContent()
  .catch(() => null)

console.log(`  ${rendered.length} caracteres rendus dans #root`)
console.log(`  premier titre : ${JSON.stringify(heading)}`)
for (const error of consoleErrors) console.log(`  ✗ console : ${error}`)

console.log(`
[3/3] Navigation et transitions de page`)

const navigation = []

// La transition est instrumentee avant tout script de la page : on remplace
// l'API par une doublure qui compte les appels et delegue a l'originale.
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
  let requests = 0
  page.on('request', (request) => {
    if (request.resourceType() === 'document') requests += 1
  })

  await links.nth(linkCount - 1).click()
  await page.waitForTimeout(600)

  const after = page.url()
  const transitions = await page.evaluate(() => window.__odoroTransitions)
  const supported = await page.evaluate(() => 'startViewTransition' in document)

  console.log(`  ${before} -> ${after}`)
  console.log(`  documents redemandes au serveur : ${requests}`)
  console.log(
    `  transitions declenchees : ${transitions}${supported ? '' : ' (API absente du navigateur)'}`,
  )

  if (after === before) navigation.push('la navigation n a pas change l URL')
  if (requests > 0) navigation.push('la page a ete rechargee au lieu d etre routee')
  if (supported && transitions === 0) {
    navigation.push('aucune transition de page declenchee')
  }

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
  problems.length === 0 &&
  consoleErrors.length === 0 &&
  navigation.length === 0 &&
  rendered.length > 100
console.log(
  ok ? '\n\u001b[32mTout est vert.\u001b[0m\n' : '\n\u001b[31mEchec.\u001b[0m\n',
)
process.exit(ok ? 0 : 1)
