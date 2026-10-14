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
  const [startTime, setStartTime] = useState(batch?.startTime ?? '')
  const [endTime, setEndTime] = useState(batch?.endTime ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!name.trim() || !courseId) { setError('Batch name and course are required.'); return }
    setSaving(true)
    try { onSaved(await academicService.saveBatch(batch?.id, { name, courseId, active, ...(capacity !== '' ? { capacity: Number(capacity) } : {}), ...(startTime ? { startTime } : {}), ...(endTime ? { endTime } : {}) }, { branchId })) }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="grid gap-2 text-sm font-medium">Batch name<Input autoFocus value={name} maxLength={200} disabled={saving} onChange={event => setName(event.target.value)} /></label>
    <label className="grid gap-2 text-sm font-medium">Course<select className="min-h-11 rounded-md border border-input bg-background px-3" value={courseId} disabled={saving} onChange={event => setCourseId(event.target.value)}><option value="">Select course</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-medium">Capacity (optional)<Input type="number" min="1" value={capacity} onChange={event => setCapacity(event.target.value)} /></label>
    <div className="grid grid-cols-2 gap-3"><label className="grid gap-2 text-sm font-medium">Start time<Input type="time" value={startTime} onChange={event => setStartTime(event.target.value)} /></label><label className="grid gap-2 text-sm font-medium">End time<Input type="time" value={endTime} onChange={event => setEndTime(event.target.value)} /></label></div>
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />Active</label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">Teacher assignment remains unavailable until an approved relationship exists.</p>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : batch ? 'Save changes' : 'Add batch'}</Button></div>
  </form>
}
