import { useState, useId } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { AlertCircle, User } from 'lucide-react'
import { getLocalDateOnly } from '../../utils/formatDate.js'

export default function DemoRegistrationForm({
  open,
  onClose,
  onSubmit,
  courses = [],
  batches = [],
  students = [],
  busy = false,
  error = '',
  branchName,
}) {
  const formId = useId()
  const today = getLocalDateOnly()

  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianContact, setGuardianContact] = useState('')
  const [field, setField] = useState('')
  const [courseId, setCourseId] = useState('')
  const [preferredBatchId, setPreferredBatchId] = useState('')
  const [requestedDate, setRequestedDate] = useState(today)
  const [requestedTime, setRequestedTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [localError, setLocalError] = useState('')

  const handleStudentSelect = (id) => {
    setSelectedStudentId(id)
    if (!id) return
    const found = students.find(s => s.id === id)
    if (found) {
      setStudentName(found.name || '')
      setGuardianName(found.guardianName || '')
      setGuardianContact(found.guardianContact || '')
    }
  }

  const handleCourseChange = (id) => {
    setCourseId(id)
    setField(courses.find(course=>course.id===id)?.streamName || 'Unassigned')
    setPreferredBatchId('')
  }

  const courseBatches = batches.filter(b => b.courseId === courseId && b.active !== false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (!studentName.trim()) {
      setLocalError('Student name is required.')
      return
    }
    if (!guardianName.trim()) {
      setLocalError('Guardian name is required.')
      return
    }
    if (!guardianContact.trim() || !/^\+?[0-9\s().-]{3,30}$/.test(guardianContact.trim())) {
      setLocalError('Please provide a valid guardian contact number.')
      return
    }
    if (!courseId) {
      setLocalError('Please select a course for the demo.')
      return
    }
    if (!requestedDate) {
      setLocalError('Requested demo date is required.')
      return
    }

    onSubmit({
      studentName: studentName.trim(),
      studentId: selectedStudentId || undefined,
      guardianName: guardianName.trim(),
      guardianContact: guardianContact.trim(),
      courseId,
      preferredBatchId: preferredBatchId || undefined,
      requestedDate,
      requestedTime: requestedTime.trim(),
      notes: notes.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !busy) onClose() }}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <User className="text-primary" size={22} aria-hidden="true" />
            Register Demo Class Inquiry
          </DialogTitle>
          <DialogDescription>
            Register a trial candidate only; admission and enrollment happen later.
            <span className="mt-1 block font-medium">Branch: {branchName || 'Current branch'}</span>
          </DialogDescription>
        </DialogHeader>

        {(error || localError) && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error || localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id={formId} className="space-y-4">
          {students.length > 0 && (
            <div className="rounded-lg border border-[#f0d5d9] bg-[#F9EBEE]/50 p-3">
              <label htmlFor="existingStudent" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Link Existing Student (Optional)
              </label>
              <select
                id="existingStudent"
                className="w-full min-h-10 rounded-md border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
              >
                <option value="">-- New prospective applicant --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.studentNumber ? `(#${s.studentNumber})` : ''} - {s.guardianName ? `Guardian: ${s.guardianName}` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Selecting an existing student reuses contact info and prevents duplicate student profiles.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium mb-1">
                Student Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="studentName"
                placeholder="Applicant full name"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="guardianName" className="block text-sm font-medium mb-1">
                Guardian Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="guardianName"
                placeholder="Parent or guardian name"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="guardianContact" className="block text-sm font-medium mb-1">
                Guardian Contact <span className="text-destructive">*</span>
              </label>
              <Input
                id="guardianContact"
                placeholder="e.g. 03001234567"
                required
                value={guardianContact}
                onChange={(e) => setGuardianContact(e.target.value)}
              />
            </div>

            <div><label className="block text-sm font-medium mb-1" htmlFor="demoField">Academic Field</label><select id="demoField" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={field} onChange={event=>{setField(event.target.value);setCourseId('');setPreferredBatchId('')}}><option value="">Select field</option>{[...new Set(courses.filter(course=>course.active!==false).map(course=>course.streamName||'Unassigned'))].map(name=><option key={name}>{name}</option>)}</select></div>
            <div>
              <label htmlFor="courseSelect" className="block text-sm font-medium mb-1">
                Interested Course / Program <span className="text-destructive">*</span>
              </label>
              <select
                id="courseSelect"
                required
                className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="">-- Select Course --</option>
                {courses.filter(course=>course.active!==false&&(!field||(course.streamName||'Unassigned')===field)).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batchSelect" className="block text-sm font-medium mb-1">
                Preferred Batch (Optional)
              </label>
              <select
                id="batchSelect"
                disabled={!courseId}
                className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                value={preferredBatchId}
                onChange={(e) => setPreferredBatchId(e.target.value)}
              >
                <option value="">-- Any suitable batch --</option>
                {courseBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="requestedDate" className="block text-sm font-medium mb-1">
                  Requested Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="requestedDate"
                  type="date"
                  required
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="requestedTime" className="block text-sm font-medium mb-1">
                  Preferred Time
                </label>
                <Input
                  id="requestedTime"
                  type="time"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="demoNotes" className="block text-sm font-medium mb-1">
              Notes / Inquirer Background
            </label>
            <textarea
              id="demoNotes"
              rows={3}
              placeholder="e.g. Student inquiring for evening slots, interested in robotics project..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="bg-[#940016] hover:bg-[#72000E] text-white">
              {busy ? 'Registering...' : 'Register Demo Inquiry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}