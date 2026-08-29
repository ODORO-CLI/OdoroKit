import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'

import '@odoro-cli/libs/styles.css'
import '@/styles.css'

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Element racine "#root" introuvable dans index.html.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
