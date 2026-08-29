/** Documentation des composants Avatar et AvatarGroup. @module */

import { type ReactElement } from 'react'

import { Avatar, AvatarGroup, type AvatarSize } from '@odoro/libs/ui'

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
  size: 'md',
  shape: 'circle',
}

/** Documentation des composants Avatar et AvatarGroup. */
export function AvatarDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Avatar"
        lead="Avatar avec repli automatique en initiales quand l'image manque ou echoue, et groupe superpose pour les equipes."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'size',
              type: 'select',
              options: ['xs', 'sm', 'md', 'lg', 'xl'],
              defaultValue: 'md',
            },
            {
              name: 'shape',
              type: 'select',
              options: ['circle', 'square'],
              defaultValue: 'circle',
            },
            { name: 'name', label: 'nom', type: 'text', defaultValue: 'Jean Dupont' },
          ]}
          render={(v) => (
            <Avatar
              size={v.size as AvatarSize}
              shape={v.shape as 'circle' | 'square'}
              name={v.name as string}
              alt={v.name as string}
            />
          )}
          code={(v) =>
            `<Avatar name="${String(v.name)}" alt="${String(v.name)}"${jsxProps(
              { size: v.size, shape: v.shape } as Record<string, ControlValue>,
              DEFAUTS,
            )} />`
          }
        />
      </Section>

      <Section
        title="Repli en initiales"
        lead="Si l'image echoue au chargement, l'avatar bascule sur les initiales du nom sans laisser l'icone d'image cassee du navigateur. Sans src, les initiales sont affichees d'emblee."
      >
        <DemoBlock
          code={`<Avatar src="/photo-inexistante.jpg" alt="Photo de Jean Dupont" name="Jean Dupont" />
<Avatar alt="Ana Ruiz" name="Ana Ruiz" />`}
        >
          <div className="o-flex o-items-center o-gap-4">
            <Avatar
              src="/photo-inexistante.jpg"
              alt="Photo de Jean Dupont"
              name="Jean Dupont"
            />
            <Avatar alt="Ana Ruiz" name="Ana Ruiz" />
          </div>
        </DemoBlock>
        <Callout>
          Le repli porte <code className="o-font-mono o-text-sm">role="img"</code> et le
          libelle <code className="o-font-mono o-text-sm">alt</code> : il reste annonce
          comme l'image qu'il remplace.
        </Callout>
      </Section>

      <Section
        title="Groupe d'avatars"
        lead="AvatarGroup superpose ses enfants ; au-dela de max, une pastille +N du meme gabarit resume le reste."
      >
        <DemoBlock
          code={`<AvatarGroup max={3}>
  <Avatar alt="Ana" name="Ana Ruiz" />
  <Avatar alt="Bob" name="Bob Marchand" />
  <Avatar alt="Chloe" name="Chloe Petit" />
  <Avatar alt="Dan" name="Dan Morel" />
  <Avatar alt="Emma" name="Emma Leroy" />
</AvatarGroup>`}
        >
          <AvatarGroup max={3}>
            <Avatar alt="Ana" name="Ana Ruiz" />
            <Avatar alt="Bob" name="Bob Marchand" />
            <Avatar alt="Chloe" name="Chloe Petit" />
            <Avatar alt="Dan" name="Dan Morel" />
            <Avatar alt="Emma" name="Emma Leroy" />
          </AvatarGroup>
        </DemoBlock>
      </Section>

      <Section title="Props">
        <h3 className="o-text-lg o-font-semibold">Avatar</h3>
        <PropsTable
          rows={[
            {
              name: 'src',
              type: 'string',
              description:
                "Adresse de l'image. Sans elle, les initiales sont affichees d'emblee.",
            },
            {
              name: 'alt',
              type: 'string',
              description:
                "Texte alternatif de l'image, repris comme libelle du repli. Obligatoire.",
            },
            {
              name: 'name',
              type: 'string',
              description: 'Nom dont sont tirees les initiales de repli.',
            },
            {
              name: 'size',
              type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
              defaultValue: "'md'",
              description: 'Taille.',
            },
            {
              name: 'shape',
              type: "'circle' | 'square'",
              defaultValue: "'circle'",
              description: 'Forme.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles.',
            },
            {
              name: 'ref',
              type: 'Ref<HTMLSpanElement>',
              description: "Ref vers l'element conteneur.",
            },
          ]}
        />
        <h3 className="o-text-lg o-font-semibold">AvatarGroup</h3>
        <PropsTable
          rows={[
            {
              name: 'children',
              type: 'ReactNode',
              description: "Avatars a superposer, du premier plan vers l'arriere.",
            },
            {
              name: 'max',
              type: 'number',
              description:
                'Nombre maximal d\'avatars affiches. Au-dela, une pastille "+N" du meme gabarit resume le reste.',
            },
            {
              name: 'size',
              type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
              defaultValue: "'md'",
              description:
                'Gabarit de la pastille "+N", a aligner sur celui des avatars.',
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
