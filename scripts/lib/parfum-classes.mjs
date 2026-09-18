/**
 * La table de `parfum`.
 *
 * Elle dit quatre choses a la passe de portage : ce qui se renomme, ce qui
 * garde son nom, ce qui n est pas une classe du tout, et la variante que ce
 * gabarit s est redeclaree.
 *
 * Les renommages ne sont pas ecrits a la main : ils sont derives du bloc de
 * jetons de la feuille par `scripts/derive-template-classes.mjs`. Les sept
 * premiers font exception, et disent pourquoi.
 */

/* ============================== Les renommages ============================ */

export const RENAMED = {
  /*
   * Trois homonymes. Notre systeme connait `o-font-sans`, `o-font-mono` et
   * `o-ease-entrance` — et n entend pas la meme chose qu ici. Chez parfum la
   * pile sans-serif est l Onest, la monospace est la 3270, et la courbe
   * d entree part de `0.2` au lieu de `0`. Laisser la passe les prefixer aurait
   * substitue nos valeurs aux siennes, sans qu aucune classe ne manque.
   */

  /*
   * Quatre variantes posees sur des classes que le gabarit se donne lui-meme.
   * Le dériveur ne peut pas les ecrire : il lit les jetons, pas le corps des
   * regles. Les leurs sont repris mot pour mot dans la feuille.
   */


  /* ---- Ce qui suit est derive. ---- */
  "lg:hero-stage-mask": "pf-lg-hero-stage-mask",
  "max-lg:hero-lattice-panel": "pf-max-lg-hero-lattice-panel",
  "max-lg:tap-area": "pf-max-lg-tap-area",
  "max-sm:prose-even": "pf-max-sm-prose-even",
  "-mt-100": "pf--mt-100",
  "-scale-100": "pf--scale-100",
  "-scale-x-100": "pf--scale-x-100",
  "aspect-4/3": "pf-aspect-4-3",
  "h-200": "pf-h-200",
  "inset-x-10": "pf-inset-x-10",
  "md:aspect-16/9": "pf-md-aspect-16-9",
  "min-h-200": "pf-min-h-200",
  "w-360": "pf-w-360",
  "font-sans": "pf-font-sans",
  "font-mono": "pf-font-mono",
  "ease-entrance": "pf-ease-entrance",
  "checked:bg-hero-content": "pf-checked-bg-hero-content",
  "forced-colors:focus-visible:outline-2": "pf-forced-colors-focus-visible-outline-2",
  "forced-colors:focus-visible:outline-offset-2": "pf-forced-colors-focus-visible-outline-offset-2",
  "lg:left-[max(1.1875rem,19px)]": "pf-lg-left-max-1-1875rem-19px",
  "lg:left-[max(1.3125rem,21px)]": "pf-lg-left-max-1-3125rem-21px",
  "lg:left-[max(4.125rem,66px)]": "pf-lg-left-max-4-125rem-66px",
  "lg:left-[max(5.5rem,88px)]": "pf-lg-left-max-5-5rem-88px",
  "lg:left-[max(5.625rem,90px)]": "pf-lg-left-max-5-625rem-90px",
  "lg:left-[max(6.875rem,110px)]": "pf-lg-left-max-6-875rem-110px",
  "lg:top-3.25": "pf-lg-top-3-25",
  "lg:top-3.5": "pf-lg-top-3-5",
  "lg:top-3.75": "pf-lg-top-3-75",
  "lg:top-5.25": "pf-lg-top-5-25",
  "lg:w-[max(13.875rem,222px)]": "pf-lg-w-max-13-875rem-222px",
  "lg:w-[max(16.4375rem,263px)]": "pf-lg-w-max-16-4375rem-263px",
  "lg:w-[max(3.1875rem,51px)]": "pf-lg-w-max-3-1875rem-51px",
  "lg:w-[max(7.0625rem,113px)]": "pf-lg-w-max-7-0625rem-113px",
  "lg:w-[max(8.25rem,132px)]": "pf-lg-w-max-8-25rem-132px",
  "-scale-y-100": "pf--scale-y-100",
  "lg:border-l": "pf-lg-border-l",
  "lg:flex-1": "pf-lg-flex-1",
  "lg:flex-none": "pf-lg-flex-none",
  "lg:flex-nowrap": "pf-lg-flex-nowrap",
  "pointer-coarse:cursor-grab": "pf-pointer-coarse-cursor-grab",
  "sm:[&>li:last-child]:col-span-2": "pf-sm-li-last-child-col-span-2",
  "-bottom-3": "pf--bottom-3",
  "-left-3": "pf--left-3",
  "-right-2": "pf--right-2",
  "-right-3": "pf--right-3",
  "-rotate-45": "pf--rotate-45",
  "-top-3": "pf--top-3",
  "-translate-x-1": "pf--translate-x-1",
  "-translate-x-1/2": "pf--translate-x-1-2",
  "-translate-y-1": "pf--translate-y-1",
  "-translate-y-1/2": "pf--translate-y-1-2",
  "-translate-y-[7px]": "pf--translate-y-7px",
  "[--tap-x:0.75rem]": "pf--tap-x-0-75rem",
  "[--tap-y:0.75rem]": "pf--tap-y-0-75rem",
  "[-webkit-appearance:none]": "pf--webkit-appearance-none",
  "[@media(hover:none)]:opacity-0": "pf--media-hover-none-opacity-0",
  "[@media(hover:none)]:opacity-100": "pf--media-hover-none-opacity-100",
  "[@media(hover:none)]:pointer-events-auto": "pf--media-hover-none-pointer-events-auto",
  "[text-box:trim-both_cap_alphabetic]": "pf--text-box-trim-both-cap-alphabetic",
  "aspect-4/5": "pf-aspect-4-5",
  "backface-hidden": "pf-backface-hidden",
  "bg-background": "pf-bg-background",
  "bg-background/95": "pf-bg-background-95",
  "bg-black/40": "pf-bg-black-40",
  "bg-foreground": "pf-bg-foreground",
  "bg-foreground/15": "pf-bg-foreground-15",
  "bg-hero-content": "pf-bg-hero-content",
  "bg-hero-rule": "pf-bg-hero-rule",
  "border-foreground/10": "pf-border-foreground-10",
  "border-foreground/15": "pf-border-foreground-15",
  "border-hero-content": "pf-border-hero-content",
  "border-hero-content-muted": "pf-border-hero-content-muted",
  "border-hero-rule": "pf-border-hero-rule",
  "duration-500": "pf-duration-500",
  "duration-700": "pf-duration-700",
  "duration-[var(--duration-fast)]": "pf-duration-var-duration-fast",
  "duration-[var(--duration-normal)]": "pf-duration-var-duration-normal",
  "focus-visible:outline-2": "pf-focus-visible-outline-2",
  "focus-visible:outline-foreground": "pf-focus-visible-outline-foreground",
  "focus-visible:outline-hero-content": "pf-focus-visible-outline-hero-content",
  "focus-visible:outline-none": "pf-focus-visible-outline-none",
  "focus-visible:outline-offset-2": "pf-focus-visible-outline-offset-2",
  "focus-within:outline-2": "pf-focus-within-outline-2",
  "focus-within:outline-hero-content": "pf-focus-within-outline-hero-content",
  "focus-within:outline-offset-2": "pf-focus-within-outline-offset-2",
  "focus:absolute": "pf-focus-absolute",
  "focus:bg-hero-surface": "pf-focus-bg-hero-surface",
  "focus:left-2": "pf-focus-left-2",
  "focus:px-3": "pf-focus-px-3",
  "focus:py-2": "pf-focus-py-2",
  "focus:text-hero-content": "pf-focus-text-hero-content",
  "focus:top-2": "pf-focus-top-2",
  "focus:z-50": "pf-focus-z-50",
  "gap-[max(0.5rem,8px)]": "pf-gap-max-0-5rem-8px",
  "gap-[max(1.25rem,20px)]": "pf-gap-max-1-25rem-20px",
  "group-focus-visible:opacity-100": "pf-group-focus-visible-opacity-100",
  "group-focus-visible:translate-x-0": "pf-group-focus-visible-translate-x-0",
  "group-focus-visible:translate-x-1": "pf-group-focus-visible-translate-x-1",
  "group-focus-visible:translate-y-0": "pf-group-focus-visible-translate-y-0",
  "group-focus-within:opacity-0": "pf-group-focus-within-opacity-0",
  "group-focus-within:opacity-100": "pf-group-focus-within-opacity-100",
  "group-focus-within:pointer-events-auto": "pf-group-focus-within-pointer-events-auto",
  "group-focus-within:text-hero-content": "pf-group-focus-within-text-hero-content",
  "group-hover:opacity-0": "pf-group-hover-opacity-0",
  "group-hover:opacity-100": "pf-group-hover-opacity-100",
  "group-hover:pointer-events-auto": "pf-group-hover-pointer-events-auto",
  "group-hover:text-hero-content": "pf-group-hover-text-hero-content",
  "group-hover:translate-x-0": "pf-group-hover-translate-x-0",
  "group-hover:translate-x-1": "pf-group-hover-translate-x-1",
  "group-hover:translate-y-0": "pf-group-hover-translate-y-0",
  "h-1.25": "pf-h-1-25",
  "h-111.5": "pf-h-111-5",
  "h-13": "pf-h-13",
  "h-5.25": "pf-h-5-25",
  "h-6.25": "pf-h-6-25",
  "h-9.25": "pf-h-9-25",
  "h-[18px]": "pf-h-18px",
  "hover:bg-foreground/5": "pf-hover-bg-foreground-5",
  "hover:border-hero-content": "pf-hover-border-hero-content",
  "hover:text-foreground/70": "pf-hover-text-foreground-70",
  "hover:text-hero-content": "pf-hover-text-hero-content",
  "inset-x-5": "pf-inset-x-5",
  "last:border-b": "pf-last-border-b",
  "leading-hero-caption": "pf-leading-hero-caption",
  "leading-hero-display": "pf-leading-hero-display",
  "leading-hero-headline": "pf-leading-hero-headline",
  "leading-hero-prose": "pf-leading-hero-prose",
  "leading-none": "pf-leading-none",
  "left-[3px]": "pf-left-3px",
  "lg:-ml-95": "pf-lg-ml-95",
  "lg:-mt-100": "pf-lg-mt-100",
  "lg:-mt-104": "pf-lg-mt-104",
  "lg:-mt-200": "pf-lg-mt-200",
  "lg:-mt-72.25": "pf-lg-mt-72-25",
  "lg:-translate-x-1/2": "pf-lg-translate-x-1-2",
  "lg:-translate-y-1/2": "pf-lg-translate-y-1-2",
  "lg:absolute": "pf-lg-absolute",
  "lg:aspect-auto": "pf-lg-aspect-auto",
  "lg:block": "pf-lg-block",
  "lg:border-hero-rule": "pf-lg-border-hero-rule",
  "lg:bottom-10": "pf-lg-bottom-10",
  "lg:bottom-29.5": "pf-lg-bottom-29-5",
  "lg:bottom-auto": "pf-lg-bottom-auto",
  "lg:contents": "pf-lg-contents",
  "lg:flex": "pf-lg-flex",
  "lg:flex-col": "pf-lg-flex-col",
  "lg:flex-row": "pf-lg-flex-row",
  "lg:gap-0": "pf-lg-gap-0",
  "lg:gap-12": "pf-lg-gap-12",
  "lg:gap-16": "pf-lg-gap-16",
  "lg:gap-6": "pf-lg-gap-6",
  "lg:gap-8": "pf-lg-gap-8",
  "lg:gap-9": "pf-lg-gap-9",
  "lg:gap-[max(0.75rem,12px)]": "pf-lg-gap-max-0-75rem-12px",
  "lg:h-0": "pf-lg-h-0",
  "lg:h-13.5": "pf-lg-h-13-5",
  "lg:h-154.25": "pf-lg-h-154-25",
  "lg:h-154.75": "pf-lg-h-154-75",
  "lg:h-16.5": "pf-lg-h-16-5",
  "lg:h-200": "pf-lg-h-200",
  "lg:h-28": "pf-lg-h-28",
  "lg:h-28.5": "pf-lg-h-28-5",
  "lg:h-3.5": "pf-lg-h-3-5",
  "lg:h-4.75": "pf-lg-h-4-75",
  "lg:h-87.5": "pf-lg-h-87-5",
  "lg:h-[calc(var(--technology-region)*50rem)]": "pf-lg-h-calc-var-technology-region-50rem",
  "lg:h-[max(4.25rem,68px)]": "pf-lg-h-max-4-25rem-68px",
  "lg:h-lvh": "pf-lg-h-lvh",
  "lg:hidden": "pf-lg-hidden",
  "lg:inset-0": "pf-lg-inset-0",
  "lg:inset-auto": "pf-lg-inset-auto",
  "lg:inset-x-0": "pf-lg-inset-x-0",
  "lg:inset-x-10": "pf-lg-inset-x-10",
  "lg:items-center": "pf-lg-items-center",
  "lg:items-start": "pf-lg-items-start",
  "lg:justify-center": "pf-lg-justify-center",
  "lg:justify-start": "pf-lg-justify-start",
  "lg:last:w-auto": "pf-lg-last-w-auto",
  "lg:left-1/2": "pf-lg-left-1-2",
  "lg:left-10": "pf-lg-left-10",
  "lg:left-28.25": "pf-lg-left-28-25",
  "lg:left-74.25": "pf-lg-left-74-25",
  "lg:max-w-[var(--faq-question)]": "pf-lg-max-w-var-faq-question",
  "lg:max-w-none": "pf-lg-max-w-none",
  "lg:min-h-200": "pf-lg-min-h-200",
  "lg:ml-0": "pf-lg-ml-0",
  "lg:ml-8": "pf-lg-ml-8",
  "lg:mx-auto": "pf-lg-mx-auto",
  "lg:p-0": "pf-lg-p-0",
  "lg:pb-0": "pf-lg-pb-0",
  "lg:pl-8": "pf-lg-pl-8",
  "lg:pt-0": "pf-lg-pt-0",
  "lg:pt-[0.92rem]": "pf-lg-pt-0-92rem",
  "lg:px-0": "pf-lg-px-0",
  "lg:px-4": "pf-lg-px-4",
  "lg:py-0": "pf-lg-py-0",
  "lg:right-10": "pf-lg-right-10",
  "lg:right-21.5": "pf-lg-right-21-5",
  "lg:right-auto": "pf-lg-right-auto",
  "lg:self-auto": "pf-lg-self-auto",
  "lg:size-190": "pf-lg-size-190",
  "lg:sticky": "pf-lg-sticky",
  "lg:text-hero-body": "pf-lg-text-hero-body",
  "lg:text-hero-caption": "pf-lg-text-hero-caption",
  "lg:text-hero-chip": "pf-lg-text-hero-chip",
  "lg:text-hero-display": "pf-lg-text-hero-display",
  "lg:text-hero-fine": "pf-lg-text-hero-fine",
  "lg:top-0": "pf-lg-top-0",
  "lg:top-1/2": "pf-lg-top-1-2",
  "lg:top-162.5": "pf-lg-top-162-5",
  "lg:top-30.5": "pf-lg-top-30-5",
  "lg:top-32.5": "pf-lg-top-32-5",
  "lg:top-34": "pf-lg-top-34",
  "lg:top-57": "pf-lg-top-57",
  "lg:top-6": "pf-lg-top-6",
  "lg:top-71.5": "pf-lg-top-71-5",
  "lg:top-77.5": "pf-lg-top-77-5",
  "lg:top-[calc((100lvh-50rem)/2)]": "pf-lg-top-calc-100lvh-50rem-2",
  "lg:w-104.25": "pf-lg-w-104-25",
  "lg:w-166.25": "pf-lg-w-166-25",
  "lg:w-168.5": "pf-lg-w-168-5",
  "lg:w-18.75": "pf-lg-w-18-75",
  "lg:w-24.75": "pf-lg-w-24-75",
  "lg:w-289.25": "pf-lg-w-289-25",
  "lg:w-29.75": "pf-lg-w-29-75",
  "lg:w-30": "pf-lg-w-30",
  "lg:w-39": "pf-lg-w-39",
  "lg:w-46.25": "pf-lg-w-46-25",
  "lg:w-48.75": "pf-lg-w-48-75",
  "lg:w-64.5": "pf-lg-w-64-5",
  "lg:w-71.25": "pf-lg-w-71-25",
  "lg:w-86": "pf-lg-w-86",
  "lg:w-91.75": "pf-lg-w-91-75",
  "lg:w-[max(11.875rem,190px)]": "pf-lg-w-max-11-875rem-190px",
  "lg:w-[max(15.3125rem,245px)]": "pf-lg-w-max-15-3125rem-245px",
  "lg:w-auto": "pf-lg-w-auto",
  "lg:whitespace-nowrap": "pf-lg-whitespace-nowrap",
  "lg:z-0": "pf-lg-z-0",
  "lg:z-10": "pf-lg-z-10",
  "max-h-[calc(100dvh-1.5rem)]": "pf-max-h-calc-100dvh-1-5rem",
  "max-lg:-inset-x-5": "pf-max-lg-inset-x-5",
  "max-lg:-mt-3": "pf-max-lg-mt-3",
  "max-lg:[--tap-x:0.75rem]": "pf-max-lg-tap-x-0-75rem",
  "max-lg:[--tap-x:1rem]": "pf-max-lg-tap-x-1rem",
  "max-lg:[--tap-y:0.3125rem]": "pf-max-lg-tap-y-0-3125rem",
  "max-lg:[--tap-y:0.5rem]": "pf-max-lg-tap-y-0-5rem",
  "max-lg:[--tap-y:0.75rem]": "pf-max-lg-tap-y-0-75rem",
  "max-lg:[--tap-y:1rem]": "pf-max-lg-tap-y-1rem",
  "max-lg:border-hero-rule": "pf-max-lg-border-hero-rule",
  "max-lg:max-w-[42ch]": "pf-max-lg-max-w-42ch",
  "max-lg:object-contain": "pf-max-lg-object-contain",
  "max-lg:scale-[var(--ink-scale)]": "pf-max-lg-scale-var-ink-scale",
  "max-lg:text-hero-body": "pf-max-lg-text-hero-body",
  "max-lg:text-hero-content-muted": "pf-max-lg-text-hero-content-muted",
  "max-w-[36ch]": "pf-max-w-36ch",
  "max-w-[560px]": "pf-max-w-560px",
  "mb-[calc(var(--text-hero-body)*0.155)]": "pf-mb-calc-var-text-hero-body-0-155",
  "md:text-hero-lede": "pf-md-text-hero-lede",
  "min-h-[calc(100svh-5rem)]": "pf-min-h-calc-100svh-5rem",
  "min-h-lvh": "pf-min-h-lvh",
  "motion-reduce:transition-none": "pf-motion-reduce-transition-none",
  "overflow-x-clip": "pf-overflow-x-clip",
  "placeholder:text-hero-content": "pf-placeholder-text-hero-content",
  "pointer-coarse:active:cursor-grabbing": "pf-pointer-coarse-active-cursor-grabbing",
  "pr-[max(1rem,16px)]": "pf-pr-max-1rem-16px",
  "px-[max(1rem,16px)]": "pf-px-max-1rem-16px",
  "py-[max(0.875rem,14px)]": "pf-py-max-0-875rem-14px",
  "rounded-[10px]": "pf-rounded-10px",
  "shadow": "pf-shadow",
  "size-3.25": "pf-size-3-25",
  "size-74.25": "pf-size-74-25",
  "sm:aspect-4/3": "pf-sm-aspect-4-3",
  "sm:h-11.5": "pf-sm-h-11-5",
  "sm:size-2.75": "pf-sm-size-2-75",
  "sm:text-hero-body": "pf-sm-text-hero-body",
  "sm:text-hero-display-tablet": "pf-sm-text-hero-display-tablet",
  "sm:text-hero-lede": "pf-sm-text-hero-lede",
  "sm:w-[420px]": "pf-sm-w-420px",
  "text-background": "pf-text-background",
  "text-foreground": "pf-text-foreground",
  "text-foreground/60": "pf-text-foreground-60",
  "text-foreground/70": "pf-text-foreground-70",
  "text-hero-body": "pf-text-hero-body",
  "text-hero-caption": "pf-text-hero-caption",
  "text-hero-chip": "pf-text-hero-chip",
  "text-hero-content": "pf-text-hero-content",
  "text-hero-content-faint": "pf-text-hero-content-faint",
  "text-hero-content-muted": "pf-text-hero-content-muted",
  "text-hero-display-compact": "pf-text-hero-display-compact",
  "text-hero-rule": "pf-text-hero-rule",
  "text-hero-title": "pf-text-hero-title",
  "top-[3px]": "pf-top-3px",
  "top-[var(--hero-stage-top,0px)]": "pf-top-var-hero-stage-top-0px",
  "tracking-hero-caption": "pf-tracking-hero-caption",
  "tracking-hero-display": "pf-tracking-hero-display",
  "transform-gpu": "pf-transform-gpu",
  "translate-y-[7px]": "pf-translate-y-7px",
  "w-104.25": "pf-w-104-25",
  "w-27.5": "pf-w-27-5",
  "w-32.5": "pf-w-32-5",
  "w-54.25": "pf-w-54-25",
  "w-[18px]": "pf-w-18px",
  "w-[calc(100vw-1.5rem)]": "pf-w-calc-100vw-1-5rem",
  "z-100": "pf-z-100",
  "z-[100]": "pf-z-100",
  "z-[60]": "pf-z-60",
  "z-[70]": "pf-z-70",
}

/* ======================= Ce qui garde son nom ============================= */

/**
 * Les classes que le gabarit se donne lui-meme, dans sa propre feuille. Elles
 * ne viennent d aucun generateur : les prefixer reviendrait a les effacer.
 *
 * `group` n a pas de regle a lui ; c est une marque que les selecteurs
 * `.group:hover .x` vont chercher. `scroll-layout` et `scroll-layout-content`
 * n en ont pas davantage — ce sont les prises auxquelles le defilement doux
 * s accroche depuis le script.
 */
export const UNCHANGED = new Set([
  'group',
  'hero-lattice',
  'hero-lattice-bars',
  'hero-lattice-beam',
  'hero-lattice-glow',
  'hero-lattice-panel',
  'hero-lattice-shell',
  'hero-stage-mask',
  'prose-even',
  'tap-area',
  'scroll-layout',
  'scroll-layout-content',
])

/* ========================= Ce qui n est pas une classe ==================== */

/**
 * Des mots que la passe rencontre dans une chaine et qui ne sont pas des
 * classes : de la prose de commentaire, des fragments de phrase, des nombres.
 *
 * La passe les laisse tels quels. Le garde, lui, s en sert pour ne pas les
 * compter comme preuve qu une chaine est une liste de classes — sans quoi une
 * phrase comme « centred at 340 » se ferait traduire.
 */
export const FAUX_AMIS = new Set([
  '//',
  /*
   * Six mots verifies un a un : cinq sont des valeurs CSS ou un nom
   * d evenement — `display: contents`, `background-attachment: fixed`,
   * `position: relative|sticky`, `addEventListener('resize')` — et le sixieme
   * est du francais, dans un commentaire qui decrit une colonne.
   */
  'contents',
  'fixed',
  'relative',
  'sticky',
  'resize',
  'w-auto',
  'lg:',
  'max-lg:',
  '340',
  '340:',
  '720,',
  '760-unit',
  'a',
  'at',
  'box',
  'centred',
  'frame',
  'is',
  'of',
  'on',
  's',
  'the',
  'x',
])

export const IGNORED = new Set(FAUX_AMIS)

/* ==================== Les variantes que le gabarit se donne =============== */

/**
 * `parfum` ecrit, dans sa feuille :
 *
 *     @custom-variant lg (@media (min-width: 1024px) and (min-aspect-ratio: 1/1));
 *
 * Son `lg:` n est donc pas le notre. Le notre est une largeur ; le sien exige
 * en plus que l ecran soit au moins aussi large que haut — c est ce qui empeche
 * la mise en page du hero de basculer sur un portable pose en paysage.
 *
 * Traduire `lg:flex` en `o-lg:flex` aurait donne une regle qui peint la ou
 * l original se taisait, et rien ne l aurait signale : la classe existe bel et
 * bien, elle est seulement plus large. La passe refuse la traduction, et le
 * dériveur ecrit ces classes avec la requete du gabarit.
 */
export const VARIANTES_PROPRES = new Set(['lg'])

/* =============================== Les graphies ============================= */

export const RESPELLED = { border: 'o-border-w-1' }
