import { describe, expect, it, vi } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { createMockApi } from './mockApi.js'
import { MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import { admissionService } from '../services/admissionService.js'
import { authService } from '../services/authService.js'

const north = { branchId: 'demo-north' }
const central = { branchId: 'demo-central' }
const input = { studentName: 'DEMO New Student', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-1' }
const raw = () => localStorage.getItem(MOCK_DATABASE_KEY)
const saved = () => JSON.parse(raw())
const empty = () => localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, students: [], courses: [{ id: 'course-demo-1', branchId: 'demo-north', name: 'Computer Science' }, { id: 'course-demo-2', branchId: 'demo-central', name: 'Computer Science' }], admissions: [] }))
const authorizedDelete = (db, id, query) => {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-admin', branchId: query.branchId }))
  return db.deleteAdmission(id, query)
}

describe('approved branch sequences and safe linked CRUD', () => {
  it('starts independent student and admission sequences at one in empty branches', () => {
    empty()
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const b = db.createAdmission({ ...input, courseId: 'course-demo-2' }, central)
    const c = createMockDatabase().createAdmission(input, north)
    expect([a.admissionId, b.admissionId, c.admissionId]).toEqual(['ADM-1', 'ADM-1', 'ADM-2'])
    expect([a.student.studentNumber, b.student.studentNumber, c.student.studentNumber]).toEqual([1, 1, 2])
    expect(new Set([a.id, b.id, c.id, a.studentId, b.studentId, c.studentId]).size).toBe(6)
  })
  it('views and atomically edits saved details/student name without changing either number or IDs', () => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const before = saved().branchCounters
    const result = db.updateAdmission(a.id, { ...input, studentName: 'DEMO Edited', guardianName: 'DEMO Updated Guardian', notes: 'Saved note' }, north)
    expect(result).toMatchObject({ id: a.id, admissionId: a.admissionId, studentId: a.studentId, notes: 'Saved note' })
    expect(result.student).toMatchObject({ id: a.studentId, name: 'DEMO Edited', studentNumber: a.student.studentNumber })
    expect(createMockDatabase().getAdmission(a.id, north).student.name).toBe('DEMO Edited')
    expect(saved().branchCounters).toEqual(before)
  })
  it('deletes only its owned pair and never reuses either number after refresh', () => {
    empty()
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const b = db.createAdmission({ ...input, courseId: 'course-demo-2' }, central)
    const extra = db.createAdmission({ ...input, studentName: 'Unrelated DEMO' }, north)
    expect(authorizedDelete(db, a.id, north).deletedStudentId).toBe(a.studentId)
    expect(saved().students.some((s) => s.id === extra.studentId)).toBe(true)
    expect(db.getAdmission(b.id, central).studentId).toBe(b.studentId)
    const next = createMockDatabase().createAdmission(input, north)
    expect(next.admissionNumber).toBe(3)
    expect(next.student.studentNumber).toBe(3)
  })
  it('preserves legacy display IDs and reserves the old global high-water for both branches', () => {
    const db = createMockDatabase()
    db.createAdmission(input, north)
    const data = saved()
    delete data.branchCounters
    data.admissionCounter = 1242
    data.admissions[0].admissionId = 'ADM-0001'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const a = db.createAdmission(input, north)
    const b = db.createAdmission({ ...input, courseId: 'course-demo-2' }, central)
    expect([a.admissionId, b.admissionId]).toEqual(['ADM-1,243', 'ADM-1,243'])
    expect(saved().admissions[0].admissionId).toBe('ADM-0001')
    expect(saved().admissions[0].id).toBe(data.admissions[0].id)
  })
  it('allows deletion of an unlinked legacy admission without touching any students', () => {
    const db = createMockDatabase()
    db.run('admissions', 'list', { query: central })
    const students = saved().students
    authorizedDelete(db, 'ADM-0001', central)
    expect(saved().students).toEqual(students)
  })
  it('deletes an unmarked legacy linked Provisional pair while preserving unrelated records and counters', () => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const other = db.createAdmission(input, north)
    const data = saved()
    const admission = data.admissions.find((item) => item.id === a.id)
    const student = data.students.find((item) => item.id === a.studentId)
    delete admission.createdByAdmissionFlow
    delete student.createdByAdmissionFlow
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const counters = data.branchCounters
    expect(authorizedDelete(db, a.id, north)).toMatchObject({ id: a.id, deletedStudentId: a.studentId })
    expect(saved().students).toEqual(data.students.filter((item) => item.id !== a.studentId))
    expect(saved().admissions).toEqual(data.admissions.filter((item) => item.id !== a.id))
    expect(saved().branchCounters).toEqual(counters)
    expect(db.getAdmission(other.id, north).studentId).toBe(other.studentId)
    expect(db.createAdmission(input, north).admissionNumber).toBe(other.admissionNumber + 1)
  })
  it('rejects ambiguous legacy student links rather than choosing or erasing a record', () => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const data = saved()
    const student = data.students.find((item) => item.id === a.studentId)
    data.students.push({ ...student, id: 'ambiguous-legacy-student', studentNumber: 100 })
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const before = raw()
    expect(() => authorizedDelete(db, a.id, north)).toThrow(expect.objectContaining({ code: 'INVALID_LINK' }))
    expect(raw()).toBe(before)
  })
  it.each(['active-student', 'wrong-branch', 'broken-link'])('refuses unsafe %s deletion and preserves bytes', (kind) => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const data = saved()
    const student = data.students.find((s) => s.id === a.studentId)
    if (kind === 'active-student') student.status = 'Active'
    if (kind === 'broken-link') student.admissionId = 'missing'
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const before = raw()
    expect(() => authorizedDelete(db, a.id, kind === 'wrong-branch' ? central : north)).toThrow()
    expect(raw()).toBe(before)
  })
  it.each(['create', 'update', 'delete'])('rolls back %s and counters on storage failure', (operation) => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const before = raw()
    if (operation === 'delete') localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-admin', branchId: north.branchId }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('quota') })
    const run = () => operation === 'create' ? db.createAdmission(input, north) : operation === 'update' ? db.updateAdmission(a.id, { ...input, studentName: 'Not saved' }, north) : db.deleteAdmission(a.id, north)
    expect(run).toThrow(expect.objectContaining({ code: 'STORAGE_WRITE_FAILED' }))
    expect(raw()).toBe(before)
  })
  it.each(['counter', 'duplicate-student-number', 'duplicate-admission-number'])('rejects corrupt %s without writing', (kind) => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const data = saved()
    if (kind === 'counter') data.branchCounters[north.branchId].student = -1
    if (kind === 'duplicate-student-number') data.students.find((s) => s.id === a.studentId).studentNumber = data.students[0].studentNumber
    if (kind === 'duplicate-admission-number') { data.admissions.at(-1).admissionNumber = 3; data.admissions.at(-1).admissionId = 'ADM-3' }
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(data))
    const before = raw()
    expect(() => db.getAdmission(a.id, north)).toThrow()
    expect(raw()).toBe(before)
  })
  it('preserves data after controlled delete failure and permits a later retry', async () => {
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const before = raw()
    await expect(createMockApi({ beforeRequest: () => { throw Error('controlled') } }).admissionOperation('delete', { id: a.id, query: north })).rejects.toMatchObject({ code: 'SIMULATED_FAILURE' })
    expect(raw()).toBe(before)
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-admin', branchId: north.branchId }))
    await expect(createMockApi().admissionOperation('delete', { id: a.id, query: north })).resolves.toMatchObject({ id: a.id })
  })
  it('enforces the active session branch on every service read/write and after logout', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    const a = await admissionService.createWithStudent({ ...input, courseId: 'course-demo-2' }, central)
    for (const run of [() => admissionService.list(north), () => admissionService.getById(a.id, north), () => admissionService.update(a.id, input, north), () => admissionService.delete(a.id, north)]) await expect(run()).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    await authService.logout()
    for (const run of [() => admissionService.list(central), () => admissionService.getById(a.id, central), () => admissionService.update(a.id, { ...input, courseId: 'course-demo-2' }, central), () => admissionService.delete(a.id, central)]) await expect(run()).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })
})
