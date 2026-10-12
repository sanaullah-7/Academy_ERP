# Academy Management ERP — AI Agent Instructions

**File:** AGENTS.md
**Version:** 1.0
**Status:** DRAFT — Pending Project Owner Approval
**Updated:** 2026-10-09
**Applies To:** Codex, Antigravity and All Authorized AI Coding Agents

---

## 1. Purpose

This file defines the mandatory working instructions for AI coding agents contributing to the Academy Management ERP.

The goal is to develop reliable, scalable, secure, stable, maintainable, testable, flexible and consistent software through controlled implementation.

Agents must prioritize correctness, approved requirements, limited changes and verified results over generating large amounts of code.

This file does not independently authorize application implementation.

---

## 2. Project Identity

### CONFIRMED

The project is a web-based Academy Management ERP for one academy organization with multiple branches.

Primary roles:

- Super Admin
- Owner
- Receptionist
- Teacher

Users may have different roles in different branches and multiple permitted roles within the same branch.

The academy name, logo and theme colors are configurable.

### Technology Stack

- `Client/` — React + Vite, JavaScript/JSX.
- `Server/` — Node.js + Express.
- Database — MongoDB + Mongoose.
- Architecture — Modular monolith.
- Source control — Git and private GitHub.

Preserve the exact capitalization of `Client/` and `Server/`.

### Development Strategy

1. Review and approve relevant documentation.
2. Develop the frontend first.
3. Use centralized mock services and fictional demo data.
4. Implement one approved feature ticket at a time.
5. Test completed functionality.
6. Integrate the real backend later.
7. Implement secure backend authorization.
8. Perform integration, security and client acceptance testing.

### DEFERRED

- Multi-client SaaS infrastructure.
- Subscription/license management.
- Electron desktop application.
- Native mobile applications.

Do not implement deferred functionality without explicit approval.

---

## 3. Mandatory Documentation Reading

Before starting any authorized implementation task, read:

1. [Documentation Index](docs/README.md)
2. [Engineering Rules](docs/RULES.md)
3. [Current Tasks](docs/TASKS.md)
4. [Feature Tickets](docs/FEATURE_TICKETS.md)
5. [Decision History](docs/MEMORY.md)
6. [Verified Progress](docs/PROGRESS.md)

Read the applicable subject specifications:

- [Product Requirements](docs/PRD.md)
- [System Design](docs/SYSTEM_DESIGN.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [Database Design](docs/ERD.md)
- [Visual Design](docs/DESIGN.md)
- [Security Specification](docs/SECURITY.md)
- [Frontend Integration](docs/FRONTEND_INTEGRATION.md)

Read the relevant sections completely enough to understand the approved ticket and its dependencies.

Do not rely solely on previous AI conversation context.

Do not assume that reading a document grants permission to implement everything described in it.

---

## 4. Decision and Approval Rules

All project decisions must be distinguished as:

**CONFIRMED:** Explicitly supplied or approved.

**PROPOSED:** Recommended but not yet approved.

**TBD:** Unresolved decision.

**DEFERRED:** Excluded from the current stage.

**REJECTED:** Explicitly declined.

**SUPERSEDED:** Replaced by a newer approved decision.

### Mandatory Rules

- Never invent client business rules.
- Never silently treat PROPOSED or TBD items as CONFIRMED.
- Never assume all listed features are implementation-ready.
- General client approval of the system proposal does not resolve all detailed policies.
- If a missing decision blocks the current ticket, report it before dependent implementation.
- If an unresolved decision is unrelated to the ticket, it should not unnecessarily block approved independent work.

### Security Default

Unknown security permissions must not become allowed automatically.

Use an approved minimum demo permission baseline during frontend mock development.

Real backend permissions must be explicitly approved and enforced server-side.

---

## 5. Current Project Gate

**Current stage:** Documentation review and reconciliation.

Detailed draft documents have been prepared for the main ERP specifications.

Before application coding begins:

1. Verify current repository state.
2. Review the latest documentation.
3. Resolve relevant cross-document conflicts.
4. Confirm the minimum F00 implementation requirements.
5. Select and approve a specific F00 ticket.
6. Record the ticket as the active authorized task.

### Current Authorization

Documentation review and related approved documentation changes only.

No application coding ticket is currently confirmed as authorized in the supplied documentation.

The project owner may explicitly authorize F00-001 or another sufficiently defined ticket.

Do not begin implementation solely because it appears in the roadmap.

---

## 6. One Approved Ticket at a Time

Agents must work on one explicitly authorized implementation ticket at a time unless the project owner specifies otherwise.

### Required Workflow

1. Identify the active approved ticket.
2. Read relevant approved documents.
3. Inspect current files.
4. Check Git status.
5. Identify required changes.
6. Report blockers and conflicts.
7. Implement only the approved scope.
8. Run relevant checks.
9. Report actual results.
10. Update applicable task and progress records.
11. Stop and await further authorization.

### Prohibited

- Building the entire ERP in one uncontrolled coding session.
- Starting multiple large modules simultaneously.
- Automatically beginning the next ticket.
- Implementing unrelated enhancements.
- Rewriting previously working modules unnecessarily.
- Creating features that the client has not approved.

Small supporting changes necessary for the approved ticket may be included when justified and reported.

---

## 7. Frontend Development Phases

Follow the planned frontend order:

| Phase | Scope |
|---|---|
| F00 | Foundation, routing, layout, mock access and branch context |
| F01 | Four role-specific Dashboards |
| F02 | Admissions |
| F03 | Students |
| F04 | Courses & Batches |
| F05 | Faculty & Classes |
| F06 | Fees |
| F07 | Finance |
| F08 | Demo Classes |
| F09 | Assets |
| F10 | Reports |
| F11 | Branch Management |
| F12 | User Management |
| F13 | Settings & Integrated Frontend QA |

The sequence is a roadmap, not blanket permission to implement the phases.

Each phase must be divided into smaller tickets with acceptance criteria and tests.

### Dependency Rule

Earlier modules may require minimal mock records or service contracts for later modules.

For example, Admissions needs course and batch reference data before the full Courses & Batches UI is implemented.

Create only the minimum approved dependency, not an entire unrelated feature.

---

## 8. Frontend Engineering Rules

### Architecture

Keep the frontend organized into:

- Route-level pages.
- Module-specific components.
- Shared UI components.
- Layouts.
- Routes.
- Contexts.
- Hooks.
- Domain services.
- Mock adapters.
- Styles and design tokens.
- Reusable utilities.

### Separation of Concerns

React pages must not directly manage persistence.

Use:

`Page → Hook/State → Domain Service → Adapter`

During frontend development:

`Adapter → Mock Storage`

During real integration:

`Adapter → Express API`

### Mandatory Rules

- Reuse existing components.
- Follow the approved design reference.
- Use centralized theme values.
- Avoid hardcoded academy branding.
- Avoid fixed branch counts.
- Keep role and branch context centralized.
- Avoid direct localStorage access inside pages.
- Use fictional demo records.
- Do not store production credentials.
- Implement appropriate loading, empty, success and error states.
- Validate user input.
- Ensure keyboard-accessible interactions.
- Preserve existing working layouts and behavior.

### Important Security Boundary

Mock login and frontend permission guards are not production security.

Never describe a mock frontend as a secure multi-user ERP.

---

## 9. Backend Engineering Rules

Backend development requires its own approved tickets.

### Required Direction

- Modular monolith.
- Express routes and controllers.
- Domain services for business logic.
- Input validation.
- Approved database models.
- Centralized error handling.
- Authentication and authorization middleware.
- Branch and record-level authorization.
- Appropriate audit records.
- Database integrity and concurrency controls.

### Mandatory Restrictions

- Do not modify `Server/` during a frontend-only ticket without approval.
- Do not expose MongoDB directly to the browser.
- Do not trust client-submitted permissions.
- Do not trust branch identifiers without server verification.
- Do not create unapproved database schemas.
- Do not implement sensitive financial operations based on guessed policies.
- Do not introduce microservices or Kubernetes without approval.

---

## 10. Mandatory Software Quality

Every implementation must be designed and verified against relevant quality requirements.

| Quality | Mandatory objective |
|---|---|
| Scalability | Support growing data and branches without unnecessary redesign |
| Reliability | Validated and predictable operations |
| Stability | Avoid regressions in working features |
| Maintainability | Readable, focused and reusable code |
| Testability | Relevant unit, component and integration tests |
| Flexibility | Localized implementation of approved changes |
| Security | Backend-enforced least-privilege access |
| Performance | Efficient queries, rendering and bounded data loading |
| Consistency | Shared design patterns and data contracts |
| Extensibility | Clear module boundaries |
| Observability | Useful safe logging and error reporting |
| Accessibility | Semantic and keyboard-operable interfaces |

These objectives must be supported by evidence.

Do not merely claim that the application is scalable, secure or production-ready.

Detailed requirements are governed by RULES.md.

---

## 11. Existing Code Preservation

Before changing any file:

1. Inspect its current content.
2. Determine whether it contains working behavior.
3. Identify related imports and consumers.
4. Identify potential regressions.
5. Check for uncommitted user changes.

### Mandatory

- Preserve working code.
- Preserve unrelated user edits.
- Do not overwrite files blindly.
- Avoid unnecessary large refactors.
- Do not duplicate existing components.
- Do not change naming conventions arbitrarily.
- Do not remove application features to make a build pass.
- Do not silently change public interfaces used by other modules.

Refactor only when it is required by the approved task and its impact has been reviewed.

---

## 12. Dependencies and Packages

Before adding a dependency:

1. Inspect existing installed packages.
2. Determine whether current tools already solve the problem.
3. Explain why the new package is needed.
4. Check compatibility.
5. Obtain approval if the package is outside the authorized ticket.
6. Keep the lockfile consistent.

Do not:

- Replace package.json unnecessarily.
- Delete lockfiles to hide errors.
- Add several competing libraries for the same concern.
- Upgrade unrelated dependencies.
- Introduce framework migrations without permission.

---

## 13. Security and Secrets

Never:

- Hardcode passwords.
- Hardcode database credentials.
- Commit production `.env` files.
- Print secret tokens in logs.
- Expose student or staff confidential records in demo seeds.
- Bypass server-side authorization.
- Treat URL hiding as security.
- Trust user-controlled role values.
- Expose unauthorized financial records.

Production data protection and authorization are governed by SECURITY.md.

Keep documentation and examples free of real secrets.

---

## 14. Testing and Verification

After implementation, run checks relevant to the actual ticket.

Potential checks:

- Lint.
- Production build.
- Unit tests.
- Component tests.
- Integration tests.
- Role/branch behavior tests.
- Error-state tests.
- Relevant regression checks.
- Accessibility checks.
- End-to-end tests where applicable.

### Reporting Rules

Report each check as:

- PASS — Actually executed and passed.
- FAIL — Executed and failed.
- NOT_RUN — Not executed.
- NOT_CONFIGURED — Appropriate testing infrastructure does not exist.

Do not report an unexecuted test as passing.

Do not claim that a successful build proves the complete business workflow works.

### Missing Test Infrastructure

If required test tooling is missing:

1. Record the limitation.
2. Identify the necessary setup.
3. Propose an appropriate ticket.
4. Do not silently claim full verification.

---

## 15. Definition of Done

An implementation ticket is DONE only when:

1. Its scope was approved.
2. Required functionality exists.
3. Acceptance criteria are met.
4. Relevant validation and UI states work.
5. Applicable role and branch behavior is correct.
6. Required checks pass.
7. Relevant existing functionality is preserved.
8. No unresolved blocking defect remains.
9. Changes are reviewed.
10. Progress is documented.
11. The authorized reviewer accepts the result.

Rendering a screen or generating code is not sufficient.

A feature working only with mocks must be identified as mock-ready, not production-ready.

---

## 16. Git and File Safety

### Before Changes

Inspect the repository and Git status.

### During Changes

Keep modifications small and limited to authorized scope.

### Prohibited Without Explicit Approval

- `git reset --hard`
- `git clean -fd`
- Force pushing.
- Destructive database operations.
- Unrelated file deletion.
- Overwriting uncommitted user changes.
- Rewriting Git history.
- Mass replacement of files outside the active scope.

### Documentation Tracking

Keep `docs/` and `AGENTS.md` tracked in the private Git repository.

Never add them to `.gitignore`.

### Parallel AI Agents

Codex and Antigravity must not simultaneously modify the same files or shared interfaces without coordinated branch/review procedures.

Prefer sequential implementation for overlapping modules.

---

## 17. Client Change Requests

The client may request minor design, functionality or business-logic modifications.

When this occurs:

1. Record the change.
2. Identify the affected requirement.
3. Check affected screens and workflows.
4. Assess permissions, data and API implications.
5. Obtain the necessary approval.
6. Update the authoritative specification.
7. Update the affected ticket.
8. Implement the approved change.
9. Run relevant regression checks.
10. Record the result in MEMORY.md and PROGRESS.md.

Do not use a minor requested change as justification for unrelated redesign.

---

## 18. Documentation Updates

After an authorized implementation ticket:

### Update TASKS.md

Record the actual task status.

### Update PROGRESS.md

Record implemented behavior and verification results.

### Update FEATURE_TICKETS.md

Record ticket progress and acceptance evidence.

### Update MEMORY.md

Only when a significant new project decision or approved change occurs.

### Update Subject Specifications

Only when approved requirements, interfaces or architectural decisions have changed.

Avoid rewriting all project documentation after every small coding task.

Preserve historical decision and progress records.

---

## 19. Mandatory Agent Response Format

Before implementation, report:

**Ticket ID:**
**Goal:**
**Current Dependencies:**
**Files Expected to Change:**
**Potential Conflicts:**
**Tests Planned:**
**Authorization Status:**

After implementation, report:

**Ticket ID:**
**Actual Status:**
**Implemented:**
**Changed Files:**
**Tests Executed:**
**Passed:**
**Failed:**
**Not Run:**
**Known Issues:**
**Documentation Updated:**
**Next Required Approval:**

Do not fabricate output, commits, tests or deployment results.

---

## 20. Final Operating Rule

**Build only the smallest correct, approved and testable change.**

Do not optimize for the largest amount of generated code.

Optimize for:

- Correct behavior.
- Clear architecture.
- Reusable implementation.
- Secure boundaries.
- Predictable operation.
- Meaningful testing.
- Minimal regressions.
- Maintainable future development.

Always stop after completing the authorized task.

---

**Current Stage:** Documentation Review and Reconciliation
**Next Planned Task:** Approve F00-001 — Existing Frontend Project Audit
**Current Coding Authorization:** None until the project owner explicitly approves a ticket.

**Governing Principle:** Read → Understand → Plan → Implement Approved Scope → Test → Document → Stop.