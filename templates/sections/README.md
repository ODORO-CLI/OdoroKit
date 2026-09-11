<div align="center">

<img src="sections/assets/odoro/odoro-lockup.svg" alt="Odoro" width="260">

# Sections GetLayers

Les 21 Sections du catalogue GetLayers, en HTML autonome, aux couleurs ODORO.

</div>

---

## ⚠️ À lire avant de publier ce dépôt

**Ces fichiers ne sont pas de la production maison.** Ce sont des sources livrées par le catalogue
GetLayers, récupérées telles quelles. Les publier dans un dépôt **public** revient à redistribuer
l'œuvre d'un tiers, et les conditions de la licence GetLayers n'ont pas été vérifiées ici.

Vérifiez ce que votre licence GetLayers autorise avant de passer ce dépôt en public. En cas de
doute, **gardez-le privé** : c'est le réglage par défaut recommandé plus bas, et il n'enlève rien
au confort de travail.

Aucun fichier de licence n'a été ajouté, précisément parce que le droit sur ce contenu n'est pas
le nôtre à déclarer.

---

## Ce que contient le dépôt

Chaque Section est un document HTML complet et indépendant. Vous l'ouvrez dans un navigateur, il
fonctionne. Aucun build, aucune dépendance à installer.

```
index.html              redirection vers l'index réel, pour GitHub Pages
getlayers.json          état du pull : identifiants, rôles, anomalies, marque
sections/
  index.html            l'index cliquable, rangé par rôle
  README.md             la documentation de fond
  odoro-badge.py        pose et retire le logo sur les 22 fichiers
  <21 fichiers>.html    les Sections
  assets/odoro/         la marque et le lockup en SVG
  assets/<8 dossiers>/  emplacements des images de contenu, avec la liste attendue
```

La répartition par rôle : dix loaders, cinq carrousels, deux sections à cartes, un hero, une
section features, une roadmap, un showcase.

👉 **La documentation détaillée est dans [`sections/README.md`](sections/README.md)** : contrat des
trois couches, méthode de re-skin, tableau des 21 Sections.

## Démarrer

```bash
git clone <url-du-depot>
cd <dossier>
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000`. Un serveur est nécessaire plutôt qu'un double-clic, car
plusieurs Sections chargent des modules JavaScript, que le protocole `file://` refuse.

## Publier avec GitHub Pages

Le dépôt est prêt : `index.html` à la racine redirige vers l'index, et `.nojekyll` empêche
GitHub de passer le site dans Jekyll.

Dans **Settings → Pages**, choisissez la branche `main` et le dossier `/ (root)`.

Deux réserves. Pages ne sert que des dépôts **publics**, sauf offre payante — donc l'avertissement
de licence en haut s'applique pleinement. Et les Sections Mirror Hall chargent Three.js depuis
unpkg, ce qui suppose que le visiteur ait accès à ce CDN.

## Le logo ODORO

Les 22 fichiers portent le logo en badge fixe, coin haut-gauche, en `#F57423`. Il est posé par un
script plutôt qu'à la main :

```bash
python3 sections/odoro-badge.py            # pose ou met à jour le badge partout
python3 sections/odoro-badge.py --remove   # le retire partout
```

Le script est idempotent : le relancer remplace le bloc existant au lieu d'en empiler un second.

**Le logo est une reconstruction.** Il a été redessiné à partir de deux images, aucun fichier
source n'ayant été fourni. La marque est géométriquement exacte, c'est un cercle dont le quart
supérieur gauche est remplacé par un angle droit. Le mot, lui, est du texte vivant dans une pile
de grotesques géométriques : proche, mais pas votre police. L'orange est relevé à l'œil, pas sur
une valeur de charte. Pour passer au logo officiel, remplacez le tracé dans le script et relancez.

## Deux limites connues

**Les images de contenu manquent.** Huit Sections référencent des photos en chemin relatif qui ne
sont livrées ni avec la source ni sur le CDN GetLayers. Les Sections tournent, mais leurs zones
média restent vides. Chaque dossier de `sections/assets/` contient la liste nominative des fichiers
attendus. Les dix loaders et `colonnade` ne sont pas concernés, ce dernier générant ses visuels
en CSS.

**Un doublon vient du catalogue.** Les identifiants `hero-mirror-hall` et `mirror-hall` devraient
désigner deux Sections différentes, un hero et un carrousel. Le catalogue renvoie le même document
au bit près pour les deux, et ce document est le carrousel. Vérifié en redemandant la source à
l'API : ce n'est pas une erreur de récupération. Le hero n'a donc pas été livré. Les deux fichiers
sont conservés tels quels, sans correction inventée.

## Le principe à garder en tête

Ces Sections ne cohèrent pas entre elles en l'état : chacune garde les couleurs et la typographie
avec lesquelles elle a été livrée. La cohérence ne vient pas d'une origine commune, elle vient
d'**un seul Style, engagé une fois et appliqué à toutes au moment de l'assemblage**. Un Style par
site, un système typographique par site. Une Section qui refuse de se laisser repeindre dans le
Style retenu est la mauvaise Section : on change la Section, pas le Style.
