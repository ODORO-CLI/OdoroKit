# Odoro — application monopage

Projet genere par `odoro create`. Le routeur, le moteur d'animation, le systeme
de style et les composants d'interface viennent tous de `odoro-libs` ; le
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
`--o-color-primary` dans `src/styles.css` retheme l'application **et** les
composants de la librairie, sans toucher a leur code.

Deux feuilles de style sont disponibles :

- `odoro-libs/styles.css` — structure et couleurs semantiques ;
- `odoro-libs/styles.full.css` — la meme, plus les utilitaires de couleur sur
  la palette complete.

Importer l'une **ou** l'autre, jamais les deux.

## Rechargement a chaud

Une feuille de style modifiee est remplacee sans rechargement : l'etat de
l'application est conserve. Un module JavaScript modifie recharge la page,
sauf s'il declare `import.meta.hot.accept()`.
