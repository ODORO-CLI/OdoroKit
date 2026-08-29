# Interface

```ts
import {
  Button,
  Dialog,
  Input,
  Tabs,
  ToastProvider,
  useToast,
  buttonClasses,
  inputClasses,
} from '@odoro-cli/libs/ui'
```

Tous les composants s'appuient **uniquement** sur la couche sémantique du
système de style. Ils fonctionnent donc avec `@odoro-cli/libs/styles.css` seule, et
se rethèment intégralement en surchargeant les variables `--o-color-*`, sans
toucher à leur code.

## `Button`

```tsx
<Button tone="danger" size="sm" loading={pending} onClick={supprimer}>
  Supprimer
</Button>

<Button tone="secondary" startSlot={<IconePlus />} block>
  Ajouter
</Button>
```

| Propriété | Valeurs                                 | Défaut    |
| --------- | --------------------------------------- | --------- |
| `tone`    | `primary` `secondary` `ghost` `danger`  | `primary` |
| `size`    | `sm` `md` `lg`                          | `md`      |
| `block`   | booléen                                 | `false`   |
| `loading` | booléen                                 | `false`   |
| `press`   | booléen — brève pression à l'activation | `true`    |

Deux décisions valent d'être connues.

Le libellé **reste visible** pendant le chargement. Le remplacer par un
indicateur ferait sauter la mise en page et priverait les lecteurs d'écran du
contexte de l'action en cours.

L'activation est bloquée par `aria-disabled`, pas par `disabled`. Un bouton
`disabled` sort de l'ordre de tabulation : il devient invisible au clavier et
aux lecteurs d'écran, au moment précis où l'utilisateur cherche à savoir
pourquoi rien ne se passe.

`buttonClasses` expose la table de variantes pour habiller un `<a>` ou un
`<Link>` à l'identique :

```tsx
<Link to="/docs" className={buttonClasses({ tone: 'secondary' })}>
  Documentation
</Link>
```

## `Input`

```tsx
<Input
  label="Adresse e-mail"
  type="email"
  hint="Nous ne la partagerons jamais."
  error={erreurs.email}
/>
```

Le libellé est **obligatoire** : un champ sans libellé est inutilisable au
clavier et au lecteur d'écran. `hideLabel` le masque visuellement sans le
retirer de l'arbre d'accessibilité.

Le libellé, l'aide et l'erreur sont reliés au champ par `id` et
`aria-describedby` — rien à câbler côté appelant. La présence d'`error` met le
champ en état invalide, remplace l'aide dans la description annoncée, et
affiche le message avec `role="alert"` pour qu'il soit annoncé dès son
apparition.

## `Dialog`

```tsx
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Supprimer le projet"
  description="Cette action est irréversible."
  footer={
    <>
      <Button tone="secondary" onClick={() => setOpen(false)}>
        Annuler
      </Button>
      <Button tone="danger" onClick={supprimer}>
        Supprimer
      </Button>
    </>
  }
>
  <p>Les données associées seront perdues.</p>
</Dialog>
```

Le composant est bâti sur l'élément `<dialog>` natif ouvert en mode modal. Le
navigateur fournit alors le piégeage du focus, la fermeture par Échap,
l'inertie du reste de la page et la couche supérieure — quatre comportements
qu'une réimplémentation en JavaScript rate presque toujours dans un cas limite.

La seule chose que le natif ne sait pas faire est de retarder la fermeture le
temps d'une animation de sortie : c'est `usePresence` qui s'en charge.

La touche Échap est interceptée et repasse par l'état applicatif : sans cela,
la boîte se fermerait sans animation et sans que l'application le sache.

## `Tabs`

```tsx
<Tabs
  label="Sections du projet"
  items={[
    { id: 'apercu', label: 'Aperçu', content: <Apercu /> },
    { id: 'reglages', label: 'Réglages', content: <Reglages /> },
    { id: 'archive', label: 'Archive', content: <Archive />, disabled: true },
  ]}
/>
```

La navigation clavier suit le motif ARIA : flèches pour changer d'onglet,
`Home` et `End` pour les extrémités, un seul onglet dans l'ordre de tabulation.
Les onglets désactivés sont sautés.

L'indicateur est animé par transformation, à partir de la position mesurée —
jamais par une transition sur `left` et `width`, qui déclencherait un recalcul
de mise en page à chaque image.

Le composant fonctionne en mode contrôlé (`value` + `onValueChange`) comme non
contrôlé (`defaultValue`).

## `Toast`

```tsx
<ToastProvider max={4} duration={5000}>
  <App />
</ToastProvider>
```

```tsx
const { toast, dismiss, clear, toasts } = useToast()

toast({
  title: 'Projet enregistré',
  description: 'Toutes les modifications ont été sauvegardées.',
  tone: 'success',
})

toast({ title: 'Connexion perdue', tone: 'danger', duration: 0 }) // persiste
```

La région porte `aria-live="polite"` : une notification est annoncée sans
interrompre la lecture en cours. Les notifications en registre `danger` passent
en `role="alert"`, qui interrompt — c'est le seul cas où cela se justifie.

La file est plafonnée : un empilement sans limite finit par masquer
l'interface. Au-delà du maximum, la plus ancienne est retirée.

Une notification n'est retirée de la file qu'**après** son animation de sortie.
