import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RecentPayments from './RecentPayments.jsx'

describe('RecentPayments', () => {
  it('shows the honest empty state when no verified payment source exists', () => {
    render(<RecentPayments branchId="branch-a" />)
    expect(screen.getByRole('heading', { name: 'Recent Payments' })).toBeInTheDocument()
    expect(screen.getByText('Verified fee receipts')).toBeInTheDocument()
    expect(screen.getByText('No verified payments')).toBeInTheDocument()
  })

  it('shows only verified active-branch receipts newest first and opens an available receipt', async () => {
    const onOpenReceipt = vi.fn()
    const payments = [
      { id: 'older', branchId: 'branch-a', status: 'Verified', paidAt: '2026-01-01T10:00:00Z', studentName: 'Older Student', amount: 1000, method: 'Cash', receiptId: 'receipt-1', receiptReference: 'R-1' },
      { id: 'newer', branchId: 'branch-a', status: 'Verified', paidAt: '2026-01-02T10:00:00Z', studentName: 'Newer Student', amount: 2000, method: 'Bank', receiptId: 'receipt-2', receiptReference: 'R-2' },
      { id: 'pending', branchId: 'branch-a', status: 'Pending', paidAt: '2026-01-03T10:00:00Z', studentName: 'Pending Student', amount: 3000, method: 'Cash', receiptReference: 'R-3' },
      { id: 'foreign', branchId: 'branch-b', status: 'Verified', paidAt: '2026-01-04T10:00:00Z', studentName: 'Foreign Student', amount: 4000, method: 'Cash', receiptReference: 'R-4' },
    ]
    render(<RecentPayments branchId="branch-a" payments={payments} onOpenReceipt={onOpenReceipt} />)
    const receiptButtons = screen.getAllByRole('button', { name: /View receipt/ })
    expect(receiptButtons.map(button => button.textContent)).toEqual([expect.stringContaining('Newer Student'), expect.stringContaining('Older Student')])
    expect(screen.queryByText('Pending Student')).not.toBeInTheDocument()
    expect(screen.queryByText('Foreign Student')).not.toBeInTheDocument()
    await userEvent.setup().click(receiptButtons[0])
    expect(onOpenReceipt).toHaveBeenCalledWith(expect.objectContaining({ id: 'newer' }))
  })
})
