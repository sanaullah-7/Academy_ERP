import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeacherPayrollView from './TeacherPayrollView.jsx'
import { payrollService } from '../../services/payrollService.js'
vi.mock('../../hooks/usePermissions.js', () => ({
  usePermissions: () => ({ can: () => true, roles: ['super_admin'] }),
}))
vi.mock('../../services/payrollService.js', () => ({
  payrollService: {
    getRunningOverview: vi.fn(),
    saveAgreement: vi.fn(),
    getPayslip: vi.fn(),
    recordPayment: vi.fn(),
  },
}))
const lines = Array.from({ length: 12 }, (_, i) => ({
  id: `l${i}`,
  tenantId: 'academy',
  facultyAssignmentId: `a${i}`,
  teacherId: `t${i}`,
  teacherName: `QA Teacher ${i}`,
  courseId: 'course',
  courseName: 'Science',
  batchId: `b${i}`,
  batchName: `Batch ${i}`,
  subjectId: 'bio',
  subjectName: 'Biology',
  calculationMethod: 'fixed',
  calculationDetails: { description: 'Fixed salary', eligibleStudents: 5, fixedRate: 1000 },
  baseEarnings: 1000,
  netPayable: 1000,
  totalPaid: 0,
  outstanding: 1000,
  status: 'Draft',
}))
const details = {
  period: { id: 'period', payrollVersion: 2, status: 'Draft', totalNetPayable: 12000 },
  lines,
  payments: [],
  advances: [],
}
beforeEach(() => {
  vi.clearAllMocks()
  payrollService.getRunningOverview.mockResolvedValue({
    ...details,
    teachers: lines.map((l) => ({
      ...l,
      agreement: { calculationMethod: 'fixed', monthlySalary: 1000 },
    })),
  })
  payrollService.saveAgreement.mockResolvedValue({})
  payrollService.recordPayment.mockResolvedValue({})
})
it('shows payment progress for the selected method and restores combined progress', async () => {
  payrollService.getRunningOverview.mockResolvedValueOnce({
    lines: [
      { ...lines[0], netPayable: 1000, totalPaid: 250, outstanding: 750 },
      { ...lines[1], calculationMethod: 'percentage', netPayable: 3000, totalPaid: 2250, outstanding: 750 },
    ],
    teachers: [], payments: [],
  })
  const user = userEvent.setup()
  render(<TeacherPayrollView branchId="progress-test" />)
  expect(await screen.findByRole('progressbar')).toHaveAttribute('aria-valuenow', '63')
  for (const [method, percent] of [['Percentage', '75'], ['Fixed Salary', '25'], ['All Methods', '63']]) {
    await user.click(screen.getByRole('button', { name: 'Calculation method', exact: true }))
    await user.click(screen.getByRole('option', { name: method, exact: true }))
    expect(screen.getByRole('progressbar', { name: `${method} salary payments` })).toHaveAttribute('aria-valuenow', percent)
  }
})

it('limits batches to the selected course and resets the batch when the course changes', async () => {
  payrollService.getRunningOverview.mockResolvedValueOnce({
    lines: [lines[0], { ...lines[1], courseId: 'arts', courseName: 'Arts', batchName: 'Arts Batch' }],
    teachers: [], payments: [],
  })
  const user = userEvent.setup()
  render(<TeacherPayrollView branchId="course-filter-test" />)
  await screen.findByText('1\u20132 of 2')
  await user.click(screen.getByRole('button', { name: 'Payroll batch' }))
  expect(screen.getByRole('option', { name: 'Arts Batch · Arts' })).toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'Batch 0 · Science' })).toBeInTheDocument()
  await user.click(screen.getByRole('option', { name: 'All Batches' }))
  await user.click(screen.getByRole('button', { name: 'Payroll course' }))
  await user.click(screen.getByRole('option', { name: 'Science', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Payroll batch' }))
  expect(screen.queryByRole('option', { name: /Arts Batch/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('option', { name: 'Batch 0', exact: true }))
  expect(screen.getByText('1\u20131 of 1')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Payroll course' }))
  await user.click(screen.getByRole('option', { name: 'Arts', exact: true }))
  expect(screen.getByRole('button', { name: 'Payroll batch' })).toHaveTextContent('All Batches')
  expect(screen.getByRole('cell', { name: 'QA Teacher 1' })).toBeInTheDocument()
  expect(screen.queryByRole('cell', { name: 'QA Teacher 0' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Payroll course' }))
  await user.click(screen.getByRole('option', { name: 'All Courses' }))
  expect(screen.getByText('1\u20132 of 2')).toBeInTheDocument()
})

it('preserves shared pagination, removed header controls and simple KPI cards', async () => {
  const user = userEvent.setup()
  render(<TeacherPayrollView branchId="demo-central" />)
  expect(await screen.findByText('1\u201310 of 12')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next Teacher payroll page' }))
  expect(screen.getByText('11\u201312 of 12')).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Teacher payroll rows per page'), '15')
  expect(screen.getByText('1\u201312 of 12')).toBeInTheDocument()
  expect(screen.queryByLabelText('Payroll month')).not.toBeInTheDocument()
  for (const name of ['Recalculate', 'Staff Advance'])
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
  for (const name of ['Export PDF', 'Export CSV'])
    expect(screen.getByRole('button', { name })).toBeInTheDocument()
  for (const label of [
    'Total Salary Payable',
    'Total Salary Paid',
    'Total Salary Remaining',
    'Teachers with Assignments',
    'Active Salary Agreements',
    'Pending Salary Payments',
  ])
    expect(screen.getByText(label)).toBeInTheDocument()
  expect(screen.queryByText('Allowances')).not.toBeInTheDocument()
  expect(screen.queryByTitle('Add bonus or deduction')).not.toBeInTheDocument()
  expect(screen.queryByText('Combined Teacher Summary')).not.toBeInTheDocument()
  for (const heading of ['Eligible Students', 'Listed Fee', 'Agreed Rate'])
    expect(screen.queryByRole('columnheader', { name: heading })).not.toBeInTheDocument()
  expect(document.querySelector('.overflow-x-auto')).not.toBeInTheDocument()
})
it('saves the exact teacher and assignment IDs from the agreement action', async () => {
  const user = userEvent.setup()
  render(<TeacherPayrollView branchId="agreement-test" />)
  await screen.findByText('1\u201310 of 12')
  await user.click(screen.getAllByRole('button', { name: /Payroll actions for/ })[0])
  await user.click(screen.getByRole('menuitem', { name: 'Salary Agreement' }))
  fireEvent.change(screen.getByLabelText('Agreed salary'), {
    target: { value: '1500' },
  })
  await user.click(screen.getByRole('button', { name: 'Save Salary Agreement' }))
  expect(payrollService.saveAgreement).toHaveBeenCalledWith(
    expect.objectContaining({
      teacherId: 't0',
      facultyAssignmentId: 'a0',
      courseId: 'course',
      batchId: 'b0',
      subjectId: 'bio',
      monthlySalary: 1500,
      calculationMethod: 'fixed',
    }),
    { branchId: 'agreement-test' }
  )
  await waitFor(() =>
    expect(payrollService.getRunningOverview.mock.calls.length).toBeGreaterThan(1)
  )
})
it('offers exactly two agreement methods and requires course-fee authorization', async () => {
  const user = userEvent.setup()
  render(<TeacherPayrollView branchId="percentage-test" />)
  await screen.findByText('1\u201310 of 12')
  await user.click(screen.getAllByRole('button', { name: /Payroll actions for/ })[0])
  await user.click(screen.getByRole('menuitem', { name: 'Salary Agreement' }))
  const dialog = screen.getByRole('dialog')
  await user.click(within(dialog).getByRole('button', { name: 'Percentage', exact: true }))
  fireEvent.change(screen.getByLabelText('Teacher percentage'), { target: { value: '30' } })
  await user.click(screen.getByRole('button', { name: 'Calculation fee basis', exact: true }))
  await user.click(screen.getByRole('option', { name: 'Full Course Fee', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Save Salary Agreement' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Authorize full course fee')
  expect(payrollService.saveAgreement).not.toHaveBeenCalled()
  await user.click(screen.getByLabelText('Authorize full course fee'))
  await user.click(screen.getByRole('button', { name: 'Save Salary Agreement' }))
  expect(payrollService.saveAgreement).toHaveBeenCalledWith(
    expect.objectContaining({
      calculationMethod: 'percentage',
      feeBasis: 'course',
      feePercentage: 30,
      fullCourseFeeAuthorized: true,
    }),
    { branchId: 'percentage-test' }
  )
})
it('keeps running balances visible with Add Payment and no approval or month controls', async () => {
  render(<TeacherPayrollView branchId="running-balance-test" />)
  await screen.findByText('1\u201310 of 12')
  expect(screen.queryByRole('button', { name: 'Approve Payroll' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Salary period')).not.toBeInTheDocument()
  expect(screen.queryByText('Fixed Monthly')).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: /Payroll actions for/ })).toHaveLength(10)
  fireEvent.click(screen.getAllByRole('button', { name: /Payroll actions for/ })[0])
  expect(screen.getByRole('menuitem', { name: 'Add Payment', exact: true })).toBeInTheDocument()
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})
it('does not fetch again or clear the table on ordinary rerenders', async () => {
  const view = render(<TeacherPayrollView branchId="stable-test" />)
  await screen.findByText('1\u201310 of 12')
  for (let i = 0; i < 4; i++)
    view.rerender(<TeacherPayrollView branchId="stable-test" branchName={'Campus ' + i} />)
  expect(payrollService.getRunningOverview).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
it('posts a partial payment with its actual date through Add Payment', async () => {
  const user = userEvent.setup()
  render(<TeacherPayrollView branchId="payment-test" />)
  await screen.findByText('1\u201310 of 12')
  await user.click(screen.getAllByRole('button', { name: /Payroll actions for/ })[0])
  await user.click(screen.getByRole('menuitem', { name: 'Add Payment', exact: true }))
  fireEvent.change(screen.getByLabelText('Disbursement amount'), { target: { value: '500' } })
  fireEvent.change(screen.getByLabelText('Payment date'), { target: { value: '2026-10-10' } })
  await user.click(screen.getByRole('button', { name: 'Add Payment & Post to Finance' }))
  expect(payrollService.recordPayment).toHaveBeenCalledWith(
    expect.objectContaining({ payrollLineId: 'l0', amount: 500, paymentDate: '2026-10-10' }),
    { branchId: 'payment-test' }
  )
})
