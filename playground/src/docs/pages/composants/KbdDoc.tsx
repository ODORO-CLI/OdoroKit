/** Documentation du composant Kbd. @module */

import { type ReactElement } from 'react'

import { Kbd } from '@odoro-cli/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import { type ControlValue, PlaygroundBlock } from '../../components/PlaygroundBlock.jsx'

/** Decoupe la saisie du playground en tableau de touches. */
function versTouches(valeur: ControlValue | undefined): string[] {
  return String(valeur)
    .split(',')
    .map((touche) => touche.trim())
    .filter((touche) => touche !== '')
}

/** Documentation du composant Kbd. */
export function KbdDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Kbd"
        lead="Touche de clavier, seule ou en combinaison : chaque touche est rendue dans son propre kbd, separee par un +."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'keys',
              label: 'touches (separees par des virgules)',
              type: 'text',
              defaultValue: 'Ctrl,K',
            },
          ]}
          render={(v) => <Kbd keys={versTouches(v.keys)} />}
          code={(v) =>
            `<Kbd keys={[${versTouches(v.keys)
              .map((touche) => `'${touche}'`)
              .join(', ')}]} />`
          }
        />
        <Callout>
          Sans <code className="o-font-mono o-text-sm">keys</code>,{' '}
          <code className="o-font-mono o-text-sm">children</code> remplit un{' '}
          <code className="o-font-mono o-text-sm">kbd</code> unique :{' '}
          <code className="o-font-mono o-text-sm">{'<Kbd>Echap</Kbd>'}</code>.
        </Callout>
      </Section>

      <Section
        title="Dans une phrase"
        lead="La touche se glisse dans un texte courant, a la maniere d'une documentation de raccourcis."
      >
        <DemoBlock
          code={`<p>
  Appuyez sur <Kbd>Echap</Kbd> pour fermer la fenetre, ou sur{' '}
  <Kbd keys={['Ctrl', 'Entree']} /> pour envoyer directement.
</p>`}
        >
          <p className="o-text-sm o-text-zinc-900 dark:o-text-zinc-50 o-max-w-prose">
            Appuyez sur <Kbd>Echap</Kbd> pour fermer la fenetre, ou sur{' '}
            <Kbd keys={['Ctrl', 'Entree']} /> pour envoyer directement.
          </p>
        </DemoBlock>
      </Section>

      <Section
        title="Combinaisons"
        lead="Les combinaisons classiques : recherche rapide et palette de commandes."
      >
        <DemoBlock
          code={`<Kbd keys={['Ctrl', 'K']} />
<Kbd keys={['Cmd', 'Maj', 'P']} />`}
        >
          <div className="o-flex o-items-center o-gap-6">
            <Kbd keys={['Ctrl', 'K']} />
            <Kbd keys={['Cmd', 'Maj', 'P']} />
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'keys',
              type: 'readonly string[]',
              description:
                'Combinaison : chaque touche est rendue dans son propre kbd, separee par un "+". Sans elle, children remplit un kbd unique.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: "Contenu de la touche quand keys n'est pas fournie.",
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
