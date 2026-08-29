/**
 * Documentation du composant Dialog.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Button, Dialog, Input } from '@odoro/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'

/** Demonstration principale : confirmation avec pied d'actions. */
function ConfirmDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Supprimer le projet</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Supprimer le projet"
        description="Cette action est irreversible : le projet et son historique seront perdus."
        footer={
          <>
            <Button tone="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button tone="danger" onClick={() => setOpen(false)}>
              Confirmer
            </Button>
          </>
        }
      />
    </>
  )
}

/** Demonstration sans fermeture au clic sur l'arriere-plan. */
function NoBackdropDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)}>
        Ouvrir (fermeture explicite)
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Choix requis"
        description="Un clic a cote ne ferme pas cette boite : seule la touche Echap ou un bouton le fait."
        closeOnBackdrop={false}
        footer={<Button onClick={() => setOpen(false)}>J'ai compris</Button>}
      />
    </>
  )
}

/** Demonstration avec formulaire. */
function FormDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)}>
        Nouveau projet
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau projet"
        description="Le nom pourra etre change plus tard."
        footer={
          <>
            <Button tone="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setOpen(false)}>Creer</Button>
          </>
        }
      >
        <div className="o-flex o-flex-col o-gap-3">
          <Input label="Nom du projet" placeholder="mon-app" />
          <Input label="Description" hint="Facultative." />
        </div>
      </Dialog>
    </>
  )
}

/** Documentation du composant Dialog. */
export function DialogDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/ui"
        title="Dialog"
        lead="Boite de dialogue modale batie sur l'element <dialog> natif ouvert en mode modal : piegeage du focus, fermeture par Echap, inertie du reste de la page et couche superieure sont fournis par le navigateur."
      />

      <Section
        title="Apercu"
        lead="Un bouton ouvre une boite de confirmation : titre, description et pied d'actions Annuler / Confirmer."
      >
        <DemoBlock
          code={`import { Button, Dialog } from '@odoro/libs/ui'

const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Supprimer le projet</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Supprimer le projet"
  description="Cette action est irreversible : le projet et son historique seront perdus."
  footer={
    <>
      <Button tone="ghost" onClick={() => setOpen(false)}>Annuler</Button>
      <Button tone="danger" onClick={() => setOpen(false)}>Confirmer</Button>
    </>
  }
/>`}
        >
          <ConfirmDemo />
        </DemoBlock>
        <Callout>
          La boite repose sur le{' '}
          <code className="o-font-mono o-text-sm">&lt;dialog&gt;</code> natif : le focus
          est piege par le navigateur, Echap ferme, et le reste de la page devient inerte
          — aucune reimplementation JavaScript. Seule l'animation de sortie est ajoutee
          par la librairie.
        </Callout>
      </Section>

      <Section
        title="Fermeture explicite"
        lead="closeOnBackdrop={false} ignore les clics sur l'arriere-plan : utile quand un choix est requis. Echap et onClose restent actifs."
      >
        <DemoBlock
          code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Choix requis"
  closeOnBackdrop={false}
  footer={<Button onClick={() => setOpen(false)}>J'ai compris</Button>}
/>`}
        >
          <NoBackdropDemo />
        </DemoBlock>
      </Section>

      <Section
        title="Formulaire dans la boite"
        lead="Le contenu passe en children ; le pied regroupe les actions."
      >
        <DemoBlock
          code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Nouveau projet"
  description="Le nom pourra etre change plus tard."
  footer={
    <>
      <Button tone="ghost" onClick={() => setOpen(false)}>Annuler</Button>
      <Button onClick={() => setOpen(false)}>Creer</Button>
    </>
  }
>
  <Input label="Nom du projet" placeholder="mon-app" />
  <Input label="Description" hint="Facultative." />
</Dialog>`}
        >
          <FormDemo />
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
                "Appele lorsque l'utilisateur demande la fermeture : bouton, touche Echap, ou clic sur l'arriere-plan.",
            },
            {
              name: 'title',
              type: 'ReactNode',
              description:
                "Titre de la boite. Relie par aria-labelledby : c'est ce que les lecteurs d'ecran annoncent a l'ouverture.",
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
              description: "Pied de la boite, typiquement des boutons d'action.",
            },
            {
              name: 'closeOnBackdrop',
              type: 'boolean',
              defaultValue: 'true',
              description: "Ferme la boite au clic sur l'arriere-plan.",
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
