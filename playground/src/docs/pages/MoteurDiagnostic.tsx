/**
 * L'inventaire et le panneau de diagnostic.
 *
 * Le releve affiche ici est celui du moteur reel, pris sur cette page. Sur la
 * page des surfaces, il montrera deux contextes WebGL de plus.
 *
 * @module
 */

import {
  DEBUG_PARAM,
  readDebugSnapshot,
  registry,
  type DebugSnapshot,
} from 'odoro-engine'
import { type ReactElement, useEffect, useState } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Duree entre deux releves, en millisecondes. */
const REFRESH_MS = 500

/**
 * Releve periodique de l'etat du moteur.
 *
 * Deux fois par seconde, pas soixante : ce panneau observe le moteur, il ne
 * doit pas devenir lui-meme la charge qu'il mesure.
 */
function InventaireDemo(): ReactElement {
  const [snapshot, setSnapshot] = useState<DebugSnapshot>(() => readDebugSnapshot())

  useEffect(() => {
    const timer = setInterval(() => setSnapshot(readDebugSnapshot()), REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="o-flex o-flex-col o-gap-5 o-rounded-lg o-border-w-1 o-border-border o-bg-bg-subtle o-p-6">
      <div className="o-flex o-gap-8">
        <div className="o-flex o-flex-col o-gap-1">
          <span className="o-text-xs o-uppercase o-tracking-wide o-text-fg-subtle">
            images / s
          </span>
          <span className="o-font-mono o-text-2xl o-tabular-nums">{snapshot.fps}</span>
        </div>
        <div className="o-flex o-flex-col o-gap-1">
          <span className="o-text-xs o-uppercase o-tracking-wide o-text-fg-subtle">
            image
          </span>
          <span className="o-font-mono o-text-2xl o-tabular-nums">{snapshot.frame}</span>
        </div>
      </div>

      <div className="o-flex o-flex-col o-gap-2">
        <h4 className="o-text-sm o-font-medium">
          Abonnes a la boucle{' '}
          <span className="o-text-fg-subtle o-font-normal">
            ({snapshot.subscribers.length})
          </span>
        </h4>
        {snapshot.subscribers.length === 0 ? (
          <p className="o-text-sm o-text-fg-muted">Aucun.</p>
        ) : (
          <ul className="o-flex o-flex-col o-gap-1 o-font-mono o-text-xs">
            {snapshot.subscribers.map((entry) => (
              <li
                key={`${entry.name}-${String(entry.priority)}`}
                className="o-flex o-items-center o-gap-3"
              >
                <span className="o-w-12 o-text-right o-text-fg-subtle o-tabular-nums">
                  {entry.priority}
                </span>
                <span className={entry.active ? 'o-text-fg' : 'o-text-fg-subtle'}>
                  {entry.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="o-flex o-flex-col o-gap-2">
        <h4 className="o-text-sm o-font-medium">
          Ressources vivantes{' '}
          <span className="o-text-fg-subtle o-font-normal">
            ({snapshot.resources.length})
          </span>
        </h4>
        {snapshot.resources.length === 0 ? (
          <p className="o-text-sm o-text-fg-muted">
            Aucune. Ouvrez la page des surfaces WebGL : deux contextes y apparaissent.
          </p>
        ) : (
          <ul className="o-flex o-flex-col o-gap-1 o-font-mono o-text-xs">
            {snapshot.resources.map((resource) => (
              <li key={resource.id} className="o-flex o-items-center o-gap-3">
                <span className="o-w-20 o-text-fg-subtle">{resource.kind}</span>
                <span className="o-text-fg">{resource.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** Enregistre une ressource fictive, pour montrer l'inventaire au travail. */
function EnregistrementDemo(): ReactElement {
  const [handle, setHandle] = useState<ReturnType<typeof registry.register> | null>(null)

  // Une ressource laissee derriere soi par une page de documentation serait
  // exactement le defaut que l'inventaire sert a debusquer.
  useEffect(() => {
    return () => handle?.release()
  }, [handle])

  return (
    <div className="o-flex o-flex-col o-gap-3 o-rounded-lg o-border-w-1 o-border-border o-bg-bg-subtle o-p-6">
      <button
        type="button"
        onClick={() => {
          if (handle === null) {
            setHandle(
              registry.register({
                kind: 'timeline',
                name: 'documentation : ressource d exemple',
                // Rien a liberer ici : l'exemple n'alloue rien. Une vraie
                // ressource mettrait sa liberation la, et `disposeAll`
                // l'appellerait.
                dispose: () => undefined,
                detail: { duree: '2 s', repetitions: 3 },
              }),
            )
          } else {
            handle.release()
            setHandle(null)
          }
        }}
        className="o-self-start o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-border o-bg-surface o-text-fg hover:o-border-border-strong o-transition-colors o-cursor-pointer"
      >
        {handle === null ? 'Enregistrer une ressource' : 'La liberer'}
      </button>
      <p className="o-text-sm o-text-fg-muted">
        {handle === null
          ? 'Rien n est enregistre. Le releve ci-dessus se met a jour deux fois par seconde.'
          : 'Elle apparait dans le releve. Elle sera liberee si vous quittez la page.'}
      </p>
    </div>
  )
}

/** Page du diagnostic. */
export function MoteurDiagnostic(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-engine"
        title="Diagnostic"
        lead="Ce que le moteur tient, a tout instant : qui s'abonne a la boucle, et quelles ressources graphiques sont vivantes."
      />

      <Section
        title="Le releve"
        lead="Le moteur ne se contente pas de fonctionner : il rend compte. Une fuite de ressource se lit ici, au lieu de se deviner dans un profil memoire une semaine plus tard."
      >
        <InventaireDemo />
      </Section>

      <Section
        title="Enregistrer une ressource"
        lead="Tout ce qui doit etre libere a la main s'enregistre. La contrepartie est une poignee, dont l'appel de liberation retire l'entree."
      >
        <CodeBlock
          code={`import { registry } from 'odoro-engine'

const handle = registry.register({
  kind: 'timeline',
  name: 'entree du heros',
  dispose: () => timeline.kill(),
  detail: { duree: '2 s', repetitions: 3 },
})

// A la sortie du composant : retire l inventaire, sans liberer.
handle.release()`}
        />
        <EnregistrementDemo />
      </Section>

      <Section
        title="Le panneau"
        lead="Le meme releve, en surcouche, active par un parametre d'URL plutot que par une variable de compilation : on l'ouvre sur la page qui pose probleme, sans recompiler."
      >
        <CodeBlock
          code={`import { OdoroDebugPanel, isDebugRequested } from 'odoro-engine'

// Ajoutez ?${DEBUG_PARAM} a l URL pour l afficher.
{isDebugRequested() ? <OdoroDebugPanel /> : null}`}
        />

        <Callout tone="warning">
          Le panneau est <strong>en lecture seule</strong>, et le restera. La licence de
          la bibliotheque d orchestration interdit son emploi dans un outil qui
          permettrait de composer des animations sans ecrire de code. Afficher un etat n
          en approche pas ; un editeur de timeline sur canevas franchirait la ligne.
        </Callout>
      </Section>

      <Section
        title="Ce que porte un enregistrement"
        lead="Le nom n'est pas decoratif : c'est la seule chose qui permette de relier une ressource orpheline au composant qui l'a creee."
      >
        <PropsTable
          rows={[
            {
              name: 'kind',
              type: "'timeline' | 'scroll-trigger' | 'surface' | 'subscription'",
              description: 'Nature de la ressource, pour regrouper le releve.',
            },
            {
              name: 'name',
              type: 'string',
              description:
                'Nom lisible. Ce qui s affiche quand quelque chose ne se libere pas.',
            },
            {
              name: 'dispose',
              type: '() => void',
              description:
                'Liberation de la ressource. Appelee par disposeAll, jamais par release : retirer une entree de l inventaire et liberer ce qu elle designe sont deux gestes differents.',
            },
            {
              name: 'detail',
              type: 'Record<string, string | number | boolean>',
              defaultValue: '—',
              description: 'Informations libres, affichees telles quelles.',
            },
          ]}
        />
      </Section>
    </>
  )
}
