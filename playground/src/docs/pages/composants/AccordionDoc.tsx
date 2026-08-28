/**
 * Documentation du composant Accordion.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Accordion, Button, type AccordionItem } from 'odoro-libs/ui'

import {
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

/** Sections FAQ de la demonstration. */
const FAQ_ITEMS: readonly AccordionItem[] = [
  {
    id: 'installation',
    title: 'Comment installer OdoroKit ?',
    content:
      "Ajoutez odoro-libs a votre projet puis importez la feuille de style une seule fois a la racine de l'application.",
  },
  {
    id: 'bundler',
    title: 'Faut-il un bundler particulier ?',
    content:
      "Non : la librairie fonctionne dans n'importe quel projet React 18+, quel que soit le bundler. L'engine odoro reste la voie recommandee.",
  },
  {
    id: 'theme',
    title: 'Le theme sombre est-il gere ?',
    content:
      'Oui, il suit la preference systeme. Posez data-theme sur la racine pour forcer un theme.',
  },
]

/** Sections avec une entree desactivee. */
const DISABLED_ITEMS: readonly AccordionItem[] = [
  FAQ_ITEMS[0] as AccordionItem,
  {
    id: 'entreprise',
    title: 'Offre entreprise (bientot disponible)',
    content: 'Cette section ouvrira prochainement.',
    disabled: true,
  },
  FAQ_ITEMS[2] as AccordionItem,
]

/** Valeurs par defaut du playground. */
const DEFAULTS: Record<string, ControlValue> = {
  type: 'single',
  collapsible: true,
}

/** Demonstration du mode controle. */
function ControlledDemo(): ReactElement {
  const [open, setOpen] = useState<readonly string[]>(['installation'])
  return (
    <div className="o-flex o-flex-col o-gap-4 o-w-full o-max-w-md">
      <Accordion type="multiple" items={FAQ_ITEMS} value={open} onValueChange={setOpen} />
      <div className="o-flex o-items-center o-gap-2">
        <Button
          size="sm"
          tone="secondary"
          onClick={() => setOpen(FAQ_ITEMS.map((item) => item.id))}
        >
          Tout ouvrir
        </Button>
        <Button size="sm" tone="ghost" onClick={() => setOpen([])}>
          Tout fermer
        </Button>
      </div>
    </div>
  )
}

/** Documentation du composant Accordion. */
export function AccordionDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Accordion"
        lead="Accordeon a sections repliables, suivant le motif APG : en-tetes boutons relies a leur region, ouverture animee en hauteur."
      />

      <Section
        title="Apercu"
        lead="Une FAQ de trois sections. En mode single, ouvrir une section referme la precedente ; collapsible autorise a tout refermer."
      >
        <PlaygroundBlock
          controls={[
            {
              name: 'type',
              type: 'select',
              options: ['single', 'multiple'],
              defaultValue: 'single',
            },
            { name: 'collapsible', type: 'boolean', defaultValue: true },
          ]}
          render={(values) => (
            <Accordion
              key={`${String(values['type'])}-${String(values['collapsible'])}`}
              type={values['type'] as 'single' | 'multiple'}
              collapsible={values['collapsible'] === true}
              items={FAQ_ITEMS}
              defaultValue="installation"
              className="o-w-full o-max-w-md"
            />
          )}
          code={(values) => `import { Accordion } from 'odoro-libs/ui'

<Accordion${jsxProps(values, DEFAULTS)}
  defaultValue="installation"
  items={[
    { id: 'installation', title: 'Comment installer OdoroKit ?', content: '...' },
    { id: 'bundler', title: 'Faut-il un bundler particulier ?', content: '...' },
    { id: 'theme', title: 'Le theme sombre est-il gere ?', content: '...' },
  ]}
/>`}
        />
      </Section>

      <Section
        title="Section desactivee"
        lead="Une section disabled reste visible mais ne s'ouvre pas : son en-tete porte aria-disabled."
      >
        <DemoBlock
          code={`<Accordion
  items={[
    { id: 'installation', title: 'Comment installer OdoroKit ?', content: '...' },
    { id: 'entreprise', title: 'Offre entreprise', content: '...', disabled: true },
    { id: 'theme', title: 'Le theme sombre est-il gere ?', content: '...' },
  ]}
/>`}
        >
          <Accordion items={DISABLED_ITEMS} className="o-w-full o-max-w-md" />
        </DemoBlock>
      </Section>

      <Section
        title="Mode controle"
        lead="Passez value et onValueChange pour piloter les sections ouvertes — toujours en tableau d'identifiants, meme en mode single."
      >
        <DemoBlock
          code={`const [open, setOpen] = useState<readonly string[]>(['installation'])

<Accordion type="multiple" items={items} value={open} onValueChange={setOpen} />
<Button onClick={() => setOpen(items.map((item) => item.id))}>Tout ouvrir</Button>
<Button onClick={() => setOpen([])}>Tout fermer</Button>`}
        >
          <ControlledDemo />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'items',
              type: 'readonly AccordionItem[]',
              description: "Sections, dans l'ordre d'affichage.",
            },
            {
              name: 'type',
              type: "'single' | 'multiple'",
              defaultValue: "'single'",
              description:
                "single n'autorise qu'une section ouverte a la fois ; multiple laisse chaque section independante.",
            },
            {
              name: 'defaultValue',
              type: 'string | readonly string[]',
              description: 'Sections ouvertes initialement, en mode non controle.',
            },
            {
              name: 'value',
              type: 'string | readonly string[]',
              description:
                'Sections ouvertes en mode controle. Toujours exprimees en tableau, meme en mode single.',
            },
            {
              name: 'onValueChange',
              type: '(value: readonly string[]) => void',
              description:
                'Appele a chaque changement, avec la liste des sections ouvertes.',
            },
            {
              name: 'collapsible',
              type: 'boolean',
              defaultValue: 'true',
              description:
                'En mode single, autorise a refermer la section ouverte pour que tout soit clos.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour le conteneur.',
            },
          ]}
        />
        <p className="o-text-sm o-text-fg-muted">
          Chaque entree de <code className="o-font-mono o-text-xs">items</code> est un{' '}
          <code className="o-font-mono o-text-xs">AccordionItem</code> :
        </p>
        <PropsTable
          rows={[
            {
              name: 'id',
              type: 'string',
              description: 'Identifiant unique de la section.',
            },
            {
              name: 'title',
              type: 'ReactNode',
              description: "Titre affiche dans l'en-tete cliquable.",
            },
            {
              name: 'content',
              type: 'ReactNode',
              description: 'Contenu de la region depliee.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Rend la section inactivable.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
