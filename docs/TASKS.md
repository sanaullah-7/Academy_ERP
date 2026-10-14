<!-- Active task checklist â€” abhi kis ticket par kaam chal raha hai aur agla task kya hai -->

# Academy Management ERP â€” Active Task Register

**Document:** TASKS.md
**Version:** 1.0
**Status:** ACTIVE - F04 Courses & Batches and F05 Faculty & Classes IN_REVIEW
**Last Updated:** 2026-10-12
**Project:** Academy Management ERP
**Development Strategy:** Frontend First
**Current Milestone:** F04-001 through F04-007 and F05-001 through F05-007 IN_REVIEW

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

**Local production-preview browser checks PASS:** 360/768/1024/1440px popup bounds/no page overflow; Tab containment; Escape/focus restoration; first-error focus/description; formatted success/list IDs; atomic linked storage; actual nested URL reload; North/Central isolation and sequential IDs; standalone shared form; dashboard route and logout denial; no runtime exceptions. Screenshots: [mobile popup](../artifacts/f02-003/admission-popup-360.png), [desktop popup](../artifacts/f02-003/admission-popup-1440.png), [saved list](../artifacts/f02-003/admissions-saved-1440.png).

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

[Actual checks and dependencies](PROGRESS.md#f00-004--verification-evidence-2026-10-09); [approved theme details](DESIGN.md#f00-004--approved-design-system-2026-10-09). Remaining work: owner review, maintained test infrastructure and deployed-host SPA fallback verification. Future implementation needs separate approval.

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

The Lovable reference was accessible in Edge. Verified observations and proposed differences are in [the design review](DESIGN.md#doc-sync-001--lovable-reference-review-2026-10-09). Current authorization ends with this report; proposed visual changes require a separately approved ticket. No next coding ticket has started.

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
| docs/README.md | Review pending |
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
| DOC-005 | Review docs/README.md and root README.md | BACKLOG |
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
| F07 | Finance | BACKLOG |
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
- [Technical Architecture](ARCHITECTURE.md)
- [Database Design](ERD.md)
- [Visual Design](DESIGN.md)
- [Security](SECURITY.md)
- [Frontend Integration](FRONTEND_INTEGRATION.md)
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
