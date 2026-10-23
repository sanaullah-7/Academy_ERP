<!-- AI coding rules — AI kya kar sakta hai, kya nahi karna, existing code ko kaise protect karna -->

# Academy Management ERP — Engineering Rules & Quality Gates

**Document:** RULES.md
**Version:** 1.0
**Status:** DRAFT — Pending Engineering Review
**Last Updated:** 2026-10-09
**Project:** Academy Management ERP
**Applies To:** Codex, Antigravity, Human Developers and Other AI Coding Agents
**Development Strategy:** Frontend First, Small Approved Tickets, Verified Delivery

---

## CURRENT EFFECTIVE REQUIREMENTS — 2026-10-23

The completed frontend is the behavioral compatibility reference for backend planning. The active roles are Super Admin, Admin, Receptionist, Owner and Teacher. Production APIs must independently enforce authentication, organization, active branch, permission and record ownership; frontend visibility is not security.

Financial writes require exact money handling, server validation, idempotency, auditability and transactions where one action changes multiple records. Teacher Payroll is an assignment/batch/subject-based running balance with Fixed or Percentage agreements; it has no automatic monthly renewal, approval run, advance, adjustment or correction workflow. Verified fee and payroll payments must reconcile with Finance and Reports.

Documentation precedence follows subject ownership: PRD for requirements, SYSTEM_DESIGN for workflows, SECURITY for access, ERD for data, ARCHITECTURE for structure and FRONTEND_INTEGRATION for service/adapter contracts. New backend work still requires one explicit approved ticket, focused tests and safe Git handling.

---

## 1. Purpose

This document defines the mandatory engineering standards, architectural boundaries, coding conventions, quality expectations, testing requirements, Git safety procedures and implementation restrictions for the Academy Management ERP.

Its primary objectives are to produce software that is:

- Scalable
- Reliable
- Stable
- Maintainable
- Testable
- Flexible
- Secure
- Performant
- Consistent
- Extensible
- Accessible
- Observable

These are mandatory engineering objectives, not claims that the current application already meets them.

Every coding agent must follow the approved version of this document during implementation.

No rule in this document independently authorizes an unapproved feature.

---

## 2. Decision Classification

All specifications must use consistent decision labels.

**CONFIRMED:** Explicitly supplied or approved.

**PROPOSED:** Recommended but awaiting approval.

**TBD:** An unresolved product or technical decision.

**DEFERRED:** Excluded from the current development scope.

**REJECTED:** Explicitly declined.

**SUPERSEDED:** Replaced by a newer approved decision.

Confirmed requirements are not necessarily implemented.

General client approval does not resolve every detailed business rule.

### Mandatory Rule

An AI agent must not convert a PROPOSED or TBD decision into CONFIRMED without explicit project-owner approval.

When a missing detail blocks the current ticket, stop and ask for clarification.

When the missing detail does not affect the current ticket, document it and continue only with the approved scope.

---

## 3. Project Architecture Rules

### Confirmed Stack

Frontend:

- React
- Vite
- JavaScript/JSX
- Existing `Client/` project directory

Backend:

- Node.js
- Express
- Existing `Server/` project directory

Database:

- MongoDB
- Mongoose

Application:

- Web-based ERP
- One academy organization initially
- Multiple branches
- Four primary staff roles

### Mandatory Restrictions

1. Do not change the confirmed stack without approval.
2. Do not rename `Client/` or `Server/`.
3. Do not replace React with another frontend framework.
4. Do not introduce TypeScript migration unless approved.
5. Do not replace MongoDB with another primary database.
6. Do not introduce microservices without an approved architecture decision.
7. Do not introduce Kubernetes or other complex infrastructure without justification and approval.
8. Do not restructure the entire repository to solve a small ticket.
9. Preserve the existing functional implementation.
10. Respect the modular-monolith direction for the eventual backend.

---

## 4. Documentation-First Development

Before coding, agents must read:

1. Root `AGENTS.md`.
2. The active approved ticket in `FEATURE_TICKETS.md`.
3. Applicable product requirements in `PRD.md`.
4. Relevant business workflows in `SYSTEM_DESIGN.md`.
5. Applicable architecture rules in `ARCHITECTURE.md`.
6. Relevant visual standards in `DESIGN.md`.
7. Applicable permission rules in `SECURITY.md`.
8. Relevant integration contracts in `FRONTEND_INTEGRATION.md`.
9. Applicable data structures in `ERD.md`.
10. Existing progress and open issues in `PROGRESS.md`.
11. Current work state in `TASKS.md`.
12. Relevant confirmed decisions in `MEMORY.md`.

Agents may read only the relevant sections of lengthy documents, provided no required context is skipped.

### Source-of-Truth Rule

Each document owns its designated subject.

- PRD: Product requirements.
- SYSTEM_DESIGN: Business workflows.
- ARCHITECTURE: Technical structure.
- ERD: Data model.
- DESIGN: Visual design and UX.
- SECURITY: Authentication and authorization.
- FRONTEND_INTEGRATION: Frontend/data/API contracts.
- RULES: Engineering standards.
- FEATURE_TICKETS: Implementation ticket scope and acceptance criteria.
- TASKS: Current approved work.
- MEMORY: Decisions and change history.
- PROGRESS: Verified development status.

### Document Conflict Rule

If two documents conflict:

1. Identify the exact conflicting statements.
2. Determine which document owns the decision.
3. Check whether a later approved change supersedes an earlier decision.
4. Report unresolved conflict to the project owner.
5. Do not silently choose the easier implementation.

An approved feature ticket cannot silently override an approved security or business rule.

---

## 5. One-Ticket-at-a-Time Rule

### Mandatory

Implement only one approved executable ticket at a time unless explicitly authorized otherwise.

The development process must be:

1. Select the approved ticket.
2. Read relevant requirements.
3. Inspect affected source files.
4. Identify dependencies.
5. Plan the changes.
6. Implement the ticket.
7. Run relevant tests and checks.
8. Review the resulting changes.
9. Update progress documentation.
10. Stop for review or authorization of the next ticket.

### Forbidden Behavior

- Implementing multiple ERP modules in one uncontrolled request.
- Adding unrelated features because they appear useful.
- Building the entire application from a single broad instruction.
- Silently proceeding to the next ticket after completing the current one.
- Editing unrelated files to achieve a local UI change.
- Marking planned features as completed.

### Exception

Small supporting changes directly required by the approved ticket may be included.

The agent must explain their purpose.

---

## 6. Frontend Development Phase Rules

Frontend screen-development order:

| Phase | Area |
|---|---|
| F00 | Shared foundation |
| F01 | Dashboard |
| F02 | Admissions |
| F03 | Students |
| F04 | Courses and Batches |
| F05 | Faculty and Classes |
| F06 | Fees |
| F07 | Finance |
| F08 | Demo Classes |
| F09 | Assets |
| F10 | Reports |
| F11 | Branch Management |
| F12 | User Management |
| F13 | Settings and Integrated Frontend QA |

Each phase must consist of small approved tickets.

### Phase Boundary Rules

- Do not start a new major module until its dependencies are ready.
- Do not implement all pages of one large module in a single ticket.
- Do not bypass testing to meet a phase deadline.
- Do not mark a phase complete because its pages visually render.
- Do not automatically start the next phase after generating files.
- Preserve completed phase functionality.
- Run appropriate regression checks before requesting phase approval.

### Dependency Rule

A module may depend on data from a later module.

Example:

Admissions may require course and batch reference records before the complete Courses & Batches interface is developed.

Implement the minimum approved shared mock contract as an explicit dependency ticket.

Do not create disconnected hardcoded datasets.

---

## 7. Frontend Code Architecture Rules

### 7.1 Page-Based Organization

Route-level screens belong in:

`Client/src/pages/<Module>/`

Module-specific components belong in:

`Client/src/components/<Module>/`

Common UI belongs in approved shared component directories.

### 7.2 Component Responsibilities

Each component must have a clear responsibility.

Prefer:

- Small, focused components.
- Readable props.
- Reusable presentation patterns.
- Explicit event handlers.
- Clear loading/error states.

Avoid:

- Giant components containing unrelated workflows.
- Excessive prop drilling.
- Business logic mixed throughout JSX.
- Repeated copies of the same UI component.
- Hidden side effects in rendering.
- Unnecessary abstraction layers.

### 7.3 Hooks

Custom hooks must follow React hook rules.

Use hooks to extract meaningful reusable logic, not simply to create additional files.

Never call hooks conditionally.

### 7.4 Context

Use shared contexts for stable application state such as:

- Current user.
- Active branch.
- Academy settings.
- Theme.

Avoid placing all student, fee, admission and report data inside one enormous global context.

### 7.5 Service Layer

React pages must access business records through domain services.

Do not directly call localStorage from pages.

Do not scatter HTTP requests throughout presentation components.

### 7.6 Mock/HTTP Separation

The mock adapter and future HTTP adapter must follow approved interfaces.

Do not change page behavior merely because persistence changes.

### 7.7 Browser Storage

During frontend demo development:

- Centralize storage operations.
- Use versioned storage keys.
- Handle invalid records.
- Avoid overwriting user changes on every refresh.
- Provide controlled demo reset where approved.
- Never store production credentials or confidential records.

### 7.8 Routes

Use centralized route definitions.

Support:

- Valid navigation.
- Nested route refresh.
- Not Found behavior.
- Unauthorized page behavior.
- Relevant branch transitions.

Do not scatter hardcoded route strings unnecessarily.

---

## 8. Backend Code Architecture Rules

Backend implementation requires separate approval.

### Mandatory Direction

Use a modular monolith with clear domain boundaries.

Suggested internal responsibilities:

- Routes.
- Controllers.
- Services.
- Validation.
- Data access.
- Models.
- Tests.

### Rules

1. Keep controllers focused on HTTP handling.
2. Place business rules in domain services.
3. Validate input at trusted boundaries.
4. Enforce authentication and authorization server-side.
5. Avoid duplicating logic across modules.
6. Use consistent API errors.
7. Separate configuration from business logic.
8. Keep database operations within approved data-access patterns.
9. Use appropriate transactions and concurrency controls.
10. Avoid leaking internal errors or secrets.

Do not introduce a separate repository class for every trivial query unless the approved architecture justifies it.

### Backend Modification Boundary

During a frontend-only ticket, do not modify `Server/` unless explicitly authorized.

---

## 9. Naming Conventions

**Status: PROPOSED**

Use consistent names throughout the repository.

### React Components

PascalCase.

Examples:

- `StudentsPage.jsx`
- `StudentTable.jsx`
- `BranchSwitcher.jsx`

### JavaScript Services and Helpers

camelCase filenames where compatible with the existing codebase.

Examples:

- `studentService.js`
- `formatCurrency.js`
- `useBranch.js`

### Variables and Functions

camelCase.

Examples:

- `activeBranchId`
- `getStudentById`
- `calculateInvoiceTotal`

### Components and Classes

PascalCase.

### Constants

UPPER_SNAKE_CASE for module-level immutable constants where appropriate.

### Boolean Values

Use descriptive prefixes.

Examples:

- `isLoading`
- `hasPermission`
- `canEdit`
- `shouldShow`

### Naming Rules

- Prefer descriptive names.
- Avoid unexplained abbreviations.
- Avoid multiple names for the same business entity.
- Respect existing established conventions before renaming files.
- Avoid renaming unrelated files during feature implementation.

---

## 10. Code Readability and Maintainability

### Mandatory Standards

1. Use readable and consistent code.
2. Keep functions focused.
3. Reduce unnecessary nesting.
4. Prefer early returns when they improve clarity.
5. Remove unused imports and dead code.
6. Avoid duplicated business rules.
7. Keep UI logic separate from persistence.
8. Use explicit error handling.
9. Prefer descriptive names.
10. Avoid premature abstraction.
11. Document important non-obvious decisions.
12. Preserve consistency with established project conventions.

### Code Comments

Comments should explain intent, unusual constraints or non-obvious behavior.

Avoid comments that merely repeat obvious code.

Do not fill the codebase with unnecessary generated comments.

### File Size

Do not impose arbitrary line counts without considering cohesion.

If a file becomes difficult to understand, review whether its responsibilities should be separated.

### Refactoring

Refactoring should occur when justified by:

- The active approved ticket.
- A documented defect.
- A maintainability issue.
- An approved architecture improvement.

Do not refactor unrelated modules solely for stylistic preference.

---

## 11. Dependency Management

### Mandatory Rules

- Inspect installed packages before adding dependencies.
- Reuse existing suitable libraries.
- Explain why any new dependency is required.
- Prefer maintained, compatible and appropriately licensed packages.
- Avoid multiple libraries that solve the same problem.
- Avoid adding large packages for trivial functions.
- Keep lockfiles consistent with package changes.
- Do not upgrade unrelated dependencies during a feature ticket.
- Evaluate dependency security and compatibility where practical.

### Prohibited

- Blindly replacing the package manifest.
- Deleting the lockfile to hide installation issues.
- Adding libraries without use.
- Performing a framework migration without approval.
- Silently accepting unresolved dependency conflicts.

---

## 12. Error Handling Standards

### Frontend

Every relevant feature must handle:

- Loading.
- Empty data.
- Success.
- Validation failure.
- Permission denied.
- Network failure.
- Unexpected error.
- Disabled or unavailable action.

Do not display fake success messages before the operation succeeds.

Do not swallow errors silently.

### Backend

When backend implementation is authorized:

- Use consistent error classes or normalized error objects.
- Use centralized HTTP error handling.
- Return safe user-facing messages.
- Log useful technical context.
- Do not expose stack traces in production responses.
- Avoid including secrets or confidential information in logs.

### Recovery

Prefer recoverable behavior where possible.

Examples:

- Preserve form input on validation failure.
- Allow controlled retry of safe read operations.
- Prevent duplicate submission during in-flight writes.
- Provide useful retry or correction guidance.

Never blindly retry financial writes or other non-idempotent operations.

---

## 13. Validation Standards

Validation must occur at relevant boundaries.

### Frontend

Validate for usability:

- Required fields.
- Field types.
- Format constraints.
- Cross-field dependencies.
- Reasonable input ranges.

### Backend

Validate authoritative business rules:

- User authorization.
- Branch and record ownership.
- Valid referenced entities.
- Financial constraints.
- Permitted state transitions.
- Duplicate prevention.
- Data integrity.

### Mandatory Rule

Frontend validation is not a security boundary.

Mock validation must not be represented as secure production validation.

---

## 14. Security Engineering Standards

The detailed security source of truth is SECURITY.md.

### Mandatory Requirements

1. Apply least privilege.
2. Enforce real permissions on the backend.
3. Verify branch access.
4. Verify record-level access where required.
5. Restrict sensitive financial operations.
6. Never trust user-provided role identifiers.
7. Never trust branch identifiers without authorization.
8. Validate protected writes.
9. Protect session credentials.
10. Avoid exposing secret information.
11. Audit sensitive operations.
12. Use secure production transport.
13. Apply appropriate rate limiting and abuse protection.
14. Protect confidential student and staff records.
15. Test access-denied scenarios.

### Multi-Role Access

A user may hold multiple roles in one branch.

The effective permission-combination rule must follow approved SECURITY.md.

Do not assume that all role permissions always combine freely.

Explicitly denied or restricted sensitive operations must not be bypassed by another role assignment.

### Super Admin Access

All-branches visibility must rely on authenticated, authorized backend capabilities.

Do not implement unrestricted access based only on frontend flags.

### AI Agent Security

Do not read, print, copy or commit unnecessary secrets.

Do not place `.env` values in code comments, documentation or Git commits.

Use sanitized examples.

---

## 15. Database Integrity Standards

The authoritative database design belongs in ERD.md.

### Mandatory Rules

- Use validated schemas.
- Apply appropriate uniqueness constraints.
- Respect entity relationships.
- Prevent cross-branch record corruption.
- Preserve historical financial data.
- Use appropriate transaction boundaries.
- Handle concurrent edits.
- Prevent duplicate payment processing.
- Ensure totals use consistent financial precision.
- Keep important updates auditable.

### Financial Records

Invoices, payments, refunds and adjustments must remain separate where required by the approved data model.

Do not recalculate financial totals independently in multiple disconnected components.

### Data Deletion

Do not physically delete financial or sensitive operational records without an approved retention and deletion policy.

---

## 16. Performance Standards

### Frontend

- Avoid unnecessary React re-renders.
- Avoid extremely large uncontrolled lists.
- Use pagination or appropriate virtualization when needed.
- Prefer route-level code splitting when beneficial.
- Avoid unnecessary duplicate requests.
- Optimize large images.
- Keep charts efficient.
- Avoid premature caching complexity.

### Backend

- Use appropriate database indexes.
- Avoid unbounded collection queries.
- Validate pagination and filtering.
- Avoid unnecessary repeated database lookups.
- Use reasonable timeouts.
- Optimize based on evidence.

### Performance Targets

**TBD:**

- Supported concurrent users.
- Expected student volume.
- Expected branch count.
- Acceptable page load times.
- Acceptable API response times.
- Bundle-size budget.

Until measurable targets are approved, agents should follow sound engineering practices and report obvious performance risks without claiming numerical compliance.

---

## 17. Reliability and Stability Standards

### Reliability

Operations must have predictable outcomes.

Relevant requirements:

- Consistent validation.
- Clear error handling.
- Safe persistence.
- Duplicate prevention.
- Recoverable failures.
- Data integrity.
- Appropriate idempotency.

### Stability

Features must not break unrelated approved workflows.

Mandatory actions:

- Review dependencies before changes.
- Avoid unnecessary global modifications.
- Run relevant regression checks.
- Preserve backward compatibility where required.
- Record known limitations.

### Failure Handling

Agents must not conceal failed tests or unresolved runtime errors.

If an issue cannot be solved within the approved ticket, report it as a blocker or separate proposed ticket.

---

## 18. Scalability and Extensibility Standards

The application should support future growth in:

- Academy branches.
- Students.
- Staff users.
- Courses.
- Batches.
- Enrollments.
- Financial records.
- Reports.

### Engineering Rules

- Avoid hardcoded branch counts.
- Avoid hardcoded production users.
- Use consistent identifiers.
- Maintain clear service contracts.
- Keep domain boundaries explicit.
- Plan for pagination and efficient queries.
- Keep configuration centralized.
- Avoid premature multi-tenant infrastructure.

Scalability is achieved through tested architecture and capacity planning, not by merely adding multiple abstraction layers.

---

## 19. Accessibility Standards

Follow DESIGN.md.

### Mandatory Practices

- Semantic HTML.
- Visible keyboard focus.
- Accessible navigation.
- Proper input labels.
- Accessible error messages.
- Appropriate text contrast.
- Keyboard-operable dialogs.
- Meaningful button labels.
- Suitable control sizes.
- Avoid color-only information.

### Proposed Formal Target

WCAG 2.2 Level AA.

Final conformance target remains subject to approval.

### Verification

Perform relevant keyboard, focus, labels, contrast and automated accessibility checks.

Do not claim accessibility compliance based solely on library selection.

---

## 20. Testing Strategy

Testing must be appropriate to the ticket's actual behavior.

### 20.1 Unit Tests

Use unit tests for:

- Validation helpers.
- Financial calculations.
- Permission helpers.
- Data formatting.
- Service business logic.
- State transformation.

### 20.2 Component Tests

Use component tests for:

- Forms.
- Buttons.
- Tables.
- Dialogs.
- Branch selection.
- Role-specific display.
- Loading and error states.

### 20.3 Integration Tests

Verify interactions between:

- React pages and services.
- Auth and branch contexts.
- Mock persistence and workflows.
- Related modules.
- Backend services and database when authorized.

### 20.4 End-to-End Tests

Critical complete workflows may include:

- Login and branch selection.
- Admission registration.
- Enrollment.
- Invoice generation.
- Payment collection.
- Reporting.
- Role and branch transitions.

### 20.5 Security Tests

When backend development is authorized:

- Unauthorized request denial.
- Cross-branch access denial.
- Teacher access limitations.
- Sensitive financial action denial.
- Invalid input rejection.
- Session lifecycle.

### 20.6 Regression Tests

Run tests covering functionality likely to be affected by the current change.

Do not claim regression verification without performing it.

### 20.7 Test Frameworks

The specific testing frameworks remain TBD until the repository is inspected and the tooling is approved.

Do not introduce competing test frameworks without justification.

---

## 21. Minimum Quality Gate Per Ticket

A ticket cannot be marked DONE unless its required checks pass or a specific exception is approved and recorded.

### Required Review Questions

1. Did the agent implement the approved scope?
2. Does the feature work?
3. Are inputs validated?
4. Are relevant error states handled?
5. Are permission and branch requirements respected?
6. Are mock data contracts consistent?
7. Are relevant tests present and passing?
8. Does the production frontend build succeed?
9. Did unrelated behavior regress?
10. Are remaining risks documented?
11. Were the changed files reviewed?
12. Is the progress record accurate?

### Missing Test Infrastructure

If an appropriate test script does not exist:

- Report it as missing.
- Do not label the test as passed.
- Propose a focused test infrastructure ticket.
- Do not silently skip meaningful verification.
- Do not add unrelated test tooling without approval.

---

## 22. Definition of Done

A ticket is DONE only when:

- Requirements are approved.
- Functionality is implemented.
- Acceptance criteria are satisfied.
- Relevant tests pass.
- No unresolved blocking defects remain.
- Build/lint checks pass where required.
- Applicable security rules are followed.
- Existing functionality is preserved.
- Documentation is updated.
- The project owner or authorized reviewer accepts the work.

A file being created, a page rendering or an AI agent claiming success is not sufficient evidence.

---

## 23. Git and Repository Safety

### Mandatory Rules

1. Inspect Git status before modifying files.
2. Preserve unrelated uncommitted changes.
3. Avoid committing secrets.
4. Use focused commits.
5. Do not rewrite Git history without explicit approval.
6. Do not force-push without explicit approval.
7. Do not delete remote branches without authorization.
8. Do not discard user changes with destructive Git commands.
9. Do not replace the entire repository.
10. Review changes before staging or committing.

### Forbidden Without Explicit Authorization

- `git reset --hard`
- `git clean -fd`
- Force push
- Unrelated mass deletion
- Broad destructive search-and-replace
- Overwriting uncommitted user changes
- Deleting databases
- Running destructive migrations

### Lockfile Handling

If dependencies are intentionally modified, update the relevant lockfile consistently.

Do not delete lockfiles to make dependency errors disappear.

### Branch Strategy

**PROPOSED:**

Use a short-lived feature branch for each approved ticket or related small change set.

### Commit Messages

**PROPOSED:**

Use descriptive commits containing the ticket identifier.

Example:

`feat(F01-002): add branch-aware dashboard statistics`

Commit only when requested or permitted by the project's Git workflow.

---

## 24. File Modification Boundaries

Before implementation, the agent must identify:

- Files to inspect.
- Files expected to change.
- Files that must remain untouched.
- Relevant shared dependencies.
- New dependencies, if any.

### Frontend Tickets

Modify `Client/` and relevant documentation only.

Do not modify `Server/` without explicit authorization.

### Backend Tickets

Modify authorized `Server/` code and relevant documentation only.

Do not redesign `Client/` during backend work without an approved integration requirement.

### Documentation Tickets

Modify documentation only unless additional files are explicitly included in the approved scope.

### Scope Expansion

If implementation requires changes outside the approved scope, report the reason and obtain approval before proceeding.

---

## 25. AI Agent Coordination

Codex and Antigravity may both be used on the project.

### Mandatory Rules

- Avoid concurrent edits to the same files.
- Use clear ticket ownership.
- Share approved documentation through the repository.
- Review changes before combining them.
- Do not let one agent silently overwrite another agent's work.
- Use Git branches or sequential editing where appropriate.
- Record significant cross-module decisions.

### Agent Handover

At the end of a ticket, report:

- Completed functionality.
- Changed files.
- Tests executed.
- Test results.
- Known limitations.
- Remaining blockers.
- Relevant decision changes.
- Next suggested ticket.

Do not automatically start the next ticket.

---

## 26. Client Change Management

When a client change is requested:

1. Record the requested modification.
2. Identify the affected PRD requirement.
3. Determine whether it is a visual change, logic correction or scope change.
4. Check impact on other modules.
5. Check impact on data contracts.
6. Check impact on authorization.
7. Check impact on tests.
8. Update authoritative documentation after approval.
9. Create or update an implementation ticket.
10. Implement only the approved change.
11. Run relevant regression tests.
12. Update MEMORY.md and PROGRESS.md.

### Important

A minor requested frontend change must not trigger unrelated architectural rewrites.

---

## 27. Documentation Update Rules

### TASKS.md

Update the currently assigned task and its status.

### PROGRESS.md

Record verified development and test results.

### MEMORY.md

Record significant confirmed decisions and approved changes.

### FEATURE_TICKETS.md

Update ticket status and acceptance evidence.

### PRD.md

Update only when product requirements change.

### SYSTEM_DESIGN.md

Update when business workflows change.

### ARCHITECTURE.md

Update when approved technical architecture changes.

### ERD.md

Update when approved entity or database structure changes.

### DESIGN.md

Update when visual standards change.

### SECURITY.md

Update when authentication, authorization or privacy rules change.

### FRONTEND_INTEGRATION.md

Update when service contracts or integration behavior changes.

Avoid rewriting all documentation after every small source-code change.

Preserve existing confirmed decisions and verified history.

---

## 28. AI Agent Execution Protocol

Every approved implementation ticket must follow this protocol.

### STEP 1 — REPOSITORY INSPECTION

- Inspect the existing structure.
- Check Git status.
- Identify relevant files.
- Check installed dependencies.
- Understand current behavior.
- Identify existing errors.

### STEP 2 — REQUIREMENT VALIDATION

- Read the approved ticket.
- Read applicable documentation.
- Identify missing decisions.
- Confirm dependencies.
- Report relevant contradictions.

### STEP 3 — IMPLEMENTATION PLAN

Before coding, briefly state:

- Ticket ID.
- Goal.
- Files expected to change.
- Dependencies.
- Risks.
- Tests to run.

### STEP 4 — FOCUSED IMPLEMENTATION

- Implement only the approved ticket.
- Keep code maintainable.
- Respect existing architecture.
- Avoid unnecessary dependencies.
- Preserve existing behavior.

### STEP 5 — VERIFICATION

- Run relevant tests.
- Run lint/build where configured.
- Verify required interactions.
- Check applicable role and branch cases.
- Check affected prior functionality.
- Record failures honestly.

### STEP 6 — DOCUMENTATION UPDATE

Update:

- TASKS.md.
- PROGRESS.md.
- Ticket status and acceptance evidence.

Update MEMORY.md only for significant approved decisions.

### STEP 7 — FINAL REPORT

Report:

- Ticket ID and status.
- Implemented scope.
- Changed files.
- Test results.
- Remaining issues.
- Next dependency.

### STEP 8 — STOP

Stop after the authorized task.

Do not start additional unapproved work.

---

## 29. Prohibited AI Coding Behaviors

The following behaviors are prohibited without explicit authorization:

1. Inventing business requirements.
2. Treating TBD details as confirmed.
3. Changing the technology stack.
4. Rebuilding the entire project for a small ticket.
5. Overwriting working code unnecessarily.
6. Editing unrelated modules.
7. Creating duplicate service layers.
8. Adding unnecessary dependencies.
9. Storing passwords or secrets in the repository.
10. Implementing frontend-only security as production protection.
11. Faking API responses as real production data.
12. Creating misleading success indicators.
13. Ignoring failed tests.
14. Reporting unexecuted tests as passed.
15. Claiming mock features are production-ready.
16. Claiming code has been committed when it has not.
17. Running destructive Git commands without authorization.
18. Running destructive database operations without authorization.
19. Automatically implementing multiple phases.
20. Updating approved decisions without a traceable change.
21. Creating giant unrelated code files.
22. Replacing existing design patterns with arbitrary visual styles.
23. Introducing subscriptions, SaaS infrastructure or desktop application features.
24. Exposing restricted records through unauthorized API operations.
25. Marking incomplete tickets DONE.

---

## 30. Quality Attributes and Evidence Matrix

| Quality | Required engineering behavior | Verification evidence |
|---|---|---|
| Scalability | Bounded data retrieval and modular architecture | Pagination, query and capacity checks |
| Reliability | Validated operations and recoverable failures | Functional, failure and integrity tests |
| Stability | Preserve existing workflows | Regression checks |
| Maintainability | Clear module boundaries | Code review and duplication analysis |
| Testability | Independently testable logic | Unit/component/integration tests |
| Flexibility | Central configuration and stable contracts | Configuration and change tests |
| Security | Backend least-privilege enforcement | Allowed/denied authorization tests |
| Performance | Efficient rendering and querying | Profiling and performance checks |
| Consistency | Shared design and data conventions | Design and contract reviews |
| Extensibility | Changes remain localized | Dependency and impact review |
| Observability | Useful safe diagnostics | Logging and error checks |
| Accessibility | Usable semantic interfaces | Keyboard, contrast and accessibility tests |

Quantitative targets must be approved before reporting numerical compliance.

---

## 31. Release Quality Gates

### Frontend Mock Review

Before declaring the frontend demonstration ready:

- Required screens operate using shared mock services.
- Branch context works.
- Role-aware navigation works in demo mode.
- Connected mock workflows are consistent.
- Critical forms validate.
- Appropriate feedback states exist.
- Required tests pass.
- The frontend builds successfully.
- Known limitations are documented.

### Backend Integration Review

Before declaring backend integration complete:

- Required real APIs operate.
- Authentication is secure.
- Role and branch access are enforced server-side.
- Relevant records are authorized.
- Database integrity is verified.
- Critical financial operations are protected.
- Integration and security tests pass.
- Known blocking defects are resolved.

### Production Release

Before real client operation:

- Required end-to-end workflows pass.
- Production secrets are configured securely.
- Hosting and database connectivity are verified.
- Monitoring and logging are available.
- Backups and restoration are verified.
- Access controls are tested.
- Performance requirements are evaluated.
- Critical defects are resolved.
- Client acceptance is recorded.

A seven-day client review does not automatically mean the ERP is ready for production with real student or payment data.

---

## 32. Proposed Decisions Awaiting Approval

The following detailed engineering decisions remain PROPOSED:

- Exact testing frameworks.
- Specific lint and formatting tools.
- Git branching and commit conventions.
- Formal WCAG 2.2 AA conformance target.
- Numerical performance budgets.
- Test coverage thresholds.
- Logging and monitoring platforms.
- Dependency audit process.
- Release defect severity thresholds.
- Code review ownership.

These decisions should be finalized when the relevant implementation stage requires them.

---

## 33. Open Questions (TBD)

1. Who approves feature tickets?
2. Who performs final technical reviews?
3. What testing libraries are already installed?
4. What automated checks must run in CI?
5. What coverage thresholds are practical?
6. What performance targets must be achieved?
7. What branch and user volumes are expected?
8. What accessibility target is contractually required?
9. What severity levels block release?
10. Who manages production infrastructure?
11. What is the rollback procedure?
12. What backup and recovery targets apply?
13. What development environment support is required?
14. What production security audit level is expected?
15. Which client representatives approve business-rule changes?

Missing decisions must remain TBD.

---

## 34. Related Documents

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md)
- [Database ERD](../01-ARCHITECTURE/ERD.md)
- [Visual Design](../04-FRONTEND/DESIGN.md)
- [Security Specification](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Current Tasks](TASKS.md)
- [Project Decisions](MEMORY.md)
- [Verified Progress](PROGRESS.md)

---

## 35. Governing Principle

**Do not optimize for generating the maximum amount of code. Optimize for delivering the smallest correct, maintainable, testable and approved change.**

A high-quality ERP is built through consistent architecture, careful scope control, meaningful testing, validated workflows and verifiable progress.

The rules in this document apply to every approved implementation ticket.

---

**Document Status:** DRAFT — Pending Engineering Review
**Implementation Authorization:** None granted by this document alone.

This document governs how approved work should be performed. It does not authorize Codex, Antigravity or another AI agent to implement unapproved features.
