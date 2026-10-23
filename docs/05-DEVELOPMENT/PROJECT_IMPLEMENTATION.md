# PROJECT_IMPLEMENTATION

<!-- > Purpose: Tracks implementation phases, integration milestones and delivery requirements. -->


# TSA Academy ERP — Project Implementation & Execution Master Plan

**Document:** PROJECT_IMPLEMENTATION.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Implementation Planning; Backend Completion Not Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Product:** Single Academy Organization with Multiple Branches
**Repository Structure:** `Client/`, `Server/`, `docs/`

---

## 1. Purpose

This document establishes the complete implementation and execution framework for TSA Academy ERP.

It coordinates the project's approved requirements, frontend implementation, backend development, database design, security, testing, integration, deployment and operational readiness.

The purpose is to ensure that development proceeds in a controlled and verifiable sequence without damaging existing frontend functionality or introducing unauthorized business behavior.

The project must:

- Preserve the completed React frontend's approved workflows.
- Implement a secure Express and MongoDB backend.
- Support five existing user roles.
- Enforce academy, branch and record-level authorization.
- Maintain valid academic relationships.
- Preserve verified student fee transactions.
- Maintain assignment-based Teacher Payroll.
- Support secure Teacher self-service.
- Provide correct dashboards, reports and ledgers.
- Integrate frontend and backend incrementally.
- Establish safe deployment and recovery procedures.
- Record genuine implementation progress.

**Implementation boundary:** This document is a master plan. It does not authorize immediate code changes, database migration, Git operations or production deployment.

---

## 2. Project Objectives

TSA Academy ERP aims to provide an integrated management system for academy operations.

### Primary Objectives

1. Centralized management of academy branches.
2. Secure staff authentication and permissions.
3. Student admissions and enrollment management.
4. Course, subject and batch organization.
5. Faculty and teaching assignment management.
6. Student fee collection and challan management.
7. Reliable financial summaries and expenses.
8. Assignment-based Teacher Payroll.
9. Teacher self-service profile.
10. Demo class management.
11. Physical asset management.
12. Reports and operational visibility.
13. Auditability of important activities.
14. Academy identity and theme customization.

### Initial Delivery Model

The initial deliverable is a hosted web application for a single academy organization with multiple authorized branches.

Desktop, offline/LAN and multi-client SaaS capabilities are deferred.

---

## 3. Implementation Baseline

### Frontend

The React/Vite frontend is the existing demonstration baseline.

It uses domain services and mock persistence backed by browser localStorage.

The frontend's approved workflows should remain operational throughout backend development.

### Backend

The intended backend is Node.js, Express.js, MongoDB and Mongoose.

Existing `Server/` source, database connectivity, scripts and tests must be inspected before implementing additional backend functionality.

### Documentation

Requirements and engineering decisions are maintained in root project documents and the categorized `docs/` directory.

### Status Accuracy

Do not assume:

- The backend is completely empty.
- Every proposed API already exists.
- Database schemas have been finalized.
- Tests have passed.
- Frontend-to-backend integration is complete.
- Production hosting is active.

Actual implementation status must be established through repository evidence.

---

## 4. Core Architecture

### Current Application Flow

```text
React Frontend
      |
      v
Domain Services
      |
      v
Mock Adapter
      |
      v
Browser localStorage
```

### Target Application Flow

```text
React Frontend
      |
      v
Domain Services
      |
      v
HTTP API Adapter
      |
      v
Express REST API
      |
      v
Authentication / Authorization
      |
      v
Domain Business Services
      |
      v
Mongoose Repositories
      |
      v
MongoDB
```

### Architecture Rules

- Use a modular monolith.
- Maintain clear module boundaries.
- Keep controllers thin.
- Centralize important business rules.
- Keep database access scoped and validated.
- Use transactions where coordinated writes must be atomic.
- Avoid unnecessary microservices or queues.
- Do not duplicate financial calculations across layers.

---

## 5. Confirmed User Roles

The system currently supports five frontend roles.

| Role | Main purpose |
|---|---|
| Super Admin | Approved academy administration |
| Admin | Authorized operational management |
| Receptionist | Full approved Admissions and Fees operations |
| Owner | Approved management and financial oversight |
| Teacher | Own teaching information and compensation |

### Authorization Principles

- Verify authentication on protected APIs.
- Resolve the effective role within the active branch.
- Check action-level permission.
- Validate organization and branch ownership.
- Validate target-record ownership.
- Enforce protected-user restrictions.
- Deny unknown or unsupported actions.

### Current Important Rules

**Receptionist:** Full access to the approved Admissions and Fees modules, but not independent Finance, Expenses, Payroll, Audit Log, Branches, Users or Settings.

**Teacher:** Access to own profile, timetable, assignments, salary agreement, paid amounts, outstanding balance, verified salary payments, payslips and notifications.

**Admin:** Must not escalate protected roles or bypass privileged-account restrictions.

**Super Admin:** Remains subject to the current branch-creation pause.

**Owner:** Must follow verified action-level grants rather than broad permissions inferred from the role name.

---

## 6. Organization and Branch Model

The initial product serves one academy organization with multiple branches.

### Supported Behavior

- A user may be assigned to multiple branches.
- A user may have different roles in different branches.
- Branch selection determines effective permissions.
- Cross-branch access requires explicit authorization.
- Operational records must retain the correct branch ownership.
- Unsupported same-branch multiple-role combinations fail closed.

### Current Restriction

Creating new branches is paused for all roles.

### Deferred

Do not implement multi-academy commercial SaaS provisioning or Platform Admin during the initial implementation.

---

## 7. Complete Module Inventory

The frontend contains 16 principal modules.

| No. | Module | Main responsibility |
|---|---|---|
| 01 | Dashboard | Authorized operational summaries |
| 02 | Admissions | Applicant and admission lifecycle |
| 03 | Students | Student profiles and academic associations |
| 04 | Courses & Batches | Academic catalog and batch management |
| 05 | Faculty & Classes | Teachers, assignments and schedules |
| 06 | Fees | Challans, collections and student fee ledgers |
| 07 | Finance Overview | Verified revenue and expense summaries |
| 08 | Expenses | Authorized operational expenses |
| 09 | Teacher Payroll | Assignment-based running salary obligations |
| 10 | Demo Classes | Demo inquiries, attendance and conversions |
| 11 | Assets | Physical academy inventory |
| 12 | Reports & Ledgers | Authorized operational and financial reports |
| 13 | Audit Log | Protected activity history |
| 14 | Branches | Branch visibility and permitted management |
| 15 | Users | Staff accounts and branch-role assignments |
| 16 | Settings | Academy identity and approved configuration |

### Shared Capabilities

- Login and logout.
- Authenticated account context.
- Branch selection.
- Teacher My Profile.
- Notifications.
- Theme and academy branding.
- Printing and approved exports.

---

## 8. Implementation Methodology

Implement the backend using incremental feature delivery.

### Standard Workflow

```text
Approved Requirement
        |
        v
Source and Documentation Review
        |
        v
Dependency Analysis
        |
        v
Database and API Contract
        |
        v
Backend Implementation
        |
        v
Targeted Unit / Integration Tests
        |
        v
Frontend HTTP Integration
        |
        v
Security / Regression Testing
        |
        v
Verified Progress Report
        |
        v
Owner Review and Acceptance
```

### General Rules

1. One coherent ticket at a time.
2. Preserve working frontend behavior.
3. Limit file changes to the current scope.
4. Verify security before accepting protected operations.
5. Test financial integrity.
6. Avoid unauthorized extra features.
7. Report actual work and unresolved blockers.

---

# PART A — IMPLEMENTATION PHASES

## 9. Phase P00 — Repository and Documentation Verification

**Objective:** Establish an accurate starting point.

### Activities

- Read `AGENTS.md`.
- Review `RULES.md`.
- Verify project Git status.
- Inspect `Client/` and `Server/`.
- Identify frontend services and mock adapters.
- Inspect existing tests.
- Review architecture and domain documentation.
- Identify API/database gaps.
- Verify current feature decisions.
- Confirm initial development tickets.

### Deliverables

- Accurate implementation baseline.
- Dependency inventory.
- Current risks and blockers.
- Approved next implementation ticket.

### Exit Criteria

No important implementation assumption remains unverified for the first ticket.

---

## 10. Phase P01 — Backend Foundation

**Objective:** Establish the core server foundation.

### Scope

- Express server entry point.
- Environment validation.
- MongoDB connection handling.
- Centralized errors.
- Request correlation.
- Safe logging.
- Basic health/readiness behavior.
- Initial backend testing infrastructure.

### Acceptance Criteria

- Server starts with valid configuration.
- Required dependencies are available.
- Invalid critical configuration fails safely.
- Health/readiness behavior is verified.
- No secret appears in the source repository.
- Relevant tests pass.

---

## 11. Phase P02 — Authentication, Users and Authorization

**Objective:** Establish secure staff access.

### Scope

- Staff identity.
- Password hashing.
- Login and logout.
- Secure sessions.
- Account status.
- Branch memberships.
- Five-role permission resolution.
- Protected account restrictions.
- Authorized branch selection.
- Session revocation.

### Security Gate

Verify:

- Invalid credentials rejected.
- Disabled accounts rejected.
- Unauthorized roles denied.
- Cross-branch access denied.
- Protected-role escalation denied.
- Teacher self-only access enforced.
- Receptionist Admissions/Fees permissions preserved.

### Important

Frontend route guards must not be treated as backend authorization.

---

## 12. Phase P03 — Academic Catalog

**Objective:** Implement the academic reference structure.

### Scope

- Courses.
- Subjects.
- Streams.
- Batches.
- Academic relationships.
- Approved capacity constraints.
- Branch ownership.

### Acceptance Criteria

- Valid references persist.
- Invalid combinations are rejected.
- Branch ownership is enforced.
- Referenced records are protected from unsafe deletion.
- Existing frontend service contracts remain compatible.

---

## 13. Phase P04 — Students and Admissions

**Objective:** Implement student and admission records.

### Scope

- Student records.
- Admission records.
- Approved admission states.
- Applicant/student relationships.
- Authorized editing.
- Guarded deletion.

### Confirmed Admission States

Current approved workflow includes:

- Pending.
- Approved.
- Permitted return to Pending.

The historical Reject workflow must not be restored without approval.

### Acceptance Criteria

- Student/admission links are valid.
- Status transitions follow approved rules.
- Receptionist can perform approved actions.
- Unauthorized branch operations are rejected.
- Repeated requests do not create unintended duplicates.

---

## 14. Phase P05 — Enrollment and Instant Admission

**Objective:** Complete academic admission transactions.

### Scope

- Enrollment creation.
- Admission linkage.
- Course/Batch validation.
- Batch capacity.
- Duplicate enrollment prevention.
- Initial challan linkage.
- Approved instant-admission workflow.

### Acceptance Criteria

- Enrollment does not exceed valid capacity.
- One student is not unintentionally enrolled twice.
- Instant admission preserves required linked records.
- Transaction failures do not create misleading partial success.

---

## 15. Phase P06 — Challans and Student Fees

**Objective:** Implement student financial obligations and payments.

### Scope

- Challan creation.
- Approved fee calculation.
- One-challan-per-enrollment behavior.
- Partial fee payments.
- Payment verification.
- Outstanding balances.
- Receipts.
- Student fee ledgers.

### Security Requirements

Receptionist has full approved Fees access within the authorized branch and business rules.

### Financial Requirements

- Only valid verified payments count as collected revenue.
- Prevent overpayments.
- Prevent duplicate financial requests.
- Preserve payment history.
- Use exact approved monetary handling.

### Exit Criteria

Fee transactions, balances and reporting sources reconcile correctly.

---

## 16. Phase P07 — Faculty and Classes

**Objective:** Implement staff teaching relationships.

### Scope

- Faculty records or staff relationships.
- Faculty assignments.
- Teacher/Subject/Batch links.
- Teaching schedules.
- Approved timetable validation.
- Assignment history.

### Exit Criteria

- Assignment relationships are correct.
- Teacher views contain only authorized teaching data.
- Historical assignments remain accessible where required by Payroll.

---

## 17. Phase P08 — Teacher Payroll

**Objective:** Implement the approved running remuneration model.

### Confirmed Rule

Teacher salary belongs to independent assignment/batch/subject obligations.

It is **not** automatically generated every month.

### Scope

- Fixed/Percentage agreements.
- Assignment payable calculations.
- Independent running balances.
- Partial/full payments.
- Historical obligations.
- Verified payment history.
- Payslip data.
- Linked Posted Expenses.
- Authorized notifications.

### Required Source Verification

Before implementing formulas, inspect actual frontend calculation sources and related tests.

Candidate files include:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Verify actual file paths and formulas before using them.

### Financial Gate

- No duplicate payment.
- No salary overpayment.
- No automatically generated monthly salary.
- No lost historical outstanding.
- One consistent linked expense per applicable salary payment.
- Correct authorized Teacher self-service projections.

---

## 18. Phase P09 — Expenses and Finance

**Objective:** Implement authoritative financial summaries.

### Scope

- Operational expenses.
- Payroll-linked posted expenses.
- Verified revenue aggregation.
- Expense aggregation.
- Net financial summaries.
- Authorized financial filters.

### Requirements

- Revenue derives from eligible verified fee payments.
- Payroll-related expense must not be counted twice.
- Unauthorized Receptionist and Teacher access must be denied.
- Owner permissions must match verified current behavior.
- Financial summaries must match underlying records.

---

## 19. Phase P10 — Teacher My Profile

**Objective:** Connect Teacher self-service to authoritative backend data.

### Route

`/my-profile`

### Four Existing Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Requirements

- Use authenticated Teacher identity.
- Load own assignments and timetable.
- Load own salary agreements.
- Show valid paid/outstanding values.
- Show verified payment history.
- Support approved payslip generation.
- Protect other teachers' confidential records.

### Exit Criteria

Teacher My Profile agrees with administrative Payroll data while enforcing self-only access.

---

## 20. Phase P11 — Demo Classes

**Objective:** Implement demo inquiry lifecycle.

### Scope

- Demo inquiry persistence.
- Approved attendance/status changes.
- Permitted cancellation.
- Admission prefill/conversion.
- Duplicate conversion prevention.

### Requirements

- Preserve existing frontend behavior.
- Validate branch ownership.
- Avoid fabricating enrollment or payments.
- Maintain correct Admission linkage.

---

## 21. Phase P12 — Physical Assets

**Objective:** Implement academy equipment inventory.

### Scope

- Physical asset registration.
- Asset identification.
- Staff assignment.
- Inspection history.
- Maintenance history.
- Branch-scoped reporting.

### Restrictions

Do not automatically introduce:

- Cloudinary.
- Digital media management.
- Unapproved depreciation.
- Disposal workflows.
- Automatic finance expenses from asset maintenance.

---

## 22. Phase P13 — Reports, Ledgers and Dashboard

**Objective:** Replace mock summary sources with authoritative backend projections.

### Scope

- Admissions reports.
- Student and Enrollment reports.
- Batch occupancy.
- Fee ledgers.
- Verified collection reports.
- Expense summaries.
- Assignment-based Payroll reports.
- Finance summaries.
- Authorized cross-branch comparisons.
- Dashboard metrics.

### Accuracy Gate

Reports must agree with actual records and must not expose unauthorized financial or Teacher compensation data.

---

## 23. Phase P14 — Audit, Notifications and Settings

**Objective:** Complete shared operational functionality.

### Scope

- Durable business audit events.
- Authorized Audit Log views.
- Personal notifications.
- Academy identity.
- Theme and branding settings.
- Permitted branch presentation settings.

### Requirements

- Sensitive actions must be traceable.
- Audit records must be protected.
- Notifications must reflect actual committed events.
- Settings changes must preserve business rules.
- No new media-upload infrastructure without approval.

---

## 24. Phase P15 — Frontend HTTP Integration

**Objective:** Replace mock persistence incrementally.

### Strategy

```text
Existing React Page
        |
        v
Existing Domain Service
        |
        v
New HTTP Adapter
        |
        v
Express API
        |
        v
MongoDB
```

### Requirements

- Preserve existing page components where practical.
- Preserve service interfaces where possible.
- Normalize backend responses appropriately.
- Use real authenticated user and branch context.
- Handle API errors and loading states.
- Invalidate dependent cached data.
- Prevent stale branch data leakage.
- Prevent false financial success indicators.

### Migration Restriction

Do not silently import browser localStorage data.

Any import requires a separately approved migration plan.

---

## 25. Phase P16 — Release and Client Testing

**Objective:** Deliver a verified hosted application for client evaluation.

### Scope

- Frontend hosting.
- Express API hosting.
- Authorized MongoDB deployment.
- Environment configuration.
- HTTPS.
- Sessions and CORS/CSRF verification.
- Backend/Frontend smoke tests.
- Critical security tests.
- Financial reconciliation.
- Backup and recovery preparation.

### Status Distinction

Use accurate delivery states:

- Frontend Demo.
- Backend Staging.
- Release Candidate.
- Production Deployed.
- Owner Accepted.

Do not call a frontend-only localStorage demonstration a production backend.

---

# PART B — MODULE INTEGRATION

## 26. Dependency Map

```text
Authentication / Roles / Branch Scope
                  |
                  v
        Academic Reference Data
                  |
                  v
            Admissions
                  |
                  v
          Students / Enrollment
                  |
                  v
          Challans / Fee Payments
                  |
                  +------> Finance / Reports
                  |
                  v
       Faculty / Class Assignments
                  |
                  v
           Salary Agreements
                  |
                  v
       Assignment Running Payroll
                  |
                  v
     Salary Payments + Linked Expenses
                  |
                  v
   Teacher Profile / Finance / Reports
```

Demo Classes, Assets, Audit, Notifications and Settings integrate according to their actual business dependencies.

Cross-cutting security and audit requirements must be implemented at the point they become necessary.

---

## 27. Cross-Module Consistency Rules

| Operation | Required related effects |
|---|---|
| Admission created | Admissions and relevant Dashboard projections |
| Enrollment completed | Students, Admissions, Batch occupancy and applicable Challan |
| Verified fee payment | Fee ledger, Finance, Dashboard and Reports |
| Faculty assignment created | Faculty, Classes, Teacher Profile and Payroll eligibility |
| Salary agreement created | Assignment-specific payroll obligation |
| Salary payment committed | Running balance, linked Expense, Finance and Teacher Profile |
| Demo inquiry converted | Demo Classes and Admissions |
| Asset updated | Physical inventory and applicable reports |
| Branch switched | Effective permissions and scoped views |
| Role assignment changed | Authorization and affected session state |

### Important

Related views must refresh after successful committed changes.

A failed transaction must not generate false success notifications or summary updates.

---

## 28. Frontend Compatibility Policy

The React frontend is the existing approved behavioral reference.

### Preserve

- Routes.
- Forms.
- Status transitions.
- Navigation.
- Theme integration.
- Role-specific visibility.
- Existing approved exports.
- Fee calculations.
- Payroll calculations.
- Teacher My Profile behavior.

### Avoid

- Unnecessary page redesign.
- Duplicate domain logic.
- Replacing stable services without need.
- Introducing incompatible DTOs without an adapter.
- Removing established validation feedback.

---

## 29. Database Integrity Policy

The backend must maintain:

- Valid entity references.
- Proper organization/branch ownership.
- Approved uniqueness constraints.
- Historical record integrity.
- Atomic related writes.
- Accurate money calculations.
- Safe concurrent mutations.

### Financial Protection

Do not directly overwrite verified payment history to correct a calculated balance.

Use separately approved correction mechanisms if needed.

---

## 30. API Contract Policy

Every endpoint must follow the accepted API architecture.

### Requirements

- Correct method and path.
- Defined request fields.
- Defined response format.
- Authentication and permissions.
- Branch and record scope.
- Input validation.
- Business-rule enforcement.
- Correct error responses.
- Idempotency where required.

### Important

Proposed endpoint examples in planning documents are not proof that an API is already implemented or approved.

Final contracts must align with the actual frontend service layer.

---

# PART C — ENGINEERING MANAGEMENT

## 31. Development Ticket Format

Every implementation ticket should include:

| Field | Purpose |
|---|---|
| Ticket ID | Traceable identifier |
| Title | Short implementation objective |
| Module | Affected domain |
| Dependencies | Required previous work |
| Scope | Authorized behavior |
| Files | Actual expected file changes |
| Business Rules | Relevant invariants |
| API Contract | Required endpoints and DTOs |
| Security | Role, branch and record checks |
| Tests | Required verification |
| Acceptance Criteria | Observable completion conditions |
| Out of Scope | Explicit exclusions |

### Example Ticket Naming

- `BE-AUTH-001`
- `BE-ADM-001`
- `BE-ENR-001`
- `BE-FEE-001`
- `BE-PAY-001`
- `FE-INT-001`

These IDs are illustrative and must not conflict with established tickets.

---

## 32. Definition of Ready

A ticket is ready for implementation when:

1. Requirements are sufficiently clear.
2. Relevant current frontend behavior has been inspected.
3. Dependencies are available.
4. Required API/data contracts are defined.
5. Security boundaries are understood.
6. Important transactions are identified.
7. Test expectations are clear.
8. Blocking owner decisions are resolved or excluded.

Do not invent missing business rules to force a ticket into development.

---

## 33. Definition of Done

A ticket is technically complete when:

1. Authorized functionality is implemented.
2. Validation is present.
3. Required permissions are enforced.
4. Branch and record scope is correct.
5. Business invariants hold.
6. Database relationships are valid.
7. Financial operations are transaction-safe.
8. Relevant tests were executed successfully.
9. Connected frontend workflows remain compatible.
10. Changed files and outcomes are documented.
11. Known limitations are disclosed.

**Owner acceptance remains a separate stage.**

---

## 34. Implementation Status Model

Use the following statuses:

| Status | Meaning |
|---|---|
| PLANNED | Defined but not started |
| READY | Requirements and dependencies prepared |
| IN_PROGRESS | Active implementation |
| IMPLEMENTED | Requested code exists |
| TESTED | Relevant tests passed |
| IN_REVIEW | Awaiting review |
| BLOCKED | Dependency or decision prevents completion |
| DEFERRED | Explicitly postponed |
| OWNER_ACCEPTED | Explicit owner acceptance |
| CANCELLED | No longer required |

Do not mark code TESTED without execution evidence.

---

## 35. Testing Requirements

### Unit Tests

Domain calculations and validation.

### Integration Tests

MongoDB relationships and transaction behavior.

### API Tests

HTTP contracts, status codes and authorization.

### Security Tests

Five-role permissions, branch isolation and ownership.

### Financial Tests

Verified Fees, running Payroll and Expense reconciliation.

### Concurrency Tests

Simultaneous enrollments, fee payments and salary disbursements.

### Frontend Regression Tests

Existing approved workflows after HTTP integration.

### Rule

Use targeted relevant tests during implementation and broader tests at integration/release gates.

---

## 36. Quality Assurance Gates

| Gate | Required verification |
|---|---|
| Architecture | Correct module boundaries |
| Security | Authentication and authorization |
| Data | Valid models, relationships and indexes |
| API | Accepted contracts |
| Business | Approved domain behavior |
| Financial | Exact balances and transaction safety |
| Frontend | Service compatibility |
| Regression | No critical connected workflow failures |
| Deployment | Secure configuration and smoke tests |

A feature should not advance beyond its verified state without recording unresolved failures.

---

## 37. Security Review

Before accepting protected backend operations, verify:

- Valid authenticated account.
- Effective branch-specific role.
- Required action permission.
- Correct organization scope.
- Correct branch scope.
- Target-record ownership.
- Protected-account constraints.
- Request field validation.
- Safe response serialization.

### Sensitive Areas

- User roles.
- Student personal information.
- Verified fee collections.
- Teacher compensation.
- Payroll disbursements.
- Posted Expenses.
- Financial exports.
- Audit records.

---

## 38. Transaction and Concurrency Review

High-risk workflows include:

- Instant Admission.
- Enrollment with capacity validation.
- Challan and payment operations.
- Teacher salary disbursement.
- Linked Payroll Expense posting.

### Required Checks

- Atomicity where necessary.
- Appropriate unique constraints.
- Duplicate request handling.
- Conditional balance validation.
- Safe conflict responses.
- No orphaned financial records.
- No invalid partial success.

---

## 39. Performance Management

Performance optimization must follow evidence.

### Initial Priorities

- Appropriate MongoDB indexes.
- Scoped queries.
- Bounded pagination.
- Efficient response projections.
- Avoiding unnecessary repeated queries.
- Correct frontend data invalidation.

### Deferred by Default

- Redis.
- Distributed caches.
- Message queues.
- Microservices.
- Premature realtime infrastructure.

Performance improvements must not compromise security or financial accuracy.

---

# PART D — DEPLOYMENT AND OPERATIONS

## 40. Development Environments

Potential environments include:

1. Local development.
2. Automated testing.
3. Preview/demo.
4. Staging.
5. Production.

### Requirements

- Separate secrets.
- Appropriate database separation.
- Secure session configuration.
- No destructive testing on production.
- Verified environment variables.
- Traceable application releases.

---

## 41. Deployment Strategy

### Proposed Hosting

- React frontend: Vercel.
- Express backend: suitable approved Node.js host.
- MongoDB: suitable managed or authorized deployment.

Final providers and service plans remain TBD.

### Requirements

- HTTPS.
- Correct API URL.
- Secure cookies.
- Appropriate CORS/CSRF.
- Database connectivity.
- Health/readiness.
- Safe logging.
- Backup readiness.
- Authorized deployment approvals.

Do not assume Vercel static frontend hosting automatically provides a persistent Express runtime.

---

## 42. Data Migration

Moving browser-local mock data into MongoDB is not automatic.

### Requirements

- Identify source data.
- Verify schema version.
- Select approved import strategy.
- Map stable identifiers.
- Validate relationships.
- Detect duplicates.
- Reconcile financial history.
- Verify teacher salary obligations.
- Obtain import approval.
- Test rollback/recovery.

### Explicit Restriction

Do not silently overwrite demo or production records.

---

## 43. Backup and Recovery

The production design must include an approved recovery strategy.

### Requirements

- Backup scope.
- Retention policy.
- Restricted access.
- Protected storage.
- Restore testing.
- Recovery objectives.
- Financial reconciliation.
- Incident documentation.

### Critical

Restoring an older database snapshot may remove valid later payments.

Never blindly restore financial records without accounting for transactions after the selected recovery point.

---

## 44. Logging and Monitoring

Operational visibility should include:

- API errors.
- Authentication failures.
- Authorization violations.
- MongoDB connectivity.
- Transaction failures.
- Slow queries.
- Financial reconciliation issues.
- Backup failures.

### Privacy

Never log plaintext credentials, private session values or unnecessary student/Teacher salary information.

---

## 45. Incident Management

Examples:

- API outage.
- Database failure.
- Unauthorized access.
- Duplicate fee collection.
- Incorrect payroll balance.
- Missing salary expense.
- Data corruption.

### Response

1. Confirm the problem.
2. Protect data and evidence.
3. Identify affected operations.
4. Prevent unsafe additional writes.
5. Investigate root cause.
6. Apply approved correction or recovery.
7. Verify results.
8. Record actual incident outcomes.

Do not silently repair financial history.

---

# PART E — PROJECT TRACKING

## 46. Documentation Structure

The project uses categorized documentation.

```text
docs/
├── 00-CORE/
├── 01-ARCHITECTURE/
├── 02-DATABASE-AND-API/
├── 03-SECURITY/
├── 04-FRONTEND/
├── 05-DEVELOPMENT/
├── 06-OPERATIONS/
└── 07-INTEGRATIONS-AND-QA/
```

### Responsibilities

| Folder | Purpose |
|---|---|
| `00-CORE` | Product requirements and project decisions |
| `01-ARCHITECTURE` | Technical and business architecture |
| `02-DATABASE-AND-API` | Persistence, APIs, migrations and performance |
| `03-SECURITY` | Authentication, RBAC and security |
| `04-FRONTEND` | Frontend design and integration |
| `05-DEVELOPMENT` | Setup, feature workflow and implementation planning |
| `06-OPERATIONS` | Deployment, debugging, backup and monitoring |
| `07-INTEGRATIONS-AND-QA` | Handoff, audits, risks and regression verification |

Do not create duplicate folders when the relevant location already exists.

---

## 47. Progress Tracking

### `TASKS.md`

Track work items, dependencies and blockers.

### `PROGRESS.md`

Record verified implementation progress and actual tests.

### `MEMORY.md`

Preserve lasting owner-approved decisions.

### `BACKEND_GAPS_AND_RISKS.md`

Maintain unresolved backend risks.

### `FEATURE_TICKETS.md`

Maintain detailed feature requirements and implementation units.

### Reporting Rule

A document being written does not mean the corresponding feature has been implemented.

---

## 48. Completion Reporting Format

After each approved development ticket, report:

- Ticket ID.
- Module.
- Actual changed files.
- Implemented behavior.
- Tests executed.
- Test results.
- Known limitations.
- Git status.
- Next approved dependency, if relevant.

Use concise Roman Urdu for routine development status reporting.

Do not claim deployment or owner acceptance without actual evidence.

---

## 49. Change Control

### Required

- Read `AGENTS.md`.
- Inspect Git status.
- Preserve unrelated changes.
- Implement only approved scope.
- Avoid unapproved dependencies.
- Preserve explanatory comments.
- Run relevant tests.
- Report actual outcomes.

### Prohibited Without Approval

- Resetting unrelated work.
- Destructive database operations.
- Unapproved schema migrations.
- Production credential changes.
- Broad architectural rewrites.
- Automatic Git commits or pushes.
- Production deployment.
- Financial record correction.

---

## 50. Implementation Milestones

| Milestone | Scope | Verification |
|---|---|---|
| M0 | Repository and requirements baseline | Current implementation accurately understood |
| M1 | Backend foundation and Auth | Login, sessions, five roles, branch scope |
| M2 | Academic records | Courses, Students, Admissions, Enrollment |
| M3 | Student finance | Challans, verified payments and balances |
| M4 | Faculty | Assignments and classes |
| M5 | Payroll and Finance | Running obligations, linked expenses |
| M6 | Supporting operations | Demo, Assets, Reports, Audit, Settings |
| M7 | Frontend integration | Existing workflows backed by APIs |
| M8 | Release verification | Security, transaction, regression and recovery checks |
| M9 | Client evaluation | Demonstration and explicit feedback/acceptance |

No calendar completion dates are committed by this document.

Milestones describe proposed delivery gates, not verified progress.

---

## 51. Client Demonstration Requirements

The hosted demo should demonstrate the actually implemented scope.

### Candidate Scenarios

- User login.
- Branch selection.
- Role-specific Dashboard.
- Admissions.
- Student enrollment.
- Challan and approved Fees operations.
- Faculty assignments.
- Running Teacher Payroll.
- Teacher My Profile.
- Finance summaries.
- Reports and branding.

### Transparency

Clearly distinguish:

- Frontend-only mock demo.
- Backend-integrated demo.
- Production deployment.

Do not promise production persistence before actual backend integration.

---

## 52. Client Acceptance Process

Technical verification and client acceptance are separate.

### Technical Verification

- Features implemented.
- Tests passed.
- Security checked.
- Financial integrity checked.
- Hosting verified.

### Client Review

- Approved user workflows demonstrated.
- Client feedback documented.
- Defects classified.
- Scope changes approved separately.
- Final acceptance explicitly recorded.

A completed automated test suite is not equivalent to client acceptance.

---

## 53. Critical Project Risks

| Risk | Mitigation |
|---|---|
| Frontend/backend contract mismatch | Verify source and use an HTTP adapter |
| Unauthorized role access | Server-enforced RBAC and record ownership |
| Branch data leakage | Scoped queries and branch-context testing |
| Enrollment overcapacity | Concurrency-safe capacity validation |
| Duplicate verified payment | Idempotency and transaction controls |
| Incorrect payroll formula | Verify existing frontend source and tests |
| Monthly salary accidentally introduced | Explicit assignment-based model |
| Missing payroll expense | Atomic payment/expense linkage |
| Financial reporting mismatch | Authoritative source reconciliation |
| Lost local demo data | Separate approved migration strategy |
| Insecure production settings | Environment and deployment security checks |
| Unverified completion claims | Evidence-based progress reporting |

---

## 54. Open Implementation Decisions

Before affected implementation, resolve or verify:

- Final API response contracts.
- Final MongoDB schema details.
- Production authentication session configuration.
- Monetary representation and rounding.
- Exact Fixed/Percentage payroll calculations.
- Same-branch multiple-role policy.
- Student identity scope across branches.
- Financial correction/refund governance.
- Browser mock-data import approach.
- Production hosting providers.
- Backup retention and recovery objectives.
- Final acceptance criteria.

Unresolved decisions must remain documented rather than silently guessed.

---

## 55. Explicitly Deferred Features

The current implementation plan does not include:

- Platform Admin.
- Multi-academy SaaS provisioning.
- License/subscription infrastructure.
- Electron.
- Offline/LAN synchronization.
- Cloudinary/media upload systems.
- Automatic monthly teacher payroll.
- Unsupported financial reversals.
- Unnecessary microservices.
- Unnecessary message queues.

Deferred functionality requires a separate approved scope.

---

## 56. Master Implementation Checklist

### Foundation

- [ ] Repository baseline verified.
- [ ] Backend startup verified.
- [ ] MongoDB connection verified.
- [ ] Environment validation implemented.
- [ ] Error handling implemented.

### Security

- [ ] Authentication implemented.
- [ ] Session management verified.
- [ ] Five-role permissions verified.
- [ ] Branch isolation verified.
- [ ] Protected account restrictions verified.
- [ ] Teacher salary privacy verified.

### Academics

- [ ] Courses and Batches implemented.
- [ ] Student records implemented.
- [ ] Admissions implemented.
- [ ] Enrollment implemented.
- [ ] Capacity checks verified.

### Finance

- [ ] Challans implemented.
- [ ] Fee Payments implemented.
- [ ] Verified revenue rules tested.
- [ ] Running Teacher Payroll implemented.
- [ ] Salary/Expense reconciliation tested.
- [ ] Finance summaries verified.

### Operations

- [ ] Demo Classes implemented.
- [ ] Physical Assets implemented.
- [ ] Reports verified.
- [ ] Audit records implemented.
- [ ] Notifications implemented.
- [ ] Settings integrated.

### Integration and Release

- [ ] HTTP adapter integrated.
- [ ] Frontend regression tests passed.
- [ ] Security tests passed.
- [ ] Concurrency tests passed.
- [ ] Deployment verified.
- [ ] Backup/recovery readiness reviewed.
- [ ] Client evaluation completed.
- [ ] Owner acceptance recorded.

These checkboxes are a planning checklist. They must be updated only when supported by actual evidence.

---

## 57. Related Documentation

This document coordinates, but does not replace, the detailed specifications in:

- `AGENTS.md`
- `RULES.md`
- `PRD.md`
- `SYSTEM_DESIGN.md`
- `MEMORY.md`
- `TASKS.md`
- `PROGRESS.md`
- `ARCHITECTURE.md`
- `ERD.md`
- `DATABASE.md`
- `DATABASE_MIGRATIONS.md`
- `API.md`
- `API_CONTRACTS.md`
- `RBAC_PERMISSIONS.md`
- `TENANT_BRANCH_ISOLATION.md`
- `AUTHENTICATION_AND_SECURITY.md`
- `BUSINESS_RULES.md`
- `DATA_FLOW.md`
- `TRANSACTIONS_AND_INTEGRITY.md`
- `CACHING_AND_PERFORMANCE.md`
- `BACKEND_IMPLEMENTATION_PLAN.md`
- `BACKEND_TESTING_STRATEGY.md`
- `FEATURE_DEVELOPMENT.md`
- `FRONTEND_INTEGRATION.md`
- `DEPLOYMENT.md`
- `ENVIRONMENT_CONFIG.md`
- `BACKUP_AND_RECOVERY.md`
- `LOGGING_AND_MONITORING.md`
- `DEBUGGING.md`
- `CUSTOMIZATION.md`
- `FRONTEND_AUDIT.md`
- `FRONTEND_BACKEND_HANDOFF.md`
- `MODULE_WORKFLOW_MAP.md`
- `ROLE_BRANCH_DATA_MATRIX.md`
- `BACKEND_GAPS_AND_RISKS.md`

Use real repository locations for relative links.

---

## 58. Final Project Boundary

### Confirmed Requirements

- React/Vite frontend.
- Node.js/Express/MongoDB backend direction.
- Modular monolith architecture.
- Five roles.
- Receptionist Full Admissions and Fees.
- Teacher own-profile and compensation access.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy organization with multiple branches.
- Current branch creation pause.
- Physical Assets without media uploads.
- Hosted web demonstration.

### Proposed Implementation

- Incremental backend phases.
- Modular services and repositories.
- MongoDB persistence.
- Secure REST APIs.
- Frontend HTTP adapter.
- Transaction and concurrency protections.
- Quality gates.
- Hosted deployment and recovery procedures.

### Deferred

- Platform Admin and multi-client SaaS.
- Desktop/LAN/offline functionality.
- Cloudinary/media infrastructure.
- Unapproved refunds/reversals.
- Unnecessary distributed architecture.

### Not Verified

- Complete backend implementation.
- Production integration.
- Production security testing.
- Final hosting infrastructure.
- Completed financial reconciliation testing.
- Formal client acceptance.

**Governing Principle:** Implement TSA Academy ERP incrementally, preserve approved frontend behavior, enforce security at the backend, protect academic and financial relationships, and record only verified progress.

**Document Status:** DRAFT — Master implementation reference for planning and separately approved development tickets.
