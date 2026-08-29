/**
 * Verification des pages du moteur et du registre, dans un vrai navigateur.
 *
 * Ce qui est verifie n'est pas « la page repond 200 » — elle repondrait 200 en
 * etant blanche. On regarde ce que le navigateur produit reellement : du
 * texte, un compteur d'images qui avance, et des pixels differents les uns des
 * autres dans le canevas WebGL.
 *
 * Ce script a deja gagne sa place : il a signale que la page des surfaces en
 * affichait deux alors que l'arbitre n'en accorde qu'une par backend. La
 * seconde etait refusee et montrait son repli — une page qui contredisait ce
 * qu'elle expliquait, invisible a la compilation comme au test unitaire.
 *
 * Usage :
 *
 *   node scripts/check-moteur.mjs [url]
 *
 * Le serveur de developpement du playground doit tourner a cette adresse.
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const { chromium } = await import('playwright')
const browser = await chromium.launch()

const PAGES = [
  '/docs/moteur',
  '/docs/moteur/boucle',
  '/docs/moteur/mouvement',
  '/docs/moteur/webgl',
  '/docs/moteur/diagnostic',
  '/docs/registre',
  '/docs/registre/cli',
  '/docs/registre/contrat',
  '/docs/registre/galerie',
  '/docs/backgrounds',
  '/docs/text',
  '/docs/motion/librairie',
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
    failures.push(`${path} : contenu quasi vide (${text.length} caracteres)`)
  }
  for (const error of errors) failures.push(`${path} : ${error}`)

  // Le compteur d'images doit avancer : une valeur figee signale une boucle
  // qui ne distribue rien.
  if (path === '/docs/moteur/boucle') {
    const read = () =>
      page.evaluate(() => {
        const nodes = [...document.querySelectorAll('span.o-tabular-nums')]
        return nodes.map((node) => node.textContent?.trim() ?? '')
      })
    const first = await read()
    await page.waitForTimeout(600)
    const second = await read()
    if (JSON.stringify(first) === JSON.stringify(second)) {
      failures.push(`${path} : le compteur d images n avance pas (${first.join(', ')})`)
    }
  }

  // Le canevas doit peindre autre chose qu'un aplat.
  if (path === '/docs/moteur/webgl') {
    const canvases = await page.evaluate(() => {
      return [...document.querySelectorAll('canvas')].map((canvas) => ({
        width: canvas.width,
        height: canvas.height,
      }))
    })
    // Une seule surface : l'arbitre n'accorde qu'un contexte par backend.
    if (canvases.length !== 1) {
      failures.push(`${path} : ${canvases.length} canevas au lieu de 1`)
    }
    for (const [index, canvas] of canvases.entries()) {
      if (canvas.width < 10 || canvas.height < 10) {
        failures.push(
          `${path} : canevas ${index} de taille ${canvas.width}x${canvas.height}`,
        )
      }
    }

    const shot = await page.locator('canvas').first().screenshot()
    const unique = new Set()
    for (let offset = 0; offset < shot.length; offset += 97) unique.add(shot[offset])
    if (unique.size < 8) {
      failures.push(`${path} : le canevas semble uniforme (${unique.size} valeurs)`)
    }
  }

  // La page du contrat rend un composant installe par la CLI, importe par
  // l'alias du projet : si la chaine casse quelque part, elle est vide.
  if (path === '/docs/registre/contrat') {
    const bars = await page.evaluate(
      () => document.querySelectorAll('[role="progressbar"]').length,
    )
    if (bars !== 2) {
      failures.push(`${path} : ${bars} barres de progression au lieu de 2`)
    }
  }

  await page.close()
}

await browser.close()

if (failures.length > 0) {
  console.error(`\nEchec — ${failures.length} probleme(s) :\n`)
  for (const failure of failures) console.error(`  · ${failure}`)
  console.error('')
  process.exitCode = 1
} else {
  console.log(`\n${PAGES.length} pages verifiees, rien a signaler.\n`)
}
