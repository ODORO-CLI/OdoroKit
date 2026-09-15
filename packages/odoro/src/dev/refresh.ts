/**
 * Hot reloading with preservation of the React state.
 *
 * ## Why a dedicated transformation
 *
 * Replacing a module is not enough: React must know that a component is *the
 * same* as before, in order to keep its state rather than remount it. That
 * requires two things only a transformation of the code can provide:
 *
 * 1. **the registration** of every component under a stable identity, so that
 *    React links the old version to the new one;
 * 2. **a signature of the hooks** used by the component. When this signature
 *    changes between two versions — an added `useState`, for instance — the
 *    state cannot be kept: React must remount the component. Without a
 *    signature, it would try to reuse a state whose hook order no longer
 *    matches, and the application would crash on "Rendered more hooks than
 *    during the previous render".
 *
 * That is why we lean here on the reference transformation rather than writing
 * our own: computing those signatures requires a full syntactic analysis, and a
 * subtle mistake only shows up as a crash while editing.
 *
 * ## What is done here
 *
 * The transformation only applies to the project code, and only the modules
 * that actually registered a component become reload boundaries. A module
 * exporting something other than a component still triggers a page reload —
 * which is correct: nothing would allow propagating its change safely.
 *
 * @module
 */

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { transformAsync, type TransformOptions } from '@babel/core'
import { build } from 'esbuild'
// The reference transformation is distributed as CommonJS and without types.
import reactRefreshPlugin from 'react-refresh/babel'

/** Path of the runtime module served to the browser. */
export const REFRESH_RUNTIME_PATH = '/@odoro/react-refresh'

/** Extensions likely to hold components. */
const CANDIDATE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js', '.mjs'] as const

/**
 * Tells whether a file must go through the transformation.
 *
 * The dependency code is excluded: it is already compiled, it does not change
 * during a session, and instrumenting it would only slow down the start.
 *
 * @example
 * isRefreshCandidate('/project/src/App.tsx') // true
 * isRefreshCandidate('/project/node_modules/react/index.js') // false
 */
export function isRefreshCandidate(file: string): boolean {
  const normalized = file.split('\\').join('/')
  if (normalized.includes('/node_modules/')) return false
  return CANDIDATE_EXTENSIONS.some((extension) => normalized.endsWith(extension))
}

/**
 * Applies the refresh transformation to an already compiled module.
 *
 * @param code JavaScript code coming out of the build.
 * @param file Path of the original file, for the messages and the source map.
 * @returns The instrumented code, or the original code when the transformation
 *   produced nothing.
 *
 * @example
 * const instrumented = await applyReactRefresh(code, '/project/src/App.tsx')
 */
export async function applyReactRefresh(code: string, file: string): Promise<string> {
  const result = await transformAsync(code, {
    filename: file,
    babelrc: false,
    configFile: false,
    // The source map produced by the previous build is picked up and merged:
    // without that, the line numbers in the debugger would designate the
    // instrumented code rather than the source.
    //
    // `true` asks Babel to read the inline map of the received code. It accepts
    // it — checked: the source picked up is indeed the original file — but the
    // 7.x types only describe the object form. The annotation is incomplete,
    // not the value.
    inputSourceMap: true as unknown as TransformOptions['inputSourceMap'],
    sourceMaps: 'inline',
    // `skipEnvCheck` lifts a guard meant for global configurations, which
    // refuses the transformation outside NODE_ENV=development. Here it is the
    // point of application that enforces the rule: this function is only called
    // by the development server, never by the production build. Without it, a
    // `NODE_ENV=production odoro dev` — or a test suite — would fail instead of
    // simply instrumenting.
    plugins: [[reactRefreshPlugin, { skipEnvCheck: true }]],
    parserOpts: { sourceType: 'module' },
  })

  return result?.code ?? code
}

/**
 * Tells whether the transformation actually registered a component.
 *
 * That is what distinguishes a module that can be replaced hot from an ordinary
 * module, which will have to trigger a page reload.
 *
 * @example
 * hasRegisteredComponent(code) // true when the module declares a component
 */
export function hasRegisteredComponent(code: string): boolean {
  return code.includes('$RefreshReg$(')
}

/**
 * Preamble placed at the top of an instrumented module.
 *
 * The two global functions are saved then restored by the epilogue: several
 * modules evaluate in cascade, and each must register its components under its
 * own identity.
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
 * Epilogue placed at the end of an instrumented module.
 *
 * The self-import is the only way for a module to reach its own namespace: the
 * module being already in the browser cache, the import returns the same
 * instance without a new request.
 */
export function refreshEpilogue(id: string): string {
  return `
window.$RefreshReg$ = __odoroPrevReg
window.$RefreshSig$ = __odoroPrevSig

void import(import.meta.url).then((__odoroCurrent) => {
  __odoroRefresh.registerExports(${JSON.stringify(id)}, __odoroCurrent)
  import.meta.hot?.accept((__odoroNext) => {
    if (!__odoroNext) return
    const refusal = __odoroRefresh.checkBoundary(__odoroCurrent, __odoroNext)
    if (refusal !== null) import.meta.hot.invalidate(refusal)
    else {
      __odoroRefresh.registerExports(${JSON.stringify(id)}, __odoroNext)
      __odoroRefresh.enqueueUpdate()
    }
  })
})
`
}

/**
 * Source of the runtime module served to the browser.
 *
 * It is bundled when the server starts: the reference transformation is
 * distributed as CommonJS, and the browser cannot load it as it is.
 */
export const REFRESH_RUNTIME_SOURCE = `import runtime from 'react-refresh/runtime'

// The hook must be installed **before** React is loaded: it is through it that
// React reports the components it renders.
runtime.injectIntoGlobalHook(window)

// Neutral values: an uninstrumented module must be able to evaluate without
// those functions really existing.
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type

export const register = runtime.register
export const createSignature = runtime.createSignatureFunctionForTransform

/**
 * Registers the exports of a module that look like components.
 *
 * Registering by export name completes the one placed in the body of the
 * module: a component re-exported from another file would not appear there.
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
 * Checks that a module can be replaced hot.
 *
 * @returns null when the replacement is safe, otherwise the reason for refusal.
 */
export function checkBoundary(previous, next) {
  const before = Object.keys(previous)
  const after = Object.keys(next)

  if (after.length === 0) return 'the module no longer exports anything'

  for (const key of after) {
    if (!before.includes(key)) return 'new export: ' + key
  }
  for (const key of before) {
    if (!after.includes(key)) return 'export removed: ' + key
  }

  for (const key of after) {
    const value = next[key]
    if (runtime.isLikelyComponentType(value)) continue
    // An export that is not a component can only be kept when it has not
    // changed: otherwise its consumers would keep the old value.
    if (previous[key] !== value) return 'non-component export changed: ' + key
  }

  return null
}

let planned
const DEBOUNCE = 16

/** Groups the updates of a same burst into a single refresh. */
export function enqueueUpdate() {
  clearTimeout(planned)
  planned = setTimeout(() => {
    planned = undefined
    runtime.performReactRefresh()
  }, DEBOUNCE)
}
`

/**
 * Tag injected into the document, before any other module.
 *
 * The order is mandatory: the global hook must be installed before React is
 * loaded.
 */
export const REFRESH_HTML_TAG = `<script type="module" src="${REFRESH_RUNTIME_PATH}"></script>`

/** Bundled runtime, kept for the lifetime of the server. */
let cachedRuntime: string | undefined

/**
 * Bundles the runtime module for the browser.
 *
 * The reference transformation being distributed as CommonJS, it goes through
 * the same conversion as any other dependency. The resolution starts from the
 * engine directory, and not from the project: it is the engine that declares
 * this dependency, not the application.
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
