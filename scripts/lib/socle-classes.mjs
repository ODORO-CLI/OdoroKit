/**
 * La table de classes du gabarit `socle`.
 *
 * Deux cents noms, dont soixante-dix positions absolues tirees d une maquette :
 * `lg:left-113.75`, `lg:top-341.5`, `lg:w-417.25`. Cette table n a pas ete
 * ecrite a la main — elle est derivee par `scripts/derive-template-classes.mjs`
 * a partir du bloc `@theme` du gabarit et de l echelle d espacement de l autre
 * moteur. Sept noms seulement demandaient un jugement ; ils sont plus bas.
 *
 * Une chose qui ne se devine pas : ce gabarit **redefinit** ses ruptures.
 * `lg:` y vaut 1280 px, pas 1024, et `tablet:` 540 px n existe nulle part
 * ailleurs. Les regles derivees les respectent ; les ecrire contre les notres
 * aurait applique la composition de bureau deux cent cinquante-six pixels trop
 * tot.
 *
 * @module
 */

/** Les noms derives : valeurs arbitraires, jetons du theme, mesures. */
export const RENAMED = {
  /*
   * Toutes les classes `lg:` et `tablet:` sont du gabarit, y compris celles
   * dont notre systeme connait l utilitaire.
   *
   * Ce gabarit **redefinit ses ruptures** : `lg:` y vaut 1280 px, la notre
   * 1024. Traduites en `lg:o-*`, elles s appliquaient deux cent cinquante-six
   * pixels trop tot — et, pire, se faisaient battre par les regles `tablet:`
   * du gabarit, dont les selecteurs repetent leur classe. Une grille de trois
   * colonnes retombait a deux.
   *
   * Un gabarit qui redefinit une rupture ne peut pas en partager les
   * utilitaires avec le systeme : ils portent le meme nom et ne declenchent
   * pas au meme endroit.
   */
  'lg:absolute': 'sn-lg-absolute',
  'lg:block': 'sn-lg-block',
  'lg:bottom-auto': 'sn-lg-bottom-auto',
  'lg:contents': 'sn-lg-contents',
  'lg:flex': 'sn-lg-flex',
  'lg:flex-row': 'sn-lg-flex-row',
  'lg:gap-10': 'sn-lg-gap-10',
  'lg:gap-2.5': 'sn-lg-gap-2-5',
  'lg:gap-6': 'sn-lg-gap-6',
  'lg:grid-cols-3': 'sn-lg-grid-cols-3',
  'lg:grid-rows-3': 'sn-lg-grid-rows-3',
  'lg:h-full': 'sn-lg-h-full',
  'lg:hidden': 'sn-lg-hidden',
  'lg:inset-x-0': 'sn-lg-inset-x-0',
  'lg:items-center': 'sn-lg-items-center',
  'lg:justify-start': 'sn-lg-justify-start',
  'lg:left-10': 'sn-lg-left-10',
  'lg:max-w-none': 'sn-lg-max-w-none',
  'lg:min-h-0': 'sn-lg-min-h-0',
  'lg:mt-0': 'sn-lg-mt-0',
  'lg:pb-0': 'sn-lg-pb-0',
  'lg:pt-0': 'sn-lg-pt-0',
  'lg:px-0': 'sn-lg-px-0',
  'lg:py-0': 'sn-lg-py-0',
  'lg:w-56': 'sn-lg-w-56',
  'lg:w-auto': 'sn-lg-w-auto',
  'lg:whitespace-nowrap': 'sn-lg-whitespace-nowrap',
  // Deux valeurs negatives et arbitraires. Elles etaient passees a la trappe :
  // la regle de forme refusait le tiret de tete, donc la liste entiere qui les
  // contenait etait ignoree — et la couche mouvante du hero perdait son bloc
  // englobant, ce qui affichait la page sans sa photographie.
  '-inset-y-[10%]': 'sn-inset-y-10',
  '-top-[20%]': 'sn-top-20',
  'hover:-translate-y-0.25': 'sn-hover--translate-y-0-25',
  // Deux homonymes. Notre systeme connait `o-ease-entrance` et `o-font-sans`,
  // et ils ne valent pas la meme chose : la courbe y est cubic-bezier(0,0,0,1)
  // contre (0.2,0,0,1) ici, et la pile de caracteres est la notre au lieu de
  // Google Sans Flex. Prefixes, ils changeaient le rendu sans qu un nom bouge.
  'ease-entrance': 'sn-ease-entrance',
  'font-sans': 'sn-font-sans',
  'font-display': 'sn-font-display',
  'focus-visible:outline-action-primary': 'sn-focus-visible-outline-action-primary',
  'focus-visible:outline-offset-4': 'sn-focus-visible-outline-offset-4',
  '-left-1/3': 'sn-left-1-3',
  '-rotate-45': 'sn-rotate-45',
  '-skew-x-12': 'sn-skew-x-12',
  '-translate-x-1/2': 'sn-translate-x-1-2',
  '-translate-x-[220%]': 'sn-translate-x-220',
  '-translate-y-1/2': 'sn-translate-y-1-2',
  '-translate-y-[3.5px]': 'sn-translate-y-3-5px',
  'active:cursor-grabbing': 'sn-active-cursor-grabbing',
  'aspect-[561/683]': 'sn-aspect-561-683',
  'aspect-[789/683]': 'sn-aspect-789-683',
  'backdrop-blur-glass': 'sn-backdrop-blur-glass',
  'backdrop-blur-nav': 'sn-backdrop-blur-nav',
  'backdrop-blur-panel': 'sn-backdrop-blur-panel',
  'bg-[image:var(--backdrop-hero)]': 'sn-bg-image-var-backdrop-hero',
  'bg-[image:var(--wordmark-fill)]': 'sn-bg-image-var-wordmark-fill',
  'bg-action-primary': 'sn-bg-action-primary',
  'bg-action-secondary': 'sn-bg-action-secondary',
  'bg-action-secondary/20': 'sn-bg-action-secondary-20',
  'bg-background': 'sn-bg-background',
  'bg-background/95': 'sn-bg-background-95',
  'bg-black/40': 'sn-bg-black-40',
  'bg-border-subtle': 'sn-bg-border-subtle',
  'bg-clip-text': 'sn-bg-clip-text',
  'bg-foreground': 'sn-bg-foreground',
  'bg-foreground/15': 'sn-bg-foreground-15',
  'bg-on-media': 'sn-bg-on-media',
  'bg-surface-glass': 'sn-bg-surface-glass',
  'bg-surface-muted': 'sn-bg-surface-muted',
  'bg-surface-nav': 'sn-bg-surface-nav',
  'bg-surface-panel': 'sn-bg-surface-panel',
  'border-border-field': 'sn-border-border-field',
  'border-foreground/10': 'sn-border-foreground-10',
  'border-foreground/15': 'sn-border-foreground-15',
  'border-on-media': 'sn-border-on-media',
  'bottom-7.5': 'sn-bottom-7-5',
  'duration-[var(--duration-fast)]': 'sn-duration-var-duration-fast',
  'duration-[var(--duration-normal)]': 'sn-duration-var-duration-normal',
  'duration-[var(--duration-slow)]': 'sn-duration-var-duration-slow',
  'focus-visible:outline-2': 'sn-focus-visible-outline-2',
  'focus-visible:outline-foreground': 'sn-focus-visible-outline-foreground',
  'focus-visible:outline-offset-2': 'sn-focus-visible-outline-offset-2',
  'focus-visible:outline-on-media': 'sn-focus-visible-outline-on-media',
  'focus-visible:placeholder:text-foreground-muted':
    'sn-focus-visible-placeholder-text-foreground-muted',
  'focus:fixed': 'sn-focus-fixed',
  'focus:left-3': 'sn-focus-left-3',
  'focus:top-3': 'sn-focus-top-3',
  'gap-7.5': 'sn-gap-7-5',
  'group-hover:translate-x-0': 'sn-group-hover-translate-x-0',
  'group-hover:translate-x-[220%]': 'sn-group-hover-translate-x-220',
  'group-hover:translate-x-[400%]': 'sn-group-hover-translate-x-400',
  'h-2.75': 'sn-h-2-75',
  'h-8.75': 'sn-h-8-75',
  'h-[18px]': 'sn-h-18px',
  'hover:bg-foreground/5': 'sn-hover-bg-foreground-5',
  'hover:scale-[1.03]': 'sn-hover-scale-1-03',
  'hover:text-foreground/70': 'sn-hover-text-foreground-70',
  'inset-x-10': 'sn-inset-x-10',
  'inset-x-4': 'sn-inset-x-4',
  'inset-x-5': 'sn-inset-x-5',
  'inset-x-6.75': 'sn-inset-x-6-75',
  'leading-body': 'sn-leading-body',
  'leading-flat': 'sn-leading-flat',
  'leading-none': 'sn-leading-none',
  'left-[3px]': 'sn-left-3px',
  'lg:-left-28.5': 'sn-lg--left-28-5',
  'lg:aspect-auto': 'sn-lg-aspect-auto',
  'lg:bottom-7.5': 'sn-lg-bottom-7-5',
  'lg:gap-25': 'sn-lg-gap-25',
  'lg:gap-7.5': 'sn-lg-gap-7-5',
  'lg:h-143': 'sn-lg-h-143',
  'lg:h-170.75': 'sn-lg-h-170-75',
  'lg:h-239.5': 'sn-lg-h-239-5',
  'lg:h-281.5': 'sn-lg-h-281-5',
  'lg:h-32.5': 'sn-lg-h-32-5',
  'lg:h-333.75': 'sn-lg-h-333-75',
  'lg:h-341.5': 'sn-lg-h-341-5',
  'lg:h-378.5': 'sn-lg-h-378-5',
  'lg:h-423.5': 'sn-lg-h-423-5',
  'lg:h-86': 'sn-lg-h-86',
  'lg:inset-x-auto': 'sn-lg-inset-x-auto',
  'lg:left-113.75': 'sn-lg-left-113-75',
  'lg:left-126.5': 'sn-lg-left-126-5',
  'lg:left-132.75': 'sn-lg-left-132-75',
  'lg:left-152': 'sn-lg-left-152',
  'lg:left-152.75': 'sn-lg-left-152-75',
  'lg:left-154.25': 'sn-lg-left-154-25',
  'lg:left-20.5': 'sn-lg-left-20-5',
  'lg:left-238': 'sn-lg-left-238',
  'lg:left-267': 'sn-lg-left-267',
  'lg:left-27.5': 'sn-lg-left-27-5',
  'lg:left-64.5': 'sn-lg-left-64-5',
  'lg:left-7.5': 'sn-lg-left-7-5',
  'lg:left-78.75': 'sn-lg-left-78-75',
  'lg:left-92.5': 'sn-lg-left-92-5',
  'lg:p-7.5': 'sn-lg-p-7-5',
  'lg:text-display': 'sn-lg-text-display',
  'lg:text-lead': 'sn-lg-text-lead',
  'lg:text-title': 'sn-lg-text-title',
  'lg:top-104.5': 'sn-lg-top-104-5',
  'lg:top-106.75': 'sn-lg-top-106-75',
  'lg:top-111.75': 'sn-lg-top-111-75',
  'lg:top-135.5': 'sn-lg-top-135-5',
  'lg:top-163': 'sn-lg-top-163',
  'lg:top-187.5': 'sn-lg-top-187-5',
  'lg:top-202.5': 'sn-lg-top-202-5',
  'lg:top-22.5': 'sn-lg-top-22-5',
  'lg:top-25': 'sn-lg-top-25',
  'lg:top-34.5': 'sn-lg-top-34-5',
  'lg:top-341.5': 'sn-lg-top-341-5',
  'lg:top-38.5': 'sn-lg-top-38-5',
  'lg:top-39': 'sn-lg-top-39',
  'lg:top-57': 'sn-lg-top-57',
  'lg:top-57.5': 'sn-lg-top-57-5',
  'lg:top-81': 'sn-lg-top-81',
  'lg:top-84.75': 'sn-lg-top-84-75',
  'lg:top-89.5': 'sn-lg-top-89-5',
  'lg:w-100': 'sn-lg-w-100',
  'lg:w-107': 'sn-lg-w-107',
  'lg:w-111.75': 'sn-lg-w-111-75',
  'lg:w-120': 'sn-lg-w-120',
  'lg:w-125.5': 'sn-lg-w-125-5',
  'lg:w-132.5': 'sn-lg-w-132-5',
  'lg:w-140.25': 'sn-lg-w-140-25',
  'lg:w-175.25': 'sn-lg-w-175-25',
  'lg:w-197.25': 'sn-lg-w-197-25',
  'lg:w-202.5': 'sn-lg-w-202-5',
  'lg:w-231': 'sn-lg-w-231',
  'lg:w-254.25': 'sn-lg-w-254-25',
  'lg:w-305': 'sn-lg-w-305',
  'lg:w-319.25': 'sn-lg-w-319-25',
  'lg:w-325': 'sn-lg-w-325',
  'lg:w-340': 'sn-lg-w-340',
  'lg:w-36.25': 'sn-lg-w-36-25',
  'lg:w-41.5': 'sn-lg-w-41-5',
  'lg:w-417.25': 'sn-lg-w-417-25',
  'lg:w-51.5': 'sn-lg-w-51-5',
  'lg:w-58.75': 'sn-lg-w-58-75',
  'lg:w-70.5': 'sn-lg-w-70-5',
  'lg:w-83': 'sn-lg-w-83',
  'lg:w-90': 'sn-lg-w-90',
  'lg:w-94.75': 'sn-lg-w-94-75',
  'max-h-[calc(100dvh-1.5rem)]': "sn-max-h-calc-100dvh-1-5rem",
  'max-w-152': 'sn-max-w-152',
  'max-w-160': 'sn-max-w-160',
  'max-w-[560px]': 'sn-max-w-560px',
  'min-h-[100svh]': 'sn-min-h-100svh',
  'min-h-[15rem]': 'sn-min-h-15rem',
  'mt-9.25': 'sn-mt-9-25',
  'overflow-x-clip': 'sn-overflow-x-clip',
  'placeholder:text-foreground': 'sn-placeholder-text-foreground',
  'px-6.25': 'sn-px-6-25',
  'right-7.5': 'sn-right-7-5',
  'rounded-[10px]': 'sn-rounded-10px',
  'rounded-button': 'sn-rounded-button',
  'rounded-card': 'sn-rounded-card',
  'rounded-control': 'sn-rounded-control',
  shadow: 'sn-shadow',
  'size-16.75': 'sn-size-16-75',
  'size-18': 'sn-size-18',
  'sm:w-[420px]': 'sn-sm-w-420px',
  'tablet:flex-row': 'sn-tablet-flex-row',
  'tablet:gap-6': 'sn-tablet-gap-6',
  'tablet:grid-cols-2': 'sn-tablet-grid-cols-2',
  'tablet:items-center': 'sn-tablet-items-center',
  'tablet:items-start': 'sn-tablet-items-start',
  'tablet:justify-center': 'sn-tablet-justify-center',
  'text-action-primary': 'sn-text-action-primary',
  'text-action-primary-foreground': 'sn-text-action-primary-foreground',
  'text-background': 'sn-text-background',
  'text-body': 'sn-text-body',
  'text-brand-mark': 'sn-text-brand-mark',
  'text-display': 'sn-text-display',
  'text-foreground': 'sn-text-foreground',
  'text-foreground-muted': 'sn-text-foreground-muted',
  'text-foreground/60': 'sn-text-foreground-60',
  'text-foreground/70': 'sn-text-foreground-70',
  'text-lead': 'sn-text-lead',
  'text-on-media': 'sn-text-on-media',
  'text-on-media-muted': 'sn-text-on-media-muted',
  'text-title': 'sn-text-title',
  'text-wordmark': 'sn-text-wordmark',
  'top-7.5': 'sn-top-7-5',
  'top-[3px]': 'sn-top-3px',
  'translate-y-[3.5px]': 'sn-translate-y-3-5px',
  'w-10.75': 'sn-w-10-75',
  'w-4.5': 'sn-w-4-5',
  'w-4.75': 'sn-w-4-75',
  'w-9.5': 'sn-w-9-5',
  'w-[18px]': 'sn-w-18px',
  'w-[calc(100%-1.5rem)]': "sn-w-calc-100-1-5rem",
  'w-[calc(100vw-1.5rem)]': "sn-w-calc-100vw-1-5rem",
  'z-[100]': 'sn-z-100',
}

/**
 * Le vocabulaire du gabarit.
 *
 * `text-trim-*` et `text-engine-nowrap` etaient declarees par une directive
 * `@utility` de l autre moteur ; elles sont desormais des classes ordinaires de
 * la feuille. `scroll-layout` et `scroll-layout-content` ne peignent rien : ce
 * sont des reperes de structure. `group` est le marqueur que visent les regles
 * de survol d un parent.
 */
export const UNCHANGED = new Set([
  'group',
  'scroll-layout',
  'scroll-layout-content',
  'text-trim-body',
  'text-trim-flat',
  'text-engine-nowrap',
  'lg:text-engine-nowrap',
])

/** Les valeurs qu une expression compare, et qui ne sont pas des classes. */
export const IGNORED = new Set(['left', 'right', 'center', 'circle', 'triangle'])

/**
 * Des mots croises ailleurs, qui ressemblent a une classe sans en etre.
 *
 * `circle` est une valeur : le glyphe de surlignage se dit `"circle"` ou
 * `"triangle"`.
 */
export const FAUX_AMIS = new Set([
  'circle',
  'hidden',
  'resize',
  'fixed',
  // Croisees dans des commentaires, ou comme valeur de `style.position`.
  'object-cover',
  'overflow-hidden',
  'relative',
  'z-10',
])

/** Les utilitaires que les deux moteurs n epellent pas pareil. */
export const RESPELLED = {
  border: 'o-border-w-1',
}
