import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from './authService.js'
import { payrollService } from './payrollService.js'
import { financialService } from './financialService.js'
import { classScheduleService } from './classScheduleService.js'
import { createMockDatabase } from '../mock/mockDatabase.js'

const query = { branchId: 'demo-central' }

beforeEach(() => {
  localStorage.clear()
})

async function loginAdmin() {
  await authService.login({ userId: 'demo-admin' })
  await authService.selectBranch('demo-admin', query.branchId)
}

describe('payrollService', () => {
  it('manages teacher payroll module setting toggle with default false', async () => {
    await loginAdmin()
    const settings = await payrollService.getSettings(query)
    expect(settings.enabled).toBe(false)

    const updated = await payrollService.updateSettings({ enabled: true }, query)
    expect(updated.enabled).toBe(true)

    const checked = await payrollService.getSettings(query)
    expect(checked.enabled).toBe(true)

    const reverted = await payrollService.updateSettings({ enabled: false }, query)
    expect(reverted.enabled).toBe(false)
  })

  it('lists default agreements and allows updating agreements', async () => {
    await loginAdmin()
    const { agreements, teachers } = await payrollService.getAgreements(query)
    expect(agreements.length).toBeGreaterThanOrEqual(4)
    expect(teachers.length).toBeGreaterThanOrEqual(4)

    const irfan = teachers.find(t => t.teacherId === 'teacher-irfan')
    expect(irfan).toBeDefined()
    expect(irfan.agreement.calculationMethod).toBe('fixed')
    expect(irfan.agreement.monthlySalary).toBe(85000)

    const saved = await payrollService.saveAgreement({
      teacherId: 'teacher-irfan',
      calculationMethod: 'fixed',
      monthlySalary: 90000,
      allowances: 6000,
      standardDeductions: 3000,
    }, query)
    expect(saved.monthlySalary).toBe(90000)
    expect(saved.allowances).toBe(6000)
  })

  it('calculates payroll period supporting Method A (Fixed Monthly)', async () => {
    await loginAdmin()
    const result = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    expect(result.period).toBeDefined()
    expect(result.lines.length).toBeGreaterThan(0)

    const irfanLine = result.lines.find(l => l.teacherId === 'teacher-irfan')
    expect(irfanLine).toBeDefined()
    expect(irfanLine.calculationMethod).toBe('fixed')
    expect(irfanLine.baseEarnings).toBe(85000)
    expect(irfanLine.allowances).toBe(5000)
    expect(irfanLine.deductions).toBe(2500)
    expect(irfanLine.netPayable).toBe(87500)
    expect(irfanLine.outstanding).toBe(87500)
  })

  it('calculates Method B (Per Completed Lecture) from verified scheduled classes', async () => {
    await loginAdmin()
    // Schedule 2 classes for teacher-naeem in October 2026
    await classScheduleService.create({
      subject: 'Chemistry',
      batchId: 'batch-demo-course-demo-2',
      teacherId: 'teacher-naeem',
      classDate: '2026-10-05',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Lab 1',
    }, query)

    await classScheduleService.create({
      subject: 'Chemistry',
      batchId: 'batch-demo-course-demo-2',
      teacherId: 'teacher-naeem',
      classDate: '2026-10-12',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Lab 1',
    }, query)

    const result = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    const naeemLine = result.lines.find(l => l.teacherId === 'teacher-naeem')
    expect(naeemLine).toBeDefined()
    expect(naeemLine.calculationMethod).toBe('per_lecture')
    // 2 verified lectures @ 2500 = 5000 base
    expect(naeemLine.baseEarnings).toBe(5000)
    expect(naeemLine.calculationDetails.verifiedLecturesCount).toBe(2)
    expect(naeemLine.allowances).toBe(2000)
    expect(naeemLine.deductions).toBe(1000)
    // 5000 + 2000 - 1000 = 6000
    expect(naeemLine.netPayable).toBe(6000)
  })

  it('supports staff advance disbursement, posts Finance expense, and auto-recovers in payroll', async () => {
    await loginAdmin()
    // 1. Disburse advance of PKR 10,000 to teacher-irfan
    const advanceResult = await payrollService.requestAdvance({
      teacherId: 'teacher-irfan',
      amount: 10000,
      method: 'Cash',
      reason: 'Urgent medical requirement',
    }, query)

    expect(advanceResult.advance.amount).toBe(10000)
    expect(advanceResult.advance.balance).toBe(10000)

    // Finance must show exactly 1 expense for the advance
    const financeAfterAdvance = await financialService.financeOverview(query)
    const advanceExpense = financeAfterAdvance.expenses.find(e => e.id === advanceResult.expense.id)
    expect(advanceExpense).toBeDefined()
    expect(advanceExpense.amount).toBe(10000)
    expect(advanceExpense.category).toBe('Faculty')

    // 2. Calculate October 2026 payroll: advance must be deducted automatically
    const calcResult = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    const irfanLine = calcResult.lines.find(l => l.teacherId === 'teacher-irfan')
    // Gross: 85,000 + 5,000 - 2,500 = 87,500
    // Advance deducted: 10,000
    // Net payable: 77,500
    expect(irfanLine.advancesDeducted).toBe(10000)
    expect(irfanLine.netPayable).toBe(77500)
  })

  it('approves period, records partial and full disbursements, and automatically posts Finance expenses', async () => {
    await loginAdmin()
    const calcResult = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    const period = await payrollService.approvePeriod(calcResult.period.id, query)
    expect(period.status).toBe('Approved')

    const irfanLine = calcResult.lines.find(l => l.teacherId === 'teacher-irfan')

    // Partial payment: PKR 30,000
    const payment1 = await payrollService.recordPayment({
      payrollLineId: irfanLine.id,
      amount: 30000,
      method: 'Bank Transfer',
      transactionReference: 'TXN-BANK-001',
      notes: 'First installment',
    }, query)

    expect(payment1.line.totalPaid).toBe(30000)
    expect(payment1.line.outstanding).toBe(57500)
    expect(payment1.line.status).toBe('Partially Paid')

    // Verify 1 expense was created in Finance
    let finance = await financialService.financeOverview(query)
    expect(finance.expenses.some(e => e.id === payment1.expense.id && e.amount === 30000)).toBe(true)

    // Remaining payment: PKR 57,500
    const payment2 = await payrollService.recordPayment({
      payrollLineId: irfanLine.id,
      amount: 57500,
      method: 'Bank Transfer',
      transactionReference: 'TXN-BANK-002',
      notes: 'Final settlement',
    }, query)

    expect(payment2.line.totalPaid).toBe(87500)
    expect(payment2.line.outstanding).toBe(0)
    expect(payment2.line.status).toBe('Paid')

    // Verify second expense in Finance
    finance = await financialService.financeOverview(query)
    expect(finance.expenses.some(e => e.id === payment2.expense.id && e.amount === 57500)).toBe(true)
  })

  it('generates itemized payslip with teacher, branch and deduction details', async () => {
    await loginAdmin()
    const calcResult = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    const irfanLine = calcResult.lines.find(l => l.teacherId === 'teacher-irfan')

    const payslip = await payrollService.getPayslip(irfanLine.id, query)
    expect(payslip).toBeDefined()
    expect(payslip.teacher.name).toContain('Irfan')
    expect(payslip.line.netPayable).toBe(87500)
    expect(payslip.branch.id).toBe(query.branchId)
    expect(payslip.agreement.calculationMethod).toBe('fixed')
  })

  it('calculates Method C (Per Student / Batch) from unique active enrolled students in assigned batches', async () => {
    await loginAdmin()
    const db = createMockDatabase()
    const admission = db.createAdmission({
      studentName: 'Student For Bilal',
      guardianName: 'Guardian',
      contact: '03001234567',
      dob: '2010-01-01',
      course: 'Demo Course Two',
      courseId: 'course-demo-2'
    }, query)
    const { admissionService } = await import('./admissionService.js')
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, query)
    await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, query)

    const { academicService } = await import('./academicService.js')
    const { mockApi } = await import('../mock/mockApi.js')
    const subject = await academicService.saveSubject(undefined, { courseId: 'course-demo-2', name: 'Bilal Physics', active: true }, query)
    const subjectId = subject.id

    await mockApi.facultyAssignmentOperation('create', {
      record: {
        teacherId: 'teacher-bilal',
        courseId: 'course-demo-2',
        batchId: 'batch-demo-course-demo-2',
        subjectId,
        days: ['Mon'],
        startTime: '14:00',
        endTime: '15:00',
        room: 'Room 2',
      },
      query
    })

    const result = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    const bilalLine = result.lines.find(l => l.teacherId === 'teacher-bilal')
    expect(bilalLine).toBeDefined()
    expect(bilalLine.calculationMethod).toBe('per_student')
    expect(bilalLine.calculationDetails.uniqueEnrolledStudentsCount).toBeGreaterThanOrEqual(1)
    expect(bilalLine.baseEarnings).toBe(bilalLine.calculationDetails.uniqueEnrolledStudentsCount * 1800)
  })

  it('calculates Method D (Verified Fee Collection %) from eligible payments in the payroll month', async () => {
    await loginAdmin()
    const db = createMockDatabase()
    const admission = db.createAdmission({
      studentName: 'Student For Tariq',
      guardianName: 'Guardian',
      contact: '03009876543',
      dob: '2010-01-01',
      course: 'Demo Course Two',
      courseId: 'course-demo-2'
    }, query)
    const { admissionService } = await import('./admissionService.js')
    await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, query)
    const { enrollment } = await admissionService.enroll(admission.id, { batchId: 'batch-demo-course-demo-2' }, query)

    const { academicService } = await import('./academicService.js')
    const { mockApi } = await import('../mock/mockApi.js')
    const subject = await academicService.saveSubject(undefined, { courseId: 'course-demo-2', name: 'Tariq Math', active: true }, query)
    const subjectId = subject.id

    await mockApi.facultyAssignmentOperation('create', {
      record: {
        teacherId: 'teacher-tariq',
        courseId: 'course-demo-2',
        batchId: 'batch-demo-course-demo-2',
        subjectId,
        days: ['Tue'],
        startTime: '11:00',
        endTime: '12:00',
        room: 'Room 3',
      },
      query
    })

    const challan = await financialService.createChallan({
      enrollmentId: enrollment.id,
      description: 'October Tuition',
      amount: 20000,
      issueDate: '2026-10-01',
      dueDate: '2026-10-31',
    }, query)

    await financialService.recordPayment({
      challanId: challan.id,
      amount: 20000,
      method: 'Cash',
    }, query)

    // Another batch in this course must not contribute to this teacher's share.
    const otherBatch=await academicService.saveBatch(null,{name:'Other fee batch',courseId:'course-demo-2',active:true},query)
    const otherAdmission=await admissionService.createWithStudent({studentName:'Other Batch Student',guardianName:'Guardian',contact:'03001112222',dob:'2010-01-01',course:'Demo Course Two',courseId:'course-demo-2'},query)
    await admissionService.changeStatus(otherAdmission.id,{status:'Approved',expectedStatus:'Pending'},query)
    const other=await admissionService.enroll(otherAdmission.id,{batchId:otherBatch.id},query)
    const unrelated=await financialService.createChallan({enrollmentId:other.enrollment.id,description:'Other batch fees',amount:30000,issueDate:'2026-10-01',dueDate:'2026-10-31'},query)
    await financialService.recordPayment({challanId:unrelated.id,amount:30000,method:'Cash'},query)
    const result = await payrollService.calculatePeriod({ yearMonth: '2026-10' }, query)
    const tariqLine = result.lines.find(l => l.teacherId === 'teacher-tariq')
    expect(tariqLine).toBeDefined()
    expect(tariqLine.calculationMethod).toBe('fee_percentage')
    expect(tariqLine.baseEarnings).toBe(7000)
    expect(tariqLine.calculationDetails.totalVerifiedTuitionCollected).toBe(20000)
    expect(tariqLine.calculationDetails.feePercentage).toBe(35)
  })

})

describe('payroll payment safety and historical snapshots',()=>{
 it('requires approval, prevents duplicate references and keeps expense amounts consistent',async()=>{
  await loginAdmin()
  const calc=await payrollService.calculatePeriod({yearMonth:'2026-10'},query),line=calc.lines.find(l=>l.teacherId==='teacher-irfan')
  const record={payrollLineId:line.id,amount:1000,method:'Bank Transfer',transactionReference:'QA-ONCE'}
  await expect(payrollService.recordPayment(record,query)).rejects.toThrow('Approve payroll')
  await payrollService.approvePeriod(calc.period.id,query)
  await expect(payrollService.recordPayment({...record,amount:1000.5},query)).rejects.toThrow()
  const saved=await payrollService.recordPayment(record,query)
  expect(saved.expense.amount).toBe(saved.payment.amount)
  await expect(payrollService.recordPayment({...record,transactionReference:' QA-ONCE '},query)).rejects.toThrow('already been posted')
  expect((await financialService.financeOverview(query)).expenses.filter(e=>e.id===saved.expense.id)).toHaveLength(1)
 })
 it('recovers an advance once across partial payments and leaves later advances for future payroll',async()=>{
  await loginAdmin()
  const first=await payrollService.requestAdvance({teacherId:'teacher-irfan',amount:10000,method:'Bank Transfer'},query)
  expect(first.expense.method).toBe('Bank Transfer')
  const calc=await payrollService.calculatePeriod({yearMonth:'2026-10'},query),line=calc.lines.find(l=>l.teacherId==='teacher-irfan')
  await payrollService.approvePeriod(calc.period.id,query)
  await payrollService.recordPayment({payrollLineId:line.id,amount:1000,method:'Cash'},query)
  const next=await payrollService.requestAdvance({teacherId:'teacher-irfan',amount:5000,method:'Cash'},query)
  await payrollService.recordPayment({payrollLineId:line.id,amount:line.netPayable-1000,method:'Cash'},query)
  const advances=await payrollService.getAdvances(query)
  expect(advances.find(a=>a.id===first.advance.id).balance).toBe(0)
  expect(advances.find(a=>a.id===next.advance.id).balance).toBe(5000)
  const history=await payrollService.getPeriodDetails(calc.period.id,query)
  expect(history.lines.find(l=>l.id===line.id)).toMatchObject({netPayable:77500,totalPaid:77500,outstanding:0,advancesRecovered:10000})
  await expect(payrollService.calculatePeriod({yearMonth:'2026-10'},query)).rejects.toThrow('locked')
  await expect(payrollService.addAdjustment({teacherId:'teacher-irfan',yearMonth:'2026-10',type:'bonus',amount:1000},query)).rejects.toThrow('locked')
 })
 it('keeps approved salary immutable when contract changes and uses new rate in draft months',async()=>{
  await loginAdmin()
  const calc=await payrollService.calculatePeriod({yearMonth:'2026-10'},query)
  await payrollService.approvePeriod(calc.period.id,query)
  await payrollService.saveAgreement({teacherId:'teacher-irfan',calculationMethod:'fixed',monthlySalary:95000},query)
  expect((await payrollService.getPeriodDetails(calc.period.id,query)).lines.find(l=>l.teacherId==='teacher-irfan').baseEarnings).toBe(85000)
  const next=await payrollService.calculatePeriod({yearMonth:'2026-11'},query)
  expect(next.lines.find(l=>l.teacherId==='teacher-irfan').baseEarnings).toBe(95000)
 })
 it('settles zero-cash advance recovery on approval and does not reserve one advance twice',async()=>{
  await loginAdmin()
  const advance=await payrollService.requestAdvance({teacherId:'teacher-irfan',amount:87500,method:'Cash'},query)
  const october=await payrollService.calculatePeriod({yearMonth:'2026-10'},query)
  const november=await payrollService.calculatePeriod({yearMonth:'2026-11'},query)
  await payrollService.approvePeriod(october.period.id,query)
  expect((await payrollService.getAdvances(query)).find(a=>a.id===advance.advance.id).balance).toBe(0)
  expect((await payrollService.getPeriodDetails(october.period.id,query)).lines.find(l=>l.teacherId==='teacher-irfan')).toMatchObject({status:'Paid',netPayable:0,advancesRecovered:87500})
  await expect(payrollService.approvePeriod(november.period.id,query)).rejects.toThrow('Advance balances changed')
  const refreshed=await payrollService.calculatePeriod({yearMonth:'2026-11'},query)
  expect(refreshed.lines.find(l=>l.teacherId==='teacher-irfan').advancesDeducted).toBe(0)
 })
 it('rejects invalid months, foreign/non-teacher references and unsafe salary amounts',async()=>{
  await loginAdmin()
  for(const yearMonth of ['2026-13','bad','2026-00'])await expect(payrollService.calculatePeriod({yearMonth},query)).rejects.toThrow('valid payroll month')
  for(const teacherId of ['demo-admin','demo-reception','missing']){
   await expect(payrollService.saveAgreement({teacherId,calculationMethod:'fixed',monthlySalary:50000},query)).rejects.toThrow()
   await expect(payrollService.requestAdvance({teacherId,amount:1000,method:'Cash'},query)).rejects.toThrow()
   await expect(payrollService.addAdjustment({teacherId,yearMonth:'2026-10',type:'bonus',amount:1000},query)).rejects.toThrow()
  }
  for(const monthlySalary of [-1,Infinity,1.5])await expect(payrollService.saveAgreement({teacherId:'teacher-irfan',calculationMethod:'fixed',monthlySalary},query)).rejects.toThrow()
  await expect(payrollService.saveAgreement({id:'agr-naeem',teacherId:'teacher-irfan',calculationMethod:'fixed',monthlySalary:1000},query)).rejects.toThrow('not found in this branch')
 })
})

it('does not pay future dated lectures as completed work',async()=>{
 vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-10-21T07:00:00Z'))
 try{
  await loginAdmin()
  for(const classDate of ['2026-10-12','2026-10-30'])await classScheduleService.create({subject:'Chemistry',batchId:'batch-demo-course-demo-2',teacherId:'teacher-naeem',classDate,startTime:'10:00',endTime:'11:00',location:'QA Lecture Lab'},query)
  const calc=await payrollService.calculatePeriod({yearMonth:'2026-10'},query)
  expect(calc.lines.find(l=>l.teacherId==='teacher-naeem')).toMatchObject({baseEarnings:2500,calculationDetails:{verifiedLecturesCount:1}})
 }finally{vi.useRealTimers()}
})
