# Styles

```ts
import { cx, variants, tokens, colorLight, palette } from '@odoro-cli/libs'
import '@odoro-cli/libs/styles.css'
```

## Une seule feuille

| Feuille                      | Contenu                                                                  | Poids                     |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------- |
| `@odoro-cli/libs/styles.css` | Variables, préflight, utilitaires structurels, sept teintes essentielles | 1 724 Ko — 119 Ko gzip    |

Ce poids est celui du fichier livré, **pas celui que vos visiteurs
téléchargent** : l'élagage à la construction n'en garde que ce que votre
application emploie. Sur un vrai tableau de bord, 65 Ko bruts et 12,6 Ko une
fois compressés. Voir [Élagage de la feuille de style](engine.md).

### La feuille complète a été retirée du paquet

`@odoro-cli/libs/styles.full.css` ajoutait les utilitaires de couleur sur les
palettes supplémentaires — `orange`, `yellow`, `teal`, `indigo`, `violet`,
`olive`… soit 2 640 classes de plus.

Elle pesait 2,8 Mo, soit **182 Ko compressés — un tiers du poids du paquet** —
et aucune application ne l'importait. Tout le monde la téléchargait à chaque
installation ; personne ne s'en servait.

C'est un retrait, pas une optimisation gratuite : si vous nommez une teinte
absente de la feuille de base, la classe n'existe plus nulle part. Le type
`OdoroClassName` a été rétréci en conséquence — il n'autocomplète plus que ce
qui existe réellement, ce qui vaut mieux qu'un éditeur donnant sa caution à une
classe qui ne peint rien.

Elle reviendra d'elle-même quand le CSS sera produit à la demande plutôt que
pré-généré : chaque projet obtiendra alors exactement les teintes qu'il nomme,
sans que personne ne paie pour les autres.

### Les sept teintes de la feuille de base

`zinc`, `brand`, `red`, `amber`, `emerald`, `sky`, `fuchsia` — une échelle
neutre, la marque, et les quatre intentions qu'une interface exprime sans y
penser. Cela vaut pour `o-text-*`, `o-bg-*`, `o-border-*` et **aussi pour les
jalons de dégradé** `o-from-*`, `o-via-*`, `o-to-*`.

Ce dernier cas mérite un avertissement, parce qu'il échoue en silence. Les
classes de **direction** (`o-bg-gradient-to-r`, `o-bg-gradient-radial`) sont
présentes ; les jalons d'une teinte absente ne le sont pas. Un
`o-bg-gradient-to-r o-from-sky-500 o-to-violet-500` produit donc un dégradé
**syntaxiquement valide et entièrement transparent** : la direction s'applique,
la couleur de fin manque, et rien ne le signale — ni erreur de console, ni
classe absente.

La parade est de nommer des rôles sémantiques :

```html
<div
  class="o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400"
></div>
```

La feuille contient 135 jalons de dégradé, tous sémantiques.

## Les tokens

`packages/odoro-libs/src/styles/tokens.ts` est la source de vérité unique.
Rien d'autre dans la librairie ne contient de valeur brute.

```ts
palette['brand-600'] // couleur de palette  → --o-palette-brand-600
tokens.palette['sky-500'] // couleur brute       → --o-palette-sky-500
tokens.space[4] // espacement          → --o-space-4
tokens.text.lg // taille de texte     → --o-text-lg
tokens.duration.slow // durée               → --o-duration-slow
```

La fondation compte 288 couleurs en OKLCH, 18 tailles de texte, 9 graisses, 8
rayons, 17 ombres, 7 flous, 13 largeurs de conteneur, 5 perspectives et une
échelle d'espacement en 35 pas. S'y ajoutent une teinte de marque sur 11
nuances. Il n'y a **pas** de couche sémantique : aucun `primary`, aucun
`surface`, aucun `danger`. Une couleur se désigne par sa place dans l'échelle,
et le thème s'écrit sur la classe.

Après toute modification des tokens :

```bash
pnpm --filter @odoro-cli/libs build:css
```

Deux tests comparent les fichiers générés au résultat du générateur : oublier
cette commande fait échouer la suite.

## Utilitaires

Toutes les classes sont préfixées `o-`. Les variantes précèdent le préfixe,
comme dans les conventions habituelles :

```html
<div
  class="o-flex o-gap-4 md:o-grid md:o-grid-cols-3 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800"
></div>
```

| Variante          | S'applique à                                      |
| ----------------- | ------------------------------------------------- |
| `md:` `lg:`       | Mise en page, espacement, dimensions, typographie |
| `hover:` `focus:` | Couleurs, ombres, bordures, opacité               |
| `active:`         | Couleurs                                          |
| `dark:`           | Couleurs                                          |
| `dark:hover:`     | Couleurs — le thème croisé avec un état           |
| `disabled:`       | Couleurs, opacité, curseur                        |

Les variantes sont déclarées **par famille**, pas appliquées à tout : générer
chaque variante pour chaque utilitaire multiplierait la feuille par cinq sans
bénéfice.

La composition est bornée au thème croisé avec un état. Elle existe parce
qu'elle est indispensable : sans couche sémantique, aucune variable ne bascule
toute seule, et un bouton qui s'éclaire au survol doit pouvoir s'éclairer
différemment selon le thème. Ouvrir toutes les combinaisons multiplierait la
feuille par le produit des variantes, pour couvrir des cas que personne
n'écrit.

## Thèmes

Le thème suit la préférence système, sauf choix explicite — dans les deux sens.

```html
<html data-theme="dark">
  <!-- force le sombre -->
  <html data-theme="light">
    <!-- force le clair -->
    <html>
      <!-- suit la préférence système -->
    </html>
  </html>
</html>
```

Le thème n'est plus porté par des variables : il est écrit sur chaque classe.

```html
<div class="o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50"></div>
```

Trois valeurs font exception, et elles n'ont pas d'élément à habiller : le fond
de la page, la couleur du texte courant et celle des liens. Elles sont posées
une fois pour toutes dans le préflight, en clair et en sombre.

Rethemer la marque revient donc à surcharger ses nuances de palette :

```css
:root {
  --o-palette-brand-600: oklch(52.4% 0.212 275);
  --o-palette-brand-700: oklch(44.6% 0.19 275);
  --o-palette-brand-500: var(--o-palette-brand-600);
}
```

Redimensionner tout le système d'un seul réglage :

```css
:root {
  --o-spacing: 0.2rem; /* toute l'échelle en est un multiple */
}
```

## `cx`

Composition de classes, en ignorant les valeurs vides.

```ts
cx('o-flex', condition && 'o-hidden', { 'o-p-4': padded }, ['o-gap-2'])
// 'o-flex o-p-4 o-gap-2'
```

Le type du paramètre est l'union des classes valides **plus** `string` :
l'autocomplétion propose les 8 500 classes connues sans interdire les classes
applicatives.

## `variants`

Équivalent minimal de `cva`, sans variantes composées.

```ts
const carte = variants({
  base: 'o-rounded-lg o-border-w-1 o-transition',
  variants: {
    tone: {
      neutre: 'o-bg-white dark:o-bg-zinc-900 o-border-zinc-200 dark:o-border-zinc-800',
      alerte: 'o-bg-red-50 dark:o-bg-red-950 o-border-red-200 dark:o-border-red-800',
    },
    padding: { serre: 'o-p-3', large: 'o-p-6' },
  },
  defaults: { tone: 'neutre', padding: 'large' },
})

carte() // valeurs par défaut
carte({ tone: 'alerte', className: 'o-mt-4' }) // les classes de l'appelant en dernier
```

`null` et `undefined` sont équivalents : tous deux retombent sur la valeur par
défaut.

## Ajouter une famille d'utilitaires

Le générateur est piloté par une table. Ajouter une famille se fait en ajoutant
une entrée à `FAMILIES` dans `packages/odoro-libs/scripts/generate.ts` — jamais
en écrivant du CSS à la main.

```ts
{
  title: 'Filtres',
  tier: 'core',
  variants: STATEFUL,
  rules: fromScale('blur', blur, (token, key) => ({
    [`saturate-${key}`]: `filter:saturate(${token})`,
  })),
}
```

Le générateur refuse deux règles de même nom, et refuse une clé de token
inexistante : une faute de frappe ne peut pas produire silencieusement une
variable qui n'existe pas.
