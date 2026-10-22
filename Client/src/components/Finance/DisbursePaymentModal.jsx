import { getAcademyDateOnly } from '../../utils/formatDate.js'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Banknote, CheckCircle2, ShieldCheck } from 'lucide-react'

const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Mobile Wallet', 'Cheque', 'EasyPaisa', 'Bank / 1Link']

function DisbursePaymentForm({ line, onClose, onDisburse }) {
  const [amount, setAmount] = useState(line.outstanding || '')
  const [method, setMethod] = useState('Bank Transfer')
  const [transactionRef, setTransactionRef] = useState(() => `TXN-SAL-${Math.floor(100000 + Math.random() * 900000)}`)
  const [paymentDate, setPaymentDate] = useState(getAcademyDateOnly())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError('Please enter a valid disbursement amount greater than 0.')
      return
    }
    if (numAmount > line.outstanding) {
      setError(`Amount cannot exceed the remaining balance of PKR ${line.outstanding.toLocaleString()}.`)
      return
    }

    setSubmitting(true)
    try {
      await onDisburse({
        payrollLineId: line.id,
        amount: numAmount,
        paymentDate,
        method,
        transactionReference: transactionRef.trim(),
        notes: notes.trim(),
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
          <Banknote size={20} />
          <DialogTitle className="text-lg">Add Salary Payment</DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Record actual payment to <strong className="text-foreground">{line.teacherName}</strong>{line.batchName && <span className="block mt-1">{line.courseName} / {line.batchName} / {line.subjectName}</span>}
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-[#fcf5f7] p-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Net Payable</span>
          <span className="text-sm font-bold text-foreground">PKR {Number(line.netPayable).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Already Paid</span>
          <span className="text-sm font-bold text-emerald-700">PKR {Number(line.totalPaid).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Remaining Balance</span>
          <span className="text-sm font-bold text-primary">PKR {Number(line.outstanding).toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <label className="block text-xs font-semibold">Payment date<Input aria-label="Payment date" type="date" value={paymentDate} max={getAcademyDateOnly()} onChange={e=>setPaymentDate(e.target.value)} required/></label>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-foreground">Disbursement Amount (PKR)</label>
            <button
              type="button"
              onClick={() => setAmount(line.outstanding)}
              className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              Full Balance (PKR {line.outstanding.toLocaleString()})
            </button>
          </div>
          <Input
            type="number"
            placeholder="e.g. 50000"
            aria-label="Disbursement amount"
              value={amount}
            onChange={e => setAmount(e.target.value)}
            max={line.outstanding}
            min="0.01"
            step="0.01"
            required
            className="text-base font-semibold"
          />
          {Number(amount) < line.outstanding && Number(amount) > 0 && (
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Partial Payment: PKR {(line.outstanding - Number(amount)).toLocaleString()} will remain outstanding.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Payment Method</label>
            <select
              aria-label="Payment method"
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Transaction Ref / Slip #</label>
            <Input
              type="text"
              placeholder="e.g. TXN-123456"
              aria-label="Transaction reference"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Disbursement Notes</label>
          <Input
            type="text"
            placeholder="e.g. Salary transfer via HBL Online"
            aria-label="Disbursement notes"
              value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-start gap-2.5 text-[11px] text-emerald-900 leading-4">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>Finance Integration Notice:</strong> This disbursement will automatically post exactly 1 posted expense to the Finance module under category <em>Teacher / Faculty Honorarium</em>.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-[#940016] text-white hover:bg-[#7a0012]">
            <CheckCircle2 size={15} className="mr-1.5" />
            {submitting ? 'Posting Disbursement...' : 'Add Payment & Post to Finance'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default function DisbursePaymentModal({
  open,
  onClose,
  line,
  onDisburse,
}) {
  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {open && line && (
          <DisbursePaymentForm line={line} onClose={onClose} onDisburse={onDisburse} />
        )}
      </DialogContent>
    </Dialog>
  )
}
