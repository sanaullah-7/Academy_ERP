import { useState, useEffect, useMemo, useRef } from 'react'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { createPortal } from 'react-dom'
import { Card } from '../ui/card.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import CustomSelect from '../ui/CustomSelect.jsx'
import Pagination from '../Shared/Pagination.jsx'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { payrollService } from '../../services/payrollService.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import SalaryAgreementModal from './SalaryAgreementModal.jsx'
import DisbursePaymentModal from './DisbursePaymentModal.jsx'
import PayslipModal from './PayslipModal.jsx'
import { Banknote, FileSpreadsheet, FileText, Loader2, Search, Sliders, MoreHorizontal } from 'lucide-react'

function PayrollActions({ line, canManage, meta, busy, onPay, onSlip, onAgreement }) {
  const [position, setPosition] = useState(null)
  const trigger = useRef(null)
  const menu = useRef(null)
  useEffect(() => {
    if (!position) return
    menu.current?.querySelector('button:not(:disabled)')?.focus()
    const close = () => setPosition(null)
    const outside = (event) => {
      if (!menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) close()
    }
    document.addEventListener('pointerdown', outside)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [position])
  const choose = (action) => { setPosition(null); trigger.current?.focus(); action() }
  const itemClass = 'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-foreground hover:bg-primary/5 focus:bg-primary/5 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'
  return <>
    <button ref={trigger} type="button" aria-label={`Payroll actions for ${line.teacherName}`} aria-haspopup="menu" aria-expanded={Boolean(position)}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
      onClick={() => {
        if (position) return setPosition(null)
        const rect = trigger.current.getBoundingClientRect()
        setPosition({ left: Math.max(8, Math.min(rect.right - 192, window.innerWidth - 200)), top: rect.bottom + 6, above: window.innerHeight - rect.bottom < 170, bottom: window.innerHeight - rect.top + 6 })
      }}><MoreHorizontal size={18} /></button>
    {position && createPortal(<div ref={menu} role="menu" aria-label="Payroll actions"
      style={{ position: 'fixed', left: position.left, ...(position.above ? { bottom: position.bottom } : { top: position.top }), width: 192, zIndex: 100 }}
      className="rounded-xl border border-border bg-card p-1.5 shadow-xl"
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); setPosition(null); trigger.current?.focus() }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault()
          const items = [...menu.current.querySelectorAll('button:not(:disabled)')]
          const index = items.indexOf(document.activeElement)
          items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length]?.focus()
        }
        if (event.key === 'Tab') setPosition(null)
      }}>
      {canManage && line.outstanding > 0 && <button role="menuitem" className={itemClass} disabled={busy} onClick={() => choose(onPay)}><Banknote size={15} className="text-emerald-600" />Add Payment</button>}
      <button role="menuitem" className={itemClass} disabled={Boolean(line.calculationError)} onClick={() => choose(onSlip)}><FileText size={15} className="text-primary" />Payslip</button>
      {canManage && meta && <button role="menuitem" className={itemClass} title="Configure teacher salary agreement" onClick={() => choose(onAgreement)}><Sliders size={15} className="text-muted-foreground" />Salary Agreement</button>}
    </div>, document.body)}
  </>
}

const money = (value) =>
  'PKR ' + Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })
const palette = [
  'border-emerald-200 bg-emerald-50/60',
  'border-amber-200 bg-amber-50/60',
  'border-blue-200 bg-blue-50/60',
]
const labelMethod = (method) =>
  method === 'fixed'
    ? 'Fixed Salary'
    : method === 'percentage'
      ? 'Percentage'
      : method
        ? 'Historical: ' + method.replaceAll('_', ' ')
        : 'Not configured'

export default function TeacherPayrollView({
  branchId,
  branchName = 'Main Campus',
  initialTeacherId = null,
  exportTarget = null,
}) {
  const { can, roles = [] } = usePermissions()
  const canManage =
    can(PERMISSIONS.EXPENSES_MANAGE) && roles.some((r) => ['admin', 'super_admin'].includes(r))
  const [resource, setResource] = useState(() => peekPageResource(`payroll:${branchId}`, { key: branchId + ':0' })),
    [request, setRequest] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [search, setSearch] = useState(''),
    [methodFilter, setMethodFilter] = useState('all'),
    [statusFilter, setStatusFilter] = useState('all'),
    [courseFilter, setCourseFilter] = useState('all'),
    [batchFilter, setBatchFilter] = useState('all')
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10)
  const [agreement, setAgreement] = useState(null),
    [payLine, setPayLine] = useState(null),
    [slip, setSlip] = useState(null)
  const initialOpened = useRef(null)
  const key = branchId + ':' + request
  const current = resource?.key === key ? resource : null
  const loading = !current && !error
  const data = current?.data || { period: null, lines: [], payments: [] },
    eligible = current?.eligible || []
  useEffect(() => {
    let active = true
    const loadVersion = capturePageVersion()
    async function load() {
      setError('')
      try {
        const details = await payrollService.getRunningOverview({ branchId })
        if (!active) return
        setResource(rememberPageResource(`payroll:${branchId}`, { key, data: details, eligible: details.teachers || [] }, loadVersion))
        const target = (details.teachers || []).find((a) => a.teacherId === initialTeacherId)
        if (canManage && target && initialOpened.current !== initialTeacherId) {
          initialOpened.current = initialTeacherId
          setAgreement(target)
        }
      } catch (err) {
        if (active) setError(err.message)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [branchId, request, key, canManage, initialTeacherId])
  async function mutate(action) {
    setBusy(true)
    setError('')
    try {
      await action()
      setRequest((v) => v + 1)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setBusy(false)
    }
  }
  const lines = useMemo(() => data.lines.filter((l) => !l.supersededAt), [data.lines])
  const courseOptions = [...new Map(lines.filter((l) => l.courseId).map((l) => [l.courseId, { value: l.courseId, label: l.courseName || 'Unnamed course' }])).values()]
    .sort((a, b) => a.label.localeCompare(b.label))
  const batchOptions = [...new Map(lines.filter((l) => l.batchId && (courseFilter === 'all' || l.courseId === courseFilter)).map((l) => [l.batchId, {
    value: l.batchId,
    label: courseFilter === 'all' && l.courseName ? `${l.batchName || 'Unnamed batch'} · ${l.courseName}` : l.batchName || 'Unnamed batch',
  }])).values()].sort((a, b) => a.label.localeCompare(b.label))
  const filtered = useMemo(
    () =>
      lines.filter(
        (l) =>
          (!search ||
            [l.teacherName, l.courseName, l.batchName, l.subjectName].some((v) =>
              (v || '').toLowerCase().includes(search.toLowerCase())
            )) &&
          (methodFilter === 'all' || l.calculationMethod === methodFilter) &&
          (courseFilter === 'all' || l.courseId === courseFilter) &&
          (batchFilter === 'all' || l.batchId === batchFilter) &&
          (statusFilter === 'all' ||
            (statusFilter === 'paid'
              ? l.status === 'Paid'
              : statusFilter === 'partial'
                ? l.status === 'Partially Paid'
                : l.status !== 'Paid' && l.status !== 'Partially Paid'))
      ),
    [lines, search, methodFilter, statusFilter, courseFilter, batchFilter]
  )
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    visible = filtered.slice(
      (Math.min(page, pages) - 1) * pageSize,
      Math.min(page, pages) * pageSize
    )
  const totals = lines.reduce(
    (a, l) => ({
      due: a.due + l.netPayable,
      paid: a.paid + l.totalPaid,
      remaining: a.remaining + l.outstanding,
    }),
    { due: 0, paid: 0, remaining: 0 }
  )
  const progressTotals = lines
    .filter((line) => methodFilter === 'all' || line.calculationMethod === methodFilter)
    .reduce((sum, line) => ({ due: sum.due + line.netPayable, paid: sum.paid + line.totalPaid }), { due: 0, paid: 0 })
  const progressPercent = progressTotals.due > 0
    ? Math.max(0, Math.min(100, (progressTotals.paid / progressTotals.due) * 100))
    : 0
  const progressLabel = methodFilter === 'all' ? 'All Methods' : labelMethod(methodFilter)
  const reportHeaders = [
    'Teacher',
    'Course',
    'Batch',
    'Subject',
    'Assignment ID',
    'Method',
    'Eligible Students',
    'Fee Basis',
    'Listed Fee',
    'Percentage / Fixed Rate',
    'Salary Due',
    'Salary Paid',
    'Salary Remaining',
    'Status',
    'Calculation / Issue',
  ]
  const reportRows = filtered.map((l) => [
    l.teacherName,
    l.courseName || 'Historical',
    l.batchName || 'Historical',
    l.subjectName || 'Historical',
    l.facultyAssignmentId || 'Historical',
    labelMethod(l.calculationMethod),
    l.calculationDetails?.eligibleStudents ?? '',
    l.calculationDetails?.feeBasis || '',
    l.calculationDetails?.applicableFee ?? '',
    l.calculationMethod === 'percentage'
      ? l.calculationDetails?.feePercentage + '%'
      : (l.calculationDetails?.fixedRate ?? l.baseEarnings),
    l.netPayable,
    l.totalPaid,
    l.outstanding,
    l.status,
    l.calculationError || l.calculationDetails?.description || '',
  ])
  const exports = (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        disabled={loading || !filtered.length}
        onClick={() =>
          exportTablePdf({
            filename: 'teacher-salary-balances.pdf',
            title: 'Teacher Salary Balances',
            branchName,
            headers: reportHeaders,
            rows: reportRows,
          })
        }
      >
        <FileText size={15} />
        Export PDF
      </Button>
      <Button
        size="sm"
        disabled={loading || !filtered.length}
        onClick={() => downloadCsv('teacher-salary-balances.csv', reportHeaders, reportRows)}
      >
        <FileSpreadsheet size={15} />
        Export CSV
      </Button>
    </div>
  )
  async function openSlip(line) {
    setError('')
    try {
      setSlip(await payrollService.getPayslip(line.id, { branchId }))
    } catch (err) {
      setError(err.message)
    }
  }
  const kpis = [
    ['Total Salary Payable', money(totals.due), 'Assignment salary due'],
    ['Total Salary Paid', money(totals.paid), 'Verified salary payments'],
    ['Total Salary Remaining', money(totals.remaining), 'Outstanding salary'],
    [
      'Teachers with Assignments',
      new Set(eligible.map((a) => a.teacherId)).size,
      'Current eligible faculty',
    ],
    [
      'Active Salary Agreements',
      eligible.filter((a) => a.agreement).length,
      'Current assignment agreements',
    ],
    [
      'Pending Salary Payments',
      lines.filter((l) => l.outstanding > 0).length,
      'Assignment balances due',
    ],
  ]
  return (
    <div className="space-y-3">
      {exportTarget ? createPortal(exports, exportTarget) : exports}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError('')
              setRequest((v) => v + 1)
            }}
          >
            Retry
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map(([title, value, note], i) => (
          <Card
            key={title}
            className={`flex min-h-[120px] min-w-0 flex-col justify-between gap-3 rounded-2xl border px-4 py-3 shadow-xs ${palette[i % 3]}`}
          >
            <span className="text-[11px] font-bold uppercase text-muted-foreground">{title}</span>
            <strong className="break-words text-xl text-foreground">{value}</strong>
            <span className="text-[11px] text-muted-foreground">{note}</span>
          </Card>
        ))}
      </div>
      <Card className="rounded-xl border border-border/80 bg-card px-4 py-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0 basis-48 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <p className="font-semibold">Salary Payment Progress <span className="font-normal text-muted-foreground">· {progressLabel}</span></p>
              <span className="font-semibold tabular-nums text-emerald-700">{Math.round(progressPercent)}% paid</span>
            </div>
            <div role="progressbar" aria-label={`${progressLabel} salary payments`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPercent)} aria-valuetext={`${money(progressTotals.paid)} paid of ${money(progressTotals.due)}`} className="h-1.5 overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full bg-emerald-600"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
          <CustomSelect
            aria-label="Calculation method"
            menuAlign="right"
            menuWidthClass="min-w-[140px] max-w-[150px]"
            value={methodFilter}
            onChange={(v) => {
              setMethodFilter(v)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All Methods' },
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed Salary' },
            ]}
          />
        </div>
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            aria-label="Search payroll"
            placeholder="Search faculty name, course, batch or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <CustomSelect
          aria-label="Payroll course"
          value={courseFilter}
          onChange={(value) => { setCourseFilter(value); setBatchFilter('all'); setPage(1) }}
          className="max-w-full border-primary/15 bg-primary/[0.025]"
          containerClassName="relative min-w-0 max-w-full"
          options={[{ value: 'all', label: 'All Courses' }, ...courseOptions]}
        />
        <CustomSelect
          aria-label="Payroll batch"
          value={batchFilter}
          onChange={(value) => { setBatchFilter(value); setPage(1) }}
          className="max-w-full border-primary/15 bg-primary/[0.025]"
          containerClassName="relative min-w-0 max-w-full"
          options={[{ value: 'all', label: 'All Batches' }, ...batchOptions]}
        />
        <CustomSelect
          aria-label="Payment status"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
          options={[
            { value: 'all', label: 'All Payment Statuses' },
            { value: 'paid', label: 'Paid' },
            { value: 'partial', label: 'Partially Paid' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
        <span className="text-xs text-muted-foreground">{filtered.length} assignments</span>
      </div>
      {loading ? (
        <p role="status" className="flex items-center gap-2 p-4 text-sm">
          <Loader2 className="animate-spin" size={16} />
          Loading payroll...
        </p>
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          <div>
            <table className="w-full table-fixed text-left text-[11px] xl:text-xs md:[&_td]:px-2 md:[&_td]:align-middle md:[&_td:first-child]:pl-3 xl:[&_td]:px-3 xl:[&_td:first-child]:pl-4 max-md:block">
              <colgroup>
                {[12, 23, 12, 12, 11, 11, 12, 7].map((width, index) => (
                  <col key={index} style={{ width: width + '%' }} />
                ))}
              </colgroup>
              <thead className="border-b bg-primary/5 text-[9px] xl:text-[10px] uppercase text-primary max-md:hidden">
                <tr>
                  {[
                    'Teacher',
                    'Course / Batch / Subject',
                    'Method',
                    'Salary Amount',
                    'Already Paid',
                    'Remaining',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th key={h} scope="col" className={`px-2 xl:px-3 py-3 leading-4 first:pl-3 xl:first:pl-4 ${h === 'Status' ? 'md:pl-4 xl:pl-5' : ''} ${['Salary Amount', 'Actions'].includes(h) ? 'whitespace-nowrap tracking-normal' : 'whitespace-normal tracking-wide'} ${h === 'Actions' ? 'text-right pr-3 xl:pr-4' : ['Salary Amount', 'Already Paid', 'Remaining'].includes(h) ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="max-md:block">
                {visible.length ? (
                  visible.map((line) => {
                    const meta = eligible.find(
                      (a) =>
                        a.facultyAssignmentId === line.facultyAssignmentId &&
                        a.teacherId === line.teacherId
                    )
                    return (
                      <tr
                        key={line.id}
                        className="border-b border-border/50 max-md:grid max-md:grid-cols-2 max-md:gap-x-3 max-md:px-4 max-md:py-3"
                      >
                        <td
                          data-label="Teacher"
                          title={line.teacherName}
                          className="truncate px-2 py-4 font-semibold max-md:col-span-2 max-md:px-0 max-md:pb-2 max-md:pt-0 max-md:text-sm"
                        >
                          {line.teacherName}
                        </td>
                        <td
                          data-label="Assignment"
                          className="px-2 py-4 max-md:col-span-2 max-md:px-0 max-md:py-2"
                        >
                          <p className="font-semibold break-words">
                            {line.courseName || 'Historical teacher salary'}
                          </p>
                          <p className="mt-1 text-muted-foreground break-words">
                            {line.batchName} {line.subjectName && ' - ' + line.subjectName}
                          </p>
                          <p className="mt-1 max-w-72 whitespace-normal text-[10px] text-muted-foreground">
                            {line.calculationError || line.calculationDetails?.description}
                          </p>
                        </td>
                        <td data-label="Method" className="px-2 py-4 max-md:px-0 max-md:py-2">
                          <span className="inline-flex whitespace-nowrap rounded-lg bg-primary/5 px-2 py-1 font-semibold text-primary">
                            {labelMethod(line.calculationMethod)}
                          </span>
                        </td>
                        <td data-label="Salary" className="px-2 py-4 font-bold tabular-nums md:text-right max-md:px-0 max-md:py-2">
                          {money(line.netPayable)}
                        </td>
                        <td data-label="Paid" className="px-2 py-4 font-bold tabular-nums md:text-right text-emerald-700 max-md:px-0 max-md:py-2">
                          {money(line.totalPaid)}
                        </td>
                        <td data-label="Remaining" className="px-2 py-4 font-bold tabular-nums md:text-right text-primary max-md:px-0 max-md:py-2">
                          {money(line.outstanding)}
                        </td>
                        <td data-label="Status" className="px-2 py-4 md:!pl-4 xl:!pl-5 max-md:px-0 max-md:py-2 [&>span]:text-[10px] xl:[&>span]:text-xs">
                          <span style={{ backgroundColor: line.status === 'Paid' ? 'rgb(16 185 129 / 7%)' : line.status === 'Partially Paid' ? 'rgb(234 179 8 / 8%)' : 'rgb(148 163 184 / 8%)', borderColor: line.status === 'Paid' ? 'rgb(16 185 129 / 28%)' : line.status === 'Partially Paid' ? 'rgb(234 179 8 / 30%)' : 'rgb(148 163 184 / 25%)' }} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-medium leading-none ${line.status === 'Paid' ? 'text-emerald-500' : line.status === 'Partially Paid' ? 'text-yellow-500' : 'text-[#940016] dark:text-[#f5a3b3]'}`}>
                            <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${line.status === 'Paid'
                            ? 'bg-current'
                            : line.status === 'Partially Paid'
                              ? 'bg-current'
                              : 'bg-slate-400'}`} />
                            {line.status}
                          </span>
                        </td>
                        <td data-label="Actions" className="px-2 py-4 text-right md:!pr-4 max-md:col-span-2 max-md:px-0 max-md:pb-0 max-md:pt-2">
                          <PayrollActions line={line} canManage={canManage} meta={meta} busy={busy}
                            onPay={() => setPayLine(line)} onSlip={() => openSlip(line)} onAgreement={() => setAgreement(meta)} />
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No eligible assignment salary balances. Save a Faculty course, batch and
                      subject assignment first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            label="Teacher payroll"
            page={Math.min(page, pages)}
            rows={pageSize}
            total={filtered.length}
            onPage={setPage}
            onRows={(v) => {
              setPageSize(v)
              setPage(1)
            }}
          />
        </Card>
      )}
      {agreement && (
        <SalaryAgreementModal
          open
          teacher={agreement}
          initialAgreement={agreement.agreement}
          onClose={() => setAgreement(null)}
          onSaved={(record) => mutate(() => payrollService.saveAgreement(record, { branchId }))}
        />
      )}
      {payLine && (
        <DisbursePaymentModal
          open
          line={payLine}
          onClose={() => setPayLine(null)}
          onDisburse={(record) => mutate(() => payrollService.recordPayment(record, { branchId }))}
        />
      )}
      {slip && (
        <PayslipModal
          open
          payslipData={slip}
          branchName={branchName}
          onClose={() => setSlip(null)}
        />
      )}
    </div>
  )
}
