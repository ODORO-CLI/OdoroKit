import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox.jsx'
import { RadioGroup } from './Radio.jsx'
import { Select } from './Select.jsx'
import { Slider } from './Slider.jsx'
import { Switch, switchClasses } from './Switch.jsx'
import { Textarea } from './Textarea.jsx'

describe('Textarea', () => {
  it('relie le libelle au champ', () => {
    render(<Textarea label="Message" />)
    expect(screen.getByLabelText('Message').tagName).toBe('TEXTAREA')
  })

  it('decrit le champ par son aide', () => {
    render(<Textarea label="Message" hint="Markdown accepte." />)
    const field = screen.getByLabelText('Message')
    const describedBy = field.getAttribute('aria-describedby')
    expect(describedBy).not.toBeNull()
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Markdown accepte.',
    )
  })

  it('signale l erreur et la substitue a l aide', () => {
    render(<Textarea label="Message" hint="Aide" error="Message trop court" />)
    const field = screen.getByLabelText('Message')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Message trop court')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('masque visuellement le libelle sans le retirer', () => {
    render(<Textarea label="Notes" hideLabel />)
    const field = screen.getByLabelText('Notes')
    const label = document.querySelector(`label[for="${field.id}"]`)
    expect(label?.className).toContain('o-sr-only')
  })

  it('accepte la saisie en mode non controle', () => {
    render(<Textarea label="Message" defaultValue="Bonjour" />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    fireEvent.change(field, { target: { value: 'Bonsoir' } })
    expect(field.value).toBe('Bonsoir')
  })

  it('laisse la valeur a l appelant en mode controle', () => {
    const onChange = vi.fn()
    render(<Textarea label="Message" value="Fixe" onChange={onChange} />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    fireEvent.change(field, { target: { value: 'Autre' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.value).toBe('Fixe')
  })

  it('suit le contenu quand autoResize est actif', () => {
    render(<Textarea label="Message" autoResize />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    Object.defineProperty(field, 'scrollHeight', { value: 120 })
    fireEvent.input(field, { target: { value: 'ligne 1\nligne 2' } })
    expect(field.style.height).toBe('120px')
  })

  it('ne touche pas a la hauteur sans autoResize', () => {
    render(<Textarea label="Message" />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    fireEvent.input(field, { target: { value: 'ligne' } })
    expect(field.style.height).toBe('auto')
  })

  it('respecte disabled', () => {
    render(<Textarea label="Message" disabled />)
    expect(screen.getByLabelText<HTMLTextAreaElement>('Message').disabled).toBe(true)
  })
})

describe('Select', () => {
  const options = [
    { value: 'fr', label: 'France' },
    { value: 'be', label: 'Belgique' },
    { value: 'ch', label: 'Suisse', disabled: true },
  ]

  it('rend une liste deroulante reliee a son libelle', () => {
    render(<Select label="Pays" options={options} />)
    expect(screen.getByRole('combobox', { name: 'Pays' })).toBeDefined()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('rend le placeholder comme option vide et desactivee', () => {
    render(<Select label="Pays" options={options} placeholder="Choisir un pays" />)
    const field = screen.getByRole<HTMLSelectElement>('combobox')
    expect(field.value).toBe('')
    const placeholder = screen.getByRole<HTMLOptionElement>('option', {
      name: 'Choisir un pays',
    })
    expect(placeholder.disabled).toBe(true)
  })

  it('accepte des enfants option a defaut de la liste options', () => {
    render(
      <Select label="Tri">
        <option value="date">Par date</option>
        <option value="nom">Par nom</option>
      </Select>,
    )
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('decrit le champ par son aide', () => {
    render(<Select label="Pays" options={options} hint="Expedition en Europe." />)
    const field = screen.getByRole('combobox')
    const describedBy = field.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Expedition en Europe.',
    )
  })

  it('signale l erreur et la substitue a l aide', () => {
    render(<Select label="Pays" options={options} hint="Aide" error="Choix requis" />)
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Choix requis')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('change de valeur en mode non controle', () => {
    render(<Select label="Pays" options={options} defaultValue="fr" />)
    const field = screen.getByRole<HTMLSelectElement>('combobox')
    fireEvent.change(field, { target: { value: 'be' } })
    expect(field.value).toBe('be')
  })

  it('laisse la valeur a l appelant en mode controle', () => {
    const onChange = vi.fn()
    render(<Select label="Pays" options={options} value="fr" onChange={onChange} />)
    const field = screen.getByRole<HTMLSelectElement>('combobox')
    fireEvent.change(field, { target: { value: 'be' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.value).toBe('fr')
  })

  it('respecte disabled', () => {
    render(<Select label="Pays" options={options} disabled />)
    expect(screen.getByRole<HTMLSelectElement>('combobox').disabled).toBe(true)
  })
})

describe('Checkbox', () => {
  it('rend une case reliee a son libelle', () => {
    render(<Checkbox label="Se souvenir de moi" />)
    expect(screen.getByRole('checkbox', { name: 'Se souvenir de moi' })).toBeDefined()
  })

  it('decrit la case par sa description', () => {
    render(<Checkbox label="Newsletter" description="Un courriel par mois." />)
    const field = screen.getByRole('checkbox')
    const describedBy = field.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Un courriel par mois.',
    )
  })

  it('bascule au clic en mode non controle', () => {
    render(<Checkbox label="Option" />)
    const field = screen.getByRole<HTMLInputElement>('checkbox')
    expect(field.checked).toBe(false)
    fireEvent.click(field)
    expect(field.checked).toBe(true)
    fireEvent.click(field)
    expect(field.checked).toBe(false)
  })

  it('demarre cochee avec defaultChecked', () => {
    render(<Checkbox label="Option" defaultChecked />)
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true)
  })

  it('laisse l etat a l appelant en mode controle', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Option" checked={false} onChange={onChange} />)
    const field = screen.getByRole<HTMLInputElement>('checkbox')
    fireEvent.click(field)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.checked).toBe(false)
  })

  it('remplit la boite dessinee quand la case est cochee', () => {
    render(<Checkbox label="Option" defaultChecked />)
    const box = document.querySelector('span[aria-hidden="true"]')
    expect(box?.className).toContain('o-bg-primary')
  })

  it('pose indeterminate sur l element natif', () => {
    render(<Checkbox label="Tout selectionner" indeterminate />)
    expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(true)
  })

  it('montre l anneau de focus sur la boite quand l input a le focus', () => {
    render(<Checkbox label="Option" />)
    const field = screen.getByRole('checkbox')
    const box = () => document.querySelector('span[aria-hidden="true"]')
    expect(box()?.className).not.toContain('o-ring')

    fireEvent.focus(field)
    expect(box()?.className).toContain('o-ring')

    fireEvent.blur(field)
    expect(box()?.className).not.toContain('o-ring')
  })

  it('respecte disabled', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Option" disabled onChange={onChange} />)
    const field = screen.getByRole<HTMLInputElement>('checkbox')
    expect(field.disabled).toBe(true)

    // jsdom bascule la propriete DOM meme sur un input desactive : c'est
    // l'absence d'evenement change qui atteste du blocage.
    fireEvent.click(field)
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('RadioGroup', () => {
  const items = [
    { value: 'prive', label: 'Prive', description: 'Vous seul y accedez.' },
    { value: 'equipe', label: 'Equipe' },
    { value: 'public', label: 'Public', disabled: true },
  ]

  it('rend un groupe nomme par sa legende', () => {
    render(<RadioGroup label="Visibilite" items={items} />)
    expect(screen.getByRole('group', { name: 'Visibilite' })).toBeDefined()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('partage un meme name genere entre les items', () => {
    render(<RadioGroup label="Visibilite" items={items} />)
    const names = new Set(
      screen.getAllByRole<HTMLInputElement>('radio').map((radio) => radio.name),
    )
    expect(names.size).toBe(1)
    expect([...names][0]).not.toBe('')
  })

  it('decrit un item par sa description', () => {
    render(<RadioGroup label="Visibilite" items={items} />)
    const radio = screen.getByRole('radio', { name: 'Prive' })
    const describedBy = radio.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Vous seul y accedez.',
    )
  })

  it('selectionne un item au clic en mode non controle', () => {
    render(<RadioGroup label="Visibilite" items={items} defaultValue="prive" />)
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Prive' }).checked).toBe(
      true,
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Equipe' }))
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Equipe' }).checked).toBe(
      true,
    )
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Prive' }).checked).toBe(
      false,
    )
  })

  it('laisse la valeur a l appelant en mode controle', () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup
        label="Visibilite"
        items={items}
        value="prive"
        onValueChange={onValueChange}
      />,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Equipe' }))
    expect(onValueChange).toHaveBeenCalledWith('equipe')
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Prive' }).checked).toBe(
      true,
    )
  })

  it('ignore le clic sur un item desactive', () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup
        label="Visibilite"
        items={items}
        defaultValue="prive"
        onValueChange={onValueChange}
      />,
    )
    const disabledRadio = screen.getByRole<HTMLInputElement>('radio', { name: 'Public' })
    expect(disabledRadio.disabled).toBe(true)

    // jsdom bascule la propriete DOM meme sur un input desactive : c'est
    // l'absence d'evenement change qui atteste du blocage.
    fireEvent.click(disabledRadio)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('empile horizontalement quand orientation le demande', () => {
    render(<RadioGroup label="Visibilite" items={items} orientation="horizontal" />)
    const list = screen.getByRole('group').querySelector('div')
    expect(list?.className).toContain('o-flex-row')
  })
})

describe('Switch', () => {
  it('rend un interrupteur relie a son libelle', () => {
    render(<Switch label="Notifications" />)
    const control = screen.getByRole('switch', { name: 'Notifications' })
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('decrit l interrupteur par sa description', () => {
    render(<Switch label="Notifications" description="Un courriel par commentaire." />)
    const control = screen.getByRole('switch')
    const describedBy = control.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Un courriel par commentaire.',
    )
  })

  it('bascule au clic en mode non controle', () => {
    render(<Switch label="Notifications" />)
    const control = screen.getByRole('switch')
    fireEvent.click(control)
    expect(control.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(control)
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('demarre active avec defaultChecked', () => {
    render(<Switch label="Notifications" defaultChecked />)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })

  it('laisse l etat a l appelant en mode controle', () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch label="Notifications" checked={false} onCheckedChange={onCheckedChange} />,
    )
    const control = screen.getByRole('switch')
    fireEvent.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('colore la piste selon l etat', () => {
    render(<Switch label="Notifications" defaultChecked />)
    expect(screen.getByRole('switch').className).toContain('o-bg-primary')
  })

  it('applique les classes de taille', () => {
    render(<Switch label="Notifications" size="lg" />)
    expect(screen.getByRole('switch').className).toContain('o-w-12')
  })

  it('expose sa table de classes pour habiller un autre element', () => {
    expect(switchClasses({ checked: 'true' })).toContain('o-bg-primary')
    expect(switchClasses({ size: 'sm' })).toContain('o-w-7')
  })

  it('respecte disabled', () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Notifications" disabled onCheckedChange={onCheckedChange} />)
    const control = screen.getByRole('switch')
    fireEvent.click(control)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(control.getAttribute('aria-checked')).toBe('false')
  })
})

describe('Slider', () => {
  it('rend un curseur relie a son libelle', () => {
    render(<Slider label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeDefined()
  })

  it('demarre au milieu de la plage comme le natif', () => {
    render(<Slider label="Volume" min={0} max={100} />)
    expect(screen.getByRole<HTMLInputElement>('slider').value).toBe('50')
  })

  it('decrit le curseur par son aide', () => {
    render(<Slider label="Volume" hint="En pourcentage." />)
    const field = screen.getByRole('slider')
    const describedBy = field.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'En pourcentage.',
    )
  })

  it('signale l erreur et la substitue a l aide', () => {
    render(<Slider label="Volume" hint="Aide" error="Valeur trop haute" />)
    expect(screen.getByRole('slider').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Valeur trop haute')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('change de valeur en mode non controle', () => {
    render(<Slider label="Volume" defaultValue={20} />)
    const field = screen.getByRole<HTMLInputElement>('slider')
    fireEvent.change(field, { target: { value: '80' } })
    expect(field.value).toBe('80')
  })

  it('laisse la valeur a l appelant en mode controle', () => {
    const onChange = vi.fn()
    render(<Slider label="Volume" value={30} onChange={onChange} />)
    const field = screen.getByRole<HTMLInputElement>('slider')
    fireEvent.change(field, { target: { value: '80' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.value).toBe('30')
  })

  it('affiche la valeur courante avec showValue', () => {
    render(<Slider label="Volume" defaultValue={20} showValue />)
    expect(screen.getByText('20')).toBeDefined()

    fireEvent.change(screen.getByRole('slider'), { target: { value: '45' } })
    expect(screen.getByText('45')).toBeDefined()
  })

  it('met en forme la valeur avec formatValue', () => {
    render(
      <Slider
        label="Volume"
        defaultValue={20}
        showValue
        formatValue={(value) => `${value} %`}
      />,
    )
    expect(screen.getByText('20 %')).toBeDefined()
  })

  it('respecte disabled', () => {
    render(<Slider label="Volume" disabled />)
    expect(screen.getByRole<HTMLInputElement>('slider').disabled).toBe(true)
  })
})
