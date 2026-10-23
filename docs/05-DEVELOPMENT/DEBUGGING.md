# DEBUGGING

<!-- > Purpose: Provides troubleshooting guidance for frontend, backend, database, caching and API issues. -->

# TSA Academy ERP — Debugging, Troubleshooting & Incident Investigation Guide

**Document:** DEBUGGING.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Debugging Procedures Proposed; Repository-Specific Commands Require Verification
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization, Multiple Branches
**Document Category:** Operations & Development Support

---

## 1. Purpose

This document establishes a consistent process for diagnosing, reproducing, isolating and correcting technical and business-related problems in TSA Academy ERP.

It covers:

- Frontend rendering and state problems.
- Backend API failures.
- Authentication and session problems.
- Role and branch authorization issues.
- MongoDB connectivity and persistence.
- Admission and Enrollment inconsistencies.
- Challan and verified payment issues.
- Assignment-based Teacher Payroll errors.
- Salary Payment and Expense reconciliation.
- Data caching and stale responses.
- Reports and Dashboard differences.
- Deployment and environment problems.
- Incident handling and regression testing.

**Important:** This document provides debugging procedures, not authorization to modify production records, bypass security, change credentials or deploy fixes.

---

## 2. Debugging Principles

### DBG-001 — Reproduce Before Changing

Understand the failure and identify a repeatable scenario where possible.

### DBG-002 — Inspect Actual Source

Do not diagnose solely from documentation or assumptions. Review relevant implementation files and tests.

### DBG-003 — Protect Existing Work

Check Git status and preserve unrelated changes before making any modifications.

### DBG-004 — Fix Root Causes

Avoid hiding errors through arbitrary delays, retries or permission bypasses.

### DBG-005 — Preserve Business Behavior

A technical fix must not introduce new or unauthorized product rules.

### DBG-006 — Security Must Remain Enabled

Never permanently disable authentication, RBAC, branch filtering, input validation or transaction safeguards to make a request succeed.

### DBG-007 — Financial History Is Protected

Do not silently edit payment, payroll or expense records to force displayed totals to match.

### DBG-008 — Use Minimal Changes

Modify only the files required to resolve the verified problem.

### DBG-009 — Test the Fix

Verify the original failure and relevant connected workflows.

### DBG-010 — Report Actual Results

Distinguish confirmed causes from hypotheses, and executed tests from planned tests.

---

## 3. Project Architecture Reference

### Current Frontend

```text
React Page
     |
     v
Frontend Domain Service
     |
     v
Mock Adapter
     |
     v
Browser localStorage
```

### Future Backend Integration

```text
React Page
     |
     v
Frontend Domain Service
     |
     v
HTTP Adapter
     |
     v
Express Route / Middleware
     |
     v
Controller
     |
     v
Domain Service
     |
     v
Repository / Mongoose
     |
     v
MongoDB
```

The backend must not be assumed implemented merely because backend architecture documentation exists.

Debugging steps must reflect the actual implementation stage.

---

## 4. Initial Debugging Checklist

Before investigating an issue:

1. Identify the failing module and user workflow.
2. Record the exact error message.
3. Identify the affected environment.
4. Identify the user role and active branch.
5. Inspect current Git status.
6. Determine whether the frontend uses mock or HTTP persistence.
7. Identify the relevant files and services.
8. Check recent changes.
9. Inspect browser or backend logs as applicable.
10. Attempt a safe reproduction.
11. Form a specific technical hypothesis.
12. Test the hypothesis before changing code.

Do not start by deleting dependencies, resetting the database or rewriting a working module.

---

## 5. Issue Classification

Classify the incident before applying a fix.

| Category | Examples |
|---|---|
| Frontend | Blank screen, failed rendering, broken form |
| State management | Stale selected branch, incorrect local state |
| Mock persistence | Missing browser-local demo records |
| API | Wrong endpoint, invalid request/response |
| Authentication | Failed login, expired session |
| Authorization | Role or branch access denied |
| Database | Connection failure, invalid relationship |
| Business logic | Invalid admission status or batch capacity |
| Financial | Incorrect Fees or Payroll balance |
| Concurrency | Duplicate payment, over-enrollment |
| Caching | Old Dashboard or Finance totals |
| Configuration | Incorrect API URL or CORS settings |
| Deployment | Build failure, unhealthy application |
| Performance | Slow queries or expensive reports |
| Security | Cross-branch disclosure or privilege escalation |

An issue may affect more than one category.

---

## 6. Debugging Priority Levels

### Critical

Examples:

- Unauthorized access to confidential records.
- Confirmed duplicate verified fee collection.
- Incorrect salary payment posting.
- Data corruption.
- Production database exposure.

### High

Examples:

- Login unavailable.
- Core Admissions or Fees operation broken.
- Payroll payment transaction fails repeatedly.
- Database unavailable.

### Medium

Examples:

- Report inconsistency.
- Failed noncritical module operation.
- Incorrect branch-specific display with no confirmed disclosure.

### Low

Examples:

- Minor visual problem.
- Noncritical notification display issue.
- Cosmetic console warning.

Severity must reflect actual impact, not the apparent complexity of the error message.

---

## 7. Safe Repository Inspection

Start from the actual repository root.

### Check Git Status

```powershell
git status
```

### Check Current Branch

```powershell
git branch --show-current
```

### View Existing Changes

```powershell
git diff
```

### Inspect Frontend Scripts

```powershell
node -p "require('./Client/package.json').scripts"
```

### Inspect Backend Scripts

Run only if the corresponding package file exists:

```powershell
node -p "require('./Server/package.json').scripts"
```

### Rules

- Do not assume scripts exist.
- Do not delete untracked files.
- Do not reset unrelated changes.
- Do not change dependencies without a verified requirement.
- Preserve the exact `Client/` and `Server/` directory names.

---

## 8. Frontend Debugging

The React frontend may encounter:

- Rendering errors.
- Incorrect route handling.
- Missing data.
- Broken form validation.
- Stale context values.
- Incorrect role navigation.
- Unexpected state changes.

### Investigation Procedure

1. Reproduce the exact user action.
2. Check browser Developer Tools.
3. Inspect Console errors.
4. Inspect the affected React component.
5. Identify the relevant domain service.
6. Check current Auth and Branch context.
7. Verify mock versus HTTP data source.
8. Review relevant existing tests.
9. Make a minimal authorized correction.
10. Verify the original workflow.

### Common Causes

- Undefined or missing response fields.
- Incorrect imports.
- Stale component state.
- Service contract mismatches.
- Invalid browser-local data.
- Unexpected asynchronous response ordering.
- Incorrect current branch context.

Avoid adding unnecessary state-management libraries solely to fix an isolated component bug.

---

## 9. React Rendering Errors

### Symptoms

- Blank screen.
- Component crashes.
- Error boundary displayed.
- Route does not render.
- Browser console contains an exception.

### Checks

- Component imports and exports.
- Props and state values.
- Optional fields.
- Conditional rendering.
- Service response shape.
- Loading state.
- Current user permissions.
- Active branch.

### Resolution Principle

Correct the actual invalid state or contract.

Do not suppress all exceptions or return empty screens as a permanent workaround.

---

## 10. Frontend State and Context Problems

Shared application state may include:

- Authentication.
- Active branch.
- Academy branding.
- Theme.
- Notifications.
- Cached service data.

### Typical Symptoms

- Previous branch records remain visible.
- User role changes but navigation remains stale.
- Theme changes do not appear.
- Logout leaves sensitive page data visible.
- Old API response overwrites newer state.

### Investigation

1. Identify the state owner.
2. Inspect provider initialization.
3. Trace the mutation sequence.
4. Check dependent effects.
5. Check asynchronous requests.
6. Verify cleanup after logout/branch changes.
7. Test with multiple roles and branches.

### Security Rule

A stale frontend state bug must not be used to justify weakening backend authorization.

---

## 11. Browser localStorage Problems

The existing frontend uses browser-local demo persistence.

### Possible Symptoms

- Demo data disappears.
- Different browsers show different records.
- Records reset after a schema change.
- An old mock database version produces invalid fields.

### Checks

- Browser origin.
- Browser profile.
- Actual storage keys.
- Mock data version.
- Application migration helpers.
- Recent reset behavior.
- Current active branch.

### Important

Browser localStorage belongs to the relevant browser origin and profile.

It is not automatically synchronized with MongoDB or other staff users.

### Prohibited Shortcut

Do not clear localStorage unless the user understands and authorizes the potential data loss.

---

## 12. Frontend HTTP Integration Problems

When the HTTP adapter is implemented, possible errors include:

- Incorrect API base URL.
- Unsupported endpoint.
- Request field mismatch.
- Response envelope mismatch.
- Authentication cookie missing.
- CORS failure.
- Network timeout.
- Invalid branch parameter.

### Debugging Sequence

1. Inspect the browser Network panel.
2. Confirm the request URL and method.
3. Review request headers safely.
4. Check HTTP response status.
5. Inspect the permitted response fields.
6. Verify the API contract.
7. Check backend route/controller.
8. Check relevant middleware.
9. Verify the underlying domain service.
10. Compare against the existing mock behavior.

Do not include passwords, session cookies or private financial payloads in debugging reports.

---

## 13. Backend Startup Failures

### Symptoms

- Express server does not start.
- Process exits immediately.
- Database connection times out.
- Required environment variable is missing.
- Port is already occupied.

### Investigation

- Confirm the correct directory.
- Inspect `Server/package.json`.
- Verify Node.js compatibility.
- Check environment validation.
- Check configured port.
- Check MongoDB availability.
- Review safe startup logs.

### Important

A local backend previously using port `5000` does not mean the production host must use that same port.

Always respect the actual configured runtime environment.

---

## 14. Express API Errors

### Typical Categories

| HTTP status | Common interpretation |
|---|---|
| 400 | Invalid request |
| 401 | Authentication required or invalid |
| 403 | Action forbidden |
| 404 | Resource not found |
| 409 | Business or concurrency conflict |
| 422 | Semantically invalid request, if the accepted contract uses it |
| 429 | Rate limit exceeded |
| 500 | Unexpected server failure |
| 503 | Required service unavailable |

The final error codes and response envelope must match the approved API contract.

### Debugging Rules

- Do not return internal stack traces to ordinary clients.
- Correlate request IDs where available.
- Separate business-validation errors from infrastructure failures.
- Avoid catching and silently ignoring database errors.
- Do not change HTTP status meanings to hide a security failure.

---

## 15. Authentication Debugging

### Symptoms

- Valid user cannot log in.
- Session expires unexpectedly.
- Login works locally but fails when hosted.
- Logout does not revoke access.
- Disabled user can still use an old session.

### Checks

1. Account status.
2. Credential verification.
3. Session creation.
4. Session store availability.
5. Cookie settings.
6. HTTPS.
7. CORS and credentialed requests.
8. CSRF protection.
9. Session expiration.
10. Revocation behavior.

### Security Rule

Do not log or print plaintext credentials, session tokens or secret keys.

Mock frontend authentication and production backend authentication must be treated as different security environments.

---

## 16. CORS, CSRF and Cookie Debugging

### Common Symptoms

- Browser blocks an API request.
- Authentication cookie is not sent.
- Login appears successful but subsequent requests return 401.
- Protected mutations fail CSRF validation.

### Checks

- Actual frontend origin.
- Actual backend origin.
- HTTPS configuration.
- Allowed CORS origins.
- Credentialed request setting.
- Cookie Secure and SameSite attributes.
- Cookie domain and path.
- Trusted proxy configuration.
- CSRF token or approved mitigation.

### Important

CORS is not an authorization mechanism.

Do not permanently use wildcard credentialed CORS or disable CSRF protection as a workaround.

---

## 17. Role-Based Authorization Debugging

TSA Academy ERP has exactly five current roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Investigation

For an unexpected access result:

1. Identify the authenticated account.
2. Identify the active authorized branch.
3. Resolve the effective role.
4. Check the requested action.
5. Verify the permission registry.
6. Verify record ownership.
7. Check business restrictions.
8. Review the actual frontend and backend contract.

### Receptionist

Receptionist must have Full approved Admissions and Fees access.

Independent Finance, Expenses, Payroll, Audit Log, Branches, Users and Settings access remains denied.

### Teacher

Teacher can view own My Profile, assignments, timetable, salary agreements, payments, outstanding balances and payslips.

Access to other teachers' compensation must be denied.

### Protected Accounts

Admin cannot perform unauthorized privilege escalation or modifications to protected privileged accounts.

---

## 18. Branch Isolation Debugging

A user may have different roles in different branches.

### Example

```text
User A
  |
  +-- Branch 1: Teacher
  |
  +-- Branch 2: Receptionist
```

### Symptoms

- Wrong branch records appear.
- Permission unexpectedly changes.
- User cannot open an assigned branch.
- Data appears after role revocation.
- Cross-branch report returns too many records.

### Checks

- Authentication session.
- Active branch.
- Stored branch memberships.
- Current role per branch.
- Repository filters.
- Target-record branch ID.
- Frontend cache keys.
- Outstanding asynchronous requests.

### Critical Rules

- Do not trust browser-supplied branch IDs without server authorization.
- Same-branch unsupported multiple-role combinations fail closed.
- New branch creation remains paused for every role.
- Cross-branch reporting and cross-branch mutation require distinct permissions.

---

## 19. MongoDB Connection Debugging

### Symptoms

- Connection refused.
- Connection timeout.
- Authentication failure.
- Database unavailable.
- Unexpected database selection.

### Checks

1. MongoDB service or hosting availability.
2. Environment variable presence.
3. URI format.
4. Database credentials.
5. Network access.
6. TLS configuration.
7. Selected database name.
8. Database user privileges.
9. Connection pool and timeout settings.

### Restrictions

- Never print a credential-bearing MongoDB URI.
- Never switch to production credentials just to test connectivity.
- Never delete databases or collections during routine diagnosis.

### Readiness

The backend must not report readiness for database-dependent operations when its required MongoDB dependency is unavailable.

---

## 20. Mongoose Validation and Query Debugging

### Common Issues

- Required field missing.
- Invalid ObjectId.
- Duplicate key.
- Broken reference.
- Incorrect schema type.
- Query missing branch scope.
- Unexpected populated documents.
- Slow query.

### Investigation

- Inspect schema validation.
- Confirm request DTO mapping.
- Check normalized identifiers.
- Check compound unique indexes.
- Verify reference ownership.
- Inspect query projections.
- Review required populate operations.
- Use safe query profiling where needed.

### Important

A database record existing does not prove the current user is allowed to access it.

Repository queries must enforce applicable authorization and scope.

---

## 21. Admission Debugging

### Approved Workflow

The current frontend uses Pending and Approved admission states, including a permitted return to Pending.

The older Reject workflow is superseded.

### Typical Problems

- Admission cannot be approved.
- Wrong status shown.
- Student not linked.
- Enrollment fails after approval.
- Admission delete unexpectedly succeeds or fails.
- Duplicate admission created.

### Investigation

1. Verify current Admission state.
2. Verify required applicant fields.
3. Check Student relationship.
4. Check Course/Batch references.
5. Verify branch ownership.
6. Inspect transition rules.
7. Check enrollment dependencies.
8. Check idempotency behavior.

Do not restore the superseded Reject workflow without approval.

---

## 22. Enrollment and Capacity Debugging

### Symptoms

- Student enrolled twice.
- Batch capacity exceeded.
- Enrollment points to wrong course.
- Admission completion partially succeeds.
- Challan missing after enrollment.

### Required Checks

- Student ID.
- Admission ID.
- Course ID.
- Batch ID.
- Enrollment uniqueness.
- Batch capacity.
- Concurrent requests.
- Transaction result.
- Related challan creation.

### Concurrency

A successful sequential unit test does not prove the system prevents simultaneous last-seat enrollment.

Use an isolated integration test against the actual persistence layer.

---

## 23. Instant Admission Debugging

An approved instant admission may coordinate:

- Student creation.
- Admission creation.
- Enrollment.
- Challan.
- Optional verified fee payment.

### Common Failures

- Duplicate Student.
- Admission created without expected Enrollment.
- Enrollment created without expected Challan.
- Payment recorded against wrong Challan.
- Retry creates duplicate linked records.

### Investigation

1. Identify the original request and idempotency reference where available.
2. Check transaction status.
3. Inspect each related record.
4. Confirm correct branch.
5. Verify actual committed state.
6. Identify missing/duplicate references.
7. Apply a separately approved repair if necessary.

Do not create additional records blindly to complete a failed-looking request.

---

## 24. Challan Debugging

### Symptoms

- Wrong payable amount.
- Duplicate challan.
- Missing enrollment reference.
- Incorrect student ledger.
- Unexpected outstanding amount.

### Checks

- Correct Student and Enrollment.
- Course/Subject fee configuration.
- Approved calculation source.
- One-challan-per-enrollment behavior.
- Verified payment history.
- Branch ownership.
- Existing record uniqueness constraints.

### Important

Do not invent monthly challan generation or unsupported invoice policies.

---

## 25. Fee Payment Debugging

Fee collection is a financially sensitive operation.

### Typical Problems

- Payment appears twice.
- Payment not reflected in outstanding.
- Unverified payment counted as revenue.
- Overpayment accepted.
- Receipt mismatch.
- API timeout after payment request.

### Investigation Procedure

1. Confirm authoritative Challan.
2. Retrieve valid payment history.
3. Check verification status.
4. Check the transaction amount.
5. Check idempotency reference.
6. Check database commit result.
7. Recalculate outstanding using approved rules.
8. Compare Finance/Reports projections.
9. Verify frontend cache invalidation.

### Reconciliation Concept

```text
Approved Challan Payable
          -
Valid Applied Verified Payments
          =
Outstanding Fee Balance
```

The exact formula must respect the approved domain contract.

### Critical

Do not retry a possibly committed payment blindly.

Resolve uncertain transaction status before issuing a new financial write.

---

## 26. Teacher Payroll Debugging

**CONFIRMED BUSINESS MODEL:** Assignment-based running salary.

Teacher Payroll is not an automatic monthly salary system.

### Primary Records

- Teacher.
- Faculty Assignment.
- Salary Agreement.
- Running Payroll Obligation.
- Salary Payment.
- Linked Posted Expense.

### Common Issues

- Incorrect Fixed salary amount.
- Incorrect Percentage calculation.
- Duplicate payable obligation.
- Outstanding balance does not decrease.
- Old outstanding amount disappears.
- New assignment overwrites old agreement.
- Salary payment posted twice.
- Expense missing.
- Teacher My Profile shows incorrect values.

### Required Investigation

1. Identify the specific Teacher.
2. Identify the specific Faculty Assignment.
3. Identify the Salary Agreement version.
4. Verify Fixed/Percentage calculation.
5. Check committed valid Salary Payments.
6. Verify linked Posted Expenses.
7. Recalculate outstanding.
8. Compare administrative Payroll.
9. Compare Teacher My Profile.
10. Verify permission and branch scope.

### Formula Source Verification

Inspect the actual relevant frontend implementation and tests before changing backend calculations.

Candidate paths include:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Verify those paths exist and identify the actual authoritative calculation functions.

---

## 27. Payroll Running Balance Debugging

### Conceptual Relationship

```text
Approved Assignment Payable
            -
Valid Applied Salary Payments
            =
Outstanding Running Balance
```

### Example Investigation

If the displayed outstanding differs from the expected amount:

- Verify the original approved payable.
- Check whether the agreement was revised.
- Inspect historical payment records.
- Check whether a payment was duplicated.
- Check whether the wrong assignment was selected.
- Check payment status.
- Check monetary rounding.
- Check report projection logic.

### Prohibited Fixes

- Resetting old balances.
- Generating monthly obligations.
- Deleting valid payments.
- Increasing payable amount without approval.
- Merging unrelated assignments.
- Modifying payment history to match the displayed UI.

---

## 28. Payroll and Expense Reconciliation

Each applicable successful salary disbursement must correspond to one correct posted expense.

### Symptoms

- Salary Payment exists but Expense is missing.
- Expense exists without valid Salary Payment.
- Two expenses for one payment.
- Expense uses incorrect branch.
- Amount mismatch.
- Finance expense total is incorrect.

### Investigation

1. Identify the committed Salary Payment.
2. Verify the linked Expense reference.
3. Check transaction boundaries.
4. Check idempotency behavior.
5. Verify correct amount and branch.
6. Check Finance aggregation.
7. Check Reports aggregation.
8. Identify whether a repair is required.

### Critical Rule

Do not silently create or delete financial entries during debugging.

Any financial repair requires a separately approved, auditable correction procedure.

---

## 29. Teacher My Profile Debugging

### Route

`/my-profile`

### Existing Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Symptoms

- Teacher cannot access their own profile.
- Timetable is missing.
- Assignments are incorrect.
- Salary balance differs from Payroll.
- Payment history is incomplete.
- Payslip fails.
- Another Teacher's salary becomes accessible.

### Debugging Order

- Authenticate the Teacher.
- Identify the staff/Teacher relationship.
- Verify active branch.
- Check assignment ownership.
- Verify salary agreement references.
- Check committed payment history.
- Inspect profile service/API mapping.
- Verify cache invalidation.
- Test unauthorized access to another Teacher's records.

### Security

Any confirmed unauthorized disclosure of another Teacher's compensation must be treated as a security incident, not only a presentation bug.

---

## 30. Finance Overview Debugging

### Possible Symptoms

- Revenue too high.
- Expense totals too high.
- Payroll expense counted twice.
- Net figure incorrect.
- Wrong branch financial data.
- Dashboard and Finance disagree.

### Checks

- Verified Fee Payments.
- Applicable Posted Expenses.
- Payroll-linked expense records.
- Reporting date filters.
- Branch scope.
- Aggregation joins.
- Duplicate counting.
- Cache freshness.

### Required Principle

Financial summaries must derive from authoritative source records.

Do not alter source transactions merely to correct a dashboard projection.

---

## 31. Reports and Ledger Debugging

### Common Issues

- Incorrect count.
- Missing records.
- Wrong sorting.
- Inconsistent branch totals.
- Export differs from screen.
- Sensitive fields exposed.
- Payroll outstanding disagrees with Teacher Profile.

### Investigation

1. Identify report parameters.
2. Confirm user permission.
3. Confirm branch scope.
4. Inspect query filters.
5. Review aggregation and joins.
6. Check duplicate counting.
7. Compare source records.
8. Inspect export mapping.
9. Verify date/time handling.

### Privacy Rule

Exports must enforce the same or stricter authorization as the underlying data reads.

---

## 32. Demo Classes Debugging

### Symptoms

- Inquiry not saved.
- Attendance state incorrect.
- Conversion fails.
- Duplicate admission created.
- Wrong student details prefilled.

### Checks

- Approved inquiry state.
- Existing conversion reference.
- Branch ownership.
- Admission prefill behavior.
- Submission confirmation.
- Idempotency/duplicate checks.

Do not create new enrollments or payments automatically unless that behavior is part of the approved conversion workflow.

---

## 33. Physical Assets Debugging

Assets are physical inventory records.

### Symptoms

- Asset assignment incorrect.
- Inspection history missing.
- Duplicate asset code.
- Maintenance event not saved.
- Wrong branch inventory count.

### Checks

- Asset identity.
- Branch ownership.
- Assigned staff.
- Asset status/condition.
- Event history.
- Relevant uniqueness rules.
- Authorized action permissions.

### Restriction

Do not introduce Cloudinary, digital media storage or automatic maintenance expenses as a debugging shortcut.

---

## 34. Stale Cache and Refresh Problems

### Symptoms

- Payment succeeds but balance is old.
- Branch switch shows previous branch data.
- Teacher Profile does not update after disbursement.
- Dashboard remains stale.
- Report totals update only after page reload.

### Investigation

- Query/cache keys.
- Mutation success status.
- Invalidation rules.
- Request ordering.
- Branch context.
- Data source.
- Derived selectors.
- Backend cache behavior, if any.

### Important

Caches must never become authoritative sources for accepting payment writes.

After a financial mutation, the backend must remain the source of truth.

---

## 35. Concurrency Debugging

Concurrency problems arise when several operations access or modify related records simultaneously.

### High-Risk Scenarios

- Two users enroll the last available batch seat.
- Two staff members collect fees against one outstanding balance.
- Two administrators disburse salary from one obligation.
- Multiple updates modify the same salary agreement.
- Role/branch membership changes during an active session.

### Investigation

- Reproduce against isolated test data.
- Capture safe request correlation.
- Inspect concurrent database operations.
- Verify transaction boundaries.
- Check conditional updates.
- Review unique constraints.
- Review idempotency behavior.
- Inspect actual committed results.

### Critical

Do not conclude concurrency is safe based only on sequential manual tests.

---

## 36. MongoDB Transaction Debugging

### Symptoms

- Required related record missing.
- Transaction aborts.
- Write conflict.
- Unknown commit result.
- Retry duplicates a business operation.

### Checks

- Transaction-capable MongoDB deployment.
- Session creation and cleanup.
- All related writes using the intended session.
- Correct transaction scope.
- Conditional updates and uniqueness constraints.
- Safe retry handling.
- Idempotency key lifecycle.

### Financial Transactions

Salary Payment and matching Posted Expense must remain consistent.

An uncertain transaction result must be resolved before repeating the financial operation.

---

## 37. Date, Time and Timezone Debugging

The system may record:

- Admissions dates.
- Enrollment dates.
- Payment dates.
- Salary payment timestamps.
- Class schedules.
- Audit timestamps.

### Potential Issues

- One-day date shifts.
- Incorrect report date ranges.
- Unexpected timezone conversion.
- Invalid date parsing.
- Inconsistent display formatting.

### Guidelines

- Store event timestamps consistently.
- Apply explicit timezone interpretation.
- Distinguish calendar dates from exact timestamps.
- Use approved academy-local display rules.
- Avoid ambiguous string parsing.
- Verify date-boundary report behavior.

The final backend date/time contract must be agreed in the API/database specifications.

---

## 38. Financial Precision Debugging

Financial differences can arise from:

- Floating-point arithmetic.
- Incorrect rounding.
- Percentage calculation mismatch.
- Multiple calculation sources.
- Aggregation errors.
- Payment verification differences.

### Investigation

- Confirm authoritative stored values.
- Confirm the approved monetary representation.
- Trace the exact formula.
- Compare frontend and backend calculations.
- Inspect rounding stage.
- Test partial payments and remaining balances.

### Restriction

Do not use arbitrary rounding to hide a mismatch.

Fix the underlying approved calculation or data inconsistency.

---

## 39. Performance Debugging

### Symptoms

- Slow Student list.
- Slow Admissions search.
- Long financial report.
- Payroll history request times out.
- High MongoDB query count.
- Memory growth.

### Investigation

1. Measure the actual request.
2. Identify the slow layer.
3. Inspect query filters.
4. Check indexes.
5. Check projections/population.
6. Identify repeated queries.
7. Review pagination.
8. Inspect aggregation pipelines.
9. Compare results before and after changes.

### Rule

Do not add Redis or rewrite the application architecture without evidence that simpler optimizations are insufficient.

Correctness and authorization must remain intact.

---

## 40. Deployment Debugging

### Frontend Deployment Issues

- Build fails.
- Static assets missing.
- Direct React route returns 404.
- Wrong API URL.
- Incorrect environment variables.

### Backend Deployment Issues

- Wrong start command.
- Missing required environment variable.
- Database cannot connect.
- Hosting-assigned port ignored.
- Incorrect trusted-proxy configuration.
- Health/readiness failure.

### Cross-Origin Issues

- CORS.
- Cookies.
- HTTPS.
- CSRF.
- Session store.

### Important

A successful frontend deployment does not prove the Express backend or MongoDB is operational.

---

## 41. Logging and Request Correlation

Use safe structured logs to investigate failures.

### Useful Metadata

- Timestamp.
- Request ID.
- Environment.
- Module.
- Route.
- HTTP status.
- Safe error code.
- Duration.
- Relevant restricted internal identifiers.

### Never Log

- Plaintext passwords.
- Session cookies.
- Database credentials.
- Full confidential student records.
- Unnecessary salary details.
- Private authentication tokens.

Business Audit Logs and temporary application diagnostic logs are different records with different purposes.

---

## 42. Security Incident Debugging

### Examples

- Teacher retrieves another Teacher's payslip.
- Receptionist opens administrative Payroll.
- Admin grants unauthorized Super Admin role.
- Staff member accesses unassigned branch data.
- Confidential export returned without permission.

### Immediate Priorities

1. Confirm the exposure.
2. Preserve evidence.
3. Stop further unauthorized access.
4. Assess affected accounts/records.
5. Identify the authorization failure.
6. Apply an approved fix.
7. Run security regression tests.
8. Record the incident and remaining obligations.

Do not disclose confidential data while documenting the incident.

---

## 43. Safe Debugging in Production

Production investigation requires additional safeguards.

### Allowed Diagnostic Direction

- Read appropriate safe logs.
- Inspect authorized health information.
- Examine sanitized error metadata.
- Use approved read-only database diagnostics.
- Reproduce with fictional data in a safe environment.

### Actions Requiring Separate Approval

- Production database updates.
- Manual payment corrections.
- Account privilege changes.
- Database restoration.
- Secret rotation.
- Destructive migrations.
- Deployment rollback.
- Disabling a protected feature.

### Critical Rule

Never run a destructive command against production merely to reproduce a bug.

---

## 44. Root Cause Analysis

A useful root cause analysis should identify:

- Trigger.
- Affected workflow.
- Actual failure mechanism.
- Why existing validation or tests did not prevent it.
- Affected data.
- Security or financial impact.
- Corrective action.
- Regression prevention.

### Avoid

- Guessing without evidence.
- Blaming unrelated components.
- Treating a workaround as a root-cause fix.
- Rewriting broad portions of the system without need.

---

## 45. Debugging Test Strategy

Once a cause is identified, add or update focused tests where appropriate.

### Test Types

- Unit tests for domain logic.
- API contract tests.
- Database integration tests.
- RBAC and branch isolation tests.
- Financial reconciliation tests.
- Concurrency tests.
- Frontend regression tests.

### Required Behavior

A regression test should fail for the original defect and pass after the correct fix, when feasible.

### Reporting

State:

- Tests written.
- Tests executed.
- Results.
- Tests not executed.
- Remaining risk.

Do not claim success based only on a visual inspection or unexecuted test.

---

## 46. Fix Verification Checklist

- [ ] Original issue reproduced or adequately evidenced.
- [ ] Root cause identified.
- [ ] Approved scope confirmed.
- [ ] Relevant files inspected.
- [ ] Minimal correction implemented.
- [ ] Business rules preserved.
- [ ] Authentication/authorization preserved.
- [ ] Branch isolation verified where relevant.
- [ ] Financial records remain consistent.
- [ ] Relevant tests executed.
- [ ] Connected modules checked.
- [ ] No unnecessary changes introduced.
- [ ] Git diff reviewed.
- [ ] Remaining limitations documented.

Unchecked items are pending verification.

---

## 47. Debugging Completion Report

After a separately authorized fix, report in concise Roman Urdu.

### Recommended Structure

**Issue:** Short description.

**Root Cause:** Verified technical reason, or clearly identified uncertainty.

**Changed Files:** Actual paths.

**Fix:** What was corrected.

**Tests:** Tests actually executed and results.

**Remaining:** Open risks or limitations.

**Git Status:** Relevant current repository state.

### Important

Do not state that a fix is deployed or owner accepted unless the corresponding action actually occurred.

---

## 48. Escalation Conditions

Stop speculative debugging and escalate the decision when:

- A business rule is genuinely unresolved.
- Repair would alter verified financial history.
- A schema migration is required.
- Production credentials may be compromised.
- Unauthorized salary/student data exposure occurred.
- A destructive recovery operation is needed.
- Multiple inconsistent sources cannot be reconciled.
- The approved ticket does not authorize the required change.

Escalation should identify the precise blocker and the decision required.

---

## 49. Common Debugging Anti-Patterns

Avoid:

- Clearing localStorage without permission.
- Deleting MongoDB collections to fix bad data.
- Disabling authentication middleware.
- Bypassing branch filters.
- Returning confidential data for easier debugging.
- Automatically retrying uncertain financial transactions.
- Hardcoding salary values.
- Creating automatic monthly payroll.
- Editing expense records to force Finance totals.
- Adding unnecessary dependencies.
- Resetting unrelated Git changes.
- Claiming a fix works without verification.
- Replacing a working frontend service with an unrelated abstraction.

---

## 50. Debugging Documentation Updates

When an issue is resolved through an approved development ticket, update relevant records.

### `PROGRESS.md`

Record actual changed files, behavior and test results.

### `TASKS.md`

Update ticket status and remaining work.

### `MEMORY.md`

Record lasting owner-approved decisions, not temporary debugging guesses.

### `BACKEND_GAPS_AND_RISKS.md`

Update unresolved architectural, security or financial risks.

### Specifications

Only modify business or API specifications when the owner has approved a change or an actual implementation discrepancy has been formally resolved.

---

## 51. Related Documentation

This document must remain aligned with:

- `AGENTS.md` — Agent instructions.
- `RULES.md` — Engineering boundaries.
- `ARCHITECTURE.md` — Architecture.
- `SYSTEM_DESIGN.md` — Business workflows.
- `BUSINESS_RULES.md` — Domain invariants.
- `SECURITY.md` — Security rules.
- `AUTHENTICATION_AND_SECURITY.md` — Sessions and authorization.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Scope enforcement.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Schema changes and data repair.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — Request/response contracts.
- `DATA_FLOW.md` — Cross-module dependencies.
- `TRANSACTIONS_AND_INTEGRITY.md` — Transaction safety.
- `CACHING_AND_PERFORMANCE.md` — Cache and query behavior.
- `BACKEND_TESTING_STRATEGY.md` — Testing requirements.
- `LOGGING_AND_MONITORING.md` — Operational telemetry.
- `BACKUP_AND_RECOVERY.md` — Recovery procedures.
- `DEPLOYMENT.md` — Hosting and release.
- `ENVIRONMENT_CONFIG.md` — Configuration.
- `FRONTEND_INTEGRATION.md` — Frontend/backend mapping.
- `BACKEND_GAPS_AND_RISKS.md` — Open risks.
- `TASKS.md` — Task tracking.
- `PROGRESS.md` — Verified history.

Use actual repository paths for relative Markdown links.

---

## 52. Final Implementation Boundary

### Confirmed Business Requirements

- Five frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Current branch creation pause.
- Financial history preservation.
- Physical Assets without media upload requirements.

### Proposed Debugging Procedures

- Structured fault investigation.
- Frontend/backend contract tracing.
- Authentication and scope diagnosis.
- MongoDB integrity checks.
- Financial reconciliation investigation.
- Safe concurrency testing.
- Controlled incident handling.
- Regression verification.

### Deferred

- Multi-client SaaS debugging infrastructure.
- Enterprise distributed tracing.
- Electron/offline synchronization investigation.
- Cloudinary/media pipeline troubleshooting.
- Unsupported financial reversal systems.

### Not Implemented by This Document

- Source-code fixes.
- Database repairs.
- Authentication changes.
- Monitoring services.
- Production deployments.
- Operational incident responses.

**Governing Principle:** Debugging TSA Academy ERP must produce evidence-based fixes while preserving the existing frontend behavior, backend security boundaries, academic relationships, branch isolation and authoritative financial records.

**Document Status:** DRAFT — Ready for development and operations use after repository-specific verification.
