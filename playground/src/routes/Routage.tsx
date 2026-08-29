import { Link, useNavigate, useParams, useSearchParams } from '@odoro-cli/libs/router'
import { Button } from '@odoro-cli/libs/ui'

/** Page demontrant les parametres de route et la chaine de requete. */
export function Routage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') ?? '1')

  return (
    <div className="o-flex o-flex-col o-gap-8">
      <h1 className="o-text-2xl o-font-bold">Routage</h1>

      <section className="o-flex o-flex-col o-gap-2">
        <h2 className="o-text-lg o-font-semibold">Parametre de route</h2>
        <p className="o-text-zinc-500 dark:o-text-zinc-400">
          Segment <code className="o-font-mono">:id</code> capture :{' '}
          <strong className="o-tabular-nums">{id}</strong>
        </p>
        <div className="o-flex o-gap-3">
          {[1, 42, 128].map((value) => (
            <Link key={value} to={`/routage/${value}`} className="o-text-sm">
              /routage/{value}
            </Link>
          ))}
        </div>
      </section>

      <section className="o-flex o-flex-col o-gap-2">
        <h2 className="o-text-lg o-font-semibold">Chaine de requete</h2>
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums">Page {page}</p>
        <div className="o-flex o-gap-2">
          <Button
            size="sm"
            tone="secondary"
            onClick={() => setParams({ page: String(Math.max(1, page - 1)) })}
          >
            Precedente
          </Button>
          <Button size="sm" onClick={() => setParams({ page: String(page + 1) })}>
            Suivante
          </Button>
        </div>
      </section>

      <section className="o-flex o-flex-col o-gap-2">
        <h2 className="o-text-lg o-font-semibold">Navigation programmatique</h2>
        <div className="o-flex o-gap-2">
          <Button size="sm" tone="secondary" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button size="sm" tone="secondary" onClick={() => navigate('/')}>
            Accueil
          </Button>
          <Button size="sm" tone="ghost" onClick={() => navigate('/route/inexistante')}>
            Route inconnue
          </Button>
        </div>
      </section>
    </div>
  )
}
