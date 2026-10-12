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
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!name.trim() || !courseId) { setError('Batch name and course are required.'); return }
    setSaving(true)
    try { onSaved(await academicService.saveBatch(batch?.id, { name, courseId }, { branchId })) }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="grid gap-2 text-sm font-medium">Batch name<Input autoFocus value={name} maxLength={200} disabled={saving} onChange={event => setName(event.target.value)} /></label>
    <label className="grid gap-2 text-sm font-medium">Course<select className="min-h-11 rounded-md border border-input bg-background px-3" value={courseId} disabled={saving} onChange={event => setCourseId(event.target.value)}><option value="">Select course</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">Capacity, teacher assignment and schedule editing are not configured.</p>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : batch ? 'Save changes' : 'Add batch'}</Button></div>
  </form>
}
