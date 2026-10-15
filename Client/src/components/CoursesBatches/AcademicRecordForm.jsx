import { useState } from 'react'
import { academicService } from '../../services/academicService.js'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'

export default function AcademicRecordForm({ type, item, courses = [], branchId, onSaved, onCancel }) {
  const [name, setName] = useState(item?.name ?? '')
  const [courseId, setCourseId] = useState(item?.courseId ?? courses[0]?.id ?? '')
  const [active, setActive] = useState(item?.active ?? true)
  const [feeAmount, setFeeAmount] = useState(item?.feeAmount ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!name.trim() || (type === 'subject' && !courseId)) { setError(`${type === 'stream' ? 'Stream' : 'Subject'} name${type === 'subject' ? ' and course are' : ' is'} required.`); return }
    setSaving(true)
    try {
      const record = type === 'stream' ? { name, active } : { name, courseId, active, ...(feeAmount !== '' ? { feeAmount: Number(feeAmount) } : {}) }
      onSaved(await (type === 'stream' ? academicService.saveStream(item?.id, record, { branchId }) : academicService.saveSubject(item?.id, record, { branchId })))
    } catch (failure) { setError(failure.message) } finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="space-y-4">
    <label className="grid gap-2 text-sm font-medium">{type === 'stream' ? 'Academic stream' : 'Subject'} name<Input autoFocus value={name} maxLength={200} onChange={event => setName(event.target.value)} /></label>
    {type === 'subject' && <><label className="grid gap-2 text-sm font-medium">Course<select className="min-h-11 rounded-md border px-3" value={courseId} onChange={event => setCourseId(event.target.value)}>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Subject fee (PKR, optional)<Input type="number" min="0" value={feeAmount} onChange={event => setFeeAmount(event.target.value)} /></label></>}
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />Active</label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></div>
  </form>
}
