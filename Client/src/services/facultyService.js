/**
 * Purpose: Will define faculty Service for the services area of the Academy frontend.
 * Module: services
 * Status: Implemented — branch-scoped Faculty & Classes read operations.
 */

import { PERMISSIONS, canAccess } from '../constants/permissions.js'
import { ROLES, getBranchRoles } from '../constants/roles.js'
import { getDemoUsers } from '../mock/authFixtures.js'
import { readOrganization, writeOrganization } from '../mock/mockOrganization.js'
import { MockDataError } from '../mock/mockDatabase.js'
import { mockApi } from '../mock/mockApi.js'
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
  return inScope(async branchId => {
    let assignments = []
    try {
      assignments = await mockApi.facultyAssignmentOperation('list', { query: { branchId } })
    } catch {
      assignments = []
    }
    const [batches, students] = await Promise.all([
      batchService.list({ branchId }).catch(() => []),
      studentService.listDirectory({ branchId }).catch(() => []),
    ])
    const batchMap = new Map(batches.map(b => [b.id, b]))

    return getDemoUsers()
      .filter(user => {
        const roles = getBranchRoles(user, branchId)
        return roles.length === 1 && roles[0] === ROLES.TEACHER
      })
      .map(user => {
        const teacherAssignments = assignments.filter(a => a.teacherId === user.id)

        const subjectIds = new Set()
        const assignedSubjects = []
        teacherAssignments.forEach(a => {
          if (!subjectIds.has(a.subjectId)) {
            subjectIds.add(a.subjectId)
            assignedSubjects.push({ id: a.subjectId, name: a.subjectName })
          }
        })

        const batchIds = new Set()
        const assignedBatches = []
        teacherAssignments.forEach(a => {
          if (!batchIds.has(a.batchId)) {
            batchIds.add(a.batchId)
            const b = batchMap.get(a.batchId)
            assignedBatches.push({
              id: a.batchId,
              name: a.batchName,
              courseId: a.courseId,
              courseName: a.courseName,
              enrolledCount: b?.enrolledCount ?? 0,
            })
          }
        })

        let weeklyMinutes = 0
        teacherAssignments.forEach(a => {
          const [sh, sm] = (a.startTime || '00:00').split(':').map(Number)
          const [eh, em] = (a.endTime || '00:00').split(':').map(Number)
          const duration = (eh * 60 + em) - (sh * 60 + sm)
          const daysCount = Array.isArray(a.days) ? a.days.length : 1
          weeklyMinutes += (duration * daysCount)
        })
        const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10

        const teacherBatchIds = new Set(teacherAssignments.map(a => a.batchId))
        const reachedStudentIds = new Set()
        students.forEach(s => {
          (s.enrollments ?? []).forEach(e => {
            if (e.status === 'Active' && teacherBatchIds.has(e.batchId)) {
              reachedStudentIds.add(s.id)
            }
          })
        })
        const studentReach = reachedStudentIds.size

        return {
          id: user.id,
          branchId,
          name: user.name,
          accountStatus: user.enabled ? 'Enabled' : 'Disabled',
          contact: user.contact || null,
          qualifications: user.qualifications || null,
          specialization: user.specialization || null,
          department: user.department || null,
          assignedSubjects,
          assignedBatches,
          batchCount: assignedBatches.length,
          weeklyHours,
          studentReach,
          assignments: teacherAssignments.map(a=>({...a,enrolledCount:batchMap.get(a.batchId)?.enrolledCount??0})),
          studentIds:[...reachedStudentIds],
        }
      })
  }, query)
}

export const facultyService = {
  list: listTeachers,
  async getById(id, query) {
    if (typeof id !== 'string' || !id.trim()) throw new MockDataError('INVALID_REQUEST', 'A valid teacher ID is required.')
    return inScope(async branchId => {
      const teacher = getDemoUsers().find(user => {
        const roles = getBranchRoles(user, branchId)
        return user.id === id && roles.length === 1 && roles[0] === ROLES.TEACHER
      })
      if (!teacher) throw new MockDataError('NOT_FOUND', 'Faculty record was not found in the selected branch.')

      let assignments
      try {
        assignments = await mockApi.facultyAssignmentOperation('list', { query: { branchId } })
      } catch {
        assignments = []
      }
      const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id)

      const [batches, students] = await Promise.all([
        batchService.list({ branchId }).catch(() => []),
        studentService.listDirectory({ branchId }).catch(() => []),
      ])
      const batchMap = new Map(batches.map(b => [b.id, b]))

      const subjectIds = new Set()
      const assignedSubjects = []
      teacherAssignments.forEach(a => {
        if (!subjectIds.has(a.subjectId)) {
          subjectIds.add(a.subjectId)
          assignedSubjects.push({ id: a.subjectId, name: a.subjectName })
        }
      })

      const batchIds = new Set()
      const assignedBatches = []
      teacherAssignments.forEach(a => {
        if (!batchIds.has(a.batchId)) {
          batchIds.add(a.batchId)
          const b = batchMap.get(a.batchId)
          assignedBatches.push({
            id: a.batchId,
            name: a.batchName,
            courseId: a.courseId,
            courseName: a.courseName,
            enrolledCount: b?.enrolledCount ?? 0,
          })
        }
      })

      let weeklyMinutes = 0
      teacherAssignments.forEach(a => {
        const [sh, sm] = (a.startTime || '00:00').split(':').map(Number)
        const [eh, em] = (a.endTime || '00:00').split(':').map(Number)
        const duration = (eh * 60 + em) - (sh * 60 + sm)
        const daysCount = Array.isArray(a.days) ? a.days.length : 1
        weeklyMinutes += (duration * daysCount)
      })
      const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10

      const teacherBatchIds = new Set(teacherAssignments.map(a => a.batchId))
      const reachedStudentIds = new Set()
      students.forEach(s => {
        (s.enrollments ?? []).forEach(e => {
          if (e.status === 'Active' && teacherBatchIds.has(e.batchId)) {
            reachedStudentIds.add(s.id)
          }
        })
      })
      const studentReach = reachedStudentIds.size

      return {
        id: teacher.id,
        branchId,
        name: teacher.name,
        accountStatus: teacher.enabled ? 'Enabled' : 'Disabled',
        contact: teacher.contact || null,
        qualifications: teacher.qualifications || null,
        professionalDetails: teacher.professionalDetails || null,
        specialization: teacher.specialization || null,
        department: teacher.department || null,
        assignedSubjects,
        assignedBatches,
        schedules: teacherAssignments,
        stats: {
          totalBatches: assignedBatches.length,
          weeklyHours,
          studentReach,
          status: teacher.enabled ? 'Active' : 'Disabled',
        },
      }
    }, query)
  },
  async createTeacher(data, query) {
    return inScope(async branchId => {
      const org = readOrganization()
      const teacherId = `teacher-${Date.now()}`
      const newTeacher = {
        id: teacherId,
        name: data.name.trim(),
        enabled: data.enabled ?? true,
        contact: data.contact?.trim() || null,
        qualifications: data.qualifications?.trim() || null,
        specialization: data.specialization?.trim() || null,
        department: data.department?.trim() || null,
        assignments: [{ branchId, roles: [ROLES.TEACHER] }],
      }
      org.users = org.users || []
      org.users.push(newTeacher)
      org.profileOverrides = org.profileOverrides || {}
      org.profileOverrides[teacherId] = {
        contact: newTeacher.contact,
        qualifications: newTeacher.qualifications,
        specialization: newTeacher.specialization,
        department: newTeacher.department,
      }
      writeOrganization(org)
      return newTeacher
    }, query, PERMISSIONS.CLASSES_MANAGE)
  },
  async listSubjectAssignments(query) {
    return inScope(async branchId => {
      let assignments
      try {
        assignments = await mockApi.facultyAssignmentOperation('list', { query: { branchId } })
      } catch {
        assignments = []
      }
      if (assignments.length === 0) {
        return { available: false, assignments: [] }
      }
      return { available: true, assignments }
    }, query)
  },
  async listBatchAssignments(query) {
    return inScope(async branchId => {
      let assignments
      try {
        assignments = await mockApi.facultyAssignmentOperation('list', { query: { branchId } })
      } catch {
        assignments = []
      }
      const [batches, courses] = await Promise.all([batchService.list({ branchId }), courseService.list({ branchId })])
      const courseById = new Map(courses.map(course => [course.id, course]))
      return batches.map(batch => {
        const batchTeacherAssignments = assignments.filter(a => a.batchId === batch.id)
        const teacherNames = [...new Set(batchTeacherAssignments.map(a => a.teacherName))]
        return {
          ...batch,
          courseName: courseById.get(batch.courseId)?.name ?? 'Unresolved course',
          teacherAssignments: teacherNames,
          assignments: batchTeacherAssignments,
        }
      })
    }, query)
  },
  async assignFaculty(record, query) {
    return inScope(async branchId => {
      return mockApi.facultyAssignmentOperation('create', { record, query: { branchId } })
    }, query, PERMISSIONS.CLASSES_MANAGE)
  },
  async updateAssignment(id, record, query) {
    return inScope(async branchId => {
      return mockApi.facultyAssignmentOperation('update', { id, record, query: { branchId } })
    }, query, PERMISSIONS.CLASSES_MANAGE)
  },
  async removeAssignment(id, query) {
    return inScope(async branchId => {
      return mockApi.facultyAssignmentOperation('delete', { id, query: { branchId } })
    }, query, PERMISSIONS.CLASSES_MANAGE)
  },
  async listAssignments(query) {
    return inScope(async branchId => {
      return mockApi.facultyAssignmentOperation('list', { query: { branchId } })
    }, query, PERMISSIONS.FACULTY_VIEW)
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
