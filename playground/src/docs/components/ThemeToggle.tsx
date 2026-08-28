/**
 * Bascule de theme : systeme, clair, sombre.
 *
 * Le choix est pose en `data-theme` sur la racine — la convention que la
 * feuille odoro ecoute — et memorise en localStorage. `system` retire
 * l'attribut : la preference du navigateur reprend la main.
 *
 * @module
 */

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

function SunIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  )
}

function MoonIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

function MonitorIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  )
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
      className="o-inline-flex o-items-center o-justify-center o-size-9 o-rounded-md o-text-fg-muted hover:o-text-fg hover:o-bg-surface-hover o-transition-colors o-cursor-pointer"
    >
      {theme === 'system' ? (
        <MonitorIcon />
      ) : theme === 'light' ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </button>
  )
}
