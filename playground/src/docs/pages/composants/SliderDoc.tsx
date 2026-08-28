/** Documentation du composant Slider. @module */

import { type ReactElement } from 'react'

import { Slider } from 'odoro-libs/ui'

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
  showValue: false,
  disabled: false,
  min: 0,
  max: 100,
  step: 1,
}

/** Page de documentation du composant Slider. */
export function SliderDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Slider"
        lead="Curseur de valeur numerique sur une plage. S'appuie sur l'input natif type='range' : clavier, tactile et lecteurs d'ecran sont pris en charge par le navigateur ; la couleur vient de accent-color."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Volume' },
            { name: 'showValue', type: 'boolean', defaultValue: true },
            { name: 'disabled', type: 'boolean', defaultValue: false },
            { name: 'min', type: 'number', defaultValue: 0 },
            { name: 'max', type: 'number', defaultValue: 100 },
            { name: 'step', type: 'number', defaultValue: 1, min: 1 },
          ]}
          render={(v) => (
            <Slider
              key={`${Number(v.min)}-${Number(v.max)}-${Number(v.step)}`}
              label={String(v.label)}
              showValue={v.showValue as boolean}
              disabled={v.disabled as boolean}
              min={Number(v.min)}
              max={Number(v.max)}
              step={Number(v.step)}
              wrapperClassName="o-w-72"
            />
          )}
          code={(v) =>
            `<Slider label="${String(v.label)}"${jsxProps(
              {
                showValue: v.showValue,
                disabled: v.disabled,
                min: v.min,
                max: v.max,
                step: v.step,
              },
              DEFAUTS,
            )} />`
          }
        />
      </Section>

      <Section
        title="Mise en forme de la valeur"
        lead="formatValue met en forme la valeur affichee par showValue : pourcentage, monnaie, duree... La valeur est rendue en chiffres tabulaires pour que la largeur ne tressaute pas pendant le glissement."
      >
        <DemoBlock
          code={`<Slider
  label="Luminosite"
  defaultValue={70}
  showValue
  formatValue={(value) => \`\${value} %\`}
/>
<Slider
  label="Budget"
  min={0}
  max={2000}
  step={50}
  defaultValue={800}
  showValue
  formatValue={(value) => \`\${value} EUR\`}
/>`}
        >
          <div className="o-flex o-flex-col o-gap-6 o-w-72">
            <Slider
              label="Luminosite"
              defaultValue={70}
              showValue
              formatValue={(value) => `${value} %`}
            />
            <Slider
              label="Budget"
              min={0}
              max={2000}
              step={50}
              defaultValue={800}
              showValue
              formatValue={(value) => `${value} EUR`}
            />
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Etat d'erreur"
        lead="La presence d'error met le curseur en etat invalide : la piste passe au registre danger et le message remplace l'aide dans la description annoncee."
      >
        <DemoBlock
          code={`<Slider
  label="Nombre d'invites"
  min={0}
  max={20}
  defaultValue={18}
  showValue
  error="La salle est limitee a 12 personnes."
/>`}
        >
          <Slider
            label="Nombre d'invites"
            min={0}
            max={20}
            defaultValue={18}
            showValue
            error="La salle est limitee a 12 personnes."
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
                'Libelle du curseur. Obligatoire : un champ sans libelle est inutilisable.',
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
              description: "Texte d'aide affiche sous le curseur.",
            },
            {
              name: 'error',
              type: 'ReactNode',
              description:
                "Message d'erreur. Sa presence met le curseur en etat invalide et remplace l'aide dans la description annoncee.",
            },
            {
              name: 'min',
              type: 'number',
              defaultValue: '0',
              description: 'Borne basse.',
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: '100',
              description: 'Borne haute.',
            },
            {
              name: 'step',
              type: 'number',
              defaultValue: '1',
              description: "Pas d'incrementation.",
            },
            { name: 'value', type: 'number', description: 'Valeur en mode controle.' },
            {
              name: 'defaultValue',
              type: 'number',
              defaultValue: 'le milieu de la plage',
              description: 'Valeur initiale en mode non controle.',
            },
            {
              name: 'showValue',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Affiche la valeur courante a droite du libelle. En chiffres tabulaires : la largeur ne tressaute pas pendant le glissement.',
            },
            {
              name: 'formatValue',
              type: '(value: number) => string',
              defaultValue: 'String',
              description: 'Met en forme la valeur affichee par showValue.',
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
          <code className="o-font-mono o-text-sm">&lt;input type="range"&gt;</code>{' '}
          (onChange, name, list...) sont transmises telles quelles.
        </Callout>
      </Section>
    </article>
  )
}
