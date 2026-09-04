import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // `node` reste le defaut : les essais de registre lisent des fichiers et
    // n'ont que faire d'un DOM. Ceux qui en veulent un le demandent par un
    // `@vitest-environment jsdom` en tete de fichier — un environnement global
    // ferait payer le montage d'un DOM a quarante-neuf essais qui l'ignorent.
    environment: 'node',
    include: ['scripts/**/*.test.ts', 'test/**/*.test.tsx'],
    restoreMocks: true,
  },
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@registre/hooks/useInView': new URL(
        './registry/hooks/use-in-view/hook.ts',
        import.meta.url,
      ).pathname,
    },
  },
})
