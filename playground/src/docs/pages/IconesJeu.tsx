/**
 * La page d'un jeu d'icones.
 *
 * ## Pourquoi les cinq jeux sont importes ici
 *
 * Un import par espace de nom charge tout le jeu — c'est exactement ce qu'il
 * faut eviter dans une application, et exactement ce qu'il faut faire dans une
 * page qui les montre tous. La documentation est le seul endroit ou cet import
 * a un sens.
 *
 * Les jeux sont neanmoins charges **a la demande** : la route les importe
 * paresseusement, si bien qu'ouvrir la page des fonds ne fait pas descendre
 * deux megaoctets d'icones.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { IconGrid } from '../components/IconGrid.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'

/** Ce qu'un module de jeu expose. */
export interface JeuModule {
  readonly INFO: {
    readonly module: string
    readonly title: string
    readonly summary: string
    readonly mode: 'trait' | 'plein'
    readonly stroke?: number
    readonly count: number
  }
  readonly NAMES: Readonly<Record<string, string>>
  readonly [key: string]: unknown
}

/** Page d'un jeu. */
export function IconesJeu({ jeu }: { jeu: JeuModule }): ReactElement {
  const { INFO, NAMES, ...reste } = jeu

  // Le module exporte ses icones a plat, plus deux tables : ce qui reste une
  // fois celles-ci retirees est exactement le jeu.
  const icons = reste as Parameters<typeof IconGrid>[0]['icons']

  return (
    <>
      <PageHeader
        module={`@odoro-cli/icons/${INFO.module}`}
        title={INFO.title}
        lead={INFO.summary}
      />

      <div className="o-mb-8 o-flex o-flex-wrap o-items-center o-gap-3">
        <span className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-2 o-py-0.5 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          {INFO.count} icones
        </span>
        <span className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-2 o-py-0.5 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          {INFO.mode}
          {INFO.stroke === undefined ? '' : ` · trait de ${String(INFO.stroke)}`}
        </span>
        <code className="o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-3 o-py-1 o-font-mono o-text-sm o-text-brand-600 dark:o-text-brand-400">
          odoro-icons/{INFO.module}
        </code>
      </div>

      {INFO.module !== 'marques' ? null : (
        <Callout tone="warning">
          Ces traces sont des <strong>marques deposees</strong>. Aucune licence de code ne
          regit leur emploi : ce sont les regles de chaque proprietaire. Designer un
          service par son logo est l usage nominatif ordinaire ; suggerer une affiliation
          qui n existe pas, ou modifier un logo, ne le devient pas parce que le fichier
          etait libre.
        </Callout>
      )}

      <Section title="Chercher" lead="Un clic copie la ligne d import complete.">
        <IconGrid module={INFO.module} icons={icons} names={NAMES} />
      </Section>

      <Section title="Employer">
        <CodeBlock
          lang="tsx"
          code={`import { Icon } from '@odoro-cli/icons'
import { Search } from '@odoro-cli/icons/${INFO.module}'

<Icon icon={Search} size={20} label="Rechercher" />`}
        />
      </Section>
    </>
  )
}
