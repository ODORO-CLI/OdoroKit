/**
 * Content for the home view.
 *
 * Components never hardcode copy or media paths (see component-conventions.md);
 * they receive them from here via props. This is a template: replace these
 * values with the real content — nothing in the components needs to change.
 *
 * Media lives under `public/assets/<section>/`, one folder per section.
 */

export type ChapterSide = "left" | "right";

export const homeMocks = {
  header: {
    brand: "ODORO",
    links: [
      { label: "Collection", href: "#collection" },
      { label: "Lookbook", href: "#lookbook" },
      { label: "Manifeste", href: "#manifeste" },
      { label: "Atelier", href: "#atelier" },
    ],
    cart: { label: "Panier (0)", href: "#collection" },
  },

  /** The floating pill for the middle of the page. */
  pill: {
    links: ["Collection", "Lookbook", "Manifeste", "Atelier"],
    action: { label: "Acheter", href: "#collection" },
  },

  preloader: {
    wordmark: "ODORO",
    label: "Atelier — Collection 01",
  },

  hero: {
    eyebrow: "Collection 01 — Automne 2026",
    headline: "Le vêtement comme une présence.",
    cta: { label: "Découvrir la collection", href: "#collection" },
    wordmark: "ODORO",
    meta: { left: "Paris — Studio 01", right: "Défiler" },
    film: {
      mp4: "/assets/hero/odoro-hero.mp4",
      webm: "/assets/hero/odoro-hero.webm",
      poster: "/assets/hero/odoro-hero-poster.jpg",
      alt: "Une mannequin en blazer noir oversize, assise dans un fauteuil de réalisateur, se retourne vers l'objectif dans un studio gris pâle.",
    },
  },

  /** The two chapters that scroll over the film. */
  chapters: [
    {
      index: "I",
      meta: "La coupe",
      heading: "Taillé pour tenir la pose.",
      body: "Des épaules qui tombent juste. Des lignes qui ne demandent rien. Chaque pièce est coupée dans l'atelier, en petites séries, pour durer plus longtemps que la tendance.",
      side: "left" as ChapterSide,
    },
    {
      index: "II",
      meta: "Le studio",
      heading: "Porté, pas exposé.",
      body: "Nous photographions sur fond nu, en lumière dure. Aucun décor pour tricher : si le vêtement tient là, il tiendra partout.",
      side: "right" as ChapterSide,
    },
  ],

  manifesto: {
    eyebrow: "Manifeste",
    passage:
      "ODORO ne suit pas les saisons. Nous faisons peu de pièces, nous les faisons bien, et nous les laissons vivre sur vous jusqu'à ce qu'elles vous ressemblent.",
    signature: "— L'atelier, Paris",
  },

  collection: {
    label: "/ Collection 01",
    statement: "Six pièces. Une garde-robe.",
    body: "Blazer, chemise, pantalon, cuir, maille, bottes — coupés à Paris, portés partout. Rien de plus, rien de moins.",
    action: "Ajouter",
    items: [
      {
        id: "blazer-oversize",
        index: "01",
        name: "Blazer Oversize",
        detail: "Laine noire — épaule tombée",
        price: "390 €",
        image: "/assets/collection/product-01.jpg",
        alt: "Blazer oversize en laine noire porté sur une chemise blanche et une cravate fine.",
      },
      {
        id: "chemise-col-ouvert",
        index: "02",
        name: "Chemise Col Ouvert",
        detail: "Popeline de coton — blanc",
        price: "160 €",
        image: "/assets/collection/product-02.jpg",
        alt: "Chemise blanche oversize en popeline, col ouvert et manches roulées.",
      },
      {
        id: "pantalon-large",
        index: "03",
        name: "Pantalon Large",
        detail: "Laine anthracite — pli creux",
        price: "240 €",
        image: "/assets/collection/product-03.jpg",
        alt: "Pantalon large en laine anthracite à pli creux, porté avec un débardeur noir.",
      },
      {
        id: "veste-cuir",
        index: "04",
        name: "Veste Cuir Structurée",
        detail: "Agneau noir — revers vifs",
        price: "690 €",
        image: "/assets/collection/product-04.jpg",
        alt: "Veste structurée en cuir d'agneau noir aux revers vifs, sur un t-shirt blanc.",
      },
      {
        id: "hoodie-lourd",
        index: "05",
        name: "Hoodie Lourd",
        detail: "Molleton 480 g — écru",
        price: "190 €",
        image: "/assets/collection/product-05.jpg",
        alt: "Hoodie oversize en molleton lourd écru, capuche baissée.",
      },
      {
        id: "bottes-hautes",
        index: "06",
        name: "Bottes Hautes",
        detail: "Daim rose — semelle crantée",
        price: "450 €",
        image: "/assets/collection/product-06.jpg",
        alt: "Bottes hautes en daim rose vif à semelle crantée, portées avec un short noir.",
      },
    ],
  },

  lookbook: {
    eyebrow: "Lookbook — Studio 01",
    headline: { lead: "Sept silhouettes,", emphasis: "une lumière." },
    edgeLeft: "Index",
    edgeRight: "2026 — Ⓐ",
    hint: "Glisser · flèches",
    items: [
      {
        image: "/assets/lookbook/look-01.jpg",
        title: "Look 01",
        meta: "Blazer · Chemise · Cravate",
        alt: "Une femme accroupie sur fond blanc en blazer noir oversize, chemise blanche, cravate et mocassins.",
      },
      {
        image: "/assets/lookbook/look-02.jpg",
        title: "Look 02",
        meta: "Cuir · Mini-jupe · Clap",
        alt: "Une femme aux cheveux courts assise dans un fauteuil de réalisateur, veste en cuir et clap de cinéma.",
      },
      {
        image: "/assets/lookbook/look-03.jpg",
        title: "Look 03",
        meta: "Costume bordeaux",
        alt: "Une femme en costume bordeaux oversize devant un mur de béton, une styliste ajuste sa ceinture.",
      },
      {
        image: "/assets/lookbook/look-04.jpg",
        title: "Look 04",
        meta: "Hoodie · Bottes roses",
        alt: "Une femme en hoodie gris et bottes roses hautes dans un studio de béton, une styliste ajuste sa casquette.",
      },
      {
        image: "/assets/lookbook/look-05.jpg",
        title: "Look 05",
        meta: "Chemise ouverte · Cravate",
        alt: "Une femme à lunettes rondes assise à l'envers sur un fauteuil de réalisateur, chemise bleu pâle ouverte.",
      },
      {
        image: "/assets/lookbook/look-06.jpg",
        title: "Look 06",
        meta: "Tweed · Mocassins",
        alt: "Une femme en blazer de tweed installée dans un fauteuil de cuir cognac, téléphone vintage à l'oreille.",
      },
      {
        image: "/assets/lookbook/look-07.jpg",
        title: "Look 07",
        meta: "Body · Cuir · Bottes",
        alt: "Une femme en body noir et pantalon de cuir assise sur une chaise chromée devant un portant de vêtements.",
      },
    ],
  },

  closing: {
    heading: { lead: "Entrez dans", trail: "l'atelier." },
    body: "Accès anticipé aux drops, invitations aux essayages privés — et rien d'autre.",
    note: "Places limitées — 200 par saison.",
    cta: { label: "Rejoindre la liste", href: "mailto:bonjour@odoro.studio" },
  },

  footer: {
    wordmark: "ODORO",
    tagline: "Le vêtement comme une présence.",
    email: "bonjour@odoro.studio",
    columns: [
      {
        title: "Boutique",
        links: ["Collection 01", "Lookbook", "Précommandes", "Cartes cadeaux"],
      },
      {
        title: "Maison",
        links: ["Manifeste", "Atelier", "Matières", "Presse"],
      },
      {
        title: "Suivre",
        links: ["Instagram", "TikTok", "Pinterest", "Newsletter"],
      },
    ],
    legal: {
      copyright: "© 2026 ODORO — Paris",
      links: ["Mentions légales", "Confidentialité", "CGV"],
    },
  },
} as const;

export type HomeMocks = typeof homeMocks;
