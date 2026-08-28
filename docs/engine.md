# Moteur

```bash
odoro create [nom]   # crée un projet
odoro dev            # serveur de développement
odoro build          # compilation de production
odoro preview        # sert le résultat de la compilation
```

## Configuration

`odoro.config.ts` est compilé à la volée puis importé : il peut donc être écrit
en TypeScript et utiliser toute la puissance du langage, sans étape préalable.

```ts
import { defineConfig } from 'odoro'

export default defineConfig({
  root: '.', // racine du projet
  base: '/', // préfixe des URL publiques
  publicDir: 'public', // copié tel quel, relatif à la racine
  alias: { '@': 'src' },
  define: { __VERSION__: '"1.0.0"' },
  envPrefix: 'ODORO_',
  server: {
    port: 5180,
    host: 'localhost',
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: {
    outDir: 'dist', // relatif à la racine
    minify: true,
    sourcemap: true,
    target: 'es2022',
  },
})
```

`publicDir` et `outDir` sont relatifs à la **racine du projet**, pas au dossier
depuis lequel la commande est lancée : un projet dont le client vit dans un
sous-dossier reste configurable d'une seule ligne.

## Développement

Aucune compilation préalable. Le navigateur demande les modules un à un, en
modules natifs, et chacun est compilé à la demande puis mis en cache. Le temps
de démarrage ne dépend pas de la taille du projet, seulement de la profondeur
du premier écran.

**Réécriture des imports.** Le navigateur ne sait lire ni TypeScript, ni JSX,
ni les spécificateurs nus. Chaque import est donc réécrit — non pas à coups
d'expressions régulières, qu'une chaîne de caractères contenant le mot `import`
suffirait à mettre en défaut, mais en s'appuyant sur le résolveur du
compilateur lui-même : chaque import est résolu puis marqué externe, de sorte
que rien n'est intégré mais que tous les chemins ressortent réécrits.

**Pré-compilation des dépendances.** Beaucoup de paquets ne sont distribués
qu'en CommonJS, que le navigateur ne sait pas charger ; et une dépendance
éclatée en centaines de fichiers déclencherait autant de requêtes.

Le piège est ailleurs : si `react` et `react-dom/client` étaient compilés
séparément, chacun embarquerait sa copie de React. Deux instances de React dans
une même page cassent les hooks et les contextes, avec des symptômes
déroutants. Tous les spécificateurs sont donc **compilés en une seule passe**,
avec découpage : le code commun se retrouve dans un fragment partagé, et
l'instance reste unique.

Le résultat est mis en cache dans `node_modules/.odoro/deps`, invalidé quand la
liste des dépendances ou le fichier de verrouillage change.

## Rechargement à chaud

Le canal serveur → client est un flux d'événements natif. Il suffit : le
rechargement à chaud est un flux à sens unique, et un flux natif s'affranchit
d'une bibliothèque de sockets, se reconnecte tout seul et traverse les proxys
sans configuration.

**Ce qui est en place** : graphe de modules avec relations inverses, invalidation
qui remonte la chaîne des importateurs jusqu'à une frontière qui accepte, API
`import.meta.hot` complète, surcouche d'erreur de compilation.

**Ce qui fonctionne sans rechargement** : les feuilles de style. Une feuille
modifiée est remplacée à chaud, l'état de l'application est intégralement
conservé. C'est le gain le plus immédiat du développement à chaud.

**Ce qui recharge la page** : un module JavaScript modifié, sauf s'il déclare
`import.meta.hot.accept()`.

```ts
if (import.meta.hot) {
  import.meta.hot.accept((module) => {
    // Remplacer ce que le module exporte.
  })
  import.meta.hot.dispose(() => {
    // Nettoyer avant le remplacement.
  })
}
```

**Ce qui n'est pas là** : la préservation de l'état des composants React. Elle
exige une transformation dédiée, qui injecte une signature à chaque composant à
la compilation. C'est un chantier à part entière ; il se branchera sur l'API de
rechargement déjà en place, sans la changer.

La détection de l'acceptation est textuelle. Une analyse syntaxique complète
serait plus sûre, mais `import.meta.hot.accept` est une formule trop
distinctive pour apparaître par accident, et le coût d'un faux positif se
limite à une mise à jour là où un rechargement aurait suffi.

## Variables d'environnement

Les variables portant le préfixe configuré sont exposées au client.

```ts
import.meta.env.MODE // 'development' | 'production'
import.meta.env.DEV // booléen
import.meta.env.PROD // booléen
import.meta.env.BASE_URL // préfixe des URL publiques
import.meta.env.ODORO_API_URL
```

Un projet déclare les types en une ligne :

```ts
/// <reference types="odoro/client" />
```

## Compilation

Le document HTML est le point de départ : ses balises `<script type="module">`
désignent les entrées, et il est réécrit à la fin pour pointer vers les
fichiers empreintés.

Les empreintes rendent les fichiers immuables : ils peuvent être mis en cache
indéfiniment, et un déploiement n'invalide que ce qui a réellement changé. Le
serveur de prévisualisation applique d'ailleurs `immutable` sur `assets/` et
`no-cache` sur le reste, comme le ferait un hébergeur correctement configuré.

## API programmatique

Le même moteur est utilisable depuis un script — ce qui sert notamment aux
tests d'intégration.

```ts
import { buildProject, loadConfig, startDevServer } from 'odoro'

const config = await loadConfig(process.cwd())
const server = await startDevServer(config)
console.log(server.url)
await server.close()

const output = await buildProject(config)
console.log(output.files)
```

## Ce que le moteur délègue

La transformation TypeScript/JSX et l'assemblage de production reposent sur un
compilateur bas niveau, traité comme une primitive — au même titre que le
navigateur ou Node.

Ce n'est pas un raccourci : c'est la même architecture que celle des outils de
référence, qui n'écrivent pas davantage leur propre analyseur syntaxique.
Écrire un parseur JavaScript complet, un minifieur et un secoueur d'arbre
représente plusieurs années-hommes. Le prétendre produirait un jouet qui
casserait au premier projet réel.

Ce qui est réellement maison — serveur, graphe, protocole de rechargement,
plugins, pipeline CSS, configuration, ligne de commande, échafaudage — est
exactement le périmètre où la valeur se trouve, et où le contrôle compte.
