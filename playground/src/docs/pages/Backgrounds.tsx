/**
 * Backgrounds : la categorie des fonds animes, chacun dans un atelier.
 *
 * Les composants viennent du registre, installes par la CLI. Le contenu de
 * demonstration est affiche par defaut : un fond se juge a ce qu'il laisse
 * lire, pas a ce qu'il montre seul.
 *
 * @module
 */

import { useState, type ReactElement } from 'react'

import { Aurora } from '@/odoro/background/Aurora.jsx'
import { Molten } from '@/odoro/hero/Molten.jsx'
import { Atelier } from '../components/Atelier.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Le heros, monte a la demande : il telecharge cent trente kilo-octets. */
function MoltenDemo(): ReactElement {
  const [mounted, setMounted] = useState(false)

  return (
    <Atelier
      height="o-h-96"
      controls={[
        {
          kind: 'range',
          name: 'amplitude',
          label: 'Deformation',
          min: 0,
          max: 0.7,
          step: 0.01,
          value: 0.28,
        },
        {
          kind: 'range',
          name: 'glow',
          label: 'Halo',
          min: 0,
          max: 3,
          step: 0.1,
          value: 0.8,
        },
        {
          kind: 'range',
          name: 'parallax',
          label: 'Pointeur',
          min: 0,
          max: 1,
          step: 0.05,
          value: 0.25,
        },
      ]}
    >
      {(values) =>
        mounted ? (
          <Molten
            className="o-absolute o-inset-0"
            amplitude={values['amplitude'] as number}
            glow={values['glow'] as number}
            parallax={values['parallax'] as number}
          />
        ) : (
          <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-p-6 o-text-center">
            <p className="o-max-w-sm o-text-sm o-opacity-80">
              Cette scene telecharge environ 130 Ko compresses. Elle n est pas montee tant
              que vous ne le demandez pas.
            </p>
            <button
              type="button"
              onClick={() => setMounted(true)}
              className="o-h-9 o-px-4 o-text-sm o-rounded-md o-border-w-1 o-border-current o-cursor-pointer"
            >
              Monter la scene
            </button>
          </div>
        )
      }
    </Atelier>
  )
}

/** Page de la categorie Backgrounds. */
export function Backgrounds(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-bits"
        title="Backgrounds"
        lead="Des fonds animes sur notre moteur. Reglables ici meme, et poses sous un contenu de demonstration — un fond se juge a ce qu'il laisse lire."
      />

      <Callout>
        L interrupteur <strong>Demo</strong> coupe le contenu pour voir l effet nu. Les
        deux questions sont legitimes ; un catalogue qui ne montre que la seconde laisse
        decouvrir la premiere en production.
      </Callout>

      <Section
        title="Aurore"
        lead="Bruit fractal a deplacement de domaine, dans un triangle plein cadre. Treize kilo-octets compresses, et les couleurs viennent de la palette."
      >
        <Atelier
          height="o-h-96"
          controls={[
            {
              kind: 'range',
              name: 'speed',
              label: 'Vitesse',
              min: 0,
              max: 0.6,
              step: 0.01,
              value: 0.12,
            },
            {
              kind: 'range',
              name: 'scale',
              label: 'Echelle',
              min: 0.5,
              max: 8,
              step: 0.1,
              value: 2.4,
            },
            {
              kind: 'range',
              name: 'octaves',
              label: 'Octaves',
              min: 1,
              max: 6,
              step: 1,
              value: 4,
            },
          ]}
        >
          {(values) => (
            <Aurora
              className="o-absolute o-inset-0"
              speed={values['speed'] as number}
              scale={values['scale'] as number}
              octaves={values['octaves'] as number}
            />
          )}
        </Atelier>

        <CodeBlock
          code={`// Trois tokens, pas trois valeurs : changer le theme change le fond.
<Aurora colors={['--o-palette-brand-600', '--o-palette-fuchsia-600', '--o-palette-zinc-50']} />`}
        />
      </Section>

      <Section
        title="Molten"
        lead="Une masse en fusion, deformee par un bruit tridimensionnel. C'est le composant le plus cher du registre, et la CLI l'annonce avant d'ecrire."
      >
        <MoltenDemo />

        <Callout tone="warning">
          Environ 130 Ko compresses au premier affichage, contre 13 pour le backend leger.
          Si l effet recherche n a besoin ni de camera, ni de profondeur, ni de
          silhouette, l aurore fait le meme travail pour un dixieme du poids.
        </Callout>
      </Section>

      <Section
        title="Ce qui vient ensuite"
        lead="Cette categorie s'etoffe : maillages, vagues, champs de points, motifs CSS sans WebGL, et d'autres heros 3D."
      >
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Chacun passera par le meme atelier et le meme contrat : couleurs prises dans la
          palette, repli obligatoire des que le cout est eleve, et rien qui se monte sous
          mouvement reduit.
        </p>
      </Section>
    </>
  )
}
