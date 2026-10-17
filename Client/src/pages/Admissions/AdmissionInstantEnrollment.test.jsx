import { beforeEach, describe, expect, it } from 'vitest'
import { admissionService } from '../../services/admissionService.js'
import { authService } from '../../services/authService.js'
import { financialService } from '../../services/financialService.js'
import { MOCK_DATABASE_KEY } from '../../constants/storageKeys.js'
import { createMockDatabase } from '../../mock/mockDatabase.js'

const branch = { branchId: 'demo-central' }

beforeEach(() => {
  localStorage.clear()
})

describe('Admissions Instant Enrollment & Challan Integration', () => {
  it('allows Super Admin to execute completeInstantAdmission with discount and initial payment', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', branch.branchId)

    const payload = {
      studentName: 'Zain Ahmed',
      guardianName: 'Ahmed Bilal',
      contact: '03001234567',
      dob: '2005-08-15',
      course: 'Demo Course Two',
      courseId: 'course-demo-2',
      preferredBatchId: 'batch-demo-course-demo-2',
      subjectIds: [],
      configuredFee: 45000,
      discountAmount: 5000,
      discountReason: 'Merit / Kinship Waiver',
      initialPayment: 15000,
      paymentMethod: 'Cash Counter',
      nextDueDate: '2026-11-01',
    }

    const result = await admissionService.completeAdmission(payload, branch)

    expect(result.admission).toBeDefined()
    expect(result.admission.status).toBe('Approved')
    expect(result.admission.discountAmount).toBe(5000)
    expect(result.admission.netFee).toBe(40000)

    expect(result.student).toBeDefined()
    expect(result.student.status).toBe('Active')

    expect(result.enrollment).toBeDefined()
    expect(result.enrollment.status).toBe('Active')
    expect(result.enrollment.netFee).toBe(40000)
    expect(result.enrollment.feeStatus).toBe('Partial')

    expect(result.challan).toBeDefined()
    expect(result.challan.amount).toBe(40000)
    expect(result.challan.totalAmount).toBe(45000)
    expect(result.challan.discountAmount).toBe(5000)
    expect(result.challan.paidAmount).toBe(15000)
    expect(result.challan.balance).toBe(25000)
    expect(result.challan.status).toBe('Partial')

    expect(result.payment).toBeDefined()
    expect(result.payment.amount).toBe(15000)
    expect(result.payment.method).toBe('Cash Counter')
    expect(result.payment.status).toBe('Verified')
    expect(result.payment.receiptReference).toMatch(/^RCPT-/)

    // Verify stored data in mock DB
    const overview = await financialService.overview(branch)
    const matchingChallan = overview.challans.find(c => c.reference === result.challan.reference)
    expect(matchingChallan).toBeDefined()
    expect(matchingChallan.amount).toBe(40000)
    expect(matchingChallan.balance).toBe(25000)
    expect(matchingChallan.paidAmount).toBe(15000)

    const matchingPayment = overview.payments.find(p => p.challanId === result.challan.id)
    expect(matchingPayment).toBeDefined()
    expect(matchingPayment.amount).toBe(15000)
  })

  it('rejects instant admission when discount exceeds total configured fee', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', branch.branchId)

    const payload = {
      studentName: 'Invalid Discount Student',
      guardianName: 'Guardian',
      contact: '03001234567',
      dob: '2005-08-15',
      course: 'Demo Course Two',
      courseId: 'course-demo-2',
      preferredBatchId: 'batch-demo-course-demo-2',
      configuredFee: 30000,
      discountAmount: 35000, // Exceeds 30000
    }

    await expect(admissionService.completeAdmission(payload, branch)).rejects.toThrow(/Discount amount cannot exceed total course fee/i)
  })

  it('rejects instant admission when initial payment exceeds net payable fee', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', branch.branchId)

    const payload = {
      studentName: 'Overpayment Student',
      guardianName: 'Guardian',
      contact: '03001234567',
      dob: '2005-08-15',
      course: 'Demo Course Two',
      courseId: 'course-demo-2',
      preferredBatchId: 'batch-demo-course-demo-2',
      configuredFee: 30000,
      discountAmount: 5000, // Net = 25000
      initialPayment: 26000, // Exceeds net 25000
    }

    await expect(admissionService.completeAdmission(payload, branch)).rejects.toThrow(/Initial payment cannot exceed net payable fee/i)
  })

  it('prevents Receptionist from executing completeAdmission (least-privilege security boundary)', async () => {
    const northBranch = { branchId: 'demo-north' }
    await authService.login({ userId: 'demo-reception' })
    await authService.selectBranch('demo-reception', northBranch.branchId)

    const payload = {
      studentName: 'Receptionist Attempt',
      guardianName: 'Guardian',
      contact: '03001234567',
      dob: '2005-08-15',
      course: 'Demo Course Two',
      courseId: 'course-demo-2',
      preferredBatchId: 'batch-demo-course-demo-2',
      configuredFee: 30000,
    }

    await expect(admissionService.completeAdmission(payload, northBranch)).rejects.toThrow(/not authorized/i)
  })

  it('enforces batch capacity and prevents enrollment when batch is full', async () => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', branch.branchId)

    // Ensure database is initialized
    createMockDatabase().academicOperation('overview', { query: branch })

    const stored = JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY))
    const testBatchId = 'batch-limited-capacity'
    stored.batches.push({
      id: testBatchId,
      branchId: branch.branchId,
      courseId: 'course-demo-2',
      name: 'Limited Cap Batch',
      capacity: 1,
      active: true,
    })
    localStorage.setItem(MOCK_DATABASE_KEY, JSON.stringify(stored))

    // First student enrolls (seat 1 of 1)
    await admissionService.completeAdmission({
      studentName: 'Student One',
      guardianName: 'Guardian One',
      contact: '03001111111',
      dob: '2005-01-01',
      courseId: 'course-demo-2',
      preferredBatchId: testBatchId,
      configuredFee: 20000,
    }, branch)

    // Second student attempts to enroll in the same batch
    await expect(admissionService.completeAdmission({
      studentName: 'Student Two',
      guardianName: 'Guardian Two',
      contact: '03002222222',
      dob: '2005-02-02',
      courseId: 'course-demo-2',
      preferredBatchId: testBatchId,
      configuredFee: 20000,
    }, branch)).rejects.toThrow(/full capacity/i)
  })
})
