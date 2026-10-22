import { mockBranding } from '../mock/mockBranding.js'

// Replace this adapter when branding is supplied by an approved HTTP service.
export const brandingService = {
  get: (branchId) => mockBranding.read(branchId),
  save: (branding, branchId) => mockBranding.write(branding, branchId),
}
