/**
 * Documentation du composant Breadcrumb.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { Breadcrumb } from 'odoro-libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'

/** Documentation du composant Breadcrumb. */
export function BreadcrumbDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Breadcrumb"
        lead="Fil d'Ariane semantique : la derniere etape represente la page courante, porte aria-current et n'est jamais un lien. Les separateurs sont hors du flux accessible."
      />

      <Section
        title="Apercu"
        lead="Quatre niveaux, de la racine a la page courante. Les etapes intermediaires sont des liens."
      >
        <DemoBlock
          code={`import { Breadcrumb } from 'odoro-libs/ui'

<Breadcrumb
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Projets', href: '/projets' },
    { label: 'OdoroKit', href: '/projets/odorokit' },
    { label: 'Parametres' },
  ]}
/>`}
        >
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '#' },
              { label: 'Projets', href: '#' },
              { label: 'OdoroKit', href: '#' },
              { label: 'Parametres' },
            ]}
          />
        </DemoBlock>
      </Section>

      <Section
        title="Separateur personnalise"
        lead="Le separateur par defaut est un chevron ; passez n'importe quel ReactNode — ici un slash."
      >
        <DemoBlock
          code={`<Breadcrumb
  separator={<span className="o-text-fg-subtle">/</span>}
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Breadcrumb' },
  ]}
/>`}
        >
          <Breadcrumb
            separator={<span className="o-text-fg-subtle">/</span>}
            items={[
              { label: 'Accueil', href: '#' },
              { label: 'Documentation', href: '#' },
              { label: 'Breadcrumb' },
            ]}
          />
        </DemoBlock>
      </Section>

      <Section
        title="Etapes sans lien"
        lead="Une etape sans href est rendue en texte simple : utile pour un niveau de regroupement qui n'a pas de page propre."
      >
        <DemoBlock
          code={`<Breadcrumb
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Composants' },        // pas de page propre
    { label: 'Navigation' },        // pas de page propre
    { label: 'Breadcrumb' },
  ]}
/>`}
        >
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '#' },
              { label: 'Composants' },
              { label: 'Navigation' },
              { label: 'Breadcrumb' },
            ]}
          />
        </DemoBlock>
        <Callout>
          La derniere etape n'est jamais un lien, meme si elle a un{' '}
          <code className="o-font-mono o-text-sm">href</code> : elle represente la page
          courante et porte{' '}
          <code className="o-font-mono o-text-sm">aria-current="page"</code>.
        </Callout>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'items',
              type: 'readonly BreadcrumbItem[]',
              description: 'Etapes, de la racine a la page courante.',
            },
            {
              name: 'label',
              type: 'string',
              defaultValue: '"Fil d\'Ariane"',
              description: 'Libelle accessible de la navigation.',
            },
            {
              name: 'separator',
              type: 'ReactNode',
              defaultValue: 'un chevron',
              description: 'Separateur entre les etapes.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour la navigation.',
            },
          ]}
        />
        <p className="o-text-sm o-text-fg-muted">
          Chaque entree de <code className="o-font-mono o-text-xs">items</code> est un{' '}
          <code className="o-font-mono o-text-xs">BreadcrumbItem</code> :
        </p>
        <PropsTable
          rows={[
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Libelle affiche.',
            },
            {
              name: 'href',
              type: 'string',
              description: "Destination. Sans lien, l'etape est rendue en texte simple.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
