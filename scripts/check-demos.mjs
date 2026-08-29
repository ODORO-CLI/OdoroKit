/**
 * Verification des demonstrations vivantes, entree par entree.
 *
 * ## Ce que ce controle repond
 *
 * Deux questions, dans cet ordre.
 *
 * **Chaque entree publiee a-t-elle un apercu ?** La page d'une entree sans
 * demonstration affiche un encart qui le dit. Il est honnete, et il ne doit
 * plus y en avoir : c'est la premiere assertion.
 *
 * **L'apercu fait-il quelque chose ?** Un cadre qui contient un composant
 * mais reste inerte passe toutes les verifications de type. On agit donc sur
 * chacun — defiler, deplacer le pointeur, cliquer — et on regarde ce qui a
 * bouge dans le document.
 *
 * Les quatre composants de defilement sont les plus exposes : ils mesurent
 * contre un conteneur, et le conteneur par defaut est la fenetre. Poses dans
 * un cadre qui defile, ils n'echouent pas — il ne se passe simplement rien.
 *
 * Usage :
 *
 *   node scripts/check-demos.mjs [url]
 */

import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const catalogue = JSON.parse(
  readFileSync('packages/odoro-bits/dist/registry/index.json', 'utf8'),
)

/** Segment d'URL de chaque categorie. */
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
 * Ce qu'on fait a un apercu, et ce qui doit avoir change ensuite.
 *
 * Une entree absente de cette table n'est verifiee que pour la presence de son
 * apercu : c'est deja ce que les autres controles couvrent pour les fonds, les
 * effets de texte et les images.
 */
const ACTIONS = {
  'effect/parallax': 'defilement',
  'effect/scroll-progress': 'defilement',
  'section/sticky-stack': 'defilement',
  'section/scroll-steps': 'defilement',
  'hooks/use-pointer-damped': 'pointeur',
  'hooks/use-poster': 'boutons',
}

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const echecs = []
let avecApercu = 0

for (const entry of catalogue.entries) {
  const segment = SEGMENTS[entry.category]
  if (segment === undefined) continue

  const erreurs = []
  const onConsole = (m) => {
    if (m.type() === 'error') erreurs.push(m.text().slice(0, 160))
  }
  const onError = (e) => erreurs.push(String(e).slice(0, 200))
  page.on('console', onConsole)
  page.on('pageerror', onError)

  await page.goto(`${base}/${segment === '' ? '' : `docs/${segment}`}/${entry.name}`, {
    waitUntil: 'networkidle',
  })

  const probleme = []

  // L'encart d'absence est le signal le plus direct : la page le dit elle-meme.
  const sansApercu = await page
    .getByText('n a pas encore de demonstration vivante')
    .count()
  if (sansApercu > 0) probleme.push('aucune demonstration vivante')
  else avecApercu += 1

  const cadre = page.locator('[data-o-atelier-frame]').first()
  const action = ACTIONS[entry.id]

  if (probleme.length === 0 && action !== undefined) {
    await cadre.waitFor({ state: 'visible', timeout: 10_000 })
    await page.waitForTimeout(900)

    // L'empreinte : les transformations et les largeurs posees en ligne, plus
    // le texte. Tout ce qu'une demonstration peut faire bouger passe par la.
    const empreinte = () =>
      cadre.evaluate((node) =>
        [...node.querySelectorAll('*')]
          .map((child) => `${child.getAttribute('style') ?? ''}|${child.className}`)
          .join('~')
          .slice(0, 20_000),
      )

    const avant = await empreinte()

    if (action === 'defilement') {
      // Le debordement traite, et pas seulement un contenu plus haut : une
      // boite en `overflow: hidden` contenant une image trop grande repond
      // aussi a la seconde condition, et lui poser un `scrollTop` ne fait
      // rien. C'est ce piege qui a d'abord fait passer deux apercus pour
      // inertes alors qu'ils fonctionnaient.
      const defile = await cadre.evaluate((node) => {
        const cible = [node, ...node.querySelectorAll('*')].find((child) => {
          const style = getComputedStyle(child)
          return (
            /auto|scroll/.test(style.overflowY) && child.scrollHeight > child.clientHeight
          )
        })
        if (cible === undefined) return false
        cible.scrollTop = cible.scrollHeight
        return cible.scrollTop > 0
      })
      if (!defile) probleme.push('aucun conteneur du cadre ne defile')
      await page.waitForTimeout(900)
    } else if (action === 'pointeur') {
      const box = await cadre.boundingBox()
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3)
      await page.waitForTimeout(200)
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, {
        steps: 12,
      })
      await page.waitForTimeout(700)
    } else {
      await cadre.getByRole('button', { name: 'La scene est prete' }).click()
      await page.waitForTimeout(900)
    }

    if ((await empreinte()) === avant) {
      probleme.push(`inerte apres ${action} : rien n a bouge dans le cadre`)
    }
  }

  if (erreurs.length > 0) probleme.push(`console : ${erreurs.join(' | ')}`)

  if (probleme.length > 0) {
    console.log(`! ${entry.id.padEnd(28)} ${probleme.join(' ; ')}`)
    echecs.push(`${entry.id} : ${probleme.join(' ; ')}`)
  } else if (action !== undefined) {
    console.log(`  ${entry.id.padEnd(28)} reagit au ${action}`)
  }

  page.off('console', onConsole)
  page.off('pageerror', onError)
}

await browser.close()

console.log(
  `\n${String(avecApercu)} entree(s) sur ${String(catalogue.entries.length)} ont un apercu.`,
)

if (echecs.length > 0) {
  console.error(`\n${String(echecs.length)} probleme(s) :`)
  for (const echec of echecs) console.error(`  - ${echec}`)
  process.exit(1)
}
