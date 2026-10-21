// Presentation only: saved clock values stay HH:mm and timestamps stay ISO.
export const ACADEMY_TIME_ZONE = 'Asia/Karachi'

export function toTime24(value, period) {
  const match = /^(0?[1-9]|1[0-2]):([0-5]\d)(?:\s*(AM|PM))?$/i.exec(String(value ?? '').trim())
  const meridiem = match?.[3]?.toUpperCase() ?? period
  if (!match || !['AM', 'PM'].includes(meridiem)) return ''
  return `${String(Number(match[1]) % 12 + (meridiem === 'PM' ? 12 : 0)).padStart(2, '0')}:${match[2]}`
}

export function formatTime(value, fallback = 'Not configured') {
  const text = String(value ?? '').trim()
  const twelve = /^(0?[1-9]|1[0-2]):([0-5]\d)\s+(AM|PM)$/i.exec(text)
  const clock = twelve ? toTime24(`${twelve[1]}:${twelve[2]}`, twelve[3].toUpperCase()) : text
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(clock)
  if (!match) return fallback
  const hour = Number(match[1])
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? 'AM' : 'PM'}`
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`
}

// Only parse a whole known clock/range label, never substitute inside arbitrary text.
export function formatScheduleLabel(value, fallback = 'Not configured') {
  if (!value) return fallback
  const text = String(value).trim()
  const range = text.split(/\s*[-\u2013\u2014]\s*/)
  if (range.length === 2 && range.every(part => formatTime(part, '') !== '')) return formatTimeRange(...range)
  return formatTime(text, text)
}

export function formatTimestamp(value, { timeZone = ACADEMY_TIME_ZONE, dateOptions = { day: 'numeric', month: 'short', year: 'numeric' }, fallback = 'Date unavailable' } = {}) {
  if (!value) return fallback
  const localTimestamp = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
  const date = new Date(localTimestamp ? `${value}+05:00` : value)
  if (!Number.isFinite(date.getTime())) return fallback
  // Calendar-only fields must not acquire a clock or shift a day.
  const dateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (dateOnly && date.toISOString().slice(0, 10) !== value) return fallback
  const label = new Intl.DateTimeFormat('en-PK', { ...dateOptions, timeZone: dateOnly ? 'UTC' : timeZone }).format(date)
  if (dateOnly) return label
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  return `${label}, ${Number(parts.hour)}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`
}
