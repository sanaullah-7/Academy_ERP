# FEATURE_DEVELOPMENT

<!-- > Purpose: Defines the safe workflow for implementing, reviewing and testing new ERP features. -->


# TSA Academy ERP — Feature Development & Engineering Workflow

**Document:** FEATURE_DEVELOPMENT.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Engineering Workflow Specification
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Repository:** `Client/` and `Server/`
**Primary Goal:** Implement and maintain approved ERP features without introducing regressions or unauthorized functionality.

---

## 1. Purpose

This document defines the feature development standards, implementation workflow, ticket requirements, review process and completion criteria for TSA Academy ERP.

It guides developers and AI coding agents in building and maintaining the application using the approved project architecture and business rules.

Its objectives are to:

- Maintain consistency with the completed frontend.
- Implement backend capabilities in manageable increments.
- Preserve approved academic and financial workflows.
- Prevent unauthorized functionality and scope expansion.
- Enforce security and branch isolation.
- Maintain database and API contract compatibility.
- Protect existing code and historical records.
- Produce reliable tests and accurate progress reports.
- Support efficient collaboration and future maintenance.

**Important:** This document defines the development process. It does not authorize implementing a feature, modifying application files, running migrations, committing changes or deploying releases.

---

## 2. Engineering Principles

### DEV-001 — Approved Scope Only

Implement only the functionality authorized by the active development ticket.

### DEV-002 — Existing Frontend Compatibility

Preserve approved React frontend behavior unless a separate owner decision changes it.

### DEV-003 — Source Verification

Inspect actual source files before modifying existing features or defining final contracts.

### DEV-004 — Minimal Relevant Changes

Keep modifications limited to the ticket's purpose and necessary dependencies.

### DEV-005 — No Unauthorized Refactoring

Do not rewrite unrelated components, modules or utilities.

### DEV-006 — Security First

Every protected backend feature must enforce authentication, role permissions, branch ownership and record-level restrictions.

### DEV-007 — Business Integrity

Academic relationships, student fees and Teacher Payroll must remain internally consistent.

### DEV-008 — Reusable Domain Logic

Avoid duplicating calculations and business rules across modules.

### DEV-009 — Test Relevant Behavior

Verify both expected success and meaningful failure scenarios.

### DEV-010 — Honest Reporting

Report only actual code changes and tests executed.

---

## 3. Project Development Baseline

### 3.1 Frontend

The existing frontend uses:

- React.
- Vite.
- Centralized domain services.
- Mock API/database adapters.
- Browser localStorage for demonstration data.
- Authentication and branch contexts.
- Role-based route and navigation restrictions.
- Academy branding and theme context.

The frontend contains 16 operational modules:

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

Shared capabilities include Teacher My Profile, notifications, branch switching, printing and approved exports.

### 3.2 Backend

The planned backend stack is:

- Node.js.
- Express.js.
- MongoDB.
- Mongoose.
- Modular monolith architecture.

Before starting implementation, inspect the actual `Server/` directory and its existing configuration.

Do not assume previously implemented files, scripts or database connections are absent.

### 3.3 Initial Product Scope

The initial product serves one academy organization with multiple branches.

Future Platform Admin and commercial multi-academy SaaS features are deferred.

---

## 4. Approved Business Boundaries

All feature tickets must preserve the current approved rules.

### Five Roles

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Receptionist

Receptionist has Full Access to the approved existing:

- Admissions.
- Fees.

This does not grant access to independent Finance, Expenses, Teacher Payroll, Audit Log, Branches, Users or administrative Settings.

### Teacher

Teacher can view their own:

- Profile and biography.
- Timetable.
- Academic assignments.
- Salary agreement.
- Agreed, paid and outstanding amounts.
- Verified salary payment history.
- Payslips.
- Personal notifications.

Teacher cannot access another Teacher's compensation or administrative Payroll management.

### Teacher Payroll

The approved payroll model is assignment/batch/subject-based running remuneration.

- No automatic monthly salary generation.
- Preserve separate assignment obligations.
- Preserve historical agreements and payments.
- Support approved partial/full disbursements.
- Prevent unsupported overpayment.
- Reconcile payroll payments with posted expenses.
- Preserve existing Fixed/Percentage calculations.

### Branches

- Users may have different roles across branches.
- Unsupported same-branch multiple-role combinations fail closed.
- Branch creation is currently paused for all roles.
- Branch and record isolation must be enforced server-side.

### Assets

The Assets module manages physical inventory.

Do not introduce Cloudinary, media upload or digital asset management without separate approval.

---

## 5. Documentation Sources

Before implementing a feature, consult the relevant authoritative documentation.

| Document | Responsibility |
|---|---|
| `AGENTS.md` | AI coding-agent instructions |
| `RULES.md` | Engineering rules |
| `MEMORY.md` | Owner-approved decision history |
| `PRD.md` | Product requirements |
| `SYSTEM_DESIGN.md` | Business workflows |
| `ARCHITECTURE.md` | Technical architecture |
| `SECURITY.md` | Security requirements |
| `RBAC_PERMISSIONS.md` | Role/action permissions |
| `TENANT_BRANCH_ISOLATION.md` | Ownership and branch scope |
| `ERD.md` | Entity relationships |
| `DATABASE.md` | MongoDB persistence design |
| `API.md` | REST API architecture |
| `API_CONTRACTS.md` | API request/response specifications |
| `BUSINESS_RULES.md` | Domain invariants |
| `DATA_FLOW.md` | Cross-module data flow |
| `TRANSACTIONS_AND_INTEGRITY.md` | Atomicity and concurrency |
| `BACKEND_IMPLEMENTATION_PLAN.md` | Development phases |
| `BACKEND_TESTING_STRATEGY.md` | Testing requirements |
| `FRONTEND_INTEGRATION.md` | Existing frontend service boundaries |
| `TASKS.md` | Development work tracking |
| `PROGRESS.md` | Verified implementation status |

### Documentation Precedence

When documents contradict one another:

1. Follow the latest explicit owner-approved decision.
2. Check the actual current frontend implementation.
3. Review relevant tests and implementation evidence.
4. Use the domain's authoritative specification.
5. Mark older contradictory requirements as superseded.

Do not invent a rule to resolve a genuine unanswered product decision.

---

## 6. Feature Development Lifecycle

Every approved feature should follow a consistent process.

```text
Feature Request
      |
      v
Scope and Requirements
      |
      v
Existing Code Inspection
      |
      v
Dependency and Impact Analysis
      |
      v
Design and Contract Review
      |
      v
Implementation
      |
      v
Targeted Testing
      |
      v
Security and Regression Review
      |
      v
Completion Report
      |
      v
Review / Owner Acceptance
```

A feature is not considered formally accepted until the required approval has occurred.

---

## 7. Feature Request Classification

Classify each requested task before implementation.

| Type | Description |
|---|---|
| New Feature | Adds approved functionality |
| Enhancement | Improves an existing feature |
| Bug Fix | Corrects existing incorrect behavior |
| Refactor | Improves structure without changing behavior |
| Security Fix | Addresses an access-control or security weakness |
| Data Fix | Corrects approved database inconsistencies |
| Integration | Connects frontend and backend services |
| Documentation | Changes specifications or project guidance |
| Testing | Adds or repairs verification |
| Deployment | Changes hosting or release configuration |

### Important

A documentation ticket must not automatically modify application code.

A backend feature ticket must not become an unrelated frontend redesign.

A bug fix must not introduce an unapproved business workflow.

---

## 8. Development Ticket Requirements

Each implementation ticket should clearly state:

### Ticket Identification

- Ticket ID.
- Feature/module.
- Objective.
- Priority.
- Status.

### Scope

- Required user behavior.
- Permitted operations.
- Relevant pages/services.
- Related database records.
- Expected response or visible result.

### Dependencies

- Existing modules.
- Required API contracts.
- Mongoose models.
- Authentication and authorization.
- Related financial or academic records.

### Acceptance Criteria

Define how successful implementation will be verified.

### Out of Scope

Explicitly identify features and changes not authorized by the ticket.

### Tests

Identify relevant unit, integration, security and regression tests.

Avoid unnecessarily broad testing requirements for a small isolated change.

---

## 9. Ticket Status Workflow

Use meaningful development states.

| Status | Meaning |
|---|---|
| PLANNED | Defined but not started |
| READY | Requirements and dependencies sufficiently clear |
| IN_PROGRESS | Implementation underway |
| IMPLEMENTED | Requested code exists |
| TESTED | Relevant tests executed successfully |
| IN_REVIEW | Awaiting review or acceptance |
| BLOCKED | Cannot proceed due to documented dependency |
| OWNER_ACCEPTED | Explicitly accepted by the owner |
| DEFERRED | Intentionally postponed |
| CANCELLED | No longer required |

### Status Integrity

Do not mark a feature TESTED because tests were merely written.

Do not mark OWNER_ACCEPTED because Codex completed the code.

Record unresolved work and test failures accurately.

---

## 10. Pre-Implementation Inspection

Before editing code:

1. Read root `AGENTS.md`.
2. Inspect Git status.
3. Identify the current target files.
4. Check existing application architecture.
5. Inspect relevant frontend domain services.
6. Inspect mock database records and adapters where applicable.
7. Review existing tests for the affected feature.
8. Check relevant documentation.
9. Identify connected modules and side effects.
10. Determine the smallest safe change.

### Efficient Inspection

Read files relevant to the ticket.

Do not repeatedly scan the entire repository without a clear reason.

However, inspect additional files when necessary to understand critical financial, authorization or cross-module dependencies.

---

## 11. Frontend Development Rules

The existing frontend is the behavioral baseline.

### Requirements

- Preserve working layouts and user actions.
- Maintain existing component patterns.
- Respect Auth, Branch, Academy and Theme contexts.
- Keep business calculations in domain services.
- Use reusable components where appropriate.
- Maintain responsive layouts.
- Preserve existing role-specific navigation.
- Maintain existing printing/export behavior.
- Protect unsaved user input where feasible.
- Handle loading, empty and error states.

### Restrictions

Do not:

- Rewrite a functional module without approval.
- Move shared state into unrelated components.
- Duplicate business logic across pages.
- Break other branches through local state changes.
- Display false financial success before backend confirmation.

---

## 12. Backend Development Rules

The backend must follow a modular monolith structure.

### Proposed Request Lifecycle

```text
HTTP Request
     |
     v
Authentication
     |
     v
Organization and Branch Scope
     |
     v
Action and Record Authorization
     |
     v
Input Validation
     |
     v
Controller
     |
     v
Domain Service
     |
     v
Repository
     |
     v
MongoDB
```

### Responsibilities

| Component | Responsibility |
|---|---|
| Route | Endpoint registration and middleware |
| Controller | HTTP request/response handling |
| Validator | Request shape and field validation |
| Domain Service | Business rules and transaction coordination |
| Repository | Authorized persistence operations |
| Model | Mongoose schema and database constraints |
| Middleware | Authentication, authorization and request security |

Avoid placing salary formulas, financial transaction logic or complex status transitions directly in controllers.

The exact module directory structure must follow the approved repository architecture.

---

## 13. API Development Rules

Every new backend endpoint must:

- Map to an approved frontend workflow or required infrastructure operation.
- Follow accepted API versioning.
- Authenticate protected requests.
- Enforce applicable action permissions.
- Enforce organization and branch scope.
- Validate target-record ownership.
- Validate request fields.
- Return the accepted response contract.
- Handle errors consistently.
- Preserve idempotency for sensitive writes.
- Support relevant tests.

### Contract Verification

Before implementation, verify actual frontend service signatures.

Do not fabricate method names or DTO fields from page names.

Proposed endpoint paths in documentation are not automatically final accepted contracts.

---

## 14. Database Development Rules

Use MongoDB and Mongoose for the approved backend.

### Requirements

- Stable record identifiers.
- Correct organization/branch ownership.
- Valid cross-collection references.
- Appropriate schema validation.
- Necessary uniqueness constraints.
- Suitable query indexes.
- Transaction-aware related writes.
- Historical financial record preservation.

### Restrictions

- Never trust a browser-supplied organization ID as authority.
- Never use unscoped mutations on protected data.
- Never overwrite payment history to correct a balance.
- Never perform unauthorized migrations.
- Never directly expose MongoDB documents without appropriate response mapping.

---

## 15. Domain Business Logic Rules

Business logic must be centralized by domain.

### Academic Logic

- Admission status transitions.
- Student and Enrollment linkage.
- Course/Batch compatibility.
- Batch capacity.
- Teaching assignments.
- Class schedules.

### Financial Logic

- Challan creation.
- Fee calculation.
- Verified payments.
- Outstanding balances.
- Expense posting.
- Assignment salary agreements.
- Running Teacher Payroll.
- Financial reporting.

### Design Rule

The same financial calculation should not be separately implemented in a page, API controller, reporting service and database hook.

Use an approved domain service or shared pure calculation function.

---

## 16. Financial Feature Development

Financial features require stronger validation and testing.

### Student Fees

Preserve:

- Approved challan calculation.
- Existing one-challan-per-enrollment behavior.
- Partial payments.
- Verified collections.
- Accurate outstanding balances.
- Duplicate prevention.
- Receipt integrity.

### Teacher Payroll

**CONFIRMED:** Payroll is assignment-based running remuneration.

Preserve:

- Fixed/Percentage agreement methods.
- Independent assignment obligations.
- Historical payment records.
- Partial/full settlement.
- Accurate outstanding balances.
- Matching posted expenses.
- Teacher self-compensation visibility.

### Prohibited Without Approval

- Automatic monthly salary generation.
- Unapproved fee refunds.
- Unapproved payment reversals.
- Unsupported salary advances.
- Silent historical balance adjustments.
- Uncontrolled payment deletion.

### Formula Verification

Inspect relevant actual frontend source before implementing salary calculations.

Candidate source files include:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Use the actual discovered paths and related tests.

Do not assume filenames prove implementation behavior.

---

## 17. Multi-Module Feature Dependencies

A feature may change several connected views.

| Operation | Related modules |
|---|---|
| Admission creation | Admissions, Students, Dashboard |
| Enrollment | Admissions, Students, Batches, Fees |
| Challan creation | Fees, Student Ledger |
| Verified fee payment | Fees, Finance, Dashboard, Reports |
| Faculty assignment | Faculty, Classes, Teacher Profile, Payroll |
| Salary agreement | Payroll, Teacher Profile |
| Salary payment | Payroll, Expenses, Finance, Reports, Notifications |
| Demo conversion | Demo Classes, Admissions |
| Asset event | Assets, Inventory Reports |
| Branch switch | Navigation, permissions, branch-scoped data |
| Role change | Users, permissions, sessions |
| Settings update | Academy and Theme Context |

### Rule

Inspect the relevant dependencies before implementation.

Do not update unrelated modules unnecessarily, but do not ignore required consistency effects.

---

## 18. Transactions and Idempotency

Use transactions for workflows whose required durable records must succeed together.

### Examples

- Instant admission completion.
- Enrollment and linked challan creation.
- Sensitive fee payment operations.
- Salary payment with matching expense.
- Approved multi-record role/branch mutations.

### Requirements

- Validate business state.
- Prevent duplicate records.
- Preserve authoritative balances.
- Handle concurrent requests.
- Use appropriate unique constraints.
- Roll back required related writes on failure.
- Record mandatory audit events.
- Return success only after required persistence commits.

A transaction alone is insufficient to prevent every race condition.

Idempotency and conditional updates may also be necessary.

---

## 19. Feature Authorization

Every protected operation must enforce:

1. Authentication.
2. Account status.
3. Organization ownership.
4. Branch permission.
5. Action permission.
6. Target-record ownership.
7. Applicable business rules.

### Receptionist

Full approved Admissions/Fees access.

No independent Finance, Expenses or Teacher Payroll access.

### Teacher

Own approved teaching information and compensation only.

### Admin

Respect protected-role and privileged-account restrictions.

### Super Admin

Respect current branch-creation pause and business integrity constraints.

### Owner

Follow verified action-level grants rather than inferred unrestricted authority.

---

## 20. Validation and Error Handling

### Input Validation

Check:

- Required fields.
- Field types.
- Length/range restrictions.
- Allowed status values.
- Valid IDs and references.
- Monetary amounts.
- Branch relationships.
- Protected writable fields.

### Error Handling

Use safe, consistent error responses.

Distinguish:

- Authentication failure.
- Authorization failure.
- Validation failure.
- Missing resource.
- Business conflict.
- Concurrency conflict.
- Unexpected server failure.

### UI Feedback

The frontend must:

- Display useful validation messages.
- Preserve reasonable form state after errors.
- Avoid false success notifications.
- Handle session expiration.
- Handle permission changes.
- Avoid retrying financial writes unsafely.

---

## 21. Feature Testing Requirements

Every feature ticket must identify relevant tests.

### Unit Tests

Check independent calculations, validation and state-transition functions.

### Integration Tests

Check database relationships, services and transactions.

### API Tests

Check methods, payloads, status codes, permissions and response contracts.

### Security Tests

Check unauthorized roles, branches and records.

### Regression Tests

Check existing connected workflows.

### Concurrency Tests

Required for race-sensitive enrollment and financial operations.

### Testing Principle

Prefer targeted meaningful tests first.

Run broader suites when shared infrastructure, authentication or cross-module behavior changes.

Do not report tests as PASSED unless actually executed.

---

## 22. Code Review Standards

Review each feature for:

- Approved scope compliance.
- Correct business behavior.
- Relevant source compatibility.
- Security and authorization.
- Branch isolation.
- Data validation.
- Transaction integrity.
- Error handling.
- Unnecessary dependencies.
- Duplicate business logic.
- Regression risk.
- Readability and maintainability.
- Accurate documentation and test evidence.

### Financial Review

For payment-related changes, explicitly inspect:

- Duplicate protection.
- Outstanding balance validation.
- Linked financial records.
- Failure rollback.
- Permission restrictions.
- Relevant audit records.

---

## 23. Feature Completion Report

After an implementation ticket, provide a concise Roman Urdu completion report.

### Required Information

- Ticket ID.
- Feature/module.
- Actual files changed.
- Implemented behavior.
- Tests executed.
- Test results.
- Unresolved limitations.
- Git status.

### Example Reporting Style

**Ticket:** B06-FEES-001
**Status:** IMPLEMENTED / IN_REVIEW

**Changed:** Relevant Fees service, controller, repository and tests.

**Implemented:** Approved challan and verified-payment behavior.

**Tests:** Only the tests actually executed should be listed.

**Pending:** Any unresolved limitation or acceptance step.

Do not claim deployment, production readiness or owner acceptance without evidence.

---

## 24. Git and File Safety

### Requirements

- Preserve unrelated changes.
- Inspect `git status`.
- Keep edits within approved scope.
- Do not reset, stash or clean without explicit authorization.
- Do not force-push shared branches.
- Do not commit or push without authorization.
- Preserve existing explanatory comments where useful.
- Avoid unnecessary formatting changes.
- Keep the repository directory names unchanged.

### Documentation-Only Tickets

Documentation tasks must not automatically modify:

- `Client/` application code.
- `Server/` application code.
- Package manifests.
- Database data.
- Environment secrets.
- Deployment configuration.

---

## 25. Feature Dependencies and Blockers

A development ticket may depend on:

- Approved business requirements.
- Existing frontend behavior.
- Finalized API contract.
- Finalized database relationship.
- Authentication and permissions.
- Completed prerequisite service.
- Transaction support.
- Test environment.

### Blocker Handling

If a required decision is unresolved:

1. Identify the exact dependency.
2. Explain the implementation impact.
3. Preserve existing approved behavior.
4. Avoid speculative expansion.
5. Continue only with independent, safe parts of the ticket.

Do not silently decide owner-level business policy.

---

## 26. Refactoring Guidelines

Refactoring should improve maintainability without changing approved behavior.

### Appropriate Cases

- Removing real duplication.
- Improving testability.
- Isolating domain calculations.
- Simplifying overly coupled code.
- Correcting unsafe query patterns.
- Making validation consistent.

### Requirements

- Keep refactoring limited.
- Preserve service interfaces where practical.
- Add relevant regression tests.
- Avoid introducing unrelated abstractions.
- Do not rewrite stable modules without a clear need.

Large architectural migrations require separate approval.

---

## 27. Dependency Management

### Rules

- Inspect existing dependencies before adding packages.
- Prefer existing maintained utilities.
- Avoid installing several libraries for the same purpose.
- Preserve the repository lockfile.
- Review license and security implications.
- Explain the need for each new dependency.
- Test dependency changes.
- Do not introduce Redis, Cloudinary or external queues without approved requirements.

The use of a library must solve a real project need rather than satisfy a generic technology checklist.

---

## 28. CI and Quality Gates

The project's existing CI must be inspected before changes.

### Suggested Checks

- Relevant lint/static checks.
- Targeted unit tests.
- API tests.
- MongoDB integration tests.
- Frontend regression tests where affected.
- Build verification.
- `git diff --check`.

### Rules

- Use the project's actual package scripts.
- Do not invent test commands.
- Keep CI efficient.
- Do not expose secrets.
- Do not use destructive production database actions.
- Do not claim CI passed without an actual successful run.

---

## 29. Feature Acceptance Criteria

A feature is technically complete when:

1. Approved functionality exists.
2. Input validation works.
3. Authentication and authorization work where required.
4. Branch and record scope is correct.
5. Domain invariants hold.
6. Related persistent records are consistent.
7. Relevant tests have passed.
8. Connected frontend behavior remains compatible.
9. No critical known regression remains.
10. Documentation accurately records verified status.

**Owner acceptance is separate from technical completion.**

---

## 30. Feature Release Readiness

Before deployment, verify:

- Relevant source changes reviewed.
- Required tests passed.
- Security restrictions verified.
- Database migrations reviewed and approved.
- Environment configuration validated.
- Backend/frontend compatibility checked.
- Rollback procedure established where appropriate.
- No unapproved features introduced.
- Known limitations documented.

A development ticket marked IMPLEMENTED does not automatically authorize deployment.

---

## 31. Feature Development Anti-Patterns

Avoid:

- Implementing from outdated documentation alone.
- Rewriting working frontend pages unnecessarily.
- Copying business formulas into multiple layers.
- Trusting frontend permissions on the backend.
- Using unscoped database mutations.
- Treating localStorage as production persistence.
- Creating extra salary on each new month.
- Duplicating salary expenses.
- Creating duplicate fee payments.
- Silently changing approved status transitions.
- Adding unnecessary infrastructure.
- Running broad destructive migration commands.
- Claiming tests passed without running them.
- Marking work OWNER_ACCEPTED without owner approval.

---

## 32. Definition of Ready

A ticket is ready when:

- The objective is clear.
- Relevant documentation exists.
- Approved business behavior is known.
- Dependencies are available.
- Required frontend source is identified.
- Security requirements are understood.
- Data/API contracts are sufficiently defined.
- Necessary tests are identified.
- Blocking product decisions have been resolved or explicitly excluded.

---

## 33. Definition of Done

A ticket is done when:

- Its authorized scope is implemented.
- Relevant tests were executed successfully.
- Security and business invariants hold.
- Related modules remain compatible.
- No unrelated changes were introduced unnecessarily.
- Changed files and outcomes are documented.
- Remaining risks are disclosed.
- Review status is accurately recorded.

Formal owner acceptance must be recorded separately.

---

## 34. Open Development Decisions

The following remain TBD:

- Final backend test framework.
- Final API DTO mapping.
- Monetary precision and rounding.
- Exact Fixed/Percentage payroll formula.
- Same-branch multi-role policy.
- Student identity-sharing policy.
- Financial reversal governance.
- Production session configuration.
- Database migration/import policy.
- Hosting and deployment environment.
- Final review and release process.

These must not be silently resolved by implementation agents.

---

## 35. Related Documentation

This document must remain consistent with:

- `AGENTS.md` — Agent instructions.
- `RULES.md` — Engineering standards.
- `MEMORY.md` — Owner decisions.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `SECURITY.md` — Security requirements.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Branch ownership.
- `BUSINESS_RULES.md` — Business invariants.
- `DATABASE.md` — Persistence design.
- `ERD.md` — Entity relationships.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `DATA_FLOW.md` — Cross-module data movement.
- `TRANSACTIONS_AND_INTEGRITY.md` — Transaction safety.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Backend roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Testing standards.
- `DEPLOYMENT.md` — Deployment.
- `ENVIRONMENT_CONFIG.md` — Configuration.
- `FRONTEND_INTEGRATION.md` — Frontend integration.
- `FEATURE_TICKETS.md` — Feature backlog.
- `TASKS.md` — Task tracking.
- `PROGRESS.md` — Verified work history.

Use actual repository paths when adding relative Markdown links.

---

## 36. Final Implementation Boundary

### Confirmed

- Existing React/Vite frontend.
- Node.js/Express/MongoDB backend direction.
- Five current roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Current branch creation pause.
- Physical Assets without media upload functionality.

### Proposed

- Feature ticket structure.
- Backend module implementation workflow.
- Contract review.
- Targeted testing gates.
- Code review process.
- Completion reporting.

### Deferred

- Multi-client SaaS.
- Platform Admin.
- Automatic monthly salary generation.
- Unsupported financial reversals.
- Cloudinary/media uploads.
- Premature distributed architecture.

### Not Implemented by This Document

- Application source changes.
- Backend routes or services.
- MongoDB schemas.
- Automated tests.
- Production deployment.

**Governing Principle:** Every feature must be scoped, grounded in approved behavior, implemented through the existing architecture, verified against meaningful tests and reported accurately without unauthorized changes.

**Document Status:** DRAFT — Ready for engineering workflow review. Implementation requires separately approved feature tickets.
