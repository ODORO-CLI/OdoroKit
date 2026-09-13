/**
 * Releve la version de chaque paquet publie, et l ecrit en module.
 *
 * ## Pourquoi un fichier produit, et non une liste tenue a la main
 *
 * Une version ecrite en dur dans une page est fausse des la publication
 * suivante, et rien ne le signale : un numero perime se lit comme un numero
 * juste. Ici la source est le `package.json` de chaque paquet — le meme
 * fichier que `pnpm publish` envoie au registre. Les deux ne peuvent donc pas
 * diverger.
 *
 * Le module produit sert de **socle** : il est juste au moment de la
 * construction, il ne demande aucun reseau, et il s affiche tout de suite. Le
 * site le rafraichit ensuite depuis le registre npm (voir `useVersions`), ce
 * qui couvre le cas ou un paquet est publie sans qu on reconstruise le site.
 *
 * @module
 */

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '..', '..')
const PAQUETS = join(RACINE, 'packages')
const SORTIE = join(RACINE, 'playground', 'src', 'docs', 'versions.generated.ts')

const dossiers = await readdir(PAQUETS, { withFileTypes: true })
const releve = []

for (const dossier of dossiers.sort((a, b) => a.name.localeCompare(b.name))) {
  if (!dossier.isDirectory()) continue
  let manifeste
  try {
    manifeste = JSON.parse(await readFile(join(PAQUETS, dossier.name, 'package.json'), 'utf8'))
  } catch {
    continue
  }
  // Un paquet prive n a pas de page sur le registre : l annoncer avec un
  // numero de version enverrait le lecteur sur une adresse morte.
  if (manifeste.private === true) continue
  if (typeof manifeste.name !== 'string' || typeof manifeste.version !== 'string') continue
  releve.push({ nom: manifeste.name, version: manifeste.version })
}

if (releve.length === 0) throw new Error('[versions] aucun paquet publiable trouve')

const entrees = releve
  .map((p) => `  { nom: '${p.nom}', version: '${p.version}' },`)
  .join('\n')

const module_ = `/* Produit par playground/scripts/versions.mjs. Ne pas editer a la main. */

/** Un paquet publie, et la version que portait le depot a la construction. */
export interface PaquetPublie {
  /** Nom sur le registre, portee comprise. */
  readonly nom: string
  /** Version au moment de la construction ; \`useVersions\` peut la depasser. */
  readonly version: string
}

/**
 * Les paquets publies de l espace de travail.
 *
 * Releves dans leurs \`package.json\` — la meme source que la publication.
 * Les paquets prives en sont absents : ils n ont pas de page sur le registre.
 */
export const PAQUETS: readonly PaquetPublie[] = [
${entrees}
]
`

await writeFile(SORTIE, module_, 'utf8')
console.log(`[versions] ${String(releve.length)} paquets : ${releve.map((p) => `${p.nom}@${p.version}`).join(', ')}`)
