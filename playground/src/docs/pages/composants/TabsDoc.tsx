/**
 * Documentation du composant Tabs.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Button, Tabs, type TabItem } from '@odoro-cli/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import { VariantGrid } from '../../components/PlaygroundBlock.jsx'

/** Onglets de la demonstration principale. */
const DEMO_ITEMS: readonly TabItem[] = [
  {
    id: 'apercu',
    label: 'Aperçu',
    content: (
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
        Vue d'ensemble du projet : etat d'avancement, derniers changements et indicateurs
        cles.
      </p>
    ),
  },
  {
    id: 'reglages',
    label: 'Réglages',
    content: (
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
        Nom du projet, visibilite, membres et permissions. Chaque changement est
        enregistre immediatement.
      </p>
    ),
  },
  {
    id: 'facturation',
    label: 'Facturation',
    content: (
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
        Section réservée au proprietaire du projet.
      </p>
    ),
    disabled: true,
  },
]

/** Contenu court d'un panneau de la galerie. */
function PanelText({ children }: { children: string }): ReactElement {
  return <p className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">{children}</p>
}

/** Trois onglets textuels simples. */
const SIMPLE_TABS: readonly TabItem[] = [
  { id: 'apercu', label: 'Aperçu', content: <PanelText>Vue d'ensemble.</PanelText> },
  { id: 'code', label: 'Code', content: <PanelText>Extrait de code.</PanelText> },
  { id: 'export', label: 'Export', content: <PanelText>Formats proposes.</PanelText> },
]

/** Trois onglets dont un desactive. */
const DISABLED_TABS: readonly TabItem[] = [
  { id: 'apercu', label: 'Aperçu', content: <PanelText>Vue d'ensemble.</PanelText> },
  { id: 'code', label: 'Code', content: <PanelText>Extrait de code.</PanelText> },
  {
    id: 'facturation',
    label: 'Facturation',
    content: <PanelText>Section réservée.</PanelText>,
    disabled: true,
  },
]

/** Compteur affiche dans un libelle d'onglet. */
function TabCount({ value }: { value: number }): ReactElement {
  return (
    <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums">
      {' '}
      {value}
    </span>
  )
}

/** Onglets avec compteurs dans les libelles. */
const COUNTED_TABS: readonly TabItem[] = [
  {
    id: 'ouverts',
    label: (
      <>
        Ouverts
        <TabCount value={12} />
      </>
    ),
    content: <PanelText>Douze tickets ouverts.</PanelText>,
  },
  {
    id: 'fermes',
    label: (
      <>
        Fermes
        <TabCount value={48} />
      </>
    ),
    content: <PanelText>Quarante-huit tickets fermes.</PanelText>,
  },
]

/** Demonstration du mode controle. */
function ControlledDemo(): ReactElement {
  const [active, setActive] = useState('apercu')
  return (
    <div className="o-flex o-flex-col o-gap-4 o-w-full o-max-w-md">
      <Tabs
        label="Sections du projet (contrôle)"
        items={DEMO_ITEMS}
        value={active}
        onValueChange={setActive}
      />
      <div className="o-flex o-items-center o-gap-2">
        <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Onglet actif : <code className="o-font-mono o-text-xs">{active}</code>
        </span>
        <Button size="sm" tone="secondary" onClick={() => setActive('reglages')}>
          Aller aux réglages
        </Button>
      </div>
    </div>
  )
}

/** Documentation du composant Tabs. */
export function TabsDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Tabs"
        lead="Onglets accessibles avec indicateur glissant. La navigation clavier suit le motif ARIA : fleches pour changer d'onglet, un seul onglet dans l'ordre de tabulation."
      />

      <Section
        title="Aperçu"
        lead="Trois onglets dont un desactive. Cliquez, ou naviguez aux fleches une fois le focus pose sur un onglet."
      >
        <DemoBlock
          code={`import { Tabs } from '@odoro-cli/libs/ui'

<Tabs
  label="Sections du projet"
  items={[
    { id: 'apercu', label: 'Aperçu', content: <Overview /> },
    { id: 'reglages', label: 'Réglages', content: <Settings /> },
    { id: 'facturation', label: 'Facturation', content: <Billing />, disabled: true },
  ]}
/>`}
        >
          <Tabs
            label="Sections du projet"
            items={DEMO_ITEMS}
            className="o-w-full o-max-w-md"
          />
        </DemoBlock>
      </Section>

      <Section
        title="Mode contrôle"
        lead="Passez value et onValueChange pour piloter l'onglet actif depuis l'application — ici un bouton externe change d'onglet."
      >
        <DemoBlock
          code={`const [active, setActive] = useState('apercu')

<Tabs
  label="Sections du projet"
  items={items}
  value={active}
  onValueChange={setActive}
/>
<Button onClick={() => setActive('reglages')}>Aller aux réglages</Button>`}
        >
          <ControlledDemo />
        </DemoBlock>
      </Section>

      <Section title="Variantes">
        <VariantGrid
          variants={[
            {
              title: 'Trois onglets',
              description: 'La forme la plus courante.',
              node: <Tabs label="Sections" items={SIMPLE_TABS} className="o-w-full" />,
            },
            {
              title: 'Onglet desactive',
              description: 'Les fleches le sautent.',
              node: <Tabs label="Sections" items={DISABLED_TABS} className="o-w-full" />,
            },
            {
              title: 'Compteurs',
              description: 'Un nombre dans chaque libelle.',
              node: <Tabs label="Tickets" items={COUNTED_TABS} className="o-w-full" />,
            },
            {
              title: 'Onglet initial choisi',
              description: 'defaultValue ouvre sur le deuxieme.',
              node: (
                <Tabs
                  label="Sections"
                  items={SIMPLE_TABS}
                  defaultValue="code"
                  className="o-w-full"
                />
              ),
            },
          ]}
        />
      </Section>

      <Section title="Navigation clavier">
        <Callout>
          Le focus ne visite qu'un seul onglet avec <strong>Tab</strong> : celui qui est
          actif. Une fois dessus, <strong>Fleche droite</strong> et{' '}
          <strong>Fleche gauche</strong> changent d'onglet en sautant les onglets
          desactives et en bouclant aux extremites ; <strong>Home</strong> va au premier
          onglet activable, <strong>End</strong> au dernier. Le panneau associe est
          focalisable pour que la lecture continue naturellement.
        </Callout>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'items',
              type: 'readonly TabItem[]',
              description: "Onglets, dans l'ordre d'affichage.",
            },
            {
              name: 'value',
              type: 'string',
              description: 'Onglet actif en mode contrôle.',
            },
            {
              name: 'defaultValue',
              type: 'string',
              defaultValue: 'le premier',
              description: 'Onglet actif initial en mode non contrôle.',
            },
            {
              name: 'onValueChange',
              type: '(id: string) => void',
              description: "Appele au changement d'onglet.",
            },
            {
              name: 'label',
              type: 'string',
              description: "Libelle accessible de la barre d'onglets.",
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour le conteneur.',
            },
          ]}
        />
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Chaque entrée de <code className="o-font-mono o-text-xs">items</code> est un{' '}
          <code className="o-font-mono o-text-xs">TabItem</code> :
        </p>
        <PropsTable
          rows={[
            {
              name: 'id',
              type: 'string',
              description: "Identifiant unique de l'onglet.",
            },
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Libelle affiche.',
            },
            {
              name: 'content',
              type: 'ReactNode',
              description: 'Contenu du panneau associe.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: "Rend l'onglet inactivable.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
