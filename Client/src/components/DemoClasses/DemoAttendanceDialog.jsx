import { formatTimeRange } from '../../utils/timeFormat.js'
import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { AlertCircle, CheckCircle2, UserCheck, XCircle } from 'lucide-react'

export default function DemoAttendanceDialog({
  open,
  onClose,
  onSubmit,
  demo = null,
  busy = false,
  error = '',
}) {
  const [status, setStatus] = useState(demo?.attendance?.status || 'Present')
  const [remarks, setRemarks] = useState(demo?.attendance?.remarks || '')
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (busy) return
    setLocalError('')

    if (!['Present', 'Absent'].includes(status)) {
      setLocalError('Please select Present or Absent.')
      return
    }

    onSubmit({
      status,
      remarks: remarks.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !busy) onClose() }}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserCheck className="text-primary" size={22} aria-hidden="true" />
            Record Demo Attendance
          </DialogTitle>
          <DialogDescription>
            Mark trial class attendance for {demo?.studentName}.
          </DialogDescription>
        </DialogHeader>

        {demo && (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-1">
            <p><strong>Student:</strong> {demo.studentName} ({demo.demoId})</p>
            <p><strong>Course:</strong> {demo.courseName}</p>
            {demo.requestedClasses?.map(item => <p key={item.key}><strong>{item.subject}:</strong> {item.classDate} ? {item.teacherName} ? {item.room}</p>)}
            {demo.scheduledSession && (
              <p>
                <strong>Scheduled:</strong> {demo.scheduledSession.classDate} at {formatTimeRange(demo.scheduledSession.startTime, demo.scheduledSession.endTime)} ({demo.scheduledSession.location})
              </p>
            )}
            <p><strong>Teacher:</strong> {demo.scheduledSession?.teacherName || 'Not specified'}</p>
          </div>
        )}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          <strong>Important Policy:</strong> Marking attendance registers trial completion or absence. It does NOT automatically approve an admission or enroll the student.
        </div>

        {(error || localError) && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error || localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Attendance Outcome <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Present')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                  status === 'Present'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <CheckCircle2 size={18} className={status === 'Present' ? 'text-emerald-600' : ''} />
                <span>Present (Attended)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Absent')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                  status === 'Absent'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <XCircle size={18} className={status === 'Absent' ? 'text-amber-600' : ''} />
                <span>Absent (Missed)</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="attRemarks" className="block text-sm font-medium mb-1">
              Trial Feedback / Staff Remarks (Optional)
            </label>
            <textarea
              id="attRemarks"
              rows={3}
              placeholder="e.g. Student performed very well, expressed strong interest in enrolling..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="bg-[#940016] hover:bg-[#72000E] text-white">
              {busy ? 'Saving Attendance...' : 'Save Attendance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}