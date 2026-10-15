/**
 * Purpose: Will define faculty Service for the services area of the Academy frontend.
 * Module: services
 * Status: Implemented — branch-scoped Faculty & Classes read operations.
 */

import { PERMISSIONS, canAccess } from '../constants/permissions.js'
import { ROLES, getBranchRoles } from '../constants/roles.js'
import { DEMO_USERS } from '../mock/authFixtures.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { authService } from './authService.js'
import { batchService } from './batchService.js'
import { courseService } from './courseService.js'
import { studentService } from './studentService.js'

async function inScope(operation, query, permission = PERMISSIONS.FACULTY_VIEW) {
  const started = await authService.getSession()
  const validate = async () => {
    const current = await authService.getSession()
    if (!started?.user || current?.user?.id !== started.user.id || !current?.branchId || current.branchId !== query?.branchId) {
      throw new MockDataError('INVALID_SCOPE', 'Your active DEMO session or branch changed. Reload Faculty & Classes.')
    }
    if (!canAccess(permission, current.user, current.branchId)) {
      throw new MockDataError('DEMO_ACTION_DENIED', 'This DEMO role is not authorized to view Faculty & Classes.')
    }
  }
  await validate()
  const result = await operation(started.branchId)
  await validate()
  return result
}

async function listTeachers(query) {
  return inScope(async branchId => DEMO_USERS
    .filter(user => {
      const roles = getBranchRoles(user, branchId)
      return roles.length === 1 && roles[0] === ROLES.TEACHER
    })
    .map(user => ({
      id: user.id,
      branchId,
      name: user.name,
      accountStatus: user.enabled ? 'Enabled' : 'Disabled',
      assignedSubjects: [],
      assignedBatches: [],
    })), query)
}

export const facultyService = {
  list: listTeachers,
  async getById(id, query) {
    if (typeof id !== 'string' || !id.trim()) throw new MockDataError('INVALID_REQUEST', 'A valid teacher ID is required.')
    return inScope(async branchId => {
      const teacher = DEMO_USERS.find(user => {
        const roles = getBranchRoles(user, branchId)
        return user.id === id && roles.length === 1 && roles[0] === ROLES.TEACHER
      })
      if (!teacher) throw new MockDataError('NOT_FOUND', 'Faculty record was not found in the selected branch.')
      return { id: teacher.id, branchId, name: teacher.name, accountStatus: teacher.enabled ? 'Enabled' : 'Disabled', contact: null, qualifications: null, professionalDetails: null, assignedSubjects: [], assignedBatches: [], schedules: [] }
    }, query)
  },
  async listSubjectAssignments(query) {
    return inScope(async () => ({ available: false, assignments: [] }), query)
  },
  async listBatchAssignments(query) {
    return inScope(async branchId => {
      const [batches, courses] = await Promise.all([batchService.list({ branchId }), courseService.list({ branchId })])
      const courseById = new Map(courses.map(course => [course.id, course]))
      return batches.map(batch => ({
        ...batch,
        courseName: courseById.get(batch.courseId)?.name ?? 'Unresolved course',
        teacherAssignments: [],
      }))
    }, query)
  },
  async listClassStudents(batchId, query) {
    if (typeof batchId !== 'string' || !batchId.trim()) throw new MockDataError('INVALID_REQUEST', 'Choose a saved batch.')
    return inScope(async branchId => {
      const batch = await batchService.getById(batchId, { branchId })
      const students = await studentService.listDirectory({ branchId })
      return students.flatMap(student => (student.enrollments ?? [])
        .filter(enrollment => enrollment.status === 'Active' && enrollment.branchId === branchId && enrollment.batchId === batch.id)
        .map(enrollment => ({
          id: student.id,
          enrollmentId: enrollment.id,
          name: student.name,
          status: student.status ?? 'Active',
          admissionReference: student.admission?.displayAdmissionId ?? student.admissionDisplaySerialId ?? student.admissionDisplayId ?? null,
          branchId,
          batchId: batch.id,
        })))
        .sort((a, b) => a.name.localeCompare(b.name))
    }, query, PERMISSIONS.CLASSES_VIEW)
  },
}
