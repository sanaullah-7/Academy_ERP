/**
 * Purpose: Will define Faculty Classes Page for the FacultyClasses area of the Academy frontend.
 * Module: FacultyClasses
 * Status: Implemented — branch-scoped Faculty & Classes DEMO views.
 */

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpen, CalendarDays, GraduationCap, Loader2, Search, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { courseService } from '../../services/courseService.js'
import { batchService } from '../../services/batchService.js'
import { facultyService } from '../../services/facultyService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

const tabs = [
  ['Directory', ROUTE_PATHS.FACULTY_CLASSES],
  ['Subject assignments', ROUTE_PATHS.FACULTY_SUBJECTS],
  ['Batch assignments', ROUTE_PATHS.FACULTY_BATCHES],
  ['Class schedule', ROUTE_PATHS.CLASS_SCHEDULE],
]

function ModuleNav({ section }) {
  const activePath = section === 'subjects' ? ROUTE_PATHS.FACULTY_SUBJECTS : section === 'batches' ? ROUTE_PATHS.FACULTY_BATCHES : section === 'schedule' ? ROUTE_PATHS.CLASS_SCHEDULE : ROUTE_PATHS.FACULTY_CLASSES
  return <nav aria-label="Faculty and classes views" className="flex gap-2 overflow-x-auto pb-1">
    {tabs.map(([label, path]) => <Link key={path} to={path} aria-current={activePath === path ? 'page' : undefined} className={`shrink-0 rounded-md border px-3 py-2 text-sm ${activePath === path ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border hover:bg-muted'}`}>{label}</Link>)}
  </nav>
}

function SectionCard({ title, icon: Icon, children }) {
  return <Card className="min-w-0 shadow-sm"><CardHeader className="border-b border-border/50 bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><Icon size={18} aria-hidden="true" />{title}</CardTitle></CardHeader><CardContent className="p-5">{children}</CardContent></Card>
}

function State({ loading, error, retry, children }) {
  if (loading) return <div role="status" className="flex items-center gap-3 rounded-lg border p-8 text-muted-foreground"><Loader2 size={20} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Loading Faculty &amp; Classes...</div>
  if (error) return <div className="flex flex-col items-start gap-3 rounded-lg border p-8"><AlertCircle aria-hidden="true" className="text-destructive" /><p role="alert" className="text-destructive">Unable to load this view. {error}</p><Button variant="outline" onClick={retry}>Retry</Button></div>
  return children
}

export default function FacultyClassesPage({ section = 'directory' }) {
  const { branchId, branch, scopeKey } = useBranch()
  const [result, setResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [assignment, setAssignment] = useState('All')
  const [sort, setSort] = useState('name-asc')

  useEffect(() => {
    let active = true
    if (!branchId) return () => { active = false }
    const load = async () => {
      const [teachers, courses, batches] = await Promise.all([
        facultyService.list({ branchId }),
        courseService.list({ branchId }),
        batchService.list({ branchId }),
      ])
      const batchAssignments = section === 'batches' ? await facultyService.listBatchAssignments({ branchId }) : null
      const subjectAssignments = section === 'subjects' ? await facultyService.listSubjectAssignments({ branchId }) : null
      return { teachers, courses, batches, batchAssignments, subjectAssignments }
    }
    load().then(data => { if (active) setResult({ scopeKey, retryCount, section, data }) }, error => { if (active) setResult({ scopeKey, retryCount, section, error: error.message }) })
    return () => { active = false }
  }, [branchId, scopeKey, retryCount, section])

  const current = result?.scopeKey === scopeKey && result.retryCount === retryCount && result.section === section ? result : null
  const data = current?.data
  const visibleTeachers = useMemo(() => {
    if (!data) return []
    const needle = search.trim().toLocaleLowerCase()
    const matches = data.teachers.filter(teacher => {
      const subjectText = teacher.assignedSubjects.map(subject => subject.name).join(' ')
      const isAssigned = teacher.assignedSubjects.length > 0 || teacher.assignedBatches.length > 0
      return (!needle || `${teacher.name} ${subjectText}`.toLocaleLowerCase().includes(needle))
        && (status === 'All' || teacher.accountStatus === status)
        && (assignment === 'All' || (assignment === 'Assigned' ? isAssigned : !isAssigned))
    })
    return matches.sort((a, b) => (sort === 'name-desc' ? -1 : 1) * a.name.localeCompare(b.name))
  }, [data, search, status, assignment, sort])

  const pageTitle = section === 'subjects' ? 'Teacher Subject Assignments' : section === 'batches' ? 'Teacher Batch Assignments' : section === 'schedule' ? 'Class Schedule' : 'Faculty & Classes'
  const retry = () => setRetryCount(value => value + 1)

  return <DashboardLayout><div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
    <header>
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1><Badge variant="secondary">DEMO</Badge></div>
      <p className="mt-2 text-muted-foreground">Authorized branch view for {branch?.name ?? 'the selected branch'}.</p>
    </header>
    <ModuleNav section={section} />
    <State loading={!current} error={current?.error} retry={retry}>
      {data && section === 'directory' && <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2"><span className="sr-only">Search faculty</span><Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="search" placeholder="Search teacher name or subject" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <label className="text-sm"><span className="sr-only">Filter by account status</span><select aria-label="Filter by account status" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={status} onChange={event => setStatus(event.target.value)}><option>All</option><option>Enabled</option><option>Disabled</option></select></label>
          <label className="text-sm"><span className="sr-only">Filter by assignment</span><select aria-label="Filter by assignment" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={assignment} onChange={event => setAssignment(event.target.value)}><option>All</option><option>Assigned</option><option>Unassigned</option></select></label>
          <label className="text-sm sm:col-span-2"><span className="sr-only">Sort faculty</span><select aria-label="Sort faculty" className="min-h-11 w-full rounded-md border border-input bg-background px-3" value={sort} onChange={event => setSort(event.target.value)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></label>
          <p role="status" className="self-center text-sm text-muted-foreground">{visibleTeachers.length} / {data.teachers.length} teachers</p>
        </div>
        <SectionCard title="Branch faculty directory" icon={UsersRound}>
          {visibleTeachers.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{data.teachers.length === 0 ? 'No enabled teacher accounts are assigned to this branch.' : 'No teachers match these filters.'}</p> : <>
            <div className="grid gap-3 md:hidden">{visibleTeachers.map(teacher => <Link key={teacher.id} to={`/faculty/${encodeURIComponent(teacher.id)}`} className="rounded-lg border p-4 hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring"><span className="font-semibold">{teacher.name}</span><span className="mt-1 block text-sm text-muted-foreground">Teacher · {teacher.accountStatus}</span><span className="mt-2 block text-sm text-muted-foreground">Assignments: {teacher.assignedSubjects.length + teacher.assignedBatches.length || 'None saved'}</span></Link>)}</div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><caption className="sr-only">Teachers assigned to {branch?.name}</caption><thead><tr className="border-b text-muted-foreground"><th className="p-3">Teacher</th><th className="p-3">Account status</th><th className="p-3">Subjects</th><th className="p-3">Batches</th></tr></thead><tbody className="divide-y">{visibleTeachers.map(teacher => <tr key={teacher.id}><th scope="row" className="p-3 font-medium"><Link className="text-primary underline-offset-4 hover:underline" to={`/faculty/${encodeURIComponent(teacher.id)}`}>{teacher.name}</Link></th><td className="p-3"><Badge variant="secondary">{teacher.accountStatus}</Badge></td><td className="p-3">{teacher.assignedSubjects.length || 'None saved'}</td><td className="p-3">{teacher.assignedBatches.length || 'None saved'}</td></tr>)}</tbody></table></div>
          </>}
        </SectionCard>
      </>}
      {data && section === 'subjects' && <SectionCard title="Saved subject assignments" icon={BookOpen}>
        <p className="text-sm text-muted-foreground">{data.subjectAssignments?.available ? 'No teacher subject assignments are saved for this branch.' : 'Subject records and teacher-subject assignment links are not available in the approved DEMO data model yet. This view is read-only; no assignments were inferred.'}</p>
        <p className="mt-3 text-sm text-muted-foreground">Current teacher accounts: {data.teachers.length}. New or removed assignments require an approved subject model and assignment policy.</p>
      </SectionCard>}
      {data && section === 'batches' && <SectionCard title="Saved branch batches" icon={GraduationCap}>
        {data.batchAssignments.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No saved batches are available in this branch.</p> : <div className="grid gap-3 sm:grid-cols-2">{data.batchAssignments.map(batch => <article key={batch.id} className="min-w-0 rounded-lg border p-4"><h2 className="break-words font-semibold">{batch.name}</h2><p className="mt-1 text-sm text-muted-foreground">Course: {batch.courseName}</p><p className="mt-1 text-sm text-muted-foreground">Teacher assignment: {batch.teacherAssignments.length ? batch.teacherAssignments.join(', ') : 'None saved'}</p><Button asChild className="mt-3" variant="outline"><Link to={`/faculty/classes/${encodeURIComponent(batch.id)}`}>View enrolled students</Link></Button></article>)}</div>}
        <p className="mt-4 text-sm text-muted-foreground">Teacher-batch assignment records are not part of the current DEMO data model. No teacher is assumed to belong to a batch.</p>
      </SectionCard>}
      {data && section === 'schedule' && <SectionCard title="Weekly class timetable" icon={CalendarDays}>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">Course<select aria-label="Filter schedule by course" disabled className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3"><option>Schedule data unavailable</option></select></label>
          <label className="text-sm">Batch<select aria-label="Filter schedule by batch" disabled className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3"><option>Schedule data unavailable</option></select></label>
          <label className="text-sm">Teacher<select aria-label="Filter schedule by teacher" disabled className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3"><option>Schedule data unavailable</option></select></label>
        </div>
        <div className="mt-5 rounded-lg border border-dashed p-8 text-center"><p className="font-medium">No saved class sessions are available.</p><p className="mt-2 text-sm text-muted-foreground">Schedule display and conflict checks are read-only and await the shared F04 Batch Timetable contract. No scheduling rules, sessions or room assignments were invented.</p></div>
      </SectionCard>}
    </State>
  </div></DashboardLayout>
}
