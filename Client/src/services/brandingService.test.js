import { describe, expect, it, vi } from 'vitest'
import { brandingService } from './brandingService.js'
import { DEFAULT_BRANDING } from '../mock/mockBranding.js'
import { MOCK_BRANDING_KEY, MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'

describe('isolated mock branding service', () => {
  it('uses defaults without writing or overwriting unrelated storage', () => {
    localStorage.setItem(MOCK_SESSION_KEY, 'session')
    localStorage.setItem(MOCK_DATABASE_KEY, 'database')
    expect(brandingService.get()).toEqual(DEFAULT_BRANDING)
    expect(localStorage.getItem(MOCK_BRANDING_KEY)).toBeNull()
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBe('session')
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe('database')
  })
  it('persists a bounded raster data URL for uploaded logo previews', () => {
    const logo = 'data:image/png;base64,iVBORw0KGgo='
    expect(brandingService.save({ ...DEFAULT_BRANDING, logo }).logo).toBe(logo)
    expect(brandingService.get().logo).toBe(logo)
  })
  it('persists normalized branding in a versioned independent key', () => {
    const saved = brandingService.save({ name: ' Fictional Academy ', logo: '/images/demo-logo.png', primaryColor: '#123abc' })
    expect(saved).toEqual({ ...DEFAULT_BRANDING, name: 'Fictional Academy', logo: '/images/demo-logo.png', primaryColor: '#123ABC' })
    expect(brandingService.get()).toEqual(saved)
    expect(JSON.parse(localStorage.getItem(MOCK_BRANDING_KEY)).version).toBe(1)
  })
  it('keeps theme colors isolated per branch while sharing academy identity', () => {
    brandingService.save({ ...DEFAULT_BRANDING, name: 'Branch Theme Academy', primaryColor: '#123ABC', sidebarBackground: '#123456' }, 'demo-central')
    expect(brandingService.get('demo-central')).toMatchObject({ name: 'Branch Theme Academy', primaryColor: '#123ABC', sidebarBackground: '#123456' })
    expect(brandingService.get('demo-north')).toMatchObject({ name: 'Branch Theme Academy', primaryColor: '#940016', sidebarBackground: '#FFFFFF' })
    brandingService.save({ ...DEFAULT_BRANDING, name: 'Branch Theme Academy', primaryColor: '#654321', sidebarBackground: '#222222', sidebarText: '#EEEEEE', sidebarIcon: '#DDDDDD' }, 'demo-north')
    expect(brandingService.get('demo-central')).toMatchObject({ primaryColor: '#123ABC', sidebarBackground: '#123456' })
    expect(brandingService.get('demo-north')).toMatchObject({ primaryColor: '#654321', sidebarBackground: '#222222', sidebarText: '#EEEEEE', sidebarIcon: '#DDDDDD' })
  })
  it.each(['#ffffff', '#00ff00', '#fff', 'red', '#123456;'])('rejects invalid or inaccessible color %s without changing saved data', (primaryColor) => {
    brandingService.save(DEFAULT_BRANDING)
    const raw = localStorage.getItem(MOCK_BRANDING_KEY)
    expect(() => brandingService.save({ ...DEFAULT_BRANDING, primaryColor })).toThrow()
    expect(localStorage.getItem(MOCK_BRANDING_KEY)).toBe(raw)
  })
  it.each(['', ' '.repeat(4), 'x'.repeat(101), 'Bad\nName'])('rejects invalid names', (name) => {
    expect(() => brandingService.save({ ...DEFAULT_BRANDING, name })).toThrow()
  })
  it.each(['javascript:alert(1)', '//example.com/a.png', 'https://example.com/a.png', '/images/../a.png', '/images/a.svg', '/images/a.png?secret=x'])('rejects unsafe logo %s', (logo) => {
    expect(() => brandingService.save({ ...DEFAULT_BRANDING, logo })).toThrow()
  })
  it.each(['{broken', 'null', '{}', JSON.stringify({ version: 2, branding: DEFAULT_BRANDING }), JSON.stringify({ version: 1, branding: { ...DEFAULT_BRANDING, primaryColor: '#FFFFFF' } })])('preserves invalid saved branding %s', (raw) => {
    localStorage.setItem(MOCK_BRANDING_KEY, raw)
    expect(() => brandingService.get()).toThrow()
    expect(localStorage.getItem(MOCK_BRANDING_KEY)).toBe(raw)
  })
  it('reports unavailable read and failed write explicitly', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(() => brandingService.get()).toThrow(expect.objectContaining({ code: 'STORAGE_READ_FAILED' }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(() => brandingService.save(DEFAULT_BRANDING)).toThrow(expect.objectContaining({ code: 'STORAGE_WRITE_FAILED' }))
  })
})
