/**
 * La bibliotheque de vitrines : des pages d atterrissage entieres, jouables.
 *
 * ## Pourquoi elles ne sont pas des entrees du registre
 *
 * Une entree du registre est une piece — un fond, un bouton, une section. Une
 * vitrine est un **assemblage** : elle ne s installe pas, elle se lit. Elle
 * repond a la seule question que le catalogue ne sait pas traiter — « a quoi
 * ressemble un site fait avec ca ? » — et elle y repond en etant ce site.
 *
 * ## Ce que chacune doit prouver
 *
 * Deux vitrines qui se ressemblent n en valent qu une. Chacune part donc d une
 * famille de teintes, d un fond et d une animation de titre qui n appartiennent
 * qu a elle, et d un metier reel : le boulanger du coin n a pas les memes
 * besoins qu un editeur de logiciel, et cela doit se voir avant d avoir lu une
 * ligne.
 *
 * ## Le chargement
 *
 * Quarante-sept pages completes dans le paquet principal alourdiraient chaque
 * visite de la documentation. Chaque vitrine est donc derriere un import
 * paresseux, resolu au moment ou on l ouvre.
 *
 * @module
 */

import { type ComponentType } from 'react'

/** Le secteur d activite d une vitrine, pour le filtre de la galerie. */
export type VitrineSecteur =
  | 'commerce'
  | 'bien-etre'
  | 'logiciel'
  | 'entreprise'
  | 'culture'
  | 'produit'
  | 'science'
  | 'industrie'

/** Une vitrine de la bibliotheque. */
export interface Vitrine {
  /** Segment d URL. */
  readonly slug: string
  /** Le nom du site fictif. */
  readonly titre: string
  /** Le metier, en trois mots. */
  readonly metier: string
  /** Une phrase : ce que la page vend, et sur quel ton. */
  readonly resume: string
  readonly secteur: VitrineSecteur
  /** Trois tokens de palette, montres en pastilles sur la carte. */
  readonly palette: readonly [string, string, string]
  /**
   * Teinte d origine de la vitrine, dans le systeme.
   *
   * C est le point de depart : la barre laisse en changer, et la vitrine suit,
   * parce qu elle n ecrit sa couleur nulle part en dur.
   */
  readonly teinte: string
  /** « sombre » : la page est sombre quel que soit le theme ; « theme » : elle suit le theme clair ou sombre. */
  readonly ton: 'sombre' | 'theme'
  /** Classes du degrade d apercu, en paires clair / sombre. */
  readonly apercu: string
  /** Les entrees du registre qu elle emploie, pour situer d un coup d oeil. */
  readonly pieces: readonly string[]
  /** Le module de la page. */
  readonly charger: () => Promise<{ default: ComponentType }>
}

/**
 * Les vingt-quatre vitrines, du commerce de quartier au logiciel d entreprise.
 *
 * L ordre est celui de la galerie : les secteurs se suivent, pour qu un
 * visiteur qui descend voie le registre changer de registre.
 */
export const VITRINES: readonly Vitrine[] = [
  // ----- Commerce de proximite ----------------------------------------------
  {
    slug: 'bistro',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Maison Perrin',
    metier: 'Bistrot de quartier',
    resume:
      'Une carte qui change chaque semaine, une salle de trente couverts, et une reservation qui tient en trois champs.',
    secteur: 'commerce',
    palette: ['--o-palette-amber-500', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['background/crosshatch', 'text/split-flap', 'effect/marquee', 'effect/magnetic'],
    charger: () => import('./bistro.jsx'),
  },
  {
    slug: 'torrefaction',
    teinte: 'orange',
    ton: 'theme',
    titre: 'Brulerie Nord',
    metier: 'Torrefacteur',
    resume:
      'Des grains traces jusqu a la parcelle, vendus au sachet, avec l abonnement qui evite d y penser.',
    secteur: 'commerce',
    palette: ['--o-palette-orange-600', '--o-palette-stone-800', '--o-palette-amber-200'],
    apercu: 'o-bg-gradient-to-br o-from-orange-100 dark:o-from-orange-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['background/dunes', 'image/duotone', 'section/sticky-stack', 'text/curved-loop'],
    charger: () => import('./torrefaction.jsx'),
  },
  {
    slug: 'barbier',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Atelier Rasoir',
    metier: 'Barbier',
    resume:
      'Trois fauteuils, pas de file d attente : on choisit son creneau et on repart avec l heure exacte.',
    secteur: 'commerce',
    palette: ['--o-palette-amber-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-200 dark:o-from-zinc-900 o-to-amber-100 dark:o-to-amber-950',
    pieces: ['background/smoke', 'image/ken-burns', 'image/scroll-reveal-image', 'section/cinematic-footer', 'text/letter-swap'],
    charger: () => import('./barbier.jsx'),
  },
  {
    slug: 'limonade',
    teinte: 'lime',
    ton: 'sombre',
    titre: 'Vif',
    metier: 'Limonade artisanale',
    resume:
      'Cinq parfums, une canette en volume au centre : en choisir un la fait tourner, reteinte toute la page et change les mentions.',
    secteur: 'commerce',
    palette: ['--o-palette-lime-400', '--o-palette-violet-500', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-violet-200 dark:o-to-violet-950',
    pieces: ['effect/click-sparks', 'text/gradient-flow', 'ui/glass-surface', 'ui/liquid-button'],
    charger: () => import('./limonade.jsx'),
  },
  {
    slug: 'boulangerie',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Levain',
    metier: 'Boulanger',
    resume:
      'Sept fournees par jour : la page lit l horloge et dit ce qui est au four, ce qui est sur la planche et ce qui est deja parti.',
    secteur: 'commerce',
    palette: ['--o-palette-amber-500', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['effect/glare-hover', 'effect/halftone-reveal', 'section/timeline', 'text/morph-text'],
    charger: () => import('./boulangerie.jsx'),
  },
  {
    slug: 'poissonnerie',
    teinte: 'cyan',
    ton: 'theme',
    titre: 'Criee',
    metier: 'Poissonnier',
    resume:
      'L arrivage du matin : sept lots, le bateau et le port de chacun, un feu de saison calcule sur le mois, et le plan cote de l espece choisie.',
    secteur: 'commerce',
    palette: ['--o-palette-cyan-500', '--o-palette-slate-900', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['effect/gradual-blur', 'text/split-flap', 'ui/pill-tabs'],
    charger: () => import('./poissonnerie.jsx'),
  },
  {
    slug: 'fromagerie',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Hale',
    metier: 'Fromager affineur',
    resume:
      'La cave en coupe, trois etages : chaque piece est posee la ou elle en est vraiment, et son compte de jours avance avec le calendrier.',
    secteur: 'commerce',
    palette: ['--o-palette-amber-600', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['effect/cursor-halo', 'text/stroke-text', 'ui/toast-stack'],
    charger: () => import('./fromagerie.jsx'),
  },
  {
    slug: 'librairie',
    teinte: 'stone',
    ton: 'theme',
    titre: 'Marge',
    metier: 'Libraire',
    resume:
      'Une table qui se recompose selon l humeur qu on declare, un rayon en volume qui tire le livre choisi, et le mot du libraire signe a la main.',
    secteur: 'commerce',
    palette: ['--o-palette-stone-700', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-100 dark:o-from-stone-900 o-to-stone-300 dark:o-to-stone-950',
    pieces: ['section/book-shelf', 'section/sticky-stack', 'text/hand-written', 'text/underline-draw'],
    charger: () => import('./librairie.jsx'),
  },
  {
    slug: 'disquaire',
    teinte: 'red',
    ton: 'sombre',
    titre: 'Sillon Noir',
    metier: 'Disquaire',
    resume:
      'Un microsillon en volume qui tourne a trente-trois tours et un tiers, et un bac qu on feuillette au doigt et a la molette.',
    secteur: 'commerce',
    palette: ['--o-palette-red-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-red-100 dark:o-from-red-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['effect/inertia-drag', 'text/echo-text', 'ui/sortable-list'],
    charger: () => import('./disquaire.jsx'),
  },
  {
    slug: 'dentiste',
    teinte: 'teal',
    ton: 'theme',
    titre: 'Emaille',
    metier: 'Cabinet dentaire',
    resume:
      'Un schema dentaire cliquable : on designe les dents a reprendre et le devis se fait devant vous, remboursement et reste a charge compris.',
    secteur: 'bien-etre',
    palette: ['--o-palette-teal-600', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-teal-100 dark:o-from-teal-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['effect/beam-connect', 'section/faq', 'text/highlight-sweep'],
    charger: () => import('./dentiste.jsx'),
  },
  {
    slug: 'osteopathe',
    teinte: 'stone',
    ton: 'theme',
    titre: 'Appui',
    metier: 'Osteopathe',
    resume:
      'Deux silhouettes dessinees : on designe la douleur, et la page repond par le protocole, sa duree, et ce qui ne releve pas de l osteopathie.',
    secteur: 'bien-etre',
    palette: ['--o-palette-stone-600', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-100 dark:o-from-stone-900 o-to-stone-200 dark:o-to-stone-950',
    pieces: ['section/timeline', 'text/scroll-reveal', 'ui/elastic-slider'],
    charger: () => import('./osteopathe.jsx'),
  },
  {
    slug: 'creche',
    teinte: 'rose',
    ton: 'theme',
    titre: 'Marelle',
    metier: 'Creche associative',
    resume:
      'Douze moments dessines, epingles heure par heure : la journee entiere d une creche parentale, du portemanteau au trousseau de cles.',
    secteur: 'bien-etre',
    palette: ['--o-palette-rose-500', '--o-palette-zinc-950', '--o-palette-amber-300'],
    apercu: 'o-bg-gradient-to-br o-from-rose-100 dark:o-from-rose-950 o-to-amber-100 dark:o-to-amber-950',
    pieces: ['effect/click-sparks', 'effect/sticker-peel', 'text/hand-written'],
    charger: () => import('./creche.jsx'),
  },
  {
    slug: 'base-donnees',
    teinte: 'violet',
    ton: 'sombre',
    titre: 'Socle',
    metier: 'Base de donnees',
    resume:
      'On compose une requete et le plan d execution se dessine, noeud par noeud, avec ses couts : la page montre pourquoi un index n est pas toujours employe.',
    secteur: 'logiciel',
    palette: ['--o-palette-violet-400', '--o-palette-zinc-950', '--o-palette-violet-200'],
    apercu: 'o-bg-gradient-to-br o-from-violet-100 dark:o-from-violet-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/data-stream', 'section/changelog', 'text/typewriter', 'ui/tree-view'],
    charger: () => import('./base-donnees.jsx'),
  },
  {
    slug: 'outil-design',
    teinte: 'fuchsia',
    ton: 'theme',
    titre: 'Calque',
    metier: 'Outil de design',
    resume:
      'Une affiche dessinee en huit calques : on les montre, on les cache, on change leur ordre, et le dessin se recompose sous les yeux.',
    secteur: 'logiciel',
    palette: ['--o-palette-fuchsia-500', '--o-palette-zinc-950', '--o-palette-amber-200'],
    apercu: 'o-bg-gradient-to-br o-from-fuchsia-100 dark:o-from-fuchsia-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['section/bento-grid', 'section/container-scroll', 'text/stroke-text', 'ui/progress-ring'],
    charger: () => import('./outil-design.jsx'),
  },
  {
    slug: 'escalade',
    teinte: 'orange',
    ton: 'theme',
    titre: 'Devers',
    metier: 'Salle d escalade',
    resume:
      'Un topo plutot qu une plaquette : la voie s allume prise par prise, au rythme releve sur la video d ouverture, et le corps de la page est une montee de dix-sept metres.',
    secteur: 'bien-etre',
    palette: ['--o-palette-orange-500', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-orange-100 dark:o-from-orange-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['effect/click-sparks', 'effect/spotlight', 'text/scroll-float', 'ui/pill-tabs'],
    charger: () => import('./escalade.jsx'),
  },
  {
    slug: 'piscine',
    teinte: 'cyan',
    ton: 'theme',
    titre: 'Bassin Nord',
    metier: 'Piscine municipale',
    resume:
      'Un mois de comptages en carte de chaleur : six lignes, treize creneaux, et la page qui vous dit elle-meme a quelle heure votre ligne est vide.',
    secteur: 'bien-etre',
    palette: ['--o-palette-cyan-500', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['background/water-surface', 'image/scroll-reveal-image', 'text/wave-text', 'ui/elastic-slider'],
    charger: () => import('./piscine.jsx'),
  },
  {
    slug: 'voile',
    teinte: 'sky',
    ton: 'sombre',
    titre: 'Grand Largue',
    metier: 'Course au large',
    resume:
      'Dix-huit jours de carnet de bord : la route se trace sur la carte au rythme des milles courus, vite dans les alizes et presque plus dans la molle.',
    secteur: 'bien-etre',
    palette: ['--o-palette-sky-400', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-slate-900 dark:o-from-slate-950 o-to-sky-900 dark:o-to-sky-950',
    pieces: ['background/stars', 'effect/border-beam', 'text/rotating-words', 'ui/option-wheel'],
    charger: () => import('./voile.jsx'),
  },
  {
    slug: 'ski',
    teinte: 'sky',
    ton: 'theme',
    titre: 'Combe',
    metier: 'Ecole de ski',
    resume:
      'Le bulletin plutot que la brochure : on choisit son niveau et la page calcule les pistes ouvertes, le denivele skiable et l heure ou il faut monter.',
    secteur: 'bien-etre',
    palette: ['--o-palette-sky-500', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-sky-100 dark:o-from-sky-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['effect/glare-hover', 'image/color-shift', 'text/blur-reveal'],
    charger: () => import('./ski.jsx'),
  },
  {
    slug: 'boxe',
    teinte: 'red',
    ton: 'sombre',
    titre: 'Corde a Sauter',
    metier: 'Salle de boxe',
    resume:
      'Un minuteur de trois minutes qui mene l enchainement coup par coup, un compteur a rouleaux, et la zone visee qui s allume sur la silhouette.',
    secteur: 'bien-etre',
    palette: ['--o-palette-red-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-900 dark:o-from-zinc-950 o-to-red-900 dark:o-to-red-950',
    pieces: ['background/electric-field', 'effect/glitch-hover', 'text/echo-text', 'ui/electric-border'],
    charger: () => import('./boxe.jsx'),
  },
  {
    slug: 'quincaillerie',
    teinte: 'zinc',
    ton: 'theme',
    titre: 'Ecrou',
    metier: 'Quincaillier',
    resume:
      'Un meuble a six cent vingt tiroirs : on cherche par diametre, par pas et par matiere, et la vis se redessine a l echelle avec son foret, sa clef et son couple.',
    secteur: 'commerce',
    palette: ['--o-palette-zinc-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-100 dark:o-from-zinc-900 o-to-zinc-300 dark:o-to-zinc-950',
    pieces: ['effect/magnet-lines', 'effect/target-cursor', 'text/decode-text'],
    charger: () => import('./quincaillerie.jsx'),
  },
  {
    slug: 'primeur',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Cageot',
    metier: 'Primeur',
    resume:
      'Douze mois et dix-huit produits : la page ouvre le mois courant, barre ce qui n est pas de saison, et la nappe du fond prend les couleurs du mois.',
    secteur: 'commerce',
    palette: ['--o-palette-lime-500', '--o-palette-stone-900', '--o-palette-lime-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-orange-100 dark:o-to-stone-900',
    pieces: ['effect/float-group', 'effect/sticker-peel', 'text/rotating-words', 'ui/flip-card'],
    charger: () => import('./primeur.jsx'),
  },
  {
    slug: 'opticien',
    teinte: 'slate',
    ton: 'theme',
    titre: 'Verre et Monture',
    metier: 'Opticien',
    resume:
      'Six formes de visage, six montures, et la monture qui se pose a l echelle : largeur frontale, centres optiques, decentrement — en millimetres.',
    secteur: 'commerce',
    palette: ['--o-palette-slate-600', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-slate-100 dark:o-from-slate-900 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['effect/cursor-ring', 'effect/glare-hover', 'text/true-focus', 'ui/elastic-slider'],
    charger: () => import('./opticien.jsx'),
  },
  {
    slug: 'cordonnerie',
    teinte: 'stone',
    ton: 'theme',
    titre: 'Alene',
    metier: 'Cordonnier',
    resume:
      'Une semelle en vraie cote ou l on designe l usure : le devis se compose selon les regles de l atelier, puis trois crans en font un montant.',
    secteur: 'commerce',
    palette: ['--o-palette-stone-600', '--o-palette-stone-950', '--o-palette-amber-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-200 dark:o-from-stone-900 o-to-amber-100 dark:o-to-stone-950',
    pieces: ['effect/pixel-transition', 'effect/ripple-click', 'text/hand-written', 'text/scroll-float'],
    charger: () => import('./cordonnerie.jsx'),
  },
  {
    slug: 'papeterie',
    teinte: 'sky',
    ton: 'theme',
    titre: 'Filigrane',
    metier: 'Papetier',
    resume:
      'Un papier tient dans deux nombres : le grammage et la main. L epaisseur, le poids d une lettre et la pile de cinq centimetres en decoulent, et se calculent.',
    secteur: 'commerce',
    palette: ['--o-palette-sky-600', '--o-palette-slate-900', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-sky-100 dark:o-from-sky-950 o-to-slate-100 dark:o-to-slate-900',
    pieces: ['text/circular-text', 'text/fold-text', 'ui/folder'],
    charger: () => import('./papeterie.jsx'),
  },
  {
    slug: 'crm',
    teinte: 'emerald',
    ton: 'theme',
    titre: 'Carnet',
    metier: 'CRM d artisan',
    resume:
      'Un client, un chantier, une facture — et le jour ou elle n est pas payee, le decompte exact de ce qu on peut reclamer.',
    secteur: 'logiciel',
    palette: ['--o-palette-emerald-600', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-emerald-100 dark:o-from-emerald-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['background/graph-paper', 'section/sticky-stack', 'text/hand-written', 'ui/animated-list'],
    charger: () => import('./crm.jsx'),
  },
  {
    slug: 'recherche',
    teinte: 'zinc',
    ton: 'sombre',
    titre: 'Index',
    metier: 'Moteur de recherche interne',
    resume:
      'On tape, et les resultats se reordonnent avec leur score pose a cote : titre, corps, fraicheur, clics.',
    secteur: 'logiciel',
    palette: ['--o-palette-zinc-300', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-800 o-to-zinc-950',
    pieces: ['effect/crosshair', 'text/decode-text', 'text/scroll-reveal', 'ui/tree-view'],
    charger: () => import('./recherche.jsx'),
  },
  {
    slug: 'video',
    teinte: 'red',
    ton: 'sombre',
    titre: 'Bobine',
    metier: 'Plateforme video',
    resume:
      'Une frise de lecture, neuf chapitres, sept qualites — et le poids reel de chacune, calcule sous vos yeux.',
    secteur: 'logiciel',
    palette: ['--o-palette-red-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-red-950 o-to-zinc-950',
    pieces: ['background/audio-bars', 'effect/gradual-blur', 'text/depth-text', 'ui/elastic-slider'],
    charger: () => import('./video.jsx'),
  },
  {
    slug: 'nocode',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Assemblee',
    metier: 'Outil sans code',
    resume:
      'Trois briques a brancher — quand, si, alors — et le journal de votre semaine passee rejoue a cote.',
    secteur: 'logiciel',
    palette: ['--o-palette-lime-500', '--o-palette-zinc-900', '--o-palette-lime-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-zinc-100 dark:o-to-zinc-900',
    pieces: ['section/bento-grid', 'section/container-scroll', 'text/rotating-words', 'ui/option-wheel'],
    charger: () => import('./nocode.jsx'),
  },
  {
    slug: 'observabilite',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Vigie',
    metier: 'Observabilite',
    resume:
      'Un incident de quarante-huit minutes, traverse minute par minute : les signaux montent, le journal s ecrit, la cause apparait.',
    secteur: 'logiciel',
    palette: ['--o-palette-amber-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-950 o-to-zinc-950',
    pieces: ['background/hologram', 'section/timeline', 'text/scroll-float', 'ui/segmented-control'],
    charger: () => import('./observabilite.jsx'),
  },
  {
    slug: 'messagerie',
    teinte: 'slate',
    ton: 'sombre',
    titre: 'Pli Ferme',
    metier: 'Messagerie chiffree',
    resume:
      'Le chiffrement de bout en bout demontre au lieu d etre promis : on ecrit une phrase, la page en montre les octets, le sceau, et les cinquante-trois octets que le serveur garde.',
    secteur: 'logiciel',
    palette: ['--o-palette-slate-400', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-slate-200 dark:o-from-slate-900 o-to-zinc-100 dark:o-to-zinc-950',
    pieces: ['background/grid-lines', 'text/morph-text', 'ui/code-input', 'ui/copy-button', 'ui/tree-view'],
    charger: () => import('./messagerie.jsx'),
  },
  {
    slug: 'avocats',
    teinte: 'slate',
    ton: 'theme',
    titre: 'Barreau',
    metier: 'Cabinet d avocats',
    resume:
      'La question qu on pose en premier a un avocat — combien de temps — recoit ici sa frise : chaque etape a sa date, et les couperets sont distingues des delais indicatifs.',
    secteur: 'entreprise',
    palette: ['--o-palette-slate-600', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-100 dark:o-from-stone-900 o-to-slate-200 dark:o-to-slate-950',
    pieces: ['image/frame', 'text/blur-words', 'ui/animated-list', 'ui/pill-tabs'],
    charger: () => import('./avocats.jsx'),
  },
  {
    slug: 'comptable',
    teinte: 'emerald',
    ton: 'theme',
    titre: 'Grand Livre',
    metier: 'Expert-comptable',
    resume:
      'Un bilan simplifie qu on remplit dans la page, les six ratios du banquier qui s allument, et l ecart d equilibre annonce avec son montant.',
    secteur: 'entreprise',
    palette: ['--o-palette-emerald-600', '--o-palette-zinc-900', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-emerald-100 dark:o-from-emerald-950 o-to-zinc-100 dark:o-to-zinc-900',
    pieces: ['section/sticky-stack', 'text/spotlight-text', 'ui/button-group-input'],
    charger: () => import('./comptable.jsx'),
  },
  {
    slug: 'recrutement',
    teinte: 'violet',
    ton: 'theme',
    titre: 'Trait d Union',
    metier: 'Agence de recrutement',
    resume:
      'On ecrit une fiche de poste, la page rend deux listes : ce qu elle attirera, ce qu elle fera fuir, et le detail des points, regle par regle.',
    secteur: 'entreprise',
    palette: ['--o-palette-violet-500', '--o-palette-neutral-900', '--o-palette-neutral-100'],
    apercu: 'o-bg-gradient-to-br o-from-violet-100 dark:o-from-violet-950 o-to-neutral-100 dark:o-to-neutral-900',
    pieces: ['section/logo-band', 'text/true-focus', 'ui/avatar-stack', 'ui/tag-input'],
    charger: () => import('./recrutement.jsx'),
  },
  {
    slug: 'assurance',
    teinte: 'sky',
    ton: 'theme',
    titre: 'Franchise',
    metier: 'Courtier en assurance',
    resume:
      'Trois sinistres avec leur facture, les trois formules appliquees dessus ligne a ligne, et le seul chiffre qui compte : ce qui reste a votre charge.',
    secteur: 'entreprise',
    palette: ['--o-palette-sky-600', '--o-palette-slate-900', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-sky-100 dark:o-from-sky-950 o-to-slate-100 dark:o-to-slate-900',
    pieces: ['section/sticky-stack', 'text/split-reveal', 'ui/stepper'],
    charger: () => import('./assurance.jsx'),
  },
  {
    slug: 'notaire',
    teinte: 'stone',
    ton: 'theme',
    titre: 'Minute',
    metier: 'Etude notariale',
    resume:
      'Le calcul entier des frais d acquisition, au bareme reglemente : sept postes, une reglette graduee, et les quatre-vingt-trois pour cent qui reviennent a l Etat.',
    secteur: 'entreprise',
    palette: ['--o-palette-stone-500', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-100 dark:o-from-stone-900 o-to-stone-300 dark:o-to-stone-950',
    pieces: ['effect/marquee', 'text/blur-words', 'ui/button-group-input', 'ui/copy-button', 'ui/segmented-control'],
    charger: () => import('./notaire.jsx'),
  },
  {
    slug: 'formation',
    teinte: 'orange',
    ton: 'theme',
    titre: 'Atelier Continu',
    metier: 'Organisme de formation',
    resume:
      'Douze modules sur un rail, quatre blocs de competences : on coche, et les heures, la degressivite, la prise en charge et le reste a charge se composent devant vous.',
    secteur: 'entreprise',
    palette: ['--o-palette-orange-500', '--o-palette-zinc-950', '--o-palette-orange-100'],
    apercu: 'o-bg-gradient-to-br o-from-orange-100 dark:o-from-orange-950 o-to-amber-200 dark:o-to-zinc-900',
    pieces: ['effect/marquee', 'text/letter-swap', 'ui/animated-list', 'ui/stepper'],
    charger: () => import('./formation.jsx'),
  },
  {
    slug: 'opera',
    teinte: 'red',
    ton: 'sombre',
    titre: 'Grand Foyer',
    metier: 'Opera',
    resume:
      'Un lustre en volume, et mille huit cent quarante-deux places cliquables : chaque siege dit sa distance, son angle, sa hauteur, et redessine la vue qu il donne sur le plateau.',
    secteur: 'culture',
    palette: ['--o-palette-red-500', '--o-palette-zinc-950', '--o-palette-amber-100'],
    apercu: 'o-bg-gradient-to-br o-from-red-200 dark:o-from-red-950 o-to-zinc-300 dark:o-to-zinc-950',
    pieces: ['background/noise', 'text/spotlight-text', 'ui/flip-card'],
    charger: () => import('./opera.jsx'),
  },
  {
    slug: 'cinema',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Salle 3',
    metier: 'Cinema d art et d essai',
    resume:
      'La semaine en plan d occupation : chaque seance occupe sa duree reelle, annonces comprises, et la grille marque celles qui finissent apres le dernier bus.',
    secteur: 'culture',
    palette: ['--o-palette-amber-400', '--o-palette-zinc-950', '--o-palette-amber-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-200 dark:o-from-amber-950 o-to-zinc-300 dark:o-to-zinc-950',
    pieces: ['background/noise', 'effect/marquee', 'text/fuzzy-text', 'text/split-flap', 'ui/star-border'],
    charger: () => import('./cinema.jsx'),
  },
  {
    slug: 'bibliotheque',
    teinte: 'teal',
    ton: 'theme',
    titre: 'Rayon 800',
    metier: 'Bibliotheque municipale',
    resume:
      'Les cent divisions de la decimale avec le fonds tenu dans chaque case, et une cote qui se descend chiffre a chiffre : a chaque cran, le rayon ne garde que ce qui commence par elle.',
    secteur: 'culture',
    palette: ['--o-palette-teal-600', '--o-palette-stone-900', '--o-palette-teal-100'],
    apercu: 'o-bg-gradient-to-br o-from-teal-100 dark:o-from-teal-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['image/frame', 'section/book-shelf', 'text/split-lines'],
    charger: () => import('./bibliotheque.jsx'),
  },
  {
    slug: 'theatre',
    teinte: 'rose',
    ton: 'sombre',
    titre: 'Coulisse',
    metier: 'Theatre de ville',
    resume:
      'Une coupe du plateau, epinglee : a chaque acte un metier prend la scene, ses zones s allument, et les heures de montage s additionnent.',
    secteur: 'culture',
    palette: ['--o-palette-rose-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-rose-100 dark:o-from-rose-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['effect/cursor-halo', 'effect/neon-border', 'text/shine-text'],
    charger: () => import('./theatre.jsx'),
  },
  {
    slug: 'cirque',
    teinte: 'fuchsia',
    ton: 'sombre',
    titre: 'Chapiteau',
    metier: 'Cirque contemporain',
    resume:
      'Le chapiteau se monte en dix etapes pendant qu on descend : piquetage, mat de centre, levage, haubans, et un compteur a rouleaux pour la route.',
    secteur: 'culture',
    palette: ['--o-palette-fuchsia-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-fuchsia-100 dark:o-from-fuchsia-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/floating-shapes', 'text/warp-text', 'ui/star-border'],
    charger: () => import('./cirque.jsx'),
  },
  {
    slug: 'edition',
    teinte: 'stone',
    ton: 'theme',
    titre: 'Corps 11',
    metier: 'Maison d edition',
    resume:
      'Huit postes du manuscrit au livre, un curseur de tirage, et le prix public qui se partage sous vos yeux entre libraire, auteur, fabrication et maison.',
    secteur: 'culture',
    palette: ['--o-palette-stone-500', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-100 dark:o-from-stone-900 o-to-stone-300 dark:o-to-stone-950',
    pieces: ['text/fold-text', 'text/underline-draw', 'ui/tilt-card'],
    charger: () => import('./edition.jsx'),
  },
  {
    slug: 'radio',
    teinte: 'orange',
    ton: 'sombre',
    titre: 'Bande FM',
    metier: 'Radio associative',
    resume:
      'La grille des vingt-quatre heures, lue sur votre horloge : l emission en cours, ce qu il en reste, et la bande FM en reglette graduee.',
    secteur: 'culture',
    palette: ['--o-palette-orange-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-orange-100 dark:o-from-orange-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/audio-bars', 'effect/glitch-hover', 'text/text-pressure', 'ui/pill-tabs'],
    charger: () => import('./radio.jsx'),
  },
  {
    slug: 'archives',
    teinte: 'zinc',
    ton: 'theme',
    titre: 'Fonds',
    metier: 'Archives departementales',
    resume:
      'On descend d un fonds a une piece en quatre colonnes : la cote s allonge, la notice se remplit, et le document numerise apparait au bout.',
    secteur: 'culture',
    palette: ['--o-palette-zinc-500', '--o-palette-zinc-900', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-100 dark:o-from-zinc-900 o-to-zinc-300 dark:o-to-zinc-950',
    pieces: ['effect/magnet-lines', 'image/reveal-image', 'text/blur-words'],
    charger: () => import('./archives.jsx'),
  },
  {
    slug: 'montre',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Balancier',
    metier: 'Horloger',
    resume:
      'Un mouvement mecanique en volume, quatre calibres de 18 000 a 36 000 alternances a l heure : l echappement bat a sa vraie frequence, et on le ralentit jusqu au centieme pour voir la dent tomber.',
    secteur: 'produit',
    palette: ['--o-palette-amber-400', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['text/circular-text', 'ui/flip-card', 'ui/option-wheel', 'ui/pill-tabs'],
    charger: () => import('./montre.jsx'),
  },
  {
    slug: 'enceinte',
    teinte: 'zinc',
    ton: 'sombre',
    titre: 'Membrane',
    metier: 'Fabricant d enceintes',
    resume:
      'La courbe se retrace pour la piece, le recul au mur et la position : le creux du mur de derriere tombe ou la physique le met, et la membrane suit le balayage de vingt hertz a vingt kilohertz.',
    secteur: 'produit',
    palette: ['--o-palette-zinc-400', '--o-palette-amber-800', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-200 dark:o-from-zinc-900 o-to-amber-100 dark:o-to-amber-950',
    pieces: ['text/split-reveal', 'ui/animated-list', 'ui/spotlight-card', 'ui/star-border'],
    charger: () => import('./enceinte.jsx'),
  },
  {
    slug: 'couteau',
    teinte: 'stone',
    ton: 'sombre',
    titre: 'Emouture',
    metier: 'Coutelier',
    resume:
      'Une coupe de lame cotee dont on change l emouture : l angle inclus, l epaisseur a un millimetre du fil et l effort de coupe sortent tous de la meme geometrie.',
    secteur: 'produit',
    palette: ['--o-palette-stone-400', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-200 dark:o-from-stone-900 o-to-zinc-100 dark:o-to-zinc-950',
    pieces: ['effect/magnet-lines', 'section/comparison-table', 'text/split-lines'],
    charger: () => import('./couteau.jsx'),
  },
  {
    slug: 'sac',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Sangle',
    metier: 'Maroquinier',
    resume:
      'Le patron a plat, cote au centimetre, qui se replie en sac au defilement : la contenance, la surface de cuir, les points sellier et les heures sortent des memes six cotes.',
    secteur: 'produit',
    palette: ['--o-palette-amber-700', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['effect/ripple-click', 'text/fold-text', 'ui/stepper'],
    charger: () => import('./sac.jsx'),
  },
  {
    slug: 'luminaire',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Abat-Jour',
    metier: 'Editeur de luminaires',
    resume:
      'Une echelle de huit temperatures de couleur qui reteinte la page entiere, du halo au pied, avec la courbe de Planck, le mired et l eclairement au sol recalcules a chaque cran.',
    secteur: 'produit',
    palette: ['--o-palette-amber-400', '--o-palette-sky-300', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-sky-100 dark:o-to-sky-950',
    pieces: ['effect/glow-cursor', 'text/gradient-flow', 'ui/reflective-card'],
    charger: () => import('./luminaire.jsx'),
  },
  {
    slug: 'ceramique',
    teinte: 'orange',
    ton: 'theme',
    titre: 'Tour',
    metier: 'Atelier de ceramique',
    resume:
      'Quatre programmes de cuisson publies avec leur courbe : on promene la molette sur les heures, et le four dit ce qui arrive a la terre et ce qu il coute.',
    secteur: 'produit',
    palette: ['--o-palette-orange-500', '--o-palette-stone-900', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-orange-100 dark:o-from-orange-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['effect/ripple-click', 'text/scroll-reveal', 'text/underline-draw', 'ui/option-wheel'],
    charger: () => import('./ceramique.jsx'),
  },
  {
    slug: 'instrument',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Chevalet',
    metier: 'Luthier',
    resume:
      'Un violon en volume, et le diapason qu on regle de 415 a 445 hertz : les quatre tensions se recalculent, et la charge sur la table avec elles.',
    secteur: 'produit',
    palette: ['--o-palette-amber-400', '--o-palette-zinc-950', '--o-palette-amber-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['effect/cursor-halo', 'text/shine-text', 'text/split-lines', 'ui/reflective-card'],
    charger: () => import('./instrument.jsx'),
  },
  {
    slug: 'appareil-photo',
    teinte: 'zinc',
    ton: 'sombre',
    titre: 'Obturateur',
    metier: 'Fabricant d appareils',
    resume:
      'Le triangle d exposition, calcule : on bouge une molette, la troisieme suit, et l image dessinee change de flou, de file et de grain.',
    secteur: 'produit',
    palette: ['--o-palette-zinc-300', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-200 dark:o-from-zinc-900 o-to-zinc-100 dark:o-to-zinc-950',
    pieces: ['background/grid-lines', 'effect/target-cursor', 'text/morph-text', 'ui/elastic-slider'],
    charger: () => import('./appareil-photo.jsx'),
  },
  {
    slug: 'telescope',
    teinte: 'violet',
    ton: 'sombre',
    titre: 'Coupole',
    metier: 'Observatoire',
    resume:
      'Le ciel de ce soir, calcule : quinze objets, leur hauteur et leur direction a l heure et au site choisis, et ce qui est deja passe sous l horizon.',
    secteur: 'science',
    palette: ['--o-palette-violet-400', '--o-palette-zinc-950', '--o-palette-violet-100'],
    apercu: 'o-bg-gradient-to-br o-from-violet-100 dark:o-from-violet-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/constellation', 'effect/meteors', 'section/orbital-timeline', 'text/circular-text', 'ui/star-border'],
    charger: () => import('./telescope.jsx'),
  },
  {
    slug: 'recyclage',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Seconde Vie',
    metier: 'Centre de tri',
    resume:
      'On jette un objet dans la page et il descend les sept postes : a chacun, la chaine dit s il est capte et pourquoi — aimant, forme, signature infrarouge.',
    secteur: 'industrie',
    palette: ['--o-palette-lime-500', '--o-palette-zinc-900', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['effect/beam-connect', 'text/highlight-sweep', 'ui/animated-list', 'ui/card-swap'],
    charger: () => import('./recyclage.jsx'),
  },
  {
    slug: 'fleuriste',
    teinte: 'rose',
    ton: 'theme',
    titre: 'Tige & Co',
    metier: 'Fleuriste',
    resume:
      'Des bouquets de saison, livres le jour meme dans le quartier, photographies tels qu ils partent.',
    secteur: 'commerce',
    palette: ['--o-palette-rose-500', '--o-palette-emerald-600', '--o-palette-stone-50'],
    apercu: 'o-bg-gradient-to-br o-from-rose-100 dark:o-from-rose-950 o-to-emerald-100 dark:o-to-emerald-950',
    pieces: ['effect/sticker-peel', 'image/hover-zoom', 'text/hand-written'],
    charger: () => import('./fleuriste.jsx'),
  },

  // ----- Bien-etre et sport --------------------------------------------------
  {
    slug: 'studio-yoga',
    teinte: 'teal',
    ton: 'theme',
    titre: 'Souffle',
    metier: 'Studio de yoga',
    resume:
      'Un studio qui compte ses places plutot que ses abonnes : le planning est la promesse.',
    secteur: 'bien-etre',
    palette: ['--o-palette-teal-600', '--o-palette-stone-700', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-teal-100 dark:o-from-teal-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['background/fog-drift', 'image/parallax-image', 'text/wave-text', 'ui/glass-surface'],
    charger: () => import('./studio-yoga.jsx'),
  },
  {
    slug: 'salle-sport',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Fonte',
    metier: 'Salle de sport',
    resume:
      'Charges libres, coaching inclus, ouvert de cinq heures a minuit. Le ton suit le programme.',
    secteur: 'bien-etre',
    palette: ['--o-palette-lime-400', '--o-palette-zinc-950', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/electric-field', 'background/stripes', 'effect/marquee', 'effect/scroll-velocity', 'text/counter-roll', 'text/text-pressure'],
    charger: () => import('./salle-sport.jsx'),
  },
  {
    slug: 'course',
    teinte: 'cyan',
    ton: 'theme',
    titre: 'Cardan',
    metier: 'Ecurie de course',
    resume:
      'Un tableau de bord plutot qu une plaquette : le circuit se trace en un tour cadence, les saisons s empilent en reculant, et un banc de reglages dit ce que chaque cran coute ailleurs.',
    secteur: 'bien-etre',
    palette: ['--o-palette-cyan-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['effect/crosshair', 'effect/marquee', 'text/decode-text'],
    charger: () => import('./course.jsx'),
  },
  {
    slug: 'clinique',
    teinte: 'sky',
    ton: 'theme',
    titre: 'Clinique Vernet',
    metier: 'Cabinet medical',
    resume:
      'Prendre rendez-vous sans appeler, savoir qui l on va voir, et lire ce qui va se passer.',
    secteur: 'bien-etre',
    palette: ['--o-palette-sky-600', '--o-palette-slate-800', '--o-palette-sky-50'],
    apercu: 'o-bg-gradient-to-br o-from-sky-100 dark:o-from-sky-950 o-to-slate-100 dark:o-to-slate-900',
    pieces: ['section/faq', 'text/true-focus', 'ui/progress-ring', 'ui/stepper'],
    charger: () => import('./clinique.jsx'),
  },
  {
    slug: 'spa',
    teinte: 'rose',
    ton: 'theme',
    titre: 'Onde',
    metier: 'Spa et soins',
    resume:
      'Une heure hors du temps, vendue comme telle : peu de mots, beaucoup de vide, et le silence en couleur.',
    secteur: 'bien-etre',
    palette: ['--o-palette-rose-300', '--o-palette-stone-600', '--o-palette-stone-50'],
    apercu: 'o-bg-gradient-to-br o-from-rose-100 dark:o-from-rose-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['background/water-surface', 'image/hover-zoom', 'image/reveal-image', 'text/blur-reveal', 'ui/elastic-slider'],
    charger: () => import('./spa.jsx'),
  },

  // ----- Logiciel -----------------------------------------------------------
  {
    slug: 'saas-analytique',
    teinte: 'indigo',
    ton: 'theme',
    titre: 'Coteau',
    metier: 'Analytique produit',
    resume:
      'Le logiciel d entreprise dans sa forme la plus classique : preuve, comparatif, tarifs, et un essai.',
    secteur: 'logiciel',
    palette: ['--o-palette-indigo-500', '--o-palette-zinc-900', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-indigo-100 dark:o-from-indigo-950 o-to-zinc-100 dark:o-to-zinc-900',
    pieces: ['background/globe-mesh', 'section/comparison-table', 'section/container-scroll', 'section/pricing-tiers', 'text/spotlight-text', 'ui/progress-ring'],
    charger: () => import('./saas-analytique.jsx'),
  },
  {
    slug: 'plateforme-ia',
    teinte: 'violet',
    ton: 'theme',
    titre: 'Halo',
    metier: 'Plateforme de modeles',
    resume:
      'Un modele qu on essaie depuis la page, avant de lire ce qu il coute. La demonstration est l argument.',
    secteur: 'logiciel',
    palette: ['--o-palette-violet-500', '--o-palette-fuchsia-400', '--o-palette-zinc-950'],
    apercu: 'o-bg-gradient-to-br o-from-violet-200 dark:o-from-violet-950 o-to-fuchsia-100 dark:o-to-fuchsia-950',
    pieces: ['background/particle-sphere', 'text/particle-text', 'text/scroll-reveal', 'ui/glass-surface', 'ui/prompt-input', 'ui/segmented-control'],
    charger: () => import('./plateforme-ia.jsx'),
  },
  {
    slug: 'api-dev',
    teinte: 'emerald',
    ton: 'theme',
    titre: 'Portail',
    metier: 'Interface de programmation',
    resume:
      'Ecrite pour ceux qui lisent le code avant la promesse : une requete, une reponse, un journal de versions.',
    secteur: 'logiciel',
    palette: ['--o-palette-emerald-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-emerald-100 dark:o-from-emerald-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/circuit', 'effect/border-beam', 'effect/marquee', 'effect/scroll-velocity', 'section/changelog', 'text/typewriter', 'ui/copy-button'],
    charger: () => import('./api-dev.jsx'),
  },
  {
    slug: 'securite',
    teinte: 'cyan',
    ton: 'theme',
    titre: 'Meridien',
    metier: 'Cybersecurite',
    resume:
      'Ce qui se vend ici est la vigilance : un tableau de veille, des chiffres, et un contact direct.',
    secteur: 'logiciel',
    palette: ['--o-palette-cyan-400', '--o-palette-slate-900', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['background/hologram', 'effect/marquee', 'section/cinematic-footer', 'section/sticky-stack', 'text/count-up', 'text/glitch-text', 'text/highlight-sweep', 'ui/toast-stack'],
    charger: () => import('./securite.jsx'),
  },

  // ----- Entreprise ---------------------------------------------------------
  {
    slug: 'fintech',
    teinte: 'emerald',
    ton: 'theme',
    titre: 'Palier',
    metier: 'Banque en ligne',
    resume:
      'Un compte, une carte, des virements instantanes. La page compte a voix haute ce qu elle fait gagner.',
    secteur: 'entreprise',
    palette: ['--o-palette-emerald-500', '--o-palette-zinc-900', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-emerald-100 dark:o-from-emerald-950 o-to-zinc-100 dark:o-to-zinc-900',
    pieces: ['background/aurora', 'section/feature-tabs', 'section/pricing-tiers', 'text/counter-roll', 'ui/tilt-card'],
    charger: () => import('./fintech.jsx'),
  },
  {
    slug: 'crypto',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Orbe',
    metier: 'Place d echange',
    resume:
      'Marches ouverts en continu, frais annonces d avance. Le fond bouge autant que les cours.',
    secteur: 'entreprise',
    palette: ['--o-palette-amber-400', '--o-palette-violet-500', '--o-palette-zinc-950'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-violet-200 dark:o-to-violet-950',
    pieces: ['background/data-stream', 'effect/marquee', 'section/comparison-table', 'text/counter-roll', 'ui/reflective-card'],
    charger: () => import('./crypto.jsx'),
  },
  {
    slug: 'immobilier',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Cadre',
    metier: 'Architecture et biens',
    resume:
      'Des lieux montres en grand, decrits en peu de mots : ici l image porte et le texte se retire.',
    secteur: 'entreprise',
    palette: ['--o-palette-amber-500', '--o-palette-stone-800', '--o-palette-stone-200'],
    apercu: 'o-bg-gradient-to-br o-from-stone-100 dark:o-from-stone-900 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/city-blocks', 'effect/spotlight', 'image/hover-zoom', 'image/image-mask-text', 'ui/glass-surface'],
    charger: () => import('./immobilier.jsx'),
  },
  {
    slug: 'cabinet-conseil',
    teinte: 'blue',
    ton: 'theme',
    titre: 'Verne & Associes',
    metier: 'Cabinet de conseil',
    resume:
      'La sobriete comme argument : des references, des chiffres, des visages, et rien qui clignote.',
    secteur: 'entreprise',
    palette: ['--o-palette-blue-800', '--o-palette-slate-100', '--o-palette-amber-600'],
    apercu: 'o-bg-gradient-to-br o-from-blue-100 dark:o-from-blue-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['background/graph-paper', 'image/parallax-image', 'text/highlight-sweep', 'text/underline-draw'],
    charger: () => import('./cabinet-conseil.jsx'),
  },

  // ----- Culture ------------------------------------------------------------
  {
    slug: 'festival',
    teinte: 'fuchsia',
    ton: 'sombre',
    titre: 'Rivage',
    metier: 'Festival de musique',
    resume:
      'Trois jours, quarante noms, une affiche qui defile. Le seul endroit ou le bruit visuel est le sujet.',
    secteur: 'culture',
    palette: ['--o-palette-fuchsia-500', '--o-palette-lime-400', '--o-palette-zinc-950'],
    apercu: 'o-bg-gradient-to-br o-from-fuchsia-200 dark:o-from-fuchsia-950 o-to-lime-200 dark:o-to-lime-950',
    pieces: ['background/prismatic-burst', 'image/duotone', 'section/sticky-stack', 'text/falling-text'],
    charger: () => import('./festival.jsx'),
  },
  {
    slug: 'podcast',
    teinte: 'violet',
    ton: 'theme',
    titre: 'Onde Courte',
    metier: 'Emission audio',
    resume:
      'Un episode par semaine, ecoutable depuis la page, avec les invites et les archives dessous.',
    secteur: 'culture',
    palette: ['--o-palette-purple-500', '--o-palette-zinc-900', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-purple-100 dark:o-from-purple-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/audio-bars', 'section/logo-band', 'text/echo-text', 'text/text-loop', 'ui/animated-list'],
    charger: () => import('./podcast.jsx'),
  },
  {
    slug: 'conference',
    teinte: 'indigo',
    ton: 'theme',
    titre: 'Nord 26',
    metier: 'Conference technique',
    resume:
      'Deux jours, un programme minute, des intervenants nommes. Une page qui doit surtout etre lisible.',
    secteur: 'culture',
    palette: ['--o-palette-cyan-400', '--o-palette-indigo-600', '--o-palette-slate-950'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-indigo-200 dark:o-to-indigo-950',
    pieces: ['background/constellation', 'effect/marquee', 'text/shuffle', 'ui/segmented-control'],
    charger: () => import('./conference.jsx'),
  },
  {
    slug: 'abysse',
    teinte: 'cyan',
    ton: 'sombre',
    titre: 'Abysse',
    metier: 'Musee oceanographique',
    resume:
      'Une exposition qu on descend au lieu de la lire : sept ecrans de colonne d eau, un sondeur qui egrene les metres, et la faune de chaque zone.',
    secteur: 'culture',
    palette: ['--o-palette-cyan-400', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['effect/gradual-blur'],
    charger: () => import('./abysse.jsx'),
  },
  {
    slug: 'galerie-art',
    teinte: 'red',
    ton: 'theme',
    titre: 'Salle Basse',
    metier: 'Galerie d art',
    resume:
      'Presque rien : du blanc, une serie d oeuvres, des dates. La retenue est le parti pris.',
    secteur: 'culture',
    palette: ['--o-palette-red-600', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-900 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/noise', 'effect/sticky-cursor', 'image/reveal-image', 'text/variable-proximity'],
    charger: () => import('./galerie-art.jsx'),
  },

  // ----- Produit ------------------------------------------------------------
  {
    slug: 'mode',
    teinte: 'rose',
    ton: 'theme',
    titre: 'Lisiere',
    metier: 'Pret-a-porter',
    resume:
      'Une collection par saison, photographiee en pied. La grille tient lieu de discours.',
    secteur: 'produit',
    palette: ['--o-palette-rose-300', '--o-palette-zinc-900', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-rose-100 dark:o-from-rose-950 o-to-zinc-100 dark:o-to-zinc-900',
    pieces: ['image/hover-zoom', 'image/image-stack-swipe', 'text/circular-text', 'text/split-lines'],
    charger: () => import('./mode.jsx'),
  },
  {
    slug: 'velo',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Meridien',
    metier: 'Fabricant de velos',
    resume:
      'Un catalogue qu on ne feuillette pas : une sortie de 128 km parcourue lateralement, ou les roues tournent au defilement et chaque portion defend une piece du velo.',
    secteur: 'produit',
    palette: ['--o-palette-lime-500', '--o-palette-zinc-900', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['text/shuffle'],
    charger: () => import('./velo.jsx'),
  },
  {
    slug: 'sneakers',
    teinte: 'lime',
    ton: 'sombre',
    titre: 'Paire 44',
    metier: 'Sortie limitee',
    resume:
      'Une sortie, une heure, un stock. Tout est construit autour du compte a rebours.',
    secteur: 'produit',
    palette: ['--o-palette-lime-400', '--o-palette-zinc-950', '--o-palette-fuchsia-500'],
    apercu: 'o-bg-gradient-to-br o-from-lime-200 dark:o-from-lime-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/led-wall', 'effect/marquee', 'effect/sticky-cursor', 'image/duotone', 'text/depth-text', 'ui/depth-carousel'],
    charger: () => import('./sneakers.jsx'),
  },
  {
    slug: 'hotel',
    teinte: 'teal',
    ton: 'theme',
    titre: 'Les Tamaris',
    metier: 'Hotel en bord de mer',
    resume:
      'Douze chambres, une crique, et une reservation qui demande deux dates avant de parler prix.',
    secteur: 'produit',
    palette: ['--o-palette-teal-500', '--o-palette-amber-300', '--o-palette-stone-50'],
    apercu: 'o-bg-gradient-to-br o-from-teal-100 dark:o-from-teal-950 o-to-amber-100 dark:o-to-amber-950',
    pieces: ['background/water-surface', 'image/frame', 'text/split-reveal', 'ui/dome-gallery'],
    charger: () => import('./hotel.jsx'),
  },
  {
    slug: 'voiture-electrique',
    teinte: 'sky',
    ton: 'theme',
    titre: 'Axe',
    metier: 'Automobile electrique',
    resume:
      'Une seule voiture, racontee au defilement : la route arrive, les chiffres suivent, la commande ferme.',
    secteur: 'produit',
    palette: ['--o-palette-sky-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-sky-100 dark:o-from-sky-950 o-to-zinc-200 dark:o-to-zinc-950',
    pieces: ['background/terrain-wireframe', 'section/container-scroll', 'section/logo-band', 'text/scroll-float', 'ui/progress-ring'],
    charger: () => import('./voiture-electrique.jsx'),
  },

  // ----- Science et sante ---------------------------------------------------
  {
    slug: 'halle',
    teinte: 'orange',
    ton: 'sombre',
    titre: 'Halle',
    metier: 'Editeur de mobilier',
    resume:
      'Six pieces au catalogue, posees sur un anneau qui s aimante, et un nom qui se tient sur le reflet du sol.',
    secteur: 'produit',
    palette: ['--o-palette-orange-400', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-stone-200 dark:o-from-stone-900 o-to-orange-100 dark:o-to-orange-950',
    pieces: ['effect/spotlight', 'image/frame', 'text/spotlight-text', 'ui/circular-gallery'],
    charger: () => import('./halle.jsx'),
  },
  {
    slug: 'biotech',
    teinte: 'emerald',
    ton: 'theme',
    titre: 'Cytea',
    metier: 'Biotechnologie',
    resume:
      'Douze programmes d edition de base, leur stade reglementaire, et les publications qui vont avec — filtrables.',
    secteur: 'science',
    palette: ['--o-palette-emerald-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-emerald-100 dark:o-from-emerald-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/dna-helix', 'effect/reveal-mask', 'image/scroll-reveal-image', 'text/counter-roll', 'text/variable-proximity', 'ui/progress-ring'],
    charger: () => import('./biotech.jsx'),
  },

  {
    slug: 'voyage',
    teinte: 'teal',
    ton: 'theme',
    titre: 'Bivouac',
    metier: 'Voyagiste de montagne',
    resume:
      'Neuf marches guidees, filtrables par effort et par saison, avec le denivele reel et les places qui restent.',
    secteur: 'culture',
    palette: ['--o-palette-teal-500', '--o-palette-stone-950', '--o-palette-stone-100'],
    apercu: 'o-bg-gradient-to-br o-from-teal-100 dark:o-from-teal-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['background/swarm', 'effect/parallax', 'image/parallax-image', 'text/fold-text'],
    charger: () => import('./voyage.jsx'),
  },

  // ----- Industrie et energie -----------------------------------------------
  {
    slug: 'architecture',
    teinte: 'orange',
    ton: 'theme',
    titre: 'Sillon',
    metier: 'Agence d architecture',
    resume:
      'Huit ouvrages livres avec leur surface, leur cout au metre carre et leur maitrise d ouvrage — filtrables par programme.',
    secteur: 'industrie',
    palette: ['--o-palette-orange-500', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-orange-100 dark:o-from-orange-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['effect/magnetic', 'image/duotone', 'image/parallax-image', 'text/split-reveal'],
    charger: () => import('./architecture.jsx'),
  },

  {
    slug: 'joaillerie',
    teinte: 'amber',
    ton: 'sombre',
    titre: 'Auber',
    metier: 'Haute joaillerie',
    resume:
      'Un configurateur qui decompose le prix — la pierre, le metal, les heures de sertissage et la taxe.',
    secteur: 'produit',
    palette: ['--o-palette-amber-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['image/lens-zoom', 'text/shine-text', 'ui/elastic-slider'],
    charger: () => import('./joaillerie.jsx'),
  },

  {
    slug: 'jeu-video',
    teinte: 'violet',
    ton: 'sombre',
    titre: 'Cabestan',
    metier: 'Studio de jeu video',
    resume:
      'Un carnet de bord filtrable, avec les jalons tenus, ceux repousses date barree, et celui qu on a abandonne.',
    secteur: 'culture',
    palette: ['--o-palette-violet-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-violet-100 dark:o-from-violet-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/ballpit', 'image/parallax-image', 'section/sticky-stack', 'text/counter-roll', 'text/fuzzy-text'],
    charger: () => import('./jeu-video.jsx'),
  },

  {
    slug: 'agence-ia',
    teinte: 'lime',
    ton: 'sombre',
    titre: 'Tangente',
    metier: 'Agence d automatisation IA',
    resume:
      'Une nappe de particules sous un mot-marque en serif leger, puis une carte de rendement qui recalcule les heures rendues par an.',
    secteur: 'entreprise',
    palette: ['--o-palette-lime-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/terrain-wireframe', 'effect/border-beam', 'image/parallax-image', 'text/count-up', 'text/scroll-reveal', 'text/split-lines'],
    charger: () => import('./agence-ia.jsx'),
  },

  {
    slug: 'photographe',
    teinte: 'red',
    ton: 'theme',
    titre: 'Maud Ferrand',
    metier: 'Photographe',
    resume:
      'Un nom en grotesque noire de 260 px, l heure locale en direct, une bande de tirages pleine hauteur, puis une table lumineuse qu on filtre par rubrique.',
    secteur: 'culture',
    palette: ['--o-palette-red-500', '--o-palette-zinc-950', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-zinc-100 dark:o-from-zinc-900 o-to-red-100 dark:o-to-red-950',
    pieces: ['image/hover-zoom', 'image/parallax-image', 'text/shuffle', 'ui/segmented-control'],
    charger: () => import('./photographe.jsx'),
  },
  {
    slug: 'studio-creatif',
    teinte: 'red',
    ton: 'sombre',
    titre: 'Ardent',
    metier: 'Studio de creation',
    resume:
      'Une photographie sous une grille, une accroche condensee dont le premier mot est rouge, un repere de projets filtre par discipline, et une carte de recompense.',
    secteur: 'entreprise',
    palette: ['--o-palette-red-500', '--o-palette-zinc-950', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-red-100 dark:o-from-red-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['image/duotone', 'section/sticky-stack', 'text/scroll-reveal', 'text/stroke-text'],
    charger: () => import('./studio-creatif.jsx'),
  },
  {
    slug: 'designer',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Ines Roque',
    metier: 'Designer produit',
    resume:
      'Un paysage plein cadre, des autocollants inclines sur l accroche, un dock de projets en verre qui ouvre chaque fiche a la place de la carte du coin.',
    secteur: 'entreprise',
    palette: ['--o-palette-lime-400', '--o-palette-stone-950', '--o-palette-stone-50'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['section/orbital-timeline', 'section/testimonials-columns', 'text/rotating-words', 'ui/masonry'],
    charger: () => import('./designer.jsx'),
  },
  {
    slug: 'travail-profond',
    teinte: 'violet',
    ton: 'sombre',
    titre: 'Etale',
    metier: 'Application de travail profond',
    resume:
      'Un fluide plein cadre sur un noir abyssal, une barre de liste d attente en verre, et une session qu on regle minute par minute avant de la lancer.',
    secteur: 'logiciel',
    palette: ['--o-palette-violet-400', '--o-palette-zinc-950', '--o-palette-fuchsia-400'],
    apercu: 'o-bg-gradient-to-br o-from-violet-100 dark:o-from-violet-950 o-to-fuchsia-100 dark:o-to-fuchsia-950',
    pieces: ['background/silk', 'text/blur-words', 'text/scroll-reveal', 'ui/glass-surface'],
    charger: () => import('./travail-profond.jsx'),
  },
  {
    slug: 'robot-domestique',
    teinte: 'amber',
    ton: 'theme',
    titre: 'Nubo',
    metier: 'Robot domestique',
    resume:
      'Une cuisine chaude en plein cadre, une gelule de verre qui flotte, un mot en italique, puis une journee de vingt-quatre heures ou l on coche les pieces et lit le temps rendu.',
    secteur: 'produit',
    palette: ['--o-palette-amber-400', '--o-palette-stone-950', '--o-palette-stone-50'],
    apercu: 'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-950 o-to-stone-200 dark:o-to-stone-900',
    pieces: ['section/bento-grid', 'section/faq', 'text/morph-text'],
    charger: () => import('./robot-domestique.jsx'),
  },
  {
    slug: 'studio-3d',
    teinte: 'violet',
    ton: 'sombre',
    titre: 'Manifeste',
    metier: 'Studio de design augmente',
    resume:
      'Une sphere de particules collee derriere toute la page, deux mots espaces de part et d autre, et trois actes en verre qui la traversent au defilement.',
    secteur: 'entreprise',
    palette: ['--o-palette-violet-300', '--o-palette-zinc-950', '--o-palette-zinc-50'],
    apercu: 'o-bg-gradient-to-br o-from-violet-100 dark:o-from-violet-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/particle-sphere', 'effect/orbiting-dots', 'text/decode-text', 'ui/spotlight-card'],
    charger: () => import('./studio-3d.jsx'),
  },
  {
    slug: 'spatial',
    teinte: 'cyan',
    ton: 'theme',
    titre: 'Aphelie',
    metier: 'Operateur de satellites',
    resume:
      'Une console de constellation : chaque satellite avec son orbite, sa resolution, son etat et sa prochaine fenetre.',
    secteur: 'science',
    palette: ['--o-palette-cyan-400', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-cyan-100 dark:o-from-cyan-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['effect/crosshair', 'text/counter-roll', 'text/depth-text', 'ui/stepper'],
    charger: () => import('./spatial.jsx'),
  },

  {
    slug: 'energie',
    teinte: 'lime',
    ton: 'theme',
    titre: 'Courant',
    metier: 'Energie renouvelable',
    resume:
      'Onze parcs avec leur facteur de charge reel releve au compteur, et des totaux qui se recalculent au filtre.',
    secteur: 'industrie',
    palette: ['--o-palette-lime-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-lime-100 dark:o-from-lime-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/elastic-mesh', 'effect/scroll-progress', 'text/count-up', 'text/masked-heading', 'ui/segmented-control'],
    charger: () => import('./energie.jsx'),
  },

  {
    slug: 'label-musique',
    teinte: 'fuchsia',
    ton: 'theme',
    titre: 'Cale Seche',
    metier: 'Label et salle de concert',
    resume:
      'Huit dates avec leurs places restantes, et la grille de repartition des recettes — poste par poste.',
    secteur: 'culture',
    palette: ['--o-palette-fuchsia-400', '--o-palette-zinc-950', '--o-palette-zinc-100'],
    apercu: 'o-bg-gradient-to-br o-from-fuchsia-100 dark:o-from-fuchsia-950 o-to-zinc-200 dark:o-to-zinc-900',
    pieces: ['background/torus-knot', 'effect/marquee', 'effect/scroll-velocity', 'image/duotone', 'text/warp-text', 'ui/flowing-menu'],
    charger: () => import('./label-musique.jsx'),
  },

  {
    slug: 'parfum',
    teinte: 'rose',
    ton: 'theme',
    titre: 'Maison Trace',
    metier: 'Parfumeur',
    resume:
      'Une notice qui se deplie de cote : un volet par parfum, avec la part reelle de chaque matiere dans le concentre.',
    secteur: 'produit',
    palette: ['--o-palette-rose-400', '--o-palette-neutral-950', '--o-palette-neutral-100'],
    apercu: 'o-bg-gradient-to-br o-from-rose-100 dark:o-from-rose-950 o-to-neutral-200 dark:o-to-neutral-900',
    pieces: ['background/liquid-chrome', 'section/cinematic-footer', 'text/count-up', 'text/gradient-flow', 'ui/segmented-control'],
    charger: () => import('./parfum.jsx'),
  },

  {
    slug: 'robotique',
    teinte: 'sky',
    ton: 'theme',
    titre: 'Cobalt',
    metier: 'Robotique industrielle',
    resume:
      'Une fiche technique : gamme en tableau de cotes, abaque de selection qui surligne la ligne retenue, indice de revision.',
    secteur: 'industrie',
    palette: ['--o-palette-sky-500', '--o-palette-slate-950', '--o-palette-slate-100'],
    apercu: 'o-bg-gradient-to-br o-from-sky-100 dark:o-from-sky-950 o-to-slate-200 dark:o-to-slate-900',
    pieces: ['background/halftone', 'effect/marquee', 'section/scroll-steps', 'text/ascii-text', 'text/count-up'],
    charger: () => import('./robotique.jsx'),
  },
]

/** Une vitrine, par son segment. */
export function vitrineBySlug(slug: string): Vitrine | undefined {
  return VITRINES.find((v) => v.slug === slug)
}

/** Les secteurs, dans l ordre d apparition, avec leur libelle. */
export const SECTEURS: readonly (readonly [VitrineSecteur, string])[] = [
  ['commerce', 'Commerce de proximite'],
  ['bien-etre', 'Bien-etre et sport'],
  ['logiciel', 'Logiciel'],
  ['entreprise', 'Entreprise'],
  ['culture', 'Culture'],
  ['produit', 'Produit'],
  ['science', 'Science et sante'],
  ['industrie', 'Industrie et energie'],
]
