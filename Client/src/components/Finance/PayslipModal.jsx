import { getAcademyDateOnly } from '../../utils/formatDate.js'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { exportPayslipPdf } from '../../utils/pdfHelpers.js'
import AcademyLogo from '../Layout/AcademyLogo.jsx'
import { Download, Printer } from 'lucide-react'

export default function PayslipModal({
  open,
  onClose,
  payslipData,
  branchName = 'Main Campus',
}) {
  const [downloading, setDownloading] = useState(false)

  if (!payslipData || !payslipData.line) return null

  const { line, teacher, payments, branch, organization } = payslipData
  const academyName = organization?.academyName || 'The Scholar Coaching Academy'

  const earnItems = [
    { label: `Base Earnings (${line.calculationDetails?.description || line.calculationMethod})`, amount: line.baseEarnings || 0 },
    { label: 'Allowances (Conveyance & Medical)', amount: line.allowances || 0 },
  ]
  if (line.adjustments > 0) {
    earnItems.push({ label: 'Performance / Merit Bonus', amount: line.adjustments })
  }
  const grossEarnings = (line.baseEarnings || 0) + (line.allowances || 0) + (line.adjustments > 0 ? line.adjustments : 0)

  const dedItems = [
    { label: 'Standard Taxes & Deductions', amount: line.deductions || 0 },
    { label: 'Salary Advance Recovered', amount: line.advancesDeducted || 0 },
  ]
  if (line.adjustments < 0) {
    dedItems.push({ label: 'Manual Deduction / Fine', amount: Math.abs(line.adjustments) })
  }
  const totalDeductions = (line.deductions || 0) + (line.advancesDeducted || 0) + (line.adjustments < 0 ? Math.abs(line.adjustments) : 0)

  function handlePrint() {
    document.body.classList.add('is-printing-modal')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('is-printing-modal')
    }, 500)
  }

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      exportPayslipPdf({
        payslip: payslipData,
        branchName: branch?.name || branchName,
      })
    } finally {
      setDownloading(false)
    }
  }

  const isPaid = line.status === 'Paid'
  const isPartial = line.status === 'Partially Paid'

  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-lg font-bold text-gray-900">Official Faculty Payslip</DialogTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 text-xs">
                <Printer size={14} />
                Print
              </Button>
              <Button type="button" size="sm" onClick={handleDownloadPdf} disabled={downloading} className="h-8 gap-1.5 text-xs bg-[#940016] text-white hover:bg-[#7a0012]">
                <Download size={14} />
                {downloading ? 'Exporting...' : 'Download PDF'}
              </Button>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Confidential institutional compensation slip for {teacher?.name || line.teacherName}
          </DialogDescription>
        </DialogHeader>

        {/* Printable Payslip Document Container */}
        <div id="printable-payslip" className="mt-4 rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-6 text-foreground print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:space-y-4 print:w-full">
          {/* Branded Official Institutional Header */}
          <div className="border-b-2 border-[#940016] pb-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-white border border-slate-200 grid place-items-center p-1 shadow-2xs print:border-none print:shadow-none">
                <AcademyLogo className="size-9" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#940016]">Official Financial System</p>
                <h1 className="text-lg font-black uppercase tracking-tight text-[#940016] leading-tight">
                  {academyName}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {branch?.name || branchName} &bull; {branch?.location || 'Official Campus'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold uppercase border ${
                isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : isPartial ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-[#940016] border-rose-300'
              }`}>
                {line.status}
              </span>
              <p className="text-[11px] text-slate-500 font-mono mt-1 font-semibold">Ref: {line.id}</p>
            </div>
          </div>

          {/* Teacher and Period Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs print:grid-cols-4 print:bg-slate-50/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Teacher</span>
              <strong className="text-slate-900 text-xs">{teacher?.name || line.teacherName}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Designation</span>
              <span className="text-slate-700">{teacher?.qualification || line.designation || 'Faculty Member'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Period</span>
              <strong className="text-slate-900">{line.yearMonth}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Method</span>
              <span className="capitalize font-semibold text-[#940016]">{line.calculationMethod.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables (Side by side on print and desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
            {/* Earnings */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="bg-[#940016] text-white px-3.5 py-2 text-xs font-bold flex justify-between">
                <span>Earnings Breakdown</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {earnItems.map((item, idx) => (
                  <div key={idx} className="px-3.5 py-2 flex justify-between gap-2">
                    <span className="text-slate-600 leading-4">{item.label}</span>
                    <span className="font-semibold text-slate-900 shrink-0">PKR {Number(item.amount).toLocaleString()}</span>
                  </div>
                ))}
                <div className="px-3.5 py-2 bg-slate-50 font-bold flex justify-between text-slate-900">
                  <span>Gross Earnings</span>
                  <span>PKR {grossEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="bg-[#1e293b] text-white px-3.5 py-2 text-xs font-bold flex justify-between">
                <span>Deductions &amp; Advances</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {dedItems.map((item, idx) => (
                  <div key={idx} className="px-3.5 py-2 flex justify-between gap-2">
                    <span className="text-slate-600 leading-4">{item.label}</span>
                    <span className="font-semibold text-slate-900 shrink-0">PKR {Number(item.amount).toLocaleString()}</span>
                  </div>
                ))}
                <div className="px-3.5 py-2 bg-slate-50 font-bold flex justify-between text-slate-900">
                  <span>Total Deductions</span>
                  <span>PKR {totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="rounded-xl bg-[#940016] text-white p-4 flex flex-wrap items-center justify-between gap-2 shadow-xs print:rounded-lg print:p-3.5">
            <div>
              <span className="text-xs uppercase font-semibold text-white/80 block">Net Salary Payable</span>
              <span className="text-xl font-extrabold tracking-tight">
                PKR {Number(line.netPayable).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-white/80 block">Disbursed (Paid)</span>
              <span className="text-base font-bold text-emerald-300">
                PKR {Number(line.totalPaid).toLocaleString()}
              </span>
              {line.outstanding > 0 && (
                <span className="block text-xs text-white/90 mt-0.5">
                  Remaining Due: <strong>PKR {Number(line.outstanding).toLocaleString()}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Disbursement History */}
          {payments && payments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900">Verified Disbursement History</h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Ref #</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td className="p-2.5 text-slate-600">{p.paidAt ? getAcademyDateOnly(new Date(p.paidAt)) : 'N/A'}</td>
                        <td className="p-2.5 font-medium">{p.method}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">{p.transactionReference}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">PKR {Number(p.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs print:pt-10 print:mt-6 print:grid-cols-2">
            <div>
              <div className="border-b border-slate-400 h-10 w-4/5 mx-auto mb-1"></div>
              <span className="text-slate-600 font-medium text-[11px]">Faculty Member Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10 w-4/5 mx-auto mb-1"></div>
              <span className="text-slate-600 font-medium text-[11px]">Authorized Accountant / Super Admin</span>
            </div>
          </div>

          {/* Official Document Print Footer */}
          <div className="hidden print:flex items-center justify-between pt-3 border-t border-slate-200 text-[10px] text-slate-500">
            <span>{academyName} &bull; Official Computer-Generated Verified Payslip</span>
            <span>Printed: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/60 print:hidden">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
