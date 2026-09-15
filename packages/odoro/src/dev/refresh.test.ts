import { describe, expect, it } from 'vitest'

import {
  REFRESH_HTML_TAG,
  REFRESH_RUNTIME_PATH,
  applyReactRefresh,
  bundleRefreshRuntime,
  hasRegisteredComponent,
  isRefreshCandidate,
  refreshEpilogue,
  refreshPreamble,
} from './refresh.js'
import { injectClient } from './server.js'

describe('isRefreshCandidate', () => {
  it.each(['/project/src/App.tsx', '/project/src/hook.ts', 'C:\\project\\src\\Page.jsx'])(
    'keeps %j',
    (file) => {
      expect(isRefreshCandidate(file)).toBe(true)
    },
  )

  it('rejects the dependency code', () => {
    // It is already compiled, does not change during a session, and
    // instrumenting it would only slow down the start.
    expect(isRefreshCandidate('/project/node_modules/react/index.js')).toBe(false)
    expect(isRefreshCandidate('C:\\project\\node_modules\\x\\a.tsx')).toBe(false)
  })

  it('rejects the files without code', () => {
    expect(isRefreshCandidate('/project/src/App.css')).toBe(false)
    expect(isRefreshCandidate('/project/public/logo.svg')).toBe(false)
  })
})

describe('applyReactRefresh', () => {
  const component = `
    import { useState } from "react";
    export function Counter() {
      const [n, setN] = useState(0);
      return null;
    }
  `

  it('registers the component under a stable identity', async () => {
    const output = await applyReactRefresh(component, '/project/src/Counter.tsx')
    expect(hasRegisteredComponent(output)).toBe(true)
    expect(output).toContain('Counter')
  })

  it('computes a signature of the hooks in use', async () => {
    // Without it, adding a hook to a mounted component would crash React on
    // "Rendered more hooks than during the previous render".
    const output = await applyReactRefresh(component, '/project/src/Counter.tsx')
    expect(output).toContain('$RefreshSig$')
  })

  it('produces a different signature when the hooks change', async () => {
    const withMore = component.replace(
      'const [n, setN] = useState(0);',
      'const [n, setN] = useState(0); const [m] = useState(1);',
    )

    const first = await applyReactRefresh(component, '/project/src/Counter.tsx')
    const second = await applyReactRefresh(withMore, '/project/src/Counter.tsx')

    const extract = (code: string): string =>
      /_s\(\)\s*\{[\s\S]*?\}/.exec(code)?.[0] ??
      /"([^"]*useState[^"]*)"/.exec(code)?.[1] ??
      ''

    expect(extract(first)).not.toBe(extract(second))
  })

  it('leaves a module without a component untouched', async () => {
    const output = await applyReactRefresh(
      'export const total = 1 + 1',
      '/project/src/x.ts',
    )
    expect(hasRegisteredComponent(output)).toBe(false)
  })

  it('does not break on an empty module', async () => {
    await expect(applyReactRefresh('', '/project/src/empty.ts')).resolves.toBeDefined()
  })
})

describe('preamble and epilogue', () => {
  it('saves then restores the global functions', () => {
    // Several modules evaluate in cascade: each must register its components
    // under its own identity, then hand back control.
    const preamble = refreshPreamble('/src/App.tsx')
    const epilogue = refreshEpilogue('/src/App.tsx')

    expect(preamble).toContain('const __odoroPrevReg = window.$RefreshReg$')
    expect(preamble).toContain('window.$RefreshReg$ =')
    expect(epilogue).toContain('window.$RefreshReg$ = __odoroPrevReg')
    expect(epilogue).toContain('window.$RefreshSig$ = __odoroPrevSig')
  })

  it('carries the module identity into the registrations', () => {
    expect(refreshPreamble('/src/App.tsx')).toContain('"/src/App.tsx"')
    expect(refreshEpilogue('/src/App.tsx')).toContain('"/src/App.tsx"')
  })

  it('reaches its own namespace through a self-import', () => {
    // It is the only way for a module to know its own exports; the instance
    // being already cached, no request is issued.
    expect(refreshEpilogue('/src/App.tsx')).toContain('import(import.meta.url)')
  })

  it('gives up the replacement when the boundary is invalid', () => {
    expect(refreshEpilogue('/src/App.tsx')).toContain(
      'import.meta.hot.invalidate(refusal)',
    )
  })
})

describe('runtime served to the browser', () => {
  it('bundles into a native module', async () => {
    const source = await bundleRefreshRuntime()
    expect(source.length).toBeGreaterThan(1000)
    expect(source).toContain('injectIntoGlobalHook')
  })

  it('exposes what the instrumented modules need', async () => {
    const source = await bundleRefreshRuntime()
    for (const name of [
      'register',
      'createSignature',
      'registerExports',
      'checkBoundary',
      'enqueueUpdate',
    ]) {
      expect(source).toMatch(new RegExp(`\\b${name}\\b`))
    }
  })

  it('reuses the bundle between two calls', async () => {
    const first = await bundleRefreshRuntime()
    const second = await bundleRefreshRuntime()
    expect(second).toBe(first)
  })
})

describe('injection into the document', () => {
  it('installs the hook before the reload client', () => {
    // The order is mandatory: the hook must exist before React is loaded,
    // otherwise React reports no component.
    const html = injectClient('<html><head></head><body></body></html>')
    expect(html.indexOf(REFRESH_RUNTIME_PATH)).toBeLessThan(
      html.indexOf('/@odoro/client'),
    )
  })

  it('places both tags in the head', () => {
    const html = injectClient('<html><head></head><body></body></html>')
    expect(html.indexOf(REFRESH_HTML_TAG)).toBeLessThan(html.indexOf('</head>'))
  })
})
