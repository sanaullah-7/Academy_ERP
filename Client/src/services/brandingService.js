import { mockBranding } from '../mock/mockBranding.js'

// Replace this adapter when branding is supplied by an approved HTTP service.
export const brandingService = {
  get: () => mockBranding.read(),
  save: (branding) => mockBranding.write(branding),
}
