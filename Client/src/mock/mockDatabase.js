/**
 * Purpose: Will define mock Database for the mock area of the Academy frontend.
 * Module: mock
 * Status: Planned — functionality not implemented.
 */

import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'
import { DEMO_BRANCHES } from './authFixtures.js'
import { createSeedDatabase, createBatchSeeds } from './seedData.js'
import { admissionNumberFromId, formatAdmissionId } from '../lib/admissionIds.js'
import { createDisplayProjector } from './displaySerials.js'
import { readMockSession } from './mockAuth.js'
import { canCreateAdmissions, canDecideAdmission, canDeleteAdmission, canEditAdmissions, canViewAdmissions } from '../lib/admissionPolicy.js'
import { canAccess, PERMISSIONS } from '../constants/permissions.js'

export class MockDataError extends Error {
  constructor(code, message) { super(message); this.name = 'MockDataError'; this.code = code }
}
const fail = (code, message) => { throw new MockDataError(code, message) }
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const validText = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 200
const validDateOnly = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
const validContact = (value) => typeof value === 'string' && /^\+?[0-9\s().-]{3,30}$/.test(value.trim()) && value.length <= 200
const validBranch = (value) => DEMO_BRANCHES.some((branch) => branch.id === value)
const collections = ['students', 'courses', 'admissions', 'batches', 'enrollments']

function validateRecord(record, collection) {
  if (!object(record) || !validText(record.id) || !validBranch(record.branchId)) {
    fail('INVALID_RECORD', 'Expected a provisional record with id, authorized demo branchId.')
  }
  if (collection === 'admissions') {
    const validKeys = ['id', 'branchId', 'studentName', 'guardianName', 'contact', 'dob', 'course', 'courseId', 'preferredBatchId', 'statusHistory', 'status', 'createdAt', 'previousSchool', 'notes', 'admissionId', 'admissionNumber', 'studentId', 'createdByAdmissionFlow']
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
    const keys = ['id', 'branchId', 'admissionId', 'studentId', 'courseId', 'batchId', 'status', 'enrolledAt']
    if (Object.keys(record).some(key => !keys.includes(key)) || !['admissionId', 'studentId', 'courseId', 'batchId', 'enrolledAt'].every(key => validText(record[key])) || record.status !== 'Active' || !Number.isFinite(Date.parse(record.enrolledAt))) fail('INVALID_RECORD', 'Invalid enrollment record.')
  } else if (collection === 'batches') {
    if (Object.keys(record).some(key => !['id', 'branchId', 'courseId', 'name'].includes(key)) || !validText(record.name) || !validText(record.courseId)) fail('INVALID_RECORD', 'Invalid provisional batch record.')
  } else {
    if (Object.keys(record).some((key) => !['id', 'branchId', 'name'].includes(key)) || !validText(record.name)) {
      fail('INVALID_RECORD', 'Expected a provisional record with id, authorized demo branchId and name.')
    }
  }
}

// No reset/migration on errors: saved data remains untouched for explicit recovery.
export function createMockDatabase({ storage = () => window.localStorage, makeId = () => crypto.randomUUID() } = {}) {
  function validateDatabase(data) {
    if (Object.keys(data).some((key) => !['version', ...collections, 'admissionCounter', 'branchCounters'].includes(key))) fail('CORRUPTED_STORAGE', 'Saved mock data envelope is invalid.')
    for (const collection of collections) {
      if (!Array.isArray(data[collection])) fail('CORRUPTED_STORAGE', 'Saved mock collection is invalid.')
      const ids = new Set()
      for (const record of data[collection]) {
        validateRecord(record, collection)
        if (ids.has(record.id)) fail('INVALID_RECORD', 'Saved mock record IDs must be unique within a collection.')
        ids.add(record.id)
      }
    }
    for (const batch of data.batches) {
      if (['students', 'courses', 'admissions'].some(collection => data[collection].some(record => record.id === batch.id))) fail('ID_CONFLICT', 'Batch seed ID conflicts with saved data; data was preserved.')
      const course = data.courses.find(record => record.id === batch.courseId)
      if (course && course.branchId !== batch.branchId) fail('INVALID_REFERENCE', 'Saved batch and course branches do not match.')
    }
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
        counter = { admission: data.admissionCounter ?? 0, student: 0 }
      }
      if (!object(counter) || Object.keys(counter).some((key) => !['admission', 'student'].includes(key)) || !['admission', 'student'].every((key) => Number.isSafeInteger(counter[key]) && counter[key] >= 0)) fail('CORRUPTED_STORAGE', 'Invalid durable branch counter.')
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
      const initial = normalizeAdmissions(createSeedDatabase())
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
    if (data.version !== 4) fail('UNSUPPORTED_VERSION', 'Saved mock data version is unsupported; data was preserved.')
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
      result = operation === 'create'
        ? { id: generatedId, branchId: query.branchId, studentName: studentName.trim(), guardianName: guardianName.trim(), contact: contact.trim(), dob: dob.trim(), course: course.trim(), previousSchool: previousSchool.trim(), notes: notes.trim(), status: 'Pending', createdAt: new Date().toISOString().split('T')[0] }
        : { ...data[collection][index], studentName: studentName.trim(), guardianName: guardianName.trim(), contact: contact.trim(), dob: dob.trim(), course: course.trim(), previousSchool: previousSchool.trim(), notes: notes.trim() }
      for (const key of ['courseId', 'preferredBatchId']) if (record[key] !== undefined) result[key] = record[key]
      const previous = operation === 'update' ? data[collection][index] : null
      const referencesChanged = !previous || result.courseId !== previous.courseId || result.preferredBatchId !== previous.preferredBatchId || result.course !== previous.course
      if (result.courseId != null) {
        const courseRecord = data.courses.find(item => item.id === result.courseId && item.branchId === query.branchId)
        const batchRecord = result.preferredBatchId == null ? null : data.batches.find(item => item.id === result.preferredBatchId && item.branchId === query.branchId && item.courseId === result.courseId)
        // Unchanged unresolved references may survive unrelated legacy edits.
        if (referencesChanged && (!courseRecord || (result.preferredBatchId != null && !batchRecord))) fail('INVALID_REFERENCE', 'Choose a saved course and matching batch in the active branch.')
        if (courseRecord) result.course = courseRecord.name
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
        if (Object.keys(record).some((key) => !['studentName', 'guardianName', 'contact', 'dob', 'course', 'courseId', 'preferredBatchId', 'previousSchool', 'notes'].includes(key))) fail('INVALID_RECORD', 'Only approved admission input fields are accepted.')
        for (const key of ['courseId', 'preferredBatchId']) if (record[key] != null && !validText(record[key])) fail('INVALID_RECORD', 'Invalid course or batch reference.')
        if (!validText(record.studentName) || !validText(record.guardianName) || !validText(record.contact) || !validText(record.dob) || !validText(record.course)) fail('INVALID_RECORD', 'Admission requires specific fields.')
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

  function projectStudent(data, student, project = createDisplayProjector(data)) {
    const admission = data.admissions.find(item => item.id === student.admissionId && item.studentId === student.id && item.branchId === student.branchId)
    const enrollments = data.enrollments.filter(item => item.studentId === student.id && item.branchId === student.branchId)
      .map(enrollment => ({
        ...enrollment,
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
    if (data.enrollments.some(item => item.admissionId === id)) fail('ENROLLED_RECORD_PROTECTED', 'An enrolled admission cannot be deleted.')
    const student = linkedProvisional(data, admission)
    const displayed = createDisplayProjector(data)('admissions', admission)
    data.admissions = data.admissions.filter((item) => item.id !== admission.id)
    if (student) data.students = data.students.filter((item) => item.id !== student.id)
    normalizeAdmissions(data)
    write(data)
    return { id: admission.id, admissionId: admission.admissionId, displaySerial: displayed.displaySerial, displayAdmissionId: displayed.displayAdmissionId, deletedStudentId: student?.id ?? null }
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
    const enrollment = { id: enrollmentId, branchId: query.branchId, admissionId: admission.id, studentId: student.id, courseId: course.id, batchId: batch.id, status: 'Active', enrolledAt: new Date().toISOString() }
    student.status = 'Active'
    data.enrollments.push(enrollment)
    normalizeAdmissions(data)
    write(data)
    const project = createDisplayProjector(data)
    return { enrollment, admission: project('admissions', admission), student: project('students', student) }
  }
  return { run, runTransaction, createAdmission, updateAdmission, deleteAdmission, getAdmission, changeAdmissionStatus, enrollStudent, studentOperation }
}
