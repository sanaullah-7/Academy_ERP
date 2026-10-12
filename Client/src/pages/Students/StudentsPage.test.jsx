import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { studentService } from '../../services/studentService.js'
import { admissionService } from '../../services/admissionService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'
import { mockApi } from '../../mock/mockApi.js'
import { createMockDatabase } from '../../mock/mockDatabase.js'

const query = { branchId: 'demo-central' }
const input = { studentName: 'DEMO New Student', guardianName: 'DEMO Guardian', contact: '0000000000', dob: '2010-01-01', course: 'Computer Science', courseId: 'course-demo-2' }
beforeEach(() => history.replaceState(null, '', '/students'))
async function setup() {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', 'demo-central')
  localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, students: [], courses: [{ id: 'course-demo-2', branchId: 'demo-central', name: 'Computer Science' }, { id: 'course-demo-1', branchId: 'demo-north', name: 'Computer Science' }], admissions: [] }))
}
describe('read-only DEMO Students Directory', () => {
  it('switches branches without keeping the previous rows and logs out', async () => {
    await setup()
    await admissionService.createWithStudent(input, query)
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    render(<App />)
    expect(await screen.findByText(input.studentName)).toBeInTheDocument()
    await userEvent.setup().selectOptions(screen.getByLabelText('Active demo branch'), 'demo-north')
    expect(await screen.findByText('No students yet')).toBeInTheDocument()
    expect(screen.queryByText(input.studentName)).not.toBeInTheDocument()
    await userEvent.setup().selectOptions(screen.getByLabelText('Active demo branch'), 'demo-central')
    expect(await screen.findByText(input.studentName)).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Log out of demo' }))
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
    expect(screen.queryByText(input.studentName)).not.toBeInTheDocument()
  })
  it('rejects a service response when logout occurs during an asynchronous request', async () => {
    await setup()
    let resolve
    vi.spyOn(mockApi, 'request').mockReturnValue(new Promise(r => { resolve = r }))
    const request = studentService.list(query)
    await waitFor(() => expect(resolve).toBeTypeOf('function'))
    await authService.logout()
    resolve([])
    await expect(request).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })
  it('drops a late old-branch result after switching branch', async () => {
    await setup()
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    let resolve
    vi.spyOn(studentService, 'listDirectory').mockImplementation(({ branchId }) => branchId === 'demo-central'
      ? new Promise(r => { resolve = r }) : Promise.resolve([]))
    render(<App />)
    await screen.findByText('Loading students...')
    await userEvent.setup().selectOptions(screen.getByLabelText('Active demo branch'), 'demo-north')
    await screen.findByText('No students yet')
    resolve([{ id: 'stale', name: 'Stale branch student', displaySerial: 1 }])
    await Promise.resolve()
    expect(screen.queryByText('Stale branch student')).not.toBeInTheDocument()
  })
  it('shows the admission-created student, current serial and link after refresh without duplicating data', async () => {
    await setup()
    const admission = await admissionService.createWithStudent(input, query)
    const bytes = localStorage.getItem(MOCK_DATABASE_KEY)
    const view = render(<App />)
    expect(await screen.findByText(input.studentName)).toBeInTheDocument()
    const row = screen.getByRole('link', { name: 'View student DEMO New Student' })
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(within(row).getByText('ADM-1')).toBeInTheDocument()
    expect(within(row).getAllByText('Provisional').length).toBeGreaterThan(0)
    view.unmount(); render(<App />)
    expect(await screen.findByText(input.studentName)).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(bytes)
    expect((await studentService.getById(admission.studentId, query)).admissionId).toBe(admission.id)
  })
  it.each(['row', 'name'])('%s opens the selected student profile with its branch and admission reference', async entry => {
    await setup()
    const first = await admissionService.createWithStudent({ ...input, studentName: 'DEMO Profile One', guardianName: 'Profile Guardian One' }, query)
    const second = await admissionService.createWithStudent({ ...input, studentName: 'DEMO Profile Two', guardianName: 'Profile Guardian Two' }, query)
    render(<App />)
    const row = await screen.findByRole('link', { name: 'View student DEMO Profile One' })
    if (entry === 'row') await userEvent.setup().click(row)
    else await userEvent.setup().click(within(row).getByText('DEMO Profile One'))
    expect(await screen.findByRole('heading', { name: 'Student Profile' })).toBeInTheDocument()
    expect(screen.getByText('DEMO Profile One', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('Demo Central Campus', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText(first.student.admissionDisplaySerialId, { selector: 'dd' })).toBeInTheDocument()
    expect(screen.queryByText('DEMO Profile Two', { selector: 'dd' })).not.toBeInTheDocument()
    expect(location.pathname).toBe(`/students/${first.studentId}`)
    expect(second.studentId).not.toBe(first.studentId)
  })

  it('does not reveal a student profile from a different active branch', async () => {
    await setup()
    const foreignAdmission = createMockDatabase().createAdmission({
      ...input,
      studentName: 'DEMO Foreign Branch Student',
      courseId: 'course-demo-1',
    }, { branchId: 'demo-north' })
    const foreignStudent = { id: foreignAdmission.studentId }
    history.replaceState(null, '', `/students/${foreignStudent.id}`)
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('not found in the selected branch')
    expect(screen.queryByText('DEMO Foreign Branch Student')).not.toBeInTheDocument()
  })

  it('opens a focused student row with Enter and Space', async () => {
    await setup()
    const admission = await admissionService.createWithStudent({ ...input, studentName: 'DEMO Keyboard Profile' }, query)
    render(<App />)
    const row = await screen.findByRole('link', { name: 'View student DEMO Keyboard Profile' })
    row.focus()
    await userEvent.setup().keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Student Profile' })).toBeInTheDocument()
    expect(location.pathname).toBe(`/students/${admission.studentId}`)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Back to Students' }))
    const refreshedRow = await screen.findByRole('link', { name: 'View student DEMO Keyboard Profile' })
    refreshedRow.focus()
    await userEvent.setup().keyboard(' ')
    expect(await screen.findByRole('heading', { name: 'Student Profile' })).toBeInTheDocument()
    expect(location.pathname).toBe(`/students/${admission.studentId}`)
  })

  it('presents legacy missing status as Active without rewriting the record', async () => {
    await setup()
    const legacy = { id: 'legacy', branchId: query.branchId, name: 'Legacy DEMO' }
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, students: [legacy], courses: [], admissions: [] }))
    render(<App />)
    expect(await screen.findByText('Legacy DEMO')).toBeInTheDocument()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).students).toEqual([legacy])
  })
  it('shows empty state and keyboard-operable Students navigation', async () => {
    await setup(); render(<App />)
    expect(await screen.findByText('No students yet')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Students' })
    link.focus(); await userEvent.setup().keyboard('{Enter}')
    expect(location.pathname).toBe('/students')
  })
  it('preserves corrupted bytes and offers retry', async () => {
    await setup(); localStorage.setItem(MOCK_DATABASE_KEY, '{broken')
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load students')
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe('{broken')
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify({ version: 2, students: [], courses: [{ id: 'course-demo-2', branchId: 'demo-central', name: 'Computer Science' }], admissions: [] }))
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('No students yet')).toBeInTheDocument()
  })
  it('rejects anonymous and wrong-branch service reads', async () => {
    await expect(studentService.list(query)).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
    await setup()
    await expect(studentService.list({ branchId: 'demo-north' })).rejects.toMatchObject({ code: 'INVALID_SCOPE' })
  })
  it('redirects anonymous directory navigation to login', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Demo login' })).toBeInTheDocument()
  })
  it('denies unassigned users', async () => {
    await authService.login({ userId: 'demo-unassigned' }); render(<App />)
    await waitFor(() => expect(location.pathname).toBe('/unauthorized'))
  })
  it('shows gapless student serials after a linked deletion', async () => {
    await setup()
    const first = await admissionService.createWithStudent(input, query)
    await admissionService.createWithStudent({ ...input, studentName: 'Surviving DEMO' }, query)
    createMockDatabase().deleteAdmission(first.id, query)
    render(<App />)
    const row = await screen.findByRole('link', { name: 'View student Surviving DEMO' })
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(within(row).getByText('ADM-1')).toBeInTheDocument()
  })
  it('does not render a late result after unmount', async () => {
    await setup()
    let resolve
    vi.spyOn(studentService, 'list').mockReturnValue(new Promise(r => { resolve = r }))
    const view = render(<App />)
    await screen.findByText('Loading students...')
    view.unmount()
    resolve([{ id: 'old', name: 'Stale student', displaySerial: 1 }])
    await Promise.resolve()
    expect(screen.queryByText('Stale student')).not.toBeInTheDocument()
  })
})
