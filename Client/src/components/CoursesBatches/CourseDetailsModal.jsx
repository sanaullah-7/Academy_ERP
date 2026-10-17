import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers3,
  Loader2,
  MapPin,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { studentService } from '../../services/studentService.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CourseDetailsModal({
  open,
  onClose,
  course,
  allBatches = [],
  allSubjects = [],
  branchId,
  canManage = false,
  onAssignFaculty,
}) {
  const [activeTab, setActiveTab] = useState('batches')
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const courseBatches = allBatches.filter(b => b.courseId === course?.id)
  const courseSubjects = allSubjects.filter(s => s.courseId === course?.id)

  // Load students enrolled in this course
  useEffect(() => {
    if (!open || !course?.id || !branchId) return
    let active = true
    setLoadingStudents(true)
    studentService.listDirectory({ branchId })
      .then(directory => {
        if (!active) return
        const enrolled = directory.flatMap(student => {
          const courseEnrollment = (student.enrollments ?? []).find(
            e => e.courseId === course.id && e.status === 'Active'
          )
          if (!courseEnrollment) return []
          const batch = courseBatches.find(b => b.id === courseEnrollment.batchId)
          return [{
            id: student.id,
            name: student.name,
            admissionId: student.admission?.displayAdmissionId ?? student.admissionDisplaySerialId ?? student.admissionDisplayId ?? 'N/A',
            batchName: batch?.name ?? 'Unassigned batch',
            status: student.status ?? 'Active',
            enrolledAt: courseEnrollment.enrolledAt,
          }]
        })
        setStudents(enrolled)
      })
      .catch(() => {
        if (active) setStudents([])
      })
      .finally(() => {
        if (active) setLoadingStudents(false)
      })
    return () => { active = false }
  }, [open, course?.id, branchId])

  if (!course) return null

  // Collect all assignments for this course
  const courseAssignments = course.assignments || []

  return (
    <Dialog open={open} onOpenChange={openState => { if (!openState) onClose() }}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{course.name}</DialogTitle>
          <DialogDescription>Course details, batches, timetable, and faculty assignments</DialogDescription>
        </DialogHeader>
        {/* Modal Header */}
        <div className="bg-slate-50/90 border-b border-border/80 p-5 shrink-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-border/70 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {course.streamName || 'General Stream'}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  course.active !== false
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className={`size-1.5 rounded-full ${course.active !== false ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                  {course.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900 tracking-tight">{course.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pricing: {course.pricingMode === 'course' && Number.isFinite(course.feeAmount)
                  ? `PKR ${course.feeAmount.toLocaleString('en-PK')} flat`
                  : 'Per-subject configured pricing'}
              </p>
            </div>

            {canManage && (
              <Button size="sm" className="gap-1.5 h-8 text-xs shadow-xs" onClick={() => onAssignFaculty?.(course)}>
                <Plus size={14} />
                Assign Faculty
              </Button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/70 bg-white py-2.5 text-center shadow-xs">
            <div>
              <strong className="block text-base font-bold text-slate-950">{courseBatches.length}</strong>
              <span className="text-[11px] text-muted-foreground">Active Batches</span>
            </div>
            <div>
              <strong className="block text-base font-bold text-slate-950">{courseSubjects.length}</strong>
              <span className="text-[11px] text-muted-foreground">Subjects</span>
            </div>
            <div>
              <strong className="block text-base font-bold text-slate-950">{course.enrolledCount ?? students.length}</strong>
              <span className="text-[11px] text-muted-foreground">Enrolled Students</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="border-b border-border/80 bg-white px-5 pt-2 flex gap-2 shrink-0">
          {[
            { id: 'batches', label: 'Batches Breakdown', icon: Layers3, count: courseBatches.length },
            { id: 'timetable', label: 'Timetable Grid', icon: Calendar, count: courseAssignments.length },
            { id: 'subjects', label: 'Subjects & Faculty', icon: BookOpen, count: courseSubjects.length },
            { id: 'students', label: 'Student Roll List', icon: Users, count: students.length },
          ].map(tab => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: BATCHES BREAKDOWN */}
          {activeTab === 'batches' && (
            <div className="space-y-3">
              {courseBatches.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                  No batches configured for this course. Click &ldquo;Add Batch&rdquo; in Courses &amp; Batches to create one.
                </div>
              ) : (
                courseBatches.map(batch => {
                  const batchAssignments = courseAssignments.filter(a => a.batchId === batch.id)
                  const teachers = batch.teachers || []
                  const occupancy = batch.capacity ? Math.min(100, Math.round(((batch.enrolledCount || 0) / batch.capacity) * 100)) : null

                  return (
                    <article key={batch.id} className="rounded-xl border border-border/80 bg-white p-4 shadow-xs">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{batch.name}</h3>
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              <Clock size={11} className="text-slate-500" />
                              {batch.startTime && batch.endTime ? `${batch.startTime} – ${batch.endTime}` : 'Time not set'}
                            </span>
                            {batch.room && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                                <MapPin size={11} className="text-slate-500" />
                                {batch.room}
                              </span>
                            )}
                          </div>
                          {batch.days && batch.days.length > 0 && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Teaching days: {batch.days.join(', ')}
                            </p>
                          )}
                        </div>

                        {canManage && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => onAssignFaculty?.(course, batch.id)}
                          >
                            <Plus size={12} />
                            Assign Faculty
                          </Button>
                        )}
                      </div>

                      {/* Occupancy Progress */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-slate-600">Batch Capacity &amp; Enrollment</span>
                          <span className="text-slate-900 font-semibold">
                            {batch.capacity == null
                              ? `${batch.enrolledCount || 0} enrolled (Open capacity)`
                              : `${batch.enrolledCount || 0} / ${batch.capacity} seats filled (${occupancy}%)`}
                          </span>
                        </div>
                        {occupancy != null && (
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                occupancy >= 95 ? 'bg-destructive' : occupancy >= 75 ? 'bg-amber-500' : 'bg-primary'
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Assigned Faculty Chips */}
                      <div className="mt-3.5 border-t border-slate-100 pt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                          Assigned Faculty
                        </span>
                        {teachers.length === 0 && batchAssignments.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            No faculty assigned to this batch yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(teachers.length > 0 ? teachers : batchAssignments).map((item, idx) => {
                              const teacherName = item.name || item.teacherName
                              const subjectName = item.subjectName
                              return (
                                <div
                                  key={idx}
                                  className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-slate-50/70 px-2.5 py-1 text-xs"
                                >
                                  <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                                    {teacherName.slice(0, 2).toUpperCase()}
                                  </span>
                                  <div>
                                    <span className="font-semibold text-slate-900">{teacherName}</span>
                                    {subjectName && (
                                      <span className="ml-1 text-[11px] text-muted-foreground">({subjectName})</span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          )}

          {/* TAB 2: TIMETABLE GRID */}
          {activeTab === 'timetable' && (
            <div>
              {courseAssignments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                  No scheduled timetable slots for this course. Assign faculty to batch subjects to generate the timetable.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {DAYS.map(day => {
                    const daySlots = courseAssignments.filter(a => (a.days || []).includes(day))
                    return (
                      <div key={day} className="rounded-xl border border-border/70 bg-white p-3 shadow-xs">
                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                          <span className="font-bold text-xs text-slate-900">{day}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {daySlots.length} slot{daySlots.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        {daySlots.length === 0 ? (
                          <p className="py-4 text-center text-[11px] text-muted-foreground">No classes</p>
                        ) : (
                          <div className="space-y-2">
                            {daySlots.map(slot => (
                              <div
                                key={slot.id}
                                className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-xs"
                              >
                                <span className="font-bold text-slate-900 block">{slot.subjectName}</span>
                                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                                  <span>{slot.teacherName}</span>
                                  <span className="font-medium text-primary">{slot.startTime} – {slot.endTime}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground border-t border-primary/10 pt-1">
                                  <span>{slot.batchName}</span>
                                  <span>{slot.room}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUBJECTS & FACULTY */}
          {activeTab === 'subjects' && (
            <div className="rounded-xl border border-border/80 overflow-hidden bg-white shadow-xs">
              {courseSubjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No subjects configured for this course yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-border/80 text-slate-700 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Subject Name</th>
                      <th className="px-4 py-2.5">Assigned Faculty</th>
                      <th className="px-4 py-2.5">Approved Fee</th>
                      <th className="px-4 py-2.5">Status</th>
                      {canManage && <th className="px-3 py-2.5 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {courseSubjects.map(subject => {
                      const subjectAssignments = courseAssignments.filter(a => a.subjectId === subject.id)
                      const teachers = [...new Set(subjectAssignments.map(a => a.teacherName))]

                      return (
                        <tr key={subject.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{subject.name}</td>
                          <td className="px-4 py-3">
                            {teachers.length === 0 ? (
                              <span className="text-muted-foreground italic">Not assigned</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {teachers.map((name, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200/60"
                                  >
                                    <User size={10} />
                                    {name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {Number.isFinite(subject.feeAmount)
                              ? `PKR ${subject.feeAmount.toLocaleString('en-PK')}`
                              : 'Not configured'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              subject.active !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {subject.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {canManage && (
                            <td className="px-3 py-3 text-right">
                              <Button
                                size="xs"
                                variant="outline"
                                className="h-6 text-[10px]"
                                onClick={() => onAssignFaculty?.(course, null, subject.id)}
                              >
                                Assign
                              </Button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: STUDENT ROLL LIST */}
          {activeTab === 'students' && (
            <div className="rounded-xl border border-border/80 overflow-hidden bg-white shadow-xs">
              {loadingStudents ? (
                <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground text-xs">
                  <Loader2 size={18} className="animate-spin text-primary" />
                  Loading enrolled students...
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No active students enrolled in this course yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-border/80 text-slate-700 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">Admission / Roll No.</th>
                      <th className="px-4 py-2.5">Assigned Batch</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{student.name}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-primary font-bold">{student.admissionId}</td>
                        <td className="px-4 py-2.5 text-slate-700">{student.batchName}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-semibold">
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border/80 bg-slate-50/80 p-3.5 flex justify-end shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
