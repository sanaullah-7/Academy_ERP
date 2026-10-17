import { describe, expect, it, vi } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { createMockApi, createCollectionService } from './mockApi.js'
import { createSeedDatabase } from './seedData.js'
import { MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import { authService } from '../services/authService.js'
import { admissionService } from '../services/admissionService.js'
import { studentService } from '../services/studentService.js'
// Storage contract tests exercise the adapter independently of UI session guards.
const north = { branchId: 'demo-north' }
const signIn = async branchId => {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', branchId)
}

describe('provisional student/course service contracts', () => {
  it('seeds once and preserves persisted changes after a new adapter is constructed', async () => {
    await signIn(north.branchId)
    const created = await admissionService.createWithStudent({
      studentName: 'Saved Demo', guardianName: 'Demo Guardian', contact: '03005551234', dob: '2011-01-02', course: 'Computer Science', courseId: 'course-demo-1',
    }, north)
    const savedSession = localStorage.getItem(MOCK_SESSION_KEY)
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    const fresh = createCollectionService('students', createMockApi({ validateScope: null }))
    expect((await fresh.getById(created.studentId, north)).id).toBe(created.studentId)
    await fresh.list(north)
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
    expect(localStorage.getItem(MOCK_SESSION_KEY)).toBe(savedSession)
  })

  it('does not reseed valid empty collections or leak returned mutations', async () => {
    await signIn(north.branchId)
    const empty = createSeedDatabase()
    empty.students = []
    empty.courses = []
    empty.admissions = []
    empty.batches = []
    empty.enrollments = []
    const legacy = JSON.stringify(empty)
    localStorage.setItem(MOCK_DATABASE_KEY, legacy)
    expect(createMockDatabase().run('students', 'list', { query: north })).toEqual([])
    expect(JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).students).toEqual([])
  })

  it.each([undefined, {}, { branchId: 'all' }, { branchId: 'foreign' }, { branchId: 'demo-north', ignored: true }])('rejects invalid branch queries %j', async (query) => {
    expect(() => createMockDatabase().run('students', 'list', { query })).toThrow(expect.objectContaining({ code: 'INVALID_QUERY' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
  })

  it.each([null, {}, { name: '' }, { name: '   ' }, { name: 12 }, { name: 'x'.repeat(201) }, { name: 'Demo', id: 'injected' }, { name: 'Demo', branchId: 'demo-central' }])('rejects invalid input %j without writing', async (record) => {
    expect(() => createMockDatabase().run('students', 'create', { record, query: north })).toThrow(expect.objectContaining({ code: 'INVALID_RECORD' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
  })

  it.each([
    ['{broken', 'CORRUPTED_STORAGE'],
    ['null', 'CORRUPTED_STORAGE'],
    [JSON.stringify({ version: 999 }), 'UNSUPPORTED_VERSION'],
    [JSON.stringify({ version: 2, students: 'invalid', courses: [], admissions: [] }), 'CORRUPTED_STORAGE'],
    [JSON.stringify({ version: 2, students: [null], courses: [], admissions: [] }), 'INVALID_RECORD'],
  ])('preserves rejected saved data: %s', async (raw, code) => {
    await signIn(north.branchId)
    localStorage.setItem(MOCK_DATABASE_KEY, raw)
    expect(() => createMockDatabase().run('students', 'list', { query: north })).toThrow(expect.objectContaining({ name: 'MockDataError', code }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })

  it('rejects duplicated saved IDs and malformed records without erasing data', async () => {
    await signIn(north.branchId)
    const data = createSeedDatabase()
    data.students.push({ ...data.students[0] })
    const raw = JSON.stringify(data)
    localStorage.setItem(MOCK_DATABASE_KEY, raw)
    expect(() => createMockDatabase().run('students', 'list', { query: north })).toThrow(expect.objectContaining({ code: 'INVALID_RECORD' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })

  it('returns explicit storage errors and preserves the previous successful write', async () => {
    await signIn(north.branchId)
    const db = createMockDatabase()
    db.run('students', 'list', { query: north })
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    try {
      db.run('admissions', 'create', { record: { studentName: 'Unsaved', guardianName: 'Guardian', contact: '03005551234', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-1' }, query: north })
      throw new Error('Expected localStorage quota failure.')
    } catch (error) {
      expect(error).toMatchObject({ code: 'STORAGE_WRITE_FAILED' })
    }
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('disabled') })
    localStorage.getItem = Storage.prototype.getItem
    try {
      db.run('students', 'list', { query: north })
      throw new Error('Expected localStorage read failure.')
    } catch (error) {
      expect(error).toMatchObject({ message: expect.stringMatching(/disabled|unavailable/) })
    }
  })

  it('rejects ID collisions without changing persisted data', async () => {
    await signIn(north.branchId)
    createMockDatabase().run('students', 'list', { query: north })
    const raw = localStorage.getItem(MOCK_DATABASE_KEY)
    const db = createMockDatabase({ makeId: () => 'student-demo-1' })
    expect(() => db.run('students', 'create', { record: { name: 'Collision' }, query: north })).toThrow(expect.objectContaining({ code: 'ID_CONFLICT' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(raw)
  })

  it('injects a deterministic test failure before persistence; a later request succeeds', async () => {
    await signIn(north.branchId)
    let once = true
    const api = createMockApi({ beforeRequest: () => { if (once) { once = false; throw new Error('test') } } })
    await expect(api.request('students', 'list', { query: north })).rejects.toMatchObject({ code: 'SIMULATED_FAILURE' })
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBeNull()
    await expect(api.request('students', 'list', { query: north })).resolves.toHaveLength(1)
  })

  it('returns invalid request/not-found errors consistently', async () => {
    await signIn(north.branchId)
    await expect(studentService.getById('', north)).rejects.toMatchObject({ code: 'INVALID_REQUEST' })
    await expect(studentService.getById('missing', north)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(studentService.update('missing', { name: 'Demo' }, north)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('keeps contracts replaceable by another async adapter', async () => {
    const request = vi.fn().mockResolvedValue([])
    const service = createCollectionService('courses', { request })
    await expect(service.list(north)).resolves.toEqual([])
    expect(request).toHaveBeenCalledWith('courses', 'list', { query: north })
  })

  it('disables failure injection outside the test environment', () => {
    vi.stubEnv('MODE', 'production')
    try { expect(() => createMockApi({ beforeRequest: () => {} })).toThrow('test-only') }
    finally { vi.unstubAllEnvs() }
  })

  it('allows deleting a standalone demo student and updates extended fields', async () => {
    const central = { branchId: 'demo-central' }
    await signIn('demo-central')
    createMockDatabase()
    // Test extended fields
    const updated = await studentService.update('student-demo-2', {
      name: 'Updated Demo Student',
      dateOfBirth: '2008-05-12',
      guardianName: 'Guardian Name',
      guardianContact: '03001234567',
      studentPhone: '03009876543',
      identityNumber: '17301-1234567-1',
      gender: 'Male',
      residenceType: 'Day Scholar',
      address: 'Peshawar, KPK',
    }, central)
    expect(updated.name).toBe('Updated Demo Student')
    expect(updated.studentPhone).toBe('03009876543')
    expect(updated.identityNumber).toBe('17301-1234567-1')
    expect(updated.gender).toBe('Male')

    // Test delete
    const result = await studentService.delete('student-demo-2', central)
    expect(result.deleted).toBe(true)
    await expect(studentService.getById('student-demo-2', central)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
