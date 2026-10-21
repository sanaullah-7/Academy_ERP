const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

// Date-only arithmetic stays independent of the browser/CI timezone.
export function demoRegistrationClasses({ assignments = [], sessions = [], batches = [], branchId, courseId, batchId, fromDate }) {
  if (!branchId || !courseId || !batchId || !/^\d{4}-\d{2}-\d{2}$/.test(fromDate || '')) return []
  const batch = batches.find(item => item.id === batchId && item.courseId === courseId && item.branchId === branchId && item.active !== false)
  const anchor = new Date(`${fromDate}T12:00:00Z`)
  if (!batch || Number.isNaN(anchor.getTime()) || anchor.toISOString().slice(0, 10) !== fromDate) return []
  const options = new Map()
  const add = (item, source, nextDate, days) => {
    if (item.branchId !== branchId || item.batchId !== batchId || (item.courseId && item.courseId !== courseId)) return
    if (!timePattern.test(item.startTime) || !timePattern.test(item.endTime) || item.startTime >= item.endTime) return
    if (['cancelled', 'canceled'].includes(String(item.status || '').toLowerCase())) return
    const subject = item.subjectName || item.subject || 'Subject not configured'
    const key = [nextDate, subject.toLowerCase(), item.teacherId, item.startTime, item.endTime].join('|')
    options.set(key, { key: `${source}:${item.id}`, subject, teacherName: item.teacherName || 'Teacher not assigned', room: item.room || item.location || 'Room not assigned', startTime: item.startTime, endTime: item.endTime, nextDate, days, source })
  }
  assignments.forEach(item => {
    const days = weekdays.filter(day => item.days?.some(value => String(value).trim().toLowerCase().slice(0, 3) === day.toLowerCase().slice(0, 3)))
    if (!days.length) return
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(anchor)
      date.setUTCDate(date.getUTCDate() + offset)
      if (days.includes(weekdays[date.getUTCDay()])) {
        add(item, 'recurring', date.toISOString().slice(0, 10), days.map(day => day.slice(0, 3)).join(', '))
        break
      }
    }
  })
  // An explicit dated occurrence takes precedence over its recurring duplicate.
  sessions.filter(item => item.classDate >= fromDate).forEach(item => add(item, 'dated', item.classDate, 'Single-date class'))
  return [...options.values()].sort((a, b) => `${a.nextDate} ${a.startTime} ${a.subject}`.localeCompare(`${b.nextDate} ${b.startTime} ${b.subject}`))
}
