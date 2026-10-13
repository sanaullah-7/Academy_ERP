/**
 * Purpose: Will define Students Page for the Students area of the Academy frontend.
 * Module: Students
 * Status: Implemented — branch-scoped searchable DEMO directory.
 */

import { useEffect, useMemo, useState } from 'react'
import { UsersRound, Loader2, AlertCircle, Search, RotateCcw } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import StudentsTable from '../../components/Students/StudentsTable.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { studentService } from '../../services/studentService.js'
import { courseService } from '../../services/courseService.js'
import { batchService } from '../../services/batchService.js'

const emptyFilters = { search: '', status: 'All', courseId: 'All', batchId: 'All', sort: 'name-asc' }

export default function StudentsPage() {
  const { branchId, scopeKey } = useBranch()
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
  function updateFilter(key, value) {
    setFilters(previous => ({ ...previous, [key]: value, ...(key === 'courseId' ? { batchId: 'All' } : {}) }))
  }
  function clearFilters() { setFilters(emptyFilters) }
  function refreshAfterEdit(student) {
    setMessage(`${student.name} ka record save ho gaya.`)
    setRetry(value => value + 1)
  }

  return <DashboardLayout><div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
    {message && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm">{message}</p>}
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-base"><UsersRound size={18} aria-hidden="true" />Branch directory{current?.students && <Badge variant="secondary" className="ml-auto"><span>{visibleStudents.length} / {current.students.length} students</span></Badge>}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!current ? <div role="status" className="flex items-center justify-center gap-3 p-12 text-muted-foreground"><Loader2 size={20} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Loading students...</div>
          : current.error ? <div className="flex flex-col items-center gap-3 p-8 text-center"><AlertCircle aria-hidden="true" className="text-destructive" /><p role="alert" className="break-words text-destructive">Unable to load students. {current.error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>
            : <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">Search students</span><Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="search" value={filters.search} placeholder="Search name, admission, guardian" onChange={event => updateFilter('search', event.target.value)} /></label>
                <label className="text-sm"><span className="sr-only">Filter by status</span><select aria-label="Filter by status" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={filters.status} onChange={event => updateFilter('status', event.target.value)}><option>All</option><option>Provisional</option><option>Active</option></select></label>
                <label className="text-sm"><span className="sr-only">Filter by course</span><select aria-label="Filter by course" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={filters.courseId} onChange={event => updateFilter('courseId', event.target.value)}><option value="All">All courses</option>{current.courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
                <label className="text-sm"><span className="sr-only">Filter by batch</span><select aria-label="Filter by batch" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={filters.batchId} onChange={event => updateFilter('batchId', event.target.value)}><option value="All">All batches</option>{availableBatches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></label>
                <label className="text-sm"><span className="sr-only">Sort students</span><select aria-label="Sort students" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="date-newest">Admission date newest</option><option value="date-oldest">Admission date oldest</option></select></label>
                <Button variant="outline" className="sm:col-span-2 lg:col-span-5 lg:justify-self-end" onClick={clearFilters}><RotateCcw size={16} aria-hidden="true" />Clear Filters</Button>
              </div>
              {visibleStudents.length === 0 ? <div className="p-10 text-center"><h2 className="font-semibold">{current.students.length ? 'No students match your filters' : 'No students yet'}</h2><p className="mt-2 text-sm text-muted-foreground">{current.students.length ? 'Search ya filters badlein, ya sab clear kar dein.' : 'Students created through Admissions will appear here automatically.'}</p></div>
                : <StudentsTable students={visibleStudents} branchId={branchId} onUpdated={refreshAfterEdit} />}
            </div>}
      </CardContent>
    </Card>
  </div></DashboardLayout>
}
