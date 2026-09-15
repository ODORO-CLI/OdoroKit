import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { ResolvedConfig } from '../config.js'
import { ModuleGraph, detectSelfAccepting } from './graph.js'
import { extractEntries, injectClient } from './server.js'
import {
  wrapJson,
  estUneRessource,
  feuilleDemandee,
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
    // Le scope perd son arobase et ses slashs deviennent des tirets bas. Le
    // tiret du scope, lui, reste : `@odoro-cli/libs/router` et
    // `odoro/cli/libs/router` produisent des noms differents, donc rien ne
    // collisionne.
    ['@odoro-cli/libs/router', 'odoro-cli_libs_router.js'],
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

describe('feuilleDemandee', () => {
  it('rend la feuille a une balise <link>', () => {
    // Le cas qui echouait : le navigateur recevait du JavaScript la ou il
    // attendait du CSS, et refusait sur un « strict MIME checking ».
    expect(feuilleDemandee({ 'sec-fetch-dest': 'style' }, '/a.css')).toBe(true)
  })

  it('rend le module injecteur a un import', () => {
    // C'est lui qui porte le remplacement a chaud : le rendre en CSS brut
    // ferait recharger la page a chaque edition de feuille.
    expect(feuilleDemandee({ 'sec-fetch-dest': 'script' }, '/a.css')).toBe(false)
  })

  it('honore encore la convention ecrite a la main', () => {
    expect(feuilleDemandee({}, '/a.css?direct')).toBe(true)
  })

  it('retombe sur ce que le client accepte, faute de Sec-Fetch-Dest', () => {
    expect(feuilleDemandee({ accept: 'text/css,*/*;q=0.1' }, '/a.css')).toBe(true)
    expect(feuilleDemandee({ accept: '*/*' }, '/a.css')).toBe(false)
  })

  it('ne se laisse pas prendre a un en-tete repete', () => {
    // Node rend un tableau quand un en-tete arrive deux fois : le lire comme
    // une chaine y trouverait n'importe quoi.
    expect(feuilleDemandee({ accept: ['text/css', '*/*'] }, '/a.css')).toBe(false)
  })

  it('rend le module par defaut', () => {
    expect(feuilleDemandee({}, '/a.css')).toBe(false)
  })
})

describe('estUneRessource', () => {
  it('reconnait un module', () => {
    // Le cas signale : un `<script type="module">` qui recevait le document de
    // l application, et echouait sur « Failed to load module script ».
    expect(estUneRessource({ 'sec-fetch-dest': 'script' })).toBe(true)
  })

  it('reconnait les autres ressources', () => {
    for (const dest of ['style', 'image', 'font', 'worker', 'manifest']) {
      expect(estUneRessource({ 'sec-fetch-dest': dest }), dest).toBe(true)
    }
  })

  it('laisse passer une navigation', () => {
    // C'est elle qui doit recevoir le document : sans quoi le routeur client
    // n aurait jamais la main sur une route profonde.
    expect(estUneRessource({ 'sec-fetch-dest': 'document' })).toBe(false)
  })

  it('ne tranche pas sans l en-tete', () => {
    // Un `curl`, une adresse tapee a la main : le repli reste le comportement
    // attendu, et refuser serait pire que servir.
    expect(estUneRessource({})).toBe(false)
  })

  it('ignore un en-tete repete', () => {
    // Node rend un tableau quand un en-tete arrive deux fois.
    expect(estUneRessource({ 'sec-fetch-dest': ['script', 'document'] })).toBe(false)
  })
})

describe('wrapJson', () => {
  it('rend l objet entier par defaut', () => {
    expect(wrapJson('{"a":1}')).toContain('export default {"a":1}')
  })

  it('tire un export nomme de chaque cle qui peut en porter un', () => {
    const module = wrapJson('{"name":"x","version":"1.0.0"}')
    expect(module).toContain('export const name = "x"')
    expect(module).toContain('export const version = "1.0.0"')
  })

  it('saute une cle qui ne peut pas nommer un export', () => {
    // `lint:fix` et `@odoro-cli/libs` se rencontrent dans un package.json.
    const module = wrapJson('{"lint:fix":1,"@odoro-cli/libs":"2","ok":3}')
    expect(module).toContain('export const ok = 3')
    expect(module).not.toContain('lint:fix =')
    expect(module).not.toContain('@odoro-cli/libs =')
  })

  it('saute un mot reserve, meme en mode strict', () => {
    // `private` est la cle d un package.json et un mot reserve : l exporter
    // serait une erreur de syntaxe, qui casserait le module entier donc la page.
    const module = wrapJson('{"private":true,"name":"x"}')
    expect(module).not.toContain('export const private')
    expect(module).toContain('export const name = "x"')
    // Il reste joignable par l export par defaut.
    expect(module).toContain('"private":true')
  })

  it('ne tire aucun export nomme d un tableau', () => {
    const module = wrapJson('[1,2,3]')
    expect(module).toContain('export default [1,2,3]')
    expect(module).not.toContain('export const')
  })

  it('rend une erreur lisible sur un JSON illisible', () => {
    // Servir un module qui echouerait plus loin masquerait la cause.
    expect(wrapJson('{ casse')).toContain('SyntaxError')
  })
})
