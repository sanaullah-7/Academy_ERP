# TSA Academy ERP — Backend Testing & Quality Assurance Strategy

**Document:** BACKEND_TESTING_STRATEGY.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Testing Strategy Proposed; Backend Tests Not Yet Implemented
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Scope:** Unit, Integration, API Contract, Security, Financial Integrity, Regression and Acceptance Testing

---

## 1. Purpose

This document defines the testing and quality assurance strategy for TSA Academy ERP's future backend.

The goal is to ensure that moving from frontend mock persistence to a real Express and MongoDB backend preserves the approved ERP behavior without introducing security vulnerabilities, financial inconsistencies, data loss or regressions.

The strategy covers:

- Unit testing.
- API contract testing.
- Integration testing.
- MongoDB persistence testing.
- Authentication and session testing.
- Role-based access control testing.
- Branch and record isolation testing.
- Academic workflow testing.
- Fees and financial integrity testing.
- Assignment-based Teacher Payroll testing.
- Concurrency and idempotency testing.
- Frontend/backend compatibility testing.
- Regression testing.
- Performance and reliability testing.
- Release acceptance criteria.

**Important:** This is a test specification, not evidence that tests have been executed. No test may be marked passed until it has actually run successfully.

---

## 2. Testing Principles

### TEST-001 — Test Approved Behavior

Tests must verify the existing approved product behavior rather than impose new business rules.

### TEST-002 — Source-Verified Contracts

Before writing module tests, inspect current frontend services, relevant test files and approved documentation.

### TEST-003 — Security by Default

Every protected workflow needs both authorized and unauthorized test cases.

### TEST-004 — Business Invariant Protection

Tests must verify valid data relationships and approved state transitions.

### TEST-005 — Financial Accuracy

Payment, balance, salary and expense tests must verify actual persisted amounts and relationships.

### TEST-006 — Isolation

Tests must use isolated fixtures and must not mutate production information.

### TEST-007 — Determinism

Tests must not depend on arbitrary ordering, uncontrolled current dates or shared state.

### TEST-008 — Relevant Coverage

Prefer meaningful tests for actual business risk over large numbers of superficial assertions.

### TEST-009 — Evidence-Based Reporting

Only executed tests may be reported as passed or failed.

### TEST-010 — No Unauthorized Scope

Do not implement new features merely to satisfy a speculative test scenario.

---

## 3. Test Classification

Use the following statuses when planning or reporting tests.

| Status | Meaning |
|---|---|
| PLANNED | Test identified but not implemented |
| WRITTEN | Test code exists but execution is not yet verified |
| PASSED | Test actually executed successfully |
| FAILED | Test executed and failed |
| BLOCKED | Test cannot run because of a documented dependency |
| SKIPPED | Test intentionally not executed, with a reason |
| NOT APPLICABLE | Scenario does not apply to the approved implementation |

An automated test passing does not automatically mean the product owner has accepted the associated feature.

---

## 4. Testing Layers

The proposed testing strategy uses several complementary layers.

```text
             End-to-End Workflow Tests
           Frontend + Backend Integration
          API Contract and Security Tests
         Domain Service Integration Tests
           Unit and Validation Tests
```

### 4.1 Unit Tests

Verify individual business functions without requiring a real HTTP server or MongoDB connection where practical.

### 4.2 Integration Tests

Verify interactions between services, repositories, MongoDB models, transactions and related modules.

### 4.3 API Tests

Verify HTTP methods, authentication, authorization, status codes, request validation and response contracts.

### 4.4 End-to-End Tests

Verify important real-user workflows from the existing React frontend through the backend into persistent storage.

### 4.5 Security Tests

Verify users cannot access unauthorized actions, branches, records or confidential information.

### 4.6 Data Integrity Tests

Verify transactions, financial relationships, concurrency and idempotency.

Testing layers should complement each other instead of duplicating every scenario at every level.

---

## 5. Testing Technology

Use the actual repository's existing test tooling whenever possible.

### Preferred Direction

- Preserve existing frontend Vitest tests.
- Evaluate using Vitest for backend testing if compatible with the current Node.js setup.
- Use an HTTP integration-test utility where justified.
- Use isolated MongoDB test databases or approved ephemeral MongoDB environments.
- Use a suitable transaction-capable MongoDB deployment for transaction tests.
- Use browser-based end-to-end testing only where it materially improves workflow verification.

### Restrictions

- Do not install Jest automatically if Vitest already satisfies the requirements.
- Do not introduce several overlapping test frameworks.
- Do not add dependencies without an approved implementation ticket.
- Do not run database tests against production.
- Do not assume an in-memory MongoDB environment supports transactions without verifying its configuration.

The final tooling choice must follow `RULES.md`, repository configuration and actual implementation needs.

---

## 6. Proposed Test Folder Structure

The final structure must respect existing `Server/` files and conventions.

```text
Server/
├── src/
│   └── modules/
│       ├── auth/
│       ├── admissions/
│       ├── fees/
│       ├── payroll/
│       └── ...
└── tests/
    ├── unit/
    ├── integration/
    ├── api/
    ├── security/
    ├── financial/
    ├── fixtures/
    └── helpers/
```

This structure is illustrative.

Tests may be colocated with domain modules if the existing architecture favors that approach.

Do not generate empty test directories merely to match this diagram.

---

## 7. Test Environment Requirements

Testing environments must be safe, repeatable and independent of production.

### Environment Separation

- Development environment.
- Automated test environment.
- Staging or demonstration environment.
- Production environment.

### Requirements

1. Use a dedicated test database.
2. Validate test database connection strings.
3. Prevent accidental connections to production credentials.
4. Use disposable or controlled fixtures.
5. Reset only explicitly identified test data.
6. Avoid destructive test commands on shared environments.
7. Keep secret values outside source code.
8. Use deterministic dates and identifiers where relevant.
9. Isolate tests that mutate shared records.
10. Record meaningful failures.

### Transaction Testing

MongoDB multi-document transaction tests must run on a transaction-capable deployment.

A test that passes only against a mock database does not prove real transaction behavior.

---

## 8. Test Data and Fixtures

Create a small representative fixture set covering the approved system.

### Organization and Branch Fixtures

- One academy organization.
- Branch 1.
- Branch 2.
- An inactive branch where needed.
- An unauthorized branch-access scenario.

### User Fixtures

At minimum:

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher A.
- Teacher B.
- Disabled user.
- Multi-branch user with different roles.

### Academic Fixtures

- Course.
- Subject.
- Stream where applicable.
- Batch with available capacity.
- Batch at full capacity.
- Faculty assignment.
- Student and Admission.
- Valid Enrollment.

### Financial Fixtures

- Unpaid Challan.
- Partially paid Challan.
- Fully paid Challan.
- Verified Fee Payment.
- Unverified Fee Payment where supported.
- Posted Expense.
- Teacher Salary Agreement.
- Running Salary Obligation.
- Partial Salary Payment.

### Fixture Security

Fixtures must contain fictional data.

Do not use real student contact information, staff passwords or confidential salary records in committed test fixtures.

---

## 9. Authentication Tests

Test the production authentication implementation.

| Test ID | Scenario | Expected result |
|---|---|---|
| AUTH-001 | Login with valid credentials | Authenticated session established |
| AUTH-002 | Login with invalid password | Request rejected |
| AUTH-003 | Login for disabled account | Request rejected |
| AUTH-004 | Access protected API without session | Unauthorized |
| AUTH-005 | Access with expired session | Unauthorized |
| AUTH-006 | Logout | Current session invalidated |
| AUTH-007 | Reuse revoked session | Request rejected |
| AUTH-008 | Change password with invalid current credential | Rejected |
| AUTH-009 | Change role during active session | Subsequent permission checks use updated grants |
| AUTH-010 | Change branch assignment during active session | Revoked branch access is denied |

### Session Security

Also verify applicable:

- Secure cookie configuration.
- HttpOnly cookie behavior.
- SameSite configuration.
- CSRF protection.
- CORS restrictions.
- Session expiration.
- Authentication rate limiting.

Exact configuration assertions depend on the approved production session design.

---

## 10. Five-Role Authorization Tests

The current product supports exactly five frontend roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### General RBAC Cases

| Test ID | Scenario | Expected result |
|---|---|---|
| RBAC-001 | Super Admin performs permitted operation | Allowed |
| RBAC-002 | Admin performs permitted branch operation | Allowed |
| RBAC-003 | Admin tries to grant unauthorized Super Admin privileges | Denied |
| RBAC-004 | Admin modifies protected privileged account without authority | Denied |
| RBAC-005 | Receptionist performs approved Admission mutation | Allowed |
| RBAC-006 | Receptionist records approved fee payment | Allowed |
| RBAC-007 | Receptionist requests independent Finance API | Denied |
| RBAC-008 | Receptionist requests administrative Payroll API | Denied |
| RBAC-009 | Receptionist requests Audit Log, Users or Settings API | Denied |
| RBAC-010 | Owner opens permitted financial summary | Allowed |
| RBAC-011 | Owner attempts unauthorized financial mutation | Denied |
| RBAC-012 | Teacher reads own My Profile | Allowed |
| RBAC-013 | Teacher reads own verified salary history | Allowed |
| RBAC-014 | Teacher requests another Teacher's salary | Denied |
| RBAC-015 | Teacher attempts salary disbursement | Denied |
| RBAC-016 | Unknown role or permission | Denied |

### Permission Verification

Exact Owner, Admin and other ancillary action-level grants must be derived from the current frontend permission registry.

Do not add broad permissions based solely on role labels.

---

## 11. Receptionist Admissions and Fees Tests

**CONFIRMED OWNER DECISION:** Receptionist has Full Access to existing approved Admissions and Fees functionality.

### Admissions Tests

- View Admissions list.
- View Admission details.
- Create an Admission.
- Edit permitted Admission fields.
- Approve an eligible Admission.
- Return an eligible Approved Admission to Pending.
- Enroll an eligible Admission.
- Complete an approved instant Admission.
- Delete an Admission where current safeguards allow it.
- Reject deletion where enrollment/financial history blocks it.
- Reject invalid status transitions.
- Reject unauthorized cross-branch Admissions access.

### Fees Tests

- View permitted Challans.
- Create an approved Challan.
- Read student fee ledger.
- Record valid fee collection.
- Record valid partial payment.
- View verified payment.
- Generate/view valid receipt.
- Reject unsupported overpayment.
- Reject duplicate financial request.
- Reject unauthorized cross-branch payment.
- Reject access to independent Finance, Expenses and Payroll.

**Full module permission never bypasses transaction integrity or branch ownership.**

---

## 12. Teacher My Profile Tests

**CONFIRMED:** Teacher can view their own `/my-profile`.

### Four Required Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Self-Service Test Cases

| Test ID | Scenario | Expected result |
|---|---|---|
| TEACH-001 | Teacher reads own profile | Allowed |
| TEACH-002 | Teacher reads own timetable | Allowed |
| TEACH-003 | Teacher reads own Faculty Assignments | Allowed |
| TEACH-004 | Teacher reads permitted assigned teaching data | Allowed |
| TEACH-005 | Teacher reads own salary agreement | Allowed |
| TEACH-006 | Teacher reads own paid/outstanding balances | Allowed |
| TEACH-007 | Teacher reads own verified payment history | Allowed |
| TEACH-008 | Teacher retrieves own payslip | Allowed |
| TEACH-009 | Teacher requests another Teacher's payslip | Denied |
| TEACH-010 | Teacher requests another Teacher's salary agreement | Denied |
| TEACH-011 | Teacher requests administrative Payroll API | Denied |
| TEACH-012 | Teacher attempts to modify own salary agreement | Denied |
| TEACH-013 | Teacher requests unrelated batch student data | Denied |
| TEACH-014 | Teacher accesses own payment notification | Allowed |

### Ownership Verification

Backend identity must come from the authenticated session.

Changing a path, query parameter or submitted Teacher ID must not reveal someone else's data.

---

## 13. Branch Isolation Tests

The product initially supports one academy organization and multiple branches.

### Test Scenarios

| Test ID | Scenario | Expected result |
|---|---|---|
| BR-001 | User accesses assigned branch | Allowed |
| BR-002 | User accesses unassigned branch | Denied |
| BR-003 | User switches from Branch 1 to Branch 2 | Effective role recalculated |
| BR-004 | User has Teacher role in Branch 1 and Receptionist role in Branch 2 | Correct branch-specific permissions |
| BR-005 | Unsupported multiple roles within one branch | Fail closed |
| BR-006 | User requests another branch's Admission | Denied |
| BR-007 | User requests another branch's Challan | Denied |
| BR-008 | User requests another branch's Payroll obligation | Denied |
| BR-009 | User requests unauthorized cross-branch report | Denied |
| BR-010 | User performs authorized multi-branch comparison | Only permitted branch data returned |
| BR-011 | Branch membership is revoked | Subsequent access denied |
| BR-012 | Client supplies arbitrary organization ID | Does not expand scope |

### Branch Creation Pause

All users, including Super Admin, must be denied attempts to create a new branch while the current owner-approved pause remains active.

### Branch Lifecycle

Test approved branch-editing, deactivation and deletion safeguards based on the current verified frontend rules.

---

## 14. Academic Reference Tests

### Courses

- Create valid course where authorized.
- Reject invalid course fields.
- Reject duplicate records under approved uniqueness rules.
- Preserve referenced course history.

### Batches

- Create valid batch.
- Verify Course → Batch relationship.
- Reject incompatible branch/course references.
- Enforce approved capacity.
- Reject invalid status operations.

### Subjects and Streams

- Validate permitted course/subject/stream relationships.
- Reject unsupported combinations.
- Preserve historical references.

### Deletion

Records referenced by active enrollments, assignments or financial data must not be destructively deleted contrary to the approved business policy.

---

## 15. Admission Tests

### Functional Scenarios

| Test ID | Scenario | Expected result |
|---|---|---|
| ADM-001 | Create valid Admission | Success |
| ADM-002 | Missing required applicant fields | Validation error |
| ADM-003 | Invalid Course reference | Rejected |
| ADM-004 | Invalid Batch reference | Rejected |
| ADM-005 | Admission created under unauthorized branch | Denied |
| ADM-006 | Approve Pending Admission | Approved where eligible |
| ADM-007 | Return eligible Approved Admission to Pending | Successful approved transition |
| ADM-008 | Unsupported status transition | Rejected |
| ADM-009 | Edit permitted fields | Updated correctly |
| ADM-010 | Unsafe delete of linked enrolled Admission | Rejected |
| ADM-011 | Allowed delete | Existing safeguards preserved |
| ADM-012 | Duplicate request | No unintended duplicate records |

### Historical Status Restriction

Do not write tests requiring an active Reject/Rejected workflow unless the owner explicitly restores it.

Legacy records may require separate migration compatibility tests.

---

## 16. Enrollment and Capacity Tests

### Functional Tests

- Valid Enrollment.
- Invalid Admission state.
- Missing Student.
- Incorrect Course/Batch relationship.
- Duplicate Enrollment.
- Enrollment with full Batch.
- Student activation behavior.
- Correct Admission/Student/Enrollment linkage.
- Consistent Challan generation where required.

### Concurrency Test

Set a batch with one remaining seat.

Execute simultaneous valid enrollment attempts.

Assert that the committed results do not exceed approved capacity.

The test must inspect authoritative MongoDB state, not only HTTP responses.

---

## 17. Instant Admission Transaction Tests

The approved flow may create:

- Student.
- Admission.
- Enrollment.
- Challan.
- Optional Verified Payment.

### Required Tests

1. Successful complete transaction.
2. Invalid applicant data.
3. Invalid academic reference.
4. Enrollment capacity failure.
5. Challan creation failure.
6. Payment validation failure.
7. Duplicate request using the same idempotency key.
8. Conflicting payload with reused idempotency key.
9. Database write failure before commit.
10. Correct related record references after success.

### Acceptance Criteria

A failed required operation must not leave an unintended partially completed admission.

A repeated equivalent request must not create duplicate linked financial or academic records.

---

## 18. Challan Tests

### Required Cases

- Valid Challan issuance.
- Correct Enrollment reference.
- Correct Student reference.
- Correct approved fee calculation.
- Approved one-Challan-per-Enrollment behavior.
- Duplicate issuance prevention.
- Invalid or unrelated Enrollment rejection.
- Unauthorized branch access denial.
- Correct outstanding balance.
- Protected already-paid records.
- Valid receipt linkage.

The exact course/subject fee calculation must match verified frontend logic.

---

## 19. Fee Payment Tests

### Functional Tests

| Test ID | Scenario | Expected result |
|---|---|---|
| FEE-001 | Valid full payment | Correct verified collection |
| FEE-002 | Valid partial payment | Correct remaining balance |
| FEE-003 | Unverified payment | Excluded from verified revenue |
| FEE-004 | Payment greater than outstanding | Rejected |
| FEE-005 | Invalid amount | Rejected |
| FEE-006 | Invalid Challan | Rejected |
| FEE-007 | Unrelated branch Challan | Denied |
| FEE-008 | Repeated identical request | No unintended duplicate |
| FEE-009 | Same amount in two legitimate transactions | Correctly handled; amount alone is not duplicate evidence |
| FEE-010 | Receipt requested for verified payment | Matches authoritative record |
| FEE-011 | Receptionist performs approved collection | Allowed |
| FEE-012 | Teacher performs fee collection | Denied |

### Financial Reconciliation

Assert that:

- Verified payments are counted once.
- Outstanding fees are correct.
- Finance revenue agrees with valid Fee Payments.
- Dashboard and Reports derive consistent totals.

Refund and reversal scenarios remain out of scope until approved.

---

## 20. Finance and Expense Tests

### Expense Tests

- Valid authorized expense creation.
- Invalid amount rejection.
- Approved expense category handling.
- Branch scope enforcement.
- Owner permissions matching the verified frontend registry.
- Receptionist access denial.
- Teacher access denial.
- Historical transaction preservation.

### Finance Tests

- Verified Fee Payments contribute to revenue.
- Unverified payments do not contribute to confirmed revenue.
- Posted operational Expenses contribute to expense totals.
- Posted Payroll Expenses contribute exactly once.
- Net financial position matches approved business definitions.
- Date and branch filters are correct.
- Unauthorized Finance access is denied.

### No Unsupported Features

Do not create tests asserting unapproved refunds, adjustment approvals or automatic expense reversals.

---

## 21. Teacher Payroll Tests

**CRITICAL CONFIRMED BUSINESS MODEL:** Assignment-based running salary, not automatically generated monthly payroll.

### 21.1 Agreement Tests

- Valid Faculty Assignment.
- Valid Fixed salary agreement.
- Valid Percentage salary agreement.
- Invalid or missing agreement fields.
- Wrong Teacher/Branch assignment rejection.
- Agreement revision validation.
- Historical agreement preservation.

### 21.2 Formula Compatibility

Before writing exact expected values, inspect the frontend's current salary calculation sources and related tests.

Verify:

- Fixed remuneration.
- Percentage remuneration.
- Rounding behavior.
- Relationship to assignment, batch and subject.
- Any current agreement status rules.

Do not substitute an assumed payroll formula.

### 21.3 Running Balance Tests

| Test ID | Scenario | Expected result |
|---|---|---|
| PAY-001 | Create eligible agreement | Correct assignment obligation |
| PAY-002 | Create second independent assignment | Separate obligation |
| PAY-003 | New calendar month begins | No automatic new salary |
| PAY-004 | Valid partial payment | Outstanding reduced correctly |
| PAY-005 | Valid full settlement | Outstanding reflects settlement |
| PAY-006 | Payment greater than allowed balance | Rejected |
| PAY-007 | Old assignment ends with unpaid balance | Balance preserved |
| PAY-008 | New agreement created | Previous balances unchanged |
| PAY-009 | Duplicate payment request | No duplicate disbursement |
| PAY-010 | Simultaneous payments against limited outstanding | Total committed payments remain valid |
| PAY-011 | Agreement revised after partial payment | Historical payments preserved |
| PAY-012 | Teacher reads own payment | Allowed |
| PAY-013 | Teacher reads other Teacher's payment | Denied |
| PAY-014 | Receptionist requests Payroll management | Denied |

### 21.4 Payroll to Expense Tests

For a successful salary disbursement:

- Exactly one Salary Payment exists.
- Exactly one appropriate linked Posted Expense exists.
- Both reference the correct branch and obligation.
- Financial reports count the expense once.
- Teacher compensation reflects the committed payment.
- Required audit history is preserved.

For a failed payment:

- No new committed salary payment.
- No orphaned posted expense.
- No misleading success notification.

### 21.5 Historical Preservation

Verify old salary agreements and payments are not overwritten when a teacher receives a new batch or subject assignment.

---

## 22. Concurrency and Race Condition Tests

Use controlled simultaneous operations against actual persistence.

### Required Scenarios

1. Two users enrolling the last batch seat.
2. Two requests approving or changing one Admission concurrently.
3. Two staff users attempting payments exceeding the same remaining fee balance.
4. Two administrators paying against one Teacher obligation.
5. Simultaneous salary agreement revisions.
6. Role revocation while the user has an active session.
7. Branch deactivation while another operation attempts a protected write.

### Acceptance Criteria

- No invalid duplicate records.
- No over-enrollment.
- No overpayment.
- No unauthorized post-revocation operation.
- No lost update where concurrency protection is required.
- No orphaned related financial records.
- Appropriate conflict responses.

Successful tests must inspect committed database records.

---

## 23. Idempotency Tests

Applicable sensitive writes must handle repeated requests safely.

### Cases

- First valid request succeeds.
- Equivalent request with same key does not duplicate the business effect.
- Same key with different payload is rejected.
- Simultaneous requests with the same key do not both create records.
- Retried request after timeout resolves consistently.
- Key from another user/branch is not improperly reused.
- Idempotency record expiration follows the approved policy.

### Important

Idempotency does not replace:

- Authentication.
- Authorization.
- Balance checks.
- Unique constraints.
- Database transactions.

Final key storage and replay behavior require contract approval.

---

## 24. MongoDB Transaction Tests

Test multi-document operations on a transaction-capable MongoDB deployment.

### Required Checks

- Successful commit.
- Validation error before write.
- Error during second/third dependent write.
- Explicit transaction abort.
- Transaction conflict/retry.
- Commit result uncertainty.
- Session cleanup.
- Required audit-event consistency.

### High-Priority Workflows

- Instant Admission.
- Enrollment and Challan creation.
- Fee collection where coordinated writes require atomicity.
- Salary Payment with matching Expense.
- Approved multi-record branch/user assignment changes.

Do not treat a passing mocked repository test as proof of MongoDB transaction correctness.

---

## 25. Demo Classes Tests

Verify:

- Valid inquiry creation.
- Existing approved attendance/no-show states.
- Permitted status updates.
- Approved cancellation.
- Admission prefill behavior.
- Correct conversion linkage.
- Duplicate conversion prevention.
- Authorized branch scope.
- No automatic unsupported enrollment or payment.

The exact conversion test must reflect whether the frontend creates an Admission directly or opens a prefilled form awaiting confirmation.

---

## 26. Physical Assets Tests

Verify:

- Valid asset registration.
- Asset code uniqueness under approved scope.
- Authorized branch ownership.
- Staff assignment.
- Inspection history.
- Maintenance history.
- Approved condition/status transitions.
- Unauthorized cross-branch modification denial.
- No unapproved automatic Finance expense from maintenance.

### Explicit Exclusion

Cloudinary, digital media storage, video uploads and image upload workflows are not in scope.

Do not add test dependencies for unapproved media functionality.

---

## 27. Reports and Exports Tests

### Accuracy Tests

- Student and Admission counts.
- Batch enrollment counts.
- Verified fee collection totals.
- Outstanding fees.
- Operating expenses.
- Payroll payable, paid and outstanding.
- Net financial position.
- Authorized branch comparisons.

### Security Tests

- Cross-branch reporting restrictions.
- Restricted finance visibility.
- Teacher salary privacy.
- Receptionist Finance/Payroll denial.
- Export permission checks.
- No confidential fields in unauthorized exports.

### Compatibility Tests

Existing CSV, PDF, Word and print views must continue to use approved fields and calculations where implemented.

Do not equate a successfully generated file with a correct authorized report; inspect representative contents.

---

## 28. Audit and Notification Tests

### Audit

- Sensitive action generates required audit event.
- Audit actor/resource/branch references are correct.
- Unauthorized Audit Log read is denied.
- Ordinary audit modification is denied.
- Audit history survives account deactivation where required.
- Sensitive secrets are not recorded.

### Notifications

- Successful salary payment generates the correct Teacher notification where supported.
- Failed payment does not generate a false success notification.
- Teacher sees only own notifications.
- Repeated delivery does not duplicate financial records.
- Notification failure does not incorrectly reverse a committed payment.

---

## 29. Frontend/Backend Contract Tests

Every migrated frontend domain service must be checked against the accepted HTTP contract.

### Required Checks

- Correct HTTP method.
- Correct endpoint.
- Required query parameters.
- Correct request fields.
- Compatible response normalization.
- Stable IDs.
- Correct date and money parsing.
- Loading states.
- Field-level validation errors.
- Conflict errors.
- Authentication failure handling.
- Branch switch behavior.
- Correct dependent module refresh.

### Mock Versus HTTP Comparison

For supported workflows, compare:

```text
Same Approved Input
       |
       +--> Existing Mock Service
       |
       +--> New HTTP-Backed Service
       |
       v
Equivalent Approved Business Outcome
```

Internal storage identifiers and implementation details need not match, but user-visible business outcomes and financial calculations must remain compatible.

---

## 30. Frontend Regression Tests

Backend integration must not unnecessarily change existing frontend behavior.

### Critical Regression Areas

- Login and branch selector.
- Role-specific navigation.
- Admissions.
- Enrollment.
- Student directory.
- Course and Batch management.
- Faculty assignment.
- Fees and receipts.
- Finance and Expenses.
- Teacher Payroll.
- Teacher My Profile.
- Demo Classes.
- Assets.
- Reports and exports.
- Settings and academy theme.

Use targeted existing frontend tests first.

Run broader regression suites when a phase changes shared services, state management, authentication or several module contracts.

---

## 31. Performance Tests

Performance testing should reflect realistic academy usage.

### Candidate Scenarios

- Large student lists with pagination.
- Admission searches.
- Batch enrollment lookups.
- Challan history.
- Financial date-range reports.
- Payroll obligation summaries.
- Branch switching.
- Simultaneous authorized users.

### Measurements

Where relevant:

- API response latency.
- Database query time.
- Memory usage.
- Concurrent request behavior.
- Error rate.
- Report generation time.

### Important

Do not invent fixed production performance targets without agreed workload expectations.

A functional correctness or security failure must not be accepted for the sake of improved speed.

---

## 32. Security Regression Tests

Every security-relevant backend change should verify:

- No authentication bypass.
- No permission escalation.
- No cross-branch record disclosure.
- No Teacher access to another Teacher's salary.
- No Receptionist access to independent Finance or Payroll.
- No protected account modification by unauthorized Admin.
- No mass assignment of security-sensitive fields.
- No unintended data exposure through exports.
- No sensitive error-message leakage.
- No unauthorized branch creation.

Sensitive endpoints should also be checked for CSRF, CORS and session-security requirements appropriate to the final authentication transport.

---

## 33. Continuous Integration Testing

The existing CI configuration must be inspected before modification.

### Recommended Checks

- Dependency installation using the repository lockfile.
- Syntax/build checks where appropriate.
- Backend unit tests.
- API and integration tests with a safe test database.
- Frontend tests affected by integration changes.
- Lint or static checks if already configured.
- Security-sensitive configuration validation.

### CI Rules

- Keep workflows reproducible.
- Never expose production secrets.
- Avoid destructive commands.
- Fail the pipeline on meaningful required test failures.
- Do not add expensive or unrelated test stages without justification.
- Do not claim CI passed unless the actual pipeline executed successfully.

---

## 34. Bug Reporting Standards

A useful test failure report should include:

- Test ID/name.
- Expected behavior.
- Actual result.
- Relevant role and branch.
- Request or workflow performed.
- Reproduction steps.
- Safe error output.
- Relevant changed files.
- Whether authoritative database records were affected.
- Severity and recommended correction.

Never include production passwords, session credentials or unrelated personal data in test reports.

---

## 35. Testing Gates by Implementation Phase

| Phase | Minimum verification gate |
|---|---|
| Backend Foundation | Startup, environment handling, database connection and health checks |
| Auth/RBAC | Five roles, secure sessions, protected accounts and branch isolation |
| Academic Core | Valid entity relationships, CRUD restrictions and capacity |
| Admissions | Status transitions, guarded mutation and correct student linkage |
| Enrollment | Duplicate prevention, capacity and transaction rollback |
| Fees | Verified payments, partial collection, idempotency and outstanding balances |
| Faculty | Teaching assignment validation and timetable scope |
| Payroll | Source-compatible formulas, running balances, linked expenses and privacy |
| Finance | Verified revenue, posted expenses and reporting consistency |
| Operations | Demo, physical Assets, Settings, Audit and Notifications |
| Integration | Existing frontend workflow compatibility |
| Release | Full critical-path security, integrity and regression verification |

A phase may remain `IN_REVIEW` after technical verification until formal owner acceptance.

---

## 36. Definition of Test Completion

A test activity is complete when:

1. The intended behavior is documented.
2. The test setup is identified.
3. The test was actually executed.
4. The result is recorded.
5. Required database assertions were checked.
6. Any failures are reported.
7. Relevant logs are safe to share.
8. No production data was harmed.

A feature is not fully accepted merely because one unit test passes.

---

## 37. Backend Acceptance Criteria

The backend may be considered technically ready for client testing when the relevant release scope satisfies:

- Reliable authentication.
- Server-enforced five-role permissions.
- Branch and record isolation.
- Core academic workflows.
- Consistent Admissions and Enrollment.
- Accurate Challans and Fee Payments.
- Assignment-based Teacher Payroll.
- Accurate salary-to-expense reconciliation.
- Secure Teacher self-service.
- Correct Reports and Dashboard projections.
- No critical duplicate-payment vulnerabilities.
- No known critical unauthorized-data access.
- Successful critical integration tests.
- Safe deployment and recovery procedures appropriate to the demo.

Formal business acceptance remains a separate owner decision.

---

## 38. Open Testing Decisions

The following remain to be finalized:

- Actual backend testing framework.
- Test database hosting strategy.
- Transaction-capable integration environment.
- Exact API schema validation method.
- Performance targets.
- Minimum coverage thresholds, if any.
- Browser end-to-end testing framework.
- Production-like test fixture sizes.
- CI execution policy.
- Test data retention.
- Security scanning scope.
- Final release acceptance checklist.

Do not invent final answers without evidence or approval.

---

## 39. Related Documentation

This document must remain aligned with:

- `AGENTS.md` — Coding-agent instructions.
- `RULES.md` — Engineering rules.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `BUSINESS_RULES.md` — Domain invariants.
- `SECURITY.md` — Security requirements.
- `RBAC_PERMISSIONS.md` — Role/action permissions.
- `TENANT_BRANCH_ISOLATION.md` — Branch data ownership.
- `ARCHITECTURE.md` — Technical architecture.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — Persistence design.
- `API.md` — Endpoint architecture.
- `API_CONTRACTS.md` — HTTP request/response contracts.
- `DATA_FLOW.md` — Cross-module data flow.
- `TRANSACTIONS_AND_INTEGRITY.md` — Atomicity, concurrency and recovery.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Module delivery sequence.
- `FRONTEND_INTEGRATION.md` — Frontend service compatibility.
- `FRONTEND_AUDIT.md` — Frontend behavior evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend handoff.
- `MODULE_WORKFLOW_MAP.md` — Cross-module dependencies.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role and branch scope.
- `BACKEND_GAPS_AND_RISKS.md` — Known backend risks.
- `FEATURE_TICKETS.md` — Planned features.
- `TASKS.md` — Active ticket tracking.
- `MEMORY.md` — Owner-approved decisions.
- `PROGRESS.md` — Actual implementation and test evidence.

Relative links must match the repository's real file locations.

---

## 40. Final Testing Boundary

### Confirmed Requirements

- Five frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only profile, timetable, assignments and salary.
- Assignment-based running Payroll, without monthly salary generation.
- Multiple authorized branches.
- Branch creation remains paused.
- Consistent academic and financial workflows.
- Physical inventory without media uploads.

### Planned Test Coverage

- Unit testing.
- REST API and contract testing.
- MongoDB integration testing.
- Security and RBAC verification.
- Branch and record isolation.
- Financial accuracy and reconciliation.
- Transactions and idempotency.
- Concurrent operations.
- Frontend/backend regression.
- Release acceptance checks.

### Deferred

- Tests for unapproved SaaS infrastructure.
- Tests for Cloudinary/media uploads.
- Tests requiring automatic monthly payroll.
- Tests for unapproved financial refunds and reversals.
- Performance infrastructure unrelated to actual approved workload.

### Not Implemented or Verified

- Production backend test suites.
- MongoDB transaction integration tests.
- Final API contract tests.
- Real backend/frontend end-to-end testing.
- Production performance testing.
- Formal backend acceptance.

**Governing Principle:** The backend must be proven correct through executable tests of approved user behavior, authorization, branch scope, academic relationships, financial consistency and failure recovery. Test status must always reflect actual execution evidence.

**Document Status:** DRAFT — Ready for backend testing design review and later implementation through approved tickets.
