/**
 * Les demonstrations vivantes, une par entree de registre.
 *
 * ## La seule chose qui ne peut pas venir du catalogue
 *
 * Le titre, la description, les proprietes, le cout : tout cela est dans le
 * `meta.json`, et la page d'entree le lit. Ce qui ne peut pas s'en deduire,
 * c'est le composant lui-meme — il faut l'importer, et lui donner un contexte
 * ou il ait un sens : un fond veut un cadre plein, un effet de texte veut une
 * phrase, un carrousel veut des diapositives.
 *
 * D'ou cette table, une ligne par entree. Une entree sans ligne reste
 * documentee — sa fiche vient du registre — mais sans apercu, et la page le
 * dit.
 *
 * @module
 */

import { useRef, useState, type ReactElement, type ReactNode } from 'react'

import { Aurora } from '@/odoro/background/Aurora.jsx'
import { Bubbles } from '@/odoro/background/Bubbles.jsx'
import { Caustics } from '@/odoro/background/Caustics.jsx'
import { Cells } from '@/odoro/background/Cells.jsx'
import { Contour } from '@/odoro/background/Contour.jsx'
import { Halftone } from '@/odoro/background/Halftone.jsx'
import { Hex } from '@/odoro/background/Hex.jsx'
import { Mosaic } from '@/odoro/background/Mosaic.jsx'
import { Plasma } from '@/odoro/background/Plasma.jsx'
import { Rain } from '@/odoro/background/Rain.jsx'
import { RippleGrid } from '@/odoro/background/RippleGrid.jsx'
import { Silk } from '@/odoro/background/Silk.jsx'
import { Spectrum } from '@/odoro/background/Spectrum.jsx'
import { Stars } from '@/odoro/background/Stars.jsx'
import { Threads } from '@/odoro/background/Threads.jsx'
import { Tunnel } from '@/odoro/background/Tunnel.jsx'
import { Vortex } from '@/odoro/background/Vortex.jsx'
import { Beams } from '@/odoro/background/Beams.jsx'
import { DotMatrix } from '@/odoro/background/DotMatrix.jsx'
import { GlobeMesh } from '@/odoro/background/GlobeMesh.jsx'
import { OrbitalSphere } from '@/odoro/background/OrbitalSphere.jsx'
import { Dots } from '@/odoro/background/Dots.jsx'
import { GridLines } from '@/odoro/background/GridLines.jsx'
import { Mesh } from '@/odoro/background/Mesh.jsx'
import { Waves } from '@/odoro/background/Waves.jsx'
import { ScrollVideo } from '@/odoro/hero/ScrollVideo.jsx'
import { BookShelf } from '@/odoro/section/BookShelf.jsx'
import { OrbitalTimeline } from '@/odoro/section/OrbitalTimeline.jsx'
import { CardForm } from '@/odoro/ui/CardForm.jsx'
import { HoverRevealButton } from '@/odoro/ui/HoverRevealButton.jsx'
import { PearlButton } from '@/odoro/ui/PearlButton.jsx'
import { ShinyButton } from '@/odoro/ui/ShinyButton.jsx'
import { CinematicFooter } from '@/odoro/section/CinematicFooter.jsx'
import { SignIn } from '@/odoro/section/SignIn.jsx'
import { BorderBeam } from '@/odoro/effect/BorderBeam.jsx'
import { Carousel } from '@/odoro/effect/Carousel.jsx'
import { Deform } from '@/odoro/effect/Deform.jsx'
import { Magnetic } from '@/odoro/effect/Magnetic.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { Parallax } from '@/odoro/effect/Parallax.jsx'
import { ScrollProgress } from '@/odoro/effect/ScrollProgress.jsx'
import { Spotlight } from '@/odoro/effect/Spotlight.jsx'
import { Molten } from '@/odoro/hero/Molten.jsx'
import { Compare } from '@/odoro/image/Compare.jsx'
import { Frame } from '@/odoro/image/Frame.jsx'
import { Player } from '@/odoro/image/Player.jsx'
import { Video } from '@/odoro/image/Video.jsx'
import { Faq } from '@/odoro/section/Faq.jsx'
import { LogoBand } from '@/odoro/section/LogoBand.jsx'
import { RevealGrid } from '@/odoro/section/RevealGrid.jsx'
import { ScrollSteps } from '@/odoro/section/ScrollSteps.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { ShineText } from '@/odoro/text/ShineText.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { Typewriter } from '@/odoro/text/Typewriter.jsx'
import { PointerDampedDemo, PosterDemo } from './demos-hooks.jsx'
import type {
  AtelierControl,
  AtelierFrame,
  AtelierValues,
} from './components/Atelier.jsx'

/** Ce qu'une demonstration declare. */
export interface DemoSpec {
  /** Phrase affichee au-dessus de l'apercu. */
  readonly lead?: string
  /** Hauteur du cadre. */
  readonly height?: string
  /** Affiche le contenu de demonstration par defaut. */
  readonly demoByDefault?: boolean
  /** Reglages, si ceux deduits du meta ne conviennent pas. */
  readonly controls?: readonly AtelierControl[]
  /** Rend la preview derriere un interrupteur. */
  readonly deferred?: { readonly label: string; readonly hint: string }
  /** Rend le composant. */
  readonly render: (values: AtelierValues, frame: AtelierFrame) => ReactNode
}

/** Nombre lu dans les reglages, avec un repli. */
function num(values: AtelierValues, name: string, fallback: number): number {
  const value = values[name]
  return typeof value === 'number' ? value : fallback
}

/** Chaine lue dans les reglages, avec un repli. */
function str(values: AtelierValues, name: string, fallback: string): string {
  const value = values[name]
  return typeof value === 'string' ? value : fallback
}

/** Cadre centre, pour ce qui se juge sur un seul element. */
function Stage({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8 o-text-center">
      {children}
    </div>
  )
}

/** Image de demonstration a structure fine, fabriquee sur place. */
function detailed(): string {
  const lines: string[] = []
  for (let x = 0; x <= 320; x += 20) {
    lines.push(
      `<line x1="${String(x)}" y1="0" x2="${String(x)}" y2="180" stroke="white" stroke-opacity="0.45"/>`,
    )
  }
  for (let y = 0; y <= 180; y += 20) {
    lines.push(
      `<line x1="0" y1="${String(y)}" x2="320" y2="${String(y)}" stroke="white" stroke-opacity="0.45"/>`,
    )
  }

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">',
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#a21caf"/></linearGradient></defs>',
    '<rect width="320" height="180" fill="url(#g)"/>',
    lines.join(''),
    '<circle cx="160" cy="90" r="52" fill="none" stroke="white" stroke-width="3"/>',
    '<circle cx="160" cy="90" r="26" fill="white" fill-opacity="0.9"/>',
    '</svg>',
  ].join('')

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Le sujet de toutes les demonstrations d'image. */
export const SAMPLE = detailed()

/**
 * Une video reelle, et non une source vide.
 *
 * Un `src=""` fait retelecharger la page entiere au navigateur — le langage
 * de balisage le dit explicitement, et React en avertit. Surtout, une
 * demonstration de lecteur video sans video ne demontre rien : ni la lecture,
 * ni le deplacement, ni la coupure du son.
 *
 * Le fichier fait quatre-vingt-dix kilo-octets et vit dans le dossier public.
 */
const CLIP = '/demo/apercu.mp4'

/** L'affiche du meme clip, sa premiere image. */
const CLIP_POSTER = '/demo/apercu.jpg'

/**
 * Un cadre qui defile, pour ce qui se juge au defilement.
 *
 * Quatre composants ne se montrent qu'en defilant : la parallaxe, la barre de
 * progression, les etapes et les cartes empilees. Les hooks du moteur
 * remontent jusqu'au premier ancetre qui defile reellement, si bien qu'un
 * conteneur suffit — il n'y a rien a leur dire.
 */
function Scroller({
  children,
  hauteur,
}: {
  children: ReactNode
  hauteur?: string
}): ReactNode {
  return (
    <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
      {/*
        La hauteur est en pourcentage du cadre, ce qu'aucune classe generee
        n'exprime : l'echelle des utilitaires est en unites d'espacement, et
        inventer `o-h-[220%]` produirait une classe qui n'existe pas — le
        conteneur ne defilerait alors pas du tout, et la demonstration
        resterait inerte sans rien signaler.
      */}
      <div style={hauteur === undefined ? undefined : { height: hauteur }}>
        {children}
      </div>
    </div>
  )
}

/**
 * La barre de progression, posee sur un contenu qui defile dans le cadre.
 *
 * Elle a besoin d'une **cible** : sans elle, elle mesure le document entier,
 * ce qui, dans un apercu, ne bouge pas. C'est le reglage le plus important du
 * composant, et celui qu'on oublie — l'apercu le montre donc explicitement.
 *
 * Elle est aussi ramenee de `fixed` a `sticky` : ancree a la fenetre, elle se
 * poserait en haut de la page, hors du cadre.
 */
function ProgressDemo({
  thickness,
  position,
}: {
  thickness: number
  position: 'top' | 'bottom'
}): ReactElement {
  const contenu = useRef<HTMLDivElement | null>(null)

  return (
    <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
      <ScrollProgress
        target={contenu}
        thickness={thickness}
        position={position}
        className="o-z-10"
        style={{ position: 'sticky' }}
      />
      <div ref={contenu} className="o-space-y-6 o-p-8">
        {Array.from({ length: 9 }, (_, index) => (
          <p key={index} className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
            Paragraphe {index + 1}. La mesure passe par la boucle unique du moteur : deux
            lectures du defilement sur une meme page produiraient le tremblement que cette
            boucle existe precisement pour supprimer.
          </p>
        ))}
      </div>
    </div>
  )
}

/** Les volumes de la demonstration : trois tokens chacun, comme le contrat le demande. */
const SHELF_VOLUMES = [
  {
    id: 'a',
    title: 'Premier volume',
    shelf: 0,
    slot: 0,
    spine: '--o-palette-brand-700',
    cloth: '--o-palette-zinc-900',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'b',
    title: 'Deuxieme volume',
    shelf: 0,
    slot: 1,
    spine: '--o-palette-emerald-700',
    cloth: '--o-palette-zinc-900',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'c',
    title: 'Troisieme volume',
    shelf: 0,
    slot: 2,
    spine: '--o-palette-rose-700',
    cloth: '--o-palette-zinc-900',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'd',
    title: 'Quatrieme volume',
    shelf: 1,
    slot: 0,
    spine: '--o-palette-amber-600',
    cloth: '--o-palette-zinc-900',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'e',
    title: 'Cinquieme volume',
    shelf: 1,
    slot: 1,
    spine: '--o-palette-violet-700',
    cloth: '--o-palette-zinc-900',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'f',
    title: 'Sixieme volume',
    shelf: 1,
    slot: 2,
    spine: '--o-palette-sky-700',
    cloth: '--o-palette-zinc-900',
    edge: '--o-palette-amber-100',
  },
] as const

/**
 * L'etagere et le panneau que la page rend a cote.
 *
 * C'est exactement la frontiere du composant : il signale par `onSelect`, et
 * ce texte-ci n'appartient pas a la scene.
 */
function ShelfDemo(): ReactElement {
  const [ouvert, setOuvert] = useState<string | null>(null)
  const volume = SHELF_VOLUMES.find((item) => item.id === ouvert)

  return (
    <div className="o-absolute o-inset-0">
      <BookShelf
        className="o-absolute o-inset-0"
        volumes={SHELF_VOLUMES}
        selected={ouvert}
        onSelect={setOuvert}
      />
      {volume === undefined ? null : (
        <p className="o-absolute o-bottom-4 o-left-4 o-rounded-lg o-bg-zinc-950 o-px-4 o-py-2 o-text-sm o-text-zinc-50">
          {volume.title}
        </p>
      )}
    </div>
  )
}

/** Un fond qui occupe tout le cadre. */
const fill = (node: ReactNode): ReactNode => (
  <div className="o-absolute o-inset-0">{node}</div>
)

/** Les demonstrations, indexees par identifiant d'entree. */
export const DEMOS: Readonly<Record<string, DemoSpec>> = {
  // ----- Fonds ---------------------------------------------------------------
  'background/aurora': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Bruit fractal a deplacement de domaine. Le plus dense des fonds en shader.',
    render: (v) =>
      fill(
        <Aurora
          className="o-size-full"
          speed={num(v, 'speed', 0.12)}
          scale={num(v, 'scale', 2.4)}
          octaves={num(v, 'octaves', 4)}
        />,
      ),
  },
  'background/waves': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Trois sinus de frequences non multiples : le motif ne se repete jamais a l oeil.',
    render: (v) =>
      fill(
        <Waves
          className="o-size-full"
          speed={num(v, 'speed', 0.25)}
          bands={num(v, 'bands', 5)}
          amplitude={num(v, 'amplitude', 0.12)}
        />,
      ),
  },
  'background/dots': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'L espace est replie sur lui-meme : le cout ne depend pas du nombre de points.',
    render: (v) =>
      fill(
        <Dots
          className="o-size-full"
          speed={num(v, 'speed', 1.2)}
          density={num(v, 'density', 14)}
          radius={num(v, 'radius', 0.18)}
        />,
      ),
  },
  'background/beams': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'C est l espace qui tourne, pas les rais : deux multiplications au lieu d une geometrie.',
    render: (v) =>
      fill(
        <Beams
          className="o-size-full"
          speed={num(v, 'speed', 0.35)}
          count={num(v, 'count', 9)}
          angle={num(v, 'angle', 0.35)}
        />,
      ),
  },
  'background/mesh': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Trois taches suffisent : au-dela, elles se recouvrent et le motif se perd.',
    render: (v) =>
      fill(
        <Mesh
          className="o-size-full"
          speed={num(v, 'speed', 0.2)}
          spread={num(v, 'spread', 0.55)}
        />,
      ),
  },
  'background/grid-lines': {
    height: 'o-h-80',
    demoByDefault: true,
    lead: 'Aucun contexte graphique : celui-ci se pose autant de fois qu on veut sur une page.',
    render: (v, frame) =>
      fill(
        <GridLines
          className="o-size-full"
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 1)}
          speed={num(v, 'speed', 0)}
          color={frame.color}
        />,
      ),
  },

  'background/bubbles': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Deux disques dessines cote a cote restent deux disques ; deux champs additionnes fusionnent.',
    render: (v) =>
      fill(
        <Bubbles
          className="o-size-full"
          speed={num(v, 'speed', 0.25)}
          count={num(v, 'count', 9)}
          radius={num(v, 'radius', 0.09)}
        />,
      ),
  },
  'background/caustics': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Cinq replis de l espace. La distance accumulee dessine les filaments.',
    render: (v) =>
      fill(
        <Caustics
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          scale={num(v, 'scale', 4)}
          intensity={num(v, 'intensity', 1)}
        />,
      ),
  },
  'background/cells': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'La difference entre premiere et seconde distance s annule sur les aretes.',
    render: (v) =>
      fill(
        <Cells
          className="o-size-full"
          speed={num(v, 'speed', 0.35)}
          density={num(v, 'density', 7)}
          edge={num(v, 'edge', 0.06)}
        />,
      ),
  },
  'background/contour': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'L epaisseur du trait est corrigee par la derivee du champ, donc constante partout.',
    render: (v) =>
      fill(
        <Contour
          className="o-size-full"
          speed={num(v, 'speed', 0.06)}
          scale={num(v, 'scale', 2.2)}
          levels={num(v, 'levels', 8)}
        />,
      ),
  },
  'background/halftone': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'La trame est bicolore : c est la taille des points qui simule la nuance.',
    render: (v) =>
      fill(
        <Halftone
          className="o-size-full"
          speed={num(v, 'speed', 0.12)}
          density={num(v, 'density', 26)}
          angle={num(v, 'angle', 0.26)}
        />,
      ),
  },
  'background/hex': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Deux grilles rectangulaires decalees d une demi-maille en font une hexagonale.',
    render: (v) =>
      fill(
        <Hex
          className="o-size-full"
          speed={num(v, 'speed', 0.6)}
          density={num(v, 'density', 9)}
          edge={num(v, 'edge', 0.04)}
        />,
      ),
  },
  'background/mosaic': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Le champ est lu au centre de la cellule : le carreau n existe nulle part dans le calcul.',
    render: (v) =>
      fill(
        <Mosaic
          className="o-size-full"
          speed={num(v, 'speed', 0.05)}
          density={num(v, 'density', 16)}
          gap={num(v, 'gap', 0.06)}
        />,
      ),
  },
  'background/plasma': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Quatre sinus au meme point. La figure n est faite que de leurs battements.',
    render: (v) =>
      fill(
        <Plasma
          className="o-size-full"
          speed={num(v, 'speed', 0.35)}
          scale={num(v, 'scale', 3)}
        />,
      ),
  },
  'background/rain': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Une vitesse par colonne : sans ce decalage, la pluie tomberait en rangs.',
    render: (v) =>
      fill(
        <Rain
          className="o-size-full"
          speed={num(v, 'speed', 0.6)}
          columns={num(v, 'columns', 60)}
          length={num(v, 'length', 0.35)}
        />,
      ),
  },
  'background/ripple-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'A amplitude nulle, la grille sans WebGL fait le meme travail pour bien moins cher.',
    render: (v) =>
      fill(
        <RippleGrid
          className="o-size-full"
          speed={num(v, 'speed', 0.4)}
          density={num(v, 'density', 14)}
          amplitude={num(v, 'amplitude', 0.06)}
        />,
      ),
  },
  'background/silk': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Le deplacement de domaine applique deux fois : une passe froisse, deux font couler.',
    render: (v) =>
      fill(
        <Silk
          className="o-size-full"
          speed={num(v, 'speed', 0.08)}
          scale={num(v, 'scale', 1.6)}
          octaves={num(v, 'octaves', 4)}
        />,
      ),
  },
  'background/spectrum': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Trois cosinus decales d un tiers de tour : le balayage ne traverse jamais de gris.',
    render: (v) =>
      fill(
        <Spectrum
          className="o-size-full"
          speed={num(v, 'speed', 0.08)}
          turns={num(v, 'turns', 1)}
          saturation={num(v, 'saturation', 0.5)}
        />,
      ),
  },
  'background/stars': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Trois profondeurs a trois vitesses. Une seule couche se lirait comme une texture qui glisse.',
    render: (v) =>
      fill(
        <Stars
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          density={num(v, 'density', 24)}
          twinkle={num(v, 'twinkle', 0.6)}
        />,
      ),
  },
  'background/threads': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'L epaisseur est divisee par la pente : sans cela le fil s epaissirait sur les plats.',
    render: (v) =>
      fill(
        <Threads
          className="o-size-full"
          speed={num(v, 'speed', 0.3)}
          count={num(v, 'count', 7)}
          thickness={num(v, 'thickness', 0.004)}
        />,
      ),
  },
  'background/tunnel': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'z = 1/r : toute la perspective tient dans cette division.',
    render: (v) =>
      fill(
        <Tunnel
          className="o-size-full"
          speed={num(v, 'speed', 0.25)}
          rings={num(v, 'rings', 0.6)}
          segments={num(v, 'segments', 12)}
        />,
      ),
  },
  'background/vortex': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'En polaires, un tourbillon n est pas un mouvement mais une addition.',
    render: (v) =>
      fill(
        <Vortex
          className="o-size-full"
          speed={num(v, 'speed', 0.25)}
          arms={num(v, 'arms', 6)}
          twist={num(v, 'twist', 2.5)}
        />,
      ),
  },

  'background/dot-matrix': {
    height: 'o-h-96',
    demoByDefault: true,
    lead: 'Une grille qui s allume depuis le centre. Le sens est un uniforme : l aller et le retour partagent la seule surface que l arbitre accorde.',
    render: (v) =>
      fill(
        <DotMatrix
          className="o-size-full"
          reverse={v['reverse'] === true}
          speed={num(v, 'speed', 0.6)}
          cells={num(v, 'cells', 42)}
          dot={num(v, 'dot', 0.3)}
          flicker={num(v, 'flicker', 0.7)}
        />,
      ),
  },

  'background/orbital-sphere': {
    height: 'o-h-96',
    demoByDefault: true,
    deferred: {
      label: 'Scene',
      hint: 'Cette scene telecharge environ 130 Ko compresses. L interrupteur la monte quand vous le decidez.',
    },
    lead: 'Une sphere de points repartis par la spirale de Fibonacci, ceinte d anneaux inclines.',
    render: (v) =>
      fill(
        <OrbitalSphere
          className="o-size-full"
          points={num(v, 'points', 2400)}
          rings={num(v, 'rings', 3)}
          nodes={num(v, 'nodes', 12)}
          rpm={num(v, 'rpm', 2)}
        />,
      ),
  },
  'background/globe-mesh': {
    height: 'o-h-96',
    demoByDefault: true,
    deferred: {
      label: 'Scene',
      hint: 'Cette scene telecharge environ 130 Ko compresses. Elle se glisse au pointeur, et ses faces s allument.',
    },
    lead: 'Trois appels de dessin quelle que soit la densite : tout est derive dans le shader.',
    render: (v) =>
      fill(
        <GlobeMesh
          className="o-size-full"
          density={num(v, 'density', 14)}
          spin={num(v, 'spin', 8)}
          detail={num(v, 'detail', 1)}
          sweepAngle={num(v, 'sweepAngle', 90)}
        />,
      ),
  },

  'background/ashen-press': {
    height: 'o-h-96',
    lead: 'Une porte vers un paquet tiers : rien n est telecharge avant l approche du champ, et rien du tout sous mouvement reduit.',
    render: () => (
      <Stage>
        <p className="o-max-w-sm o-text-center o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
          Cette entree demande le paquet threeui, que le registre n embarque pas. Elle
          ouvre en outre sa propre surface WebGL, hors de l arbitre du moteur : un seul
          fond de ce genre par page.
        </p>
      </Stage>
    ),
  },

  // ----- Heros ---------------------------------------------------------------
  'hero/molten': {
    height: 'o-h-96',
    demoByDefault: true,
    deferred: {
      label: 'Scene',
      hint: 'Cette scene telecharge environ 130 Ko compresses. L interrupteur « Scene » du panneau la monte quand vous le decidez.',
    },
    lead: 'Une masse en fusion, deformee par un bruit tridimensionnel.',
    render: (v) =>
      fill(
        <Molten
          className="o-size-full"
          amplitude={num(v, 'amplitude', 0.28)}
          glow={num(v, 'glow', 0.8)}
          parallax={num(v, 'parallax', 0.25)}
        />,
      ),
  },

  'hero/scroll-video': {
    height: 'o-h-96',
    lead: 'Le defilement fait avancer la video, sans jamais verrouiller la page : une enveloppe haute, une scene collante, et la progression reelle.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <ScrollVideo
          src={CLIP}
          poster={CLIP_POSTER}
          description="Un degrade anime, avec un carre qui derive"
          title="La ville s ouvre"
          tagline="Chaque porte est deja ouverte."
          range={num(v, 'range', 3)}
          ease={num(v, 'ease', 6)}
        />
      </div>
    ),
  },

  // ----- Texte ---------------------------------------------------------------
  'text/split-reveal': {
    height: 'o-h-56',
    lead: 'Le titre se compose caractere par caractere quand il entre dans le champ.',
    render: (v) => (
      <Stage>
        <SplitReveal
          key={JSON.stringify(v)}
          as="p"
          by={str(v, 'by', 'chars') as 'chars' | 'words' | 'lines'}
          stagger={num(v, 'stagger', 24)}
          distance={num(v, 'distance', 24)}
          className="o-text-3xl o-font-bold o-tracking-tight o-text-balance"
        >
          Construisez des interfaces vivantes
        </SplitReveal>
      </Stage>
    ),
  },
  'text/decode-text': {
    height: 'o-h-56',
    lead: 'Le brouillage n existe que pour l oeil : le texte reste annonce et cherchable.',
    render: (v) => (
      <Stage>
        <DecodeText
          key={JSON.stringify(v)}
          as="p"
          duration={num(v, 'duration', 1200)}
          trigger={str(v, 'trigger', 'view') as 'view' | 'mount' | 'hover'}
          className="o-font-mono o-text-3xl o-font-bold o-tracking-tight"
        >
          ODORO ENGINE
        </DecodeText>
      </Stage>
    ),
  },
  'text/typewriter': {
    height: 'o-h-56',
    lead: 'Celui-ci n emploie pas la boucle : sa frappe avance une image sur trois.',
    render: (v) => (
      <Stage>
        <p className="o-text-2xl o-font-semibold o-tracking-tight">
          Odoro, c est{' '}
          <Typewriter
            typeSpeed={num(v, 'typeSpeed', 55)}
            hold={num(v, 'hold', 1400)}
            phrases={[
              'un systeme de style',
              'un moteur d animation',
              'un routeur',
              'un registre de composants',
            ]}
          />
        </p>
      </Stage>
    ),
  },
  'text/shine-text': {
    height: 'o-h-56',
    lead: 'Aucun JavaScript ne s execute apres le premier rendu.',
    render: (v, frame) => (
      <Stage>
        <ShineText
          as="p"
          from={frame.color}
          duration={num(v, 'duration', 3000)}
          width={num(v, 'width', 30)}
          className="o-text-5xl o-font-extrabold o-tracking-tight"
        >
          Odoro
        </ShineText>
      </Stage>
    ),
  },

  // ----- Effets --------------------------------------------------------------
  'effect/magnetic': {
    height: 'o-h-64',
    lead: 'L evenement deplace une cible ; c est la boucle qui rejoint la cible.',
    render: (v) => (
      <Stage>
        <Magnetic
          strength={num(v, 'strength', 0.35)}
          radius={num(v, 'radius', 120)}
          ease={num(v, 'ease', 8)}
        >
          <span className="o-inline-flex o-h-12 o-items-center o-rounded-full o-border-w-1 o-border-current o-px-6 o-text-sm o-font-medium">
            Approchez le pointeur
          </span>
        </Magnetic>
      </Stage>
    ),
  },
  'effect/spotlight': {
    height: 'o-h-72',
    lead: 'Deux variables CSS ecrites au deplacement, aucun rendu React.',
    render: (v) => (
      <Stage>
        <Spotlight
          size={num(v, 'size', 320)}
          border={v['border'] !== false}
          className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-6"
        >
          <h4 className="o-text-lg o-font-semibold">Une carte</h4>
          <p className="o-mt-2 o-text-sm o-opacity-70">
            Le halo est sous le pointeur : tout retard se verrait comme un decalage.
          </p>
        </Spotlight>
      </Stage>
    ),
  },
  'effect/border-beam': {
    height: 'o-h-72',
    lead: 'Un degrade conique tourne autour du centre : la bande balaie tout le contour.',
    render: (v, frame) => (
      <Stage>
        <BorderBeam
          duration={num(v, 'duration', 4000)}
          width={num(v, 'width', 2)}
          trail={num(v, 'trail', 25)}
          color={frame.color}
          className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-6"
        >
          <h4 className="o-text-lg o-font-semibold">Mise en avant</h4>
          <p className="o-mt-2 o-text-sm o-opacity-70">
            La couleur du trait suit celle du texte.
          </p>
        </BorderBeam>
      </Stage>
    ),
  },
  'effect/marquee': {
    height: 'o-h-40',
    lead: 'Le contenu est rendu deux fois et translate de la moitie : la boucle ne se voit pas.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center">
        <Marquee
          speed={num(v, 'speed', 40)}
          reverse={v['reverse'] === true}
          pauseOnHover={v['pauseOnHover'] !== false}
          fade={num(v, 'fade', 12)}
          className="o-w-full"
        >
          {['Routeur', 'Styles', 'Animations', 'Moteur', 'Registre', 'CLI'].map(
            (word) => (
              <span
                key={word}
                className="o-px-8 o-text-2xl o-font-bold o-tracking-tight o-opacity-70"
              >
                {word}
              </span>
            ),
          )}
        </Marquee>
      </div>
    ),
  },
  'effect/carousel': {
    height: 'o-h-72',
    lead: 'Le defilement natif apporte le geste, l inertie et le clavier.',
    render: (v, frame) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center o-p-6">
        <Carousel
          label="Exemple de carrousel"
          perView={num(v, 'perView', 2)}
          gap={num(v, 'gap', 16)}
          loop={v['loop'] === true}
          className="o-w-full"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="o-flex o-h-32 o-items-center o-justify-center o-border-w-1 o-border-current o-text-3xl o-font-bold"
              style={{ borderRadius: `${String(frame.radius)}px` }}
            >
              {n}
            </div>
          ))}
        </Carousel>
      </div>
    ),
  },
  'effect/deform': {
    height: 'o-h-80',
    lead: 'Le temoin a gauche, le meme contenu deforme a droite. Une deformation ne se voit que sur du detail.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-grid o-grid-cols-2 o-items-center o-gap-6 o-p-6">
        <div className="o-flex o-flex-col o-items-center o-gap-2">
          <span className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">sans</span>
          <Frame src={SAMPLE} alt="" ratio={16 / 9} className="o-w-full o-rounded-lg" />
        </div>
        <div className="o-flex o-flex-col o-items-center o-gap-2">
          <span className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">
            deforme
          </span>
          <Deform
            className="o-w-full"
            amount={num(v, 'amount', 22)}
            frequency={num(v, 'frequency', 0.014)}
            speed={num(v, 'speed', 0.15)}
            octaves={num(v, 'octaves', 1)}
            edges={str(v, 'edges', 'clean') as 'clean' | 'organic'}
          >
            <Frame src={SAMPLE} alt="" ratio={16 / 9} className="o-w-full o-rounded-lg" />
          </Deform>
        </div>
      </div>
    ),
  },

  // ----- Images --------------------------------------------------------------
  'image/frame': {
    height: 'o-h-80',
    lead: 'Le rapport est pose des le premier rendu : l image qui arrive ne pousse rien.',
    render: (v) => (
      <Stage>
        <Frame
          src={SAMPLE}
          alt="Image de demonstration"
          ratio={num(v, 'ratio', 1.777)}
          zoom={num(v, 'zoom', 0.08)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/compare': {
    height: 'o-h-80',
    lead: 'Un curseur, pas une image cliquable : les fleches le deplacent.',
    render: (v) => (
      <Stage>
        <Compare
          label="Comparaison de demonstration"
          before={{ src: SAMPLE, alt: 'Version initiale' }}
          after={{ src: detailed(), alt: 'Version retouchee' }}
          start={num(v, 'start', 50)}
          ratio={num(v, 'ratio', 1.777)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/video': {
    height: 'o-h-80',
    lead: 'La lecture attend l entree dans le champ, et n a jamais lieu sous mouvement reduit.',
    render: (v) => (
      <Stage>
        <Video
          src={CLIP}
          poster={CLIP_POSTER}
          description="Un degrade anime, avec un carre qui derive"

          ratio={num(v, 'ratio', 1.777)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/player': {
    height: 'o-h-96',
    lead: 'Ce qui reste au natif reste au natif : decodage, sous-titres, plein ecran.',
    render: (v) => (
      <Stage>
        <Player
          src={CLIP}
          poster={CLIP_POSTER}
          label="Video de demonstration"
          ratio={num(v, 'ratio', 1.777)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },

  // ----- Sections ------------------------------------------------------------
  'section/reveal-grid': {
    height: 'o-h-96',
    lead: 'Transitions CSS decalees : aucun JavaScript ne s execute pendant l animation.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <RevealGrid
          key={JSON.stringify(v)}
          columns={num(v, 'columns', 3)}
          stagger={num(v, 'stagger', 70)}
          distance={num(v, 'distance', 24)}
        >
          {[
            'Format',
            'Validation',
            'Installation',
            'Contrat',
            'Diagnostic',
            'Publication',
          ].map((titre) => (
            <div
              key={titre}
              className="o-rounded-lg o-border-w-1 o-border-current o-p-4 o-text-sm"
            >
              {titre}
            </div>
          ))}
        </RevealGrid>
      </div>
    ),
  },
  'section/logo-band': {
    height: 'o-h-56',
    lead: 'Le defilement vient de effect/marquee : cette section n ajoute qu une mise en page.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center">
        <LogoBand title="Ils emploient Odoro" speed={num(v, 'speed', 30)}>
          {['Atelier', 'Studio Nord', 'Fabrique', 'Comptoir', 'Maison Verte'].map(
            (nom) => (
              <span key={nom} className="o-text-lg o-font-semibold o-opacity-60">
                {nom}
              </span>
            ),
          )}
        </LogoBand>
      </div>
    ),
  },
  'section/faq': {
    height: 'o-h-96',
    lead: 'Le repliage est natif : c est ce qui rend les reponses trouvables par la recherche du navigateur.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <Faq
          single={v['single'] !== false}
          items={[
            {
              question: 'Pourquoi copier plutot que dependre ?',
              answer: <p>Un composant d animation est presque toujours retouche.</p>,
            },
            {
              question: 'Que se passe-t-il sous mouvement reduit ?',
              answer: <p>L animation est neutralisee, jamais l etat final.</p>,
            },
            {
              question: 'Deux fonds en shader sur une page ?',
              answer: <p>Non : l arbitre n accorde qu un contexte par backend.</p>,
            },
          ]}
        />
      </div>
    ),
  },

  'effect/parallax': {
    height: 'o-h-96',
    lead: 'Faites defiler dans le cadre : le contenu se deplace moins vite que lui.',
    render: (v) => (
      <Scroller hauteur="220%">
        <div className="o-flex o-h-full o-flex-col o-justify-center o-gap-6 o-p-8">
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Defilez vers le bas
          </p>
          <div className="o-relative o-h-48 o-overflow-hidden o-rounded-xl">
            <Parallax
              key={JSON.stringify(v)}
              distance={num(v, 'distance', 80)}
              axis={str(v, 'axis', 'y') === 'x' ? 'x' : 'y'}
              scale={num(v, 'scale', 0)}
              className="o-absolute o-inset-0"
            >
              <img src={SAMPLE} alt="" className="o-size-full o-object-cover" />
            </Parallax>
          </div>
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            et remontez : l image revient a sa place au centre du champ.
          </p>
        </div>
      </Scroller>
    ),
  },
  'effect/scroll-progress': {
    height: 'o-h-96',
    lead: 'Lue dans la boucle du moteur, et non par un rendu React par image. La cible est le contenu, jamais la barre.',
    render: (v) => (
      <ProgressDemo
        thickness={num(v, 'thickness', 3)}
        position={str(v, 'position', 'top') === 'bottom' ? 'bottom' : 'top'}
      />
    ),
  },
  'section/sticky-stack': {
    height: 'o-h-96',
    lead: 'Chaque carte se fige, puis se reduit quand la suivante la recouvre.',
    render: (v) => (
      <Scroller>
        <div className="o-p-6">
          <StickyStack
            key={JSON.stringify(v)}
            offset={num(v, 'offset', 24)}
            gap={num(v, 'gap', 24)}
            shrink={num(v, 'shrink', 0.05)}
          >
            {['Ecrire', 'Valider', 'Compiler', 'Installer'].map((titre, index) => (
              <div
                key={titre}
                className="o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-8 o-shadow-md"
              >
                <p className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400">
                  Etape {index + 1}
                </p>
                <p className="o-text-lg o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">
                  {titre}
                </p>
              </div>
            ))}
          </StickyStack>
        </div>
      </Scroller>
    ),
  },
  'section/scroll-steps': {
    height: 'o-h-96',
    lead: 'Le media reste colle et suit l etape que le defilement a atteinte.',
    render: () => (
      <Scroller>
        <div className="o-p-6">
          <ScrollSteps
            label="Comment une entree arrive dans un projet"
            steps={[
              {
                title: 'Ecrire',
                body: <p>Un dossier, un composant, un meta qui le decrit.</p>,
              },
              {
                title: 'Valider',
                body: <p>Le schema refuse ce qui ne pourrait pas s installer.</p>,
              },
              {
                title: 'Compiler',
                body: <p>Un fichier par entree, source inline, plus un index.</p>,
              },
              {
                title: 'Installer',
                body: (
                  <p>Les fichiers sont copies, jamais lies : ils vous appartiennent.</p>
                ),
              },
            ]}
            render={(index) => (
              <div className="o-flex o-aspect-square o-items-center o-justify-center o-rounded-xl o-bg-gradient-to-br o-from-brand-600 o-to-fuchsia-600 o-text-6xl o-font-bold o-text-white">
                {index + 1}
              </div>
            )}
          />
        </div>
      </Scroller>
    ),
  },

  'section/sign-in': {
    height: 'o-h-96',
    lead: 'Trois ecrans, poses sur la trame qui s inverse a la reussite. Le composant enchaine et previent ; l application decide.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <SignIn
          codeLength={num(v, 'codeLength', 6)}
          legal={<span>En continuant, vous acceptez les conditions.</span>}
        />
      </div>
    ),
  },
  'section/cinematic-footer': {
    height: 'o-h-96',
    lead: 'Le rideau est de la mise en page — une decoupe et un element fixe — et ne coute rien a l execution.',
    render: () => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <div className="o-h-1/2" />
        <CinematicFooter
          heading="On commence ?"
          word="ODORO"
          banner={<span className="o-px-8">Registre — moteur — librairie</span>}
          copyright="© 2026 Odoro"
        />
      </div>
    ),
  },

  'section/orbital-timeline': {
    height: 'o-h-96',
    lead: 'La rotation passe par la boucle du moteur : aucun rendu React pendant qu elle tourne.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-hidden">
        <OrbitalTimeline
          className="o-h-full o-min-h-0"
          radius={num(v, 'radius', 130)}
          rpm={num(v, 'rpm', 1)}
          steps={[
            {
              id: 'cadrage',
              title: 'Cadrage',
              date: 'Janvier',
              status: 'done',
              energy: 100,
              content: <p>Ce que le produit doit faire, et ce qu il ne fera pas.</p>,
            },
            {
              id: 'design',
              title: 'Design',
              date: 'Fevrier',
              status: 'done',
              energy: 90,
              relatedIds: ['cadrage', 'build'],
            },
            {
              id: 'build',
              title: 'Fabrication',
              date: 'Mars',
              status: 'current',
              energy: 60,
              relatedIds: ['design'],
            },
            {
              id: 'recette',
              title: 'Recette',
              date: 'Avril',
              status: 'todo',
              energy: 30,
              relatedIds: ['build'],
            },
          ]}
        />
      </div>
    ),
  },

  'section/book-shelf': {
    height: 'o-h-96',
    demoByDefault: true,
    deferred: {
      label: 'Scene',
      hint: 'Cette scene telecharge environ 130 Ko compresses. Glissez pour tourner le rayon, cliquez pour tirer un volume.',
    },
    lead: 'La scene seule : le panneau de detail et le catalogue appartiennent a la page, qui les rend avec ses propres composants.',
    render: () => <ShelfDemo />,
  },

  // ----- Interface -----------------------------------------------------------
  'ui/shiny-button': {
    height: 'o-h-64',
    lead: 'L angle du degrade est une propriete enregistree, donc animable : aucune boucle JavaScript.',
    render: (v) => (
      <Stage>
        <ShinyButton spin={num(v, 'spin', 3000)}>Acceder sans limite</ShinyButton>
      </Stage>
    ),
  },
  'ui/pearl-button': {
    height: 'o-h-64',
    lead: 'Cinq ombres superposees, sans image ni filtre. Retirer la quatrieme colle le bouton a la page.',
    render: () => (
      <Stage>
        <PearlButton>Commencer</PearlButton>
      </Stage>
    ),
  },
  'ui/hover-reveal-button': {
    height: 'o-h-64',
    lead: 'Deux copies du libelle se croisent : la largeur du bouton ne bouge pas.',
    render: () => (
      <Stage>
        <HoverRevealButton>Nous ecrire</HoverRevealButton>
      </Stage>
    ),
  },
  'ui/card-form': {
    height: 'o-h-96',
    lead: 'Controle de Luhn, et carte qui se retourne au focus du code. A ne pas brancher sur un encaissement reel sans passer par un champ heberge.',
    render: () => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <CardForm />
      </div>
    ),
  },

  // ----- Hooks ---------------------------------------------------------------
  'hooks/use-pointer-damped': {
    height: 'o-h-96',
    lead: 'Promenez le pointeur dans le cadre : le petit cercle est la position brute, le disque la rattrape.',
    render: (v) => <PointerDampedDemo speed={num(v, 'speed', 3)} />,
  },
  'hooks/use-poster': {
    height: 'o-h-96',
    lead: 'Le repli couvre l attente, se fond quand la scene arrive, et reste quand elle ne viendra jamais.',
    render: (v) => <PosterDemo fade={num(v, 'fade', 320)} />,
  },
}
