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
    "name": "ashen-press",
    "category": "background",
    "title": "Fond AshenPress",
    "description": "Une porte vers le fond du paquet threeui : charge a l approche du champ, jamais sous mouvement reduit, avec un repli.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "background/AshenPress.tsx"
      }
    ],
    "dependencies": [
      "@designcodeio/threeui"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "rootMargin",
        "type": "string",
        "required": false,
        "default": "200px",
        "description": "Marge de declenchement du chargement. Le paquet arrive avant que le cadre n entre dans le champ."
      },
      {
        "name": "fallback",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui occupe le cadre tant que le fond n est pas la, et pour toujours sous mouvement reduit."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli par defaut, quand aucun n est fourni."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": false,
      "notes": "Le rendu appartient au paquet tiers et ouvre sa propre surface WebGL, hors de l arbitre du moteur. Une page qui emploie ce fond et un fond du registre ouvre deux contextes, et le navigateur perd silencieusement le plus ancien : un seul des deux par page. Rien n est telecharge avant l approche du champ, et rien du tout sous mouvement reduit.",
      "fallback": "poster"
    },
    "id": "background/ashen-press"
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-brand-600",
      "--o-palette-fuchsia-600",
      "--o-palette-zinc-50"
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
        "default": "--o-palette-brand-600, --o-palette-fuchsia-600, --o-palette-zinc-50",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-sky-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
      "--o-palette-zinc-800",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-50",
      "--o-palette-zinc-400",
      "--o-palette-zinc-950"
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
        "default": "--o-palette-zinc-50, --o-palette-zinc-400, --o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [
      "hooks/use-poster"
    ],
    "tokens": [
      "--o-palette-zinc-50",
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
        "default": "--o-palette-zinc-50, --o-palette-emerald-400, --o-palette-violet-300, --o-palette-sky-400, --o-palette-rose-400",
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
    "dependencies": [],
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
      "--o-palette-brand-500"
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-900",
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
    "dependencies": [],
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
      "--o-palette-zinc-100"
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
    "registryDependencies": [],
    "tokens": [
      "--o-palette-zinc-950",
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "name": "spline-scene",
    "category": "hero",
    "title": "Scene Spline",
    "description": "Une scene Spline chargee a l approche du champ, jamais sous mouvement reduit, et dont l adresse appartient au projet.",
    "engine": {
      "gsap": [],
      "gl": false
    },
    "files": [
      {
        "path": "component.tsx",
        "target": "hero/SplineScene.tsx"
      }
    ],
    "dependencies": [
      "@splinetool/react-spline",
      "@splinetool/runtime"
    ],
    "registryDependencies": [],
    "tokens": [],
    "props": [
      {
        "name": "scene",
        "type": "string",
        "required": true,
        "description": "URL de la scene, sur le compte Spline du projet. Sans valeur par defaut : une adresse d exemple ferait dependre la page d un fichier qui ne lui appartient pas."
      },
      {
        "name": "rootMargin",
        "type": "string",
        "required": false,
        "default": "200px",
        "description": "Marge de declenchement du chargement. Le runtime arrive avant que la scene n entre dans le champ."
      },
      {
        "name": "fallback",
        "type": "ReactNode",
        "required": false,
        "description": "Ce qui occupe le cadre tant que la scene n est pas la, et pour toujours sous mouvement reduit."
      },
      {
        "name": "poster",
        "type": "string",
        "required": false,
        "description": "Classes du repli par defaut, quand aucun n est fourni."
      }
    ],
    "perf": {
      "tier": "heavy",
      "backend": false,
      "notes": "Le runtime Spline pese plus de six cents kilo-octets compresses, et la scene elle-meme se compte en megaoctets. Rien n est telecharge avant que le cadre n approche du champ, et rien du tout sous mouvement reduit. C est la seule entree du registre a dependre d un paquet tiers a l execution : elle est copiee, donc un projet qui ne l appelle pas ne l installe pas.",
      "fallback": "poster"
    },
    "id": "hero/spline-scene"
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
      "@odoro-cli/icons"
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
    "dependencies": [],
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
  }
]
