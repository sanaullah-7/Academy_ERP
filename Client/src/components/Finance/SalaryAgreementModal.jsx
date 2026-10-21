import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { getAcademyDateOnly } from '../../utils/formatDate.js'
import { Info, Save, DollarSign, Calculator, GraduationCap, Percent } from 'lucide-react'

const CALC_METHODS = [
  { id: 'fixed', label: 'Method A: Fixed Monthly', icon: DollarSign, desc: 'Contracted monthly salary regardless of lectures' },
  { id: 'per_lecture', label: 'Method B: Per Completed Lecture', icon: Calculator, desc: 'Pay per verified completed lecture in classes schedule' },
  { id: 'per_student', label: 'Method C: Per Student / Batch', icon: GraduationCap, desc: 'Rate per unique enrolled active student across batches' },
  { id: 'fee_percentage', label: 'Method D: % Fee Collections', icon: Percent, desc: 'Percentage of verified tuition fee collections in month' },
]

function SalaryAgreementForm({ teacher, initialAgreement, onClose, onSaved }) {
  const [method, setMethod] = useState(() => initialAgreement?.calculationMethod || 'fixed')
  const [monthlySalary, setMonthlySalary] = useState(() => initialAgreement?.monthlySalary || '')
  const [perLectureRate, setPerLectureRate] = useState(() => initialAgreement?.perLectureRate || '')
  const [perStudentRate, setPerStudentRate] = useState(() => initialAgreement?.perStudentRate || '')
  const [feePercentage, setFeePercentage] = useState(() => initialAgreement?.feePercentage || '')
  const [allowances, setAllowances] = useState(() => initialAgreement?.allowances || '')
  const [standardDeductions, setStandardDeductions] = useState(() => initialAgreement?.standardDeductions || '')
  const [effectiveFrom, setEffectiveFrom] = useState(() => initialAgreement?.effectiveFrom || getAcademyDateOnly())
  const [notes, setNotes] = useState(() => initialAgreement?.notes || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      teacherId: teacher.teacherId ?? teacher.id,
      calculationMethod: method,
      monthlySalary: Number(monthlySalary) || 0,
      perLectureRate: Number(perLectureRate) || 0,
      perStudentRate: Number(perStudentRate) || 0,
      feePercentage: Number(feePercentage) || 0,
      allowances: Number(allowances) || 0,
      standardDeductions: Number(standardDeductions) || 0,
      effectiveFrom: effectiveFrom || getAcademyDateOnly(),
      notes: notes.trim(),
    }

    if (method === 'fixed' && payload.monthlySalary <= 0) {
      setError('Please provide a valid monthly contracted salary.')
      return
    }
    if (method === 'per_lecture' && payload.perLectureRate <= 0) {
      setError('Please provide a valid rate per completed lecture.')
      return
    }
    if (method === 'per_student' && payload.perStudentRate <= 0) {
      setError('Please provide a valid rate per enrolled student.')
      return
    }
    if (method === 'fee_percentage' && (payload.feePercentage <= 0 || payload.feePercentage > 100)) {
      setError('Please enter a valid fee collection percentage between 1% and 100%.')
      return
    }

    setSaving(true)
    try {
      await onSaved(payload)
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
        <DialogTitle className="text-lg font-bold text-foreground">
          Teacher Salary Agreement
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Configure salary calculation method, rates and allowances for <strong className="text-foreground">{teacher?.teacherName ?? teacher?.name}</strong>
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">
            Select Salary Calculation Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CALC_METHODS.map(m => {
              const Icon = m.icon
              const isSelected = method === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#940016] bg-[#F9EBEE] text-[#940016] ring-2 ring-[#940016]/20'
                      : 'border-border/80 bg-white hover:bg-slate-50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className={isSelected ? 'text-[#940016]' : 'text-muted-foreground'} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-4">{m.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Rate Inputs depending on method */}
        <div className="rounded-xl border border-border/80 bg-slate-50/70 p-4 space-y-3">
          {method === 'fixed' && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Monthly Contracted Salary (PKR) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 60000"
                aria-label="Monthly contracted salary"
              value={monthlySalary}
                onChange={e => setMonthlySalary(e.target.value)}
                min="0"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Fixed monthly compensation paid regardless of lecture count or attendance.
              </p>
            </div>
          )}

          {method === 'per_lecture' && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Rate Per Completed Lecture (PKR) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 1500"
                aria-label="Rate per completed lecture"
              value={perLectureRate}
                onChange={e => setPerLectureRate(e.target.value)}
                min="0"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Multiplied by the verified completed lectures taught in class schedules during the month.
              </p>
            </div>
          )}

          {method === 'per_student' && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Rate Per Enrolled Student (PKR) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 800"
                aria-label="Rate per enrolled student"
              value={perStudentRate}
                onChange={e => setPerStudentRate(e.target.value)}
                min="0"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Multiplied by unique verified enrolled active students across the teacher's assigned batches.
              </p>
            </div>
          )}

          {method === 'fee_percentage' && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Verified Fee Collection Percentage (%) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 20"
                aria-label="Fee collection percentage"
              value={feePercentage}
                onChange={e => setFeePercentage(e.target.value)}
                min="1"
                max="100"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Percentage of verified tuition fee collections paid for the teacher's batches in the month.
              </p>
            </div>
          )}
        </div>

        {/* Allowances and Deductions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Monthly Allowances (PKR)
            </label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              aria-label="Monthly allowances"
              value={allowances}
              onChange={e => setAllowances(e.target.value)}
              min="0"
            />
            <span className="text-[10px] text-muted-foreground">Conveyance, medical, utility etc.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Standard Deductions (PKR)
            </label>
            <Input
              type="number"
              placeholder="e.g. 2000"
              aria-label="Standard deductions"
              value={standardDeductions}
              onChange={e => setStandardDeductions(e.target.value)}
              min="0"
            />
            <span className="text-[10px] text-muted-foreground">Tax, security deposit, etc.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Effective Start Date
            </label>
            <Input
              type="date"
              aria-label="Effective start date"
              value={effectiveFrom}
              onChange={e => setEffectiveFrom(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Contract Notes / Remarks
            </label>
            <Input
              type="text"
              placeholder="e.g. Approved by Executive Board"
              aria-label="Contract notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex items-start gap-2 text-[11px] text-blue-900 leading-4">
          <Info size={15} className="text-blue-700 shrink-0 mt-0.5" />
          <span>
            Agreement rules apply to eligible draft payroll months. Approved periods and payment history remain unchanged.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="bg-[#940016] text-white hover:bg-[#7a0012]">
            <Save size={14} className="mr-1.5" />
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
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        {open && teacher && (
          <SalaryAgreementForm
            teacher={teacher}
            initialAgreement={initialAgreement}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
