import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

import { App } from '@/App'

import '@/styles.css'

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Root element "#root" not found in index.html.')
}

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)

// A container that is already filled comes from prerendering: it has to be
// **hydrated**, that is, taken over as it stands with the events attached.
// Rebuilding it would throw away the page the visitor already sees only to draw
// it again identically — a flicker, and the whole benefit of prerendering lost.
//
// Empty, it is an ordinary render.
if (container.firstElementChild === null) createRoot(container).render(tree)
else hydrateRoot(container, tree)
