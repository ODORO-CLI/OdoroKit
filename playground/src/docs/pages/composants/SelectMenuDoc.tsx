/**
 * SelectMenu : la liste deroulante riche.
 *
 * @module
 */

import { SelectMenu } from '@odoro-cli/libs/ui'
import { useState, type ReactElement } from 'react'

import { CodeBlock } from '../../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../../components/DocBlocks.jsx'
import {
  type ControlValue,
  PlaygroundBlock,
  jsxProps,
} from '../../components/PlaygroundBlock.jsx'

/** Valeurs par defaut des props pilotees par l'aire de jeu. */
const DEFAUTS: Record<string, ControlValue> = {
  searchable: false,
  disabled: false,
  placeholder: 'Choisir…',
}

/** Options d'exemple, avec descriptions et etats. */
const ENVIRONNEMENTS = [
  { value: 'prod', label: 'Production', description: 'Trafic reel, aucune reprise' },
  { value: 'staging', label: 'Recette', description: 'Copie de production' },
  { value: 'preview', label: 'Previsualisation', description: 'Une par proposition' },
  { value: 'local', label: 'Local', description: 'Votre machine' },
  { value: 'archive', label: 'Archive', description: 'Lecture seule', disabled: true },
] as const

/** Petite pastille decorative, pour les options a icone. */
function PointIcon(): ReactElement {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className="o-text-brand-600 dark:o-text-brand-400"
    >
      <circle cx="5" cy="5" r="5" fill="currentColor" />
    </svg>
  )
}

/** Demonstration reglable : l'etat de la valeur vit ici. */
function Demo({
  label,
  searchable,
  disabled,
  placeholder,
}: {
  label: string
  searchable: boolean
  disabled: boolean
  placeholder: string
}): ReactElement {
  const [value, setValue] = useState<string | null>('staging')

  return (
    <div className="o-w-72">
      <SelectMenu
        label={label}
        name="environnement"
        searchable={searchable}
        disabled={disabled}
        placeholder={placeholder}
        options={[...ENVIRONNEMENTS]}
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}

/** Page du composant SelectMenu. */
export function SelectMenuDoc(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="SelectMenu"
        lead="Une liste deroulante riche : icones, descriptions, recherche. Pour ce que le select natif ne permet pas — et seulement pour cela."
      />

      <Callout tone="warning">
        <strong>Prenez `Select` par defaut.</strong> Il habille un `select` natif, et
        herite donc du menu du systeme, de la saisie au clavier, du comportement sur
        mobile, et de l impossibilite de se desynchroniser d un formulaire. Ce
        composant-ci reconstruit tout cela a la main : ne le choisissez que si vous avez
        besoin d options riches ou d une recherche.
      </Callout>

      <Section
        title="Apercu"
        lead="Le champ de recherche prend le focus a l'ouverture. Les fleches deplacent l'option active, Entree la choisit, Echap ferme."
      >
        <PlaygroundBlock
          previewClassName="o-min-h-72 o-items-start"
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Environnement' },
            { name: 'searchable', type: 'boolean', defaultValue: false },
            { name: 'disabled', type: 'boolean', defaultValue: false },
            { name: 'placeholder', type: 'text', defaultValue: 'Choisir…' },
          ]}
          render={(v) => (
            <Demo
              label={String(v.label)}
              searchable={v.searchable as boolean}
              disabled={v.disabled as boolean}
              placeholder={String(v.placeholder)}
            />
          )}
          code={(v) =>
            `<SelectMenu
  label="${String(v.label)}"
  name="environnement"${jsxProps(
    { searchable: v.searchable, disabled: v.disabled, placeholder: v.placeholder },
    DEFAUTS,
  )}
  options={[
    { value: 'prod', label: 'Production', description: 'Trafic reel' },
    { value: 'staging', label: 'Recette' },
    { value: 'archive', label: 'Archive', disabled: true },
  ]}
  value={env}
  onValueChange={setEnv}
/>`
          }
          variants={[
            {
              title: 'Avec recherche',
              description: 'Filtre les options a la frappe.',
              values: { searchable: true },
            },
            { title: 'Desactive', values: { disabled: true } },
            {
              title: 'Avec erreur',
              description: 'error marque le champ comme invalide.',
              node: (
                <div className="o-w-full">
                  <SelectMenu
                    label="Environnement"
                    placeholder="Choisir un environnement"
                    options={[...ENVIRONNEMENTS]}
                    value={null}
                    error="L'environnement est obligatoire."
                  />
                </div>
              ),
            },
            {
              title: 'Avec icones',
              description: 'Chaque option peut porter un element decoratif.',
              node: (
                <div className="o-w-full">
                  <SelectMenu
                    label="Region"
                    options={[
                      { value: 'eu', label: "Europe de l'Ouest", icon: <PointIcon /> },
                      { value: 'us', label: 'Amerique du Nord', icon: <PointIcon /> },
                      { value: 'ap', label: 'Asie-Pacifique', icon: <PointIcon /> },
                    ]}
                    value="eu"
                  />
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Section
        title="Ce qui est reconstruit"
        lead="Le motif combobox de l'ARIA, entierement — c'est la partie que la plupart des implementations oublient a moitie."
      >
        <PropsTable
          rows={[
            {
              name: 'aria-activedescendant',
              type: 'sur le champ',
              description:
                'Designe l option active sans deplacer le focus, qui doit rester dans le champ pour que la frappe continue d y arriver.',
            },
            {
              name: 'Fleches, Origine, Fin',
              type: 'clavier',
              description:
                'Deplacent l option active en sautant les options desactivees. La liste defile pour la garder visible.',
            },
            {
              name: 'input hidden',
              type: 'formulaire',
              description:
                'Porte la valeur. Un formulaire ordinaire la soumet sans savoir que le champ n est pas un select.',
            },
            {
              name: 'pointerdown',
              type: 'fermeture',
              description:
                'La fermeture au clic exterieur ecoute l appui, pas le relachement : sinon le menu resterait ouvert pendant tout un glissement commence ailleurs.',
            },
          ]}
        />
      </Section>

      <Section title="Proprietes">
        <PropsTable
          rows={[
            {
              name: 'options',
              type: 'readonly SelectMenuOption[]',
              description:
                'value, label, et facultativement description, icon, disabled.',
            },
            { name: 'value', type: 'string | null', description: 'Valeur choisie.' },
            {
              name: 'onValueChange',
              type: '(value: string) => void',
              description: 'Appele quand la valeur change.',
            },
            {
              name: 'name',
              type: 'string',
              defaultValue: '—',
              description: 'Nom du champ, pour la soumission.',
            },
            {
              name: 'searchable',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Affiche un champ de recherche.',
            },
            {
              name: 'error',
              type: 'string',
              defaultValue: '—',
              description: 'Sa presence marque le champ comme invalide.',
            },
          ]}
        />

        <CodeBlock
          code={`<SelectMenu
  label="Environnement"
  name="environnement"
  searchable
  options={[
    { value: 'prod', label: 'Production', description: 'Trafic reel' },
    { value: 'archive', label: 'Archive', disabled: true },
  ]}
  value={env}
  onValueChange={setEnv}
/>`}
        />
      </Section>
    </>
  )
}
