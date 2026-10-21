import { getAcademyDateOnly } from './formatDate.js'

export const REPORTING_PERIODS = ['All', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom']

export function reportingDay(value) {
  if (!value) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return date.toISOString().slice(0, 10) === value ? value : null
  }
  return getAcademyDateOnly(date)
}

export function matchesReportingPeriod(value, period, range = {}, today = reportingDay(new Date())) {
  if (period === 'All') return true
  const day = reportingDay(value)
  if (!day || !today) return false
  if (period === 'Daily') return day === today
  if (period === 'Monthly') return day.slice(0, 7) === today.slice(0, 7)
  if (period === 'Yearly') return day.slice(0, 4) === today.slice(0, 4)
  if (period === 'Weekly') {
    const start = new Date(`${today}T00:00:00Z`)
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 6)
    return day >= start.toISOString().slice(0, 10) && day <= end.toISOString().slice(0, 10)
  }
  if (period === 'Custom') return Boolean(range.start && range.end && range.start <= range.end && day >= range.start && day <= range.end)
  return false
}
