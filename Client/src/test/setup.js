import { clearPageResources } from '../services/localPageResources.js'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup, configure } from '@testing-library/react'

// Disposable test-only secrets keep tests independent of ignored local configuration.
for (const key of ['VITE_MOCK_ADMIN_PASSWORD','VITE_MOCK_STAFF_PASSWORD']) {
  if (!import.meta.env[key]) vi.stubEnv(key, crypto.randomUUID())
}
if (!import.meta.env.VITE_MOCK_ADMIN_EMAIL) vi.stubEnv('VITE_MOCK_ADMIN_EMAIL','admin@example.test')

configure({ asyncUtilTimeout: 3000 })

afterEach(() => { cleanup(); clearPageResources(); vi.restoreAllMocks(); window.localStorage.clear() })

// jsdom does not implement responsive media queries; browser checks cover real viewports.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
})
