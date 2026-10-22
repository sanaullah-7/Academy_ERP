import { useId, useMemo, useState } from 'react'
import { CalendarDays, TrendingUp, Target, Layers } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { aggregateReportTrend, reportTrendSummary, TREND_CONFIG } from '../../utils/reportTrend.js'

const MODES = ['Day', 'Week', 'Month', 'Year', 'Date Range']
const compact = new Intl.NumberFormat('en-PK', { notation: 'compact', maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 })
const dateLabel = (day, grain) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...(grain === 'Year' ? { year: 'numeric' } : grain === 'Month' ? { month: 'short', year: '2-digit' } : { day: 'numeric', month: 'short' }) }).format(new Date(`${day}T00:00:00Z`))

function TrendTooltip({ active, payload, config, grain }) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return <div className="max-w-64 rounded-xl border border-slate-200 bg-white p-3 text-[11px] shadow-lg">
    <p className="mb-2 font-bold text-slate-800">{grain === 'Week' ? 'Week of ' : ''}{dateLabel(point.day, grain)}{grain === 'Day' || grain === 'Week' ? ` ${point.day.slice(0, 4)}` : ''}</p>
    {config.series.map(s => <p key={s.key} className="flex justify-between gap-5 py-0.5"><span>{s.label}</span><strong>{config.unit === 'PKR' ? 'Rs ' : ''}{number.format(point[s.key])}</strong></p>)}
    <p className="mt-1 border-t border-slate-100 pt-1 text-slate-500">{point.count} recorded events</p>
    {Object.entries(point.statuses).map(([status, count]) => <p key={status} className="text-slate-500">{status}: {count}</p>)}
  </div>
}

export default function ReportTrendCard({ tab, source, rows, sessionUnconfigured = false, loading = false }) {
  const [mode, setMode] = useState('Month')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const id = useId().replace(/:/g, '')
  const config = TREND_CONFIG[tab]
  const trend = useMemo(() => aggregateReportTrend(source.events, mode, start, end), [source.events, mode, start, end])
  const formatValue = value => `${config.unit === 'PKR' ? 'Rs ' : ''}${number.format(value || 0)}`
  const period = trend.from ? `${trend.from} — ${trend.to}` : 'No dated activity'
  const singlePeriod = trend.points.length === 1
  const Chart = singlePeriod ? BarChart : AreaChart
  const summary = reportTrendSummary(tab, rows)
  const summaryIcons = [TrendingUp, Target, Layers]

  return <section aria-label={tab === 'payroll' ? 'Payroll financial breakdown' : 'Report trend analytics'} aria-busy={loading} className="flex min-w-0 flex-col rounded-xl border border-slate-200/90 bg-white px-3 py-1 shadow-2xs lg:col-span-7">
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-1">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-[13px] leading-tight font-bold text-slate-900"><span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#f0d5d9] bg-[#F9EBEE] text-[#940016]"><TrendingUp size={15} /></span>{config.title}</h3>
        <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{config.description}</p>
      </div>
      <div role="group" aria-label="Trend grouping" className="flex max-w-full flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {MODES.map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#940016] ${mode === value ? 'bg-[#940016] text-white shadow-sm' : 'text-slate-600 hover:bg-[#F9EBEE] hover:text-[#940016]'}`}>{value}</button>)}
      </div>
    </div>
    {mode === 'Date Range' && <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <label className="min-w-0 text-[11px] font-medium text-slate-600">Start date<input type="date" value={start} max={end || undefined} onChange={e => setStart(e.target.value)} className="mt-1 block h-8 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs focus:outline-[#940016]" /></label>
      <label className="min-w-0 text-[11px] font-medium text-slate-600">End date<input type="date" value={end} min={start || undefined} onChange={e => setEnd(e.target.value)} className="mt-1 block h-8 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs focus:outline-[#940016]" /></label>
    </div>}
    <div className="mt-0.5 flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-wrap gap-x-5 gap-y-1" aria-live="polite">{config.series.map(s => <div key={s.key} className="flex flex-wrap items-baseline gap-1.5"><p className="text-[10px] leading-tight font-medium text-slate-500">{s.label}{config.unit ? ` (${config.unit})` : ''}</p><p className="text-base leading-tight font-extrabold tracking-tight text-slate-900">{trend.error ? '—' : formatValue(trend[s.key === 'value' ? 'total' : 'secondary'])}</p></div>)}</div>
      <p className="flex items-center gap-1 text-[10px] text-slate-500"><CalendarDays size={12} />{period}</p>
    </div>
    <div className="mt-0.5 h-[228px] sm:h-[196px] min-w-0 shrink-0 overflow-hidden" role="img" aria-label={`${config.title}: ${trend.count || 0} events, ${trend.grain || mode} grouping`}>
      {loading ? <div className="flex h-full items-center justify-center text-xs text-slate-500">Loading saved branch activity…</div> : trend.error ? <p role="status" className="flex h-full items-center justify-center rounded-lg bg-slate-50 px-6 text-center text-xs text-slate-500">{trend.error}</p> : !trend.points.length ? <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 text-center"><TrendingUp size={24} className="text-slate-300" /><p className="text-xs font-semibold text-slate-600">No dated activity for this selection</p><p className="text-[11px] text-slate-500">Try another period or report filter. Only saved dated events are plotted.</p></div> : <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <Chart data={trend.points} margin={{ top: 2, right: 10, bottom: 0, left: 0 }} accessibilityLayer>
          <defs>{config.series.map(s => <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.color} stopOpacity={0.18} /><stop offset="100%" stopColor={s.color} stopOpacity={0.01} /></linearGradient>)}</defs>
          <CartesianGrid vertical={false} stroke="#eef0f3" strokeDasharray="3 4" />
          <XAxis dataKey="day" height={18} tickFormatter={day => dateLabel(day, trend.grain)} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={35} tickMargin={3} />
          <YAxis width={48} tickFormatter={value => compact.format(value)} allowDecimals={!!config.unit} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
          <Tooltip content={<TrendTooltip config={config} grain={trend.grain} />} cursor={{ stroke: '#d9a4af', strokeDasharray: '3 3' }} />
          {config.series.map((s, index) => singlePeriod
            ? <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} maxBarSize={48} radius={[6, 6, 0, 0]} isAnimationActive={false} />
            : <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} strokeDasharray={index ? '5 4' : undefined} fill={`url(#${id}-${s.key})`} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />)}
        </Chart>
      </ResponsiveContainer>}
    </div>
    {sessionUnconfigured && <p className="mt-1 text-[10px] text-amber-700">Current Session dates are not configured; no session date restriction is applied.</p>}
    <div className="mt-auto pt-0.5">
      <p className="mb-1 text-[10px] font-medium text-slate-500">Filtered ledger summary{mode === 'Date Range' ? ' · Chart date range applies above only' : ''}</p>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {summary.map((item, index) => {
          const Icon = summaryIcons[index]
          const value = item.value == null ? 'Not available' : item.unit === 'PKR' ? `Rs ${number.format(item.value)}` : item.unit === 'percent' ? `${item.value}%` : item.unit === 'hours' ? `${item.value.toLocaleString('en-PK', { maximumFractionDigits: 1 })} hrs` : number.format(item.value)
          return <div key={item.label} className={`flex min-w-0 items-center gap-2 rounded-xl border p-1 ${index === 0 ? 'border-[#efd0d6] bg-[#F9EBEE]' : index === 1 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${index === 1 ? 'bg-amber-100/80 text-amber-600' : 'bg-[#F9EBEE] text-[#940016]'}`}><Icon size={14} aria-hidden="true" /></span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5"><dt title={item.label} className="min-w-0 truncate text-[10px] leading-tight text-slate-500">{item.label}</dt><dd title={value} className="max-w-[55%] shrink-0 truncate text-sm font-extrabold leading-tight text-slate-900">{loading ? '—' : value}</dd></div>
          </div>
        })}
      </dl>
    </div>
  </section>
}
