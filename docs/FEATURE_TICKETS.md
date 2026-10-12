<!-- Feature Ticket List — har module ke detailed development tickets, acceptance criteria aur tests -->

# Academy Management ERP — Feature Ticket Register

**Document:** FEATURE_TICKETS.md
**Version:** 1.0
**Status:** DRAFT — Pending Review and Ticket Approval
**Updated:** 2026-10-10
**Project:** Academy Management ERP
**Development Strategy:** Frontend First
**Delivery Approach:** Incremental, Ticket-Based Development

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


## F01-001 Delivery Review (2026-10-10)

F00-002A/F00-003/F00-004 through F00-010 owner-accepted DONE for implemented mock scope; F00-001 already accepted. Parent F00-002 covered by child work; later module routing deferred. Historical pending records below are superseded, not erased. CI/deployment/backend security/formal accessibility remain unverified.

F01-001 through F01-007 DONE: Explicitly accepted by owner for their delivered DEMO dashboard presentation scope only. This does not imply real finance, real teacher assignments, or production security are approved. Dashboard uses existing workspace.view guard; no new permissions/statistics/actions/dependencies outside of UI libraries (recharts, motion).

[Exact files, screenshots, libraries and evidence](PROGRESS.md#f01-007--dashboard-visual-polish--acceptance-2026-10-10). Next planned F02 Admissions needs detailed scope.

---

## Foundation Owner Acceptance and F01-001 Authorization (2026-10-09)

**Owner decision: CONFIRMED.** Owner explicitly accepted F00-002A/F00-003 and F00-004 through F00-010 for their implemented, reported-and-tested mock scopes. F00-001 remains accepted. These scoped deliveries are DONE. Parent F00-002 is covered by accepted child routing/layout/auth/permission work; temporary module routing remains deferred. No duplicate implementation is required. Earlier acceptance-pending snapshots are preserved as history.

This acceptance does not verify actual CI, production deployment/SPA fallback, backend security/runtime, real authentication or formal accessibility certification. It does not approve broad business permissions, multi-role policies, All Branches or ERP modules.

**Current authorization:** F01-001 only - shared Dashboard Page Skeleton with heading, active branch, responsive placeholders and existing shell. Dashboard uses existing workspace.view guard; no new permissions/statistics/actions/dependencies. No following ticket authorized.

---

## F00-010 Current Foundation Review (2026-10-09)

**Status:** IN_REVIEW - owner-authorized verification delivered; foundation acceptance/F01 authorization pending. F00-001 explicitly accepted DONE. Historical DONE delivery labels for F00-002A/F00-003 are retained without fabricating separate acceptance evidence; F00-004 through F00-009 remain IN_REVIEW. [Every ticket's implementation, dependencies and acceptance](PROGRESS.md#f00-010--foundation-verification-delivery-2026-10-09).

Parent F00-002 routing is covered by F00-002A basic routes, F00-003 shell, F00-005 auth/select-branch/workspace/unauthorized routes/guard and F00-007 permission handling. No duplicate ticket implementation; temporary module routes are deferred until their own approved scope. Current baseline does not approve the historical broad permission matrix.

Current PASS: 113 tests/9 files, lint, build, scoped local Edge four-width responsive/routing/refresh/logout/keyboard/AX/reduced-motion/storage-recovery checks. One reproduced batched-branding defect fixed with a regression. Actual CI/deployment/backend/production fallback and full accessibility audits NOT_RUN. No new dependencies, ERP modules or permissions. F01-001 is the first planned Dashboard skeleton; separate route/access scope approval and applicable multi-role/data policies are required before coding.

---

## F00-009 Approved Delivery Snapshot (2026-10-09)

**F00-009:** IN_REVIEW - scoped owner authorization implemented; acceptance pending. F00-004/F00-008 code and recorded verification confirmed before implementation; pending acceptance is not upgraded to DONE. Earlier authorization/backlog snapshots are retained as history.

Approved scope: Academy Management System default name, graduation-cap fallback, existing teal, shared Academy/Theme contexts, isolated minimal persistence, validated name/safe local raster logo/accessible HEX primary, safe invalid/corrupt storage and shell integration. No Settings editor, ERP screen, new dependency or new permission. Existing root/routes/auth/branch behavior and explanatory comments preserved.

PASS: 112 tests in 9 files including all 83 prior regressions; lint/build; local Edge responsive checks at 360/768/1024/1440px, custom branding reload/fallback, branch keyboard/focus and logout/routes. Actual CI, backend runtime, production fallback and screen-reader testing NOT_RUN. [Delivery details and limitations](PROGRESS.md#f00-009--academy-branding-delivery-2026-10-09). Stop; next planned F00-010 remains separately approval-gated.

---

## F00-001 Acceptance / F00-008 Approved Delivery (2026-10-09)

Owner explicitly accepted F00-001: DONE, recovered evidence/current checks verified; backend runtime and actual CI remain NOT_RUN. Dependency satisfied; prior pending-acceptance records are dated history.

F00-008 IN_REVIEW: only native versioned storage, two fictional student/course seeds each, provisional id/branchId/name schema, async list/getById/create/update, branch query validation, explicit non-destructive errors and test-only deterministic failures. No full ERP schemas/UI, reset, delete operation, new permissions/dependencies or backend. [Delivery evidence](PROGRESS.md#f00-008--mock-data-service-delivery-2026-10-09).

---

## F00-001 — Recovered Audit Evidence (2026-10-09)

**Status:** IN_REVIEW — audit execution verified; owner acceptance pending.

Recovered original report and tool outputs from the local Codex session; fresh repository inspection and existing checks confirm the current state. [Evidence and limitations](PROGRESS.md#f00-001--recovered-audit-and-current-reconciliation-2026-10-09). Prior BACKLOG snapshots are history, not current audit execution status.

F00-008 still depends on F00-001. Missing evidence is now resolved; formal owner acceptance remains pending. The latest owner proposal limits F00-008 to separate versioned mock storage, minimal fictional students/courses, async list/getById/create/update, validation/branch queries, explicit errors and test-only failures. Broader historical service/seed inventory is not blanket implementation approval. No F00-008 implementation started during this reconciliation.

---

## F00-007 — Approved Minimal Foundation Boundary (2026-10-09)

**Status:** IN_REVIEW — approved limited implementation/checks delivered; owner acceptance pending.

Owner authorizes central definitions, reusable hooks/helpers, branch role awareness, deny-by-default and accessible unauthorized UI. Current baseline stays only `workspace.view`; no new matrix/role-combination policy is required or inferred. Latest scope supersedes the historical ticket's matrix blocker only for these independent foundations. Broader catalog, ERP navigation filtering, RoleRoute, multi-role grant evaluation, sensitive capabilities and Super Admin bypass remain deferred pending explicit security-policy approval.

Delivered: informational getBranchRoles/hasRole, malformed/duplicate assignment rejection, loading-aware can(), PermissionGate and PermissionNotice. Reuses auth, switching, guards and persistence. [Verification evidence](PROGRESS.md#f00-007--roles-and-permissions-foundation-evidence-2026-10-09).

---

## F00-006 — Approved Delivery Boundary (2026-10-09)

**Status:** IN_REVIEW — implementation and scoped verification; owner acceptance pending.

Latest owner instruction supersedes historical All Branches scope below: only concrete authorized branch switching is delivered. Reuses F00-005 AuthContext/BranchContext, canonical fixtures, centralized versioned persistence, role arrays and protected scopeKey. Adds accessible topbar switching and failed-selection session revalidation. Single-branch/initial-selection functionality is reused, not duplicated. No new permission grants, dependencies, backend or ERP modules.

Acceptance evidence: [F00-006 progress](PROGRESS.md#f00-006--branch-switcher-evidence-2026-10-09). All Branches, future query-cache integrations and F00-007 policy/navigation work remain separately approved future work. Historical BACKLOG/planning snapshots below are retained as history.

---

## F00-005 — Approved Minimal Access Delivery (2026-10-09)

**Approved title:** Mock Auth & Minimal Access Foundation.
**Status:** IN_REVIEW — implemented; scoped checks passed; owner acceptance pending.
**Foundation dependencies:** Delivered F00-002A basic routes and F00-003/F00-004 responsive shell/design system.

The owner explicitly approved mock login/logout/restoration, minimum AuthContext/BranchContext/branch-role data, initial single/multi-branch selection, four foundation URLs and only `workspace.view`. Earlier combined-scope proposals are superseded; full branch switching and general role/permission features remain F00-006/F00-007.

Approved test tooling is configured: Vitest/RTL/DOM/user-event/jest-dom/jsdom. Final suite 34 tests/3 files PASS on Node 24.16.0 and exact CI Node 22.22.2; lint/build/browser responsive/routing checks PASS. [Evidence, files and limitations](PROGRESS.md#f00-005--completed-implementation-evidence-2026-10-09). No next ticket authorized.

---

## F00-005 — Requested Combined Scope Review (2026-10-09)

**Requested title:** Mock Authentication & Branch Context.
**Status:** BLOCKED — reconciliation approval pending before affected coding.

Owner instruction: if the documented F00-005 scope/dependencies differ, report the conflict and obtain approval before affected coding. The auth-only F00-005 below differs from the request's branch and role scope, allocated to F00-006/F00-007. Its dependency on broader F00-002 also needs reconciliation with delivered F00-002A. SECURITY's permission matrix and multi-role combining remain unapproved.

[Concrete proposed scope, demo baseline, routes and dependency approval](TASKS.md#f00-005--scope-reconciliation-2026-10-09). [Actual compatibility findings and proposed tests](PROGRESS.md#f00-005--pre-implementation-findings-2026-10-09).

No auth/branch code implemented, no test tools installed and no F00-006/F00-007 completion claimed. The original draft ticket specifications below remain unchanged until the proposed reconciliation is approved. Existing draft-only statements are historical; the explicit request authorizes inspection and reconciliation but requires this approval gate for conflicting implementation.

---

## F00-004 — Approved Delivery Snapshot (2026-10-09)

**Approved title:** Premium Responsive Design System.
**Status:** IN_REVIEW — implemented and scoped checks passed; owner acceptance pending.

The explicit F00-004 approval supersedes the earlier proposed-only token boundary. Scope includes verified reference theme, Plus Jakarta Sans, 256px sidebar, 64px topbar, 12px cards and only Button/Card/Input/Badge/Dialog. Existing routing/Lucide/sidebar behavior is preserved; responsive defects from the reference are not reproduced.

[Dependency versions, changed files and executed checks](PROGRESS.md#f00-004--verification-evidence-2026-10-09); [approved token record](DESIGN.md#f00-004--approved-design-system-2026-10-09). Lint/build, four viewports, keyboard/ARIA, scoped contrast, reduced-motion and routing checks PASS. Maintained suites NOT_CONFIGURED; screen-reader audit and production-host fallback NOT_RUN. No next coding ticket authorized. Older snapshots below remain history.

---

## DOC-SYNC-001 — Approved Delivery Snapshot (2026-10-09)

**Documentation task:** DONE. Explicit owner instructions authorized F00-002A and F00-003 despite the older blanket draft-only gate. No next coding ticket is authorized.

| Ticket | Current delivery status | Boundary |
|---|---|---|
| F00-002A | DONE — Basic Routing | Root Hi, central paths, accessible 404, history navigation; no auth/guards/modules |
| F00-003 | DONE — approved Premium Application Layout scope | Presentational shell, placeholder labels, provisional neutral theme; no ERP features |
| F00-002 | BACKLOG — remaining broader scope | Basic subset delivered as F00-002A; authentication/guards/Unauthorized/module routes excluded |
| F00-004 and later tickets | BACKLOG | Neutral shell tokens do not complete full design-token/branding work |

Libraries installed in prior tickets: react-router-dom 7.18.4 (AppRouter, NotFoundPage), lucide-react 1.54.0 (Sidebar, Header). Reported lint/build and scoped Edge routing/layout/keyboard/reduced-motion checks PASS; maintained suites NOT_CONFIGURED; production fallback NOT_RUN. [Full evidence and files](PROGRESS.md#doc-sync-001--delivery-evidence-2026-10-09).

Older draft goals/criteria are retained for history. Narrower owner-approved scopes govern the two completed deliveries. [Reference differences are proposed only](DESIGN.md#doc-sync-001--lovable-reference-review-2026-10-09); exact design alignment and permission-aware navigation are not claimed delivered.

---

## 1. Purpose

This document defines the development ticket register for the Academy Management ERP.

Its objective is to divide the complete application into small, focused, testable development tasks suitable for Codex, Antigravity and human software developers.

Each ticket must have a clear scope, expected behavior, dependencies, quality criteria and verification process.

The ticket system must improve:

- Maintainability
- Reliability
- Scalability
- Stability
- Security
- Testability
- Code consistency
- Development traceability
- Change control
- Team collaboration

This document is a development plan, not authorization to implement every listed feature.

## 2. Project Context

### CONFIRMED

The application is initially developed for one academy organization with multiple branches.

Technology:

- React + Vite frontend in `Client/`.
- Node.js + Express backend in `Server/`.
- MongoDB + Mongoose for future real persistence.
- Private GitHub repository.
- Codex and Antigravity as AI-assisted development tools.

Roles:

- Super Admin
- Owner
- Receptionist
- Teacher

A user may have multiple branch assignments and one or multiple roles in each branch.

Development is frontend-first.

Mock services and browser storage will initially simulate application behavior.

The backend will later implement real authentication, authorization and persistence.

### DEFERRED

- Multi-client SaaS management.
- Subscription and license infrastructure.
- Electron desktop software.
- Native mobile applications.

### Important

Client approval of the general system proposal does not automatically confirm every permission, fee rule, database field or detailed business workflow.

Unresolved specifications must remain TBD.

---

## 3. Ticket Status Definitions

| Status | Meaning |
|---|---|
| BACKLOG | Identified but not yet approved |
| READY | Requirements clarified, dependencies satisfied and ticket approved |
| IN_PROGRESS | Currently under development |
| BLOCKED | Cannot proceed because of a known dependency or decision |
| IN_REVIEW | Implementation complete, awaiting review |
| DONE | Acceptance criteria and required checks verified |
| DEFERRED | Intentionally moved outside current scope |

A ticket must never be marked DONE merely because source files were generated.

### Decision Labels

- CONFIRMED — Explicitly approved or provided.
- PROPOSED — Engineering recommendation awaiting approval.
- TBD — Missing or unresolved decision.
- DEFERRED — Outside current phase.

---

## 4. Priority Definitions

| Priority | Meaning |
|---|---|
| P0 | Required foundation or essential user workflow |
| P1 | Important planned functionality |
| P2 | Enhancement or lower-priority functionality |

Priority does not grant permission to begin implementation.

A P0 ticket may still be BLOCKED.

### Ticket Size

- XS — Small, isolated task.
- S — Focused implementation.
- M — Moderate feature with several related changes.
- L — Large feature requiring decomposition.

Prefer XS, S and M tickets.

Split L tickets before implementation.

---

## 5. Mandatory Ticket Template

Every executable ticket must contain:

### Ticket Identification

- Ticket ID
- Feature title
- Phase
- Module
- Priority
- Estimated size
- Status
- Approved by

### Functional Scope

- Goal
- Description
- In-scope behavior
- Out-of-scope behavior
- Dependencies
- Relevant approved documents
- Expected files/modules to modify

### Technical Expectations

- UI requirements
- Data/service behavior
- Role and branch behavior
- Validation requirements
- Loading state
- Empty state
- Success state
- Error state
- Permission-denied state
- Relevant edge cases

### Verification

- Observable acceptance criteria
- Tests required
- Definition of Done
- Remaining known risks

Tickets must reference approved specifications instead of independently inventing conflicting business rules.

---

## 6. Global Development Rules

All ticket implementations must follow these rules:

1. Read root `AGENTS.md` before coding.
2. Read relevant approved documentation.
3. Inspect existing project files.
4. Work on one approved ticket at a time.
5. List expected file modifications before coding.
6. Preserve existing working features.
7. Never silently invent missing requirements.
8. Reuse approved shared components.
9. Do not introduce unnecessary dependencies.
10. Do not modify unrelated modules.
11. Keep presentation logic separate from data access.
12. Use approved mock service contracts during frontend development.
13. Follow role and branch UI behavior.
14. Never claim frontend-only permissions provide real security.
15. Implement validation and meaningful feedback.
16. Run applicable tests, lint and build checks.
17. Document actual test results.
18. Update `TASKS.md` and `PROGRESS.md` after verified work.
19. Stop before starting an unapproved ticket.
20. Request clarification when specifications conflict.

### Development Isolation

Codex and Antigravity must not simultaneously modify the same files.

Use separate Git branches or sequential editing when appropriate.

Review changes before merging.

---

# 7. Frontend Phase Register

| Phase | Module | Status | Priority |
|---|---|---|---|
| F00 | Foundation | IN_PROGRESS | P0 |
| F01 | Dashboard | BACKLOG | P0 |
| F02 | Admissions | BACKLOG | P0 |
| F03 | Students | BACKLOG | P0 |
| F04 | Courses & Batches | BACKLOG | P0 |
| F05 | Faculty & Classes | BACKLOG | P1 |
| F06 | Fees | BACKLOG | P0 |
| F07 | Finance | BACKLOG | P0 |
| F08 | Demo Classes | BACKLOG | P1 |
| F09 | Assets | BACKLOG | P1 |
| F10 | Reports | BACKLOG | P1 |
| F11 | Branch Management | BACKLOG | P0 |
| F12 | User Management | BACKLOG | P0 |
| F13 | Settings & Integrated QA | BACKLOG | P0 |

The priority classifications are PROPOSED.

Although F11 and F12 occur later in the screen-building sequence, basic mock branch and role infrastructure is required during F00.

---

# 8. Phase F00 — Frontend Foundation

## F00-001 — Existing Project Audit

**Priority:** P0
**Size:** S
**Status:** DONE — explicitly owner-accepted after evidence recovery/current verification; runtime/CI limitations retained

### Goal

Understand and safely preserve the existing React frontend before modifying its architecture.

### Scope

- Inspect `Client/` directory.
- Inspect existing routes and entry points.
- Inspect package dependencies.
- Identify current CSS/UI framework.
- Review existing folder structure.
- Identify working functionality.
- Record potential conflicts with approved architecture.

### Expected Files

- Existing frontend files: read-only unless explicitly approved.
- `docs/PROGRESS.md`: record verified findings.
- `docs/TASKS.md`: update the current work status.

### Acceptance Criteria

- Existing frontend structure is documented.
- Existing dependencies are identified.
- No working code is deleted or overwritten.
- Any structural conflicts are reported.
- Baseline build and lint results are recorded.

### Tests

- Run existing build command.
- Run existing lint command if configured.
- Record pre-existing errors.

### Definition of Done

The baseline project state is understood and documented.

---

## F00-002A — Basic Routing (Approved Sub-ticket)

**Status:** DONE — approved basic scope delivered.
**Authorization:** Explicit owner F00-002A instructions; limited subset of F00-002.

Scope: install React Router with package/lock synchronization; preserve `/` displaying Hi; centralize root/wildcard paths; accessible Not Found/Return home; client navigation and Back/Forward; nested refresh where configured; preserve all explanatory comments. Excludes authentication, layouts, role guards, branch logic and module routes.

Acceptance evidence: prior lint/build, root/deep-404/Return-home/history, local preview refresh and Not Found keyboard checks PASS. Maintained suites NOT_CONFIGURED; deployed fallback NOT_RUN. react-router-dom 7.18.4 is consumed by AppRouter and NotFoundPage. [Affected files and detailed results](PROGRESS.md#doc-sync-001--delivery-evidence-2026-10-09).

---

## F00-002 — Routing Foundation

**Scope reconciliation:** Delivered basic subset F00-002A; existing shell F00-003; auth/select-branch/workspace/unauthorized routes and ProtectedRoute F00-005; permission boundary F00-007. These existing implementations satisfy current approved routing coverage and must not be duplicated. Temporary module routes in the original draft remain deferred to approved module tickets. No new routes or permissions are authorized here.

**Priority:** P0
**Size:** S
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-001

### Goal

Establish consistent frontend routing using the approved router.

### Scope

- Central route configuration.
- Route path constants.
- Main authenticated layout routing.
- Authentication screen routing.
- Not Found page.
- Unauthorized page.
- Temporary module routes where needed.

### Expected Files

- `Client/src/routes/AppRouter.jsx`
- `Client/src/routes/routePaths.js`
- `Client/src/routes/ProtectedRoute.jsx`
- `Client/src/pages/Errors/`
- Existing App entry points as required.

### Acceptance Criteria

- Application starts without routing errors.
- Known routes load the correct page.
- Unknown routes show Not Found.
- Demo route guards work as designed.
- Navigation does not unintentionally reload the application.

### Edge Cases

- Invalid URLs.
- Refreshing a nested route.
- Missing mock session.
- Unauthorized route entry.

### Tests

- Route rendering.
- Refresh behavior.
- Invalid-route behavior.
- Production build.

### Definition of Done

Routing behaves consistently and existing working behavior is preserved.

---

## F00-003 — Shared Dashboard Layout

**Priority:** P0
**Size:** M
**Status:** DONE — approved Premium Application Layout scope
**Dependencies:** F00-002A (delivered basic routing)

### Approved Delivered Scope

Owner-approved presentational Sidebar, Header, PageHeader and DashboardLayout; existing Tailwind; centralized neutral CSS tokens; lucide-react 1.54.0; desktop collapse/mobile drawer; keyboard access and reduced motion. Root Hi and standalone Not Found preserved. Disabled placeholder module labels only; no auth, permissions, branch logic or dashboard implementation.

Lucide is imported by Sidebar and Header. [Files and prior verification](PROGRESS.md#doc-sync-001--delivery-evidence-2026-10-09): lint/build, sidebar interaction, responsive viewports, keyboard/focus, reduced motion and root/404/history regressions PASS. Maintained suites NOT_CONFIGURED; deployed fallback NOT_RUN.

Neutral styling was explicitly provisional when reference access failed during implementation. DOC-SYNC-001 accessed it later; [differences remain proposed](DESIGN.md#doc-sync-001--lovable-reference-review-2026-10-09). Exact reference alignment and working permission-aware module navigation are not claimed complete.

### Historical Draft Specification

Previous status: BACKLOG; previous dependency: broader F00-002. The original goals/criteria below are preserved as future context. The narrower approved scope above supersedes their navigation/reference-alignment requirements for this delivery.

### Goal

Implement a reusable ERP application shell.

### Scope

- Sidebar.
- Main header.
- Page content container.
- Navigation active states.
- Responsive sidebar behavior.
- Shared page heading area.

### Expected Files

- `Client/src/layouts/DashboardLayout.jsx`
- `Client/src/components/Layout/Sidebar.jsx`
- `Client/src/components/Layout/Header.jsx`
- `Client/src/components/Layout/PageHeader.jsx`
- Related layout components as needed.

### Acceptance Criteria

- Layout follows the approved design reference.
- Sidebar navigation works.
- Active navigation is visually distinguishable.
- Main content remains readable.
- Layout works at approved viewport sizes.
- Keyboard navigation works.
- No unrelated module is modified.

### Tests

- Layout rendering.
- Navigation interaction.
- Responsive viewport checks.
- Accessibility-focused checks.
- Production build.

### Definition of Done

All future ERP pages can use the same shared layout.

---

## F00-004 — Premium Responsive Design System

**Priority:** P0
**Size:** S
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** Existing F00-002A routing, F00-003 shell and verified Lovable review

The owner approved the extended scope described in the latest snapshot above. Original Central Design Tokens planning below is retained as history; previous status BACKLOG, dependency F00-001. Prototype values needed by this ticket have now been verified. Whole F00 and future module work remain incomplete.

### Goal

Establish the shared visual design foundation.

### Scope

- Central color tokens.
- Typography system.
- Spacing rules.
- Border radius.
- Surface styles.
- Button and input visual standards.
- Theme customization foundation.

### Expected Files

- `Client/src/styles/globals.css`
- `Client/src/styles/theme.css`
- Existing theme configuration files, if present.

### Acceptance Criteria

- Shared tokens are defined centrally.
- Styling follows verified reference details.
- No new arbitrary visual theme is introduced.
- Basic text/background combinations remain readable.
- Existing styles are not broken.

### Tests

- Visual inspection.
- Light-theme contrast checks.
- Build verification.

### Blockers

Exact prototype-derived design values remain TBD until verified.

### Definition of Done

Subsequent modules can reuse shared styling without independently choosing design values.

---

## F00-005 — Mock Auth & Minimal Access Foundation

**Priority:** P0
**Size:** S
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-002A, F00-003, F00-004

Approved current scope and evidence appear in the latest delivery snapshot above. Original auth-only draft below is preserved as history; its former dependency was broader F00-002 and status BACKLOG. Minimum branch/role data and test tooling are now included; full F00-006/F00-007 features are excluded.

### Goal

Simulate logged-in user behavior for frontend-only development.

### Scope

- Demo user identity.
- Mock login/logout state.
- Role information.
- Account selection during development.
- Redirect behavior.

### Expected Files

- `Client/src/contexts/AuthContext.jsx`
- `Client/src/hooks/useAuth.js`
- `Client/src/mock/mockAuth.js`
- `Client/src/services/authService.js`

### Acceptance Criteria

- Demo user can be selected or logged in through the approved mock flow.
- Mock session state is exposed consistently.
- Logout clears mock session state.
- Invalid mock state is handled.
- No real credentials are stored.

### Tests

- Mock login.
- Mock logout.
- Session state changes.
- Protected-route UX behavior.

### Security Note

Mock authentication is not production authentication.

### Definition of Done

Frontend components can consistently obtain the current demo user.

---

## F00-006 — Branch Context and Switcher

**Priority:** P0
**Size:** M
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-005

### Goal

Support active branch selection in the frontend.

### Remaining Approved-Planning Boundary

- Reuse F00-005 AuthContext/BranchContext, validated assignments, initial selection and scopeKey; do not reimplement them.
- Delivered under current F00-006 approval: accessible in-session concrete-branch switcher in the existing topbar; see latest evidence above.
- Extend invalidation into future branch-scoped data/query consumers; retain regression checks for already delivered single/multi-branch selection.
- All Branches requires an explicit capability/demo policy before implementation; no grant inferred from Super Admin.

### Historical Original Scope

The original draft below included foundations now delivered by F00-005. Those items are reuse/regression requirements rather than duplicate implementation tasks.

### Scope

- Active branch context.
- Branch list from approved demo records.
- Branch switcher component.
- Automatic selection for single-branch users.
- Multiple assigned branch selection.
- Authorized All Branches mode where applicable.

### Expected Files

- `Client/src/contexts/BranchContext.jsx`
- `Client/src/hooks/useBranch.js`
- `Client/src/components/Layout/BranchSwitcher.jsx`
- Relevant mock services.

### Acceptance Criteria

- Single-branch users enter their assigned branch automatically.
- Multi-branch users can select permitted branches.
- Switching branches updates active branch context.
- An unassigned branch cannot be selected through normal UI controls.
- Invalid stored branch selections fall back safely.
- All Branches is available only to explicitly authorized demo users.

### Tests

- One branch.
- Multiple branches.
- No valid branches.
- Invalid branch ID.
- User account switch.
- Active branch persistence.

### Definition of Done

Frontend modules can read a consistent, validated demo branch context.

---

## F00-007 — Role and Permission UI Foundation

**Priority:** P0
**Size:** M
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-005 (minimal foundation); F00-006 for full switching; explicit SECURITY policy approval

### Goal

Create consistent frontend role and permission handling.

### Remaining Approved-Planning Boundary

- Reuse the four role constants, canonical branch-role arrays and common workspace allowlist from F00-005.
- Add reusable role/navigation/action filtering and broader permission catalogs only after their explicit policy approval.
- Define general multi-role combining/record scope through approved SECURITY decisions; current workspace baseline grants no ERP access.
- RoleRoute and full module navigation remain deferred; do not rebuild minimum ProtectedRoute or initial branch selection.

### Historical Original Scope

The original draft below includes foundations now delivered by F00-005. Treat them as reuse/regression requirements; the broader matrix remains unapproved.

### Scope

- Role constants.
- Permission identifiers.
- Branch-aware role assignments.
- Reusable permission helpers.
- Navigation filtering.
- Unauthorized UI state.

### Expected Files

- `Client/src/constants/roles.js`
- `Client/src/constants/permissions.js`
- `Client/src/hooks/usePermissions.js`
- `Client/src/routes/RoleRoute.jsx`
- Navigation configuration.

### Acceptance Criteria

- Four primary roles are represented consistently.
- A user can hold different roles across branches.
- Multiple roles within one branch are supported.
- UI actions reflect approved demo permissions.
- A change of active branch updates relevant UI permissions.
- Unknown permissions do not become automatically allowed.

### Tests

- Each primary role.
- Multiple roles per branch.
- Different roles in different branches.
- Unauthorized navigation.
- Invalid assignments.

### Blockers

The exact role-permission matrix must be approved in SECURITY.md before broader grants/navigation are implemented. The latest minimal foundation uses the already approved workspace baseline and is not blocked by that deferred matrix.

### Definition of Done

The role and branch-aware UI foundation is functional in mock mode.

---

## F00-008 — Mock Data Service Layer

**Priority:** P0
**Size:** M
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-001

### Goal

Separate frontend components from temporary data storage.

### Scope

- Mock database interface.
- Centralized browser storage.
- Seed data initialization.
- Stable service method contracts.
- Create/read/update operations.
- Basic simulated failures where appropriate.
- Storage versioning or safe reset mechanism.

### Expected Files

- `Client/src/mock/seedData.js`
- `Client/src/mock/mockDatabase.js`
- `Client/src/mock/mockApi.js`
- `Client/src/services/`
- `Client/src/constants/storageKeys.js`

### Acceptance Criteria

- Pages do not directly modify localStorage.
- Services expose consistent asynchronous interfaces.
- Demo records persist after refresh where required.
- Duplicate seed initialization is prevented.
- Invalid or corrupted storage is handled safely.
- Services can later be replaced by HTTP implementations.

### Tests

- Create/read/update mock records.
- Refresh persistence.
- Empty data.
- Invalid records.
- Corrupted storage.
- Storage unavailable.

### Definition of Done

Mock data operations are centralized and independently testable.

---

## F00-009 — Academy Branding and Theme Context

**Priority:** P1
**Size:** S
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-004, F00-008

**Approved delivery evidence:** [F00-009 verification](PROGRESS.md#f00-009--academy-branding-delivery-2026-10-09). F00-004/F00-008 implementation dependencies verified; their acceptance remains pending. Broader customization/editor features are excluded.

### Goal

Prepare centralized academy branding for the frontend.

### Scope

- Academy display name.
- Academy logo reference.
- Primary theme color.
- Shared academy context.
- Theme context.
- Demo persistence.

### Acceptance Criteria

- Shared layout reads academy identity from one source.
- Branding is not duplicated across components.
- Theme changes apply consistently.
- Invalid theme values are rejected or safely handled.
- Branding remains available after a demo page refresh.

### Tests

- Default branding.
- Updated branding.
- Invalid color.
- Missing logo.
- Browser refresh.

### Definition of Done

Approved branding fields can be managed centrally.

---

## F00-010 — Foundation Verification and Documentation

**Priority:** P0
**Size:** S
**Status:** DONE - owner-accepted implemented mock scope; deferred scope excluded
**Dependencies:** F00-002A and F00-003 through F00-009 implemented foundations; F00-002 parent coverage reconciled above. Phase acceptance remains an owner gate.

**Delivery evidence:** [Current checks and acceptance audit](PROGRESS.md#f00-010--foundation-verification-delivery-2026-10-09). No F01 authorization follows automatically.

### Goal

Validate the shared frontend foundation before Dashboard development.

### Scope

- Run lint and build checks.
- Verify routes and shared layouts.
- Verify mock role changes.
- Verify branch switching.
- Verify mock service persistence.
- Check basic accessibility and responsiveness.
- Update documentation.

### Acceptance Criteria

- Required F00 functionality is working.
- No unresolved build errors were introduced.
- Relevant automated checks pass.
- Manual checks are documented.
- Known limitations are recorded.
- Project progress reflects verified results.

### Tests

- Lint.
- Build.
- Component tests.
- Mock services.
- Routing.
- Role/branch interactions.
- Basic accessibility checks.

### Definition of Done

Foundation is reviewed and approved for the next phase.

---

# 9. Phase F01 — Dashboard

F00 accepted for its implemented mock scope. Owner separately authorized F01-001 shared skeleton using workspace.view; this does not approve role-specific dashboards, metric policies or subsequent F01 tickets.

## F01-001 — Dashboard Page Skeleton

**Priority:** P0
**Size:** S
**Status:** IN_REVIEW - approved shared skeleton delivered; owner acceptance pending
**Dependencies:** F00-003, F00-006

**Approved scope:** Shared /dashboard skeleton guarded by existing workspace.view; authorized Sidebar navigation, active branch and labeled placeholders only. No role-specific policy, metrics, ERP actions or new dependency. [Actual delivery evidence](PROGRESS.md#f01-001--dashboard-skeleton-delivery-2026-10-10).

### Goal

Create the shared route-level Dashboard page.

### Scope

- Dashboard heading.
- Active branch context.
- Main content sections.
- Shared layout integration.
- Initial responsive structure.

### Expected Files

- `Client/src/pages/Dashboard/DashboardPage.jsx`
- Relevant Dashboard shared components.

### Acceptance Criteria

- Dashboard route loads correctly.
- Shared application layout is used.
- Active branch is displayed correctly.
- No hardcoded production statistics are shown.
- Page handles missing or invalid demo context.

### Tests

- Route rendering.
- Branch changes.
- Responsive layout.
- Build.

---

## F01-002 — Dashboard Statistics Cards

**Priority:** P0
**Size:** S
**Status:** BACKLOG
**Dependencies:** F01-001, F00-008

### Goal

Display consistent dashboard summary cards.

### Scope

- Reusable statistic cards.
- Appropriate titles and icons.
- Branch-filtered mock values.
- Formatting.
- Loading and empty states.

### Acceptance Criteria

- Cards use shared design tokens.
- Values come from centralized mock services.
- Branch changes update relevant values.
- Empty records show appropriate zero/empty states.
- Demo data is not misrepresented as production data.

### Tests

- Mock dataset variations.
- Branch filtering.
- Empty data.
- Numeric formatting.

---

## F01-003 — Super Admin Dashboard

**Priority:** P0
**Size:** M
**Status:** BACKLOG
**Dependencies:** F01-002, F00-007

### Goal

Create the approved Super Admin dashboard experience.

### Proposed Areas

- Academy overview.
- Branch comparison.
- Admissions summary.
- Fee collection summary.
- Staff overview.

### Acceptance Criteria

- Super Admin sees permitted academy information.
- Authorized branch and All Branches filters work.
- Statistics reflect the selected scope.
- Components use shared design patterns.
- Missing values are handled.

### Blockers

Exact dashboard widgets and metrics require approved PRD and DESIGN.md definitions.

### Tests

- Individual branch.
- All Branches.
- Empty data.
- Multiple branches.
- Incorrect role context.

---

## F01-004 — Owner Dashboard

**Priority:** P1
**Size:** S
**Status:** BACKLOG
**Dependencies:** F01-002, F00-007

### Goal

Create the Owner dashboard according to approved permissions.

### Proposed Areas

- Authorized academy performance.
- Authorized financial summaries.
- Student/enrollment trends.

### Acceptance Criteria

- Only permitted information is displayed.
- Branch restrictions are respected.
- Unauthorized controls are absent from normal UI.
- Empty and loading states are available.

### Blockers

Owner access scope must be finalized in SECURITY.md.

---

## F01-005 — Receptionist Dashboard

**Priority:** P0
**Size:** S
**Status:** BACKLOG
**Dependencies:** F01-002, F00-007

### Goal

Create the Receptionist dashboard.

### Proposed Areas

- Today's admissions.
- Pending inquiries.
- Demo follow-ups.
- Assigned front-desk tasks.

### Acceptance Criteria

- Receptionist sees only authorized branch-related information.
- Quick-action navigation opens permitted pages.
- Counts reflect demo records.
- Empty and error states work.

---

## F01-006 — Teacher Dashboard

**Priority:** P0
**Size:** S
**Status:** BACKLOG
**Dependencies:** F01-002, F00-007

### Goal

Create the Teacher dashboard.

### Proposed Areas

- My classes.
- My assigned batches.
- My students.
- My earnings, where authorized.

### Acceptance Criteria

- Teacher sees only their authorized assignments.
- Branch selection updates the assigned workload.
- Unrelated students and financial records are not shown.
- Empty and missing assignments are handled correctly.

### Blockers

Teacher compensation visibility and assignment rules must be confirmed.

---

## F01-007 — Dashboard Charts and Trends

**Priority:** P1
**Size:** M
**Status:** BACKLOG
**Dependencies:** F01-002

### Goal

Provide reusable charts for approved dashboard metrics.

### Scope

- Chart components.
- Date-range filtering where required.
- Branch filtering.
- Consistent labels.
- Empty and error states.

### Acceptance Criteria

- Chart values agree with source records.
- Chart units and periods are clearly labeled.
- Branch filters are consistently applied.
- Charts follow the approved visual design.
- No fabricated financial totals are displayed.

### Tests

- Dataset changes.
- Different date ranges.
- Different branch scopes.
- No data.
- Invalid data handling.

---

## F01-008 — Dashboard Responsive and Accessibility Review

**Priority:** P1
**Size:** S
**Status:** BACKLOG
**Dependencies:** F01-003 through F01-007, as applicable

### Goal

Check dashboard usability on supported viewports.

### Acceptance Criteria

- Dashboard adapts to approved screen sizes.
- Navigation remains usable.
- Tables and charts do not overflow destructively.
- Keyboard navigation works.
- Focus indication is visible.
- Important values are not conveyed by color alone.

### Tests

- Desktop.
- Tablet.
- Supported mobile viewport, if required.
- Keyboard navigation.
- Basic automated accessibility checks.

---

## F01-009 — Dashboard Integration and Regression QA

**Priority:** P0
**Size:** S
**Status:** BACKLOG
**Dependencies:** Relevant prior F01 tickets

### Goal

Validate the Dashboard phase before beginning Admissions.

### Acceptance Criteria

- All four approved dashboard experiences work.
- Branch switching updates data and permissions appropriately.
- Dashboard navigation works.
- Statistics derive from shared mock records.
- Existing F00 functionality has not regressed.
- Relevant automated tests pass.
- Remaining gaps are documented.

### Definition of Done

Dashboard phase is reviewed and approved for progression.

---

# 10. Remaining Frontend Feature Backlog

The following are candidate tickets for subsequent phases.

They are planning entries, not fully specified executable tickets.

Their detailed acceptance criteria must be added after the associated business rules and screen specifications are approved.

## F02 — Admissions

### F02-001 — Admission Listing and Filters
**Status:** DONE (Approved for DEMO scope)
**Goal:** Create a secure, branch-aware list view for Admissions with basic mock data integration.
**Proposed Scope:**
- `AdmissionsPage.jsx` routing to `/admissions` for Receptionist, Super Admin, and authorized Owners.
- Table view displaying: Application ID (e.g. ADM-0001), Student Name, Guardian Contact, Course/Program, Branch, and Status (Pending, Approved, Rejected).
- Search and filtering capabilities (e.g., search by name/ID, filter by Status).
- Empty and error state components.
**Dependencies:**
- Needs a new `admissionService.js` mock adapter (with async list/getById/create/update).
- Needs `admissions.read` permission defined in `SECURITY.md` and enforced via `PermissionGate`.
**Acceptance Criteria:**
- Admissions list renders only mock records for the currently selected branch.
- Unauthorized roles (e.g., Teachers) are redirected or shown an unauthorized message.
- Search and filtering accurately refines the mock list.
- Appropriate loading/empty states are visible.
**TBD Decisions Required Before Implementation:**
- Exact data schema for admissions (fields, types, required info).
- Admission approval authority (who can approve/reject).
- Admission status transitions.

### F02-002 — New Admission Form
**Status:** IN_REVIEW (Mock Persistence Implemented)
**Goal:** Build a premium responsive form to create a new admission with centralized mock persistence.
**Scope:**
- `NewAdmissionPage.jsx` at `/admissions/new`.
- Validations for required fields (Student Name, DOB, Guardian Name, Contact, Course).
- Integration with F00-008 `createCollectionService` mock architecture.
- Redirects to list on success.
- F02-003 — Student and Guardian Details
- F02-004 — Program and Batch Selection
- F02-005 — Admission Status Workflow
- F02-006 — Admission-to-Enrollment Mock Integration
- F02-007 — Admission Module Testing

Dependencies: Branch context, students, courses/batches mock contracts, approved admission rules, new admission mock service.

### F02-003 resumed delivery - Branch-wise Numbering & Working Admissions CRUD (2026-10-10)

**Status: IN_REVIEW; owner acceptance pending.** Dependencies: existing F02-002 shared form, F00 mock auth/branch/data foundation and preceding F02-003 implementation. Owner explicitly approves this extension; subsequent F02 tickets remain unauthorized.

**Current scope:** branch-specific durable Student 1/2/3 and Admission ADM-1/2/3 sequences, separate immutable globally unique new internal IDs; popup/shared standalone form; saved View; validated atomic admission/Provisional student Edit; confirmed safe atomic Delete and immediate list/filter refresh. Old academy-wide proposal/disabled Review is SUPERSEDED for new work; existing IDs/data/history remain intact.

**Migration/deletion acceptance:** initialize each branch from highest existing number and retained global high-water, never array length; preserve saved IDs and never reuse deleted numbers. New pairs carry explicit ownership markers. Only verified reciprocal same-branch Provisional admission-flow students may cascade-delete. Legacy unknown ownership is denied without erasure; unlinked admissions remove no student. Corrupt/version/conflict/storage failure preserves original bytes and consumes no number. All service reads/writes revalidate active mock identity/branch. No production permission grants, backend, fees/enrollment or installs.

**Evidence:** baseline 151/151; final 174/174 tests (16 files) PASS, including 17 new data/service and 6 UI cases. Lint/build PASS with existing warnings. Local Edge CRUD/refresh/branch isolation and 360/768/1024/1440px keyboard checks PASS, including post-save focus recovery. CI/deployment/backend/formal accessibility NOT_RUN; incoming repository whitespace check FAIL without new whitespace additions. [Detailed evidence/files/libraries/screenshots](PROGRESS.md#f02-003-resumed-delivery---branch-wise-numbering--working-admissions-crud-2026-10-10).

**Remaining:** legacy ownership determinations; single-context-only fallback without Web Locks; future production policies. Stop F02-003. F02-004 Program and Batch Selection needs separate owner approval.

---

### F02-003 - Admission Popup, Linked Student & Sequential Admission IDs (2026-10-10)

**Status:** IN_REVIEW - owner-authorized browser-local DEMO scope implemented; owner acceptance pending. No backend, production authorization, fees or enrollment changes.

- Continued Antigravity's existing form extraction, popup, version-2 admissions storage and transaction adapter. Did not restart the module or overwrite other working-tree changes.
- Admissions list opens an accessible responsive dialog; `/admissions/new` reuses the same form. Validation focuses the first invalid field; pending submits cannot be repeated or dismissed; storage errors allow retry.
- One commit stores a Pending admission, linked Provisional student and durable counter in the active authorized branch. Immutable internal IDs remain separate from the readable Admission ID; existing legacy student records remain supported.
- **PROVISIONAL DEMO decision:** academy-wide numbering within one browser database, not per branch. Highest durable counter/existing numeric legacy reference determines the next number. Fresh seeds lead to `ADM-4`; highest existing `ADM-1,242` leads to `ADM-1,243`, then `ADM-1,244` across branches. Failed writes consume no number. Counter high-water is retained even if a record is removed; no delete workflow is implemented.
- Safe normalization validates before writing, retains existing records/internal IDs, and rejects conflicting IDs, malformed/corrupt data, unsupported versions and invalid links without resetting saved data.
- Auth/session storage remains separate. `workspace.view` is unchanged; no admission business permissions were granted. This mock UI is not production security.

**Executed evidence:** baseline 127/127 tests (12 files) PASS before edits; final 151/151 tests (14 files) PASS, including 24 new transaction/workflow cases. Lint PASS (0 errors; one pre-existing DashboardPage unused-disable warning). Production build PASS (existing >500 kB bundle warning remains).

**Local production-preview browser checks PASS:** 360/768/1024/1440px popup bounds/no page overflow; Tab containment; Escape/focus restoration; first-error focus/description; formatted success/list IDs; atomic linked storage; actual nested URL reload; North/Central isolation and sequential IDs; standalone shared form; dashboard route and logout denial; no runtime exceptions. Screenshots: [mobile popup](../artifacts/f02-003/admission-popup-360.png), [desktop popup](../artifacts/f02-003/admission-popup-1440.png), [saved list](../artifacts/f02-003/admissions-saved-1440.png).

**Limitations / NOT_RUN:** CI, production deployment, backend/database checks and formal accessibility certification were not run. Native Web Locks serialize cooperating browser tabs where supported (verified in local Edge); the fallback guarantees one JavaScript context only, not concurrent tabs without Web Locks. Browser-local storage can be manually cleared/tampered with; this is not a server sequence or authorization boundary. Duplicate-person matching, real program/batch references, admission approval rules and enrollment remain unapproved/deferred.

**Dependencies:** none installed or changed. Existing React 19.3.0, Router 7.18.4, Radix Dialog 1.2.0, Lucide 1.54.0 and Tailwind 4.3.3 reused. Tests use Vitest 5.0.3, React Testing Library 16.3.3, user-event 14.6.7 and jsdom 30.1.2.

**Next:** stop after F02-003; owner review required. F02-004 - Program and Batch Selection remains a separate roadmap ticket requiring its own approved scope/rules.

---

**Scope reconciliation:** Earlier Student and Guardian Details roadmap label is historical. Current owner instruction authorizes completing the existing popup, linked student and sequential IDs. Reuses F02-002 and F00-005/006/008; no F02-004/005/006 work authorized. Tests add 19 transaction cases and 5 UI cases; see [PROGRESS.md](PROGRESS.md).

## F03 — Students

- F03-001 — Students Directory — IN_REVIEW
- F03-002 — Student Search and Filtering — IN_REVIEW
- F03-003 — Student Profile — IN_REVIEW
- F03-004 — Student Editing and Validation — IN_REVIEW
- F03-005 — Student Enrollment History — IN_REVIEW
- F03-006 — Student Fee/Attendance Views — IN_REVIEW
- F03-007 — Students Module Testing — IN_REVIEW

Dependencies: Approved student data model, enrollments and branch scoping.

## F04 — Courses & Batches

- F04-001 — Course Catalog
- F04-002 — Course Creation and Editing
- F04-003 — Batch Listing
- F04-004 — Batch Creation and Editing
- F04-005 — Batch Timetable
- F04-006 — Capacity and Assignment Views
- F04-007 — Course/Batch Module Testing

Dependencies: Course, subject, batch and schedule requirements.

**Implementation status (2026-10-12): F04-001 through F04-007 IN_REVIEW; owner acceptance pending.** Course Catalog, Course Create/Edit, Batch Directory and Batch Create/Edit are functional within confirmed branch/role boundaries. Timetable is intentionally read-only with an explicit empty state because scheduling write rules are unresolved. Capacity shows actual saved active Enrollment counts while maximum/remaining capacity stays unconfigured. Teacher assignments show an honest empty state because assignment records/policy are unresolved. Focused verification and exact limitations are recorded in PROGRESS.md. No F05 work started.

## F05 — Faculty & Classes

- F05-001 — Faculty Directory
- F05-002 — Faculty Profiles
- F05-003 — Teacher Subject Assignments
- F05-004 — Teacher Batch Assignments
- F05-005 — Class Scheduling
- F05-006 — Class Student Views
- F05-007 — Faculty/Class Module Testing

Dependencies: Teacher permissions, batch model and scheduling rules.

## F06 — Fees

- F06-001 — Fee Dashboard and Listing
- F06-002 — Fee Plans and Structures
- F06-003 — Invoice Generation UI
- F06-004 — Installment Scheduling UI
- F06-005 — Fee Collection Form
- F06-006 — Student Fee Ledger
- F06-007 — Discounts and Adjustments UI
- F06-008 — Receipt Preview and Printing
- F06-009 — Fees Module Testing

Dependencies: Approved finance rules, enrollment/invoice model and payment contracts.

Do not implement final financial logic until its rules are approved.

## F07 — Finance

- F07-001 — Finance Overview
- F07-002 — Transactions Listing
- F07-003 — Expense Entry
- F07-004 — Expense Categories
- F07-005 — Income and Expense Charts
- F07-006 — Cash Closing and Summary Views
- F07-007 — Finance Module Testing

Dependencies: Fee/payment records, approved expense rules and financial permissions.

## F08 — Demo Classes

- F08-001 — Demo Registration
- F08-002 — Demo Listing and Filters
- F08-003 — Demo Scheduling
- F08-004 — Demo Attendance
- F08-005 — Demo Status Tracking
- F08-006 — Demo-to-Admission Conversion
- F08-007 — Demo Module Testing

Dependencies: Admission, course, batch and teacher reference data.

## F09 — Assets

- F09-001 — Asset Directory
- F09-002 — Asset Registration
- F09-003 — Asset Editing and Details
- F09-004 — Asset Condition and Status
- F09-005 — Asset Assignment and Maintenance
- F09-006 — Assets Module Testing

Dependencies: Branch assignment and approved asset data requirements.

## F10 — Reports

- F10-001 — Report Catalog
- F10-002 — Report Filters
- F10-003 — Admissions Reports
- F10-004 — Student/Enrollment Reports
- F10-005 — Fee Collection Reports
- F10-006 — Branch Comparison Reports
- F10-007 — Print and Export
- F10-008 — Reports Module Testing

Dependencies: Authoritative mock record sets and approved reporting definitions.

## F11 — Branch Management

- F11-001 — Branch Listing
- F11-002 — Create Branch
- F11-003 — Edit Branch
- F11-004 — Activate/Deactivate Branch
- F11-005 — Branch Staff Summary
- F11-006 — Branch Management Testing

Dependencies: F00 branch context, approved branch rules and authorization definitions.

## F12 — User Management

- F12-001 — Staff Account Listing
- F12-002 — Create Staff Account
- F12-003 — Edit Staff Account
- F12-004 — Assign Multiple Branches
- F12-005 — Assign Multiple Roles per Branch
- F12-006 — Role Permission Matrix UI
- F12-007 — Account Activation and Deactivation
- F12-008 — User Management Testing

Dependencies: F00 mock identity model, branch assignments and SECURITY.md.

## F13 — Settings & Integrated Frontend QA

- F13-001 — Academy Profile Settings
- F13-002 — Academy Logo Settings
- F13-003 — Theme Customization
- F13-004 — Academic Settings
- F13-005 — Approved Operational Settings
- F13-006 — Cross-Module Workflow Testing
- F13-007 — Responsive and Accessibility Review
- F13-008 — Error/Empty State Review
- F13-009 — Mock Data Consistency Review
- F13-010 — Frontend Regression Testing
- F13-011 — Frontend Readiness Report

Dependencies: All applicable module features and approved settings.

---

# 11. Backend Integration Ticket Planning

Backend implementation will be a separate approved development stage.

Candidate future work areas:

- Backend module foundations.
- MongoDB schema implementation.
- Real authentication and session management.
- Role-based and branch-level authorization.
- User and branch APIs.
- Academic APIs.
- Admissions/enrollment transaction workflows.
- Fee/invoice/payment APIs.
- Finance APIs.
- Reporting APIs.
- Audit logging.
- Integration and security tests.
- Deployment configuration.
- Monitoring and backups.

Backend tickets must not be inferred as approved implementation instructions.

They will require approved ARCHITECTURE.md, ERD.md, SECURITY.md and FRONTEND_INTEGRATION.md specifications.

---

# 12. Cross-Module Integration Rules

All ERP modules must interact through shared data contracts.

Examples:

### Admission → Enrollment

An approved admission may result in an enrollment according to confirmed business rules.

### Enrollment → Fees

An enrollment may create or associate approved fee obligations.

### Fees → Finance

Recorded payments must be reflected consistently in financial summaries.

### Teachers → Classes

Teacher dashboards must derive their assignments from approved teaching relationships.

### Branches → Reports

Branch reporting must use consistent branch identifiers and applicable access restrictions.

### Settings → UI

Academy branding must be sourced from centralized settings.

Avoid duplicating independent versions of authoritative records.

---

# 13. Testing and Quality Gates

For each ticket, apply relevant checks:

- Build succeeds.
- Relevant lint checks succeed.
- Required component behavior works.
- Input validation works.
- Empty states work.
- Error handling works.
- Branch-scoped views behave as specified.
- Role-based UI behavior matches approved permissions.
- Mock data follows agreed contracts.
- No unrelated features regress.
- Relevant accessibility checks are completed.
- Documentation accurately reflects progress.

If a test fails, record the failure.

Do not mark a feature DONE until the defined acceptance criteria are satisfied or an explicitly approved exception is documented.

---

# 14. Change Request Management

The client may request minor design or workflow changes after initial proposal approval.

Changes must follow this process:

1. Record the client request.
2. Identify the affected requirement.
3. Determine whether the request is a correction, enhancement or change of scope.
4. Assess affected modules and data contracts.
5. Update the authoritative documentation after approval.
6. Create or revise affected tickets.
7. Implement only the approved changes.
8. Run relevant regression tests.
9. Update PROGRESS.md and MEMORY.md.

Do not redesign the complete application in response to a small approved change.

---

# 15. AI Agent Work Protocol

Before implementing a ticket:

1. Read AGENTS.md.
2. Read applicable approved documents.
3. Read the selected ticket.
4. Inspect the existing code.
5. Identify relevant files.
6. Confirm dependencies and blockers.
7. Explain the implementation plan.

During implementation:

1. Work only within the approved scope.
2. Prefer small and readable changes.
3. Follow existing architectural patterns.
4. Avoid duplicate or unused code.
5. Avoid unnecessary dependencies.
6. Preserve previously completed functionality.
7. Do not use unapproved placeholder rules as real business decisions.

After implementation:

1. Run relevant automated checks.
2. Record actual results.
3. Summarize changed files.
4. Explain any unresolved defects.
5. Update current task status.
6. Stop and wait for the next approved ticket.

---

# 16. Definition of Done

A ticket is DONE only when:

- Approved requirements are satisfied.
- Required functionality is verified.
- Relevant tests pass.
- No unauthorized scope changes were made.
- No unresolved blocking defects remain.
- Code follows project conventions.
- Known limitations are documented.
- Related docs are updated.
- The implementation has been reviewed and accepted.

Visual completion alone is insufficient.

---

# 17. Release and Milestone Planning

### Milestone M0 — Documentation Readiness

Approved requirements, architecture, design and relevant permission specifications.

### Milestone M1 — Frontend Foundation

F00 foundation completed and tested.

### Milestone M2 — Dashboard

F01 role-specific dashboards completed and tested.

### Milestone M3 — Core Academic Frontend

Admissions, Students, Courses/Batches and Faculty/Classes implemented according to approved tickets.

### Milestone M4 — Financial Frontend

Fees and Finance mock workflows completed and tested.

### Milestone M5 — Operational Frontend

Demo Classes, Assets, Reports, Branch Management, User Management and Settings.

### Milestone M6 — Integrated Frontend Review

Cross-module mock-data consistency, navigation, forms and regressions verified.

### Milestone M7 — Backend Integration

Real secure APIs, persistence and authorization.

### Milestone M8 — Client Acceptance and Deployment

Integrated testing, controlled client review and approved production preparation.

Milestone completion and dates must be based on verified work, not assumed progress.

---

# 18. Open Questions (TBD)

1. Who approves each completed development phase?
2. Which precise F00 design values are approved?
3. Which role permissions are finalized?
4. What frontend testing framework is already installed or approved?
5. What is the minimum supported viewport size?
6. Which modules must be prioritized if delivery time becomes constrained?
7. Which admission status transitions are final?
8. What are the fee and discount calculation rules?
9. Which reports and export formats are required?
10. What is the approved backend development start condition?
11. What are the expected data volumes?
12. What are the final acceptance and release criteria?

These questions must remain unresolved until approved.

---

# 19. Related Documents

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](ARCHITECTURE.md)
- [ERD](ERD.md)
- [Visual Design](DESIGN.md)
- [Security](SECURITY.md)
- [Frontend Integration](FRONTEND_INTEGRATION.md)
- [Engineering Rules](RULES.md)
- [Current Tasks](TASKS.md)
- [Project Decisions](MEMORY.md)
- [Progress](PROGRESS.md)

---

**Document Status:** DRAFT — Pending Review
**Approved Implementation Tickets:** Implemented mock F00 scopes owner-accepted DONE, parent routing reconciled with deferred module routes. F01-001 explicitly authorized and delivered IN_REVIEW; no following ticket authorized. Previous footer snapshot: F00-002A/F00-003 delivered, F00-004 IN_REVIEW; historical original draft baseline: none yet.

The presence of a ticket in this register does not authorize AI coding agents to begin work. Only a specifically approved READY ticket may be implemented.

## F02-003 owner-approved extension - branch sequences and DEMO CRUD (2026-10-10)

Active authorized scope: complete existing popup/shared form; independent durable Student and Admission counters per branch; accessible View/Edit/Delete actions; atomic linked update and confirmed deletion. Previous provisional academy-wide numbering is SUPERSEDED for new allocations, without renumbering existing IDs. Preserve original data and counters during migration. Delete only a same-branch reciprocal Provisional student with explicit admission-flow ownership; legacy ownership cannot be inferred from status alone and is denied with an explicit error. No permissions, backend, fees, enrollment or dependency changes. Implementation in progress; owner acceptance pending.

**F02-003 extension delivery status:** IN_REVIEW. Above in-progress scope entry is now implemented with final 174/174 regression evidence; owner acceptance is pending.

### F02-003 legacy correction delivery evidence (2026-10-10)

IN_REVIEW, not owner-accepted DONE. Latest unique same-branch Provisional-link deletion rule implemented without requiring newer ownership markers. Final 176/176 tests, lint/build and isolated local browser legacy CRUD/refresh/branch/keyboard checks PASS. Existing warnings remain; CI/deployment/backend/formal accessibility NOT_RUN. No dependency, backend or next-ticket work. [Current verified evidence](PROGRESS.md#f02-003-simple-crud-completion---legacy-deletion-correction-2026-10-10).

### F02-003 gapless display correction delivery (2026-10-10)

IN_REVIEW, owner acceptance pending. Latest mutable gapless display serial requirement implemented through response-only projection; prior visible never-reuse rule is SUPERSEDED, while permanent IDs/references/counters remain intact. Full 186/186 tests, lint/build and local Edge examples/filtering/refresh/branch checks PASS. No dependencies or next-ticket work. [Detailed evidence](PROGRESS.md#f02-003-gapless-branch-display-numbering-correction-2026-10-10).

## F03-001 limited DEMO Students Directory (2026-10-11)

**Status: IN_REVIEW; owner acceptance pending.** Explicit owner-approved order exception implements this read-only directory before F02-004. Full enrollment dependency is deferred only for this listing scope. F02-002/F02-003 acceptance remains pending; no following ticket is authorized.

**Implemented:** /students under existing workspace.view ProtectedRoute; working Students sidebar navigation; responsive teal directory using existing layout/Card/Badge/Button. Active branch records come from studentService -> mockApi -> existing version-2 mock database/localStorage. Display serial, name, available status and current linked Admission reference use existing response projections; no duplicate dataset. Legacy missing status appears Active only in presentation. No student actions, search/filter/profile/enrollment, backend or permissions added.

**Data safety:** student list/getById validate canonical active mock user/branch before and after asynchronous reads; wrong branch, logout or changed identity rejects INVALID_SCOPE. Scope-keyed protected content, result scope tagging and effect cleanup prevent stale UI. Read-specific preserveSavedRecords skips persistence of legacy normalization while validating/projection runs in memory; missing storage still seeds once. Existing writes, IDs, reciprocal links, historical references/counters and auth storage are preserved. Frontend checks are DEMO UX safeguards, not production security.

**MODIFIED source/test files:** Client/src/pages/Students/StudentsPage.jsx (loading/empty/error/retry and scoped directory); Client/src/components/Students/StudentsTable.jsx (semantic responsive table, mobile status, saved references); Client/src/services/studentService.js (guarded read contracts; existing create/update retained); Client/src/mock/mockDatabase.js (optional read-only normalization persistence control); Client/src/routes/routePaths.js (STUDENTS); Client/src/routes/AppRouter.jsx (protected route); Client/src/components/Layout/Sidebar.jsx (Students link); Client/src/mock/mockDatabase.test.js (existing storage contracts exercise adapter without newly required UI sessions). Original explanatory comments retained.

**CREATED:** Client/src/pages/Students/StudentsPage.test.jsx (12 regression cases); artifacts/f03-001/students-360.png, students-768.png, students-1024.png, students-1440.png (isolated browser screenshots). Documentation modified: TASKS.md, PROGRESS.md, FEATURE_TICKETS.md, MEMORY.md, SECURITY.md, ERD.md, FRONTEND_INTEGRATION.md.

**Actual checks:** Initial default-concurrency baseline 178 PASS / 8 FAIL (186 tests), failures in existing Admissions UI tests; an intermediate test edit had a duplicate import and legacy-normalization assertion failure, both corrected. Final complete suite with --maxWorkers=2: 198/198 tests, 19/19 files PASS, including all Admissions regressions; 12 new Students tests. Targeted Students/storage: 41/41 PASS. Final lint PASS, zero errors and one existing Dashboard unused-disable warning. Final production build PASS (Vite 8.3.3), existing >500 kB bundle warning. No baseline failure silently treated as PASS.

**Browser PASS:** isolated headless Edge local production preview, actual Admissions popup create -> keyboard Students sidebar navigation -> linked Provisional row; legacy Active presentation; exact stored bytes unchanged on reload; active branch isolation/return; logout/anonymous redirect; keyboard skip-to-content; no overflow at 360/768/1024/1440px; no runtime exceptions. Initial browser harness needed desktop viewport and readiness checks; corrected before final run. Sandbox Edge launch failed with GPU process errors; isolated browser launch outside sandbox succeeded. Actual CI, production deployment, backend runtime/security, formal accessibility certification, screen-reader and cross-browser checks NOT_RUN.

**Libraries verified installed; no installs/upgrades:** React 19.3.0 (StudentsPage/StudentsTable); Router 7.18.4 (AppRouter/Sidebar); Tailwind 4.3.3 and Plus Jakarta Sans 5.3.0 (existing theme/font); Lucide 1.54.0 (StudentsPage and existing sidebar); shared shadcn-derived Card/Badge/Button (directory), Radix Dialog 1.2.0 only reused indirectly in existing layout/Admissions. Tests: Vitest 5.0.3, React Testing Library 16.3.3, user-event 14.6.7, jest-dom 7.0.1 and jsdom 30.1.2.

Screenshots: [360px](../artifacts/f03-001/students-360.png), [768px](../artifacts/f03-001/students-768.png), [1024px](../artifacts/f03-001/students-1024.png), [1440px](../artifacts/f03-001/students-1440.png).

**Next:** owner review F03-001; normal next F02-004 Program and Batch Selection needs separate rules/scope approval. F02-005 Admission Status Workflow, F02-006 Admission-to-Enrollment Mock Integration and F02-007 Admission Module Testing remain separate. F03-002 Student Search and Filtering, F03-003 Student Profile, F03-004 Student Editing and Validation, F03-005 Student Enrollment History, F03-006 Student Fee/Attendance Views and F03-007 Students Module Testing remain planned/unimplemented. Stop after this task.
## F02-004 approved DEMO course/batch selection (2026-10-12)

CONFIRMED scope: branch-specific mock courses retained; Course required, Batch optional; minimal batch {id, branchId, courseId, name}; same shared popup/standalone form; admission courseId and optional preferredBatchId with legacy course text retained. No automatic name-to-ID mapping. Safe additive version-3 envelope behind existing mock storage key adds minimum batches from saved courses, preserves valid records/links/counters and never reseeds existing valid batches. New/changed selections validate branch/course/batch relations atomically; unchanged legacy/unresolved references may survive unrelated edits and display explicit unresolved labels. Session/branch guards remain DEMO UX safeguards; workspace.view unchanged. No backend, permissions, fees/enrollment/schedules/capacity rules or dependencies added.

IN_REVIEW; acceptance pending. F02-002/F02-003/F03-001 also remain acceptance pending. Baseline 198/198 PASS; final 223/223 tests (21 files; 25 new), lint/build and local Edge shared popup/View/Edit/optional batch/refresh/branch/keyboard/360-768-1024-1440 checks PASS. Existing lint/bundle warnings remain; actual CI/deployment/backend/formal accessibility NOT_RUN. [Full files, libraries, migration limitations and evidence](PROGRESS.md#f02-004-program-and-batch-selection-delivery-2026-10-12). Next F02-005 Admission Status Workflow needs separate owner decisions/approval; no following ticket started.
## F02-005 owner-approved DEMO status decisions (2026-10-12)

CONFIRMED owner approval: Pending -> Approved/Rejected only, explicit confirmation, same-status idempotency, no opposite transitions/reopening; canonical active-branch Owner/Super Admin only (any approved eligible role membership, never dashboard preview authority). Unique reciprocal same-branch linked Provisional student required; legacy unlinked/unsafe records refuse without changes. Student remains Provisional. Optional rejection reason; status plus append-only actor/time history committed atomically. Decided admissions, including existing Approved/Rejected records, are read-only and cannot be physically deleted. These latest rules supersede prior generic Edit/Delete availability for decided DEMO records only; existing comments/history preserved. workspace.view remains sole production-independent demo baseline, no real permission grant/bypass/backend change.

Implemented IN_REVIEW; acceptance pending, as are F02-002/F02-003/F02-004/F03-001. Existing version-3 storage accepts optional embedded statusHistory without reset/backfill; current identity/branch and policy validated at service/database boundaries, stale/conflicting operations fail without writes. Final 248/248 tests (23 files; 25 new), lint/build and local Edge status/keyboard/four-viewport/persistence checks PASS; existing warnings remain. Actual CI/deployment/backend/formal accessibility NOT_RUN. [Exact files/libraries/history contract/evidence](PROGRESS.md#f02-005-admission-status-workflow-delivery-2026-10-12). Next F02-006 Admission-to-Enrollment Mock Integration requires separate scope and owner approval. Stop after F02-005.

## F02-005 authority correction — owner matrix reconciliation (2026-10-12)


## F02-005 Pending Delete owner extension (2026-10-12)

CONFIRMED: the owner's follow-up request enables Delete in the three-dots Admissions Actions menu for Super Admin in the active authorized branch, following the preceding Super Admin-only proposal. Receptionist/Owner/Teacher and unresolved multi-role assignments remain denied. Approve/Reject authority remains unresolved and denied. Only Pending admissions can be deleted; decided records remain read-only. Existing confirmation/Cancel/Escape, pending-submit lock, error/retry, atomic linked Provisional deletion, unrelated-record preservation and response-only gapless renumbering are reused. Permanent IDs and historical counters are retained. No storage reset, backend or dependency change.

**Status: IN_REVIEW; owner acceptance pending.** Full tests PASS: 240/240 in 23 files. Lint PASS (0 errors, 1 existing DashboardPage warning); build PASS (existing large-chunk warning). Manual browser viewport inspection, CI, deployment and backend/security verification NOT_RUN. This entry supersedes historical Pending Delete denial only; previous evidence and explanatory comments are retained.

## F03-001 through F03-007 Students Module — IN_REVIEW (2026-10-12)

Owner-approved F03 master scope implemented in the existing DEMO frontend. Directory search/filter/sort is branch-scoped and keeps stable serials. Profile uses immutable IDs and exposes saved student/admission/academic data, enrollment history, Active status, and honest empty fee/attendance sections. Student editing is limited to name and available linked admission identity/guardian details; immutable identifiers, status, branch, course, batch and enrollment membership cannot be edited. Existing permission rules remain: Super Admin and Receptionist edit, Owner view only, Teacher denied. Targeted tests 72/72 PASS, ESLint PASS and one production build PASS. Manual responsive browser QA, CI/backend/production checks and formal accessibility certification NOT_RUN. Owner acceptance pending; F04 is not started.


**Status: IN_REVIEW; owner acceptance pending.** The owner-provided module matrix supersedes the earlier Owner/Super Admin status-authority interpretation. Confirmed Admissions access is now Super Admin View/Create/Edit, Receptionist View/Create/Edit, Owner View only and Teacher None. Approve/Reject and Pending Delete are proposed for Super Admin only but remain unconfirmed and therefore denied to every role. Decided records remain read-only. Existing status history, linked Provisional students, branch isolation and saved localStorage data are preserved. No broad Super Admin bypass, All Branches policy or multi-role union was introduced.

Implementation evidence: centralized named permissions, route/sidebar/action guards and service-boundary checks; final 237/237 tests (23 files), lint and build PASS, with limitations recorded in PROGRESS.md. F02-005 remains IN_REVIEW and requires owner confirmation specifically for Super Admin Approve/Reject and Pending Delete.

## F02-005 final confirmed Super Admin actions (2026-10-12)

The owner has now explicitly confirmed Super Admin View/Create/Edit/Approve/Reject and Pending Delete within the active assigned branch. Receptionist remains View/Create/Edit only, Owner View only, and Teacher has no Admissions access. This decision supersedes the unresolved authority note above. Named `admissions.decide` and `admissions.delete` permissions are enforced in the Actions UI, domain service and mock-database boundary; there is no broad Super Admin bypass or All Branches grant.

Pending may transition once to Approved or Rejected; repeat same-status requests are idempotent and stale/opposite/reopen attempts are denied. Status and append-only actor/time history persist atomically, while the linked Student remains Provisional. Only Pending admissions may be deleted through the existing verified linked-pair transaction; decided records remain read-only and non-deletable. **Status: IN_REVIEW; owner acceptance pending.** Evidence: 246/246 tests in 23 files PASS, lint PASS with one existing warning, build PASS with the existing chunk warning; final manual browser recheck/CI/deployment/backend/formal accessibility are NOT_RUN.

## Admission & Student Row Click + 3-Dots Actions — UI correction (2026-10-12)

**Owner-approved limited frontend scope; IN_REVIEW.** Admission row/name and three-dots → View open the same record through the existing saved Admission details dialog. Student row/name opens a separate read-only Student Profile by internal ID, with active-branch validation, saved student fields/status, branch and linked Admission reference. Both rows support Enter/Space; action-cell clicks cannot trigger row actions. View is available for Pending/Approved/Rejected; decided-record Edit/Delete/Approve/Reject items are disabled when present under existing permissions. No permission or status-workflow changes, student editing, enrollment, fees, backend or dependencies.

**Files:** `Client/src/components/Admissions/AdmissionActions.jsx`, `Client/src/pages/Admissions/AdmissionsPage.jsx`, `Client/src/components/Students/StudentsTable.jsx`, `Client/src/pages/Students/StudentProfilePage.jsx`, `Client/src/routes/AppRouter.jsx`, `Client/src/routes/routePaths.js`, and related focused tests.

**Verification:** targeted Vitest 38/38 in 3 files PASS; targeted ESLint PASS. Full suite/build/browser audit NOT_RUN.

## F02-005 decided-admission actions policy correction (2026-10-12)

**SUPERSEDED** by the latest owner decision below. Existing permissions and Edit/Delete behavior remain.

## F02-005 — Remove Reject; allow Approved → Pending (2026-10-12)

**Latest owner-confirmed policy.** Reject is removed from UI/new status requests. Pending admissions offer Approve; Approved admissions offer Pending. Super Admin may return Approved to Pending. Existing role permissions and authorized Edit/Delete remain unchanged; same-status is idempotent. Existing saved Rejected admissions migrate to Pending and their statusHistory is cleared. No new permissions, backend, enrollment, fees or student editing.

**Modified source:** `Client/src/components/Admissions/AdmissionActions.jsx`, `Client/src/pages/Admissions/AdmissionsPage.jsx`, `Client/src/mock/mockDatabase.js`, `Client/src/lib/admissionPolicy.js`; focused tests cover UI and saved-data migration. Targeted Vitest PASS: 61/61 across 4 files; targeted ESLint PASS. Full suite/build NOT_RUN.

## F02-006 — Admission-to-Enrollment Mock Integration (2026-10-12)

**Status: IN_REVIEW; owner acceptance pending.** The owner authorized this limited frontend mock implementation.

**Confirmed DEMO contract:** only an Approved Admission can be enrolled, using the existing active-branch Super Admin `admissions.decide` authorization. The confirmation displays the linked Student, Course, Branch and valid Batch; when no preferred batch is saved, a user must select a saved batch for that Course in the same Branch. An unresolved linked Student or Course fails closed. A missing/unresolved preferred-batch reference may be replaced only by explicit user selection of a valid saved same-branch Course Batch; no name-based guessing. The Admission remains Approved.

An enrollment is exactly `{id, branchId, admissionId, studentId, courseId, batchId, status, enrolledAt}` with `status: Active`. The service and database boundary revalidate current identity/branch and Super Admin authority. The mock database serializes the operation, checks the reciprocal admission-flow Student and saved same-branch Course/Batch, blocks repeat admission and duplicate active student/course/batch enrollment, then persists the Enrollment plus Student `Provisional → Active` in one localStorage write. A failed write preserves the prior bytes. Version-3 storage is migrated additively to version 4 with `enrollments: []`; IDs, counters, saved records and storage key are preserved, and unsupported/corrupt data is not reset.

After enrollment, Admission Edit/Delete, Student update and Approved → Pending are blocked to preserve linked records. Students Directory/Profile read the persisted Active status. No enrollment cancellation, fees, backend, new permission grant, All Branches behavior or dependencies are included.

**Changed files:** `Client/src/mock/mockDatabase.js`, `Client/src/mock/mockApi.js`, `Client/src/mock/seedData.js`, `Client/src/services/admissionService.js`, `Client/src/components/Admissions/AdmissionActions.jsx`, `Client/src/mock/enrollment.test.js`, `Client/src/pages/Admissions/AdmissionEnrollment.test.jsx`; related TASKS, PROGRESS, MEMORY, ERD and SECURITY documentation.

**Actual checks:** delivery focused Vitest PASS, 56/56 tests, and targeted ESLint PASS. The subsequent F02-007 focused run covered the added preferred-batch fallback test and UI guard: overall 129/129 tests PASS, and the production build PASS. Manual browser walkthrough, full suite, CI, backend and deployment remain NOT_RUN. No libraries installed. Owner acceptance pending; do not mark DONE.

## F02-007 — Admissions Module Final Integration Check (2026-10-12)

**Status: IN_REVIEW; owner acceptance pending.** Owner-authorized focused integration review for F02-001 through F02-006; no feature rebuild or F03 scope.

**Automated workflow verification:** PASS — create Pending Admission and linked Provisional Student; Course/Batch selection; Admission row/name/three-dots View; Edit and authorized Pending Delete; Super Admin Approve and Approved → Pending, with Reject absent; Approved → Enroll Student and Student Active; Confirm Enrollment works after selecting a valid Batch, and missing selection gives clear feedback/focus; enrolled admission/status/delete and linked Student mutation protections; role/branch authorization; refresh persistence and gapless display serials.

The enrollment UI chooses a valid saved preferred Batch when available, automatically selects when exactly one valid Batch is available, and otherwise leaves selection explicit. The focused UI test verifies that Confirm is enabled when selection is needed, clicking without a choice explains the requirement and focuses Batch, then selection and confirmation persist the enrollment/activation.

**Executed:** targeted Vitest PASS, 129/129 tests in 13 files. One production build PASS (3008 modules); Vite reports the existing >500 kB main-chunk warning. No new dependencies.

**Not run:** manual real-browser/viewport walkthrough, full suite, CI, deployment, backend authorization and formal accessibility checks. Automated UI integration results are not manual browser evidence or production-security proof. No additional feature ticket started. Owner acceptance is required; do not self-approve.
