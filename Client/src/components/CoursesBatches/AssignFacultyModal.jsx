import { useState } from 'react'
import { AlertCircle, Calendar, Check, Clock, Loader2, MapPin, User, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { facultyService } from '../../services/facultyService.js'

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
  initialTeacherId = null,
  initialBatchId = null,
  initialSubjectId = null,
  teachers = [],
  batches = [],
  subjects = [],
  branchId,
  onAssigned,
}) {
  const [teacherId, setTeacherId] = useState(initialTeacherId || teachers[0]?.id || '')
  const [batchId, setBatchId] = useState(initialBatchId || batches[0]?.id || '')
  const [subjectId, setSubjectId] = useState(initialSubjectId || subjects[0]?.id || '')
  const [days, setDays] = useState(['Mon', 'Wed', 'Fri'])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:30')
  const [room, setRoom] = useState('Hall 1 (Main Lab)')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const courseBatches = batches.filter(b => !course || b.courseId === course.id)
  const courseSubjects = subjects.filter(s => !course || s.courseId === course.id)

  const toggleDay = day => {
    setDays(prev => (prev.includes(day) ? (prev.length > 1 ? prev.filter(d => d !== day) : prev) : [...prev, day]))
  }

  const applyPreset = presetDays => {
    setDays(presetDays)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (!teacherId) return setError('Please select a teacher.')
    if (!batchId) return setError('Please select a batch.')
    if (!subjectId) return setError('Please select a subject.')
    if (days.length === 0) return setError('Please choose at least one teaching day.')
    if (!startTime || !endTime) return setError('Please enter both start and end time.')
    if (startTime >= endTime) return setError('Start time must be before end time.')
    if (!room.trim()) return setError('Please specify a classroom or lab location.')

    setSubmitting(true)
    try {
      const activeCourseId = course?.id || courseBatches.find(b => b.id === batchId)?.courseId
      const assignment = await facultyService.assignFaculty(
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
          {/* Teacher Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              Faculty Member / Teacher <span className="text-destructive">*</span>
            </label>
            <select
              aria-label="Select Faculty Member"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-ring"
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
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
