/** Documentation du composant Separator. @module */

import { type ReactElement } from 'react'

import { Button, Separator } from '@odoro/libs/ui'

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
  orientation: 'horizontal',
}

/** Documentation du composant Separator. */
export function SeparatorDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Separator"
        lead="Filet de separation horizontal ou vertical, avec libelle centre optionnel."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'orientation',
              type: 'select',
              options: ['horizontal', 'vertical'],
              defaultValue: 'horizontal',
            },
            { name: 'label', label: 'libelle', type: 'text', defaultValue: 'ou' },
          ]}
          render={(v) => {
            const label = (v.label as string).trim()
            if (v.orientation === 'vertical') {
              return (
                <div className="o-flex o-items-stretch o-gap-4 o-h-16">
                  <span className="o-self-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                    Avant
                  </span>
                  <Separator orientation="vertical" />
                  <span className="o-self-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                    Apres
                  </span>
                </div>
              )
            }
            return (
              <div className="o-w-64">
                <Separator label={label === '' ? undefined : label} />
              </div>
            )
          }}
          code={(v) => {
            const label = (v.label as string).trim()
            const labelAttr =
              v.orientation === 'horizontal' && label !== '' ? ` label="${label}"` : ''
            return `<Separator${jsxProps(
              { orientation: v.orientation } as Record<string, ControlValue>,
              DEFAUTS,
            )}${labelAttr} />`
          }}
        />
        <Callout>
          Le libelle n'est rendu qu'en orientation horizontale : un libelle sur un filet
          vertical n'a pas de disposition raisonnable.
        </Callout>
      </Section>

      <Section
        title="Vertical dans une rangee"
        lead="Le filet vertical s'etire sur la hauteur de son conteneur (o-self-stretch) : la rangee doit imposer une hauteur."
      >
        <DemoBlock
          code={`<div className="o-flex o-items-stretch o-gap-4 o-h-10">
  <Button tone="ghost" size="sm">Editer</Button>
  <Separator orientation="vertical" />
  <Button tone="ghost" size="sm">Dupliquer</Button>
  <Separator orientation="vertical" />
  <Button tone="ghost" size="sm">Supprimer</Button>
</div>`}
        >
          <div className="o-flex o-items-stretch o-gap-4 o-h-10">
            <Button tone="ghost" size="sm">
              Editer
            </Button>
            <Separator orientation="vertical" />
            <Button tone="ghost" size="sm">
              Dupliquer
            </Button>
            <Separator orientation="vertical" />
            <Button tone="ghost" size="sm">
              Supprimer
            </Button>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Avec libelle"
        lead="Le libelle est centre entre deux filets : la disposition classique d'un choix alternatif."
      >
        <DemoBlock
          code={`<div className="o-flex o-flex-col o-items-stretch o-gap-3 o-w-64">
  <Button>Se connecter</Button>
  <Separator label="ou" />
  <Button tone="secondary">Creer un compte</Button>
</div>`}
        >
          <div className="o-flex o-flex-col o-items-stretch o-gap-3 o-w-64">
            <Button>Se connecter</Button>
            <Separator label="ou" />
            <Button tone="secondary">Creer un compte</Button>
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              defaultValue: "'horizontal'",
              description: 'Sens du filet.',
            },
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Libelle centre entre deux filets. Horizontal seulement.',
            },
            {
              name: 'decorative',
              type: 'boolean',
              defaultValue: 'true',
              description:
                'Un separateur decoratif est retire de l\'arbre d\'accessibilite (aria-hidden) ; sinon il porte role="separator" et son orientation.',
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
