/**
 * Documentation de ToastProvider et useToast.
 *
 * @module
 */

import { type ReactElement, useRef } from 'react'

import { Button, useToast, type ToastTone } from '@odoro-cli/libs/ui'

import { CodeBlock } from '../../components/CodeBlock.jsx'
import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'

/** Libelles de demonstration par registre. */
const TONE_LABELS: Readonly<Record<ToastTone, string>> = {
  info: 'Nouvelle version disponible',
  success: 'Projet enregistre',
  warning: 'Quota bientot atteint',
  danger: 'Echec de la sauvegarde',
}

/** Demonstration des quatre registres. */
function TonesDemo(): ReactElement {
  const { toast } = useToast()
  return (
    <div className="o-flex o-flex-wrap o-items-center o-gap-3">
      {(Object.keys(TONE_LABELS) as ToastTone[]).map((tone) => (
        <Button
          key={tone}
          tone="secondary"
          size="sm"
          onClick={() => toast({ title: TONE_LABELS[tone], tone })}
        >
          {tone}
        </Button>
      ))}
    </div>
  )
}

/** Demonstration : notification persistante, fermeture par identifiant, clear. */
function LifecycleDemo(): ReactElement {
  const { toast, dismiss, clear } = useToast()
  const lastId = useRef<string | null>(null)

  return (
    <div className="o-flex o-flex-wrap o-items-center o-gap-3">
      <Button
        tone="secondary"
        size="sm"
        onClick={() => {
          lastId.current = toast({
            title: 'Notification persistante',
            description: "duration: 0 — elle reste jusqu'a fermeture explicite.",
            duration: 0,
          })
        }}
      >
        Persistante (duration 0)
      </Button>
      <Button
        tone="secondary"
        size="sm"
        onClick={() => {
          if (lastId.current !== null) dismiss(lastId.current)
        }}
      >
        dismiss(id)
      </Button>
      <Button tone="ghost" size="sm" onClick={clear}>
        clear()
      </Button>
    </div>
  )
}

/** Documentation de ToastProvider et useToast. */
export function ToastDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Toast"
        lead="Notifications empilables. ToastProvider fournit la file et la region d'affichage ; useToast expose l'API pour empiler, fermer et vider."
      />

      <Section
        title="Mise en place"
        lead="Enveloppez l'application une seule fois ; chaque composant accede ensuite a la file via useToast."
      >
        <CodeBlock
          code={`import { ToastProvider, useToast } from '@odoro-cli/libs/ui'

// A la racine :
<ToastProvider>
  <App />
</ToastProvider>

// Dans un composant :
const { toast, dismiss, clear, toasts } = useToast()
toast({ title: 'Projet enregistre', tone: 'success' })`}
        />
        <Callout tone="warning">
          <code className="o-font-mono o-text-sm">useToast()</code> leve une erreur hors
          d'un <code className="o-font-mono o-text-sm">&lt;ToastProvider&gt;</code>. La
          region porte <code className="o-font-mono o-text-sm">aria-live="polite"</code> ;
          les notifications en registre{' '}
          <code className="o-font-mono o-text-sm">danger</code> passent en{' '}
          <code className="o-font-mono o-text-sm">role="alert"</code>, qui interrompt la
          lecture en cours.
        </Callout>
      </Section>

      <Section
        title="Les quatre registres"
        lead="Chaque bouton empile une notification du ton correspondant — elle disparait apres 5 secondes."
      >
        <DemoBlock
          code={`const { toast } = useToast()

toast({ title: 'Nouvelle version disponible', tone: 'info' })
toast({ title: 'Projet enregistre', tone: 'success' })
toast({ title: 'Quota bientot atteint', tone: 'warning' })
toast({ title: 'Echec de la sauvegarde', tone: 'danger' })`}
        >
          <TonesDemo />
        </DemoBlock>
      </Section>

      <Section
        title="Cycle de vie"
        lead="toast() retourne l'identifiant attribue : gardez-le pour fermer la notification par avance avec dismiss(id). clear() vide toute la file."
      >
        <DemoBlock
          code={`const { toast, dismiss, clear } = useToast()

// duration: 0 maintient la notification jusqu'a fermeture explicite.
const id = toast({
  title: 'Notification persistante',
  description: 'Elle reste affichee.',
  duration: 0,
})

dismiss(id) // ferme cette notification
clear()     // ferme toutes les notifications`}
        >
          <LifecycleDemo />
        </DemoBlock>
      </Section>

      <Section title="API de useToast">
        <PropsTable
          rows={[
            {
              name: 'toast(input)',
              type: '(input: ToastInput) => string',
              description:
                "Empile une notification et retourne l'identifiant attribue, utilisable pour la fermer par avance.",
            },
            {
              name: 'dismiss(id)',
              type: '(id: string) => void',
              description: 'Ferme une notification.',
            },
            {
              name: 'clear()',
              type: '() => void',
              description: 'Ferme toutes les notifications.',
            },
            {
              name: 'toasts',
              type: 'readonly Toast[]',
              description:
                'Notifications actuellement affichees, de la plus ancienne a la plus recente.',
            },
          ]}
        />
      </Section>

      <Section title="Props">
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Props de <code className="o-font-mono o-text-xs">ToastProvider</code> :
        </p>
        <PropsTable
          rows={[
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Application.',
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: '4',
              description:
                'Nombre maximum de notifications simultanees. Au-dela, la plus ancienne est retiree.',
            },
            {
              name: 'duration',
              type: 'number',
              defaultValue: '5000',
              description: "Duree d'affichage par defaut, en millisecondes.",
            },
            {
              name: 'className',
              type: 'string',
              description: "Classes additionnelles pour la region d'affichage.",
            },
          ]}
        />
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Champs de <code className="o-font-mono o-text-xs">ToastInput</code>, l'objet
          passe a <code className="o-font-mono o-text-xs">toast()</code> :
        </p>
        <PropsTable
          rows={[
            {
              name: 'title',
              type: 'ReactNode',
              description: 'Titre court.',
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Detail facultatif.',
            },
            {
              name: 'tone',
              type: "'info' | 'success' | 'warning' | 'danger'",
              defaultValue: "'info'",
              description: 'Registre visuel.',
            },
            {
              name: 'duration',
              type: 'number',
              defaultValue: '5000',
              description:
                "Duree d'affichage en millisecondes. 0 maintient la notification jusqu'a fermeture explicite.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
