# TSA Academy ERP — Regression Testing & Quality Assurance Specification

**Document:** REGRESSION_AND_QA.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — QA Plan Proposed; Test Execution Not Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Product:** One Academy Organization with Multiple Branches
**Document Category:** Integration & Quality Assurance

---

## 1. Purpose

This document defines the regression testing, functional quality assurance, integration verification and release acceptance requirements for TSA Academy ERP.

The primary objective is to ensure that a new feature, bug fix, backend implementation, API change, database migration or deployment does not break previously approved functionality.

Regression testing must protect:

- Existing React frontend workflows.
- Role-based navigation and permissions.
- Academy and branch isolation.
- Student Admissions and Enrollment.
- Academic reference data.
- Student Fees and financial records.
- Assignment-based Teacher Payroll.
- Teacher My Profile.
- Finance and Expenses.
- Demo Classes.
- Physical Assets.
- Reports and Ledgers.
- Audit Log.
- Users and Settings.
- Printing and exports.
- Application security and data integrity.

**Important:** This document defines tests and acceptance criteria. It does not establish that the backend is implemented or that the tests have already passed.

---

## 2. Quality Assurance Principles

### QA-001 — Approved Behavior Is the Baseline

Regression tests must preserve current owner-approved workflows.

### QA-002 — Verify Actual Source

Inspect frontend implementation and existing tests before finalizing assertions.

### QA-003 — Security Is Mandatory

Every protected operation must be tested for both permitted and forbidden access.

### QA-004 — Branch Isolation

A feature must not expose another branch's records without explicit permission.

### QA-005 — Financial Correctness

Fees, salary payments, running balances and Expenses must reconcile.

### QA-006 — Source-of-Truth Integrity

MongoDB is the planned authoritative backend persistence layer.

Browser-local mock state must not be mistaken for shared backend persistence.

### QA-007 — Regression Scope Follows Impact

Test the modified module and relevant dependent modules.

### QA-008 — No False Success

Do not mark a transaction or test successful before its outcome is verified.

### QA-009 — No Unauthorized Features

Do not introduce unsupported business behavior solely to satisfy a test.

### QA-010 — Evidence-Based Acceptance

Report only actual test execution results and explicit owner acceptance.

---

## 3. QA Status Definitions

Use the following statuses consistently.

| Status | Meaning |
|---|---|
| NOT_STARTED | Testing has not begun |
| PLANNED | Test scenarios defined |
| WRITTEN | Automated test exists |
| IN_PROGRESS | Test execution underway |
| PASSED | Test executed successfully |
| FAILED | Test executed and failed |
| BLOCKED | Required dependency unavailable |
| SKIPPED | Intentionally not run, reason documented |
| NOT_APPLICABLE | Outside approved feature scope |
| IN_REVIEW | Awaiting technical or owner review |
| OWNER_ACCEPTED | Explicit acceptance received |

A planned test is not a passed test.

A feature that renders successfully is not automatically functionally correct.

---

## 4. QA Testing Layers

### 4.1 Unit Testing

Validate isolated calculations, transformations and business rules.

### 4.2 Component Testing

Verify existing React components, forms, tables and interactive controls.

### 4.3 Service Testing

Validate frontend domain service methods and backend domain services.

### 4.4 API Contract Testing

Verify accepted endpoint methods, payloads, response shapes and errors.

### 4.5 Database Integration Testing

Verify MongoDB relationships, validation, transactions and indexes.

### 4.6 End-to-End Testing

Verify important workflows from the React interface through the backend.

### 4.7 Security Testing

Verify roles, branch scope, record ownership and protected transactions.

### 4.8 Regression Testing

Confirm previously approved functionality remains operational after changes.

### 4.9 Release Smoke Testing

Verify the deployed application remains usable and correctly connected.

---

## 5. Existing Test Tooling

The current frontend has used Vitest.

The backend test framework must be selected after inspecting the actual repository configuration.

### Rules

- Preserve existing test conventions.
- Prefer reusable test helpers.
- Avoid unnecessary overlapping test frameworks.
- Use an isolated database for integration tests.
- Use transaction-capable MongoDB for transaction verification.
- Do not run destructive tests against production.
- Do not claim test execution based on documentation alone.

Browser automation may be introduced later if required for the approved end-to-end test scope.

---

## 6. Test Environment Requirements

Use separate environments where applicable.

| Environment | Main QA purpose |
|---|---|
| Local frontend | Component and mock workflow testing |
| Backend development | Domain and API verification |
| Automated test | Repeatable unit/integration testing |
| Staging | End-to-end integration and release review |
| Production | Non-destructive smoke and operational verification |

### Requirements

- Test with fictional or authorized records.
- Isolate backend test databases.
- Protect confidential credentials.
- Avoid overwriting client demo data.
- Verify correct environment before a destructive test operation.
- Keep test results reproducible.

---

## 7. Standard QA Test Data

The QA environment should include representative records.

### Academy and Branches

- One academy organization.
- Branch 1.
- Branch 2.
- Authorized multi-branch staff.
- Unauthorized branch membership scenario.

### Roles

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher A.
- Teacher B.

### Academics

- Courses.
- Subjects.
- Batches.
- A batch with available seats.
- A full batch.
- Students.
- Pending Admissions.
- Approved Admissions.
- Enrollments.
- Faculty Assignments.

### Finance

- Unpaid Challan.
- Partially paid Challan.
- Fully paid Challan.
- Verified Fee Payments.
- Unverified payment scenario where supported.
- Operating Expense.
- Teacher Salary Agreement.
- Partial Salary Payment.
- Outstanding Salary Obligation.
- Linked Payroll Expense.

### Other Modules

- Demo inquiry.
- Converted Demo inquiry.
- Physical Asset.
- Assigned Asset.
- Audit events.
- Branding settings.

All fixture records must follow the actual implemented schema.

---

# PART A — USER ACCESS AND SECURITY REGRESSION

## 8. Authentication Regression

| ID | Test case | Expected behavior |
|---|---|---|
| AUTH-QA-001 | Valid login | Authorized session established |
| AUTH-QA-002 | Invalid credentials | Login rejected |
| AUTH-QA-003 | Disabled account | Access denied |
| AUTH-QA-004 | Logout | Session invalidated |
| AUTH-QA-005 | Expired session | Protected API rejects access |
| AUTH-QA-006 | Refresh protected route | Valid session preserved appropriately |
| AUTH-QA-007 | Session revoked | Subsequent protected requests denied |
| AUTH-QA-008 | Direct protected API call without login | Unauthorized |
| AUTH-QA-009 | Browser refresh after login | Auth state restored safely |
| AUTH-QA-010 | Logout and login as different user | Previous user's confidential state removed |

The exact session behavior must match the finalized authentication design.

---

## 9. Five-Role Permission Regression

The system supports exactly five current roles.

### Super Admin

Verify approved administration, protected account restrictions and the branch-creation pause.

### Admin

Verify authorized management operations and denial of unauthorized privilege escalation.

### Receptionist

Verify Full approved access to:

- Admissions.
- Fees.

Verify denial of independent:

- Finance.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branches.
- Users.
- Settings.

### Owner

Verify the actual approved management and Finance/Expense permission matrix.

Do not infer unlimited editing rights from the Owner role label.

### Teacher

Verify access to own:

- Profile.
- Timetable.
- Academic Assignments.
- Salary Agreements.
- Payment History.
- Outstanding Balances.
- Payslips.
- Notifications.

Verify denial of unrelated administrative and other-teacher financial records.

---

## 10. Branch Isolation Regression

| ID | Test case | Expected behavior |
|---|---|---|
| BR-QA-001 | Access assigned branch | Allowed |
| BR-QA-002 | Access unassigned branch | Denied |
| BR-QA-003 | Change active branch | Data and role context refresh |
| BR-QA-004 | Different roles in different branches | Correct permissions |
| BR-QA-005 | Unsupported same-branch multi-role combination | Fail closed |
| BR-QA-006 | Read another branch's Admission | Denied |
| BR-QA-007 | Modify another branch's Challan | Denied |
| BR-QA-008 | Read unauthorized Payroll data | Denied |
| BR-QA-009 | Authorized multi-branch report | Only approved data returned |
| BR-QA-010 | Create branch with any role | Denied while creation is paused |
| BR-QA-011 | Role revoked during session | Updated permissions enforced |
| BR-QA-012 | Delayed API response after branch switch | Cannot overwrite new branch state |

### Important

Frontend hiding of unauthorized records is not sufficient.

Protected APIs must enforce branch isolation independently.

---

# PART B — FUNCTIONAL MODULE REGRESSION

## 11. Dashboard Regression

### Test Cases

- Dashboard renders for authorized users.
- Role-specific cards are correct.
- Active branch is reflected.
- Student totals are consistent.
- Admissions totals are consistent.
- Batch-related metrics match records.
- Fee totals match verified collections.
- Expense summaries match posted records.
- Teacher information is restricted.
- Branch switching updates Dashboard values.

### Financial Rule

Do not count unverified Fee Payments as confirmed revenue.

### Acceptance

Dashboard values must agree with underlying authoritative records.

---

## 12. Admissions Regression

### Current Approved Status Flow

- Pending.
- Approved.
- Permitted return to Pending.

The historical Reject workflow is superseded.

### Test Cases

| ID | Test case | Expected behavior |
|---|---|---|
| ADM-QA-001 | View Admissions | Authorized list |
| ADM-QA-002 | Create Admission | Valid record created |
| ADM-QA-003 | Missing required fields | Validation error |
| ADM-QA-004 | Edit Admission | Permitted fields updated |
| ADM-QA-005 | Approve eligible Admission | Approved |
| ADM-QA-006 | Return eligible Approved record to Pending | Status updated |
| ADM-QA-007 | Invalid transition | Rejected |
| ADM-QA-008 | Enrollment from eligible Admission | Correct linked records |
| ADM-QA-009 | Delete allowed Admission | Safeguards respected |
| ADM-QA-010 | Delete linked/financially protected Admission | Rejected |
| ADM-QA-011 | Receptionist approved mutation | Allowed |
| ADM-QA-012 | Unauthorized branch Admission | Denied |

### Regression Rule

Do not reintroduce unsupported active Reject functionality.

---

## 13. Students Regression

### Test Cases

- Authorized Students list loads.
- Student detail opens.
- Search and filtering work.
- Student edits respect validation.
- Duplicate identity constraints are respected.
- Related Admissions and Enrollments display correctly.
- Student academic history remains intact.
- Fee relationships remain correct.
- Wrong-branch records are protected.
- Unsafe deletion is rejected.

### Important

Student identity across branches must follow the approved data model.

Do not automatically merge students because their names match.

---

## 14. Courses & Batches Regression

### Test Cases

- Courses list loads.
- Authorized course creation works.
- Approved editing works.
- Subjects/Streams remain compatible.
- Batch creation respects current permissions.
- Batch capacity is validated.
- Invalid academic relationships are rejected.
- Enrolled-student counts are correct.
- Referenced academic records are protected from unsafe deletion.
- Branch scope works.

### Concurrency Scenario

Two simultaneous enrollments must not cause a full batch to exceed valid capacity.

---

## 15. Faculty & Classes Regression

### Test Cases

- Faculty list loads.
- Valid Faculty Assignments persist.
- Teacher, Course, Batch and Subject links are correct.
- Existing approved schedule rules work.
- Teacher's own timetable displays accurately.
- Wrong-branch assignments are restricted.
- Historical assignments remain accessible where needed.
- New assignment does not overwrite old salary obligations.

### Payroll Dependency

A faculty assignment may be associated with a salary agreement.

Academic assignment changes must not silently corrupt payroll history.

---

## 16. Fees Regression

### Test Cases

| ID | Test case | Expected behavior |
|---|---|---|
| FEE-QA-001 | View permitted Challans | Correct records |
| FEE-QA-002 | Create valid Challan | Correct payable amount |
| FEE-QA-003 | Duplicate Challan for one Enrollment | Prevented per approved behavior |
| FEE-QA-004 | Record valid partial payment | Outstanding reduced correctly |
| FEE-QA-005 | Record valid full payment | Correct settlement |
| FEE-QA-006 | Payment greater than outstanding | Rejected |
| FEE-QA-007 | Invalid amount | Rejected |
| FEE-QA-008 | Duplicate payment request | No duplicate collection |
| FEE-QA-009 | Unverified payment | Not counted as verified revenue |
| FEE-QA-010 | Generate valid receipt | Correct transaction data |
| FEE-QA-011 | Receptionist collection | Allowed |
| FEE-QA-012 | Unauthorized branch payment | Denied |
| FEE-QA-013 | Fee ledger after payment | Correct outstanding |
| FEE-QA-014 | Finance summary after payment | Consistent verified revenue |

### Critical

Fee Payments must remain authoritative and historically traceable.

Do not correct reporting errors by modifying verified payment history.

---

## 17. Finance Overview Regression

### Test Cases

- Authorized Finance view loads.
- Verified revenue totals are correct.
- Unverified payments are excluded.
- Posted Expenses are counted correctly.
- Payroll Expenses are included once.
- Net financial figure follows approved calculation.
- Date filters work.
- Branch filters work.
- Unauthorized roles are denied.
- Dashboard and Reports agree.

### Acceptance

Financial summaries must reconcile with actual source records.

---

## 18. Expenses Regression

### Test Cases

- Authorized expense list loads.
- Approved expense creation works.
- Invalid amount is rejected.
- Category validation works.
- Correct branch ownership is stored.
- Expense history remains intact.
- Payroll-linked expenses are not duplicated.
- Unauthorized users cannot create expenses.
- Owner permissions match verified frontend behavior.
- Finance totals update after committed expenses.

### Important

Do not introduce unsupported expense reversal or deletion behavior.

---

## 19. Teacher Payroll Regression

**Critical Approved Model:** Assignment-based running salary, not automatically generated monthly payroll.

### Agreement Tests

- Fixed agreement creation.
- Percentage agreement creation.
- Valid assignment reference.
- Correct Teacher relationship.
- Correct branch.
- Historical agreement preservation.

### Running Balance Tests

| ID | Test case | Expected behavior |
|---|---|---|
| PAY-QA-001 | Create valid assignment salary obligation | Correct payable |
| PAY-QA-002 | Create second assignment | Independent obligation |
| PAY-QA-003 | Calendar month changes | No automatic salary generated |
| PAY-QA-004 | Record partial salary payment | Outstanding decreases |
| PAY-QA-005 | Record full salary payment | Correct settlement |
| PAY-QA-006 | Attempt salary overpayment | Rejected |
| PAY-QA-007 | Retry same payment | No duplicate |
| PAY-QA-008 | Concurrent salary disbursement | No overpayment |
| PAY-QA-009 | End assignment with unpaid salary | Balance preserved |
| PAY-QA-010 | Create new salary agreement | Previous history preserved |
| PAY-QA-011 | Salary Payment committed | Matching Posted Expense |
| PAY-QA-012 | Salary Payment fails | No orphaned expense |
| PAY-QA-013 | Teacher views own salary | Allowed |
| PAY-QA-014 | Teacher views another Teacher's salary | Denied |
| PAY-QA-015 | Receptionist opens administrative Payroll | Denied |

### Calculation Source

Before writing fixed numerical assertions, inspect actual frontend salary calculation functions and existing tests.

Do not invent the Percentage formula or rounding behavior.

---

## 20. Teacher My Profile Regression

### Frontend Route

`/my-profile`

### Four Required Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Test Cases

- Teacher profile loads.
- Biography displays correctly.
- Timetable matches assignments.
- Academic Assignments display.
- Fixed/Percentage agreement displays accurately.
- Valid paid total displays accurately.
- Running outstanding displays accurately.
- Verified salary payment history displays.
- Payslip downloads/prints correctly.
- Personal salary notification appears where applicable.
- Teacher cannot access another Teacher's data.
- Non-Teacher access follows verified frontend permissions.

### Cross-Module Verification

Teacher salary totals must agree with administrative Payroll records.

---

## 21. Demo Classes Regression

### Test Cases

- Demo inquiry creation.
- Required fields validation.
- Authorized inquiry edits.
- Approved attendance status.
- No-show behavior.
- Permitted cancellation.
- Correct conversion/prefill to Admission.
- Duplicate conversion prevention.
- Branch-specific inquiry filtering.

### Important

Conversion must not silently create unapproved payments or enrollments.

---

## 22. Physical Assets Regression

The Assets module manages physical equipment and inventory.

### Test Cases

- Asset registration.
- Asset code/identifier validation.
- Asset list filtering.
- Asset assignment.
- Asset unassignment.
- Condition/status changes.
- Inspection history.
- Maintenance history.
- Correct branch ownership.
- Authorized access.

### Excluded

- Cloudinary uploads.
- Digital media galleries.
- Automatic depreciation.
- Unapproved disposal workflows.
- Automatic expense posting from maintenance records.

---

## 23. Reports & Ledgers Regression

### Academic Reports

- Students by class/batch.
- Admissions by status.
- Enrollment counts.
- Faculty assignments.
- Relevant academic summaries.

### Financial Reports

- Verified fee collections.
- Student fee outstanding.
- Operating expenses.
- Assignment-based Payroll obligations.
- Salary payments.
- Outstanding Teacher remuneration.
- Finance Overview totals.

### Security

- Respect role permissions.
- Respect branch access.
- Prevent another Teacher's salary disclosure.
- Prevent Receptionist independent financial-report access where not permitted.

### Export Verification

Verify output content, not only file generation.

---

## 24. Audit Log Regression

### Test Cases

- Important sensitive action creates required audit event.
- Correct actor information.
- Correct branch association.
- Correct resource reference.
- Appropriate action result.
- Authorized Audit Log read.
- Unauthorized Audit Log read denied.
- Ordinary audit editing denied.
- No password or session secret in event data.

### Important

Application error logs and durable business audit records are separate mechanisms.

---

## 25. Branches Regression

### Test Cases

- Authorized branch list.
- Correct branch display.
- Correct branch selection.
- Correct data scope.
- Branch role assignments.
- Existing permitted management actions.
- Protected branch lifecycle rules.

### Confirmed Restriction

**New branch creation remains paused for all roles, including Super Admin.**

Do not mark creation as a required successful test while this restriction is active.

---

## 26. Users Regression

### Test Cases

- Authorized staff list.
- Account creation under approved roles.
- Correct branch assignments.
- Different roles across branches.
- Account activation/deactivation.
- Protected-role restrictions.
- Admin privilege ceiling.
- Session invalidation after important access changes.
- Unsupported same-branch multiple-role combinations fail closed.

### Security

User editing must not permit mass assignment of privileged or protected fields.

---

## 27. Settings Regression

### Test Cases

- Academy identity loads.
- Approved display name update.
- Supported theme settings work.
- Branding remains consistent.
- Correct branch setting ownership.
- Unauthorized Settings modification denied.
- Existing print/report branding remains usable.
- Missing optional settings use safe defaults.

### Restriction

Customization must not alter business rules, Fee amounts or Payroll calculations.

---

# PART C — INTEGRATION AND DATA CONSISTENCY

## 28. Cross-Module Regression Matrix

| Action | Dependent modules to verify |
|---|---|
| Create Admission | Admissions, Students, Dashboard |
| Approve Admission | Admissions, Enrollment eligibility |
| Complete Enrollment | Students, Batches, Admissions, Fees |
| Create Challan | Fees, Student Ledger |
| Verify Fee Payment | Fees, Finance, Dashboard, Reports |
| Create Faculty Assignment | Faculty, Classes, Teacher Profile, Payroll |
| Update Salary Agreement | Payroll, Teacher Profile |
| Record Salary Payment | Payroll, Expenses, Finance, Reports, Teacher Profile |
| Convert Demo Inquiry | Demo Classes, Admissions |
| Update Asset | Assets, Inventory Reports |
| Switch Branch | Auth context, navigation, scoped modules |
| Change Role | Users, permissions, active sessions |
| Change Theme | Settings, shared UI presentation |

A mutation should refresh relevant views only after successful persistence.

---

## 29. Frontend Mock-to-HTTP Regression

### Current Flow

```text id="qa-flow1"
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

```text id="qa-flow2"
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

### Verification Requirements

- Service method compatibility.
- Request mapping.
- Response normalization.
- Error handling.
- Authentication.
- Branch scope.
- Loading state.
- Data refresh.
- Duplicate protection.
- Print/export compatibility.

### Important

Do not assume localStorage demo records have been migrated to MongoDB.

The import strategy must be separately approved.

---

## 30. Data Integrity Regression

Verify:

- Valid Student/Admission relationships.
- Valid Enrollment/Batch relationships.
- One approved Challan per Enrollment.
- Valid Payment/Challan relationships.
- Valid Teacher/Assignment relationships.
- Valid Agreement/Obligation relationships.
- Valid Salary Payment/Expense relationships.
- Proper organization/branch ownership.
- Appropriate unique constraints.

### Historical Data

Updates must not silently destroy prior financial and academic history.

---

## 31. Database Transaction Regression

High-priority transactional workflows include:

- Instant Admission.
- Enrollment and linked Challan.
- Sensitive Fee Payments.
- Salary Payment and linked Expense.
- Approved multi-record role/branch changes.

### Test Scenarios

1. Successful transaction.
2. Validation failure.
3. Mid-transaction failure.
4. Write conflict.
5. Transaction abort.
6. Safe retry.
7. Duplicate submission.
8. Uncertain commit result.

### Acceptance

No unintended orphaned records or duplicate financial transactions.

---

## 32. Concurrency Regression

### Required Scenarios

- Two users enroll the final available batch seat.
- Two fee collectors target the same outstanding amount.
- Two administrators pay the same Salary Obligation.
- Agreement changes during payment processing.
- Branch assignment changes during active sessions.

### Verification

Inspect actual committed database records.

Do not rely exclusively on frontend messages or sequential unit tests.

---

## 33. Financial Reconciliation Regression

### Fees

```text id="qa-fees"
Approved Challan Payable
          -
Valid Applied Verified Payments
          =
Outstanding Fee Balance
```

### Payroll

```text id="qa-pay"
Approved Assignment Payable
          -
Valid Applied Salary Payments
          =
Outstanding Running Balance
```

### Finance

Financial summaries must use the applicable authoritative verified revenue and posted expense data.

### Note

The conceptual equations must follow finalized business rules, agreement revisions and monetary precision.

A reconciliation mismatch is a defect requiring investigation, not silent adjustment.

---

## 34. Cache and Data Refresh Regression

### Verify After Mutations

- Updated Admission status.
- Current Batch occupancy.
- Correct Student ledger.
- Updated fee outstanding.
- Current Finance totals.
- Updated Teacher Payroll balance.
- Updated Teacher My Profile.
- Updated Reports.
- Correct branch context.

### Race Conditions

A delayed response from an old branch must not overwrite a newly selected branch's data.

A cached fee or salary balance must not independently authorize another payment.

---

# PART D — NON-FUNCTIONAL QA

## 35. Performance Regression

### Candidate Performance Checks

- Student list pagination.
- Admission search.
- Batch occupancy query.
- Fee ledger loading.
- Finance aggregation.
- Payroll history.
- Teacher Profile load.
- Branch switching.
- Authorized cross-branch reports.

### Measurements

- API latency.
- Database query count.
- Query execution time.
- Memory usage.
- Error rate.
- Concurrency correctness.

Performance targets remain TBD until actual workload and hosting requirements are established.

---

## 36. Accessibility and Responsive QA

Review existing frontend interfaces for:

- Desktop layouts.
- Smaller screens.
- Table overflow.
- Form readability.
- Focus states.
- Dialog behavior.
- Clear validation messages.
- Theme contrast.
- Print-friendly output.

Do not redesign approved frontend screens during backend integration unless required by an approved issue.

---

## 37. Browser Compatibility QA

Test relevant current supported browsers according to actual client requirements.

### Critical Workflows

- Login.
- Branch selection.
- Form submissions.
- Data tables.
- Printing.
- Downloads.
- Session cookies.
- Protected routes.

The official supported-browser matrix remains TBD.

---

## 38. Error Handling QA

Verify:

- Validation errors are understandable.
- Authentication failures redirect or respond appropriately.
- Permission denials are clear and safe.
- Missing records are handled.
- Duplicate requests produce correct outcomes.
- Database outages do not produce false success.
- Financial failures preserve historical data.
- Sensitive server errors do not expose stack traces.

---

## 39. Security Regression

### Test Areas

- Credential handling.
- Session expiration.
- Session revocation.
- CSRF.
- CORS.
- Input validation.
- MongoDB injection prevention.
- Mass assignment.
- Role escalation.
- Cross-branch access.
- Record ownership.
- Protected exports.
- Teacher salary confidentiality.

### Critical Rule

A visual frontend test is not a substitute for direct backend security testing.

---

## 40. Backup and Recovery QA

Verify according to the actual implemented backup environment:

- Backup availability.
- Restore feasibility.
- Database schema compatibility.
- Academic relationship integrity.
- Fee reconciliation.
- Payroll reconciliation.
- Role/branch security after restoration.
- Valid transactions after recovery point are appropriately accounted for.

Do not run destructive restore tests against production.

---

# PART E — QA OPERATIONS AND RELEASE MANAGEMENT

## 41. Test Execution Workflow

```text id="qa-workflow"
Approved Feature or Fix
         |
         v
Identify Affected Modules
         |
         v
Select Relevant Regression Cases
         |
         v
Prepare Isolated Test Data
         |
         v
Execute Tests
         |
         v
Record Actual Results
         |
         v
Investigate Failures
         |
         v
Retest Corrected Behavior
         |
         v
Technical Review
         |
         v
Owner Acceptance When Applicable
```

### Efficiency Rule

Start with targeted tests.

Expand the suite when shared logic, security, database relationships or several modules are affected.

---

## 42. Regression Scope by Change Type

| Change type | Minimum relevant QA |
|---|---|
| UI-only styling change | Component, responsive and relevant workflow |
| Admission logic change | Admissions, Students, Enrollment |
| Enrollment change | Admissions, Students, Batches, Fees |
| Fee calculation change | Fees, Finance, Dashboard, Reports |
| Payroll calculation change | Payroll, Teacher Profile, Expenses, Finance, Reports |
| Role permission change | Auth, affected modules, branch isolation |
| Branch context change | All affected scoped modules |
| MongoDB schema change | Migration, relationships, APIs, affected frontend |
| API contract change | Contract tests and affected frontend services |
| Session change | Authentication, cookies, CSRF, permissions |
| Shared reporting change | Relevant Dashboards, Ledgers and Exports |
| Deployment change | Build, health, authentication and smoke tests |

This matrix defines minimum impact-based review, not an exhaustive substitute for engineering judgment.

---

## 43. Test Case Template

Each formal test should contain:

**Test ID:** Unique identifier
**Module:** Feature being tested
**Type:** Unit / Integration / API / UI / Security / Regression
**Priority:** Critical / High / Medium / Low
**Prerequisites:** Required state
**Role:** Acting staff role
**Branch:** Authorized branch context
**Test Data:** Safe fixture identifiers
**Steps:** Reproducible actions
**Expected Result:** Approved outcome
**Actual Result:** Observed result
**Status:** Executed status
**Evidence:** Safe test/log reference
**Notes:** Relevant limitations

Do not populate Actual Result with an assumed successful outcome.

---

## 44. Defect Severity

| Severity | Description | Example |
|---|---|---|
| Critical | Security exposure, serious data corruption or financial integrity failure | Other Teacher's salary exposed |
| High | Important workflow blocked | Fee payment cannot be committed |
| Medium | Incorrect secondary workflow with limited impact | Report filter incorrect |
| Low | Cosmetic or minor presentation issue | Nonessential spacing problem |

Severity should reflect actual business impact.

---

## 45. Defect Reporting Format

For each confirmed defect, record:

- Defect ID.
- Title.
- Affected module.
- Environment.
- User role.
- Active branch.
- Reproduction steps.
- Expected result.
- Actual result.
- Impact.
- Relevant safe evidence.
- Status.
- Fix reference.
- Retest result.

Never include passwords, session tokens or confidential student/teacher financial records in public defect reports.

---

## 46. Retesting After Fixes

A defect is not resolved merely because source code changed.

### Required Retesting

1. Reproduce or confirm original failure evidence.
2. Apply the authorized correction.
3. Execute the targeted test.
4. Verify expected behavior.
5. Test relevant adjacent workflows.
6. Review security and financial side effects.
7. Record actual results.

Where feasible, add a regression test that protects against the original bug recurring.

---

## 47. Continuous Integration QA

The existing repository CI configuration must be inspected before modification.

### Candidate Checks

- Frontend tests.
- Backend unit tests.
- API contract tests.
- MongoDB integration tests.
- Security-sensitive tests.
- Build verification.
- Appropriate static checks.

### Requirements

- Use actual package scripts.
- Respect `Client/` and `Server/`.
- Keep secrets protected.
- Use isolated databases.
- Fail required checks on genuine errors.
- Do not report CI success unless verified.

---

## 48. Release Smoke Testing

After approved deployment, verify:

| Area | Smoke test |
|---|---|
| Frontend | Application loads |
| API | Required backend available |
| Database | Connectivity and readiness |
| Authentication | Login/logout |
| Permissions | Protected actions enforce role |
| Branches | Authorized switching |
| Admissions | Relevant safe workflow |
| Fees | Authorized record access and safe operation |
| Payroll | Correct running obligation view |
| Teacher Profile | Own salary and timetable |
| Finance | Correct authorized summary |
| Reports | Scoped report generation |
| Settings | Branding loads |

Do not perform uncontrolled real financial payments simply to run a production smoke test.

---

## 49. Release Quality Gates

A release candidate should satisfy:

1. Required build checks.
2. Relevant functional tests.
3. Authentication verification.
4. Role and branch authorization tests.
5. Financial data-integrity tests.
6. MongoDB transaction tests.
7. Required frontend regressions.
8. Protected export tests.
9. Deployment environment checks.
10. Safe recovery preparation.

### Critical Release Blockers

Examples include:

- Confirmed unauthorized salary access.
- Cross-branch data disclosure.
- Duplicate financial posting.
- Broken payment reconciliation.
- Incorrect automatic monthly salary generation.
- Critical database corruption.
- Missing required authentication protection.

Do not waive a critical blocker silently.

---

## 50. Client User Acceptance Testing

Client evaluation should use realistic approved scenarios.

### UAT Categories

- Staff login and branch selection.
- Receptionist Admissions.
- Receptionist Fees.
- Student Enrollment.
- Faculty Assignments.
- Teacher My Profile.
- Owner/Admin authorized views.
- Running Teacher Payroll.
- Finance reports.
- Academy branding.

### Recording Feedback

Document:

- Scenario tested.
- Expected business behavior.
- Observed result.
- Client feedback.
- Confirmed defect.
- Requested change.
- Approval decision.

A requested new feature must not automatically be treated as an existing-system defect.

---

## 51. QA Completion Report

After an actual test session, report:

- Scope tested.
- Environment.
- Relevant code revision.
- Tests executed.
- Passed tests.
- Failed tests.
- Blocked/skipped tests.
- Critical defects.
- Remaining risks.
- Release recommendation based on evidence.

### Example Status Language

**Testing Completed:** Only when the stated suite actually ran.

**Pending:** Tests not yet executed.

**Blocked:** Specific missing dependency.

**Owner Accepted:** Only when explicit client/owner approval exists.

---

## 52. QA Checklist

### Functional

- [ ] All affected approved workflows tested.
- [ ] Required field validation verified.
- [ ] Status transitions verified.
- [ ] Related module behavior verified.

### Security

- [ ] Five-role permissions tested.
- [ ] Branch isolation tested.
- [ ] Record ownership tested.
- [ ] Privilege escalation denied.
- [ ] Teacher salary privacy verified.

### Financial

- [ ] Verified collection totals reconciled.
- [ ] Fee outstanding reconciled.
- [ ] Assignment Payroll calculated correctly.
- [ ] No automatic monthly payroll.
- [ ] Salary payment/expense linkage verified.
- [ ] Duplicate and concurrency protection tested.

### Integration

- [ ] API contracts verified.
- [ ] MongoDB relationships verified.
- [ ] Frontend adapter behavior verified.
- [ ] Cache invalidation verified.
- [ ] Exports checked.

### Release

- [ ] Build passes.
- [ ] Relevant automated tests pass.
- [ ] Smoke tests pass.
- [ ] Known critical defects resolved.
- [ ] Deployment/recovery readiness reviewed.
- [ ] Test results documented.

Unchecked items indicate pending verification.

---

## 53. Open QA Decisions

The following remain TBD:

- Final automated test framework for backend.
- End-to-end browser testing tool.
- Actual supported browser matrix.
- Formal test data management policy.
- Code coverage thresholds.
- Performance targets.
- Production smoke-test scope.
- Client UAT approval procedure.
- CI test selection and execution policy.
- Formal release sign-off process.

Do not invent approved values.

---

## 54. Explicitly Deferred Testing

The initial release does not automatically require tests for:

- Platform Admin.
- Multi-academy SaaS provisioning.
- Subscription/license management.
- Electron desktop.
- Offline/LAN synchronization.
- Cloudinary/media uploads.
- Automatic monthly Teacher Payroll.
- Unapproved refunds or payment reversals.
- Arbitrary user-defined permissions.
- Unimplemented external integrations.

These test suites become applicable only when the corresponding features are approved and implemented.

---

## 55. Related Documentation

This specification must remain consistent with:

- `AGENTS.md` — Agent instructions.
- `RULES.md` — Engineering rules.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `SECURITY.md` — Security requirements.
- `AUTHENTICATION_AND_SECURITY.md` — Sessions and access.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization/branch scope.
- `BUSINESS_RULES.md` — Domain invariants.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Migration safety.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `DATA_FLOW.md` — Module data flows.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial atomicity.
- `CACHING_AND_PERFORMANCE.md` — Cache and query behavior.
- `FRONTEND_INTEGRATION.md` — Frontend service contracts.
- `FRONTEND_AUDIT.md` — Existing frontend evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Implementation handoff.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Backend roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Backend test design.
- `DEPLOYMENT.md` — Release procedures.
- `BACKUP_AND_RECOVERY.md` — Restore procedures.
- `LOGGING_AND_MONITORING.md` — Operational diagnostics.
- `DEBUGGING.md` — Root-cause investigation.
- `BACKEND_GAPS_AND_RISKS.md` — Unresolved risks.
- `TASKS.md` — Development tracking.
- `PROGRESS.md` — Verified progress.

Use actual repository locations for relative Markdown links.

---

## 56. Final QA Boundary

### Confirmed Requirements

- Existing React/Vite frontend behavior.
- Five application roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Current branch creation pause.
- Preservation of academic and financial records.
- Physical Assets without media upload infrastructure.

### Proposed QA Coverage

- Module-wise regression.
- Role and branch security.
- API contract testing.
- MongoDB integration.
- Financial reconciliation.
- Concurrency and idempotency.
- Frontend/backend compatibility.
- Release smoke tests.
- Client acceptance scenarios.

### Deferred

- Multi-client SaaS QA.
- Electron/offline QA.
- Media-upload testing.
- Unapproved financial workflow testing.
- Enterprise distributed infrastructure testing.

### Not Verified by This Document

- Execution of the defined test cases.
- Completed backend test implementation.
- Production end-to-end results.
- Formal release sign-off.
- Client UAT acceptance.

**Governing Principle:** Every TSA Academy ERP change must be verified against existing approved workflows, authentication and branch boundaries, financial integrity and affected module dependencies before the change can be accepted.

**Document Status:** DRAFT — Ready for repository-specific QA execution planning and later verified test results.
