import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Alert, alertClasses } from './Alert.jsx'
import { Avatar, AvatarGroup } from './Avatar.jsx'
import { Badge, badgeClasses } from './Badge.jsx'
import { Card, cardClasses } from './Card.jsx'
import { Kbd } from './Kbd.jsx'
import { Progress } from './Progress.jsx'
import { Separator } from './Separator.jsx'
import { Skeleton } from './Skeleton.jsx'
import { Spinner } from './Spinner.jsx'

describe('Card', () => {
  it('renders the title, the description, the content and the footer', () => {
    render(
      <Card title="Projet" description="Librairie maison" footer={<p>Pied</p>}>
        <p>Corps</p>
      </Card>,
    )
    expect(screen.getByText('Projet')).toBeDefined()
    expect(screen.getByText('Librairie maison')).toBeDefined()
    expect(screen.getByText('Corps')).toBeDefined()
    expect(screen.getByText('Pied')).toBeDefined()
  })

  it('is outlined by default', () => {
    const { container } = render(<Card>Corps</Card>)
    const root = container.firstElementChild
    expect(root?.className).toContain('o-border-w-1')
    expect(root?.className).toContain('o-border-zinc-200 dark:o-border-zinc-800')
  })

  it('applies the elevated and ghost variants', () => {
    const { container: elevated } = render(<Card variant="elevated">Corps</Card>)
    expect(elevated.firstElementChild?.className).toContain('o-shadow-md')
    expect(elevated.firstElementChild?.className).not.toContain('o-border-w-1')

    const { container: ghost } = render(<Card variant="ghost">Corps</Card>)
    expect(ghost.firstElementChild?.className).toContain(
      'o-bg-zinc-50 dark:o-bg-zinc-900',
    )
    expect(ghost.firstElementChild?.className).not.toContain('o-shadow-md')
  })

  it('becomes interactive on demand', () => {
    const { container } = render(<Card interactive>Corps</Card>)
    const className = container.firstElementChild?.className ?? ''
    expect(className).toContain('o-cursor-pointer')
    expect(className).toContain('hover:o-lift-sm')
  })

  it('removes the padding with padding=none', () => {
    render(<Card padding="none">Corps</Card>)
    expect(screen.getByText('Corps').className).not.toContain('o-p-4')
  })

  it('renders the media full width above the body', () => {
    render(
      <Card media={<img src="visuel.png" alt="Visuel" />} title="Projet">
        Corps
      </Card>,
    )
    const media = screen.getByAltText('Visuel').parentElement
    expect(media?.className).toContain('o-w-full')
    expect(media?.className).toContain('o-overflow-hidden')
  })

  it('exposes its class table', () => {
    expect(cardClasses({ variant: 'ghost' })).toContain('o-bg-zinc-50 dark:o-bg-zinc-900')
    expect(cardClasses({ interactive: 'true' })).toContain('o-cursor-pointer')
  })

  it('forwards the ref', () => {
    let node: HTMLDivElement | null = null
    render(
      <Card
        ref={(element) => {
          node = element
        }}
      >
        Corps
      </Card>,
    )
    expect(node).not.toBeNull()
  })
})

describe('Badge', () => {
  it('renders the label', () => {
    render(<Badge>Publie</Badge>)
    expect(screen.getByText('Publie')).toBeDefined()
  })

  it('uses the soft rendering by default', () => {
    render(<Badge tone="success">Publie</Badge>)
    const className = screen.getByText('Publie').className
    expect(className).toContain('o-bg-emerald-50 dark:o-bg-emerald-950')
    expect(className).toContain('o-text-emerald-600 dark:o-text-emerald-400')
  })

  it('applies the solid and outline renderings', () => {
    render(
      <Badge tone="danger" variant="solid">
        Rejete
      </Badge>,
    )
    expect(screen.getByText('Rejete').className).toContain(
      'o-bg-red-600 dark:o-bg-red-400',
    )
    expect(screen.getByText('Rejete').className).toContain(
      'o-text-white dark:o-text-zinc-950',
    )

    render(
      <Badge tone="info" variant="outline">
        Brouillon
      </Badge>,
    )
    expect(screen.getByText('Brouillon').className).toContain(
      'o-border-sky-200 dark:o-border-sky-800',
    )
  })

  it('displays a colored dot with dot', () => {
    render(<Badge dot>Actif</Badge>)
    const dot = screen.getByText('Actif').querySelector('[aria-hidden="true"]')
    expect(dot).not.toBeNull()
    expect(dot?.className).toContain('o-bg-current')
  })

  it('exposes its class function', () => {
    expect(badgeClasses({ tone: 'warning', variant: 'solid' })).toContain(
      'o-bg-amber-600 dark:o-bg-amber-400',
    )
    expect(badgeClasses()).toContain('o-bg-zinc-100 dark:o-bg-zinc-950')
  })
})

describe('Avatar', () => {
  it('displays the image when it is provided', () => {
    render(<Avatar src="jean.png" alt="Photo de Jean" name="Jean Dupont" />)
    expect(screen.getByAltText('Photo de Jean')).toBeDefined()
    expect(screen.queryByText('JD')).toBeNull()
  })

  it('displays the initials without an image', () => {
    render(<Avatar alt="Photo de Jean" name="Jean Dupont" />)
    expect(screen.getByText('JD')).toBeDefined()
    expect(screen.getByRole('img', { name: 'Photo de Jean' })).toBeDefined()
  })

  it('falls back to the initials when the image fails', async () => {
    render(<Avatar src="cassee.png" alt="Photo de Jean" name="Jean Dupont" />)
    fireEvent.error(screen.getByAltText('Photo de Jean'))
    await waitFor(() => expect(screen.getByText('JD')).toBeDefined())
  })

  it('takes the initials from the first two words only', () => {
    render(<Avatar alt="Photo" name="anne marie de la tour" />)
    expect(screen.getByText('AM')).toBeDefined()
  })

  it('applies the square shape', () => {
    render(<Avatar alt="Photo" name="Jean Dupont" shape="square" />)
    expect(screen.getByRole('img', { name: 'Photo' }).className).toContain('o-rounded-md')
  })

  it('limits the group and sums up the rest as +N', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar alt="Ana" name="Ana Ruiz" />
        <Avatar alt="Bob" name="Bob Marchand" />
        <Avatar alt="Chloe" name="Chloe Petit" />
        <Avatar alt="Dan" name="Dan Morel" />
      </AvatarGroup>,
    )
    expect(screen.getByText('AR')).toBeDefined()
    expect(screen.getByText('BM')).toBeDefined()
    expect(screen.queryByText('CP')).toBeNull()
    expect(screen.getByText('+2')).toBeDefined()
  })

  it('overlaps the avatars with a negative margin', () => {
    render(
      <AvatarGroup>
        <Avatar alt="Ana" name="Ana Ruiz" />
        <Avatar alt="Bob" name="Bob Marchand" />
      </AvatarGroup>,
    )
    const second = screen.getByText('BM').closest('span[style]')
    expect((second as HTMLElement | null)?.style.marginInlineStart).toBe('-0.5rem')
  })
})

describe('Alert', () => {
  it('uses role=status for the non critical registers', () => {
    render(<Alert tone="info">Message</Alert>)
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('uses role=alert for the danger register', () => {
    render(<Alert tone="danger">Message</Alert>)
    expect(screen.getByRole('alert')).toBeDefined()
  })

  it('renders the title and the body', () => {
    render(<Alert title="Attention">Verifiez la saisie.</Alert>)
    expect(screen.getByText('Attention')).toBeDefined()
    expect(screen.getByText('Verifiez la saisie.')).toBeDefined()
  })

  it('applies the colors of the tone', () => {
    render(<Alert tone="warning">Message</Alert>)
    const className = screen.getByRole('status').className
    expect(className).toContain('o-bg-amber-50 dark:o-bg-amber-950')
    expect(className).toContain('o-border-amber-200 dark:o-border-amber-800')
  })

  it('displays a default icon, replaceable or removable', () => {
    render(<Alert>Message</Alert>)
    expect(screen.getByRole('status').querySelector('svg')).not.toBeNull()

    render(<Alert tone="success" icon={null} title="Sans icone" />)
    const bare = screen.getByText('Sans icone').closest('[role="status"]')
    expect(bare?.querySelector('svg')).toBeNull()
  })

  it('offers no dismissal without onClose', () => {
    render(<Alert>Message</Alert>)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('closes with an animated exit then warns the caller', async () => {
    const onClose = vi.fn()
    render(<Alert onClose={onClose}>Message</Alert>)

    screen.getByRole('button', { name: 'Close the message' }).click()
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Message')).toBeNull()
  })

  it('exposes its class table', () => {
    expect(alertClasses({ tone: 'danger' })).toContain('o-bg-red-50 dark:o-bg-red-950')
  })
})

describe('Separator', () => {
  it('is decorative by default', () => {
    const { container } = render(<Separator />)
    const root = container.firstElementChild
    expect(root?.getAttribute('aria-hidden')).toBe('true')
    expect(root?.getAttribute('role')).toBeNull()
  })

  it('carries role=separator when it is semantic', () => {
    render(<Separator decorative={false} />)
    const separator = screen.getByRole('separator')
    // The horizontal orientation is implicit in ARIA.
    expect(separator.getAttribute('aria-orientation')).toBeNull()
  })

  it('declares the vertical orientation', () => {
    render(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe(
      'vertical',
    )
  })

  it('renders a label centered between two rules', () => {
    const { container } = render(<Separator label="ou" />)
    expect(screen.getByText('ou')).toBeDefined()
    expect(container.querySelectorAll('.o-h-px')).toHaveLength(2)
  })
})

describe('Skeleton', () => {
  it('is removed from the accessibility tree', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })

  it('animates the skeleton', () => {
    const { container } = render(<Skeleton variant="rect" />)
    expect(container.firstElementChild?.className).toContain('o-animate-shimmer')
  })

  it('fully rounds the circle variant', () => {
    const { container } = render(<Skeleton variant="circle" width={40} height={40} />)
    expect(container.firstElementChild?.className).toContain('o-rounded-full')
  })

  it('renders n lines whose last one is at 60 percent', () => {
    const { container } = render(<Skeleton lines={3} />)
    const rows = container.querySelectorAll('span')
    expect(rows).toHaveLength(3)
    expect((rows[2] as HTMLElement).style.width).toBe('60%')
    expect((rows[0] as HTMLElement).style.width).toBe('')
  })

  it('accepts explicit dimensions', () => {
    const { container } = render(<Skeleton variant="rect" width="10rem" height={8} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.style.width).toBe('10rem')
    expect(root.style.height).toBe('8px')
  })
})

describe('Spinner', () => {
  it('announces itself as a status with its default label', () => {
    render(<Spinner />)
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Loading')
  })

  it('accepts a custom label, visually hidden', () => {
    render(<Spinner label="Envoi en cours" />)
    const label = screen.getByText('Envoi en cours')
    expect(label.className).toContain('o-sr-only')
  })

  it('keeps its decorative drawing', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('Progress', () => {
  it('exposes its value in ARIA', () => {
    render(<Progress value={40} label="Import" />)
    const bar = screen.getByRole('progressbar', { name: 'Import' })
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('clamps the value between 0 and max', () => {
    render(<Progress value={150} max={100} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('fills the track at the percentage of the value', () => {
    render(<Progress value={30} max={60} />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('50%')
  })

  it('omits aria-valuenow in indeterminate mode', () => {
    render(<Progress indeterminate />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBeNull()
    expect((bar.firstElementChild as HTMLElement).className).toContain(
      'o-animate-indeterminate',
    )
  })

  it('displays the percentage with showValue', () => {
    render(<Progress value={25} showValue />)
    expect(screen.getByText('25%').className).toContain('o-tabular-nums')
  })

  it('colors the fill according to the tone', () => {
    render(<Progress value={10} tone="success" />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.className).toContain('o-bg-emerald-600 dark:o-bg-emerald-400')
  })
})

describe('Kbd', () => {
  it('renders a single key', () => {
    render(<Kbd>Echap</Kbd>)
    const key = screen.getByText('Echap')
    expect(key.tagName).toBe('KBD')
    expect(key.className).toContain('o-font-mono')
  })

  it('renders a combination separated by +', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'Maj', 'K']} />)
    const keys = container.querySelectorAll('kbd kbd')
    expect(keys).toHaveLength(3)
    expect(screen.getAllByText('+')).toHaveLength(2)
    expect(screen.getByText('Ctrl')).toBeDefined()
    expect(screen.getByText('K')).toBeDefined()
  })

  it('hides the separators from screen readers', () => {
    render(<Kbd keys={['Ctrl', 'K']} />)
    expect(screen.getByText('+').getAttribute('aria-hidden')).toBe('true')
  })
})
