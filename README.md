# Odoro

Outillage front maison : un moteur de développement, un échafaudeur et une
librairie de composants. Un point de départ unique et maîtrisé pour créer des
sites, sans dépendre de Tailwind, React Router, Motion ni Vite.

```bash
npm create odoro@latest      # créer un projet
npm install odoro-libs       # la librairie, embarquée par défaut
```

## Ce que contient le dépôt

| Paquet                                  | Rôle                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| [`odoro-libs`](packages/odoro-libs)     | Routeur, moteur d'animation, système de style et composants d'interface.      |
| [`odoro`](packages/odoro)               | Moteur de développement et de compilation, plus l'échafaudage `odoro create`. |
| [`create-odoro`](packages/create-odoro) | Point d'entrée de `npm create odoro@latest`. Délègue entièrement au moteur.   |
| [`playground`](playground)              | Application de test liée à la librairie, pour la développer à chaud.          |

## Démarrer

```bash
pnpm install
pnpm build          # compile odoro-libs et odoro
pnpm --filter odoro-playground dev
```

Le bac à sable démarre sur `http://localhost:5190` et consomme la librairie en
lien de workspace : une modification de `packages/odoro-libs` y est visible
sans réinstallation.

## Commandes de la racine

| Commande         | Effet                                                   |
| ---------------- | ------------------------------------------------------- |
| `pnpm build`     | Compile tous les paquets publiables.                    |
| `pnpm dev`       | Lance les paquets en mode surveillé.                    |
| `pnpm test`      | Suites unitaires de tous les paquets.                   |
| `pnpm typecheck` | Vérification des types, sans émission.                  |
| `pnpm lint`      | ESLint sur l'ensemble du dépôt.                         |
| `pnpm format`    | Prettier en écriture.                                   |
| `pnpm changeset` | Décrit une modification en vue de la prochaine version. |

## Le moteur

`odoro dev` sert les modules un par un, en modules natifs, compilés à la
demande. Le temps de démarrage ne dépend pas de la taille du projet.
`odoro build` produit un bundle découpé, minifié et empreinté.

```bash
odoro create mon-site --template react-ts
odoro dev
odoro build
odoro preview
```

**Ce que le moteur fait lui-même** : serveur de développement, graphe de
modules, protocole de rechargement à chaud (client et serveur), conteneur de
transformation, pré-compilation des dépendances, pipeline CSS, configuration,
ligne de commande, échafaudage.

**Ce qu'il délègue** : la transformation TypeScript/JSX et l'assemblage de
production reposent sur un compilateur bas niveau, traité comme une primitive
— au même titre que le navigateur ou Node. Écrire un analyseur syntaxique, un
minifieur et un secoueur d'arbre représente plusieurs années-hommes ; le
prétendre produirait un jouet.

**Le rechargement à chaud préserve l'état.** Modifier un composant remplace son
code sans démonter l'arbre : la valeur d'un compteur, le texte saisi dans un
champ, l'onglet ouvert — tout survit. Une feuille de style est échangée sans
rechargement. Un module qui n'exporte pas que des composants recharge la page,
et c'est correct : rien ne permettrait d'en propager le changement sans risque.

## La librairie

```ts
import { cx, tokens } from 'odoro-libs'
import { Router, Routes, Route, Link, Outlet } from 'odoro-libs/router'
import { Reveal, Stagger, useAnimate, usePresence } from 'odoro-libs/motion'
import { Button, Dialog, Input, Tabs, ToastProvider } from 'odoro-libs/ui'
import 'odoro-libs/styles.css'
```

Une documentation par sous-module, avec des exemples exécutables :

- [Routeur](docs/router.md) — chemins, imbrication, transitions de page.
- [Mouvement](docs/motion.md) — révélations, présence, animations pilotées.
- [Styles](docs/styles.md) — tokens, utilitaires, thèmes.
- [Interface](docs/ui.md) — les cinq composants et leurs contrats.
- [Moteur](docs/engine.md) — configuration, rechargement à chaud, compilation.
- [Registre](docs/registre.md) — format des composants copiés, validation,
  artefacts servis.

## Décisions structurantes

**Pas de moteur JIT pour les styles.** Les tokens sont la source de vérité ; un
script en dérive une feuille statique. Aucune analyse du code applicatif,
aucune étape à l'exécution. Le prix est un fichier de taille fixe : 20 Ko
compressés pour la feuille de base, 35 Ko pour celle qui expose les 290 nuances
de la palette. On importe l'une **ou** l'autre.

**Pas de moteur d'interpolation en JavaScript.** Les animations sont confiées
au moteur du navigateur, qui les exécute sur son fil de composition. Aucune
boucle d'animation n'est ouverte côté JavaScript.

**`prefers-reduced-motion` n'est jamais optionnel.** Tous les composants le
consultent. L'animation est neutralisée, jamais l'état final : un contenu
révélé reste visible, un élément sortant est bien démonté.

**ESM uniquement.** Node 20 ou plus, navigateurs modernes. Aucune compatibilité
CommonJS, assumée et vérifiée à chaque compilation.

## Licence

Propriétaire — voir [LICENSE](LICENSE). Les références ayant servi de base au
système visuel sont créditées dans [CREDITS.md](CREDITS.md).
