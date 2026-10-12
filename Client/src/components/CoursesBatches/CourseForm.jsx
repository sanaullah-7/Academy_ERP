/**
 * Purpose: Will define Course Form for the CoursesBatches area of the Academy frontend.
 * Module: CoursesBatches
 * Status: Planned — functionality not implemented.
 */
import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { academicService } from '../../services/academicService.js'

export default function CourseForm({ course, branchId, onSaved, onCancel }) {
  const [name, setName] = useState(course?.name ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!name.trim()) { setError('Course name is required.'); return }
    setSaving(true)
    try { onSaved(await academicService.saveCourse(course?.id, { name }, { branchId })) }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="grid gap-2 text-sm font-medium">Course name<Input autoFocus value={name} maxLength={200} disabled={saving} onChange={event => setName(event.target.value)} aria-invalid={!!error} /></label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">Subjects, fees and duration are not configured in this DEMO.</p>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : course ? 'Save changes' : 'Add course'}</Button></div>
  </form>
}
