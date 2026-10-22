import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewAdmissionForm from './NewAdmissionForm.jsx'
import { admissionService } from '../../services/admissionService.js'

const courses = [
  { id: 'alpha', name: 'Alpha Course', active: true, pricingMode: 'subjects' },
  { id: 'beta', name: 'Beta Course', active: true, pricingMode: 'subjects' },
  { id: 'gamma', name: 'Gamma Course', active: true, pricingMode: 'course', feeAmount: 9000 },
]
const subjects = [
  { id: 'bio', courseId: 'alpha', name: 'Alpha Biology', active: true, feeAmount: 1000 },
  { id: 'chem', courseId: 'alpha', name: 'Alpha Chemistry', active: true, feeAmount: 2000 },
  { id: 'inactive', courseId: 'alpha', name: 'Inactive Subject', active: false, feeAmount: 9000 },
  { id: 'math', courseId: 'beta', name: 'Beta Maths', active: true, feeAmount: 4000 },
  { id: 'physics', courseId: 'gamma', name: 'Gamma Physics', active: true, feeAmount: 5000 },
]
vi.mock('../../hooks/useBranch.js', () => ({ useBranch: () => ({ branchId: 'north', scopeKey: 'north' }) }))
vi.mock('../../hooks/usePermissions.js', () => ({ usePermissions: () => ({ can: () => true }) }))
vi.mock('../../services/courseService.js', () => ({ courseService: { list: async () => courses } }))
vi.mock('../../services/batchService.js', () => ({ batchService: { list: async () => [] } }))
vi.mock('../../services/classScheduleService.js', () => ({ classScheduleService: { list: async () => [] } }))
vi.mock('../../services/facultyService.js', () => ({ facultyService: { listAssignments: async () => [] } }))
vi.mock('../../services/academicService.js', () => ({ academicService: { overview: async () => ({ streams: [], subjects }) } }))
vi.mock('../../services/admissionService.js', () => ({ admissionService: { createWithStudent: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
async function open(admission) {
  render(<NewAdmissionForm admission={admission}/>)
  await waitFor(() => expect(screen.getByLabelText(/Desired Course/)).toBeEnabled())
  return userEvent.setup()
}
const subject = name => screen.getByRole('button', { name: new RegExp(name) })
describe('new course default subjects', () => {
  it('selects every active subject, preserves manual exclusions when adding another course and clears removed courses', async () => {
    const user = await open()
    await user.click(screen.getByRole('button', { name: /Alpha Course/ }))
    expect(subject('Alpha Biology')).toHaveAttribute('aria-pressed', 'true')
    expect(subject('Alpha Chemistry')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Inactive Subject')).not.toBeInTheDocument()
    await user.click(subject('Alpha Biology'))
    await user.click(screen.getByRole('button', { name: /Beta Course/ }))
    expect(subject('Alpha Biology')).toHaveAttribute('aria-pressed', 'false')
    expect(subject('Alpha Chemistry')).toHaveAttribute('aria-pressed', 'true')
    expect(subject('Beta Maths')).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /Alpha Course/ }))
    expect(screen.queryByText('Alpha Chemistry')).not.toBeInTheDocument()
    expect(subject('Beta Maths')).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /Alpha Course/ }))
    expect(subject('Alpha Biology')).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /Beta Course/ }))
    await user.click(screen.getByRole('button', { name: /Alpha Course/ }))
    expect(screen.getByText('0 Selected')).toBeInTheDocument()
  })

  it('defaults subjects from the course dropdown and submits only those remaining checked', async () => {
    const user = await open()
    await user.selectOptions(screen.getByLabelText(/Desired Course/), 'alpha')
    expect(subject('Alpha Chemistry')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Total Course Fee').parentElement).toHaveTextContent('3,000')
    await user.click(subject('Alpha Biology'))
    expect(screen.getByText('Total Course Fee').parentElement).toHaveTextContent('2,000')
    await user.type(screen.getByLabelText(/Student Full Name/), 'Subject QA Student')
    fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '2010-01-01' } })
    await user.type(screen.getByLabelText(/Guardian \/ Father Name/), 'QA Guardian')
    await user.type(screen.getByLabelText(/Contact Number/), '03001234567')
    admissionService.createWithStudent.mockResolvedValue({ id: 'saved' })
    await user.click(screen.getByRole('button', { name: 'Submit Application' }))
    await waitFor(() => expect(admissionService.createWithStudent).toHaveBeenCalledWith(expect.objectContaining({ subjectIds: ['chem'] }), { branchId: 'north' }))
  })

  it('preserves saved manual subject choices when opening an existing admission', async () => {
    await open({ id: 'existing', studentName: 'Saved Student', course: 'Alpha Course', courseId: 'alpha', subjectIds: ['chem'] })
    expect(subject('Alpha Biology')).toHaveAttribute('aria-pressed', 'false')
    expect(subject('Alpha Chemistry')).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows subject prices only for courses using selected-subject pricing', async () => {
    const user = await open()
    await user.click(screen.getByRole('button', { name: /Alpha Course/ }))
    expect(subject('Alpha Biology')).toHaveTextContent('1,000')
    expect(subject('Alpha Chemistry')).toHaveTextContent('2,000')

    await user.click(screen.getByRole('button', { name: /Gamma Course/ }))
    expect(subject('Gamma Physics')).not.toHaveTextContent('5,000')
    expect(subject('Gamma Physics')).not.toHaveTextContent(/Fee not set/i)
  })
})
