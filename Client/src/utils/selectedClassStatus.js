import { classTimeStatus } from '../services/classScheduleService.js'

export function selectedClassStatus(selected, dailyClasses, now = new Date()) {
  if (!selected) return { label: 'No class selected', type: 'empty' }
  const occurrence = dailyClasses.find(item => selected.isSession
    ? item.source === 'single-date' && item.id === selected.classId
    : item.assignmentId === selected.assignmentId)
  if (!occurrence) return { label: 'Not scheduled today', type: 'empty' }
  const status = classTimeStatus(occurrence, now)
  return status.type === 'upcoming' ? { ...status, label: `Upcoming - ${status.label}` } : status
}
