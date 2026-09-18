/**
 * Content for the home page — ODORO, Maison de joaillerie.
 *
 * Every string the page prints lives here and reaches the sections through
 * props; nothing is hardcoded in a component. Swap this module for a CMS
 * without touching the views.
 *
 * Display lines are `TitleSegment[]` so the leading capital of a word can take
 * the italic cut of the display face — the brand's own typographic gesture.
 */

import type { HeroContent } from "@/views/home/hero/hero.types";
import type { ManifestoContent } from "@/views/home/manifesto/manifesto.types";
import type { CollectionContent } from "@/views/home/collection/collection.types";
import type { FilmContent } from "@/views/home/film/film.types";
import type { AtelierContent } from "@/views/home/atelier/atelier.types";
import type { EditionsContent } from "@/views/home/editions/editions.types";
import type { ReserveContent } from "@/views/home/reserve/reserve.types";
import type { FooterContent } from "@/views/home/footer/footer.types";

/* ---------------------------------------------------------------------------
   HERO
   --------------------------------------------------------------------------- */

export const heroContent: HeroContent = {
  ariaLabel: "Portez peu. Portez vrai. — ODORO",

  wordmark: [{ text: "O", italic: true }, { text: "doro" }],

  nav: [
    { label: "COLLECTION.", href: "#collection" },
    { label: "MAISON.", href: "#maison" },
    { label: "ATELIER.", href: "#atelier" },
    { label: "RÉSERVER.", href: "#reserver" },
  ],

  // Lowercase here, uppercased in CSS.
  cta: { label: "découvrir la collection", href: "#collection" },

  // The two blocks mirror about the window: "Portez / peu." on its left,
  // "Portez / vrai." on its right. Wear little; wear what is real.
  titleStart: [{ text: "P", italic: true }, { text: "ortez peu." }],
  titleEnd: [
    [{ text: "P", italic: true }, { text: "ortez" }],
    [{ text: "vrai." }],
  ],

  cardCaptionTop: ["ÉDITION N°01", "OR & ARGENT"],
  cardCaptionBottom: ["18K.", "PIÈCES NUMÉROTÉES", "925."],

  collectionsLabel: "LA COLLECTION",
  collections: [
    { label: "Bracelets", href: "#collection" },
    { label: "Bagues", href: "#collection" },
    { label: "Colliers", href: "#collection" },
    { label: "Manchettes", href: "#collection" },
  ],

  viewModes: [
    { label: "OR", active: true },
    { label: "ARGENT", active: false },
  ],

  media: {
    video: {
      src: "/assets/hero/hero-video.mp4",
      alt: "Une femme, le poignet levé contre son visage, porte les bracelets or et argent ODORO dans une lumière champagne",
      width: 1920,
      height: 1080,
    },
    /* The clip's own last frame at the clip's own 1920×1080 — matched to it
       frame-for-frame so the dissolve changes only how much detail is there. */
    still: {
      src: "/assets/hero/hero-still.jpg",
    },
    thumbnail: {
      src: "/assets/hero/hero-thumb.jpg",
      alt: "Une manchette en or froissé et deux bagues sur une main tendue",
      width: 1400,
      height: 1875,
    },
  },
};

/* ---------------------------------------------------------------------------
   MANIFESTO
   --------------------------------------------------------------------------- */

export const manifestoContent: ManifestoContent = {
  eyebrow: "MANIFESTE",
  passage:
    "Nous ne faisons pas des bijoux pour être vus. Nous les faisons pour être portés — tous les jours, longtemps, jusqu'à ce qu'ils prennent la forme de celle qui les porte. De l'or, jamais plaqué. De l'argent, jamais teinté. Rien d'autre.",
  signature: "— Maison Odoro, Paris",
};

/* ---------------------------------------------------------------------------
   COLLECTION
   --------------------------------------------------------------------------- */

export const collectionContent: CollectionContent = {
  eyebrow: "/ LA COLLECTION",
  headline: "Peu de pièces. Toutes essentielles.",
  body: "Chaque pièce est fondue, polie et gravée à la main dans notre atelier parisien — or 18 carats, argent 925, pierres choisies une à une. Cent exemplaires par édition, puis plus jamais.",
  cta: "Réserver",
  items: [
    {
      id: "serpent",
      index: "01",
      name: "Serpent",
      description: "Bracelet en or 18 carats, tête pavée de diamants, yeux d'émeraude.",
      price: "1 890 €",
      href: "#reserver",
      image: {
        src: "/assets/collection/bracelet-serpent.jpg",
        alt: "Le bracelet Serpent en or, dressé sur une surface champagne",
        width: 1200,
        height: 1490,
      },
    },
    {
      id: "dome-pave",
      index: "02",
      name: "Dôme & Pavé",
      description: "Duo de bagues — argent 925 poli miroir, or blanc pavé de diamants.",
      price: "1 240 €",
      href: "#reserver",
      image: {
        src: "/assets/collection/bague-dome-pave.jpg",
        alt: "Une bague dôme en argent et une bague pavée de diamants, l'une contre l'autre",
        width: 1200,
        height: 1490,
      },
    },
    {
      id: "cube",
      index: "03",
      name: "Cube",
      description: "Collier chaîne fine en or 18 carats, pendentif cube martelé.",
      price: "790 €",
      href: "#reserver",
      image: {
        src: "/assets/collection/collier-cube.jpg",
        alt: "Le collier Cube, chaîne fine en or posée en courbe, pendentif martelé",
        width: 1200,
        height: 1490,
      },
    },
  ],
};

/* ---------------------------------------------------------------------------
   FILM — three chapters over the levitation clip
   --------------------------------------------------------------------------- */

export const filmContent: FilmContent = {
  ariaLabel: "L'or, l'argent, le geste",
  video: {
    src: "/assets/film/film-video.mp4",
    poster: "/assets/film/film-poster.jpg",
    alt: "Les cinq pièces ODORO flottent lentement dans une lumière champagne",
    width: 1920,
    height: 1080,
  },
  chapters: [
    {
      id: "or",
      numeral: "( I )",
      label: "L'OR",
      heading: ["La chaleur", "qui reste."],
      body: "Or 18 carats, fondu à l'atelier — jamais plaqué. Il se patine avec vous ; il ne s'éteint pas.",
      align: "left",
    },
    {
      id: "argent",
      numeral: "( II )",
      label: "L'ARGENT",
      heading: ["La lumière", "qu'on garde."],
      body: "Argent 925 poli miroir. Il prend la lumière de la pièce où vous êtes, et la rend, en plus doux.",
      align: "right",
    },
    {
      id: "geste",
      numeral: "( III )",
      label: "LE GESTE",
      heading: ["Portez-les ensemble."],
      body: "L'or et l'argent ne se disputent pas. Ils se répondent.",
      align: "center",
      cta: { label: "Voir la collection", href: "#collection" },
    },
  ],
};

/* ---------------------------------------------------------------------------
   ATELIER — the one inverted band
   --------------------------------------------------------------------------- */

export const atelierContent: AtelierContent = {
  eyebrow: "ATELIER",
  heading: "Fait à la main. Numéroté à la main.",
  body: "Chaque pièce quitte l'atelier avec son numéro gravé et son certificat. Cent exemplaires par édition, jamais plus — quand une édition est épuisée, elle ne revient pas.",
  cta: { label: "Réserver la prochaine", href: "#reserver" },
  image: {
    src: "/assets/argent/argent-dos.jpg",
    alt: "Une fine chaîne en or descend le long d'un dos nu, sur un fond gris acier",
    width: 1400,
    height: 1875,
  },
};

/* ---------------------------------------------------------------------------
   EDITIONS
   --------------------------------------------------------------------------- */

export const editionsContent: EditionsContent = {
  eyebrow: "ÉDITIONS",
  heading: "Deux façons de la porter.",
  cards: [
    {
      id: "profil",
      meta: "N°01 — PROFIL",
      title: "Le poignet nu, sauf un.",
      image: {
        src: "/assets/editions/edition-01-profil.jpg",
        alt: "Une femme de profil, en silhouette contre un fond champagne, la main levée portant un bracelet en or",
        width: 1400,
        height: 1875,
      },
    },
    {
      id: "manchette",
      meta: "N°02 — MANCHETTE",
      title: "Une manchette. Rien d'autre.",
      image: {
        src: "/assets/editions/edition-02-manchette.jpg",
        alt: "Vue de dos, une femme tend le bras vers l'objectif, une manchette en or froissé au poignet",
        width: 1400,
        height: 1875,
      },
    },
  ],
};

/* ---------------------------------------------------------------------------
   RESERVE
   --------------------------------------------------------------------------- */

export const reserveContent: ReserveContent = {
  heading: ["Recevez la prochaine édition", "avant tout le monde."],
  sub: "Cent exemplaires par édition. Les premières réservations partent en quelques heures — la liste est le seul moyen d'être là avant.",
  fields: { name: "Prénom", email: "Adresse e-mail" },
  action: "Réserver ma place",
  success: "Merci. Vous êtes sur la liste — nous vous écrirons avant l'ouverture.",
  error: "Quelque chose n'a pas fonctionné. Réessayez dans un instant.",
};

/* ---------------------------------------------------------------------------
   FOOTER
   --------------------------------------------------------------------------- */

export const footerContent: FooterContent = {
  wordmark: [{ text: "O", italic: true }, { text: "doro" }],
  columns: [
    {
      title: "Collection",
      links: [
        { label: "Bracelets", href: "#collection" },
        { label: "Bagues", href: "#collection" },
        { label: "Colliers", href: "#collection" },
        { label: "Manchettes", href: "#collection" },
      ],
    },
    {
      title: "Maison",
      links: [
        { label: "Manifeste", href: "#maison" },
        { label: "Atelier", href: "#atelier" },
        { label: "Éditions", href: "#editions" },
        { label: "Réserver", href: "#reserver" },
      ],
    },
    {
      title: "Service",
      links: [
        { label: "Livraison", href: "#" },
        { label: "Retours", href: "#" },
        { label: "Entretien", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ],
  tagline: "Or 18 carats. Argent 925. Cent exemplaires par édition.",
  social: [
    { label: "Instagram", href: "#" },
    { label: "Pinterest", href: "#" },
    { label: "TikTok", href: "#" },
  ],
  legal: "© 2026 Maison Odoro — Paris. Tous droits réservés.",
};
