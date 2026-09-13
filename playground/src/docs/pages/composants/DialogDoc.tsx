/**
 * Documentation du composant Dialog.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Button, Dialog, Input } from '@odoro-cli/libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import { VariantGrid } from '../../components/PlaygroundBlock.jsx'

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
        description="Un clic a côté ne ferme pas cette boîte : seule la touche Echap ou un bouton le fait."
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
        description="Le nom pourra être change plus tard."
        footer={
          <>
            <Button tone="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setOpen(false)}>Créer</Button>
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

/** Demonstration : message simple sans pied d'actions. */
function MessageDemo(): ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button tone="ghost" onClick={() => setOpen(true)}>
        Voir le message
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Export termine"
        description="Le fichier est disponible dans vos telechargements. Echap ou un clic a côté referme."
      />
    </>
  )
}

/** Documentation du composant Dialog. */
export function DialogDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/ui"
        title="Dialog"
        lead="Boîte de dialogue modale batie sur l'élément <dialog> natif ouvert en mode modal : piegeage du focus, fermeture par Echap, inertie du reste de la page et couche supérieure sont fournis par le navigateur."
      />

      <Section
        title="Aperçu"
        lead="Un bouton ouvre une boîte de confirmation : titre, description et pied d'actions Annuler / Confirmer."
      >
        <DemoBlock
          code={`import { Button, Dialog } from '@odoro-cli/libs/ui'

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
          La boîte repose sur le{' '}
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
        title="Formulaire dans la boîte"
        lead="Le contenu passe en children ; le pied regroupe les actions."
      >
        <DemoBlock
          code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Nouveau projet"
  description="Le nom pourra être change plus tard."
  footer={
    <>
      <Button tone="ghost" onClick={() => setOpen(false)}>Annuler</Button>
      <Button onClick={() => setOpen(false)}>Créer</Button>
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

      <Section
        title="Variantes"
        lead="Chaque carte ouvre une vraie boîte : cliquez pour la voir."
      >
        <VariantGrid
          variants={[
            {
              title: 'Confirmation',
              description: 'Pied Annuler / Confirmer, ton danger.',
              node: <ConfirmDemo />,
            },
            {
              title: 'Avec formulaire',
              description: 'Champs en children, actions en pied.',
              node: <FormDemo />,
            },
            {
              title: 'Fermeture explicite',
              description: 'closeOnBackdrop desactive.',
              node: <NoBackdropDemo />,
            },
            {
              title: 'Message simple',
              description: 'Titre et description, sans pied.',
              node: <MessageDemo />,
            },
          ]}
        />
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'open',
              type: 'boolean',
              description: "État d'ouverture, pilote par l'application.",
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
                "Titre de la boîte. Relie par aria-labelledby : c'est ce que les lecteurs d'écran annoncent a l'ouverture.",
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Description facultative, annoncee après le titre.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Contenu.',
            },
            {
              name: 'footer',
              type: 'ReactNode',
              description: "Pied de la boîte, typiquement des boutons d'action.",
            },
            {
              name: 'closeOnBackdrop',
              type: 'boolean',
              defaultValue: 'true',
              description: "Ferme la boîte au clic sur l'arriere-plan.",
            },
            {
              name: 'className',
              type: 'string',
              description: "Classes additionnelles appliquees a l'élément <dialog>.",
            },
            {
              name: '...rest',
              type: 'HTMLAttributes<HTMLDialogElement>',
              description: "Attributs natifs transmis a l'élément <dialog>.",
            },
          ]}
        />
      </Section>
    </article>
  )
}
