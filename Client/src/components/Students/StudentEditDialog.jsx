import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { studentService } from '../../services/studentService.js'

export default function StudentEditDialog({ open, student, branchId, onOpenChange, onSaved }) {
  const [name, setName] = useState(student.name)
  const [dateOfBirth, setDateOfBirth] = useState(student.dateOfBirth ?? '')
  const [guardianName, setGuardianName] = useState(student.guardianName ?? '')
  const [guardianContact, setGuardianContact] = useState(student.guardianContact ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const hasAdmissionDetails = Boolean(student.admission)

  async function save(event) {
    event.preventDefault()
    if (pending) return
    const normalized = name.trim()
    if (!normalized || normalized.length > 200) {
      setError('Student name 1 se 200 characters ka hona chahiye.')
      return
    }
    const details = { name: normalized }
    if (hasAdmissionDetails) {
      const contact = guardianContact.trim()
      if (!dateOfBirth || !guardianName.trim() || !/^\+?[0-9\s().-]{3,30}$/.test(contact)) {
        setError('Date of birth, guardian name aur valid contact number lazmi hain.')
        return
      }
      details.dateOfBirth = dateOfBirth
      details.guardianName = guardianName.trim()
      details.guardianContact = contact
    }
    setPending(true)
    setError('')
    try {
      const updated = await studentService.update(student.id, details, { branchId })
      onSaved(updated)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setPending(false)
    }
  }

  return <Dialog open={open} onOpenChange={value => { if (!pending) onOpenChange(value) }}>
    <DialogContent showCloseButton={!pending}>
      <DialogTitle>Edit Student</DialogTitle>
      <DialogDescription>Student aur linked Admission details synchronized save honge. Status, branch, course, batch aur enrollment references change nahi honge.</DialogDescription>
      <form className="space-y-4" onSubmit={save}>
        <label htmlFor={`student-name-${student.id}`} className="block text-sm font-medium">Student name</label>
        <Input id={`student-name-${student.id}`} value={name} maxLength={200} required disabled={pending} autoFocus onChange={event => setName(event.target.value)} />
        {hasAdmissionDetails && <>
          <label htmlFor={`student-dob-${student.id}`} className="block text-sm font-medium">Date of birth</label>
          <Input id={`student-dob-${student.id}`} type="date" value={dateOfBirth} required disabled={pending} onChange={event => setDateOfBirth(event.target.value)} />
          <label htmlFor={`student-guardian-${student.id}`} className="block text-sm font-medium">Guardian name</label>
          <Input id={`student-guardian-${student.id}`} value={guardianName} maxLength={200} required disabled={pending} onChange={event => setGuardianName(event.target.value)} />
          <label htmlFor={`student-contact-${student.id}`} className="block text-sm font-medium">Guardian contact</label>
          <Input id={`student-contact-${student.id}`} type="tel" value={guardianContact} maxLength={30} required disabled={pending} onChange={event => setGuardianContact(event.target.value)} />
        </>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Student'}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}
