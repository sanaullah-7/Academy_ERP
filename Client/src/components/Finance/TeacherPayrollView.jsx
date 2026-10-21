import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Card } from '../ui/card.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { payrollService } from '../../services/payrollService.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { getAcademyDateOnly } from '../../utils/formatDate.js'
import Pagination from '../Shared/Pagination.jsx'
import CustomSelect from '../ui/CustomSelect.jsx'

import SalaryAgreementModal from './SalaryAgreementModal.jsx'
import DisbursePaymentModal from './DisbursePaymentModal.jsx'
import StaffAdvanceModal from './StaffAdvanceModal.jsx'
import ManualAdjustmentModal from './ManualAdjustmentModal.jsx'
import PayslipModal from './PayslipModal.jsx'

import {
  Banknote,
  Calculator,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HandCoins,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Sliders,
} from 'lucide-react'

export default function TeacherPayrollView({ branchId, branchName = 'Main Campus', initialTeacherId = null, exportTarget = null, actionsTarget = null }) {
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.EXPENSES_MANAGE) // Super Admin

  const [selectedMonth, setSelectedMonth] = useState(()=>getAcademyDateOnly().slice(0,7))
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ period: null, lines: [], payments: [], advances: [] })
  const [teachersWithAgreements, setTeachersWithAgreements] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Search & Filter state
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize,setPageSize] = useState(10)
  const initialOpened=useRef(null)

  // Modals state
  const [agreementModal, setAgreementModal] = useState({ open: false, teacher: null, agreement: null })
  const [disburseModal, setDisburseModal] = useState({ open: false, line: null })
  const [advanceModal, setAdvanceModal] = useState({ open: false })
  const [adjustmentModal, setAdjustmentModal] = useState({ open: false, line: null })
  const [payslipModal, setPayslipModal] = useState({ open: false, data: null })

  // Load payroll data
  async function loadPayroll() {
    setLoading(true)
    setError('')
    try {
      const agreementsResult = await payrollService.getAgreements({ branchId })
      setTeachersWithAgreements(agreementsResult.teachers || [])

      let periodDetails = await payrollService.getPeriodDetails(null, { branchId, yearMonth: selectedMonth })
      if (canManage && !periodDetails.period) {
        periodDetails = await payrollService.calculatePeriod({ yearMonth: selectedMonth }, { branchId })
      }
      setData(periodDetails)

      if (initialTeacherId && initialOpened.current !== initialTeacherId) {
        const match = (agreementsResult.teachers || []).find(t => t.teacherId === initialTeacherId)
        if (match) {
          initialOpened.current=initialTeacherId
          setAgreementModal({
            open: true,
            teacher: match,
            agreement: match.agreement,
          })
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const agreementsResult = await payrollService.getAgreements({ branchId })
        if (!active) return
        setTeachersWithAgreements(agreementsResult.teachers || [])

        let periodDetails = await payrollService.getPeriodDetails(null, { branchId, yearMonth: selectedMonth })
        if (canManage && !periodDetails.period) {
          periodDetails = await payrollService.calculatePeriod({ yearMonth: selectedMonth }, { branchId })
        }
        if (!active) return
        setData(periodDetails)

        if (initialTeacherId && initialOpened.current !== initialTeacherId) {
          const match = (agreementsResult.teachers || []).find(t => t.teacherId === initialTeacherId)
          if (match) {
            initialOpened.current=initialTeacherId
            setAgreementModal({
              open: true,
              teacher: match,
              agreement: match.agreement,
            })
          }
        }
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [branchId, selectedMonth, initialTeacherId, canManage])

  // Recalculate
  async function handleRecalculate() {
    setLoading(true)
    setError('')
    try {
      const res = await payrollService.calculatePeriod({ yearMonth: selectedMonth }, { branchId })
      setData(res)
      setMessage(`Payroll for ${selectedMonth} recalculated successfully.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Approve Period
  async function handleApprovePeriod() {
    if (!data.period) return
    setLoading(true)
    setError('')
    try {
      await payrollService.approvePeriod(data.period.id, { branchId })
      await loadPayroll()
      setMessage(`Payroll period ${selectedMonth} approved successfully.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadPayrollAfterChange(){
    if(data.period?.approvedAt || ['Approved','Partially Paid','Paid'].includes(data.period?.status))return loadPayroll()
    let refreshError=''
    try{await payrollService.calculatePeriod({yearMonth:selectedMonth},{branchId})}catch(error){refreshError=error.message}
    await loadPayroll()
    if(refreshError)setError('Change saved. '+refreshError)
  }

  // Handle Save Agreement
  async function handleSaveAgreement(record) {
    await payrollService.saveAgreement(record, { branchId })
    await loadPayrollAfterChange()
    setMessage(data.period?.approvedAt?'Salary agreement saved. Approved payroll is unchanged; select an unapproved month to apply it.':'Salary agreement saved.')
  }

  // Handle Disburse Payment
  async function handleDisburse(record) {
    await payrollService.recordPayment(record, { branchId })
    await loadPayroll()
    setMessage(`Disbursement of PKR ${Number(record.amount).toLocaleString()} posted to Finance expenses.`)
  }

  // Handle Advance
  async function handleRequestAdvance(record) {
    await payrollService.requestAdvance(record, { branchId })
    await loadPayrollAfterChange()
    setMessage(`Advance of PKR ${Number(record.amount).toLocaleString()} disbursed and queued for recovery.`)
  }

  // Handle Manual Adjustment
  async function handleAddAdjustment(record) {
    await payrollService.addAdjustment(record, { branchId })
    await loadPayrollAfterChange()
    setMessage('Manual salary adjustment applied.')
  }

  // Handle View Payslip
  async function handleViewPayslip(line) {
    try {
      const slip = await payrollService.getPayslip(line.id, { branchId })
      setPayslipModal({ open: true, data: slip })
    } catch (err) {
      setError(err.message)
    }
  }

  // Filtered rows
  const filteredLines = useMemo(() => {
    return (data.lines || []).filter(line => {
      const matchSearch = !search || line.teacherName.toLowerCase().includes(search.toLowerCase()) || (line.designation || '').toLowerCase().includes(search.toLowerCase())
      const matchMethod = methodFilter === 'all' || line.calculationMethod === methodFilter
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && line.status === 'Paid') ||
        (statusFilter === 'partial' && line.status === 'Partially Paid') ||
        (statusFilter === 'pending' && line.status !== 'Paid' && line.status !== 'Partially Paid')
      return matchSearch && matchMethod && matchStatus
    })
  }, [data.lines, search, methodFilter, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredLines.length / pageSize) || 1
  const paginatedLines = useMemo(() => {
    const start = (Math.min(page,totalPages) - 1) * pageSize
    return filteredLines.slice(start, start + pageSize)
  }, [filteredLines, page, pageSize, totalPages])

  // Exports
  function exportPdf() {
    const headers = ['Teacher', 'Method', 'Base (PKR)', 'Allowances', 'Deductions', 'Advances', 'Net Payable', 'Disbursed', 'Balance', 'Status']
    const rows = filteredLines.map(l => [
      l.teacherName,
      l.calculationMethod.replace('_', ' ').toUpperCase(),
      Number(l.baseEarnings).toLocaleString(),
      Number(l.allowances).toLocaleString(),
      Number(l.deductions).toLocaleString(),
      Number(l.advancesDeducted).toLocaleString(),
      Number(l.netPayable).toLocaleString(),
      Number(l.totalPaid).toLocaleString(),
      Number(l.outstanding).toLocaleString(),
      l.status,
    ])
    exportTablePdf({
      filename: `teacher-payroll-${selectedMonth}.pdf`,
      title: `Teacher Payroll & Salary Report — ${selectedMonth}`,
      branchName,
      headers,
      rows,
    })
  }

  function exportCsv() {
    const headers = ['Teacher ID', 'Teacher Name', 'Method', 'Base Earnings', 'Allowances', 'Deductions', 'Advances Recovered', 'Net Payable', 'Total Paid', 'Outstanding Balance', 'Status']
    const rows = filteredLines.map(l => [
      l.teacherId,
      l.teacherName,
      l.calculationMethod,
      l.baseEarnings,
      l.allowances,
      l.deductions,
      l.advancesDeducted,
      l.netPayable,
      l.totalPaid,
      l.outstanding,
      l.status,
    ])
    downloadCsv(`teacher-payroll-${selectedMonth}.csv`, headers, rows)
  }

  const exportButtons = (
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={exportPdf}
              disabled={loading || !filteredLines.length}
              className="h-9 gap-1.5 rounded-xl bg-[#940016] text-xs font-semibold text-white shadow-xs hover:bg-[#7a0012] cursor-pointer"
            >
              <FileText size={15} aria-hidden="true" />
              Export PDF
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={exportCsv}
              disabled={loading || !filteredLines.length}
              className="h-9 gap-1.5 rounded-xl bg-[#940016] text-xs font-semibold text-white shadow-xs hover:bg-[#7a0012] cursor-pointer"
            >
              <FileSpreadsheet size={15} aria-hidden="true" />
              Export CSV
            </Button>
          </div>
  )

  const period = data.period || {}
  const isPeriodApproved = ['Approved', 'Partially Paid', 'Paid'].includes(period.status)

  const actionControls = (
      <div className="flex flex-wrap justify-end gap-2">
        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white border-0 rounded-xl px-2 py-0 text-xs h-8">
            <Calendar size={14} className="text-primary" />
            <Input aria-label="Payroll month" type="month" disabled={loading} value={selectedMonth} onChange={e=>{if(e.target.value){setSelectedMonth(e.target.value);setPage(1);setLoading(true);setError('');setMessage('');setData({period:null,lines:[],payments:[],advances:[]})}}} className="h-7 w-32 border-0 bg-transparent px-1 shadow-none text-xs font-semibold focus:border-0 focus:ring-0 focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"/>

          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={loading || !canManage || isPeriodApproved}
            className="h-8 gap-1 text-xs cursor-pointer bg-white"
            title="Recalculate formulas and sync lectures/admissions"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Recalculate
          </Button>

          {canManage && !isPeriodApproved && (
            <Button
              size="sm"
              onClick={handleApprovePeriod}
              disabled={loading || !data.lines.length}
              className="h-8 gap-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={13} />
              Approve Payroll
            </Button>
          )}

          {canManage && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setAdvanceModal({ open: true })}
              className="h-8 gap-1 text-xs cursor-pointer bg-white border-amber-300 text-amber-900 hover:bg-amber-50"
            >
              <HandCoins size={13} className="text-amber-700" />
              Staff Advance
            </Button>
          )}

          {!exportTarget && exportButtons}
        </div>
      </div>

  )

  return (
    <div className="space-y-3">
      {exportTarget && createPortal(exportButtons, exportTarget)}
      {actionsTarget ? createPortal(actionControls, actionsTarget) : actionControls}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">&times;</button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold ml-2">&times;</button>
        </div>
      )}

      {isPeriodApproved&&<p className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">Approved payroll is locked to preserve salary and payment history. Agreement changes apply when you calculate an unapproved month.</p>}
      {/* 6 KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="rounded-2xl border border-[#c9eed6] bg-linear-145 from-white via-[#f4fbf7] to-[#e6f6ee] shadow-xs min-h-[120px] min-w-0 px-4 py-1.5 flex flex-col justify-between gap-3.5">
          <span className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground block">Gross Earnings</span>
          <div className="text-xl break-words font-bold text-foreground">
            PKR {(period.totalGross || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block">Base calculations</span>
        </Card>

        <Card className="rounded-2xl border border-[#f7e2c2] bg-linear-145 from-white via-[#fffbf2] to-[#fdf2de] shadow-xs min-h-[120px] min-w-0 px-4 py-1.5 flex flex-col justify-between gap-3.5">
          <span className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground block">Allowances</span>
          <div className="text-xl break-words font-bold text-foreground">
            +PKR {(period.totalAllowances || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block">Medical &amp; Conveyance</span>
        </Card>

        <Card className="rounded-2xl border border-[#cde0fc] bg-linear-145 from-white via-[#f4f8fe] to-[#e7f1fe] shadow-xs min-h-[120px] min-w-0 px-4 py-1.5 flex flex-col justify-between gap-3.5">
          <span className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground block">Deductions</span>
          <div className="text-xl break-words font-bold text-foreground">
            -PKR {((period.totalDeductions || 0) + (period.totalAdvancesDeducted || 0)).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block">Tax &amp; Advance Recovery</span>
        </Card>

        <Card className="rounded-2xl border border-[#f7e2c2] bg-linear-145 from-white via-[#fffbf2] to-[#fdf2de] shadow-xs min-h-[120px] min-w-0 px-4 py-1.5 flex flex-col justify-between gap-3.5">
          <span className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground block">Net Payable</span>
          <div className="text-xl break-words font-extrabold text-foreground">
            PKR {(period.totalNetPayable || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block">Monthly Obligation</span>
        </Card>

        <Card className="rounded-2xl border border-[#c9eed6] bg-linear-145 from-white via-[#f4fbf7] to-[#e6f6ee] shadow-xs min-h-[120px] min-w-0 px-4 py-1.5 flex flex-col justify-between gap-3.5">
          <span className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground block">Disbursed (Paid)</span>
          <div className="text-xl break-words font-bold text-foreground">
            PKR {(period.totalPaid || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block">Posted to Finance</span>
        </Card>

        <Card className="rounded-2xl border border-[#cde0fc] bg-linear-145 from-white via-[#f4f8fe] to-[#e7f1fe] shadow-xs min-h-[120px] min-w-0 px-4 py-1.5 flex flex-col justify-between gap-3.5">
          <span className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground block">Balance Due</span>
          <div className="text-xl break-words font-bold text-foreground">
            PKR {(period.totalOutstanding || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block">Remaining Outflow</span>
        </Card>
      </div>

      {/* Visual Comparison & Method Breakdown Bar */}
      <Card className="rounded-2xl border border-border/80 bg-white shadow-xs px-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Progress / Cashflow representation */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">Disbursement Progress</span>
              <span className="text-muted-foreground font-mono">
                {period.totalNetPayable > 0
                  ? `${Math.round(((period.totalPaid || 0) / period.totalNetPayable) * 100)}% Paid`
                  : '0% Paid'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden flex">
              <div
                className="bg-emerald-600 transition-all duration-300"
                style={{ width: `${period.totalNetPayable > 0 ? ((period.totalPaid || 0) / period.totalNetPayable) * 100 : 0}%` }}
              />
              <div
                className="bg-[#940016] transition-all duration-300"
                style={{ width: `${period.totalNetPayable > 0 ? ((period.totalOutstanding || 0) / period.totalNetPayable) * 100 : 0}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground pt-0">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-600" /> Disbursed (PKR {(period.totalPaid || 0).toLocaleString()})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#940016]" /> Remaining Due (PKR {(period.totalOutstanding || 0).toLocaleString()})
              </span>
            </div>
          </div>

          <div className="w-full md:w-56 shrink-0 space-y-1 border-t border-border/60 pt-2 md:border-t-0 md:border-l md:pl-5 md:pt-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Calculation Method</span>
            <CustomSelect
              aria-label="Calculation method"
              value={methodFilter}
              onChange={value => { setMethodFilter(value); setPage(1) }}
              options={[
                { value: 'all', label: 'All Methods', icon: Calculator },
                { value: 'fixed', label: 'Fixed Monthly', icon: DollarSign },
                { value: 'per_lecture', label: 'Per Lecture', icon: Calculator },
                { value: 'per_student', label: 'Per Student', icon: GraduationCap },
                { value: 'fee_percentage', label: 'Fee %', icon: Percent },
              ]}
              containerClassName="block w-full"
              className="w-full h-9 rounded-xl border-primary/15 bg-[#fcf5f7] hover:bg-[#F9EBEE]"
              menuWidthClass="w-full min-w-[180px]"
            />
          </div>
        </div>
      </Card>

      {/* Table Toolbar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search faculty name, subject, or role..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 h-10 rounded-xl bg-white text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CustomSelect
            aria-label="Payment status"
            value={statusFilter}
            onChange={value => { setStatusFilter(value); setPage(1) }}
            options={[
              { value: 'all', label: 'All Payment Statuses' },
              { value: 'paid', label: 'Fully Paid', dot: 'bg-emerald-600' },
              { value: 'partial', label: 'Partially Paid', dot: 'bg-amber-500' },
              { value: 'pending', label: 'Pending / Unpaid', dot: 'bg-[#940016]' },
            ]}
            containerClassName="relative min-w-0 flex-1 sm:flex-none"
            className="w-full sm:w-52 h-10 rounded-xl border-primary/15 bg-white hover:bg-[#fcf5f7]"
            menuWidthClass="w-full min-w-[180px]"
          />

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Showing <strong>{filteredLines.length}</strong> teachers
          </span>
        </div>
      </div>

      {/* Payroll Table */}
      <Card className="rounded-2xl border border-border/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap [&_th]:px-1.5 [&_td]:px-1.5 2xl:[&_th]:px-3 2xl:[&_td]:px-3">
            <thead className="bg-[#fcf5f7] border-b border-primary/10 text-[10px] uppercase font-bold text-primary tracking-wider">
              <tr>
                <th className="p-3.5 pl-4">Teacher &amp; Role</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Calculation Details</th>
                <th className="p-3.5 text-right">Base (PKR)</th>
                <th className="p-3.5 text-right">Allow. / Deduct.</th>
                <th className="p-3.5 text-right">Net Payable</th>
                <th className="p-3.5 text-right">Disbursed</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-muted-foreground">
                    <Loader2 size={20} className="animate-spin inline mr-2 text-primary" />
                    Calculating payroll records...
                  </td>
                </tr>
              ) : paginatedLines.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-muted-foreground">
                    No payroll lines match the selected filters for {selectedMonth}.
                  </td>
                </tr>
              ) : (
                paginatedLines.map(line => {
                  const isPaid = line.status === 'Paid'
                  const isPartial = line.status === 'Partially Paid'
                  const teacherMeta = teachersWithAgreements.find(t => t.teacherId === line.teacherId)

                  return (
                    <tr key={line.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-4">
                        <strong className="text-foreground block">{line.teacherName}</strong>
                        <span className="text-[10px] text-muted-foreground">{line.designation}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/10">
                          {line.calculationMethod === 'fixed' && <DollarSign size={10} />}
                          {line.calculationMethod === 'per_lecture' && <Calculator size={10} />}
                          {line.calculationMethod === 'per_student' && <GraduationCap size={10} />}
                          {line.calculationMethod === 'fee_percentage' && <Percent size={10} />}
                          {line.calculationMethod.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[11px] text-foreground block font-medium">
                          {line.calculationDetails?.description || 'Standard calculation'}
                        </span>
                        {line.advancesDeducted > 0 && (
                          <span className="text-[10px] text-amber-700 block mt-0.5">
                            Advance recovered: PKR {line.advancesDeducted.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-semibold text-foreground">
                        PKR {Number(line.baseEarnings).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="text-[11px]">
                          {line.allowances > 0 && <span className="text-emerald-700 block">+{line.allowances.toLocaleString()}</span>}
                          {line.deductions > 0 && <span className="text-red-700 block">-{line.deductions.toLocaleString()}</span>}
                          {line.allowances === 0 && line.deductions === 0 && <span className="text-muted-foreground">0</span>}
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-bold text-foreground">
                        PKR {Number(line.netPayable).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-bold text-emerald-700">
                        PKR {Number(line.totalPaid).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-bold text-primary">
                        PKR {Number(line.outstanding).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPartial
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {line.status}
                        </span>
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Disburse Payment Button (Super Admin only) */}
                          {canManage && line.outstanding > 0 && isPeriodApproved && (
                            <Button
                              size="sm"
                              disabled={loading}
                              onClick={() => setDisburseModal({ open: true, line })}
                              className="h-7 px-2 text-[10px] font-bold bg-[#940016] hover:bg-[#7a0012] text-white shadow-xs cursor-pointer"
                            >
                              <Banknote size={12} className="mr-1" />
                              Pay
                            </Button>
                          )}


                          {/* View Payslip */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayslip(line)}
                            className="h-7 px-2 text-[10px] cursor-pointer bg-white"
                            title="View and print official payslip"
                          >
                            <FileText size={12} className="mr-1 text-primary" />
                            Payslip
                          </Button>

                          {/* Edit Agreement */}
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={loading}
                              onClick={() => setAgreementModal({
                                open: true,
                                teacher: teacherMeta || { id: line.teacherId, name: line.teacherName },
                                agreement: teacherMeta?.agreement || null,
                              })}
                              className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Configure teacher salary agreement"
                            >
                              <Sliders size={12} />
                            </Button>
                          )}

                          {/* Manual Adjustment */}
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={loading || isPeriodApproved}
                              onClick={() => setAdjustmentModal({ open: true, line })}
                              className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Add bonus or deduction"
                            >
                              <Plus size={12} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination label="Teacher payroll" page={Math.min(page,totalPages)} rows={pageSize} total={filteredLines.length} onPage={setPage} onRows={value=>{setPageSize(value);setPage(1)}}/>

      </Card>


      {/* Salary Agreement Modal */}
      {agreementModal.open && (
        <SalaryAgreementModal
          open={agreementModal.open}
          onClose={() => setAgreementModal({ open: false, teacher: null, agreement: null })}
          teacher={agreementModal.teacher}
          initialAgreement={agreementModal.agreement}
          onSaved={handleSaveAgreement}
          branchId={branchId}
        />
      )}

      {/* Disburse Payment Modal */}
      {disburseModal.open && (
        <DisbursePaymentModal
          open={disburseModal.open}
          onClose={() => setDisburseModal({ open: false, line: null })}
          line={disburseModal.line}
          onDisburse={handleDisburse}
        />
      )}

      {/* Staff Advance Modal */}
      {advanceModal.open && (
        <StaffAdvanceModal
          open={advanceModal.open}
          onClose={() => setAdvanceModal({ open: false })}
          teachers={teachersWithAgreements}
          onRequestAdvance={handleRequestAdvance}
        />
      )}

      {/* Manual Adjustment Modal */}
      {adjustmentModal.open && (
        <ManualAdjustmentModal
          open={adjustmentModal.open}
          onClose={() => setAdjustmentModal({ open: false, line: null })}
          line={adjustmentModal.line}
          onAddAdjustment={handleAddAdjustment}
        />
      )}

      {/* Payslip Modal */}
      {payslipModal.open && (
        <PayslipModal
          open={payslipModal.open}
          onClose={() => setPayslipModal({ open: false, data: null })}
          payslipData={payslipModal.data}
          branchName={branchName}
        />
      )}
    </div>
  )
}
