/**
 * Purpose: Will define Batch Form for the CoursesBatches area of the Academy frontend.
 * Module: CoursesBatches
 * Status: Planned — functionality not implemented.
 */
import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { academicService } from '../../services/academicService.js'

export default function BatchForm({ batch, courses, branchId, onSaved, onCancel }) {
  const [name, setName] = useState(batch?.name ?? '')
  const [courseId, setCourseId] = useState(batch?.courseId ?? courses[0]?.id ?? '')
  const [active, setActive] = useState(batch?.active ?? true)
  const [capacity, setCapacity] = useState(batch?.capacity ?? '')
  const [durationMonths, setDurationMonths] = useState(batch?.durationMonths ?? '')
  const [shift, setShift] = useState(batch?.shift ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!name.trim() || !courseId) { setError('Batch name and course are required.'); return }
    if (durationMonths !== '' && (!Number.isSafeInteger(Number(durationMonths)) || Number(durationMonths) <= 0)) { setError('Duration must be a positive whole number of months.'); return }
    setSaving(true)
    try { onSaved(await academicService.saveBatch(batch?.id, { name, courseId, active, ...(capacity !== '' ? { capacity: Number(capacity) } : {}), shift: shift || null, durationMonths: durationMonths === '' ? null : Number(durationMonths) }, { branchId })) }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="grid gap-2 text-sm font-medium">Batch name<Input autoFocus value={name} maxLength={200} disabled={saving} onChange={event => setName(event.target.value)} /></label>
    <label className="grid gap-2 text-sm font-medium">Course<select aria-label="Course" className="min-h-11 rounded-md border border-input bg-background px-3" value={courseId} disabled={saving} onChange={event => setCourseId(event.target.value)}><option value="">Select course</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-medium">Capacity (optional)<Input type="number" min="1" value={capacity} onChange={event => setCapacity(event.target.value)} /></label>
    <label className="grid gap-2 text-sm font-medium">Duration in months (optional)<Input type="number" min="1" step="1" value={durationMonths} disabled={saving} placeholder="e.g. 1, 2, 3" onChange={event => setDurationMonths(event.target.value)} /></label>
    <label className="grid gap-2 text-sm font-medium">Shift (optional)<select aria-label="Batch shift (optional)" className="min-h-11 rounded-md border border-input bg-background px-3" value={shift} disabled={saving} onChange={event => setShift(event.target.value)}><option value="">No shift selected</option><option value="Morning">Morning</option><option value="Evening">Evening</option></select></label>
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />Active</label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">Shift is optional. Exact class times are managed in Faculty & Classes.</p>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : batch ? 'Save changes' : 'Add batch'}</Button></div>
  </form>
}
