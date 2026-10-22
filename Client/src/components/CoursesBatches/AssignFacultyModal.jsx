import { formatTime } from '../../utils/timeFormat.js'
import { useState } from 'react'
import { AlertCircle, Loader2, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { facultyService } from '../../services/facultyService.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'

const DAYS_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PRESET_PATTERNS = [
  { label: 'Mon, Wed, Fri', days: ['Mon', 'Wed', 'Fri'] },
  { label: 'Tue, Thu, Sat', days: ['Tue', 'Thu', 'Sat'] },
  { label: 'Mon – Fri', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'Weekend (Sat, Sun)', days: ['Sat', 'Sun'] },
]

export default function AssignFacultyModal({
  open,
  onClose,
  course,
  courses = [],
  streams = [],
  initialAssignment = null,
  assignments = [],
  initialTeacherId = null,
  initialBatchId = null,
  initialSubjectId = null,
  teachers = [],
  batches = [],
  subjects = [],
  branchId,
  onAssigned,
}) {
  const { can } = usePermissions()
  const canCreate = can(PERMISSIONS.CLASSES_MANAGE)
  const [teacherId, setTeacherId] = useState(initialAssignment?.teacherId || initialTeacherId || '')
  const [courseId,setCourseId] = useState(initialAssignment?.courseId || course?.id || '')
  const [streamId,setStreamId] = useState(courses.find(c=>c.id===(initialAssignment?.courseId || course?.id))?.streamId || '')
  const [editingId,setEditingId] = useState(initialAssignment?.id || '')
  const [batchId, setBatchId] = useState(initialAssignment?.batchId || initialBatchId || '')
  const [subjectId, setSubjectId] = useState(initialAssignment?.subjectId || initialSubjectId || '')
  const [days, setDays] = useState(initialAssignment?.days || [])
  const [startTime, setStartTime] = useState(initialAssignment?.startTime || '')
  const [endTime, setEndTime] = useState(initialAssignment?.endTime || '')
  const [room, setRoom] = useState(initialAssignment?.room || '')
  const [notes, setNotes] = useState(initialAssignment?.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const courseBatches = batches.filter(b => b.courseId === courseId && b.active !== false)
  const primarySubject = teachers.find(teacher => teacher.id === teacherId)?.specialization?.trim().toLowerCase()
  const courseSubjects = subjects.filter(s => s.courseId === courseId && s.active !== false && (!primarySubject || s.name.trim().toLowerCase() === primarySubject))

  const toggleDay = day => {
    setDays(prev => (prev.includes(day) ? (prev.length > 1 ? prev.filter(d => d !== day) : prev) : [...prev, day]))
  }

  const applyPreset = presetDays => {
    setDays(presetDays)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (!editingId && !canCreate) return setError('Select an existing saved assignment to edit.')

    if (!teacherId) return setError('Please select a teacher.')
    if (!batchId) return setError('Please select a batch.')
    if (!subjectId) return setError('Please select a subject.')
    if (days.length === 0) return setError('Please choose at least one teaching day.')
    if (!startTime || !endTime) return setError('Please enter both start and end time.')
    if (startTime >= endTime) return setError('Start time must be before end time.')
    if (!room.trim()) return setError('Please specify a classroom or lab location.')

    setSubmitting(true)
    try {
      const activeCourseId = courseId
      if(!courseBatches.some(b=>b.id===batchId)||!courseSubjects.some(s=>s.id===subjectId))throw new Error('Choose a batch and subject belonging to the selected course.')
      const assignment = await (editingId ? (record,query)=>facultyService.updateAssignment(editingId,record,query) : facultyService.assignFaculty)(
        {
          teacherId,
          courseId: activeCourseId,
          batchId,
          subjectId,
          days,
          startTime,
          endTime,
          room: room.trim(),
          notes: notes.trim() || undefined,
        },
        { branchId }
      )
      onAssigned?.(assignment)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to assign faculty member.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={openState => { if (!openState && !submitting) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Users className="text-primary" size={20} />
            Assign Faculty to Batch &amp; Subject
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Schedule a verified faculty member to teach an approved subject in a specific batch.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!course && <><label className="block text-xs font-semibold">Academic Field<select aria-label="Academic Field" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs" value={streamId} onChange={e=>{setStreamId(e.target.value);setCourseId('');setBatchId('');setSubjectId('')}}><option value="">Select field...</option>{streams.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label className="block text-xs font-semibold">Course<select aria-label="Course" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs" value={courseId} onChange={e=>{setCourseId(e.target.value);setBatchId('');setSubjectId('')}}><option value="">Select course...</option>{courses.filter(c=>c.active!==false&&(!streamId||c.streamId===streamId)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></>}
          {assignments.length>0 && <label className="block text-xs font-semibold">Saved assignment<select aria-label="Saved assignment" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs" value={editingId} onChange={e=>{const a=assignments.find(a=>a.id===e.target.value);setEditingId(a?.id||'');if(a){setTeacherId(a.teacherId);setCourseId(a.courseId);setStreamId(courses.find(c=>c.id===a.courseId)?.streamId||'');setBatchId(a.batchId);setSubjectId(a.subjectId);setDays(a.days);setStartTime(a.startTime);setEndTime(a.endTime);setRoom(a.room);setNotes(a.notes||'')}}}><option value="">Add new assignment</option>{assignments.map(a=><option key={a.id} value={a.id}>{a.subjectName} / {a.batchName} / {formatTime(a.startTime)}</option>)}</select></label>}
          {/* Teacher Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              Faculty Member / Teacher <span className="text-destructive">*</span>
            </label>
            <select
              aria-label="Select Faculty Member"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-ring"
              value={teacherId}
              onChange={e => {setTeacherId(e.target.value);setSubjectId('')}}
              disabled={submitting}
            >
              <option value="">Select teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.accountStatus})
                </option>
              ))}
            </select>
          </div>

          {/* Batch & Subject Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Batch <span className="text-destructive">*</span>
              </label>
              <select
                aria-label="Select Target Batch"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-ring"
                value={batchId}
                onChange={e => setBatchId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select batch...</option>
                {courseBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Subject <span className="text-destructive">*</span>
              </label>
              <select
                aria-label="Select Subject"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-ring"
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select subject...</option>
                {courseSubjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekly Teaching Days */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-900">
                Weekly Teaching Days <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-1">
                {PRESET_PATTERNS.map(preset => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => applyPreset(preset.days)}
                    className="text-[10px] text-primary hover:underline px-1 py-0.5 rounded"
                  >
                    {preset.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OPTIONS.map(day => {
                const isSelected = days.includes(day)
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`h-8 w-11 rounded-lg border text-xs font-semibold transition ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time & Room */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Start Time <span className="text-destructive">*</span>
              </label>
              <Input
                aria-label="Start Time"
                type="time"
                className="h-10 text-xs"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                End Time <span className="text-destructive">*</span>
              </label>
              <Input
                aria-label="End Time"
                type="time"
                className="h-10 text-xs"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Room / Lab <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                aria-label="Room / Lab"
                placeholder="e.g. Hall 1"
                className="h-10 text-xs"
                value={room}
                onChange={e => setRoom(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              Assignment Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Primary theory lecturer"
              className="h-10 text-xs"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            {editingId && <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={async()=>{setSubmitting(true);try{await facultyService.removeAssignment(editingId,{branchId});onAssigned?.();onClose()}catch(err){setError(err.message)}finally{setSubmitting(false)}}}>Remove Assignment</Button>}
            <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Assignment...
                </>
              ) : (
                'Save Assignment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
