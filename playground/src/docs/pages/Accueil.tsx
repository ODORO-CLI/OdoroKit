/**
 * Page d'accueil : presentation de la librairie.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import {
  LayoutGrid,
  MonitorSmartphone,
  Palette,
  Route,
  Shapes,
  Type,
  Zap,
} from '@odoro-cli/icons/filaire'
import { type ReactElement, type ReactNode } from 'react'
import { Link } from '@odoro-cli/libs/router'
import { Reveal, Stagger, TextReveal } from '@odoro-cli/libs/motion'
import { buttonClasses } from '@odoro-cli/libs/ui'

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
  icon: IconData
}): ReactElement {
  return (
    <Link
      to={to}
      className="o-flex o-flex-col o-gap-2 o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6 o-no-underline o-transition-all hover:o-lift-sm hover:o-shadow-md"
    >
      <span className="o-inline-flex o-size-10 o-items-center o-justify-center o-rounded-full o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400">
        <Icon icon={icon} size={20} />
      </span>
      <span className="o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">{title}</span>
      <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{children}</span>
    </Link>
  )
}

/** Accueil de la documentation. */
export function Accueil(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-20">
      <section className="o-flex o-flex-col o-items-start o-gap-6 o-pt-8">
        <span className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-brand-200 dark:o-border-brand-800 o-bg-brand-50 dark:o-bg-brand-950 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-brand-600 dark:o-text-brand-400 o-animate-fade-in">
          Librairie front maison — zéro dependance
        </span>

        <h1 className="o-text-5xl md:o-text-6xl o-font-extrabold o-tracking-tight o-text-balance o-max-w-3xl">
          <TextReveal by="word" step={70}>
            Construisez des interfaces vivantes avec
          </TextReveal>{' '}
          <span className="o-text-gradient o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-via-brand-400 dark:o-via-brand-200 o-to-brand-600 dark:o-to-brand-400 o-animate-gradient">
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
          {/* `buttonClasses` ne dit rien du soulignement : la feuille souligne
              toute ancre, et les deux boutons arrivaient soulignes. */}
          <Link
            to="/docs/installation"
            className={`${buttonClasses({ size: 'lg' })} o-rounded-full o-no-underline`}
          >
            Démarrer
          </Link>
          <Link
            to="/docs/components/button"
            className={`${buttonClasses({ tone: 'secondary', size: 'lg' })} o-rounded-full o-no-underline`}
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
          <Feature title="Styles" to="/docs/styles" icon={Palette}>
            290 couleurs OKLCH en palette brute, le thème écrit sur la classe, 21 000
            utilitaires générés depuis les tokens.
          </Feature>
          <Feature title="Animations" to="/docs/motion" icon={Zap}>
            Presets prêts à jouer, révélations au scroll, sorties animees — sur le moteur
            du navigateur.
          </Feature>
          <Feature title="Composants" to="/docs/components/button" icon={LayoutGrid}>
            Une trentaine de composants accessibles, retheme intégralement par variables
            CSS.
          </Feature>
          <Feature title="Routeur" to="/docs/router" icon={Route}>
            Routes imbriquees, paramètres, chargement paresseux et transitions de page
            natives.
          </Feature>
          <Feature title="Google Fonts" to="/docs/styles/fonts" icon={Type}>
            Toutes les polices du catalogue, chargees par CDN — rien dans le bundle.
          </Feature>
          <Feature title="Icônes" to="/docs/icons" icon={Shapes}>
            Cinq jeux normalises sur un même contrat, dix mille six cent trente-neuf
            traces, un seul composant pour les rendre.
          </Feature>
          <Feature
            title="Responsive"
            to="/docs/styles/responsive"
            icon={MonitorSmartphone}
          >
            Mobile, tablette et grand écran : variants sm a 2xl, plus les plafonds max-*.
          </Feature>
        </Stagger>
      </section>
    </div>
  )
}
