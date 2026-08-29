/**
 * Documentation du composant Drawer.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import {
  Button,
  Checkbox,
  Drawer,
  Input,
  Select,
  type DrawerSide,
} from '@odoro-cli/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'

/**
 * Demonstration principale : bord et taille choisis localement, puis un bouton
 * ouvre le panneau. Un playground classique ne convient pas a un composant
 * modal — l'apercu resterait vide tant qu'il est ferme.
 */
function MainDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<DrawerSide>('right')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')

  return (
    <div className="o-flex o-flex-col o-gap-4 o-w-full o-max-w-sm">
      <div className="o-grid o-grid-cols-2 o-gap-3">
        <Select
          label="side"
          size="sm"
          value={side}
          onChange={(event) => setSide(event.target.value as DrawerSide)}
          options={[
            { value: 'right', label: 'right' },
            { value: 'left', label: 'left' },
            { value: 'bottom', label: 'bottom' },
          ]}
        />
        <Select
          label="size"
          size="sm"
          value={size}
          onChange={(event) => setSize(event.target.value as 'sm' | 'md' | 'lg')}
          options={[
            { value: 'sm', label: 'sm' },
            { value: 'md', label: 'md' },
            { value: 'lg', label: 'lg' },
          ]}
        />
      </div>
      <Button onClick={() => setOpen(true)}>Ouvrir le panneau</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        size={size}
        title="Details du projet"
        description="Le panneau glisse depuis le bord choisi."
      >
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Le contenu defile seul quand il depasse ; le panneau reste cale sur toute la
          hauteur du bord. Echap, la croix ou un clic sur l'arriere-plan referment.
        </p>
      </Drawer>
    </div>
  )
}

/** Demonstration : formulaire de filtres dans un panneau droit avec pied d'actions. */
function FiltersDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)}>
        Filtres
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        size="sm"
        title="Filtres"
        description="Affinez la liste des projets."
        footer={
          <>
            <Button tone="ghost" onClick={() => setOpen(false)}>
              Reinitialiser
            </Button>
            <Button onClick={() => setOpen(false)}>Appliquer</Button>
          </>
        }
      >
        <div className="o-flex o-flex-col o-gap-4">
          <Input label="Recherche" placeholder="Nom du projet" />
          <Select
            label="Statut"
            placeholder="Tous"
            options={[
              { value: 'actif', label: 'Actif' },
              { value: 'archive', label: 'Archive' },
            ]}
          />
          <Checkbox label="Uniquement mes projets" />
        </div>
      </Drawer>
    </>
  )
}

/** Documentation du composant Drawer. */
export function DrawerDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Drawer"
        lead="Panneau lateral modal, meme fondation que Dialog : le <dialog> natif fournit piegeage du focus, Echap, inertie et couche superieure. Seule change la geometrie — le panneau est cale a un bord et glisse depuis celui-ci."
      />

      <Section
        title="Apercu"
        lead="Choisissez le bord et la taille, puis ouvrez le panneau."
      >
        <DemoBlock
          code={`import { Button, Drawer } from '@odoro-cli/libs/ui'

const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Ouvrir le panneau</Button>
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  side="right"
  size="md"
  title="Details du projet"
  description="Le panneau glisse depuis le bord choisi."
>
  ...
</Drawer>`}
        >
          <MainDemo />
        </DemoBlock>
        <Callout>
          <code className="o-font-mono o-text-sm">size</code> ne concerne que les bords
          lateraux : ancre en <code className="o-font-mono o-text-sm">bottom</code>, le
          panneau occupe toute la largeur et sa hauteur suit le contenu.
        </Callout>
      </Section>

      <Section
        title="Formulaire de filtres"
        lead="Cas d'usage classique : des filtres dans un panneau droit, avec un pied d'actions Reinitialiser / Appliquer."
      >
        <DemoBlock
          code={`<Drawer
  open={open}
  onClose={() => setOpen(false)}
  side="right"
  size="sm"
  title="Filtres"
  description="Affinez la liste des projets."
  footer={
    <>
      <Button tone="ghost" onClick={() => setOpen(false)}>Reinitialiser</Button>
      <Button onClick={() => setOpen(false)}>Appliquer</Button>
    </>
  }
>
  <Input label="Recherche" placeholder="Nom du projet" />
  <Select label="Statut" placeholder="Tous" options={statuts} />
  <Checkbox label="Uniquement mes projets" />
</Drawer>`}
        >
          <FiltersDemo />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'open',
              type: 'boolean',
              description: "Etat d'ouverture, pilote par l'application.",
            },
            {
              name: 'onClose',
              type: '() => void',
              description:
                "Appele lorsque l'utilisateur demande la fermeture : croix, touche Echap, ou clic sur l'arriere-plan.",
            },
            {
              name: 'title',
              type: 'ReactNode',
              description: "Titre du panneau, annonce a l'ouverture via aria-labelledby.",
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Description facultative, annoncee apres le titre.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Contenu.',
            },
            {
              name: 'footer',
              type: 'ReactNode',
              description: "Pied du panneau, typiquement des boutons d'action.",
            },
            {
              name: 'side',
              type: "'right' | 'left' | 'bottom'",
              defaultValue: "'right'",
              description: "Bord d'ancrage.",
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description:
                'Largeur maximale pour les cotes lateraux. Sans effet pour bottom, dont la hauteur suit le contenu.',
            },
            {
              name: 'closeOnBackdrop',
              type: 'boolean',
              defaultValue: 'true',
              description: "Ferme le panneau au clic sur l'arriere-plan.",
            },
            {
              name: 'className',
              type: 'string',
              description: "Classes additionnelles appliquees a l'element <dialog>.",
            },
            {
              name: '...rest',
              type: 'HTMLAttributes<HTMLDialogElement>',
              description: "Attributs natifs transmis a l'element <dialog>.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
