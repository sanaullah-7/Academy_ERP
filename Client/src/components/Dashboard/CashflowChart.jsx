import { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Badge } from '../ui/badge.jsx'
import { formatTime } from '../../utils/timeFormat.js'
import { isInPeriod, localDateKey } from '../../utils/dashboardCashflow.js'

const money = value => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)

export function CashflowChart({ period, periodLabel, range, payments, expenses, revenueLabel = 'Revenue' }) {
  const records = useMemo(() => {
    const now = new Date()
    const create = (key, label) => ({ key, label, revenue: 0, expenses: 0 })
    let buckets
    if (period === 'daily') buckets = Array.from({ length: 6 }, (_, index) => create(index, formatTime(`${String(index * 4).padStart(2, '0')}:00`)))
    else if (period === 'weekly') {
      const monday = new Date(now)
      monday.setHours(0, 0, 0, 0)
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
      buckets = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday)
        date.setDate(date.getDate() + index)
        return create(localDateKey(date), new Intl.DateTimeFormat('en-PK', { weekday: 'short' }).format(date))
      })
    }
    else if (period === 'monthly') buckets = Array.from({ length: 5 }, (_, index) => create(index, `Week ${index + 1}`))
    else if (period === 'custom' && range.start && range.end) {
      const start = new Date(`${range.start}T00:00:00`)
      const end = new Date(`${range.end}T00:00:00`)
      const days = Math.min(31, Math.floor((end - start) / 86400000) + 1)
      buckets = Array.from({ length: Math.max(0, days) }, (_, index) => {
        const date = new Date(start)
        date.setDate(date.getDate() + index)
        return create(localDateKey(date), new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'short' }).format(date))
      })
    }
    else {
      const first = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      buckets = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(first.getFullYear(), first.getMonth() + index, 1)
        return create(`${date.getFullYear()}-${date.getMonth()}`, new Intl.DateTimeFormat('en-PK', { month: 'short' }).format(date))
      })
    }
    const bucketFor = value => {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return null
      if (period === 'daily') return buckets[Math.floor(date.getHours() / 4)]
      if (period === 'weekly' || period === 'custom') return buckets.find(item => item.key === localDateKey(date))
      if (period === 'monthly') return buckets[Math.min(4, Math.floor((date.getDate() - 1) / 7))]
      return buckets.find(item => item.key === `${date.getFullYear()}-${date.getMonth()}`)
    }
    payments.filter(item => isInPeriod(item.paidAt, period, range, now)).forEach(item => {
      const bucket = bucketFor(item.paidAt)
      if (bucket) bucket.revenue += item.amount
    })
    expenses.filter(item => isInPeriod(item.entryDate, period, range, now)).forEach(item => {
      const bucket = bucketFor(item.entryDate)
      if (bucket) bucket.expenses += item.amount
    })
    return buckets
  }, [expenses, payments, period, range])

  const inflow = records.reduce((sum, item) => sum + item.revenue, 0)
  const burn = records.reduce((sum, item) => sum + item.expenses, 0)
  const hasData = inflow > 0 || burn > 0

  return (
    <div className="space-y-3">
      <div className="mobile-chart-summary grid gap-2 rounded-xl bg-muted/40 p-2.5 sm:grid-cols-3">
        {[['Inflow', inflow], ['Burn', burn], ['Net Margin', inflow - burn]].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{periodLabel} {label}</p>
            <p className={`mt-1 font-bold ${value < 0 ? 'text-red-700' : 'text-foreground'}`}>{money(value)}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-primary" />{revenueLabel}</span>
          <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-blue-200" />Expenses</span>
        </div>
        <Badge variant="outline">{periodLabel}</Badge>
      </div>
      <div className="relative h-52 w-full sm:h-60" aria-label={`Revenue and expenses chart for ${periodLabel}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={value => money(value)} />
            <Bar dataKey="revenue" name="Revenue" fill="var(--dashboard-revenue)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#bfdbfe" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {!hasData && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-sm rounded-xl border bg-card/95 px-5 py-4 text-center shadow-sm">
              <p className="font-semibold">No financial records for {periodLabel.toLowerCase()}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Verified receipts and posted expenses will appear automatically.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CashflowChart
