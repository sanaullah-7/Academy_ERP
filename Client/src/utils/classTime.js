export { formatTime as formatClassTime } from './timeFormat.js'
import { formatTime as formatClassTime } from './timeFormat.js'
export function classShift(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) return 'Shift not configured'
  return Number(value.slice(0, 2)) < 12 ? 'Morning' : 'Evening'
}
export function classTimeLabel(start, end) {
  return `${formatClassTime(start)} - ${formatClassTime(end)} (${classShift(start)})`
}

// Display periods use saved local start time, independently of batch names.
export function classPeriod(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) return 'Time not configured'
  const hour = Number(value.slice(0, 2))
  return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
}
