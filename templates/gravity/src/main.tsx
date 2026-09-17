import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';

// Le socle d abord — variables, remise a zero, et les utilitaires produits a
// la construction pour les seules classes que ce projet emploie. La feuille du
// gabarit vient apres : c est elle qui doit l emporter.
import '@odoro-cli/libs/styles.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
