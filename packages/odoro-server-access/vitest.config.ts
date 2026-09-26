import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // The tests share one database: files run one after the other.
    fileParallelism: false,
  },
})
