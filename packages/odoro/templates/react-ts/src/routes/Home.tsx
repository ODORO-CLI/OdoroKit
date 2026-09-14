/**
 * La page d'accueil : le fond, puis les sections.
 *
 * Elle ne fait que les mettre bout a bout. Chaque section vit dans son propre
 * fichier, si bien qu'en retirer une, en ajouter une ou en changer l'ordre se
 * lit ici en une ligne.
 *
 * @module
 */

import type { ReactElement } from 'react'

import { Cloture } from '@/sections/Cloture'
import { Fond } from '@/sections/Fond'
import { Hero } from '@/sections/Hero'
import { Piliers } from '@/sections/Piliers'

/** Page d'accueil. */
export function Home(): ReactElement {
  return (
    <>
      <Fond />
      <Hero />
      <Piliers />
      <Cloture />
    </>
  )
}
