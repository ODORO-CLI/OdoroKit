/* Genere par scripts/build-registry.ts. Ne pas editer a la main. */

import type { RegistryMeta } from 'odoro/registry'

/** Une entree du registre, sans son code source. */
export type CatalogueEntry = RegistryMeta & { readonly id: string }

/** Tout ce que le registre publie, dans l ordre alphabetique.
 *
 * La documentation en derive sa navigation, ses pages et ses reglages : une
 * liste ecrite a cote deriverait au premier ajout, sans que rien ne casse.
 */
export const CATALOGUE: readonly CatalogueEntry[] = [
  {
    "name": "acid-squares",
    "category": "background",
    "title": "Carres acides",
    "description": "Des carres imbriques qui tournent chacun un peu plus vite que celui qui l enferme, en couleurs acides alternees ; le pavage en repete plusieurs, en contre-phase.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "acid-squares.shader.ts",
        "target": "background/acid-squares.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/AcidSquares.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-lime-400",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse de rotation du carre exterieur, en tours par minute fois dix.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de carres imbriques par cellule. Retrograde a 4 en qualite basse.",
        "min": 2,
        "max": 14,
        "step": 1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de cellules sur la hauteur.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "twist",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Decalage angulaire entre deux carres voisins, en radians.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-lime-400, --o-palette-fuchsia-500",
        "description": "Tokens dont les couleurs sont lues : le fond, puis les deux teintes alternees."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une rotation et une distance par carre imbrique, jusqu a quatorze par fragment ; quatre en qualite basse. La densite ne change pas le cout.",
      "fallback": "gradient"
    },
    "id": "background/acid-squares"
  },
  {
    "name": "ascii-field",
    "category": "background",
    "title": "Champ ASCII",
    "description": "Un champ de bruit en derive lente, echantillonne par cellule et rendu en caracteres de la rampe classique — de l espace au arobase — par densite d encre ; glyphes de cinq par sept dessines par le shader, sans police ni texture.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ascii-field.shader.ts",
        "target": "background/ascii-field.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/AsciiField.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 80,
        "description": "Nombre de caracteres sur la largeur. Borne a deux cents par le shader, a quarante-huit en qualite basse.",
        "min": 10,
        "max": 200,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse de derive du champ.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Echelle du champ. Plus haut, plus de details.",
        "min": 0.5,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "contrast",
        "type": "number",
        "required": false,
        "default": 1.4,
        "description": "Contraste du champ avant quantification. Plus haut, plus d espaces et d arobases, moins de niveaux intermediaires.",
        "min": 0.5,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, l encre, l encre des niveaux les plus hauts."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois octaves de bruit de valeur lues une fois par cellule, et une lecture de bit par fragment ; aucune texture. En qualite basse, les cellules s elargissent.",
      "fallback": "static"
    },
    "id": "background/ascii-field"
  },
  {
    "name": "audio-bars",
    "category": "background",
    "title": "Barres d egaliseur",
    "description": "Des barres verticales qui pulsent comme un analyseur de spectre, sans aucun son : un bruit lisse en temps par barre, une enveloppe qui favorise les graves, un indicateur de crete qui retombe.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "audio-bars.shader.ts",
        "target": "background/audio-bars.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/AudioBars.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "bars",
        "type": "number",
        "required": false,
        "default": 48,
        "description": "Nombre de barres. Borne a quatre-vingt-seize par le shader.",
        "min": 8,
        "max": 96,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse du spectre.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Espace entre barres, en fraction de leur pas.",
        "min": 0,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "segments",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Segments par barre. Zero donne des barres pleines.",
        "min": 0,
        "max": 48,
        "step": 1
      },
      {
        "name": "mirror",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Spectre symetrique autour du milieu du cadre."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues : le fond, le pied des barres, leur sommet et le pic."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux bruits de valeur a une dimension par fragment. En qualite basse, vingt-quatre barres, pour que les segments restent au-dessus de deux pixels.",
      "fallback": "gradient"
    },
    "id": "background/audio-bars"
  },
  {
    "name": "aurora",
    "category": "background",
    "title": "Aurore",
    "description": "Un fond de bruit fractal a deplacement de domaine, colore par la palette du projet.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Aurora.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-600",
      "--o-palette-fuchsia-600",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Vitesse de derive du motif.",
        "min": 0,
        "max": 0.36,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.4,
        "description": "Echelle du bruit. Plus haut, plus fin.",
        "min": 0,
        "max": 7.2,
        "step": 1
      },
      {
        "name": "octaves",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre d octaves. Retrograde a 2 en qualite basse.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-palette-brand-600, --o-palette-fuchsia-600, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un triangle plein ecran et un shader de fragment. Treize kilo-octets compresses ; le rendu se suspend hors du champ.",
      "fallback": "gradient"
    },
    "id": "background/aurora"
  },
  {
    "name": "ballpit",
    "category": "background",
    "title": "Piscine a balles",
    "description": "Des balles colorees qui tombent, rebondissent entre elles et contre le cadre, et que le pointeur repousse ; une seule geometrie instanciee, une physique simple et bornee.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Ballpit.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 80,
        "description": "Nombre de balles. Retrograde a 32 en qualite basse, plafonne a 160.",
        "min": 10,
        "max": 160,
        "step": 10
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.32,
        "description": "Rayon moyen d une balle, en unites de scene ; chaque balle varie autour.",
        "min": 0.15,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "gravity",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Pesanteur. Elle penche lentement d un cote puis de l autre, pour que le tas ne se fige jamais.",
        "min": 0,
        "max": 15,
        "step": 0.5
      },
      {
        "name": "bounce",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Restitution des chocs. A 1, les balles ne perdent rien.",
        "min": 0,
        "max": 0.95,
        "step": 0.05
      },
      {
        "name": "push",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Force avec laquelle le pointeur repousse les balles.",
        "min": 0,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-palette-brand-500, --o-palette-fuchsia-500, --o-palette-sky-400",
        "description": "Tokens des balles, distribues a tour de role. Le fond suit toujours le theme."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Un seul maillage instancie ; les chocs sont testes par paires, en n2 sur au plus 160 balles, avec un pas de temps borne. Le nombre de balles suit la qualite, et le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/ballpit"
  },
  {
    "name": "beams",
    "category": "background",
    "title": "Faisceaux",
    "description": "Des rais de lumiere obliques, deplaces par un bruit.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Beams.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Vitesse de derive.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de rais.",
        "min": 0,
        "max": 27,
        "step": 1
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Inclinaison, en radians.",
        "min": -1.5,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Une rotation de coordonnees et une puissance. Aucune geometrie.",
      "fallback": "gradient"
    },
    "id": "background/beams"
  },
  {
    "name": "blob-morph",
    "category": "background",
    "title": "Forme organique",
    "description": "Une seule forme organique qui respire au centre, son contour deforme par trois harmoniques et un bord frange de bruit fin.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "blob-morph.shader.ts",
        "target": "background/blob-morph.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/BlobMorph.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-300"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.28,
        "description": "Rayon moyen, en hauteurs de cadre.",
        "min": 0.1,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de la respiration.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "wobble",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Amplitude des harmoniques du contour. A zero, un disque.",
        "min": 0,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "fringe",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Largeur de la frange de bruit au bord, et force du halo.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-fuchsia-300",
        "description": "Tokens dont les couleurs sont lues : le fond, le corps, la frange et le halo."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois sinus et deux lectures de bruit par fragment. En qualite basse, la frange ne lit qu une octave.",
      "fallback": "gradient"
    },
    "id": "background/blob-morph"
  },
  {
    "name": "blueprint",
    "category": "background",
    "title": "Plan technique",
    "description": "Un quadrillage clair sur fond profond, avec des croix aux intersections principales. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Blueprint.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-sky-200",
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "cell",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Pas de la maille. Les croix tombent toutes les quatre mailles.",
        "min": 8,
        "max": 64,
        "step": 4
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Opacite des traits, entre 0 et 1.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits et des croix."
      },
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Couleur du fond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre degrades CSS repetes : aucun script, aucun contexte graphique."
    },
    "id": "background/blueprint"
  },
  {
    "name": "bokeh",
    "category": "background",
    "title": "Bokeh",
    "description": "Trois couches de disques flous qui derivent lateralement : plus la couche est proche, plus ses disques sont grands, flous et lents.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "bokeh.shader.ts",
        "target": "background/bokeh.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Bokeh.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-400",
      "--o-palette-rose-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de derive laterale.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de cellules sur le plus petit cote. Retrograde a 4 en qualite basse.",
        "min": 2,
        "max": 12,
        "step": 1
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Largeur du bord flou des disques.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-400, --o-palette-rose-400",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois couches de neuf cellules voisines, un smoothstep par disque, soit vingt-sept evaluations par fragment. En qualite basse, la maille est bornee a quatre.",
      "fallback": "gradient"
    },
    "id": "background/bokeh"
  },
  {
    "name": "bubbles",
    "category": "background",
    "title": "Bulles",
    "description": "Des disques qui montent et fusionnent en col quand ils se rapprochent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Bubbles.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-600"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse de remontee.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de bulles. Borne a seize par le shader.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.09,
        "description": "Rayon de reference.",
        "min": 0.02,
        "max": 0.25,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un champ evalue par bulle, borne a seize. En qualite basse, le nombre est ramene a six.",
      "fallback": "gradient"
    },
    "id": "background/bubbles"
  },
  {
    "name": "caustics",
    "category": "background",
    "title": "Caustiques",
    "description": "Le reseau de lumiere au fond d un bassin, imite par replis successifs.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Caustics.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse du reseau.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Echelle du reseau.",
        "min": 1,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Force de la lumiere.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Cinq iterations de deux fonctions trigonometriques. Aucun bruit, donc aucun echantillonnage de texture.",
      "fallback": "gradient"
    },
    "id": "background/caustics"
  },
  {
    "name": "cells",
    "category": "background",
    "title": "Cellules",
    "description": "Un pavage cellulaire anime, dont les aretes viennent de la seconde distance.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Cells.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-emerald-700",
      "--o-palette-emerald-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Vitesse de derive des germes.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de cellules par cote.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "edge",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Largeur des aretes.",
        "min": 0.01,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Neuf germes evalues par fragment, quelle que soit la densite. En qualite basse, la densite est bornee a cinq.",
      "fallback": "gradient"
    },
    "id": "background/cells"
  },
  {
    "name": "checker",
    "category": "background",
    "title": "Damier",
    "description": "Une alternance de cases subtile, en un seul degrade conique repete. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Checker.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-500"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Cote d une case.",
        "min": 8,
        "max": 96,
        "step": 4
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Opacite des cases pleines, entre 0 et 1.",
        "min": 0.01,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des cases pleines."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade conique repete : aucun script, aucun contexte graphique."
    },
    "id": "background/checker"
  },
  {
    "name": "circuit",
    "category": "background",
    "title": "Circuit imprime",
    "description": "Des pistes tirees tuile par tuile — traits droits et coudes qui se raccordent d eux-memes — avec une pastille a chaque extremite, et des impulsions qui les parcourent a des rythmes decales.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "circuit.shader.ts",
        "target": "background/circuit.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Circuit.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-emerald-400"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Nombre de tuiles sur la hauteur. Borne a quarante par le shader, a six en qualite basse.",
        "min": 2,
        "max": 40,
        "step": 1
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Epaisseur des pistes, en fraction de tuile.",
        "min": 0.02,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse des impulsions.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "pulses",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Part des pistes parcourues a un instant donne. Zero les eteint.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-emerald-400",
        "description": "Tokens dont les couleurs sont lues : le substrat, les pistes et les pastilles, les impulsions."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Cinq hachages de tuile, huit distances et une exponentielle par fragment, sans boucle. En qualite basse, les tuiles s elargissent.",
      "fallback": "static"
    },
    "id": "background/circuit"
  },
  {
    "name": "city-blocks",
    "category": "background",
    "title": "Blocs de ville",
    "description": "Un damier de blocs instancies, vus en isometrie et eclaires, qui s elevent et redescendent en cascade diagonale ; chaque bloc garde une hauteur de base propre et la teinte va des blocs bas aux blocs hauts.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/CityBlocks.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-500",
      "--o-palette-sky-300"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Blocs par cote du damier. Retrograde a dix en qualite basse.",
        "min": 4,
        "max": 30,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de la cascade.",
        "min": 0,
        "max": 3,
        "step": 0.05
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 2.4,
        "description": "Hauteur maximale des blocs, en unites de scene.",
        "min": 0.2,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Espace entre les blocs, en fraction de bloc.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-500, --o-palette-sky-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les blocs bas, les blocs hauts."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Une seule geometrie instanciee, un appel de dessin ; la boucle ne reecrit que les matrices, une par bloc. En qualite basse, le cote tombe a dix, donc les blocs a la moitie. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/city-blocks"
  },
  {
    "name": "click-waves",
    "category": "background",
    "title": "Ondes de clic",
    "description": "Chaque clic emet un anneau qui se propage et s amortit sur un fond faiblement texture ; huit ondes vivent a la fois.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "click-waves.shader.ts",
        "target": "background/click-waves.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/ClickWaves.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-400",
      "--o-palette-sky-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Vitesse de propagation des anneaux.",
        "min": 0.1,
        "max": 1.2,
        "step": 0.05
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 0.09,
        "description": "Largeur d onde des anneaux.",
        "min": 0.02,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "decay",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Vitesse d extinction des ondes.",
        "min": 0.3,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-400, --o-palette-sky-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Huit anneaux et un bruit de valeur par fragment ; chaque clic date une onde dans un tampon circulaire mute en place, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/click-waves"
  },
  {
    "name": "cloud-layer",
    "category": "background",
    "title": "Couches de nuages",
    "description": "Trois couches de bruit fractal seuillees en masses opaques, eclairees par une lecture decalee vers la lumiere, qui derivent en parallaxe.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "cloud-layer.shader.ts",
        "target": "background/cloud-layer.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/CloudLayer.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-slate-400",
      "--o-palette-sky-100"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Vitesse de derive de la couche proche.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Echelle des masses. Plus haut, plus fin.",
        "min": 0.5,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "coverage",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Couverture du ciel, de zero a un.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-slate-400, --o-palette-sky-100",
        "description": "Tokens dont les couleurs sont lues : le fond, l ombre des nuages, leurs sommets."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Six sommes d octaves par fragment : deux par couche, la masse et sa lumiere. En qualite basse, les octaves tombent a trois.",
      "fallback": "gradient"
    },
    "id": "background/cloud-layer"
  },
  {
    "name": "code-rain",
    "category": "background",
    "title": "Pluie de code",
    "description": "Des colonnes de glyphes qui tombent a leur propre vitesse, une tete lumineuse et une trainee qui s eteint ligne par ligne ; les caracteres sont des masques de bits dessines par le shader, sans police ni texture.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "code-rain.shader.ts",
        "target": "background/code-rain.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/CodeRain.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-green-500",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 40,
        "description": "Nombre de colonnes sur la largeur. Borne a cent vingt par le shader, a vingt-quatre en qualite basse.",
        "min": 8,
        "max": 120,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de chute.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "trail",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Longueur de la trainee, en lignes.",
        "min": 1,
        "max": 30,
        "step": 1
      },
      {
        "name": "mutate",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Cadence des changements de glyphe, par seconde. Zero fige les caracteres.",
        "min": 0,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-green-500, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues : le fond, la trainee, la tete."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois hachages, une exponentielle et une lecture de bit par fragment ; aucune texture. En qualite basse, les colonnes s elargissent.",
      "fallback": "static"
    },
    "id": "background/code-rain"
  },
  {
    "name": "color-bends",
    "category": "background",
    "title": "Nappes pliees",
    "description": "Des nappes de couleur epaisses, chacune dans son repere tourne, qui se plient et se croisent en s eclairant la ou elles se recouvrent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "color-bends.shader.ts",
        "target": "background/color-bends.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/ColorBends.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-violet-500"
    ],
    "props": [
      {
        "name": "sheets",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de nappes.",
        "min": 1,
        "max": 5,
        "step": 1
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.16,
        "description": "Epaisseur des nappes, en fraction du cadre.",
        "min": 0.04,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "bend",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Amplitude des pliures.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse du mouvement.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-violet-500",
        "description": "Tokens dont les couleurs sont lues : le fond, la premiere et la derniere nappe."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une rotation et deux sinus par nappe, cinq nappes au plus. En qualite basse, deux nappes restent.",
      "fallback": "gradient"
    },
    "id": "background/color-bends"
  },
  {
    "name": "comet",
    "category": "background",
    "title": "Comete",
    "description": "Une tete vive qui rattrape le curseur avec retard, queue etiree a l oppose de la vitesse de rattrapage, scintillement leger.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "comet.shader.ts",
        "target": "background/comet.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Comet.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-400",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.07,
        "description": "Rayon de la tete.",
        "min": 0.02,
        "max": 0.2,
        "step": 0.01
      },
      {
        "name": "tail",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Longueur de la queue.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "lag",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Retard de la comete : plus haut, plus elle traine.",
        "min": 0.2,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-400, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Une tete et une queue gaussiennes par fragment ; la comete rattrape la position amortie du pointeur et sa queue suit la vitesse de rattrapage, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/comet"
  },
  {
    "name": "constellation",
    "category": "background",
    "title": "Constellation",
    "description": "Des points en errance lente, relies par un segment quand ils sont proches — d autant plus net que la distance est courte — et que le pointeur attire.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Constellation.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 110,
        "description": "Nombre de points. Retrograde a 55 en qualite basse.",
        "min": 20,
        "max": 240,
        "step": 10
      },
      {
        "name": "distance",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Distance en dessous de laquelle deux points sont relies, en unites de scene.",
        "min": 0.3,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "attract",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Force de traction du pointeur. Zero la coupe.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de l errance.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les points, les segments."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Recherche des paires en n carre sur le processeur, tampon de segments prealloue pour toutes les paires et trace sur sa seule plage vivante. Le nombre de points suit la qualite retenue ; le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/constellation"
  },
  {
    "name": "contour",
    "category": "background",
    "title": "Courbes de niveau",
    "description": "Une carte topographique animee, d epaisseur de trait constante.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Contour.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-emerald-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Vitesse du relief.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.2,
        "description": "Echelle du relief.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "levels",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de paliers.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Trois evaluations d un bruit fractal a quatre octaves : la pente est mesuree par difference finie plutot que par fwidth, qui demande une extension en WebGL 1.",
      "fallback": "gradient"
    },
    "id": "background/contour"
  },
  {
    "name": "crosshatch",
    "category": "background",
    "title": "Croisillons",
    "description": "Deux trames diagonales croisees a plus et moins 45 degres. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Crosshatch.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-500"
    ],
    "props": [
      {
        "name": "spacing",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Ecart entre deux traits d une meme trame.",
        "min": 6,
        "max": 48,
        "step": 2
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Opacite des traits, entre 0 et 1.",
        "min": 0.02,
        "max": 0.5,
        "step": 0.02
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux degrades CSS repetes : aucun script, aucun contexte graphique."
    },
    "id": "background/crosshatch"
  },
  {
    "name": "crt-warp",
    "category": "background",
    "title": "Courbure cathodique",
    "description": "Un tube bombe dont les coins sortent du cadre, un verre qui ecarte les teintes pres des bords, une grille d ouverture verticale et une vignette qui respire vers le fond du theme ; derriere, un signal lent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "crt-warp.shader.ts",
        "target": "background/crt-warp.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/CrtWarp.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-500",
      "--o-palette-orange-400"
    ],
    "props": [
      {
        "name": "curve",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Bombement du tube. Zero le rend plat.",
        "min": 0,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "lines",
        "type": "number",
        "required": false,
        "default": 160,
        "description": "Nombre de colonnes de la grille d ouverture sur la largeur. Retrograde a quatre-vingts en qualite basse.",
        "min": 20,
        "max": 400,
        "step": 10
      },
      {
        "name": "aberration",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Ecart des teintes pres des bords. Zero le coupe ; il se coupe aussi en qualite basse.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse du signal affiche.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-500, --o-palette-orange-400",
        "description": "Tokens dont les couleurs sont lues : le tube eteint, la premiere teinte du signal, la seconde."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux lectures du signal — quatre sinus chacune — et une exponentielle par fragment. En qualite basse, la grille s espace et l ecart des teintes se coupe.",
      "fallback": "gradient"
    },
    "id": "background/crt-warp"
  },
  {
    "name": "crystal",
    "category": "background",
    "title": "Cristal",
    "description": "Un prisme a pointes et facettes plates qui tourne ; la refraction est feinte par un fresnel et un degrade lu dans la direction refractee, la dispersion par trois indices, sans environnement.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "crystal.shader.ts",
        "target": "background/crystal.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Crystal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-300",
      "--o-palette-violet-400"
    ],
    "props": [
      {
        "name": "facets",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de faces laterales.",
        "min": 3,
        "max": 12,
        "step": 1
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "dispersion",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Separation des couleurs sur les aretes, entre zero et un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Inclinaison vers le pointeur. Zero la supprime.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-300, --o-palette-violet-400",
        "description": "Tokens du fond, de la teinte basse, de la teinte haute et des reflets."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Quelques dizaines de triangles en deux passes — l arriere puis l avant — et trois refractions par fragment. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/crystal"
  },
  {
    "name": "cubes",
    "category": "background",
    "title": "Cubes",
    "description": "Un champ de cubes instancies qui montent et descendent en vague, la hauteur resolue sur le GPU ; la teinte glisse du creux a la crete.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Cubes.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "grid",
        "type": "number",
        "required": false,
        "default": 18,
        "description": "Cubes par cote. Retrograde a 10 en qualite basse.",
        "min": 6,
        "max": 36,
        "step": 2
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Hauteur de la vague, en cotes de cube.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Vitesse de la vague.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Frequence spatiale : plus haut, plus de cretes dans le champ.",
        "min": 0.2,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 0.2,
        "description": "Espace entre deux cubes, en fraction du pas.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les creux, les cretes."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Une seule geometrie instanciee, la vague est calculee dans le shader de sommets : la boucle n ecrit qu un temps. Le nombre de cubes suit la qualite retenue ; le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/cubes"
  },
  {
    "name": "currents",
    "category": "background",
    "title": "Courants",
    "description": "Des lignes de courant : un bruit fin lu en un point advecte par un champ a grande echelle, etire dans le repere local du flot.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "currents.shader.ts",
        "target": "background/currents.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Currents.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-400",
      "--o-palette-cyan-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.2,
        "description": "Vitesse d advection.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Echelle du bruit. Plus haut, plus fin.",
        "min": 1,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "stretch",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Anisotropie. Plus haut, filaments plus longs.",
        "min": 2,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-400, --o-palette-cyan-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux sommes d octaves par fragment : trois pour le champ d ecoulement, quatre pour le bruit fin. En qualite basse, le bruit fin tombe a deux.",
      "fallback": "gradient"
    },
    "id": "background/currents"
  },
  {
    "name": "cursor-grid",
    "category": "background",
    "title": "Grille au curseur",
    "description": "Une nappe de paves qui s allument autour du pointeur, chacun respirant a sa propre phase, et une trainee plus sourde qui suit le geste avec retard.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "cursor-grid.shader.ts",
        "target": "background/cursor-grid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/CursorGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de cellules sur la hauteur. Borne a quarante-huit par le shader, a dix en qualite basse.",
        "min": 3,
        "max": 48,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.28,
        "description": "Portee de l allumage, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.8,
        "step": 0.01
      },
      {
        "name": "trail",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Force de la trainee laissee par le geste. A zero, seuls les paves vifs s allument.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-sky-400",
        "description": "Tokens dont les couleurs sont lues : le fond, le filet et la trainee, les paves allumes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux distances et trois lissages par fragment ; les deux positions du pointeur sont recopiees dans des tableaux mutes en place, sans rendu React par image. En qualite basse, les paves s elargissent.",
      "fallback": "static"
    },
    "id": "background/cursor-grid"
  },
  {
    "name": "dark-veil",
    "category": "background",
    "title": "Voile sombre",
    "description": "Une etoffe de bruit fractal deforme par lui-meme qui ondule au-dessus de deux lueurs errantes ; la lumiere ne passe que par ses trouees.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "dark-veil.shader.ts",
        "target": "background/dark-veil.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/DarkVeil.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-indigo-950"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de derive du voile.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.8,
        "description": "Echelle des plis. Plus haut, plus fin.",
        "min": 0.5,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "opacity",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Epaisseur du voile. A zero, seule la lueur reste.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-indigo-950",
        "description": "Tokens dont les couleurs sont lues : le fond, la lueur, la teinte du voile."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois sommes d octaves par fragment : deux pour la deformation, une pour la matiere. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/dark-veil"
  },
  {
    "name": "data-stream",
    "category": "background",
    "title": "Flux de donnees",
    "description": "Des segments aux bouts arrondis qui defilent en couloirs horizontaux independants, chacun a son sens et sa vitesse, la tete relevee du cote qui avance.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "data-stream.shader.ts",
        "target": "background/data-stream.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/DataStream.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-blue-500",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "lanes",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Nombre de couloirs sur la hauteur. Borne a quatre-vingts par le shader, a quatorze en qualite basse.",
        "min": 2,
        "max": 80,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse moyenne du defilement ; chaque couloir en tire la sienne.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de cases par unite de largeur. Plus haut, segments plus courts et plus nombreux.",
        "min": 1,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Epaisseur des segments, en fraction de couloir.",
        "min": 0.1,
        "max": 0.9,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-blue-500, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues : le fond, les segments, leur tete."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Cinq hachages, trois seuils et une exponentielle par fragment, sans boucle. En qualite basse, les couloirs s elargissent.",
      "fallback": "static"
    },
    "id": "background/data-stream"
  },
  {
    "name": "dither",
    "category": "background",
    "title": "Tramage",
    "description": "Un degrade anime rendu en tramage ordonne : trois teintes seulement, et une matrice de Bayer qui fait le reste, pixel par pixel.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "dither.shader.ts",
        "target": "background/dither.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Dither.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-indigo-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse du degrade.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "pixel",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Cote d un pixel de trame, en pixels physiques.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.2,
        "description": "Echelle du degrade. Plus haut, plus de plis.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-indigo-500",
        "description": "Tokens dont les couleurs sont lues : les trois teintes du tramage, du fond a la plus claire."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux octaves de bruit de valeur et une matrice de Bayer huit par huit calculee par fragment, sans texture. Le cote du pixel ne change pas le cout.",
      "fallback": "gradient"
    },
    "id": "background/dither"
  },
  {
    "name": "dna-helix",
    "category": "background",
    "title": "Double helice",
    "description": "Deux brins de points opposes d un demi-tour, relies par des barreaux a intervalle regle, qui tournent autour d un axe legerement incline.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/DnaHelix.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-400",
      "--o-palette-rose-400"
    ],
    "props": [
      {
        "name": "turns",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de tours de l helice sur toute sa hauteur.",
        "min": 0.5,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "points",
        "type": "number",
        "required": false,
        "default": 220,
        "description": "Points par brin. Retrograde a quatre-vingt-dix en qualite basse.",
        "min": 30,
        "max": 600,
        "step": 10
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "rungs",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Un barreau tous les combien de points. A zero, les barreaux disparaissent.",
        "min": 0,
        "max": 24,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-400, --o-palette-rose-400",
        "description": "Tokens dont les couleurs sont lues : le fond, le premier brin, le second brin. Les barreaux prennent la moyenne des deux."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Trois appels de dessin, geometrie construite une fois ; la boucle ne touche qu une rotation de groupe. Le nombre de points suit la qualite retenue. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/dna-helix"
  },
  {
    "name": "dot-matrix",
    "category": "background",
    "title": "Trame de points",
    "description": "Une grille de points qui s allume depuis le centre, et s eteint depuis les bords, sur une seule surface.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "dot-matrix.shader.ts",
        "target": "background/dot-matrix.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/DotMatrix.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "reverse",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Sens de la revelation. Le changement relance l animation depuis son debut."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de propagation du front.",
        "min": 0.1,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 42,
        "description": "Nombre de cellules sur le plus petit cote. Retrograde a 28 en qualite basse.",
        "min": 12,
        "max": 90,
        "step": 2
      },
      {
        "name": "dot",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Cote du point, en fraction de la cellule.",
        "min": 0.05,
        "max": 0.9,
        "step": 0.05
      },
      {
        "name": "flicker",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Part de scintillement. Zero pour une trame stable.",
        "min": 0,
        "max": 1,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-fg, --o-theme-muted, --o-theme-bg",
        "description": "Tokens des deux teintes de points, puis du fond."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, a la place du motif fige. Sans elles, le repli reprend la meme trame, immobile."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un triangle plein ecran et un shader de fragment. Le sens de la revelation est un uniforme : l aller et le retour partagent la meme surface, la seule que l arbitre accorde.",
      "fallback": "static"
    },
    "id": "background/dot-matrix"
  },
  {
    "name": "dots",
    "category": "background",
    "title": "Champ de points",
    "description": "Une grille de disques qui respirent, chacun a son rythme.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Dots.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Vitesse de la respiration.",
        "min": 0,
        "max": 3.6,
        "step": 1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de points par largeur.",
        "min": 0,
        "max": 42,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.18,
        "description": "Taille des points, en fraction de la cellule.",
        "min": 0.05,
        "max": 0.45,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "L espace est replie sur lui-meme : le cout ne depend pas du nombre de points.",
      "fallback": "gradient"
    },
    "id": "background/dots"
  },
  {
    "name": "dunes",
    "category": "background",
    "title": "Dunes",
    "description": "Des cretes superposees, sinus plus bruit, empilees du haut vers le bas : chaque couche plus claire et plus lente, en parallaxe.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "dunes.shader.ts",
        "target": "background/dunes.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Dunes.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-orange-600",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.1,
        "description": "Vitesse de derive des couches.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "layers",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de cretes empilees. Retrograde a 3 en qualite basse.",
        "min": 2,
        "max": 6,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Hauteur des ondulations.",
        "min": 0.02,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-orange-600, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un sinus et un bruit 1D par crete, jusqu a six cretes par fragment. En qualite basse, elles tombent a trois.",
      "fallback": "gradient"
    },
    "id": "background/dunes"
  },
  {
    "name": "dust",
    "category": "background",
    "title": "Poussiere",
    "description": "Des grains en suspension sur trois profondeurs, derivant sur une marche brownienne approchee, visibles seulement dans un rai de lumiere oblique qui s evase depuis sa source.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "dust.shader.ts",
        "target": "background/dust.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Dust.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-300",
      "--o-palette-amber-100"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de la derive des grains.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Densite du semis : cellules sur la hauteur de la couche proche.",
        "min": 4,
        "max": 30,
        "step": 1
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": -55,
        "unit": "deg",
        "description": "Inclinaison du rai, en degres.",
        "min": -90,
        "max": 90,
        "step": 5
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 0.22,
        "description": "Demi-largeur du rai, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-300, --o-palette-amber-100",
        "description": "Tokens dont les couleurs sont lues : l ombre, le rai, les grains dans la lumiere."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois couches, neuf cellules par couche et par fragment, une lecture du rai par cellule, plus un bruit de valeur pour l air. En qualite basse, la couche lointaine est retiree.",
      "fallback": "gradient"
    },
    "id": "background/dust"
  },
  {
    "name": "elastic-mesh",
    "category": "background",
    "title": "Maillage elastique",
    "description": "Une nappe quadrillee simulee noeud par noeud : le pointeur la tire vers lui, l onde se propage de proche en proche, et la teinte suit la tension ; des gouttes tombent quand personne ne touche a rien.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/ElasticMesh.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped",
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-violet-400"
    ],
    "props": [
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 26,
        "description": "Noeuds par cote du maillage. Retrograde a seize en qualite basse.",
        "min": 8,
        "max": 48,
        "step": 1
      },
      {
        "name": "pull",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Force de traction du pointeur. A zero, seules les gouttes agitent la nappe.",
        "min": 0,
        "max": 3,
        "step": 0.05
      },
      {
        "name": "springiness",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Raideur de la nappe : plus haut, plus l onde court vite.",
        "min": 0.2,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "drops",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Gouttes par minute. A zero, la nappe ne bouge que sous le pointeur.",
        "min": 0,
        "max": 60,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-violet-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la nappe au repos, la nappe tendue."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. La simulation est lineaire en nombre de noeuds et se paie sur le processeur ; le dessin est un seul appel de segments indexes. Le pas de temps est plafonne a trente millisecondes pour que le schema explicite ne diverge pas. En qualite basse, le cote tombe a seize. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/elastic-mesh"
  },
  {
    "name": "electric-field",
    "category": "background",
    "title": "Champ electrique",
    "description": "Une echelle de Jacob : un arc qui s amorce entre deux electrodes, monte porte par l air chaud et se rompt en haut, son chemin rehache trente fois par seconde pour crepiter.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "electric-field.shader.ts",
        "target": "background/electric-field.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/ElectricField.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-400",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Montees de l arc par seconde.",
        "min": 0.1,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "jitter",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Amplitude du deplacement du chemin.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Portee de la lueur autour du trait.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "branches",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Octaves du deplacement, donc la brisure du chemin. Retrograde a 2 en qualite basse.",
        "min": 1,
        "max": 5,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-400, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois arcs par fragment — le vif et deux fantomes — a quelques octaves de bruit 1D chacun, deux exponentielles par arc. En qualite basse, les octaves tombent a deux.",
      "fallback": "static"
    },
    "id": "background/electric-field"
  },
  {
    "name": "embers",
    "category": "background",
    "title": "Braises",
    "description": "Des braises qui montent sur trois profondeurs, scintillent a leur propre phase et s eteignent avec la hauteur ; une lueur de foyer au bas du cadre.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "embers.shader.ts",
        "target": "background/embers.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Embers.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-orange-500",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de la montee.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Densite du semis : cellules sur la hauteur de la couche proche.",
        "min": 3,
        "max": 24,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Portee du halo doux autour de chaque braise.",
        "min": 0.2,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-orange-500, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues : le fond, le corps des braises, leur pointe chaude."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois couches, neuf cellules par couche et par fragment, deux exponentielles par cellule. En qualite basse, la couche lointaine est retiree.",
      "fallback": "gradient"
    },
    "id": "background/embers"
  },
  {
    "name": "eye-follow",
    "category": "background",
    "title": "Yeux qui suivent",
    "description": "Une grille de grands yeux dessines au trait, dont l iris se tourne vers le curseur ; chacun cligne a son propre rythme, en se refermant sur lui-meme.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "eye-follow.shader.ts",
        "target": "background/eye-follow.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/EyeFollow.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "eyes",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre d yeux sur la hauteur. Borne a dix par le shader.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "gaze",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Amplitude du regard. A zero, les yeux fixent devant eux.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "blink",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Frequence des clignements. A zero, les yeux restent ouverts.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond et l eclat, le trait et la pupille, l iris."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Cinq distances et six lissages par fragment, sans boucle ; le pointeur est recopie dans un tableau mute en place, sans rendu React par image.",
      "fallback": "static"
    },
    "id": "background/eye-follow"
  },
  {
    "name": "faulty-terminal",
    "category": "background",
    "title": "Terminal defaillant",
    "description": "Un ecran de caracteres qui se tape ligne par ligne, curseur clignotant, et qui tombe en panne par a-coups : scintillement, bandes dechirees d un nombre entier de colonnes, cellules corrompues. Glyphes dessines par le shader, sans police.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "faulty-terminal.shader.ts",
        "target": "background/faulty-terminal.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/FaultyTerminal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-500",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 48,
        "description": "Nombre de colonnes sur la largeur. Borne a cent vingt par le shader, a trente-deux en qualite basse.",
        "min": 12,
        "max": 120,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1.5,
        "description": "Vitesse de frappe, en lignes par seconde.",
        "min": 0,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "flicker",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Force du scintillement pendant les pannes. Zero le coupe.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "tearing",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Frequence des pannes, dechirements et corruptions compris. Zero les coupe.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-500, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues : le fond, le phosphore du texte, le curseur et les cellules corrompues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une dizaine de hachages et une lecture de bit par fragment ; aucune texture, aucune boucle. En qualite basse, les colonnes s elargissent.",
      "fallback": "static"
    },
    "id": "background/faulty-terminal"
  },
  {
    "name": "ferrofluid",
    "category": "background",
    "title": "Ferrofluide",
    "description": "Une flaque de fluide magnetique dont les pics se dressent sous le pointeur : un reseau hexagonal de cones qui s aiguisent avec la proximite de l aimant, eclaires par une normale deduite du relief.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ferrofluid.shader.ts",
        "target": "background/ferrofluid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Ferrofluid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "spikes",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de pics par hauteur de cadre.",
        "min": 6,
        "max": 30,
        "step": 1
      },
      {
        "name": "reach",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Portee de l aimant, en hauteurs de cadre.",
        "min": 0.1,
        "max": 0.8,
        "step": 0.01
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Hauteur des pics sous l aimant.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "gloss",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Force du reflet sur le fluide.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le plateau, le fluide, le reflet."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois evaluations du relief par fragment — la hauteur et deux decalages pour la normale — chacune trois cosinus et un bruit. En qualite basse, le bruit du bord de la flaque est supprime.",
      "fallback": "gradient"
    },
    "id": "background/ferrofluid"
  },
  {
    "name": "fire",
    "category": "background",
    "title": "Feu",
    "description": "Des flammes verticales continues : un bruit fractal dont le domaine descend, etire en langues et balance, moins une rampe de la hauteur ; deux seuils doux font le corps et le coeur.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "fire.shader.ts",
        "target": "background/fire.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Fire.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-orange-500",
      "--o-palette-yellow-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de montee.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Hauteur des flammes, en fraction du cadre.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Finesse des langues. Plus haut, plus fin.",
        "min": 1,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-orange-500, --o-palette-yellow-300",
        "description": "Tokens dont les couleurs sont lues : le fond, le corps des flammes, leur coeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux sommes d octaves par fragment, la grande et la fine. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/fire"
  },
  {
    "name": "fireflies",
    "category": "background",
    "title": "Lucioles",
    "description": "Des points repartis par hachage de cellule, chacun clignotant a sa propre phase dans un halo doux.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "fireflies.shader.ts",
        "target": "background/fireflies.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Fireflies.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-300",
      "--o-palette-lime-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Cadence du clignotement et de la derive.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 16,
        "description": "Nombre de cellules sur le plus petit cote. Retrograde a 10 en qualite basse.",
        "min": 6,
        "max": 32,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Portee du halo.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-300, --o-palette-lime-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Neuf cellules voisines evaluees par fragment, un halo exponentiel chacune. En qualite basse, la maille est bornee a dix.",
      "fallback": "gradient"
    },
    "id": "background/fireflies"
  },
  {
    "name": "fireworks",
    "category": "background",
    "title": "Feux d artifice",
    "description": "Un bouquet d etincelles eclate a chaque clic et retombe sous la gravite, positions resolues analytiquement ; six bouquets vivent a la fois, et un bouquet automatique part a intervalle regle.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "fireworks.shader.ts",
        "target": "background/fireworks.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Fireworks.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "sparks",
        "type": "number",
        "required": false,
        "default": 32,
        "description": "Etincelles par bouquet. Retrograde a 14 en qualite basse.",
        "min": 8,
        "max": 48,
        "step": 2
      },
      {
        "name": "gravity",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Force de la retombee.",
        "min": 0,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "decay",
        "type": "number",
        "required": false,
        "default": 1.1,
        "description": "Vitesse d extinction des etincelles.",
        "min": 0.4,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "auto",
        "type": "number",
        "required": false,
        "default": 2.6,
        "unit": "s",
        "description": "Periode des bouquets automatiques, en secondes. Zero les coupe.",
        "min": 0,
        "max": 8,
        "step": 0.2
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues : le ciel, les deux teintes d etincelles melangees par bouquet."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Jusqu a sept bouquets de quarante-huit etincelles par fragment, une exponentielle et un sinus par etincelle ; les bouquets eteints sortent avant la boucle. En qualite basse, quatorze etincelles par bouquet. Chaque clic date un bouquet dans un tampon circulaire mute en place, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/fireworks"
  },
  {
    "name": "floating-lines",
    "category": "background",
    "title": "Lignes flottantes",
    "description": "Des segments courbes fins, de longueur finie, qui derivent en diagonale a des vitesses differentes et se croisent ; leurs halos s additionnent au croisement.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "floating-lines.shader.ts",
        "target": "background/floating-lines.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/FloatingLines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de lignes. Borne a dix par le shader.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de la derive.",
        "min": 0,
        "max": 1.2,
        "step": 0.05
      },
      {
        "name": "length",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Longueur des segments, en hauteurs de cadre.",
        "min": 0.2,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.03,
        "description": "Largeur du halo autour du trait.",
        "min": 0.005,
        "max": 0.1,
        "step": 0.005
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-sky-400",
        "description": "Tokens dont les couleurs sont lues : le fond, le halo, le coeur du trait."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une projection, un sinus et une exponentielle par ligne et par fragment, dix lignes au plus. En qualite basse, quatre lignes.",
      "fallback": "static"
    },
    "id": "background/floating-lines"
  },
  {
    "name": "floating-shapes",
    "category": "background",
    "title": "Formes flottantes",
    "description": "Cinq solides simples, pleins ou en fil de fer, qui derivent et tournent sur eux-memes ; sous le pointeur chacun se decale d une part qui depend de sa profondeur.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/FloatingShapes.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped",
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-purple-400"
    ],
    "props": [
      {
        "name": "shapes",
        "type": "number",
        "required": false,
        "default": 18,
        "description": "Nombre de solides. Retrograde a neuf en qualite basse.",
        "min": 3,
        "max": 40,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de derive et de rotation.",
        "min": 0,
        "max": 3,
        "step": 0.05
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Amplitude de la parallaxe sous le pointeur. A zero, les solides l ignorent.",
        "min": 0,
        "max": 3,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-purple-400",
        "description": "Tokens dont les couleurs sont lues : le fond, les solides pleins, les solides en fil de fer."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Cinq geometries et deux materiaux partages ; un solide de plus ne coute qu un appel de dessin. En qualite basse, le nombre de solides tombe a neuf. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/floating-shapes"
  },
  {
    "name": "flow-field",
    "category": "background",
    "title": "Champ de flux",
    "description": "Des particules qui suivent un champ de bruit sans divergence, tete claire et queue qui s eteint : chaque fragment remonte le champ a contre-courant, rien n est simule ni stocke.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "flow-field.shader.ts",
        "target": "background/flow-field.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/FlowField.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-400",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Frequence du bruit, donc la taille des tourbillons.",
        "min": 1,
        "max": 6,
        "step": 0.25
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse des particules.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Part des cellules qui portent une particule.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "trail",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Longueur de la queue, en pas. Bornee a 5 en qualite basse.",
        "min": 2,
        "max": 16,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-400, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Vingt-quatre pas remontes par fragment, trois lectures de bruit par pas. En qualite basse, dix pas et une queue plus courte.",
      "fallback": "static"
    },
    "id": "background/flow-field"
  },
  {
    "name": "fog-drift",
    "category": "background",
    "title": "Brume basse",
    "description": "Deux nappes de bruit fractal etire en largeur, denses au bas et dissoutes sous une crete bruitee, qui glissent en sens contraires : la parallaxe fait la profondeur.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "fog-drift.shader.ts",
        "target": "background/fog-drift.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/FogDrift.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-sky-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de glissement.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Hauteur de la brume, en fraction du cadre.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Opacite maximale des nappes.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-sky-300",
        "description": "Tokens dont les couleurs sont lues : le fond, la nappe proche, la nappe lointaine."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux sommes d octaves par fragment, une par nappe. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/fog-drift"
  },
  {
    "name": "galaxy-spiral",
    "category": "background",
    "title": "Galaxie spirale",
    "description": "Des bras spiraux de points haches dans un domaine polaire tordu par le logarithme du rayon, en rotation lente autour d un coeur lumineux.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "galaxy-spiral.shader.ts",
        "target": "background/galaxy-spiral.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GalaxySpiral.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-400",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de la rotation d ensemble.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "arms",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de bras.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "twist",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Torsion des bras. Plus haut, plus enroules.",
        "min": 0,
        "max": 8,
        "step": 0.25
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 18,
        "description": "Nombre de cellules radiales de la couche proche.",
        "min": 6,
        "max": 40,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-400, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues : le fond, les bras, le coeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux couches, neuf cellules par couche et par fragment, un logarithme et un cosinus par cellule. En qualite basse, la couche lointaine est retiree.",
      "fallback": "gradient"
    },
    "id": "background/galaxy-spiral"
  },
  {
    "name": "ghost-fibers",
    "category": "background",
    "title": "Fibres fantomes",
    "description": "Des filaments doubles d une brume derivent en travers du cadre et se pincent vers le pointeur au droit du curseur, puis retrouvent leur trace plus loin.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ghost-fibers.shader.ts",
        "target": "background/ghost-fibers.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GhostFibers.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-cyan-300"
    ],
    "props": [
      {
        "name": "fibers",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de fibres. Borne a douze par le shader, a cinq en qualite basse.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "bend",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Force de l attraction vers le pointeur. A zero, les fibres l ignorent.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de derive des fibres.",
        "min": 0,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-cyan-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les fibres au repos, les fibres tirees."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Douze fibres au plus, chacune trois exponentielles par fragment ; le pointeur est recopie dans un tableau mute en place, sans rendu React par image. En qualite basse, le nombre de fibres tombe a cinq.",
      "fallback": "gradient"
    },
    "id": "background/ghost-fibers"
  },
  {
    "name": "glitch-blocks",
    "category": "background",
    "title": "Blocs qui sautent",
    "description": "Un degrade lent dont des blocs se decalent par a-coups, teintes inversees ou ecartees, et des bandes entieres qui sautent d un seul tenant ; tout est hache par paliers, rien ne glisse.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "glitch-blocks.shader.ts",
        "target": "background/glitch-blocks.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GlitchBlocks.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "blocks",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de rangees de blocs sur la hauteur. Borne a quarante par le shader.",
        "min": 2,
        "max": 40,
        "step": 1
      },
      {
        "name": "rate",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Paliers par seconde. Retrograde a trois en qualite basse.",
        "min": 0.5,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "amount",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Part des blocs qui sautent a chaque palier. Zero fige l image.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse du degrade de fond.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la premiere teinte du degrade, la seconde."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois lectures d image — trois sinus chacune — et six hachages par fragment, sans boucle. En qualite basse, la cadence des paliers est bornee a trois.",
      "fallback": "gradient"
    },
    "id": "background/glitch-blocks"
  },
  {
    "name": "globe-mesh",
    "category": "background",
    "title": "Globe filaire",
    "description": "Une boule de points dans une cage d icosaedre qui scintille, et dont les faces s allument sous le pointeur.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "globe-mesh.shader.ts",
        "target": "background/globe-mesh.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GlobeMesh.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-palette-emerald-400",
      "--o-palette-violet-300",
      "--o-palette-sky-400",
      "--o-palette-rose-400"
    ],
    "props": [
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Densite du nuage. Le nombre de points croit au carre : cent points se lisent un par un, plusieurs milliers font une surface.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "spin",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse de rotation propre. Zero laisse un globe qui ne bouge qu au glissement.",
        "min": 0,
        "max": 20,
        "step": 1
      },
      {
        "name": "spinDir",
        "type": "'left' | 'right'",
        "required": false,
        "default": "right",
        "description": "Sens de rotation.",
        "options": [
          "left",
          "right"
        ]
      },
      {
        "name": "detail",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Subdivision de la cage. Chaque cran multiplie les aretes par quatre.",
        "min": 0,
        "max": 3,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "'edge' | 'sweep'",
        "required": false,
        "default": "sweep",
        "description": "L eclat court le long de chaque arete, ou traverse la boule d une bande. Jamais les deux : rien ne resterait assez immobile pour lire l un contre l autre.",
        "options": [
          "edge",
          "sweep"
        ]
      },
      {
        "name": "sweepAngle",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "deg",
        "description": "Direction de la bande, en angle d ecran. 90 la fait descendre, 0 la fait traverser.",
        "min": 0,
        "max": 360,
        "step": 15
      },
      {
        "name": "interactive",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reagit au pointeur : glissement, et faces qui s allument. Neutralise sous mouvement reduit."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string, string, string]",
        "required": false,
        "default": "--o-theme-fg, --o-palette-emerald-400, --o-palette-violet-300, --o-palette-sky-400, --o-palette-rose-400",
        "description": "Tokens des points, de la cage, de l eclat et des deux vagues."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Trois appels de dessin quelle que soit la densite — le rayon, la taille et la couleur de chaque point sont derives dans le shader, et rien n est ecrit par image. Le nombre de points est reduit de moitie en qualite basse.",
      "fallback": "poster"
    },
    "id": "background/globe-mesh"
  },
  {
    "name": "gradient-blinds",
    "category": "background",
    "title": "Stores de degrade",
    "description": "Des lamelles devant un degrade, dont l ouverture suit une vague qui traverse le store d un bord a l autre.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "gradient-blinds.shader.ts",
        "target": "background/gradient-blinds.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GradientBlinds.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-orange-400",
      "--o-palette-rose-500"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de lamelles sur la largeur.",
        "min": 3,
        "max": 40,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de la vague d ouverture.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "open",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Ouverture moyenne, entre ferme et ouvert.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Inclinaison des lamelles.",
        "min": -1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-orange-400, --o-palette-rose-500",
        "description": "Tokens dont les couleurs sont lues : les lamelles, les deux teintes du degrade."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois sinus et deux exponentielles par fragment, sans boucle. En qualite basse, le liseret et l ombre disparaissent.",
      "fallback": "gradient"
    },
    "id": "background/gradient-blinds"
  },
  {
    "name": "gradient-waves",
    "category": "background",
    "title": "Vagues de degrade",
    "description": "Des bandes de degrade repete, sans trait ni marche, deplacees par une houle qui ne se referme jamais.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "gradient-waves.shader.ts",
        "target": "background/gradient-waves.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GradientWaves.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-400",
      "--o-palette-cyan-300"
    ],
    "props": [
      {
        "name": "bands",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de bandes sur la hauteur.",
        "min": 1,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Hauteur de la houle, en fraction du cadre.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de la houle.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "softness",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Largeur des transitions. Bas, les bandes sont franches.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-400, --o-palette-cyan-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les deux teintes des bandes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois sinus et quatre smoothstep par fragment, sans boucle. En qualite basse, une seule harmonique de houle reste.",
      "fallback": "gradient"
    },
    "id": "background/gradient-waves"
  },
  {
    "name": "grainient",
    "category": "background",
    "title": "Degrade granuleux",
    "description": "Des taches de couleur qui derivent lentement, dont les transitions se dissolvent en grain au lieu de s etaler.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "grainient.shader.ts",
        "target": "background/grainient.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Grainient.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-400",
      "--o-palette-orange-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse de derive des taches.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "grain",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Force du grain.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Taille des taches.",
        "min": 0.4,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-400, --o-palette-orange-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les deux teintes des taches."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une exponentielle par tache et un tirage par fragment. En qualite basse, deux taches restent.",
      "fallback": "gradient"
    },
    "id": "background/grainient"
  },
  {
    "name": "graph-paper",
    "category": "background",
    "title": "Papier millimetre",
    "description": "Deux quadrillages emboites, maille fine et maille epaisse toutes les cinq. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/GraphPaper.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-sky-500",
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Pas de la maille fine. La maille epaisse en vaut cinq.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Opacite des traits, entre 0 et 1.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits."
      },
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Couleur du fond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre degrades CSS repetes : aucun script, aucun contexte graphique."
    },
    "id": "background/graph-paper"
  },
  {
    "name": "grid-distortion",
    "category": "background",
    "title": "Grille sous lentille",
    "description": "Un quadrillage lu sur un domaine tire vers le pointeur amorti : sous la lentille les mailles se dilatent et les lignes s epaississent comme sous un verre, avec un bord fin et une ombre qui donne son epaisseur.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "grid-distortion.shader.ts",
        "target": "background/grid-distortion.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GridDistortion.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 16,
        "description": "Nombre de cellules sur la hauteur. Borne a soixante par le shader, a dix en qualite basse.",
        "min": 3,
        "max": 60,
        "step": 1
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Force du grossissement, entre zero et un.",
        "min": 0,
        "max": 0.95,
        "step": 0.05
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Rayon de la lentille, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les lignes, le bord de la lentille et les lignes en son centre."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une distance, une lecture de grille et trois lissages par fragment ; le pointeur est recopie dans un tableau mute en place, sans rendu React par image. En qualite basse, les cellules s elargissent.",
      "fallback": "static"
    },
    "id": "background/grid-distortion"
  },
  {
    "name": "grid-lines",
    "category": "background",
    "title": "Grille",
    "description": "Un quadrillage qui derive, en degrades repetes. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/GridLines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Pas du quadrillage.",
        "min": 0,
        "max": 140,
        "step": 100
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 1,
        "unit": "px",
        "description": "Epaisseur des traits.",
        "min": 0,
        "max": 3,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "s",
        "description": "Duree d un cycle de derive. Zero pour l immobiliser.",
        "min": 0,
        "max": 10,
        "step": 1
      },
      {
        "name": "fade",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Attenue la grille vers les bords."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux degrades repetes et un masque. Aucun contexte graphique, aucun plafond a partager."
    },
    "id": "background/grid-lines"
  },
  {
    "name": "grid-motion",
    "category": "background",
    "title": "Rangees glissantes",
    "description": "Des tuiles arrondies qui defilent par rangees, en sens alternes et chacune a sa vitesse, si bien que deux rangees voisines ne s alignent jamais ; quelques tuiles portent l accent et respirent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "grid-motion.shader.ts",
        "target": "background/grid-motion.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GridMotion.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de rangees sur la hauteur. Borne a quarante par le shader, a six en qualite basse.",
        "min": 2,
        "max": 40,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse du glissement.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Espace entre les tuiles, en fraction de rangee.",
        "min": 0.04,
        "max": 0.5,
        "step": 0.02
      },
      {
        "name": "accent",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Part des tuiles accentuees, entre zero et un.",
        "min": 0,
        "max": 1,
        "step": 0.02
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les tuiles, les tuiles accentuees."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une distance signee et quatre tirages par fragment. En qualite basse, les rangees s elargissent : des coins arrondis petits scintillent a densite de pixels reduite.",
      "fallback": "static"
    },
    "id": "background/grid-motion"
  },
  {
    "name": "grid-scan",
    "category": "background",
    "title": "Grille balayee",
    "description": "Un quadrillage parcouru par une barre lumineuse qui sort du cadre avant de repartir ; chaque cellule franchie s eteint a son rythme, depuis une intensite qui lui est propre.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "grid-scan.shader.ts",
        "target": "background/grid-scan.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/GridScan.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de cellules sur la hauteur. Borne a soixante par le shader, a dix en qualite basse.",
        "min": 3,
        "max": 60,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de la barre.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "trail",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Longueur de la trainee, en cellules.",
        "min": 0.5,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "vertical",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "La barre parcourt la largeur plutot que la hauteur."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues : le fond, les lignes, la barre et les cellules qu elle allume."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une lecture de grille, une exponentielle et un tirage par fragment. En qualite basse, les cellules s elargissent : une grille serree scintille a densite de pixels reduite.",
      "fallback": "static"
    },
    "id": "background/grid-scan"
  },
  {
    "name": "halftone",
    "category": "background",
    "title": "Trame",
    "description": "Un demi-ton dont les points grossissent avec la lumiere, comme en impression.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Halftone.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Vitesse du champ.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 26,
        "description": "Finesse de la trame.",
        "min": 6,
        "max": 60,
        "step": 1
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 0.26,
        "description": "Rotation de la trame, en radians.",
        "min": 0,
        "max": 1.57,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un bruit fractal a trois octaves et une rotation. La finesse ne coute rien.",
      "fallback": "gradient"
    },
    "id": "background/halftone"
  },
  {
    "name": "halo-pulse",
    "category": "background",
    "title": "Halo qui pulse",
    "description": "Un coeur qui respire a un rythme lent et des anneaux gaussiens emis a ce rythme, qui s elargissent et palissent en s eloignant.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "halo-pulse.shader.ts",
        "target": "background/halo-pulse.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/HaloPulse.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-400",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "period",
        "type": "number",
        "required": false,
        "default": 4000,
        "unit": "ms",
        "description": "Periode du rythme.",
        "min": 1000,
        "max": 10000,
        "step": 250
      },
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre d anneaux en vol.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Portee des anneaux, en hauteurs de cadre.",
        "min": 0.2,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale du centre, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position verticale du centre, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-400, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les anneaux, le coeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Au plus six gaussiennes et deux exponentielles par fragment.",
      "fallback": "static"
    },
    "id": "background/halo-pulse"
  },
  {
    "name": "hex",
    "category": "background",
    "title": "Alveoles",
    "description": "Un pavage hexagonal dont chaque alveole pulse a son rythme.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Hex.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-900"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de la pulsation.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre d alveoles par cote.",
        "min": 2,
        "max": 24,
        "step": 1
      },
      {
        "name": "edge",
        "type": "number",
        "required": false,
        "default": 0.04,
        "description": "Adoucissement du bord.",
        "min": 0.005,
        "max": 0.2,
        "step": 0.005
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux repliements et une comparaison. La densite ne change pas le cout.",
      "fallback": "gradient"
    },
    "id": "background/hex"
  },
  {
    "name": "hex-wave",
    "category": "background",
    "title": "Vague hexagonale",
    "description": "Un nid d abeille dont les alveoles s allument en cercles qui s eloignent du pointeur amorti et s eteignent avec la distance ; la vague est evaluee au centre de chaque alveole, qui s allume d un bloc.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "hex-wave.shader.ts",
        "target": "background/hex-wave.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/HexWave.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Alveoles par hauteur de cadre. Borne a quarante par le shader, a six en qualite basse.",
        "min": 2,
        "max": 40,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de la vague.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "spacing",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vagues par hauteur de cadre.",
        "min": 0.5,
        "max": 10,
        "step": 0.5
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Vitesse d extinction avec la distance. Plus bas, la vague va plus loin.",
        "min": 0.2,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues : le fond, les aretes, les alveoles allumees."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux lectures de grille, une distance, un sinus et une exponentielle par fragment ; le pointeur est recopie dans un tableau mute en place, sans rendu React par image. En qualite basse, les alveoles s elargissent.",
      "fallback": "static"
    },
    "id": "background/hex-wave"
  },
  {
    "name": "hologram",
    "category": "background",
    "title": "Hologramme",
    "description": "Une sphere en meridiens et paralleles projetee au-dessus d un socle d anneaux : elle tourne, sa face arriere s efface, une bande de balayage la traverse, et elle scintille et saute par paliers.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "hologram.shader.ts",
        "target": "background/hologram.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Hologram.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-500",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "meridians",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de meridiens.",
        "min": 2,
        "max": 32,
        "step": 1
      },
      {
        "name": "parallels",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de paralleles.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "flicker",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Force du scintillement et des sauts de cote. Zero les coupe.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-500, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues : le fond, les lignes et le socle, la bande de balayage."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Geometrie construite une fois ; la boucle ne touche qu une rotation et trois uniformes. Le nombre de segments par cercle suit la qualite retenue ; le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/hologram"
  },
  {
    "name": "hyperspace",
    "category": "background",
    "title": "Hyperespace",
    "description": "Des etoiles filantes vers la camera depuis un point de fuite, lues en polaire et en logarithme ; les trainees s allongent avec la vitesse.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "hyperspace.shader.ts",
        "target": "background/hyperspace.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Hyperspace.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-300",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse du defilement vers la camera. Les trainees s allongent avec elle.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 64,
        "description": "Nombre de rayons sur un tour, pour la couche proche.",
        "min": 16,
        "max": 140,
        "step": 4
      },
      {
        "name": "stretch",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Allongement des trainees, en plus de celui que donne la vitesse.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-300, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues : le fond, le corps des trainees, leur tete."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois familles de rayons, une cellule evaluee par famille et par fragment : un logarithme et une arc-tangente par pixel. En qualite basse, la troisieme famille est retiree.",
      "fallback": "gradient"
    },
    "id": "background/hyperspace"
  },
  {
    "name": "ink",
    "category": "background",
    "title": "Encre",
    "description": "Chaque clic etend un disque de la couleur suivante depuis le point clique jusqu a recouvrir le cadre : le fond change de couleur par vagues.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ink.shader.ts",
        "target": "background/ink.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Ink.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Vitesse d extension des disques.",
        "min": 0.2,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "feather",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Largeur du bord adouci.",
        "min": 0.01,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-500, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Quatre disques adoucis par fragment ; chaque clic etend la couleur suivante depuis le point clique, tampon mute en place sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/ink"
  },
  {
    "name": "interference",
    "category": "background",
    "title": "Moire",
    "description": "Deux reseaux d anneaux dont les centres orbitent lentement, et les battements de leur produit.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "interference.shader.ts",
        "target": "background/interference.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Interference.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-400",
      "--o-palette-cyan-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse des orbites.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Nombre d anneaux par unite de distance. Retrograde a 14 en qualite basse.",
        "min": 6,
        "max": 60,
        "step": 1
      },
      {
        "name": "separation",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Rayon des orbites, donc ecart des deux centres.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-400, --o-palette-cyan-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux distances et deux sinus par fragment, cout constant. En qualite basse, la frequence est bornee pour eviter le scintillement d echantillonnage.",
      "fallback": "gradient"
    },
    "id": "background/interference"
  },
  {
    "name": "iridescence",
    "category": "background",
    "title": "Iridescence",
    "description": "Une nacre qui ondule doucement : la teinte tourne avec l inclinaison de la surface, deux reflets se posent par addition.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "iridescence.shader.ts",
        "target": "background/iridescence.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Iridescence.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-pink-300",
      "--o-palette-teal-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de l ondulation.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.4,
        "description": "Echelle des ondes. Plus haut, plus serre.",
        "min": 0.4,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "shimmer",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Force des reflets.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "bands",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Tours de teinte sur la hauteur de la surface.",
        "min": 0.5,
        "max": 8,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-pink-300, --o-palette-teal-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les deux teintes de la nacre."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Quatre ondes analytiques et trois puissances par fragment, sans boucle. En qualite basse, deux ondes restent.",
      "fallback": "gradient"
    },
    "id": "background/iridescence"
  },
  {
    "name": "isometric-grid",
    "category": "background",
    "title": "Pave isometrique",
    "description": "Un pavage de cubes vus en isometrie, trois faces a trois ombres, dont les cellules s allument chacune a son rythme.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "isometric-grid.shader.ts",
        "target": "background/isometric-grid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/IsometricGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de l allumage.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de cubes sur la hauteur.",
        "min": 3,
        "max": 16,
        "step": 1
      },
      {
        "name": "lit",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Part des cubes allumes a un instant donne.",
        "min": 0,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, l ombre des faces, l allumage."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une cellule hexagonale evaluee par fragment, un sinus par cube. La densite ne change pas le cout.",
      "fallback": "static"
    },
    "id": "background/isometric-grid"
  },
  {
    "name": "jelly",
    "category": "background",
    "title": "Gelee",
    "description": "Une masse translucide qui tremble la ou on clique : un creux, une onde qui court sur la surface et un balancement de toute la masse, dates par l horloge du moteur.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "jelly.shader.ts",
        "target": "background/jelly.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Jelly.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-lime-500",
      "--o-palette-lime-200"
    ],
    "props": [
      {
        "name": "wobble",
        "type": "number",
        "required": false,
        "default": 0.22,
        "description": "Amplitude du tremblement, en rayons.",
        "min": 0.05,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "stiffness",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Raideur : la frequence des ondes.",
        "min": 2,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "damping",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Amortissement : la vitesse a laquelle un coup s eteint.",
        "min": 0.4,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 8,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-lime-500, --o-palette-lime-200",
        "description": "Tokens du fond, du corps, des reflets."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Trois evaluations de hauteur par sommet — le point et deux voisins pour la normale — a quatre impacts et une lecture de bruit chacune. La subdivision suit la qualite retenue, et le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/jelly"
  },
  {
    "name": "kaleidoscope",
    "category": "background",
    "title": "Kaleidoscope",
    "description": "Un bruit fractal anime, replie en secteurs par modulo puis miroir de l angle : la symetrie vient du repliement, pas du dessin.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "kaleidoscope.shader.ts",
        "target": "background/kaleidoscope.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Kaleidoscope.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-purple-500",
      "--o-palette-pink-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse de rotation et de derive du bruit.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "segments",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de secteurs du repliement.",
        "min": 3,
        "max": 12,
        "step": 1
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Echelle du bruit. Plus haut, plus fin.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-purple-500, --o-palette-pink-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux sommes d octaves par fragment, lues dans le domaine replie. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/kaleidoscope"
  },
  {
    "name": "lava",
    "category": "background",
    "title": "Lave",
    "description": "Des metaballs chaudes et lentes : une somme de champs en 1/d2 seuillee en deux paliers doux, coeur clair et bord sombre.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "lava.shader.ts",
        "target": "background/lava.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Lava.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-red-600",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de derive des centres.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "blobs",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de gouttes. Retrograde a 3 en qualite basse.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "threshold",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Seuil du champ. Plus bas, plus de matiere.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-red-600, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un champ en 1/d2 par goutte, somme par fragment, jusqu a huit gouttes. En qualite basse, elles tombent a trois.",
      "fallback": "gradient"
    },
    "id": "background/lava"
  },
  {
    "name": "lava-lamp",
    "category": "background",
    "title": "Lampe a lave",
    "description": "Des gouttes de cire etirees qui montent et redescendent lentement dans une colonne, chaque goutte prenant sa couleur de sa hauteur, sur une reserve chauffee par le bas.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "lava-lamp.shader.ts",
        "target": "background/lava-lamp.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LavaLamp.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Vitesse de la montee. Une lampe reelle est tres lente.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "drops",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de gouttes. Retrograde a 3 en qualite basse.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "stretch",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Etirement vertical des gouttes. A 1, elles sont rondes.",
        "min": 1,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Lueur de la chauffe, en bas de la colonne.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-fuchsia-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la cire chaude du bas, la cire refroidie du haut."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une somme de huit champs au plus, ponderee pour la couleur, plus un bruit de valeur pour la reserve. Le nombre de gouttes suit la qualite.",
      "fallback": "gradient"
    },
    "id": "background/lava-lamp"
  },
  {
    "name": "led-wall",
    "category": "background",
    "title": "Mur de LED",
    "description": "Une matrice de pastilles arrondies qui affiche un degrade lent echantillonne au centre de chaque pastille — une couleur par diode — avec le boitier visible entre elles, un halo court et une luminance inegale.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "led-wall.shader.ts",
        "target": "background/led-wall.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LedWall.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-rose-500",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "pixels",
        "type": "number",
        "required": false,
        "default": 32,
        "description": "Nombre de pastilles sur la hauteur. Borne a cent vingt par le shader, a vingt en qualite basse.",
        "min": 4,
        "max": 120,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse du degrade.",
        "min": 0,
        "max": 3,
        "step": 0.05
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Espace entre les pastilles, en fraction de pastille.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "bloom",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Poids du halo autour de chaque pastille. Zero l eteint ; il s eteint aussi en qualite basse.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-rose-500, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues : le boitier entre les pastilles, la premiere couleur du degrade, la seconde."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Quatre sinus, une distance signee et une exponentielle par fragment. En qualite basse, les pastilles s elargissent et le halo s eteint.",
      "fallback": "gradient"
    },
    "id": "background/led-wall"
  },
  {
    "name": "lens-flare",
    "category": "background",
    "title": "Reflet d objectif",
    "description": "Une source qui suit le pointeur amorti, sa strie anamorphique, et une chaine de fantomes alignes sur l axe qui la joint au centre du cadre, en teintes alternees.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "lens-flare.shader.ts",
        "target": "background/lens-flare.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LensFlare.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-400",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Intensite globale du reflet.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "ghosts",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de fantomes le long de l axe.",
        "min": 0,
        "max": 6,
        "step": 1
      },
      {
        "name": "streak",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Longueur de la strie anamorphique, en hauteurs de cadre.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-400, --o-palette-sky-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la teinte chaude, la teinte froide."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Quelques exponentielles et au plus six fantomes par fragment. Le pointeur est mute en place, sans rendu React par image.",
      "fallback": "static"
    },
    "id": "background/lens-flare"
  },
  {
    "name": "light-pillar",
    "category": "background",
    "title": "Colonne de lumiere",
    "description": "Une colonne verticale qui respire : un coeur gaussien net, un halo exponentiel sans fin, des stries qui montent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "light-pillar.shader.ts",
        "target": "background/light-pillar.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LightPillar.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-400",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale de l axe, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Largeur du coeur, en fraction de la hauteur.",
        "min": 0.03,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "breath",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de la respiration.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Etendue du halo.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-400, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues : le fond, le halo, le coeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux exponentielles et trois sinus par fragment, sans boucle. En qualite basse, une seule harmonique de stries reste.",
      "fallback": "gradient"
    },
    "id": "background/light-pillar"
  },
  {
    "name": "lightfall",
    "category": "background",
    "title": "Cascade de lumiere",
    "description": "Des gouttes de lumiere qui tombent en colonnes, tete nette et trainee exponentielle, sur trois profondeurs et un rideau qui descend du haut.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "lightfall.shader.ts",
        "target": "background/lightfall.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Lightfall.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-500",
      "--o-palette-cyan-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de chute.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de colonnes sur la hauteur du cadre.",
        "min": 3,
        "max": 24,
        "step": 1
      },
      {
        "name": "length",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Longueur des trainees, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-500, --o-palette-cyan-300",
        "description": "Tokens dont les couleurs sont lues : le fond, le rideau, les gouttes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois profondeurs de gouttes et un bruit pour le rideau, sans boucle. En qualite basse, une seule profondeur reste.",
      "fallback": "gradient"
    },
    "id": "background/lightfall"
  },
  {
    "name": "lightning",
    "category": "background",
    "title": "Eclairs",
    "description": "Un arc intermittent : un chemin deplace par du bruit multi-octave, un trait exponentiel, des rafales tirees du hachage du temps par paliers.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "lightning.shader.ts",
        "target": "background/lightning.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Lightning.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-400",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Cadence des paliers, donc des rafales possibles.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "branches",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Octaves du deplacement du chemin, donc la ramure. Retrograde a 2 en qualite basse.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Portee de la lueur autour du trait.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-400, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Une somme d octaves de bruit 1D par fragment, deux exponentielles pour le trait et la lueur. En qualite basse, les octaves tombent a deux.",
      "fallback": "static"
    },
    "id": "background/lightning"
  },
  {
    "name": "line-waves",
    "category": "background",
    "title": "Lignes en houle",
    "description": "Des lignes horizontales fines, une par bande, deplacees par la meme houle avec un dephasage propre a leur rang : les cretes decalees dessinent une nappe diagonale qui glisse.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "line-waves.shader.ts",
        "target": "background/line-waves.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LineWaves.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Nombre de lignes. Borne a quarante-huit par le shader.",
        "min": 4,
        "max": 48,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Hauteur de la houle, en hauteurs de bande. A un, les lignes se frolent.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de la houle.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.0025,
        "description": "Epaisseur du trait, en fraction de la hauteur du cadre.",
        "min": 0.001,
        "max": 0.01,
        "step": 0.0005
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, l encre des lignes, l eclat des cretes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois bandes evaluees par fragment, quel que soit le nombre de lignes. En qualite basse, les lignes tombent a douze pour limiter le crenelage.",
      "fallback": "static"
    },
    "id": "background/line-waves"
  },
  {
    "name": "liquid-chrome",
    "category": "background",
    "title": "Chrome liquide",
    "description": "Un liquide chrome qui reflechit un studio : ciel clair, sol sombre, horizon dur, en encre sur le fond clair et en lueur sur le sombre.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "liquid-chrome.shader.ts",
        "target": "background/liquid-chrome.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LiquidChrome.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Vitesse du liquide.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Echelle des vagues.",
        "min": 0.4,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "contrast",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Profondeur du sol dans le reflet.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "sheen",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Force de la teinte a l horizon.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-sky-400",
        "description": "Tokens dont les couleurs sont lues : le fond, l encre, la teinte de l horizon."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Cinq vagues analytiques, une reflexion et deux marches par fragment, sans boucle. En qualite basse, trois vagues restent.",
      "fallback": "gradient"
    },
    "id": "background/liquid-chrome"
  },
  {
    "name": "liquid-ether",
    "category": "background",
    "title": "Ether liquide",
    "description": "Un fluide vaporeux que le pointeur pousse : chaque deplacement depose un tourbillon date qui advecte le bruit et y laisse une trace claire, douze depots vivent a la fois.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "liquid-ether.shader.ts",
        "target": "background/liquid-ether.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/LiquidEther.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-cyan-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.1,
        "description": "Vitesse de la derive sans pointeur.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.22,
        "description": "Rayon d un depot, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Force de la poussee sur le bruit.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "life",
        "type": "number",
        "required": false,
        "default": 2.5,
        "unit": "s",
        "description": "Duree de vie d un depot, en secondes.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-cyan-300",
        "description": "Tokens dont les couleurs sont lues : le fond, la vapeur, la trace du pointeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Douze depots sommes puis deux sommes d octaves par fragment ; aucune texture, aucun ping-pong. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/liquid-ether"
  },
  {
    "name": "magnet-grid",
    "category": "background",
    "title": "Grille magnetique",
    "description": "Une grille de points repousses par le curseur — ou attires — d une force en exponentielle de la distance, sans geometrie.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "magnet-grid.shader.ts",
        "target": "background/magnet-grid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/MagnetGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-400",
      "--o-palette-sky-300"
    ],
    "props": [
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 18,
        "description": "Nombre de points par hauteur de cadre.",
        "min": 6,
        "max": 40,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Portee de l aimant, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "force",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Amplitude du decalage des points.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "attract",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Attire les points au lieu de les repousser."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-400, --o-palette-sky-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Neuf cellules evaluees par fragment ; chaque point s ecarte de la position amortie du pointeur dans le shader, sans geometrie ni rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/magnet-grid"
  },
  {
    "name": "magnetic-lines",
    "category": "background",
    "title": "Lignes de champ",
    "description": "Les lignes de champ et les equipotentielles d un dipole, cercles analytiques qui glissent d un pole a l autre ; le pointeur deplace le second pole.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "magnetic-lines.shader.ts",
        "target": "background/magnetic-lines.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/MagneticLines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-rose-400",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "lines",
        "type": "number",
        "required": false,
        "default": 16,
        "description": "Nombre de lignes de champ par tour.",
        "min": 6,
        "max": 40,
        "step": 1
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Demi-distance des poles, en hauteurs de cadre.",
        "min": 0.1,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse de glissement des lignes le long du champ.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "potential",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Dessine aussi les equipotentielles, plus discretes."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-rose-400, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux arcs tangentes et deux logarithmes par fragment, gradients analytiques : aucune derivee d ecran, aucune boucle. Le pole suit la position amortie du pointeur sans rendu React par image.",
      "fallback": "static"
    },
    "id": "background/magnetic-lines"
  },
  {
    "name": "marble",
    "category": "background",
    "title": "Marbre",
    "description": "Des veines de marbre en bruit deforme trois fois, tres lentes, fines et contrastees, relevees d un filet d accent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "marble.shader.ts",
        "target": "background/marble.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Marble.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.03,
        "description": "Vitesse de la deformation. Le marbre bouge a peine.",
        "min": 0,
        "max": 0.2,
        "step": 0.005
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Echelle du motif. Plus haut, plus fin.",
        "min": 0.4,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "veins",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Finesse des veines. Plus haut, plus fines et plus nettes.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "octaves",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Octaves de chaque bruit. Retrograde a 2 en qualite basse.",
        "min": 1,
        "max": 5,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues : la pierre, les veines, le filet d accent."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Trois sommes d octaves enchainees par fragment, chacune deformant le domaine de la suivante. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/marble"
  },
  {
    "name": "maze",
    "category": "background",
    "title": "Labyrinthe",
    "description": "Un labyrinthe de diagonales qui se dessine trait par trait derriere une tete lumineuse, puis se redessine autrement quand le front repasse.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "maze.shader.ts",
        "target": "background/maze.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Maze.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "period",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "s",
        "description": "Duree d un dessin complet, en secondes.",
        "min": 2,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de cellules sur la hauteur.",
        "min": 4,
        "max": 32,
        "step": 1
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.1,
        "description": "Epaisseur des traits, en fraction de la cellule.",
        "min": 0.03,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les traits, la tete qui dessine."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une cellule evaluee par fragment, deux diagonales et un front. La densite ne change pas le cout.",
      "fallback": "static"
    },
    "id": "background/maze"
  },
  {
    "name": "mesh",
    "category": "background",
    "title": "Nappe",
    "description": "Trois taches de couleur qui derivent et se melangent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Mesh.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.2,
        "description": "Vitesse de derive des taches.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Etendue des taches.",
        "min": 0.2,
        "max": 1.2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois evaluations de distance par pixel. Le plus leger des quatre.",
      "fallback": "gradient"
    },
    "id": "background/mesh"
  },
  {
    "name": "mesh-static",
    "category": "background",
    "title": "Nappe figee",
    "description": "Quatre taches de couleur posees aux tiers du cadre, sans shader et sans mouvement.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/MeshStatic.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500",
      "--o-palette-sky-500",
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Intensite des taches, entre 0 et 1.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Rayon du flou. Zero pour des taches nettes.",
        "min": 0,
        "max": 80,
        "step": 4
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la premiere tache."
      },
      {
        "name": "accent",
        "type": "string",
        "required": false,
        "description": "Couleur de la deuxieme tache."
      },
      {
        "name": "tint",
        "type": "string",
        "required": false,
        "description": "Couleur de la troisieme tache."
      },
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Couleur du fond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre degrades radiaux et un flou peints une fois : aucun script, aucun contexte graphique."
    },
    "id": "background/mesh-static"
  },
  {
    "name": "metaballs",
    "category": "background",
    "title": "Metaballs",
    "description": "Des boules de gel qui fusionnent en champ scalaire, eclairees par une normale deduite du champ ; une boule suit le pointeur.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "metaballs.shader.ts",
        "target": "background/metaballs.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Metaballs.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de derive des boules.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de boules libres, sans compter celle du pointeur. Retrograde a 4 en qualite basse.",
        "min": 2,
        "max": 12,
        "step": 1
      },
      {
        "name": "threshold",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Seuil du champ. Plus bas, plus de matiere et des cols plus larges.",
        "min": 0.5,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "gloss",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Force du reflet.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues : le fond, le gel, le reflet."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois sommes de champs par fragment — une pour la matiere, deux pour la normale par differences finies. Le nombre de boules est le seul levier de cout et suit la qualite.",
      "fallback": "gradient"
    },
    "id": "background/metaballs"
  },
  {
    "name": "metallic-paint",
    "category": "background",
    "title": "Peinture metallique",
    "description": "Une plaque brossee et pailletee eclairee par une lampe posee au curseur : bouger le pointeur revient a incliner la plaque, et le reflet balaie les stries.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "metallic-paint.shader.ts",
        "target": "background/metallic-paint.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/MetallicPaint.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "relief",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Profondeur des stries de brossage. Divisee par deux en qualite basse.",
        "min": 0,
        "max": 30,
        "step": 1
      },
      {
        "name": "sheen",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Durete du reflet. Plus haut, plus le reflet est resserre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "flakes",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Densite des paillettes. Coupees en qualite basse.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues : le fond, le metal, le reflet et les paillettes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Six lectures de bruit de valeur par fragment pour le relief et sa normale, plus un reflet speculaire ; le pointeur est recopie dans un tableau mute en place, sans rendu React par image. En qualite basse, le relief est adouci et les paillettes coupees.",
      "fallback": "gradient"
    },
    "id": "background/metallic-paint"
  },
  {
    "name": "molten-metal",
    "category": "background",
    "title": "Metal en fusion",
    "description": "Un bain de metal chaud : une croute qui se fend en veines, une coulee lente en bruit a deplacement de domaine, un coeur qui rayonne.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "molten-metal.shader.ts",
        "target": "background/molten-metal.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/MoltenMetal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-red-600",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Vitesse de la coulee.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.8,
        "description": "Echelle du champ. Plus haut, plus fin.",
        "min": 0.5,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "heat",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Part du bain qui est en fusion.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-red-600, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues : la croute, le metal, le coeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Trois lectures d un champ a deux deplacements de domaine, soit vingt-et-une sommes d octaves par fragment. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/molten-metal"
  },
  {
    "name": "mosaic",
    "category": "background",
    "title": "Mosaique",
    "description": "Un bruit lu au centre de chaque cellule, donc quantifie en carreaux.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Mosaic.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-palette-brand-600",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.05,
        "description": "Vitesse du champ.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 16,
        "description": "Nombre de carreaux par cote.",
        "min": 4,
        "max": 40,
        "step": 1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Largeur du joint.",
        "min": 0,
        "max": 0.25,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un bruit fractal a trois octaves, evalue une fois par carreau et non par pixel.",
      "fallback": "gradient"
    },
    "id": "background/mosaic"
  },
  {
    "name": "nebula",
    "category": "background",
    "title": "Nebuleuse",
    "description": "Des nuages profonds en deux couches de bruit couplees, assombris aux bords.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "nebula.shader.ts",
        "target": "background/nebula.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Nebula.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-rose-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.1,
        "description": "Vitesse de derive des couches.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.2,
        "description": "Echelle du bruit. Plus haut, plus fin.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre d octaves des deux couches. Retrograde a 2 en qualite basse.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-rose-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux sommes d octaves par fragment, la seconde lue en un point deplace par la premiere. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/nebula"
  },
  {
    "name": "neon-grid",
    "category": "background",
    "title": "Grille neon",
    "description": "Un sol quadrille projete en z = 1/y qui defile vers le spectateur, une ligne d horizon en neon, et un soleil dont le bas est decoupe par des bandes qui glissent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "neon-grid.shader.ts",
        "target": "background/neon-grid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/NeonGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de defilement du sol.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "horizon",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Hauteur de l horizon, en fraction du cadre.",
        "min": 0.2,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de lignes de profondeur visibles.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Portee du halo des traits, en cellules de sol.",
        "min": 0.01,
        "max": 0.2,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-500, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues : le fond, le neon, le soleil."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une projection, deux traits et un sinus par fragment, sans boucle ni derivee d ecran.",
      "fallback": "gradient"
    },
    "id": "background/neon-grid"
  },
  {
    "name": "night-drive",
    "category": "background",
    "title": "Route de nuit",
    "description": "Un sol projete en z = 1/y : deux bords qui convergent vers l horizon, un axe en tirets qui defile, et une file de lampadaires qui approchent lentement de loin puis filent en passant, halo, mat et flaque au sol.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "night-drive.shader.ts",
        "target": "background/night-drive.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/NightDrive.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de la route.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Demi-largeur de la route, en unites du monde.",
        "min": 0.3,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "lamps",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de lampadaires par cote. Borne a douze par le shader, a cinq en qualite basse.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Hauteur des lampadaires, en unites du monde.",
        "min": 0.2,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues : le fond, les lignes de la route et les mats, les lampes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Une boucle bornee a douze lampadaires, deux exponentielles et une distance par lampe et par cote. En qualite basse, la file tombe a cinq.",
      "fallback": "gradient"
    },
    "id": "background/night-drive"
  },
  {
    "name": "noise",
    "category": "background",
    "title": "Grain",
    "description": "Un bruit de film statique, genere par un filtre SVG en data-URI. Aucun script apres le rendu.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Noise.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "opacity",
        "type": "number",
        "required": false,
        "default": 0.1,
        "description": "Opacite du grain, entre 0 et 1.",
        "min": 0,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Frequence de base du bruit. Plus haut, plus fin.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "monochrome",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Desature le grain."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un filtre SVG evalue une fois puis mis en cache comme image : aucun script, aucun contexte graphique."
    },
    "id": "background/noise"
  },
  {
    "name": "oil-slick",
    "category": "background",
    "title": "Nappe d essence",
    "description": "Une nappe d essence sur l eau : des franges irisees serrees qui suivent un bruit tordu, entre lesquelles l eau sombre ondule.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "oil-slick.shader.ts",
        "target": "background/oil-slick.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/OilSlick.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Vitesse de derive de la nappe.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.2,
        "description": "Echelle du bruit. Plus haut, plus fin.",
        "min": 0.5,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "fringes",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de tours de teinte sur toute l epaisseur : la densite des franges.",
        "min": 1,
        "max": 14,
        "step": 0.5
      },
      {
        "name": "ripple",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Force des reflets de l eau entre les nappes.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-500, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues : l eau, et les deux teintes entre lesquelles les franges tournent."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois sommes d octaves par fragment — la torsion, l epaisseur, l etendue de la nappe. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/oil-slick"
  },
  {
    "name": "orbit-rings",
    "category": "background",
    "title": "Anneaux orbitaux",
    "description": "Des anneaux de points en orbite inclinee autour d un centre vide, en sens alternes, l ensemble en lente precession ; la teinte glisse de l anneau interieur a l exterieur.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/OrbitRings.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-400"
    ],
    "props": [
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre d anneaux.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "points",
        "type": "number",
        "required": false,
        "default": 320,
        "description": "Points par anneau. Retrograde a 140 en qualite basse.",
        "min": 60,
        "max": 800,
        "step": 20
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vitesse de rotation de l anneau interieur, en tours par minute ; les suivants ralentissent.",
        "min": 0,
        "max": 15,
        "step": 0.5
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Inclinaison de base des anneaux, en radians.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-fuchsia-400",
        "description": "Tokens dont les couleurs sont lues : le fond, l anneau interieur, l anneau exterieur."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Geometrie construite une fois, la boucle ne touche que des rotations. Le nombre de points par anneau suit la qualite retenue ; le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/orbit-rings"
  },
  {
    "name": "orbital-sphere",
    "category": "background",
    "title": "Sphere orbitale",
    "description": "Une sphere de particules repartie par la spirale de Fibonacci, ceinte d anneaux inclines et piquee de noeuds lumineux.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/OrbitalSphere.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-palette-violet-500",
      "--o-palette-violet-300",
      "--o-palette-fuchsia-400"
    ],
    "props": [
      {
        "name": "points",
        "type": "number",
        "required": false,
        "default": 2400,
        "description": "Nombre de points sur la sphere. Retrograde a 900 en qualite basse.",
        "min": 400,
        "max": 6000,
        "step": 200
      },
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre d anneaux inclines.",
        "min": 0,
        "max": 8,
        "step": 1
      },
      {
        "name": "nodes",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de noeuds lumineux.",
        "min": 0,
        "max": 40,
        "step": 2
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-palette-violet-500, --o-palette-violet-300, --o-palette-fuchsia-400",
        "description": "Tokens de la sphere, des anneaux et des noeuds."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Le nombre de points suit la qualite retenue, et le rendu se suspend hors du champ. Aucune boucle propre — ni rAF, ni observateur de taille ou de visibilite : le moteur les porte deja.",
      "fallback": "poster"
    },
    "id": "background/orbital-sphere"
  },
  {
    "name": "oscilloscope",
    "category": "background",
    "title": "Oscilloscope",
    "description": "Un spot qui balaie l ecran de gauche a droite sur une graticule, et un phosphore qui garde sa trace en s eteignant : le signal est fige par balayage, la remanence fait le reste.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "oscilloscope.shader.ts",
        "target": "background/oscilloscope.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Oscilloscope.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-green-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Balayages par seconde.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "decay",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Vitesse d extinction du phosphore. Plus bas, plus de remanence.",
        "min": 0.2,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Periodes du signal dans le cadre.",
        "min": 0.5,
        "max": 8,
        "step": 0.5
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.28,
        "description": "Hauteur du signal, en fraction du cadre.",
        "min": 0.05,
        "max": 0.45,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-green-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la graticule, le phosphore."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Six sinus et deux exponentielles par fragment. En qualite basse, le phosphore s eteint deux fois plus vite : la trace remanente est la partie qui scintille a densite reduite.",
      "fallback": "gradient"
    },
    "id": "background/oscilloscope"
  },
  {
    "name": "particle-field",
    "category": "background",
    "title": "Champ de particules",
    "description": "Un semis de points sur deux profondeurs, en derive lente ; les particules que le pointeur couvre s allument et prennent la teinte d eclat.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "particle-field.shader.ts",
        "target": "background/particle-field.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/ParticleField.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de la derive.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Densite du semis : cellules sur la hauteur de la couche proche.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.22,
        "description": "Rayon de l eclat autour du pointeur, en hauteurs de cadre.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les particules au repos, l eclat sous le pointeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux couches, neuf cellules par couche et par fragment. En qualite basse, la couche lointaine est retiree. Le pointeur est mute en place, sans rendu React par image.",
      "fallback": "static"
    },
    "id": "background/particle-field"
  },
  {
    "name": "particle-sphere",
    "category": "background",
    "title": "Sphere de points",
    "description": "Un nuage de points spherique qui tourne, et que le pointeur souleve : la bosse suit le curseur dans le repere de la sphere, et les points souleves changent de teinte.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "particle-sphere.shader.ts",
        "target": "background/particle-sphere.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/ParticleSphere.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-400",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "points",
        "type": "number",
        "required": false,
        "default": 3000,
        "description": "Nombre de points. Retrograde a 1200 en qualite basse, plafonne a 8000.",
        "min": 500,
        "max": 8000,
        "step": 250
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Taille d un point, en pixels.",
        "min": 1,
        "max": 6,
        "step": 0.5
      },
      {
        "name": "pull",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Hauteur de la bosse sous le pointeur, en rayons.",
        "min": 0,
        "max": 0.8,
        "step": 0.05
      },
      {
        "name": "reach",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Etendue de la bosse, entre zero et un.",
        "min": 0.1,
        "max": 0.9,
        "step": 0.05
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 1.5,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 10,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-400, --o-palette-amber-400",
        "description": "Tokens du fond, des points, des points souleves."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Un sommet par point, une lecture de bruit chacun ; le nombre de points suit la qualite retenue, et le rendu se suspend hors du champ. Le pointeur est ramene dans le repere de la sphere a chaque image, sans rendu React.",
      "fallback": "poster"
    },
    "id": "background/particle-sphere"
  },
  {
    "name": "pixel-blast",
    "category": "background",
    "title": "Explosion de pixels",
    "description": "Chaque clic projette une gerbe de pixels carres, alignes sur une trame, qui retombent sous la gravite ; cinq gerbes vivent a la fois, et une gerbe automatique part a intervalle regle.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "pixel-blast.shader.ts",
        "target": "background/pixel-blast.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/PixelBlast.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-yellow-300"
    ],
    "props": [
      {
        "name": "pixels",
        "type": "number",
        "required": false,
        "default": 40,
        "description": "Pixels de la trame sur la hauteur du cadre.",
        "min": 12,
        "max": 96,
        "step": 4
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Pixels projetes par gerbe. Retrograde a 12 en qualite basse.",
        "min": 6,
        "max": 32,
        "step": 2
      },
      {
        "name": "gravity",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Force de la retombee.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "auto",
        "type": "number",
        "required": false,
        "default": 2.2,
        "unit": "s",
        "description": "Periode des gerbes automatiques, en secondes. Zero les coupe.",
        "min": 0,
        "max": 8,
        "step": 0.2
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-yellow-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les deux teintes de pixels melangees par gerbe."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Jusqu a six gerbes de trente-deux pixels par fragment, une position analytique par pixel ; les gerbes eteintes sortent avant la boucle. En qualite basse, douze pixels par gerbe. Chaque clic date une gerbe dans un tampon circulaire mute en place, sans rendu React par image.",
      "fallback": "static"
    },
    "id": "background/pixel-blast"
  },
  {
    "name": "pixel-sort",
    "category": "background",
    "title": "Tri de pixels",
    "description": "Des bandes de pixels tries qui sortent des zones claires d une image et coulent le long des colonnes a des vitesses inegales, la luminance croissant du haut vers le bas de chaque bande comme le ferait un tri.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "pixel-sort.shader.ts",
        "target": "background/pixel-sort.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/PixelSort.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-500",
      "--o-palette-rose-400"
    ],
    "props": [
      {
        "name": "pixel",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Largeur d une colonne, en pixels physiques. Au moins six en qualite basse.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de segments sur la hauteur d une colonne.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "threshold",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Seuil de luminance au-dessus duquel une bande sort. Un ne laisse rien sortir.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse d ecoulement des bandes.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-500, --o-palette-rose-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la teinte de l image et du bas des bandes, le haut des bandes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux lectures d image a deux octaves de bruit de valeur, et trois hachages par fragment. La largeur des colonnes ne change pas le cout ; en qualite basse elle est portee a six pixels.",
      "fallback": "gradient"
    },
    "id": "background/pixel-sort"
  },
  {
    "name": "pixel-trail",
    "category": "background",
    "title": "Trainee de pixels",
    "description": "Le curseur allume les pixels d une trame grossiere : chaque cellule prend une valeur unique, et s eteint par crans plutot qu en fondu.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "pixel-trail.shader.ts",
        "target": "background/pixel-trail.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/PixelTrail.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-400",
      "--o-palette-pink-300"
    ],
    "props": [
      {
        "name": "pixel",
        "type": "number",
        "required": false,
        "default": 26,
        "description": "Nombre de pixels sur la hauteur. Borne a quatre-vingt-dix par le shader, a dix-huit en qualite basse.",
        "min": 8,
        "max": 90,
        "step": 1
      },
      {
        "name": "life",
        "type": "number",
        "required": false,
        "default": 1,
        "unit": "s",
        "description": "Duree de vie d un pixel allume, en secondes.",
        "min": 0.2,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "levels",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de paliers d extinction. A un, le pixel s eteint d un coup.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-400, --o-palette-pink-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les pixels froids, les pixels frais."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Quatorze comparaisons de cellule par fragment, sans exponentielle ; le tampon de depots est mute en place, sans rendu React par image. En qualite basse, la trame s elargit.",
      "fallback": "static"
    },
    "id": "background/pixel-trail"
  },
  {
    "name": "plasma",
    "category": "background",
    "title": "Plasma",
    "description": "L interference de quatre ondes, dont une radiale qui brise la periodicite.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Plasma.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Vitesse des ondes.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Echelle du motif. Plus grand, plus serre.",
        "min": 0.5,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Quatre sinus par fragment, sans bruit ni boucle : le cout ne varie pas avec les reglages.",
      "fallback": "gradient"
    },
    "id": "background/plasma"
  },
  {
    "name": "plasma-ball",
    "category": "background",
    "title": "Boule plasma",
    "description": "Un globe et ses filaments qui serpentent de l electrode au verre, en coordonnees polaires ; le pointeur pose un doigt sur le verre et attire le filament principal.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "plasma-ball.shader.ts",
        "target": "background/plasma-ball.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/PlasmaBall.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-purple-500",
      "--o-palette-pink-300"
    ],
    "props": [
      {
        "name": "filaments",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de filaments. Retrograde a 4 en qualite basse.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.38,
        "description": "Rayon du globe, en hauteurs de cadre.",
        "min": 0.2,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de derive et d ondulation des filaments.",
        "min": 0,
        "max": 2.5,
        "step": 0.1
      },
      {
        "name": "pull",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Force avec laquelle le pointeur attire le filament principal.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-purple-500, --o-palette-pink-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Jusqu a dix filaments par fragment, deux lectures de bruit 1D et trois exponentielles chacun. En qualite basse, quatre filaments au plus. Le doigt suit la position amortie du pointeur sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/plasma-ball"
  },
  {
    "name": "pollen",
    "category": "background",
    "title": "Pollen",
    "description": "Des grains lents sur deux plans — le lointain net et serre, le proche flou et lache — que le pointeur decale en parallaxe.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "pollen.shader.ts",
        "target": "background/pollen.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Pollen.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-lime-400",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Vitesse de la derive.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 11,
        "description": "Densite du plan lointain : cellules sur la hauteur.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Flou du plan proche. Plus haut, plus large et plus pale.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Amplitude du decalage sous le pointeur. Zero le fige.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-lime-400, --o-palette-amber-300",
        "description": "Tokens dont les couleurs sont lues : le fond, les grains lointains, les grains proches."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux plans, neuf cellules par plan et par fragment. En qualite basse, une seule cellule par plan. Le pointeur est mute en place, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/pollen"
  },
  {
    "name": "prism",
    "category": "background",
    "title": "Prisme",
    "description": "Un faisceau blanc entre par la gauche, traverse un prisme et ressort en eventail, disperse entre deux teintes du projet.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "prism.shader.ts",
        "target": "background/prism.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Prism.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.42,
        "description": "Position horizontale du prisme, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position verticale du prisme, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Ouverture de l eventail, en radians.",
        "min": 0.1,
        "max": 1.4,
        "step": 0.05
      },
      {
        "name": "bands",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de raies dans le spectre.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de la respiration et du scintillement.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues : le fond, le debut et la fin du spectre."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux distances, un triangle et un atan par fragment, sans boucle. En qualite basse, seul l eventail est dessine.",
      "fallback": "gradient"
    },
    "id": "background/prism"
  },
  {
    "name": "prismatic-burst",
    "category": "background",
    "title": "Eclat prismatique",
    "description": "Des rais qui tournent autour d un foyer et changent de teinte sur le tour, traverses par des anneaux qui s eloignent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "prismatic-burst.shader.ts",
        "target": "background/prismatic-burst.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/PrismaticBurst.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale du foyer, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position verticale du foyer, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "spokes",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Nombre de rais sur le tour.",
        "min": 3,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de rotation et des pulsations.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "burst",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Force des anneaux qui partent du foyer.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-500, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues : le fond, les deux teintes des rais."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Cinq sinus de l angle et de la distance, deux exponentielles, sans boucle. En qualite basse, une seule harmonique reste.",
      "fallback": "gradient"
    },
    "id": "background/prismatic-burst"
  },
  {
    "name": "radar",
    "category": "background",
    "title": "Radar",
    "description": "Un balayage circulaire : l age du dernier passage en exponentielle pour la trainee, des anneaux de graduation, des echos qui decroissent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "radar.shader.ts",
        "target": "background/radar.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Radar.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-green-500",
      "--o-palette-green-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de rotation du balayage.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre d anneaux de graduation.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Persistance de la trainee et des echos.",
        "min": 0.2,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-green-500, --o-palette-green-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un repli d angle et une partie fractionnaire par fragment, plus trois echos en exponentielle. En qualite basse, un seul echo reste.",
      "fallback": "static"
    },
    "id": "background/radar"
  },
  {
    "name": "radial-glow",
    "category": "background",
    "title": "Halo",
    "description": "Deux lueurs radiales superposees sur un fond profond, pour asseoir un hero. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/RadialGlow.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Etendue du halo, en fraction du cadre.",
        "min": 0.2,
        "max": 1.6,
        "step": 0.05
      },
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale du halo, entre 0 et 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Position verticale du halo, entre 0 et 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Intensite des lueurs, entre 0 et 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la lueur principale."
      },
      {
        "name": "accent",
        "type": "string",
        "required": false,
        "description": "Couleur de la lueur d accent."
      },
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Couleur du fond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux degrades radiaux peints une fois : aucun script, aucun contexte graphique."
    },
    "id": "background/radial-glow"
  },
  {
    "name": "rain",
    "category": "background",
    "title": "Pluie",
    "description": "Des trainees verticales, une vitesse par colonne.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Rain.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de chute.",
        "min": 0,
        "max": 3,
        "step": 0.05
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 60,
        "description": "Nombre de colonnes.",
        "min": 10,
        "max": 160,
        "step": 1
      },
      {
        "name": "length",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Longueur des trainees.",
        "min": 0.05,
        "max": 1,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Un sinus et deux repliements par fragment. Le nombre de colonnes est gratuit.",
      "fallback": "gradient"
    },
    "id": "background/rain"
  },
  {
    "name": "rays",
    "category": "background",
    "title": "Rayons",
    "description": "Des rais crepusculaires radiaux : un bruit 1D de l angle autour d un foyer reglable, attenue par la distance, au scintillement lent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "rays.shader.ts",
        "target": "background/rays.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Rays.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-orange-500",
      "--o-palette-amber-200"
    ],
    "props": [
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale du foyer, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 0.75,
        "description": "Position verticale du foyer, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de rayons sur le tour.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "softness",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Douceur des rais. Bas, ils sont fins et durs.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-orange-500, --o-palette-amber-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois sinus de l angle et deux exponentielles par fragment, sans aucune boucle. En qualite basse, une seule harmonique reste.",
      "fallback": "gradient"
    },
    "id": "background/rays"
  },
  {
    "name": "ribbons",
    "category": "background",
    "title": "Rubans",
    "description": "Des bandes sinusoidales etagees et dephasees, dont la lumiere decroit avec la distance a leur axe.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ribbons.shader.ts",
        "target": "background/ribbons.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Ribbons.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-400",
      "--o-palette-sky-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de l ondulation.",
        "min": 0,
        "max": 1.2,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de rubans. Retrograde a 4 en qualite basse.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Hauteur de l ondulation, en fraction du cadre.",
        "min": 0,
        "max": 0.25,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-400, --o-palette-sky-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois sinus et deux exponentielles par ruban et par fragment, dix rubans au plus. En qualite basse, le nombre de rubans est borne a quatre.",
      "fallback": "gradient"
    },
    "id": "background/ribbons"
  },
  {
    "name": "rings",
    "category": "background",
    "title": "Anneaux",
    "description": "Des cercles concentriques depuis un point reglable, en un degrade radial repete. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Rings.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-cyan-500"
    ],
    "props": [
      {
        "name": "spacing",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Ecart entre deux anneaux.",
        "min": 8,
        "max": 120,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 1,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale du centre, entre 0 et 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position verticale du centre, entre 0 et 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des anneaux."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade radial repete : aucun script, aucun contexte graphique."
    },
    "id": "background/rings"
  },
  {
    "name": "ripple-grid",
    "category": "background",
    "title": "Grille ondulante",
    "description": "Un quadrillage souleve par une onde radiale.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/RippleGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de l onde.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de mailles.",
        "min": 4,
        "max": 40,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Amplitude du soulevement.",
        "min": 0,
        "max": 0.25,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Un sinus et deux repliements. La densite ne change pas le cout.",
      "fallback": "gradient"
    },
    "id": "background/ripple-grid"
  },
  {
    "name": "ripples",
    "category": "background",
    "title": "Gouttes",
    "description": "Des centres pseudo-aleatoires qui emettent des anneaux amortis, et leurs interferences.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ripples.shader.ts",
        "target": "background/ripples.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Ripples.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-400",
      "--o-palette-teal-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de propagation des anneaux.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "drops",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de gouttes. Retrograde a 3 en qualite basse.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "decay",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Amortissement. Plus haut, plus les anneaux restent pres de leur centre.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-400, --o-palette-teal-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un sinus et une exponentielle par goutte et par fragment, douze gouttes au plus. En qualite basse, le nombre de gouttes est borne a trois.",
      "fallback": "gradient"
    },
    "id": "background/ripples"
  },
  {
    "name": "sand-flow",
    "category": "background",
    "title": "Sable qui coule",
    "description": "Des filets de grains qui tombent sur un tas : une grille fine qui defile, effilochee loin de l axe, et la meme grille immobile sous un profil de bosses.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "sand-flow.shader.ts",
        "target": "background/sand-flow.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/SandFlow.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-500",
      "--o-palette-yellow-200"
    ],
    "props": [
      {
        "name": "streams",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de filets.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "grain",
        "type": "number",
        "required": false,
        "default": 110,
        "description": "Nombre de grains par hauteur de cadre. Retrograde a 70 en qualite basse.",
        "min": 40,
        "max": 220,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de chute.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "heap",
        "type": "number",
        "required": false,
        "default": 0.22,
        "description": "Hauteur du tas, en hauteurs de cadre.",
        "min": 0,
        "max": 0.5,
        "step": 0.02
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-500, --o-palette-yellow-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Jusqu a six filets evalues par fragment pour trouver le plus proche, puis deux grains — un qui tombe, un au repos — a trois hachages chacun. En qualite basse, le grain grossit.",
      "fallback": "gradient"
    },
    "id": "background/sand-flow"
  },
  {
    "name": "scanlines",
    "category": "background",
    "title": "Lignes de balayage",
    "description": "Un ecran cathodique : lignes horizontales, barre qui roule, grain discret et vignette.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "scanlines.shader.ts",
        "target": "background/scanlines.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Scanlines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-green-400",
      "--o-palette-emerald-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de la barre qui roule.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "lines",
        "type": "number",
        "required": false,
        "default": 90,
        "description": "Nombre de lignes sur la hauteur.",
        "min": 30,
        "max": 160,
        "step": 5
      },
      {
        "name": "flicker",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Part du grain anime. Retrograde a 0.15 en qualite basse.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-green-400, --o-palette-emerald-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Quelques fonctions periodiques de y et un hachage par fragment : le moins cher des fonds animes. En qualite basse, le grain est presque coupe.",
      "fallback": "gradient"
    },
    "id": "background/scanlines"
  },
  {
    "name": "seismograph",
    "category": "background",
    "title": "Sismographe",
    "description": "Des traces horizontales sur un papier qui defile ; chaque clic pose un stylet et ecrit une secousse amortie qui s eloigne avec le papier, plus forte sur les traces a sa hauteur. Huit secousses vivent a la fois.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "seismograph.shader.ts",
        "target": "background/seismograph.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Seismograph.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "traces",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de traces. Borne a huit par le shader.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "scroll",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Vitesse du papier, en largeurs de cadre par seconde.",
        "min": 0.02,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "decay",
        "type": "number",
        "required": false,
        "default": 1.5,
        "description": "Vitesse d amortissement des secousses.",
        "min": 0.3,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Force des secousses.",
        "min": 0.2,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-fg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le papier, l encre des traces, l encre fraiche d une secousse."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois evaluations de trace par fragment, huit clics chacune ; chaque clic date une secousse dans un tampon circulaire mute en place, sans rendu React par image. En qualite basse, trois traces.",
      "fallback": "static"
    },
    "id": "background/seismograph"
  },
  {
    "name": "shape-grid",
    "category": "background",
    "title": "Grille de formes",
    "description": "Une grille de petites formes, rond, carre ou triangle selon la cellule, qui tournent chacune a sa vitesse et respirent en decalage.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "shape-grid.shader.ts",
        "target": "background/shape-grid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/ShapeGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de rotation moyenne.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de cellules sur la hauteur.",
        "min": 3,
        "max": 24,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.28,
        "description": "Rayon des formes, en fraction de la cellule.",
        "min": 0.05,
        "max": 0.45,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-sky-400",
        "description": "Tokens dont les couleurs sont lues : le fond, puis les deux teintes entre lesquelles chaque forme se place."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une cellule evaluee par fragment, un champ de distance et une rotation. La densite ne change pas le cout.",
      "fallback": "static"
    },
    "id": "background/shape-grid"
  },
  {
    "name": "silk",
    "category": "background",
    "title": "Soie",
    "description": "Un ecoulement obtenu en deplacant le domaine deux fois de suite.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Silk.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-sky-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Vitesse de l ecoulement.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Echelle du motif.",
        "min": 0.4,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "octaves",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre d octaves du bruit.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Neuf evaluations de bruit fractal par fragment. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/silk"
  },
  {
    "name": "sine-grid",
    "category": "background",
    "title": "Grille sinusoidale",
    "description": "Une grille lue sur un domaine deforme en sinus : chaque noeud decrit une boucle, et une seconde grille tournee de quelques degres pose un moire leger dont les franges glissent lentement.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "sine-grid.shader.ts",
        "target": "background/sine-grid.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/SineGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de cellules sur la hauteur. Borne a quarante par le shader.",
        "min": 3,
        "max": 40,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.18,
        "description": "Course de l oscillation, en cellules.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Vitesse de l oscillation.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "moire",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Poids de la seconde grille, celle du moire. Zero l eteint.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les lignes, les noeuds."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux lectures de grille et quatre sinus par fragment. En qualite basse, la seconde grille s eteint : ses franges scintillent a densite de pixels reduite.",
      "fallback": "static"
    },
    "id": "background/sine-grid"
  },
  {
    "name": "sliced-waves",
    "category": "background",
    "title": "Vague tranchee",
    "description": "Une bande epaisse lue par colonnes : la hauteur est evaluee au centre de chaque tranche, la vague saute de marche en marche et chaque colonne bat a son propre rythme.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "sliced-waves.shader.ts",
        "target": "background/sliced-waves.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/SlicedWaves.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-violet-500",
      "--o-palette-violet-200"
    ],
    "props": [
      {
        "name": "slices",
        "type": "number",
        "required": false,
        "default": 40,
        "description": "Nombre de tranches. Borne a cent vingt par le shader.",
        "min": 6,
        "max": 120,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.22,
        "description": "Hauteur de la vague, en fraction du cadre.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Vitesse de la vague.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 0.28,
        "description": "Epaisseur de la bande, en fraction du cadre.",
        "min": 0.04,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-violet-500, --o-palette-violet-200",
        "description": "Tokens dont les couleurs sont lues : le fond, le corps de la bande, son bord superieur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une tranche evaluee par fragment, trois sinus. En qualite basse, les tranches tombent a vingt pour que le sillon ne scintille pas.",
      "fallback": "gradient"
    },
    "id": "background/sliced-waves"
  },
  {
    "name": "smoke",
    "category": "background",
    "title": "Fumee",
    "description": "Des volutes de bruit fractal advectees par un rotationnel approche, en montee lente.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "smoke.shader.ts",
        "target": "background/smoke.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Smoke.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse du tourbillon.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Echelle du motif. Plus haut, plus fin.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "lift",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Vitesse de la montee.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Cinq sommes d octaves par fragment : quatre pour le rotationnel, une pour la matiere. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/smoke"
  },
  {
    "name": "snow",
    "category": "background",
    "title": "Neige",
    "description": "Trois couches de flocons en halo exponentiel : chute verticale a vitesses etagees, balancement lateral a phase hachee par flocon.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "snow.shader.ts",
        "target": "background/snow.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Snow.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-300",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de chute.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de cellules sur le plus petit cote. Retrograde a 8 en qualite basse.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "drift",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Amplitude du balancement lateral.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-300, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois couches de neuf cellules voisines, un halo exponentiel chacune, soit vingt-sept evaluations par fragment. En qualite basse, la maille est bornee a huit.",
      "fallback": "static"
    },
    "id": "background/snow"
  },
  {
    "name": "soap-film",
    "category": "background",
    "title": "Film de savon",
    "description": "Un film mince qui s ecoule vers le bas, dont l epaisseur fait tourner la teinte entre deux couleurs et ouvre des zones transparentes la ou il s amincit.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "soap-film.shader.ts",
        "target": "background/soap-film.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/SoapFilm.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-400",
      "--o-palette-fuchsia-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse de la derive des epaisseurs.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "drain",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Ecoulement vers le bas. Plus haut, plus les franges glissent.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.5,
        "description": "Echelle du champ d epaisseur. Plus haut, plus fin.",
        "min": 0.5,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "bands",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de tours de teinte sur toute l epaisseur.",
        "min": 1,
        "max": 10,
        "step": 0.5
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-400, --o-palette-fuchsia-400",
        "description": "Tokens dont les couleurs sont lues : le fond vu au travers, et les deux teintes entre lesquelles le film tourne."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Une somme d octaves par fragment pour l epaisseur, puis des cosinus. En qualite basse, les octaves tombent a deux.",
      "fallback": "gradient"
    },
    "id": "background/soap-film"
  },
  {
    "name": "sonar",
    "category": "background",
    "title": "Sonar",
    "description": "Des impulsions concentriques a front raide et traine sombre, emises en continu depuis le pointeur amorti et eteintes avec la distance ; des cercles de portee fixes donnent l echelle.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "sonar.shader.ts",
        "target": "background/sonar.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Sonar.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-emerald-500",
      "--o-palette-emerald-200"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Vitesse de propagation des impulsions.",
        "min": 0.1,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "spacing",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Anneaux par hauteur de cadre.",
        "min": 1,
        "max": 16,
        "step": 0.5
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Vitesse d extinction avec la distance. Plus bas, les anneaux vont plus loin.",
        "min": 0.2,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-emerald-500, --o-palette-emerald-200",
        "description": "Tokens dont les couleurs sont lues : le fond, les anneaux, le front des impulsions."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une distance, deux puissances et deux exponentielles par fragment ; le pointeur est recopie dans un tableau mute en place, sans rendu React par image. En qualite basse, les anneaux s espacent.",
      "fallback": "gradient"
    },
    "id": "background/sonar"
  },
  {
    "name": "spectrum",
    "category": "background",
    "title": "Spectre",
    "description": "Un balayage angulaire de teintes, qui module la palette sans la remplacer.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Spectrum.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Vitesse du balayage.",
        "min": 0,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "turns",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Nombre de tours de roue.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "saturation",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Part de teinte melangee a la palette.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Un arc tangente et trois cosinus. Le plus leger des fonds en shader.",
      "fallback": "gradient"
    },
    "id": "background/spectrum"
  },
  {
    "name": "splash-cursor",
    "category": "background",
    "title": "Eclaboussures",
    "description": "Le pointeur seme des taches de peinture au contour bosselle, tirees entre deux teintes : elles s ouvrent d un coup, se melangent la ou elles se recouvrent, puis se fanent.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "splash-cursor.shader.ts",
        "target": "background/splash-cursor.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/SplashCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-rose-500",
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "life",
        "type": "number",
        "required": false,
        "default": 1.8,
        "unit": "s",
        "description": "Duree de vie d une tache, en secondes.",
        "min": 0.4,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.16,
        "description": "Rayon d une tache, en hauteurs de cadre.",
        "min": 0.04,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "lobes",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Irregularite du contour. A zero, la tache est un disque.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-rose-500, --o-palette-amber-400",
        "description": "Tokens dont les couleurs sont lues : le fond, et les deux teintes de peinture."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Dix taches evaluees par fragment, chacune un sinus d angle et une exponentielle d age ; les depots sont ecrits dans un tampon mute en place, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/splash-cursor"
  },
  {
    "name": "spot-grid",
    "category": "background",
    "title": "Points masques",
    "description": "Une grille de points en degrade repete, estompee vers les bords par un masque radial. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/SpotGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-muted"
    ],
    "props": [
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Pas de la grille.",
        "min": 8,
        "max": 80,
        "step": 4
      },
      {
        "name": "dot",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Rayon d un point.",
        "min": 1,
        "max": 6,
        "step": 0.5
      },
      {
        "name": "vignette",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Force de la vignette, entre 0 et 1. Zero la retire.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade radial repete et un masque : aucun script, aucun contexte graphique."
    },
    "id": "background/spot-grid"
  },
  {
    "name": "stars",
    "category": "background",
    "title": "Etoiles",
    "description": "Un semis a trois profondeurs, qui derive en parallaxe.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Stars.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de la derive.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Densite du semis.",
        "min": 6,
        "max": 60,
        "step": 1
      },
      {
        "name": "twinkle",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Force du scintillement.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois couches, une cellule evaluee par couche. La densite ne change pas le cout.",
      "fallback": "gradient"
    },
    "id": "background/stars"
  },
  {
    "name": "strands",
    "category": "background",
    "title": "Meches",
    "description": "Des brins ancres en bas du cadre, dont le balancement croit avec la hauteur : la racine tient, la pointe suit le courant avec retard, comme des algues.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "strands.shader.ts",
        "target": "background/strands.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Strands.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-700",
      "--o-palette-teal-300"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 18,
        "description": "Nombre de meches. Borne a quarante par le shader.",
        "min": 4,
        "max": 40,
        "step": 1
      },
      {
        "name": "sway",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Amplitude du balancement, en largeurs de colonne.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse du courant.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.006,
        "description": "Epaisseur a la racine, en fraction de la largeur du cadre.",
        "min": 0.002,
        "max": 0.02,
        "step": 0.001
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-700, --o-palette-teal-300",
        "description": "Tokens dont les couleurs sont lues : le fond, le corps des meches, leur pointe."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois colonnes evaluees par fragment, quel que soit le nombre de meches. En qualite basse, dix meches.",
      "fallback": "gradient"
    },
    "id": "background/strands"
  },
  {
    "name": "stripes",
    "category": "background",
    "title": "Rayures",
    "description": "Des bandes diagonales en un seul degrade repete. Aucun contexte graphique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Stripes.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Largeur d une bande.",
        "min": 2,
        "max": 48,
        "step": 1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 22,
        "unit": "px",
        "description": "Ecart entre deux bandes.",
        "min": 0,
        "max": 96,
        "step": 2
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 45,
        "unit": "deg",
        "description": "Inclinaison des bandes.",
        "min": -90,
        "max": 90,
        "step": 5
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des bandes."
      },
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Couleur du fond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade CSS repete : aucun script, aucun contexte graphique."
    },
    "id": "background/stripes"
  },
  {
    "name": "swarm",
    "category": "background",
    "title": "Nuee",
    "description": "Des points qui volent en groupe selon les regles des boids — separation, alignement, cohesion — simules sur le processeur et rendus en un nuage de points ; la nuee s ouvre autour du pointeur.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Swarm.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 240,
        "description": "Nombre de boids. Retrograde a 100 en qualite basse.",
        "min": 40,
        "max": 480,
        "step": 20
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de vol.",
        "min": 0.2,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "avoid",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Rayon d evitement du pointeur, en unites de scene. Zero le coupe.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les boids."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Simulation en n carre sur le processeur, un attribut de position reecrit par image, un seul appel de dessin. Le nombre de boids suit la qualite retenue ; le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/swarm"
  },
  {
    "name": "terrain-wireframe",
    "category": "background",
    "title": "Relief en fil de fer",
    "description": "Une nappe quadrillee en segments dont les cretes, lues dans un bruit decale du temps, defilent vers la camera et s effacent dans un brouillard de la couleur du fond ; une vallee centrale reste plate.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/TerrainWireframe.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-500",
      "--o-palette-teal-200"
    ],
    "props": [
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 80,
        "description": "Colonnes de la nappe ; les rangees en valent la moitie. Retrograde a quarante en qualite basse.",
        "min": 16,
        "max": 160,
        "step": 8
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Vitesse de defilement, en unites de scene par seconde.",
        "min": 0,
        "max": 5,
        "step": 0.1
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Hauteur des cretes, en unites de scene.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "valley",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Largeur de la vallee centrale, entre zero et un. Zero la supprime.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-500, --o-palette-teal-200",
        "description": "Tokens dont les couleurs sont lues : le fond et le brouillard, les lignes, les cretes."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Une geometrie de segments dont seules les hauteurs sont reecrites, deux octaves de bruit par sommet et par image ; en qualite basse, les colonnes tombent a quarante, donc les sommets au quart. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/terrain-wireframe"
  },
  {
    "name": "threads",
    "category": "background",
    "title": "Fils",
    "description": "Un faisceau de courbes fines, d epaisseur constante sur toute leur longueur.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Threads.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-emerald-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de l ondulation.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de fils. Borne a douze par le shader.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.004,
        "description": "Epaisseur des fils.",
        "min": 0.001,
        "max": 0.02,
        "step": 0.001
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Un passage par fil, borne a douze. En qualite basse, le faisceau est ramene a quatre.",
      "fallback": "gradient"
    },
    "id": "background/threads"
  },
  {
    "name": "tiles-flip",
    "category": "background",
    "title": "Tuiles qui se retournent",
    "description": "Une grille de tuiles a deux faces qui se retournent en ondes concentriques autour du pointeur amorti, et retombent a plat des qu il s eloigne.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "tiles-flip.shader.ts",
        "target": "background/tiles-flip.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/TilesFlip.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-teal-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de propagation des ondes.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de tuiles sur la hauteur.",
        "min": 4,
        "max": 30,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Portee des ondes autour du pointeur, en hauteurs de cadre.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-teal-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la face avant, la face arriere."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une tuile evaluee par fragment, un sinus et une distance au pointeur. Le pointeur est mute en place, sans rendu React par image.",
      "fallback": "static"
    },
    "id": "background/tiles-flip"
  },
  {
    "name": "torch",
    "category": "background",
    "title": "Torche",
    "description": "Un voile sombre perce d une lueur amortie qui suit le curseur et revele un motif discret dessous.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "torch.shader.ts",
        "target": "background/torch.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Torch.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-400",
      "--o-palette-orange-200"
    ],
    "props": [
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Rayon de la lueur, en hauteurs de cadre.",
        "min": 0.1,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "softness",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Douceur du bord de la lueur.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "dim",
        "type": "number",
        "required": false,
        "default": 0.85,
        "description": "Opacite du voile hors du faisceau.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-400, --o-palette-orange-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une grille et un bruit de valeur par fragment ; la lueur suit la position amortie du pointeur, mutee en place sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/torch"
  },
  {
    "name": "torus-knot",
    "category": "background",
    "title": "Noeud torique",
    "description": "Un tore noue dessine en fil de fer, double d un solide de la couleur du fond qui masque ses arretes de dos, et parcouru d impulsions qui suivent sa courbe guide.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/TorusKnot.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-emerald-400",
      "--o-palette-lime-400"
    ],
    "props": [
      {
        "name": "p",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de tours autour de l axe de revolution.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "q",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de tours autour du coeur du tore.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "tube",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Epaisseur du tube, en unites de scene.",
        "min": 0.05,
        "max": 0.6,
        "step": 0.01
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vitesse de rotation, en tours par minute.",
        "min": 0,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "pulses",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre d impulsions qui courent le long du noeud.",
        "min": 0,
        "max": 16,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-emerald-400, --o-palette-lime-400",
        "description": "Tokens dont les couleurs sont lues : le fond et le solide masquant, le fil de fer, les impulsions."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Geometrie construite une fois ; la boucle ne touche qu une rotation et la position des impulsions. Le nombre de segments le long du tube suit la qualite retenue. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/torus-knot"
  },
  {
    "name": "triangles",
    "category": "background",
    "title": "Triangulation",
    "description": "Un pavage de facettes triangulaires, diagonales alternees en damier, dont l eclairage compose une respiration propre a chaque facette et un balayage qui traverse le pavage ; les plus vives prennent une teinte.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "triangles.shader.ts",
        "target": "background/triangles.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Triangles.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-line",
      "--o-palette-violet-500"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 7,
        "description": "Nombre de cases sur la hauteur. Borne a quarante par le shader, a six en qualite basse.",
        "min": 2,
        "max": 40,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse de l eclairage.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "contrast",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Ecart entre facettes sombres et claires.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "tint",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Poids de la teinte sur les facettes les plus vives. Zero l eteint.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-line, --o-palette-violet-500",
        "description": "Tokens dont les couleurs sont lues : le fond et les joints, les facettes eclairees, la teinte des plus vives."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux sinus, une puissance et un tirage par fragment. En qualite basse, les cases s elargissent : des joints fins scintillent a densite de pixels reduite.",
      "fallback": "static"
    },
    "id": "background/triangles"
  },
  {
    "name": "truchet",
    "category": "background",
    "title": "Truchet",
    "description": "Des tuiles de Truchet a deux arcs qui pivotent d un quart de tour en cascade diagonale ; chaque arc garde sa couleur et le dessin se recompose.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "truchet.shader.ts",
        "target": "background/truchet.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Truchet.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-teal-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Cadence des pivots : periodes par seconde.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de tuiles sur la hauteur.",
        "min": 3,
        "max": 20,
        "step": 1
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.09,
        "description": "Epaisseur des arcs, en fraction de la tuile.",
        "min": 0.02,
        "max": 0.25,
        "step": 0.01
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Retard d une tuile sur sa voisine en diagonale, en periodes. Zero fait pivoter tout le pavage d un coup.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-teal-400",
        "description": "Tokens dont les couleurs sont lues : le fond, le premier arc, le second arc."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une tuile evaluee par fragment, deux arcs et une rotation. La densite ne change pas le cout.",
      "fallback": "static"
    },
    "id": "background/truchet"
  },
  {
    "name": "tunnel",
    "category": "background",
    "title": "Tunnel",
    "description": "Une perspective obtenue en posant z = 1/r, sans camera ni matrice.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Tunnel.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse d avancee.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Espacement des anneaux.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "segments",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de secteurs.",
        "min": 3,
        "max": 40,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une division, un arc tangente, deux repliements. Rien ne depend des reglages.",
      "fallback": "gradient"
    },
    "id": "background/tunnel"
  },
  {
    "name": "tv-static",
    "category": "background",
    "title": "Parasites",
    "description": "La neige d un televiseur : un bruit blanc hache par paliers de temps, des bandes sombres qui defilent, une teinte dosable.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "tv-static.shader.ts",
        "target": "background/tv-static.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/TvStatic.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-indigo-300",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "fps",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Cadence des paliers de tirage. Retrograde a 8 en qualite basse.",
        "min": 4,
        "max": 30,
        "step": 1
      },
      {
        "name": "banding",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Profondeur des bandes sombres.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "tint",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Dosage de la teinte. Zero, l image reste grise.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-indigo-300, --o-theme-fg",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Un hachage et deux sinus par fragment, sans boucle ni octave. En qualite basse, la cadence des paliers est bornee a huit.",
      "fallback": "static"
    },
    "id": "background/tv-static"
  },
  {
    "name": "underwater",
    "category": "background",
    "title": "Sous l eau",
    "description": "Des rais de lumiere qui convergent vers la surface, se balancent et s eteignent avec la profondeur, et des bulles qui montent par colonnes, anneau fin et point de reflet.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "underwater.shader.ts",
        "target": "background/underwater.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Underwater.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-300",
      "--o-palette-sky-600"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse du balancement et de la montee.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "rays",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de rais sur la largeur.",
        "min": 2,
        "max": 16,
        "step": 1
      },
      {
        "name": "bubbles",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de colonnes de bulles sur la hauteur. Zero les supprime.",
        "min": 0,
        "max": 20,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-300, --o-palette-sky-600",
        "description": "Tokens dont les couleurs sont lues : le fond, la lumiere, la profondeur."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Quatre sinus pour les rais et deux profondeurs de bulles par fragment, sans boucle.",
      "fallback": "gradient"
    },
    "id": "background/underwater"
  },
  {
    "name": "veil-parallax",
    "category": "background",
    "title": "Nappes parallaxes",
    "description": "Trois nappes de bruit fractal qui glissent chacune d un facteur different selon la position amortie du curseur, avec une derive lente sans pointeur.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "veil-parallax.shader.ts",
        "target": "background/veil-parallax.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/VeilParallax.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-purple-400",
      "--o-palette-pink-300"
    ],
    "props": [
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Amplitude de la parallaxe.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Vitesse de la derive automatique.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Echelle du bruit. Plus haut, plus fin.",
        "min": 0.5,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-purple-400, --o-palette-pink-300",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Trois sommes de trois octaves par fragment ; la parallaxe lit la position amortie du pointeur et la derive continue sans lui, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/veil-parallax"
  },
  {
    "name": "vhs-tracking",
    "category": "background",
    "title": "Tracking VHS",
    "description": "Une cassette mal alignee : une bande de tracking qui roule et decale les lignes qu elle traverse en y semant des stries, deux teintes lues a des positions ecartees qui sautent par rafales, et la commutation des tetes au bas de l image.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "vhs-tracking.shader.ts",
        "target": "background/vhs-tracking.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/VhsTracking.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de la bande de tracking.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "band",
        "type": "number",
        "required": false,
        "default": 0.14,
        "description": "Hauteur de la bande, en fraction de l image.",
        "min": 0.02,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "split",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Ecart des teintes. Zero le coupe ; il se coupe aussi en qualite basse.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "noise",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Quantite de stries dans la bande.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-500, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la premiere teinte du signal, la seconde et les stries."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Deux lectures du signal — trois sinus chacune — et une dizaine de hachages par fragment, sans boucle. En qualite basse, l ecart des teintes se coupe.",
      "fallback": "gradient"
    },
    "id": "background/vhs-tracking"
  },
  {
    "name": "volumetric-rays",
    "category": "background",
    "title": "Rayons volumetriques",
    "description": "Des rais de lumiere integres par une marche vers le foyer a travers une brume qui derive : un banc epais les eteint, la brume locale les diffuse.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "volumetric-rays.shader.ts",
        "target": "background/volumetric-rays.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/VolumetricRays.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-amber-300",
      "--o-palette-orange-500"
    ],
    "props": [
      {
        "name": "x",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Position horizontale du foyer, en fraction du cadre.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "y",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Position verticale du foyer, en fraction du cadre.",
        "min": 0,
        "max": 1.2,
        "step": 0.05
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Nombre de rais sur le tour.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Intensite de la lumiere.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-amber-300, --o-palette-orange-500",
        "description": "Tokens dont les couleurs sont lues : le fond, la lumiere, la brume."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "ogl",
      "notes": "Une marche de douze pas vers le foyer, chacun lisant deux octaves de brume, plus une lecture locale. En qualite basse, la marche tombe a cinq pas.",
      "fallback": "gradient"
    },
    "id": "background/volumetric-rays"
  },
  {
    "name": "voronoi",
    "category": "background",
    "title": "Voronoi",
    "description": "Des cellules de Voronoi dont les germes derivent, aux aretes exactes tracees en neon et aux germes visibles ; chaque cellule porte sa propre nuance.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "voronoi.shader.ts",
        "target": "background/voronoi.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Voronoi.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-cyan-400",
      "--o-palette-violet-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse de derive des germes.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de cellules sur la hauteur.",
        "min": 2,
        "max": 14,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Portee du halo des aretes, en cellules.",
        "min": 0.01,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-cyan-400, --o-palette-violet-500",
        "description": "Tokens dont les couleurs sont lues : le fond, les aretes, la teinte des cellules."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Deux passes par fragment : neuf cellules pour le germe le plus proche, puis vingt-cinq pour la distance exacte a l arete. En qualite basse, la seconde passe se limite a neuf cellules.",
      "fallback": "gradient"
    },
    "id": "background/voronoi"
  },
  {
    "name": "vortex",
    "category": "background",
    "title": "Vortex",
    "description": "Une spirale obtenue en ajoutant a l angle une quantite qui decroit avec le rayon.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Vortex.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-600",
      "--o-palette-amber-300"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse de rotation.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "arms",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de bras.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "twist",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Force de l enroulement.",
        "min": 0,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Un arc tangente et un sinus par fragment. Le nombre de bras ne coute rien.",
      "fallback": "gradient"
    },
    "id": "background/vortex"
  },
  {
    "name": "wake",
    "category": "background",
    "title": "Sillage",
    "description": "Le curseur laisse une trainee de halos dates qui s eteignent avec l age ; seize depots vivent a la fois.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "wake.shader.ts",
        "target": "background/wake.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Wake.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-teal-400",
      "--o-palette-emerald-200"
    ],
    "props": [
      {
        "name": "life",
        "type": "number",
        "required": false,
        "default": 1.2,
        "description": "Duree de vie d un depot, en secondes.",
        "min": 0.2,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 0.08,
        "description": "Rayon des halos de la trainee.",
        "min": 0.02,
        "max": 0.25,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-teal-400, --o-palette-emerald-200",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Seize halos gaussiens par fragment ; la trainee echantillonne le pointeur dans la boucle du moteur, un depot toutes les 40 ms quand il bouge, sans rendu React par image.",
      "fallback": "gradient"
    },
    "id": "background/wake"
  },
  {
    "name": "warp",
    "category": "background",
    "title": "Hyperespace",
    "description": "Des etoiles etirees radialement depuis le centre, sur trois profondeurs a trois vitesses.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "warp.shader.ts",
        "target": "background/warp.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Warp.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-blue-300",
      "--o-palette-violet-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Vitesse du defilement radial.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 24,
        "description": "Nombre de couloirs angulaires de la premiere couche.",
        "min": 8,
        "max": 48,
        "step": 2
      },
      {
        "name": "stretch",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Longueur des trainees.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-blue-300, --o-palette-violet-400",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Trois couches polaires par fragment, un hachage et une puissance chacune. En qualite basse, la couche la plus lointaine est retiree.",
      "fallback": "gradient"
    },
    "id": "background/warp"
  },
  {
    "name": "water-surface",
    "category": "background",
    "title": "Surface d eau",
    "description": "Une nappe de vagues de Gerstner vue en rasant : de face l eau, au ras le ciel, et le soleil qui scintille sur des ridules de bruit. Le pointeur fait glisser la camera.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "water-surface.shader.ts",
        "target": "background/water-surface.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/WaterSurface.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-sky-600",
      "--o-palette-sky-200"
    ],
    "props": [
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Hauteur de la vague principale, en unites de scene.",
        "min": 0.02,
        "max": 0.3,
        "step": 0.01
      },
      {
        "name": "wavelength",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Longueur de la vague principale, en unites de scene.",
        "min": 0.5,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "choppiness",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Pincement des cretes, entre zero et un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse des vagues.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "sun",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Intensite du soleil sur l eau.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Glissement de la camera sous le pointeur. Zero la fige.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-sky-600, --o-palette-sky-200",
        "description": "Tokens du fond et de la brume, de l eau, du ciel reflechi."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Quatre vagues par sommet, trois lectures de bruit par fragment pour les ridules. La subdivision de la nappe suit la qualite retenue, et le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/water-surface"
  },
  {
    "name": "watercolor",
    "category": "background",
    "title": "Aquarelle",
    "description": "Des taches d aquarelle qui s etalent sur un papier grenu, se chargent de pigment sur leur bord en sechant, puis s effacent pour laisser place aux suivantes.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "watercolor.shader.ts",
        "target": "background/watercolor.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Watercolor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-sky-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse du cycle : etalement, sechage, effacement.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "blots",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de taches vivantes. Retrograde a 3 en qualite basse.",
        "min": 2,
        "max": 10,
        "step": 1
      },
      {
        "name": "bleed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Frange du bord : plus haut, plus la tache est dechiquetee.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "grain",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Grain du papier.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-sky-400",
        "description": "Tokens dont les couleurs sont lues : le papier, et les deux pigments qui alternent d une tache a l autre."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Une somme d octaves par tache pour la frange, plus un bruit pour le grain. Le nombre de taches est le levier de cout et suit la qualite.",
      "fallback": "gradient"
    },
    "id": "background/watercolor"
  },
  {
    "name": "waves",
    "category": "background",
    "title": "Ondes",
    "description": "Des bandes qui ondulent, sommees de trois sinus non harmoniques.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/Waves.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse de l ondulation.",
        "min": 0,
        "max": 0.75,
        "step": 0.05
      },
      {
        "name": "bands",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de bandes.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Hauteur de l ondulation.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "description": "Tokens dont les couleurs sont lues."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un triangle plein ecran. Le cout ne depend que du nombre de bandes, borne a huit.",
      "fallback": "gradient"
    },
    "id": "background/waves"
  },
  {
    "name": "web-threads",
    "category": "background",
    "title": "Toile de fils",
    "description": "Des points relies a leurs voisins par des segments, une toile qui tremble au repos et vibre sous le pointeur ; les fils a portee s eclairent.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/WebThreads.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "points",
        "type": "number",
        "required": false,
        "default": 80,
        "description": "Nombre de points. Les liens croissent plus vite que les points.",
        "min": 20,
        "max": 160,
        "step": 5
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 1.1,
        "description": "Rayon de liaison entre points, en unites de scene.",
        "min": 0.4,
        "max": 2.5,
        "step": 0.1
      },
      {
        "name": "vibration",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Amplitude du tremblement au repos.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "reach",
        "type": "number",
        "required": false,
        "default": 1.4,
        "description": "Portee du pointeur, en unites de scene.",
        "min": 0.3,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-brand-500",
        "description": "Tokens dont les couleurs sont lues : le fond de la scene, les fils, les noeuds et l eclat des fils a portee."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. Une geometrie de segments dont seuls les sommets bougent ; en qualite basse, les points tombent a quarante, donc les liens a pres du quart. Le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "background/web-threads"
  },
  {
    "name": "wind-field",
    "category": "background",
    "title": "Champ de vent",
    "description": "Un trait court par cellule, oriente par le vent et long comme sa force ; des rafales balaient le cadre dans le sens du cap et changent la teinte des traits au passage.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "wind-field.shader.ts",
        "target": "background/wind-field.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/WindField.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-muted",
      "--o-palette-emerald-400"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 22,
        "description": "Nombre de cellules par hauteur de cadre. Retrograde a 14 en qualite basse.",
        "min": 8,
        "max": 40,
        "step": 1
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Frequence du bruit, donc la taille des tourbillons.",
        "min": 0.5,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse d evolution du vent et de passage des rafales.",
        "min": 0,
        "max": 2.5,
        "step": 0.1
      },
      {
        "name": "gusts",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Force des rafales.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-muted, --o-palette-emerald-400",
        "description": "Tokens dont les couleurs sont lues. Trois noms de variables CSS."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Neuf cellules evaluees par fragment, trois lectures de bruit et une capsule chacune. En qualite basse, les cellules s elargissent.",
      "fallback": "static"
    },
    "id": "background/wind-field"
  },
  {
    "name": "wormhole",
    "category": "background",
    "title": "Vortex torsade",
    "description": "Un couloir en z = 1/r dont l angle est tordu avec la profondeur : les aretes s enroulent en helice, l ensemble pivote, le point de fuite se promene et la teinte tourne autour de la paroi d une couleur a l autre.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "wormhole.shader.ts",
        "target": "background/wormhole.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "background/Wormhole.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-fuchsia-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Vitesse d avancee.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "twist",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Torsion des aretes avec la profondeur. Zero les rend droites.",
        "min": 0,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "spin",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Vitesse de rotation de l ensemble.",
        "min": -2,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Densite des bandes de profondeur. Retrograde a cinq en qualite basse.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-fuchsia-500, --o-palette-cyan-400",
        "description": "Tokens dont les couleurs sont lues : le fond, la premiere teinte des parois, la seconde et l eclat des aretes."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement et si WebGL manque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": "ogl",
      "notes": "Une division, un arc tangente, quatre sinus et une puissance par fragment. En qualite basse, les bandes s espacent : serrees au loin, elles battent avec la grille de pixels.",
      "fallback": "gradient"
    },
    "id": "background/wormhole"
  },
  {
    "name": "beam-connect",
    "category": "effect",
    "title": "Faisceau de liaison",
    "description": "Un trait courbe anime relie deux enfants identifies par data-beam, remesure a chaque changement de taille.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/BeamConnect.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-400"
    ],
    "props": [
      {
        "name": "curvature",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Bombement de la courbe.",
        "min": 0,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un cycle du flux.",
        "min": 500,
        "max": 10000,
        "step": 100
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 8,
        "step": 0.5
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du faisceau. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Mesures au montage et au redimensionnement seulement ; le flux est une animation CSS sur stroke-dashoffset, normalisee par pathLength. Trait fige sous mouvement reduit."
    },
    "id": "effect/beam-connect"
  },
  {
    "name": "blob-cursor",
    "category": "effect",
    "title": "Curseur gluant",
    "description": "Une chaine de boules recollees par un filtre SVG : la trainee s etire quand le pointeur file, et se fond en une seule goutte des qu il s arrete.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/BlobCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de boules de la chaine.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de la tete.",
        "min": 20,
        "max": 120,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Vitesse de rattrapage de la tete. Plus haut, plus sec.",
        "min": 4,
        "max": 30,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la matiere. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone ou le blob vit. Absente, il se pose sur la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Huit elements au maximum, un filtre SVG pose une fois, une ecriture de transform par boule et par image. Rien du tout sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/blob-cursor"
  },
  {
    "name": "border-beam",
    "category": "effect",
    "title": "Trait de bordure",
    "description": "Un trait lumineux parcourt le contour d un element, en boucle.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/BorderBeam.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 4000,
        "unit": "ms",
        "description": "Duree d un tour complet.",
        "min": 0,
        "max": 12000,
        "step": 100
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 60,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du trait."
      },
      {
        "name": "trail",
        "type": "number",
        "required": false,
        "default": 25,
        "description": "Longueur de la trainee, en pourcentage du contour.",
        "min": 5,
        "max": 50,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade conique anime par le compositeur. Aucun JavaScript par image."
    },
    "id": "effect/border-beam"
  },
  {
    "name": "carousel",
    "category": "effect",
    "title": "Carrousel",
    "description": "Un rail d images ou de cartes, au clavier, au pointeur et au geste.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Carousel.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les diapositives."
      },
      {
        "name": "perView",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Diapositives visibles a la fois.",
        "min": 1,
        "max": 4,
        "step": 1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Ecart entre deux diapositives.",
        "min": 0,
        "max": 48,
        "step": 1
      },
      {
        "name": "loop",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Revient au debut apres la derniere."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du carrousel, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le defilement natif fait le travail : pas de boucle, pas de transform pilote a la main."
    },
    "id": "effect/carousel"
  },
  {
    "name": "click-sparks",
    "category": "effect",
    "title": "Etincelles",
    "description": "De petits traits jaillissent radialement du point d appui a chaque clic, puis s eteignent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/ClickSparks.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de traits par clic.",
        "min": 3,
        "max": 16,
        "step": 1
      },
      {
        "name": "distance",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Portee du jaillissement.",
        "min": 16,
        "max": 120,
        "step": 4
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 500,
        "unit": "ms",
        "description": "Duree de la rafale.",
        "min": 150,
        "max": 1500,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quelques elements crees par clic, animes par Web Animations, retires a la fin. Rien au repos, rien sous mouvement reduit."
    },
    "id": "effect/click-sparks"
  },
  {
    "name": "crosshair",
    "category": "effect",
    "title": "Reticule",
    "description": "Deux traits traversent la zone et se croisent sous le pointeur, avec un vide au croisement et le releve chiffre des coordonnees.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Crosshair.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 1,
        "unit": "px",
        "description": "Epaisseur des traits.",
        "min": 1,
        "max": 4,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 20,
        "description": "Vitesse de rattrapage. Plus haut, plus colle.",
        "min": 3,
        "max": 40,
        "step": 1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Vide laisse au croisement.",
        "min": 0,
        "max": 64,
        "step": 2
      },
      {
        "name": "coords",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Affiche les coordonnees du croisement."
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone visee. Absente, le reticule prend la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre segments et une etiquette, mus par des transformations seules ; le releve chiffre n est reecrit qu au changement de pixel. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/crosshair"
  },
  {
    "name": "cursor-grid-dom",
    "category": "effect",
    "title": "Trame au pointeur",
    "description": "La version en elements du document de la grille magnetique : des points ecartes ou aspires par le pointeur, qui s allument dans le meme mouvement, sans WebGL.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/CursorGridDom.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [],
    "props": [
      {
        "name": "spacing",
        "type": "number",
        "required": false,
        "default": 28,
        "unit": "px",
        "description": "Ecartement des points. Le nombre de points en decoule.",
        "min": 10,
        "max": 80,
        "step": 2
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 140,
        "unit": "px",
        "description": "Portee de l aimant.",
        "min": 40,
        "max": 400,
        "step": 10
      },
      {
        "name": "force",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Ecart maximal d un point.",
        "min": 0,
        "max": 40,
        "step": 1
      },
      {
        "name": "attract",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Attire les points au lieu de les repousser."
      },
      {
        "name": "dotSize",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Diametre d un point.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Neuf cents points au maximum, reconstruits au seul changement de taille du cadre ; au-dela, c est le fond background/magnet-grid qu il faut poser. Sous mouvement reduit la trame est rendue au repos, sans souscription a la boucle."
    },
    "id": "effect/cursor-grid-dom"
  },
  {
    "name": "cursor-halo",
    "category": "effect",
    "title": "Curseur a halo",
    "description": "Un point qui suit le pointeur au pixel pres, et un halo amorti qui le rattrape.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/CursorHalo.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "dotSize",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Diametre du point.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "haloSize",
        "type": "number",
        "required": false,
        "default": 34,
        "unit": "px",
        "description": "Diametre du halo au repos.",
        "min": 12,
        "max": 90,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse a laquelle le halo rejoint le point. Plus c est haut, plus il colle.",
        "min": 2,
        "max": 24,
        "step": 1
      },
      {
        "name": "hoverScale",
        "type": "number",
        "required": false,
        "default": 1.8,
        "description": "De combien le halo grossit au survol d un element interactif.",
        "min": 1,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "interactive",
        "type": "string",
        "required": false,
        "description": "Le selecteur de ce qui compte comme interactif."
      },
      {
        "name": "host",
        "type": "RefObject<HTMLElement>",
        "required": false,
        "description": "Limiter le curseur a une zone. Absent, il vaut pour la fenetre entiere."
      },
      {
        "name": "hideNative",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Cacher le curseur natif. Faux par defaut : le curseur systeme porte des signaux que le halo ne reprend pas."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une boucle d images qui n ecrit que deux transform, sans jamais re-rendre l arbre React. Rien du tout sur un ecran tactile."
    },
    "id": "effect/cursor-halo"
  },
  {
    "name": "cursor-ring",
    "category": "effect",
    "title": "Curseur double",
    "description": "Dans sa zone, le curseur natif devient un point net suivi d un anneau retardataire, qui grossit sur les elements interactifs.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/CursorRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 36,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 16,
        "max": 96,
        "step": 2
      },
      {
        "name": "lag",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Retard de l anneau : plus haut, plus il traine.",
        "min": 0.2,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "grow",
        "type": "number",
        "required": false,
        "default": 1.8,
        "description": "Facteur de grossissement sur les elements interactifs.",
        "min": 1,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du point et de l anneau. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle, quatre variables CSS ecrites hors rendu React. Inerte au toucher, curseur natif conserve sous mouvement reduit."
    },
    "id": "effect/cursor-ring"
  },
  {
    "name": "deform",
    "category": "effect",
    "title": "Deformation",
    "description": "Un filtre de deplacement pose sur n importe quel contenu : fond, texte ou image.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Deform.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "amount",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Amplitude du deplacement.",
        "min": 0,
        "max": 36,
        "step": 1
      },
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 0.012,
        "description": "Finesse du bruit. Plus haut, plus serre.",
        "min": 0.002,
        "max": 0.06,
        "step": 0.001
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Vitesse de derive du champ. Zero pour figer.",
        "min": 0,
        "max": 0.45,
        "step": 0.05
      },
      {
        "name": "octaves",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Detail du bruit. Une seule octave donne une ondulation lisse.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "edges",
        "type": "'clean' | 'organic'",
        "required": false,
        "default": "clean",
        "description": "clean redecoupe le resultat sur la forme d origine ; organic laisse la silhouette se deformer.",
        "options": [
          "clean",
          "organic"
        ]
      },
      {
        "name": "onHover",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Amplifie la deformation au survol seulement."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un filtre natif, calcule une fois. Le mouvement translate le champ plutot que de le regenerer : animer la frequence effondrerait la cadence."
    },
    "id": "effect/deform"
  },
  {
    "name": "float-group",
    "category": "effect",
    "title": "Flottement",
    "description": "Chaque enfant direct flotte doucement sur sa propre cadence, duree et phase derivees de l index — jamais les memes pour deux voisins.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/FloatGroup.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Amplitude de l oscillation.",
        "min": 2,
        "max": 24,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree de reference d un aller-retour.",
        "min": 1000,
        "max": 8000,
        "step": 100
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS par enfant, toutes tenues par le compositeur, delais negatifs pour desynchroniser les departs. Animation suspendue sous mouvement reduit."
    },
    "id": "effect/float-group"
  },
  {
    "name": "ghost-cursor",
    "category": "effect",
    "title": "Trainee fantome",
    "description": "Le chemin du pointeur est garde quelques images dans un anneau, et des copies de plus en plus pales le relisent : la trainee epouse le trace exact, boucles comprises.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/GhostCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Nombre de fantomes.",
        "min": 2,
        "max": 24,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Taille du premier fantome.",
        "min": 6,
        "max": 48,
        "step": 2
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Images d ecart entre deux fantomes.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "shape",
        "type": "string",
        "required": false,
        "default": "point",
        "description": "Forme des fantomes.",
        "options": [
          "point",
          "anneau",
          "carre"
        ]
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des fantomes. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone ou la trainee vit. Absente, elle prend la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Vingt-quatre elements au maximum, un anneau de positions de longueur fixe, une ecriture de transform par fantome et par image. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/ghost-cursor"
  },
  {
    "name": "glare-hover",
    "category": "effect",
    "title": "Reflet au survol",
    "description": "Une bande de lumiere traverse le contenu au survol, comme un reflet sur une carte plastifiee.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/GlareHover.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-fg",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree de la traversee.",
        "min": 200,
        "max": 2400,
        "step": 50
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 115,
        "unit": "deg",
        "description": "Inclinaison de la bande.",
        "min": 0,
        "max": 180,
        "step": 5
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Demi-largeur de la bande, en pourcentage de la diagonale.",
        "min": 2,
        "max": 40,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du reflet. Une valeur, pas un role."
      },
      {
        "name": "loop",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Balaie en boucle, sans attendre le survol."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade lineaire deplace par le compositeur, sur un pseudo-element. Aucun JavaScript pendant la traversee."
    },
    "id": "effect/glare-hover"
  },
  {
    "name": "glitch-hover",
    "category": "effect",
    "title": "Glitch au survol",
    "description": "Au survol ou au focus, le contenu part en tranches decalees avec une frange chromatique, le temps d une breve rafale.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/GlitchHover.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-red-400",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Amplitude du decalage des tranches.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "slices",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de tranches par copie.",
        "min": 2,
        "max": 6,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux copies animees par Web Animations le temps d une rafale de quatre cents millisecondes ; rien au repos. Copies absentes et zone statique sous mouvement reduit."
    },
    "id": "effect/glitch-hover"
  },
  {
    "name": "glow-cursor",
    "category": "effect",
    "title": "Curseur lumineux",
    "description": "Une lueur diffuse suit le pointeur avec du retard, et s etire dans le sens du deplacement quand il file.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/GlowCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 320,
        "unit": "px",
        "description": "Diametre de la lueur au repos.",
        "min": 80,
        "max": 640,
        "step": 20
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Vitesse de rattrapage. Plus bas, plus la lueur traine.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Force de la lueur.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "trail",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Etirement dans le sens du deplacement.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "default": "var(--o-palette-brand-500)",
        "description": "Couleur de la lueur. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone eclairee. Absente, la lueur prend la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul element, un degrade pose une fois, une ecriture de transform par image. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/glow-cursor"
  },
  {
    "name": "gradual-blur",
    "category": "effect",
    "title": "Flou de bord",
    "description": "Le bord d une zone defilante se voile d un flou qui s epaissit vers l exterieur, et s efface en fin de course.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/GradualBlur.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "side",
        "type": "'bottom' | 'top' | 'left' | 'right'",
        "required": false,
        "default": "bottom",
        "description": "Bord voile.",
        "options": [
          "bottom",
          "top",
          "left",
          "right"
        ]
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Profondeur de la bande voilee.",
        "min": 16,
        "max": 320,
        "step": 8
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Flou atteint tout au bord.",
        "min": 1,
        "max": 40,
        "step": 1
      },
      {
        "name": "layers",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de couches. Plus il y en a, plus la montee est douce.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "tint",
        "type": "string",
        "required": false,
        "description": "Teinte posee sur la bande, par-dessus le flou."
      },
      {
        "name": "scrollable",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Fait de la zone un conteneur defilant, et efface le voile en fin de course."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quelques couches de backdrop-filter, calculees par le compositeur. La disparition en fin de course ecrit une variable CSS depuis la boucle du moteur, sans rendu React."
    },
    "id": "effect/gradual-blur"
  },
  {
    "name": "halftone-reveal",
    "category": "effect",
    "title": "Revelation en trame",
    "description": "Au defilement, une trame de points serres se retracte point par point et decouvre le contenu, puis quitte le DOM.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/HalftoneReveal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "cell",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Pas de la trame.",
        "min": 4,
        "max": 64,
        "step": 2
      },
      {
        "name": "travel",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Part de la hauteur de fenetre sur laquelle la revelation se joue.",
        "min": 0.15,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "offset",
        "type": "number",
        "required": false,
        "default": 0.15,
        "description": "Retard avant le depart, en part de hauteur de fenetre.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la trame. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une mesure par image tant que la trame est la, un rayon ecrit en variable CSS, puis le voile quitte le DOM. Aucun rendu React pendant la revelation."
    },
    "id": "effect/halftone-reveal"
  },
  {
    "name": "inertia-drag",
    "category": "effect",
    "title": "Glisser avec inertie",
    "description": "L element se laisse trainer au pointeur, continue sur sa lancee au lacher, puis revient elastiquement a sa place.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/InertiaDrag.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "friction",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Freinage de la lancee. Plus haut, plus court.",
        "min": 1,
        "max": 30,
        "step": 1
      },
      {
        "name": "spring",
        "type": "number",
        "required": false,
        "default": 120,
        "description": "Raideur du rappel vers la place d origine.",
        "min": 10,
        "max": 400,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle, une integration velocite-friction-ressort et une ecriture de transform par image. Rien n ecoute et position fixe sous mouvement reduit."
    },
    "id": "effect/inertia-drag"
  },
  {
    "name": "laser-flow",
    "category": "effect",
    "title": "Balayage laser",
    "description": "Un faisceau incline traverse le cadre en boucle, un trait net double d une nappe diffuse.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/LaserFlow.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 3200,
        "unit": "ms",
        "description": "Duree d une traversee.",
        "min": 600,
        "max": 9000,
        "step": 100
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "deg",
        "description": "Inclinaison du faisceau.",
        "min": -45,
        "max": 45,
        "step": 1
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur du trait net.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "px",
        "description": "Largeur de la nappe diffuse qui accompagne le trait.",
        "min": 0,
        "max": 320,
        "step": 10
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du faisceau."
      },
      {
        "name": "frame",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Allume aussi un filet sur le contour du cadre."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux elements deplaces par une animation CSS, dont un flou fixe. Aucun JavaScript par image."
    },
    "id": "effect/laser-flow"
  },
  {
    "name": "magic-rings",
    "category": "effect",
    "title": "Anneaux au clic",
    "description": "Chaque appui envoie une salve d anneaux concentriques qui s ecartent en ralentissant et s effacent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/MagicRings.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "rings",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre d anneaux par salve.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree de vie d un anneau.",
        "min": 300,
        "max": 3000,
        "step": 100
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 260,
        "unit": "px",
        "description": "Rayon atteint en fin de course.",
        "min": 60,
        "max": 640,
        "step": 20
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 130,
        "unit": "ms",
        "description": "Retard entre deux anneaux d une meme salve.",
        "min": 0,
        "max": 500,
        "step": 10
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des anneaux."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un canevas et une boucle qui se suspend des que la derniere salve est eteinte. Les clics sont dates par l horloge du moteur, la meme que celle du dessin."
    },
    "id": "effect/magic-rings"
  },
  {
    "name": "magnet-lines",
    "category": "effect",
    "title": "Lignes magnetiques",
    "description": "Un champ d aiguilles qui pivotent vers le pointeur, par le plus court chemin, et reviennent a leur angle de repos au-dela de la portee.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/MagnetLines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [],
    "props": [
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de rangees.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Nombre de colonnes.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "length",
        "type": "number",
        "required": false,
        "default": 26,
        "unit": "px",
        "description": "Longueur d une aiguille.",
        "min": 8,
        "max": 60,
        "step": 2
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur d une aiguille.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "reach",
        "type": "number",
        "required": false,
        "default": 260,
        "unit": "px",
        "description": "Portee de l aimant.",
        "min": 60,
        "max": 800,
        "step": 20
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Vitesse de rotation des aiguilles. Plus haut, plus sec.",
        "min": 1,
        "max": 30,
        "step": 1
      },
      {
        "name": "idle",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "deg",
        "description": "Angle de repos, hors de portee.",
        "min": -90,
        "max": 90,
        "step": 5
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des aiguilles. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre cents aiguilles au maximum, une transformation chacune par image, centres calcules et non mesures. Sous mouvement reduit le champ est rendu fige, sans souscription a la boucle."
    },
    "id": "effect/magnet-lines"
  },
  {
    "name": "magnetic",
    "category": "effect",
    "title": "Attraction",
    "description": "Un element attire par le pointeur, qui revient a sa place des qu il s eloigne.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Magnetic.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Fraction de la distance parcourue vers le pointeur.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 120,
        "unit": "px",
        "description": "Distance au-dela de laquelle l attraction cesse.",
        "min": 0.05,
        "max": 0.45,
        "step": 0.01
      },
      {
        "name": "ease",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse de rattrapage. Plus haut, plus sec.",
        "min": 0,
        "max": 24,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle, une ecriture de transform par image."
    },
    "id": "effect/magnetic"
  },
  {
    "name": "marquee",
    "category": "effect",
    "title": "Bandeau defilant",
    "description": "Un contenu qui defile sans fin, avec fondus aux extremites.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Marquee.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 40,
        "description": "Duree d un cycle, en secondes pour cent pour cent de largeur.",
        "min": 0,
        "max": 120,
        "step": 100
      },
      {
        "name": "reverse",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Inverse le sens du defilement."
      },
      {
        "name": "pauseOnHover",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Suspend le defilement au survol."
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Largeur des fondus, en pourcentage.",
        "min": 0,
        "max": 36,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une translation animee par le compositeur, et un masque. Aucun JavaScript par image."
    },
    "id": "effect/marquee"
  },
  {
    "name": "meteors",
    "category": "effect",
    "title": "Meteores",
    "description": "Des traits obliques tombent en boucle a travers la zone, chacun sur sa propre cadence.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Meteors.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de meteores.",
        "min": 1,
        "max": 40,
        "step": 1
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 215,
        "unit": "deg",
        "description": "Angle de la chute.",
        "min": 180,
        "max": 270,
        "step": 5
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS par meteore, toutes tenues par le compositeur. Rien n est rendu sous mouvement reduit."
    },
    "id": "effect/meteors"
  },
  {
    "name": "neon-border",
    "category": "effect",
    "title": "Lisere de neon",
    "description": "Un arc lumineux qui fait le tour d un cadre a vitesse constante le long du bord, et non a vitesse constante en angle.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/NeonBorder.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-amber-400"
    ],
    "props": [
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Rayon des coins.",
        "min": 0,
        "max": 64,
        "step": 2
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "length",
        "type": "number",
        "required": false,
        "default": 50,
        "description": "Longueur de l arc, en pour cent du demi-perimetre.",
        "min": 5,
        "max": 100,
        "step": 5
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 100,
        "description": "Intensite du halo, en pour cent.",
        "min": 0,
        "max": 100,
        "step": 10
      },
      {
        "name": "movement",
        "type": "'continuous' | 'step'",
        "required": false,
        "default": "continuous",
        "description": "L arc glisse sans arret, ou saute d un coin au suivant.",
        "options": [
          "continuous",
          "step"
        ]
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 4000,
        "unit": "ms",
        "description": "Duree d un tour.",
        "min": 800,
        "max": 20000,
        "step": 400
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "default": "--o-palette-amber-400",
        "description": "Token de la couleur. Il entre tel quel dans le degrade, et suit donc le theme sans etre relu."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Le degrade est reconstruit a chaque image — vingt-six arrets, une chaine — et pose dans une variable CSS lue par quatre couches. Sous mouvement reduit, l arc est pose une fois et ne bouge plus : le cadre garde son lisere.",
      "fallback": "static"
    },
    "id": "effect/neon-border"
  },
  {
    "name": "orbiting-dots",
    "category": "effect",
    "title": "Points en orbite",
    "description": "Des satellites tournent autour du contenu, sur deux anneaux croises.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/OrbitingDots.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de points.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Rayon de l orbite exterieure.",
        "min": 8,
        "max": 200,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6000,
        "unit": "ms",
        "description": "Duree d une revolution de l anneau exterieur.",
        "min": 1000,
        "max": 20000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une rotation CSS par point, tenue par le compositeur. Sous mouvement reduit les points restent en place sur leur cercle."
    },
    "id": "effect/orbiting-dots"
  },
  {
    "name": "parallax",
    "category": "effect",
    "title": "Parallaxe",
    "description": "Un element qui se deplace plus lentement que le defilement de la page.",
    "engine": {
      "gsap": [
        "ScrollTrigger"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Parallax.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "distance",
        "type": "number",
        "required": false,
        "default": 80,
        "unit": "px",
        "description": "Amplitude du deplacement sur toute la traversee.",
        "min": 0,
        "max": 240,
        "step": 100
      },
      {
        "name": "axis",
        "type": "'y' | 'x'",
        "required": false,
        "default": "y",
        "description": "Axe du deplacement.",
        "options": [
          "y",
          "x"
        ]
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Agrandissement additionnel, de 0 a 1.",
        "min": 0,
        "max": 10,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de defilement dans la boucle unique, une ecriture de transform. Aucun rendu React."
    },
    "id": "effect/parallax"
  },
  {
    "name": "pixel-swap",
    "category": "effect",
    "title": "Echange de cellules",
    "description": "Deux images partagent la meme grille : des cellules passent de l une a l autre sans arret, et reviennent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/PixelSwap.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "from",
        "type": "string",
        "required": true,
        "description": "Image de base, celle qui reste dans le flux."
      },
      {
        "name": "to",
        "type": "string",
        "required": true,
        "description": "Image dont les cellules viennent s echanger."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement de l image de base."
      },
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de colonnes. Les lignes suivent les proportions.",
        "min": 4,
        "max": 40,
        "step": 1
      },
      {
        "name": "rate",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Echanges par seconde.",
        "min": 1,
        "max": 40,
        "step": 1
      },
      {
        "name": "mix",
        "type": "number",
        "required": false,
        "default": 0.16,
        "description": "Part maximale de cellules montrant la seconde image.",
        "min": 0.02,
        "max": 0.9,
        "step": 0.02
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 240,
        "unit": "ms",
        "description": "Duree du fondu d une cellule.",
        "min": 0,
        "max": 1200,
        "step": 20
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une grille de cellules dont seule l opacite change, ecrite depuis la boucle du moteur a la cadence reglee. Aucun rendu React pendant les echanges."
    },
    "id": "effect/pixel-swap"
  },
  {
    "name": "pixel-transition",
    "category": "effect",
    "title": "Transition en damier",
    "description": "Un damier de pixels recouvre le premier contenu case par case, le remplace par le second, puis se retire.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/PixelTransition.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "cells",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de colonnes. Les lignes suivent les proportions.",
        "min": 4,
        "max": 32,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 520,
        "unit": "ms",
        "description": "Duree du recouvrement, avant l echange des contenus.",
        "min": 120,
        "max": 2000,
        "step": 20
      },
      {
        "name": "trigger",
        "type": "'hover' | 'click' | 'view'",
        "required": false,
        "default": "hover",
        "description": "Ce qui declenche le passage au second contenu.",
        "options": [
          "hover",
          "click",
          "view"
        ]
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des cases. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une grille de cases dont l opacite est animee par la feuille, chacune avec son retard. Deux rendus React par passage, aucun pendant."
    },
    "id": "effect/pixel-transition"
  },
  {
    "name": "reveal-mask",
    "category": "effect",
    "title": "Rideau par bandes",
    "description": "A l entree dans le champ, le contenu est revele par des bandes verticales qui se retirent en cascade puis quittent le DOM.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/RevealMask.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "bands",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de bandes.",
        "min": 3,
        "max": 6,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree du retrait d une bande.",
        "min": 200,
        "max": 2000,
        "step": 50
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "ms",
        "description": "Decalage entre deux bandes voisines.",
        "min": 0,
        "max": 400,
        "step": 10
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des bandes. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur jusqu a l entree dans le champ, une animation Web Animations par bande, surcouche retiree du DOM a la fin. Contenu immediatement visible sous mouvement reduit."
    },
    "id": "effect/reveal-mask"
  },
  {
    "name": "ripple-click",
    "category": "effect",
    "title": "Onde au clic",
    "description": "Un cercle part du point touche et s etend jusqu aux bords de la zone.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/RippleClick.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree de l expansion.",
        "min": 100,
        "max": 2000,
        "step": 50
      },
      {
        "name": "opacity",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Opacite de depart de l onde.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de l onde. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un element cree par clic, anime par Web Animations, retire a la fin. Rien au repos, rien sous mouvement reduit."
    },
    "id": "effect/ripple-click"
  },
  {
    "name": "ripple-distortion",
    "category": "effect",
    "title": "Distorsion d ondes",
    "description": "Une surface d ondes concentriques nait sous le pointeur et deforme les bandes qu elle porte, derriere le contenu.",
    "engine": {
      "gsap": [],
      "gl": "ogl"
    },
    "files": [
      {
        "path": "ripple-distortion.shader.ts",
        "target": "effect/ripple-distortion.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "effect/RippleDistortion.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-surface",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Vitesse de propagation des ondes.",
        "min": 0.1,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 26,
        "description": "Serrage des ondes et des bandes.",
        "min": 6,
        "max": 70,
        "step": 2
      },
      {
        "name": "amount",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Amplitude du decalage de lecture.",
        "min": 0,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "damping",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vitesse de rattrapage du pointeur. Plus haut, plus sec.",
        "min": 1,
        "max": 9,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-theme-surface, --o-palette-brand-500",
        "description": "Tokens du creux des bandes, de leur crete, puis de l eclat."
      },
      {
        "name": "fallback",
        "type": "string",
        "required": false,
        "description": "Classes du repli, a la place des anneaux figes derives des tokens."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": "ogl",
      "notes": "Un triangle plein ecran et un shader de fragment, sous le contenu. Le pointeur est amorti dans la boucle du moteur et transmis par un uniform mute en place, sans rendu React.",
      "fallback": "static"
    },
    "id": "effect/ripple-distortion"
  },
  {
    "name": "scroll-progress",
    "category": "effect",
    "title": "Progression de lecture",
    "description": "Une barre qui suit l avancee dans un article, lue dans la boucle du moteur.",
    "engine": {
      "gsap": [
        "ScrollTrigger"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/ScrollProgress.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-600",
      "--o-duration-fast"
    ],
    "props": [
      {
        "name": "target",
        "type": "RefObject<HTMLElement | null>",
        "required": false,
        "description": "Element dont on suit la lecture. Par defaut, la page entiere."
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur de la barre.",
        "min": 0,
        "max": 9,
        "step": 1
      },
      {
        "name": "position",
        "type": "'top' | 'bottom'",
        "required": false,
        "default": "top",
        "description": "Bord auquel la barre est ancree.",
        "options": [
          "top",
          "bottom"
        ]
      },
      {
        "name": "children",
        "type": "(state: { progress: number }) => ReactNode",
        "required": false,
        "description": "Slot de rendu. Remplace la barre en gardant la mesure."
      },
      {
        "name": "onReady",
        "type": "(context: ReadyContext<ScrollProgressControls>) => void | (() => void)",
        "required": false,
        "description": "Echappatoire : donne la lecture imperative de la progression."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement au defilement, une ecriture de transform par image. Aucun rendu React en cours de defilement."
    },
    "id": "effect/scroll-progress"
  },
  {
    "name": "scroll-velocity",
    "category": "effect",
    "title": "Inclinaison au defilement",
    "description": "Le conteneur s incline et se decale avec la vitesse de defilement, puis se redresse en douceur a l arret.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/ScrollVelocity.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Ampleur de l inclinaison et du decalage.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "damping",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse du lissage et du retour. Plus haut, plus sec.",
        "min": 1,
        "max": 24,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle, une lecture de position et deux variables CSS ecrites par image. Aucune souscription et conteneur immobile sous mouvement reduit."
    },
    "id": "effect/scroll-velocity"
  },
  {
    "name": "shape-blur",
    "category": "effect",
    "title": "Forme floue",
    "description": "Une silhouette geometrique tres floue derive sous le contenu, en suivant le pointeur avec retard.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/ShapeBlur.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "shape",
        "type": "'circle' | 'square' | 'triangle' | 'hexagon'",
        "required": false,
        "default": "hexagon",
        "description": "Silhouette employee.",
        "options": [
          "circle",
          "square",
          "triangle",
          "hexagon"
        ]
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 240,
        "unit": "px",
        "description": "Cote de la silhouette.",
        "min": 60,
        "max": 720,
        "step": 20
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 44,
        "unit": "px",
        "description": "Flou applique a la silhouette.",
        "min": 0,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Vitesse de rattrapage du pointeur. Plus haut, plus sec.",
        "min": 1,
        "max": 9,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la silhouette."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un element decoupe et floute par le compositeur, deplace par une transformation ecrite dans la boucle du moteur. Aucun rendu React par image."
    },
    "id": "effect/shape-blur"
  },
  {
    "name": "splash-pointer",
    "category": "effect",
    "title": "Eclaboussure",
    "description": "Chaque clic envoie des gouttes qui montent, ralentissent et retombent, avec une couronne d impact au point touche.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/SplashPointer.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "drops",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Nombre de gouttes par impact.",
        "min": 3,
        "max": 28,
        "step": 1
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "px",
        "description": "Portee horizontale des gouttes.",
        "min": 30,
        "max": 200,
        "step": 10
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree du vol.",
        "min": 200,
        "max": 1800,
        "step": 50
      },
      {
        "name": "gravity",
        "type": "number",
        "required": false,
        "default": 1.4,
        "description": "Poids des gouttes : plus haut, plus elles retombent vite.",
        "min": 0.2,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des gouttes. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Rien au repos : chaque clic cree ses gouttes, les confie a Web Animations et les retire a la fin. Aucune souscription a la boucle. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/splash-pointer"
  },
  {
    "name": "spotlight",
    "category": "effect",
    "title": "Halo de pointeur",
    "description": "Un halo suit le curseur sur une carte, et s eteint quand il la quitte.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/Spotlight.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 320,
        "unit": "px",
        "description": "Diametre du halo.",
        "min": 0,
        "max": 960,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du halo. Une valeur, pas un role."
      },
      {
        "name": "border",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Eclaire aussi la bordure."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux variables CSS ecrites au deplacement du pointeur. Aucun rendu React."
    },
    "id": "effect/spotlight"
  },
  {
    "name": "sticker-peel",
    "category": "effect",
    "title": "Autocollant decolle",
    "description": "Un coin du contenu se souleve comme un autocollant qu on decolle, et laisse voir son dos et son ombre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/StickerPeel.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-surface",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "corner",
        "type": "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'",
        "required": false,
        "default": "top-right",
        "description": "Coin qui se souleve.",
        "options": [
          "top-right",
          "top-left",
          "bottom-right",
          "bottom-left"
        ]
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 72,
        "unit": "px",
        "description": "Longueur du coin souleve.",
        "min": 16,
        "max": 220,
        "step": 4
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 420,
        "unit": "ms",
        "description": "Duree du decollage.",
        "min": 0,
        "max": 1600,
        "step": 20
      },
      {
        "name": "peeled",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Garde le coin souleve, sans attendre le survol."
      },
      {
        "name": "back",
        "type": "string",
        "required": false,
        "description": "Couleur du dos de l autocollant."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux traces de decoupe animes par une transition CSS. Deux rendus React par survol, aucun pendant."
    },
    "id": "effect/sticker-peel"
  },
  {
    "name": "sticky-cursor",
    "category": "effect",
    "title": "Curseur collant",
    "description": "Une pastille suit le pointeur, s etire en vol, puis prend exactement la taille et l arrondi du bouton qu elle survole.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/StickyCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 20,
        "unit": "px",
        "description": "Diametre de la pastille au repos.",
        "min": 8,
        "max": 60,
        "step": 2
      },
      {
        "name": "stick",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "De combien la pastille suit encore le pointeur une fois accrochee.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "padding",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Marge ajoutee autour de la cible.",
        "min": 0,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 16,
        "description": "Vitesse de rattrapage. Plus haut, plus sec.",
        "min": 4,
        "max": 32,
        "step": 1
      },
      {
        "name": "stretch",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Etirement en vol.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "targets",
        "type": "string",
        "required": false,
        "description": "Le selecteur de ce a quoi la pastille colle."
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la pastille. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone ou la pastille vit. Absente, elle prend la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul element mu par image, dans une couche qui porte contain ; l arrondi de la cible n est lu qu au moment de l accroche. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/sticky-cursor"
  },
  {
    "name": "swarm-cursor",
    "category": "effect",
    "title": "Nuee de curseur",
    "description": "Des points tournent autour du pointeur, chacun avec sa prise : au repos ils forment un anneau, des que la main file la nuee s etire en comete.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/SwarmCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de points.",
        "min": 3,
        "max": 32,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Rayon de l orbite.",
        "min": 10,
        "max": 120,
        "step": 5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.4,
        "description": "Vitesse d orbite, en tours par seconde.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 0.65,
        "description": "Dispersion : de combien les prises different d un point a l autre.",
        "min": 0,
        "max": 0.95,
        "step": 0.05
      },
      {
        "name": "dotSize",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Diametre d un point.",
        "min": 2,
        "max": 16,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone ou la nuee vit. Absente, elle prend la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trente-deux elements au maximum, une ecriture de transform par point et par image, aucune allocation dans la boucle. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/swarm-cursor"
  },
  {
    "name": "target-cursor",
    "category": "effect",
    "title": "Viseur",
    "description": "Quatre crochets tournent autour du pointeur, puis s ecartent jusqu aux coins de l element survole pour l encadrer.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "effect/TargetCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Cote du carre au repos.",
        "min": 12,
        "max": 80,
        "step": 2
      },
      {
        "name": "corner",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Longueur d un crochet.",
        "min": 6,
        "max": 32,
        "step": 1
      },
      {
        "name": "padding",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Marge laissee autour de la cible encadree.",
        "min": 0,
        "max": 32,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 14,
        "description": "Vitesse de rattrapage. Plus haut, plus sec.",
        "min": 3,
        "max": 30,
        "step": 1
      },
      {
        "name": "spin",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Rotation au repos, en tours par seconde.",
        "min": 0,
        "max": 1,
        "step": 0.02
      },
      {
        "name": "targets",
        "type": "string",
        "required": false,
        "description": "Le selecteur de ce que le viseur encadre."
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des crochets. Une valeur, pas un role."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Zone visee. Absente, le viseur prend la page entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq elements, cinq transformations par image, et une mesure de la cible seulement quand elle change. Rien sans pointeur fin ni sous mouvement reduit."
    },
    "id": "effect/target-cursor"
  },
  {
    "name": "molten",
    "category": "hero",
    "title": "Molten",
    "description": "Une masse en fusion qui respire, deformee par un bruit fractal et coloree par la palette.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "molten.shader.ts",
        "target": "hero/molten.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "hero/Molten.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-palette-brand-600",
      "--o-palette-fuchsia-600"
    ],
    "props": [
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.28,
        "description": "Profondeur de la deformation, en rayons.",
        "min": 0,
        "max": 0.5,
        "step": 0.01
      },
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Echelle du bruit. Plus haut, plus tourmente.",
        "min": 0.002,
        "max": 0.06,
        "step": 0.001
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Vitesse de la respiration.",
        "min": 0,
        "max": 0.75,
        "step": 0.05
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Intensite du halo de bord.",
        "min": 0,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Amplitude du suivi du pointeur. Zero pour l immobiliser.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-brand-600, --o-palette-fuchsia-600",
        "description": "Tokens du coeur et de la croute."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage, contre 13 pour le backend leger. Le nombre d octaves et la subdivision suivent la qualite retenue.",
      "fallback": "poster"
    },
    "id": "hero/molten"
  },
  {
    "name": "scroll-video",
    "category": "hero",
    "title": "Video defilee",
    "description": "Une video parcourue image par image par le defilement, dans une scene collante — sans verrouiller la page.",
    "engine": {
      "gsap": [
        "ScrollTrigger"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "hero/ScrollVideo.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-slow",
      "--o-duration-slower",
      "--o-ease-entrance",
      "--o-ease-exit"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de la video. Un encodage a images cles rapprochees est necessaire : sans lui, chaque recherche decode depuis l image cle precedente et le parcours saccade."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Image affichee tant que la video n est pas decodable."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Titre, efface a mesure que la video avance."
      },
      {
        "name": "tagline",
        "type": "ReactNode",
        "required": false,
        "description": "Phrase revelee sur les derniers pour cent de la course."
      },
      {
        "name": "hint",
        "type": "ReactNode",
        "required": false,
        "default": "Defiler",
        "description": "Invitation a defiler, effacee au premier mouvement."
      },
      {
        "name": "range",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Longueur de la course, en hauteurs de fenetre.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "ease",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Vitesse de rattrapage de la position visee. Plus haut, plus sec.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "description",
        "type": "string",
        "required": false,
        "description": "Texte de remplacement de la video."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": false,
      "notes": "Le cout est celui de la video : decodage a chaque recherche, et un fichier qui pese generalement plusieurs megaoctets. Sous mouvement reduit, aucune boucle n est ouverte et l image finale est affichee telle quelle.",
      "fallback": "poster"
    },
    "id": "hero/scroll-video"
  },
  {
    "name": "tide",
    "category": "hero",
    "title": "Maree",
    "description": "Une nappe lumineuse en trois dimensions, soulevee par une houle de bruit, eclairee en rasant et fondue dans le fond avec la distance. Le pointeur l incline, le defilement l eloigne.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "tide.shader.ts",
        "target": "hero/tide.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "hero/Tide.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster",
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-300"
    ],
    "props": [
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 0.45,
        "description": "Hauteur de la houle, en unites de scene.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "frequency",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Frequence du bruit. Plus haut, plus de vagues dans le cadre.",
        "min": 0.2,
        "max": 1.5,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.18,
        "description": "Vitesse de la houle.",
        "min": 0,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "shine",
        "type": "number",
        "required": false,
        "default": 0.9,
        "description": "Intensite du reflet rasant et du lisere de crete.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 0.2,
        "description": "Inclinaison de la nappe sous le pointeur. Zero la fige.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "scroll",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Recul de la camera pendant le defilement du cadre. Zero le neutralise.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-theme-bg, --o-palette-brand-500, --o-palette-fuchsia-300",
        "description": "Tokens dont les couleurs sont lues : le fond dans lequel la nappe se fond, la teinte de la houle, l eclat des cretes."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche pendant le chargement de la scene et quand elle ne viendra pas."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage. La subdivision de la nappe et les octaves du bruit suivent la qualite retenue ; le rendu se suspend hors du champ.",
      "fallback": "poster"
    },
    "id": "hero/tide"
  },
  {
    "name": "use-copy",
    "category": "hooks",
    "title": "Copie confirmee",
    "description": "Copie un texte dans le presse-papiers et rend l etat a montrer, qui retombe seul.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useCopy.ts"
      }
    ],
    "dependencies": [
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "delai",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Delai avant le retour au repos.",
        "min": 400,
        "max": 4000,
        "step": 200
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un minuteur, ouvert seulement apres une copie et nettoye au demontage. Aucun travail par image."
    },
    "id": "hooks/use-copy"
  },
  {
    "name": "use-in-view",
    "category": "hooks",
    "title": "Entree dans le champ",
    "description": "Dit quand un element entre dans le champ, une fois, sans dependance.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useInView.ts"
      }
    ],
    "dependencies": [
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "once",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Se detacher apres le premier passage."
      },
      {
        "name": "amount",
        "type": "number",
        "required": false,
        "default": 0.3,
        "description": "Part visible qui declenche, de 0 a 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "margin",
        "type": "string",
        "required": false,
        "description": "Marge autour de la zone d observation, syntaxe de rootMargin."
      },
      {
        "name": "immediat",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Ne pas observer : vrai des le montage."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur, detache apres le premier passage. Aucun travail par image."
    },
    "id": "hooks/use-in-view"
  },
  {
    "name": "use-interval-clock",
    "category": "hooks",
    "title": "Intervalle sur l horloge",
    "description": "Repete une action a cadence tenue dans la boucle du moteur, et s arrete quand l onglet est cache.",
    "engine": {
      "gsap": [
        "core"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useIntervalClock.ts"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "interval",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree entre deux battements.",
        "min": 100,
        "max": 4000,
        "step": 100
      },
      {
        "name": "actif",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Battre ou non. C est par la que passe le mouvement reduit."
      },
      {
        "name": "immediat",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Battre une premiere fois sans attendre l intervalle."
      },
      {
        "name": "name",
        "type": "string",
        "required": false,
        "default": "intervalle",
        "description": "Nom affiche dans le panneau de diagnostic."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucun minuteur ouvert : une addition par image dans la boucle deja en place. Un battement au plus par image."
    },
    "id": "hooks/use-interval-clock"
  },
  {
    "name": "use-keyboard-list",
    "category": "hooks",
    "title": "Liste au clavier",
    "description": "Fleches, Home et End sur une liste, avec un seul arret de tabulation et le focus qui suit.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useKeyboardList.ts"
      }
    ],
    "dependencies": [
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": true,
        "default": 5,
        "description": "Nombre d elements de la liste.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "orientation",
        "type": "'verticale' | 'horizontale'",
        "required": false,
        "default": "verticale",
        "description": "Sens de la liste, donc paire de fleches employee.",
        "options": [
          "verticale",
          "horizontale"
        ]
      },
      {
        "name": "boucle",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Repartir au debut apres le dernier element."
      },
      {
        "name": "initial",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Element actif au montage.",
        "min": 0,
        "max": 11,
        "step": 1
      },
      {
        "name": "onValider",
        "type": "(index: number) => void",
        "required": false,
        "description": "Appelee sur Entree ou Espace, avec l index actif."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucun ecouteur global : un gestionnaire sur le conteneur. Un rendu par deplacement."
    },
    "id": "hooks/use-keyboard-list"
  },
  {
    "name": "use-measure",
    "category": "hooks",
    "title": "Mesure d un element",
    "description": "Taille et position d un element, relevees par un observateur quand elles changent vraiment.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useMeasure.ts"
      }
    ],
    "dependencies": [
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "arrondi",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Arrondir au pixel : sans lui, une largeur fractionnaire oscille et provoque des rendus pour rien."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur par element, aucune mesure par image. Le nombre de rendus est celui des changements de boite."
    },
    "id": "hooks/use-measure"
  },
  {
    "name": "use-media-query",
    "category": "hooks",
    "title": "Requete de media",
    "description": "Dit si une requete de media s applique, et le redit quand cela bascule, sans ecouteur de redimensionnement.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useMediaQuery.ts"
      }
    ],
    "dependencies": [
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "query",
        "type": "string",
        "required": true,
        "default": "(min-width: 60rem)",
        "description": "Requete, dans la grammaire du CSS."
      },
      {
        "name": "serveur",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Reponse rendue la ou matchMedia n existe pas : rendu serveur, test."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement par requete, partage entre tous les appels. Un rendu quand la reponse bascule, pas un par cran de redimensionnement."
    },
    "id": "hooks/use-media-query"
  },
  {
    "name": "use-pointer-damped",
    "category": "hooks",
    "title": "Pointeur amorti",
    "description": "Position du pointeur, normalisee et lissee, mise a jour dans la boucle du moteur.",
    "engine": {
      "gsap": [
        "core"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/usePointerDamped.ts"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Vitesse de rattrapage. Plus haut, plus sec.",
        "min": 0,
        "max": 9,
        "step": 1
      },
      {
        "name": "host",
        "type": "HTMLElement | null",
        "required": false,
        "description": "Zone observee. Par defaut, la fenetre entiere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle, aucune allocation par image."
    },
    "id": "hooks/use-pointer-damped"
  },
  {
    "name": "use-poster",
    "category": "hooks",
    "title": "Repli visuel",
    "description": "Maintient un repli affiche jusqu a ce que la scene soit prete, puis le fond en douceur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/usePoster.ts"
      }
    ],
    "dependencies": [
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "ready",
        "type": "boolean",
        "required": true,
        "description": "Passe a vrai quand la scene a rendu sa premiere image."
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 320,
        "unit": "ms",
        "description": "Duree du fondu du repli.",
        "min": 0,
        "max": 960,
        "step": 100
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucun rendu : le repli est un element du DOM."
    },
    "id": "hooks/use-poster"
  },
  {
    "name": "use-scroll-progress",
    "category": "hooks",
    "title": "Avancee au defilement",
    "description": "Dit ou en est un element, ou la page, dans le champ visible, sans rendu React par image.",
    "engine": {
      "gsap": [
        "core"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "hook.ts",
        "target": "hooks/useScrollProgress.ts"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "target",
        "type": "HTMLElement | null",
        "required": false,
        "description": "Element mesure. Sans lui, c est l avancee du document."
      },
      {
        "name": "scroller",
        "type": "HTMLElement | null",
        "required": false,
        "description": "Conteneur qui defile, quand ce n est pas la fenetre."
      },
      {
        "name": "range",
        "type": "'traversee' | 'ancrage'",
        "required": false,
        "default": "traversee",
        "description": "L element entre et sort du champ, ou le champ le parcourt de l interieur.",
        "options": [
          "traversee",
          "ancrage"
        ]
      },
      {
        "name": "reduced",
        "type": "'final' | 'suivre'",
        "required": false,
        "default": "final",
        "description": "Sous mouvement reduit : publier l etat final, ou mesurer quand meme.",
        "options": [
          "final",
          "suivre"
        ]
      },
      {
        "name": "name",
        "type": "string",
        "required": false,
        "default": "progression-defilement",
        "description": "Nom affiche dans le panneau de diagnostic."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de rectangle par image, en priorite layout, quel que soit le nombre d elements. Publication bornee a cent paliers."
    },
    "id": "hooks/use-scroll-progress"
  },
  {
    "name": "ascii-image",
    "category": "image",
    "title": "Image en caracteres",
    "description": "La photo est echantillonnee une fois dans un canevas hors du document et rendue en texte monospace, l image reelle restant dessous.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/AsciiImage.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 90,
        "description": "Nombre de caracteres sur la largeur. Borne a deux cents.",
        "min": 16,
        "max": 200,
        "step": 2
      },
      {
        "name": "contrast",
        "type": "number",
        "required": false,
        "default": 1.3,
        "description": "Contraste applique avant le choix du caractere.",
        "min": 0.4,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "invert",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Retourne la rampe : l image sort en negatif."
      },
      {
        "name": "hover",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Rendre la photo au survol et au focus."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une conversion unique au chargement — un canevas de la taille de la grille, une lecture de pixels, un rendu React — puis du texte statique. Rien par image. Le calque n est pas rendu tant que la conversion n a pas abouti : sans elle, la photo reste seule."
    },
    "id": "image/ascii-image"
  },
  {
    "name": "color-shift",
    "category": "image",
    "title": "Derive des teintes",
    "description": "Le cadre devient une table de reglage : la position horizontale du pointeur fait tourner les teintes, la verticale dose la saturation.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ColorShift.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "shift",
        "type": "number",
        "required": false,
        "default": 140,
        "unit": "deg",
        "description": "Rotation des teintes atteinte aux bords du cadre.",
        "min": 0,
        "max": 180,
        "step": 5
      },
      {
        "name": "saturate",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Saturation atteinte en haut du cadre.",
        "min": 0.5,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 220,
        "unit": "ms",
        "description": "Duree du lissage entre deux positions.",
        "min": 0,
        "max": 800,
        "step": 20
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux variables CSS ecrites au deplacement du pointeur, un seul filtre recalcule par le compositeur, aucun rendu React. Ni filtre ni ecouteur sous mouvement reduit : l image reste dans ses couleurs."
    },
    "id": "image/color-shift"
  },
  {
    "name": "compare",
    "category": "image",
    "title": "Avant / apres",
    "description": "Deux images superposees, revelees par une poignee au pointeur comme au clavier.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/Compare.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "before",
        "type": "{ src: string; alt: string }",
        "required": true,
        "description": "Image de gauche."
      },
      {
        "name": "after",
        "type": "{ src: string; alt: string }",
        "required": true,
        "description": "Image de droite."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "start",
        "type": "number",
        "required": false,
        "default": 50,
        "unit": "%",
        "description": "Position initiale de la poignee.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du curseur, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une variable CSS ecrite au deplacement. Aucun rendu React pendant le glissement."
    },
    "id": "image/compare"
  },
  {
    "name": "duotone",
    "category": "image",
    "title": "Bichromie",
    "description": "L image rendue en deux tons par calques superposes, qui revient en couleurs au survol comme au focus.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/Duotone.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-indigo-950",
      "--o-palette-amber-200",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Force de la bichromie, de 0 a 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "hover",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Revenir en couleurs au survol et au focus."
      },
      {
        "name": "shadow",
        "type": "string",
        "required": false,
        "description": "Ton des ombres. Une valeur, pas une couleur en dur."
      },
      {
        "name": "light",
        "type": "string",
        "required": false,
        "description": "Ton des lumieres. Une valeur, pas une couleur en dur."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un filtre et deux calques pleins composes par le navigateur, sans traitement d image. Le retour en couleurs est une transition de filter et d opacity ; instantane sous mouvement reduit."
    },
    "id": "image/duotone"
  },
  {
    "name": "frame",
    "category": "image",
    "title": "Cadre",
    "description": "Une image avec rapport fige, silhouette de chargement et revelation en douceur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/Frame.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-slow",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "fit",
        "type": "'cover' | 'contain'",
        "required": false,
        "default": "cover",
        "description": "Ajustement dans le cadre.",
        "options": [
          "cover",
          "contain"
        ]
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Agrandissement au survol, de 0 a 0.3.",
        "min": 0,
        "max": 0.3,
        "step": 0.01
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le rapport est fige avant le chargement : la page ne se decale pas quand l image arrive."
    },
    "id": "image/frame"
  },
  {
    "name": "hover-zoom",
    "category": "image",
    "title": "Zoom au survol",
    "description": "L image grossit doucement dans son cadre et regarde vers le pointeur, sans jamais bouger la mise en page.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/HoverZoom.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "default": 1.15,
        "description": "Echelle atteinte au survol.",
        "min": 1.05,
        "max": 1.6,
        "step": 0.05
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 480,
        "unit": "ms",
        "description": "Duree de l agrandissement.",
        "min": 120,
        "max": 1200,
        "step": 20
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux variables CSS ecrites au deplacement du pointeur, une transition tenue par le compositeur. Aucun rendu React pendant le survol ; fige sous mouvement reduit."
    },
    "id": "image/hover-zoom"
  },
  {
    "name": "image-glitch",
    "category": "image",
    "title": "Image glitchee",
    "description": "Deux fantomes teintes se decalent par tranches au-dessus de la photo, en paliers, tant que le pointeur reste.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ImageGlitch.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-cyan-400",
      "--o-palette-rose-500"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Decalage des tranches.",
        "min": 0,
        "max": 40,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un cycle de decrochage.",
        "min": 400,
        "max": 4000,
        "step": 100
      },
      {
        "name": "hover",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Ne decrocher qu au survol et au focus. Sinon, en continu."
      },
      {
        "name": "cool",
        "type": "string",
        "required": false,
        "description": "Teinte du premier fantome. Une valeur, pas une couleur en dur."
      },
      {
        "name": "warm",
        "type": "string",
        "required": false,
        "description": "Teinte du second fantome. Une valeur, pas une couleur en dur."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux calques dont l animation est declaree une fois pour le document et reste en pause : le survol la remet en marche, sans rien creer ni rendre. Les fantomes ne sont pas rendus sous mouvement reduit."
    },
    "id": "image/image-glitch"
  },
  {
    "name": "image-mask-text",
    "category": "image",
    "title": "Image dans le texte",
    "description": "Un mot rempli par la photo, le reste du cadre sous un voile qu un halo ouvre autour du pointeur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ImageMaskText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement de l image. Chaine vide si le mot dit deja tout."
      },
      {
        "name": "text",
        "type": "string",
        "required": true,
        "description": "Le mot rempli par l image."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 18,
        "description": "Taille du mot, en pour cent de la largeur du cadre.",
        "min": 6,
        "max": 40,
        "step": 1
      },
      {
        "name": "veil",
        "type": "number",
        "required": false,
        "default": 0.92,
        "description": "Opacite du voile pose sur l image, de 0 a 1.",
        "min": 0,
        "max": 1,
        "step": 0.02
      },
      {
        "name": "halo",
        "type": "number",
        "required": false,
        "default": 190,
        "unit": "px",
        "description": "Rayon du halo qui ouvre le voile. Zero le supprime.",
        "min": 0,
        "max": 420,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux variables CSS ecrites au deplacement du pointeur, un degrade radial repeint par le compositeur, aucun rendu React. Voile uniforme et cadre inerte sous mouvement reduit ; le mot reprend l encre du theme la ou le decoupage par le texte manque."
    },
    "id": "image/image-mask-text"
  },
  {
    "name": "image-particles",
    "category": "image",
    "title": "Image en particules",
    "description": "La photo est echantillonnee dans un canevas hors du document, dispersee en points colores, puis rassemblee jusqu a la reformer.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "image-particles.shader.ts",
        "target": "image/image-particles.shader.ts"
      },
      {
        "path": "component.tsx",
        "target": "image/ImageParticles.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "density",
        "type": "number",
        "required": false,
        "default": 140,
        "description": "Nombre de points sur la largeur, avant reduction par la qualite.",
        "min": 40,
        "max": 220,
        "step": 10
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 1.1,
        "description": "Taille d un point, en cellules.",
        "min": 0.4,
        "max": 2.5,
        "step": 0.1
      },
      {
        "name": "scatter",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Distance de dispersion au depart, en unites de scene.",
        "min": 0,
        "max": 2.5,
        "step": 0.1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree du rassemblement.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Vitesse de la respiration, une fois l image formee.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "parallax",
        "type": "number",
        "required": false,
        "default": 0.16,
        "description": "Inclinaison du nuage sous le pointeur. Zero la fige.",
        "min": 0,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "background",
        "type": "string",
        "required": false,
        "default": "--o-theme-bg",
        "description": "Token dont la couleur peint le fond de la scene."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage, plus une lecture de pixels au chargement de l image. La densite suit la qualite retenue et le rendu se suspend hors du champ. Le repli est l image elle-meme, posee sous le canevas : elle reste seule sans WebGL, sous mouvement reduit, et quand l arbitre refuse la surface.",
      "fallback": "static"
    },
    "id": "image/image-particles"
  },
  {
    "name": "image-stack-swipe",
    "category": "image",
    "title": "Pile a balayer",
    "description": "Des images empilees dont celle du dessus se chasse au glisser comme aux fleches du clavier, puis repasse sous la pile.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ImageStackSwipe.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-palette-brand-500",
      "--o-shadow-lg",
      "--o-ease-standard",
      "--o-ease-exit"
    ],
    "props": [
      {
        "name": "images",
        "type": "readonly { src: string; alt: string }[]",
        "required": true,
        "description": "Les images empilees, de la premiere a la derniere. Chacune porte son texte de remplacement."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.4,
        "description": "Rapport largeur sur hauteur des cartes.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "threshold",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "px",
        "description": "Distance a franchir pour chasser la carte.",
        "min": 20,
        "max": 260,
        "step": 10
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de cartes visibles derriere celle du dessus.",
        "min": 0,
        "max": 4,
        "step": 1
      },
      {
        "name": "offset",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Decalage entre deux cartes de la pile.",
        "min": 0,
        "max": 48,
        "step": 2
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Pile d images",
        "description": "Libelle du groupe, annonce avant la pile."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation ecrite par evenement de pointeur, sans rendu React pendant le geste ; un seul rendu par carte chassee. La pile est atteignable au clavier et annonce l image arrivee. Sous mouvement reduit, l ordre change sans trajet."
    },
    "id": "image/image-stack-swipe"
  },
  {
    "name": "image-trail",
    "category": "image",
    "title": "Trainee d images",
    "description": "Le deplacement du pointeur seme des vignettes qui apparaissent au point de passage puis se resorbent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ImageTrail.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "sources",
        "type": "readonly { src: string; alt: string }[]",
        "required": true,
        "description": "Les images semees, en cycle."
      },
      {
        "name": "threshold",
        "type": "number",
        "required": false,
        "default": 80,
        "unit": "px",
        "description": "Distance entre deux semis.",
        "min": 20,
        "max": 240,
        "step": 10
      },
      {
        "name": "life",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree de vie d une vignette.",
        "min": 200,
        "max": 2000,
        "step": 50
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 140,
        "unit": "px",
        "description": "Cote d une vignette.",
        "min": 48,
        "max": 320,
        "step": 4
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Contenu affiche sous la trainee."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une vignette creee par franchissement de seuil, animee par element.animate et retiree a la fin : le seuil borne le cout. Zone inerte sous mouvement reduit, premiere image centree en repli."
    },
    "id": "image/image-trail"
  },
  {
    "name": "ken-burns",
    "category": "image",
    "title": "Diaporama derive",
    "description": "Deux ou trois images en fondu croise, chacune animee d un zoom et d une derive lents pendant son affichage.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/KenBurns.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "images",
        "type": "readonly { src: string; alt: string }[]",
        "required": true,
        "description": "Les images du diaporama, deux ou trois."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "interval",
        "type": "number",
        "required": false,
        "default": 6000,
        "unit": "ms",
        "description": "Temps d affichage de chaque image.",
        "min": 2000,
        "max": 15000,
        "step": 500
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "default": 1.12,
        "description": "Echelle atteinte en fin de derive.",
        "min": 1.02,
        "max": 1.3,
        "step": 0.01
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une minuterie au rythme du diaporama, un rendu React par changement d image ; fondu et derive sont tenus par le compositeur. Premiere image fixe, sans cycle, sous mouvement reduit."
    },
    "id": "image/ken-burns"
  },
  {
    "name": "lens-zoom",
    "category": "image",
    "title": "Loupe",
    "description": "Un disque suit le pointeur et montre l image agrandie a l endroit survole, sans que le cadre perde sa vue d ensemble.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/LensZoom.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-shadow-lg",
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "default": 2.5,
        "description": "Grossissement dans le disque.",
        "min": 1.2,
        "max": 6,
        "step": 0.1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 180,
        "unit": "px",
        "description": "Diametre du disque.",
        "min": 60,
        "max": 320,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq variables CSS ecrites au deplacement du pointeur, une transformation et un fond repeints par le compositeur, aucun rendu React. Ni disque ni ecouteur sous mouvement reduit ; les evenements tactiles sont ignores."
    },
    "id": "image/lens-zoom"
  },
  {
    "name": "parallax-image",
    "category": "image",
    "title": "Image en parallaxe",
    "description": "L image, plus haute que son cadre, glisse verticalement pendant la traversee du champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ParallaxImage.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Force du glissement, de 0 a 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de rectangle et une ecriture de transform par image, dans la boucle unique du moteur. Aucun rendu React ; immobile sous mouvement reduit."
    },
    "id": "image/parallax-image"
  },
  {
    "name": "player",
    "category": "image",
    "title": "Lecteur video",
    "description": "Un lecteur complet : lecture, barre de progression, volume, plein ecran, au clavier.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/Player.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "@odoro-cli/icons",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de la video."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Image affichee avant la lecture."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Titre de la video, annonce aux technologies d assistance."
      },
      {
        "name": "tracks",
        "type": "readonly { src: string; srcLang: string; label: string }[]",
        "required": false,
        "description": "Pistes de sous-titres."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le decodage revient au navigateur. Le lecteur n ajoute que des commandes et un abonnement aux evenements du media. Les six icones des commandes viennent de odoro-icons : l elagage ne retient qu elles."
    },
    "id": "image/player"
  },
  {
    "name": "reveal-image",
    "category": "image",
    "title": "Image revelee",
    "description": "Un rideau s ouvre a l entree dans le champ pendant que l image revient d un leger zoom.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/RevealImage.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "direction",
        "type": "'up' | 'left'",
        "required": false,
        "default": "up",
        "description": "Sens de l ouverture du rideau.",
        "options": [
          "up",
          "left"
        ]
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree de la revelation.",
        "min": 300,
        "max": 2400,
        "step": 50
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection detache apres le premier passage, puis deux transitions tenues par le compositeur. Visible d emblee sous mouvement reduit."
    },
    "id": "image/reveal-image"
  },
  {
    "name": "scroll-reveal-image",
    "category": "image",
    "title": "Image decouverte au defilement",
    "description": "Le rideau suit la position de defilement plutot qu une minuterie : il s arrete au milieu, revient en arriere, se referme.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/ScrollRevealImage.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur du cadre.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "direction",
        "type": "'up' | 'down' | 'left' | 'right'",
        "required": false,
        "default": "up",
        "description": "Sens de l ouverture du rideau.",
        "options": [
          "up",
          "down",
          "left",
          "right"
        ]
      },
      {
        "name": "span",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Part de la traversee du champ pendant laquelle le rideau s ouvre.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "edge",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Marquer le bord qui avance d un lisere."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de rectangle et au plus une ecriture de variable par image, dans la boucle unique du moteur ; le decoupage et le contre-zoom sont calcules par la feuille de styles. Aucun rendu React ; rideau ouvert et aucun abonnement sous mouvement reduit."
    },
    "id": "image/scroll-reveal-image"
  },
  {
    "name": "tilt-glare",
    "category": "image",
    "title": "Inclinaison et reflet",
    "description": "Une carte-image qui pivote vers le pointeur, reflet a l oppose, sans un rendu React pendant le geste.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/TiltGlare.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-50"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "deg",
        "description": "Inclinaison maximale.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "glare",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Intensite du reflet, de 0 a 1. Zero le supprime.",
        "min": 0,
        "max": 1,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une boucle d amortissement qui ecrit une transformation et deux variables CSS, sans rendu React. Plat sous mouvement reduit, et inerte au doigt : sans pointeur fin, rien ne s abonne."
    },
    "id": "image/tilt-glare"
  },
  {
    "name": "video",
    "category": "image",
    "title": "Video de fond",
    "description": "Une video au rapport fige, avec affiche de chargement et respect du mouvement reduit.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "image/Video.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-slow",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de la video."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Image affichee avant la premiere trame."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.777,
        "description": "Rapport largeur sur hauteur.",
        "min": 0.5,
        "max": 2.5,
        "step": 0.05
      },
      {
        "name": "fit",
        "type": "'cover' | 'contain'",
        "required": false,
        "default": "cover",
        "description": "Ajustement dans le cadre.",
        "options": [
          "cover",
          "contain"
        ]
      },
      {
        "name": "description",
        "type": "string",
        "required": false,
        "description": "Ce que la video montre, pour qui ne la voit pas."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "La lecture ne demarre qu une fois la video dans le champ, et jamais sous mouvement reduit.",
      "fallback": "poster"
    },
    "id": "image/video"
  },
  {
    "name": "arc-trio",
    "category": "loader",
    "title": "Trio d arcs",
    "description": "Trois arcs de longueurs differentes sur un meme cercle, a trois vitesses : ils se rattrapent, se recouvrent, se separent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ArcTrio.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre du cercle.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Epaisseur des arcs.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un tour de l arc le plus long.",
        "min": 400,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des arcs. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois rotations CSS sur des groupes SVG, aucun JavaScript apres le premier rendu. Les arcs restent a un tiers de tour les uns des autres sous mouvement reduit."
    },
    "id": "loader/arc-trio"
  },
  {
    "name": "bar-gate",
    "category": "loader",
    "title": "Rideau a barre",
    "description": "Une barre segmentee sans chiffre, avancee par l horloge du moteur, puis une plaque qui s ecrase dans la ligne qui l a mesure.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BarGate.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond de la plaque."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre : la barre et le libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au-dessus de la barre : un nom, une marque."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "segments",
        "type": "number",
        "required": false,
        "default": 20,
        "description": "Nombre de segments de la barre.",
        "min": 4,
        "max": 48,
        "step": 1
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree du remplissage.",
        "min": 400,
        "max": 5000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 850,
        "unit": "ms",
        "description": "Duree de l ecrasement.",
        "min": 200,
        "max": 3000,
        "step": 50
      },
      {
        "name": "ceiling",
        "type": "number",
        "required": false,
        "default": 92,
        "description": "Ou la barre se gare en mode controle. Sans effet quand open n est pas renseigne.",
        "min": 50,
        "max": 99,
        "step": 1
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : le rideau couvre tant que c est vrai, et sort au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de l ecrasement, pour que le contenu entre pendant qu il a lieu."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a l horloge du moteur pendant le remplissage, qui se retire de lui-meme. Une variable CSS ecrite par image, aucun rendu React."
    },
    "id": "loader/bar-gate"
  },
  {
    "name": "bars-scale",
    "category": "loader",
    "title": "Barres en cascade",
    "description": "Cinq barres poussent du sol l une apres l autre, tiennent, puis retombent ensemble, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BarsScale.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Largeur d une barre. La hauteur et l ecart en dependent.",
        "min": 2,
        "max": 14,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un cycle complet, montee des cinq barres et chute comprises.",
        "min": 800,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des barres. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq animations CSS d echelle tenues par le compositeur, aucun JavaScript apres le premier rendu. Cinq barres pleines et immobiles sous mouvement reduit."
    },
    "id": "loader/bars-scale"
  },
  {
    "name": "battery-fill",
    "category": "loader",
    "title": "Batterie qui se charge",
    "description": "Un boitier a plot dont le niveau se remplit par la gauche, ou balaye sans fin sous un eclair quand la charge n est pas mesurable.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BatteryFill.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 58,
        "unit": "%",
        "description": "Charge, de 0 a 100. Ignoree en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Charge en cours, sans valeur : le niveau balaye le boitier sous un eclair."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Largeur de la batterie ; la hauteur suit la vue.",
        "min": 40,
        "max": 240,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d une charge complete, en mode indetermine.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du boitier et du niveau. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une echelle horizontale sur un rectangle, jamais une largeur animee : rien ne recalcule la geometrie. Valeur posee sans transition et charge arretee a mi-course sous mouvement reduit."
    },
    "id": "loader/battery-fill"
  },
  {
    "name": "blinds",
    "category": "loader",
    "title": "Stores",
    "description": "Un rideau en lames horizontales qui basculent de chant l une apres l autre, sous un point de fuite commun.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Blinds.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond des lames."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "slats",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Nombre de lames.",
        "min": 2,
        "max": 24,
        "step": 1
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 55,
        "unit": "ms",
        "description": "Decalage entre deux lames.",
        "min": 0,
        "max": 200,
        "step": 5
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps le store reste ferme.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree de la bascule d une lame.",
        "min": 200,
        "max": 2000,
        "step": 50
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : le store couvre tant que c est vrai, et s ouvre au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de la sortie, pour que le contenu entre entre les lames."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lame par element, une rotation composee chacune, decalee par un delai CSS. Aucun JavaScript par image."
    },
    "id": "loader/blinds"
  },
  {
    "name": "blob-loader",
    "category": "loader",
    "title": "Blob qui bourgeonne",
    "description": "Une masse centrale laisse partir un bourgeon dont le cou s etire puis se rompt, par un flou seuille qui soude deux cercles.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BlobLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2800,
        "unit": "ms",
        "description": "Duree d un tour du bourgeon, deux ruptures comprises.",
        "min": 1000,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du blob. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un filtre de flou seuille sur deux cercles : le seul poste couteux du lot, recalcule a chaque image sur une petite surface. Reservez-le a une piece unique dans la page. Bourgeon rentre et masse ronde immobile sous mouvement reduit.",
      "fallback": "static"
    },
    "id": "loader/blob-loader"
  },
  {
    "name": "blocks-stack",
    "category": "loader",
    "title": "Blocs empiles",
    "description": "Quatre blocs tombent et s empilent en colonne, puis la pile bascule et s effondre, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BlocksStack.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Cote d un bloc. La hauteur de chute en depend.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2200,
        "unit": "ms",
        "description": "Duree d un cycle complet, chute des quatre blocs et effondrement compris.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des blocs. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq animations CSS de transformation tenues par le compositeur, aucun JavaScript apres le premier rendu. Pile complete et debout sous mouvement reduit."
    },
    "id": "loader/blocks-stack"
  },
  {
    "name": "bouncing-ball",
    "category": "loader",
    "title": "Balle qui rebondit",
    "description": "Une balle tombe en accelerant, s ecrase au sol, repart en ralentissant, et son ombre suit sa hauteur, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BouncingBall.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Diametre de la balle. La hauteur du rebond en depend.",
        "min": 6,
        "max": 32,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 800,
        "unit": "ms",
        "description": "Duree d un rebond complet, du sommet au sommet.",
        "min": 300,
        "max": 2400,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la balle et de son ombre. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Balle posee au sol sur son ombre pleine sous mouvement reduit."
    },
    "id": "loader/bouncing-ball"
  },
  {
    "name": "bouncing-dots",
    "category": "loader",
    "title": "Points qui sautent",
    "description": "Trois points bondissent l un apres l autre, montee vive et retombee lourde, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/BouncingDots.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Diametre d un point. La hauteur du saut en depend.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 800,
        "unit": "ms",
        "description": "Duree d un saut complet, montee, retombee et pause au sol.",
        "min": 300,
        "max": 2500,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Trois points poses sur leur ligne de sol sous mouvement reduit."
    },
    "id": "loader/bouncing-dots"
  },
  {
    "name": "bricks",
    "category": "loader",
    "title": "Briques",
    "description": "Dix briques se posent une a une, rangee par rangee et en quinconce, jusqu a former un mur qui s efface, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Bricks.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Hauteur d une brique. La largeur et le joint en dependent.",
        "min": 3,
        "max": 16,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un cycle complet, pose des dix briques et effacement compris.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des briques. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Dix animations CSS d opacite et de translation tenues par le compositeur, aucun JavaScript apres le premier rendu. Mur complet et immobile sous mouvement reduit."
    },
    "id": "loader/bricks"
  },
  {
    "name": "chasing-dots",
    "category": "loader",
    "title": "Points qui se poursuivent",
    "description": "Quatre points de taille decroissante tournent en file sur un cercle, une tete et sa trainee, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ChasingDots.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Diametre du cercle parcouru.",
        "min": 16,
        "max": 120,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree d un tour complet.",
        "min": 400,
        "max": 3000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule rotation CSS tenue par le compositeur, les points sont poses une fois. La file reste en place, immobile, sous mouvement reduit."
    },
    "id": "loader/chasing-dots"
  },
  {
    "name": "checkmark-success",
    "category": "loader",
    "title": "Coche de reussite",
    "description": "La coche s ebauche en boucle pendant l attente, se pose pour de bon au succes, et cede la place a une croix a l echec, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CheckmarkSuccess.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 2,
        "max": 14,
        "step": 0.5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree d un trace complet.",
        "min": 400,
        "max": 3000,
        "step": 50
      },
      {
        "name": "state",
        "type": "string",
        "required": false,
        "default": "chargement",
        "description": "Etat de l operation. Le libelle annonce change avec lui.",
        "options": [
          "chargement",
          "succes",
          "echec"
        ]
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la marque. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce pendant l attente."
      },
      {
        "name": "labelSucces",
        "type": "string",
        "required": false,
        "default": "Termine",
        "description": "Libelle annonce au succes."
      },
      {
        "name": "labelEchec",
        "type": "string",
        "required": false,
        "default": "Echec",
        "description": "Libelle annonce a l echec."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS sur des elements SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Marque entierement tracee et immobile sous mouvement reduit, dans chaque etat."
    },
    "id": "loader/checkmark-success"
  },
  {
    "name": "clock-hands",
    "category": "loader",
    "title": "Aiguilles",
    "description": "Une horloge dont la grande aiguille saute de cran en cran et tremble en se posant, la petite avancant d un cran a chaque tour, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ClockHands.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre du cadran.",
        "min": 24,
        "max": 120,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un tour de la grande aiguille, soit douze crans.",
        "min": 1200,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du cadran et des aiguilles. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS sur des groupes SVG, tenues par le compositeur ; les reperes du cadran sont calcules une fois au chargement du module. Aiguilles a midi, immobiles, sous mouvement reduit."
    },
    "id": "loader/clock-hands"
  },
  {
    "name": "comet-ring",
    "category": "loader",
    "title": "Comete",
    "description": "Un point qui court sur un cercle, avec une trainee qui s efface derriere lui.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CometRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l orbite.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur de la trainee ; la tete fait pres du double.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "tail",
        "type": "number",
        "required": false,
        "default": 150,
        "unit": "deg",
        "description": "Longueur de la trainee, en degres d orbite.",
        "min": 30,
        "max": 300,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1100,
        "unit": "ms",
        "description": "Duree d un tour.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la comete. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une rotation CSS sur un groupe SVG, aucun JavaScript apres le premier rendu. La comete reste en haut de son orbite sous mouvement reduit."
    },
    "id": "loader/comet-ring"
  },
  {
    "name": "content-fade",
    "category": "loader",
    "title": "Contenu en fondu",
    "description": "Le vrai contenu revele section par section, chacune un peu apres la precedente : l autre moitie du squelette, celle de l arrivee.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ContentFade.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Les sections a reveler, dans l ordre ou elles doivent paraitre."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 650,
        "unit": "ms",
        "description": "Duree du fondu d une section.",
        "min": 150,
        "max": 2000,
        "step": 50
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 140,
        "unit": "ms",
        "description": "Ecart entre deux sections.",
        "min": 0,
        "max": 600,
        "step": 20
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "ms",
        "description": "Attente avant la premiere section.",
        "min": 0,
        "max": 2000,
        "step": 50
      },
      {
        "name": "shift",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Distance parcourue par une section en paraissant.",
        "min": 0,
        "max": 60,
        "step": 2
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Contenu en cours d affichage",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une opacite et une translation par section, jouees une fois puis tenues ; aucun JavaScript apres le premier rendu. Le contenu reel est dans le document des le depart. Tout visible immediatement, a sa place definitive, sous mouvement reduit."
    },
    "id": "loader/content-fade"
  },
  {
    "name": "counter-gate",
    "category": "loader",
    "title": "Rideau a compteur",
    "description": "Un rideau dont le compteur suit la vraie disponibilite : il se gare sous un plafond tant que rien n est pret.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CounterGate.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond du rideau."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du rideau."
      },
      {
        "name": "ready",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Ce qu on attend vraiment. Branche sur la premiere image d une scene, le compteur dit la verite."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre : un nom, une marque."
      },
      {
        "name": "minVisibleMs",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree minimale d affichage, contre le clignotement sur cache chaud.",
        "min": 0,
        "max": 3000,
        "step": 100
      },
      {
        "name": "maxMs",
        "type": "number",
        "required": false,
        "default": 6000,
        "unit": "ms",
        "description": "Au-dela, on ouvre quoi qu il arrive.",
        "min": 1000,
        "max": 15000,
        "step": 500
      },
      {
        "name": "ceiling",
        "type": "number",
        "required": false,
        "default": 92,
        "description": "Ou le compteur se gare tant que rien n est pret.",
        "min": 50,
        "max": 99,
        "step": 1
      },
      {
        "name": "hideCount",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Ne garder que la barre."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de la sortie, pour que le contenu entre a travers le rideau."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une boucle d images qui dure le temps du rideau, puis s arrete. La sortie est une transition CSS."
    },
    "id": "loader/counter-gate"
  },
  {
    "name": "counter-roll-loader",
    "category": "loader",
    "title": "Rouleaux de chiffres",
    "description": "Des colonnes de chiffres qui roulent sans fin, un cran a la fois, chacune a sa phase, comme un compteur qui ne s arrete pas, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CounterRollLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-font-mono"
    ],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "La legende sous les rouleaux. Chaine vide pour ne garder que les rouleaux."
      },
      {
        "name": "digits",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de rouleaux.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps de reference ; les chiffres en font une fois et demie.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un tour complet de rouleau, les dix chiffres.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des chiffres et de la legende. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation de translation par rouleau, tenue par le compositeur, aucun JavaScript apres le premier rendu. Rouleaux a l arret sous mouvement reduit."
    },
    "id": "loader/counter-roll-loader"
  },
  {
    "name": "cube-flip",
    "category": "loader",
    "title": "Cube qui bascule",
    "description": "Un cube en CSS 3D bascule d un quart de tour, marque un temps, puis bascule sur l autre axe : quatre flips par cycle, aucun JavaScript.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CubeFlip.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Arete du cube.",
        "min": 12,
        "max": 96,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un cycle, soit quatre bascules.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du cube ; les faces en sont des nuances. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Six faces plates et une seule animation de transformation 3D tenue par le compositeur, aucun JavaScript apres le premier rendu. Cube immobile, trois faces visibles, sous mouvement reduit."
    },
    "id": "loader/cube-flip"
  },
  {
    "name": "cube-fold",
    "category": "loader",
    "title": "Carre qui se plie",
    "description": "Un patron en croix dont les quatre volets se relevent un a un pour fermer une boite, puis se rabattent, en CSS 3D.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CubeFold.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 20,
        "unit": "px",
        "description": "Cote d une face. Le patron deplie en occupe trois.",
        "min": 8,
        "max": 48,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d un cycle : pliage, tenue, depliage.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des faces ; les volets en sont une nuance. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq faces plates, quatre animations de rotation 3D tenues par le compositeur, aucun JavaScript apres le premier rendu. Boite fermee et immobile sous mouvement reduit."
    },
    "id": "loader/cube-fold"
  },
  {
    "name": "curtain-wipe",
    "category": "loader",
    "title": "Plaque percee",
    "description": "Un rideau sans compteur, qui s ouvre par un trou grandissant plutot que de s effacer.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/CurtainWipe.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond du rideau."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du rideau."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps la plaque reste pleine.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "wipeMs",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree de l ouverture.",
        "min": 200,
        "max": 3000,
        "step": 100
      },
      {
        "name": "origin",
        "type": "readonly [number, number]",
        "required": false,
        "default": "50, 50",
        "description": "D ou part le trou, en pourcentage."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de l ouverture, pour que le contenu entre pendant qu elle s agrandit."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un minuteur et une transition de clip-path. Aucune mise en page recalculee, aucun JavaScript par image."
    },
    "id": "loader/curtain-wipe"
  },
  {
    "name": "dash-ring",
    "category": "loader",
    "title": "Anneau en tirets",
    "description": "Un cercle en tirets dont le motif glisse le long du trace, sans que rien ne tourne.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/DashRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Epaisseur des tirets.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "dashes",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de tirets sur le tour.",
        "min": 4,
        "max": 32,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree pour qu un tiret fasse le tour complet.",
        "min": 600,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des tirets. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule animation CSS sur le decalage du tirete, aucun JavaScript apres le premier rendu. Le decalage n est pas tenu par le compositeur : l anneau est repeint a chaque image, ce qui reste negligeable a cette taille. Tirets immobiles sous mouvement reduit."
    },
    "id": "loader/dash-ring"
  },
  {
    "name": "dna-loader",
    "category": "loader",
    "title": "Helice d ADN",
    "description": "Deux brins de points tournent l un autour de l autre, grands devant et pales derriere, relies par des barreaux, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/DnaLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Diametre d un point. L amplitude de l helice en depend.",
        "min": 3,
        "max": 14,
        "step": 1
      },
      {
        "name": "pairs",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de paires de points. Un tour d helice les traverse tous.",
        "min": 4,
        "max": 16,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un tour complet de l helice.",
        "min": 600,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points et des barreaux. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS par paire, tenues par le compositeur ; les poses au repos sont calculees une fois au rendu. Helice figee dans sa forme sous mouvement reduit."
    },
    "id": "loader/dna-loader"
  },
  {
    "name": "domino",
    "category": "loader",
    "title": "Dominos",
    "description": "Cinq dominos debout tombent l un sur l autre en accelerant, puis se relevent ensemble, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Domino.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Epaisseur d un domino. Sa hauteur et l ecart entre deux en dependent.",
        "min": 3,
        "max": 12,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un cycle complet, chute en chaine et relevement compris.",
        "min": 800,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des dominos. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq animations CSS de rotation tenues par le compositeur, aucun JavaScript apres le premier rendu. Rangee debout et immobile sous mouvement reduit."
    },
    "id": "loader/domino"
  },
  {
    "name": "dot-matrix-text",
    "category": "loader",
    "title": "Texte en matrice de points",
    "description": "Un mot dessine sur une grille de points 5x7, dont les points s allument de gauche a droite puis s eteignent dans le meme sens, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/DotMatrixText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le texte dessine. Lettres, chiffres et ponctuation courante ; les accents sont retires."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Pas de la grille, d un point au suivant.",
        "min": 2,
        "max": 10,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un cycle, allumage et extinction compris.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation d opacite par point allume, dans un SVG de quelques centaines de cercles, aucun JavaScript apres le premier rendu. Tous les points du mot allumes et immobiles sous mouvement reduit."
    },
    "id": "loader/dot-matrix-text"
  },
  {
    "name": "dots-loader",
    "category": "loader",
    "title": "Points qui respirent",
    "description": "Trois points pulsent en canon, par une seule animation CSS a delais negatifs.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/DotsLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Diametre d un point.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree d un cycle de respiration.",
        "min": 300,
        "max": 3000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Trois points pleins et immobiles sous mouvement reduit."
    },
    "id": "loader/dots-loader"
  },
  {
    "name": "dots-orbit",
    "category": "loader",
    "title": "Points en orbite",
    "description": "Trois points tournent chacun sur son orbite concentrique, l interieur plus vite que l exterieur, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/DotsOrbit.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l orbite exterieure.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree d un tour de l orbite interieure. Les autres sont plus lentes.",
        "min": 400,
        "max": 3000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points et des orbites. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un SVG de trois orbites et trois points, trois rotations CSS tenues par le compositeur. Points immobiles a des angles distincts sous mouvement reduit."
    },
    "id": "loader/dots-orbit"
  },
  {
    "name": "dual-ring",
    "category": "loader",
    "title": "Double anneau",
    "description": "Deux anneaux a deux arcs opposes chacun, qui tournent en sens contraire et se croisent en rythme.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/DualRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l anneau exterieur.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur des traits.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree d un tour, identique pour les deux anneaux.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des arcs. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux rotations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Les arcs restent en croix sous mouvement reduit."
    },
    "id": "loader/dual-ring"
  },
  {
    "name": "eclipse",
    "category": "loader",
    "title": "Eclipse",
    "description": "Un disque plein se creuse jusqu a ne plus laisser qu un anneau de lumiere, dont le halo s embrase, puis se referme.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Eclipse.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 64,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d une eclipse complete, ouverture et fermeture comprises.",
        "min": 1000,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de l anneau et du halo. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois cercles : un rayon et une epaisseur animes sur le premier, une opacite sur les deux autres, flous une fois pour toutes. Aucune superposition a masquer, aucune couleur de fond supposee. Anneau ouvert et halo allume sous mouvement reduit."
    },
    "id": "loader/eclipse"
  },
  {
    "name": "envelope",
    "category": "loader",
    "title": "Enveloppe",
    "description": "Le rabat bascule autour de sa charniere, la lettre monte hors de l enveloppe, redescend, et le rabat se referme, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Envelope.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 64,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d un cycle : ouverture, sortie, retour, fermeture.",
        "min": 1200,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des traits de l enveloppe. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS sur des elements SVG et une decoupe statique, tenues par le compositeur, aucun JavaScript apres le premier rendu. Enveloppe ouverte et lettre sortie sous mouvement reduit."
    },
    "id": "loader/envelope"
  },
  {
    "name": "equalizer",
    "category": "loader",
    "title": "Egaliseur",
    "description": "Six barres ancrees au sol montent et descendent chacune a son rythme, comme les vumetres d un egaliseur, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Equalizer.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Largeur d une barre. La hauteur maximale et l ecart en dependent.",
        "min": 2,
        "max": 14,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree de reference d un cycle ; chaque barre s en ecarte un peu.",
        "min": 400,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des barres. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Six animations CSS d echelle tenues par le compositeur, aucun JavaScript apres le premier rendu. Spectre fige a des hauteurs inegales sous mouvement reduit."
    },
    "id": "loader/equalizer"
  },
  {
    "name": "fade-gate",
    "category": "loader",
    "title": "Voile",
    "description": "Le seul rideau du lot qui assume d etre un voile : il se dissipe, et peut se depolir quand la page merite une mise au point.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/FadeGate.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond du voile."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "blurPx",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "px",
        "description": "Flou d arriere-plan. Zero laisse un voile opaque et gratuit ; au-dela, le voile devient depoli et se paye.",
        "min": 0,
        "max": 40,
        "step": 1
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Combien de temps le voile reste plein.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree de la dissipation.",
        "min": 200,
        "max": 3000,
        "step": 100
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : le voile couvre tant que c est vrai, et se dissipe au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de la dissipation, pour que le contenu entre pendant qu elle a lieu."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une opacite animee, la propriete la moins chere du navigateur. Le depoli ajoute un backdrop-filter recompose par image : il reste desactive par defaut."
    },
    "id": "loader/fade-gate"
  },
  {
    "name": "fan-blades",
    "category": "loader",
    "title": "Pales de ventilateur",
    "description": "Des pales courbes tournent a vitesse constante dans un carter circulaire, autour d un moyeu, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/FanBlades.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre du carter.",
        "min": 16,
        "max": 128,
        "step": 4
      },
      {
        "name": "blades",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de pales.",
        "min": 2,
        "max": 6,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un tour.",
        "min": 400,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des pales, du moyeu et du carter. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un groupe SVG et une rotation CSS tenue par le compositeur, aucun JavaScript apres le premier rendu. Pales immobiles sous mouvement reduit."
    },
    "id": "loader/fan-blades"
  },
  {
    "name": "flower-petals",
    "category": "loader",
    "title": "Petales qui s ouvrent",
    "description": "Huit petales s ouvrent un a un autour d un coeur, tiennent, puis se referment, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/FlowerPetals.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Cote du dessin, la fleur ouverte le remplit.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d une floraison complete, ouverture, tenue et fermeture.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des petales et du coeur. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un SVG de huit ellipses et un coeur, huit animations CSS d echelle tenues par le compositeur. Fleur ouverte et immobile sous mouvement reduit."
    },
    "id": "loader/flower-petals"
  },
  {
    "name": "gauge",
    "category": "loader",
    "title": "Jauge",
    "description": "Un arc de trois quarts de tour, gradue, qui se remplit jusqu a la valeur et l affiche ; ou balaye en attente quand rien n est mesurable.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Gauge.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 64,
        "unit": "%",
        "description": "Valeur, de 0 a 100. Ignoree en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Balayage sans valeur, quand rien n est mesurable."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Largeur de la jauge.",
        "min": 40,
        "max": 240,
        "step": 8
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Epaisseur de l arc.",
        "min": 2,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un aller du balayage indetermine.",
        "min": 400,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du remplissage. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition sur le decalage du tirete en mode determine, une animation CSS en mode indetermine ; rien ne recalcule la mise en page. Valeur sautee sans transition, balayage arrete a mi-course, sous mouvement reduit."
    },
    "id": "loader/gauge"
  },
  {
    "name": "gear-pair",
    "category": "loader",
    "title": "Deux engrenages",
    "description": "Un grand et un petit engrenage tournent en sens contraires, dents engrenees, a des vitesses qui respectent leur rapport, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/GearPair.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un tour du grand engrenage. Le petit tourne d autant plus vite.",
        "min": 1000,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des engrenages ; le petit en est une nuance. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux chemins SVG et deux rotations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Engrenages immobiles, dents engrenees, sous mouvement reduit."
    },
    "id": "loader/gear-pair"
  },
  {
    "name": "gradient-ring",
    "category": "loader",
    "title": "Anneau degrade",
    "description": "Un anneau conique qui s eteint sur tout le tour, de la tete pleine a la queue transparente, en rotation.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/GradientRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Epaisseur de l anneau.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree d un tour.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la tete. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade conique masque en anneau, une rotation CSS tenue par le compositeur, aucun JavaScript apres le premier rendu. Anneau immobile, tete en haut, sous mouvement reduit."
    },
    "id": "loader/gradient-ring"
  },
  {
    "name": "grid-fade",
    "category": "loader",
    "title": "Grille en fondu",
    "description": "Neuf points en carre s eteignent et se rallument en ondes concentriques, du centre vers les coins, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/GridFade.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Diametre d un point. L ecart entre points en depend.",
        "min": 4,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree d un cycle complet d extinction et de retour.",
        "min": 400,
        "max": 3500,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Neuf animations CSS d opacite tenues par le compositeur, aucun JavaScript apres le premier rendu. Neuf points pleins et immobiles sous mouvement reduit."
    },
    "id": "loader/grid-fade"
  },
  {
    "name": "grid-wave",
    "category": "loader",
    "title": "Grille en vague",
    "description": "Seize points en carre se soulevent et grossissent le long d une diagonale, une vague qui traverse la grille, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/GridWave.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Diametre d un point au repos. L ecart et la hauteur de la vague en dependent.",
        "min": 3,
        "max": 16,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un passage complet de la vague.",
        "min": 500,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Seize animations CSS de transformation tenues par le compositeur, aucun JavaScript apres le premier rendu. Grille plate et immobile sous mouvement reduit."
    },
    "id": "loader/grid-wave"
  },
  {
    "name": "heartbeat",
    "category": "loader",
    "title": "Coeur qui bat",
    "description": "Un coeur se contracte deux fois de suite puis se repose, et lache une onde a chaque battement, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Heartbeat.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Largeur du coeur. L onde deborde un peu autour.",
        "min": 20,
        "max": 96,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree d un cycle, double battement et repos compris.",
        "min": 600,
        "max": 3000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du coeur et de l onde. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS sur des elements SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Coeur plein a sa taille de repos, sans onde, sous mouvement reduit."
    },
    "id": "loader/heartbeat"
  },
  {
    "name": "hex-spinner",
    "category": "loader",
    "title": "Hexagone tournant",
    "description": "Un hexagone en trait tourne par crans d un sixieme de tour tandis qu un hexagone plein pulse en son centre, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/HexSpinner.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 44,
        "unit": "px",
        "description": "Largeur de l hexagone, pointe en haut.",
        "min": 16,
        "max": 128,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur du trait exterieur.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree de deux crans, soit un tiers de tour.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des deux hexagones. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux groupes SVG, deux animations de transformation tenues par le compositeur, aucun JavaScript apres le premier rendu. Hexagones alignes et immobiles sous mouvement reduit."
    },
    "id": "loader/hex-spinner"
  },
  {
    "name": "hourglass",
    "category": "loader",
    "title": "Sablier",
    "description": "Le sable coule a debit constant du haut vers le bas, puis le sablier se retourne d un geste et recommence, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Hourglass.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Hauteur du sablier.",
        "min": 24,
        "max": 120,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un cycle, ecoulement et retournement compris.",
        "min": 1200,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du verre et du sable. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre animations CSS sur des elements SVG, tenues par le compositeur, deux decoupes statiques. Sable entierement en bas, sablier droit, sous mouvement reduit."
    },
    "id": "loader/hourglass"
  },
  {
    "name": "infinity-loop",
    "category": "loader",
    "title": "Boucle infinie",
    "description": "Un trait court parcourt un huit couche, lent au bout des boucles et rapide au croisement, comme une bille sur un rail, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/InfinityLoop.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 64,
        "unit": "px",
        "description": "Largeur du huit. Sa hauteur en vaut un peu plus de la moitie.",
        "min": 32,
        "max": 160,
        "step": 2
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Epaisseur du trait et du rail.",
        "min": 1,
        "max": 10,
        "step": 0.5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un tour complet du huit.",
        "min": 800,
        "max": 5000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du trait et du rail. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS de decalage de tiret sur un trace SVG, tenue par le compositeur. Trait pose au bout d une boucle sous mouvement reduit."
    },
    "id": "loader/infinity-loop"
  },
  {
    "name": "iris-open",
    "category": "loader",
    "title": "Diaphragme",
    "description": "Un rideau fait de lames pivotantes : l ouverture est un polygone qui grandit en tournant, pas un disque.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/IrisOpen.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond des lames."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "blades",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de lames. Quatre au minimum, sinon elles ne ferment plus le cercle.",
        "min": 4,
        "max": 12,
        "step": 1
      },
      {
        "name": "turn",
        "type": "number",
        "required": false,
        "default": 26,
        "unit": "deg",
        "description": "Rotation de l ensemble pendant l ouverture.",
        "min": 0,
        "max": 90,
        "step": 2
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps le diaphragme reste ferme.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree de l ouverture.",
        "min": 200,
        "max": 3000,
        "step": 100
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : le rideau couvre tant que c est vrai, et sort au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de l ouverture, pour que le contenu entre a travers elle."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lame par element, deux transformations composees chacune. Aucun JavaScript par image."
    },
    "id": "loader/iris-open"
  },
  {
    "name": "jelly-loader",
    "category": "loader",
    "title": "Gelee qui tremble",
    "description": "Un pave arrondi s affaisse sur sa base, rebondit, et ses oscillations s eteignent avant de repartir, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/JellyLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Cote du pave au repos ; la boite reserve la place du rebond.",
        "min": 16,
        "max": 120,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un tremblement complet, jusqu a l arret.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la gelee. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation sur un seul element : l echelle est tenue par le compositeur, les rayons de coin redessinent un rectangle de quelques dizaines de pixels. Pave au repos et immobile sous mouvement reduit."
    },
    "id": "loader/jelly-loader"
  },
  {
    "name": "juggling",
    "category": "loader",
    "title": "Jonglage",
    "description": "Trois balles passent d une main a l autre : passe basse dans un sens, grand arc dans l autre, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Juggling.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Diametre d une balle. L ecart des mains et la hauteur de l arc en dependent.",
        "min": 5,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un tour complet d une balle, aller et retour.",
        "min": 800,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des balles. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Six animations CSS de transformation tenues par le compositeur, aucun JavaScript apres le premier rendu. Trois balles posees en ligne sous mouvement reduit."
    },
    "id": "loader/juggling"
  },
  {
    "name": "lazy-block",
    "category": "loader",
    "title": "Bloc differe",
    "description": "Un substitut couvre le contenu deja present, respire, puis s efface pour le laisser paraitre sans que la mise en page saute.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/LazyBlock.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Le contenu couvert, puis revele."
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Attente avant la revelation.",
        "min": 0,
        "max": 6000,
        "step": 100
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 500,
        "unit": "ms",
        "description": "Duree du croisement.",
        "min": 100,
        "max": 2000,
        "step": 50
      },
      {
        "name": "loop",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Rejouer le cycle en boucle : le regime d une vitrine ou d une maquette. A couper pour un seul passage, pilote par la page."
      },
      {
        "name": "hold",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Temps ou le contenu reste visible avant de repartir.",
        "min": 400,
        "max": 8000,
        "step": 200
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Hauteur minimale pendant l attente.",
        "min": 24,
        "max": 400,
        "step": 4
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Rayon des angles du substitut.",
        "min": 0,
        "max": 48,
        "step": 1
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement du contenu",
        "description": "Libelle annonce aux lecteurs d ecran pendant l attente."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux minuteurs, pas d abonnement a la boucle d images ; une opacite en transition et un repeint sur le substitut. Le contenu est dans le document des le depart, donc aucune mise en page ne saute. Contenu visible immediatement, sans cycle, sous mouvement reduit."
    },
    "id": "loader/lazy-block"
  },
  {
    "name": "letters-bounce",
    "category": "loader",
    "title": "Lettres qui sautent",
    "description": "Chaque lettre du mot s ecrase, saute et retombe a son tour, de gauche a droite, puis le mot se pose avant le saut suivant, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/LettersBounce.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le texte affiche, lettre par lettre."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 18,
        "unit": "px",
        "description": "Corps du texte.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un cycle, la pause comprise.",
        "min": 800,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du texte. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation de transformation par lettre, tenue par le compositeur, aucun JavaScript apres le premier rendu. Mot pose et immobile sous mouvement reduit."
    },
    "id": "loader/letters-bounce"
  },
  {
    "name": "letters-gate",
    "category": "loader",
    "title": "Rideau a lettres",
    "description": "Un mot qui s assemble caractere par caractere sur l horloge du moteur, puis une plaque qui se rabat comme un couvercle.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/LettersGate.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond de la plaque."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du mot."
      },
      {
        "name": "word",
        "type": "string",
        "required": false,
        "default": "ODORO",
        "description": "Le mot qui s assemble. Sa longueur est un reglage de duree."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent avant le mot."
      },
      {
        "name": "letterMs",
        "type": "number",
        "required": false,
        "default": 130,
        "unit": "ms",
        "description": "Temps entre deux caracteres.",
        "min": 40,
        "max": 400,
        "step": 10
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 650,
        "unit": "ms",
        "description": "Pause apres le dernier caractere.",
        "min": 0,
        "max": 3000,
        "step": 50
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree du rabattement.",
        "min": 200,
        "max": 3000,
        "step": 50
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : le rideau attend tant que c est vrai, meme le mot assemble, et sort au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut du rabattement, pour que le contenu entre pendant que le couvercle s ouvre."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a l horloge du moteur pendant l assemblage, qui se retire de lui-meme. Une ecriture par lettre, aucun rendu React par image."
    },
    "id": "loader/letters-gate"
  },
  {
    "name": "liquid-fill",
    "category": "loader",
    "title": "Remplissage liquide",
    "description": "Un bocal rond dont le niveau monte, la surface prise par deux nappes qui derivent en sens contraires ; ou une maree sans fin quand rien n est mesurable.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/LiquidFill.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 62,
        "unit": "%",
        "description": "Niveau du liquide, de 0 a 100. Ignore en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Maree qui monte et redescend sans valeur, quand rien n est mesurable."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 88,
        "unit": "px",
        "description": "Diametre du bocal.",
        "min": 32,
        "max": 240,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d une derive de nappe, soit une periode de vague.",
        "min": 800,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du liquide et du bocal. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux translations horizontales et une translation verticale, toutes tenues par le compositeur, dans un SVG de trois formes. Nappes immobiles et niveau pose sans transition sous mouvement reduit."
    },
    "id": "loader/liquid-fill"
  },
  {
    "name": "loading-dots-text",
    "category": "loader",
    "title": "Chargement, puis des points",
    "description": "Le mot reste ; trois points s ajoutent l un apres l autre, puis disparaissent ensemble, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/LoadingDotsText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le mot affiche, avant les points."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps du texte.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un cycle, du mot seul aux trois points.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du texte. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations d opacite par paliers, aucun JavaScript apres le premier rendu. Le mot et ses trois points, immobiles, sous mouvement reduit."
    },
    "id": "loader/loading-dots-text"
  },
  {
    "name": "logo-draw",
    "category": "loader",
    "title": "Logo qui se trace",
    "description": "Le contour d une marque se dessine d un geste, se remplit une fois ferme, puis se vide et s efface dans le meme sens, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/LogoDraw.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 64,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 24,
        "max": 200,
        "step": 4
      },
      {
        "name": "path",
        "type": "string",
        "required": false,
        "default": "M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z",
        "description": "Trace du logo, en donnees de chemin SVG. Un seul chemin ferme, pour que le remplissage ait un sens."
      },
      {
        "name": "viewBox",
        "type": "string",
        "required": false,
        "default": "0 0 100 100",
        "description": "Vue du trace. A changer en meme temps que le chemin."
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "unites de la vue",
        "description": "Epaisseur du trait, dans les unites du trace.",
        "min": 1,
        "max": 12,
        "step": 0.5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2800,
        "unit": "ms",
        "description": "Duree d un cycle : trace, remplissage, effacement.",
        "min": 1200,
        "max": 7000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du trait et du remplissage. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS sur des elements SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Marque entierement tracee et pleine sous mouvement reduit."
    },
    "id": "loader/logo-draw"
  },
  {
    "name": "matrix-digits",
    "category": "loader",
    "title": "Chiffres qui se figent",
    "description": "Un code de chiffres qui defilent tous, puis se verrouillent un a un de gauche a droite, tiennent, et repartent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/MatrixDigits.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-font-mono"
    ],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "La legende sous le code. Chaine vide pour ne garder que le code."
      },
      {
        "name": "digits",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de chiffres du code.",
        "min": 3,
        "max": 10,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps de reference ; les chiffres en font une fois et demie.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d un cycle : defilement, verrouillage, tenue.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des chiffres et de la legende. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle du moteur qui ecrit les chiffres directement dans le DOM, une vingtaine de fois par seconde, sans rendu React par image. Code verrouille et immobile sous mouvement reduit."
    },
    "id": "loader/matrix-digits"
  },
  {
    "name": "moon-phases",
    "category": "loader",
    "title": "Phases de lune",
    "description": "Un disque eteint sur lequel la part eclairee croit jusqu a la pleine lune puis decroit de l autre bord, par interpolation d un seul chemin SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/MoonPhases.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de la lune.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3600,
        "unit": "ms",
        "description": "Duree d une lunaison complete, de la nouvelle lune a la suivante.",
        "min": 1200,
        "max": 10000,
        "step": 200
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la lune. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul chemin SVG dont le trace est interpole par le navigateur entre trois etats, plus un retournement instantane a la pleine lune ; aucun JavaScript apres le premier rendu. Premier quartier immobile sous mouvement reduit."
    },
    "id": "loader/moon-phases"
  },
  {
    "name": "newton-cradle",
    "category": "loader",
    "title": "Pendule de Newton",
    "description": "Cinq billes suspendues : celle de gauche frappe, celle de droite s envole, et retour, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/NewtonCradle.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Diametre d une bille. La longueur des fils en depend.",
        "min": 5,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un aller-retour complet, gauche puis droite.",
        "min": 600,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des billes, des fils et de la barre. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS de rotation tenues par le compositeur, les trois billes du milieu ne bougent jamais. Cinq billes au repos, alignees, sous mouvement reduit."
    },
    "id": "loader/newton-cradle"
  },
  {
    "name": "orbit-loader",
    "category": "loader",
    "title": "Chargeur orbital",
    "description": "Trois arcs concentriques tournent a contresens, sans rien pretendre compter.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/OrbitLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l anneau exterieur.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree d un tour de l anneau exterieur.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des arcs. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois rotations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Sous mouvement reduit les arcs restent en place."
    },
    "id": "loader/orbit-loader"
  },
  {
    "name": "paper-plane",
    "category": "loader",
    "title": "Avion en papier",
    "description": "Un avion traverse la vue en piquant puis en remontant, nez toujours dans l axe de sa course, et laisse la trace exacte de son passage, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PaperPlane.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 80,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 40,
        "max": 240,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d un vol complet, fondu compris.",
        "min": 1200,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de l avion et de sa trainee. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS sur des elements SVG, tenues par le compositeur ; la courbe est echantillonnee une fois au chargement du module, rien n est lu dans le document. Avion pose au bout de sa course et trainee complete sous mouvement reduit."
    },
    "id": "loader/paper-plane"
  },
  {
    "name": "pendulum",
    "category": "loader",
    "title": "Pendule",
    "description": "Une masse au bout d une tige oscille le long d un arc en pointille, lente aux extremes et rapide a la verticale, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Pendulum.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Diametre de la masse. La longueur de la tige en depend.",
        "min": 6,
        "max": 28,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un aller-retour complet.",
        "min": 600,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la masse, de la tige, du pivot et de l arc. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS de rotation tenue par le compositeur, aucun JavaScript apres le premier rendu. Masse a la verticale sous son arc sous mouvement reduit."
    },
    "id": "loader/pendulum"
  },
  {
    "name": "percent-counter",
    "category": "loader",
    "title": "Compteur en pourcentage",
    "description": "Un chiffre qui monte de zero a cent avec une acceleration douce, tient, et repart ; ou qui rejoint la valeur qu on lui donne.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PercentCounter.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "La legende sous le chiffre. Chaine vide pour ne garder que le chiffre."
      },
      {
        "name": "value",
        "type": "number",
        "required": false,
        "description": "Progression reelle, de 0 a 100. Sans elle, le compteur boucle."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps de reference ; le chiffre en fait deux fois et demie.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d une montee de zero a cent, ou d un rattrapage de valeur.",
        "min": 600,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du chiffre et de la legende. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle du moteur qui ecrit le chiffre directement dans le DOM, sans rendu React par image. Chiffre fige sous mouvement reduit."
    },
    "id": "loader/percent-counter"
  },
  {
    "name": "percent-ring",
    "category": "loader",
    "title": "Anneau de progression",
    "description": "Un anneau complet qui se remplit depuis le sommet, le pourcentage au centre ; ou un arc qui tourne quand rien n est mesurable.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PercentRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 42,
        "unit": "%",
        "description": "Progression, de 0 a 100. Ignoree en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Arc tournant sans valeur, quand rien n est mesurable."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 80,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 32,
        "max": 240,
        "step": 8
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Epaisseur de l anneau.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree d un tour de l arc indetermine.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du remplissage. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition sur le decalage du tirete en mode determine, une rotation CSS en mode indetermine ; rien ne recalcule la mise en page. Valeur sautee sans transition, arc immobile au sommet, sous mouvement reduit."
    },
    "id": "loader/percent-ring"
  },
  {
    "name": "pinwheel",
    "category": "loader",
    "title": "Moulinet",
    "description": "Quatre pales triangulaires en deux nuances tournent par rafales, une acceleration et un ralenti par demi-tour, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Pinwheel.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Diametre du moulinet.",
        "min": 16,
        "max": 128,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un tour, soit deux rafales.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des pales ; une pale sur deux en est une nuance. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre pales decoupees par clip-path et une seule rotation CSS tenue par le compositeur, aucun JavaScript apres le premier rendu. Moulinet immobile sous mouvement reduit."
    },
    "id": "loader/pinwheel"
  },
  {
    "name": "pixel-dissolve",
    "category": "loader",
    "title": "Dissolution en carreaux",
    "description": "Un rideau qui se troue carreau par carreau, dans un desordre calcule par pas d or plutot que tire au sort.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PixelDissolve.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond des carreaux."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 20,
        "description": "Nombre de colonnes.",
        "min": 4,
        "max": 32,
        "step": 1
      },
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de rangees.",
        "min": 3,
        "max": 20,
        "step": 1
      },
      {
        "name": "spreadMs",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Etalement des departs entre le premier carreau et le dernier.",
        "min": 0,
        "max": 2000,
        "step": 50
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps la grille reste pleine.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 420,
        "unit": "ms",
        "description": "Duree de disparition d un carreau.",
        "min": 120,
        "max": 1500,
        "step": 20
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : la grille couvre tant que c est vrai, et se dissout au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de la dissolution, pour que le contenu se decouvre a travers elle."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un element par carreau : deux cent quarante aux valeurs par defaut, six cents au maximum des bornes. Opacite et echelle seulement, aucun JavaScript par image."
    },
    "id": "loader/pixel-dissolve"
  },
  {
    "name": "placeholder-image",
    "category": "loader",
    "title": "Cadre d image",
    "description": "Un rectangle au bon rapport, cerne d un filet pointille, avec au centre le pictogramme de l image qui manque.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PlaceholderImage.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface",
      "--o-theme-muted"
    ],
    "props": [
      {
        "name": "ratio",
        "type": "string",
        "required": false,
        "default": "16/9",
        "description": "Rapport largeur sur hauteur du cadre.",
        "options": [
          "16/9",
          "4/3",
          "3/2",
          "1/1"
        ]
      },
      {
        "name": "icon",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Largeur du pictogramme.",
        "min": 16,
        "max": 96,
        "step": 2
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Rayon des angles.",
        "min": 0,
        "max": 40,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Faire passer un reflet sur le cadre."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un passage du reflet.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Image en attente",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un pictogramme en ligne et, au plus, une transformation sur une couche de reflet ; aucun JavaScript apres le premier rendu. Le rapport reserve la hauteur. Cadre entier et sans reflet sous mouvement reduit."
    },
    "id": "loader/placeholder-image"
  },
  {
    "name": "polygon-morph",
    "category": "loader",
    "title": "Polygone qui gagne des cotes",
    "description": "Un polygone en trait passe du triangle a l hexagone un cote a la fois, puis les reperd, par interpolation d un chemin SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PolygonMorph.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 44,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 16,
        "max": 128,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 10,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un cycle : du triangle a l hexagone et retour.",
        "min": 1200,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du trait et du voile interieur. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul chemin SVG de soixante points dont le trace est interpole par le navigateur, aucun filtre, aucun JavaScript apres le premier rendu. Hexagone immobile sous mouvement reduit."
    },
    "id": "loader/polygon-morph"
  },
  {
    "name": "progress-bar",
    "category": "loader",
    "title": "Barre de progression",
    "description": "Une barre dans le flux, avec son etiquette et sa valeur, remplie par une progression reelle ou parcourue d un segment qui respire quand rien n est mesurable.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ProgressBar.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 42,
        "unit": "%",
        "description": "Progression, de 0 a 100. Ignoree en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Segment qui parcourt la piste sans valeur, quand rien n est mesurable."
      },
      {
        "name": "showLabel",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Afficher l etiquette et la valeur au-dessus de la piste."
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Epaisseur de la piste.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un aller du segment indetermine.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du remplissage. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Etiquette affichee et annoncee aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une echelle de transformation en mode determine, une animation CSS en mode indetermine : rien ne recalcule la mise en page. Valeur sautee sans transition, piste pleine et attenuee, sous mouvement reduit."
    },
    "id": "loader/progress-bar"
  },
  {
    "name": "progress-steps",
    "category": "loader",
    "title": "Etapes de progression",
    "description": "Des etapes numerotees reliees par une barre : la progression remplit la barre et coche les etapes franchies, ou un reflet parcourt la barre quand rien n est mesurable.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ProgressSteps.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "%",
        "description": "Progression, de 0 a 100. Ignoree en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Reflet qui parcourt la barre sans valeur, quand rien n est mesurable."
      },
      {
        "name": "steps",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre d etapes, reparties a egale distance sur la barre.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 28,
        "unit": "px",
        "description": "Diametre d une etape. La taille du numero en depend.",
        "min": 16,
        "max": 56,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Periode de la pulsation de l etape en cours et du reflet indetermine.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des etapes franchies et de la barre. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une echelle de transformation et des transitions de couleur en mode determine, une animation CSS en mode indetermine : rien ne recalcule la mise en page. Valeur sautee sans transition, etape en cours sans pulsation, barre pleine et attenuee, sous mouvement reduit."
    },
    "id": "loader/progress-steps"
  },
  {
    "name": "pulse-block",
    "category": "loader",
    "title": "Bloc qui pulse",
    "description": "Une surface en attente dont le ton respire entre le filet et la surface, sans bande et sans jamais devenir transparente.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PulseBlock.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Hauteur du bloc.",
        "min": 8,
        "max": 400,
        "step": 4
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Rayon des angles.",
        "min": 0,
        "max": 48,
        "step": 1
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Amplitude de la respiration, de 0 (immobile) a 1 (jusqu a la surface).",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un cycle.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un repeint par image sur un seul element, sans mise en page recalculee ni couche supplementaire ; aucun JavaScript apres le premier rendu. Ton plein et fige sous mouvement reduit."
    },
    "id": "loader/pulse-block"
  },
  {
    "name": "pulse-dot",
    "category": "loader",
    "title": "Point qui pulse",
    "description": "Un point plein d ou s echappent deux ondes concentriques, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/PulseDot.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Diametre de l onde a son extension maximale.",
        "min": 12,
        "max": 96,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree de vie d une onde, de son depart a son extinction.",
        "min": 500,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du point et des ondes. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS tenues par le compositeur, aucun JavaScript apres le premier rendu. Point plein et une onde figee a mi-course sous mouvement reduit."
    },
    "id": "loader/pulse-dot"
  },
  {
    "name": "ring-dots",
    "category": "loader",
    "title": "Points en couronne",
    "description": "Des points fixes disposes en cercle, dont l eclat tourne de l un a l autre en fondu.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/RingDots.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Diametre de la couronne.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "dot",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Diametre d un point.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de points sur la couronne.",
        "min": 4,
        "max": 16,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree pour que l eclat fasse le tour.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation d opacite par point, tenue par le compositeur, aucun JavaScript apres le premier rendu. Tous les points pleins sous mouvement reduit."
    },
    "id": "loader/ring-dots"
  },
  {
    "name": "ring-spinner",
    "category": "loader",
    "title": "Anneau tournant",
    "description": "Un seul arc court sur une piste attenuee, epaisseur reglable, une rotation CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/RingSpinner.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 16,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree d un tour.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de l arc. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une rotation CSS sur un seul element, aucun JavaScript apres le premier rendu. Arc immobile en haut de la piste sous mouvement reduit."
    },
    "id": "loader/ring-spinner"
  },
  {
    "name": "ripple-loader",
    "category": "loader",
    "title": "Ondes concentriques",
    "description": "Quatre anneaux fixes qu une crete traverse du centre vers le bord : la structure reste, seul le passage se deplace, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/RippleLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Diametre de l anneau exterieur.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un passage complet de la crete.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des anneaux. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule regle d animation partagee par quatre anneaux, decalee par des delais negatifs ; echelle et opacite sont tenues par le compositeur. Quatre anneaux poses et immobiles sous mouvement reduit."
    },
    "id": "loader/ripple-loader"
  },
  {
    "name": "rocket",
    "category": "loader",
    "title": "Fusee",
    "description": "Une fusee arrive en freinant par le bas, s appuie, puis quitte la vue par le haut en accelerant ; sa flamme s allonge et vacille a deux rythmes distincts.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Rocket.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 72,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 32,
        "max": 200,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2200,
        "unit": "ms",
        "description": "Duree d un decollage complet. Le vacillement de la flamme en est le quatorzieme.",
        "min": 1000,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la fusee et de sa flamme. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS sur des elements SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Fusee posee et flamme stable sous mouvement reduit."
    },
    "id": "loader/rocket"
  },
  {
    "name": "route-path",
    "category": "loader",
    "title": "Itineraire",
    "description": "Une route se dessine du depart vers la destination, qui s allume a l arrivee, puis le trace s efface et le parcours reprend, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/RoutePath.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 72,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 32,
        "max": 200,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Epaisseur de la route.",
        "min": 1,
        "max": 10,
        "step": 0.5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un parcours complet, effacement compris.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la route et des reperes. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS sur des elements SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Route entierement tracee et destination allumee sous mouvement reduit."
    },
    "id": "loader/route-path"
  },
  {
    "name": "scanner-line",
    "category": "loader",
    "title": "Ligne de balayage",
    "description": "Un faisceau a coeur net parcourt une zone bornee par quatre equerres, marque un temps a chaque extremite, et repart, en CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ScannerLine.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 160,
        "unit": "px",
        "description": "Largeur de la zone examinee.",
        "min": 64,
        "max": 480,
        "step": 8
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Hauteur de la zone examinee. Elle fixe la course du faisceau.",
        "min": 32,
        "max": 320,
        "step": 8
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2200,
        "unit": "ms",
        "description": "Duree d un aller-retour complet, temps d arret compris.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du cadre et du faisceau. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule animation CSS de deplacement, tenue par le compositeur, aucun JavaScript apres le premier rendu. Faisceau pose en bas de la zone sous mouvement reduit."
    },
    "id": "loader/scanner-line"
  },
  {
    "name": "scramble-loader",
    "category": "loader",
    "title": "Texte brouille qui se resout",
    "description": "Un mot brouille de signes qui se resout caractere par caractere dans un ordre aleatoire, tient en tremblant, puis se brouille de nouveau.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ScrambleLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-font-mono"
    ],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le texte qui se resout."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps du texte.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2200,
        "unit": "ms",
        "description": "Duree de la resolution, du brouillage complet au texte net.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du texte. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle du moteur qui ecrit les caracteres directement dans le DOM, une vingtaine de fois par seconde, sans rendu React par image. Texte net et immobile sous mouvement reduit."
    },
    "id": "loader/scramble-loader"
  },
  {
    "name": "segment-ring",
    "category": "loader",
    "title": "Anneau a segments",
    "description": "Un anneau en segments fixes qui s allument un a un et s eteignent lentement derriere le front.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SegmentRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Epaisseur des segments.",
        "min": 1,
        "max": 14,
        "step": 1
      },
      {
        "name": "segments",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de segments sur le tour.",
        "min": 3,
        "max": 16,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree pour que le front fasse le tour.",
        "min": 400,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des segments. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation d opacite par segment, tenue par le compositeur, aucun JavaScript apres le premier rendu. Tous les segments allumes sous mouvement reduit."
    },
    "id": "loader/segment-ring"
  },
  {
    "name": "shape-morph",
    "category": "loader",
    "title": "Rond, carre, triangle",
    "description": "Une forme pleine passe du rond au carre puis au triangle et revient, par interpolation d un seul chemin SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ShapeMorph.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 16,
        "max": 128,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un cycle complet, les trois formes comprises.",
        "min": 900,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la forme. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul chemin SVG dont le trace est interpole par le navigateur, aucun filtre, aucun JavaScript apres le premier rendu. Rond plein et immobile sous mouvement reduit."
    },
    "id": "loader/shape-morph"
  },
  {
    "name": "shimmer-block",
    "category": "loader",
    "title": "Bloc balaye",
    "description": "Le bloc nu d un squelette, traverse par un reflet oblique peint dans son propre fond : aucune couche a empiler, la bande suit les angles arrondis.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ShimmerBlock.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Hauteur du bloc.",
        "min": 8,
        "max": 400,
        "step": 4
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Rayon des angles.",
        "min": 0,
        "max": 48,
        "step": 1
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 110,
        "unit": "deg",
        "description": "Obliquite de la bande.",
        "min": 60,
        "max": 160,
        "step": 5
      },
      {
        "name": "band",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "%",
        "description": "Demi-largeur de la bande, en pourcentage de l image de fond.",
        "min": 4,
        "max": 40,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un passage de la bande.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une position de fond animee sur un seul element, aucun JavaScript apres le premier rendu. Fond plein et sans bande sous mouvement reduit."
    },
    "id": "loader/shimmer-block"
  },
  {
    "name": "shutter",
    "category": "loader",
    "title": "Obturateur",
    "description": "Un rideau en lamelles verticales qui partent une sur deux vers le haut et vers le bas : la page entre par un peigne qui s ecarte.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Shutter.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond des lamelles."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "blades",
        "type": "number",
        "required": false,
        "default": 12,
        "description": "Nombre de lamelles.",
        "min": 2,
        "max": 32,
        "step": 1
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "ms",
        "description": "Decalage entre deux lamelles.",
        "min": 0,
        "max": 150,
        "step": 2
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps l obturateur reste ferme.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 750,
        "unit": "ms",
        "description": "Duree du depart d une lamelle.",
        "min": 200,
        "max": 2000,
        "step": 50
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : l obturateur couvre tant que c est vrai, et s ouvre au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de la sortie, pour que le contenu entre par le peigne."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lamelle par element, une translation chacune, decalee par un delai CSS. Aucun JavaScript par image."
    },
    "id": "loader/shutter"
  },
  {
    "name": "signal-bars",
    "category": "loader",
    "title": "Barres de signal",
    "description": "Les barres s allument l une apres l autre, de la plus courte a la plus haute, par une seule animation CSS decalee dans le temps.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SignalBars.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Hauteur de la barre la plus haute. La largeur et l ecart en decoulent.",
        "min": 12,
        "max": 96,
        "step": 2
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de barres.",
        "min": 2,
        "max": 7,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un cycle complet. Le retard entre deux barres en est une fraction.",
        "min": 600,
        "max": 4000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des barres. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS unique, partagee par toutes les barres et decalee par un retard, tenue par le compositeur. Toutes les barres pleines et immobiles sous mouvement reduit."
    },
    "id": "loader/signal-bars"
  },
  {
    "name": "skeleton-avatar",
    "category": "loader",
    "title": "Avatar en attente",
    "description": "Un disque et ses lignes a cote, nom puis role, repetable en liste de membres : le motif d une identite qui n est pas encore arrivee.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SkeletonAvatar.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Nombre de personnes en attente.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "lines",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de lignes a cote du disque.",
        "min": 1,
        "max": 4,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 44,
        "unit": "px",
        "description": "Diametre du disque.",
        "min": 20,
        "max": 96,
        "step": 2
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Rayon des angles des lignes.",
        "min": 0,
        "max": 16,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reflet qui traverse les blocs plutot qu une pulsation d ensemble."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un passage du reflet ou d une pulsation.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement du profil",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation par bloc, ou une opacite, aucun JavaScript apres le premier rendu. Blocs pleins et immobiles sous mouvement reduit."
    },
    "id": "loader/skeleton-avatar"
  },
  {
    "name": "skeleton-card",
    "category": "loader",
    "title": "Carte en attente",
    "description": "La carte est deja dessinee, surface et filet compris ; seuls son image, son titre, ses lignes et son pied restent des blocs vides.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SkeletonCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "lines",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de lignes de texte sous le titre.",
        "min": 0,
        "max": 6,
        "step": 1
      },
      {
        "name": "media",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reserver la place d une image en haut de la carte."
      },
      {
        "name": "footer",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reserver la place d un pied : pastille et legende."
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Rayon des angles de la carte.",
        "min": 0,
        "max": 32,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reflet qui traverse les blocs plutot qu une pulsation d ensemble."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un passage du reflet ou d une pulsation.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement de la carte",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation par bloc, ou une opacite : la carte elle-meme ne bouge jamais, aucun JavaScript apres le premier rendu. Blocs pleins et immobiles sous mouvement reduit."
    },
    "id": "loader/skeleton-card"
  },
  {
    "name": "skeleton-grid",
    "category": "loader",
    "title": "Grille en attente",
    "description": "Des vignettes au meme rapport, chacune avec sa legende, balayees en diagonale : la galerie occupe deja la place exacte de ses images.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SkeletonGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 2,
        "description": "Nombre de rangees.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de colonnes.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "ratio",
        "type": "string",
        "required": false,
        "default": "4/3",
        "description": "Rapport largeur sur hauteur d une vignette.",
        "options": [
          "16/9",
          "4/3",
          "3/2",
          "1/1"
        ]
      },
      {
        "name": "caption",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reserver la place d une legende sous chaque vignette."
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Ecart entre les vignettes.",
        "min": 4,
        "max": 40,
        "step": 2
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Rayon des angles d une vignette.",
        "min": 0,
        "max": 28,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reflet qui traverse les vignettes plutot qu une pulsation d ensemble."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un passage du reflet ou d une pulsation.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement de la galerie",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation par vignette, ou une opacite, aucun JavaScript apres le premier rendu. Le rapport reserve la hauteur : aucune mise en page ne saute a l arrivee des images. Vignettes pleines et immobiles sous mouvement reduit."
    },
    "id": "loader/skeleton-grid"
  },
  {
    "name": "skeleton-lines",
    "category": "loader",
    "title": "Lignes en attente",
    "description": "Un paragraphe remplace par ses lignes, la derniere plus courte comme une vraie fin de texte, parcourues d un reflet ou pulsees.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SkeletonLines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "lines",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de lignes.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Epaisseur d une ligne.",
        "min": 6,
        "max": 28,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Rayon des angles d une ligne.",
        "min": 0,
        "max": 16,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reflet qui traverse les lignes plutot qu une pulsation d ensemble."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un passage du reflet ou d une pulsation.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement du contenu",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation par ligne, ou une opacite : rien ne recalcule la mise en page, aucun JavaScript apres le premier rendu. Lignes pleines et immobiles sous mouvement reduit."
    },
    "id": "loader/skeleton-lines"
  },
  {
    "name": "skeleton-table",
    "category": "loader",
    "title": "Tableau en attente",
    "description": "Des rangees separees par leurs filets, une premiere colonne large et des cellules de longueurs inegales : un tableau se lit avant ses donnees.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SkeletonTable.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-theme-surface"
    ],
    "props": [
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de rangees de donnees, en-tete exclu.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de colonnes.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "header",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Dessiner une rangee d en-tete plus dense."
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Hauteur d une cellule.",
        "min": 6,
        "max": 24,
        "step": 1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Rayon des angles d une cellule.",
        "min": 0,
        "max": 12,
        "step": 1
      },
      {
        "name": "shimmer",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Reflet qui traverse les cellules plutot qu une pulsation d ensemble."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un passage du reflet ou d une pulsation.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement du tableau",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation par cellule, ou une opacite, aucun JavaScript apres le premier rendu. Longueurs deterministes : aucun tressaillement d un rendu a l autre. Cellules pleines et immobiles sous mouvement reduit."
    },
    "id": "loader/skeleton-table"
  },
  {
    "name": "snake",
    "category": "loader",
    "title": "Serpent",
    "description": "Un serpent de quatre segments parcourt une grille de quatre par quatre en zigzag, sans jamais se croiser, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Snake.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 7,
        "unit": "px",
        "description": "Cote d un segment. L ecart de la grille en depend.",
        "min": 4,
        "max": 18,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un parcours complet de la grille.",
        "min": 600,
        "max": 5000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des segments. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Seize animations CSS d opacite tenues par le compositeur, aucun JavaScript apres le premier rendu. Le serpent reste pose sur ses quatre premieres cases sous mouvement reduit."
    },
    "id": "loader/snake"
  },
  {
    "name": "sonar-loader",
    "category": "loader",
    "title": "Balayage radar",
    "description": "Un faisceau tourne sur un cadran gradue et rallume deux echos au moment exact ou il les atteint, la traine faite de secteurs empiles.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SonarLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 72,
        "unit": "px",
        "description": "Cote du cadran.",
        "min": 32,
        "max": 200,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un tour de faisceau.",
        "min": 800,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du cadran, du faisceau et des echos. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une rotation de groupe et deux opacites, tenues par le compositeur ; les huit secteurs de la traine sont traces une fois au chargement du module. Faisceau arrete en travers du cadran et echos allumes sous mouvement reduit."
    },
    "id": "loader/sonar-loader"
  },
  {
    "name": "spinner-to-check",
    "category": "loader",
    "title": "Anneau qui conclut",
    "description": "Un arc tourne pendant l attente, s immobilise a son angle et se referme en cercle plein a la reponse, puis la marque du resultat se trace dedans, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SpinnerToCheck.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Epaisseur de l anneau et de la marque.",
        "min": 2,
        "max": 14,
        "step": 0.5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree d un tour de l arc. La fermeture et le trace en sont des fractions.",
        "min": 400,
        "max": 3000,
        "step": 50
      },
      {
        "name": "state",
        "type": "string",
        "required": false,
        "default": "chargement",
        "description": "Etat de l operation. Le libelle annonce change avec lui.",
        "options": [
          "chargement",
          "succes",
          "echec"
        ]
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de l anneau et de la marque. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce pendant l attente."
      },
      {
        "name": "labelSucces",
        "type": "string",
        "required": false,
        "default": "Termine",
        "description": "Libelle annonce au succes."
      },
      {
        "name": "labelEchec",
        "type": "string",
        "required": false,
        "default": "Echec",
        "description": "Libelle annonce a l echec."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS sur des elements SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Arc pose ou anneau ferme et marque tracee sous mouvement reduit, selon l etat."
    },
    "id": "loader/spinner-to-check"
  },
  {
    "name": "spiral-dots",
    "category": "loader",
    "title": "Points en spirale",
    "description": "Quatorze points poses le long d une spirale s allument tour a tour du centre vers l exterieur, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SpiralDots.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Cote du dessin. Les points grandissent avec lui.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Duree d un parcours complet de la spirale.",
        "min": 600,
        "max": 5000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des points. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un SVG de quatorze cercles, animes en opacite et en echelle par CSS. La spirale reste dessinee, en degrade fixe du centre vers l exterieur, sous mouvement reduit."
    },
    "id": "loader/spiral-dots"
  },
  {
    "name": "split-curtain",
    "category": "loader",
    "title": "Rideau a deux pans",
    "description": "Deux pans coupes par une couture visible, qui s ecartent en sens opposes et laissent la page entrer entre eux.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SplitCurtain.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond des pans."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre du rideau : couture et libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "axis",
        "type": "'horizontal' | 'vertical'",
        "required": false,
        "default": "horizontal",
        "description": "Sens de l ecartement.",
        "options": [
          "horizontal",
          "vertical"
        ]
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps le rideau reste ferme.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree de l ecartement.",
        "min": 200,
        "max": 3000,
        "step": 100
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : le rideau couvre tant que c est vrai, et sort au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut de la sortie, pour que le contenu entre a travers l ouverture."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux translations composees, un minuteur. Aucun JavaScript par image, aucune mise en page recalculee."
    },
    "id": "loader/split-curtain"
  },
  {
    "name": "square-morph",
    "category": "loader",
    "title": "Carre qui s arrondit",
    "description": "Un carre plein fait un demi-tour en devenant rond, puis retrouve ses angles en finissant le tour, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SquareMorph.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Cote du carre.",
        "min": 12,
        "max": 96,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un tour complet.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la forme. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul element, une animation de transformation et de rayon de bordure, aucun JavaScript apres le premier rendu. Carre droit et immobile sous mouvement reduit."
    },
    "id": "loader/square-morph"
  },
  {
    "name": "stairs",
    "category": "loader",
    "title": "Escalier",
    "description": "Un escalier de cinq marches et un carre qui les gravit en sautant, puis reparait en bas, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Stairs.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Largeur d une marche, qui est aussi la hauteur d un palier et le cote du carre.",
        "min": 4,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d une montee complete, retour en bas compris.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des marches et du carre. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule animation CSS de translation tenue par le compositeur, aucun JavaScript apres le premier rendu. Carre pose sur la marche du haut, immobile, sous mouvement reduit."
    },
    "id": "loader/stairs"
  },
  {
    "name": "sun-rays",
    "category": "loader",
    "title": "Soleil aux rayons qui tournent",
    "description": "Un disque fixe, douze rayons qui s allongent en alternance, et une couronne qui tourne huit fois plus lentement qu ils ne respirent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/SunRays.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d une respiration de rayon ; le tour de couronne dure huit fois plus.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du soleil. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule regle d animation partagee par douze segments, plus une rotation de groupe, toutes tenues par le compositeur. Rayons a leur longueur de repos et couronne arretee sous mouvement reduit."
    },
    "id": "loader/sun-rays"
  },
  {
    "name": "tetris",
    "category": "loader",
    "title": "Tetris",
    "description": "Trois pieces tombent cran par cran dans un puits de quatre cases, completent trois lignes qui clignotent et s effacent, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Tetris.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Cote d une case. Le puits en fait quatre de large et quatre de haut.",
        "min": 4,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d un cycle complet, chute des trois pieces et effacement compris.",
        "min": 1200,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des pieces. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Trois animations CSS de translation par paliers tenues par le compositeur, aucun JavaScript apres le premier rendu. Puits rempli et immobile sous mouvement reduit."
    },
    "id": "loader/tetris"
  },
  {
    "name": "text-shimmer-loader",
    "category": "loader",
    "title": "Texte en attente, balaye",
    "description": "Un mot eteint, qu une bande de pleine encre traverse en boucle : l attente se lit dans le texte lui-meme, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/TextShimmerLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le texte affiche."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps du texte.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un passage de la bande.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du texte et de la bande. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation de position de fond decoupee par le texte, aucun JavaScript apres le premier rendu. Texte plein et immobile sous mouvement reduit."
    },
    "id": "loader/text-shimmer-loader"
  },
  {
    "name": "top-loader",
    "category": "loader",
    "title": "Barre de chargement",
    "description": "Une ligne fine en haut du conteneur, pilotee par une progression reelle ou balayee sans pretendre mesurer.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/TopLoader.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-sky-400",
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "progress",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "%",
        "description": "Progression, de 0 a 100. Ignoree en mode indetermine.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "indeterminate",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Balayage sans valeur, quand rien n est mesurable."
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur de la barre.",
        "min": 1,
        "max": 8,
        "step": 1
      },
      {
        "name": "fixed",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Ancrer a la fenetre plutot qu au conteneur."
      },
      {
        "name": "from",
        "type": "string",
        "required": false,
        "description": "Depart du degrade. Une valeur, pas un role."
      },
      {
        "name": "to",
        "type": "string",
        "required": false,
        "description": "Arrivee du degrade. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une echelle de transformation en mode determine, une animation CSS en mode indetermine : rien ne recalcule la mise en page. Barre pleine et attenuee, immobile, sous mouvement reduit."
    },
    "id": "loader/top-loader"
  },
  {
    "name": "triangle-spinner",
    "category": "loader",
    "title": "Triangle qui se trace",
    "description": "Un triangle en trait se dessine sur sa piste depuis le sommet, puis s efface dans le meme sens, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/TriangleSpinner.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 44,
        "unit": "px",
        "description": "Largeur du triangle.",
        "min": 16,
        "max": 128,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un cycle : trace, puis effacement.",
        "min": 600,
        "max": 5000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du trait. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux chemins SVG, une animation de tirets sur le second, aucun JavaScript apres le premier rendu. Triangle entierement trace et immobile sous mouvement reduit."
    },
    "id": "loader/triangle-spinner"
  },
  {
    "name": "typing-cursor",
    "category": "loader",
    "title": "Curseur qui frappe",
    "description": "Un mot se tape caractere par caractere derriere un curseur qui clignote, tient, puis s efface, sans une ligne de JavaScript.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/TypingCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-font-mono"
    ],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le texte frappe."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Corps du texte.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 3200,
        "unit": "ms",
        "description": "Duree d un cycle : frappe, tenue, effacement.",
        "min": 1200,
        "max": 8000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du texte et du curseur. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation de largeur par paliers et un clignotement de bordure, aucun JavaScript apres le premier rendu. Texte complet et curseur fixe sous mouvement reduit."
    },
    "id": "loader/typing-cursor"
  },
  {
    "name": "water-drop",
    "category": "loader",
    "title": "Goutte qui tombe",
    "description": "Une goutte se detache, s allonge en chutant, s ecrase sur la surface, et une onde unique part du point d impact, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/WaterDrop.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 64,
        "unit": "px",
        "description": "Cote de la zone de dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Duree d un cycle, chute, impact et onde compris.",
        "min": 800,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la goutte, de l onde et de la surface. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations de transformation sur deux formes SVG, tenues par le compositeur, aucun JavaScript apres le premier rendu. Goutte suspendue au-dessus de la surface et onde naissante sous mouvement reduit."
    },
    "id": "loader/water-drop"
  },
  {
    "name": "wave-bars",
    "category": "loader",
    "title": "Barres en vague",
    "description": "Cinq barres fines etirees depuis leur centre par une vague qui les traverse de gauche a droite, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/WaveBars.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Largeur d une barre. La hauteur et l ecart en dependent.",
        "min": 2,
        "max": 12,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1000,
        "unit": "ms",
        "description": "Duree d un passage complet de la vague.",
        "min": 400,
        "max": 3000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des barres. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq animations CSS d echelle tenues par le compositeur, aucun JavaScript apres le premier rendu. Cinq barres a mi-hauteur, immobiles, sous mouvement reduit."
    },
    "id": "loader/wave-bars"
  },
  {
    "name": "wifi-pulse",
    "category": "loader",
    "title": "Onde wifi",
    "description": "Trois arcs concentriques se tracent du plus proche au plus lointain, tiennent ensemble, puis s effacent d un coup, en SVG.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/WifiPulse.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Cote du dessin.",
        "min": 24,
        "max": 160,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Epaisseur des arcs. Le point d emission la suit.",
        "min": 2,
        "max": 14,
        "step": 0.5
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree d un cycle complet. Le retard entre deux arcs en est une fraction.",
        "min": 800,
        "max": 5000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des arcs et du point. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS unique partagee par les trois arcs et decalee par un retard, plus une pour le point, tenues par le compositeur. Onde complete et immobile sous mouvement reduit."
    },
    "id": "loader/wifi-pulse"
  },
  {
    "name": "windmill",
    "category": "loader",
    "title": "Moulin a vent",
    "description": "Quatre ailes a claire-voie tournent sur leur tour au rythme d un vent par rafales : elan, plateau, puis presque l arret, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/Windmill.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Hauteur du moulin.",
        "min": 24,
        "max": 140,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d un tour des ailes, rafale comprise.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la tour et des ailes. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS de rotation sur un groupe SVG, tenue par le compositeur, aucun JavaScript apres le premier rendu. Ailes a l arret, en croix droite, sous mouvement reduit."
    },
    "id": "loader/windmill"
  },
  {
    "name": "wipe-diagonal",
    "category": "loader",
    "title": "Balayage oblique",
    "description": "Une plaque qui quitte l ecran d un seul mouvement, bord de fuite incline, sur une course mesuree au format du cadre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/WipeDiagonal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond de la plaque."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre : le filet de l arete et le libelle."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui s affiche au centre pendant l attente."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "direction",
        "type": "'left' | 'right'",
        "required": false,
        "default": "left",
        "description": "Cote par lequel la plaque s en va.",
        "options": [
          "left",
          "right"
        ]
      },
      {
        "name": "slant",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "deg",
        "description": "Inclinaison de l arete.",
        "min": 0,
        "max": 35,
        "step": 1
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps la plaque reste en place.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 800,
        "unit": "ms",
        "description": "Duree du balayage.",
        "min": 200,
        "max": 3000,
        "step": 100
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : la plaque couvre tant que c est vrai, et part au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut du balayage, pour que le contenu entre derriere l arete."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule transformation composee. Deux lectures de mise en page : au montage, et a chaque redimensionnement du cadre."
    },
    "id": "loader/wipe-diagonal"
  },
  {
    "name": "word-flip",
    "category": "loader",
    "title": "Mots qui se retournent",
    "description": "Un tambour de mots en 3D : le mot courant bascule vers le bas et le suivant descend a sa place, avec une pause sur chacun, en CSS pur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/WordFlip.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "text",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Le premier mot du tambour, celui affiche au repos."
      },
      {
        "name": "words",
        "type": "string",
        "required": false,
        "default": "Un instant,Presque la",
        "description": "Les mots suivants, separes par des virgules."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 18,
        "unit": "px",
        "description": "Corps du texte.",
        "min": 10,
        "max": 48,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Temps passe sur chaque mot, la bascule comprise.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du texte. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule animation de rotation 3D sur le tambour, tenue par le compositeur, aucun JavaScript apres le premier rendu. Premier mot de face et immobile sous mouvement reduit."
    },
    "id": "loader/word-flip"
  },
  {
    "name": "yin-yang",
    "category": "loader",
    "title": "Yin et yang",
    "description": "Le symbole tourne comme une toupie relancee d une chiquenaude : deux tours qui s eteignent, un arret, et on recommence, en SVG et CSS.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/YinYang.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 44,
        "unit": "px",
        "description": "Diametre du symbole.",
        "min": 20,
        "max": 120,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Duree d une chiquenaude, deux tours et l arret compris.",
        "min": 1000,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur de la moitie sombre et du contour ; l autre moitie est le fond. Une valeur, pas un role."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Libelle annonce aux lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation CSS de rotation sur un groupe SVG, tenue par le compositeur ; la moitie claire est le fond, vu a travers. Symbole droit et immobile sous mouvement reduit."
    },
    "id": "loader/yin-yang"
  },
  {
    "name": "zoom-gate",
    "category": "loader",
    "title": "Rideau en profondeur",
    "description": "La marque avance vers l oeil pendant que la plaque recule dans la perspective : deux mouvements opposes, un seul geste.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "loader/ZoomGate.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "background",
        "type": "string",
        "required": false,
        "description": "Le fond de la plaque."
      },
      {
        "name": "ink",
        "type": "string",
        "required": false,
        "description": "L encre de la marque."
      },
      {
        "name": "label",
        "type": "ReactNode",
        "required": false,
        "description": "La marque qui avance vers l oeil : un nom, un logo."
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "default": "Chargement",
        "description": "Ce que les lecteurs d ecran annoncent."
      },
      {
        "name": "punch",
        "type": "number",
        "required": false,
        "default": 3.2,
        "description": "De combien la marque grandit en partant.",
        "min": 1,
        "max": 8,
        "step": 0.1
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "px",
        "description": "Profondeur de recul de la plaque.",
        "min": 200,
        "max": 2000,
        "step": 50
      },
      {
        "name": "holdMs",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Combien de temps la plaque reste en place.",
        "min": 200,
        "max": 4000,
        "step": 100
      },
      {
        "name": "exitMs",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree du recul.",
        "min": 200,
        "max": 3000,
        "step": 100
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat controle : la plaque couvre tant que c est vrai, et recule au premier faux."
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre, et ne verrouille plus le defilement."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele au debut du recul, pour que le contenu entre pendant que le rideau s eloigne."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux elements, une translation en profondeur et une echelle. Aucun JavaScript par image."
    },
    "id": "loader/zoom-gate"
  },
  {
    "name": "bento-grid",
    "category": "section",
    "title": "Grille bento",
    "description": "Des tuiles de tailles inegales qui donnent une hierarchie, revelees en cascade a l entree.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/BentoGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-palette-brand-500",
      "--o-duration-slower",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly BentoItem[]",
        "required": true,
        "description": "Les tuiles, dans l ordre de lecture."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Colonnes au-dela du palier moyen.",
        "min": 2,
        "max": 6,
        "step": 1
      },
      {
        "name": "rowHeight",
        "type": "number",
        "required": false,
        "default": 180,
        "unit": "px",
        "description": "Hauteur d une rangee.",
        "min": 80,
        "max": 360,
        "step": 10
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 60,
        "unit": "ms",
        "description": "Decalage entre deux tuiles a la revelation.",
        "min": 0,
        "max": 240,
        "step": 10
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis des transitions CSS decalees. Aucun JavaScript par image."
    },
    "id": "section/bento-grid"
  },
  {
    "name": "book-shelf",
    "category": "section",
    "title": "Etagere de volumes",
    "description": "Des livres ranges sur deux rayons, qu on fait tourner au glissement et qu on tire du rayon au clic.",
    "engine": {
      "gsap": [],
      "gl": "three"
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/BookShelf.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-palette-stone-700",
      "--o-palette-stone-900"
    ],
    "props": [
      {
        "name": "volumes",
        "type": "readonly ShelfVolume[]",
        "required": true,
        "description": "Les volumes, avec leur rayon, leur place et leurs trois tokens — dos, toile, tranche. Le registre n en embarque aucun : c est le catalogue du projet."
      },
      {
        "name": "selected",
        "type": "string | null",
        "required": false,
        "description": "Identifiant du volume ouvert, impose par l application. La scene signale, l application decide."
      },
      {
        "name": "onSelect",
        "type": "(id: string | null) => void",
        "required": false,
        "description": "Appele quand un volume est choisi, ou referme — null alors. Un relachement qui a glisse ne compte pas comme un clic."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-stone-700, --o-palette-stone-900",
        "description": "Tokens des planches et du mur du fond."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli, affiche tant que la scene n est pas prete."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": "three",
      "notes": "Scene 3D : environ 130 Ko compresses au premier affichage, plus une boite par volume. Un seul rayon de selection par image, et aucune boucle propre — le moteur porte la boucle, le redimensionnement et la suspension hors du champ. Le composant rend la scene seule : le panneau de detail et le catalogue appartiennent a la page.",
      "fallback": "poster"
    },
    "id": "section/book-shelf"
  },
  {
    "name": "changelog",
    "category": "section",
    "title": "Journal des versions",
    "description": "Une liste de definitions ou la version est le terme et ses changements la description, filtrable par nature.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/Changelog.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-line",
      "--o-palette-emerald-600",
      "--o-palette-brand-600",
      "--o-palette-amber-600",
      "--o-palette-rose-600",
      "--o-duration-slower",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "releases",
        "type": "readonly Release[]",
        "required": true,
        "description": "Les versions, de la plus recente a la plus ancienne."
      },
      {
        "name": "filterable",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Propose les interrupteurs de nature au-dessus du journal."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Intitule affiche au-dessus du journal."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, des transitions decalees, et un rendu par bascule de filtre. Aucun JavaScript par image."
    },
    "id": "section/changelog"
  },
  {
    "name": "cinematic-footer",
    "category": "section",
    "title": "Pied de page en rideau",
    "description": "Un pied de page decouvert par le defilement, avec mot de fond en parallaxe, bandeau defilant et pastilles magnetiques.",
    "engine": {
      "gsap": [
        "ScrollTrigger"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/CinematicFooter.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "effect/magnetic",
      "effect/marquee"
    ],
    "tokens": [
      "--o-palette-zinc-50",
      "--o-palette-zinc-950",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "heading",
        "type": "ReactNode",
        "required": false,
        "default": "On commence ?",
        "description": "Titre du bloc central."
      },
      {
        "name": "word",
        "type": "string",
        "required": false,
        "description": "Mot pose en fond, derriere tout le reste. Rien n est rendu s il est absent."
      },
      {
        "name": "banner",
        "type": "ReactNode",
        "required": false,
        "description": "Contenu du bandeau defilant. Emplacement, rendu par le composant de defilement."
      },
      {
        "name": "actions",
        "type": "ReactNode",
        "required": false,
        "description": "Actions principales, rendues en pastilles magnetiques."
      },
      {
        "name": "links",
        "type": "ReactNode",
        "required": false,
        "description": "Liens secondaires, rendus en pastilles plus petites."
      },
      {
        "name": "copyright",
        "type": "ReactNode",
        "required": false,
        "description": "Mention de bas de page, a gauche."
      },
      {
        "name": "signature",
        "type": "ReactNode",
        "required": false,
        "description": "Signature, au centre de la barre basse."
      },
      {
        "name": "topLabel",
        "type": "string",
        "required": false,
        "default": "Revenir en haut",
        "description": "Libelle accessible du bouton de remontee."
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un seul declencheur de defilement pour les deux mouvements. Le rideau est de la mise en page — une decoupe et un element fixe — et ne coute rien a l execution.",
      "fallback": "static"
    },
    "id": "section/cinematic-footer"
  },
  {
    "name": "coming-soon",
    "category": "section",
    "title": "Bientot disponible",
    "description": "Une page d attente dont le compte a rebours se lit a l oeil, et dont la date se lit a l oreille.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/ComingSoon.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-slower",
      "--o-ease-entrance",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "date",
        "type": "string | Date",
        "required": true,
        "description": "Date d ouverture, en ISO 8601 ou en Date."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": true,
        "description": "Titre de la page."
      },
      {
        "name": "message",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui se prepare, en une ou deux phrases."
      },
      {
        "name": "actions",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qu on peut faire en attendant : liens, bouton, formulaire."
      },
      {
        "name": "locale",
        "type": "string",
        "required": false,
        "description": "Langue du formatage de la date."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un abonnement a la boucle qui n ecrit qu une fois par seconde, dans quatre elements. Aucun rendu React pendant le decompte."
    },
    "id": "section/coming-soon"
  },
  {
    "name": "comparison-table",
    "category": "section",
    "title": "Tableau comparatif",
    "description": "Un vrai tableau a en-tete colle et premiere colonne collee, dont la zone de defilement s atteint au clavier.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/ComparisonTable.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-bg",
      "--o-palette-brand-500",
      "--o-palette-emerald-600",
      "--o-duration-slow",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "columns",
        "type": "readonly ComparisonColumn[]",
        "required": true,
        "description": "Les colonnes comparees."
      },
      {
        "name": "rows",
        "type": "readonly ComparisonRow[]",
        "required": true,
        "description": "Les lignes, dans l ordre d affichage."
      },
      {
        "name": "caption",
        "type": "string",
        "required": true,
        "description": "Legende du tableau. Elle est affichee, et elle nomme la zone qui defile."
      },
      {
        "name": "maxHeight",
        "type": "number",
        "required": false,
        "default": 480,
        "unit": "px",
        "description": "Hauteur maximale de la zone qui defile.",
        "min": 200,
        "max": 900,
        "step": 20
      },
      {
        "name": "yesLabel",
        "type": "string",
        "required": false,
        "default": "Compris",
        "description": "Ce qui est dit d une valeur vraie."
      },
      {
        "name": "noLabel",
        "type": "string",
        "required": false,
        "default": "Non compris",
        "description": "Ce qui est dit d une valeur fausse."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis une transition par rangee. Le collage est natif : aucune mesure, aucun JavaScript par image."
    },
    "id": "section/comparison-table"
  },
  {
    "name": "container-scroll",
    "category": "section",
    "title": "Cadre qui se redresse",
    "description": "Un cadre incline qui se redresse et s agrandit a mesure que la section entre dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/ContainerScroll.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-surface",
      "--o-theme-line"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Ce que le cadre contient."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Titre affiche au-dessus du cadre."
      },
      {
        "name": "subtitle",
        "type": "ReactNode",
        "required": false,
        "description": "Phrase sous le titre."
      },
      {
        "name": "rotation",
        "type": "number",
        "required": false,
        "default": 22,
        "unit": "deg",
        "description": "Inclinaison de depart.",
        "min": 0,
        "max": 45,
        "step": 1
      },
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 0.86,
        "description": "Echelle de depart.",
        "min": 0.6,
        "max": 1,
        "step": 0.02
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une mesure par image et une ecriture de variable au changement de centieme. La bascule est une transformation : aucun recalcul de mise en page, aucun rendu React. Rien ne tourne sous mouvement reduit."
    },
    "id": "section/container-scroll"
  },
  {
    "name": "cta-band",
    "category": "section",
    "title": "Bandeau d appel a l action",
    "description": "Un appel principal, une action secondaire discrete, et un reflet qui passe une seule fois a l entree.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/CtaBand.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-400",
      "--o-palette-brand-500",
      "--o-palette-brand-600",
      "--o-palette-white",
      "--o-duration-slower",
      "--o-ease-standard",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "title",
        "type": "ReactNode",
        "required": true,
        "description": "Ce qu on propose, en une phrase."
      },
      {
        "name": "primary",
        "type": "CtaAction",
        "required": true,
        "description": "L action principale : une adresse ou une fonction."
      },
      {
        "name": "body",
        "type": "ReactNode",
        "required": false,
        "description": "Une precision sous le titre."
      },
      {
        "name": "secondary",
        "type": "CtaAction",
        "required": false,
        "description": "Une seconde action, discrete."
      },
      {
        "name": "headingLevel",
        "type": "'h2' | 'h3'",
        "required": false,
        "default": "h2",
        "description": "Niveau de titre rendu, selon la place du bandeau dans le plan de la page.",
        "options": [
          "h2",
          "h3"
        ]
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, une transition et une animation jouee une seule fois. Rien ne tourne ensuite."
    },
    "id": "section/cta-band"
  },
  {
    "name": "faq",
    "category": "section",
    "title": "Questions frequentes",
    "description": "Une liste de questions repliables, une seule ouverte a la fois ou plusieurs.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/Faq.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-fast",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { question: string; answer: ReactNode }[]",
        "required": true,
        "description": "Les questions."
      },
      {
        "name": "single",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "N ouvre qu une question a la fois."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Intitule de la section."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le repliage passe par les elements natifs : le clavier et la recherche dans la page fonctionnent sans code."
    },
    "id": "section/faq"
  },
  {
    "name": "feature-tabs",
    "category": "section",
    "title": "Onglets de fonctionnalites",
    "description": "Un jeu d onglets conforme aux pratiques ARIA, avec un visuel par fonctionnalite et un trait qui glisse.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/FeatureTabs.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-duration-slower",
      "--o-ease-standard",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "features",
        "type": "readonly Feature[]",
        "required": true,
        "description": "Les fonctionnalites, dans l ordre des onglets."
      },
      {
        "name": "render",
        "type": "(index: number) => ReactNode",
        "required": true,
        "description": "Rend le visuel de l onglet actif."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du jeu d onglets, annonce aux technologies d assistance."
      },
      {
        "name": "initial",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Onglet ouvert au premier rendu.",
        "min": 0,
        "max": 6,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu par changement d onglet, une transition CSS pour le trait. Aucune mesure de mise en page."
    },
    "id": "section/feature-tabs"
  },
  {
    "name": "hero-scroll-morph",
    "category": "section",
    "title": "Hero qui s ouvre au defilement",
    "description": "Un hero dont la fenetre sur le media s elargit au fil du defilement, sans jamais recalculer la mise en page.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/HeroScrollMorph.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-radius-3xl"
    ],
    "props": [
      {
        "name": "title",
        "type": "ReactNode",
        "required": true,
        "description": "Titre du hero."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Le media : image, video, capture, scene."
      },
      {
        "name": "subtitle",
        "type": "ReactNode",
        "required": false,
        "description": "Phrase sous le titre."
      },
      {
        "name": "caption",
        "type": "ReactNode",
        "required": false,
        "description": "Legende sous le media, qui apparait a mesure que la fenetre s ouvre."
      },
      {
        "name": "startWidth",
        "type": "number",
        "required": false,
        "default": 62,
        "unit": "%",
        "description": "Largeur visible du media au repos.",
        "min": 20,
        "max": 100,
        "step": 2
      },
      {
        "name": "travel",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Part de la hauteur de la section sur laquelle la transformation s acheve.",
        "min": 0.2,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une mesure par image et une ecriture de variable seulement quand le centieme change. La transformation passe par clip-path et transform : aucun recalcul de mise en page. Rien ne tourne sous mouvement reduit."
    },
    "id": "section/hero-scroll-morph"
  },
  {
    "name": "logo-band",
    "category": "section",
    "title": "Bandeau de logos",
    "description": "Une rangee de logos qui defile sans fin, avec fondus aux extremites.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/LogoBand.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "effect/marquee"
    ],
    "tokens": [],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les logos."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Intitule affiche au-dessus."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 40,
        "description": "Vitesse du defilement.",
        "min": 0,
        "max": 120,
        "step": 100
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le defilement vient du bandeau ; cette section n ajoute qu une mise en page et un intitule."
    },
    "id": "section/logo-band"
  },
  {
    "name": "newsletter",
    "category": "section",
    "title": "Inscription a une lettre",
    "description": "Un formulaire a quatre etats — repos, envoi, succes, erreur — annonces dans une region qui existe avant son message.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/Newsletter.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-600",
      "--o-palette-white",
      "--o-palette-rose-600",
      "--o-palette-emerald-600",
      "--o-duration-slower",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "onSubmit",
        "type": "(email: string) => void | Promise<void>",
        "required": false,
        "description": "Envoie l adresse. Une promesse rejetee vaut echec, et son message est affiche."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Titre de la section."
      },
      {
        "name": "body",
        "type": "ReactNode",
        "required": false,
        "description": "Ce que la lettre contient, et a quelle frequence."
      },
      {
        "name": "fieldLabel",
        "type": "string",
        "required": false,
        "default": "Adresse e-mail",
        "description": "Libelle du champ."
      },
      {
        "name": "cta",
        "type": "string",
        "required": false,
        "default": "S inscrire",
        "description": "Ce qui est ecrit sur le bouton."
      },
      {
        "name": "messages",
        "type": "NewsletterMessages",
        "required": false,
        "description": "Les phrases affichees dans la region d annonce."
      },
      {
        "name": "note",
        "type": "ReactNode",
        "required": false,
        "description": "Mention sous le formulaire : frequence, desinscription, donnees."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu par changement d etat, et une rotation CSS pendant le seul envoi. Rien ne tourne au repos."
    },
    "id": "section/newsletter"
  },
  {
    "name": "orbital-timeline",
    "category": "section",
    "title": "Frise orbitale",
    "description": "Des etapes disposees en cercle, qui tourne par la boucle du moteur et non par un minuteur, avec une fiche par etape.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/OrbitalTimeline.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-ease-standard",
      "--o-ease-out"
    ],
    "props": [
      {
        "name": "steps",
        "type": "readonly OrbitalStep[]",
        "required": true,
        "description": "Les etapes, dans l ordre ou elles se suivent. Chacune porte son titre, son avancement, son intensite et ses liens."
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 200,
        "unit": "px",
        "description": "Rayon du cercle.",
        "min": 100,
        "max": 320,
        "step": 10
      },
      {
        "name": "rpm",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Tours par minute. Zero immobilise la frise, comme le mouvement reduit.",
        "min": 0,
        "max": 6,
        "step": 0.5
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Etapes",
        "description": "Libelle de la liste, pour les technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucun rendu React pendant la rotation : l angle vit dans une ref et les positions sont ecrites en style. La rotation s arrete sous mouvement reduit et pendant qu une fiche est ouverte, qu elle emporterait hors du cadre."
    },
    "id": "section/orbital-timeline"
  },
  {
    "name": "pricing-tiers",
    "category": "section",
    "title": "Grille de tarifs",
    "description": "Des offres avec bascule mensuelle ou annuelle, dont les prix se recalculent au lieu de se remplacer.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/PricingTiers.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "text/count-up"
    ],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg"
    ],
    "props": [
      {
        "name": "tiers",
        "type": "readonly Tier[]",
        "required": true,
        "description": "Les offres, dans l ordre d affichage."
      },
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "section",
        "description": "Balise rendue."
      },
      {
        "name": "currency",
        "type": "string",
        "required": false,
        "description": "Symbole colle avant le prix."
      },
      {
        "name": "suffix",
        "type": "string",
        "required": false,
        "description": "Symbole colle apres le prix."
      },
      {
        "name": "yearlyDiscount",
        "type": "number",
        "required": false,
        "default": 0.2,
        "description": "Part remise sur l annee. Zero retire la bascule.",
        "min": 0,
        "max": 0.6,
        "step": 0.05
      },
      {
        "name": "locale",
        "type": "string",
        "required": false,
        "description": "Langue du formatage."
      },
      {
        "name": "onChoose",
        "type": "(tier: Tier) => void",
        "required": false,
        "description": "Appele au clic sur une offre."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un compteur par offre, relance a chaque bascule de periode puis arrete. Rien ne tourne au repos."
    },
    "id": "section/pricing-tiers"
  },
  {
    "name": "reveal-grid",
    "category": "section",
    "title": "Grille revelee",
    "description": "Une grille dont les elements arrivent en cascade quand la section entre dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/RevealGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-slow",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les elements de la grille."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Colonnes au-dela du palier moyen.",
        "min": 1,
        "max": 5,
        "step": 1
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 70,
        "unit": "ms",
        "description": "Decalage entre deux elements.",
        "min": 0,
        "max": 210,
        "step": 100
      },
      {
        "name": "distance",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Hauteur de la montee.",
        "min": 0,
        "max": 72,
        "step": 100
      },
      {
        "name": "once",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Ne rejoue pas quand la section repasse."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis des transitions CSS decalees. Aucun JavaScript par image."
    },
    "id": "section/reveal-grid"
  },
  {
    "name": "scroll-steps",
    "category": "section",
    "title": "Etapes au defilement",
    "description": "Un media colle a gauche, des etapes qui defilent a droite, et le media qui suit l etape active.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/ScrollSteps.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "steps",
        "type": "readonly { title: string; body: ReactNode }[]",
        "required": true,
        "description": "Les etapes."
      },
      {
        "name": "render",
        "type": "(index: number) => ReactNode",
        "required": true,
        "description": "Rend le media pour l etape active."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la section, annonce aux technologies d assistance."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de defilement dans la boucle unique, et un index qui ne change qu au passage d une etape."
    },
    "id": "section/scroll-steps"
  },
  {
    "name": "sign-in",
    "category": "section",
    "title": "Parcours de connexion",
    "description": "Trois ecrans — adresse, code, confirmation — poses sur une trame de points qui s inverse a la reussite.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/SignIn.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "background/dot-matrix"
    ],
    "tokens": [
      "--o-duration-slow",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "step",
        "type": "SignInStep",
        "required": false,
        "description": "Ecran affiche, impose par l application. Absente, le composant avance seul — donc aussi quand le code est faux."
      },
      {
        "name": "codeLength",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de caracteres du code.",
        "min": 4,
        "max": 8,
        "step": 1
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "default": "Content de vous revoir",
        "description": "Titre du premier ecran."
      },
      {
        "name": "subtitle",
        "type": "ReactNode",
        "required": false,
        "default": "Entrez votre adresse pour recevoir un code.",
        "description": "Sous-titre du premier ecran."
      },
      {
        "name": "providers",
        "type": "ReactNode",
        "required": false,
        "description": "Fournisseurs externes, rendus au-dessus du separateur. Emplacement : le bouton appartient a l application."
      },
      {
        "name": "legal",
        "type": "ReactNode",
        "required": false,
        "description": "Mentions legales, rendues sous le formulaire. Emplacement : les liens passent par le routeur du projet."
      },
      {
        "name": "error",
        "type": "string",
        "required": false,
        "description": "Message d erreur, annonce par une region vivante."
      },
      {
        "name": "pending",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Suspend les envois pendant un appel en cours."
      },
      {
        "name": "onEmailSubmit",
        "type": "(email: string) => void",
        "required": false,
        "description": "Appele quand l adresse est soumise."
      },
      {
        "name": "onCodeSubmit",
        "type": "(code: string) => void",
        "required": false,
        "description": "Appele quand le code est complet."
      },
      {
        "name": "onResend",
        "type": "() => void",
        "required": false,
        "description": "Appele quand un nouvel envoi est demande."
      },
      {
        "name": "onStepChange",
        "type": "(step: SignInStep) => void",
        "required": false,
        "description": "Appele a chaque changement d ecran."
      },
      {
        "name": "onDone",
        "type": "() => void",
        "required": false,
        "description": "Appele depuis le dernier ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le composant lui-meme ne coute rien : le prix est celui de la trame qu il compose, et qui porte son propre repli."
    },
    "id": "section/sign-in"
  },
  {
    "name": "stat-band",
    "category": "section",
    "title": "Bande de statistiques",
    "description": "Une rangee de nombres qui montent ensemble quand la section entre dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/StatBand.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "text/count-up"
    ],
    "tokens": [],
    "props": [
      {
        "name": "stats",
        "type": "readonly Stat[]",
        "required": true,
        "description": "Les statistiques, dans l ordre d affichage."
      },
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "section",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1500,
        "unit": "ms",
        "description": "Duree de la montee d un nombre.",
        "min": 200,
        "max": 5000,
        "step": 100
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 120,
        "unit": "ms",
        "description": "Retard entre deux nombres. Zero les fait partir ensemble.",
        "min": 0,
        "max": 600,
        "step": 20
      },
      {
        "name": "locale",
        "type": "string",
        "required": false,
        "description": "Langue du formatage. Par defaut, celle du navigateur."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un compteur par statistique, chacun s arretant a la fin de sa montee. Aucune boucle permanente."
    },
    "id": "section/stat-band"
  },
  {
    "name": "sticky-stack",
    "category": "section",
    "title": "Cartes empilees",
    "description": "Des cartes qui se figent et s empilent a mesure que le defilement avance.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/StickyStack.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les cartes."
      },
      {
        "name": "offset",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Distance au haut de la fenetre.",
        "min": 0,
        "max": 290,
        "step": 100
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Decalage visible entre deux cartes empilees.",
        "min": 0,
        "max": 72,
        "step": 100
      },
      {
        "name": "shrink",
        "type": "number",
        "required": false,
        "default": 0.05,
        "description": "Reduction de la carte quand la suivante arrive.",
        "min": 0,
        "max": 0.15,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le collage est natif. Seule l echelle est ecrite par la boucle, une fois par carte et par image."
    },
    "id": "section/sticky-stack"
  },
  {
    "name": "team-grid",
    "category": "section",
    "title": "Grille d equipe",
    "description": "Des fiches de personnes a rapport de forme fixe, revelees en cascade, dont les liens restent atteignables.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/TeamGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-muted",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-600",
      "--o-duration-base",
      "--o-duration-slower",
      "--o-ease-standard",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "members",
        "type": "readonly Member[]",
        "required": true,
        "description": "Les personnes, dans l ordre d affichage."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Colonnes au-dela du grand palier.",
        "min": 2,
        "max": 6,
        "step": 1
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 70,
        "unit": "ms",
        "description": "Decalage entre deux fiches a la revelation.",
        "min": 0,
        "max": 240,
        "step": 10
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Intitule affiche au-dessus de la grille."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis des transitions CSS decalees. Aucun JavaScript par image."
    },
    "id": "section/team-grid"
  },
  {
    "name": "testimonials-columns",
    "category": "section",
    "title": "Mur de temoignages",
    "description": "Des colonnes de temoignages qui defilent en sens contraires, et s arretent des qu on les lit.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/TestimonialsColumns.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-fg",
      "--o-theme-muted"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly Testimonial[]",
        "required": true,
        "description": "Les temoignages, repartis en colonnes dans l ordre donne."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Colonnes au-dela du palier moyen.",
        "min": 1,
        "max": 5,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 40000,
        "unit": "ms",
        "description": "Duree d un tour complet.",
        "min": 8000,
        "max": 90000,
        "step": 2000
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 480,
        "unit": "px",
        "description": "Hauteur visible du mur.",
        "min": 240,
        "max": 900,
        "step": 20
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "Nom de la section, annonce aux technologies d assistance."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Intitule affiche au-dessus du mur."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations CSS confiees au compositeur, lancees seulement quand la section entre dans le champ. Aucun JavaScript par image."
    },
    "id": "section/testimonials-columns"
  },
  {
    "name": "timeline",
    "category": "section",
    "title": "Frise verticale",
    "description": "Une liste d evenements dates dont le trait se remplit au defilement, lu dans la boucle du moteur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "section/Timeline.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-fg",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-duration-slow",
      "--o-ease-standard",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "events",
        "type": "readonly TimelineEvent[]",
        "required": true,
        "description": "Les evenements, du plus ancien au plus recent."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la frise, annonce aux technologies d assistance."
      },
      {
        "name": "title",
        "type": "ReactNode",
        "required": false,
        "description": "Intitule affiche au-dessus de la frise."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une mesure par image a la priorite des mises en page, et deux ecritures de style seulement quand la valeur change. Aucun rendu React pendant le defilement ; rien ne tourne sous mouvement reduit."
    },
    "id": "section/timeline"
  },
  {
    "name": "ascii-text",
    "category": "text",
    "title": "Texte en ASCII",
    "description": "Le titre est redessine en caracteres dont la densite ondule, le texte reel restant dessous.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/AsciiText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "rows",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de lignes de la trame. Plus bas, plus grossier.",
        "min": 3,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Duree d un passage de la vague.",
        "min": 600,
        "max": 8000,
        "step": 100
      },
      {
        "name": "waves",
        "type": "number",
        "required": false,
        "default": 1.5,
        "description": "Nombre de vagues visibles sur la largeur.",
        "min": 0.25,
        "max": 5,
        "step": 0.25
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "La couverture est mesuree une fois par mise en page ; chaque image ne reconstruit qu une chaine bornee a six mille caracteres. Aucun canevas n est peint a l ecran."
    },
    "id": "text/ascii-text"
  },
  {
    "name": "blur-reveal",
    "category": "text",
    "title": "Revelation floue",
    "description": "Les mots passent du flou au net l un apres l autre, quand le texte entre dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/BlurReveal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "ms",
        "description": "Delai entre deux mots.",
        "min": 0,
        "max": 400,
        "step": 10
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Flou de depart.",
        "min": 0,
        "max": 24,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree de la revelation d un mot.",
        "min": 100,
        "max": 2000,
        "step": 50
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis une animation Web Animations par mot, jouee une seule fois. Le flou est plus couteux qu une opacite : a reserver aux titres."
    },
    "id": "text/blur-reveal"
  },
  {
    "name": "blur-words",
    "category": "text",
    "title": "Nettoyage",
    "description": "Le bloc est flou et ses mots redeviennent nets un a un, dans un ordre tire au sort, jusqu a ce que tout se lise.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/BlurWords.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Flou d un mot pas encore nettoye.",
        "min": 0,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "dim",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Opacite d un mot pas encore nettoye, de 0 a 1.",
        "min": 0,
        "max": 0.9,
        "step": 0.05
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 520,
        "unit": "ms",
        "description": "Duree du nettoyage d un mot.",
        "min": 100,
        "max": 2000,
        "step": 20
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 200,
        "unit": "ms",
        "description": "Retard entre deux mots du tirage.",
        "min": 20,
        "max": 800,
        "step": 10
      },
      {
        "name": "pause",
        "type": "number",
        "required": false,
        "default": 1600,
        "unit": "ms",
        "description": "Temps de lecture avant que tout redevienne flou.",
        "min": 200,
        "max": 6000,
        "step": 100
      },
      {
        "name": "boucle",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Rejouer le cycle sans fin."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation par mot, posee une fois puis tenue par le compositeur : aucun JavaScript pendant le cycle. Le flou est un filtre par mot, a garder modeste sur un long texte."
    },
    "id": "text/blur-words"
  },
  {
    "name": "circular-text",
    "category": "text",
    "title": "Texte en cercle",
    "description": "Une phrase enroulee sur un anneau SVG qui tourne en continu, sens et vitesse reglables.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/CircularText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 160,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 80,
        "max": 400,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "s",
        "description": "Duree d un tour complet.",
        "min": 2,
        "max": 60,
        "step": 1
      },
      {
        "name": "reverse",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Tourner dans le sens inverse."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule rotation CSS sur le SVG entier, tenue par le compositeur. Aucun JavaScript apres le premier rendu."
    },
    "id": "text/circular-text"
  },
  {
    "name": "count-up",
    "category": "text",
    "title": "Compteur",
    "description": "Un nombre monte jusqu a sa valeur quand il entre dans le champ, formate selon la langue.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/CountUp.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": true,
        "description": "Valeur d arrivee."
      },
      {
        "name": "from",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Valeur de depart."
      },
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1500,
        "unit": "ms",
        "description": "Duree de la montee.",
        "min": 200,
        "max": 6000,
        "step": 100
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "ms",
        "description": "Retard avant le depart.",
        "min": 0,
        "max": 3000,
        "step": 100
      },
      {
        "name": "locale",
        "type": "string",
        "required": false,
        "description": "Langue du formatage. Par defaut, celle du navigateur."
      },
      {
        "name": "decimals",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Nombre de decimales.",
        "min": 0,
        "max": 4,
        "step": 1
      },
      {
        "name": "prefix",
        "type": "string",
        "required": false,
        "description": "Texte colle avant le nombre."
      },
      {
        "name": "suffix",
        "type": "string",
        "required": false,
        "description": "Texte colle apres le nombre."
      },
      {
        "name": "declenchement",
        "type": "'vue' | 'montage'",
        "required": false,
        "default": "vue",
        "description": "A l entree dans le champ, ou des le montage."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une boucle d images qui dure le temps de la montee, puis s arrete. Un seul noeud de texte est reecrit."
    },
    "id": "text/count-up"
  },
  {
    "name": "counter-roll",
    "category": "text",
    "title": "Odometre",
    "description": "Un nombre en colonnes de chiffres qui roulent verticalement jusqu a leur position, en cascade depuis la droite.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/CounterRoll.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": true,
        "description": "Valeur affichee."
      },
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree du roulement d une colonne.",
        "min": 200,
        "max": 3000,
        "step": 50
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 80,
        "unit": "ms",
        "description": "Delai entre deux colonnes, depuis la droite.",
        "min": 0,
        "max": 300,
        "step": 10
      },
      {
        "name": "locale",
        "type": "string",
        "required": false,
        "description": "Langue du formatage. Par defaut, celle du navigateur."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une translation CSS par colonne, jouee une fois a l entree dans le champ. Aucun JavaScript pendant l animation."
    },
    "id": "text/counter-roll"
  },
  {
    "name": "curved-loop",
    "category": "text",
    "title": "Boucle courbe",
    "description": "Une phrase court sans fin le long d un arc, par deplacement du seul point de depart sur le chemin.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/CurvedLoop.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "div",
        "description": "Balise rendue."
      },
      {
        "name": "separateur",
        "type": "string",
        "required": false,
        "default": " — ",
        "description": "Separateur insere entre deux repetitions."
      },
      {
        "name": "courbure",
        "type": "number",
        "required": false,
        "default": 0.5,
        "description": "Creux de la courbe, de 0 (droite) a 1.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "taille",
        "type": "number",
        "required": false,
        "default": 96,
        "description": "Corps du texte, en unites du dessin (hauteur totale : 200).",
        "min": 24,
        "max": 180,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 60,
        "description": "Vitesse, en unites du dessin par seconde.",
        "min": 5,
        "max": 300,
        "step": 5
      },
      {
        "name": "sens",
        "type": "'gauche' | 'droite'",
        "required": false,
        "default": "gauche",
        "description": "Sens de defilement.",
        "options": [
          "gauche",
          "droite"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un attribut ecrit par image, sur un seul element. La longueur du motif est mesuree une fois, quand la police est prete."
    },
    "id": "text/curved-loop"
  },
  {
    "name": "decode-text",
    "category": "text",
    "title": "Decodage",
    "description": "Le texte se stabilise depuis un brouillage de caracteres, lettre par lettre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/DecodeText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1200,
        "unit": "ms",
        "description": "Duree totale de la stabilisation.",
        "min": 0,
        "max": 3600,
        "step": 100
      },
      {
        "name": "alphabet",
        "type": "string",
        "required": false,
        "description": "Caracteres du brouillage."
      },
      {
        "name": "trigger",
        "type": "'mount' | 'view' | 'hover'",
        "required": false,
        "default": "view",
        "description": "Ce qui declenche la sequence.",
        "options": [
          "view",
          "mount",
          "hover"
        ]
      },
      {
        "name": "onReady",
        "type": "(context: ReadyContext<DecodeControls>) => void | (() => void)",
        "required": false,
        "description": "Echappatoire : permet de rejouer la sequence."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une ecriture de textContent par image, sur un seul noeud."
    },
    "id": "text/decode-text"
  },
  {
    "name": "depth-text",
    "category": "text",
    "title": "Titre extrude",
    "description": "Le titre est double en couches reculees en profondeur, et le bloc tourne lentement pour en decouvrir la tranche.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/DepthText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre de couches d extrusion.",
        "min": 1,
        "max": 24,
        "step": 1
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Decalage d une couche a la suivante.",
        "min": 0.5,
        "max": 8,
        "step": 0.5
      },
      {
        "name": "couleur",
        "type": "string",
        "required": false,
        "description": "Couleur de la tranche."
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "deg",
        "description": "Amplitude de la rotation.",
        "min": 0,
        "max": 45,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6000,
        "unit": "ms",
        "description": "Duree d un aller-retour complet.",
        "min": 1500,
        "max": 20000,
        "step": 250
      },
      {
        "name": "perspective",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "px",
        "description": "Distance de fuite. Plus bas, plus marque.",
        "min": 200,
        "max": 2000,
        "step": 50
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule transformation animee, celle de la pile ; les couches la suivent dans son espace 3D. Aucun JavaScript apres le premier rendu."
    },
    "id": "text/depth-text"
  },
  {
    "name": "echo-text",
    "category": "text",
    "title": "Echos",
    "description": "Des copies attenuees du texte suivent le pointeur avec des retards croissants ; l original reste net.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/EchoText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "copies",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de copies.",
        "min": 2,
        "max": 4,
        "step": 1
      },
      {
        "name": "lag",
        "type": "number",
        "required": false,
        "default": 220,
        "unit": "ms",
        "description": "Retard de la premiere copie ; chaque suivante double la mise.",
        "min": 60,
        "max": 800,
        "step": 20
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 1,
        "unit": "px",
        "description": "Flou ajoute a chaque copie.",
        "min": 0,
        "max": 4,
        "step": 0.25
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le pointeur ecrit deux variables CSS, les transitions font le retard : aucun rendu React par evenement, rien au repos. Le flou est plus couteux qu une opacite : a reserver aux titres."
    },
    "id": "text/echo-text"
  },
  {
    "name": "falling-text",
    "category": "text",
    "title": "Lettres qui tombent",
    "description": "Chaque lettre tombe en place depuis le haut avec un leger depassement, a l entree dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/FallingText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 45,
        "unit": "ms",
        "description": "Delai entre deux lettres.",
        "min": 0,
        "max": 300,
        "step": 5
      },
      {
        "name": "drop",
        "type": "number",
        "required": false,
        "default": 1.2,
        "unit": "em",
        "description": "Hauteur de la chute.",
        "min": 0.2,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "once",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Ne jouer qu une fois, ou rejouer a chaque retour dans le champ."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis une animation Web Animations par lettre, tenue par le compositeur. A reserver aux titres : un paragraphe ferait beaucoup de calques."
    },
    "id": "text/falling-text"
  },
  {
    "name": "fold-text",
    "category": "text",
    "title": "Texte plie",
    "description": "Chaque lettre est un volet articule sur son bord superieur, qui se rabat en cascade sous une perspective courte.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/FoldText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 620,
        "unit": "ms",
        "description": "Duree du depliage d une lettre.",
        "min": 150,
        "max": 2000,
        "step": 10
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 40,
        "unit": "ms",
        "description": "Retard entre deux lettres.",
        "min": 0,
        "max": 200,
        "step": 5
      },
      {
        "name": "perspective",
        "type": "number",
        "required": false,
        "default": 420,
        "unit": "px",
        "description": "Distance de fuite. Plus bas, plus marque.",
        "min": 120,
        "max": 1600,
        "step": 20
      },
      {
        "name": "declenchement",
        "type": "'montage' | 'vue' | 'survol'",
        "required": false,
        "default": "vue",
        "description": "Des le montage, a l entree dans le champ, ou a chaque survol.",
        "options": [
          "montage",
          "vue",
          "survol"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation composee par lettre, programmee une fois. A reserver aux titres : un paragraphe entier ferait autant de calques que de caracteres."
    },
    "id": "text/fold-text"
  },
  {
    "name": "fuzzy-text",
    "category": "text",
    "title": "Texte flou vibrant",
    "description": "Le texte reste hors de mise au point et tremble par sauts, jusqu a ce que le pointeur le remette au net.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/FuzzyText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 1.4,
        "unit": "px",
        "description": "Rayon du flou.",
        "min": 0,
        "max": 10,
        "step": 0.2
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 1.6,
        "unit": "px",
        "description": "Amplitude du tremblement.",
        "min": 0,
        "max": 8,
        "step": 0.2
      },
      {
        "name": "period",
        "type": "number",
        "required": false,
        "default": 160,
        "unit": "ms",
        "description": "Duree d un cycle de tremblement.",
        "min": 60,
        "max": 1200,
        "step": 20
      },
      {
        "name": "doublure",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Poser la copie dephasee qui fabrique le grain."
      },
      {
        "name": "netAuSurvol",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Remettre au point tant que le pointeur est dessus."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux calques au plus, animes par le compositeur. Le flou est un filtre constant : il n est pas recalcule par image."
    },
    "id": "text/fuzzy-text"
  },
  {
    "name": "glitch-text",
    "category": "text",
    "title": "Glitch",
    "description": "Un texte casse par rafales breves, net entre deux, avec une aberration rouge et cyan.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/GlitchText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-red-500",
      "--o-palette-cyan-400"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Amplitude du decalage des copies.",
        "min": 0,
        "max": 10,
        "step": 1
      },
      {
        "name": "interval",
        "type": "number",
        "required": false,
        "default": 2600,
        "unit": "ms",
        "description": "Temps moyen entre deux rafales. L intervalle reel varie autour de cette valeur.",
        "min": 600,
        "max": 9000,
        "step": 100
      },
      {
        "name": "channelA",
        "type": "string",
        "required": false,
        "description": "Couleur du premier canal decale."
      },
      {
        "name": "channelB",
        "type": "string",
        "required": false,
        "description": "Couleur du second canal decale."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un minuteur entre les rafales, une animation CSS pendant. Aucun JavaScript par image, rien du tout au repos."
    },
    "id": "text/glitch-text"
  },
  {
    "name": "gradient-flow",
    "category": "text",
    "title": "Degrade en mouvement",
    "description": "Une nappe de couleur traverse le texte en boucle, sans aucun JavaScript a l execution.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/GradientFlow.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 4000,
        "unit": "ms",
        "description": "Duree d un cycle complet.",
        "min": 1000,
        "max": 12000,
        "step": 100
      },
      {
        "name": "angle",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "deg",
        "description": "Angle du degrade.",
        "min": 0,
        "max": 360,
        "step": 5
      },
      {
        "name": "from",
        "type": "string",
        "required": false,
        "description": "Premiere couleur. Une valeur, pas un role."
      },
      {
        "name": "to",
        "type": "string",
        "required": false,
        "description": "Seconde couleur. Une valeur, pas un role."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade anime par le compositeur. Sous mouvement reduit le degrade reste, seul son deplacement s arrete."
    },
    "id": "text/gradient-flow"
  },
  {
    "name": "hand-written",
    "category": "text",
    "title": "Signature manuscrite",
    "description": "Un paraphe se trace d un seul geste le long de son chemin, boucles comprises, sans qu on le voie d avance.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/HandWritten.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "path",
        "type": "string",
        "required": false,
        "description": "Trace de la signature, en donnees de chemin SVG. Un seul trait continu."
      },
      {
        "name": "viewBox",
        "type": "string",
        "required": false,
        "default": "0 0 320 110",
        "description": "Vue du trace. A changer avec le chemin."
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 280,
        "unit": "px",
        "description": "Largeur du dessin.",
        "min": 80,
        "max": 720,
        "step": 10
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Epaisseur du trait, en unites de la vue.",
        "min": 1,
        "max": 16,
        "step": 0.5
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Duree du trace.",
        "min": 300,
        "max": 6000,
        "step": 100
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "default": "currentColor",
        "description": "Couleur de l encre."
      },
      {
        "name": "declenchement",
        "type": "'montage' | 'vue' | 'survol'",
        "required": false,
        "default": "vue",
        "description": "Des le montage, a l entree dans le champ, ou a chaque survol.",
        "options": [
          "montage",
          "vue",
          "survol"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule animation, sur un seul chemin. Le decalage de tiret n est pas compose : il repeint le trait a chaque image, ce qui reste negligeable sur un dessin de cette taille."
    },
    "id": "text/hand-written"
  },
  {
    "name": "highlight-sweep",
    "category": "text",
    "title": "Surligneur",
    "description": "Un trait se trace derriere le texte, comme au feutre, sans decouper le contenu.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/HighlightSweep.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-palette-brand-200"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "colour",
        "type": "string",
        "required": false,
        "description": "Couleur du trait."
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Epaisseur du trait, en part de la hauteur de ligne.",
        "min": 0.05,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree du trace.",
        "min": 100,
        "max": 3000,
        "step": 50
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "ms",
        "description": "Retard avant le trace.",
        "min": 0,
        "max": 2000,
        "step": 50
      },
      {
        "name": "declenchement",
        "type": "'vue' | 'montage'",
        "required": false,
        "default": "vue",
        "description": "A l entree dans le champ, ou des le montage."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de background-size. Aucune mise en page recalculee, aucun JavaScript par image."
    },
    "id": "text/highlight-sweep"
  },
  {
    "name": "letter-swap",
    "category": "text",
    "title": "Lettres permutees",
    "description": "Au survol ou au focus, chaque lettre glisse vers le haut et sa doublure prend sa place, en vague.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/LetterSwap.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 25,
        "unit": "ms",
        "description": "Delai entre deux lettres.",
        "min": 0,
        "max": 150,
        "step": 5
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 350,
        "unit": "ms",
        "description": "Duree du glissement d une lettre.",
        "min": 100,
        "max": 1200,
        "step": 25
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition CSS par lettre, armee par le survol ou le focus. Aucun JavaScript apres le premier rendu ; a reserver aux mots courts d un menu."
    },
    "id": "text/letter-swap"
  },
  {
    "name": "masked-heading",
    "category": "text",
    "title": "Titre masque",
    "description": "Une image est vue a travers les lettres du titre et se balance lentement, sans decouper le contenu.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/MaskedHeading.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Image vue a travers les lettres. Purement decorative."
      },
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "default": 220,
        "unit": "%",
        "description": "Largeur de l image, en part de celle du titre.",
        "min": 100,
        "max": 600,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 14000,
        "unit": "ms",
        "description": "Duree d un aller.",
        "min": 2000,
        "max": 40000,
        "step": 500
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul element, une position de fond animee. Le cout tient a la taille de l image chargee, pas au composant."
    },
    "id": "text/masked-heading"
  },
  {
    "name": "morph-text",
    "category": "text",
    "title": "Fusion",
    "description": "Un mot se coule dans le suivant : un flou passe a travers un seuil de contraste soude leurs lettres, avec un fondu croise en repli.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/MorphText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "mots",
        "type": "readonly string[]",
        "required": true,
        "description": "Mots fondus l un dans l autre, en boucle. Au moins deux."
      },
      {
        "name": "hold",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Temps pendant lequel un mot reste lisible.",
        "min": 300,
        "max": 5000,
        "step": 100
      },
      {
        "name": "morph",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree d une fusion.",
        "min": 200,
        "max": 3000,
        "step": 50
      },
      {
        "name": "flou",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Flou traverse par chaque mot pendant la fusion.",
        "min": 0,
        "max": 40,
        "step": 1
      },
      {
        "name": "fusion",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Force du soudage, en etalement du filtre.",
        "min": 0,
        "max": 12,
        "step": 0.5
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un filtre SVG sur du texte le fait passer par une couche matricielle : le lissage sous-pixel est perdu pendant la fusion. A reserver a deux ou trois mots courts, pas a une phrase."
    },
    "id": "text/morph-text"
  },
  {
    "name": "particle-text",
    "category": "text",
    "title": "Titre en particules",
    "description": "Le titre s assemble depuis une nuee echantillonnee sur ses propres glyphes, puis redevient du texte.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/ParticleText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Pas d echantillonnage. Plus bas, plus dense.",
        "min": 2,
        "max": 16,
        "step": 1
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree du vol d une particule.",
        "min": 300,
        "max": 4000,
        "step": 100
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Etalement des departs.",
        "min": 0,
        "max": 2000,
        "step": 50
      },
      {
        "name": "declenchement",
        "type": "'montage' | 'vue' | 'survol'",
        "required": false,
        "default": "vue",
        "description": "Des le montage, a l entree dans le champ, ou a chaque survol.",
        "options": [
          "montage",
          "vue",
          "survol"
        ]
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un canevas 2D peint pendant la seule duree de l assemblage, borne a deux mille quatre cents particules, puis rendu et efface. Rien ne tourne ensuite."
    },
    "id": "text/particle-text"
  },
  {
    "name": "rotating-words",
    "category": "text",
    "title": "Mot tournant",
    "description": "Un mot se substitue dans une phrase qui ne bouge pas, sans que la largeur saute.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/RotatingWords.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "words",
        "type": "readonly string[]",
        "required": true,
        "description": "Les mots qui se succedent. Le premier est celui que l on lit."
      },
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "interval",
        "type": "number",
        "required": false,
        "default": 2200,
        "unit": "ms",
        "description": "Temps d affichage d un mot.",
        "min": 600,
        "max": 8000,
        "step": 100
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 420,
        "unit": "ms",
        "description": "Duree de la substitution.",
        "min": 80,
        "max": 1500,
        "step": 20
      },
      {
        "name": "sens",
        "type": "'haut' | 'bas'",
        "required": false,
        "default": "haut",
        "description": "Sens du mouvement."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un intervalle, arrete hors du champ. Les substitutions sont des transitions CSS, sans JavaScript par image."
    },
    "id": "text/rotating-words"
  },
  {
    "name": "scroll-float",
    "category": "text",
    "title": "Mots flottants",
    "description": "Les mots derivent chacun a sa phase tant que le bloc entre dans le champ, puis se posent nets.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/ScrollFloat.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "lift",
        "type": "number",
        "required": false,
        "default": 26,
        "unit": "px",
        "description": "Amplitude de la derive a l entree.",
        "min": 0,
        "max": 120,
        "step": 2
      },
      {
        "name": "period",
        "type": "number",
        "required": false,
        "default": 3200,
        "unit": "ms",
        "description": "Duree d une oscillation complete.",
        "min": 800,
        "max": 12000,
        "step": 100
      },
      {
        "name": "course",
        "type": "number",
        "required": false,
        "default": 0.6,
        "description": "Course du reglage, en hauteurs de fenetre.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule variable ecrite par image, quel que soit le nombre de mots ; l oscillation est composee par le navigateur."
    },
    "id": "text/scroll-float"
  },
  {
    "name": "scroll-reveal",
    "category": "text",
    "title": "Revelation au defilement",
    "description": "Une tete de lecture liee au defilement allume les mots un a un, et les eteint si l on remonte.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/ScrollReveal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "dim",
        "type": "number",
        "required": false,
        "default": 0.18,
        "description": "Opacite d un mot pas encore atteint, de 0 a 1.",
        "min": 0,
        "max": 0.8,
        "step": 0.02
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 4,
        "unit": "px",
        "description": "Flou d un mot pas encore atteint.",
        "min": 0,
        "max": 16,
        "step": 0.5
      },
      {
        "name": "course",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Course du reglage, en hauteurs de fenetre.",
        "min": 0.1,
        "max": 2,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule variable ecrite par image : deux cents mots coutent autant que cinq. Le flou est un filtre par mot, a garder modeste sur un long texte."
    },
    "id": "text/scroll-reveal"
  },
  {
    "name": "shine-text",
    "category": "text",
    "title": "Reflet",
    "description": "Un reflet traverse le texte en boucle, sans aucun JavaScript a l execution.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/ShineText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "from",
        "type": "string",
        "required": false,
        "description": "Couleur du texte au repos."
      },
      {
        "name": "shine",
        "type": "string",
        "required": false,
        "description": "Couleur du reflet."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un passage.",
        "min": 0,
        "max": 9000,
        "step": 100
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 30,
        "description": "Largeur du reflet, en pourcentage de la largeur du texte.",
        "min": 1,
        "max": 60,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un degrade anime par le compositeur. Aucun JavaScript par image."
    },
    "id": "text/shine-text"
  },
  {
    "name": "shuffle",
    "category": "text",
    "title": "Battage",
    "description": "Chaque lettre part de la place d une autre, mesuree sur le rendu, puis rejoint la sienne.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/Shuffle.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 800,
        "unit": "ms",
        "description": "Duree du retour d une lettre.",
        "min": 200,
        "max": 2500,
        "step": 20
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 35,
        "unit": "ms",
        "description": "Retard entre deux lettres.",
        "min": 0,
        "max": 200,
        "step": 5
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 20,
        "unit": "deg",
        "description": "Inclinaison maximale au depart.",
        "min": 0,
        "max": 90,
        "step": 5
      },
      {
        "name": "declenchement",
        "type": "'montage' | 'vue' | 'survol'",
        "required": false,
        "default": "vue",
        "description": "Des le montage, a l entree dans le champ, ou a chaque survol.",
        "options": [
          "montage",
          "vue",
          "survol"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de position par lettre au depart, puis une animation composee chacune. Aucun JavaScript par image."
    },
    "id": "text/shuffle"
  },
  {
    "name": "split-flap",
    "category": "text",
    "title": "Palettes",
    "description": "Chaque caractere defile sur deux demi-cartes articulees, comme un tableau de departs, jusqu a se poser sur sa lettre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/SplitFlap.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "alphabet",
        "type": "string",
        "required": false,
        "description": "Caracteres du rouleau. Le premier est la carte vierge."
      },
      {
        "name": "interval",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "ms",
        "description": "Duree d un battement.",
        "min": 30,
        "max": 400,
        "step": 10
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 60,
        "unit": "ms",
        "description": "Retard de depart entre deux cellules.",
        "min": 0,
        "max": 300,
        "step": 10
      },
      {
        "name": "largeur",
        "type": "number",
        "required": false,
        "default": 0.72,
        "unit": "em",
        "description": "Largeur minimale d une carte.",
        "min": 0.4,
        "max": 1.4,
        "step": 0.02
      },
      {
        "name": "declenchement",
        "type": "'montage' | 'vue' | 'survol'",
        "required": false,
        "default": "vue",
        "description": "Des le montage, a l entree dans le champ, ou a chaque survol.",
        "options": [
          "montage",
          "vue",
          "survol"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une comparaison d echeance par cellule et par image tant que le tableau tourne, puis plus rien. Deux rotations composees par carte tournee."
    },
    "id": "text/split-flap"
  },
  {
    "name": "split-lines",
    "category": "text",
    "title": "Revelation par ligne",
    "description": "Chaque ligne rendue monte depuis sous son masque, l une apres l autre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/SplitLines.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree de la montee d une ligne.",
        "min": 100,
        "max": 2000,
        "step": 50
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "ms",
        "description": "Retard entre deux lignes.",
        "min": 0,
        "max": 400,
        "step": 10
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 0,
        "unit": "ms",
        "description": "Retard avant la premiere ligne.",
        "min": 0,
        "max": 2000,
        "step": 50
      },
      {
        "name": "declenchement",
        "type": "'vue' | 'montage'",
        "required": false,
        "default": "vue",
        "description": "A l entree dans le champ, ou des le montage."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Les lignes sont mesurees a la construction, puis animees par le compositeur. Aucun JavaScript par image."
    },
    "id": "text/split-lines"
  },
  {
    "name": "split-reveal",
    "category": "text",
    "title": "Revelation par fragments",
    "description": "Un titre qui se compose caractere par caractere quand il entre dans le champ.",
    "engine": {
      "gsap": [
        "SplitText",
        "ScrollTrigger"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/SplitReveal.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "h2",
        "description": "Balise rendue. Un titre reste un titre."
      },
      {
        "name": "by",
        "type": "'chars' | 'words' | 'lines'",
        "required": false,
        "default": "chars",
        "description": "Granularite du decoupage.",
        "options": [
          "chars",
          "words",
          "lines"
        ]
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "ms",
        "description": "Decalage entre deux fragments.",
        "min": 0,
        "max": 72,
        "step": 100
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree d entree d un fragment.",
        "min": 0,
        "max": 1800,
        "step": 100
      },
      {
        "name": "distance",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Hauteur de la montee. Zero pour un simple fondu.",
        "min": 0,
        "max": 72,
        "step": 100
      },
      {
        "name": "onReady",
        "type": "(context: ReadyContext<SplitRevealControls>) => void | (() => void)",
        "required": false,
        "description": "Echappatoire : donne la timeline et les fragments."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le decoupage a lieu une fois. L animation est jouee par l orchestrateur, sans rendu React."
    },
    "id": "text/split-reveal"
  },
  {
    "name": "spotlight-text",
    "category": "text",
    "title": "Texte au projecteur",
    "description": "Le remplissage n apparait que sous un halo qui suit le pointeur ; hors survol, un texte attenue reste lisible.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/SpotlightText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 120,
        "unit": "px",
        "description": "Rayon du halo.",
        "min": 40,
        "max": 320,
        "step": 10
      },
      {
        "name": "rest",
        "type": "number",
        "required": false,
        "default": 0.25,
        "description": "Opacite du texte hors du halo.",
        "min": 0,
        "max": 1,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le pointeur ecrit deux variables CSS, le masque les lit : aucun rendu React par mouvement, rien au repos. Inerte sans pointeur fin."
    },
    "id": "text/spotlight-text"
  },
  {
    "name": "stroke-text",
    "category": "text",
    "title": "Contour qui se remplit",
    "description": "Un texte en contour dont le remplissage monte du bas quand il entre dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/StrokeText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-300",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "strokeWidth",
        "type": "number",
        "required": false,
        "default": 1.5,
        "unit": "px",
        "description": "Epaisseur du contour.",
        "min": 0.5,
        "max": 4,
        "step": 0.5
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "ms",
        "description": "Duree de la montee du remplissage.",
        "min": 200,
        "max": 3000,
        "step": 50
      },
      {
        "name": "contour",
        "type": "string",
        "required": false,
        "description": "Couleur du contour."
      },
      {
        "name": "remplissage",
        "type": "string",
        "required": false,
        "description": "Couleur du remplissage."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un observateur d intersection, puis une seule animation de clip-path, jouee une fois. Rien ne s execute au repos."
    },
    "id": "text/stroke-text"
  },
  {
    "name": "text-cursor",
    "category": "text",
    "title": "Texte qui suit",
    "description": "Les lettres courent apres le pointeur en chaine : chacune ne vise que sa voisine, et le mot se courbe en fouet avant de se remettre en ligne.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/TextCursor.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 26,
        "unit": "px",
        "description": "Course maximale d une lettre.",
        "min": 0,
        "max": 120,
        "step": 2
      },
      {
        "name": "raideur",
        "type": "number",
        "required": false,
        "default": 9,
        "description": "Raideur de la chaine. Plus haut, plus le mot reste groupe.",
        "min": 1,
        "max": 20,
        "step": 0.5
      },
      {
        "name": "inclinaison",
        "type": "number",
        "required": false,
        "default": 0.4,
        "unit": "deg/px",
        "description": "Inclinaison prise dans les virages.",
        "min": 0,
        "max": 2,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Vitesse de rattrapage du pointeur. Plus haut, plus sec.",
        "min": 1,
        "max": 12,
        "step": 0.5
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation ecrite par lettre et par image, et rien du tout quand le mot est au repos. A reserver aux titres."
    },
    "id": "text/text-cursor"
  },
  {
    "name": "text-loop",
    "category": "text",
    "title": "Boucle de phrases",
    "description": "Des phrases se succedent en fondu dans une boite qui ne bouge pas : la sortante monte, l entrante arrive par le bas.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/TextLoop.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "phrases",
        "type": "readonly string[]",
        "required": true,
        "description": "Phrases jouees en boucle."
      },
      {
        "name": "hold",
        "type": "number",
        "required": false,
        "default": 2400,
        "unit": "ms",
        "description": "Temps pendant lequel une phrase reste lisible.",
        "min": 400,
        "max": 8000,
        "step": 100
      },
      {
        "name": "fade",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree du fondu d une phrase a l autre.",
        "min": 80,
        "max": 2000,
        "step": 20
      },
      {
        "name": "lift",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Course verticale d une phrase qui entre ou qui sort.",
        "min": 0,
        "max": 60,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu React par phrase, soit un toutes les deux ou trois secondes ; le fondu est une transition CSS. Aucun travail par image."
    },
    "id": "text/text-loop"
  },
  {
    "name": "text-pressure",
    "category": "text",
    "title": "Pression",
    "description": "Le pointeur deforme la police elle-meme : l ecart vertical commande la graisse, l ecart horizontal la chasse, avec un repli en graisses discretes.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/TextPressure.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "graisseBasse",
        "type": "number",
        "required": false,
        "default": 200,
        "description": "Graisse au repos, sur l axe wght.",
        "min": 100,
        "max": 900,
        "step": 25
      },
      {
        "name": "graisseHaute",
        "type": "number",
        "required": false,
        "default": 900,
        "description": "Graisse sous le pointeur, sur l axe wght.",
        "min": 100,
        "max": 1000,
        "step": 25
      },
      {
        "name": "chasse",
        "type": "number",
        "required": false,
        "default": 25,
        "description": "Etirement maximal sur l axe wdth, en points de chasse.",
        "min": 0,
        "max": 50,
        "step": 1
      },
      {
        "name": "rayon",
        "type": "number",
        "required": false,
        "default": 260,
        "unit": "px",
        "description": "Portee de la pression.",
        "min": 40,
        "max": 800,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Vitesse de rattrapage du pointeur. Plus haut, plus sec.",
        "min": 1,
        "max": 16,
        "step": 0.5
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une lecture de boite par image, plus un reglage d axe par lettre quand il change vraiment. Un changement de graisse recompose la ligne : a reserver aux titres."
    },
    "id": "text/text-pressure"
  },
  {
    "name": "true-focus",
    "category": "text",
    "title": "Mise au point",
    "description": "Un cadre de quatre angles saute de mot en mot ; le mot vise redevient net pendant que les autres restent flous, et le survol prend la main.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/TrueFocus.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 5,
        "unit": "px",
        "description": "Flou d un mot hors mise au point.",
        "min": 0,
        "max": 16,
        "step": 0.5
      },
      {
        "name": "attenue",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Opacite d un mot hors mise au point, de 0 a 1.",
        "min": 0.1,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "hold",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Temps passe sur un mot.",
        "min": 300,
        "max": 5000,
        "step": 100
      },
      {
        "name": "course",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree du deplacement du cadre.",
        "min": 80,
        "max": 2000,
        "step": 20
      },
      {
        "name": "couleur",
        "type": "string",
        "required": false,
        "description": "Couleur du cadre."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu React par mot vise, soit un par seconde environ ; le deplacement du cadre et le flou sont des transitions CSS. Le flou est un filtre par mot, a garder modeste sur un long texte."
    },
    "id": "text/true-focus"
  },
  {
    "name": "typewriter",
    "category": "text",
    "title": "Machine a ecrire",
    "description": "Une suite de phrases frappees puis effacees, avec un curseur clignotant.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/Typewriter.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "phrases",
        "type": "readonly string[]",
        "required": true,
        "description": "Phrases jouees en boucle."
      },
      {
        "name": "typeSpeed",
        "type": "number",
        "required": false,
        "default": 55,
        "unit": "ms",
        "description": "Delai entre deux caracteres frappes.",
        "min": 0,
        "max": 170,
        "step": 100
      },
      {
        "name": "deleteSpeed",
        "type": "number",
        "required": false,
        "default": 28,
        "unit": "ms",
        "description": "Delai entre deux caracteres effaces.",
        "min": 0,
        "max": 84,
        "step": 100
      },
      {
        "name": "hold",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Temps d attente une fois la phrase complete.",
        "min": 0,
        "max": 4200,
        "step": 100
      },
      {
        "name": "cursor",
        "type": "string",
        "required": false,
        "default": "|",
        "description": "Caractere du curseur. Chaine vide pour l enlever."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un minuteur, pas d abonnement a la boucle : la frappe n a pas besoin de la cadence de l ecran."
    },
    "id": "text/typewriter"
  },
  {
    "name": "underline-draw",
    "category": "text",
    "title": "Soulignement dessine",
    "description": "Un trait irregulier se dessine sous le texte, a l entree dans le champ ou au survol.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/UnderlineDraw.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-400"
    ],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "trigger",
        "type": "'view' | 'hover'",
        "required": false,
        "default": "view",
        "description": "Ce qui declenche le trace.",
        "options": [
          "view",
          "hover"
        ]
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 3,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 8,
        "step": 0.5
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree du trace.",
        "min": 100,
        "max": 2500,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du trait."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition CSS sur le decalage du tiret, armee par un attribut. Au survol, tout est declaratif ; a l entree dans le champ, un observateur pose l attribut une fois."
    },
    "id": "text/underline-draw"
  },
  {
    "name": "variable-proximity",
    "category": "text",
    "title": "Graisse de proximite",
    "description": "Une loupe de graisse suit le pointeur sur tout un paragraphe, chaque lettre rejoignant son epaisseur a son rythme, avec un repli en graisses discretes.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/VariableProximity.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "p",
        "description": "Balise rendue."
      },
      {
        "name": "rayon",
        "type": "number",
        "required": false,
        "default": 180,
        "unit": "px",
        "description": "Portee de la loupe.",
        "min": 40,
        "max": 600,
        "step": 10
      },
      {
        "name": "graisseBasse",
        "type": "number",
        "required": false,
        "default": 300,
        "description": "Graisse loin du pointeur, sur l axe wght.",
        "min": 100,
        "max": 900,
        "step": 25
      },
      {
        "name": "graisseHaute",
        "type": "number",
        "required": false,
        "default": 800,
        "description": "Graisse sous le pointeur, sur l axe wght.",
        "min": 100,
        "max": 1000,
        "step": 25
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Vitesse a laquelle une lettre rejoint sa graisse. Plus bas, plus longue est la traine.",
        "min": 1,
        "max": 24,
        "step": 0.5
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Une lecture de boite par image, plus un reglage de graisse par lettre quand il change vraiment. Sur un long paragraphe, chaque changement de graisse recompose la ligne : garder le bloc court."
    },
    "id": "text/variable-proximity"
  },
  {
    "name": "warp-text",
    "category": "text",
    "title": "Deformation au defilement",
    "description": "Le defilement commande la courbure de la ligne : elle pend en bas du champ, se bombe en haut, et redevient droite au centre de l ecran.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/WarpText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 28,
        "unit": "px",
        "description": "Fleche maximale de la courbe.",
        "min": 0,
        "max": 140,
        "step": 2
      },
      {
        "name": "inclinaison",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "deg",
        "description": "Inclinaison maximale des lettres de bord.",
        "min": 0,
        "max": 30,
        "step": 0.5
      },
      {
        "name": "course",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Course du reglage, en hauteurs de fenetre.",
        "min": 0.2,
        "max": 3,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une seule variable ecrite par image : quarante lettres coutent autant que cinq. Les transformations sont tenues par le compositeur."
    },
    "id": "text/warp-text"
  },
  {
    "name": "wave-text",
    "category": "text",
    "title": "Vague",
    "description": "Chaque lettre monte et descend en decale, sans aucun JavaScript apres le premier rendu.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "text/WaveText.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "as",
        "type": "ElementType",
        "required": false,
        "default": "span",
        "description": "Balise rendue."
      },
      {
        "name": "amplitude",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "px",
        "description": "Hauteur de la vague.",
        "min": 0,
        "max": 24,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d une oscillation complete.",
        "min": 400,
        "max": 4000,
        "step": 100
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation animee par lettre, toutes tenues par le compositeur. A reserver aux titres : un paragraphe entier ferait beaucoup de calques."
    },
    "id": "text/wave-text"
  },
  {
    "name": "animated-list",
    "category": "ui",
    "title": "Liste en cascade",
    "description": "Une liste qui se remplit ligne apres ligne quand elle entre dans le champ, dont la ligne survolee s allume par un filet, et qui se parcourt aux fleches.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/AnimatedList.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-duration-slow",
      "--o-ease-standard",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { id: string; label: string; hint?: string }[]",
        "required": true,
        "description": "Les lignes, dans l ordre d affichage."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la liste pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "string",
        "required": false,
        "description": "Ligne choisie, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "required": false,
        "description": "Ligne choisie au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(id: string) => void",
        "required": false,
        "description": "Appele quand le choix change."
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 60,
        "unit": "ms",
        "description": "Retard ajoute par ligne dans la cascade.",
        "min": 0,
        "max": 200,
        "step": 10
      },
      {
        "name": "fade",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Voile les bords haut et bas de la zone qui defile."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "La cascade est une seule animation d images cles, retardee par un index ecrit en variable CSS : aucune minuterie, aucun rendu React pendant le remplissage. Sous mouvement reduit les lignes sont en place des le premier rendu."
    },
    "id": "ui/animated-list"
  },
  {
    "name": "avatar-stack",
    "category": "ui",
    "title": "Pile d avatars",
    "description": "Des initiales chevauchees qui s etalent au survol, chacune sur une teinte de la palette.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/AvatarStack.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-emerald-500",
      "--o-palette-amber-500",
      "--o-palette-rose-500",
      "--o-palette-sky-500",
      "--o-palette-zinc-50",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { name: string; tone?: string }[]",
        "required": true,
        "description": "Les personnes, dans l ordre d affichage. tone est un token de palette optionnel."
      },
      {
        "name": "max",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de pastilles montrees avant le compteur de surplus.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "offset",
        "type": "number",
        "required": false,
        "default": 12,
        "unit": "px",
        "description": "Chevauchement des pastilles au repos.",
        "min": 4,
        "max": 24,
        "step": 2
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de marge par pastille, declenchee par le survol ou le focus. Sous mouvement reduit l etalement est instantane."
    },
    "id": "ui/avatar-stack"
  },
  {
    "name": "bounce-cards",
    "category": "ui",
    "title": "Cartes rebondissantes",
    "description": "Un eventail ouvert dont les cartes arrivent en rebondissant une a une, et s ecartent pour celle qu on survole.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/BounceCards.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-in-view"
    ],
    "tokens": [],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les cartes, de deux a six. La premiere donne sa taille a la rangee."
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 6,
        "unit": "deg",
        "description": "Angle entre deux cartes voisines.",
        "min": 0,
        "max": 16,
        "step": 1
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Ecart horizontal entre deux cartes.",
        "min": 16,
        "max": 140,
        "step": 4
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "ms",
        "description": "Decalage d arrivee entre deux cartes.",
        "min": 0,
        "max": 300,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de transformation par carte, six au plus, tenues par le compositeur ; l ecart des voisines est en CSS pur. Sous mouvement reduit l eventail est ouvert sans trajet."
    },
    "id": "ui/bounce-cards"
  },
  {
    "name": "bubble-menu",
    "category": "ui",
    "title": "Menu a bulles",
    "description": "Un bouton rond dont les liens jaillissent en bulles sur un arc, une a une, et rentrent dans l ordre inverse.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/BubbleMenu.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les liens, dans l ordre de sortie."
      },
      {
        "name": "direction",
        "type": "'up' | 'right' | 'down' | 'left'",
        "required": false,
        "default": "up",
        "description": "Cote vers lequel l arc se deploie.",
        "options": [
          "up",
          "right",
          "down",
          "left"
        ]
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 110,
        "unit": "px",
        "description": "Distance entre le bouton et les bulles.",
        "min": 60,
        "max": 240,
        "step": 10
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 120,
        "unit": "deg",
        "description": "Ouverture de l arc.",
        "min": 30,
        "max": 300,
        "step": 10
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 50,
        "unit": "ms",
        "description": "Decalage entre deux bulles.",
        "min": 0,
        "max": 150,
        "step": 10
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Menu",
        "description": "Intitule du bouton pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Chaque bulle est une transition de transformation avec son propre retard ; un rendu React a l ouverture et un a la fermeture. Sous mouvement reduit les bulles apparaissent en place."
    },
    "id": "ui/bubble-menu"
  },
  {
    "name": "button-group-input",
    "category": "ui",
    "title": "Groupe bouton et champ",
    "description": "Un champ et son bouton soudes dans une meme pilule ; Entree envoie, et le bouton fait glisser une confirmation avant de revenir.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ButtonGroupInput.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-palette-emerald-500",
      "--o-palette-zinc-50",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du champ pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "string",
        "required": false,
        "description": "Texte du champ, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "required": false,
        "description": "Texte au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(value: string) => void",
        "required": false,
        "description": "Appele a chaque frappe."
      },
      {
        "name": "onSubmit",
        "type": "(value: string) => void | Promise<unknown>",
        "required": false,
        "description": "Appele a l envoi. Une promesse tient le bouton occupe jusqu a sa fin."
      },
      {
        "name": "placeholder",
        "type": "string",
        "required": false,
        "description": "Texte d attente du champ."
      },
      {
        "name": "buttonLabel",
        "type": "string",
        "required": false,
        "default": "Envoyer",
        "description": "Libelle du bouton au repos."
      },
      {
        "name": "doneLabel",
        "type": "string",
        "required": false,
        "default": "Envoye",
        "description": "Libelle glisse dans le bouton apres l envoi."
      },
      {
        "name": "prefix",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui precede le champ dans la pilule : une icone, un prefixe d adresse."
      },
      {
        "name": "type",
        "type": "'text' | 'email' | 'url' | 'search'",
        "required": false,
        "default": "text",
        "description": "Type du champ.",
        "options": [
          "text",
          "email",
          "url",
          "search"
        ]
      },
      {
        "name": "hold",
        "type": "number",
        "required": false,
        "default": 1800,
        "unit": "ms",
        "description": "Temps pendant lequel la confirmation reste affichee.",
        "min": 600,
        "max": 4000,
        "step": 100
      },
      {
        "name": "disabled",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Neutralise le champ et le bouton."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu React a l envoi et un au retour, rien entre les deux ; la confirmation glisse par une transition de transformation. Sous mouvement reduit les libelles se remplacent sans glisser."
    },
    "id": "ui/button-group-input"
  },
  {
    "name": "card-form",
    "category": "ui",
    "title": "Formulaire de carte",
    "description": "Une saisie de carte avec apercu qui se retourne sur le code, et un controle de Luhn qui distingue la coquille du numero plausible.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CardForm.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-fuchsia-500",
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-duration-slowest",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "defaultValue",
        "type": "Partial<CardFormState>",
        "required": false,
        "description": "Valeurs de depart."
      },
      {
        "name": "maskMiddle",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Masque les chiffres du milieu sur l apercu."
      },
      {
        "name": "showSubmit",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Affiche le bouton d envoi. A desactiver quand un formulaire englobant porte l envoi."
      },
      {
        "name": "submitLabel",
        "type": "string",
        "required": false,
        "default": "Valider",
        "description": "Libelle du bouton d envoi."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-fuchsia-500, --o-palette-brand-500",
        "description": "Tokens des deux halos de la carte."
      },
      {
        "name": "onValueChange",
        "type": "(state: CardFormState, validity: CardFormValidity) => void",
        "required": false,
        "description": "Appele a chaque frappe."
      },
      {
        "name": "onSubmit",
        "type": "(state: CardFormState, validity: CardFormValidity) => void",
        "required": false,
        "description": "Appele a l envoi. Le composant ne transmet rien lui-meme."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucune dependance et aucun reseau. A savoir avant de le brancher sur un paiement reel : les numeros passent par le document et par le JavaScript de la page, ce qui place l application dans le perimetre complet de PCI-DSS. Un champ heberge par le prestataire — une iframe qui rend un jeton — l en sort. Ce composant convient a un apercu, une maquette, ou une saisie remise aussitot a un client de tokenisation."
    },
    "id": "ui/card-form"
  },
  {
    "name": "card-nav",
    "category": "ui",
    "title": "Barre en cartes",
    "description": "Une barre compacte qui se deploie en une rangee de cartes teintees, chacune un lien, entrant l une apres l autre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CardNav.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-palette-sky-500",
      "--o-palette-emerald-500",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode; description?: string }[]",
        "required": true,
        "description": "Les cartes, dans l ordre d affichage."
      },
      {
        "name": "brand",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui occupe la gauche de la barre : une marque, un titre."
      },
      {
        "name": "cta",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui occupe la droite de la barre, avant le bouton : un appel a l action."
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "default": "--o-palette-brand-500,--o-palette-sky-500,--o-palette-emerald-500",
        "description": "Tokens de teinte, distribues aux cartes en boucle."
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 60,
        "unit": "ms",
        "description": "Decalage d entree entre deux cartes.",
        "min": 0,
        "max": 200,
        "step": 10
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Menu",
        "description": "Intitule du bouton pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "La hauteur est animee par une rangee de grille qui passe de zero a une fraction : rien n est mesure. Les cartes entrent par transition, avec un retard chacune. Sous mouvement reduit tout est en place d un coup."
    },
    "id": "ui/card-nav"
  },
  {
    "name": "card-swap",
    "category": "ui",
    "title": "Echange de cartes",
    "description": "Une pile dont la carte de devant saute a l arriere a intervalle regulier, les autres avancant d un rang.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CardSwap.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les cartes, de deux a cinq. La premiere donne sa taille a la pile."
      },
      {
        "name": "interval",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Temps entre deux echanges.",
        "min": 1000,
        "max": 8000,
        "step": 250
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 700,
        "unit": "ms",
        "description": "Duree d un echange.",
        "min": 200,
        "max": 1500,
        "step": 50
      },
      {
        "name": "offset",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Decalage entre deux rangs.",
        "min": 6,
        "max": 40,
        "step": 2
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu React par echange, jamais par image ; les trajets sont des transitions et une animation d images cles, tenues par le compositeur. La pile se fige sous le pointeur et sous mouvement reduit."
    },
    "id": "ui/card-swap"
  },
  {
    "name": "chroma-grid",
    "category": "ui",
    "title": "Grille chromatique",
    "description": "Des cartes teintees rendues en gris par un voile, dont le pointeur revele les couleurs dans un cercle amorti.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ChromaGrid.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500",
      "--o-palette-sky-500",
      "--o-palette-emerald-500"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les cartes."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de colonnes.",
        "min": 1,
        "max": 5,
        "step": 1
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "default": "--o-palette-brand-500, --o-palette-fuchsia-500, --o-palette-sky-500, --o-palette-emerald-500",
        "description": "Tokens des teintes, attribues aux cartes dans l ordre et en boucle."
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 220,
        "unit": "px",
        "description": "Rayon du cercle revele.",
        "min": 80,
        "max": 500,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Vitesse a laquelle le cercle suit le pointeur.",
        "min": 2,
        "max": 20,
        "step": 1
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un filtre d arriere-plan sur un seul voile, trois variables ecrites depuis la boucle tant que le cercle bouge, aucun rendu React par image. Grille en couleurs, sans voile, au doigt et sous mouvement reduit.",
      "fallback": "static"
    },
    "id": "ui/chroma-grid"
  },
  {
    "name": "circular-gallery",
    "category": "ui",
    "title": "Galerie circulaire",
    "description": "Un ruban d images pose sur un cylindre couche : on le fait tourner au doigt ou a la molette, les images du bord s inclinent et s eloignent, celle du centre se cale de face.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CircularGallery.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-muted",
      "--o-palette-brand-500",
      "--o-duration-base"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { src: string; alt: string; caption?: string }[]",
        "required": true,
        "description": "Les images du ruban, dans l ordre. Chaque image porte son texte de remplacement."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la galerie, annonce aux technologies d assistance."
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 260,
        "unit": "px",
        "description": "Largeur d une image du ruban.",
        "min": 120,
        "max": 480,
        "step": 10
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "default": 320,
        "unit": "px",
        "description": "Hauteur d une image du ruban.",
        "min": 140,
        "max": 560,
        "step": 10
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Ecart entre deux images.",
        "min": 0,
        "max": 80,
        "step": 4
      },
      {
        "name": "curve",
        "type": "number",
        "required": false,
        "default": 26,
        "unit": "deg",
        "description": "Inclinaison ajoutee par image d ecart au centre. A zero, le ruban est plat.",
        "min": 0,
        "max": 60,
        "step": 1
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 120,
        "unit": "px",
        "description": "Recul ajoute par image d ecart au centre.",
        "min": 0,
        "max": 400,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le glisser, l inertie et le calage sont ceux du navigateur : la galerie n ecoute que le defilement. Les positions des images sont mesurees une fois et au redimensionnement, jamais par image ; la boucle ne lit qu une valeur et n ecrit que des transformations. Sous mouvement reduit le ruban est plat."
    },
    "id": "ui/circular-gallery"
  },
  {
    "name": "code-input",
    "category": "ui",
    "title": "Champ de code",
    "description": "Une case par caractere, la saisie avance seule, le collage remplit tout, la case active respire.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CodeInput.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-duration-fast"
    ],
    "props": [
      {
        "name": "length",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre de cases.",
        "min": 4,
        "max": 8,
        "step": 1
      },
      {
        "name": "masked",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Masque les caracteres saisis."
      },
      {
        "name": "onComplete",
        "type": "(code: string) => void",
        "required": false,
        "description": "Appele quand toutes les cases sont remplies."
      },
      {
        "name": "onValueChange",
        "type": "(code: string) => void",
        "required": false,
        "description": "Appele a chaque changement, avec le code partiel."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation d anneau sur la seule case active. Sous mouvement reduit l anneau est fixe."
    },
    "id": "ui/code-input"
  },
  {
    "name": "command-palette",
    "category": "ui",
    "title": "Palette de commandes",
    "description": "Une fenetre ouverte par la page, qui filtre une liste de commandes a la frappe, se parcourt aux fleches, et rend le focus d ou il venait.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CommandPalette.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-zinc-950",
      "--o-palette-brand-500",
      "--o-duration-fast",
      "--o-duration-base",
      "--o-duration-slow",
      "--o-ease-emphasized",
      "--o-z-modal"
    ],
    "props": [
      {
        "name": "commands",
        "type": "readonly { id: string; label: string; hint?: string; group?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les commandes, dans leur ordre naturel."
      },
      {
        "name": "open",
        "type": "boolean",
        "required": true,
        "default": false,
        "description": "Fenetre ouverte. La page en decide, toujours."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "required": false,
        "description": "Appele quand la palette demande sa fermeture."
      },
      {
        "name": "onRun",
        "type": "(id: string) => void",
        "required": false,
        "description": "Appele avec l identifiant de la commande lancee."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Commandes",
        "description": "Nom de la fenetre pour les lecteurs d ecran."
      },
      {
        "name": "placeholder",
        "type": "string",
        "required": false,
        "default": "Rechercher une commande...",
        "description": "Texte d attente du champ."
      },
      {
        "name": "empty",
        "type": "string",
        "required": false,
        "default": "Aucune commande.",
        "description": "Phrase affichee quand rien ne correspond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Fermee, la palette ne laisse aucun noeud dans le document. Le filtre est une comparaison de chaines normalisees, refaite au rendu ; la liste est designee par aria-activedescendant, sans deplacement de focus. Sous mouvement reduit, la fenetre parait sans montee."
    },
    "id": "ui/command-palette"
  },
  {
    "name": "copy-button",
    "category": "ui",
    "title": "Bouton copier",
    "description": "Copie une valeur dans le presse-papiers, l icone devient une coche et l etat est annonce poliment.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/CopyButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-emerald-500",
      "--o-duration-base",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "value",
        "type": "string",
        "required": true,
        "description": "Texte copie dans le presse-papiers."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Copier",
        "description": "Libelle du bouton au repos."
      },
      {
        "name": "delay",
        "type": "number",
        "required": false,
        "default": 2000,
        "unit": "ms",
        "description": "Temps avant le retour a l etat de repos.",
        "min": 800,
        "max": 5000,
        "step": 200
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux icones croisees en opacite et en echelle, une minuterie pour le retour. Sous mouvement reduit le remplacement est instantane."
    },
    "id": "ui/copy-button"
  },
  {
    "name": "decay-card",
    "category": "ui",
    "title": "Carte a degradation",
    "description": "L image se tord et se delave sous un pointeur rapide, puis se repare des qu il s arrete.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/DecayCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line"
    ],
    "props": [
      {
        "name": "src",
        "type": "string",
        "required": true,
        "description": "Source de l image."
      },
      {
        "name": "alt",
        "type": "string",
        "required": true,
        "description": "Texte de remplacement. Chaine vide si l image est decorative."
      },
      {
        "name": "ratio",
        "type": "number",
        "required": false,
        "default": 1.5,
        "description": "Rapport largeur sur hauteur de l image.",
        "min": 0.5,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Deplacement maximal des pixels.",
        "min": 8,
        "max": 160,
        "step": 4
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Vitesse de reparation. Plus haut, plus l image se repare vite.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "grain",
        "type": "number",
        "required": false,
        "default": 0.012,
        "description": "Finesse du bruit. Plus bas, plus les vagues sont larges.",
        "min": 0.002,
        "max": 0.05,
        "step": 0.002
      }
    ],
    "perf": {
      "tier": "medium",
      "backend": false,
      "notes": "Un filtre SVG de deplacement recalcule par image tant que l image est tordue ; rien au repos. Image intacte au doigt et sous mouvement reduit.",
      "fallback": "static"
    },
    "id": "ui/decay-card"
  },
  {
    "name": "depth-carousel",
    "category": "ui",
    "title": "Carrousel en profondeur",
    "description": "Une pile d affiches rangees en profondeur : celle de devant est de face, les suivantes reculent et se tournent de trois quarts, et l on avance d un cran au bouton, a la fleche ou au glisser.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/DepthCarousel.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-palette-brand-500",
      "--o-duration-slow",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { src: string; alt: string; caption?: string }[]",
        "required": true,
        "description": "Les affiches, dans l ordre. Chaque image porte son texte de remplacement."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du carrousel, annonce aux technologies d assistance."
      },
      {
        "name": "index",
        "type": "number",
        "required": false,
        "description": "Affiche de devant, en mode controle."
      },
      {
        "name": "defaultIndex",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Affiche de devant au montage, en mode non controle."
      },
      {
        "name": "onIndexChange",
        "type": "(index: number) => void",
        "required": false,
        "description": "Appele quand l affiche de devant change."
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 300,
        "unit": "px",
        "description": "Largeur de l affiche de devant.",
        "min": 160,
        "max": 520,
        "step": 10
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 110,
        "unit": "px",
        "description": "Decalage lateral ajoute par cran d ecart a l affiche de devant.",
        "min": 0,
        "max": 200,
        "step": 2
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 140,
        "unit": "px",
        "description": "Recul ajoute par cran d ecart a l affiche de devant.",
        "min": 0,
        "max": 400,
        "step": 10
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "deg",
        "description": "Angle de trois quarts pris par les affiches de cote.",
        "min": 0,
        "max": 70,
        "step": 1
      },
      {
        "name": "visible",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre d affiches visibles de chaque cote de celle de devant.",
        "min": 1,
        "max": 6,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation par affiche, posee au rendu et menee par une transition du compositeur : le changement de cran est le seul rendu React. Le glisser ecrit une seule transformation, celle du plateau. Sous mouvement reduit, l affiche change de place sans trajet."
    },
    "id": "ui/depth-carousel"
  },
  {
    "name": "dome-gallery",
    "category": "ui",
    "title": "Galerie en dome",
    "description": "Les images sont collees sur l interieur d un dome que l on fait tourner au doigt ou aux fleches ; celles qui passent derriere disparaissent d elles-memes.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/DomeGallery.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { src: string; alt: string; caption?: string }[]",
        "required": true,
        "description": "Les images posees sur le dome, dans l ordre. Chaque image porte son texte de remplacement."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la galerie, annonce aux technologies d assistance."
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 360,
        "unit": "px",
        "description": "Rayon du dome. Plus il est grand, plus la courbure est douce.",
        "min": 220,
        "max": 900,
        "step": 20
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre d images par rangee. Une rangee incomplete se repartit sur son propre compte.",
        "min": 3,
        "max": 12,
        "step": 1
      },
      {
        "name": "pitch",
        "type": "number",
        "required": false,
        "default": 34,
        "unit": "deg",
        "description": "Angle entre deux rangees.",
        "min": 10,
        "max": 60,
        "step": 2
      },
      {
        "name": "tile",
        "type": "number",
        "required": false,
        "default": 180,
        "unit": "px",
        "description": "Largeur d une image sur le dome.",
        "min": 100,
        "max": 320,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Chaque image porte une transformation fixe, ecrite une fois au rendu ; la boucle n ecrit qu une rotation, celle du dome entier. Elle s arrete des que le dome est cale. Les images qui passent derriere sont retirees du rendu par la face cachee, sans calcul. Sous mouvement reduit, le dome saute a sa position sans amortissement."
    },
    "id": "ui/dome-gallery"
  },
  {
    "name": "elastic-slider",
    "category": "ui",
    "title": "Curseur elastique",
    "description": "Un champ de plage natif habille : le rail s epaissit a la saisie, s etire quand on tire au-dela de la butee, et revient en depassant un peu.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ElasticSlider.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-duration-slow",
      "--o-ease-standard",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du curseur pour les lecteurs d ecran."
      },
      {
        "name": "min",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Borne basse."
      },
      {
        "name": "max",
        "type": "number",
        "required": false,
        "default": 100,
        "description": "Borne haute."
      },
      {
        "name": "step",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Pas de la valeur."
      },
      {
        "name": "value",
        "type": "number",
        "required": false,
        "description": "Valeur, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "number",
        "required": false,
        "description": "Valeur au montage, en mode non controle. Par defaut, le milieu."
      },
      {
        "name": "onChange",
        "type": "(value: number) => void",
        "required": false,
        "description": "Appele a chaque changement de valeur."
      },
      {
        "name": "stretch",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Etirement maximal du rail, en part de sa largeur.",
        "min": 0,
        "max": 0.4,
        "step": 0.01
      },
      {
        "name": "showValue",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Affiche la valeur a droite du rail."
      },
      {
        "name": "leading",
        "type": "ReactNode",
        "required": false,
        "description": "Element pose avant le rail, une icone par exemple."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Neutralise le curseur."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "L etirement est une transformation ecrite directement sur le rail, sans rendu React ; seuls les changements de valeur du champ natif en declenchent un. Sous mouvement reduit, le rail ne s etire pas."
    },
    "id": "ui/elastic-slider"
  },
  {
    "name": "electric-border",
    "category": "ui",
    "title": "Bordure electrique",
    "description": "Un contour SVG qui crepite : des eclairs courent le long du trait dans les deux sens, et le halo vacille par a-coups, sans aucun filtre.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ElectricBorder.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-sky-400",
      "--o-palette-white"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Contenu encadre."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-sky-400, --o-palette-white",
        "description": "Tokens du courant et des eclairs qui le parcourent."
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 2,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 1,
        "max": 5,
        "step": 0.5
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Rayon des angles du cadre.",
        "min": 0,
        "max": 48,
        "step": 2
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 1400,
        "unit": "ms",
        "description": "Duree d un tour des eclairs.",
        "min": 400,
        "max": 4000,
        "step": 100
      },
      {
        "name": "intensity",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Force du halo, de zero a un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Quatre traces SVG d un meme rectangle : un halo large, un coeur, deux rangees d eclairs en tirets dont le decalage defile. Aucun filtre, aucune turbulence par image ; le vacillement est une animation d opacite par paliers. Sous mouvement reduit le trait est allume, fixe."
    },
    "id": "ui/electric-border"
  },
  {
    "name": "file-drop",
    "category": "ui",
    "title": "Zone de depot",
    "description": "La zone se souleve au survol d un fichier, sa bordure en pointilles defile, l input natif fait le reste.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/FileDrop.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "multiple",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Accepte plusieurs fichiers a la fois."
      },
      {
        "name": "onFiles",
        "type": "(files: readonly File[]) => void",
        "required": false,
        "description": "Appele avec les fichiers deposes ou choisis."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Les pointilles ne defilent que pendant le survol d un fichier, et jamais sous mouvement reduit. Le depot lui-meme est l input natif."
    },
    "id": "ui/file-drop"
  },
  {
    "name": "flip-card",
    "category": "ui",
    "title": "Carte a retournement",
    "description": "Deux faces et une bascule en trois dimensions, au clic comme au clavier.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/FlipCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "front",
        "type": "ReactNode",
        "required": true,
        "description": "Face montree au repos."
      },
      {
        "name": "back",
        "type": "ReactNode",
        "required": true,
        "description": "Face revelee par la bascule."
      },
      {
        "name": "direction",
        "type": "'horizontal' | 'vertical'",
        "required": false,
        "default": "horizontal",
        "description": "Axe de la rotation.",
        "options": [
          "horizontal",
          "vertical"
        ]
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree de la bascule.",
        "min": 100,
        "max": 2000,
        "step": 50
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de transformation, tenue par le compositeur. Sous mouvement reduit la bascule devient un fondu croise."
    },
    "id": "ui/flip-card"
  },
  {
    "name": "flowing-menu",
    "category": "ui",
    "title": "Menu coulant",
    "description": "Des lignes de menu dont le fond coule au survol : une bande inversee entre par le bord ou le pointeur est arrive, et ressort par celui ou il s en va, en faisant defiler le libelle.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/FlowingMenu.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les lignes, dans l ordre d affichage."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "s",
        "description": "Duree d un tour du defilement dans la bande.",
        "min": 3,
        "max": 30,
        "step": 1
      },
      {
        "name": "repeat",
        "type": "number",
        "required": false,
        "default": 4,
        "description": "Nombre de fois que le libelle est repete dans la bande.",
        "min": 2,
        "max": 8,
        "step": 1
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Navigation",
        "description": "Nom du bloc pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "La bande est une transition de transformation, le defilement une animation d images cles qui ne tourne que sur la ligne survolee. Aucun rendu React au survol. Sous mouvement reduit la bande apparait en place et ne defile pas."
    },
    "id": "ui/flowing-menu"
  },
  {
    "name": "flying-posters",
    "category": "ui",
    "title": "Affiches volantes",
    "description": "Une colonne d affiches qui arrivent du fond en s inclinant, se posent de face au milieu de l ecran, puis filent vers le lecteur en s effacant.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/FlyingPosters.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { src: string; alt: string; caption?: string }[]",
        "required": true,
        "description": "Les affiches, dans l ordre de defilement. Chaque image porte son texte de remplacement."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la serie pour les lecteurs d ecran."
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 420,
        "unit": "px",
        "description": "Distance a laquelle l affiche attend son tour, au fond de la scene.",
        "min": 0,
        "max": 900,
        "step": 20
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 22,
        "unit": "deg",
        "description": "Inclinaison de l affiche quand elle est loin du milieu.",
        "min": 0,
        "max": 60,
        "step": 1
      },
      {
        "name": "drift",
        "type": "number",
        "required": false,
        "default": 60,
        "unit": "px",
        "description": "Ecart lateral pris a l arrivee, alterne d une affiche a l autre.",
        "min": 0,
        "max": 240,
        "step": 10
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Espace entre deux affiches dans la colonne.",
        "min": 0,
        "max": 320,
        "step": 8
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 400,
        "unit": "px",
        "description": "Largeur d une affiche. L affiche ne doit pas etre plus haute que la lucarne qui defile, sans quoi elle est deja loin quand elle apparait.",
        "min": 160,
        "max": 600,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un seul ecouteur passif pour toute la colonne, une image d ecran au plus par defilement, et toutes les mesures faites avant toutes les ecritures pour ne pas faire recalculer la mise en page deux fois. Rien ne tourne quand la page ne defile pas. Sous mouvement reduit, les affiches sont a plat, sans ecouteur."
    },
    "id": "ui/flying-posters"
  },
  {
    "name": "folder",
    "category": "ui",
    "title": "Dossier",
    "description": "Un dossier ferme qui s ouvre au clic comme au clavier : le rabat bascule vers l avant et les fiches sortent en eventail, atteignables une a une.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/Folder.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-duration-slow",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { id: string; label: string; hint?: string }[]",
        "required": true,
        "description": "Les fiches rangees dans le dossier, dans l ordre de l eventail."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du dossier, ecrit sur le rabat et annonce aux technologies d assistance."
      },
      {
        "name": "open",
        "type": "boolean",
        "required": false,
        "description": "Etat du dossier, en mode controle."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Etat du dossier au montage, en mode non controle."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "required": false,
        "description": "Appele quand le dossier s ouvre ou se referme."
      },
      {
        "name": "onSelect",
        "type": "(id: string) => void",
        "required": false,
        "description": "Appele au clic ou a Entree sur une fiche sortie."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-brand-500, --o-theme-surface",
        "description": "Tokens de la teinte du carton et de la couleur des fiches, dans cet ordre."
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "default": 220,
        "unit": "px",
        "description": "Largeur du dossier.",
        "min": 140,
        "max": 420,
        "step": 10
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "deg",
        "description": "Angle entre deux fiches une fois sorties.",
        "min": 0,
        "max": 24,
        "step": 1
      },
      {
        "name": "rise",
        "type": "number",
        "required": false,
        "default": 62,
        "unit": "%",
        "description": "Hauteur de sortie des fiches, en part de la hauteur du dossier.",
        "min": 20,
        "max": 110,
        "step": 2
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux transitions par fiche, tenues par le compositeur : aucune boucle, aucune mesure. Fermees, les fiches sont hors de l ordre de tabulation et hors de l arbre d accessibilite. Sous mouvement reduit, l eventail est en place sans trajet."
    },
    "id": "ui/folder"
  },
  {
    "name": "glass-icons",
    "category": "ui",
    "title": "Icones de verre",
    "description": "Une planche de pastilles de verre depoli, chacune posee sur une lueur coloree que le verre diffuse, qui se souleve et pivote de trois quarts au survol comme au focus.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/GlassIcons.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500",
      "--o-palette-sky-500",
      "--o-palette-emerald-500",
      "--o-palette-white",
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-duration-slow",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { id: string; label: string; icon: ReactNode }[]",
        "required": true,
        "description": "Les pastilles, dans l ordre. Le libelle est du texte reel, affiche sous la pastille."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la planche pour les lecteurs d ecran."
      },
      {
        "name": "onSelect",
        "type": "(id: string) => void",
        "required": true,
        "description": "Appele au clic ou a Entree sur une pastille. Obligatoire : une pastille mene quelque part."
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "default": "--o-palette-brand-500, --o-palette-fuchsia-500, --o-palette-sky-500, --o-palette-emerald-500",
        "description": "Tokens des lueurs, attribues aux pastilles dans l ordre et en boucle."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 76,
        "unit": "px",
        "description": "Cote d une pastille.",
        "min": 48,
        "max": 140,
        "step": 4
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "px",
        "description": "Flou du verre : c est lui qui etale la lueur sous la pastille.",
        "min": 0,
        "max": 30,
        "step": 1
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "deg",
        "description": "Angle de trois quarts pris par la pastille au survol.",
        "min": 0,
        "max": 40,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucune boucle et aucun ecouteur : deux transitions par pastille, tenues par le compositeur. Le cout est celui du flou de fond, paye seulement sur la surface de la pastille. Sous mouvement reduit, la pastille s allume sans pivoter ; sans flou de fond, elle devient opaque et teintee."
    },
    "id": "ui/glass-icons"
  },
  {
    "name": "glass-surface",
    "category": "ui",
    "title": "Surface de verre",
    "description": "Un panneau de verre depoli pose sur la page : le fond se devine a travers, l epaisseur se lit sur les aretes, et la surface redevient opaque la ou le flou de fond manque.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/GlassSurface.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-white",
      "--o-theme-surface",
      "--o-theme-line"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Le contenu pose sur le verre."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-brand-500, --o-palette-white",
        "description": "Tokens de la teinte du verre et de sa lumiere, dans cet ordre. La teinte colore la masse et le halo, la lumiere fait les aretes."
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Flou applique au fond vu a travers le verre.",
        "min": 0,
        "max": 40,
        "step": 1
      },
      {
        "name": "tint",
        "type": "number",
        "required": false,
        "default": 0.14,
        "description": "Part de teinte dans la masse du verre, de zero a un.",
        "min": 0,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 1,
        "description": "Force des aretes et du halo : l epaisseur apparente de la plaque.",
        "min": 0,
        "max": 2,
        "step": 0.1
      },
      {
        "name": "sheen",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "Ajoute le reflet diagonal fige qui court sur la plaque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Rien ne bouge et rien n est calcule : un filtre de fond, quatre ombres et un degrade. Le cout est celui du flou de fond, paye par le compositeur ; une regle de repli rend le panneau opaque quand le navigateur ne sait pas flouter son arriere-plan."
    },
    "id": "ui/glass-surface"
  },
  {
    "name": "glow-card",
    "category": "ui",
    "title": "Carte a lueur",
    "description": "La bordure s illumine la ou le pointeur passe, et s eteint quand il quitte la carte.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/GlowCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500"
    ],
    "props": [
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 200,
        "unit": "px",
        "description": "Rayon de la lueur.",
        "min": 40,
        "max": 600,
        "step": 10
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.8,
        "description": "Intensite de la lueur, de zero a un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "from",
        "type": "string",
        "required": false,
        "description": "Premiere couleur de la lueur."
      },
      {
        "name": "to",
        "type": "string",
        "required": false,
        "description": "Seconde couleur, vers laquelle la lueur s eteint."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux variables CSS ecrites au deplacement du pointeur, aucun rendu React. Inerte au doigt et sous mouvement reduit."
    },
    "id": "ui/glow-card"
  },
  {
    "name": "gooey-nav",
    "category": "ui",
    "title": "Navigation gluante",
    "description": "La pastille se detache en gouttes quand elle change de lien : un filtre SVG soude la pastille et ses eclats en une seule matiere.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/GooeyNav.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-palette-fuchsia-500",
      "--o-palette-sky-500",
      "--o-palette-zinc-50",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les liens, dans l ordre d affichage."
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante, en mode controle."
      },
      {
        "name": "defaultActive",
        "type": "number",
        "required": false,
        "description": "Page courante au montage, en mode non controle."
      },
      {
        "name": "onActiveChange",
        "type": "(index: number) => void",
        "required": false,
        "description": "Appele quand l utilisateur choisit un lien."
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "default": "--o-palette-brand-500,--o-palette-fuchsia-500,--o-palette-sky-500",
        "description": "Tokens de couleur : le premier remplit la pastille, tous colorent les gouttes."
      },
      {
        "name": "drops",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Nombre de gouttes projetees a chaque changement.",
        "min": 0,
        "max": 24,
        "step": 1
      },
      {
        "name": "distance",
        "type": "number",
        "required": false,
        "default": 48,
        "unit": "px",
        "description": "Portee des gouttes.",
        "min": 16,
        "max": 120,
        "step": 4
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Navigation",
        "description": "Nom du bloc pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le filtre gluant ne couvre que le calque de la pastille, jamais le texte. Les gouttes sont des animations d images cles retirees a leur fin. Sous mouvement reduit la pastille saute, sans goutte."
    },
    "id": "ui/gooey-nav"
  },
  {
    "name": "hover-reveal-button",
    "category": "ui",
    "title": "Bouton a fond deploye",
    "description": "Une pastille qui s etend jusqu a devenir le fond, et deux copies du libelle qui se croisent sans changer la largeur.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/HoverRevealButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-600",
      "--o-palette-zinc-50",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Libelle du bouton."
      },
      {
        "name": "adornment",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui accompagne le libelle une fois le fond deploye. Emplacement : le registre ne depend d aucun jeu de pictogrammes."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-brand-600, --o-palette-zinc-50",
        "description": "Tokens du fond deploye et du texte sur ce fond."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux transitions et un changement de taille. La largeur suit le contenu au lieu d etre figee, ce qui evite de couper les libelles longs."
    },
    "id": "ui/hover-reveal-button"
  },
  {
    "name": "infinite-menu",
    "category": "ui",
    "title": "Menu infini",
    "description": "Les liens sont poses sur une roue qui tourne a la molette et au glisser, sans fin, et se cale toujours sur un cran.",
    "engine": {
      "gsap": [
        "core"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/InfiniteMenu.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les liens, dans l ordre de la roue. Trois au moins pour que la roue ait un sens."
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 140,
        "unit": "px",
        "description": "Rayon de la roue. Plus grand, les liens sont plus espaces et la courbure moins visible.",
        "min": 80,
        "max": 320,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse a laquelle la roue rejoint son cran. Plus haut, plus sec.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Navigation",
        "description": "Nom du bloc pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation 3D par lien, ecrite depuis la boucle du moteur tant que la roue bouge, puis plus rien. Aucun rendu React pendant le mouvement. Sous mouvement reduit la roue saute de cran en cran, sans elan."
    },
    "id": "ui/infinite-menu"
  },
  {
    "name": "line-sidebar",
    "category": "ui",
    "title": "Barre laterale en traits",
    "description": "Une colonne de traits qui s allongent a l approche du pointeur et decouvrent leur libelle ; le trait de la page courante reste long, en teinte de marque.",
    "engine": {
      "gsap": [
        "core"
      ],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/LineSidebar.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-base"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les liens, de haut en bas."
      },
      {
        "name": "side",
        "type": "'left' | 'right'",
        "required": false,
        "default": "left",
        "description": "Bord de l ecran ou la barre est posee : les traits partent de ce bord.",
        "options": [
          "left",
          "right"
        ]
      },
      {
        "name": "extend",
        "type": "number",
        "required": false,
        "default": 2.4,
        "description": "Allongement maximal d un trait, atteint sous le pointeur.",
        "min": 1.2,
        "max": 4,
        "step": 0.1
      },
      {
        "name": "reach",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "px",
        "description": "Rayon d influence du pointeur. Au-dela, un trait reste au repos.",
        "min": 30,
        "max": 240,
        "step": 10
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Vitesse a laquelle les traits suivent le pointeur. Plus haut, plus sec.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Navigation",
        "description": "Nom du bloc pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une echelle horizontale par trait, ecrite depuis la boucle du moteur tant que le pointeur est dans la barre. Aucun rendu React au survol. Au doigt et sous mouvement reduit, seuls le survol et le focus allongent un trait, par transition."
    },
    "id": "ui/line-sidebar"
  },
  {
    "name": "liquid-button",
    "category": "ui",
    "title": "Bouton a maree",
    "description": "Un calque colore monte derriere le libelle au survol, avec un leger deborde elastique.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/LiquidButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-zinc-50"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Libelle du bouton."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 450,
        "unit": "ms",
        "description": "Duree de la montee du calque.",
        "min": 150,
        "max": 1200,
        "step": 50
      },
      {
        "name": "direction",
        "type": "'up' | 'left'",
        "required": false,
        "default": "up",
        "description": "Sens d arrivee du calque colore.",
        "options": [
          "up",
          "left"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de transformation et une de couleur, tenues par le compositeur. Sous mouvement reduit la montee devient un fondu."
    },
    "id": "ui/liquid-button"
  },
  {
    "name": "liquid-glass-button",
    "category": "ui",
    "title": "Bouton verre liquide",
    "description": "Une pastille de verre depoli posee sur la page : le fond se devine a travers, un reflet coule au survol, et la pression l ecrase avant qu elle ne reprenne sa forme.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/LiquidGlassButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-palette-white",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Libelle du bouton."
      },
      {
        "name": "href",
        "type": "string",
        "required": false,
        "description": "Cible du lien. Avec elle, le bouton est rendu comme un lien."
      },
      {
        "name": "colors",
        "type": "readonly [string, string]",
        "required": false,
        "default": "--o-palette-brand-500, --o-palette-white",
        "description": "Tokens de la teinte du verre et de sa lumiere."
      },
      {
        "name": "blur",
        "type": "number",
        "required": false,
        "default": 14,
        "unit": "px",
        "description": "Flou du fond vu a travers le verre.",
        "min": 0,
        "max": 32,
        "step": 2
      },
      {
        "name": "tint",
        "type": "number",
        "required": false,
        "default": 0.18,
        "description": "Part de teinte dans le verre, de zero a un.",
        "min": 0,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "spring",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree du retour elastique apres la pression.",
        "min": 200,
        "max": 1400,
        "step": 50
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un filtre d arriere-plan par bouton, statique : il ne se recalcule que si ce qui est derriere bouge. Les transitions portent sur transform et opacity. Sous mouvement reduit le reflet est pose a sa place d arrivee et la pression ne rebondit plus."
    },
    "id": "ui/liquid-glass-button"
  },
  {
    "name": "magnify-dock",
    "category": "ui",
    "title": "Barre a loupe",
    "description": "Les elements grossissent a l approche du pointeur, vers le haut, sans jamais deplacer leurs voisins.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/MagnifyDock.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "scale",
        "type": "number",
        "required": false,
        "default": 1.6,
        "description": "Echelle maximale, atteinte sous le pointeur.",
        "min": 1,
        "max": 3,
        "step": 0.1
      },
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 130,
        "unit": "px",
        "description": "Rayon d influence. Au-dela, un element ne bouge plus.",
        "min": 40,
        "max": 320,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une boucle qui n ecrit qu une echelle par element, sans jamais re-rendre l arbre React. Rien du tout au doigt ni en mouvement reduit."
    },
    "id": "ui/magnify-dock"
  },
  {
    "name": "masonry",
    "category": "ui",
    "title": "Maconnerie",
    "description": "Une galerie en colonnes de hauteurs libres, dont chaque vignette monte a sa place quand elle entre dans le champ.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/Masonry.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-palette-brand-500",
      "--o-duration-slower",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { src: string; alt: string; caption?: string }[]",
        "required": true,
        "description": "Les images de la galerie, dans l ordre de lecture. Chaque image porte son texte de remplacement."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la galerie pour les lecteurs d ecran."
      },
      {
        "name": "onSelect",
        "type": "(src: string) => void",
        "required": false,
        "description": "Appele au clic ou a Entree sur une vignette. Sans lui, les vignettes ne sont pas des cibles."
      },
      {
        "name": "columns",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre maximal de colonnes. Il en tient moins quand la place manque.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "minWidth",
        "type": "number",
        "required": false,
        "default": 200,
        "unit": "px",
        "description": "Largeur minimale d une colonne. C est elle qui decide combien il en tient.",
        "min": 120,
        "max": 420,
        "step": 10
      },
      {
        "name": "gap",
        "type": "number",
        "required": false,
        "default": 16,
        "unit": "px",
        "description": "Ecart entre deux vignettes, en hauteur comme en largeur.",
        "min": 0,
        "max": 48,
        "step": 2
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 90,
        "unit": "ms",
        "description": "Retard ajoute d une colonne a la suivante dans la montee.",
        "min": 0,
        "max": 300,
        "step": 10
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Les colonnes sont celles du navigateur : aucune mesure, aucune position calculee. La montee est une transition retardee par une variable, liberee par un unique observateur qui ecrit un attribut sur la vignette — pas un rendu React par vignette. Sous mouvement reduit, tout est en place au premier rendu."
    },
    "id": "ui/masonry"
  },
  {
    "name": "option-wheel",
    "category": "ui",
    "title": "Roue d options",
    "description": "Un tambour que l on fait tourner a la molette ou au doigt, dont les lignes s inclinent selon leur distance au centre et qui se cale sur l option retenue.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/OptionWheel.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-fast"
    ],
    "props": [
      {
        "name": "options",
        "type": "readonly { value: string; label: string }[]",
        "required": true,
        "description": "Les options, dans l ordre du tambour."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la roue pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "string",
        "required": false,
        "description": "Option choisie, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "required": false,
        "description": "Option choisie au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(value: string) => void",
        "required": false,
        "description": "Appele quand la roue se cale sur une option."
      },
      {
        "name": "visible",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre de lignes visibles. Un nombre impair centre la ligne choisie.",
        "min": 3,
        "max": 9,
        "step": 2
      },
      {
        "name": "curve",
        "type": "number",
        "required": false,
        "default": 18,
        "unit": "deg",
        "description": "Inclinaison ajoutee par ligne d ecart au centre.",
        "min": 0,
        "max": 40,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le defilement et le calage sont ceux du navigateur ; l inclinaison est ecrite sur les lignes une fois par image utile, sans rendu React. La valeur n est publiee qu a l arret. Sous mouvement reduit, la roue devient une liste plate."
    },
    "id": "ui/option-wheel"
  },
  {
    "name": "pearl-button",
    "category": "ui",
    "title": "Bouton en nacre",
    "description": "Un volume obtenu par cinq ombres superposees, sans image ni filtre, et qui suit le theme.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/PearlButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
      "--o-palette-zinc-50",
      "--o-palette-zinc-900",
      "--o-duration-base",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Libelle du bouton."
      },
      {
        "name": "glyph",
        "type": "string",
        "required": false,
        "default": "✧",
        "description": "Glyphe au repos."
      },
      {
        "name": "glyphHover",
        "type": "string",
        "required": false,
        "default": "✦",
        "description": "Glyphe au survol. La bascule est une regle CSS, pas un etat React."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-palette-zinc-950, --o-palette-zinc-50, --o-palette-zinc-900",
        "description": "Tokens du corps, de la lumiere et de l ombre. Les echanger rend le bouton utilisable sur fond clair."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Cinq ombres et deux pseudo-elements. Aucune image, aucun filtre, aucun JavaScript a l execution."
    },
    "id": "ui/pearl-button"
  },
  {
    "name": "pill-nav",
    "category": "ui",
    "title": "Navigation a pilule",
    "description": "Une pilule de surface suit le lien survole ou focalise, puis revient se poser sous la page courante.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/PillNav.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les liens, dans l ordre d affichage."
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante, en mode controle."
      },
      {
        "name": "defaultActive",
        "type": "number",
        "required": false,
        "description": "Page courante au montage, en mode non controle."
      },
      {
        "name": "onActiveChange",
        "type": "(index: number) => void",
        "required": false,
        "description": "Appele quand l utilisateur choisit un lien."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Navigation",
        "description": "Nom du bloc pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "La pilule est placee par transformation et largeur, animees par une transition CSS ; aucun rendu React au survol. Sous mouvement reduit elle saute."
    },
    "id": "ui/pill-nav"
  },
  {
    "name": "pill-tabs",
    "category": "ui",
    "title": "Onglets a pastille",
    "description": "Une pastille glisse sous l onglet actif, mesuree sur le vrai texte plutot que devinee.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/PillTabs.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-600",
      "--o-palette-zinc-50",
      "--o-duration-base"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { id: string; label: string }[]",
        "required": true,
        "description": "Les onglets, dans l ordre d affichage."
      },
      {
        "name": "value",
        "type": "string",
        "required": false,
        "description": "Identifiant de l onglet actif, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "required": false,
        "description": "Onglet actif au montage, en mode non controle."
      },
      {
        "name": "onValueChange",
        "type": "(id: string) => void",
        "required": false,
        "description": "Appele quand l utilisateur change d onglet."
      },
      {
        "name": "size",
        "type": "'sm' | 'md'",
        "required": false,
        "default": "md",
        "description": "Taille des onglets.",
        "options": [
          "sm",
          "md"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "La pastille est placee par transformation puis animee depuis sa position precedente : une seule propriete composee. Sous mouvement reduit elle saute directement."
    },
    "id": "ui/pill-tabs"
  },
  {
    "name": "pixel-card",
    "category": "ui",
    "title": "Carte pixel",
    "description": "Au survol, le bord se couvre de carres qui rongent vers l interieur, puis se retirent.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/PixelCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Cote d une cellule.",
        "min": 4,
        "max": 24,
        "step": 1
      },
      {
        "name": "depth",
        "type": "number",
        "required": false,
        "default": 56,
        "unit": "px",
        "description": "Profondeur de la bande pixelisee depuis le bord.",
        "min": 16,
        "max": 160,
        "step": 4
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 600,
        "unit": "ms",
        "description": "Duree pour couvrir toute la bande.",
        "min": 150,
        "max": 2000,
        "step": 50
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur des cellules. Par defaut, la teinte de marque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un canevas redessine par image pendant le survol seulement ; la boucle se suspend au repos. Vide au doigt et sous mouvement reduit."
    },
    "id": "ui/pixel-card"
  },
  {
    "name": "profile-card",
    "category": "ui",
    "title": "Carte de profil",
    "description": "Portrait, nom et role sur une carte qui s incline vers le pointeur, le portrait un cran devant, une bande de brillance qui la traverse.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ProfileCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-theme-muted",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Nom affiche."
      },
      {
        "name": "subtitle",
        "type": "string",
        "required": false,
        "description": "Sous-titre : un role, un metier, un lieu."
      },
      {
        "name": "avatar",
        "type": "string | ReactNode",
        "required": false,
        "description": "Portrait : une source d image, ou un element (initiales, icone)."
      },
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "deg",
        "description": "Inclinaison maximale.",
        "min": 0,
        "max": 20,
        "step": 1
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse a laquelle la carte rejoint l angle vise.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "sheen",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Intensite de la bande de brillance. Zero la supprime.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "tint",
        "type": "string",
        "required": false,
        "description": "Teinte de la brillance et du fond du portrait. Par defaut, la teinte de marque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transformation et une variable ecrites par image pendant le survol, sans rendu React. Plate au doigt et sous mouvement reduit."
    },
    "id": "ui/profile-card"
  },
  {
    "name": "progress-ring",
    "category": "ui",
    "title": "Anneau de progression",
    "description": "Un arc qui rejoint sa valeur en glissant, le pourcentage au centre en chiffres tabulaires.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ProgressRing.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500",
      "--o-duration-slower",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "value",
        "type": "number",
        "required": false,
        "default": 65,
        "description": "Progression, de zero a cent.",
        "min": 0,
        "max": 100,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 96,
        "unit": "px",
        "description": "Diametre de l anneau.",
        "min": 48,
        "max": 200,
        "step": 4
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "px",
        "description": "Epaisseur du trait.",
        "min": 2,
        "max": 20,
        "step": 1
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition sur le decalage du trait, rien par frame. Sous mouvement reduit l arc saute directement a sa valeur."
    },
    "id": "ui/progress-ring"
  },
  {
    "name": "prompt-input",
    "category": "ui",
    "title": "Champ de saisie deplie",
    "description": "Un champ qui grandit avec son contenu, avec pieces jointes et dictee — sans simulation quand le micro manque.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/PromptInput.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-fast",
      "--o-duration-slow",
      "--o-ease-standard",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "placeholder",
        "type": "string",
        "required": false,
        "default": "Posez votre question",
        "description": "Texte d invite du champ."
      },
      {
        "name": "maxAttachments",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Nombre maximum de pieces jointes.",
        "min": 1,
        "max": 12,
        "step": 1
      },
      {
        "name": "accept",
        "type": "string",
        "required": false,
        "default": "image/*",
        "description": "Types acceptes par le selecteur de fichiers."
      },
      {
        "name": "controls",
        "type": "ReactNode",
        "required": false,
        "description": "Reglages rendus dans la barre basse. Emplacement : le registre ne connait ni les modeles ni leurs marques."
      },
      {
        "name": "onSubmit",
        "type": "(value: string, attachments: readonly File[]) => void",
        "required": false,
        "description": "Appele a l envoi. Entree envoie, Maj+Entree passe a la ligne."
      },
      {
        "name": "onPreview",
        "type": "(attachment: PromptAttachment) => void",
        "required": false,
        "description": "Appele quand une vignette est ouverte. L apercu appartient a la page."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucune boucle et aucune dependance. La dictee passe par la reconnaissance vocale du navigateur quand elle existe, et le bouton est simplement absent sinon — l implementation d origine ecrivait a la place une phrase d exemple, mot a mot, dans le champ de l utilisateur."
    },
    "id": "ui/prompt-input"
  },
  {
    "name": "rating-stars",
    "category": "ui",
    "title": "Etoiles de notation",
    "description": "Des etoiles qui s allument en cascade, previsualisent au survol et s ajustent aux fleches.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/RatingStars.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-amber-400",
      "--o-duration-base",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "count",
        "type": "number",
        "required": false,
        "default": 5,
        "description": "Nombre d etoiles.",
        "min": 3,
        "max": 10,
        "step": 1
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 24,
        "unit": "px",
        "description": "Taille d une etoile.",
        "min": 16,
        "max": 48,
        "step": 2
      },
      {
        "name": "value",
        "type": "number",
        "required": false,
        "description": "Note courante, en mode controle. Valeurs entieres."
      },
      {
        "name": "defaultValue",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Note au montage, en mode non controle."
      },
      {
        "name": "onValueChange",
        "type": "(value: number) => void",
        "required": false,
        "description": "Appele quand la note change."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une animation d entree en cascade au montage, puis des transitions de couleur. Sous mouvement reduit les etoiles arrivent sans cascade."
    },
    "id": "ui/rating-stars"
  },
  {
    "name": "reflective-card",
    "category": "ui",
    "title": "Carte reflechissante",
    "description": "Un reflet metallique tourne autour de la carte en suivant le pointeur : anneau conique sur le filet, bande et brossage sur la surface.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ReflectiveCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line"
    ],
    "props": [
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6,
        "description": "Vitesse a laquelle le reflet rejoint le pointeur.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "shine",
        "type": "number",
        "required": false,
        "default": 0.12,
        "description": "Intensite du reflet sur la surface, de zero a un.",
        "min": 0,
        "max": 0.5,
        "step": 0.02
      },
      {
        "name": "brush",
        "type": "number",
        "required": false,
        "default": 0.06,
        "description": "Intensite du brossage. Zero le supprime.",
        "min": 0,
        "max": 0.2,
        "step": 0.01
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une variable d angle ecrite par image tant que le reflet tourne, aucun rendu React. Reflet fige a son angle de repos au doigt et sous mouvement reduit."
    },
    "id": "ui/reflective-card"
  },
  {
    "name": "segmented-control",
    "category": "ui",
    "title": "Controle segmente a glissiere",
    "description": "Un choix parmi quelques options, dans un rail creux ou une glissiere en relief vient se poser sous l option choisie, avec un leger depassement.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/SegmentedControl.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-duration-slow",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "options",
        "type": "readonly { value: string; label: string; icon?: ReactNode; disabled?: boolean }[]",
        "required": true,
        "description": "Les options, dans l ordre d affichage."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du groupe pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "string",
        "required": false,
        "description": "Option choisie, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "required": false,
        "description": "Option choisie au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(value: string) => void",
        "required": false,
        "description": "Appele quand l utilisateur choisit une option."
      },
      {
        "name": "full",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Les options se partagent la largeur a parts egales."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Neutralise le groupe entier."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "La glissiere est placee par transformation et largeur, animees par une transition CSS mesuree sur l option reelle ; aucun rendu React pendant le trajet. Sous mouvement reduit elle saute."
    },
    "id": "ui/segmented-control"
  },
  {
    "name": "shiny-button",
    "category": "ui",
    "title": "Bouton a lisere tournant",
    "description": "Un degrade conique qui tourne autour du bouton, anime par une propriete enregistree — sans une ligne de JavaScript.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ShinyButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
      "--o-palette-zinc-50",
      "--o-palette-brand-500",
      "--o-palette-brand-300",
      "--o-font-sans",
      "--o-duration-slower",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Contenu du bouton."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string, string]",
        "required": false,
        "default": "--o-palette-zinc-950, --o-palette-zinc-50, --o-palette-brand-500, --o-palette-brand-300",
        "description": "Tokens du fond, du texte, du lisere et de son eclat au survol."
      },
      {
        "name": "spin",
        "type": "number",
        "required": false,
        "default": 3000,
        "unit": "ms",
        "description": "Duree d un tour du lisere.",
        "min": 800,
        "max": 8000,
        "step": 200
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Aucune boucle JavaScript : l angle du degrade est une propriete enregistree, donc animable par le compositeur. L animation reste en pause tant que le bouton n est ni survole ni au focus."
    },
    "id": "ui/shiny-button"
  },
  {
    "name": "sortable-list",
    "category": "ui",
    "title": "Liste reordonnable",
    "description": "Une liste dont on change l ordre a la souris par sa poignee, ou au clavier — Espace saisit, les fleches deplacent, Espace depose — chaque etape etant annoncee.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/SortableList.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-fast",
      "--o-duration-base",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { id: string; label: string; hint?: string }[]",
        "required": true,
        "description": "Les lignes, indexees par identifiant."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de la liste pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "readonly string[]",
        "required": false,
        "description": "Ordre des identifiants, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "readonly string[]",
        "required": false,
        "description": "Ordre au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(order: readonly string[]) => void",
        "required": false,
        "description": "Appele avec le nouvel ordre, a chaque deplacement termine."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Neutralise la liste."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le glisser n ecrit que des transformations sur les elements : un seul rendu React, au lacher. Le deplacement au clavier est anime par FLIP, en une animation par ligne deplacee. Sous mouvement reduit, l ordre change sans trajet."
    },
    "id": "ui/sortable-list"
  },
  {
    "name": "specular-button",
    "category": "ui",
    "title": "Bouton a reflet speculaire",
    "description": "Un point de lumiere suit le pointeur sur la surface du bouton, et le bord s eclaire du cote de la lumiere, comme sur un objet verni.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/SpecularButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-600",
      "--o-palette-zinc-50",
      "--o-palette-white"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Libelle du bouton."
      },
      {
        "name": "href",
        "type": "string",
        "required": false,
        "description": "Cible du lien. Avec elle, le bouton est rendu comme un lien."
      },
      {
        "name": "colors",
        "type": "readonly [string, string, string]",
        "required": false,
        "default": "--o-palette-brand-600, --o-palette-zinc-50, --o-palette-white",
        "description": "Tokens du corps, du libelle et de la lumiere."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 120,
        "unit": "%",
        "description": "Diametre du reflet, en pourcentage de la largeur du bouton.",
        "min": 40,
        "max": 240,
        "step": 10
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.55,
        "description": "Intensite du reflet, de zero a un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "lag",
        "type": "number",
        "required": false,
        "default": 180,
        "unit": "ms",
        "description": "Retard du reflet sur le pointeur. A zero, il colle au curseur.",
        "min": 0,
        "max": 600,
        "step": 20
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux nombres enregistres par @property portent la position de la lumiere ; le compositeur fait le trajet, aucun rendu React au survol. Sans pointeur fin ou sous mouvement reduit, la lumiere reste fixe en haut a gauche."
    },
    "id": "ui/specular-button"
  },
  {
    "name": "spotlight-card",
    "category": "ui",
    "title": "Carte projecteur",
    "description": "Un halo amorti suit le pointeur sur la surface, et la bordure s eclaire la ou le faisceau touche le filet.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/SpotlightCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [
      "hooks/use-pointer-damped"
    ],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "radius",
        "type": "number",
        "required": false,
        "default": 260,
        "unit": "px",
        "description": "Rayon du halo.",
        "min": 80,
        "max": 600,
        "step": 10
      },
      {
        "name": "strength",
        "type": "number",
        "required": false,
        "default": 0.35,
        "description": "Intensite du halo sur la surface, de zero a un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Vitesse a laquelle le halo rejoint le pointeur. Plus haut, plus sec.",
        "min": 2,
        "max": 20,
        "step": 1
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "description": "Couleur du projecteur. Par defaut, la teinte de marque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux variables CSS ecrites depuis la boucle tant que le halo bouge, aucun rendu React. Inerte au doigt et sous mouvement reduit."
    },
    "id": "ui/spotlight-card"
  },
  {
    "name": "stacked-cards",
    "category": "ui",
    "title": "Cartes en eventail",
    "description": "Un paquet de cartes empilees qui s eventent au survol ou au focus.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/StackedCards.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-duration-slow",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Les cartes, jusqu a quatre. La premiere donne sa taille au paquet."
      },
      {
        "name": "spread",
        "type": "number",
        "required": false,
        "default": 10,
        "unit": "deg",
        "description": "Angle entre deux cartes une fois eventees.",
        "min": 4,
        "max": 25,
        "step": 1
      },
      {
        "name": "lift",
        "type": "number",
        "required": false,
        "default": 36,
        "unit": "px",
        "description": "Ecart horizontal entre deux cartes une fois eventees.",
        "min": 8,
        "max": 96,
        "step": 4
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de transformation par carte, quatre au plus, tenues par le compositeur. Sous mouvement reduit l eventail s ouvre sans trajet."
    },
    "id": "ui/stacked-cards"
  },
  {
    "name": "staggered-menu",
    "category": "ui",
    "title": "Menu decale",
    "description": "Un menu plein ecran ouvert par un bouton : des bandes de couleur balaient l ecran, le panneau les suit, et les liens montent un a un.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/StaggeredMenu.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-bg",
      "--o-theme-fg",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "items",
        "type": "readonly { label: string; href?: string; icon?: ReactNode }[]",
        "required": true,
        "description": "Les liens, dans l ordre d affichage."
      },
      {
        "name": "colors",
        "type": "readonly string[]",
        "required": false,
        "default": "--o-palette-brand-500,--o-theme-fg",
        "description": "Tokens des bandes qui precedent le panneau, dans l ordre de passage."
      },
      {
        "name": "side",
        "type": "'right' | 'left'",
        "required": false,
        "default": "right",
        "description": "Bord par lequel bandes et panneau entrent.",
        "options": [
          "right",
          "left"
        ]
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 70,
        "unit": "ms",
        "description": "Decalage entre deux liens.",
        "min": 0,
        "max": 200,
        "step": 10
      },
      {
        "name": "contained",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Couvre le parent positionne plutot que la fenetre. Utile dans une maquette."
      },
      {
        "name": "active",
        "type": "number",
        "required": false,
        "description": "Index de la page courante."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Menu",
        "description": "Nom du bloc de navigation pour les lecteurs d ecran."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Bandes, panneau et liens sont des transitions de transformation, chacune avec son retard ; un rendu React par ouverture. Le defilement de la page est bloque tant que le menu couvre la fenetre. Sous mouvement reduit tout apparait d un coup."
    },
    "id": "ui/staggered-menu"
  },
  {
    "name": "star-border",
    "category": "ui",
    "title": "Bordure a etoile filante",
    "description": "Deux etoiles filantes parcourent le contour, l une sur le bord haut vers la droite, l autre sur le bord bas vers la gauche, et laissent une trainee de lumiere derriere elles.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/StarBorder.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-400",
      "--o-theme-surface",
      "--o-theme-line"
    ],
    "props": [
      {
        "name": "children",
        "type": "ReactNode",
        "required": true,
        "description": "Contenu encadre."
      },
      {
        "name": "color",
        "type": "string",
        "required": false,
        "default": "--o-palette-brand-400",
        "description": "Token de la couleur des etoiles."
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 6000,
        "unit": "ms",
        "description": "Duree d un passage d une etoile.",
        "min": 1500,
        "max": 14000,
        "step": 500
      },
      {
        "name": "thickness",
        "type": "number",
        "required": false,
        "default": 1,
        "unit": "px",
        "description": "Epaisseur du filet dans lequel l etoile brille.",
        "min": 1,
        "max": 4,
        "step": 1
      },
      {
        "name": "glow",
        "type": "number",
        "required": false,
        "default": 0.7,
        "description": "Intensite de la trainee, de zero a un.",
        "min": 0,
        "max": 1,
        "step": 0.05
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux animations de translation sur deux degrades, tenues par le compositeur ; aucun filtre. Sous mouvement reduit chaque etoile est posee au milieu de son bord, fixe."
    },
    "id": "ui/star-border"
  },
  {
    "name": "stepper",
    "category": "ui",
    "title": "Parcours en etapes",
    "description": "Un rail d etapes numerotees dont le trait se remplit derriere l avancee, et dont le panneau entre du cote d ou l on vient.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/Stepper.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-palette-zinc-50",
      "--o-duration-base",
      "--o-duration-slow",
      "--o-duration-slower",
      "--o-ease-standard",
      "--o-ease-emphasized"
    ],
    "props": [
      {
        "name": "steps",
        "type": "readonly { id: string; label: string; hint?: string }[]",
        "required": true,
        "description": "Les etapes, dans l ordre du parcours."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du parcours pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "number",
        "required": false,
        "description": "Index de l etape courante, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "number",
        "required": false,
        "default": 0,
        "description": "Index de l etape courante au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(index: number) => void",
        "required": false,
        "description": "Appele avec l index de l etape choisie."
      },
      {
        "name": "children",
        "type": "ReactNode",
        "required": false,
        "description": "Contenu de l etape courante, anime a chaque changement."
      },
      {
        "name": "orientation",
        "type": "string",
        "required": false,
        "default": "horizontal",
        "description": "Sens de lecture du rail.",
        "options": [
          "horizontal",
          "vertical"
        ]
      },
      {
        "name": "reach",
        "type": "string",
        "required": false,
        "default": "done",
        "description": "Ce que l on peut atteindre en cliquant : les etapes franchies, toutes, ou aucune.",
        "options": [
          "done",
          "all",
          "none"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Le trait se remplit par une transformation, le panneau entre par une animation d images cles reprise a chaque changement de clef. Sous mouvement reduit, le trait est rempli d un coup et le panneau parait sans glisser."
    },
    "id": "ui/stepper"
  },
  {
    "name": "tag-input",
    "category": "ui",
    "title": "Champ a etiquettes",
    "description": "Entree ou virgule pose une etiquette, Retour sur un champ vide arme puis retire la derniere, et chaque etiquette nait d un petit rebond.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/TagInput.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-base",
      "--o-duration-slow"
    ],
    "props": [
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom du champ pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "readonly string[]",
        "required": false,
        "description": "Les etiquettes, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "readonly string[]",
        "required": false,
        "description": "Etiquettes au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(tags: readonly string[]) => void",
        "required": false,
        "description": "Appele a chaque ajout ou retrait."
      },
      {
        "name": "placeholder",
        "type": "string",
        "required": false,
        "default": "Ajouter...",
        "description": "Texte d attente, affiche quand le champ est vide."
      },
      {
        "name": "max",
        "type": "number",
        "required": false,
        "default": 8,
        "description": "Nombre maximal d etiquettes. Atteint, le champ se ferme.",
        "min": 1,
        "max": 20,
        "step": 1
      },
      {
        "name": "duplicates",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Accepte deux fois la meme etiquette."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Neutralise le champ."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Un rendu React par ajout ou retrait, aucun a la frappe hors du brouillon. L entree d une etiquette est une animation d images cles sur transform et opacity. Sous mouvement reduit les etiquettes apparaissent en place."
    },
    "id": "ui/tag-input"
  },
  {
    "name": "text-fall-button",
    "category": "ui",
    "title": "Bouton a lettres qui tombent",
    "description": "Au survol, les lettres du libelle tombent une a une hors du bouton, et une seconde rangee descend prendre leur place.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/TextFallButton.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-500"
    ],
    "props": [
      {
        "name": "children",
        "type": "string",
        "required": true,
        "description": "Libelle du bouton, en texte : il est decoupe en lettres."
      },
      {
        "name": "href",
        "type": "string",
        "required": false,
        "description": "Cible du lien. Avec elle, le bouton est rendu comme un lien."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 380,
        "unit": "ms",
        "description": "Duree de la chute d une lettre.",
        "min": 150,
        "max": 900,
        "step": 10
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 22,
        "unit": "ms",
        "description": "Ecart entre deux lettres voisines.",
        "min": 0,
        "max": 80,
        "step": 2
      },
      {
        "name": "accent",
        "type": "boolean",
        "required": false,
        "default": true,
        "description": "La rangee qui descend prend la teinte de marque."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une transition de transformation par lettre, toutes portees par le compositeur ; le decalage est une variable par lettre, sans JavaScript au survol. Sous mouvement reduit la seconde rangee est deja en place."
    },
    "id": "ui/text-fall-button"
  },
  {
    "name": "theme-switch",
    "category": "ui",
    "title": "Interrupteur jour nuit",
    "description": "Un soleil devient lune, la piste change de teinte et des etoiles s allument cote nuit.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ThemeSwitch.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-sky-400",
      "--o-palette-indigo-950",
      "--o-palette-amber-400",
      "--o-palette-zinc-50",
      "--o-duration-slow",
      "--o-ease-standard"
    ],
    "props": [
      {
        "name": "checked",
        "type": "boolean",
        "required": false,
        "description": "Etat nuit, en mode controle."
      },
      {
        "name": "defaultChecked",
        "type": "boolean",
        "required": false,
        "default": false,
        "description": "Etat au montage, en mode non controle."
      },
      {
        "name": "onCheckedChange",
        "type": "(checked: boolean) => void",
        "required": false,
        "description": "Appele quand l utilisateur bascule."
      },
      {
        "name": "size",
        "type": "number",
        "required": false,
        "default": 32,
        "unit": "px",
        "description": "Hauteur de l interrupteur.",
        "min": 24,
        "max": 64,
        "step": 4
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Des transitions de transformation, d opacite et de couleur, rien par frame. Purement decoratif : il ne touche pas au theme du site. Sous mouvement reduit la bascule est instantanee."
    },
    "id": "ui/theme-switch"
  },
  {
    "name": "tilt-card",
    "category": "ui",
    "title": "Carte inclinee",
    "description": "Une carte qui pivote vers le pointeur avec un retard, et un reflet qui le suit.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/TiltCard.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-50"
    ],
    "props": [
      {
        "name": "tilt",
        "type": "number",
        "required": false,
        "default": 8,
        "unit": "deg",
        "description": "Inclinaison maximale.",
        "min": 0,
        "max": 20,
        "step": 1
      },
      {
        "name": "perspective",
        "type": "number",
        "required": false,
        "default": 900,
        "unit": "px",
        "description": "Profondeur. Plus c est petit, plus la deformation est marquee.",
        "min": 300,
        "max": 2000,
        "step": 50
      },
      {
        "name": "speed",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "Vitesse a laquelle la carte rejoint l angle vise.",
        "min": 2,
        "max": 30,
        "step": 1
      },
      {
        "name": "glare",
        "type": "number",
        "required": false,
        "default": 0.18,
        "description": "Intensite du reflet. Zero le supprime.",
        "min": 0,
        "max": 0.6,
        "step": 0.02
      },
      {
        "name": "glareColour",
        "type": "string",
        "required": false,
        "description": "Couleur du reflet. Une valeur, pour qu elle suive le theme."
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Deux angles et deux positions ecrits par image, sans rendu React. Rien au doigt ni en mouvement reduit."
    },
    "id": "ui/tilt-card"
  },
  {
    "name": "toast-stack",
    "category": "ui",
    "title": "Pile de notifications",
    "description": "Des notifications qui s empilent l une devant l autre, s etalent au survol, et se retirent apres un delai que le survol met en pause.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/ToastStack.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-surface",
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-palette-emerald-500",
      "--o-palette-amber-500",
      "--o-palette-rose-500",
      "--o-duration-fast",
      "--o-duration-slow",
      "--o-ease-emphasized",
      "--o-z-toast"
    ],
    "props": [
      {
        "name": "toasts",
        "type": "readonly { id: string; title: string; description?: string; tone?: 'info' | 'succes' | 'alerte' | 'erreur' }[]",
        "required": true,
        "description": "Les notifications, de la plus ancienne a la plus recente."
      },
      {
        "name": "label",
        "type": "string",
        "required": false,
        "default": "Notifications",
        "description": "Nom de la region pour les lecteurs d ecran."
      },
      {
        "name": "onDismiss",
        "type": "(id: string) => void",
        "required": false,
        "description": "Appele quand une notification se retire, d elle-meme ou a la main."
      },
      {
        "name": "duration",
        "type": "number",
        "required": false,
        "default": 4000,
        "unit": "ms",
        "description": "Delai avant retrait. Zero laisse la notification jusqu au clic.",
        "min": 0,
        "max": 10000,
        "step": 500
      },
      {
        "name": "max",
        "type": "number",
        "required": false,
        "default": 3,
        "description": "Nombre de notifications visibles dans le paquet.",
        "min": 1,
        "max": 6,
        "step": 1
      },
      {
        "name": "side",
        "type": "string",
        "required": false,
        "default": "bottom",
        "description": "Cote ou la pile est ancree.",
        "options": [
          "bottom",
          "top"
        ]
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Les decalages sont mesures apres le rendu et ecrits en variables sur les elements ; les cartes se deplacent par transformation. Une minuterie par carte, mise en pause avec la barre de vie. Sous mouvement reduit, les cartes paraissent en place et le retrait reste."
    },
    "id": "ui/toast-stack"
  },
  {
    "name": "tree-view",
    "category": "ui",
    "title": "Arborescence pliable",
    "description": "Une arborescence complete au clavier — haut et bas parcourent, droite ouvre puis descend, gauche referme puis remonte — dont les branches se deroulent en cascade.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "ui/TreeView.tsx"
      }
    ],
    "dependencies": [
      "@odoro-cli/engine",
      "react"
    ],
    "registryDependencies": [],
    "tokens": [
      "--o-theme-line",
      "--o-palette-brand-500",
      "--o-duration-fast",
      "--o-duration-base",
      "--o-ease-standard",
      "--o-ease-entrance"
    ],
    "props": [
      {
        "name": "nodes",
        "type": "readonly { id: string; label: string; hint?: string; children?: readonly TreeNode[] }[]",
        "required": true,
        "description": "Les noeuds racines, dans l ordre d affichage."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Nom de l arborescence pour les lecteurs d ecran."
      },
      {
        "name": "value",
        "type": "string",
        "required": false,
        "description": "Noeud choisi, en mode controle."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "required": false,
        "description": "Noeud choisi au montage, en mode non controle."
      },
      {
        "name": "onChange",
        "type": "(id: string) => void",
        "required": false,
        "description": "Appele quand le choix change."
      },
      {
        "name": "open",
        "type": "readonly string[]",
        "required": false,
        "description": "Branches ouvertes, en mode controle."
      },
      {
        "name": "defaultOpen",
        "type": "readonly string[]",
        "required": false,
        "description": "Branches ouvertes au montage, en mode non controle."
      },
      {
        "name": "onOpenChange",
        "type": "(open: readonly string[]) => void",
        "required": false,
        "description": "Appele avec la liste des branches ouvertes."
      },
      {
        "name": "stagger",
        "type": "number",
        "required": false,
        "default": 30,
        "unit": "ms",
        "description": "Retard ajoute par ligne dans le deroulement d une branche.",
        "min": 0,
        "max": 120,
        "step": 5
      }
    ],
    "perf": {
      "tier": "light",
      "backend": false,
      "notes": "Une branche fermee n est pas montee : l arbre ne rend que ce qui se voit. Le deroulement est une animation d images cles retardee par un index en variable CSS. Sous mouvement reduit, les branches apparaissent en place."
    },
    "id": "ui/tree-view"
  }
]
