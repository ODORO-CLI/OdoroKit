/**
 * Vue d'ensemble du moteur d'animation : ou passe la frontiere avec la
 * librairie, et ce que le moteur apporte de plus.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { Link } from '@odoro-cli/libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Une carte de comparaison entre les deux couches. */
function Side({
  title,
  tone,
  lead,
  items,
}: {
  title: string
  tone: 'libs' | 'engine'
  lead: string
  items: readonly string[]
}): ReactElement {
  return (
    <div
      className={`o-flex o-flex-col o-gap-3 o-rounded-lg o-border-w-1 o-p-5 ${
        tone === 'libs'
          ? 'o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900'
          : 'o-border-brand-200 dark:o-border-brand-800 o-bg-brand-50 dark:o-bg-brand-950'
      }`}
    >
      <h3 className="o-font-mono o-text-sm o-font-semibold">{title}</h3>
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{lead}</p>
      <ul className="o-flex o-flex-col o-gap-1.5 o-text-sm">
        {items.map((item) => (
          <li key={item} className="o-flex o-gap-2">
            <span className="o-text-zinc-400 dark:o-text-zinc-500">—</span>
            <span className="o-text-zinc-500 dark:o-text-zinc-400">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Page de vue d'ensemble du moteur. */
export function MoteurOverview(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro-cli/engine"
        title="Le moteur"
        lead="Une couche separee pour ce qui travaille a chaque image : defilement, pointeur, WebGL. Le reste appartient a la librairie."
      />

      <Section
        title="Qui possede la frame"
        lead="Le critere n'est pas « leger contre lourd », qui laisse hesiter a chaque composant. Il tient en une question : ce composant doit-il faire quelque chose a chaque image ?"
      >
        <div className="o-grid o-grid-cols-1 md:o-grid-cols-2 o-gap-4">
          <Side
            tone="libs"
            title="@odoro-cli/libs/motion"
            lead="Non. L'animation est decrite une fois, puis confiee au compositeur du navigateur. Aucun JavaScript ne s'execute par image."
            items={[
              'une revelation au defilement',
              'une transition de presence',
              'une micro-interaction au survol',
              'un preset joue sur commande',
            ]}
          />
          <Side
            tone="engine"
            title="@odoro-cli/engine"
            lead="Oui. Une valeur est recalculee a chaque image, et quelque chose la lit."
            items={[
              'un defilement horizontal pilote par le scroll',
              'un suivi de pointeur amorti',
              'un rendu WebGL',
              'une orchestration de plusieurs elements en cadence',
            ]}
          />
        </div>

        <Callout>
          Un defilement horizontal pilote par le scroll <strong>ne peut pas</strong> etre
          fait dans la librairie. Une revelation au scroll <strong>ne doit pas</strong>{' '}
          etre faite dans le moteur. Entre les deux, la question tranche seule.
        </Callout>
      </Section>

      <Section
        title="Une seule boucle"
        lead="Chaque bibliotheque d'animation apporte sa propre boucle, et trois boucles concurrentes rendent le profilage illisible : on ne sait plus laquelle depasse son budget. Le moteur n'en expose qu'une, et tout s'y abonne."
      >
        <CodeBlock
          code={`import { OdoroEngine } from '@odoro-cli/engine'

createRoot(document.getElementById('root')!).render(
  <OdoroEngine quality="auto">
    <App />
  </OdoroEngine>,
)`}
        />
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          <Link
            to="/docs/moteur/boucle"
            className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline"
          >
            La boucle
          </Link>{' '}
          detaille les priorites et la difference entre le delta lisse et le delta mesure.
        </p>
      </Section>

      <Section
        title="Ce que le moteur refuse de faire"
        lead="Trois garde-fous, tous pour la meme raison : un composant d'animation qui degrade la page est pire que pas de composant du tout."
      >
        <div className="o-flex o-flex-col o-gap-3">
          {[
            {
              titre: 'Il neutralise le mouvement, jamais l etat final',
              texte:
                'Sous mouvement reduit, une animation ne joue pas — mais ce qu elle devait reveler est visible. Une revelation neutralisee qui laisse le texte invisible est un bogue d accessibilite, pas un respect de la preference.',
              vers: '/docs/moteur/mouvement',
            },
            {
              titre: 'Il compte les contextes graphiques',
              texte:
                'Passe une limite, le navigateur perd silencieusement le plus ancien contexte WebGL. Un arbitre les distribue et refuse explicitement plutot que de laisser un canevas devenir noir sans raison apparente.',
              vers: '/docs/moteur/webgl',
            },
            {
              titre: 'Il rend compte de ce qu il tient',
              texte:
                'Chaque abonne a la boucle et chaque ressource graphique est enregistre. Ce qui n est pas libere se voit, au lieu de se deviner dans un profil memoire.',
              vers: '/docs/moteur/diagnostic',
            },
          ].map((item) => (
            <Link
              key={item.titre}
              to={item.vers}
              className="o-flex o-flex-col o-gap-1 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-4 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors"
            >
              <span className="o-font-medium">{item.titre}</span>
              <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                {item.texte}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Les tokens ne sont pas redefinis"
        lead="Le moteur reprend les durees et les courbes d'odoro-libs. Une seule source de verite : un projet qui change sa courbe d'entree la change partout, y compris dans ce qui tourne a soixante images par seconde."
      />
    </>
  )
}
