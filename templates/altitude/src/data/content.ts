/* ══════════════════════════════════════════════════════════════════════════
   Every word on the page, in one file.

   House rule for this copy: verb + object, then a number. No metaphor, no
   image, no "votre nouvelle vie commence ici". A claim that cannot be checked
   is cut. What sells a 6 M€ penthouse is the floor, the surface, the delay and
   the exclusivity window — so those are what the page says.
   ══════════════════════════════════════════════════════════════════════════ */

export const BRAND = "ODORO";

export const NAV = [
  { label: "Penthouses", href: "#penthouses" },
  { label: "Services", href: "#services" },
  { label: "Estimation", href: "#estimation" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO = {
  /** Two deliberate lines. The second is set at 70% so the first one lands. */
  lineOne: "Trouvez votre penthouse.",
  lineTwo: "Signez en 45 jours.",
  form: {
    quartier: "Quartier",
    budget: "Budget",
    action: "Voir les biens",
  },
} as const;

/** The base rail under the hero: two figures around a centred pitch. */
export const HERO_STATS = {
  left: { figure: "48", label: "biens vendus en 2025" },
  right: { figure: "45 j", label: "délai moyen de signature" },
  title: "Paris · Genève · Dubaï",
  pitch: "Agence immobilière. Tours, penthouses, derniers étages.",
} as const;

/* ── The film ──────────────────────────────────────────────────────────────
   Five chapters on one continuous take. `t0 → tHold` is the camera moving,
   `tHold → t1` is the camera parked while the reader reads — the hold gets
   more scroll than its seconds, which is what makes the film feel like it
   waits for you. `textIn` is the video time at which the copy arrives, set
   just as the camera decelerates. Times are in seconds of the master film. */
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
  action?: { label: string; href: string };
};

export const CHAPTERS: Chapter[] = [
  {
    id: 0,
    label: "L'arrivée",
    t0: 0.0,
    tHold: 3.4,
    t1: 6.0,
    wMove: 1.0,
    wHold: 0.7,
    // No copy: this leg belongs to the hero chrome, which is already on screen.
  },
  {
    id: 1,
    label: "La façade",
    t0: 6.0,
    tHold: 10.5,
    t1: 15.0,
    wMove: 1.0,
    wHold: 1.35,
    eyebrow: "Estimation",
    title: "Estimez votre bien en 48 heures.",
    body: "Nous visitons, nous mesurons, nous comparons aux ventes réelles de l'immeuble. Vous recevez un prix ferme, pas une fourchette.",
    metrics: [
      { value: "48 h", label: "pour le rapport" },
      { value: "0 €", label: "jusqu'au mandat" },
    ],
  },
  {
    id: 2,
    label: "La terrasse",
    t0: 15.0,
    tHold: 22.0,
    t1: 24.0,
    wMove: 1.0,
    wHold: 1.45,
    eyebrow: "Penthouse 01",
    title: "Tour Solane, 58ᵉ étage.",
    body: "Terrasse traversante, exposition sud-ouest, ascenseur privatif. Visite sur rendez-vous, sept jours avant la mise en ligne.",
    metrics: [
      { value: "240 m²", label: "habitables" },
      { value: "90 m²", label: "de terrasse" },
      { value: "6,2 M€", label: "prix affiché" },
    ],
  },
  {
    id: 3,
    label: "Le salon",
    t0: 24.0,
    tHold: 28.5,
    t1: 32.0,
    wMove: 1.0,
    wHold: 1.45,
    eyebrow: "Accès",
    title: "Visitez avant la mise en ligne.",
    body: "Nos clients voient les biens sept jours avant les portails. Vous visitez sans concurrence et vous décidez sans enchère.",
    metrics: [
      { value: "7 j", label: "d'exclusivité" },
      { value: "1", label: "interlocuteur, du premier appel à la signature" },
    ],
  },
  {
    id: 4,
    label: "L'ensemble",
    t0: 32.0,
    tHold: 38.0,
    t1: 40.0,
    wMove: 1.0,
    wHold: 1.6,
    eyebrow: "Rendez-vous",
    title: "Parlez à un conseiller.",
    body: "Dites-nous l'étage et le budget. Nous répondons sous 24 heures avec trois biens qui correspondent.",
    action: { label: "Prendre rendez-vous", href: "#contact" },
  },
];

export const FILM_END = 40.0;

/* ── La tour (la section ThreeJS) ────────────────────────────────────────── */
export const TOWER = {
  eyebrow: "La tour",
  /** Set in the 3D layer, BEHIND the cut-out tower — it passes behind the mass
      as the reader scrolls, which is the whole point of the section. */
  behind: "ODORO",
  title: "Nous ne vendons que les derniers étages.",
  body: "Au-dessus du 40ᵉ, le marché tient sur une centaine de lignes par an. Nous les suivons toutes, immeuble par immeuble.",
  metrics: [
    { value: "40ᵉ", label: "étage minimum" },
    { value: "12", label: "tours suivies" },
    { value: "104", label: "lignes traitées en 2025" },
  ],
} as const;

/* ── Penthouses ───────────────────────────────────────────────────────────── */
export const PENTHOUSES = [
  {
    ref: "01",
    name: "Tour Solane",
    floor: "58ᵉ étage",
    surface: "240 m²",
    outside: "90 m² de terrasse",
    rooms: "4 chambres",
    price: "6 200 000 €",
    status: "Visite sur rendez-vous",
    poster: "/assets/penthouse-01.jpg",
  },
  {
    ref: "02",
    name: "Résidence Aval",
    floor: "41ᵉ étage",
    surface: "186 m²",
    outside: "34 m² de loggia",
    rooms: "3 chambres",
    price: "4 350 000 €",
    status: "Disponible",
    poster: "/assets/penthouse-02.jpg",
  },
  {
    ref: "03",
    name: "Tour Nord",
    floor: "63ᵉ étage",
    surface: "310 m²",
    outside: "120 m² de terrasse",
    rooms: "5 chambres",
    price: "9 800 000 €",
    status: "Exclusivité 7 jours",
    poster: "/assets/penthouse-03.jpg",
  },
] as const;

export const PENTHOUSES_INTRO = {
  eyebrow: "Penthouses",
  title: "Trois biens disponibles cette semaine.",
  body: "Chaque ligne est vérifiée sur place. Le prix affiché est le prix demandé par le vendeur.",
} as const;

/* ── Services ─────────────────────────────────────────────────────────────── */
export const SERVICES_INTRO = {
  eyebrow: "Services",
  title: "Quatre choses, faites entièrement.",
} as const;

export const SERVICES = [
  {
    n: "01",
    title: "Estimez votre bien.",
    body: "Prix ferme sous 48 heures, appuyé sur les ventes réelles de l'immeuble et non sur les annonces en ligne.",
  },
  {
    n: "02",
    title: "Visitez en privé.",
    body: "Sept jours avant la mise en ligne, sans autre acheteur dans la pièce, avec les plans et le dernier PV d'assemblée.",
  },
  {
    n: "03",
    title: "Négociez avec un seul interlocuteur.",
    body: "Le conseiller qui vous reçoit mène l'offre et signe chez le notaire. Personne ne reprend le dossier en route.",
  },
  {
    n: "04",
    title: "Financez au bon taux.",
    body: "Nous montons le dossier et le présentons à trois banques privées. Vous choisissez l'offre, nous tenons le calendrier.",
  },
] as const;

/* ── Contact ──────────────────────────────────────────────────────────────── */
export const CONTACT = {
  eyebrow: "Rendez-vous",
  title: "Dites-nous l'étage et le budget.",
  body: "Nous répondons sous 24 heures avec trois biens qui correspondent.",
  fields: { name: "Nom", email: "E-mail", budget: "Budget" },
  action: "Prendre rendez-vous",
  note: "Réponse sous 24 heures. Aucun appel automatique.",
} as const;

export const FOOTER = {
  address: "18 avenue Matignon, 75008 Paris",
  phone: "+33 1 84 80 00 00",
  email: "contact@odoro.fr",
  legal: "ODORO SAS · Carte professionnelle CPI 7501 2025 000 000 000",
  columns: [
    { title: "Agence", links: ["Penthouses", "Services", "Estimation", "Équipe"] },
    { title: "Villes", links: ["Paris", "Genève", "Dubaï"] },
    { title: "Légal", links: ["Mentions légales", "Honoraires", "Confidentialité"] },
  ],
} as const;
