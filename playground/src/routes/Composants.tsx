import { useState } from 'react'

import { Button, Dialog, Input, Tabs, ToastProvider, useToast } from 'odoro-libs/ui'

/** Declencheur de notifications, a l'interieur du fournisseur. */
function Notifications() {
  const { toast } = useToast()
  const tones = ['info', 'success', 'warning', 'danger'] as const

  return (
    <div className="o-flex o-flex-wrap o-gap-2">
      {tones.map((tone) => (
        <Button
          key={tone}
          size="sm"
          tone="secondary"
          onClick={() =>
            toast({
              title: `Notification ${tone}`,
              description: 'Ceci est un essai.',
              tone,
            })
          }
        >
          {tone}
        </Button>
      ))}
    </div>
  )
}

/** Vitrine des composants d'interface. */
export function Composants() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const invalid = value !== '' && !value.includes('@')

  return (
    <ToastProvider>
      <div className="o-flex o-flex-col o-gap-10">
        <section className="o-flex o-flex-col o-gap-3">
          <h1 className="o-text-2xl o-font-bold">Boutons</h1>
          <div className="o-flex o-flex-wrap o-items-center o-gap-3">
            <Button>Primaire</Button>
            <Button tone="secondary">Secondaire</Button>
            <Button tone="ghost">Discret</Button>
            <Button tone="danger">Danger</Button>
            <Button loading>Chargement</Button>
            <Button disabled>Desactive</Button>
          </div>
          <div className="o-flex o-flex-wrap o-items-center o-gap-3">
            <Button size="sm">Petit</Button>
            <Button size="md">Moyen</Button>
            <Button size="lg">Grand</Button>
          </div>
        </section>

        <section className="o-flex o-flex-col o-gap-3 o-max-w-sm">
          <h2 className="o-text-xl o-font-semibold">Champ de saisie</h2>
          <Input
            label="Adresse e-mail"
            type="email"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            hint="Nous ne la partagerons jamais."
            error={invalid ? 'Adresse invalide.' : undefined}
          />
        </section>

        <section className="o-flex o-flex-col o-gap-3">
          <h2 className="o-text-xl o-font-semibold">Onglets</h2>
          <Tabs
            label="Exemple d onglets"
            items={[
              { id: 'a', label: 'Apercu', content: <p>Contenu du premier onglet.</p> },
              { id: 'b', label: 'Reglages', content: <p>Contenu du second onglet.</p> },
              {
                id: 'c',
                label: 'Archive',
                content: <p>Inaccessible.</p>,
                disabled: true,
              },
            ]}
          />
        </section>

        <section className="o-flex o-flex-col o-gap-3">
          <h2 className="o-text-xl o-font-semibold">Notifications</h2>
          <Notifications />
        </section>

        <section className="o-flex o-flex-col o-gap-3">
          <h2 className="o-text-xl o-font-semibold">Boite de dialogue</h2>
          <div>
            <Button onClick={() => setOpen(true)}>Ouvrir</Button>
          </div>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            title="Supprimer le projet"
            description="Cette action est irreversible."
            footer={
              <>
                <Button tone="secondary" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button tone="danger" onClick={() => setOpen(false)}>
                  Supprimer
                </Button>
              </>
            }
          >
            <p className="o-text-sm o-text-fg-muted">
              Le piegeage du focus, la touche Echap et l inertie de la page sont fournis
              par l element natif.
            </p>
          </Dialog>
        </section>
      </div>
    </ToastProvider>
  )
}
