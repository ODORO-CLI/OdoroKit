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

  it('rend toutes les sections fermees par defaut', () => {
    render(<Accordion items={items} />)
    for (const header of screen.getAllByRole('button')) {
      expect(header.getAttribute('aria-expanded')).toBe('false')
    }
    expect(screen.queryByText('Contenu A')).toBeNull()
  })

  it('ouvre une section au clic et l annonce via aria-expanded', () => {
    render(<Accordion items={items} />)
    const header = screen.getByRole('button', { name: 'Compte' })
    fireEvent.click(header)

    expect(header.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('relie l en-tete a sa region', () => {
    render(<Accordion items={items} defaultValue="a" />)
    const header = screen.getByRole('button', { name: 'Compte' })
    const region = screen.getByRole('region')
    expect(header.getAttribute('aria-controls')).toBe(region.id)
    expect(region.getAttribute('aria-labelledby')).toBe(header.id)
  })

  it('ne garde qu une section ouverte en mode single', async () => {
    setReducedMotion(true)
    render(<Accordion items={items} defaultValue="a" />)

    fireEvent.click(screen.getByRole('button', { name: 'Facturation' }))
    expect(screen.getByText('Contenu B')).toBeDefined()
    await waitFor(() => expect(screen.queryByText('Contenu A')).toBeNull())
  })

  it('referme la section ouverte quand collapsible l autorise', async () => {
    setReducedMotion(true)
    render(<Accordion items={items} defaultValue="a" />)
    const header = screen.getByRole('button', { name: 'Compte' })

    fireEvent.click(header)
    expect(header.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(screen.queryByText('Contenu A')).toBeNull())
  })

  it('garde une section ouverte quand collapsible vaut false', () => {
    render(<Accordion items={items} defaultValue="a" collapsible={false} />)
    const header = screen.getByRole('button', { name: 'Compte' })

    fireEvent.click(header)
    expect(header.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Contenu A')).toBeDefined()
  })

  it('laisse plusieurs sections ouvertes en mode multiple', () => {
    render(<Accordion items={items} type="multiple" />)
    fireEvent.click(screen.getByRole('button', { name: 'Compte' }))
    fireEvent.click(screen.getByRole('button', { name: 'Facturation' }))

    expect(screen.getByText('Contenu A')).toBeDefined()
    expect(screen.getByText('Contenu B')).toBeDefined()
  })

  it('ignore le clic sur une section desactivee', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    expect(screen.queryByText('Contenu C')).toBeNull()
  })

  it('fonctionne en mode controle', () => {
    const onValueChange = vi.fn()
    render(<Accordion items={items} value="a" onValueChange={onValueChange} />)
    expect(screen.getByText('Contenu A')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: 'Facturation' }))
    expect(onValueChange).toHaveBeenCalledWith(['b'])
    // La valeur reste imposee par l'appelant.
    expect(screen.queryByText('Contenu B')).toBeNull()
  })
})

describe('Tooltip', () => {
  it('apparait au focus clavier avec role tooltip', async () => {
    render(
      <Tooltip content="Copier" delay={0}>
        <button type="button">Cible</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Cible' }))

    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Copier'))
  })

  it('decrit le declencheur par aria-describedby', async () => {
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

  it('disparait au blur', async () => {
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

  it('disparait sur Echap', async () => {
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
  it('ouvre et ferme au clic sur le declencheur', async () => {
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

  it('ferme sur Echap et rend le focus au declencheur', async () => {
    render(<Popover trigger="Filtres">Panneau</Popover>)
    const trigger = screen.getByRole('button', { name: 'Filtres' })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('ferme au clic exterieur', async () => {
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

  it('fonctionne en mode controle', () => {
    const onOpenChange = vi.fn()
    render(
      <Popover trigger="Filtres" open={false} onOpenChange={onOpenChange}>
        Panneau
      </Popover>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    // La valeur reste imposee par l'appelant.
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

  it('ouvre le menu et annonce son etat', () => {
    render(<DropdownMenu label="Actions" items={items} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeDefined()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
  })

  it('ouvre par fleche bas avec le focus sur le premier item', async () => {
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

  it('navigue aux fleches en bouclant et en sautant les separateurs', async () => {
    render(<DropdownMenu label="Actions" items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: 'Dupliquer' }),
      ),
    )

    // Le separateur est saute.
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: 'Supprimer' }),
      ),
    )

    // La navigation boucle sur le premier item.
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('menuitem', { name: /Renommer/ }),
      ),
    )
  })

  it('va aux extremites avec Home et End', async () => {
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

  it('selectionne un item et referme le menu', async () => {
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

  it('ignore la selection d un item desactive', () => {
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

  it('ferme sur Echap et rend le focus au declencheur', async () => {
    render(<DropdownMenu label="Actions" items={items} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    fireEvent.click(trigger)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('affiche le raccourci de l item', () => {
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

  it('rend une navigation etiquetee avec une liste ordonnee', () => {
    render(<Breadcrumb items={items} />)
    const nav = screen.getByRole('navigation', { name: "Fil d'Ariane" })
    expect(nav.querySelector('ol')).not.toBeNull()
  })

  it('marque la derniere etape avec aria-current=page', () => {
    render(<Breadcrumb items={items} />)
    const current = screen.getByText('OdoroKit')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.tagName).toBe('SPAN')
  })

  it('rend les etapes precedentes en liens', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByRole('link', { name: 'Accueil' }).getAttribute('href')).toBe('/')
    expect(screen.queryByRole('link', { name: 'OdoroKit' })).toBeNull()
  })

  it('accepte un separateur personnalise', () => {
    render(<Breadcrumb items={items} separator="/" />)
    expect(screen.getAllByText('/')).toHaveLength(2)
  })
})

describe('Pagination', () => {
  it('affiche la fenetre autour de la page courante avec les ellipses', () => {
    render(<Pagination page={5} pageCount={10} onPageChange={vi.fn()} />)

    for (const name of ['1', '4', '5', '6', '10']) {
      expect(screen.getByRole('button', { name })).toBeDefined()
    }
    expect(screen.queryByRole('button', { name: '2' })).toBeNull()
    expect(screen.queryByRole('button', { name: '9' })).toBeNull()
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('omet les ellipses quand toutes les pages tiennent', () => {
    render(<Pagination page={2} pageCount={3} onPageChange={vi.fn()} />)
    expect(screen.queryByText('…')).toBeNull()
    for (const name of ['1', '2', '3']) {
      expect(screen.getByRole('button', { name })).toBeDefined()
    }
  })

  it('marque la page courante avec aria-current=page', () => {
    render(<Pagination page={5} pageCount={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '5' }).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(
      screen.getByRole('button', { name: '4' }).getAttribute('aria-current'),
    ).toBeNull()
  })

  it('declenche onPageChange au clic sur un numero', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('navigue avec les boutons precedent et suivant', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={5} pageCount={10} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Page precedente' }))
    expect(onPageChange).toHaveBeenCalledWith(4)

    fireEvent.click(screen.getByRole('button', { name: 'Page suivante' }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('neutralise precedent en premiere page et suivant en derniere', () => {
    const { rerender } = render(
      <Pagination page={1} pageCount={10} onPageChange={vi.fn()} />,
    )
    expect(
      (screen.getByRole('button', { name: 'Page precedente' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)

    rerender(<Pagination page={10} pageCount={10} onPageChange={vi.fn()} />)
    expect(
      (screen.getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement)
        .disabled,
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

  it('rend les en-tetes de colonnes avec scope=col', () => {
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.ref} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(2)
    expect(headers[0]?.getAttribute('scope')).toBe('col')
    expect(headers[0]?.textContent).toBe('Reference')
  })

  it('rend une ligne par entree, avec la cle ou le rendu personnalise', () => {
    render(<Table columns={columns} rows={rows} rowKey={(row) => row.ref} />)
    expect(screen.getByText('F-001')).toBeDefined()
    expect(screen.getByText('120 EUR').tagName).toBe('STRONG')
  })

  it('affiche le message vide sur toute la largeur', () => {
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

  it('masque la legende par defaut et l affiche sur demande', () => {
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
  it('ne rend rien quand il est ferme', () => {
    render(
      <Drawer open={false} onClose={vi.fn()} title="Filtres">
        <p>Corps</p>
      </Drawer>,
    )
    expect(screen.queryByText('Filtres')).toBeNull()
  })

  it('rend le titre, la description et le contenu quand il est ouvert', () => {
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

  it('ferme depuis la croix', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" />)
    fireEvent.click(screen.getByRole('button', { name: 'Fermer', hidden: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ferme sur Echap en passant par l etat applicatif', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBeNull()

    fireEvent(dialog as HTMLDialogElement, new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ferme au clic sur l arriere-plan', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" />)
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('respecte closeOnBackdrop', () => {
    const onClose = vi.fn()
    render(<Drawer open onClose={onClose} title="Filtres" closeOnBackdrop={false} />)
    fireEvent.click(document.querySelector('dialog') as HTMLDialogElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('se demonte immediatement sous prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { rerender } = render(<Drawer open onClose={vi.fn()} title="Filtres" />)
    rerender(<Drawer open={false} onClose={vi.fn()} title="Filtres" />)
    expect(screen.queryByText('Filtres')).toBeNull()
  })
})
