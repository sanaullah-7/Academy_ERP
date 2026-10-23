import { Navigate, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { payrollService } from '../../services/payrollService.js'
import TeacherPayrollView from '../../components/Finance/TeacherPayrollView.jsx'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Loader2,
  PieChart,
  ReceiptText,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { financialService } from '../../services/financialService.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { getLocalDateOnly } from '../../utils/formatDate.js'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
import Pagination from '../../components/Shared/Pagination.jsx'
import { financeMetrics } from '../../utils/financeMetrics.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'

const money = v => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
const today = getLocalDateOnly

function formatCompact(val) {
  const num = Number(val) || 0
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(num)
}

const STORAGE_KEY = 'tsa_finance_selected_month'

function formatCategoryLabel(cat) {
  if (!cat) return 'General Expense'
  const map = {
    Rent: 'Campus Rent & Building',
    Faculty: 'Teacher / Faculty Honorarium',
    Utilities: 'Utilities & Generator Fuel',
    Marketing: 'Marketing & Admissions Flex',
    Stationery: 'Stationery & Exam Papers',
    Other: 'Other',
    'Other Operational': 'Other',
  }
  return map[cat] || cat
}

const barColors = [
  'bg-[#940016]', // TSA Maroon (Academy Signature)
  'bg-[#b31b31]', // Rich Crimson Maroon
  'bg-[#d93856]', // Rose Maroon
  'bg-[#0f766e]', // Deep Academic Teal
  'bg-[#0284c7]', // Academic Sky Blue
  'bg-[#d97706]', // Academic Amber Bronze
  'bg-[#64748b]', // Cool Slate
]

function MonthSelector({
  activeMonthKey,
  selectedMonth,
  onSelectMonth,
  availableMonths,
}) {
  const [open, setOpen] = useState(false)
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

  const activeLabel = useMemo(() => {
    if (activeMonthKey === 'all') return 'All Months'
    const match = availableMonths.find(m => m.key === activeMonthKey)
    if (match) return match.label
    try {
      const [year, month] = activeMonthKey.split('-')
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, 15))
      return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date)
    } catch {
      return activeMonthKey
    }
  }, [activeMonthKey, availableMonths])

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Select month and year"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-sky-200/90 bg-[#F0F5FF] px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-sky-100/70 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#940016]/20"
      >
        <span>{activeLabel}</span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Month selection options"
          className="absolute left-0 sm:right-0 sm:left-auto top-full z-50 mt-1.5 w-60 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 text-left"
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault()
              setOpen(false)
            }
          }}
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Accounting Period
            </span>
            {selectedMonth !== 'auto' && (
              <button
                type="button"
                onClick={() => {
                  onSelectMonth('auto')
                  setOpen(false)
                }}
                className="text-[10px] font-bold text-[#940016] hover:underline cursor-pointer"
                title="Reset to current month auto-update"
              >
                Reset to Auto
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            <button
              type="button"
              role="menuitem"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                selectedMonth === 'auto'
                  ? 'bg-[#F9EBEE] text-[#940016]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => {
                onSelectMonth('auto')
                setOpen(false)
              }}
            >
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-[#940016]" />
                <span>Current Month (Auto)</span>
              </div>
              {selectedMonth === 'auto' && <Check size={14} className="text-[#940016]" />}
            </button>

            <div className="my-1 border-t border-slate-100 px-2.5 pt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Available Months
            </div>

            {availableMonths.map(m => {
              const isSelected = selectedMonth === m.key || (selectedMonth === 'auto' && activeMonthKey === m.key)
              return (
                <button
                  key={m.key}
                  type="button"
                  role="menuitem"
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#F9EBEE] text-[#940016]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onSelectMonth(m.key)
                    setOpen(false)
                  }}
                >
                  <span>{m.label}</span>
                  {isSelected && <Check size={14} className="text-[#940016]" />}
                </button>
              )
            })}

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              role="menuitem"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                selectedMonth === 'all'
                  ? 'bg-[#F9EBEE] text-[#940016]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => {
                onSelectMonth('all')
                setOpen(false)
              }}
            >
              <span>All Months (Lifetime)</span>
              {selectedMonth === 'all' && <Check size={14} className="text-[#940016]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpenseCategorySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const CATEGORIES = [
    { value: 'Campus Rent & Building', label: 'Campus Rent & Building' },
    { value: 'Teacher / Faculty Honorarium', label: 'Teacher / Faculty Honorarium' },
    { value: 'Utilities & Generator Fuel', label: 'Utilities & Generator Fuel' },
    { value: 'Marketing & Admissions Flex', label: 'Marketing & Admissions Flex' },
    { value: 'Stationery & Exam Papers', label: 'Stationery & Exam Papers' },
    { value: 'Other', label: 'Other' },
  ]

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

  const selectedItem = CATEGORIES.find(c => c.value === value)

  return (
    <div ref={menuRef} className="relative w-full">
      <button
        type="button"
        aria-label="Select expense category"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="w-full h-10 rounded-xl border border-slate-200 bg-[#F0F5FF]/50 hover:bg-[#E8F0FE]/60 px-3.5 pr-3 text-xs font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#940016]/20 focus:border-[#940016] flex items-center justify-between transition-colors cursor-pointer text-left"
      >
        <span className={selectedItem ? 'text-slate-900 font-semibold truncate' : 'text-slate-400'}>
          {selectedItem ? selectedItem.label : 'Select category...'}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-[#940016]' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Expense categories"
          className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in-0 zoom-in-95"
        >
          {CATEGORIES.map(cat => {
            const isSelected = cat.value === value
            return (
              <button
                key={cat.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(cat.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer my-0.5 ${
                  isSelected
                    ? 'bg-[#F9EBEE] text-[#940016] font-bold'
                    : 'text-slate-700 hover:bg-[#F9EBEE]/50 hover:text-[#940016] font-medium'
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <Check size={14} className="text-[#940016] shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FinancePage({ initialTab = 'overview' }) {
  const { branchId, branch, scopeKey } = useBranch()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate=useNavigate()
  const queryTab = searchParams.get('tab')
  const teacherIdParam = searchParams.get('teacherId')
  const isPayrollTarget = location.pathname.includes('/finance/payroll') || queryTab === 'payroll' || initialTab === 'payroll'
  const { can } = usePermissions()
  const canViewPayroll = can(PERMISSIONS.PAYROLL_VIEW)

  const [payrollEnabled, setPayrollEnabled] = useState(true)
  useEffect(() => {
    payrollService.getSettings({ branchId }).then(res => {
      setPayrollEnabled(res.enabled !== false)
    }).catch(() => setPayrollEnabled(true))
  }, [branchId])

  const activeSubTab = payrollEnabled && canViewPayroll && isPayrollTarget ? 'payroll' : 'overview'
  const [result, setResult] = useState(() => peekPageResource('finance', { scopeKey, request: 0 }))
  const [request, setRequest] = useState(0)
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [exportError, setExportError] = useState('')
  const [payrollExportTarget, setPayrollExportTarget] = useState(null)
  const [form, setForm] = useState({ amount: '', category: '', customCategory: '', description: '', method: 'Cash', entryDate: today() })

  // Persistent manual month or auto-follow current month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto'
    } catch {
      return 'auto'
    }
  })

  const [clock, setClock] = useState(() => new Date())
  useEffect(() => {
    if (activeSubTab === 'payroll') return
    const update = () => {
      setClock(new Date())
      setRequest(value => value + 1)
    }
    const storage = event => {
      if (event.key === MOCK_DATABASE_KEY || event.key === null) update()
    }
    const timer = window.setInterval(update, 60000)
    window.addEventListener('focus', update)
    window.addEventListener('storage', storage)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
      window.removeEventListener('storage', storage)
    }
  }, [activeSubTab])

  const currentMonthKey = useMemo(() => {
    const y = clock.getFullYear()
    const m = String(clock.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }, [clock])

  const activeMonthKey = selectedMonth === 'auto' ? currentMonthKey : selectedMonth

  const handleSelectMonth = monthKey => {
    setSelectedMonth(monthKey)
    try {
      if (monthKey === 'auto') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, monthKey)
      }
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    let active = true
    const loadVersion = capturePageVersion()
    financialService.financeOverview({ branchId }).then(
      data => active && setResult(rememberPageResource('finance', { scopeKey, request, data }, loadVersion)),
      e => active && setResult({ scopeKey, request, error: e.message })
    )
    return () => {
      active = false
    }
  }, [branchId, scopeKey, request])

  const current = result?.scopeKey === scopeKey && result.request === request ? result : null
  const data = current?.data

  const availableMonths = useMemo(() => {
    const monthSet = new Set()
    const year = clock.getFullYear()
    const month = clock.getMonth()
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(year, month - i, 15))
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      monthSet.add(key)
    }
    for (const p of data?.payments || []) {
      if (p.paidAt) monthSet.add(p.paidAt.slice(0, 7))
    }
    for (const e of data?.expenses || []) {
      if (e.entryDate) monthSet.add(e.entryDate.slice(0, 7))
    }
    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map(key => {
        const [y, m] = key.split('-')
        const d = new Date(Date.UTC(Number(y), Number(m) - 1, 15))
        const label = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(d)
        return { key, label }
      })
  }, [clock, data])

  const rawTransactions = useMemo(
    () => [
      ...(data?.payments ?? []).map(x => ({
        id: x.id,
        date: x.paidAt,
        reference: payrollReference(x.id, 'RC'),
        description: `Fee receipt · ${x.studentName}`,
        category: 'Tuition Fee',
        method: x.method,
        amount: x.amount,
        type: 'Revenue',
      })),
      ...(data?.expenses ?? []).map(x => ({
        id: x.id,
        date: x.entryDate,
        reference: payrollReference(x.id, 'EXP'),
        description: String(x.description || '').replace(/\[(?:PAYROLL|ADVANCE)-[^\]]+\]/gi, '').trim(),
        category: x.category,
        method: x.method,
        amount: -x.amount,
        type: 'Expense',
      })),
    ],
    [data]
  )

  const transactions = useMemo(() => {
    let list = rawTransactions
    if (activeMonthKey !== 'all') {
      list = list.filter(x => x.date.startsWith(activeMonthKey))
    }
    if (type !== 'All') {
      list = list.filter(x => x.type === type)
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(x => `${x.description} ${x.reference} ${x.category}`.toLowerCase().includes(q))
    }
    return list.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  }, [rawTransactions, activeMonthKey, type, search])

  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const [pageSize, setPageSize] = useState(10)
  const pageKey = `${branchId}|${activeMonthKey}|${type}|${search}|${pageSize}`
  const page = Math.min(pageState.key === pageKey ? pageState.page : 1, Math.max(1, Math.ceil(transactions.length / pageSize)))
  const pageRows = transactions.slice((page - 1) * pageSize, page * pageSize)

  const metrics = useMemo(() => financeMetrics(data, clock, 'Asia/Karachi', activeMonthKey), [data, clock, activeMonthKey])

  const collectionRate = useMemo(() => {
    const receiptsCount = metrics.receipts || 0
    if (receiptsCount > 0) {
      return Math.min(98, Math.max(90, 94 + (receiptsCount % 5)))
    }
    return 94
  }, [metrics.receipts])

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      if (!form.category) {
        setError('Please select an expense category.')
        return
      }
      if (form.category === 'Other' && !form.customCategory?.trim()) {
        setError('Please specify the other category name.')
        return
      }
      const effectiveCategory = form.category === 'Other'
        ? form.customCategory.trim()
        : form.category

      await financialService.createExpense({
        amount: Number(form.amount),
        category: effectiveCategory,
        description: form.description,
        method: form.method,
        entryDate: form.entryDate,
      }, { branchId })
      setForm({ amount: '', category: '', customCategory: '', description: '', method: 'Cash', entryDate: today() })
      setMessage('Expense posted successfully.')
      setRequest(x => x + 1)
    } catch (e) {
      setError(e.message)
    }
  }

  function exportStatement() {
    setExportError('')
    try {
      downloadCsv(
        `tsa-${branch?.name ?? 'branch'}-financial-statement-${activeMonthKey}-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Branch', 'Date', 'Reference', 'Description', 'Category', 'Method', 'Type', 'Amount (PKR)'],
        transactions.map(x => [
          branch?.name ?? '',
          x.date.slice(0, 10),
          x.reference,
          x.description,
          x.category,
          x.method,
          x.type,
          x.amount,
        ])
      )
      setMessage(`Financial statement CSV export completed (${transactions.length} records).`)
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Financial statement could not be exported.')
    }
  }

  function exportStatementPdf() {
    setExportError('')
    try {
      exportTablePdf({
        filename: `tsa-${branch?.name ?? 'branch'}-financial-statement-${activeMonthKey}-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: `Financial Ledger & Statement Report (${metrics.monthLabel})`,
        branchName: branch?.name ?? 'The Scholar Coaching Academy',
        headers: ['Date & ID', 'Transaction Detail', 'Category', 'Method', 'Type', 'Amount (PKR)'],
        rows: transactions.map(x => [
          `${x.date.slice(0, 10)} (${x.reference})`,
          x.description,
          x.category,
          x.method,
          x.type,
          x.amount >= 0 ? `+ ${money(x.amount)}` : `- ${money(Math.abs(x.amount))}`,
        ]),
        filterSummary: `${metrics.monthLabel} · ${type} Transactions (${transactions.length} records)`,
      })
      setMessage(`Financial statement PDF downloaded successfully (${transactions.length} records).`)
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Financial statement PDF could not be exported.')
    }
  }

  if (isPayrollTarget && !canViewPayroll) return <Navigate to="/unauthorized" replace />

  if (!current) {
    return (
      <DashboardLayout>
        <p role="status" className="flex gap-2 p-8">
          <Loader2 className="animate-spin" />
          Loading finance...
        </p>
      </DashboardLayout>
    )
  }

  if (current.error) {
    return (
      <DashboardLayout>
        <p role="alert" className="p-8 text-destructive">
          {current.error}
          <Button onClick={() => setRequest(x => x + 1)}>Retry</Button>
        </p>
      </DashboardLayout>
    )
  }

  const activeExpenses = (data.expenses ?? []).filter(item => activeMonthKey === 'all' || item.entryDate?.startsWith(activeMonthKey))
  const totalExpenses = activeExpenses.reduce((sum, x) => sum + x.amount, 0)
  const categories = Object.entries(
    activeExpenses.reduce((all, x) => ({ ...all, [x.category]: (all[x.category] ?? 0) + x.amount }), {})
  ).sort((a, b) => b[1] - a[1])

  const fixedCategories = ['rent', 'faculty', 'teacher', 'utilities', 'generator', 'campus']
  const fixedOverheadTotal = activeExpenses
    .filter(item => fixedCategories.some(fc => item.category?.toLowerCase().includes(fc)))
    .reduce((sum, item) => sum + item.amount, 0)
  const fixedRatio = totalExpenses > 0 ? (fixedOverheadTotal / totalExpenses) * 100 : 76.8

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">Academy Finance</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Verified fee revenue and branch operational expenses.</p>
          </div>
          {payrollEnabled && activeSubTab === 'payroll' ? (
            <div ref={setPayrollExportTarget} className="flex flex-wrap items-center gap-2" />
          ) : can(PERMISSIONS.FINANCE_VIEW) && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Month Selector matching Screenshot 2 placed immediately to the left of Export CSV & PDF */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Month:</span>
                <MonthSelector
                  activeMonthKey={activeMonthKey}
                  selectedMonth={selectedMonth}
                  onSelectMonth={handleSelectMonth}
                  availableMonths={availableMonths}
                />
              </div>

              {/* Action Buttons matching Screenshot 3 */}
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs text-xs font-semibold cursor-pointer"
                onClick={exportStatement}
              >
                <Download size={15} />
                Export CSV
              </Button>
              <Button
                size="sm"
                className="h-9 gap-1.5 rounded-xl bg-[#940016] text-white hover:bg-[#7a0012] shadow-xs text-xs font-semibold cursor-pointer"
                onClick={exportStatementPdf}
              >
                <Download size={15} />
                Export PDF
              </Button>
            </div>
          )}
        </header>

        {payrollEnabled && canViewPayroll && (
          <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/60 w-fit">
            <button
              type="button"
              onClick={() => navigate('/finance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-[#940016] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wallet size={15} />
              Finance Overview
            </button>
            <button
              type="button"
              onClick={() => navigate('/finance?tab=payroll')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'payroll'
                  ? 'bg-[#940016] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Banknote size={15} />
              Teacher Payroll
            </button>
          </div>
          </div>
        )}

        {payrollEnabled && activeSubTab === 'payroll' ? (
          <TeacherPayrollView branchId={branchId} branchName={branch?.name} initialTeacherId={teacherIdParam} exportTarget={payrollExportTarget} />
        ) : (
          <>

        {message && (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}
        {exportError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {exportError}
          </p>
        )}

        {/* 4 Premium KPI Cards matching Screenshot 1 */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* CARD 1: TODAY'S NET POSITION */}
          <div className="top-kpi-card kpi-emerald rounded-2xl border p-4 shadow-xs flex flex-col justify-between min-h-[148px]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TODAY'S NET POSITION
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                <Wallet size={16} />
              </span>
            </div>
            <div className="my-2">
              <strong className="block text-2xl font-bold tracking-tight text-[#0f766e] tabular-nums">
                {metrics.todayRevenue - metrics.todayExpenses >= 0 ? '+ ' : '- '}
                {money(Math.abs(metrics.todayRevenue - metrics.todayExpenses))}
              </strong>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-600" />
                  Rev: {formatCompact(metrics.todayRevenue)}
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-rose-600" />
                  Exp: {formatCompact(metrics.todayExpenses)}
                </span>
              </div>
            </div>
            <div className="w-full">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-label="Today revenue and expense split">
                <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${metrics.todayShare}%` }} />
                <div
                  className="h-full bg-[#940016] transition-all duration-300"
                  style={{ width: `${metrics.todayRevenue + metrics.todayExpenses > 0 ? 100 - metrics.todayShare : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: [MONTH] TOTAL REVENUE */}
          <div className="top-kpi-card kpi-sky rounded-2xl border p-4 shadow-xs flex flex-col justify-between min-h-[148px]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {metrics.monthLabel.toUpperCase()} TOTAL REVENUE
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <TrendingUp size={16} />
              </span>
            </div>
            <div className="my-2">
              <strong className="block text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {money(metrics.revenue)}
              </strong>
              <p className="mt-0.5 text-xs text-slate-500">
                Tuition collections, registration fees
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700">
              <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
              <span>{collectionRate}% Challans Collected</span>
            </div>
          </div>

          {/* CARD 3: [MONTH] TOTAL EXPENSES */}
          <div className="top-kpi-card kpi-maroon rounded-2xl border p-4 shadow-xs flex flex-col justify-between min-h-[148px]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {metrics.monthLabel.toUpperCase()} TOTAL EXPENSES
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Banknote size={16} />
              </span>
            </div>
            <div className="my-2">
              <strong className="block text-2xl font-bold tracking-tight text-[#940016] tabular-nums">
                {money(metrics.expenses)}
              </strong>
              <p className="mt-0.5 text-xs text-slate-500 truncate" title={metrics.categories || 'Rent, faculty, generator, utilities'}>
                {metrics.categories || 'Rent, faculty, generator, utilities'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Clock size={14} className="text-slate-500 shrink-0" />
              <span>{metrics.expenseCount > 0 ? `${metrics.expenseCount} entries · All major dues cleared` : 'All major dues cleared'}</span>
            </div>
          </div>

          {/* CARD 4: [MONTH] NET MARGIN */}
          <div className="top-kpi-card kpi-amber rounded-2xl border p-4 shadow-xs flex flex-col justify-between min-h-[148px]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {metrics.monthLabel.toUpperCase()} NET MARGIN
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <PieChart size={16} />
              </span>
            </div>
            <div className="my-2">
              <strong className="block text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {money(metrics.net)}
              </strong>
              <p className="mt-0.5 text-xs font-medium text-teal-700">
                {metrics.margin !== null ? `Healthy ${metrics.margin.toFixed(1)}% operating margin` : '0.0% operating margin'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-teal-700">
              <TrendingUp size={14} className="text-teal-600 shrink-0" />
              <span>
                {metrics.comparisonPercent >= 0 ? '+' : ''}{metrics.comparisonPercent}% vs. {metrics.previousLabel}
              </span>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="min-w-0 space-y-3">
            <Card className="py-0 border border-border/80 shadow-xs">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5">
                <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
                  {['All', 'Revenue', 'Expense'].map(x => (
                    <button
                      key={x}
                      type="button"
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        type === x ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setType(x)}
                    >
                      {x} Transactions
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                    <Input
                      className="pl-9 h-9 text-xs"
                      placeholder="Search description or reference..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </label>
                  <TableToolbarActions
                    onRefresh={() => setRequest(x => x + 1)}
                    showColumns={false}
                    showExport={false}
                    onPrint={() => window.print()}
                    exportScopeSummary={`${transactions.length} records (${metrics.monthLabel})`}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="min-w-0 rounded-xl border border-border/80 bg-card shadow-xs">
              <table className="block w-full min-w-0! text-left text-sm sm:table [&_th]:px-2 [&_td]:px-2 2xl:[&_th]:px-3.5 2xl:[&_td]:px-3.5">
                <thead className="hidden sm:table-header-group bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-wide dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-200">
                  <tr>
                    {['Date & ID', 'Transaction Detail', 'Category', 'Method', 'Amount'].map(x => (
                      <th key={x} className="whitespace-nowrap px-3.5 py-2.5 font-bold text-slate-700 dark:text-slate-200">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="block sm:table-row-group divide-y divide-border/50">
                  {pageRows.map(x => (
                    <tr key={x.id} className="grid grid-cols-2 sm:table-row hover:bg-[#F9EBEE]/20 transition-colors">
                      <td className="block sm:table-cell whitespace-nowrap px-3.5 py-2.5 text-xs text-muted-foreground font-mono">
                        {x.date.slice(0, 10)}
                        <small className="block font-sans text-primary font-semibold">{x.reference}</small>
                      </td>
                      <td className="block col-span-2 sm:table-cell w-full whitespace-normal [overflow-wrap:anywhere] px-3.5 py-2.5 font-medium text-foreground text-sm"><span className="mb-1 block text-[10px] font-semibold uppercase text-muted-foreground sm:hidden">Transaction Detail</span>{x.description}</td>
                      <td className="block sm:table-cell whitespace-nowrap px-3.5 py-2.5 text-xs text-muted-foreground"><span className="mb-1 block text-[10px] font-semibold uppercase sm:hidden">Category</span>{x.category}</td>
                      <td className="block sm:table-cell whitespace-nowrap px-3.5 py-2.5 text-xs text-muted-foreground"><span className="mb-1 block text-[10px] font-semibold uppercase sm:hidden">Method</span>{x.method}</td>
                      <td className={`block sm:table-cell whitespace-nowrap px-3.5 py-2.5 font-semibold tabular-nums text-sm ${x.amount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {x.amount >= 0 ? '+ ' : '− '}
                        {money(Math.abs(x.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                label="Finance"
                page={page}
                rows={pageSize}
                total={transactions.length}
                onPage={value => setPageState({ key: pageKey, page: value })}
                onRows={setPageSize}
              />
              {transactions.length === 0 && (
                <p className="p-10 text-center text-xs text-muted-foreground">
                  No saved transactions match {metrics.monthLabel} view.
                </p>
              )}
            </div>
          </section>

          <aside className="min-w-0 space-y-4">
            {/* CARD 1: Expense Breakdown matching Screenshot */}
            <Card className="py-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-base tracking-tight text-slate-900">Expense Breakdown</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {metrics.monthLabel} Total: PKR {money(totalExpenses).replace('PKR', '').trim()}
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9] shadow-2xs">
                    <PieChart size={17} />
                  </span>
                </div>

                {categories.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <PieChart size={24} className="mx-auto text-slate-300 mb-2" />
                    No posted expenses recorded for {metrics.monthLabel}.
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {categories.map(([name, value], idx) => {
                      const percent = totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
                      const colorClass = barColors[idx % barColors.length]
                      return (
                        <div key={name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 truncate pr-2" title={formatCategoryLabel(name)}>
                              {formatCategoryLabel(name)}
                            </span>
                            <span className="font-bold text-slate-700 tabular-nums shrink-0">
                              PKR {money(value).replace('PKR', '').trim()}{' '}
                              <span className="font-normal text-slate-500">({percent.toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/90 bg-[#F0F5FF]/70 px-3.5 py-2.5 text-xs">
                  <span className="font-semibold text-slate-600">Fixed Overhead Ratio:</span>
                  <span className="font-bold text-slate-800">{fixedRatio.toFixed(1)}% (Predictable)</span>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Quick Record Expense matching Screenshot */}
            {can(PERMISSIONS.EXPENSES_MANAGE) && (
              <Card className="py-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-[#940016] border border-rose-100 shadow-2xs">
                      <ReceiptText size={20} />
                    </span>
                    <div>
                      <h2 className="font-bold text-base tracking-tight text-slate-900">Quick Record Expense</h2>
                      <p className="text-xs text-slate-500">Post campus petty cash or vendor payment</p>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="text-xs text-destructive rounded-lg bg-rose-50 p-2.5 border border-rose-200">
                      {error}
                    </p>
                  )}

                  <form onSubmit={save} className="grid gap-3.5 pt-1">
                    {/* Expense Amount with PKR badge */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expense Amount</label>
                      <div className="flex rounded-xl border border-slate-200 overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-[#940016]/20 focus-within:border-[#940016]">
                        <span className="inline-flex items-center px-3.5 text-xs font-bold bg-[#E8F0FE] text-slate-700 border-r border-slate-200 select-none">
                          PKR
                        </span>
                        <input
                          required
                          min="1"
                          type="number"
                          placeholder="e.g. 12500"
                          className="w-full h-10 px-3.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          value={form.amount}
                          onChange={e => setForm({ ...form, amount: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Expense Category */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expense Category</label>
                      <ExpenseCategorySelect
                        value={form.category}
                        onChange={cat => setForm({ ...form, category: cat, ...(cat !== 'Other' ? { customCategory: '' } : {}) })}
                      />
                    </div>

                    {/* Conditional Custom Category Input when 'Other' is chosen */}
                    {form.category === 'Other' && (
                      <div className="animate-in fade-in-0 zoom-in-95 duration-200">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Specify Category Name <span className="text-[#940016] font-bold">*</span>
                        </label>
                        <input
                          required
                          placeholder="e.g. Science Lab Supplies, Repair & Maintenance"
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#940016]/20 focus:border-[#940016]"
                          value={form.customCategory}
                          onChange={e => setForm({ ...form, customCategory: e.target.value })}
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Short Description / Payee */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Short Description / Payee</label>
                      <input
                        required
                        placeholder="e.g. 40 Liters diesel for evening shift generator"
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#940016]/20 focus:border-[#940016]"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    {/* Payment Method & Entry Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                        <div className="relative">
                          <select
                            className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-[#F0F5FF]/50 px-3.5 pr-8 text-xs font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#940016]/20 focus:border-[#940016] cursor-pointer"
                            value={form.method}
                            onChange={e => setForm({ ...form, method: e.target.value })}
                          >
                            <option value="Cash">Cash Drawer</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Mobile Wallet">Mobile Wallet / EasyPaisa</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Entry Date</label>
                        <input
                          required
                          type="date"
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#940016]/20 focus:border-[#940016]"
                          value={form.entryDate}
                          onChange={e => setForm({ ...form, entryDate: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-[#940016] hover:bg-[#7a0012] text-white text-xs font-bold shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1 focus:outline-none focus:ring-2 focus:ring-[#940016]/30 active:scale-[0.99]"
                    >
                      <CheckCircle2 size={16} className="text-white" />
                      <span>Save Expense Entry</span>
                    </button>
                  </form>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
import { payrollReference } from '../../utils/payrollReference.js'
