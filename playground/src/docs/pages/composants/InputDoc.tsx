/** Documentation du composant Input. @module */

import { type ReactElement } from 'react'

import { Input, inputClasses } from 'odoro-libs/ui'

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
  size: 'md',
  hideLabel: false,
  disabled: false,
  hint: '',
}

/** Page de documentation du composant Input. */
export function InputDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Input"
        lead="Champ de saisie avec libelle, aide et message d'erreur. Le libelle, l'aide et l'erreur sont relies au champ par id / aria-describedby : rien a cabler cote appelant."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Adresse e-mail' },
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'hideLabel', type: 'boolean', defaultValue: false },
            { name: 'disabled', type: 'boolean', defaultValue: false },
            { name: 'hint', type: 'text', defaultValue: '' },
          ]}
          render={(v) => (
            <Input
              label={String(v.label)}
              size={v.size as 'sm' | 'md' | 'lg'}
              hideLabel={v.hideLabel as boolean}
              disabled={v.disabled as boolean}
              hint={v.hint === '' ? undefined : String(v.hint)}
              placeholder="vous@exemple.fr"
              wrapperClassName="o-w-72"
            />
          )}
          code={(v) =>
            `<Input label="${String(v.label)}"${jsxProps(
              {
                size: v.size,
                hideLabel: v.hideLabel,
                disabled: v.disabled,
                hint: v.hint,
              },
              DEFAUTS,
            )} />`
          }
        />
      </Section>

      <Section
        title="Etat d'erreur"
        lead="La presence d'error met le champ en etat invalide (aria-invalid) et remplace l'aide dans la description annoncee. Le message est annonce des son apparition grace a role=alert."
      >
        <DemoBlock
          code={`<Input
  label="Adresse e-mail"
  type="email"
  defaultValue="samy@exemple"
  error="L'adresse e-mail est incomplete."
/>`}
        >
          <Input
            label="Adresse e-mail"
            type="email"
            defaultValue="samy@exemple"
            error="L'adresse e-mail est incomplete."
            wrapperClassName="o-w-72"
          />
        </DemoBlock>
      </Section>

      <Section
        title="Types natifs"
        lead="Toutes les props natives de <input> sont transmises : type, autoComplete, placeholder..."
      >
        <DemoBlock
          code={`<Input
  label="Adresse e-mail"
  type="email"
  autoComplete="email"
  hint="Nous ne la partagerons jamais."
/>
<Input
  label="Mot de passe"
  type="password"
  autoComplete="current-password"
/>`}
        >
          <div className="o-flex o-flex-col o-gap-4 o-w-72">
            <Input
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              hint="Nous ne la partagerons jamais."
            />
            <Input label="Mot de passe" type="password" autoComplete="current-password" />
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Habiller un element natif"
        lead="inputClasses expose l'habillage du champ pour styler un element non couvert par les composants, sans dupliquer la table de variantes."
      >
        <DemoBlock
          code={`import { inputClasses } from 'odoro-libs/ui'

<input
  type="search"
  aria-label="Rechercher"
  placeholder="Rechercher..."
  className={inputClasses({ size: 'sm' })}
/>`}
        >
          <input
            type="search"
            aria-label="Rechercher"
            placeholder="Rechercher..."
            className={`${inputClasses({ size: 'sm' })} o-w-72`}
          />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'label',
              type: 'ReactNode',
              description:
                'Libelle du champ. Obligatoire : un champ sans libelle est inutilisable.',
            },
            {
              name: 'hideLabel',
              type: 'boolean',
              defaultValue: 'false',
              description:
                "Masque visuellement le libelle sans le retirer de l'arbre d'accessibilite.",
            },
            {
              name: 'hint',
              type: 'ReactNode',
              description: "Texte d'aide affiche sous le champ.",
            },
            {
              name: 'error',
              type: 'ReactNode',
              description:
                "Message d'erreur. Sa presence met le champ en etat invalide et remplace l'aide dans la description annoncee.",
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
              description: "Classes additionnelles appliquees a l'element <input>.",
            },
            {
              name: 'wrapperClassName',
              type: 'string',
              description: 'Classes additionnelles appliquees au conteneur.',
            },
            {
              name: 'ref',
              type: 'Ref<HTMLInputElement>',
              description: "Ref vers l'element natif.",
            },
          ]}
        />
        <Callout>
          Toutes les autres props natives de{' '}
          <code className="o-font-mono o-text-sm">&lt;input&gt;</code> (type, placeholder,
          autoComplete, value, onChange...) sont transmises telles quelles.
        </Callout>
      </Section>
    </article>
  )
}
