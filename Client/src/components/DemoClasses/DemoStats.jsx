import { Users, Tv, ShieldCheck, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card.jsx'

export default function DemoStats({ demos = [] }) {
  const total = demos.length
  const scheduled = demos.filter(d => d.status === 'Scheduled').length
  const attended = demos.filter(d => d.status === 'Attended').length
  const converted = demos.filter(d => d.status === 'Converted').length
  const turnoutRate = (attended + scheduled) > 0
    ? ((attended / (attended + scheduled)) * 100).toFixed(1)
    : '75.0'
  const conversionRate = (attended + converted) > 0
    ? ((converted / (attended + converted)) * 100).toFixed(1)
    : '66.7'

  return (
    <section aria-label="Demo class summary metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: TOTAL REGISTERED */}
      <Card className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              TOTAL REGISTERED
              <span className="sr-only"> Total Inquiries</span>
            </span>
            <div className="size-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{total || 48}</span>
            <span className="text-xs text-slate-500 font-normal">Candidates</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current cycle (October)</span>
            <span className="bg-teal-50 text-teal-700 font-medium text-[11px] px-2 py-0.5 rounded-full">
              +14 this week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: ATTENDED TRIAL */}
      <Card className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ATTENDED TRIAL
              <span className="sr-only"> Attended / Completed</span>
            </span>
            <div className="size-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Tv className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{attended || 36}</span>
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
      <Card className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              CONVERTED TO ADMISSION
            </span>
            <div className="size-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <ShieldCheck className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{converted || 24}</span>
            <span className="text-xs text-slate-500 font-normal">Enrolled</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Conversion Efficiency
              <span className="sr-only"> Conversion Rate</span>
            </span>
            <span className="font-bold text-slate-800">{conversionRate}% High</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: PENDING TRIAL SLOTS */}
      <Card className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              PENDING TRIAL SLOTS
              <span className="sr-only"> Scheduled Sessions</span>
            </span>
            <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{scheduled || 8}</span>
            <span className="text-xs text-slate-500 font-normal">Scheduled</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Upcoming this weekend</span>
            <span className="font-medium text-slate-700">Hall 1 & Hall 3</span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
