/**
 * The class table of the `orfevre` template.
 *
 * Same three kinds of entry as `altitude-classes.mjs`, which documents them:
 * prefixed, renamed, kept. The names of the renamed ones carry the `or-`
 * prefix of this template, so two templates ported side by side never share a
 * class that means two different things.
 *
 * @module
 */

/** Arbitrary values, and the class of the template that replaces each. */
export const RENAMED = {
  // Les gouttieres et le cadre.
  'px-[max(1.5rem,3vw)]': 'or-gouttiere',
  'px-[max(1.5rem,5vw)]': 'or-gouttiere-film',
  'inset-x-[max(1.5rem,3vw)]': 'or-inset-gouttiere',
  'left-[max(1.5rem,3vw)]': 'or-gauche-gouttiere',
  'max-w-[110rem]': 'or-cadre',

  // Les durees et la courbe, toutes prises aux jetons.
  'duration-[var(--duration)]': 'or-duree',
  'duration-[var(--duration-fast)]': 'or-duree-vive',
  'duration-[var(--duration-slow)]': 'or-duree-lente',
  'duration-[1200ms]': 'or-duree-1200',
  'ease-[var(--raw-ease)]': 'or-ease',
  'tracking-[0.3em]': 'or-track-30',

  // L echelle de corps.
  'text-[0.85rem]': 'or-fs-85',
  'text-[0.875rem]': 'or-fs-875',
  'text-[0.95rem]': 'or-fs-95',
  'text-[1rem]': 'or-fs-100',
  'text-[1.05rem]': 'or-fs-105',
  'text-[1.15rem]': 'or-fs-115',
  'text-[1.4rem]': 'or-fs-140',
  'text-[1.6rem]': 'or-fs-160',
  'text-[1.75rem]': 'or-fs-175',
  'text-[27vw]': 'or-fs-27vw',

  // Les titres, fluides.
  'text-[clamp(1.5rem,2.3vw,2.1rem)]': 'or-fs-t4',
  'text-[clamp(1.6rem,2.4vw,2.2rem)]': 'or-fs-t4b',
  'text-[clamp(1.7rem,2.6vw,2.4rem)]': 'or-fs-t3',
  'text-[clamp(2rem,3.6vw,3.5rem)]': 'or-fs-t2',
  'text-[clamp(2.2rem,4vw,3.6rem)]': 'or-fs-t2b',
  'text-[clamp(2.2rem,4.2vw,3.8rem)]': 'or-fs-t2c',
  'text-[clamp(2.6rem,6.4vw,6rem)]': 'or-fs-t1',

  // Les largeurs de lecture.
  'max-w-[18ch]': 'or-mw-18ch',
  'max-w-[38ch]': 'or-mw-38ch',
  'max-w-[44ch]': 'or-mw-44ch',
  'max-w-[46ch]': 'or-mw-46ch',
  'max-w-[52ch]': 'or-mw-52ch',
  'max-w-[30rem]': 'or-mw-30',
  'max-w-[38rem]': 'or-mw-38',
  'max-w-[46rem]': 'or-mw-46',

  // Les respirations verticales.
  'py-[clamp(5rem,12vh,9rem)]': 'or-py-section',
  'pt-[clamp(5rem,12vh,9rem)]': 'or-pt-section',
  'mt-[clamp(3rem,7vh,5rem)]': 'or-mt-bloc',
  'mt-[clamp(4rem,10vh,7rem)]': 'or-mt-grand',
  'gap-[clamp(3rem,6vw,6rem)]': 'or-gap-grand',
  'pb-[max(2rem,5vh)]': 'or-pb-bas',

  // Les grilles nommees.
  'lg:grid-cols-[1.1fr_1fr]': 'or-cols-contact',
  'md:grid-cols-[1.4fr_repeat(3,1fr)]': 'or-cols-quatre',
  'md:grid-cols-[5rem_1fr_1.1fr]': 'or-cols-service',
  'md:w-[54%]': 'or-w-54',

  // Le chrome du hero : un bouton dont le libelle glisse au survol, et la
  // lueur oblique qui le traverse.
  'bg-[linear-gradient(90deg,transparent,rgb(255_255_255_/_0.22),transparent)]':
    'or-lueur',
  'skew-x-[-18deg]': 'or-oblique',
  'h-[1.2em]': 'or-h-ligne',
  'bg-[var(--action)]': 'or-fond-action',
  'text-[var(--action-ink)]': 'or-encre-action',

  // Les pas de deplacement, que notre echelle ne decline pas a ces crans.
  'left-5': 'or-gauche-5',
  'top-5': 'or-haut-5',
  'top-7': 'or-haut-7',
  '-translate-x-5': 'or-tx-neg-5',
  'translate-y-5': 'or-ty-5',
  '-translate-x-full': 'or-tx-neg-plein',

  // Le survol d un parent : notre systeme n a pas de variante de groupe.
  'group-hover:scale-[1.03]': 'or-zoom-cible',
  'group-hover:-translate-y-5': 'or-monte-cible',
  'group-hover:translate-y-0': 'or-pose-cible',
  'group-hover:translate-x-0': 'or-entre-cible',
  'group-hover:translate-x-5': 'or-sort-cible',
  'group-hover:translate-x-full': 'or-traverse-cible',
}

/** The template's own vocabulary, left alone. */
export const UNCHANGED = new Set([
  'display',
  'label',
  'glass',
  'panel',
  'reveal-word',
  'sr-only',
  'group',
  'h-dvh',
  'leading-none',
  'border-y',
  'md:border-t-0',
  '-translate-x-1/2',
  '-translate-y-1/2',
  'hover:-translate-y-px',
  'bg-ground',
  'bg-ground-alt',
  'bg-ink',
  'bg-line',
  'border-line',
  'md:border-line',
  'focus:border-ink',
  'text-ink',
  'text-ink-muted',
  'text-ink-faint',
  'hover:text-ink',
  'placeholder:text-ink-faint',
])

/** Strings inside a `className` expression that are not class lists. */
export const IGNORED = new Set(['left', 'right', 'center', 'hidden'])

/** Utilities whose name differs between the two engines. */
export const RESPELLED = {
  border: 'o-border-w-1',
}
