import { describe, expect, it } from 'vitest'
import { aggregateReportTrend, reportDay, reportTrendEvents, reportTrendSummary, TREND_CONFIG } from './reportTrend.js'

const event = (day, value = 1) => ({ day, value, secondary: 0, count: 1, status: 'Recorded' })
const source = (tab, rows, data = {}, filters = {}) => reportTrendEvents({ tab, rows, data, branchId: 'a', filters })

describe('Filtered ledger summary', () => {
  it.each(Object.keys(TREND_CONFIG))('provides three tab-specific metrics for %s without invented targets', tab => {
    const summary = reportTrendSummary(tab, [])
    expect(summary).toHaveLength(3)
    expect(summary.some(item => item.label.includes('Target'))).toBe(false)
    expect(summary.every(item => item.value === 0 || item.value === null)).toBe(true)
  })
  it('calculates weighted fill rate and remaining seats from matching batches only', () => {
    expect(reportTrendSummary('courses', [{ capacity: 10, enrolled: 10 }, { capacity: 90, enrolled: 40 }]).map(m => m.value)).toEqual([50, 100, 50])
    expect(reportTrendSummary('courses', [{ capacity: 0, enrolled: 0 }])[0].value).toBeNull()
  })
  it('keeps fee balance and cash-flow amounts sourced from supplied filtered rows', () => {
    expect(reportTrendSummary('fees', [{ totalFee: 1000, paid: 300, remainingBalance: 700 }]).map(m => m.value)).toEqual([30, 1000, 700])
    expect(reportTrendSummary('finance', [{ isInflow: true, amount: 200 }, { isInflow: false, amount: 300 }]).map(m => m.value)).toEqual([200, 300, -100])
  })
})

describe('Reports trend source integrity', () => {
  it('uses only verified receipts for matching challans and branch, at the actual payment date', () => {
    const payment = { branchId: 'a', challanId: 'ch1', amount: 900, paidAt: '2026-10-03T22:00:00Z', status: 'Verified' }
    const result = source('fees', [{ id: 'ch1', date: '2026-09-01', paid: 5000, courseId: 'c1' }], { payments: [payment, { ...payment, branchId: 'b' }, { ...payment, challanId: 'other' }, { ...payment, status: 'Pending' }] })
    expect(result.events).toEqual([{ day: '2026-10-04', status: 'Verified payment', value: 900, secondary: 0, count: 1 }])
    expect(source('fees', [{ id: 'ch1', courseId: 'c1' }], { payments: [payment] }, { courseId: 'c2' }).events).toEqual([])
    expect(source('fees', [{ id: 'ch1' }], { payments: [payment] }, { windowThreshold: Date.parse('2026-10-05') }).events).toEqual([])
  })
  it('uses dated classes matched to selected teacher and batch without expanding recurring assignments', () => {
    const row = { id: 'fa', teacherId: 't1', batchId: 'b1' }
    const saved = { branchId: 'a', teacherId: 't1', batchId: 'b1', classDate: '2026-10-10' }
    expect(source('faculty', [row], { classes: [saved, { ...saved, branchId: 'b' }, { ...saved, batchId: 'b2' }] }).events).toHaveLength(1)
    expect(source('faculty', [row]).events).toEqual([])
  })
  it('uses saved batch enrollment events rather than current occupancy as historical activity', () => {
    expect(source('courses', [{ id: 'b1', occupancyRate: 90 }], { enrollments: [{ branchId: 'a', batchId: 'b1', enrolledAt: '2026-10-01', status: 'Active' }, { branchId: 'a', batchId: 'b2', enrolledAt: '2026-10-02' }] }).events).toHaveLength(1)
  })
  it('deduplicates asset maintenance history and excludes other branches/assets', () => {
    const asset = { id: 'a1', branchId: 'a', history: [{ type: 'Inspection', occurredAt: '2026-10-01' }, { type: 'Maintenance Logged', maintenanceId: 'm1', occurredAt: '2026-10-03' }], maintenanceHistory: [{ id: 'm1', date: '2026-10-02' }] }
    const result = source('assets', [{ id: 'a1' }], { assets: [asset, { ...asset, branchId: 'b' }, { ...asset, id: 'a2' }] })
    expect(result.events.map(e => e.day)).toEqual(['2026-10-01', '2026-10-02'])
  })
  it('preserves finance inflow/outflow amounts and active filtered rows', () => {
    const result = source('finance', [{ id: 'p1', isInflow: true, amount: 100, date: '2026-10-01' }, { id: 'e1', isInflow: false, amount: 30, date: '2026-10-01' }])
    expect(aggregateReportTrend(result.events, 'Day')).toMatchObject({ total: 100, secondary: 30, count: 2 })
  })
  it.each(['students', 'admissions', 'demos'])('uses only filtered dated %s records and reports missing dates', tab => {
    const result = source(tab, [{ id: '1', date: '2026-10-01', status: 'Active', streamId: 's1', courseId: 'c1', batchId: 'b1' }, { id: '2', date: '' }, { id: '3', date: '2026-10-03', courseId: 'c2' }], {}, { courseId: 'c1', streamId: 's1', batchId: 'b1' })
    expect(result.events).toHaveLength(1)
    expect(source(tab, [{ id: '2', date: '' }]).undated).toBe(1)
  })
  it('defines every report category including the payroll ledger', () => {
    expect(Object.keys(TREND_CONFIG).sort()).toEqual(['admissions', 'assets', 'courses', 'demos', 'faculty', 'fees', 'finance', 'payroll', 'students'])
  })
})

describe('Reports trend calendar grouping', () => {
  it('normalizes timestamp dates to Karachi and rejects absent/invalid dates', () => {
    expect(reportDay('2026-12-31T20:00:00Z')).toBe('2027-01-01')
    expect(reportDay('2026-02-30')).toBeNull()
    expect(reportDay('')).toBeNull()
  })
  it('groups Day, Monday-based Week, Month and Year with zero activity between records', () => {
    const events = [event('2026-10-04', 10), event('2026-10-06', 20)]
    expect(aggregateReportTrend(events, 'Day').points.map(p => p.value)).toEqual([10, 0, 20])
    expect(aggregateReportTrend(events, 'Week').points.map(p => [p.day, p.value])).toEqual([['2026-09-28', 10], ['2026-10-05', 20]])
    expect(aggregateReportTrend(events, 'Month').points[0].value).toBe(30)
    expect(aggregateReportTrend([event('2025-01-01'), event('2027-01-01')], 'Year').points.map(p => p.value)).toEqual([1, 0, 1])
  })
  it('applies inclusive custom dates, validates reversed dates, and never fabricates empty observations', () => {
    const events = [event('2026-10-01'), event('2026-10-02'), event('2026-10-03')]
    expect(aggregateReportTrend(events, 'Date Range', '2026-10-02', '2026-10-03').count).toBe(2)
    expect(aggregateReportTrend(events, 'Date Range', '2026-10-03', '2026-10-01').error).toBeTruthy()
    expect(aggregateReportTrend(events, 'Date Range', '', '').error).toBeTruthy()
    expect(aggregateReportTrend([], 'Month').points).toEqual([])
    expect(aggregateReportTrend(events, 'Date Range', '2027-01-01', '2027-01-02').points).toEqual([])
  })
  it('bounds long ranges and explicitly chooses custom grouping', () => {
    const events = [event('2020-01-01'), event('2026-01-01')]
    expect(aggregateReportTrend(events, 'Day').error).toBeTruthy()
    expect(aggregateReportTrend(events, 'Date Range', '2020-01-01', '2026-01-01').grain).toBe('Month')
  })
})
