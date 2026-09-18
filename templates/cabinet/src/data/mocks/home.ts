/**
 * Home page content — Cabinet Odoro.
 *
 * Placeholder copy for a Paris law firm (every name, figure and address is
 * invented for this build). The view passes it down through props — no
 * component imports this file.
 */

import { FRAME_POSTER, FRAME_TIERS } from "@/lib/scene/frames";
import { SCENE_ANCHOR } from "@/utils/timeline/scene";

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LinkItem {
  label: string;
  href: string;
}

export type HeroSlot =
  | "top-left"
  | "top-right"
  | "center-left"
  | "center-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export interface HeroWord {
  text: string;
  slot: HeroSlot;
}

export interface HeroBlockContent {
  words: readonly [HeroWord, HeroWord, HeroWord];
  description: string;
  descriptionSide: "left" | "right";
}

export interface EchoContent {
  eyebrow: readonly string[];
  title: string;
  /** Optional superscript after the title (the source's ®). Empty renders nothing. */
  mark: string;
  description: string;
  /** The practice areas, listed as hairline rows in the panel's footer. */
  practices: readonly string[];
  footer: readonly string[];
  image: ImageAsset;
}

export interface StatContent {
  value: number;
  label: string;
  slot: "top-right" | "bottom-left" | "bottom-right";
}

export interface ShowreelContent {
  src: string;
  poster: string;
  label: string;
  badge: string;
}

export interface DetailsContent {
  title: readonly string[];
  stats: readonly StatContent[];
  zoomTitle: readonly string[];
  address: { label: string; lines: readonly string[] };
  showroom: LinkItem;
  image: ImageAsset;
  showreel: ShowreelContent;
}

export interface TestimonialContent {
  quote: string;
  author: string;
  role: string;
  portrait: ImageAsset;
}

export interface ReviewsContent {
  title: string;
  previousLabel: string;
  nextLabel: string;
  items: readonly TestimonialContent[];
}

export interface FooterContent {
  cta: readonly string[];
  contact: LinkItem;
  navLabel: string;
  links: readonly LinkItem[];
  /** Address, phone and email — plain lines under the links. */
  details: readonly string[];
  wordmark: string;
  background: ImageAsset;
}

export interface DockContent {
  title: string;
  homeLabel: string;
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  links: readonly LinkItem[];
}

export interface HomeContent {
  preloader: { label: string };
  /** Accessible name of the pinned scroll scene. */
  sceneLabel: string;
  poster: ImageAsset;
  quoteCta: LinkItem;
  hero: readonly [HeroBlockContent, HeroBlockContent, HeroBlockContent];
  echo: EchoContent;
  details: DetailsContent;
  reviews: ReviewsContent;
  footer: FooterContent;
  dock: DockContent;
}

const NAV_LINKS: readonly LinkItem[] = [
  { label: "Accueil", href: `#${SCENE_ANCHOR.top}` },
  { label: "Expertises", href: `#${SCENE_ANCHOR.echo}` },
  { label: "Le cabinet", href: `#${SCENE_ANCHOR.details}` },
  { label: "Clients", href: "#reviews" },
];

export const homeContent: HomeContent = {
  preloader: { label: "Cabinet Odoro" },
  sceneLabel: "Présentation du cabinet Odoro",
  poster: {
    src: FRAME_POSTER,
    alt: "",
    width: FRAME_TIERS.desktop.width,
    height: FRAME_TIERS.desktop.height,
  },
  quoteCta: { label: "Prendre rendez-vous", href: "#contact" },
  hero: [
    {
      words: [
        { text: "Conseil", slot: "top-left" },
        { text: "avec", slot: "center-right" },
        { text: "Conviction", slot: "bottom-left" },
      ],
      description:
        "Depuis 1987, le cabinet Odoro conseille dirigeants, familles et institutions dans leurs décisions les plus délicates. Une pratique du droit fondée sur l'écoute, la rigueur et la discrétion.",
      descriptionSide: "right",
    },
    {
      words: [
        { text: "Précision", slot: "top-right" },
        { text: "dans", slot: "center-left" },
        { text: "l'Argument", slot: "bottom-right" },
      ],
      description:
        "Chaque dossier est instruit comme une pièce unique : analyse exhaustive, stratégie écrite avant la première audience, et une plaidoirie qui ne laisse rien au hasard.",
      descriptionSide: "left",
    },
    {
      words: [
        { text: "Défendre", slot: "top-left" },
        { text: "sans", slot: "center" },
        { text: "Compromis", slot: "bottom-right" },
      ],
      description:
        "Devant les juridictions comme à la table des négociations, nous portons vos intérêts avec la fermeté qu'ils méritent et la courtoisie qui les sert.",
      descriptionSide: "left",
    },
  ],
  echo: {
    eyebrow: ["Cinq pôles", "d'expertise"],
    title: "Expertises",
    mark: "",
    description:
      "Une seule manière de travailler : un associé responsable de votre dossier du premier rendez-vous à la décision finale, une équipe resserrée, et une stratégie écrite avant la première audience.",
    practices: [
      "Droit des affaires & fusions-acquisitions",
      "Contentieux commercial & arbitrage",
      "Droit pénal des affaires",
      "Droit de la famille & patrimoine",
      "Droit immobilier & construction",
    ],
    footer: ["Paris · Lyon · Genève"],
    image: {
      src: "/assets/scene/interior-echo.webp",
      alt: "Salle de réunion du cabinet la nuit : longue table en acajou, fauteuils en cuir oxblood et rayonnages de codes reliés éclairés de l'intérieur",
      width: 1536,
      height: 1024,
    },
  },
  details: {
    title: ["Un cabinet à taille humaine,", "une exigence sans limite."],
    stats: [
      { value: 38, label: "Années d'exercice", slot: "top-right" },
      { value: 1200, label: "Dossiers plaidés ou négociés", slot: "bottom-left" },
      { value: 14, label: "Avocats, associés et collaborateurs", slot: "bottom-right" },
    ],
    zoomTitle: ["Là où la stratégie", "rencontre la plaidoirie."],
    address: {
      label: "Adresse",
      lines: ["12, place Vendôme", "75001 Paris"],
    },
    showroom: {
      label: "Itinéraire",
      href: "https://www.google.com/maps/search/?api=1&query=12+place+Vend%C3%B4me+75001+Paris",
    },
    image: {
      src: "/assets/scene/interior-details.webp",
      alt: "Gros plan sur le bureau d'un associé : lampe de banquier en laiton, balance de justice dorée et dossiers en cuir devant un fauteuil capitonné",
      width: 1920,
      height: 1080,
    },
    showreel: {
      src: "/assets/scene/showreel.mp4",
      poster: "/assets/scene/showreel-poster.webp",
      label: "Film du cabinet Odoro",
      badge: "Lecture",
    },
  },
  reviews: {
    title: "Paroles de clients",
    previousLabel: "Témoignage précédent",
    nextLabel: "Témoignage suivant",
    items: [
      {
        quote:
          "Une équipe d'une précision rare. Le cabinet Odoro a mené la cession de notre groupe avec une maîtrise et un calme que nous n'avions jamais rencontrés.",
        author: "Hélène Marchetti",
        role: "Présidente, Groupe Marchetti",
        portrait: {
          src: "/assets/testimonials/marchetti.webp",
          alt: "Hélène Marchetti, assise dans un fauteuil en cuir d'une bibliothèque lambrissée, en noir et blanc",
          width: 1024,
          height: 1536,
        },
      },
      {
        quote:
          "Dans un moment très difficile pour notre famille, nous avons trouvé chez Odoro bien plus que des avocats : une écoute et une loyauté sans faille.",
        author: "Julien Deschamps",
        role: "Chef d'entreprise",
        portrait: {
          src: "/assets/testimonials/deschamps.webp",
          alt: "Julien Deschamps, debout près d'une haute bibliothèque de codes anciens, en noir et blanc",
          width: 1024,
          height: 1536,
        },
      },
    ],
  },
  footer: {
    cta: ["Votre affaire mérite", "une défense à sa mesure."],
    contact: { label: "Nous contacter", href: "mailto:contact@cabinet-odoro.fr" },
    navLabel: "Pied de page",
    links: NAV_LINKS,
    details: ["12, place Vendôme, 75001 Paris", "+33 1 42 60 00 00", "contact@cabinet-odoro.fr"],
    wordmark: "Odoro",
    background: {
      src: "/assets/footer/footer-bg.webp",
      alt: "",
      width: 1920,
      height: 1080,
    },
  },
  dock: {
    title: "Odoro",
    homeLabel: "Cabinet Odoro — retour en haut",
    navLabel: "Navigation principale",
    openLabel: "Ouvrir le menu",
    closeLabel: "Fermer le menu",
    links: [...NAV_LINKS, { label: "Contact", href: "#contact" }],
  },
};
