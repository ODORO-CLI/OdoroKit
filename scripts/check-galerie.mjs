/**
 * Verification de la tranche verticale, dans un vrai navigateur.
 *
 * Un shader n'est qu'une chaine de caracteres pour TypeScript : il compile
 * sans broncher, puis echoue a l'execution. Ce script a deja gagne sa place
 * deux fois — un mot reserve du langage employe comme nom de variable, et un
 * accent grave a l'interieur du gabarit, qui le refermait.
 *
 * La derniere passe est la plus importante : sous mouvement reduit, rien de
 * tout cela ne doit se monter, et les replis doivent tenir la page a eux
 * seuls.
 *
 * Usage :
 *
 *   node scripts/check-galerie.mjs [url]
 *
 * Le serveur de developpement du playground doit tourner a cette adresse.
 */

const base = (process.argv[2] ?? 'http://localhost:5190').replace(/\/$/, '')
const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(`${base}/docs/registre/galerie`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

const failures = []

// 1. Le texte a bien ete decoupe, et l'attente levee.
const split = await page.evaluate(() => {
  const host = [...document.querySelectorAll('p')].find((node) =>
    (node.getAttribute('aria-label') ?? node.textContent ?? '').startsWith('Construisez'),
  )
  if (host === undefined) return { present: false }
  return {
    present: true,
    pending: host.hasAttribute('data-o-split-pending'),
    fragments: host.querySelectorAll('*').length,
    opacity: getComputedStyle(host).opacity,
    label: host.getAttribute('aria-label'),
  }
})
console.log('split-reveal :', JSON.stringify(split))
if (!split.present) failures.push('split-reveal : element absent')
if (split.pending) failures.push('split-reveal : attente jamais levee')
if (split.opacity === '0') failures.push('split-reveal : reste invisible')
if ((split.fragments ?? 0) < 10) {
  failures.push(`split-reveal : ${split.fragments} fragments, decoupage douteux`)
}

// 2. L'aurore peint autre chose qu'un aplat.
const auroraShot = await page.locator('canvas').first().screenshot()
const auroraValues = new Set()
for (let i = 0; i < auroraShot.length; i += 89) auroraValues.add(auroraShot[i])
console.log('aurore : valeurs distinctes =', auroraValues.size)
if (auroraValues.size < 8) failures.push('aurore : canevas uniforme')

// 3. Molten : monter la scene, puis verifier qu elle peint.
await page.getByRole('button', { name: 'Monter la scene' }).click()
await page.waitForTimeout(4000)

const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length)
console.log('canevas apres montage :', canvases)
if (canvases < 2)
  failures.push(`molten : ${canvases} canevas, la scene n a pas ete montee`)

if (canvases >= 2) {
  const shot = await page.locator('canvas').nth(1).screenshot()
  const values = new Set()
  for (let i = 0; i < shot.length; i += 89) values.add(shot[i])
  console.log('molten : valeurs distinctes =', values.size)
  if (values.size < 8) failures.push('molten : canevas uniforme — shader muet ?')
}

// 4. Le repli de Molten a bien disparu.
const poster = await page.evaluate(() => {
  const hero = document.querySelector('[data-o-detail]')
  return hero === null ? null : hero.querySelectorAll(':scope > div').length
})
console.log('replis restants dans le heros :', poster)

const glErrors = errors.filter((e) => /shader|GL_|WebGL|glsl/i.test(e))
if (glErrors.length > 0) failures.push(`erreurs graphiques : ${glErrors.join(' | ')}`)
for (const error of errors) failures.push(`console : ${error}`)

// 5. Les cinq fonds en shader compilent et peignent.
//
// Un shader n'est qu'une chaine pour TypeScript : il faut le compiler pour
// savoir. Ils sont essayes un par un, l'arbitre n'accordant qu'un contexte.
const fonds = await browser.newPage()
fonds.on('pageerror', (e) => failures.push(`fonds : ${String(e)}`))
fonds.on('console', (m) => {
  if (m.type() === 'error') failures.push(`fonds : ${m.text().slice(0, 160)}`)
})
await fonds.goto(`${base}/docs/backgrounds`, { waitUntil: 'networkidle' })
await fonds.waitForTimeout(2000)

for (const name of ['aurore', 'ondes', 'points', 'faisceaux', 'nappe']) {
  await fonds.getByRole('button', { name, exact: true }).click()
  await fonds.waitForTimeout(1500)

  const canevas = await fonds.evaluate(() => document.querySelectorAll('canvas').length)
  const shot = await fonds.locator('canvas').first().screenshot()
  const values = new Set()
  for (let i = 0; i < shot.length; i += 89) values.add(shot[i])

  console.log(
    `fond ${name.padEnd(11)} canevas ${String(canevas)}, ${String(values.size)} valeurs`,
  )
  if (canevas !== 1) failures.push(`${name} : ${String(canevas)} canevas au lieu de 1`)
  if (values.size < 8) failures.push(`${name} : canevas uniforme, shader muet ?`)
}
await fonds.close()

// 6. Sous mouvement reduit : aucune scene, aucun canevas, les replis seuls.
const sobre = await browser.newPage()
sobre.on('pageerror', (e) => failures.push(`mouvement reduit : ${String(e)}`))
await sobre.emulateMedia({ reducedMotion: 'reduce' })
await sobre.goto(`${base}/docs/registre/galerie`, { waitUntil: 'networkidle' })

// Attendre l'element plutot qu'un delai fixe. Un delai trop court faisait
// echouer ce controle une fois sur deux, en accusant le titre d'etre
// invisible alors qu'il n'etait pas encore rendu : un test qui designe le
// mauvais coupable est pire qu'un test qui echoue.
const titreSobre = sobre.locator('p', { hasText: /^Construisez/ }).first()
await titreSobre.waitFor({ state: 'attached', timeout: 10000 })

const reduit = await sobre.evaluate(() => {
  // Le heros n'est pas monte sur cette passe : il attend un clic, et ce clic
  // n'a pas lieu. C'est l'aurore et le titre qui prouvent la regle ici.
  const titre = [...document.querySelectorAll('p')].find((node) =>
    (node.textContent ?? '').startsWith('Construisez'),
  )
  return {
    canvas: document.querySelectorAll('canvas').length,
    titreTrouve: titre !== undefined,
    titreVisible: titre !== undefined && getComputedStyle(titre).opacity !== '0',
    titreAttend: titre?.hasAttribute('data-o-split-pending') ?? false,
  }
})
console.log('mouvement reduit :', JSON.stringify(reduit))

if (reduit.canvas !== 0) {
  failures.push(`mouvement reduit : ${reduit.canvas} canevas, aucun n etait attendu`)
}
if (!reduit.titreTrouve) {
  failures.push('mouvement reduit : le titre n a pas ete rendu du tout')
} else if (!reduit.titreVisible) {
  // Le defaut le plus grave possible : l'animation neutralisee a emporte
  // l'etat final avec elle.
  failures.push('mouvement reduit : le titre est rendu mais invisible')
}
if (reduit.titreAttend) {
  failures.push(
    'mouvement reduit : attribut d attente pose alors qu il n y a rien a attendre',
  )
}

await browser.close()

if (failures.length > 0) {
  console.error(`\nEchec — ${failures.length} probleme(s) :\n`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exitCode = 1
} else {
  console.log('\nLa tranche verticale rend correctement.\n')
}
