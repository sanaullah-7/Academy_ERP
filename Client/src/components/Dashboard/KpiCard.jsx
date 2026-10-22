import { Card, CardContent } from '../ui/card.jsx'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from '../ui/badge.jsx'

export function KpiCard({ title, icon: Icon, value, description, note = description, periodLabel, isLoading, error, tone = 'maroon', unavailable = false }) {
  const palette = {
    maroon: { icon: 'bg-primary/10 text-primary', card: 'border-primary/15 bg-[#F9EBEE]/40', bar: 'bg-primary' },
    blue: { icon: 'bg-blue-100 text-blue-700', card: 'border-blue-100 bg-blue-50/35', bar: 'bg-blue-500' },
    violet: { icon: 'bg-violet-100 text-violet-700', card: 'border-violet-100 bg-violet-50/35', bar: 'bg-violet-500' },
    red: { icon: 'bg-rose-100 text-rose-700', card: 'border-rose-100 bg-rose-50/35', bar: 'bg-rose-500' },
  }[tone]

  return <Card className={`dashboard-premium-kpi relative h-full min-h-36 overflow-hidden py-0 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${palette.card}`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${palette.bar}`} aria-hidden="true" />
      <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</p>{periodLabel && <Badge variant="outline" className="mt-2 h-5 rounded-full px-2 text-[10px] normal-case tracking-normal">{periodLabel}</Badge>}</div>
          {Icon && <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${palette.icon}`}><Icon size={18} aria-hidden="true" /></span>}
        </div>
        <div>
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            : error ? <div className="flex items-center gap-2 text-destructive"><AlertCircle size={16} aria-hidden="true" /><span className="text-sm font-medium">Error loading data</span></div>
              : <p className={`break-words text-2xl font-bold tracking-tight ${unavailable ? 'text-muted-foreground' : tone === 'red' ? 'text-red-700' : 'text-foreground'}`}>{value !== undefined ? value : '—'}</p>}
          {note && <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>}
        </div>
      </CardContent>
  </Card>
}
