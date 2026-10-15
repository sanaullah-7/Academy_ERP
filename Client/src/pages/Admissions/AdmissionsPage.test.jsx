import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdmissionsPage from './AdmissionsPage.jsx'
import { admissionService } from '../../services/admissionService.js'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

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
