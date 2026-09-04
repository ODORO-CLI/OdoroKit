/**
 * La bascule entre l'apercu vivant et le code source.
 *
 * ## Pourquoi le code n'est pas la des le depart
 *
 * Le module du catalogue porte les metadonnees de toutes les entrees, et la
 * navigation laterale en depend au premier rendu. Y inliner les sources
 * multiplierait son poids par dix pour un contenu que la plupart des visites ne
 * regardent pas — on vient d'abord voir si l'effet plait.
 *
 * Le source est donc telecharge **au premier clic sur « Code »**, une fois par
 * entree et par visite. Le registre le sert deja, par la meme URL qu'un client
 * de la CLI : la page ne peut donc pas montrer un code que `odoro add`
 * n'ecrirait pas.
 *
 * ## Les deux onglets restent montes
 *
 * L'apercu n'est pas demonte quand on passe au code. Une scene qui se
 * reinitialise a chaque aller-retour perdrait sa position, ses reglages et son
 * premier rendu — et sur une scene lourde, l'aller-retour couterait une seconde
 * a chaque fois. Il est simplement cache.
 *
 * `hidden` plutot qu'un retrait du DOM : l'attribut est compris des lecteurs
 * d'ecran, qui ne lisent donc pas les deux panneaux a la suite.
 *
 * @module
 */

import { useState, type ReactElement, type ReactNode } from 'react'

import { CodeBlock } from './CodeBlock.jsx'

/** Ce qu'une entree du registre porte comme fichiers. */
interface EntreeServie {
  readonly files?: readonly { readonly path: string; readonly target: string }[]
  readonly sources?: Readonly<Record<string, string>>
}

/** Etat du telechargement des sources. */
type EtatCode =
  | { readonly phase: 'attente' }
  | { readonly phase: 'chargement' }
  | { readonly phase: 'prete'; readonly fichiers: readonly Fichier[] }
  | { readonly phase: 'echec'; readonly raison: string }

/** Un fichier a montrer. */
interface Fichier {
  /** Chemin ou la CLI l'ecrira, c'est celui qui parle a l'utilisateur. */
  readonly cible: string
  readonly code: string
}

export interface ApercuCodeProps {
  /** Identifiant complet de l'entree, `categorie/nom`. */
  readonly id: string
  /** L'apercu vivant, ou le message qui explique qu'il n'y en a pas. */
  readonly children: ReactNode
}

/** Langage devine d'apres l'extension, pour l'etiquette du bloc. */
function langageDe(cible: string): string {
  if (cible.endsWith('.tsx')) return 'tsx'
  if (cible.endsWith('.ts')) return 'ts'
  if (cible.endsWith('.css')) return 'css'
  return 'txt'
}

/** Un onglet de la bascule. */
function Onglet({
  actif,
  onClick,
  children,
}: {
  readonly actif: boolean
  readonly onClick: () => void
  readonly children: ReactNode
}): ReactElement {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={actif}
      onClick={onClick}
      className={[
        'o-rounded-md o-px-3 o-py-1 o-text-sm o-font-medium o-transition-colors',
        actif
          ? 'o-bg-white dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-100 o-shadow-sm'
          : 'o-text-zinc-500 dark:o-text-zinc-400',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * Montre l'apercu, ou le code que `odoro add` ecrirait.
 *
 * @example
 * <ApercuCode id="text/count-up">
 *   <Atelier>{(v, f) => demo.render(v, f)}</Atelier>
 * </ApercuCode>
 */
export function ApercuCode({ id, children }: ApercuCodeProps): ReactElement {
  const [vue, setVue] = useState<'apercu' | 'code'>('apercu')
  const [etat, setEtat] = useState<EtatCode>({ phase: 'attente' })

  const montrerCode = () => {
    setVue('code')

    // Une seule fois par visite : le source ne change pas sous les pieds.
    if (etat.phase !== 'attente') return

    setEtat({ phase: 'chargement' })

    void fetch(`/registre/${id}.json`)
      .then(async (reponse) => {
        if (!reponse.ok) throw new Error(`le registre a repondu ${String(reponse.status)}`)
        return (await reponse.json()) as EntreeServie
      })
      .then((entree) => {
        const sources = entree.sources ?? {}

        const fichiers = (entree.files ?? [])
          .map((f) => ({ cible: f.target, code: sources[f.path] ?? '' }))
          .filter((f) => f.code !== '')

        setEtat(
          fichiers.length === 0
            ? { phase: 'echec', raison: 'cette entree ne publie aucun source' }
            : { phase: 'prete', fichiers },
        )
      })
      .catch((cause: unknown) => {
        setEtat({
          phase: 'echec',
          raison: cause instanceof Error ? cause.message : 'telechargement impossible',
        })
      })
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Apercu ou code"
        className="o-mb-4 o-inline-flex o-gap-1 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-1"
      >
        <Onglet
          actif={vue === 'apercu'}
          onClick={() => {
            setVue('apercu')
          }}
        >
          Apercu
        </Onglet>
        <Onglet actif={vue === 'code'} onClick={montrerCode}>
          Code
        </Onglet>
      </div>

      {/* Monte en permanence : voir l'en-tete du module. */}
      <div hidden={vue !== 'apercu'}>{children}</div>

      <div hidden={vue !== 'code'}>
        {etat.phase === 'chargement' && (
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Telechargement du source…
          </p>
        )}

        {etat.phase === 'echec' && (
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Le source n a pas pu etre lu ({etat.raison}). La commande{' '}
            <code className="o-font-mono">odoro add</code> l ecrira quand meme : elle
            lit le meme registre.
          </p>
        )}

        {etat.phase === 'prete' &&
          etat.fichiers.map((fichier) => (
            <div key={fichier.cible} className="o-mb-4">
              {/* Le chemin d'arrivee, et non celui du depot : c'est celui que
                  la personne retrouvera dans son projet. */}
              <p className="o-mb-1 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                src/odoro/{fichier.cible}
              </p>
              <CodeBlock lang={langageDe(fichier.cible)} code={fichier.code} />
            </div>
          ))}
      </div>
    </div>
  )
}
