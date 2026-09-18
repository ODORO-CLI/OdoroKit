/**
 * La table de `nocturne`.
 *
 * Les renommages sont derives du bloc de jetons de la feuille par
 * `scripts/derive-template-classes.mjs` ; ce qui suit est ce qu il ne peut pas
 * deviner.
 */

export const RENAMED = {
"group-hover:scale-x-100": "nc-group-hover-scale-x-100",
  "outline": "nc-outline",
  "scale-x-0": "nc-scale-x-0",
"-outline-offset-1": "nc--outline-offset-1",
  "-translate-x-1/2": "nc--translate-x-1-2",
  "-translate-y-1/2": "nc--translate-y-1-2",
  "aspect-[3/2]": "nc-aspect-3-2",
  "bg-[var(--surface-action)]": "nc-bg-var-surface-action",
  "bg-[var(--surface-action-hover)]": "nc-bg-var-surface-action-hover",
  "bg-cover": "nc-bg-cover",
  "bg-deep": "nc-bg-deep",
  "bg-ink": "nc-bg-ink",
  "bg-ink-subtle": "nc-bg-ink-subtle",
  "duration-[1200ms]": "nc-duration-1200ms",
  "duration-[var(--duration)]": "nc-duration-var-duration",
  "duration-[var(--duration-fast)]": "nc-duration-var-duration-fast",
  "ease-[var(--raw-ease)]": "nc-ease-var-raw-ease",
  "gap-[clamp(3rem,6vw,6rem)]": "nc-gap-clamp-3rem-6vw-6rem",
  "group-hover:scale-[1.03]": "nc-group-hover-scale-1-03",
  "h-[70%]": "nc-h-70",
  "h-dvh": "nc-h-dvh",
  "hover:text-ink": "nc-hover-text-ink",
  "inset-x-[max(1.25rem,3vw)]": "nc-inset-x-max-1-25rem-3vw",
  "leading-none": "nc-leading-none",
  "left-5": "nc-left-5",
  "lg:grid-cols-[1.1fr_1fr]": "nc-lg-grid-cols-1-1fr-1fr",
  "max-w-[110rem]": "nc-max-w-110rem",
  "max-w-[18ch]": "nc-max-w-18ch",
  "max-w-[32rem]": "nc-max-w-32rem",
  "max-w-[38rem]": "nc-max-w-38rem",
  "max-w-[40ch]": "nc-max-w-40ch",
  "max-w-[44ch]": "nc-max-w-44ch",
  "max-w-[46ch]": "nc-max-w-46ch",
  "max-w-[46rem]": "nc-max-w-46rem",
  "max-w-[48ch]": "nc-max-w-48ch",
  "max-w-[52ch]": "nc-max-w-52ch",
  "max-w-[54ch]": "nc-max-w-54ch",
  "md:grid-cols-[1.4fr_repeat(3,1fr)]": "nc-md-grid-cols-1-4fr-repeat-3-1fr",
  "md:grid-cols-[5rem_1fr_1.1fr]": "nc-md-grid-cols-5rem-1fr-1-1fr",
  "md:w-[56%]": "nc-md-w-56",
  "mt-[clamp(3rem,7vh,5rem)]": "nc-mt-clamp-3rem-7vh-5rem",
  "mt-[clamp(4rem,10vh,7rem)]": "nc-mt-clamp-4rem-10vh-7rem",
  "outline-1": "nc-outline-1",
  "outline-rule": "nc-outline-rule",
  "pb-[max(1.5rem,4vh)]": "nc-pb-max-1-5rem-4vh",
  "pb-[max(2rem,5vh)]": "nc-pb-max-2rem-5vh",
  "placeholder:text-ink-subtle": "nc-placeholder-text-ink-subtle",
  "pt-[clamp(3rem,7vh,5rem)]": "nc-pt-clamp-3rem-7vh-5rem",
  "pt-[clamp(5rem,12vh,9rem)]": "nc-pt-clamp-5rem-12vh-9rem",
  "px-[max(1.25rem,3vw)]": "nc-px-max-1-25rem-3vw",
  "px-[max(1.25rem,4vw)]": "nc-px-max-1-25rem-4vw",
  "py-[clamp(5rem,12vh,9rem)]": "nc-py-clamp-5rem-12vh-9rem",
  "text-[0.78rem]": "nc-text-0-78rem",
  "text-[0.85rem]": "nc-text-0-85rem",
  "text-[0.8rem]": "nc-text-0-8rem",
  "text-[0.95rem]": "nc-text-0-95rem",
  "text-[1.05rem]": "nc-text-1-05rem",
  "text-[1.3rem]": "nc-text-1-3rem",
  "text-[1.6rem]": "nc-text-1-6rem",
  "text-[1.7rem]": "nc-text-1-7rem",
  "text-[1rem]": "nc-text-1rem",
  "text-[26vw]": "nc-text-26vw",
  "text-[3rem]": "nc-text-3rem",
  "text-[clamp(1.4rem,2.2vw,2rem)]": "nc-text-clamp-1-4rem-2-2vw-2rem",
  "text-[clamp(1.8rem,3vw,2.8rem)]": "nc-text-clamp-1-8rem-3vw-2-8rem",
  "text-[clamp(1.9rem,3.6vw,3.4rem)]": "nc-text-clamp-1-9rem-3-6vw-3-4rem",
  "text-[clamp(2.4rem,6.6vw,5.6rem)]": "nc-text-clamp-2-4rem-6-6vw-5-6rem",
  "text-[clamp(2rem,4.2vw,3.8rem)]": "nc-text-clamp-2rem-4-2vw-3-8rem",
  "text-[clamp(2rem,4vw,3.6rem)]": "nc-text-clamp-2rem-4vw-3-6rem",
  "text-[clamp(3rem,10vw,7rem)]": "nc-text-clamp-3rem-10vw-7rem",
  "text-ink": "nc-text-ink",
  "text-ink-muted": "nc-text-ink-muted",
  "text-ink-subtle": "nc-text-ink-subtle",
  "top-5": "nc-top-5",
  "tracking-[0.08em]": "nc-tracking-0-08em",
  "w-[15rem]": "nc-w-15rem",
  "w-[42vw]": "nc-w-42vw",
}

export const UNCHANGED = new Set([
  /*
   * Les classes que le gabarit se donne dans sa propre feuille : les prefixer
   * reviendrait a les effacer. `group` n a pas de regle a lui — c est la marque
   * que les selecteurs `.group:hover .x` vont chercher.
   */
  'group',
  /*
   * Notre systeme connait `o-glass` et `o-sr-only`, et ne dessine pas la meme
   * chose : la passe les avait prefixees, et le panneau givre du hero perdait
   * son fond, son flou et son contour.
   */
  'glass',
  'sr-only',
  'display',
  'label',
  'hairline',
  'reveal-word',
])

export const FAUX_AMIS = new Set([
  // La valeur d une propriete de composant : `side = "left"`.
  'left',
  // La valeur d un `overflow`, et un mot de commentaire.
  'hidden',
  'mix-blend-difference',
])

export const IGNORED = new Set(FAUX_AMIS)

export const RESPELLED = { border: 'o-border-w-1' }
