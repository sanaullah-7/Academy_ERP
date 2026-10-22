import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService.js'
import { assetService } from './assetService.js'
import { reportService } from './reportService.js'

const central = { branchId: 'demo-central' }
const north = { branchId: 'demo-north' }
const asset = { assetCode: 'QA-AST-001', name: 'QA Projector', category: 'Classroom Tech', trackingType: 'Individual', quantity: 1, purchaseDate: '2026-10-01', purchaseCost: 120000, bookValue: 110000, serialNumber: 'QA-SERIAL-1', location: 'QA Hall', supplier: 'QA Supplier', description: 'Fictional test asset' }
const signIn = async (userId = 'demo-admin', branchId = central.branchId) => { await authService.login({ userId }); await authService.selectBranch(userId, branchId) }

describe('F09 assets and F10 reports services', () => {
  beforeEach(async () => { localStorage.clear(); await signIn() })

  it('registers, edits and persists a unique immutable branch asset', async () => {
    const created = await assetService.create(asset, central)
    expect(created).toMatchObject({ assetCode: 'QA-AST-001', status: 'Available', condition: 'Working', bookValue: 110000 })
    await expect(assetService.create(asset, central)).rejects.toMatchObject({ code: 'DUPLICATE_ASSET_CODE' })
    await expect(assetService.update(created.id, { ...asset, assetCode: 'CHANGED' }, central)).rejects.toMatchObject({ code: 'IMMUTABLE_ASSET_CODE' })
    const updated = await assetService.update(created.id, { ...asset, name: 'QA Updated Projector' }, central)
    expect(updated.name).toBe('QA Updated Projector')
    expect((await assetService.list(central))[0].history).toHaveLength(2)
  })

  it('enforces branch isolation and role permissions', async () => {
    await assetService.create(asset, central)
    await authService.selectBranch('demo-admin', north.branchId)
    expect(await assetService.list(north)).toEqual([])
    await signIn('demo-owner', central.branchId)
    await expect(assetService.list(central)).resolves.toHaveLength(1)
    await expect(assetService.create(asset, central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
    await signIn('demo-teacher', central.branchId)
    await expect(assetService.list(central)).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
  })

  it('assigns only same-branch staff and prevents maintenance assignment', async () => {
    const created = await assetService.create(asset, central)
    await expect(assetService.assign(created.id, { assignedToId: 'demo-reception', location: 'QA Room' }, central)).rejects.toMatchObject({ code: 'INVALID_REFERENCE' })
    const assigned = await assetService.assign(created.id, { assignedToId: 'demo-owner', location: 'QA Room' }, central)
    expect(assigned).toMatchObject({ status: 'Assigned', assignedToName: 'Academy Owner' })
    await assetService.inspect(created.id, { condition: 'Needs Maintenance', remarks: 'QA inspection' }, central)
    await expect(assetService.assign(created.id, { assignedToId: 'demo-admin', location: 'QA Room' }, central)).rejects.toMatchObject({ code: 'INVALID_TRANSITION' })
  })

  it('records explicit maintenance values without automatic financial posting', async () => {
    const created = await assetService.create(asset, central)
    const updated = await assetService.addMaintenance(created.id, { date: '2026-10-14', description: 'QA lamp service', condition: 'Working', cost: 2500, nextServiceDate: '2027-01-14' }, central)
    expect(updated.maintenanceHistory[0]).toMatchObject({ cost: 2500, condition: 'Working' })
    expect(updated.status).toBe('Available')
  })

  it('derives authorized reports from saved records and restricts cross-branch comparison', async () => {
    const active = await reportService.overview(central)
    expect(active.branchIds).toEqual(['demo-central'])
    expect(active.admissions.every(item => item.branchId === central.branchId)).toBe(true)
    const comparison = await reportService.overview({ ...central, allBranches: true })
    expect(comparison.branchIds).toEqual(expect.arrayContaining(['demo-central', 'demo-north']))
    await signIn('demo-owner', central.branchId)
    await expect(reportService.overview(central)).resolves.toHaveProperty('branchIds', ['demo-central'])
    await expect(reportService.overview({ ...central, allBranches: true })).rejects.toMatchObject({ code: 'DEMO_ACTION_DENIED' })
  })
})
