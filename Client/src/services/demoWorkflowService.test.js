import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService.js'
import { demoWorkflowService, QA_DEMO_NAMES } from './demoWorkflowService.js'
import { academicService } from './academicService.js'
import { financialService } from './financialService.js'
import { admissionService } from './admissionService.js'

describe('owner-visible optional QA demo setup', () => {
  beforeEach(async () => { localStorage.clear(); await authService.login({ userId: 'demo-admin' }); await authService.selectBranch('demo-admin', 'demo-north') })
  it('adds an idempotent full and partial example only to the active branch', async () => {
    await demoWorkflowService.setup({ branchId: 'demo-north' })
    await demoWorkflowService.setup({ branchId: 'demo-north' })
    const academic = await academicService.overview({ branchId: 'demo-north' }), admissions = await admissionService.list({ branchId: 'demo-north' }), finance = await financialService.overview({ branchId: 'demo-north' })
    expect(academic.streams.filter(item => item.name === QA_DEMO_NAMES.stream)).toHaveLength(1)
    expect(academic.batches.filter(item => [QA_DEMO_NAMES.morning, QA_DEMO_NAMES.evening].includes(item.name))).toHaveLength(2)
    expect(academic.subjects.filter(item => QA_DEMO_NAMES.subjects.includes(item.name))).toHaveLength(3)
    expect(admissions.filter(item => [QA_DEMO_NAMES.studentA, QA_DEMO_NAMES.studentB].includes(item.studentName))).toHaveLength(2)
    expect(finance.challans.map(item => ({ studentName: item.studentName, status: item.status, balance: item.balance }))).toEqual(expect.arrayContaining([{ studentName: QA_DEMO_NAMES.studentA, status: 'Paid', balance: 0 }, { studentName: QA_DEMO_NAMES.studentB, status: 'Partial', balance: 25000 }]))
    await authService.selectBranch('demo-admin', 'demo-central')
    expect((await financialService.overview({ branchId: 'demo-central' })).payments).toHaveLength(0)
  })
})
