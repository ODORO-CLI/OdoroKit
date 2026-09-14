import type { ReactElement } from 'react'

import { Marque } from '@/composants/Marque'
import { Cloture } from '@/sections/Cloture'
import { Fond } from '@/sections/Fond'
import { Hero } from '@/sections/Hero'
import { Piliers } from '@/sections/Piliers'

/**
 * Racine de l'application.
 *
 * Les bibliotheques Odoro n'ont pas ete retenues a la creation : pas de
 * classes `o-*`, pas de jetons, pas de routeur. Le dessin est celui de la
 * version complete, porte par `styles.css` en CSS ordinaire.
 *
 * Pour les ajouter plus tard : `npm i @odoro-cli/libs`, puis importer
 * `@odoro-cli/libs/styles.css` dans `main.tsx`.
 */
export function App(): ReactElement {
  return (
    <div className="app-shell">
      <nav className="nav">
        <Marque />
        <a href="https://odoro.dev" target="_blank" rel="noreferrer" className="nav-lien">
          odoro.dev
        </a>
      </nav>

      <main className="principal">
        <Fond />
        <Hero />
        <Piliers />
        <Cloture />
      </main>

      <footer className="pied">
        <Marque />
        <span>Construit avec Odoro.</span>
      </footer>
    </div>
  )
}
