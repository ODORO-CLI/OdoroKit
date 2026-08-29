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

import type { RegistryMeta } from 'odoro/registry'

/** Categories dont les entrees rendent un element du document. */
const RENDERING = new Set(['text', 'background', 'effect', 'hero', 'ui', 'section'])

/** Un token consomme directement dans une source. */
const TOKEN_USE = /var\(\s*(--o-[a-z0-9-]+)/g

/**
 * Couleur ecrite en dur.
 *
 * Les directives de shader — `#version`, `#ifdef` — ne peuvent pas etre prises
 * pour des couleurs : elles contiennent des lettres hors de l'alphabet
 * hexadecimal, et la limite de mot empeche une correspondance partielle.
 */
const HARD_COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/g

/** Un manquement au contrat. */
export interface ContractProblem {
  /** Entree concernee. */
  readonly id: string
  /** Phrase complete, prete a etre affichee. */
  readonly message: string
}

/** Extrait les tokens qu'une source consomme directement. */
export function usedTokens(source: string): Set<string> {
  const found = new Set<string>()
  for (const match of source.matchAll(TOKEN_USE)) {
    const token = match[1]
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
  const used = usedTokens(code)
  const declared = new Set(meta.tokens)

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
