# Médias à remplacer

Les médias du site, avec ce que chacun fait et les caractéristiques à respecter.
Les dimensions comptent : au-dessus de 1280 px la page est un board Figma en
positionnement absolu, donc un rapport d'aspect différent décale la mise en page.

Tous les chemins sont déclarés dans `src/data/mocks/home.ts`. Remplacer un
fichier au même chemin et aux mêmes dimensions suffit, aucun code à toucher.
Si les dimensions changent, mettre à jour `width` et `height` dans le même
fichier, sinon Next réserve la mauvaise place.

| Fichier | Dimensions | Contenu actuel | Rôle |
|---|---|---|---|
| `Hero/hero.png` | 2160 × 2271, alpha | La maison détourée, au crépuscule | Le bien du hero |
| `About/about.png` | 842 × 1025, alpha | **Bonhomme bâton dessiné**, généré | L'illustration de la section bien |
| `About/about-video.mp4` | 960 × 960, 97 images, 24 i/s | La maison en rotation 360 | La rotation qu'on fait tourner |
| `Location/location.png` | 2160 × 1437, alpha | La maison de trois quarts | Photo de la section situation |
| `Location/mask.png` | 1438 × 960, alpha | **Une épure filaire** de la maison | Le calque révélé au curseur |
| `Contact/contact.png` | 2160 × 1689, alpha | Le bâtiment entier au crépuscule | Photo de la section contact |
| `Mark/odoro-mark.glb` | 162 Ko, glTF binaire | **Le sigle ODORO**, généré | Le sigle 3D qui tourne |

## Les médias générés, et comment les régénérer

Deux fichiers ne viennent pas d'un appareil photo : ils sont produits par du
code, ce qui veut dire qu'ils se refont à l'identique et se modifient à la
source plutôt qu'à la main.

**Le sigle 3D** est construit géométriquement à partir du même tracé que
`BRAND_MARK_PATH` dans `src/components/ui/icons/brand-mark.tsx` : une boîte de
100 × 100, un arc extérieur de rayon 50 et un intérieur de 35, soit les 15
unités d'épaisseur du logo. Le dessin plat et le volume ne peuvent donc pas
diverger. `ScrollModel` lui applique son propre matériau (métal mat sombre) et
le recentre sur son englobant, donc le fichier ne porte ni matériau ni
transformation.

**Le bonhomme bâton** est dessiné par `tools-bonhomme-baton.py`, à la racine.
Le trait est perturbé par deux sinusoïdes déphasées de longue période, et non
par un bruit par pixel : c'est ce qui donne une ligne qui ondule comme un geste
au lieu d'une ligne qui grelotte. Chaque trait est repassé deux fois, comme on
repasse un feutre. Le `random.seed(7)` rend le résultat reproductible.

```sh
python3 tools-bonhomme-baton.py public/assets/About/about.png
```

## Les trois médias qui demandent de l'attention

**Le hero est un détourage, pas une photo pleine.** Le bâtiment est découpé sur
fond transparent et posé devant le dégradé de ciel, qui est une valeur CSS et
non une image. Fournir un JPEG rectangulaire casserait l'effet. Il faut un PNG
détouré, sujet centré, avec de la marge en haut : le wordmark géant passe
derrière lui.

**La vidéo 360 n'est jamais lue.** Elle est parcourue image par image au doigt
ou à la souris. Le nombre d'images est donc la résolution du geste : 97 images
pour un tour complet. Une vidéo plus courte rend la rotation saccadée, une
vidéo qui ne boucle pas exactement sur un tour produit un saut à la jointure.
Format carré, sujet au centre, rotation régulière, première et dernière image
contiguës.

**Le masque de la section situation est une épure, pas un plan.** La photo de
fond est révélée au curseur pour laisser apparaître ce calque, échantillonné sur
une grille de 84 × 56 cellules. Le fichier livré est un dessin filaire du bâti.
Il doit être cadré exactement comme la photo de fond, sinon le dessin ne se
superpose pas au bâtiment.

## Deux détails techniques sur la vidéo

L'atome `moov` est en fin de fichier. Le navigateur doit donc télécharger les
3,4 Mo en entier avant de pouvoir se positionner sur une image, alors que la
rotation se pilote justement en sautant d'image en image. Remettre l'index en
tête règle ça :

```sh
ffmpeg -i about-video.mp4 -c copy -movflags +faststart -an about-video-web.mp4
```

Le `-an` retire au passage la piste audio AAC, inutile pour une rotation qui
n'est jamais lue.

## Un fichier devenu inutilisé

`public/assets/Who this is for/model.glb` était le sigle 3D de la template
d'origine. Il n'est plus référencé depuis que `audience.mark.src` pointe sur le
sigle ODORO. Il est conservé plutôt que supprimé, au cas où vous voudriez
comparer, mais rien ne le charge.

## Vérifier après remplacement

```sh
npm run build && npm run dev
```

Un média manquant ne provoque pas d'erreur de build : la zone se rend vide.
Contrôler visuellement les six sections après tout remplacement.
