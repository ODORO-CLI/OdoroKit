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
  it.each(['/projet/src/App.tsx', '/projet/src/hook.ts', 'C:\\projet\\src\\Page.jsx'])(
    'retient %j',
    (file) => {
      expect(isRefreshCandidate(file)).toBe(true)
    },
  )

  it('ecarte le code des dependances', () => {
    // Il est deja compile, ne change pas pendant une session, et l'instrumenter
    // ne ferait que ralentir le demarrage.
    expect(isRefreshCandidate('/projet/node_modules/react/index.js')).toBe(false)
    expect(isRefreshCandidate('C:\\projet\\node_modules\\x\\a.tsx')).toBe(false)
  })

  it('ecarte les fichiers sans code', () => {
    expect(isRefreshCandidate('/projet/src/App.css')).toBe(false)
    expect(isRefreshCandidate('/projet/public/logo.svg')).toBe(false)
  })
})

describe('applyReactRefresh', () => {
  const composant = `
    import { useState } from "react";
    export function Compteur() {
      const [n, setN] = useState(0);
      return null;
    }
  `

  it('enregistre le composant sous une identite stable', async () => {
    const output = await applyReactRefresh(composant, '/projet/src/Compteur.tsx')
    expect(hasRegisteredComponent(output)).toBe(true)
    expect(output).toContain('Compteur')
  })

  it('calcule une signature des hooks utilises', async () => {
    // Sans elle, ajouter un hook a un composant monte ferait planter React sur
    // « Rendered more hooks than during the previous render ».
    const output = await applyReactRefresh(composant, '/projet/src/Compteur.tsx')
    expect(output).toContain('$RefreshSig$')
  })

  it('produit une signature differente quand les hooks changent', async () => {
    const avec = composant.replace(
      'const [n, setN] = useState(0);',
      'const [n, setN] = useState(0); const [m] = useState(1);',
    )

    const premier = await applyReactRefresh(composant, '/projet/src/Compteur.tsx')
    const second = await applyReactRefresh(avec, '/projet/src/Compteur.tsx')

    const extraire = (code: string): string =>
      /_s\(\)\s*\{[\s\S]*?\}/.exec(code)?.[0] ??
      /"([^"]*useState[^"]*)"/.exec(code)?.[1] ??
      ''

    expect(extraire(premier)).not.toBe(extraire(second))
  })

  it('laisse un module sans composant intact', async () => {
    const output = await applyReactRefresh(
      'export const total = 1 + 1',
      '/projet/src/x.ts',
    )
    expect(hasRegisteredComponent(output)).toBe(false)
  })

  it('ne casse pas sur un module vide', async () => {
    await expect(applyReactRefresh('', '/projet/src/vide.ts')).resolves.toBeDefined()
  })
})

describe('preambule et epilogue', () => {
  it('sauvegarde puis restaure les fonctions globales', () => {
    // Plusieurs modules s'evaluent en cascade : chacun doit enregistrer ses
    // composants sous sa propre identite, puis rendre la main.
    const preamble = refreshPreamble('/src/App.tsx')
    const epilogue = refreshEpilogue('/src/App.tsx')

    expect(preamble).toContain('const __odoroPrevReg = window.$RefreshReg$')
    expect(preamble).toContain('window.$RefreshReg$ =')
    expect(epilogue).toContain('window.$RefreshReg$ = __odoroPrevReg')
    expect(epilogue).toContain('window.$RefreshSig$ = __odoroPrevSig')
  })

  it('porte l identite du module dans les enregistrements', () => {
    expect(refreshPreamble('/src/App.tsx')).toContain('"/src/App.tsx"')
    expect(refreshEpilogue('/src/App.tsx')).toContain('"/src/App.tsx"')
  })

  it('accede a son propre espace de noms par auto-import', () => {
    // C'est le seul moyen pour un module de connaitre ses propres exports ;
    // l'instance etant deja en cache, aucune requete n'est emise.
    expect(refreshEpilogue('/src/App.tsx')).toContain('import(import.meta.url)')
  })

  it('renonce au remplacement quand la frontiere est invalide', () => {
    expect(refreshEpilogue('/src/App.tsx')).toContain('import.meta.hot.invalidate(refus)')
  })
})

describe('runtime servi au navigateur', () => {
  it('se compile en module natif', async () => {
    const source = await bundleRefreshRuntime()
    expect(source.length).toBeGreaterThan(1000)
    expect(source).toContain('injectIntoGlobalHook')
  })

  it('expose ce dont les modules instrumentes ont besoin', async () => {
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

  it('reutilise la compilation entre deux appels', async () => {
    const premier = await bundleRefreshRuntime()
    const second = await bundleRefreshRuntime()
    expect(second).toBe(premier)
  })
})

describe('injection dans le document', () => {
  it('installe le crochet avant le client de rechargement', () => {
    // L'ordre est imperatif : le crochet doit exister avant que React ne soit
    // charge, sinon React ne signale aucun composant.
    const html = injectClient('<html><head></head><body></body></html>')
    expect(html.indexOf(REFRESH_RUNTIME_PATH)).toBeLessThan(
      html.indexOf('/@odoro/client'),
    )
  })

  it('place les deux balises dans l en-tete', () => {
    const html = injectClient('<html><head></head><body></body></html>')
    expect(html.indexOf(REFRESH_HTML_TAG)).toBeLessThan(html.indexOf('</head>'))
  })
})
