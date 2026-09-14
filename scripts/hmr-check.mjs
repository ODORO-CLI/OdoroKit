/**
 * Verifie que le rechargement a chaud preserve l'etat de l'application.
 *
 * Le seul critere qui compte : apres une edition de fichier, l'etat de la page
 * doit survivre, et le nouveau texte doit apparaitre. Si la page se recharge,
 * l'etat repart de zero — un controle qui se contenterait de verifier que le
 * texte a change ne verrait pas la difference.
 *
 * ## Pourquoi la sonde ne touche pas a l'interface
 *
 * La version precedente cliquait sur un bouton « Compter » du gabarit. Elle a
 * cesse de fonctionner le jour ou ce bouton a disparu de la page d'accueil, et
 * personne ne l'a vu : le controle n'est pas dans l'integration continue.
 *
 * La sonde est donc posee sur `window`, ou rien du gabarit ne peut la lui
 * retirer. Elle survit a un remplacement de module et disparait a un
 * rechargement de document — c'est exactement la distinction a mesurer, et elle
 * tiendra quelle que soit la page.
 *
 * Usage :
 *
 *   node scripts/hmr-check.mjs <racine-du-projet> [url]
 *
 * Le serveur de developpement doit tourner sur ce projet.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? '.')
const base = (process.argv[3] ?? 'http://localhost:5180').replace(/\/$/, '')

// Tout le contenu de la page vit dans `App.tsx` : c'est le fichier a editer,
// et le seul present quel que soit ce qui a ete coche a la creation.
const target = join(root, 'src', 'App.tsx')
const original = readFileSync(target, 'utf8')

/** Remet le fichier dans son etat initial, quoi qu'il arrive. */
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

/** Compte les documents redemandes : un rechargement de page en produit un. */
let documentRequests = 0
page.on('request', (request) => {
  if (request.resourceType() === 'document') documentRequests += 1
})

await page.goto(base, { waitUntil: 'networkidle' })

// On installe un etat observable, hors de l'interface : une valeur posee sur
// `window`. Un remplacement de module la laisse en place ; un rechargement de
// document repart d'un contexte neuf et l'efface.
const JETON = 'odoro-sonde-hmr'
await page.evaluate((jeton) => {
  Object.assign(window, { [jeton]: 3 })
}, JETON)

const stateBefore = await page.evaluate(
  (jeton) => String(Reflect.get(window, jeton) ?? ''),
  JETON,
)
console.log(`etat avant edition : sonde = ${stateBefore}`)

documentRequests = 0

// Edition reelle du fichier source.
const edited = original.replace('deja vivante', 'remplace a chaud')
if (edited === original) {
  console.error('Le texte a remplacer est introuvable dans le fichier.')
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
  (jeton) => String(Reflect.get(window, jeton) ?? ''),
  JETON,
)

console.log(`titre apres edition : ${JSON.stringify(heading)}`)
console.log(`etat apres edition  : sonde = ${stateAfter}`)
console.log(`documents redemandes : ${documentRequests}`)
for (const error of errors) console.log(`  erreur : ${error}`)

const applied = heading?.includes('remplace a chaud') === true
const preserved = stateAfter === stateBefore && stateBefore !== ''
const noReload = documentRequests === 0

console.log('')
console.log(`  modification appliquee : ${applied ? 'oui' : 'NON'}`)
console.log(`  etat preserve          : ${preserved ? 'oui' : 'NON'}`)
console.log(`  sans rechargement      : ${noReload ? 'oui' : 'NON'}`)

// Second scenario : ajouter un hook a un composant deja monte. C'est le cas
// qui plante sans signatures — React tenterait de reutiliser un etat dont
// l'ordre des hooks ne correspond plus. Le comportement correct est de
// remonter le composant, pas de conserver l'etat.
console.log('\najout d un hook a un composant monte')

const withHook = edited.replace(
  '  const [copie, setCopie] = useState(false)',
  [
    '  const [copie, setCopie] = useState(false)',
    '  const [ajoute] = useState(7)',
    '  void ajoute',
  ].join('\n'),
)

if (withHook === edited) {
  console.log('  motif introuvable : scenario ignore')
} else {
  errors.length = 0
  writeFileSync(target, withHook, 'utf8')
  await page.waitForTimeout(2500)

  const stillRendering = (await page.locator('#root').innerHTML()).length > 100
  const hookCrash = errors.some((error) => /Rendered more hooks|hooks/i.test(error))

  console.log(`  page toujours rendue : ${stillRendering ? 'oui' : 'NON'}`)
  console.log(`  plantage sur l ordre des hooks : ${hookCrash ? 'OUI' : 'non'}`)
  for (const error of errors) console.log(`  erreur : ${error}`)

  if (!stillRendering || hookCrash) {
    await browser.close()
    console.log(`\n\u001b[31mEchec sur le changement de signature.\u001b[0m\n`)
    process.exit(1)
  }
}

await browser.close()

const ok = applied && preserved && noReload
console.log(
  ok
    ? '\n\u001b[32mRechargement a chaud avec preservation de l etat.\u001b[0m\n'
    : '\n\u001b[31mEchec.\u001b[0m\n',
)
process.exit(ok ? 0 : 1)
