/** Documentation du composant Card. @module */

import { type ReactElement } from 'react'

import { Button, Card } from 'odoro-libs/ui'

import {
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
  variant: 'outlined',
  padding: 'md',
  interactive: false,
}

/** Documentation du composant Card. */
export function CardDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Card"
        lead="Carte de contenu composable : media, titre, description, contenu et pied optionnels, en trois registres visuels."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'variant',
              type: 'select',
              options: ['outlined', 'elevated', 'ghost'],
              defaultValue: 'outlined',
            },
            {
              name: 'padding',
              type: 'select',
              options: ['none', 'sm', 'md', 'lg'],
              defaultValue: 'md',
            },
            { name: 'interactive', type: 'boolean', defaultValue: false },
            { name: 'title', type: 'text', defaultValue: 'Projet Odoro' },
            {
              name: 'description',
              type: 'text',
              defaultValue: 'Librairie front maison.',
            },
          ]}
          render={(v) => (
            <Card
              variant={v.variant as 'outlined' | 'elevated' | 'ghost'}
              padding={v.padding as 'none' | 'sm' | 'md' | 'lg'}
              interactive={v.interactive as boolean}
              title={v.title as string}
              description={v.description as string}
              className="o-w-72"
            >
              <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                Trois modules livres cette semaine.
              </p>
            </Card>
          )}
          code={(v) => `<Card${jsxProps(
            {
              variant: v.variant,
              padding: v.padding,
              interactive: v.interactive,
            } as Record<string, ControlValue>,
            DEFAUTS,
          )}
  title="${String(v.title)}"
  description="${String(v.description)}"
>
  <p>Trois modules livres cette semaine.</p>
</Card>`}
        />
      </Section>

      <Section
        title="Media"
        lead="Le media est rendu pleine largeur au-dessus du corps, hors de tout padding : il epouse les coins arrondis de la carte."
      >
        <DemoBlock
          code={`<Card
  media={<div className="o-bg-gradient-to-br o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400 o-h-32" />}
  title="Nouvelle identite"
  description="Le degrade tient lieu d'illustration."
/>`}
        >
          <Card
            media={
              <div className="o-bg-gradient-to-br o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400 o-h-32" />
            }
            title="Nouvelle identite"
            description="Le degrade tient lieu d'illustration."
            className="o-w-72"
          />
        </DemoBlock>
      </Section>

      <Section
        title="Pied de carte"
        lead="Le pied est separe du corps par un filet et reprend le meme padding."
      >
        <DemoBlock
          code={`<Card
  title="Projet Odoro"
  description="Librairie front maison."
  footer={<Button size="sm">Ouvrir le projet</Button>}
>
  <p>Trois modules livres cette semaine.</p>
</Card>`}
        >
          <Card
            title="Projet Odoro"
            description="Librairie front maison."
            footer={<Button size="sm">Ouvrir le projet</Button>}
            className="o-w-72"
          >
            <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
              Trois modules livres cette semaine.
            </p>
          </Card>
        </DemoBlock>
      </Section>

      <Section
        title="Cartes interactives"
        lead="interactive ajoute une legere elevation au survol et le curseur pointeur : utile quand toute la carte est cliquable."
      >
        <DemoBlock
          center={false}
          code={`<div className="o-grid o-grid-cols-3 o-gap-4">
  <Card interactive title="Composants" description="31 composants d'interface." />
  <Card interactive title="Animations" description="Presets et hooks de mouvement." />
  <Card interactive title="Routeur" description="Routeur client complet." />
</div>`}
        >
          <div className="o-grid o-grid-cols-3 o-gap-4">
            <Card
              interactive
              title="Composants"
              description="31 composants d'interface."
            />
            <Card
              interactive
              title="Animations"
              description="Presets et hooks de mouvement."
            />
            <Card interactive title="Routeur" description="Routeur client complet." />
          </div>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'title',
              type: 'ReactNode',
              description: 'Titre affiche en tete du corps.',
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Sous-titre affiche sous le titre.',
            },
            {
              name: 'media',
              type: 'ReactNode',
              description:
                'Media rendu pleine largeur au-dessus du corps, hors de tout padding (image, video, illustration).',
            },
            {
              name: 'footer',
              type: 'ReactNode',
              description: 'Zone de pied, sous le contenu.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Contenu principal.',
            },
            {
              name: 'variant',
              type: "'outlined' | 'elevated' | 'ghost'",
              defaultValue: "'outlined'",
              description: 'Registre visuel.',
            },
            {
              name: 'interactive',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Reagit au survol (elevation et curseur).',
            },
            {
              name: 'padding',
              type: "'none' | 'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description: 'Ecart interne du corps et du pied.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles.',
            },
            {
              name: 'ref',
              type: 'Ref<HTMLDivElement>',
              description: "Ref vers l'element natif.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
