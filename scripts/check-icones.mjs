/**
 * Verification du module d'icones, dans un vrai navigateur.
 *
 * ## Ce qui peut casser sans qu'on le voie
 *
 * Une icone est une donnee traduite en elements SVG. Trois facons d'echouer,
 * toutes silencieuses :
 *
 * 1. **Un attribut a tirets non traduit.** React attend `fillRule`, pas
 *    `fill-rule`, et ignore la forme incorrecte sans rien dire. Les traces a
 *    trous se remplissent alors entierement : un `o` devient un disque. Cela
 *    ne se voit qu'a l'oeil, ou en mesurant la surface peinte.
 *
 * 2. **Un mode inverse.** Un trace au trait rendu en mode plein devient une
 *    tache noire ; un glyphe plein rendu au trait devient invisible. Les deux
 *    passent toutes les verifications de type.
 *
 * 3. **La couleur qui ne suit pas le texte.** Un `fill` survivant a
 *    l'importation figerait l'icone en noir, ce qui ne se remarque qu'en
 *    theme sombre.
 *
 * Le controle ouvre donc chaque jeu, y cherche une icone choisie pour ce
 * qu'elle exerce, et lit dans le DOM ce qui a reellement ete pose : les
 * attributs de mode, ceux a tirets, et la couleur calculee.
 *
 * Usage :
 *
 *   node scripts/check-icones.mjs [url]
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

/** Une icone par jeu, choisie parce qu'elle a des trous ou des traits fins. */
const JEUX = [
  { module: 'filaire', cherche: 'circle-alert' },
  // Celle-ci declare `fill-rule` : c'est le seul jeu qui en emploie, et c'est
  // l'attribut que React ignore silencieusement s'il n'est pas traduit.
  { module: 'compact', cherche: 'align-end', regle: true },
  { module: 'classique', cherche: 'circle-info' },
  { module: 'etendu', cherche: 'home' },
  { module: 'marques', cherche: 'github' },
]

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const erreurs = []
page.on('console', (m) => {
  if (m.type() === 'error') erreurs.push(m.text())
})
page.on('pageerror', (e) => erreurs.push(String(e)))

const echecs = []

for (const { module, cherche, regle } of JEUX) {
  await page.goto(`${base}/docs/icones/${module}`, { waitUntil: 'networkidle' })

  const champ = page.getByRole('searchbox')
  await champ.waitFor({ state: 'visible', timeout: 20_000 })
  await champ.fill(cherche)

  const cases = page.locator('ul li button')
  await cases.first().waitFor({ state: 'visible', timeout: 10_000 })

  const mesure = await cases.first().evaluate((node) => {
    const svg = node.querySelector('svg')
    if (svg === null) return undefined

    return {
      nom: node.querySelector('span')?.textContent ?? '',
      noeuds: svg.children.length,
      boite: svg.getAttribute('viewBox'),
      fill: svg.getAttribute('fill'),
      stroke: svg.getAttribute('stroke'),
      // Les attributs a tirets non traduits n'atteignent jamais le DOM :
      // leur absence sur un trace qui en declare est le symptome.
      regles: svg.querySelectorAll('[fill-rule], [clip-rule]').length,
      // La couleur effective doit venir du texte, jamais d'un attribut.
      couleur: getComputedStyle(svg).color,
    }
  })

  const probleme = []
  if (mesure === undefined) probleme.push('aucun SVG rendu')
  else {
    if (mesure.noeuds === 0) probleme.push('SVG sans aucun noeud')
    if (mesure.boite === null) probleme.push('aucune boite')
    // Les deux attributs sont poses ensemble : le mode decide lequel porte la
    // couleur, et l'autre doit valoir `none` ou etre absent.
    const trait = mesure.stroke === 'currentColor'
    if (trait && mesure.fill !== 'none') probleme.push('trace au trait sans fill="none"')
    if (!trait && mesure.fill !== 'currentColor') probleme.push('glyphe plein sans fill')
    if (mesure.couleur === 'rgb(0, 0, 0)') {
      probleme.push('couleur noire : elle ne suit pas le texte')
    }
    if (regle === true && mesure.regles === 0) {
      probleme.push('fill-rule absent du DOM : la traduction en casse chameau est cassee')
    }
  }

  const verdict = probleme.length === 0 ? 'ok' : probleme.join(' ; ')
  console.log(
    `${probleme.length === 0 ? '  ' : '! '}${module.padEnd(10)} ${(mesure?.nom ?? '—').padEnd(16)} ${String(mesure?.noeuds ?? 0).padStart(2)} noeud(s)  ${verdict}`,
  )
  if (probleme.length > 0) echecs.push(`${module} : ${verdict}`)
}

// La page d'ensemble ne montre qu'une poignee d'icones, mais elle est la seule
// a en importer sans passer par une route paresseuse.
await page.goto(`${base}/docs/icones`, { waitUntil: 'networkidle' })
const teintes = await page.evaluate(() =>
  [...document.querySelectorAll('svg')]
    .map((svg) => getComputedStyle(svg).color)
    .filter((colour, index, all) => all.indexOf(colour) === index),
)
console.log(`\nvue d ensemble : ${String(teintes.length)} couleurs distinctes`)
if (teintes.length < 4) {
  echecs.push('vue d ensemble : les icones ne prennent pas la couleur du texte')
}

await browser.close()

if (erreurs.length > 0) echecs.push(`console : ${erreurs.join(' | ')}`)

if (echecs.length > 0) {
  console.error(`\n${String(echecs.length)} probleme(s) :`)
  for (const echec of echecs) console.error(`  - ${echec}`)
  process.exit(1)
}

console.log(`\n${String(JEUX.length)} jeu(x) verifie(s).`)
