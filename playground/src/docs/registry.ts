/**
 * Registre des pages de la documentation : la navigation laterale et la
 * recherche se construisent toutes deux a partir de cette seule liste.
 *
 * @module
 */

/** Une page de documentation. */
export interface DocPage {
  /** Chemin de route, absolu. */
  readonly path: string
  /** Titre affiche dans la navigation et la recherche. */
  readonly title: string
  /** Resume d'une ligne, affiche dans la recherche. */
  readonly description: string
  /** Termes supplementaires pour la recherche. */
  readonly keywords?: readonly string[]
}

/** Une section de la navigation laterale. */
export interface DocSection {
  readonly title: string
  readonly pages: readonly DocPage[]
}

/** Pages de composants UI, groupees par theme. */
export const COMPONENT_PAGES: readonly DocPage[] = [
  {
    path: '/docs/composants/button',
    title: 'Button',
    description: 'Bouton d’action avec tons, tailles et etat de chargement.',
    keywords: ['bouton', 'action', 'submit'],
  },
  {
    path: '/docs/composants/input',
    title: 'Input',
    description: 'Champ de saisie avec libelle, aide et erreur.',
    keywords: ['champ', 'formulaire', 'texte'],
  },
  {
    path: '/docs/composants/textarea',
    title: 'Textarea',
    description: 'Zone de texte multiligne, redimensionnement automatique.',
    keywords: ['champ', 'multiligne'],
  },
  {
    path: '/docs/composants/select',
    title: 'Select',
    description: 'Liste deroulante native habillee.',
    keywords: ['liste', 'deroulante', 'options'],
  },
  {
    path: '/docs/composants/checkbox',
    title: 'Checkbox',
    description: 'Case a cocher dessinee, etat indetermine compris.',
    keywords: ['case', 'cocher', 'formulaire'],
  },
  {
    path: '/docs/composants/radio',
    title: 'RadioGroup',
    description: 'Groupe de boutons radio.',
    keywords: ['radio', 'choix', 'formulaire'],
  },
  {
    path: '/docs/composants/switch',
    title: 'Switch',
    description: 'Interrupteur binaire anime.',
    keywords: ['interrupteur', 'toggle', 'bascule'],
  },
  {
    path: '/docs/composants/slider',
    title: 'Slider',
    description: 'Curseur de valeur sur echelle.',
    keywords: ['curseur', 'range', 'valeur'],
  },
  {
    path: '/docs/composants/card',
    title: 'Card',
    description: 'Carte de contenu composable.',
    keywords: ['carte', 'panneau'],
  },
  {
    path: '/docs/composants/badge',
    title: 'Badge',
    description: 'Pastille de statut ou d’etiquette.',
    keywords: ['pastille', 'etiquette', 'tag'],
  },
  {
    path: '/docs/composants/avatar',
    title: 'Avatar',
    description: 'Portrait avec repli en initiales, groupes superposes.',
    keywords: ['portrait', 'photo', 'initiales'],
  },
  {
    path: '/docs/composants/alert',
    title: 'Alert',
    description: 'Encart de message par registre.',
    keywords: ['message', 'avertissement', 'info'],
  },
  {
    path: '/docs/composants/separator',
    title: 'Separator',
    description: 'Filet de separation, avec libelle optionnel.',
    keywords: ['separation', 'filet', 'hr'],
  },
  {
    path: '/docs/composants/skeleton',
    title: 'Skeleton',
    description: 'Silhouette de chargement scintillante.',
    keywords: ['chargement', 'placeholder', 'shimmer'],
  },
  {
    path: '/docs/composants/spinner',
    title: 'Spinner',
    description: 'Indicateur circulaire de chargement.',
    keywords: ['chargement', 'attente'],
  },
  {
    path: '/docs/composants/progress',
    title: 'Progress',
    description: 'Barre de progression, determinee ou non.',
    keywords: ['progression', 'barre', 'chargement'],
  },
  {
    path: '/docs/composants/kbd',
    title: 'Kbd',
    description: 'Touche clavier stylisee.',
    keywords: ['clavier', 'raccourci', 'touche'],
  },
  {
    path: '/docs/composants/tabs',
    title: 'Tabs',
    description: 'Onglets accessibles avec indicateur glissant.',
    keywords: ['onglets', 'navigation'],
  },
  {
    path: '/docs/composants/accordion',
    title: 'Accordion',
    description: 'Panneaux repliables animes.',
    keywords: ['accordeon', 'replier', 'faq'],
  },
  {
    path: '/docs/composants/tooltip',
    title: 'Tooltip',
    description: 'Infobulle au survol et au focus.',
    keywords: ['infobulle', 'aide'],
  },
  {
    path: '/docs/composants/popover',
    title: 'Popover',
    description: 'Panneau riche ancre a un declencheur.',
    keywords: ['panneau', 'surcouche'],
  },
  {
    path: '/docs/composants/dropdown-menu',
    title: 'DropdownMenu',
    description: 'Menu d’actions au clavier complet.',
    keywords: ['menu', 'actions', 'deroulant'],
  },
  {
    path: '/docs/composants/dialog',
    title: 'Dialog',
    description: 'Boite de dialogue modale native.',
    keywords: ['modale', 'dialogue', 'fenetre'],
  },
  {
    path: '/docs/composants/drawer',
    title: 'Drawer',
    description: 'Panneau lateral modal glissant.',
    keywords: ['panneau', 'lateral', 'tiroir'],
  },
  {
    path: '/docs/composants/toast',
    title: 'Toast',
    description: 'Notifications empilables.',
    keywords: ['notification', 'message'],
  },
  {
    path: '/docs/composants/breadcrumb',
    title: 'Breadcrumb',
    description: 'Fil d’Ariane.',
    keywords: ['fil', 'ariane', 'navigation'],
  },
  {
    path: '/docs/composants/pagination',
    title: 'Pagination',
    description: 'Navigation par pages avec fenetre.',
    keywords: ['pages', 'navigation'],
  },
  {
    path: '/docs/composants/table',
    title: 'Table',
    description: 'Tableau de donnees generique.',
    keywords: ['tableau', 'donnees', 'colonnes'],
  },
]

/** Toutes les sections, dans l'ordre d'affichage. */
export const DOC_SECTIONS: readonly DocSection[] = [
  {
    title: 'Demarrage',
    pages: [
      {
        path: '/',
        title: 'Introduction',
        description: 'Ce qu’est Odoro et ce que la librairie couvre.',
        keywords: ['accueil', 'presentation'],
      },
      {
        path: '/docs/installation',
        title: 'Installation',
        description: 'Creer un projet, installer les modules, importer les feuilles.',
        keywords: ['pnpm', 'npm', 'setup', 'demarrage', 'modules', 'engine'],
      },
    ],
  },
  {
    title: 'Styles',
    pages: [
      {
        path: '/docs/styles',
        title: 'Vue d’ensemble',
        description: 'Tokens, deux paliers de feuille, convention o-*.',
        keywords: ['css', 'utilitaires', 'tokens', 'design system'],
      },
      {
        path: '/docs/styles/couleurs',
        title: 'Couleurs',
        description: 'Palette de 290 nuances et couche semantique clair/sombre.',
        keywords: ['palette', 'oklch', 'theme', 'sombre', 'semantique'],
      },
      {
        path: '/docs/styles/typographie',
        title: 'Typographie',
        description: 'Echelle de texte, graisses, decorations, surlignage.',
        keywords: [
          'texte',
          'police',
          'gras',
          'bold',
          'souligne',
          'surlignage',
          'highlight',
        ],
      },
      {
        path: '/docs/styles/responsive',
        title: 'Responsive',
        description: 'Variants sm a 2xl et max-*, mobile, tablette, web.',
        keywords: ['breakpoint', 'mobile', 'tablette', 'ecran', 'media'],
      },
      {
        path: '/docs/styles/fonts',
        title: 'Google Fonts',
        description: 'Charger des polices par CDN, sans les embarquer.',
        keywords: ['police', 'font', 'cdn', 'inter', 'typographie'],
      },
      {
        path: '/docs/styles/utilitaires',
        title: 'Utilitaires',
        description: 'Degrades, transforms, filtres, animations, verre depoli.',
        keywords: ['gradient', 'transform', 'filter', 'glass', 'animation', 'ombre'],
      },
    ],
  },
  {
    title: 'Animations',
    pages: [
      {
        path: '/docs/motion',
        title: 'Vue d’ensemble',
        description: 'Le moteur d’animation et ses principes.',
        keywords: ['animation', 'motion', 'mouvement'],
      },
      {
        path: '/docs/motion/presets',
        title: 'Presets',
        description: 'La galerie des presets : entrees, sorties, attention.',
        keywords: ['preset', 'tada', 'shake', 'fade', 'galerie'],
      },
      {
        path: '/docs/motion/composants',
        title: 'Composants',
        description: 'Reveal, Stagger, TextReveal, Animate.',
        keywords: ['reveal', 'stagger', 'textreveal', 'animate', 'scroll'],
      },
      {
        path: '/docs/motion/hooks',
        title: 'Hooks',
        description: 'useAnimate, usePresence, useInView, useScrollProgress.',
        keywords: ['hook', 'useanimate', 'usepresence', 'useinview', 'scroll'],
      },
    ],
  },
  {
    title: 'Routeur',
    pages: [
      {
        path: '/docs/router',
        title: 'Routeur',
        description: 'Routes imbriquees, parametres, transitions de page.',
        keywords: ['route', 'navigation', 'link', 'params', 'lazy'],
      },
    ],
  },
  {
    title: 'Moteur',
    pages: [
      {
        path: '/docs/moteur',
        title: 'Vue d’ensemble',
        description: 'Ou passe la frontiere avec la librairie, et pourquoi.',
        keywords: ['engine', 'moteur', 'frame', 'gsap', 'boucle'],
      },
      {
        path: '/docs/moteur/boucle',
        title: 'La boucle',
        description: 'Abonnement, priorites, delta lisse contre delta mesure.',
        keywords: ['clock', 'ticker', 'fps', 'delta', 'priorite', 'raf'],
      },
      {
        path: '/docs/moteur/mouvement',
        title: 'Politique de mouvement',
        description: 'Preference systeme, qualite, degradation automatique.',
        keywords: ['reduced motion', 'accessibilite', 'qualite', 'performance'],
      },
      {
        path: '/docs/moteur/webgl',
        title: 'Surfaces WebGL',
        description: 'Arbitrage des contextes, backend leger, replis obligatoires.',
        keywords: ['webgl', 'ogl', 'three', 'shader', 'canvas', 'surface'],
      },
      {
        path: '/docs/moteur/diagnostic',
        title: 'Diagnostic',
        description: 'Inventaire des abonnes et des ressources, panneau de releve.',
        keywords: ['debug', 'inventaire', 'fuite', 'ressource', 'panneau'],
      },
    ],
  },
  {
    title: 'Registre',
    pages: [
      {
        path: '/docs/registre',
        title: 'Le format',
        description: 'Arborescence, meta.json, ce que la validation refuse.',
        keywords: ['registry', 'meta', 'schema', 'validation', 'composants'],
      },
      {
        path: '/docs/registre/cli',
        title: 'Installer un composant',
        description: 'init, add, list, diff, doctor.',
        keywords: ['cli', 'add', 'diff', 'doctor', 'init', 'copie', 'shadcn'],
      },
    ],
  },
  {
    title: 'Composants',
    pages: COMPONENT_PAGES,
  },
]

/** Liste a plat de toutes les pages, avec leur section. */
export const ALL_PAGES: readonly (DocPage & { section: string })[] = DOC_SECTIONS.flatMap(
  (section) => section.pages.map((page) => ({ ...page, section: section.title })),
)
