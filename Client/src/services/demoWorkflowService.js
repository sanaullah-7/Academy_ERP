import { academicService } from './academicService.js'
import { admissionService } from './admissionService.js'
import { financialService } from './financialService.js'
import { getLocalDateOnly } from '../utils/formatDate.js'

export const QA_DEMO_NAMES = Object.freeze({
  stream: 'QA Pre-Medical', course: 'QA MDCAT Preparation', morning: 'QA MDCAT Morning', evening: 'QA MDCAT Evening',
  subjects: Object.freeze(['QA Biology', 'QA Chemistry', 'QA Physics']), studentA: 'QA Fictional Student A', studentB: 'QA Fictional Student B',
})

const addDays = (dateOnly, days) => { const date = new Date(`${dateOnly}T00:00:00.000Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10) }

export const demoWorkflowService = {
  async setup({ branchId }) {
    const query = { branchId }
    let academic = await academicService.overview(query)
    const find = (items, name) => items.find(item => item.name === name)
    const stream = find(academic.streams, QA_DEMO_NAMES.stream) ?? await academicService.saveStream(null, { name: QA_DEMO_NAMES.stream, active: true }, query)
    academic = await academicService.overview(query)
    const course = find(academic.courses, QA_DEMO_NAMES.course) ?? await academicService.saveCourse(null, { name: QA_DEMO_NAMES.course, streamId: stream.id, active: true, pricingMode: 'subjects' }, query)
    academic = await academicService.overview(query)
    const subjectRecords = []
    for (const name of QA_DEMO_NAMES.subjects) subjectRecords.push(academic.subjects.find(item => item.courseId === course.id && item.name === name) ?? await academicService.saveSubject(null, { name, courseId: course.id, active: true, feeAmount: 15000 }, query))
    academic = await academicService.overview(query)
    const morning = find(academic.batches, QA_DEMO_NAMES.morning) ?? await academicService.saveBatch(null, { name: QA_DEMO_NAMES.morning, courseId: course.id, active: true, capacity: 24, startTime: '08:00', endTime: '12:00' }, query)
    const evening = find(academic.batches, QA_DEMO_NAMES.evening) ?? await academicService.saveBatch(null, { name: QA_DEMO_NAMES.evening, courseId: course.id, active: true, capacity: 24, startTime: '16:00', endTime: '20:00' }, query)
    const admissions = await admissionService.list(query)
    const ensureStudent = async (name, batch, suffix) => {
      let admission = admissions.find(item => item.studentName === name && item.courseId === course.id)
      if (!admission) admission = await admissionService.createWithStudent({ studentName: name, guardianName: `QA Fictional Guardian ${suffix}`, contact: `0300000000${suffix}`, studentPhone: `0310000000${suffix}`, dob: `2010-01-0${suffix}`, course: course.name, courseId: course.id, streamId: stream.id, preferredBatchId: batch.id, subjectIds: subjectRecords.map(subject => subject.id), notes: 'Explicit fictional owner-visible QA demo record.' }, query)
      if (admission.status === 'Pending') admission = await admissionService.changeStatus(admission.id, { status: 'Approved', expectedStatus: 'Pending' }, query)
      let finance = await financialService.overview(query)
      let enrollment = finance.enrollments.find(item => item.admissionId === admission.id)
      if (!enrollment) enrollment = (await admissionService.enroll(admission.id, { batchId: batch.id }, query)).enrollment
      finance = await financialService.overview(query)
      let challan = finance.challans.find(item => item.enrollmentId === enrollment.id)
      const issueDate = getLocalDateOnly()
      if (!challan) challan = await financialService.createChallan({ enrollmentId: enrollment.id, description: 'QA configured subject tuition', amount: 45000, issueDate, dueDate: addDays(issueDate, 30) }, query)
      return { admission, enrollment, challan }
    }
    const studentA = await ensureStudent(QA_DEMO_NAMES.studentA, morning, '1')
    const studentB = await ensureStudent(QA_DEMO_NAMES.studentB, evening, '2')
    let finance = await financialService.overview(query)
    const paid = challanId => finance.payments.filter(item => item.challanId === challanId).reduce((sum, item) => sum + item.amount, 0)
    if (paid(studentA.challan.id) === 0) await financialService.recordPayment({ challanId: studentA.challan.id, amount: 45000, method: 'Cash' }, query)
    finance = await financialService.overview(query)
    if (paid(studentB.challan.id) === 0) await financialService.recordPayment({ challanId: studentB.challan.id, amount: 20000, method: 'Bank Transfer' }, query)
    return { stream, course, batches: [morning, evening], subjects: subjectRecords, studentA, studentB }
  },
}
