import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService.js'
import { demoClassService } from './demoClassService.js'
import { classScheduleService } from './classScheduleService.js'
import { admissionService } from './admissionService.js'
import { createMockDatabase } from '../mock/mockDatabase.js'
import { MOCK_DATABASE_KEY } from '../constants/storageKeys.js'

const central = { branchId: 'demo-central' }
const north = { branchId: 'demo-north' }

const sampleRegistration = {
  studentName: 'Zubair Tariq',
  guardianName: 'Tariq Mehmood',
  guardianContact: '03001234567',
  courseId: 'course-demo-2',
  preferredBatchId: 'batch-demo-course-demo-2',
  requestedDate: '2026-10-25',
  requestedTime: '11:00',
  notes: 'Weekend inquiry',
}

const signIn = async (userId, branchId) => {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('F08 Demo Classes Module — Service & Workflow Tests', () => {
  beforeEach(async () => {
    localStorage.clear()
    await signIn('demo-admin', central.branchId)
  })

  // 1. F08-001: Registration & Validation
  describe('F08-001: Registration and Validation', () => {
    it('registers a prospective student demo inquiry with valid branch data', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      expect(demo).toMatchObject({
        studentName: 'Zubair Tariq',
        guardianName: 'Tariq Mehmood',
        guardianContact: '03001234567',
        courseId: 'course-demo-2',
        status: 'Registered',
        scheduledSession: null,
        attendance: null,
        convertedAdmissionId: null,
      })
      expect(demo.id).toBeDefined()
      expect(demo.demoId).toMatch(/^DEMO-\d{4}$/)
      expect(demo.statusHistory).toHaveLength(1)
      expect(demo.statusHistory[0].toStatus).toBe('Registered')
    })

    it('rejects registration with missing required fields or invalid contacts', async () => {
      await expect(demoClassService.register({ ...sampleRegistration, studentName: '' }, central))
        .rejects.toMatchObject({ code: 'INVALID_RECORD' })
      await expect(demoClassService.register({ ...sampleRegistration, guardianName: '' }, central))
        .rejects.toMatchObject({ code: 'INVALID_RECORD' })
      await expect(demoClassService.register({ ...sampleRegistration, guardianContact: 'abc' }, central))
        .rejects.toMatchObject({ code: 'INVALID_RECORD' })
      await expect(demoClassService.register({ ...sampleRegistration, requestedDate: 'invalid-date' }, central))
        .rejects.toMatchObject({ code: 'INVALID_RECORD' })
    })

    it('rejects courses and batches not belonging to the active branch', async () => {
      // course-demo-1 belongs to demo-north, not demo-central
      await expect(demoClassService.register({ ...sampleRegistration, courseId: 'course-demo-1' }, central))
        .rejects.toMatchObject({ code: 'INVALID_REFERENCE' })
      await expect(demoClassService.register({ ...sampleRegistration, preferredBatchId: 'batch-demo-course-demo-1' }, central))
        .rejects.toMatchObject({ code: 'INVALID_REFERENCE' })
    })

    it('prevents duplicate inquiry submission with identical details and date', async () => {
      await demoClassService.register(sampleRegistration, central)
      await expect(demoClassService.register(sampleRegistration, central))
        .rejects.toMatchObject({ code: 'DUPLICATE_REGISTRATION' })
    })
  })

  // 2. F08-002: Branch Isolation & Listing
  describe('F08-002: Branch Isolation and Listing', () => {
    it('strictly isolates demo registries between branches', async () => {
      const centralDemo = await demoClassService.register(sampleRegistration, central)

      await signIn('demo-admin', north.branchId)
      const northDemo = await demoClassService.register({
        studentName: 'North Applicant',
        guardianName: 'North Guardian',
        guardianContact: '03119876543',
        courseId: 'course-demo-1',
        requestedDate: '2026-10-26',
      }, north)

      const northList = await demoClassService.list(north)
      expect(northList.some(d => d.id === northDemo.id)).toBe(true)
      expect(northList.some(d => d.id === centralDemo.id)).toBe(false)

      await signIn('demo-admin', central.branchId)
      const centralList = await demoClassService.list(central)
      expect(centralList.some(d => d.id === centralDemo.id)).toBe(true)
      expect(centralList.some(d => d.id === northDemo.id)).toBe(false)
    })
  })

  // 3. F08-003: Scheduling & Conflict Detection
  describe('F08-003: Scheduling and Conflict Detection', () => {
    it('schedules a trial session and updates status to Scheduled', async () => {
      const registered = await demoClassService.register(sampleRegistration, central)
      const scheduled = await demoClassService.schedule(registered.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      expect(scheduled.status).toBe('Scheduled')
      expect(scheduled.scheduledSession).toMatchObject({
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        teacherName: 'Demo Teacher',
        location: 'Lab 1',
      })
      expect(scheduled.statusHistory.slice(-1)[0].toStatus).toBe('Scheduled')
    })

    it('rejects invalid time ranges (startTime >= endTime)', async () => {
      const registered = await demoClassService.register(sampleRegistration, central)
      await expect(demoClassService.schedule(registered.id, {
        classDate: '2026-10-27',
        startTime: '11:00',
        endTime: '10:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)).rejects.toMatchObject({ code: 'INVALID_RECORD' })
    })

    it('detects schedule conflicts with overlapping demo classes (same teacher)', async () => {
      const demoA = await demoClassService.register(sampleRegistration, central)
      const demoB = await demoClassService.register({
        ...sampleRegistration,
        studentName: 'Second Student',
        guardianContact: '03210001122',
      }, central)

      await demoClassService.schedule(demoA.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      // Overlapping time for same teacher in different room
      await expect(demoClassService.schedule(demoB.id, {
        classDate: '2026-10-27',
        startTime: '10:30',
        endTime: '11:30',
        teacherId: 'demo-teacher',
        location: 'Room 202',
      }, central)).rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' })
    })

    it('detects schedule conflicts with overlapping demo classes (same room/location)', async () => {
      const demoA = await demoClassService.register(sampleRegistration, central)
      const demoB = await demoClassService.register({
        ...sampleRegistration,
        studentName: 'Second Student',
        guardianContact: '03210001122',
      }, central)

      await demoClassService.schedule(demoA.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      // Same room at overlapping time
      await expect(demoClassService.schedule(demoB.id, {
        classDate: '2026-10-27',
        startTime: '10:15',
        endTime: '11:15',
        teacherId: 'demo-teacher',
        location: 'lab 1', // case-insensitive check
      }, central)).rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' })
    })

    it('detects schedule conflicts against regular scheduled classes', async () => {
      // Create a regular class first
      await classScheduleService.create({
        subject: 'Regular Physics',
        batchId: 'batch-demo-course-demo-2',
        teacherId: 'demo-teacher',
        classDate: '2026-10-28',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Physics Lab',
      }, central)

      const demo = await demoClassService.register(sampleRegistration, central)

      // Attempt demo with same teacher at overlapping time
      await expect(demoClassService.schedule(demo.id, {
        classDate: '2026-10-28',
        startTime: '14:30',
        endTime: '15:15',
        teacherId: 'demo-teacher',
        location: 'Different Room',
      }, central)).rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' })

      // Attempt demo in same location at overlapping time
      await expect(demoClassService.schedule(demo.id, {
        classDate: '2026-10-28',
        startTime: '14:30',
        endTime: '15:15',
        teacherId: 'demo-teacher',
        location: 'physics lab',
      }, central)).rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' })
    })
  })

  // 4. F08-004: Attendance
  describe('F08-004: Attendance Tracking', () => {
    it('marks attendance as Present (Attended) and records audit trail', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      const attended = await demoClassService.recordAttendance(demo.id, {
        status: 'Present',
        remarks: 'Student was very proactive and attentive',
      }, central)

      expect(attended.status).toBe('Attended')
      expect(attended.attendance).toMatchObject({
        status: 'Present',
        remarks: 'Student was very proactive and attentive',
        markedByUserId: 'demo-admin',
      })
      expect(attended.attendance.markedAt).toBeDefined()
    })

    it('marks attendance as Absent (Missed)', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      const missed = await demoClassService.recordAttendance(demo.id, {
        status: 'Absent',
        remarks: 'Student did not attend',
      }, central)

      expect(missed.status).toBe('Missed')
      expect(missed.attendance.status).toBe('Absent')
    })

    it('rejects attendance marking on unscheduled demo inquiry', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await expect(demoClassService.recordAttendance(demo.id, { status: 'Present' }, central))
        .rejects.toMatchObject({ code: 'INVALID_TRANSITION' })
    })

    it('resets attendance status when session is rescheduled', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      await demoClassService.recordAttendance(demo.id, { status: 'Absent' }, central)

      // Reschedule session
      const rescheduled = await demoClassService.schedule(demo.id, {
        classDate: '2026-10-29',
        startTime: '12:00',
        endTime: '13:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)

      expect(rescheduled.status).toBe('Scheduled')
      expect(rescheduled.attendance).toBeNull()
    })
  })

  // 5. F08-005: Status Transitions
  describe('F08-005: Status Tracking and Auditable Transitions', () => {
    it('cancels an inquiry with documented reason', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      const cancelled = await demoClassService.cancel(demo.id, { reason: 'Student moved away' }, central)

      expect(cancelled.status).toBe('Cancelled')
      expect(cancelled.statusHistory.slice(-1)[0]).toMatchObject({
        fromStatus: 'Registered',
        toStatus: 'Cancelled',
        reason: 'Student moved away',
      })
    })

    it('prevents modifications or scheduling on cancelled inquiries', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.cancel(demo.id, { reason: 'Cancelled' }, central)

      await expect(demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)).rejects.toMatchObject({ code: 'INVALID_TRANSITION' })

      await expect(demoClassService.update(demo.id, { studentName: 'New Name' }, central))
        .rejects.toMatchObject({ code: 'INVALID_TRANSITION' })
    })
  })

  // 6. F08-006: Demo to Admission Conversion
  describe('F08-006: Demo to Admission Conversion', () => {
    it('safely converts Attended demo to Pending Admission and Provisional Student', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)
      await demoClassService.recordAttendance(demo.id, { status: 'Present' }, central)

      const result = await demoClassService.convertToAdmission(demo.id, {
        dob: '2010-06-15',
        notes: 'Parent approved admission process',
      }, central)

      expect(result.demo.status).toBe('Converted')
      expect(result.demo.convertedAdmissionId).toBeDefined()
      expect(result.demo.convertedAdmissionDisplayId).toMatch(/^ADM-\d+$/)

      // Verify the created Admission
      const createdAdmission = result.admission
      expect(createdAdmission.status).toBe('Pending') // Must be Pending, NOT Approved!
      expect(createdAdmission.studentName).toBe('Zubair Tariq')
      expect(createdAdmission.guardianName).toBe('Tariq Mehmood')
      expect(createdAdmission.contact).toBe('03001234567')
      expect(createdAdmission.dob).toBe('2010-06-15')
      expect(createdAdmission.courseId).toBe('course-demo-2')
      expect(createdAdmission.preferredBatchId).toBe('batch-demo-course-demo-2')
      expect(createdAdmission.studentId).toBeDefined()

      // Verify admission exists in real admissionService
      const fetchedAdmission = await admissionService.getById(createdAdmission.id, central)
      expect(fetchedAdmission.id).toBe(createdAdmission.id)
      expect(fetchedAdmission.status).toBe('Pending')
    })

    it('requires valid date of birth for admission conversion', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)
      await demoClassService.recordAttendance(demo.id, { status: 'Present' }, central)

      await expect(demoClassService.convertToAdmission(demo.id, {}, central))
        .rejects.toMatchObject({ code: 'INVALID_RECORD' })
      await expect(demoClassService.convertToAdmission(demo.id, { dob: 'invalid' }, central))
        .rejects.toMatchObject({ code: 'INVALID_RECORD' })
    })

    it('prevents duplicate conversion of an already converted demo', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      await demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)
      await demoClassService.recordAttendance(demo.id, { status: 'Present' }, central)

      await demoClassService.convertToAdmission(demo.id, { dob: '2010-06-15' }, central)

      // Duplicate conversion attempt
      await expect(demoClassService.convertToAdmission(demo.id, { dob: '2010-06-15' }, central))
        .rejects.toMatchObject({ code: 'ALREADY_CONVERTED' })
    })
  })

  // 7. Role-Based Permissions
  describe('F08 Permissions Matrix Enforcement', () => {
    it('allows Super Admin full access to all operations', async () => {
      await signIn('demo-admin', central.branchId)
      const demo = await demoClassService.register(sampleRegistration, central)
      expect(demo.id).toBeDefined()
      const list = await demoClassService.list(central)
      expect(list.length).toBeGreaterThan(0)
    })

    it('allows Receptionist full access to all demo operations', async () => {
      await signIn('demo-reception', north.branchId)
      const demo = await demoClassService.register({
        ...sampleRegistration,
        courseId: 'course-demo-1',
        preferredBatchId: 'batch-demo-course-demo-1',
      }, north)
      expect(demo.id).toBeDefined()

      const scheduled = await demoClassService.schedule(demo.id, {
        classDate: '2026-10-28',
        startTime: '09:00',
        endTime: '10:00',
        teacherId: 'demo-multi', // teacher in demo-north
        location: 'Room 1',
      }, north)
      expect(scheduled.status).toBe('Scheduled')
    })

    it('allows Owner view-only access and rejects any mutations', async () => {
      // Create record as admin first
      await signIn('demo-admin', central.branchId)
      const demo = await demoClassService.register(sampleRegistration, central)

      // Switch to Owner
      await signIn('demo-owner', central.branchId)
      const list = await demoClassService.list(central)
      expect(list.length).toBeGreaterThan(0)
      const details = await demoClassService.getById(demo.id, central)
      expect(details.id).toBe(demo.id)

      // Owner write attempts must fail
      await expect(demoClassService.register(sampleRegistration, central))
        .rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
      await expect(demoClassService.schedule(demo.id, {
        classDate: '2026-10-27',
        startTime: '10:00',
        endTime: '11:00',
        teacherId: 'demo-teacher',
        location: 'Lab 1',
      }, central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
      await expect(demoClassService.recordAttendance(demo.id, { status: 'Present' }, central))
        .rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
      await expect(demoClassService.cancel(demo.id, {}, central))
        .rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
      await expect(demoClassService.convertToAdmission(demo.id, { dob: '2010-01-01' }, central))
        .rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    })

    it('denies Teacher access to Demo Classes completely', async () => {
      await signIn('demo-teacher', central.branchId)
      await expect(demoClassService.list(central))
        .rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
      await expect(demoClassService.register(sampleRegistration, central))
        .rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    })
  })

  // 8. Persistence & Migration
  describe('Persistence and Additive Version Migration', () => {
    it('persists changes to localStorage across new database instances', async () => {
      const demo = await demoClassService.register(sampleRegistration, central)
      const rawBefore = localStorage.getItem(MOCK_DATABASE_KEY)
      expect(rawBefore).toContain(demo.id)

      // Construct a new clean adapter instance and read
      const freshDb = createMockDatabase()
      const freshList = freshDb.demoClassOperation('list', { query: central })
      expect(freshList.some(d => d.id === demo.id)).toBe(true)
    })

    it('migrates older version 6 envelope seamlessly to version 7 without losing data', () => {
      const legacyData = {
        version: 6,
        students: [{ id: 'st-legacy', branchId: 'demo-central', name: 'Legacy Student' }],
        courses: [{ id: 'cr-legacy', branchId: 'demo-central', name: 'Legacy Course' }],
        admissions: [],
        batches: [],
        enrollments: [],
        classes: [],
        challans: [],
        payments: [],
        expenses: [],
        financialCounters: { 'demo-central': { challan: 0, receipt: 0 }, 'demo-north': { challan: 0, receipt: 0 } },
        branchCounters: {
          'demo-central': { admission: 1, student: 1 },
          'demo-north': { admission: 0, student: 0 },
        },
      }
      localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(legacyData))

      const db = createMockDatabase()
      const list = db.demoClassOperation('list', { query: central })
      expect(Array.isArray(list)).toBe(true)

      const saved = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
      expect(saved.version).toBe(7)
      expect(saved.students[0].name).toBe('Legacy Student')
    })
  })
})