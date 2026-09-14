/**
 * Toute la page, en un fichier.
 *
 * ## Une seule page
 *
 * Le routeur n'a pas ete retenu a la creation : il n'y a donc ni `router.tsx`
 * ni navigation entre pages, et les sections se suivent. Le dessin est le meme
 * que dans la version routee.
 *
 * Pour en ajouter un plus tard, `@odoro-cli/libs/router` est deja installe : il
 * vient avec les bibliotheques.
 *
 * ## La barre de navigation
 *
 * Elle ne peint pas de bandeau : ce sont des gelules posees sur ce qu'il y a
 * derriere, avec un flou d'arriere-plan. Le fond decoratif continue donc de
 * passer dessous, au lieu d'etre coupe par une bande opaque.
 *
 * @module
 */

import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { buttonClasses } from '@odoro-cli/libs/ui'
import { useState, type CSSProperties, type ReactElement } from 'react'

import { Fond } from '@/fond'

/* -------------------------------------------------------------------------- */
/*  Marque                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Le signe de la marque.
 *
 * La taille est en style et non en classe : une classe utilitaire a valeur
 * arbitraire n'est emise que si le compilateur l'a vue passer, et une classe
 * absente ne peint rien — le signe serait sans dimensions, donc invisible.
 */
function Signe({ taille = '1.75rem' }: { readonly taille?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{ width: taille, height: taille, flexShrink: 0 }}
    >
      <path
        d="M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z"
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Barre de navigation                                                        */
/* -------------------------------------------------------------------------- */

/**
 * La surface d'une gelule.
 *
 * Le systeme decline les echelles de noir et de blanc, mais pas leurs variantes
 * sombres en alpha. Le melange se fait donc en style, ou il est exact et suit
 * le theme sans qu'on ait a redire chaque couleur.
 */
const GELULE: CSSProperties = {
  backgroundColor: 'color-mix(in oklab, var(--o-theme-bg) 72%, transparent)',
  borderColor: 'color-mix(in oklab, var(--o-theme-fg) 12%, transparent)',
}

/** La barre : la marque, et le lien vers le site. */
function Barre(): ReactElement {
  return (
    <header className="o-sticky o-top-0 o-z-20 o-px-5 md:o-px-8">
      <div className="o-mx-auto o-flex o-h-20 o-w-full o-max-w-5xl o-items-center o-gap-3">
        <span
          className="o-inline-flex o-h-14 o-shrink-0 o-items-center o-gap-2.5 o-rounded-full o-border-w-1 o-pl-5 o-pr-6 o-backdrop-blur-xl"
          style={GELULE}
        >
          <span className="o-text-brand-500">
            <Signe />
          </span>
          <span className="o-text-lg o-font-bold o-tracking-wide o-text-zinc-950 dark:o-text-white">
            ODORO
          </span>
        </span>

        <a
          href="https://odoro.dev"
          target="_blank"
          rel="noreferrer"
          className="o-ml-auto o-inline-flex o-h-14 o-shrink-0 o-items-center o-rounded-full o-border-w-1 o-px-5 o-text-sm o-no-underline o-backdrop-blur-xl o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
          style={GELULE}
        >
          odoro.dev
        </a>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                   */
/* -------------------------------------------------------------------------- */

/** Trois faits, pas trois slogans. */
const FAITS = ['Zero configuration', 'Theme clair et sombre', 'Mouvement reduit respecte']

/** Ce que la fenetre du produit montre. */
const EXTRAIT = `export function App() {
  return (
    <Reveal>
      <h1 className="o-text-6xl o-font-bold">
        Votre premiere page.
      </h1>
    </Reveal>
  )
}`

/** Une fenetre de navigateur miniature. */
function Fenetre(): ReactElement {
  return (
    <div className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-shadow-2xl">
      <div className="o-flex o-items-center o-gap-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2.5">
        <span className="o-flex o-gap-1.5" aria-hidden="true">
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
        </span>
        <span className="o-ml-2 o-font-mono o-text-xs o-text-zinc-400">src/App.tsx</span>
      </div>
      <pre className="o-m-0 o-overflow-x-auto o-p-5 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
        {EXTRAIT}
      </pre>
    </div>
  )
}

/** Le hero : la promesse, les actions, et la fenetre du produit. */
function Hero(): ReactElement {
  return (
    <section className="o-relative o-px-6 o-pb-20 o-pt-16 md:o-pt-24">
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <Reveal>
          <span className="o-inline-flex o-items-center o-gap-2 o-whitespace-nowrap o-rounded-full o-border-w-1 o-border-brand-500/30 o-bg-brand-500/10 o-px-3 o-py-1 o-text-xs o-font-medium o-text-brand-600 dark:o-text-brand-400">
            <Signe taille="0.9rem" />
            Genere par odoro create
          </span>

          <h1 className="o-mt-6 o-max-w-3xl o-text-5xl o-font-bold o-tracking-tight md:o-text-6xl">
            Votre premiere page, <span className="o-text-brand-500">deja vivante</span>.
          </h1>

          <p className="o-mt-5 o-max-w-xl o-text-lg o-text-zinc-500 dark:o-text-zinc-400">
            Le moteur d animation et le systeme de style viennent de la meme librairie.
            Modifiez cette page : elle se recharge sans perdre son etat.
          </p>
        </Reveal>

        <Stagger step={70} className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-3">
          <a
            href="#piliers"
            className={`o-no-underline ${buttonClasses({ tone: 'primary' })}`}
          >
            Voir ce qui est inclus
          </a>
          <a
            href="https://odoro.dev/docs"
            target="_blank"
            rel="noreferrer"
            className={`o-no-underline ${buttonClasses({ tone: 'secondary' })}`}
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

/** Ce que le projet a deja sous la main. */
const PILIERS = [
  {
    titre: 'Animations',
    texte:
      "Une couche mince sur le moteur du navigateur. Le mouvement reduit est respecte d'office.",
  },
  {
    titre: 'Styles',
    texte: 'Des jetons en source de verite, une feuille statique, aucun scan a l execution.',
  },
  {
    titre: 'Interface',
    texte: 'Des composants qui lisent les memes jetons que votre code : les rethemer suffit.',
  },
]

/** La section des piliers. */
function Piliers(): ReactElement {
  return (
    <section
      id="piliers"
      className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-20"
    >
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <h2 className="o-text-sm o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
          Ce qui est deja la
        </h2>

        <Stagger step={90} className="o-mt-8 o-grid o-gap-4 md:o-grid-cols-3">
          {PILIERS.map((pilier, index) => (
            <article
              key={pilier.titre}
              className="o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6"
            >
              <span className="o-font-mono o-text-xs o-text-brand-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="o-mt-3 o-text-lg o-font-semibold o-tracking-tight">
                {pilier.titre}
              </h3>
              <p className="o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                {pilier.texte}
              </p>
            </article>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/** La commande que l'on copie le plus souvent. */
const COMMANDE = 'odoro add text/count-up'

/** La cloture : une commande, et la porte vers le catalogue. */
function Cloture(): ReactElement {
  const [copie, setCopie] = useState(false)

  return (
    <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl o-text-center">
        <Reveal>
          <h2 className="o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl">
            Ajoutez un composant, sans quitter le terminal.
          </h2>
          <p className="o-mx-auto o-mt-4 o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
            Le registre copie le code dans votre projet. Il vous appartient : on le lit,
            on le modifie, il ne se met pas a jour dans votre dos.
          </p>

          <div className="o-mx-auto o-mt-8 o-flex o-max-w-md o-items-center o-gap-2 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-2 o-pl-4">
            <code className="o-flex-1 o-text-left o-font-mono o-text-sm">{COMMANDE}</code>
            <button
              type="button"
              className={buttonClasses({ tone: 'ghost', size: 'sm' })}
              onClick={() => {
                // Le presse-papiers peut etre refuse — hors contexte sur, ou
                // permission retiree. L'echec ne casse pas la page.
                void navigator.clipboard
                  ?.writeText(COMMANDE)
                  .then(() => {
                    setCopie(true)
                    setTimeout(() => {
                      setCopie(false)
                    }, 1600)
                  })
                  .catch(() => undefined)
              }}
            >
              {copie ? 'Copie' : 'Copier'}
            </button>
          </div>

          <a
            href="https://odoro.dev/docs/registry"
            target="_blank"
            rel="noreferrer"
            className="o-mt-6 o-inline-block o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-brand-500"
          >
            Parcourir le catalogue
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Racine                                                                     */
/* -------------------------------------------------------------------------- */

/** Racine de l'application. */
export function App(): ReactElement {
  return (
    <div className="app-shell">
      <Barre />
      <main className="o-relative">
        <Fond />
        <Hero />
        <Piliers />
        <Cloture />
      </main>
      <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-8">
        <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-justify-between o-gap-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          <span className="o-inline-flex o-items-center o-gap-2">
            <span className="o-text-brand-500">
              <Signe taille="1.1rem" />
            </span>
            <span className="o-font-semibold o-tracking-wide">ODORO</span>
          </span>
          <span>Construit avec Odoro.</span>
        </div>
      </footer>
    </div>
  )
}
