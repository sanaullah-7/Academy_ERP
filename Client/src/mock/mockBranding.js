import { MOCK_BRANDING_KEY } from '../constants/storageKeys.js'

export const DEFAULT_BRANDING = Object.freeze({ name: 'Academy Management System', logo: null, primaryColor: '#008378' })

export class BrandingError extends Error {
  constructor(code, message) { super(message); this.name = 'BrandingError'; this.code = code }
}

export function validateBranding(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > 100 ||
      [...value.name].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ||
      (value.logo !== null && (typeof value.logo !== 'string' || !/^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp|gif)$/i.test(value.logo))) ||
      typeof value.primaryColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(value.primaryColor)) {
    throw new BrandingError('INVALID_BRANDING', 'Use a name of 1–100 characters, a local raster logo, and a six-digit HEX color.')
  }
  const channels = value.primaryColor.slice(1).match(/../g).map((hex) => {
    const channel = parseInt(hex, 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  // Existing primary controls use white text: require WCAG AA normal-text contrast.
  if (1.05 / (luminance + 0.05) < 4.5) throw new BrandingError('INVALID_BRANDING', 'Primary color must provide at least 4.5:1 contrast with white text.')
  return { name: value.name.trim(), logo: value.logo, primaryColor: value.primaryColor.toUpperCase() }
}

export const mockBranding = {
  read() {
    let raw
    try { raw = window.localStorage.getItem(MOCK_BRANDING_KEY) }
    catch { throw new BrandingError('STORAGE_READ_FAILED', 'Branding storage is unavailable.') }
    if (raw === null) return { ...DEFAULT_BRANDING }
    let stored
    try { stored = JSON.parse(raw) }
    catch { throw new BrandingError('CORRUPTED_BRANDING', 'Saved branding is not valid JSON; saved data was preserved.') }
    if (!stored || typeof stored !== 'object' || Array.isArray(stored) || !Object.hasOwn(stored, 'version')) {
      throw new BrandingError('CORRUPTED_BRANDING', 'Saved branding has an invalid envelope; saved data was preserved.')
    }
    if (stored.version !== 1) throw new BrandingError('UNSUPPORTED_VERSION', 'Saved branding version is unsupported; saved data was preserved.')
    return validateBranding(stored.branding)
  },
  write(value) {
    const branding = validateBranding(value)
    try { window.localStorage.setItem(MOCK_BRANDING_KEY, JSON.stringify({ version: 1, branding })) }
    catch { throw new BrandingError('STORAGE_WRITE_FAILED', 'Branding could not be saved.') }
    return branding
  },
}
