/* Genere par scripts/build-templates.mjs. Ne pas editer a la main. */

/** Un template de site, tel que le catalogue le publie. */
export interface TemplateEntry {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly kind: 'site' | 'starter' | 'library'
  readonly order: number
  readonly stack: readonly string[]
  readonly tags?: readonly string[]
  readonly source?: string
  readonly licence: string
  readonly install?: string
  readonly dev?: string
  readonly preview?: string
}

/** Les templates, deja tries : les sites, le point de depart, la bibliotheque. */
export const TEMPLATES: readonly TemplateEntry[] = [
  {
    "name": "parfum",
    "title": "Maison de parfum",
    "order": 1,
    "kind": "site",
    "description": "Un flacon rendu en direct qui traverse la page au defilement, six ecrans, direction artistique officine. Francais.",
    "stack": [
      "Next 16",
      "three.js",
      "react-spring",
      "Lenis",
      "Tailwind v4"
    ],
    "tags": [
      "vitrine",
      "3d",
      "produit",
      "defilement"
    ],
    "source": "Starter Next 16 de GetLayers, template Artefakt re-habille.",
    "licence": "Unlicense",
    "install": "npm install",
    "dev": "npm run dev",
    "preview": "preview.jpg"
  },
  {
    "name": "helion",
    "title": "Helion",
    "order": 2,
    "kind": "site",
    "description": "Une scene WebGL continue : galaxie, souffle, disque d accretion, puis le sigle assemble en particules.",
    "stack": [
      "Next 16",
      "WebGL",
      "react-spring",
      "Lenis",
      "Tailwind v4"
    ],
    "tags": [
      "landing",
      "webgl",
      "particules",
      "attente"
    ],
    "source": "Template Helion de GetLayers, re-teinte.",
    "licence": "non declaree",
    "install": "npx yarn@1.22.22 install",
    "dev": "npx next dev -p 3001",
    "preview": "preview.jpg"
  },
  {
    "name": "gravity",
    "title": "Gravity",
    "order": 3,
    "kind": "site",
    "description": "Quatre-vingt-seize spheres tombent sous une gravite reelle, se reassemblent en sigle, puis depassent l objectif. Quatre sections en fondu sur une seule horloge.",
    "stack": [
      "Vite",
      "React",
      "WebGL",
      "Motion",
      "Tailwind v4"
    ],
    "tags": [
      "landing",
      "webgl",
      "physique",
      "defilement"
    ],
    "source": "Template Gravity de GetLayers, traduite et re-habillee.",
    "licence": "Unlicense",
    "install": "npm install",
    "dev": "npm run dev",
    "preview": "preview.jpg"
  },
  {
    "name": "starter-next",
    "title": "Point de depart Next",
    "order": 4,
    "kind": "starter",
    "description": "Le socle dont les autres derivent : ressorts partout, texte anime, defilement lisse, grille adaptative en rem.",
    "stack": [
      "Next 16",
      "react-spring",
      "Lenis",
      "Tailwind v4"
    ],
    "tags": [
      "socle",
      "marketing",
      "animation"
    ],
    "source": "next16-claude-starter, par Textura.",
    "licence": "Unlicense",
    "install": "npm install",
    "dev": "npm run dev",
    "preview": "preview.jpg"
  },
  {
    "name": "sections",
    "title": "Sections autonomes",
    "order": 5,
    "kind": "library",
    "description": "Vingt et une sections en HTML autonome — heros, chargeurs, carrousels, cartes — chacune un document complet qui s ouvre sans rien installer.",
    "stack": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "tags": [
      "sections",
      "chargeurs",
      "autonome",
      "sans-build"
    ],
    "source": "Catalogue GetLayers, recupere tel quel.",
    "licence": "non declaree",
    "dev": "Ouvrir index.html",
    "preview": "preview.jpg"
  },
  {
    "name": "altitude",
    "title": "Altitude",
    "order": 6,
    "kind": "site",
    "description": "Agence immobiliere : un plan-sequence de quarante secondes scrube au defilement, une tour detouree en WebGL, et une seule encre baissee a l alpha pour toute la hierarchie.",
    "stack": [
      "Odoro",
      "React",
      "three.js",
      "Lenis",
      "WebGL"
    ],
    "tags": [
      "vitrine",
      "video",
      "defilement",
      "immobilier"
    ],
    "source": "Template ODORO d origine, portee de Next 16 vers le moteur Odoro sans toucher au design.",
    "licence": "Unlicense",
    "install": "npm install",
    "dev": "npm run dev",
    "preview": "preview.jpg"
  },
  {
    "name": "manoir",
    "title": "Manoir",
    "order": 7,
    "kind": "site",
    "description": "Maison d architecte : une visite cinematique ou la video 1080p se scrube au defilement, quatre chapitres epingles, une piece par chapitre. Sans cadre applicatif — du HTML, une feuille, un fichier.",
    "stack": [
      "Odoro",
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "tags": [
      "vitrine",
      "video",
      "defilement",
      "architecture"
    ],
    "source": "Template ODORO d origine, portee de son serveur maison vers le moteur Odoro sans toucher au design.",
    "licence": "Unlicense",
    "install": "npm install",
    "dev": "npm run dev",
    "preview": "preview.jpg"
  }
]
