import type { CollectionsContent } from "@/views/home/collections";
import type { DetailsContent } from "@/views/home/details";
import type { FaqContent } from "@/views/home/faq";
import type { FooterContent } from "@/views/home/footer";
import type { TechnologyContent } from "@/views/home/technology";
import type { HeroContent } from "@/views/home/hero";

/**
 * ODORO — maison de parfum. Contenu provisoire en attendant un CMS.
 *
 * Le site est le template Artefakt de GetLayers, ré-habillé en papier crème
 * (ADR-0049) puis converti d'une marque de vestes en maison de parfum
 * (ADR-0050). La COMPOSITION de chaque bloc reste celle de l'artboard 1440×800 :
 * la copie française est écrite AUX LONGUEURS des boîtes dessinées à la main,
 * à un ou deux caractères près, pour que les césures prévues tiennent.
 *
 * Contraintes porteuses, à ne pas casser :
 * - le libellé de nav reste exactement `COLLECTIONS` (son `li` réserve une
 *   boîte de caret de 119 unités mesurée sur ce mot — le mot est identique en
 *   français, ce qui tombe bien) ;
 * - `homeTechnology.heading[0]` tient en ≤ 10 caractères ;
 * - la question 02 de la FAQ garde `questionWidth: 195` et reste sur deux lignes ;
 * - `cardTop` / `cardSideY` / `anchorFx` / `anchorFy` ne bougent pas ;
 * - le corps des couches 01/03/04 fait ~62-72 caractères (cartes de 3 lignes),
 *   02/05 ≤ 55 (cartes de 2 lignes) — c'est ce que `cardSideY` a mesuré.
 * Les `#` n'ont pas encore de routes. La graphie « COEUR » sans ligature est
 * volontaire : la 3270 ne porte pas le Œ.
 */
export const homeHero: HeroContent = {
  logo: {
    src: "/assets/ui/logo-mark.png",
    alt: "ODORO",
    width: 1059,
    height: 200,
  },
  nav: [
    { label: "BOUTIQUE", href: "#" },
    {
      label: "COLLECTIONS",
      href: "#",
      submenu: [
        { label: "OMBRE D'OUD", href: "#" },
        { label: "VETIVER DES CHAMPS", href: "#" },
        { label: "AMBRE THERMAL", href: "#" },
        { label: "IRIS DE PIERRE", href: "#" },
      ],
    },
    { label: "COMPOSITION", href: "#" },
    { label: "MAISON", href: "#" },
  ],
  cart: { label: "PANIER [ 0 ]", href: "#" },
  markerStart: {
    lines: ["DISTILLÉ", "POUR LA PEAU.", "FAIT POUR DURER."],
  },
  markerEnd: {
    lines: ["COMPOSÉ", "POUR L'INVISIBLE.", "PORTÉ À DESSEIN."],
  },
  title: [
    "EXTRAIT À 22 %. RÉACTIF À LA PEAU.",
    "SILLAGE DE DOUZE HEURES. SÉRIE LIMITÉE.",
  ],
  cta: { label: "DÉCOUVRIR", href: "#" },
  badgeStart: {
    icon: {
      src: "/assets/hero/hero-icon-globe.svg",
      alt: "",
      width: 37,
      height: 23,
    },
    caption: "DEP.2021",
    lines: ["NÉ DE LA CHIMIE.", "MENÉ PAR L'OBSESSION.", "COMPOSÉ À LA MAIN."],
  },
  badgeEnd: {
    icon: {
      src: "/assets/hero/hero-icon-target.svg",
      alt: "",
      width: 23,
      height: 23,
    },
    lines: ["LIVRAISON MONDIALE", "RAPIDE ET SÉCURISÉE"],
  },
  subject: {
    src: "/assets/hero/hero-flacon.glb",
    label: "Flacon d'apothicaire en verre ambré, capuchon olive, étiquette crème ODORO",
  },
  backdrop: {
    src: "/assets/hero/hero-wordmark.png",
    alt: "",
    width: 5028,
    height: 2684,
  },
};

/**
 * Détails — cinq lignes de spécification, hauteurs de l'artboard (102 puis 122).
 * Les icônes sont celles du template : abstraites à 32 px, elles passent.
 * Le chapeau est stocké en casse de phrase et mis en capitales par le CSS.
 */
export const homeDetails: DetailsContent = {
  heading: "MATIÈRE PREMIÈRE.",
  lede: "Un extrait pensé pour la chimie de la peau, l'air qui change et tout ce qui arrive après la première heure.",
  cta: { label: "VOIR L'EXTRAIT", href: "#" },
  features: [
    {
      index: "01",
      icon: { src: "/assets/details/details-icon-shell.svg", alt: "", width: 32, height: 32 },
      title: "TÊTE STABILISÉE",
      body: "UN DÉPART D'AGRUMES FROIDS QUI NE S'ÉVAPORE PAS.",
    },
    {
      index: "02",
      icon: { src: "/assets/details/details-icon-thermal.svg", alt: "", width: 32, height: 32 },
      title: "COEUR D'AMBRE CHAUD",
      body: "AMBRE ET BENJOIN PORTENT LA CHALEUR SANS ALOURDIR LA COMPOSITION.",
    },
    {
      index: "03",
      icon: { src: "/assets/details/details-icon-construction.svg", alt: "", width: 32, height: 32 },
      title: "FOND RENFORCÉ",
      body: "MOUSSE DE CHÊNE ET VÉTIVER DONNENT AU FOND SA COLONNE VERTÉBRALE.",
    },
    {
      index: "04",
      icon: { src: "/assets/details/details-icon-storage.svg", alt: "", width: 32, height: 32 },
      title: "DIFFUSION MAÎTRISÉE",
      body: "UN SILLAGE MESURÉ QUI RESTE PRÈS DU CORPS PLUTÔT QUE D'EMPLIR UNE PIÈCE.",
    },
    {
      index: "05",
      icon: { src: "/assets/details/details-icon-fit.svg", alt: "", width: 32, height: 32 },
      title: "CONCENTRATION EXTRAIT",
      body: "VINGT-DEUX POUR CENT DE CONCENTRÉ POUR LA PROFONDEUR ET LA TENUE.",
    },
  ],
};

/**
 * Collections — quatre extraits, quatre flacons.
 *
 * **Les prix sont inventés** : ils ne servent qu'à porter l'état de survol de la
 * carte. Les quatre photographies sont quatre déclinaisons du même flacon
 * (liquide ambre, vétiver, sang-de-boeuf, iris), générées d'après le rendu du
 * hero pour rester cohérentes — une vue par produit, les trois autres angles
 * restent à faire, d'où le repli de chaque nuance sur la seule vue.
 */
export const homeCollections: CollectionsContent = {
  heading: "COLLECTIONS.",
  lede: "Des extraits techniques pour l'air qui change, la peau et le quotidien.",
  products: [
    {
      index: "01",
      name: "OMBRE D'OUD",
      price: "280 €",
      views: [{ src: "/assets/collections/flacon-oud.png", alt: "", width: 1080, height: 1080 }],
      swatches: 4,
      defaultView: 1,
      tags: ["EXTRAIT 22 %", "SÉRIE LIMITÉE"],
      href: "#",
    },
    {
      index: "02",
      name: "VETIVER DES CHAMPS",
      price: "240 €",
      views: [{ src: "/assets/collections/flacon-vetiver.png", alt: "", width: 1080, height: 1080 }],
      swatches: 4,
      defaultView: 1,
      tags: ["PARFUM 18 %", "MIXTE"],
      href: "#",
    },
    {
      index: "03",
      name: "AMBRE THERMAL",
      price: "310 €",
      views: [{ src: "/assets/collections/flacon-ambre.png", alt: "", width: 1080, height: 1080 }],
      swatches: 4,
      defaultView: 1,
      tags: ["FOND D'AMBRE", "DOUZE HEURES"],
      href: "#",
    },
    {
      index: "04",
      name: "IRIS DE PIERRE",
      price: "190 €",
      views: [{ src: "/assets/collections/flacon-iris.png", alt: "", width: 1080, height: 1080 }],
      swatches: 4,
      defaultView: 1,
      tags: ["COLOGNE 12 %", "PRÈS DE LA PEAU"],
      href: "#",
    },
  ],
  cta: { label: "TOUS LES EXTRAITS", href: "#" },
};

/**
 * Composition — la pyramide olfactive lue comme un empilement de matières.
 *
 * L'artboard fait descendre une carte le long de cinq couches séparées, reliées
 * par une ligne de rappel : un parfum en a exactement cinq. Le reel n'est plus
 * une séquence de 61 images (c'était l'explosé des tissus de la veste) mais UNE
 * image fixe de la pyramide, `count: 1` dans les deux paliers, et la carte
 * marche dessus au scroll. Les ancres `anchorFx` / `anchorFy` sont conservées :
 * l'image a été composée en cinq couches, du haut vers le bas, pour les recevoir.
 */
export const homeTechnology: TechnologyContent = {
  heading: ["CHIMIE", "COMPOSÉE POUR DURER"],
  lede: [
    "Chaque note a une raison d'être.",
    "Du sommet volatil jusqu'à la résine du fond, l'extrait est construit pour tenir sans perdre sa forme.",
  ],
  stack: {
    src: "/assets/technology/technology-stack.webp",
    alt: "La pyramide olfactive en cinq couches séparées : agrumes, iris, ambre, encens, musc",
    width: 1024,
    height: 954,
  },
  layers: [
    {
      index: "01",
      title: "NOTES DE TÊTE",
      body: "Les premières minutes : agrumes froids, poivre rose, une arête de métal.",
      icon: { src: "/assets/technology/technology-icon-01.svg", alt: "", width: 32, height: 32 },
      cardTop: 136, cardSideY: 197, anchorFx: 0.6, anchorFy: 0.145,
    },
    {
      index: "02",
      title: "STRUCTURE DU COEUR",
      body: "Iris et feuille de violette tiennent l'ensemble.",
      icon: { src: "/assets/technology/technology-icon-02.svg", alt: "", width: 32, height: 32 },
      cardTop: 236, cardSideY: 287, anchorFx: 0.707, anchorFy: 0.354,
    },
    {
      index: "03",
      title: "AMBRE THERMAL",
      body: "Ambre et benjoin portent la chaleur sans alourdir le fond du parfum.",
      icon: { src: "/assets/technology/technology-icon-03.svg", alt: "", width: 32, height: 32 },
      cardTop: 370, cardSideY: 431, anchorFx: 0.773, anchorFy: 0.477,
    },
    {
      index: "04",
      title: "MEMBRANE FUMÉE",
      body: "Goudron de bouleau et encens laissent respirer le sucré sans gourmandise.",
      icon: { src: "/assets/technology/technology-icon-04.svg", alt: "", width: 32, height: 32 },
      cardTop: 492, cardSideY: 553, anchorFx: 0.855, anchorFy: 0.576,
    },
    {
      index: "05",
      title: "FOND DE PEAU",
      body: "Musc, vétiver et santal se posent pour la longue tenue.",
      icon: { src: "/assets/technology/technology-icon-05.svg", alt: "", width: 32, height: 32 },
      cardTop: 658, cardSideY: 709, anchorFx: 0.822, anchorFy: 0.74,
    },
  ],
};

/**
 * FAQ — cinq lignes de 114 unités ; question de 175 partout sauf la 02 (195),
 * ce qui la garde sur deux lignes. Le flacon du hero est repris ici, épinglé.
 */
export const homeFaq: FaqContent = {
  heading: "BON À SAVOIR.",
  subject: {
    src: "/assets/hero/hero-flacon.glb",
    label: "Flacon d'apothicaire en verre ambré, capuchon olive, étiquette crème ODORO",
  },
  entries: [
    {
      index: "01",
      question: "COMBIEN DE TEMPS TIENT L'EXTRAIT ?",
      answer:
        "Entre huit et douze heures sur la plupart des peaux. La concentration en extrait porte le fond jusqu'à la fin de la journée.",
    },
    {
      index: "02",
      question: "QUELLES MATIÈRES DANS L'EXTRAIT ?",
      questionWidth: 195,
      answer:
        "Oud naturel, absolu d'iris, vétiver et un fond d'ambre stabilisé, assemblés pour la profondeur et la tenue.",
    },
    {
      index: "03",
      question: "COMMENT CONSERVER LE FLACON ?",
      answer:
        "Debout, à l'abri de la lumière et de la chaleur. Les deux abîment la tête bien avant le fond.",
    },
    {
      index: "04",
      question: "LIVREZ-VOUS À L'INTERNATIONAL ?",
      answer: "Oui. Livraison mondiale, sécurisée et suivie sur chaque commande.",
    },
    {
      index: "05",
      question: "PUIS-JE RETOURNER MA COMMANDE ?",
      answer:
        "Oui. Un flacon non ouvert peut être retourné ou échangé dans le délai indiqué.",
    },
  ],
};

/**
 * Pied de page — chaque `href` est `#`, le formulaire n'a pas de point d'entrée.
 * Les trois premières colonnes font 120 unités, la dernière est `w-auto`.
 */
export const homeFooter: FooterContent = {
  logo: { src: "/assets/ui/logo-mark.png", alt: "ODORO", width: 1059, height: 200 },
  columns: [
    {
      heading: { label: "BOUTIQUE", href: "#" },
      links: [
        { label: "EXTRAITS", href: "#" },
        { label: "PARFUMS", href: "#" },
        { label: "ÉDITIONS", href: "#" },
      ],
    },
    {
      heading: { label: "COMPOSITION", href: "#" },
      links: [
        { label: "MATIÈRES", href: "#" },
        { label: "ORIGINES", href: "#" },
      ],
    },
    { heading: { label: "MAISON", href: "#" } },
    {
      heading: { label: "AIDE", href: "#" },
      links: [
        { label: "CONFIDENTIALITÉ", href: "#" },
        { label: "Conditions générales", href: "#" },
        { label: "COMMENT LE PORTER", href: "#" },
        { label: "LIVRAISON ET RETOURS", href: "#" },
        { label: "FAQ", href: "#" },
      ],
    },
  ],
  newsletter: {
    heading: "AVANT LE PROCHAIN LOT.",
    placeholder: "Votre e-mail",
    consent: "J'ACCEPTE DE RECEVOIR VOS NOUVELLES.",
  },
  copyright: "© 2026 ODORO. TOUS DROITS RÉSERVÉS.",
  social: [
    { label: "INSTAGRAM", href: "#" },
    { label: "YOUTUBE", href: "#" },
    { label: "TIK-TOK", href: "#" },
  ],
};
