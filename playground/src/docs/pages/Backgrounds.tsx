/**
 * Backgrounds : la categorie des fonds animes, chacun dans un atelier.
 *
 * ## Pourquoi un selecteur plutot que cinq cadres
 *
 * L'arbitre du moteur n'accorde qu'un contexte graphique par backend. Cinq
 * fonds en shader affiches ensemble donneraient donc un fond et quatre replis
 * — une page qui contredit ce qu'elle explique.
 *
 * Les fonds en shader partagent un seul atelier, et l'on choisit celui qu'on
 * regarde. Le quadrillage, qui n'emploie aucun contexte, a le sien.
 *
 * @module
 */

import { useState, type ReactElement } from 'react'

import { Aurora } from '@/odoro/background/Aurora.jsx'
import { Beams } from '@/odoro/background/Beams.jsx'
import { Dots } from '@/odoro/background/Dots.jsx'
import { GridLines } from '@/odoro/background/GridLines.jsx'
import { Mesh } from '@/odoro/background/Mesh.jsx'
import { Waves } from '@/odoro/background/Waves.jsx'
import { Molten } from '@/odoro/hero/Molten.jsx'
import { Atelier, type AtelierControl } from '../components/Atelier.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Un reglage a curseur, ecrit une fois plutot que quinze. */
function range(
  name: string,
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
): AtelierControl {
  return { kind: 'range', name, label, min, max, step, value }
}

/** Ce qu'un fond en shader apporte a l'atelier partage. */
interface ShaderEntry {
  /** Titre publie de l'entree, celui du registre. */
  readonly title: string
  readonly controls: readonly AtelierControl[]
  readonly render: (values: Record<string, unknown>) => ReactElement
  readonly note: string
}

/** Les cinq fonds en shader. */
const SHADERS: Readonly<Record<string, ShaderEntry>> = {
  aurore: {
    title: 'Aurore',
    controls: [
      range('speed', 'Vitesse', 0, 0.6, 0.01, 0.12),
      range('scale', 'Echelle', 0.5, 8, 0.1, 2.4),
      range('octaves', 'Octaves', 1, 6, 1, 4),
    ],
    render: (v) => (
      <Aurora
        className="o-absolute o-inset-0"
        speed={v['speed'] as number}
        scale={v['scale'] as number}
        octaves={v['octaves'] as number}
      />
    ),
    note: 'Bruit fractal a deplacement de domaine. Le plus dense des cinq.',
  },
  ondes: {
    title: 'Ondes',
    controls: [
      range('speed', 'Vitesse', 0, 1.5, 0.05, 0.25),
      range('bands', 'Bandes', 1, 8, 1, 5),
      range('amplitude', 'Amplitude', 0, 0.4, 0.01, 0.12),
    ],
    render: (v) => (
      <Waves
        className="o-absolute o-inset-0"
        speed={v['speed'] as number}
        bands={v['bands'] as number}
        amplitude={v['amplitude'] as number}
      />
    ),
    note: 'Trois sinus de frequences non multiples : le motif ne se repete jamais a l oeil.',
  },
  points: {
    title: 'Champ de points',
    controls: [
      range('speed', 'Vitesse', 0, 4, 0.1, 1.2),
      range('density', 'Densite', 4, 40, 1, 14),
      range('radius', 'Rayon', 0.05, 0.45, 0.01, 0.18),
    ],
    render: (v) => (
      <Dots
        className="o-absolute o-inset-0"
        speed={v['speed'] as number}
        density={v['density'] as number}
        radius={v['radius'] as number}
      />
    ),
    note: 'L espace est replie sur lui-meme : le cout ne depend pas du nombre de points.',
  },
  faisceaux: {
    title: 'Faisceaux',
    controls: [
      range('speed', 'Vitesse', 0, 2, 0.05, 0.35),
      range('count', 'Rais', 2, 30, 1, 9),
      range('angle', 'Inclinaison', -1.5, 1.5, 0.05, 0.35),
    ],
    render: (v) => (
      <Beams
        className="o-absolute o-inset-0"
        speed={v['speed'] as number}
        count={v['count'] as number}
        angle={v['angle'] as number}
      />
    ),
    note: 'C est l espace qui tourne, pas les rais : deux multiplications au lieu d une geometrie.',
  },
  nappe: {
    title: 'Nappe',
    controls: [
      range('speed', 'Vitesse', 0, 1.2, 0.05, 0.2),
      range('spread', 'Etendue', 0.2, 1.2, 0.05, 0.55),
    ],
    render: (v) => (
      <Mesh
        className="o-absolute o-inset-0"
        speed={v['speed'] as number}
        spread={v['spread'] as number}
      />
    ),
    note: 'Trois taches suffisent : au-dela, elles se recouvrent et le motif se perd.',
  },
}

/** Noms des fonds, dans l'ordre de declaration. */
const SHADER_NAMES = Object.keys(SHADERS)

/** L'atelier partage par les cinq fonds en shader. */
function ShaderAtelier(): ReactElement {
  const [choice, setChoice] = useState(SHADER_NAMES[0] ?? 'aurore')
  const shader = SHADERS[choice] ?? SHADERS['aurore']
  if (shader === undefined) return <p>Aucun fond declare.</p>

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-flex o-flex-wrap o-gap-2">
        {SHADER_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={choice === name}
            onClick={() => setChoice(name)}
            className={`o-h-8 o-px-3 o-rounded-md o-border-w-1 o-text-sm o-font-mono o-cursor-pointer o-transition-colors ${
              choice === name
                ? 'o-border-brand-500 o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400'
                : 'o-border-zinc-300 dark:o-border-zinc-700 o-text-zinc-500 dark:o-text-zinc-400 hover:o-border-zinc-400 dark:hover:o-border-zinc-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/*
        La cle force un remontage au changement de fond : l'ancienne surface
        est liberee avant que la nouvelle ne soit demandee, sans quoi l'arbitre
        refuserait la seconde faute de contexte disponible.
      */}
      <Atelier key={choice} height="o-h-96" controls={shader.controls}>
        {(values) => shader.render(values as Record<string, unknown>)}
      </Atelier>

      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        <span className="o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
          {shader.title}
        </span>{' '}
        — {shader.note}
      </p>
    </div>
  )
}

/** Page de la categorie Backgrounds. */
export function Backgrounds(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro/bits"
        title="Backgrounds"
        lead="Des fonds animes sur notre moteur. Reglables ici meme, et poses sous un contenu de demonstration — un fond se juge a ce qu'il laisse lire."
      />

      <Callout>
        L interrupteur <strong>Demo</strong> coupe le contenu pour voir l effet nu. Les
        deux questions sont legitimes ; un catalogue qui ne montre que la seconde laisse
        decouvrir la premiere en production.
      </Callout>

      <Section
        title="Cinq fonds en shader"
        lead="Un triangle plein cadre et un shader de fragment. Treize kilo-octets compresses pour le backend, quel que soit le fond choisi — et les couleurs viennent de la palette, pas du shader."
      >
        <ShaderAtelier />

        <Callout tone="warning">
          Il n y a <strong>qu un</strong> cadre pour les cinq, et ce n est pas une
          economie de place : l arbitre n accorde qu un contexte graphique par backend.
          Cinq fonds cote a cote donneraient un fond et quatre replis.
        </Callout>

        <CodeBlock
          code={`// Les couleurs sont des tokens, pas des valeurs.
<Waves colors={['--o-palette-zinc-950', '--o-palette-brand-500']} bands={6} />`}
        />
      </Section>

      <Section
        title="Un fond sans contexte graphique"
        lead="Un quadrillage est une repetition reguliere : deux degrades le decrivent exactement, et le compositeur le dessine seul."
      >
        <Atelier
          height="o-h-80"
          controls={[
            range('size', 'Pas', 16, 120, 4, 48),
            range('thickness', 'Epaisseur', 1, 4, 1, 1),
            range('speed', 'Derive', 0, 60, 2, 0),
          ]}
        >
          {(values, frame) => (
            <GridLines
              className="o-absolute o-inset-0"
              size={values['size'] as number}
              thickness={values['thickness'] as number}
              speed={values['speed'] as number}
              color={frame.color}
            />
          )}
        </Atelier>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          La consequence pratique compte autant que le principe : celui-ci se pose autant
          de fois qu on veut sur une page, et il ne coute aucun kilo-octet de backend.
          Prendre une surface graphique pour un quadrillage reviendrait a depenser un
          contexte — dont le navigateur ne distribue qu un nombre limite — pour un
          resultat identique.
        </p>
      </Section>

      <Section
        title="Molten"
        lead="Une masse en fusion, deformee par un bruit tridimensionnel. C'est le composant le plus cher du registre, et la CLI l'annonce avant d'ecrire."
      >
        <Atelier
          height="o-h-96"
          deferred={{
            label: 'Scene',
            hint: 'Cette scene telecharge environ 130 Ko compresses. L interrupteur « Scene » du panneau la monte quand vous le decidez.',
          }}
          controls={[
            range('amplitude', 'Deformation', 0, 0.7, 0.01, 0.28),
            range('glow', 'Halo', 0, 3, 0.1, 0.8),
            range('parallax', 'Pointeur', 0, 1, 0.05, 0.25),
          ]}
        >
          {(values) => (
            <Molten
              className="o-absolute o-inset-0"
              amplitude={values['amplitude'] as number}
              glow={values['glow'] as number}
              parallax={values['parallax'] as number}
            />
          )}
        </Atelier>

        <Callout tone="warning">
          Environ 130 Ko compresses au premier affichage, contre 13 pour le backend leger.
          Si l effet recherche n a besoin ni de camera, ni de profondeur, ni de
          silhouette, l un des cinq fonds ci-dessus fait le meme travail pour un dixieme
          du poids.
        </Callout>
      </Section>
    </>
  )
}
