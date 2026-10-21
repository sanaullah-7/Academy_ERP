import { REPORTING_PERIODS, reportingDay, matchesReportingPeriod } from '../../utils/reportingPeriod.js'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useTableSelection, useColumnVisibility } from '../../hooks/useTableUtilities.js'
import Pagination from '../../components/Shared/Pagination.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Banknote, CheckCircle2, CircleAlert, Download, Loader2, MoreVertical, Printer, ReceiptText, RefreshCw, Search } from 'lucide-react'
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
import tsaLogo from '../../assets/images/tsa-logo.png'
import { getLocalDateOnly } from '../../utils/formatDate.js'
import { feeCardMetrics } from '../../utils/feeCardMetrics.js'
import { useLocation, useNavigate } from 'react-router-dom'
import {
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

function FeeActionMenu({ item, paymentItem, canCollect, onChallan, onCollect, onReceipt, openUp = false }) {
  const [open, setOpen] = useState(false)
  const [openUpwards, setOpenUpwards] = useState(openUp)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [open])

  const toggleMenu = () => {
    if (!open && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (openUp || spaceBelow < 160) {
        setOpenUpwards(true)
      } else {
        setOpenUpwards(false)
      }
    }
    setOpen(v => !v)
  }

  return (
    <div
      ref={menuRef}
      className={`relative inline-flex items-center justify-center text-center ${open ? 'z-50' : 'z-auto'}`}
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={`Actions for ${item.studentName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        className="grid size-6 place-items-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Actions for ${item.studentName}`}
          className={`absolute right-0 z-50 w-36 rounded-xl border border-slate-200/90 bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 text-left ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault()
              setOpen(false)
            }
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            onClick={() => {
              setOpen(false)
              onChallan()
            }}
          >
            <ReceiptText size={13} className="text-[#940016]" />
            <span>Challan</span>
          </button>

          {item.balance > 0 && canCollect && (
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-[#940016] hover:bg-[#F9EBEE] rounded-lg cursor-pointer transition-colors"
              onClick={() => {
                setOpen(false)
                onCollect()
              }}
            >
              <Banknote size={13} className="text-[#940016]" />
              <span>Collect Fee</span>
            </button>
          )}

          {paymentItem && (
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
              onClick={() => {
                setOpen(false)
                onReceipt()
              }}
            >
              <Printer size={13} className="text-emerald-600" />
              <span>Receipt</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function FeesPage() {
  const { branchId, branch, scopeKey } = useBranch(), { can } = usePermissions()
  const location=useLocation(), navigate=useNavigate()
  const [result,setResult]=useState(() => peekPageResource('fees', { scopeKey, request: 0 })), [request,setRequest]=useState(0), [search,setSearch]=useState(''), [status,setStatus]=useState('All'), [dialog,setDialog]=useState(null), [error,setError]=useState(''), [exportError,setExportError]=useState(''), [message,setMessage]=useState(''), [busy,setBusy]=useState(false), [selectedChallanId,setSelectedChallanId]=useState(''), [selectedBranchId,setSelectedBranchId]=useState('')
  const [challan,setChallan]=useState({enrollmentId:'',description:'',amount:'',issueDate:today(),dueDate:today()}), [payment,setPayment]=useState({challanId:'',amount:'',method:'Cash'})
  const [pageState,setPageState]=useState({key:'',page:1})
  const [period,setPeriod]=useState('All')
  const [dateRange,setDateRange]=useState({start:'',end:''})
  const [academyToday,setAcademyToday]=useState(()=>reportingDay(new Date()))
  useEffect(()=>{const timer=window.setInterval(()=>setAcademyToday(reportingDay(new Date())),60000);return()=>window.clearInterval(timer)},[])
  const requestedReceiptId=location.state?.receiptId
  useEffect(()=>{let active=true;const loadVersion=capturePageVersion();financialService.overview({branchId}).then(data=>{if(active){setResult(rememberPageResource('fees',{scopeKey,request,data},loadVersion));const selectedPayment=requestedReceiptId?data.payments.find(item=>item.receiptId===requestedReceiptId):null;if(selectedPayment){setSelectedChallanId(selectedPayment.challanId);setSelectedBranchId(branchId);setMessage('Dashboard se selected verified payment neeche highlight ki gayi hai.');setSearch('');setStatus('All');setPeriod('All');setDateRange({start:'',end:''});setPageState({key:'',page:1})}if(requestedReceiptId)navigate(location.pathname,{replace:true,state:null})}},e=>active&&setResult({scopeKey,request,error:e.message}));return()=>{active=false}},[branchId,scopeKey,request,location.pathname,requestedReceiptId,navigate])
  const current=result?.scopeKey===scopeKey&&result.request===request?result:null, data=current?.data
  const highlightedChallanId=selectedBranchId===branchId?selectedChallanId:''
  useEffect(()=>{if(highlightedChallanId&&data)document.getElementById(`fee-row-${highlightedChallanId}`)?.scrollIntoView?.({block:'center'})},[highlightedChallanId,data])
  const datedChallans=useMemo(()=>(data?.challans??[]).filter(item=>item.branchId===branchId&&matchesReportingPeriod(item.issueDate,period,dateRange,academyToday)),[data,branchId,period,dateRange,academyToday])
  const rows=useMemo(()=>{const needle=search.trim().toLowerCase(); return datedChallans.filter(x=>(status==='All'||x.status===status||(status==='Due'&&['Unpaid','Partial'].includes(x.status)))&&(!needle||`${x.studentName} ${x.reference} ${x.courseName} ${x.batchName}`.toLowerCase().includes(needle)))},[datedChallans,search,status])
  const statusCounts = useMemo(() => {
    const challans = datedChallans
    return {
      All: challans.length,
      Paid: challans.filter(x => x.status === 'Paid').length,
      Due: challans.filter(x => ['Unpaid', 'Partial'].includes(x.status)).length,
      Overdue: challans.filter(x => x.status === 'Overdue').length,
    }
  }, [datedChallans])
  const [pageSize,setPageSize]=useState(15)
  const pageKey=JSON.stringify([branchId,search,status,pageSize,period,dateRange.start,dateRange.end,academyToday])
  const page=Math.min(pageState.key===pageKey?pageState.page:1,Math.max(1,Math.ceil(rows.length/pageSize)))
  const pageRows=rows.slice((page-1)*pageSize,page*pageSize)
  const totals=feeCardMetrics(data,branchId)
  async function submitChallan(e){e.preventDefault();setBusy(true);setError('');try{await financialService.createChallan({...challan,amount:Number(challan.amount)},{branchId});setDialog(null);setMessage('Challan issued successfully.');setRequest(x=>x+1)}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function submitPayment(e){e.preventDefault();setBusy(true);setError('');try{await financialService.recordPayment({...payment,amount:Number(payment.amount)},{branchId});setDialog(null);setMessage('Verified payment and receipt saved. Use the Receipt action when you want to view it.');setRequest(x=>x+1)}catch(e){setError(e.message)}finally{setBusy(false)}}
  const openPayment=x=>{setPayment({challanId:x.id,amount:String(x.balance),method:'Cash'});setDialog({type:'payment',item:x});setError('')}
  const chooseEnrollment = enrollmentId => {
    const enrollment = data.enrollments.find(item => item.id === enrollmentId)
    const expected = Number.isFinite(enrollment?.netFee) ? enrollment.netFee : enrollment?.configuredFee
    setChallan(previous => ({ ...previous, enrollmentId, amount: Number.isFinite(expected) ? String(expected) : previous.amount }))
  }
  const columnVisibility = useColumnVisibility(feeColumns, 'fees')
  const selection = useTableSelection(rows, x => x.id, pageRows)
  const updateFilter=callback=>{selection.clearSelection();setPageState({key:'',page:1});callback()}
  const resetFilters=()=>updateFilter(()=>{setSearch('');setStatus('All');setPeriod('All');setDateRange({start:'',end:''})})
  const invalidRange=period==='Custom'&&dateRange.start&&dateRange.end&&dateRange.start>dateRange.end

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
    if (st === 'Paid') return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 whitespace-nowrap"><span className="size-1 rounded-full bg-emerald-600" />Paid</span>
    if (st === 'Partial') return <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 whitespace-nowrap"><span className="size-1 rounded-full bg-amber-500" />Partial</span>
    if (st === 'Overdue') return <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/70 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 whitespace-nowrap"><span className="size-1 rounded-full bg-rose-600" />Overdue</span>
    return <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap"><span className="size-1 rounded-full bg-slate-500" />{st}</span>
  }

  return <DashboardLayout><div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>

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
        ['Total Collected', totals.collected, Banknote, 'text-emerald-700 bg-emerald-50 border-emerald-200/60', 'kpi-emerald'],
        ['Outstanding Dues', totals.outstanding, ReceiptText, 'text-amber-700 bg-amber-50 border-amber-200/60', 'kpi-amber'],
        ['Overdue Dues', totals.overdue, CircleAlert, 'text-rose-700 bg-rose-50 border-rose-200/60', 'kpi-maroon'],
        ["Today's Counter Inflow", totals.today, Banknote, 'text-primary bg-[#F9EBEE] border-[#f0d5d9]', 'kpi-sky']
      ].map(([label, value, Icon, tone, theme]) => (
        <Card key={label} className={`top-kpi-card ${theme} py-0 overflow-hidden border shadow-xs`}>
          <CardContent className="flex h-full flex-col justify-between gap-4 p-4">
            <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <strong className="mt-1.5 block text-2xl font-bold tracking-tight text-foreground tabular-nums">{money(value)}</strong>
            </div>
            <span className={`grid size-10 place-items-center rounded-xl border ${tone}`}><Icon size={19} /></span>
            </div>
            <div className="mt-auto text-[10px] leading-relaxed text-slate-600">
              {label === 'Total Collected' && <>
                <div className="flex flex-wrap items-center justify-between gap-1"><span>{totals.recovery == null ? 'No issued fees yet' : `${totals.recovery}% of issued fees collected`}</span><span className="font-semibold text-emerald-700">{money(totals.thisWeek)} this week</span></div>
                <div role="progressbar" aria-label="Issued fee recovery" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, totals.recovery ?? 0)} aria-valuetext={totals.recovery == null ? 'No issued fees yet' : `${totals.recovery}% of issued fees collected`} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, Math.max(0, totals.recovery ?? 0))}%` }} /></div>
              </>}
              {label === 'Outstanding Dues' && <div className="flex flex-wrap items-center justify-between gap-1"><span><span className="mr-1 inline-block size-1.5 rounded-full bg-amber-500" />{totals.pendingStudents} students with unpaid fees</span><span>{totals.pendingChallans} unpaid challans</span></div>}
              {label === 'Overdue Dues' && <div className="flex flex-wrap items-center justify-between gap-1"><span><span className="mr-1 rounded-full bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-700">{totals.overdueStudents} accounts</span>{totals.overdueChallans} overdue challans</span><button type="button" disabled={!totals.overdueChallans} onClick={()=>updateFilter(()=>{setSearch('');setStatus('Overdue');setPeriod('All');setDateRange({start:'',end:''})})} className="font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-50" aria-label="View all overdue fee challans">View All</button></div>}
              {label === "Today's Counter Inflow" && <div className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 size={13} aria-hidden="true" /><span>{totals.todayReceipts} verified receipts today</span></div>}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
    <Card className="py-0 border border-border/80 shadow-xs">
      <CardContent className="flex flex-wrap items-center gap-2 p-3.5">
        <div role="group" aria-label="Fee reporting period" className="grid w-full shrink-0 grid-cols-6 overflow-hidden rounded-lg border border-foreground/70 bg-card sm:w-auto">
          {REPORTING_PERIODS.map(value=><button key={value} type="button" aria-pressed={period===value} onClick={()=>updateFilter(()=>setPeriod(value))} className={`min-w-0 border-r border-primary/15 px-2 py-2 text-[10px] transition-colors last:border-r-0 sm:px-2.5 sm:text-[11px] ${period===value?'bg-primary/10 font-semibold text-primary':'text-muted-foreground hover:bg-primary/5 hover:text-foreground'}`}>{value}</button>)}
        </div>
        <p className="sr-only">Filter challans by issue date, Asia/Karachi. Weekly periods run Monday to Sunday.</p>
        <label className="relative min-w-0 w-full sm:w-40 sm:flex-1 sm:max-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15}/>
          <Input className="pl-9 h-9 text-xs" aria-label="Search fees" placeholder="Search student or challan..." value={search} onChange={e=>updateFilter(()=>setSearch(e.target.value))}/>
        </label>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <div className="mobile-fee-status flex items-center gap-1 rounded-xl border border-border/70 bg-slate-50/80 p-1">
            {['All', 'Paid', 'Due', 'Overdue'].map(x => {
              const isCurrent = status === x
              const count = statusCounts[x] ?? 0
              return (
                <button
                  key={x}
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#940016] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  onClick={() => updateFilter(() => setStatus(x))}
                >
                  <span>{x}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={resetFilters}>
            <RefreshCw size={13}/>
            Reset
          </Button>
        </div>
        {period==='Custom'&&<div className="flex w-full flex-wrap items-end gap-3 border-t border-border/60 pt-3">
          <label className="grid gap-1 text-xs text-muted-foreground">Start date<Input type="date" aria-label="Fee start date" value={dateRange.start} max={dateRange.end||undefined} onChange={event=>updateFilter(()=>setDateRange(current=>({...current,start:event.target.value})))} className="h-9 w-full sm:w-44"/></label>
          <label className="grid gap-1 text-xs text-muted-foreground">End date<Input type="date" aria-label="Fee end date" value={dateRange.end} min={dateRange.start||undefined} onChange={event=>updateFilter(()=>setDateRange(current=>({...current,end:event.target.value})))} className="h-9 w-full sm:w-44"/></label>
          <p role={invalidRange?'alert':undefined} className={`text-xs ${invalidRange?'text-destructive':'text-muted-foreground'}`}>{invalidRange?'End date must be on or after start date.':!dateRange.start||!dateRange.end?'Select both dates to show matching challans.':'Challan issue dates, including both dates (Asia/Karachi).'}</p>
        </div>}
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
    {rows.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border/80 p-10 text-center text-xs text-muted-foreground">
        No challans match this view.
        <div className="mt-4 text-left"><Pagination label="Fees" page={page} rows={pageSize} total={0} onPage={value=>setPageState({key:pageKey,page:value})} onRows={setPageSize}/></div>
      </div>
    ) : (
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-visible">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold text-slate-700 tracking-wider uppercase dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-200">
            <tr>
              <th scope="col" className="w-8 px-2 py-2 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all challans"
                  checked={selection.isAllSelected}
                  onChange={selection.toggleSelectAll}
                  className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"
                />
              </th>
              {columnVisibility.isVisible('student') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Student / Roll</th>
              )}
              {columnVisibility.isVisible('courseBatch') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Course &amp; Batch</th>
              )}
              {columnVisibility.isVisible('description') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Description</th>
              )}
              {columnVisibility.isVisible('totalFee') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Total Fee</th>
              )}
              {columnVisibility.isVisible('paid') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Paid</th>
              )}
              {columnVisibility.isVisible('remaining') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Remaining</th>
              )}
              {columnVisibility.isVisible('dueDate') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Due Date</th>
              )}
              {columnVisibility.isVisible('status') && (
                <th scope="col" className="px-2.5 py-2 font-bold text-slate-700">Status</th>
              )}
              {columnVisibility.isVisible('actions') && (
                <th scope="col" className="w-10 px-2 py-2 text-center font-bold text-slate-700">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {pageRows.map((x, index) => {
              const isRowSelected = selection.isSelected(x.id)
              const paymentItem = data.payments.find(p => p.challanId === x.id)
              return (
                <tr
                  id={`fee-row-${x.id}`}
                  key={x.id}
                  className={`${
                    isRowSelected
                      ? 'bg-[#F9EBEE]/50'
                      : highlightedChallanId === x.id
                      ? 'bg-[#F9EBEE]/60 ring-2 ring-inset ring-[#940016]'
                      : 'hover:bg-[#F9EBEE]/20 transition-colors'
                  }`}
                >
                  <td className="w-8 px-2 py-2 text-center" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select challan for ${x.studentName}`}
                      checked={isRowSelected}
                      onChange={() => selection.toggleSelect(x.id)}
                      className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"
                    />
                  </td>
                  {columnVisibility.isVisible('student') && (
                    <td className="px-2.5 py-2">
                      <strong className="text-slate-900 font-bold block text-[11px] hover:text-[#940016] transition-colors leading-tight">
                        {x.studentName}
                      </strong>
                      {highlightedChallanId === x.id && (
                        <Badge className="mt-0.5 text-[8.5px] bg-[#940016] text-white">Selected payment</Badge>
                      )}
                      <small className="block text-[9.5px] text-muted-foreground mt-0.5 whitespace-nowrap">
                        #{x.studentNumber ?? '—'} · <span className="font-mono">{x.reference}</span>
                      </small>
                    </td>
                  )}
                  {columnVisibility.isVisible('courseBatch') && (
                    <td className="px-2.5 py-2">
                      <span className="font-semibold text-slate-800 block text-[11px] leading-tight">{x.courseName}</span>
                      <small className="block text-[9.5px] text-muted-foreground mt-0.5 whitespace-nowrap">{x.batchName}</small>
                    </td>
                  )}
                  {columnVisibility.isVisible('description') && (
                    <td className="px-2.5 py-2 text-[10.5px] text-slate-500 max-w-[130px] truncate" title={x.description}>
                      {x.description}
                    </td>
                  )}
                  {columnVisibility.isVisible('totalFee') && (
                    <td className="px-2.5 py-2 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <span className="font-bold tabular-nums text-slate-900 text-[11px]">{money(x.amount)}</span>
                        {x.discountAmount > 0 && (
                          <span className="mt-0.5 text-[8.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 py-0.2 rounded whitespace-nowrap">
                            -{money(x.discountAmount)} disc
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {columnVisibility.isVisible('paid') && (
                    <td className="px-2.5 py-2 whitespace-nowrap font-bold tabular-nums text-emerald-700 text-[11px]">
                      {money(x.paidAmount)}
                    </td>
                  )}
                  {columnVisibility.isVisible('remaining') && (
                    <td className={`px-2.5 py-2 whitespace-nowrap font-bold tabular-nums text-[11px] ${x.balance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {money(x.balance)}
                    </td>
                  )}
                  {columnVisibility.isVisible('dueDate') && (
                    <td className="px-2.5 py-2 whitespace-nowrap text-[10px] font-mono text-slate-600">
                      {x.dueDate}
                    </td>
                  )}
                  {columnVisibility.isVisible('status') && (
                    <td className="px-2.5 py-2 whitespace-nowrap">
                      {renderStatus(x.status)}
                    </td>
                  )}
                  {columnVisibility.isVisible('actions') && (
                    <td className="w-10 px-2 py-2 text-center whitespace-nowrap">
                      <FeeActionMenu
                        item={x}
                        paymentItem={paymentItem}
                        canCollect={can(PERMISSIONS.FEES_COLLECT)}
                        onChallan={() => setDialog({ type: 'viewChallan', item: x })}
                        onCollect={() => openPayment(x)}
                        onReceipt={() => setDialog({ type: 'receipt', item: paymentItem })}
                        openUp={index >= Math.max(0, pageRows.length - 2) && pageRows.length > 1}
                      />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination label="Fees" page={page} rows={pageSize} total={rows.length} onPage={value=>setPageState({key:pageKey,page:value})} onRows={setPageSize}/>
      </div>
    )}
    <Dialog open={!!dialog} onOpenChange={open=>!open&&!busy&&setDialog(null)}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto print:max-h-none print:max-w-none print:overflow-visible print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white"><DialogTitle className="print:hidden">{dialog?.type==='challan'?'Generate Challan':dialog?.type==='payment'?'Collect Payment':dialog?.type==='receipt'?'Verified Receipt':'Challan'}</DialogTitle><DialogDescription className="print:hidden">Financial record for the selected branch.</DialogDescription>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
      {dialog?.type==='challan'&&<form onSubmit={submitChallan} className="grid gap-3"><select required className="min-h-11 rounded-md border px-3" value={challan.enrollmentId} onChange={e=>chooseEnrollment(e.target.value)}><option value="">Select enrolled student</option>{data.enrollments.filter(x=>!data.challans.some(challanRecord=>challanRecord.enrollmentId===x.id)).map(x=><option value={x.id} key={x.id}>{x.studentName} · {x.courseName} · {x.batchName}{Number.isFinite(x.netFee??x.configuredFee)?` · ${money(x.netFee??x.configuredFee)}`:''}</option>)}</select><Input required placeholder="Fee description" value={challan.description} onChange={e=>setChallan({...challan,description:e.target.value})}/><Input required min="1" type="number" placeholder="Amount PKR" value={challan.amount} readOnly={Number.isFinite(data.enrollments.find(item=>item.id===challan.enrollmentId)?.netFee??data.enrollments.find(item=>item.id===challan.enrollmentId)?.configuredFee)} onChange={e=>setChallan({...challan,amount:e.target.value})}/>{Number.isFinite(data.enrollments.find(item=>item.id===challan.enrollmentId)?.netFee??data.enrollments.find(item=>item.id===challan.enrollmentId)?.configuredFee)&&<p className="text-xs text-muted-foreground">Amount is the confirmed net fee saved with this enrollment.</p>}<label>Issue date<Input required type="date" value={challan.issueDate} onChange={e=>setChallan({...challan,issueDate:e.target.value})}/></label><label>Due date<Input required type="date" value={challan.dueDate} onChange={e=>setChallan({...challan,dueDate:e.target.value})}/></label><Button type="submit" disabled={busy}>{busy?'Saving...':'Issue Challan'}</Button></form>}
      {dialog?.type==='payment'&&<form onSubmit={submitPayment} className="grid gap-3"><p>Outstanding: <strong>{money(dialog.item.balance)}</strong></p><Input required min="1" max={dialog.item.balance} type="number" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/><select className="min-h-11 rounded-md border px-3" value={payment.method} onChange={e=>setPayment({...payment,method:e.target.value})}>{['Cash','Bank Transfer','Mobile Wallet','EasyPaisa'].map(x=><option key={x}>{x}</option>)}</select><Button type="submit" disabled={busy}>{busy?'Recording...':'Record Verified Payment'}</Button></form>}
      {['viewChallan','receipt'].includes(dialog?.type)&&(
        <div className="rounded-xl border border-border/80 bg-slate-50/50 p-5 space-y-4 print:p-0 print:border-none print:bg-white print:space-y-4 print:w-full">
          <div className="flex items-center gap-3 border-b border-border/80 pb-4">
            <img src={tsaLogo} alt="TSA Logo" className="size-14 object-contain rounded shrink-0 bg-white p-1 border border-slate-200 shadow-2xs" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-[#940016]">THE SCHOLAR COACHING ACADEMY</p>
              <h2 className="text-base font-bold text-foreground truncate">
                {dialog.type==='receipt'?'Official Fee Payment Receipt':'Student Fee Challan & Invoice'}
              </h2>
              <p className="text-[11px] text-muted-foreground">Official Management & Academic Information System • Campus: {branch?.name ?? 'Main Campus'}</p>
            </div>
            <Badge className={dialog.type==='receipt' ? 'bg-emerald-600 text-white shrink-0' : 'bg-[#940016] text-white shrink-0'}>
              {dialog.type==='receipt' ? '✓ VERIFIED RECEIPT' : (dialog.item.status || 'CHALLAN').toUpperCase()}
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

          {/* Printable Signature & Stamp Area */}
          <div className="hidden print:flex items-center justify-between pt-10 text-xs text-muted-foreground">
            <div className="text-center w-48 border-t border-slate-400 pt-1">
              Student / Depositor Signature
            </div>
            <div className="text-center w-56 border-t border-slate-400 pt-1">
              Authorized Accounts Officer / Cashier
            </div>
          </div>

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
            <Button variant="outline" className="h-8 gap-1.5 text-xs" onClick={()=>{document.body.classList.add('is-printing-modal');window.print();setTimeout(()=>document.body.classList.remove('is-printing-modal'),500)}}>
              <Printer size={14}/>
              Print
            </Button>
          </div>
        </div>
      )}
      <DialogFooter><Button variant="outline" onClick={()=>setDialog(null)}>Close</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>
}
