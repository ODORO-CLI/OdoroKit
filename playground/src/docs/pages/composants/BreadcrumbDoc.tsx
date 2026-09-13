/**
 * Documentation du composant Breadcrumb.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { Breadcrumb } from '@odoro-cli/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import { VariantGrid } from '../../components/PlaygroundBlock.jsx'

/** Documentation du composant Breadcrumb. */
export function BreadcrumbDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Breadcrumb"
        lead="Fil d'Ariane semantique : la dernière étape represente la page courante, porte aria-current et n'est jamais un lien. Les separateurs sont hors du flux accessible."
      />

      <Section
        title="Aperçu"
        lead="Quatre niveaux, de la racine a la page courante. Les étapes intermediaires sont des liens."
      >
        <DemoBlock
          code={`import { Breadcrumb } from '@odoro-cli/libs/ui'

<Breadcrumb
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Projets', href: '/projets' },
    { label: 'OdoroKit', href: '/projets/odorokit' },
    { label: 'Paramètrès' },
  ]}
/>`}
        >
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '#' },
              { label: 'Projets', href: '#' },
              { label: 'OdoroKit', href: '#' },
              { label: 'Paramètrès' },
            ]}
          />
        </DemoBlock>
      </Section>

      <Section
        title="Séparateur personnalise"
        lead="Le séparateur par défaut est un chevron ; passez n'importe quel ReactNode — ici un slash."
      >
        <DemoBlock
          code={`<Breadcrumb
  separator={<span className="o-text-zinc-500 dark:o-text-zinc-400">/</span>}
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Breadcrumb' },
  ]}
/>`}
        >
          <Breadcrumb
            separator={<span className="o-text-zinc-500 dark:o-text-zinc-400">/</span>}
            items={[
              { label: 'Accueil', href: '#' },
              { label: 'Documentation', href: '#' },
              { label: 'Breadcrumb' },
            ]}
          />
        </DemoBlock>
      </Section>

      <Section
        title="Étapes sans lien"
        lead="Une étape sans href est rendue en texte simple : utile pour un niveau de regroupement qui n'a pas de page propre."
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

      <Section title="Variantes">
        <VariantGrid
          variants={[
            {
              title: 'Deux niveaux',
              description: 'La forme minimale utile.',
              node: (
                <Breadcrumb
                  items={[{ label: 'Accueil', href: '#' }, { label: 'Projets' }]}
                />
              ),
            },
            {
              title: 'Quatre niveaux',
              description: 'De la racine a la page courante.',
              node: (
                <Breadcrumb
                  items={[
                    { label: 'Accueil', href: '#' },
                    { label: 'Projets', href: '#' },
                    { label: 'OdoroKit', href: '#' },
                    { label: 'Paramètrès' },
                  ]}
                />
              ),
            },
            {
              title: 'Séparateur slash',
              description: 'Un ReactNode libre entre les étapes.',
              node: (
                <Breadcrumb
                  separator={
                    <span className="o-text-zinc-500 dark:o-text-zinc-400">/</span>
                  }
                  items={[
                    { label: 'Accueil', href: '#' },
                    { label: 'Docs', href: '#' },
                    { label: 'Breadcrumb' },
                  ]}
                />
              ),
            },
            {
              title: 'Étapes sans lien',
              description: 'Les niveaux sans page propre restent en texte.',
              node: (
                <Breadcrumb
                  items={[
                    { label: 'Accueil', href: '#' },
                    { label: 'Composants' },
                    { label: 'Breadcrumb' },
                  ]}
                />
              ),
            },
          ]}
        />
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'items',
              type: 'readonly BreadcrumbItem[]',
              description: 'Étapes, de la racine a la page courante.',
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
              description: 'Séparateur entre les étapes.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour la navigation.',
            },
          ]}
        />
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Chaque entrée de <code className="o-font-mono o-text-xs">items</code> est un{' '}
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
              description: "Destination. Sans lien, l'étape est rendue en texte simple.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
