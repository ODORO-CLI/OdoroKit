/// <reference types="odoro/client" />

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyFontFamily, loadGoogleFonts } from 'odoro-libs/styles'

import { App } from './App.jsx'

// La feuille complete, et non la feuille de base : cette documentation
// demontre la palette brute (`o-from-sky-500`), dont les jalons de degrade
// n'existent que dans celle-ci.
import 'odoro-libs/styles.full.css'

// Polices du site, chargees par CDN — rien dans le bundle.
loadGoogleFonts([
  { family: 'Inter', weights: [400, 500, 600, 700, 800] },
  { family: 'JetBrains Mono', weights: [400, 500] },
])
applyFontFamily('sans', 'Inter')
applyFontFamily('mono', 'JetBrains Mono')

const container = document.getElementById('root')
if (container === null) throw new Error('Element racine "#root" introuvable.')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
