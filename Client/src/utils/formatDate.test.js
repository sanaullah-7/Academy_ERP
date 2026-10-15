import { describe, expect, it } from 'vitest'
import { getLocalDateOnly } from './formatDate.js'

describe('getLocalDateOnly', () => {
  it('formats the local calendar date without converting through UTC', () => {
    expect(getLocalDateOnly(new Date(2026, 9, 13, 3, 49))).toBe('2026-10-13')
  })
})
