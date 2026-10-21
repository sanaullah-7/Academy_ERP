import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import App from '../App.jsx'
import { authService } from '../services/authService.js'
import { financialService } from '../services/financialService.js'
import { capturePageVersion, rememberPageResource } from '../services/localPageResources.js'

describe('warm local route data', () => {
  it('renders available current data while revalidating, then preserves a genuine read error', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-north')
    const data = await financialService.overview({ branchId: 'demo-north' })
    rememberPageResource('fees', { data }, capturePageVersion())
    let rejectRead
    vi.spyOn(financialService, 'overview').mockImplementation(() => new Promise((_, reject) => { rejectRead = reject }))
    history.replaceState(null, '', '/fees')
    render(<App />)
    await screen.findByRole('button', { name: 'Open user menu' })
    expect(screen.getByText('No challans match this view.')).toBeInTheDocument()
    expect(screen.queryByText('Loading fee records...')).not.toBeInTheDocument()
    await act(async () => { rejectRead(new Error('Delayed read failed')) })
    expect(await screen.findByText('Delayed read failed')).toBeInTheDocument()
  })
})
