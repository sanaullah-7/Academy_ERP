import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Sliders, PlusCircle, MinusCircle } from 'lucide-react'

function ManualAdjustmentForm({ line, onClose, onAddAdjustment }) {
  const [type, setType] = useState('bonus')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError('Please enter a valid adjustment amount.')
      return
    }
    if (!reason.trim()) {
      setError('Please enter a reason for the adjustment.')
      return
    }

    setSubmitting(true)
    try {
      await onAddAdjustment({
        teacherId: line.teacherId,
        yearMonth: line.yearMonth,
        type,
        amount: numAmount,
        reason: reason.trim(),
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
          <Sliders size={20} />
          <DialogTitle className="text-lg">Add Manual Salary Adjustment</DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Apply a performance bonus, incentive, penalty or deduction to <strong className="text-foreground">{line.teacherName}</strong> for <strong className="text-foreground">{line.yearMonth}</strong>
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('bonus')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              type === 'bonus'
                ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'border-border/80 bg-white hover:bg-slate-50 text-foreground'
            }`}
          >
            <PlusCircle size={18} className={type === 'bonus' ? 'text-emerald-600' : 'text-muted-foreground'} />
            <div>
              <span className="text-xs font-bold block">Bonus / Addition (+)</span>
              <span className="text-[11px] text-muted-foreground block">Increases net payable salary</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setType('deduction')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              type === 'deduction'
                ? 'border-red-500 bg-red-50/70 text-red-900 ring-2 ring-red-500/20'
                : 'border-border/80 bg-white hover:bg-slate-50 text-foreground'
            }`}
          >
            <MinusCircle size={18} className={type === 'deduction' ? 'text-red-600' : 'text-muted-foreground'} />
            <div>
              <span className="text-xs font-bold block">Deduction / Fine (-)</span>
              <span className="text-[11px] text-muted-foreground block">Reduces net payable salary</span>
            </div>
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Adjustment Amount (PKR)</label>
          <Input
            type="number"
            placeholder="e.g. 5000"
            aria-label="Adjustment amount"
              value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            required
            className="text-base font-semibold"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Reason / Justification</label>
          <Input
            type="text"
            placeholder="e.g. Sunday extra revision workshop allowance or unexcused leave deduction"
            aria-label="Adjustment reason"
              value={reason}
            onChange={e => setReason(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-[#940016] text-white hover:bg-[#7a0012]">
            {submitting ? 'Applying...' : 'Apply Adjustment'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default function ManualAdjustmentModal({
  open,
  onClose,
  line,
  onAddAdjustment,
}) {
  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {open && line && (
          <ManualAdjustmentForm line={line} onClose={onClose} onAddAdjustment={onAddAdjustment} />
        )}
      </DialogContent>
    </Dialog>
  )
}
