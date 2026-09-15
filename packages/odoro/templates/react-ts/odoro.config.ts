import { defineConfig } from 'odoro'

export default defineConfig({
  alias: {
    '@': 'src',
  },
  server: {
    port: 5180,
  },
  build: {
    // Every route becomes a complete document in `dist/`. See
    // `src/entry-server.tsx` for the list, and for how to do without it.
    prerender: true,
  },
})
