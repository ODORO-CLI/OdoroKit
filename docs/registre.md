# Le registre

Les composants animés d'Odoro ne sont pas installés depuis npm. Ils sont
**copiés dans le projet**, fichier par fichier, et deviennent du code que
l'équipe possède : elle le lit, le modifie, le supprime.

Ce choix a un coût — pas de mise à jour automatique — et une contrepartie qui
le justifie : un composant d'animation est presque toujours retouché. Un
dégradé change, une durée ne convient pas, un easing doit suivre la charte.
Livré en dépendance, chacune de ces retouches passerait par une propriété
supplémentaire, jusqu'à ce que le composant ait trente propriétés et que
personne ne sache plus laquelle fait quoi. Livré en source, la retouche est une
ligne modifiée.

Le registre est donc le catalogue de ce qui peut être copié, et le format
ci-dessous en est le contrat.

## L'arborescence

```
packages/odoro-bits/registry/
  <catégorie>/
    <nom>/
      meta.json
      <fichiers sources>
```

Le dossier **est** l'identifiant : `hooks/use-poster` se trouve dans
`registry/hooks/use-poster/`. Le `meta.json` répète le nom et la catégorie, et
la validation refuse tout écart entre les deux — un composant déclaré sous un
nom différent de son dossier serait introuvable à l'adresse où tout le monde le
cherche.

Les catégories sont closes : `text`, `background`, `effect`, `hero`, `ui`,
`section`, `hooks`.

## `meta.json`

```json
{
  "name": "use-poster",
  "category": "hooks",
  "title": "Repli visuel",
  "description": "Maintient un repli affiché jusqu'à ce que la scène soit prête.",
  "engine": { "gsap": [], "gl": false },
  "files": [{ "path": "hook.ts", "target": "hooks/usePoster.ts" }],
  "dependencies": [],
  "registryDependencies": [],
  "tokens": ["--o-duration-slow"],
  "props": [{ "name": "fade", "type": "number", "default": 320, "unit": "ms" }],
  "perf": { "tier": "light", "backend": false }
}
```

| Champ                  | Rôle                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `name`                 | Minuscules et tirets. Unique dans sa catégorie.                         |
| `category`             | Une des sept catégories.                                                |
| `title`, `description` | Ce qu'affiche `odoro list` et le site.                                  |
| `engine.gsap`          | Plugins d'orchestration requis. `core` est toujours présent.            |
| `engine.gl`            | `false`, `"ogl"` ou `"three"`.                                          |
| `files[].path`         | Chemin dans le dossier du composant.                                    |
| `files[].target`       | Destination dans le projet, relative à l'alias de composants.           |
| `dependencies`         | Paquets npm que la CLI proposera d'installer.                           |
| `registryDependencies` | Autres entrées, sous la forme `catégorie/nom`.                          |
| `tokens`               | Variables CSS consommées. Toutes commencent par `--o-`.                 |
| `props`                | Table des propriétés, telle qu'elle sera documentée.                    |
| `perf.tier`            | `light`, `medium` ou `heavy`.                                           |
| `perf.backend`         | Doit correspondre à `engine.gl`.                                        |
| `perf.fallback`        | `poster`, `gradient`, `static` ou `none`. Obligatoire si `tier: heavy`. |

Les durées exposées en propriété sont **toujours en millisecondes**. C'est une
règle du registre, pas une convention locale : une entrée en secondes et sa
voisine en millisecondes produisent une erreur qu'on ne voit qu'à l'exécution.

## Ce que la validation refuse

`pnpm --filter odoro-bits registry:validate` échoue dans six cas.

**Un `meta.json` mal formé.** Le message cite le chemin du champ fautif —
`hero/molten → perf.tier : …` — plutôt que de dire « invalide » et laisser
chercher.

**Un fichier déclaré qui n'existe pas.** Le schéma ne connaît pas le disque ;
cette vérification-là est faite à la lecture.

**Une dépendance de registre qui pointe dans le vide.** Elle serait découverte
par le premier utilisateur qui installe le composant, sur sa machine, au
moment le moins opportun.

**Un cycle dans le graphe.** L'erreur donne le chemin complet du cycle : une
erreur qui dit seulement « cycle détecté » oblige à le chercher à la main dans
tout le registre.

**Une destination absolue ou remontante.** La CLI écrit chez l'utilisateur ;
un `target` en `/etc/…` ou en `../..` y serait une porte ouverte. Deux fichiers
visant la même destination sont refusés pour une raison voisine : le second
effacerait le premier sans que rien ne le signale.

**Une incohérence de coût.** Trois règles se croisent ici, et elles ont toutes
la même origine — la CLI et l'arbitre de surfaces se fient à ces champs pour
décider :

- un composant `heavy` doit déclarer un repli, affiché pendant le chargement,
  sans WebGL et en mouvement réduit ;
- `perf.backend` doit être le même que `engine.gl` ;
- une scène `three` est nécessairement `heavy`.

Tous les problèmes sont rassemblés avant d'échouer. Sur un registre de quarante
entrées, après un changement de format, s'arrêter au premier imposerait
quarante allers-retours.

## Les artefacts servis

`pnpm --filter odoro-bits registry:build` compile le registre en JSON statiques :

```
dist/registry/
  index.json
  <catégorie>/<nom>.json
```

Chaque fichier d'entrée contient son `meta.json` validé **plus le code source
inline**. L'alternative — servir les fichiers séparément et les désigner par
URL — multiplierait les allers-retours et rendrait possible qu'une entrée
arrive à moitié : le méta à jour, les sources encore anciennes. Une entrée est
une unité ; elle est servie comme telle.

L'`index.json` ne porte que de quoi choisir : identifiant, titre, description,
niveau de coût, backend, dépendances de registre. Il est demandé par
`odoro list` et par la recherche du site ; y inliner le code ferait grossir une
réponse consultée souvent avec un contenu dont elle n'a pas l'usage.

Le dossier de sortie est effacé avant d'être réécrit. Sans cela, une entrée
retirée du dépôt resterait servie indéfiniment.

## Le même schéma aux deux bouts

Le schéma vit dans `odoro/registry`, côté client, et non dans le paquet du
registre. Ce n'est pas arbitraire : le registre valide ce qu'il produit avant
de le publier, mais le client valide ce qu'il **reçoit** — d'un serveur qu'il
ne contrôle pas, juste avant d'écrire des fichiers dans le projet de
quelqu'un. C'est là que la validation compte le plus.

Un registre tiers qui réutiliserait ce schéma subit donc les mêmes règles, y
compris celles qui croisent plusieurs champs.

## Installer un composant

Le registre se consomme avec quatre commandes et un fichier.

```bash
odoro init                     # écrit odoro.json
odoro list                     # le catalogue
odoro add molten               # copie le composant et ses dépendances
odoro diff                     # ce qui a bougé depuis
odoro doctor                   # ce qui ne va pas
```

`--registry <url|dossier>` remplace ponctuellement la source, et `--yes`
supprime toute question. Un dossier local n'est pas un mode dégradé : c'est
comme cela qu'on développe le registre, et comme cela qu'un studio garde ses
composants pour lui.

### `odoro.json`

```json
{
  "version": 1,
  "registry": "https://registre.odoro.dev",
  "aliases": { "import": "@/odoro", "directory": "src/odoro" },
  "installed": {
    "hooks/use-poster": {
      "installedAt": "2026-08-29T00:59:11.402Z",
      "files": [{ "path": "src/odoro/hooks/usePoster.ts", "hash": "3f1a…" }]
    }
  }
}
```

`odoro init` lit le `tsconfig.json` du projet pour en déduire le préfixe
d'import — `@/*` vers `src/*` donne `@/odoro`. Les commentaires et les virgules
finales que TypeScript autorise y sont gérés ; `JSON.parse` seul les refuse.
Quand aucun alias n'est déclaré, la commande le dit et retombe sur un chemin
nu.

### Pourquoi les empreintes

Chaque fichier livré est noté avec l'empreinte de **ce qui a été écrit**. Sans
ce troisième point de référence, comparer le fichier local à celui du registre
ne dirait rien d'utile : on ne saurait pas si l'écart vient d'une retouche
locale ou d'une évolution amont. Ce sont pourtant deux situations opposées — la
première se garde, la seconde se récupère.

Avec l'empreinte, `odoro diff` tranche :

```
hooks/use-pointer-damped src/odoro/hooks/usePointerDamped.ts
  une mise a jour existe
  - const { host, speed = 3, name = 'pointeur' } = options
  + const { host, speed = 5, name = 'pointeur-amorti' } = options

hooks/use-poster src/odoro/hooks/usePoster.ts
  retouche localement
```

Le quatrième cas — retouché **et** modifié en amont — est le seul qui demande
un arbitrage humain, et c'est exactement celui qu'une comparaison à deux termes
aurait noyé dans les autres.

### Le jeton `@registre`

Un composant qui importe son voisin ne peut pas écrire le chemin en dur : la
destination dépend du projet d'accueil. Les sources du registre écrivent donc
`@registre/hooks/usePoster`, et la CLI substitue le préfixe à l'écriture. Le
jeton ne résout nulle part, ce qui est voulu : un composant qui l'aurait gardé
par accident échoue à la compilation au lieu d'aller chercher sur npm.

Tout le reste est laissé intact. `odoro-engine`, `react`, `gsap`, `three` sont
de vrais paquets : ils s'installent, ils ne se copient pas.

### L'écriture est transactionnelle

Une installation écrit plusieurs fichiers. Si la troisième écriture échoue,
une approche naïve laisse un projet à moitié servi — et l'utilisateur ne sait
pas ce qui a été touché.

Les fichiers sont donc d'abord écrits **à côté** de leur destination, sous un
nom temporaire ; rien d'observable n'a changé à ce stade. Ils ne sont mis en
place qu'ensuite. Un échec avant la mise en place laisse le projet exactement
dans l'état où on l'a trouvé.

La mise en place elle-même n'est pas atomique entre plusieurs fichiers — le
système n'offre rien de tel. Les contenus précédents sont gardés et remis en
place, ce qui reste une réparation. Le compromis est nommé plutôt que
sous-entendu : la phase risquée, celle qui remplit le disque et rencontre les
permissions, est intégralement couverte.

### Ce que la CLI dit avant d'écrire

**Le poids.** Un composant qui charge une scène 3D ajoute environ 130 Ko
compressés au premier affichage — contre 13 Ko pour le backend léger. Ces
chiffres sont mesurés sur une scène minimale compilée, pas estimés. Un backend
n'est compté qu'une fois, même réclamé par cinq composants : un avertissement
qu'on apprend à ignorer ne sert plus à rien.

**Les dépendances implicites.** Ce qui arrive sans avoir été demandé est
annoncé avant, pas découvert après coup dans le suivi de version.

**Les remplacements.** Un fichier existant qui serait écrasé fait poser une
question. Hors terminal — intégration continue, sortie redirigée — la commande
refuse et indique `--yes`, plutôt que de bloquer une chaîne de compilation sur
un curseur que personne ne voit.
