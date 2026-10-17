import { classPeriod } from '../../utils/classTime.js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, ArrowRight, Banknote, CalendarDays, CheckCircle2, Clock3, CreditCard, DoorOpen, GraduationCap, Loader2, MapPin, ReceiptText, RefreshCw, Search, TrendingDown, UserPlus, UserRound, Users } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { admissionService } from '../../services/admissionService.js'
import { studentService } from '../../services/studentService.js'
import { academicService } from '../../services/academicService.js'

import { classScheduleService, resolveDailyClasses } from '../../services/classScheduleService.js'
import { facultyService } from '../../services/facultyService.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import RecentPayments from './Shared/RecentPayments.jsx'
import { financialService } from '../../services/financialService.js'

const PERIODS = Object.freeze([
  { id: 'all', label: 'All' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'custom', label: 'Custom' },
])

function isInPeriod(value, period, range, now = new Date()) {
  if (period === 'all') return true
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return false
  if (period === 'daily') return date.toDateString() === now.toDateString()
  if (period === 'weekly') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    return date >= start && date <= now
  }
  if (period === 'monthly') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  if (period === 'yearly') return date.getFullYear() === now.getFullYear()
  if (period === 'custom') {
    if (!range.start || !range.end) return false
    const start = new Date(`${range.start}T00:00:00`)
    const end = new Date(`${range.end}T23:59:59.999`)
    return start <= end && date >= start && date <= end
  }
  return false
}

function formatDateTime(value) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function localDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const money = value => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)

function DashboardKpi({ title, value, note, periodLabel, icon: Icon, tone = 'maroon', unavailable = false }) {
  const palette = {
    maroon: { icon: 'bg-primary/10 text-primary', card: 'border-primary/15 bg-[#F9EBEE]/40', bar: 'bg-primary' },
    blue: { icon: 'bg-blue-100 text-blue-700', card: 'border-blue-100 bg-blue-50/35', bar: 'bg-blue-500' },
    violet: { icon: 'bg-violet-100 text-violet-700', card: 'border-violet-100 bg-violet-50/35', bar: 'bg-violet-500' },
    red: { icon: 'bg-rose-100 text-rose-700', card: 'border-rose-100 bg-rose-50/35', bar: 'bg-rose-500' },
  }[tone] ?? { icon: 'bg-primary/10 text-primary', card: 'border-border bg-card', bar: 'bg-primary' }
  return <Card className={`relative min-h-36 overflow-hidden py-0 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${palette.card}`}>
    <span className={`absolute inset-x-0 top-0 h-1 ${palette.bar}`} aria-hidden="true" />
    <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</p>{periodLabel && <Badge variant="outline" className="mt-2 h-5 rounded-full px-2 text-[10px] normal-case tracking-normal">{periodLabel}</Badge>}</div><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${palette.icon}`}><Icon size={18} aria-hidden="true" /></span></div>
      <div><p className={`break-words text-2xl font-bold tracking-tight ${unavailable ? 'text-muted-foreground' : tone === 'red' ? 'text-red-700' : 'text-foreground'}`}>{value}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p></div>
    </CardContent>
  </Card>
}

function EmptyData({ icon: Icon, title, description }) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
    <span className="mb-3 grid size-11 place-items-center rounded-xl bg-background text-muted-foreground shadow-sm"><Icon size={21} aria-hidden="true" /></span>
    <p className="font-semibold">{title}</p><p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
  </div>
}

function CashflowChart({ period, periodLabel, range, payments, expenses }) {
  const records = useMemo(() => {
    const now = new Date()
    const create = (key, label) => ({ key, label, revenue: 0, expenses: 0 })
    let buckets
    if (period === 'daily') buckets = Array.from({ length: 6 }, (_, index) => create(index, `${String(index * 4).padStart(2, '0')}:00`))
    else if (period === 'weekly') { const monday = new Date(now); monday.setHours(0,0,0,0); monday.setDate(monday.getDate()-((monday.getDay()+6)%7)); buckets = Array.from({length:7},(_,index)=>{const date=new Date(monday);date.setDate(date.getDate()+index);return create(localDateKey(date),new Intl.DateTimeFormat('en-PK',{weekday:'short'}).format(date))}) }
    else if (period === 'monthly') buckets = Array.from({length:5},(_,index)=>create(index,`Week ${index+1}`))
    else if (period === 'custom' && range.start && range.end) { const start=new Date(`${range.start}T00:00:00`), end=new Date(`${range.end}T00:00:00`), days=Math.min(31,Math.floor((end-start)/86400000)+1); buckets=Array.from({length:Math.max(0,days)},(_,index)=>{const date=new Date(start);date.setDate(date.getDate()+index);return create(localDateKey(date),new Intl.DateTimeFormat('en-PK',{day:'numeric',month:'short'}).format(date))}) }
    else { const first = new Date(now.getFullYear(), now.getMonth() - 11, 1); buckets = Array.from({length:12},(_,index)=>{const date=new Date(first.getFullYear(),first.getMonth()+index,1);return create(`${date.getFullYear()}-${date.getMonth()}`,new Intl.DateTimeFormat('en-PK',{month:'short'}).format(date))}) }
    const bucketFor = value => { const date=new Date(value); if(Number.isNaN(date.getTime()))return null; if(period==='daily')return buckets[Math.floor(date.getHours()/4)]; if(period==='weekly'||period==='custom')return buckets.find(item=>item.key===localDateKey(date)); if(period==='monthly')return buckets[Math.min(4,Math.floor((date.getDate()-1)/7))]; return buckets.find(item=>item.key===`${date.getFullYear()}-${date.getMonth()}`) }
    payments.filter(item=>isInPeriod(item.paidAt,period,range,now)).forEach(item=>{const bucket=bucketFor(item.paidAt);if(bucket)bucket.revenue+=item.amount})
    expenses.filter(item=>isInPeriod(item.entryDate,period,range,now)).forEach(item=>{const bucket=bucketFor(item.entryDate);if(bucket)bucket.expenses+=item.amount})
    return buckets
  }, [expenses, payments, period, range])
  const inflow = records.reduce((sum,item)=>sum+item.revenue,0)
  const burn = records.reduce((sum,item)=>sum+item.expenses,0)
  const hasData = inflow > 0 || burn > 0
  return <div className="space-y-3">
    <div className="grid gap-2 rounded-xl bg-muted/40 p-2.5 sm:grid-cols-3">
      {[['Inflow', inflow], ['Burn', burn], ['Net Margin', inflow-burn]].map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{periodLabel} {label}</p><p className={`mt-1 font-bold ${value<0?'text-red-700':'text-foreground'}`}>{money(value)}</p></div>)}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-4 text-sm"><span className="flex items-center gap-2"><span className="size-3 rounded-full bg-primary" />Revenue</span><span className="flex items-center gap-2"><span className="size-3 rounded-full bg-blue-200" />Expenses</span></div><Badge variant="outline">{periodLabel}</Badge></div>
    <div className="relative h-52 w-full sm:h-60" aria-label={`Revenue and expenses chart for ${periodLabel}`}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={records} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border)" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><Tooltip formatter={value=>money(value)} /><Bar dataKey="revenue" name="Revenue" fill="var(--dashboard-revenue)" radius={[5, 5, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#bfdbfe" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
      {!hasData&&<div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="max-w-sm rounded-xl border bg-card/95 px-5 py-4 text-center shadow-sm"><p className="font-semibold">No financial records for {periodLabel.toLowerCase()}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Verified receipts and posted expenses will appear automatically.</p></div></div>}
    </div>
  </div>
}

function FeeStatusBadge({ value }) {
  const status = value ?? 'Unavailable'
  const style = status === 'Paid'
    ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
    : status === 'Partial'
    ? 'border-amber-200 bg-amber-100 text-amber-700'
    : status === 'Unpaid' || status === 'Overdue'
    ? 'border-rose-200 bg-rose-100 text-rose-700'
    : 'bg-background text-muted-foreground'
  const dot = status === 'Paid'
    ? 'bg-emerald-500'
    : status === 'Partial'
    ? 'bg-amber-500'
    : status === 'Unpaid' || status === 'Overdue'
    ? 'bg-rose-500'
    : 'bg-muted-foreground/50'
  return <Badge variant="outline" className={`gap-1.5 whitespace-nowrap ${style}`}><span className={`size-2 rounded-full ${dot}`} />{status}</Badge>
}

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const trimmed = timeStr.trim()
  if (trimmed.includes('AM') || trimmed.includes('PM')) return trimmed
  const parts = trimmed.split(':')
  if (parts.length < 2) return trimmed
  let h = parseInt(parts[0], 10)
  const m = parts[1]
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

function formatClassSlotTime(startTime, endTime) {
  if (!startTime) return ''
  if (!endTime) return formatTime12(startTime)
  const s = formatTime12(startTime)
  const e = formatTime12(endTime)
  const sParts = s.split(' ')
  const eParts = e.split(' ')
  if (sParts.length === 2 && eParts.length === 2 && sParts[1] === eParts[1]) {
    return `${sParts[0]} – ${e}`
  }
  return `${s} – ${e}`
}

function getBatchBadgeColor(batchName = '', index = 0) {
  const normalized = batchName.toLowerCase()
  if (normalized.includes('mdcat') || normalized.includes('bio')) return 'bg-[#dcfce7] text-[#065f46] border border-emerald-200/50'
  if (normalized.includes('fsc') || normalized.includes('phy') || normalized.includes('eng')) return 'bg-[#e0e7ff] text-[#3730a3] border border-indigo-200/50'
  if (normalized.includes('etea') || normalized.includes('chem')) return 'bg-[#ccfbf1] text-[#115e59] border border-teal-200/50'
  const palette = [
    'bg-[#dcfce7] text-[#065f46] border border-emerald-200/50',
    'bg-[#e0e7ff] text-[#3730a3] border border-indigo-200/50',
    'bg-[#ccfbf1] text-[#115e59] border border-teal-200/50',
    'bg-[#fef3c7] text-[#92400e] border border-amber-200/50',
    'bg-[#fce7f3] text-[#9d174d] border border-pink-200/50',
  ]
  return palette[index % palette.length]
}

function getClassStatus(item, clock) {
  if(item.timeStatus)return {text:item.timeStatus.label,type:item.timeStatus.type}
  if (item.statusText) {
    return { text: item.statusText, type: item.statusType || 'upcoming' }
  }
  const dateStr = item.classDate || localDateKey(clock)
  const start = new Date(`${dateStr}T${item.startTime}:00`)
  const end = new Date(`${dateStr}T${item.endTime}:00`)

  if (!Number.isNaN(end.getTime()) && clock > end) {
    return { text: 'Completed', type: 'completed' }
  }
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && clock >= start && clock <= end) {
    return { text: 'In Progress', type: 'in-progress' }
  }
  if (!Number.isNaN(start.getTime())) {
    const diffMinutes = Math.ceil((start - clock) / 60000)
    if (diffMinutes <= 30 && diffMinutes >= 0) {
      return { text: 'Starting soon', type: 'soon' }
    }
    if (diffMinutes < 60 && diffMinutes > 0) {
      return { text: `In ${diffMinutes} min`, type: 'upcoming' }
    }
    if (diffMinutes >= 60) {
      const h = Math.floor(diffMinutes / 60)
      const m = diffMinutes % 60
      return { text: m > 0 ? `In ${h}h ${m}m` : `In ${h}h`, type: 'upcoming' }
    }
  }
  return { text: 'Upcoming slot', type: 'upcoming' }
}

function renderClassStatus(item, clock) {
  const status = getClassStatus(item, clock)
  if (status.type === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        In Progress
      </span>
    )
  }
  if (status.type === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
        <CheckCircle2 size={12} className="text-slate-400" />
        Completed
      </span>
    )
  }
  if (status.type === 'soon' || status.text === 'Starting soon') {
    return <span className="font-semibold text-amber-800">Starting soon</span>
  }
  return <span className="font-medium text-slate-700">{status.text}</span>
}

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const { branchId, branch, scopeKey } = useBranch()
  const { can } = usePermissions()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('all')
  const [search, setSearch] = useState('')
  const [range, setRange] = useState({ start: '', end: '' })
  const [request, setRequest] = useState(0)
  const [result, setResult] = useState(null)
  const [clock, setClock] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setClock(new Date()), 60000); return () => window.clearInterval(timer) }, [])

  useEffect(() => {
    let active = true
    if (branchId) Promise.all([
      studentService.listDirectory({ branchId }),
      admissionService.list({ branchId }),
      academicService.overview({ branchId }),
      classScheduleService.list({ branchId }),
      facultyService.listAssignments({ branchId }),
      financialService.overview({ branchId }),
      financialService.financeOverview({ branchId }),
    ]).then(([students, admissions, academic, classes, assignments, financial, finance]) => {
      if (active) setResult({ scopeKey, request, students, admissions, academic, classes, assignments, financial, finance })
    }, error => {
      if (active) setResult({ scopeKey, request, error: error.message })
    })
    return () => { active = false }
  }, [branchId, scopeKey, request])

  const current = result?.scopeKey === scopeKey && result?.request === request ? result : null
  const admissions = current?.admissions ?? []
  const students = useMemo(() => current?.students ?? [], [current?.students])
  const enrollments = useMemo(() => students.flatMap(student => (student.enrollments ?? []).map(enrollment => ({ ...enrollment, studentId: student.id, studentName: student.name, admissionReference: student.admission?.displayAdmissionId ?? student.admission?.admissionId ?? enrollment.admissionId }))).sort((a, b) => Date.parse(b.enrolledAt) - Date.parse(a.enrolledAt)), [students])
  const needle = search.trim().toLocaleLowerCase()
  const visibleEnrollments = enrollments.filter(item => isInPeriod(item.enrolledAt, period, range) && (!needle || `${item.studentName} ${item.courseName} ${item.batchName}`.toLocaleLowerCase().includes(needle))).slice(0, 5)
  const admissionCount = admissions.filter(item => isInPeriod(item.createdAt, period, range)).length
  const activeStudents = students.filter(student => {
    if ((student.status ?? 'Active') !== 'Active') return false
    if (period === 'all') return true
    return isInPeriod(student.admissionCreatedAt, period, range)
      || (student.enrollments ?? []).some(enrollment => isInPeriod(enrollment.enrolledAt, period, range))
  }).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const periodLabel = PERIODS.find(item => item.id === period)?.label
  const metricPeriodLabel = period === 'daily' ? 'Today' : period === 'weekly' ? 'This week' : period === 'monthly' ? 'This month' : period === 'yearly' ? 'This year' : period === 'custom' ? (range.start && range.end ? `${range.start} – ${range.end}` : 'Choose dates') : 'All time'
  const canCreateAdmission = can(PERMISSIONS.ADMISSIONS_CREATE)
  const resolvedTodayClasses = useMemo(()=>resolveDailyClasses({sessions:current?.classes,assignments:current?.assignments,academic:current?.academic,branchId,now:clock}),[branchId,clock,current?.academic,current?.assignments,current?.classes])
  const payments = current?.financial?.payments ?? []
  const challans = current?.financial?.challans ?? []
  const collected = payments.filter(item => isInPeriod(item.paidAt, period, range)).reduce((sum,item)=>sum+item.amount,0)
  const outstanding = challans.reduce((sum,item)=>sum+item.balance,0)

  const getEnrollmentDues = (enrollment) => {
    const linkedChallan = challans.find(c => c.enrollmentId === enrollment.id)
      || challans.find(c => c.studentId === enrollment.studentId && c.courseId === enrollment.courseId)
      || challans.find(c => c.studentId === enrollment.studentId)

    if (linkedChallan) {
      const balance = Number.isFinite(linkedChallan.balance) ? Math.max(0, linkedChallan.balance) : 0
      const status = balance <= 0
        ? 'Paid'
        : (linkedChallan.paidAmount > 0 ? 'Partial' : (linkedChallan.status ?? 'Unpaid'))
      return { dueAmount: balance, feeStatus: status }
    }

    if (Number.isFinite(enrollment.balance)) {
      const balance = Math.max(0, enrollment.balance)
      const status = balance <= 0 ? 'Paid' : (enrollment.initialPayment > 0 ? 'Partial' : (enrollment.feeStatus ?? 'Unpaid'))
      return { dueAmount: balance, feeStatus: status }
    }

    if (enrollment.feeStatus === 'Paid') {
      return { dueAmount: 0, feeStatus: 'Paid' }
    }
    if (enrollment.feeStatus === 'Partial') {
      const total = Number.isFinite(enrollment.netFee) ? enrollment.netFee : (Number.isFinite(enrollment.configuredFee) ? enrollment.configuredFee : 45000)
      const paid = Number.isFinite(enrollment.initialPayment) ? enrollment.initialPayment : Math.round(total * 0.6)
      return { dueAmount: Math.max(0, total - paid), feeStatus: 'Partial' }
    }
    const total = Number.isFinite(enrollment.netFee) ? enrollment.netFee : (Number.isFinite(enrollment.configuredFee) ? enrollment.configuredFee : 0)
    return { dueAmount: total, feeStatus: total === 0 ? 'Paid' : (enrollment.feeStatus ?? 'Unpaid') }
  }

  return <DashboardLayout title="Dashboard" description="Super Admin view for the selected branch.">
    <div className="mx-auto grid w-full max-w-[1600px] min-w-0 gap-7 pb-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}, {user?.name ?? 'Administrator'}</h1><Badge variant="secondary" className="gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary"><span className="size-2 rounded-full bg-primary" />Academic session not configured</Badge></div>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><CalendarDays size={17} aria-hidden="true" />{today}<span aria-hidden="true">•</span>{branch?.name ?? 'No active branch'} Executive Overview</p>
        </div>
      </header>

      {!current ? <Card><CardContent role="status" className="flex min-h-64 items-center justify-center gap-3 p-10 text-muted-foreground"><Loader2 className="animate-spin motion-reduce:animate-none" size={22} aria-hidden="true" />Loading dashboard...</CardContent></Card>
        : current.error ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-10 text-center"><AlertCircle className="text-destructive" aria-hidden="true" /><p role="alert" className="font-semibold">Dashboard data could not be loaded.</p><p className="max-w-lg text-sm text-muted-foreground">{current.error}</p><Button variant="outline" onClick={() => setRequest(value => value + 1)}><RefreshCw size={16} aria-hidden="true" />Retry</Button></CardContent></Card>
          : <>
            <section aria-label="Dashboard key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardKpi title="Active Students" value={activeStudents.toLocaleString()} note={`Verified active records for ${metricPeriodLabel.toLowerCase()}`} periodLabel={metricPeriodLabel} icon={GraduationCap} />
              <DashboardKpi title="New Admissions" value={admissionCount.toLocaleString()} note={`Recorded for ${metricPeriodLabel.toLowerCase()}`} periodLabel={metricPeriodLabel} icon={UserPlus} tone="blue" />
              <DashboardKpi title="Fees Collected" value={money(collected)} note="Saved verified receipts" periodLabel={metricPeriodLabel} icon={Banknote} tone="violet" />
              <DashboardKpi title="Outstanding Fees" value={money(outstanding)} note="Saved challan balances" periodLabel={metricPeriodLabel} icon={TrendingDown} tone="red" />
            </section>

            <section aria-label="Dashboard search and date filters" className="relative flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm lg:flex-row lg:items-center">
              <label className="relative min-w-0 lg:w-72"><span className="sr-only">Search dashboard records</span><Search size={18} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search student, course or batch..." className="pl-10" /></label>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border sm:grid-cols-6" aria-label="Dashboard date range">
                {PERIODS.map(item => <Button key={item.id} variant="ghost" size="sm" aria-pressed={period === item.id} className={`min-h-10 rounded-none border-r border-border/70 px-3 last:border-r-0 ${period === item.id ? 'bg-primary/10 text-primary hover:bg-primary/10' : 'text-muted-foreground'}`} onClick={() => setPeriod(item.id)}>{item.label}</Button>)}
              </div>
              {period === 'custom' && <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-lg sm:grid-cols-2 lg:absolute lg:right-3 lg:top-14 lg:z-20 lg:w-[390px]" role="group" aria-label="Custom date range">
                <h2 className="font-semibold sm:col-span-2">Custom Date Range</h2>
                <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">Start Date<Input aria-label="Start date" type="date" value={range.start} max={range.end || undefined} onChange={event => setRange(previous => ({ ...previous, start: event.target.value }))} /></label>
                <label className="grid gap-1.5 text-sm font-medium text-muted-foreground">End Date<Input aria-label="End date" type="date" value={range.end} min={range.start || undefined} onChange={event => setRange(previous => ({ ...previous, end: event.target.value }))} /></label>7
                {range.start && range.end && range.start > range.end && <p role="alert" className="text-sm text-destructive sm:col-span-2">End date must be on or after start date.</p>}
              </div>}
            </section>

            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] xl:gap-1 xl:pr-2">
              <div className="grid min-w-0 content-start gap-4">
                <Card className="h-fit gap-0 overflow-hidden border-border/70 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                  <CardHeader className="border-b bg-slate-50/70 px-5 py-3.5"><h2 className="text-lg font-semibold">Monthly Cashflow Performance</h2><p className="text-sm text-muted-foreground">Revenue versus operational expenses</p></CardHeader>
                  <CardContent className="p-4"><CashflowChart period={period} periodLabel={periodLabel} range={range} payments={current.finance.payments} expenses={current.finance.expenses} /></CardContent>
                </Card>

                <Card className="h-fit gap-0 overflow-visible rounded-xl border-border/70 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                  <CardHeader className="flex min-h-20 grid-cols-none flex-row items-center justify-between gap-3 rounded-t-xl border-b border-border/60 px-4 py-4 sm:px-5"><div className="min-w-0"><h2 className="text-base font-semibold tracking-tight">Recent Student Enrollments</h2><p className="mt-0.5 truncate text-xs text-muted-foreground">Latest applicants processed across academic wings</p></div>{can(PERMISSIONS.ADMISSIONS_VIEW) && <Button asChild variant="link" size="sm" className="shrink-0 px-1 text-xs"><Link to={ROUTE_PATHS.ADMISSIONS}>View all admissions <ArrowRight size={17} aria-hidden="true" /></Link></Button>}</CardHeader>
                  <CardContent className="p-0">
                    {visibleEnrollments.length === 0 ? <div className="p-6"><EmptyData icon={Users} title="No recent enrollments" description={`No saved enrollments were found for ${periodLabel?.toLowerCase()} in this branch.`} /></div> : <>
                      <div className="hidden w-full rounded-b-xl md:block"><table className="w-full table-fixed text-left text-[11px] xl:text-xs"><colgroup><col className="w-[24%]" /><col className="w-[18%]" /><col className="w-[18%]" /><col className="w-[16%]" /><col className="w-[12%]" /><col className="w-[12%]" /></colgroup><thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"><tr><th className="whitespace-nowrap px-3 py-2.5 font-bold text-slate-700 dark:text-slate-200">Student Name</th><th className="whitespace-nowrap px-2 py-2.5 font-bold text-slate-700 dark:text-slate-200">Field / Program</th><th className="whitespace-nowrap px-2 py-2.5 font-bold text-slate-700 dark:text-slate-200">Batch</th><th className="whitespace-nowrap px-2 py-2.5 font-bold text-slate-700 dark:text-slate-200">Enrolled</th><th className="whitespace-nowrap px-2 py-2.5 font-bold text-slate-700 dark:text-slate-200">Fee Status</th><th className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">Dues</th></tr></thead><tbody>{visibleEnrollments.map((item, index) => {
                        const duesInfo = getEnrollmentDues(item)
                        return <tr key={item.id} tabIndex={0} role="button" aria-label={`View ${item.studentName} in Students directory`} onClick={() => navigate(ROUTE_PATHS.STUDENTS, { state: { highlightStudentId: item.studentId, studentId: item.studentId } })} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(ROUTE_PATHS.STUDENTS, { state: { highlightStudentId: item.studentId, studentId: item.studentId } }) } }} className={`group cursor-pointer whitespace-nowrap transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring ${index % 2 ? 'bg-primary/[0.035]' : 'bg-card'} ${index === visibleEnrollments.length - 1 ? '[&>td:first-child]:rounded-bl-xl [&>td:last-child]:rounded-br-xl' : ''}`}><td className="min-w-0 px-3 py-2.5"><Link title={item.studentName} onClick={event => event.stopPropagation()} className="block truncate font-semibold text-foreground group-hover:text-primary group-hover:underline" to={`/students/${item.studentId}`}>{item.studentName}</Link><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{item.admissionReference}</span></td><td className="px-2 py-2.5"><span title={item.courseName} className={`block w-fit max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${index % 2 ? 'bg-indigo-100 text-indigo-800' : 'bg-cyan-100 text-cyan-800'}`}>{item.courseName}</span></td><td title={item.batchName} className="truncate px-2 py-2.5 text-muted-foreground">{item.batchName}</td><td className="truncate px-2 py-2.5 text-muted-foreground">{formatDateTime(item.enrolledAt)}</td><td className="px-2 py-2.5"><FeeStatusBadge value={duesInfo.feeStatus} /></td><td className="px-3 py-2.5 text-right whitespace-nowrap font-medium">{duesInfo.dueAmount > 0 ? <span className="font-bold text-rose-600 dark:text-rose-400">{money(duesInfo.dueAmount)}</span> : <span className="font-semibold text-emerald-600 dark:text-emerald-400">PKR 0</span>}</td></tr>
                      })}</tbody></table></div>
                      <div className="grid gap-3 p-4 md:hidden">{visibleEnrollments.map(item => {
                        const duesInfo = getEnrollmentDues(item)
                        return <article key={item.id} tabIndex={0} role="button" aria-label={`View ${item.studentName} in Students directory`} onClick={() => navigate(ROUTE_PATHS.STUDENTS, { state: { highlightStudentId: item.studentId, studentId: item.studentId } })} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(ROUTE_PATHS.STUDENTS, { state: { highlightStudentId: item.studentId, studentId: item.studentId } }) } }} className="group relative cursor-pointer rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><Link title={item.studentName} onClick={event => event.stopPropagation()} className="block truncate font-semibold text-foreground group-hover:text-primary group-hover:underline" to={`/students/${item.studentId}`}>{item.studentName}</Link><span className="block truncate text-xs text-muted-foreground">{item.admissionReference}</span></div><div className="text-right shrink-0">{duesInfo.dueAmount > 0 ? <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{money(duesInfo.dueAmount)}</span> : <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">PKR 0</span>}</div></div><p className="mt-2.5 truncate text-sm text-muted-foreground" title={`${item.courseName} • ${item.batchName}`}>{item.courseName} • {item.batchName}</p><div className="mt-3 flex items-center justify-between gap-3"><span className="truncate text-xs text-muted-foreground">{formatDateTime(item.enrolledAt)}</span><FeeStatusBadge value={duesInfo.feeStatus} /></div></article>
                      })}</div>
                    </>}
                  </CardContent>
                </Card>
              </div>

              <aside className="grid min-w-0 content-start gap-4">
                <Card className="border-border/70 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"><CardHeader className="px-4 pb-2 pt-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Quick Operations</h2><span className="text-[10px] text-muted-foreground">Fast desk</span></div></CardHeader><CardContent className="grid gap-2 px-4 pb-3 pt-1 sm:grid-cols-2">
                  <Button variant="secondary" className="h-auto min-h-16 justify-start rounded-lg border border-primary/20 bg-primary/5 gap-2 px-2.5 py-2 text-left hover:bg-primary/10" disabled={!canCreateAdmission} onClick={() => navigate(ROUTE_PATHS.NEW_ADMISSION)}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-xs"><UserPlus size={16} aria-hidden="true" /></span><span className="min-w-0"><strong className="block text-xs leading-tight">New Admission</strong><small className="mt-0.5 block text-[10px] font-normal leading-tight text-muted-foreground">Student registration</small></span></Button>
                  {[{ title: 'Collect Fee', note: 'Open Fees', icon: ReceiptText, path: ROUTE_PATHS.FEES, style: 'border-blue-100 bg-blue-50/70 hover:bg-blue-100/70', iconStyle: 'bg-blue-100 text-blue-700' }, { title: 'Record Expense', note: 'Open Finance', icon: CreditCard, path: ROUTE_PATHS.FINANCE, style: 'border-amber-100 bg-amber-50/70 hover:bg-amber-100/70', iconStyle: 'bg-amber-100 text-amber-700' }, { title: 'Add Demo', note: 'Open Demo Classes', icon: DoorOpen, path: ROUTE_PATHS.DEMO_CLASSES, style: 'border-violet-100 bg-violet-50/70 hover:bg-violet-100/70', iconStyle: 'bg-violet-100 text-violet-700' }].map(item => <Button key={item.title} variant="secondary" className={`h-auto min-h-16 justify-start rounded-lg border gap-2 px-2.5 py-2 text-left ${item.style}`} onClick={() => navigate(item.path)}><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${item.iconStyle}`}><item.icon size={16} aria-hidden="true" /></span><span className="min-w-0"><strong className="block text-xs leading-tight">{item.title}</strong><small className="mt-0.5 block text-[10px] font-normal leading-tight text-muted-foreground">{item.note}</small></span></Button>)}
                </CardContent></Card>

                <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                  <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-primary/10 bg-primary/[0.035] px-4 py-3.5 sm:px-5">
                    <h2 className="text-base font-bold tracking-tight text-primary sm:text-lg">
                      Upcoming Classes Today
                    </h2>
                    <Badge className="h-6 w-fit shrink-0 whitespace-nowrap rounded-full border-0 bg-blue-100/80 px-2.5 py-0.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300" variant="secondary">
                      {resolvedTodayClasses.length} Active {resolvedTodayClasses.length === 1 ? 'Slot' : 'Slots'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid gap-2.5 p-3 sm:p-4">
                    {resolvedTodayClasses.length === 0
                      ? <EmptyData icon={Clock3} title="No classes scheduled for today." description="Create a subject-specific weekly assignment or a class session for today." />
                      : resolvedTodayClasses.map((item, index) => <button
                          key={item.id}
                          type="button"
                          aria-label={`Open ${item.subject} in Class Schedule`}
                          onClick={() => navigate(ROUTE_PATHS.FACULTY_CLASSES, {
                            state: {
                              classId: item.id,
                              assignmentId: item.assignmentId,
                              teacherId: item.teacherId,
                              teacherName: item.teacherName,
                              subject: item.subject,
                              batchId: item.batchId,
                              courseId: item.courseId,
                              fromDashboard: true,
                            },
                          })}
                          className="dashboard-class-slot group w-full rounded-2xl border p-3 text-left text-slate-950 shadow-[0_2px_10px_rgba(15,23,42,0.045)] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-3.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                              <strong className="text-sm font-bold text-slate-950 sm:text-[15px]">{item.subject}</strong>
                              <span className="inline-flex shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{classPeriod(item.startTime)}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${getBatchBadgeColor(item.batchName, index)}`}>{item.batchName}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block text-xs font-bold tracking-tight text-primary sm:text-[13px]">{formatClassSlotTime(item.startTime, item.endTime)}</span>
                              <div className="mt-0.5 text-[11px] font-medium text-slate-700">{renderClassStatus(item, clock)}</div>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-800">
                            <UserRound size={13} className="shrink-0 text-slate-600" aria-hidden="true" /><span className="truncate">{item.teacherName}</span>{item.courseName && <span className="truncate font-normal text-slate-600">• {item.courseName}</span>}
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                            <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-800"><MapPin size={13} className="shrink-0 text-primary/80" aria-hidden="true" /><span className="truncate">{item.location}</span></span>
                            <span className="flex shrink-0 items-center gap-1.5 font-semibold text-slate-950"><Users size={13} className="shrink-0 text-primary/80" aria-hidden="true" /><span>{item.enrolledCount ?? 0} Students Enrolled</span></span>
                          </div>
                        </button>)}
                  </CardContent>
                </Card>
                <RecentPayments todayOnly now={clock} branchId={branchId} payments={payments} onOpenReceipt={payment => navigate(ROUTE_PATHS.FEES, { state: { receiptId: payment.receiptId } })} />
              </aside>
            </div>
            <p className="sr-only">{current.academic.courses.length} courses and {current.academic.batches.length} batches are available in the active branch.</p>
          </>}
    </div>
  </DashboardLayout>
}
