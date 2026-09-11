# GetLayers — Sections

Les 21 Sections du catalogue GetLayers, récupérées en HTML autonome (`target: other`,
le master portable framework-agnostique).

Chaque fichier est un document HTML complet et indépendant : ouvre-le directement dans
un navigateur, il fonctionne tel quel. Aucun build, aucune dépendance à installer.

Ouvre `index.html` pour la vue d'ensemble cliquable.

## Ce qu'est une Section

Dans le vocabulaire GetLayers, une **Section** est un écran interactif à usage unique
(un carrousel, une FAQ, un loader). C'est une brique re-skinnable qu'on pose dans une page.
Elle se décompose en trois couches, et les droits de modification diffèrent selon la couche :

| Couche | Ce que c'est | Droit |
|---|---|---|
| Composition | l'agencement, la structure | souvent modifiable |
| Motion | le mécanisme d'animation / d'interaction | à préserver — on l'appelle, on ne le réécrit pas |
| Skin | tokens, couleurs, typo, espacements, copy, images | toujours modifiable |

Chaque fichier déclare son propre contrat en tête de source. Le piège classique : re-skinner
une section puis « ranger » discrètement le timing de l'animation, et livrer quelque chose qui
ne se sent plus dessiné.

## Le logo ODORO

Chaque fichier porte le logo ODORO en badge fixe dans le coin haut-gauche : la marque suivie du
mot, en `#F57423`. Le bloc est délimité dans la source par des marqueurs `ODORO-BADGE:START` et
`ODORO-BADGE:END`, un en tête pour le CSS, un dans le corps pour le markup.

Il est posé par [`odoro-badge.py`](odoro-badge.py) :

```
python3 odoro-badge.py            # pose le badge, ou remplace celui qui est déjà là
python3 odoro-badge.py --remove   # le retire proprement de tous les fichiers
```

Le script est idempotent : le relancer remplace le bloc existant au lieu d'en empiler un second.
C'est la façon de propager un changement de taille, de couleur ou de position sur les 22 fichiers
d'un coup, plutôt que de les éditer un par un.

Trois choix dictés par ce que contiennent réellement ces Sections :

- **`pointer-events: none`.** Plusieurs Sections se pilotent à la souris. Mirror Hall, Spectra et
  Spotlight se tirent au drag. Un badge qui intercepte le pointeur casserait le geste.
- **`z-index: 2147483000`.** Le maximum trouvé dans le lot est 200, sur les rideaux de loader.
  Le badge passe au-dessus, donc il reste visible pendant le chargement, sur le rideau lui-même.
- **Deux décalages.** Le coin haut-gauche est libre partout sauf dans `loader-flowstate`, occupé
  par un bouton de rejeu de développement, et `loader-gravity-webgl`, qui a une vraie barre
  d'en-tête de 80 pixels. Le badge y descend sous l'occupant. Les valeurs sont dans la table
  `OFFSETS` du script.

### Le logo est une reconstruction

Les deux images fournies n'étaient pas des fichiers, donc le logo a été **redessiné** :

- **La marque est géométriquement exacte.** C'est un cercle dont le quart supérieur gauche est
  remplacé par un angle droit. Cercle de centre (50,50) et de rayon 40 dans un carré de 100, donc
  il passe précisément par le milieu du bord haut et le milieu du bord gauche. Rien n'y est
  approximé, c'est la même construction que l'original.
- **Le mot est du texte vivant, pas des tracés.** La police d'origine n'est pas identifiable depuis
  une image ; la pile utilisée vise un grotesque géométrique proche, sans être la vôtre.
- **L'orange `#F57423` est relevé à l'œil** sur les images fournies, pas sur une valeur de charte.

Pour passer au logo officiel : remplacez le tracé et la couleur dans `odoro-badge.py`, puis
relancez-le. Les fichiers de marque autonomes sont dans [`assets/odoro/`](assets/odoro/).

## Re-skinner

Chaque source expose ses réglages en deux endroits :

- Les **custom properties CSS** en haut du `<style>` (`--bg`, `--ink`, `--accent`, `--line`…).
- Un objet **`CONFIG`** en haut du `<script type="module">`, qui rassemble tout le reste :
  copy, contenus des cartes, géométrie, timings, easings.

Pour adapter une Section à un projet, on mappe ces variables sur les tokens du Style retenu.
Plusieurs fichiers embarquent aussi un panneau de réglage live en haut à droite, délimité par
des commentaires `DEV CONTROLS` : supprime ce bloc CSS, le markup `#ui` et le bloc JS pour
livrer sans lui.

## Les 21 Sections par rôle

### Loader (10)

Un loader est une Section comme une autre : il s'échange et se re-skinne. La règle de la maison
est de basculer la page au **début** de la sortie du rideau, jamais à son repos, pour que le
contenu s'anime **à travers** le rideau qui part.

| Fichier | Ton | Ce que ça fait |
|---|---|---|
| `loader-altitude.html` | sombre | Compteur qui monte vers 90, attend la page, puis le sol s'ouvre comme un diaphragme |
| `loader-artist.html` | clair | Label bas-gauche, pourcentage géant bas-droite, la plaque glisse vers le haut |
| `loader-baseline.html` | clair / sombre | Rideau plat, barre filaire gauche-droite, puis sortie par le haut |
| `loader-flowstate.html` | sombre | Aucun rideau, aucun compteur : le champ génératif détonne à la première frame |
| `loader-forma.html` | clair | Compte honnêtement jusqu'à 100, la dalle de progression se replie vers la droite |
| `loader-gravity-webgl.html` | clair | Le wordmark se démasque lettre par lettre, la barre refuse de finir tant que la scène 3D n'a pas rendu |
| `loader-halcyon.html` | sombre | Un wordmark émerge d'un flou profond, puis se dissout en enflant vers le spectateur |
| `loader-loopstack.html` | sombre | Le wordmark balaie le bord bas glyphe par glyphe depuis un flou de 20px |
| `loader-lumora.html` | sombre / clair | Dalle inversée, compteur trois chiffres, sortie en ressort vers le haut |
| `loader-marcus-vane.html` | sombre | Wordmark dans un coin, pourcentage énorme dans l'autre, rideau qui remonte |

### Carrousel (5)

| Fichier | Ton | Ce que ça fait |
|---|---|---|
| `carousel-spotlight.html` | clair | Anneau concave de cartes galerie courbé dans une scène éditoriale lumineuse |
| `carousel-under-the-radar.html` | clair | Large couronne de cartes encre-dans-l'eau, tournée à la main entre une typo surdimensionnée |
| `mirror-hall.html` | sombre | Rotonde de cartes lumineuses sur un bassin réfléchissant — WebGL / Three.js |
| `slider-slipstream.html` | sombre | Rivière de cartes portrait sur une courroie inclinée qui recule dans le noir |
| `slider-spectra.html` | sombre | Coverflow de cartes lunettes, la carte centrale projetant un halo calé sur sa propre teinte |

### Cartes (2)

| Fichier | Ton | Ce que ça fait |
|---|---|---|
| `cards-almanac.html` | clair | Colonne de cartes qui s'épinglent et s'empilent au scroll, chacune se posant à plat sur la précédente |
| `cards-cascade.html` | clair | Deck qui s'évente à plat au fond, monte vers une crête verticale, puis bascule et cascade dans une fosse |

### Autres rôles (4)

| Fichier | Rôle | Ton | Ce que ça fait |
|---|---|---|---|
| `hero-mirror-hall.html` | hero | sombre | **Voir l'avertissement ci-dessous** — le catalogue sert ici le carrousel, pas le hero |
| `colonnade.html` | features | clair | Rangée de colonnes-chapitres sur papier chaud, chacune remontant son panneau |
| `roadmap-ascent.html` | roadmap | sombre | Récit de croissance épinglé au scroll, un nœud fixe tient le centre |
| `showcase-equator.html` | showcase | clair | Scène coupée violet/beige, un deck de reel-cards et une liste de catégories bougent comme un seul bloc |

## Avertissement : `hero-mirror-hall` et `mirror-hall` sont le même fichier

Ces deux identifiants sont censés désigner deux Sections différentes : un hero pleine largeur
d'un côté, un carrousel en rotonde de l'autre. Le catalogue renvoie pourtant **exactement le même
document** pour les deux, au bit près (44 051 octets, md5 `4869fc15…`). Vérifié en redemandant
`hero-mirror-hall` à l'API : la source livrée est bien identique. Ce n'est donc pas une erreur
d'écriture de notre côté.

Le document livré est le **carrousel** : son titre est `Section · Mirror Hall`, son commentaire
d'en-tête décrit « an immersive, infinitely draggable 3D carousel », il gère le drag avec inertie
et une légende de focus. Sa clé de stockage est `getlayers:mirror-hall`.

L'enveloppe de métadonnées, elle, reste spécifique au hero. Le contrat annoncé pour
`hero-mirror-hall` parle de « la position du titre dans la grille » et d'« un sol teinté rouge
dans l'original » — or ni l'un ni l'autre n'existe dans le fichier livré, dont la palette est
entièrement noir et bleu. Autrement dit le catalogue attache des notes de hero à une charge
utile de carrousel.

Conséquence pratique : tu as le carrousel en double et tu n'as pas le hero. Les deux fichiers sont
conservés tels quels, sans correction inventée. Si le hero t'intéresse, c'est à signaler à
GetLayers.

## Images manquantes

Plusieurs Sections référencent des photos de contenu en chemin relatif, par exemple
`assets/cascade/plume.webp` ou `assets/almanac/lantern.webp`. Ces fichiers **ne sont pas livrés**
avec la source et ne sont pas exposés sur le CDN GetLayers. Les Sections tournent quand même,
mais les zones média resteront vides tant que tu n'auras pas mis tes propres images à ces chemins,
ou changé les chemins dans `CONFIG`.

Les Sections concernées sont celles à cartes et carrousels : `cards-almanac`, `cards-cascade`,
`carousel-spotlight`, `carousel-under-the-radar`, `mirror-hall`, `slider-slipstream`,
`slider-spectra`, `showcase-equator`. Les loaders n'ont pas ce problème.

## Aperçus

Chaque Section se regarde en ligne sur `https://www.getlayers.ai/?layer=<id>`, où `<id>` est le
nom du fichier sans l'extension. Les liens sont dans `index.html`.
