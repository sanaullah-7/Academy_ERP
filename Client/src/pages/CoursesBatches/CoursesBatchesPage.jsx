/**
 * Purpose: Will define Courses Batches Page for the CoursesBatches area of the Academy frontend.
 * Module: CoursesBatches
 * Status: Planned â€” functionality not implemented.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Eye, FlaskConical, GraduationCap, Layers3, ListChecks, Loader2, MoreVertical, Pencil, Plus, Search, Trash2, User, UsersRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog.jsx'
import { Input } from '../../components/ui/input.jsx'
import CourseForm from '../../components/CoursesBatches/CourseForm.jsx'
import BatchForm from '../../components/CoursesBatches/BatchForm.jsx'
import AcademicRecordForm from '../../components/CoursesBatches/AcademicRecordForm.jsx'
import { academicService } from '../../services/academicService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { demoWorkflowService } from '../../services/demoWorkflowService.js'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { facultyService } from '../../services/facultyService.js'
import CourseDetailsModal from '../../components/CoursesBatches/CourseDetailsModal.jsx'
import AssignFacultyModal from '../../components/CoursesBatches/AssignFacultyModal.jsx'


export default function CoursesBatchesPage() {
  const { branchId, currentBranch } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.COURSES_MANAGE)
  const [tab, setTab] = useState('courses')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [courseFilter, setCourseFilter] = useState('all')
  const [subjectPage, setSubjectPage] = useState(1)
  const [subjectRows, setSubjectRows] = useState(5)
  const [directoryPage, setDirectoryPage] = useState(1)
  const [directoryRows, setDirectoryRows] = useState(5)
  const [dialog, setDialog] = useState(null)
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(0)
  const [demoBusy, setDemoBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [teachers, setTeachers] = useState([])
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null)
  const [assignModalConfig, setAssignModalConfig] = useState(null)
  useEffect(() => {
    let active = true
    Promise.resolve().then(() => { if (active) { setData(null); setError('') } })
    academicService.overview({ branchId }).then(result => { if (active) setData({ ...result, branchId }) }).catch(failure => { if (active) setError(failure.message) })
    facultyService.list({ branchId }).then(res => { if (active) setTeachers(res) }).catch(() => { if (active) setTeachers([]) })
    return () => { active = false }
  }, [branchId, reload])
  const courses = useMemo(() => data?.branchId === branchId ? data.courses : [], [data, branchId])
  const batches = useMemo(() => data?.branchId === branchId ? data.batches : [], [data, branchId])
  const streams = useMemo(() => data?.branchId === branchId ? data.streams : [], [data, branchId])
  const subjects = useMemo(() => data?.branchId === branchId ? data.subjects : [], [data, branchId])
  const academicPortfolios = useMemo(() => streams.map(stream => {
    const linkedCourses = courses.filter(course => course.streamId === stream.id)
    const courseIds = new Set(linkedCourses.map(course => course.id))
    return { ...stream, courses: linkedCourses, subjectCount: subjects.filter(subject => courseIds.has(subject.courseId)).length, batchCount: batches.filter(batch => courseIds.has(batch.courseId)).length }
  }), [streams, courses, subjects, batches])
  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase()
    const source = tab === 'courses' ? courses : batches.filter(batch => courseFilter === 'all' || batch.courseId === courseFilter)
    return source.filter(item => `${item.name} ${item.courseName ?? ''}`.toLocaleLowerCase().includes(needle)).sort((a, b) => (sort === 'name-desc' ? -1 : 1) * a.name.localeCompare(b.name))
  }, [tab, courses, batches, search, sort, courseFilter])
  const subjectSafePage = Math.min(subjectPage, Math.max(1, Math.ceil(subjects.length / subjectRows)))
  const directorySafePage = Math.min(directoryPage, Math.max(1, Math.ceil(visible.length / directoryRows)))
  const visibleSubjects = subjects.slice((subjectSafePage - 1) * subjectRows, subjectSafePage * subjectRows)
  const visibleDirectory = visible.slice((directorySafePage - 1) * directoryRows, directorySafePage * directoryRows)
  const saved = (record, entity = tab === 'courses' ? 'Course' : 'Batch') => { setDialog(null); setMessage(`${entity} “${record.name}” saved.`); setReload(value => value + 1) }
  const capacityLabel = item => item.capacity == null ? 'Capacity not configured' : `${item.remainingSeats} of ${item.capacity} seats left`
  const openDialog = next => {
    setDeleteError('')
    if ((next.type === 'view' || next.type === 'course-view') && (tab === 'courses' || courses.some(c => c.id === next.item?.id))) {
      setSelectedCourseForDetails(courses.find(c => c.id === next.item?.id) || next.item)
      return
    }
    setDialog(next)
  }
  async function setupDemo() {
    setDemoBusy(true); setError('')
    try { await demoWorkflowService.setup({ branchId }); setDialog(null); setMessage('Optional QA demo ready: academic records, two fictional students, one Paid and one Partial challan were added without deleting existing data.'); setReload(value => value + 1) }
    catch (failure) { setError(failure.message) }
    finally { setDemoBusy(false) }
  }
  async function deleteRecord() {
    if (!dialog?.item || !dialog.type?.endsWith('-delete')) return
    const entity = dialog.type.replace('-delete', '')
    const labels = { stream: 'Academic stream', course: 'Course', batch: 'Batch', subject: 'Subject' }
    const removers = { stream: academicService.deleteStream, course: academicService.deleteCourse, batch: academicService.deleteBatch, subject: academicService.deleteSubject }
    if (!removers[entity]) return
    setDeleteBusy(true); setDeleteError('')
    try {
      await removers[entity](dialog.item.id, { branchId })
      setDialog(null); setMessage(`${labels[entity]} “${dialog.item.name}” deleted.`); setReload(value => value + 1)
    } catch (failure) { setDeleteError(failure.message) }
    finally { setDeleteBusy(false) }
  }
  const exportSubjects = () => {
    downloadCsv(
      `tsa-subjects-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Subject Name', 'Parent Course', 'Academic Stream', 'Fee (PKR)', 'Status'],
      subjects.map(s => {
        const c = courses.find(v => v.id === s.courseId)
        return [
          s.name,
          s.courseName,
          c?.streamName ?? 'Unassigned',
          Number.isFinite(s.feeAmount) ? s.feeAmount : 'N/A',
          s.active ? 'Active' : 'Inactive'
        ]
      })
    )
  }

  const exportSubjectsPdf = () => {
    exportTablePdf({
      filename: `tsa-subjects-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Course Subjects Directory Report',
      branchName: currentBranch?.name || 'The Scholar Coaching Academy',
      headers: ['Subject Name', 'Parent Course', 'Academic Stream', 'Fee', 'Status'],
      rows: subjects.map(s => {
        const c = courses.find(v => v.id === s.courseId)
        return [
          s.name,
          s.courseName,
          c?.streamName ?? 'Unassigned',
          Number.isFinite(s.feeAmount) ? `PKR ${s.feeAmount.toLocaleString('en-PK')}` : 'Not configured',
          s.active ? 'Active' : 'Inactive'
        ]
      }),
      filterSummary: `${subjects.length} subjects`
    })
  }

  const exportCoursesBatches = () => {
    if (tab === 'courses') {
      downloadCsv(
        `tsa-courses-report-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Course Name', 'Academic Stream', 'Subjects Count', 'Batches Count', 'Enrolled Students', 'Status'],
        courses.map(c => [
          c.name,
          c.streamName ?? 'Unassigned',
          c.subjectCount,
          c.batchCount,
          c.enrolledCount,
          c.active ? 'Active' : 'Inactive'
        ])
      )
    } else {
      downloadCsv(
        `tsa-batches-report-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Batch Name', 'Parent Course', 'Start Time', 'End Time', 'Enrolled Students', 'Capacity', 'Status'],
        batches.map(b => [
          b.name,
          b.courseName,
          b.startTime ?? 'N/A',
          b.endTime ?? 'N/A',
          b.enrolledCount,
          b.capacity ?? 'N/A',
          b.active ? 'Active' : 'Inactive'
        ])
      )
    }
  }

  const exportCoursesBatchesPdf = () => {
    if (tab === 'courses') {
      exportTablePdf({
        filename: `tsa-courses-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: 'Courses Directory Report',
        branchName: currentBranch?.name || 'The Scholar Coaching Academy',
        headers: ['Course Name', 'Academic Stream', 'Subjects', 'Batches', 'Enrolled', 'Status'],
        rows: courses.map(c => [
          c.name,
          c.streamName ?? 'Unassigned',
          String(c.subjectCount),
          String(c.batchCount),
          String(c.enrolledCount),
          c.active ? 'Active' : 'Inactive'
        ]),
        filterSummary: `${courses.length} courses`
      })
    } else {
      exportTablePdf({
        filename: `tsa-batches-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: 'Batches Directory Report',
        branchName: currentBranch?.name || 'The Scholar Coaching Academy',
        headers: ['Batch Name', 'Parent Course', 'Schedule', 'Enrolled', 'Capacity', 'Status'],
        rows: batches.map(b => [
          b.name,
          b.courseName,
          b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : 'N/A',
          String(b.enrolledCount),
          capacityLabel(b),
          b.active ? 'Active' : 'Inactive'
        ]),
        filterSummary: `${batches.length} batches`
      })
    }
  }
  const viewing = dialog?.type === 'view' || dialog?.type?.endsWith('-view')
  const dialogEntity = dialog?.type?.split('-')[0]
  const entityLabel = { stream: 'Academic Stream', course: 'Course', batch: 'Batch', subject: 'Subject' }[dialogEntity] ?? (tab === 'courses' ? 'Course' : 'Batch')
  return <DashboardLayout><main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
    {canManage && <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-xs" onClick={() => setDialog({ type: 'demo-setup' })}><FlaskConical size={15} aria-hidden="true" />Set Up QA Demo</Button><Button size="sm" className="h-9 gap-1.5 shadow-sm" onClick={() => setDialog({ type: tab === 'courses' ? 'course-form' : 'batch-form' })} disabled={tab === 'batches' && courses.length === 0}><Plus size={15} aria-hidden="true" />Add {tab === 'courses' ? 'Course' : 'Batch'}</Button></div>}
    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium">{message}</p>}
    <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
    <Card className="order-2 overflow-hidden border border-border/80 shadow-xs"><CardHeader className="border-b border-border/60 bg-slate-50/60 p-3.5"><div className="flex items-start justify-between gap-2"><div><CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground"><GraduationCap size={17} className="text-primary" />Academic Portfolios</CardTitle><p className="mt-0.5 text-xs text-muted-foreground">Linked courses, subjects and batches.</p></div>{canManage&&<Button size="sm" aria-label="Add Stream" className="h-7 px-2 text-xs gap-1" onClick={()=>openDialog({type:'stream-form'})}><Plus size={13}/>Add Stream</Button>}</div></CardHeader><CardContent className="p-3">{academicPortfolios.length===0?<p className="rounded-xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground">No streams configured. Legacy courses remain unassigned.</p>:<div className={`grid gap-2.5 pr-1 ${academicPortfolios.length>4?'max-h-[560px] overflow-y-auto overscroll-contain':''}`}>{academicPortfolios.map(item=><article key={item.id} className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition hover:border-primary/40"><div className="h-0.5 bg-primary"/><div className="p-3"><div className="flex items-start justify-between gap-2"><button type="button" onClick={()=>openDialog({type:'stream-view',item})} className="min-w-0 text-left focus-visible:outline-2 focus-visible:outline-ring"><span className="block truncate text-sm font-semibold text-foreground">{item.name}</span><span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.active?'bg-emerald-50 text-emerald-700 border border-emerald-200/60':'bg-slate-100 text-slate-600'}`}><span className={`size-1 rounded-full ${item.active?'bg-emerald-600':'bg-slate-400'}`}/>{item.active?'Active':'Inactive'}</span></button><ActionMenu item={item} canManage={canManage} entity="stream" onAction={openDialog}/></div><div className="mt-2.5 grid grid-cols-3 divide-x divide-border/60 rounded-lg bg-slate-50/80 border border-border/50 py-2 text-center"><Metric value={item.courses.length} label="Courses"/><Metric value={item.subjectCount} label="Subjects"/><Metric value={item.batchCount} label="Batches"/></div><div className="mt-2.5"><p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Linked courses</p>{item.courses.length?<div className="mt-1.5 flex flex-wrap gap-1">{item.courses.map(course=><button key={course.id} type="button" onClick={()=>openDialog({type:'view',item:course})} className="inline-flex max-w-full items-center gap-1 rounded-md border border-border/80 bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"><span className="truncate">{course.name}</span><ArrowRight size={10} className="text-muted-foreground"/></button>)}</div>:<p className="mt-1 text-[10px] text-muted-foreground">No course linked yet.</p>}</div></div></article>)}</div>}</CardContent></Card>
    <div className="order-1 grid min-w-0 gap-4"><Card className="min-w-0 overflow-visible border border-border/80 shadow-xs"><CardHeader className="border-b border-border/60 bg-slate-50/60 p-3.5"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground"><ListChecks size={17} className="text-primary"/>Course Subjects</CardTitle><p className="mt-0.5 text-xs text-muted-foreground">Parent course, academic stream, fee and status.</p></div><div className="flex items-center gap-2"><TableToolbarActions onRefresh={() => setReload(v => v + 1)} showColumns={false} onPrint={() => window.print()} onExportCsv={exportSubjects} onExportPdf={exportSubjectsPdf} />{canManage&&<Button size="sm" className="h-7 px-2.5 text-xs gap-1" disabled={!courses.length} onClick={()=>openDialog({type:'subject-form'})}><Plus size={13}/>Add Subject</Button>}</div></div></CardHeader><CardContent className="p-0">{subjects.length===0?<p className="p-8 text-center text-xs text-muted-foreground">No course subjects configured.</p>:<><table className="w-full table-fixed text-left text-xs"><thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"><tr><th className="w-[18%] px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Subject</th><th className="w-[22%] px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Parent course</th><th className="w-[20%] px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Academic stream</th><th className="w-[17%] px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Fee</th><th className="w-[13%] px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Status</th><th className="w-[10%] px-2 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">Actions</th></tr></thead><tbody className="divide-y divide-border/50">{visibleSubjects.map(item=>{const course=courses.find(value=>value.id===item.courseId);return <tr key={item.id} className="hover:bg-[#F9EBEE]/20 transition-colors"><td className="break-words px-3 py-2.5 font-semibold text-foreground text-xs">{item.name}</td><td className="break-words px-3 py-2.5 text-xs font-medium text-slate-700">{item.courseName}</td><td className="break-words px-3 py-2.5 text-xs text-muted-foreground">{course?.streamName??'Unassigned'}</td><td className="break-words px-3 py-2.5 font-semibold tabular-nums text-xs text-foreground">{Number.isFinite(item.feeAmount)?`PKR ${item.feeAmount.toLocaleString('en-PK')}`:'Not configured'}</td><td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.active?'bg-emerald-50 text-emerald-700 border border-emerald-200/60':'bg-slate-100 text-slate-600'}`}>{item.active?'Active':'Inactive'}</span></td><td className="px-2 py-2.5 text-right"><ActionMenu item={item} canManage={canManage} entity="subject" onAction={openDialog}/></td></tr>})}</tbody></table><Pagination label="Subjects" page={subjectSafePage} rows={subjectRows} total={subjects.length} onPage={setSubjectPage} onRows={value=>{setSubjectRows(value);setSubjectPage(1)}}/></>}</CardContent></Card>
<div role="tablist" aria-label="Academic directories" className="flex w-fit rounded-lg border border-border/70 bg-muted/40 p-0.5"><Button role="tab" aria-selected={tab === 'courses'} size="sm" className="h-8 px-3 text-xs gap-1.5" variant={tab === 'courses' ? 'default' : 'ghost'} onClick={() => { setTab('courses'); setSearch(''); setDirectoryPage(1) }}><BookOpen size={15} />Courses</Button><Button role="tab" aria-selected={tab === 'batches'} size="sm" className="h-8 px-3 text-xs gap-1.5" variant={tab === 'batches' ? 'default' : 'ghost'} onClick={() => { setTab('batches'); setSearch(''); setDirectoryPage(1) }}><Layers3 size={15} />Batches</Button></div>
    <Card className="overflow-visible border border-border/80 shadow-xs"><CardHeader className="border-b border-border/60 bg-slate-50/50 p-3.5"><div className="flex flex-col gap-2.5 md:flex-row md:items-center"><label className="relative flex-1"><span className="sr-only">Search {tab}</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9 h-9 text-xs" type="search" placeholder={`Search ${tab}...`} value={search} onChange={event => { setSearch(event.target.value); setDirectoryPage(1) }} /></label>{tab === 'batches' && <select aria-label="Filter batches by course" className="h-9 rounded-lg border border-input bg-background px-3 text-xs shadow-xs focus:ring-1 focus:ring-ring" value={courseFilter} onChange={event => { setCourseFilter(event.target.value); setDirectoryPage(1) }}><option value="all">All courses</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select>}<select aria-label={`Sort ${tab}`} className="h-9 rounded-lg border border-input bg-background px-3 text-xs shadow-xs focus:ring-1 focus:ring-ring" value={sort} onChange={event => { setSort(event.target.value); setDirectoryPage(1) }}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select><TableToolbarActions onRefresh={() => setReload(v => v + 1)} showColumns={false} onPrint={() => window.print()} onExportCsv={exportCoursesBatches} onExportPdf={exportCoursesBatchesPdf} /></div></CardHeader><CardContent className="p-0">
      {!data && !error && <div role="status" className="flex items-center justify-center gap-2 p-12 text-muted-foreground"><Loader2 size={24} className="animate-spin text-primary motion-reduce:animate-none" /><span className="text-sm">Loading {tab}...</span></div>}
      {error && <div className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle size={28} className="text-destructive" /><p role="alert" className="text-sm font-medium text-destructive">Unable to load Courses &amp; Batches. {error}</p><Button variant="outline" size="sm" onClick={() => setReload(value => value + 1)}>Retry</Button></div>}
      {data && visible.length === 0 && <div className="p-12 text-center"><p className="font-semibold text-sm">No {tab} found</p><p className="mt-1 text-xs text-muted-foreground">{search || courseFilter !== 'all' ? 'Change or clear the current filters.' : `No ${tab} are saved for this branch.`}</p></div>}
      {data && visible.length > 0 && <><div className="hidden md:block"><table className="w-full table-fixed text-left text-xs"><colgroup><col className="w-[24%]"/><col className="w-[22%]"/><col className="w-[20%]"/><col className="w-[9%]"/><col className="w-[17%]"/><col className="w-[8%]"/></colgroup><thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"><tr><th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Name</th><th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">{tab === 'courses' ? 'Academic stream' : 'Parent course'}</th><th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">{tab === 'courses' ? 'Subjects / Batches' : 'Schedule'}</th><th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Enrolled</th><th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Capacity</th><th className="px-2 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">Actions</th></tr></thead><tbody className="divide-y divide-border/50">{visibleDirectory.map(item => <tr key={item.id} tabIndex={0} className="cursor-pointer hover:bg-[#F9EBEE]/20 transition-colors focus-visible:outline-2 focus-visible:outline-ring" onClick={() => openDialog({ type: 'view', item })} onKeyDown={event => { if (event.key === 'Enter') openDialog({ type: 'view', item }) }}><td className="truncate px-3 py-2.5 font-semibold text-foreground text-xs">{item.name}</td><td className="truncate px-3 py-2.5 text-xs"><span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium text-slate-700">{tab === 'courses' ? item.streamName : item.courseName}</span></td><td className="px-3 py-2.5 text-xs text-muted-foreground">{tab === 'courses' ? `${item.subjectCount} subjects · ${item.batchCount} batches` : <div className="flex flex-col gap-0.5"><span>{item.startTime&&item.endTime?`${item.startTime} – ${item.endTime}`:'Not configured'}</span>{item.teachers?.length > 0 ? <span className="inline-flex w-fit items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"><User size={10} className="text-muted-foreground" />{item.teachers.map(t => t.name).join(', ')}</span> : <span className="text-[10px] text-muted-foreground">No faculty assigned</span>}</div>}</td><td className="truncate px-3 py-2.5 text-xs font-semibold tabular-nums text-foreground">{item.enrolledCount}</td><td className="truncate px-3 py-2.5 text-xs text-muted-foreground">{tab === 'batches' ? capacityLabel(item) : 'Not applicable'}</td><td className="px-2 py-2.5 text-right"><ActionMenu item={item} canManage={canManage} entity={tab === "courses" ? "course" : "batch"} onAction={openDialog} /></td></tr>)}</tbody></table></div>
      <div className="grid gap-3 p-3.5 md:hidden">{visibleDirectory.map(item => <article key={item.id} className="relative rounded-xl border border-border/80 bg-card p-3.5 text-left shadow-xs"><button type="button" className="w-full pr-10 text-left focus-visible:outline-2 focus-visible:outline-ring" onClick={() => openDialog({ type: 'view', item })}><span className="font-semibold text-sm text-foreground">{item.name}</span><span className="mt-1.5 block text-xs text-muted-foreground">{item.courseName ?? `${item.batchCount} batches`} · {item.enrolledCount} enrolled</span><span className="mt-1 block text-xs font-medium text-slate-600">{tab === 'batches' ? <>{capacityLabel(item)}{item.teachers?.length > 0 && ` · ${item.teachers.map(t => t.name).join(', ')}`}</> : `${item.batchCount} saved batches`}</span></button><span className="absolute right-2 top-2"><ActionMenu item={item} canManage={canManage} entity={tab === 'courses' ? 'course' : 'batch'} onAction={openDialog} labelSuffix=" on mobile"/></span></article>)}</div><Pagination label="Directory" page={directorySafePage} rows={directoryRows} total={visible.length} onPage={setDirectoryPage} onRows={value=>{setDirectoryRows(value);setDirectoryPage(1)}}/></>}
    </CardContent></Card></div></section>
    {tab === 'batches' && data && <section className="grid gap-4 lg:grid-cols-3"><Card><CardHeader><CardTitle className="flex items-center gap-1.5"><CalendarDays size={18} />Weekly timetable</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No saved timetable sessions. Schedule editing is deferred until day/time, teacher, room and overlap policies are approved.</p></CardContent></Card><Card><CardHeader><CardTitle>Capacity</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Actual active enrollments are shown per batch. Capacity is not configured, so remaining seats are not calculated.</p></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-1.5"><UsersRound size={18} />Assignments</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No verified teacher assignment records exist. Students are counted only from saved active enrollments.</p></CardContent></Card></section>}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open && !demoBusy && !deleteBusy) { setDialog(null); setDeleteError('') } }}><DialogContent className="max-w-xl"><DialogTitle>{viewing ? dialog.item.name : dialog?.type === 'demo-setup' ? 'Set Up Optional QA Demo' : dialog?.type?.endsWith('-delete') ? `Delete ${entityLabel}` : `${dialog?.item ? 'Edit' : 'Add'} ${entityLabel}`}</DialogTitle><DialogDescription>{viewing ? 'Saved branch-scoped DEMO details.' : dialog?.type === 'demo-setup' ? 'Confirmation-gated fictional records for an isolated owner demonstration.' : dialog?.type?.endsWith('-delete') ? 'This action is permanent and is refused when linked records exist.' : 'Changes persist in the centralized browser-local mock database.'}</DialogDescription>
      {dialog?.type === 'course-form' && <CourseForm course={dialog.item} streams={streams} branchId={branchId} onSaved={record => saved(record, 'Course')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'batch-form' && <BatchForm batch={dialog.item} courses={courses} branchId={branchId} onSaved={record => saved(record, 'Batch')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'stream-form' && <AcademicRecordForm type="stream" item={dialog.item} branchId={branchId} onSaved={record => saved(record, 'Stream')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'subject-form' && <AcademicRecordForm type="subject" item={dialog.item} courses={courses} branchId={branchId} onSaved={record => saved(record, 'Subject')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'demo-setup' && <div className="space-y-4"><p className="text-sm">This explicit action adds clearly named fictional QA records to <strong>the active branch</strong>: one stream, one course, Morning/Evening batches, three PKR 15,000 subjects, Student A paid in full and Student B partially paid.</p><p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Use this in a disposable browser profile. Existing records are never deleted or overwritten, and running it again will not duplicate the QA workflow.</p><div className="flex justify-end gap-2"><Button variant="outline" disabled={demoBusy} onClick={()=>setDialog(null)}>Cancel</Button><Button disabled={demoBusy} onClick={setupDemo}>{demoBusy?'Setting up QA demo…':'Confirm QA Demo Setup'}</Button></div></div>}
      {dialog?.type?.endsWith('-delete') && <div className="space-y-4"><p className="text-sm">Delete <strong>{dialog.item.name}</strong>? Linked records are protected and will never be removed automatically.</p>{deleteError&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={deleteBusy} onClick={()=>setDialog(null)}>Cancel</Button><Button variant="destructive" disabled={deleteBusy} onClick={deleteRecord}>{deleteBusy?'Deleting…':'Delete permanently'}</Button></div></div>}
      {viewing && <div className="grid gap-4 sm:grid-cols-2"><Detail label="Name" value={dialog.item.name} /><Detail label="Type" value={entityLabel} /><Detail label="Course" value={dialog.item.courseName ?? (dialogEntity === 'course' ? 'Course record' : 'Not applicable')} /><Detail label="Status" value={dialog.item.active === false ? 'Inactive' : 'Active'} />{dialogEntity === 'subject'&&<Detail label="Configured fee" value={Number.isFinite(dialog.item.feeAmount)?`PKR ${dialog.item.feeAmount.toLocaleString('en-PK')}`:'Not configured'} />}{['course','batch'].includes(dialogEntity)&&<Detail label="Active enrollments" value={dialog.item.enrolledCount} />}{dialogEntity === 'batch'&&<Detail label="Capacity" value={capacityLabel(dialog.item)} />}{dialogEntity === 'batch' && dialog.item.teachers?.length > 0 && <Detail label="Assigned Faculty" value={dialog.item.teachers.map(t => t.name).join(', ')} />}{canManage && <div className="flex justify-end sm:col-span-2"><Button onClick={() => openDialog({ type: `${dialogEntity}-form`, item: dialog.item })}>Edit {entityLabel}</Button></div>}</div>}
    </DialogContent></Dialog>
    {selectedCourseForDetails && (
      <CourseDetailsModal
        open={!!selectedCourseForDetails}
        onClose={() => setSelectedCourseForDetails(null)}
        course={selectedCourseForDetails}
        allBatches={batches}
        allSubjects={subjects}
        branchId={branchId}
        canManage={canManage}
        onAssignFaculty={(courseItem, batchId, subjectId) => setAssignModalConfig({ open: true, course: courseItem || selectedCourseForDetails, initialBatchId: batchId || null, initialSubjectId: subjectId || null })}
      />
    )}
    {assignModalConfig && (
      <AssignFacultyModal
        open={!!assignModalConfig}
        onClose={() => setAssignModalConfig(null)}
        course={assignModalConfig.course}
        assignments={assignModalConfig.course?.assignments || []}
        initialBatchId={assignModalConfig.initialBatchId}
        initialSubjectId={assignModalConfig.initialSubjectId}
        teachers={teachers}
        batches={batches}
        subjects={subjects}
        branchId={branchId}
        onAssigned={() => {
          setSelectedCourseForDetails(null)
          setReload(v => v + 1)
          setAssignModalConfig(null)
          setMessage('Faculty assignment saved successfully.')
        }}
      />
    )}
  </main></DashboardLayout>
}

function Detail({ label, value }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words font-medium">{value}</p></div> }

function Pagination({ label, page, rows, total, onPage, onRows }) {
  const pages = Math.max(1, Math.ceil(total / rows))
  const safePage = Math.min(page, pages)
  const start = total === 0 ? 0 : (safePage - 1) * rows + 1
  const end = Math.min(safePage * rows, total)
  return <div className="flex flex-wrap items-center justify-between gap-1.5 border-t bg-slate-50/70 px-2.5 py-1.5 text-[9px] text-muted-foreground sm:text-[10px]"><div className="flex items-center gap-1.5"><label className="flex items-center gap-1.5">Rows per page:<select aria-label={`${label} rows per page`} className="h-7 rounded border bg-white px-1.5 text-[10px] text-foreground" value={rows} onChange={event=>onRows(Number(event.target.value))}>{[5,10,25,50].map(value=><option key={value} value={value}>{value}</option>)}</select></label><span>{start}–{end} of {total}</span></div><div className="flex items-center gap-1"><button type="button" aria-label={`Previous ${label.toLowerCase()} page`} disabled={safePage===1} onClick={()=>onPage(safePage-1)} className="grid size-7 place-items-center rounded border bg-white disabled:opacity-40"><ChevronLeft size={13}/></button>{Array.from({length:pages},(_,index)=>index+1).map(value=><button key={value} type="button" aria-label={`${label} page ${value}`} aria-current={safePage===value?'page':undefined} onClick={()=>onPage(value)} className={`grid size-7 place-items-center rounded border text-[10px] font-medium ${safePage===value?'border-primary bg-primary text-primary-foreground':'bg-white text-foreground'}`}>{value}</button>)}<button type="button" aria-label={`Next ${label.toLowerCase()} page`} disabled={safePage===pages} onClick={()=>onPage(safePage+1)} className="grid size-7 place-items-center rounded border bg-white disabled:opacity-40"><ChevronRight size={13}/></button></div></div>
}

function Metric({ value, label }) { return <div><strong className="block text-sm text-slate-950">{value}</strong><span className="text-[9px] text-muted-foreground">{label}</span></div> }

function ActionMenu({ item, entity, canManage, onAction, labelSuffix='' }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  const act = (event, type) => { event.preventDefault(); event.stopPropagation(); setOpen(false); onAction({ type, item }) }
  return <div ref={root} className="relative inline-block" onClick={event=>event.stopPropagation()}><button type="button" aria-label={`Actions for ${item.name}${labelSuffix}`} aria-haspopup="menu" aria-expanded={open} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" onClick={()=>setOpen(value=>!value)}><MoreVertical size={18} aria-hidden="true" /></button>{open&&<div role="menu" aria-label={`${entity} actions for ${item.name}${labelSuffix}`} className="absolute right-0 z-50 mt-1 grid w-28 rounded-md border bg-card p-1 text-left text-xs shadow-lg" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false)}}}><button role="menuitem" className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs hover:bg-muted" onClick={event=>act(event,entity==='course'||entity==='batch'?'view':`${entity}-view`)}><Eye size={13}/>View</button>{canManage&&<><button role="menuitem" className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs hover:bg-muted" onClick={event=>act(event,`${entity}-form`)}><Pencil size={13}/>Edit</button><button role="menuitem" className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={event=>act(event,`${entity}-delete`)}><Trash2 size={13}/>Delete</button></>}</div>}</div>
}
