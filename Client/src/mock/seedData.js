/**
 * Purpose: Will define seed Data for the mock area of the Academy frontend.
 * Module: mock
 * Status: Planned — functionality not implemented.
 */

// Provisional fictional schemas: id, branchId and name only; no ERP business policy.
export function createBatchSeeds(courses) {
  return courses.map(course => ({ id: `batch-demo-${course.id}`, branchId: course.branchId, courseId: course.id, name: `DEMO Batch - ${course.name}` }))
}
export function createSeedDatabase() {
  const data = { version: 4, enrollments: [], students: [
    { id: 'student-demo-1', branchId: 'demo-north', name: 'Demo Student One' },
    { id: 'student-demo-2', branchId: 'demo-central', name: 'Demo Student Two' },
  ], courses: [
    { id: 'course-demo-1', branchId: 'demo-north', name: 'Demo Course One' },
    { id: 'course-demo-2', branchId: 'demo-central', name: 'Demo Course Two' },
  ], admissions: [
    { id: 'ADM-0001', branchId: 'demo-central', studentName: 'Ali Khan', guardianName: 'Raza Khan', contact: '03001234567', dob: '2010-05-15', course: 'Computer Science', previousSchool: '', notes: '', status: 'Pending', createdAt: '2026-10-09' },
    { id: 'ADM-0002', branchId: 'demo-central', studentName: 'Sara Ahmed', guardianName: 'Ahmed Ali', contact: '03007654321', dob: '2011-08-20', course: 'Pre-Medical', previousSchool: '', notes: '', status: 'Approved', createdAt: '2026-10-08' },
    { id: 'ADM-0003', branchId: 'demo-north', studentName: 'Bilal Qureshi', guardianName: 'Qamar Qureshi', contact: '03211234567', dob: '2009-11-10', course: 'Computer Science', previousSchool: '', notes: '', status: 'Approved', createdAt: '2026-10-06' }
  ] }
  data.batches = createBatchSeeds(data.courses)
  return data
}
