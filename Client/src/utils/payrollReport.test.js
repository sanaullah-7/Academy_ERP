import { describe, expect, it } from 'vitest'
import { payrollReportRows, payrollReportTotals, payrollTeacherTotals, payrollReportCells } from './payrollReport.js'

describe('payroll reporting projection', () => {
  it('counts verified source payments once per assignment and excludes setup and unverified money', () => {
    const lines = [
      { id: 'running', teacherId: 'teacher', teacherName: 'Teacher', netPayable: 15000, sourcePayrollLineIds: ['old'], calculationMethod: 'percentage', calculationDetails: { eligibleStudents: 2 } },
      { id: 'fixed', teacherId: 'teacher', teacherName: 'Teacher', netPayable: 10000, calculationMethod: 'fixed' },
      { id: 'setup:empty', netPayable: 0 },
    ]
    const payments = [
      { payrollLineId: 'old', amount: 3000, status: 'Verified' },
      { payrollLineId: 'running', amount: 2000, status: 'Verified' },
      { payrollLineId: 'running', amount: 9000, status: 'Pending' },
      { payrollLineId: 'foreign', amount: 9000, status: 'Verified' },
    ]
    const rows = payrollReportRows({ lines, payments }, { courses: [], payrollPeriods: [], expenses: [] })
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ method: 'Percentage', eligibleStudents: 2, paid: 5000, remainingBalance: 10000, payPeriod: 'Running balance' })
    expect(payrollReportTotals(rows)).toMatchObject({ payable: 25000, paid: 5000, outstanding: 20000, teachers: 1 })
    expect(payrollTeacherTotals(rows)).toHaveLength(1)
    expect(payrollReportCells(rows[0])).toContain(5000)
    expect(payrollReportTotals([])).toEqual({ payable: 0, paid: 0, outstanding: 0, teachers: 0, paidEntries: 0, pendingEntries: 0 })
  })
})
