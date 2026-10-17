import { useState } from 'react'
import { AlertCircle, Check, Loader2, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { facultyService } from '../../services/facultyService.js'

const SUBJECT_OPTIONS = [
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'English & Reasoning',
  'Computer Science',
  'General Faculty',
]

export default function AddFacultyModal({ open, onClose, branchId, onFacultyAdded }) {
  const [name, setName] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [specialization, setSpecialization] = useState('Biology')
  const [department, setDepartment] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedContact = contact.trim()

    if (!trimmedName) {
      setError('Please provide the faculty member full name.')
      return
    }
    if (!trimmedContact) {
      setError('Please provide a valid contact number.')
      return
    }

    setSubmitting(true)
    try {
      const created = await facultyService.createTeacher(
        {
          name: trimmedName,
          qualifications: qualifications.trim() || `${specialization} Specialist`,
          specialization,
          department: department.trim() || `${specialization} Department`,
          contact: trimmedContact,
          enabled: true,
        },
        { branchId }
      )
      onFacultyAdded?.(created)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add faculty member.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(openState) => { if (!openState && !submitting) onClose() }}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-border/80">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F9EBEE] text-[#940016]">
              <UserPlus size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Add Faculty Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Register a qualified teaching instructor for this campus.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Instructor Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Tariq Mahmood"
              className="mt-1 h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Primary Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus:ring-1 focus:ring-ring"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Qualifications
              </label>
              <Input
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. M.Phil Chemistry"
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Department / Role
              </label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Senior Lecturer"
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. 0301-4455667"
                className="mt-1 h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="h-8 text-xs px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-8 text-xs px-4 bg-[#940016] text-white hover:bg-[#7a0012] gap-1.5 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={13} />
                  Add Instructor
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
