import { formatBatchDuration } from '../../utils/batchDuration.js'
import { formatTimeRange, formatTime } from '../../utils/timeFormat.js'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
/**
 * Purpose: Will define Courses Batches Page for the CoursesBatches area of the Academy frontend.
 * Module: CoursesBatches
 * Status: Planned â€” functionality not implemented.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clock, Eye, GraduationCap, Layers3, ListChecks, Loader2, MoreVertical, Pencil, Plus, Search, Trash2, User } from 'lucide-react'
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
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { facultyService } from '../../services/facultyService.js'
import CourseDetailsModal from '../../components/CoursesBatches/CourseDetailsModal.jsx'
import AssignFacultyModal from '../../components/CoursesBatches/AssignFacultyModal.jsx'
import CustomSelect from '../../components/ui/CustomSelect.jsx'


export default function CoursesBatchesPage() {
  const { branchId, currentBranch } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.COURSES_MANAGE)
  const [tab, setTab] = useState('courses')
  const [data, setData] = useState(() => peekPageResource('academics'))
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [streamFilter, setStreamFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [subjectCourseFilter, setSubjectCourseFilter] = useState('all')
  const [subjectStreamFilter, setSubjectStreamFilter] = useState('all')
  const [subjectPage, setSubjectPage] = useState(1)
  const [subjectRows, setSubjectRows] = useState(10)
  const [directoryPage, setDirectoryPage] = useState(1)
  const [directoryRows, setDirectoryRows] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(0)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [teachers, setTeachers] = useState([])
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null)
  const [assignModalConfig, setAssignModalConfig] = useState(null)
  const portfolioScrollRef = useRef(null)
  const scrollPortfolios = (direction) => {
    if (portfolioScrollRef.current) {
      const scrollAmount = 300
      portfolioScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }
  useEffect(() => {
    let active = true
    const loadVersion = capturePageVersion()
    Promise.resolve().then(() => { if (active) { if (!peekPageResource('academics')) setData(null); setError('') } })
    academicService.overview({ branchId }).then(result => { if (active) setData(rememberPageResource('academics', { ...result, branchId }, loadVersion)) }).catch(failure => { if (active) setError(failure.message) })
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
  const visibleCourses = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase()
    return courses
      .filter(item => {
        const matchesSearch = !needle || item.name.toLocaleLowerCase().includes(needle) || (item.streamName ?? '').toLocaleLowerCase().includes(needle)
        const matchesStream = streamFilter === 'all' || item.streamId === streamFilter
        const matchesCourse = courseFilter === 'all' || item.id === courseFilter
        return matchesSearch && matchesStream && matchesCourse
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [courses, search, streamFilter, courseFilter])

  const visibleBatches = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase()
    return batches
      .filter(item => {
        const matchesSearch = !needle || `${item.name} ${item.courseName ?? ''}`.toLocaleLowerCase().includes(needle)
        const matchesCourse = courseFilter === 'all' || item.courseId === courseFilter
        const parentCourse = courses.find(c => c.id === item.courseId)
        const matchesStream = streamFilter === 'all' || parentCourse?.streamId === streamFilter
        const matchesBatch = batchFilter === 'all' || item.id === batchFilter
        return matchesSearch && matchesCourse && matchesStream && matchesBatch
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [batches, courses, search, courseFilter, streamFilter, batchFilter])

  const filteredSubjects = useMemo(() => {
    const needle = subjectSearch.trim().toLocaleLowerCase()
    return subjects
      .filter(item => {
        const parentCourse = courses.find(c => c.id === item.courseId)
        const matchesSearch = !needle || `${item.name} ${item.courseName ?? ''} ${parentCourse?.streamName ?? ''}`.toLocaleLowerCase().includes(needle)
        const matchesCourse = subjectCourseFilter === 'all' || item.courseId === subjectCourseFilter
        const matchesStream = subjectStreamFilter === 'all' || parentCourse?.streamId === subjectStreamFilter
        return matchesSearch && matchesCourse && matchesStream
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [subjects, courses, subjectSearch, subjectCourseFilter, subjectStreamFilter])

  const visible = tab === 'courses' ? visibleCourses : visibleBatches
  const subjectSafePage = Math.min(subjectPage, Math.max(1, Math.ceil(filteredSubjects.length / subjectRows)))
  const directorySafePage = Math.min(directoryPage, Math.max(1, Math.ceil(visible.length / directoryRows)))
  const visibleSubjects = filteredSubjects.slice((subjectSafePage - 1) * subjectRows, subjectSafePage * subjectRows)
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
        ['Batch Name', 'Parent Course', 'Duration', 'Start Time', 'End Time', 'Enrolled Students', 'Capacity', 'Status'],
        batches.map(b => [
          b.name,
          b.courseName,
          formatBatchDuration(b.durationMonths),
          formatTime(b.startTime, 'N/A'),
          formatTime(b.endTime, 'N/A'),
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
        headers: ['Batch Name', 'Parent Course', 'Duration', 'Schedule', 'Enrolled', 'Capacity', 'Status'],
        rows: batches.map(b => [
          b.name,
          b.courseName,
          formatBatchDuration(b.durationMonths),
          b.startTime && b.endTime ? formatTimeRange(b.startTime, b.endTime) : 'N/A',
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
    <h1 className="text-2xl font-bold tracking-tight text-foreground">Courses &amp; Batches</h1>

    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium">{message}</p>}
    <Card className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="border-b border-border/60 bg-slate-50/60 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap size={20} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">Academic Portfolios</CardTitle>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {academicPortfolios.length} {academicPortfolios.length === 1 ? 'Stream' : 'Streams'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Core academic streams, mapped courses, subjects, and batch allocations.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {academicPortfolios.length > 4 && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  aria-label="Previous streams"
                  onClick={() => scrollPortfolios('left')}
                  className="grid size-7 place-items-center rounded-lg border border-border/80 bg-white text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors shadow-2xs"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Next streams"
                  onClick={() => scrollPortfolios('right')}
                  className="grid size-7 place-items-center rounded-lg border border-border/80 bg-white text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors shadow-2xs"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
            {canManage && (
              <Button size="sm" aria-label="Add Stream" className="h-8 px-3 text-xs gap-1.5 shadow-xs" onClick={() => openDialog({ type: 'stream-form' })}>
                <Plus size={14} />Add Stream
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-4">
        {academicPortfolios.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            No streams configured. Legacy courses remain unassigned.
          </p>
        ) : academicPortfolios.length <= 4 ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {academicPortfolios.map((item, index) => (
              <PortfolioCard key={item.id} item={item} index={index} canManage={canManage} openDialog={openDialog} />
            ))}
          </div>
        ) : (
          <div
            ref={portfolioScrollRef}
            className="flex items-stretch gap-3.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {academicPortfolios.map((item, index) => (
              <div key={item.id} className="w-[calc(25%-10.5px)] min-w-[250px] shrink-0">
                <PortfolioCard item={item} index={index} canManage={canManage} openDialog={openDialog} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

<div className="flex flex-wrap items-center justify-between gap-2"><div role="tablist" aria-label="Academic directories" className="flex w-fit rounded-lg border border-border/70 bg-muted/40 p-0.5"><Button role="tab" aria-selected={tab === 'courses'} size="sm" className="h-8 px-3 text-xs gap-1.5" variant={tab === 'courses' ? 'default' : 'ghost'} onClick={() => { setTab('courses'); setSearch(''); setCourseFilter('all'); setStreamFilter('all'); setBatchFilter('all'); setDirectoryPage(1) }}><BookOpen size={15} />Courses</Button><Button role="tab" aria-selected={tab === 'batches'} size="sm" className="h-8 px-3 text-xs gap-1.5" variant={tab === 'batches' ? 'default' : 'ghost'} onClick={() => { setTab('batches'); setSearch(''); setCourseFilter('all'); setStreamFilter('all'); setBatchFilter('all'); setDirectoryPage(1) }}><Layers3 size={15} />Batches</Button><Button role="tab" aria-selected={tab === 'subjects'} size="sm" className="h-8 px-3 text-xs gap-1.5" variant={tab === 'subjects' ? 'default' : 'ghost'} onClick={() => { setTab('subjects'); setSubjectSearch(''); setSubjectCourseFilter('all'); setSubjectStreamFilter('all'); setSubjectPage(1) }}><ListChecks size={15} />Subjects</Button></div>{canManage && <Button size="sm" className="h-8 gap-1.5 text-xs shadow-sm" onClick={() => setDialog({ type: tab === 'subjects' ? 'subject-form' : tab === 'courses' ? 'course-form' : 'batch-form' })} disabled={tab !== 'courses' && courses.length === 0}><Plus size={14} aria-hidden="true" />Add {tab === 'subjects' ? 'Subject' : tab === 'courses' ? 'Course' : 'Batch'}</Button>}</div>
    {tab === 'subjects' ? (
      <Card className="min-w-0 overflow-visible border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 bg-slate-50/50 p-3.5">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search subjects</span>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 h-9 text-xs"
                type="search"
                aria-label="Search subjects"
                placeholder="Search subjects..."
                value={subjectSearch}
                onChange={event => { setSubjectSearch(event.target.value); setSubjectPage(1) }}
              />
            </label>
            <CustomSelect
              aria-label="Filter subjects by course"
              value={subjectCourseFilter}
              onChange={val => { setSubjectCourseFilter(val); setSubjectPage(1) }}
              options={[
                { value: 'all', label: 'All courses' },
                ...courses.map(course => ({ value: course.id, label: course.name })),
              ]}
            />
            <CustomSelect
              aria-label="Filter subjects by academic stream"
              value={subjectStreamFilter}
              onChange={val => { setSubjectStreamFilter(val); setSubjectPage(1) }}
              options={[
                { value: 'all', label: 'All academic streams' },
                ...streams.map(stream => ({ value: stream.id, label: stream.name })),
              ]}
            />
            <TableToolbarActions
              onRefresh={() => setReload(v => v + 1)}
              showColumns={false}
              onPrint={() => window.print()}
              onExportCsv={exportSubjects}
              onExportPdf={exportSubjectsPdf}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-sm">No subjects found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {subjectSearch || subjectCourseFilter !== 'all' || subjectStreamFilter !== 'all'
                  ? 'Change or clear the current filters.'
                  : 'No course subjects configured for this branch.'}
              </p>
            </div>
          ) : (
            <>
              <table className="academic-directory-table w-full table-fixed text-left text-xs">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Subject name</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Course</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Academic stream</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Tuition fee</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Status</th>
                    <th className="px-2 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {visibleSubjects.map(item => {
                    const course = courses.find(value => value.id === item.courseId);
                    return (
                      <tr key={item.id} className="hover:bg-[#F9EBEE]/20 transition-colors">
                        <td className="break-words px-3 py-3 font-bold text-slate-900 text-xs">{item.name}</td>
                        <td className="px-3 py-3 text-xs"><AcademicTag identity={item.courseId} label={item.courseName}/></td>
                        <td className="truncate px-3 py-3 text-xs">
                          <AcademicTag identity={course?.streamId} label={course?.streamName}/>
                        </td>
                        <td className="break-words px-3 py-3 font-bold tabular-nums text-xs text-slate-900">
                          {Number.isFinite(item.feeAmount) ? `PKR ${item.feeAmount.toLocaleString('en-PK')}` : 'Not configured'}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600'}`}>
                            <span className={`size-1.5 rounded-full ${item.active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ActionMenu item={item} canManage={canManage} entity="subject" onAction={openDialog} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination label="Subjects" page={subjectSafePage} rows={subjectRows} total={filteredSubjects.length} onPage={setSubjectPage} onRows={value => { setSubjectRows(value); setSubjectPage(1) }} />
            </>
          )}
        </CardContent>
      </Card>
    ) : (
      <Card className="overflow-visible border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 bg-slate-50/50 p-3.5">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search {tab}</span>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 h-9 text-xs"
                type="search"
                aria-label={`Search ${tab}`}
                placeholder={`Search ${tab}...`}
                value={search}
                onChange={event => { setSearch(event.target.value); setDirectoryPage(1) }}
              />
            </label>

            {tab === 'courses' && (
              <>
                <CustomSelect
                  aria-label="Filter courses by academic stream"
                  value={streamFilter}
                  onChange={val => { setStreamFilter(val); setDirectoryPage(1) }}
                  options={[
                    { value: 'all', label: 'All academic streams' },
                    ...streams.map(stream => ({ value: stream.id, label: stream.name })),
                  ]}
                />
                <CustomSelect
                  aria-label="Filter courses by name"
                  value={courseFilter}
                  onChange={val => { setCourseFilter(val); setDirectoryPage(1) }}
                  options={[
                    { value: 'all', label: 'All courses' },
                    ...courses.map(course => ({ value: course.id, label: course.name })),
                  ]}
                />
              </>
            )}

            {tab === 'batches' && (
              <>
                <CustomSelect
                  aria-label="Filter batches by course"
                  value={courseFilter}
                  onChange={val => { setCourseFilter(val); setDirectoryPage(1) }}
                  options={[
                    { value: 'all', label: 'All courses' },
                    ...courses.map(course => ({ value: course.id, label: course.name })),
                  ]}
                />
                <CustomSelect
                  aria-label="Filter batches by academic stream"
                  value={streamFilter}
                  onChange={val => { setStreamFilter(val); setDirectoryPage(1) }}
                  options={[
                    { value: 'all', label: 'All academic streams' },
                    ...streams.map(stream => ({ value: stream.id, label: stream.name })),
                  ]}
                />
                <CustomSelect
                  aria-label="Filter batches"
                  value={batchFilter}
                  onChange={val => { setBatchFilter(val); setDirectoryPage(1) }}
                  options={[
                    { value: 'all', label: 'All batches' },
                    ...batches.map(batch => ({ value: batch.id, label: batch.name })),
                  ]}
                />
              </>
            )}

            <TableToolbarActions
              onRefresh={() => setReload(v => v + 1)}
              showColumns={false}
              onPrint={() => window.print()}
              onExportCsv={exportCoursesBatches}
              onExportPdf={exportCoursesBatchesPdf}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!data && !error && (
            <div role="status" className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
              <Loader2 size={24} className="animate-spin text-primary motion-reduce:animate-none" />
              <span className="text-sm">Loading {tab}...</span>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <AlertCircle size={28} className="text-destructive" />
              <p role="alert" className="text-sm font-medium text-destructive">Unable to load Courses &amp; Batches. {error}</p>
              <Button variant="outline" size="sm" onClick={() => setReload(value => value + 1)}>Retry</Button>
            </div>
          )}
          {data && visible.length === 0 && (
            <div className="p-12 text-center">
              <p className="font-semibold text-sm">No {tab} found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search || courseFilter !== 'all' || streamFilter !== 'all' || batchFilter !== 'all'
                  ? 'Change or clear the current filters.'
                  : `No ${tab} are saved for this branch.`}
              </p>
            </div>
          )}

          {data && visible.length > 0 && (
            <>
              <div className="hidden md:block">
                <table className="academic-directory-table w-full table-fixed text-left text-xs">
                  <colgroup>
                    {(tab === 'batches' ? [18, 18, 19, 17, 8, 13, 7] : [24, 22, 22, 10, 14, 8]).map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}
                  </colgroup>
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                        {tab === 'courses' ? 'Course name' : 'Batch name'}
                      </th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                        {tab === 'courses' ? 'Academic stream' : 'Course'}
                      </th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                        {tab === 'courses' ? 'Subjects & Batches' : 'Schedule'}
                      </th>
                      {tab === 'batches' && <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Faculty</th>}
                      <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                        Enrolled
                      </th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                        {tab === 'courses' ? 'Capacity' : 'Seat capacity'}
                      </th>
                      <th className="px-2 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {visibleDirectory.map(item => (
                      <tr
                        key={item.id}
                        tabIndex={0}
                        className="cursor-pointer hover:bg-[#F9EBEE]/20 transition-colors focus-visible:outline-2 focus-visible:outline-ring"
                        onClick={() => openDialog({ type: 'view', item })}
                        onKeyDown={event => { if (event.key === 'Enter') openDialog({ type: 'view', item }) }}
                      >
                        <td className="truncate px-3 py-3 font-bold text-slate-900 text-xs">{item.name}</td>
                        <td className="truncate px-3 py-3 text-xs">
                          <AcademicTag identity={tab === 'courses' ? item.streamId : item.courseId} label={tab === 'courses' ? item.streamName : item.courseName}/>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {tab === 'courses' ? (
                            <span className="text-xs font-medium text-slate-600">
                              {item.subjectCount} subjects · {item.batchCount} batches
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                                <Clock size={12} className="text-primary shrink-0" />
                                {item.shift || (item.startTime && item.endTime ? formatTimeRange(item.startTime, item.endTime) : 'Shift not selected')}
                              </span>
                              <span className="text-[11px] text-slate-600">Duration: {formatBatchDuration(item.durationMonths)}</span>

                            </div>
                          )}
                        </td>
                        {tab === 'batches' && <td className="break-words px-3 py-3 text-xs text-muted-foreground">
                          {item.teachers?.length > 0 ? (
                                <span className="inline-flex w-fit items-center gap-1 rounded bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                                  <User size={10} className="text-muted-foreground shrink-0" />
                                  {item.teachers.map(t => t.name).join(', ')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">No faculty assigned</span>
                              )}
                        </td>}
                        <td className="truncate px-3 py-3 text-xs font-bold tabular-nums text-foreground">
                          <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                            {item.enrolledCount}
                          </span>
                        </td>
                        <td className="truncate px-3 py-3 text-xs text-muted-foreground font-medium">
                          {tab === 'batches' ? capacityLabel(item) : 'Not applicable'}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ActionMenu item={item} canManage={canManage} entity={tab === 'courses' ? 'course' : 'batch'} onAction={openDialog} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-3.5 md:hidden">
                {visibleDirectory.map(item => (
                  <article key={item.id} className="relative rounded-xl border border-border/80 bg-card p-3.5 text-left shadow-2xs">
                    <button type="button" className="w-full pr-10 text-left focus-visible:outline-2 focus-visible:outline-ring" onClick={() => openDialog({ type: 'view', item })}>
                      <span className="font-bold text-sm text-foreground">{item.name}</span>
                      <span className="mt-1.5 block text-xs text-muted-foreground font-medium">
                        {item.courseName ?? `${item.batchCount} batches`} · {item.enrolledCount} enrolled
                      </span>
                      <span className="mt-1 block text-xs font-medium text-slate-600">
                        {tab === 'batches' ? <>{capacityLabel(item)}{item.teachers?.length > 0 && ` · ${item.teachers.map(t => t.name).join(', ')}`}</> : `${item.batchCount} saved batches`}
                      </span>
                    </button>
                    <span className="absolute right-2 top-2">
                      <ActionMenu item={item} canManage={canManage} entity={tab === 'courses' ? 'course' : 'batch'} onAction={openDialog} labelSuffix=" on mobile" />
                    </span>
                  </article>
                ))}
              </div>

              <Pagination
                label="Directory"
                page={directorySafePage}
                rows={directoryRows}
                total={visible.length}
                onPage={setDirectoryPage}
                onRows={value => { setDirectoryRows(value); setDirectoryPage(1) }}
              />
            </>
          )}
        </CardContent>
      </Card>
    )}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open && !deleteBusy) { setDialog(null); setDeleteError('') } }}><DialogContent className="max-w-xl"><DialogTitle>{viewing ? dialog.item.name : dialog?.type?.endsWith('-delete') ? `Delete ${entityLabel}` : `${dialog?.item ? 'Edit' : 'Add'} ${entityLabel}`}</DialogTitle><DialogDescription>{viewing ? 'Saved details for the selected branch.' : dialog?.type?.endsWith('-delete') ? 'This action is permanent and is refused when linked records exist.' : 'Changes are saved for the selected branch.'}</DialogDescription>
      {dialog?.type === 'course-form' && <CourseForm course={dialog.item} streams={streams} branchId={branchId} onSaved={record => saved(record, 'Course')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'batch-form' && <BatchForm batch={dialog.item} courses={courses} branchId={branchId} onSaved={record => saved(record, 'Batch')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'stream-form' && <AcademicRecordForm type="stream" item={dialog.item} branchId={branchId} onSaved={record => saved(record, 'Stream')} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'subject-form' && <AcademicRecordForm type="subject" item={dialog.item} courses={courses} branchId={branchId} onSaved={record => saved(record, 'Subject')} onCancel={() => setDialog(null)} />}

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

function getStreamThemeClass(name = '', index = 0) {
  const lower = name.toLowerCase()
  if (lower.includes('med') || lower.includes('bio') || lower.includes('health') || lower.includes('doctor')) {
    return 'theme-medical'
  }
  if (lower.includes('eng') || lower.includes('ecat') || lower.includes('tech') || lower.includes('math')) {
    return 'theme-engineering'
  }
  if (lower.includes('comp') || lower.includes('cs') || lower.includes('ics') || lower.includes('it') || lower.includes('software')) {
    return 'theme-cs'
  }
  if (lower.includes('comm') || lower.includes('art') || lower.includes('econ') || lower.includes('bba')) {
    return 'theme-commerce'
  }
  const cycle = ['theme-maroon', 'theme-medical', 'theme-engineering', 'theme-cs', 'theme-commerce']
  return cycle[index % cycle.length]
}

function PortfolioCard({ item, index = 0, canManage, openDialog }) {
  const themeClass = getStreamThemeClass(item.name, index)
  return (
    <article className={`academic-portfolio-card ${themeClass} group relative flex h-full flex-col justify-between overflow-hidden p-3.5`}>
      <div className="portfolio-accent-bar absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all" />
      <div>
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => openDialog({ type: 'stream-view', item })}
            className="min-w-0 text-left focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
              {item.name}
            </span>
            <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`size-1.5 rounded-full ${item.active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
              {item.active ? 'Active' : 'Inactive'}
            </span>
          </button>
          <ActionMenu item={item} canManage={canManage} entity="stream" onAction={openDialog} />
        </div>

        <div className="my-2.5 grid grid-cols-3 divide-x divide-slate-200/60 rounded-lg border border-white/80 bg-white/70 backdrop-blur-xs py-2 text-center shadow-2xs">
          <Metric value={item.courses.length} label="Courses" />
          <Metric value={item.subjectCount} label="Subjects" />
          <Metric value={item.batchCount} label="Batches" />
        </div>
      </div>

      <div className="mt-1 border-t border-slate-200/50 pt-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Linked courses</p>
        {item.courses.length ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
            {item.courses.map(course => (
              <button
                key={course.id}
                type="button"
                onClick={() => openDialog({ type: 'view', item: course })}
                className="inline-flex max-w-full shrink-0 items-center gap-1 rounded-md border border-slate-200/80 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <span className="truncate">{course.name}</span>
                <ArrowRight size={10} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-[11px] text-muted-foreground italic">No course linked yet.</p>
        )}
      </div>
    </article>
  )
}

function Metric({ value, label }) { return <div className="px-1"><strong className="block text-base font-bold tabular-nums text-slate-900 leading-tight">{value}</strong><span className="mt-0.5 block text-[10px] font-medium text-slate-500">{label}</span></div> }

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
  if (entity === 'stream' && !canManage) return null
  return <div ref={root} className="relative inline-block" onClick={event=>event.stopPropagation()}><button type="button" aria-label={`Actions for ${item.name}${labelSuffix}`} aria-haspopup="menu" aria-expanded={open} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" onClick={()=>setOpen(value=>!value)}><MoreVertical size={18} aria-hidden="true" /></button>{open&&<div role="menu" aria-label={`${entity} actions for ${item.name}${labelSuffix}`} className="absolute right-0 z-50 mt-1 grid w-max min-w-0 rounded-md border border-border bg-card p-0.5 text-left text-[11px] shadow-lg" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false)}}}>{entity !== 'stream' && <button role="menuitem" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-[11px] hover:bg-muted" onClick={event=>act(event,entity==='course'||entity==='batch'?'view':`${entity}-view`)}><Eye size={13}/>View</button>}{canManage&&<><button role="menuitem" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-[11px] hover:bg-muted" onClick={event=>act(event,`${entity}-form`)}><Pencil size={13}/>Edit</button><button role="menuitem" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1 text-[11px] text-destructive hover:bg-destructive/10" onClick={event=>act(event,`${entity}-delete`)}><Trash2 size={13}/>Delete</button></>}</div>}</div>
}

function AcademicTag({ identity, label }) {
  const value = String(identity || label || '')
  const tone = [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0) % 6
  return <span className={`academic-tag academic-tag-${tone}`} title={label || 'Unassigned'}><span className="academic-tag-dot" aria-hidden="true"/><span className="truncate">{label || 'Unassigned'}</span></span>
}
