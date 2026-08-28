import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactElement, useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { setReducedMotion } from '../../test/setup.js'
import { Button, buttonClasses } from './Button.jsx'
import { Dialog } from './Dialog.jsx'
import { Input } from './Input.jsx'
import { Tabs } from './Tabs.jsx'
import { ToastProvider, useToast } from './Toast.jsx'

describe('Button', () => {
  it('rend un bouton de type button par defaut', () => {
    render(<Button>Envoyer</Button>)
    const button = screen.getByRole('button', { name: 'Envoyer' })
    expect(button.getAttribute('type')).toBe('button')
  })

  it('applique les classes de tonalite et de taille', () => {
    render(
      <Button tone="danger" size="sm">
        Supprimer
      </Button>,
    )
    const className = screen.getByRole('button').className
    expect(className).toContain('o-bg-danger')
    expect(className).toContain('o-h-8')
  })

  it('expose sa table de classes pour habiller un autre element', () => {
    expect(buttonClasses({ tone: 'ghost' })).toContain('o-text-fg')
    expect(buttonClasses({ block: 'true' })).toContain('o-w-full')
  })

  it('declenche onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Envoyer</Button>)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('annonce le chargement et bloque l activation', () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Envoyer
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.getAttribute('aria-disabled')).toBe('true')

    button.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('conserve le libelle pendant le chargement', () => {
    render(<Button loading>Envoyer</Button>)
    expect(screen.getByRole('button').textContent).toContain('Envoyer')
  })

  it('joue une pression a l activation', async () => {
    render(<Button>Envoyer</Button>)
    const button = screen.getByRole('button')
    vi.spyOn(button, 'animate')

    button.click()

    await waitFor(() => expect(button.animate).toHaveBeenCalledTimes(1))
  })

  it('n anime pas quand press vaut false', () => {
    render(<Button press={false}>Envoyer</Button>)
    const button = screen.getByRole('button')
    vi.spyOn(button, 'animate')
    button.click()
    expect(button.animate).not.toHaveBeenCalled()
  })

  it('transmet la ref', () => {
    let node: HTMLButtonElement | null = null
    render(
      <Button
        ref={(element) => {
          node = element
        }}
      >
        Envoyer
      </Button>,
    )
    expect(node).not.toBeNull()
  })
})

describe('Input', () => {
  it('relie le libelle au champ', () => {
    render(<Input label="Adresse e-mail" />)
    expect(screen.getByLabelText('Adresse e-mail')).toBeDefined()
  })

  it('decrit le champ par son aide', () => {
    render(<Input label="Mot de passe" hint="Au moins 12 caracteres." />)
    const field = screen.getByLabelText('Mot de passe')
    const describedBy = field.getAttribute('aria-describedby')
    expect(describedBy).not.toBeNull()
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Au moins 12 caracteres.',
    )
  })

  it('signale l erreur et la substitue a l aide', () => {
    render(<Input label="Courriel" hint="Aide" error="Adresse invalide" />)
    const field = screen.getByLabelText('Courriel')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Adresse invalide')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('masque visuellement le libelle sans le retirer', () => {
    render(<Input label="Recherche" hideLabel />)
    const field = screen.getByLabelText('Recherche')
    const label = document.querySelector(`label[for="${field.id}"]`)
    expect(label?.className).toContain('o-sr-only')
  })

  it('accepte un identifiant fourni', () => {
    render(<Input label="Nom" id="champ-nom" />)
    expect(screen.getByLabelText('Nom').id).toBe('champ-nom')
  })
})

describe('Tabs', () => {
  const items = [
    { id: 'a', label: 'Apercu', content: <p>Contenu A</p> },
    { id: 'b', label: 'Reglages', content: <p>Contenu B</p> },
    { id: 'c', label: 'Archive', content: <p>Contenu C</p>, disabled: true },
  ]

  it('rend le premier onglet actif par defaut', () => {
    render(<Tabs label="Sections" items={items} />)
    expect(
      screen.getByRole('tab', { name: 'Apercu' }).getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('ne place qu un seul onglet dans l ordre de tabulation', () => {
    render(<Tabs label="Sections" items={items} />)
    const focusable = screen
      .getAllByRole('tab')
      .filter((tab) => tab.getAttribute('tabindex') === '0')
    expect(focusable).toHaveLength(1)
  })

  it('change d onglet au clic', () => {
    render(<Tabs label="Sections" items={items} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Reglages' }))
    expect(screen.getByText('Contenu B')).toBeDefined()
  })

  it('ignore le clic sur un onglet desactive', () => {
    render(<Tabs label="Sections" items={items} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Archive' }))
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('navigue au clavier avec les fleches, en sautant les onglets desactives', () => {
    render(<Tabs label="Sections" items={items} />)
    const list = screen.getByRole('tablist')

    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(screen.getByText('Contenu B')).toBeDefined()

    // L'onglet suivant est desactive : on repasse au premier.
    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('va aux extremites avec Home et End', () => {
    render(<Tabs label="Sections" items={items} />)
    const list = screen.getByRole('tablist')

    fireEvent.keyDown(list, { key: 'End' })
    // Le dernier onglet etant desactive, End retient le precedent.
    expect(screen.getByText('Contenu B')).toBeDefined()

    fireEvent.keyDown(list, { key: 'Home' })
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('ignore les touches sans effet', () => {
    render(<Tabs label="Sections" items={items} />)
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'a' })
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('fonctionne en mode controle', () => {
    const onValueChange = vi.fn()
    render(
      <Tabs label="Sections" items={items} value="b" onValueChange={onValueChange} />,
    )
    expect(screen.getByText('Contenu B')).toBeDefined()

    fireEvent.click(screen.getByRole('tab', { name: 'Apercu' }))
    expect(onValueChange).toHaveBeenCalledWith('a')
    // La valeur reste imposee par l'appelant.
    expect(screen.getByText('Contenu B')).toBeDefined()
  })

  it('relie chaque panneau a son onglet', () => {
    render(<Tabs label="Sections" items={items} />)
    const tab = screen.getByRole('tab', { name: 'Apercu' })
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
    expect(tab.getAttribute('aria-controls')).toBe(panel.id)
  })
})

describe('Dialog', () => {
  function Host({ open }: { open: boolean }): ReactElement {
    return (
      <Dialog
        open={open}
        onClose={vi.fn()}
        title="Confirmer"
        description="Action definitive."
      >
        <p>Corps</p>
      </Dialog>
    )
  }

  it('ne rend rien quand elle est fermee', () => {
    render(<Host open={false} />)
    expect(screen.queryByText('Confirmer')).toBeNull()
  })

  it('rend le titre, la description et le contenu quand elle est ouverte', () => {
    render(<Host open />)
    expect(screen.getByText('Confirmer')).toBeDefined()
    expect(screen.getByText('Action definitive.')).toBeDefined()
    expect(screen.getByText('Corps')).toBeDefined()
  })

  it('relie le titre et la description a l element', () => {
    render(<Host open />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()
    expect(
      document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toBe('Confirmer')
    expect(
      document.getElementById(dialog?.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('Action definitive.')
  })

  it('ferme sur Echap en passant par l etat applicatif', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Confirmer" />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()

    fireEvent(dialog as HTMLDialogElement, new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ferme au clic sur l arriere-plan', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Confirmer" />)
    const dialog = document.querySelector('dialog') as HTMLDialogElement

    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ne ferme pas au clic sur le contenu', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="Confirmer">
        <p>Corps</p>
      </Dialog>,
    )
    fireEvent.click(screen.getByText('Corps'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('respecte closeOnBackdrop', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Confirmer" closeOnBackdrop={false} />)
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('se demonte immediatement sous prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { rerender } = render(<Host open />)
    rerender(<Host open={false} />)
    expect(screen.queryByText('Confirmer')).toBeNull()
  })
})

describe('Toast', () => {
  function Trigger(): ReactElement {
    const { toast, toasts, clear } = useToast()
    // Un compteur d'etat serait lu dans une closure perimee si l'on clique
    // plusieurs fois avant un rendu : la ref avance a chaque clic.
    const count = useRef(0)
    return (
      <div>
        <button
          onClick={() => {
            toast({ title: `Message ${count.current}`, tone: 'success', duration: 0 })
            count.current += 1
          }}
        >
          notifier
        </button>
        <button onClick={clear}>vider</button>
        <span data-testid="compte">{toasts.length}</span>
      </div>
    )
  }

  function Host({ max }: { max?: number }): ReactElement {
    return (
      <ToastProvider max={max}>
        <Trigger />
      </ToastProvider>
    )
  }

  it('empile une notification', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByText('Message 0')).toBeDefined())
  })

  it('utilise role=status pour les registres non critiques', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByRole('status')).toBeDefined())
  })

  it('plafonne le nombre de notifications simultanees', async () => {
    render(<Host max={2} />)
    const notify = screen.getByRole('button', { name: 'notifier' })
    notify.click()
    notify.click()
    notify.click()

    await waitFor(() => expect(screen.getByTestId('compte').textContent).toBe('2'))
    expect(screen.queryByText('Message 0')).toBeNull()
    expect(screen.getByText('Message 2')).toBeDefined()
  })

  it('ferme une notification depuis son bouton', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByText('Message 0')).toBeDefined())

    screen.getByRole('button', { name: 'Fermer la notification' }).click()
    await waitFor(() => expect(screen.queryByText('Message 0')).toBeNull())
  })

  it('disparait d elle-meme apres sa duree de vie', async () => {
    function Ephemeral(): ReactElement {
      const { toast } = useToast()
      return (
        <button onClick={() => toast({ title: 'Bref', duration: 10 })}>notifier</button>
      )
    }
    render(
      <ToastProvider>
        <Ephemeral />
      </ToastProvider>,
    )

    screen.getByRole('button').click()
    await waitFor(() => expect(screen.getByText('Bref')).toBeDefined())
    await waitFor(() => expect(screen.queryByText('Bref')).toBeNull())
  })

  it('vide la file', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByTestId('compte').textContent).toBe('1'))

    screen.getByRole('button', { name: 'vider' }).click()
    await waitFor(() => expect(screen.getByTestId('compte').textContent).toBe('0'))
  })

  it('echoue avec un message explicite hors du fournisseur', () => {
    function Orphan(): ReactElement {
      useToast()
      return <p>jamais</p>
    }
    expect(() => render(<Orphan />)).toThrow(/<ToastProvider>/)
  })
})
