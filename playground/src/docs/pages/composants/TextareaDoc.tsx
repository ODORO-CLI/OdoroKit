/** Documentation du composant Textarea. @module */

import { type ReactElement } from 'react'

import { Textarea } from '@odoro/libs/ui'

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
  autoResize: false,
  disabled: false,
}

/** Page de documentation du composant Textarea. */
export function TextareaDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Textarea"
        lead="Zone de saisie multiligne. Reprend l'habillage d'Input, mais remplace la hauteur fixe des tailles par une hauteur minimale : un texte long doit pouvoir grandir, a la poignee de redimensionnement ou via autoResize."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            { name: 'label', type: 'text', defaultValue: 'Message' },
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'autoResize', type: 'boolean', defaultValue: false },
            { name: 'disabled', type: 'boolean', defaultValue: false },
          ]}
          render={(v) => (
            <Textarea
              label={String(v.label)}
              size={v.size as 'sm' | 'md' | 'lg'}
              autoResize={v.autoResize as boolean}
              disabled={v.disabled as boolean}
              placeholder="Ecrivez votre message..."
              wrapperClassName="o-w-72"
            />
          )}
          code={(v) =>
            `<Textarea label="${String(v.label)}"${jsxProps(
              { size: v.size, autoResize: v.autoResize, disabled: v.disabled },
              DEFAUTS,
            )} />`
          }
        />
      </Section>

      <Section
        title="Texte d'aide"
        lead="hint affiche une aide sous le champ, reliee par aria-describedby."
      >
        <DemoBlock
          code={`<Textarea
  label="Description"
  hint="Markdown accepte."
  autoResize
/>`}
        >
          <Textarea
            label="Description"
            hint="Markdown accepte."
            autoResize
            wrapperClassName="o-w-72"
          />
        </DemoBlock>
      </Section>

      <Section
        title="Etat d'erreur"
        lead="La presence d'error met le champ en etat invalide et remplace l'aide dans la description annoncee."
      >
        <DemoBlock
          code={`<Textarea
  label="Commentaire"
  defaultValue="ok"
  error="Le commentaire doit faire au moins 10 caracteres."
/>`}
        >
          <Textarea
            label="Commentaire"
            defaultValue="ok"
            error="Le commentaire doit faire au moins 10 caracteres."
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
              name: 'autoResize',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Ajuste la hauteur au contenu a chaque saisie. La hauteur minimale de la taille choisie reste le plancher.',
            },
            {
              name: 'className',
              type: 'string',
              description: "Classes additionnelles appliquees a l'element <textarea>.",
            },
            {
              name: 'wrapperClassName',
              type: 'string',
              description: 'Classes additionnelles appliquees au conteneur.',
            },
            {
              name: 'ref',
              type: 'Ref<HTMLTextAreaElement>',
              description: "Ref vers l'element natif.",
            },
          ]}
        />
        <Callout>
          Toutes les autres props natives de{' '}
          <code className="o-font-mono o-text-sm">&lt;textarea&gt;</code> (rows,
          placeholder, value, onChange...) sont transmises telles quelles.
        </Callout>
      </Section>
    </article>
  )
}
