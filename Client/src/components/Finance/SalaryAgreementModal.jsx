import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import CustomSelect from '../ui/CustomSelect.jsx'
import { Save, DollarSign, Percent } from 'lucide-react'

function SalaryAgreementForm({ teacher, initialAgreement, onClose, onSaved }) {
  const [method, setMethod] = useState(
    initialAgreement?.calculationMethod === 'percentage' ? 'percentage' : 'fixed'
  )
  const [monthlySalary, setMonthlySalary] = useState(initialAgreement?.monthlySalary || '')
  const [feePercentage, setFeePercentage] = useState(initialAgreement?.feePercentage || '')
  const [feeBasis, setFeeBasis] = useState(initialAgreement?.feeBasis || 'subject')
  const [authorized, setAuthorized] = useState(initialAgreement?.fullCourseFeeAuthorized === true)
  const [notes, setNotes] = useState(initialAgreement?.notes || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    const rate = Number(method === 'fixed' ? monthlySalary : feePercentage)
    if (
      !Number.isFinite(rate) ||
      rate <= 0 ||
      (method === 'percentage' ? rate > 100 : !Number.isSafeInteger(rate))
    ) {
      setError('Enter a positive salary or a percentage greater than 0 and at most 100.')
      return
    }
    if (method === 'percentage' && feeBasis === 'course' && !authorized) {
      setError('Authorize full course fee for this assignment.')
      return
    }
    setSaving(true)
    try {
      await onSaved({
        teacherId: teacher.teacherId,
        courseId: teacher.courseId,
        batchId: teacher.batchId,
        subjectId: teacher.subjectId,
        facultyAssignmentId: teacher.facultyAssignmentId,
        calculationMethod: method,
        monthlySalary: method === 'fixed' ? rate : 0,
        feePercentage: method === 'percentage' ? rate : 0,
        feeBasis: method === 'percentage' ? feeBasis : null,
        fullCourseFeeAuthorized: method === 'percentage' && feeBasis === 'course' && authorized,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>Teacher Salary Agreement</DialogTitle>
        <DialogDescription>
          {teacher.teacherName} - {teacher.courseName} / {teacher.batchName} / {teacher.subjectName}
        </DialogDescription>
      </DialogHeader>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { id: 'percentage', label: 'Percentage', Icon: Percent },
            { id: 'fixed', label: 'Fixed Salary', Icon: DollarSign },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={method === id}
              onClick={() => setMethod(id)}
              className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold ${method === id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        {method === 'fixed' ? (
          <label className="block space-y-1 text-sm">
            Agreed salary (PKR)
            <Input
              type="number"
              aria-label="Agreed salary"
              required
              min="1"
              step="1"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
            />
            <span className="block text-xs text-muted-foreground">
              One agreed salary balance for this assignment; no monthly renewal.
            </span>
          </label>
        ) : (
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
            <div>
              <p className="mb-1 text-sm">Calculation fee basis</p>
              <CustomSelect
                aria-label="Calculation fee basis"
                value={feeBasis}
                onChange={setFeeBasis}
                options={[
                  { value: 'subject', label: 'Subject Fee' },
                  { value: 'course', label: 'Full Course Fee' },
                ]}
              />
            </div>
            <label className="block space-y-1 text-sm">
              Teacher percentage (%)
              <Input
                aria-label="Teacher percentage"
                type="number"
                required
                min="0.01"
                max="100"
                step="0.01"
                value={feePercentage}
                onChange={(e) => setFeePercentage(e.target.value)}
              />
            </label>
            {feeBasis === 'course' && (
              <label className="flex items-start gap-2 text-sm">
                <input
                  aria-label="Authorize full course fee"
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                />
                I explicitly authorize full course fee percentage for this teacher and this
                assignment only.
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              Distinct eligible subject students x saved listed fee x percentage. Cash receipts and
              student discounts do not change this basis.
            </p>
          </div>
        )}
        <label className="block space-y-1 text-sm">
          Contract notes
          <Input
            aria-label="Contract notes"
            value={notes}
            maxLength={500}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <p className="rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
          This saves the same assignment salary balance. Payments remain recorded, and salary cannot
          be lower than the amount already paid. No approval or monthly cycle applies.
        </p>
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving Agreement...' : 'Save Salary Agreement'}
          </Button>
        </div>
      </form>
    </>
  )
}
export default function SalaryAgreementModal({
  open,
  onClose,
  teacher,
  initialAgreement,
  onSaved,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl bg-card p-5 sm:max-w-2xl">
        <SalaryAgreementForm
          teacher={teacher}
          initialAgreement={initialAgreement}
          onSaved={onSaved}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
