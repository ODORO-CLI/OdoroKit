/**
 * Verifie que les composants interactifs tiennent au clavier seul.
 *
 * ## Pourquoi ce controle est separe
 *
 * Un composant peut etre parfaitement rendu et rester inutilisable : une liste
 * deroulante qui ne s'ouvre qu'au clic, un comparateur que les fleches ne
 * deplacent pas. Rien de tout cela n'apparait dans un test de rendu, ni dans
 * une capture d'ecran, ni a la compilation. Il faut appuyer sur les touches.
 *
 * Trois choses y sont verifiees : le motif combobox du SelectMenu, le curseur
 * de comparaison, et le fait que la boucle du moteur ecrit reellement dans le
 * filtre de deformation — un filtre pose mais immobile aurait l'air correct
 * sur une capture.
 *
 * Usage :
 *
 *   node scripts/check-interaction.mjs [url]
 *
 * Le serveur de developpement du playground doit tourner a cette adresse.
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const fails = []

// --- SelectMenu : le motif combobox doit tenir au clavier seul.
const page = await browser.newPage()
page.on('pageerror', (e) => fails.push('select : ' + String(e)))
await page.goto(`${base}/docs/composants/select-menu`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const combo = page.getByRole('combobox').first()
await combo.focus()
await page.keyboard.press('ArrowDown')
await page.waitForTimeout(200)
const opened = await page.evaluate(() => {
  const c = document.querySelector('[role="combobox"]')
  return {
    expanded: c?.getAttribute('aria-expanded'),
    activedescendant: c?.getAttribute('aria-activedescendant') !== null,
    // La page porte d'autres listes — la recherche de la documentation en
    // est une : on ne compte que celle que le combobox designe.
    listbox: document.getElementById(c?.getAttribute('aria-controls') ?? '') !== null,
    options:
      document
        .getElementById(c?.getAttribute('aria-controls') ?? '')
        ?.querySelectorAll('[role="option"]').length ?? 0,
  }
})
console.log('selectmenu ouvert :', JSON.stringify(opened))
if (opened.expanded !== 'true') fails.push('select : ne s ouvre pas a la fleche')
if (!opened.listbox) fails.push('select : aria-controls ne designe aucune liste')
if (opened.options < 4) fails.push(`select : ${opened.options} options`)

await page.keyboard.press('ArrowDown')
await page.keyboard.press('Enter')
await page.waitForTimeout(200)
const closed = await page.evaluate(() => ({
  expanded: document.querySelector('[role="combobox"]')?.getAttribute('aria-expanded'),
  hidden: document.querySelector('input[type="hidden"]')?.getAttribute('value'),
}))
console.log('apres Entree :', JSON.stringify(closed))
if (closed.expanded !== 'false') fails.push('select : reste ouvert apres Entree')
if (!closed.hidden) fails.push('select : la valeur cachee est vide')
await page.close()

// --- Images : filtre pose, comparaison au clavier.
const img = await browser.newPage()
img.on('pageerror', (e) => fails.push('images : ' + String(e)))
await img.goto(`${base}/docs/images`, { waitUntil: 'networkidle' })
await img.waitForTimeout(1500)

const state = await img.evaluate(() => {
  // La valeur serialisee porte des guillemets : `url("#id")`.
  const deformed = [...document.querySelectorAll('div')].filter((d) =>
    d.style.filter.startsWith('url('),
  ).length
  const scales = [...document.querySelectorAll('feDisplacementMap')].map((n) =>
    Number(n.getAttribute('scale')),
  )
  const offsets = [...document.querySelectorAll('feOffset')].map((n) =>
    n.getAttribute('dx'),
  )
  const slider = document.querySelector('[role="slider"]')
  return {
    filtres: deformed,
    turbulences: document.querySelectorAll('feTurbulence').length,
    slider: slider !== null,
    valeur: slider?.getAttribute('aria-valuenow'),
    scales,
    offsets,
  }
})
console.log('images :', JSON.stringify(state))
if (state.filtres < 2) fails.push(`images : ${state.filtres} elements deformes`)
if (state.turbulences < 2) fails.push('images : filtres SVG absents')
if (!state.scales.some((v) => v > 0))
  fails.push('images : deplacement nul, le filtre ne deforme rien')

// Le champ doit deriver : c'est la boucle qui ecrit `dx`.
await img.waitForTimeout(700)
const apres = await img.evaluate(() =>
  [...document.querySelectorAll('feOffset')].map((n) => n.getAttribute('dx')),
)
if (JSON.stringify(apres) === JSON.stringify(state.offsets)) {
  fails.push('images : le champ ne derive pas, la boucle n ecrit rien')
}
console.log('derive du champ :', state.offsets.join(','), '->', apres.join(','))
if (!state.slider) fails.push('images : pas de curseur de comparaison')

await img.locator('[role="slider"]').first().focus()
await img.keyboard.press('ArrowRight')
await img.waitForTimeout(150)
const moved = await img.evaluate(() =>
  document.querySelector('[role="slider"]')?.getAttribute('aria-valuenow'),
)
console.log('comparaison apres fleche :', state.valeur, '->', moved)
if (moved === state.valeur) fails.push('images : le curseur ne bouge pas au clavier')

await browser.close()
if (fails.length > 0) {
  console.error('\nEchec :')
  for (const f of fails) console.error('  · ' + f)
  process.exitCode = 1
} else console.log('\nLot 4 : rien a signaler.')
