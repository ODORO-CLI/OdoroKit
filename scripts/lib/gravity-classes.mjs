/**
 * The class table of the `gravity` template.
 *
 * Same three kinds of entry as `altitude-classes.mjs`, which documents them.
 * This one is larger than the others, for three reasons that all come back to
 * what our generator deliberately does not produce:
 *
 * - **no negative utility**, so every `-top-32` and `-translate-x-1` becomes a
 *   rule of the template;
 * - **no opacity modifier**, so `bg-white/85` and `text-white/70` become
 *   `color-mix`, which is the house answer to translucency;
 * - **no group variant**, so a child that reacts to the hover of its parent
 *   needs a real selector.
 *
 * @module
 */

/** Arbitrary values, and the class of the template that replaces each. */
export const RENAMED = {
  /*
   * Deux homonymes. Notre systeme connait `o-font-mono` et `o-ease-out`, et
   * n entend pas la meme chose : ici la monospace est la JetBrains Mono, et la
   * courbe part de `0.23, 1`. La passe les prefixait, et la valeur devenait la
   * notre au lieu de la leur — sans qu aucune classe ne manque.
   */
  'font-mono': 'gv-font-mono',
  'ease-out': 'gv-ease-out',

  // ---- Les translucidites. Le systeme ne decline pas d opacite sur une
  // couleur : `color-mix` est ce qui l exprime, et ce que la maison emploie.
  'bg-white/5': 'gv-fond-blanc-5',
  'bg-white/85': 'gv-fond-blanc-85',
  'hover:bg-white/5': 'gv-survol-fond-blanc-5',
  'hover:bg-white/10': 'gv-survol-fond-blanc-10',
  'hover:bg-white/30': 'gv-survol-fond-blanc-30',
  'hover:bg-white/40': 'gv-survol-fond-blanc-40',
  'border-white/10': 'gv-filet-blanc-10',
  'border-white/15': 'gv-filet-blanc-15',
  'border-white/60': 'gv-filet-blanc-60',
  'hover:border-white/30': 'gv-survol-filet-blanc-30',
  'hover:border-white/40': 'gv-survol-filet-blanc-40',
  'text-white/40': 'gv-encre-blanc-40',
  'text-white/70': 'gv-encre-blanc-70',
  'text-white/75': 'gv-encre-blanc-75',
  'text-white/90': 'gv-encre-blanc-90',
  'from-white/75': 'gv-degrade-de',
  'via-white/55': 'gv-degrade-par',
  'to-white/25': 'gv-degrade-vers',
  'bg-[var(--ink)]/10': 'gv-fond-encre-10',
  'bg-[#0a0a12]': 'gv-fond-nuit',
  'text-[var(--ink)]': 'gv-encre',
  'text-[var(--ink-soft)]': 'gv-encre-douce',
  'text-[var(--ink-faint)]': 'gv-encre-faible',
  'bg-clip-text': 'gv-fond-sur-texte',

  // ---- L echelle de corps, ecrite en pixels par l original.
  'text-[9px]': 'gv-fs-9',
  'text-[10px]': 'gv-fs-10',
  'text-[11px]': 'gv-fs-11',
  'text-[12px]': 'gv-fs-12',
  'text-[13px]': 'gv-fs-13',
  'text-[13.5px]': 'gv-fs-135',
  'text-[14px]': 'gv-fs-14',
  'text-[15px]': 'gv-fs-15',
  'text-[16px]': 'gv-fs-16',
  'text-[21px]': 'gv-fs-21',
  'text-[44px]': 'gv-fs-44',
  'text-[2.6rem]': 'gv-fs-26r',
  'text-[2.8rem]': 'gv-fs-28r',
  'text-[3rem]': 'gv-fs-30r',
  'text-[3.25rem]': 'gv-fs-325r',
  'text-[clamp(28px,6vw,64px)]': 'gv-fs-geant',
  'md:text-[16px]': 'gv-md-fs-16',
  'md:text-[19px]': 'gv-md-fs-19',
  'md:text-[23px]': 'gv-md-fs-23',
  'md:text-[54px]': 'gv-md-fs-54',
  'md:text-[80px]': 'gv-md-fs-80',
  'md:text-[96px]': 'gv-md-fs-96',
  'md:text-[112px]': 'gv-md-fs-112',

  // ---- Les interlignes et les approches.
  'leading-[0.95]': 'gv-lh-095',
  'leading-[1.05]': 'gv-lh-105',
  'leading-[1.45]': 'gv-lh-145',
  'leading-[1.55]': 'gv-lh-155',
  'leading-none': 'gv-lh-1',
  'tracking-[-0.02em]': 'gv-tr-neg-02',
  'tracking-[-0.03em]': 'gv-tr-neg-03',
  'tracking-[0.1em]': 'gv-tr-10',
  'tracking-[0.18em]': 'gv-tr-18',
  'tracking-[0.2em]': 'gv-tr-20',
  'tracking-[0.22em]': 'gv-tr-22',
  'tracking-[0.25em]': 'gv-tr-25',

  // ---- Les mesures.
  'h-[18px]': 'gv-h-18',
  'h-[22px]': 'gv-h-22',
  'h-[24px]': 'gv-h-24',
  'h-[28rem]': 'gv-h-28r',
  'h-[32rem]': 'gv-h-32r',
  'w-[18px]': 'gv-w-18',
  'w-[22px]': 'gv-w-22',
  'w-[24px]': 'gv-w-24',
  'w-[28rem]': 'gv-w-28r',
  'w-[32rem]': 'gv-w-32r',
  'md:h-[27px]': 'gv-md-h-27',
  'md:w-[27px]': 'gv-md-w-27',
  'md:w-[280px]': 'gv-md-w-280',
  'gap-[14px]': 'gv-gap-14',
  'pb-[1px]': 'gv-pb-1',
  'min-h-[100svh]': 'gv-min-h-ecran',
  'rounded-t-[2.5rem]': 'gv-coin-haut',
  'md:rounded-t-[4rem]': 'gv-md-coin-haut',
  'shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]': 'gv-ombre-interne',
  'stroke-[2.5]': 'gv-trait-25',
  'duration-200': 'gv-duree-200',
  'duration-300': 'gv-duree-300',
  'duration-500': 'gv-duree-500',
  'duration-[1100ms]': 'gv-duree-1100',

  // ---- Les valeurs negatives : le systeme n en produit aucune.
  '-top-32': 'gv-haut-neg-32',
  '-bottom-40': 'gv-bas-neg-40',
  '-left-32': 'gv-gauche-neg-32',
  '-right-24': 'gv-droite-neg-24',
  '-z-10': 'gv-z-neg-10',
  '-translate-x-1': 'gv-tx-neg-1',
  '-translate-x-[140%]': 'gv-tx-neg-140',
  'hover:-translate-y-1': 'gv-survol-monte',

  // ---- L appui et le survol d un parent.
  'active:scale-95': 'gv-appui-95',
  'active:scale-[0.97]': 'gv-appui-97',
  'group-hover:opacity-100': 'gv-parent-opaque',
  'group-hover:rotate-45': 'gv-parent-tourne',
  'group-hover:scale-105': 'gv-parent-grossit',
  'group-hover:translate-x-0': 'gv-parent-entre',
  'group-hover:translate-x-[140%]': 'gv-parent-traverse',
}

/**
 * The template's own vocabulary, left alone.
 *
 * The loader, the rail, the cursor and the grain are declared in
 * `src/index.css` and were never utilities of an engine. `ch` and
 * `is-leaving` are not classes of appearance at all: the first marks each
 * letter of the loader's word, the second the moment the curtain lifts.
 */
export const UNCHANGED = new Set([
  'display',
  'eyebrow',
  'grain',
  'group',
  'rail',
  'rail-fill',
  'cursor-dot',
  'cursor-ring',
  'link-underline',
  'marquee-track',
  'font-serif-italic',
  // Declarees par `src/index.css`. Notre systeme connait les memes noms sous
  // `o-` : prefixees, le balisage porterait une autre surface de verre, un
  // autre fondu, et la regle qui masque le curseur natif ne trouverait plus sa
  // cible.
  'glass',
  'animate-fade-in',
  'cursor-pointer',
  'font-raleway',
  'ch',
  'is-leaving',
  'loader-root',
  'loader-content',
  'loader-word',
  'loader-mark',
  'loader-meta',
  'loader-status',
  'loader-pct',
  'loader-bar',
  'loader-bar-fill',
])

/**
 * Strings that look like a class and are not one.
 *
 * `inline-block` is the value of a `display` written inline; `glass` is a role
 * of the sphere palette of the WebGL scene, next to `pastel` and `deep`. Our
 * stylesheet knows both under `o-`, which is enough for a textual check to
 * point at them.
 */
export const IGNORED = new Set(['left', 'right', 'center'])

/**
 * Des mots croises ailleurs dans le fichier, qui ressemblent a une classe sans
 * en etre : une valeur de `display`, un role de palette, le nom d un evenement.
 *
 * Ils ne concernent que le controle. Les mettre dans {@link IGNORED} epargnerait
 * aussi la vraie classe du meme nom — ce qui est arrive une fois, et se voyait
 * seulement a la capture.
 */
export const FAUX_AMIS = new Set([
  'hidden',
  'resize',
  'inline-block',
  'glass',
  'pastel',
  'light',
  'medium',
  'deep',
])

/** Utilities whose name differs between the two engines. */
export const RESPELLED = {
  border: 'o-border-w-1',
  'flex-shrink-0': 'o-shrink-0',
}
