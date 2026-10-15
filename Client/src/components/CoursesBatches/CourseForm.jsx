/**
 * Purpose: Will define Course Form for the CoursesBatches area of the Academy frontend.
 * Module: CoursesBatches
 * Status: Planned — functionality not implemented.
 */
import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { academicService } from '../../services/academicService.js'

export default function CourseForm({ course, streams = [], branchId, onSaved, onCancel }) {
  const [name, setName] = useState(course?.name ?? '')
  const [streamId, setStreamId] = useState(course?.streamId ?? '')
  const [active, setActive] = useState(course?.active ?? true)
  const [pricingMode, setPricingMode] = useState(course?.pricingMode ?? 'course')
  const [feeAmount, setFeeAmount] = useState(course?.feeAmount ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!name.trim()) { setError('Course name is required.'); return }
    setSaving(true)
    try { onSaved(await academicService.saveCourse(course?.id, { name, streamId: streamId || null, active, pricingMode, ...(pricingMode === 'course' && feeAmount !== '' ? { feeAmount: Number(feeAmount) } : {}) }, { branchId })) }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="grid gap-2 text-sm font-medium">Course name<Input autoFocus value={name} maxLength={200} disabled={saving} onChange={event => setName(event.target.value)} aria-invalid={!!error} /></label>
    <label className="grid gap-2 text-sm font-medium">Academic stream<select className="min-h-11 rounded-md border px-3" value={streamId} onChange={event => setStreamId(event.target.value)}><option value="">Unassigned (legacy)</option>{streams.map(stream => <option key={stream.id} value={stream.id}>{stream.name}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-medium">Pricing model<select className="min-h-11 rounded-md border px-3" value={pricingMode} onChange={event => setPricingMode(event.target.value)}><option value="course">One course fee</option><option value="subjects">Sum selected subject fees</option></select></label>
    {pricingMode === 'course' && <label className="grid gap-2 text-sm font-medium">Course fee (PKR, optional)<Input type="number" min="0" value={feeAmount} onChange={event => setFeeAmount(event.target.value)} /></label>}
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />Active</label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">A missing fee remains unavailable in Admission fee preview.</p>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : course ? 'Save changes' : 'Add course'}</Button></div>
  </form>
}
