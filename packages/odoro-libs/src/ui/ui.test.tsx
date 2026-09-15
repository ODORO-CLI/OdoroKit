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
  it('renders a button of type button by default', () => {
    render(<Button>Envoyer</Button>)
    const button = screen.getByRole('button', { name: 'Envoyer' })
    expect(button.getAttribute('type')).toBe('button')
  })

  it('applies the tone and size classes', () => {
    render(
      <Button tone="danger" size="sm">
        Supprimer
      </Button>,
    )
    const className = screen.getByRole('button').className
    expect(className).toContain('o-bg-red-600 dark:o-bg-red-400')
    expect(className).toContain('o-h-8')
  })

  it('exposes its class table to style another element', () => {
    expect(buttonClasses({ tone: 'ghost' })).toContain(
      'o-text-zinc-900 dark:o-text-zinc-50',
    )
    expect(buttonClasses({ block: 'true' })).toContain('o-w-full')
  })

  it('fires onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Envoyer</Button>)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('announces the loading and blocks the activation', () => {
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

  it('keeps the label during the loading', () => {
    render(<Button loading>Envoyer</Button>)
    expect(screen.getByRole('button').textContent).toContain('Envoyer')
  })

  it('plays a press on activation', async () => {
    render(<Button>Envoyer</Button>)
    const button = screen.getByRole('button')
    vi.spyOn(button, 'animate')

    button.click()

    await waitFor(() => expect(button.animate).toHaveBeenCalledTimes(1))
  })

  it('does not animate when press is false', () => {
    render(<Button press={false}>Envoyer</Button>)
    const button = screen.getByRole('button')
    vi.spyOn(button, 'animate')
    button.click()
    expect(button.animate).not.toHaveBeenCalled()
  })

  it('forwards the ref', () => {
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
  it('ties the label to the field', () => {
    render(<Input label="Adresse e-mail" />)
    expect(screen.getByLabelText('Adresse e-mail')).toBeDefined()
  })

  it('describes the field by its hint', () => {
    render(<Input label="Mot de passe" hint="Au moins 12 caracteres." />)
    const field = screen.getByLabelText('Mot de passe')
    const describedBy = field.getAttribute('aria-describedby')
    expect(describedBy).not.toBeNull()
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Au moins 12 caracteres.',
    )
  })

  it('reports the error and substitutes it for the hint', () => {
    render(<Input label="Courriel" hint="Aide" error="Adresse invalide" />)
    const field = screen.getByLabelText('Courriel')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Adresse invalide')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('visually hides the label without removing it', () => {
    render(<Input label="Recherche" hideLabel />)
    const field = screen.getByLabelText('Recherche')
    const label = document.querySelector(`label[for="${field.id}"]`)
    expect(label?.className).toContain('o-sr-only')
  })

  it('accepts a provided identifier', () => {
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

  it('renders the first tab as active by default', () => {
    render(<Tabs label="Sections" items={items} />)
    expect(
      screen.getByRole('tab', { name: 'Apercu' }).getAttribute('aria-selected'),
    ).toBe('true')
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('puts a single tab in the tabbing order', () => {
    render(<Tabs label="Sections" items={items} />)
    const focusable = screen
      .getAllByRole('tab')
      .filter((tab) => tab.getAttribute('tabindex') === '0')
    expect(focusable).toHaveLength(1)
  })

  it('changes tab on a click', () => {
    render(<Tabs label="Sections" items={items} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Reglages' }))
    expect(screen.getByText('Contenu B')).toBeDefined()
  })

  it('ignores a click on a disabled tab', () => {
    render(<Tabs label="Sections" items={items} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Archive' }))
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('navigates with the keyboard arrows, skipping the disabled tabs', () => {
    render(<Tabs label="Sections" items={items} />)
    const list = screen.getByRole('tablist')

    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(screen.getByText('Contenu B')).toBeDefined()

    // The next tab is disabled: we loop back to the first one.
    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('goes to the ends with Home and End', () => {
    render(<Tabs label="Sections" items={items} />)
    const list = screen.getByRole('tablist')

    fireEvent.keyDown(list, { key: 'End' })
    // The last tab being disabled, End keeps the previous one.
    expect(screen.getByText('Contenu B')).toBeDefined()

    fireEvent.keyDown(list, { key: 'Home' })
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('ignores the keys without effect', () => {
    render(<Tabs label="Sections" items={items} />)
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'a' })
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('works in controlled mode', () => {
    const onValueChange = vi.fn()
    render(
      <Tabs label="Sections" items={items} value="b" onValueChange={onValueChange} />,
    )
    expect(screen.getByText('Contenu B')).toBeDefined()

    fireEvent.click(screen.getByRole('tab', { name: 'Apercu' }))
    expect(onValueChange).toHaveBeenCalledWith('a')
    // The value stays imposed by the caller.
    expect(screen.getByText('Contenu B')).toBeDefined()
  })

  it('ties each panel to its tab', () => {
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

  it('renders nothing when it is closed', () => {
    render(<Host open={false} />)
    expect(screen.queryByText('Confirmer')).toBeNull()
  })

  it('renders the title, the description and the content when it is open', () => {
    render(<Host open />)
    expect(screen.getByText('Confirmer')).toBeDefined()
    expect(screen.getByText('Action definitive.')).toBeDefined()
    expect(screen.getByText('Corps')).toBeDefined()
  })

  it('ties the title and the description to the element', () => {
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

  it('closes on Escape by going through the application state', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Confirmer" />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()

    fireEvent(dialog as HTMLDialogElement, new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a click on the backdrop', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Confirmer" />)
    const dialog = document.querySelector('dialog') as HTMLDialogElement

    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on a click on the content', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="Confirmer">
        <p>Corps</p>
      </Dialog>,
    )
    fireEvent.click(screen.getByText('Corps'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('respects closeOnBackdrop', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Confirmer" closeOnBackdrop={false} />)
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('unmounts immediately under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { rerender } = render(<Host open />)
    rerender(<Host open={false} />)
    expect(screen.queryByText('Confirmer')).toBeNull()
  })
})

describe('Toast', () => {
  function Trigger(): ReactElement {
    const { toast, toasts, clear } = useToast()
    // A state counter would be read in a stale closure if one clicks several
    // times before a render: the ref moves forward on every click.
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

  it('stacks a notification', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByText('Message 0')).toBeDefined())
  })

  it('uses role=status for the non critical registers', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByRole('status')).toBeDefined())
  })

  it('caps the number of simultaneous notifications', async () => {
    render(<Host max={2} />)
    const notify = screen.getByRole('button', { name: 'notifier' })
    notify.click()
    notify.click()
    notify.click()

    await waitFor(() => expect(screen.getByTestId('compte').textContent).toBe('2'))
    expect(screen.queryByText('Message 0')).toBeNull()
    expect(screen.getByText('Message 2')).toBeDefined()
  })

  it('dismisses a notification from its button', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByText('Message 0')).toBeDefined())

    screen.getByRole('button', { name: 'Close the notification' }).click()
    await waitFor(() => expect(screen.queryByText('Message 0')).toBeNull())
  })

  it('disappears on its own after its lifetime', async () => {
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

  it('clears the queue', async () => {
    render(<Host />)
    screen.getByRole('button', { name: 'notifier' }).click()
    await waitFor(() => expect(screen.getByTestId('compte').textContent).toBe('1'))

    screen.getByRole('button', { name: 'vider' }).click()
    await waitFor(() => expect(screen.getByTestId('compte').textContent).toBe('0'))
  })

  it('fails with an explicit message outside of the provider', () => {
    function Orphan(): ReactElement {
      useToast()
      return <p>jamais</p>
    }
    expect(() => render(<Orphan />)).toThrow(/<ToastProvider>/)
  })
})
