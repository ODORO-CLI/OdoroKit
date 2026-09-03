/// <reference types="odoro/client" />

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyFontFamily, loadGoogleFonts } from '@odoro-cli/libs/styles'

import { App } from './App.jsx'

// Le socle seul : variables, remise a zero, images-cles et transitions de
// page. Les utilitaires ne sont plus livres — ils sont produits a la
// construction, pour les seules classes que cette documentation emploie.
//
// Celles qu'elle assemble a l'execution — `o-text-${'${size}'}` dans la page de
// typographie — n'existent nulle part sous leur forme finale : elles sont
// declarees dans la `safelist` d'`odoro.config.ts`.
import '@odoro-cli/libs/styles.css'

// Polices du site, chargees par CDN — rien dans le bundle.
loadGoogleFonts([
  { family: 'Inter', weights: [400, 500, 600, 700, 800] },
  { family: 'JetBrains Mono', weights: [400, 500] },
])
applyFontFamily('sans', 'Inter')
applyFontFamily('mono', 'JetBrains Mono')

// La barre de defilement du document ne peut pas etre habillee par une classe
// applicative : elle appartient a l'element racine, qui est hors de l'arbre
// React. Elle est donc posee ici, une fois.
document.documentElement.classList.add('o-scrollbar', 'dark:o-scrollbar-dark')

const container = document.getElementById('root')
if (container === null) throw new Error('Element racine "#root" introuvable.')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
