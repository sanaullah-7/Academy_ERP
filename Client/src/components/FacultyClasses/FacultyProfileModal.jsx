import { classTimeLabel } from '../../utils/classTime.js'
import { useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Layers3,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'

import { facultyService } from '../../services/facultyService.js'

export default function FacultyProfileModal({
  open,
  onClose,
  teacher,
  branchId,
  canManage = false,
  onOpenAssign,
  onAssignmentChanged,
}) {
  const [deletingId, setDeletingId] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [error, setError] = useState('')

  if (!teacher) return null

  const schedules = teacher.schedules || []
  const initials = teacher.name
    ? teacher.name
        .split(' ')
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'FC'

  const handleRemoveAssignment = async assignmentId => {
    setDeleteBusy(true)
    setError('')
    try {
      await facultyService.removeAssignment(assignmentId, { branchId })
      setDeletingId(null)
      onAssignmentChanged?.()
    } catch (err) {
      setError(err.message || 'Failed to remove faculty assignment.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const deletingAssignment = schedules.find(s => s.id === deletingId)

  return (
    <>
      <Dialog open={open} onOpenChange={openState => { if (!openState) onClose() }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>{teacher.name} — Faculty Profile</DialogTitle>
            <DialogDescription>Assigned courses, batches, and teaching schedule</DialogDescription>
          </DialogHeader>

          {/* Modal Header */}
          <div className="bg-slate-50/90 border-b border-border/80 p-5 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base border border-primary/20">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{teacher.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        teacher.accountStatus === 'Enabled' || teacher.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          teacher.accountStatus === 'Enabled' || teacher.enabled ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                      />
                      {teacher.accountStatus === 'Enabled' || teacher.enabled ? 'Active Faculty' : 'Disabled'}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      {teacher.contact || 'No contact on file'}
                    </span>
                    {teacher.contact && (
                      <a
                        href={`https://wa.me/${teacher.contact.replace(/[^0-9]/g, '').startsWith('0') ? '92' + teacher.contact.replace(/[^0-9]/g, '').slice(1) : teacher.contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${teacher.name}, regarding The Scholar Coaching Academy classes:`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={11} className="text-emerald-600" />
                        <span>WhatsApp Connect</span>
                      </a>
                    )}
                    <span>•</span>
                    <span>Role: Faculty Instructor</span>
                  </div>
                </div>
              </div>

              {canManage && (
                <Button
                  size="sm"
                  className="gap-1.5 h-8 text-xs shadow-xs"
                  onClick={() => onOpenAssign?.(teacher)}
                >
                  <Plus size={14} />
                  Assign to Batch
                </Button>
              )}
            </div>

            {/* Quick Metrics (Matching Screenshot 4) */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/70 bg-white py-2.5 text-center shadow-xs">
              <div>
                <strong className="block text-base font-bold text-slate-950">
                  {teacher.stats?.totalBatches ?? teacher.assignedBatches?.length ?? 0}
                </strong>
                <span className="text-[11px] text-muted-foreground">Total Batches</span>
              </div>
              <div>
                <strong className="block text-base font-bold text-slate-950">
                  {teacher.stats?.weeklyHours ? `${teacher.stats.weeklyHours} hrs` : '0 hrs'}
                </strong>
                <span className="text-[11px] text-muted-foreground">Weekly Hours</span>
              </div>
              <div>
                <strong className="block text-base font-bold text-slate-950">
                  {teacher.stats?.studentReach ? `${teacher.stats.studentReach} students` : '0 students'}
                </strong>
                <span className="text-[11px] text-muted-foreground">Student Reach</span>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5">
            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Assigned Classes &amp; Timetable Slots
                </h3>
                <span className="text-xs text-muted-foreground">
                  {schedules.length} {schedules.length === 1 ? 'slot' : 'slots'} configured
                </span>
              </div>

              {schedules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-slate-50/50">
                  <GraduationCap size={28} className="mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No Teaching Assignments Configured</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                    This faculty member has not been assigned to any course subjects or batches yet.
                  </p>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-1.5 text-xs h-8"
                      onClick={() => onOpenAssign?.(teacher)}
                    >
                      <Plus size={13} />
                      Assign to Batch &amp; Subject
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/80 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="px-3.5 py-2.5">Subject</th>
                        <th className="px-3.5 py-2.5">Course &amp; Batch</th>
                        <th className="px-3.5 py-2.5">Schedule</th>
                        <th className="px-3.5 py-2.5">Room</th>
                        {canManage && <th className="px-3.5 py-2.5 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {schedules.map(slot => (
                        <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3.5 py-2.5">
                            <span className="font-semibold text-slate-900 block">{slot.subjectName}</span>
                            {slot.notes && (
                              <span className="text-[10px] text-muted-foreground italic block mt-0.5">
                                {slot.notes}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-medium text-slate-800 block">{slot.courseName}</span>
                            <span className="text-[11px] text-muted-foreground block">{slot.batchName}</span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-medium text-slate-900 block">
                              {(slot.days || []).join(', ')}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              {classTimeLabel(slot.startTime, slot.endTime)}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700 font-medium">
                              <MapPin size={10} className="text-muted-foreground" />
                              {slot.room}
                            </span>
                          </td>
                          {canManage && (
                            <td className="px-3.5 py-2.5 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs gap-1"
                                onClick={() => setDeletingId(slot.id)}
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
              )}
            </div>

            {/* Teaching Subjects & Batches Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
              <div className="rounded-xl border border-border/70 p-3.5 bg-slate-50/40">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" />
                  Assigned Subjects ({teacher.assignedSubjects?.length || 0})
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.assignedSubjects?.length > 0 ? (
                    teacher.assignedSubjects.map(sub => (
                      <span
                        key={sub.id}
                        className="rounded-md border border-border/80 bg-white px-2 py-0.5 text-xs font-medium text-slate-800 shadow-2xs"
                      >
                        {sub.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 p-3.5 bg-slate-50/40">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Layers3 size={14} className="text-primary" />
                  Assigned Batches ({teacher.assignedBatches?.length || 0})
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.assignedBatches?.length > 0 ? (
                    teacher.assignedBatches.map(b => (
                      <span
                        key={b.id}
                        className="rounded-md border border-border/80 bg-white px-2 py-0.5 text-xs font-medium text-slate-800 shadow-2xs"
                      >
                        {b.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Removing Assignment */}
      <Dialog open={!!deletingId} onOpenChange={openState => { if (!openState && !deleteBusy) setDeletingId(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Remove Teaching Assignment?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will remove {teacher.name} from teaching {deletingAssignment?.subjectName} in{' '}
              {deletingAssignment?.batchName}.
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <strong>Safe Removal:</strong> This only frees up the timetable slot. The teacher account and the batch
            will remain completely intact.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" disabled={deleteBusy} onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteBusy}
              onClick={() => handleRemoveAssignment(deletingId)}
            >
              {deleteBusy ? (
                <>
                  <Loader2 size={13} className="animate-spin mr-1" />
                  Removing...
                </>
              ) : (
                'Confirm Remove'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
