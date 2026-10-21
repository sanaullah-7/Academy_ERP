import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import FeesPage from './FeesPage.jsx'
import { financialService } from '../../services/financialService.js'
import { downloadCsv } from '../../utils/exportHelpers.js'

vi.mock('../../layouts/DashboardLayout.jsx', () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock('../../hooks/useBranch.js', () => ({ useBranch: () => ({ branchId: 'demo-north', branch: { name: 'North' }, scopeKey: 'north-fee-test' }) }))
vi.mock('../../hooks/usePermissions.js', () => ({ usePermissions: () => ({ can: () => false }) }))
vi.mock('../../services/financialService.js', () => ({ financialService: { overview: vi.fn() } }))
vi.mock('../../utils/exportHelpers.js', () => ({ downloadCsv: vi.fn() }))
afterEach(() => vi.useRealTimers())
const row = (name, issueDate, status = 'Unpaid') => ({ id: name, branchId: 'demo-north', studentId: name, studentName: name, reference: name, courseName: 'Course', batchName: 'Batch', description: 'Fee', issueDate, dueDate: '2026-12-31', amount: 100, balance: status === 'Paid' ? 0 : 100, paidAmount: status === 'Paid' ? 100 : 0, status })
const load = challans => { financialService.overview.mockResolvedValue({ challans, payments: [], enrollments: [] }); render(<BrowserRouter><FeesPage /></BrowserRouter>) }

describe('Fees period toolbar', () => {
  it('combines real issue dates with status/search and inclusive custom ranges', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
    load([row('Today Fee', '2026-10-20', 'Paid'), row('Week Fee', '2026-10-19'), row('Month Fee', '2026-10-01'), row('Year Fee', '2026-01-01'), row('Old Fee', '2025-01-01'), { ...row('Foreign Fee', '2026-10-20'), branchId: 'demo-central' }])
    expect(await screen.findByText('1\u20135 of 5')).toBeInTheDocument()
    const user = userEvent.setup()
    const controls = within(screen.getByRole('group', { name: 'Fee reporting period' }))
    for (const [period, count] of [['Daily', 1], ['Weekly', 2], ['Monthly', 3], ['Yearly', 4], ['All', 5]]) {
      await user.click(controls.getByRole('button', { name: period, exact: true }))
      expect(screen.getByText(`1\u2013${count} of ${count}`)).toBeInTheDocument()
    }
    await user.click(controls.getByRole('button', { name: 'Custom' }))
    expect(screen.getByText('0\u20130 of 0')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Fee start date'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Fee end date'), { target: { value: '2026-10-20' } })
    expect(screen.getByText('1\u20133 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Paid/ }))
    expect(screen.getByText('1\u20131 of 1')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Search fees'), 'no match')
    expect(screen.getByText('0\u20130 of 0')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('1\u20135 of 5')).toBeInTheDocument()
    expect(screen.queryByText('Foreign Fee')).not.toBeInTheDocument()
    await user.click(controls.getByRole('button', { name: 'Custom' }))
    fireEvent.change(screen.getByLabelText('Fee start date'), { target: { value: '2026-10-20' } })
    fireEvent.change(screen.getByLabelText('Fee end date'), { target: { value: '2026-10-01' } })
    expect(screen.getByRole('alert')).toHaveTextContent('End date must be on or after start date.')
  })

  it('resets page and selection on period changes, exporting all matching pages', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
    load(Array.from({ length: 16 }, (_, index) => row(`Fee Student ${index + 1}`, '2026-10-20')))
    expect(await screen.findByText('1\u201315 of 16')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Next Fees page' }))
    expect(screen.getByText('16\u201316 of 16')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(downloadCsv.mock.lastCall[2]).toHaveLength(16)
    await user.click(screen.getByRole('checkbox', { name: 'Select challan for Fee Student 16' }))
    expect(screen.getByText('1 of 16 record selected')).toBeInTheDocument()
    const controls = within(screen.getByRole('group', { name: 'Fee reporting period' }))
    await user.click(controls.getByRole('button', { name: 'Daily' }))
    await user.click(controls.getByRole('button', { name: 'All', exact: true }))
    expect(screen.getByText('1\u201315 of 16')).toBeInTheDocument()
    expect(screen.queryByText('1 of 16 record selected')).not.toBeInTheDocument()
  })
})
