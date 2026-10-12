import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import NewAdmissionPage from './NewAdmissionPage.jsx'
import { admissionService } from '../../services/admissionService.js'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

vi.mock('../../hooks/useBranch.js', () => ({
  useBranch: () => ({ branchId: 'demo-central', currentBranch: { id: 'demo-central', name: 'Demo Campus' } })
}))

vi.mock('../../hooks/usePermissions.js', () => ({
  usePermissions: () => ({ can: vi.fn().mockReturnValue(true) })
}))

vi.mock('../../services/admissionService.js', () => ({
  admissionService: {
    createWithStudent: vi.fn()
  }
}))

vi.mock('../../services/courseService.js', () => ({ courseService: { list: async () => [{ id: 'course-demo-2', branchId: 'demo-central', name: 'Computer Science' }] } }))
vi.mock('../../services/batchService.js', () => ({ batchService: { list: async () => [] } }))

vi.mock('../../layouts/DashboardLayout.jsx', () => ({
  default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>
}))

describe('NewAdmissionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields', () => {
    render(<MemoryRouter><NewAdmissionPage /></MemoryRouter>)

    expect(screen.getByLabelText(/Student Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Guardian \/ Father Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Desired Course \/ Program/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Application/i })).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><NewAdmissionPage /></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('button', { name: /Submit Application/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /Submit Application/i }))

    expect(await screen.findByText('Student name is required')).toBeInTheDocument()
    expect(screen.getByText('Date of birth is required')).toBeInTheDocument()
    expect(screen.getByText('Guardian name is required')).toBeInTheDocument()
    expect(screen.getByText('Contact number is required')).toBeInTheDocument()
    expect(screen.getByText('Course selection is required')).toBeInTheDocument()

    expect(admissionService.createWithStudent).not.toHaveBeenCalled()
  })

  it('submits successfully and navigates', async () => {
    const user = userEvent.setup()
    admissionService.createWithStudent.mockResolvedValueOnce({ id: 'ADM-TEST' })

    render(<MemoryRouter initialEntries={['/admissions/new']}><NewAdmissionPage /></MemoryRouter>)

    await user.type(screen.getByLabelText(/Student Full Name/i), 'Test Student')
    await user.type(screen.getByLabelText(/Date of Birth/i), '2010-01-01')
    await user.type(screen.getByLabelText(/Guardian \/ Father Name/i), 'Test Guardian')
    await user.type(screen.getByLabelText(/Contact Number/i), '03001234567')
    await user.selectOptions(screen.getByLabelText(/Desired Course \/ Program/i), 'course-demo-2')

    await waitFor(() => expect(screen.getByRole('button', { name: /Submit Application/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /Submit Application/i }))

    await waitFor(() => {
      expect(admissionService.createWithStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          studentName: 'Test Student',
          dob: '2010-01-01',
          guardianName: 'Test Guardian',
          contact: '03001234567',
          course: 'Computer Science'
        }),
        { branchId: 'demo-central' }
      )
    })
  })
})
