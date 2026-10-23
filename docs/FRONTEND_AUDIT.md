# Frontend Source Audit

**Status:** OWNER-APPROVED source audit; documentation only
**Audited:** 2026-10-23, branch `dev`
**Scope:** Actual `Client/` implementation. Proposed backend behavior is kept in `FRONTEND_BACKEND_HANDOFF.md`.

## 1. Runtime and source of truth

`Client/src/App.jsx` mounts Auth, Branch, Academy and Theme providers around `AppRouter`. `Client/src/routes/AppRouter.jsx` uses `BrowserRouter`, lazy route modules and `ProtectedRoute`. The application has no live API: `services/apiClient.js` is not the active data path. Pages call domain services; services recheck session, active branch and permission; `mockApi` serializes mutations; `mockDatabase` validates and writes browser storage.

Canonical browser keys are declared in `constants/storageKeys.js`: database `academyERP:mock:data:v1`, organization/users/settings `academyERP:mock:organization:v1`, session `academyERP:mock:auth:v1`, branding, notifications and color mode. `mockDatabase.js` owns academic and financial records. `mockOrganization.js` owns created users, assignment/profile overrides, credentials and settings. `localPageResources.js` is a bounded derived snapshot cache, never the source of truth; its signature includes raw database, organization, session and date and is cleared on writes/logout.

This is a single-browser mock. Frontend guards and localStorage provide no production security or cross-device synchronization.

## 2. Routes and access boundary

Routes are centralized in `routes/routePaths.js`. `ProtectedRoute.jsx` redirects absent sessions to `/login`, missing branch selection to `/select-branch`, and denied permissions to `/unauthorized`. It remounts content with `scopeKey` after branch changes. `constants/moduleAccess.js` drives Sidebar and global-search module discovery, while services independently call `canAccess`.

| Route | Component | Permission |
|---|---|---|
| `/dashboard` | `DashboardPage` | `dashboard.view` |
| `/admissions` | `AdmissionsPage` | `admissions.view` |
| `/students`, `/students/:studentId` | Students pages | `students.view` |
| `/courses-batches` | `CoursesBatchesPage` | `courses.view` |
| `/faculty`, `/faculty/:teacherId`, faculty subsections | Faculty pages | `faculty.view`; class detail uses `classes.view` |
| `/fees` | `FeesPage` | `fees.view` |
| `/finance` | `FinancePage` | `finance.view` |
| `/finance/payroll` | `FinancePage(initialTab="payroll")` | `payroll.view` |
| `/demo-classes` | `DemoClassesPage` | `demoClasses.view` |
| `/assets` | `AssetsPage` | `assets.view` |
| `/reports` | `ReportsPage` | `reports.view` |
| `/audit-log` | `AuditLogPage` | `audit.view` |
| `/branches`, `/users`, `/settings` | Administration pages | corresponding manage permission |

## 3. Module audit

### 3.1 Dashboard

- `pages/Dashboard/DashboardPage.jsx`; data from `dashboardService.overview` and `mockDatabase.dashboardOperation`.
- Role rendering covers Super Admin/Admin operational view, Receptionist operations, Owner summaries and Teacher-owned records. Filters/charts/cards derive from saved admissions, active enrollments, verified payments, posted expenses, assignments, classes and running payroll.
- Teacher projection intersects `facultyAssignments`, subjects, courses, batches, classes and active students with logged-in teacher ID. Receptionist and Teacher do not receive organization-wide expense/payroll collections.
- Refresh bypasses `localPageResources`; canonical storage/session changes invalidate snapshots. Empty/loading/error states are implemented.
- Backend need: one permission-aware aggregate endpoint; never send hidden organization-wide rows and filter in React.

### 3.2 Admissions

- `AdmissionsPage.jsx` provides search/status filters, New Admission, row/name View, Edit, Delete, Approve/Reject, enrollment and instant admission/payment dialogs. `NewAdmissionForm.jsx` contains student/guardian, course/batch/subject, fee, discount and initial-payment inputs.
- `admissionService`: `list`, `getById`, `create`, `createWithStudent`, `update`, `delete`, `changeStatus`, `enroll`, `completeAdmission`.
- `mockDatabase.createAdmission`, `enrollStudent` and `completeInstantAdmission` validate branch references, batch capacity, duplicate enrollment, configured fee, discount not exceeding fee and payment not exceeding net fee. Counters generate display admission/student/challan identifiers.
- Instant completion writes related Student, Admission, Enrollment, Challan and optional verified Payment in one serialized transaction. Notifications are created after successful admission operations.
- Missing backend: atomic transaction, idempotency key, unique counters/indexes and server-side lifecycle policy.

### 3.3 Students

- `StudentsPage.jsx` lists/searches/filters and exposes profile/edit/delete according to grants. `StudentProfilePage.jsx` shows personal/guardian data, enrollment history, fees, attendance and academic assignments.
- `studentService`: directory/list/get profile/create/update/delete. Student records link to admissions/enrollments by immutable IDs; profile projections resolve course/batch/challan/payment details.
- Deletion is guarded against linked records; editing uses service persistence rather than direct page storage.
- Backend need: paginated directory/profile endpoints, optimistic concurrency and explicit archive/delete policy.

### 3.4 Courses & Batches

- `CoursesBatchesPage.jsx` has course, batch, subject/academic configuration views plus create/edit/delete, details, students, teachers, timetable, assignment and student-shift actions.
- `academicService` owns overview/get/save/delete for course, batch, stream and subject; `courseService`/`batchService` are facades.
- Branch-scoped references enforce batch→course and subject→course. Batch name is unique within branch+course; capacity constrains enrollment. Optional shift and duration are descriptive only.
- Pricing supports one course fee or summed selected-subject fees; Admissions consumes the saved pricing model.
- Backend need: unique normalized indexes, reference checks and protected deletion when enrollments/assignments exist.

### 3.5 Faculty & Classes

- `FacultyClassesPage.jsx`, `FacultyProfilePage.jsx`, `ClassDetailsPage.jsx`: faculty CRUD, profiles, assignments, salary entry, schedule cards, class students, subject/batch views and class create/edit/delete.
- `facultyService` and `classScheduleService` persist `facultyAssignments` and dated/recurring class records. Assignment validation requires enabled branch Teacher, matching course/batch/subject, valid weekdays/times and rejects teacher/room overlaps and duplicate batch-subject assignment.
- Receptionist has class edit but not create/delete. Teachers reach own profile/dashboard projection; other teacher records remain service restricted.
- Backend need: transactional conflict check with compound indexes and record-level teacher ownership.

### 3.6 Fees

- `FeesPage.jsx` exposes summary cards, challan/payment/enrollment tables, course/batch/status/search filters, Generate Challan, Collect Payment, invoice/receipt/ledger views and print/PDF helpers.
- `financialService.overview`, `createChallan`, `recordPayment`, `getReceipt`; `feeService.updateEnrollmentStatus`.
- Only Verified payments count. A single challan per enrollment is enforced; amount must match confirmed configured admission fee; partial payments allowed; overpayment rejected. Balance is challan minus verified payments.
- Backend need: payment idempotency/reference, immutable receipts, money in integer minor units or Decimal128, and transactionally updated ledger totals.

### 3.7 Finance Overview

- `FinancePage.jsx` Finance tab aggregates verified fee income and posted expenses, filters transactions and supports export/print. `financialService.financeOverview` is the data source.
- Transaction references displayed in UI are shortened presentation values; immutable internal IDs remain in storage.
- Backend need: ledger query endpoint, stable cursor pagination, accounting-period/time-zone definition and reconciled totals.

### 3.8 Expenses

- Finance Expenses tab supports create expense and saved expense listing. `financialService.createExpense` validates positive amount, category, description, method and date; status is Posted.
- Payroll payment creates a matching Posted expense inside the same serialized mutation. Receptionist report projection explicitly omits expenses.
- No update/delete/reversal workflow is implemented for ordinary expenses. Backend reversal/approval rules are **UNVERIFIED**.

### 3.9 Teacher Payroll

- `TeacherPayrollView.jsx`, salary/payslip/payment dialogs; services in `payrollService.js`; formulas in `mock/assignmentPayroll.js` and running balance in `mock/runningPayroll.js`.
- Current model is one running salary obligation per faculty assignment, not recurring monthly generation. Agreement methods are Fixed Salary and Percentage. Percentage basis may be subject-listed fee or explicitly authorized course-listed fee.
- Admin/Super Admin save agreements and record partial/full payments. Payment requires positive amount (max two decimals), not beyond outstanding, valid method/date and unique branch transaction reference. It atomically appends payroll payment plus expense. Teachers can read own compensation/payslip; Owner can read authorized branch payroll; Receptionist cannot.
- Historical periods/lines remain read-only compatibility data. `requestAdvance` and `addAdjustment` public methods remain but adapter rejects new use; approval/recalculation is removed.
- Backend need: immutable agreement revisions, assignment-scoped unique obligation, transactional payment+expense, decimal money, idempotency and historical compatibility migration.

### 3.10 Demo Classes

- `DemoClassesPage.jsx` supports register, view/edit/delete, direct attendance, cancel and convert to admission. Registration can select actual branch course/batch and saved class choices.
- `demoClassService` exposes register/update/schedule/attendance/delete/cancel/convert. Current UI removed separate scheduling flow, though legacy schedule service operation remains.
- Duplicate registration, invalid class reference, time/location conflicts and terminal Converted/Cancelled transitions are guarded. Conversion creates linked admission/student records and preserves source demo ID.
- Attendance is inquiry-level, not per selected class. Backend lifecycle and idempotent conversion transaction are required.

### 3.11 Assets

- `AssetsPage.jsx`: inventory filters/stats/table; create/update; assign/unassign; inspect; maintenance/repair history and details.
- `assetService` maps to `assetOperation`. It validates branch staff assignments, condition, dates/cost and blocks assignment while in maintenance.
- Receptionist may list/get/create/update under current matrix; privileged operational actions are governed by `assets.manage`.
- Backend need: asset-code uniqueness, assignment history, append-only maintenance events and concurrency checks.

### 3.12 Reports & Ledgers

- `ReportsPage.jsx` provides category/report selection, date/course/batch filters, trend charts, preview tables and CSV/PDF/print exports.
- `reportService.overview` uses saved branch collections only. All-branch mode requires `reports.compareBranches`. Payroll report rows reuse running payroll; verified payments and posted expenses drive finance totals.
- Exports are generated client-side from already authorized projection. Backend must enforce the same scope on export endpoints and use asynchronous jobs for large outputs.

### 3.13 Audit Log

- `AuditLogPage.jsx` is read-only, filtered and paginated. `auditService.list` merges branch audit arrays after canonical Super Admin/Admin authorization.
- `mockAudit.appendAudit` records successful mutations, actor/branch/record snapshots, redacted changes and monotonic sequence; reads/no-ops are excluded.
- Browser storage can be edited by the user, so this is not tamper-resistant. Backend needs append-only server audit with protected retention.

### 3.14 Branches

- `BranchesPage.jsx`: list/details, name edit, activate/deactivate and guarded deletion. New branch creation is centrally paused by `branchPolicy.js`.
- `organizationService` requires branches.manage and a managed assignment. Deactivation blocks current/last usable branch and branches with pending admissions, active enrollments or unpaid challans. Delete requires inactive empty branch and no non-Super-Admin staff.
- Branch overrides preserve built-in IDs. Backend must own active-branch authorization and perform referential checks transactionally.

### 3.15 Users

- `UsersPage.jsx`: branch staff table/filter, create/edit, enable/disable, reset/access removal and optional guarded faculty-profile removal.
- `organizationService.staffOverview/saveUser/toggleUser/deleteUser`. Admin may create only Owner, Receptionist or Teacher in current branch and cannot mutate Admin/Super Admin. Super Admin may assign any known single role. Built-in identity editing is restricted.
- Access removal retains professional identity and operational links; `accessRevoked` blocks login. Password records are browser-local salted demo hashes, not production credentials.
- Backend need: unique normalized login, secure password hashing/session revocation, assignment uniqueness and last-admin invariants.

### 3.16 Settings

- `SettingsPage.jsx`: academy profile/contact/address/logo, branch theme/sidebar colors and payroll-enabled setting. Saves through `organizationService.saveSettings`; own profile through `saveOwnProfile`.
- Theme is stored per branch and consumed by all roles in that branch. Logo/profile image size/type validation is client-side.
- Several component files named AcademicSession, Course, Subject, Fee and Notification settings exist, but the current saved organization contract does not establish complete backend semantics for all of them: **UNVERIFIED** until separately approved.

## 4. Cross-cutting findings

- IDs are internal UUID-like strings plus human display counters. Never replace relationships with display labels.
- Most writes are serialized with Web Locks/fallback queue and validate the latest session again. A backend must replace this with database transactions and conditional writes.
- UI pages frequently contain presentation calculations; canonical financial and payroll calculation functions live in the mock adapter/utilities and must be ported once, server-side.
- `apiClient.js` and many directory README files still say planned; source behavior above supersedes those stale comments for audit purposes.
- Platform Admin is not implemented. Roles actually known are Super Admin, Admin, Owner, Receptionist and Teacher.
