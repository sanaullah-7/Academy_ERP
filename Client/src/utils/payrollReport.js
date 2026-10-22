const round = value => Math.round((value + Number.EPSILON) * 100) / 100

// Presentation projection of the existing running ledger; never calculate salary here.
export function payrollReportRows(overview, data) {
  return overview.lines.filter(line => !line.id.startsWith('setup:')).map(line => {
    const ids = new Set([line.id, ...(line.sourcePayrollLineIds || [])])
    const verifiedPaid = round(overview.payments.filter(payment => ids.has(payment.payrollLineId) && (payment.status === 'Verified' || (!payment.status && data.expenses.some(expense => expense.id === payment.financeExpenseId && expense.branchId === payment.branchId && expense.status === 'Posted')))).reduce((sum, payment) => sum + payment.amount, 0))
    const course = data.courses.find(item => item.id === line.courseId)
    const period = data.payrollPeriods.find(item => item.id === line.payrollPeriodId)
    return {
      id: line.id, teacherId: line.teacherId, teacherName: line.teacherName,
      courseId: line.courseId, courseName: line.courseName || course?.name || 'Historical salary',
      batchId: line.batchId, batchName: line.batchName || 'Historical balance',
      subjectName: line.subjectName || '—', streamId: course?.streamId,
      method: line.calculationMethod === 'percentage' ? 'Percentage' : 'Fixed Salary',
      eligibleStudents: line.calculationDetails?.eligibleStudents ?? null,
      salaryAmount: line.netPayable, paid: verifiedPaid,
      remainingBalance: round(Math.max(0, line.netPayable - verifiedPaid)),
      status: verifiedPaid >= line.netPayable ? 'Paid' : verifiedPaid > 0 ? 'Partially Paid' : 'Pending',
      payPeriod: line.yearMonth || period?.yearMonth || 'Running balance',
      date: line.salaryDate || line.createdAt || '',
    }
  })
}

export function payrollReportTotals(rows) {
  return {
    payable: round(rows.reduce((sum, row) => sum + row.salaryAmount, 0)),
    paid: round(rows.reduce((sum, row) => sum + row.paid, 0)),
    outstanding: round(rows.reduce((sum, row) => sum + row.remainingBalance, 0)),
    teachers: new Set(rows.map(row => row.teacherId)).size,
    paidEntries: rows.filter(row => row.status === 'Paid').length,
    pendingEntries: rows.filter(row => row.status !== 'Paid').length,
  }
}

export const payrollReportHeaders = ['Teacher', 'Course', 'Batch', 'Subject', 'Salary Method', 'Eligible Students', 'Salary (PKR)', 'Verified Paid (PKR)', 'Remaining (PKR)', 'Status', 'Pay Period']
export const payrollReportCells = row => [row.teacherName, row.courseName, row.batchName, row.subjectName, row.method, row.eligibleStudents ?? '—', row.salaryAmount, row.paid, row.remainingBalance, row.status, row.payPeriod]

export function payrollTeacherTotals(rows) {
  const groups = new Map()
  for (const row of rows) {
    if (!groups.has(row.teacherId)) groups.set(row.teacherId, [])
    groups.get(row.teacherId).push(row)
  }
  return Array.from(groups, ([teacherId, records]) => ({ teacherId, teacherName: records[0].teacherName, ...payrollReportTotals(records) }))
}
