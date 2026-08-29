/** Documentation du composant Spinner. @module */

import { type ReactElement } from 'react'

import { Button, Card, Spinner } from '@odoro/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import {
  type ControlValue,
  PlaygroundBlock,
  jsxProps,
} from '../../components/PlaygroundBlock.jsx'

/** Valeurs par defaut des props pilotees par le playground. */
const DEFAUTS: Record<string, ControlValue> = {
  size: 'md',
  label: 'Chargement',
}

/** Documentation du composant Spinner. */
export function SpinnerDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Spinner"
        lead="Indicateur d'activite circulaire, teinte par la couleur de texte courante et annonce aux lecteurs d'ecran."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'label', label: 'libelle', type: 'text', defaultValue: 'Chargement' },
          ]}
          render={(v) => (
            <Spinner size={v.size as 'sm' | 'md' | 'lg'} label={v.label as string} />
          )}
          code={(v) => `<Spinner${jsxProps(v, DEFAUTS)} />`}
        />
        <Callout>
          Le dessin herite de <code className="o-font-mono o-text-sm">currentColor</code>{' '}
          : posez une classe de couleur de texte (par exemple{' '}
          <code className="o-font-mono o-text-sm">
            o-text-brand-600 dark:o-text-brand-400
          </code>
          ) sur le composant pour le teinter. Le libelle est masque visuellement mais
          annonce via <code className="o-font-mono o-text-sm">role="status"</code>.
        </Callout>
      </Section>

      <Section
        title="Dans un bouton"
        lead="Button integre deja un Spinner : la prop loading remplace l'icone de depart et pose aria-busy."
      >
        <DemoBlock
          code={`<Button loading>Enregistrement</Button>
<Button tone="secondary" loading>Chargement</Button>`}
        >
          <div className="o-flex o-items-center o-gap-4">
            <Button loading>Enregistrement</Button>
            <Button tone="secondary" loading>
              Chargement
            </Button>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Centre dans une zone vide"
        lead="Le motif classique d'attente : un spinner teinte, centre dans le conteneur dont le contenu arrive."
      >
        <DemoBlock
          code={`<Card>
  <div className="o-flex o-items-center o-justify-center o-py-12">
    <Spinner size="lg" label="Chargement des projets" className="o-text-brand-600 dark:o-text-brand-400" />
  </div>
</Card>`}
        >
          <Card className="o-w-72">
            <div className="o-flex o-items-center o-justify-center o-py-12">
              <Spinner
                size="lg"
                label="Chargement des projets"
                className="o-text-brand-600 dark:o-text-brand-400"
              />
            </div>
          </Card>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description: 'Taille (16, 24 ou 32 pixels de diametre).',
            },
            {
              name: 'label',
              type: 'string',
              defaultValue: "'Chargement'",
              description: "Libelle annonce aux lecteurs d'ecran, masque visuellement.",
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
