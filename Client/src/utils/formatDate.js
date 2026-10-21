/**
 * Purpose: Will define format Date for the utils area of the Academy frontend.
 * Module: utils
 * Status: Implemented — local date-only formatting for date inputs and financial day boundaries.
 */

export function getLocalDateOnly(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const academyDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function getAcademyDateOnly(date = new Date()) {
  return academyDayFormatter.format(date)
}

export function isOnAcademyDay(value, now = new Date()) {
  if (!value) return false
  const date = new Date(value)
  const reference = new Date(now)
  if (Number.isNaN(date.getTime()) || Number.isNaN(reference.getTime())) return false
  return academyDayFormatter.format(date) === academyDayFormatter.format(reference)
}
