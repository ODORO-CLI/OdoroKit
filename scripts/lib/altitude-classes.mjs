/**
 * The class table of the `altitude` template, and nothing else.
 *
 * ## Why this is a table and not a hand edit
 *
 * The template arrives written for another utility engine. Its markup is
 * correct, its design is finished, and the instruction is to change neither:
 * only the engine underneath. Retyping seventeen hundred lines by hand to
 * change the class strings inside them is how a margin moves by three pixels
 * on the fourth section and nobody notices.
 *
 * So the source files are copied byte for byte, and one pass rewrites the
 * `className` strings from the table below. What the table cannot express is
 * listed in {@link UNCHANGED} and stays as it is, answered by the template's
 * own stylesheet.
 *
 * ## The three kinds of entry
 *
 * - **Prefixed.** The utility exists in our system under the same name, with
 *   `o-`. Four in five of them. Nothing to decide.
 * - **Renamed.** The original wrote an arbitrary value — `text-[0.95rem]`,
 *   `px-[max(1.5rem,4vw)]`. Our generator produces no such class, and writing
 *   it anyway would paint nothing at all, in silence. Each becomes a class of
 *   the template, declared in `src/styles.css` with exactly the same
 *   declaration.
 * - **Kept.** The template's own vocabulary — `display`, `label`, `glass`,
 *   `bg-ground`, `text-ink`. They were never system utilities; they are the
 *   design's semantic layer, and they stay under their own names.
 *
 * @module
 */

/**
 * Arbitrary values, and the class of the template that replaces each.
 *
 * The names say the measure rather than the role wherever the markup does not
 * make a role plain: `al-fs-95` is honest about being 0.95rem, where inventing
 * `al-texte-courant` would claim a meaning the original never wrote down.
 */
export const RENAMED = {
  'px-[max(1.5rem,4vw)]': 'al-gouttiere',
  'rounded-[var(--radius-pill)]': 'al-pilule',
  'max-w-[110rem]': 'al-cadre',
  'duration-[var(--raw-duration)]': 'al-duree',
  'duration-[var(--raw-duration-fast)]': 'al-duree-vive',
  'duration-[1200ms]': 'al-duree-1200',
  'ease-[var(--raw-ease)]': 'al-ease',
  'tracking-[0.34em]': 'al-track-34',

  // L echelle de corps, telle que l original l ecrivait.
  '!text-[0.625rem]': 'al-fs-62',
  'text-[0.85rem]': 'al-fs-85',
  'text-[0.875rem]': 'al-fs-875',
  'text-[0.9rem]': 'al-fs-90',
  'text-[0.95rem]': 'al-fs-95',
  'text-[0.975rem]': 'al-fs-975',
  'text-[1rem]': 'al-fs-100',
  'text-[1.05rem]': 'al-fs-105',
  'text-[1.5rem]': 'al-fs-150',
  'text-[1.6rem]': 'al-fs-160',
  'text-[1.75rem]': 'al-fs-175',
  'text-[26vw]': 'al-fs-26vw',

  // Les titres, tous fluides.
  'text-[clamp(1.4rem,2.2vw,2rem)]': 'al-fs-t4',
  'text-[clamp(1.7rem,2.6vw,2.4rem)]': 'al-fs-t3',
  'text-[clamp(2rem,3.4vw,3.25rem)]': 'al-fs-t2c',
  'text-[clamp(2rem,3.6vw,3.4rem)]': 'al-fs-t2',
  'text-[clamp(2rem,3.8vw,3.6rem)]': 'al-fs-t2b',
  'text-[clamp(2.25rem,4.5vw,4.25rem)]': 'al-fs-t1',
  'text-[clamp(3rem,9vw,7rem)]': 'al-fs-geant',

  // Les largeurs de lecture.
  'max-w-[18ch]': 'al-mw-18ch',
  'max-w-[34ch]': 'al-mw-34ch',
  'max-w-[42ch]': 'al-mw-42ch',
  'max-w-[46ch]': 'al-mw-46ch',
  'max-w-[52ch]': 'al-mw-52ch',
  'max-w-[34rem]': 'al-mw-34',
  'max-w-[38rem]': 'al-mw-38',
  'max-w-[46rem]': 'al-mw-46',

  // Les respirations verticales des sections.
  'py-[clamp(5rem,12vh,9rem)]': 'al-py-section',
  'pt-[clamp(5rem,12vh,9rem)]': 'al-pt-section',
  'mt-[clamp(3rem,7vh,5rem)]': 'al-mt-bloc',
  'mt-[clamp(4rem,10vh,7rem)]': 'al-mt-grand',
  'gap-[clamp(3rem,6vw,6rem)]': 'al-gap-grand',
  'pb-[max(2rem,5vh)]': 'al-pb-bas',

  // Les calages du chrome du film.
  'left-[max(2rem,8vw)]': 'al-gauche-marge',
  'right-[max(2rem,8vw)]': 'al-droite-marge',
  'right-[max(1.15rem,3.4vw)]': 'al-droite-serre',

  // Les grilles nommees, chacune propre a sa section.
  'lg:grid-cols-[1.1fr_1fr]': 'al-cols-contact',
  'md:grid-cols-[1.4fr_repeat(3,1fr)]': 'al-cols-services',
  'md:grid-cols-[1fr_auto_1fr]': 'al-cols-trois',
  'md:grid-cols-[6rem_1fr_1.1fr]': 'al-cols-penthouse',

  'aspect-[4/5]': 'al-ratio-45',

  // Le chapitrage du film : sa gouttiere propre, sa demi-largeur, et les deux
  // largeurs de bloc selon le cote ou la copie se pose.
  'px-[max(3rem,10vw)]': 'al-gouttiere-film',
  'md:w-[62%]': 'al-w-62',
  'max-w-[30rem]': 'al-mw-30',
  // Le survol d un parent : notre systeme n a pas de variante de groupe, et
  // une classe qui n existe pas ne peint rien. La regle vit dans la feuille.
  'group-hover:scale-[1.04]': 'al-zoom-cible',
}

/**
 * The template's own vocabulary, left alone.
 *
 * These were never utilities of an engine: they are the semantic layer of the
 * design — one ink dialled down with alpha, one ground, two rules — declared
 * in `src/styles.css`. Renaming them would be renaming the design.
 */
export const UNCHANGED = new Set([
  'display',
  'label',
  'glass',
  'mask-line',
  'reveal-word',
  'sr-only',
  'group',
  'h-dvh',
  'leading-none',
  '-translate-x-1/2',
  '-translate-y-1/2',
  'hover:-translate-y-px',
  'bg-ground',
  'bg-ground-deep',
  'bg-ink',
  'bg-line',
  'bg-line-faint',
  'border-line',
  'border-line-faint',
  'focus:border-ink',
  'text-ink',
  'text-ink-strong',
  'text-ink-muted',
  'text-ink-subtle',
  'hover:text-ink',
  'placeholder:text-ink-subtle',
])

/**
 * Strings inside a `className` expression that are not class lists.
 *
 * The film chapters carry a `side` — `"left"`, `"right"`, `"center"` — and the
 * expression that builds the class list compares against it. A pass that reads
 * every string of the expression sees those three and has no way, from the
 * text alone, to tell a value from a class. They are named here rather than
 * guessed at, because the alternative — skipping any string whose tokens are
 * all unknown — would also skip `max-w-[30rem]`, silently, which is exactly
 * the class that went missing the first time.
 */
export const IGNORED = new Set(['left', 'right', 'center'])

/**
 * Utilities whose name differs between the two engines.
 *
 * `border` sets a width of one pixel in the original; ours spells that width
 * out, because `o-border` would not say which of the four sides it means.
 */
export const RESPELLED = {
  border: 'o-border-w-1',
}
