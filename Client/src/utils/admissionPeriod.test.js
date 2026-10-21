import { describe, expect, it } from 'vitest'
import { admissionDay, matchesAdmissionPeriod } from './admissionPeriod.js'

const today = '2026-10-20'
describe('admission reporting periods', () => {
  it.each([
    ['Daily', '2026-10-19T18:59:59Z', false],
    ['Daily', '2026-10-19T19:00:00Z', true],
    ['Daily', '2026-10-20T18:59:59Z', true],
    ['Daily', '2026-10-20T19:00:00Z', false],
    ['Weekly', '2026-10-18', false],
    ['Weekly', '2026-10-19', true],
    ['Weekly', '2026-10-25', true],
    ['Weekly', '2026-10-26', false],
    ['Monthly', '2026-09-30', false],
    ['Monthly', '2026-10-31', true],
    ['Yearly', '2026-01-01', true],
    ['Yearly', '2025-12-31', false],
    ['Daily', 'invalid', false],
    ['All', null, true],
  ])('%s includes %s: %s', (period, date, expected) => {
    expect(matchesAdmissionPeriod(date, period, {}, today)).toBe(expected)
  })
  it('includes custom endpoints and excludes incomplete or reversed ranges', () => {
    const range = { start: '2026-10-01', end: '2026-10-20' }
    expect(matchesAdmissionPeriod('2026-09-30T19:00:00Z', 'Custom', range, today)).toBe(true)
    expect(matchesAdmissionPeriod('2026-10-20T18:59:59Z', 'Custom', range, today)).toBe(true)
    expect(matchesAdmissionPeriod('2026-10-20T19:00:00Z', 'Custom', range, today)).toBe(false)
    expect(matchesAdmissionPeriod(today, 'Custom', { start: today }, today)).toBe(false)
    expect(matchesAdmissionPeriod(today, 'Custom', { start: today, end: '2026-10-01' }, today)).toBe(false)
  })
  it('handles week boundaries across years and validates date-only input', () => {
    expect(matchesAdmissionPeriod('2025-12-29', 'Weekly', {}, '2026-01-01')).toBe(true)
    expect(matchesAdmissionPeriod('2026-01-04', 'Weekly', {}, '2026-01-01')).toBe(true)
    expect(admissionDay('2026-02-30')).toBeNull()
    expect(admissionDay(null)).toBeNull()
  })
})
