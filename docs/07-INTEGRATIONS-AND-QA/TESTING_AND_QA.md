# TESTING_AND_QA

<!-- > Purpose:Is document mein TSA Academy ERP ke 16 modules ki functional testing, five-role permissions, multi-branch isolation, MongoDB integration, financial transactions, Teacher Payroll, frontend regression, security testing aur client acceptance ki complete instructions hain. -->


# TSA Academy ERP — Testing, Quality Assurance & Acceptance Specification

**Document:** TESTING_AND_QA.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — QA Specification; Test Results Not Yet Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Product:** One Academy Organization with Multiple Branches
**Category:** Integrations & Quality Assurance

---

## 1. Purpose

This document defines the complete testing and quality assurance framework for TSA Academy ERP.

Its purpose is to ensure that new features, backend integration, bug fixes, database changes and deployments preserve the approved application behavior while protecting academic records, staff permissions and financial integrity.

Testing must verify:

- Frontend functionality.
- Backend functionality.
- REST API contracts.
- MongoDB persistence.
- Authentication and sessions.
- Role-based access control.
- Academy and branch isolation.
- Student Admissions and Enrollment.
- Academic reference data.
- Student Fees and Challans.
- Finance and Expenses.
- Assignment-based Teacher Payroll.
- Teacher My Profile.
- Demo Classes.
- Physical Assets.
- Reports and Ledgers.
- Audit Log.
- Users and Settings.
- Printing and exports.
- Concurrency and idempotency.
- Deployment readiness.
- Client acceptance.

**Important:** This document establishes testing requirements. It does not claim that tests have been executed or that the backend has been completed.

---

## 2. Quality Assurance Principles

### QA-001 — Approved Behavior Is Authoritative

Tests must verify the latest owner-approved business behavior.

### QA-002 — Inspect Actual Source

Before creating final test assertions, inspect current implementation and relevant existing tests.

### QA-003 — Security Is Mandatory

Every protected operation requires permitted-access and denied-access scenarios.

### QA-004 — Branch Isolation

Users must not access unauthorized branch records.

### QA-005 — Financial Accuracy

Verified Fees, salary payments, running balances and posted Expenses must reconcile.

### QA-006 — No Duplicate Business Effects

Retries and concurrency must not create unintended duplicate academic or financial records.

### QA-007 — Deterministic Testing

Tests should use controlled fixtures, dates and independent environments.

### QA-008 — Regression Protection

Changes must not break previously approved behavior.

### QA-009 — Evidence-Based Reporting

Only actually executed successful tests may be marked PASSED.

### QA-010 — No Unauthorized Functionality

Do not build or require features outside approved project scope.

---

## 3. QA Status Definitions

| Status | Meaning |
|---|---|
| NOT_STARTED | Testing has not begun |
| PLANNED | Test scenarios identified |
| WRITTEN | Automated test exists |
| IN_PROGRESS | Test execution underway |
| PASSED | Executed successfully |
| FAILED | Executed unsuccessfully |
| BLOCKED | Required dependency unavailable |
| SKIPPED | Intentionally not run with documented reason |
| NOT_APPLICABLE | Scenario outside the applicable approved scope |
| IN_REVIEW | Awaiting technical review |
| OWNER_ACCEPTED | Explicitly accepted by owner |

A documented test scenario is not evidence of successful execution.

A successful frontend build is not proof that financial transactions work correctly.

---

## 4. Testing Layers

### 4.1 Unit Testing

Verify isolated calculations, validators, permission helpers and state-transition functions.

### 4.2 React Component Testing

Verify the behavior of relevant forms, tables, dialogs, buttons and routes.

### 4.3 Frontend Service Testing

Verify domain services, mock adapters and HTTP adapters.

### 4.4 API Testing

Verify methods, paths, request validation, response contracts and error handling.

### 4.5 MongoDB Integration Testing

Verify models, references, indexes, repositories and transaction behavior.

### 4.6 End-to-End Testing

Verify selected business flows through the frontend, backend and database.

### 4.7 Security Testing

Verify authentication, authorization, branch scope and record ownership.

### 4.8 Regression Testing

Verify that changes do not break connected existing features.

### 4.9 Performance Testing

Measure relevant response and database behavior.

### 4.10 User Acceptance Testing

Verify the application against the owner's approved business requirements.

---

## 5. Test Technology Policy

The existing frontend has used Vitest.

The backend test framework must be selected after inspecting the repository.

### Requirements

- Reuse suitable existing tooling.
- Avoid introducing overlapping test frameworks.
- Follow actual package scripts.
- Use isolated test data.
- Support real MongoDB transaction tests.
- Keep the test suite reproducible.
- Do not use production credentials in automated tests.

### Possible Tools

Depending on approved requirements:

- Vitest.
- An HTTP API testing utility.
- MongoDB integration fixtures.
- A browser end-to-end testing framework.

The final libraries are TBD.

Do not install a framework merely because it is mentioned here.

---

## 6. Test Environment Strategy

| Environment | Purpose |
|---|---|
| Frontend Development | React and mock-service verification |
| Backend Development | Domain and API testing |
| Automated Test Environment | Repeatable isolated tests |
| Staging | Full integration and release verification |
| Production | Controlled non-destructive smoke checks |

### Environment Safety

1. Verify database connections before tests.
2. Never reset production records through automated fixtures.
3. Use fictional student and staff information.
4. Keep credentials out of committed source.
5. Preserve staging/client demonstration data unless cleanup is authorized.
6. Separate testing sessions from production sessions.
7. Run transaction tests on a transaction-capable MongoDB deployment.

---

## 7. Test Data Requirements

Prepare representative fictional fixtures.

### Academy

- One organization.
- Branch 1.
- Branch 2.
- Authorized multi-branch user.
- Unauthorized branch-access case.

### Users

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher A.
- Teacher B.
- Disabled account.

### Academics

- Course.
- Subject.
- Stream where applicable.
- Batch with capacity.
- Full Batch.
- Student.
- Pending Admission.
- Approved Admission.
- Enrollment.
- Faculty Assignment.

### Finance

- Unpaid Challan.
- Partially paid Challan.
- Fully paid Challan.
- Verified Fee Payment.
- Unverified Payment where supported.
- Operating Expense.
- Salary Agreement.
- Running Salary Obligation.
- Partial Salary Payment.
- Posted Payroll Expense.

### Operations

- Demo inquiry.
- Converted Demo inquiry.
- Physical Asset.
- Audit event.
- Academy branding settings.

Actual fixture schemas must match verified implementation.

---

# PART A — AUTHENTICATION, RBAC AND BRANCH SECURITY

## 8. Authentication Tests

| ID | Scenario | Expected result |
|---|---|---|
| AUTH-001 | Valid login | Authenticated session |
| AUTH-002 | Invalid password | Denied |
| AUTH-003 | Unknown or disabled account | Denied |
| AUTH-004 | Protected API without session | Denied |
| AUTH-005 | Expired session | Denied |
| AUTH-006 | Logout | Session invalidated |
| AUTH-007 | Revoked session reuse | Denied |
| AUTH-008 | Browser refresh | Session restored only if valid |
| AUTH-009 | Account switch | Previous confidential state removed |
| AUTH-010 | Password change | Approved credential and session rules applied |

### Additional Security

Test:

- Secure cookie settings.
- CSRF mitigation.
- CORS restrictions.
- Rate limiting.
- Session expiration.
- Account revocation.

Exact assertions depend on the approved authentication architecture.

---

## 9. Five-Role Authorization Tests

The system supports:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Required Verification

- Each role sees only authorized modules.
- Protected API routes enforce permissions.
- Unknown roles fail closed.
- Unauthorized direct requests are rejected.
- Role changes update effective access.
- Record ownership is enforced.

### Super Admin

Verify approved administrative actions while maintaining business restrictions.

### Admin

Verify protected-account and role-escalation restrictions.

### Receptionist

**Confirmed:** Full approved Admissions and Fees access.

Explicitly deny independent:

- Finance.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branches.
- Users.
- Settings.

### Owner

Test the verified action-level management and financial permissions.

Do not infer unlimited privileges.

### Teacher

Verify only authorized self-service and teaching operations.

---

## 10. Teacher Self-Service Security Tests

### Route

`/my-profile`

### Required Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

| ID | Scenario | Expected result |
|---|---|---|
| TSELF-001 | Teacher reads own profile | Allowed |
| TSELF-002 | Teacher reads own timetable | Allowed |
| TSELF-003 | Teacher reads own assignments | Allowed |
| TSELF-004 | Teacher reads own salary agreement | Allowed |
| TSELF-005 | Teacher reads own paid/outstanding amounts | Allowed |
| TSELF-006 | Teacher reads own verified payments | Allowed |
| TSELF-007 | Teacher retrieves own payslip | Allowed |
| TSELF-008 | Teacher requests another Teacher's salary | Denied |
| TSELF-009 | Teacher requests another Teacher's payslip | Denied |
| TSELF-010 | Teacher opens administrative Payroll | Denied |
| TSELF-011 | Teacher attempts salary mutation | Denied |
| TSELF-012 | Teacher reads own salary notification | Allowed |

### Critical Security Rule

Backend self-service identity must come from the authenticated session.

Changing a request parameter must not reveal another Teacher's information.

---

## 11. Branch Isolation Tests

| ID | Scenario | Expected result |
|---|---|---|
| BR-001 | Assigned branch access | Allowed |
| BR-002 | Unassigned branch access | Denied |
| BR-003 | Branch switch | Role and data updated |
| BR-004 | Teacher in Branch 1, Receptionist in Branch 2 | Correct effective role |
| BR-005 | Unsupported same-branch multi-role combination | Fail closed |
| BR-006 | Cross-branch Student request | Denied where unauthorized |
| BR-007 | Cross-branch Challan request | Denied |
| BR-008 | Cross-branch Payroll request | Denied |
| BR-009 | Authorized all-branches report | Correct permitted scope |
| BR-010 | Branch membership revoked | Subsequent access denied |
| BR-011 | New branch creation by any role | Denied while paused |
| BR-012 | Delayed previous-branch response | Does not overwrite current branch state |

### Important

Frontend branch selection cannot bypass backend authorization.

---

# PART B — ACADEMIC MODULE TESTING

## 12. Dashboard Tests

Verify:

- Dashboard renders for authorized users.
- Correct active branch.
- Correct role-specific cards.
- Correct Student counts.
- Correct Admissions counts.
- Correct Batch occupancy.
- Correct verified collection totals.
- Correct applicable Expense totals.
- No unauthorized salary disclosure.
- Dependent summaries refresh after relevant changes.

Dashboard values must agree with authoritative domain records.

---

## 13. Admissions Tests

### Approved Status Model

- Pending.
- Approved.
- Permitted return to Pending.

The previous Reject workflow is superseded.

| ID | Scenario | Expected result |
|---|---|---|
| ADM-001 | Create valid Admission | Success |
| ADM-002 | Missing required fields | Rejected |
| ADM-003 | Edit allowed fields | Success |
| ADM-004 | Approve eligible Pending Admission | Approved |
| ADM-005 | Return eligible Approved Admission to Pending | Pending |
| ADM-006 | Invalid status transition | Rejected |
| ADM-007 | Link valid Student | Correct relationship |
| ADM-008 | Complete eligible Enrollment | Correct records |
| ADM-009 | Delete allowed Admission | Safeguards respected |
| ADM-010 | Delete protected linked Admission | Rejected |
| ADM-011 | Receptionist performs approved action | Allowed |
| ADM-012 | Unauthorized branch Admission | Denied |

Do not create required test cases for an unapproved new Reject status.

---

## 14. Students Tests

Verify:

- Authorized list.
- Search and filtering.
- Student detail.
- Approved creation/editing.
- Required field validation.
- Correct Admission association.
- Correct Enrollment association.
- Correct Branch ownership.
- Correct academic history.
- Protected deletion where related data exists.

Do not merge same-named students automatically.

Final student identity uniqueness rules require database/source verification.

---

## 15. Courses & Batches Tests

Verify:

- Courses list.
- Valid Course creation.
- Supported Subject and Stream relationships.
- Batch creation.
- Batch capacity validation.
- Course/Batch compatibility.
- Duplicate constraints.
- Authorized branch access.
- Academic history preservation.
- Guarded deletion of referenced records.

### Capacity Test

Simultaneously attempt two Enrollments when one seat remains.

The committed result must not exceed the approved capacity.

---

## 16. Faculty & Classes Tests

Verify:

- Faculty records load.
- Teacher assignments persist correctly.
- Correct Course/Batch/Subject relationships.
- Correct Branch ownership.
- Approved timetable behavior.
- Teacher self-only timetable visibility.
- Historical assignments remain available.
- Assignment changes do not silently corrupt Payroll.

The exact scheduling conflict rules must match current frontend behavior.

---

## 17. Enrollment Tests

| ID | Scenario | Expected result |
|---|---|---|
| ENR-001 | Valid eligible Enrollment | Success |
| ENR-002 | Invalid Admission state | Rejected |
| ENR-003 | Missing Student | Rejected |
| ENR-004 | Invalid Course/Batch relationship | Rejected |
| ENR-005 | Duplicate Enrollment | Prevented |
| ENR-006 | Full Batch | Capacity rule enforced |
| ENR-007 | Unauthorized Branch | Denied |
| ENR-008 | Related Challan required | Correctly linked |
| ENR-009 | Transaction failure | No unintended partial records |
| ENR-010 | Concurrent last-seat request | Capacity preserved |

### Instant Admission

Also verify the approved combined workflow involving Student, Admission, Enrollment, Challan and optional Verified Payment.

---

# PART C — FEES, PAYROLL AND FINANCE

## 18. Challan Tests

Verify:

- Valid Challan.
- Correct Student.
- Correct Enrollment.
- Correct Branch.
- Correct payable amount.
- Existing approved one-Challan-per-Enrollment behavior.
- No unintended duplicates.
- Correct ledger reference.
- Correct outstanding calculation.
- Safe protected record handling.

Do not introduce recurring monthly Challans without approval.

---

## 19. Fee Payment Tests

| ID | Scenario | Expected result |
|---|---|---|
| FEE-001 | Valid partial collection | Correct remaining balance |
| FEE-002 | Valid full collection | Correct settlement |
| FEE-003 | Invalid amount | Rejected |
| FEE-004 | Amount above outstanding | Rejected |
| FEE-005 | Duplicate request | No duplicate payment |
| FEE-006 | Repeated same amount with valid distinct payments | Correctly supported |
| FEE-007 | Unverified payment | Excluded from verified revenue |
| FEE-008 | Verified payment | Counted once |
| FEE-009 | Unauthorized Challan | Denied |
| FEE-010 | Receptionist collects Fees | Allowed |
| FEE-011 | Teacher attempts unauthorized collection | Denied |
| FEE-012 | Receipt generated | Matches authoritative payment |
| FEE-013 | Network timeout after request | Outcome checked before retry |
| FEE-014 | Concurrent payments | No unsupported overpayment |

### Reconciliation

```text
Approved Challan Payable
          -
Valid Applied Verified Payments
          =
Outstanding Fee Balance
```

The actual expected calculation must reflect the finalized monetary and verification rules.

---

## 20. Expenses Tests

Verify:

- Authorized expense creation.
- Valid amount.
- Required fields.
- Supported category.
- Correct Branch.
- Correct posting state.
- Historical Expense preservation.
- Payroll-linked expense uniqueness.
- Receptionist access denial.
- Teacher access denial.
- Owner permission consistency with verified frontend rules.

Unsupported reversal and deletion features must not be added solely for testing.

---

## 21. Teacher Payroll Tests

**Critical confirmed requirement:** Salary is assignment/batch/subject-based running remuneration.

There is **no automatic monthly salary generation**.

### Agreements

Verify:

- Fixed agreement.
- Percentage agreement.
- Correct Faculty Assignment.
- Correct Teacher.
- Correct Branch.
- Agreement revisions.
- Historical agreement preservation.

### Running Salary Obligations

| ID | Scenario | Expected result |
|---|---|---|
| PAY-001 | Valid assignment payable | Correct obligation |
| PAY-002 | Second assignment | Independent balance |
| PAY-003 | New calendar month | No automatic payable generated |
| PAY-004 | Partial payment | Outstanding reduced |
| PAY-005 | Full payment | Outstanding settled correctly |
| PAY-006 | Overpayment attempt | Rejected |
| PAY-007 | Duplicate request | No double payment |
| PAY-008 | Concurrent disbursements | No overpayment |
| PAY-009 | Ended assignment with unpaid balance | Balance preserved |
| PAY-010 | New agreement created | Old history preserved |
| PAY-011 | Salary payment committed | Required linked Posted Expense |
| PAY-012 | Salary payment fails | No orphaned Posted Expense |
| PAY-013 | Teacher reads own salary | Allowed |
| PAY-014 | Teacher reads another Teacher's salary | Denied |
| PAY-015 | Receptionist requests Payroll management | Denied |

### Formula Verification

Before asserting exact salary amounts, inspect the actual frontend calculation code and existing tests.

Potential relevant sources include:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Verify actual paths, Fixed/Percentage semantics and rounding.

---

## 22. Payroll-to-Expense Reconciliation

For every applicable successful salary disbursement:

1. A valid Salary Payment exists.
2. The correct obligation is referenced.
3. The amount is correct.
4. Exactly one required Posted Expense exists.
5. Payment and Expense reference each other appropriately.
6. The Branch is correct.
7. Finance counts the Expense once.
8. Teacher My Profile reflects the payment.
9. Outstanding balance is correct.

### Failure Tests

- Payment write succeeds but Expense write fails.
- Expense write succeeds but Payment write fails.
- Duplicate request.
- Write conflict.
- Timeout after uncertain commit.

### Acceptance

No unintended committed orphan or duplicate financial record.

---

## 23. Finance Overview Tests

Verify:

- Correct verified revenue.
- Unverified payments excluded.
- Correct operating Expenses.
- Payroll Expenses counted once.
- Correct net calculation.
- Correct date filtering.
- Correct Branch filtering.
- Authorized reporting scope.
- Dashboard and Reports consistency.

Finance must derive totals from authoritative records.

Do not alter payment history to make report totals match.

---

## 24. Financial Precision Tests

Test:

- Approved currency representation.
- Fixed remuneration.
- Percentage remuneration.
- Partial payments.
- Remaining balances.
- Rounding boundaries.
- Aggregated totals.
- Nonnegative payment rules.
- Concurrent payment validation.

### Important

Do not assume JavaScript floating-point arithmetic is sufficient for exact money handling.

Final representation and rounding must be approved before implementation.

---

# PART D — REMAINING MODULES

## 25. Demo Classes Tests

Verify:

- Valid inquiry creation.
- Required field validation.
- Existing approved attendance statuses.
- No-show behavior.
- Permitted cancellation.
- Admission prefill/conversion.
- No duplicate conversion.
- Correct Branch.
- No unintended Enrollment or payment.

---

## 26. Physical Assets Tests

The Assets module represents physical equipment inventory.

Verify:

- Valid Asset creation.
- Identifier uniqueness.
- Correct Branch ownership.
- Staff assignment.
- Inspection history.
- Maintenance history.
- Approved condition/status behavior.
- Correct inventory reporting.
- Access restrictions.

### Out of Scope

- Cloudinary.
- Digital media storage.
- Automatic depreciation.
- Unapproved asset disposal.
- Automatic maintenance expense posting.

---

## 27. Reports & Ledgers Tests

### Academic Reports

- Student counts.
- Admission status totals.
- Batch occupancy.
- Enrollment records.
- Faculty Assignments.
- Approved academic summaries.

### Financial Reports

- Challans.
- Verified collections.
- Outstanding Fees.
- Posted Expenses.
- Assignment Payables.
- Salary Payments.
- Outstanding Payroll.
- Net financial summaries.

### Security

Every report must enforce authorized role and branch scope.

Teacher salary confidentiality must be preserved in reports and exports.

---

## 28. Audit Log Tests

Verify:

- Sensitive committed actions generate required audit events.
- Actor identity is correct.
- Organization/Branch reference is correct.
- Resource identity is correct.
- Unauthorized Audit access is denied.
- Ordinary Audit editing is denied.
- Passwords and session secrets are absent.

Application diagnostic logs must not replace durable business Audit events.

---

## 29. Branches Tests

Verify:

- Authorized Branch list.
- Active Branch selection.
- Effective role switching.
- Authorized branch information.
- Existing permitted lifecycle actions.
- Protected access to other branches.

### Confirmed Restriction

New Branch creation remains paused for **all roles, including Super Admin**.

No successful create-branch test should be required while this rule is active.

---

## 30. Users Tests

Verify:

- Authorized staff list.
- Approved user creation.
- Role assignment.
- Different roles across branches.
- Account activation and deactivation.
- Protected-role restrictions.
- Admin privilege ceiling.
- Session revocation after relevant changes.
- Unsupported same-branch multiple-role combinations fail closed.
- Correct user identity across branches.

---

## 31. Settings and Branding Tests

Verify:

- Academy display name.
- Current supported theme configuration.
- Authorized branding changes.
- Correct Branch ownership.
- Safe default appearance.
- Consistent navigation branding.
- Print/export header behavior.
- Unauthorized Settings mutation denied.

Customization must not alter Fees, Payroll formulas or permissions.

---

## 32. Notifications Tests

Verify:

- Correct notification recipient.
- Appropriate event association.
- Teacher receives own salary notification where supported.
- Failed financial transaction produces no false payment-success notification.
- Notification duplication does not duplicate payments.
- Unauthorized cross-user access denied.

Notification delivery status must not be treated as proof that a financial transaction succeeded.

---

## 33. Printing and Export Tests

Verify actual supported formats in the frontend.

### Representative Documents

- Admission documents.
- Fee receipts.
- Student reports.
- Teacher payslips.
- Financial ledgers.

### Checks

- Correct source data.
- Correct totals.
- Correct Branch.
- Correct Academy branding.
- Correct permissions.
- Readable print layout.
- No unauthorized confidential fields.

Do not invent export formats that the existing frontend does not support.

---

# PART E — INTEGRATION AND REGRESSION

## 34. Frontend Mock-to-HTTP Migration Testing

### Existing Flow

```text
React Page
    |
    v
Domain Service
    |
    v
Mock Adapter
    |
    v
localStorage
```

### Target Flow

```text
React Page
    |
    v
Domain Service
    |
    v
HTTP Adapter
    |
    v
Express API
    |
    v
MongoDB
```

### Required Tests

- Existing service method compatibility.
- Request mapping.
- Response normalization.
- Correct identifiers.
- Date handling.
- Money handling.
- Authentication.
- Branch context.
- Loading states.
- Error states.
- Stale-request prevention.
- Dependent module refresh.

### Source-of-Truth Rule

Do not mix mock and MongoDB financial transactions without an explicit approved transition design.

---

## 35. Cross-Module Regression Matrix

| Mutation | Affected modules |
|---|---|
| Admission creation | Admissions, Students, Dashboard |
| Admission approval | Admissions, Enrollment eligibility |
| Enrollment | Students, Batches, Admissions, Fees |
| Challan creation | Fees, Student Ledger |
| Verified Fee Payment | Fees, Finance, Dashboard, Reports |
| Faculty Assignment | Faculty, Classes, Teacher Profile, Payroll |
| Salary Agreement | Payroll, Teacher Profile |
| Salary Payment | Payroll, Expenses, Finance, Reports, Teacher Profile, Notifications |
| Demo conversion | Demo Classes, Admissions |
| Asset update | Assets, Inventory Reports |
| Branch switch | Permissions, navigation, scoped modules |
| Role update | Users, effective permissions, sessions |
| Settings update | Academy and Theme Context |

### Rule

A successful mutation must update relevant dependent views.

A failed transaction must not create false success state.

---

## 36. API Contract Testing

Every implemented endpoint must be tested for:

- HTTP method.
- Route.
- Required headers.
- Request fields.
- Response envelope.
- Data type consistency.
- Validation errors.
- Authentication.
- Authorization.
- Branch scope.
- Record ownership.
- Idempotency where required.
- Pagination/filtering where applicable.

Final assertions must use the accepted API contracts, not speculative examples.

---

## 37. MongoDB Integrity Testing

Verify:

- Stable IDs.
- Correct entity references.
- Organization/Branch ownership.
- Unique constraints.
- Required fields.
- Valid state transitions.
- Safe deletion restrictions.
- Historical data preservation.
- Correct transaction behavior.

### Financial Records

Verify relationships among:

- Enrollment.
- Challan.
- Fee Payment.
- Faculty Assignment.
- Salary Agreement.
- Payroll Obligation.
- Salary Payment.
- Posted Expense.

---

## 38. Transaction Testing

Important workflows include:

- Instant Admission.
- Enrollment and Challan.
- Sensitive Fee Payment writes.
- Salary Payment and matching Posted Expense.
- Approved multi-record administrative changes.

### Test Conditions

1. Successful commit.
2. Validation failure.
3. Mid-operation failure.
4. Transaction abort.
5. Concurrent write conflict.
6. Retry handling.
7. Idempotent replay.
8. Uncertain commit result.

### Important

Use a transaction-capable MongoDB test environment.

Mocked unit tests alone cannot prove multi-document atomicity.

---

## 39. Concurrency Testing

Test simultaneous:

- Last-seat Enrollments.
- Fee Payments against limited outstanding.
- Salary Payments against limited payable.
- Salary Agreement revisions.
- Permission/Branch changes affecting sessions.

### Required Evidence

Inspect actual committed database records and final balances.

A valid HTTP success response by itself does not prove concurrency correctness.

---

## 40. Cache and State Regression

Test:

- Dashboard refresh.
- Updated Admission status.
- Batch occupancy.
- Fee outstanding.
- Finance summaries.
- Payroll running balances.
- Teacher My Profile.
- Branch switching.
- Role changes.
- Logout.

### Critical

Old branch data must not appear after switching branches.

Cached payment balances must not independently authorize financial writes.

---

# PART F — NON-FUNCTIONAL QA

## 41. Security Testing

### Authentication

- Credential handling.
- Secure sessions.
- Session expiry/revocation.
- CSRF.
- CORS.
- Rate limiting.

### Authorization

- Five roles.
- Protected Admin operations.
- Branch ownership.
- Teacher self-only records.
- Receptionist restrictions.
- Direct API access.

### Data Protection

- No password hashes in API responses.
- No session secrets in logs.
- No unauthorized financial exports.
- No unsafe MongoDB query input.
- No mass-assignment privilege escalation.

Critical access-control failures are release blockers.

---

## 42. Performance Testing

Candidate scenarios:

- Large Student directory.
- Admissions filtering.
- Batch capacity queries.
- Challan history.
- Finance reports.
- Teacher salary history.
- Branch switching.
- Concurrent authenticated users.

### Metrics

- API latency.
- Database query duration.
- Query volume.
- Memory use.
- Error rate.
- Transaction conflicts.

Final numerical targets require actual workload and hosting verification.

---

## 43. Responsive and Accessibility Testing

Verify approved pages remain usable across supported screen sizes.

### Checks

- Navigation.
- Tables.
- Dialogs.
- Forms.
- Keyboard focus.
- Color contrast.
- Status indications.
- Error messages.
- Print layouts.

Do not redesign existing screens without an approved request.

---

## 44. Browser Compatibility Testing

Test supported browsers according to actual client requirements.

### Important Areas

- React routing.
- Forms.
- Printing.
- Downloads.
- Authentication cookies.
- HTTPS.
- Branch switching.
- Error handling.

The final supported-browser matrix remains TBD.

---

## 45. Environment and Deployment Testing

Verify:

- Correct frontend build.
- Correct backend runtime.
- Correct API base URL.
- MongoDB connection.
- Health/readiness behavior.
- HTTPS.
- Secure cookie configuration.
- Approved CORS origins.
- CSRF mitigation.
- Protected environment secrets.

A frontend hosted successfully on Vercel does not prove backend integration has been completed.

---

## 46. Backup and Recovery QA

Verify the implemented recovery strategy through safe isolated testing.

### Checks

- Backup availability.
- Restore compatibility.
- Required record counts.
- Academic relationships.
- Fee reconciliation.
- Payroll reconciliation.
- User/Branch authorization.
- Financial records occurring after recovery point handled appropriately.

Do not conduct destructive recovery tests against production.

---

# PART G — TEST MANAGEMENT

## 47. Standard Test Case Format

Each formal test should record:

**Test ID:** Unique reference
**Module:** Feature tested
**Category:** Unit, API, Integration, Security, UI or E2E
**Priority:** Critical, High, Medium or Low
**Environment:** Test target
**Role:** Acting user
**Branch:** Effective scope
**Preconditions:** Required data/state
**Steps:** Reproducible operations
**Expected Result:** Approved behavior
**Actual Result:** Observed outcome
**Status:** Executed status
**Evidence:** Safe output/log reference
**Notes:** Limitations or dependencies

Do not populate Actual Result with an assumed successful outcome.

---

## 48. Defect Severity

| Severity | Definition | Example |
|---|---|---|
| Critical | Security exposure, serious financial error or data corruption | Other Teacher salary disclosed |
| High | Core approved workflow blocked | Verified Fee Payment cannot complete |
| Medium | Secondary behavior incorrect | Report filter wrong |
| Low | Cosmetic or minor usability defect | Spacing inconsistency |

Severity must reflect actual business impact.

---

## 49. Defect Lifecycle

```text
Reported
    |
    v
Triaged
    |
    v
Reproduced / Investigated
    |
    v
Fix Approved
    |
    v
Implemented
    |
    v
Retested
    |
    v
Regression Verified
    |
    v
Resolved / In Review
    |
    v
Owner Accepted, If Required
```

### Requirements

- Record root cause.
- Preserve safe evidence.
- Use minimal fixes.
- Test affected modules.
- Document unresolved issues.

---

## 50. Test Execution Workflow

1. Identify scope.
2. Review relevant requirements.
3. Inspect current source.
4. Prepare safe fixtures.
5. Execute targeted tests.
6. Record actual results.
7. Investigate failures.
8. Apply separately approved fixes.
9. Retest.
10. Run relevant regression coverage.
11. Review remaining risks.
12. Document completion accurately.

### Efficiency

Prefer targeted tests during development.

Expand testing when changes affect shared infrastructure or several modules.

---

## 51. Regression Scope by Change

| Change | Required related regression |
|---|---|
| UI-only component change | Component and affected page |
| Authentication | Login, sessions, roles, branch switching |
| Admission | Admissions, Students, Enrollment |
| Enrollment | Admissions, Students, Batches, Fees |
| Fee logic | Fees, Finance, Dashboard, Reports |
| Payroll logic | Payroll, Expenses, Finance, Teacher Profile |
| Role permissions | RBAC, affected modules, record access |
| Branch logic | All affected scoped modules |
| Database schema | Migration and relevant API/data relationships |
| API contract | Affected frontend service adapters |
| Settings | Branding, navigation and print output |
| Deployment | Startup, connectivity, smoke testing |

---

## 52. Continuous Integration Requirements

CI should run suitable checks based on the actual repository.

### Candidate Checks

- Dependency installation.
- Frontend tests.
- Backend unit tests.
- API tests.
- Database integration tests.
- Security tests.
- Build verification.

### Rules

- Use existing package scripts.
- Keep CI secrets secure.
- Use dedicated test data.
- Avoid production database access.
- Report actual workflow results.

An existing CI file does not establish a passing pipeline.

---

## 53. Release Quality Gates

Before a backend-integrated release:

### Functional Gate

Core approved workflows must pass relevant tests.

### Security Gate

Authentication, five-role RBAC, branch and record isolation must be verified.

### Financial Gate

Fee Payments, running Teacher Payroll and Posted Expenses must reconcile.

### Transaction Gate

Sensitive multi-record writes must be safe.

### Frontend Gate

Approved React workflows must remain compatible.

### Deployment Gate

Environment, hosting and readiness must be verified.

### Recovery Gate

Applicable backup and recovery requirements must be addressed.

### Acceptance Gate

Owner acceptance must be explicitly recorded.

---

## 54. Critical Release Blockers

Examples:

- Unauthorized student or salary data disclosure.
- Cross-branch data leakage.
- Admin privilege escalation.
- Duplicate verified Fee Payment.
- Duplicate salary disbursement.
- Missing linked Payroll Expense.
- Incorrect outstanding salary.
- Automatic monthly salary introduced.
- Broken critical Admission/Enrollment transaction.
- Production authentication bypass.
- Known critical database corruption.

Do not silently waive a critical blocker.

---

## 55. Deployment Smoke Testing

After an approved deployment, verify:

- Frontend loads.
- Backend responds where integrated.
- Database readiness.
- Login/logout.
- Authorized branch switching.
- Role restrictions.
- Admissions.
- Student and Enrollment data.
- Fees and Challans.
- Faculty Assignments.
- Running Payroll.
- Teacher My Profile.
- Finance summaries.
- Reports.
- Settings and branding.

Avoid creating uncontrolled real payments while smoke-testing production.

---

## 56. Client User Acceptance Testing

Client testing should use approved realistic workflows.

### Suggested UAT Areas

- Super Admin/Administration.
- Receptionist Admissions.
- Receptionist Fees.
- Student Enrollment.
- Academic records.
- Teacher Assignments.
- Teacher My Profile.
- Salary payment history.
- Owner/Finance views.
- Reports and branding.

### Record

- Scenario.
- Role.
- Branch.
- Expected result.
- Actual result.
- Client feedback.
- Issue or scope-change classification.
- Explicit acceptance decision.

A new feature request during UAT is not automatically an existing defect.

---

## 57. QA Completion Report

After actual test execution, document:

- Scope.
- Environment.
- Source revision.
- Number and type of executed tests.
- Passed results.
- Failed results.
- Blocked or skipped tests.
- Critical defects.
- Remaining risks.
- Release recommendation.

### Reporting Integrity

Do not claim:

- Test suite passed when not run.
- Backend integration completed when still mocked.
- Production deployment successful without evidence.
- Owner approval without explicit acceptance.

---

## 58. Master QA Checklist

### Authentication and Permissions

- [ ] Login/logout tested.
- [ ] Session expiration tested.
- [ ] Five roles tested.
- [ ] Admin escalation blocked.
- [ ] Receptionist Admissions/Fees access tested.
- [ ] Receptionist Finance/Payroll denial tested.
- [ ] Teacher self-only access tested.

### Organization and Branches

- [ ] Authorized branch access tested.
- [ ] Unauthorized branch access denied.
- [ ] Different roles across branches tested.
- [ ] Unsupported same-branch multi-role fails closed.
- [ ] Branch creation pause enforced.

### Academic Workflows

- [ ] Courses/Batches validated.
- [ ] Admissions transitions tested.
- [ ] Student relationships verified.
- [ ] Enrollment capacity tested.
- [ ] Duplicate Enrollment prevented.

### Finance

- [ ] Challan creation verified.
- [ ] Partial/full Fee Payment tested.
- [ ] Verified revenue reconciled.
- [ ] Duplicate Fee Payment prevented.
- [ ] Running Teacher Payroll verified.
- [ ] No automatic monthly salary.
- [ ] Salary/Expense consistency verified.
- [ ] Reports reconcile.

### Integration

- [ ] HTTP contracts tested.
- [ ] MongoDB relationships verified.
- [ ] Transactions tested.
- [ ] Frontend regressions tested.
- [ ] Branch-state refresh tested.
- [ ] Print/exports verified.

### Release

- [ ] CI results verified.
- [ ] Build successful.
- [ ] Security tests passed.
- [ ] Critical defects addressed.
- [ ] Smoke tests executed.
- [ ] Recovery readiness reviewed.
- [ ] Owner acceptance recorded where required.

Unchecked boxes mean verification is still pending.

---

## 59. Open QA Decisions

The following remain TBD:

- Final backend testing framework.
- Browser end-to-end framework.
- Supported browser matrix.
- Coverage thresholds.
- Performance targets.
- Test database infrastructure.
- CI execution strategy.
- Formal release sign-off process.
- UAT documentation format.
- Client acceptance authority.
- Monetary calculation contract.
- Final Same-Branch multiple-role policy.

Do not invent missing approved values.

---

## 60. Explicitly Deferred Testing

No tests are required for unapproved features such as:

- Platform Admin.
- Multi-client SaaS provisioning.
- Subscription billing.
- Electron desktop.
- Offline/LAN synchronization.
- Cloudinary/media upload workflows.
- Automatic monthly Teacher Payroll.
- Unapproved payment refunds/reversals.
- Arbitrary role/workflow design.
- Unimplemented third-party payment gateways.

These become applicable only through separate approved scope.

---

## 61. Related Documentation

This specification must remain consistent with:

- `AGENTS.md`
- `RULES.md`
- `PRD.md`
- `SYSTEM_DESIGN.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `AUTHENTICATION_AND_SECURITY.md`
- `RBAC_PERMISSIONS.md`
- `TENANT_BRANCH_ISOLATION.md`
- `BUSINESS_RULES.md`
- `ERD.md`
- `DATABASE.md`
- `DATABASE_MIGRATIONS.md`
- `API.md`
- `API_CONTRACTS.md`
- `DATA_FLOW.md`
- `TRANSACTIONS_AND_INTEGRITY.md`
- `CACHING_AND_PERFORMANCE.md`
- `FRONTEND_INTEGRATION.md`
- `FRONTEND_AUDIT.md`
- `FRONTEND_BACKEND_HANDOFF.md`
- `MODULE_WORKFLOW_MAP.md`
- `ROLE_BRANCH_DATA_MATRIX.md`
- `BACKEND_GAPS_AND_RISKS.md`
- `BACKEND_IMPLEMENTATION_PLAN.md`
- `BACKEND_TESTING_STRATEGY.md`
- `DEPLOYMENT_AND_DEVOPS.md`
- `INTEGRATIONS.md`
- `MCP_CONNECTIONS.md`
- `BUGFIX.md`
- `DEBUGGING.md`
- `TASKS.md`
- `PROGRESS.md`
- `MEMORY.md`

Use actual project paths when adding relative Markdown links.

---

## 62. Final Testing Boundary

### Confirmed Requirements

- Existing React/Vite frontend.
- Five application roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy with multiple authorized branches.
- Current branch creation pause.
- Physical Assets without media uploads.
- Financial and historical data protection.

### Proposed QA Coverage

- Unit tests.
- UI/component tests.
- API tests.
- MongoDB integration tests.
- Security tests.
- Branch and record isolation.
- Financial reconciliation.
- Transactions and concurrency.
- Frontend/backend regression.
- Deployment verification.
- Client UAT.

### Deferred

- SaaS/platform testing.
- Electron/offline testing.
- Media upload testing.
- Unapproved financial features.
- External services not yet implemented.

### Not Verified by This Document

- Actual execution of planned tests.
- Complete backend implementation.
- Production end-to-end testing.
- Production performance benchmarks.
- Formal release sign-off.
- Client UAT acceptance.

**Governing Principle:** TSA Academy ERP testing must establish correctness through executed evidence, protect approved user workflows and enforce role security, branch isolation, academic relationships and authoritative financial integrity before release acceptance.

**Document Status:** DRAFT — Ready for repository-specific test planning and execution after approved implementation.
