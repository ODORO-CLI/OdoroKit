/**
 * Documentation du composant DropdownMenu.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { DropdownMenu, type DropdownMenuItem } from 'odoro-libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'

/** Icone crayon. */
function PencilIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

/** Icone duplication. */
function CopyIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
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

/** Icone archive. */
function ArchiveIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
    </svg>
  )
}

/** Icone corbeille. */
function TrashIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  )
}

/** Demonstration principale : l'action selectionnee s'affiche sous le menu. */
function MainDemo(): ReactElement {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const items: readonly DropdownMenuItem[] = [
    {
      id: 'renommer',
      label: 'Renommer',
      icon: <PencilIcon />,
      shortcut: 'F2',
      onSelect: () => setLastAction('renommer'),
    },
    {
      id: 'dupliquer',
      label: 'Dupliquer',
      icon: <CopyIcon />,
      shortcut: 'Ctrl+D',
      onSelect: () => setLastAction('dupliquer'),
    },
    {
      id: 'archiver',
      label: 'Archiver',
      icon: <ArchiveIcon />,
      disabled: true,
    },
    { type: 'separator' },
    {
      id: 'supprimer',
      label: 'Supprimer',
      icon: <TrashIcon />,
      shortcut: 'Suppr',
      danger: true,
      onSelect: () => setLastAction('supprimer'),
    },
  ]

  return (
    <div className="o-flex o-flex-col o-items-center o-gap-3 o-pb-8">
      <DropdownMenu label="Actions" items={items} />
      <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        {lastAction === null ? (
          'Aucune action selectionnee'
        ) : (
          <>
            Derniere action : <code className="o-font-mono o-text-xs">{lastAction}</code>
          </>
        )}
      </span>
    </div>
  )
}

/** Actions minimales pour l'exemple de tons. */
const SIMPLE_ITEMS: readonly DropdownMenuItem[] = [
  { id: 'profil', label: 'Profil' },
  { id: 'preferences', label: 'Preferences' },
  { type: 'separator' },
  { id: 'deconnexion', label: 'Se deconnecter', danger: true },
]

/** Documentation du composant DropdownMenu. */
export function DropdownMenuDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="DropdownMenu"
        lead="Menu d'actions deroulant suivant le motif APG menu button : declencheur aria-haspopup, panneau role=menu navigable aux fleches avec focus rovant."
      />

      <Section
        title="Apercu"
        lead="Un menu complet : icones, raccourcis indicatifs, separateur, action desactivee et action destructrice. L'action choisie s'affiche sous le menu."
      >
        <DemoBlock
          code={`import { DropdownMenu } from 'odoro-libs/ui'

const [lastAction, setLastAction] = useState<string | null>(null)

<DropdownMenu
  label="Actions"
  items={[
    { id: 'renommer', label: 'Renommer', icon: <PencilIcon />, shortcut: 'F2',
      onSelect: () => setLastAction('renommer') },
    { id: 'dupliquer', label: 'Dupliquer', icon: <CopyIcon />, shortcut: 'Ctrl+D',
      onSelect: () => setLastAction('dupliquer') },
    { id: 'archiver', label: 'Archiver', icon: <ArchiveIcon />, disabled: true },
    { type: 'separator' },
    { id: 'supprimer', label: 'Supprimer', icon: <TrashIcon />, shortcut: 'Suppr',
      danger: true, onSelect: () => setLastAction('supprimer') },
  ]}
/>`}
        >
          <MainDemo />
        </DemoBlock>
        <Callout>
          Navigation clavier complete : <strong>Fleche bas</strong> ou{' '}
          <strong>Fleche haut</strong> sur le declencheur ouvre le menu sur la premiere ou
          la derniere action ; dans le menu, les fleches deplacent le focus en bouclant et
          en sautant separateurs et actions desactivees, <strong>Home</strong> et{' '}
          <strong>End</strong> vont aux extremites, <strong>Entree</strong> selectionne,{' '}
          <strong>Echap</strong> referme en rendant le focus au declencheur,{' '}
          <strong>Tab</strong> quitte le menu.
        </Callout>
      </Section>

      <Section
        title="Ton du declencheur"
        lead="Le declencheur reprend les registres visuels de Button via la prop tone."
      >
        <DemoBlock
          code={`<DropdownMenu label="Compte" tone="primary" items={items} />
<DropdownMenu label="Compte" tone="secondary" items={items} />
<DropdownMenu label="Compte" tone="ghost" items={items} />
<DropdownMenu label="Compte" tone="danger" items={items} />`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-gap-4 o-pb-8">
            <DropdownMenu label="Compte" tone="primary" items={SIMPLE_ITEMS} />
            <DropdownMenu label="Compte" tone="secondary" items={SIMPLE_ITEMS} />
            <DropdownMenu label="Compte" tone="ghost" items={SIMPLE_ITEMS} />
            <DropdownMenu label="Compte" tone="danger" items={SIMPLE_ITEMS} />
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Contenu du bouton declencheur.',
            },
            {
              name: 'items',
              type: 'readonly DropdownMenuItem[]',
              description: "Entrees du menu, dans l'ordre d'affichage.",
            },
            {
              name: 'tone',
              type: "'primary' | 'secondary' | 'ghost' | 'danger'",
              defaultValue: "'secondary'",
              description: 'Registre visuel du declencheur.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles pour le conteneur.',
            },
          ]}
        />
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Une entree est soit un separateur{' '}
          <code className="o-font-mono o-text-xs">{`{ type: 'separator' }`}</code>, soit
          une action <code className="o-font-mono o-text-xs">DropdownMenuAction</code> :
        </p>
        <PropsTable
          rows={[
            {
              name: 'id',
              type: 'string',
              description: "Identifiant unique de l'action.",
            },
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Libelle affiche.',
            },
            {
              name: 'icon',
              type: 'ReactNode',
              description: 'Icone decorative placee avant le libelle.',
            },
            {
              name: 'shortcut',
              type: 'string',
              description: 'Raccourci clavier affiche a droite. Purement indicatif.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: "Rend l'action inactivable.",
            },
            {
              name: 'danger',
              type: 'boolean',
              description: 'Signale une action destructrice.',
            },
            {
              name: 'onSelect',
              type: '() => void',
              description: 'Appele a la selection.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
