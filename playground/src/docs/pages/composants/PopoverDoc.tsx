/**
 * Documentation du composant Popover.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Button, Input, Popover, buttonClasses } from '@odoro/libs/ui'

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
  placement: 'bottom',
  align: 'start',
}

/** Petit formulaire de dimensions affiche dans le panneau. */
function SizeForm(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-3 o-w-56">
      <p className="o-text-sm o-font-medium">Dimensions</p>
      <Input label="Largeur" size="sm" defaultValue="320" />
      <Input label="Hauteur" size="sm" defaultValue="200" />
      <Button size="sm">Appliquer</Button>
    </div>
  )
}

/** Demonstration du mode controle. */
function ControlledDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <div className="o-flex o-flex-col o-items-center o-gap-3">
      <Popover
        trigger="Panneau pilote"
        triggerClassName={buttonClasses({ tone: 'secondary' })}
        open={open}
        onOpenChange={setOpen}
      >
        <div className="o-flex o-flex-col o-gap-2 o-w-56">
          <p className="o-text-sm">
            Cet etat vit dans l'application, pas dans le composant.
          </p>
          <Button size="sm" tone="ghost" onClick={() => setOpen(false)}>
            Fermer depuis le contenu
          </Button>
        </div>
      </Popover>
      <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        Etat : <code className="o-font-mono o-text-xs">{open ? 'ouvert' : 'ferme'}</code>
      </span>
    </div>
  )
}

/** Documentation du composant Popover. */
export function PopoverDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Popover"
        lead="Panneau riche ancre a un declencheur. Contrairement a l'infobulle, il est interactif : il recoit le focus, se ferme au clic exterieur et sur Echap, puis rend le focus au declencheur."
      />

      <Section
        title="Apercu"
        lead="Un declencheur et un panneau contenant un petit formulaire. Le positionnement est purement CSS."
      >
        <PlaygroundBlock
          previewClassName="o-py-16"
          controls={[
            {
              name: 'placement',
              type: 'select',
              options: ['top', 'bottom'],
              defaultValue: 'bottom',
            },
            {
              name: 'align',
              type: 'select',
              options: ['start', 'center', 'end'],
              defaultValue: 'start',
            },
          ]}
          render={(values) => (
            <Popover
              trigger="Dimensions"
              triggerClassName={buttonClasses({ tone: 'secondary' })}
              placement={values['placement'] as 'top' | 'bottom'}
              align={values['align'] as 'start' | 'center' | 'end'}
            >
              <SizeForm />
            </Popover>
          )}
          code={(values) => `import { Popover, buttonClasses } from '@odoro/libs/ui'

<Popover
  trigger="Dimensions"
  triggerClassName={buttonClasses({ tone: 'secondary' })}${jsxProps(values, DEFAULTS).length === 0 ? '' : `\n ${jsxProps(values, DEFAULTS)}`}
>
  <SizeForm />
</Popover>`}
        />
        <Callout>
          Le declencheur est un{' '}
          <code className="o-font-mono o-text-sm">&lt;button&gt;</code> rendu par le
          composant : passez son contenu via{' '}
          <code className="o-font-mono o-text-sm">trigger</code> et son style via{' '}
          <code className="o-font-mono o-text-sm">triggerClassName</code> —{' '}
          <code className="o-font-mono o-text-sm">buttonClasses()</code> donne l'apparence
          d'un <code className="o-font-mono o-text-sm">Button</code> sans imbriquer deux
          boutons.
        </Callout>
      </Section>

      <Section
        title="Mode controle"
        lead="Passez open et onOpenChange pour piloter l'ouverture depuis l'application — utile pour fermer apres validation d'un formulaire."
      >
        <DemoBlock
          code={`const [open, setOpen] = useState(false)

<Popover
  trigger="Panneau pilote"
  triggerClassName={buttonClasses({ tone: 'secondary' })}
  open={open}
  onOpenChange={setOpen}
>
  <Button size="sm" onClick={() => setOpen(false)}>Fermer depuis le contenu</Button>
</Popover>`}
        >
          <ControlledDemo />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'trigger',
              type: 'ReactNode',
              description: 'Contenu du bouton declencheur.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Contenu du panneau.',
            },
            {
              name: 'placement',
              type: "'top' | 'bottom'",
              defaultValue: "'bottom'",
              description: "Cote d'apparition.",
            },
            {
              name: 'align',
              type: "'start' | 'center' | 'end'",
              defaultValue: "'start'",
              description: 'Alignement du panneau sur le declencheur.',
            },
            {
              name: 'open',
              type: 'boolean',
              description: "Etat d'ouverture en mode controle.",
            },
            {
              name: 'defaultOpen',
              type: 'boolean',
              defaultValue: 'false',
              description: "Etat d'ouverture initial en mode non controle.",
            },
            {
              name: 'onOpenChange',
              type: '(open: boolean) => void',
              description: "Appele a chaque demande d'ouverture ou de fermeture.",
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour le panneau.',
            },
            {
              name: 'triggerClassName',
              type: 'string',
              description: 'Classes additionnelles pour le bouton declencheur.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
