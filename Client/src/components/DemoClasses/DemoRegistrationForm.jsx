import { formatTime } from '../../utils/timeFormat.js'
import { useState, useId, useEffect } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { AlertCircle, BookOpen, CalendarDays, Check, Clock, Loader2, MapPin, User, Users } from 'lucide-react'
import { getLocalDateOnly } from '../../utils/formatDate.js'
import { useBranch } from '../../hooks/useBranch.js'
import { classScheduleService } from '../../services/classScheduleService.js'
import { facultyService } from '../../services/facultyService.js'
import { demoRegistrationClasses } from '../../utils/demoRegistrationClasses.js'
import { classTimeLabel } from '../../utils/classTime.js'
import './DemoRegistrationForm.css'

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
  const { branchId } = useBranch()
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
  const [savedClasses, setSavedClasses] = useState(null)
  const [classRetry, setClassRetry] = useState(0)
  const [chosenTimings, setChosenTimings] = useState([])

  useEffect(() => {
    if (!open || !branchId) return
    let active = true
    let requestId = 0
    const load = () => {
      const latest = ++requestId
      Promise.all([classScheduleService.list({ branchId }), facultyService.listAssignments({ branchId })])
        .then(([sessions, assignments]) => { if (active && latest === requestId) setSavedClasses({ branchId, retry: classRetry, sessions, assignments }) })
        .catch(loadError => { if (active && latest === requestId) setSavedClasses({ branchId, retry: classRetry, error: loadError.message || 'Unable to load saved classes.' }) })
    }
    load()
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    const timer = window.setInterval(load, 60000)
    return () => {
      active = false
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
      window.clearInterval(timer)
    }
  }, [open, branchId, classRetry])

  const currentClasses = savedClasses?.branchId === branchId && savedClasses?.retry === classRetry ? savedClasses : null
  const classOptions = demoRegistrationClasses({ assignments: currentClasses?.assignments, sessions: currentClasses?.sessions, batches, branchId, courseId, batchId: preferredBatchId, fromDate: requestedDate || today })
  const applyClassTiming = option => {
    const selected = chosenTimings.some(item => item.key === option.key)
    setChosenTimings(items => selected ? items.filter(item => item.key !== option.key) : [...items, option])
    if (!selected && chosenTimings.length === 0) {
      setRequestedDate(option.nextDate)
      setRequestedTime(option.startTime)
    }
  }


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
    setChosenTimings([])
    setCourseId(id)
    setField(courses.find(course=>course.id===id)?.streamName || 'Unassigned')
    setPreferredBatchId('')
  }

  const courseBatches = batches.filter(b => b.courseId === courseId && b.active !== false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (busy) return
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
      requestedClasses: chosenTimings.map(option => ({ key: option.key, classDate: option.nextDate })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !busy) onClose() }}>
      <DialogContent className="demo-registration-dialog">
        <DialogHeader className="demo-registration-header">
          <DialogTitle className="flex items-center gap-3 text-lg font-bold">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><User size={20} aria-hidden="true" /></span>
            Register Demo Class Inquiry
          </DialogTitle>
          <DialogDescription>
            Register a trial candidate only; admission and enrollment happen later.
            <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium"><MapPin size={12} aria-hidden="true" />{branchName || 'Current branch'}</span>
          </DialogDescription>
        </DialogHeader>

        {(error || localError) && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error || localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id={formId} className="demo-registration-body">
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

          <div className="flex items-center gap-2 border-b pb-2 text-xs font-semibold text-muted-foreground"><Users size={15} aria-hidden="true" />CANDIDATE DETAILS</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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

          </div>
          <div className="flex items-center gap-2 border-b pb-2 text-xs font-semibold text-muted-foreground"><BookOpen size={15} aria-hidden="true" />FIELD, COURSE &amp; BATCH</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium mb-1" htmlFor="demoField">Academic Field</label><select id="demoField" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={field} onChange={event=>{setField(event.target.value);setCourseId('');setPreferredBatchId('');setChosenTimings([])}}><option value="">Select field</option>{[...new Set(courses.filter(course=>course.active!==false).map(course=>course.streamName||'Unassigned'))].map(name=><option key={name}>{name}</option>)}</select></div>
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

            <div className="sm:col-span-2">
              <label htmlFor="batchSelect" className="block text-sm font-medium mb-1">
                Preferred Batch (Optional)
              </label>
              <select
                id="batchSelect"
                disabled={!courseId}
                className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                value={preferredBatchId}
                onChange={(e) => { setPreferredBatchId(e.target.value); setChosenTimings([]) }}
              >
                <option value="">-- Any suitable batch --</option>
                {courseBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

          </div>
          <SavedClassList
            batchSelected={Boolean(preferredBatchId)}
            currentClasses={currentClasses}
            options={classOptions}
            chosenTimings={chosenTimings}
            onUseTiming={applyClassTiming}
            onRetry={() => setClassRetry(value => value + 1)}
          />
          <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="requestedDate" className="block text-sm font-medium mb-1">
                  Requested Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="requestedDate"
                  type="date"
                  required
                  value={requestedDate}
                  onChange={(e) => { setRequestedDate(e.target.value); setChosenTimings([]) }}
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
                  onChange={(e) => { setRequestedTime(e.target.value); setChosenTimings([]) }}
                />
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

        </form>
          <DialogFooter className="demo-registration-footer">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={busy} className="bg-[#940016] hover:bg-[#72000E] text-white">
              {busy ? 'Registering...' : 'Register Demo Inquiry'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SavedClassList({ batchSelected, currentClasses, options, chosenTimings, onUseTiming, onRetry }) {
  return (
    <section aria-label="Saved classes for selected batch" className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays size={16} className="text-primary" aria-hidden="true" />Available class timings
        </h3>
        {batchSelected && currentClasses && !currentClasses.error && (
          <span className="rounded-full border bg-card px-2 py-0.5 text-xs text-muted-foreground">
            {options.length} {options.length === 1 ? 'class' : 'classes'}
          </span>
        )}
      </div>
      {!batchSelected ? <p className="text-xs text-muted-foreground">Select a course and batch to see its saved classes.</p>
        : !currentClasses ? <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" aria-hidden="true" />Loading saved classes...</p>
        : currentClasses.error ? (
          <div role="alert" className="space-y-2 text-xs text-destructive">
            <p>{currentClasses.error}</p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>Retry classes</Button>
          </div>
        ) : !options.length ? <p className="text-xs text-muted-foreground">No upcoming saved classes for this batch. You can still request a preferred date and time below.</p>
          : <>
            <p className="text-xs text-muted-foreground">Select one or more classes for this demo student. The first selection fills your preferred date and time.</p>
            <p role="status" className="text-xs font-semibold text-primary">{chosenTimings.length} {chosenTimings.length === 1 ? 'class' : 'classes'} selected</p>
            <div className="demo-registration-classes">
              {options.map(option => {
                const selected = chosenTimings.some(item => item.key === option.key)
                return (
                  <button key={option.key} type="button"
                    aria-label={`Use ${option.subject} timing on ${option.nextDate} at ${formatTime(option.startTime)}`}
                    aria-pressed={selected} onClick={() => onUseTiming(option)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors hover:border-primary/40 ${selected ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}>
                    <span className="flex items-start justify-between gap-2">
                      <strong className="text-sm">{option.subject}</strong>
                      {selected && <Check size={16} className="shrink-0 text-primary" aria-hidden="true" />}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.teacherName}</span>
                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" />{classTimeLabel(option.startTime, option.endTime)}</span>
                      <span>{option.days}</span>
                    </span>
                    <span className="mt-1 flex flex-wrap justify-between gap-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin size={12} aria-hidden="true" />{option.room}</span>
                      <span>{option.nextDate}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </>}
    </section>
  )
}
