import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { AlertCircle, Calendar } from 'lucide-react'
import { getLocalDateOnly } from '../../utils/formatDate.js'

function ScheduleForm({ demo, teachers, onSubmit, onClose, busy }) {
  const today = getLocalDateOnly()
  const isReschedule = demo?.status === 'Scheduled' || Boolean(demo?.scheduledSession)

  const initialDate = demo?.scheduledSession?.classDate || demo?.requestedDate || today
  const initialStart = demo?.scheduledSession?.startTime || demo?.requestedTime || '10:00'
  const initialEnd = demo?.scheduledSession?.endTime || (() => {
    const [h, m] = initialStart.split(':')
    const endH = String(Math.min(23, Number(h || 10) + 1)).padStart(2, '0')
    return `${endH}:${m || '00'}`
  })()

  const [classDate, setClassDate] = useState(initialDate)
  const [startTime, setStartTime] = useState(initialStart)
  const [endTime, setEndTime] = useState(initialEnd)
  const [teacherId, setTeacherId] = useState(demo?.scheduledSession?.teacherId || (teachers[0]?.id || ''))
  const [location, setLocation] = useState(demo?.scheduledSession?.location || 'Room 101')
  const [reason, setReason] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (!classDate) {
      setLocalError('Session date is required.')
      return
    }
    if (!startTime || !endTime) {
      setLocalError('Start and end times are required.')
      return
    }
    if (startTime >= endTime) {
      setLocalError('Start time must be before end time.')
      return
    }
    if (!teacherId) {
      setLocalError('Please select a teacher.')
      return
    }
    if (!location.trim()) {
      setLocalError('Room or location is required.')
      return
    }

    onSubmit({
      classDate,
      startTime,
      endTime,
      teacherId,
      location: location.trim(),
      reason: reason.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{localError}</span>
        </div>
      )}

      <div>
        <label htmlFor="schedDate" className="block text-sm font-medium mb-1">
          Session Date <span className="text-destructive">*</span>
        </label>
        <Input
          id="schedDate"
          type="date"
          required
          value={classDate}
          onChange={(e) => setClassDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="schedStart" className="block text-sm font-medium mb-1">
            Start Time <span className="text-destructive">*</span>
          </label>
          <Input
            id="schedStart"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="schedEnd" className="block text-sm font-medium mb-1">
            End Time <span className="text-destructive">*</span>
          </label>
          <Input
            id="schedEnd"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="teacherSelect" className="block text-sm font-medium mb-1">
          Assign Teacher <span className="text-destructive">*</span>
        </label>
        <select
          id="teacherSelect"
          required
          className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
        >
          <option value="">-- Select Teacher --</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.accountStatus || 'Active'})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="schedLocation" className="block text-sm font-medium mb-1">
          Room / Classroom / Lab Location <span className="text-destructive">*</span>
        </label>
        <Input
          id="schedLocation"
          placeholder="e.g. Lab 1, Room 204, Main Hall"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {isReschedule && (
        <div>
          <label htmlFor="rescheduleReason" className="block text-sm font-medium mb-1">
            Reason for Rescheduling
          </label>
          <Input
            id="rescheduleReason"
            placeholder="e.g. Applicant requested slot change, Teacher unavailable..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy} className="bg-teal-600 hover:bg-teal-700 text-white">
          {busy ? 'Saving Schedule...' : isReschedule ? 'Update Schedule' : 'Confirm Schedule'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function DemoScheduleDialog({
  open,
  onClose,
  onSubmit,
  demo = null,
  teachers = [],
  busy = false,
  error = '',
}) {
  const isReschedule = demo?.status === 'Scheduled' || Boolean(demo?.scheduledSession)

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !busy) onClose() }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Calendar className="text-teal-600" size={22} aria-hidden="true" />
            {isReschedule ? 'Reschedule Demo Session' : 'Schedule Demo Class'}
          </DialogTitle>
          <DialogDescription>
            Assign teacher, room and time slot for prospective student {demo?.studentName}.
          </DialogDescription>
        </DialogHeader>

        {demo && (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-1">
            <p><strong>Applicant:</strong> {demo.studentName} ({demo.demoId})</p>
            <p><strong>Course:</strong> {demo.courseName} {demo.batchName ? `· ${demo.batchName}` : ''}</p>
            <p><strong>Requested:</strong> {demo.requestedDate} {demo.requestedTime ? `at ${demo.requestedTime}` : ''}</p>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {demo && (
          <ScheduleForm
            key={demo.id}
            demo={demo}
            teachers={teachers}
            onSubmit={onSubmit}
            onClose={onClose}
            busy={busy}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}