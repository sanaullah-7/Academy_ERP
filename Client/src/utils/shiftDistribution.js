import { formatClassTime } from './classTime.js'
import { resolveDailyClasses, zonedClock } from '../services/classScheduleService.js'

// These cards describe today's saved sessions; capacity means enrolled batch seats,
// not room utilization (no authoritative room-capacity policy exists).
export function shiftDistribution({ assignments = [], sessions = [], academic = {}, branchId, now = new Date() }) {
  const today = zonedClock(now)
  const weekend = ['saturday', 'sunday'].includes(today.weekday)
  const classes = resolveDailyClasses({ assignments, sessions, academic, branchId, now })
  return ['Morning Shift', 'Evening Shift', 'Crash & Weekend'].map((label, index) => {
    const slots = classes.filter(slot => index === 2 ? weekend : (Number(slot.startTime.slice(0, 2)) < 12 ? 0 : 1) === index)
    const batchIds = new Set(slots.map(slot => slot.batchId))
    const batches = (academic.batches ?? []).filter(batch => batchIds.has(batch.id))
    const configured = batches.length === batchIds.size && batches.every(batch => Number.isFinite(batch.capacity) && batch.capacity > 0)
    const capacity = batches.reduce((sum, batch) => sum + (batch.capacity ?? 0), 0)
    const enrolled = batches.reduce((sum, batch) => sum + (batch.enrolledCount ?? 0), 0)
    const percentage = !slots.length ? 0 : configured && capacity > 0 ? Math.round(enrolled / capacity * 100) : null
    const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))
    const duration = slots.reduce((sum, slot) => sum + Math.max(0, minutes(slot.endTime) - minutes(slot.startTime)), 0)
    const elapsed = slots.reduce((sum, slot) => sum + Math.max(0, Math.min(today.minutes, minutes(slot.endTime)) - minutes(slot.startTime)), 0)
    const progress = duration ? Math.round(elapsed / duration * 100) : 0
    const starts = slots.map(slot => slot.startTime).sort()
    const ends = slots.map(slot => slot.endTime).sort()
    return { label, progress, lectures: slots.length, batches: batchIds.size, percentage, enrolled, capacity, time: slots.length ? `${formatClassTime(starts[0])} – ${formatClassTime(ends.at(-1))}` : 'No sessions today' }
  })
}
