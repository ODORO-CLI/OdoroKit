#!/usr/bin/env node
/**
 * Construit le catalogue des templates de sites.
 *
 * ## Pourquoi un script plutot qu'une liste ecrite
 *
 * La liste et les dossiers divergeraient au premier ajout : on copie un
 * template, on oublie la ligne, et il n'apparait nulle part — sans que rien
 * n'echoue, puisqu'une liste incomplete reste une liste valide. Le dossier fait
 * donc foi, et le catalogue en est deduit.
 *
 * ## L'ordre est declare, pas devine
 *
 * Le tri alphabetique rangerait le point de depart avant les sites finis, ce
 * qui est l'inverse de ce qu'on veut montrer. Chaque manifeste porte donc son
 * `order`, et le script trie dessus. A egalite, le nom departage — sans quoi
 * l'ordre dependrait de celui du systeme de fichiers, qui n'est pas le meme
 * partout.
 *
 * ## Ce qui est verifie
 *
 * Qu'un manifeste existe, qu'il porte les champs que la page consomme, et que
 * l'image d'apercu qu'il declare est bien la. Un apercu manquant est le defaut
 * le plus probable — c'est la seule piece qui ne se produit pas en ecrivant du
 * texte — et le seul qui ne se verrait pas avant la mise en ligne.
 *
 * Emploi :
 *
 *     node scripts/build-templates.mjs
 *
 * @module
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(RACINE, 'templates')

/** Les champs qu'une fiche doit porter pour que la page sache l'afficher. */
const REQUIS = ['name', 'title', 'description', 'kind', 'order', 'stack', 'licence']

/** Natures de template reconnues. */
const NATURES = ['site', 'starter', 'library']

/** Lit et verifie un manifeste. */
function lire(nom) {
  const chemin = join(SOURCE, nom, 'template.json')
  if (!existsSync(chemin)) return { nom, problemes: ['aucun template.json'] }

  let meta
  try {
    meta = JSON.parse(readFileSync(chemin, 'utf8'))
  } catch (cause) {
    return { nom, problemes: [`template.json illisible : ${String(cause)}`] }
  }

  const problemes = []
  for (const champ of REQUIS) {
    if (meta[champ] === undefined) problemes.push(`champ manquant : ${champ}`)
  }
  if (meta.name !== nom) {
    problemes.push(`le nom declare (${String(meta.name)}) ne correspond pas au dossier`)
  }
  if (meta.kind !== undefined && !NATURES.includes(meta.kind)) {
    problemes.push(`nature inconnue : ${String(meta.kind)}`)
  }

  // L'apercu est la seule piece qui ne s'ecrit pas : elle se photographie, et
  // c'est donc celle qu'on oublie.
  if (meta.preview !== undefined && !existsSync(join(SOURCE, nom, meta.preview))) {
    problemes.push(`apercu declare mais absent : ${String(meta.preview)}`)
  }

  return { nom, meta, problemes }
}

/** Rend le module que la documentation consomme. */
function moduleCatalogue(entrees) {
  return [
    '/* Genere par scripts/build-templates.mjs. Ne pas editer a la main. */',
    '',
    '/** Un template de site, tel que le catalogue le publie. */',
    'export interface TemplateEntry {',
    '  readonly name: string',
    '  readonly title: string',
    '  readonly description: string',
    "  readonly kind: 'site' | 'starter' | 'library'",
    '  readonly order: number',
    '  readonly stack: readonly string[]',
    '  readonly tags?: readonly string[]',
    '  readonly source?: string',
    '  readonly licence: string',
    '  readonly install?: string',
    '  readonly dev?: string',
    '  readonly preview?: string',
    '}',
    '',
    '/** Les templates, deja tries : les sites, le point de depart, la bibliotheque. */',
    'export const TEMPLATES: readonly TemplateEntry[] = ' +
      JSON.stringify(entrees, null, 2),
    '',
  ].join('\n')
}

const dossiers = readdirSync(SOURCE).filter((nom) =>
  statSync(join(SOURCE, nom)).isDirectory(),
)

const lus = dossiers.map(lire)
const problemes = lus.flatMap(({ nom, problemes }) =>
  problemes.map((p) => `${nom} : ${p}`),
)

if (problemes.length > 0) {
  console.error(`Catalogue invalide — ${problemes.length} probleme(s) :\n`)
  for (const probleme of problemes) console.error(`  · ${probleme}`)
  console.error('')
  process.exitCode = 1
} else {
  // L'ordre declare d'abord, le nom pour departager : sans le second, deux
  // templates de meme rang se rangeraient selon le systeme de fichiers.
  const entrees = lus
    .map(({ meta }) => meta)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

  writeFileSync(
    join(SOURCE, 'index.json'),
    `${JSON.stringify(entrees, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(
    join(RACINE, 'playground', 'src', 'docs', 'templates.generated.ts'),
    moduleCatalogue(entrees),
    'utf8',
  )

  const sansApercu = entrees.filter((e) => e.preview === undefined).map((e) => e.name)
  console.log(`Catalogue compile — ${entrees.length} template(s).`)
  if (sansApercu.length > 0) {
    console.log(`  Sans apercu : ${sansApercu.join(', ')}.`)
  }
}
