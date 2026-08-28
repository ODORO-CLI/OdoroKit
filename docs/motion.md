# Mouvement

```ts
import {
  Animate,
  Reveal,
  Stagger,
  useAnimate,
  usePresence,
  usePrefersReducedMotion,
} from 'odoro-libs/motion'
```

## Le principe

L'interpolation est confiée au moteur d'animation du navigateur, qui l'exécute
sur son fil de composition. Aucune boucle d'animation n'est ouverte en
JavaScript : une animation en cours ne ralentit pas quand le fil principal est
occupé, et ne consomme rien quand l'onglet est masqué.

Ce module est une couche mince au-dessus de cette capacité native : typage,
tokens, et les quelques comportements que le natif ne fournit pas — la
révélation au défilement et l'animation de sortie avant démontage.

## Animations réduites

`prefers-reduced-motion` est consulté par **tous** les composants et hooks du
module. Le développeur n'a jamais à y penser.

La règle appliquée mérite d'être explicite : l'animation est neutralisée,
**jamais l'état final**. Un contenu révélé reste visible ; un élément sortant
est bien démonté. Une révélation qui se contenterait de ne pas jouer laisserait
un contenu invisible — c'est le défaut d'accessibilité le plus courant des
bibliothèques d'animation.

```tsx
const reduced = usePrefersReducedMotion()
```

## `useAnimate`

Contrôle impératif d'un élément.

```tsx
function Carte() {
  const [ref, controls] = useAnimate<HTMLDivElement>()

  return (
    <div
      ref={ref}
      onClick={() =>
        void controls.play(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.06)' },
            { transform: 'scale(1)' },
          ],
          { duration: 'fast', easing: 'emphasized' },
        )
      }
    />
  )
}
```

`controls` expose `play`, `cancel`, `finish`, `pause`, `resume` et
`animation`. La promesse rendue par `play` se résout à la fin **et** en cas
d'annulation : un appelant n'a jamais de rejet à gérer.

Les durées acceptent un nom de token ou un nombre de millisecondes ; les
courbes, un nom de token ou une valeur CSS.

| Durées                                                               | Courbes                                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `instant` `fastest` `faster` `fast` `base` `slow` `slower` `slowest` | `linear` `in` `out` `in-out` `standard` `entrance` `exit` `emphasized` |

## `<Reveal>`

Révèle un élément à son entrée dans le viewport.

```tsx
<Reveal duration="slow" delay={100}>
  <h2>Titre révélé au défilement</h2>
</Reveal>

<Reveal
  as="section"
  from={{ opacity: 0, transform: 'scale(0.94)' }}
  once={false}
  threshold={0.3}
>
  <Graphique />
</Reveal>
```

Le rendu serveur — et le rendu sans JavaScript — produit l'**état final**.
L'état de départ n'est posé qu'en couche de mise en page, juste avant la
première peinture. Un contenu ne peut donc jamais rester invisible parce qu'un
script a échoué.

Une fois l'animation terminée, le style en ligne est retiré et l'animation
relâchée : rien ne reste accroché à retenir une couche de composition.

## `<Stagger>`

Révèle une liste, chaque enfant avec un retard croissant.

```tsx
<Stagger step={80} className="o-grid o-grid-cols-3 o-gap-4">
  {articles.map((article) => (
    <Carte key={article.id} {...article} />
  ))}
</Stagger>
```

Chaque enfant est observé individuellement : dans une longue liste, seuls ceux
qui entrent réellement à l'écran s'animent. Le retard cumulé est plafonné par
`maxDelay` (600 ms par défaut) — sans quoi une liste de cent éléments finirait
de s'afficher six secondes après le premier.

## `usePresence`

React démonte un élément dès que la condition de rendu devient fausse : il n'y
a plus rien à animer. Ce hook interpose un état de sortie.

```tsx
function Panneau({ open }: { open: boolean }) {
  const { ref, isMounted, status } = usePresence<HTMLDivElement>(open)

  if (!isMounted) return null

  return (
    <div ref={ref} data-status={status}>
      Contenu
    </div>
  )
}
```

`status` vaut `entering`, `entered`, `exiting` ou `exited`. Par défaut, un
élément présent au premier rendu n'est pas animé ; `initial: true` change cela.

C'est ce hook qui permet à `<Dialog>` et à `<Toast>` de disparaître
proprement.

## `<Animate>`

L'équivalent déclaratif de `useAnimate`, quand aucun contrôle impératif n'est
nécessaire.

```tsx
<Animate from={{ opacity: 0, transform: 'translateY(8px)' }} trigger={page}>
  <Article />
</Animate>
```

L'animation est jouée au montage, puis à chaque changement de `trigger`.

## Pourquoi pas de ressorts physiques

Cette version n'implémente que des courbes de Bézier, issues des tokens.

Un ressort ne s'exprime pas comme une courbe de Bézier : c'est la solution d'un
oscillateur amorti, dont la forme dépend de la raideur, de l'amortissement et
de la vitesse initiale. Deux voies existent pour l'obtenir — échantillonner la
solution en une centaine d'étapes que l'on passe au moteur natif, ou revenir à
une boucle d'animation en JavaScript. La seconde annulerait tout le bénéfice de
l'approche.

L'échantillonnage reste ouvert et se brancherait derrière un
`easing: 'spring(...)'` sans changer l'API publique. Il n'a pas été fait ici
parce que rien dans les besoins actuels ne le justifie.
