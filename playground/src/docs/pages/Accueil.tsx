/**
 * Page d'accueil : presentation de la librairie.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'
import { Link } from 'odoro-libs/router'
import { Reveal, Stagger, TextReveal } from 'odoro-libs/motion'
import { buttonClasses } from 'odoro-libs/ui'

import { CodeBlock } from '../components/CodeBlock.jsx'

/** Une carte de fonctionnalite. */
function Feature({
  title,
  to,
  children,
  icon,
}: {
  title: string
  to: string
  children: ReactNode
  icon: ReactNode
}): ReactElement {
  return (
    <Link
      to={to}
      className="o-flex o-flex-col o-gap-2 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-5 o-no-underline hover:o-lift-sm hover:o-shadow-md o-transition-all"
    >
      <span className="o-inline-flex o-items-center o-justify-center o-size-10 o-rounded-lg o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400">
        {icon}
      </span>
      <span className="o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">{title}</span>
      <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{children}</span>
    </Link>
  )
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const

/** Accueil de la documentation. */
export function Accueil(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-16">
      <section className="o-flex o-flex-col o-items-start o-gap-6 o-pt-8">
        <span className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-brand-200 dark:o-border-brand-800 o-bg-brand-50 dark:o-bg-brand-950 o-px-3 o-py-1 o-text-xs o-font-medium o-text-brand-600 dark:o-text-brand-400 o-animate-fade-in">
          Librairie front maison — zero dependance
        </span>

        <h1 className="o-text-5xl md:o-text-6xl o-font-extrabold o-tracking-tight o-text-balance o-max-w-3xl">
          <TextReveal by="word" step={70}>
            Construisez des interfaces vivantes avec
          </TextReveal>{' '}
          <span className="o-text-gradient o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-via-fuchsia-600 dark:o-via-fuchsia-400 o-to-brand-600 dark:o-to-brand-400 o-animate-gradient">
            Odoro
          </span>
        </h1>

        <Reveal preset="fade-up" delay={300} className="o-max-w-2xl">
          <p className="o-text-lg o-text-zinc-500 dark:o-text-zinc-400 o-text-pretty">
            Un systeme de style pilote par tokens, un moteur d'animation sur le fil de
            composition, un routeur avec transitions de page et une bibliotheque de
            composants accessibles — quatre modules coherents, sans une seule dependance
            externe.
          </p>
        </Reveal>

        <Reveal preset="fade-up" delay={450} className="o-flex o-flex-wrap o-gap-3">
          <Link to="/docs/installation" className={buttonClasses({ size: 'lg' })}>
            Demarrer
          </Link>
          <Link
            to="/docs/composants/button"
            className={buttonClasses({ tone: 'secondary', size: 'lg' })}
          >
            Parcourir les composants
          </Link>
        </Reveal>

        <Reveal preset="fade-up" delay={600} className="o-w-full o-max-w-2xl">
          <CodeBlock lang="sh" code={`pnpm create odoro mon-app\ncd mon-app\npnpm dev`} />
        </Reveal>
      </section>

      <section>
        <Stagger
          step={80}
          preset="fade-up"
          className="o-grid o-grid-cols-1 sm:o-grid-cols-2 lg:o-grid-cols-3 o-gap-4"
        >
          <Feature
            title="Styles"
            to="/docs/styles"
            icon={
              <svg {...ICON_PROPS}>
                <circle cx="13.5" cy="6.5" r="2.5" />
                <circle cx="19" cy="13" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="10" cy="18.5" r="2.5" />
              </svg>
            }
          >
            290 couleurs OKLCH en palette brute, le theme ecrit sur la classe, 21 000
            utilitaires generes depuis les tokens.
          </Feature>
          <Feature
            title="Animations"
            to="/docs/motion"
            icon={
              <svg {...ICON_PROPS}>
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
              </svg>
            }
          >
            Presets prets a jouer, revelations au scroll, sorties animees — sur le moteur
            du navigateur.
          </Feature>
          <Feature
            title="Composants"
            to="/docs/composants/button"
            icon={
              <svg {...ICON_PROPS}>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            }
          >
            Une trentaine de composants accessibles, retheme integralement par variables
            CSS.
          </Feature>
          <Feature
            title="Routeur"
            to="/docs/router"
            icon={
              <svg {...ICON_PROPS}>
                <path d="M4 19V5a2 2 0 0 1 2-2h12" />
                <path d="M9 21h9a2 2 0 0 0 2-2V9l-6-6" />
              </svg>
            }
          >
            Routes imbriquees, parametres, chargement paresseux et transitions de page
            natives.
          </Feature>
          <Feature
            title="Google Fonts"
            to="/docs/styles/fonts"
            icon={
              <svg {...ICON_PROPS}>
                <path d="M4 20 12 4l8 16M7 14h10" />
              </svg>
            }
          >
            Toutes les polices du catalogue, chargees par CDN — rien dans le bundle.
          </Feature>
          <Feature
            title="Responsive"
            to="/docs/styles/responsive"
            icon={
              <svg {...ICON_PROPS}>
                <rect x="2" y="4" width="13" height="12" rx="2" />
                <rect x="16" y="9" width="6" height="11" rx="1.5" />
              </svg>
            }
          >
            Mobile, tablette et grand ecran : variants sm a 2xl, plus les plafonds max-*.
          </Feature>
        </Stagger>
      </section>
    </div>
  )
}
