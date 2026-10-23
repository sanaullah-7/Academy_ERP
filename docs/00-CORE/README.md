# Academy Management ERP — Documentation Guide

**Document:** docs/00-CORE/README.md
**Version:** 1.0
**Status:** ACTIVE — Documentation Index; Specifications Under Review
**Last Updated:** 2026-10-23
**Project:** Academy Management ERP
**Documentation Location:** Root `docs/` Directory

---

## 1. Purpose

This directory contains the central specifications, engineering standards, decisions, implementation plans and verified progress records for the Academy Management ERP.

It is the primary documentation entry point for:

- Project owner.
- Client reviewers.
- Software architects.
- Frontend developers.
- Backend developers.
- QA engineers.
- Codex.
- Antigravity.
- Other authorized AI coding agents.

Its purpose is to provide one consistent source of project information, prevent conflicting implementation instructions and support controlled, testable development.

This README is a navigation and governance document, not authorization to write application code.

## 2. Project Summary

### Confirmed Product Direction

The project is a web-based Academy Management ERP for one academy organization operating multiple branches.

The product includes the following primary user roles:

- Super Admin.
- Admin.
- Owner.
- Receptionist.
- Teacher.

A user may hold different roles across branches. Same-branch multi-role combinations currently fail closed; final combination policy is TBD.

The academy name, logo and primary theme colors must be configurable.

### Technology Stack

- Frontend: React + Vite.
- Backend: Node.js + Express.
- Database: MongoDB + Mongoose.
- Version control: Git and private GitHub.
- AI development tools: Codex and Antigravity.

### Development Strategy

1. Review the documentation.
2. Approve the relevant implementation tickets.
3. Build the frontend phase by phase using centralized mock services.
4. Verify frontend functionality and connected workflows.
5. Integrate the real backend and MongoDB.
6. Implement and verify production authentication and authorization.
7. Conduct integrated testing and client review.
8. Prepare the approved production release.

General client approval of the system proposal does not automatically resolve detailed TBD business rules.

## 3. Repository Structure

The project follows this high-level organization:

```text
Academy-ERP/
├── Client/
├── Server/
├── docs/
│   ├── 00-CORE/
│   ├── 01-ARCHITECTURE/
│   ├── 02-DATABASE-AND-API/
│   ├── 03-SECURITY/
│   ├── 04-FRONTEND/
│   ├── 05-DEVELOPMENT/
│   ├── 06-OPERATIONS/
│   ├── 07-INTEGRATIONS-AND-QA/
│   ├── SECURITY.md
│   └── FINAL_FRONTEND_QA_20261023.md
├── AGENTS.md
├── README.md
├── .gitignore
└── .github/
    └── workflows/
        └── ci.yml
```

This is the agreed or intended high-level structure.

The current repository must be inspected before claiming that every listed file or workflow exists.

Preserve the capitalization of `Client/` and `Server/`.

Do not create conflicting copies of the central documentation inside the application directories.

Folder-level README files may describe their local contents but must not override the root specifications.

## 4. Documentation Ownership

Each document has one primary responsibility.

| Document | Authoritative responsibility |
|---|---|
| [PRD.md](PRD.md) | Product requirements, scope, user needs, modules and success criteria |
| [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) | Business workflows, module interactions, entity lifecycles and operational behavior |
| [ARCHITECTURE.md](../01-ARCHITECTURE/ARCHITECTURE.md) | Technology stack, architectural boundaries, application layers and infrastructure |
| [ERD.md](../01-ARCHITECTURE/ERD.md) | Database entities, collections, relationships, constraints and data integrity |
| [DESIGN.md](../04-FRONTEND/DESIGN.md) | Visual system, UX, reusable UI components, responsive design and accessibility |
| [SECURITY.md](../SECURITY.md) | Authentication, roles, permissions, branch access, sensitive operations and privacy controls |
| [FRONTEND_INTEGRATION.md](../04-FRONTEND/FRONTEND_INTEGRATION.md) | Frontend pages, mock services, data/API contracts and integration behavior |
| [RULES.md](RULES.md) | Mandatory coding standards, engineering restrictions, testing and quality gates |
| [FEATURE_TICKETS.md](FEATURE_TICKETS.md) | Small implementation tickets, scope, dependencies and acceptance criteria |
| [TASKS.md](TASKS.md) | Current authorized task and near-term backlog |
| [MEMORY.md](MEMORY.md) | Approved project decisions, change requests, rejected approaches and unresolved decisions |
| [PROGRESS.md](PROGRESS.md) | Verified implementation progress, test evidence, blockers and regressions |

### Root Documents

| Document | Responsibility |
|---|---|
| [AGENTS.md](../../AGENTS.md) | Instructions for AI coding agents and required document-reading behavior |
| [README.md](../../README.md) | Repository overview, installation, commands and developer onboarding |

### Important Distinction

`FEATURE_TICKETS.md` defines the detailed task.

`TASKS.md` identifies the active authorized work.

`PROGRESS.md` records what has actually been verified.

`MEMORY.md` preserves important decisions and changes.

These documents must not be treated as interchangeable.

---

## 5. Decision Labels

All specifications must distinguish between:

**CONFIRMED:** Explicitly supplied or approved.

**PROPOSED:** Suggested but awaiting approval.

**TBD:** Missing or unresolved decision.

**DEFERRED:** Deliberately outside the current scope.

**REJECTED:** Explicitly excluded.

**SUPERSEDED:** Replaced by a newer approved decision.

A CONFIRMED requirement is not necessarily implemented.

A PROPOSED requirement is not implementation authorization.

A TBD business policy must not be silently invented by a coding agent.

## 6. Document Approval States

Documents may use the following states:

| State | Meaning |
|---|---|
| DRAFT | Content being prepared or reviewed |
| IN_REVIEW | Submitted for formal review |
| APPROVED | Accepted as authoritative within its stated scope |
| ACTIVE | Operational register, updated over time |
| SUPERSEDED | Replaced by a newer version |
| ARCHIVED | Historical document retained for reference |

### Approval Rule

Each specification must clearly identify which decisions are confirmed, proposed or unresolved.

An ACTIVE register such as TASKS.md, MEMORY.md or PROGRESS.md does not imply that every item inside it is approved.

A document marked APPROVED does not automatically approve unrelated TBD requirements.

---

## 7. Recommended Reading Order

### A. New Developer or AI Agent

Read:

1. [Root Agent Instructions](../../AGENTS.md)
2. [Engineering Rules](RULES.md)
3. [Product Requirements](PRD.md)
4. [System Design](SYSTEM_DESIGN.md)
5. [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md)
6. [Current Tasks](TASKS.md)
7. [Feature Tickets](FEATURE_TICKETS.md)
8. [Progress](PROGRESS.md)
9. [Project Decisions](MEMORY.md)

Read additional documents applicable to the selected ticket.

### B. Frontend Development

Read:

- AGENTS.md.
- RULES.md.
- PRD.md.
- SYSTEM_DESIGN.md.
- DESIGN.md.
- FRONTEND_INTEGRATION.md.
- SECURITY.md for applicable role/branch behavior.
- ERD.md for relevant data relationships.
- Active approved feature ticket.
- TASKS.md and PROGRESS.md.

### C. Backend Development

Read:

- AGENTS.md.
- RULES.md.
- PRD.md.
- SYSTEM_DESIGN.md.
- ARCHITECTURE.md.
- ERD.md.
- SECURITY.md.
- FRONTEND_INTEGRATION.md.
- Active approved backend ticket.
- TASKS.md and PROGRESS.md.

### D. Client Requirement Change

Read:

- PRD.md.
- SYSTEM_DESIGN.md.
- MEMORY.md.
- Relevant design, security, architecture or integration documents.
- Impacted tickets.

### E. Testing and Release

Read:

- RULES.md.
- FEATURE_TICKETS.md.
- PROGRESS.md.
- SECURITY.md.
- Relevant workflow specifications.
- Approved release criteria.

Reading documents does not itself authorize code changes.

---

## 8. Current Development Strategy

The ERP will be implemented incrementally.

### Frontend Phases

| Phase | Module |
|---|---|
| F00 | Frontend Foundation |
| F01 | Dashboard |
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
| F13 | Settings and Integrated Frontend QA |

Phase order is the intended development sequence.

It is not permission to implement every phase.

Every phase must be divided into small testable tickets.

Only an approved READY ticket may be implemented.

### Dependency Principle

A module may require data from another module scheduled later.

For example, Admissions requires course and batch reference data.

Provide minimal approved shared data contracts rather than creating disconnected mock records or prematurely implementing entire future modules.

---

## 9. AI Agent Operating Rules

Codex, Antigravity and other agents must:

1. Read root AGENTS.md.
2. Read relevant approved specifications.
3. Read the active approved ticket.
4. Inspect the existing code and repository status.
5. Identify expected file changes.
6. Identify unresolved blockers.
7. Implement only the authorized scope.
8. Preserve existing working functionality.
9. Follow shared components and service contracts.
10. Never invent missing business policies.
11. Do not modify unrelated modules.
12. Avoid unnecessary dependencies.
13. Run relevant tests and build checks.
14. Report actual results.
15. Update task and progress records accurately.
16. Stop before beginning unapproved work.

### Coding Restrictions

Do not:

- Change the confirmed technology stack.
- Rename Client/ or Server/.
- Introduce unjustified microservices or Kubernetes.
- Hardcode real credentials or secrets.
- Treat frontend mock permissions as production security.
- Introduce multi-client SaaS or desktop application features.
- Modify unrelated working code.
- Claim untested functionality is complete.
- Claim a file was committed when it was not.
- Discard uncommitted changes.
- Run destructive database or Git commands without authorization.

---

## 10. Engineering Quality Standards

Implementation must target:

| Quality | Expected behavior |
|---|---|
| Scalability | Controlled data retrieval and clear module boundaries |
| Reliability | Validated operations and predictable failures |
| Stability | Existing workflows remain functional after changes |
| Maintainability | Readable, modular and consistent implementation |
| Testability | Relevant automated and manual checks |
| Flexibility | Approved changes can be implemented locally |
| Security | Server-side authorization and appropriate data protection |
| Performance | Efficient loading, rendering and queries |
| Consistency | Shared design tokens, contracts and entity definitions |
| Extensibility | New features do not require unnecessary rewrites |
| Observability | Errors can be diagnosed without exposing secrets |
| Accessibility | Usable forms, navigation and keyboard interaction |

These are engineering requirements, not already achieved certifications or guarantees.

The detailed rules and acceptance criteria belong in RULES.md.

---

## 11. Mock-to-Backend Integration Strategy

### Stage 1 — Frontend Mock Development

Use:

- React pages and reusable components.
- Centralized services.
- Mock adapters.
- Fictional seed data.
- Centralized browser demo storage.
- Demo role/branch contexts.

### Stage 2 — Real Backend Development

Implement approved:

- Express API modules.
- MongoDB/Mongoose schemas.
- Authentication.
- Role and branch authorization.
- Input validation.
- Business workflows.
- Audit controls.

### Stage 3 — Integration and Verification

Replace mock adapters with HTTP adapters, validate contracts and run integration and regression tests.

### Stage 4 — Client Review and Release

Deploy an approved private review environment and perform acceptance testing.

A mock frontend is not a production-ready multi-user ERP.

---

## 12. Change Management

When the client requests a change:

1. Record the request.
2. Identify its product requirement.
3. Determine the affected business workflow.
4. Identify affected screens and modules.
5. Check data/API contract impact.
6. Check authorization impact.
7. Obtain approval.
8. Update the authoritative documents.
9. Update affected feature tickets.
10. Implement the approved change.
11. Run regression tests.
12. Update MEMORY.md and PROGRESS.md.

Do not rewrite unrelated features for small frontend changes.

---

## 13. Conflict Resolution

When two documents disagree:

1. Identify the exact conflict.
2. Identify which document owns the decision.
3. Check whether a newer approved decision supersedes an older one.
4. Record the conflict.
5. Request clarification if necessary.
6. Update affected documents after approval.
7. Do not silently implement one conflicting interpretation.

### Examples

- Role permissions conflict: SECURITY.md owns authorization rules.
- Data field conflict: ERD.md owns persisted data structure.
- Visual style conflict: DESIGN.md owns the design system.
- Workflow conflict: SYSTEM_DESIGN.md owns business process behavior, subject to PRD requirements.
- API contract conflict: FRONTEND_INTEGRATION.md owns integration contracts.
- Progress discrepancy: PROGRESS.md owns verified completion.

A document's ownership does not permit it to override an explicitly confirmed client requirement.

---

## 14. Documentation Maintenance

### Regular Updates

TASKS.md and PROGRESS.md should be updated after approved ticket execution.

### Significant Decision Updates

MEMORY.md should be updated when:

- A new requirement is approved.
- An existing business rule changes.
- An architecture decision is finalized.
- An approach is rejected or deferred.

### Specification Updates

Change the relevant authoritative document only when its subject matter changes.

Do not rewrite all documents after every minor code edit.

### Version Control

All central documentation and AGENTS.md must remain tracked in the private Git repository.

Do not add these files to .gitignore.

Do not store secret credentials, real student records or confidential production data inside project documentation.

---

## 15. Documentation Review Status

As of 2026-10-09, expanded drafts have been prepared for the main product and engineering documents.

Their final approval and repository synchronization must be verified.

### Pending Review Activities

- Verify SYSTEM_DESIGN.md against PRD.md.
- Review AGENTS.md.
- Confirm final document naming.
- Verify links.
- Reconcile overlapping or conflicting decisions.
- Resolve minimum F00/F01 blockers.
- Approve the first bounded backend-foundation or integration ticket.

The detailed status must be obtained from TASKS.md and PROGRESS.md rather than assumed from this README.

---

## 16. Known Open Questions

Key unresolved areas include:

- Same-branch multi-role resolution beyond the current fail-closed rule.
- Final backend endpoint, validation and error-envelope contracts.
- Enrollment capacity and concurrency policy.
- Refund, reversal and verified-payment correction policy.
- Student branch-transfer policy.
- Payroll legacy-data migration and reconciliation policy.
- Reporting/export retention and authorization details.
- Production authentication, session and credential-recovery policy.
- Production hosting and session configuration.
- Performance and capacity targets.
- Backup, recovery and retention requirements.

Do not treat these as approved business decisions.

Unresolved requirements should not block unrelated independently approved work.

---

## 17. Next Development Steps

### Documentation

Maintain the reconciled effective sections and author detailed API/database contracts only through separately approved documentation tickets.

### Frontend

The frontend is complete enough to act as backend compatibility evidence. Preserve its workflows and verify later adapter integration through focused contracts and role tests.

### Backend

Approve and implement one small backend foundation ticket at a time after required data and security contracts are reconciled.

### Release

Perform integrated testing and client acceptance before using real operational data.

---

## 18. Important Links

### Governance

- [Agent Instructions](../../AGENTS.md)
- [Engineering Rules](RULES.md)
- [Current Tasks](TASKS.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Project Memory](MEMORY.md)
- [Verified Progress](PROGRESS.md)

### Specifications

- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md)
- [Database Design](../01-ARCHITECTURE/ERD.md)
- [Visual Design](../04-FRONTEND/DESIGN.md)
- [Security](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)

### Backend Preparation Evidence

- [Frontend Source Audit](../FRONTEND_AUDIT.md)
- [Module Workflow Map](../MODULE_WORKFLOW_MAP.md)
- [Role, Branch and Data Matrix](../ROLE_BRANCH_DATA_MATRIX.md)
- [Frontend to Backend Handoff](../FRONTEND_BACKEND_HANDOFF.md)
- [Backend Gaps and Risks](../BACKEND_GAPS_AND_RISKS.md)

### Repository

- [Project README](../../README.md)

---

## 19. Documentation Governing Principle

**One project, one central documentation system, one clear source of truth per subject, and one approved implementation ticket at a time.**

Documentation describes intended behavior.

Implementation provides actual functionality.

Testing provides evidence.

Approval determines readiness.

Do not confuse these stages.

---

**Document Status:** ACTIVE — Documentation Index
**Specification Status:** Main documentation remains under review until explicitly approved.
**Implementation Authorization:** None granted by this document alone.
