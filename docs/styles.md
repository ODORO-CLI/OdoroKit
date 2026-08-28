# Styles

```ts
import { cx, variants, tokens, colorLight, palette } from 'odoro-libs'
import 'odoro-libs/styles.css'
```

## Deux feuilles, jamais les deux

| Feuille                      | Contenu                                                             | Poids                 |
| ---------------------------- | ------------------------------------------------------------------- | --------------------- |
| `odoro-libs/styles.css`      | Variables, préflight, utilitaires structurels, couleurs sémantiques | 315 Ko — 20 Ko brotli |
| `odoro-libs/styles.full.css` | La même, plus les utilitaires de couleur sur les 290 nuances        | 757 Ko — 35 Ko brotli |

La feuille complète est un sur-ensemble de la feuille de base : on importe
l'une **ou** l'autre.

Ce découpage a une raison précise. Le système refuse toute analyse du code
applicatif : la feuille est un fichier statique, produit une fois, sans étape à
l'exécution. Le prix de ce choix est une taille fixe, indépendante de l'usage.
Imposer les 290 nuances de la palette à tout projet ferait payer à chacun ce
dont seuls quelques-uns ont besoin.

## Les tokens

`packages/odoro-libs/src/styles/tokens.ts` est la source de vérité unique.
Rien d'autre dans la librairie ne contient de valeur brute.

```ts
tokens.color.primary // couleur sémantique  → --o-color-primary
tokens.palette['sky-500'] // couleur brute       → --o-palette-sky-500
tokens.space[4] // espacement          → --o-space-4
tokens.text.lg // taille de texte     → --o-text-lg
tokens.duration.slow // durée               → --o-duration-slow
```

La fondation compte 288 couleurs en OKLCH, 18 tailles de texte, 9 graisses, 8
rayons, 17 ombres, 7 flous, 13 largeurs de conteneur, 5 perspectives et une
échelle d'espacement en 35 pas. S'y ajoutent une teinte de marque sur 11
nuances et une **couche sémantique** de 41 rôles, déclinée en clair et en
sombre.

Après toute modification des tokens :

```bash
pnpm --filter odoro-libs build:css
```

Deux tests comparent les fichiers générés au résultat du générateur : oublier
cette commande fait échouer la suite.

## Utilitaires

Toutes les classes sont préfixées `o-`. Les variantes précèdent le préfixe,
comme dans les conventions habituelles :

```html
<div class="o-flex o-gap-4 md:o-grid md:o-grid-cols-3 hover:o-bg-surface-hover"></div>
```

| Variante          | S'applique à                                      |
| ----------------- | ------------------------------------------------- |
| `md:` `lg:`       | Mise en page, espacement, dimensions, typographie |
| `hover:` `focus:` | Couleurs, ombres, bordures, opacité               |
| `active:`         | Couleurs sémantiques                              |
| `dark:`           | Couleurs                                          |

Les variantes sont déclarées **par famille**, pas appliquées à tout : générer
chaque variante pour chaque utilitaire multiplierait la feuille par cinq sans
bénéfice.

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

Retheming complet, composants de la librairie compris, en surchargeant les
seules variables sémantiques :

```css
:root {
  --o-color-primary: oklch(52.4% 0.212 275);
  --o-color-primary-hover: oklch(44.6% 0.19 275);
  --o-color-ring: var(--o-color-primary);
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
      neutre: 'o-bg-surface o-border-border',
      alerte: 'o-bg-danger-soft o-border-danger-border',
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
