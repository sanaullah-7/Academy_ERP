export const PERIODS = Object.freeze([
  { id: 'all', label: 'All' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'custom', label: 'Custom' },
])

export function isInPeriod(value, period, range, now = new Date()) {
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

export function localDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
