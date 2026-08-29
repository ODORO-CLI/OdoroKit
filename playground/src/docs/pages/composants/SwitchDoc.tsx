/** Documentation du composant Switch. @module */

import { type ReactElement, useState } from 'react'

import { Switch } from '@odoro/libs/ui'

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

/** Valeurs par defaut des props pilotees par l'aire de jeu. */
const DEFAUTS: Record<string, ControlValue> = {
  description: '',
  size: 'md',
  disabled: false,
}

/** Interrupteur controle : l'etat vit chez le parent et s'affiche en dessous. */
function InterrupteurControle(): ReactElement {
  const [actif, setActif] = useState(true)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <Switch label="Sauvegarde automatique" checked={actif} onCheckedChange={setActif} />
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        Etat :{' '}
        <code className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400">
          {actif ? 'active' : 'desactive'}
        </code>
      </p>
    </div>
  )
}

/** Page de documentation du composant Switch. */
export function SwitchDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Switch"
        lead="Interrupteur a deux etats. Un <button role='switch'> plutot qu'une case a cocher : l'effet est immediat, sans notion de formulaire a soumettre. L'etat est porte par aria-checked, la bascule repond au clic comme a Espace ou Entree."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Notifications' },
            { name: 'description', type: 'text', defaultValue: '' },
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'disabled', type: 'boolean', defaultValue: false },
          ]}
          render={(v) => (
            <Switch
              label={String(v.label)}
              description={v.description === '' ? undefined : String(v.description)}
              size={v.size as 'sm' | 'md' | 'lg'}
              disabled={v.disabled as boolean}
              defaultChecked
            />
          )}
          code={(v) =>
            `<Switch label="${String(v.label)}"${jsxProps(
              { description: v.description, size: v.size, disabled: v.disabled },
              DEFAUTS,
            )} defaultChecked />`
          }
        />
      </Section>

      <Section
        title="Mode controle"
        lead="Fournissez checked et onCheckedChange pour piloter l'etat depuis le parent ; sans checked, l'interrupteur gere son propre etat (defaultChecked)."
      >
        <DemoBlock
          code={`function InterrupteurControle() {
  const [actif, setActif] = useState(true)

  return (
    <>
      <Switch
        label="Sauvegarde automatique"
        checked={actif}
        onCheckedChange={setActif}
      />
      <p>Etat : {actif ? 'active' : 'desactive'}</p>
    </>
  )
}`}
        >
          <InterrupteurControle />
        </DemoBlock>
      </Section>

      <Section
        title="Liste de reglages"
        lead="L'usage type : une liste de preferences a effet immediat, chaque ligne separee de la suivante."
      >
        <DemoBlock
          code={`<div className="o-flex o-flex-col o-w-full o-max-w-sm">
  <div className="o-py-3 o-border-b o-border-zinc-100 dark:o-border-zinc-900">
    <Switch
      label="Notifications"
      description="Recevoir un courriel a chaque commentaire."
      defaultChecked
    />
  </div>
  <div className="o-py-3 o-border-b o-border-zinc-100 dark:o-border-zinc-900">
    <Switch label="Resume hebdomadaire" defaultChecked />
  </div>
  <div className="o-py-3">
    <Switch label="Sons de l'interface" />
  </div>
</div>`}
        >
          <div className="o-flex o-flex-col o-w-full o-max-w-sm">
            <div className="o-py-3 o-border-b o-border-zinc-100 dark:o-border-zinc-900">
              <Switch
                label="Notifications"
                description="Recevoir un courriel a chaque commentaire."
                defaultChecked
              />
            </div>
            <div className="o-py-3 o-border-b o-border-zinc-100 dark:o-border-zinc-900">
              <Switch label="Resume hebdomadaire" defaultChecked />
            </div>
            <div className="o-py-3">
              <Switch label="Sons de l'interface" />
            </div>
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'label',
              type: 'ReactNode',
              description:
                "Libelle de l'interrupteur, rendu a cote et clicable. Obligatoire.",
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Complement affiche sous le libelle.',
            },
            {
              name: 'checked',
              type: 'boolean',
              description: 'Etat en mode controle.',
            },
            {
              name: 'defaultChecked',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Etat initial en mode non controle.',
            },
            {
              name: 'onCheckedChange',
              type: '(checked: boolean) => void',
              description: 'Appele avec le nouvel etat a chaque bascule.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description: 'Taille.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles appliquees a la piste.',
            },
            {
              name: 'wrapperClassName',
              type: 'string',
              description: 'Classes additionnelles appliquees au conteneur.',
            },
            {
              name: 'ref',
              type: 'Ref<HTMLButtonElement>',
              description: "Ref vers l'element natif.",
            },
          ]}
        />
        <Callout>
          La piste est aussi exposee via{' '}
          <code className="o-font-mono o-text-sm">switchClasses</code> pour composer un
          interrupteur sur mesure sans dupliquer la table de variantes.
        </Callout>
      </Section>
    </article>
  )
}
