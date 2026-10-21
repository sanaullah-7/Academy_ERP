import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import { capturePageVersion, clearPageResources, peekPageResource, rememberPageResource } from './localPageResources.js'
import { authService } from './authService.js'

beforeEach(() => {
  clearPageResources()
  localStorage.setItem(MOCK_SESSION_KEY, 'test-session')
})

describe('current local page data on warm remount', () => {
  it('detaches cached records and resets transient request markers without changing data', () => {
    const value = { scopeKey: 'old', request: 3, data: [{ amount: 100 }] }
    rememberPageResource('fees', value, capturePageVersion())
    value.data[0].amount = 900
    const restored = peekPageResource('fees', { scopeKey: 'current', request: 0 })
    expect(restored).toEqual({ scopeKey: 'current', request: 0, data: [{ amount: 100 }] })
    restored.data[0].amount = 500
    expect(peekPageResource('fees').data[0].amount).toBe(100)
  })

  it.each([MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY, MOCK_SESSION_KEY])('invalidates every module after a canonical change to %s without waiting for events', key => {
    const version = capturePageVersion()
    rememberPageResource('dashboard', { count: 1 }, version)
    rememberPageResource('reports', { count: 1 }, version)
    localStorage.setItem(key, 'external update')
    expect(peekPageResource('dashboard')).toBeNull()
    expect(peekPageResource('reports')).toBeNull()
    // An older in-flight read must never repopulate the new version.
    rememberPageResource('dashboard', { count: 1 }, version)
    expect(peekPageResource('dashboard')).toBeNull()
  })

  it('clears snapshots on logout even without another page read', async () => {
    rememberPageResource('students', { name: 'private' }, capturePageVersion())
    await authService.logout()
    localStorage.setItem(MOCK_SESSION_KEY, 'test-session')
    expect(peekPageResource('students')).toBeNull()
  })

  it('fails closed on unavailable storage and does not seed or modify persisted data', () => {
    rememberPageResource('fees', { amount: 100 }, capturePageVersion())
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(peekPageResource('fees')).toBeNull()
  })

  it('bounds retained module snapshots', () => {
    const version = capturePageVersion()
    for (let index = 0; index < 25; index++) rememberPageResource(`page-${index}`, { index }, version)
    expect(peekPageResource('page-0')).toBeNull()
    expect(peekPageResource('page-24')).toEqual({ index: 24 })
  })
})
