/* ══════════════════════════════════════════════════════════════════════════
   Every word on the page, in one file.

   House rule for this copy: a verb, its object, then a fact that can be
   checked. No metaphor, no "l'éclat de votre singularité". What sells a ring
   at this price is the metal, the weight, the carat, the delay and what
   happens if it does not fit — so those are what the page says.

   The one exception the Style asks for: a headline over a photograph dims its
   OWN first clause to 50%, so the second half lands. That is a typographic
   move, not a rhetorical one.
   ══════════════════════════════════════════════════════════════════════════ */

export const BRAND = "ODORO";

export const NAV = [
  { label: "Pièces", href: "#pieces" },
  { label: "Atelier", href: "#atelier" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO = {
  /** First clause muted, second at full strength. */
  lineOne: "Achetez une pièce.",
  lineTwo: "Portez-la trente ans.",
  action: { label: "Voir les pièces", href: "#pieces" },
} as const;

/** The rail under the hero: four facts, no adjectives. */
export const HERO_FACTS = [
  { value: "18 ct", label: "or massif" },
  { value: "925", label: "argent sterling" },
  { value: "Paris", label: "atelier du 3ᵉ" },
  { value: "Offerte", label: "gravure" },
] as const;

/* ── Les films ─────────────────────────────────────────────────────────────
   Each chapter is two legs: the camera MOVING (t0 → tHold) and the camera
   PARKED (tHold → t1). The parked leg is given more scroll than it has
   seconds, so the film appears to wait while the reader reads. `textIn` is
   derived as tHold − 0.3: the copy arrives as the movement decelerates, never
   during it. Times are measured on the real footage. */
export type Chapter = {
  id: number;
  label: string;
  t0: number;
  tHold: number;
  t1: number;
  wMove: number;
  wHold: number;
  eyebrow?: string;
  title?: string;
  body?: string;
  metrics?: { value: string; label: string }[];
};

/** Le film du hero — 10 s. Le premier chapitre n'a pas de copie : c'est le
    hero lui-même qui l'occupe. */
export const HERO_CHAPTERS: Chapter[] = [
  {
    id: 0,
    label: "La pose",
    t0: 0.0,
    tHold: 2.6,
    t1: 5.0,
    wMove: 1.0,
    wHold: 0.8,
  },
  {
    id: 1,
    label: "Les mains",
    t0: 5.0,
    tHold: 8.2,
    t1: 10.0,
    wMove: 1.0,
    wHold: 1.4,
    eyebrow: "Superposition",
    title: "Portez-les ensemble.",
    body: "Les bagues sont calibrées au quart de taille pour s'empiler sans jeu. Trois au même doigt tiennent sans tourner.",
    metrics: [
      { value: "¼", label: "de taille entre chaque" },
      { value: "3", label: "bagues par doigt" },
    ],
  },
];

export const HERO_FILM_END = 10.0;

/** Le film de la main — 8 s. */
export const HAND_CHAPTERS: Chapter[] = [
  {
    id: 0,
    label: "L'essai",
    t0: 0.0,
    tHold: 2.4,
    t1: 4.0,
    wMove: 1.0,
    wHold: 1.3,
    eyebrow: "Essai à domicile",
    title: "Essayez chez vous.",
    body: "Nous envoyons trois pièces à l'essai. Vous gardez celle que vous portez et renvoyez le reste sous sept jours, port payé.",
    metrics: [
      { value: "3", label: "pièces envoyées" },
      { value: "7 j", label: "pour renvoyer" },
    ],
  },
  {
    id: 1,
    label: "La gravure",
    t0: 4.0,
    tHold: 6.2,
    t1: 8.0,
    wMove: 1.0,
    wHold: 1.4,
    eyebrow: "Gravure",
    title: "Gravez l'intérieur.",
    body: "Trois mots, une date ou une initiale, gravés à la main à l'atelier. Offert sur toutes les pièces, y compris en solde.",
    metrics: [
      { value: "20", label: "caractères maximum" },
      { value: "0 €", label: "quelle que soit la pièce" },
    ],
  },
];

export const HAND_FILM_END = 8.0;

/* ── Les pièces ───────────────────────────────────────────────────────────── */
export const PIECES_INTRO = {
  eyebrow: "La collection",
  title: "Six pièces, et c'est tout.",
  body: "Nous ne sortons pas de collection saisonnière. Ces six-là sont fabriquées en continu depuis 2019 et le resteront.",
} as const;

export const PIECES = [
  {
    ref: "01",
    name: "Chevalière Plate",
    material: "Or 18 carats",
    weight: "9,4 g",
    price: "1 450 €",
    image: "/assets/piece-01.jpg",
  },
  {
    ref: "02",
    name: "Bague Pavée",
    material: "Or blanc, 42 diamants",
    weight: "3,1 g",
    price: "2 980 €",
    image: "/assets/piece-02.jpg",
  },
  {
    ref: "03",
    name: "Créoles Épaisses",
    material: "Or 18 carats",
    weight: "12,8 g",
    price: "1 890 €",
    image: "/assets/piece-03.jpg",
  },
  {
    ref: "04",
    name: "Jonc Sculpté",
    material: "Argent 925",
    weight: "38 g",
    price: "420 €",
    image: "/assets/piece-04.jpg",
  },
  {
    ref: "05",
    name: "Chaîne Fine",
    material: "Argent 925, diamant 0,05 ct",
    weight: "4,2 g",
    price: "390 €",
    image: "/assets/piece-05.jpg",
  },
  {
    ref: "06",
    name: "Bague Cœur",
    material: "Or blanc, rubis 2,4 ct",
    weight: "3,8 g",
    price: "4 600 €",
    image: "/assets/piece-06.jpg",
  },
] as const;

/* ── L'atelier (la section ThreeJS) ───────────────────────────────────────── */
export const ATELIER = {
  eyebrow: "L'atelier",
  /** Set in the DOM, BEHIND the cut-out hand — it passes behind it as the
      reader scrolls, which is the whole point of the section. */
  behind: "ODORO",
  title: "Nous fabriquons rue du Temple.",
  body: "Chaque pièce est coulée, limée et polie à la main dans le 3ᵉ arrondissement. Comptez douze jours entre la commande et l'envoi.",
  metrics: [
    { value: "12 j", label: "de fabrication" },
    { value: "5", label: "artisans" },
    { value: "0", label: "sous-traitance" },
  ],
} as const;

/* ── Services ─────────────────────────────────────────────────────────────── */
export const SERVICES_INTRO = {
  eyebrow: "Services",
  title: "Quatre engagements tenus.",
} as const;

export const SERVICES = [
  {
    n: "01",
    title: "Gravez l'intérieur.",
    body: "Vingt caractères, gravés à la main à l'atelier. Offert sur toutes les pièces, sans condition de montant.",
  },
  {
    n: "02",
    title: "Mettez à votre taille.",
    body: "À vie, autant de fois qu'il le faut. Vous payez le transport, jamais la main-d'œuvre.",
  },
  {
    n: "03",
    title: "Renvoyez sous 30 jours.",
    body: "Non portée, dans son écrin. Remboursement en cinq jours ouvrés, gravure comprise.",
  },
  {
    n: "04",
    title: "Payez en trois fois.",
    body: "Sans frais, à partir de 300 €. Réponse immédiate, sans dossier à constituer.",
  },
] as const;

/* ── Contact ──────────────────────────────────────────────────────────────── */
export const CONTACT = {
  eyebrow: "Rendez-vous",
  title: "Essayez à l'atelier.",
  body: "Vingt minutes, du mardi au samedi. Dites-nous les pièces qui vous intéressent, nous les sortons avant votre arrivée.",
  fields: { name: "Nom", email: "E-mail", piece: "Pièce" },
  action: "Prendre rendez-vous",
  note: "Réponse sous 24 heures.",
} as const;

export const FOOTER = {
  address: "14 rue du Temple, 75004 Paris",
  hours: "Du mardi au samedi, 11 h – 19 h",
  phone: "+33 1 42 71 00 00",
  email: "atelier@odoro.fr",
  legal: "ODORO SAS · Poinçon de maître 1042 · TVA FR 42 000 000 000",
  columns: [
    { title: "Collection", links: ["Bagues", "Créoles", "Joncs", "Chaînes"] },
    { title: "Maison", links: ["L'atelier", "Gravure", "Mise à taille", "Entretien"] },
    { title: "Légal", links: ["Mentions légales", "Livraison", "Retours"] },
  ],
} as const;
