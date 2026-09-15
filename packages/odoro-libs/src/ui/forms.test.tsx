import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox.jsx'
import { RadioGroup } from './Radio.jsx'
import { Select } from './Select.jsx'
import { Slider } from './Slider.jsx'
import { Switch, switchClasses } from './Switch.jsx'
import { Textarea } from './Textarea.jsx'

describe('Textarea', () => {
  it('ties the label to the field', () => {
    render(<Textarea label="Message" />)
    expect(screen.getByLabelText('Message').tagName).toBe('TEXTAREA')
  })

  it('describes the field by its hint', () => {
    render(<Textarea label="Message" hint="Markdown accepte." />)
    const field = screen.getByLabelText('Message')
    const describedBy = field.getAttribute('aria-describedby')
    expect(describedBy).not.toBeNull()
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Markdown accepte.',
    )
  })

  it('reports the error and substitutes it for the hint', () => {
    render(<Textarea label="Message" hint="Aide" error="Message trop court" />)
    const field = screen.getByLabelText('Message')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Message trop court')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('visually hides the label without removing it', () => {
    render(<Textarea label="Notes" hideLabel />)
    const field = screen.getByLabelText('Notes')
    const label = document.querySelector(`label[for="${field.id}"]`)
    expect(label?.className).toContain('o-sr-only')
  })

  it('accepts typing in uncontrolled mode', () => {
    render(<Textarea label="Message" defaultValue="Bonjour" />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    fireEvent.change(field, { target: { value: 'Bonsoir' } })
    expect(field.value).toBe('Bonsoir')
  })

  it('leaves the value to the caller in controlled mode', () => {
    const onChange = vi.fn()
    render(<Textarea label="Message" value="Fixe" onChange={onChange} />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    fireEvent.change(field, { target: { value: 'Autre' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.value).toBe('Fixe')
  })

  it('follows the content when autoResize is on', () => {
    render(<Textarea label="Message" autoResize />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    Object.defineProperty(field, 'scrollHeight', { value: 120 })
    fireEvent.input(field, { target: { value: 'ligne 1\nligne 2' } })
    expect(field.style.height).toBe('120px')
  })

  it('does not touch the height without autoResize', () => {
    render(<Textarea label="Message" />)
    const field = screen.getByLabelText<HTMLTextAreaElement>('Message')
    fireEvent.input(field, { target: { value: 'ligne' } })
    expect(field.style.height).toBe('auto')
  })

  it('respects disabled', () => {
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

  it('renders a dropdown list tied to its label', () => {
    render(<Select label="Pays" options={options} />)
    expect(screen.getByRole('combobox', { name: 'Pays' })).toBeDefined()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders the placeholder as an empty and disabled option', () => {
    render(<Select label="Pays" options={options} placeholder="Choisir un pays" />)
    const field = screen.getByRole<HTMLSelectElement>('combobox')
    expect(field.value).toBe('')
    const placeholder = screen.getByRole<HTMLOptionElement>('option', {
      name: 'Choisir un pays',
    })
    expect(placeholder.disabled).toBe(true)
  })

  it('accepts option children in the absence of the options list', () => {
    render(
      <Select label="Tri">
        <option value="date">Par date</option>
        <option value="nom">Par nom</option>
      </Select>,
    )
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('describes the field by its hint', () => {
    render(<Select label="Pays" options={options} hint="Expedition en Europe." />)
    const field = screen.getByRole('combobox')
    const describedBy = field.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Expedition en Europe.',
    )
  })

  it('reports the error and substitutes it for the hint', () => {
    render(<Select label="Pays" options={options} hint="Aide" error="Choix requis" />)
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Choix requis')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('changes value in uncontrolled mode', () => {
    render(<Select label="Pays" options={options} defaultValue="fr" />)
    const field = screen.getByRole<HTMLSelectElement>('combobox')
    fireEvent.change(field, { target: { value: 'be' } })
    expect(field.value).toBe('be')
  })

  it('leaves the value to the caller in controlled mode', () => {
    const onChange = vi.fn()
    render(<Select label="Pays" options={options} value="fr" onChange={onChange} />)
    const field = screen.getByRole<HTMLSelectElement>('combobox')
    fireEvent.change(field, { target: { value: 'be' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.value).toBe('fr')
  })

  it('respects disabled', () => {
    render(<Select label="Pays" options={options} disabled />)
    expect(screen.getByRole<HTMLSelectElement>('combobox').disabled).toBe(true)
  })
})

describe('Checkbox', () => {
  it('renders a box tied to its label', () => {
    render(<Checkbox label="Se souvenir de moi" />)
    expect(screen.getByRole('checkbox', { name: 'Se souvenir de moi' })).toBeDefined()
  })

  it('describes the box by its description', () => {
    render(<Checkbox label="Newsletter" description="Un courriel par mois." />)
    const field = screen.getByRole('checkbox')
    const describedBy = field.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Un courriel par mois.',
    )
  })

  it('toggles on a click in uncontrolled mode', () => {
    render(<Checkbox label="Option" />)
    const field = screen.getByRole<HTMLInputElement>('checkbox')
    expect(field.checked).toBe(false)
    fireEvent.click(field)
    expect(field.checked).toBe(true)
    fireEvent.click(field)
    expect(field.checked).toBe(false)
  })

  it('starts checked with defaultChecked', () => {
    render(<Checkbox label="Option" defaultChecked />)
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true)
  })

  it('leaves the state to the caller in controlled mode', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Option" checked={false} onChange={onChange} />)
    const field = screen.getByRole<HTMLInputElement>('checkbox')
    fireEvent.click(field)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.checked).toBe(false)
  })

  it('fills the drawn box when the checkbox is checked', () => {
    render(<Checkbox label="Option" defaultChecked />)
    const box = document.querySelector('span[aria-hidden="true"]')
    expect(box?.className).toContain('o-bg-brand-600 dark:o-bg-brand-400')
  })

  it('sets indeterminate on the native element', () => {
    render(<Checkbox label="Tout selectionner" indeterminate />)
    expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(true)
  })

  it('shows the focus ring on the box when the input has the focus', () => {
    render(<Checkbox label="Option" />)
    const field = screen.getByRole('checkbox')
    const box = () => document.querySelector('span[aria-hidden="true"]')
    expect(box()?.className).not.toContain('o-ring')

    fireEvent.focus(field)
    expect(box()?.className).toContain('o-ring')

    fireEvent.blur(field)
    expect(box()?.className).not.toContain('o-ring')
  })

  it('respects disabled', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Option" disabled onChange={onChange} />)
    const field = screen.getByRole<HTMLInputElement>('checkbox')
    expect(field.disabled).toBe(true)

    // jsdom toggles the DOM property even on a disabled input: it is
    // the absence of a change event that attests the blocking.
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

  it('renders a group named by its legend', () => {
    render(<RadioGroup label="Visibilite" items={items} />)
    expect(screen.getByRole('group', { name: 'Visibilite' })).toBeDefined()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('shares one same generated name across the items', () => {
    render(<RadioGroup label="Visibilite" items={items} />)
    const names = new Set(
      screen.getAllByRole<HTMLInputElement>('radio').map((radio) => radio.name),
    )
    expect(names.size).toBe(1)
    expect([...names][0]).not.toBe('')
  })

  it('describes an item by its description', () => {
    render(<RadioGroup label="Visibilite" items={items} />)
    const radio = screen.getByRole('radio', { name: 'Prive' })
    const describedBy = radio.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Vous seul y accedez.',
    )
  })

  it('selects an item on a click in uncontrolled mode', () => {
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

  it('leaves the value to the caller in controlled mode', () => {
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

  it('ignores a click on a disabled item', () => {
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

    // jsdom toggles the DOM property even on a disabled input: it is
    // the absence of a change event that attests the blocking.
    fireEvent.click(disabledRadio)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('stacks horizontally when orientation asks for it', () => {
    render(<RadioGroup label="Visibilite" items={items} orientation="horizontal" />)
    const list = screen.getByRole('group').querySelector('div')
    expect(list?.className).toContain('o-flex-row')
  })
})

describe('Switch', () => {
  it('renders a toggle tied to its label', () => {
    render(<Switch label="Notifications" />)
    const control = screen.getByRole('switch', { name: 'Notifications' })
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('describes the toggle by its description', () => {
    render(<Switch label="Notifications" description="Un courriel par commentaire." />)
    const control = screen.getByRole('switch')
    const describedBy = control.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'Un courriel par commentaire.',
    )
  })

  it('toggles on a click in uncontrolled mode', () => {
    render(<Switch label="Notifications" />)
    const control = screen.getByRole('switch')
    fireEvent.click(control)
    expect(control.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(control)
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('starts on with defaultChecked', () => {
    render(<Switch label="Notifications" defaultChecked />)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })

  it('leaves the state to the caller in controlled mode', () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch label="Notifications" checked={false} onCheckedChange={onCheckedChange} />,
    )
    const control = screen.getByRole('switch')
    fireEvent.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('colors the track according to the state', () => {
    render(<Switch label="Notifications" defaultChecked />)
    expect(screen.getByRole('switch').className).toContain(
      'o-bg-brand-600 dark:o-bg-brand-400',
    )
  })

  it('applies the size classes', () => {
    render(<Switch label="Notifications" size="lg" />)
    expect(screen.getByRole('switch').className).toContain('o-w-12')
  })

  it('exposes its class table to style another element', () => {
    expect(switchClasses({ checked: 'true' })).toContain(
      'o-bg-brand-600 dark:o-bg-brand-400',
    )
    expect(switchClasses({ size: 'sm' })).toContain('o-w-7')
  })

  it('respects disabled', () => {
    const onCheckedChange = vi.fn()
    render(<Switch label="Notifications" disabled onCheckedChange={onCheckedChange} />)
    const control = screen.getByRole('switch')
    fireEvent.click(control)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(control.getAttribute('aria-checked')).toBe('false')
  })
})

describe('Slider', () => {
  it('renders a slider tied to its label', () => {
    render(<Slider label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeDefined()
  })

  it('starts in the middle of the range like the native one', () => {
    render(<Slider label="Volume" min={0} max={100} />)
    expect(screen.getByRole<HTMLInputElement>('slider').value).toBe('50')
  })

  it('describes the slider by its hint', () => {
    render(<Slider label="Volume" hint="En pourcentage." />)
    const field = screen.getByRole('slider')
    const describedBy = field.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy ?? '')?.textContent).toBe(
      'En pourcentage.',
    )
  })

  it('reports the error and substitutes it for the hint', () => {
    render(<Slider label="Volume" hint="Aide" error="Valeur trop haute" />)
    expect(screen.getByRole('slider').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Valeur trop haute')
    expect(screen.queryByText('Aide')).toBeNull()
  })

  it('changes value in uncontrolled mode', () => {
    render(<Slider label="Volume" defaultValue={20} />)
    const field = screen.getByRole<HTMLInputElement>('slider')
    fireEvent.change(field, { target: { value: '80' } })
    expect(field.value).toBe('80')
  })

  it('leaves the value to the caller in controlled mode', () => {
    const onChange = vi.fn()
    render(<Slider label="Volume" value={30} onChange={onChange} />)
    const field = screen.getByRole<HTMLInputElement>('slider')
    fireEvent.change(field, { target: { value: '80' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(field.value).toBe('30')
  })

  it('displays the current value with showValue', () => {
    render(<Slider label="Volume" defaultValue={20} showValue />)
    expect(screen.getByText('20')).toBeDefined()

    fireEvent.change(screen.getByRole('slider'), { target: { value: '45' } })
    expect(screen.getByText('45')).toBeDefined()
  })

  it('formats the value with formatValue', () => {
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

  it('respects disabled', () => {
    render(<Slider label="Volume" disabled />)
    expect(screen.getByRole<HTMLInputElement>('slider').disabled).toBe(true)
  })
})
