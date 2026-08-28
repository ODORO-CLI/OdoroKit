# Routeur

```ts
import {
  Router,
  Routes,
  Route,
  Link,
  Outlet,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'odoro-libs/router'
```

## Mise en place

`<Router>` possède l'historique et publie l'emplacement courant. `<Routes>`
confronte le chemin à l'arbre déclaré et rend la chaîne correspondante.

```tsx
import { Link, Outlet, Route, Router, Routes } from 'odoro-libs/router'

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/blog">Blog</Link>
      </nav>
      <Outlet />
    </>
  )
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog/:slug?" element={<Post />} />
          <Route path="docs/*" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}
```

## Syntaxe des chemins

| Écriture       | Signification                 | Paramètre exposé       |
| -------------- | ----------------------------- | ---------------------- |
| `/users`       | Segment statique              | —                      |
| `/users/:id`   | Segment dynamique obligatoire | `id`                   |
| `/blog/:slug?` | Segment dynamique facultatif  | `slug`, ou `undefined` |
| `/docs/*`      | Tout le reste du chemin       | `*`                    |

Les chemins des routes filles sont **relatifs** à leur parent. Un `/` initial
est toléré et ignoré : il n'y a pas de chemin absolu dans un arbre imbriqué.

## Résolution

Quand plusieurs branches correspondent, le classement est déterministe :
segment statique, puis dynamique, puis facultatif, puis catch-all, comparés
position par position et de gauche à droite.

```tsx
<Route path="users/me" element={<Me />} />   {/* l'emporte sur */}
<Route path="users/:id" element={<User />} />  {/* qui l'emporte sur */}
<Route path="users/*" element={<Any />} />
```

Une règle mérite d'être connue : **un motif qui s'arrête est plus spécifique
qu'un motif qui continue** en facultatif ou en catch-all. Pour le chemin
`/blog`, `path="blog"` l'emporte sur `path="blog/:slug?"`. À spécificité
strictement égale, l'ordre de déclaration tranche.

Chaque motif n'est compilé en expression régulière **qu'une seule fois** puis
mis en cache. Le rendu n'exécute que des expressions déjà construites.

## Hooks

```tsx
const { id } = useParams()
// string | undefined — un segment facultatif absent vaut undefined,
// et le type le rappelle à l'appel.

const location = useLocation()
// { pathname, search, hash, state, key }

const navigate = useNavigate()
navigate('/users/42')
navigate('/login', { replace: true })
navigate(-1)

const [params, setParams] = useSearchParams()
const page = params.get('page') ?? '1'
setParams({ page: '2' })

const matches = useMatches()
// La chaîne racine → feuille, pour construire un fil d'Ariane.
```

## Chargement paresseux

Préférez la propriété `lazy` à un `React.lazy` construit à la main : le
routeur peut alors **précharger** le module avant de déclencher une transition
de page.

```tsx
<Routes fallback={<Spinner />}>
  <Route path="/rapports" lazy={() => import('./Rapports')} />
</Routes>
```

Le module est également préchargé au survol d'un `<Link>` qui y mène. Ce
comportement se désactive avec `prefetch={false}`.

## Transitions de page

Les transitions passent par l'API View Transitions du navigateur, avec
dégradation silencieuse quand elle est absente ou que l'utilisateur a demandé
des animations réduites.

Le point délicat mérite d'être expliqué, car il piège toutes les intégrations
naïves. `document.startViewTransition(cb)` fige un instantané du DOM, exécute
`cb`, puis anime dès que le rappel a rendu la main. Or React commite de façon
asynchrone : une mise à jour d'état lancée dans le rappel résoudrait la
transition sur un DOM inchangé — aucune animation, ou un flash. Pire, une route
paresseuse suspendrait, et c'est le contenu de repli qui serait capturé.

La séquence appliquée est donc : précharger les modules de la cible, démarrer
la transition, commiter de façon **synchrone** à l'intérieur du rappel.

```tsx
<Router viewTransition={false}>       {/* désactivé globalement */}
<Link to="/a" viewTransition />       {/* réactivé pour ce lien */}
navigate('/b', { viewTransition: false })
```

Les animations elles-mêmes se décrivent en CSS :

```css
::view-transition-old(root) {
  animation: 120ms ease-out both fade-out;
}
::view-transition-new(root) {
  animation: 200ms ease-in both fade-in;
}
```

## Défilement

Le routeur désactive la restauration automatique du navigateur et s'en charge
lui-même : le navigateur ne sait pas restaurer une position dans du contenu
rendu en JavaScript, qui n'existe pas encore au moment où il essaie.

- Retour arrière → position mémorisée pour cette entrée.
- URL avec ancre → défilement vers l'élément correspondant.
- Sinon → haut de page.

```tsx
;<Link to="/liste?page=2" preventScrollReset />
navigate('/liste?page=2', { preventScrollReset: true })
```

## Rendu serveur et tests

`createMemoryHistory` fournit un historique sans DOM.

```tsx
import { createMemoryHistory, Router } from 'odoro-libs/router'

render(
  <Router history={createMemoryHistory(['/users/42'])}>
    <App />
  </Router>,
)
```

## Page 404

Une route `path="*"` déclarée explicitement l'emporte. Sans elle, `<Routes>`
rend une page minimale, remplaçable par la propriété `notFound`.

```tsx
<Routes notFound={<MaPage404 />}>...</Routes>
```
