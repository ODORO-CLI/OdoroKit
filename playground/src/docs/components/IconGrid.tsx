/**
 * La grille de recherche d'un jeu d'icones.
 *
 * ## Pourquoi la liste se charge par paliers
 *
 * Le jeu le plus vaste compte pres de quatre mille icones. Les poser toutes
 * dans le document, c'est quatre mille SVG et une page qui met plusieurs
 * secondes a repondre au premier caractere tape.
 *
 * On en pose donc deux cents, puis deux cents de plus chaque fois que le bas
 * de la liste entre dans le champ — jusqu'au bout si l'on continue. Le premier
 * rendu reste immediat, et rien n'est hors d'atteinte : c'etait le defaut de
 * la borne fixe, qui annoncait quatre mille icones et n'en montrait jamais que
 * les premieres.
 *
 * ## Le nom est ce qu'on vient chercher
 *
 * Une grille d'icones sans nom est jolie et inutilisable : on reconnait le
 * dessin, on ne sait pas comment l'appeler. Chaque case porte donc son nom, et
 * un clic copie la ligne d'import complete — c'est-a-dire exactement ce qu'on
 * s'apprete a taper.
 *
 * @module
 */

import { cx } from '@odoro-cli/libs'
import { Icon, type IconData } from '@odoro-cli/icons'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'

/** Ce qu'un jeu fournit a la grille. */
export interface IconGridProps {
  /** Nom du sous-module, pour la ligne d'import. */
  readonly module: string
  /** Les icones, indexees par leur identifiant exportable. */
  readonly icons: Readonly<Record<string, IconData>>
  /** Nom en tirets de chaque identifiant, pour la recherche. */
  readonly names: Readonly<Record<string, string>>
}

/** Nombre d'icones ajoutees a chaque palier. */
const PALIER = 200

/** Grille de recherche. */
export function IconGrid({ module, icons, names }: IconGridProps): ReactElement {
  const [query, setQuery] = useState('')
  const [size, setSize] = useState(24)
  const [copied, setCopied] = useState<string | undefined>(undefined)

  // La frappe reste fluide meme quand le filtre porte sur quatre mille noms :
  // le champ se met a jour tout de suite, la grille suit quand elle peut.
  const differe = useDeferredValue(query)

  const entries = useMemo(() => Object.entries(icons), [icons])

  const trouvees = useMemo(() => {
    const terme = differe.trim().toLowerCase()
    if (terme === '') return entries
    return entries.filter(
      ([id]) => (names[id] ?? '').includes(terme) || id.toLowerCase().includes(terme),
    )
  }, [entries, names, differe])

  const [combien, setCombien] = useState(PALIER)

  // Une recherche repart du premier palier : garder le compte d'avant
  // afficherait d'un coup tout le resultat d'un filtre etroit.
  useEffect(() => {
    setCombien(PALIER)
  }, [differe])

  const affichees = trouvees.slice(0, combien)
  const reste = trouvees.length - affichees.length

  // La sentinelle : posee sous la grille, elle demande le palier suivant des
  // qu'elle entre dans le champ. L'observateur est cree a l'accrochage du
  // noeud plutot que dans un effet, faute de quoi il faudrait le reconstruire
  // a chaque changement de compte.
  const observateur = useRef<IntersectionObserver | null>(null)
  const sentinelle = useCallback((noeud: HTMLDivElement | null) => {
    observateur.current?.disconnect()
    if (noeud === null) return
    observateur.current = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) setCombien((n) => n + PALIER)
      },
      // On charge un peu avant l'arrivee, pour que le defilement ne marque pas.
      { rootMargin: '600px 0px' },
    )
    observateur.current.observe(noeud)
  }, [])

  useEffect(() => () => observateur.current?.disconnect(), [])

  const copier = (id: string): void => {
    void navigator.clipboard
      .writeText(`import { ${id} } from '@odoro-cli/icons/${module}'`)
      .then(() => {
        setCopied(id)
        window.setTimeout(() => setCopied(undefined), 1400)
      })
      .catch(() => undefined)
  }

  return (
    <div className="o-flex o-flex-col o-gap-4">
      <div className="o-flex o-flex-wrap o-items-center o-gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Chercher une icône…"
          aria-label={`Chercher dans le jeu ${module}`}
          className="o-min-w-64 o-flex-1 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-px-3 o-py-2 o-text-sm o-text-zinc-900 dark:o-text-zinc-100 focus:o-ring"
        />

        <label className="o-flex o-items-center o-gap-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Taille
          <input
            type="range"
            min={16}
            max={48}
            step={4}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="o-w-32 o-accent-brand-600"
          />
          <span className="o-w-10 o-font-mono o-text-xs o-tabular-nums">{size}px</span>
        </label>
      </div>

      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        {trouvees.length === entries.length
          ? `${String(entries.length)} icônes`
          : `${String(trouvees.length)} sur ${String(entries.length)}`}
        {reste > 0 ? ` — ${String(affichees.length)} posées, ${String(reste)} suivent au défilement` : ''}
      </p>

      {affichees.length === 0 ? (
        <p className="o-py-12 o-text-center o-text-zinc-500 dark:o-text-zinc-400">
          Aucune icône ne porte ce nom dans ce jeu. Les autres jeux emploient souvent d
          autres mots pour la même idée.
        </p>
      ) : (
        <ul className="o-grid o-grid-cols-3 sm:o-grid-cols-4 md:o-grid-cols-6 lg:o-grid-cols-8 o-gap-2 o-list-none o-p-0">
          {affichees.map(([id, icon]) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => copier(id)}
                title={`Copier l import de ${id}`}
                className={cx(
                  'o-flex o-w-full o-cursor-pointer o-flex-col o-items-center o-gap-2 o-rounded-lg o-border-w-1 o-p-3 o-transition-colors focus:o-ring',
                  copied === id
                    ? 'o-border-brand-400 dark:o-border-brand-600 o-bg-brand-50 dark:o-bg-brand-950'
                    : 'o-border-zinc-200 dark:o-border-zinc-800 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-900',
                )}
              >
                <Icon
                  icon={icon}
                  size={size}
                  className="o-text-zinc-800 dark:o-text-zinc-100"
                />
                <span className="o-w-full o-truncate o-text-center o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                  {copied === id ? 'copie' : (names[id] ?? id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* La sentinelle, et ce qu'elle annonce a qui n'a pas la vue. */}
      {reste > 0 && (
        <div ref={sentinelle} className="o-py-8 o-text-center">
          <p role="status" className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Chargement des suivantes…
          </p>
          {/* Sans souris ni molette, le bouton fait le meme travail. */}
          <button
            type="button"
            onClick={() => setCombien((n) => n + PALIER)}
            className="o-mt-3 o-inline-flex o-cursor-pointer o-items-center o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2 o-text-sm focus:o-ring"
          >
            Afficher {Math.min(PALIER, reste)} icônes de plus
          </button>
        </div>
      )}
    </div>
  )
}
