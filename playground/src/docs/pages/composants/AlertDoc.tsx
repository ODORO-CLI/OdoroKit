/** Documentation du composant Alert. @module */

import { type ReactElement, useState } from 'react'

import { Alert, type AlertTone, Button } from '@odoro/libs/ui'

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
  tone: 'info',
}

/** Encart fermable, remonte a la demande : l'etat vit chez l'appelant. */
function AlerteFermable(): ReactElement {
  const [visible, setVisible] = useState(true)

  return (
    <div className="o-flex o-flex-col o-items-stretch o-gap-4 o-w-full o-max-w-md">
      {visible ? (
        <Alert tone="success" title="Enregistre" onClose={() => setVisible(false)}>
          Le projet a bien ete enregistre.
        </Alert>
      ) : (
        <Button tone="secondary" size="sm" onClick={() => setVisible(true)}>
          Remonter l'encart
        </Button>
      )}
    </div>
  )
}

/** Documentation du composant Alert. */
export function AlertDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Alert"
        lead="Encart de message contextuel en quatre registres, avec icone assortie, titre optionnel et fermeture animee."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'tone',
              type: 'select',
              options: ['info', 'success', 'warning', 'danger'],
              defaultValue: 'info',
            },
            { name: 'title', label: 'titre', type: 'text', defaultValue: 'Bon a savoir' },
          ]}
          render={(v) => (
            <Alert
              tone={v.tone as AlertTone}
              title={v.title as string}
              className="o-max-w-md"
            >
              Le brouillon est enregistre automatiquement toutes les minutes.
            </Alert>
          )}
          code={(v) => `<Alert${jsxProps(
            { tone: v.tone } as Record<string, ControlValue>,
            DEFAUTS,
          )} title="${String(v.title)}">
  Le brouillon est enregistre automatiquement toutes les minutes.
</Alert>`}
        />
        <Callout>
          Le registre <code className="o-font-mono o-text-sm">danger</code> porte{' '}
          <code className="o-font-mono o-text-sm">role="alert"</code>, qui interrompt la
          lecture en cours ; les autres registres se contentent de{' '}
          <code className="o-font-mono o-text-sm">role="status"</code>.
        </Callout>
      </Section>

      <Section
        title="Encart fermable"
        lead="Avec onClose, un bouton de fermeture apparait ; l'encart joue son animation de sortie puis invoque le rappel — c'est a l'appelant de le retirer de son arbre."
      >
        <DemoBlock
          code={`function AlerteFermable() {
  const [visible, setVisible] = useState(true)

  return visible ? (
    <Alert tone="success" title="Enregistre" onClose={() => setVisible(false)}>
      Le projet a bien ete enregistre.
    </Alert>
  ) : (
    <Button tone="secondary" size="sm" onClick={() => setVisible(true)}>
      Remonter l'encart
    </Button>
  )
}`}
        >
          <AlerteFermable />
        </DemoBlock>
      </Section>

      <Section
        title="Icone personnalisee ou retiree"
        lead="Sans icon, une icone par defaut assortie au registre est affichee. Fournissez un element pour la remplacer, ou null pour n'en afficher aucune."
      >
        <DemoBlock
          code={`<Alert
  tone="info"
  title="Astuce"
  icon={
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" aria-hidden="true"
      className="o-shrink-0 o-text-sky-600 dark:o-text-sky-400">
      <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.5 1.6 1.5 2.5h5c0-.9.7-1.8 1.5-2.5A6 6 0 0 0 12 3Z" />
      <path d="M10 19h4" strokeLinecap="round" />
    </svg>
  }
>
  Une icone sur mesure remplace celle du registre.
</Alert>

<Alert tone="info" icon={null} title="Sans icone">
  La prop icon a null retire toute icone.
</Alert>`}
        >
          <div className="o-flex o-flex-col o-gap-4 o-w-full o-max-w-md">
            <Alert
              tone="info"
              title="Astuce"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                  className="o-shrink-0 o-text-sky-600 dark:o-text-sky-400"
                >
                  <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.5 1.6 1.5 2.5h5c0-.9.7-1.8 1.5-2.5A6 6 0 0 0 12 3Z" />
                  <path d="M10 19h4" strokeLinecap="round" />
                </svg>
              }
            >
              Une icone sur mesure remplace celle du registre.
            </Alert>
            <Alert tone="info" icon={null} title="Sans icone">
              La prop icon a null retire toute icone.
            </Alert>
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'tone',
              type: "'info' | 'success' | 'warning' | 'danger'",
              defaultValue: "'info'",
              description: 'Registre visuel.',
            },
            {
              name: 'title',
              type: 'ReactNode',
              description: 'Titre court, en gras au-dessus du corps.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Corps du message.',
            },
            {
              name: 'icon',
              type: 'ReactNode',
              description:
                "Icone en tete d'encart. Non fournie : une icone par defaut assortie au registre. null : aucune icone.",
            },
            {
              name: 'onClose',
              type: '() => void',
              description:
                "Rend l'encart fermable : un bouton de fermeture apparait et l'encart disparait avec une animation de sortie avant que ce rappel ne soit invoque.",
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
