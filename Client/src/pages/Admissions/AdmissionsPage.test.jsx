import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AdmissionsPage from './AdmissionsPage.jsx'
import { admissionService } from '../../services/admissionService.js'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

afterEach(() => vi.useRealTimers())

// Mock dependencies
vi.mock('../../hooks/useAuth.js', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('../../hooks/useBranch.js', () => ({
  useBranch: () => ({ branchId: 'branch_1', currentBranch: { id: 'branch_1', name: 'Main Campus' } })
}))

vi.mock('../../hooks/usePermissions.js', () => ({
  usePermissions: () => ({ can: vi.fn().mockReturnValue(true) })
}))

vi.mock('../../services/admissionService.js', () => ({
  admissionService: {
    list: vi.fn()
  }
}))

// Minimal mock for DashboardLayout
vi.mock('../../layouts/DashboardLayout.jsx', () => ({
  default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>
}))

describe('AdmissionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    admissionService.list.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<BrowserRouter><AdmissionsPage /></BrowserRouter>)

    expect(screen.getByText(/Loading admissions/i)).toBeInTheDocument()
  })

  it('renders admissions list successfully', async () => {
    const mockAdmissions = [
      { id: 'ADM-0001', branchId: 'branch_1', studentName: 'Ali Khan', guardianName: 'Raza Khan', course: 'Computer Science', status: 'Pending', createdAt: '2026-10-09' },
    ]
    admissionService.list.mockResolvedValueOnce(mockAdmissions)

    render(<BrowserRouter><AdmissionsPage /></BrowserRouter>)

    await waitFor(() => {
      expect(screen.getByText('ADM-0001')).toBeInTheDocument()
      expect(screen.getByText('Ali Khan')).toBeInTheDocument()
    })
  })

  it('filters admissions by search', async () => {
    const mockAdmissions = [
      { id: 'ADM-0001', branchId: 'branch_1', studentName: 'Ali Khan', guardianName: 'Raza Khan', course: 'Computer Science', status: 'Pending', createdAt: '2026-10-09' },
      { id: 'ADM-0002', branchId: 'branch_1', studentName: 'Sara Ahmed', guardianName: 'Ahmed Ali', course: 'Pre-Medical', status: 'Approved', createdAt: '2026-10-08' },
    ]
    admissionService.list.mockResolvedValueOnce(mockAdmissions)

    render(<BrowserRouter><AdmissionsPage /></BrowserRouter>)

    await waitFor(() => {
      expect(screen.getByText('Ali Khan')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search name or ID/i)
    await userEvent.type(searchInput, 'Sara')

    expect(screen.queryByText('Ali Khan')).not.toBeInTheDocument()
    expect(screen.getByText('Sara Ahmed')).toBeInTheDocument()
  })
})


describe('admissions pagination and periods', () => {
  const record = (index, createdAt, status = 'Pending') => ({ id: `P-${index}`, branchId: 'branch_1', studentName: `Paging Student ${index}`, status, createdAt })
  it('paginates all matching applications and selects only the visible page', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
    admissionService.list.mockResolvedValue(Array.from({ length: 12 }, (_, index) => record(index + 1, '2026-10-20')))
    render(<BrowserRouter><AdmissionsPage /></BrowserRouter>)
    expect(await screen.findByText('1\u201310 of 12')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('checkbox', { name: 'Select all admissions' }))
    expect(screen.getByText('10 of 12 records selected')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next Admissions page' }))
    expect(screen.getByText('11\u201312 of 12')).toBeInTheDocument()
    expect(screen.getByText('Paging Student 11')).toBeInTheDocument()
    expect(screen.queryByText('Paging Student 1')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Select all admissions' })).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Select all 12 matching records' }))
    expect(screen.getByText('12 of 12 records selected')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Admissions rows per page' }), '15')
    expect(screen.getByText('1\u201312 of 12')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Admissions rows per page' }), '10')
    await user.click(screen.getByRole('button', { name: 'Next Admissions page' }))
    const periodControls = within(screen.getByRole('group', { name: 'Admission reporting period' }))
    await user.click(periodControls.getByRole('button', { name: 'Monthly', exact: true }))
    await user.click(periodControls.getByRole('button', { name: 'All', exact: true }))
    expect(screen.getByText('1\u201310 of 12')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next Admissions page' }))
    await user.type(screen.getByRole('textbox', { name: 'Search admissions' }), 'Student 1')
    expect(screen.getByText('1\u20134 of 4')).toBeInTheDocument()
    expect(screen.queryByText('12 of 12 records selected')).not.toBeInTheDocument()
  })

  it('combines each date period with status and custom dates, and clears all filters', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
    admissionService.list.mockResolvedValue([
      record('today', '2026-10-19T19:00:00Z', 'Approved'),
      record('week', '2026-10-19T10:00:00Z'),
      record('month', '2026-10-01T10:00:00Z'),
      record('year', '2026-01-01T10:00:00Z'),
      record('old', '2025-01-01T10:00:00Z'),
      { ...record('other-branch', '2026-10-20T10:00:00Z'), branchId: 'branch_2' },
    ])
    render(<BrowserRouter><AdmissionsPage /></BrowserRouter>)
    expect(await screen.findByText('1\u20135 of 5')).toBeInTheDocument()
    const user = userEvent.setup()
    const periods = within(screen.getByRole('group', { name: 'Admission reporting period' }))
    for (const [period, count] of [['Daily', 1], ['Weekly', 2], ['Monthly', 3], ['Yearly', 4], ['All', 5]]) {
      await user.click(periods.getByRole('button', { name: period, exact: true }))
      expect(screen.getByText(`1\u2013${count} of ${count}`)).toBeInTheDocument()
    }
    await user.click(periods.getByRole('button', { name: 'Custom' }))
    expect(screen.getByText('0\u20130 of 0')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Admission start date'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Admission end date'), { target: { value: '2026-10-20' } })
    expect(screen.getByText('1\u20133 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Approved', exact: true }))
    expect(screen.getByText('1\u20131 of 1')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Admission end date'), { target: { value: '2026-09-01' } })
    expect(screen.getByText('End date must be on or after start date.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('1\u20135 of 5')).toBeInTheDocument()
    expect(periods.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })
})
