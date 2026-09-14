import type { ReactElement } from 'react'

import { Marque } from '@/composants/Marque'
import { Cloture } from '@/sections/Cloture'
import { Fond } from '@/sections/Fond'
import { Hero } from '@/sections/Hero'
import { Piliers } from '@/sections/Piliers'

/**
 * Racine de l'application.
 *
 * Une seule page : le routeur n'a pas ete retenu a la creation. Les sections
 * sont les memes que dans la version routee — meme dessin, memes fichiers — et
 * seul leur assemblage change.
 *
 * Pour ajouter un routeur plus tard, `@odoro-cli/libs/router` est deja
 * installe : il vient avec les bibliotheques.
 */
export function App(): ReactElement {
  return (
    <div className="app-shell">
      <nav className="o-sticky o-top-0 o-z-20 o-border-b o-border-zinc-200/70 dark:o-border-zinc-800/70 o-bg-white/70 dark:o-bg-zinc-950/70 o-backdrop-blur">
        <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-px-6 o-py-4">
          <Marque />
          <a
            href="https://odoro.dev"
            target="_blank"
            rel="noreferrer"
            className="o-ml-auto o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-brand-500"
          >
            odoro.dev
          </a>
        </div>
      </nav>

      <main className="o-relative">
        <Fond />
        <Hero />
        <Piliers />
        <Cloture />
      </main>

      <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-8">
        <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-justify-between o-gap-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          <Marque />
          <span>Construit avec Odoro.</span>
        </div>
      </footer>
    </div>
  )
}
