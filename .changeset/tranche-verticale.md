---
'odoro-engine': minor
---

`readTokenColour` et `NOISE_FUNCTIONS_3D`.

Le premier convertit une couleur de token en trois flottants pour un shader.
C'est le chainon qui manquait entre les tokens et WebGL : la palette est en
OKLCH, aucune API du navigateur ne rend trois flottants, et le detour par un
canevas donne un resultat qui depend de la version du navigateur. Sans lui,
tout fond anime finit avec ses couleurs ecrites en dur — ce que la validation
du registre refuse, a juste titre.

Le second fournit un bruit de valeur tridimensionnel. Le bruit plan existant
suffit a un effet plein ecran ; deformer une sphere avec lui demanderait une
projection, dont la couture et l'ecrasement aux poles se voient des que l'objet
tourne.
