/**
 * Verification des fonds animes, un par un, dans un vrai navigateur.
 *
 * ## Pourquoi ce script existe separement
 *
 * Un shader n'est qu'une chaine de caracteres pour TypeScript : il compile
 * sans broncher, puis echoue a l'execution. `check-galerie` en couvrait cinq ;
 * il y en a maintenant plus de vingt, et chacun a sa propre facon de rater —
 * un mot reserve du langage, une boucle a bornes non constantes, une division
 * par zero qui ne se voit qu'au centre exact du cadre.
 *
 * ## Les trois questions posees a chaque fond
 *
 * 1. **Le shader a-t-il compile ?** La surface n'echoue pas bruyamment : le
 *    backend signale l'erreur en console et rend une surface noire. On ecoute
 *    donc les avertissements autant que les erreurs.
 *
 * 2. **Quelque chose a-t-il ete peint ?** Un shader qui compile peut tout de
 *    meme rendre du noir uniforme — un uniforme absent, une couleur lue trop
 *    tot. La capture porte sur la surface elle-meme, jamais sur le cadre : le
 *    contenu de demonstration donnerait du poids a une image vide. Une image
 *    plate se compresse a quelques centaines d'octets, un motif ne le peut
 *    pas.
 *
 * 3. **Cela bouge-t-il ?** Deux captures espacees d'une demi-seconde doivent
 *    differer. Un fond fige passe les deux premieres questions et rate la
 *    seule qui compte pour un fond anime.
 *
 * Usage :
 *
 *   node scripts/check-fonds.mjs [url]
 */

import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const catalogue = JSON.parse(
  readFileSync('packages/odoro-bits/dist/registry/index.json', 'utf8'),
)
// Un fond sans backend n'a pas de surface a verifier : `grid-lines` est deux
// degrades repetes, et c'est precisement ce qui fait son interet.
const fonds = catalogue.entries
  .filter((entry) => entry.category === 'background' && entry.backend !== false)
  .map((entry) => entry.name)

/** En dessous, la capture est une aplat : rien n'a ete peint. */
const POIDS_MINIMAL = 3000

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const echecs = []

for (const nom of fonds) {
  const erreurs = []
  const onConsole = (message) => {
    // Un shader qui ne compile pas ressort en avertissement, pas en erreur :
    // le backend le signale et continue de rendre du noir.
    if (message.type() !== 'error' && message.type() !== 'warning') return

    const texte = message.text()
    // Les captures lisent la surface, ce que le pilote signale comme un arret
    // de pipeline. C'est le prix du controle, pas un defaut du shader.
    if (texte.includes('GL Driver Message')) return

    erreurs.push(texte)
  }
  const onError = (cause) => erreurs.push(String(cause))
  page.on('console', onConsole)
  page.on('pageerror', onError)

  await page.goto(`${base}/docs/backgrounds/${nom}`, { waitUntil: 'networkidle' })

  const cadre = page.locator('[data-o-atelier-frame]').first()
  await cadre.waitFor({ state: 'visible', timeout: 10_000 })
  // Le backend est charge a la demande : la premiere image arrive apres.
  await page.waitForTimeout(1200)

  const etat = await cadre.evaluate((node) => {
    const canvas = node.querySelector('canvas')
    return canvas === null ? null : { w: canvas.width, h: canvas.height }
  })

  // La capture porte sur la surface, pas sur le cadre : le contenu de
  // demonstration donnerait du poids a une image entierement noire.
  const surface = cadre.locator('canvas').first()
  const monte = etat !== null && etat.w > 1 && etat.h > 1
  const premiere = monte ? await surface.screenshot() : Buffer.alloc(0)
  await page.waitForTimeout(600)
  const seconde = monte ? await surface.screenshot() : Buffer.alloc(0)

  const probleme = []
  if (erreurs.length > 0) probleme.push(`console : ${erreurs.join(' | ')}`)
  if (!monte) probleme.push('aucune surface montee')
  else {
    if (premiere.length < POIDS_MINIMAL) {
      probleme.push(
        `capture plate (${String(premiere.length)} octets) : rien n a ete peint`,
      )
    }
    if (premiere.equals(seconde))
      probleme.push('deux captures identiques : rien ne bouge')
  }

  const verdict = probleme.length === 0 ? 'ok' : probleme.join(' ; ')
  console.log(
    `${probleme.length === 0 ? '  ' : '! '}${nom.padEnd(14)} ${String(premiere.length).padStart(7)} o  ${verdict}`,
  )
  if (probleme.length > 0) echecs.push(`${nom} : ${verdict}`)

  page.off('console', onConsole)
  page.off('pageerror', onError)
}

await browser.close()

if (echecs.length > 0) {
  console.error(`\n${String(echecs.length)} fond(s) en echec :`)
  for (const echec of echecs) console.error(`  - ${echec}`)
  process.exit(1)
}

console.log(`\n${String(fonds.length)} fond(s) verifie(s).`)
