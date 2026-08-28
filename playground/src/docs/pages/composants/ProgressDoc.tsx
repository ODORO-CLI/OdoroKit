/** Documentation du composant Progress. @module */

import { type ReactElement, useEffect, useState } from 'react'

import { Progress } from 'odoro-libs/ui'

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

/** Valeurs par defaut des props pilotees par le playground. */
const DEFAUTS: Record<string, ControlValue> = {
  value: 0,
  tone: 'primary',
  size: 'md',
  indeterminate: false,
  showValue: false,
}

/** Progression bouclee : la valeur avance par pas de 5 puis repart de zero. */
function ProgressionAnimee(): ReactElement {
  const [valeur, setValeur] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setValeur((v) => (v >= 100 ? 0 : v + 5))
    }, 400)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="o-w-64">
      <Progress value={valeur} label="Progression simulee" showValue />
    </div>
  )
}

/** Documentation du composant Progress. */
export function ProgressDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Progress"
        lead="Barre de progression determinee ou indeterminee, en quatre registres de couleur et trois hauteurs."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'value',
              type: 'number',
              defaultValue: 60,
              min: 0,
              max: 100,
              step: 5,
            },
            {
              name: 'tone',
              type: 'select',
              options: ['primary', 'success', 'warning', 'danger'],
              defaultValue: 'primary',
            },
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'indeterminate', type: 'boolean', defaultValue: false },
            { name: 'showValue', type: 'boolean', defaultValue: false },
          ]}
          render={(v) => (
            <div className="o-w-64">
              <Progress
                value={v.value as number}
                tone={v.tone as 'primary' | 'success' | 'warning' | 'danger'}
                size={v.size as 'sm' | 'md' | 'lg'}
                indeterminate={v.indeterminate as boolean}
                showValue={v.showValue as boolean}
                label="Progression"
              />
            </div>
          )}
          code={(v) => `<Progress${jsxProps(v, DEFAUTS)} label="Progression" />`}
        />
        <Callout>
          Donnez toujours un <code className="o-font-mono o-text-sm">label</code> : c'est
          le libelle que les lecteurs d'ecran annoncent pour la barre.
        </Callout>
      </Section>

      <Section
        title="Progression animee"
        lead="La valeur vit chez l'appelant : un simple etat local incremente par un interval suffit a animer la barre."
      >
        <DemoBlock
          code={`function ProgressionAnimee() {
  const [valeur, setValeur] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setValeur((v) => (v >= 100 ? 0 : v + 5))
    }, 400)
    return () => clearInterval(timer)
  }, [])

  return <Progress value={valeur} label="Progression simulee" showValue />
}`}
        >
          <ProgressionAnimee />
        </DemoBlock>
      </Section>

      <Section
        title="Indeterminee"
        lead="Quand la duree est inconnue, une barre partielle defile en boucle et aria-valuenow est omis, comme le veut ARIA. showValue est sans effet : il n'y a rien a chiffrer."
      >
        <DemoBlock code={`<Progress indeterminate label="Import en cours" />`}>
          <div className="o-w-64">
            <Progress indeterminate label="Import en cours" />
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'value',
              type: 'number',
              defaultValue: '0',
              description: 'Valeur courante, bornee entre 0 et max.',
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: '100',
              description: 'Valeur maximale.',
            },
            {
              name: 'indeterminate',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Progression inconnue : une barre partielle defile en boucle et aria-valuenow est omis.',
            },
            {
              name: 'tone',
              type: "'primary' | 'success' | 'warning' | 'danger'",
              defaultValue: "'primary'",
              description: 'Registre de couleur du remplissage.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description: 'Taille (hauteur de la piste).',
            },
            {
              name: 'label',
              type: 'string',
              description: 'Libelle accessible de la barre.',
            },
            {
              name: 'showValue',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Affiche le pourcentage a droite de la piste. Sans effet en mode indetermine.',
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
