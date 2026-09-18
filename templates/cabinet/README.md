# Cabinet — un cabinet d'avocats

Landing d'un cabinet d'avocats parisien fondé en 1987 : droit des affaires,
contentieux, droit pénal, droit de la famille, droit immobilier.

La page se lit en une scène défilée — trois panneaux qui se relaient sur une
seule horloge de scroll — un showreel qui s'ouvre en plein cadre, des
témoignages, et un pied de page révélé qui porte une étoile posée immense puis
réduite à sa taille de repos.

Tous les noms, chiffres et adresses sont inventés.

## Démarrer

```sh
npm install
npm run dev      # http://localhost:3400
npm run build
npm run preview
```

## Ce qui a changé au passage sur notre moteur

Le gabarit arrive d'ailleurs. Le design n'a pas bougé, et c'est mesuré : à 390,
768, 1280 et 1440 px, les 986 nœuds de la page ont exactement la même boîte que
l'original, et les deux socles concordent sur quinze balises et vingt
propriétés. Les seuls écarts sont les colonnes du préchargement, qui s'animent
— elles diffèrent aussi quand on compare l'original à lui-même.

| | |
|---|---|
| Le cadre | Il n'y en a plus. `index.html` + `src/main.tsx` + `src/App.tsx` remplacent `layout.tsx` et `page.tsx`. |
| Les routes serveur | Retirées : formulaire de contact, `sitemap`, `robots`. Pour un projet qui en a besoin, voir le socle `react-ts-server`. |
| Les classes utilitaires | Réécrites vers les nôtres (`o-*`) ou, quand notre générateur ne les produit pas, vers des règles `cb-*` dérivées du bloc de jetons de `src/styles.css`. Aucune valeur n'a changé. |
| Les images | Le composant image de l'autre cadre cède la place à `<img>`. Sa propriété `fill` posait un style en ligne — position absolue, inset nul, cent pour cent — rendu ici en classes. |
| Les polices | Liées dans la feuille au lieu du `layout`. Cormorant et Inter Tight, toutes deux sous SIL OFL 1.1, servies par le fournisseur. |
| L'origine publique | Elle était lue dans l'environnement ; elle est posée en clair dans `src/lib/site.ts`, seule ligne à changer au déploiement. |

### Trois points de cascade

**`font-sans` n'est pas le nôtre.** Le gabarit écrit `--font-sans:
var(--font-inter-tight)` dans un bloc `@theme inline`. Avec `inline`, l'autre
moteur substitue la valeur dans ses **utilitaires** et n'émet pas la variable :
`var(--font-sans)` dans le `body` ne résout rien — le corps de la page est en
pile système, des deux côtés — mais la classe `font-sans`, elle, vit et vaut
l'Inter Tight. Elle est donc rendue au gabarit sous `cb-font-sans`.

**`max-md:max-w-none` doit passer après.** Nos règles dérivées répètent leur
classe et pèsent deux fois plus qu'un utilitaire. Là où l'original comptait sur
l'ordre entre deux utilitaires de même poids, la dérivée gagnait partout. La
variante est donc dérivée elle aussi, pour qu'elles se valent de nouveau.

**Le masque de bord** `mask-b-from-45%` n'existe pas chez nous. Sa règle est
écrite à la main en fin de `src/styles.css`, avec la déclaration de l'autre
moteur.

## Vérifier

```sh
npx tsc --noEmit && npm run build
node ../../scripts/check-template-classes.mjs templates/cabinet
```

Le second vérifie trois choses à la fois : qu'aucune classe connue de notre
système n'est restée sans préfixe, qu'aucune classe propre au gabarit n'a été
préfixée à tort, et qu'aucun jeton du gabarit ne porte le nom d'un des nôtres
en désignant autre chose.

## Où est quoi

| | |
|---|---|
| Contenu (tous les textes, FR) | `src/data/mocks/home.ts` |
| Jetons de couleur et de typo | `src/styles.css` (le premier étage est le seul à porter des littéraux) |
| La scène et son horloge | `src/views/home/scene/`, `src/utils/timeline/` |
| Assets servis | `public/assets/` |
| Décisions, journal, conventions | `obsidian/` |
| État de la session GetLayers | `getlayers.json` |

## La pile

Le moteur Odoro · React 19 · TypeScript · `@react-spring/web` ·
`spring-text-engine` · Lenis. Les crédits des références sont dans le
`CREDITS.md` de la racine du dépôt.

## Licence

Voir `LICENSE.md`.
