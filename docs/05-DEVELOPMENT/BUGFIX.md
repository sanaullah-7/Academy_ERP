# BUGFIX

<!-- > Purpose: Records reproducible bugs, root causes, resolutions and regression verification. -->

# TSA Academy ERP — Bug Fixing, Defect Resolution & Regression Prevention

**Document:** BUGFIX.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Engineering Bug-Fix Standards
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Repository:** `Client/`, `Server/`, `docs/`
**Document Category:** Development & Quality Engineering

---

## 1. Purpose

This document defines the official bug-fixing and defect-resolution process for TSA Academy ERP.

Its purpose is to ensure that defects are investigated systematically, corrected safely and verified without damaging already approved functionality.

The bug-fixing process must protect:

- Existing frontend workflows.
- Backend API behavior.
- Authentication and sessions.
- Five-role authorization.
- Organization and branch isolation.
- Student and academic records.
- Admissions and Enrollments.
- Fee payments and challans.
- Teacher salary calculations.
- Assignment-based Payroll balances.
- Expenses and financial reports.
- Teacher My Profile.
- Historical records.
- Application configuration.
- Existing Git changes.

**Important:** This document establishes procedures. It does not authorize modifying source code, changing databases, executing financial repairs or deploying fixes.

---

## 2. Bug-Fixing Principles

### BUG-001 — Identify the Actual Defect

Understand what is failing before changing code.

### BUG-002 — Reproduce Whenever Practical

A repeatable failure is preferable to an unsupported assumption.

### BUG-003 — Preserve Approved Behavior

A bug fix must not change owner-approved product requirements.

### BUG-004 — Fix the Root Cause

Do not rely on artificial delays, hidden errors or unrelated workarounds.

### BUG-005 — Minimal File Changes

Modify only the files necessary for the approved correction.

### BUG-006 — Security Remains Enforced

Never disable authentication, RBAC or branch ownership checks to resolve an access error.

### BUG-007 — Financial Integrity Is Mandatory

Never silently change verified payments, salary history or posted expenses to make totals match.

### BUG-008 — Regression Prevention

Verify that connected modules still function correctly.

### BUG-009 — Preserve Developer Work

Do not overwrite unrelated Git changes or remove existing explanatory comments unnecessarily.

### BUG-010 — Accurate Completion Reports

Report actual changes and tests; do not claim unexecuted verification.

---

## 3. Project Baseline

TSA Academy ERP has an existing React/Vite frontend.

The frontend uses domain services, mock adapters and browser-local persistence for its demonstration workflows.

The planned backend uses Node.js, Express, MongoDB and Mongoose.

### Important

Before investigating a bug, determine whether the affected workflow currently uses:

- React component state.
- Frontend context.
- Mock domain services.
- Browser localStorage.
- A partially implemented backend.
- A real HTTP API.
- MongoDB persistence.

Do not assume that a planned backend endpoint already exists.

---

## 4. Approved Business Boundaries

The current system supports five roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Receptionist

Receptionist has Full approved Admissions and Fees access.

Independent Finance, Expenses, Payroll, Audit Log, Branches, Users and Settings access remains denied.

### Teacher

Teacher may view their own:

- Profile.
- Timetable.
- Academic Assignments.
- Salary Agreements.
- Paid and outstanding remuneration.
- Verified salary payments.
- Payslips.
- Notifications.

Teacher cannot access another Teacher's compensation.

### Teacher Payroll

Teacher salary uses assignment/batch/subject-based running balances.

**No automatic monthly salary generation is permitted.**

### Branches

- Different roles across different branches are supported.
- Unsupported same-branch multiple-role combinations fail closed.
- New branch creation remains paused for all roles.
- Branch and record ownership must be enforced server-side.

### Assets

Assets represents physical equipment inventory.

Cloudinary and general media uploads remain outside the current approved scope.

---

## 5. Bug Classification

Every reported problem should be classified.

| Type | Description |
|---|---|
| UI Bug | Layout, rendering or interaction defect |
| Functional Bug | Approved workflow behaves incorrectly |
| Validation Bug | Invalid data is accepted or valid data rejected |
| State Bug | Incorrect or stale frontend state |
| API Bug | Incorrect endpoint, contract or response |
| Authentication Bug | Login, logout or session failure |
| Authorization Bug | Role, branch or record access failure |
| Database Bug | Persistence, relationship or query defect |
| Financial Bug | Incorrect amount, payment or balance |
| Concurrency Bug | Race condition or duplicate operation |
| Performance Bug | Unacceptable latency or unnecessary resource use |
| Integration Bug | Frontend/backend behavior mismatch |
| Deployment Bug | Environment, hosting or configuration failure |
| Security Vulnerability | Unauthorized access or data exposure |
| Documentation Defect | Incorrect or outdated technical instruction |

A defect may belong to multiple categories.

---

## 6. Bug Severity

| Severity | Description | Example |
|---|---|---|
| Critical | Serious security, financial or data-integrity impact | Another Teacher's salary exposed |
| High | Important approved workflow unavailable | Fee payment cannot be recorded |
| Medium | Incorrect behavior with limited operational impact | Report filter returns wrong results |
| Low | Minor presentation or usability issue | Inconsistent spacing |

### Critical Examples

- Unauthorized access to student information.
- Unauthorized access to salary agreements.
- Duplicate verified fee payments.
- Duplicate payroll disbursements.
- Incorrect salary-to-expense posting.
- Cross-branch data disclosure.
- Production database corruption.

Severity must be based on verified impact.

---

## 7. Bug Report Template

Each defect report should contain:

**Bug ID:** Unique identifier
**Title:** Short description
**Module:** Affected feature
**Severity:** Critical / High / Medium / Low
**Environment:** Local / Test / Staging / Production
**Role:** Acting user role
**Branch:** Active branch
**Preconditions:** Required state
**Steps to Reproduce:** Exact user actions
**Expected Result:** Approved outcome
**Actual Result:** Observed problem
**Evidence:** Safe logs, test output or screenshot reference
**Related Files:** Confirmed or suspected source files
**Dependencies:** Other affected modules
**Status:** Current investigation state

### Evidence Security

Do not attach plaintext credentials, secret tokens or unnecessary confidential records.

---

## 8. Bug Lifecycle

```text
Reported
   |
   v
Triaged
   |
   v
Reproduced / Evidenced
   |
   v
Root Cause Investigated
   |
   v
Fix Scoped and Approved
   |
   v
Implemented
   |
   v
Tested
   |
   v
Regression Reviewed
   |
   v
Resolved / In Review
   |
   v
Owner Accepted, If Required
```

### Status Definitions

| Status | Meaning |
|---|---|
| REPORTED | Defect submitted |
| TRIAGED | Severity and scope assessed |
| INVESTIGATING | Cause under investigation |
| REPRODUCED | Failure confirmed |
| BLOCKED | Required information or dependency unavailable |
| READY | Fix requirements sufficiently clear |
| IN_PROGRESS | Authorized correction underway |
| IMPLEMENTED | Source change exists |
| TESTED | Relevant verification passed |
| IN_REVIEW | Awaiting review |
| RESOLVED | Technical fix verified |
| OWNER_ACCEPTED | Explicitly accepted by owner |
| DEFERRED | Fix postponed with documented reason |

Do not mark a bug resolved merely because source code was edited.

---

## 9. Pre-Fix Repository Inspection

Before making an authorized correction:

1. Read root `AGENTS.md`.
2. Review relevant `RULES.md` instructions.
3. Check Git status.
4. Identify the exact affected feature.
5. Inspect relevant frontend/backend files.
6. Review current tests.
7. Review related documentation.
8. Check recent changes.
9. Identify connected modules.
10. Establish the smallest safe correction.

### Safe Git Commands

```powershell
git status
git branch --show-current
git diff
```

Do not reset, clean or stash unrelated changes without authorization.

---

## 10. Root Cause Analysis

A proper investigation should identify:

- The failing operation.
- The expected behavior.
- The observed behavior.
- The layer where the failure originates.
- The condition triggering the failure.
- The affected records or users.
- Whether the defect causes security or financial risk.
- Why existing validation or tests did not detect it.

### Possible Layers

- React component.
- React context.
- Frontend domain service.
- Mock adapter.
- HTTP adapter.
- Express middleware.
- Controller.
- Domain service.
- Repository.
- Mongoose model.
- MongoDB.
- Hosting environment.

### Rule

Fix the layer responsible for the defect rather than changing unrelated components.

---

## 11. Minimal Change Policy

A bug-fix ticket must define its expected change scope.

### Preferred Approach

- Correct the actual source of the defect.
- Preserve existing service interfaces where practical.
- Avoid unrelated formatting changes.
- Reuse existing utilities.
- Retain meaningful explanatory comments.
- Add focused tests.
- Review the final diff.

### Prohibited Without Approval

- Large architectural rewrites.
- Unrelated component redesign.
- Database resets.
- Automatic dependency upgrades.
- Broad renaming.
- Unrequested feature additions.

---

## 12. Frontend UI Bug Fixing

Common problems include:

- Blank screens.
- Incorrect conditional rendering.
- Broken modal dialogs.
- Form validation errors.
- Incorrect table values.
- Responsive layout issues.
- Missing loading states.

### Investigation

1. Reproduce the specific UI problem.
2. Inspect browser console.
3. Check the affected component.
4. Verify props and state.
5. Trace data from the domain service.
6. Check active role and branch.
7. Identify the smallest valid fix.
8. Verify the screen and connected workflow.

### Important

Do not modify application-wide design tokens to fix one local spacing issue unless that is the verified cause.

---

## 13. Frontend State Bugs

Potential symptoms:

- Data does not refresh.
- Branch switch shows old records.
- User role changes but navigation remains stale.
- Logout leaves sensitive state.
- Old API responses overwrite new results.

### Investigation

- Identify the state owner.
- Inspect Auth and Branch contexts.
- Review cache keys.
- Review asynchronous effects.
- Check service calls.
- Verify cleanup and invalidation.
- Reproduce rapid branch switching.

### Security Requirement

Previous user's or branch's confidential state must not appear after a context change.

---

## 14. Mock Persistence Bugs

The current frontend uses browser localStorage.

### Common Problems

- Records reset unexpectedly.
- Different browsers show different data.
- Schema version mismatch.
- Duplicate mock records.
- Incorrect stored relationships.

### Fixing Rules

- Verify actual storage keys and versioning.
- Inspect centralized mock database logic.
- Preserve existing saved data where possible.
- Avoid directly modifying browser storage without understanding the consequences.
- Do not silently migrate browser records into MongoDB.

A mock persistence defect does not automatically justify creating a new backend API.

---

## 15. Backend API Bugs

Backend API problems may include:

- Wrong method.
- Wrong path.
- Missing validation.
- Incorrect DTO.
- Wrong HTTP status.
- Unexpected error response.
- Missing authentication.
- Incorrect permission check.

### Investigation

1. Verify the accepted API contract.
2. Inspect frontend service mapping.
3. Inspect route registration.
4. Verify middleware.
5. Inspect controller and domain service.
6. Verify repository behavior.
7. Check actual response.
8. Add a focused contract/regression test.

### Requirement

Do not change an API response shape without evaluating affected frontend consumers.

---

## 16. Authentication Bugs

### Common Symptoms

- Valid credentials rejected.
- Disabled user still active.
- Logout does not invalidate session.
- Session unexpectedly expires.
- Production cookie not sent.

### Checks

- Credential verification.
- Account status.
- Session creation.
- Session store.
- Cookie attributes.
- HTTPS.
- CORS.
- CSRF.
- Session expiration.
- Revocation.

### Restrictions

Never disable password verification or session checks as a permanent fix.

Never log plaintext passwords.

---

## 17. Authorization Bugs

### Example Problems

- Receptionist cannot perform an approved Fees operation.
- Receptionist can access independent Finance.
- Teacher can view another Teacher's payslip.
- Admin can escalate roles.
- User can access unassigned branch records.

### Investigation

1. Authenticate the correct user.
2. Resolve active branch.
3. Resolve effective role.
4. Verify action permission.
5. Check target-record ownership.
6. Check business rules.
7. Inspect middleware and repository filters.

### Critical

Hidden frontend buttons do not constitute backend authorization.

An access bug must be corrected without granting unrelated permissions.

---

## 18. Multi-Branch Bugs

A staff account may have different roles in different branches.

### Example

```text
User A
  |
  +-- Branch 1: Teacher
  |
  +-- Branch 2: Receptionist
```

### Typical Defects

- Wrong role after branch switch.
- Previous branch data remains visible.
- Incorrect branch ownership stored.
- Unauthorized cross-branch report.
- Revoked branch access still works.

### Required Fix

Correct branch resolution and record-scope enforcement.

Do not merge branch data or remove branch filters to simplify queries.

### Confirmed Restrictions

- Unsupported same-branch multi-role combinations fail closed.
- Branch creation remains paused.

---

## 19. Admission Bugs

Approved current states:

- Pending.
- Approved.
- Permitted return to Pending.

### Common Bugs

- Invalid status transition.
- Duplicate admission.
- Missing student link.
- Wrong branch.
- Unsafe deletion.
- Enrollment failure.

### Fixing Rules

- Verify source workflow.
- Preserve status history where supported.
- Validate Student, Course and Batch references.
- Respect transaction boundaries.
- Preserve Receptionist's approved access.
- Reject unsupported transitions.

Do not restore the superseded Reject workflow without approval.

---

## 20. Enrollment Bugs

Potential problems:

- Duplicate enrollment.
- Batch overcapacity.
- Incorrect Course/Batch relationship.
- Wrong Student association.
- Missing Challan.
- Partial instant admission.

### Requirements

- Validate references.
- Enforce uniqueness.
- Prevent concurrent over-enrollment.
- Use transactions where related writes must succeed together.
- Check authoritative database state.
- Preserve valid existing enrollments.

Do not delete historical Enrollments simply to resolve an overcapacity report.

---

## 21. Challan Bugs

### Common Symptoms

- Incorrect payable.
- Duplicate Challan.
- Missing Enrollment reference.
- Incorrect outstanding.
- Payment linked to wrong Student.

### Investigation

- Identify Enrollment.
- Verify Course/Subject fee calculation.
- Check approved one-challan-per-enrollment rule.
- Review valid verified payment history.
- Confirm branch ownership.
- Inspect uniqueness constraints.

### Important

Do not add recurring monthly Challan generation without separate approval.

---

## 22. Fee Payment Bugs

Fee Payments are high-integrity operations.

### Typical Defects

- Duplicate payment.
- Overpayment.
- Incorrect verification status.
- Incorrect outstanding.
- Wrong receipt.
- Finance mismatch.

### Required Checks

1. Challan identity.
2. Student relationship.
3. Branch ownership.
4. Payment amount.
5. Verification state.
6. Idempotency reference.
7. Transaction result.
8. Remaining balance.
9. Dependent Finance projections.

### Reconciliation

```text
Approved Challan Payable
          -
Valid Applied Verified Payments
          =
Outstanding Fee Balance
```

Use the final approved money and payment lifecycle rules when calculating expected values.

### Critical

Do not retry a timed-out financial write blindly.

Determine whether the original operation committed.

---

## 23. Teacher Payroll Bugs

**Confirmed payroll model:** Assignment-based running remuneration.

Teacher salary is not generated automatically at each calendar month.

### Potential Defects

- Incorrect Fixed calculation.
- Incorrect Percentage calculation.
- Duplicate salary obligation.
- Wrong Faculty Assignment.
- Partial payment does not reduce outstanding.
- New agreement overwrites old balances.
- Salary payment appears twice.
- Linked Expense missing.
- Teacher Profile mismatch.

### Required Investigation

1. Teacher identity.
2. Faculty Assignment.
3. Salary Agreement.
4. Approved Fixed/Percentage calculation.
5. Existing running obligation.
6. Valid salary payment history.
7. Outstanding balance.
8. Linked Posted Expense.
9. Administrative Payroll display.
10. Teacher self-service display.

### Formula Source Verification

Inspect actual relevant frontend source and tests before changing calculations.

Candidate paths:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Confirm real file locations and authoritative functions.

---

## 24. Payroll Running Balance Bugs

### Conceptual Relationship

```text
Approved Assignment Payable
           -
Valid Applied Salary Payments
           =
Outstanding Running Balance
```

The exact implementation must respect approved agreement revision and rounding behavior.

### Common Causes

- Duplicate payment.
- Wrong assignment link.
- Incorrect payment status.
- Incorrect payable calculation.
- Historical agreement overwritten.
- Stale cached balance.
- Invalid monetary rounding.

### Prohibited Fixes

- Resetting outstanding at month-end.
- Generating monthly salary.
- Deleting valid payments.
- Combining unrelated assignments.
- Editing amounts to match the UI.
- Hiding unpaid historical obligations.

---

## 25. Salary Payment and Expense Bugs

A successful salary payment must correspond to the appropriate posted expense.

### Possible Failures

- Salary Payment exists, Expense missing.
- Expense exists, Salary Payment missing.
- Duplicate Payroll Expense.
- Incorrect expense amount.
- Wrong branch.
- Finance counts the expense twice.

### Investigation

- Inspect committed payment.
- Inspect linked expense.
- Verify transaction boundary.
- Check idempotency.
- Compare amounts.
- Verify branch and assignment.
- Check Finance aggregation.

### Financial Repair Rule

Do not create, delete or modify financial records through an undocumented debugging shortcut.

A separate approved and auditable correction process is required.

---

## 26. Teacher My Profile Bugs

### Route

`/my-profile`

### Existing Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Common Bugs

- Incorrect Teacher mapping.
- Missing timetable.
- Missing assignments.
- Wrong salary agreement.
- Incorrect paid/outstanding.
- Missing payslip.
- Other Teacher's confidential data accessible.

### Required Tests

- Teacher reads own information.
- Teacher reads own salary.
- Teacher reads own verified payments.
- Teacher downloads own payslip.
- Teacher cannot access another Teacher's salary.
- Nonauthorized role cannot use administrative Payroll through self-service endpoints.

A confirmed unauthorized salary disclosure is a critical security issue.

---

## 27. Finance and Expense Bugs

### Common Symptoms

- Revenue inflated.
- Expense counted twice.
- Net position incorrect.
- Wrong branch totals.
- Payroll expense mismatch.
- Dashboard and Finance disagree.

### Investigation

- Verify Fee Payment statuses.
- Verify posted Expense records.
- Check Salary Payment/Expense relationships.
- Check aggregation joins.
- Check date and branch filters.
- Check cached results.

### Core Rule

Financial reports must derive from authoritative source records.

Do not alter payments to make calculated reports look correct.

---

## 28. Reports and Export Bugs

### Potential Defects

- Missing records.
- Incorrect totals.
- Wrong branch filtering.
- Export differs from displayed report.
- Confidential Teacher salary exposed.
- Print layout broken.

### Requirements

- Verify source queries.
- Verify permissions.
- Check field mapping.
- Check date filters.
- Check duplicate aggregation.
- Inspect representative exported contents.
- Test affected print layouts.

Generating a file successfully does not prove its contents are correct.

---

## 29. Demo Classes Bugs

### Common Problems

- Inquiry not saved.
- Incorrect attendance status.
- Duplicate conversion.
- Wrong Admission prefill.
- Unauthorized branch inquiry access.

### Requirements

- Preserve current approved states.
- Verify existing conversion reference.
- Prevent unintended duplicates.
- Maintain correct branch ownership.
- Avoid creating unapproved payments or Enrollments.

---

## 30. Physical Assets Bugs

The Assets module manages physical equipment.

### Typical Defects

- Duplicate Asset identifier.
- Wrong staff assignment.
- Missing inspection event.
- Incorrect branch inventory.
- Maintenance history not preserved.

### Requirements

- Validate identity and ownership.
- Preserve historical events.
- Enforce permissions.
- Avoid unsupported automatic expense generation.
- Do not introduce Cloudinary or digital media infrastructure.

---

## 31. Database Bugs

Possible problems include:

- Invalid references.
- Duplicate keys.
- Missing indexes.
- Incorrect schema validation.
- Unscoped queries.
- Transaction failures.
- Historical data inconsistencies.

### Investigation

1. Verify environment.
2. Verify database connection.
3. Inspect actual collection schema.
4. Inspect affected records safely.
5. Check relationship validity.
6. Review indexes.
7. Inspect domain service and repository.
8. Verify concurrent behavior where relevant.

### Production Safety

Do not delete collections, manually alter payment records or run destructive scripts without explicit authorization.

---

## 32. Concurrency Bugs

### High-Risk Cases

- Last-seat Batch enrollment.
- Simultaneous Fee Payments.
- Simultaneous Salary Payments.
- Concurrent Salary Agreement revisions.
- Role revocation during active sessions.

### Required Approach

- Reproduce safely with isolated data.
- Inspect transaction behavior.
- Check conditional updates.
- Check unique constraints.
- Verify idempotency.
- Inspect committed results.

Sequential tests cannot prove concurrency safety.

---

## 33. Caching Bugs

### Symptoms

- Old Fee balance.
- Old Payroll outstanding.
- Previous branch data.
- Stale Dashboard totals.
- Reports not updated after payment.

### Investigation

- Identify source of truth.
- Inspect relevant cache keys.
- Check mutation outcome.
- Check invalidation.
- Check request ordering.
- Verify active branch and user.

### Critical

Cached balances must not authorize financial writes.

The backend must validate authoritative state.

---

## 34. Performance Bugs

### Investigation Order

1. Measure actual latency.
2. Identify slow module.
3. Determine whether the bottleneck is frontend, API or database.
4. Inspect query filters.
5. Inspect database indexes.
6. Check pagination.
7. Review repeated lookups.
8. Inspect aggregation complexity.
9. Apply a targeted optimization.
10. Verify correctness and performance.

Do not introduce Redis or distributed architecture without a demonstrated need.

---

## 35. Environment and Deployment Bugs

Potential issues include:

- Invalid API URL.
- Backend startup failure.
- Missing environment variable.
- MongoDB connection error.
- Incorrect cookies.
- CORS rejection.
- CSRF failure.
- Vite SPA routing failure.
- Incorrect hosting port.

### Required Checks

- Actual package scripts.
- Environment variables.
- Hosting logs.
- Database connectivity.
- HTTPS configuration.
- Application readiness.
- Frontend/backend contract.

Never expose production secrets while sharing diagnostics.

---

## 36. Security Bug Response

Examples:

- Cross-branch data access.
- Privilege escalation.
- Session bypass.
- Another Teacher's payslip exposed.
- Protected Finance API accessible to Receptionist.

### Immediate Priorities

1. Confirm the issue safely.
2. Preserve evidence.
3. Restrict ongoing exposure as authorized.
4. Identify affected accounts and records.
5. Investigate root cause.
6. Apply an approved correction.
7. Run security regression tests.
8. Record incident outcome.

Do not publish confidential evidence in unrestricted project logs.

---

## 37. Test-Driven Bug Verification

Where feasible, create a regression test demonstrating the original defect.

### Recommended Sequence

1. Define expected behavior.
2. Reproduce the failing case.
3. Add a focused test.
4. Confirm the test detects the original failure.
5. Apply the minimal fix.
6. Execute the test again.
7. Run relevant adjacent tests.
8. Review actual results.

A regression test need not be added for every purely cosmetic issue, but high-risk security and financial defects should receive appropriate automated protection.

---

## 38. Bug Fix Testing Matrix

| Changed area | Minimum relevant verification |
|---|---|
| React component | Component behavior and affected workflow |
| Auth context | Login, logout, role/branch state |
| Admissions | Status transitions, Student/Enrollment |
| Enrollment | Batch capacity, duplicate prevention |
| Fees | Payment validation, balances, Finance |
| Payroll | Calculation, outstanding, linked Expense |
| Teacher Profile | Self-only salary, timetable, payslip |
| Finance | Verified revenue, posted expenses |
| RBAC | Permitted and forbidden actions |
| Branch scope | Cross-branch denial and switching |
| Database | Schema, references, transactions |
| API contract | Payload/response and frontend adapter |
| Deployment | Startup, connectivity, smoke tests |

Expand the test scope when shared services or several modules are affected.

---

## 39. Regression Prevention Rules

A successful fix must not:

- Break approved Admissions.
- Change Receptionist Fees access.
- Expose financial data.
- Change branch ownership.
- Create duplicate payments.
- Introduce automatic monthly salary.
- Overwrite historical Payroll.
- Duplicate salary expenses.
- Change unrelated frontend behavior.
- Remove useful validation.
- Break existing report/export contracts.

---

## 40. Definition of Ready for Fix

A defect is ready for implementation when:

- Expected behavior is identified.
- Evidence is sufficient.
- Relevant current files are known.
- Root cause or likely failure point is understood.
- Scope is approved.
- Connected modules are identified.
- Necessary tests are defined.
- No unresolved blocking business decision remains.

A critical incident may require separately authorized immediate containment before a full permanent fix is ready.

---

## 41. Definition of Resolved

A defect may be marked technically resolved when:

1. The actual failure has been corrected.
2. The change stays within approved scope.
3. Relevant tests have been executed.
4. Required tests pass.
5. Important security boundaries remain enforced.
6. Related financial relationships remain consistent.
7. No known critical regression was introduced.
8. The result is documented.
9. Remaining limitations are disclosed.

Formal owner acceptance remains separate.

---

## 42. Bug-Fix Completion Report

After an approved fix, provide a concise Roman Urdu report.

### Required Fields

**Bug ID:** Reference
**Module:** Affected feature
**Root Cause:** Verified explanation
**Changed Files:** Actual paths
**Fix:** Implemented correction
**Tests:** Executed commands/scenarios
**Results:** Passed, failed or blocked
**Remaining Risks:** Known limitations
**Git Status:** Actual state

### Reporting Integrity

Do not claim:

- Tests passed without execution.
- Database migration completed without execution.
- Deployment completed without deployment.
- Owner acceptance without explicit approval.

---

## 43. Git Safety

Before and after fixing:

```powershell
git status
git diff
git diff --check
```

### Rules

- Preserve unrelated files.
- Do not use destructive resets.
- Do not clean unknown untracked files.
- Do not stash without authorization.
- Do not modify package dependencies unnecessarily.
- Do not commit or push automatically.
- Keep changes reviewable.

---

## 44. Documentation Updates

Update relevant records after an approved fix.

### `PROGRESS.md`

Record actual changes and tests.

### `TASKS.md`

Update the defect ticket.

### `MEMORY.md`

Record lasting owner decisions, not temporary debugging notes.

### `BACKEND_GAPS_AND_RISKS.md`

Track unresolved architectural and integrity risks.

### Technical Specifications

Update them only when a verified implementation correction or approved product change requires it.

Avoid rewriting documentation unrelated to the defect.

---

## 45. Bug Fixing Anti-Patterns

Do not:

- Guess causes without inspecting source.
- Rewrite an entire module for a small defect.
- Suppress errors without resolving them.
- Disable security middleware.
- Remove branch filtering.
- Trust browser role parameters.
- Delete database collections as a shortcut.
- Clear localStorage without considering data loss.
- Edit historical financial transactions silently.
- Retry uncertain payments blindly.
- Generate monthly Teacher Payroll.
- Change existing Fixed/Percentage calculations without verification.
- Install unnecessary dependencies.
- Report success without tests.

---

## 46. Defect Escalation

A bug requires explicit decision or authorization if its resolution involves:

- Business rule changes.
- Production data correction.
- Financial reversals.
- Historical payment modification.
- Database migrations.
- Privileged account changes.
- Secret rotation.
- Production rollback.
- New infrastructure.
- Destructive operations.
- User-visible workflow redesign.

Document the exact decision required.

Do not silently convert the defect into a new feature.

---

## 47. Bug-Fix QA Checklist

### Investigation

- [ ] Expected behavior verified.
- [ ] Actual failure evidenced.
- [ ] Affected files inspected.
- [ ] Root cause identified.
- [ ] Business scope confirmed.

### Implementation

- [ ] Minimal authorized fix applied.
- [ ] Existing comments preserved where relevant.
- [ ] No unrelated features introduced.
- [ ] Security checks remain enabled.
- [ ] Data integrity preserved.

### Verification

- [ ] Targeted tests executed.
- [ ] Relevant regression tests executed.
- [ ] Financial reconciliation checked where relevant.
- [ ] Branch isolation checked where relevant.
- [ ] Error handling verified.
- [ ] Git diff reviewed.

### Reporting

- [ ] Actual changed files listed.
- [ ] Test results documented.
- [ ] Known limitations disclosed.
- [ ] Correct completion status recorded.

Unchecked boxes indicate unfinished verification.

---

## 48. Open Bug-Fix Process Decisions

The following remain TBD:

- Defect tracking system.
- Final severity escalation procedure.
- Production incident response authority.
- Financial repair governance.
- Required test coverage for each bug category.
- Formal code review process.
- Production emergency-release workflow.
- Final owner acceptance procedure.

Do not invent final policies.

---

## 49. Related Documentation

This document must remain consistent with:

- `AGENTS.md` — Agent instructions.
- `RULES.md` — Engineering rules.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `SECURITY.md` — Security.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication and sessions.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization/branch ownership.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Schema/data changes.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `DATA_FLOW.md` — Cross-module flows.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial transactions.
- `CACHING_AND_PERFORMANCE.md` — Query and cache behavior.
- `FRONTEND_INTEGRATION.md` — Frontend service interfaces.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Development roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Backend tests.
- `REGRESSION_AND_QA.md` or existing `TESTING_AND_QA.md` — Regression standards.
- `DEBUGGING.md` — Detailed investigation.
- `LOGGING_AND_MONITORING.md` — Observability.
- `BACKUP_AND_RECOVERY.md` — Recovery procedures.
- `FEATURE_DEVELOPMENT.md` — Feature implementation workflow.
- `TASKS.md` — Development tasks.
- `PROGRESS.md` — Verified progress.

Use actual repository paths and existing document names.

---

## 50. Final Implementation Boundary

### Confirmed Business Requirements

- Five current roles.
- Receptionist Full approved Admissions and Fees access.
- Teacher self-only profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy organization with multiple branches.
- Current branch creation pause.
- Protected student and financial records.
- Physical Assets without media-upload infrastructure.

### Proposed Engineering Process

- Defect classification.
- Root-cause analysis.
- Minimal fixes.
- Relevant regression testing.
- Security and financial integrity verification.
- Accurate reporting.
- Controlled escalation.

### Deferred

- Unsupported financial reversals.
- Multi-client SaaS defect workflows.
- Electron/offline synchronization.
- Cloudinary/media infrastructure.
- Unnecessary architectural expansion.

### Not Implemented by This Document

- Actual source-code fixes.
- Database corrections.
- New automated tests.
- Production deployments.
- Git commits.
- Completed bug reviews.

**Governing Principle:** Fix the verified root cause with the smallest authorized change while protecting approved frontend functionality, backend security, multi-branch isolation and authoritative financial history.

**Document Status:** DRAFT — Ready for use as the project's bug-fixing standard.
