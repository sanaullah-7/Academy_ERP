import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { AlertCircle, CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function ConvertToAdmissionDialog({
  open,
  onClose,
  onSubmit,
  onDirectConvert,
  demo = null,
  busy = false,
  error = '',
  conversionResult = null,
}) {
  const navigate = useNavigate()
  const [dob, setDob] = useState('2011-01-01')
  const [previousSchool, setPreviousSchool] = useState('')
  const [notes, setNotes] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (!dob) {
      setLocalError('Date of birth is required for admission records.')
      return
    }

    onSubmit({
      dob,
      previousSchool: previousSchool.trim(),
      notes: notes.trim(),
    })
  }

  const handleNavigateToAdmission = () => {
    onClose()
    navigate(ROUTE_PATHS.ADMISSIONS, {
      state: {
        highlightAdmissionId: conversionResult?.admission?.id,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !busy) onClose() }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="text-purple-600" size={22} aria-hidden="true" />
            Convert Demo to Pending Admission
          </DialogTitle>
          <DialogDescription>
            Initiate formal admission application for trial student {demo?.studentName}.
          </DialogDescription>
        </DialogHeader>

        {conversionResult ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-950">Successfully Converted to Pending Admission!</p>
                <p className="mt-1">
                  Admission reference: <strong>{conversionResult.admission?.admissionId || 'Pending'}</strong>
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  A provisional student profile has been created in Pending status. The applicant is ready for standard admission evaluation.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                type="button"
                onClick={handleNavigateToAdmission}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <span>View Pending Admission</span>
                <ExternalLink size={16} />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            {demo && (
              <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3 text-xs space-y-1">
                <p><strong>Applicant Name:</strong> {demo.studentName}</p>
                <p><strong>Guardian:</strong> {demo.guardianName} ({demo.guardianContact})</p>
                <p><strong>Target Course:</strong> {demo.courseName}</p>
                {demo.batchName && <p><strong>Preferred Batch:</strong> {demo.batchName}</p>}
                <p><strong>Demo Session:</strong> {demo.scheduledSession?.classDate || demo.requestedDate} (Status: {demo.status})</p>
              </div>
            )}

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Conversion Architecture Boundary:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Creates a standard <strong>Pending Admission</strong> record.</li>
                <li>Does <strong>NOT</strong> auto-approve or bypass administrative review.</li>
                <li>Does <strong>NOT</strong> generate fee challans or active class enrollments.</li>
              </ul>
            </div>

            {(error || localError) && (
              <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error || localError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentDob" className="block text-sm font-medium mb-1">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <Input
                  id="studentDob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">Required for official student registry.</span>
              </div>

              <div>
                <label htmlFor="previousSchool" className="block text-sm font-medium mb-1">
                  Previous School / Institution (Optional)
                </label>
                <Input
                  id="previousSchool"
                  placeholder="e.g. City School, Beaconhouse, Private"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="admissionNotes" className="block text-sm font-medium mb-1">
                  Additional Admission Notes (Optional)
                </label>
                <textarea
                  id="admissionNotes"
                  rows={2}
                  placeholder="e.g. Recommended for admission following successful trial class..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                  Cancel
                </Button>
                {onDirectConvert && demo && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onClose()
                      onDirectConvert(demo)
                    }}
                    className="border-[#940016] text-[#940016] hover:bg-[#F9EBEE]/60 cursor-pointer"
                  >
                    Open Full Admission Form ↗
                  </Button>
                )}
                <Button type="submit" disabled={busy} className="bg-[#940016] hover:bg-[#72000E] text-white cursor-pointer">
                  {busy ? 'Converting...' : 'Create Pending Admission'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}