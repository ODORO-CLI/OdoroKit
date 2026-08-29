/**
 * SelectMenu : la liste deroulante riche.
 *
 * @module
 */

import { SelectMenu } from 'odoro-libs/ui'
import { useState, type ReactElement } from 'react'

import { CodeBlock } from '../../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../../components/DocBlocks.jsx'

/** Options d'exemple, avec descriptions et etats. */
const ENVIRONNEMENTS = [
  { value: 'prod', label: 'Production', description: 'Trafic reel, aucune reprise' },
  { value: 'staging', label: 'Recette', description: 'Copie de production' },
  { value: 'preview', label: 'Previsualisation', description: 'Une par proposition' },
  { value: 'local', label: 'Local', description: 'Votre machine' },
  { value: 'archive', label: 'Archive', description: 'Lecture seule', disabled: true },
] as const

/** Demonstration reglable. */
function Demo({ searchable }: { searchable: boolean }): ReactElement {
  const [value, setValue] = useState<string | null>('staging')

  return (
    <div className="o-flex o-flex-col o-gap-3 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-6">
      <div className="o-max-w-sm">
        <SelectMenu
          label="Environnement"
          name="environnement"
          searchable={searchable}
          options={[...ENVIRONNEMENTS]}
          value={value}
          onValueChange={setValue}
        />
      </div>
      <p className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        valeur soumise : {value ?? '—'}
      </p>
    </div>
  )
}

/** Page du composant SelectMenu. */
export function SelectMenuDoc(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-libs/ui"
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
        title="Avec recherche"
        lead="Le champ de recherche prend le focus a l'ouverture. Les fleches deplacent l'option active, Entree la choisit, Echap ferme."
      >
        <Demo searchable />
      </Section>

      <Section title="Sans recherche" lead="Le meme composant, pour une liste courte.">
        <Demo searchable={false} />
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
