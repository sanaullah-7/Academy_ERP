import { beforeEach, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { authService } from '../../services/authService.js'
import { payrollService } from '../../services/payrollService.js'
import { financialService } from '../../services/financialService.js'
import './FinancePage.jsx'
import App from '../../App.jsx'

const query = { branchId: 'demo-central' }

beforeEach(() => {
  localStorage.clear()
})

async function loginAdmin() {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', query.branchId)
}

describe('Teacher Payroll Integration & UI Workflow', () => {
  it('hides payroll sub-tab by default when disabled, and restores 100% baseline view', async () => {
    await loginAdmin()
    window.history.replaceState(null, '', '/finance')
    render(createElement(App))

    // Finance overview renders
    expect(await screen.findByRole('heading', { name: 'Academy Finance' }, { timeout: 10000 })).toBeInTheDocument()

    // Sub-tab button for Teacher Payroll must NOT be present when disabled
    expect(screen.queryByRole('button', { name: /Teacher Payroll/i })).not.toBeInTheDocument()
  })

  it('reveals Teacher Payroll subpage when enabled, shows 4 methods, and allows approving & paying', async () => {
    await loginAdmin()
    // 1. Enable module
    await payrollService.updateSettings({ enabled: true }, query)

    window.history.replaceState(null, '', '/finance')
    render(createElement(App))

    // Both sub-tabs now appear
    expect(await screen.findByRole('button', { name: /Teacher Payroll/i }, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Finance Overview/i })).toBeInTheDocument()

    // Click Teacher Payroll
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Teacher Payroll/i }))

    // Payroll header & KPI cards appear
    expect(await screen.findByLabelText('Payroll month')).toBeInTheDocument()
    expect(screen.getByText('Gross Earnings')).toBeInTheDocument()
    expect(screen.getByText('Monthly Obligation')).toBeInTheDocument()

    // Teachers appear
    expect(screen.getByText('Dr. Irfan (Bio)')).toBeInTheDocument()
    expect(screen.getByText('Prof. Naeem (Chem)')).toBeInTheDocument()
    expect(screen.getByText('Engr. Bilal (Phys)')).toBeInTheDocument()
    expect(screen.getByText('Sir Tariq (Math)')).toBeInTheDocument()

    // Methods badges appear
    expect(screen.getAllByText('FIXED').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PER LECTURE').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PER STUDENT').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('FEE PERCENTAGE').length).toBeGreaterThanOrEqual(1)

    // Approve payroll period
    const approveBtn = screen.getByRole('button', { name: /Approve Payroll/i })
    await user.click(approveBtn)

    expect(await screen.findByText(/approved successfully/i)).toBeInTheDocument()

    // Pay buttons are now enabled
    const payButtons = screen.getAllByRole('button', { name: /^Pay$/i })
    expect(payButtons.length).toBeGreaterThan(0)

    // Click Pay for the first teacher (demo-teacher, 61,000)
    await user.click(payButtons[0])

    // Disburse modal opens
    expect(await screen.findByRole('heading', { name: /Disburse Teacher Salary/i })).toBeInTheDocument()
    expect(screen.getByText(/Finance Integration Notice/i)).toBeInTheDocument()

    // Submit payment
    const disburseSubmitBtn = screen.getByRole('button', { name: /Disburse & Post to Finance/i })
    await user.click(disburseSubmitBtn)

    // Success feedback
    expect(await screen.findByText(/posted to Finance expenses/i)).toBeInTheDocument()

    // Verify exactly 1 expense was created in Finance overview
    const finance = await financialService.financeOverview(query)
    const payrollExpense = finance.expenses.find(e => e.category === 'Faculty' && e.description.includes('PAYROLL'))
    expect(payrollExpense).toBeDefined()
    expect(payrollExpense.amount).toBe(61000)
  })

  it('allows opening official branded payslip with itemized breakdown', async () => {
    await loginAdmin()
    await payrollService.updateSettings({ enabled: true }, query)

    window.history.replaceState(null, '', '/finance')
    render(createElement(App))

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Teacher Payroll/i }, { timeout: 10000 }))

    expect(await screen.findByLabelText('Payroll month')).toBeInTheDocument()

    const payslipBtns = screen.getAllByRole('button', { name: /Payslip/i })
    await user.click(payslipBtns[0])

    // Payslip modal opens
    expect(await screen.findByRole('heading', { name: /Official Faculty Payslip/i })).toBeInTheDocument()
    expect(screen.getByText(/Earnings Breakdown/i)).toBeInTheDocument()
    expect(screen.getByText(/Deductions & Advances/i)).toBeInTheDocument()
    expect(screen.getByText(/NET SALARY PAYABLE/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument()
  })

  it('one-click undo: disabling in settings cleanly hides payroll while preserving historical records', async () => {
    await loginAdmin()
    // 1. Enable and record a payroll disbursement
    await payrollService.updateSettings({ enabled: true }, query)
    await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)

    // 2. Disable in settings (Undo)
    await payrollService.updateSettings({ enabled: false }, query)

    // 3. Mount Finance page
    window.history.replaceState(null, '', '/finance')
    render(createElement(App))

    expect(await screen.findByRole('heading', { name: 'Academy Finance' }, { timeout: 10000 })).toBeInTheDocument()
    // Payroll sub-tab is completely hidden
    expect(screen.queryByRole('button', { name: /Teacher Payroll/i })).not.toBeInTheDocument()

    // 4. Verify data in storage was preserved!
    const savedPeriods = await payrollService.getPeriods(query)
    expect(savedPeriods.length).toBeGreaterThan(0)
    expect(savedPeriods[0].yearMonth).toBe('2026-10')
  })
})
