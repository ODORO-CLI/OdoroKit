import { defineConfig } from 'odoro'

export default defineConfig({
  // The client lives in its own directory: the engine root follows it there.
  root: 'client',
  alias: {
    '@': 'src',
  },
  build: {
    // The server serves this directory in production.
    outDir: '../dist/client',
    // Every route becomes a complete document. See
    // `client/src/entry-server.tsx` for the list, and for how to do without it.
    prerender: true,
  },
  server: {
    port: 5180,
    // API calls are forwarded to the server, which runs alongside: the browser
    // only ever sees one origin, so no CORS question arises.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
