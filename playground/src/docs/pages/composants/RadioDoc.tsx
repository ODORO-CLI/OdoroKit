/** Documentation du composant RadioGroup. @module */

import { type ReactElement, useState } from 'react'

import { RadioGroup } from 'odoro-libs/ui'

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
  orientation: 'vertical',
  itemDisabled: false,
}

/** Groupe controle : la valeur vit chez le parent et s'affiche en dessous. */
function GroupeControle(): ReactElement {
  const [valeur, setValeur] = useState('mensuelle')

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <RadioGroup
        label="Facturation"
        value={valeur}
        onValueChange={setValeur}
        items={[
          { value: 'mensuelle', label: 'Mensuelle' },
          { value: 'annuelle', label: 'Annuelle', description: 'Deux mois offerts.' },
        ]}
      />
      <p className="o-text-sm o-text-fg-muted">
        Valeur selectionnee :{' '}
        <code className="o-font-mono o-text-xs o-text-primary">{valeur}</code>
      </p>
    </div>
  )
}

/** Page de documentation du composant RadioGroup. */
export function RadioDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="RadioGroup"
        lead="Groupe de boutons radio dessines au-dessus des inputs natifs. Le fieldset et sa legend donnent le nom de groupe aux lecteurs d'ecran ; les inputs natifs portent la navigation clavier (fleches, un seul arret de tabulation). Le name commun est genere : deux groupes sur la meme page ne se volent jamais la selection."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Visibilite' },
            {
              name: 'orientation',
              type: 'select',
              options: ['vertical', 'horizontal'],
              defaultValue: 'vertical',
            },
            {
              name: 'itemDisabled',
              label: 'dernier choix desactive',
              type: 'boolean',
              defaultValue: false,
            },
          ]}
          render={(v) => (
            <RadioGroup
              label={String(v.label)}
              orientation={v.orientation as 'vertical' | 'horizontal'}
              defaultValue="prive"
              items={[
                { value: 'prive', label: 'Prive', description: 'Vous seul y accedez.' },
                { value: 'equipe', label: 'Equipe' },
                { value: 'public', label: 'Public', disabled: v.itemDisabled as boolean },
              ]}
            />
          )}
          code={(v) =>
            `<RadioGroup
  label="${String(v.label)}"${jsxProps({ orientation: v.orientation }, DEFAUTS)}
  defaultValue="prive"
  items={[
    { value: 'prive', label: 'Prive', description: 'Vous seul y accedez.' },
    { value: 'equipe', label: 'Equipe' },
    { value: 'public', label: 'Public'${
      v.itemDisabled === true ? ', disabled: true' : ''
    } },
  ]}
/>`
          }
        />
      </Section>

      <Section
        title="Mode controle"
        lead="Fournissez value et onValueChange pour piloter la selection depuis le parent ; sans value, le groupe gere son propre etat (defaultValue)."
      >
        <DemoBlock
          code={`function GroupeControle() {
  const [valeur, setValeur] = useState('mensuelle')

  return (
    <>
      <RadioGroup
        label="Facturation"
        value={valeur}
        onValueChange={setValeur}
        items={[
          { value: 'mensuelle', label: 'Mensuelle' },
          { value: 'annuelle', label: 'Annuelle', description: 'Deux mois offerts.' },
        ]}
      />
      <p>Valeur selectionnee : {valeur}</p>
    </>
  )
}`}
        >
          <GroupeControle />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Libelle du groupe, rendu en <legend>. Obligatoire.',
            },
            {
              name: 'items',
              type: 'readonly RadioItem[]',
              description: "Choix, dans l'ordre d'affichage.",
            },
            {
              name: 'value',
              type: 'string',
              description: 'Valeur selectionnee en mode controle.',
            },
            {
              name: 'defaultValue',
              type: 'string',
              description: 'Valeur initiale en mode non controle.',
            },
            {
              name: 'onValueChange',
              type: '(value: string) => void',
              description: 'Appele avec la nouvelle valeur a chaque selection.',
            },
            {
              name: 'orientation',
              type: "'vertical' | 'horizontal'",
              defaultValue: "'vertical'",
              description: "Sens d'empilement des choix.",
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles appliquees au <fieldset>.',
            },
          ]}
        />
        <p className="o-text-fg-muted o-max-w-prose">
          Chaque entree de <code className="o-font-mono o-text-sm">items</code> est un{' '}
          <code className="o-font-mono o-text-sm">RadioItem</code> :
        </p>
        <PropsTable
          rows={[
            { name: 'value', type: 'string', description: 'Valeur soumise.' },
            { name: 'label', type: 'ReactNode', description: 'Libelle affiche.' },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Complement affiche sous le libelle.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Rend le choix non selectionnable.',
            },
          ]}
        />
        <Callout>
          Le <code className="o-font-mono o-text-sm">name</code> commun des inputs est
          genere automatiquement : inutile de le fournir, meme avec plusieurs groupes sur
          la page.
        </Callout>
      </Section>
    </article>
  )
}
