import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { readOrganization, writeOrganization } from './mockOrganization.js'
import { authService } from '../services/authService.js'
import { MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY } from '../constants/storageKeys.js'

const query = { branchId: 'demo-north' }
beforeEach(async () => {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', query.branchId)
})

describe('bounded storage snapshots', () => {
  it('reuses unchanged normalized data without exposing mutable cached records', () => {
    const db = createMockDatabase()
    db.run('courses', 'list', { query })
    const first = db.run('courses', 'list', { query })
    const parse = vi.spyOn(JSON, 'parse')
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    first[0].name = 'Caller mutation'
    expect(db.run('courses', 'list', { query })[0].name).not.toBe('Caller mutation')
    expect(parse.mock.calls.filter(([value]) => value === raw)).toHaveLength(0)
    parse.mockRestore()
  })

  it('observes same-tab/external writes immediately and rejects newly corrupt data', () => {
    const db = createMockDatabase()
    db.run('courses', 'list', { query })
    db.run('courses', 'list', { query })
    const data = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    data.courses.find(course => course.branchId === query.branchId).name = 'External update'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    expect(db.run('courses', 'list', { query })[0].name).toBe('External update')
    localStorage.setItem(MOCK_DATABASE_KEY, '{broken')
    expect(() => db.run('courses', 'list', { query })).toThrow('not valid JSON')
  })

  it('does not reuse cached authorization after an organization permission change', () => {
    const db = createMockDatabase()
    db.academicOperation('overview', { query })
    const organization = readOrganization()
    organization.deletedUserIds.push('demo-admin')
    writeOrganization(organization)
    expect(() => db.academicOperation('overview', { query })).toThrow()
  })

  it('keeps branches isolated on cache hits', () => {
    const db = createMockDatabase()
    db.run('courses', 'list', { query })
    expect(db.run('courses', 'list', { query }).every(course => course.branchId === query.branchId)).toBe(true)
    expect(() => db.run('courses', 'list', { query: { branchId: 'foreign' } })).toThrow()
  })

  it('detaches organization snapshots and detects raw changes without a storage event', () => {
    writeOrganization(readOrganization())
    const first = readOrganization()
    first.settings.academyName = 'Unsaved change'
    expect(readOrganization().settings.academyName).not.toBe('Unsaved change')
    const raw = JSON.parse(localStorage.getItem(MOCK_ORGANIZATION_KEY))
    raw.settings.academyName = 'External change'
    localStorage.setItem(MOCK_ORGANIZATION_KEY, JSON.stringify(raw))
    expect(readOrganization().settings.academyName).toBe('External change')
    localStorage.setItem(MOCK_ORGANIZATION_KEY, '{bad')
    expect(() => readOrganization()).toThrow()
  })
})
