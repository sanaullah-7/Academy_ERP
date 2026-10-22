import { formatScheduleLabel } from '../../utils/timeFormat.js'
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Activity, ChartNoAxesCombined, Layers3, Sparkles, Users, BookOpen, UserCheck, CreditCard, BarChart3, FileText, ArrowRight, UserPlus, PhoneCall, CalendarDays, ClipboardList, Clock, Banknote, TrendingDown, TrendingUp, GraduationCap, Building2, MapPin } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { ROLES } from '../../constants/roles.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { KpiCard } from '../../components/Dashboard/KpiCard.jsx'
import { studentService } from '../../services/studentService.js'
import { courseService } from '../../services/courseService.js'
import { dashboardService } from '../../services/dashboardService.js'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import SuperAdminDashboard from '../../components/Dashboard/SuperAdminDashboard.jsx'
import CashflowChart from '../../components/Dashboard/CashflowChart.jsx'
import { PERIODS, isInPeriod } from '../../utils/dashboardCashflow.js'

const PREMIUM_PANEL = 'gap-0 overflow-hidden rounded-xl border-border/70 bg-card py-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]'
const PREMIUM_PANEL_HEADER = 'flex min-h-16 grid-cols-none flex-row items-center justify-between gap-3 rounded-t-xl border-b border-border/60 bg-slate-50/70 px-4 py-4 sm:px-5'
const PREMIUM_PANEL_CONTENT = 'p-4 sm:p-5'
const money = value => `PKR ${Number(value || 0).toLocaleString('en-PK')}`
const academyDate = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(value)

function useDashboardData() {
  const { branchId, scopeKey } = useBranch()
  const cacheKey = `dashboard:${scopeKey}`
  const [state, setState] = useState(() => {
    const cached = peekPageResource(cacheKey)
    return cached
      ? { scopeKey, loading: false, data: cached, error: null }
      : { scopeKey, loading: true, data: null, error: null }
  })
  useEffect(() => {
    let active = true
    const version = capturePageVersion()
    if (branchId) {
      dashboardService.overview({ branchId }).then(
        data => {
          if (active) {
            rememberPageResource(cacheKey, data, version)
            setState({ scopeKey, loading: false, data, error: null })
          }
        },
        error => { if (active) setState({ scopeKey, loading: false, data: null, error: error.message }) },
      )
    }
    return () => { active = false }
  }, [branchId, scopeKey, cacheKey])
  return state.scopeKey === scopeKey ? state : { scopeKey, loading: true, data: null, error: null }
}

function DashboardError({ message }) {
  return message ? <Card className="border-destructive/30 bg-destructive/5"><CardContent className="text-sm text-destructive">{message}</CardContent></Card> : null
}

function PlaceholderSection({ title, icon: Icon, children, className = '' }) {
  return <Card className={`min-w-0 ${className}`}>
    <CardHeader className="flex-row items-center justify-between gap-3">
      <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold"><Icon size={18} className="shrink-0 text-primary" aria-hidden="true" />{title}</h2>
      <Badge variant="secondary" className="shrink-0">Placeholder</Badge>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
}

function DemoBarChart({ data = null, dataKey = "value" }) {
  const chartData = data ?? []
  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.15)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            cursor={false}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: '500',
              padding: '8px 12px'
            }}
          />
          <Bar
            dataKey={dataKey}
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            activeBar={{
              fill: 'hsl(var(--primary))',
              style: { transition: 'fill 0.3s ease' }
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
function DefaultDashboard() {
  const { branch } = useBranch()
  const [metrics, setMetrics] = useState({
    students: { value: 0, isLoading: true, error: null },
    courses: { value: 0, isLoading: true, error: null }
  })

  useEffect(() => {
    if (!branch?.id) return
    let mounted = true
    async function loadMetrics() {
      setMetrics(m => ({
        students: { ...m.students, isLoading: true, error: null },
        courses: { ...m.courses, isLoading: true, error: null }
      }))
      try {
        const students = await studentService.list({ branchId: branch.id })
        if (mounted) setMetrics(m => ({ ...m, students: { value: students.length, isLoading: false, error: null } }))
      } catch {
        if (mounted) setMetrics(m => ({ ...m, students: { value: 0, isLoading: false, error: true } }))
      }
      try {
        const courses = await courseService.list({ branchId: branch.id })
        if (mounted) setMetrics(m => ({ ...m, courses: { value: courses.length, isLoading: false, error: null } }))
      } catch {
        if (mounted) setMetrics(m => ({ ...m, courses: { value: 0, isLoading: false, error: true } }))
      }
    }
    loadMetrics()
    return () => { mounted = false }
  }, [branch?.id])

  return <DashboardLayout title="Dashboard" description="A thoughtful overview of your selected branch.">
    <div className="role-dashboard mx-auto grid w-full max-w-[1600px] min-w-0 gap-7 pb-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles size={16} aria-hidden="true" />Dashboard preview</p>
            <p className="text-xl font-semibold tracking-tight">Room for the bigger picture.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">This is a shared layout preview. Metrics, charts and actions will arrive in separately approved tickets.</p>
          </div>
          <div className="min-w-0 rounded-lg border border-primary/20 bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Active branch</p>
            <p className="mt-1 break-words text-sm font-semibold">{branch?.name ?? 'No authorized branch selected'}</p>
          </div>
        </CardContent>
      </Card>
      <section aria-labelledby="dashboard-kpis">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="dashboard-kpis" className="text-base font-semibold">Key Metrics</h2>
          <span className="text-xs text-muted-foreground">Approved mock data</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Students"
            icon={Users}
            value={metrics.students.value}
            isLoading={metrics.students.isLoading}
            error={metrics.students.error}
            description="Active mock students in branch"
          />
          <KpiCard
            title="Active Courses"
            icon={BookOpen}
            value={metrics.courses.value}
            isLoading={metrics.courses.isLoading}
            error={metrics.courses.error}
            description="Mock courses configured"
          />
          <KpiCard
            title="Admissions"
            icon={UserCheck}
            value={0}
            isLoading={false}
            description="Current branch summary"
          />
          <KpiCard
            title="Revenue"
            icon={CreditCard}
            value="PKR 0"
            isLoading={false}
            description="Current branch summary"
          />
        </div>
      </section>
      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <PlaceholderSection title="Charts & trends" icon={ChartNoAxesCombined} className="lg:col-span-2">
          <div className="grid min-h-60 place-items-center rounded-lg border border-dashed border-border bg-muted/40 px-6 py-8 text-center">
            <div><ChartNoAxesCombined size={32} className="mx-auto mb-4 text-muted-foreground" aria-hidden="true" /><p className="text-sm font-medium">Chart placeholder</p><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">No series plotted. Approved metrics and chart definitions are needed before trends can appear.</p></div>
          </div>
        </PlaceholderSection>
        <PlaceholderSection title="Activity" icon={Activity}>
          <div className="flex min-h-60 flex-col items-center justify-center px-3 text-center"><Layers3 size={32} className="mb-4 text-muted-foreground" aria-hidden="true" /><p className="text-sm font-medium">Activity placeholder</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Future branch activity will appear here. No events are loaded.</p></div>
        </PlaceholderSection>
      </div>
      <PlaceholderSection title="Quick actions" icon={Sparkles}>
        <p className="mb-4 text-sm text-muted-foreground">Reserved for approved workflows. These placeholders perform no actions.</p>
        <div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((slot) => <Button key={slot} variant="outline" disabled>Action placeholder {slot}</Button>)}</div>
      </PlaceholderSection>
    </div>
  </DashboardLayout>
}

function OwnerDashboard() {
  const { branch } = useBranch()
  const navigate = useNavigate()
  const { data, loading, error } = useDashboardData()
  const [period, setPeriod] = useState('all')
  const [range, setRange] = useState({ start: '', end: '' })
  const [chartView, setChartView] = useState('cashflow')

  const periodLabel = PERIODS.find(item => item.id === period)?.label ?? 'All'
  const metricPeriodLabel = period === 'daily' ? 'Today' : period === 'weekly' ? 'This week' : period === 'monthly' ? 'This month' : period === 'yearly' ? 'This year' : period === 'custom' ? (range.start && range.end ? `${range.start} – ${range.end}` : 'Choose dates') : 'All time'

  const payments = data?.payments ?? []
  const challans = data?.challans ?? []
  const rawExpenses = data?.expenses ?? []
  const admissions = data?.admissions ?? []
  const students = data?.students ?? []

  const filteredPayments = payments.filter(item => isInPeriod(item.paidAt, period, range))
  const filteredAdmissions = admissions.filter(item => isInPeriod(item.createdAt ?? item.submittedAt, period, range))

  const totalCollectedAll = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpensesAll = rawExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const outstanding = challans.reduce((sum, item) => sum + Number(item.balance || 0), 0)

  const periodCollected = filteredPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const enrollmentTrend = Object.entries((data?.enrollments ?? []).reduce((days, item) => {
    const key = String(item.enrolledAt ?? '').slice(0, 10) || 'Unknown'
    days[key] = (days[key] ?? 0) + 1
    return days
  }, {})).sort(([left], [right]) => left.localeCompare(right)).slice(-7).map(([name, value]) => ({ name: name.slice(5), value }))

  const recentActivity = [
    ...admissions.map(item => ({
      title: `Admission: ${item.studentName ?? item.name ?? item.admissionId ?? 'Student'}`,
      detail: item.course ?? item.courseName ?? 'Enrollment application',
      time: item.createdAt ?? item.submittedAt,
      type: 'admission',
    })),
    ...payments.map(item => ({
      title: `Fee collected: ${money(item.amount)}`,
      detail: `Receipt ${item.receiptNumber ?? item.receiptId ?? item.id}`,
      time: item.paidAt,
      type: 'payment',
    })),
    ...rawExpenses.map(item => ({
      title: `Expense: ${money(item.amount)}`,
      detail: item.category ?? item.description ?? 'Branch voucher',
      time: item.entryDate ?? item.createdAt,
      type: 'expense',
    })),
  ].filter(item => item.time).sort((left, right) => Date.parse(right.time) - Date.parse(left.time)).slice(0, 5)

  return (
    <DashboardLayout title="Dashboard" description="Owner executive view for the selected branch.">
      <div className="role-dashboard mx-auto grid w-full max-w-[1600px] min-w-0 gap-6 pb-6">
        <DashboardError message={error} />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Branch Performance</h1>
              <Badge variant="secondary" className="gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                OWNER EXECUTIVE
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={17} aria-hidden="true" />{branch?.name ?? 'No active branch'} Owner Overview</p>
          </div>
        </header>

        <section aria-label="Dashboard period analysis filter" className="relative flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays size={16} className="text-primary shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Flow Period:</span>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-semibold text-xs">
              {metricPeriodLabel}
            </Badge>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border/70 sm:grid-cols-6" aria-label="Dashboard date range">
            {PERIODS.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                aria-pressed={period === item.id}
                className={`min-h-9 rounded-none border-r border-border/70 px-3 text-xs last:border-r-0 ${period === item.id ? 'bg-primary/10 text-primary font-bold hover:bg-primary/10' : 'text-muted-foreground'}`}
                onClick={() => setPeriod(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-xl sm:grid-cols-2 lg:absolute lg:right-3 lg:top-14 lg:z-30 lg:w-[390px]" role="group" aria-label="Custom date range">
              <h3 className="font-semibold sm:col-span-2 text-sm">Custom Date Range</h3>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                Start Date
                <Input aria-label="Start date" type="date" value={range.start} max={range.end || undefined} onChange={event => setRange(previous => ({ ...previous, start: event.target.value }))} />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                End Date
                <Input aria-label="End date" type="date" value={range.end} min={range.start || undefined} onChange={event => setRange(previous => ({ ...previous, end: event.target.value }))} />
              </label>
              {range.start && range.end && range.start > range.end && (
                <p role="alert" className="text-xs text-destructive sm:col-span-2">End date must be on or after start date.</p>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="dashboard-kpis">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="dashboard-kpis" className="text-base font-semibold">Key Metrics</h2>
            <span className="text-xs text-muted-foreground">Branch ledger summary ({metricPeriodLabel.toLowerCase()})</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Students"
              icon={Users}
              value={students.length}
              isLoading={loading}
              error={error}
              description="Saved active branch students"
            />
            <KpiCard
              title="Active Courses"
              tone="blue"
              icon={BookOpen}
              value={data?.courses.length ?? 0}
              isLoading={loading}
              error={error}
              description={`${data?.batches.length ?? 0} configured batches`}
            />
            <KpiCard
              title="Admissions"
              tone="violet"
              icon={UserCheck}
              value={admissions.length}
              isLoading={loading}
              error={error}
              description={`${filteredAdmissions.length} recorded for ${metricPeriodLabel.toLowerCase()}`}
            />
            <KpiCard
              title="Revenue"
              tone="red"
              icon={CreditCard}
              value={money(totalCollectedAll)}
              isLoading={loading}
              error={error}
              description={`${money(periodCollected)} in ${metricPeriodLabel.toLowerCase()}`}
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <Card className={`${PREMIUM_PANEL} lg:col-span-2`}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2.5">
                  <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                    <BarChart3 size={18} className="shrink-0 text-primary" aria-hidden="true" />
                    Enrollment Trend
                  </h2>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-xs font-semibold text-primary/90 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15">
                    {chartView === 'cashflow' ? 'Cashflow Flow' : 'Intake Volume'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="inline-flex rounded-lg border border-border/70 p-0.5 bg-muted/40" role="tablist" aria-label="Chart perspective">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={chartView === 'cashflow'}
                      onClick={() => setChartView('cashflow')}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${chartView === 'cashflow' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Cashflow Flow
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={chartView === 'enrollment'}
                      onClick={() => setChartView('enrollment')}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${chartView === 'enrollment' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Enrollment Volume
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              {chartView === 'cashflow' ? (
                <CashflowChart
                  period={period}
                  periodLabel={periodLabel}
                  range={range}
                  payments={payments}
                  expenses={rawExpenses}
                  revenueLabel="Fee Inflow"
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recent 7-Day Student Enrollment Intake</span>
                    <Badge variant="outline">{enrollmentTrend.length} days active</Badge>
                  </div>
                  <DemoBarChart data={enrollmentTrend} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={PREMIUM_PANEL}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <Activity size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${act.type === 'payment' ? 'bg-emerald-100 text-emerald-700' : act.type === 'expense' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                      {act.type === 'payment' ? <Banknote size={14} /> : act.type === 'expense' ? <CreditCard size={14} /> : <UserPlus size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{act.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{act.detail}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{act.time ? new Date(act.time).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' }) : ''}</p>
                    </div>
                  </div>
                ))}
                {!loading && recentActivity.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Activity size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                    No recent activity recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="financial-overview">
          <Card className={PREMIUM_PANEL}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <div className="flex items-center justify-between w-full">
                <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                  <CreditCard size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  Financial Overview
                </h2>
                <Badge variant="outline" className="text-xs font-semibold text-muted-foreground">
                  Branch Ledger Health
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Revenue</p>
                    <Banknote size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{money(totalCollectedAll)}</p>
                  <p className="text-xs text-emerald-700 mt-1 font-medium">{payments.length} verified fee receipts</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200/60 bg-amber-50/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Dues</p>
                    <TrendingDown size={16} className="text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{money(outstanding)}</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium">{challans.filter(item => item.balance > 0).length} open student challans</p>
                </div>

                <div className="p-4 rounded-xl border border-rose-200/60 bg-rose-50/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Expenses</p>
                    <CreditCard size={16} className="text-rose-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{money(totalExpensesAll)}</p>
                  <p className="text-xs text-rose-700 mt-1 font-medium">{rawExpenses.length} posted expense vouchers</p>
                </div>

                <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.035]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Operating Margin</p>
                    <TrendingUp size={16} className="text-primary" />
                  </div>
                  <p className={`text-2xl font-extrabold mt-2 ${totalCollectedAll - totalExpensesAll >= 0 ? 'text-primary' : 'text-rose-700'}`}>
                    {money(totalCollectedAll - totalExpensesAll)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Net branch cashflow position</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="quick-operations">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="quick-operations" className="text-base font-semibold">Quick Operations</h2>
            <span className="text-xs text-muted-foreground">Executive management shortcuts</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Admissions Overview', sub: 'View intake & enrollments', icon: UserCheck, path: ROUTE_PATHS.ADMISSIONS, color: 'text-primary bg-primary/10 border-primary/20 hover:border-primary/40' },
              { title: 'Fee Register', sub: 'Challans & collections', icon: Banknote, path: ROUTE_PATHS.FEES, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:border-emerald-300' },
              { title: 'Financial Reports', sub: 'Audited statements', icon: FileText, path: ROUTE_PATHS.REPORTS, color: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:border-indigo-300' },
              { title: 'Campus Assets', sub: 'Physical branch assets', icon: Building2, path: ROUTE_PATHS.ASSETS, color: 'text-amber-700 bg-amber-50 border-amber-200 hover:border-amber-300' }
            ].map((action, i) => (
              <Card
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => navigate(action.path)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(action.path) } }}
                className="group cursor-pointer rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${action.color} transition-transform group-hover:scale-105`}>
                      <action.icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-sm text-foreground group-hover:text-primary transition-colors">{action.title}</span>
                      <small className="block text-[11px] text-muted-foreground truncate">{action.sub}</small>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function ReceptionistDashboard() {
  const { branch } = useBranch()
  const navigate = useNavigate()
  const { data, loading, error } = useDashboardData()
  const today = academyDate(new Date())

  const admissions = data?.admissions ?? []
  const demoClasses = data?.demoClasses ?? []
  const students = data?.students ?? []

  const todaysAdmissions = admissions.filter(item => String(item.createdAt ?? item.submittedAt ?? '').slice(0, 10) === today)
  const pendingAdmissions = admissions.filter(item => ['Pending', 'Draft', 'Under Review'].includes(item.status))
  const pendingDemos = demoClasses.filter(item => !['Converted', 'Cancelled', 'Completed'].includes(item.status))
  const recentAdmissions = [...admissions].sort((left, right) => Date.parse(right.createdAt ?? right.submittedAt ?? 0) - Date.parse(left.createdAt ?? left.submittedAt ?? 0)).slice(0, 5)
  const todaysDemos = demoClasses.filter(item => String(item.scheduledSession?.classDate ?? item.classDate ?? '').slice(0, 10) === today)

  return (
    <DashboardLayout title="Dashboard" description="Front desk overview for the selected branch.">
      <div className="role-dashboard mx-auto grid w-full max-w-[1600px] min-w-0 gap-6 pb-6">
        <DashboardError message={error} />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Front Desk</h1>
              <Badge variant="secondary" className="gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                RECEPTIONIST
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={17} aria-hidden="true" />{branch?.name ?? 'No active branch'} Operational Overview</p>
          </div>
        </header>

        <section aria-labelledby="dashboard-kpis">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="dashboard-kpis" className="text-base font-semibold">Today's Overview</h2>
            <span className="text-xs text-muted-foreground">Approved mock data</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Today's Admissions"
              icon={UserCheck}
              value={todaysAdmissions.length}
              isLoading={loading}
              error={error}
              description="Saved today admissions"
            />
            <KpiCard
              title="Pending Inquiries"
              tone="blue"
              icon={ClipboardList}
              value={pendingAdmissions.length}
              isLoading={loading}
              error={error}
              description="Saved pending admissions"
            />
            <KpiCard
              title="Demo Follow-ups"
              tone="violet"
              icon={PhoneCall}
              value={pendingDemos.length}
              isLoading={loading}
              error={error}
              description="Saved demo follow-ups"
            />
            <KpiCard
              title="Active Students"
              tone="red"
              icon={Users}
              value={students.length}
              isLoading={loading}
              error={error}
              description="Saved branch students"
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <Card className={PREMIUM_PANEL}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <div className="flex items-center justify-between w-full">
                <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                  <Clock size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  Recent Inquiries
                </h2>
                <Button asChild variant="link" size="sm" className="text-xs px-0 text-primary">
                  <Link to={ROUTE_PATHS.ADMISSIONS}>View all inquiries <ArrowRight size={14} className="ml-1" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              <div className="space-y-3">
                {recentAdmissions.map((act, i) => {
                  const statusStyle = act.status === 'Enrolled' || act.status === 'Approved'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : act.status === 'Pending' || act.status === 'Under Review'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
                  return (
                    <div
                      key={i}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(ROUTE_PATHS.ADMISSIONS)}
                      onKeyDown={e => { if (e.key === 'Enter') navigate(ROUTE_PATHS.ADMISSIONS) }}
                      className="group cursor-pointer flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                          {(act.studentName ?? act.name ?? 'S').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {act.studentName ?? act.name ?? act.admissionId}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{act.course ?? act.courseName ?? 'Course pending'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={`text-[10px] font-semibold ${statusStyle}`}>
                          {act.status ?? 'Draft'}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {act.createdAt ? new Date(act.createdAt).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {!loading && recentAdmissions.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No saved admissions yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={PREMIUM_PANEL}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <div className="flex items-center justify-between w-full">
                <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                  <CalendarDays size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  Today's Schedule
                </h2>
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/20 bg-primary/5">
                  {todaysDemos.length} Scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              <div className="space-y-3">
                {todaysDemos.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <CalendarDays size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-foreground truncate">{act.studentName ?? act.name ?? 'Demo class'}</p>
                        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                          Demo
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{act.courseName ?? act.course ?? 'Orientation Class'}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-slate-700">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Clock size={12} />
                          {formatScheduleLabel(act.scheduledSession?.startTime ?? act.startTime ?? '10:00 AM')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={12} />
                          {act.scheduledSession?.room ?? act.room ?? 'Orientation Hall'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && todaysDemos.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No demo classes scheduled today.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="quick-operations">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="quick-operations" className="text-base font-semibold">Front Desk Actions</h2>
            <span className="text-xs text-muted-foreground">Operational counter shortcuts</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'New Walk-in', sub: 'Register student candidate', icon: UserPlus, path: ROUTE_PATHS.NEW_ADMISSION, color: 'text-primary bg-primary/10 border-primary/20 hover:border-primary/40' },
              { title: 'Log Inquiry', sub: 'Record prospective query', icon: PhoneCall, path: ROUTE_PATHS.ADMISSIONS, color: 'text-blue-700 bg-blue-50 border-blue-200 hover:border-blue-300' },
              { title: 'Schedule Demo', sub: 'Book trial demo session', icon: CalendarDays, path: ROUTE_PATHS.DEMO_CLASSES, color: 'text-violet-700 bg-violet-50 border-violet-200 hover:border-violet-300' },
              { title: 'Quick Admission', sub: 'Instant student intake', icon: ClipboardList, path: ROUTE_PATHS.ADMISSIONS, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:border-emerald-300' }
            ].map((action, i) => (
              <Card
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => navigate(action.path)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(action.path) } }}
                className="group cursor-pointer rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${action.color} transition-transform group-hover:scale-105`}>
                      <action.icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-sm text-foreground group-hover:text-primary transition-colors">{action.title}</span>
                      <small className="block text-[11px] text-muted-foreground truncate">{action.sub}</small>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  const { roles } = usePermissions()
  // Resolve presentation from current branch roles without changing authorization.
  const role = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OWNER, ROLES.RECEPTIONIST, ROLES.TEACHER].find(value => roles.includes(value))
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)) return <SuperAdminDashboard />
  if (role === ROLES.OWNER) return <OwnerDashboard />
  if (role === ROLES.RECEPTIONIST) return <ReceptionistDashboard />
  if (role === ROLES.TEACHER) return <TeacherDashboard />
  return <DefaultDashboard />
}

function TeacherDashboard() {
  const { branch } = useBranch()
  const navigate = useNavigate()
  const { data, loading, error } = useDashboardData()
  const today = academyDate(new Date())
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'long' }).format(new Date()).toLowerCase()

  const todayClasses = [
    ...(data?.assignments ?? []).filter(item => (item.days ?? []).some(day => String(day).toLowerCase().startsWith(weekday.slice(0, 3)))).map(item => ({ ...item, subject: item.subjectName, location: item.room })),
    ...(data?.classes ?? []).filter(item => item.classDate === today),
  ]
  const assignedBatches = new Set((data?.assignments ?? []).map(item => item.batchId)).size
  const weeklyClasses = (data?.assignments ?? []).reduce((sum, item) => sum + (item.days?.length ?? 0), 0)
  const ownSalary = data?.payroll.reduce((sum, item) => sum + Number(item.remainingBalance || 0), 0) ?? 0

  return (
    <DashboardLayout title="Dashboard" description="Instructor overview for the selected branch.">
      <div className="role-dashboard mx-auto grid w-full max-w-[1600px] min-w-0 gap-6 pb-6">
        <DashboardError message={error} />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Instructor Hub</h1>
              <Badge variant="secondary" className="gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
                <GraduationCap size={14} className="text-primary" />
                TEACHER
              </Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={17} aria-hidden="true" />{branch?.name ?? 'No active branch'} Teaching Overview</p>
          </div>
        </header>

        <section aria-labelledby="dashboard-kpis">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="dashboard-kpis" className="text-base font-semibold">Today's Schedule</h2>
            <span className="text-xs text-muted-foreground">Approved mock data</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Today's Classes"
              icon={BookOpen}
              value={todayClasses.length}
              isLoading={loading}
              error={error}
              description="Own saved classes today"
            />
            <KpiCard
              title="Pending Assignments"
              tone="blue"
              icon={FileText}
              value={data?.subjects.length ?? 0}
              isLoading={loading}
              error={error}
              description="Own faculty assignments"
            />
            <KpiCard
              title="Average Attendance"
              tone="violet"
              icon={UserCheck}
              value="—"
              isLoading={loading}
              error={error}
              description={`${weeklyClasses} saved weekly classes; attendance not tracked`}
            />
            <KpiCard
              title="Assigned Batches"
              tone="red"
              icon={Layers3}
              value={assignedBatches}
              isLoading={loading}
              error={error}
              description="Own assigned batches"
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <Card className={PREMIUM_PANEL}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <div className="flex items-center justify-between w-full">
                <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                  <CalendarDays size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  Upcoming Sessions
                </h2>
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/20 bg-primary/5">
                  {todayClasses.length} Today
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              <div className="space-y-3">
                {todayClasses.map((session, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(ROUTE_PATHS.MY_PROFILE, { state: { profileTab: 'classes' } })}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(ROUTE_PATHS.MY_PROFILE, { state: { profileTab: 'classes' } }) } }}
                    className="group cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/20 transition-all"
                  >
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <Clock size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {session.subject ?? session.subjectName}
                        </p>
                        <Badge variant="secondary" className="font-semibold text-[11px] bg-primary/10 text-primary">
                          {formatScheduleLabel(`${session.startTime} - ${session.endTime}`)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.courseName} <span className="text-muted-foreground/50">·</span> {session.batchName}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-primary/70 shrink-0" />
                          <span>{session.location ?? session.room ?? 'Room not set'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Users size={13} className="text-primary/70 shrink-0" />
                          <span>Enrolled batch</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && todayClasses.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No assigned class today.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={PREMIUM_PANEL}>
            <CardHeader className={PREMIUM_PANEL_HEADER}>
              <div className="flex items-center justify-between w-full">
                <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                  <Activity size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  Recent Teaching Activity
                </h2>
                <Badge variant="outline" className="text-xs font-semibold text-muted-foreground">
                  Faculty Roster
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={PREMIUM_PANEL_CONTENT}>
              <div className="space-y-3">
                {(data?.assignments ?? []).slice(0, 4).map((act, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border/50 bg-slate-50/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{act.subjectName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{act.courseName} · {act.batchName}</p>
                    </div>
                    <div className="text-right whitespace-nowrap shrink-0">
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {(act.days ?? []).join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
                {!loading && (data?.assignments.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No faculty assignment has been saved for your account.</p>
                )}
                {!loading && (
                  <div className="rounded-xl border border-primary/15 bg-primary/[0.035] p-3 mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Own students: <strong className="text-foreground font-bold">{data?.students.length ?? 0}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Salary remaining: <strong className="text-primary font-bold">{money(ownSalary)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
