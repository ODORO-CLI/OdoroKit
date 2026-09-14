/**
 * Le hero : la promesse, l'installation, et la fenetre du produit.
 *
 * ## Le dessin est celui d'odoro.dev
 *
 * Meme typographie — un titre serre, une phrase de soutien plus claire —,
 * memes pastilles de faits, meme fenetre de navigateur posee sous le pli. Un
 * projet qui demarre ressemble donc a ce qu'il peut devenir, au lieu de partir
 * d'une page blanche qu'il faudra jeter.
 *
 * ## Ce qui n'y est pas
 *
 * Aucun composant du registre. Le hero se contente de ce que les bibliotheques
 * apportent : les classes, `Reveal` et `Stagger`. C'est ce qui lui permet
 * d'exister quel que soit ce qui a ete coche a la creation.
 *
 * @module
 */

import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { buttonClasses } from '@odoro-cli/libs/ui'
import type { ReactElement } from 'react'

import { Signe } from '@/composants/Marque'

/** Quatre faits, pas quatre slogans. */
const FAITS = ['Zero configuration', 'Theme clair et sombre', 'Mouvement reduit respecte']

/** Ce que la fenetre montre : une page en quelques lignes. */
const EXTRAIT = `export function Accueil() {
  return (
    <Reveal>
      <h1 className="o-text-6xl o-font-bold">
        Votre premiere page.
      </h1>
    </Reveal>
  )
}`

/**
 * Une fenetre de navigateur miniature.
 *
 * Les trois pastilles sont decoratives : elles disent « navigateur » sans rien
 * ajouter a ce qu'un lecteur d'ecran doit entendre.
 */
function Fenetre(): ReactElement {
  return (
    <div className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-shadow-2xl">
      <div className="o-flex o-items-center o-gap-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2.5">
        <span className="o-flex o-gap-1.5" aria-hidden="true">
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
        </span>
        <span className="o-ml-2 o-font-mono o-text-xs o-text-zinc-400">src/routes/Home.tsx</span>
      </div>
      <pre className="o-m-0 o-overflow-x-auto o-p-5 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
        {EXTRAIT}
      </pre>
    </div>
  )
}

/** Le hero de la page d'accueil. */
export function Hero(): ReactElement {
  return (
    <section className="o-relative o-px-6 o-pb-20 o-pt-24 md:o-pt-32">
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <Reveal>
          <span className="o-inline-flex o-items-center o-gap-2 o-whitespace-nowrap o-rounded-full o-border-w-1 o-border-brand-500/30 o-bg-brand-500/10 o-px-3 o-py-1 o-text-xs o-font-medium o-text-brand-600 dark:o-text-brand-400">
            <Signe />
            Genere par odoro create
          </span>

          <h1 className="o-mt-6 o-max-w-3xl o-text-5xl o-font-bold o-tracking-tight md:o-text-6xl">
            Votre premiere page,{' '}
            <span className="o-text-brand-500">deja vivante</span>.
          </h1>

          <p className="o-mt-5 o-max-w-xl o-text-lg o-text-zinc-500 dark:o-text-zinc-400">
            Le routeur, les animations et le systeme de style viennent de la meme
            librairie. Modifiez cette page : elle se recharge sans perdre son etat.
          </p>
        </Reveal>

        <Stagger step={70} className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-3">
          <a href="#piliers" className={`o-no-underline ${buttonClasses({ tone: 'primary' })}`}>
            Voir ce qui est inclus
          </a>
          <a
            href="https://odoro.dev/docs"
            className={`o-no-underline ${buttonClasses({ tone: 'secondary' })}`}
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </a>
        </Stagger>

        <Stagger step={60} className="o-mt-6 o-flex o-flex-wrap o-gap-2">
          {FAITS.map((fait) => (
            <span
              key={fait}
              className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-3 o-py-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {fait}
            </span>
          ))}
        </Stagger>

        <Reveal>
          <div className="o-mt-14">
            <Fenetre />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
