/**
 * Releve la version de chaque paquet publie de l'espace de travail.
 *
 * ## Pourquoi la CLI ne peut pas la deviner
 *
 * L'echafaudeur ecrit les versions des paquets Odoro dans le manifeste du
 * projet cree. Il posait celle de la CLI sur tous, ce qui etait juste tant que
 * la configuration les tenait en groupe `fixed` : les six avancaient ensemble,
 * donc la version de l'un valait pour tous.
 *
 * Ce groupe a ete retire — un mineur sur les bibliotheques emmenait le moteur
 * en majeur. Les paquets avancent desormais chacun a leur rythme, et `odoro`
 * en 1.0.3 demandait `@odoro-cli/libs@^1.0.3`, restee en 1.0.2 : une version
 * qui n'existe pas, donc un `npm install` qui echoue des la creation.
 *
 * ## Pourquoi un relevé a la compilation, et non une lecture a l'execution
 *
 * `@odoro-cli/libs` n'est pas une dependance de `odoro` : sur la machine de
 * celui qui cree un projet, elle n'est nulle part. La seule occasion de
 * connaitre ces numeros est la compilation, ici, dans l'espace de travail ou
 * les six manifestes sont cote a cote.
 *
 * Et c'est le bon moment : la montee de version precede la compilation, qui
 * precede la publication. Ce qui est releve est donc exactement ce qui part sur
 * le registre.
 *
 * Emploi :
 *
 *   node scripts/versions-famille.mjs
 *
 * @module
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const paquets = resolve(ici, '..', '..')
const sortie = resolve(ici, '..', 'src', 'scaffold', 'versions-famille.generated.ts')

/** Les versions relevees, par nom de paquet. */
const versions = {}

for (const dossier of readdirSync(paquets)) {
  let manifeste
  try {
    manifeste = JSON.parse(readFileSync(join(paquets, dossier, 'package.json'), 'utf8'))
  } catch {
    continue
  }

  // Les paquets prives ne sont jamais installes chez personne : les annoncer
  // ferait ecrire une dependance introuvable.
  if (manifeste.private === true) continue
  if (typeof manifeste.name !== 'string' || typeof manifeste.version !== 'string')
    continue

  versions[manifeste.name] = manifeste.version
}

const lignes = Object.keys(versions)
  .sort()
  .map((nom) => `  ${JSON.stringify(nom)}: ${JSON.stringify(versions[nom])},`)

writeFileSync(
  sortie,
  [
    '/* Genere par scripts/versions-famille.mjs. Ne pas editer a la main.',
    '',
    "   Les versions des paquets publies de l'espace de travail, relevees a la",
    '   compilation. Voir le script pour la raison. */',
    '',
    '/** Version publiee de chaque paquet de la famille. */',
    'export const VERSIONS_FAMILLE: Readonly<Record<string, string>> = {',
    ...lignes,
    '}',
    '',
  ].join('\n'),
  'utf8',
)

console.log(`[versions-famille] ${String(lignes.length)} paquets releves`)
