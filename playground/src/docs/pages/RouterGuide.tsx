/**
 * Guide du routeur.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Guide du module router. */
export function RouterGuide(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/router"
        title="Le routeur"
        lead="Un routeur client complet : routes imbriquees, parametres, routes paresseuses, defilement restaure et transitions de page natives. Ce site entier est rendu avec."
      />

      <Section
        title="Declarer des routes"
        lead="Les routes se declarent en JSX et s'imbriquent ; Outlet rend la route enfant active dans son parent."
      >
        <CodeBlock
          lang="tsx"
          code={`import { Router, Routes, Route, Outlet, Link } from '@odoro/libs/router'

function Layout() {
  return (
    <div>
      <nav className="o-flex o-gap-3">
        <Link to="/">Accueil</Link>
        <Link to="/projets">Projets</Link>
      </nav>
      <Outlet />
    </div>
  )
}

<Router>
  <Routes fallback={<p>Chargement...</p>}>
    <Route path="/" element={<Layout />}>
      <Route index element={<Accueil />} />
      <Route path="projets" element={<Projets />} />
      <Route path="projets/:id" element={<Projet />} />
      <Route path="*" element={<Introuvable />} />
    </Route>
  </Routes>
</Router>`}
        />
      </Section>

      <Section
        title="Lire l'etat de navigation"
        lead="Quatre hooks couvrent les besoins courants : l'emplacement, les parametres de route, la navigation programmatique et les parametres de requete."
      >
        <CodeBlock
          lang="tsx"
          code={`import { useLocation, useParams, useNavigate, useSearchParams } from '@odoro/libs/router'

function Projet() {
  const { id } = useParams()                 // '/projets/:id' -> { id: '42' }
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  return (
    <button onClick={() => navigate('/projets')}>
      Retour ({params.get('tri') ?? 'recent'})
    </button>
  )
}`}
        />
      </Section>

      <Section
        title="Routes paresseuses"
        lead="Une route peut charger son module a la demande : le fallback de Routes s'affiche pendant le chargement."
      >
        <CodeBlock
          lang="tsx"
          code={`<Route path="statistiques" lazy={() => import('./routes/Statistiques.jsx')} />`}
        />
      </Section>

      <Section
        title="Transitions de page"
        lead="Chaque navigation est enveloppee dans une View Transition native quand le navigateur la supporte. La feuille odoro fournit le fondu par defaut ; nommez une zone pour lui donner du mouvement."
      >
        <CodeBlock
          lang="tsx"
          code={`// La zone nommee glisse pendant la transition ; le reste — en-tete,
// navigation — se contente d'un fondu. Un seul element par page.
<main className="o-view-transition-page">
  <Outlet />
</main>`}
        />
        <Callout>
          Sous <code className="o-font-mono o-text-sm">prefers-reduced-motion</code>, les
          transitions sont neutralisees par la feuille de style — rien a faire cote
          application.
        </Callout>
      </Section>
    </article>
  )
}
