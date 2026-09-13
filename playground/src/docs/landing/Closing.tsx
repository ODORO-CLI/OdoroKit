/**
 * La fin de page : les principes, les templates, les questions, le pied.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import { ArrowRight, Check, Code, Package, Palette, Shield } from '@odoro-cli/icons/filaire'
import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { buttonClasses } from '@odoro-cli/libs/ui'
import { type ReactElement } from 'react'

import { RadialGlow } from '@/odoro/background/RadialGlow.js'
import { Parallax } from '@/odoro/effect/Parallax.js'
import { CinematicFooter } from '@/odoro/section/CinematicFooter.js'
import { Faq } from '@/odoro/section/Faq.js'

/** Un principe. */
interface Principle {
  readonly icon: IconData
  readonly title: string
  readonly text: string
}

const PRINCIPLES: readonly Principle[] = [
  {
    icon: Package,
    title: 'Zéro dependance',
    text: 'Ni framework d animation, ni utilitaire CSS tiers. Ce que vous installez, vous pouvez le lire en entier.',
  },
  {
    icon: Code,
    title: 'Copie, jamais lié',
    text: 'Une entree du registre est un fichier dans votre projet. Modifiez-la : rien ne se casse a la prochaine version.',
  },
  {
    icon: Shield,
    title: 'Accessible d’abord',
    text: 'Motifs ARIA, textes en sr-only sous les animations, mouvement reduit respecte partout. Sans option a cocher.',
  },
  {
    icon: Palette,
    title: 'Une seule source',
    text: 'Les tokens font la feuille, les composants et les shaders. Changez la teinte de marque : tout suit.',
  },
]

const PROMISES = [
  'Routes, transitions et chargement paresseux prets',
  'Feuille de style elaguee au build',
  'Fonds avec repli statique et arbitre WebGL',
  'Theme clair et sombre, mouvement reduit',
]

const FOOTER_LINKS: readonly (readonly [string, string])[] = [
  ['/docs', 'Documentation'],
  ['/docs/registry', 'Registre'],
  ['/docs/backgrounds', 'Fonds'],
  ['/docs/components/button', 'Composants'],
  ['/templates', 'Templates'],
]

/** Proprietes de la fin de page. */
export interface ClosingProps {
  /** Nombre d'entrees, pour le mot du pied. */
  total: number
}

/** Principes, templates, FAQ et pied. */
export function Closing({ total }: ClosingProps): ReactElement {
  return (
    <>
      <section className="o-mx-auto o-max-w-6xl o-px-6 o-py-24">
        <Reveal preset="fade-up" className="o-max-w-2xl">
          <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
            Principes
          </p>
          <h2 className="o-mt-3 o-text-3xl md:o-text-5xl o-font-bold o-tracking-tight o-text-balance">
            Ce a quoi le kit s’engage.
          </h2>
        </Reveal>
        <Stagger
          preset="fade-up"
          step={90}
          className="o-mt-12 o-grid o-gap-4 sm:o-grid-cols-2 lg:o-grid-cols-4"
        >
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="o-flex o-flex-col o-gap-3 o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6"
            >
              <span className="o-inline-flex o-size-10 o-items-center o-justify-center o-rounded-lg o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400">
                <Icon icon={principle.icon} size={18} />
              </span>
              <h3 className="o-font-semibold">{principle.title}</h3>
              <p className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400 o-text-pretty">
                {principle.text}
              </p>
            </div>
          ))}
        </Stagger>
      </section>

      <section className="o-relative o-overflow-hidden o-border-t o-border-b o-border-zinc-200 dark:o-border-zinc-800">
        <Parallax distance={60} className="o-absolute o-inset-0">
          <RadialGlow
            className="o-absolute o-inset-0 o-opacity-60"
            size={1.2}
            y={0.5}
            strength={0.35}
          />
        </Parallax>
        <div className="o-relative o-mx-auto o-grid o-max-w-6xl o-gap-8 o-px-6 o-py-24 lg:o-grid-cols-2 lg:o-items-center">
          <Reveal preset="fade-right">
            <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
              Templates
            </p>
            <h2 className="o-mt-3 o-text-3xl md:o-text-4xl o-font-bold o-tracking-tight o-text-balance">
              Ou partez d’un projet entier.
            </h2>
            <p className="o-mt-4 o-max-w-prose o-text-zinc-600 dark:o-text-zinc-400 o-text-pretty">
              Un template n’est pas une piece a ajouter : c’est un projet complet, routes et
              configuration comprises, bati avec la même stack — et livre avec ses entrées de
              registre déjà installees.
            </p>
            <Link
              to="/templates"
              className={`o-mt-6 ${buttonClasses({ tone: 'secondary' })} o-gap-2`}
            >
              Voir les templates
              <Icon icon={ArrowRight} size={16} />
            </Link>
          </Reveal>
          <Reveal preset="fade-left" delay={150}>
            <ul className="o-grid o-gap-3 o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6 o-text-sm">
              {PROMISES.map((line) => (
                <li key={line} className="o-flex o-items-start o-gap-2">
                  <Icon
                    icon={Check}
                    size={16}
                    className="o-mt-0.5 o-shrink-0 o-text-brand-600 dark:o-text-brand-400"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="o-mx-auto o-max-w-3xl o-px-6 o-py-24">
        <Reveal preset="fade-up" className="o-mb-10 o-text-center">
          <h2 className="o-text-3xl md:o-text-4xl o-font-bold o-tracking-tight o-text-balance">
            Les questions qu’on nous pose.
          </h2>
        </Reveal>
        <Faq
          single
          items={[
            {
              question: 'Pourquoi copier les composants plutot que les installer ?',
              answer: (
                <p>
                  Un composant d animation est presque toujours retouche : une duree, une
                  couleur, un declenchement. Copie, il se modifie sans forker un paquet et sans
                  craindre la prochaine version. Le registre reste la pour comparer votre copie
                  a l original (odoro diff).
                </p>
              ),
            },
            {
              question: 'Que se passe-t-il sans WebGL, ou sous mouvement reduit ?',
              answer: (
                <p>
                  Chaque fond déclare un repli statique — un dégradé dans les mêmes tons — qui
                  s’affiche pendant le chargement, quand WebGL manque, quand l’arbitre refuse
                  une surface de plus, et sous prefers-reduced-motion. Rien ne disparaît, rien
                  ne clignote.
                </p>
              ),
            },
            {
              question: 'Combien de fonds animes peut-on poser sur une page ?',
              answer: (
                <p>
                  Un contexte par backend : un shader ogl et une scène three au maximum,
                  simultanement. Cette page en emploie exactement deux — la constellation du
                  hero et le ciel de la section moteur. Les autres fonds sont en CSS pur.
                </p>
              ),
            },
            {
              question: 'Faut-il utiliser l engine odoro, ou puis-je garder mon bundler ?',
              answer: (
                <p>
                  La librairie fonctionne dans tout projet React 18+, quel que soit le bundler.
                  L’engine apporte le serveur de développement, le build qui élague la feuille
                  de style et la CLI du registre — il est recommande, pas obligatoire.
                </p>
              ),
            },
            {
              question: 'Comment retheme-t-on tout cela ?',
              answer: (
                <p>
                  En surchargeant les variables --o-thème-* et --o-palette-* : composants,
                  utilitaires et shaders lisent les mêmes tokens. La teinte de marque change en
                  une ligne, et les fonds la suivent au prochain rendu.
                </p>
              ),
            },
          ]}
        />
      </section>

      <CinematicFooter
        heading="On commence ?"
        word="ODORO"
        topLabel="Retour en haut"
        banner={
          <span className="o-px-8">
            {total} entrées — registre, moteur, librairie — copiees, jamais liées
          </span>
        }
        actions={
          <div className="o-flex o-flex-wrap o-justify-center o-gap-3">
            <Link to="/docs/installation" className={buttonClasses({ size: 'lg' })}>
              Commencer
            </Link>
            <Link to="/docs" className={buttonClasses({ tone: 'secondary', size: 'lg' })}>
              Lire la documentation
            </Link>
          </div>
        }
        links={
          <nav className="o-flex o-flex-wrap o-justify-center o-gap-6 o-text-sm">
            {FOOTER_LINKS.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="o-no-underline o-opacity-70 hover:o-opacity-100 o-transition-opacity"
              >
                {label}
              </Link>
            ))}
          </nav>
        }
        copyright={`© ${String(new Date().getFullYear())} Odoro — odoro.dev`}
      />
    </>
  )
}
