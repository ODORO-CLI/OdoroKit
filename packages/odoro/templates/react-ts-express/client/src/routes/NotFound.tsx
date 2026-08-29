import { Link } from 'odoro-libs/router'

/** Page affichee pour toute route inconnue. */
export function NotFound() {
  return (
    <div className="o-flex o-flex-col o-gap-4" role="alert">
      <h1 className="o-text-3xl o-font-bold">404</h1>
      <p className="o-text-zinc-500 dark:o-text-zinc-400">Cette page n existe pas.</p>
      <p>
        <Link to="/">Retour a l accueil</Link>
      </p>
    </div>
  )
}
