/**
 * Vue d'ensemble du moteur d'animation.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { motionDuration, motionEasing, useAnimate } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Piste cliquable : la pastille traverse avec la courbe donnee. */
function EasingDemo({ name, value }: { name: string; value: string }): ReactElement {
  const [ref, controls] = useAnimate<HTMLSpanElement>()

  return (
    <button
      type="button"
      onClick={() =>
        void controls.play(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(13rem)' }],
          { duration: 700, easing: value },
        )
      }
      className="o-flex o-items-center o-gap-4 o-w-full o-rounded-md o-p-2 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800 o-transition-colors o-cursor-pointer o-text-left"
    >
      <span className="o-w-24 o-shrink-0 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        {name}
      </span>
      <span className="o-relative o-w-56 o-h-4 o-shrink-0 o-rounded-full o-bg-zinc-100 dark:o-bg-zinc-950">
        <span
          ref={ref}
          className="o-absolute o-size-4 o-rounded-full o-bg-brand-600 dark:o-bg-brand-400"
        />
      </span>
      <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500 o-truncate max-md:o-hidden">
        {value}
      </span>
    </button>
  )
}

/** Vue d'ensemble du module motion : principes, durees, courbes, sous-pages. */
export function MotionOverview(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/motion"
        title="Le moteur d'animation"
        lead="Des presets, des composants de revelation et des hooks de pilotage, tous poses sur l'API d'animation du navigateur — pas sur une boucle JavaScript."
      />

      <Section
        title="Principes"
        lead="Trois choix structurent le module, et expliquent son comportement dans les cas limites."
      >
        <ul className="o-flex o-flex-col o-gap-3 o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          <li>
            <strong className="o-text-zinc-900 dark:o-text-zinc-50">
              Le navigateur interpole.
            </strong>{' '}
            Tout passe par <code className="o-font-mono o-text-sm">Element.animate</code>,
            qui s'execute sur le fil de composition. Aucune boucle{' '}
            <code className="o-font-mono o-text-sm">requestAnimationFrame</code> n'est
            ouverte en JavaScript : une animation en cours ne ralentit pas si le fil
            principal est occupe, et ne consomme rien quand l'onglet est masque.
          </li>
          <li>
            <strong className="o-text-zinc-900 dark:o-text-zinc-50">
              Des courbes de Bezier, pas de ressorts.
            </strong>{' '}
            Un ressort physique ne s'exprime pas comme une courbe de Bezier : il faudrait
            echantillonner l'oscillateur amorti en une centaine d'etapes, ou revenir a une
            boucle JavaScript — ce qui annulerait le benefice de l'approche. La porte
            reste ouverte pour une version ulterieure, sans changement d'API.
          </li>
          <li>
            <strong className="o-text-zinc-900 dark:o-text-zinc-50">
              prefers-reduced-motion est toujours respecte.
            </strong>{' '}
            Tous les composants et hooks le consultent. L'animation est neutralisee,
            jamais l'etat final : un contenu revele reste visible, un element sortant est
            bien demonte.
          </li>
        </ul>
      </Section>

      <Section
        title="Durees"
        lead="L'echelle des design tokens, convertie en millisecondes pour l'API du navigateur. Les composants acceptent un nom de token ou un nombre brut."
      >
        <div className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          <table className="o-w-full o-text-sm">
            <thead>
              <tr className="o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-text-left">
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Token
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Millisecondes
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Registre
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['instant', 'neutralisation, tests'],
                  ['fastest', 'micro-retours : pression, focus'],
                  ['faster', 'retours rapides'],
                  ['fast', 'sorties discretes'],
                  ['base', 'transitions courantes'],
                  ['slow', 'entrees, revelations'],
                  ['slower', 'entrees amples'],
                  ['slowest', "sequences d'attention"],
                ] as ReadonlyArray<readonly [keyof typeof motionDuration, string]>
              ).map(([name, usage]) => (
                <tr
                  key={name}
                  className="o-border-b o-border-zinc-100 dark:o-border-zinc-900"
                >
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400 o-whitespace-nowrap">
                    {name}
                  </td>
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums">
                    {motionDuration[name]} ms
                  </td>
                  <td className="o-px-4 o-py-2 o-text-zinc-500 dark:o-text-zinc-400">
                    {usage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Courbes"
        lead="Cliquez sur une ligne : la pastille traverse la piste avec la courbe correspondante. Les entrees decelerent, les sorties accelerent, emphasized depasse legerement."
      >
        <div className="o-flex o-flex-col o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-2 o-bg-white dark:o-bg-zinc-900">
          {Object.entries(motionEasing).map(([name, value]) => (
            <EasingDemo key={name} name={name} value={value} />
          ))}
        </div>
        <CodeBlock
          lang="tsx"
          code={`import { useAnimate } from '@odoro-cli/libs/motion'

const [ref, controls] = useAnimate<HTMLSpanElement>()

void controls.play(
  [{ transform: 'translateX(0)' }, { transform: 'translateX(13rem)' }],
  { duration: 700, easing: 'emphasized' },
)`}
        />
      </Section>

      <Section title="Aller plus loin">
        <ul className="o-flex o-flex-col o-gap-2 o-text-zinc-500 dark:o-text-zinc-400">
          {[
            [
              '/docs/motion/presets',
              "Presets — la galerie des entrees, sorties et animations d'attention",
            ],
            [
              '/docs/motion/composants',
              'Composants — Reveal, Stagger, TextReveal, Animate',
            ],
            [
              '/docs/motion/hooks',
              'Hooks — useAnimate, usePresence, useInView, useScrollProgress',
            ],
          ].map(([to = '', label]) => (
            <li key={to}>
              <Link
                to={to}
                className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline o-underline-offset-2"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Callout>
          Les memes mouvements existent en classes CSS{' '}
          <code className="o-font-mono o-text-sm">o-animate-*</code> pour les cas sans
          JavaScript — voir la page{' '}
          <Link
            to="/docs/styles/utilitaires"
            className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline o-underline-offset-2"
          >
            Utilitaires
          </Link>
          .
        </Callout>
      </Section>
    </article>
  )
}
