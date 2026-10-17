import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { studentService } from '../../services/studentService.js'

export default function StudentEditDialog({ open, student, branchId, onOpenChange, onSaved }) {
  const [name, setName] = useState(student.name ?? '')
  const [guardianName, setGuardianName] = useState(student.guardianName ?? '')
  const [studentPhone, setStudentPhone] = useState(student.studentPhone ?? '')
  const [guardianContact, setGuardianContact] = useState(student.guardianContact ?? '')
  const [identityNumber, setIdentityNumber] = useState(student.identityNumber ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(student.dateOfBirth ?? '')
  const [gender, setGender] = useState(student.gender ?? '')
  const [residenceType, setResidenceType] = useState(student.residenceType ?? '')
  const [address, setAddress] = useState(student.address ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function save(event) {
    event.preventDefault()
    if (pending) return
    const normalized = name.trim()
    if (!normalized || normalized.length > 200) {
      setError('Student Full Name 1 se 200 characters ka hona chahiye.')
      return
    }
    const contact = guardianContact.trim()
    if (!dateOfBirth) {
      setError('Date of birth lazmi hai.')
      return
    }
    if (!guardianName.trim()) {
      setError('Guardian / Father Name lazmi hai.')
      return
    }
    if (!contact || !/^\+?[0-9\s().-]{3,30}$/.test(contact)) {
      setError('Valid Guardian contact number lazmi hai.')
      return
    }

    const details = {
      name: normalized,
      dateOfBirth,
      guardianName: guardianName.trim(),
      guardianContact: contact,
      studentPhone: studentPhone.trim(),
      identityNumber: identityNumber.trim(),
      gender: gender || undefined,
      residenceType: residenceType || undefined,
      address: address.trim(),
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

  return (
    <Dialog open={open} onOpenChange={value => { if (!pending) onOpenChange(value) }}>
      <DialogContent showCloseButton={!pending} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-base font-bold text-slate-900 border-b pb-2">
          Edit Student
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Student identity aur linked Admission details synchronized update hongi. Status, branch, course, batch aur financial ledger references safe rahenge.
        </DialogDescription>

        <form className="mt-3 space-y-4" onSubmit={save}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* 1. Student Full Name */}
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">
                Student Full Name <span className="text-destructive">*</span>
              </span>
              <label htmlFor={`student-name-${student.id}`} className="sr-only">Student name</label>
              <Input
                id={`student-name-${student.id}`}
                value={name}
                maxLength={200}
                required
                disabled={pending}
                autoFocus
                placeholder="Enter student full name"
                onChange={event => setName(event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 2. Guardian / Father Name */}
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">
                Guardian / Father Name <span className="text-destructive">*</span>
              </span>
              <label htmlFor={`student-guardian-${student.id}`} className="sr-only">Guardian name</label>
              <Input
                id={`student-guardian-${student.id}`}
                value={guardianName}
                maxLength={200}
                required
                disabled={pending}
                placeholder="Enter father or guardian name"
                onChange={event => setGuardianName(event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 3. Student Phone (WhatsApp) */}
            <div className="space-y-1">
              <label htmlFor={`student-phone-${student.id}`} className="block text-xs font-semibold text-slate-700">
                Student Phone (WhatsApp)
              </label>
              <Input
                id={`student-phone-${student.id}`}
                type="tel"
                value={studentPhone}
                maxLength={30}
                disabled={pending}
                placeholder="03001234567"
                onChange={event => setStudentPhone(event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 4. Guardian Contact Number (SMS Alerts) */}
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">
                Guardian Contact Number (SMS Alerts) <span className="text-destructive">*</span>
              </span>
              <label htmlFor={`student-contact-${student.id}`} className="sr-only">Guardian contact</label>
              <Input
                id={`student-contact-${student.id}`}
                type="tel"
                value={guardianContact}
                maxLength={30}
                required
                disabled={pending}
                placeholder="03007654321"
                onChange={event => setGuardianContact(event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 5. CNIC / B-Form No. */}
            <div className="space-y-1">
              <label htmlFor={`student-cnic-${student.id}`} className="block text-xs font-semibold text-slate-700">
                CNIC / B-Form No.
              </label>
              <Input
                id={`student-cnic-${student.id}`}
                value={identityNumber}
                maxLength={30}
                disabled={pending}
                placeholder="e.g. 17301-1234567-1"
                onChange={event => setIdentityNumber(event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 6. Date of Birth */}
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">
                Date of Birth <span className="text-destructive">*</span>
              </span>
              <label htmlFor={`student-dob-${student.id}`} className="sr-only">Date of birth</label>
              <Input
                id={`student-dob-${student.id}`}
                type="date"
                value={dateOfBirth}
                required
                disabled={pending}
                onChange={event => setDateOfBirth(event.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* 7. Gender */}
            <div className="space-y-1">
              <label htmlFor={`student-gender-${student.id}`} className="block text-xs font-semibold text-slate-700">
                Gender
              </label>
              <select
                id={`student-gender-${student.id}`}
                value={gender}
                disabled={pending}
                onChange={event => setGender(event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs transition-colors hover:border-[#940016]/40 hover:bg-[#F9EBEE]/15 focus:border-[#940016] focus:ring-1 focus:ring-[#940016]"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 8. Residence */}
            <div className="space-y-1">
              <label htmlFor={`student-residence-${student.id}`} className="block text-xs font-semibold text-slate-700">
                Residence
              </label>
              <select
                id={`student-residence-${student.id}`}
                value={residenceType}
                disabled={pending}
                onChange={event => setResidenceType(event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs transition-colors hover:border-[#940016]/40 hover:bg-[#F9EBEE]/15 focus:border-[#940016] focus:ring-1 focus:ring-[#940016]"
              >
                <option value="">Select residence</option>
                <option value="Day Scholar">Day Scholar</option>
                <option value="Hostel">Hostel</option>
              </select>
            </div>

            {/* 9. Permanent Address / City */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor={`student-address-${student.id}`} className="block text-xs font-semibold text-slate-700">
                Permanent Address / City
              </label>
              <Input
                id={`student-address-${student.id}`}
                value={address}
                maxLength={200}
                disabled={pending}
                placeholder="Street address, city"
                onChange={event => setAddress(event.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {error && <p role="alert" className="text-xs text-destructive rounded-md bg-destructive/10 p-2">{error}</p>}

          <div className="flex justify-end gap-2.5 pt-2 border-t">
            <Button variant="outline" size="sm" disabled={pending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#940016] hover:bg-[#7a0012] text-white" disabled={pending}>
              {pending ? 'Saving...' : 'Save Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
