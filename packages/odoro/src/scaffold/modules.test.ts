import { describe, expect, it } from 'vitest'

import {
  MODULES,
  MODULES_PAR_DEFAUT,
  MODULE_IDS,
  gardeLesRoutes,
  lireModules,
  paquetsDe,
  resoudre,
  varianteDe,
} from './modules.js'

describe('le catalogue dit ce que chaque case fait', () => {
  it('coche les bibliotheques, le routeur et les icones', () => {
    expect(MODULES_PAR_DEFAUT).toEqual(['libs', 'router', 'icons'])
  })

  it('ne promet un paquet que pour ce qui en est un', () => {
    // Le routeur est un sous-chemin des bibliotheques, le registre se copie
    // par `odoro add` : ni l'un ni l'autre n'est une dependance.
    const avecPaquet = MODULES.filter((m) => m.paquet !== undefined).map((m) => m.id)
    expect(avecPaquet).toEqual(['libs', 'icons', 'engine'])
  })

  it('n annonce que des paquets de la famille', () => {
    for (const module of MODULES) {
      if (module.paquet === undefined) continue
      expect(module.paquet.startsWith('@odoro-cli/')).toBe(true)
    }
  })
})

describe('la resolution rend la selection coherente', () => {
  it('laisse passer une selection complete', () => {
    const { modules, avertissements } = resoudre(['libs', 'router', 'icons'])
    expect(modules).toEqual(['libs', 'router', 'icons'])
    expect(avertissements).toEqual([])
  })

  it('retire le routeur quand les bibliotheques partent, et le dit', () => {
    const { modules, avertissements } = resoudre(['router', 'icons'])
    expect(modules).toEqual(['icons'])
    expect(avertissements).toHaveLength(1)
    expect(avertissements[0]).toContain('@odoro-cli/libs/router')
  })

  it('rend toujours l ordre du catalogue, quelle que soit la saisie', () => {
    // Deux selections identiques doivent produire le meme manifeste : sans
    // ordre stable, l ordre de frappe se retrouverait dans le fichier.
    expect(resoudre(['icons', 'libs']).modules).toEqual(
      resoudre(['libs', 'icons']).modules,
    )
  })

  it('accepte une selection vide', () => {
    expect(resoudre([]).modules).toEqual([])
  })
})

describe('les paquets suivent la selection', () => {
  it('n ajoute rien pour le routeur, qui vient des bibliotheques', () => {
    expect(paquetsDe(['libs', 'router'])).toEqual(['@odoro-cli/libs'])
  })

  it('n ajoute rien pour le registre, qui se copie', () => {
    expect(paquetsDe(['registre'])).toEqual([])
  })

  it('ajoute le moteur quand il est retenu', () => {
    expect(paquetsDe(['libs', 'engine'])).toEqual([
      '@odoro-cli/libs',
      '@odoro-cli/engine',
    ])
  })
})

describe('la variante decoule des deux seuls choix qui touchent les fichiers', () => {
  it('garde le gabarit tel quel avec bibliotheques et routeur', () => {
    expect(varianteDe(['libs', 'router', 'icons'])).toBeUndefined()
  })

  it('pose la variante sans routeur', () => {
    expect(varianteDe(['libs', 'icons'])).toBe('sans-routeur')
  })

  it('pose la variante sans bibliotheques, routeur ou non', () => {
    expect(varianteDe(['icons'])).toBe('sans-libs')
    expect(varianteDe([])).toBe('sans-libs')
  })

  it('ne garde les routes que si le routeur est la', () => {
    expect(gardeLesRoutes(['libs', 'router'])).toBe(true)
    expect(gardeLesRoutes(['libs'])).toBe(false)
  })
})

describe('la lecture de --modules', () => {
  it('lit une liste separee par des virgules', () => {
    expect(lireModules('libs,router')).toEqual({ modules: ['libs', 'router'] })
  })

  it('tolere les espaces et les entrees vides', () => {
    expect(lireModules(' libs , , icons ')).toEqual({ modules: ['libs', 'icons'] })
  })

  it('comprend "aucun" comme un choix, et non comme une saisie vide', () => {
    expect(lireModules('aucun')).toEqual({ modules: [] })
  })

  it('refuse un nom inconnu en disant lesquels existent', () => {
    const lu = lireModules('libs,bits')
    expect(lu.erreur).toContain('"bits"')
    expect(lu.erreur).toContain(MODULE_IDS.join(', '))
  })
})
