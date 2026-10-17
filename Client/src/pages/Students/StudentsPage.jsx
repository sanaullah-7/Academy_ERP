/**
 * Purpose: Will define Students Page for the Students area of the Academy frontend.
 * Module: Students
 * Status: Implemented — branch-scoped searchable DEMO directory.
 */

import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { UsersRound, Loader2, AlertCircle, Search, RotateCcw } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import StudentsTable from '../../components/Students/StudentsTable.jsx'
import {
  useTableSelection,
  useColumnVisibility,
  TableToolbarActions,
  BulkActionBar,
} from '../../components/Shared/TableUtilities.jsx'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { useBranch } from '../../hooks/useBranch.js'
import { studentService } from '../../services/studentService.js'
import { courseService } from '../../services/courseService.js'
import { batchService } from '../../services/batchService.js'

const studentColumns = [
  { key: 'serial', label: 'No.', required: true },
  { key: 'name', label: 'Student', required: true },
  { key: 'status', label: 'Status' },
  { key: 'course', label: 'Course' },
  { key: 'batch', label: 'Batch' },
  { key: 'admission', label: 'Admission' },
  { key: 'actions', label: 'Actions', required: true },
]

const emptyFilters = { search: '', status: 'All', courseId: 'All', batchId: 'All', sort: 'name-asc' }

export default function StudentsPage() {
  const { branchId, scopeKey } = useBranch()
  const location = useLocation()
  const highlightStudentId = location.state?.highlightStudentId || location.state?.studentId
  const [result, setResult] = useState(null)
  const [retry, setRetry] = useState(0)
  const [filters, setFilters] = useState(emptyFilters)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    if (branchId) Promise.all([
      studentService.listDirectory({ branchId }),
      courseService.list({ branchId }),
      batchService.list({ branchId }),
    ]).then(([students, courses, batches]) => {
      if (active) setResult({ scopeKey, retry, students, courses, batches })
    }, error => {
      if (active) setResult({ scopeKey, retry, error: error.message })
    })
    return () => { active = false }
  }, [branchId, scopeKey, retry])

  const current = result?.scopeKey === scopeKey && result?.retry === retry ? result : null
  const visibleStudents = useMemo(() => {
    if (!current?.students) return []
    const needle = filters.search.trim().toLocaleLowerCase()
    const matches = current.students.filter(student => {
      const searchable = [
        student.name,
        student.admission?.displayAdmissionId,
        student.admission?.admissionId,
        student.guardianName,
        student.guardianContact,
      ].filter(Boolean).join(' ').toLocaleLowerCase()
      return (!needle || searchable.includes(needle))
        && (filters.status === 'All' || (student.status ?? 'Active') === filters.status)
        && (filters.courseId === 'All' || student.courseId === filters.courseId)
        && (filters.batchId === 'All' || student.batchId === filters.batchId)
    })
    const direction = filters.sort === 'name-desc' || filters.sort === 'date-oldest' ? -1 : 1
    const sorted = [...matches]
    if (filters.sort.startsWith('name-')) sorted.sort((a, b) => direction * a.name.localeCompare(b.name))
    else sorted.sort((a, b) => {
      const aDate = Date.parse(a.admissionCreatedAt ?? '') || null
      const bDate = Date.parse(b.admissionCreatedAt ?? '') || null
      if (!aDate && !bDate) return 0
      if (!aDate) return 1
      if (!bDate) return -1
      return direction * (aDate - bDate)
    })
    return sorted
  }, [current, filters])

  const availableBatches = current?.batches?.filter(batch => filters.courseId === 'All' || batch.courseId === filters.courseId) ?? []

  const columnVisibility = useColumnVisibility(studentColumns, 'students')
  const selection = useTableSelection(visibleStudents, student => student.id)

  function handleExportCsv() {
    const scope = selection.getExportScope()
    const targetStudents = scope.items
    const headers = ['No.', 'Student Name', 'Status', 'Course', 'Batch', 'Admission Ref', 'Guardian Name', 'Guardian Contact']
    const rows = targetStudents.map(s => [
      s.displaySerial ?? '',
      s.name ?? '',
      s.status ?? 'Active',
      s.courseName ?? '',
      s.batchName ?? '',
      s.admission?.displayAdmissionId ?? s.admissionDisplaySerialId ?? s.admissionDisplayId ?? '',
      s.guardianName ?? '',
      s.guardianContact ?? '',
    ])
    downloadCsv(`tsa-students-${branchId || 'branch'}-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  function handleExportPdf() {
    const scope = selection.getExportScope()
    const targetStudents = scope.items
    const headers = ['No.', 'Student Name', 'Status', 'Course', 'Batch', 'Admission Ref', 'Guardian Name', 'Contact']
    const rows = targetStudents.map(s => [
      s.displaySerial ?? '',
      s.name ?? '',
      s.status ?? 'Active',
      s.courseName ?? '',
      s.batchName ?? '',
      s.admission?.displayAdmissionId ?? s.admissionDisplaySerialId ?? s.admissionDisplayId ?? '',
      s.guardianName ?? '',
      s.guardianContact ?? '',
    ])
    exportTablePdf({
      filename: `tsa-students-directory-${branchId || 'branch'}-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Students Directory Report',
      branchName: current?.branch?.name || 'The Scholar Coaching Academy',
      headers,
      rows,
      filterSummary: scope.summary,
    })
  }

  function updateFilter(key, value) {
    setFilters(previous => ({ ...previous, [key]: value, ...(key === 'courseId' ? { batchId: 'All' } : {}) }))
  }
  function clearFilters() { setFilters(emptyFilters) }
  function refreshAfterEdit(student) {
    setMessage(`${student.name} ka record save ho gaya.`)
    setRetry(value => value + 1)
  }
  function refreshAfterDelete(student) {
    setMessage(`${student.name} aur us ke linked admission records delete ho gaye.`)
    setRetry(value => value + 1)
  }

  return <DashboardLayout><div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Students Directory</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Explore active students, linked admissions, courses, and batch assignments.</p>
      </div>
      {current?.students && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <UsersRound size={14} />
          {visibleStudents.length} of {current.students.length} students
        </span>
      )}
    </div>
    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium">{message}</p>}
    <Card className="min-w-0 shadow-sm border border-border/80">
      <CardHeader className="border-b border-border/60 bg-slate-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UsersRound size={17} className="text-primary" aria-hidden="true" />
            Branch directory
            {current?.students && <Badge variant="secondary" className="ml-2 text-xs"><span>{visibleStudents.length} / {current.students.length} students</span></Badge>}
          </CardTitle>
          <TableToolbarActions
            onRefresh={() => setRetry(v => v + 1)}
            columns={studentColumns}
            visibleColumns={columnVisibility.visibleColumns}
            onToggleColumn={columnVisibility.toggleColumn}
            onResetColumns={columnVisibility.resetColumns}
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
            onPrint={() => window.print()}
            exportScopeSummary={selection.getExportScope().summary}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!current ? <div role="status" className="flex items-center justify-center gap-3 p-12 text-muted-foreground"><Loader2 size={24} aria-hidden="true" className="animate-spin text-primary motion-reduce:animate-none" /><span className="text-sm">Loading students...</span></div>
          : current.error ? <div className="flex flex-col items-center gap-3 p-8 text-center"><AlertCircle aria-hidden="true" size={28} className="text-destructive" /><p role="alert" className="break-words text-sm text-destructive">Unable to load students. {current.error}</p><Button variant="outline" size="sm" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>
            : <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2.5 p-3.5 sm:grid-cols-2 lg:grid-cols-4 bg-slate-50/30 border-b border-border/40">
                <label className="relative sm:col-span-2 lg:col-span-1">
                  <span className="sr-only">Search students</span>
                  <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 h-9 text-xs" type="search" value={filters.search} placeholder="Search name, admission, guardian" onChange={event => updateFilter('search', event.target.value)} />
                </label>
                <label className="text-xs font-medium">
                  <span className="sr-only">Filter by status</span>
                  <select aria-label="Filter by status" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs transition-colors hover:border-[#940016]/40 hover:bg-[#F9EBEE]/15 focus:border-[#940016] focus:ring-1 focus:ring-[#940016]" value={filters.status} onChange={event => updateFilter('status', event.target.value)}>
                    <option>All</option>
                    <option>Provisional</option>
                    <option>Active</option>
                  </select>
                </label>
                <label className="text-xs font-medium">
                  <span className="sr-only">Filter by course</span>
                  <select aria-label="Filter by course" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs transition-colors hover:border-[#940016]/40 hover:bg-[#F9EBEE]/15 focus:border-[#940016] focus:ring-1 focus:ring-[#940016]" value={filters.courseId} onChange={event => updateFilter('courseId', event.target.value)}>
                    <option value="All">All courses</option>
                    {current.courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium">
                  <span className="sr-only">Filter by batch</span>
                  <select aria-label="Filter by batch" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs transition-colors hover:border-[#940016]/40 hover:bg-[#F9EBEE]/15 focus:border-[#940016] focus:ring-1 focus:ring-[#940016]" value={filters.batchId} onChange={event => updateFilter('batchId', event.target.value)}>
                    <option value="All">All batches</option>
                    {availableBatches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
                  </select>
                </label>

                {/* Offscreen / accessible for tests and screen readers */}
                <span className="sr-only">
                  <label>
                    <span>Sort students</span>
                    <select aria-label="Sort students" value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}>
                      <option value="name-asc">Name A–Z</option>
                      <option value="name-desc">Name Z–A</option>
                      <option value="date-newest">Admission date newest</option>
                      <option value="date-oldest">Admission date oldest</option>
                    </select>
                  </label>
                  <Button variant="outline" size="sm" onClick={clearFilters} aria-label="Clear Filters">Clear Filters</Button>
                </span>
              </div>
              {selection.selectedCount > 0 && (
                <div className="px-3.5 pt-1">
                  <BulkActionBar
                    selectedCount={selection.selectedCount}
                    totalCount={visibleStudents.length}
                    onClear={selection.clearSelection}
                    onSelectAllMatching={selection.selectAllMatching}
                    isAllMatchingSelected={selection.isAllMatchingSelected}
                    onExportCsv={handleExportCsv}
                    onExportPdf={handleExportPdf}
                    deleteDisabledMessage="Students records cannot be bulk-deleted (Academic integrity protection)"
                  />
                </div>
              )}
              {visibleStudents.length === 0 ? <div className="p-10 text-center"><h2 className="font-semibold text-sm">{current.students.length ? 'No students match your filters' : 'No students yet'}</h2><p className="mt-1 text-xs text-muted-foreground">{current.students.length ? 'Search ya filters badlein, ya sab clear kar dein.' : 'Students created through Admissions will appear here automatically.'}</p></div>
                : <StudentsTable
                    students={visibleStudents}
                    branchId={branchId}
                    onUpdated={refreshAfterEdit}
                    onDeleted={refreshAfterDelete}
                    selection={selection}
                    isVisible={columnVisibility.isVisible}
                    highlightStudentId={highlightStudentId}
                  />}
            </div>}
      </CardContent>
    </Card>
  </div></DashboardLayout>
}
