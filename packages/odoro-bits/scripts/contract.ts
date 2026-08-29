/**
 * Verification du contrat de personnalisation sur les sources du registre.
 *
 * ## Ce qui se verifie vraiment, et ce qui ne se verifie pas
 *
 * Le contrat compte cinq niveaux. Trois d'entre eux ne se controlent pas
 * mecaniquement : qu'une propriete soit bien nommee, qu'un slot recoive ce
 * qu'il faut, qu'une echappatoire arrive au bon moment — cela se lit, cela ne
 * se mesure pas. Pretendre le contraire produirait des refus arbitraires sur
 * du code correct, ce qui est pire que pas de verification du tout : on
 * apprend a contourner l'outil.
 *
 * Restent trois regles exactes, et elles sont ici. Chacune porte sur un ecart
 * qu'aucune relecture ne rattrape de facon fiable, parce qu'il se cache entre
 * deux fichiers.
 *
 * @module
 */

import { tokens } from '@odoro-cli/libs/styles'
import type { RegistryMeta } from 'odoro/registry'

/**
 * Noms de variables que le systeme declare reellement.
 *
 * ## Pourquoi cette liste existe
 *
 * Sans elle, la regle de coherence prend toute variable en `--o-` pour un
 * token. Or un composant en declare pour son propre usage — la duree de son
 * animation, la couleur de son reflet — qui ne viennent d'aucune echelle et
 * n'ont rien a faire dans sa documentation.
 *
 * La liste est deduite des tokens, jamais ecrite a la main : elle ne peut donc
 * pas deriver de ce que la feuille contient.
 *
 * Elle rend aussi la regle plus stricte dans l'autre sens : un token declare
 * qui n'existe pas dans le systeme est desormais refuse, la ou il passait
 * inapercu.
 */
const KNOWN_TOKENS: ReadonlySet<string> = new Set(
  Object.entries(tokens).flatMap(([group, scale]) =>
    typeof scale === 'string'
      ? [`--o-${group}`]
      : Object.keys(scale).map((key) => `--o-${group}-${key.replace(/\./g, '_')}`),
  ),
)

/** Categories dont les entrees rendent un element du document. */
const RENDERING = new Set([
  'text',
  'background',
  'effect',
  'hero',
  'image',
  'ui',
  'section',
])

/**
 * Un token consomme directement dans une source.
 *
 * Deux formes, parce qu'il y a deux facons legitimes de lire un token.
 * En CSS, `var(--o-x)`. En JavaScript — un shader qui a besoin de trois
 * flottants, une duree passee a une timeline — le nom est une chaine, remise a
 * `readTokenColour` ou a `getPropertyValue`.
 *
 * La seconde forme a ete ajoutee apres coup : la premiere version de cette
 * regle refusait un fond anime qui lisait pourtant ses couleurs dans la
 * palette, faute de les lire en CSS.
 */
const TOKEN_USE = /var\(\s*(--o-[a-z0-9-]+)|['"`](--o-[a-z0-9-]+)['"`]/g

/**
 * Couleur ecrite en dur.
 *
 * Les directives de shader — `#version`, `#ifdef` — ne peuvent pas etre prises
 * pour des couleurs : elles contiennent des lettres hors de l'alphabet
 * hexadecimal, et la limite de mot empeche une correspondance partielle.
 */
const HARD_COLOUR = /(?<!&)#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/g

/** Un manquement au contrat. */
export interface ContractProblem {
  /** Entree concernee. */
  readonly id: string
  /** Phrase complete, prete a etre affichee. */
  readonly message: string
}

/**
 * Retire les commentaires d'une source, en laissant les chaines intactes.
 *
 * ## Pourquoi c'est necessaire
 *
 * Un exemple de documentation cite des tokens que le composant n'emploie pas —
 * c'est meme l'interet d'un exemple, montrer autre chose que le defaut. Sans
 * ce nettoyage, la regle de coherence les compterait comme employes et
 * reclamerait leur declaration.
 *
 * Le premier jet de cette regle a bute exactement la-dessus, sur un fond dont
 * le docblock montrait trois tokens de rechange.
 *
 * ## Ce qui est preserve
 *
 * Les chaines et les gabarits. Un shader vit dans un gabarit, et une lecture
 * de token vit dans une chaine : les traverser en les retirant reviendrait a
 * ne plus rien voir du tout.
 */
export function stripComments(source: string): string {
  let output = ''
  let quote: string | null = null
  let inLine = false
  let inBlock = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index] ?? ''
    const next = source[index + 1] ?? ''

    if (inLine) {
      if (char === '\n') {
        inLine = false
        output += char
      }
      continue
    }

    if (inBlock) {
      if (char === '*' && next === '/') {
        inBlock = false
        index += 1
      }
      continue
    }

    if (quote !== null) {
      output += char
      if (char === '\\') {
        output += next
        index += 1
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      output += char
      continue
    }
    if (char === '/' && next === '/') {
      inLine = true
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      inBlock = true
      index += 1
      continue
    }

    output += char
  }

  return output
}

/**
 * Extrait les tokens qu'une source consomme directement.
 *
 * Les commentaires sont retires d'abord : un token cite dans un exemple est de
 * la documentation, pas une consommation.
 */
export function usedTokens(source: string): Set<string> {
  const found = new Set<string>()
  for (const match of stripComments(source).matchAll(TOKEN_USE)) {
    const token = match[1] ?? match[2]
    if (token !== undefined) found.add(token)
  }
  return found
}

/**
 * Verifie le contrat sur une entree.
 *
 * @param meta Entree validee par le schema.
 * @param sources Contenu des fichiers, indexe par leur chemin.
 *
 * @example
 * const problems = checkContract(meta, sources)
 */
export function checkContract(
  meta: RegistryMeta & { id: string },
  sources: Readonly<Record<string, string>>,
): ContractProblem[] {
  const problems: ContractProblem[] = []
  const say = (message: string): void => {
    problems.push({ id: meta.id, message: `${meta.id} : ${message}` })
  }

  const code = Object.values(sources).join('\n')

  // Regle 1 — les tokens declares et les tokens employes doivent coincider.
  //
  // La declaration sert a la documentation et a la CLI ; le code, lui, fait
  // foi. Un ecart entre les deux est invisible a la relecture — il faut avoir
  // les deux fichiers sous les yeux — et il trompe exactement la personne qui
  // cherche quelle variable regler pour changer l'apparence.
  // Seules les variables que le systeme declare comptent : les autres sont
  // des variables privees du composant.
  const used = new Set([...usedTokens(code)].filter((token) => KNOWN_TOKENS.has(token)))
  const declared = new Set(meta.tokens)

  for (const token of declared) {
    if (!KNOWN_TOKENS.has(token)) {
      say(`le token ${token} n'existe pas dans le systeme.`)
    }
  }

  for (const token of declared) {
    if (!used.has(token)) {
      say(`le token ${token} est declare mais n'est employe nulle part.`)
    }
  }
  for (const token of used) {
    if (!declared.has(token)) {
      say(`le token ${token} est employe mais absent de "tokens".`)
    }
  }

  // Regle 2 — un composant qui rend un element accepte `className`.
  //
  // C'est le niveau 3 du contrat, celui qui permet de poser le composant dans
  // une mise en page sans rien savoir de son interieur. Sans lui, la seule
  // facon de le decaler d'un cran est de l'envelopper — ou d'editer sa source,
  // ce qu'`odoro diff` signalera a chaque mise a jour.
  //
  // La verification porte sur la presence du nom, pas sur la correction de la
  // fusion : celle-ci est garantie par `mergePresentation`, pas par une
  // lecture textuelle. C'est une regle qui attrape l'oubli, pas la maladresse.
  if (RENDERING.has(meta.category) && !code.includes('className')) {
    say(
      'aucune mention de className : le composant ne peut pas etre pose dans une mise en page (niveau 3 du contrat).',
    )
  }

  // Regle 3 — aucune couleur ecrite en dur.
  //
  // Une couleur en dur est un reglage que le niveau 1 ne peut plus atteindre :
  // changer un token ne la touchera pas, et le composant restera seul de son
  // espece dans une page qui a change de theme. C'est le defaut le plus
  // courant d'un composant repris d'ailleurs.
  const colours = [...code.matchAll(HARD_COLOUR)].map((match) => match[0])
  if (colours.length > 0) {
    const shown = [...new Set(colours)].slice(0, 3).join(', ')
    say(
      `couleur ecrite en dur (${shown}) : elle echappe aux tokens, et ne suivra aucun changement de theme.`,
    )
  }

  return problems
}
