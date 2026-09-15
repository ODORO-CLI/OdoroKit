/**
 * The contract of the icon packs.
 *
 * Eleven thousand icons cannot be proofread. What can break without being
 * noticed is mechanical: an empty drawing, an inconsistent mode, a missing
 * box, a color attribute that survived the import and would freeze the icon in
 * black whatever the text around it.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import catalogue from '../src/catalogue.json' with { type: 'json' }
import * as brands from '../src/packs/brands.js'
import * as classic from '../src/packs/classic.js'
import * as compact from '../src/packs/compact.js'
import * as extended from '../src/packs/extended.js'
import * as outline from '../src/packs/outline.js'
import type { IconData } from '../src/types.js'

const PACKS = { outline, compact, classic, extended, brands }

/** Attributes that would freeze the look: none may survive the import. */
const FORBIDDEN = ['fill', 'stroke', 'stroke-width', 'class', 'style', 'color']

for (const [name, pack] of Object.entries(PACKS)) {
  describe(name, () => {
    const icons = Object.entries(pack).filter(
      ([key]) => key !== 'INFO' && key !== 'NAMES',
    ) as readonly (readonly [string, IconData])[]

    it('announces the number of icons it holds', () => {
      expect(icons.length).toBe(pack.INFO.count)
      expect(icons.length).toBe(
        (catalogue as Record<string, { names: string[] }>)[name]?.names.length,
      )
    })

    it('names each icon once and only once', () => {
      const names = Object.values(pack.NAMES)
      expect(Object.keys(pack.NAMES).sort()).toEqual(icons.map(([key]) => key).sort())
      // Two icons carrying the same name would make search ambiguous: one
      // would believe the right one had been found.
      expect(new Set(names).size).toBe(names.length)
    })

    it('gives each icon a box and at least one node', () => {
      for (const [key, icon] of icons) {
        expect(icon.box, key).toMatch(/^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/)
        expect(icon.nodes.length, key).toBeGreaterThan(0)
      }
    })

    it('uses the mode declared by the pack', () => {
      for (const [key, icon] of icons) {
        expect(icon.mode, key).toBe(pack.INFO.mode)
        // A weight on a solid glyph would have no effect: its presence would
        // signal that the mode had been wrongly deduced.
        if (icon.mode === 'solid') expect(icon.stroke, key).toBeUndefined()
        else expect(icon.stroke, key).toBeGreaterThan(0)
      }
    })

    it('keeps no attribute that would freeze the look', () => {
      for (const [key, icon] of icons) {
        for (const [, attributes] of icon.nodes) {
          for (const forbidden of FORBIDDEN) {
            expect(Object.keys(attributes), `${key} / ${forbidden}`).not.toContain(
              forbidden,
            )
          }
        }
      }
    })
  })
}
