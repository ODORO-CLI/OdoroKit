/** Documentation du composant Button. @module */

import { type ReactElement } from 'react'

import { Button, buttonClasses } from '@odoro/libs/ui'

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
  tone: 'primary',
  size: 'md',
  block: false,
  loading: false,
  disabled: false,
}

/** Petite icone plus, decorative. */
function PlusIcon(): ReactElement {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

/** Petite icone fleche, decorative. */
function ArrowIcon(): ReactElement {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** Page de documentation du composant Button. */
export function ButtonDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Button"
        lead="Bouton d'action. Le libelle reste visible pendant le chargement ; l'etat est annonce par aria-busy et l'activation est bloquee par aria-disabled, ce qui garde le bouton focusable et donc annoncable."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'tone',
              type: 'select',
              options: ['primary', 'secondary', 'ghost', 'danger'],
              defaultValue: 'primary',
            },
            {
              name: 'size',
              type: 'select',
              options: ['sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'block', type: 'boolean', defaultValue: false },
            { name: 'loading', type: 'boolean', defaultValue: false },
            { name: 'disabled', type: 'boolean', defaultValue: false },
            { name: 'text', label: 'libelle', type: 'text', defaultValue: 'Enregistrer' },
          ]}
          render={(v) => (
            <Button
              tone={v.tone as 'primary' | 'secondary' | 'ghost' | 'danger'}
              size={v.size as 'sm' | 'md' | 'lg'}
              block={v.block as boolean}
              loading={v.loading as boolean}
              disabled={v.disabled as boolean}
            >
              {String(v.text)}
            </Button>
          )}
          code={(v) =>
            `<Button${jsxProps(
              {
                tone: v.tone,
                size: v.size,
                block: v.block,
                loading: v.loading,
                disabled: v.disabled,
              },
              DEFAUTS,
            )}>${String(v.text)}</Button>`
          }
        />
      </Section>

      <Section
        title="Slots decoratifs"
        lead="startSlot et endSlot placent un element avant ou apres le libelle, sans toucher a l'espacement du bouton."
      >
        <DemoBlock
          code={`<Button startSlot={<PlusIcon />}>Nouveau projet</Button>
<Button tone="secondary" endSlot={<ArrowIcon />}>Continuer</Button>`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-gap-3">
            <Button startSlot={<PlusIcon />}>Nouveau projet</Button>
            <Button tone="secondary" endSlot={<ArrowIcon />}>
              Continuer
            </Button>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Habiller un lien"
        lead="buttonClasses expose la table de variantes : un <a> ou un <Link> prend l'apparence exacte du bouton sans en dupliquer les classes."
      >
        <DemoBlock
          code={`import { buttonClasses } from '@odoro/libs/ui'

<Link to="/docs" className={buttonClasses({ tone: 'secondary' })}>
  Lire la documentation
</Link>`}
        >
          <a href="#exemple" className={buttonClasses({ tone: 'secondary' })}>
            Lire la documentation
          </a>
        </DemoBlock>
      </Section>

      <Section
        title="Animation de pression"
        lead="Par defaut, l'activation joue une breve pression (press). Elle se coupe avec press={false}, et se neutralise d'elle-meme sous prefers-reduced-motion."
      >
        <DemoBlock
          code={`<Button>Avec pression</Button>
<Button press={false}>Sans pression</Button>`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-gap-3">
            <Button>Avec pression</Button>
            <Button press={false}>Sans pression</Button>
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'tone',
              type: "'primary' | 'secondary' | 'ghost' | 'danger'",
              defaultValue: "'primary'",
              description: 'Registre visuel.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description: 'Taille.',
            },
            {
              name: 'block',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Occupe toute la largeur disponible.',
            },
            {
              name: 'loading',
              type: 'boolean',
              defaultValue: 'false',
              description:
                "Affiche un indicateur de chargement et neutralise le bouton. Le libelle reste en place : sa disparition ferait sauter la mise en page et priverait les lecteurs d'ecran du contexte.",
            },
            {
              name: 'startSlot',
              type: 'ReactNode',
              description: 'Element decoratif place avant le libelle.',
            },
            {
              name: 'endSlot',
              type: 'ReactNode',
              description: 'Element decoratif place apres le libelle.',
            },
            {
              name: 'press',
              type: 'boolean',
              defaultValue: 'true',
              description:
                "Joue une breve pression a l'activation. Neutralise sous prefers-reduced-motion.",
            },
            { name: 'className', type: 'string', description: 'Classes additionnelles.' },
            {
              name: 'ref',
              type: 'Ref<HTMLButtonElement>',
              description: "Ref vers l'element natif.",
            },
          ]}
        />
        <Callout>
          Toutes les autres props natives de{' '}
          <code className="o-font-mono o-text-sm">&lt;button&gt;</code> (onClick, type,
          aria-*...) sont transmises telles quelles a l'element.
        </Callout>
      </Section>
    </article>
  )
}
