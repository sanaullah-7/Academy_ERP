import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { facultyService } from '../../services/facultyService.js'
import { academicService } from '../../services/academicService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import AssignFacultyModal from '../../components/CoursesBatches/AssignFacultyModal.jsx'
import AcademyLogo from '../../components/Layout/AcademyLogo.jsx'
import { classTimeLabel } from '../../utils/classTime.js'

function ProfileCard({ title, icon: Icon, action, children }) {
  return (
    <Card className="min-w-0 shadow-xs border border-slate-200/90 bg-white rounded-2xl overflow-hidden print:border-none print:shadow-none print:p-0">
      <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5 sm:py-3.5 print:hidden">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
            <Icon size={16} className="text-[#940016]" aria-hidden="true" />
            {title}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 print:p-0">{children}</CardContent>
    </Card>
  )
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 break-words text-xs sm:text-sm font-bold text-slate-900">{value || 'Not available'}</dd>
    </div>
  )
}

export default function FacultyProfilePage() {
  const { teacherId } = useParams()
  const { branch, branchId, scopeKey } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.CLASSES_MANAGE) || can(PERMISSIONS.COURSES_MANAGE)
  const [result, setResult] = useState(null)
  const [academicData, setAcademicData] = useState({ courses: [], batches: [], subjects: [], streams: [] })
  const [retryCount, setRetryCount] = useState(0)
  const [assignOpen, setAssignOpen] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [removeError, setRemoveError] = useState('')
  const [removeBusy, setRemoveBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    let active = true
    if (!branchId || !teacherId) return () => { active = false }
    Promise.all([
      facultyService.getById(teacherId, { branchId }),
      academicService.overview({ branchId }).catch(() => ({ courses: [], batches: [], subjects: [], streams: [] })),
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

  const fieldName = courseId => {
    const course = academicData.courses.find(item => item.id === courseId)
    return academicData.streams?.find(item => item.id === course?.streamId)?.name ?? 'Field not configured'
  }

  const handleRemove = async assignmentId => {
    setRemoveBusy(true)
    setRemoveError('')
    try {
      await facultyService.removeAssignment(assignmentId, { branchId })
      setRemovingId(null)
      setRetryCount(v => v + 1)
    } catch (error) {
      setRemoveError(error.message)
    } finally {
      setRemoveBusy(false)
    }
  }

  const cleanDigits = (teacher?.contact || '').replace(/[^0-9]/g, '')
  const waPhone = cleanDigits.startsWith('0') ? `92${cleanDigits.slice(1)}` : cleanDigits

  // Metrics calculation
  const totalBatches = teacher?.stats?.totalBatches ?? teacher?.assignedBatches?.length ?? (teacher?.schedules ? new Set(teacher.schedules.map(s => s.batchId)).size : 0)
  const weeklyHours = teacher?.stats?.weeklyHours ?? (teacher?.schedules ? (teacher.schedules.length * 3.5).toFixed(1) : 0)
  const studentReach = teacher?.stats?.studentReach ?? (teacher?.schedules ? teacher.schedules.reduce((acc, s) => acc + (s.enrolledCount || 0), 0) : 0)
  const totalSlots = teacher?.schedules?.length ?? 0

  return (
    <DashboardLayout>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!removingId} onOpenChange={open => { if (!open && !removeBusy) setRemovingId(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Class Assignment</DialogTitle>
            <DialogDescription>
              Are you sure? Only this specific teaching assignment will be removed from the faculty schedule.
            </DialogDescription>
          </DialogHeader>
          {removeError && <p role="alert" className="text-xs text-destructive font-semibold">{removeError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" disabled={removeBusy} onClick={() => setRemovingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" disabled={removeBusy} onClick={() => handleRemove(removingId)}>
              {removeBusy ? 'Removing...' : 'Delete Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5 pb-12">
        {/* Top Navigation & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
            <Link to={ROUTE_PATHS.FACULTY_CLASSES}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Faculty
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab !== 'classes') {
                  setActiveTab('classes')
                  setTimeout(() => window.print(), 100)
                } else {
                  window.print()
                }
              }}
              className="rounded-xl text-xs gap-1.5 border-slate-200"
            >
              <Printer size={14} />
              Print Timetable
            </Button>

            {canManage && teacher && (
              <Button
                size="sm"
                className="bg-[#940016] hover:bg-[#7a0012] text-white rounded-xl shadow-xs text-xs gap-1.5"
                onClick={() => setAssignOpen(true)}
              >
                <Plus size={14} />
                Assign to Batch &amp; Subject
              </Button>
            )}
          </div>
        </div>

        {!current ? (
          <div role="status" className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-muted-foreground shadow-xs">
            <Loader2 size={24} aria-hidden="true" className="animate-spin text-[#940016] motion-reduce:animate-none" />
            <span className="text-sm font-semibold">Loading faculty profile...</span>
          </div>
        ) : current.error ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 shadow-xs">
            <AlertCircle aria-hidden="true" size={24} className="text-destructive" />
            <p role="alert" className="text-sm font-semibold text-destructive">
              {current.error.code === 'NOT_FOUND' ? 'Faculty record was not found in the selected branch.' : `Unable to load faculty profile. ${current.error.message}`}
            </p>
            <Button variant="outline" size="sm" onClick={() => setRetryCount(value => value + 1)}>Retry</Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Hero Header Area (Matching and elevating beyond Student Profile) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs print:hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-[#940016] to-[#5a000e] text-white font-extrabold text-xl grid place-items-center shadow-xs border border-red-950/30">
                      {teacher.name
                        ? teacher.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
                        : 'FC'}
                    </div>
                    <span className="absolute -bottom-1 -left-1 rounded bg-[#0a3832] text-teal-300 font-bold text-[9px] px-1.5 py-0.2 shadow-xs border border-teal-500/30">
                      TSA 2026
                    </span>
                  </div>

                  {/* Title and Badges */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                        {teacher.name}
                      </h1>
                      <span className="inline-flex items-center rounded-md bg-rose-50 border border-rose-200/80 px-2 py-0.5 font-mono text-[11px] font-bold text-[#940016]">
                        {teacher.id?.startsWith('teacher-') ? `FAC-${teacher.id.replace('teacher-', '').toUpperCase()}` : `TSA-FAC`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                      {teacher.department || 'Academic Faculty'} • {teacher.specialization || 'Subject Specialist'} • {teacher.qualifications || 'Qualified Teacher'}
                    </p>
                  </div>
                </div>

                {/* Right Status & Communication Actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                      <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                      {teacher.accountStatus === 'Disabled' ? 'On Leave' : 'Active Faculty'}
                    </span>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="flex items-center gap-2">
                    {waPhone ? (
                      <a
                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum ${teacher.name}, regarding The Scholar Coaching Academy classes:`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Direct WhatsApp Chat with Faculty"
                      >
                        <MessageSquare size={14} className="text-emerald-600" />
                        <span>WhatsApp Connect</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-400 px-3 py-1.5 text-xs font-medium">
                        <MessageSquare size={14} />
                        WhatsApp N/A
                      </span>
                    )}

                    {teacher.contact && (
                      <a
                        href={`tel:${teacher.contact}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                        title="Call Instructor"
                      >
                        <Phone size={14} className="text-slate-500" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Quick Contact Banner (Matching Student Profile pattern) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Left: Department & Campus */}
                <div className="flex items-center gap-3">
                  <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9] shrink-0">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Branch</span>
                    <strong className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                      {branch?.name || 'Main Campus'}
                    </strong>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-8 w-px bg-slate-200/80" />

                {/* Middle: Phone details */}
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <span className="font-mono text-xs sm:text-sm font-bold">
                    {teacher.contact || 'No phone recorded'}
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-8 w-px bg-slate-200/80" />

                {/* Right: Direct Admin Connectivity */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Direct Admin Connect Active
                  </span>
                </div>
              </div>
            </div>

            {/* 3. 4 Premium Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
              <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs py-0 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Batches</span>
                    <strong className="block text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {totalBatches}
                    </strong>
                  </div>
                  <div className="size-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 grid place-items-center">
                    <BookOpen size={18} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs py-0 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Weekly Hours</span>
                    <strong className="block text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {weeklyHours} <span className="text-xs font-semibold text-slate-500">hrs</span>
                    </strong>
                  </div>
                  <div className="size-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 grid place-items-center">
                    <Clock size={18} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs py-0 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Student Reach</span>
                    <strong className="block text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {studentReach}
                    </strong>
                  </div>
                  <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 grid place-items-center">
                    <Users size={18} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs py-0 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Slots</span>
                    <strong className="block text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      {totalSlots}
                    </strong>
                  </div>
                  <div className="size-10 rounded-xl bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9] grid place-items-center">
                    <CalendarDays size={18} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 4. Horizontal Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 overflow-x-auto no-scrollbar print:hidden">
              {[
                { id: 'overview', label: 'Overview & Bio', icon: Layers },
                { id: 'classes', label: 'Class Schedule & Timetable', icon: CalendarDays },
                { id: 'assignments', label: 'Academic Assignments', icon: BookOpen },
              ].map(tab => {
                const isSelected = activeTab === tab.id
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <TabIcon size={15} className={isSelected ? 'text-[#940016]' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* 5. Tab Content Panes */}
            {activeTab === 'overview' && (
              <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 print:hidden">
                <ProfileCard title="Teacher particulars" icon={UserRound}>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Full Name" value={teacher.name} />
                    <Detail label="Role" value="Teacher" />
                    <Detail label="Account Status" value={teacher.accountStatus || 'Active'} />
                    <Detail label="Campus Branch" value={branch?.name || 'Main Campus'} />
                    <Detail label="Contact Phone" value={teacher.contact} />
                    <Detail label="WhatsApp Connected" value={waPhone ? `+${waPhone}` : 'Not linked'} />
                  </dl>
                </ProfileCard>

                <ProfileCard title="Professional & Academic Credentials" icon={GraduationCap}>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Qualifications" value={teacher.qualifications || 'Not recorded'} />
                    <Detail label="Specialization" value={teacher.specialization || 'Not recorded'} />
                    <Detail label="Department" value={teacher.department || 'Not recorded'} />
                    <Detail label="Role & Privileges" value="Teacher / Faculty Instructor" />
                  </dl>
                  {typeof teacher.professionalDetails === 'string' && teacher.professionalDetails.trim() && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Professional Bio &amp; Notes
                      </dt>
                      <dd className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {teacher.professionalDetails}
                      </dd>
                    </div>
                  )}
                </ProfileCard>


              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4 print:space-y-2">
                {/* Official Institutional Branded Header for Browser Print */}
                <div className="hidden print:flex items-center gap-3.5 border-b-2 border-[#940016] pb-3 mb-4">
                  <div className="size-14 shrink-0 rounded-xl bg-white border border-slate-200 grid place-items-center p-1 shadow-2xs print:border-none print:shadow-none">
                    <AcademyLogo className="size-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#940016]">
                      THE SCHOLAR COACHING ACADEMY
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 truncate">
                      Faculty Teaching Timetable &amp; Schedule
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Instructor: <strong className="text-slate-900">{teacher.name}</strong> • Department: {teacher.department || 'Academic Faculty'} • Campus: {branch?.name || 'Main Campus'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#940016] text-white">
                      OFFICIAL TIMETABLE
                    </span>
                    <p className="mt-1 text-[10px] text-slate-500 font-mono font-semibold">
                      Printed: {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <ProfileCard
                  title="Weekly Class Timetable Slots"
                  icon={CalendarDays}
                  action={
                    canManage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs gap-1.5 h-8 print:hidden"
                        onClick={() => setAssignOpen(true)}
                      >
                        <Plus size={13} />
                        Add Class Slot
                      </Button>
                    )
                  }
                >
                  {teacher.schedules?.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-none">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/90 border-b border-slate-200 font-bold text-slate-700">
                          <tr>
                            <th className="px-3.5 py-2.5">Subject</th>
                            <th className="px-3.5 py-2.5">Course &amp; Batch</th>
                            <th className="px-3.5 py-2.5">Days &amp; Time</th>
                            <th className="px-3.5 py-2.5">Room</th>
                            <th className="px-3.5 py-2.5">Enrolled</th>
                            {canManage && <th className="px-3.5 py-2.5 text-right print:hidden">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teacher.schedules.map(slot => (
                            <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3.5 py-3">
                                <span className="font-bold text-slate-900 block text-xs">{slot.subjectName}</span>
                                {slot.notes && (
                                  <span className="text-[10px] text-muted-foreground italic block mt-0.5">
                                    {slot.notes}
                                  </span>
                                )}
                              </td>
                              <td className="px-3.5 py-3">
                                <span className="font-semibold text-slate-800 block text-xs">{slot.courseName}</span>
                                <span className="text-[11px] text-muted-foreground block">{slot.batchName}</span>
                              </td>
                              <td className="px-3.5 py-3">
                                <span className="font-medium text-slate-900 block text-xs">
                                  {(slot.days || []).join(', ')}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock size={11} className="text-slate-400" />
                                  {classTimeLabel(slot.startTime, slot.endTime)}
                                </span>
                              </td>
                              <td className="px-3.5 py-3">
                                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                  <MapPin size={11} className="text-slate-400" />
                                  {slot.room}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 font-bold tabular-nums text-[#940016]">
                                {slot.enrolledCount ?? 0}
                              </td>
                              {canManage && (
                                <td className="px-3.5 py-3 text-right print:hidden">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs gap-1"
                                    disabled={removeBusy}
                                    onClick={() => {
                                      setRemoveError('')
                                      setRemovingId(slot.id)
                                    }}
                                  >
                                    <Trash2 size={12} />
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
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                      <GraduationCap size={28} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-slate-800">No Teaching Assignments Configured</p>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                        This faculty member has not been assigned to any course subjects or batches yet.
                      </p>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 gap-1.5 text-xs h-8 rounded-xl print:hidden"
                          onClick={() => setAssignOpen(true)}
                        >
                          <Plus size={13} />
                          Assign to Batch &amp; Subject
                        </Button>
                      )}
                    </div>
                  )}
                </ProfileCard>

                {/* Official Institutional Document Signatures for Print */}
                <div className="hidden print:flex items-center justify-between pt-10 mt-8 border-t border-slate-300 text-[11px] text-slate-600">
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 mb-1.5" />
                    <span className="font-semibold">Faculty Instructor</span>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 mb-1.5" />
                    <span className="font-semibold">Academic Coordinator</span>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 mb-1.5" />
                    <span className="font-semibold">Principal / Branch Admin</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="print:hidden"><ProfileCard title="Academic Teaching Relationships" icon={BookOpen}>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Saved academic courses, batches, and subject relationships for this faculty member.
                </p>
                {teacher.schedules?.length ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full table-fixed text-left text-xs" aria-label="Academic assignments">
                      <colgroup>
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '21%' }} />
                        <col style={{ width: '12%' }} />
                      </colgroup>
                      <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                        <tr>
                          {['Field', 'Course', 'Batch', 'Subject', 'Students'].map(label => (
                            <th key={label} scope="col" className="truncate px-3 py-2.5">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          ...new Map(
                            teacher.schedules.map(slot => [
                              `${slot.courseId}|${slot.batchId}|${slot.subjectId}`,
                              slot,
                            ])
                          ).values(),
                        ].map(slot => (
                          <tr key={`${slot.courseId}|${slot.batchId}|${slot.subjectId}`} className="hover:bg-slate-50/60 transition-colors">
                            <td className="truncate px-3 py-3 text-muted-foreground" title={fieldName(slot.courseId)}>
                              {fieldName(slot.courseId)}
                            </td>
                            <td className="truncate px-3 py-3 font-semibold text-slate-900" title={slot.courseName}>
                              {slot.courseName}
                            </td>
                            <td className="truncate px-3 py-3" title={slot.batchName}>
                              {slot.batchName}
                            </td>
                            <td className="truncate px-3 py-3" title={slot.subjectName}>
                              {slot.subjectName}
                            </td>
                            <td className="px-3 py-3 font-bold tabular-nums text-[#940016]">
                              {slot.enrolledCount ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed p-6 text-xs text-muted-foreground text-center">
                    No saved academic assignments.
                  </p>
                )}
              </ProfileCard></div>
            )}
          </div>
        )}

        {/* Assign Modal Dialog */}
        {assignOpen && teacher && (
          <AssignFacultyModal
            open={assignOpen}
            onClose={() => setAssignOpen(false)}
            initialTeacherId={teacher.id}
            teachers={[teacher]}
            batches={academicData.batches || []}
            subjects={academicData.subjects || []}
            courses={academicData.courses || []}
            streams={academicData.streams || []}
            assignments={teacher.schedules || []}
            branchId={branchId}
            onAssigned={() => {
              setAssignOpen(false)
              setRetryCount(v => v + 1)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
