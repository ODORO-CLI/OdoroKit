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
    elaguer: true, // retire les classes utilitaires inemployées
    safelist: [], // celles à garder malgré tout
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

**Les feuilles de style** sont échangées à chaud, sans rechargement.

**Les composants React** conservent leur état. Modifier un composant remplace
son code sans démonter l'arbre : la valeur d'un compteur, le texte d'un champ,
l'onglet ouvert survivent à l'édition.

Cela demande une transformation du code, et il vaut la peine de comprendre
pourquoi. Remplacer un module ne suffit pas : React doit savoir qu'un composant
est _le même_ qu'avant. Deux informations lui manquent, que seule une
transformation peut fournir.

D'abord **l'enregistrement** de chaque composant sous une identité stable, pour
relier l'ancienne version à la nouvelle. Ensuite **une signature des hooks**
utilisés. Si cette signature change — un `useState` ajouté —, l'état ne _peut
pas_ être conservé : l'ordre des hooks ne correspond plus. React doit alors
remonter le composant. Sans signature, il tenterait de réutiliser l'ancien état
et l'application planterait sur « Rendered more hooks than during the previous
render ».

C'est la raison pour laquelle le moteur s'appuie ici sur la transformation de
référence plutôt que d'écrire la sienne : calculer ces signatures demande une
analyse syntaxique complète, et une erreur subtile ne se manifeste qu'en
plantage à l'édition. La transformation ne s'applique qu'au code du projet, et
seuls les modules ayant réellement enregistré un composant deviennent des
frontières.

**Ce qui recharge encore la page** : un module qui n'exporte pas que des
composants. C'est correct — rien ne permettrait de propager son changement sans
risque. Le moteur le détecte à l'exécution : si la liste des exports a changé,
ou si un export non-composant a été modifié, il renonce au remplacement et
recharge.

L'API reste disponible pour prendre la main :

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

La détection de l'acceptation manuelle est textuelle. Une analyse syntaxique
complète serait plus sûre, mais `import.meta.hot.accept` est une formule trop
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

## Génération et élagage de la feuille de style

`@odoro-cli/libs` livre une feuille pré-générée qui contient **toutes** les
classes utilitaires possibles — plusieurs milliers. Une application donnée en
emploie une fraction. Mesure faite sur un vrai tableau de bord :

|              | brut      | compressé   |
| ------------ | --------- | ----------- |
| sans élagage | 1,65 Mo   | 121 Ko      |
| avec élagage | **65 Ko** | **12,6 Ko** |

Actif par défaut. `build.elaguer: false` le désactive.

### Deux chemins

**Générer**, quand le projet fournit un générateur — c’est le cas dès que
`@odoro-cli/libs` est installé : le moteur résout `@odoro-cli/libs/generateur`
dans les dépendances **du projet**, et produit exactement les règles employées.

**Élaguer**, sinon : partir de la feuille livrée et en retirer ce que rien
n’atteint. Le moteur ne dépend pas de la bibliothèque — un projet qui ne
l’emploie pas compile comme avant.

Dans les deux cas, **le CSS de votre application traverse intact**. Le paquet
produit contient la feuille de la bibliothèque _et_ vos styles ; les remplacer
en bloc les effacerait. Seuls les utilitaires préfixés sont touchés.

La génération a un avantage que l’élagage ne peut pas avoir : elle sert
n’importe quelle teinte de la palette, y compris celles qu’aucune feuille
pré-générée ne porte. Un projet qui nomme `o-text-violet-500` l’obtient ; un
projet qui ne la nomme pas ne la paie pas.

### Il lit le code produit, pas la source

C'est la décision qui porte le mécanisme, et celle qu'il est facile de rater.

Une classe utilitaire ne vient pas seulement de votre code. Les composants de
la bibliothèque — `Button`, `Input`, `Alert` — portent les leurs, et ces
classes vivent dans leur JavaScript **déjà compilé**. Une application peut
n'écrire aucune classe utilitaire et en dépendre de plusieurs centaines par ses
composants : c'est exactement le cas d'une interface écrite en CSS sémantique.

Lire votre source seule retirerait donc tout ce dont vos composants ont besoin,
et l'interface arriverait sans style — **sans qu'aucune erreur ne soit levée**,
puisque du CSS absent ne casse rien, il ne peint rien.

L'élagage a donc lieu **après le regroupement**, sur ce qui part réellement :
les scripts produits et le document.

### Ce qui n'est jamais retiré

Une règle dont le sélecteur ne mentionne aucune classe préfixée est gardée sans
condition : les variables de `:root`, la remise à zéro, les règles sur `body`
ou `*`, vos propres classes sémantiques, et les `@keyframes`.

La règle est volontairement prudente d'un seul côté. Garder de trop coûte des
octets ; retirer de trop casse l'affichage, et ce défaut-là ne se voit qu'à
l'œil, page par page, longtemps après.

### Les classes assemblées à l'exécution

Une classe construite par interpolation — `o-text-${couleur}` — n'existe nulle part sous sa
forme finale. Aucun analyseur ne peut la deviner, et elle disparaîtra.

C'est la limite du procédé, et elle est la même chez tous ceux qui le
pratiquent. La réponse est `safelist` :

```ts
build: {
  safelist: [/^o-text-/, 'o-animate-spin'],
}
```

Une chaîne garde une classe, une expression régulière garde tout ce qu'elle
reconnaît.

### Le coût

Environ 400 ms sur une feuille de 1,65 Mo. Le récapitulatif affiche la ligne
d'élagage et les tailles réelles, lues sur le disque — pas celles du rapport du
compilateur, qui décrit l'état d'avant.

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
