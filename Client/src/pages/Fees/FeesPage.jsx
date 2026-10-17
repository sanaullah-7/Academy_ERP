/** Purpose: Branch-scoped DEMO challan and verified payment workflow. */
import { useEffect, useMemo, useState } from 'react'
import { Banknote, CircleAlert, Download, Loader2, Printer, ReceiptText, RefreshCw, Search } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../../components/ui/dialog.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { financialService } from '../../services/financialService.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf, exportChallanPdf, exportReceiptPdf } from '../../utils/pdfHelpers.js'
import { getLocalDateOnly } from '../../utils/formatDate.js'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  useTableSelection,
  useColumnVisibility,
  TableToolbarActions,
  BulkActionBar,
} from '../../components/Shared/TableUtilities.jsx'

const feeColumns = [
  { key: 'student', label: 'Student / Roll', required: true },
  { key: 'courseBatch', label: 'Course & Batch' },
  { key: 'description', label: 'Description' },
  { key: 'totalFee', label: 'Total Fee' },
  { key: 'paid', label: 'Paid' },
  { key: 'remaining', label: 'Remaining' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', required: true },
]

const today = getLocalDateOnly
const money = value => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)
export default function FeesPage() {
  const { branchId, branch, scopeKey } = useBranch(), { can } = usePermissions()
  const location=useLocation(), navigate=useNavigate()
  const [result,setResult]=useState(null), [request,setRequest]=useState(0), [search,setSearch]=useState(''), [status,setStatus]=useState('All'), [dialog,setDialog]=useState(null), [error,setError]=useState(''), [exportError,setExportError]=useState(''), [message,setMessage]=useState(''), [busy,setBusy]=useState(false), [selectedChallanId,setSelectedChallanId]=useState(''), [selectedBranchId,setSelectedBranchId]=useState('')
  const [challan,setChallan]=useState({enrollmentId:'',description:'',amount:'',issueDate:today(),dueDate:today()}), [payment,setPayment]=useState({challanId:'',amount:'',method:'Cash'})
  const requestedReceiptId=location.state?.receiptId
  useEffect(()=>{let active=true;financialService.overview({branchId}).then(data=>{if(active){setResult({scopeKey,request,data});const selectedPayment=requestedReceiptId?data.payments.find(item=>item.receiptId===requestedReceiptId):null;if(selectedPayment){setSelectedChallanId(selectedPayment.challanId);setSelectedBranchId(branchId);setMessage('Dashboard se selected verified payment neeche highlight ki gayi hai.');setSearch('');setStatus('All')}if(requestedReceiptId)navigate(location.pathname,{replace:true,state:null})}},e=>active&&setResult({scopeKey,request,error:e.message}));return()=>{active=false}},[branchId,scopeKey,request,location.pathname,requestedReceiptId,navigate])
  const current=result?.scopeKey===scopeKey&&result.request===request?result:null, data=current?.data
  const highlightedChallanId=selectedBranchId===branchId?selectedChallanId:''
  useEffect(()=>{if(highlightedChallanId&&data)document.getElementById(`fee-row-${highlightedChallanId}`)?.scrollIntoView?.({block:'center'})},[highlightedChallanId,data])
  const rows=useMemo(()=>{const needle=search.trim().toLowerCase(); return (data?.challans??[]).filter(x=>(status==='All'||x.status===status||(status==='Due'&&['Unpaid','Partial'].includes(x.status)))&&(!needle||`${x.studentName} ${x.reference} ${x.courseName} ${x.batchName}`.toLowerCase().includes(needle)))},[data,search,status])
  const totals={collected:(data?.payments??[]).reduce((s,x)=>s+x.amount,0),outstanding:(data?.challans??[]).reduce((s,x)=>s+x.balance,0),overdue:(data?.challans??[]).filter(x=>x.status==='Overdue').reduce((s,x)=>s+x.balance,0),today:(data?.payments??[]).filter(x=>x.paidAt.slice(0,10)===today()).reduce((s,x)=>s+x.amount,0)}
  async function submitChallan(e){e.preventDefault();setBusy(true);setError('');try{await financialService.createChallan({...challan,amount:Number(challan.amount)},{branchId});setDialog(null);setMessage('Challan issued successfully.');setRequest(x=>x+1)}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function submitPayment(e){e.preventDefault();setBusy(true);setError('');try{await financialService.recordPayment({...payment,amount:Number(payment.amount)},{branchId});setDialog(null);setMessage('Verified payment and receipt saved. Use the Receipt action when you want to view it.');setRequest(x=>x+1)}catch(e){setError(e.message)}finally{setBusy(false)}}
  const openPayment=x=>{setPayment({challanId:x.id,amount:String(x.balance),method:'Cash'});setDialog({type:'payment',item:x});setError('')}
  const chooseEnrollment = enrollmentId => {
    const enrollment = data.enrollments.find(item => item.id === enrollmentId)
    const expected = Number.isFinite(enrollment?.netFee) ? enrollment.netFee : enrollment?.configuredFee
    setChallan(previous => ({ ...previous, enrollmentId, amount: Number.isFinite(expected) ? String(expected) : previous.amount }))
  }
  const columnVisibility = useColumnVisibility(feeColumns, 'fees')
  const selection = useTableSelection(rows, x => x.id)

  function exportReport() {
    setExportError('')
    const scope = selection.getExportScope()
    const targetRows = scope.items
    try {
      downloadCsv(
        `tsa-${branch?.name ?? 'branch'}-fees-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Branch','Challan Reference','Student','Student Number','Course','Batch','Description','Total Fee (PKR)','Paid (PKR)','Remaining (PKR)','Issue Date','Due Date','Status'],
        targetRows.map(x=>[branch?.name ?? '',x.reference,x.studentName,x.studentNumber??'',x.courseName,x.batchName,x.description,x.amount,x.paidAmount,x.balance,x.issueDate,x.dueDate,x.status])
      )
      setMessage(`Fees report CSV export completed (${targetRows.length} records).`)
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Fees report could not be exported.')
    }
  }

  function exportFeesPdf() {
    setExportError('')
    const scope = selection.getExportScope()
    const targetRows = scope.items
    try {
      exportTablePdf({
        filename: `tsa-${branch?.name ?? 'branch'}-fees-ledger-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: 'Fees & Payment Ledger Report',
        branchName: branch?.name ?? 'The Scholar Coaching Academy',
        headers: ['Challan Ref', 'Student / Roll', 'Course & Batch', 'Total Fee', 'Paid', 'Remaining', 'Due Date', 'Status'],
        rows: targetRows.map(x => [
          x.reference,
          `${x.studentName} (#${x.studentNumber ?? '—'})`,
          `${x.courseName} - ${x.batchName}`,
          money(x.amount),
          money(x.paidAmount),
          money(x.balance),
          x.dueDate,
          x.status,
        ]),
        filterSummary: scope.summary,
      })
      setMessage(`Fees PDF directory report downloaded (${targetRows.length} records).`)
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Fees PDF report could not be exported.')
    }
  }
  if(!current)return <DashboardLayout><p role="status" className="flex items-center gap-2 p-8"><Loader2 className="animate-spin"/>Loading fee records...</p></DashboardLayout>
  if(current.error)return <DashboardLayout><p role="alert" className="p-8 text-destructive">{current.error} <Button onClick={()=>setRequest(x=>x+1)}>Retry</Button></p></DashboardLayout>
  const renderStatus = (st) => {
    if (st === 'Paid') return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-600" />Paid</span>
    if (st === 'Partial') return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"><span className="size-1.5 rounded-full bg-amber-500" />Partial</span>
    if (st === 'Overdue') return <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700"><span className="size-1.5 rounded-full bg-rose-600" />Overdue</span>
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700"><span className="size-1.5 rounded-full bg-slate-500" />{st}</span>
  }

  return <DashboardLayout><div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Financial Registry · {branch?.name}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Fees &amp; Payment Ledger</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Saved branch challans, balances and verified receipts.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TableToolbarActions
          onRefresh={() => setRequest(x => x + 1)}
          columns={feeColumns}
          visibleColumns={columnVisibility.visibleColumns}
          onToggleColumn={columnVisibility.toggleColumn}
          onResetColumns={columnVisibility.resetColumns}
          onExportPdf={exportFeesPdf}
          onExportCsv={exportReport}
          onPrint={() => window.print()}
          exportScopeSummary={selection.getExportScope().summary}
        />
        {can(PERMISSIONS.FEES_MANAGE)&&<Button size="sm" className="h-9 gap-1.5 shadow-sm" onClick={()=>{setDialog({type:'challan'});setError('')}}><ReceiptText size={15}/>Generate Challan</Button>}
      </div>
    </header>
    {message&&<p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm font-medium text-emerald-800">{message}</p>}
    {exportError&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{exportError}</p>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ['Total Collected', totals.collected, Banknote, 'text-emerald-700 bg-emerald-50 border-emerald-200/60'],
        ['Outstanding Dues', totals.outstanding, ReceiptText, 'text-amber-700 bg-amber-50 border-amber-200/60'],
        ['Overdue Dues', totals.overdue, CircleAlert, 'text-rose-700 bg-rose-50 border-rose-200/60'],
        ["Today's Counter Inflow", totals.today, Banknote, 'text-primary bg-[#F9EBEE] border-[#f0d5d9]']
      ].map(([label, value, Icon, tone]) => (
        <Card key={label} className="py-0 overflow-hidden border border-border/80 shadow-xs">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <strong className="mt-1.5 block text-2xl font-bold tracking-tight text-foreground tabular-nums">{money(value)}</strong>
            </div>
            <span className={`grid size-10 place-items-center rounded-xl border ${tone}`}><Icon size={19} /></span>
          </CardContent>
        </Card>
      ))}
    </section>
    <Card className="py-0 border border-border/80 shadow-xs">
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15}/>
          <Input className="pl-9 h-9 text-xs" placeholder="Search student, course or challan..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
            {['All','Paid','Due','Overdue'].map(x=>(
              <button
                key={x}
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${status === x ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={()=>setStatus(x)}
              >
                {x}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={()=>{setSearch('');setStatus('All')}}>
            <RefreshCw size={13}/>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
    {selection.selectedCount > 0 && (
      <BulkActionBar
        selectedCount={selection.selectedCount}
        totalCount={rows.length}
        onClear={selection.clearSelection}
        onSelectAllMatching={selection.selectAllMatching}
        isAllMatchingSelected={selection.isAllMatchingSelected}
        onExportCsv={exportReport}
        onExportPdf={exportFeesPdf}
        deleteDisabledMessage="Financial records and challans cannot be bulk-deleted (Audit protection)"
      />
    )}
    {rows.length===0?<div className="rounded-xl border border-dashed border-border/80 p-10 text-center text-xs text-muted-foreground">No challans match this view.</div>:<div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-wide dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-200"><tr><th scope="col" className="w-10 px-3 py-2.5 text-center"><input type="checkbox" aria-label="Select all challans" checked={selection.isAllSelected} onChange={selection.toggleSelectAll} className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"/></th>{columnVisibility.isVisible('student')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Student / Roll</th>}{columnVisibility.isVisible('courseBatch')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Course &amp; Batch</th>}{columnVisibility.isVisible('description')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Description</th>}{columnVisibility.isVisible('totalFee')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Total Fee</th>}{columnVisibility.isVisible('paid')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Paid</th>}{columnVisibility.isVisible('remaining')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Remaining</th>}{columnVisibility.isVisible('dueDate')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Due Date</th>}{columnVisibility.isVisible('status')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Status</th>}{columnVisibility.isVisible('actions')&&<th className="px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">Actions</th>}</tr></thead><tbody className="divide-y divide-border/50">{rows.map(x=>{const isRowSelected=selection.isSelected(x.id);return(<tr id={`fee-row-${x.id}`} key={x.id} className={`${isRowSelected?'bg-[#F9EBEE]/50':highlightedChallanId===x.id?'bg-[#F9EBEE]/60 ring-2 ring-inset ring-[#940016]':'hover:bg-[#F9EBEE]/20 transition-colors'}`}><td className="w-10 px-3 py-2.5 text-center" onClick={e=>e.stopPropagation()}><input type="checkbox" aria-label={`Select challan for ${x.studentName}`} checked={isRowSelected} onChange={()=>selection.toggleSelect(x.id)} className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"/></td>{columnVisibility.isVisible('student')&&<td className="px-3.5 py-2.5"><strong className="text-foreground font-semibold">{x.studentName}</strong>{highlightedChallanId===x.id&&<Badge className="ml-2 text-[10px]">Selected payment</Badge>}<small className="block text-xs text-muted-foreground">Student #{x.studentNumber??'—'} · {x.reference}</small></td>}{columnVisibility.isVisible('courseBatch')&&<td className="px-3.5 py-2.5 font-medium text-xs">{x.courseName}<small className="block text-muted-foreground">{x.batchName}</small></td>}{columnVisibility.isVisible('description')&&<td className="px-3.5 py-2.5 text-xs text-muted-foreground">{x.description}</td>}{columnVisibility.isVisible('totalFee')&&<td className="px-3.5 py-2.5 font-semibold tabular-nums text-foreground"><div>{money(x.amount)}</div>{x.discountAmount>0&&<span className="inline-block text-[10px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded mt-0.5">-{money(x.discountAmount)} concession</span>}</td>}{columnVisibility.isVisible('paid')&&<td className="px-3.5 py-2.5 font-semibold tabular-nums text-emerald-700">{money(x.paidAmount)}</td>}{columnVisibility.isVisible('remaining')&&<td className="px-3.5 py-2.5 font-semibold tabular-nums text-red-600">{money(x.balance)}</td>}{columnVisibility.isVisible('dueDate')&&<td className="px-3.5 py-2.5 text-xs text-muted-foreground">{x.dueDate}</td>}{columnVisibility.isVisible('status')&&<td className="px-3.5 py-2.5">{renderStatus(x.status)}</td>}{columnVisibility.isVisible('actions')&&<td className="px-3.5 py-2.5"><div className="flex gap-1.5"><Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={()=>setDialog({type:'viewChallan',item:x})}>Challan</Button>{x.balance>0&&can(PERMISSIONS.FEES_COLLECT)&&<Button size="sm" className="h-7 px-2.5 text-xs shadow-xs" onClick={()=>openPayment(x)}>Collect</Button>}{data.payments.find(p=>p.challanId===x.id)&&<Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs" onClick={()=>setDialog({type:'receipt',item:data.payments.find(p=>p.challanId===x.id)})}>Receipt</Button>}</div></td>}</tr>)})}</tbody></table></div>}
    <Dialog open={!!dialog} onOpenChange={open=>!open&&!busy&&setDialog(null)}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto"><DialogTitle>{dialog?.type==='challan'?'Generate Challan':dialog?.type==='payment'?'Collect Payment':dialog?.type==='receipt'?'Verified Receipt':'Challan'}</DialogTitle><DialogDescription>Branch-scoped fictional DEMO financial record.</DialogDescription>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      {dialog?.type==='challan'&&<form onSubmit={submitChallan} className="grid gap-3"><select required className="min-h-11 rounded-md border px-3" value={challan.enrollmentId} onChange={e=>chooseEnrollment(e.target.value)}><option value="">Select enrolled student</option>{data.enrollments.filter(x=>!data.challans.some(challanRecord=>challanRecord.enrollmentId===x.id)).map(x=><option value={x.id} key={x.id}>{x.studentName} · {x.courseName} · {x.batchName}{Number.isFinite(x.netFee??x.configuredFee)?` · ${money(x.netFee??x.configuredFee)}`:''}</option>)}</select><Input required placeholder="Fee description" value={challan.description} onChange={e=>setChallan({...challan,description:e.target.value})}/><Input required min="1" type="number" placeholder="Amount PKR" value={challan.amount} readOnly={Number.isFinite(data.enrollments.find(item=>item.id===challan.enrollmentId)?.netFee??data.enrollments.find(item=>item.id===challan.enrollmentId)?.configuredFee)} onChange={e=>setChallan({...challan,amount:e.target.value})}/>{Number.isFinite(data.enrollments.find(item=>item.id===challan.enrollmentId)?.netFee??data.enrollments.find(item=>item.id===challan.enrollmentId)?.configuredFee)&&<p className="text-xs text-muted-foreground">Amount is the confirmed net fee saved with this enrollment.</p>}<label>Issue date<Input required type="date" value={challan.issueDate} onChange={e=>setChallan({...challan,issueDate:e.target.value})}/></label><label>Due date<Input required type="date" value={challan.dueDate} onChange={e=>setChallan({...challan,dueDate:e.target.value})}/></label><Button type="submit" disabled={busy}>{busy?'Saving...':'Issue Challan'}</Button></form>}
      {dialog?.type==='payment'&&<form onSubmit={submitPayment} className="grid gap-3"><p>Outstanding: <strong>{money(dialog.item.balance)}</strong></p><Input required min="1" max={dialog.item.balance} type="number" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/><select className="min-h-11 rounded-md border px-3" value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value})}>{['Cash','Bank Transfer','Mobile Wallet','EasyPaisa'].map(x=><option key={x}>{x}</option>)}</select><Button type="submit" disabled={busy}>{busy?'Recording...':'Record Verified Payment'}</Button></form>}
      {['viewChallan','receipt'].includes(dialog?.type)&&(
        <div className="rounded-xl border border-border/80 bg-slate-50/50 p-5 space-y-4 print:p-8">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#940016]">The Scholar Coaching Academy</p>
              <h2 className="text-lg font-bold text-foreground">{dialog.type==='receipt'?'Official Fee Payment Receipt':'Student Fee Challan & Invoice'}</h2>
              <p className="text-xs text-muted-foreground">Campus: {branch?.name ?? 'Main Campus'}</p>
            </div>
            <Badge className={dialog.type==='receipt' ? 'bg-emerald-600 text-white' : 'bg-[#940016] text-white'}>
              {dialog.type==='receipt' ? 'VERIFIED RECEIPT' : (dialog.item.status || 'CHALLAN').toUpperCase()}
            </Badge>
          </div>

          {dialog.type==='receipt' ? (
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-border/70 bg-white p-3 space-y-1">
                <span className="font-bold text-[#940016] block uppercase tracking-wider text-[10px]">Student Particulars</span>
                <p><span className="text-muted-foreground">Name:</span> <strong className="text-foreground">{dialog.item.studentName}</strong></p>
                <p><span className="text-muted-foreground">Student ID:</span> {dialog.item.studentNumber || '—'}</p>
                <p><span className="text-muted-foreground">Challan Ref:</span> {dialog.item.challanReference || '—'}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-white p-3 space-y-1">
                <span className="font-bold text-[#940016] block uppercase tracking-wider text-[10px]">Payment Summary</span>
                <p><span className="text-muted-foreground">Receipt Ref:</span> <span className="font-mono font-bold text-foreground">{dialog.item.receiptReference}</span></p>
                <p><span className="text-muted-foreground">Payment Method:</span> {dialog.item.method}</p>
                <p><span className="text-muted-foreground">Amount Paid:</span> <strong className="text-emerald-700 text-sm">{money(dialog.item.amount)}</strong></p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-border/70 bg-white p-3 space-y-1">
                <span className="font-bold text-[#940016] block uppercase tracking-wider text-[10px]">Student Details</span>
                <p><span className="text-muted-foreground">Name:</span> <strong className="text-foreground">{dialog.item.studentName}</strong></p>
                <p><span className="text-muted-foreground">Student ID:</span> {dialog.item.studentNumber || '—'}</p>
                <p><span className="text-muted-foreground">Program:</span> {dialog.item.courseName} ({dialog.item.batchName})</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-white p-3 space-y-1">
                <span className="font-bold text-[#940016] block uppercase tracking-wider text-[10px]">Challan Details</span>
                <p><span className="text-muted-foreground">Challan Ref:</span> <span className="font-mono font-bold text-foreground">{dialog.item.reference}</span></p>
                <p><span className="text-muted-foreground">Due Date:</span> {dialog.item.dueDate}</p>
                <p><span className="text-muted-foreground">Total / Balance:</span> <strong>{money(dialog.item.amount)}</strong> / <span className="text-rose-600 font-bold">{money(dialog.item.balance)}</span></p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 print:hidden">
            {dialog.type==='viewChallan' && (
              <Button
                className="h-8 gap-1.5 text-xs bg-[#940016] text-white hover:bg-[#7a0012] cursor-pointer"
                onClick={() => {
                  const linkedStudent = data.students?.find(s => s.id === dialog.item.studentId) || { name: dialog.item.studentName, studentNumber: dialog.item.studentNumber }
                  exportChallanPdf({ challan: dialog.item, student: linkedStudent, branchName: branch?.name })
                }}
              >
                <Download size={14} />
                Download Challan PDF (Template B)
              </Button>
            )}
            {dialog.type==='receipt' && (
              <Button
                className="h-8 gap-1.5 text-xs bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                onClick={() => {
                  const linkedChallan = data.challans?.find(c => c.id === dialog.item.challanId) || { reference: dialog.item.challanReference }
                  const linkedStudent = data.students?.find(s => s.id === linkedChallan.studentId) || { name: dialog.item.studentName }
                  exportReceiptPdf({ payment: dialog.item, challan: linkedChallan, student: linkedStudent, branchName: branch?.name })
                }}
              >
                <Download size={14} />
                Download Receipt PDF (Template C)
              </Button>
            )}
            <Button variant="outline" className="h-8 gap-1.5 text-xs" onClick={()=>window.print()}>
              <Printer size={14}/>
              Print
            </Button>
          </div>
        </div>
      )}
      <DialogFooter><Button variant="outline" onClick={()=>setDialog(null)}>Close</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>
}
