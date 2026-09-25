import { defineConfig } from 'tsup'

/**
 * Two entries: the client has no React in it, so a server, a vanilla script
 * or another framework can use it without pulling React; the hooks live in
 * `./react`, with React external.
 */
export default defineConfig({
  entry: { index: 'src/index.ts', react: 'src/react.tsx' },
  format: ['esm'],
  target: 'es2022',
  platform: 'browser',
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
})
