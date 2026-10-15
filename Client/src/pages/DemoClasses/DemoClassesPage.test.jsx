import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/demo-classes')
})

async function signIn(userId = 'demo-admin', branchId = 'demo-central') {
  await authService.login({ userId })
  await authService.selectBranch(userId, branchId)
}

describe('F08 Demo Classes Page — UI Component Integration', () => {
  it('renders page header, KPI cards and demo table with seed records', async () => {
    await signIn('demo-admin', 'demo-central')
    render(<App />)

    expect(await screen.findByRole('heading', { name: /Demo Classes Management/i })).toBeInTheDocument()

    // Wait for async load to render KPI Cards and table
    expect(await screen.findByText(/Total Inquiries/i)).toBeInTheDocument()
    expect(screen.getByText(/Scheduled Sessions/i)).toBeInTheDocument()
    expect(screen.getByText(/Attended \/ Completed/i)).toBeInTheDocument()
    expect(screen.getByText(/Converted to Admission/i)).toBeInTheDocument()
    expect(screen.getByText(/Conversion Rate/i)).toBeInTheDocument()

    // Action button
    expect(screen.getByRole('button', { name: /Register Demo/i })).toBeInTheDocument()

    // Search and filter inputs
    expect(screen.getByLabelText(/Search demo records/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()

    // Seed students visible in table (both desktop and responsive cards)
    const hamzaElements = await screen.findAllByText('Hamza Malik')
    expect(hamzaElements.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Zainab Fatima').length).toBeGreaterThan(0)
  })

  it('filters demo inquiries by search keyword', async () => {
    const user = userEvent.setup()
    await signIn('demo-admin', 'demo-central')
    render(<App />)

    await screen.findAllByText('Hamza Malik')

    const searchInput = screen.getByLabelText(/Search demo records/i)
    await user.type(searchInput, 'Zainab')

    await waitFor(() => {
      expect(screen.getAllByText('Zainab Fatima').length).toBeGreaterThan(0)
      expect(screen.queryByText('Hamza Malik')).not.toBeInTheDocument()
    })
  })

  it('opens and closes the Demo Registration dialog', async () => {
    const user = userEvent.setup()
    await signIn('demo-admin', 'demo-central')
    render(<App />)

    const registerBtn = await screen.findByRole('button', { name: /Register Demo/i })
    await user.click(registerBtn)

    expect(await screen.findByRole('heading', { name: /Register Demo Class Inquiry/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Student Name/i)).toBeInTheDocument()

    // Close dialog
    await user.click(screen.getByRole('button', { name: /Cancel/i }))
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Register Demo Class Inquiry/i })).not.toBeInTheDocument()
    })
  })

  it('hides Register Demo action button for Owner (View Only)', async () => {
    await signIn('demo-owner', 'demo-central')
    render(<App />)

    expect(await screen.findByRole('heading', { name: /Demo Classes Management/i })).toBeInTheDocument()

    // Owner should see the table and KPIs but NO Register Demo action button
    expect(screen.queryByRole('button', { name: /Register Demo/i })).not.toBeInTheDocument()
    const hamzaElements = await screen.findAllByText('Hamza Malik')
    expect(hamzaElements.length).toBeGreaterThan(0)
  })
})