/** Documentation du composant Badge. @module */

import { type ReactElement } from 'react'

import { Badge, type BadgeTone, Card } from 'odoro-libs/ui'

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

/** Les sept registres de couleur. */
const TONES: readonly BadgeTone[] = [
  'neutral',
  'primary',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
]

/** Valeurs par defaut des props pilotees par le playground. */
const DEFAUTS: Record<string, ControlValue> = {
  tone: 'neutral',
  variant: 'soft',
  size: 'sm',
  dot: false,
}

/** Documentation du composant Badge. */
export function BadgeDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Badge"
        lead="Pastille de statut ou d'etiquetage, en sept registres de couleur et trois rendus."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'tone',
              type: 'select',
              options: TONES,
              defaultValue: 'neutral',
            },
            {
              name: 'variant',
              type: 'select',
              options: ['soft', 'solid', 'outline'],
              defaultValue: 'soft',
            },
            { name: 'size', type: 'select', options: ['sm', 'md'], defaultValue: 'sm' },
            { name: 'dot', type: 'boolean', defaultValue: false },
            { name: 'text', label: 'texte', type: 'text', defaultValue: 'Publie' },
          ]}
          render={(v) => (
            <Badge
              tone={v.tone as BadgeTone}
              variant={v.variant as 'soft' | 'solid' | 'outline'}
              size={v.size as 'sm' | 'md'}
              dot={v.dot as boolean}
            >
              {v.text as string}
            </Badge>
          )}
          code={(v) =>
            `<Badge${jsxProps(
              {
                tone: v.tone,
                variant: v.variant,
                size: v.size,
                dot: v.dot,
              } as Record<string, ControlValue>,
              DEFAUTS,
            )}>${String(v.text)}</Badge>`
          }
        />
      </Section>

      <Section
        title="Registres de couleur"
        lead="Le ton neutral s'appuie sur les gris de surface ; les six autres reprennent les couleurs semantiques du theme."
      >
        <DemoBlock
          code={`<Badge tone="neutral">neutral</Badge>
<Badge tone="primary">primary</Badge>
<Badge tone="accent">accent</Badge>
<Badge tone="success">success</Badge>
<Badge tone="warning">warning</Badge>
<Badge tone="danger">danger</Badge>
<Badge tone="info">info</Badge>`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-2">
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="En situation"
        lead="La pastille se glisse dans un texte courant ou signale un statut sur une carte."
      >
        <DemoBlock
          code={`<p>
  Le module routeur est <Badge tone="success" dot>stable</Badge> depuis la
  version 1.2, le module motion reste en <Badge tone="warning">beta</Badge>.
</p>`}
        >
          <p className="o-text-sm o-text-zinc-900 dark:o-text-zinc-50 o-max-w-prose">
            Le module routeur est{' '}
            <Badge tone="success" dot>
              stable
            </Badge>{' '}
            depuis la version 1.2, le module motion reste en{' '}
            <Badge tone="warning">beta</Badge>.
          </p>
        </DemoBlock>
        <DemoBlock
          code={`<Card
  title={
    <span className="o-flex o-items-center o-gap-2">
      Projet Odoro <Badge tone="primary" variant="solid">Nouveau</Badge>
    </span>
  }
  description="Librairie front maison."
/>`}
        >
          <Card
            title={
              <span className="o-flex o-items-center o-gap-2">
                Projet Odoro{' '}
                <Badge tone="primary" variant="solid">
                  Nouveau
                </Badge>
              </span>
            }
            description="Librairie front maison."
            className="o-w-72"
          />
        </DemoBlock>
        <Callout>
          La pastille est purement visuelle : si elle est la seule porteuse d'une
          information d'etat, doublez-la d'un texte accessible.
        </Callout>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'tone',
              type: 'BadgeTone',
              defaultValue: "'neutral'",
              description:
                'Registre de couleur : neutral, primary, accent, success, warning, danger ou info.',
            },
            {
              name: 'variant',
              type: "'soft' | 'solid' | 'outline'",
              defaultValue: "'soft'",
              description:
                'Rendu : soft pose le texte du ton sur son fond attenue, solid la couleur pleine, outline un simple lisere.',
            },
            {
              name: 'size',
              type: "'sm' | 'md'",
              defaultValue: "'sm'",
              description: 'Taille.',
            },
            {
              name: 'dot',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Point colore devant le libelle. Il herite de la couleur du texte et reste assorti quel que soit le rendu.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Libelle.',
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
