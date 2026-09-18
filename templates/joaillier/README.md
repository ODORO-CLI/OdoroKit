# Joaillier — ODORO, maison de joaillerie

Landing e-commerce pour une maison de joaillerie parisienne : or 18 carats,
argent 925, éditions numérotées à cent exemplaires. Une seule page, sans
paiement — elle vend une réservation, pas un panier.

La page en dix temps : préchargement → **hero vidéo à viseur** (le cadre s'ouvre
sur le regard et suit le curseur) → manifeste → collection en triptyque → film
d'atelier → éditions → réservation → pied de page.

Tous les noms, chiffres et adresses sont inventés.

## Démarrer

```sh
npm install
npm run dev      # http://localhost:3600
npm run build
npm run preview
```

## Ce qui a changé au passage sur notre moteur

Le gabarit arrive d'ailleurs. Le design n'a pas bougé, et c'est mesuré : à 390,
768, 1280 et 1440 px, les 450 nœuds du `main` ont **exactement** la même boîte
que l'original, et les deux socles concordent sur quinze balises et vingt
propriétés.

À 1920 px, une seule ligne — celle du prix — se répartit autrement de 0,58 px
entre ses deux moitiés, pour une largeur totale identique. C'est le `€`, que
l'Inter Tight ne couvre pas : l'autre cadre le dessinait dans une police de
repli aux métriques ajustées au centième près, que nous ne reconstruisons pas.
La hauteur, elle, est la même.

| | |
|---|---|
| Le cadre | Il n'y en a plus. `index.html` + `src/main.tsx` + `src/App.tsx` remplacent `layout.tsx` et `page.tsx`. |
| Les routes serveur | Retirées : `sitemap`, `robots`, et la route `/api/contact` que le formulaire de réservation appelle. Voir ci-dessous. |
| Les classes utilitaires | Réécrites vers les nôtres (`o-*`) ou, quand notre générateur ne les produit pas, vers des règles `jo-*` dérivées du bloc de jetons de `src/styles.css`. Aucune valeur n'a changé. |
| Les images | Le composant image de l'autre cadre cède la place à `<img>`. Sa propriété `fill` posait un style en ligne — position absolue, inset nul, cent pour cent — rendu ici en classes. |
| Les polices | Liées dans la feuille au lieu du `layout`. Cormorant et Inter Tight, toutes deux sous SIL OFL 1.1, servies par le fournisseur. |
| L'origine publique | Elle était lue dans l'environnement ; elle est posée en clair dans `src/lib/site.ts`, seule ligne à changer au déploiement. |

### Le formulaire de réservation n'a pas de serveur

`src/lib/api-client.ts` est conservé — c'est du code de navigateur — et le
formulaire poste toujours sur `/api/contact`. Mais **ce gabarit ne fournit pas
cette route** : elle vivait dans l'autre cadre. Tant qu'une origine ne répond
pas, le formulaire affiche son état d'erreur.

Le socle `react-ts-server` de la ligne de commande pose un client et un serveur
côte à côte, et c'est là que cette route doit renaître.

### Trois points de cascade

**La police de page.** Le socle d'origine la posait sur `html` à partir de
`--font-sans`, que le bloc de jetons lie à `--typeface-ui`. Le nôtre lit sa
propre variable, et la page retombait sur la pile système — quinze balises
mesurées. La liaison du gabarit est reprise telle quelle dans la règle `body`.

**La liste de repli est celle d'Arial**, et non la pile du système. L'autre
cadre construisait une police de repli aux métriques ajustées sur Arial ; c'est
elle qui dessine le `€` et l'espace fine, que l'Inter Tight ne couvre pas. Avec
la pile du système, ces deux signes mesuraient 1,2 px de moins et la ligne du
prix se répartissait autrement.

**Trente-six variantes sont dérivées alors que notre système les connaît.** Nos
règles dérivées répètent leur classe et pèsent deux fois plus qu'un utilitaire ;
là où l'original comptait sur l'ordre entre deux utilitaires de même poids, la
dérivée gagnait partout — la plaque du hero gardait son `left` de bureau sur un
téléphone, à 1338 px du bord. Les dériver toutes les deux leur rend le même
poids, et l'ordre tranche comme avant.

## Vérifier

```sh
npx tsc --noEmit && npm run build
node ../../scripts/check-template-classes.mjs templates/joaillier
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
| La géométrie du hero | `src/views/home/hero/hero.geometry.ts` — les listes de classes y sont nommées, et chacune est expliquée |
| Assets servis | `public/assets/` |
| Décisions, journal, conventions | `obsidian/` |
| État de la session GetLayers | `getlayers.json` |

## La pile

Le moteur Odoro · React 19 · TypeScript · `@react-spring/web` ·
`spring-text-engine` · Lenis. Les crédits des références sont dans le
`CREDITS.md` de la racine du dépôt.

## Licence

Voir `LICENSE.md`.
