import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { ResolvedConfig } from '../config.js'
import { ModuleGraph, detectSelfAccepting } from './graph.js'
import { extractEntries, injectClient } from './server.js'
import {
  applyAlias,
  depFileName,
  fileToUrl,
  hasExtension,
  isBareSpecifier,
  urlToFile,
  wrapAsset,
  wrapStyle,
} from './transform.js'

const ROOT = process.platform === 'win32' ? 'C:\\projet' : '/projet'

/** Configuration minimale suffisante pour les fonctions testees. */
const config = {
  root: ROOT,
  alias: { '@': 'src' },
} as unknown as ResolvedConfig

describe('isBareSpecifier', () => {
  it.each(['react', 'react-dom/client', '@scope/paquet'])('reconnait %j', (specifier) => {
    expect(isBareSpecifier(specifier)).toBe(true)
  })

  it.each(['./App', '../lib', '/src/main.tsx', 'https://cdn/x.js', 'data:text/js,'])(
    'ecarte %j',
    (specifier) => {
      expect(isBareSpecifier(specifier)).toBe(false)
    },
  )
})

describe('hasExtension', () => {
  it('ignore la chaine de requete', () => {
    expect(hasExtension('/src/logo.svg?import', ['.svg'])).toBe(true)
  })

  it('est insensible a la casse', () => {
    expect(hasExtension('/src/App.CSS', ['.css'])).toBe(true)
  })

  it('refuse une extension differente', () => {
    expect(hasExtension('/src/App.tsx', ['.css'])).toBe(false)
  })
})

describe('applyAlias', () => {
  it('remplace un prefixe alias par un chemin absolu', () => {
    expect(applyAlias('@/routes/Home', config)).toBe(join(ROOT, 'src', 'routes', 'Home'))
  })

  it('remplace aussi le prefixe seul', () => {
    expect(applyAlias('@', config)).toBe(join(ROOT, 'src'))
  })

  it('laisse intact un specificateur sans alias', () => {
    expect(applyAlias('react', config)).toBe('react')
    expect(applyAlias('./voisin', config)).toBe('./voisin')
  })

  it('ne confond pas un prefixe avec un debut de nom', () => {
    expect(applyAlias('@scope/paquet', config)).toBe('@scope/paquet')
  })
})

describe('conversion entre chemins et URL', () => {
  it('fait l aller-retour pour un fichier du projet', () => {
    const file = join(ROOT, 'src', 'main.tsx')
    const url = fileToUrl(file, ROOT)
    expect(url).toBe('/src/main.tsx')
    expect(urlToFile(url, ROOT)).toBe(file)
  })

  it('retire la chaine de requete a la conversion inverse', () => {
    expect(urlToFile('/src/main.tsx?t=123', ROOT).endsWith('main.tsx')).toBe(true)
  })
})

describe('depFileName', () => {
  it.each([
    ['react', 'react.js'],
    ['react-dom/client', 'react-dom_client.js'],
    ['@scope/paquet', 'scope_paquet.js'],
    ['odoro-libs/router', 'odoro-libs_router.js'],
  ])('%j devient %j', (specifier, expected) => {
    expect(depFileName(specifier)).toBe(expected)
  })

  it('ne produit pas de collision entre deux paquets homonymes', () => {
    expect(depFileName('a/client')).not.toBe(depFileName('b/client'))
  })
})

describe('extractEntries', () => {
  it('trouve les scripts de type module', () => {
    const html = '<script type="module" src="/src/main.tsx"></script>'
    expect(extractEntries(html, ROOT)).toHaveLength(1)
  })

  it('ignore les scripts classiques et les scripts distants', () => {
    const html = [
      '<script src="/legacy.js"></script>',
      '<script type="module" src="https://cdn/x.js"></script>',
    ].join('')
    expect(extractEntries(html, ROOT)).toEqual([])
  })
})

describe('injectClient', () => {
  it('insere le client avant la fermeture de head', () => {
    const result = injectClient('<html><head><title>x</title></head><body></body></html>')
    expect(result).toContain('/@odoro/client')
    expect(result.indexOf('/@odoro/client')).toBeLessThan(result.indexOf('</head>'))
  })

  it('se replie en tete de document si head est absent', () => {
    expect(injectClient('<div></div>').startsWith('<script')).toBe(true)
  })
})

describe('enveloppes de modules', () => {
  it('produit un module qui injecte la feuille et accepte les mises a jour', () => {
    const module = wrapStyle('/src/App.css', 'body{margin:0}')
    expect(module).toContain('document.createElement')
    expect(module).toContain('import.meta.hot?.accept()')
    expect(module).toContain(JSON.stringify('body{margin:0}'))
  })

  it('produit un module exportant l URL d une ressource', () => {
    expect(wrapAsset('/src/logo.svg')).toBe('export default "/src/logo.svg"\n')
  })
})

describe('detectSelfAccepting', () => {
  it.each([
    'import.meta.hot.accept()',
    'import.meta.hot?.accept()',
    'import.meta.hot.accept((module) => {})',
    'import . meta . hot . accept (  )',
  ])('reconnait %j', (source) => {
    expect(detectSelfAccepting(source)).toBe(true)
  })

  it('ne se declenche pas sur un module ordinaire', () => {
    expect(detectSelfAccepting('const accept = () => {}')).toBe(false)
    expect(detectSelfAccepting('import.meta.env.DEV')).toBe(false)
  })
})

describe('ModuleGraph', () => {
  it('cree un module puis le retrouve', () => {
    const graph = new ModuleGraph()
    const node = graph.ensure('/a.ts', '/a.ts')
    expect(graph.ensure('/a.ts', '/a.ts')).toBe(node)
    expect(graph.get('/a.ts')).toBe(node)
    expect(graph.size).toBe(1)
  })

  it('tient a jour les relations inverses', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    graph.ensure('/b.ts', '/b.ts')

    graph.setDependencies('/a.ts', ['/b.ts'])
    expect(graph.get('/b.ts')?.importers.has('/a.ts')).toBe(true)

    graph.setDependencies('/a.ts', [])
    expect(graph.get('/b.ts')?.importers.has('/a.ts')).toBe(false)
  })

  it('signale un rechargement complet quand rien n accepte', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    expect(graph.invalidate('/a.ts')).toEqual([])
  })

  it('retourne le module lui-meme s il accepte ses mises a jour', () => {
    const graph = new ModuleGraph()
    const node = graph.ensure('/style.css', '/style.css')
    node.selfAccepting = true

    const boundaries = graph.invalidate('/style.css')
    expect(boundaries).toEqual([node])
  })

  it('remonte jusqu a la premiere frontiere qui accepte', () => {
    const graph = new ModuleGraph()
    graph.ensure('/feuille.ts', '/feuille.ts')
    const middle = graph.ensure('/milieu.ts', '/milieu.ts')
    graph.ensure('/racine.ts', '/racine.ts')

    graph.setDependencies('/milieu.ts', ['/feuille.ts'])
    graph.setDependencies('/racine.ts', ['/milieu.ts'])
    middle.selfAccepting = true

    expect(graph.invalidate('/feuille.ts')).toEqual([middle])
  })

  it('exige un rechargement si une seule branche n accepte pas', () => {
    const graph = new ModuleGraph()
    graph.ensure('/feuille.ts', '/feuille.ts')
    const accepting = graph.ensure('/a.ts', '/a.ts')
    graph.ensure('/b.ts', '/b.ts')

    graph.setDependencies('/a.ts', ['/feuille.ts'])
    graph.setDependencies('/b.ts', ['/feuille.ts'])
    accepting.selfAccepting = true

    expect(graph.invalidate('/feuille.ts')).toEqual([])
  })

  it('invalide le code en cache et avance l horodatage', () => {
    const graph = new ModuleGraph()
    const node = graph.ensure('/a.ts', '/a.ts')
    node.code = 'ancien'
    node.selfAccepting = true

    graph.invalidate('/a.ts')
    expect(node.code).toBeUndefined()
  })

  it('supporte un cycle d imports sans boucler', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    graph.ensure('/b.ts', '/b.ts')
    graph.setDependencies('/a.ts', ['/b.ts'])
    graph.setDependencies('/b.ts', ['/a.ts'])

    expect(() => graph.invalidate('/a.ts')).not.toThrow()
  })

  it('oublie tout apres nettoyage', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    graph.clear()
    expect(graph.size).toBe(0)
  })
})
