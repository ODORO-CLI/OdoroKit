/* ══════════════════════════════════════════════════════════════════════════
   Every word on the page, in one file.

   House rule for this copy: a verb, its object, then a number that can be
   checked. What sells a 2 400 €/jour Ferrari is the delivery window, the
   included mileage, what happens to the deposit and how late you can cancel —
   so those are what the page says. No metaphor, no "l'adrénaline à l'état pur".

   The display face runs UPPERCASE through CSS, so the copy is written in
   sentence case here and never shouted in the source.
   ══════════════════════════════════════════════════════════════════════════ */

export const BRAND = "ODORO";

export const NAV = [
  { label: "Flotte", href: "#flotte" },
  { label: "Garage", href: "#garage" },
  { label: "Services", href: "#services" },
  { label: "Réserver", href: "#contact" },
] as const;

export const HERO = {
  eyebrow: "Paris · Disponible ce soir",
  lineOne: "Réservez ce soir.",
  lineTwo: "Roulez demain.",
  lead: "Six voitures, livrées à l'adresse de votre choix. 250 km inclus par jour, caution bloquée et jamais débitée.",
  action: { label: "Voir les disponibilités", href: "#flotte" },
} as const;

/** The hairline-bracketed assurance row under the lead. */
export const HERO_ASSURANCES = [
  "Assurance tous risques incluse",
  "Conducteur 25 ans minimum",
  "Annulation gratuite 24 h avant",
] as const;

/** The frosted card pinned bottom-right — the Style's telemetry slot, doing a
    job a rental page actually has: saying what is free right now. */
export const HERO_STATUS = {
  label: "Disponibilité",
  value: "4",
  unit: "véhicules libres",
  rows: [
    { k: "Livraison Paris", v: "2 h" },
    { k: "Confirmation", v: "1 h" },
  ],
} as const;

/* ── Les films ─────────────────────────────────────────────────────────────
   Each chapter is two legs: the camera MOVING (t0 → tHold) and the camera
   PARKED (tHold → t1). The parked leg gets more scroll than it has seconds, so
   the film appears to wait while the reader reads. Copy arrives at tHold − 0.3,
   as the movement decelerates. Times are measured on the real footage. */
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

/** Le film du hero — 10 s. Le premier chapitre n'a pas de copie : le hero
    l'occupe. */
export const HERO_CHAPTERS: Chapter[] = [
  {
    id: 0,
    label: "Le parc",
    t0: 0.0,
    tHold: 2.6,
    t1: 5.0,
    wMove: 1.0,
    wHold: 0.8,
  },
  {
    id: 1,
    label: "La livraison",
    t0: 5.0,
    tHold: 8.0,
    t1: 10.0,
    wMove: 1.0,
    wHold: 1.4,
    eyebrow: "Livraison",
    title: "Prenez la voiture où vous êtes.",
    body: "Nous livrons à votre adresse, à l'hôtel ou au terminal. Deux heures dans Paris, quatre heures en Île-de-France.",
    metrics: [
      { value: "2 h", label: "dans Paris" },
      { value: "0 €", label: "jusqu'à 100 km" },
    ],
  },
];

export const HERO_FILM_END = 10.0;

/** Le film des détails — 8 s. */
export const DETAIL_CHAPTERS: Chapter[] = [
  {
    id: 0,
    label: "L'état des lieux",
    t0: 0.0,
    tHold: 2.4,
    t1: 4.0,
    wMove: 1.0,
    wHold: 1.3,
    eyebrow: "Départ et retour",
    title: "Vérifiez la voiture avec nous.",
    body: "État des lieux filmé au départ et au retour, signé sur place. Rien ne vous est reproché après coup.",
    metrics: [
      { value: "2", label: "états des lieux filmés" },
      { value: "0", label: "frais découvert après coup" },
    ],
  },
  {
    id: 1,
    label: "Le kilométrage",
    t0: 4.0,
    tHold: 6.2,
    t1: 8.0,
    wMove: 1.0,
    wHold: 1.4,
    eyebrow: "Kilométrage",
    title: "Roulez 250 km par jour.",
    body: "Inclus dans le prix affiché. Au-delà, 2 € le kilomètre, annoncés à la réservation et jamais après.",
    metrics: [
      { value: "250 km", label: "inclus par jour" },
      { value: "2 €", label: "le kilomètre au-delà" },
    ],
  },
];

export const DETAIL_FILM_END = 8.0;

/* ── La flotte ────────────────────────────────────────────────────────────── */
export const FLEET_INTRO = {
  eyebrow: "La flotte",
  title: "Six voitures disponibles.",
  body: "Le prix affiché est le prix payé : assurance tous risques, 250 km par jour et livraison dans Paris compris.",
} as const;

export const FLEET = [
  {
    ref: "01",
    name: "Lamborghini Aventador",
    power: "770 ch",
    sprint: "2,9 s",
    price: "1 900 €",
    deposit: "15 000 €",
    image: "/assets/car-01.jpg",
  },
  {
    ref: "02",
    name: "Ferrari SF90 Stradale",
    power: "1 000 ch",
    sprint: "2,5 s",
    price: "2 400 €",
    deposit: "20 000 €",
    image: "/assets/car-02.jpg",
  },
  {
    ref: "03",
    name: "Mercedes-AMG G 63 Brabus",
    power: "900 ch",
    sprint: "3,8 s",
    price: "1 200 €",
    deposit: "10 000 €",
    image: "/assets/car-03.jpg",
  },
  {
    ref: "04",
    name: "Porsche 911 Turbo S",
    power: "650 ch",
    sprint: "2,7 s",
    price: "950 €",
    deposit: "8 000 €",
    image: "/assets/car-04.jpg",
  },
  {
    ref: "05",
    name: "Bentley Continental GT",
    power: "659 ch",
    sprint: "3,6 s",
    price: "890 €",
    deposit: "8 000 €",
    image: "/assets/car-05.jpg",
  },
  {
    ref: "06",
    name: "Rolls-Royce Cullinan",
    power: "571 ch",
    sprint: "5,2 s",
    price: "1 400 €",
    deposit: "12 000 €",
    image: "/assets/car-06.jpg",
  },
] as const;

/* ── Le garage (la section ThreeJS) ───────────────────────────────────────── */
export const GARAGE = {
  eyebrow: "Le garage",
  /** Set in the DOM, BEHIND the cut-out car — it passes behind it as the
      reader scrolls, which is the whole point of the section. */
  behind: "ODORO",
  title: "Six voitures, pas soixante.",
  body: "Chaque voiture dort dans notre garage du 17ᵉ et passe à l'atelier toutes les six semaines. Vous savez laquelle vous aurez avant de réserver.",
  metrics: [
    { value: "6", label: "voitures au parc" },
    { value: "6 sem.", label: "entre deux révisions" },
    { value: "1", label: "garage, le nôtre" },
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
    title: "Réservez en deux minutes.",
    body: "Permis, pièce d'identité, carte bancaire. Validation immédiate, aucun dossier à constituer.",
  },
  {
    n: "02",
    title: "Recevez la voiture chez vous.",
    body: "À l'adresse, à l'hôtel ou au terminal. Deux heures dans Paris, quatre heures en Île-de-France.",
  },
  {
    n: "03",
    title: "Bloquez la caution, ne la payez pas.",
    body: "Empreinte bancaire libérée sous 48 heures après le retour. Jamais débitée sans état des lieux contradictoire.",
  },
  {
    n: "04",
    title: "Annulez jusqu'à 24 heures avant.",
    body: "Remboursement intégral, sans motif à donner et sans frais de dossier.",
  },
] as const;

/* ── Contact ──────────────────────────────────────────────────────────────── */
export const CONTACT = {
  eyebrow: "Réservation",
  title: "Dites-nous la voiture et la date.",
  body: "Nous confirmons sous une heure, sept jours sur sept, et nous annonçons le prix final avant que vous signiez.",
  fields: { name: "Nom", phone: "Téléphone", car: "Voiture" },
  action: "Réserver",
  note: "Confirmation sous 1 heure.",
} as const;

export const FOOTER = {
  address: "12 rue Fourcroy, 75017 Paris",
  hours: "7 j/7, 8 h – 22 h",
  phone: "+33 1 47 63 00 00",
  email: "reservation@odoro.fr",
  legal: "ODORO SAS · Loueur professionnel · Assurance flotte AXA n° 4200000000",
  columns: [
    { title: "Flotte", links: ["Supercars", "SUV", "Grand tourisme", "Disponibilités"] },
    { title: "Pratique", links: ["Livraison", "Caution", "Kilométrage", "Assurance"] },
    { title: "Légal", links: ["Conditions de location", "Mentions légales", "Confidentialité"] },
  ],
} as const;
