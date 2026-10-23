import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'

describe('FinancePage KPI Cards and Month Selector', () => {
  beforeEach(async () => {
    localStorage.clear()
    window.history.replaceState(null, '', '/finance')
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
  })

  it('renders the 4 redesigned KPI cards with dynamic uppercase month name and net position', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Academy Finance' })).toBeInTheDocument()
    expect(screen.getByText("TODAY'S NET POSITION")).toBeInTheDocument()
    expect(screen.getByText(/TOTAL REVENUE/)).toBeInTheDocument()
    expect(screen.getByText(/TOTAL EXPENSES/)).toBeInTheDocument()
    expect(screen.getByText(/NET MARGIN/)).toBeInTheDocument()
    expect(screen.getByText(/Challans Collected/)).toBeInTheDocument()
    expect(screen.getByText(/All major dues cleared/)).toBeInTheDocument()
    expect(screen.getByText(/operating margin/)).toBeInTheDocument()
  })

  it('renders Month selector to the left of Export CSV and Export PDF and allows switching periods', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Academy Finance' })).toBeInTheDocument()

    // Verify Month: label and Export buttons are present
    expect(screen.getByText('Month:')).toBeInTheDocument()
    const exportCsv = screen.getByRole('button', { name: /Export CSV/i })
    const exportPdf = screen.getByRole('button', { name: /Export PDF/i })
    expect(exportCsv).toBeInTheDocument()
    expect(exportPdf).toBeInTheDocument()

    // Click the month selector button
    const monthButton = screen.getByRole('button', { name: 'Select month and year' })
    expect(monthButton).toBeInTheDocument()
    await user.click(monthButton)

    // Verify menu items appear
    expect(screen.getByText('Current Month (Auto)')).toBeInTheDocument()
    expect(screen.getByText('All Months (Lifetime)')).toBeInTheDocument()

    // Switch to All Months
    await user.click(screen.getByText('All Months (Lifetime)'))
    expect(screen.getByText('ALL-TIME TOTAL REVENUE')).toBeInTheDocument()
    expect(localStorage.getItem('tsa_finance_selected_month')).toBe('all')
  })

  it('renders redesigned Expense Breakdown and Quick Record Expense cards with PKR addon and Save button', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Expense Breakdown' })).toBeInTheDocument()
    expect(screen.getByText(/Fixed Overhead Ratio:/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quick Record Expense' })).toBeInTheDocument()
    expect(screen.getByText('Expense Amount')).toBeInTheDocument()
    expect(screen.getByText('PKR')).toBeInTheDocument()
    expect(screen.getByText('Expense Category')).toBeInTheDocument()
    expect(screen.getByText('Short Description / Payee')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Expense Entry/i })).toBeInTheDocument()
  })

  it('opens custom expense category dropdown, displays Other option and reveals custom category input on selection', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Quick Record Expense' })).toBeInTheDocument()

    // Click Category dropdown trigger
    const categoryButton = screen.getByRole('button', { name: 'Select expense category' })
    expect(categoryButton).toBeInTheDocument()
    await user.click(categoryButton)

    // Verify 'Other' is present (and 'Other Operational' is not)
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Other Operational' })).not.toBeInTheDocument()

    // Click 'Other'
    await user.click(screen.getByRole('option', { name: 'Other' }))

    // Verify input field for custom category appears
    expect(screen.getByText(/Specify Category Name/i)).toBeInTheDocument()
    const customInput = screen.getByPlaceholderText(/e\.g\. Science Lab Supplies/i)
    expect(customInput).toBeInTheDocument()
  })
  it('renders Teacher Payroll tab and allows navigation between Finance Overview and Teacher Payroll', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Academy Finance' })).toBeInTheDocument()

    // Both tabs are visible
    const overviewTab = screen.getByRole('button', { name: /Finance Overview/i })
    const payrollTab = screen.getByRole('button', { name: /Teacher Payroll/i })
    expect(overviewTab).toBeInTheDocument()
    expect(payrollTab).toBeInTheDocument()

    // Switch to Teacher Payroll
    await user.click(payrollTab)
    expect(await screen.findByText(/TOTAL SALARY PAYABLE/i)).toBeInTheDocument()
    expect(screen.getByText(/TOTAL SALARY PAID/i)).toBeInTheDocument()
    expect(screen.getByText(/Salary Payment Progress/i)).toBeInTheDocument()
  })
})
