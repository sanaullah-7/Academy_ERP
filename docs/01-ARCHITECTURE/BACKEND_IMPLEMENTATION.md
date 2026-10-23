# BACKEND_IMPLEMENTATION

<!-- > Purpose: Defines the phased implementation plan, backend modules and integration boundaries. -->

# TSA Academy ERP — Backend Implementation Plan

**Document:** BACKEND_IMPLEMENTATION_PLAN.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Backend Planning Complete; Implementation Not Started
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Development Strategy:** Incremental, Module-Based, Frontend-Compatible
**Initial Deployment:** One Academy Organization with Multiple Branches

---

## 1. Purpose

This document defines the proposed development roadmap for implementing the TSA Academy ERP backend.

The primary objective is to replace the completed frontend's browser-local mock persistence with secure, centralized MongoDB-backed services while preserving existing approved user interactions, business rules, financial calculations and access restrictions.

The implementation must:

- Follow existing project architecture and coding standards.
- Preserve the completed React frontend's workflows.
- Introduce production authentication and server authorization.
- Provide secure organization and branch isolation.
- Implement approved academic and financial operations incrementally.
- Maintain assignment-based Teacher Payroll.
- Avoid unauthorized features and unnecessary infrastructure.
- Verify each backend module before integrating the next.
- Maintain reliable documentation and progress history.

**Implementation boundary:** This document is a roadmap. It does not authorize immediate changes to `Client/`, `Server/`, dependencies, infrastructure or production data.

---

## 2. Project Baseline

### 2.1 Existing Frontend

The project includes a React/Vite frontend using domain services, centralized mock adapters and browser-local demo persistence.

The frontend covers 16 operational modules:

1. Dashboard
2. Admissions
3. Students
4. Courses & Batches
5. Faculty & Classes
6. Fees
7. Finance Overview
8. Expenses
9. Teacher Payroll
10. Demo Classes
11. Assets
12. Reports & Ledgers
13. Audit Log
14. Branches
15. Users
16. Settings

Additional shared capabilities include:

- Authentication and branch selection.
- Academy branding and theme management.
- Role-specific navigation.
- Teacher My Profile.
- Notifications.
- Approved printing and exports.

### 2.2 Current Roles

Exactly five frontend roles:

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher.

### 2.3 Core Owner-Approved Rules

- Receptionist has full access to approved Admissions and Fees actions.
- Teacher may view their own profile, teaching assignments, salary agreements, verified payments and payslips.
- Payroll follows an assignment/batch/subject-based running balance, not automatic monthly salary generation.
- One staff account may have different roles in different branches.
- Unsupported same-branch multi-role combinations fail closed.
- New branch creation is currently paused for every role.
- Assets represents physical academy inventory, not digital media.
- The initial product serves one academy organization with multiple branches.
- Platform Admin and multi-client SaaS provisioning are deferred.

### 2.4 Existing Backend

Before making code changes, inspect the actual `Server/` directory and project history.

Do not assume the backend is entirely empty. Previously established server files, MongoDB development connectivity, tests or utilities must be preserved when present.

The exact current code state must be established through repository inspection, not inferred from planning documents.

---

## 3. Documentation and Decision Precedence

Before implementing any ticket:

1. Read root `AGENTS.md`.
2. Consult the latest owner-approved decisions in `MEMORY.md`.
3. Check `RULES.md` for engineering restrictions.
4. Read the relevant current product and technical specification.
5. Inspect actual frontend services, records and tests for the affected workflow.
6. Review the frontend audit and backend handoff documents.
7. Check relevant unresolved items in `BACKEND_GAPS_AND_RISKS.md`.
8. Verify the implementation status in `PROGRESS.md`.

### Authoritative Document Ownership

| Document | Responsibility |
|---|---|
| `PRD.md` | Product requirements |
| `SYSTEM_DESIGN.md` | Domain workflows |
| `BUSINESS_RULES.md` | Business invariants |
| `SECURITY.md` | Authentication and security |
| `RBAC_PERMISSIONS.md` | Action-level permissions |
| `TENANT_BRANCH_ISOLATION.md` | Organization/branch ownership |
| `ARCHITECTURE.md` | Technical architecture |
| `ERD.md` | Entity relationships |
| `DATABASE.md` | MongoDB models and constraints |
| `API.md` | REST API architecture |
| `API_CONTRACTS.md` | Request/response design |
| `DATA_FLOW.md` | Cross-module data movement |
| `TRANSACTIONS_AND_INTEGRITY.md` | Concurrency and financial integrity |
| `FRONTEND_INTEGRATION.md` | Frontend service interfaces |
| `TASKS.md` | Development work items |
| `PROGRESS.md` | Verified development results |

When specifications disagree, follow the latest explicit owner decision, verify implemented frontend behavior and document unresolved conflicts before changing affected code.

Historical text must not silently override newer approved requirements.

---

## 4. Development Principles

### 4.1 Frontend-First Compatibility

The completed frontend is the primary implementation reference for existing behavior.

Preserve:

- Page workflows.
- User interaction sequences.
- Field semantics.
- Status transitions.
- Existing validation outcomes.
- Role-specific navigation.
- Fee and salary calculations.
- Export and printing behavior.
- Branch switching.

Do not redesign working screens merely to simplify backend development.

### 4.2 Small, Reviewable Tickets

Implement one coherent backend capability at a time.

Each ticket should identify:

- Target module.
- Files expected to change.
- Required business behavior.
- Relevant security rules.
- Data models and relationships.
- API contracts.
- Required tests.
- Acceptance criteria.
- Out-of-scope functionality.

### 4.3 Minimal Necessary Changes

Modify only files required for the approved ticket.

Avoid unrelated cleanup, library replacement or frontend redesign.

### 4.4 Explicit Verification

Do not report a module complete merely because routes or models exist.

Completion requires relevant functional, security, integration and data-integrity checks.

### 4.5 Documentation Accuracy

Record only work that has actually been performed and verified.

Do not mark proposed APIs as implemented or unexecuted tests as passed.

---

## 5. Approved Technical Direction

| Area | Technology / Approach |
|---|---|
| Frontend | Existing React + Vite |
| Backend | Node.js + Express.js |
| Persistence | MongoDB + Mongoose |
| Architecture | Modular monolith |
| Authentication | Secure server-managed session strategy, subject to final approval |
| Authorization | Centralized RBAC + branch and record scope |
| API style | REST under proposed `/api/v1` |
| Validation | Centralized request and domain validation |
| Financial integrity | Exact money representation, transactions and idempotency |
| Testing | Existing repository test conventions; expand as needed |
| Logging | Safe structured application and audit logging |
| Deployment | Hosted web application; provider and environment details TBD |

### Deferred Infrastructure

Do not automatically introduce:

- Microservices.
- Redis.
- RabbitMQ.
- Kubernetes.
- Realtime sockets.
- Electron.
- LAN desktop synchronization.
- Cloudinary.
- Platform Admin SaaS infrastructure.

Any additional dependency must have a demonstrated technical need and fit the approved ticket.

---

## 6. Proposed Backend Folder Structure

The exact folder structure must respect any existing `Server/` architecture.

A proposed modular organization is:

```text
Server/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── cors.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── branchScope.js
│   │   ├── validateRequest.js
│   │   └── errorHandler.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── branches/
│   │   ├── academics/
│   │   ├── admissions/
│   │   ├── students/
│   │   ├── enrollments/
│   │   ├── fees/
│   │   ├── faculty/
│   │   ├── classes/
│   │   ├── payroll/
│   │   ├── finance/
│   │   ├── expenses/
│   │   ├── demos/
│   │   ├── assets/
│   │   ├── reports/
│   │   ├── audit/
│   │   ├── settings/
│   │   └── notifications/
│   └── shared/
│       ├── errors/
│       ├── validation/
│       ├── money/
│       └── database/
└── tests/
```

This structure is **PROPOSED**, not a command to generate all directories immediately.

Module folders should be introduced when their corresponding functionality is implemented.

Keep controllers, services, repositories, models and validation responsibilities distinct.

Do not introduce unnecessary abstractions for modules that do not need them.

---

# 7. Implementation Phases

## Phase B00 — Backend Baseline and Documentation Gate

**Objective:** Establish a reliable starting point before writing backend code.

### Required Tasks

- Inspect `Client/` and `Server/`.
- Identify current source layout.
- Verify Git status.
- Read approved documentation.
- Confirm existing scripts and test runner.
- Identify current backend connectivity and reusable files.
- Map frontend service entry points.
- Identify unresolved API/database decisions.
- Define the smallest first implementation ticket.

### Deliverables

- Verified backend baseline.
- Accurate current implementation status.
- Known unresolved decisions.
- Confirmed module order.
- Initial acceptance checklist.

### Acceptance Criteria

- Existing code is understood.
- No unauthorized files are modified.
- No assumption that an existing working component is missing.
- Relevant blockers are documented.

---

## Phase B01 — Backend Foundation

**Objective:** Establish the minimum Express foundation required for subsequent modules.

### Scope

- Server bootstrapping where missing.
- Environment validation.
- MongoDB connection lifecycle.
- API base routing.
- Centralized error handling.
- Request ID handling.
- Basic logging.
- Health check.
- Graceful startup/shutdown behavior.
- Test configuration.

### Proposed Deliverables

- Working local API server.
- Verified MongoDB connectivity.
- Safe environment-variable handling.
- Basic health endpoint.
- Consistent error-handling foundation.

### Acceptance Criteria

- Server starts successfully.
- Database connection behavior is verified.
- Missing configuration fails safely.
- Health response is available.
- No production secret is committed.
- Relevant tests pass.

### Out of Scope

- Full operational module implementation.
- Production data migration.
- Client frontend redesign.
- Redis or distributed queues.

---

## Phase B02 — Authentication, Sessions and RBAC

**Objective:** Replace demo-only security with real server-enforced authorization.

### Scope

- Staff identity storage.
- Secure credential verification.
- Login/logout.
- Current session.
- Account status checks.
- Branch-role assignments.
- Effective permission resolution.
- Branch switching.
- Record-access foundations.
- Admin privilege ceilings.
- Session revocation behavior.

### Required Role Behavior

Exactly five current roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Critical Authorization Rules

- Receptionist full Admissions and Fees.
- Teacher self-only profile and compensation.
- No Receptionist independent Finance/Payroll access.
- No Teacher access to others' salaries.
- Admin cannot assign unauthorized privileged roles.
- Different roles across branches.
- Same-branch unresolved multiple-role combinations fail closed.
- Current branch creation pause remains enforced.

### Acceptance Criteria

- Valid login works.
- Invalid/disabled accounts are rejected.
- Role and branch permissions are checked by backend services.
- Unauthorized cross-branch requests fail.
- Privilege escalation is prevented.
- Session expiration/revocation is handled.
- Existing frontend navigation can consume safe authenticated context.

---

## Phase B03 — Organization, Branches and Academic Reference Data

**Objective:** Establish authoritative records required by downstream modules.

### Scope

- Existing academy organization representation.
- Authorized branch listing and selection.
- Branch-owned records and ownership enforcement.
- Courses.
- Subjects.
- Streams.
- Batches.
- Approved course/batch relationships.
- Capacity and academic reference validation.

### Critical Restrictions

- Branch creation is paused.
- Do not implement Platform Admin or SaaS onboarding.
- Preserve existing protected branch lifecycle rules.
- Avoid assuming academic catalog ownership without inspecting the frontend.

### Acceptance Criteria

- Authorized academic records persist in MongoDB.
- Cross-branch access is denied.
- Invalid academic relationships are rejected.
- Existing frontend fields remain compatible.
- Referenced records cannot be destructively removed contrary to business rules.

---

## Phase B04 — Students and Admissions

**Objective:** Implement student and admission persistence with approved status transitions.

### Scope

- Student records.
- Admissions.
- Applicant validation.
- Admission-to-student linkage.
- Current Pending/Approved states.
- Approved return-to-Pending workflow.
- Admission editing.
- Guarded deletion.
- Stable identifiers.
- Branch-scoped display serial projections.

### Acceptance Criteria

- Correct admission create/read/update behavior.
- Current frontend statuses are preserved.
- Receptionist Full Admissions access works.
- Owner view restrictions remain intact.
- Invalid course/batch references fail.
- Unsafe deletion is blocked.
- No duplicate linked records appear after retries.

### Out of Scope

- Unsupported admission Reject functionality.
- Student merge and transfer features without approval.

---

## Phase B05 — Enrollment and Instant Admission

**Objective:** Implement linked student enrollment and complete admission transactions.

### Scope

- Enrollment records.
- Eligibility validation.
- Course and batch assignment.
- Capacity restrictions.
- Duplicate enrollment protection.
- Student activation behavior.
- Instant admission coordination.
- Initial challan creation when required.

### Acceptance Criteria

- Enrollment relationships are valid.
- Duplicate enrollment is prevented.
- Concurrent capacity limits are respected.
- Instant admission is transactionally consistent.
- Frontend receives stable references after success.
- Failures do not create misleading partial success.

---

## Phase B06 — Fees, Challans and Verified Payments

**Objective:** Implement authoritative student fee obligations and collections.

### Scope

- Challans.
- Approved fee calculations.
- Student fee ledgers.
- Partial payments.
- Verification status.
- Payment receipts.
- Outstanding balances.
- Idempotency and concurrency protection.

### Critical Requirements

- Preserve the existing one-challan-per-enrollment behavior.
- Only verified fee payments count toward collected revenue.
- Receptionist has full approved Fees access.
- Do not grant Receptionist independent Finance access.
- Prevent duplicate or excessive payments.
- Preserve financial history.

### Acceptance Criteria

- Fee records are authoritative.
- Partial payments work.
- Balances are accurate.
- Invalid overpayments are rejected.
- Payment retries do not duplicate collections.
- Receipts match actual verified records.
- Reports can derive consistent fee data.

### Out of Scope

- Unapproved refunds, reversals and chargebacks.

---

## Phase B07 — Faculty, Assignments and Classes

**Objective:** Implement teaching relationships and schedules.

### Scope

- Teacher/faculty relationships.
- Faculty assignments.
- Course/Batch/Subject linkage.
- Class schedules.
- Approved schedule conflict validation.
- Assignment-scoped teaching queries.
- Historical assignment preservation.

### Acceptance Criteria

- Assignments reference valid teachers and academic entities.
- Branch ownership is correct.
- Existing schedule constraints are preserved.
- Teacher can retrieve only authorized own assignments.
- Historical assignments remain available where used by Payroll.

---

## Phase B08 — Assignment-Based Teacher Payroll

**Objective:** Implement the approved running-balance salary model.

### Mandatory Business Model

**Salary belongs to an approved Teacher assignment, not to automatically generated monthly payroll periods.**

### Scope

- Salary agreements.
- Fixed/Percentage calculation compatibility.
- Assignment-specific payable obligations.
- Running paid/outstanding balances.
- Partial/full salary payments.
- Preserved payment history.
- Authorized payslips.
- Payroll payment to posted expense linkage.
- Relevant notifications.
- Payroll reporting sources.

### Formula Verification Gate

Before implementing calculations, inspect actual existing frontend files and related tests. Candidate sources include:

- `Client/src/mock/assignmentPayroll.js`.
- `Client/src/mock/runningPayroll.js`.
- `Client/src/services/payrollService.js`.

Use actual discovered paths if they differ.

### Critical Requirements

- No automatic monthly salary generation.
- New assignments may create separate obligations.
- Old unpaid balances must persist.
- Do not overwrite previous agreements.
- Do not allow overpayment.
- Do not double-record salary expenses.
- Payment and corresponding expense must be transactionally consistent.
- Teacher sees only own compensation.
- Receptionist cannot access administrative Payroll.

### Acceptance Criteria

- Fixed salary matches verified frontend calculations.
- Percentage salary matches verified frontend calculations.
- Assignment balances remain separate.
- Partial/full payments update the correct obligation.
- No new-month salary auto-generation exists.
- Expense reconciliation succeeds.
- Duplicate requests cannot create double payment.
- Teacher self-compensation reflects committed payments.

---

## Phase B09 — Finance and Expenses

**Objective:** Implement operational expenses and accurate financial projections.

### Scope

- Authorized operating expense records.
- Expense categories.
- Payroll-linked expense records.
- Finance Overview.
- Verified revenue aggregation.
- Expense aggregation.
- Net financial position.
- Relevant financial filters.

### Requirements

- Financial summaries must derive from authoritative records.
- Only valid verified student fee payments count as collected revenue.
- Posted expenses must use approved classifications.
- Payroll payments must not generate duplicate expenses.
- Owner expense permissions must match verified frontend behavior.
- Receptionist and Teacher have no independent Finance/Expenses access.

### Acceptance Criteria

- Expense records persist.
- Permission boundaries are enforced.
- Finance totals match actual underlying records.
- Payroll expense records are not duplicated.
- Branch and reporting filters work.
- Unsupported corrections/reversals remain disabled.

---

## Phase B10 — Teacher My Profile

**Objective:** Deliver secure backend-backed Teacher self-service.

### Frontend Route

`/my-profile`

### Existing Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Scope

- Own profile information.
- Own teaching schedule.
- Own assignments.
- Own salary agreements.
- Own verified payments.
- Own running outstanding.
- Own payslips and supported exports.
- Own notifications.

### Acceptance Criteria

- Teacher identity is taken from authenticated session.
- Teacher can view own approved data.
- Another Teacher's profile/salary cannot be retrieved.
- Payroll views use the same authoritative records as administrative modules.
- Existing profile printing and presentation continue working.

---

## Phase B11 — Demo Classes

**Objective:** Implement verified demo inquiry and conversion workflows.

### Scope

- Demo inquiries.
- Approved attendance/no-show states.
- Permitted updates and cancellation.
- Admissions prefill/conversion.
- Duplicate conversion prevention.
- Branch scope.

### Acceptance Criteria

- Demo records persist.
- Approved statuses work.
- Conversions link correctly to Admissions.
- Repeated conversion does not create unintended duplicates.
- No unapproved enrollment or payment is fabricated.

---

## Phase B12 — Physical Assets

**Objective:** Implement existing physical inventory workflows.

### Scope

- Inventory records.
- Asset identification.
- Staff assignment/unassignment.
- Condition inspections.
- Maintenance events.
- Branch-scoped inventory reporting.

### Acceptance Criteria

- Physical asset records persist.
- Assignment and event history is preserved.
- Role and branch restrictions work.
- Unsupported depreciation/disposal remains disabled.
- No Cloudinary or digital-media infrastructure is introduced.

---

## Phase B13 — Reports, Ledgers and Dashboard Projections

**Objective:** Replace mock-derived views with authoritative backend projections.

### Scope

- Academic reports.
- Admission and enrollment reports.
- Student fee ledgers.
- Verified collection reports.
- Expense and Finance summaries.
- Assignment-based Payroll reports.
- Authorized cross-branch comparison.
- Dashboard KPIs.
- Existing supported exports.

### Acceptance Criteria

- Reports agree with underlying records.
- No verified payment is double-counted.
- Payroll outstanding matches assignment-level obligations.
- Reports and exports enforce authorization.
- Cross-branch access is explicitly permitted.
- Teacher and Receptionist cannot obtain unrelated financial data.
- Existing print/export presentation remains functional.

---

## Phase B14 — Audit, Notifications and Settings

**Objective:** Complete shared operational services.

### Scope

- Protected audit event persistence.
- Authorized audit views.
- Teacher salary-payment notifications.
- Personal notification reads.
- Approved organization/branch settings.
- Academy profile and theme configuration.

### Acceptance Criteria

- Required sensitive operations have durable audit records.
- Audit data cannot be modified through ordinary APIs.
- Notifications reference actual successful events.
- Notification failures cannot duplicate financial operations.
- Existing academy branding works.
- Unauthorized settings changes are denied.

---

## Phase B15 — Frontend HTTP Integration

**Objective:** Switch completed frontend modules from mock services to the backend.

### Required Integration Strategy

```text
Existing:

React Page
  → Domain Service
  → Mock Adapter
  → localStorage

Target:

React Page
  → Domain Service
  → HTTP Adapter
  → Express API
  → MongoDB
```

### Rules

- Preserve page components wherever feasible.
- Preserve service method signatures where feasible.
- Normalize backend responses in the adapter.
- Maintain existing status transitions and formulas.
- Use real authenticated user/branch context.
- Prevent stale previous-branch data from appearing.
- Refresh dependent modules after committed writes.
- Preserve error and loading feedback.
- Do not silently discard local demo data.

### Migration Strategy

Integrate by domain rather than switching every page in a single uncontrolled change.

Data import from browser-local storage requires a separate approved migration decision.

### Acceptance Criteria

- Existing user workflows behave consistently.
- No production feature relies on localStorage as the authoritative database.
- Financial records remain consistent across multiple users.
- Role, branch and record authorization work at the API boundary.
- Relevant frontend tests and integration tests pass.

---

## Phase B16 — Security, Concurrency and Release Verification

**Objective:** Establish a verified release candidate.

### Security Verification

- Session security.
- CSRF and CORS where applicable.
- Five-role authorization.
- Protected Admin/Super Admin accounts.
- Organization and branch isolation.
- Teacher self-only salary access.
- Record-level access and IDOR protection.
- Secure error handling.
- Protected exports.
- Secrets management.

### Financial Verification

- Verified fee collections.
- Accurate outstanding fees.
- Assignment-based running payroll.
- No monthly salary generation.
- Partial/full salary settlement.
- No duplicate payments.
- Salary-to-expense reconciliation.
- Consistent Dashboard/Finance/Reports totals.

### Concurrency Verification

- Two users enrolling simultaneously.
- Duplicate admission completion.
- Simultaneous fee payments.
- Simultaneous salary disbursements.
- Stale agreement updates.
- Role/branch revocation during sessions.

### Operational Verification

- Database backup plan.
- Restore testing.
- Environment validation.
- Deployment readiness.
- Application logging and health checks.
- Representative user acceptance scenarios.

### Acceptance Criteria

- Relevant backend tests pass.
- Critical frontend regression tests pass.
- Financial and access-control invariants hold.
- No known critical security/integrity blocker remains.
- Deployment and rollback process is documented.
- Owner acceptance occurs separately from technical verification.

---

## 8. Module Dependency Order

Dependencies should guide implementation sequencing.

```text
Backend Foundation
        |
        v
Authentication + RBAC + Branch Scope
        |
        v
Academic Catalog + Users
        |
        v
Students + Admissions
        |
        v
Enrollment
        |
        v
Challans + Verified Fee Payments
        |
        +---------------> Finance / Reports
        |
        v
Faculty Assignments + Classes
        |
        v
Teacher Salary Agreements
        |
        v
Running Payroll + Salary Payments
        |
        v
Linked Expenses + Reports
        |
        v
Teacher My Profile
```

Demo Classes, Assets, Audit, Notifications and Settings should be integrated at the points required by their dependent workflows.

### Important Ordering Note

Cross-cutting infrastructure such as audit and notifications may require small supporting components in earlier phases.

Their full user-facing modules can be completed later without postponing required financial audit guarantees.

---

## 9. Development Ticket Template

Each backend ticket should contain:

### Ticket Header

- Ticket ID.
- Module.
- Status.
- Priority.
- Dependencies.
- Relevant documentation.

### Objective

State one clear implementation outcome.

### Scope

Identify the exact operations and expected behavior.

### Required Files

List the actual files expected to change after repository inspection.

### Business Rules

Reference the approved invariants rather than rewriting entire specifications.

### Security

State required role, branch and record checks.

### Data Model

Reference the approved schema and relationships.

### API Contract

List the relevant accepted endpoints and payloads.

### Tests

Specify minimal meaningful success and failure tests.

### Acceptance Criteria

Define observable behavior that establishes completion.

### Restrictions

Do not modify unrelated modules or introduce unapproved functionality.

### Completion Report

Provide a concise Roman Urdu summary of:

- Changed files.
- Implemented behavior.
- Tests actually run.
- Results.
- Remaining limitations.
- Git status.

---

## 10. Definition of Ready

A backend ticket is ready for implementation only when:

- Its approved business outcome is clear.
- Relevant frontend source has been inspected.
- Required role/branch behavior is understood.
- Necessary API contract is defined.
- Relevant data relationships are understood.
- Critical transaction requirements are established.
- Dependencies are available.
- Unresolved blocking product decisions are identified.
- The intended test coverage is clear.

Do not invent business rules to bypass an unresolved blocker.

---

## 11. Definition of Done

A ticket may be marked complete only when:

1. The approved implementation is present.
2. No unrelated functionality has been changed unnecessarily.
3. Input validation is in place.
4. Authentication and authorization are enforced where required.
5. Branch and record ownership are checked.
6. Applicable business rules are enforced.
7. Required transactions and duplicate protection work.
8. Relevant tests were actually executed.
9. Tests passed or failures are explicitly reported.
10. Frontend integration behavior is preserved where applicable.
11. Documentation reflects verified changes.
12. `PROGRESS.md` records only true implementation status.

**Code written is not equivalent to feature accepted.**

Owner acceptance must not be claimed without actual owner approval.

---

## 12. Testing Strategy

### Unit Tests

Test independent domain calculations and validation rules.

Examples:

- Fee totals.
- Fixed/Percentage remuneration.
- Outstanding balances.
- Permission decisions.
- Admission state transitions.

### Integration Tests

Test:

- Express routes.
- Authentication.
- MongoDB persistence.
- Entity relationships.
- Transaction rollback.
- Idempotency.
- Concurrency safeguards.

### Frontend Integration Tests

Verify:

- Domain-service compatibility.
- Real HTTP adapter behavior.
- Branch switching.
- Protected routes.
- Form feedback.
- Dependent data refresh.
- Teacher self-service.
- Existing print/export functionality.

### Security Tests

Verify positive and negative permissions for all five roles.

### Financial Reconciliation Tests

Compare:

- Challans with verified fee payments.
- Payroll obligations with salary payments.
- Salary payments with linked expenses.
- Finance totals with actual financial records.

### Execution Rule

Do not run unnecessarily broad test suites for every small change. Run targeted tests first and expand only where justified by dependencies or release gates.

Never claim tests passed unless executed.

---

## 13. Migration Strategy

Moving browser-local demo information into MongoDB is a separate concern from implementing APIs.

### Required Planning

- Identify local mock schema versions.
- Map frontend records to authoritative backend entities.
- Preserve stable identity relationships.
- Validate academic references.
- Reconcile student fee history.
- Preserve assignment-based payroll history.
- Detect inconsistent or duplicate records.
- Define approved import behavior.
- Create backup and rollback procedures.
- Obtain explicit authorization before importing real user data.

### Restrictions

- Do not silently migrate localStorage.
- Do not overwrite existing demo records without approval.
- Do not erase historical payroll balances.
- Do not fabricate missing verified payments.
- Do not reinterpret already recorded financial transactions.

---

## 14. Deployment Strategy

The approved initial delivery direction is a hosted web demonstration and client testing workflow.

### Proposed Deployment Components

- Hosted React frontend.
- Hosted Express API.
- MongoDB database appropriate for the environment.
- Secure environment configuration.
- HTTPS.
- Appropriate CORS and cookie/session configuration.
- Application logging.
- Health monitoring.

The exact hosting provider and deployment topology remain TBD.

### Important

A frontend hosting platform must support the selected backend deployment approach or be paired with a compatible API host.

Do not assume a traditional persistent Express server runs unchanged in every serverless environment.

Do not implement Electron, desktop/LAN synchronization or multi-client SaaS infrastructure during this phase.

### Release Requirements

- Separate development and production secrets.
- Safe database connection management.
- Correct frontend-to-backend API configuration.
- Secure cookie and CORS policy.
- Basic backup and recovery readiness.
- Tested rollback procedures.
- Relevant UAT scenarios.

---

## 15. Git and Change-Control Rules

Each backend ticket must respect existing repository conventions.

### Requirements

- Read `AGENTS.md`.
- Inspect current Git status.
- Preserve unrelated user changes.
- Do not reset, stash or clean without explicit authorization.
- Do not commit or push without explicit approval.
- Keep source changes limited to the current ticket.
- Avoid unnecessary dependency changes.
- Preserve useful explanatory comments.
- Report actual changed files and test results.

The repository's capitalized directory names **`Client/` and `Server/`** must be preserved.

---

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Outdated documentation contradicts frontend | Verify current source and latest owner decisions |
| API contract mismatch | Preserve frontend service interface through HTTP adapter |
| Cross-branch information leak | Server-side scope and record ownership enforcement |
| Admin privilege escalation | Explicit protected-role restrictions |
| Duplicate fee collection | Idempotency, transactions and balance checks |
| Duplicate salary payment | Concurrent balance validation and idempotency |
| Salary expense inconsistency | One durable payroll-to-expense relationship |
| Incorrect monthly payroll implementation | Explicit assignment-based running balance model |
| Incorrect Fixed/Percentage formula | Verify current frontend calculation and tests |
| Lost local demo data | Separate approved migration planning |
| Unsafe branch deletion | Enforce current dependency blockers |
| Feature creep | Require an approved ticket for additional functionality |
| Frontend regressions | Incremental domain integration and targeted tests |
| Production authentication weakness | Session, cookie, CSRF, CORS and rate-limit review |
| Unverified completion claims | Evidence-based test reports and progress updates |

---

## 17. Milestones and Exit Gates

| Milestone | Covers | Exit requirement |
|---|---|---|
| M1 — Foundation | B00–B02 | Backend startup, authentication, RBAC and branch security verified |
| M2 — Academic Core | B03–B05 | Academic references, Admissions and Enrollment verified |
| M3 — Student Finance | B06 | Challans, collections, receipts and balances verified |
| M4 — Teaching Core | B07 | Faculty assignments and schedules verified |
| M5 — Payroll & Finance | B08–B09 | Running payroll, linked expenses and Finance verified |
| M6 — Operational Modules | B10–B14 | Self-service, Demo, Assets, Reports, Audit and Settings verified |
| M7 — Integration | B15 | Existing frontend workflows backed by HTTP/MongoDB |
| M8 — Release | B16 | Security, data-integrity, recovery and acceptance checks |

These milestones are proposed planning gates, not claims that work has already been completed.

---

## 18. Reporting and Progress Tracking

Every completed backend ticket should update the existing project tracking documents where separately authorized.

### `TASKS.md`

Record:

- Ticket status.
- Dependencies.
- Remaining work.
- Blockers.

### `PROGRESS.md`

Record:

- Implemented behavior.
- Changed files.
- Actual tests executed.
- Pass/fail outcomes.
- Remaining limitations.

### `MEMORY.md`

Record lasting owner-approved architectural or business decisions, not temporary debugging notes.

### Important Status Rule

Distinguish:

- PLANNED.
- IN_PROGRESS.
- IMPLEMENTED.
- TESTED.
- IN_REVIEW.
- OWNER_ACCEPTED.

Do not claim formal owner acceptance on the basis of code completion or an automated test.

---

## 19. Open Decisions

Before affected backend implementation, confirm:

- Final API response envelope.
- Exact DTOs and frontend service mappings.
- Production authentication/session configuration.
- Monetary representation and rounding.
- Exact Fixed/Percentage payroll formula.
- Same-branch multiple-role policy.
- Student identity sharing across branches.
- Approved payment verification lifecycle.
- Financial refund/reversal governance.
- Expense correction policies.
- Historical data import requirements.
- Hosting/deployment provider.
- Audit/data retention and backup targets.

Unresolved decisions remain TBD and must not be silently guessed.

---

## 20. Explicitly Deferred Work

The current backend plan does not include:

- Platform Admin dashboard.
- Multi-academy commercial SaaS provisioning.
- Subscription or license billing platform.
- Automatic monthly teacher payroll.
- Unapproved refunds or financial reversals.
- Student-transfer and merge workflows without approval.
- Cloudinary/image/video upload infrastructure.
- Electron desktop packaging.
- Offline/LAN synchronization.
- Premature microservices, message brokers or realtime features.

Deferred work requires separate owner approval and planning.

---

## 21. Related Documentation

This plan must remain aligned with:

- `AGENTS.md` — AI coding-agent instructions.
- `RULES.md` — Engineering boundaries.
- `PRD.md` — Approved product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `SECURITY.md` — Security model.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Branch isolation.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATA_FLOW.md` — Data movement.
- `TRANSACTIONS_AND_INTEGRITY.md` — Transaction safety.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — MongoDB design.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — Proposed endpoint contracts.
- `FRONTEND_INTEGRATION.md` — Frontend service compatibility.
- `FRONTEND_AUDIT.md` — Frontend behavior evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend integration handoff.
- `MODULE_WORKFLOW_MAP.md` — Module dependencies.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role and scope mapping.
- `BACKEND_GAPS_AND_RISKS.md` — Open backend risks.
- `FEATURE_TICKETS.md` — Feature implementation backlog.
- `TASKS.md` — Current ticket tracking.
- `MEMORY.md` — Decision history.
- `PROGRESS.md` — Verified development history.

Use actual repository paths for relative Markdown links.

---

## 22. Final Implementation Boundary

### Confirmed Requirements

- Existing React/Vite frontend remains the behavioral reference.
- Backend stack is Node.js, Express, MongoDB and Mongoose.
- Modular monolith architecture.
- Five roles.
- Receptionist Full Admissions and Fees access.
- Teacher own-profile and compensation access.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Branch creation currently paused.
- Physical inventory Assets without media upload implementation.

### Proposed Implementation

- Backend module sequencing.
- Express route/controller/service/repository structure.
- API adapter migration order.
- Transaction and concurrency strategies.
- Testing and acceptance gates.
- Deployment architecture.

### Deferred

- Multi-client SaaS.
- Platform Admin.
- Cloudinary/media management.
- Electron/offline features.
- Unsupported financial reversals.
- Unnecessary distributed infrastructure.

### Not Yet Verified

- Exact current backend repository baseline.
- Final accepted API and database contracts.
- Production deployment topology.
- Completed backend integration tests.
- Owner acceptance of backend functionality.

**Governing Principle:** Build the smallest secure, maintainable backend that reproduces TSA Academy ERP's approved frontend workflows, enforces authorization and branch isolation, maintains academic and financial integrity, and integrates incrementally with verified tests.

**Document Status:** DRAFT — Ready for backend implementation planning review. Actual coding requires separately approved, scoped development tickets.
