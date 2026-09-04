/**
 * Registre des pages de la documentation : la navigation laterale et la
 * recherche se construisent toutes deux a partir de cette seule liste.
 *
 * @module
 */

import { CATALOGUE } from './catalogue.generated.js'

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

/**
 * Un sous-groupe a l'interieur d'une section.
 *
 * Une section de trente entrees se parcourt mal : l'oeil n'y trouve rien sans
 * lire chaque ligne. Le sous-groupe redonne des reperes — on cherche d'abord
 * une famille, puis une entree dans la famille.
 */
export interface DocGroup {
  readonly title: string
  readonly pages: readonly DocPage[]
}

/**
 * Une section de la navigation laterale.
 *
 * Elle porte soit des pages a plat, soit des sous-groupes. Les deux a la fois
 * seraient une hierarchie a trois niveaux dans une colonne de deux cent
 * cinquante pixels : illisible.
 */
export interface DocSection {
  readonly title: string
  readonly pages?: readonly DocPage[]
  readonly groups?: readonly DocGroup[]
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
    path: '/docs/composants/select-menu',
    title: 'SelectMenu',
    description: 'Liste deroulante riche : icones, descriptions, recherche.',
    keywords: ['select', 'menu', 'combobox', 'liste', 'recherche', 'listbox'],
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

/** Segment d'URL et intitule de chaque categorie du registre. */
const REGISTRY_SECTIONS: readonly (readonly [string, string, string])[] = [
  ['background', 'backgrounds', 'Backgrounds'],
  ['hero', 'heros', 'Heros'],
  ['text', 'text', 'Text Animations'],
  ['effect', 'effects', 'Effets'],
  ['image', 'images', 'Images'],
  ['section', 'sections', 'Sections'],
  ['ui', 'ui', 'Interface'],
  ['hooks', 'hooks', 'Hooks'],
]

/**
 * Sous-groupes, par categorie.
 *
 * Une categorie de vingt entrees se parcourt mal : l'oeil n'y trouve rien sans
 * lire chaque ligne. Le regroupement suit ici la **technique**, pas
 * l'apparence — c'est ce qui permet de deviner le cout d'une entree avant de
 * l'ouvrir, et de trouver la voisine de celle qui ne convient pas tout a fait.
 *
 * Une categorie absente de cette table reste a plat. Une entree absente des
 * familles de sa categorie tombe dans un groupe « Divers » : elle reste donc
 * visible, et l'oubli se voit au lieu de faire disparaitre la page.
 */
const REGISTRY_FAMILIES: Readonly<
  Record<string, readonly (readonly [string, readonly string[]])[]>
> = {
  background: [
    ['Ecoulements', ['aurora', 'silk', 'mesh', 'plasma', 'caustics', 'vortex']],
    ['Pavages', ['dots', 'cells', 'hex', 'mosaic', 'halftone']],
    ['Semis', ['stars', 'rain', 'threads', 'bubbles']],
    [
      'Traits et perspectives',
      ['waves', 'beams', 'tunnel', 'spectrum', 'contour', 'ripple-grid'],
    ],
    ['Sans WebGL', ['grid-lines']],
  ],
  effect: [
    ['Pointeur', ['magnetic', 'spotlight']],
    ['Defilement', ['scroll-progress', 'parallax']],
    ['Bordures et bandeaux', ['border-beam', 'marquee']],
    ['Contenu', ['carousel', 'deform']],
  ],
  image: [
    ['Images', ['frame', 'compare']],
    ['Videos', ['video', 'player']],
  ],
}

/**
 * Une page par entree de registre, derivee du catalogue.
 *
 * La navigation ne peut donc ni oublier une entree ni en inventer : elle liste
 * exactement ce que la compilation du registre a produit.
 */
function entryPages(category: string, segment: string): readonly DocPage[] {
  return CATALOGUE.filter((entry) => entry.category === category).map((entry) => ({
    path: `/docs/${segment}/${entry.name}`,
    title: entry.title,
    description: entry.description,
    keywords: [entry.name, entry.id, entry.perf.tier],
  }))
}

/** Repartit les pages d'une categorie dans ses familles. */
function entryGroups(
  category: string,
  segment: string,
  families: readonly (readonly [string, readonly string[]])[],
): readonly DocGroup[] {
  const pages = entryPages(category, segment)
  const place = new Map(
    pages.map((page) => [page.path.slice(page.path.lastIndexOf('/') + 1), page]),
  )

  const groups: DocGroup[] = []
  for (const [title, names] of families) {
    const kept = names.flatMap((name) => {
      const page = place.get(name)
      if (page === undefined) return []
      place.delete(name)
      return [page]
    })
    if (kept.length > 0) groups.push({ title, pages: kept })
  }

  // Ce qui n'a ete range nulle part reste visible : un oubli doit se voir,
  // pas faire disparaitre une page.
  if (place.size > 0) groups.push({ title: 'Divers', pages: [...place.values()] })

  return groups
}

/** Sections du registre, une par categorie, sous-groupees quand il le faut. */
export const REGISTRY_DOC_SECTIONS: readonly DocSection[] = REGISTRY_SECTIONS.flatMap(
  ([category, segment, title]) => {
    const families = REGISTRY_FAMILIES[category]
    const section: DocSection =
      families === undefined
        ? { title, pages: entryPages(category, segment) }
        : { title, groups: entryGroups(category, segment, families) }

    const count = section.pages?.length ?? section.groups?.length ?? 0
    return count === 0 ? [] : [section]
  },
)

/** Selectionne des pages de composants par leur identifiant, dans l'ordre donne. */
function pick(names: readonly string[]): readonly DocPage[] {
  return names.map((name) => {
    const page = COMPONENT_PAGES.find((entry) => entry.path.endsWith(`/${name}`))
    if (page === undefined) throw new Error(`Page de composant inconnue : ${name}`)
    return page
  })
}

/**
 * Composants d'interface, groupes par ce qu'on vient y chercher.
 *
 * L'ordre alphabetique est le pire classement possible pour une liste qu'on
 * parcourt sans savoir ce qu'on cherche : il rapproche `Alert` et `Avatar`,
 * qui n'ont rien a voir, et separe `Input` de `Textarea`, qui vont ensemble.
 */
export const COMPONENT_GROUPS: readonly DocGroup[] = [
  {
    title: 'Saisie',
    pages: pick([
      'button',
      'input',
      'textarea',
      'select',
      'select-menu',
      'checkbox',
      'radio',
      'switch',
      'slider',
    ]),
  },
  {
    title: 'Affichage',
    pages: pick([
      'card',
      'badge',
      'avatar',
      'alert',
      'separator',
      'skeleton',
      'spinner',
      'progress',
      'kbd',
    ]),
  },
  { title: 'Navigation', pages: pick(['tabs', 'accordion', 'breadcrumb', 'pagination']) },
  {
    title: 'Surcouches',
    pages: pick(['tooltip', 'popover', 'dropdown-menu', 'dialog', 'drawer', 'toast']),
  },
  { title: 'Donnees', pages: pick(['table']) },
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
    title: 'Fondations',
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
        description: 'Palette brute de 290 nuances OKLCH. Aucun role.',
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
    title: 'Composants',
    groups: COMPONENT_GROUPS,
  },
  {
    title: 'Icones',
    pages: [
      {
        path: '/docs/icones',
        title: 'Vue d’ensemble',
        description: 'Cinq jeux, un contrat, et comment on en choisit un.',
        keywords: ['icone', 'icon', 'svg', 'pictogramme', 'glyphe'],
      },
      {
        path: '/docs/icones/filaire',
        title: 'Filaire',
        description: 'Trace au trait de deux unites sur une grille de vingt-quatre.',
        keywords: ['icone', 'trait', 'contour', 'outline', 'stroke'],
      },
      {
        path: '/docs/icones/compact',
        title: 'Compact',
        description: 'Glyphes pleins sur une grille de seize, lisibles a petite taille.',
        keywords: ['icone', 'plein', 'solid', 'petit'],
      },
      {
        path: '/docs/icones/classique',
        title: 'Classique',
        description: 'Glyphes pleins sur une grille de cinq cent douze.',
        keywords: ['icone', 'plein', 'solid', 'classique'],
      },
      {
        path: '/docs/icones/etendu',
        title: 'Etendu',
        description:
          'Le plus vaste des jeux : contour fin sur une grille de neuf cent soixante.',
        keywords: ['icone', 'contour', 'vaste', 'symbole'],
      },
      {
        path: '/docs/icones/marques',
        title: 'Marques',
        description: 'Logos de services et de plateformes. Des marques deposees.',
        keywords: ['icone', 'logo', 'marque', 'brand', 'social'],
      },
    ],
  },
  ...REGISTRY_DOC_SECTIONS,
  {
    title: 'Motions',
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
        path: '/docs/motion/librairie',
        title: 'Bibliotheque',
        description: 'Pointeur, bordures, defilement, bandeau, carrousel.',
        keywords: [
          'carrousel',
          'carousel',
          'pointeur',
          'magnetic',
          'spotlight',
          'halo',
          'bordure',
          'border',
          'marquee',
          'bandeau',
          'parallaxe',
          'parallax',
          'scroll',
        ],
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
        path: '/docs/registre/catalogue',
        title: 'Catalogue',
        description: 'Tout ce que le registre publie, lu dans l index.',
        keywords: ['catalogue', 'liste', 'inventaire', 'tout', 'index', 'entrees'],
      },
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
      {
        path: '/docs/registre/contrat',
        title: 'Personnalisation',
        description: 'Les cinq niveaux, sur un composant reellement installe.',
        keywords: [
          'contrat',
          'tokens',
          'props',
          'className',
          'slot',
          'onready',
          'echappatoire',
        ],
      },
      {
        path: '/docs/registre/galerie',
        title: 'La tranche verticale',
        description: 'Un composant par categorie, installes par la CLI.',
        keywords: [
          'molten',
          'aurora',
          'split-reveal',
          'hero',
          'fond',
          'texte',
          'three',
          'shader',
          'galerie',
        ],
      },
    ],
  },
]

/** Toutes les pages d'une section, sous-groupes compris. */
export function sectionPages(section: DocSection): readonly DocPage[] {
  return section.pages ?? (section.groups ?? []).flatMap((group) => group.pages)
}

/** Liste a plat de toutes les pages, avec leur section. */
export const ALL_PAGES: readonly (DocPage & { section: string })[] = DOC_SECTIONS.flatMap(
  (section) => sectionPages(section).map((page) => ({ ...page, section: section.title })),
)
