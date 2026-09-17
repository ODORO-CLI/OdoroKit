import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'

// Le socle d abord — variables, remise a zero, et les utilitaires produits a
// la construction pour les seules classes que ce projet emploie. La feuille du
// projet vient apres : c est elle qui doit l emporter.
import '@odoro-cli/libs/styles.css'
import '@/styles.css'

const racine = document.getElementById('root')
if (racine === null) {
  throw new Error('Element racine "#root" absent de index.html.')
}

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
