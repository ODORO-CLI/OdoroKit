/**
 * La generation a la demande.
 *
 * ## Ce que ces essais tiennent
 *
 * Produire un sous-ensemble est une operation dangereuse pour la meme raison
 * que l'elagage : ce qui manque ne leve aucune erreur, ne fait echouer aucun
 * essai d'application, et ne se voit qu'a l'oeil.
 *
 * Ils portent donc d'abord sur ce qui doit **toujours** etre produit — le bloc
 * de base — puis sur l'equivalence avec la feuille entiere : une classe
 * demandee doit arriver avec exactement la regle qu'elle aurait eue.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { generate, renderCssPour } from './generateur.js'

/** Les classes qu'une feuille definit. */
function classesDe(css: string): Set<string> {
  const trouvees = new Set<string>()
  for (const m of css.matchAll(/\.((?:\\.|[\w-])+)\{/g)) {
    trouvees.add((m[1] as string).replaceAll(/\\(.)/g, '$1'))
  }
  return trouvees
}

describe('le bloc de base', () => {
  it('est produit meme quand aucune classe n est demandee', () => {
    // Variables, preflight, images-cles : leur absence ne casse pas une regle,
    // elle casse la page entiere.
    const css = renderCssPour(new Set())

    expect(css).toContain('--o-spacing')
    expect(css).toContain('color-scheme')
    expect(css).toContain('@keyframes')
  })

  it('ne contient aucun utilitaire quand rien n est demande', () => {
    const utilitaires = [...classesDe(renderCssPour(new Set()))].filter((c) =>
      c.startsWith('o-'),
    )

    // Le preflight et les transitions de page peuvent nommer des classes ;
    // aucune ne doit venir d'une famille d'utilitaires.
    expect(utilitaires).toEqual([])
  })
})

describe('ce qui est demande', () => {
  it('arrive, et rien d autre', () => {
    const css = renderCssPour(new Set(['o-flex', 'o-hidden']))
    const classes = classesDe(css)

    expect(classes.has('o-flex')).toBe(true)
    expect(classes.has('o-hidden')).toBe(true)
    expect(classes.has('o-grid')).toBe(false)
  })

  it('arrive avec exactement la regle de la feuille entiere', () => {
    // C'est l'invariant qui compte : une generation partielle qui produirait
    // une declaration differente serait pire qu'une classe absente, parce que
    // la page s'afficherait — de travers.
    const entiere = generate('full').css
    const partielle = generate('full', new Set(['o-flex'])).css

    const regle = /\.o-flex\{[^}]*\}/
    expect(partielle.match(regle)?.[0]).toBe(entiere.match(regle)?.[0])
  })

  it('sert les variantes demandees', () => {
    const css = renderCssPour(new Set(['sm:o-grid']))

    expect(css).toContain('@media')
    expect(classesDe(css).has('sm:o-grid')).toBe(true)
    expect(classesDe(css).has('sm:o-flex')).toBe(false)
  })

  it('ignore une classe qui n existe pas', () => {
    // Le releveur du moteur ramasse tous les mots du code produit : la plupart
    // ne sont pas des classes. En reclamer une inconnue doit etre sans effet,
    // pas une erreur.
    expect(() => renderCssPour(new Set(['o-nawak', 'useState', 'div']))).not.toThrow()
  })
})

describe('le palier complet, gratuitement', () => {
  it('sert une teinte que la feuille de base n a jamais portee', () => {
    // Impensable avec une feuille pre-generee : imposer les 290 nuances a tout
    // projet ferait payer a chacun ce dont seuls quelques-uns ont besoin. A la
    // demande, la question ne se pose plus.
    const css = renderCssPour(new Set(['o-text-violet-500']))

    expect(classesDe(css).has('o-text-violet-500')).toBe(true)
    expect(classesDe(generate('core').css).has('o-text-violet-500')).toBe(false)
  })
})

describe('la taille', () => {
  it('tombe de plusieurs ordres de grandeur', () => {
    const entiere = renderCssPour(new Set())
    const quelques = renderCssPour(
      new Set(['o-flex', 'o-hidden', 'o-grid', 'sm:o-flex', 'o-text-violet-500']),
    )

    // Une poignee de classes ne doit couter que quelques centaines d'octets
    // au-dessus du bloc de base.
    expect(quelques.length - entiere.length).toBeLessThan(2_000)

    // Et l'ensemble doit rester sans commune mesure avec la feuille entiere.
    expect(quelques.length).toBeLessThan(generate('full').css.length / 20)
  })
})

describe('l integrite du systeme reste verifiee', () => {
  it('detecte un doublon meme quand la generation est filtree', () => {
    // Le controle porte sur l'integrite des tokens, pas sur le contenu de cette
    // generation-ci. Le filtrer laisserait passer un doublon reel simplement
    // parce que l'application du jour n'emploie pas les deux classes en
    // conflit — et le defaut n'apparaitrait que chez le projet suivant.
    //
    // On ne peut pas fabriquer un doublon sans toucher aux familles ; ce que
    // l'on verifie ici est que la liste complete des noms est toujours rendue,
    // c'est-a-dire que le controle a bien vu passer tout le systeme.
    const filtree = generate('full', new Set(['o-flex']))
    const entiere = generate('full')

    expect(filtree.classNames.length).toBe(entiere.classNames.length)
  })
})
