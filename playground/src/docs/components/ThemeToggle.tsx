/**
 * Bascule de theme : systeme, clair, sombre.
 *
 * Le choix est pose en `data-theme` sur la racine — la convention que la
 * feuille odoro ecoute — et memorise en localStorage. `system` retire
 * l'attribut : la preference du navigateur reprend la main.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import { Monitor, Moon, Sun } from '@odoro-cli/icons/outline'
import { type ReactElement, useEffect, useState } from 'react'

const STORAGE_KEY = 'odoro-docs-theme'

type Theme = 'system' | 'light' | 'dark'

const ORDER: readonly Theme[] = ['system', 'light', 'dark']

const LABELS: Record<Theme, string> = {
  system: 'Theme : systeme',
  light: 'Theme : clair',
  dark: 'Theme : sombre',
}

/** Applique un theme a la racine du document. */
export function applyTheme(theme: Theme): void {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}

/** Theme memorise, ou `system`. */
export function storedTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

/** L'icone de chaque theme, dans l'ordre du cycle. */
const ICONS: Readonly<Record<Theme, IconData>> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

/** Bouton cyclant entre les trois themes. */
export function ThemeToggle(): ReactElement {
  const [theme, setTheme] = useState<Theme>(() => storedTheme())

  useEffect(() => {
    applyTheme(theme)
    try {
      if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Stockage indisponible : le theme reste applique pour la session.
    }
  }, [theme])

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] ?? 'system'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${LABELS[theme]} — basculer`}
      title={LABELS[theme]}
      className="o-inline-flex o-size-14 o-shrink-0 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-border-w-1 o-backdrop-blur-xl o-transition-colors db-gelule o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
    >
      <Icon icon={ICONS[theme]} size={18} />
    </button>
  )
}
