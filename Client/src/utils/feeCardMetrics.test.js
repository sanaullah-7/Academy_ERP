import { describe, expect, it } from 'vitest'
import { feeCardMetrics } from './feeCardMetrics.js'

describe('Fee card footer calculations', () => {
  it('keeps footer recovery, balances, distinct student counts and receipt counts consistent', () => {
    const challan = { branchId: 'a', studentId: 's1', amount: 1000, balance: 600, status: 'Overdue' }
    const payment = { branchId: 'a', status: 'Verified', paidAt: '2026-10-18T20:00:00Z', amount: 400 }
    const result = feeCardMetrics({ challans: [challan, { ...challan, amount: 500, balance: 500 }, { ...challan, branchId: 'b' }], payments: [payment, { ...payment, status: 'Pending' }, { ...payment, branchId: 'b' }, { ...payment, paidAt: '2026-10-17T20:00:00Z', amount: 100 }] }, 'a', new Date('2026-10-19T10:00:00Z'))
    expect(result).toMatchObject({ collected: 500, outstanding: 1100, overdue: 1100, today: 400, thisWeek: 400, recovery: 33.3, pendingStudents: 1, pendingChallans: 2, overdueStudents: 1, overdueChallans: 2, todayReceipts: 1 })
  })
  it('handles empty branches without invented targets or division by zero', () => {
    expect(feeCardMetrics({}, 'a')).toMatchObject({ collected: 0, outstanding: 0, recovery: null, todayReceipts: 0, overdueChallans: 0 })
  })
  it('uses the same Karachi day boundary for the total and footer verified receipt count', () => {
    const row = { branchId: 'a', status: 'Verified', amount: 250, paidAt: '2026-12-31T20:00:00Z' }
    expect(feeCardMetrics({ payments: [row] }, 'a', new Date('2026-12-31T20:01:00Z'))).toMatchObject({ today: 250, todayReceipts: 1, thisWeek: 250 })
  })
})
