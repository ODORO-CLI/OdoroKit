/** Documentation du composant Select. @module */

import { type ReactElement } from 'react'

import { Select } from 'odoro-libs/ui'

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
  disabled: false,
  placeholder: '',
}

/** Options de la demo. */
const PAYS = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'ch', label: 'Suisse' },
] as const

/** Page de documentation du composant Select. */
export function SelectDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Select"
        lead="Liste deroulante native habillee comme un champ de saisie. Le panneau d'options garde le comportement du systeme (clavier, tactile, lecteurs d'ecran) ; seule la boite fermee est habillee, avec le chevron redessine par-dessus."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Pays' },
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'disabled', type: 'boolean', defaultValue: false },
            { name: 'placeholder', type: 'text', defaultValue: 'Choisir un pays' },
          ]}
          render={(v) => (
            <Select
              label={String(v.label)}
              size={v.size as 'sm' | 'md' | 'lg'}
              disabled={v.disabled as boolean}
              placeholder={v.placeholder === '' ? undefined : String(v.placeholder)}
              options={PAYS}
              wrapperClassName="o-w-72"
            />
          )}
          code={(v) =>
            `<Select
  label="${String(v.label)}"${jsxProps(
    { size: v.size, disabled: v.disabled, placeholder: v.placeholder },
    DEFAUTS,
  )}
  options={[
    { value: 'fr', label: 'France' },
    { value: 'be', label: 'Belgique' },
    { value: 'ch', label: 'Suisse' },
  ]}
/>`
          }
        />
      </Section>

      <Section
        title="Etat d'erreur"
        lead="La presence d'error met le champ en etat invalide et remplace l'aide dans la description annoncee."
      >
        <DemoBlock
          code={`<Select
  label="Pays"
  placeholder="Choisir un pays"
  error="Le pays est obligatoire."
  options={[
    { value: 'fr', label: 'France' },
    { value: 'be', label: 'Belgique' },
  ]}
/>`}
        >
          <Select
            label="Pays"
            placeholder="Choisir un pays"
            error="Le pays est obligatoire."
            options={[
              { value: 'fr', label: 'France' },
              { value: 'be', label: 'Belgique' },
            ]}
            wrapperClassName="o-w-72"
          />
        </DemoBlock>
      </Section>

      <Section
        title="Options desactivees"
        lead="Chaque option peut porter disabled : elle reste visible dans le panneau mais n'est pas selectionnable."
      >
        <DemoBlock
          code={`<Select
  label="Formule"
  defaultValue="pro"
  options={[
    { value: 'gratuit', label: 'Gratuite' },
    { value: 'pro', label: 'Pro' },
    { value: 'entreprise', label: 'Entreprise (bientot)', disabled: true },
  ]}
/>`}
        >
          <Select
            label="Formule"
            defaultValue="pro"
            options={[
              { value: 'gratuit', label: 'Gratuite' },
              { value: 'pro', label: 'Pro' },
              { value: 'entreprise', label: 'Entreprise (bientot)', disabled: true },
            ]}
            wrapperClassName="o-w-72"
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
              name: 'options',
              type: 'readonly SelectOption[]',
              description:
                'Options a afficher. En son absence, les children (<option>, <optgroup>) sont rendus tels quels.',
            },
            {
              name: 'placeholder',
              type: 'string',
              description:
                "Texte affiche tant qu'aucune valeur n'est choisie, rendu comme une option vide et desactivee : elle ne peut pas etre re-selectionnee ensuite.",
            },
            {
              name: 'className',
              type: 'string',
              description: "Classes additionnelles appliquees a l'element <select>.",
            },
            {
              name: 'wrapperClassName',
              type: 'string',
              description: 'Classes additionnelles appliquees au conteneur.',
            },
            {
              name: 'ref',
              type: 'Ref<HTMLSelectElement>',
              description: "Ref vers l'element natif.",
            },
          ]}
        />
        <p className="o-text-fg-muted o-max-w-prose">
          Chaque entree de <code className="o-font-mono o-text-sm">options</code> est un{' '}
          <code className="o-font-mono o-text-sm">SelectOption</code> :
        </p>
        <PropsTable
          rows={[
            { name: 'value', type: 'string', description: 'Valeur soumise.' },
            { name: 'label', type: 'string', description: 'Libelle affiche.' },
            {
              name: 'disabled',
              type: 'boolean',
              description: "Rend l'option non selectionnable.",
            },
          ]}
        />
        <Callout>
          Toutes les autres props natives de{' '}
          <code className="o-font-mono o-text-sm">&lt;select&gt;</code> (value,
          defaultValue, onChange, multiple...) sont transmises telles quelles.
        </Callout>
      </Section>
    </article>
  )
}
