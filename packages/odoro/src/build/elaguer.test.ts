/**
 * L'elagage, et surtout ce qu'il refuse de retirer.
 *
 * ## Ce que ces essais tiennent
 *
 * Un elagueur se juge sur ses faux negatifs. Garder une regle de trop coute
 * quelques octets ; en retirer une de trop casse l'affichage — et ce defaut-la
 * ne leve aucune erreur, ne fait echouer aucun essai de l'application, et ne se
 * voit qu'a l'oeil, page par page, longtemps apres.
 *
 * Les essais portent donc d'abord sur ce qui doit survivre : les variables, la
 * remise a zero, les classes semantiques, les selecteurs a virgules, et les
 * classes que seuls les composants de bibliotheque emploient.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { classesDe, decouperSelecteurs, elaguer, motsDe } from './elaguer.js'

/** Elague et rend le CSS, pour alleger les essais. */
function css(feuille: string, sources: string[], options = {}): string {
  return elaguer(feuille, sources, options).css
}

describe('les classes d un selecteur', () => {
  it('desechappe les variantes', () => {
    // `.sm\:o-block` designe la classe `sm:o-block`. Comparer sans desechapper
    // ne trouverait jamais de correspondance, et l'elagage retirerait tout.
    expect(classesDe('.sm\\:o-block')).toEqual(['sm:o-block'])
    expect(classesDe('.o-w-1\\/2')).toEqual(['o-w-1/2'])
  })

  it('trouve les classes multiples et descendantes', () => {
    expect(classesDe('.o-a.o-b')).toEqual(['o-a', 'o-b'])
    expect(classesDe('.dark .o-bg-x')).toEqual(['dark', 'o-bg-x'])
  })

  it('ne confond pas un point de decimale avec une classe', () => {
    expect(classesDe(':root')).toEqual([])
    expect(classesDe('*, *::before')).toEqual([])
  })
})

describe('le decoupage des selecteurs', () => {
  it('coupe sur les virgules de premier niveau', () => {
    expect(decouperSelecteurs('.a, .b , .c')).toEqual(['.a', '.b', '.c'])
  })

  it('ne coupe pas dans une pseudo-classe fonctionnelle', () => {
    // Couper dans `:is(a, b)` produirait deux selecteurs tronques, donc
    // invalides, donc ignores par le navigateur — une regle perdue en silence.
    expect(decouperSelecteurs(':is(.a, .b) .c')).toEqual([':is(.a, .b) .c'])
    expect(decouperSelecteurs('.x:not(.a, .b), .y')).toEqual(['.x:not(.a, .b)', '.y'])
  })

  it('ne coupe pas dans un attribut ni dans une chaine', () => {
    expect(decouperSelecteurs('[data-x="a,b"], .y')).toEqual(['[data-x="a,b"]', '.y'])
  })
})

describe('ce qui n est jamais elague', () => {
  it('garde les variables', () => {
    const sortie = css(':root{--o-space-1:4px}\n.o-flex{display:flex}', ['rien'])
    expect(sortie).toContain('--o-space-1')
  })

  it('garde la remise a zero', () => {
    const sortie = css('*,*::before{box-sizing:border-box}\n.o-flex{display:flex}', [''])
    expect(sortie).toContain('box-sizing')
  })

  it('garde les classes semantiques de l application', () => {
    // Elles ne portent pas le prefixe : l'elagueur n'a aucune raison de croire
    // qu'il les a generees, et ne doit donc pas y toucher.
    const sortie = css('.legal__p{margin:1rem}\n.o-flex{display:flex}', [''])
    expect(sortie).toContain('legal__p')
  })

  it('garde les @keyframes sans les traverser', () => {
    // Leur corps ressemble a des regles (`from`, `50%`) sans en etre : le
    // traverser reviendrait a elaguer des etapes d animation.
    const sortie = css('@keyframes o-spin{from{transform:rotate(0)}}', [''])
    expect(sortie).toContain('@keyframes o-spin')
    expect(sortie).toContain('rotate(0)')
  })

  it('garde une regle dont toutes les classes servent', () => {
    expect(css('.o-a.o-b{color:red}', ['o-a o-b'])).toContain('color:red')
  })
})

describe('ce qui est elague', () => {
  it('retire un utilitaire que rien n emploie', () => {
    const sortie = css('.o-flex{display:flex}\n.o-grid{display:grid}', ['o-flex'])
    expect(sortie).toContain('display:flex')
    expect(sortie).not.toContain('display:grid')
  })

  it('retire une regle des qu une seule de ses classes manque', () => {
    // `.o-a.o-b` ne s applique qu aux elements portant les deux : la garder
    // sans que `o-b` existe serait garder du poids inutile.
    expect(css('.o-a.o-b{color:red}', ['o-a'])).not.toContain('color:red')
  })

  it('ne garde que les selecteurs utiles d une liste', () => {
    const sortie = css('.o-flex,.o-grid{margin:0}', ['o-flex'])
    expect(sortie).toContain('.o-flex')
    expect(sortie).not.toContain('.o-grid')
  })

  it('retire les media devenus vides', () => {
    // Sans cela, une feuille elaguee laisserait des milliers de
    // `@media(...){}`.
    const sortie = css('@media (min-width:640px){.sm\\:o-grid{display:grid}}', [''])
    expect(sortie).not.toContain('@media')
  })

  it('garde un media dont un enfant survit', () => {
    const sortie = css(
      '@media (min-width:640px){.sm\\:o-grid{display:grid}\n.sm\\:o-flex{display:flex}}',
      ['sm:o-flex'],
    )
    expect(sortie).toContain('@media')
    expect(sortie).toContain('display:flex')
    expect(sortie).not.toContain('display:grid')
  })
})

describe('les sources lues', () => {
  it('trouvent une classe que seul un composant de bibliotheque emploie', () => {
    // Le piege central. L application n ecrit aucune classe utilitaire ; son
    // bouton en porte. Lire la source de l application seule elaguerait tout ce
    // dont ses composants ont besoin, sans lever la moindre erreur.
    const jsProduit = 'var Button=({size:e})=>o("button",{className:"o-h-10 o-px-4"})'
    const sortie = css('.o-h-10{height:2.5rem}\n.o-h-12{height:3rem}', [jsProduit])

    expect(sortie).toContain('2.5rem')
    expect(sortie).not.toContain('3rem')
  })

  it('trouvent une classe a variante dans une chaine', () => {
    const sortie = css('@media (min-width:640px){.sm\\:o-flex{display:flex}}', [
      'className="sm:o-flex"',
    ])
    expect(sortie).toContain('display:flex')
  })
})

describe('la liste de sauvegarde', () => {
  it('garde une classe assemblee a l execution', () => {
    // `o-text-${couleur}` n existe nulle part sous sa forme finale : aucun
    // analyseur ne peut la deviner, et c est la limite assumee du procede.
    const feuille = '.o-text-rouge{color:red}\n.o-text-bleu{color:blue}'

    expect(css(feuille, [''])).toBe('')
    expect(css(feuille, [''], { sauvegarde: [/^o-text-/] })).toContain('color:red')
    expect(css(feuille, [''], { sauvegarde: ['o-text-bleu'] })).toContain('color:blue')
  })
})

describe('l analyse resiste', () => {
  it('a une accolade dans une chaine', () => {
    // Un decoupage naif deraperait ici et tronquerait la feuille au milieu
    // d une regle.
    const sortie = css('.o-avant::before{content:"}"}\n.o-flex{display:flex}', [
      'o-avant o-flex',
    ])
    expect(sortie).toContain('display:flex')
    expect(sortie).toContain('content:"}"')
  })

  it('a une accolade dans un commentaire', () => {
    const sortie = css('/* } */\n.o-flex{display:flex}', ['o-flex'])
    expect(sortie).toContain('display:flex')
  })

  it('a des media imbriques', () => {
    const sortie = css('@media screen{@supports (display:grid){.o-grid{display:grid}}}', [
      'o-grid',
    ])
    expect(sortie).toContain('display:grid')
    expect(sortie).toContain('@supports')
  })

  it('garde les regles sans corps', () => {
    const sortie = css('@charset "utf-8";\n.o-flex{display:flex}', ['o-flex'])
    expect(sortie).toContain('@charset')
  })
})

describe('le rapport', () => {
  it('compte ce qui est garde et ce qui part', () => {
    const rapport = elaguer('.o-a{color:red}\n.o-b{color:blue}\n.o-c{color:green}', [
      'o-a o-b',
    ])

    expect(rapport.gardees).toBe(2)
    expect(rapport.retirees).toBe(1)
    expect(rapport.octetsApres).toBeLessThan(rapport.octetsAvant)
  })
})

describe('l extraction des mots', () => {
  it('reconnait les formes qu une classe peut prendre', () => {
    const mots = motsDe('"hover:o-bg-x o-w-1/2 o-p-[3px]"')
    expect(mots.has('hover:o-bg-x')).toBe(true)
    expect(mots.has('o-w-1/2')).toBe(true)
    expect(mots.has('o-p-[3px]')).toBe(true)
  })
})
