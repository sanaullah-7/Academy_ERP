import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { reportService } from '../../services/reportService.js'
import { assetService } from '../../services/assetService.js'
import { authService } from '../../services/authService.js'

beforeEach(async () => {
  await import('./ReportsPage.jsx')
  localStorage.clear()
  history.replaceState(null, '', '/reports')
})

async function signIn(userId = 'demo-admin', branchId = 'demo-central') {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('F10 Reports & Ledgers — UI & Functional QA', () => {
  it('opens Receptionist Reports on authorized Fees instead of the hidden payroll category', async () => {
    await signIn('demo-reception', 'demo-north')
    render(<App />)
    expect(await screen.findByRole('columnheader', { name: /Challan Coverage/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fees & Payment Defaulters/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: /Teacher Payroll & Salary Ledger/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Finance & Expenses/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Total Salary Payable')).not.toBeInTheDocument()
  })
  it('opens the authorized payroll ledger with real zero KPIs and the matching chart and export columns', async () => {
    await signIn()
    render(<App />)
    expect(await screen.findByRole('columnheader', { name: 'Verified Paid (PKR)', exact: true })).toBeInTheDocument()
    expect(screen.getByText('Total Salary Payable')).toBeInTheDocument()
    expect(screen.getByText('Teachers in Payroll')).toBeInTheDocument()
    expect(screen.getByLabelText('Payroll financial breakdown')).toBeInTheDocument()
  })
  it('renders header, 9 tabs, and defaults to Teacher Payroll with TSA Maroon styling', async () => {
    await signIn('demo-admin', 'demo-central')
    render(<App />)

    // Verify main page title and subtitle
    expect(await screen.findByRole('heading', { name: /Academy Reports & Ledgers/i })).toBeInTheDocument()
    expect(screen.getByText(/Generate and export filtered operational records/i)).toBeInTheDocument()

    // Verify all 9 tab labels exist
    expect(screen.getByRole('button', { name: /Teacher Payroll & Salary Ledger/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fees & Payment Defaulters/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Students Directory/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Admissions & Intake/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Courses & Batch Occupancy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Faculty & Timetable/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Finance & Expenses/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Demo Conversion/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Campus Assets/i })).toBeInTheDocument()

    // Verify active tab uses TSA Maroon class (bg-[#940016]) and NOT teal (#005c53)
    const activeTabBtn = screen.getByRole('button', { name: /Teacher Payroll & Salary Ledger/i })
    expect(activeTabBtn.className).toContain('bg-[#940016]')
    expect(activeTabBtn.className).not.toContain('#005c53')

    // Switch to Fees tab to verify Fees KPI cards and headers
    await userEvent.click(screen.getByRole('button', { name: /Fees & Payment Defaulters/i }))

    // Verify KPI Cards for Fees tab
    expect(screen.getByText(/SELECTED COHORT/i)).toBeInTheDocument()
    expect(screen.getByText(/MATCHING STUDENTS/i)).toBeInTheDocument()
    expect(screen.getByText(/TOTAL COHORT FEES/i)).toBeInTheDocument()
    expect(screen.getByText(/OUTSTANDING BALANCE/i)).toBeInTheDocument()
    expect(screen.getByText(/CHALLAN RECOVERY RATE/i)).toBeInTheDocument()

    // Verify Table Headers for Fees
    expect(screen.getByText(/Roll No \/ ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Student & Guardian/i)).toBeInTheDocument()
    expect(screen.getByText(/Contact \/ WhatsApp/i)).toBeInTheDocument()
    expect(screen.getByText(/Batch & Timings/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Remaining Balance/i })).toBeInTheDocument()
    expect(screen.getByText(/Challan Coverage/i)).toBeInTheDocument()

    // Verify Export Actions
    expect(screen.getByRole('button', { name: 'Print or save PDF', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export Word Document', exact: true })).toBeInTheDocument()
  })

  it('navigates through all 8 tabs and updates table columns and KPIs accordingly', async () => {
    const user = userEvent.setup()
    await signIn('demo-admin', 'demo-central')
    render(<App />)

    await screen.findByRole('heading', { name: /Academy Reports & Ledgers/i })

    // Tab 2: Students Directory
    await user.click(screen.getByRole('button', { name: /Students Directory/i }))
    expect(await screen.findByText(/TOTAL DIRECTORY/i)).toBeInTheDocument()
    expect(screen.getByText(/CONFIRMED ACTIVE/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Student ID/i })).toBeInTheDocument()

    // Tab 3: Admissions & Intake
    await user.click(screen.getByRole('button', { name: /Admissions & Intake/i }))
    expect(await screen.findByText(/TOTAL APPLICATIONS/i)).toBeInTheDocument()
    expect(screen.getByText(/APPROVED INTAKE/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Application ID/i })).toBeInTheDocument()

    // Tab 4: Courses & Batch Occupancy
    await user.click(screen.getByRole('button', { name: /Courses & Batch Occupancy/i }))
    expect(await screen.findByText(/CAMPUS SEAT CAPACITY/i)).toBeInTheDocument()
    expect(screen.getByText(/CAPACITY UTILIZATION/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Course Name/i })).toBeInTheDocument()

    // Tab 5: Faculty & Timetable
    await user.click(screen.getByRole('button', { name: /Faculty & Timetable/i }))
    expect(await screen.findByText(/ACTIVE INSTRUCTORS/i)).toBeInTheDocument()
    expect(screen.getByText(/TEACHING LOAD/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Instructor/i })).toBeInTheDocument()

    // Tab 6: Finance & Expenses
    await user.click(screen.getByRole('button', { name: /Finance & Expenses/i }))
    expect(await screen.findByText(/VERIFIED FEE INFLOW/i)).toBeInTheDocument()
    expect(screen.getByText(/POSTED EXPENDITURES/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Voucher Ref/i })).toBeInTheDocument()

    // Tab 7: Demo Conversion
    await user.click(screen.getByRole('button', { name: /Demo Conversion/i }))
    expect(await screen.findByText(/DEMO REGISTRATIONS/i)).toBeInTheDocument()
    expect(screen.getByText(/CONVERSION RATIO/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Demo ID/i })).toBeInTheDocument()

    // Tab 8: Campus Assets
    await user.click(screen.getByRole('button', { name: /Campus Assets/i }))
    expect(await screen.findByText(/TRACKED ASSET UNITS/i)).toBeInTheDocument()
    expect(screen.getByText(/OPERATIONAL ASSETS/i)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Asset Code/i })).toBeInTheDocument()
  })

  it('shows table export icons and an attached rows-per-page footer', async () => {
    const user = userEvent.setup()
    await signIn('demo-admin', 'demo-central')
    render(<App />)
    await screen.findByRole('heading', { name: /Academy Reports & Ledgers/i })
    expect(screen.queryByRole('button', { name: /Batch Schedule Summary/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Export Active Report/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Print or save PDF', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV', exact: true })).toBeInTheDocument()
    const rows = screen.getByLabelText('Reports rows per page')
    expect(rows).toHaveValue('10')
    await user.selectOptions(rows, '25')
    expect(rows).toHaveValue('25')
    expect(screen.getByRole('button', { name: 'Reports page 1' })).toHaveAttribute('aria-current', 'page')
  })

  it('filters rows via search input and resets properly', async () => {
    const user = userEvent.setup()
    await signIn('demo-admin', 'demo-central')
    render(<App />)

    await screen.findByRole('heading', { name: /Academy Reports & Ledgers/i })

    // Switch to Students Directory where seed records exist
    await user.click(screen.getByRole('button', { name: /Students Directory/i }))
    expect(await screen.findByText('Demo Student Two')).toBeInTheDocument()

    // Find Search input and type non-existent term
    const searchInput = screen.getByPlaceholderText(/Quick find in cohort\.\.\./i)
    await user.type(searchInput, 'NonExistentSearchTerm123XYZ')

    await waitFor(() => {
      expect(screen.getByText(/No records found/i)).toBeInTheDocument()
      expect(screen.queryByText('Demo Student Two')).not.toBeInTheDocument()
    })

    // Clear search input via clear button
    const clearBtn = screen.getByRole('button', { name: /Clear search/i })
    await user.click(clearBtn)

    await waitFor(() => {
      expect(screen.queryByText(/No records found/i)).not.toBeInTheDocument()
      expect(screen.getByText('Demo Student Two')).toBeInTheDocument()
    })
  })
  it('refreshes newly saved branch records and reports success', async () => {
    const overview = vi.spyOn(reportService, 'overview')
    const user = userEvent.setup()
    await signIn()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: /Campus Assets/i }))
    await screen.findByRole('columnheader', { name: /Asset Code/i })
    await assetService.create({ assetCode: 'QA-REPORT-REFRESH', name: 'QA Refresh Asset', category: 'QA', trackingType: 'Individual', quantity: 1, purchaseCost: 100 }, { branchId: 'demo-central' })
    expect(screen.queryByText('QA-REPORT-REFRESH')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Refresh report records' }))
    expect(await screen.findByText('QA-REPORT-REFRESH')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Report refreshed from saved branch records.')
    expect(overview).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: 'Refresh report records' })).toBeEnabled()
  })

})
