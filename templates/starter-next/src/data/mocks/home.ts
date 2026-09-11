/**
 * Home page copy — placeholder content lifted from the Figma frame
 * "Concept 3" (1469:1302). Passed into the view via props; never imported by a
 * component directly (obsidian/frontend/component-conventions.md → Data rules).
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface HighlightItem {
  id: string;
  title: string;
  description: string;
  glyph: "circle" | "triangle";
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface AudienceItem {
  id: string;
  index: string;
  title: string;
  description: string;
  /**
   * Zero-based cell in the 3 × 3 grid. The centre and the two counter-diagonal
   * cells carry no card — that gap is the layout.
   */
  cell: number;
}

export interface ContactField {
  name: string;
  label: string;
  type: "text" | "tel" | "email";
  autoComplete: string;
}

export const homeContent = {
  nav: {
    links: [
      { label: "La maison", href: "#about" },
      { label: "Le lieu", href: "#location" },
      { label: "Achat", href: "#audience" },
      { label: "Visiter", href: "#contact" },
    ] satisfies NavLink[],
    cta: { label: "Contact", href: "#contact" },
  },

  hero: {
    headingLead: "Une maison en bois, ",
    headingRest: "la vallée en face",
    subtitle:
      "Manigod, la maison du Belvédère. 214 m² habitables, 4 chambres, terrain de 1 800 m². 1 340 000 €, honoraires inclus.",
    cta: { label: "Fixer une visite", href: "#contact" },
    wordmark: "odoro",
    caption: ["Construite en 2021, DPE A, fibre,", "12 minutes du centre, route déneigée"],
    image: {
      src: "/assets/Hero/hero.png",
      alt: "La maison du Belvédère éclairée de l'intérieur au crépuscule, au-dessus de la vallée.",
      width: 2160,
      height: 2271,
    },
  },

  about: {
    eyebrow: "Le Belvédère",
    body: "214 m² habitables, 4 chambres, 2 salles de bain. Bardage en bois brûlé, grands vitrages, toiture en zinc, 2,80 m sous plafond. Séjour traversant plein sud, ouvert sur la vallée. 12 minutes du centre, route déneigée toute l'année.",
    cta: { label: "Visiter le bien", href: "#contact" },
    highlights: [
      {
        id: "gfa-bancaire",
        title: "DPE classe A",
        description: "Construite en 2021, chauffage par pompe à chaleur, fibre optique.",
        glyph: "circle",
      },
      {
        id: "date-a-l-acte",
        title: "Le terrain",
        description: "1 800 m² en pleine propriété et 46 m² de terrasse.",
        glyph: "triangle",
      },
    ] satisfies HighlightItem[],
    image: {
      src: "/assets/About/about.png",
      alt: "Un bonhomme bâton souriant, dessiné à la main à l'encre noire sur fond transparent.",
      width: 842,
      height: 1025,
    },
    video: {
      src: "/assets/About/about-video.mp4",
      label: "La maison au crépuscule, faites-la tourner",
    },
    /**
     * Quote card laid over the photograph. Figma 1505:1816 supplies the layout
     * but still carries the old placeholder copy, so the words below are a
     * stand-in written to the right length — replace with the real quote.
     */
    quote: {
      // Figma's box allows one 20 px line plus a short attribution — keep the
      // quote to roughly this length or the card overflows.
      text: "Un mandat par bien, pas deux.",
      attribution: "L'agent qui a rentré le bien, 4 mai 2026",
    },
  },

  numbers: {
    eyebrow: "Chiffres clés",
    heading: "La maison du Belvédère a été construite en 2021.",
    subtitle:
      "1 800 m² de terrain en pleine propriété, 4 chambres, 2 salles de bain, DPE A, pompe à chaleur",
    stats: [
      { id: "logements", value: "46", label: "m² de terrasse" },
      { id: "surface-moyenne", value: "214", label: "m² habitables" },
      { id: "distance-plage", value: "12", label: "minutes du centre" },
    ] satisfies StatItem[],
  },

  location: {
    eyebrow: "Situation",
    body: "12 minutes du centre par la départementale, déneigée toute l'année. Premiers commerces à 4 km, école à 6 minutes, collège à 9. Gare à 20 minutes, entrée d'autoroute à 25. Fibre raccordée. Terrain de 1 800 m² en pleine propriété, sans vis-à-vis au sud.",
    cta: { label: "Demander la visite", href: "#contact" },
    image: {
      src: "/assets/Location/location.png",
      alt: "La maison du Belvédère au crépuscule, ses baies éclairées de l'intérieur.",
      width: 2160,
      height: 1437,
    },
    reveal: {
      src: "/assets/Location/mask.png",
      label: "Passez le curseur pour voir la maison dessinée",
    },
  },

  audience: {
    eyebrow: "Acquéreurs",
    intro:
      "Six profils, écrits noir sur blanc avant le premier rendez-vous. Une maison de 214 m², un seul mandat, jamais un stagiaire à la visite : mieux vaut savoir tout de suite si elle est pour vous.",
    items: [
      {
        id: "famille-dici",
        index: "01",
        title: "Famille d'ici",
        description: "Quatre chambres, deux salles de bain. Le centre et ses écoles à 12 minutes.",
        cell: 0,
      },
      {
        id: "cadre-frontalier",
        index: "02",
        title: "Bureau à domicile",
        description: "Fibre en place, 214 m² habitables, 2,80 m sous plafond : la place d'un bureau.",
        cell: 1,
      },
      {
        id: "quitter-l-escalier",
        index: "03",
        title: "Sortir de la ville",
        description: "Terrain de 1 800 m² en pleine propriété. Route déneigée toute l'année.",
        cell: 3,
      },
      {
        id: "residence-secondaire",
        index: "04",
        title: "La vue",
        description: "Terrasse de 46 m² au-dessus de la vallée. Séjour traversant, plein sud.",
        cell: 5,
      },
      {
        id: "investisseur",
        index: "05",
        title: "Sans travaux",
        description: "Construite en 2021, DPE A, pompe à chaleur : rien à reprendre avant d'emménager.",
        cell: 7,
      },
      {
        id: "liste-d-attente",
        index: "06",
        title: "La liste d'attente",
        description: "Vous êtes prévenu avant la mise en ligne : 140 biens vendus, 47 jours en moyenne.",
        cell: 8,
      },
    ] satisfies AudienceItem[],
    /**
     * The 3D mark. Not a grid cell — its canvas spans the whole section behind
     * the card grid; see `views/home/audience-mark.tsx`.
     */
    mark: {
      // Le sigle ODORO, genere geometriquement a partir du meme trace que
      // `BRAND_MARK_PATH` — voir components/ui/icons/brand-mark.tsx.
      src: "/assets/Mark/odoro-mark.glb",
      label: "Le sigle Odoro, angle carré et arc de 270 degrés, tournant au fil du défilement",
    },
  },

  contact: {
    eyebrow: "Contact",
    headingLead: "Venez voir la maison, ",
    headingRest: "pas une plaquette",
    body: "Laissez vos coordonnées. Nous convenons d'une visite avec la personne qui suit la maison depuis le mandat. Réponse le jour même.",
    fields: [
      { name: "name", label: "Nom", type: "text", autoComplete: "name" },
      { name: "phone", label: "Tél.", type: "tel", autoComplete: "tel" },
      { name: "email", label: "Email", type: "email", autoComplete: "email" },
    ] satisfies ContactField[],
    submitLabel: "Fixer la visite",
    image: {
      src: "/assets/Contact/contact.png",
      alt: "La maison entière au crépuscule, éclairée de l'intérieur.",
      width: 2160,
      height: 1689,
    },
  },
} as const;

export type HomeContent = typeof homeContent;
