import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    clearMocks: true,
    // Bound jsdom workers to avoid CPU/memory contention in mounted workflow tests.
    maxWorkers: 2,
    include: ['src/**/*.test.{js,jsx}'],
  },
}))
