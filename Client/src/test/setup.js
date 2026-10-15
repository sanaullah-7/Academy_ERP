import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup, configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 3000 })

afterEach(() => { cleanup(); vi.restoreAllMocks(); window.localStorage.clear() })

// jsdom does not implement responsive media queries; browser checks cover real viewports.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
})
