import { defineConfig } from 'odoro'

export default defineConfig({
  // Le client vit dans son propre dossier : la racine du moteur l'y suit.
  root: 'client',
  alias: {
    '@': 'src',
  },
  build: {
    // Le serveur sert ce dossier en production.
    outDir: '../dist/client',
  },
  server: {
    port: 5180,
    // Les appels d'API sont transmis au serveur, qui tourne en parallele :
    // le navigateur ne voit qu'une seule origine, donc aucune question de CORS.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
