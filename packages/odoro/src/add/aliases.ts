/**
 * Deduction du prefixe d'import d'un projet.
 *
 * ## Le probleme
 *
 * Un composant copie dans `src/components/odoro/` doit pouvoir importer son
 * voisin. Ecrire `../hooks/usePoster.js` marcherait, mais casse des que
 * l'utilisateur deplace le dossier — ce qu'il fera, puisque le code lui
 * appartient. Le prefixe d'alias, lui, survit au deplacement tant que le
 * `tsconfig.json` suit.
 *
 * Encore faut-il le connaitre. La convention `@/` est repandue mais pas
 * universelle : `~/`, `#/`, `src/` existent aussi, et un projet peut n'avoir
 * aucun alias. Il est donc **lu** dans le `tsconfig.json` plutot que suppose.
 *
 * ## Pourquoi ce n'est pas un vrai analyseur de tsconfig
 *
 * Les `extends` en chaine, les `references` de projet, la resolution
 * `bundler` : tout cela existe, et rien de tout cela ne change la reponse a la
 * seule question posee ici — quel prefixe designe le dossier des sources. Le
 * cas ou la deduction echoue est prevu : la CLI demande, et note la reponse
 * dans `odoro.json`. Une fois notee, elle n'est plus jamais redemandee.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { join, posix } from 'node:path'

/** Un alias deduit d'un `tsconfig.json`. */
export interface AliasGuess {
  /** Prefixe d'import, sans barre finale. Par exemple `@`. */
  readonly prefix: string
  /** Dossier vise, relatif a la racine. Par exemple `src`. */
  readonly directory: string
}

/**
 * Retire les commentaires et les virgules finales d'un JSON avec commentaires.
 *
 * Les `tsconfig.json` en contiennent presque toujours — c'est meme le format
 * que TypeScript documente. `JSON.parse` les refuse.
 *
 * Le decoupage suit l'etat de la chaine plutot qu'une expression reguliere :
 * une barre oblique dans un litteral de chaine (`"https://…"`) ne doit pas
 * ouvrir un commentaire.
 */
export function stripJsonComments(source: string): string {
  let output = ''
  let inString = false
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

    if (inString) {
      output += char
      // Un caractere echappe ne peut pas fermer la chaine.
      if (char === '\\') {
        output += next
        index += 1
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
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

  // Une virgule suivie d'une fermeture : legale en JSONC, refusee par JSON.
  return output.replace(/,(\s*[}\]])/g, '$1')
}

/** Forme minimale de ce qui nous interesse dans un `tsconfig.json`. */
interface TsConfigShape {
  compilerOptions?: {
    baseUrl?: string
    paths?: Record<string, string[]>
  }
}

/**
 * Normalise une cible de `paths` en dossier relatif a la racine.
 *
 * `./src/*` et `src/*` designent le meme dossier ; `baseUrl` peut deplacer
 * l'ancrage. La sortie est toujours en barres obliques : elle finira dans un
 * `odoro.json` que deux systemes differents doivent lire pareil.
 */
function toDirectory(target: string, baseUrl: string | undefined): string {
  const withoutStar = target.replace(/\/?\*+$/, '')
  const cleaned = withoutStar.replace(/^\.\//, '')
  const base = (baseUrl ?? '.').replace(/^\.\/?/, '')
  const joined = base === '' ? cleaned : posix.join(base, cleaned)
  return joined === '' ? '.' : joined
}

/**
 * Deduit le prefixe d'import d'un projet depuis son `tsconfig.json`.
 *
 * Le candidat retenu est celui dont la cible est la moins profonde : un projet
 * qui declare a la fois `@/*` vers `src/*` et `@ui/*` vers
 * `src/components/ui/*` veut le premier comme prefixe general.
 *
 * @param root Racine du projet.
 * @returns L'alias deduit, ou `null` si le projet n'en declare aucun.
 *
 * @example
 * await guessAlias('.') // { prefix: '@', directory: 'src' }
 */
export async function guessAlias(root: string): Promise<AliasGuess | null> {
  let raw: string
  try {
    raw = await readFile(join(root, 'tsconfig.json'), 'utf8')
  } catch {
    return null
  }

  let parsed: TsConfigShape
  try {
    parsed = JSON.parse(stripJsonComments(raw)) as TsConfigShape
  } catch {
    return null
  }

  const paths = parsed.compilerOptions?.paths
  if (paths === undefined) return null

  const candidates: AliasGuess[] = []
  for (const [pattern, targets] of Object.entries(paths)) {
    // Seuls les motifs generiques designent un dossier ; `"react": [...]` est
    // une redirection de paquet, pas un alias de sources.
    if (!pattern.endsWith('/*')) continue
    const target = targets[0]
    if (target === undefined) continue

    candidates.push({
      prefix: pattern.slice(0, -2),
      directory: toDirectory(target, parsed.compilerOptions?.baseUrl),
    })
  }

  candidates.sort((a, b) => a.directory.split('/').length - b.directory.split('/').length)
  return candidates[0] ?? null
}

/**
 * Construit les emplacements par defaut d'un projet.
 *
 * @param guess Alias deduit, ou `null` pour un projet sans alias.
 *
 * @example
 * defaultAliases({ prefix: '@', directory: 'src' })
 * // { import: '@/odoro', directory: 'src/odoro' }
 */
export function defaultAliases(guess: AliasGuess | null): {
  import: string
  directory: string
} {
  if (guess === null) {
    // Sans alias, le prefixe d'import est le chemin lui-meme : cela fonctionne
    // depuis la racine des sources, et `odoro init` le signale.
    return { import: 'src/odoro', directory: 'src/odoro' }
  }
  return {
    import: `${guess.prefix}/odoro`,
    directory: posix.join(guess.directory, 'odoro'),
  }
}

/**
 * Lit tous les alias generiques d'un `tsconfig.json`, sous la forme attendue
 * par la configuration du moteur.
 *
 * `guessAlias` cherche **le** prefixe des sources, pour ecrire dedans.
 * Celle-ci les rend **tous**, pour les resoudre. Un projet qui declare a la
 * fois `@/*` et `@ui/*` a besoin des deux au moment de l'import, alors qu'il
 * n'a qu'une destination d'ecriture.
 *
 * @param root Racine du projet.
 * @returns Prefixe sans barre finale vers dossier relatif. Vide si le projet
 * ne declare rien, ou si son `tsconfig.json` est illisible : un alias est un
 * confort, pas une condition de demarrage.
 *
 * @example
 * await guessAliasPaths('.') // { '@': 'src' }
 */
export async function guessAliasPaths(root: string): Promise<Record<string, string>> {
  let raw: string
  try {
    raw = await readFile(join(root, 'tsconfig.json'), 'utf8')
  } catch {
    return {}
  }

  let parsed: TsConfigShape
  try {
    parsed = JSON.parse(stripJsonComments(raw)) as TsConfigShape
  } catch {
    return {}
  }

  const aliases: Record<string, string> = {}
  for (const [pattern, targets] of Object.entries(parsed.compilerOptions?.paths ?? {})) {
    if (!pattern.endsWith('/*')) continue
    const target = targets[0]
    if (target === undefined) continue
    aliases[pattern.slice(0, -2)] = toDirectory(target, parsed.compilerOptions?.baseUrl)
  }
  return aliases
}
