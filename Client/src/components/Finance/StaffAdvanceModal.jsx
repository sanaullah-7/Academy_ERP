import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { HandCoins, ShieldCheck } from 'lucide-react'

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Mobile Wallet', 'Cheque']

function StaffAdvanceForm({ teachers, onClose, onRequestAdvance }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(() => teachers[0]?.teacherId || teachers[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Cash')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError('Please enter a valid advance amount greater than 0.')
      return
    }
    if (!selectedTeacherId) {
      setError('Please select a teacher.')
      return
    }

    setSubmitting(true)
    try {
      await onRequestAdvance({
        teacherId: selectedTeacherId,
        amount: numAmount,
        method,
        reason: reason.trim() || 'Staff Salary Advance',
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 text-primary font-bold">
          <HandCoins size={20} />
          <DialogTitle className="text-lg">Disburse Teacher Salary Advance</DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Disburse an advance against salary. This will automatically deduct from future payroll periods until fully recovered.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Select Faculty Teacher *</label>
          <select
            aria-label="Advance teacher"
              value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-white border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            required
          >
            {teachers.map(t => (
              <option key={t.teacherId || t.id} value={t.teacherId || t.id}>
                {t.teacherName || t.name} ({t.calculationMethod || 'Salary Agreement'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Advance Amount (PKR) *</label>
            <Input
              type="number"
              placeholder="e.g. 15000"
              aria-label="Advance amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              required
              className="text-base font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Disbursement Method</label>
            <select
              aria-label="Advance payment method"
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Reason / Purpose</label>
          <Input
            type="text"
            placeholder="e.g. Urgent medical expense or family advance request"
            aria-label="Advance reason"
              value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-start gap-2.5 text-[11px] text-emerald-900 leading-4">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>Finance Accounting Notice:</strong> 1 posted expense is posted now for the disbursement. Future payroll advance deductions will recover this balance without double-counting expenses in Finance.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-[#940016] text-white hover:bg-[#7a0012]">
            {submitting ? 'Disbursing Advance...' : 'Disburse Advance'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default function StaffAdvanceModal({
  open,
  onClose,
  teachers = [],
  onRequestAdvance,
}) {
  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {open && teachers.length > 0 && (
          <StaffAdvanceForm teachers={teachers} onClose={onClose} onRequestAdvance={onRequestAdvance} />
        )}
      </DialogContent>
    </Dialog>
  )
}
