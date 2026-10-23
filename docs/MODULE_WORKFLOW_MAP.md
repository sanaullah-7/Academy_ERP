# Module Workflow Map

**Evidence base:** `Client/src/services/*`, `Client/src/mock/mockDatabase.js`, `assignmentPayroll.js`, `runningPayroll.js`, routes and pages. Arrows below describe implemented browser-local behavior.

## 1. Admission to active student

```text
Admission form
  -> admissionService.completeAdmission/create/enroll
  -> validate branch + course + batch + subjects + capacity
  -> Student + Admission
  -> Enrollment(studentId, admissionId, courseId, batchId, subjectIds)
  -> Challan(enrollmentId)
  -> optional Verified Payment(challanId)
  -> dashboard/fees/reports recompute from saved records
```

`completeInstantAdmission` is atomic inside `mockApi.runTransaction`. Existing admission enrollment rejects a second active enrollment. Course pricing selects saved course fee or selected subject fees; discount and initial payment are bounded by configured/net fee. Source of truth is the database envelope, not cards or cached totals.

## 2. Faculty assignment to teacher experience

```text
User with Teacher role
  -> faculty identity (same immutable user/teacher ID)
  -> FacultyAssignment(teacherId, courseId, batchId, subjectId, days, times, room)
  -> classScheduleService / facultyService projections
  -> Teacher dashboard own courses/batches/students/classes
  -> Faculty profile timetable and class roster
  -> payroll agreement eligibility for that assignment
```

Joins fail or show unresolved labels when saved references are missing. Assignment creation validates all referenced rows and schedule conflicts. Backend should use ObjectId/UUID foreign keys plus compound uniqueness; names are snapshots/presentation only.

## 3. Enrollment to fees, finance and reports

```text
Enrollment
  -> one Challan with configured amount
  -> zero..n Verified Payments, total <= challan amount
  -> Fees ledger / receipt
  -> Finance income transaction
  -> Dashboard collection KPIs
  -> Reports ledgers/charts/exports
```

Only `status === 'Verified'` payment rows count. Challan status is derived from paid sum and balance. There is no backend settlement, refund or reversal contract yet; those policies are **UNVERIFIED**.

## 4. Assignment salary to financial reporting

```text
FacultyAssignment
  -> SalaryAgreement revision (fixed or percentage)
  -> Running payroll obligation per assignment
  -> partial/full PayrollPayment
  -> matching Posted Expense in same mutation
  -> Payslip (all source line payments)
  -> Finance + Owner dashboard + Reports payroll totals
```

The current running balance does not renew monthly. Historical period records remain readable but are not regenerated. A new agreement revises the obligation; a payment cannot exceed outstanding. Transaction reference is branch-unique.

## 5. Demo inquiry conversion

```text
Demo registration
  -> optional selected saved class snapshots
  -> attendance (Attended/Missed) or cancellation
  -> convertToAdmission
  -> linked Student + Admission
  -> regular enrollment/fee workflow continues separately
```

Conversion is one operation and stores source demo/admission links. Converted/Cancelled records are terminal for editing/attendance.

## 6. User/branch/role changes

```text
Organization assignment change
  -> mockOrganization write
  -> auth fixture projection
  -> active session/branch revalidation
  -> permission signature changes
  -> localPageResources invalidation
  -> sidebar/search/routes/services recompute
```

Logout clears session and derived page resources. Branch switching accepts only authorized active branches and remounts protected content with a new scope key. A backend must invalidate sessions/authorization cache centrally; browser storage events are insufficient across devices.

## 7. Mutation and refresh pattern

Pages call a service, display service errors, then reload the affected overview or update local projection. `mockApi` serializes writes, validates records/references and persists the whole database envelope. Raw database/organization/session signatures invalidate bounded page caches. Notifications and audit entries are secondary records created after/with successful operations depending on the workflow.

## 8. Fragile joins and integrity risks

| Risk | Evidence | Backend control |
|---|---|---|
| Cross-collection IDs are plain strings | `mockDatabase.js` finds records by ID repeatedly | Foreign-key-like validation in services plus indexed IDs |
| Whole-envelope last writer risk | localStorage read/replace | Mongo transactions and optimistic version fields |
| Display names duplicated as snapshots | faculty/payroll/demo records | Retain immutable ID; define snapshot refresh policy |
| Derived totals recomputed in several projections | dashboard/report/finance | Shared backend calculation domain service |
| Browser clock/date authority | payment/class/report dates | Server clock and academy timezone policy |
| Historical payroll formats coexist | periods/lines/running obligation | Explicit migration/version adapter |
| Local audit is mutable | browser-owned audit arrays | Append-only server audit store |
