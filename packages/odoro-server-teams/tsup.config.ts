import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  target: 'es2022',
  platform: 'node',
  dts: true,
  splitting: false,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ['@odoro-cli/server', '@odoro-cli/server-accounts', 'zod'],
})
