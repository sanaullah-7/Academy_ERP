import {
  PAYROLL_TENANT_ID,
  payrollAssignments,
  assignmentCalculation,
} from './assignmentPayroll.js'

const keys = ['teacherId', 'courseId', 'batchId', 'subjectId', 'facultyAssignmentId']
const scope = (value) => keys.map((k) => value[k] || '').join('|')
const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
const latestAgreement = (data, assignment, today) =>
  data.salaryAgreements
    .filter(
      (a) =>
        a.branchId === assignment.branchId &&
        scope(a) === scope(assignment) &&
        a.status === 'Active' &&
        a.effectiveFrom <= today &&
        (!a.effectiveTo || a.effectiveTo >= today)
    )
    .sort((a, b) =>
      (b.updatedAt || b.effectiveFrom).localeCompare(a.updatedAt || a.effectiveFrom)
    )[0] || null

// Pure read: a single balance covers a teaching assignment, across every date.
// Old salary lines/payments stay intact and are represented by one carry-forward.
export function runningOverview(data, users, branchId, today) {
  const assignments = payrollAssignments(data, users, branchId)
  const saved = data.payrollLines.filter(
    (l) => l.branchId === branchId && l.payrollVersion === 3 && !l.supersededAt
  )
  const covered = new Set(saved.flatMap((l) => l.sourcePayrollLineIds || []))
  const groups = new Map()
  for (const line of data.payrollLines.filter(
    (l) =>
      l.branchId === branchId && l.payrollVersion !== 3 && !l.supersededAt && !covered.has(l.id)
  )) {
    const key = scope(line)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(line)
  }
  const lines = saved.map((l) => structuredClone(l))
  for (const [key, sources] of groups) {
    const first = sources[0],
      assignment = assignments.find((a) => scope(a) === key)
    const due = round(sources.reduce((sum, l) => sum + Number(l.netPayable || 0), 0))
    const paid = round(sources.reduce((sum, l) => sum + Number(l.totalPaid || 0), 0))
    lines.push({
      ...first,
      ...(assignment || {}),
      id: 'carry:' + first.id,
      branchId,
      payrollVersion: 3,
      payrollPeriodId: null,
      yearMonth: null,
      sourcePayrollLineIds: sources.map((l) => l.id),
      netPayable: due,
      baseEarnings: due,
      totalPaid: paid,
      outstanding: round(Math.max(0, due - paid)),
      status: paid >= due ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending',
      salaryDate: first.createdAt?.slice(0, 10) || today,
      agreementSnapshot: first.agreementSnapshot || null,
      calculationError: null,
      calculationDetails: {
        description:
          'Saved salary and payment history carried forward; no recurring monthly charge.',
      },
      preview: true,
    })
  }
  for (const assignment of assignments) {
    if (lines.some((l) => scope(l) === scope(assignment))) continue
    lines.push({
      ...assignment,
      id: 'setup:' + assignment.facultyAssignmentId,
      branchId,
      payrollVersion: 3,
      payrollPeriodId: null,
      yearMonth: null,
      sourcePayrollLineIds: [],
      netPayable: 0,
      baseEarnings: 0,
      totalPaid: 0,
      outstanding: 0,
      status: 'Salary Setup Required',
      calculationError: 'Save the assignment salary to establish its balance.',
      calculationMethod: null,
      calculationDetails: {},
      preview: true,
    })
  }
  return {
    lines,
    payments: data.payrollPayments.filter((p) => p.branchId === branchId),
    teachers: assignments.map((a) => ({ ...a, agreement: latestAgreement(data, a, today) })),
  }
}

export function materializeRunningLine(data, line, makeId, today) {
  if (!line.preview)
    return data.payrollLines.find((l) => l.id === line.id && l.branchId === line.branchId)
  const { preview: ignored, ...value } = line
  void ignored
  const result = {
    ...value,
    id: makeId(),
    tenantId: PAYROLL_TENANT_ID,
    createdAt: new Date().toISOString(),
    salaryDate: line.salaryDate || today,
    updatedAt: new Date().toISOString(),
    salaryRevisions: [],
  }
  data.payrollLines.push(result)
  return result
}

export function saveRunningAgreement({
  data,
  record,
  query,
  users,
  actorId,
  makeId,
  write,
  fail,
  today,
}) {
  const overview = runningOverview(data, users, query.branchId, today)
  const assignment = overview.teachers.find(
    (a) =>
      a.facultyAssignmentId === record?.facultyAssignmentId && keys.every((k) => record[k] === a[k])
  )
  if (!assignment)
    fail('INVALID_REFERENCE', 'Choose a valid saved teaching assignment in this branch.')
  if (record.tenantId && record.tenantId !== PAYROLL_TENANT_ID)
    fail('INVALID_SCOPE', 'Salary agreement belongs to another organization.')
  if (!['fixed', 'percentage'].includes(record.calculationMethod))
    fail('INVALID_RECORD', 'Choose Percentage or Fixed Salary.')
  const fixed = record.calculationMethod === 'fixed',
    rate = Number(fixed ? record.monthlySalary : record.feePercentage)
  if (!Number.isFinite(rate) || rate <= 0 || (fixed ? !Number.isSafeInteger(rate) : rate > 100))
    fail(
      'INVALID_RECORD',
      'Enter a positive fixed salary or a percentage greater than 0 and at most 100.'
    )
  if (!fixed && !['subject', 'course'].includes(record.feeBasis))
    fail('INVALID_RECORD', 'Choose a valid listed fee basis.')
  if (!fixed && record.feeBasis === 'course' && record.fullCourseFeeAuthorized !== true)
    fail('INVALID_RECORD', 'Explicitly authorize full course fee for this assignment.')
  if (
    ['allowances', 'standardDeductions', 'perLectureRate', 'perStudentRate'].some(
      (k) => Number(record[k] || 0) !== 0
    )
  )
    fail('INVALID_RECORD', 'Only assignment salary is supported.')
  const now = new Date().toISOString()
  const candidate = {
    id: makeId(),
    tenantId: PAYROLL_TENANT_ID,
    branchId: query.branchId,
    ...Object.fromEntries(keys.map((k) => [k, assignment[k]])),
    calculationMethod: record.calculationMethod,
    monthlySalary: fixed ? rate : 0,
    feePercentage: fixed ? 0 : rate,
    feeBasis: fixed ? null : record.feeBasis,
    fullCourseFeeAuthorized:
      !fixed && record.feeBasis === 'course' && record.fullCourseFeeAuthorized === true,
    effectiveFrom: today,
    effectiveTo: null,
    status: 'Active',
    notes: String(record.notes || '')
      .trim()
      .slice(0, 500),
    actorUserId: actorId,
    createdAt: now,
    updatedAt: now,
  }
  const calculation = assignmentCalculation(data, assignment, candidate, today)
  if (calculation.error) fail('INVALID_RECORD', calculation.error)
  const previous = overview.lines.find((l) => scope(l) === scope(assignment))
  if (calculation.amount < previous.totalPaid)
    fail(
      'INVALID_STATE',
      'Salary cannot be lower than payments already recorded. Payment history is preserved.'
    )
  // This changes the SAME obligation, never adds a second salary charge.
  const line = materializeRunningLine(data, previous, makeId, today)
  line.salaryRevisions ??= []
  if (line.agreementSnapshot || line.netPayable)
    line.salaryRevisions.push({
      netPayable: line.netPayable,
      calculationDetails: structuredClone(line.calculationDetails),
      agreementSnapshot: line.agreementSnapshot || null,
      changedAt: now,
      actorUserId: actorId,
    })
  for (const old of data.salaryAgreements.filter(
    (a) => a.branchId === query.branchId && scope(a) === scope(assignment) && a.status === 'Active'
  ))
    old.status = 'Superseded'
  data.salaryAgreements.push(candidate)
  Object.assign(line, {
    ...Object.fromEntries(keys.map((k) => [k, assignment[k]])),
    teacherName: assignment.teacherName,
    courseName: assignment.courseName,
    batchName: assignment.batchName,
    subjectName: assignment.subjectName,
    agreementId: candidate.id,
    agreementSnapshot: structuredClone(candidate),
    calculationMethod: candidate.calculationMethod,
    calculationDetails: calculation,
    calculationError: null,
    netPayable: calculation.amount,
    baseEarnings: calculation.amount,
    outstanding: round(calculation.amount - line.totalPaid),
    status:
      calculation.amount === line.totalPaid
        ? 'Paid'
        : line.totalPaid > 0
          ? 'Partially Paid'
          : 'Pending',
    updatedAt: now,
  })
  write(data)
  return candidate
}
