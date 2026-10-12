import { describe, expect, it } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'

const north = { branchId: 'demo-north' }
const central = { branchId: 'demo-central' }
const input = { studentName: 'DEMO Applicant', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-1' }
const raw = () => localStorage.getItem(MOCK_DATABASE_KEY)
const saved = () => JSON.parse(raw())
const empty = () => localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, students: [], courses: [{ id: 'course-demo-1', branchId: 'demo-north', name: 'Computer Science' }, { id: 'course-demo-2', branchId: 'demo-central', name: 'Computer Science' }], admissions: [] }))
const list = (db, collection, query = north) => db.run(collection, 'list', { query })
const authorizedDelete = (db, id, query) => {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: 'demo-admin', branchId: query.branchId }))
  return db.deleteAdmission(id, query)
}

describe('gapless branch display serials with permanent references preserved', () => {
  it.each([1, 3])('closes gaps after deleting index %s and assigns visible four to the next create', (index) => {
    empty()
    const db = createMockDatabase()
    const records = Array.from({ length: 4 }, () => db.createAdmission(input, north))
    const permanentBefore = saved()
    expect(records.map((a) => a.displayAdmissionId)).toEqual(['ADM-1', 'ADM-2', 'ADM-3', 'ADM-4'])
    expect(records.map((a) => a.student.displaySerial)).toEqual([1, 2, 3, 4])
    const deleted = authorizedDelete(db, records[index].id, north)
    expect(deleted.displayAdmissionId).toBe(`ADM-${index + 1}`)
    expect(list(db, 'admissions').map((a) => a.displayAdmissionId)).toEqual(['ADM-1', 'ADM-2', 'ADM-3'])
    expect(list(db, 'students').map((s) => s.displaySerial)).toEqual([1, 2, 3])
    expect(saved().admissions).toEqual(permanentBefore.admissions.filter((a) => a.id !== records[index].id))
    expect(saved().students).toEqual(permanentBefore.students.filter((s) => s.id !== records[index].studentId))
    const next = createMockDatabase().createAdmission(input, north)
    expect(next).toMatchObject({ displaySerial: 4, displayAdmissionId: 'ADM-4', admissionId: 'ADM-5' })
    expect(next.student).toMatchObject({ displaySerial: 4, studentNumber: 5, admissionId: next.id, admissionDisplaySerialId: 'ADM-4', admissionDisplayId: 'ADM-5' })
    const bytes = raw()
    expect(list(createMockDatabase(), 'admissions').map((a) => a.displaySerial)).toEqual([1, 2, 3, 4])
    expect(raw()).toBe(bytes)
  })
  it('keeps branch sequences independent even when records are interleaved', () => {
    empty()
    const db = createMockDatabase()
    const northRecords = []
    for (let i = 0; i < 3; i++) {
      northRecords.push(db.createAdmission(input, north))
      db.createAdmission({ ...input, courseId: 'course-demo-2' }, central)
    }
    const centralBefore = list(db, 'admissions', central)
    authorizedDelete(db, northRecords[1].id, north)
    expect(list(db, 'admissions').map((a) => a.displaySerial)).toEqual([1, 2])
    expect(list(createMockDatabase(), 'admissions', central)).toEqual(centralBefore)
    expect(list(db, 'students', central).map((s) => s.displaySerial)).toEqual([1, 2, 3])
  })
  it('keeps ordinals stable through edit, search filtering and presentation sorting', () => {
    empty()
    const db = createMockDatabase()
    const records = ['Zulu', 'Alpha', 'Middle'].map((studentName) => db.createAdmission({ ...input, studentName }, north))
    const filtered = list(db, 'admissions').filter((a) => a.studentName === 'Middle')
    expect(filtered[0].displayAdmissionId).toBe('ADM-3')
    const sorted = list(db, 'admissions').sort((a, b) => a.studentName.localeCompare(b.studentName))
    expect(sorted.map((a) => a.displaySerial)).toEqual([2, 3, 1])
    db.updateAdmission(records[1].id, { ...input, studentName: 'Updated Alpha' }, north)
    expect(db.getAdmission(records[1].id, north)).toMatchObject({ id: records[1].id, displaySerial: 2, student: { displaySerial: 2, admissionId: records[1].id } })
    expect(list(createMockDatabase(), 'admissions').map((a) => a.id)).toEqual(records.map((a) => a.id))
  })
  it('preserves legacy ADM internal foreign keys and permanent ADM references separately', () => {
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, courses: [], admissions: [{ id: 'ADM-0007', branchId: north.branchId, ...input, status: 'Pending', createdAt: '2026-10-10' }], students: [{ id: 'legacy-student', branchId: north.branchId, name: input.studentName, status: 'Provisional', admissionId: 'ADM-0007' }] }))
    const admission = createMockDatabase().getAdmission('ADM-0007', north)
    expect(admission).toMatchObject({ id: 'ADM-0007', admissionId: 'ADM-7', displayAdmissionId: 'ADM-1', student: { admissionId: 'ADM-0007', admissionDisplayId: 'ADM-7', admissionDisplaySerialId: 'ADM-1', displaySerial: 1 } })
    expect(saved().admissions[0].id).toBe('ADM-0007')
    expect(saved().students[0].admissionId).toBe('ADM-0007')
  })
  it('never persists computed serials or accepts a display serial as a lookup key', () => {
    empty()
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    expect(saved().admissions[0]).not.toHaveProperty('displayAdmissionId')
    expect(saved().students[0]).not.toHaveProperty('displaySerial')
    expect(() => db.getAdmission(a.displayAdmissionId, north)).toThrow(expect.objectContaining({ code: 'NOT_FOUND' }))
    expect(db.getAdmission(a.id, north).id).toBe(a.id)
  })
  it('keeps current projections and stored links unchanged after a failed delete', () => {
    empty()
    const db = createMockDatabase()
    const a = db.createAdmission(input, north)
    const before = raw()
    expect(() => authorizedDelete(db, a.id, central)).toThrow()
    expect(raw()).toBe(before)
    expect(db.getAdmission(a.id, north).displaySerial).toBe(1)
  })
})
