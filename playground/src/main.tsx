/// <reference types="odoro/client" />

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App.jsx'

import 'odoro-libs/styles.css'

const container = document.getElementById('root')
if (container === null) throw new Error('Element racine "#root" introuvable.')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
