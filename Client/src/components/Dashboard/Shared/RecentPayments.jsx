import { Banknote, Building2, Check, CreditCard, Loader2, ReceiptText, RefreshCw, Smartphone } from 'lucide-react'
import { Button } from '../../ui/button.jsx'
import { Card, CardContent, CardHeader } from '../../ui/card.jsx'

const methodIcons = {
  Cash: Banknote,
  Bank: Building2,
  Card: CreditCard,
  Mobile: Smartphone,
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

export default function RecentPayments({ payments = [], branchId, loading = false, error = '', onRetry, onOpenReceipt }) {
  const verified = payments
    .filter(payment => payment.status === 'Verified' && payment.branchId === branchId)
    .sort((a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt))

  return <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
    <CardHeader className="flex-row items-start justify-between gap-3 px-5 py-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-950">Recent Payments</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Verified fee receipts</p>
      </div>
      <ReceiptText className="mt-0.5 text-slate-500" size={19} aria-hidden="true" />
    </CardHeader>
    <CardContent className="grid gap-2 px-3 pb-3 pt-0">
      {loading && <div role="status" className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-6 text-sm text-muted-foreground"><Loader2 className="animate-spin motion-reduce:animate-none" size={18} aria-hidden="true" />Loading verified payments...</div>}
      {!loading && error && <div className="rounded-xl border border-red-100 bg-red-50 p-4"><p role="alert" className="text-sm text-red-700">Unable to load verified payments. {error}</p>{onRetry && <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" />Retry</Button>}</div>}
      {!loading && !error && verified.length === 0 && <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 px-4 py-7 text-center"><span className="mx-auto grid size-10 place-items-center rounded-xl bg-white text-teal-700 shadow-sm"><ReceiptText size={19} aria-hidden="true" /></span><p className="mt-3 text-sm font-semibold text-slate-900">No verified payments</p><p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">No approved payment or receipt records are available for this branch yet.</p></div>}
      {!loading && !error && verified.map(payment => {
        const MethodIcon = methodIcons[payment.method] ?? ReceiptText
        const content = <>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><MethodIcon size={19} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-950">{payment.studentName}</strong><span className="mt-0.5 block truncate text-xs text-slate-500">{[payment.courseName, payment.batchName, payment.method].filter(Boolean).join(' • ')}</span></span>
          <span className="shrink-0 text-right"><strong className="block text-sm text-teal-700">{formatAmount(payment.amount)}</strong><span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] font-medium text-emerald-700"><Check size={14} aria-hidden="true" />{payment.receiptReference}</span></span>
        </>
        return onOpenReceipt && payment.receiptId
          ? <button key={payment.id} type="button" aria-label={`View receipt ${payment.receiptReference} for ${payment.studentName}`} onClick={() => onOpenReceipt(payment)} className="flex w-full items-center gap-3 rounded-xl bg-[#eef3ff] p-3 text-left transition-colors hover:bg-[#e5edff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{content}</button>
          : <article key={payment.id} className="flex items-center gap-3 rounded-xl bg-[#eef3ff] p-3">{content}</article>
      })}
    </CardContent>
  </Card>
}
