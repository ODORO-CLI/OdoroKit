/**
 * La table de `cabinet`.
 *
 * Les renommages sont derives du bloc de jetons de la feuille par
 * `scripts/derive-template-classes.mjs` ; ce qui suit est ce qu il ne peut pas
 * deviner.
 */

export const RENAMED = {
  /*
   * Une variante qui doit passer apres une derivee.
   *
   * L original ecrit `max-w-[85%] … max-md:max-w-none` : deux utilitaires de
   * meme poids, et l ordre donne raison au second sous 768 px. Devenus
   * `.cb-max-w-85.cb-max-w-85` et `.max-md\:o-max-w-none`, la derivee pese deux
   * fois plus et gagne partout — le paragraphe perdait un quart de sa largeur
   * sur un telephone. On fait donc deriver la variante aussi : elles se valent
   * de nouveau, et l ordre tranche comme avant.
   */
  'max-md:max-w-none': 'cb-max-md-max-w-none',

  /*
   * Un homonyme, et une subtilite.
   *
   * Le gabarit ecrit `--font-sans: var(--font-inter-tight)` dans un bloc
   * `@theme inline`. Avec `inline`, l autre moteur substitue la valeur dans ses
   * **utilitaires** et n emet pas la variable : `var(--font-sans)` dans le
   * `body` ne resout rien — le corps de la page est en pile systeme, des deux
   * cotes — mais la classe `font-sans`, elle, vit et vaut l Inter Tight.
   *
   * La passe la prefixait, et la banniere de cookies retombait sur notre pile.
   */
  'font-sans': 'cb-font-sans',

  /*
   * Un masque de bord, que notre generateur ne produit pas. La regle est
   * ecrite a la main plus bas dans la feuille, avec la meme declaration que
   * l autre moteur : un degrade vers le bas qui commence a fondre a 45 %.
   */
  'mask-b-from-45%': 'cb-mask-b-from-45',

"-translate-1/2": "cb--translate-1-2",
  "aspect-showreel": "cb-aspect-showreel",
  "fill-foreground": "cb-fill-foreground",
  "fill-surface-warp": "cb-fill-surface-warp",
  "h-footer-reveal": "cb-h-footer-reveal",
  "md:h-footer-reveal": "cb-md-h-footer-reveal",
  "md:translate-y-wordmark-drop": "cb-md-translate-y-wordmark-drop",
  "transition-[background-color,border-color,translate]": "cb-transition-background-color-border-color-translate",
  "transition-[background-color,border-color]": "cb-transition-background-color-border-color",
  "transition-[color,border-color,translate]": "cb-transition-color-border-color-translate",
  "transition-[filter]": "cb-transition-filter",
  "transition-[opacity,translate,background-color,border-color]": "cb-transition-opacity-translate-background-color-border-color",
  "transition-[opacity,translate]": "cb-transition-opacity-translate",
  "transition-[rotate]": "cb-transition-rotate",
  "w-overlay-aside": "cb-w-overlay-aside",
  "w-overlay-lead": "cb-w-overlay-lead",
  "w-showreel": "cb-w-showreel",
  "w-star": "cb-w-star",
"-mb-3.5": "cb--mb-3-5",
  "-translate-y-1/2": "cb--translate-y-1-2",
  "aspect-3/4": "cb-aspect-3-4",
  "bg-background": "cb-bg-background",
  "bg-background/95": "cb-bg-background-95",
  "bg-black/40": "cb-bg-black-40",
  "bg-foreground": "cb-bg-foreground",
  "bg-foreground/12": "cb-bg-foreground-12",
  "bg-foreground/15": "cb-bg-foreground-15",
  "bg-foreground/18": "cb-bg-foreground-18",
  "bg-surface-footer": "cb-bg-surface-footer",
  "bg-surface-footer/20": "cb-bg-surface-footer-20",
  "bg-surface-glass-raised/45": "cb-bg-surface-glass-raised-45",
  "bg-surface-glass/75": "cb-bg-surface-glass-75",
  "bg-surface-glass/85": "cb-bg-surface-glass-85",
  "bg-surface-inverse": "cb-bg-surface-inverse",
  "bg-surface-inverse-sunken": "cb-bg-surface-inverse-sunken",
  "border-foreground-inverse-muted/20": "cb-border-foreground-inverse-muted-20",
  "border-foreground-inverse/18": "cb-border-foreground-inverse-18",
  "border-foreground/10": "cb-border-foreground-10",
  "border-foreground/15": "cb-border-foreground-15",
  "border-foreground/22": "cb-border-foreground-22",
  "border-foreground/25": "cb-border-foreground-25",
  "border-foreground/30": "cb-border-foreground-30",
  "border-foreground/8": "cb-border-foreground-8",
  "duration-[var(--duration-fast)]": "cb-duration-var-duration-fast",
  "duration-[var(--duration-normal)]": "cb-duration-var-duration-normal",
  "duration-[var(--duration-slow)]": "cb-duration-var-duration-slow",
  "ease-glide": "cb-ease-glide",
  "focus-visible:outline-1": "cb-focus-visible-outline-1",
  "focus-visible:outline-2": "cb-focus-visible-outline-2",
  "focus-visible:outline-foreground": "cb-focus-visible-outline-foreground",
  "focus-visible:outline-foreground-inverse": "cb-focus-visible-outline-foreground-inverse",
  "focus-visible:outline-offset-2": "cb-focus-visible-outline-offset-2",
  "focus-visible:outline-offset-4": "cb-focus-visible-outline-offset-4",
  "font-display": "cb-font-display",
  "group-hover:rotate-90": "cb-group-hover-rotate-90",
  "group-hover:translate-x-0.5": "cb-group-hover-translate-x-0-5",
  "group-hover:translate-y-0.5": "cb-group-hover-translate-y-0-5",
  "h-[0.9em]": "cb-h-0-9em",
  "h-[18px]": "cb-h-18px",
  "h-dvh": "cb-h-dvh",
  "hover:-translate-y-0.5": "cb-hover-translate-y-0-5",
  "hover:bg-foreground-inverse-muted/5": "cb-hover-bg-foreground-inverse-muted-5",
  "hover:bg-foreground/5": "cb-hover-bg-foreground-5",
  "hover:bg-surface-glass-raised/95": "cb-hover-bg-surface-glass-raised-95",
  "hover:border-foreground-inverse": "cb-hover-border-foreground-inverse",
  "hover:border-foreground/22": "cb-hover-border-foreground-22",
  "hover:border-foreground/85": "cb-hover-border-foreground-85",
  "hover:text-foreground/70": "cb-hover-text-foreground-70",
  "hover:text-foreground/85": "cb-hover-text-foreground-85",
  "inset-x-10": "cb-inset-x-10",
  "inset-x-8": "cb-inset-x-8",
  "last:border-r": "cb-last-border-r",
  "leading-[0.5]": "cb-leading-0-5",
  "leading-copy": "cb-leading-copy",
  "leading-display": "cb-leading-display",
  "leading-heading": "cb-leading-heading",
  "leading-hero": "cb-leading-hero",
  "leading-none": "cb-leading-none",
  "leading-wordmark": "cb-leading-wordmark",
  "left-[3px]": "cb-left-3px",
  "lg:grid-cols-[23.75rem_1fr]": "cb-lg-grid-cols-23-75rem-1fr",
  "lg:text-display": "cb-lg-text-display",
  "max-h-[calc(100dvh-1.5rem)]": "cb-max-h-calc-100dvh-1-5rem",
  "max-md:bottom-28": "cb-max-md-bottom-28",
  "max-md:bottom-32": "cb-max-md-bottom-32",
  "max-md:bottom-52": "cb-max-md-bottom-52",
  "max-md:inset-x-6": "cb-max-md-inset-x-6",
  "max-md:max-w-60": "cb-max-md-max-w-60",
  "max-md:max-w-[42%]": "cb-max-md-max-w-42",
  "max-md:top-36": "cb-max-md-top-36",
  "max-sm:w-70": "cb-max-sm-w-70",
  "max-w-[560px]": "cb-max-w-560px",
  "max-w-[85%]": "cb-max-w-85",
  "md:-translate-x-5": "cb-md-translate-x-5",
  "md:-translate-y-17.5": "cb-md-translate-y-17-5",
  "md:-translate-y-40": "cb-md-translate-y-40",
  "md:gap-4.5": "cb-md-gap-4-5",
  "md:grid-cols-[12.5rem_1fr]": "cb-md-grid-cols-12-5rem-1fr",
  "md:h-dvh": "cb-md-h-dvh",
  "md:inset-x-8": "cb-md-inset-x-8",
  "md:max-w-126": "cb-md-max-w-126",
  "md:text-display-tablet": "cb-md-text-display-tablet",
  "md:text-quote-mark": "cb-md-text-quote-mark",
  "md:text-wordmark": "cb-md-text-wordmark",
  "md:translate-y-10": "cb-md-translate-y-10",
  "md:translate-y-18": "cb-md-translate-y-18",
  "mt-[0.12em]": "cb-mt-0-12em",
  "rounded-[10px]": "cb-rounded-10px",
  "shadow": "cb-shadow",
  "size-4.5": "cb-size-4-5",
  "size-5.5": "cb-size-5-5",
  "size-6.5": "cb-size-6-5",
  "sm:text-body": "cb-sm-text-body",
  "sm:text-display-panel": "cb-sm-text-display-panel",
  "sm:text-display-tablet": "cb-sm-text-display-tablet",
  "sm:text-headline": "cb-sm-text-headline",
  "sm:text-title": "cb-sm-text-title",
  "sm:w-[420px]": "cb-sm-w-420px",
  "text-[0.35em]": "cb-text-0-35em",
  "text-background": "cb-text-background",
  "text-badge": "cb-text-badge",
  "text-body": "cb-text-body",
  "text-body-phone": "cb-text-body-phone",
  "text-caption": "cb-text-caption",
  "text-display-phone": "cb-text-display-phone",
  "text-foreground": "cb-text-foreground",
  "text-foreground-inverse": "cb-text-foreground-inverse",
  "text-foreground-inverse-muted": "cb-text-foreground-inverse-muted",
  "text-foreground-inverse/70": "cb-text-foreground-inverse-70",
  "text-foreground/45": "cb-text-foreground-45",
  "text-foreground/60": "cb-text-foreground-60",
  "text-foreground/70": "cb-text-foreground-70",
  "text-foreground/95": "cb-text-foreground-95",
  "text-headline-phone": "cb-text-headline-phone",
  "text-lead": "cb-text-lead",
  "text-quote-mark-phone": "cb-text-quote-mark-phone",
  "text-stat-phone": "cb-text-stat-phone",
  "text-title-phone": "cb-text-title-phone",
  "text-wordmark-phone": "cb-text-wordmark-phone",
  "top-[3px]": "cb-top-3px",
  "tracking-caps": "cb-tracking-caps",
  "tracking-caps-wide": "cb-tracking-caps-wide",
  "tracking-copy": "cb-tracking-copy",
  "tracking-display": "cb-tracking-display",
  "tracking-title": "cb-tracking-title",
  "w-90": "cb-w-90",
  "w-[18px]": "cb-w-18px",
  "w-[calc(100vw-1.5rem)]": "cb-w-calc-100vw-1-5rem",
  "z-1": "cb-z-1",
  "z-100": "cb-z-100",
  "z-110": "cb-z-110",
  "z-15": "cb-z-15",
  "z-2": "cb-z-2",
  "z-200": "cb-z-200",
  "z-22": "cb-z-22",
  "z-25": "cb-z-25",
  "z-45": "cb-z-45",
  "z-5": "cb-z-5",
  "z-[100]": "cb-z-100",
}

export const UNCHANGED = new Set([
  /*
   * `group` n a pas de regle a lui : c est la marque que les selecteurs
   * `.group:hover .x` vont chercher. Les deux autres sont les prises auxquelles
   * le defilement doux s accroche depuis le script.
   */
  'group',
  'scroll-layout',
  'scroll-layout-content',
])

export const FAUX_AMIS = new Set([
  // La valeur d une propriete de composant : `descriptionSide`.
  'right',
  /*
   * Des valeurs CSS ecrites en clair, un nom d evenement, de la prose de
   * commentaire — et `glass`, qui est le membre d un type : `variant?: "plain"
   * | "glass"`. Verifies un a un.
   */
  'absolute',
  'fixed',
  'glass',
  'grid-cols-4',
  'hidden',
  'relative',
  'resize',
  'sr-only',
  'text-center',
  'visible',
])

export const IGNORED = new Set(FAUX_AMIS)

export const RESPELLED = { border: 'o-border-w-1' }
