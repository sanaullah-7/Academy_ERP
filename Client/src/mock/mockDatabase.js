/**
 * Purpose: Will define mock Database for the mock area of the Academy frontend.
 * Module: mock
 * Status: Planned — functionality not implemented.
 */

import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { DEMO_BRANCHES, DEMO_USERS } from './authFixtures.js'
import { getBranchRoles, ROLES } from '../constants/roles.js'
import { createSeedDatabase, createBatchSeeds, createDemoClassSeeds } from './seedData.js'
import { admissionNumberFromId, formatAdmissionId } from '../lib/admissionIds.js'
import { createDisplayProjector } from './displaySerials.js'
import { readMockSession } from './mockAuth.js'
import { canCreateAdmissions, canDecideAdmission, canDeleteAdmission, canEditAdmissions, canViewAdmissions } from '../lib/admissionPolicy.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'
import { getLocalDateOnly } from '../utils/formatDate.js'

export class MockDataError extends Error {
  constructor(code, message) { super(message); this.name = 'MockDataError'; this.code = code }
}
const fail = (code, message) => { throw new MockDataError(code, message) }
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const validText = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 200
const validDateOnly = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
const validContact = (value) => typeof value === 'string' && /^\+?[0-9\s().-]{3,30}$/.test(value.trim()) && value.length <= 200
const validBranch = (value) => DEMO_BRANCHES.some((branch) => branch.id === value)
const collections = ['students', 'courses', 'admissions', 'batches', 'academicStreams', 'subjects', 'enrollments', 'classes', 'challans', 'payments', 'expenses', 'demoClasses']

function validateRecord(record, collection) {
  if (!object(record) || !validText(record.id) || !validBranch(record.branchId)) {
    fail('INVALID_RECORD', 'Expected a provisional record with id, authorized demo branchId.')
  }
  if (collection === 'admissions') {
    const validKeys = ['id', 'branchId', 'studentName', 'guardianName', 'contact', 'studentPhone', 'identityNumber', 'gender', 'residenceType', 'address', 'dob', 'course', 'courseId', 'streamId', 'preferredBatchId', 'subjectIds', 'configuredFee', 'statusHistory', 'status', 'createdAt', 'previousSchool', 'notes', 'admissionId', 'admissionNumber', 'studentId', 'createdByAdmissionFlow']
    if (record.statusHistory !== undefined) {
      if (!Array.isArray(record.statusHistory)) fail('INVALID_RECORD', 'Invalid DEMO status history.')
      let previousStatus = null
      for (const event of record.statusHistory) {
        const validTransition = event?.fromStatus === 'Pending'
          ? ['Approved', 'Rejected'].includes(event.toStatus)
          : event?.fromStatus === 'Approved'
            ? ['Pending', 'Rejected'].includes(event.toStatus)
            : event?.fromStatus === 'Rejected' && event.toStatus === 'Approved'
        if (!object(event) || Object.keys(event).some(key => !['id', 'admissionId', 'branchId', 'fromStatus', 'toStatus', 'actorUserId', 'occurredAt', 'reason'].includes(key)) || !validText(event.id) || event.admissionId !== record.id || event.branchId !== record.branchId || !validTransition || (previousStatus !== null && event.fromStatus !== previousStatus) || !validText(event.actorUserId) || !validText(event.occurredAt) || !Number.isFinite(Date.parse(event.occurredAt)) || typeof event.reason !== 'string' || event.reason.length > 500) fail('INVALID_RECORD', 'Invalid saved status event.')
        previousStatus = event.toStatus
      }
      if (record.statusHistory.length > 0 && previousStatus !== record.status) fail('INVALID_RECORD', 'Saved status history does not match the current admission status.')
    }
    for (const key of ['courseId', 'preferredBatchId']) if (record[key] != null && !validText(record[key])) fail('INVALID_RECORD', 'Invalid saved course or batch reference.')
    if (record.streamId != null && !validText(record.streamId)) fail('INVALID_RECORD', 'Invalid saved academic stream reference.')
    if (record.subjectIds !== undefined && (!Array.isArray(record.subjectIds) || record.subjectIds.some(id => !validText(id)) || new Set(record.subjectIds).size !== record.subjectIds.length)) fail('INVALID_RECORD', 'Invalid saved subject selections.')
    if (record.configuredFee !== undefined && (!Number.isFinite(record.configuredFee) || record.configuredFee < 0)) fail('INVALID_RECORD', 'Invalid configured admission fee.')
    if (Object.keys(record).some((key) => !validKeys.includes(key))) fail('INVALID_RECORD', 'Expected an admission record with authorized fields.')
    if (!validText(record.studentName) || !validText(record.guardianName) || !validText(record.contact) || !validText(record.dob) || !validText(record.course) || !validText(record.status) || !validText(record.createdAt)) {
      fail('INVALID_RECORD', 'Admission missing required text fields.')
    }
    if (record.createdByAdmissionFlow !== undefined && record.createdByAdmissionFlow !== true) fail('INVALID_RECORD', 'Invalid admission ownership marker.')
    if (record.studentId != null && !validText(record.studentId)) fail('INVALID_RECORD', 'Invalid linked student ID.')
    for (const key of ['previousSchool', 'notes']) if (record[key] !== undefined && typeof record[key] !== 'string') fail('INVALID_RECORD', 'Invalid optional admission text.')
  } else if (collection === 'students') {
    const validKeys = ['id', 'branchId', 'name', 'status', 'admissionId', 'admissionDisplayId', 'studentNumber', 'createdByAdmissionFlow', 'dateOfBirth', 'guardianName', 'guardianContact']
    if (Object.keys(record).some((key) => !validKeys.includes(key)) || !validText(record.name)) {
      fail('INVALID_RECORD', 'Expected a provisional record with id, authorized demo branchId and name.')
    }
    if (record.studentNumber !== undefined && (!Number.isSafeInteger(record.studentNumber) || record.studentNumber <= 0)) fail('INVALID_RECORD', 'Invalid student sequence number.')
    if (record.createdByAdmissionFlow !== undefined && record.createdByAdmissionFlow !== true) fail('INVALID_RECORD', 'Invalid student ownership marker.')
    if (record.status != null && !['Active', 'Provisional'].includes(record.status)) fail('INVALID_RECORD', 'Student status must be Active or Provisional.')
    if (record.admissionId != null && !validText(record.admissionId)) fail('INVALID_RECORD', 'Invalid admissionId.')
    if (record.admissionDisplayId != null && !validText(record.admissionDisplayId)) fail('INVALID_RECORD', 'Invalid display admission ID.')
    for (const key of ['dateOfBirth', 'guardianName', 'guardianContact']) if (record[key] !== undefined && !validText(record[key])) fail('INVALID_RECORD', 'Invalid saved student details.')
    if (record.dateOfBirth !== undefined && !validDateOnly(record.dateOfBirth)) fail('INVALID_RECORD', 'Invalid saved date of birth.')
    if (record.guardianContact !== undefined && !validContact(record.guardianContact)) fail('INVALID_RECORD', 'Invalid saved guardian contact.')
  } else if (collection === 'enrollments') {
    const keys = ['id', 'branchId', 'admissionId', 'studentId', 'courseId', 'batchId', 'subjectIds', 'configuredFee', 'status', 'enrolledAt', 'feeStatus']
    if (Object.keys(record).some(key => !keys.includes(key)) || !['admissionId', 'studentId', 'courseId', 'batchId', 'enrolledAt'].every(key => validText(record[key])) || record.status !== 'Active' || !Number.isFinite(Date.parse(record.enrolledAt)) || (record.feeStatus !== undefined && !['Unavailable', 'Paid', 'Partial'].includes(record.feeStatus))) fail('INVALID_RECORD', 'Invalid enrollment record.')
    if (record.subjectIds !== undefined && (!Array.isArray(record.subjectIds) || record.subjectIds.some(id => !validText(id)))) fail('INVALID_RECORD', 'Invalid enrollment subjects.')
    if (record.configuredFee !== undefined && (!Number.isFinite(record.configuredFee) || record.configuredFee < 0)) fail('INVALID_RECORD', 'Invalid enrollment fee.')
  } else if (collection === 'challans') {
    const keys = ['id', 'branchId', 'enrollmentId', 'studentId', 'description', 'amount', 'issueDate', 'dueDate', 'number', 'reference', 'createdAt']
    if (Object.keys(record).some(key => !keys.includes(key)) || !['enrollmentId', 'studentId', 'description', 'issueDate', 'dueDate', 'reference', 'createdAt'].every(key => validText(record[key])) || !Number.isFinite(record.amount) || record.amount <= 0 || !Number.isSafeInteger(record.number) || record.number <= 0 || !validDateOnly(record.issueDate) || !validDateOnly(record.dueDate) || record.issueDate > record.dueDate) fail('INVALID_RECORD', 'Invalid challan record.')
  } else if (collection === 'payments') {
    const keys = ['id', 'branchId', 'challanId', 'studentId', 'amount', 'method', 'status', 'number', 'receiptReference', 'paidAt', 'actorUserId']
    if (Object.keys(record).some(key => !keys.includes(key)) || !['challanId', 'studentId', 'receiptReference', 'paidAt', 'actorUserId'].every(key => validText(record[key])) || !Number.isFinite(record.amount) || record.amount <= 0 || !['Cash', 'Bank Transfer', 'Mobile Wallet'].includes(record.method) || record.status !== 'Verified' || !Number.isSafeInteger(record.number) || record.number <= 0 || !Number.isFinite(Date.parse(record.paidAt))) fail('INVALID_RECORD', 'Invalid payment record.')
  } else if (collection === 'expenses') {
    const keys = ['id', 'branchId', 'amount', 'category', 'description', 'method', 'entryDate', 'status', 'createdAt', 'actorUserId']
    if (Object.keys(record).some(key => !keys.includes(key)) || !['category', 'description', 'method', 'entryDate', 'createdAt', 'actorUserId'].every(key => validText(record[key])) || !Number.isFinite(record.amount) || record.amount <= 0 || !validDateOnly(record.entryDate) || record.status !== 'Posted') fail('INVALID_RECORD', 'Invalid expense record.')
  } else if (collection === 'classes') {
    const keys = ['id', 'branchId', 'subject', 'batchId', 'teacherId', 'classDate', 'startTime', 'endTime', 'location']
    if (Object.keys(record).some(key => !keys.includes(key)) || !['subject', 'batchId', 'teacherId', 'classDate', 'startTime', 'endTime', 'location'].every(key => validText(record[key])) || !validDateOnly(record.classDate) || !/^\d{2}:\d{2}$/.test(record.startTime) || !/^\d{2}:\d{2}$/.test(record.endTime) || record.startTime >= record.endTime) fail('INVALID_RECORD', 'Invalid class schedule record.')
  } else if (collection === 'demoClasses') {
    const validKeys = ['id', 'branchId', 'demoNumber', 'demoId', 'studentName', 'studentId', 'guardianName', 'guardianContact', 'courseId', 'courseName', 'preferredBatchId', 'batchName', 'requestedDate', 'requestedTime', 'notes', 'status', 'scheduledSession', 'attendance', 'convertedAdmissionId', 'convertedAdmissionDisplayId', 'convertedAt', 'statusHistory', 'createdAt', 'updatedAt']
    if (Object.keys(record).some((key) => !validKeys.includes(key))) fail('INVALID_RECORD', 'Demo class record contains unknown fields.')
    if (!validText(record.studentName) || !validText(record.guardianName) || !validContact(record.guardianContact) || !validText(record.courseId) || !validDateOnly(record.requestedDate)) {
      fail('INVALID_RECORD', 'Demo class missing required student, guardian, course, or date.')
    }
    const validStatuses = ['Registered', 'Scheduled', 'Attended', 'Missed', 'Cancelled', 'Converted']
    if (!validStatuses.includes(record.status)) fail('INVALID_RECORD', 'Invalid demo status.')
    if (record.studentId != null && !validText(record.studentId)) fail('INVALID_RECORD', 'Invalid student ID.')
    if (record.preferredBatchId != null && !validText(record.preferredBatchId)) fail('INVALID_RECORD', 'Invalid preferred batch ID.')
    if (record.scheduledSession != null) {
      if (!object(record.scheduledSession)) fail('INVALID_RECORD', 'Invalid scheduled session.')
      const { classDate, startTime, endTime, teacherId, location } = record.scheduledSession
      if (!validDateOnly(classDate) || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || startTime >= endTime || !validText(teacherId) || !validText(location)) {
        fail('INVALID_RECORD', 'Invalid scheduled session details.')
      }
    }
    if (record.attendance != null) {
      if (!object(record.attendance)) fail('INVALID_RECORD', 'Invalid attendance record.')
      if (!['Present', 'Absent'].includes(record.attendance.status) || !validText(record.attendance.markedByUserId) || !validText(record.attendance.markedAt)) {
        fail('INVALID_RECORD', 'Invalid attendance fields.')
      }
    }
    if (record.statusHistory !== undefined) {
      if (!Array.isArray(record.statusHistory)) fail('INVALID_RECORD', 'Invalid demo status history.')
      for (const event of record.statusHistory) {
        if (!object(event) || !validText(event.id) || !validText(event.demoId) || !validText(event.toStatus) || !validText(event.actorUserId) || !validText(event.occurredAt)) {
          fail('INVALID_RECORD', 'Invalid status event in demo history.')
        }
      }
    }
  } else if (collection === 'batches') {
    if (Object.keys(record).some(key => !['id', 'branchId', 'courseId', 'name', 'active', 'capacity', 'startTime', 'endTime'].includes(key)) || !validText(record.name) || !validText(record.courseId) || (record.active !== undefined && typeof record.active !== 'boolean') || (record.capacity !== undefined && (!Number.isSafeInteger(record.capacity) || record.capacity <= 0)) || (record.startTime !== undefined && !/^\d{2}:\d{2}$/.test(record.startTime)) || (record.endTime !== undefined && !/^\d{2}:\d{2}$/.test(record.endTime)) || (record.startTime && record.endTime && record.startTime >= record.endTime)) fail('INVALID_RECORD', 'Invalid provisional batch record.')
  } else if (collection === 'academicStreams') {
    if (Object.keys(record).some(key => !['id', 'branchId', 'name', 'active'].includes(key)) || !validText(record.name) || typeof record.active !== 'boolean') fail('INVALID_RECORD', 'Invalid academic stream record.')
  } else if (collection === 'subjects') {
    if (Object.keys(record).some(key => !['id', 'branchId', 'courseId', 'name', 'active', 'feeAmount'].includes(key)) || !validText(record.name) || !validText(record.courseId) || typeof record.active !== 'boolean' || (record.feeAmount !== undefined && (!Number.isFinite(record.feeAmount) || record.feeAmount < 0))) fail('INVALID_RECORD', 'Invalid subject record.')
  } else if (collection === 'courses') {
    if (Object.keys(record).some(key => !['id', 'branchId', 'name', 'streamId', 'active', 'feeAmount', 'pricingMode'].includes(key)) || !validText(record.name) || (record.streamId != null && !validText(record.streamId)) || (record.active !== undefined && typeof record.active !== 'boolean') || (record.feeAmount !== undefined && (!Number.isFinite(record.feeAmount) || record.feeAmount < 0)) || (record.pricingMode !== undefined && !['course', 'subjects'].includes(record.pricingMode))) fail('INVALID_RECORD', 'Invalid course record.')
  } else {
    if (Object.keys(record).some((key) => !['id', 'branchId', 'name'].includes(key)) || !validText(record.name)) {
      fail('INVALID_RECORD', 'Expected a provisional record with id, authorized demo branchId and name.')
    }
  }
}

// No reset/migration on errors: saved data remains untouched for explicit recovery.
export function createMockDatabase({ storage = () => window.localStorage, makeId = () => crypto.randomUUID() } = {}) {
  function validateDatabase(data) {
    if (Object.keys(data).some((key) => !['version', ...collections, 'admissionCounter', 'branchCounters', 'financialCounters'].includes(key))) fail('CORRUPTED_STORAGE', 'Saved mock data envelope is invalid.')
    for (const collection of collections) {
      if (!Array.isArray(data[collection])) fail('CORRUPTED_STORAGE', 'Saved mock collection is invalid.')
      const ids = new Set()
      for (const record of data[collection]) {
        validateRecord(record, collection)
        if (ids.has(record.id)) fail('INVALID_RECORD', 'Saved mock record IDs must be unique within a collection.')
        ids.add(record.id)
      }
    }
    if (!object(data.financialCounters) || Object.keys(data.financialCounters).some(id => !validBranch(id))) fail('CORRUPTED_STORAGE', 'Invalid financial counters.')
    for (const branch of DEMO_BRANCHES) {
      const counters = data.financialCounters[branch.id]
      if (!object(counters) || !['challan', 'receipt'].every(key => Number.isSafeInteger(counters[key]) && counters[key] >= 0)) fail('CORRUPTED_STORAGE', 'Invalid branch financial counter.')
    }
    for (const challan of data.challans) {
      const enrollment = data.enrollments.find(item => item.id === challan.enrollmentId && item.branchId === challan.branchId && item.studentId === challan.studentId)
      if (!enrollment) fail('INVALID_REFERENCE', 'Saved challan enrollment link is invalid.')
    }
    for (const payment of data.payments) {
      const challan = data.challans.find(item => item.id === payment.challanId && item.branchId === payment.branchId && item.studentId === payment.studentId)
      if (!challan) fail('INVALID_REFERENCE', 'Saved payment challan link is invalid.')
    }
    for (const batch of data.batches) {
      if (['students', 'courses', 'admissions'].some(collection => data[collection].some(record => record.id === batch.id))) fail('ID_CONFLICT', 'Batch seed ID conflicts with saved data; data was preserved.')
      const course = data.courses.find(record => record.id === batch.courseId)
      if (course && course.branchId !== batch.branchId) fail('INVALID_REFERENCE', 'Saved batch and course branches do not match.')
    }
    for (const course of data.courses) if (course.streamId != null && !data.academicStreams.some(stream => stream.id === course.streamId && stream.branchId === course.branchId)) fail('INVALID_REFERENCE', 'Saved course academic stream link is invalid.')
    for (const subject of data.subjects) if (!data.courses.some(course => course.id === subject.courseId && course.branchId === subject.branchId)) fail('INVALID_REFERENCE', 'Saved subject course link is invalid.')
    const admissionIds = new Set()
    const activeCombinations = new Set()
    for (const enrollment of data.enrollments) {
      if (collections.some(collection => collection !== 'enrollments' && data[collection].some(item => item.id === enrollment.id))) fail('ID_CONFLICT', 'Enrollment ID conflicts with another saved record.')
      const admission = data.admissions.find(item => item.id === enrollment.admissionId)
      const student = data.students.find(item => item.id === enrollment.studentId)
      const course = data.courses.find(item => item.id === enrollment.courseId)
      const batch = data.batches.find(item => item.id === enrollment.batchId)
      const combination = `${enrollment.studentId}\u0000${enrollment.courseId}\u0000${enrollment.batchId}`
      if (!admission || !student || !course || !batch || [admission, student, course, batch].some(item => item.branchId !== enrollment.branchId) || admission.status !== 'Approved' || admission.studentId !== student.id || student.admissionId !== admission.id || student.status !== 'Active' || !student.createdByAdmissionFlow || !admission.createdByAdmissionFlow || batch.courseId !== course.id) fail('INVALID_REFERENCE', 'Saved enrollment references do not resolve within one branch.')
      if (admissionIds.has(enrollment.admissionId) || activeCombinations.has(combination)) fail('ID_CONFLICT', 'Saved active enrollments must be unique.')
      admissionIds.add(enrollment.admissionId)
      activeCombinations.add(combination)
    }
  }
  function normalizeAdmissions(data) {
    validateDatabase(data)
    for (const admission of data.admissions) {
      if (admission.status === 'Rejected') {
        admission.status = 'Pending'
        delete admission.statusHistory
      }
    }
    validateDatabase(data)
    if (data.admissionCounter !== undefined && (!Number.isSafeInteger(data.admissionCounter) || data.admissionCounter < 0)) fail('CORRUPTED_STORAGE', 'Invalid durable admission counter.')
    const migrating = data.branchCounters === undefined
    if (!migrating && !object(data.branchCounters)) fail('CORRUPTED_STORAGE', 'Invalid branch sequence envelope.')
    const counters = data.branchCounters ?? {}
    if (Object.keys(counters).some((id) => !validBranch(id))) fail('CORRUPTED_STORAGE', 'Unknown branch sequence.')
    for (const branch of DEMO_BRANCHES) {
      let counter = counters[branch.id]
      if (counter === undefined) {
        if (!migrating) fail('CORRUPTED_STORAGE', 'Missing durable branch counter.')
        // Old global high-water protects deleted legacy numbers whose branch is unknown.
        counter = { admission: data.admissionCounter ?? 0, student: 0, demo: 0 }
      }
      counter.demo = counter.demo ?? 0
      if (!object(counter) || Object.keys(counter).some((key) => !['admission', 'student', 'demo'].includes(key)) || !['admission', 'student', 'demo'].every((key) => Number.isSafeInteger(counter[key]) && counter[key] >= 0)) fail('CORRUPTED_STORAGE', 'Invalid durable branch counter.')
      counters[branch.id] = counter
      const usedAdmissions = new Set()
      const admissions = data.admissions.filter((record) => record.branchId === branch.id)
      for (const admission of admissions) {
        const number = admission.admissionNumber ?? admissionNumberFromId(admission.admissionId ?? admission.id)
        if (/^ADM-[\d,]+$/i.test(admission.id) && admissionNumberFromId(admission.id) === null) fail('INVALID_RECORD', 'Legacy admission number is unsafe; data preserved.')
        if (admission.admissionNumber !== undefined && (!Number.isSafeInteger(number) || number <= 0)) fail('INVALID_RECORD', 'Invalid admission sequence number.')
        if (admission.admissionId !== undefined && (number === null || admissionNumberFromId(admission.admissionId) !== number)) fail('INVALID_RECORD', 'Invalid display admission ID.')
        if (number !== null) {
          if (usedAdmissions.has(number)) fail('ID_CONFLICT', 'Admission numbers collide within a branch; data preserved.')
          usedAdmissions.add(number)
          admission.admissionNumber = number
          admission.admissionId ??= formatAdmissionId(number)
          counter.admission = Math.max(counter.admission, number)
        }
      }
      // Student display references also reserve old numbers; never reuse a retained number.
      const students = data.students.filter((record) => record.branchId === branch.id)
      for (const student of students) counter.admission = Math.max(counter.admission, admissionNumberFromId(student.admissionDisplayId ?? student.admissionId) ?? 0)
      for (const admission of admissions) if (admission.admissionNumber === undefined) {
        if (counter.admission === Number.MAX_SAFE_INTEGER) fail('COUNTER_EXHAUSTED', 'Admission counter is exhausted.')
        admission.admissionNumber = ++counter.admission
        admission.admissionId = formatAdmissionId(admission.admissionNumber)
      }
      const usedStudents = new Set()
      for (const student of students) if (student.studentNumber !== undefined) {
        if (usedStudents.has(student.studentNumber)) fail('ID_CONFLICT', 'Student numbers collide within a branch; data preserved.')
        usedStudents.add(student.studentNumber)
        counter.student = Math.max(counter.student, student.studentNumber)
      }
      for (const student of students) if (student.studentNumber === undefined) {
        if (counter.student === Number.MAX_SAFE_INTEGER) fail('COUNTER_EXHAUSTED', 'Student counter is exhausted.')
        student.studentNumber = ++counter.student
      }
    }
    data.branchCounters = counters
    for (const student of data.students) {
      if (student.admissionDisplayId != null && student.admissionId == null) fail('INVALID_LINK', 'Student display reference requires an internal admission link.')
      if (student.admissionId == null) continue
      const admission = data.admissions.find((item) => item.id === student.admissionId)
      if (!admission || admission.branchId !== student.branchId || (admission.studentId && admission.studentId !== student.id)) fail('INVALID_LINK', 'Admission/student link or branch does not match.')
      if (student.admissionDisplayId && student.admissionDisplayId !== admission.admissionId) fail('INVALID_LINK', 'Student display reference does not match admission.')
      admission.studentId = student.id
      student.admissionDisplayId = admission.admissionId
    }
    for (const admission of data.admissions) {
      if (admission.studentId && !data.students.some((student) => student.id === admission.studentId && student.admissionId === admission.id && student.branchId === admission.branchId)) fail('INVALID_LINK', 'Admission has an invalid student reference.')
    }
    return data
  }
  function read(persist = true, preserveExisting = false) {
    let raw
    try { raw = storage().getItem(MOCK_DATABASE_KEY) }
    catch { fail('STORAGE_READ_FAILED', 'Mock data storage could not be read.') }
    if (raw === null) {
      const initial = createSeedDatabase()
      initial.classes = []
      initial.academicStreams = []
      initial.subjects = []
      initial.challans = []
      initial.payments = []
      initial.expenses = []
      initial.financialCounters = Object.fromEntries(DEMO_BRANCHES.map(branch => [branch.id, { challan: 0, receipt: 0 }]))
      initial.demoClasses = createDemoClassSeeds()
      initial.version = 7
      normalizeAdmissions(initial)
      if (persist) write(initial)
      return initial
    }
    let data
    try { data = JSON.parse(raw) } catch { fail('CORRUPTED_STORAGE', 'Saved mock data is not valid JSON.') }
    if (!object(data) || !Number.isInteger(data.version)) fail('CORRUPTED_STORAGE', 'Saved mock data has no valid version envelope.')
    if (data.version === 1) {
      data.version = 2
      if (data.admissions === undefined) data.admissions = createSeedDatabase().admissions
    }
    if (data.version === 2) {
      // Add only batches derived from saved courses. Never infer legacy admission references.
      if (!Array.isArray(data.courses)) fail('CORRUPTED_STORAGE', 'Saved courses are invalid.')
      for (const course of data.courses) validateRecord(course, 'courses')
      if (data.batches === undefined) data.batches = createBatchSeeds(data.courses)
      data.version = 3
    }
    if (data.version === 3) {
      if (data.enrollments === undefined) data.enrollments = []
      data.version = 4
    }
    if (data.version === 4) { if (data.classes === undefined) data.classes = []; data.version = 5 }
    if (data.version === 5) {
      data.challans = []
      data.payments = []
      data.expenses = []
      data.financialCounters = Object.fromEntries(DEMO_BRANCHES.map(branch => [branch.id, { challan: 0, receipt: 0 }]))
      data.version = 6
    }
    if (data.version === 6) {
      data.academicStreams = []
      data.subjects = []
      if (data.demoClasses === undefined) data.demoClasses = createDemoClassSeeds()
      data.version = 7
    }
    if (data.version === 7) {
      if (data.academicStreams === undefined) data.academicStreams = []
      if (data.subjects === undefined) data.subjects = []
      if (data.demoClasses === undefined) data.demoClasses = createDemoClassSeeds()
    }
    if (data.version !== 7) fail('UNSUPPORTED_VERSION', 'Saved mock data version is unsupported; data was preserved.')
    normalizeAdmissions(data)
    if (persist && !preserveExisting && (JSON.stringify(data) !== raw || data.version === 1 || data.version === 2 || data.version === 3)) write(data)
    return data
  }
  function write(data) {
    try { storage().setItem(MOCK_DATABASE_KEY, JSON.stringify(data)) }
    catch { fail('STORAGE_WRITE_FAILED', 'Mock data could not be saved; previous data was preserved.') }
  }

  function applyOperation(data, collection, operation, id, record, query) {
    if (collection === 'enrollments') fail('INVALID_REQUEST', 'Enrollments can only be created through the authorized enrollment operation.')
    if (operation === 'list') return data[collection].filter((item) => item.branchId === query.branchId)
    const index = data[collection].findIndex((item) => item.id === id && item.branchId === query.branchId)
    if (operation === 'getById') {
      if (index < 0) fail('NOT_FOUND', 'Record was not found in the requested branch.')
      return data[collection][index]
    }
    if (operation === 'update' && index < 0) fail('NOT_FOUND', 'Record was not found in the requested branch.')
    if (operation === 'update' && collection === 'admissions' && data.enrollments.some(item => item.admissionId === id)) fail('ENROLLED_RECORD_PROTECTED', 'An enrolled admission cannot be edited.')

    let generatedId
    if (operation === 'create') {
      try { generatedId = id || makeId() }
      catch { fail('ID_GENERATION_FAILED', 'A stable mock record ID could not be generated.') }
    }

    let result
    if (collection === 'admissions') {
      const { studentName, guardianName, contact, dob, course, previousSchool = '', notes = '' } = record
      const optionalDetails = Object.fromEntries(['studentPhone', 'identityNumber', 'gender', 'residenceType', 'address'].filter(key => record[key] !== undefined).map(key => [key, record[key].trim()]))
      result = operation === 'create'
        ? { id: generatedId, branchId: query.branchId, studentName: studentName.trim(), guardianName: guardianName.trim(), contact: contact.trim(), ...optionalDetails, dob: dob.trim(), course: course.trim(), previousSchool: previousSchool.trim(), notes: notes.trim(), status: 'Pending', createdAt: new Date().toISOString().split('T')[0] }
        : { ...data[collection][index], studentName: studentName.trim(), guardianName: guardianName.trim(), contact: contact.trim(), ...optionalDetails, dob: dob.trim(), course: course.trim(), previousSchool: previousSchool.trim(), notes: notes.trim() }
      for (const key of ['courseId', 'preferredBatchId']) if (record[key] !== undefined) result[key] = record[key]
      if (record.streamId !== undefined) result.streamId = record.streamId
      if (record.subjectIds !== undefined) result.subjectIds = [...record.subjectIds]
      const previous = operation === 'update' ? data[collection][index] : null
      const referencesChanged = !previous || result.courseId !== previous.courseId || result.preferredBatchId !== previous.preferredBatchId || result.course !== previous.course
      if (result.courseId != null) {
        const courseRecord = data.courses.find(item => item.id === result.courseId && item.branchId === query.branchId)
        const batchRecord = result.preferredBatchId == null ? null : data.batches.find(item => item.id === result.preferredBatchId && item.branchId === query.branchId && item.courseId === result.courseId)
        const streamRecord = result.streamId == null ? null : data.academicStreams.find(item => item.id === result.streamId && item.branchId === query.branchId)
        const subjectsValid = (result.subjectIds ?? []).every(subjectId => data.subjects.some(item => item.id === subjectId && item.branchId === query.branchId && item.courseId === result.courseId && item.active))
        // Unchanged unresolved references may survive unrelated legacy edits.
        if (referencesChanged && (!courseRecord || (result.preferredBatchId != null && !batchRecord))) fail('INVALID_REFERENCE', 'Choose a saved course and matching batch in the active branch.')
        if ((result.streamId != null && (!streamRecord || courseRecord?.streamId !== result.streamId)) || !subjectsValid) fail('INVALID_REFERENCE', 'Choose a valid stream and subjects for the selected course.')
        if (courseRecord) {
          result.course = courseRecord.name
          const selectedSubjects = (result.subjectIds ?? []).map(subjectId => data.subjects.find(item => item.id === subjectId && item.branchId === query.branchId && item.courseId === result.courseId && item.active))
          if (courseRecord.pricingMode === 'course') result.configuredFee = Number.isFinite(courseRecord.feeAmount) ? courseRecord.feeAmount : undefined
          else if (courseRecord.pricingMode === 'subjects') result.configuredFee = selectedSubjects.length > 0 && selectedSubjects.every(subject => Number.isFinite(subject?.feeAmount)) ? selectedSubjects.reduce((sum, subject) => sum + subject.feeAmount, 0) : undefined
          else delete result.configuredFee
        }
      } else if (result.preferredBatchId != null || (previous && referencesChanged && (previous.courseId != null || result.course !== previous.course))) fail('INVALID_REFERENCE', 'Changing course or batch requires a valid course reference.')
    } else if (collection === 'students') {
      const { name } = record
      const fields = { name: name.trim() }
      if (operation === 'create') {
        fields.status = record.status
        fields.admissionId = record.admissionId
      }
      result = operation === 'create'
        ? { id: generatedId, branchId: query.branchId, ...fields }
        : { ...data[collection][index], ...fields }
    } else {
      result = operation === 'create' ? { id: generatedId, branchId: query.branchId, name: record.name.trim() } : { ...data[collection][index], name: record.name.trim() }
    }

    validateRecord(result, collection)
    if (collection === 'admissions' && operation === 'create') {
      if (data.branchCounters[query.branchId].admission === Number.MAX_SAFE_INTEGER) fail('COUNTER_EXHAUSTED', 'Admission counter is exhausted.')
      result.admissionNumber = ++data.branchCounters[query.branchId].admission
      result.admissionId = formatAdmissionId(result.admissionNumber)
    }
    if (collection === 'students' && operation === 'create') {
      if (data.branchCounters[query.branchId].student === Number.MAX_SAFE_INTEGER) fail('COUNTER_EXHAUSTED', 'Student counter is exhausted.')
      result.studentNumber = ++data.branchCounters[query.branchId].student
      const linkedAdmission = data.admissions.find(item => item.id === result.admissionId && item.branchId === result.branchId && item.studentId === undefined)
      if (linkedAdmission) {
        result.dateOfBirth = linkedAdmission.dob
        result.guardianName = linkedAdmission.guardianName
        result.guardianContact = linkedAdmission.contact
      }
    }
    if (operation === 'create') {
      if (collections.some((key) => data[key].some((item) => item.id === result.id))) fail('ID_CONFLICT', 'Generated mock record ID already exists.')
      data[collection].push(result)
    } else {
      data[collection][index] = result
    }
    return result
  }

  function validateRequest(collection, operation, id, record, query) {
    if (!collections.includes(collection) || !['list', 'getById', 'create', 'update'].includes(operation)) fail('INVALID_REQUEST', 'Unknown mock collection or operation.')
    if (collection === 'enrollments') fail('INVALID_REQUEST', 'Enrollments can only be created through the authorized enrollment operation.')
    if (!object(query) || Object.keys(query).some((key) => key !== 'branchId') || !validBranch(query.branchId)) fail('INVALID_QUERY', 'A concrete known demo branchId is required.')
    if (collection === 'batches' && !['list', 'getById'].includes(operation)) fail('INVALID_REQUEST', 'Batch editing is outside this DEMO ticket.')
    if (['getById', 'update'].includes(operation) && !validText(id)) fail('INVALID_REQUEST', 'A record ID is required.')
    if (['create', 'update'].includes(operation)) {
      if (!object(record)) fail('INVALID_RECORD', 'Record must be an object.')
      if (collection === 'admissions') {
        if (operation === 'create' && !validText(record.courseId)) fail('INVALID_REFERENCE', 'A saved course is required for a new admission.')
        if (Object.keys(record).some((key) => !['studentName', 'guardianName', 'contact', 'studentPhone', 'identityNumber', 'gender', 'residenceType', 'address', 'dob', 'course', 'courseId', 'streamId', 'preferredBatchId', 'subjectIds', 'previousSchool', 'notes'].includes(key))) fail('INVALID_RECORD', 'Only approved admission input fields are accepted.')
        for (const key of ['courseId', 'preferredBatchId']) if (record[key] != null && !validText(record[key])) fail('INVALID_RECORD', 'Invalid course or batch reference.')
        if (record.streamId != null && !validText(record.streamId)) fail('INVALID_RECORD', 'Invalid academic stream reference.')
        if (record.subjectIds !== undefined && (!Array.isArray(record.subjectIds) || record.subjectIds.some(id => !validText(id)) || new Set(record.subjectIds).size !== record.subjectIds.length)) fail('INVALID_RECORD', 'Invalid subject selections.')
        if (!validText(record.studentName) || !validText(record.guardianName) || !validText(record.contact) || !validText(record.dob) || !validText(record.course)) fail('INVALID_RECORD', 'Admission requires specific fields.')
        for (const key of ['studentPhone', 'identityNumber', 'gender', 'residenceType', 'address']) if (record[key] !== undefined && (typeof record[key] !== 'string' || record[key].length > 200)) fail('INVALID_RECORD', 'Invalid admission identity details.')
        for (const key of ['previousSchool', 'notes']) if (record[key] !== undefined && (typeof record[key] !== 'string' || record[key].length > 200)) fail('INVALID_RECORD', 'Invalid optional admission text.')
      } else if (collection === 'students') {
        const allowedKeys = ['name', 'dateOfBirth', 'guardianName', 'guardianContact']
        if (Object.keys(record).some((key) => !allowedKeys.includes(key)) || !validText(record.name)) fail('INVALID_RECORD', 'Student requires a non-empty name.')
        for (const key of ['dateOfBirth', 'guardianName', 'guardianContact']) if (record[key] !== undefined && !validText(record[key])) fail('INVALID_RECORD', 'Invalid student details.')
        if (record.dateOfBirth !== undefined && !validDateOnly(record.dateOfBirth)) fail('INVALID_RECORD', 'Invalid date of birth.')
        if (record.guardianContact !== undefined && !validContact(record.guardianContact)) fail('INVALID_RECORD', 'Invalid guardian contact.')
      } else {
        if (Object.keys(record).length !== 1 || !validText(record.name)) fail('INVALID_RECORD', 'Only a non-empty provisional name is accepted.')
      }
    }
  }

  function authorizeAdmission(action, query) {
    const session = readMockSession()
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')
    const allowed = action === 'view' ? canViewAdmissions(session.user, query.branchId)
      : action === 'create' ? canCreateAdmissions(session.user, query.branchId)
        : action === 'edit' ? canEditAdmissions(session.user, query.branchId)
          : action === 'delete' ? canDeleteAdmission(session.user, query.branchId)
            : action === 'decide' ? canDecideAdmission(session.user, query.branchId) : false
    if (!allowed) fail('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for the requested Admissions action.')
    return session
  }

  function authorizeStudent(action, query) {
    const session = readMockSession()
    const permission = action === 'edit' ? PERMISSIONS.STUDENTS_EDIT : PERMISSIONS.STUDENTS_VIEW
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')
    if (!canAccess(permission, session.user, query.branchId)) fail('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for the requested Students action.')
    return session
  }

  function authorizeAcademics(action, query) {
    const session = readMockSession()
    const permission = action === 'manage' ? PERMISSIONS.COURSES_MANAGE : PERMISSIONS.COURSES_VIEW
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')
    if (!canAccess(permission, session.user, query.branchId)) fail('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for the requested Courses & Batches action.')
  }

  function academicOperation(operation, { entity, id, record, query } = {}) {
    if (!object(query) || Object.keys(query).some(key => key !== 'branchId') || !validBranch(query.branchId)) fail('INVALID_QUERY', 'A concrete known demo branchId is required.')
    if (!['overview', 'get', 'save', 'delete'].includes(operation) || (operation !== 'overview' && !['stream', 'course', 'batch', 'subject'].includes(entity))) fail('INVALID_REQUEST', 'Unknown Courses & Batches operation.')
    const mutating = operation === 'save' || operation === 'delete'
    authorizeAcademics(mutating ? 'manage' : 'view', query)
    const data = read(!mutating, !mutating)
    const branchStreams = data.academicStreams.filter(item => item.branchId === query.branchId)
    const branchCourses = data.courses.filter(item => item.branchId === query.branchId)
    const branchBatches = data.batches.filter(item => item.branchId === query.branchId)
    const branchSubjects = data.subjects.filter(item => item.branchId === query.branchId)
    const presentCourse = course => ({ ...course, active: course.active ?? true, streamName: branchStreams.find(stream => stream.id === course.streamId)?.name ?? 'Unassigned', batchCount: branchBatches.filter(batch => batch.courseId === course.id).length, subjectCount: branchSubjects.filter(subject => subject.courseId === course.id).length, enrolledCount: data.enrollments.filter(enrollment => enrollment.branchId === query.branchId && enrollment.courseId === course.id && enrollment.status === 'Active').length })
    const presentBatch = batch => { const enrolledCount = data.enrollments.filter(enrollment => enrollment.branchId === query.branchId && enrollment.batchId === batch.id && enrollment.status === 'Active').length; return { ...batch, active: batch.active ?? true, courseName: branchCourses.find(course => course.id === batch.courseId)?.name ?? 'Unresolved course', enrolledCount, remainingSeats: batch.capacity == null ? null : Math.max(0, batch.capacity - enrolledCount), teachers: [], timetable: [] } }
    const presentSubject = subject => ({ ...subject, courseName: branchCourses.find(course => course.id === subject.courseId)?.name ?? 'Unresolved course' })
    if (operation === 'overview') return { streams: branchStreams, courses: branchCourses.map(presentCourse), batches: branchBatches.map(presentBatch), subjects: branchSubjects.map(presentSubject) }
    const collection = entity === 'stream' ? data.academicStreams : entity === 'course' ? data.courses : entity === 'batch' ? data.batches : data.subjects
    const existing = collection.find(item => item.id === id && item.branchId === query.branchId)
    if (operation === 'get') {
      if (!existing) fail('NOT_FOUND', 'Record was not found in the active branch.')
      return entity === 'course' ? presentCourse(existing) : entity === 'batch' ? presentBatch(existing) : entity === 'subject' ? presentSubject(existing) : existing
    }
    if (operation === 'delete') {
      if (!existing) fail('NOT_FOUND', 'Record was not found in the active branch.')
      if (entity === 'course') {
        const linked = branchBatches.some(item => item.courseId === existing.id) || branchSubjects.some(item => item.courseId === existing.id) || data.admissions.some(item => item.branchId === query.branchId && item.courseId === existing.id) || data.enrollments.some(item => item.branchId === query.branchId && item.courseId === existing.id)
        if (linked) fail('LINKED_RECORD_PROTECTED', 'Delete linked batches, subjects and student records before deleting this course.')
      }
      if (entity === 'stream') {
        const linked = branchCourses.some(item => item.streamId === existing.id) || data.admissions.some(item => item.branchId === query.branchId && item.streamId === existing.id)
        if (linked) fail('LINKED_RECORD_PROTECTED', 'This academic stream is used by a course or admission and cannot be deleted.')
      }
      if (entity === 'batch') {
        const linked = data.admissions.some(item => item.branchId === query.branchId && item.preferredBatchId === existing.id) || data.enrollments.some(item => item.branchId === query.branchId && item.batchId === existing.id) || data.classes.some(item => item.branchId === query.branchId && item.batchId === existing.id)
        if (linked) fail('LINKED_RECORD_PROTECTED', 'This batch is used by an admission, enrollment or class and cannot be deleted.')
      }
      if (entity === 'subject') {
        const linked = data.admissions.some(item => item.branchId === query.branchId && item.subjectIds?.includes(existing.id)) || data.enrollments.some(item => item.branchId === query.branchId && item.subjectIds?.includes(existing.id))
        if (linked) fail('LINKED_RECORD_PROTECTED', 'This subject is used by an admission or enrollment and cannot be deleted.')
      }
      collection.splice(collection.indexOf(existing), 1)
      write(data)
      return entity === 'course' ? presentCourse(existing) : entity === 'batch' ? presentBatch(existing) : entity === 'subject' ? presentSubject(existing) : existing
    }
    const allowed = entity === 'stream' ? ['name', 'active'] : entity === 'course' ? ['name', 'streamId', 'active', 'feeAmount', 'pricingMode'] : entity === 'batch' ? ['name', 'courseId', 'active', 'capacity', 'startTime', 'endTime'] : ['name', 'courseId', 'active', 'feeAmount']
    if (!object(record) || Object.keys(record).some(key => !allowed.includes(key)) || !validText(record.name)) fail('INVALID_RECORD', 'A valid academic record name is required.')
    if (entity === 'stream' && typeof record.active !== 'boolean') fail('INVALID_RECORD', 'Stream status is required.')
    if (entity === 'course' && ((record.active !== undefined && typeof record.active !== 'boolean') || (record.streamId != null && !branchStreams.some(stream => stream.id === record.streamId)) || (record.pricingMode !== undefined && !['course', 'subjects'].includes(record.pricingMode)) || (record.feeAmount !== undefined && (!Number.isFinite(record.feeAmount) || record.feeAmount < 0)))) fail('INVALID_RECORD', 'Course configuration is invalid.')
    if (entity === 'batch' && (!branchCourses.some(course => course.id === record.courseId) || (record.active !== undefined && typeof record.active !== 'boolean') || (record.capacity !== undefined && (!Number.isSafeInteger(record.capacity) || record.capacity <= 0)) || (record.startTime && !/^\d{2}:\d{2}$/.test(record.startTime)) || (record.endTime && !/^\d{2}:\d{2}$/.test(record.endTime)) || (record.startTime && record.endTime && record.startTime >= record.endTime))) fail('INVALID_RECORD', 'Batch configuration is invalid.')
    if (entity === 'subject' && (!branchCourses.some(course => course.id === record.courseId) || typeof record.active !== 'boolean' || (record.feeAmount !== undefined && (!Number.isFinite(record.feeAmount) || record.feeAmount < 0)))) fail('INVALID_RECORD', 'Subject configuration is invalid.')
    const name = record.name.trim()
    if (collection.some(item => item.branchId === query.branchId && item.id !== id && item.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase() && (entity !== 'subject' || item.courseId === record.courseId))) fail('DUPLICATE_RECORD', `A ${entity} with this name already exists in the branch.`)
    if (existing && entity === 'batch' && existing.courseId !== record.courseId) {
      const linked = data.admissions.some(item => item.branchId === query.branchId && item.preferredBatchId === existing.id) || data.enrollments.some(item => item.branchId === query.branchId && item.batchId === existing.id)
      if (linked) fail('LINKED_RECORD_PROTECTED', 'A linked batch cannot be moved to another course.')
    }
    if (existing && entity === 'course' && existing.streamId !== record.streamId && data.admissions.some(item => item.branchId === query.branchId && item.courseId === existing.id)) fail('LINKED_RECORD_PROTECTED', 'A course used by admissions cannot be moved to another stream.')
    let saved
    const defaults = existing ? {} : entity === 'course' ? { active: true, pricingMode: 'course' } : entity === 'batch' ? { active: true } : {}
    const fields = { ...defaults, ...Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined)) }
    if (existing) {
      saved = { ...existing, ...fields, name }
      collection[collection.indexOf(existing)] = saved
    } else {
      let generatedId
      try { generatedId = makeId() } catch { fail('ID_GENERATION_FAILED', 'A stable record ID could not be generated.') }
      if (!validText(generatedId) || collections.some(key => data[key].some(item => item.id === generatedId))) fail('ID_CONFLICT', 'Generated record ID conflicts with saved data.')
      saved = { id: generatedId, branchId: query.branchId, ...fields, name }
      collection.push(saved)
    }
    normalizeAdmissions(data)
    write(data)
    return entity === 'course' ? presentCourse(saved) : entity === 'batch' ? presentBatch(saved) : entity === 'subject' ? presentSubject(saved) : saved
  }

  function projectStudent(data, student, project = createDisplayProjector(data)) {
    const admission = data.admissions.find(item => item.id === student.admissionId && item.studentId === student.id && item.branchId === student.branchId)
    const enrollments = data.enrollments.filter(item => item.studentId === student.id && item.branchId === student.branchId)
      .map(enrollment => ({
        ...enrollment,
        feeStatus: enrollment.feeStatus ?? 'Unavailable',
        courseName: data.courses.find(item => item.id === enrollment.courseId && item.branchId === student.branchId)?.name ?? 'Unresolved course',
        batchName: data.batches.find(item => item.id === enrollment.batchId && item.branchId === student.branchId)?.name ?? 'Unresolved batch',
      }))
    const currentEnrollment = [...enrollments].filter(item => item.status === 'Active').sort((a, b) => Date.parse(b.enrolledAt) - Date.parse(a.enrolledAt))[0]
    const courseId = currentEnrollment?.courseId ?? admission?.courseId ?? null
    const batchId = currentEnrollment?.batchId ?? admission?.preferredBatchId ?? null
    return {
      ...project('students', student),
      dateOfBirth: admission?.dob ?? student.dateOfBirth ?? null,
      guardianName: admission?.guardianName ?? student.guardianName ?? null,
      guardianContact: admission?.contact ?? student.guardianContact ?? null,
      admissionCreatedAt: admission?.createdAt ?? null,
      admissionStatus: admission?.status ?? null,
      courseId,
      courseName: data.courses.find(item => item.id === courseId && item.branchId === student.branchId)?.name ?? admission?.course ?? null,
      batchId,
      batchName: data.batches.find(item => item.id === batchId && item.branchId === student.branchId)?.name ?? null,
      admission: admission ? project('admissions', admission) : null,
      enrollments,
    }
  }

  function updateStudent(id, record, query) {
    validateRequest('students', 'update', id, record, query)
    authorizeStudent('edit', query)
    const data = read(false)
    const student = applyOperation(data, 'students', 'getById', id, undefined, query)
    student.name = record.name.trim()
    for (const key of ['dateOfBirth', 'guardianName', 'guardianContact']) {
      if (record[key] !== undefined) student[key] = record[key].trim()
    }
    const linkedAdmissions = data.admissions.filter(item => item.studentId === student.id && item.branchId === student.branchId)
    if (student.admissionId != null && (linkedAdmissions.length !== 1 || linkedAdmissions[0].id !== student.admissionId)) fail('INVALID_LINK', 'The linked Admission cannot be safely synchronized with this Student.')
    if (linkedAdmissions[0]) {
      linkedAdmissions[0].studentName = student.name
      if (record.dateOfBirth !== undefined) linkedAdmissions[0].dob = record.dateOfBirth
      if (record.guardianName !== undefined) linkedAdmissions[0].guardianName = record.guardianName.trim()
      if (record.guardianContact !== undefined) linkedAdmissions[0].contact = record.guardianContact.trim()
    }
    normalizeAdmissions(data)
    write(data)
    return createDisplayProjector(data)('students', student)
  }

  function studentOperation(operation, { id, query } = {}) {
    if (!['listDirectory', 'getProfile'].includes(operation)) fail('INVALID_REQUEST', 'Unknown mock Student read operation.')
    validateRequest('students', operation === 'listDirectory' ? 'list' : 'getById', id, undefined, query)
    authorizeStudent('view', query)
    const data = read(true, true)
    const project = createDisplayProjector(data)
    if (operation === 'listDirectory') return data.students.filter(student => student.branchId === query.branchId).map(student => projectStudent(data, student, project))
    const student = data.students.find(item => item.id === id && item.branchId === query.branchId)
    if (!student) fail('NOT_FOUND', 'Record was not found in the requested branch.')
    return projectStudent(data, student, project)
  }

  function updateEnrollmentFeeStatus(id, record, query = {}) {
    if (!object(query) || Object.keys(query).some(key => key !== 'branchId') || !validBranch(query.branchId)) fail('INVALID_QUERY', 'A concrete known demo branchId is required.')
    const session = readMockSession()
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')
    if (!canAccess(PERMISSIONS.FEES_MANAGE, session.user, query.branchId)) fail('DEMO_ACTION_DENIED', 'This DEMO role is not authorized to update enrollment fee status.')
    if (!validText(id) || !object(record) || Object.keys(record).some(key => key !== 'feeStatus') || !['Unavailable', 'Paid', 'Partial'].includes(record.feeStatus)) fail('INVALID_RECORD', 'Choose a supported fee status.')
    const data = read(false)
    const enrollment = data.enrollments.find(item => item.id === id && item.branchId === query.branchId)
    if (!enrollment) fail('NOT_FOUND', 'Enrollment was not found in the active branch.')
    enrollment.feeStatus = record.feeStatus
    write(data)
    return { ...enrollment }
  }
  function classScheduleOperation(operation, { id, record, query = {} } = {}) {
    if (!object(query) || !validBranch(query.branchId)) fail('INVALID_QUERY', 'A concrete known demo branchId is required.')
    const session = readMockSession()
    const permission = operation === 'list' || operation === 'get' ? PERMISSIONS.CLASSES_VIEW : PERMISSIONS.CLASSES_MANAGE
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')
    if (!canAccess(permission, session.user, query.branchId)) fail('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for this class schedule action.')
    const data = read(false)
    const project = item => ({ ...item, batchName: data.batches.find(batch => batch.id === item.batchId)?.name ?? 'Unresolved batch', teacherName: DEMO_USERS.find(user => user.id === item.teacherId)?.name ?? 'Unresolved teacher', enrolledCount: data.enrollments.filter(enrollment => enrollment.branchId === item.branchId && enrollment.batchId === item.batchId && enrollment.status === 'Active').length })
    if (operation === 'list') return data.classes.filter(item => item.branchId === query.branchId).map(project)
    const index = data.classes.findIndex(item => item.id === id && item.branchId === query.branchId)
    if (operation === 'get') { if (index < 0) fail('NOT_FOUND', 'Class was not found.'); return project(data.classes[index]) }
    if (operation === 'delete') { if (index < 0) fail('NOT_FOUND', 'Class was not found.'); const [removed] = data.classes.splice(index, 1); write(data); return project(removed) }
    const candidate = { ...(index >= 0 ? data.classes[index] : {}), ...record, id: index >= 0 ? data.classes[index].id : makeId(), branchId: query.branchId }
    validateRecord(candidate, 'classes')
    if (!data.batches.some(batch => batch.id === candidate.batchId && batch.branchId === query.branchId)) fail('INVALID_REFERENCE', 'Choose a batch from the active branch.')
    const teacher = DEMO_USERS.find(user => user.id === candidate.teacherId && user.enabled && getBranchRoles(user, query.branchId).length === 1 && getBranchRoles(user, query.branchId)[0] === ROLES.TEACHER)
    if (!teacher) fail('INVALID_REFERENCE', 'Choose an enabled Teacher from the active branch.')
    const conflict = data.classes.find(item => item.id !== candidate.id && item.branchId === query.branchId && item.classDate === candidate.classDate && candidate.startTime < item.endTime && candidate.endTime > item.startTime && (item.teacherId === candidate.teacherId || item.batchId === candidate.batchId || item.location.trim().toLowerCase() === candidate.location.trim().toLowerCase()))
    if (conflict) fail('SCHEDULE_CONFLICT', 'Teacher, batch or location already has an overlapping class.')
    if (index >= 0) data.classes[index] = candidate; else data.classes.push(candidate)
    write(data)
    return project(candidate)
  }

  function run(collection, operation, { id, record, query = {}, preserveSavedRecords = false } = {}) {
    validateRequest(collection, operation, id, record, query)
    if (collection === 'admissions' && operation === 'create') return createAdmission(record, query)
    if (collection === 'admissions' && operation === 'update') return updateAdmission(id, record, query)
    if (collection === 'students' && operation === 'update') return updateStudent(id, record, query)
    if (collection === 'students' && operation !== 'create') authorizeStudent('view', query)
    const data = read(!['create', 'update'].includes(operation), preserveSavedRecords && ['list', 'getById'].includes(operation))
    const result = applyOperation(data, collection, operation, id, record, query)
    if (['create', 'update'].includes(operation)) { normalizeAdmissions(data); write(data) }
    const project = createDisplayProjector(data)
    return Array.isArray(result) ? result.map((item) => project(collection, item)) : project(collection, result)
  }

  function runTransaction(operations) {
    if (!Array.isArray(operations) || operations.length === 0) fail('INVALID_REQUEST', 'runTransaction requires an array of operations.')
    for (const op of operations) {
      if (!object(op)) fail('INVALID_REQUEST', 'Operation must be an object.')
      validateRequest(op.collection, op.operation, op.id, op.record, op.query || {})
    }
    const data = read(false)
    operations.filter(op => op.collection === 'students' && op.operation !== 'create').forEach(op => authorizeStudent(op.operation === 'update' ? 'edit' : 'view', op.query || {}))
    const results = []
    for (const op of operations) {
      const { collection, operation, id, record, query = {} } = op
      const result = applyOperation(data, collection, operation, id, record, query)
      if (collection === 'students' && operation === 'update') {
        for (const key of ['dateOfBirth', 'guardianName', 'guardianContact']) if (record[key] !== undefined) result[key] = record[key].trim()
        const linked = data.admissions.filter(item => item.studentId === result.id && item.branchId === result.branchId)
        if (result.admissionId != null && (linked.length !== 1 || linked[0].id !== result.admissionId)) fail('INVALID_LINK', 'The linked Admission cannot be safely synchronized with this Student.')
        if (linked[0]) {
          linked[0].studentName = result.name
          if (record.dateOfBirth !== undefined) linked[0].dob = record.dateOfBirth
          if (record.guardianName !== undefined) linked[0].guardianName = record.guardianName.trim()
          if (record.guardianContact !== undefined) linked[0].contact = record.guardianContact.trim()
        }
      }
      results.push(result)
    }
    normalizeAdmissions(data)
    if (results.some((result, index) => operations[index].collection === 'admissions' && operations[index].operation === 'create' && !result.studentId)) fail('INVALID_LINK', 'A new admission requires a linked student in the same transaction.')
    write(data)
    const project = createDisplayProjector(data)
    return results.map((result, index) => operations[index].collection === 'students' && operations[index].operation === 'update'
      ? projectStudent(data, result, project)
      : Array.isArray(result) ? result.map((item) => project(operations[index].collection, item)) : project(operations[index].collection, result))
  }

  function createAdmission(record, query) {
    validateRequest('admissions', 'create', undefined, record, query)
    const data = read(false)
    const admission = applyOperation(data, 'admissions', 'create', undefined, record, query)
    const student = applyOperation(data, 'students', 'create', undefined, { name: admission.studentName, status: 'Provisional', admissionId: admission.id }, query)
    if (student.id === admission.id) fail('ID_CONFLICT', 'Admission and student require distinct internal IDs.')
    admission.studentId = student.id
    admission.createdByAdmissionFlow = true
    student.createdByAdmissionFlow = true
    normalizeAdmissions(data)
    write(data)
    const project = createDisplayProjector(data)
    return { ...project('admissions', admission), student: project('students', student) }
  }
  function getAdmission(id, query) {
    validateRequest('admissions', 'getById', id, undefined, query)
    const data = read()
    const admission = applyOperation(data, 'admissions', 'getById', id, undefined, query)
    const project = createDisplayProjector(data)
    const student = data.students.find((item) => item.id === admission.studentId)
    const course = data.courses.find(item => item.id === admission.courseId && item.branchId === admission.branchId)
    const batch = data.batches.find(item => item.id === admission.preferredBatchId && item.courseId === admission.courseId && item.branchId === admission.branchId)
    return { ...project('admissions', admission), courseLabel: course?.name ?? `Unresolved course: ${admission.course}`, batchLabel: admission.preferredBatchId == null ? 'Not selected' : batch?.name ?? `Unresolved batch: ${admission.preferredBatchId}`, student: student ? project('students', student) : null }
  }
  function linkedProvisional(data, admission) {
    if (!admission.studentId) return null
    const student = data.students.find((item) => item.id === admission.studentId)
    if (!student || student.branchId !== admission.branchId || student.admissionId !== admission.id || student.status !== 'Provisional') fail('UNSAFE_LINK', 'Only a linked Provisional student can be changed by this admission flow.')
    return student
  }
  function updateAdmission(id, record, query) {
    validateRequest('admissions', 'update', id, record, query)
    const data = read(false)
    const admission = applyOperation(data, 'admissions', 'getById', id, undefined, query)
    if (data.enrollments.some(item => item.admissionId === id)) fail('ENROLLED_RECORD_PROTECTED', 'An enrolled admission cannot be edited.')
    const student = linkedProvisional(data, admission)
    const updated = applyOperation(data, 'admissions', 'update', id, record, query)
    if (student) student.name = updated.studentName
    normalizeAdmissions(data)
    write(data)
    const project = createDisplayProjector(data)
    return { ...project('admissions', updated), student: student ? project('students', student) : null }
  }
  function deleteAdmission(id, query) {
    validateRequest('admissions', 'getById', id, undefined, query)
    authorizeAdmission('delete', query)
    const data = read(false)
    const admission = applyOperation(data, 'admissions', 'getById', id, undefined, query)
    const linkedEnrollments = data.enrollments.filter(item => item.admissionId === admission.id)
    let student
    if (linkedEnrollments.length > 0) {
      student = data.students.find(item => item.id === admission.studentId)
      const uniquelyOwned = admission.createdByAdmissionFlow
        && student?.createdByAdmissionFlow
        && student.admissionId === admission.id
        && student.branchId === admission.branchId
        && data.students.filter(item => item.admissionId === admission.id).length === 1
        && linkedEnrollments.every(item => item.studentId === student.id && item.branchId === admission.branchId)
        && !data.enrollments.some(item => item.studentId === student.id && item.admissionId !== admission.id)
      if (!uniquelyOwned) fail('UNSAFE_LINK', 'The enrolled student ownership or enrollment links cannot be verified safely.')
    } else student = linkedProvisional(data, admission)
    const displayed = createDisplayProjector(data)('admissions', admission)
    const linkedEnrollmentIds = new Set(linkedEnrollments.map(item => item.id))
    const linkedChallans = data.challans.filter(item => linkedEnrollmentIds.has(item.enrollmentId))
    const linkedChallanIds = new Set(linkedChallans.map(item => item.id))
    const linkedPayments = data.payments.filter(item => linkedChallanIds.has(item.challanId))
    if (linkedChallans.some(item => item.branchId !== admission.branchId || item.studentId !== student?.id) || linkedPayments.some(item => item.branchId !== admission.branchId || item.studentId !== student?.id)) fail('UNSAFE_LINK', 'The linked financial records cannot be verified safely for deletion.')
    data.admissions = data.admissions.filter((item) => item.id !== admission.id)
    data.enrollments = data.enrollments.filter((item) => item.admissionId !== admission.id)
    data.payments = data.payments.filter(item => !linkedChallanIds.has(item.challanId))
    data.challans = data.challans.filter(item => !linkedEnrollmentIds.has(item.enrollmentId))
    if (student) data.students = data.students.filter((item) => item.id !== student.id)
    normalizeAdmissions(data)
    write(data)
    return { id: admission.id, admissionId: admission.admissionId, displaySerial: displayed.displaySerial, displayAdmissionId: displayed.displayAdmissionId, deletedStudentId: student?.id ?? null, deletedEnrollmentIds: linkedEnrollments.map(item => item.id), deletedChallanIds: linkedChallans.map(item => item.id), deletedPaymentIds: linkedPayments.map(item => item.id) }
  }
  function changeAdmissionStatus(id, record, query) {
    validateRequest('admissions', 'getById', id, undefined, query)
    const session = authorizeAdmission('decide', query)
    if (!object(record) || Object.keys(record).some(key => !['status', 'expectedStatus'].includes(key)) || !['Pending', 'Approved'].includes(record.status) || !['Pending', 'Approved'].includes(record.expectedStatus)) fail('INVALID_TRANSITION', 'Invalid DEMO status request.')
    const data = read(false)
    const admission = applyOperation(data, 'admissions', 'getById', id, undefined, query)
    if (record.status === 'Pending' && data.enrollments.some(item => item.admissionId === id && item.status === 'Active')) fail('ENROLLED_RECORD_PROTECTED', 'An admission with an active enrollment cannot return to Pending.')
    if (admission.status === record.status && data.enrollments.some(item => item.admissionId === id && item.status === 'Active') && record.status === 'Approved') {
      const student = data.students.find(item => item.id === admission.studentId)
      return { ...createDisplayProjector(data)('admissions', admission), student: createDisplayProjector(data)('students', student) }
    }
    const student = linkedProvisional(data, admission)
    if (!student || data.students.filter(item => item.admissionId === admission.id).length !== 1) fail('UNSAFE_LINK', 'A unique same-branch linked Provisional student is required.')
    const project = createDisplayProjector(data)
    if (admission.status === record.status) return { ...project('admissions', admission), student: project('students', student) }
    if (admission.status !== record.expectedStatus) fail('STALE_STATUS', 'Admission status changed. Reload the saved record before trying again.')
    const canTransition = (admission.status === 'Pending' && record.status === 'Approved')
      || (admission.status === 'Approved' && record.status === 'Pending')
    if (!canTransition) fail('INVALID_TRANSITION', 'Admission status transition is not allowed.')
    let eventId
    try { eventId = makeId() } catch { fail('ID_GENERATION_FAILED', 'Status event ID could not be generated.') }
    if (!validText(eventId) || collections.some(collection => data[collection].some(item => item.id === eventId)) || data.admissions.some(item => item.statusHistory?.some(event => event.id === eventId))) fail('ID_CONFLICT', 'Status event ID conflicts with saved data.')
    admission.statusHistory = [...(admission.statusHistory ?? []), { id: eventId, admissionId: admission.id, branchId: admission.branchId, fromStatus: admission.status, toStatus: record.status, actorUserId: session.user.id, occurredAt: new Date().toISOString(), reason: record.reason?.trim() ?? '' }]
    admission.status = record.status
    normalizeAdmissions(data)
    write(data)
    return { ...project('admissions', admission), student: project('students', student) }
  }
  function enrollStudent(id, record, query) {
    validateRequest('admissions', 'getById', id, undefined, query)
    authorizeAdmission('decide', query)
    if (!object(record) || Object.keys(record).some(key => key !== 'batchId') || !validText(record.batchId)) fail('INVALID_RECORD', 'A valid batch is required for enrollment.')
    const data = read(false)
    const admission = applyOperation(data, 'admissions', 'getById', id, undefined, query)
    if (admission.status !== 'Approved') fail('INVALID_TRANSITION', 'Only an Approved admission can be enrolled.')
    if (data.enrollments.some(item => item.admissionId === admission.id)) fail('DUPLICATE_ENROLLMENT', 'This admission already has an enrollment.')
    const student = linkedProvisional(data, admission)
    if (!student || !admission.createdByAdmissionFlow || !student.createdByAdmissionFlow || data.students.filter(item => item.admissionId === admission.id).length !== 1) fail('UNSAFE_LINK', 'A unique same-branch linked Provisional student is required.')
    const course = data.courses.find(item => item.id === admission.courseId && item.branchId === query.branchId)
    const batch = data.batches.find(item => item.id === record.batchId && item.branchId === query.branchId && item.courseId === admission.courseId)
    if (!course || !batch) fail('INVALID_REFERENCE', 'Choose a saved batch for the admission course in the active branch.')
    if (data.enrollments.some(item => item.status === 'Active' && item.studentId === student.id && item.courseId === course.id && item.batchId === batch.id)) fail('DUPLICATE_ENROLLMENT', 'This student already has an active enrollment in that course and batch.')
    let enrollmentId
    try { enrollmentId = makeId() } catch { fail('ID_GENERATION_FAILED', 'Enrollment ID could not be generated.') }
    if (!validText(enrollmentId) || collections.some(collection => data[collection].some(item => item.id === enrollmentId))) fail('ID_CONFLICT', 'Enrollment ID conflicts with saved data.')
    const enrollment = { id: enrollmentId, branchId: query.branchId, admissionId: admission.id, studentId: student.id, courseId: course.id, batchId: batch.id, ...(admission.subjectIds ? { subjectIds: [...admission.subjectIds] } : {}), ...(Number.isFinite(admission.configuredFee) ? { configuredFee: admission.configuredFee } : {}), status: 'Active', enrolledAt: new Date().toISOString(), feeStatus: 'Unavailable' }
    student.status = 'Active'
    data.enrollments.push(enrollment)
    normalizeAdmissions(data)
    write(data)
    const project = createDisplayProjector(data)
    return { enrollment, admission: project('admissions', admission), student: project('students', student) }
  }

  function demoClassOperation(operation, { id, record, query = {} } = {}) {
    if (!object(query) || Object.keys(query).some(key => key !== 'branchId') || !validBranch(query.branchId)) fail('INVALID_QUERY', 'A concrete known demo branchId is required.')
    const session = readMockSession()
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')

    const isView = ['list', 'get'].includes(operation)
    const permission = isView ? PERMISSIONS.DEMO_CLASSES_VIEW : PERMISSIONS.DEMO_CLASSES_MANAGE
    if (!canAccess(permission, session.user, query.branchId)) fail('DEMO_ACTION_DENIED', 'This DEMO role is not authorized for this Demo Classes action.')

    const mutating = !isView
    const data = read(!mutating)

    const projectDemo = (item) => {
      const course = data.courses.find(c => c.id === item.courseId && c.branchId === item.branchId)
      const batch = item.preferredBatchId ? data.batches.find(b => b.id === item.preferredBatchId && b.branchId === item.branchId) : null
      let teacherName = item.scheduledSession?.teacherName
      if (item.scheduledSession?.teacherId && !teacherName) {
        const teacher = DEMO_USERS.find(u => u.id === item.scheduledSession.teacherId)
        teacherName = teacher?.name ?? 'Teacher'
      }
      return {
        ...item,
        courseName: course?.name ?? item.courseName ?? 'Unknown Course',
        batchName: batch?.name ?? item.batchName ?? null,
        scheduledSession: item.scheduledSession ? {
          ...item.scheduledSession,
          teacherName: teacherName ?? item.scheduledSession.teacherName,
        } : null,
      }
    }

    if (operation === 'list') {
      return (data.demoClasses || []).filter(d => d.branchId === query.branchId).map(projectDemo).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    }

    const index = (data.demoClasses || []).findIndex(d => d.id === id && d.branchId === query.branchId)
    if (operation === 'get') {
      if (index < 0) fail('NOT_FOUND', 'Demo class inquiry was not found.')
      return projectDemo(data.demoClasses[index])
    }

    if (operation === 'register') {
      if (!object(record)) fail('INVALID_RECORD', 'Demo registration record is required.')
      const { studentName, guardianName, guardianContact, courseId, preferredBatchId, requestedDate, requestedTime = '', notes = '', studentId } = record
      if (!validText(studentName) || !validText(guardianName) || !validContact(guardianContact) || !validText(courseId) || !validDateOnly(requestedDate)) {
        fail('INVALID_RECORD', 'Complete all required registration fields.')
      }
      const course = data.courses.find(c => c.id === courseId && c.branchId === query.branchId)
      if (!course) fail('INVALID_REFERENCE', 'Choose a course in the active branch.')
      if (preferredBatchId && !data.batches.some(b => b.id === preferredBatchId && b.branchId === query.branchId && b.courseId === courseId)) {
        fail('INVALID_REFERENCE', 'Choose a batch belonging to the selected course in this branch.')
      }
      if (studentId && !data.students.some(s => s.id === studentId && s.branchId === query.branchId)) {
        fail('INVALID_REFERENCE', 'Referenced student does not exist in this branch.')
      }

      // Duplicate submission protection
      const duplicate = (data.demoClasses || []).find(d =>
        d.branchId === query.branchId &&
        d.studentName.trim().toLowerCase() === studentName.trim().toLowerCase() &&
        d.guardianContact.trim() === guardianContact.trim() &&
        d.courseId === courseId &&
        d.requestedDate === requestedDate &&
        d.status !== 'Cancelled'
      )
      if (duplicate) fail('DUPLICATE_REGISTRATION', 'A demo registration already exists for this student, course and requested date.')

      data.branchCounters[query.branchId].demo = (data.branchCounters[query.branchId].demo ?? 0) + 1
      const demoNumber = data.branchCounters[query.branchId].demo
      const demoId = `DEMO-${String(demoNumber).padStart(4, '0')}`
      let newId
      try { newId = makeId() } catch { fail('ID_GENERATION_FAILED', 'Demo record ID could not be generated.') }
      if (!validText(newId) || collections.some(col => (data[col] || []).some(item => item.id === newId))) {
        newId = `demo-${makeId()}`
      }
      const now = new Date().toISOString()
      const newDemo = {
        id: newId,
        branchId: query.branchId,
        demoNumber,
        demoId,
        studentName: studentName.trim(),
        studentId: studentId || null,
        guardianName: guardianName.trim(),
        guardianContact: guardianContact.trim(),
        courseId,
        courseName: course.name,
        preferredBatchId: preferredBatchId || null,
        batchName: data.batches.find(b => b.id === preferredBatchId)?.name || null,
        requestedDate,
        requestedTime: (requestedTime || '').trim(),
        notes: (notes || '').trim(),
        status: 'Registered',
        scheduledSession: null,
        attendance: null,
        convertedAdmissionId: null,
        convertedAdmissionDisplayId: null,
        convertedAt: null,
        statusHistory: [
          {
            id: `hist-${makeId()}`,
            demoId: newId,
            fromStatus: 'None',
            toStatus: 'Registered',
            actorUserId: session.user.id,
            actorName: session.user.name,
            occurredAt: now,
            reason: 'Inquiry registered',
          }
        ],
        createdAt: now.slice(0, 10),
        updatedAt: now,
      }
      validateRecord(newDemo, 'demoClasses')
      data.demoClasses = data.demoClasses || []
      data.demoClasses.push(newDemo)
      write(data)
      return projectDemo(newDemo)
    }

    if (index < 0) fail('NOT_FOUND', 'Demo record was not found in active branch.')
    const existing = data.demoClasses[index]

    if (operation === 'update') {
      if (existing.status === 'Converted' || existing.status === 'Cancelled') {
        fail('INVALID_TRANSITION', 'Cannot edit a converted or cancelled demo inquiry.')
      }
      const { studentName, guardianName, guardianContact, courseId, preferredBatchId, requestedDate, requestedTime, notes } = record
      if (studentName !== undefined) {
        if (!validText(studentName)) fail('INVALID_RECORD', 'Student name is required.')
        existing.studentName = studentName.trim()
      }
      if (guardianName !== undefined) {
        if (!validText(guardianName)) fail('INVALID_RECORD', 'Guardian name is required.')
        existing.guardianName = guardianName.trim()
      }
      if (guardianContact !== undefined) {
        if (!validContact(guardianContact)) fail('INVALID_RECORD', 'Valid guardian contact is required.')
        existing.guardianContact = guardianContact.trim()
      }
      if (courseId !== undefined) {
        const course = data.courses.find(c => c.id === courseId && c.branchId === query.branchId)
        if (!course) fail('INVALID_REFERENCE', 'Course not found in branch.')
        existing.courseId = courseId
        existing.courseName = course.name
      }
      if (preferredBatchId !== undefined) {
        if (preferredBatchId && !data.batches.some(b => b.id === preferredBatchId && b.branchId === query.branchId)) {
          fail('INVALID_REFERENCE', 'Batch not found in branch.')
        }
        existing.preferredBatchId = preferredBatchId || null
        existing.batchName = data.batches.find(b => b.id === preferredBatchId)?.name || null
      }
      if (requestedDate !== undefined) {
        if (!validDateOnly(requestedDate)) fail('INVALID_RECORD', 'Valid requested date is required.')
        existing.requestedDate = requestedDate
      }
      if (requestedTime !== undefined) existing.requestedTime = (requestedTime || '').trim()
      if (notes !== undefined) existing.notes = (notes || '').trim()
      existing.updatedAt = new Date().toISOString()
      validateRecord(existing, 'demoClasses')
      write(data)
      return projectDemo(existing)
    }

    if (operation === 'schedule') {
      if (existing.status === 'Converted' || existing.status === 'Cancelled') {
        fail('INVALID_TRANSITION', 'Cannot schedule a converted or cancelled demo.')
      }
      const { classDate, startTime, endTime, teacherId, location, reason = '' } = record
      if (!validDateOnly(classDate) || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || startTime >= endTime) {
        fail('INVALID_RECORD', 'Complete scheduling with a valid date and start time before end time.')
      }
      if (!validText(location)) fail('INVALID_RECORD', 'A room or location is required.')

      const teacher = DEMO_USERS.find(u => u.id === teacherId && u.enabled && getBranchRoles(u, query.branchId).length === 1 && getBranchRoles(u, query.branchId)[0] === ROLES.TEACHER)
      if (!teacher) fail('INVALID_REFERENCE', 'Select an active Teacher assigned to this branch.')

      // Conflict detection 1: Check other scheduled demo classes in the branch
      const demoConflict = (data.demoClasses || []).find(d =>
        d.id !== existing.id &&
        d.branchId === query.branchId &&
        d.status === 'Scheduled' &&
        d.scheduledSession &&
        d.scheduledSession.classDate === classDate &&
        startTime < d.scheduledSession.endTime &&
        endTime > d.scheduledSession.startTime &&
        (d.scheduledSession.teacherId === teacherId || d.scheduledSession.location.trim().toLowerCase() === location.trim().toLowerCase())
      )
      if (demoConflict) {
        const isTeacher = demoConflict.scheduledSession.teacherId === teacherId
        fail('SCHEDULE_CONFLICT', isTeacher
          ? `Teacher ${teacher.name} already has another demo class scheduled during this time.`
          : `Location "${location}" is already booked for another demo class during this time.`
        )
      }

      // Conflict detection 2: Check regular classes in the branch
      const classConflict = (data.classes || []).find(c =>
        c.branchId === query.branchId &&
        c.classDate === classDate &&
        startTime < c.endTime &&
        endTime > c.startTime &&
        (c.teacherId === teacherId || c.location.trim().toLowerCase() === location.trim().toLowerCase())
      )
      if (classConflict) {
        const isTeacher = classConflict.teacherId === teacherId
        fail('SCHEDULE_CONFLICT', isTeacher
          ? `Teacher ${teacher.name} already has a regular class scheduled during this time.`
          : `Location "${location}" is already occupied by a regular class during this time.`
        )
      }

      const now = new Date().toISOString()
      const prevStatus = existing.status
      existing.scheduledSession = {
        classDate,
        startTime,
        endTime,
        teacherId,
        teacherName: teacher.name,
        location: location.trim(),
        scheduledAt: now,
        scheduledByUserId: session.user.id,
        scheduledByName: session.user.name,
      }
      existing.status = 'Scheduled'
      existing.attendance = null // reset any previous attendance on reschedule
      existing.updatedAt = now
      existing.statusHistory.push({
        id: `hist-${makeId()}`,
        demoId: existing.id,
        fromStatus: prevStatus,
        toStatus: 'Scheduled',
        actorUserId: session.user.id,
        actorName: session.user.name,
        occurredAt: now,
        reason: reason || (prevStatus === 'Scheduled' ? 'Rescheduled demo session' : `Scheduled demo session with ${teacher.name} in ${location}`),
      })
      validateRecord(existing, 'demoClasses')
      write(data)
      return projectDemo(existing)
    }

    if (operation === 'attendance') {
      if (existing.status !== 'Scheduled' && existing.status !== 'Attended' && existing.status !== 'Missed') {
        fail('INVALID_TRANSITION', 'Attendance can only be marked for a scheduled demo.')
      }
      const { status: attStatus, remarks = '' } = record
      if (!['Present', 'Absent'].includes(attStatus)) fail('INVALID_RECORD', 'Attendance must be Present or Absent.')
      const targetStatus = attStatus === 'Present' ? 'Attended' : 'Missed'
      const prevStatus = existing.status
      const now = new Date().toISOString()
      existing.attendance = {
        status: attStatus,
        markedAt: now,
        markedByUserId: session.user.id,
        markedByName: session.user.name,
        remarks: (remarks || '').trim(),
      }
      existing.status = targetStatus
      existing.updatedAt = now
      existing.statusHistory.push({
        id: `hist-${makeId()}`,
        demoId: existing.id,
        fromStatus: prevStatus,
        toStatus: targetStatus,
        actorUserId: session.user.id,
        actorName: session.user.name,
        occurredAt: now,
        reason: `Marked attendance as ${attStatus}${remarks ? ': ' + remarks : ''}`,
      })
      validateRecord(existing, 'demoClasses')
      write(data)
      return projectDemo(existing)
    }

    if (operation === 'cancel') {
      if (existing.status === 'Converted' || existing.status === 'Cancelled') {
        fail('INVALID_TRANSITION', 'This demo inquiry is already closed or cancelled.')
      }
      const { reason = '' } = record || {}
      const prevStatus = existing.status
      const now = new Date().toISOString()
      existing.status = 'Cancelled'
      existing.updatedAt = now
      existing.statusHistory.push({
        id: `hist-${makeId()}`,
        demoId: existing.id,
        fromStatus: prevStatus,
        toStatus: 'Cancelled',
        actorUserId: session.user.id,
        actorName: session.user.name,
        occurredAt: now,
        reason: reason || 'Cancelled demo inquiry',
      })
      validateRecord(existing, 'demoClasses')
      write(data)
      return projectDemo(existing)
    }

    if (operation === 'convert') {
      if (existing.status === 'Converted' || existing.convertedAdmissionId) {
        fail('ALREADY_CONVERTED', 'This demo inquiry has already been converted to an admission.')
      }
      if (existing.status !== 'Attended' && existing.status !== 'Scheduled') {
        fail('INVALID_TRANSITION', 'Only an attended or scheduled demo can be converted to admission.')
      }
      const { dob, notes: addNotes = '', previousSchool = '' } = record || {}
      if (!dob || !validDateOnly(dob)) fail('INVALID_RECORD', 'A valid date of birth (YYYY-MM-DD) is required for admission conversion.')

      const course = data.courses.find(c => c.id === existing.courseId && c.branchId === query.branchId)
      if (!course) fail('INVALID_REFERENCE', 'Course for this demo is no longer available in this branch.')

      if (data.branchCounters[query.branchId].admission === Number.MAX_SAFE_INTEGER) fail('COUNTER_EXHAUSTED', 'Admission counter is exhausted.')
      const admNumber = ++data.branchCounters[query.branchId].admission
      const admDisplayId = formatAdmissionId(admNumber)
      let admId
      try { admId = makeId() } catch { fail('ID_GENERATION_FAILED', 'Admission ID could not be generated.') }
      if (!validText(admId) || collections.some(col => (data[col] || []).some(item => item.id === admId))) {
        admId = `adm-${makeId()}`
      }

      if (data.branchCounters[query.branchId].student === Number.MAX_SAFE_INTEGER) fail('COUNTER_EXHAUSTED', 'Student counter is exhausted.')
      const stNumber = ++data.branchCounters[query.branchId].student
      let stId = existing.studentId
      if (!stId) {
        try { stId = makeId() } catch { fail('ID_GENERATION_FAILED', 'Student ID could not be generated.') }
        if (!validText(stId) || collections.some(col => (data[col] || []).some(item => item.id === stId))) {
          stId = `student-${makeId()}`
        }
      }

      const now = new Date().toISOString()
      const createdAdmission = {
        id: admId,
        branchId: query.branchId,
        admissionNumber: admNumber,
        admissionId: admDisplayId,
        studentName: existing.studentName,
        guardianName: existing.guardianName,
        contact: existing.guardianContact,
        dob,
        course: course.name,
        courseId: course.id,
        preferredBatchId: existing.preferredBatchId || undefined,
        previousSchool: (previousSchool || '').trim(),
        notes: `Converted from Demo Class ${existing.demoId}. ${addNotes || existing.notes || ''}`.trim(),
        status: 'Pending',
        createdAt: now.slice(0, 10),
        studentId: stId,
        createdByAdmissionFlow: true,
      }
      validateRecord(createdAdmission, 'admissions')
      data.admissions.push(createdAdmission)

      if (!existing.studentId || !data.students.some(s => s.id === existing.studentId)) {
        const createdStudent = {
          id: stId,
          branchId: query.branchId,
          name: existing.studentName,
          status: 'Provisional',
          admissionId: admId,
          admissionDisplayId: admDisplayId,
          studentNumber: stNumber,
          dateOfBirth: dob,
          guardianName: existing.guardianName,
          guardianContact: existing.guardianContact,
          createdByAdmissionFlow: true,
        }
        validateRecord(createdStudent, 'students')
        data.students.push(createdStudent)
      } else {
        const student = data.students.find(s => s.id === existing.studentId)
        if (student) {
          student.admissionId = admId
          student.admissionDisplayId = admDisplayId
        }
      }

      // Update demo record
      const prevStatus = existing.status
      existing.status = 'Converted'
      existing.convertedAdmissionId = admId
      existing.convertedAdmissionDisplayId = admDisplayId
      existing.convertedAt = now
      existing.updatedAt = now
      existing.statusHistory.push({
        id: `hist-${makeId()}`,
        demoId: existing.id,
        fromStatus: prevStatus,
        toStatus: 'Converted',
        actorUserId: session.user.id,
        actorName: session.user.name,
        occurredAt: now,
        reason: `Converted to Pending Admission ${admDisplayId}`,
      })
      validateRecord(existing, 'demoClasses')

      normalizeAdmissions(data)
      write(data)

      return {
        demo: projectDemo(existing),
        admission: createdAdmission,
      }
    }

    fail('INVALID_REQUEST', 'Unknown demo class operation.')
  }

  function financialOperation(operation, { id, record, query } = {}) {
    if (!object(query) || Object.keys(query).some(key => key !== 'branchId') || !validBranch(query.branchId)) fail('INVALID_QUERY', 'A concrete known demo branchId is required.')
    const session = readMockSession()
    if (!session?.user || session.branchId !== query.branchId) fail('INVALID_SCOPE', 'Choose your active authorized DEMO branch.')
    const permission = operation === 'createChallan' ? PERMISSIONS.FEES_MANAGE : operation === 'recordPayment' ? PERMISSIONS.FEES_COLLECT : operation === 'createExpense' ? PERMISSIONS.EXPENSES_MANAGE : operation === 'financeOverview' ? PERMISSIONS.FINANCE_VIEW : PERMISSIONS.FEES_VIEW
    if (!canAccess(permission, session.user, query.branchId)) fail('DEMO_ACTION_DENIED', 'This role is not authorized for the requested financial action.')
    const mutating = ['createChallan', 'recordPayment', 'createExpense'].includes(operation)
    const data = read(!mutating)
    const presentChallan = challan => {
      const enrollment = data.enrollments.find(item => item.id === challan.enrollmentId)
      const student = data.students.find(item => item.id === challan.studentId)
      const course = data.courses.find(item => item.id === enrollment?.courseId)
      const batch = data.batches.find(item => item.id === enrollment?.batchId)
      const paidAmount = data.payments.filter(item => item.challanId === challan.id && item.status === 'Verified').reduce((sum, item) => sum + item.amount, 0)
      const balance = challan.amount - paidAmount
      const status = balance <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : challan.dueDate < getLocalDateOnly() ? 'Overdue' : 'Unpaid'
      return { ...challan, studentName: student?.name ?? 'Unresolved student', studentNumber: student?.studentNumber, courseName: course?.name ?? 'Unresolved course', batchName: batch?.name ?? 'Unresolved batch', paidAmount, balance, status }
    }
    const presentPayment = payment => {
      const challan = data.challans.find(item => item.id === payment.challanId)
      const enrollment = data.enrollments.find(item => item.id === challan?.enrollmentId)
      const student = data.students.find(item => item.id === payment.studentId)
      return { ...payment, studentName: student?.name ?? 'Unresolved student', courseName: data.courses.find(item => item.id === enrollment?.courseId)?.name ?? 'Unresolved course', batchName: data.batches.find(item => item.id === enrollment?.batchId)?.name ?? 'Unresolved batch', challanReference: challan?.reference ?? 'Unresolved challan', receiptId: payment.id }
    }
    if (operation === 'overview') return { challans: data.challans.filter(item => item.branchId === query.branchId).map(presentChallan), payments: data.payments.filter(item => item.branchId === query.branchId && item.status === 'Verified').map(presentPayment).sort((a,b) => Date.parse(b.paidAt)-Date.parse(a.paidAt)), enrollments: data.enrollments.filter(item => item.branchId === query.branchId).map(enrollment => { const student = data.students.find(item => item.id === enrollment.studentId); return { ...enrollment, studentName: student?.name, studentNumber: student?.studentNumber, courseName: data.courses.find(item => item.id === enrollment.courseId)?.name, batchName: data.batches.find(item => item.id === enrollment.batchId)?.name } }) }
    if (operation === 'financeOverview') return { payments: data.payments.filter(item => item.branchId === query.branchId && item.status === 'Verified').map(presentPayment).sort((a,b)=>Date.parse(b.paidAt)-Date.parse(a.paidAt)), expenses: data.expenses.filter(item => item.branchId === query.branchId && item.status === 'Posted').sort((a,b)=>Date.parse(b.entryDate)-Date.parse(a.entryDate)) }
    if (operation === 'getReceipt') { const payment = data.payments.find(item => item.id === id && item.branchId === query.branchId && item.status === 'Verified'); if (!payment) fail('NOT_FOUND', 'Receipt was not found.'); return presentPayment(payment) }
    let generatedId
    try { generatedId = makeId() } catch { fail('ID_GENERATION_FAILED', 'Financial record ID could not be generated.') }
    if (collections.some(key => data[key].some(item => item.id === generatedId))) fail('ID_CONFLICT', 'Financial record ID conflicts with saved data.')
    if (operation === 'createChallan') {
      if (!object(record) || !validText(record.enrollmentId) || !validText(record.description) || !Number.isFinite(record.amount) || record.amount <= 0 || !validDateOnly(record.issueDate) || !validDateOnly(record.dueDate) || record.issueDate > record.dueDate) fail('INVALID_RECORD', 'Complete the challan with valid dates and a positive amount.')
      const enrollment = data.enrollments.find(item => item.id === record.enrollmentId && item.branchId === query.branchId && item.status === 'Active')
      if (!enrollment) fail('INVALID_REFERENCE', 'Choose an active enrollment in this branch.')
      if (data.challans.some(item => item.enrollmentId === enrollment.id)) fail('DUPLICATE_CHALLAN', 'An official challan already exists for this enrollment.')
      if (Number.isFinite(enrollment.configuredFee) && record.amount !== enrollment.configuredFee) fail('FEE_MISMATCH', 'Challan amount must match the confirmed configured admission fee.')
      const number = ++data.financialCounters[query.branchId].challan
      const challan = { id: generatedId, branchId: query.branchId, enrollmentId: enrollment.id, studentId: enrollment.studentId, description: record.description.trim(), amount: record.amount, issueDate: record.issueDate, dueDate: record.dueDate, number, reference: `CH-${number}`, createdAt: new Date().toISOString() }
      validateRecord(challan, 'challans'); data.challans.push(challan); write(data); return presentChallan(challan)
    }
    if (operation === 'recordPayment') {
      if (!object(record) || !validText(record.challanId) || !Number.isFinite(record.amount) || record.amount <= 0 || !['Cash', 'Bank Transfer', 'Mobile Wallet'].includes(record.method)) fail('INVALID_RECORD', 'Choose a challan, valid method and positive amount.')
      const challan = data.challans.find(item => item.id === record.challanId && item.branchId === query.branchId)
      if (!challan) fail('INVALID_REFERENCE', 'Choose a challan in this branch.')
      const paid = data.payments.filter(item => item.challanId === challan.id && item.status === 'Verified').reduce((sum,item)=>sum+item.amount,0)
      if (record.amount > challan.amount - paid) fail('OVERPAYMENT', 'Payment cannot exceed the outstanding challan balance.')
      const number = ++data.financialCounters[query.branchId].receipt
      const payment = { id: generatedId, branchId: query.branchId, challanId: challan.id, studentId: challan.studentId, amount: record.amount, method: record.method, status: 'Verified', number, receiptReference: `RCPT-${number}`, paidAt: new Date().toISOString(), actorUserId: session.user.id }
      validateRecord(payment, 'payments'); data.payments.push(payment); write(data); return presentPayment(payment)
    }
    if (operation === 'createExpense') {
      if (!object(record) || !Number.isFinite(record.amount) || record.amount <= 0 || !validText(record.category) || !validText(record.description) || !validText(record.method) || !validDateOnly(record.entryDate)) fail('INVALID_RECORD', 'Complete the expense with a positive amount and valid details.')
      const expense = { id: generatedId, branchId: query.branchId, amount: record.amount, category: record.category.trim(), description: record.description.trim(), method: record.method.trim(), entryDate: record.entryDate, status: 'Posted', createdAt: new Date().toISOString(), actorUserId: session.user.id }
      validateRecord(expense, 'expenses'); data.expenses.push(expense); write(data); return expense
    }
    fail('INVALID_REQUEST', 'Unknown financial operation.')
  }
  return { run, runTransaction, createAdmission, updateAdmission, deleteAdmission, getAdmission, changeAdmissionStatus, enrollStudent, updateEnrollmentFeeStatus, studentOperation, academicOperation, classScheduleOperation, financialOperation, demoClassOperation }
}
