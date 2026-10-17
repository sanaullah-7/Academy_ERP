<!-- Project decisions log — important confirmed decisions, changes aur unresolved questions -->

# Academy Management ERP — Project Memory & Decision History

**Document:** MEMORY.md
**Version:** 1.0
**Status:** ACTIVE — Project Decision Register
**Last Updated:** 2026-10-10
**Project:** Academy Management ERP
**Maintained By:** Project Owner / Authorized Development Agent

## Confirmed Admission/Student detail navigation UI correction (2026-10-12)

**Status:** Owner-approved implementation delivered IN_REVIEW. Admission row/name and three-dots → View use the same branch-scoped saved Admission dialog. Student row/name opens a separate branch-scoped read-only Student Profile with saved student fields, status, branch and linked Admission reference. Keyboard Enter/Space is supported; action-menu interaction is isolated from row click. The later owner-approved decision below supersedes the initial UI correction's decided-action lock; permissions remain unchanged.

Focused UI tests pass 38/38 and targeted ESLint passes. No new libraries, backend, student editing, enrollment, fees or permission changes. Detailed file list and remaining verification are in `TASKS.md` and `PROGRESS.md`.

---

## F02-005 — Approved/Rejected actions and status reversals (2026-10-12)

**SUPERSEDED** by the later "Remove Reject; allow Approved → Pending" decision below. Its existing-role Edit/Delete authorization remains applicable; Reject and Approved ↔ Rejected no longer apply.

## F02-005 — Remove Reject; allow Approved → Pending (2026-10-12)

**CONFIRMED by owner:** Reject is removed from UI and new status requests. Pending admissions expose Approve; Approved admissions expose Pending, allowing Super Admin to return them to Pending. Existing role permissions and authorized Edit/Delete are unchanged. Same-status is idempotent. Existing saved Rejected records migrate to Pending and their status history is cleared. No enrollment, fees, backend or dependency changes.

Implementation and targeted verification are recorded in `TASKS.md` and `PROGRESS.md`.

---

## F02-003 approved gapless display numbering (2026-10-10)

Owner now explicitly authorizes mutable branch-scoped display serials 1..N and ADM-1..ADM-N, closing gaps after deletion. This supersedes prior visible permanent-counter numbering, not stored immutable IDs/references. Existing ADM-* metadata and student admissionId foreign keys remain unchanged. Response-only serials derive from persisted insertion order before filtering/sorting; lookup/update/delete still use internal IDs. Existing CRUD/localStorage/auth/security boundaries remain unchanged; no dependency or backend work. Status IN_REVIEW, acceptance pending.

---

## F02-003 latest approved simple legacy deletion rule (2026-10-10)

Current owner instruction permits deleting an admission and its uniquely linked same-branch Provisional student, including legacy pairs lacking createdByAdmissionFlow metadata. The earlier marker-only ownership restriction is SUPERSEDED for this fictional DEMO scope. Validate reciprocal links, branch, uniqueness and Provisional status; reject ambiguous/broken/Active links without erasing data. Unrelated records and durable counters remain unchanged. Reuse existing popup/CRUD/services; no migration framework, dependency, backend or permissions change. Implementation IN_REVIEW; owner acceptance pending.

---

## Latest owner scope - F02-003 branch numbering and DEMO CRUD (2026-10-10)

**Current authorization:** F02-003 extension only; delivered IN_REVIEW, owner acceptance pending. Independent durable branch Student/Admission sequences, shared popup and browser-local View/Edit/confirmed safe Delete are explicitly approved. Earlier current-authorization snapshots below are historical. No following ticket, backend, production permissions, fees or enrollment authorized. [Latest delivery evidence](PROGRESS.md#f02-003-resumed-delivery---branch-wise-numbering--working-admissions-crud-2026-10-10).

---


## Foundation Owner Acceptance and F01-001 Authorization (2026-10-09)

**Owner decision: CONFIRMED.** Owner explicitly accepted F00-002A/F00-003 and F00-004 through F00-010 for their implemented, reported-and-tested mock scopes. F00-001 remains accepted. These scoped deliveries are DONE. Parent F00-002 is covered by accepted child routing/layout/auth/permission work; temporary module routing remains deferred. No duplicate implementation is required. Earlier acceptance-pending snapshots are preserved as history.

This acceptance does not verify actual CI, production deployment/SPA fallback, backend security/runtime, real authentication or formal accessibility certification. It does not approve broad business permissions, multi-role policies, All Branches or ERP modules.

**Current authorization:** F01-001 only - shared Dashboard Page Skeleton with heading, active branch, responsive placeholders and existing shell. Dashboard uses existing workspace.view guard; no new permissions/statistics/actions/dependencies. No following ticket authorized.

---

## DEC-F00-005 — Minimal Mock Access and Testing Approval (2026-10-09)

**Status:** CONFIRMED — explicit owner authorization; implementation IN_REVIEW.

Owner approved fictional mock auth/restoration, minimum branch-role context, initial branch selection and only `workspace.view`. All other permissions denied for every role; full branch switcher, All Branches and general permission handling remain separate F00-006/F00-007 tickets. Public root Hi and 404 preserved; `/login`, `/select-branch`, `/workspace`, `/unauthorized` approved.

Vitest, React Testing Library, DOM peer, user-event, jest-dom and jsdom approved as dev-only testing tools. Frontend CI Node pinned to 22.22.2 for compatibility; local Node 24.16.0 and Node 22.22.2 suites passed. No production auth/backend decision implied. [Progress evidence](PROGRESS.md#f00-005--completed-implementation-evidence-2026-10-09).

---

## 1. Purpose

This document maintains the long-term project memory of the Academy Management ERP.

It records:

- Confirmed product decisions.
- Approved architecture decisions.
- Rejected approaches.
- Deferred functionality.
- Client change requests.
- Important technical decisions.
- Unresolved questions.
- Decision history and rationale.
- Impact on existing modules and documentation.

The purpose is to prevent Codex, Antigravity and future developers from losing context or repeatedly changing previously agreed decisions.

This document is not a substitute for PRD.md, ARCHITECTURE.md, SECURITY.md, DESIGN.md or other authoritative specifications.

It records decisions and references those specifications.

## 2. Decision Classification

Use these classifications consistently.

**CONFIRMED:** Explicitly supplied or approved.

**PROPOSED:** Recommended but not yet approved.

**TBD:** Not yet decided.

**DEFERRED:** Excluded from the current release or phase.

**REJECTED:** Considered and explicitly declined.

**SUPERSEDED:** Replaced by a newer recorded decision.

Confirmed does not mean implemented.

General client approval does not automatically resolve every detailed technical or business rule.

## 3. Project Identity

### DEC-001 — Product Type

**Status:** CONFIRMED

The project is a web-based Academy Management ERP.

It manages academy operations through connected administrative, academic and financial modules.

### DEC-002 — Initial Client Scope

**Status:** CONFIRMED

The initial application is for one academy organization.

It is not a multi-client SaaS platform in its first release.

### DEC-003 — Multiple Branches

**Status:** CONFIRMED

The academy may operate multiple branches.

Branch creation and management must be configurable through the authorized application interface.

Do not hardcode a permanent branch count.

### DEC-004 — Application Platform

**Status:** CONFIRMED

The project will be developed as a web application.

Electron, standalone desktop software and LAN-only deployment are outside the current scope.

### DEC-005 — Future SaaS Possibility

**Status:** DEFERRED

The system may evolve into a multi-client SaaS product in the future.

Current development should remain modular and maintainable but must not introduce unnecessary tenant billing, licensing or SaaS administration.

---

## 4. Confirmed Technology Decisions

### DEC-006 — Frontend Stack

**Status:** CONFIRMED

Frontend technology:

- React
- Vite
- JavaScript/JSX

The existing frontend root is named `Client/` with a capital C.

### DEC-007 — Backend Stack

**Status:** CONFIRMED

Backend technology:

- Node.js
- Express

The existing backend root is named `Server/` with a capital S.

### DEC-008 — Database

**Status:** CONFIRMED

Database technology:

- MongoDB
- Mongoose

Detailed collection schemas remain subject to ERD.md approval.

### DEC-009 — Source Control

**Status:** CONFIRMED

The project uses Git with a private GitHub repository.

Project documentation must remain version-controlled.

Do not add `docs/` or `AGENTS.md` to `.gitignore`.

### DEC-010 — AI Development Tools

**Status:** CONFIRMED

Codex and Antigravity are used to assist implementation.

Both tools must follow the approved project documentation and work on controlled development tickets.

---

## 5. Development Strategy Decisions

### DEC-011 — Frontend-First Development

**Status:** CONFIRMED

The frontend will be developed before the complete backend integration.

Frontend work should proceed module by module.

### DEC-012 — Mock Data First

**Status:** CONFIRMED

Early frontend development will use:

- Mock data.
- Centralized mock services.
- Browser demo storage where required.

Real client/student information must not be placed in public demo seed data.

### DEC-013 — Backend Integration Later

**Status:** CONFIRMED

After frontend workflows are sufficiently developed and reviewed, the application will integrate real Node.js and MongoDB services.

The backend must enforce real authentication, authorization and data integrity.

### DEC-014 — Separate Presentation and Data Access

**Status:** CONFIRMED

React pages and components must not directly depend on browser storage or database implementation details.

Data access must be abstracted through consistent services.

### DEC-015 — Incremental Development

**Status:** CONFIRMED

The frontend will be developed in controlled phases.

Each phase will contain small implementation tickets.

Agents must not implement multiple large modules simultaneously without authorization.

### DEC-016 — Existing Code Preservation

**Status:** CONFIRMED

Existing working source code must be preserved.

Destructive refactoring, deletion and unrelated modifications require review and authorization.

---

## 6. Roles and Access Decisions

### DEC-017 — Four Primary Roles

**Status:** CONFIRMED

The application supports:

1. Super Admin.
2. Owner.
3. Receptionist.
4. Teacher.

### DEC-018 — User Accounts

**Status:** CONFIRMED

Staff members have individual user accounts.

Roles are reusable definitions rather than separate role types created for every employee.

### DEC-019 — Multiple Branch Assignments

**Status:** CONFIRMED

One staff account can be assigned to multiple branches.

### DEC-020 — Different Roles Across Branches

**Status:** CONFIRMED

A user may have different roles in different branches.

Example:

- Branch A: Teacher.
- Branch B: Receptionist.

### DEC-021 — Multiple Roles in One Branch

**Status:** CONFIRMED

A user may have multiple approved roles within the same branch.

Example:

- Branch B: Teacher and Receptionist.

### DEC-022 — Super Admin Branch Management

**Status:** CONFIRMED

Super Admin can create and manage branches and staff assignments.

The detailed backend representation of academy-wide authorization remains subject to SECURITY.md.

### DEC-023 — Branch-Aware Interface

**Status:** CONFIRMED

A user assigned to one branch should enter that branch automatically.

Users assigned to multiple branches should be able to select among authorized branches.

Authorized academy-wide views may aggregate branch data.

### DEC-024 — Backend Authorization

**Status:** CONFIRMED

Frontend UI visibility alone is not sufficient security.

Real protected operations must be authorized by the backend.

### DEC-025 — Detailed Permission Matrix

**Status:** TBD

The exact permitted actions for Owner, Receptionist, Teacher and sensitive financial operations require detailed approval in SECURITY.md.

Do not infer blanket permissions from role names.

---

## 7. Frontend Design Decisions

### DEC-026 — Client Design Reference

**Status:** CONFIRMED

The existing Lovable prototype is the primary visual reference:

https://sunbeam-styler.lovable.app/

The client has reviewed the general ERP proposal and requested implementation.

Exact visual tokens must be verified before treating them as confirmed specifications.

### DEC-027 — Configurable Branding

**Status:** CONFIRMED

The Super Admin must be able to configure academy branding, including:

- Academy name.
- Academy logo.
- Primary theme colors.

Additional branding settings require review.

### DEC-028 — Page-Based Structure

**Status:** CONFIRMED

Each main ERP module should have its own route-level page folder under `Client/src/pages/`.

Corresponding module components should be grouped under `Client/src/components/`.

### DEC-029 — Reusable Components

**Status:** CONFIRMED

Common buttons, tables, filters, dialogs and shared UI patterns should be reused rather than duplicated.

### DEC-030 — Responsive and Accessible UI

**Status:** CONFIRMED — General Requirement

The frontend must support accessible forms, semantic controls, keyboard interaction and readable contrast.

Exact browser support, breakpoints and formal accessibility targets remain subject to DESIGN.md approval.

---

## 8. Confirmed Functional Modules

### DEC-031 — Core ERP Modules

**Status:** CONFIRMED — General Scope

The ERP includes:

- Dashboard.
- Admissions.
- Students.
- Courses and Batches.
- Faculty and Classes.
- Fees.
- Finance.
- Demo Classes.
- Assets.
- Reports.
- Settings.

Additional administrative modules:

- Branch Management.
- User Management.

The exact business behavior of each module must follow approved requirements.

### DEC-032 — Connected Workflows

**Status:** CONFIRMED — General Principle

ERP modules must share consistent underlying data.

Admissions, students, enrollments, fee records and financial reports must not be treated as unrelated independent datasets.

Specific workflow transitions remain subject to PRD.md and SYSTEM_DESIGN.md.

---

## 9. Proposed Technical Decisions

The following are recommendations, not yet confirmed implementation choices.

### PROP-001 — React Context

**Status:** PROPOSED

Use React Context for relatively stable shared state:

- Authentication.
- Active branch.
- Academy settings.
- Theme.

### PROP-002 — Data Fetching Strategy

**Status:** PROPOSED

Use a consistent server-data fetching and caching approach during API integration.

TanStack Query is a candidate.

### PROP-003 — Backend Modular Monolith

**Status:** PROPOSED — Architectural Detail

Organize the Express backend into feature-oriented modules with separation between routes, services, validation and data access.

The modular-monolith direction is part of the established architecture; exact internal structure remains subject to ARCHITECTURE.md.

### PROP-004 — Versioned REST API

**Status:** PROPOSED

Use consistent REST endpoints under `/api/v1`.

Final endpoints must be approved in FRONTEND_INTEGRATION.md.

### PROP-005 — Cookie-Based Sessions

**Status:** PROPOSED

Consider secure HttpOnly cookie-based sessions for production authentication.

Final decisions belong to SECURITY.md.

### PROP-006 — Production Hosting

**Status:** PROPOSED

Potential services:

- Vercel for React.
- Managed Node.js hosting for Express.
- MongoDB Atlas for the database.

Final hosting contracts, configuration and operational ownership remain TBD.

### PROP-007 — Mock Service Adapter

**Status:** PROPOSED — Implementation Pattern

Use a consistent asynchronous service interface with separate mock and HTTP adapters.

Final interfaces belong to FRONTEND_INTEGRATION.md.

---

## 10. Rejected and Deferred Approaches

### REJ-001 — Standalone Desktop Application

**Status:** REJECTED FOR CURRENT PROJECT

Do not introduce Electron or other desktop application infrastructure.

### REJ-002 — LAN-Only Deployment

**Status:** REJECTED FOR CURRENT PROJECT

The current product targets a hosted web application.

### DEF-001 — Multi-Client SaaS

**Status:** DEFERRED

Multi-client tenant management is not part of the first release.

### DEF-002 — Subscription Billing

**Status:** DEFERRED

No multi-client recurring subscription platform is required for the initial academy client.

### DEF-003 — Microservices and Kubernetes

**Status:** NOT AUTHORIZED

Do not introduce microservices or Kubernetes without a demonstrated requirement and explicit technical approval.

### DEF-004 — Native Mobile Applications

**Status:** DEFERRED

No separately developed Android or iOS application is included in the first release.

---

## 11. Client Approval History

### CLIENT-001 — General System Proposal Review

**Date:** 2026-10-09
**Status:** CONFIRMED — General Direction

The project owner reported that the client reviewed the System Design and Architecture PDF and accepted the proposed general direction.

The client requested implementation.

The client may provide additional minor frontend or business-logic adjustments later.

### Approval Boundary

General approval does not automatically finalize:

- Exact permissions.
- Fee calculations.
- Refund and discount policies.
- Detailed admission status rules.
- Database schemas.
- API endpoints.
- Design token values.
- Infrastructure costs.
- Production acceptance criteria.

These decisions remain governed by the relevant specifications.

---

## 12. Frontend Development Phase History

The current proposed development sequence is:

| Phase | Description |
|---|---|
| F00 | Frontend Foundation |
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

### Important

The presence of phases in this document does not mean they have been implemented.

Actual progress must be verified and recorded in PROGRESS.md.

Detailed implementation tickets are governed by FEATURE_TICKETS.md.

---

## 13. Current Project State

**As of 2026-10-09**

### Confirmed

- The general project concept has been discussed.
- The client has accepted the general proposed system direction, as reported by the project owner.
- The frontend-first development strategy is established.
- The main frontend structure has been proposed.
- Central documentation files are being prepared and reviewed.

### Not Yet Verified in This Document

- Complete implementation status of all frontend modules.
- Current Git repository status.
- Actual CI execution results.
- Installed UI dependencies.
- Production hosting configuration.
- Final backend authentication.
- Final MongoDB schemas.
- Detailed security authorization tests.

Do not convert unverified assumptions into completed status.

PROGRESS.md must remain the authoritative record of verified implementation work.

---

## 14. Change Request Register

Every future approved requirement change should be recorded with a unique ID.

### Change Record Template

**Change ID:** CR-YYYY-NNN
**Date:** YYYY-MM-DD
**Requested By:** Client / Project Owner
**Title:** Short description
**Previous Behavior:** Existing approved behavior
**Requested Behavior:** Proposed new behavior
**Reason:** Why the change is needed
**Status:** REQUESTED / UNDER_REVIEW / APPROVED / REJECTED / IMPLEMENTED
**Affected Documents:** PRD, DESIGN, ERD, SECURITY, etc.
**Affected Modules:** Relevant frontend/backend features
**Affected Tickets:** Ticket IDs
**Data Migration Required:** Yes / No / TBD
**Approved By:** Authorized approver
**Implementation Reference:** Git commit or pull request
**Tests:** Relevant regression verification
**Notes:** Any unresolved risk

A change must not be marked IMPLEMENTED without verified code changes and applicable tests.

---

## 15. Decision Change Procedure

When a new client request arrives:

1. Record the request.
2. Identify the affected existing decision.
3. Compare the request with approved documentation.
4. Assess scope and technical impact.
5. Identify dependent modules and tickets.
6. Request clarification where necessary.
7. Obtain appropriate approval.
8. Update the authoritative document.
9. Update related tickets.
10. Implement the change under an approved ticket.
11. Run relevant tests.
12. Record the outcome in PROGRESS.md.
13. Update this decision history.

Never silently change previously approved business rules.

---

## 16. Conflict Resolution Rules

If documents disagree, the coding agent must not independently choose whichever version is easiest to implement.

Instead:

1. Identify the conflicting statements.
2. Identify the authoritative document for that decision.
3. Check whether a newer approved change supersedes the earlier decision.
4. Report the conflict.
5. Request clarification if it cannot be resolved using approved history.
6. Update affected documents after approval.

### Document Ownership

- PRD.md owns product scope.
- SYSTEM_DESIGN.md owns business workflows.
- ARCHITECTURE.md owns technical structure.
- ERD.md owns database relationships.
- DESIGN.md owns visual standards.
- SECURITY.md owns permissions and authorization.
- FRONTEND_INTEGRATION.md owns frontend/API contracts.
- FEATURE_TICKETS.md owns implementation acceptance criteria.
- TASKS.md owns active development tasks.
- PROGRESS.md owns verified progress.
- MEMORY.md records decisions and changes.
- AGENTS.md directs coding agents to the relevant documents.

---

## 17. Important Open Questions

### Product and Workflow

- Final MVP feature depth.
- Exact admission approval flow.
- Student identification and registration format.
- Teacher assignment and attendance rules.

### Access Control

- Exact permissions for each role.
- Owner academy-wide versus branch-specific privileges.
- Financial adjustments, refunds and approval authority.
- Teacher earnings visibility.

### Data Model

- Student identity across branches.
- Guardian data structure.
- Enrollment uniqueness rules.
- Fee and payment allocation rules.

### Design

- Verified prototype colors and typography.
- Required responsive viewports.
- Exact role dashboard widgets.
- Receipt and invoice formats.

### Technical and Operations

- Production hosting provider.
- Session management configuration.
- Expected record volumes.
- Backup and recovery targets.
- File storage requirements.
- Release and acceptance thresholds.

These remain TBD until explicitly resolved.

---

## 18. AI Agent Memory Rules

All AI coding tools must:

1. Read AGENTS.md and relevant documentation.
2. Use this file for project decision history.
3. Treat approved authoritative documents as sources of detailed requirements.
4. Never claim a proposal is confirmed without evidence.
5. Never claim implementation is complete without tests or verification.
6. Record significant new decisions after approval.
7. Preserve prior decisions when a new change supersedes them.
8. Avoid duplicating large technical specifications here.
9. Never store passwords, API keys, secret tokens or confidential student records here.
10. Keep decision entries concise, traceable and dated.

If new instructions conflict with this history, report the conflict before modifying code.

---

## 19. Documentation Maintenance Rules

Update this file when:

- A significant business requirement is approved.
- A technical architecture decision is finalized.
- A previously approved requirement is replaced.
- A major approach is rejected or deferred.
- A client change request is approved.
- A project-wide assumption becomes a confirmed decision.

Do not update this file for every minor code edit.

Routine task progress belongs in TASKS.md and PROGRESS.md.

All documentation updates should be committed to the private Git repository.

---

## 20. Related Documentation

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](ARCHITECTURE.md)
- [Database ERD](ERD.md)
- [Design System](DESIGN.md)
- [Security Specification](SECURITY.md)
- [Frontend Integration](FRONTEND_INTEGRATION.md)
- [Engineering Rules](RULES.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Current Tasks](TASKS.md)
- [Progress](PROGRESS.md)

---

## 21. Current Next Steps

1. Complete review of core documentation.
2. Confirm unresolved product and security requirements.
3. Review consistency across PRD, SYSTEM_DESIGN, ARCHITECTURE, ERD, DESIGN and FRONTEND_INTEGRATION.
4. Approve the necessary F00 development tickets.
5. Implement and verify the frontend foundation.
6. Start F01 Dashboard after foundation acceptance.

**Do not interpret this list as implementation authorization.**

---

**Document Status:** ACTIVE — Project Decision Register
**Next Review:** After completion of documentation review or a significant approved change.
## 2026-10-10 - F02-003 authorized DEMO scope

CONFIRMED: owner authorized completing Antigravity's existing popup/shared form, atomic Pending admission and Provisional student, and sequential displayed IDs. Delivery IN_REVIEW, acceptance pending. No backend, permission grants, fees or enrollment.

PROVISIONAL: academy-wide counter within one browser-local database, following the owner's fallback proposal. Production numbering needs separate business approval. Immutable internal UUIDs remain distinct from display IDs. Duplicate-person matching was not invented.

## F02-003 owner-approved extension - branch sequences and DEMO CRUD (2026-10-10)

Active authorized scope: complete existing popup/shared form; independent durable Student and Admission counters per branch; accessible View/Edit/Delete actions; atomic linked update and confirmed deletion. Previous provisional academy-wide numbering is SUPERSEDED for new allocations, without renumbering existing IDs. Preserve original data and counters during migration. Delete only a same-branch reciprocal Provisional student with explicit admission-flow ownership; legacy ownership cannot be inferred from status alone and is denied with an explicit error. No permissions, backend, fees, enrollment or dependency changes. Implementation in progress; owner acceptance pending.

## 2026-10-10 - F02-003 extension implementation evidence

IN_REVIEW: owner-approved branch Student/Admission sequences and browser-local View/Edit/Delete implemented. Previous academy-wide provisional allocation is SUPERSEDED for new numbering. Preserve legacy IDs/high-water; do not infer old admission-flow ownership. Unknown legacy ownership is safely rejected, not marked approved. Final 174/174 tests, lint and production build PASS; local Edge CRUD/refresh/branch/keyboard/responsive checks PASS. Existing lint/bundle/working-tree whitespace warnings remain; no CI/deployment/backend/formal accessibility claim. No new dependency or next-ticket implementation; owner acceptance pending.

### F02-003 legacy correction delivery evidence (2026-10-10)

IN_REVIEW, not owner-accepted DONE. Latest unique same-branch Provisional-link deletion rule implemented without requiring newer ownership markers. Final 176/176 tests, lint/build and isolated local browser legacy CRUD/refresh/branch/keyboard checks PASS. Existing warnings remain; CI/deployment/backend/formal accessibility NOT_RUN. No dependency, backend or next-ticket work. [Current verified evidence](PROGRESS.md#f02-003-simple-crud-completion---legacy-deletion-correction-2026-10-10).

### F02-003 gapless display correction delivery (2026-10-10)

IN_REVIEW, owner acceptance pending. Latest mutable gapless display serial requirement implemented through response-only projection; prior visible never-reuse rule is SUPERSEDED, while permanent IDs/references/counters remain intact. Full 186/186 tests, lint/build and local Edge examples/filtering/refresh/branch checks PASS. No dependencies or next-ticket work. [Detailed evidence](PROGRESS.md#f02-003-gapless-branch-display-numbering-correction-2026-10-10).

## F03-001 limited directory order exception (2026-10-11)

CONFIRMED owner authorization: read-only DEMO Students Directory before F02-004; defer enrollment dependency only for listing. /students and sidebar now display saved branch students, gapless serials and linked Admission references. Missing legacy status is Active presentation only; stored records unchanged by directory reads. Existing workspace.view only; no production permissions. IN_REVIEW, acceptance pending. F02-002/F02-003 acceptance remains pending. Final 198/198 tests (19 files), lint/build and local Edge four-viewport/keyboard/admission-link/refresh/branch/logout checks PASS; actual CI/deployment/backend/formal accessibility NOT_RUN. No dependencies installed. [Full evidence](PROGRESS.md#f03-001-limited-demo-students-directory-2026-10-11). Next F02-004 requires separate approval; all remaining tickets preserved.
## F02-004 approved DEMO course/batch selection (2026-10-12)

CONFIRMED scope: branch-specific mock courses retained; Course required, Batch optional; minimal batch {id, branchId, courseId, name}; same shared popup/standalone form; admission courseId and optional preferredBatchId with legacy course text retained. No automatic name-to-ID mapping. Safe additive version-3 envelope behind existing mock storage key adds minimum batches from saved courses, preserves valid records/links/counters and never reseeds existing valid batches. New/changed selections validate branch/course/batch relations atomically; unchanged legacy/unresolved references may survive unrelated edits and display explicit unresolved labels. Session/branch guards remain DEMO UX safeguards; workspace.view unchanged. No backend, permissions, fees/enrollment/schedules/capacity rules or dependencies added.

IN_REVIEW; acceptance pending. F02-002/F02-003/F03-001 also remain acceptance pending. Baseline 198/198 PASS; final 223/223 tests (21 files; 25 new), lint/build and local Edge shared popup/View/Edit/optional batch/refresh/branch/keyboard/360-768-1024-1440 checks PASS. Existing lint/bundle warnings remain; actual CI/deployment/backend/formal accessibility NOT_RUN. [Full files, libraries, migration limitations and evidence](PROGRESS.md#f02-004-program-and-batch-selection-delivery-2026-10-12). Next F02-005 Admission Status Workflow needs separate owner decisions/approval; no following ticket started.
## F02-005 owner-approved DEMO status decisions (2026-10-12)

CONFIRMED owner approval: Pending -> Approved/Rejected only, explicit confirmation, same-status idempotency, no opposite transitions/reopening; canonical active-branch Owner/Super Admin only (any approved eligible role membership, never dashboard preview authority). Unique reciprocal same-branch linked Provisional student required; legacy unlinked/unsafe records refuse without changes. Student remains Provisional. Optional rejection reason; status plus append-only actor/time history committed atomically. Decided admissions, including existing Approved/Rejected records, are read-only and cannot be physically deleted. These latest rules supersede prior generic Edit/Delete availability for decided DEMO records only; existing comments/history preserved. workspace.view remains sole production-independent demo baseline, no real permission grant/bypass/backend change.

Implemented IN_REVIEW; acceptance pending, as are F02-002/F02-003/F02-004/F03-001. Existing version-3 storage accepts optional embedded statusHistory without reset/backfill; current identity/branch and policy validated at service/database boundaries, stale/conflicting operations fail without writes. Final 248/248 tests (23 files; 25 new), lint/build and local Edge status/keyboard/four-viewport/persistence checks PASS; existing warnings remain. Actual CI/deployment/backend/formal accessibility NOT_RUN. [Exact files/libraries/history contract/evidence](PROGRESS.md#f02-005-admission-status-workflow-delivery-2026-10-12). Next F02-006 Admission-to-Enrollment Mock Integration requires separate scope and owner approval. Stop after F02-005.

## 2026-10-12 — Owner role matrix and Admissions authority correction


## F02-005 Pending Delete owner extension (2026-10-12)

CONFIRMED: the owner's follow-up request enables Delete in the three-dots Admissions Actions menu for Super Admin in the active authorized branch, following the preceding Super Admin-only proposal. Receptionist/Owner/Teacher and unresolved multi-role assignments remain denied. Approve/Reject authority remains unresolved and denied. Only Pending admissions can be deleted; decided records remain read-only. Existing confirmation/Cancel/Escape, pending-submit lock, error/retry, atomic linked Provisional deletion, unrelated-record preservation and response-only gapless renumbering are reused. Permanent IDs and historical counters are retained. No storage reset, backend or dependency change.

**Status: IN_REVIEW; owner acceptance pending.** Full tests PASS: 240/240 in 23 files. Lint PASS (0 errors, 1 existing DashboardPage warning); build PASS (existing large-chunk warning). Manual browser viewport inspection, CI, deployment and backend/security verification NOT_RUN. This entry supersedes historical Pending Delete denial only; previous evidence and explanatory comments are retained.


CONFIRMED: the owner supplied the module-level Super Admin/Receptionist/Owner/Teacher matrix now recorded in SECURITY.md. For implemented Admissions, Super Admin and Receptionist have View/Create/Edit, Owner has View only, and Teacher has no access. Approve/Reject and Pending Delete are proposed for Super Admin only and remain denied until separately confirmed. The earlier Owner/Super Admin F02-005 decision grant is SUPERSEDED. Existing decided records/history remain preserved and read-only. Teacher Students access remains denied until `Assigned students only` has an approved assignment model. All Branches, multi-role combining and detailed `Full`/`limited`/`own` action scopes remain deferred.

## F02-005 final Super Admin Admissions authority (2026-10-12)

CONFIRMED and superseding the pending proposal above: within the active assigned branch, Super Admin may View/Create/Edit/Approve/Reject and delete Pending admissions. Receptionist may View/Create/Edit only; Owner may View only; Teacher has no Admissions access. Named permissions apply without a broad bypass; role-dashboard preview never changes authority; unresolved multi-role combinations and All Branches remain denied/deferred. Decided admissions remain read-only and non-deletable, status history persists atomically, and linked Students remain Provisional. Implementation is IN_REVIEW pending owner acceptance; 246/246 tests, lint and build passed with recorded existing warnings. No backend or dependency change.

## Connected academic configuration and admission preview (2026-10-13)

CONFIRMED: Academic Streams, Courses, Batches and Subjects are saved branch master data managed by Super Admin. New Admission consumes those records in the approved main-column plus sticky-summary layout. Any displayed tuition is a preview from configured course or subject pricing. Admission submission creates a Pending admission and linked Provisional student only; official challan and payment remain restricted to the existing post-enrollment Fees workflow. Concessions, installment scheduling, faculty-subject mapping and SMS behavior remain unresolved and must not be inferred.

## F02-006 owner-approved mock enrollment (2026-10-12)

CONFIRMED for this frontend DEMO ticket: the active-branch Super Admin may enroll an Approved admission using the existing `admissions.decide` grant; no additional permission is introduced. Enrollment requires an exact same-branch reciprocal admission-flow Student, saved Course and matching Batch. An unresolved Student/Course fails safely; a missing or unresolved preferred-batch reference can be replaced only by explicit user selection of a valid saved same-branch Course Batch, without name guessing. One enrollment per admission, duplicate active student/course/batch pairs blocked, and the Admission remains Approved. Enrollment creation and Student Provisional → Active are one localStorage write. Enrolled Admission/Student edits, Admission deletion and Approved → Pending are blocked. Schema is `{id, branchId, admissionId, studentId, courseId, batchId, status, enrolledAt}`. Version-3 mock storage migrates additively to v4 while preserving records, IDs, counters and storage key. No cancellation, fees, backend or production authorization decision is implied. F02-006 is IN_REVIEW pending owner acceptance; F02-007 targeted integration passed 129/129 tests and production build, while manual browser walkthrough/full suite remain NOT_RUN.
# 2026-10-13 — Confirmed academic-fee linkage

For the DEMO frontend, an admission's configured fee is derived from exactly one saved pricing mode (course package or selected subject sum), then carried into enrollment and enforced at official challan issuance. A generated challan remains an enrollment-only F06 action. Concessions, installment policy and SMS stay TBD.


## 2026-10-18 ? CONFIRMED owner authorization for final QA and safe dev push

Owner explicitly authorized direct-dev stabilization and release of intended completed Codex/Antigravity work in one new commit followed by a normal origin/dev push. Preserve all existing approved UI and owner records; exclude artifacts/generated/secrets, preserve local history, stop on unexpected remote commits, and do not suppress diagnostics or remove tests. Noncritical build notices may be documented when no safe behavior-preserving fix exists. QA-RELEASE-20261018 evidence is recorded in PROGRESS.md; no new backend/security/business policy is authorized.
