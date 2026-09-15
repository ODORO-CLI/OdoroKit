import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { setReducedMotion } from '../../test/setup.js'
import { Accordion } from './Accordion.jsx'
import { Breadcrumb } from './Breadcrumb.jsx'
import { Drawer } from './Drawer.jsx'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu.jsx'
import { Pagination } from './Pagination.jsx'
import { Popover } from './Popover.jsx'
import { Table } from './Table.jsx'
import { Tooltip } from './Tooltip.jsx'

describe('Accordion', () => {
  const items = [
    { id: 'a', title: 'Compte', content: <p>Contenu A</p> },
    { id: 'b', title: 'Facturation', content: <p>Contenu B</p> },
    { id: 'c', title: 'Archive', content: <p>Contenu C</p>, disabled: true },
  ]

  it('renders every section closed by default', () => {
    render(<Accordion items={items} />)
    for (const header of screen.getAllByRole('button')) {
      expect(header.getAttribute('aria-expanded')).toBe('false')
    }
    expect(screen.queryByText('Contenu A')).toBeNull()
  })

  it('opens a section on a click and announces it through aria-expanded', () => {
    render(<Accordion items={items} />)
    const header = screen.getByRole('button', { name: 'Compte' })
    fireEvent.click(header)

    expect(header.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('ties the header to its region', () => {
    render(<Accordion items={items} defaultValue="a" />)
    const header = screen.getByRole('button', { name: 'Compte' })
    const region = screen.getByRole('region')
    expect(header.getAttribute('aria-controls')).toBe(region.id)
    expect(region.getAttribute('aria-labelledby')).toBe(header.id)
  })

  it('keeps only one section open in single mode', async () => {
    setReducedMotion(true)
    render(<Accordion items={items} defaultValue="a" />)

    fireEvent.click(screen.getByRole('button', { name: 'Facturation' }))
    expect(screen.getByText('Contenu B')).toBeDefined()
    await waitFor(() => expect(screen.queryByText('Contenu A')).toBeNull())
  })

  it('closes the open section again when collapsible allows it', async () => {
    setReducedMotion(true)
    render(<Accordion items={items} defaultValue="a" />)
    const header = screen.getByRole('button', { name: 'Compte' })

    fireEvent.click(header)
    expect(header.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(screen.queryByText('Contenu A')).toBeNull())
  })

  it('keeps one section open when collapsible is false', () => {
    render(<Accordion items={items} defaultValue="a" collapsible={false} />)
    const header = screen.getByRole('button', { name: 'Compte' })

    fireEvent.click(header)
    expect(header.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('leaves several sections open in multiple mode', () => {
    render(<Accordion items={items} type="multiple" />)
    fireEvent.click(screen.getByRole('button', { name: 'Compte' }))
    fireEvent.click(screen.getByRole('button', { name: 'Facturation' }))

    expect(screen.getByText('Contenu A')).toBeDefined()
    expect(screen.getByText('Contenu B')).toBeDefined()
  })

  it('ignores a click on a disabled section', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    expect(screen.queryByText('Contenu C')).toBeNull()
  })

  it('works in controlled mode', () => {
    const onValueChange = vi.fn()
    render(<Accordion items={items} value="a" onValueChange={onValueChange} />)
    expect(screen.getByText('Contenu A')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: 'Facturation' }))
    expect(onValueChange).toHaveBeenCalledWith(['b'])
    // The value stays imposed by the caller.
    expect(screen.queryByText('Contenu B')).toBeNull()
  })
})

describe('Tooltip', () => {
  it('appears on keyboard focus with role tooltip', async () => {
    render(
      <Tooltip content="Copier" delay={0}>
        <button type="button">Cible</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Cible' }))

    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Copier'))
  })

  it('describes the trigger through aria-describedby', async () => {
    render(
      <Tooltip content="Copier" delay={0}>
        <button type="button">Cible</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Cible' })
    fireEvent.focus(trigger)

    await waitFor(() => {
      expect(trigger.getAttribute('aria-describedby')).toBe(
        screen.getByRole('tooltip').id,
      )
    })
  })

  it('disappears on blur', async () => {
    render(
      <Tooltip content="Copier" delay={0}>
        <button type="button">Cible</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Cible' })
    fireEvent.focus(trigger)
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeDefined())

    fireEvent.blur(trigger)
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('disappears on Escape', async () => {
    render(
      <Tooltip content="Copier" delay={0}>
        <button type="button">Cible</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Cible' })
    fireEvent.focus(trigger)
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeDefined())

    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })
})

describe('Popover', () => {
  it('opens and closes on a click on the trigger', async () => {
    render(<Popover trigger="Filtres">Panneau</Popover>)
    const trigger = screen.getByRole('button', { name: 'Filtres' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('dialog').textContent).toBe('Panneau')

    fireEvent.click(trigger)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('closes on Escape and gives the focus back to the trigger', async () => {
    render(<Popover trigger="Filtres">Panneau</Popover>)
    const trigger = screen.getByRole('button', { name: 'Filtres' })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on an outside click', async () => {
    render(
      <div>
        <Popover trigger="Filtres">Panneau</Popover>
        <p>Ailleurs</p>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.pointerDown(screen.getByText('Ailleurs'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('works in controlled mode', () => {
    const onOpenChange = vi.fn()
    render(
      <Popover trigger="Filtres" open={false} onOpenChange={onOpenChange}>
        Panneau
      </Popover>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    // The value stays imposed by the caller.
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('DropdownMenu', () => {
  const items: readonly DropdownMenuItem[] = [
    { id: 'renommer', label: 'Renommer', shortcut: 'Ctrl+R' },
    { id: 'dupliquer', label: 'Dupliquer' },
    { type: 'separator' },
    { id: 'supprimer', label: 'Supprimer', danger: true },
  ]

  it('opens the menu and announces its state', () => {
    render(<DropdownMenu label="Actions" items={items} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeDefined()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
  })

  it('opens with the down arrow with the focus on the first item', async () => {
    render(<DropdownMenu label="Actions" items={items} />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), {
      key: 'ArrowDown',
    })

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: /Renommer/ }),
      ),
    )
  })

  it('navigates with the arrows, looping and skipping the separators', async () => {
    render(<DropdownMenu label="Actions" items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: 'Dupliquer' }),
      ),
    )

    // The separator is skipped.
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: 'Supprimer' }),
      ),
    )

    // The navigation loops back to the first item.
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: /Renommer/ }),
      ),
    )
  })

  it('goes to the ends with Home and End', async () => {
    render(<DropdownMenu label="Actions" items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'End' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: 'Supprimer' }),
      ),
    )

    fireEvent.keyDown(menu, { key: 'Home' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: /Renommer/ }),
      ),
    )
  })

  it('selects an item and closes the menu again', async () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu
        label="Actions"
        items={[{ id: 'renommer', label: 'Renommer', onSelect }]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Renommer' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('ignores the selection of a disabled item', () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu
        label="Actions"
        items={[
          { id: 'renommer', label: 'Renommer' },
          { id: 'supprimer', label: 'Supprimer', disabled: true, onSelect },
        ]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Supprimer' }))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeDefined()
  })

  it('closes on Escape and gives the focus back to the trigger', async () => {
    render(<DropdownMenu label="Actions" items={items} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    fireEvent.click(trigger)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('displays the shortcut of the item', () => {
    render(<DropdownMenu label="Actions" items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.getByText('Ctrl+R')).toBeDefined()
  })
})

describe('Breadcrumb', () => {
  const items = [
    { label: 'Accueil', href: '/' },
    { label: 'Projets', href: '/projets' },
    { label: 'OdoroKit' },
  ]

  it('renders a labeled navigation with an ordered list', () => {
    render(<Breadcrumb items={items} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav.querySelector('ol')).not.toBeNull()
  })

  it('marks the last step with aria-current=page', () => {
    render(<Breadcrumb items={items} />)
    const current = screen.getByText('OdoroKit')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.tagName).toBe('SPAN')
  })

  it('renders the previous steps as links', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByRole('link', { name: 'Accueil' }).getAttribute('href')).toBe('/')
    expect(screen.queryByRole('link', { name: 'OdoroKit' })).toBeNull()
  })

  it('accepts a custom separator', () => {
    render(<Breadcrumb items={items} separator="/" />)
    expect(screen.getAllByText('/')).toHaveLength(2)
  })
})

describe('Pagination', () => {
  it('displays the window around the current page with the ellipses', () => {
    render(<Pagination page={5} pageCount={10} onPageChange={vi.fn()} />)

    for (const name of ['1', '4', '5', '6', '10']) {
      expect(screen.getByRole('button', { name })).toBeDefined()
    }
    expect(screen.queryByRole('button', { name: '2' })).toBeNull()
    expect(screen.queryByRole('button', { name: '9' })).toBeNull()
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('omits the ellipses when every page fits', () => {
    render(<Pagination page={2} pageCount={3} onPageChange={vi.fn()} />)
    expect(screen.queryByText('…')).toBeNull()
    for (const name of ['1', '2', '3']) {
      expect(screen.getByRole('button', { name })).toBeDefined()
    }
  })

  it('marks the current page with aria-current=page', () => {
    render(<Pagination page={5} pageCount={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '5' }).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(
      screen.getByRole('button', { name: '4' }).getAttribute('aria-current'),
    ).toBeNull()
  })

  it('fires onPageChange on a click on a number', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('navigates with the previous and next buttons', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(4)

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('neutralizes previous on the first page and next on the last', () => {
    const { rerender } = render(
      <Pagination page={1} pageCount={10} onPageChange={vi.fn()} />,
    )
    expect(
      (screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)

    rerender(<Pagination page={10} pageCount={10} onPageChange={vi.fn()} />)
    expect(
      (screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
})

describe('Table', () => {
  interface Invoice {
    readonly ref: string
    readonly total: string
  }

  const columns = [
    { key: 'ref', header: 'Reference' },
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (row: Invoice) => <strong>{row.total}</strong>,
    },
  ]

  const rows: readonly Invoice[] = [
    { ref: 'F-001', total: '120 EUR' },
    { ref: 'F-002', total: '80 EUR' },
  ]

  it('renders the column headers with scope=col', () => {
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.ref} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(2)
    expect(headers[0]?.getAttribute('scope')).toBe('col')
    expect(headers[0]?.textContent).toBe('Reference')
  })

  it('renders one row per entry, with the key or the custom rendering', () => {
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.ref} />)
    expect(screen.getByText('F-001')).toBeDefined()
    expect(screen.getByText('120 EUR').tagName).toBe('STRONG')
  })

  it('displays the empty message across the whole width', () => {
    render(
      <Table
        columns={columns}
        rows={[] as readonly Invoice[]}
        rowKey={(row) => row.ref}
        empty="Aucune facture."
      />,
    )
    const cell = screen.getByText('Aucune facture.')
    expect(cell.getAttribute('colspan')).toBe('2')
  })

  it('hides the caption by default and displays it on demand', () => {
    const { rerender } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(row) => row.ref}
        caption="Factures"
      />,
    )
    expect(screen.getByText('Factures').className).toContain('o-sr-only')

    rerender(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(row) => row.ref}
        caption="Factures"
        showCaption
      />,
    )
    expect(screen.getByText('Factures').className).not.toContain('o-sr-only')
  })
})

describe('Drawer', () => {
  it('renders nothing when it is closed', () => {
    render(
      <Drawer open={false} onClose={vi.fn()} title="Filtres">
        <p>Corps</p>
      </Drawer>,
    )
    expect(screen.queryByText('Filtres')).toBeNull()
  })

  it('renders the title, the description and the content when it is open', () => {
    render(
      <Drawer open onClose={vi.fn()} title="Filtres" description="Affinez la liste.">
        <p>Corps</p>
      </Drawer>,
    )
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()
    expect(
      document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toBe('Filtres')
    expect(screen.getByText('Affinez la liste.')).toBeDefined()
    expect(screen.getByText('Corps')).toBeDefined()
  })

  it('closes from the cross', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" />)
    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape by going through the application state', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()

    fireEvent(dialog as HTMLDialogElement, new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a click on the backdrop', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" />)
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('respects closeOnBackdrop', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" closeOnBackdrop={false} />)
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('unmounts immediately under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { rerender } = render(<Drawer open onClose={vi.fn()} title="Filtres" />)
    rerender(<Drawer open={false} onClose={vi.fn()} title="Filtres" />)
    expect(screen.queryByText('Filtres')).toBeNull()
  })
})
