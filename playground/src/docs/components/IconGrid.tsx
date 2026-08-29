/**
 * La grille de recherche d'un jeu d'icones.
 *
 * ## Pourquoi la liste est bornee
 *
 * Le jeu le plus vaste compte pres de quatre mille icones. Les poser toutes
 * dans le document, c'est quatre mille SVG et une page qui met plusieurs
 * secondes a repondre au premier caractere tape — alors que personne ne
 * parcourt quatre mille icones a l'oeil.
 *
 * On en affiche donc un nombre fixe, et on annonce combien il y en a en tout.
 * C'est plus honnete qu'un defilement virtuel : celui-ci donne l'illusion
 * qu'on peut tout voir, alors que la recherche est le seul moyen praticable
 * d'arriver a une icone precise.
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
import { useDeferredValue, useMemo, useState, type ReactElement } from 'react'

/** Ce qu'un jeu fournit a la grille. */
export interface IconGridProps {
  /** Nom du sous-module, pour la ligne d'import. */
  readonly module: string
  /** Les icones, indexees par leur identifiant exportable. */
  readonly icons: Readonly<Record<string, IconData>>
  /** Nom en tirets de chaque identifiant, pour la recherche. */
  readonly names: Readonly<Record<string, string>>
}

/** Nombre d'icones affichees a la fois. */
const AFFICHEES = 240

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

  const affichees = trouvees.slice(0, AFFICHEES)

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
          placeholder="Chercher une icone…"
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
          ? `${String(entries.length)} icones`
          : `${String(trouvees.length)} sur ${String(entries.length)}`}
        {trouvees.length > AFFICHEES
          ? ` — les ${String(AFFICHEES)} premieres sont affichees, affinez la recherche`
          : ''}
      </p>

      {affichees.length === 0 ? (
        <p className="o-py-12 o-text-center o-text-zinc-500 dark:o-text-zinc-400">
          Aucune icone ne porte ce nom dans ce jeu. Les autres jeux emploient souvent d
          autres mots pour la meme idee.
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
    </div>
  )
}
