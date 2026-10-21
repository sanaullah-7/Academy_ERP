import { describe, expect, it } from 'vitest'
import { getLocalDateOnly, isOnAcademyDay } from './formatDate.js'

describe('getLocalDateOnly', () => {
  it('formats the local calendar date without converting through UTC', () => {
    expect(getLocalDateOnly(new Date(2026, 9, 13, 3, 49))).toBe('2026-10-13')
  })
})

describe('isOnAcademyDay', () => {
  it.each([
    ['2026-10-19T18:59:59.999Z', false],
    ['2026-10-19T19:00:00.000Z', true],
    ['2026-10-20T18:59:59.999Z', true],
    ['2026-10-20T19:00:00.000Z', false],
    [null, false],
    ['', false],
    ['invalid', false],
  ])('checks Karachi day boundaries for %s', (timestamp, expected) => {
    expect(isOnAcademyDay(timestamp, new Date('2026-10-20T10:00:00Z'))).toBe(expected)
  })

  it('expires yesterday records when the academy day changes', () => {
    const enrolledAt = '2026-10-20T12:00:00Z'
    expect(isOnAcademyDay(enrolledAt, new Date('2026-10-20T18:59:59Z'))).toBe(true)
    expect(isOnAcademyDay(enrolledAt, new Date('2026-10-20T19:00:00Z'))).toBe(false)
  })
})
