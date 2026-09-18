# Orfèvre

Marque de bijoux. Blanc sur blanc, deux films scrubés au défilement, une main
détourée en WebGL. Une seule encre — le noir, baissé à l'alpha — porte toute la
hiérarchie.

## Démarrer

```sh
npm install
npm run dev
```

## Ce que ce portage a changé, et ce qu'il n'a pas changé

Le design n'a pas bougé : les deux premiers étages de `src/styles.css` — les
primitives et les rôles — sont ceux de l'original, mot pour mot, et le balisage
est le même à la chaîne de classes près.

| Avant | Après |
| --- | --- |
| Next 16, App Router | `index.html` + `src/main.tsx`, servis par le moteur Odoro |
| `next/font` | `@font-face` dans `src/styles.css`, polices dans `src/fonts/` |
| Utilitaires Tailwind | Utilitaires `o-` du système, plus les classes du projet |
| `@theme inline` | Des règles CSS ordinaires, troisième étage de la feuille |

La table de correspondance est dans `scripts/lib/orfevre-classes.mjs`, à la
racine du dépôt. Après le passage, `scripts/check-template-classes.mjs` relit
**toutes** les chaînes du gabarit et signale tout nom que la feuille connaîtrait
sous `o-` et qui serait resté sans préfixe — une classe absente ne casse rien,
elle ne peint rien.

## Trois choses à savoir avant d'y toucher

**Les sélecteurs de la feuille répètent leur classe.** `.bg-ground.bg-ground`
n'est pas une coquille : les utilitaires du système sont écrits après cette
feuille dans le paquet final, et à spécificité égale c'est le dernier qui gagne.

**Les déplacements passent par `translate`, pas par `transform`.** Plusieurs de
ces éléments sont déjà déplacés au défilement par un `transform` posé en ligne,
qui écraserait le calage. Les deux propriétés sont indépendantes.

**La police de titrage ne s'appliquait pas dans l'original.** `@theme inline`
liait `--font-display` à une variable posée sur `body` en l'écrivant sur
`:root`, où elle n'existe pas — toute la page tombait sur la pile système,
alors que le commentaire de `.display` dit le contraire. Elle est rétablie ici ;
la note en tête du troisième étage dit quoi changer pour revenir en arrière.

**Deux corrections mesurées après coup.** La remise à zéro du gabarit d'origine
apportait des règles que la nôtre n'a pas — un lien sans couleur ni
soulignement, un bouton sans rembourrage, `border-color: currentColor`,
`vertical-align: middle` sur une image. Elles manquaient : 42 propriétés
différaient sur quinze balises. Elles sont rétablies dans la section
« compatibilité » de `src/styles.css`.

Et les huit règles que le gabarit se donne — `.display`, `.label`, `.glass`,
`.panel`, `.sr-only`, `.reveal-word` — répètent maintenant leur nom trois fois.
Chez l'autre moteur le CSS de l'auteur n'est pas en couche et bat les
utilitaires quelle que soit la spécificité ; ici c'est la spécificité qui doit
le dire.

Vérification : à 390, 768 et 1440 px, les 372 nœuds du `main` ont exactement la
même boîte que l'original, et les deux socles concordent sur quinze balises et
vingt propriétés. La comparaison se fait avec la même police des deux côtés,
pour que la mesure porte sur la mise en page et non sur les métriques de la
fonte.

## Le verre est fragile

Le commentaire de `.glass` le dit déjà, et il faut le lire avant d'animer quoi
que ce soit : `opacity` ou `filter` sur **n'importe quel** ancêtre établit une
racine de fond, le flou échantillonne alors un fond vide, coûte tout le travail
du processeur graphique et ne rend rien.

## Les polices

Voir `src/fonts/LICENCES.md` : Libre Caslon Display et Inter, toutes deux sous
SIL Open Font License.

## Licence

Unlicense — domaine public, comme le dépôt d'origine.
