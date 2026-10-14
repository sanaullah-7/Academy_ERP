import { AlertCircle, Banknote, Building2, Check, CreditCard, ReceiptText, RefreshCw, Smartphone } from 'lucide-react'
import { Button } from '../../ui/button.jsx'
import { Card, CardContent, CardHeader } from '../../ui/card.jsx'

const methodIcons = { Cash: Banknote, Bank: Building2, 'Bank Transfer': Building2, Card: CreditCard, Mobile: Smartphone, 'Mobile Wallet': Smartphone }
const methodStyles = {
  Cash: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  Bank: 'bg-indigo-50 text-indigo-700 ring-indigo-200/80',
  'Bank Transfer': 'bg-indigo-50 text-indigo-700 ring-indigo-200/80',
  Card: 'bg-sky-50 text-sky-700 ring-sky-200/80',
  Mobile: 'bg-violet-50 text-violet-700 ring-violet-200/80',
  'Mobile Wallet': 'bg-violet-50 text-violet-700 ring-violet-200/80',
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

export default function RecentPayments({ payments = [], branchId, loading = false, error = '', onRetry, onOpenReceipt }) {
  const verified = payments
    .filter(payment => payment.status === 'Verified' && payment.branchId === branchId)
    .sort((a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt))

  return <Card className="gap-0 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white py-0 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
    <CardHeader className="flex items-center justify-between gap-3 px-4 pb-5 pt-5 sm:px-5 sm:pb-6 sm:pt-6">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold leading-7 tracking-tight text-slate-900 sm:text-[22px]">Recent Payments</h2>
        <p className="mt-0.5 text-sm text-slate-500 sm:text-base">Verified fee receipts</p>
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80 sm:size-11" aria-hidden="true">
        <ReceiptText size={21} strokeWidth={1.9} />
      </span>
    </CardHeader>
    <CardContent className="grid min-w-0 gap-3 px-2 pb-5 pt-0 sm:px-2 sm:pb-6">
      {loading && <div role="status" className="space-y-3"><span className="sr-only">Loading verified payments...</span>{[0, 1, 2].map(item => <span key={item} className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4 motion-reduce:animate-none"><span className="size-11 rounded-xl bg-slate-200 sm:size-12" /><span className="flex-1 space-y-2"><span className="block h-3 w-2/5 rounded bg-slate-200" /><span className="block h-2.5 w-3/5 rounded bg-slate-100" /></span><span className="h-3 w-20 rounded bg-slate-200" /></span>)}</div>}
      {!loading && error && <div className="rounded-2xl border border-red-100 bg-red-50/80 p-4 text-center"><span className="mx-auto grid size-10 place-items-center rounded-xl bg-white text-red-600 shadow-sm ring-1 ring-red-100"><AlertCircle size={18} aria-hidden="true" /></span><p role="alert" className="mt-2 text-sm font-medium text-red-700">Unable to load verified payments. {error}</p>{onRetry && <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" />Retry</Button>}</div>}
      {!loading && !error && verified.length === 0 && <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-slate-50 px-4 py-7 text-center"><span className="mx-auto grid size-11 place-items-center rounded-xl bg-white text-teal-700 shadow-sm ring-1 ring-blue-100"><ReceiptText size={19} aria-hidden="true" /></span><p className="mt-3 text-sm font-semibold text-slate-900">No verified payments</p><p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">No approved payment or receipt records are available for this branch yet.</p></div>}
      {!loading && !error && verified.map(payment => {
        const MethodIcon = methodIcons[payment.method] ?? ReceiptText
        const iconStyle = methodStyles[payment.method] ?? 'bg-slate-50 text-slate-700 ring-slate-200/80'
        const academicContext = [payment.courseName, payment.batchName].filter(Boolean).join(' · ') || 'Course / batch unavailable'
        const referenceText = [
          payment.challanReference && `Challan ${payment.challanReference}`,
          payment.receiptReference && `Receipt ${payment.receiptReference}`,
        ].filter(Boolean)
        const content = <>
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl shadow-sm ring-1 sm:size-[52px] ${iconStyle}`}><MethodIcon size={23} strokeWidth={1.9} aria-hidden="true" /></span>
          <span className="min-w-0">
            <strong className="block truncate text-[13px] font-bold leading-4 text-slate-900 sm:text-sm">{payment.studentName}</strong>
            <span className="mt-0.5 block truncate text-[11px] leading-4 text-slate-600 sm:text-xs" title={academicContext}>{academicContext}</span>
            <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/80 sm:text-[11px]">
              <MethodIcon size={13} aria-hidden="true" />
              <span className="truncate">{payment.method || 'Payment method unavailable'}</span>
            </span>
          </span>
          <span className="flex min-w-0 flex-col items-end gap-1 text-right">
            <span className="flex items-center gap-1.5">
              <strong className="whitespace-nowrap text-[13px] font-bold leading-4 tracking-tight text-teal-800 sm:text-sm">{formatAmount(payment.amount)}</strong>
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80" title="Verified" aria-hidden="true"><Check size={13} strokeWidth={2.5} /></span>
            </span>
            <span className="sr-only">Verified</span>
            <span className="flex max-w-full flex-col items-end text-[9px] font-semibold leading-3.5 text-teal-800 sm:text-[10px]" title={referenceText.join(' · ')}>
              {referenceText.length ? referenceText.map(reference => <span key={reference} className="max-w-full truncate">{reference}</span>) : <span>Reference unavailable</span>}
            </span>
          </span>
        </>
        const cardClass = 'grid min-h-[96px] w-full min-w-0 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-2xl border border-indigo-100/90 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 px-3 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_8px_18px_rgba(30,64,175,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-[104px] sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:gap-x-3 sm:px-4'
        return onOpenReceipt && payment.receiptId
          ? <button key={payment.id} type="button" aria-label={`View receipt ${payment.receiptReference} for ${payment.studentName}`} onClick={() => onOpenReceipt(payment)} className={cardClass}>{content}</button>
          : <article key={payment.id} className={cardClass}>{content}</article>
      })}
    </CardContent>
  </Card>
}
