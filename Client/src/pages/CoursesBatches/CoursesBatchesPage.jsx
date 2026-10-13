/**
 * Purpose: Will define Courses Batches Page for the CoursesBatches area of the Academy frontend.
 * Module: CoursesBatches
 * Status: Planned — functionality not implemented.
 */
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpen, CalendarDays, Layers3, Loader2, Plus, Search, UsersRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog.jsx'
import { Input } from '../../components/ui/input.jsx'
import CourseForm from '../../components/CoursesBatches/CourseForm.jsx'
import BatchForm from '../../components/CoursesBatches/BatchForm.jsx'
import { academicService } from '../../services/academicService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'

const selectClass = 'min-h-11 rounded-md border border-input bg-background px-3 text-sm'

export default function CoursesBatchesPage() {
  const { branchId } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.COURSES_MANAGE)
  const [tab, setTab] = useState('courses')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [courseFilter, setCourseFilter] = useState('all')
  const [dialog, setDialog] = useState(null)
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    Promise.resolve().then(() => { if (active) { setData(null); setError('') } })
    academicService.overview({ branchId }).then(result => { if (active) setData({ ...result, branchId }) }).catch(failure => { if (active) setError(failure.message) })
    return () => { active = false }
  }, [branchId, reload])
  const courses = useMemo(() => data?.branchId === branchId ? data.courses : [], [data, branchId])
  const batches = useMemo(() => data?.branchId === branchId ? data.batches : [], [data, branchId])
  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase()
    const source = tab === 'courses' ? courses : batches.filter(batch => courseFilter === 'all' || batch.courseId === courseFilter)
    return source.filter(item => `${item.name} ${item.courseName ?? ''}`.toLocaleLowerCase().includes(needle)).sort((a, b) => (sort === 'name-desc' ? -1 : 1) * a.name.localeCompare(b.name))
  }, [tab, courses, batches, search, sort, courseFilter])
  const saved = record => { setDialog(null); setMessage(`${tab === 'courses' ? 'Course' : 'Batch'} “${record.name}” saved.`); setReload(value => value + 1) }
  return <DashboardLayout><main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
    {canManage && <div className="flex justify-end"><Button onClick={() => setDialog({ type: tab === 'courses' ? 'course-form' : 'batch-form' })} disabled={tab === 'batches' && courses.length === 0}><Plus size={17} aria-hidden="true" />Add {tab === 'courses' ? 'Course' : 'Batch'}</Button></div>}
    {message && <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">{message}</p>}
    <div role="tablist" aria-label="Academic directories" className="flex w-fit rounded-xl border bg-card p-1"><Button role="tab" aria-selected={tab === 'courses'} variant={tab === 'courses' ? 'default' : 'ghost'} onClick={() => { setTab('courses'); setSearch('') }}><BookOpen size={17} />Courses</Button><Button role="tab" aria-selected={tab === 'batches'} variant={tab === 'batches' ? 'default' : 'ghost'} onClick={() => { setTab('batches'); setSearch('') }}><Layers3 size={17} />Batches</Button></div>
    <Card><CardHeader className="border-b"><div className="flex flex-col gap-3 md:flex-row md:items-center"><label className="relative flex-1"><span className="sr-only">Search {tab}</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="search" placeholder={`Search ${tab}...`} value={search} onChange={event => setSearch(event.target.value)} /></label>{tab === 'batches' && <select aria-label="Filter batches by course" className={selectClass} value={courseFilter} onChange={event => setCourseFilter(event.target.value)}><option value="all">All courses</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select>}<select aria-label={`Sort ${tab}`} className={selectClass} value={sort} onChange={event => setSort(event.target.value)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></div></CardHeader><CardContent className="p-0">
      {!data && !error && <div role="status" className="flex items-center justify-center gap-2 p-12 text-muted-foreground"><Loader2 className="animate-spin motion-reduce:animate-none" />Loading {tab}...</div>}
      {error && <div className="flex flex-col items-center gap-3 p-10 text-center"><AlertCircle className="text-destructive" /><p role="alert">Unable to load Courses &amp; Batches. {error}</p><Button variant="outline" onClick={() => setReload(value => value + 1)}>Retry</Button></div>}
      {data && visible.length === 0 && <div className="p-12 text-center"><p className="font-semibold">No {tab} found</p><p className="mt-2 text-sm text-muted-foreground">{search || courseFilter !== 'all' ? 'Change or clear the current filters.' : `No ${tab} are saved for this branch.`}</p></div>}
      {data && visible.length > 0 && <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="px-5 py-3">Name</th>{tab === 'batches' && <th className="px-5 py-3">Course</th>}<th className="px-5 py-3">{tab === 'courses' ? 'Batches' : 'Schedule'}</th><th className="px-5 py-3">Enrolled</th><th className="px-5 py-3">Capacity</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y">{visible.map(item => <tr key={item.id} tabIndex={0} className="cursor-pointer hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setDialog({ type: 'view', item })} onKeyDown={event => { if (event.key === 'Enter') setDialog({ type: 'view', item }) }}><td className="px-5 py-4 font-semibold">{item.name}</td>{tab === 'batches' && <td className="px-5 py-4">{item.courseName}</td>}<td className="px-5 py-4">{tab === 'courses' ? item.batchCount : 'Not configured'}</td><td className="px-5 py-4">{item.enrolledCount}</td><td className="px-5 py-4">Not configured</td><td className="px-5 py-4 text-right"><Button variant="ghost" size="sm" onClick={event => { event.stopPropagation(); setDialog({ type: 'view', item }) }}>View</Button>{canManage && <Button variant="ghost" size="sm" onClick={event => { event.stopPropagation(); setDialog({ type: `${tab === 'courses' ? 'course' : 'batch'}-form`, item }) }}>Edit</Button>}</td></tr>)}</tbody></table></div>
      <div className="grid gap-4 p-4 md:hidden">{visible.map(item => <button key={item.id} className="rounded-xl border bg-card p-4 text-left shadow-sm focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setDialog({ type: 'view', item })}><span className="font-semibold">{item.name}</span><span className="mt-2 block text-sm text-muted-foreground">{item.courseName ?? `${item.batchCount} batches`} · {item.enrolledCount} enrolled</span><span className="mt-2 block text-xs">Capacity not configured</span></button>)}</div></>}
    </CardContent></Card>
    {tab === 'batches' && data && <section className="grid gap-4 lg:grid-cols-3"><Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays size={18} />Weekly timetable</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No saved timetable sessions. Schedule editing is deferred until day/time, teacher, room and overlap policies are approved.</p></CardContent></Card><Card><CardHeader><CardTitle>Capacity</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Actual active enrollments are shown per batch. Capacity is not configured, so remaining seats are not calculated.</p></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><UsersRound size={18} />Assignments</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No verified teacher assignment records exist. Students are counted only from saved active enrollments.</p></CardContent></Card></section>}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open) setDialog(null) }}><DialogContent className="max-w-xl"><DialogTitle>{dialog?.type === 'view' ? dialog.item.name : `${dialog?.item ? 'Edit' : 'Add'} ${dialog?.type?.startsWith('course') ? 'course' : 'batch'}`}</DialogTitle><DialogDescription>{dialog?.type === 'view' ? 'Saved branch-scoped DEMO details.' : 'Changes persist in the centralized browser-local mock database.'}</DialogDescription>
      {dialog?.type === 'course-form' && <CourseForm course={dialog.item} branchId={branchId} onSaved={saved} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'batch-form' && <BatchForm batch={dialog.item} courses={courses} branchId={branchId} onSaved={saved} onCancel={() => setDialog(null)} />}
      {dialog?.type === 'view' && <div className="grid gap-4 sm:grid-cols-2"><Detail label="Name" value={dialog.item.name} /><Detail label="Course" value={dialog.item.courseName ?? 'Course record'} /><Detail label="Active enrollments" value={dialog.item.enrolledCount} /><Detail label="Capacity" value="Not configured" /><Detail label="Timetable" value="Not configured" /><Detail label="Teacher assignments" value="None verified" />{canManage && <div className="flex justify-end sm:col-span-2"><Button onClick={() => setDialog({ type: `${tab === 'courses' ? 'course' : 'batch'}-form`, item: dialog.item })}>Edit {tab === 'courses' ? 'course' : 'batch'}</Button></div>}</div>}
    </DialogContent></Dialog>
  </main></DashboardLayout>
}

function Detail({ label, value }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words font-medium">{value}</p></div> }
