import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'
import { assetService } from '../../services/assetService.js'

const scope = { branchId: 'demo-central' }
const metric = label => within(screen.getByText(label, { exact: true }).closest('[data-slot="card"]'))
beforeEach(async () => {
  localStorage.clear()
  history.replaceState(null, '', '/assets')
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', scope.branchId)
})

describe('Assets saved-data flow', () => {
  it('registers an asset and updates saved inventory and summary values', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('button', { name: /Register New Asset/ }))
    fireEvent.change(screen.getByLabelText('Asset Tag ID'), { target: { value: 'QA-FLOW-001' } })
    fireEvent.change(screen.getByLabelText('Asset Name'), { target: { value: 'QA Inventory Projector' } })
    fireEvent.change(screen.getByLabelText('Category', { exact: true }), { target: { value: 'Classroom Tech' } })
    fireEvent.change(screen.getByLabelText('Stored Book Value (PKR)'), { target: { value: '12000' } })
    await user.click(screen.getByRole('button', { name: 'Save Asset' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(metric('Total Assets').getByText('1', { exact: true })).toBeInTheDocument())
    expect(metric('Total Inventory Value').getByText(/12,000/)).toBeInTheDocument()
    expect((await assetService.list(scope))[0]).toMatchObject({ assetCode: 'QA-FLOW-001', bookValue: 12000 })
  })

  it('refreshes edited values and maintenance metrics from saved records on focus', async () => {
    const asset = await assetService.create({ assetCode: 'QA-LIVE-001', name: 'QA Live Asset', category: 'QA', quantity: 1, trackingType: 'Individual', purchaseCost: 200, bookValue: 150 }, scope)
    render(<App />)
    await waitFor(() => expect(metric('Total Assets').getByText('1', { exact: true })).toBeInTheDocument())
    await assetService.inspect(asset.id, { condition: 'Needs Maintenance', remarks: 'QA audit' }, scope)
    await assetService.update(asset.id, { ...asset, bookValue: 100 }, scope)
    fireEvent(window, new Event('focus'))
    await waitFor(() => expect(metric('Needs Maintenance').getByText('1', { exact: true })).toBeInTheDocument())
    expect(metric('Working Condition').getByText('0%')).toBeInTheDocument()
    expect(metric('Total Inventory Value').getByText(/100/)).toBeInTheDocument()
  })
  it('paginates saved inventory and resets to page one when row count changes', async () => {
    for (let index = 1; index <= 11; index++) await assetService.create({ assetCode: `QA-PAGE-${String(index).padStart(2, '0')}`, name: 'QA Pagination Asset', category: 'QA', trackingType: 'Individual', quantity: 1, purchaseCost: 1 }, scope)
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('1\u201310 of 11')
    await user.click(screen.getByRole('button', { name: 'Next Assets page' }))
    expect(screen.getByText('11\u201311 of 11')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Assets rows per page'), '15')
    expect(screen.getByText('1\u201311 of 11')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next Assets page' })).toBeDisabled()
  })

})
