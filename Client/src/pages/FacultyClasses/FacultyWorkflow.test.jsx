import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import { resolveDailyClasses, zonedClock } from '../../services/classScheduleService.js'
import * as exportHelpers from '../../utils/exportHelpers.js'
import * as pdfHelpers from '../../utils/pdfHelpers.js'

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/faculty')
  vi.restoreAllMocks()
})

async function signIn(userId = 'demo-admin', branchId = 'demo-central') {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('Faculty & Classes Table Utilities & End-to-End Workflow', () => {
  it('renders circular Refresh, PDF, and CSV toolbar buttons and triggers reload on refresh', async () => {
    await signIn()
    const listSpy = vi.spyOn(facultyService, 'list')
    render(<App />)

    // Wait for initial load
    expect(await screen.findByRole('button', { name: 'Refresh table data' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Print or save PDF/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()

    const initialCallCount = listSpy.mock.calls.length
    await userEvent.setup().click(screen.getByRole('button', { name: 'Refresh table data' }))

    await waitFor(() => {
      expect(listSpy.mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })

  it('exports all filtered records when none selected, and only selected records when checkboxes are ticked', async () => {
    await signIn()
    const downloadCsvSpy = vi.spyOn(exportHelpers, 'downloadCsv').mockImplementation(() => {})
    const exportPdfSpy = vi.spyOn(pdfHelpers, 'exportTablePdf').mockImplementation(() => {})

    const user = userEvent.setup()
    render(<App />)

    await screen.findAllByRole('link', { name: 'Demo Teacher' })

    // 1. Export with NO checkboxes selected -> exports all 6 teachers
    await user.click(screen.getByRole('button', { name: /Export CSV/i }))
    expect(downloadCsvSpy).toHaveBeenCalled()
    const allCsvRows = downloadCsvSpy.mock.calls[0][2]
    expect(allCsvRows.length).toBe(6)

    await user.click(screen.getByRole('button', { name: /Print or save PDF/i }))
    expect(exportPdfSpy).toHaveBeenCalled()
    const allPdfRows = exportPdfSpy.mock.calls[0][0].rows
    expect(allPdfRows.length).toBe(6)

    // 2. Select exactly one teacher checkbox
    const demoTeacherCheckbox = screen.getByRole('checkbox', { name: 'Select Demo Teacher' })
    await user.click(demoTeacherCheckbox)
    expect(demoTeacherCheckbox).toBeChecked()

    // Bulk action bar should appear showing 1 selected
    expect(await screen.findByText(/1 of 6 record.*selected/i)).toBeInTheDocument()

    // Export CSV with 1 selected (use the circular toolbar button)
    downloadCsvSpy.mockClear()
    const csvButtons = screen.getAllByRole('button', { name: /Export CSV/i })
    await user.click(csvButtons[0])
    expect(downloadCsvSpy).toHaveBeenCalled()
    const singleCsvRows = downloadCsvSpy.mock.calls[0][2]
    expect(singleCsvRows.length).toBe(1)
    expect(singleCsvRows[0][0]).toBe('Demo Teacher')

    // Export PDF with 1 selected
    exportPdfSpy.mockClear()
    const pdfButtons = screen.getAllByRole('button', { name: /Print or save PDF/i })
    await user.click(pdfButtons[0])
    expect(exportPdfSpy).toHaveBeenCalled()
    const singlePdfRows = exportPdfSpy.mock.calls[0][0].rows
    expect(singlePdfRows.length).toBe(1)
    expect(singlePdfRows[0][0]).toBe('Demo Teacher')

    // 3. Click Select All checkbox
    const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Select all instructors' })
    await user.click(selectAllCheckbox)

    downloadCsvSpy.mockClear()
    await user.click(screen.getAllByRole('button', { name: /Export CSV/i })[0])
    expect(downloadCsvSpy).toHaveBeenCalled()
    expect(downloadCsvSpy.mock.calls[0][2].length).toBe(6)
  })

  it('adds a new faculty member, updates the roster, and selects their profile', async () => {
    await signIn()
    const user = userEvent.setup()
    render(<App />)

    await screen.findAllByRole('link', { name: 'Demo Teacher' })
    expect(screen.getByText('6 / 6 teachers')).toBeInTheDocument()

    // Click + Add Faculty Member
    await user.click(screen.getByRole('button', { name: /\+ Add Faculty Member/i }))
    expect(await screen.findByRole('heading', { name: 'Add Faculty Member' })).toBeInTheDocument()

    // Fill form
    await user.type(screen.getByPlaceholderText(/Prof\. Tariq Mahmood/i), 'Dr. Ayesha Malik')
    await user.type(screen.getByPlaceholderText(/M\.Phil Chemistry/i), 'Ph.D Molecular Biology')
    await user.type(screen.getByPlaceholderText(/0301-4455667/i), '0300-8889999')

    // Submit
    await user.click(screen.getByRole('button', { name: /Add Instructor/i }))

    // Roster updates and includes the new teacher
    expect(await screen.findByRole('link', { name: 'Dr. Ayesha Malik' })).toBeInTheDocument()
    expect(screen.getByText('7 / 7 teachers')).toBeInTheDocument()
  })

  it('assigns teacher to a batch/subject, syncs with Daily Dashboard class, and allows removing assignment', async () => {
    await signIn()
    const branchId = 'demo-central'

    // Fetch existing academic records in demo-central
    const overview = await academicService.overview({ branchId })
    const course = overview.courses.find(c => c.id === 'course-demo-2') || overview.courses[0]
    const batch = overview.batches.find(b => b.courseId === course.id) || overview.batches[0]

    // Create a verified subject under this course if not already present
    let subject = overview.subjects.find(s => s.courseId === course.id)
    if (!subject) {
      subject = await academicService.saveSubject(
        null,
        {
          courseId: course.id,
          name: 'Organic Chemistry',
          active: true,
        },
        { branchId }
      )
    }

    const todayClock = zonedClock(new Date(), 'Asia/Karachi')
    const todayWeekdayShort = todayClock.weekday.slice(0, 3)
    const dayCapitalized = todayWeekdayShort.charAt(0).toUpperCase() + todayWeekdayShort.slice(1).toLowerCase()

    // 1. Assign teacher via facultyService
    const assignment = await facultyService.assignFaculty(
      {
        teacherId: 'teacher-naeem',
        courseId: course.id,
        batchId: batch.id,
        subjectId: subject.id,
        days: [dayCapitalized],
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lab Room 301',
        notes: 'Organic Reaction Mechanics',
      },
      { branchId }
    )

    expect(assignment.id).toBeDefined()

    // 2. Verify assignment appears in facultyService.listAssignments
    const assignments = await facultyService.listAssignments({ branchId })
    expect(assignments.some(a => a.id === assignment.id)).toBe(true)

    // 3. Verify that resolveDailyClasses resolves this assignment for today's dashboard classes
    const resolvedClasses = resolveDailyClasses({
      sessions: [],
      assignments,
      academic: {
        courses: [course],
        batches: [batch],
        subjects: [subject],
      },
      branchId,
    })

    expect(resolvedClasses.length).toBeGreaterThan(0)
    const matchingClass = resolvedClasses.find(c => c.assignmentId === assignment.id)
    expect(matchingClass).toBeDefined()
    expect(matchingClass.location).toBe('Lab Room 301')

    // 4. Verify removal updates linked records safely
    await facultyService.removeAssignment(assignment.id, { branchId })
    const updatedAssignments = await facultyService.listAssignments({ branchId })
    expect(updatedAssignments.some(a => a.id === assignment.id)).toBe(false)
  })
})
