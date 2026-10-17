import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BookOpen, CalendarDays, Clock, GraduationCap, Loader2, MapPin, Plus, Trash2, UserRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { facultyService } from '../../services/facultyService.js'
import { academicService } from '../../services/academicService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import AssignFacultyModal from '../../components/CoursesBatches/AssignFacultyModal.jsx'

function ProfileCard({ title, icon: Icon, action, children }) {
  return <Card className="min-w-0 shadow-xs border border-border/80"><CardHeader className="border-b border-border/50 bg-slate-50/60 p-4"><div className="flex items-center justify-between gap-2"><CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground"><Icon size={17} className="text-primary" aria-hidden="true" />{title}</CardTitle>{action}</div></CardHeader><CardContent className="p-4">{children}</CardContent></Card>
}

function Detail({ label, value }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-foreground">{value || 'Not available'}</dd></div>
}

export default function FacultyProfilePage() {
  const { teacherId } = useParams()
  const { branch, branchId, scopeKey } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.CLASSES_MANAGE) || can(PERMISSIONS.COURSES_MANAGE)
  const [result, setResult] = useState(null)
  const [academicData, setAcademicData] = useState({ courses: [], batches: [], subjects: [] })
  const [retryCount, setRetryCount] = useState(0)
  const [assignOpen, setAssignOpen] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [removeBusy, setRemoveBusy] = useState(false)

  useEffect(() => {
    let active = true
    if (!branchId || !teacherId) return () => { active = false }
    Promise.all([
      facultyService.getById(teacherId, { branchId }),
      academicService.overview({ branchId }).catch(() => ({ courses: [], batches: [], subjects: [] })),
    ]).then(
      ([teacher, overview]) => {
        if (active) {
          setResult({ teacher, scopeKey, teacherId, retryCount })
          setAcademicData(overview)
        }
      },
      error => { if (active) setResult({ error, scopeKey, teacherId, retryCount }) },
    )
    return () => { active = false }
  }, [branchId, scopeKey, teacherId, retryCount])

  const current = result?.scopeKey === scopeKey && result?.teacherId === teacherId && result?.retryCount === retryCount ? result : null
  const teacher = current?.teacher

  const handleRemove = async assignmentId => {
    setRemoveBusy(true)
    try {
      await facultyService.removeAssignment(assignmentId, { branchId })
      setRemovingId(null)
      setRetryCount(v => v + 1)
    } catch {
      // keep state
    } finally {
      setRemoveBusy(false)
    }
  }

  return <DashboardLayout><div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Link to={ROUTE_PATHS.FACULTY_CLASSES}><ArrowLeft size={14} aria-hidden="true" />Back to Faculty</Link></Button>
      {canManage && teacher && (
        <Button size="sm" className="h-8 gap-1.5 text-xs shadow-xs" onClick={() => setAssignOpen(true)}>
          <Plus size={14} />
          Assign to Batch &amp; Subject
        </Button>
      )}
    </div>
    <header><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight">Faculty Profile</h1><Badge variant="secondary">DEMO</Badge></div><p className="mt-2 text-muted-foreground">{branch?.name ?? 'Selected branch'} faculty details.</p></header>
    {!current ? <div role="status" className="flex items-center gap-3 rounded-lg border p-8 text-muted-foreground"><Loader2 size={20} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Loading faculty...</div>
      : current.error ? <div className="flex flex-col items-start gap-3 rounded-lg border p-8"><AlertCircle aria-hidden="true" className="text-destructive" /><p role="alert" className="text-destructive">{current.error.code === 'NOT_FOUND' ? 'Faculty record was not found in the selected branch.' : `Unable to load faculty profile. ${current.error.message}`}</p><Button variant="outline" onClick={() => setRetryCount(value => value + 1)}>Retry</Button></div>
        : <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/80 bg-white py-3 text-center shadow-xs">
            <div>
              <strong className="block text-lg font-bold text-slate-950">
                {teacher.stats?.totalBatches ?? teacher.assignedBatches?.length ?? 0}
              </strong>
              <span className="text-xs text-muted-foreground">Total Batches</span>
            </div>
            <div>
              <strong className="block text-lg font-bold text-slate-950">
                {teacher.stats?.weeklyHours ? `${teacher.stats.weeklyHours} hrs` : '0 hrs'}
              </strong>
              <span className="text-xs text-muted-foreground">Weekly Hours</span>
            </div>
            <div>
              <strong className="block text-lg font-bold text-slate-950">
                {teacher.stats?.studentReach ? `${teacher.stats.studentReach} students` : '0 students'}
              </strong>
              <span className="text-xs text-muted-foreground">Student Reach</span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ProfileCard title="Teacher details" icon={UserRound}><dl className="grid gap-4 sm:grid-cols-2"><Detail label="Name" value={teacher.name} /><Detail label="Role" value="Teacher" /><Detail label="Account status" value={teacher.accountStatus} /><Detail label="Branch" value={branch?.name} /><Detail label="Contact details" value={teacher.contact} /></dl></ProfileCard>
            <ProfileCard title="Professional details" icon={GraduationCap}><p className="text-sm text-muted-foreground">Qualifications, specialization and employment details are not present in the current DEMO profile records.</p></ProfileCard>
            <ProfileCard title="Assigned subjects" icon={BookOpen}>
              {teacher.assignedSubjects?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {teacher.assignedSubjects.map(sub => (
                    <span key={sub.id} className="rounded-md border border-border/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {sub.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No saved subject assignments. Subject records and assignment relationships are not available yet.</p>
              )}
            </ProfileCard>
            <ProfileCard title="Assigned batches" icon={GraduationCap}>
              {teacher.assignedBatches?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {teacher.assignedBatches.map(b => (
                    <span key={b.id} className="rounded-md border border-border/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {b.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No saved teacher-batch assignments. Batch membership is not inferred from course or enrollment data.</p>
              )}
            </ProfileCard>
            <div className="lg:col-span-2">
              <ProfileCard title="Class schedule" icon={CalendarDays}>
                {teacher.schedules?.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-700 border-b border-border/60">
                        <tr>
                          <th className="px-3.5 py-2">Subject</th>
                          <th className="px-3.5 py-2">Course &amp; Batch</th>
                          <th className="px-3.5 py-2">Schedule</th>
                          <th className="px-3.5 py-2">Room</th>
                          {canManage && <th className="px-3.5 py-2 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {teacher.schedules.map(slot => (
                          <tr key={slot.id} className="hover:bg-slate-50/60">
                            <td className="px-3.5 py-2.5 font-semibold text-slate-900">{slot.subjectName}</td>
                            <td className="px-3.5 py-2.5">{slot.courseName} · <span className="text-muted-foreground">{slot.batchName}</span></td>
                            <td className="px-3.5 py-2.5">{(slot.days || []).join(', ')} · <span className="text-muted-foreground">{slot.startTime}–{slot.endTime}</span></td>
                            <td className="px-3.5 py-2.5"><span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700"><MapPin size={10} />{slot.room}</span></td>
                            {canManage && (
                              <td className="px-3.5 py-2.5 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-destructive hover:bg-destructive/10 text-xs gap-1"
                                  disabled={removeBusy}
                                  onClick={() => handleRemove(slot.id)}
                                >
                                  <Trash2 size={11} />
                                  Remove
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No saved class sessions are available. Schedule display awaits the shared F04 Batch Timetable contract.</p>
                )}
              </ProfileCard>
            </div>
            <ProfileCard title="Class students" icon={UserRound}><p className="text-sm text-muted-foreground">Teacher access to class student lists is unavailable until verified teaching assignments and their authorization rules exist.</p></ProfileCard>
          </div>
          {assignOpen && (
            <AssignFacultyModal
              open={assignOpen}
              onClose={() => setAssignOpen(false)}
              initialTeacherId={teacher.id}
              teachers={[teacher]}
              batches={academicData.batches || []}
              subjects={academicData.subjects || []}
              branchId={branchId}
              onAssigned={() => {
                setAssignOpen(false)
                setRetryCount(v => v + 1)
              }}
            />
          )}
        </>}
  </div></DashboardLayout>
}
