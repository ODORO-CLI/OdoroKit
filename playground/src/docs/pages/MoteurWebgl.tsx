/**
 * La couche graphique : arbitrage des contextes, backend leger, replis.
 *
 * Il n'y a **qu'une** surface sur cette page, et ce n'est pas une economie :
 * l'arbitre n'accorde qu'un contexte par backend. Deux aurores cote a cote
 * seraient une demonstration qui contredit ce qu'elle explique — la seconde
 * serait refusee, et afficherait son repli.
 *
 * @module
 */

import {
  AURORA_FRAGMENT,
  GRID_FRAGMENT,
  surfaceManager,
  useShaderSurface,
} from 'odoro-engine'
import { type ReactElement, useRef, useState } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Phrase expliquant un refus, du point de vue de qui le subit. */
const REFUSAL_TEXT: Record<string, string> = {
  'plafond-global': 'Le plafond de surfaces simultanees est atteint.',
  'plafond-backend': 'Ce backend a deja sa surface.',
  'webgl-indisponible': 'Ce navigateur ne fournit pas de contexte WebGL.',
  'hors-navigateur': 'Aucun document : rendu cote serveur.',
  'mouvement-reduit': 'Mouvement reduit : le fond anime n est pas rendu.',
}

/** Les deux effets proposes, avec leur repli. */
const EFFETS = {
  aurore: {
    label: 'Aurore',
    fragment: AURORA_FRAGMENT,
    uniforms: {
      uColorA: [0.15, 0.1, 0.45],
      uColorB: [0.55, 0.2, 0.75],
      uColorC: [0.1, 0.6, 0.75],
      uSpeed: 0.12,
      uScale: 2.4,
      uOctaves: 4,
    },
    fallback: 'o-bg-gradient-to-br o-from-indigo-900 o-via-purple-800 o-to-cyan-700',
    note: 'Bruit fractal et deplacement de domaine : le motif se replie sur lui-meme.',
  },
  grille: {
    label: 'Grille',
    fragment: GRID_FRAGMENT,
    uniforms: {
      uColorLine: [0.35, 0.55, 0.95],
      uColorBackground: [0.04, 0.05, 0.09],
      uSpeed: 0.08,
      uDensity: 14,
    },
    fallback: 'o-bg-slate-950',
    note: 'L epaisseur des lignes vient de la derivee d ecran : elle reste constante quelle que soit la densite de pixels.',
  },
} as const

/** Nom d'un effet. */
type EffetName = keyof typeof EFFETS

/** La surface unique de la page, avec son repli et son selecteur. */
function SurfaceDemo(): ReactElement {
  const [effet, setEffet] = useState<EffetName>('aurore')
  const choix = EFFETS[effet]

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: choix.fragment,
    uniforms: choix.uniforms,
    name: `documentation : ${effet}`,
  })

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-relative o-h-64 o-w-full o-overflow-hidden o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
        <div ref={ref} className="o-absolute o-inset-0" />

        {ready && refused === undefined ? null : (
          <div className={`o-absolute o-inset-0 ${choix.fallback}`}>
            {refused === undefined ? null : (
              <div className="o-absolute o-inset-x-0 o-bottom-0 o-bg-white dark:o-bg-zinc-950/80 o-backdrop-blur-sm o-p-3 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                {REFUSAL_TEXT[refused] ?? refused}{' '}
                <span className="o-text-zinc-400 dark:o-text-zinc-500">
                  Le repli est ce que vous voyez.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="o-flex o-flex-wrap o-items-center o-gap-2">
        {(Object.keys(EFFETS) as EffetName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setEffet(name)}
            aria-pressed={effet === name}
            className={`o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-transition-colors o-cursor-pointer ${
              effet === name
                ? 'o-border-brand-200 dark:o-border-brand-800 o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400'
                : 'o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-300 dark:hover:o-border-zinc-700'
            }`}
          >
            {EFFETS[name].label}
          </button>
        ))}
        <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          {choix.note}
        </span>
      </div>
    </div>
  )
}

/**
 * Demande une seconde surface au meme backend, pour montrer le refus.
 *
 * Rien n'est simule : la demande passe par le meme `acquire` que les
 * composants. Elle echoue parce que l'aurore ci-dessus tient deja la seule
 * surface que ce backend accorde.
 */
function ArbitreDemo(): ReactElement {
  const host = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const capacity = surfaceManager.capacity

  return (
    <div className="o-flex o-flex-col o-gap-4 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-6">
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        Plafond de cette page :{' '}
        <span className="o-font-mono o-text-zinc-900 dark:o-text-zinc-50">
          {capacity.max}
        </span>{' '}
        surfaces au total,{' '}
        <span className="o-font-mono o-text-zinc-900 dark:o-text-zinc-50">
          {capacity.maxPerBackend}
        </span>{' '}
        par backend.
      </p>

      <div ref={host} className="o-hidden" />

      <div className="o-flex o-flex-wrap o-gap-2">
        {(['ogl', 'three'] as const).map((backend) => (
          <button
            key={backend}
            type="button"
            onClick={() => {
              const element = host.current
              if (element === null) return

              const result = surfaceManager.acquire({
                backend,
                name: `documentation : demande ${backend}`,
                host: element,
              })

              if (result.ok) {
                setMessage(`${backend} : accordee. Elle est rendue tout de suite.`)
                result.surface.release()
              } else {
                // Le message vient de l'arbitre : le reformuler ici ferait
                // deux versions de la meme phrase, qui divergeraient.
                setMessage(`${backend} : refusee (${result.reason}) — ${result.message}`)
              }
            }}
            className="o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer o-font-mono"
          >
            Demander une surface {backend}
          </button>
        ))}
      </div>

      {message === null ? null : (
        <p className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          {message}
        </p>
      )}

      <p className="o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
        Le backend leger est deja pris par l effet ci-dessus. C est ce qui rend le premier
        bouton instructif.
      </p>
    </div>
  )
}

/** Page de la couche graphique. */
export function MoteurWebgl(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-engine"
        title="Surfaces WebGL"
        lead="Deux backends, un arbitre qui compte les contextes, et un repli obligatoire pour tout ce qui coute cher."
      />

      <Section
        title="Un effet plein ecran"
        lead="Le backend leger rend un triangle qui couvre l'ecran et laisse le shader de fragment faire le travail. Treize kilo-octets compresses, contre cent trente pour une scene 3D."
      >
        <SurfaceDemo />

        <Callout>
          Il n y a <strong>qu une</strong> surface sur cette page, et le selecteur change
          son shader plutot que d en ouvrir une seconde. Ce n est pas une economie : l
          arbitre n accorde qu un contexte par backend. Deux aurores cote a cote seraient
          une demonstration qui contredit ce qu elle explique.
        </Callout>

        <CodeBlock
          code={`import { AURORA_FRAGMENT, useShaderSurface } from 'odoro-engine'

function Aurore(): ReactElement {
  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: AURORA_FRAGMENT,
    uniforms: { uSpeed: 0.12, uScale: 2.4 },
    name: 'aurore',
  })

  return (
    <div className="o-relative o-h-screen">
      <div ref={ref} className="o-absolute o-inset-0" />
      {ready && refused === undefined ? null : (
        <div className="o-absolute o-inset-0 o-bg-gradient-to-br o-from-indigo-900 o-to-cyan-700" />
      )}
    </div>
  )
}`}
        />

        <Callout>
          Le repli n est pas une precaution : c est la moitie du composant. Il est affiche
          pendant le chargement, quand WebGL manque, quand l arbitre refuse, et sous
          mouvement reduit. Le registre refuse de publier un composant couteux qui n en
          declare pas.
        </Callout>
      </Section>

      <Section
        title="Pourquoi un arbitre"
        lead="Les navigateurs plafonnent le nombre de contextes WebGL vivants. Passe la limite, le plus ancien est perdu — silencieusement. Le canevas devient noir, et rien dans la console n'explique pourquoi."
      >
        <ArbitreDemo />

        <PropsTable
          rows={[
            {
              name: 'plafond-global',
              type: 'refus',
              description: 'Le nombre total de surfaces vivantes est atteint.',
            },
            {
              name: 'plafond-backend',
              type: 'refus',
              description:
                'Ce backend a deja la sienne. Deux backends ne partagent jamais un contexte : leurs etats se marcheraient dessus.',
            },
            {
              name: 'webgl-indisponible',
              type: 'refus',
              description: 'Materiel ou reglage : le contexte n a pas pu etre cree.',
            },
            {
              name: 'hors-navigateur',
              type: 'refus',
              description: 'Rendu cote serveur : il n y a pas de document.',
            },
          ]}
        />

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Un refus n est pas une erreur. C est une reponse, que l appelant sait traiter :
          il affiche son repli. Le contraire — accorder toujours, et laisser le navigateur
          trancher — produit une page ou un fond disparait sans que personne ne puisse
          dire lequel ni quand.
        </p>
      </Section>

      <Section
        title="Ce qui est libere"
        lead="Rien ne l'est tout seul. Les bibliotheques 3D ne collectent ni les geometries, ni les materiaux, ni les textures : elles exposent une methode qu'il faut appeler."
      >
        <CodeBlock
          code={`// A la sortie : geometries, materiaux, textures, puis le contexte.
disposeScene(scene, renderer)

// L arbitre libere la surface et retire le canevas.
surface.release()`}
        />
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Le moteur enregistre chaque surface. Ce qui n est pas libere apparait au
          diagnostic, au lieu de se deviner dans un profil memoire.
        </p>
      </Section>
    </>
  )
}
