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
  it('rend le titre, la description, le contenu et le pied', () => {
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

  it('est bordee par defaut', () => {
    const { container } = render(<Card>Corps</Card>)
    const root = container.firstElementChild
    expect(root?.className).toContain('o-border-w-1')
    expect(root?.className).toContain('o-border-border')
  })

  it('applique les variantes elevated et ghost', () => {
    const { container: elevated } = render(<Card variant="elevated">Corps</Card>)
    expect(elevated.firstElementChild?.className).toContain('o-shadow-md')
    expect(elevated.firstElementChild?.className).not.toContain('o-border-w-1')

    const { container: ghost } = render(<Card variant="ghost">Corps</Card>)
    expect(ghost.firstElementChild?.className).toContain('o-bg-bg-subtle')
    expect(ghost.firstElementChild?.className).not.toContain('o-shadow-md')
  })

  it('devient interactive a la demande', () => {
    const { container } = render(<Card interactive>Corps</Card>)
    const className = container.firstElementChild?.className ?? ''
    expect(className).toContain('o-cursor-pointer')
    expect(className).toContain('hover:o-lift-sm')
  })

  it('supprime le padding avec padding=none', () => {
    render(<Card padding="none">Corps</Card>)
    expect(screen.getByText('Corps').className).not.toContain('o-p-4')
  })

  it('rend le media pleine largeur au-dessus du corps', () => {
    render(
      <Card media={<img src="visuel.png" alt="Visuel" />} title="Projet">
        Corps
      </Card>,
    )
    const media = screen.getByAltText('Visuel').parentElement
    expect(media?.className).toContain('o-w-full')
    expect(media?.className).toContain('o-overflow-hidden')
  })

  it('expose sa table de classes', () => {
    expect(cardClasses({ variant: 'ghost' })).toContain('o-bg-bg-subtle')
    expect(cardClasses({ interactive: 'true' })).toContain('o-cursor-pointer')
  })

  it('transmet la ref', () => {
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
  it('rend le libelle', () => {
    render(<Badge>Publie</Badge>)
    expect(screen.getByText('Publie')).toBeDefined()
  })

  it('utilise le rendu soft par defaut', () => {
    render(<Badge tone="success">Publie</Badge>)
    const className = screen.getByText('Publie').className
    expect(className).toContain('o-bg-success-soft')
    expect(className).toContain('o-text-success')
  })

  it('applique les rendus solid et outline', () => {
    render(
      <Badge tone="danger" variant="solid">
        Rejete
      </Badge>,
    )
    expect(screen.getByText('Rejete').className).toContain('o-bg-danger')
    expect(screen.getByText('Rejete').className).toContain('o-text-on-danger')

    render(
      <Badge tone="info" variant="outline">
        Brouillon
      </Badge>,
    )
    expect(screen.getByText('Brouillon').className).toContain('o-border-info-border')
  })

  it('affiche un point colore avec dot', () => {
    render(<Badge dot>Actif</Badge>)
    const point = screen.getByText('Actif').querySelector('[aria-hidden="true"]')
    expect(point).not.toBeNull()
    expect(point?.className).toContain('o-bg-current')
  })

  it('expose sa fonction de classes', () => {
    expect(badgeClasses({ tone: 'warning', variant: 'solid' })).toContain('o-bg-warning')
    expect(badgeClasses()).toContain('o-bg-surface-sunken')
  })
})

describe('Avatar', () => {
  it('affiche l image quand elle est fournie', () => {
    render(<Avatar src="jean.png" alt="Photo de Jean" name="Jean Dupont" />)
    expect(screen.getByAltText('Photo de Jean')).toBeDefined()
    expect(screen.queryByText('JD')).toBeNull()
  })

  it('affiche les initiales sans image', () => {
    render(<Avatar alt="Photo de Jean" name="Jean Dupont" />)
    expect(screen.getByText('JD')).toBeDefined()
    expect(screen.getByRole('img', { name: 'Photo de Jean' })).toBeDefined()
  })

  it('bascule sur les initiales quand l image echoue', async () => {
    render(<Avatar src="cassee.png" alt="Photo de Jean" name="Jean Dupont" />)
    fireEvent.error(screen.getByAltText('Photo de Jean'))
    await waitFor(() => expect(screen.getByText('JD')).toBeDefined())
  })

  it('tire les initiales des deux premiers mots seulement', () => {
    render(<Avatar alt="Photo" name="anne marie de la tour" />)
    expect(screen.getByText('AM')).toBeDefined()
  })

  it('applique la forme carree', () => {
    render(<Avatar alt="Photo" name="Jean Dupont" shape="square" />)
    expect(screen.getByRole('img', { name: 'Photo' }).className).toContain('o-rounded-md')
  })

  it('limite le groupe et resume le reste en +N', () => {
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

  it('superpose les avatars par une marge negative', () => {
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
  it('utilise role=status pour les registres non critiques', () => {
    render(<Alert tone="info">Message</Alert>)
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('utilise role=alert pour le registre danger', () => {
    render(<Alert tone="danger">Message</Alert>)
    expect(screen.getByRole('alert')).toBeDefined()
  })

  it('rend le titre et le corps', () => {
    render(<Alert title="Attention">Verifiez la saisie.</Alert>)
    expect(screen.getByText('Attention')).toBeDefined()
    expect(screen.getByText('Verifiez la saisie.')).toBeDefined()
  })

  it('applique les couleurs du ton', () => {
    render(<Alert tone="warning">Message</Alert>)
    const className = screen.getByRole('status').className
    expect(className).toContain('o-bg-warning-soft')
    expect(className).toContain('o-border-warning-border')
  })

  it('affiche une icone par defaut, remplacable ou supprimable', () => {
    render(<Alert>Message</Alert>)
    expect(screen.getByRole('status').querySelector('svg')).not.toBeNull()

    render(<Alert tone="success" icon={null} title="Sans icone" />)
    const bare = screen.getByText('Sans icone').closest('[role="status"]')
    expect(bare?.querySelector('svg')).toBeNull()
  })

  it('ne propose pas de fermeture sans onClose', () => {
    render(<Alert>Message</Alert>)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('ferme avec une sortie animee puis previent l appelant', async () => {
    const onClose = vi.fn()
    render(<Alert onClose={onClose}>Message</Alert>)

    screen.getByRole('button', { name: 'Fermer le message' }).click()
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Message')).toBeNull()
  })

  it('expose sa table de classes', () => {
    expect(alertClasses({ tone: 'danger' })).toContain('o-bg-danger-soft')
  })
})

describe('Separator', () => {
  it('est decoratif par defaut', () => {
    const { container } = render(<Separator />)
    const root = container.firstElementChild
    expect(root?.getAttribute('aria-hidden')).toBe('true')
    expect(root?.getAttribute('role')).toBeNull()
  })

  it('porte role=separator quand il est semantique', () => {
    render(<Separator decorative={false} />)
    const separator = screen.getByRole('separator')
    // L'orientation horizontale est implicite en ARIA.
    expect(separator.getAttribute('aria-orientation')).toBeNull()
  })

  it('declare l orientation verticale', () => {
    render(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe(
      'vertical',
    )
  })

  it('rend un libelle centre entre deux filets', () => {
    const { container } = render(<Separator label="ou" />)
    expect(screen.getByText('ou')).toBeDefined()
    expect(container.querySelectorAll('.o-h-px')).toHaveLength(2)
  })
})

describe('Skeleton', () => {
  it('est retire de l arbre d accessibilite', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })

  it('anime la silhouette', () => {
    const { container } = render(<Skeleton variant="rect" />)
    expect(container.firstElementChild?.className).toContain('o-animate-shimmer')
  })

  it('arrondit completement la variante circle', () => {
    const { container } = render(<Skeleton variant="circle" width={40} height={40} />)
    expect(container.firstElementChild?.className).toContain('o-rounded-full')
  })

  it('rend n lignes dont la derniere a 60 pour cent', () => {
    const { container } = render(<Skeleton lines={3} />)
    const rows = container.querySelectorAll('span')
    expect(rows).toHaveLength(3)
    expect((rows[2] as HTMLElement).style.width).toBe('60%')
    expect((rows[0] as HTMLElement).style.width).toBe('')
  })

  it('accepte des dimensions explicites', () => {
    const { container } = render(<Skeleton variant="rect" width="10rem" height={8} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.style.width).toBe('10rem')
    expect(root.style.height).toBe('8px')
  })
})

describe('Spinner', () => {
  it('s annonce comme un statut avec son libelle par defaut', () => {
    render(<Spinner />)
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Chargement')
  })

  it('accepte un libelle personnalise, masque visuellement', () => {
    render(<Spinner label="Envoi en cours" />)
    const label = screen.getByText('Envoi en cours')
    expect(label.className).toContain('o-sr-only')
  })

  it('garde son dessin decoratif', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('Progress', () => {
  it('expose sa valeur en ARIA', () => {
    render(<Progress value={40} label="Import" />)
    const bar = screen.getByRole('progressbar', { name: 'Import' })
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('borne la valeur entre 0 et max', () => {
    render(<Progress value={150} max={100} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('remplit la piste au pourcentage de la valeur', () => {
    render(<Progress value={30} max={60} />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('50%')
  })

  it('omet aria-valuenow en mode indetermine', () => {
    render(<Progress indeterminate />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBeNull()
    expect((bar.firstElementChild as HTMLElement).className).toContain(
      'o-animate-indeterminate',
    )
  })

  it('affiche le pourcentage avec showValue', () => {
    render(<Progress value={25} showValue />)
    expect(screen.getByText('25%').className).toContain('o-tabular-nums')
  })

  it('colore le remplissage suivant le ton', () => {
    render(<Progress value={10} tone="success" />)
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.className).toContain('o-bg-success')
  })
})

describe('Kbd', () => {
  it('rend une touche unique', () => {
    render(<Kbd>Echap</Kbd>)
    const key = screen.getByText('Echap')
    expect(key.tagName).toBe('KBD')
    expect(key.className).toContain('o-font-mono')
  })

  it('rend une combinaison separee par des +', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'Maj', 'K']} />)
    const keys = container.querySelectorAll('kbd kbd')
    expect(keys).toHaveLength(3)
    expect(screen.getAllByText('+')).toHaveLength(2)
    expect(screen.getByText('Ctrl')).toBeDefined()
    expect(screen.getByText('K')).toBeDefined()
  })

  it('masque les separateurs aux lecteurs d ecran', () => {
    render(<Kbd keys={['Ctrl', 'K']} />)
    expect(screen.getByText('+').getAttribute('aria-hidden')).toBe('true')
  })
})
