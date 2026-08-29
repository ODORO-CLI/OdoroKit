/**
 * Le catalogue : tout ce que le registre publie, sur une page.
 *
 * ## Il lit l'artefact, pas une liste ecrite a la main
 *
 * Une liste maintenue a cote du registre derive au premier ajout, et personne
 * ne s'en apercoit : rien ne casse, une entree devient simplement
 * introuvable. Cette page interroge donc `index.json` — le meme fichier que
 * `odoro list` telecharge, par la meme URL.
 *
 * Elle ne peut donc afficher que ce qui est reellement publie, et elle affiche
 * tout ce qui l'est.
 *
 * @module
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { Link } from 'odoro-libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Une entree telle que l'index la decrit. */
interface Entry {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly title: string
  readonly description: string
  readonly tier: 'light' | 'medium' | 'heavy'
  readonly backend: false | 'ogl' | 'three'
  readonly registryDependencies: readonly string[]
}

/** Ou chaque categorie est demontree. */
const DEMOS: Readonly<Record<string, string>> = {
  text: '/docs/text',
  background: '/docs/backgrounds',
  hero: '/docs/backgrounds',
  effect: '/docs/motion/librairie',
  image: '/docs/images',
  section: '/docs/sections',
  hooks: '/docs/registre/galerie',
}

/** Intitules des categories, dans l'ordre d'affichage. */
const ORDER: readonly (readonly [string, string])[] = [
  ['text', 'Texte'],
  ['background', 'Fonds'],
  ['hero', 'Heros'],
  ['effect', 'Effets'],
  ['image', 'Images'],
  ['section', 'Sections'],
  ['hooks', 'Hooks'],
]

/** Etiquette de cout, coloree selon ce qu'elle vaut. */
function Cost({ tier, backend }: { tier: Entry['tier']; backend: Entry['backend'] }) {
  const tone =
    tier === 'heavy'
      ? 'o-bg-red-50 dark:o-bg-red-950 o-text-red-600 dark:o-text-red-400 o-border-red-200 dark:o-border-red-800'
      : tier === 'medium'
        ? 'o-bg-amber-50 dark:o-bg-amber-950 o-text-amber-600 dark:o-text-amber-400 o-border-amber-200 dark:o-border-amber-800'
        : 'o-bg-emerald-50 dark:o-bg-emerald-950 o-text-emerald-600 dark:o-text-emerald-400 o-border-emerald-200 dark:o-border-emerald-800'

  return (
    <span
      className={`o-shrink-0 o-rounded-full o-border-w-1 o-px-2 o-py-0.5 o-text-xs o-font-mono ${tone}`}
    >
      {tier}
      {backend === false ? '' : ` · ${backend}`}
    </span>
  )
}

/** Page du catalogue. */
export function Catalogue(): ReactElement {
  const [entries, setEntries] = useState<readonly Entry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/registre/index.json')
      .then((response) =>
        response.ok ? response.json() : Promise.reject(response.status),
      )
      .then((index: { entries: readonly Entry[] }) => setEntries(index.entries))
      .catch(() => setFailed(true))
  }, [])

  const shown = useMemo(() => {
    if (entries === null) return []
    const needle = query.trim().toLowerCase()
    if (needle === '') return entries

    return entries.filter((entry) =>
      `${entry.id} ${entry.title} ${entry.description}`.toLowerCase().includes(needle),
    )
  }, [entries, query])

  const grouped = ORDER.map(
    ([category, label]) =>
      [label, category, shown.filter((entry) => entry.category === category)] as const,
  ).filter(([, , list]) => list.length > 0)

  return (
    <>
      <PageHeader
        module="odoro-bits"
        title="Catalogue"
        lead="Tout ce que le registre publie. Cette page interroge l index — le meme fichier que la CLI telecharge — et ne peut donc ni en omettre ni en inventer."
      />

      {failed ? (
        <Callout tone="warning">
          L index n a pas pu etre lu. Il est produit par{' '}
          <code className="o-font-mono o-text-xs">
            pnpm --filter odoro-bits registry:build
          </code>{' '}
          : lancez-le, puis rechargez.
        </Callout>
      ) : null}

      <Section
        title={
          entries === null
            ? 'Chargement…'
            : `${String(entries.length)} entrees, ${String(grouped.length)} categories`
        }
        lead="Chaque entree s installe par son nom. La CLI resout les dependances, annonce le poids, et refuse d ecrire par-dessus sans confirmation."
      >
        <label className="o-flex o-items-center o-gap-3">
          <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">Filtrer</span>
          <input
            type="search"
            value={query}
            placeholder="nom, categorie, description…"
            onChange={(event) => setQuery(event.target.value)}
            className="o-h-9 o-flex-1 o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-px-3 o-text-sm focus:o-ring"
          />
        </label>

        {entries !== null && shown.length === 0 ? (
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Aucune entree ne correspond.
          </p>
        ) : null}

        <div className="o-flex o-flex-col o-gap-8">
          {grouped.map(([label, category, list]) => (
            <div key={category} className="o-flex o-flex-col o-gap-3">
              <div className="o-flex o-items-baseline o-gap-3">
                <h3 className="o-text-lg o-font-semibold o-tracking-tight">{label}</h3>
                <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
                  {category}
                </span>
                {DEMOS[category] === undefined ? null : (
                  <Link
                    to={DEMOS[category]}
                    className="o-ml-auto o-text-sm o-text-brand-600 dark:o-text-brand-400 hover:o-text-brand-700 dark:hover:o-text-brand-300 o-underline"
                  >
                    Voir les demonstrations
                  </Link>
                )}
              </div>

              <ul className="o-grid o-gap-3 md:o-grid-cols-2">
                {list.map((entry) => (
                  <li
                    key={entry.id}
                    className="o-flex o-flex-col o-gap-2 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-4"
                  >
                    <div className="o-flex o-items-start o-gap-3">
                      <span className="o-font-medium">{entry.title}</span>
                      <Cost tier={entry.tier} backend={entry.backend} />
                    </div>

                    <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                      {entry.description}
                    </p>

                    <code className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400">
                      odoro add {entry.name}
                    </code>

                    {entry.registryDependencies.length === 0 ? null : (
                      <p className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
                        entraine : {entry.registryDependencies.join(', ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Pourquoi cette page ne peut pas mentir"
        lead="Une liste maintenue a cote du registre derive au premier ajout — et rien ne casse : une entree devient simplement introuvable."
      >
        <CodeBlock
          lang="sh"
          code={`# L index est produit par la compilation du registre,
# et c est ce meme fichier que la CLI telecharge.
pnpm --filter odoro-bits registry:build
odoro list`}
        />
        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          Un controle en integration continue compare par ailleurs cet inventaire a ce que
          les pages rendent reellement :{' '}
          <code className="o-font-mono o-text-sm">pnpm check:catalogue</code> echoue si
          une entree publiee n apparait nulle part dans la documentation.
        </p>
      </Section>
    </>
  )
}
