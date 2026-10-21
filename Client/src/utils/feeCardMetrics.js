import { reportDay } from './reportTrend.js'

export function feeCardMetrics(data = {}, branchId, now = new Date()) {
  const challans = (data.challans || []).filter(row => row.branchId === branchId)
  const payments = (data.payments || []).filter(row => row.branchId === branchId && row.status === 'Verified')
  const day = reportDay(now.toISOString())
  const monday = new Date(`${day}T00:00:00Z`)
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7)
  const weekStart = monday.toISOString().slice(0, 10)
  const todayPayments = payments.filter(row => reportDay(row.paidAt) === day)
  const unpaid = challans.filter(row => row.balance > 0)
  const overdue = challans.filter(row => row.status === 'Overdue')
  const sum = (rows, field) => rows.reduce((total, row) => total + row[field], 0)
  const issued = sum(challans, 'amount')
  const collected = sum(payments, 'amount')
  return {
    collected, outstanding: sum(unpaid, 'balance'), overdue: sum(overdue, 'balance'), today: sum(todayPayments, 'amount'),
    recovery: issued > 0 ? Math.round(collected / issued * 1000) / 10 : null,
    thisWeek: sum(payments.filter(row => { const date = reportDay(row.paidAt); return date && date >= weekStart && date <= day }), 'amount'),
    pendingStudents: new Set(unpaid.map(row => row.studentId).filter(Boolean)).size,
    pendingChallans: unpaid.length,
    overdueStudents: new Set(overdue.map(row => row.studentId).filter(Boolean)).size,
    overdueChallans: overdue.length,
    todayReceipts: todayPayments.length,
  }
}
