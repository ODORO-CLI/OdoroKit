/** Documentation du composant Checkbox. @module */

import { type ReactElement, useState } from 'react'

import { Checkbox } from 'odoro-libs/ui'

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
  disabled: false,
  indeterminate: false,
}

/** Liste de taches a etat local : chaque case est controlee. */
function ListeTaches(): ReactElement {
  const [faites, setFaites] = useState<readonly boolean[]>([true, false, false])

  const basculer = (index: number): void => {
    setFaites((courantes) => courantes.map((faite, i) => (i === index ? !faite : faite)))
  }

  return (
    <div className="o-flex o-flex-col o-gap-2">
      {['Relire le billet', 'Publier le billet', 'Archiver le brouillon'].map(
        (tache, index) => (
          <Checkbox
            key={tache}
            label={tache}
            checked={faites[index]}
            onChange={() => basculer(index)}
          />
        ),
      )}
    </div>
  )
}

/** Case parente indeterminee tant que la selection est partielle. */
function ToutSelectionner(): ReactElement {
  const [cochees, setCochees] = useState<readonly boolean[]>([true, false, false])
  const toutes = cochees.every(Boolean)
  const aucune = cochees.every((cochee) => !cochee)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <Checkbox
        label="Tout selectionner"
        checked={toutes}
        indeterminate={!toutes && !aucune}
        onChange={() => setCochees(cochees.map(() => !toutes))}
      />
      <div className="o-flex o-flex-col o-gap-2 o-pl-6">
        {['Facture de janvier', 'Facture de fevrier', 'Facture de mars'].map(
          (facture, index) => (
            <Checkbox
              key={facture}
              label={facture}
              checked={cochees[index]}
              onChange={() =>
                setCochees(cochees.map((cochee, i) => (i === index ? !cochee : cochee)))
              }
            />
          ),
        )}
      </div>
    </div>
  )
}

/** Page de documentation du composant Checkbox. */
export function CheckboxDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Checkbox"
        lead="Case a cocher dessinee au-dessus de l'input natif. L'input reste dans la page (masque par o-sr-only) : clavier, formulaires et lecteurs d'ecran passent par lui ; la boite visible n'est qu'un dessin aria-hidden."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Se souvenir de moi' },
            { name: 'description', type: 'text', defaultValue: '' },
            { name: 'disabled', type: 'boolean', defaultValue: false },
            { name: 'indeterminate', type: 'boolean', defaultValue: false },
          ]}
          render={(v) => (
            <Checkbox
              label={String(v.label)}
              description={v.description === '' ? undefined : String(v.description)}
              disabled={v.disabled as boolean}
              indeterminate={v.indeterminate as boolean}
            />
          )}
          code={(v) =>
            `<Checkbox label="${String(v.label)}"${jsxProps(
              {
                description: v.description,
                disabled: v.disabled,
                indeterminate: v.indeterminate,
              },
              DEFAUTS,
            )} />`
          }
        />
      </Section>

      <Section
        title="Groupe de cases"
        lead="Chaque case est un champ independant : un groupe se construit en mode controle, avec un etat local qui porte la liste."
      >
        <DemoBlock
          code={`function ListeTaches() {
  const [faites, setFaites] = useState([true, false, false])

  const basculer = (index) =>
    setFaites((courantes) =>
      courantes.map((faite, i) => (i === index ? !faite : faite)),
    )

  return (
    <div className="o-flex o-flex-col o-gap-2">
      {['Relire le billet', 'Publier le billet', 'Archiver le brouillon'].map(
        (tache, index) => (
          <Checkbox
            key={tache}
            label={tache}
            checked={faites[index]}
            onChange={() => basculer(index)}
          />
        ),
      )}
    </div>
  )
}`}
        >
          <ListeTaches />
        </DemoBlock>
      </Section>

      <Section
        title="Etat indetermine"
        lead="indeterminate est purement visuel et ARIA : il ne change pas la valeur soumise, et un clic repasse par le cycle natif coche / decoche. L'usage type : une case parente « tout selectionner » pilotee par l'etat de ses enfants."
      >
        <DemoBlock
          code={`function ToutSelectionner() {
  const [cochees, setCochees] = useState([true, false, false])
  const toutes = cochees.every(Boolean)
  const aucune = cochees.every((cochee) => !cochee)

  return (
    <>
      <Checkbox
        label="Tout selectionner"
        checked={toutes}
        indeterminate={!toutes && !aucune}
        onChange={() => setCochees(cochees.map(() => !toutes))}
      />
      {factures.map((facture, index) => (
        <Checkbox
          key={facture}
          label={facture}
          checked={cochees[index]}
          onChange={() =>
            setCochees(cochees.map((c, i) => (i === index ? !c : c)))
          }
        />
      ))}
    </>
  )
}`}
        >
          <ToutSelectionner />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'label',
              type: 'ReactNode',
              description:
                'Libelle de la case. Obligatoire : une case sans libelle est inutilisable.',
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Complement affiche sous le libelle.',
            },
            {
              name: 'indeterminate',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Etat intermediaire (« certains elements coches »). Purement visuel et ARIA : il ne change pas la valeur soumise, et un clic repasse par le cycle natif coche / decoche.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles appliquees a la boite dessinee.',
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
          <code className="o-font-mono o-text-sm">&lt;input type="checkbox"&gt;</code>{' '}
          (checked, defaultChecked, onChange, disabled, name, value...) sont transmises
          telles quelles.
        </Callout>
      </Section>
    </article>
  )
}
