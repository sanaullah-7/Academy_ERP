<!-- Project decisions log — important confirmed decisions, changes aur unresolved questions -->

# Academy Management ERP — Project Memory & Decision History

**Document:** MEMORY.md
**Version:** 1.0
**Status:** ACTIVE — Project Decision Register
**Last Updated:** 2026-10-21
**Project:** Academy Management ERP
**Maintained By:** Project Owner / Authorized Development Agent

## F00-011 — Login logo motion approved (2026-10-21)

**CONFIRMED by owner:** Add restrained Three.js motion to the existing login logo, using GSAP for subtle idle float and gentle pointer tilt. Keep its white background and configured branding. Honor reduced-motion preference and keep a static image fallback when WebGL is unavailable. The owner explicitly approved adding `three` and `gsap` for this isolated ticket; no shared animation framework or other screen is authorized.

Implementation is complete and remains IN_REVIEW pending owner acceptance. Focused tests (12/12), targeted lint, build and local browser reduced-motion/WebGL checks pass. Detailed evidence is recorded in `FEATURE_TICKETS.md`, `TASKS.md` and `PROGRESS.md`.

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
- [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md)
- [Database ERD](../01-ARCHITECTURE/ERD.md)
- [Design System](../04-FRONTEND/DESIGN.md)
- [Security Specification](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)
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


## 2026-10-18 - CONFIRMED mobile-only scope, desktop preservation and no push

Owner explicitly authorized MOBILE-20261018 directly on dev from c86724a: premium presentation for widths up to767px across existing ERP modules, preserving exact desktop/laptop at768px+ and existing business/data/permission/export behavior. Reuse existing navigation and dependencies, keep artifacts and owner records, verify disposable-browser mobile matrix plus desktop before/after screenshots. Unlike the prior QA release, this task explicitly forbids commit/push until separately approved. Delivery remains IN_REVIEW pending owner mobile acceptance.


## 2026-10-18 - CONFIRMED Demo registration saved-class display and form polish

Owner's follow-up authorizes the Demo registration form to show the actual classes belonging to the selected field/course/batch and a professional clean form design. This is a scoped exception to the earlier QA task's no-redesign restriction, only for this dialog. Using a saved timing fills the existing requestedDate/requestedTime; registration remains a prospective request and the existing separate scheduling confirmation is preserved. No new automatic booking/admission/attendance rule introduced, and no new persistence schema/API or permissions required. Prior QA release9e8fd33 is already synchronized; this additional feature remains uncommitted for review.


## 2026-10-18 - Demo inquiry actions

Owner requested deletion of demo registrations and three-dot grouping of row actions. Implemented inquiry-only deletion with confirmation and existing manage permission; converted admission links remain protected. No deletion cascade, schema change or new release push.


## DEMO-MULTI-CLASS-20261018

CONFIRMED 2026-10-18 DEMO-MULTI-CLASS-20261018: owner requested selecting more than one saved class in demo registration. Store requestedClasses as an optional inquiry array; resolve and validate actual class references in the centralized mock adapter. Existing records without the array remain valid. Selected classes are requests, not automatic confirmed bookings.


## DEMO-UI-POLISH-20261019

Owner-authorized presentation update: reuse shared CustomSelect for Demo stream filter; reduce summary card padding/icon/value size and page/header vertical spacing; remove Trial Faculty desktop column and matching mobile summary line, redistribute seven table column widths. Faculty information remains in inquiry details and scheduling. IN_REVIEW. PASS: 10 existing Demo page/registration tests, full lint0/0, production build (existing large-chunk notice), disposable Edge dropdown bounds/selection and removed-column checks at360/1440px, git diff --check. No persistence/business-rule change or commit/push.


## DEMO-DIRECT-ATTENDANCE-20261019

Owner explicitly replaces the separate Demo scheduling UI with direct attendance after registration. Removed scheduling menu actions and page dialog/data wiring. Registered, Scheduled, Attended and Missed inquiries can use the existing attendance dialog; converted/cancelled records remain blocked. Attendance is inquiry-level, not per-class tracking. Registration-selected classes now appear inside Scheduled Trial Class Session in Details, with legacy scheduled-session fallback; no fabricated sessions. Attendance modal remounts per candidate to avoid stale outcomes. Expanded status column and compact table badges prevent clipping. PASS:42 targeted service/page/registration tests, full lint0/0, build (existing chunk warning), isolated Edge360/1366/1440 direct attendance and status badge bounds, git diff --check. Full suite NOT_RUN. IN_REVIEW; no owner data edits, no commit/push.


## PAGE-HEADER-CLEANUP-20261019

Owner authorized removal of category/branch eyebrow text above page names across all tabs. Removed matching lines/decorative dots from Demo Classes, Fees, Finance, Assets, Reports, Branch Management, User Management and Settings. Other pages already start at their main heading. Page titles, descriptions and branch context remain intact. PASS: full ESLint0/0, production build (existing chunk warning),11 existing Finance/Demo page tests, git diff --check. Browser/full suite NOT_RUN for this presentation-only change. IN_REVIEW; no commit/push.



## ASSETS-FLOW-20261019 - UNDONE

Owner requested reverting only the last Assets adjustment. Restored prior table widths/sidebar layout/KPI display, prior unsupported-version message and prior imports. Removed scoped asset-table CSS. Earlier Demo/shared header changes and unrelated existing Assets redesign preserved. PASS git diff --check; runtime tests NOT_RUN for this targeted reversal. No records modified.


## STORAGE-V9-RECOVERY-20261019

Owner authorizes urgent recovery of all tabs after unsupported-version errors. Read only the academy app database/organization keys from Chrome storage, saved local untracked recovery snapshots (never stage: contains owner records). Identified persisted version9 with actual saved records; current reader rejected anything beyond8. Version9 payload validates against current schema. Reader now explicitly accepts8 and9, preserving stored version9 and all collections; unknown versions and invalid records remain rejected without rewriting. No seeding, reset, downgrade, actual owner-storage writes or UI redesign. Removed3 dead Assets imports for clean lint. PASS35 database/assets tests including v9 reads, writes, preservation and invalid-record rejection; production build (existing chunk warning); isolated owner-data-copy validation and no-alert routes Courses/Students/Admissions/Faculty/Fees/Finance/Demo/Assets, isolated asset write preserves students/payments and version9. Owner should refresh the existing URL/branch. IN_REVIEW; no commit/push.


## ASSETS-LIVE-FLOW-20261019

Owner reauthorizes Assets functionality and compact non-overflowing inventory layout after previous targeted undo. Existing centralized asset services remain the data source; register/edit/assign/unassign/inspection/maintenance mutations retain persistence and branch/permission checks. Added cleaned-up focus/storage/minute refresh with latest-request guard so summaries and rows reflect saved changes. Added duplicate-submit guards. KPI loading/errors no longer masquerade as zero totals. Desktop inventory uses fixed percentage widths, compact single-line typography/ellipsis and bounded text; full details remain accessible. Existing mobile cards retained. Sidebar stacks below the table until1600px to provide readable table width. PASS37 database/asset-service/mounted-page tests, including actual UI registration/card totals and external saved inspection/value refresh; full lint0/0; production build with existing large-chunk warning; isolated Edge actual registration, persistence, table refresh and no horizontal table/page overflow at360/768/1024/1366/1440/1600px; git diff --check. Full suite NOT_RUN. No owner-record changes, no new seeding/schema change or commit/push. IN_REVIEW pending owner acceptance.


## REPORTS-SESSION-LABEL-DATE-20261019

Owner requests automatic month/year on Current Session option. Replaced hardcoded Oct2025 with Intl month/year in Asia/Karachi; minute timer/focus refresh and cleanup support open-page month/year rollover. This ticket changes label only; actual academic-session filter dates remain unconfigured as previously reported. PASS production build (existing chunk warning), isolated UTC-browser clock test Dec2026->Jan2027 at Karachi midnight, git diff --check. Existing Reports lint issues unchanged; full tests NOT_RUN.


## REPORTS-WORD-EXPORT-20261019

Owner requests pictured Word/Google Docs-compatible export beside PDF. Added blue Word document action producing genuine.docx Office Open XML without new dependencies. Shares exact PDF row formatting and filtered/selected scope; exports report title, branch and filter summary. Text escaped and invalid XML controls stripped; files are local downloads, not automatic Google Drive uploads. PASS6 Reports/Word tests, targeted new helper lint, production build (existing chunk warning), disposable browser selected-row download, Python ZIP CRC/all XML parsing and exactly header+one selected table row; git diff --check. Native Word/Google Docs import UI NOT_RUN. Existing unrelated Reports lint issues remain. No owner data changes.


## REPORTS-LEFT-TREND-20261019 - Left analytics card redesign

CONFIRMED owner change: redesign only Reports left analytics card as real-data tab-aware area trend with Day/Week/Month/Year/Date Range controls; preserve right donut/theme/ledger workflows. Period buttons group filtered dates; custom dates limit only the chart. No fabricated history or current balances projected onto past dates. Current Session boundaries remain TBD and disclosed. Evidence: PROGRESS.md. IN_REVIEW pending owner acceptance.


## BRANCH-CREATION-PAUSE-20261019

CONFIRMED owner instruction: client currently agreed two branches; preserve all existing saved branches, but pause ALL new branch creation including Super Admin until owner explicitly requests re-enabling. This supersedes currently available frontend creation behavior; it does not delete extra existing branches, alter their assignments, or authorize new subscription/license infrastructure. Added centralized source-controlled branch-creation pause policy with no user-facing enable switch; Add Branch disabled even before data loads with visible explanation. Organization service rejects creation after authorization and rejects unknown IDs to prevent creation disguised as edit. Existing branch viewing/editing/lifecycle remain available under existing rules. No storage migration/reset or owner-record writes. Existing configured license count is not changed by this temporary pause.

PASS10 organization service tests covering Super Admin/new creation rejection, exact stored organization and assignment preservation, existing-branch edits/lifecycle, unknown-ID bypass rejection, other-role denial and staff/settings regressions. Replaced superseded positive-creation/limit tests; existing branch fixtures now seed test storage only. PASS touched-file ESLint0/0, production build (existing chunk warning), git diff --check; disposable Edge disabled Super Admin Add Branch, direct service denial, preservation of3 QA branches and existing edit enabled. Evidence: artifacts/branch-creation-pause-20261019. Full suite NOT_RUN. This is frontend/mock-service enforcement; production backend enforcement remains a later authorized task. IN_REVIEW pending owner acceptance; no commit/push.


## BRANCH-EDIT-DELETE-20261019

CONFIRMED owner change: Branches must expose Edit/Delete while new creation stays paused. Owner explicitly selects: only empty inactive branches may be deleted, with confirmation; linked student/fee/staff or other records prevent deletion. Core branch name/code/location/contact edits now allowed via saved display overrides, preserving immutable IDs. Existing core lifecycle protection remains; enabling creation still requires explicit owner instruction.


## BRANCH-STATUS-NAME-20261019

CONFIRMED owner change supersedes BRANCH-EDIT-DELETE-20261019 display-edit scope/core lifecycle protection: only branch name is editable; code/location/contact/IDs/status remain unchanged by editing. Core and custom branches may activate/deactivate using the separate status action. Existing current-branch switch-away, last-usable-branch and unfinished-operation guards remain. New creation stays paused and deletion still requires empty/inactive with no staff or linked records.


## BRANCH-DELETE-ADMIN-EXCEPTION-20261019

CONFIRMED owner policy supersedes the prior no-staff-assignment condition: an otherwise empty inactive branch may be deleted if remaining branch assignments are exclusively Super Admin. Any other staff role (including alongside Super Admin), disabled non-admin staff or operational records block deletion. On success remove only deleted-branch access assignments, preserve staff accounts/other branches. Inactive requirement remains. Screenshot branch still has1 course and active status; no owner data deletion was requested/executed.


## D-BRANCH-PURGE-20261019

EXECUTED: Owner explicitly authorizes permanent one-time deletion of only branch d, superseding normal empty/inactive restrictions for this exact branch. Exact ID confirmed from local recovery metadata and matched against current browser saved organization before deletion. Tested isolated cleanup first, then ran in owner Chrome via a temporary localhost page. Private backup acknowledged before any write. Actual verified deletion removed branch d, its1 linked asset, target counters and branch-specific staff assignments; other operational collections had0 target records. Post-write equality checks confirm all other-branch records preserved. Staff accounts/other branch access preserved. Browser callback returned success. Backup/result/helper in git-ignored private-data/d-branch-purge; temporary public cleanup page removed after success and local helper stopped. No general force-delete functionality added and Add Branch pause remains unchanged. PASS isolated target-only/backup/preservation test and actual result verification; git diff --check. No build required (no persistent application code change). Owner may refresh Branch Management. No commit/push.


## BRANCH-CARD-CLEANUP-20261019

CONFIRMED owner explicitly rejects retention of branch d backups. Dedicated one-time purge backup/helper folder deleted; d data removed from historical recovery snapshots while preserving other branch records. This supersedes backup retention in D-BRANCH-PURGE-20261019. Minimal audit notes remain, not recoverable branch records. Owner also requests removing branch View eye action and distinct soft card colors. Existing edit/status/delete and creation pause preserved.


## REMOVE-WORKSPACE-FLOW-20261019

Owner explicitly authorizes removing the obsolete Workspace screen and all shipped source references. Root always redirects to login, including with a restored demo session. Successful login opens Dashboard directly for one branch or after branch selection. Removed WorkspacePage and route; obsolete URL now uses existing Not Found handling. Renamed shared shell CSS/theme tokens to app-* and baseline permission to dashboard.view with unchanged assigned-role/branch checks. Preserved historical records and unrelated in-progress changes. Branch-switch keyboard focus survives Dashboard shell remounts. IN_REVIEW pending owner acceptance.


## FRONTEND-PERF-20261019

CONFIRMED owner authorizes frontend-only performance optimization directly on dev while retaining existing UI, data/permissions, uncommitted changes and current mock persistence architecture. Route splitting and bounded detached raw-checked snapshots are implementation optimizations; no schema, business-policy, backend or dependency change. Ticket stays IN_REVIEW; no commit/push authorized.


## TAB-LOADING-FIX-20261020

CONFIRMED owner requests functional-only removal of unnecessary repeated tab loading/flicker and resolution of prior seven tests. Current local data may initialize page state only when all canonical raw storage/session values and dates are unchanged. Any scope/data/permission change invalidates snapshots; service revalidation, locking and real loading/errors remain. No UI redesign or persistence change authorized. Keep IN_REVIEW for owner browser acceptance.


## SETTINGS-BRANDING-ONLY-20261020

Owner explicitly requests removing Settings section tabs and their corresponding panels, retaining only Branding & Visual Identity in the existing design. Removed six section selectors/profile/academic/fee/roles/branch/alerts panels, obsolete state/imports and unnecessary academic read. Branding/name/logo/sidebar preview, Save/Cancel/default reset remain. Existing hidden profile metadata is loaded and preserved on saves; save/reset disabled until saved settings are available. SettingsPage.jsx only application file changed. PASS targeted ESLint, production build (existing export chunk warning), AdminOperations integration4/4 and isolated Edge only-branding/save/hidden-metadata preservation/desktop1440 and mobile390 fit checks. Full suite NOT_RUN for scoped UI removal. Existing uncommitted work retained; no commit/push. IN_REVIEW pending owner visual acceptance.


## RECENT-ENROLLMENTS-TODAY-20261020

Owner-authorized scope: Dashboard Recent Student Enrollments card shows only the current Asia/Karachi calendar day's saved enrollments. Existing active branch, period/search filters, latest-five limit, student links, fee calculations and View all admissions navigation remain. Desktop/mobile share the filtered list. Enrollment display dates use the same academy timezone; existing minute clock updates the day after midnight. Subtitle/empty state explain today's scope. Added reusable isOnAcademyDay predicate without changing existing local date-input formatting.

Status: IN_REVIEW pending owner acceptance. Changed application files: Client/src/components/Dashboard/SuperAdminDashboard.jsx, Client/src/utils/formatDate.js, Client/src/utils/formatDate.test.js. PASS: targeted Vitest22/22 (date boundaries/invalid dates/day rollover plus existing dashboard regressions), touched-file ESLint, production build. Existing large export chunk warning remains. Browser/manual workflow and full suite NOT_RUN for this scope. No backend, saved owner records, permissions or layout changes; no commit/push. Existing unrelated working-tree edits preserved.


## RECENT-ENROLLMENTS-PAGINATION-20261020

Owner-authorized change: Dashboard Recent Student Enrollments now reuses Shared/Pagination.jsx below desktop/mobile rows, including empty state. Default10 with existing10/15/25/50 choices, matching record range, page numbers and previous/next controls. Replaced latest-five truncation with pagination over all matching today's active-branch enrollments. Existing newest-first order, period/search filters, dues and navigation preserved. Page resets on filter/search/branch/academy-day/row-size changes and clamps on data shrink. This supersedes the prior latest-five limit only.

Status IN_REVIEW pending owner visual acceptance. Application changes: Client/src/components/Dashboard/SuperAdminDashboard.jsx and Client/src/pages/Dashboard/DashboardPage.test.jsx. PASS final Dashboard14/14 including12-record pagination fixture, prior-day exclusion, next page, row-size reset and search reset. Initial test assertion had a shell-encoding character issue and lazy-load wait; corrected test passes. PASS touched ESLint, production build (existing large export chunk warning), diff whitespace check. Browser/manual and full suite NOT_RUN. Updated TASKS/FEATURE_TICKETS/PROGRESS/MEMORY. Existing unrelated edits preserved; no commit/push, dependencies or data mutation.


## ADMISSIONS-FILTERS-PAGINATION-20261020

CONFIRMED owner change: Admissions application table gains shared pagination (default10;10/15/25/50), record range and page controls, plus All/Daily/Weekly/Monthly/Yearly/Custom segmented period controls above the table. Saved application createdAt drives the date filter in Asia/Karachi. Weekly means current Monday-Sunday; monthly/yearly current calendar month/year. Custom dates include both boundaries, require both dates and reject reversed ranges. Search/status/date filters intersect with active branch. Page resets on filter/row-size changes and clamps after data shrink; selection header toggles current page, Select all matching and exports cover all matching records. Clear filters resets date/search/status. No changed admission actions, form design or permission policy.

Supporting fix found by isolated browser: ordinary new admission createdAt previously used UTC date-only, excluding a newly saved application from Daily between Karachi midnight and05:00. New ordinary/instant admissions save academy calendar date through getAcademyDateOnly; historical saved records and financial issue/due dates remain untouched. No Server changes, migrations, dependencies or owner data mutations. Scope files: AdmissionsPage.jsx/test, utils/admissionPeriod.js/test, utils/formatDate.js, mock/mockDatabase.js (two admission creation timestamps and import only), mock/admissionTransaction.test.js.

Verification: touched ESLint PASS, production build PASS (existing large export chunk warning), whitespace check PASS. Isolated Edge PASS six periods, custom endpoints, next page, reset, CSV all12 matches despite two pages,1440desktop/390mobile without page overflow and no JS errors. Browser fixture records existed only in disposable browser storage. Initial33 focused tests PASS; expanded final test results recorded below. Earlier interim expanded run48/50 included old-page-return regression (fixed and retested) and a cold-load CRUD timing failure. IN_REVIEW pending owner acceptance; no commit/push; unrelated working-tree edits preserved.


## FEES-PERIOD-TOOLBAR-20261020

CONFIRMED owner request: Fees ledger gains compact All/Daily/Weekly/Monthly/Yearly/Custom controls to the LEFT of a narrower search on the same desktop toolbar; mobile wraps. Filters use saved challan issueDate in Asia/Karachi, current Monday-Sunday week/month/year and inclusive custom endpoints. Incomplete/reversed custom ranges show no matches with guidance. Date/search/status filters intersect in active branch; chip counts match date scope; pagination and selection reset on filter changes. Shared selection receives current page rows. CSV/PDF use existing matching/selected scope; KPI calculations remain unchanged. Reset clears dates/search/status. Overdue View All and dashboard receipt navigation restore All dates to preserve their intended destination.

Extracted existing Admissions calendar logic unchanged into utils/reportingPeriod.js; admissionPeriod.js retains compatibility aliases. No financial formulas, payment authorization, persistence, Server or dependencies changed. Source files: FeesPage.jsx, utils/reportingPeriod.js, utils/admissionPeriod.js. Tests: new FeesPage.test.jsx plus financialService.test.js preload of Dashboard/Fees modules before receipt navigation assertions to exclude lazy module transformation timing; all original assertions preserved.

PASS31/31 final tests:26 across Fees page, Admissions page, calendar boundaries and KPI metrics; financial service5/5 including saved verified receipts/branch isolation/dashboard selected-payment navigation. Initial new-test selector mismatches corrected; initial service navigation timed out on Loading module, corrected harness preloads routes. PASS touched ESLint, production build (existing1171.90KB export chunk warning), whitespace check. Isolated Edge PASS period controls left of search/same row at1600/1440/1280/1024 and390mobile/custom no overflow; real service-created disposable demo challans verify all six periods, search, custom inclusive range, CSV date scope, Reset and zero JS errors. Owner browser data untouched. Artifacts: artifacts/fees-period-toolbar-20261020. Full repository suite NOT_RUN. IN_REVIEW pending visual acceptance; no commit/push; unrelated edits preserved. Updated TASKS/FEATURE_TICKETS/PROGRESS/MEMORY; next approval owner visual acceptance.


## ADMISSIONS-DEFAULT-SUBJECTS-20261020

CONFIRMED owner change: selecting a course in the Admissions form selects all its currently available active subjects by default. Manual subject deselection/reselection remains available. Selecting an additional course adds only that course's active subjects, preserving manual exclusions in already selected courses. Removing a course removes its subjects; selecting it again defaults all its active subjects again. Legacy course-dropdown selection also defaults subjects. Opening an existing saved admission preserves its recorded subject subset, and unrelated field edits never reselect excluded subjects. Subject buttons now expose aria-pressed. No blanket effect, persistence change or new subject/fee records.

Application file: Client/src/components/Admissions/NewAdmissionForm.jsx. New focused tests: NewAdmissionForm.subjects.test.jsx. PASS53/53 across all nine Admissions page suites plus three subject-selection tests. Additional fee-total assertions PASS focused3/3: all active subjects default, inactive excluded, manual exclusions retained across multi-course changes, removed/reselected course behavior, dropdown, submitted selected IDs, saved subset preservation and total3,000->2,000 after manual unselect. PASS touched ESLint, production build (existing large export chunk warning), whitespace check. Isolated Edge using real service-created disposable demo subjects PASS default selection, manual unselect, unrelated edits, course removal/reselection. Initial browser locator ambiguity with batch label corrected; no application defect. Full repository suite NOT_RUN. Existing owner data and unrelated edits preserved. No commit/push. IN_REVIEW pending owner visual acceptance; next approval owner review. Artifacts: artifacts/admissions-default-subjects-20261020.


## GLOBAL-TIME-12H-20261020

CONFIRMED owner-authorized global presentation change; IN_REVIEW pending owner acceptance. Central utils/timeFormat.js formats strict saved HH:mm/already12h clock values, whole known schedule ranges and user-facing timestamps with explicit Asia/Karachi timezone. Existing formatClassTime compatibility delegates to central formatter; class shift/period functions unchanged. Midnight/noon display12:00 AM/PM, afternoon/night numeric hour without leading zero. Invalid/missing values return explicit fallback; relative text stays unchanged. Timestamp offsets are respected; offset-free local ISO presentation is interpreted as Karachi; date-only fields never gain clock or shift day.

Shared Input delegates type=time to TimeInput: h:mm field plus AM/PM selector, returning canonical HH:mm to existing handlers. Partial/invalid input emits empty canonical value rather than retaining a stale valid time; disabled/required/read-only and existing labels remain. No persistence migration, schema/API representation, auth/branch policy, calculation, overlap, duration, date-filter, sorting, attendance/payment or countdown changes. Existing overnight validation remains unchanged (current create flows reject end<=start); formatting23:00->01:00 preserves endpoints without inventing a duration/date.

Presentation consumers updated: Dashboard class slots/enrollment timestamps/daily chart labels and role schedule labels; Faculty roster/timetable/saved assignment labels and room-conflict message; Courses/Batches tables/modals/CSV/PDF; Admissions subject/batch/clash timings and status history timestamps; Student profile subjects; Demo requested/scheduled/history timings and labels; Reports table time projections, human-readable enrollment CSV timestamps; PDF generated-at timestamp. Existing Faculty/profile/shift/demo export callers already using formatClassTime receive centralized output. Fees/Finance, Assets, Users and Settings audited: date-only fields remain date-only where no time was displayed. Raw API batchTiming and ISO dateTime attributes remain machine-compatible. No new dependencies, worktree/branch, Server changes or owner-data mutation. Existing performance/cache and unrelated edits preserved.

PASS focused tests 144/144: core35 (midnight/noon13:00/23:59, invalid/offset/date boundaries, input roundtrip, existing conflict/countdown/shift), modules92 (Faculty, Dashboard, Admissions, Reports, Students, Demos, daily classes and Word), export/form17 (Courses, PDF templates, default subject flow). Updated only two existing display assertions for new AM/PM labels/input8:00; storage assertions still expect08:00. PASS targeted ESLint on all24 scoped source/test files. ONE production build executed, PASS with existing1171.88KB export chunk warning. PASS whitespace check. Full repository suite NOT_RUN, as focused checks requested.

Isolated Edge: class assignment Create noon12:00 PM->1:30 PM saves12:00/13:30; Edit1:00 PM->2:15 PM saves13:00/14:15; Reload retains fields/PM. Actual teacher and room conflicts still reject; room error uses1:00 PM. Countdown at Karachi12:45 is Starting Soon with15 minutes. Same1:00 PM-2:15 PM displayed in Dashboard, Faculty, Admissions, Reports and batch directory. Batch CSV/PDF include AM/PM; profile print fires; enrollment CSV human timestamp12:45 PM while saved ISO remains unchanged. Mobile390 modal controls fit; desktop1440 checked. All four authorized roles and both allowed branches navigated without foreign branch data or JS errors. Browser scripts use only disposable demo storage. Initial browser harness selector/unsupported fixture-account mismatches corrected; no related application defects or workflow changes. Evidence/scripts/screenshot and complete24-file scope in artifacts/global-time-12h-20261020. No commit/push. Next approval: owner acceptance; STOP after authorized task.


## GLOBAL-TIME-PICKER-20261020

CONFIRMED owner-authorized enhancement; IN_REVIEW until owner acceptance. Shared TimePicker (time-input.jsx, TimeInput compatibility alias) remains the single implementation behind every Input type=time. Supports h:mm plus AM/PM or complete typed9:07 AM, arbitrary valid minutes00-59, normalizes on blur, and emits existing canonical HH:mm to unchanged save handlers. Compact clock-triggered native select supplies96 quarter-hour suggestions across both AM/PM and fills immediately. Native popup avoids CSS/modal overflow clipping and uses OS keyboard/touch behavior; disabled/read-only/required semantics retained. Invalid13:70 emits empty canonical value and fails validity. Existing same-day/overnight/start-end scheduling policies are unchanged.

Coverage: existing Faculty assignment, Batch form and Demo registration/schedule time inputs inherit picker; Admissions/Dashboard schedule editing entry points use those forms. No new time fields added to modules that only display times. Previous centralized AM/PM displays, reports/PDF/CSV, timezone and date-only behavior remain. No persistence/schema/migration, duration/overlap/countdown/financial/permissions/cache changes or dependencies.

Scope6 code/test files: components/ui/input.jsx, components/ui/time-input.jsx, components/ui/time-input.test.jsx, utils/timeFormat.js, utils/timeFormat.test.js, components/CoursesBatches/AssignFacultyModal.test.jsx. PASS37/37 distinct focused tests across two reports (36 initial plus1 new ordering case; repeated tests counted once). Tests cover complete/custom-minute input,96 suggestions and immediate selection, keyboard focus, midnight/noon, invalid entry, saved custom-minute prefill, original Demo create flow and canonical save/ordering/conflict/daily-class logic. Targeted ESLint on all6 files PASS. ONE production build PASS (existing1171.88KB export chunk warning). Whitespace check PASS. Full repository suite NOT_RUN for scoped enhancement.

Isolated Edge PASS manual9:07 AM creates09:07; suggested2:15 PM creates14:15; keyboard End suggestion23:45, midnight/noon options,13:70 rejection; Create-Save-Edit-Refresh preserves custom and edited times. Desktop1440/mobile390 modal fit with additional dropdown; touchscreen focus and keyboard dropdown navigation; native suggestions remain inside platform popup rather than a clipped DOM list. Existing teacher/room conflicts,15-minute Dashboard countdown, identical Faculty/Courses/Admissions/Dashboard/Reports schedules, batch PDF/CSV, enrollment timestamp CSV and print, all four roles/both authorized branches with no JS errors also PASS. Existing overnight rejection rule retained; no new policy. Browser tests used disposable demo storage. Evidence scripts/screenshot in artifacts/global-time-picker-20261020. TASKS/FEATURE_TICKETS/PROGRESS/MEMORY/FRONTEND_INTEGRATION updated. dev unchanged; no worktree/branch/commit/push/reset/stash/clean. Prior uncommitted edits preserved. No blockers; next approval owner visual acceptance; STOP.


## BATCH-SHIFT-NAMES-20261020

CONFIRMED owner-approved scope: Add/Edit Batch replaces start/end time controls with optional No shift selected/Morning/Evening select. Saved shift is null (none) or Morning/Evening, explicitly chosen rather than inferred from clock. Existing saved batch startTime/endTime are not removed or changed by editing; Faculty class time entry, schedules, AM/PM picker and duration/conflict/countdown behavior remain unchanged.

Batch name uniqueness is now (branchId, courseId, trimmed case-insensitive name), not branch-wide. Different courses can both have Batch1; same course cannot duplicate it even if shift differs. Update excludes own ID but cannot move/rename onto a same-course duplicate; existing linked-record course-move protections and authorization/branch validation retained. Optional shift is validated by mock payload and saved-record boundary, carried in existing projections/storage without migrations. No Server/schema production integration, fixed demo shifts or records added.

Admissions preferred batch dropdown/cards, enrollment selector and saved View details show selected shift. Batch directory and course-details batch cards show configured shift; legacy AM/PM times remain as fallback when no shift chosen. All references remain immutable batch IDs so duplicate names across courses never replace links. Scope8 source/test files: BatchForm.jsx/test, mockDatabase.js, academicModule.test.js, NewAdmissionForm.jsx, AdmissionActions.jsx, CoursesBatchesPage.jsx, CourseDetailsModal.jsx. Old uncommitted/performance changes preserved.

PASS47/47 distinct focused tests (32 primary plus additional Admissions CRUD and assignment regressions, repeated BatchForm tests counted once). Covers optional Morning/Evening/none, edit-clear/roundtrip, missing legacy shift, legacy times retained, invalid shift rejection, same name across courses, same-course case/trim duplicate and edit collision, read/save guards, admission course/batch flow and existing exact schedules. PASS targeted ESLint, production build (existing export chunk warning), diff whitespace check. Full suite NOT_RUN for scoped change.

Isolated Edge PASS real Add Batch form without time fields, Morning and Evening same-name batches in separate courses, same-course duplicate error, blank-shift batch creation, saved shift prefill/reload,390mobile popup fit, Admissions Morning/Evening cards and selectors, actual Submit Application and saved batch-label projection. No JS errors; records existed only in disposable browser. Initial exact-label browser selector exposed unnamed Course select; explicit aria-label added and all checks passed. Artifacts: artifacts/batch-shift-names-20261020. TASKS/FEATURE_TICKETS/PROGRESS/MEMORY/FRONTEND_INTEGRATION updated. dev unchanged, no commit/push or destructive git operations. IN_REVIEW until owner acceptance; no blockers. Next approval: owner review.


## TIME-PICKER-DROPDOWN-POLISH-20261020

Owner explicitly authorizes continuation of shared Start/End Time dropdown polish. IN_REVIEW pending owner visual acceptance. Changed components/ui/time-input.jsx and its test only, plus documentation/evidence. Replaced oversized native96-option suggestions with compact scrollable top-layer popover, selected checkmark, quarter-hour labels, viewport clamping and upward placement when needed. Keyboard arrows/Home/End/Page keys/Enter/Tab, touch selection, outside dismissal and Escape supported. Escape closes only suggestions before modal listeners. Manual arbitrary-minute input, saved-value prefill, canonical HH:mm output and existing validation/scheduling policies retained. AM/PM select gets scoped spacing/background override to prevent global select styling clipping its text. Existing Input type=time consumers inherit the change; no dependencies, data migration or business-rule changes.

PASS29/29 focused tests (picker, assignment form and formatter), targeted ESLint and final production build (existing large export chunk warning). Initial runs exposed unsupported-popover test rendering and modal Escape propagation; corrected and rerun PASS. Isolated Edge1440 desktop/390 mobile verifies bounded top-layer dropdown, keyboard/touch, midnight/noon/invalid13:70, manual9:07 AM=>09:07, suggested2:15 PM=>14:15, create-save-edit-reload, existing teacher/room conflicts and15-minute countdown, Dashboard/Admissions/Faculty/Courses/Reports display, CSV/PDF/print, four roles/two authorized branches; zero page errors. Mobile screenshot visually inspected including unclipped AM/PM. Evidence artifacts/time-picker-dropdown-polish-20261020. Full suite NOT_RUN. Existing uncommitted/performance edits preserved; branch dev, no commit/push/reset/stash/clean. No blockers. Next approval: owner review.


## ADMISSION-BATCH-SHIFT-ONLY-20261020

Owner-approved minimal display change; IN_REVIEW. Removed exact clock range and clock icon from Admissions preferred batch cards in NewAdmissionForm.jsx. Existing optional Morning/Evening badge, name, days, room, seats and selection retained. No inferred shift, stored-time changes or schedule/calculation changes. Targeted ESLint PASS. Tests/build/browser NOT_RUN for removal-only presentation change. Prior uncommitted edits preserved; no commit/push. Next approval: owner visual review.


## BATCH-DURATION-20261020

CONFIRMED owner-authorized change; IN_REVIEW pending owner acceptance. Batch create/edit now accepts optional positive integer durationMonths (1 month,2 months,3 months,etc), blank=null and existing absent values preserved without guessed defaults or migrations. Validated at form, mock payload and stored-record boundaries. Existing branch/course name uniqueness, optional shift, immutable IDs and legacy clock metadata retained. Duration is descriptive months only; no automatic end date, fee calculation or schedule/countdown/permission changes.

Shared utils/batchDuration.js formats singular/plural. Batches table schedule cell shows labeled duration (Not configured for legacy absence); directory CSV/PDF include Duration; course-details batch cards, Admissions batch dropdown/cards, enrollment dropdown and saved admission batchLabel show configured duration. Exact timing remains removed from Admissions batch cards. Source/test scope9 files: BatchForm.jsx/test, mockDatabase.js, academicModule.test.js, NewAdmissionForm.jsx, AdmissionActions.jsx, CourseDetailsModal.jsx, CoursesBatchesPage.jsx, batchDuration.js.

PASS16/16 focused tests covering create/edit/clear/refresh duration, invalid zero/negative/fraction/string rejection without storage mutations, shift/uniqueness guards and Admissions subject-selection regression. Initial new service test omitted existing mandatory name/course fields; fixture corrected to existing save contract and rerun PASS. Targeted ESLint PASS; production build PASS (existing large export chunk warning). Isolated Edge desktop/mobile PASS actual3-month create/save/edit/reload, Batches table text, Admissions dropdown/card and actual submitted application's saved duration label, optional shift and duplicate-name guards; zero page errors. Browser harness modal-hidden row lookup corrected; final rerun PASS. Evidence artifacts/batch-duration-20261020. Full suite NOT_RUN; PDF/CSV duration source mapping inspected, additional export browser test NOT_RUN. All persistence remains browser-local mock. Existing uncommitted/performance edits preserved; dev unchanged; no commit/push/reset/stash/clean. Next approval owner review.


## STAFF-LOGIN-BRANCH-20261020

CONFIRMED owner authorizes current-branch staff creation/listing, email/password login for every role including bootstrap Super Admin, shared initial staff password, profile password change, and academy-branded responsive login. IN_REVIEW until owner acceptance. Existing browser-local mock architecture retained; no Server or real authentication deployment introduced.

Implemented: Users page loads staffOverview keyed by active branch, lists only that branch's staff/assignments, automatically assigns current branch and one approved role, uses required normalized unique email and optional contact. Service rejects foreign-branch create/update/toggle/delete attempts; legacy assignments in other branches preserved on edit. Removed public UI Open Account impersonation action. Organization branch overview and branch mutations now respect actor's explicit Super Admin assignments (including inactive assigned branches for management), preventing a new branch-only admin from viewing/editing other campuses. Existing bootstrap admin's authorized branches retained. Existing cross-branch operational report scope continues unchanged.

Login page replaces account selector with email/password, show/hide password, keyboard submission/error/busy states, configured academy name/logo, maroon gradient panel and responsive centered card. AuthContext accepts credential object; explicit email login clears prior session/cache first, checks enabled identity/password and active authorized branches, auto-selects sole branch, preserves existing role routing/guards. Programmatic userId login/switchAccount remain mock fixture APIs, not production security. Existing fictional staff without email use deterministic id@tsa.local aliases; existing persisted IDs/assignments/data not migrated.

Profile and topbar menu offer Change Password with current/new/confirmation,10-128 characters, mismatch/current-password validation and busy/status states. Changed password stored as random-salt PBKDF2-SHA256100000-iteration digest in browser-local organization adapter. Once present, initial password is rejected; malformed saved credentials fail closed. Password/role/email editing remains separate so profile contact-email change does not silently alter login identity. Initial bootstrap email/password and shared staff password configured only in ignored Client/.env.local; .env.example lists blank public mock configuration variables, no passwords committed or recorded here. VITE config is client-visible and must never contain production credentials. Test setup generates disposable defaults when ignored config absent.

Application scope: pages/UserManagement/UsersPage.jsx, pages/Auth/LoginPage.jsx, components/Auth/DemoSessionControls.jsx, services/organizationService.js, services/authService.js, contexts/AuthContext.jsx, new mock/mockCredentials.js, Client/.env.example. Tests: new services/staffLogin.test.js; organizationService/authRoutes/AdminOperations/BranchSwitcher/StudentsPage/AdmissionWorkflow/DashboardPage tests and test/setup.js adapted for email UI/strict scope while preserving business assertions. Static route imports in tests avoid cold lazy-transform timing; longer email fixture fields use change events with real submit/search assertions and browser typing coverage. Small supporting fix in SettingsPage.jsx: repaired missing closing parenthesis introduced by a concurrent settings edit; all other settings/payroll changes preserved.

PASS111/111 distinct focused cases across final9-file run plus targeted reruns (duplicate reruns counted once; aggregate artifacts/staff-login-20261020/test-summary.json). Coverage all four roles, current-branch read/write restrictions including branch-only Super Admin, email normalization/uniqueness, admin/staff password login/change, bad/default-old password rejection, no plaintext changed-password storage, malformed credential failure, saved sessions, profile/branch/CRUD/admission/dashboard regressions. Initial failures: updated old-selector fixtures, rejected legacy cross-branch creation fixtures moved to explicit legacy data, invalid login correctly clearing prior session required re-login in fixture, cold import/typing timeouts; fixed and rerun. A concurrent Settings parse error was minimally fixed and Admin UI rerun PASS. Targeted ESLint PASS; final production build PASS with existing large export chunk warning. Scoped diff whitespace check PASS. Full repository suite NOT_RUN.

Isolated Edge PASS desktop1440/mobile390 login/staff/password dialogs, academy branding visually inspected, bootstrap admin email login, create receptionist in current campus, no foreign campus option/foreign staff listing, assigned-role navigation, sole authorized branch locked, My Profile=>Change Password=>logout=>default rejected=>new password login=>reload. Zero page errors. No owner browser records touched; disposable contexts only. Evidence browser.cjs/login screenshots under artifacts/staff-login-20261020. Current branch dev, prior uncommitted/performance and concurrent edits preserved; no worktree/commit/push/reset/stash/clean. Known boundary: this is browser-local mock access; production server authentication/authorization, secure sessions and recovery remain separate work. No current mock-flow blocker. Next approval: owner acceptance.


## PASSWORD-VISIBILITY-SIX-20261020

Owner-approved scoped enhancement; IN_REVIEW. DemoSessionControls.jsx Change Password fields each have independent accessible Show/Hide eye buttons (type=button, pressed state, keyboard focus), retaining input value and disabling while saving. Visibility resets on opening/success. mockCredentials.js and new/confirm field validation/helper text now allow6-128 characters; current password verification and salted digest/old-password rejection unchanged. Updated staffLogin.test.js verifies five rejected, six saved and subsequently authenticated. PASS9/9 focused tests, targeted ESLint and production build (existing chunk warning). Isolated Edge PASS all3 show/hide toggles without value loss,6-character change through profile, old default rejection/new password login/reload, desktop/mobile and no page errors. Browser evidence artifacts/password-visibility-20261020. Full suite NOT_RUN. Existing edits preserved; dev, no commit/push. Next approval owner visual acceptance. This remains browser-local mock authentication.


## USERS-ACCESS-ONLY-DELETE-20261020

CONFIRMED owner changes Users Delete semantics: remove login/role access only; never delete Faculty profile, assignments, classes or linked professional/academic/financial records. IN_REVIEW. organizationService.deleteUser retains identity and metadata and marks accessRevoked=true (created user record or merged seed profile override), preserving credentials, historical branch memberships/profile overrides and all database bytes. Existing self/last-admin/current-branch/every-assigned-branch authorization guards retained. Linked-record deletion check removed from Users action because no professional record is deleted. Actual Faculty deletion workflow is unchanged.

getDemoUsers remains the professional-identity source; revoked teacher profiles/IDs and links resolve as before. findDemoUser and getAuthorizedBranches deny revoked identities; email login/listLoginUsers also exclude them, so saved session reread/reload, programmatic login and email/default/changed-password login cannot restore access. staffOverview hides revoked accounts from Users. Delete confirmation/status explicitly explain access-only removal and preserved records. Historical professional roles remain for Faculty mapping while permissions deny all authorized branches. No blanket migration/restoration of previously deleted identities, no Server/production auth change.

Scope6 source/test files: services/organizationService.js, mock/authFixtures.js, services/authService.js, pages/UserManagement/UsersPage.jsx, organizationService.test.js, staffLogin.test.js. PASS61/61 focused service/auth/organization tests; targeted ESLint PASS; production build PASS (existing export chunk warning). New tests verify linked built-in and created teacher retention, identical Faculty projection/assignment list and unchanged academic database bytes, hidden Users row, blocked email/programmatic login and invalidated saved session on reread. Isolated Edge PASS actual Delete dialog on linked Dr. Irfan account, account removed from Users, Faculty profile URL still opens with unchanged records and login rejects; no page errors, disposable browser only. Evidence artifacts/staff-access-removal-20261020. Full suite NOT_RUN. Existing edits preserved; dev, no commit/push. Next approval owner acceptance. Browser-local mock boundary unchanged.


## AUDIT-LOG-20261020

CONFIRMED owner-authorized branch-specific Super Admin Audit Log. IN_REVIEW until owner acceptance. New /audit-log lazy route, central AUDIT_VIEW=audit.view permission granted only to single-role Super Admin, sidebar navigation and existing DashboardLayout styling. Read service requires canonical session's active branch and permission, filters by exact branch and returns detached newest-first records. Owner/Receptionist/Teacher/direct foreign-branch reads fail closed. No all-branches view or audit edit/delete endpoint/UI added.

AuditLogPage matches existing maroon/white ERP UI and requested reference: date/time (Asia/Karachi h:mm AM/PM), user and role snapshot, module, action, description and importance; readonly details show changed fields and safe before/after values. Search supports user/role labels/action/record; module/importance/All time/Today/last7calendar days/current month/custom-inclusive dates, invalid range state, Clear filters, Refresh and shared10/15/25/50 pagination with filter reset/page clamp. Responsive desktop table and mobile activity cards, keyboard-accessible controls/details. Explicit empty/error/loading states and activation-onward message. Clear never clears history.

Real change capture resides in shared mock persistence boundaries, not pages: mockDatabase.write and writeOrganization append auditLogs to the same atomic storage payload as actual saved mutations. Actor ID/name/effective role snapshot, branch, ISO timestamp, stable tie-break sequence, resource/record ID/name, Created/Updated/Deleted/Access removed, importance and changed fields retained. Covers persisted Admissions/Students/enrollment, Courses/Batches/streams/subjects, Faculty/classes/assignments, Fees/payments, Finance/expenses, Demo Classes, Assets, Payroll records, Users/role/access/profile changes, Branches, Settings and password-change metadata. First-ever mutation logged against unpersisted initial baseline; initial seeds/migrations/read normalization do not fabricate events. Failed validation/persistence and no-op saves do not add events. Existing domain records/IDs/times/calculations unchanged. Shared professional identity/access/password changes are written to affected membership branches; scoped domain records use record branch. Organization-wide settings changes are recorded under the acting branch. No fabricated historical backfill. Read/page-view/login/logout/export activity is outside this saved-change journal.

Privacy: safe field allowlist permits relevant status/name/configuration/amount/schedule and branch-role reference values; other field values are Not displayed. Password digest/salt updates become generic Account Security password-change metadata, never credentials, tokens, photos, private contact values or notes. Old history retained when identity/profile is revoked/deleted. Audit stores are readonly through application flows, but remain browser-local mock storage and are not production/tamper-proof audit infrastructure. No retention/truncation policy invented, no dependency/Server/database migration added.

Source/test scope17 files: new mock/mockAudit.js, services/auditService.js, services/auditService.test.js, utils/auditFilter.js, pages/AuditLog/AuditLogPage.jsx; modified mock/mockOrganization.js, mock/mockDatabase.js, routes/AppRouter.jsx, routes/routeModules.js, routes/routePaths.js, constants/permissions.js/test, components/Layout/Sidebar.jsx, mock/mockDatabase.test.js, services/demoClassService.test.js, services/organizationService.js, services/facultyService.js. Supporting regression fix: Faculty delete now explicitly requests guarded professional profile deletion; default Users delete remains access-only with retained Faculty records, as owner previously required. Existing actual Faculty deletion had delegated to Users API and regression exposed that coupling. Linked-profile safety checks are retained in explicit Faculty delete path. Existing unused payroll viewOps declaration removed to pass touched-file lint; no payroll logic changed.

PASS132/132 focused cases across9 final test files (audit, staff login, academic operations, organization, permissions, database, finance/payments, demo classes and Faculty workflow). Tests cover empty/no fake initialization, first mutation, no-op/failed writes, actor/role/before-after/ordering, protected-value redaction/password metadata, both branch histories/shared teacher access changes, role/foreign-branch denial, Karachi midnight/custom boundaries, existing persistence/version9 compatibility and operational regressions. Existing whole-envelope comparisons retain every domain assertion while allowing new audit metadata and asserting actual audit events. Initial checks exposed envelope allowlist, missing first-save baseline and previous Faculty delete coupling; fixed with targeted regression tests and final complete scoped run PASS. Targeted ESLint PASS; final production build PASS (existing large export chunk warning); scoped diff whitespace check PASS. Full repository suite NOT_RUN.

Isolated Edge1440desktop/390mobile PASS real service mutations from Admin and Receptionist, actual actor roles, journal table, record before/after dialog, search/module/importance/date filters and invalid custom range, pagination/row-size/reset, refresh after mutation, branch switch isolation, all3 non-admin route denials and hidden navigation, no horizontal page overflow/page errors. Desktop viewport and mobile screenshots visually inspected; full-page desktop capture produced browser viewport artifact, viewport capture and geometry checks confirm correct sidebar/content alignment. Browser data only in disposable contexts, no owner browser records changed. Evidence artifacts/audit-log-20261020 (browser.cjs/tests.json/screenshots). TASKS/FEATURE_TICKETS/PROGRESS/MEMORY/FRONTEND_INTEGRATION/SECURITY/DESIGN updated. Branch dev; prior uncommitted/performance/concurrent work preserved; no worktree/commit/push/reset/stash/clean. No active mock-flow blocker. Next approval owner acceptance.


## AUDIT-FILTERS-LEVELS-20261020

Owner authorizes All/Normal/Important/Critical importance filter and corresponding action-based row levels, fixed Academy ERP module list covering every sidebar tab, and Audit Log first in Administration. IN_REVIEW. New constants/audit.js centralizes module list, ordered levels and classification: deletes/access removal/role changes/account or branch deactivation/financial reversal-cancellation Critical; remaining financial/settings/account/branch changes Important; routine changes Normal. Created staff remains Important. New writes persist classification; reads consistently classify historical event metadata without rewriting stored history. Critical rows red, Important amber, Normal green on desktop/mobile. Module filter includes Dashboard/Admissions/Students/Courses & Batches/Faculty & Classes/Fees/Finance/Payroll/Demo Classes/Assets/Reports/Audit Log/Branches/Users/Settings/Account Security even with no events. Empty modules honestly show no matches; no fabricated activity or hotel modules. Sidebar Audit Log moved to first Administration item.

Scope6 source/test files: constants/audit.js/test, mock/mockAudit.js, services/auditService.js, pages/AuditLog/AuditLogPage.jsx, components/Layout/Sidebar.jsx. PASS9/9 focused classification/audit tests; targeted ESLint PASS; build PASS (existing chunk warning). Isolated Edge verifies exact importance option order, real access removal Critical row/red styling, all Academy module options/no hotel labels, empty Dashboard filter, actual course event filtering, Administration first link and390mobile fit; no page errors. Evidence artifacts/audit-filters-20261020. Existing edits preserved, no commit/push. Next approval owner visual acceptance; mock-only boundary unchanged.


## PAYROLL-FLOW-FIX ? 2026-10-21

Owner-authorized payroll analysis and repairs; IN_REVIEW pending owner acceptance. Fixed agreement teacher metadata, advance payment-method contract, shared pagination, month selection, Finance tab navigation and agreement deep-link reopening. Save-success/refresh-failure handling preserves the successful mutation and avoids duplicate retries. Accessible monetary/payment fields retained within existing layouts.

Payroll requires approval before payment; approved snapshots cannot be recalculated or adjusted. Whole positive PKR payments, valid methods and duplicate references within the same payroll line are validated. Each payment creates exactly one linked Finance expense. Advance recovery happens once, including partial payments and zero-cash settlement; other approved periods reserve recoverable balances. Scoped enabled teachers and agreement dates/rates are validated. Per-lecture calculation counts saved dated sessions after their end time; fee percentage joins the teacher's assigned batch enrollments to their challans and verified payments, excluding unrelated batches. Existing formulas and historical records are preserved. Karachi date boundaries used for defaults and payslip payment dates. This remains browser-local mock accounting, not a bank transfer or production backend.

Changed: Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, StaffAdvanceModal.jsx, DisbursePaymentModal.jsx, ManualAdjustmentModal.jsx, PayslipModal.jsx; pages/Finance/FinancePage.jsx; mock/mockDatabase.js payroll operation; services/payrollService.test.js.

PASS: 33 focused tests (payroll service/view/page, audit and financial regressions), targeted ESLint, production build and git diff --check. Build retains existing large export chunk warning. Disposable Edge desktop/mobile verified agreement create/save/reload, >10-row pagination, advance methods, bonus, approval lock, partial/full salary payments, single advance recovery and linked expenses, payslip PDF/print, CSV, month/tab navigation and deep-link save closure; no page errors. Browser scenario: 51,000 salary less 3,000 advance plus 500 bonus = 48,500; paid in two payments. Full repository suite and real backend integration NOT_RUN. Evidence: artifacts/payroll-flow-fix-20261021. Branch dev; unrelated dirty changes preserved; no commit/push. Next required approval: owner acceptance.


## PAYROLL-CORRECTIONS - 2026-10-21 (REVERTED by owner)

Owner explicitly authorizes reasoned unpaid payroll reopening and separate additional bonus after salary payment; IN_REVIEW pending owner acceptance. Super Admin only in active authorized branch (mock service gate plus existing permission checks). Reopen Payroll clears approval and returns lines to draft if no period payments or settled advance recovery exist; saved reason/actor/time and journal preserve correction history. Existing adjustments can then be updated, recalculated and approved. Recalculation retains reopen metadata. Payroll with any salary payment or completed advance recovery cannot reopen, including zero-cash advance settlements.

Additional Bonus creates an approved separate payroll line linked to the original salary, with positive whole PKR amount, mandatory reason and request ID. Allowed only on settled approved periods and original salary lines. Original salary/paid records and expenses stay unchanged. Same request retries return the saved bonus; mismatched reused request IDs reject. Separate bonus has no advance deduction/recovery; newer advances remain untouched. Period payable/outstanding reflect the bonus; teacher count remains unchanged. Existing Pay supports partial/full bonus disbursement, one linked Finance expense per payment, and separate payslip/print/PDF. Payment is recorded locally; no bank transfer or backend implementation introduced.

UI: Reopen Payroll appears for approved unsettled periods; Additional Bonus appears on original teacher rows after settlement. Reason/amount dialog validates, disables busy submissions and preserves input on errors. Reopen and Additional bonus created audit actions record reason with actor/branch/time. Existing safe audit fields extended only for explicit correction metadata.

Files: services/payrollService.js and test; mock/mockDatabase.js and mockAudit.js; components/Finance/TeacherPayrollView.jsx and new PayrollCorrectionModal.jsx. PASS: 36 focused payroll service/view/page, audit and financial tests; targeted ESLint; production build; scoped git diff --check. Build retains existing large export chunk warning. Disposable Edge verifies reopen -> adjustment -> reapproval, partial original payment -> separate bonus -> Pay -> separate payslip -> reload, mobile dialog fit, audit actions and exactly one expense per linked payment. Browser evidence artifacts/payroll-flow-fix-20261021/corrections.cjs. Full repository suite/real backend integration NOT_RUN. Branch dev, unrelated dirty edits preserved, no commit/push. Next approval: owner acceptance.


## PAYROLL-CORRECTIONS-UNDO - 2026-10-21

Owner explicitly reverses PAYROLL-CORRECTIONS. Removed Reopen Payroll/Additional Bonus UI, modal, service operations, correction-specific audit extensions and three corresponding tests; prior approved payroll lock/payment workflow restored. Existing styling and unrelated edits preserved. No stored financial records or existing audit history deleted or migrated. Previous correction documentation marked REVERTED as historical evidence. PASS targeted ESLint, 33 focused payroll/audit/financial tests and scoped git diff --check. Build/browser NOT_RUN for undo. No commit/push. IN_REVIEW pending owner acceptance.

## F12-BRANCH-ADMIN-ROLE - 2026-10-21

CONFIRMED by the project owner: `Admin` is a fifth role. It has the same implemented module/tab permissions as Super Admin only within its explicitly assigned branch and gains no implicit access to any other branch. In Users, Admin may create Owner, Receptionist and Teacher accounts only; Admin and Super Admin roles remain assignable only by Super Admin. This is currently frontend mock authorization and must later be enforced by the backend.

## F13-BRANCH-THEME-DARK-MODE - 2026-10-21

CONFIRMED by the project owner: Super Admin or Admin theme changes apply to every role in the active assigned branch and must not affect other branches. Global primary color controls the full system accent, while sidebar background/text/icon/active colors remain independently configurable. Dark mode must provide a complete professional dark presentation with readable topbar, text, cards, tabs, tables, menus, forms and dialogs.

## F13-BRANCH-NOTIFICATIONS - 2026-10-21

CONFIRMED by the project owner: notifications are branch-specific and Owner is excluded. Receptionist admissions/student additions and challans notify Admin/Super Admin in that branch. Equivalent Admin/Super Admin actions notify Receptionists. Admin/Super Admin class assignment notifies the assigned Teacher only. Current delivery is browser-local mock persistence; production delivery and authorization require a backend ticket.

## F02-ADMISSION-PRICING-DISPLAY - 2026-10-21

CONFIRMED by the project owner: Admission subject cards must hide subject-level prices when the selected course pricing model is `One course fee`, and show individual subject prices when it is `Sum selected subject fees`. This is a presentation rule; existing configured-fee calculations remain unchanged.

## DATA-LEGACY-FACULTY-LINK-REPAIR - 2026-10-21

CONFIRMED by the project owner through the reported failure: deleting staff access must not destroy or invalidate retained faculty profiles, assignments or academic history. Legacy built-in teacher deletions are interpreted as access revocation. A legacy deletion tombstone may preserve reads for an already-removed created teacher's assignments, but arbitrary missing teacher references remain invalid. This is frontend mock compatibility behavior; backend identity lifecycle and referential integrity require explicit enforcement during backend integration.

## DATA-LOAD-RECOVERY - 2026-10-21

Historical record integrity must be independent of a teacher's current account enabled status or role. A confirmed existing identity continues to resolve old faculty assignments after deactivation or role changes; creating/updating assignments still requires an enabled Teacher in the active branch. This fixes the owner's reported cross-module load failure without re-enabling any account or clearing stored data. Actual browser snapshot replay confirmed a disabled teacher was the remaining blocker after the earlier legacy-deletion repair.

## PAYROLL-HEADER-CONTROLS-REMOVE - 2026-10-22

CONFIRMED: remove only Month Selector, Recalculate and Staff Advance from Finance > Teacher Payroll header. Preserve the Payroll tab/module, calculations, agreements, batch details, payments, balances, payslips, reports and saved history; do not change Finance Overview. The previous manual month-selector UI requirement is superseded by this explicit removal. The service layer and historical records remain intact.

## PAYROLL-TWO-METHODS - 2026-10-22

CONFIRMED by the owner's attached two-method payroll request: new salary agreements are assignment/batch-specific and support Fixed Monthly or Percentage only. Percentage uses eligible distinct active subject enrollment times the saved listed subject/course fee times agreed percentage, independently of cash receipts or student discounts. Full-course fee use requires separate explicit authorization for each assignment. Missing participation mapping or required fee must be flagged. No assignment means no eligible salary. New active payroll excludes bonuses, allowances, deductions/tax and advance recovery; legacy financial history must survive unchanged. Monthly effective versions and frozen approved salary/payment snapshots govern future method changes. Earlier four-method/new-advance workflows and teacher-account-based eligibility are SUPERSEDED for new payroll. The prior header control removal remains in effect; content-level salary-period navigation fulfills this newer request's selected-month and history workflow. Full monthly salaries use first-day-effective agreements without guessed mid-month proration; PKR amounts round to two decimals. A known explicitly configured zero listed fee yields zero percentage salary; missing fee is never inferred as zero.

## PAYROLL-RUNNING-BALANCE - 2026-10-22

CONFIRMED by the owner's latest request and clarification: retain only one running salary balance per assignment, without automatic monthly renewals, Add Salary cycles or approval. Partial/full salary payments may be recorded on their actual dates, and unpaid balance persists indefinitely. Explicit agreement saves adjust the same total payable while preserving all recorded payments and salary revisions; total payable cannot fall below already-paid money. Percentage fees/enrollment calculations occur on explicit salary save rather than time/navigation. Prior PAYROLL-TWO-METHODS monthly effective dates, draft recalculation and approval/locking policies are SUPERSEDED for active payroll; original historical sources remain preserved. No automatic Payroll idle/focus/storage refresh. Finance Overview keeps its existing behavior.
## FACULTY-SYNTHETIC-ASSIGNMENT-CLEANUP - 2026-10-22

CONFIRMED: Faculty schedules, course/batch labels and student counts must be derived from saved branch data. Curated fallback class allocations and fictional student totals are rejected. Unassigned built-in faculty may be removed from the Faculty directory when no real assignment, dated class or asset link protects the profile; demo-class seed references alone are not a deletion blocker. Historical identity tombstones may remain for record resolution without making the removed profile visible.
## ROLE-MATRIX-UPDATE - 2026-10-22

CONFIRMED by final owner attachment: Admin full existing module access including Settings within authorized branches; no higher-role escalation or license bypass. Receptionist can approve/enroll supported admissions without independent expense/payroll/fee-management rights, edit existing classes without creating/deleting assignments, manage asset details and read operational reports. Owner may read assets and branch reports. Audit Log/Branches/Users/Settings remain Admin/Super Admin only. Teacher owns-only data access is conditional on implemented self-service: existing disabled modules remain denied. Do not restore historical monthly approval or four-method salary logic from the reference illustration. Branch comparison must authorize each included branch independently.
# 2026-10-22 — Strict module visibility follows effective permission

**CONFIRMED:** Module discovery surfaces use effective permissions for the selected branch. `No Access` modules are absent from desktop/mobile navigation and Ctrl+K, not rendered as disabled placeholders. Direct routes and domain operations remain independently guarded. Teacher own-record modules are not enabled through broad branch permissions; their scoped screens/queries require a separate approved implementation.

## PAYROLL-REPORTS-CACHE-20261022 - approved integration

Owner attachment 51d487e7 confirms organization-wide payroll reports for Admin/Super Admin and authorized Owner only. The existing running-balance decision supersedes the attachment's illustrative approval/monthly flow: reports never create monthly charges or restore approval. No historical timeline is fabricated; current salary balances are shown as Running balance unless a persisted period exists. Reuse localPageResources for derived reads and initialization; never preload restricted records for performance. Frontend mock remains browser-local with no multi-device synchronization claim.
## 2026-10-22 — CONFIRMED: authoritative five-role dashboard data

The owner confirmed that all role dashboards must derive from the same saved frontend data source. Role-specific presentation may differ, but separate fake datasets, hardcoded KPI values and organization-wide Teacher/Receptionist financial exposure are rejected. Teacher dashboard data is limited to the current teacher's saved faculty assignments and matching enrolled students, with own salary only. Frontend localStorage remains a same-browser mock boundary; shared-backend and cross-device synchronization remain deferred.

## 2026-10-22 — CONFIRMED: shared premium responsive presentation

The owner confirmed that Super Admin remains the visual reference for Admin, Receptionist, Owner and Teacher. Responsive presentation may adapt grids, spacing and overflow containment, but must preserve authorized role data, permissions, workflows and the existing Super Admin design. No new UI dependency is required.

## 2026-10-22 — CONFIRMED: Teacher profile and dashboard cleanup

Teacher My Profile does not show Back to Dashboard, WhatsApp or Call actions, and Teacher Dashboard does not show Instructor Actions cards. Teacher profile workload KPIs must come from the same branch/account-scoped saved projection as the Teacher Dashboard; denied broad Faculty/Students queries must not be converted into misleading zero workload values.

## 2026-10-23 — CONFIRMED: final frontend QA and normal dev publication

The owner authorizes all existing uncommitted frontend changes to undergo final lint/test/build/browser review and be included in one reviewed normal `dev` commit/push only if critical checks pass and the fetched remote has no unexpected commits. This supersedes the earlier no-commit/push restriction for this release. Local data, artifacts and unrelated empty documentation placeholders remain preserved; backend and deployment are excluded.
