import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Eye, Pencil, Trash2, Check, Clock3, UserPlus } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog.jsx'
import NewAdmissionForm from './NewAdmissionForm.jsx'
import { admissionService } from '../../services/admissionService.js'
import { useAuth } from '../../hooks/useAuth.js'
import { canDecideAdmission, canDeleteAdmission, canEditAdmissions } from '../../lib/admissionPolicy.js'
import { batchService } from '../../services/batchService.js'
import { DEMO_BRANCHES } from '../../mock/authFixtures.js'

// DEMO actions stay behind the service boundary; unknown legacy ownership never cascades.
export default function AdmissionActions({ admission, branchId, onChanged, savedFocusRef, viewRequest = 0, viewFocusTarget = null }) {
  const { user } = useAuth()
  const trigger = useRef(null)
  const menu = useRef(null)
  const busy = useRef(false)
  const committed = useRef(false)
  const mounted = useRef(true)
  const viewFocus = useRef(null)
  const [position, setPosition] = useState(null)
  const [action, setAction] = useState(null)
  const [record, setRecord] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [batchLoadState, setBatchLoadState] = useState('idle')
  const batchSelect = useRef(null)
  const handledViewRequest = useRef(0)
  const label = admission.displayAdmissionId ?? admission.admissionId ?? admission.id
  const decision = action === 'Approve' || action === 'Pending'
  const targetStatus = action === 'Approve' ? 'Approved' : 'Pending'
  const decisionItems = admission.status === 'Approved'
    ? [['Pending', Clock3, false]]
    : [['Approve', Check, false]]
  const items = [['View', Eye, false], ...(canEditAdmissions(user, branchId) ? [['Edit', Pencil, false]] : []), ...(canDeleteAdmission(user, branchId) ? [['Delete', Trash2, false]] : []), ...(canDecideAdmission(user, branchId) ? [...decisionItems, ...(admission.status === 'Approved' ? [['Enroll Student', UserPlus, false]] : [])] : [])]

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!position) return
    menu.current?.querySelector('button')?.focus()
    const outside = (event) => {
      if (!menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) setPosition(null)
    }
    const close = () => setPosition(null)
    document.addEventListener('pointerdown', outside)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [position])

  function openMenu() {
    if (position) { setPosition(null); return }
    const bounds = trigger.current.getBoundingClientRect()
    setPosition({ left: Math.max(8, Math.min(bounds.right - 176, window.innerWidth - 184)), top: Math.max(8, Math.min(bounds.bottom + 4, window.innerHeight - items.length * 44 - 12)) })
  }

  function menuKeys(event) {
    const items = [...menu.current.querySelectorAll('button:not(:disabled)')]
    const index = items.indexOf(document.activeElement)
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault(); setPosition(null); trigger.current?.focus()
    } else if (event.key === 'Tab') {
      setPosition(null); trigger.current?.focus()
    }
  }

  const choose = useCallback(async (next, returnFocusTarget = null) => {
    committed.current = false
    viewFocus.current = returnFocusTarget
    setPosition(null); setAction(next); setRecord(null); setError(''); setBatches([]); setSelectedBatchId(''); setBatchLoadState(next === 'Enroll Student' ? 'loading' : 'idle'); setPending(true)
    try {
      const saved = await admissionService.getById(admission.id, { branchId })
      if (mounted.current) setRecord(saved)
    } catch (failure) { if (mounted.current) setError(failure.message) }
    finally { if (mounted.current) setPending(false) }
  }, [admission.id, branchId])

  useEffect(() => {
    if (action !== 'Enroll Student' || !record) return undefined
    let active = true
    if (!record.courseId) return undefined
    batchService.list({ branchId, courseId: record.courseId }).then((available) => {
      if (!active) return
      setBatches(available)
      if (record.preferredBatchId && available.some(batch => batch.id === record.preferredBatchId)) setSelectedBatchId(record.preferredBatchId)
      else if (available.length === 1) setSelectedBatchId(available[0].id)
      setBatchLoadState('loaded')
    }).catch((failure) => {
      if (active) { setError(failure.message); setBatchLoadState('error') }
    })
    return () => { active = false }
  }, [action, branchId, record])

  useEffect(() => {
    if (!viewRequest || handledViewRequest.current === viewRequest) return
    handledViewRequest.current = viewRequest
    choose('View', viewFocusTarget)
  }, [viewRequest, viewFocusTarget, choose])

  async function remove() {
    if (busy.current) return
    busy.current = true; setPending(true); setError('')
    try {
      const result = await admissionService.delete(admission.id, { branchId })
      if (mounted.current) { committed.current = true; setAction(null); onChanged(`DEMO admission ${result.displayAdmissionId} deleted. Display serials have been updated.`) }
    } catch (failure) { if (mounted.current) setError(failure.message) }
    finally { busy.current = false; if (mounted.current) setPending(false) }
  }

  async function decide() {
    if (busy.current || !record) return
    busy.current = true; setPending(true); setError('')
    try {
      const result = await admissionService.changeStatus(admission.id, { status: targetStatus, expectedStatus: record.status }, { branchId })
      if (mounted.current) { committed.current = true; setAction(null); onChanged(`DEMO admission ${result.displayAdmissionId} ${result.status.toLowerCase()}. Linked student remains Provisional.`) }
    } catch (failure) { if (mounted.current) setError(failure.message) }
    finally { busy.current = false; if (mounted.current) setPending(false) }
  }

  async function enroll() {
    if (busy.current || !record) return
    if (!selectedBatchId) {
      setError('Enrollment ke liye valid batch select karein.')
      batchSelect.current?.focus()
      return
    }
    busy.current = true; setPending(true); setError('')
    try {
      const result = await admissionService.enroll(admission.id, { batchId: selectedBatchId }, { branchId })
      if (mounted.current) {
        committed.current = true
        setAction(null)
        onChanged(`DEMO student ${result.student.name} is Active and enrolled in ${result.enrollment.status.toLowerCase()}.`)
      }
    } catch (failure) { if (mounted.current) setError(failure.message) }
    finally { busy.current = false; if (mounted.current) setPending(false) }
  }

  return <>
    <Button ref={trigger} variant="ghost" size="sm" aria-label={`Actions for ${label}`} aria-haspopup="menu" aria-expanded={!!position}
      onClick={(event) => { event.stopPropagation(); openMenu() }} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openMenu() } }}>
      <MoreHorizontal size={20} aria-hidden="true" />
    </Button>
    {position && createPortal(<div ref={menu} role="menu" aria-label={`Admission actions for ${label}`} onKeyDown={menuKeys}
      className="fixed z-[60] w-44 rounded-lg border border-border bg-card p-1 shadow-lg" style={position}>
      {items.map(([name, Icon, locked]) => <button key={name} type="button" role="menuitem" tabIndex={-1} disabled={locked}
        className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 ${name === 'Delete' ? 'text-destructive' : ''}`}
        onClick={(event) => { event.stopPropagation(); choose(name) }}><Icon size={16} aria-hidden="true" />{name}</button>)}
    </div>, document.body)}
    <Dialog open={!!action} onOpenChange={(open) => { if (!pending && !open) setAction(null) }}>
      <DialogContent showCloseButton={!pending} className={action === 'Edit' ? 'max-w-3xl p-0 max-h-[90vh] overflow-y-auto' : ''}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const target = committed.current ? savedFocusRef?.current : viewFocus.current ?? trigger.current
          target?.focus()
          viewFocus.current = null
        }}>
        <DialogTitle className={action === 'Edit' ? 'sr-only' : ''}>{action} DEMO Admission {label}</DialogTitle>
        <DialogDescription className={action === 'Edit' ? 'sr-only' : ''}>
          {decision ? 'Confirm this DEMO status decision. The linked student remains Provisional. No enrollment is created.' : action === 'Enroll Student' ? 'Confirm the active-branch enrollment. The Admission remains Approved.' : action === 'Delete' ? 'Delete this admission and its linked Provisional student, if present? Unrelated records will be kept. This cannot be undone.' : 'Saved fictional admission details in the selected branch.'}
        </DialogDescription>
        {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {pending && !record && <p role="status">Loading saved details...</p>}
        {error && !pending && <Button variant="outline" onClick={() => choose(action)}>Reload saved record</Button>}
        {record && decision && <div className="space-y-4">
          <p className="break-words font-medium">{record.studentName}: {record.status} → {targetStatus}</p>
          {record.status === targetStatus && <p role="status">This admission is already {record.status}.</p>}
          <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={pending} onClick={() => setAction(null)}>Cancel</Button><Button disabled={pending || record.status === targetStatus} onClick={decide}>{pending ? 'Saving status...' : record.status === targetStatus ? `Already ${record.status}` : `Confirm ${targetStatus}`}</Button></div>
        </div>}
        {record && action === 'View' && <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {Object.entries({ 'Admission ID': record.displayAdmissionId, 'Permanent Admission Reference': record.admissionId, 'Student Number': record.student?.displaySerial ?? 'No linked student', 'Student Name': record.studentName, 'Date of Birth': record.dob, Guardian: record.guardianName, Contact: record.contact, Course: record.courseLabel ?? record.course, Batch: record.batchLabel ?? 'Not selected', Status: record.status, 'Created On': record.createdAt, 'Previous School': record.previousSchool || 'Not provided', Notes: record.notes || 'Not provided' }).map(([title, value]) => <div key={title}><dt className="text-muted-foreground">{title}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}
        </dl>}
        {record && action === 'View' && record.statusHistory?.length > 0 && <section aria-label="DEMO status history" className="space-y-2 border-t pt-4"><h3 className="font-semibold">DEMO status history</h3>{record.statusHistory.map(event => <p key={event.id} className="break-words text-sm text-muted-foreground">{event.fromStatus} → {event.toStatus} · {event.actorUserId} · <time dateTime={event.occurredAt}>{event.occurredAt}</time>{event.reason ? ` · ${event.reason}` : ''}</p>)}</section>}
        {record && action === 'Enroll Student' && <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Student</dt><dd className="mt-1 font-medium">{record.student?.name ?? record.studentName} ({record.student?.status ?? 'Unresolved'})</dd></div>
            <div><dt className="text-muted-foreground">Course</dt><dd className="mt-1 font-medium">{record.courseLabel ?? record.course}</dd></div>
            <div><dt className="text-muted-foreground">Branch</dt><dd className="mt-1 font-medium">{DEMO_BRANCHES.find(branch => branch.id === branchId)?.name ?? branchId}</dd></div>
            <div><dt className="text-muted-foreground">Admission</dt><dd className="mt-1 font-medium">{record.status}</dd></div>
          </dl>
          {!record.courseId && <p role="alert">The saved admission course cannot be resolved. Enrollment was not started.</p>}
          <label htmlFor={`enrollment-batch-${admission.id}`} className="block text-sm font-medium">Batch</label>
          {!record.courseId ? null : batchLoadState === 'loading' ? <p role="status">Loading available batches...</p> : batchLoadState === 'loaded' && batches.length === 0 ? <p role="alert">No valid batch is available for this course in the active branch.</p> : batchLoadState === 'loaded' && <select ref={batchSelect} id={`enrollment-batch-${admission.id}`} className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={selectedBatchId} onChange={event => { setSelectedBatchId(event.target.value); setError('') }} disabled={pending}>
            <option value="">Select a batch</option>
            {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}{batch.id === record.preferredBatchId ? ' (Preferred)' : ''}</option>)}
          </select>}
          <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={pending} onClick={() => setAction(null)}>Cancel</Button><Button disabled={pending || batchLoadState !== 'loaded' || !record.courseId || batches.length === 0} onClick={enroll}>{pending ? 'Enrolling...' : 'Confirm Enrollment'}</Button></div>
        </div>}
        {record && action === 'Edit' && <NewAdmissionForm admission={record} onPendingChange={setPending} onCancel={() => setAction(null)}
          onSuccess={(updated) => { committed.current = true; setAction(null); onChanged(`DEMO admission ${updated.displayAdmissionId} updated.`) }} />}
        {action === 'Delete' && <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" disabled={pending} onClick={() => setAction(null)}>Cancel</Button>
          <Button variant="destructive" disabled={pending || !record} onClick={remove}>{pending ? 'Deleting...' : 'Delete Admission'}</Button>
        </div>}
      </DialogContent>
    </Dialog>
  </>
}
