<!-- Active task checklist â€” abhi kis ticket par kaam chal raha hai aur agla task kya hai -->

# Academy Management ERP â€” Active Task Register

**Document:** TASKS.md
**Version:** 1.0
**Status:** ACTIVE - F04 Courses & Batches and F05 Faculty & Classes IN_REVIEW
**Last Updated:** 2026-10-21
**Project:** Academy Management ERP
**Development Strategy:** Frontend First
**Current Milestone:** F00-011 login logo motion (authorized and in progress); F04/F05 delivery remains IN_REVIEW


## Teacher "My Profile" Navigation, Schedule & Salary Compensation Hub (2026-10-22)

**Status:** IN_REVIEW; implementation complete, owner acceptance pending.
- **Sidebar & Routing**: Added "My Profile" navigation tab under Academics for the Teacher role with `UserRound` icon, linking to `/my-profile`.
- **Teacher Profile Page (`FacultyProfilePage.jsx`)**:
  - Automatically identifies the logged-in teacher when accessed via `/my-profile` or by a teacher.
  - Context-aware `Back to Dashboard` button.
  - 4 tabs: `Overview & Bio`, `Class Schedule & Timetable` (with printable institutional layout and coordinator signatures), `Academic Assignments`, and `Salary & Compensation`.
- **Salary & Compensation Ledger**:
  - 4 Executive Financial KPIs: Total Contracted Remuneration, Verified Disbursed / Paid, Remaining Outstanding Balance, and Settlement Ratio Gauge.
  - Teaching Assignment Remuneration breakdown table (Courses, Batches, Subjects, Agreement Type, Agreed Total, Paid, Remaining, Status, and action button).
  - Verified Payment Receipts and Disbursement History table (Date, Transaction Reference, Remuneration Scope, Payment Method, Amount, Verification status, and Official Payslip action).
  - Integrated `PayslipModal` for instant preview, printing, and PDF export of official salary payslips.
- **Salary Disbursal Notifications**:
  - Connected `payrollService.recordPayment` and `notificationService` to publish a `salary_payment` notification to the teacher whenever a salary payment is recorded by administration.
  - Added `Wallet` notification icon in `NotificationCenter.jsx`.
- **Security**: Teacher self-read boundary enforced across `facultyService.getById`, `payrollService.getTeacherCompensation`, and `payrollService.getPayslip`. Cross-faculty salary inspection is denied.
- **Verification**: `TeacherProfile.test.jsx` (5/5 PASS), `FacultyWorkflow.test.jsx` (10/10 PASS), `FacultyClasses.test.jsx` (4/4 PASS), `TeacherPayrollPage.test.jsx` (4/4 PASS), `payrollService.test.js` (19/19 PASS), `notificationService.test.js` (3/3 PASS), ESLint (0 errors, 0 warnings), Vite production build (PASS in 6.18s).

## Teacher Profile Deletion — Dr. Irfan (Bio) Removed (2026-10-22)

**Status:** IN_REVIEW; implementation complete, owner acceptance pending.
- Removed `teacher-irfan` (`Dr. Irfan (Bio)`) across authentication fixtures, salary agreements, demo classes, student profiles, and faculty roster enrichments.
- Realigned test suites (`FacultyWorkflow.test.jsx`, `TeacherPayrollPage.test.jsx`, `staffLogin.test.js`, `payrollService.test.js`, `auditService.test.js`, `organizationService.test.js`, `roleMatrix.test.js`) to active faculty members.
- Verified: All affected tests PASS (91 tests across 8 suites), ESLint (0 errors, 0 warnings), Vite production build (PASS in 3.73s).

## Reports & Ledgers — Teacher Payroll Default, 5 KPI Cards & Dual Chart Alignment (2026-10-22)

**Status:** IN_REVIEW; implementation complete, owner acceptance pending.
- **Default Tab**: `activeTab = 'payroll'` defaults to `Teacher Payroll & Salary Ledger`.
- **KPI Redesign**: Configured exactly 5 high-impact cards in `xl:grid-cols-5` (Total Salary Payable, Verified Salary Paid, Outstanding Salary, Teachers in Payroll, Salary Settlement Rate with gauge).
- **Dual-Panel Analytics**:
  - Left: `ReportTrendCard` (`Salary Disbursement Trend`) with Recharts Area/Bar chart and multi-period filters (Day, Week, Month, Year, Date Range).
  - Right: Recharts Doughnut Chart + categorical status cards (Cleared, Partially Paid, Pending Disbursement).
- **Polished Table**: Formatted teacher avatars, badges for calculation method, formatted currency values, and status pills.
- **Cleaned Footer**: Removed deprecated "Teacher salary totals" section below the table.
- **Verification**: `ReportsPage.test.jsx` (6/6 PASS), `AdminOperations.integration.test.jsx` (4/4 PASS), ESLint (0 errors, 0 warnings), Vite production build (PASS in 6.08s).

## Five-Role Permission Matrix & Administrative Boundary Enforcement (2026-10-22)

**Status:** IN_REVIEW; implementation complete, owner acceptance pending.
- **Admin**: Full operational access across all 15 modules including Settings, Audit Log, Branches, and Users within authorized tenant and branch boundaries.
- **Receptionist**: Full Admissions access (create, edit, view, review, approve, return to pending, enroll, and delete) and Full Fees access (view, collect, and manage/issue challans/instant admission). Strictly denied independent Finance, Payroll, Audit Log, Branches, Users, and Settings.
- **Owner**: Financial overview and Finance full; view-only academic modules; strictly denied Audit Log, Branches, Users, and Settings.
- **Teacher**: Self-service dashboard and assigned records only; strictly denied all administrative and operational management modules.
- **Restricted Administration Modules (Audit Log, Branches, Users, Settings)**: Accessible exclusively to Super Admin and Admin. Hardened at route guards, navigation filters, service authorization adapters, and switchAccount handlers.
- **Escalation Guards**: Admin is strictly blocked from escalating to Super Admin, switching to Super Admin accounts, creating branches with Super Admin role, or assigning Super Admin/Admin roles to staff.
- **Multi-Branch Dynamic Recalculation**: Role-per-branch recalculated dynamically upon branch switch with zero cross-branch leakage.
- **Verification**: 19/19 dedicated tests in `Client/src/routes/fiveRoleMatrix.test.jsx` PASS; full test suite (83 test files, 683 tests) PASS; ESLint 0 errors / 0 warnings; Vite production build PASS (5.14s).

## Owner, Receptionist & Teacher Dashboard Redesign & Cashflow Alignment (2026-10-22)

**Status:** IN_REVIEW; implementation complete, owner acceptance pending.
- **Owner Dashboard Cashflow Alignment**:
  - Replaced the basic static bar chart with the Super Admin interactive Cashflow Chart architecture (`CashflowChart.jsx`).
  - Added full multi-period analysis switcher (All, Daily, Weekly, Monthly, Yearly, Custom) with start/end custom date range picker.
  - Displays real-time Inflow, Burn, Net Margin summary cards and dual-bar Recharts visualization (TSA Maroon `#940016` Revenue vs. `#bfdbfe` Expenses).
  - Added perspective toggle between "Cashflow Flow" and "Enrollment Volume".
  - Upgraded Recent Activity with styled transaction badges (Payments, Admissions, Expenses).
  - Upgraded Financial Overview into 4 executive metric cards: Total Revenue, Pending Dues, Expenses, and Operating Margin.
  - Upgraded Quick Operations with live interactive navigation cards to `/admissions`, `/fees`, `/reports`, and `/assets`.
- **Receptionist Dashboard Redesign**:
  - Upgraded Front Desk overview with active status pill, live counter indicators, and modern layout.
  - Enhanced KPI cards: Today's Admissions, Pending Inquiries, Demo Follow-ups, and Active Students.
  - Redesigned Recent Inquiries with candidate avatars, course chips, and status pills.
  - Redesigned Today's Schedule with timetable badges, room indicators, and orientation tracking.
  - Enabled active Front Desk Actions (New Walk-in, Log Inquiry, Schedule Demo, Quick Admission) linking directly to authorized workflows.
- **Teacher Dashboard Redesign**:
  - Transformed Instructor Hub into an executive faculty workspace.
  - Preserved all required test headings: "Instructor Hub", "Today's Schedule", "Upcoming Sessions", "Recent Teaching Activity", "Instructor Actions".
  - Preserved exact KPI titles: "Today's Classes", "Pending Assignments", "Average Attendance", "Assigned Batches".
  - Enhanced Upcoming Sessions with time slot badges, room tags, and enrolled batch pills.
  - Added Recent Teaching Activity faculty roster cards with weekly schedule tags and salary summary balance indicator.
  - Enabled active Instructor Actions navigating to `/faculty`, `/courses`, and `/students`.
- **Architecture & Shared Utilities**:
  - Extracted shared period analysis logic into `Client/src/utils/dashboardCashflow.js` (`PERIODS`, `isInPeriod`, `localDateKey`).
  - Isolated React component into `Client/src/components/Dashboard/CashflowChart.jsx` maintaining Fast Refresh compliance.
- **Verification**:
  - `Client/src/pages/Dashboard/DashboardPage.test.jsx`: 14/14 PASS.
  - Full Vitest suite: 83 test files, 684 tests PASS.
  - ESLint: 0 errors, 0 warnings.
  - Vite production build: PASS in 11.52s.


**Status:** IN_REVIEW; implementation complete, owner acceptance pending.
- Add an isolated Three.js login-logo presentation with GSAP idle float and pointer tilt.
- Preserve the white logo background, academy-configured logo and fallback behavior. Keep a static image for WebGL failure and reduced-motion preference.
- Approved dependencies: `three` and `gsap`. No other UI or shared animation system is in scope.
- Verification: focused login-logo and branding tests 12/12 PASS; targeted ESLint PASS; production build PASS; browser WebGL and reduced-motion fallback PASS; dependency audit reports 0 vulnerabilities. Three.js and GSAP are dynamically loaded; Three.js is 736.44 kB raw/186.85 kB gzip, triggering Vite's chunk-size warning.

## UI Theme — Global Main Content Background Color Consistency (#F7F8FC) (2026-10-18)

**Status:** IMPLEMENTED; ready for user review.
- Applied centralized soft off-white/light grey background (`#F7F8FC`) across all ERP modules, branches, and roles by updating `--workspace-background` and `--background` in `theme.css` and `ThemeContext.jsx`.
- Verified `.workspace-shell` and `.workspace-body` in `globals.css` render `#F7F8FC`.
- All cards, tables, forms, modals, dialogs, and top KPI stat cards remain crisp white (`#ffffff` / `--workspace-surface` / `--card`). Sidebar and topbar themes, TSA Maroon branding, and all functionalities remain strictly preserved.
- Tests: 43/43 targeted unit/integration tests PASS; production build PASS (1.19s, 0 errors).

## Document Branding & Layout — Premium TSA Institutional PDF & Print System (2026-10-18)

**Status:** IMPLEMENTED; ready for user review.
- Embedded official TSA Academy Logo synchronously across all PDF and print generators via `tsaLogoBase64.js`.
- Implemented unified, prominent institutional header with bold maroon `THE SCHOLAR COACHING ACADEMY`, subtitle `Official Management & Academic Information System`, campus/branch indicator, and formal document type / date badges.
- Standardized Template A (Table Reports), Template B (Fee Challans / Invoices), and Template C (Payment Receipts) with professional borders, typography, signatures, and footers.
- Enhanced browser print CSS in `globals.css` and dialog print layout in `FeesPage.jsx`.
- Tests: `pdfHelpers.test.js` (4/4 PASS); node PDF binary verification PASS (%PDF-1.3 valid for all 3 templates); targeted frontend integration tests PASS (16/16); production build PASS (1.15s, 0 errors).

## F10 Reports & Ledgers — Institutional Branding & Dual-Panel Analytics Center (2026-10-19)

**Status:** IN_REVIEW; ready for owner review.
- **Institutional Branding for Export & Print**: Embedded official TSA logo (`tsaLogo`), academy title `THE SCHOLAR COACHING ACADEMY`, subtitle `Official Management & Academic Information System`, branch campus indicator, and printable sign-off/stamp footer into browser print views (`hidden print:flex`). Enhanced Word/Google Doc table generator (`serializeWordTable`) with institutional header styling, academy colors, and shaded maroon table headers.
- **Refined & Compact Global Filter Bar**: Replaced washed-out background with clean white card (`bg-white border-slate-200/90`), tightened labels and spacing, reduced vertical height by ~30%, and made action buttons compact (`h-7`).
- **Dual-Panel Executive Visual Analytics**: Replaced stretched single-row chart with responsive 12-column dual-panel layout:
  - Left (7 cols): Backlit.ui-styled Target Velocity & Progress Meter with ambient glow progress bar (`0% Base -> 50% Mid-Target -> 100% Full Yield`) and 3 micro-metric cards.
  - Right (5 cols): Cohort Composition & Doughnut Breakdown with compact legend pills and summary indicator.
- **Quality Verification**:
  - ESLint: 0 errors, 0 warnings across all touched files.
  - Vitest: 11/11 tests PASS (`ReportsPage.test.jsx` [5/5], `wordExport.test.js` [1/1], `assetReportService.test.js` [5/5]).
  - Production Vite build: PASS in 2.41s with 0 errors.

## F08 Demo Classes UI & Flow — Academy Maroon Buttons & Real-Time Live Stats (2026-10-18)

**Status:** IMPLEMENTED; ready for user review.
- Converted all button styles and active indicators in Demo Classes (`/demo-classes`) from green to signature Academy Maroon (`#940016`, hover `#72000E`). This includes `Convert ->`, `Convert to Admission` (desktop & mobile card views), active tab pills (`All`, `Upcoming`, `Attended`, `Converted`, `No-Show`), dialog action buttons (`Open Full Admission Form ↗`, `Create Pending Admission`, `Save Attendance`), and focus rings.
- Removed all static fallback numbers (`|| 48`, `|| 36`, `|| 24`, `|| 8`) from `DemoStats.jsx`. Top KPI metric cards now compute live counts directly from active branch demo records (Total Registered with dynamic 7-day registration count & current month, Attended Trial with dynamic turnout rate %, Converted with dynamic conversion rate %, and Pending Trial Slots with dynamic active session halls).
- Preserved direct conversion workflow: Clicking `Convert ->` or `Convert to Admission` seamlessly transfers candidate to Admissions tab (`/admissions`), prefilling candidate name, guardian, contact, stream, course, preferred batch, and demo remarks for one-click payment, approval, and enrollment.
- Tests: 5/5 Vitest tests in `DemoClassesPage.test.jsx` PASS; production Vite build PASS (1.40s, 0 errors).

## F09 Assets/Inventory + F10 Reports (2026-10-14)

**Status:** IN_REVIEW; owner browser acceptance pending. Dedicated `feature/f09-f10-assets-reports` worktree implements branch-scoped asset registration/editing, condition inspection, assignment, maintenance history, stored-value KPIs/export and authoritative Admissions, Enrollment, Fee Collection and Super Admin branch-comparison reports with filters, pagination, CSV and browser print. Automatic depreciation, disposal/deletion, attendance, recovery-rate and defaulter-deadline rules remain blocked because no approved policy or authoritative records exist. Super Admin is the only F09/F10 demo role; other roles fail closed pending an approved matrix. Focused tests 52/52, targeted ESLint and one production build PASS; browser QA NOT_RUN.

## F04-001 through F04-007 Courses & Batches (2026-10-12)

**Status:** IN_REVIEW; owner acceptance pending. Isolated implementation on `feature/f04-courses-batches`: branch-scoped responsive course/batch directories, Super Admin Create/Edit, Receptionist/Owner View, Teacher deny-by-default, search/filter/sort/details, actual enrollment counts, and explicit unconfigured capacity/timetable/teacher-assignment states. Owner-confirmed Add/Edit Stream and Subject dialogs save branch-scoped records; their form-submit buttons are fixed and covered by persistence/reload regression tests (8/8 focused tests PASS, scoped lint PASS; browser NOT_RUN). Focused tests, targeted lint and production build evidence are recorded in PROGRESS.md. No F05 work started.

## F05-001 through F05-007 Faculty & Classes (2026-10-12)

**Status:** IN_REVIEW; owner acceptance pending. Branch-scoped responsive Faculty directory/profile and read-only subject, batch, schedule and enrollment-based class student views are implemented. Teacher assignment writes, timetable writes and Teacher own-class authorization remain deferred pending approved data contracts and policies.

## F02-007 Admissions Module Final Integration Check (2026-10-12)

**Status:** IN_REVIEW; owner acceptance pending. Focused integration verification of F02-001 through F02-006 is complete. Targeted UI/data tests: 129/129 PASS in 13 files. One production build PASS; existing >500 kB chunk warning remains.

**Workflow results:** PASS for admission creation/linking, course/batch selection, row/name/actions View, Edit and authorized Pending Delete, Super Admin Approve and Approved → Pending with Reject removed, enrollment activation, explicit/automatic valid batch selection and Confirm feedback, enrolled-record protection, role-denial/branch checks, refresh persistence and gapless serial behavior. Enrollment UI test verifies Confirm works after valid selection; clicking without selection reports the needed action and focuses Batch.

**Not run:** manual real-browser/viewport session, full test suite, CI, deployment, backend and formal accessibility checks. The recorded PASS results are automated focused test evidence, not a claim of manual browser QA or production authorization.

**Files changed during this verification:** `Client/src/mock/mockDatabase.js`, `Client/src/mock/admissionTransaction.test.js`, `Client/src/mock/programSelection.test.js`, `Client/src/mock/enrollment.test.js`, `Client/src/pages/Admissions/AdmissionEnrollment.test.jsx`, plus this ticket's documentation. No new libraries or installs. Owner acceptance is still required; no F03 ticket started.

## F02-006 Admission-to-Enrollment Mock Integration (2026-10-12)

**Status:** IN_REVIEW; owner acceptance pending.

- Approved admissions expose **Enroll Student** only to the active-branch Super Admin through existing `admissions.decide` policy.
- Confirmation shows the linked student, course, branch and selected matching batch. If no preferred batch is saved, the user must select an available same-branch course batch; unresolved references fail safely.
- One serialized mock database operation writes the minimum enrollment `{id, branchId, admissionId, studentId, courseId, batchId, status, enrolledAt}` and changes the linked Student from Provisional to Active atomically. Admission remains Approved.
- Version-3 saved mock data migrates additively to version 4 with an empty `enrollments` collection; records, IDs, counters and the storage key are retained. Unsupported/corrupt data is not reset.
- Re-enrollment, duplicate active student/course/batch pairs, enrolled Admission/Student edits, Admission deletion and Approved → Pending are blocked at the mock database boundary.
- Only same-branch, reciprocal admission-flow Student, saved Course and matching Batch references are accepted. A missing/unresolved saved preferred-batch reference may be replaced only through explicit selection of a valid saved batch; no name-based guessing. No All Branches, backend, fee, cancellation or new permission behavior.

**Changed source/tests:** `Client/src/mock/mockDatabase.js`, `Client/src/mock/mockApi.js`, `Client/src/mock/seedData.js`, `Client/src/services/admissionService.js`, `Client/src/components/Admissions/AdmissionActions.jsx`, `Client/src/mock/enrollment.test.js`, `Client/src/pages/Admissions/AdmissionEnrollment.test.jsx`.

**Verification:** targeted Vitest PASS, 56/56 tests across 5 files and targeted ESLint PASS at delivery; final F02-007 integration run also covered enrollment tests after preferred-batch fallback changes. Full suite and manual browser checks NOT_RUN. No new libraries or installs. Owner acceptance pending.

## Admission & Student Row Click + 3-Dots Actions — UI correction (2026-10-12)

**Status:** IN_REVIEW; owner-approved limited frontend implementation.

- Admission row/name and three-dots → View open the same saved Admission details dialog; row Enter/Space supported and action-cell clicks do not bubble.
- The Students row/name opens the separate read-only Student Profile; profile shows saved name/status/student number, selected branch and linked Admission display reference. Profile lookup is by ID and active branch, with missing/error/retry handling.
- Three-dots remains available for every status. View stays enabled; for Approved/Rejected, Edit/Delete/Approve/Reject remain disabled when the user's existing policy would otherwise show them. Permissions and status workflow are unchanged.

**Changed source/tests:** `Client/src/components/Admissions/AdmissionActions.jsx`, `Client/src/pages/Admissions/AdmissionsPage.jsx`, `Client/src/components/Students/StudentsTable.jsx`, `Client/src/pages/Students/StudentProfilePage.jsx`, `Client/src/routes/AppRouter.jsx`, `Client/src/routes/routePaths.js`, and focused admission/status/student UI tests.

**Verification:** targeted Vitest PASS, 38/38 tests in 3 files; targeted ESLint PASS with no diagnostics. Full suite/build/browser audit NOT_RUN. No new libraries, backend, permission, enrollment, fee or student-editing changes.

## F02-005 decided-admission action policy clarification (2026-10-12)

**SUPERSEDED** by the latest owner decision below. Its permission rule for Edit/Delete remains; its Rejected status and Approved ↔ Rejected reversal rule no longer apply.

## F02-005 Remove Reject; allow Approved → Pending (2026-10-12)

**CONFIRMED by owner; latest policy.** Remove Reject from the UI and supported new status requests. Replace it with a Pending action shown for Approved records; Super Admin may return an Approved admission to Pending. Pending admissions retain Approve. Existing role permissions and authorized Edit/Delete remain unchanged; same-status is idempotent. Existing saved Rejected admissions migrate to Pending and their statusHistory is cleared, as explicitly requested. No enrollment, fees, backend or dependencies.

**Implementation/verification:** `Client/src/components/Admissions/AdmissionActions.jsx`, `Client/src/pages/Admissions/AdmissionsPage.jsx`, `Client/src/mock/mockDatabase.js` and `Client/src/lib/admissionPolicy.js`; focused admission UI/storage tests updated. Targeted Vitest PASS: 61/61 across 4 files; targeted ESLint PASS. Full suite/build NOT_RUN.


## F02-005 Pending Delete owner extension (2026-10-12)

CONFIRMED: the owner's follow-up request enables Delete in the three-dots Admissions Actions menu for Super Admin in the active authorized branch, following the preceding Super Admin-only proposal. Receptionist/Owner/Teacher and unresolved multi-role assignments remain denied. Approve/Reject authority remains unresolved and denied. Only Pending admissions can be deleted; decided records remain read-only. Existing confirmation/Cancel/Escape, pending-submit lock, error/retry, atomic linked Provisional deletion, unrelated-record preservation and response-only gapless renumbering are reused. Permanent IDs and historical counters are retained. No storage reset, backend or dependency change.

**Status: IN_REVIEW; owner acceptance pending.** Full tests PASS: 240/240 in 23 files. Lint PASS (0 errors, 1 existing DashboardPage warning); build PASS (existing large-chunk warning). Manual browser viewport inspection, CI, deployment and backend/security verification NOT_RUN. This entry supersedes historical Pending Delete denial only; previous evidence and explanatory comments are retained.


## Active correction — Owner Role Matrix Reconciliation (2026-10-12)

**IN_REVIEW; owner acceptance pending.** Confirmed Admissions role access has been reconciled: Super Admin and Receptionist View/Create/Edit, Owner View only, Teacher None. Students directory is visible to Super Admin/Receptionist/Owner; Teacher assigned-record access remains denied until its assignment rule exists. Approve/Reject and Pending Delete remain proposed Super Admin actions and are denied to all roles pending explicit owner confirmation. All Branches, multi-role combining and detailed record scopes remain deferred. No next ticket started.

---

## F02-003 latest gapless display correction (2026-10-10)

**IN_REVIEW; owner acceptance pending.** Gapless branch Student 1..N / Admission ADM-1..N now derive from stable persisted insertion order before filtering/sorting. Delete middle/last -> surviving 1..N; next create -> visible N+1. Display serials may change/reuse; internal IDs, foreign keys and historical permanent ADM references/counters stay unchanged. No storage reset, migration, dependency, backend or unrelated work.

**Evidence:** final 186/186 tests (18 files), lint/build PASS with existing warnings; local production-preview Edge middle/last deletion, create, linked Student serial, refresh, filtering and branch isolation PASS. CI/deployment/backend/formal accessibility NOT_RUN. [Exact files and evidence](PROGRESS.md#f02-003-gapless-branch-display-numbering-correction-2026-10-10). Stop after this scope.

---


## F02-003 latest simple CRUD correction (2026-10-10)

**IN_REVIEW; owner acceptance pending.** Existing implementation reused; reported legacy ownership error fixed under latest owner rule. Delete a uniquely linked same-branch Provisional pair even without new markers; ambiguous/broken/Active links remain blocked. No unrelated data, counters, comments, backend or dependencies changed.

**Evidence:** final 176/176 tests (16 files), lint and production build PASS with existing warnings. Local Edge legacy deletion plus Add/View/Edit, cancel, refresh, branch numbering/isolation and keyboard/responsive checks PASS. CI/deployment/backend/formal accessibility NOT_RUN. [Exact files, scope and limitations](PROGRESS.md#f02-003-simple-crud-completion---legacy-deletion-correction-2026-10-10). Stop after F02-003.

---


## F02-003 resumed delivery - Branch-wise Numbering & Working Admissions CRUD (2026-10-10)

**Status: IN_REVIEW; owner acceptance pending.** Latest owner-approved DEMO scope supersedes prior academy-wide allocation/disabled actions: independent durable branch Student/Admission counters; existing shared popup/standalone form; saved View; atomic linked Edit; confirmed owned-pair Delete. Preserve legacy IDs/high-water and unrelated records. Legacy linked ownership is not inferred; unsafe cascades are denied. No new dependencies, permissions, backend, fees or enrollment.

**Evidence:** baseline 151/151 tests PASS; final 174/174 tests (16 files) PASS, 23 new cases. Lint PASS with one existing warning; build PASS with existing size warning. Local production-preview Edge CRUD, cancel, refresh, branch isolation and keyboard/responsive checks at 360/768/1024/1440px PASS. Repository-wide diff whitespace check FAIL on incoming defects; no new trailing whitespace. CI/deployment/backend/formal accessibility NOT_RUN.

[Exact files, library versions, screenshots, migration and limitations](PROGRESS.md#f02-003-resumed-delivery---branch-wise-numbering--working-admissions-crud-2026-10-10).

**Next:** stop. Owner review F02-003; F02-004 Program and Batch Selection requires separate approval.

---

## F02-003 - Admission Popup, Linked Student & Sequential Admission IDs (2026-10-10)

**Status:** IN_REVIEW - owner-authorized browser-local DEMO scope implemented; owner acceptance pending. No backend, production authorization, fees or enrollment changes.

- Continued Antigravity's existing form extraction, popup, version-2 admissions storage and transaction adapter. Did not restart the module or overwrite other working-tree changes.
- Admissions list opens an accessible responsive dialog; `/admissions/new` reuses the same form. Validation focuses the first invalid field; pending submits cannot be repeated or dismissed; storage errors allow retry.
- One commit stores a Pending admission, linked Provisional student and durable counter in the active authorized branch. Immutable internal IDs remain separate from the readable Admission ID; existing legacy student records remain supported.
- **PROVISIONAL DEMO decision:** academy-wide numbering within one browser database, not per branch. Highest durable counter/existing numeric legacy reference determines the next number. Fresh seeds lead to `ADM-4`; highest existing `ADM-1,242` leads to `ADM-1,243`, then `ADM-1,244` across branches. Failed writes consume no number. Counter high-water is retained even if a record is removed; no delete workflow is implemented.
- Safe normalization validates before writing, retains existing records/internal IDs, and rejects conflicting IDs, malformed/corrupt data, unsupported versions and invalid links without resetting saved data.
- Auth/session storage remains separate. `workspace.view` is unchanged; no admission business permissions were granted. This mock UI is not production security.

**Executed evidence:** baseline 127/127 tests (12 files) PASS before edits; final 151/151 tests (14 files) PASS, including 24 new transaction/workflow cases. Lint PASS (0 errors; one pre-existing DashboardPage unused-disable warning). Production build PASS (existing >500 kB bundle warning remains).

**Local production-preview browser checks PASS:** 360/768/1024/1440px popup bounds/no page overflow; Tab containment; Escape/focus restoration; first-error focus/description; formatted success/list IDs; atomic linked storage; actual nested URL reload; North/Central isolation and sequential IDs; standalone shared form; dashboard route and logout denial; no runtime exceptions. Screenshots: [mobile popup](../../artifacts/f02-003/admission-popup-360.png), [desktop popup](../../artifacts/f02-003/admission-popup-1440.png), [saved list](../../artifacts/f02-003/admissions-saved-1440.png).

**Limitations / NOT_RUN:** CI, production deployment, backend/database checks and formal accessibility certification were not run. Native Web Locks serialize cooperating browser tabs where supported (verified in local Edge); the fallback guarantees one JavaScript context only, not concurrent tabs without Web Locks. Browser-local storage can be manually cleared/tampered with; this is not a server sequence or authorization boundary. Duplicate-person matching, real program/batch references, admission approval rules and enrollment remain unapproved/deferred.

**Dependencies:** none installed or changed. Existing React 19.3.0, Router 7.18.4, Radix Dialog 1.2.0, Lucide 1.54.0 and Tailwind 4.3.3 reused. Tests use Vitest 5.0.3, React Testing Library 16.3.3, user-event 14.6.7 and jsdom 30.1.2.

**Next:** stop after F02-003; owner review required. F02-004 - Program and Batch Selection remains a separate roadmap ticket requiring its own approved scope/rules.

---

## F02-002 New Admission Form (2026-10-10)

**Status:** IN_REVIEW - Mock form created with centralized versioned mock storage integration. Created `NewAdmissionPage.jsx` with input validations, navigation and loading states. Refactored `admissionService.js` to rely on `createCollectionService`.
Automated tests updated and passed. Lint and Build PASS.

Next ticket: Stop. Awaiting owner approval for F02-002.

---

## F02-001 Admission Listing and Filters (2026-10-10)

**Status:** DONE - Approved for DEMO scope. Admission listings page with search and status filtering built. Screen mockups submitted.

---

## F01-007 Dashboard Visual Polish & Acceptance (2026-10-10)

**Status:** DONE - Explicitly approved UI milestone delivered and accepted by owner for DEMO dashboard presentation scope only. Replaced CSS charts with interactive Recharts components. Added framer-motion staggered animations with reduced motion support. Fixed Teacher Dashboard Assigned Batches demo data defect. Polished KpiCard spacing and entrance animations.
Automated tests passed. Lint and Build PASS.

Next ticket: Stop. Owner acceptance granted.

---

## F01-006 Premium Teacher Dashboard UI (2026-10-10)

**Status:** IN_REVIEW - Teacher dashboard implemented with premium demo components. Added Instructor Hub layout with Today's Schedule KPIs, Upcoming Sessions list, Recent Teaching Activity, and disabled Instructor Actions. Replaced the "COMING SOON" preview.
Automated tests updated and passed. Lint and Build PASS.

Next ticket: Stop. Awaiting owner approval for F01-002 through F01-006.

---

## F01-005 Premium Receptionist Dashboard UI (2026-10-10)

**Status:** IN_REVIEW - Receptionist dashboard implemented with premium demo components. Added front-desk KPI cards, mock inquiry/activity feed, and disabled quick actions.
Automated tests updated and passed. Lint and Build PASS.

Next ticket: Stop. Awaiting owner approval.

## F01-004 Premium Owner Dashboard UI (2026-10-10)

**Status:** IN_REVIEW - Owner dashboard implemented with premium demo components. Reused KPI cards and added mock chart/activity widgets and disabled quick actions.
Automated tests updated and passed. Lint and Build PASS.

Next ticket: Stop. Awaiting owner approval.

---

## F01-003 Super Admin Dashboard UI (2026-10-10)

**Status:** IN_REVIEW - owner acceptance pending. Super Admin dashboard implemented with premium demo components. Reused KPI cards and added mock chart/activity widgets and disabled quick actions. Multi-role assignment explicitly shows a pending decision fallback.
Automated tests updated. Lint and Build PASS.

Next ticket: Awaiting owner approval for the next F01 ticket or phase.

---

## F01-002 Dashboard Statistics Cards (2026-10-10)

**Status:** IN_REVIEW - owner acceptance pending.
F01-002 IN_REVIEW: Turned the four empty KPI placeholders into responsive, beautiful statistic cards matching the existing design system. Created reusable `KpiCard` component with loading/error states. Integrated real mock data for `Total Students` and `Active Courses` by calling `studentService.list()` and `courseService.list()`, respectively, filtering by active branch. Also added two fictional static cards (`Demo Admissions` and `Demo Revenue`), clearly marked as DEMO, to avoid inventing actual calculations.

Preserved all F01-001 boundaries: no backend edits, no new permissions (`workspace.view` remains), and all routes/auth work correctly. Automated tests, lint, and build PASS.
Next ticket: Pending owner approval for further dashboard features (Charts/Activity). No next coding ticket started.

---

## F01-001 Delivery Review (2026-10-10)

## Foundation Owner Acceptance and F01-001 Authorization (2026-10-09)

**Owner decision: CONFIRMED.** Owner explicitly accepted F00-002A/F00-003 and F00-004 through F00-010 for their implemented, reported-and-tested mock scopes. F00-001 remains accepted. These scoped deliveries are DONE. Parent F00-002 is covered by accepted child routing/layout/auth/permission work; temporary module routing remains deferred. No duplicate implementation is required. Earlier acceptance-pending snapshots are preserved as history.

This acceptance does not verify actual CI, production deployment/SPA fallback, backend security/runtime, real authentication or formal accessibility certification. It does not approve broad business permissions, multi-role policies, All Branches or ERP modules.

**Current authorization:** F01-001 only - shared Dashboard Page Skeleton with heading, active branch, responsive placeholders and existing shell. Dashboard uses existing workspace.view guard; no new permissions/statistics/actions/dependencies. No following ticket authorized.

---

## F00-010 Foundation Review Delivery (2026-10-09)

**Status:** IN_REVIEW - approved verification complete, owner acceptance pending. Whole F00 remains IN_PROGRESS. F00-001 is explicitly accepted DONE; F00-002A/F00-003 retain historical DONE delivery labels without inventing separate formal acceptance. F00-004 through F00-009 remain IN_REVIEW. Parent F00-002 delivered routing coverage is reconciled to F00-002A/003/005/007; no duplicate auth/guards or unapproved module routes added.

One verified defect fixed: batched academy name/theme updates no longer discard the earlier successful change. Initial regression FAIL reproduced; final 113 tests/9 files, lint and build PASS. Local Edge routing, four responsive widths, refresh/logout/invalid-session recovery, keyboard/focus/AX names and reduced motion PASS within documented limits. Remote CI/deployment/backend/production fallback and full screen-reader/WCAG/cross-browser audits NOT_RUN.

[Full ticket/acceptance matrix, files, libraries, evidence and F01 requirements](PROGRESS.md#f00-010--foundation-verification-delivery-2026-10-09). No new dependency or permission; original comments/user edits preserved. Technical mock foundation is locally verified for owner review, not production-ready or formally phase-accepted.

**Next gate:** Owner review/acceptance of outstanding F00 deliveries and separate approval of F01-001 Dashboard Page Skeleton. Role-dashboard selection/permissions, metric scope and All Branches require applicable owner decisions before affected F01 work. Stop; no active next coding authorization.

---

## F00-009 Approved Branding Delivery (2026-10-09)

**Status:** IN_REVIEW â€” owner explicitly approved this scoped implementation; delivery/checks complete, acceptance pending. F00-004 and F00-008 implementation evidence confirmed; their owner acceptance remains pending and they are not DONE. Historical earlier-task statements below remain dated snapshots.

Shared Academy/Theme contexts, isolated versioned branding storage, validated name/local raster logo/accessible HEX color, and sidebar/topbar integration delivered. Defaults: Academy Management System, graduation-cap fallback, existing teal. No Settings editor, new dependency, ERP feature or permission. Existing root/routes/auth/branch behavior preserved.

**Checks:** PASS â€” 112 tests/9 files (83 existing +29 new), lint, build, local Edge responsive checks at 360/768/1024/1440px, branding persistence/fallback and keyboard/auth/route regressions. Initial lint and long-name overflow failures corrected and rerun. Actual CI/backend/production host/screen-reader checks NOT_RUN. [Exact files, contracts and evidence](PROGRESS.md#f00-009--academy-branding-delivery-2026-10-09).

Stop after F00-009. Next planned F00-010 requires separate owner approval; acceptance of F00-009 and earlier unaccepted deliveries remains pending.

---

## F00-001 Accepted / F00-008 Delivery (2026-10-09)

**Owner decision:** F00-001 DONE â€” owner explicitly accepted recovered audit and current verification. Backend runtime/database and actual CI remain NOT_RUN; evidence limitations retained below. This supersedes prior IN_REVIEW/acceptance-pending snapshots.

**F00-008:** IN_REVIEW â€” approved minimal mock service layer delivered; owner acceptance pending. F00-001 dependency satisfied. Separate versioned database, two fictional students/two courses, provisional id/branchId/name, async list/getById/create/update, validation, branch filtering and explicit data-preserving failures. No ERP pages/actions, backend, dependencies or new permissions.

[Contracts, files and actual results](PROGRESS.md#f00-008--mock-data-service-delivery-2026-10-09). Current work ends after F00-008; next proposed F00-009 requires separate owner approval. Auth/session services remain separate and unchanged.

---

## F00-001 â€” Audit Evidence Recovery and Reconciliation (2026-10-09)

**Status:** IN_REVIEW â€” original audit evidence recovered and current repository checks recorded; owner acceptance pending.

Original read-only F00-001 report and supporting command outputs were recovered from the local Codex session log, not from Git-tracked documentation. Current inspection/checks distinguish today's implemented frontend foundation from the original 256-placeholder baseline. [Sources, limitations and actual results](PROGRESS.md#f00-001--recovered-audit-and-current-reconciliation-2026-10-09).

F00-008's missing-audit-evidence blocker is resolved. F00-001 is not marked DONE or owner-accepted; formal dependency acceptance remains pending owner review. The owner already supplied a narrowed F00-008 scope, but this reconciliation explicitly stops before its implementation. Owner acceptance/resume is the next gate; no F00-008 code was written.

Historical BACKLOG/unauthorized statements below are superseded by this evidence record for F00-001 only; retained unchanged as history.

---

## F00-007 â€” Approved Foundation Delivery (2026-10-09)

**Status:** IN_REVIEW â€” approved minimal foundation implemented/verified; owner acceptance pending.

Latest owner scope approves reusable role/permission helpers and accessible denied UI only. SECURITY section 6 matrix remains proposed; section 7.2 multi-role combination remains TBD. Neither is needed for the existing approved common `workspace.view` baseline. No ERP/sensitive grants, role union policy, Super Admin bypass, RoleRoute or module navigation implemented.

Reuses F00-005/F00-006 constants, contexts, mock service/storage and branch controls. Adds shared PermissionGate/PermissionNotice and validated informational branch roles. [Files, libraries and actual checks](PROGRESS.md#f00-007--roles-and-permissions-foundation-evidence-2026-10-09).

Current coding work: stopped after F00-007. Next proposed ticket F00-008 needs its own scoped approval; broader matrix/role-combination work requires explicit policy approval first. Earlier dated statuses below remain historical snapshots.

---

## F00-006 â€” Branch Switcher Delivery (2026-10-09)

**Status:** IN_REVIEW â€” approved frontend mock implementation; owner acceptance pending.

Owner approved in-session topbar switching, centralized persistence/assignment validation, branch role refresh and stale UI invalidation. Reuses F00-005 providers, services, storage and guards; no duplicate branch store or new dependencies. Single authorized branch auto-selects; multiple branches can switch; zero/removed/invalid assignments fail safely. All Branches stays deferred and only `workspace.view` is granted.

Existing user edits were preserved, including current public root text `Academy Managemnt System`; older Hi expectations were reconciled in routing tests without changing App.jsx. [Actual checks and exact files](PROGRESS.md#f00-006--branch-switcher-evidence-2026-10-09).

Current coding work ends after this ticket. Next proposed ticket: F00-007, subject to separate approval of its scope/policies. No ERP/back-end implementation or production-security claim.

---

## F00-005 â€” Approved Delivery (2026-10-09)

**Title:** Mock Auth & Minimal Access Foundation.
**Status:** IN_REVIEW â€” approved implementation and scoped checks complete; owner acceptance pending.
**Current coding work:** None; stopped after F00-005.

The owner's latest explicit approval supersedes the earlier blocked reconciliation proposal below. The approved scope is narrower than that proposal: only initial branch selection/minimum context and the common workspace permission were delivered. No full switcher, All Branches, generic role-combination policy or ERP features.

Delivered: fictional account login/logout, validated restoration, AuthContext/minimum BranchContext, per-branch role arrays, automatic single-branch selection, explicit initial multi-branch selection, `/login`, `/select-branch`, protected `/workspace`, `/unauthorized`; public `/` Hi and existing 404 preserved. `workspace.view` is the only demo grant; all other permissions denied for every role.

Six approved test dev dependencies installed. Final maintained suite: 34 tests in 3 files PASS on local Node 24.16.0 and pinned frontend CI runtime Node 22.22.2. Lint/build and four-width browser/navigation checks PASS. [Detailed evidence](PROGRESS.md#f00-005--completed-implementation-evidence-2026-10-09).

F00-006/F00-007 remain separate backlog tickets; their remaining scope now reuses this foundation. Next coding requires separate approval. No backend or production auth implemented; hosted fallback and actual GitHub Actions execution remain NOT_RUN.

---

## F00-005 â€” Scope Reconciliation (2026-10-09)

**Requested task:** Mock Authentication & Branch Context.
**Status:** BLOCKED â€” affected coding awaits owner approval of the reconciled scope.
**Current work:** Read-only repository/document inspection and this approval proposal; no implementation or dependency installation.

The owner expressly required reporting scope/dependency differences before affected coding. FEATURE_TICKETS currently assigns authentication to F00-005, branches to F00-006 and role/permissions to F00-007. The requested combined task overlaps all three. F00-005's listed dependency is broader F00-002, whose remaining auth/guard scope is still backlog; delivered F00-002A basic routing is available. SECURITY's role matrix and multi-role permission combination are proposals/TBD, not approved grants.

### Concrete Proposed Approval Boundary

- Extend F00-005 only with the requested minimal BranchContext/switcher and role/permission helpers; retain remaining F00-006/F00-007 work as backlog. Use delivered F00-002A/F00-003/F00-004 as the foundation; no declaration that their wider parent scope is complete.
- Fictional demo account selection without passwords; four roles, per-branch role arrays, single-branch auto-selection, explicit multi-branch choice, validated session restoration, logout and user/branch invalidation.
- Provisional demo grant: only `workspace.view` for valid signed-in users with an authorized active branch and at least one recognized assigned role. Unknown and all ERP/sensitive permissions remain denied, including for Super Admin. Do not infer a general multi-role union policy or academy-wide access. All Branches remains excluded pending an explicit demo policy.
- Preserve public `/` showing Hi and standalone 404. Proposed foundation URLs: `/login`, `/select-branch`, `/workspace` (protected shell showing Hi), `/unauthorized`; add mock session/branch controls in the existing design. No ERP module routes.
- Approve six necessary dev dependencies for maintained regression checks: Vitest, React Testing Library, its DOM peer, user-event, jest-dom and jsdom. No framework upgrades, production authentication or backend changes.

[Compatibility evidence and planned verification](PROGRESS.md#f00-005--pre-implementation-findings-2026-10-09). Scope/permissions/route behavior and test-tool installation approval remain pending. No coding started; stop here until the requested approval arrives.

---

## F00-004 â€” Latest Delivery State (2026-10-09)

**Approved task:** Premium Responsive Design System.
**Status:** IN_REVIEW â€” implementation and scoped verification complete; owner acceptance pending.
**Current coding work:** None; stopped after F00-004. No next ticket authorized.

The owner's explicit F00-004 request supersedes earlier draft/no-coding statements and DOC-SYNC-001's proposed-only visual alignment boundary. Previous records below remain historical snapshots.

Delivered: reference-aligned teal/cool surfaces, self-hosted Plus Jakarta Sans, 256px desktop sidebar, 64px topbar, 12px cards, five shadcn-derived UI components, accessible Radix mobile drawer, reduced motion and preserved root/404/history behavior. No auth, dashboard logic, branch/session workflow or module routes added.

[Actual checks and dependencies](PROGRESS.md#f00-004--verification-evidence-2026-10-09); [approved theme details](../04-FRONTEND/DESIGN.md#f00-004--approved-design-system-2026-10-09). Remaining work: owner review, maintained test infrastructure and deployed-host SPA fallback verification. Future implementation needs separate approval.

---

## DOC-SYNC-001 â€” Latest Task State (2026-10-09)

**Status:** DONE â€” documentation sync and reference review delivered.
**Authorization:** Documentation only; no active coding ticket, package changes or commits.
**Milestone:** F00 partially implemented; full foundation acceptance remains pending.

This dated record supersedes earlier current-state and authorization statements retained below as historical planning. The owner's explicit F00-002A and F00-003 instructions authorized their limited scopes despite the older draft documentation gate. DOC-002's wider review is not claimed complete.

| Ticket | Reported delivery | Remaining boundary |
|---|---|---|
| F00-002A | DONE â€” basic React Router routing; `/` displays Hi; centralized paths and accessible wildcard Not Found | Production host SPA fallback unconfigured/unverified; parent F00-002 auth/guard/Unauthorized/module-route scope remains deferred |
| F00-003 | DONE â€” approved premium shell scope; reusable sidebar/topbar/page header, CSS tokens, responsive drawer and reduced motion | Neutral styling remains provisional; no auth, permissions, branch logic or dashboard/module implementation |

Installed in those implementation tickets: `react-router-dom` 7.18.4 for AppRouter and NotFoundPage; `lucide-react` 1.54.0 for Sidebar and Header. No libraries installed during DOC-SYNC-001.

Prior execution reports recorded lint, build and scoped routing/layout/browser checks as PASS. Automated project test suites are NOT_CONFIGURED; deployment fallback verification is NOT_RUN. Those implementation checks were not rerun during this documentation task. See [the detailed progress evidence](PROGRESS.md#doc-sync-001--delivery-evidence-2026-10-09).

The Lovable reference was accessible in Edge. Verified observations and proposed differences are in [the design review](../04-FRONTEND/DESIGN.md#doc-sync-001--lovable-reference-review-2026-10-09). Current authorization ends with this report; proposed visual changes require a separately approved ticket. No next coding ticket has started.

---

## 1. Purpose

This document manages the currently authorized work and the near-term task backlog for the Academy Management ERP.

It identifies:

- The current active task.
- Task ownership and scope.
- Authorized actions.
- Files permitted to change.
- Dependencies.
- Blockers.
- Acceptance criteria.
- Required verification.
- Next planned work.

This document is the operational task register for Codex, Antigravity and authorized developers.

It does not replace FEATURE_TICKETS.md, which owns detailed implementation tickets.

## 2. Mandatory Task Rules

1. Work only on an explicitly authorized task.
2. Read AGENTS.md and the relevant approved documentation before modifying code.
3. Inspect current repository status before changes.
4. Do not start multiple major implementation tickets simultaneously.
5. Do not perform unrelated changes.
6. Preserve existing working files.
7. Do not invent missing business requirements.
8. Do not implement unresolved security-sensitive functionality.
9. Run applicable checks.
10. Record the actual outcomes.
11. Update PROGRESS.md after verification.
12. Stop before the next unapproved task.

A planned task is not automatically an authorized task.

## 3. Task Status Definitions

| Status | Meaning |
|---|---|
| BACKLOG | Planned, not approved |
| READY | Approved and dependencies satisfied |
| IN_PROGRESS | Authorized work in progress |
| BLOCKED | Cannot continue until a dependency is resolved |
| IN_REVIEW | Work awaiting verification or acceptance |
| DONE | Work verified and accepted |
| DEFERRED | Intentionally postponed |
| CANCELLED | Task cancelled by authorized decision |

Task statuses must reflect actual evidence.

---

# 4. Historical Active Task â€” DOC-002

**Task ID:** DOC-002
**Title:** Review and Reconcile ERP Documentation
**Type:** Documentation
**Status:** IN_PROGRESS â€” Project Owner Review
**Priority:** P0
**Milestone:** M0
**Implementation Authorization:** Documentation only
**Application Coding Authorization:** None

### 4.1 Goal

Review, improve and reconcile the project documentation before approving frontend implementation tickets.

The purpose is to establish a consistent, professional specification for:

- Product requirements.
- System behavior.
- Technical architecture.
- Visual design.
- Database modeling.
- Security.
- Frontend integration.
- Engineering quality.
- Feature planning.
- Project decisions.
- Verified progress.

### 4.2 Current Scope

- Review the existing documentation drafts.
- Preserve confirmed project decisions.
- Expand incomplete documentation where requested.
- Identify contradictions between documents.
- Maintain unresolved items as TBD.
- Ensure AI-agent instructions reference authoritative specifications.
- Prepare the project for controlled F00 frontend development.

### 4.3 Allowed Files

Documentation files under:

`docs/`

And, when specifically authorized:

`AGENTS.md`

`README.md`

### 4.4 Prohibited Changes

During DOC-002:

- Do not modify React application functionality.
- Do not modify Express application functionality.
- Do not create MongoDB collections.
- Do not implement authentication.
- Do not add dependencies.
- Do not perform destructive refactoring.
- Do not deploy the application.
- Do not begin F00/F01 feature implementation.
- Do not modify Git history or discard user changes.

### 4.5 Completion Criteria

DOC-002 may be marked DONE when:

1. Required documentation exists.
2. Relevant documents contain substantive requirements.
3. Confirmed, proposed, TBD and deferred decisions are distinguishable.
4. Cross-document contradictions have been reviewed.
5. Markdown links have been checked.
6. The master AI-agent instructions reference the correct documents.
7. Major blockers are recorded.
8. The project owner accepts the documentation baseline.
9. Actual repository changes are verified.
10. PROGRESS.md is updated.

---

# 5. Documentation Review Tracker

The following tracker records draft preparation and review needs.

**Important:** "Expanded draft provided" does not establish that the updated content has been saved, committed or formally approved.

| Document | Review State |
|---|---|
| PRD.md | Expanded draft provided |
| SYSTEM_DESIGN.md | Detailed review pending |
| ARCHITECTURE.md | Expanded draft provided |
| ERD.md | Expanded draft provided |
| DESIGN.md | Expanded draft provided |
| SECURITY.md | Expanded draft provided |
| FRONTEND_INTEGRATION.md | Expanded draft provided |
| RULES.md | Expanded draft provided |
| FEATURE_TICKETS.md | Expanded draft provided |
| MEMORY.md | Expanded draft provided |
| PROGRESS.md | Expanded draft provided |
| TASKS.md | Current revised draft |
| docs/00-CORE/README.md | Review pending |
| AGENTS.md | Review pending |
| Root README.md | Review if required |

### Review Notes

- Documents must be checked for consistency.
- Proposed technical decisions must not be mislabeled as confirmed.
- Existing approved requirements must not be silently overwritten.
- No implementation-ready status should be assigned without proper approval.

---

# 6. Historical Task â€” DOC-001

**Title:** Initial Documentation Scaffolding
**Status:** Previously Reported Complete â€” Historical
**Date:** 2026-10-09

### Previously Reported Work

- Inspected the initial repository structure.
- Preserved existing introductory comments.
- Prepared initial PRD and System Design drafts.
- Created documentation scaffolds.
- Established documentation index and agent guidance.
- Checked required sections and local Markdown links.
- Reported preservation of application and workflow files.

### Verification Boundary

These are previously reported results from the initial documentation task.

This TASKS.md revision does not independently rerun the repository checks.

Do not reinterpret historical documentation work as implementation of ERP features.

---

# 7. Historical Blockers and Dependencies â€” Before F00 Delivery

## BLOCK-001 â€” System Design Review

**Status:** OPEN

SYSTEM_DESIGN.md requires detailed review against the PRD and proposed data relationships.

## BLOCK-002 â€” Agent Instructions Review

**Status:** OPEN

AGENTS.md must be reviewed to ensure Codex and Antigravity follow the documentation, ticket boundaries and mandatory quality gates.

## BLOCK-003 â€” Cross-Document Consistency

**Status:** OPEN

Compare:

- PRD.md
- SYSTEM_DESIGN.md
- ARCHITECTURE.md
- ERD.md
- DESIGN.md
- SECURITY.md
- FRONTEND_INTEGRATION.md
- RULES.md
- FEATURE_TICKETS.md

Identify conflicting terminology, responsibilities, IDs, permissions, statuses and data contracts.

## BLOCK-004 â€” Role Permission Decisions

**Status:** OPEN

Detailed role permissions are not yet approved.

Before dependent frontend tickets:

- Confirm necessary navigation visibility.
- Confirm approved role-specific dashboard content.
- Define an explicitly approved mock permission baseline.

Production permission approval will be required before protected backend operations.

## BLOCK-005 â€” Visual Design Verification

**Status:** OPEN

Exact values from the Lovable visual reference require inspection or approved screenshots.

## BLOCK-006 â€” Repository Audit

**Status:** REQUIRES FRESH VERIFICATION

Before implementation, inspect:

- Existing Client structure.
- Installed frontend dependencies.
- Existing working components.
- Existing routing and styling.
- Available test scripts.
- Git status.
- Current build/lint results.

Do not assume historical repository observations remain current.

---

# 8. Near-Term Documentation Backlog

| Task ID | Description | Status |
|---|---|---|
| DOC-003 | Review SYSTEM_DESIGN.md | BACKLOG |
| DOC-004 | Review AGENTS.md | BACKLOG |
| DOC-005 | Review docs/00-CORE/README.md and root README.md | BACKLOG |
| DOC-006 | Perform cross-document consistency audit | BACKLOG |
| DOC-007 | Resolve essential F00/F01 blockers | BACKLOG |
| DOC-008 | Approve documentation baseline | BACKLOG |
| DOC-009 | Prepare and approve first executable F00 ticket | BACKLOG |

These tasks are planning entries.

The project owner must authorize work before an agent performs tasks outside its current scope.

---

# 9. Frontend Development Backlog

The frontend will follow the agreed phase sequence.

| Phase | Module | Task Status |
|---|---|---|
| F00 | Foundation | IN_PROGRESS â€” limited routing/layout delivered |
| F01 | Dashboard | BACKLOG |
| F02 | Admissions | BACKLOG |
| F03 | Students | BACKLOG |
| F04 | Courses & Batches | BACKLOG |
| F05 | Faculty & Classes | BACKLOG |
| F06 | Fees | BACKLOG |
| F07 | Finance & Payroll | IN_REVIEW |
| F08 | Demo Classes | BACKLOG |
| F09 | Assets | BACKLOG |
| F10 | Reports | BACKLOG |
| F11 | Branch Management | BACKLOG |
| F12 | User Management | BACKLOG |
| F13 | Settings & Integrated Frontend QA | BACKLOG |

### Development Rules

- F00 establishes the shared application foundation.
- F01 implements the role-aware Dashboard.
- Subsequent phases implement individual modules.
- Each phase is divided into smaller feature tickets.
- A module must not begin merely because it appears in the roadmap.
- All implementation must follow FEATURE_TICKETS.md.
- Relevant tests must pass before phase acceptance.

Basic role and branch infrastructure belongs in F00 even though full administrative screens are scheduled later.

---

# 10. Historical Proposed First Frontend Task

**Ticket:** F00-001
**Title:** Existing Frontend Project Audit
**Status:** BACKLOG â€” Not Yet Authorized
**Priority:** P0
**Code Modification:** Not required for initial audit

### Intended Scope

After approval:

1. Inspect existing React project.
2. Identify routing and styling approaches.
3. Identify dependencies.
4. Inspect mock data or existing services.
5. Record project structure.
6. Check Git status.
7. Run available baseline build and lint checks.
8. Identify changes needed for F00 foundation.
9. Report findings.
10. Stop before implementing F00-002.

### Acceptance Criteria

- Existing project behavior is understood.
- Existing source files are preserved.
- Baseline test/build results are recorded.
- Potential conflicts are reported.
- No unrelated feature is implemented.

F00-001 is a proposed next development task, not current permission to modify the application.

---

# 11. Task Execution Protocol

Every authorized task must follow this sequence.

### Step 1 â€” Identify the Task

Read the exact task ID, scope and approval.

### Step 2 â€” Read Documentation

Read AGENTS.md, RULES.md and the relevant authoritative specifications.

### Step 3 â€” Inspect Existing Work

Check affected files, project state, dependencies and existing functionality.

### Step 4 â€” Plan

Identify expected file changes, risks and required tests.

### Step 5 â€” Execute

Perform only the authorized scope.

### Step 6 â€” Verify

Run relevant checks and document results.

### Step 7 â€” Update Tracking

Update TASKS.md, PROGRESS.md and applicable ticket status.

### Step 8 â€” Stop

Do not automatically proceed to an unapproved ticket.

---

# 12. Task Completion Report

At the end of each task, the assigned agent must report:

**Task ID:** Identifier

**Task Title:** Name

**Status:** Actual status

**Implemented/Reviewed:** What was completed

**Changed Files:** Exact affected paths

**Tests or Checks:** Actual commands and results

**Known Issues:** Remaining defects or blockers

**Documentation Updated:** Relevant files

**Next Dependency:** What must happen next

**Approval Required:** Yes or No

The report must contain verified facts rather than invented progress.

---

# 13. Client Change Requests

The academy client may request small adjustments during development.

When a change is received:

1. Record the request.
2. Determine the affected requirements.
3. Assess affected pages, services, models and APIs.
4. Obtain necessary approval.
5. Update the relevant authoritative documentation.
6. Create or revise a ticket.
7. Implement the approved change.
8. Run relevant regression tests.
9. Record the result.

Do not interpret a small change as permission to redesign unrelated modules.

---

# 14. Historical Approval Boundary â€” Before Explicit F00 Authorizations

### Authorized

Documentation review and revision under DOC-002, subject to the project owner's instructions.

### Not Yet Authorized

- Implementation of F00 tickets.
- Dashboard coding.
- Other frontend feature implementation.
- Backend business API development.
- MongoDB schema implementation.
- Production deployment.

### Client Approval

The general Academy ERP proposal was accepted by the client according to the project owner's report.

This does not automatically authorize every unconfirmed technical or business rule.

---

# 15. Open Questions (TBD)

1. Has the latest revised documentation been saved in the repository?
2. Has SYSTEM_DESIGN.md been fully reviewed?
3. Has AGENTS.md been approved?
4. Have cross-document conflicts been resolved?
5. What is the approved minimum F00 permission baseline?
6. Which Lovable screenshots or styles are authoritative?
7. Who approves individual tickets?
8. What testing infrastructure is currently available?
9. Which client business rules must be resolved for F01?
10. When will the project owner authorize F00-001?

Unresolved questions must remain visible.

---

# 16. Related Documents

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md)
- [Database Design](../01-ARCHITECTURE/ERD.md)
- [Visual Design](../04-FRONTEND/DESIGN.md)
- [Security](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)
- [Engineering Rules](RULES.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Project Memory](MEMORY.md)
- [Verified Progress](PROGRESS.md)

---

## 17. Historical Task Summary â€” Before F00 Delivery

**Active Task:** DOC-002 â€” Documentation Review and Reconciliation

**Current Stage:** Documentation Preparation

**First Planned Development Ticket:** F00-001 â€” Existing Frontend Project Audit

**Next Major Development Phase:** F00 â€” Frontend Foundation

**Current Application Implementation Authorization:** None

**Required Next Action:** Finish documentation review and approve the first executable frontend ticket.

---

**Document Status:** ACTIVE â€” Task Register

**Governing Principle:** One clearly authorized task, focused execution, verifiable results and controlled progression.

## F03-001 limited directory order exception (2026-10-11)

CONFIRMED owner authorization: read-only DEMO Students Directory before F02-004; defer enrollment dependency only for listing. /students and sidebar now display saved branch students, gapless serials and linked Admission references. Missing legacy status is Active presentation only; stored records unchanged by directory reads. Existing workspace.view only; no production permissions. IN_REVIEW, acceptance pending. F02-002/F02-003 acceptance remains pending. Final 198/198 tests (19 files), lint/build and local Edge four-viewport/keyboard/admission-link/refresh/branch/logout checks PASS; actual CI/deployment/backend/formal accessibility NOT_RUN. No dependencies installed. [Full evidence](PROGRESS.md#f03-001-limited-demo-students-directory-2026-10-11). Next F02-004 requires separate approval; all remaining tickets preserved.
## F02-004 approved DEMO course/batch selection (2026-10-12)

CONFIRMED scope: branch-specific mock courses retained; Course required, Batch optional; minimal batch {id, branchId, courseId, name}; same shared popup/standalone form; admission courseId and optional preferredBatchId with legacy course text retained. No automatic name-to-ID mapping. Safe additive version-3 envelope behind existing mock storage key adds minimum batches from saved courses, preserves valid records/links/counters and never reseeds existing valid batches. New/changed selections validate branch/course/batch relations atomically; unchanged legacy/unresolved references may survive unrelated edits and display explicit unresolved labels. Session/branch guards remain DEMO UX safeguards; workspace.view unchanged. No backend, permissions, fees/enrollment/schedules/capacity rules or dependencies added.

IN_REVIEW; acceptance pending. F02-002/F02-003/F03-001 also remain acceptance pending. Baseline 198/198 PASS; final 223/223 tests (21 files; 25 new), lint/build and local Edge shared popup/View/Edit/optional batch/refresh/branch/keyboard/360-768-1024-1440 checks PASS. Existing lint/bundle warnings remain; actual CI/deployment/backend/formal accessibility NOT_RUN. [Full files, libraries, migration limitations and evidence](PROGRESS.md#f02-004-program-and-batch-selection-delivery-2026-10-12). Next F02-005 Admission Status Workflow needs separate owner decisions/approval; no following ticket started.
## F02-005 owner-approved DEMO status decisions (2026-10-12)

CONFIRMED owner approval: Pending -> Approved/Rejected only, explicit confirmation, same-status idempotency, no opposite transitions/reopening; canonical active-branch Owner/Super Admin only (any approved eligible role membership, never dashboard preview authority). Unique reciprocal same-branch linked Provisional student required; legacy unlinked/unsafe records refuse without changes. Student remains Provisional. Optional rejection reason; status plus append-only actor/time history committed atomically. Decided admissions, including existing Approved/Rejected records, are read-only and cannot be physically deleted. These latest rules supersede prior generic Edit/Delete availability for decided DEMO records only; existing comments/history preserved. workspace.view remains sole production-independent demo baseline, no real permission grant/bypass/backend change.

Implemented IN_REVIEW; acceptance pending, as are F02-002/F02-003/F02-004/F03-001. Existing version-3 storage accepts optional embedded statusHistory without reset/backfill; current identity/branch and policy validated at service/database boundaries, stale/conflicting operations fail without writes. Final 248/248 tests (23 files; 25 new), lint/build and local Edge status/keyboard/four-viewport/persistence checks PASS; existing warnings remain. Actual CI/deployment/backend/formal accessibility NOT_RUN. [Exact files/libraries/history contract/evidence](PROGRESS.md#f02-005-admission-status-workflow-delivery-2026-10-12). Next F02-006 Admission-to-Enrollment Mock Integration requires separate scope and owner approval. Stop after F02-005.

## F02-005 final Super Admin action authority (2026-10-12)

Owner-confirmed implementation is IN_REVIEW: active-branch Super Admin has View/Create/Edit/Approve/Reject/Pending Delete; Receptionist has View/Create/Edit; Owner has View; Teacher has no Admissions access. Named permissions are enforced in the UI, service and mock database without a broad bypass. Decided records remain read-only/non-deletable; linked Students remain Provisional; status history and safe Pending linked-pair deletion remain atomic. Full regression 246/246 tests in 23 files PASS, lint PASS with one existing DashboardPage warning, and production build PASS with the existing bundle-size warning. Manual browser/responsive recheck for this final authority correction, CI, deployment, backend security and formal accessibility certification are NOT_RUN. No dependency or backend change. Owner acceptance remains pending; do not mark DONE.

## F03-001 through F03-007 Students Module (2026-10-12)

**Status:** IN_REVIEW for owner acceptance; no F04 work started.

Students directory now shows saved selected-branch DEMO students with stable branch serials, linked admission references, search/status/course/batch filters, sorting, counts and clear-filters behavior. Student row/name/actions open the immutable-ID, branch-scoped profile. Profile shows student/guardian/academic/admission data, enrollment history and Active status, plus truthful no-fee/no-attendance-data states. Authorized Super Admin and Receptionist can edit saved name and linked admission details; IDs, status, branch, course, batch and enrollment references remain protected. Owner remains read-only and Teacher denied by the existing permission contract. Empty/loading/error/retry states and responsive mobile/table layouts are present.

Targeted validation: 72/72 tests across 5 files PASS; focused ESLint PASS; one production build PASS (3010 modules). Existing bundle-size warning (>500 kB) remains. Browser viewport/responsive manual QA NOT_RUN. No packages installed. Fee/attendance data views remain empty until approved data services exist. Owner acceptance pending.

## F05-001 through F05-007 Faculty & Classes (2026-10-12)

**Status:** IN_REVIEW; owner acceptance pending. Implemented only in isolated branch `feature/f05-faculty-classes` from baseline `b26c888014c018678f23e2ef6e992bd804211f0b`.

Branch-scoped directory lists explicit Teacher role accounts; profile exposes only saved account identity and honest empty professional/assignment/schedule sections. Subject and teacher-batch writes remain blocked: subject model, assignment granularity and write authority are unresolved. Class schedule awaits the shared F04 timetable contract. Class roster displays only same-branch Active Enrollment → Student → Batch links; Teacher class access remains deny-by-default until verified assignments and record policy exist.

Targeted tests: 34/34 PASS across 5 files (F05 services/UI, permissions, F02 enrollment regression and auth routes). Focused ESLint PASS. One production build PASS (3014 modules); existing >500 kB bundle warning remains. No package manifest changes; locked dependencies restored in this separate worktree. Browser/responsive manual QA NOT_RUN. No commit, merge or push. F04 shared merge surfaces: `Client/src/routes/AppRouter.jsx`, `Client/src/routes/routePaths.js`, `Client/src/components/Layout/Sidebar.jsx`, `Client/src/constants/permissions.js`; `mockDatabase.js` and F04 timetable files were not changed.
# F05-005 — Class Scheduling — IN_REVIEW

Owner-approved single-date DEMO Class CRUD, overlap checks, branch/role enforcement and Dashboard Upcoming Classes integration implemented on 2026-10-13. Focused tests 30/30, targeted ESLint and production build passed. Owner acceptance pending.

# F06 Fees + Finance + Dashboard integration — IN_REVIEW

Owner-approved connected browser-local DEMO workflow implemented; final QA added branch-scoped CSV exports, verified-payment-only projections, local-date boundaries, the Finance mobile containment and Dashboard role-selector wrapping. Isolated browser workflow PASS: enrollment, challan, partial/final payments, receipt projection, expense totals, branch isolation and refresh persistence. Receipt content rendered with print media; native preview and actual CSV download events NOT_RUN. Responsive checks at 360/768/1024/1440 NOT_RUN because the browser harness retained a 450px CSS viewport; Fees/Finance were checked at 450px. Focused tests 58/58 across 7 files, targeted lint and one production build PASS (existing large-chunk warning). Owner acceptance remains pending; no backend, gateway, refunds, reversals, discounts or installment policy implemented.

# Connected Academic Configuration + New Admission — IN_REVIEW

Owner-approved implementation complete in the dev workspace: saved branch academic configuration feeds the locked New Admission two-column workflow and read-only challan preview. Focused tests, lint and build pass. Pending owner acceptance and manual responsive browser review; no commit/push.

# Final Admissions completion review — IN_REVIEW (2026-10-14)

The selected Batch card now follows the approved light-blue/teal reference treatment, and the Faculty Mapping section reports overlaps only from matching saved single-date classes. Connected focused tests, targeted lint and one build pass; fresh browser capture was blocked by automated approval review. Discounts, installment policy and independent faculty-assignment writes remain policy/model blocked.

# F04 Course/Batch table actions — IN_REVIEW (2026-10-14)

Course and Batch table rows now use a three-dot View/Edit/Delete menu. Super Admin deletion is confirmation-gated and atomically refuses linked academic, admission, enrollment and class records; read-only roles retain View only. Focused tests 10/10 and targeted lint pass; owner acceptance pending.

# F02/F03 enrolled student deletion correction — IN_REVIEW (2026-10-14)

Fixed enrolled Admission deletion with linked financial records and added Super Admin Delete Student in the Students action menu. The atomic transaction removes only the verified admission-owned student, enrollment, challan and receipts; unrelated records and counters remain. Focused tests 21/21 and targeted lint pass.

# F04 academic delete-flow correction — IN_REVIEW (2026-10-14)

Course/Batch action menus now close after selection, outside click and Escape, and every new dialog clears stale delete errors. Academic Stream and Subject cards now expose the same role-aware View/Edit/Delete menu. Unlinked streams, courses, batches and subjects delete through the existing branch-scoped service; linked records remain protected without cascade. Focused tests 12/12 and targeted ESLint pass; browser QA and owner acceptance remain pending.

# F04 academic relationship visibility — IN_REVIEW (2026-10-14)

Courses & Batches now presents saved Stream → Course → Subject/Batch relationships through academic portfolio cards, linked course chips, portfolio counts, a subject directory with parent Course/Stream, and explicit Course table relationship columns. Existing CRUD, permissions and storage contracts are unchanged. Focused tests 13/13 and targeted ESLint pass; browser visual QA and owner acceptance remain pending.

Owner layout correction: desktop now places the Course Subjects table in the wider left column and Academic Portfolio cards in the right column; smaller screens stack the sections. Focused page tests 9/9 and targeted ESLint pass.

Compact polish removes Course Subjects horizontal scrolling through fixed responsive columns and wrapped smaller text. Portfolio cards are denser; when more than four streams exist, only the portfolio card list scrolls vertically. Focused page tests 9/9 and targeted ESLint pass.

Final table correction places the Courses/Batches tabs and directory directly below Course Subjects in the left column. Both directories use compact fixed columns without horizontal scrolling, and three-dot menus are smaller and no longer clipped by the final table row. Focused page tests 9/9 and targeted ESLint pass.

Both Course Subjects and Courses/Batches directories now include compact 5/10/25/50 rows-per-page controls, visible ranges, numbered pages and previous/next controls. The desktop table column is wider and the Academic Portfolios sidebar is reduced to 17rem. Focused page tests 10/10 and targeted ESLint pass.

Pagination controls were reduced further, while the Courses/Batches table now uses explicit content-based column widths: wider identity/relationship columns and narrower enrolled/actions columns. Compact headers and single-line truncated cells prevent row wrapping and horizontal scrolling. Focused page tests 10/10 and targeted ESLint pass.

# F01/F06 Dashboard daily cashflow correction — IN_REVIEW (2026-10-14)

The Super Admin cashflow chart now plots active-branch verified receipts and posted expenses instead of static empty monthly buckets. Daily uses four-hour buckets; weekly, monthly, custom and trailing-year views use matching period buckets and totals. The stale Dashboard quick-action assertion was aligned with the approved inline `/admissions` route. Focused tests 17/17 and targeted ESLint pass. Browser QA and owner acceptance remain pending.
# F02/F04/F06 Connected Demo Workflow (2026-10-13)

**Status:** IN_REVIEW; configured academic fee selection now reaches enrollment and official F06 challan validation without creating financial records before approval/enrollment. Focused verification and isolated responsive browser layout evidence are recorded in PROGRESS.md. Owner acceptance pending.

# F11/F12/F13 Branches, Users, Settings and Frontend QA (2026-10-14)

**Status:** IN_REVIEW; owner acceptance pending. F11 branch directory/create/edit/lifecycle/license/staff summaries and F12 staff listing/create/edit/multi-branch roles/status/permission matrix are connected to mock authentication and active-branch selection. F13 exposes one responsive Settings surface backed by shared branding, F04 academic sources, real users/branches and explicit unavailable notification states. Backend authorization, file upload storage, SMS delivery and production authentication remain blocked.
F11-F13 continuation verification (2026-10-15): focused F04/F02/F09-F13 regressions PASS 92/92 and targeted ESLint PASS after resolving three legacy contract assertions. Status remains IN_REVIEW.
F09-F13 one-shot functional QA (2026-10-15): confirmed integration defects fixed; focused cross-module tests PASS 107/107, targeted ESLint PASS, production build PASS, HTTP smoke PASS. Interactive browser automation and owner acceptance remain pending; tickets stay IN_REVIEW.

## Academic assignment data-flow correction (2026-10-17) ? IN_REVIEW

Owner authorized main dev changes with UI styling frozen. Existing assignment dialog now selects saved field/course dependencies, supports saved-assignment edit/remove, and shares facultyService with Courses & Batches. Course detail callbacks retain batch/subject IDs. Removed fabricated faculty timetable/enrollment/KPI fallbacks; course/batch counts use unique active student IDs and faculty reach uses a union. Assignment writes require classes.manage, weekdays normalize and missing update IDs are rejected.

Verification: focused handler integration proves create/edit, second assignment retention, conflict rejection, enrolled-vs-pending counts, academic projection, Admissions teacher/room rendering and selective removal. Existing Faculty workflow, daily clock, Dashboard, Admissions enrollment, academic configuration and financial service checks passed in focused runs. Targeted ESLint and one production build passed; existing large bundle warning remains. Browser NOT_RUN (no browser automation tooling available); owner browser acceptance pending. No commit/push or owner storage changes.


## Staff deletion correction (2026-10-17) - IN_REVIEW
Owner authorized built-in and created staff deletion through Faculty and Users. Shared permission-checked deletion preserves linked schedules/demo sessions/assets, blocks self/last branch administrator deletion and requires management access to all assigned branches. Deleted built-in identities persist through organization tombstones without resetting operational records. Users exposes explicit confirmation. Focused organization/Faculty tests: 13/13 PASS; targeted ESLint PASS; isolated Edge Users Cancel/Delete/refresh PASS. Owner browser acceptance pending; no commit/push.


## Direct role dashboard (2026-10-17) - IN_REVIEW
Removed Dashboard role-selection screen and top presentation role buttons at owner request. Dashboard resolves the current branch assigned role automatically (Super Admin, Owner, Receptionist, Teacher priority for multiple roles); sidebar authorization remains unchanged. Dashboard and financial regression tests 17/17 PASS; targeted ESLint PASS. Account impersonation/preview behavior requires clarification and is not implemented.


## Explicit mock staff account switch (2026-10-17) - IN_REVIEW
Owner clarified actual login switch. Users Open Account requires confirmation, then replaces the mock session with the enabled target staff identity and its authorized branch context. Target permissions apply without retained administrator access; returning requires ordinary demo login. Disabled/unassigned targets are rejected. Auth/Dashboard tests 42/42 PASS; targeted ESLint PASS; isolated Edge Cancel/Confirm/teacher tabs/refresh PASS. Corrected stale auth test reference-identity assertion to compare canonical user values. Production backend impersonation is not implemented. No owner storage changes, commit or push.


Topbar compact-control adjustment (2026-10-17, IN_REVIEW): sidebar toggle and fullscreen controls now use borderless 32px sizing; desktop sidebar toggle moved 8px left. Existing handlers unchanged. Targeted Header ESLint and diff check PASS; visual browser verification NOT_RUN.


Topbar follow-up (2026-10-17, IN_REVIEW): search hover retains card background; sidebar toggle centered across the sidebar/topbar boundary in both expanded and collapsed desktop states. Targeted ESLint PASS; isolated Edge computed hover background and both boundary-center checks PASS.


Topbar layering correction (2026-10-17, IN_REVIEW): topbar z-index 30 clears sidebar layer 20 so the boundary toggle remains fully visible/clickable; search maximum width reduced to 384px. Targeted ESLint PASS; isolated Edge toggle hit-test and search width PASS.


Sidebar motion correction (2026-10-17, IN_REVIEW): global active-button scale overrode the toggle centering transform and caused a press jump. Scoped override preserves centering while pressed; sidebar width/body margin transitions removed for immediate toggling. Isolated Edge press-position and instant-toggle checks PASS.


Compact branch dropdown (2026-10-17, IN_REVIEW): owner-requested 176px maximum trigger with themed custom campus options, selected checkmark, outside click/Escape/Tab close and arrow/Home/End keyboard navigation. Existing authorized branch service unchanged. Dashboard/Students branch regression tests 28/28 PASS; targeted ESLint PASS; isolated Edge actual branch switch and keyboard close PASS. Sidebar easing now 320ms per owner follow-up.


Global search input alignment (2026-10-17, IN_REVIEW): search icon and single-line ESC badge positioned inside input with reserved text padding. Targeted ESLint PASS; isolated Edge bounding checks PASS. Branch dropdown menu now matches trigger width per owner follow-up.


Faculty class time/shift progress (2026-10-17, IN_REVIEW): saved class/assignment displays use 12-hour AM/PM and start-time Morning (before noon)/Evening labels. Shift cards retain actual seat-capacity reporting and add clock-derived scheduled-minutes elapsed progress, not claimed teaching/syllabus completion. Existing minute clock updates progress. Focused time/shift/Faculty tests 11/11 PASS. Targeted lint PASS on utilities, profile and schedule panel; existing unused imports in FacultyProfileModal and set-state-in-effect in FacultyClassesPage remain. Browser NOT_RUN. Native time entry remains browser/OS localized; stored HH:mm values unchanged.


Faculty card/progress correction (2026-10-17, IN_REVIEW): timetable card header/room/timing bounded with single-line truncation/tooltips; student action on a separate contained row. Roster and full-profile assignment deletion now require Cancel/Delete dialogs (existing modal confirmation retained); single-date roster deletion uses class service. Weekend classes now contribute to actual Morning/Evening cards as well as explicitly described weekend summary. Clarified scheduled time elapsed versus enrolled/total seat occupancy; only today schedules count. Focused tests 11/11 PASS, helper/profile ESLint PASS; pre-existing roster set-state-in-effect lint error remains. Browser verification incomplete (fixture/selection timeouts), not claimed PASS.


Dashboard class period labels (2026-10-17, IN_REVIEW): daily cards show Morning before noon, Afternoon noon to before 17:00, Evening from 17:00 based on saved start time; invalid time is explicit. Existing Faculty two-shift grouping unchanged. Focused time/Dashboard tests 14/14 PASS; targeted ESLint reports existing unused MoreVertical and feeService imports in Dashboard; browser NOT_RUN.


Faculty session banner (2026-10-17, IN_REVIEW): compact nonwrapping status badge, working Schedule link, removed hardcoded In Progress. Status resolves selected teacher recurring/single-date saved classes for today and existing minute clock (Asia/Karachi); no classes shows explicit empty status. Focused Faculty/shift tests 11/11 PASS; existing roster effect lint issue remains; browser NOT_RUN.


Faculty current-UI consolidation (2026-10-17, IN_REVIEW): removed session Schedule link and obsolete ClassSchedulePanel component/rendering; legacy schedule URL redirects to current Faculty directory, retaining saved sessions/services. Profile footer Batch Students replaced by permission-checked Add Class wired to existing assignment modal with selected teacher and new-assignment mode. Per-slot View Students retained. Syllabus row spacing adjusted; completion unavailable because no authoritative completed syllabus records exist. Faculty/Dashboard regressions 18/18 PASS; router lint PASS, existing roster set-state-in-effect lint issue remains. Browser NOT_RUN. No commit/push or saved data changes.


Faculty relationship visibility (2026-10-17, IN_REVIEW): timetable cards show saved Batch name and no Active Slot badge (Dashboard selection remains screen-reader context). Full profile subjects/batches show saved Field > Course > Batch > Subject relationships and authoritative batch enrolled counts; schedule table includes field and batch student count. Counts explicitly describe batch enrollment, not subject attendance. Faculty/Dashboard tests 18/18 PASS; service/profile ESLint PASS; browser NOT_RUN. Existing roster lint issue unchanged.


Faculty academic table consolidation (2026-10-17, IN_REVIEW): replaced separate Assigned subjects/batches profile cards with one full-width themed Academic Assignments table (Field, Course, Batch, Subject, Students). Repeated schedules for the same saved relationship share one summary row; timetable remains unchanged. Fixed columns/truncation/tooltips contain long content; student count explicitly denotes active batch enrollment. Browser visual acceptance pending.


Saved academic subject filters (2026-10-17, IN_REVIEW): Faculty filter pills now derive active subjects from saved active courses in selected branch rather than a fixed subject list/name inference. Counts/filter membership use saved assignment subject IDs and unique teachers; duplicate subject names identify course. Navigation, refresh, window focus and cross-tab storage changes reload academic data. Focused Faculty tests 7/7 PASS including a newly saved custom subject/filter. Existing effect lint issue remains; browser NOT_RUN.


Assignment conflict time display (2026-10-17, IN_REVIEW): teacher-overlap error formats existing saved class times in 12-hour AM/PM using shared formatter. Conflict detection and records unchanged.


Subject-scoped class students (2026-10-17, IN_REVIEW): View Students passes selected assignment subject/batch to existing modal/service. Only Active same-branch same-batch enrollments explicitly containing that subject ID are shown; unknown subject fails closed. Class popup fixes selected batch and displays current branch/subject. Existing generic batch service remains available without subject filter. Focused faculty service tests 6/6 PASS including subject/pending/foreign-branch exclusion. Existing modal effect lint issue remains; browser NOT_RUN.


Selected class status correction (2026-10-17, IN_REVIEW): status banner now resolves the clicked assignment/single-date occurrence by immutable ID, rather than prioritizing any in-progress class for the selected teacher. Uses existing daily resolver/clock; other weekdays or absent occurrences show Not scheduled today. Focused clock/selection tests cover completed/live/upcoming/starting-soon and missing selection. Browser acceptance pending.


Subject-specific timetable count (2026-10-17, IN_REVIEW): roster class cards use unique active same-branch/same-batch enrollments explicitly selecting the assignment subject, matching View Students rather than entire batch population. No matching subject enrollment shows 0; single-date sessions without a saved subject ID show 0 instead of borrowing batch count. Existing batch capacity metrics unchanged. Focused Faculty tests 13/13 PASS; service ESLint PASS; browser NOT_RUN.


Faculty professional details binding (2026-10-17, IN_REVIEW): replaced unconditional demo placeholder with saved qualification, specialization and department values. Missing fields explicitly show Not recorded; optional saved textual professional notes preserved. Faculty integration tests 8/8 PASS including persisted professional fields; profile/test ESLint PASS. Browser NOT_RUN.


Add Faculty saved-subject selector (2026-10-17, IN_REVIEW): replaced fixed Primary Subject list with active saved subjects from active branch courses; loads on modal open and reloads on focus/storage changes. Themed compact listbox shows course context/checkmark, keyboard navigation, outside-click/Escape close and empty/error/loading states. New faculty must select a saved subject; legacy edit specialization preserved. Primary subject remains profile specialization, not an automatic teaching assignment. Focused Faculty tests 8/8 PASS including saving a custom academic subject into new faculty; targeted modal/test ESLint PASS. Browser NOT_RUN.


Scrollbar visibility follow-up (2026-10-17, IN_REVIEW): visible scrollbar tracks hidden across workspace descendants and portaled dialogs, including dropdown lists; scrolling overflow and navigation remain functional. CSS-only; diff check PASS, browser NOT_RUN.


Primary subject dropdown density (2026-10-17, IN_REVIEW): menu maximum height reduced to 160px, tighter item padding/gap and 11px option text; scroll behavior preserved. Targeted ESLint PASS.


Primary-subject assignment filter (2026-10-17, IN_REVIEW): Add/Edit Class subject options match selected teacher saved primary specialization and selected course. Changing teacher clears stale subject; persistence rejects a mismatching subject for teachers with a recorded primary subject. Legacy teachers without primary subject retain existing selection behavior. No saved assignments removed. Focused dialog tests 2/2 PASS including Biology-only UI and mismatch rejection; existing Faculty workflow 8/8 PASS in combined run before focused addition; targeted ESLint PASS. Browser NOT_RUN.


Courses/portfolio polish (2026-10-17, IN_REVIEW): removed Set Up QA Demo action and its page-only setup handler/dialog; existing saved data and shared demo service preserved. Add Course/Batch moved right opposite directory tabs. Portfolio container/cards use theme-based subtle gradients, compact metrics/links, uniform 168px cards; list allows exactly four cards (702px with gaps), scrolling only above four and no visible scrollbar. Courses page tests 10/10 PASS; targeted ESLint PASS; isolated Edge five-card case verified 702px viewport/880px scroll height and absent QA action. No owner storage changes or commit/push.


Academic Subjects tab placement (2026-10-17, IN_REVIEW): moved existing subject table into Subjects tab beside Courses and Batches, with shared right-aligned tab-specific Add action. Existing subject actions, exports and pagination preserved; only selected directory table visible. Courses page tests 10/10 PASS; targeted ESLint PASS; isolated Edge tab visibility/placement and Add action checks PASS. Saved data unchanged.


Academic directory table polish (2026-10-17, IN_REVIEW): Courses/Batches/Subjects default to 10 rows per page, selectable pagination retained. Shared scoped table styling uses theme tokens for compact uppercase headings, subtle alternating rows/hover and consistent cell spacing/dividers. Courses page tests 10/10 PASS; targeted ESLint PASS; isolated Edge confirmed 10-row defaults across all tabs with no horizontal overflow.




Compact portfolio actions (2026-10-17, IN_REVIEW): three-dot actions use content-fit width, smaller 11px text and tighter spacing. Academic stream portfolio menu now shows only permitted Edit/Delete; View removed from that menu, stream-name view remains. Users without management receive no empty stream menu. Courses page tests 10/10 PASS; targeted ESLint PASS; browser NOT_RUN.


Course details popup fit (2026-10-17, IN_REVIEW): scoped override removes shared 512px width cap for course popup (1040px desktop, viewport-bounded mobile), smaller title/tabs/padding, single-line nonshrinking tab labels and reserved close-button space. Isolated Edge width 1040px and all tab labels single-line PASS. Existing CourseDetailsModal unused-import/effect lint errors and dependency warning remain.


Fees/Finance table pagination (2026-10-18, IN_REVIEW): shared compact pagination with range, bounded numbered pages, previous/next and 10/15/25/50 sizes; both default to 15. Filter/branch/page-size context resets page, result shrink clamps safely; exports/financial totals keep all matching records. Fees empty results retain controls. Focused financial regressions 5/5 PASS; targeted ESLint PASS; isolated Edge Finance selector/default PASS. No saved financial data changed.


Finance reference cards and live metrics (2026-10-18, IN_REVIEW): four expanded theme-based cards show daily received/spent split, dynamic current-month revenue/expense totals, actual verified receipt/posted-expense counts, calculated net margin and previous-month net. No fabricated challan-collection/dues/healthy-status claims. Karachi date/month grouping handles UTC boundaries and zero revenue honestly. Refresh on expense save, focus, database storage events and minute timer (cleaned on unmount). Focused financial/metrics tests 7/7 PASS, targeted ESLint PASS. Isolated Edge real Post Expense updated current-month expense card from 0 to 123 using explicitly fictional test profile data; owner storage untouched. No commit/push.


Dashboard Quick Operations compact layout (2026-10-18, IN_REVIEW): reduced section padding/gaps, action minimum height 80 to 64px, icon containers 40 to 32px, icons 19 to 16px and compact title/helper text. Existing navigation/permissions unchanged. Dashboard tests 12/12 PASS; existing unused MoreVertical/feeService lint errors remain. Browser NOT_RUN.


Academic table relationship badges (2026-10-18, IN_REVIEW): field in Courses, course in Batches, and course/field in Subjects now use compact pastel pill badges with dot, subtle gradient/border and dark-mode colors. Stable identity hash keeps matching records consistent across tables; long names truncate with title. No data changes. Existing unused CalendarDays/UsersRound lint issues remain; browser NOT_RUN.


Demo prospective registration and Admissions handoff (2026-10-18, IN_REVIEW): trial registration uses saved active academic fields/courses/batches in current branch, collects candidate/guardian/contact/date/time/notes and creates only demo inquiry. Existing-student picker omitted on this page. Registry derives actual field/course/batch/branch, guardian, requested/scheduled timing and teacher/room; removed guessed streams, fabricated dates/halls/admission numbers. Compact fixed-column table clips long text instead of overlaps/wrapping; details retain full records. Registered rows can schedule, scheduled rows mark attendance, eligible candidates open editable Admissions prefill. New-vs-existing admission handling corrected; pending and instant completion carry demo ID into existing atomic admission transaction, validate source branch/permissions and prevent repeated conversion. Demo linked status updates atomically with saved admission; existing approval/enrollment/challan/payment workflows preserved. Pending prefill cleared after successful save. Cards derive recorded attendance/conversion/pending totals, no invented rooms or future-date registration counts; focus/storage/minute refresh with cleanup.

Verification: 37/37 focused Demo UI/service/financial tests PASS including atomic pending/duplicate protection and instant enrollment/payment projection. Demo/database targeted ESLint PASS; existing Admissions form lint issues remain (unused declarations and effects/memoization). One production build PASS with existing large-chunk warning. Isolated Edge real controls PASS for registration/table/field display/direct editable prefill/Pending save and separate schedule/attendance/Convert/instant enrollment/PKR500 partial payment. Fictional QA records only in disposable profile; owner storage untouched. Browser full export/role matrix not exhaustively repeated. No commit/push; owner acceptance pending.


## QA-RELEASE-20261018 ? Owner-authorized stabilization and dev release (2026-10-18)

Authorization: owner's supplied FINAL QUALITY ASSURANCE, ERROR CLEANUP & SAFE DEV PUSH request explicitly authorizes direct dev stabilization, inclusion of intended completed Codex/Antigravity work, one commit and a normal origin/dev push. No redesign, destructive cleanup, new packages or backend implementation authorized. Existing approved UI/theme/PDF templates and owner's storage preserved; artifacts remain untracked.

Implemented: unused import/declaration cleanup; table selection/column hooks moved intact to a dedicated hook module to resolve Fast Refresh boundaries, preserving comments and consumers; unstable memo dependency removed; admission prefill resolves within the asynchronous reference load and preserves an explicitly unselected batch when editing an existing admission; course student loading derives from the matching request result and includes batch reference dependencies; batch-student state resets by record/open scope; dashboard navigation selection resolves once when faculty data is ready. Updated stale branch-dropdown/profile/retired-schedule test expectations without removing tests or disabling rules. Bound jsdom workers to two to prevent resource-contention timeouts; original timeouts/assertions retained. An encoding-write failure was recovered from the exact initial ESLint source snapshot before further checks; no owner code discarded.

Verification: initial ESLint 50 errors/2 warnings; final full project lint PASS, zero errors/warnings. Initial full suite 412 passed/10 failed (422 tests, 53 files). Final full suite 421 passed/1 failed; the remaining stale native-select interaction in AdmissionCrud was corrected, then that complete test file passed 12/12, with targeted lint PASS. Thus all 422 tests have passing final evidence; no tests skipped/deleted and no additional full-suite run performed. Focused academic/faculty/demo/branch workflows passed apart from stale assertions subsequently resolved by the final run. Production build PASS; Server/server.js syntax PASS. No TypeScript check configured. git diff --check PASS. Source and untracked intended files reviewed; no secret-pattern matches in diff, no environment/generated/artifact files intended for staging.

Browser: isolated Edge QA profile and separate disposable context only; module smoke covered Dashboard, Faculty, Admissions, Students, Fees, Finance, Demo Classes, Assets, Reports, Users, Settings, Branches and the correct Courses & Batches URL. Correct academic tab controls, course PDF download and CSV download passed; no runtime errors in successful smoke runs. A browser script initially used the wrong role for the academic tabs; the corrected check passed. Existing automated tests cover permissions/branch isolation, academic assignment/conflicts, admission/enrollment, financial totals/full-partial payments, PDF templates and CSV/selection behavior. Every browser role/device/export variant was not exhaustively repeated. This remains a mock frontend, not production backend/security validation.

Known limitation: Vite reports a noncritical >500kB main-chunk warning (about 2.72MB minified, 1.10MB gzip, including synchronous PDF/logo code). Build succeeds; no threshold changes, warning suppression or risky route/export restructuring performed. Existing production integration and owner acceptance remain outside this stabilization. Release checks complete; commit/push execution is recorded in the final owner report after remote safety verification.


## MOBILE-20261018 - Owner-approved mobile-only responsive transformation

Status: IN_REVIEW, awaiting owner mobile experience acceptance. Owner explicitly authorized presentation-only work directly on dev from c86724a. No commit/push authorized. All overrides are screen-only and below 768px; desktop/laptop and print styles remain intact. Scope covers the shared ERP shell and all authorized modules, with minimal presentation hooks for faculty detail reveal, inline admission, dashboard summary, demo filters, fees filters and pagination. No services, routes, data schemas, permission rules, validation or calculations changed. Verification completed: lint 0/0, 422/422 full tests, production build, 91 Super Admin module/viewport checks, 21 other-role dashboard checks, actual mobile academic/admission/demo/payment/expense/export interactions and desktop screenshot comparison. Evidence and limitations are in PROGRESS.md and artifacts/mobile-20261018 (untracked). Stop here pending owner acceptance; no staging/commit/push.


## DEMO-REGISTER-CLASSES-20261018 - Saved batch classes in prospective registration

Owner explicitly requested a polished registration form showing classes created for the selected Field/Course/Batch. Status IN_REVIEW, pending owner experience acceptance. Implemented scoped form redesign, real same-branch recurring/dated class previews, timing-to-request date/time prefill, loading/error/retry/empty states and draft-preserving live refresh. Existing registration/scheduling/admission status rules and payload remain unchanged. New Demo changes are uncommitted; prior mobile QA release 9e8fd33 was verified on local and actual origin/dev before starting this feature. No additional commit/push authorization inferred.


## DEMO-ACTIONS-DELETE-20261018

Owner-authorized demo inquiry deletion and consolidated three-dot row actions. Status IN_REVIEW. Desktop/mobile menu includes details, valid scheduling/attendance/conversion actions, cancellation and confirmed deletion. Converted/linked inquiries are protected. No commit/push requested.


## DEMO-MULTI-CLASS-20261018

Owner-authorized DEMO-MULTI-CLASS-20261018: implemented independent multiple class selection/deselection, count, persisted requested classes and detail display. IN_REVIEW pending owner acceptance; no commit/push.


## DEMO-UI-POLISH-20261019

Owner-authorized presentation update: reuse shared CustomSelect for Demo stream filter; reduce summary card padding/icon/value size and page/header vertical spacing; remove Trial Faculty desktop column and matching mobile summary line, redistribute seven table column widths. Faculty information remains in inquiry details and scheduling. IN_REVIEW. PASS: 10 existing Demo page/registration tests, full lint0/0, production build (existing large-chunk notice), disposable Edge dropdown bounds/selection and removed-column checks at360/1440px, git diff --check. No persistence/business-rule change or commit/push.


## DEMO-DIRECT-ATTENDANCE-20261019

Owner explicitly replaces the separate Demo scheduling UI with direct attendance after registration. Removed scheduling menu actions and page dialog/data wiring. Registered, Scheduled, Attended and Missed inquiries can use the existing attendance dialog; converted/cancelled records remain blocked. Attendance is inquiry-level, not per-class tracking. Registration-selected classes now appear inside Scheduled Trial Class Session in Details, with legacy scheduled-session fallback; no fabricated sessions. Attendance modal remounts per candidate to avoid stale outcomes. Expanded status column and compact table badges prevent clipping. PASS:42 targeted service/page/registration tests, full lint0/0, build (existing chunk warning), isolated Edge360/1366/1440 direct attendance and status badge bounds, git diff --check. Full suite NOT_RUN. IN_REVIEW; no owner data edits, no commit/push.


## DEMO-DATE-COLUMN-20261019

Owner-authorized date-only Demo registry presentation: heading Trial Date, desktop cell and mobile summary show scheduled date or requested-date fallback only; remove time/venue from list. Existing exports and inquiry details preserved. PASS targeted component ESLint and7 existing Demo page tests; git diff --check. IN_REVIEW; no commit/push.


## PAGE-HEADER-CLEANUP-20261019

Owner authorized removal of category/branch eyebrow text above page names across all tabs. Removed matching lines/decorative dots from Demo Classes, Fees, Finance, Assets, Reports, Branch Management, User Management and Settings. Other pages already start at their main heading. Page titles, descriptions and branch context remain intact. PASS: full ESLint0/0, production build (existing chunk warning),11 existing Finance/Demo page tests, git diff --check. Browser/full suite NOT_RUN for this presentation-only change. IN_REVIEW; no commit/push.


## DEMO-FILTER-BAR-20261019

Owner-authorized compact Demo filter bar with soft maroon border, light inactive tab borders/backgrounds and one-line nonwrapping status tabs; reduced search/dropdown widths align toolbar on desktop. Mobile tabs scroll internally, with existing stacked search controls retained. PASS targeted component lint,7 existing Demo page tests, disposable Edge360/1366/1440 single-line tab/alignment/no-page-overflow checks; git diff --check. IN_REVIEW. No business changes or commit/push.


## SHARED-BREADCRUMB-20261019

Owner-authorized compact shared Home/current-page breadcrumb across all tabs, roles and branches. Base height48->36px, padding10x18->6x12, text14->12px, icon17->14px, reduced gaps; existing compact/mobile visibility rules retained. Home route and aria-current semantics preserved. PASS targeted component ESLint, production build (existing chunk warning), git diff --check. Browser/full suite NOT_RUN for this small style change. IN_REVIEW; no commit/push.


## DEMO-NOTES-SPACE-20261019

Owner-authorized Demo presentation adjustment: date column18->12 percent and notes13->19 percent, shifting notes left and widening every notes cell. Removed old220px notes cap; preserved single-line ellipsis/title. Search160->192px with existing mobile full-width behavior. PASS targeted ESLint and7 existing Demo page tests; git diff --check. Browser/build NOT_RUN for this scoped style change. IN_REVIEW; no commit/push.


## SHARED-PAGE-TITLE-20261019

Owner authorizes removing the redundant shared route heading above module titles across all roles/branches. Shared PageHeader now contains compact right-aligned breadcrumb only, with reduced vertical margin and no hidden generic description; existing page main titles/descriptions move up. Courses had no own page heading, so retained its name as a semantic module-level h1. PASS11 existing Finance/Demo tests, lint/build (existing chunk warning), git diff --check. Browser/full suite NOT_RUN. IN_REVIEW; no commit/push.


## SHARED-BREADCRUMB-LEFT-20261019

Owner explicitly requested left alignment for the shared Home/current-page breadcrumb across tabs and roles. Changed only shared breadcrumb-row justification to flex-start; compact sizing and navigation preserved. PASS git diff --check. Browser/tests NOT_RUN for this one-property presentation change. IN_REVIEW; no commit/push.



## ASSETS-FLOW-20261019 - UNDONE

Owner requested reverting only the last Assets adjustment. Restored prior table widths/sidebar layout/KPI display, prior unsupported-version message and prior imports. Removed scoped asset-table CSS. Earlier Demo/shared header changes and unrelated existing Assets redesign preserved. PASS git diff --check; runtime tests NOT_RUN for this targeted reversal. No records modified.


## STORAGE-V9-RECOVERY-20261019

Owner authorizes urgent recovery of all tabs after unsupported-version errors. Read only the academy app database/organization keys from Chrome storage, saved local untracked recovery snapshots (never stage: contains owner records). Identified persisted version9 with actual saved records; current reader rejected anything beyond8. Version9 payload validates against current schema. Reader now explicitly accepts8 and9, preserving stored version9 and all collections; unknown versions and invalid records remain rejected without rewriting. No seeding, reset, downgrade, actual owner-storage writes or UI redesign. Removed3 dead Assets imports for clean lint. PASS35 database/assets tests including v9 reads, writes, preservation and invalid-record rejection; production build (existing chunk warning); isolated owner-data-copy validation and no-alert routes Courses/Students/Admissions/Faculty/Fees/Finance/Demo/Assets, isolated asset write preserves students/payments and version9. Owner should refresh the existing URL/branch. IN_REVIEW; no commit/push.


## ASSETS-LIVE-FLOW-20261019

Owner reauthorizes Assets functionality and compact non-overflowing inventory layout after previous targeted undo. Existing centralized asset services remain the data source; register/edit/assign/unassign/inspection/maintenance mutations retain persistence and branch/permission checks. Added cleaned-up focus/storage/minute refresh with latest-request guard so summaries and rows reflect saved changes. Added duplicate-submit guards. KPI loading/errors no longer masquerade as zero totals. Desktop inventory uses fixed percentage widths, compact single-line typography/ellipsis and bounded text; full details remain accessible. Existing mobile cards retained. Sidebar stacks below the table until1600px to provide readable table width. PASS37 database/asset-service/mounted-page tests, including actual UI registration/card totals and external saved inspection/value refresh; full lint0/0; production build with existing large-chunk warning; isolated Edge actual registration, persistence, table refresh and no horizontal table/page overflow at360/768/1024/1366/1440/1600px; git diff --check. Full suite NOT_RUN. No owner-record changes, no new seeding/schema change or commit/push. IN_REVIEW pending owner acceptance.


## ASSETS-RIGHT-PANEL-20261019

Owner correction: restore Quick Inspection sidebar on the right at the original xl breakpoint and22rem width. Keep compact fixed-layout inventory and reduced10px cell text; no functional/storage changes. PASS targeted lint and git diff --check; browser/tests NOT_RUN for this presentation-only correction.


## ASSETS-CHECKBOX-REMOVE-20261019

Owner requests removing Assets table selection checkboxes. Removed select-all/row checkbox cells, selection highlighting and unused bulk selection controls. Exports continue using all currently filtered inventory records. Right inspection panel unchanged. PASS targeted ESLint and git diff --check; runtime tests NOT_RUN for this small UI removal.


## ASSETS-COMPACT-ACTIONS-20261019

Owner requests moving inline Inspect/Log Repair into the three-dot menu in place of Assign Staff. Removed inline actions; menu now offers View Details, Edit Asset and condition-dependent Inspect/Log Repair, reusing existing detail/maintenance handlers. Removed duplicate maintenance action, kept staff assignment accessible in asset details. Menu width176->144px with compact11px text/padding. PASS targeted lint and2 existing Assets page tests; git diff --check. Browser NOT_RUN for this scoped menu change. No persistence/permissions changes.


## ASSETS-PAGINATION-20261019

Owner requests screenshot-style inventory footer. Reused shared Pagination with default10 rows,10/15/25/50 selector, current record range, numbered pages, previous/next and disabled bounds. Row-count changes reset page1; clamped page used after filters/deletions. Right inspection panel retained. PASS3 Assets page tests including11-record next-page and page-size reset, targeted ESLint, git diff --check. No persistence changes.


## ASSETS-ATTACHED-PAGINATION-20261019

Owner requests pagination joined to the inventory rather than a separate card. Table/mobile records, empty state and pagination now share one bordered container; no external footer gap/duplicate border. PASS targeted lint and git diff --check; runtime tests NOT_RUN for container-only change.


## ASSETS-100-PERCENT-20261019

Owner supplies80%-zoom reference and requests its compact proportions at normal100% zoom. Scoped desktop Assets presentation now uses approximately75/25 inventory/right-inspection split, compact cards/filter typography and fixed100%-total table column proportions; category tabs stay in one internally scrollable line, filters remain one row, rows retain single-line truncation with accessible Details. Reduced cell padding and icons; attached pagination preserved. No browser zoom/transform, data, status or business-rule changes. PASS targeted lint, production build (existing chunk warning), isolated fictional8-record Edge checks at1366/1440/1920 at deviceScaleFactor1, right-sidebar positioning, no table/page horizontal overflow;1440 screenshot visually inspected. Existing mobile styling retained. Runtime tests NOT_RUN for this scoped presentation pass. IN_REVIEW; no commit/push.


## ASSETS-INSPECTION-WIDTH-20261019

Owner requests wider right Quick Inspection panel and exactly2px desktop gap from inventory. Changed desktop split75/25 to70/30 with17rem sidebar minimum and xl gap2px. Existing mobile stacking retained. PASS git diff --check; tests/browser NOT_RUN for this grid-only presentation change.


## ASSETS-MAINTENANCE-TEXT-20261019

Owner requests slightly smaller maintenance list and balanced warning colors. Reduced heading/name11->10px and panel padding; red heading/dots/asset codes retain warning emphasis, asset names use readable slate and locations muted slate. No data/layout flow changes. PASS targeted lint and git diff --check; runtime tests NOT_RUN for styling-only change.


## ASSETS-MENU-COLORS-20261019

Owner requests narrower asset action menu, individual icon colors and maroon hover. Width144->128px including placement calculation. View sky, Edit violet, Inspect emerald; maroon hover/focus text with pale maroon background, icon colors retained. PASS targeted lint and git diff --check; runtime tests NOT_RUN for presentation-only change.


## ASSETS-KPI-COLORS-20261019

Owner requests Assets summary cards use the existing cross-module card color treatment. Reused shared top-kpi-card class for existing maroon/emerald/sky/amber gradients, borders and hover/dark/mobile rules. Existing totals, urgent indicator, sizing and icons preserved. PASS targeted lint and git diff --check; browser/tests NOT_RUN for shared-class styling change.


## DEMO-SUMMARY-HEIGHT-20261019

Owner requests slightly shorter Demo KPI cards and moving them upward. Reduced content vertical padding/internal gaps and page/header spacing. Single-line footer ellipsis prevents long pending-room text stretching all cards; room tooltip retains full text. Existing metrics/colors/business behavior preserved. PASS7 existing Demo page tests, targeted lint and git diff --check. Browser NOT_RUN for this scoped spacing change.


## DEMO-SUMMARY-LABELS-20261019

Owner requests removing hall/batch text from Pending Trial Slots and black headings on all four Demo KPI cards. Removed room display/unused calculation and changed only heading text color to near-black. Counts and other footer metrics preserved. PASS targeted lint and git diff --check; runtime tests NOT_RUN for this small presentation change.


## ASSETS-SEARCH-WIDTH-20261019

Owner requests slightly shorter Assets search. Reserve12px extra right spacing on desktop search wrapper, reducing its flexible input width by12px while preserving filter sizes and mobile layout. PASS git diff --check; runtime tests NOT_RUN for spacing-only adjustment.


## ASSETS-SEARCH-ACTUAL-WIDTH-20261019

Owner clarifies actual search box width rather than typography. Replaced prior extra margin approach with desktop width40% and no flex growth on search wrapper. Input font unchanged, mobile flexible width preserved. PASS git diff --check; browser/tests NOT_RUN for this sizing-only correction.


## ASSETS-CATEGORY-TINTS-20261019

Owner requests icon-matching light backgrounds on inactive category tabs and maroon hover. Reused existing category palette for blue/amber/teal/violet tint/text, with pale maroon hover/focus and maroon text. Active tab stays solid maroon; counts/filter behavior unchanged. PASS targeted lint and git diff --check; browser/tests NOT_RUN for styling-only change.


## ASSETS-FILTER-WIDTHS-20261019

Owner requests wider Rooms and Condition controls without changing search width or displacing Sort. Desktop dropdown widths135->144px each; reduce three row gaps8->2px to offset18px added width, keeping search and Sort alignment. Existing mobile layout unchanged. PASS git diff --check; browser/tests NOT_RUN for scoped CSS adjustment.


## ASSETS-FILTER-TRIGGER-CORRECTION-20261019

Owner clarifies visible filter boxes should widen, opened menus should shrink. Rooms/Condition desktop triggers now responsive150-176px; their popup menus bounded160px. Search remains unchanged40%. PASS targeted lint and git diff --check; browser NOT_RUN for this small correction.


## ASSETS-FILTER-GAP-20261019

Owner requests a little spacing between visible filter controls. Desktop filter row gap2->6px; widths/font unchanged. PASS git diff --check; browser/tests NOT_RUN for one CSS property.


## ASSETS-SORT-MENU-WIDTH-20261019

Owner requests narrower opened Sort Tag menu. Bounded only its popup width128px instead of min140px; visible trigger/search/filter widths unchanged. PASS git diff --check; runtime tests NOT_RUN for sizing-only change.


## ASSETS-ROOM-CONDITION-MENUS-20261019

Owner requests slightly wider Rooms/Condition opened menus. Popup widths160->176px only; trigger, search and Sort popup unchanged. PASS git diff --check; tests/browser NOT_RUN for width-only change.


## ASSETS-SORT-TRIGGER-20261019

Owner requests narrower visible Sort Tag control. Set90px width with desktop override; opened Sort menu and other controls unchanged. PASS git diff --check; tests/browser NOT_RUN for width-only change.


## ASSETS-FILTER-FONT-WEIGHT-20261019

Owner requests slightly bolder search placeholder and Rooms/Condition/Sort trigger text. Scoped font-weight600 on those controls only. Widths, sizes and spacing preserved. PASS git diff --check; tests/browser NOT_RUN for typography-only change.


## ASSETS-SORT-POPUP-COMPACT-20261019

Owner explicitly identifies opened Sort popup. Reduced popup128->112px only; trigger and other controls unchanged. PASS git diff --check; tests/browser NOT_RUN for width-only adjustment.


## ASSETS-CONTROL-SPACING-20261019

Owner requests visible gaps between Rooms, Condition and Sort boxes. Desktop filter gap6->10px and prevent dropdown wrappers shrinking below their trigger width (which could visually erase the flex gap). Search dimensions and trigger/menu widths unchanged. PASS git diff --check; tests/browser NOT_RUN for scoped CSS change.


## ASSETS-FILTER-ROW-FIT-20261019

Owner reports Sort overflow after added gaps. Desktop filter row now uses bounded grid columns: search40%, two flexible dropdowns and Sort90px, with6px gaps. Trigger wrappers/labels fit their tracks rather than overflowing fixed widths. Mobile unchanged. PASS isolated Edge1280/1366/1440/1920 same-row, visible gaps and Sort-inside-panel checks; git diff --check. No functional changes.


## ASSETS-FILTER-LABELS-20261019

Owner requests shorter default filter labels: All Rooms and All Conditions. Updated matching options/placeholders only; filtering values/behavior unchanged. PASS git diff --check; tests NOT_RUN for text-only change.


## REPORTS-HEADER-ACTIONS-20261019

Owner requests removing pictured Batch Schedule Summary and Export Active Report header buttons. Removed their header action group only; existing report contents and other export actions preserved. PASS git diff --check. Targeted lint FAIL: current Reports file has9 errors/2 warnings including preexisting unused Check/setPageSize and rowsFormatted assignments; unrelated cleanup not included. Runtime tests NOT_RUN for this button-only removal.


## REPORTS-CATEGORY-STYLING-20261019

Owner requests pale maroon bordered report category options with relevant icons and improved hover. Added semantic icons via existing TAB_CONFIG and imported Lucide components, light maroon inactive tabs/container/badges, deeper maroon hover, preserved solid active state; added pressed state and focus ring. Filtering/count logic unchanged. PASS production build (existing chunk warning) and git diff --check. Lint not rerun: previous Reports9 errors/2 warnings remain documented; runtime tests NOT_RUN for this presentation change.


## REPORTS-CATEGORY-COLORS-20261019

Owner requests distinct category icon colors with matching pale option backgrounds. Added emerald/sky/violet/amber/indigo/teal/rose/orange palettes and matching badge colors through existing tab config. Active maroon/white and maroon hover retained. PASS production build (existing chunk warning), git diff --check. Browser/tests NOT_RUN; existing Reports lint issues unchanged.


## REPORTS-DROPDOWN-ANCHOR-20261019

Owner reports all filter menus opening away from their fields. Root cause shared CustomSelect lets containerClassName replace default relative positioning (Reports passes w-full). Always retain relative class on the shared wrapper while preserving consumer classes; absolute menus now anchor below their own triggers. PASS shared component ESLint and isolated Edge five Reports filter dropdown geometry/escape checks at390/1366/1440px (15 menu openings); git diff --check. No filter/business changes.


## REPORTS-SESSION-LABEL-DATE-20261019

Owner requests automatic month/year on Current Session option. Replaced hardcoded Oct2025 with Intl month/year in Asia/Karachi; minute timer/focus refresh and cleanup support open-page month/year rollover. This ticket changes label only; actual academic-session filter dates remain unconfigured as previously reported. PASS production build (existing chunk warning), isolated UTC-browser clock test Dec2026->Jan2027 at Karachi midnight, git diff --check. Existing Reports lint issues unchanged; full tests NOT_RUN.


## REPORTS-KPI-COLORS-FIT-20261019

Owner requests shared colorful KPI backgrounds and smaller nonbreaking content for every Reports category. Reused shared top-kpi-card gradients/borders/hover, reduced padding and label/value/subtext sizes, constrained content tracks with min-width0, single-line ellipsis and full-text titles. Existing metric values/calculations preserved. PASS build (existing chunk warning), isolated Edge all8 category card groups at390/1366/1440: contained single-line content; git diff --check. Lint/full tests NOT_RUN; earlier Reports lint issues documented.


## REPORTS-KPI-HEIGHT-20261019

Owner requests slightly taller Reports KPI cards. Shared card renderer now min-height136px for all categories, preserving compact nonwrapping typography and existing colors/metrics. Existing mobile minimum-height override retained. PASS git diff --check; browser/tests NOT_RUN for one-class sizing change.


## REPORTS-KPI-HEIGHT-TUNE-20261019

Owner requests slightly reducing the preceding height increase. Reports KPI minimum136->124px only; content/colors unchanged. PASS git diff --check; tests/browser NOT_RUN for sizing-only correction.


## REPORTS-KPI-HEIGHT-FINAL-TUNE-20261019

Owner requests another small height reduction. Reports KPI minimum124->116px only. PASS git diff --check; tests/browser NOT_RUN for sizing-only correction.


## REPORTS-KPI-CONTENT-ALIGN-20261019

Owner requests content aligned to reduced KPI height and bolder single-line numbers. Vertically centered KPI content within116px card,17px extra-bold main values, semibold subtext and tighter line-height/consistent spacing; preserved nowrap/ellipsis/full-text title. PASS build (existing chunk warning), isolated Edge all8 category groups at390/1366/1440 fit/single-line checks, git diff --check. Existing Reports lint findings unchanged.


## REPORTS-COHORT-LABEL-20261019

Owner requests shorter default selected-cohort card text. Changed All Cohorts / Batches to All Cohorts. No filtering/calculation changes. PASS git diff --check; tests NOT_RUN for text-only adjustment.


## REPORTS-KPI-POSITIONS-20261019

Owner requests heading top-left, icon/gauge top-right, main value centered between header/footer and subtext at bottom. Reorganized the shared KPI renderer into three grid rows; preserved116px minimum, nowrap/full-text titles, existing metrics and colors across all categories. PASS build (existing chunk warning), isolated Edge all8 category groups at390/1366/1440 containment/single-line checks, git diff --check. Existing Reports lint issues unchanged.


## REPORTS-KPI-VALUE-LEFT-20261019

Owner clarifies middle value must be left aligned while vertically centered between top heading and bottom subtext. Changed main-value alignment center->left only across all Reports categories. PASS git diff --check; tests/browser NOT_RUN for alignment-only correction.


## REPORTS-KPI-VALUE-UP-20261019

Owner requests middle KPI value slightly higher. Applied4px upward translation only to the main value; left alignment, heading/footer positions unchanged. PASS git diff --check; tests/browser NOT_RUN for minor positioning adjustment.


## REPORTS-KPI-VALUE-EMPHASIS-20261019

Owner requests main KPI value slightly higher, larger and bolder. Upward offset4->8px, font17->19px and weight800->900; nowrap/truncation and left alignment retained. PASS git diff --check; tests/browser NOT_RUN for typography/offset-only adjustment.


## REPORTS-KPI-VALUE-SIZE-20261019

Owner requests another small main-value size increase. Reports KPI font19->21px only; existing boldness/position/nowrap preserved. PASS git diff --check; tests/browser NOT_RUN for size-only adjustment.


## REPORTS-KPI-HEADING-EMPHASIS-20261019

Owner requests slightly larger, bolder black top headings. Shared Reports KPI label9->10px, weight700->800, slate600->950; single-line fitting and full-text title retained. PASS git diff --check; tests/browser NOT_RUN for typography-only adjustment.


## REPORTS-KPI-HEADING-COLOR-RESTORE-20261019

Owner requests reverting only the black heading color. Restored slate600 while retaining latest heading size/weight. PASS git diff --check; tests NOT_RUN for color-only adjustment.


## REPORTS-KPI-HEADINGS-FULL-20261019

Owner requests fixing clipped top labels such as Classrooms Occupied and Challan Recovery Rate. Slightly smaller long labels/tighter tracking, compact32px icons/gauges, narrower header gap; changed medium desktop to3 columns before xl5 for usable title width. Removed heading ellipsis; retained full single-line text. Scoped mobile8px heading override compensates shared KPI typography. PASS full heading scrollWidth/clientWidth checks for every8 Reports category at390/1024/1280/1366/1440, production build (existing chunk warning), git diff --check. No metric/data changes; existing Reports lint findings unchanged.


## REPORTS-FILTER-FOOTER-EXPORT-20261019

Owner requests compact colored filter section with hover, attached rows-per-page footer and table-header PDF/spreadsheet export icons. Reduced filter padding/control heights/label sizes, pale maroon background/borders/hover. Reused shared Pagination (default10,10/15/25/50, ranges, numbered pages) inside report table container. Reused toolbar PDF/CSV icons connected to existing filtered/selected exports. Updated obsolete test expecting owner-removed Schedule Summary button to current header/export/pagination assertions; no skipped tests. PASS4 Reports tests, build (existing chunk warning), disposable browser page-size selection/filter menu and actual PDF/CSV downloads; git diff --check. Existing Reports lint findings unchanged, full suite NOT_RUN. No business/filter logic or owner-data modifications.


## REPORTS-ACTION-FEEDBACK-20261019

Owner requests Reset/Print color treatments and investigation of Refresh. Existing Refresh already re-fetches overview but offered no loading/success feedback. Added scoped refresh generation state, disabled/spinning refresh button while loading, selected-row clearing and accessible success announcement; preserved filters. Reset amber, Print sky, Refresh violet with pale maroon hover. Added integration test proving newly saved branch asset appears only after refresh and overview re-fetches. PASS5 Reports tests, build (existing chunk warning), isolated browser actual new saved record refresh/success plus print handler invocation; git diff --check. Existing unrelated Reports lint findings unchanged. No owner records touched.


## REPORTS-WORD-EXPORT-20261019

Owner requests pictured Word/Google Docs-compatible export beside PDF. Added blue Word document action producing genuine.docx Office Open XML without new dependencies. Shares exact PDF row formatting and filtered/selected scope; exports report title, branch and filter summary. Text escaped and invalid XML controls stripped; files are local downloads, not automatic Google Drive uploads. PASS6 Reports/Word tests, targeted new helper lint, production build (existing chunk warning), disposable browser selected-row download, Python ZIP CRC/all XML parsing and exactly header+one selected table row; git diff --check. Native Word/Google Docs import UI NOT_RUN. Existing unrelated Reports lint issues remain. No owner data changes.


## REPORTS-SEARCH-HEADER-20261019

Owner requests wider report quick-search/larger text and Showing-records below ledger title. Search widths224/288/320px responsive,13px input text and36px height; record count now under title in vertical heading group. Existing export/refresh/search behavior unchanged. PASS git diff --check; tests/browser NOT_RUN for presentation-only adjustment.


## REPORTS-SEARCH-ICON-20261019

Owner requests slightly larger aligned quick-search icon. Icon13->16px, vertically centered with pointer-events disabled and input left padding40px to prevent text overlap. PASS git diff --check; tests/browser NOT_RUN for icon-only adjustment.


## REPORTS-TOOLBAR-LABELS-20261019

Owner requests labels alongside other toolbar icons like Word. Added optional showLabels flag to shared PDF/CSV actions (defaultfalse, enabled Reports only), with PDF/Excel labels and compact rounded buttons; Print/Refresh now have visible labels. Existing handlers/aria labels preserved. Toolbar wraps within bounds on narrow screens. PASS shared helper lint and production build (existing chunk warning); git diff --check. No export logic changes.


## REPORTS-BOTTOM-EXPORT-REMOVE-20261019

Owner requests removing the pictured Ready to Export Filtered Cohort Data bottom section. Removed only duplicate bottom export card; table-header PDF/Excel/Word/Print/Refresh actions remain. PASS git diff --check; tests/browser NOT_RUN for section-only removal.

## REPORTS-TABLE-FIT-20261019

Owner authorizes compact Reports ledger sizing at normal100% browser zoom using supplied80% screenshot as reference. Scoped desktop-only ledger CSS reduces cell padding, primary/secondary typography, avatars and search dimensions; automatic table column sizing and bounded horizontal scrolling retained. No data/action/export changes or browser zoom manipulation. Status: IN_REVIEW pending owner visual acceptance. PASS production build (existing chunk warning) and git diff --check. Browser visual comparison NOT_RUN. Reports tests attempted but runner stalled without results and was interrupted; no test pass claimed.

## REPORTS-DONUT-SIZE-20261019

Owner requests slightly larger Reports donut. Chart container128->144px, outer radius56->64px and inner radius34->39px preserve ring proportions. Existing data/colors/legend retained. IN_REVIEW pending owner visual acceptance. Runtime tests/build/browser NOT_RUN for sizing-only change; git diff --check PASS.

### REPORTS-DONUT-SIZE-20261019 � Further size adjustment

Owner requests another small increase: container144->160px, outer radius64->72px, inner radius39->44px. IN_REVIEW pending visual acceptance. PASS git diff --check; build/runtime tests/browser NOT_RUN for sizing-only adjustment.


## REPORTS-LEFT-TREND-20261019 - Left analytics card redesign

IN_REVIEW: Owner-authorized left-card-only redesign implemented on dev. Saved-data area chart; Day/Week/Month/Year grouping and custom Date Range. PASS20 focused/regression tests, touched-file lint, build and desktop/mobile checks. Await owner visual acceptance; no next ticket started. Evidence/limitations: PROGRESS.md.


## REPORTS-LEGEND-COLORS-20261019

Owner requests individual dot-matching pale backgrounds for donut legend rows and pale maroon header icon background with maroon icon. Reused existing segment hex palette with8-percent background/20-percent border alpha across categories; updated only right chart header icon colors. Data, sizes and chart behavior preserved. IN_REVIEW pending owner visual acceptance. PASS targeted Reports ESLint and git diff --check; build/tests/browser NOT_RUN for color-only change.


## REPORTS-TREND-SUMMARY-20261019

Owner requests reference-style summary items on the left chart in every Reports tab and asks why Week/Month/Year show one dot. Added3 real filtered-ledger summary items per tab with softly tinted circle icons: fees recovery/total/balance; students total/active/provisional; admissions total/approved/pending; batches weighted fill rate/saved capacity/remaining seats; faculty distinct instructors/weekly hours/assignments; finance inflow/outflow/net; demos total/converted/awaiting; assets records/book value/maintenance. Unknown ratio denominator shows Not available; no invented targets. Summaries are explicitly labeled ledger snapshots; custom chart dates apply only above. Single calendar-period data now renders actual total as a bar with an explanation; multiple periods retain area chart. No fabricated timestamps/history, right-card or ledger/export changes. Updated ambiguous table-header test to use semantic columnheader query after summary introduced same label. PASS31 tests, touched-file lint0/0, production build (existing chunk warning), git diff --check; isolated Edge32 tab/viewport fits and3 summary items per tab at320/390/1366/1440; all grouping controls produce single-period bars with QA receipt, custom range/tooltip/right donut/export/refresh/print checks. Screenshots/evidence: artifacts/reports-trend-summary-20261019. QA browser context isolated; owner data unchanged. Full suite/physical devices NOT_RUN. IN_REVIEW pending owner visual acceptance; no commit/push.


## FEES-KPI-FOOTERS-20261019

Owner requests screenshot-style bottom details on Fees tab top cards with correct live flow. Added recovery percentage/progress bar relative to actual issued fees and Monday-to-date collected amount; distinct unpaid-student and unpaid-challan counts; current Overdue status student/challan counts and View All action that clears search/resets pagination/selects existing Overdue filter; today verified receipt count. Main totals and footers share one branch-scoped helper. Today receipt amount/count use Asia/Karachi boundaries. Existing all-time Total Collected label and current overdue status rules retained (no invented YTD/15-day threshold, quota target, weekly growth claim, SMS automation or cohort average). Existing create/payment/refresh flow recalculates cards from saved overview. PASS8 helper/financial-service tests, touched-file ESLint0/0, production build (existing chunk warning), git diff --check, isolated Edge actual20-percent recovery, receipt count, two-student overdue View All/table flow and1440/1366/390/320 card-fit checks. Screenshot evidence: artifacts/fees-kpi-footers-20261019. Test records only in disposable browser context; owner data untouched. Full suite/physical devices NOT_RUN. IN_REVIEW pending owner acceptance; no commit/push.


## REPORTS-LEFT-COMPACT-20261019

Owner clarifies Reports left chart card: reduce height and anchor summary at the very bottom. Converted only trend card to flex-column, summary margin-top:auto, plot210->160px, reduced outer padding/header/footer gaps and summary padding/icons. Existing right donut and data logic unchanged. PASS3 focused component tests, targeted lint0/0, git diff --check; isolated Edge32 tab/viewport fit/control/export/right-card checks, plus explicit1440/390 footer geometry:13px bottom inset and160px plot. Screenshots: artifacts/reports-left-compact-20261019. Build/full suite NOT_RUN for spacing-only change. IN_REVIEW pending owner visual acceptance; no owner data changes/commit/push.


## REPORTS-TREND-TEXT-REMOVE-20261019

Owner requests removing the left-chart dates/grouping/timezone/event-count footer and single-period explanatory paragraph. Removed those display blocks and unused windowLabel prop/call site. Updated existing component assertions to reflect owner-requested text removal; preserved real bar/area data, controls, tooltip, summary and session warning. PASS3 component tests, touched-file lint and git diff --check. Build/browser NOT_RUN for text-only removal. IN_REVIEW pending visual acceptance.


## REPORTS-CHART-HEIGHT-TUNE-20261019

Owner requests slightly shorter left Reports card with taller internal chart. Plot160->180px; reduced outer vertical padding, header/metric/footer gaps, summary padding and header icon size to offset chart growth and compact total height. Bottom summary remains anchored. Right card/data unchanged. PASS targeted ESLint, git diff --check, isolated Edge1440/390 geometry checks: plot180px, footer9px bottom inset, card365.5px desktop/518.5px mobile. Screenshots under artifacts/reports-left-compact-20261019. Build/runtime suite NOT_RUN for spacing-only change. IN_REVIEW pending visual acceptance; no owner-data changes or commit/push.


## REPORTS-LEFT-HEIGHT-20261019

Owner requests another slight left-card height reduction. Reduced vertical card padding8->4px per side and metric/plot/footer gaps4->2px; chart remains180px, bottom summary alignment retained. No right-card/data changes. PASS targeted lint and git diff --check; build/tests/browser NOT_RUN for spacing-only adjustment. IN_REVIEW pending visual acceptance.


## REPORTS-LEFT-COMPACT-TUNE-20261019

Owner requests further compact height with adjusted content. Combined chart total label/value into a wrapping baseline row; tightened header typography and custom-date top gap. Plot remains180px and summary stays bottom-aligned. PASS targeted lint, git diff --check and isolated Edge1440/390 checks: card324.5/477.5px, footer5px inset, plot180px. No data/right-card changes. Build/tests NOT_RUN for presentation-only adjustment. IN_REVIEW pending visual acceptance.


## REPORTS-INNER-CHART-HEIGHT-20261019

Owner explicitly requires unchanged left-card height with taller actual graph. Kept180px chart container and all surrounding layout unchanged; reduced graph top margin8->2px and X-axis reserved height30->18px, tick margin10->3px/font10->9px. Actual drawing area142->160px (+18px) without resizing card. PASS targeted lint, git diff --check and isolated Edge before/after at1440/390: card remains324.5/477.5px, footer inset5px; drawing area142->160px on both. Evidence: artifacts/reports-inner-chart-height-20261019. Data, controls/right card unchanged. Build/tests NOT_RUN for axis-spacing-only change. IN_REVIEW pending visual acceptance.


## REPORTS-SUMMARY-BG-20261019

Owner requests nicer backgrounds on left-chart summary cards. Added pale maroon/emerald/amber fills and matching borders by summary position across Reports tabs. Existing icon colors, dimensions, chart height and data preserved. PASS targeted lint and git diff --check; tests/build/browser NOT_RUN for color-only change. IN_REVIEW pending visual acceptance.


## REPORTS-PLOT-EXPAND-20261019

Owner requests taller chart without taller card. Reflowed bottom summary label/value into compact single rows with full-text titles and preserved tinted backgrounds, reduced summary padding/icons. Redistributed recovered space to plot: desktop180->196px, mobile180->228px. PASS isolated Edge before/after: outer card unchanged324.5px desktop/477.5px mobile; drawing area160->176px desktop/160->208px mobile; bottom summary5px inset preserved. PASS3 component tests, targeted lint and git diff --check. No data/right-card changes. Build/full suite NOT_RUN for scoped layout change. IN_REVIEW pending visual acceptance. Evidence: artifacts/reports-inner-chart-height-20261019/expand-check.cjs.


## BRANCH-KPI-STYLE-20261019

Owner requests slightly taller Branch Management summary cards and cross-tab colors. Reused shared top-kpi-card class for maroon/emerald/sky gradients, borders and hover. Added104px minimum content height with16px padding for the3 summary cards only. Existing labels/counts/icons and branch directory cards unchanged. PASS targeted lint and git diff --check; build/tests/browser NOT_RUN for presentation-only change. IN_REVIEW pending visual acceptance.


## REPORTS-DONUT-FIT-20261019

Owner requests larger donut within unchanged section height. Retained160px chart container and surrounding layout; outer radius72->78px, inner44->48px, giving156px donut diameter inside existing160px space. Data/legend/card dimensions unchanged. PASS targeted lint and git diff --check; browser/build/tests NOT_RUN for radius-only change. IN_REVIEW pending visual acceptance.


## BRANCH-KPI-TEXT-20261019

Owner requests larger text in Branches summary cards. Headings11->13px with slightly tighter tracking; values20->24px. Existing104px minimum height, backgrounds, icons and calculations preserved. PASS targeted lint and git diff --check; browser/build/tests NOT_RUN for typography-only change. IN_REVIEW pending visual acceptance.


## BRANCH-CREATION-PAUSE-20261019

CONFIRMED owner instruction: client currently agreed two branches; preserve all existing saved branches, but pause ALL new branch creation including Super Admin until owner explicitly requests re-enabling. This supersedes currently available frontend creation behavior; it does not delete extra existing branches, alter their assignments, or authorize new subscription/license infrastructure. Added centralized source-controlled branch-creation pause policy with no user-facing enable switch; Add Branch disabled even before data loads with visible explanation. Organization service rejects creation after authorization and rejects unknown IDs to prevent creation disguised as edit. Existing branch viewing/editing/lifecycle remain available under existing rules. No storage migration/reset or owner-record writes. Existing configured license count is not changed by this temporary pause.

PASS10 organization service tests covering Super Admin/new creation rejection, exact stored organization and assignment preservation, existing-branch edits/lifecycle, unknown-ID bypass rejection, other-role denial and staff/settings regressions. Replaced superseded positive-creation/limit tests; existing branch fixtures now seed test storage only. PASS touched-file ESLint0/0, production build (existing chunk warning), git diff --check; disposable Edge disabled Super Admin Add Branch, direct service denial, preservation of3 QA branches and existing edit enabled. Evidence: artifacts/branch-creation-pause-20261019. Full suite NOT_RUN. This is frontend/mock-service enforcement; production backend enforcement remains a later authorized task. IN_REVIEW pending owner acceptance; no commit/push.


## BRANCH-EDIT-DELETE-20261019

IN_REVIEW: Owner authorizes Branch Edit/Delete and confirms deletion only for empty inactive branches. Edit/confirmation UI, service and mock adapter checks implemented; Add Branch remains paused. PASS80 relevant organization/database/auth/access tests, touched-file lint, build, diff check and actual desktop/mobile browser workflows. Await owner acceptance.


## BRANCH-STATUS-NAME-20261019

IN_REVIEW: Owner requests working Active/Inactive controls and name-only Edit. Core and custom branch toggles now supported with existing current/last-usable/unfinished-operation guards. Edit UI/service persist only name. PASS53 organization/auth/access tests, touched-file lint, build, diff check and actual desktop/mobile workflow. Await owner acceptance.


## BRANCH-DELETE-ADMIN-EXCEPTION-20261019

IN_REVIEW: Owner allows empty inactive branch deletion when only Super Admin assignments remain. Non-admin staff and all operational records still block deletion. Admin branch-access cleanup and dialog explanation implemented. PASS55 organization/auth/access tests, lint/build/diff check and disposable browser workflow. Actual owner branch was not deleted.


## BRANCH-PLACEHOLDER-TEXT-20261019

Owner asks meaning/removal of pictured DEMO code and Demo campus location. Removed generic/missing placeholders from branch card display; real saved codes/locations remain. Missing location also omits its map icon/separator. No persisted branch fields or workflows changed. PASS targeted lint and git diff --check; build/tests/browser NOT_RUN for display-text-only change. IN_REVIEW pending visual acceptance.


## BRANCH-DELETE-BLOCKER-DETAILS-20261019

Owner reports generic linked-record error and asks why deletion is blocked. Deletion check now reports exact nonzero counts for every linked collection (courses, fields, subjects, batches, students, admissions, enrollments, scheduled classes, fee challans, payments, expenses, demo inquiries, assets, faculty assignments). No deletion policy/data mutations changed. Actual owner branch records were not accessed; exact cause will display on retry. PASS20 organization tests, targeted lint and git diff --check; build/browser NOT_RUN for error-message-only change. IN_REVIEW.


## D-BRANCH-PURGE-20261019

EXECUTED: Owner explicitly authorizes permanent one-time deletion of only branch d, superseding normal empty/inactive restrictions for this exact branch. Exact ID confirmed from local recovery metadata and matched against current browser saved organization before deletion. Tested isolated cleanup first, then ran in owner Chrome via a temporary localhost page. Private backup acknowledged before any write. Actual verified deletion removed branch d, its1 linked asset, target counters and branch-specific staff assignments; other operational collections had0 target records. Post-write equality checks confirm all other-branch records preserved. Staff accounts/other branch access preserved. Browser callback returned success. Backup/result/helper in git-ignored private-data/d-branch-purge; temporary public cleanup page removed after success and local helper stopped. No general force-delete functionality added and Add Branch pause remains unchanged. PASS isolated target-only/backup/preservation test and actual result verification; git diff --check. No build required (no persistent application code change). Owner may refresh Branch Management. No commit/push.


## BRANCH-CARD-CLEANUP-20261019

IN_REVIEW: Owner requests deleting d backups, removing branch eye/View action and unique card colors. Removed dedicated purge backup/helper folder after absolute-path containment check; redacted only d entries/assignments/counters from5 historical recovery copies. Removed unused View dialog/state/import and added stable per-branch rose/sky/emerald/amber gradients with translucent count strip. PASS lint/build/diff and desktop/mobile action/color checks. Await visual acceptance.


## REMOVE-WORKSPACE-FLOW-20261019

Owner explicitly authorizes removing the obsolete Workspace screen and all shipped source references. Root always redirects to login, including with a restored demo session. Successful login opens Dashboard directly for one branch or after branch selection. Removed WorkspacePage and route; obsolete URL now uses existing Not Found handling. Renamed shared shell CSS/theme tokens to app-* and baseline permission to dashboard.view with unchanged assigned-role/branch checks. Preserved historical records and unrelated in-progress changes. Branch-switch keyboard focus survives Dashboard shell remounts. IN_REVIEW pending owner acceptance.

Verification addendum:87 focused tests pass across final per-file runs; lint/build/browser/diff pass. Full suite initially479/495, with10 permission-test rename failures corrected and6 broader stale UI expectation failures remaining; full suite not rerun. See PROGRESS REMOVE-WORKSPACE-FLOW-20261019.


## BRANCH-SUMMARY-BG-20261019

Owner requests improved background for branch courses/batches/students count strip. Replaced translucent white fill/border with subtle6% maroon fill and10% maroon border; existing dimensions, card colors and behavior preserved. Changed BranchesPage.jsx only. PASS targeted ESLint and production build (existing chunk-size warning). Unit/browser tests NOT_RUN for styling-only change. IN_REVIEW pending visual acceptance; no commit/push.


## BRANCH-CARD-SIZE-20261019

Owner authorizes taller branch cards and larger text. BranchesPage branch cards now have190px minimum content height (200px at sm+),20px padding,18px branch title and14px metadata/count strip with12px status badge. Count strip aligns at bottom; header/counts wrap on narrow screens. Existing gradient/maroon strip and all actions/data unchanged. PASS targeted ESLint, production build (existing chunk warning), existing isolated browser desktop/mobile route and login checks. Unit tests NOT_RUN for styling-only change. IN_REVIEW pending visual acceptance. No commit/push.


## FRONTEND-PERF-20261019 (continued 2026-10-20)

IN_REVIEW. Owner attachment explicitly authorizes scoped frontend performance work directly on dev, preserving all existing uncommitted changes. No backend, dependencies, persistent schema changes, data migration, UI redesign, commit or push. Lightweight inspection found eager page imports, repeated normalization/validation/JSON work and repeated per-challan payment scans; no artificial loading delay was found. Real Web Locks, permission rechecks, loading/error states and branch scope remounts remain.

Implemented lazy protected page boundaries, cached module promises and authorized sidebar hover/focus preloading. Added a bounded detached normalized database snapshot keyed by current raw database and organization values, storage identity and existing read-mode flags. Writes invalidate it; every read still checks actual storage, including external changes. Added detached organization parse snapshot with raw comparison and write invalidation. No cached permission grant or financial result bypass. Reports verified payments now use one memoized challan index, preserving status/order/formula semantics. Faculty UI regression test awaits loaded roster data instead of only its pre-data heading.

Changed application/test files: src/routes/{AppRouter.jsx,ProtectedRoute.jsx,routeModules.js}; src/components/Layout/Sidebar.jsx; src/mock/{mockDatabase.js,mockOrganization.js,storagePerformance.test.js}; src/pages/Reports/ReportsPage.jsx; src/pages/FacultyClasses/FacultyClasses.test.jsx. All other existing edits retained.

PASS targeted ESLint, production build (one final production build executed), git diff --check. Entry JS chunk322.93KB (gzip102.17KB), formerly2846.16KB (gzip1131.26KB); remaining exportHelpers1171.90KB chunk still warns. This is entry chunk size, not total app transfer or a claimed89% latency improvement.

Full Vitest executed ONCE:493/500 pass,7 fail. Six pre-existing mismatched expectations remain (AdminOperations branch-create and removed Branch Comparison, plus four Student Profile heading expectations; also present before this task). The seventh was a faculty test reading roster before loading completed; changed to await the actual student. Focused follow-up9/9 pass including all4 faculty screen tests and5 cache contract tests. All other full-suite tests pass, including auth, finance/payments, admission/enrollment, faculty service, dashboard daily classes, reports/filter/chart and export tests. No second full suite run. Earlier test-only cache guard test was corrected to use authorized academic adapter rather than the generic collection primitive; canonical guard then passes.

PASS isolated Edge155.0.4283.62 four-role allowed-module and restricted-route QA, all8 report tabs and all5 grouping modes, custom start/end dates, actual CSV/PDF downloads, mobile390px no document overflow, mobile drawer navigation and branch edit dialog; no browser page errors. Owner's browser/storage never touched. Existing disabled/denied navigation entries are preserved; e.g. Teacher fees/finance direct routes deny access.

Performance evidence/methodology and limitations are in artifacts/frontend-perf-20261019/REPORT.md and JSON. Results are mixed: do not claim universal navigation/modal/refresh speedup or under100ms compliance. Synthetic throttling/large production datasets and exhaustive manual role workflow acceptance NOT_RUN. Owner acceptance remains required; no production security claim.

Final evidence: artifacts/frontend-perf-20261019/REPORT.md. Paired end-to-end warm median158->164ms (no gain), Reports tabs203.5->192ms, search94->81ms, branch482->450ms, modal151->285ms, refresh984->1183ms; mixed outcomes explicitly disclosed. Controlled100-read adapter check34.1->22.2ms. No universal speed/under100ms claim. Ticket remains IN_REVIEW.


## TAB-LOADING-FIX-20261020

ACTIVE / IN_REVIEW pending final verification and owner browser acceptance. Owner attachment explicitly authorizes fixing repeated loading/flicker and all seven previously reported test failures directly on dev. No new branch/worktree, dependency, backend, schema change, redesign, commit or push. Existing Reports charts and all unrelated working changes preserved.

Reproduced in isolated Edge155: page remounts reset loaded data to null/empty/loading and re-enter async Web Lock/service reads. Visible sources: SuperAdminDashboard Loading dashboard; AdmissionsPage Loading admissions plus NewAdmissionForm Loading academic configuration; FacultyClassesPage State Loading Faculty & Classes; CoursesBatchesPage microtask setData(null); FeesPage Loading fee records. Students/Finance/Demos/Assets had the same null-state pattern. Providers remain above routes and do not remount on ordinary navigation. Lazy fallback reused SessionStatus auth-restoration text even for genuine module loading; fallback text now distinguishes uncached module loading.

Implemented bounded24-entry detached presentation snapshots in services/localPageResources.js, populated only by successfully loaded page data. Initialization checks canonical raw database, organization, session and current Karachi/UTC dates. Any change discards all snapshots; older in-flight reads cannot repopulate a changed version. Existing services/locks/auth checks still revalidate on every mount; no async loader is hidden when data is actually unavailable. Raw snapshot input is never written by this helper. Logout explicitly clears retained page data; test teardown clears transient snapshots for isolation. Only data is reused: filters, dialogs, pagination and unsaved forms retain their existing reset behavior. Genuine initial/cache-miss/dirty-scope/error/loading states remain. Admission form reference data uses the same guard. Snapshot restore resets transient request/scope markers to the current mount, preventing cached requests from looking perpetually pending.

Edge frame sampling: two warm rounds through Dashboard/Admissions/Students/Faculty/Courses/Reports/Fees rendered14/14 transitions without a loading frame or blank frame. First uncached visits retain genuine loading. Broader acceptance includes13 modules, mobile drawer routes, refresh, branch switching, logout/login and actual disposable enrollment, verified payment and faculty assignment writes. No owner browser profile or saved owner data touched. Initial document bootstrap/refresh may still contain empty pre-React frames; no blanket no-blank claim for cold loads.

Previous failing tests investigated: branch creation intentionally paused (test now verifies disabled creation plus real name-only edit/persistence); removed Branch Comparison replaced by current Reports tabs/columns; Student Profile generic heading replaced by the actual loaded Student details label (CardTitle is a div, not heading); faculty test already waits for loaded roster. No tests removed/skipped, no production feature removed to pass tests. Focused final33/33 PASS. New page-resource tests cover raw DB/org/session changes, out-of-band writes, stale in-flight generations, detached data, bounded retention, logout and unavailable storage. Warm component test checks valid local data stays visible during service revalidation and genuine error still renders.

Full Vitest running ONCE after fixes, using one worker to avoid measured jsdom/transform contention; final result to be appended. Full ESLint0 errors/warnings PASS; production build PASS with existing large export chunk warning. Final before/after timing report will distinguish sampled warm transitions from cold, refreshed or invalidated scopes. Ticket remains IN_REVIEW until owner acceptance.


### TAB-LOADING-FIX-20261020 final verification

IN_REVIEW. Final focused33/33 PASS; full Vitest executed ONCE after fixes:508/508 PASS,0 failed, all previous seven failing cases included. Full ESLint0 errors/warnings PASS; final production build PASS (existing1171.90KB export chunk warning) and git diff --check PASS. Text-only genuine-loading label correction included in final build. Paired Edge core sequence warm median217.5->197.5ms; first-visit round median298->252ms. Final before warm loaders11/14 versus after0/14; after blank frames0/14. Broader13-module warm round also0 loaders/blank; real enrollment/payment/faculty-assignment propagation, mutation invalidation, branch frame isolation and logout clearing PASS. Refresh785->856ms shows no confirmed paired improvement; modal170->169ms essentially unchanged. Cold bootstrap/refresh empty pre-React frames and genuine initial/dirty-scope loaders are explicitly recorded, not hidden or counted as warm PASS. Detailed per-case A-G flags/timings, file list and evidence in artifacts/tab-loading-fix-20261020/REPORT.md. Eighteen source/six test files plus docs touched in this scope; existing unrelated changes preserved. No commit/push; owner browser acceptance is next approval.


## SETTINGS-BRANDING-ONLY-20261020

Owner explicitly requests removing Settings section tabs and their corresponding panels, retaining only Branding & Visual Identity in the existing design. Removed six section selectors/profile/academic/fee/roles/branch/alerts panels, obsolete state/imports and unnecessary academic read. Branding/name/logo/sidebar preview, Save/Cancel/default reset remain. Existing hidden profile metadata is loaded and preserved on saves; save/reset disabled until saved settings are available. SettingsPage.jsx only application file changed. PASS targeted ESLint, production build (existing export chunk warning), AdminOperations integration4/4 and isolated Edge only-branding/save/hidden-metadata preservation/desktop1440 and mobile390 fit checks. Full suite NOT_RUN for scoped UI removal. Existing uncommitted work retained; no commit/push. IN_REVIEW pending owner visual acceptance.


## USERS-POLICY-PANEL-REMOVE-20261020

Owner requests removing Users Role Access Policy Grants display section. Removed only that card and its unused KeyRound/canAccess/PERMISSIONS imports from UsersPage.jsx. Kept role filters, assignment inputs, actual authorization policy, staff actions and KPI cards. PASS targeted ESLint, production build (existing export chunk warning), git diff --check and isolated Edge panel absence/users table/Add Staff role choices. Unit/full suite NOT_RUN for display-only removal. Documentation updated; IN_REVIEW for visual acceptance; no commit/push.


## RECENT-ENROLLMENTS-TODAY-20261020

Owner-authorized scope: Dashboard Recent Student Enrollments card shows only the current Asia/Karachi calendar day's saved enrollments. Existing active branch, period/search filters, latest-five limit, student links, fee calculations and View all admissions navigation remain. Desktop/mobile share the filtered list. Enrollment display dates use the same academy timezone; existing minute clock updates the day after midnight. Subtitle/empty state explain today's scope. Added reusable isOnAcademyDay predicate without changing existing local date-input formatting.

Status: IN_REVIEW pending owner acceptance. Changed application files: Client/src/components/Dashboard/SuperAdminDashboard.jsx, Client/src/utils/formatDate.js, Client/src/utils/formatDate.test.js. PASS: targeted Vitest22/22 (date boundaries/invalid dates/day rollover plus existing dashboard regressions), touched-file ESLint, production build. Existing large export chunk warning remains. Browser/manual workflow and full suite NOT_RUN for this scope. No backend, saved owner records, permissions or layout changes; no commit/push. Existing unrelated working-tree edits preserved.


## RECENT-ENROLLMENTS-PAGINATION-20261020

Owner-authorized change: Dashboard Recent Student Enrollments now reuses Shared/Pagination.jsx below desktop/mobile rows, including empty state. Default10 with existing10/15/25/50 choices, matching record range, page numbers and previous/next controls. Replaced latest-five truncation with pagination over all matching today's active-branch enrollments. Existing newest-first order, period/search filters, dues and navigation preserved. Page resets on filter/search/branch/academy-day/row-size changes and clamps on data shrink. This supersedes the prior latest-five limit only.

Status IN_REVIEW pending owner visual acceptance. Application changes: Client/src/components/Dashboard/SuperAdminDashboard.jsx and Client/src/pages/Dashboard/DashboardPage.test.jsx. PASS final Dashboard14/14 including12-record pagination fixture, prior-day exclusion, next page, row-size reset and search reset. Initial test assertion had a shell-encoding character issue and lazy-load wait; corrected test passes. PASS touched ESLint, production build (existing large export chunk warning), diff whitespace check. Browser/manual and full suite NOT_RUN. Updated TASKS/FEATURE_TICKETS/PROGRESS/MEMORY. Existing unrelated edits preserved; no commit/push, dependencies or data mutation.


## ADMISSIONS-FILTERS-PAGINATION-20261020

CONFIRMED owner change: Admissions application table gains shared pagination (default10;10/15/25/50), record range and page controls, plus All/Daily/Weekly/Monthly/Yearly/Custom segmented period controls above the table. Saved application createdAt drives the date filter in Asia/Karachi. Weekly means current Monday-Sunday; monthly/yearly current calendar month/year. Custom dates include both boundaries, require both dates and reject reversed ranges. Search/status/date filters intersect with active branch. Page resets on filter/row-size changes and clamps after data shrink; selection header toggles current page, Select all matching and exports cover all matching records. Clear filters resets date/search/status. No changed admission actions, form design or permission policy.

Supporting fix found by isolated browser: ordinary new admission createdAt previously used UTC date-only, excluding a newly saved application from Daily between Karachi midnight and05:00. New ordinary/instant admissions save academy calendar date through getAcademyDateOnly; historical saved records and financial issue/due dates remain untouched. No Server changes, migrations, dependencies or owner data mutations. Scope files: AdmissionsPage.jsx/test, utils/admissionPeriod.js/test, utils/formatDate.js, mock/mockDatabase.js (two admission creation timestamps and import only), mock/admissionTransaction.test.js.

Verification: touched ESLint PASS, production build PASS (existing large export chunk warning), whitespace check PASS. Isolated Edge PASS six periods, custom endpoints, next page, reset, CSV all12 matches despite two pages,1440desktop/390mobile without page overflow and no JS errors. Browser fixture records existed only in disposable browser storage. Initial33 focused tests PASS; expanded final test results recorded below. Earlier interim expanded run48/50 included old-page-return regression (fixed and retested) and a cold-load CRUD timing failure. IN_REVIEW pending owner acceptance; no commit/push; unrelated working-tree edits preserved.

Final verification: PASS 96/96 tests across all nine Admissions page suites, admission calendar/date helper suites and mock admission transactions. Zero final failures. Full repository suite NOT_RUN for this scoped task. IN_REVIEW for owner visual acceptance.


## FACULTY-OVERFLOW-20261020

Owner-authorized fix: Faculty & Classes page-wide horizontal scrolling at laptop widths. Browser reproduced instructor profile action header extending document to1287px at1280viewport and1034px at1024viewport. Localized FacultyClassesPage.jsx classes allow profile header/actions and roster toolbar to wrap; set min-width0 on page/grid columns and profile identity, allow long identity text to wrap. All actions/data/permissions preserved; no global overflow hiding or unrelated module redesign.

IN_REVIEW pending owner visual acceptance. PASS isolated Edge checks for directory/subject assignments/batch assignments/class schedule at1440,1280,1024,768,390px (20 combinations): document scrollWidth matches viewport after fix. Existing mobile module nav retains its own contained scrolling. PASS FacultyClasses4/4 tests, touched ESLint, production build with existing large export chunk warning, diff whitespace check. Full suite NOT_RUN for scoped layout correction. Files: FacultyClassesPage.jsx plus task/progress/ticket records and browser check artifact. Existing unrelated changes preserved; no commit/push. No further implementation authorization needed; next approval is owner visual acceptance.


## ADMISSIONS-COMPACT-TOOLBAR-20261020

Owner requests moving Admissions period controls to the right of search on the same row with smaller text. AdmissionsPage.jsx only application change: compact period buttons (10/11px text, reduced padding), search/period/status/export in one wrapping toolbar; custom dates remain below. Application-date/timezone explanation retained accessibly. No filtering/paging/export logic changed. PASS AdmissionsPage5/5, touched ESLint, production build (existing chunk warning), whitespace check. Isolated Edge PASS search/period same-row positioning at1600/1440/1280/1024, no page overflow at those widths or390mobile, mobile custom inputs visible and fit. Full suite NOT_RUN. IN_REVIEW pending owner visual acceptance. Docs TASKS/FEATURE_TICKETS/PROGRESS updated; artifacts/admissions-compact-toolbar-20261020 contains checks/screenshots. Existing unrelated edits preserved, no commit/push. Next approval: visual acceptance.


## FEES-PERIOD-TOOLBAR-20261020

CONFIRMED owner request: Fees ledger gains compact All/Daily/Weekly/Monthly/Yearly/Custom controls to the LEFT of a narrower search on the same desktop toolbar; mobile wraps. Filters use saved challan issueDate in Asia/Karachi, current Monday-Sunday week/month/year and inclusive custom endpoints. Incomplete/reversed custom ranges show no matches with guidance. Date/search/status filters intersect in active branch; chip counts match date scope; pagination and selection reset on filter changes. Shared selection receives current page rows. CSV/PDF use existing matching/selected scope; KPI calculations remain unchanged. Reset clears dates/search/status. Overdue View All and dashboard receipt navigation restore All dates to preserve their intended destination.

Extracted existing Admissions calendar logic unchanged into utils/reportingPeriod.js; admissionPeriod.js retains compatibility aliases. No financial formulas, payment authorization, persistence, Server or dependencies changed. Source files: FeesPage.jsx, utils/reportingPeriod.js, utils/admissionPeriod.js. Tests: new FeesPage.test.jsx plus financialService.test.js preload of Dashboard/Fees modules before receipt navigation assertions to exclude lazy module transformation timing; all original assertions preserved.

PASS31/31 final tests:26 across Fees page, Admissions page, calendar boundaries and KPI metrics; financial service5/5 including saved verified receipts/branch isolation/dashboard selected-payment navigation. Initial new-test selector mismatches corrected; initial service navigation timed out on Loading module, corrected harness preloads routes. PASS touched ESLint, production build (existing1171.90KB export chunk warning), whitespace check. Isolated Edge PASS period controls left of search/same row at1600/1440/1280/1024 and390mobile/custom no overflow; real service-created disposable demo challans verify all six periods, search, custom inclusive range, CSV date scope, Reset and zero JS errors. Owner browser data untouched. Artifacts: artifacts/fees-period-toolbar-20261020. Full repository suite NOT_RUN. IN_REVIEW pending visual acceptance; no commit/push; unrelated edits preserved. Updated TASKS/FEATURE_TICKETS/PROGRESS/MEMORY; next approval owner visual acceptance.


## SETTINGS-BRANDING-DESIGN-20261020

Owner authorizes visual polish of Branding & Visual Identity only. SettingsPage.jsx now uses a soft theme-tinted maroon/white gradient, icon-led header, three white identity/color/logo field cards, bordered color-swatch tiles and framed sidebar preview. Small sky/slate tint balances the sidebar section; primary accents still follow configured theme tokens. Responsive grids/wrapping preserve desktop/mobile fit. Added explicit input labels and semantic sidebar section. Original upload validation/file reader, save/cancel/reset handlers and hidden settings persistence are unchanged. No extra sections, packages or workflows introduced.

PASS12/12 AdminOperations/branding-context regression tests, touched ESLint, production build (existing export chunk warning), whitespace check. Isolated Edge verifies1440/1024/768/390 widths without page overflow, live color preview, Cancel, Save/reload, Reset and no JS errors; visually reviewed desktop screenshot. All browser changes used disposable demo storage, no owner records changed. Upload handler unchanged; additional file-upload browser regression NOT_RUN. Full repository suite NOT_RUN. IN_REVIEW pending owner visual acceptance. Application file: Client/src/pages/Settings/SettingsPage.jsx; task/progress/ticket/design records updated. Screenshots/check: artifacts/settings-branding-design-20261020. No commit/push; unrelated edits retained. Next approval: owner visual review.


## ADMISSIONS-DEFAULT-SUBJECTS-20261020

CONFIRMED owner change: selecting a course in the Admissions form selects all its currently available active subjects by default. Manual subject deselection/reselection remains available. Selecting an additional course adds only that course's active subjects, preserving manual exclusions in already selected courses. Removing a course removes its subjects; selecting it again defaults all its active subjects again. Legacy course-dropdown selection also defaults subjects. Opening an existing saved admission preserves its recorded subject subset, and unrelated field edits never reselect excluded subjects. Subject buttons now expose aria-pressed. No blanket effect, persistence change or new subject/fee records.

Application file: Client/src/components/Admissions/NewAdmissionForm.jsx. New focused tests: NewAdmissionForm.subjects.test.jsx. PASS53/53 across all nine Admissions page suites plus three subject-selection tests. Additional fee-total assertions PASS focused3/3: all active subjects default, inactive excluded, manual exclusions retained across multi-course changes, removed/reselected course behavior, dropdown, submitted selected IDs, saved subset preservation and total3,000->2,000 after manual unselect. PASS touched ESLint, production build (existing large export chunk warning), whitespace check. Isolated Edge using real service-created disposable demo subjects PASS default selection, manual unselect, unrelated edits, course removal/reselection. Initial browser locator ambiguity with batch label corrected; no application defect. Full repository suite NOT_RUN. Existing owner data and unrelated edits preserved. No commit/push. IN_REVIEW pending owner visual acceptance; next approval owner review. Artifacts: artifacts/admissions-default-subjects-20261020.


## SETTINGS-LOGO-COMPACT-20261020

Owner requests removing Settings Cancel and keeping the Academy logo card height stable when a logo is supplied. Removed Cancel button/unused cancel handler only. Logo format/size help, compact32px thumbnail and Remove share a reserved40px footer row; no conditional block extends the field card. Upload validation, Save, Remove, Reset and preview remain. Application file: Client/src/pages/Settings/SettingsPage.jsx. Existing unrelated changes preserved; no commit/push.

PASS touched ESLint, production build (existing export chunk warning), whitespace check. Isolated Edge PASS Cancel absent, PNG upload/preview/Remove, persisted logo restored after Save/reload, no page overflow and equal card heights before/after upload/remove at1440/1024 (150px) and768/390 (154px). Browser used disposable demo storage. Initial AdminOperations3/4 PASS; unrelated Assets creation test hit existing10000ms timeout during concurrent browser verification; sequential rerun result below. Full repository suite NOT_RUN. IN_REVIEW pending owner visual acceptance; next approval owner review. Docs TASKS/FEATURE_TICKETS/PROGRESS updated; evidence artifacts/settings-logo-compact-20261020.

Final sequential AdminOperations rerun: PASS4/4, zero failures; no test or application changes needed for interim timing failure.


## SETTINGS-BACKGROUND-20261020

Owner requests slightly more distinct light background so branding content stands out. SettingsPage.jsx only application change: soft rose/lavender/sky outer gradient, rose header and lavender/slate/sky sidebar-section background; existing white inner field cards and configured live sidebar preview colors retained. Dark-mode variants included. No layout/data/handler changes. PASS touched ESLint, production build (existing export chunk warning),1440desktop/390mobile browser fit and desktop screenshot visual review, whitespace check. Tests/full suite NOT_RUN for background-only edit. IN_REVIEW pending visual acceptance. TASKS/FEATURE_TICKETS/PROGRESS updated; screenshots in artifacts/settings-background-20261020. Existing edits preserved; no commit/push. Next approval: owner visual review.


## GLOBAL-TIME-12H-20261020

CONFIRMED owner-authorized global presentation change; IN_REVIEW pending owner acceptance. Central utils/timeFormat.js formats strict saved HH:mm/already12h clock values, whole known schedule ranges and user-facing timestamps with explicit Asia/Karachi timezone. Existing formatClassTime compatibility delegates to central formatter; class shift/period functions unchanged. Midnight/noon display12:00 AM/PM, afternoon/night numeric hour without leading zero. Invalid/missing values return explicit fallback; relative text stays unchanged. Timestamp offsets are respected; offset-free local ISO presentation is interpreted as Karachi; date-only fields never gain clock or shift day.

Shared Input delegates type=time to TimeInput: h:mm field plus AM/PM selector, returning canonical HH:mm to existing handlers. Partial/invalid input emits empty canonical value rather than retaining a stale valid time; disabled/required/read-only and existing labels remain. No persistence migration, schema/API representation, auth/branch policy, calculation, overlap, duration, date-filter, sorting, attendance/payment or countdown changes. Existing overnight validation remains unchanged (current create flows reject end<=start); formatting23:00->01:00 preserves endpoints without inventing a duration/date.

Presentation consumers updated: Dashboard class slots/enrollment timestamps/daily chart labels and role schedule labels; Faculty roster/timetable/saved assignment labels and room-conflict message; Courses/Batches tables/modals/CSV/PDF; Admissions subject/batch/clash timings and status history timestamps; Student profile subjects; Demo requested/scheduled/history timings and labels; Reports table time projections, human-readable enrollment CSV timestamps; PDF generated-at timestamp. Existing Faculty/profile/shift/demo export callers already using formatClassTime receive centralized output. Fees/Finance, Assets, Users and Settings audited: date-only fields remain date-only where no time was displayed. Raw API batchTiming and ISO dateTime attributes remain machine-compatible. No new dependencies, worktree/branch, Server changes or owner-data mutation. Existing performance/cache and unrelated edits preserved.

PASS focused tests 144/144: core35 (midnight/noon13:00/23:59, invalid/offset/date boundaries, input roundtrip, existing conflict/countdown/shift), modules92 (Faculty, Dashboard, Admissions, Reports, Students, Demos, daily classes and Word), export/form17 (Courses, PDF templates, default subject flow). Updated only two existing display assertions for new AM/PM labels/input8:00; storage assertions still expect08:00. PASS targeted ESLint on all24 scoped source/test files. ONE production build executed, PASS with existing1171.88KB export chunk warning. PASS whitespace check. Full repository suite NOT_RUN, as focused checks requested.

Isolated Edge: class assignment Create noon12:00 PM->1:30 PM saves12:00/13:30; Edit1:00 PM->2:15 PM saves13:00/14:15; Reload retains fields/PM. Actual teacher and room conflicts still reject; room error uses1:00 PM. Countdown at Karachi12:45 is Starting Soon with15 minutes. Same1:00 PM-2:15 PM displayed in Dashboard, Faculty, Admissions, Reports and batch directory. Batch CSV/PDF include AM/PM; profile print fires; enrollment CSV human timestamp12:45 PM while saved ISO remains unchanged. Mobile390 modal controls fit; desktop1440 checked. All four authorized roles and both allowed branches navigated without foreign branch data or JS errors. Browser scripts use only disposable demo storage. Initial browser harness selector/unsupported fixture-account mismatches corrected; no related application defects or workflow changes. Evidence/scripts/screenshot and complete24-file scope in artifacts/global-time-12h-20261020. No commit/push. Next approval: owner acceptance; STOP after authorized task.


## SETTINGS-MAROON-BG-20261020

Owner requests stronger light maroon Branding & Visual Identity background with white inner cards. SettingsPage.jsx presentation classes only: outer/header solid soft maroon #f3dfe4; identity fields/sidebar section/color tiles/preview frame white. Configured live sidebar preview color remains dynamic, preserving color controls. No layout or handler changes. PASS targeted ESLint, production build (existing chunk warning), whitespace check. Tests/browser NOT_RUN for color-only edit. IN_REVIEW pending visual acceptance. TASKS/FEATURE_TICKETS/PROGRESS updated; prior edits preserved; no commit/push. Next approval: owner visual review.


## GLOBAL-TIME-PICKER-20261020

CONFIRMED owner-authorized enhancement; IN_REVIEW until owner acceptance. Shared TimePicker (time-input.jsx, TimeInput compatibility alias) remains the single implementation behind every Input type=time. Supports h:mm plus AM/PM or complete typed9:07 AM, arbitrary valid minutes00-59, normalizes on blur, and emits existing canonical HH:mm to unchanged save handlers. Compact clock-triggered native select supplies96 quarter-hour suggestions across both AM/PM and fills immediately. Native popup avoids CSS/modal overflow clipping and uses OS keyboard/touch behavior; disabled/read-only/required semantics retained. Invalid13:70 emits empty canonical value and fails validity. Existing same-day/overnight/start-end scheduling policies are unchanged.

Coverage: existing Faculty assignment, Batch form and Demo registration/schedule time inputs inherit picker; Admissions/Dashboard schedule editing entry points use those forms. No new time fields added to modules that only display times. Previous centralized AM/PM displays, reports/PDF/CSV, timezone and date-only behavior remain. No persistence/schema/migration, duration/overlap/countdown/financial/permissions/cache changes or dependencies.

Scope6 code/test files: components/ui/input.jsx, components/ui/time-input.jsx, components/ui/time-input.test.jsx, utils/timeFormat.js, utils/timeFormat.test.js, components/CoursesBatches/AssignFacultyModal.test.jsx. PASS37/37 distinct focused tests across two reports (36 initial plus1 new ordering case; repeated tests counted once). Tests cover complete/custom-minute input,96 suggestions and immediate selection, keyboard focus, midnight/noon, invalid entry, saved custom-minute prefill, original Demo create flow and canonical save/ordering/conflict/daily-class logic. Targeted ESLint on all6 files PASS. ONE production build PASS (existing1171.88KB export chunk warning). Whitespace check PASS. Full repository suite NOT_RUN for scoped enhancement.

Isolated Edge PASS manual9:07 AM creates09:07; suggested2:15 PM creates14:15; keyboard End suggestion23:45, midnight/noon options,13:70 rejection; Create-Save-Edit-Refresh preserves custom and edited times. Desktop1440/mobile390 modal fit with additional dropdown; touchscreen focus and keyboard dropdown navigation; native suggestions remain inside platform popup rather than a clipped DOM list. Existing teacher/room conflicts,15-minute Dashboard countdown, identical Faculty/Courses/Admissions/Dashboard/Reports schedules, batch PDF/CSV, enrollment timestamp CSV and print, all four roles/both authorized branches with no JS errors also PASS. Existing overnight rejection rule retained; no new policy. Browser tests used disposable demo storage. Evidence scripts/screenshot in artifacts/global-time-picker-20261020. TASKS/FEATURE_TICKETS/PROGRESS/MEMORY/FRONTEND_INTEGRATION updated. dev unchanged; no worktree/branch/commit/push/reset/stash/clean. Prior uncommitted edits preserved. No blockers; next approval owner visual acceptance; STOP.


## BATCH-SHIFT-NAMES-20261020

CONFIRMED owner-approved scope: Add/Edit Batch replaces start/end time controls with optional No shift selected/Morning/Evening select. Saved shift is null (none) or Morning/Evening, explicitly chosen rather than inferred from clock. Existing saved batch startTime/endTime are not removed or changed by editing; Faculty class time entry, schedules, AM/PM picker and duration/conflict/countdown behavior remain unchanged.

Batch name uniqueness is now (branchId, courseId, trimmed case-insensitive name), not branch-wide. Different courses can both have Batch1; same course cannot duplicate it even if shift differs. Update excludes own ID but cannot move/rename onto a same-course duplicate; existing linked-record course-move protections and authorization/branch validation retained. Optional shift is validated by mock payload and saved-record boundary, carried in existing projections/storage without migrations. No Server/schema production integration, fixed demo shifts or records added.

Admissions preferred batch dropdown/cards, enrollment selector and saved View details show selected shift. Batch directory and course-details batch cards show configured shift; legacy AM/PM times remain as fallback when no shift chosen. All references remain immutable batch IDs so duplicate names across courses never replace links. Scope8 source/test files: BatchForm.jsx/test, mockDatabase.js, academicModule.test.js, NewAdmissionForm.jsx, AdmissionActions.jsx, CoursesBatchesPage.jsx, CourseDetailsModal.jsx. Old uncommitted/performance changes preserved.

PASS47/47 distinct focused tests (32 primary plus additional Admissions CRUD and assignment regressions, repeated BatchForm tests counted once). Covers optional Morning/Evening/none, edit-clear/roundtrip, missing legacy shift, legacy times retained, invalid shift rejection, same name across courses, same-course case/trim duplicate and edit collision, read/save guards, admission course/batch flow and existing exact schedules. PASS targeted ESLint, production build (existing export chunk warning), diff whitespace check. Full suite NOT_RUN for scoped change.

Isolated Edge PASS real Add Batch form without time fields, Morning and Evening same-name batches in separate courses, same-course duplicate error, blank-shift batch creation, saved shift prefill/reload,390mobile popup fit, Admissions Morning/Evening cards and selectors, actual Submit Application and saved batch-label projection. No JS errors; records existed only in disposable browser. Initial exact-label browser selector exposed unnamed Course select; explicit aria-label added and all checks passed. Artifacts: artifacts/batch-shift-names-20261020. TASKS/FEATURE_TICKETS/PROGRESS/MEMORY/FRONTEND_INTEGRATION updated. dev unchanged, no commit/push or destructive git operations. IN_REVIEW until owner acceptance; no blockers. Next approval: owner review.


## SETTINGS-LIGHTER-BG-20261020

Owner-authorized color-only change: Branding section outer/header maroon tint lightened from #f3dfe4 to #f8edf0 in SettingsPage.jsx. Inner white cards/layout/handlers unchanged. Targeted ESLint result recorded below; build/tests/browser NOT_RUN for this color-only change. Existing edits preserved; no commit/push. IN_REVIEW pending visual acceptance.

Verification: targeted ESLint PASS.


## TIME-PICKER-DROPDOWN-POLISH-20261020

Owner explicitly authorizes continuation of shared Start/End Time dropdown polish. IN_REVIEW pending owner visual acceptance. Changed components/ui/time-input.jsx and its test only, plus documentation/evidence. Replaced oversized native96-option suggestions with compact scrollable top-layer popover, selected checkmark, quarter-hour labels, viewport clamping and upward placement when needed. Keyboard arrows/Home/End/Page keys/Enter/Tab, touch selection, outside dismissal and Escape supported. Escape closes only suggestions before modal listeners. Manual arbitrary-minute input, saved-value prefill, canonical HH:mm output and existing validation/scheduling policies retained. AM/PM select gets scoped spacing/background override to prevent global select styling clipping its text. Existing Input type=time consumers inherit the change; no dependencies, data migration or business-rule changes.

PASS29/29 focused tests (picker, assignment form and formatter), targeted ESLint and final production build (existing large export chunk warning). Initial runs exposed unsupported-popover test rendering and modal Escape propagation; corrected and rerun PASS. Isolated Edge1440 desktop/390 mobile verifies bounded top-layer dropdown, keyboard/touch, midnight/noon/invalid13:70, manual9:07 AM=>09:07, suggested2:15 PM=>14:15, create-save-edit-reload, existing teacher/room conflicts and15-minute countdown, Dashboard/Admissions/Faculty/Courses/Reports display, CSV/PDF/print, four roles/two authorized branches; zero page errors. Mobile screenshot visually inspected including unclipped AM/PM. Evidence artifacts/time-picker-dropdown-polish-20261020. Full suite NOT_RUN. Existing uncommitted/performance edits preserved; branch dev, no commit/push/reset/stash/clean. No blockers. Next approval: owner review.


## ADMISSION-BATCH-SHIFT-ONLY-20261020

Owner-approved minimal display change; IN_REVIEW. Removed exact clock range and clock icon from Admissions preferred batch cards in NewAdmissionForm.jsx. Existing optional Morning/Evening badge, name, days, room, seats and selection retained. No inferred shift, stored-time changes or schedule/calculation changes. Targeted ESLint PASS. Tests/build/browser NOT_RUN for removal-only presentation change. Prior uncommitted edits preserved; no commit/push. Next approval: owner visual review.


## SETTINGS-LIGHTEST-BG-20261020

Owner requests further lightening of Branding & Visual Identity section. IN_REVIEW: SettingsPage.jsx outer/header tint changed from #f8edf0 to #fcf5f7; inner white cards and all handlers/layout unchanged. Targeted ESLint PASS. Tests/build/browser NOT_RUN for color-only change. Existing edits preserved, no commit/push. Next approval: owner visual acceptance.


## BATCH-DURATION-20261020

CONFIRMED owner-authorized change; IN_REVIEW pending owner acceptance. Batch create/edit now accepts optional positive integer durationMonths (1 month,2 months,3 months,etc), blank=null and existing absent values preserved without guessed defaults or migrations. Validated at form, mock payload and stored-record boundaries. Existing branch/course name uniqueness, optional shift, immutable IDs and legacy clock metadata retained. Duration is descriptive months only; no automatic end date, fee calculation or schedule/countdown/permission changes.

Shared utils/batchDuration.js formats singular/plural. Batches table schedule cell shows labeled duration (Not configured for legacy absence); directory CSV/PDF include Duration; course-details batch cards, Admissions batch dropdown/cards, enrollment dropdown and saved admission batchLabel show configured duration. Exact timing remains removed from Admissions batch cards. Source/test scope9 files: BatchForm.jsx/test, mockDatabase.js, academicModule.test.js, NewAdmissionForm.jsx, AdmissionActions.jsx, CourseDetailsModal.jsx, CoursesBatchesPage.jsx, batchDuration.js.

PASS16/16 focused tests covering create/edit/clear/refresh duration, invalid zero/negative/fraction/string rejection without storage mutations, shift/uniqueness guards and Admissions subject-selection regression. Initial new service test omitted existing mandatory name/course fields; fixture corrected to existing save contract and rerun PASS. Targeted ESLint PASS; production build PASS (existing large export chunk warning). Isolated Edge desktop/mobile PASS actual3-month create/save/edit/reload, Batches table text, Admissions dropdown/card and actual submitted application's saved duration label, optional shift and duplicate-name guards; zero page errors. Browser harness modal-hidden row lookup corrected; final rerun PASS. Evidence artifacts/batch-duration-20261020. Full suite NOT_RUN; PDF/CSV duration source mapping inspected, additional export browser test NOT_RUN. All persistence remains browser-local mock. Existing uncommitted/performance edits preserved; dev unchanged; no commit/push/reset/stash/clean. Next approval owner review.


## BATCH-FACULTY-COLUMN-20261020

Owner-approved table presentation change; IN_REVIEW. CoursesBatchesPage.jsx Batches desktop table now has separate Schedule and Faculty columns; duration stays with Schedule, teacher names/empty state move to Faculty. Conditional seven-column widths total100%; Courses table retains original six columns, mobile cards and underlying services unchanged. Targeted ESLint and production build PASS (existing chunk warning). Tests/browser NOT_RUN for cell relocation. Existing edits preserved, no commit/push. Next approval owner visual review.


## STAFF-LOGIN-BRANCH-20261020

CONFIRMED owner authorizes current-branch staff creation/listing, email/password login for every role including bootstrap Super Admin, shared initial staff password, profile password change, and academy-branded responsive login. IN_REVIEW until owner acceptance. Existing browser-local mock architecture retained; no Server or real authentication deployment introduced.

Implemented: Users page loads staffOverview keyed by active branch, lists only that branch's staff/assignments, automatically assigns current branch and one approved role, uses required normalized unique email and optional contact. Service rejects foreign-branch create/update/toggle/delete attempts; legacy assignments in other branches preserved on edit. Removed public UI Open Account impersonation action. Organization branch overview and branch mutations now respect actor's explicit Super Admin assignments (including inactive assigned branches for management), preventing a new branch-only admin from viewing/editing other campuses. Existing bootstrap admin's authorized branches retained. Existing cross-branch operational report scope continues unchanged.

Login page replaces account selector with email/password, show/hide password, keyboard submission/error/busy states, configured academy name/logo, maroon gradient panel and responsive centered card. AuthContext accepts credential object; explicit email login clears prior session/cache first, checks enabled identity/password and active authorized branches, auto-selects sole branch, preserves existing role routing/guards. Programmatic userId login/switchAccount remain mock fixture APIs, not production security. Existing fictional staff without email use deterministic id@tsa.local aliases; existing persisted IDs/assignments/data not migrated.

Profile and topbar menu offer Change Password with current/new/confirmation,10-128 characters, mismatch/current-password validation and busy/status states. Changed password stored as random-salt PBKDF2-SHA256100000-iteration digest in browser-local organization adapter. Once present, initial password is rejected; malformed saved credentials fail closed. Password/role/email editing remains separate so profile contact-email change does not silently alter login identity. Initial bootstrap email/password and shared staff password configured only in ignored Client/.env.local; .env.example lists blank public mock configuration variables, no passwords committed or recorded here. VITE config is client-visible and must never contain production credentials. Test setup generates disposable defaults when ignored config absent.

Application scope: pages/UserManagement/UsersPage.jsx, pages/Auth/LoginPage.jsx, components/Auth/DemoSessionControls.jsx, services/organizationService.js, services/authService.js, contexts/AuthContext.jsx, new mock/mockCredentials.js, Client/.env.example. Tests: new services/staffLogin.test.js; organizationService/authRoutes/AdminOperations/BranchSwitcher/StudentsPage/AdmissionWorkflow/DashboardPage tests and test/setup.js adapted for email UI/strict scope while preserving business assertions. Static route imports in tests avoid cold lazy-transform timing; longer email fixture fields use change events with real submit/search assertions and browser typing coverage. Small supporting fix in SettingsPage.jsx: repaired missing closing parenthesis introduced by a concurrent settings edit; all other settings/payroll changes preserved.

PASS111/111 distinct focused cases across final9-file run plus targeted reruns (duplicate reruns counted once; aggregate artifacts/staff-login-20261020/test-summary.json). Coverage all four roles, current-branch read/write restrictions including branch-only Super Admin, email normalization/uniqueness, admin/staff password login/change, bad/default-old password rejection, no plaintext changed-password storage, malformed credential failure, saved sessions, profile/branch/CRUD/admission/dashboard regressions. Initial failures: updated old-selector fixtures, rejected legacy cross-branch creation fixtures moved to explicit legacy data, invalid login correctly clearing prior session required re-login in fixture, cold import/typing timeouts; fixed and rerun. A concurrent Settings parse error was minimally fixed and Admin UI rerun PASS. Targeted ESLint PASS; final production build PASS with existing large export chunk warning. Scoped diff whitespace check PASS. Full repository suite NOT_RUN.

Isolated Edge PASS desktop1440/mobile390 login/staff/password dialogs, academy branding visually inspected, bootstrap admin email login, create receptionist in current campus, no foreign campus option/foreign staff listing, assigned-role navigation, sole authorized branch locked, My Profile=>Change Password=>logout=>default rejected=>new password login=>reload. Zero page errors. No owner browser records touched; disposable contexts only. Evidence browser.cjs/login screenshots under artifacts/staff-login-20261020. Current branch dev, prior uncommitted/performance and concurrent edits preserved; no worktree/commit/push/reset/stash/clean. Known boundary: this is browser-local mock access; production server authentication/authorization, secure sessions and recovery remain separate work. No current mock-flow blocker. Next approval: owner acceptance.


## PASSWORD-VISIBILITY-SIX-20261020

Owner-approved scoped enhancement; IN_REVIEW. DemoSessionControls.jsx Change Password fields each have independent accessible Show/Hide eye buttons (type=button, pressed state, keyboard focus), retaining input value and disabling while saving. Visibility resets on opening/success. mockCredentials.js and new/confirm field validation/helper text now allow6-128 characters; current password verification and salted digest/old-password rejection unchanged. Updated staffLogin.test.js verifies five rejected, six saved and subsequently authenticated. PASS9/9 focused tests, targeted ESLint and production build (existing chunk warning). Isolated Edge PASS all3 show/hide toggles without value loss,6-character change through profile, old default rejection/new password login/reload, desktop/mobile and no page errors. Browser evidence artifacts/password-visibility-20261020. Full suite NOT_RUN. Existing edits preserved; dev, no commit/push. Next approval owner visual acceptance. This remains browser-local mock authentication.


## USERS-ACCESS-ONLY-DELETE-20261020

CONFIRMED owner changes Users Delete semantics: remove login/role access only; never delete Faculty profile, assignments, classes or linked professional/academic/financial records. IN_REVIEW. organizationService.deleteUser retains identity and metadata and marks accessRevoked=true (created user record or merged seed profile override), preserving credentials, historical branch memberships/profile overrides and all database bytes. Existing self/last-admin/current-branch/every-assigned-branch authorization guards retained. Linked-record deletion check removed from Users action because no professional record is deleted. Actual Faculty deletion workflow is unchanged.

getDemoUsers remains the professional-identity source; revoked teacher profiles/IDs and links resolve as before. findDemoUser and getAuthorizedBranches deny revoked identities; email login/listLoginUsers also exclude them, so saved session reread/reload, programmatic login and email/default/changed-password login cannot restore access. staffOverview hides revoked accounts from Users. Delete confirmation/status explicitly explain access-only removal and preserved records. Historical professional roles remain for Faculty mapping while permissions deny all authorized branches. No blanket migration/restoration of previously deleted identities, no Server/production auth change.

Scope6 source/test files: services/organizationService.js, mock/authFixtures.js, services/authService.js, pages/UserManagement/UsersPage.jsx, organizationService.test.js, staffLogin.test.js. PASS61/61 focused service/auth/organization tests; targeted ESLint PASS; production build PASS (existing export chunk warning). New tests verify linked built-in and created teacher retention, identical Faculty projection/assignment list and unchanged academic database bytes, hidden Users row, blocked email/programmatic login and invalidated saved session on reread. Isolated Edge PASS actual Delete dialog on linked Dr. Irfan account, account removed from Users, Faculty profile URL still opens with unchanged records and login rejects; no page errors, disposable browser only. Evidence artifacts/staff-access-removal-20261020. Full suite NOT_RUN. Existing edits preserved; dev, no commit/push. Next approval owner acceptance. Browser-local mock boundary unchanged.


## AUDIT-LOG-20261020

CONFIRMED owner-authorized branch-specific Super Admin Audit Log. IN_REVIEW until owner acceptance. New /audit-log lazy route, central AUDIT_VIEW=audit.view permission granted only to single-role Super Admin, sidebar navigation and existing DashboardLayout styling. Read service requires canonical session's active branch and permission, filters by exact branch and returns detached newest-first records. Owner/Receptionist/Teacher/direct foreign-branch reads fail closed. No all-branches view or audit edit/delete endpoint/UI added.

AuditLogPage matches existing maroon/white ERP UI and requested reference: date/time (Asia/Karachi h:mm AM/PM), user and role snapshot, module, action, description and importance; readonly details show changed fields and safe before/after values. Search supports user/role labels/action/record; module/importance/All time/Today/last7calendar days/current month/custom-inclusive dates, invalid range state, Clear filters, Refresh and shared10/15/25/50 pagination with filter reset/page clamp. Responsive desktop table and mobile activity cards, keyboard-accessible controls/details. Explicit empty/error/loading states and activation-onward message. Clear never clears history.

Real change capture resides in shared mock persistence boundaries, not pages: mockDatabase.write and writeOrganization append auditLogs to the same atomic storage payload as actual saved mutations. Actor ID/name/effective role snapshot, branch, ISO timestamp, stable tie-break sequence, resource/record ID/name, Created/Updated/Deleted/Access removed, importance and changed fields retained. Covers persisted Admissions/Students/enrollment, Courses/Batches/streams/subjects, Faculty/classes/assignments, Fees/payments, Finance/expenses, Demo Classes, Assets, Payroll records, Users/role/access/profile changes, Branches, Settings and password-change metadata. First-ever mutation logged against unpersisted initial baseline; initial seeds/migrations/read normalization do not fabricate events. Failed validation/persistence and no-op saves do not add events. Existing domain records/IDs/times/calculations unchanged. Shared professional identity/access/password changes are written to affected membership branches; scoped domain records use record branch. Organization-wide settings changes are recorded under the acting branch. No fabricated historical backfill. Read/page-view/login/logout/export activity is outside this saved-change journal.

Privacy: safe field allowlist permits relevant status/name/configuration/amount/schedule and branch-role reference values; other field values are Not displayed. Password digest/salt updates become generic Account Security password-change metadata, never credentials, tokens, photos, private contact values or notes. Old history retained when identity/profile is revoked/deleted. Audit stores are readonly through application flows, but remain browser-local mock storage and are not production/tamper-proof audit infrastructure. No retention/truncation policy invented, no dependency/Server/database migration added.

Source/test scope17 files: new mock/mockAudit.js, services/auditService.js, services/auditService.test.js, utils/auditFilter.js, pages/AuditLog/AuditLogPage.jsx; modified mock/mockOrganization.js, mock/mockDatabase.js, routes/AppRouter.jsx, routes/routeModules.js, routes/routePaths.js, constants/permissions.js/test, components/Layout/Sidebar.jsx, mock/mockDatabase.test.js, services/demoClassService.test.js, services/organizationService.js, services/facultyService.js. Supporting regression fix: Faculty delete now explicitly requests guarded professional profile deletion; default Users delete remains access-only with retained Faculty records, as owner previously required. Existing actual Faculty deletion had delegated to Users API and regression exposed that coupling. Linked-profile safety checks are retained in explicit Faculty delete path. Existing unused payroll viewOps declaration removed to pass touched-file lint; no payroll logic changed.

PASS132/132 focused cases across9 final test files (audit, staff login, academic operations, organization, permissions, database, finance/payments, demo classes and Faculty workflow). Tests cover empty/no fake initialization, first mutation, no-op/failed writes, actor/role/before-after/ordering, protected-value redaction/password metadata, both branch histories/shared teacher access changes, role/foreign-branch denial, Karachi midnight/custom boundaries, existing persistence/version9 compatibility and operational regressions. Existing whole-envelope comparisons retain every domain assertion while allowing new audit metadata and asserting actual audit events. Initial checks exposed envelope allowlist, missing first-save baseline and previous Faculty delete coupling; fixed with targeted regression tests and final complete scoped run PASS. Targeted ESLint PASS; final production build PASS (existing large export chunk warning); scoped diff whitespace check PASS. Full repository suite NOT_RUN.

Isolated Edge1440desktop/390mobile PASS real service mutations from Admin and Receptionist, actual actor roles, journal table, record before/after dialog, search/module/importance/date filters and invalid custom range, pagination/row-size/reset, refresh after mutation, branch switch isolation, all3 non-admin route denials and hidden navigation, no horizontal page overflow/page errors. Desktop viewport and mobile screenshots visually inspected; full-page desktop capture produced browser viewport artifact, viewport capture and geometry checks confirm correct sidebar/content alignment. Browser data only in disposable contexts, no owner browser records changed. Evidence artifacts/audit-log-20261020 (browser.cjs/tests.json/screenshots). TASKS/FEATURE_TICKETS/PROGRESS/MEMORY/FRONTEND_INTEGRATION/SECURITY/DESIGN updated. Branch dev; prior uncommitted/performance/concurrent work preserved; no worktree/commit/push/reset/stash/clean. No active mock-flow blocker. Next approval owner acceptance.


## AUDIT-FILTERS-LEVELS-20261020

Owner authorizes All/Normal/Important/Critical importance filter and corresponding action-based row levels, fixed Academy ERP module list covering every sidebar tab, and Audit Log first in Administration. IN_REVIEW. New constants/audit.js centralizes module list, ordered levels and classification: deletes/access removal/role changes/account or branch deactivation/financial reversal-cancellation Critical; remaining financial/settings/account/branch changes Important; routine changes Normal. Created staff remains Important. New writes persist classification; reads consistently classify historical event metadata without rewriting stored history. Critical rows red, Important amber, Normal green on desktop/mobile. Module filter includes Dashboard/Admissions/Students/Courses & Batches/Faculty & Classes/Fees/Finance/Payroll/Demo Classes/Assets/Reports/Audit Log/Branches/Users/Settings/Account Security even with no events. Empty modules honestly show no matches; no fabricated activity or hotel modules. Sidebar Audit Log moved to first Administration item.

Scope6 source/test files: constants/audit.js/test, mock/mockAudit.js, services/auditService.js, pages/AuditLog/AuditLogPage.jsx, components/Layout/Sidebar.jsx. PASS9/9 focused classification/audit tests; targeted ESLint PASS; build PASS (existing chunk warning). Isolated Edge verifies exact importance option order, real access removal Critical row/red styling, all Academy module options/no hotel labels, empty Dashboard filter, actual course event filtering, Administration first link and390mobile fit; no page errors. Evidence artifacts/audit-filters-20261020. Existing edits preserved, no commit/push. Next approval owner visual acceptance; mock-only boundary unchanged.


## FINANCE-OVERVIEW-MAROON-20261020

Owner-authorized color-only change; IN_REVIEW. FinancePage.jsx selected Finance Overview button now uses existing maroon #940016 background and white text/inherited icon, matching Teacher Payroll active style. No layout/handlers/data changes. Targeted ESLint PASS. Tests/build/browser NOT_RUN for class-only color change. Existing edits preserved; no commit/push. Next approval owner visual review.


## PAYROLL-FLOW-FIX ? 2026-10-21

Owner-authorized payroll analysis and repairs; IN_REVIEW pending owner acceptance. Fixed agreement teacher metadata, advance payment-method contract, shared pagination, month selection, Finance tab navigation and agreement deep-link reopening. Save-success/refresh-failure handling preserves the successful mutation and avoids duplicate retries. Accessible monetary/payment fields retained within existing layouts.

Payroll requires approval before payment; approved snapshots cannot be recalculated or adjusted. Whole positive PKR payments, valid methods and duplicate references within the same payroll line are validated. Each payment creates exactly one linked Finance expense. Advance recovery happens once, including partial payments and zero-cash settlement; other approved periods reserve recoverable balances. Scoped enabled teachers and agreement dates/rates are validated. Per-lecture calculation counts saved dated sessions after their end time; fee percentage joins the teacher's assigned batch enrollments to their challans and verified payments, excluding unrelated batches. Existing formulas and historical records are preserved. Karachi date boundaries used for defaults and payslip payment dates. This remains browser-local mock accounting, not a bank transfer or production backend.

Changed: Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, StaffAdvanceModal.jsx, DisbursePaymentModal.jsx, ManualAdjustmentModal.jsx, PayslipModal.jsx; pages/Finance/FinancePage.jsx; mock/mockDatabase.js payroll operation; services/payrollService.test.js.

PASS: 33 focused tests (payroll service/view/page, audit and financial regressions), targeted ESLint, production build and git diff --check. Build retains existing large export chunk warning. Disposable Edge desktop/mobile verified agreement create/save/reload, >10-row pagination, advance methods, bonus, approval lock, partial/full salary payments, single advance recovery and linked expenses, payslip PDF/print, CSV, month/tab navigation and deep-link save closure; no page errors. Browser scenario: 51,000 salary less 3,000 advance plus 500 bonus = 48,500; paid in two payments. Full repository suite and real backend integration NOT_RUN. Evidence: artifacts/payroll-flow-fix-20261021. Branch dev; unrelated dirty changes preserved; no commit/push. Next required approval: owner acceptance.


## PAYROLL-HEADER-EXPORTS - 2026-10-21

Owner-authorized minimal toolbar relocation; IN_REVIEW. FinancePage hides its Overview month/statement exports on Teacher Payroll and provides a header slot. TeacherPayrollView renders its existing PDF/CSV controls into that slot using a React portal, retaining current payroll month/filter data and handlers. Standalone payroll retains inline exports. Overview controls and payroll month input remain functional. Source files: pages/Finance/FinancePage.jsx, components/Finance/TeacherPayrollView.jsx. PASS: targeted ESLint, 6 payroll component/page tests, disposable Edge payroll workflow including CSV/downloads and tab navigation. Build NOT_RUN for this small relocation; no calculation/storage changes. Existing dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-TABLE-FIT - 2026-10-21

Owner-approved payroll table spacing/no-wrap change; IN_REVIEW. TeacherPayrollView.jsx uses compact horizontal cell padding below 1536px, wider padding on large screens, and single-line text. Calculation detail width cap removed; existing table-local horizontal scrolling accommodates unusually long records and mobile without overflowing the page. No data/actions/calculations changed. PASS targeted ESLint and disposable Edge normal-scale checks at 1920/1440/1366/390 CSS-pixel widths: all cells nowrap, no page overflow; representative desktop table fits its container at all three desktop widths. Mobile preserves local table scrolling. Browser evidence artifacts/payroll-flow-fix-20261021/table-fit.cjs. Build/unit tests NOT_RUN for styling-only change. Prior dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-EXPORT-STYLE - 2026-10-21

Owner-approved label/icon/color change; IN_REVIEW. TeacherPayrollView.jsx payroll export controls now say Export PDF and Export CSV, both with download icons, maroon #940016 backgrounds, white text and #7a0012 hover. Existing export handlers, loading/empty guards and header placement retained. Targeted ESLint PASS; tests/build/browser NOT_RUN for presentation-only change. Unrelated edits preserved; no commit/push. Next approval: owner visual acceptance.


## FINANCE-TABLE-FIT - 2026-10-21

Owner-approved Finance Overview table adjustment; IN_REVIEW. FinancePage.jsx defaults to 10 rows instead of 15, keeps date/category/method/amount and headings on one line, and uses compact cell padding. Long transaction descriptions truncate with full native title and keyboard-focus expansion; financial values are not truncated. Existing table-local mobile scrolling, filters, pagination and export handlers retained. PASS targeted ESLint and disposable Edge checks at 1920/1440/1366/390 widths: no page overflow, normal desktop rows fit, 16 actual mock expenses paginate 10 then 6. No browser page errors. Evidence artifacts/payroll-flow-fix-20261021/finance-table-fit.cjs. Build/unit tests NOT_RUN for scoped presentation/default-row change. Existing edits preserved, no commit/push. Next approval: owner visual acceptance.


## PAYROLL-EXPORT-ICONS - 2026-10-21

Owner-authorized distinct export icons; IN_REVIEW. TeacherPayrollView.jsx uses FileText for Export PDF and FileSpreadsheet for Export CSV, replacing identical download icons. Maroon styling, labels and handlers retained. Decorative icons hidden from accessibility tree; text labels preserved. Targeted ESLint PASS; build/tests/browser NOT_RUN for icon-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-REMOVE-INTRO - 2026-10-21

Owner-approved removal of Teacher Payroll & Compensation introduction, decorative icon, period badge and explanatory subtitle; IN_REVIEW. TeacherPayrollView.jsx retains right-aligned month/recalculate/approval/advance controls and existing export placement, with intro divider removed. No payroll state or accounting changes. TeacherPayrollPage.test.jsx locates the retained month control instead of removed heading. PASS targeted ESLint and 6 payroll component/page tests. Build/browser NOT_RUN for presentation-only removal. Unrelated edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-STYLE - 2026-10-21

Owner-approved larger tinted payroll KPI cards; IN_REVIEW. TeacherPayrollView.jsx six cards now have 150px minimum height, increased padding/value typography/spacing, and light sky/emerald/rose/maroon/teal/amber backgrounds matching existing ERP palette. Responsive grid retained; no amount/calculation/action changes. PASS targeted ESLint and disposable Edge 1440/390px checks: six 150px cards, distinct background colors, no page overflow. Build/unit tests NOT_RUN for styling-only change. Evidence artifacts/payroll-flow-fix-20261021/card-style.cjs. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-FILTER-STYLE - 2026-10-21

Owner-approved payroll progress/filter presentation; IN_REVIEW. TeacherPayrollView.jsx reuses existing CustomSelect for calculation method and payment status, with rounded controls, maroon selected menu styling/checkmark, method icons and payment status dots. Existing method/status values and page-reset filtering preserved. Progress card spacing, wrapping legend, search height and responsive filter layout adjusted locally. No accounting changes or shared component modifications. PASS targeted ESLint, 6 payroll component/page tests, isolated Edge 1440/390px checks: method/payment filters change results and restore rows, menus fit viewport, Escape closes, no page overflow/errors. Evidence artifacts/payroll-flow-fix-20261021/filter-style.cjs. Build NOT_RUN for localized UI change. Existing dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## FINANCE-TABLE-NO-SCROLL - 2026-10-21

Owner-approved Finance Overview no-horizontal-scroll layout; IN_REVIEW. FinancePage.jsx removes minimum table width and scroll wrapper; full Transaction Detail wraps with overflow-wrap:anywhere instead of truncation. Other columns stay single-line. Mobile uses labeled stacked rows to preserve every field without horizontal scrolling; scoped min-width override avoids shared mobile table minimum. Default 10 rows and pagination preserved. PASS targeted ESLint and isolated Edge 1920/1440/1366/390 checks with 16 actual mock expenses: table has no horizontal overflow, details wrap, page has no overflow/errors, pagination shows 10 then 6. Evidence artifacts/payroll-flow-fix-20261021/finance-no-scroll.cjs. Build/unit tests NOT_RUN for localized presentation change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-ACTIONS-POSITION - 2026-10-21

Owner-approved payroll action placement/month sizing; IN_REVIEW. FinancePage.jsx provides a responsive slot opposite Finance Overview/Teacher Payroll tabs; TeacherPayrollView.jsx portals its existing month/recalculate/approve/advance controls into that row, retaining inline standalone fallback. Month control reduced to 32px overall height and 128px inner width. Handlers/guards unchanged; narrow viewports wrap naturally. Targeted ESLint PASS. Focused payroll component/page tests recorded below. No commit/push; existing edits preserved. Next approval: owner visual acceptance.

Verification: 6 focused payroll component/page tests PASS. Build/browser NOT_RUN for this relocation.


## PAYROLL-PROGRESS-COMPACT - 2026-10-21

Owner-approved progress section height reduction; IN_REVIEW. TeacherPayrollView.jsx progress card vertical padding reduced from 20px to 12px, internal gaps tightened, bar 8px and method control 36px. Existing content, dropdown, responsive wrapping and calculations preserved. Targeted ESLint PASS; build/tests/browser NOT_RUN for spacing-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-VERTICAL-SPACING - 2026-10-21

Owner-approved tighter payroll vertical layout; IN_REVIEW. TeacherPayrollView.jsx section gaps reduced from 24px to 12px, progress card vertical padding from 12px to 8px, progress internal spacing from 6px to 4px and legend top padding removed. Cards, progress, search and table now sit closer together; existing controls/content/calculations preserved. Targeted ESLint PASS; tests/build/browser NOT_RUN for spacing-only change. No commit/push; unrelated edits preserved. Next approval: owner visual acceptance.


## PAYROLL-CARD-SIZING - 2026-10-21

Owner-approved KPI card text/size adjustment; IN_REVIEW. TeacherPayrollView.jsx KPI labels/help text increased from 10px to 12px and amounts from 20px to 24px. Minimum height reduced from 150px to 130px with compact padding/spacing. Grid gaps reduced from 12px to 8px, giving cards slightly more width within existing responsive grid. Backgrounds/data/calculations preserved. Targeted ESLint PASS; tests/build/browser NOT_RUN for styling-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-TEXT - 2026-10-21

Owner-approved smaller payroll card typography; IN_REVIEW. TeacherPayrollView.jsx KPI labels/help reduced from 12px to 11px, amounts from 24px to 20px, and heading letter spacing normalized to reduce wrapping. Card dimensions/colors and data unchanged. Targeted ESLint PASS; build/tests/browser NOT_RUN for typography-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-TEXT-GAPS - 2026-10-21

Owner-approved internal KPI text spacing; IN_REVIEW. TeacherPayrollView.jsx title-to-amount and amount-to-description margins increased from 6px to 12px across all six cards. Existing fonts/colors/minimum card height/data preserved. Targeted ESLint PASS; tests/build/browser NOT_RUN for spacing-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-COMPACT-GAPS - 2026-10-21

Owner-approved shorter KPI cards with greater text separation; IN_REVIEW. TeacherPayrollView.jsx reduces minimum height 130px to 120px and vertical padding 12px to 6px, uses justify-between and minimum 14px internal gaps instead of 12px margins. Fonts/colors/data unchanged; content can grow naturally. Targeted ESLint PASS; tests/build/browser NOT_RUN for styling-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-COLORS - 2026-10-21

Owner-approved screenshot palette match; IN_REVIEW. TeacherPayrollView.jsx payroll KPI cards use existing Fees-style white-to-mint, cream/amber and pale blue gradients with matching borders, dark totals and muted supporting labels. Existing dimensions/spacing/data preserved; no shared KPI CSS/layout changes. Targeted ESLint PASS; tests/build/browser NOT_RUN for color-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## AUDIT-DROPDOWN-STYLE - 2026-10-21

Owner-approved Audit Log dropdown presentation; IN_REVIEW. AuditLogPage.jsx reuses CustomSelect for Module, Importance and Time filter with rounded controls, maroon selected rows/checkmarks, white shadowed menus and severity dots. Values/filter logic unchanged, Custom date range and Clear retained. Removed outer card overflow clipping for menus. PASS targeted ESLint, 9 audit constants/service tests and disposable Edge desktop/mobile menu selection, custom dates/Clear and viewport-fit checks at 1440/390px; no page errors. Evidence artifacts/payroll-flow-fix-20261021/audit-dropdown-style.cjs. Build NOT_RUN for localized UI change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## AUDIT-SEARCH-WIDTH - 2026-10-21

Owner-approved wider Audit Log search field; IN_REVIEW. AuditLogPage.jsx search flex basis/minimum increased to 320px on desktop with double flex growth, mobile retains full available width. Search/filter handlers unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for width-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## USERS-CARD-STYLE - 2026-10-21

Owner-approved larger Users summary cards; IN_REVIEW. UsersPage.jsx three cards use 120px minimum content height, increased padding, 12px labels/24px values and larger icon containers. Existing ERP pale blue, mint and cream gradients/borders applied, matching payroll/Fees palette. Counts, role policy labels and user workflows unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for presentation-only change. Existing dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## AUDIT-TOOLBAR-FIT - 2026-10-21

Owner-approved compact Audit Log dropdowns and wider single-row desktop search toolbar; IN_REVIEW. AuditLogPage.jsx uses desktop grid with flexible search, 160px Module and 130px Importance/Time controls plus Clear/Refresh columns. Desktop controls stay aligned in one row; mobile uses two-column layout/full-width search. Custom date range spans separate full row. Existing filters unchanged. PASS targeted ESLint and isolated Edge 1440/1366/390 viewport checks including desktop bottom alignment of search/dropdowns/Refresh, menu selection/custom dates/Clear and no overflow/errors. Evidence artifacts/payroll-flow-fix-20261021/audit-toolbar-fit.cjs. Build/unit tests NOT_RUN for layout-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CORRECTIONS - 2026-10-21 (REVERTED by owner)

Owner explicitly authorizes reasoned unpaid payroll reopening and separate additional bonus after salary payment; IN_REVIEW pending owner acceptance. Super Admin only in active authorized branch (mock service gate plus existing permission checks). Reopen Payroll clears approval and returns lines to draft if no period payments or settled advance recovery exist; saved reason/actor/time and journal preserve correction history. Existing adjustments can then be updated, recalculated and approved. Recalculation retains reopen metadata. Payroll with any salary payment or completed advance recovery cannot reopen, including zero-cash advance settlements.

Additional Bonus creates an approved separate payroll line linked to the original salary, with positive whole PKR amount, mandatory reason and request ID. Allowed only on settled approved periods and original salary lines. Original salary/paid records and expenses stay unchanged. Same request retries return the saved bonus; mismatched reused request IDs reject. Separate bonus has no advance deduction/recovery; newer advances remain untouched. Period payable/outstanding reflect the bonus; teacher count remains unchanged. Existing Pay supports partial/full bonus disbursement, one linked Finance expense per payment, and separate payslip/print/PDF. Payment is recorded locally; no bank transfer or backend implementation introduced.

UI: Reopen Payroll appears for approved unsettled periods; Additional Bonus appears on original teacher rows after settlement. Reason/amount dialog validates, disables busy submissions and preserves input on errors. Reopen and Additional bonus created audit actions record reason with actor/branch/time. Existing safe audit fields extended only for explicit correction metadata.

Files: services/payrollService.js and test; mock/mockDatabase.js and mockAudit.js; components/Finance/TeacherPayrollView.jsx and new PayrollCorrectionModal.jsx. PASS: 36 focused payroll service/view/page, audit and financial tests; targeted ESLint; production build; scoped git diff --check. Build retains existing large export chunk warning. Disposable Edge verifies reopen -> adjustment -> reapproval, partial original payment -> separate bonus -> Pay -> separate payslip -> reload, mobile dialog fit, audit actions and exactly one expense per linked payment. Browser evidence artifacts/payroll-flow-fix-20261021/corrections.cjs. Full repository suite/real backend integration NOT_RUN. Branch dev, unrelated dirty edits preserved, no commit/push. Next approval: owner acceptance.


## PAYROLL-CORRECTIONS-UNDO - 2026-10-21

Owner explicitly reverses PAYROLL-CORRECTIONS. Removed Reopen Payroll/Additional Bonus UI, modal, service operations, correction-specific audit extensions and three corresponding tests; prior approved payroll lock/payment workflow restored. Existing styling and unrelated edits preserved. No stored financial records or existing audit history deleted or migrated. Previous correction documentation marked REVERTED as historical evidence. PASS targeted ESLint, 33 focused payroll/audit/financial tests and scoped git diff --check. Build/browser NOT_RUN for undo. No commit/push. IN_REVIEW pending owner acceptance.


## PAYROLL-MONTH-BORDER - 2026-10-21

Owner-approved removal of maroon month input focus border; IN_REVIEW. TeacherPayrollView.jsx payroll month retains borderless input and uses subtle neutral slate keyboard focus ring with no offset. Other inputs/styles/handlers unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for focus-color-only change. No commit/push; existing edits preserved. Next approval: owner visual acceptance.


## PAYROLL-MONTH-NO-BORDER - 2026-10-21

Owner explicitly requests completely borderless payroll month control; IN_REVIEW. TeacherPayrollView.jsx removes outer container border and input focus ring/outline. Other controls unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for styling-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.
## LOGIN-LOGO-MOTION - 2026-10-21

Owner-approved login logo motion refinement; IN_REVIEW. LoginLogoMotion.jsx clips the white logo surface with 2rem rounded corners and a soft shadow. On first login-page render the WebGL logo performs one smooth 360-degree Y-axis rotation (1.35s), then begins a faster and wider vertical float from -0.08 to +0.08 (1.55s each direction). Existing pointer tilt, configured-logo fallback, cleanup and reduced-motion static rendering remain intact. LoginLogoMotion.test.jsx covers the entry spin, float range/speed, rounded surface, tilt, cleanup, WebGL fallback and reduced-motion behavior. PASS: 14 focused logo/auth route tests, targeted ESLint and production build (existing large-chunk warnings only). Existing edits preserved; no commit/push. Next approval: owner visual acceptance.

## REMOVE-DEMO-UI - 2026-10-21

Owner-approved user-facing terminology cleanup; IN_REVIEW. Removed generic Demo wording from authentication/session copy, branch and staff seed labels, dashboard badges/metric labels, admissions, students, courses, fees, faculty and branch exports. Demo Classes navigation, records, reports and linked conversion wording remain because they describe the actual Demo Classes module. Internal mock IDs, storage contracts and permission error codes remain unchanged. PASS: 95 focused tests, targeted ESLint and production build; build retains existing large-chunk warnings. Browser QA NOT_RUN. Dirty working tree preserved; no commit/push. Next approval: owner visual acceptance.

## UPDATE-DEFAULT-PASSWORDS - 2026-10-21

Owner-approved local credential update; IN_REVIEW. Ignored Client/.env.local now uses `admin@123` for the Super Admin initial password and `staff@123` for staff initial passwords. Existing per-account passwords changed through My Profile remain preserved because saved password hashes continue to override initial credentials. PASS: 21 focused staff-login/auth-route tests. ESLint/build/browser NOT_RUN because no application source changed. No commit/push. Next approval: owner login acceptance.

## LOGIN-LOGO-MOTION-FIX - 2026-10-21

Owner-approved login logo animation repair; IN_REVIEW. Continuous vertical float now starts independently during initialization, so early pointer movement cannot prevent it. Pointer tilt remains disabled until the one-time 3D spin completes. When WebGL is unavailable, the visible image now receives equivalent GSAP 3D spin and vertical float instead of becoming static. Reduced-motion behavior remains static. PASS: 14 focused logo/auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. Next approval: owner visual acceptance.

## LOGIN-SECTION-HEIGHT - 2026-10-21

Owner-approved compact login layout; IN_REVIEW. Reduced the main page padding, both panel paddings, vertical gaps, form spacing and animated logo footprint while retaining the same responsive two-column structure and all login/motion behavior. PASS: 14 focused logo/auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. Next approval: owner visual acceptance.

## LOGIN-100-PERCENT-SCALE - 2026-10-21

Owner clarified that the desired reference is the complete login card as seen at 90% browser zoom. Supersedes the individual compact-spacing adjustment above. Restored the original card padding, gaps and logo dimensions, then applied a uniform 90% desktop card scale so 100% browser zoom retains the reference proportions. Mobile remains unscaled. PASS: 14 focused logo/auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. IN_REVIEW pending visual acceptance.

## LOGIN-BRANDING-LAYOUT - 2026-10-21

Owner-approved login branding refinement; IN_REVIEW. Widened the desktop card and left-panel share so the academy name remains on one line, increased the animated logo from 224px to 256px at the desktop breakpoint, and locked desktop page overflow to remove the login scrollbar. Mobile retains wrapping and normal page flow. PASS: 14 focused logo/auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. Next approval: owner visual acceptance.

## LOGIN-WIDTH-CORRECTION - 2026-10-21

Owner correction supersedes the widened login card from LOGIN-BRANDING-LAYOUT. Restored the normal 60rem card width and original panel ratio, retained the larger animated logo and desktop no-scroll behavior, and used a compact desktop heading size so the academy name remains on one line. PASS: 14 focused tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. IN_REVIEW pending visual acceptance.

## LOGIN-ACADEMY-NAME-SIZE - 2026-10-21

Owner-approved typography-only refinement; IN_REVIEW. Increased only the desktop academy-name heading from 1.55rem to 1.7rem and tightened letter spacing so the configured name remains on one line. Normal 60rem card width, logo size, no-scroll behavior and all functionality remain unchanged. PASS: 10 focused auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. Next approval: owner visual acceptance.

## LOGIN-ACADEMY-NAME-SIZE-2 - 2026-10-21

Owner-approved second typography adjustment; IN_REVIEW. Increased only the desktop academy-name heading from 1.7rem to 1.8rem with tighter tracking to retain a single line. Card width, logo, scrolling and behavior are unchanged. PASS: 10 focused auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push. Next approval: owner visual acceptance.

## LOGIN-ACADEMY-NAME-SIZE-3 - 2026-10-21

Owner-approved typography-only follow-up; IN_REVIEW. Enlarged the academy name to 2rem on desktop, added subtle spacing between words and retained responsive single-line sizing. Login section width and height remain unchanged. PASS: 10 focused auth tests, targeted ESLint and production build; existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-BACKGROUND - 2026-10-21

Owner-approved login visual enhancement; IN_REVIEW. Added a low-power Three.js maroon galaxy atmosphere with particles, halo motion, CSS fallback layers and reduced-motion support behind the branding content. Login section width, height, layout and authentication behavior are unchanged. PASS: 14 focused tests, targeted ESLint and production build; jsdom canvas notices and existing large-chunk warnings remain. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-PAGE-BACKDROP - 2026-10-21

Owner-approved login backdrop enhancement; IN_REVIEW. Reused the Three.js atmosphere in a softer page variant with low-opacity maroon, blush and warm-gold particles outside the login card. Card and branding-panel dimensions, mobile scrolling and authentication behavior remain unchanged. PASS: 14 focused tests, targeted ESLint, production build and diff check; jsdom canvas notices and existing chunk warnings remain. Browser QA NOT_RUN. No commit/push.

## BRANCH-SELECT-COMPACT-CARDS - 2026-10-21

Owner-approved branch-selection UX adjustment; IN_REVIEW. Removed the duplicate branch dropdown, made authorized branch cards the sole selection control, and retained explicit `Open dashboard` submission into the selected branch. Reduced the main card width, padding, gaps, icon and primary action height without changing authorization or persistence. PASS: 10 focused auth tests, targeted ESLint, production build and diff check. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-STARFIELD - 2026-10-21

Owner-approved outer-login backdrop refinement; IN_REVIEW. Reworked the page variant into 280 evenly distributed maroon, blush and warm-gold stars with slow drift and gentle opacity twinkle. Login card and branding-section dimensions remain unchanged, and reduced-motion behavior is preserved. PASS: 14 focused tests, targeted ESLint and production build; jsdom canvas notices and existing chunk warnings remain. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-FULL-PAGE-SCENE - 2026-10-21

Owner-approved full outer-background refinement; IN_REVIEW. Added three faint animated elliptical orbital paths to the existing full-viewport star field, producing a clearer celestial scene across the complete area outside the login card. The login card, maroon panel and form section dimensions remain unchanged. PASS: 14 focused tests, targeted ESLint and production build; jsdom canvas notices and existing chunk warnings remain. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-VISIBILITY-FIX - 2026-10-21

Owner-reported visibility defect resolved; IN_REVIEW. Real Edge screenshot confirmed the full-page Three.js scene rendered but its compounded opacity was too faint. Increased only the outer star and orbit visibility while preserving all card/section dimensions and the calm motion speed. PASS: Edge browser screenshot at 1918x898, 14 focused tests, targeted ESLint, production build and diff check. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## LOGIN-OUTER-THREE-REMOVE - 2026-10-21

Owner-approved visual rollback; IN_REVIEW. Removed the page-level Three.js atmosphere from the outer login background while preserving the maroon branding panel's internal atmosphere and every card/section dimension. PASS: Edge browser screenshot at 1918x898, 14 focused tests, targeted ESLint and production build. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## LOGIN-MAROON-NETWORK-BACKDROP - 2026-10-21

Owner-approved reference-based visual enhancement; IN_REVIEW. Added a dedicated Three.js + GSAP outer backdrop with 54 maroon nodes, proximity connections, slow drift and breathing opacity. The canvas is pointer-free, respects reduced motion and sits behind the unchanged login card and internal sections. PASS: Edge browser screenshot at 1918x898, 14 focused tests, targeted ESLint and production build. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## LOGIN-MAROON-PARTICLE-FLOW - 2026-10-21

Owner-approved visual extension; IN_REVIEW. Added 680 small maroon flow particles and larger maroon accent particles across the full outer login viewport while retaining the connected-node network. GSAP applies slow drift and breathing opacity; the login card and internal sections remain unchanged. PASS: Edge browser screenshot at 1918x898, 14 focused tests, targeted ESLint and production build. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## LOGIN-MAROON-CURVED-TRAILS - 2026-10-21

Owner-approved reference-match refinement; IN_REVIEW. Replaced simple particle lanes with 16 multi-direction curved trails, added 360 distributed background particles and circular glow sprites, and softened the polygon network so the maroon trails dominate. Full outer viewport coverage and GSAP motion are preserved; the login card and sections remain unchanged. PASS: Edge browser screenshot at 1918x898, 14 focused tests, targeted ESLint and production build. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## LOGIN-OUTER-THREE-REMOVE-MOBILE-NAME - 2026-10-21

Owner-approved visual rollback and responsive fix; IN_REVIEW. Removed the outer Three.js/GSAP backdrop and deleted its dedicated component. Preserved the internal maroon-panel atmosphere. Adjusted only the academy-name mobile clamp and word spacing so the full configured name remains on one line. PASS: desktop and mobile Edge screenshots, 14 focused tests, targeted ESLint, production build and diff check. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## SETTINGS-REMOVE-FEATURE-MODULES - 2026-10-21

Owner-approved settings cleanup; IN_REVIEW. Removed the complete `Feature Modules & Extensions` card, its Teacher Payroll toggle handler and unused wallet icon from Settings. The persisted payroll setting, Finance Payroll tab, calculations, payment history and service layer are unchanged. PASS: 21 focused payroll regression tests, targeted ESLint, production build and diff check. Browser QA NOT_RUN. Existing chunk warnings remain non-blocking. No commit/push.

## PAYROLL-MONTH-SELECTION-STABILITY - 2026-10-21

Owner-approved payroll state correction; IN_REVIEW. Preserve each branch's manually selected payroll month across payroll-view remounts so background page updates cannot return the selector to the current month. Changing branches restores that branch's last selection or initially uses the current month. PASS: 22 focused payroll tests, targeted ESLint and production build. Browser QA NOT_RUN. Existing chunk warnings remain non-blocking. No commit/push.

## F12-BRANCH-ADMIN-ROLE - 2026-10-21

Owner-approved role extension; IN_REVIEW. Added branch-scoped Admin with the full implemented module permission set, Super Admin dashboard presentation and assigned-branch-only visibility. Admin user creation is restricted to Owner, Receptionist and Teacher at both UI and service layers. PASS: 50 focused tests, full 625-test suite, targeted ESLint and production build. Browser QA NOT_RUN. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## F13-BRANCH-THEME-DARK-MODE - 2026-10-21

Owner-approved theme correction; IN_REVIEW. Theme and independent sidebar colors are now branch-scoped and shared across roles. Primary accent propagates through semantic and legacy maroon controls. Dark mode normalizes the shared shell and hardcoded light surfaces for clear contrast. PASS: 57 focused tests, full 626-test suite, targeted ESLint, production build and diff check. Browser QA NOT_RUN. Existing jsdom canvas notices and chunk warnings remain non-blocking. No commit/push.

## F13-BRANCH-NOTIFICATIONS - 2026-10-21

Owner-approved frontend mock notification ticket; IN_REVIEW. Added a topbar inbox with unread count, read/mark-all-read and delete controls. Receptionist admission/challan activity routes to Admin and Super Admin in the same branch; Admin/Super Admin equivalents route to branch Receptionists; class assignments route only to the assigned Teacher. Owner is excluded. PASS: 14 focused tests, ESLint, production build and diff check. Full suite: 628 passed, 1 unrelated Demo Classes lazy-route timeout failed; isolated rerun remained timing-sensitive. Browser QA NOT_RUN. No commit/push.

## F02-ADMISSION-PRICING-DISPLAY - 2026-10-21

Owner-approved Admission display correction; IN_REVIEW. Subject cards show individual prices only when their parent course uses `Sum selected subject fees`. For `One course fee`, subject-level price and missing-fee labels are hidden while existing course totals and financial calculations remain unchanged. PASS: 23 focused/broader Admission tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F03-F05-PROFILE-TAB-COLOR - 2026-10-21

Owner-approved visual adjustment; IN_REVIEW. Student and Teacher profile active tabs now use the configured primary maroon background with contrasting white text/icon. Inactive tabs and navigation behavior are unchanged. PASS: targeted ESLint and production build. Automated UI tests NOT_CONFIGURED for these profile pages; browser QA NOT_RUN. No commit/push.

## F12-USERS-FILTER-ACTIONS - 2026-10-21

Owner-approved Users cleanup; IN_REVIEW. Removed the redundant current-branch `All` filter, renamed the retained role filter to `All Roles` and replaced its native select with the shared polished CustomSelect menu. Removed the View row action and its unused details dialog/state; Edit, Delete and Activate/Deactivate remain. PASS: 37 focused regressions, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F12-USERS-DATA-LOAD-FIX - 2026-10-21

Owner-reported blank Users table hardened; IN_REVIEW. UsersPage now has explicit loading state, clears stale errors before refresh, replaces stale data on failure, exposes the real load error with a Retry action, and shows the empty state only after a successful load. Mounted route regression now verifies seeded Administrator data, All Roles and absence of View before account creation. PASS: 37 mounted/service tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## DATA-LEGACY-FACULTY-LINK-REPAIR - 2026-10-21

Owner-reported cross-module data-load failure repaired; IN_REVIEW. Legacy deleted-teacher records no longer invalidate retained faculty assignments and block the shared mock database. Built-in teacher identities are retained as access-revoked professional records; deleted created-teacher tombstones permit historical assignment reads while arbitrary unknown links still fail validation. Revoked identities remain excluded from Users and login. PASS: 70 focused service/database tests, targeted ESLint, production build and diff check. A broader concurrent UI run had 83 passes and 5 existing timing/navigation failures; browser QA NOT_RUN. No commit/push.

## DATA-LOAD-RECOVERY - 2026-10-21

Owner-reported persistent data-load failure traced to the actual localhost Chrome ERP snapshot: a saved faculty assignment references an existing disabled teacher. The earlier deleted-identity repair did not cover disabled identities. Historical assignment reads now check identity existence independently of current login status/role; new assignment writes retain the enabled branch Teacher requirement. No saved records are erased or reset. Added disabled/role-change regressions covering student reads, dashboard reports, unchanged storage, ineligible new assignments and rejection of arbitrary unknown teacher IDs. PASS: 72 focused service/database tests, targeted ESLint and production build (existing chunk warnings). Actual saved-data replay in a disposable Edge browser resolves the previously failing store and renders dashboard cards. IN_REVIEW; no commit/push.

## PAYROLL-HEADER-CONTROLS-REMOVE - 2026-10-22

Owner explicitly approved removal of ONLY the Teacher Payroll header Month Selector, Recalculate and Staff Advance controls. Removed those controls and their now-unused UI handlers/icons, retaining automatic initial/month-change-after-agreement calculations, Approve Payroll, exports, salary agreements, adjustments, payment/balance/payslip flows, service operations and all historical data. Empty action wrappers are omitted when no remaining controls render. Finance Overview is unchanged. Updated component coverage for control absence, retained approval/exports and an empty approved-period action portal; removed the obsolete manual-month-selector test. PASS: 18 payroll component/service tests and 4 Finance Overview tests (isolated rerun after one initial lazy-module loading timeout), targeted ESLint and scoped diff check. Build and browser QA NOT_RUN for this UI-only removal. IN_REVIEW pending owner acceptance. No commit/push.

## PAYROLL-TWO-METHODS - 2026-10-22

Owner-approved focused payroll simplification; IN_REVIEW pending owner browser acceptance. New agreements support exactly Percentage (listed subject/course fee, explicit full-course authorization) and Fixed Monthly. Payroll eligibility comes only from saved active-branch Faculty course/batch/subject assignments, with immutable assignment/academic IDs and a fixed single-academy namespace. Assignment rows include course/batch/subject, eligible distinct active subject students, fee/rate, salary/paid/remaining/status/actions and teacher-combined totals. Missing fee/subject mapping/agreement blocks invalid percentage salary and approval. Pending/unrelated students are excluded. Agreements are effective by full calendar month (first day); new future versions close a previous open contract without rewriting approved salary snapshots. Overlapping conflicting versions reject.

New drafts omit bonuses, allowances, deductions, tax and automatic advance recovery. Historical approved/paid payroll and advances remain preserved. Legacy or removed/reassigned draft lines are retained with supersededAt rather than deleted; active views exclude superseded drafts. Historical approved teacher-only rows remain readable/payable under their original snapshot. The month/Recalculate/Staff Advance header controls remain absent; salary-period/history navigation is in the content area to meet the newly requested monthly workflow. Draft calculation refreshes through normal navigation and agreement changes. Six simplified KPIs show salary due/paid/remaining, assigned teachers, current agreements and pending assignment balances.

Payments retain original ledger/expense integration and add assignment scope, verified status and exact two-decimal PKR amounts. A branch-unique transaction reference prevents repeat posting, including across batches; overpayments/negative values/cross-branch actions reject. Only Admin/Super Admin manage payroll; Owner retains authorized read-only payroll overview and existing unrelated Finance permissions. Receptionist and Teacher payroll requests remain denied under current policy (Teacher self-service is not enabled). Branch guards and existing adapter serialization remain in effect. No Server changes, new packages, destructive migration, worktree, commit or push.

PASS: 66 unique focused/regression tests (57 payroll/component/faculty/academic/PDF/audit + 4 Finance Overview + 5 financial tests); targeted ESLint; one production build; diff check. A broader run had one receipt-navigation timeout; its isolated five-test file passed. Disposable Edge browser PASS: zero unassigned payroll rows, separate two-batch setup, 50 x 5000 x 30% = 75000, fixed 50000, approval, 25000/50000 partial/full batch payment, exactly one expense per payment, PDF/CSV with assignment details, future fixed-rate switch to 60000 without changing approved history, reload and mobile fit, zero page errors. Existing build chunk warnings remain. Full suite and real backend integration NOT_RUN. Evidence: artifacts/payroll-two-methods-20261022/.

Changed application files: mock/assignmentPayroll.js (new), mock/mockDatabase.js, components/Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, DisbursePaymentModal.jsx, PayslipModal.jsx, utils/pdfHelpers.js and services/payrollService.test.js. Existing unrelated uncommitted work preserved on dev. Next approval: owner browser acceptance.

## PAYROLL-RUNNING-BALANCE - 2026-10-22

Owner explicitly supersedes monthly payroll/approval and confirms ONE salary balance per assignment (no recurring Add Salary action). New workflow: save the assignment salary, then Add Payment for any actual payment date; remaining equals agreed salary less recorded payments. Example verified: PKR 15,000 salary, PKR 5,000 payment, PKR 10,000 remaining, settled months later. Calendar changes, idle time, focus and navigation never add salary or recalculate the balance. Agreement saves update the SAME balance, retain salary revisions/payment records, and reject amounts below money already paid. Percentage and fixed assignment methods remain available; fee/enrollment basis is evaluated only on explicit agreement save. No salary setup means no fabricated payable.

Root cause of visible reload: FinancePage's shared 60-second interval/focus/storage refresh invalidated its resource and unmounted Payroll. These triggers now run only for Finance Overview; Payroll performs one read per branch/mount and reloads only after explicit salary/payment actions or Retry. Loading never calculates salary. Approval UI/service method and active calculatePeriod service method are removed. Historic monthly period reads remain compatibility-only. Period selectors, effective-month fields, monthly labels and approval gates are absent from the active flow. Actions show Add Payment immediately for an owed balance, with amount/method/reference/actual date. Payment date is today or earlier; negative, overpayment, duplicate reference, malformed date and foreign-branch actions reject. Each payment posts exactly one Finance expense with its actual date.

Running balances use payrollVersion:3 in the SAME payrollLines datastore. Old source lines/periods/payments are not rewritten/deleted; pure reads aggregate carry-forward balances and the first explicit salary edit/payment materializes one scoped running record referencing sourcePayrollLineIds. Subsequent reads exclude covered source rows from active totals, and even a direct old-line payment ID resolves to the existing running balance to prevent duplicate settlement. Prior unallocated teacher-only balances remain distinguishable historical balances. Earned unpaid balances remain payable after assignment removal; no new unearned salary is created. Admin/Super Admin management, Owner read-only overview, Receptionist/Teacher denial and branch scope remain enforced.

PASS: 62 focused/regression tests (49 payroll/component/faculty/academic/PDF/audit + 9 Finance Overview/financial + 4 mounted payroll); targeted ESLint; production build; diff check. Disposable Edge PASS: salary 15,000 -> payment 5,000 -> remaining 10,000; 130 seconds idle and focus cause zero extra reads/remounts/writes; later January payment settles the same balance with no period creation; PDF, mobile dialog and Finance once-per-payment verified with zero page errors. Existing large-chunk build warnings remain non-blocking. Full repository suite and backend integration NOT_RUN. IN_REVIEW pending owner acceptance; dev branch, unrelated dirty work preserved, no commit/push. Evidence: artifacts/payroll-running-balance-20261022/.

Changed application files: mock/runningPayroll.js (new), mock/assignmentPayroll.js, mock/mockDatabase.js, services/payrollService.js and test, components/Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, DisbursePaymentModal.jsx, PayslipModal.jsx, pages/Finance/FinancePage.jsx, pages/Finance/TeacherPayrollPage.test.jsx, utils/pdfHelpers.js.
## PAYROLL-TABLE-CLEANUP - 2026-10-22 (IN_REVIEW)

Owner-authorized Finance Teacher Payroll presentation cleanup. Remove the redundant Combined Teacher Summary and the visible Eligible Students, Listed Fee and Agreed Rate detail columns from the on-screen table. Keep those calculation details in persisted records and report exports. Remove the forced 1080px table width and horizontal scrolling; use a compact eight-column desktop table and stacked mobile rows. Preserve salary setup, agreements, payments, balances, payslips, pagination and running-balance behavior. No Server, calculation or datastore changes. Verification: 10 focused tests PASS, targeted ESLint PASS, production build PASS and scoped git diff check PASS (line-ending warnings only). No commit/push. Awaiting owner review.

## FACULTY-SYNTHETIC-ASSIGNMENT-CLEANUP - 2026-10-22 (IN_REVIEW)

Owner-authorized cleanup of fabricated Faculty directory schedules in both built-in branches. Faculty cards and profiles now derive course, batch, timetable slot and student counts only from saved assignments, saved dated classes and saved active enrollments. Hardcoded fallback slots such as Dr. Irfan's two classes and 120-student labels are no longer projected. Unassigned faculty show no course, no batch, zero students and no assigned classes. Unassigned built-in faculty can be deleted from Faculty: demo-class references no longer block profile deletion, while real saved faculty assignments, dated classes and assigned assets remain protected. Deleted professional identity tombstones remain available for historical record resolution but are hidden from Faculty list/profile access. Verification: 27 focused tests PASS, targeted ESLint PASS, production build PASS, scoped diff check PASS. No commit/push. Awaiting owner review.
## PAYSLIP-LAYOUT-REF - 2026-10-22 (IN_REVIEW)

Owner-authorized faculty payslip layout cleanup: full-width current earnings, responsive toolbar/padding, compact deterministic display references in modal and PDF. Stored IDs, financial records and transaction references remain unchanged. See PROGRESS.md for verification.
## PAYROLL-PROGRESS-FILTER - 2026-10-22 (IN_REVIEW)

Owner-authorized compact salary progress section and method-specific progress. Percentage/Fixed Salary selections calculate paid versus payable for that method; All Methods restores combined progress. Search and payment-status filters do not redefine method totals. Seven focused component tests and targeted ESLint PASS. No commit/push.
## PAYROLL-COURSE-BATCH-FILTERS - 2026-10-22 (IN_REVIEW)

Owner-authorized Course and dependent Batch custom dropdowns beside payroll search. All Courses exposes all payroll batches; specific courses constrain batches and changing course clears batch selection. Table/export filtering uses immutable IDs. Paid and Partially Paid use distinct emerald/amber badges with dark-mode colors. Targeted ESLint PASS; verification in PROGRESS.md. No commit/push.
## PAYROLL-METHOD-MENU-WIDTH - 2026-10-22 (IN_REVIEW)

Owner-authorized local dropdown sizing: calculation-method menu reduced to 140–150px and aligned to the trigger's right edge to avoid right-side overflow. Other menus unchanged.
## PAYROLL-ACTIONS-MENU - 2026-10-22 (IN_REVIEW)

Owner-authorized three-dot payroll row actions. Add Payment, Payslip and Salary Agreement move into a compact icon menu, retaining permission/disabled guards. Portal positioning avoids table clipping; Escape/outside/scroll dismiss, arrow keys navigate. Targeted ESLint PASS. No commit/push.
## PAYROLL-TABLE-SPACING - 2026-10-22 (IN_REVIEW)

Owner-authorized table spacing refinement: rebalance eight column widths, increase desktop cell/header spacing, right-align numeric headers/values and move compact Actions to the far right. Existing mobile row layout preserved. Targeted ESLint PASS. No commit/push.
## PAYROLL-TABLE-100-ZOOM - 2026-10-22 (IN_REVIEW)

Owner requests the balanced 90%-zoom table appearance at normal browser zoom. Local responsive type/padding and column distribution adjusted without CSS zoom or forced width. Method/status labels stay unbroken; Status uses column padding rather than translation. Targeted ESLint PASS. No commit/push.
## FINANCE-SHORT-REFERENCES - 2026-10-22 (IN_REVIEW)

Owner-authorized short financial display references. Finance Overview hides embedded PAYROLL/ADVANCE storage tokens; overview and shared payroll/payslip display refs use three numeric digits with type prefixes. Internal IDs/references unchanged. Three-digit display aliases are not unique lookup keys. No commit/push.
## ROLE-MATRIX-UPDATE - 2026-10-22 (IN_REVIEW)

Owner-approved attachment 0068a230 applied within existing frontend mock architecture. Admin retains full active-branch module access and standard-role user creation restrictions; higher-role account editing/status/deletion is denied. Receptionist gains admission decisions/enrollment, existing-class editing, assets Add/Edit/View and operational reports. Owner gains readonly assets and branch reports. Administrative module guards remain Super Admin/Admin only. Report comparisons recheck each branch's effective role. Teacher self-service pages/payslips remain disabled where not implemented, as allowed by attachment section 5; no branch-wide Teacher financial or student grants were introduced. Existing payroll running balance, branch creation pause and license limits retained. See PROGRESS.md for checks and limitations. No commit/push; awaiting owner review.
# ROLE-TAB-ACCESS-STRICT — 2026-10-22

**Status:** IN_REVIEW

Owner-approved strict role/branch navigation enforcement is implemented on `dev`. A single module-access registry now drives desktop/mobile sidebar and Ctrl+K discovery; denied modules and empty groups are absent from the DOM, direct routes remain permission guarded, payroll has a separate read permission, branch switching recomputes access, and logout clears the mock session plus transient page resources. No finance, admission, salary or payroll calculation changed. No commit/push.

## DASHBOARD-PREMIUM-THEME — 2026-10-22

**Status:** IN_REVIEW

Owner-approved styling-only alignment applies the Super Admin KPI and panel design language to Admin, Receptionist, Owner and Teacher dashboards. Role-specific content, data loading, actions, sidebar permissions and routes remain unchanged. No commit/push.

## LOGIN-MOCK-CREDENTIAL-REPAIR - 2026-10-22

Owner-authorized local login repair. Corrected the ignored `Client/.env.local` Super Admin email key and restarted the stale Vite process so the configured credentials are loaded. No academy records, stored credentials, auth rules or application source were changed. Focused auth tests, targeted ESLint and disposable Edge login pass. IN_REVIEW; no commit/push.

## PAYROLL-REPORTS-CACHE-20261022

**Status:** IN_REVIEW. Owner attachment 51d487e7 authorizes saved running-payroll reporting plus improvements to the existing canonical-version page cache. Adds permission-scoped Payroll report rows, real KPIs, current balance chart, teacher totals, period/teacher filters and branded exports. Payroll and Audit initialize from valid scoped snapshots; Reports derived reads reuse the same bounded cache. No new datastore, payroll formula, monthly approval or dependencies. Earlier responsive changes remain preserved with final acceptance pending. No commit/push.
## ROLE-DATA-FLOW-20261022 — IN_REVIEW

- Owner-approved frontend task: bind all role dashboards to the canonical saved mock database with branch, account, role and permission isolation.
- Implemented permission-aware dashboard projection, mutation-safe cache keys, Teacher own-assignment/student/salary scoping, and saved Owner/Receptionist summaries.
- Focused integration, role/security, browser, ESLint and production-build evidence is recorded in PROGRESS.md. No commit or push; owner acceptance remains required.

## ALL-ROLE-PREMIUM-RESPONSIVE-20261022 — IN_REVIEW

- Owner-approved presentation ticket completed across the shared shell and all five role dashboards while preserving role data, permissions and workflows.
- Mobile KPI/action grids, navigation/search/dialog sizing, table containment and tablet quick-action layout now remain inside the viewport; verified dimensions and checks are recorded in PROGRESS.md.
- No dependency, backend, calculation, route or permission change. No commit/push; owner visual acceptance remains required.

## TEACHER-PROFILE-DASHBOARD-CLEANUP-20261022 — IN_REVIEW

- Removed Teacher My Profile back/contact actions and the Teacher Dashboard Instructor Actions section.
- Teacher profile KPI cards now read the existing own-record dashboard projection so saved batches, weekly hours, enrolled-student reach and class slots remain account/branch scoped.
- Focused tests, Edge QA, ESLint and build pass. No commit/push; owner review remains required.

## FINAL-FRONTEND-QA-DEV-PUSH-20261023 — Final release verification

Owner explicitly authorizes final QA and one normal commit/push to `dev` after all critical gates pass. Review covers all existing uncommitted frontend source, tests and tracking docs. Confirmed corrections: permission-safe Reports default category, Teacher session navigation to own timetable, viewport-contained phone notifications, and nine-category Reports assertion. Final QA VERIFIED: 692/692 complete tests, zero ESLint errors/warnings, production build and five-role responsive browser checks PASS. Evidence and limitations: `FINAL_FRONTEND_QA_20261023.md`. No backend deployment or production-readiness claim.
