import { useEffect, useState, useMemo } from 'react'
import { Activity, ChartNoAxesCombined, Layers3, Sparkles, Users, BookOpen, UserCheck, CreditCard, ShieldAlert, BarChart3, Settings, FileText, ArrowRight, UserPlus, CreditCard as PaymentIcon, PhoneCall, CalendarDays, ClipboardList, Clock } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { ROLES, ROLE_LABELS } from '../../constants/roles.js'
import { KpiCard } from '../../components/Dashboard/KpiCard.jsx'
import { studentService } from '../../services/studentService.js'
import { courseService } from '../../services/courseService.js'
import SuperAdminDashboard from '../../components/Dashboard/SuperAdminDashboard.jsx'

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
  const defaultData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 70 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 90 },
    { name: 'Fri', value: 65 },
    { name: 'Sat', value: 85 },
    { name: 'Sun', value: 60 }
  ]
  const chartData = data || defaultData
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
    <div className="grid min-w-0 gap-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles size={16} aria-hidden="true" />Dashboard preview</p>
            <p className="text-xl font-semibold tracking-tight">Room for the bigger picture.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">This is a shared layout preview. Metrics, charts and actions will arrive in separately approved tickets.</p>
          </div>
          <div className="min-w-0 rounded-lg border border-primary/20 bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Active demo branch</p>
            <p className="mt-1 break-words text-sm font-semibold">{branch?.name ?? 'No authorized branch selected'}</p>
          </div>
        </CardContent>
      </Card>
      <section aria-labelledby="dashboard-kpis">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="dashboard-kpis" className="text-base font-semibold">Demo Metrics</h2>
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
            title="Demo Admissions"
            icon={UserCheck}
            value={12}
            isLoading={false}
            description="Fictional static demo value"
          />
          <KpiCard
            title="Demo Revenue"
            icon={CreditCard}
            value="PKR 45,000"
            isLoading={false}
            description="Fictional static demo value"
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

  return (
    <DashboardLayout title="Dashboard" description="Owner view for the selected branch.">
      <div className="grid min-w-0 gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Branch Performance</h1>
            <p className="text-sm text-muted-foreground">Branch: {branch?.name ?? 'None'}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs tracking-wide bg-primary/10 text-primary hover:bg-primary/20">
            OWNER
          </Badge>
        </div>

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
              title="Demo Admissions"
              icon={UserCheck}
              value={8}
              isLoading={false}
              description="Fictional static demo value"
            />
            <KpiCard
              title="Demo Revenue"
              icon={CreditCard}
              value="PKR 85,000"
              isLoading={false}
              description="Fictional static demo value"
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <BarChart3 size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Enrollment Trend
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <DemoBarChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <Activity size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Recent Activity
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { title: 'New admission approved', time: '10 mins ago', type: 'success' },
                  { title: 'Fee payment collected', time: '1 hour ago', type: 'info' },
                  { title: 'New course created', time: '2 hours ago', type: 'default' },
                  { title: 'Staff meeting scheduled', time: '5 hours ago', type: 'default' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${act.type === 'success' ? 'bg-green-500' : act.type === 'info' ? 'bg-blue-500' : 'bg-primary/40'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{act.title}</p>
                      <p className="text-[10px] text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="financial-overview">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <CreditCard size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Financial Overview
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">PKR 450,000</p>
                  <p className="text-xs text-green-500 mt-1">+12% from last month</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pending Dues</p>
                  <p className="text-2xl font-bold">PKR 35,000</p>
                  <p className="text-xs text-muted-foreground mt-1">15 students</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Expenses</p>
                  <p className="text-2xl font-bold">PKR 120,000</p>
                  <p className="text-xs text-muted-foreground mt-1">Operational costs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="quick-operations">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="quick-operations" className="text-base font-semibold">Quick Operations</h2>
            <span className="text-xs text-muted-foreground">Unauthorized actions disabled</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'New Admission', icon: UserPlus },
              { title: 'Collect Fee', icon: PaymentIcon },
              { title: 'Generate Report', icon: FileText },
              { title: 'Settings', icon: Settings }
            ].map((action, i) => (
              <Card key={i} className="transition-colors opacity-50 bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted text-muted-foreground">
                      <action.icon size={20} />
                    </div>
                    <span className="font-semibold text-sm text-muted-foreground">{action.title}</span>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/50" />
                </CardContent>
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

  return (
    <DashboardLayout title="Dashboard" description="Front desk overview for the selected branch.">
      <div className="grid min-w-0 gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Front Desk</h1>
            <p className="text-sm text-muted-foreground">Branch: {branch?.name ?? 'None'}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs tracking-wide bg-primary/10 text-primary hover:bg-primary/20">
            RECEPTIONIST
          </Badge>
        </div>

        <section aria-labelledby="dashboard-kpis">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="dashboard-kpis" className="text-base font-semibold">Today's Overview</h2>
            <span className="text-xs text-muted-foreground">Approved mock data</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Today's Admissions"
              icon={UserCheck}
              value={4}
              isLoading={false}
              description="Fictional static demo value"
            />
            <KpiCard
              title="Pending Inquiries"
              icon={ClipboardList}
              value={12}
              isLoading={false}
              description="Fictional static demo value"
            />
            <KpiCard
              title="Demo Follow-ups"
              icon={PhoneCall}
              value={8}
              isLoading={false}
              description="Fictional static demo value"
            />
            <KpiCard
              title="Active Students"
              icon={Users}
              value={metrics.students.value}
              isLoading={metrics.students.isLoading}
              error={metrics.students.error}
              description="Real mock branch data"
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <Clock size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Recent Inquiries
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { name: 'Ali Khan', type: 'Walk-in', time: '10 mins ago', course: 'Web Dev' },
                  { name: 'Sara Ahmed', type: 'Phone call', time: '1 hour ago', course: 'Graphic Design' },
                  { name: 'Usman Raza', type: 'Email', time: '2 hours ago', course: 'Digital Marketing' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/20">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{act.name}</p>
                      <p className="text-xs text-muted-foreground">{act.course}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-[10px] font-normal">{act.type}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <CalendarDays size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Today's Schedule
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { title: 'Demo Class: React JS', time: '02:00 PM', status: 'Upcoming' },
                  { title: 'Meeting: Instructor Ali', time: '04:30 PM', status: 'Upcoming' },
                  { title: 'Parent Counseling', time: '05:00 PM', status: 'Upcoming' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <CalendarDays size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{act.title}</p>
                      <p className="text-xs text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="quick-operations">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="quick-operations" className="text-base font-semibold">Front Desk Actions</h2>
            <span className="text-xs text-muted-foreground">Unauthorized actions disabled</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'New Walk-in', icon: UserPlus },
              { title: 'Log Inquiry', icon: PhoneCall },
              { title: 'Schedule Demo', icon: CalendarDays },
              { title: 'Quick Admission', icon: ClipboardList }
            ].map((action, i) => (
              <Card key={i} className="transition-colors opacity-50 bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted text-muted-foreground">
                      <action.icon size={20} />
                    </div>
                    <span className="font-semibold text-sm text-muted-foreground">{action.title}</span>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/50" />
                </CardContent>
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
  const { branch } = useBranch()

  const isSuperAdmin = roles.includes(ROLES.SUPER_ADMIN)

  const availableRoles = useMemo(() => {
    return isSuperAdmin
      ? [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.RECEPTIONIST, ROLES.TEACHER]
      : roles
  }, [isSuperAdmin, roles])

  const [selectedRole, setSelectedRole] = useState(() => availableRoles.length === 1 ? availableRoles[0] : null)

  useEffect(() => {
    if (availableRoles.length === 1 && selectedRole !== availableRoles[0]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRole(availableRoles[0])
    } else if (selectedRole && !availableRoles.includes(selectedRole)) {
      setSelectedRole(null)
    }
  }, [availableRoles, selectedRole])

  const renderDashboard = () => {
    if (!selectedRole) {
      return (
        <DashboardLayout title="Dashboard" description="Role Selection Required">
          <p className="sr-only">{branch?.name}</p>
          <Card className="border-primary/20 bg-card max-w-2xl mx-auto mt-12">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-primary">
                <ShieldAlert size={24} />
                <h2 className="text-lg font-semibold">Select Dashboard View</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                You have multiple dashboard views available in this branch.
                Please select which presentation you want to view. This only changes the dashboard layout and does not alter your actual permissions.
              </p>
              <div className="flex flex-col gap-3">
                {availableRoles.map(role => (
                  <Button key={role} variant="outline" className="justify-start h-auto py-3" onClick={() => setSelectedRole(role)}>
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-semibold">{ROLE_LABELS[role] ?? role} Dashboard</span>
                      <span className="text-xs text-muted-foreground font-normal">View the dashboard presentation for {ROLE_LABELS[role]?.toLowerCase() ?? role}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </DashboardLayout>
      )
    }

    let DashboardComponent
    if (selectedRole === ROLES.SUPER_ADMIN) DashboardComponent = SuperAdminDashboard
    else if (selectedRole === ROLES.OWNER) DashboardComponent = OwnerDashboard
    else if (selectedRole === ROLES.RECEPTIONIST) DashboardComponent = ReceptionistDashboard
    else if (selectedRole === ROLES.TEACHER) DashboardComponent = TeacherDashboard
    else DashboardComponent = DefaultDashboard

    return (
      <div className="flex flex-col h-full">
        {availableRoles.length > 1 && (
          <div className="relative z-10 min-w-0 px-3 pt-6 -mb-2 sm:px-6">
            <div className="flex min-w-0 flex-col justify-between gap-4 rounded-lg border border-primary/20 bg-card p-3 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="sr-only">{branch?.name}</p>
                <h2 className="text-sm font-semibold">View Dashboard As</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Presentation preview only
                </p>
              </div>
              <div className="flex min-w-0 flex-wrap gap-2">
                {availableRoles.map(role => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                    className="w-full min-w-0 text-xs sm:w-auto"
                  >
                    {ROLE_LABELS[role] ?? role}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        <DashboardComponent />
      </div>
    )
  }

  return renderDashboard()
}

function TeacherDashboard() {
  const { branch } = useBranch()

  return (
    <DashboardLayout title="Dashboard" description="Instructor overview for the selected branch.">
      <div className="grid min-w-0 gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Instructor Hub</h1>
            <p className="text-sm text-muted-foreground">Branch: {branch?.name ?? 'None'}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs tracking-wide bg-primary/10 text-primary hover:bg-primary/20">
            TEACHER
          </Badge>
        </div>

        <section aria-labelledby="dashboard-kpis">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="dashboard-kpis" className="text-base font-semibold">Today's Schedule</h2>
            <span className="text-xs text-muted-foreground">Approved mock data</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Today's Classes"
              icon={BookOpen}
              value={3}
              isLoading={false}
              description="Fictional static demo value"
              isDemo={true}
            />
            <KpiCard
              title="Pending Assignments"
              icon={FileText}
              value={12}
              isLoading={false}
              description="Fictional static demo value"
              isDemo={true}
            />
            <KpiCard
              title="Average Attendance"
              icon={UserCheck}
              value="85%"
              isLoading={false}
              description="Fictional static demo value"
              isDemo={true}
            />
            <KpiCard
              title="Assigned Batches"
              icon={Layers3}
              value={4}
              isLoading={false}
              description="Fictional static demo value"
              isDemo={true}
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <CalendarDays size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Upcoming Sessions
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { title: 'React Fundamentals', time: '10:00 AM - 11:30 AM', batch: 'Batch A - Web Dev', room: 'Lab 1' },
                  { title: 'Advanced CSS', time: '01:00 PM - 02:30 PM', batch: 'Batch B - Design', room: 'Lab 2' },
                  { title: 'JavaScript Logic', time: '03:00 PM - 04:30 PM', batch: 'Batch C - Web Dev', room: 'Virtual' },
                ].map((session, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-transparent hover:border-primary/10 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-md text-primary mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{session.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{session.batch}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                        <Badge variant="secondary" className="font-normal text-[10px]">{session.time}</Badge>
                        <span className="text-muted-foreground">• {session.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-2 border-b">
              <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                <Activity size={18} className="shrink-0 text-primary" aria-hidden="true" />
                Recent Teaching Activity
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">DEMO</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { title: 'Graded React Assignment', time: '2 hours ago', batch: 'Batch A - Web Dev' },
                  { title: 'Marked Attendance', time: 'Yesterday', batch: 'Batch C - Web Dev' },
                  { title: 'Uploaded CSS Resources', time: '2 days ago', batch: 'Batch B - Design' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{act.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{act.batch}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-[10px] text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="quick-operations">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="quick-operations" className="text-base font-semibold">Instructor Actions</h2>
            <span className="text-xs text-muted-foreground">Unauthorized actions disabled</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Mark Attendance', icon: UserCheck },
              { title: 'Grade Assignment', icon: FileText },
              { title: 'Upload Resource', icon: BookOpen },
              { title: 'View Syllabus', icon: Layers3 }
            ].map((action, i) => (
              <Card key={i} className="transition-colors opacity-50 bg-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted text-muted-foreground">
                      <action.icon size={20} />
                    </div>
                    <span className="font-semibold text-sm text-muted-foreground">{action.title}</span>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/50" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
