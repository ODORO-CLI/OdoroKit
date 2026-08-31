# Odoro — application monopage

Projet genere par `odoro create`. Le routeur, le moteur d'animation, le systeme
de style et les composants d'interface viennent tous de `@odoro-cli/libs` ; le
serveur de developpement et la compilation viennent du moteur `odoro`.

## Structure

```
index.html          Document et point d'entree : la balise <script type="module">
                    designe le fichier a compiler.
odoro.config.ts     Configuration du moteur : alias, port, proxy, build.
public/             Fichiers copies tels quels a la racine du site.
src/
  main.tsx          Montage de React et imports de feuilles de style.
  App.tsx           Declaration des routes et enveloppe commune.
  routes/           Une page par route.
  styles.css        Styles propres au projet et surcharges de tokens.
  odoro-env.d.ts    Types ambiants (import.meta.env, imports de ressources).
```

## Scripts

| Commande    | Effet                                               |
| ----------- | --------------------------------------------------- |
| `dev`       | Serveur de developpement avec rechargement a chaud. |
| `build`     | Compilation de production dans `dist/`.             |
| `preview`   | Sert `dist/` comme le ferait un hebergeur statique. |
| `typecheck` | Verification des types, sans emission.              |

## Personnalisation

Toutes les valeurs visuelles passent par des variables CSS. Surcharger
`--o-palette-brand-600` dans `src/styles.css` retheme l'application **et** les
composants de la librairie, sans toucher a leur code.

Une seule feuille de style : `@odoro-cli/libs/styles.css`, a importer une fois
a la racine de l'application.

Elle ne contient que le socle — variables, preflight, animations. Les
utilitaires sont produits a la compilation, pour les seules classes que votre
code emploie : quelques dizaines de kilooctets en pratique, et toute la palette
disponible sans que rien ne pese.

## Rechargement a chaud

Modifier un composant remplace son code sans demonter l'arbre : la valeur d'un
compteur, le texte saisi dans un champ, l'onglet ouvert survivent a l'edition.
Une feuille de style est echangee sans rechargement.

Un module qui n'exporte pas que des composants recharge la page, et c'est
correct : rien ne permettrait d'en propager le changement sans risque.
