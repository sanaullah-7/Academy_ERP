import { describe, expect, it } from 'vitest'
import { formatTime, formatTimeRange, formatScheduleLabel, formatTimestamp, toTime24 } from './timeFormat.js'

describe('shared 12-hour presentation', () => {
  it.each([['00:00','12:00 AM'],['08:30','8:30 AM'],['12:00','12:00 PM'],['13:00','1:00 PM'],['13:30','1:30 PM'],['18:00','6:00 PM'],['23:45','11:45 PM'],['23:59','11:59 PM'],['04:00 PM','4:00 PM']])('formats %s as %s and round-trips without changing minutes', (value, expected) => {
    expect(formatTime(value)).toBe(expected)
    const [clock, period] = expected.split(' ')
    expect(formatTime(toTime24(clock, period))).toBe(expected)
  })
  it.each(['24:00','13:60','bad',null,undefined,''])('handles invalid or absent %s', value => expect(formatTime(value)).toBe('Not configured'))
  it('rejects malformed 12-hour input without normalizing an invalid clock', () => {
    for (const value of ['0:00','13:00','1:60','1:3','']) expect(toTime24(value,'PM')).toBe('')
    expect(toTime24('12:00','AM')).toBe('00:00')
    expect(toTime24('12:00','PM')).toBe('12:00')
    expect(toTime24('11:59','PM')).toBe('23:59')
  })
  it('preserves overnight order and parses only whole schedule labels', () => {
    expect(formatTimeRange('23:00','01:00')).toBe('11:00 PM - 1:00 AM')
    expect(formatScheduleLabel('08:00 - 13:00')).toBe('8:00 AM - 1:00 PM')
    expect(formatScheduleLabel('01:00 PM - 02:30 PM')).toBe('1:00 PM - 2:30 PM')
    expect(formatScheduleLabel('1 hour ago')).toBe('1 hour ago')
    expect(formatScheduleLabel('Room 13:00 code')).toBe('Room 13:00 code')
  })
  it('uses Karachi dates and AM/PM for UTC/offset timestamps at midnight and noon', () => {
    expect(formatTimestamp('2026-10-19T19:00:00Z')).toMatch(/20 Oct 2026, 12:00 AM/)
    expect(formatTimestamp('2026-10-20T07:00:00Z')).toMatch(/20 Oct 2026, 12:00 PM/)
    expect(formatTimestamp('2026-10-20T13:00:00+05:00')).toMatch(/20 Oct 2026, 1:00 PM/)
    expect(formatTimestamp('2026-10-20T13:00:00')).toMatch(/20 Oct 2026, 1:00 PM/)
    expect(formatTimestamp('2026-10-20')).toBe('20 Oct 2026')
    expect(formatTimestamp('2026-02-30')).toBe('Date unavailable')
    expect(formatTimestamp('bad')).toBe('Date unavailable')
    expect(formatTimestamp(null)).toBe('Date unavailable')
  })
})


it('converts complete manually typed AM/PM entries without losing custom minutes', () => {
  expect(toTime24('9:07 AM')).toBe('09:07')
  expect(toTime24('2:15 PM')).toBe('14:15')
  expect(toTime24('12:00 AM')).toBe('00:00')
  expect(toTime24('12:00 PM')).toBe('12:00')
  expect(toTime24('11:59 pm')).toBe('23:59')
  expect(toTime24('13:70')).toBe('')
})
