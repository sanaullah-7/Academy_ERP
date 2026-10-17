import { Users, Tv, ShieldCheck, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card.jsx'

export default function DemoStats({ demos = [] }) {
  const total = demos.length
  const scheduled = demos.filter(d => d.status === 'Scheduled' || d.status === 'Registered').length
  const attended = demos.filter(d => d.attendance?.status === 'Present' || d.status === 'Attended').length
  const converted = demos.filter(d => d.status === 'Converted').length

  const scheduledOrAttended = demos.filter(d=>d.status==='Attended'||d.status==='Missed'||d.attendance?.status==='Present'||d.attendance?.status==='Absent').length
  const turnoutRate = scheduledOrAttended > 0
    ? ((attended / scheduledOrAttended) * 100).toFixed(1)
    : '0.0'

  const attendedOrConverted = total
  const conversionRate = attendedOrConverted > 0
    ? ((converted / attendedOrConverted) * 100).toFixed(1)
    : '0.0'

  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())

  // Dynamic recent week registrations
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentThisWeek = demos.filter(d => {
    if (d.createdAt) return new Date(d.createdAt) >= sevenDaysAgo && new Date(d.createdAt) <= now
    return false
  }).length

  // Dynamic hall locations from current branch sessions
  const activeHalls = Array.from(new Set(
    demos
      .filter(d => (d.status === 'Scheduled' || d.status === 'Registered') && (d.scheduledSession?.location || d.batchName))
      .map(d => d.scheduledSession?.location?.split('(')[0]?.trim() || d.batchName)
      .filter(Boolean)
  )).slice(0, 2)
  const hallDisplay = activeHalls.length > 0 ? activeHalls.join(' & ') : 'No assigned rooms'

  return (
    <section aria-label="Demo class summary metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: TOTAL REGISTERED */}
      <Card className="top-kpi-card kpi-maroon rounded-xl border shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              TOTAL REGISTERED
              <span className="sr-only"> Total Inquiries</span>
            </span>
            <div className="size-9 rounded-xl bg-[#F9EBEE] border border-[#f0d5d9] flex items-center justify-center text-[#940016]">
              <Users className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{total}</span>
            <span className="text-xs text-slate-500 font-normal">Candidates</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">All registered ? {currentMonth}</span>
            <span className="bg-[#F9EBEE] text-[#940016] font-medium text-[11px] px-2 py-0.5 rounded-full">
              +{recentThisWeek} this week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: ATTENDED TRIAL */}
      <Card className="top-kpi-card kpi-emerald rounded-xl border shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ATTENDED TRIAL
              <span className="sr-only"> Attended / Completed</span>
            </span>
            <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <Tv className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{attended}</span>
            <span className="text-xs text-slate-500 font-normal">Attended</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Turnout Rate
            </span>
            <span className="font-bold text-slate-800">{turnoutRate}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: CONVERTED TO ADMISSION */}
      <Card className="top-kpi-card kpi-sky rounded-xl border shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              CONVERTED TO ADMISSION
            </span>
            <div className="size-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <ShieldCheck className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{converted}</span>
            <span className="text-xs text-slate-500 font-normal">Admissions</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Registered conversion rate

            </span>
            <span className="font-bold text-slate-800">{conversionRate}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: PENDING TRIAL SLOTS */}
      <Card className="top-kpi-card kpi-amber rounded-xl border shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              PENDING TRIAL SLOTS
              <span className="sr-only"> Scheduled Sessions</span>
            </span>
            <div className="size-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{scheduled}</span>
            <span className="text-xs text-slate-500 font-normal">Pending</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Awaiting scheduling / trial</span>
            <span className="font-medium text-slate-700">{hallDisplay}</span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
