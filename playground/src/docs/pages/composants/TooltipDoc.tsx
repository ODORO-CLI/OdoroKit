/**
 * Documentation du composant Tooltip.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { Button, Tooltip, type TooltipPlacement } from '@odoro-cli/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import {
  PlaygroundBlock,
  jsxProps,
  type ControlValue,
} from '../../components/PlaygroundBlock.jsx'

/** Valeurs par defaut du playground. */
const DEFAULTS: Record<string, ControlValue> = {
  placement: 'top',
  delay: 300,
}

/** Icone de copie utilisee dans l'exemple. */
function CopyIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

/** Documentation du composant Tooltip. */
export function TooltipDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Tooltip"
        lead="Infobulle accessible : apparaît au survol comme au focus clavier, disparaît a la sortie, au blur et sur Echap. Le déclencheur est décrit par aria-describedby tant qu'elle est visible."
      />

      <Section
        title="Aperçu"
        lead="Survolez le bouton, ou donnez-lui le focus au clavier. Le delai évite le clignotement quand le pointeur ne fait que traverser."
      >
        <PlaygroundBlock
          previewClassName="o-py-16"
          controls={[
            {
              name: 'placement',
              type: 'select',
              options: ['top', 'bottom', 'left', 'right'],
              defaultValue: 'top',
            },
            {
              name: 'delay',
              type: 'number',
              defaultValue: 300,
              min: 0,
              max: 2000,
              step: 100,
            },
            {
              name: 'content',
              type: 'text',
              defaultValue: 'Copier dans le presse-papiers',
            },
          ]}
          render={(values) => (
            <Tooltip
              placement={values['placement'] as TooltipPlacement}
              delay={Number(values['delay'])}
              content={String(values['content'])}
            >
              <Button tone="secondary">Survolez-moi</Button>
            </Tooltip>
          )}
          code={(values) => `import { Tooltip } from '@odoro-cli/libs/ui'

<Tooltip content="${String(values['content'])}"${jsxProps(
            { placement: values['placement'] ?? 'top', delay: values['delay'] ?? 300 },
            DEFAULTS,
          )}>
  <Button tone="secondary">Survolez-moi</Button>
</Tooltip>`}
          variants={[
            {
              title: 'En haut',
              values: { placement: 'top' },
            },
            {
              title: 'En bas',
              values: { placement: 'bottom' },
            },
            {
              title: 'A gauche',
              values: { placement: 'left' },
            },
            {
              title: 'A droite',
              values: { placement: 'right' },
            },
            {
              title: 'Delai long',
              description: 'Une seconde avant apparition.',
              values: { delay: 1000 },
            },
            {
              title: 'Sur une icône',
              description: "L'infobulle complète l'aria-label.",
              node: (
                <Tooltip content="Copier dans le presse-papiers">
                  <Button tone="ghost" aria-label="Copier">
                    <CopyIcon />
                  </Button>
                </Tooltip>
              ),
            },
          ]}
        />
      </Section>

      <Section
        title="Sur une icône"
        lead="Cas d'usage typique : un bouton icône dont le sens n'est pas evident. L'infobulle complète le libelle accessible, elle ne le remplace pas."
      >
        <DemoBlock
          code={`<Tooltip content="Copier dans le presse-papiers">
  <Button tone="ghost" aria-label="Copier">
    <CopyIcon />
  </Button>
</Tooltip>`}
        >
          <Tooltip content="Copier dans le presse-papiers">
            <Button tone="ghost" aria-label="Copier">
              <CopyIcon />
            </Button>
          </Tooltip>
        </DemoBlock>
        <Callout tone="warning">
          L'infobulle n'est pas lue par tous les lecteurs d'ecran dans tous les contextes
          : un bouton icone doit toujours porter son propre{' '}
          <code className="o-font-mono o-text-sm">aria-label</code>.
        </Callout>
      </Section>

      <Section
        title="Les quatre placements"
        lead="Le panneau est positionne en pur CSS par rapport au déclencheur : aucune mesure, aucun calcul."
      >
        <DemoBlock
          code={`<Tooltip content="En haut" placement="top">...</Tooltip>
<Tooltip content="En bas" placement="bottom">...</Tooltip>
<Tooltip content="A gauche" placement="left">...</Tooltip>
<Tooltip content="A droite" placement="right">...</Tooltip>`}
        >
          <div className="o-grid o-grid-cols-3 o-gap-4 o-items-center o-justify-items-center o-py-12">
            <span />
            <Tooltip content="En haut" placement="top">
              <Button tone="secondary" size="sm">
                top
              </Button>
            </Tooltip>
            <span />
            <Tooltip content="A gauche" placement="left">
              <Button tone="secondary" size="sm">
                left
              </Button>
            </Tooltip>
            <span />
            <Tooltip content="A droite" placement="right">
              <Button tone="secondary" size="sm">
                right
              </Button>
            </Tooltip>
            <span />
            <Tooltip content="En bas" placement="bottom">
              <Button tone="secondary" size="sm">
                bottom
              </Button>
            </Tooltip>
            <span />
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'content',
              type: 'ReactNode',
              description:
                "Contenu de l'infobulle. Court : une phrase, pas un paragraphe.",
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Élément déclencheur, survole ou focalise.',
            },
            {
              name: 'placement',
              type: "'top' | 'bottom' | 'left' | 'right'",
              defaultValue: "'top'",
              description: "Côté d'apparition.",
            },
            {
              name: 'delay',
              type: 'number',
              defaultValue: '300',
              description:
                'Delai avant apparition, en millisecondes. Évite le clignotement quand le pointeur ne fait que traverser.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour le panneau.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
