/**
 * Transformation des modules servis en developpement.
 *
 * Le navigateur ne sait lire ni TypeScript, ni JSX, ni les specificateurs
 * d'import nus (`import React from 'react'`). Chaque module demande est donc
 * compile a la volee et ses imports sont reecrits en URL que le serveur sait
 * resoudre.
 *
 * La reecriture n'est pas faite a coups d'expressions regulieres — une chaine
 * de caracteres contenant le mot `import` suffirait a la mettre en defaut.
 * On s'appuie sur le resolveur du compilateur lui-meme : chaque import est
 * resolu puis **marque externe**, de sorte que rien n'est inline mais que tous
 * les chemins ressortent reecrits, avec la meme exactitude qu'une compilation
 * complete.
 *
 * @module
 */

import { relative, resolve } from 'node:path'

import { type Plugin, build } from 'esbuild'

import type { ResolvedConfig } from '../config.js'

/** Prefixe des URL servant les dependances pre-compilees. */
export const DEPS_PREFIX = '/@deps/'

/** Prefixe des URL internes au moteur. */
export const INTERNAL_PREFIX = '/@odoro/'

/** Extensions traitees comme des feuilles de style. */
export const STYLE_EXTENSIONS = ['.css'] as const

/** Extensions traitees comme des ressources statiques importables. */
export const ASSET_EXTENSIONS = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.woff',
  '.woff2',
  '.mp4',
  '.webm',
] as const

/**
 * Nom de fichier compile correspondant a un specificateur de dependance.
 *
 * Le nom est **aplati** : c'est ce qui rend l'URL servie exempte de segment de
 * dossier. Un module servi sous `/@deps/react-dom/client` resoudrait son propre
 * `import './chunk-X.js'` en `/@deps/react-dom/chunk-X.js`, alors que le
 * fragment est depose a la racine du cache.
 *
 * @example
 * depFileName('react-dom/client') // 'react-dom_client.js'
 * depFileName('@scope/paquet')    // 'scope_paquet.js'
 */
export function depFileName(specifier: string): string {
  return `${specifier.replace(/^@/, '').split('/').join('_')}.js`
}

/** Indique si un specificateur designe un paquet plutot qu'un fichier. */
export function isBareSpecifier(specifier: string): boolean {
  return (
    !specifier.startsWith('.') &&
    !specifier.startsWith('/') &&
    !specifier.startsWith('\\') &&
    !/^[a-zA-Z]:[\\/]/.test(specifier) &&
    !specifier.startsWith('data:') &&
    !specifier.startsWith('http:') &&
    !specifier.startsWith('https:')
  )
}

/** Indique si un chemin porte l'une des extensions donnees. */
export function hasExtension(path: string, extensions: readonly string[]): boolean {
  const clean = path.split('?')[0] ?? path
  return extensions.some((extension) => clean.toLowerCase().endsWith(extension))
}

/**
 * Convertit un chemin de fichier absolu en URL servie par le serveur.
 *
 * Un fichier interieur a la racine devient une URL relative a celle-ci ; un
 * fichier exterieur — le cas d'une dependance liee en workspace — passe par le
 * prefixe `/@fs/`, qui porte son chemin absolu.
 */
export function fileToUrl(file: string, root: string): string {
  const relativePath = relative(root, file).split('\\').join('/')
  if (!relativePath.startsWith('..')) return `/${relativePath}`
  return `/@fs/${file.split('\\').join('/').replace(/^\//, '')}`
}

/** Convertit une URL servie par le serveur en chemin de fichier absolu. */
export function urlToFile(url: string, root: string): string {
  const path = (url.split('?')[0] ?? url).split('#')[0] ?? url
  if (path.startsWith('/@fs/')) {
    const absolute = path.slice('/@fs/'.length)
    return /^[a-zA-Z]:/.test(absolute) ? absolute : `/${absolute}`
  }
  return resolve(root, `.${path}`)
}

/** Applique les alias de configuration a un specificateur. */
export function applyAlias(specifier: string, config: ResolvedConfig): string {
  for (const [prefix, target] of Object.entries(config.alias)) {
    if (specifier === prefix || specifier.startsWith(`${prefix}/`)) {
      return resolve(
        config.root,
        target,
        specifier.slice(prefix.length).replace(/^\//, ''),
      )
    }
  }
  return specifier
}

/** Resultat d'une transformation de module. */
export interface TransformResult {
  /** Code JavaScript pret a etre servi. */
  code: string
  /** Fichiers dont ce module depend directement, en chemins absolus. */
  dependencies: string[]
}

/**
 * Plugin qui externalise tout import apres l'avoir resolu, en reecrivant son
 * chemin en URL.
 */
function externalizeImports(config: ResolvedConfig, dependencies: Set<string>): Plugin {
  return {
    name: 'odoro-externalize',
    setup(builder) {
      builder.onResolve({ filter: /.*/ }, async (args) => {
        if (args.kind === 'entry-point') return null

        // Deuxieme passage : on laisse le resolveur natif faire son travail.
        if (
          (args.pluginData as { resolving?: boolean } | undefined)?.resolving === true
        ) {
          return null
        }

        if (args.path.startsWith(INTERNAL_PREFIX) || args.path.startsWith(DEPS_PREFIX)) {
          return { path: args.path, external: true }
        }

        const aliased = applyAlias(args.path, config)

        // Une feuille de style ou une ressource importee depuis un paquet
        // (`@odoro/libs/styles.css`) doit etre servie comme un fichier, pas
        // cherchee dans le cache de dependances, qui ne contient que du
        // JavaScript.
        const isFileLike =
          hasExtension(aliased, STYLE_EXTENSIONS) ||
          hasExtension(aliased, ASSET_EXTENSIONS)

        if (isBareSpecifier(aliased) && !isFileLike) {
          return { path: `${DEPS_PREFIX}${depFileName(aliased)}`, external: true }
        }

        const resolved = await builder.resolve(aliased, {
          kind: 'import-statement',
          resolveDir: args.resolveDir,
          importer: args.importer,
          pluginData: { resolving: true },
        })

        if (resolved.errors.length > 0) {
          // Un import irresoluble ne doit pas faire echouer toute la page :
          // le navigateur signalera l'echec sur ce seul module.
          return { path: args.path, external: true }
        }

        dependencies.add(resolved.path)
        const url = fileToUrl(resolved.path, config.root)
        return {
          path: hasExtension(url, ASSET_EXTENSIONS) ? `${url}?import` : url,
          external: true,
        }
      })
    },
  }
}

/**
 * Compile un module et reecrit ses imports.
 *
 * @param file Chemin absolu du fichier source.
 * @param config Configuration resolue du projet.
 * @param env Valeurs exposees au client via `import.meta.env`.
 *
 * @example
 * const { code } = await transformModule('/projet/src/main.tsx', config, env)
 */
export async function transformModule(
  file: string,
  config: ResolvedConfig,
  env: Record<string, string | boolean>,
): Promise<TransformResult> {
  const dependencies = new Set<string>()

  const result = await build({
    entryPoints: [file],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    sourcemap: 'inline',
    jsx: 'automatic',
    jsxDev: true,
    logLevel: 'silent',
    absWorkingDir: config.root,
    define: {
      'import.meta.env': JSON.stringify(env),
      'process.env.NODE_ENV': JSON.stringify('development'),
      ...config.define,
    },
    plugins: [externalizeImports(config, dependencies)],
  })

  const code = result.outputFiles[0]?.text
  if (code === undefined) {
    throw new Error(`[odoro] La compilation de "${file}" n'a produit aucun code.`)
  }

  return { code, dependencies: [...dependencies] }
}

/**
 * Enveloppe une feuille de style dans un module JavaScript qui l'injecte, et
 * la remplace a chaud lors d'une mise a jour.
 *
 * Une feuille remplacee sans rechargement est le gain le plus immediat du
 * developpement a chaud : l'etat de l'application est integralement conserve.
 *
 * @example
 * const module = wrapStyle('/src/App.css', 'body { margin: 0 }')
 */
export function wrapStyle(url: string, css: string): string {
  return `const id = ${JSON.stringify(`odoro-style:${url}`)}
const css = ${JSON.stringify(css)}

let element = document.querySelector(\`style[data-odoro-id="\${id}"]\`)
if (element === null) {
  element = document.createElement('style')
  element.setAttribute('data-odoro-id', id)
  document.head.appendChild(element)
}
element.textContent = css

import.meta.hot?.accept()
import.meta.hot?.dispose(() => {
  // La feuille suivante recreera l'element : le retirer evite d'empiler les
  // regles mortes a chaque rechargement.
  element?.remove()
})
`
}

/**
 * Produit le module JavaScript representant une ressource statique importee.
 *
 * @example
 * wrapAsset('/src/logo.svg') // 'export default "/src/logo.svg"'
 */
export function wrapAsset(url: string): string {
  return `export default ${JSON.stringify(url)}\n`
}
