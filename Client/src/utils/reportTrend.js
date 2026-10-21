// Trend dates use the academy timezone; date-only business dates stay unchanged.
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' })
export function reportDay(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parsed.toISOString().slice(0, 10) === value ? value : null
  return dayFormatter.format(parsed)
}

export const TREND_CONFIG = {
  fees: { title: 'Collection Trend', description: 'Verified payments by receipt date', unit: 'PKR', series: [{ key: 'value', label: 'Collected', color: '#940016' }] },
  students: { title: 'Enrollment Trend', description: 'Directory students by saved enrollment date', series: [{ key: 'value', label: 'Students', color: '#940016' }] },
  admissions: { title: 'Intake Trend', description: 'Applications by submission date', series: [{ key: 'value', label: 'Applications', color: '#940016' }] },
  courses: { title: 'Batch Enrollment Trend', description: 'Saved enrollments in matching batches', series: [{ key: 'value', label: 'Enrollments', color: '#940016' }] },
  faculty: { title: 'Scheduled Classes Trend', description: 'Saved dated classes for matching teacher and batch assignments', series: [{ key: 'value', label: 'Classes', color: '#940016' }] },
  finance: { title: 'Cash Flow Trend', description: 'Verified receipts and posted expenses by transaction date', unit: 'PKR', series: [{ key: 'value', label: 'Inflow', color: '#940016' }, { key: 'secondary', label: 'Outflow', color: '#64748b' }] },
  demos: { title: 'Demo Inquiry Trend', description: 'Demo inquiries by registration date', series: [{ key: 'value', label: 'Inquiries', color: '#940016' }] },
  assets: { title: 'Asset Activity Trend', description: 'Saved asset history and maintenance events', series: [{ key: 'value', label: 'Activities', color: '#940016' }] },
}

// These are filtered ledger snapshots, not historical targets or chart-period totals.
export function reportTrendSummary(tab, rows = []) {
  const sum = key => rows.reduce((total, row) => total + (Number.isFinite(row[key]) ? row[key] : 0), 0)
  const count = predicate => rows.filter(predicate).length
  const metric = (label, value, unit = 'count') => ({ label, value, unit })
  const rate = (part, total) => total > 0 ? Math.round(part / total * 1000) / 10 : null
  if (tab === 'fees') return [metric('Collection rate', rate(sum('paid'), sum('totalFee')), 'percent'), metric('Total fees', sum('totalFee'), 'PKR'), metric('Remaining balance', sum('remainingBalance'), 'PKR')]
  if (tab === 'students') return [metric('Matching students', rows.length), metric('Active students', count(r => r.status === 'Active')), metric('Provisional students', count(r => r.status === 'Provisional'))]
  if (tab === 'admissions') return [metric('Applications', rows.length), metric('Approved applications', count(r => r.status === 'Approved')), metric('Pending applications', count(r => r.status === 'Pending'))]
  if (tab === 'courses') {
    const capacity = sum('capacity'), occupied = sum('enrolled')
    return [metric('Current fill rate', rate(occupied, capacity), 'percent'), metric('Saved seat capacity', capacity), metric('Remaining seats', Math.max(0, capacity - occupied))]
  }
  if (tab === 'faculty') return [metric('Assigned instructors', new Set(rows.map(r => r.teacherId).filter(Boolean)).size), metric('Weekly teaching hours', sum('weeklyHours'), 'hours'), metric('Assignments', rows.length)]
  if (tab === 'finance') {
    const inflow = rows.filter(r => r.isInflow).reduce((s, r) => s + (r.amount || 0), 0)
    const outflow = rows.filter(r => !r.isInflow).reduce((s, r) => s + (r.amount || 0), 0)
    return [metric('Recorded inflow', inflow, 'PKR'), metric('Recorded outflow', outflow, 'PKR'), metric('Net cash flow', inflow - outflow, 'PKR')]
  }
  if (tab === 'demos') return [metric('Demo inquiries', rows.length), metric('Converted inquiries', count(r => r.status === 'Converted')), metric('Awaiting trial', count(r => ['Registered', 'Scheduled'].includes(r.status)))]
  return [metric('Asset records', rows.length), metric('Recorded book value', sum('bookValue'), 'PKR'), metric('In maintenance', count(r => r.status === 'Maintenance' || ['Needs Maintenance', 'Out of Service'].includes(r.condition)))]
}

export function reportTrendEvents({ tab, rows, data, branchId, filters = {} }) {
  const events = []
  let undated = 0
  const ids = new Set(rows.map(row => row.id))
  const scoped = records => (records || []).filter(record => record.branchId === branchId)
  const matches = row => ['streamId', 'courseId', 'batchId'].every(key => !filters[key] || filters[key] === 'All' || row[key] === filters[key])
  const eligibleRows = rows.filter(matches)
  const eligibleIds = new Set(eligibleRows.map(row => row.id))
  const add = (date, status, value = 1, secondary = 0) => {
    const day = reportDay(date)
    if (!day) { undated++; return }
    if (filters.windowThreshold != null && Date.parse(`${day}T23:59:59+05:00`) < filters.windowThreshold) return
    if (!Number.isFinite(value) || !Number.isFinite(secondary)) return
    events.push({ day, status: status || 'Recorded', value, secondary, count: 1 })
  }
  if (tab === 'fees') {
    scoped(data.payments).filter(p => eligibleIds.has(p.challanId) && p.status === 'Verified').forEach(p => add(p.paidAt, 'Verified payment', p.amount))
  } else if (tab === 'faculty') {
    scoped(data.classes).filter(c => eligibleRows.some(row => row.teacherId === c.teacherId && row.batchId === c.batchId)).forEach(c => add(c.classDate, 'Scheduled class'))
  } else if (tab === 'courses') {
    scoped(data.enrollments).filter(e => eligibleIds.has(e.batchId)).forEach(e => add(e.enrolledAt, e.status))
  } else if (tab === 'assets') {
    scoped(data.assets).filter(a => eligibleIds.has(a.id)).forEach(a => {
      const logs = a.maintenanceHistory || []
      ;(a.history || []).filter(h => h.type !== 'Maintenance Logged' || !logs.some(log => log.id === h.maintenanceId)).forEach(h => add(h.occurredAt, h.type))
      logs.forEach(log => add(log.date, 'Maintenance'))
    })
  } else {
    eligibleRows.filter(row => ids.has(row.id)).forEach(row => {
      if (tab === 'finance') add(row.date, row.isInflow ? 'Inflow' : 'Outflow', row.isInflow ? row.amount : 0, row.isInflow ? 0 : row.amount)
      else add(row.date, row.status)
    })
  }
  return { events, undated }
}

function bucket(day, grain) {
  if (grain === 'Year') return `${day.slice(0, 4)}-01-01`
  if (grain === 'Month') return `${day.slice(0, 7)}-01`
  if (grain === 'Week') {
    const date = new Date(`${day}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7)
    return date.toISOString().slice(0, 10)
  }
  return day
}

export function aggregateReportTrend(events, mode, start = '', end = '') {
  const custom = mode === 'Date Range'
  if (custom && (!reportDay(start) || !reportDay(end) || start > end)) return { points: [], error: 'Choose a valid start and end date. End date must be on or after start date.' }
  const selected = events.filter(e => !custom || (e.day >= start && e.day <= end))
  const days = selected.map(e => e.day).sort()
  const from = custom ? start : days[0]
  const to = custom ? end : days.at(-1)
  if (!from || !to) return { points: [], grain: mode, total: 0, secondary: 0, count: 0 }
  const span = (Date.parse(to) - Date.parse(from)) / 86400000
  // Keep the chart bounded without silently changing a requested grouping.
  const grain = custom ? (span > 3650 ? 'Year' : span > 120 ? 'Month' : span > 45 ? 'Week' : 'Day') : mode
  const groups = new Map()
  selected.forEach(e => {
    const key = bucket(e.day, grain)
    const point = groups.get(key) || { day: key, value: 0, secondary: 0, count: 0, statuses: {} }
    point.value += e.value; point.secondary += e.secondary; point.count += e.count
    point.statuses[e.status] = (point.statuses[e.status] || 0) + e.count
    groups.set(key, point)
  })
  // Missing intervals are true zero recorded activity, never simulated observations.
  const points = []
  const cursor = new Date(`${bucket(from, grain)}T00:00:00Z`)
  const last = bucket(to, grain)
  while (cursor.toISOString().slice(0, 10) <= last && points.length <= 1500) {
    const day = cursor.toISOString().slice(0, 10)
    points.push(groups.get(day) || { day, value: 0, secondary: 0, count: 0, statuses: {} })
    if (grain === 'Year') cursor.setUTCFullYear(cursor.getUTCFullYear() + 1)
    else if (grain === 'Month') cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    else cursor.setUTCDate(cursor.getUTCDate() + (grain === 'Week' ? 7 : 1))
  }
  if (points.length > 1500) return { points: [], error: 'This period has too many intervals. Choose Week, Month, Year or a shorter Date Range.' }
  return { points: selected.length ? points : [], from, to, grain, total: selected.reduce((s, e) => s + e.value, 0), secondary: selected.reduce((s, e) => s + e.secondary, 0), count: selected.length }
}
