/**
 * Documentation du composant Pagination.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Pagination } from 'odoro-libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import { PlaygroundBlock } from '../../components/PlaygroundBlock.jsx'

/** Apercu a etat : la page vit ici, le nombre de voisins vient du playground. */
function WindowPreview({ siblingCount }: { siblingCount: number }): ReactElement {
  const [page, setPage] = useState(6)
  return (
    <div className="o-flex o-flex-col o-items-center o-gap-3">
      <Pagination
        page={page}
        pageCount={12}
        siblingCount={siblingCount}
        onPageChange={setPage}
      />
      <span className="o-text-sm o-text-fg-muted">
        Page <span className="o-tabular-nums">{page}</span> sur 12
      </span>
    </div>
  )
}

/** Demonstration : peu de pages, aucune ellipse. */
function FewPagesDemo(): ReactElement {
  const [page, setPage] = useState(2)
  return <Pagination page={page} pageCount={5} onPageChange={setPage} />
}

/** Demonstration : grand nombre de pages, une ellipse de chaque cote. */
function ManyPagesDemo(): ReactElement {
  const [page, setPage] = useState(42)
  return <Pagination page={page} pageCount={120} onPageChange={setPage} />
}

/** Documentation du composant Pagination. */
export function PaginationDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Pagination"
        lead="Pagination a fenetre glissante : la premiere et la derniere page sont toujours presentes, une fenetre entoure la page courante, une ellipse marque chaque saut."
      />

      <Section
        title="Apercu"
        lead="Douze pages ; la page courante vit dans l'etat de l'application. siblingCount regle le nombre de pages affichees de chaque cote."
      >
        <PlaygroundBlock
          controls={[
            {
              name: 'siblingCount',
              type: 'number',
              defaultValue: 1,
              min: 0,
              max: 3,
              step: 1,
            },
          ]}
          render={(values) => (
            <WindowPreview siblingCount={Number(values['siblingCount'])} />
          )}
          code={(values) => `import { Pagination } from 'odoro-libs/ui'

const [page, setPage] = useState(6)

<Pagination
  page={page}
  pageCount={12}${Number(values['siblingCount']) === 1 ? '' : `\n  siblingCount={${Number(values['siblingCount'])}}`}
  onPageChange={setPage}
/>`}
        />
        <Callout>
          La page courante porte{' '}
          <code className="o-font-mono o-text-sm">aria-current="page"</code> ; les boutons
          precedent et suivant ont un libelle masque visuellement, le chevron seul ne
          disant rien aux lecteurs d'ecran.
        </Callout>
      </Section>

      <Section
        title="Peu de pages"
        lead="Quand toutes les pages tiennent dans la fenetre, aucune ellipse n'apparait."
      >
        <DemoBlock
          code={`const [page, setPage] = useState(2)

<Pagination page={page} pageCount={5} onPageChange={setPage} />`}
        >
          <FewPagesDemo />
        </DemoBlock>
      </Section>

      <Section
        title="Grand nombre de pages"
        lead="Au milieu d'une longue liste, une ellipse marque le saut de chaque cote de la fenetre."
      >
        <DemoBlock
          code={`const [page, setPage] = useState(42)

<Pagination page={page} pageCount={120} onPageChange={setPage} />`}
        >
          <ManyPagesDemo />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'page',
              type: 'number',
              description: 'Page courante, 1-indexee.',
            },
            {
              name: 'pageCount',
              type: 'number',
              description: 'Nombre total de pages.',
            },
            {
              name: 'onPageChange',
              type: '(page: number) => void',
              description: 'Appele avec la page demandee.',
            },
            {
              name: 'siblingCount',
              type: 'number',
              defaultValue: '1',
              description:
                'Nombre de pages affichees de chaque cote de la page courante.',
            },
            {
              name: 'label',
              type: 'string',
              defaultValue: "'Pagination'",
              description: 'Libelle accessible de la navigation.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour la navigation.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
