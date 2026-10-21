import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportTrendCard from './ReportTrendCard.jsx'

// Geometry/tooltips are checked in a real browser; expose series input here.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: ({ data }) => <div data-testid="trend-points">{JSON.stringify(data)}</div>,
  BarChart: ({ data }) => <div data-testid="single-period-bar"><span data-testid="trend-points">{JSON.stringify(data)}</span></div>,
  Bar: () => null,
  Area: () => null, CartesianGrid: () => null, Tooltip: () => null, XAxis: () => null, YAxis: () => null,
}))
const source = { events: [{ day: '2026-10-01', value: 100, secondary: 0, count: 1, status: 'Verified' }, { day: '2026-10-03', value: 200, secondary: 0, count: 1, status: 'Verified' }], undated: 0 }

describe('Reports left trend controls', () => {
  it('shows a real single-period bar without the removed helper text', async () => {
    const user = userEvent.setup()
    render(<ReportTrendCard tab="fees" source={source} rows={[{ totalFee: 1000, paid: 300, remainingBalance: 700 }]} />)
    for (const mode of ['Week', 'Month', 'Year']) {
      await user.click(screen.getByRole('button', { name: mode, exact: true }))
      expect(screen.getByTestId('single-period-bar')).toBeInTheDocument()
      expect(screen.queryByText(/Showing its total as a bar/)).not.toBeInTheDocument()
    }
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('Rs 700')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Day', exact: true }))
    expect(screen.queryByTestId('single-period-bar')).not.toBeInTheDocument()
  })
  it('switches every grouping and applies custom dates without changing source data', async () => {
    const user = userEvent.setup()
    render(<ReportTrendCard tab="fees" source={source} />)
    const group = screen.getByRole('group', { name: 'Trend grouping' })
    for (const mode of ['Day', 'Week', 'Month', 'Year']) {
      await user.click(within(group).getByRole('button', { name: mode, exact: true }))
      expect(within(group).getByRole('button', { name: mode, exact: true })).toHaveAttribute('aria-pressed', 'true')
    }
    await user.click(within(group).getByRole('button', { name: 'Date Range' }))
    expect(screen.getByRole('status')).toHaveTextContent('Choose a valid start')
    await user.type(screen.getByLabelText('Start date'), '2026-10-03')
    await user.type(screen.getByLabelText('End date'), '2026-10-03')
    expect(screen.getByTestId('trend-points')).toHaveTextContent('2026-10-03')
    expect(screen.getByTestId('trend-points')).not.toHaveTextContent('2026-10-01')
    expect(screen.getByText('Rs 200')).toBeInTheDocument()
    expect(source.events).toHaveLength(2)
  })
  it('switches tab content and reacts to newly filtered records and empty data', () => {
    const { rerender } = render(<ReportTrendCard tab="fees" source={source} />)
    rerender(<ReportTrendCard tab="admissions" source={{ events: [], undated: 2 }} />)
    expect(screen.getByRole('heading', { name: 'Intake Trend' })).toBeInTheDocument()
    expect(screen.getByText('No dated activity for this selection')).toBeInTheDocument()
    expect(screen.queryByText(/undated excluded/)).not.toBeInTheDocument()
    rerender(<ReportTrendCard tab="finance" source={source} sessionUnconfigured />)
    expect(screen.getByRole('heading', { name: 'Cash Flow Trend' })).toBeInTheDocument()
    expect(screen.getByText('Outflow (PKR)')).toBeInTheDocument()
    expect(screen.getByText(/Current Session dates are not configured/)).toBeInTheDocument()
  })
})
