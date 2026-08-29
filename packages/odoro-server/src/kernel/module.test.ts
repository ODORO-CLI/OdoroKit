/**
 * L'ordonnancement des modules.
 *
 * Trois defauts doivent echouer au demarrage plutot qu'a la premiere requete :
 * une dependance absente, un cycle, et un module qui exige du moteur une
 * capacite qu'il n'a pas. Chacun se manifeste sinon a l'usage, sur un chemin
 * rare, avec un message qui ne dit pas d'ou il vient.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { ModuleError, assertCapabilities, defineModule, orderModules } from './module.js'
import { findOpenMutations, type RouteDefinition } from './http/route.js'

/** Un module reduit a son nom et a ses dependances. */
function mod(name: string, requires: readonly string[] = []) {
  return defineModule({ name, requires }) as never
}

describe('ordre de chargement', () => {
  it('place une dependance avant celui qui la requiert', () => {
    const ordre = orderModules([mod('account', ['auth']), mod('auth')])
    expect(ordre.map((m) => m.name)).toEqual(['auth', 'account'])
  })

  it('resout une chaine complete', () => {
    const ordre = orderModules([
      mod('notifications', ['account']),
      mod('account', ['auth']),
      mod('auth'),
    ])
    expect(ordre.map((m) => m.name)).toEqual(['auth', 'account', 'notifications'])
  })

  it('accepte un losange', () => {
    // `audit` atteint deux fois par des chemins differents n'est pas un cycle,
    // et c'est la distinction que le troisieme etat du parcours permet.
    const ordre = orderModules([
      mod('account', ['audit']),
      mod('files', ['audit']),
      mod('audit'),
    ]).map((m) => m.name)

    expect(ordre.indexOf('audit')).toBeLessThan(ordre.indexOf('account'))
    expect(ordre.indexOf('audit')).toBeLessThan(ordre.indexOf('files'))
    expect(ordre).toHaveLength(3)
  })

  it('produit le meme ordre a chaque appel', () => {
    // Un ordre qui varie rend irreproductible tout defaut qui en depend.
    const modules = [mod('c', ['a', 'b']), mod('b', ['a']), mod('a')]
    const premier = orderModules(modules).map((m) => m.name)
    const second = orderModules(modules).map((m) => m.name)
    expect(premier).toEqual(second)
  })
})

describe('refus au demarrage', () => {
  it('nomme la dependance absente et ce qui est active', () => {
    expect(() => orderModules([mod('account', ['auth'])])).toThrow(
      /"account" requiert "auth", qui n'est pas active/,
    )
  })

  it('montre le chemin d un cycle', () => {
    expect(() =>
      orderModules([mod('a', ['b']), mod('b', ['c']), mod('c', ['a'])]),
    ).toThrow(/Cycle entre modules : a -> b -> c -> a/)
  })

  it('refuse deux modules de meme nom', () => {
    expect(() => orderModules([mod('auth'), mod('auth')])).toThrow(
      /Deux modules portent le nom "auth"/,
    )
  })

  it('leve une ModuleError et non une erreur generique', () => {
    expect(() => orderModules([mod('a', ['inconnu'])])).toThrow(ModuleError)
  })
})

describe('capacites du moteur', () => {
  const recherche = defineModule({
    name: 'recherche',
    requiresCapabilities: ['fullText', 'jsonb'],
  }) as never

  it('laisse passer quand le dialecte les offre', () => {
    expect(() =>
      assertCapabilities([recherche], { fullText: true, jsonb: true }, 'postgres'),
    ).not.toThrow()
  })

  it('nomme le module, la capacite et le dialecte', () => {
    // Les trois sont necessaires : sans le module on ne sait pas quoi
    // desactiver, sans la capacite on ne sait pas pourquoi, et sans le
    // dialecte on ne sait pas s'il faut changer de moteur.
    expect(() =>
      assertCapabilities([recherche], { fullText: false, jsonb: true }, 'sqlite'),
    ).toThrow(/"recherche".*"fullText".*sqlite/s)
  })

  it('rapporte toutes les capacites manquantes', () => {
    try {
      assertCapabilities([recherche], {}, 'sqlite')
      expect.unreachable('les capacites auraient du etre refusees')
    } catch (error) {
      expect((error as Error).message).toContain('fullText')
      expect((error as Error).message).toContain('jsonb')
    }
  })
})

describe('routes mutatives publiques', () => {
  /** Une route reduite a ce que l'inspection regarde. */
  const r = (
    name: string,
    method: RouteDefinition['method'],
    auth: RouteDefinition['auth'],
    policy?: string,
  ): RouteDefinition => ({
    name,
    method,
    path: `/${name}`,
    auth,
    ...(policy === undefined ? {} : { policy }),
    handler: () => undefined,
  })

  it('signale une route mutative laissee publique', () => {
    // Le defaut que cette inspection existe pour attraper : ces routes ne se
    // distinguent des autres que par l'absence d'un champ, et se cherchent
    // donc a l'oeil sans jamais se trouver.
    const trouvees = findOpenMutations([
      r('account.delete', 'DELETE', 'public'),
      r('account.read', 'GET', 'public'),
      r('account.update', 'PATCH', 'required'),
    ])

    expect(trouvees.map((route) => route.name)).toEqual(['account.delete'])
  })

  it('ne signale pas une route publique qui declare une politique', () => {
    // Une inscription ou une demande de reinitialisation sont legitimement
    // publiques et mutatives : la politique declaree dit que c'est voulu.
    expect(
      findOpenMutations([r('auth.register', 'POST', 'public', 'auth.register')]),
    ).toEqual([])
  })
})
