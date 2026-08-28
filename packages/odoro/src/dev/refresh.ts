/**
 * Rechargement a chaud avec preservation de l'etat React.
 *
 * ## Pourquoi une transformation dediee
 *
 * Remplacer un module ne suffit pas : React doit savoir qu'un composant est
 * *le meme* qu'avant, pour conserver son etat plutot que de le remonter. Cela
 * demande deux choses que seule une transformation du code peut fournir :
 *
 * 1. **l'enregistrement** de chaque composant sous une identite stable, pour
 *    que React relie l'ancienne version a la nouvelle ;
 * 2. **une signature des hooks** utilises par le composant. Si cette signature
 *    change entre deux versions — un `useState` ajoute, par exemple —, l'etat
 *    ne peut pas etre conserve : React doit remonter le composant. Sans
 *    signature, il tenterait de reutiliser un etat dont l'ordre des hooks ne
 *    correspond plus, et l'application planterait sur « Rendered more hooks
 *    than during the previous render ».
 *
 * C'est la raison pour laquelle on s'appuie ici sur la transformation de
 * reference plutot que d'ecrire la notre : calculer ces signatures demande une
 * analyse syntaxique complete, et une erreur subtile ne se manifeste qu'en
 * plantage a l'edition.
 *
 * ## Ce qui est fait ici
 *
 * La transformation ne s'applique qu'au code du projet, et seuls les modules
 * ayant reellement enregistre un composant deviennent des frontieres de
 * rechargement. Un module exportant autre chose qu'un composant continue de
 * provoquer un rechargement de page — c'est correct : rien ne permettrait d'en
 * propager le changement sans risque.
 *
 * @module
 */

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { transformAsync } from '@babel/core'
import { build } from 'esbuild'
// La transformation de reference est distribuee en CommonJS et sans types.
import reactRefreshPlugin from 'react-refresh/babel'

/** Chemin du module de runtime servi au navigateur. */
export const REFRESH_RUNTIME_PATH = '/@odoro/react-refresh'

/** Extensions susceptibles de contenir des composants. */
const CANDIDATE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js', '.mjs'] as const

/**
 * Indique si un fichier doit passer par la transformation.
 *
 * Le code des dependances en est exclu : il est deja compile, il ne change pas
 * pendant une session, et l'instrumenter ne ferait que ralentir le demarrage.
 *
 * @example
 * isRefreshCandidate('/projet/src/App.tsx') // true
 * isRefreshCandidate('/projet/node_modules/react/index.js') // false
 */
export function isRefreshCandidate(file: string): boolean {
  const normalized = file.split('\\').join('/')
  if (normalized.includes('/node_modules/')) return false
  return CANDIDATE_EXTENSIONS.some((extension) => normalized.endsWith(extension))
}

/**
 * Applique la transformation de rechargement a un module deja compile.
 *
 * @param code Code JavaScript issu de la compilation.
 * @param file Chemin du fichier d'origine, pour les messages et la carte de
 *   source.
 * @returns Le code instrumente, ou le code d'origine si la transformation
 *   n'a rien produit.
 *
 * @example
 * const instrumented = await applyReactRefresh(code, '/projet/src/App.tsx')
 */
export async function applyReactRefresh(code: string, file: string): Promise<string> {
  const result = await transformAsync(code, {
    filename: file,
    babelrc: false,
    configFile: false,
    // La carte de source produite par la compilation precedente est reprise et
    // fusionnee : sans cela, les numeros de ligne du debogueur designeraient le
    // code instrumente plutot que la source.
    inputSourceMap: true,
    sourceMaps: 'inline',
    // `skipEnvCheck` leve un garde-fou destine aux configurations globales,
    // qui refuse la transformation hors de NODE_ENV=development. Ici c'est le
    // point d'application qui garantit la regle : cette fonction n'est appelee
    // que par le serveur de developpement, jamais par la compilation de
    // production. Sans cela, un `NODE_ENV=production odoro dev` — ou une suite
    // de tests — echouerait au lieu de simplement instrumenter.
    plugins: [[reactRefreshPlugin, { skipEnvCheck: true }]],
    parserOpts: { sourceType: 'module' },
  })

  return result?.code ?? code
}

/**
 * Indique si la transformation a effectivement enregistre un composant.
 *
 * C'est ce qui distingue un module susceptible d'etre remplace a chaud d'un
 * module ordinaire, qui devra provoquer un rechargement de page.
 *
 * @example
 * hasRegisteredComponent(code) // true si le module declare un composant
 */
export function hasRegisteredComponent(code: string): boolean {
  return code.includes('$RefreshReg$(')
}

/**
 * Preambule pose en tete d'un module instrumente.
 *
 * Les deux fonctions globales sont sauvegardees puis restaurees par
 * l'epilogue : plusieurs modules s'evaluent en cascade, et chacun doit
 * enregistrer ses composants sous sa propre identite.
 */
export function refreshPreamble(id: string): string {
  return `import * as __odoroRefresh from ${JSON.stringify(REFRESH_RUNTIME_PATH)}
const __odoroPrevReg = window.$RefreshReg$
const __odoroPrevSig = window.$RefreshSig$
window.$RefreshReg$ = (type, name) => __odoroRefresh.register(type, ${JSON.stringify(id)} + ' ' + name)
window.$RefreshSig$ = __odoroRefresh.createSignature
`
}

/**
 * Epilogue pose en fin d'un module instrumente.
 *
 * L'auto-import est le seul moyen, pour un module, d'acceder a son propre
 * espace de noms : le module etant deja dans le cache du navigateur, l'import
 * rend la meme instance sans nouvelle requete.
 */
export function refreshEpilogue(id: string): string {
  return `
window.$RefreshReg$ = __odoroPrevReg
window.$RefreshSig$ = __odoroPrevSig

void import(import.meta.url).then((__odoroCurrent) => {
  __odoroRefresh.registerExports(${JSON.stringify(id)}, __odoroCurrent)
  import.meta.hot?.accept((__odoroNext) => {
    if (!__odoroNext) return
    const refus = __odoroRefresh.checkBoundary(__odoroCurrent, __odoroNext)
    if (refus !== null) import.meta.hot.invalidate(refus)
    else {
      __odoroRefresh.registerExports(${JSON.stringify(id)}, __odoroNext)
      __odoroRefresh.enqueueUpdate()
    }
  })
})
`
}

/**
 * Source du module de runtime servi au navigateur.
 *
 * Elle est compilee au demarrage du serveur : la transformation de reference
 * est distribuee en CommonJS, et le navigateur ne sait pas la charger telle
 * quelle.
 */
export const REFRESH_RUNTIME_SOURCE = `import runtime from 'react-refresh/runtime'

// Le crochet doit etre installe **avant** que React ne soit charge : c'est par
// lui que React signale les composants qu'il rend.
runtime.injectIntoGlobalHook(window)

// Valeurs neutres : un module non instrumente doit pouvoir s'evaluer sans que
// ces fonctions existent vraiment.
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type

export const register = runtime.register
export const createSignature = runtime.createSignatureFunctionForTransform

/**
 * Enregistre les exports d'un module qui ressemblent a des composants.
 *
 * L'enregistrement par nom d'export complete celui pose dans le corps du
 * module : un composant re-exporte depuis un autre fichier n'y apparaitrait
 * pas.
 */
export function registerExports(id, exports) {
  for (const key of Object.keys(exports)) {
    const value = exports[key]
    if (runtime.isLikelyComponentType(value)) {
      runtime.register(value, id + ' export ' + key)
    }
  }
}

/**
 * Verifie qu'un module peut etre remplace a chaud.
 *
 * @returns null si le remplacement est sur, sinon la raison du refus.
 */
export function checkBoundary(previous, next) {
  const before = Object.keys(previous)
  const after = Object.keys(next)

  if (after.length === 0) return 'le module n exporte plus rien'

  for (const key of after) {
    if (!before.includes(key)) return 'nouvel export : ' + key
  }
  for (const key of before) {
    if (!after.includes(key)) return 'export retire : ' + key
  }

  for (const key of after) {
    const value = next[key]
    if (runtime.isLikelyComponentType(value)) continue
    // Un export qui n'est pas un composant ne peut etre conserve que s'il n'a
    // pas change : sinon ses consommateurs garderaient l'ancienne valeur.
    if (previous[key] !== value) return 'export non-composant modifie : ' + key
  }

  return null
}

let planned
const DEBOUNCE = 16

/** Regroupe les mises a jour d'une meme salve en un seul rafraichissement. */
export function enqueueUpdate() {
  clearTimeout(planned)
  planned = setTimeout(() => {
    planned = undefined
    runtime.performReactRefresh()
  }, DEBOUNCE)
}
`

/**
 * Balise injectee dans le document, avant tout autre module.
 *
 * L'ordre est imperatif : le crochet global doit etre installe avant le
 * chargement de React.
 */
export const REFRESH_HTML_TAG = `<script type="module" src="${REFRESH_RUNTIME_PATH}"></script>`

/** Runtime compile, conserve pour la duree du serveur. */
let cachedRuntime: string | undefined

/**
 * Compile le module de runtime pour le navigateur.
 *
 * La transformation de reference etant distribuee en CommonJS, elle passe par
 * la meme conversion que n'importe quelle dependance. La resolution part du
 * dossier du moteur, et non du projet : c'est le moteur qui declare cette
 * dependance, pas l'application.
 *
 * @example
 * const source = await bundleRefreshRuntime()
 */
export async function bundleRefreshRuntime(): Promise<string> {
  if (cachedRuntime !== undefined) return cachedRuntime

  const result = await build({
    stdin: {
      contents: REFRESH_RUNTIME_SOURCE,
      resolveDir: dirname(fileURLToPath(import.meta.url)),
      loader: 'js',
      sourcefile: 'odoro-react-refresh.js',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
  })

  cachedRuntime = result.outputFiles[0]?.text ?? ''
  return cachedRuntime
}
