import { Check } from 'lucide-react'

export default function DemoStatusBadge({ status, className = '' }) {
  if (status === 'Registered') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 whitespace-nowrap ${className}`}>
        <span className="size-1.5 rounded-full bg-blue-600 shrink-0"></span>
        <span>Registered</span>
      </span>
    )
  }

  if (status === 'Attended') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap ${className}`}>
        <span className="size-1.5 rounded-full bg-emerald-600 shrink-0"></span>
        <span>Attended</span>
      </span>
    )
  }

  if (status === 'Converted') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300/60 whitespace-nowrap ${className}`}>
        <Check className="size-3 text-emerald-700 shrink-0" />
        <span>Converted</span>
      </span>
    )
  }

  if (status === 'Missed') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap ${className}`}>
        <span className="size-1.5 rounded-full bg-slate-400 shrink-0"></span>
        <span>No Show</span>
      </span>
    )
  }

  if (status === 'Scheduled') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap ${className}`}>
        <span className="size-1.5 rounded-full bg-amber-500 shrink-0"></span>
        <span>Scheduled</span>
      </span>
    )
  }

  if (status === 'Cancelled') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap ${className}`}>
        <span className="size-1.5 rounded-full bg-rose-500 shrink-0"></span>
        <span>Cancelled</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 whitespace-nowrap ${className}`}>
      <span>{status || 'Unknown'}</span>
    </span>
  )
}
