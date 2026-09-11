import { screens } from "@/lib/scene/screens";
import { siteConfig } from "@/lib/site";

/**
 * Content for the home view — ODORO, in French.
 *
 * Every line here answers to the cadrage (`~/Desktop/ODORO.md`, 23/08/2026) and
 * its editorial rule: the page never announces anything the product does not do.
 * No invented traction figures, no pricing, no promise to host client apps on a
 * real domain. Components take this via props — never by importing it directly.
 *
 * Line-length is structural above 855px: the mastheads are two `nowrap` lines in
 * a 663px box at 56px Mulish Light (≈ 24 characters), station titles sit in a
 * 204px column at 32px (≈ 12 characters). Keep rewrites inside those.
 */

export interface HeroFormContent {
  name: string;
  email: string;
  submit: string;
  /** Shown in the pill while the request is in flight. */
  sending: string;
  /** Shown once the server has confirmed the submission — and only then. */
  done: string;
  /** Shown when the server refused or the network failed. */
  failed: string;
}

/** The one wait-list form, shared by the hero and the closing scene. */
const waitlistForm: HeroFormContent = {
  name: "Ton prénom",
  email: "Ton e-mail",
  submit: "Être prévenu",
  sending: "Envoi…",
  done: "C'est noté. On te prévient à l'ouverture.",
  failed: "Ça n'a pas marché. Réessaie dans un instant.",
};

export interface HeroContent {
  /** Masthead top line — the bright → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — the haze → bright half. */
  titleBottom: string;
  subtitle: string;
  form: HeroFormContent;
}

export const hero: HeroContent = {
  titleTop: "Décris ton application.",
  titleBottom: "Elle se construit.",
  subtitle:
    "Tu écris ce que tu veux, en français. Une équipe de quatre rôles IA la transforme en application web qui tourne — sans code, sans clé API à fournir.",
  form: waitlistForm,
};

export interface HeroNavContent {
  /** Accessible name for the logo home control. */
  wordmark: string;
  links: NavItem[];
  ctaLabel: string;
  /** Where the CTA pill scrolls to — the closing scene carries the form. */
  ctaTarget: string;
}

/** Fixed top navigation. The four links are the four slides, in order. */
export const heroNav: HeroNavContent = {
  wordmark: "odoro",
  links: [
    { label: "Accueil", target: screens.HERO },
    { label: "La chaîne", target: screens.SITEMAP },
    { label: "Le parcours", target: screens.ROADMAP },
    { label: "Lancement", target: screens.IMPACT },
  ],
  ctaLabel: "Être prévenu",
  ctaTarget: screens.IMPACT,
};

export interface ServiceItem {
  title: string;
  caption: string;
}

export interface ServicesContent {
  /** Masthead top line — bright → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — haze → bright half. */
  titleBottom: string;
  /** Left-hand column (left-aligned). */
  left: ServiceItem[];
  /** Right-hand column (right-aligned). */
  right: ServiceItem[];
  footnote: string;
}

/**
 * The chain — ODORO's differentiator, on the plasma-burst slide. Four cells, read
 * across then down: Architecte → Codeur → Relecteur → Réparateur. The number is the
 * RANK in the chain, which is why it is part of the title.
 */
export const services: ServicesContent = {
  titleTop: "Quatre rôles en chaîne.",
  titleBottom: "Pas une mêlée.",
  left: [
    {
      title: "1. Architecte",
      caption: "Comprend la demande, décide de la structure, écrit le plan.",
    },
    {
      title: "3. Relecteur",
      caption:
        "Relit chaque modification. Refuse ce qui casse ou ce qui dépasse la demande.",
    },
  ],
  right: [
    {
      title: "2. Codeur",
      caption: "Écrit et modifie les fichiers de ton application.",
    },
    {
      title: "4. Réparateur",
      caption: "Boucle sur les erreurs jusqu'à ce que l'application tourne.",
    },
  ],
  footnote:
    "Ailleurs, un seul modèle réfléchit, écrit et corrige. Ici, chaque rôle peut être tenu par un modèle différent — Claude, Gemini ou GLM — le plus fort là où ça compte, le moins cher partout ailleurs.",
};

export interface TimelineStep {
  /** Two-digit index shown in the gradient numeral, e.g. "01". */
  index: string;
  title: string;
  body: string;
}

export interface TimelineContent {
  /** Masthead top line — bright → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — haze → bright half. */
  titleBottom: string;
  steps: TimelineStep[];
}

/**
 * The journey — what the user lives, on the accretion-disc slide: a horizontal
 * rail that scrolls right-to-left across the scene. Cadrage §2, condensed to five
 * stations.
 */
export const timeline: TimelineContent = {
  titleTop: "De la phrase",
  titleBottom: "à l'application.",
  steps: [
    {
      index: "01",
      title: "Tu décris",
      body: "Une seule question : « Que veux-tu construire ? ». Tu réponds en langage ordinaire, en français.",
    },
    {
      index: "02",
      title: "Le plan",
      body: "L'Architecte comprend la demande et pose la structure. Le plan s'écrit sous tes yeux.",
    },
    {
      index: "03",
      title: "Les fichiers",
      body: "Le Codeur écrit ton application fichier par fichier. Le Relecteur refuse ce qui casse ou ce qui dépasse la demande.",
    },
    {
      index: "04",
      title: "L'aperçu",
      body: "À droite, ton application tourne dans un environnement isolé et se rafraîchit toute seule. Le Réparateur boucle jusqu'à ce que ça marche.",
    },
    {
      index: "05",
      title: "Tu ajustes",
      body: "« Mets le bouton en rouge », « ajoute une page de contact » : seuls les morceaux concernés changent. Tu reviens plus tard, tout est là. Tu exportes quand tu es satisfait.",
    },
  ],
};

export interface SitemapChapter {
  number: string;
  title: string;
  subtitle: string;
  target: string;
}

export interface SitemapContent {
  eyebrow: string;
  heading: string;
  ctaLabel: string;
  /** Grouped exactly as the original: one, then two, then two. */
  rows: SitemapChapter[][];
}

/** Dormant alternate (not mounted) — translated so it never leaks English. */
export const sitemap: SitemapContent = {
  eyebrow: "Chapitres",
  heading: "ODORO, en cinq chapitres.",
  ctaLabel: "Être prévenu →",
  rows: [
    [
      {
        number: "01",
        title: "Le parcours",
        subtitle: "De la phrase à l'application",
        target: screens.ROADMAP,
      },
    ],
    [
      {
        number: "02",
        title: "La chaîne",
        subtitle: "Quatre rôles, un après l'autre",
        target: screens.PARTNERS,
      },
      {
        number: "03",
        title: "Le moteur",
        subtitle: "Projet virtuel, exécuteur isolé, compteur",
        target: screens.PRODUCT,
      },
    ],
    [
      {
        number: "04",
        title: "L'aperçu",
        subtitle: "Ton application tourne, isolée",
        target: screens.INVESTORS,
      },
      {
        number: "05",
        title: "Lancement",
        subtitle: "Pas encore ouvert — laisse ton adresse",
        target: screens.SOCIAL,
      },
    ],
  ],
};

export interface BriefPhase {
  num: string;
  kicker: string;
  heading: string;
  body: string;
}

export interface BriefContent {
  chapter: string;
  phases: BriefPhase[];
}

/** Dormant alternate (not mounted) — the engine, cadrage §5. */
export const brief: BriefContent = {
  chapter: "01 · Le moteur",
  phases: [
    {
      num: "01",
      kicker: "Projet virtuel",
      heading: "Tes fichiers vivent dans notre base",
      body: "Versionnés par instantanés, on peut revenir en arrière. Les modifications s'appliquent en différences ciblées — on ne réécrit jamais un fichier entier pour changer une ligne.",
    },
    {
      num: "02",
      kicker: "Exécuteur isolé",
      heading: "Ton code ne tourne jamais chez nous",
      body: "L'aperçu s'exécute dans un environnement isolé, sans accès à nos clés ni à notre base. Le code des utilisateurs est traité comme hostile — c'est la pièce la plus difficile du projet.",
    },
    {
      num: "03",
      kicker: "Compteur",
      heading: "Estimé avant, mesuré après",
      body: "Chaque appel de modèle et chaque minute d'exécution sont écrits dans un grand livre en ajout seul, au micro-dollar. La base est la seule source du solde.",
    },
  ],
};

export interface ImpactMetric {
  value: string;
  suffix?: string;
  label: string;
}

export interface ImpactContent {
  chapter: string;
  heading: string;
  metrics: ImpactMetric[];
  foot: string;
}

/**
 * Dormant alternate (not mounted). The figures describe the ENGINE, never a
 * clientele — ODORO is not launched, so a traction number would be invented.
 */
export const impact: ImpactContent = {
  chapter: "02 · Sous le capot",
  heading: "Ce qui tourne, sans chiffre inventé.",
  metrics: [
    {
      value: "4",
      suffix: " rôles",
      label: "Architecte, Codeur, Relecteur, Réparateur — en chaîne",
    },
    {
      value: "3",
      suffix: " fournisseurs",
      label: "Claude, Gemini et GLM, interchangeables par rôle",
    },
    {
      value: "0",
      suffix: " clé API",
      label: "Jamais demandée à l'utilisateur — les accès sont les nôtres",
    },
  ],
  foot: "Des chiffres du moteur, pas d'une clientèle : ODORO n'est pas encore ouvert.",
};

/**
 * Logo scene (fourth slide) — the same hero composition, reused as the payoff:
 * a two-line mirrored-gradient masthead and a subtitle framing the particle mark
 * as it assembles, with the wait-list form carried onto it.
 */
export interface LogoSceneContent {
  /** Masthead top line — the bright → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — the haze → bright half. */
  titleBottom: string;
  subtitle: string;
  /** The hero's wait-list form, carried onto the closing scene. */
  form: HeroFormContent;
}

export const logoScene: LogoSceneContent = {
  titleTop: "Tout converge",
  titleBottom: "vers ton application.",
  subtitle:
    "ODORO n'est pas encore ouvert. Laisse ton adresse : on te prévient à l'ouverture, et rien d'autre.",
  form: waitlistForm,
};

export interface NavItem {
  label: string;
  target: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface FooterContent {
  wordmark: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
  nav: NavItem[];
  social: SocialLink[];
  copy: string;
}

/**
 * Dormant alternate (not mounted). No social links and no e-mail address: the
 * domain and the handles are not decided (cadrage §11), and a placeholder address
 * would be a promise the product cannot keep.
 */
export const footer: FooterContent = {
  wordmark: "odoro",
  tagline:
    "Décris ton application en français. Repars avec une vraie application web qui fonctionne.",
  ctaLabel: "Être prévenu",
  /* No `/impact` deep-link route exists (see `sectionRoutes`); the form lives on
   * the home route itself. */
  ctaHref: "/",
  nav: [
    { label: "La chaîne", target: screens.SITEMAP },
    { label: "Le parcours", target: screens.ROADMAP },
    { label: "Lancement", target: screens.IMPACT },
  ],
  social: [],
  /* The year and the holder come from `siteConfig`, which is also what the
   * JSON-LD `WebSite` node states — a footer that claims a different year to the
   * structured data is the sort of thing nobody notices for two years. */
  copy: `© ${siteConfig.copyrightYear} ${siteConfig.copyrightHolder} — Tous droits réservés`,
};

export interface HeaderContent {
  wordmark: string;
  navLabel: string;
  ctaLabel: string;
}

/** Dormant alternate (not mounted). */
export const header: HeaderContent = {
  wordmark: "odoro",
  navLabel: "Chapitres",
  ctaLabel: "Être prévenu",
};

export interface MenuContent {
  eyebrow: string;
  ctaLabel: string;
  links: NavItem[];
}

/** Dormant alternate (not mounted). */
export const menu: MenuContent = {
  eyebrow: "Chapitres",
  ctaLabel: "Fermer",
  links: [
    { label: "Accueil", target: screens.HERO },
    { label: "La chaîne", target: screens.SITEMAP },
    { label: "Le parcours", target: screens.ROADMAP },
    { label: "Lancement", target: screens.IMPACT },
  ],
};
