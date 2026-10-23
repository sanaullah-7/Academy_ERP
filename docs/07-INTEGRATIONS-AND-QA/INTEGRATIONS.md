# INTEGRATIONS

<!-- >Is document mein TSA Academy ERP ke React frontend aur Express backend integration, MongoDB connectivity, internal module dependencies, API contracts, authentication, branch isolation, Fees, Teacher Payroll, third-party services aur future integrations ke complete rules hain.. -->

# TSA Academy ERP — System Integrations & Service Interoperability Specification

**Document:** INTEGRATIONS.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Integration Architecture Proposed; Live Integrations Not Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** Single Academy Organization with Multiple Branches
**Document Category:** Integrations & Quality Assurance

---

## 1. Purpose

This document defines the integration architecture, interoperability standards and security requirements for TSA Academy ERP.

Its primary objective is to ensure that application components exchange data consistently, securely and reliably while preserving existing approved business workflows.

The specification covers:

- React frontend and Express backend integration.
- Domain-service and HTTP-adapter boundaries.
- API request and response contracts.
- Authentication and session integration.
- Organization and branch context.
- MongoDB persistence integration.
- Cross-module data relationships.
- Admissions and Enrollment integration.
- Student Fees and Finance.
- Faculty Assignments and Teacher Payroll.
- Payroll Payments and Expenses.
- Teacher My Profile.
- Dashboard and Reports.
- Notifications and Audit Log.
- Printing and exports.
- Third-party integration governance.
- Error handling, testing and operational monitoring.

**Implementation boundary:** This is a design specification. It does not authorize implementing APIs, installing SDKs, connecting external accounts, importing data or deploying services.

---

## 2. Integration Principles

### INT-001 — Preserve Existing Frontend Behavior

Integration must reproduce approved frontend workflows without unnecessary redesign.

### INT-002 — Explicit Service Contracts

Every integration must use defined inputs, outputs, errors and ownership rules.

### INT-003 — Server-Side Security

Protected data access must be authenticated and authorized by the backend.

### INT-004 — Branch-Aware Data Exchange

Organization and branch ownership must remain correct across integration boundaries.

### INT-005 — Financial Source Integrity

Fees, salary payments and expenses must be based on authoritative persisted records.

### INT-006 — No Duplicate Business Effects

Retries and concurrent requests must not create unintended duplicate transactions.

### INT-007 — Failure Transparency

An integration failure must not be reported as a completed financial or academic operation.

### INT-008 — Minimal External Dependencies

Introduce only third-party services that solve an approved requirement.

### INT-009 — Secure Configuration

External credentials and private connection details must remain on authorized backend infrastructure.

### INT-010 — Verified Compatibility

Integration completion requires actual testing, not merely connected service endpoints.

---

## 3. System Integration Overview

### Current Frontend Flow

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

### Target Integrated Flow

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
Express REST API
    |
    v
Authentication + Authorization
    |
    v
Domain Service
    |
    v
Mongoose Repository
    |
    v
MongoDB
```

### Important

The backend must not be described as integrated until actual HTTP requests, authentication, persistence and related workflows have been verified.

Existing localStorage records are not automatically shared with MongoDB.

---

## 4. Integration Scope Classification

Integrations fall into four categories.

| Category | Description | Initial status |
|---|---|---|
| Frontend/Backend | React services communicating with Express APIs | Planned |
| Internal Domain | Relationships between ERP modules | Required |
| Infrastructure | MongoDB, hosting, logging and backups | Planned according to environment |
| External Services | Email, SMS, payment gateways, cloud storage and other APIs | Deferred unless separately approved |

The term integration does not automatically mean a third-party service is required.

Most initial integration work concerns the existing frontend and planned backend.

---

## 5. Current Application Modules

The ERP contains 16 principal frontend modules:

1. Dashboard.
2. Admissions.
3. Students.
4. Courses & Batches.
5. Faculty & Classes.
6. Fees.
7. Finance Overview.
8. Expenses.
9. Teacher Payroll.
10. Demo Classes.
11. Assets.
12. Reports & Ledgers.
13. Audit Log.
14. Branches.
15. Users.
16. Settings.

Shared functionality includes:

- Login and logout.
- Authenticated user context.
- Branch selection.
- Academy branding and themes.
- Teacher My Profile.
- Notifications.
- Printing and exports.

Every backend integration must account for relevant connections between these features.

---

## 6. Source-of-Truth Policy

### Before Backend Integration

The frontend mock database is the effective persistence source for its own browser-local demonstration.

### After Backend Integration

MongoDB-backed application services become authoritative for integrated operational modules.

### Requirements

- Do not mix mock and live financial totals in a single authoritative report.
- Do not silently synchronize localStorage into MongoDB.
- Do not claim one user's browser-local records are available to other users.
- Do not use frontend-calculated balances to authorize financial writes.
- Do not duplicate business records across independent integrations.
- Document which modules are mock-backed and which are backend-backed during transition.

### Migration

Any import of browser-local records requires a separately approved strategy under `DATABASE_MIGRATIONS.md`.

---

## 7. Frontend Domain-Service Integration

The existing frontend domain services should remain the primary application-level interface where practical.

### Recommended Direction

```text
React Components
       |
       v
Existing Domain Services
       |
       v
Adapter Interface
       |
       +--> Mock Adapter
       |
       +--> HTTP Adapter
```

### Requirements

- Inspect actual existing service methods.
- Preserve method signatures where feasible.
- Map HTTP responses into frontend-compatible structures.
- Preserve error feedback.
- Maintain role and branch context.
- Avoid duplicating domain calculations.
- Prevent mock fallback for production financial writes.

### Important

Do not invent service method names without examining the repository.

---

## 8. HTTP API Integration

The backend API design follows the proposed REST architecture documented in `API.md` and `API_CONTRACTS.md`.

### Proposed Base Path

`/api/v1`

The final path and response envelope remain subject to contract approval.

### Required Contract Elements

Every integrated operation must define:

- HTTP method.
- Endpoint.
- Authentication requirement.
- Authorized roles/actions.
- Organization/branch scope.
- Request fields.
- Response fields.
- Validation rules.
- Error responses.
- Idempotency requirements.
- Related persistence effects.

### Compatibility

The HTTP adapter should handle technical representation differences without changing approved frontend behavior.

---

## 9. API Client Design

The frontend should use a consistent API communication layer.

### Responsibilities

- Configured API base URL.
- Appropriate session credentials.
- Request serialization.
- Response normalization.
- Safe error handling.
- Abort/cancellation support where relevant.
- Auth/session expiration handling.
- Branch-context awareness.

### Restrictions

- Do not embed backend secrets.
- Do not trust frontend permission checks as authority.
- Do not automatically retry unsafe financial writes.
- Do not add multiple competing HTTP clients without justification.

The exact library or native browser API choice must follow current frontend architecture.

---

## 10. Authentication Integration

### Required Flow

```text
Login Form
    |
    v
Authentication API
    |
    v
Credential Verification
    |
    v
Secure Session
    |
    v
Authorized Branch Memberships
    |
    v
Effective Role Resolution
    |
    v
Authenticated Frontend Context
```

### Requirements

- Use backend-verified identity.
- Reject disabled users.
- Support secure logout.
- Handle expired/revoked sessions.
- Load authorized branch assignments.
- Never trust browser-supplied roles as final authority.
- Refresh permissions after relevant account changes.

### Current Roles

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher.

---

## 11. Role-Based Access Integration

The backend must enforce the current five-role permission model.

### Receptionist

**Confirmed:** Full approved Admissions and Fees access.

Receptionist does not receive independent access to:

- Finance.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branches.
- Users.
- Settings.

### Teacher

Teacher can view own:

- My Profile.
- Class Schedule.
- Academic Assignments.
- Salary Agreements.
- Verified Salary Payments.
- Outstanding Salary.
- Payslips.
- Notifications.

Teacher cannot view another Teacher's confidential compensation.

### Admin

Cannot perform unauthorized privileged-account changes or role escalation.

### Owner

Uses approved action-level management and financial permissions.

### Super Admin

Remains subject to branch and business restrictions, including the branch-creation pause.

---

## 12. Organization and Branch Integration

The initial system serves one academy organization with multiple branches.

### Requirements

1. Authenticate the user.
2. Load permitted branch memberships.
3. Validate selected branch.
4. Resolve effective role.
5. Apply action permissions.
6. Enforce record ownership.
7. Return scoped records only.

### Different Branch Roles

One staff user may be a Teacher in Branch 1 and Receptionist in Branch 2.

### Same-Branch Multiple Roles

Unsupported same-branch combinations fail closed until final approval.

### Branch Creation

New branch creation is paused for every current role.

### Cross-Branch Reporting

An authorized all-branches report must not implicitly grant cross-branch mutations.

---

## 13. Branch Switching Integration

### Expected Flow

```text
User Selects Another Branch
           |
           v
Validate Branch Membership
           |
           v
Resolve New Effective Role
           |
           v
Update Auth / Branch Context
           |
           v
Invalidate Previous Branch Data
           |
           v
Load Authorized New Branch Views
```

### Requirements

- Avoid stale branch records.
- Reject unauthorized branch selection.
- Prevent delayed previous-branch responses from overwriting current data.
- Refresh navigation and permissions.
- Keep backend authorization independent of frontend state.

---

# PART A — INTERNAL DOMAIN INTEGRATIONS

## 14. Students and Admissions

Admissions may create or link Student records.

### Required Relationships

- Student identity.
- Admission identity.
- Academy/Branch ownership.
- Selected Course.
- Selected Batch, where applicable.
- Approved Admission status.

### Rules

- Validate all references.
- Prevent unintended duplicates.
- Preserve historical relationships.
- Respect authorized Admissions access.
- Do not perform unsafe deletion when dependent records exist.

### Current Status Lifecycle

Pending and Approved, including the approved return to Pending.

The historical Reject workflow is superseded.

---

## 15. Admissions and Enrollment

Enrollment connects an approved/eligible Admission and Student to academic delivery.

### Required Integrations

- Admissions.
- Students.
- Courses.
- Batches.
- Enrollment.
- Fees.

### Requirements

- Valid Admission state.
- Valid Student relationship.
- Compatible Course/Batch.
- Branch ownership.
- Capacity.
- Duplicate protection.
- Transaction integrity.

### Failure Behavior

A failed required enrollment step must not leave an unintended partially completed operation.

---

## 16. Instant Admission Integration

The approved instant-admission workflow may coordinate:

1. Student.
2. Admission.
3. Enrollment.
4. Challan.
5. Optional Verified Fee Payment.

### Requirements

- Define all required operations.
- Validate source inputs.
- Use transaction-safe related writes.
- Protect capacity.
- Prevent duplicate requests.
- Preserve correct references.
- Return success only after required commit.

### Important

Optional payment behavior must match actual approved frontend flows.

Do not automatically verify a payment that has not been validly recorded and verified.

---

## 17. Enrollment and Challans

### Integration Flow

```text
Valid Enrollment
       |
       v
Approved Fee Calculation
       |
       v
Challan
       |
       v
Student Fee Ledger
```

### Requirements

- Correct Enrollment reference.
- Correct Student.
- Correct Branch.
- Correct payable amount.
- Approved one-challan-per-enrollment behavior.
- No duplicate fee obligations.
- Historical integrity.

### Restriction

Do not introduce automatic recurring monthly Challans without separate approval.

---

## 18. Challans and Fee Payments

### Integration Flow

```text
Challan
   |
   v
Approved Payment Operation
   |
   v
Verified Payment Record
   |
   v
Updated Fee Outstanding
```

### Requirements

- Validate amount.
- Validate payer/challan relationship.
- Verify branch scope.
- Prevent overpayment.
- Prevent duplicate requests.
- Preserve partial payments.
- Apply verified status consistently.
- Generate receipts from authoritative data.

### Financial Rule

Only eligible verified payments count as collected revenue.

---

## 19. Fees and Finance Integration

A successful verified student fee collection affects multiple modules.

```text
Verified Fee Payment
          |
          +--> Student Fee Ledger
          |
          +--> Finance Overview
          |
          +--> Dashboard
          |
          +--> Reports & Ledgers
```

### Requirements

- Count each verified payment once.
- Exclude unverified payments from confirmed revenue.
- Preserve branch filters.
- Maintain exact monetary calculations.
- Refresh dependent views after commit.
- Do not modify source payments when summary queries are incorrect.

---

## 20. Faculty and Academic Assignments

Faculty Assignments connect:

- Teacher.
- Branch.
- Course.
- Batch.
- Subject.
- Applicable schedule.
- Approved salary agreement relationship.

### Requirements

- Validate each academic reference.
- Ensure correct Teacher association.
- Preserve relevant assignment history.
- Enforce branch scope.
- Support Teacher My Profile.
- Avoid overwriting historical Payroll relationships.

---

## 21. Faculty Assignments and Teacher Payroll

**Confirmed owner-approved model:** Salary belongs to an approved teaching assignment, batch and subject.

### Integration Flow

```text
Faculty Assignment
         |
         v
Salary Agreement
         |
         v
Assignment-Specific Payable
         |
         v
Running Outstanding Balance
```

### Critical Requirements

- Independent obligations per assignment.
- Correct Fixed/Percentage calculations.
- Historical agreement preservation.
- Partial/full payments.
- No automatically generated monthly salary.
- No unrelated assignment merging.

### Formula Verification

Before implementing calculations, inspect actual relevant frontend code and tests.

Candidate source files include:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Confirm their real paths and calculation rules.

---

## 22. Payroll Payments and Expenses

A successful Teacher salary payment must correspond to its approved posted financial expense.

### Integration Flow

```text
Salary Obligation
       |
       v
Authorized Salary Payment
       |
       +--> Running Balance Updated
       |
       +--> Linked Posted Expense
       |
       +--> Finance Overview
       |
       +--> Reports
       |
       +--> Teacher My Profile
```

### Requirements

- One correct Salary Payment.
- One correct linked Posted Expense.
- Correct Teacher/Assignment reference.
- Correct Branch.
- Matching amount.
- Atomic persistence where required.
- No duplicate expense.
- No overpayment.
- Accurate outstanding balance.

### Failure Behavior

If the required salary/expense transaction fails, do not report salary payment success.

A successful notification must not be sent for an operation that did not commit.

---

## 23. Teacher My Profile Integration

### Route

`/my-profile`

### Four Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Data Sources

The backend should derive Teacher self-service information from the same authoritative domain records used by:

- Staff profile.
- Faculty Assignments.
- Timetable.
- Salary Agreements.
- Payroll Obligations.
- Salary Payments.
- Notifications.

### Security

Teacher identity must come from the authenticated session.

A submitted Teacher identifier cannot authorize viewing another Teacher's data.

### Consistency

Teacher compensation must match the relevant administrative Payroll records.

---

## 24. Expenses and Finance Integration

Operating Expenses and posted salary Expenses contribute to approved Finance calculations.

### Requirements

- Correct category.
- Correct branch.
- Correct posting state.
- Correct amount.
- Correct payroll source linkage.
- No duplicate counting.
- Approved role permissions.

### Important

Do not create automatic maintenance expenses from physical Assets without approval.

Do not invent unsupported reversal or refund workflows.

---

## 25. Dashboard Integration

The Dashboard displays approved summary projections.

### Possible Data Sources

- Students.
- Admissions.
- Enrollments.
- Batches.
- Verified Fee Payments.
- Posted Expenses.
- Faculty Assignments.
- Relevant Payroll balances.

### Requirements

- Role-aware data selection.
- Branch-aware filtering.
- Correct financial calculations.
- Safe projections.
- Efficient reads.
- Relevant cache invalidation.

Dashboard figures must not replace authoritative records.

---

## 26. Reports and Ledgers Integration

Reports aggregate domain records.

### Academic Reporting

- Student and Admission records.
- Enrollment.
- Batch occupancy.
- Faculty Assignments.
- Academic schedules.

### Financial Reporting

- Approved Challan payable amounts.
- Verified Fee Payments.
- Outstanding student Fees.
- Posted Expenses.
- Assignment-based salary payable.
- Salary Payments.
- Payroll outstanding.

### Security Requirements

- Apply role permissions.
- Apply organization/branch scope.
- Protect Teacher compensation.
- Restrict confidential exports.
- Prevent duplicate aggregation counts.

---

## 27. Demo Classes and Admissions

Demo Classes may lead to an Admission workflow.

### Requirements

- Preserve approved inquiry status.
- Support existing prefill/conversion behavior.
- Link converted inquiry to Admission.
- Prevent duplicate conversion.
- Verify branch ownership.
- Avoid unapproved automatic Enrollment or payment.

The exact conversion UX must be verified against current frontend source.

---

## 28. Physical Assets Integration

The Assets module manages academy physical inventory.

### Integration Relationships

- Branch.
- Asset.
- Staff assignment.
- Inspection event.
- Maintenance event.
- Inventory reports.

### Requirements

- Preserve physical asset history.
- Enforce branch ownership.
- Validate staff references.
- Respect approved permissions.
- Do not automatically post Expenses from maintenance unless separately approved.

### Explicit Exclusion

Cloudinary and general digital-media uploads are outside the current scope.

---

## 29. Audit Log Integration

Business Audit events should be associated with important committed operations.

### Candidate Events

- Admission approval.
- Enrollment.
- Verified Fee Payment.
- Salary Agreement change.
- Payroll disbursement.
- Expense posting.
- Role/Branch assignment change.
- Approved Settings update.

### Requirements

- Correct actor identity.
- Correct organization and branch.
- Correct resource.
- Correct action.
- Accurate committed outcome.
- Restricted audit access.
- No exposed passwords or session secrets.

Application diagnostic logs are distinct from durable business Audit records.

---

## 30. Notification Integration

Notifications may respond to committed business events.

### Current Relevant Example

Teacher salary-payment notifications.

### Requirements

- Correct recipient.
- Correct committed transaction.
- No duplicate financial effects.
- No confidential cross-user disclosure.
- Safe handling of delivery or persistence failure.
- Appropriate notification history.

### Important

Notifications must not become the authoritative evidence that a financial payment succeeded.

The underlying committed Salary Payment remains authoritative.

---

## 31. Settings and Branding Integration

Academy Settings may affect:

- Academy display name.
- Logo reference.
- Theme colors.
- Approved branch information.
- Document headers.

### Requirements

- Centralize configuration.
- Enforce Settings permissions.
- Validate edited fields.
- Refresh frontend contexts.
- Preserve defaults.
- Avoid altering business rules.

### Restriction

Changing branding cannot modify Fees, Payroll formulas, roles or branch ownership.

---

# PART B — INFRASTRUCTURE INTEGRATIONS

## 32. Express and MongoDB Integration

The backend uses Mongoose for MongoDB access.

### Requirements

- Secure connection handling.
- Validated environment configuration.
- Appropriate indexes.
- Scoped repositories.
- Correct references.
- Transaction support.
- Graceful connection failure.
- Safe shutdown.

### Security

MongoDB credentials remain backend-only.

Frontend components must never connect directly to MongoDB.

---

## 33. Session Integration

The final production authentication mechanism must be approved.

The proposed direction uses secure server-managed sessions.

### Requirements

- Trusted account identity.
- Secure session storage.
- Appropriate cookie flags.
- Session expiration.
- Logout/revocation.
- Branch membership updates.
- Permission changes.

### Cross-Origin Considerations

Frontend and API hosting may require correctly configured:

- CORS.
- Secure cookies.
- SameSite.
- CSRF protection.
- Credentialed browser requests.

The final deployment-specific configuration remains TBD.

---

## 34. Hosting Integration

### Frontend

The preferred initial direction is Vercel.

### Backend

A suitable approved Node.js hosting provider.

### Database

MongoDB Atlas or another appropriate approved deployment.

### Requirements

- HTTPS.
- Environment separation.
- Secure secrets.
- Correct API base URL.
- Health/readiness.
- Logging.
- Backup preparation.

The exact providers and live deployment status must be verified.

---

## 35. CI/CD Integration

The repository already has a CI history.

### Requirements

- Inspect existing workflows.
- Use actual package scripts.
- Run relevant tests.
- Protect CI secrets.
- Avoid destructive database operations.
- Keep deployment approval explicit.
- Preserve release traceability.

### Important

CI configuration existing does not mean all tests pass or production deployment is active.

---

## 36. Printing and Export Integration

The frontend supports approved document outputs.

### Possible Formats

- Browser print views.
- PDF where implemented.
- CSV where implemented.
- Other existing approved exports.

### Requirements

- Verify actual format support.
- Enforce export permissions.
- Use authoritative data.
- Preserve branch scope.
- Protect confidential salary documents.
- Prevent duplicate financial amounts.
- Maintain readable academy branding.

### Security

Generating or downloading a document must not bypass the restrictions applied to normal API reads.

---

# PART C — THIRD-PARTY INTEGRATION GOVERNANCE

## 37. External Integration Policy

External service integrations must be justified and approved individually.

### Examples of Potential Future Services

- Email delivery.
- SMS notifications.
- Payment gateways.
- External accounting.
- Attendance devices.
- Cloud file storage.
- Analytics services.

These are potential future categories, not current authorized integrations.

### Approval Requirements

Each proposed integration must define:

1. Business purpose.
2. Data exchanged.
3. Authorized users.
4. External provider.
5. Security implications.
6. Credentials required.
7. Costs.
8. Failure behavior.
9. Data retention.
10. Testing and operational responsibilities.

No external service should be connected solely because an SDK exists.

---

## 38. External Email Integration

Email delivery is optional unless explicitly approved.

### Potential Uses

- Account recovery.
- Staff notifications.
- Operational alerts.
- Approved student communication.

### Required Design Decisions

- Provider.
- Sender identity.
- Message templates.
- Recipient authorization.
- Delivery failure handling.
- Data protection.
- Rate limiting.

### Current Status

Deferred/TBD.

Do not automatically connect personal Gmail or another account as the system's production email service.

---

## 39. SMS and Messaging Integration

Potential messaging integrations require separate approval.

### Concerns

- Recipient consent.
- Message costs.
- Personal data.
- Delivery status.
- Retry policy.
- Rate limits.
- Provider credentials.

### Restrictions

- Do not automatically send fee or salary messages.
- Do not expose Teacher remuneration to unauthorized recipients.
- Do not implement messaging based solely on frontend UI assumptions.

### Current Status

Deferred.

---

## 40. Payment Gateway Integration

The existing Fees workflow concerns approved internal fee records and verification.

A payment gateway is not automatically required.

### Future Requirements

If approved:

- Payment provider contract.
- Gateway transaction identity.
- Server-side verification.
- Idempotency.
- Webhook authentication.
- Reconciliation.
- Refund governance.
- Failure recovery.

### Important

A frontend payment confirmation must not be trusted as proof that funds were received.

### Current Status

Deferred until an explicit payment gateway requirement is approved.

---

## 41. External Accounting Integration

An external accounting service may be considered in the future.

### Required Safeguards

- Approved chart/account mapping.
- Correct verified revenue.
- Correct posted expenses.
- No duplicated Payroll Expense.
- Stable transaction references.
- Reconciliation reports.
- Authorized data access.

### Current Status

Deferred.

TSA Academy ERP's Finance module remains the current internal financial reporting source.

---

## 42. File and Cloud Storage Integration

Cloudinary and general media uploads are not approved for the initial product.

### Existing Assets Meaning

**Assets = Physical academy equipment inventory.**

The module must not be reinterpreted as digital media storage.

### Potential Future Integration

Any separately approved cloud file storage must define:

- Approved file types.
- Access control.
- File size limits.
- Malware/content safety.
- Storage lifecycle.
- Confidential document access.
- Deletion/retention.

### Current Status

Deferred.

---

## 43. MCP and Developer Tool Connections

Developer-facing external tool connections must remain separate from the ERP's runtime integrations.

### Examples

- GitHub development tools.
- Design tools.
- Documentation tools.
- Database administration tools.
- Other approved MCP-based development connections.

### Principles

- Tool connectivity does not authorize code changes.
- Tool connectivity does not authorize data imports.
- Tool connectivity does not authorize production deployment.
- Use least-privilege credentials.
- Keep account-specific secrets protected.
- Preserve repository and business boundaries.

Detailed developer-tool connection governance belongs to `MCP_CONNECTIONS.md`.

---

# PART D — DATA SECURITY AND RELIABILITY

## 44. Integration Authentication and Authorization

Every protected integration must verify:

- Trusted identity.
- Current account status.
- Authorized organization.
- Authorized branch.
- Action permission.
- Target-record ownership.
- Relevant domain business rules.

### Financial Integrations

Do not allow external callers or internal modules to bypass authorization through direct service calls or unvalidated record identifiers.

---

## 45. Integration Error Handling

Integrations must distinguish:

- Validation error.
- Authentication failure.
- Authorization failure.
- Missing resource.
- Business conflict.
- Concurrency conflict.
- Database failure.
- External service failure.
- Unexpected internal error.

### Requirements

- Return safe errors.
- Preserve correlation identifiers.
- Avoid confidential data leakage.
- Do not silently swallow required failures.
- Do not report payment success before persistence commits.

---

## 46. Retries and Idempotency

Retries may be appropriate for certain transient failures.

### Read Operations

Safe reads may be retried according to the client policy.

### Sensitive Writes

Financial and enrollment writes require explicit safe retry design.

### Requirements

- Stable idempotency identity.
- Duplicate-effect prevention.
- Correct payload consistency checks.
- Transaction-safe persistence.
- Safe handling of uncertain outcomes.

### Important

Automatic retries of payment operations can create double charges or duplicate ledger records if idempotency is not implemented correctly.

---

## 47. Transaction Boundaries

Critical multi-record workflows include:

- Instant Admission.
- Enrollment and Challan.
- Approved Fee Payment coordination.
- Salary Payment with Posted Expense.
- Relevant administrative role/branch updates.

### Requirements

- Validate dependencies.
- Use transaction-capable MongoDB where required.
- Prevent partial committed business operations.
- Preserve audit consistency.
- Check concurrent state.
- Return accurate outcomes.

A transaction does not replace authorization, unique constraints or idempotency.

---

## 48. Data Contracts and Validation

Every integration must validate its input and output structures.

### Requirements

- Required fields.
- Allowed types.
- Stable identifiers.
- Supported status values.
- Branch scope.
- Monetary precision.
- Date/time representation.
- Pagination.
- Safe optional fields.

### Restrictions

Do not expose raw database documents containing password hashes or internal security fields.

Do not allow arbitrary field updates through generic request bodies.

---

## 49. Data Privacy

The system processes personal and financial information.

### Sensitive Categories

- Student identity/contact.
- Staff identity/contact.
- Authentication credentials.
- Fee records.
- Teacher salary.
- Payslips.
- Audit data.

### Requirements

- Minimize shared data.
- Restrict unauthorized access.
- Use HTTPS.
- Keep external credentials private.
- Avoid unnecessary third-party data transfers.
- Use secure logs.
- Protect reports and exports.

Third-party integrations must receive only the minimum necessary authorized data.

---

## 50. Integration Logging and Monitoring

Relevant events include:

- API connection failures.
- Authentication errors.
- Branch authorization failures.
- Database transaction conflicts.
- Fee payment failures.
- Payroll Expense reconciliation discrepancies.
- External API failures.
- Deployment connectivity issues.

### Logging Security

Do not log:

- Plaintext passwords.
- Session tokens.
- Full MongoDB credentials.
- Unnecessary confidential records.
- Private salary details in unrestricted logs.

### Status

Provider, event format and retention policy remain TBD.

---

# PART E — TESTING AND IMPLEMENTATION

## 51. Integration Testing Strategy

### Unit Tests

Test domain mapping and validation.

### API Tests

Test endpoints, payloads, responses and errors.

### Database Integration Tests

Test MongoDB persistence and relationships.

### Security Tests

Test roles, branches and record ownership.

### Financial Tests

Test Fees, Payroll and Expenses.

### Concurrency Tests

Test simultaneous sensitive operations.

### Frontend Regression Tests

Verify existing React workflows after adapter migration.

### External Service Tests

Apply only to integrations explicitly approved and implemented.

---

## 52. Integration Test Scenarios

| ID | Scenario | Expected outcome |
|---|---|---|
| INT-QA-001 | Frontend reads authorized API data | Correct response |
| INT-QA-002 | Backend rejects unauthenticated request | Unauthorized |
| INT-QA-003 | User accesses unassigned branch | Denied |
| INT-QA-004 | Receptionist creates valid Admission | Allowed |
| INT-QA-005 | Receptionist records valid Fee Payment | Allowed |
| INT-QA-006 | Receptionist requests Payroll API | Denied |
| INT-QA-007 | Teacher reads own assignments | Allowed |
| INT-QA-008 | Teacher reads own salary | Allowed |
| INT-QA-009 | Teacher requests another Teacher's payslip | Denied |
| INT-QA-010 | Enrollment creates required linked records | Consistent data |
| INT-QA-011 | Duplicate Challan request | No unintended duplicate |
| INT-QA-012 | Verified fee collection | Correct financial projections |
| INT-QA-013 | Assignment salary agreement | Correct running obligation |
| INT-QA-014 | New calendar month | No automatic salary generation |
| INT-QA-015 | Partial salary payment | Correct outstanding |
| INT-QA-016 | Salary Payment committed | Correct linked Posted Expense |
| INT-QA-017 | Duplicate salary request | No double payment |
| INT-QA-018 | Branch switch | Correct role and scoped data |
| INT-QA-019 | Backend database unavailable | No false financial success |
| INT-QA-020 | Frontend adapter failure | Safe error feedback |

These are planned test scenarios, not executed results.

---

## 53. Frontend Integration Sequence

Recommended incremental sequence:

1. API client foundation.
2. Authentication and branch context.
3. Academic reference data.
4. Students and Admissions.
5. Enrollment.
6. Challans and Fees.
7. Faculty Assignments and Classes.
8. Assignment-based Payroll.
9. Expenses and Finance.
10. Teacher My Profile.
11. Demo Classes.
12. Physical Assets.
13. Reports and Dashboard.
14. Audit, Notifications and Settings.
15. Final regression testing.

### Important

Actual implementation order may be adjusted for verified dependencies, but financial and authorization safeguards must not be postponed beyond the workflows requiring them.

---

## 54. Integration Definition of Ready

An integration ticket is ready when:

- Business behavior is approved.
- Existing frontend service has been inspected.
- API contract is sufficiently defined.
- Authentication/permission needs are known.
- Database relationships are understood.
- Related module dependencies are identified.
- Error handling is specified.
- Idempotency requirements are defined.
- Relevant tests are planned.
- Blocking decisions are resolved or excluded.

---

## 55. Integration Definition of Done

An integration is technically complete when:

1. The relevant frontend service communicates with the backend.
2. Authentication works.
3. Authorization works.
4. Branch and record scope is correct.
5. Requests and responses match the accepted contract.
6. Persistence succeeds.
7. Relevant business invariants hold.
8. Required transactions remain consistent.
9. Error handling works.
10. Relevant tests have actually passed.
11. Connected frontend workflows remain operational.
12. Documentation accurately reflects the implementation.

Owner acceptance remains separate.

---

## 56. Integration Completion Report

After an approved integration ticket, record:

- Ticket ID.
- Module.
- Source files changed.
- Endpoint(s) implemented.
- Frontend service mapping.
- Database records affected.
- Security checks.
- Tests executed.
- Actual results.
- Known limitations.
- Git status.

Report status in concise Roman Urdu when following the established project reporting style.

Do not claim integration success without end-to-end evidence.

---

## 57. Integration Risk Register

| Risk | Mitigation |
|---|---|
| Frontend/API mismatch | Verify existing services and accepted contracts |
| Unauthorized cross-branch access | Backend-scoped queries and record ownership |
| Wrong role permissions | Central RBAC tests |
| Duplicate Enrollment | Capacity-safe persistence and uniqueness |
| Duplicate Fee Payment | Idempotency and transaction safeguards |
| Unverified revenue counted | Verification-aware aggregation |
| Incorrect Payroll formula | Verify frontend source and existing tests |
| Automatic monthly salary introduced | Explicit running assignment model |
| Missing Payroll Expense | Atomic linking and reconciliation |
| Teacher salary disclosure | Session-derived self-only endpoints |
| Stale financial summaries | Targeted cache invalidation |
| Mock/live source confusion | Explicit integration mode and authoritative data |
| Third-party credential leakage | Backend-only secrets and least privilege |
| External service outage | Safe failure handling and retries |
| Unapproved feature expansion | Separate owner approval |

---

## 58. Explicitly Deferred Integrations

The initial scope does not automatically include:

- Payment gateways.
- SMS providers.
- Email automation.
- External accounting platforms.
- Cloudinary/media services.
- Electron and offline synchronization.
- Platform Admin SaaS provisioning.
- Subscription billing.
- External attendance devices.
- Realtime WebSocket infrastructure.
- Redis/queue services without demonstrated need.

These remain deferred until separately approved.

---

## 59. Open Decisions

The following remain TBD:

- Final API response envelope.
- Exact frontend service method mapping.
- Production session mechanism.
- Monetary representation and rounding.
- Final Fixed/Percentage salary calculation.
- Student identity scope across branches.
- Same-branch multiple-role policy.
- External service approval process.
- Notification delivery mechanism.
- Third-party credential ownership.
- Production hosting providers.
- Data import strategy.
- Webhook and payment gateway governance.

Do not silently invent unresolved decisions.

---

## 60. Related Documentation

This specification must remain aligned with:

- `AGENTS.md` — Agent instructions.
- `RULES.md` — Engineering boundaries.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Data migrations.
- `API.md` — REST API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Data isolation.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATA_FLOW.md` — Cross-module data flow.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial safety.
- `CACHING_AND_PERFORMANCE.md` — Cache and refresh rules.
- `FRONTEND_INTEGRATION.md` — Frontend service integration.
- `FRONTEND_BACKEND_HANDOFF.md` — Implementation handoff.
- `MODULE_WORKFLOW_MAP.md` — Domain relationships.
- `ROLE_BRANCH_DATA_MATRIX.md` — Security matrix.
- `BACKEND_GAPS_AND_RISKS.md` — Open risks.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Implementation roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Backend testing.
- `TESTING_AND_QA.md` — Integration and regression QA.
- `DEPLOYMENT_AND_DEVOPS.md` — DevOps procedures.
- `MCP_CONNECTIONS.md` — Developer tool connection governance.
- `TASKS.md` — Task tracking.
- `PROGRESS.md` — Verified work.
- `MEMORY.md` — Approved decisions.

Relative paths must match the repository's actual folder layout.

---

## 61. Final Implementation Boundary

### Confirmed Requirements

- Existing React/Vite frontend.
- Node.js/Express/MongoDB backend direction.
- Five application roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Payroll.
- No automatic monthly salary generation.
- One academy with multiple authorized branches.
- Current branch creation pause.
- Physical Assets without media uploads.

### Proposed Integration Architecture

- HTTP adapter.
- REST API.
- MongoDB persistence.
- Secure session integration.
- Branch-aware authorization.
- Cross-module consistency.
- Financial transaction coordination.
- API and end-to-end testing.
- Controlled external integration policy.

### Deferred

- Payment gateways.
- Messaging providers.
- External accounting.
- Cloudinary/media uploads.
- Electron/offline integration.
- Multi-client SaaS.
- Premature realtime or distributed services.

### Not Implemented or Verified

- Complete production HTTP adapter.
- Live backend API integration.
- Final third-party service connections.
- Production payment gateway.
- Deployed notification integrations.
- Full end-to-end integration acceptance.

**Governing Principle:** Every TSA Academy ERP integration must preserve approved user workflows, enforce authentication and branch authorization, maintain authoritative academic and financial relationships, and introduce external dependencies only when explicitly justified and approved.

**Document Status:** DRAFT — Ready for integration architecture review and separately approved implementation tickets.
