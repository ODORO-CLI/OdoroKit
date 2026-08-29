/**
 * Le contrat des jeux d'icones.
 *
 * Onze mille icones ne se relisent pas. Ce qui peut casser sans qu'on le voie
 * est mecanique : un trace vide, un mode incoherent, une boite absente, un
 * attribut de couleur qui aurait survecu a l'importation et figerait l'icone
 * en noir quel que soit le texte autour.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import catalogue from '../src/catalogue.json' with { type: 'json' }
import * as classique from '../src/jeux/classique.js'
import * as compact from '../src/jeux/compact.js'
import * as etendu from '../src/jeux/etendu.js'
import * as filaire from '../src/jeux/filaire.js'
import * as marques from '../src/jeux/marques.js'
import type { IconData } from '../src/types.js'

const JEUX = { filaire, compact, classique, etendu, marques }

/** Attributs qui figeraient l'apparence : aucun ne doit survivre a l'import. */
const INTERDITS = ['fill', 'stroke', 'stroke-width', 'class', 'style', 'color']

for (const [nom, jeu] of Object.entries(JEUX)) {
  describe(nom, () => {
    const icones = Object.entries(jeu).filter(
      ([cle]) => cle !== 'INFO' && cle !== 'NAMES',
    ) as readonly (readonly [string, IconData])[]

    it('annonce le nombre d icones qu il contient', () => {
      expect(icones.length).toBe(jeu.INFO.count)
      expect(icones.length).toBe(
        (catalogue as Record<string, { names: string[] }>)[nom]?.names.length,
      )
    })

    it('nomme chaque icone une fois et une seule', () => {
      const noms = Object.values(jeu.NAMES)
      expect(Object.keys(jeu.NAMES).sort()).toEqual(icones.map(([cle]) => cle).sort())
      // Deux icones qui porteraient le meme nom rendraient la recherche
      // ambigue : on croirait avoir trouve la bonne.
      expect(new Set(noms).size).toBe(noms.length)
    })

    it('donne a chaque icone une boite et au moins un noeud', () => {
      for (const [cle, icone] of icones) {
        expect(icone.box, cle).toMatch(/^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/)
        expect(icone.nodes.length, cle).toBeGreaterThan(0)
      }
    })

    it('emploie le mode declare par le jeu', () => {
      for (const [cle, icone] of icones) {
        expect(icone.mode, cle).toBe(jeu.INFO.mode)
        // Une epaisseur sur un glyphe plein n'aurait aucun effet : sa presence
        // signalerait que le mode a ete mal deduit.
        if (icone.mode === 'plein') expect(icone.stroke, cle).toBeUndefined()
        else expect(icone.stroke, cle).toBeGreaterThan(0)
      }
    })

    it('ne conserve aucun attribut qui figerait l apparence', () => {
      for (const [cle, icone] of icones) {
        for (const [, attributs] of icone.nodes) {
          for (const interdit of INTERDITS) {
            expect(Object.keys(attributs), `${cle} / ${interdit}`).not.toContain(interdit)
          }
        }
      }
    })
  })
}
