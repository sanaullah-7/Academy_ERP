import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, ArrowRight, Banknote, CalendarDays, Clock3, CreditCard, DoorOpen, GraduationCap, Loader2, MapPin, MoreVertical, ReceiptText, RefreshCw, Search, TrendingDown, UserPlus, UserRound, Users } from 'lucide-react'
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
import { feeService } from '../../services/feeService.js'
import { classScheduleService } from '../../services/classScheduleService.js'
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
    <div className="relative h-44 w-full sm:h-48" aria-label={`Revenue and expenses chart for ${periodLabel}`}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={records} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--border))" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><Tooltip formatter={value=>money(value)} /><Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#bfdbfe" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
      {!hasData&&<div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="max-w-sm rounded-xl border bg-card/95 px-5 py-4 text-center shadow-sm"><p className="font-semibold">No financial records for {periodLabel.toLowerCase()}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Verified receipts and posted expenses will appear automatically.</p></div></div>}
    </div>
  </div>
}

function FeeStatusBadge({ value }) {
  const status = value ?? 'Unavailable'
  const style = status === 'Paid' ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : status === 'Partial' ? 'border-amber-200 bg-amber-100 text-amber-700' : 'bg-background text-muted-foreground'
  return <Badge variant="outline" className={`gap-1.5 whitespace-nowrap ${style}`}><span className={`size-2 rounded-full ${status === 'Paid' ? 'bg-emerald-500' : status === 'Partial' ? 'bg-amber-500' : 'bg-muted-foreground/50'}`} />{status}</Badge>
}

function FeeStatusMenu({ studentName, value, busy, onChange }) {
  return <details className="relative inline-block text-left">
    <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Enrollment actions for ${studentName}`}><MoreVertical size={18} aria-hidden="true" /></summary>
    <div role="menu" className="absolute right-0 z-30 mt-1 grid w-28 gap-0.5 rounded-lg border bg-card p-1 shadow-lg">
      {['Unavailable', 'Paid', 'Partial'].map(status => <button key={status} type="button" role="menuitem" disabled={busy} aria-current={(value ?? 'Unavailable') === status ? 'true' : undefined} className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted disabled:opacity-50 ${(value ?? 'Unavailable') === status ? 'bg-muted font-semibold' : ''}`} onClick={event => { event.currentTarget.closest('details')?.removeAttribute('open'); onChange(status) }}>{status}</button>)}
    </div>
  </details>
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
  const [feeUpdate, setFeeUpdate] = useState({ id: null, message: '', error: '' })
  const [clock, setClock] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setClock(new Date()), 60000); return () => window.clearInterval(timer) }, [])

  useEffect(() => {
    let active = true
    if (branchId) Promise.all([
      studentService.listDirectory({ branchId }),
      admissionService.list({ branchId }),
      academicService.overview({ branchId }),
      classScheduleService.list({ branchId }),
      financialService.overview({ branchId }),
      financialService.financeOverview({ branchId }),
    ]).then(([students, admissions, academic, classes, financial, finance]) => {
      if (active) setResult({ scopeKey, request, students, admissions, academic, classes, financial, finance })
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
  const todayKey = localDateKey(clock)
  const upcomingClasses = (current?.classes ?? []).filter(item => item.classDate === todayKey && new Date(`${item.classDate}T${item.endTime}:00`) >= clock).sort((a,b)=>a.startTime.localeCompare(b.startTime))
  const completedToday = (current?.classes ?? []).filter(item => item.classDate === todayKey && new Date(`${item.classDate}T${item.endTime}:00`) < clock).length
  const payments = current?.financial?.payments ?? []
  const challans = current?.financial?.challans ?? []
  const collected = payments.filter(item => isInPeriod(item.paidAt, period, range)).reduce((sum,item)=>sum+item.amount,0)
  const outstanding = challans.reduce((sum,item)=>sum+item.balance,0)
  const classTiming = item => { const start = new Date(`${item.classDate}T${item.startTime}:00`), end = new Date(`${item.classDate}T${item.endTime}:00`); if (clock >= start && clock < end) return 'In Progress'; const minutes = Math.ceil((start-clock)/60000); return minutes <= 15 ? 'Starting Soon' : minutes < 60 ? `In ${minutes} min` : `In ${Math.floor(minutes/60)}h ${minutes%60}m` }

  async function updateFeeStatus(enrollmentId, feeStatus, studentName) {
    setFeeUpdate({ id: enrollmentId, message: '', error: '' })
    try {
      const saved = await feeService.updateEnrollmentStatus(enrollmentId, { feeStatus }, { branchId })
      setResult(previous => previous?.students ? { ...previous, students: previous.students.map(student => ({ ...student, enrollments: (student.enrollments ?? []).map(enrollment => enrollment.id === saved.id ? { ...enrollment, feeStatus: saved.feeStatus } : enrollment) })) } : previous)
      setFeeUpdate({ id: null, message: `${studentName} fee status updated to ${saved.feeStatus}.`, error: '' })
    } catch (error) {
      setFeeUpdate({ id: null, message: '', error: error.message })
    }
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
                    {feeUpdate.message && <p role="status" className="border-b bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">{feeUpdate.message}</p>}
                    {feeUpdate.error && <p role="alert" className="border-b bg-red-50 px-5 py-3 text-sm font-medium text-red-700">{feeUpdate.error}</p>}
                    {visibleEnrollments.length === 0 ? <div className="p-6"><EmptyData icon={Users} title="No recent enrollments" description={`No saved enrollments were found for ${periodLabel?.toLowerCase()} in this branch.`} /></div> : <>
                      <div className="hidden w-full rounded-b-xl md:block"><table className="w-full table-fixed text-left text-[11px] xl:text-xs"><colgroup><col className="w-[24%]" /><col className="w-[18%]" /><col className="w-[20%]" /><col className="w-[17%]" /><col className="w-[13%]" /><col className="w-[8%]" /></colgroup><thead className="bg-primary/5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><tr><th className="whitespace-nowrap px-3 py-2.5">Student Name</th><th className="whitespace-nowrap px-2 py-2.5">Field / Program</th><th className="whitespace-nowrap px-2 py-2.5">Batch</th><th className="whitespace-nowrap px-2 py-2.5">Enrolled</th><th className="whitespace-nowrap px-2 py-2.5">Fee Status</th><th className="whitespace-nowrap px-1 py-2.5 text-center">Actions</th></tr></thead><tbody>{visibleEnrollments.map((item, index) => <tr key={item.id} className={`whitespace-nowrap transition-colors hover:bg-primary/5 ${index % 2 ? 'bg-primary/[0.035]' : 'bg-card'} ${index === visibleEnrollments.length - 1 ? '[&>td:first-child]:rounded-bl-xl [&>td:last-child]:rounded-br-xl' : ''}`}><td className="min-w-0 px-3 py-2.5"><Link title={item.studentName} className="block truncate font-semibold text-foreground hover:text-primary hover:underline" to={`/students/${item.studentId}`}>{item.studentName}</Link><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{item.admissionReference}</span></td><td className="px-2 py-2.5"><span title={item.courseName} className={`block w-fit max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${index % 2 ? 'bg-indigo-100 text-indigo-800' : 'bg-cyan-100 text-cyan-800'}`}>{item.courseName}</span></td><td title={item.batchName} className="truncate px-2 py-2.5 text-muted-foreground">{item.batchName}</td><td className="truncate px-2 py-2.5 text-muted-foreground">{formatDateTime(item.enrolledAt)}</td><td className="px-2 py-2.5"><FeeStatusBadge value={item.feeStatus} /></td><td className="px-1 py-1.5 text-center"><FeeStatusMenu studentName={item.studentName} value={item.feeStatus} busy={feeUpdate.id === item.id} onChange={status => updateFeeStatus(item.id, status, item.studentName)} /></td></tr>)}</tbody></table></div>
                      <div className="grid gap-3 p-4 md:hidden">{visibleEnrollments.map(item => <article key={item.id} className="relative rounded-xl border p-4 pr-12"><div className="absolute right-2 top-2"><FeeStatusMenu studentName={item.studentName} value={item.feeStatus} busy={feeUpdate.id === item.id} onChange={status => updateFeeStatus(item.id, status, item.studentName)} /></div><Link title={item.studentName} className="block truncate font-semibold text-foreground hover:text-primary hover:underline" to={`/students/${item.studentId}`}>{item.studentName}</Link><span className="block truncate text-xs text-muted-foreground">{item.admissionReference}</span><p className="mt-3 truncate text-sm text-muted-foreground" title={`${item.courseName} • ${item.batchName}`}>{item.courseName} • {item.batchName}</p><div className="mt-3 flex items-center justify-between gap-3"><span className="truncate text-xs text-muted-foreground">{formatDateTime(item.enrolledAt)}</span><FeeStatusBadge value={item.feeStatus} /></div></article>)}</div>
                    </>}
                  </CardContent>
                </Card>
              </div>

              <aside className="grid min-w-0 content-start gap-4">
                <Card className="border-border/70 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"><CardHeader><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Quick Operations</h2><span className="text-xs text-muted-foreground">Fast desk</span></div></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
                  <Button variant="secondary" className="h-auto min-h-20 justify-start rounded-xl border border-primary/20 bg-primary/5 px-4 text-left hover:bg-primary/10" disabled={!canCreateAdmission} onClick={() => navigate(ROUTE_PATHS.NEW_ADMISSION)}><span className="grid size-10 place-items-center rounded-lg bg-primary text-white shadow-xs"><UserPlus size={19} aria-hidden="true" /></span><span><strong className="block">New Admission</strong><small className="font-normal text-muted-foreground">Student registration</small></span></Button>
                  {[{ title: 'Collect Fee', note: 'Open Fees', icon: ReceiptText, path: ROUTE_PATHS.FEES, style: 'border-blue-100 bg-blue-50/70 hover:bg-blue-100/70', iconStyle: 'bg-blue-100 text-blue-700' }, { title: 'Record Expense', note: 'Open Finance', icon: CreditCard, path: ROUTE_PATHS.FINANCE, style: 'border-amber-100 bg-amber-50/70 hover:bg-amber-100/70', iconStyle: 'bg-amber-100 text-amber-700' }, { title: 'Add Demo', note: 'Open Demo Classes', icon: DoorOpen, path: ROUTE_PATHS.DEMO_CLASSES, style: 'border-violet-100 bg-violet-50/70 hover:bg-violet-100/70', iconStyle: 'bg-violet-100 text-violet-700' }].map(item => <Button key={item.title} variant="secondary" className={`h-auto min-h-20 justify-start rounded-xl border px-4 text-left ${item.style}`} onClick={() => navigate(item.path)}><span className={`grid size-10 place-items-center rounded-lg ${item.iconStyle}`}><item.icon size={19} aria-hidden="true" /></span><span><strong className="block">{item.title}</strong><small className="font-normal text-muted-foreground">{item.note}</small></span></Button>)}
                </CardContent></Card>

                <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                  <CardHeader className="flex flex-nowrap items-center justify-start gap-12.5 px-3 py-5 sm:px-5">
                    <h2 className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-md font-bold tracking-tight text-slate-950 sm:text-base">
                      <span className="size-2.5 shrink-0 rounded-full bg-primary/20 ring-2 ring-primary/10" aria-hidden="true" />
                      Upcoming Classes Today
                    </h2>
                    <Badge className="h-5 w-fit shrink-0 self-center whitespace-nowrap rounded-full border-0 bg-blue-100 px-1.5 py-0 text-[9px] font-bold leading-none text-blue-950 hover:bg-blue-100 sm:text-[11px]" variant="secondary">{upcomingClasses.length} Active {upcomingClasses.length === 1 ? 'Slot' : 'Slots'}</Badge>
                  </CardHeader>
                  <CardContent className="grid gap-2 p-[5px]">
                    {upcomingClasses.length === 0
                      ? <EmptyData icon={Clock3} title="No upcoming classes today" description={completedToday ? `${completedToday} class${completedToday === 1 ? ' has' : 'es have'} already completed today.` : 'Add a class from the Class Schedule page.'} />
                      : upcomingClasses.map(item => <button
                          key={item.id}
                          aria-label={`Open ${item.subject} in Class Schedule`}
                          onClick={() => navigate(ROUTE_PATHS.CLASS_SCHEDULE, { state: { classId: item.id } })}
                          className="group w-full rounded-xl bg-[#eef3ff] p-3 text-left transition-colors hover:bg-[#e5edff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <strong className="text-sm font-bold text-slate-950 sm:text-base">{item.subject}</strong>
                                <Badge className="max-w-full truncate border-0 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/15" variant="secondary">{item.batchName}</Badge>
                              </div>
                              <span className="mt-2.5 flex min-w-0 items-center gap-2 text-xs text-slate-500 sm:text-sm"><UserRound className="shrink-0" size={17} aria-hidden="true" /><span className="truncate">{item.teacherName}</span></span>
                            </div>
                            <div className="text-left sm:text-right">
                              <strong className="whitespace-nowrap text-sm font-bold text-primary">{item.startTime} – {item.endTime}</strong>
                              <span className="mt-1 block text-xs font-medium text-slate-500">{classTiming(item)}</span>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <span className="flex min-w-0 items-center gap-1.5 text-slate-600"><MapPin className="shrink-0 text-primary" size={18} aria-hidden="true" /><span className="truncate">{item.location}</span></span>
                            <span className="flex items-center gap-1.5 font-semibold text-slate-800 sm:justify-end"><Users className="shrink-0 text-primary" size={18} aria-hidden="true" />{item.enrolledCount} Students Enrolled</span>
                          </div>
                        </button>)}
                  </CardContent>
                </Card>
                <RecentPayments branchId={branchId} payments={payments} onOpenReceipt={payment => navigate(ROUTE_PATHS.FEES, { state: { receiptId: payment.receiptId } })} />
              </aside>
            </div>
            <p className="sr-only">{current.academic.courses.length} courses and {current.academic.batches.length} batches are available in the active branch.</p>
          </>}
    </div>
  </DashboardLayout>
}
