/**
 * Bibliotheque de presets d'animation.
 *
 * Un preset est un jeu d'images-cles pret a jouer, accompagne d'une duree et
 * d'une courbe par defaut adaptees a son registre : les entrees decelerent,
 * les sorties accelerent, les animations d'attention ponctuent. Les presets
 * s'utilisent par nom dans {@link Animate} et {@link Reveal}, ou directement
 * avec {@link useAnimate} via {@link getMotionPreset}.
 *
 * Les memes mouvements existent en classes CSS (`o-animate-*`) pour les cas
 * sans JavaScript ; ici, ils sont pilotables — declenchement, interruption,
 * enchainement.
 *
 * @module
 */

import type { MotionKeyframe } from './keyframes.js'
import type { DurationInput, EasingInput } from './tokens.js'

/** Un preset : des images-cles et le reglage temporel qui lui va. */
export interface MotionPreset {
  /** Etapes de l'animation. */
  readonly keyframes: readonly Keyframe[]
  /** Duree par defaut. */
  readonly duration: DurationInput
  /** Courbe par defaut. */
  readonly easing: EasingInput
}

/** Construit un preset d'entree : depart fourni, arrivee naturelle. */
function entrance(
  from: Keyframe,
  duration: DurationInput = 'slow',
  easing: EasingInput = 'entrance',
): MotionPreset {
  return {
    keyframes: [from, { opacity: 1, transform: 'none', filter: 'none' }],
    duration,
    easing,
  }
}

/** Construit un preset de sortie : depart naturel, arrivee fournie. */
function exit(
  to: Keyframe,
  duration: DurationInput = 'fast',
  easing: EasingInput = 'exit',
): MotionPreset {
  return {
    keyframes: [{ opacity: 1, transform: 'none', filter: 'none' }, to],
    duration,
    easing,
  }
}

/** Construit un preset d'attention : plusieurs etapes, retour a l'etat naturel. */
function attention(
  keyframes: readonly Keyframe[],
  duration: DurationInput = 700,
  easing: EasingInput = 'standard',
): MotionPreset {
  return { keyframes, duration, easing }
}

/**
 * Tous les presets, par nom.
 *
 * Trois registres :
 * - **entrees** (`*-in`) : faire apparaitre un element ;
 * - **sorties** (`*-out`) : le faire disparaitre — a jouer avant demontage,
 *   typiquement via `usePresence` ;
 * - **attention** : ponctuer un evenement sur un element deja visible.
 */
export const motionPresets = {
  // Entrees.
  'fade-in': entrance({ opacity: 0 }, 'base'),
  'fade-in-up': entrance({ opacity: 0, transform: 'translateY(1rem)' }),
  'fade-in-down': entrance({ opacity: 0, transform: 'translateY(-1rem)' }),
  'fade-in-left': entrance({ opacity: 0, transform: 'translateX(-1rem)' }),
  'fade-in-right': entrance({ opacity: 0, transform: 'translateX(1rem)' }),
  'scale-in': entrance({ opacity: 0, transform: 'scale(0.95)' }, 'base'),
  'zoom-in': entrance({ opacity: 0, transform: 'scale(0.5)' }),
  'blur-in': entrance({ opacity: 0, filter: 'blur(8px)' }),
  'slide-in-up': entrance({ transform: 'translateY(100%)' }),
  'slide-in-down': entrance({ transform: 'translateY(-100%)' }),
  'slide-in-left': entrance({ transform: 'translateX(-100%)' }),
  'slide-in-right': entrance({ transform: 'translateX(100%)' }),
  'flip-in-x': entrance(
    { opacity: 0, transform: 'perspective(800px) rotateX(-90deg)' },
    'slower',
  ),
  'flip-in-y': entrance(
    { opacity: 0, transform: 'perspective(800px) rotateY(-90deg)' },
    'slower',
  ),
  pop: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1.04)', offset: 0.6 },
      { opacity: 1, transform: 'scale(1)' },
    ],
    duration: 'slow',
    easing: 'standard',
  },
  // Sorties.
  'fade-out': exit({ opacity: 0 }),
  'fade-out-up': exit({ opacity: 0, transform: 'translateY(-1rem)' }),
  'fade-out-down': exit({ opacity: 0, transform: 'translateY(1rem)' }),
  'scale-out': exit({ opacity: 0, transform: 'scale(0.95)' }),
  'zoom-out': exit({ opacity: 0, transform: 'scale(0.5)' }),
  'blur-out': exit({ opacity: 0, filter: 'blur(8px)' }),
  'slide-out-up': exit({ transform: 'translateY(-100%)' }, 'slow'),
  'slide-out-down': exit({ transform: 'translateY(100%)' }, 'slow'),
  'slide-out-left': exit({ transform: 'translateX(-100%)' }, 'slow'),
  'slide-out-right': exit({ transform: 'translateX(100%)' }, 'slow'),
  // Attention.
  press: attention(
    [{ transform: 'scale(1)' }, { transform: 'scale(0.97)' }, { transform: 'scale(1)' }],
    'faster',
    'emphasized',
  ),
  bump: attention(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
    'fast',
    'emphasized',
  ),
  shake: attention(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-0.375rem)' },
      { transform: 'translateX(0.375rem)' },
      { transform: 'translateX(-0.375rem)' },
      { transform: 'translateX(0.375rem)' },
      { transform: 'translateX(-0.25rem)' },
      { transform: 'translateX(0)' },
    ],
    600,
  ),
  tada: attention(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.92) rotate(-3deg)' },
      { transform: 'scale(1.08) rotate(3deg)' },
      { transform: 'scale(1.08) rotate(-3deg)' },
      { transform: 'scale(1.08) rotate(3deg)' },
      { transform: 'scale(1)' },
    ],
    800,
  ),
  wobble: attention(
    [
      { transform: 'none' },
      { transform: 'translateX(-1.25rem) rotate(-5deg)' },
      { transform: 'translateX(1rem) rotate(3deg)' },
      { transform: 'translateX(-0.75rem) rotate(-3deg)' },
      { transform: 'translateX(0.5rem) rotate(2deg)' },
      { transform: 'none' },
    ],
    800,
  ),
  jello: attention(
    [
      { transform: 'none' },
      { transform: 'skewX(-12deg) skewY(-12deg)' },
      { transform: 'skewX(6deg) skewY(6deg)' },
      { transform: 'skewX(-3deg) skewY(-3deg)' },
      { transform: 'skewX(1.5deg) skewY(1.5deg)' },
      { transform: 'none' },
    ],
    800,
  ),
  'rubber-band': attention(
    [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.25, 0.75)' },
      { transform: 'scale(0.75, 1.25)' },
      { transform: 'scale(1.15, 0.85)' },
      { transform: 'scale(0.95, 1.05)' },
      { transform: 'scale(1, 1)' },
    ],
    800,
  ),
  flash: attention(
    [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
    900,
  ),
  bounce: attention(
    [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-25%)', easing: 'cubic-bezier(0.8, 0, 1, 1)' },
      { transform: 'translateY(0)', easing: 'cubic-bezier(0, 0, 0.2, 1)' },
      { transform: 'translateY(-12%)', easing: 'cubic-bezier(0.8, 0, 1, 1)' },
      { transform: 'translateY(0)', easing: 'cubic-bezier(0, 0, 0.2, 1)' },
    ],
    900,
  ),
  heartbeat: attention(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)' },
      { transform: 'scale(1)' },
    ],
    1000,
  ),
  wiggle: attention(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(3deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(0deg)' },
    ],
    800,
  ),
  swing: attention(
    [
      { transform: 'rotate(0deg)', transformOrigin: 'top center' },
      { transform: 'rotate(15deg)', transformOrigin: 'top center' },
      { transform: 'rotate(-10deg)', transformOrigin: 'top center' },
      { transform: 'rotate(5deg)', transformOrigin: 'top center' },
      { transform: 'rotate(-5deg)', transformOrigin: 'top center' },
      { transform: 'rotate(0deg)', transformOrigin: 'top center' },
    ],
    800,
  ),
} as const satisfies Record<string, MotionPreset>

/** Nom d'un preset. */
export type MotionPresetName = keyof typeof motionPresets

/**
 * Retourne un preset par son nom.
 *
 * @throws {Error} Si le nom est inconnu : une faute de frappe ne doit pas
 *   produire silencieusement une absence d'animation.
 *
 * @example
 * const [ref, controls] = useAnimate()
 * const { keyframes, duration, easing } = getMotionPreset('tada')
 * void controls.play([...keyframes], { duration, easing })
 */
export function getMotionPreset(name: MotionPresetName): MotionPreset {
  const preset = motionPresets[name]
  if (preset === undefined) {
    throw new Error(`[odoro/motion] Preset inconnu : "${String(name)}".`)
  }
  return preset
}

/**
 * Etats de depart nommes pour {@link Reveal} : le mouvement d'une revelation
 * est defini par son point de depart, l'arrivee etant toujours l'etat naturel.
 */
export const revealPresets = {
  'fade-up': { opacity: 0, transform: 'translateY(1rem)' },
  'fade-down': { opacity: 0, transform: 'translateY(-1rem)' },
  'fade-left': { opacity: 0, transform: 'translateX(-1rem)' },
  'fade-right': { opacity: 0, transform: 'translateX(1rem)' },
  fade: { opacity: 0 },
  scale: { opacity: 0, transform: 'scale(0.92)' },
  zoom: { opacity: 0, transform: 'scale(0.5)' },
  blur: { opacity: 0, filter: 'blur(8px)' },
  'flip-x': { opacity: 0, transform: 'perspective(800px) rotateX(-45deg)' },
  'flip-y': { opacity: 0, transform: 'perspective(800px) rotateY(-45deg)' },
} as const satisfies Record<string, MotionKeyframe>

/** Nom d'un etat de depart de revelation. */
export type RevealPresetName = keyof typeof revealPresets
