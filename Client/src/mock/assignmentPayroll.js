import { getBranchRoles, ROLES } from '../constants/roles.js'

// Assignment payroll uses the existing database envelope and payment ledger.
// This application has one academy organization; branch guards remain in the adapter.
export const PAYROLL_TENANT_ID = 'academy'
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100

export function payrollAssignments(data, users, branchId) {
  return (data.facultyAssignments || [])
    .filter((a) => {
      const teacher = users.find(
        (t) =>
          t.id === a.teacherId &&
          t.enabled &&
          !t.accessRevoked &&
          getBranchRoles(t, branchId).includes(ROLES.TEACHER)
      )
      const course = data.courses.find(
        (c) => c.id === a.courseId && c.branchId === branchId && c.active !== false
      )
      const batch = data.batches.find(
        (b) =>
          b.id === a.batchId &&
          b.branchId === branchId &&
          b.courseId === a.courseId &&
          b.active !== false
      )
      const subject = data.subjects.find(
        (s) =>
          s.id === a.subjectId &&
          s.branchId === branchId &&
          s.courseId === a.courseId &&
          s.active !== false
      )
      return a.branchId === branchId && teacher && course && batch && subject
    })
    .map((a) => ({
      ...a,
      facultyAssignmentId: a.id,
      tenantId: PAYROLL_TENANT_ID,
      teacherName: users.find((t) => t.id === a.teacherId).name,
      courseName: data.courses.find((c) => c.id === a.courseId).name,
      batchName: data.batches.find((b) => b.id === a.batchId).name,
      subjectName: data.subjects.find((s) => s.id === a.subjectId).name,
    }))
}

export function assignmentCalculation(data, assignment, agreement, asOfDate) {
  const result = {
    eligibleStudents: 0,
    studentIds: [],
    applicableFee: null,
    feeSourceId: null,
    feeBasis: agreement?.feeBasis || null,
    feePercentage: agreement?.feePercentage || 0,
    description: '',
    basisLabel: 'Listed fees; not cash receipts',
  }
  const enrolled = data.enrollments.filter(
    (e) =>
      e.branchId === assignment.branchId &&
      e.courseId === assignment.courseId &&
      e.batchId === assignment.batchId &&
      e.status === 'Active' &&
      e.enrolledAt?.slice(0, 10) <= asOfDate &&
      data.students.some(
        (s) => s.id === e.studentId && s.branchId === e.branchId && s.status === 'Active'
      ) &&
      data.admissions.some(
        (a) => a.id === e.admissionId && a.branchId === e.branchId && a.status === 'Approved'
      )
  )
  const mappingMissing = enrolled.some((e) => !Array.isArray(e.subjectIds) || !e.subjectIds.length)
  result.studentIds = [
    ...new Set(
      enrolled
        .filter((e) => Array.isArray(e.subjectIds) && e.subjectIds.includes(assignment.subjectId))
        .map((e) => e.studentId)
    ),
  ]
  result.eligibleStudents = mappingMissing ? null : result.studentIds.length
  if (!agreement)
    return { ...result, amount: 0, error: 'A valid assignment salary agreement is required.' }
  if (agreement.calculationMethod === 'fixed')
    return {
      ...result,
      amount: agreement.monthlySalary,
      fixedRate: agreement.monthlySalary,
      description:
        'Fixed salary: PKR ' + agreement.monthlySalary.toLocaleString() + ' for this assignment',
    }
  if (agreement.calculationMethod !== 'percentage')
    return {
      ...result,
      amount: 0,
      error: 'Choose Percentage or Fixed Salary for this assignment.',
    }
  if (mappingMissing)
    return {
      ...result,
      amount: 0,
      error: 'Subject participation mapping is missing for an active batch enrollment.',
    }
  const courseBasis = agreement.feeBasis === 'course'
  const source = (courseBasis ? data.courses : data.subjects).find(
    (x) =>
      x.id === (courseBasis ? assignment.courseId : assignment.subjectId) &&
      x.branchId === assignment.branchId
  )
  if (courseBasis && agreement.fullCourseFeeAuthorized !== true)
    return {
      ...result,
      amount: 0,
      error: 'Full course fee must be explicitly authorized for this assignment.',
    }
  if (!source || !Number.isFinite(source.feeAmount) || source.feeAmount < 0)
    return {
      ...result,
      amount: 0,
      error: 'The assigned ' + (courseBasis ? 'course' : 'subject') + ' fee is missing or invalid.',
    }
  result.applicableFee = source.feeAmount
  result.feeSourceId = source.id
  const amount = round((result.eligibleStudents * source.feeAmount * agreement.feePercentage) / 100)
  if (!Number.isFinite(amount) || amount > Number.MAX_SAFE_INTEGER)
    return { ...result, amount: 0, error: 'Salary exceeds the supported amount.' }
  return {
    ...result,
    amount,
    description: `${result.eligibleStudents} students × PKR ${source.feeAmount.toLocaleString()} × ${agreement.feePercentage}% (${courseBasis ? 'course' : 'subject'} listed fee)`,
  }
}
