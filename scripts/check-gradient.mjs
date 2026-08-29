/**
 * Verifie qu'un degrade est reellement peint.
 *
 * Un degrade dont les jalons de couleur n'existent pas produit une image de
 * fond syntaxiquement valide mais entierement transparente : la classe de
 * direction s'applique, les couleurs manquent, et rien ne le signale. Ni un
 * statut HTTP, ni une erreur de console, ni une assertion sur le DOM ne
 * l'attrapent — seule la valeur calculee le revele.
 *
 * Usage :
 *
 *   node scripts/check-gradient.mjs <url>
 */

const url = process.argv[2] ?? 'http://localhost:5190/docs/styles/degrades'

const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

const findings = await page.evaluate(() => {
  const results = []

  for (const element of document.querySelectorAll('[class*="o-bg-gradient"]')) {
    const style = getComputedStyle(element)
    const image = style.backgroundImage

    // Toutes les notations de couleur comptent : le navigateur restitue les
    // valeurs dans l'espace d'origine, souvent `oklch`.
    const stops = [
      ...image.matchAll(/(?:rgba?|oklch|oklab|hsla?|lab|lch|color)\([^)]*\)/g),
    ].map((match) => match[0])
    // Un jalon absent laisse la couleur entierement transparente.
    const transparent = stops.filter((stop) => /[,/]\s*0\s*\)$/.test(stop))

    results.push({
      classes: element.className,
      image: image.slice(0, 120),
      stops: stops.length,
      transparent: transparent.length,
    })
  }

  return results
})

const gradients = findings.filter((entry) => entry.image !== 'none')

console.log(`\n${gradients.length} element(s) a degrade sur ${url}\n`)

let broken = 0
for (const entry of gradients) {
  const ok = entry.stops > 1 && entry.transparent < entry.stops
  if (!ok) broken += 1
  console.log(`  ${ok ? '✓' : '✗'} ${entry.classes.slice(0, 70)}`)
  console.log(`      ${entry.stops} jalons, dont ${entry.transparent} transparents`)
  if (!ok) console.log(`      ${entry.image}`)
}

if (gradients.length === 0) {
  console.log('  Aucun degrade trouve sur cette page.')
}

await browser.close()

console.log(broken === 0 && gradients.length > 0 ? '\nDegrades peints.\n' : '\nEchec.\n')
process.exit(broken === 0 && gradients.length > 0 ? 0 : 1)
