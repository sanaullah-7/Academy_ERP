<!-- Feature Ticket List — har module ke detailed development tickets, acceptance criteria aur tests -->

# Academy Management ERP — Feature Ticket Register

**Document:** FEATURE_TICKETS.md
**Version:** 1.0
**Status:** DRAFT — Pending Review and Ticket Approval
**Updated:** 2026-10-10
**Project:** Academy Management ERP
**Development Strategy:** Frontend First
**Delivery Approach:** Incremental, Ticket-Based Development

## F00-011 — Login logo motion (2026-10-21)

**Owner authorization: CONFIRMED. Status: IN_REVIEW; owner acceptance pending.** Add a restrained Three.js presentation to the existing login logo with GSAP-controlled idle float and gentle pointer tilt. Preserve the current white logo background, dynamic academy branding and surrounding login layout. Respect `prefers-reduced-motion` by retaining a static image; retain the image if WebGL is unavailable. Three.js and GSAP are explicitly approved for this isolated UI ticket. No other page, shared animation system, authentication, business behavior or design refresh is in scope.

Acceptance evidence: login branding remains visible with and without WebGL; custom academy logo still renders/falls back; pointer tilt returns to rest on exit; GSAP/Three resources are cleaned up; reduced-motion displays a static logo without downloading animation assets. Focused tests pass 12/12 across the animation and branding suites; targeted ESLint and production build pass. Local browser confirms WebGL canvas rendering and static logo when reduced motion is enabled. Package audit reports zero vulnerabilities. Three.js and GSAP are dynamically loaded; the Three.js chunk is 736.44 kB raw/186.85 kB gzip and Vite reports the >500 kB chunk warning.

---

## F02-003 approved gapless display numbering (2026-10-10)

Owner now explicitly authorizes mutable branch-scoped display serials 1..N and ADM-1..ADM-N, closing gaps after deletion. This supersedes prior visible permanent-counter numbering, not stored immutable IDs/references. Existing ADM-* metadata and student admissionId foreign keys remain unchanged. Response-only serials derive from persisted insertion order before filtering/sorting; lookup/update/delete still use internal IDs. Existing CRUD/localStorage/auth/security boundaries remain unchanged; no dependency or backend work. Status IN_REVIEW, acceptance pending.

---

## F02-003 latest approved simple legacy deletion rule (2026-10-10)

Current owner instruction permits deleting an admission and its uniquely linked same-branch Provisional student, including legacy pairs lacking createdByAdmissionFlow metadata. The earlier marker-only ownership restriction is SUPERSEDED for this fictional DEMO scope. Validate reciprocal links, branch, uniqueness and Provisional status; reject ambiguous/broken/Active links without erasing data. Unrelated records and durable counters remain unchanged. Reuse existing popup/CRUD/services; no migration framework, dependency, backend or permissions change. Implementation IN_REVIEW; owner acceptance pending.

---

## F02-003 authorization snapshot (2026-10-10)

**Authorization at the time:** F02-003 extension only; delivered IN_REVIEW, owner acceptance pending. Independent durable branch Student/Admission sequences, shared popup and browser-local View/Edit/confirmed safe Delete were explicitly approved. This dated authorization snapshot is superseded by the newer F00-011 authorization above; it remains historical evidence. [Delivery evidence](PROGRESS.md#f02-003-resumed-delivery---branch-wise-numbering--working-admissions-crud-2026-10-10).

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
| F07 | Finance & Payroll | IN_REVIEW | P0 |
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

**Implementation status (2026-10-12, updated 2026-10-13): F04-001 through F04-007 IN_REVIEW; owner acceptance pending.** Course Catalog, Course Create/Edit, Batch Directory and Batch Create/Edit are functional within confirmed branch/role boundaries. Owner-confirmed branch-scoped Academic Stream and Subject Add/Edit records persist through the academic service; a form button-type defect preventing Add Stream/Add Subject submission was fixed and covered with UI persistence/reload regression tests (8/8 focused tests PASS; scoped lint PASS; browser NOT_RUN). Timetable is intentionally read-only with an explicit empty state because scheduling write rules are unresolved. Capacity shows actual saved active Enrollment counts while maximum/remaining capacity stays unconfigured. Teacher assignments show an honest empty state because assignment records/policy are unresolved. Focused verification and exact limitations are recorded in PROGRESS.md. No F05 work started.

## F05 — Faculty & Classes

- F05-001 — Faculty Directory — IN_REVIEW
- F05-002 — Faculty Profiles — IN_REVIEW
- F05-003 — Teacher Subject Assignments — IN_REVIEW (read-only; assignment writes blocked by TBD subject model/policy)
- F05-004 — Teacher Batch Assignments — IN_REVIEW (read-only; no approved teacher-batch relationship)
- F05-005 — Class Scheduling — IN_REVIEW (owner-approved single-date DEMO CRUD, overlap validation and Dashboard integration implemented; acceptance pending)
- F05-006 — Class Student Views — IN_REVIEW
- F05-007 — Faculty/Class Module Testing — IN_REVIEW

Dependencies: Teacher permissions, batch model and scheduling rules.

## F05-001 through F05-007 Faculty & Classes — IN_REVIEW (2026-10-12)

Implemented branch-scoped faculty directory and identity-only profiles from explicit demo teacher role memberships. Subject and teacher-batch assignment views are honest read-only states because the subject collection, assignment relationships and write policies remain TBD. Class schedule is read-only with no sessions fabricated; it awaits the shared F04 Batch Timetable contract. Class student view uses only same-branch Active Enrollment → Student → Batch references and links to existing Student profiles. Teacher access remains denied until assignment relationships and enforcement are approved. Focused tests and lint pass; one production build passes. Owner acceptance pending.

F05-005 update (2026-10-13): Owner approved branch-scoped single-date class scheduling. Super Admin can create/view/edit/delete; Receptionist and Owner remain view-only; Teacher remains denied until reliable assignment authorization exists. Required subject text, batch, enabled branch Teacher, date, start/end time and location persist in additive mock database version 5. Same-date overlaps for teacher, batch or location are rejected. Dashboard shows saved today/upcoming classes with actual Active Enrollment counts and live minute-based timing labels. Focused 30 tests, targeted ESLint and one production build pass. IN_REVIEW; owner acceptance pending.

## F06 — Fees

**F06 connected DEMO workflow — IN_REVIEW (2026-10-13):** Owner-approved branch-scoped challans, partial/full verified payments, durable CH/RCPT references, printable views, fee ledger, Finance revenue/expense ledger and Dashboard Recent Payments are implemented with additive mock database version 6. Final QA added safe branch-scoped Fees and Finance CSV downloads; only Verified payments and Posted expenses enter corresponding projections. Refunds, reversals, discounts, waivers, installment schedules and backend/payment-gateway integration remain deferred. Owner acceptance pending.

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

# Connected Academic Configuration + New Admission Workflow — IN_REVIEW (2026-10-13)

Final owner layout correction supersedes the separate-page entry: `/admissions` now contains the admissions table first and the complete `New Student Admission` workflow directly below it. The header button keeps `/admissions`, scrolls and focuses the inline section, and opens no dialog. The protected legacy `/admissions/new` URL redirects authorized creators to the same inline section; unauthorized access still fails closed. Isolated browser QA passed same-page placement, submission/table refresh, desktop two-column sticky summary, 768px/492px stacking and zero horizontal overflow. Focused tests 7/7 and targeted ESLint PASS.

Urgent entry-point fix: Admissions → New Admission now navigates to the protected `/admissions/new` route and renders the connected wizard as a full page. Isolated browser click-through PASS; unauthorized Owner direct access redirects to `/unauthorized`. Focused tests 24/24 and targeted ESLint PASS. Owner acceptance remains pending.

Owner-approved responsive New Admission layout places Student & Guardian, Academic Field/Course/Batch and Subject Selection in the main column, with a desktop sticky fee-preview summary at right and stacked mobile layout. Streams, courses, batches, subjects and configured fees come from branch-scoped versioned mock storage; Super Admin manages configuration and Receptionist remains read-only. Submitting creates only a Pending admission with linked Provisional student and does not create an official challan or verified payment. Isolated browser QA passed the connected workflow, desktop 1410px and tablet 768px layouts, plus stacked 492px mobile containment; exact 360px was not available in the Edge harness. Two confirmed display defects were fixed: entity-correct save feedback and configured batch capacity labels. Post-fix focused tests 16/16 and targeted ESLint PASS. Owner acceptance remains pending.
# F02/F04/F06 Connected Academic and Financial Demo Workflow — IN_REVIEW (2026-10-13)

Saved subject/course pricing is now recalculated at admission persistence, snapshotted into enrollment and enforced by F06 challan issuance. Duplicate enrollment challans and mismatched configured amounts are rejected. Admissions shows truthful saved single-date class metadata where a subject/batch match exists and otherwise reports unavailable faculty/schedule data. Concessions, installment rules and SMS remain unapproved. Owner acceptance pending.
# F02/F04/F06 Owner-Visible QA Demo — IN_REVIEW (2026-10-13)

Final 2026-10-14 review remains **IN_REVIEW**: selected Batch styling was aligned with the approved reference and saved single-date class overlaps are now reported without inventing recurring schedules or assignments. Focused tests 32/32, targeted lint and one build PASS. Fresh browser screenshot NOT_RUN after automated approval rejection; discounts/installment authority and separate faculty-assignment writes remain unapproved.

## F04 Course/Batch action menu — IN_REVIEW (2026-10-14)

Course and Batch tables provide a three-dot View/Edit/Delete menu. Delete is Super Admin-only, confirmation-gated, branch-scoped and blocked for linked records without cascading. Focused tests 10/10 and targeted ESLint PASS; owner acceptance pending.

## F02/F03 enrolled student deletion correction — IN_REVIEW (2026-10-14)

Admission and Students views now share a Super Admin-only confirmed deletion transaction for an admission-owned student. Linked enrollment, challan and receipts are removed atomically to prevent orphan references; unrelated records remain. Focused tests 21/21 and targeted ESLint PASS.

## F04 academic delete-flow correction — IN_REVIEW (2026-10-14)

Academic Stream, Course, Batch and Subject surfaces now use consistent role-aware three-dot View/Edit/Delete menus. Menus dismiss after an action, outside click or Escape; opening a new dialog clears prior delete errors. Unlinked records can be deleted, while verified dependencies refuse deletion without cascade. Focused tests 12/12 and targeted ESLint PASS; browser QA and owner acceptance remain pending.

## F04 academic relationship visibility — IN_REVIEW (2026-10-14)

The Courses & Batches screen now makes the saved hierarchy visible: Stream portfolio cards link to Courses and summarize their Subjects/Batches, the Subject directory names both parent Course and Academic Stream, and Course rows show their Stream plus Subject/Batch counts. Existing CRUD and branch/role behavior remain intact. Focused tests 13/13 and targeted ESLint PASS; browser visual QA and owner acceptance remain pending.

Final owner placement sets Course Subjects as the wide left table and Academic Portfolios as the right card column on desktop, with responsive stacking below desktop. Focused page tests 9/9 and targeted ESLint PASS.

Compact owner polish removes subject-table horizontal scrolling, reduces table/card typography and bounds portfolio lists over four cards with internal vertical scrolling. Focused page tests 9/9 and targeted ESLint PASS.

Courses/Batches now sits below Course Subjects in the left column, uses a no-horizontal-scroll compact table, and shares a smaller unclipped three-dot menu. Focused page tests 9/9 and targeted ESLint PASS.

Both academic directories now paginate with 5/10/25/50 page sizes, ranges and page navigation. The compact 17rem portfolio sidebar gives the left table stack more desktop width. Focused page tests 10/10 and targeted ESLint PASS.

Pagination and Courses/Batches table density were tightened with 28px controls, content-sized fixed columns and single-line ellipsis. Focused page tests 10/10 and targeted ESLint PASS.

## F01/F06 Dashboard daily cashflow correction — IN_REVIEW (2026-10-14)

Super Admin Dashboard cashflow now derives selected-period bars and totals from active-branch verified receipts and posted expenses. Daily data is grouped into four-hour slots, with period-appropriate weekly/monthly/custom/year buckets and a truthful empty state. Focused tests PASS 17/17 and targeted ESLint PASS. Browser QA and owner acceptance remain pending.

Added an explicit Super Admin-only, confirmation-gated and idempotent QA demo action through existing domain services. It creates clearly labeled fictional academic, admission, enrollment, challan and verified-payment examples in the active branch without deleting existing data. Isolated browser acceptance verified Paid and Partial examples, final collection, receipt, Finance, Dashboard and refresh persistence. Owner acceptance pending.

## F09/F10 Owner-approved delivery update (2026-10-14)

**F09-001 through F09-006: IN_REVIEW.** Implemented branch-scoped directory/KPIs/filters/pagination, registration, immutable-code editing/details, condition inspection, same-branch assignment/unassignment, maintenance history, persistence, permissions and focused tests. Stored book value is displayed; automatic depreciation, deletion/disposal and finance posting remain blocked pending approved rules.

**F10-001 through F10-008: IN_REVIEW.** Implemented authoritative saved Admissions, Enrollment, Verified Fee Collection and authorized Super Admin Branch Comparison reports, including working filters, search, pagination, dynamic KPIs, safe CSV and browser print. Unsupported attendance, recovery-rate and deadline metrics are omitted. Browser owner acceptance remains pending.

## F11-001 through F11-006 Branch Management — IN_REVIEW (2026-10-14)

Implemented authorized tenant branch listing/search/status, real staff and saved-data summaries, create/edit, five-branch license/duplicate validation, safe lifecycle controls and branch-selector integration. Core seed branches remain read-only in the frontend demo; backend tenant authorization and lifecycle review for production remain required.

## F12-001 through F12-008 User Management — IN_REVIEW (2026-10-14)

Implemented searchable/filterable/paginated staff accounts, validated creation/editing, unique login identity, explicit multi-branch assignments, different approved roles per branch, permission-constant matrix, safe activation/deactivation and supported mock login. Self-deactivation, last-admin removal, disabled sessions and cross-branch access fail closed. Password delivery/reset is not fabricated.

## F13-001 through F13-011 Settings and Integrated Frontend QA — IN_REVIEW (2026-10-14)

Implemented a cohesive screenshot-aligned Settings page using shared branding/theme, authoritative F04 academic/price records, real staff/role and campus records, and honest disabled notification states. Logo configuration supports the existing local-raster mechanism; browser file uploads and SMS gateway delivery remain unavailable. Mock-demo readiness is not production readiness; backend authorization, audit, gateway, CI and owner acceptance remain pending.
F11-F13 continuation evidence (2026-10-15): focused connected regression suite PASS 92/92 across seven files; targeted ESLint PASS. Remaining ticket state is IN_REVIEW pending interactive browser and owner acceptance.
F09-F13 functional QA evidence (2026-10-15): Assets/Reports, organization access, branding, Demo/Admission, Fees/Finance/Dashboard and migration checks PASS 107/107. Settings fee/logo integration, branch refresh/deactivation safety, academic projections and UI encoding defects were corrected. Targeted lint/build pass; interactive browser acceptance remains pending. All tickets remain IN_REVIEW.

## Academic assignment data-flow correction (2026-10-17) ? IN_REVIEW

Owner authorized main dev changes with UI styling frozen. Existing assignment dialog now selects saved field/course dependencies, supports saved-assignment edit/remove, and shares facultyService with Courses & Batches. Course detail callbacks retain batch/subject IDs. Removed fabricated faculty timetable/enrollment/KPI fallbacks; course/batch counts use unique active student IDs and faculty reach uses a union. Assignment writes require classes.manage, weekdays normalize and missing update IDs are rejected.

Verification: focused handler integration proves create/edit, second assignment retention, conflict rejection, enrolled-vs-pending counts, academic projection, Admissions teacher/room rendering and selective removal. Existing Faculty workflow, daily clock, Dashboard, Admissions enrollment, academic configuration and financial service checks passed in focused runs. Targeted ESLint and one production build passed; existing large bundle warning remains. Browser NOT_RUN (no browser automation tooling available); owner browser acceptance pending. No commit/push or owner storage changes.


## Staff deletion correction (2026-10-17) - IN_REVIEW
Owner authorized built-in and created staff deletion through Faculty and Users. Shared permission-checked deletion preserves linked schedules/demo sessions/assets, blocks self/last branch administrator deletion and requires management access to all assigned branches. Deleted built-in identities persist through organization tombstones without resetting operational records. Users exposes explicit confirmation. Focused organization/Faculty tests: 13/13 PASS; targeted ESLint PASS; isolated Edge Users Cancel/Delete/refresh PASS. Owner browser acceptance pending; no commit/push.


## Direct role dashboard (2026-10-17) - IN_REVIEW
Removed Dashboard role-selection screen and top presentation role buttons at owner request. Dashboard resolves the current branch assigned role automatically (Super Admin, Owner, Receptionist, Teacher priority for multiple roles); sidebar authorization remains unchanged. Dashboard and financial regression tests 17/17 PASS; targeted ESLint PASS. Account impersonation/preview behavior requires clarification and is not implemented.


## Explicit mock staff account switch (2026-10-17) - IN_REVIEW
Owner clarified actual login switch. Users Open Account requires confirmation, then replaces the mock session with the enabled target staff identity and its authorized branch context. Target permissions apply without retained administrator access; returning requires ordinary demo login. Disabled/unassigned targets are rejected. Auth/Dashboard tests 42/42 PASS; targeted ESLint PASS; isolated Edge Cancel/Confirm/teacher tabs/refresh PASS. Corrected stale auth test reference-identity assertion to compare canonical user values. Production backend impersonation is not implemented. No owner storage changes, commit or push.


Topbar compact-control adjustment (2026-10-17, IN_REVIEW): sidebar toggle and fullscreen controls now use borderless 32px sizing; desktop sidebar toggle moved 8px left. Existing handlers unchanged. Targeted Header ESLint and diff check PASS; visual browser verification NOT_RUN.


Topbar follow-up (2026-10-17, IN_REVIEW): search hover retains card background; sidebar toggle centered across the sidebar/topbar boundary in both expanded and collapsed desktop states. Targeted ESLint PASS; isolated Edge computed hover background and both boundary-center checks PASS.


Topbar layering correction (2026-10-17, IN_REVIEW): topbar z-index 30 clears sidebar layer 20 so the boundary toggle remains fully visible/clickable; search maximum width reduced to 384px. Targeted ESLint PASS; isolated Edge toggle hit-test and search width PASS.


Sidebar motion correction (2026-10-17, IN_REVIEW): global active-button scale overrode the toggle centering transform and caused a press jump. Scoped override preserves centering while pressed; sidebar width/body margin transitions removed for immediate toggling. Isolated Edge press-position and instant-toggle checks PASS.


Compact branch dropdown (2026-10-17, IN_REVIEW): owner-requested 176px maximum trigger with themed custom campus options, selected checkmark, outside click/Escape/Tab close and arrow/Home/End keyboard navigation. Existing authorized branch service unchanged. Dashboard/Students branch regression tests 28/28 PASS; targeted ESLint PASS; isolated Edge actual branch switch and keyboard close PASS. Sidebar easing now 320ms per owner follow-up.


Global search input alignment (2026-10-17, IN_REVIEW): search icon and single-line ESC badge positioned inside input with reserved text padding. Targeted ESLint PASS; isolated Edge bounding checks PASS. Branch dropdown menu now matches trigger width per owner follow-up.


Faculty class time/shift progress (2026-10-17, IN_REVIEW): saved class/assignment displays use 12-hour AM/PM and start-time Morning (before noon)/Evening labels. Shift cards retain actual seat-capacity reporting and add clock-derived scheduled-minutes elapsed progress, not claimed teaching/syllabus completion. Existing minute clock updates progress. Focused time/shift/Faculty tests 11/11 PASS. Targeted lint PASS on utilities, profile and schedule panel; existing unused imports in FacultyProfileModal and set-state-in-effect in FacultyClassesPage remain. Browser NOT_RUN. Native time entry remains browser/OS localized; stored HH:mm values unchanged.


Faculty card/progress correction (2026-10-17, IN_REVIEW): timetable card header/room/timing bounded with single-line truncation/tooltips; student action on a separate contained row. Roster and full-profile assignment deletion now require Cancel/Delete dialogs (existing modal confirmation retained); single-date roster deletion uses class service. Weekend classes now contribute to actual Morning/Evening cards as well as explicitly described weekend summary. Clarified scheduled time elapsed versus enrolled/total seat occupancy; only today schedules count. Focused tests 11/11 PASS, helper/profile ESLint PASS; pre-existing roster set-state-in-effect lint error remains. Browser verification incomplete (fixture/selection timeouts), not claimed PASS.


Dashboard class period labels (2026-10-17, IN_REVIEW): daily cards show Morning before noon, Afternoon noon to before 17:00, Evening from 17:00 based on saved start time; invalid time is explicit. Existing Faculty two-shift grouping unchanged. Focused time/Dashboard tests 14/14 PASS; targeted ESLint reports existing unused MoreVertical and feeService imports in Dashboard; browser NOT_RUN.


Faculty session banner (2026-10-17, IN_REVIEW): compact nonwrapping status badge, working Schedule link, removed hardcoded In Progress. Status resolves selected teacher recurring/single-date saved classes for today and existing minute clock (Asia/Karachi); no classes shows explicit empty status. Focused Faculty/shift tests 11/11 PASS; existing roster effect lint issue remains; browser NOT_RUN.


Faculty current-UI consolidation (2026-10-17, IN_REVIEW): removed session Schedule link and obsolete ClassSchedulePanel component/rendering; legacy schedule URL redirects to current Faculty directory, retaining saved sessions/services. Profile footer Batch Students replaced by permission-checked Add Class wired to existing assignment modal with selected teacher and new-assignment mode. Per-slot View Students retained. Syllabus row spacing adjusted; completion unavailable because no authoritative completed syllabus records exist. Faculty/Dashboard regressions 18/18 PASS; router lint PASS, existing roster set-state-in-effect lint issue remains. Browser NOT_RUN. No commit/push or saved data changes.


Faculty relationship visibility (2026-10-17, IN_REVIEW): timetable cards show saved Batch name and no Active Slot badge (Dashboard selection remains screen-reader context). Full profile subjects/batches show saved Field > Course > Batch > Subject relationships and authoritative batch enrolled counts; schedule table includes field and batch student count. Counts explicitly describe batch enrollment, not subject attendance. Faculty/Dashboard tests 18/18 PASS; service/profile ESLint PASS; browser NOT_RUN. Existing roster lint issue unchanged.


Faculty academic table consolidation (2026-10-17, IN_REVIEW): replaced separate Assigned subjects/batches profile cards with one full-width themed Academic Assignments table (Field, Course, Batch, Subject, Students). Repeated schedules for the same saved relationship share one summary row; timetable remains unchanged. Fixed columns/truncation/tooltips contain long content; student count explicitly denotes active batch enrollment. Browser visual acceptance pending.


Saved academic subject filters (2026-10-17, IN_REVIEW): Faculty filter pills now derive active subjects from saved active courses in selected branch rather than a fixed subject list/name inference. Counts/filter membership use saved assignment subject IDs and unique teachers; duplicate subject names identify course. Navigation, refresh, window focus and cross-tab storage changes reload academic data. Focused Faculty tests 7/7 PASS including a newly saved custom subject/filter. Existing effect lint issue remains; browser NOT_RUN.


Assignment conflict time display (2026-10-17, IN_REVIEW): teacher-overlap error formats existing saved class times in 12-hour AM/PM using shared formatter. Conflict detection and records unchanged.


Subject-scoped class students (2026-10-17, IN_REVIEW): View Students passes selected assignment subject/batch to existing modal/service. Only Active same-branch same-batch enrollments explicitly containing that subject ID are shown; unknown subject fails closed. Class popup fixes selected batch and displays current branch/subject. Existing generic batch service remains available without subject filter. Focused faculty service tests 6/6 PASS including subject/pending/foreign-branch exclusion. Existing modal effect lint issue remains; browser NOT_RUN.


Selected class status correction (2026-10-17, IN_REVIEW): status banner now resolves the clicked assignment/single-date occurrence by immutable ID, rather than prioritizing any in-progress class for the selected teacher. Uses existing daily resolver/clock; other weekdays or absent occurrences show Not scheduled today. Focused clock/selection tests cover completed/live/upcoming/starting-soon and missing selection. Browser acceptance pending.


Subject-specific timetable count (2026-10-17, IN_REVIEW): roster class cards use unique active same-branch/same-batch enrollments explicitly selecting the assignment subject, matching View Students rather than entire batch population. No matching subject enrollment shows 0; single-date sessions without a saved subject ID show 0 instead of borrowing batch count. Existing batch capacity metrics unchanged. Focused Faculty tests 13/13 PASS; service ESLint PASS; browser NOT_RUN.


Faculty professional details binding (2026-10-17, IN_REVIEW): replaced unconditional demo placeholder with saved qualification, specialization and department values. Missing fields explicitly show Not recorded; optional saved textual professional notes preserved. Faculty integration tests 8/8 PASS including persisted professional fields; profile/test ESLint PASS. Browser NOT_RUN.


Add Faculty saved-subject selector (2026-10-17, IN_REVIEW): replaced fixed Primary Subject list with active saved subjects from active branch courses; loads on modal open and reloads on focus/storage changes. Themed compact listbox shows course context/checkmark, keyboard navigation, outside-click/Escape close and empty/error/loading states. New faculty must select a saved subject; legacy edit specialization preserved. Primary subject remains profile specialization, not an automatic teaching assignment. Focused Faculty tests 8/8 PASS including saving a custom academic subject into new faculty; targeted modal/test ESLint PASS. Browser NOT_RUN.


Scrollbar visibility follow-up (2026-10-17, IN_REVIEW): visible scrollbar tracks hidden across workspace descendants and portaled dialogs, including dropdown lists; scrolling overflow and navigation remain functional. CSS-only; diff check PASS, browser NOT_RUN.


Primary subject dropdown density (2026-10-17, IN_REVIEW): menu maximum height reduced to 160px, tighter item padding/gap and 11px option text; scroll behavior preserved. Targeted ESLint PASS.


Primary-subject assignment filter (2026-10-17, IN_REVIEW): Add/Edit Class subject options match selected teacher saved primary specialization and selected course. Changing teacher clears stale subject; persistence rejects a mismatching subject for teachers with a recorded primary subject. Legacy teachers without primary subject retain existing selection behavior. No saved assignments removed. Focused dialog tests 2/2 PASS including Biology-only UI and mismatch rejection; existing Faculty workflow 8/8 PASS in combined run before focused addition; targeted ESLint PASS. Browser NOT_RUN.


Courses/portfolio polish (2026-10-17, IN_REVIEW): removed Set Up QA Demo action and its page-only setup handler/dialog; existing saved data and shared demo service preserved. Add Course/Batch moved right opposite directory tabs. Portfolio container/cards use theme-based subtle gradients, compact metrics/links, uniform 168px cards; list allows exactly four cards (702px with gaps), scrolling only above four and no visible scrollbar. Courses page tests 10/10 PASS; targeted ESLint PASS; isolated Edge five-card case verified 702px viewport/880px scroll height and absent QA action. No owner storage changes or commit/push.


Academic Subjects tab placement (2026-10-17, IN_REVIEW): moved existing subject table into Subjects tab beside Courses and Batches, with shared right-aligned tab-specific Add action. Existing subject actions, exports and pagination preserved; only selected directory table visible. Courses page tests 10/10 PASS; targeted ESLint PASS; isolated Edge tab visibility/placement and Add action checks PASS. Saved data unchanged.


Academic directory table polish (2026-10-17, IN_REVIEW): Courses/Batches/Subjects default to 10 rows per page, selectable pagination retained. Shared scoped table styling uses theme tokens for compact uppercase headings, subtle alternating rows/hover and consistent cell spacing/dividers. Courses page tests 10/10 PASS; targeted ESLint PASS; isolated Edge confirmed 10-row defaults across all tabs with no horizontal overflow.




Compact portfolio actions (2026-10-17, IN_REVIEW): three-dot actions use content-fit width, smaller 11px text and tighter spacing. Academic stream portfolio menu now shows only permitted Edit/Delete; View removed from that menu, stream-name view remains. Users without management receive no empty stream menu. Courses page tests 10/10 PASS; targeted ESLint PASS; browser NOT_RUN.


Course details popup fit (2026-10-17, IN_REVIEW): scoped override removes shared 512px width cap for course popup (1040px desktop, viewport-bounded mobile), smaller title/tabs/padding, single-line nonshrinking tab labels and reserved close-button space. Isolated Edge width 1040px and all tab labels single-line PASS. Existing CourseDetailsModal unused-import/effect lint errors and dependency warning remain.


Fees/Finance table pagination (2026-10-18, IN_REVIEW): shared compact pagination with range, bounded numbered pages, previous/next and 10/15/25/50 sizes; both default to 15. Filter/branch/page-size context resets page, result shrink clamps safely; exports/financial totals keep all matching records. Fees empty results retain controls. Focused financial regressions 5/5 PASS; targeted ESLint PASS; isolated Edge Finance selector/default PASS. No saved financial data changed.


Finance reference cards and live metrics (2026-10-18, IN_REVIEW): four expanded theme-based cards show daily received/spent split, dynamic current-month revenue/expense totals, actual verified receipt/posted-expense counts, calculated net margin and previous-month net. No fabricated challan-collection/dues/healthy-status claims. Karachi date/month grouping handles UTC boundaries and zero revenue honestly. Refresh on expense save, focus, database storage events and minute timer (cleaned on unmount). Focused financial/metrics tests 7/7 PASS, targeted ESLint PASS. Isolated Edge real Post Expense updated current-month expense card from 0 to 123 using explicitly fictional test profile data; owner storage untouched. No commit/push.


Dashboard Quick Operations compact layout (2026-10-18, IN_REVIEW): reduced section padding/gaps, action minimum height 80 to 64px, icon containers 40 to 32px, icons 19 to 16px and compact title/helper text. Existing navigation/permissions unchanged. Dashboard tests 12/12 PASS; existing unused MoreVertical/feeService lint errors remain. Browser NOT_RUN.


Academic table relationship badges (2026-10-18, IN_REVIEW): field in Courses, course in Batches, and course/field in Subjects now use compact pastel pill badges with dot, subtle gradient/border and dark-mode colors. Stable identity hash keeps matching records consistent across tables; long names truncate with title. No data changes. Existing unused CalendarDays/UsersRound lint issues remain; browser NOT_RUN.


Demo prospective registration and Admissions handoff (2026-10-18, IN_REVIEW): trial registration uses saved active academic fields/courses/batches in current branch, collects candidate/guardian/contact/date/time/notes and creates only demo inquiry. Existing-student picker omitted on this page. Registry derives actual field/course/batch/branch, guardian, requested/scheduled timing and teacher/room; removed guessed streams, fabricated dates/halls/admission numbers. Compact fixed-column table clips long text instead of overlaps/wrapping; details retain full records. Registered rows can schedule, scheduled rows mark attendance, eligible candidates open editable Admissions prefill. New-vs-existing admission handling corrected; pending and instant completion carry demo ID into existing atomic admission transaction, validate source branch/permissions and prevent repeated conversion. Demo linked status updates atomically with saved admission; existing approval/enrollment/challan/payment workflows preserved. Pending prefill cleared after successful save. Cards derive recorded attendance/conversion/pending totals, no invented rooms or future-date registration counts; focus/storage/minute refresh with cleanup.

Verification: 37/37 focused Demo UI/service/financial tests PASS including atomic pending/duplicate protection and instant enrollment/payment projection. Demo/database targeted ESLint PASS; existing Admissions form lint issues remain (unused declarations and effects/memoization). One production build PASS with existing large-chunk warning. Isolated Edge real controls PASS for registration/table/field display/direct editable prefill/Pending save and separate schedule/attendance/Convert/instant enrollment/PKR500 partial payment. Fictional QA records only in disposable profile; owner storage untouched. Browser full export/role matrix not exhaustively repeated. No commit/push; owner acceptance pending.


## QA-RELEASE-20261018 ? Owner-authorized stabilization and dev release (2026-10-18)

Authorization: owner's supplied FINAL QUALITY ASSURANCE, ERROR CLEANUP & SAFE DEV PUSH request explicitly authorizes direct dev stabilization, inclusion of intended completed Codex/Antigravity work, one commit and a normal origin/dev push. No redesign, destructive cleanup, new packages or backend implementation authorized. Existing approved UI/theme/PDF templates and owner's storage preserved; artifacts remain untracked.

Implemented: unused import/declaration cleanup; table selection/column hooks moved intact to a dedicated hook module to resolve Fast Refresh boundaries, preserving comments and consumers; unstable memo dependency removed; admission prefill resolves within the asynchronous reference load and preserves an explicitly unselected batch when editing an existing admission; course student loading derives from the matching request result and includes batch reference dependencies; batch-student state resets by record/open scope; dashboard navigation selection resolves once when faculty data is ready. Updated stale branch-dropdown/profile/retired-schedule test expectations without removing tests or disabling rules. Bound jsdom workers to two to prevent resource-contention timeouts; original timeouts/assertions retained. An encoding-write failure was recovered from the exact initial ESLint source snapshot before further checks; no owner code discarded.

Verification: initial ESLint 50 errors/2 warnings; final full project lint PASS, zero errors/warnings. Initial full suite 412 passed/10 failed (422 tests, 53 files). Final full suite 421 passed/1 failed; the remaining stale native-select interaction in AdmissionCrud was corrected, then that complete test file passed 12/12, with targeted lint PASS. Thus all 422 tests have passing final evidence; no tests skipped/deleted and no additional full-suite run performed. Focused academic/faculty/demo/branch workflows passed apart from stale assertions subsequently resolved by the final run. Production build PASS; Server/server.js syntax PASS. No TypeScript check configured. git diff --check PASS. Source and untracked intended files reviewed; no secret-pattern matches in diff, no environment/generated/artifact files intended for staging.

Browser: isolated Edge QA profile and separate disposable context only; module smoke covered Dashboard, Faculty, Admissions, Students, Fees, Finance, Demo Classes, Assets, Reports, Users, Settings, Branches and the correct Courses & Batches URL. Correct academic tab controls, course PDF download and CSV download passed; no runtime errors in successful smoke runs. A browser script initially used the wrong role for the academic tabs; the corrected check passed. Existing automated tests cover permissions/branch isolation, academic assignment/conflicts, admission/enrollment, financial totals/full-partial payments, PDF templates and CSV/selection behavior. Every browser role/device/export variant was not exhaustively repeated. This remains a mock frontend, not production backend/security validation.

Known limitation: Vite reports a noncritical >500kB main-chunk warning (about 2.72MB minified, 1.10MB gzip, including synchronous PDF/logo code). Build succeeds; no threshold changes, warning suppression or risky route/export restructuring performed. Existing production integration and owner acceptance remain outside this stabilization. Release checks complete; commit/push execution is recorded in the final owner report after remote safety verification.


## MOBILE-20261018 - Premium mobile-only ERP presentation

Authorization: owner's PREMIUM MOBILE-ONLY RESPONSIVE TRANSFORMATION request, 2026-10-18. Status IN_REVIEW. Scope is up to 767px, preserving every 768px+ computed desktop result and existing business workflow.

Acceptance evidence:
- Shared compact safe-area-aware topbar/drawer; existing navigation, search, branch/account/profile/logout retained. Drawer identity/logo fitted, navigation scrolls internally and closes after selection.
- Compact two-column KPI layouts where practical; narrow Finance cards remain one column. Existing card data and calculations unchanged.
- Existing mobile record layouts retained; remaining tables scroll internally with all columns, sorting/filtering/selection/export functions retained. Table row action menus stay reachable; pagination uses larger tap targets.
- Dialogs use viewport-relative heights, bounded grid tracks, internal scrolling, single-column form grids and readable inputs. Fixed challan-preview intrinsic grid overflow; unchanged PDF/print templates. Inline Admissions stays in-page with non-sticky summary below its form.
- Faculty roster/detail design stacks on mobile; selecting a record reveals/focuses the existing detail panel only below 768px. Desktop selection stays unchanged.
- Target browser matrix and actual workflow evidence in PROGRESS.md. Final full Vitest 422/422 PASS, targeted 29/29 PASS, ESLint PASS, build PASS. Existing large-chunk notice remains. No dependencies or backend/service changes. Owner acceptance pending; no commit/push.


## DEMO-REGISTER-CLASSES-20261018 - Registration class timing flow (IN_REVIEW)

Approved scope: selected academic Field -> Course -> Batch exposes only that batch's saved recurring assignments and dated class records in the active branch. Show actual subject, teacher, days, 12-hour timing and room; using a timing fills preferred request date/time. Keep a prospective inquiry Registered until the existing scheduling action confirms it; no automatic attendance, admission or enrollment. Form-only visual polish and sticky dialog footer authorized by the owner's subsequent request; prior mobile-only desktop-preservation scope continues outside this dialog.

Acceptance: independent date-only weekday/rollover handling; strict course/batch/branch filtering; no fabricated slots; live focus/storage/minute refresh with cleanup and stale-response guard; no periodic form draft reset; manual date/time fallback when no saved classes exist; accessible buttons, loading, error and retry. Focused tests17/17 PASS and real Edge nine viewport/submit cases PASS. Final regression evidence in PROGRESS.md.


## DEMO-ACTIONS-DELETE-20261018

Implemented compact accessible desktop/mobile row menu and explicit Cancel/Delete confirmation. Centralized service/database deletion checks active branch and manage permission, removes only selected inquiry and preserves other academy records. Linked admissions prevent deletion. Acceptance evidence: 48 targeted tests, lint, build and disposable browser checks at 320/390/430/1440px.


## DEMO-MULTI-CLASS-20261018

DEMO-MULTI-CLASS-20261018: multiple saved classes may be requested within one course/batch inquiry. Each selection toggles independently; field/course/batch/manual request changes clear selection. First selection fills preferred date/time. Registration validates each actual class reference against branch/course/batch and saves class snapshots. Inquiry remains Registered, separate scheduling unchanged. Acceptance: 50 targeted tests PASS, lint0/0, build PASS, disposable browser360/1440 PASS.


## DEMO-UI-POLISH-20261019

Owner-authorized presentation update: reuse shared CustomSelect for Demo stream filter; reduce summary card padding/icon/value size and page/header vertical spacing; remove Trial Faculty desktop column and matching mobile summary line, redistribute seven table column widths. Faculty information remains in inquiry details and scheduling. IN_REVIEW. PASS: 10 existing Demo page/registration tests, full lint0/0, production build (existing large-chunk notice), disposable Edge dropdown bounds/selection and removed-column checks at360/1440px, git diff --check. No persistence/business-rule change or commit/push.


## DEMO-DIRECT-ATTENDANCE-20261019

Owner explicitly replaces the separate Demo scheduling UI with direct attendance after registration. Removed scheduling menu actions and page dialog/data wiring. Registered, Scheduled, Attended and Missed inquiries can use the existing attendance dialog; converted/cancelled records remain blocked. Attendance is inquiry-level, not per-class tracking. Registration-selected classes now appear inside Scheduled Trial Class Session in Details, with legacy scheduled-session fallback; no fabricated sessions. Attendance modal remounts per candidate to avoid stale outcomes. Expanded status column and compact table badges prevent clipping. PASS:42 targeted service/page/registration tests, full lint0/0, build (existing chunk warning), isolated Edge360/1366/1440 direct attendance and status badge bounds, git diff --check. Full suite NOT_RUN. IN_REVIEW; no owner data edits, no commit/push.


## DEMO-DATE-COLUMN-20261019

Owner-authorized date-only Demo registry presentation: heading Trial Date, desktop cell and mobile summary show scheduled date or requested-date fallback only; remove time/venue from list. Existing exports and inquiry details preserved. PASS targeted component ESLint and7 existing Demo page tests; git diff --check. IN_REVIEW; no commit/push.


## PAGE-HEADER-CLEANUP-20261019

Owner authorized removal of category/branch eyebrow text above page names across all tabs. Removed matching lines/decorative dots from Demo Classes, Fees, Finance, Assets, Reports, Branch Management, User Management and Settings. Other pages already start at their main heading. Page titles, descriptions and branch context remain intact. PASS: full ESLint0/0, production build (existing chunk warning),11 existing Finance/Demo page tests, git diff --check. Browser/full suite NOT_RUN for this presentation-only change. IN_REVIEW; no commit/push.


## DEMO-FILTER-BAR-20261019

Owner-authorized compact Demo filter bar with soft maroon border, light inactive tab borders/backgrounds and one-line nonwrapping status tabs; reduced search/dropdown widths align toolbar on desktop. Mobile tabs scroll internally, with existing stacked search controls retained. PASS targeted component lint,7 existing Demo page tests, disposable Edge360/1366/1440 single-line tab/alignment/no-page-overflow checks; git diff --check. IN_REVIEW. No business changes or commit/push.


## SHARED-BREADCRUMB-20261019

Owner-authorized compact shared Home/current-page breadcrumb across all tabs, roles and branches. Base height48->36px, padding10x18->6x12, text14->12px, icon17->14px, reduced gaps; existing compact/mobile visibility rules retained. Home route and aria-current semantics preserved. PASS targeted component ESLint, production build (existing chunk warning), git diff --check. Browser/full suite NOT_RUN for this small style change. IN_REVIEW; no commit/push.


## DEMO-NOTES-SPACE-20261019

Owner-authorized Demo presentation adjustment: date column18->12 percent and notes13->19 percent, shifting notes left and widening every notes cell. Removed old220px notes cap; preserved single-line ellipsis/title. Search160->192px with existing mobile full-width behavior. PASS targeted ESLint and7 existing Demo page tests; git diff --check. Browser/build NOT_RUN for this scoped style change. IN_REVIEW; no commit/push.


## SHARED-PAGE-TITLE-20261019

Owner authorizes removing the redundant shared route heading above module titles across all roles/branches. Shared PageHeader now contains compact right-aligned breadcrumb only, with reduced vertical margin and no hidden generic description; existing page main titles/descriptions move up. Courses had no own page heading, so retained its name as a semantic module-level h1. PASS11 existing Finance/Demo tests, lint/build (existing chunk warning), git diff --check. Browser/full suite NOT_RUN. IN_REVIEW; no commit/push.


## SHARED-BREADCRUMB-LEFT-20261019

Owner explicitly requested left alignment for the shared Home/current-page breadcrumb across tabs and roles. Changed only shared breadcrumb-row justification to flex-start; compact sizing and navigation preserved. PASS git diff --check. Browser/tests NOT_RUN for this one-property presentation change. IN_REVIEW; no commit/push.



## ASSETS-FLOW-20261019 - UNDONE

Owner requested reverting only the last Assets adjustment. Restored prior table widths/sidebar layout/KPI display, prior unsupported-version message and prior imports. Removed scoped asset-table CSS. Earlier Demo/shared header changes and unrelated existing Assets redesign preserved. PASS git diff --check; runtime tests NOT_RUN for this targeted reversal. No records modified.


## STORAGE-V9-RECOVERY-20261019

Owner authorizes urgent recovery of all tabs after unsupported-version errors. Read only the academy app database/organization keys from Chrome storage, saved local untracked recovery snapshots (never stage: contains owner records). Identified persisted version9 with actual saved records; current reader rejected anything beyond8. Version9 payload validates against current schema. Reader now explicitly accepts8 and9, preserving stored version9 and all collections; unknown versions and invalid records remain rejected without rewriting. No seeding, reset, downgrade, actual owner-storage writes or UI redesign. Removed3 dead Assets imports for clean lint. PASS35 database/assets tests including v9 reads, writes, preservation and invalid-record rejection; production build (existing chunk warning); isolated owner-data-copy validation and no-alert routes Courses/Students/Admissions/Faculty/Fees/Finance/Demo/Assets, isolated asset write preserves students/payments and version9. Owner should refresh the existing URL/branch. IN_REVIEW; no commit/push.


## ASSETS-LIVE-FLOW-20261019

Owner reauthorizes Assets functionality and compact non-overflowing inventory layout after previous targeted undo. Existing centralized asset services remain the data source; register/edit/assign/unassign/inspection/maintenance mutations retain persistence and branch/permission checks. Added cleaned-up focus/storage/minute refresh with latest-request guard so summaries and rows reflect saved changes. Added duplicate-submit guards. KPI loading/errors no longer masquerade as zero totals. Desktop inventory uses fixed percentage widths, compact single-line typography/ellipsis and bounded text; full details remain accessible. Existing mobile cards retained. Sidebar stacks below the table until1600px to provide readable table width. PASS37 database/asset-service/mounted-page tests, including actual UI registration/card totals and external saved inspection/value refresh; full lint0/0; production build with existing large-chunk warning; isolated Edge actual registration, persistence, table refresh and no horizontal table/page overflow at360/768/1024/1366/1440/1600px; git diff --check. Full suite NOT_RUN. No owner-record changes, no new seeding/schema change or commit/push. IN_REVIEW pending owner acceptance.


## ASSETS-RIGHT-PANEL-20261019

Owner correction: restore Quick Inspection sidebar on the right at the original xl breakpoint and22rem width. Keep compact fixed-layout inventory and reduced10px cell text; no functional/storage changes. PASS targeted lint and git diff --check; browser/tests NOT_RUN for this presentation-only correction.


## ASSETS-CHECKBOX-REMOVE-20261019

Owner requests removing Assets table selection checkboxes. Removed select-all/row checkbox cells, selection highlighting and unused bulk selection controls. Exports continue using all currently filtered inventory records. Right inspection panel unchanged. PASS targeted ESLint and git diff --check; runtime tests NOT_RUN for this small UI removal.


## ASSETS-COMPACT-ACTIONS-20261019

Owner requests moving inline Inspect/Log Repair into the three-dot menu in place of Assign Staff. Removed inline actions; menu now offers View Details, Edit Asset and condition-dependent Inspect/Log Repair, reusing existing detail/maintenance handlers. Removed duplicate maintenance action, kept staff assignment accessible in asset details. Menu width176->144px with compact11px text/padding. PASS targeted lint and2 existing Assets page tests; git diff --check. Browser NOT_RUN for this scoped menu change. No persistence/permissions changes.


## ASSETS-PAGINATION-20261019

Owner requests screenshot-style inventory footer. Reused shared Pagination with default10 rows,10/15/25/50 selector, current record range, numbered pages, previous/next and disabled bounds. Row-count changes reset page1; clamped page used after filters/deletions. Right inspection panel retained. PASS3 Assets page tests including11-record next-page and page-size reset, targeted ESLint, git diff --check. No persistence changes.


## ASSETS-ATTACHED-PAGINATION-20261019

Owner requests pagination joined to the inventory rather than a separate card. Table/mobile records, empty state and pagination now share one bordered container; no external footer gap/duplicate border. PASS targeted lint and git diff --check; runtime tests NOT_RUN for container-only change.


## ASSETS-100-PERCENT-20261019

Owner supplies80%-zoom reference and requests its compact proportions at normal100% zoom. Scoped desktop Assets presentation now uses approximately75/25 inventory/right-inspection split, compact cards/filter typography and fixed100%-total table column proportions; category tabs stay in one internally scrollable line, filters remain one row, rows retain single-line truncation with accessible Details. Reduced cell padding and icons; attached pagination preserved. No browser zoom/transform, data, status or business-rule changes. PASS targeted lint, production build (existing chunk warning), isolated fictional8-record Edge checks at1366/1440/1920 at deviceScaleFactor1, right-sidebar positioning, no table/page horizontal overflow;1440 screenshot visually inspected. Existing mobile styling retained. Runtime tests NOT_RUN for this scoped presentation pass. IN_REVIEW; no commit/push.


## ASSETS-INSPECTION-WIDTH-20261019

Owner requests wider right Quick Inspection panel and exactly2px desktop gap from inventory. Changed desktop split75/25 to70/30 with17rem sidebar minimum and xl gap2px. Existing mobile stacking retained. PASS git diff --check; tests/browser NOT_RUN for this grid-only presentation change.


## ASSETS-MAINTENANCE-TEXT-20261019

Owner requests slightly smaller maintenance list and balanced warning colors. Reduced heading/name11->10px and panel padding; red heading/dots/asset codes retain warning emphasis, asset names use readable slate and locations muted slate. No data/layout flow changes. PASS targeted lint and git diff --check; runtime tests NOT_RUN for styling-only change.


## ASSETS-MENU-COLORS-20261019

Owner requests narrower asset action menu, individual icon colors and maroon hover. Width144->128px including placement calculation. View sky, Edit violet, Inspect emerald; maroon hover/focus text with pale maroon background, icon colors retained. PASS targeted lint and git diff --check; runtime tests NOT_RUN for presentation-only change.


## ASSETS-KPI-COLORS-20261019

Owner requests Assets summary cards use the existing cross-module card color treatment. Reused shared top-kpi-card class for existing maroon/emerald/sky/amber gradients, borders and hover/dark/mobile rules. Existing totals, urgent indicator, sizing and icons preserved. PASS targeted lint and git diff --check; browser/tests NOT_RUN for shared-class styling change.


## DEMO-SUMMARY-HEIGHT-20261019

Owner requests slightly shorter Demo KPI cards and moving them upward. Reduced content vertical padding/internal gaps and page/header spacing. Single-line footer ellipsis prevents long pending-room text stretching all cards; room tooltip retains full text. Existing metrics/colors/business behavior preserved. PASS7 existing Demo page tests, targeted lint and git diff --check. Browser NOT_RUN for this scoped spacing change.


## DEMO-SUMMARY-LABELS-20261019

Owner requests removing hall/batch text from Pending Trial Slots and black headings on all four Demo KPI cards. Removed room display/unused calculation and changed only heading text color to near-black. Counts and other footer metrics preserved. PASS targeted lint and git diff --check; runtime tests NOT_RUN for this small presentation change.


## ASSETS-SEARCH-WIDTH-20261019

Owner requests slightly shorter Assets search. Reserve12px extra right spacing on desktop search wrapper, reducing its flexible input width by12px while preserving filter sizes and mobile layout. PASS git diff --check; runtime tests NOT_RUN for spacing-only adjustment.


## ASSETS-SEARCH-ACTUAL-WIDTH-20261019

Owner clarifies actual search box width rather than typography. Replaced prior extra margin approach with desktop width40% and no flex growth on search wrapper. Input font unchanged, mobile flexible width preserved. PASS git diff --check; browser/tests NOT_RUN for this sizing-only correction.


## ASSETS-CATEGORY-TINTS-20261019

Owner requests icon-matching light backgrounds on inactive category tabs and maroon hover. Reused existing category palette for blue/amber/teal/violet tint/text, with pale maroon hover/focus and maroon text. Active tab stays solid maroon; counts/filter behavior unchanged. PASS targeted lint and git diff --check; browser/tests NOT_RUN for styling-only change.


## ASSETS-FILTER-WIDTHS-20261019

Owner requests wider Rooms and Condition controls without changing search width or displacing Sort. Desktop dropdown widths135->144px each; reduce three row gaps8->2px to offset18px added width, keeping search and Sort alignment. Existing mobile layout unchanged. PASS git diff --check; browser/tests NOT_RUN for scoped CSS adjustment.


## ASSETS-FILTER-TRIGGER-CORRECTION-20261019

Owner clarifies visible filter boxes should widen, opened menus should shrink. Rooms/Condition desktop triggers now responsive150-176px; their popup menus bounded160px. Search remains unchanged40%. PASS targeted lint and git diff --check; browser NOT_RUN for this small correction.


## ASSETS-FILTER-GAP-20261019

Owner requests a little spacing between visible filter controls. Desktop filter row gap2->6px; widths/font unchanged. PASS git diff --check; browser/tests NOT_RUN for one CSS property.


## ASSETS-SORT-MENU-WIDTH-20261019

Owner requests narrower opened Sort Tag menu. Bounded only its popup width128px instead of min140px; visible trigger/search/filter widths unchanged. PASS git diff --check; runtime tests NOT_RUN for sizing-only change.


## ASSETS-ROOM-CONDITION-MENUS-20261019

Owner requests slightly wider Rooms/Condition opened menus. Popup widths160->176px only; trigger, search and Sort popup unchanged. PASS git diff --check; tests/browser NOT_RUN for width-only change.


## ASSETS-SORT-TRIGGER-20261019

Owner requests narrower visible Sort Tag control. Set90px width with desktop override; opened Sort menu and other controls unchanged. PASS git diff --check; tests/browser NOT_RUN for width-only change.


## ASSETS-FILTER-FONT-WEIGHT-20261019

Owner requests slightly bolder search placeholder and Rooms/Condition/Sort trigger text. Scoped font-weight600 on those controls only. Widths, sizes and spacing preserved. PASS git diff --check; tests/browser NOT_RUN for typography-only change.


## ASSETS-SORT-POPUP-COMPACT-20261019

Owner explicitly identifies opened Sort popup. Reduced popup128->112px only; trigger and other controls unchanged. PASS git diff --check; tests/browser NOT_RUN for width-only adjustment.


## ASSETS-CONTROL-SPACING-20261019

Owner requests visible gaps between Rooms, Condition and Sort boxes. Desktop filter gap6->10px and prevent dropdown wrappers shrinking below their trigger width (which could visually erase the flex gap). Search dimensions and trigger/menu widths unchanged. PASS git diff --check; tests/browser NOT_RUN for scoped CSS change.


## ASSETS-FILTER-ROW-FIT-20261019

Owner reports Sort overflow after added gaps. Desktop filter row now uses bounded grid columns: search40%, two flexible dropdowns and Sort90px, with6px gaps. Trigger wrappers/labels fit their tracks rather than overflowing fixed widths. Mobile unchanged. PASS isolated Edge1280/1366/1440/1920 same-row, visible gaps and Sort-inside-panel checks; git diff --check. No functional changes.


## ASSETS-FILTER-LABELS-20261019

Owner requests shorter default filter labels: All Rooms and All Conditions. Updated matching options/placeholders only; filtering values/behavior unchanged. PASS git diff --check; tests NOT_RUN for text-only change.


## REPORTS-HEADER-ACTIONS-20261019

Owner requests removing pictured Batch Schedule Summary and Export Active Report header buttons. Removed their header action group only; existing report contents and other export actions preserved. PASS git diff --check. Targeted lint FAIL: current Reports file has9 errors/2 warnings including preexisting unused Check/setPageSize and rowsFormatted assignments; unrelated cleanup not included. Runtime tests NOT_RUN for this button-only removal.


## REPORTS-CATEGORY-STYLING-20261019

Owner requests pale maroon bordered report category options with relevant icons and improved hover. Added semantic icons via existing TAB_CONFIG and imported Lucide components, light maroon inactive tabs/container/badges, deeper maroon hover, preserved solid active state; added pressed state and focus ring. Filtering/count logic unchanged. PASS production build (existing chunk warning) and git diff --check. Lint not rerun: previous Reports9 errors/2 warnings remain documented; runtime tests NOT_RUN for this presentation change.


## REPORTS-CATEGORY-COLORS-20261019

Owner requests distinct category icon colors with matching pale option backgrounds. Added emerald/sky/violet/amber/indigo/teal/rose/orange palettes and matching badge colors through existing tab config. Active maroon/white and maroon hover retained. PASS production build (existing chunk warning), git diff --check. Browser/tests NOT_RUN; existing Reports lint issues unchanged.


## REPORTS-DROPDOWN-ANCHOR-20261019

Owner reports all filter menus opening away from their fields. Root cause shared CustomSelect lets containerClassName replace default relative positioning (Reports passes w-full). Always retain relative class on the shared wrapper while preserving consumer classes; absolute menus now anchor below their own triggers. PASS shared component ESLint and isolated Edge five Reports filter dropdown geometry/escape checks at390/1366/1440px (15 menu openings); git diff --check. No filter/business changes.


## REPORTS-SESSION-LABEL-DATE-20261019

Owner requests automatic month/year on Current Session option. Replaced hardcoded Oct2025 with Intl month/year in Asia/Karachi; minute timer/focus refresh and cleanup support open-page month/year rollover. This ticket changes label only; actual academic-session filter dates remain unconfigured as previously reported. PASS production build (existing chunk warning), isolated UTC-browser clock test Dec2026->Jan2027 at Karachi midnight, git diff --check. Existing Reports lint issues unchanged; full tests NOT_RUN.


## REPORTS-KPI-COLORS-FIT-20261019

Owner requests shared colorful KPI backgrounds and smaller nonbreaking content for every Reports category. Reused shared top-kpi-card gradients/borders/hover, reduced padding and label/value/subtext sizes, constrained content tracks with min-width0, single-line ellipsis and full-text titles. Existing metric values/calculations preserved. PASS build (existing chunk warning), isolated Edge all8 category card groups at390/1366/1440: contained single-line content; git diff --check. Lint/full tests NOT_RUN; earlier Reports lint issues documented.


## REPORTS-KPI-HEIGHT-20261019

Owner requests slightly taller Reports KPI cards. Shared card renderer now min-height136px for all categories, preserving compact nonwrapping typography and existing colors/metrics. Existing mobile minimum-height override retained. PASS git diff --check; browser/tests NOT_RUN for one-class sizing change.


## REPORTS-KPI-HEIGHT-TUNE-20261019

Owner requests slightly reducing the preceding height increase. Reports KPI minimum136->124px only; content/colors unchanged. PASS git diff --check; tests/browser NOT_RUN for sizing-only correction.


## REPORTS-KPI-HEIGHT-FINAL-TUNE-20261019

Owner requests another small height reduction. Reports KPI minimum124->116px only. PASS git diff --check; tests/browser NOT_RUN for sizing-only correction.


## REPORTS-KPI-CONTENT-ALIGN-20261019

Owner requests content aligned to reduced KPI height and bolder single-line numbers. Vertically centered KPI content within116px card,17px extra-bold main values, semibold subtext and tighter line-height/consistent spacing; preserved nowrap/ellipsis/full-text title. PASS build (existing chunk warning), isolated Edge all8 category groups at390/1366/1440 fit/single-line checks, git diff --check. Existing Reports lint findings unchanged.


## REPORTS-COHORT-LABEL-20261019

Owner requests shorter default selected-cohort card text. Changed All Cohorts / Batches to All Cohorts. No filtering/calculation changes. PASS git diff --check; tests NOT_RUN for text-only adjustment.


## REPORTS-KPI-POSITIONS-20261019

Owner requests heading top-left, icon/gauge top-right, main value centered between header/footer and subtext at bottom. Reorganized the shared KPI renderer into three grid rows; preserved116px minimum, nowrap/full-text titles, existing metrics and colors across all categories. PASS build (existing chunk warning), isolated Edge all8 category groups at390/1366/1440 containment/single-line checks, git diff --check. Existing Reports lint issues unchanged.


## REPORTS-KPI-VALUE-LEFT-20261019

Owner clarifies middle value must be left aligned while vertically centered between top heading and bottom subtext. Changed main-value alignment center->left only across all Reports categories. PASS git diff --check; tests/browser NOT_RUN for alignment-only correction.


## REPORTS-KPI-VALUE-UP-20261019

Owner requests middle KPI value slightly higher. Applied4px upward translation only to the main value; left alignment, heading/footer positions unchanged. PASS git diff --check; tests/browser NOT_RUN for minor positioning adjustment.


## REPORTS-KPI-VALUE-EMPHASIS-20261019

Owner requests main KPI value slightly higher, larger and bolder. Upward offset4->8px, font17->19px and weight800->900; nowrap/truncation and left alignment retained. PASS git diff --check; tests/browser NOT_RUN for typography/offset-only adjustment.


## REPORTS-KPI-VALUE-SIZE-20261019

Owner requests another small main-value size increase. Reports KPI font19->21px only; existing boldness/position/nowrap preserved. PASS git diff --check; tests/browser NOT_RUN for size-only adjustment.


## REPORTS-KPI-HEADING-EMPHASIS-20261019

Owner requests slightly larger, bolder black top headings. Shared Reports KPI label9->10px, weight700->800, slate600->950; single-line fitting and full-text title retained. PASS git diff --check; tests/browser NOT_RUN for typography-only adjustment.


## REPORTS-KPI-HEADING-COLOR-RESTORE-20261019

Owner requests reverting only the black heading color. Restored slate600 while retaining latest heading size/weight. PASS git diff --check; tests NOT_RUN for color-only adjustment.


## REPORTS-KPI-HEADINGS-FULL-20261019

Owner requests fixing clipped top labels such as Classrooms Occupied and Challan Recovery Rate. Slightly smaller long labels/tighter tracking, compact32px icons/gauges, narrower header gap; changed medium desktop to3 columns before xl5 for usable title width. Removed heading ellipsis; retained full single-line text. Scoped mobile8px heading override compensates shared KPI typography. PASS full heading scrollWidth/clientWidth checks for every8 Reports category at390/1024/1280/1366/1440, production build (existing chunk warning), git diff --check. No metric/data changes; existing Reports lint findings unchanged.


## REPORTS-FILTER-FOOTER-EXPORT-20261019

Owner requests compact colored filter section with hover, attached rows-per-page footer and table-header PDF/spreadsheet export icons. Reduced filter padding/control heights/label sizes, pale maroon background/borders/hover. Reused shared Pagination (default10,10/15/25/50, ranges, numbered pages) inside report table container. Reused toolbar PDF/CSV icons connected to existing filtered/selected exports. Updated obsolete test expecting owner-removed Schedule Summary button to current header/export/pagination assertions; no skipped tests. PASS4 Reports tests, build (existing chunk warning), disposable browser page-size selection/filter menu and actual PDF/CSV downloads; git diff --check. Existing Reports lint findings unchanged, full suite NOT_RUN. No business/filter logic or owner-data modifications.


## REPORTS-ACTION-FEEDBACK-20261019

Owner requests Reset/Print color treatments and investigation of Refresh. Existing Refresh already re-fetches overview but offered no loading/success feedback. Added scoped refresh generation state, disabled/spinning refresh button while loading, selected-row clearing and accessible success announcement; preserved filters. Reset amber, Print sky, Refresh violet with pale maroon hover. Added integration test proving newly saved branch asset appears only after refresh and overview re-fetches. PASS5 Reports tests, build (existing chunk warning), isolated browser actual new saved record refresh/success plus print handler invocation; git diff --check. Existing unrelated Reports lint findings unchanged. No owner records touched.


## REPORTS-WORD-EXPORT-20261019

Owner requests pictured Word/Google Docs-compatible export beside PDF. Added blue Word document action producing genuine.docx Office Open XML without new dependencies. Shares exact PDF row formatting and filtered/selected scope; exports report title, branch and filter summary. Text escaped and invalid XML controls stripped; files are local downloads, not automatic Google Drive uploads. PASS6 Reports/Word tests, targeted new helper lint, production build (existing chunk warning), disposable browser selected-row download, Python ZIP CRC/all XML parsing and exactly header+one selected table row; git diff --check. Native Word/Google Docs import UI NOT_RUN. Existing unrelated Reports lint issues remain. No owner data changes.


## REPORTS-SEARCH-HEADER-20261019

Owner requests wider report quick-search/larger text and Showing-records below ledger title. Search widths224/288/320px responsive,13px input text and36px height; record count now under title in vertical heading group. Existing export/refresh/search behavior unchanged. PASS git diff --check; tests/browser NOT_RUN for presentation-only adjustment.


## REPORTS-SEARCH-ICON-20261019

Owner requests slightly larger aligned quick-search icon. Icon13->16px, vertically centered with pointer-events disabled and input left padding40px to prevent text overlap. PASS git diff --check; tests/browser NOT_RUN for icon-only adjustment.


## REPORTS-TOOLBAR-LABELS-20261019

Owner requests labels alongside other toolbar icons like Word. Added optional showLabels flag to shared PDF/CSV actions (defaultfalse, enabled Reports only), with PDF/Excel labels and compact rounded buttons; Print/Refresh now have visible labels. Existing handlers/aria labels preserved. Toolbar wraps within bounds on narrow screens. PASS shared helper lint and production build (existing chunk warning); git diff --check. No export logic changes.


## REPORTS-BOTTOM-EXPORT-REMOVE-20261019

Owner requests removing the pictured Ready to Export Filtered Cohort Data bottom section. Removed only duplicate bottom export card; table-header PDF/Excel/Word/Print/Refresh actions remain. PASS git diff --check; tests/browser NOT_RUN for section-only removal.

## REPORTS-TABLE-FIT-20261019

Owner authorizes compact Reports ledger sizing at normal100% browser zoom using supplied80% screenshot as reference. Scoped desktop-only ledger CSS reduces cell padding, primary/secondary typography, avatars and search dimensions; automatic table column sizing and bounded horizontal scrolling retained. No data/action/export changes or browser zoom manipulation. Status: IN_REVIEW pending owner visual acceptance. PASS production build (existing chunk warning) and git diff --check. Browser visual comparison NOT_RUN. Reports tests attempted but runner stalled without results and was interrupted; no test pass claimed.

## REPORTS-DONUT-SIZE-20261019

Owner requests slightly larger Reports donut. Chart container128->144px, outer radius56->64px and inner radius34->39px preserve ring proportions. Existing data/colors/legend retained. IN_REVIEW pending owner visual acceptance. Runtime tests/build/browser NOT_RUN for sizing-only change; git diff --check PASS.

### REPORTS-DONUT-SIZE-20261019 � Further size adjustment

Owner requests another small increase: container144->160px, outer radius64->72px, inner radius39->44px. IN_REVIEW pending visual acceptance. PASS git diff --check; build/runtime tests/browser NOT_RUN for sizing-only adjustment.


## REPORTS-LEFT-TREND-20261019 - Left analytics card redesign

Scope: only Reports left-card redesign. Evidence: all8 tabs; filtered ledger IDs and branch-scoped dated events; validated custom dates; zero/undated/sparse states; wrapped controls; preserved160px right donut and ledger workflows. PASS20 tests, lint0/0, build,32 tab/viewport checks and actual PDF/CSV/DOCX downloads/print/refresh. IN_REVIEW pending owner acceptance. No dependencies added. Current Session date boundaries remain unconfigured and disclosed.


## REPORTS-LEGEND-COLORS-20261019

Owner requests individual dot-matching pale backgrounds for donut legend rows and pale maroon header icon background with maroon icon. Reused existing segment hex palette with8-percent background/20-percent border alpha across categories; updated only right chart header icon colors. Data, sizes and chart behavior preserved. IN_REVIEW pending owner visual acceptance. PASS targeted Reports ESLint and git diff --check; build/tests/browser NOT_RUN for color-only change.


## REPORTS-TREND-SUMMARY-20261019

Owner requests reference-style summary items on the left chart in every Reports tab and asks why Week/Month/Year show one dot. Added3 real filtered-ledger summary items per tab with softly tinted circle icons: fees recovery/total/balance; students total/active/provisional; admissions total/approved/pending; batches weighted fill rate/saved capacity/remaining seats; faculty distinct instructors/weekly hours/assignments; finance inflow/outflow/net; demos total/converted/awaiting; assets records/book value/maintenance. Unknown ratio denominator shows Not available; no invented targets. Summaries are explicitly labeled ledger snapshots; custom chart dates apply only above. Single calendar-period data now renders actual total as a bar with an explanation; multiple periods retain area chart. No fabricated timestamps/history, right-card or ledger/export changes. Updated ambiguous table-header test to use semantic columnheader query after summary introduced same label. PASS31 tests, touched-file lint0/0, production build (existing chunk warning), git diff --check; isolated Edge32 tab/viewport fits and3 summary items per tab at320/390/1366/1440; all grouping controls produce single-period bars with QA receipt, custom range/tooltip/right donut/export/refresh/print checks. Screenshots/evidence: artifacts/reports-trend-summary-20261019. QA browser context isolated; owner data unchanged. Full suite/physical devices NOT_RUN. IN_REVIEW pending owner visual acceptance; no commit/push.


## FEES-KPI-FOOTERS-20261019

Owner requests screenshot-style bottom details on Fees tab top cards with correct live flow. Added recovery percentage/progress bar relative to actual issued fees and Monday-to-date collected amount; distinct unpaid-student and unpaid-challan counts; current Overdue status student/challan counts and View All action that clears search/resets pagination/selects existing Overdue filter; today verified receipt count. Main totals and footers share one branch-scoped helper. Today receipt amount/count use Asia/Karachi boundaries. Existing all-time Total Collected label and current overdue status rules retained (no invented YTD/15-day threshold, quota target, weekly growth claim, SMS automation or cohort average). Existing create/payment/refresh flow recalculates cards from saved overview. PASS8 helper/financial-service tests, touched-file ESLint0/0, production build (existing chunk warning), git diff --check, isolated Edge actual20-percent recovery, receipt count, two-student overdue View All/table flow and1440/1366/390/320 card-fit checks. Screenshot evidence: artifacts/fees-kpi-footers-20261019. Test records only in disposable browser context; owner data untouched. Full suite/physical devices NOT_RUN. IN_REVIEW pending owner acceptance; no commit/push.


## REPORTS-LEFT-COMPACT-20261019

Owner clarifies Reports left chart card: reduce height and anchor summary at the very bottom. Converted only trend card to flex-column, summary margin-top:auto, plot210->160px, reduced outer padding/header/footer gaps and summary padding/icons. Existing right donut and data logic unchanged. PASS3 focused component tests, targeted lint0/0, git diff --check; isolated Edge32 tab/viewport fit/control/export/right-card checks, plus explicit1440/390 footer geometry:13px bottom inset and160px plot. Screenshots: artifacts/reports-left-compact-20261019. Build/full suite NOT_RUN for spacing-only change. IN_REVIEW pending owner visual acceptance; no owner data changes/commit/push.


## REPORTS-TREND-TEXT-REMOVE-20261019

Owner requests removing the left-chart dates/grouping/timezone/event-count footer and single-period explanatory paragraph. Removed those display blocks and unused windowLabel prop/call site. Updated existing component assertions to reflect owner-requested text removal; preserved real bar/area data, controls, tooltip, summary and session warning. PASS3 component tests, touched-file lint and git diff --check. Build/browser NOT_RUN for text-only removal. IN_REVIEW pending visual acceptance.


## REPORTS-CHART-HEIGHT-TUNE-20261019

Owner requests slightly shorter left Reports card with taller internal chart. Plot160->180px; reduced outer vertical padding, header/metric/footer gaps, summary padding and header icon size to offset chart growth and compact total height. Bottom summary remains anchored. Right card/data unchanged. PASS targeted ESLint, git diff --check, isolated Edge1440/390 geometry checks: plot180px, footer9px bottom inset, card365.5px desktop/518.5px mobile. Screenshots under artifacts/reports-left-compact-20261019. Build/runtime suite NOT_RUN for spacing-only change. IN_REVIEW pending visual acceptance; no owner-data changes or commit/push.


## REPORTS-LEFT-HEIGHT-20261019

Owner requests another slight left-card height reduction. Reduced vertical card padding8->4px per side and metric/plot/footer gaps4->2px; chart remains180px, bottom summary alignment retained. No right-card/data changes. PASS targeted lint and git diff --check; build/tests/browser NOT_RUN for spacing-only adjustment. IN_REVIEW pending visual acceptance.


## REPORTS-LEFT-COMPACT-TUNE-20261019

Owner requests further compact height with adjusted content. Combined chart total label/value into a wrapping baseline row; tightened header typography and custom-date top gap. Plot remains180px and summary stays bottom-aligned. PASS targeted lint, git diff --check and isolated Edge1440/390 checks: card324.5/477.5px, footer5px inset, plot180px. No data/right-card changes. Build/tests NOT_RUN for presentation-only adjustment. IN_REVIEW pending visual acceptance.


## REPORTS-INNER-CHART-HEIGHT-20261019

Owner explicitly requires unchanged left-card height with taller actual graph. Kept180px chart container and all surrounding layout unchanged; reduced graph top margin8->2px and X-axis reserved height30->18px, tick margin10->3px/font10->9px. Actual drawing area142->160px (+18px) without resizing card. PASS targeted lint, git diff --check and isolated Edge before/after at1440/390: card remains324.5/477.5px, footer inset5px; drawing area142->160px on both. Evidence: artifacts/reports-inner-chart-height-20261019. Data, controls/right card unchanged. Build/tests NOT_RUN for axis-spacing-only change. IN_REVIEW pending visual acceptance.


## REPORTS-SUMMARY-BG-20261019

Owner requests nicer backgrounds on left-chart summary cards. Added pale maroon/emerald/amber fills and matching borders by summary position across Reports tabs. Existing icon colors, dimensions, chart height and data preserved. PASS targeted lint and git diff --check; tests/build/browser NOT_RUN for color-only change. IN_REVIEW pending visual acceptance.


## REPORTS-PLOT-EXPAND-20261019

Owner requests taller chart without taller card. Reflowed bottom summary label/value into compact single rows with full-text titles and preserved tinted backgrounds, reduced summary padding/icons. Redistributed recovered space to plot: desktop180->196px, mobile180->228px. PASS isolated Edge before/after: outer card unchanged324.5px desktop/477.5px mobile; drawing area160->176px desktop/160->208px mobile; bottom summary5px inset preserved. PASS3 component tests, targeted lint and git diff --check. No data/right-card changes. Build/full suite NOT_RUN for scoped layout change. IN_REVIEW pending visual acceptance. Evidence: artifacts/reports-inner-chart-height-20261019/expand-check.cjs.


## BRANCH-KPI-STYLE-20261019

Owner requests slightly taller Branch Management summary cards and cross-tab colors. Reused shared top-kpi-card class for maroon/emerald/sky gradients, borders and hover. Added104px minimum content height with16px padding for the3 summary cards only. Existing labels/counts/icons and branch directory cards unchanged. PASS targeted lint and git diff --check; build/tests/browser NOT_RUN for presentation-only change. IN_REVIEW pending visual acceptance.


## REPORTS-DONUT-FIT-20261019

Owner requests larger donut within unchanged section height. Retained160px chart container and surrounding layout; outer radius72->78px, inner44->48px, giving156px donut diameter inside existing160px space. Data/legend/card dimensions unchanged. PASS targeted lint and git diff --check; browser/build/tests NOT_RUN for radius-only change. IN_REVIEW pending visual acceptance.


## BRANCH-KPI-TEXT-20261019

Owner requests larger text in Branches summary cards. Headings11->13px with slightly tighter tracking; values20->24px. Existing104px minimum height, backgrounds, icons and calculations preserved. PASS targeted lint and git diff --check; browser/build/tests NOT_RUN for typography-only change. IN_REVIEW pending visual acceptance.


## BRANCH-CREATION-PAUSE-20261019

CONFIRMED owner instruction: client currently agreed two branches; preserve all existing saved branches, but pause ALL new branch creation including Super Admin until owner explicitly requests re-enabling. This supersedes currently available frontend creation behavior; it does not delete extra existing branches, alter their assignments, or authorize new subscription/license infrastructure. Added centralized source-controlled branch-creation pause policy with no user-facing enable switch; Add Branch disabled even before data loads with visible explanation. Organization service rejects creation after authorization and rejects unknown IDs to prevent creation disguised as edit. Existing branch viewing/editing/lifecycle remain available under existing rules. No storage migration/reset or owner-record writes. Existing configured license count is not changed by this temporary pause.

PASS10 organization service tests covering Super Admin/new creation rejection, exact stored organization and assignment preservation, existing-branch edits/lifecycle, unknown-ID bypass rejection, other-role denial and staff/settings regressions. Replaced superseded positive-creation/limit tests; existing branch fixtures now seed test storage only. PASS touched-file ESLint0/0, production build (existing chunk warning), git diff --check; disposable Edge disabled Super Admin Add Branch, direct service denial, preservation of3 QA branches and existing edit enabled. Evidence: artifacts/branch-creation-pause-20261019. Full suite NOT_RUN. This is frontend/mock-service enforcement; production backend enforcement remains a later authorized task. IN_REVIEW pending owner acceptance; no commit/push.


## BRANCH-EDIT-DELETE-20261019

Owner-authorized scope: edit existing branch details (including core display details); confirmed deletion only for empty inactive branches after confirmation. Acceptance evidence: persisted edits preserve IDs and records; unique name/code validation; active branch/canonical current branch deletion denied; all14 operational collections and all enabled/disabled staff assignments checked; deleted branches remain gone after reload; organization-write failure restores database bytes. Creation pause remains enforced. PASS80 relevant tests, lint/build/browser. IN_REVIEW.


## BRANCH-STATUS-NAME-20261019

Authorized: remove core branch toggle disablement; provide actual activate/deactivate persistence, actionable failures and name-only edit. Existing Add Branch pause and empty-inactive deletion rule remain. Evidence: core toggles both directions/reload, saved name override survives status changes, other metadata cannot change through name edit, current branch/unfinished operations remain protected, busy state and branch-context refresh. PASS53 tests, lint/build/browser. IN_REVIEW.


## BRANCH-DELETE-ADMIN-EXCEPTION-20261019

Authorized exception: Super Admin-only assignments no longer block empty inactive branch deletion. Mixed Super Admin plus staff roles, disabled staff assignments and all14 linked-record collections remain blockers. Confirmation, inactive/current-branch protections, Add Branch pause and name-only editing preserved. Tests/browser verify access cleanup without account deletion or other-branch access changes. PASS55 tests, lint/build. IN_REVIEW.


## BRANCH-PLACEHOLDER-TEXT-20261019

Owner asks meaning/removal of pictured DEMO code and Demo campus location. Removed generic/missing placeholders from branch card display; real saved codes/locations remain. Missing location also omits its map icon/separator. No persisted branch fields or workflows changed. PASS targeted lint and git diff --check; build/tests/browser NOT_RUN for display-text-only change. IN_REVIEW pending visual acceptance.


## BRANCH-DELETE-BLOCKER-DETAILS-20261019

Owner reports generic linked-record error and asks why deletion is blocked. Deletion check now reports exact nonzero counts for every linked collection (courses, fields, subjects, batches, students, admissions, enrollments, scheduled classes, fee challans, payments, expenses, demo inquiries, assets, faculty assignments). No deletion policy/data mutations changed. Actual owner branch records were not accessed; exact cause will display on retry. PASS20 organization tests, targeted lint and git diff --check; build/browser NOT_RUN for error-message-only change. IN_REVIEW.


## BRANCH-CARD-CLEANUP-20261019

Authorized branch card cleanup: no eye/View action, distinct stable soft gradients and no retained d backup data. Dedicated purge folder removed and5 historical recovery snapshots selectively cleaned. PASS targeted lint, production build (existing chunk warning), git diff --check, no target ID in local recovery JSON/JSONL/BAK files, isolated Edge distinct gradients/no View action, name-only edit/status persistence and continued creation pause/mobile form fit. IN_REVIEW.


## REMOVE-WORKSPACE-FLOW-20261019

Owner explicitly authorizes removing the obsolete Workspace screen and all shipped source references. Root always redirects to login, including with a restored demo session. Successful login opens Dashboard directly for one branch or after branch selection. Removed WorkspacePage and route; obsolete URL now uses existing Not Found handling. Renamed shared shell CSS/theme tokens to app-* and baseline permission to dashboard.view with unchanged assigned-role/branch checks. Preserved historical records and unrelated in-progress changes. Branch-switch keyboard focus survives Dashboard shell remounts. IN_REVIEW pending owner acceptance.

Verification addendum:87 focused tests pass across final per-file runs; lint/build/browser/diff pass. Full suite initially479/495, with10 permission-test rename failures corrected and6 broader stale UI expectation failures remaining; full suite not rerun. See PROGRESS REMOVE-WORKSPACE-FLOW-20261019.


## BRANCH-SUMMARY-BG-20261019

Owner requests improved background for branch courses/batches/students count strip. Replaced translucent white fill/border with subtle6% maroon fill and10% maroon border; existing dimensions, card colors and behavior preserved. Changed BranchesPage.jsx only. PASS targeted ESLint and production build (existing chunk-size warning). Unit/browser tests NOT_RUN for styling-only change. IN_REVIEW pending visual acceptance; no commit/push.


## BRANCH-CARD-SIZE-20261019

Owner authorizes taller branch cards and larger text. BranchesPage branch cards now have190px minimum content height (200px at sm+),20px padding,18px branch title and14px metadata/count strip with12px status badge. Count strip aligns at bottom; header/counts wrap on narrow screens. Existing gradient/maroon strip and all actions/data unchanged. PASS targeted ESLint, production build (existing chunk warning), existing isolated browser desktop/mobile route and login checks. Unit tests NOT_RUN for styling-only change. IN_REVIEW pending visual acceptance. No commit/push.


## FRONTEND-PERF-20261019 (continued 2026-10-20)

IN_REVIEW. Owner attachment explicitly authorizes scoped frontend performance work directly on dev, preserving all existing uncommitted changes. No backend, dependencies, persistent schema changes, data migration, UI redesign, commit or push. Lightweight inspection found eager page imports, repeated normalization/validation/JSON work and repeated per-challan payment scans; no artificial loading delay was found. Real Web Locks, permission rechecks, loading/error states and branch scope remounts remain.

Implemented lazy protected page boundaries, cached module promises and authorized sidebar hover/focus preloading. Added a bounded detached normalized database snapshot keyed by current raw database and organization values, storage identity and existing read-mode flags. Writes invalidate it; every read still checks actual storage, including external changes. Added detached organization parse snapshot with raw comparison and write invalidation. No cached permission grant or financial result bypass. Reports verified payments now use one memoized challan index, preserving status/order/formula semantics. Faculty UI regression test awaits loaded roster data instead of only its pre-data heading.

Changed application/test files: src/routes/{AppRouter.jsx,ProtectedRoute.jsx,routeModules.js}; src/components/Layout/Sidebar.jsx; src/mock/{mockDatabase.js,mockOrganization.js,storagePerformance.test.js}; src/pages/Reports/ReportsPage.jsx; src/pages/FacultyClasses/FacultyClasses.test.jsx. All other existing edits retained.

PASS targeted ESLint, production build (one final production build executed), git diff --check. Entry JS chunk322.93KB (gzip102.17KB), formerly2846.16KB (gzip1131.26KB); remaining exportHelpers1171.90KB chunk still warns. This is entry chunk size, not total app transfer or a claimed89% latency improvement.

Full Vitest executed ONCE:493/500 pass,7 fail. Six pre-existing mismatched expectations remain (AdminOperations branch-create and removed Branch Comparison, plus four Student Profile heading expectations; also present before this task). The seventh was a faculty test reading roster before loading completed; changed to await the actual student. Focused follow-up9/9 pass including all4 faculty screen tests and5 cache contract tests. All other full-suite tests pass, including auth, finance/payments, admission/enrollment, faculty service, dashboard daily classes, reports/filter/chart and export tests. No second full suite run. Earlier test-only cache guard test was corrected to use authorized academic adapter rather than the generic collection primitive; canonical guard then passes.

PASS isolated Edge155.0.4283.62 four-role allowed-module and restricted-route QA, all8 report tabs and all5 grouping modes, custom start/end dates, actual CSV/PDF downloads, mobile390px no document overflow, mobile drawer navigation and branch edit dialog; no browser page errors. Owner's browser/storage never touched. Existing disabled/denied navigation entries are preserved; e.g. Teacher fees/finance direct routes deny access.

Performance evidence/methodology and limitations are in artifacts/frontend-perf-20261019/REPORT.md and JSON. Results are mixed: do not claim universal navigation/modal/refresh speedup or under100ms compliance. Synthetic throttling/large production datasets and exhaustive manual role workflow acceptance NOT_RUN. Owner acceptance remains required; no production security claim.

Final evidence: artifacts/frontend-perf-20261019/REPORT.md. Paired end-to-end warm median158->164ms (no gain), Reports tabs203.5->192ms, search94->81ms, branch482->450ms, modal151->285ms, refresh984->1183ms; mixed outcomes explicitly disclosed. Controlled100-read adapter check34.1->22.2ms. No universal speed/under100ms claim. Ticket remains IN_REVIEW.


## TAB-LOADING-FIX-20261020

ACTIVE / IN_REVIEW pending final verification and owner browser acceptance. Owner attachment explicitly authorizes fixing repeated loading/flicker and all seven previously reported test failures directly on dev. No new branch/worktree, dependency, backend, schema change, redesign, commit or push. Existing Reports charts and all unrelated working changes preserved.

Reproduced in isolated Edge155: page remounts reset loaded data to null/empty/loading and re-enter async Web Lock/service reads. Visible sources: SuperAdminDashboard Loading dashboard; AdmissionsPage Loading admissions plus NewAdmissionForm Loading academic configuration; FacultyClassesPage State Loading Faculty & Classes; CoursesBatchesPage microtask setData(null); FeesPage Loading fee records. Students/Finance/Demos/Assets had the same null-state pattern. Providers remain above routes and do not remount on ordinary navigation. Lazy fallback reused SessionStatus auth-restoration text even for genuine module loading; fallback text now distinguishes uncached module loading.

Implemented bounded24-entry detached presentation snapshots in services/localPageResources.js, populated only by successfully loaded page data. Initialization checks canonical raw database, organization, session and current Karachi/UTC dates. Any change discards all snapshots; older in-flight reads cannot repopulate a changed version. Existing services/locks/auth checks still revalidate on every mount; no async loader is hidden when data is actually unavailable. Raw snapshot input is never written by this helper. Logout explicitly clears retained page data; test teardown clears transient snapshots for isolation. Only data is reused: filters, dialogs, pagination and unsaved forms retain their existing reset behavior. Genuine initial/cache-miss/dirty-scope/error/loading states remain. Admission form reference data uses the same guard. Snapshot restore resets transient request/scope markers to the current mount, preventing cached requests from looking perpetually pending.

Edge frame sampling: two warm rounds through Dashboard/Admissions/Students/Faculty/Courses/Reports/Fees rendered14/14 transitions without a loading frame or blank frame. First uncached visits retain genuine loading. Broader acceptance includes13 modules, mobile drawer routes, refresh, branch switching, logout/login and actual disposable enrollment, verified payment and faculty assignment writes. No owner browser profile or saved owner data touched. Initial document bootstrap/refresh may still contain empty pre-React frames; no blanket no-blank claim for cold loads.

Previous failing tests investigated: branch creation intentionally paused (test now verifies disabled creation plus real name-only edit/persistence); removed Branch Comparison replaced by current Reports tabs/columns; Student Profile generic heading replaced by the actual loaded Student details label (CardTitle is a div, not heading); faculty test already waits for loaded roster. No tests removed/skipped, no production feature removed to pass tests. Focused final33/33 PASS. New page-resource tests cover raw DB/org/session changes, out-of-band writes, stale in-flight generations, detached data, bounded retention, logout and unavailable storage. Warm component test checks valid local data stays visible during service revalidation and genuine error still renders.

Full Vitest running ONCE after fixes, using one worker to avoid measured jsdom/transform contention; final result to be appended. Full ESLint0 errors/warnings PASS; production build PASS with existing large export chunk warning. Final before/after timing report will distinguish sampled warm transitions from cold, refreshed or invalidated scopes. Ticket remains IN_REVIEW until owner acceptance.


### TAB-LOADING-FIX-20261020 final verification

IN_REVIEW. Final focused33/33 PASS; full Vitest executed ONCE after fixes:508/508 PASS,0 failed, all previous seven failing cases included. Full ESLint0 errors/warnings PASS; final production build PASS (existing1171.90KB export chunk warning) and git diff --check PASS. Text-only genuine-loading label correction included in final build. Paired Edge core sequence warm median217.5->197.5ms; first-visit round median298->252ms. Final before warm loaders11/14 versus after0/14; after blank frames0/14. Broader13-module warm round also0 loaders/blank; real enrollment/payment/faculty-assignment propagation, mutation invalidation, branch frame isolation and logout clearing PASS. Refresh785->856ms shows no confirmed paired improvement; modal170->169ms essentially unchanged. Cold bootstrap/refresh empty pre-React frames and genuine initial/dirty-scope loaders are explicitly recorded, not hidden or counted as warm PASS. Detailed per-case A-G flags/timings, file list and evidence in artifacts/tab-loading-fix-20261020/REPORT.md. Eighteen source/six test files plus docs touched in this scope; existing unrelated changes preserved. No commit/push; owner browser acceptance is next approval.


## SETTINGS-BRANDING-ONLY-20261020

Owner explicitly requests removing Settings section tabs and their corresponding panels, retaining only Branding & Visual Identity in the existing design. Removed six section selectors/profile/academic/fee/roles/branch/alerts panels, obsolete state/imports and unnecessary academic read. Branding/name/logo/sidebar preview, Save/Cancel/default reset remain. Existing hidden profile metadata is loaded and preserved on saves; save/reset disabled until saved settings are available. SettingsPage.jsx only application file changed. PASS targeted ESLint, production build (existing export chunk warning), AdminOperations integration4/4 and isolated Edge only-branding/save/hidden-metadata preservation/desktop1440 and mobile390 fit checks. Full suite NOT_RUN for scoped UI removal. Existing uncommitted work retained; no commit/push. IN_REVIEW pending owner visual acceptance.


## USERS-POLICY-PANEL-REMOVE-20261020

Owner requests removing Users Role Access Policy Grants display section. Removed only that card and its unused KeyRound/canAccess/PERMISSIONS imports from UsersPage.jsx. Kept role filters, assignment inputs, actual authorization policy, staff actions and KPI cards. PASS targeted ESLint, production build (existing export chunk warning), git diff --check and isolated Edge panel absence/users table/Add Staff role choices. Unit/full suite NOT_RUN for display-only removal. Documentation updated; IN_REVIEW for visual acceptance; no commit/push.


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

Final verification: PASS 96/96 tests across all nine Admissions page suites, admission calendar/date helper suites and mock admission transactions. Zero final failures. Full repository suite NOT_RUN for this scoped task. IN_REVIEW for owner visual acceptance.


## FACULTY-OVERFLOW-20261020

Owner-authorized fix: Faculty & Classes page-wide horizontal scrolling at laptop widths. Browser reproduced instructor profile action header extending document to1287px at1280viewport and1034px at1024viewport. Localized FacultyClassesPage.jsx classes allow profile header/actions and roster toolbar to wrap; set min-width0 on page/grid columns and profile identity, allow long identity text to wrap. All actions/data/permissions preserved; no global overflow hiding or unrelated module redesign.

IN_REVIEW pending owner visual acceptance. PASS isolated Edge checks for directory/subject assignments/batch assignments/class schedule at1440,1280,1024,768,390px (20 combinations): document scrollWidth matches viewport after fix. Existing mobile module nav retains its own contained scrolling. PASS FacultyClasses4/4 tests, touched ESLint, production build with existing large export chunk warning, diff whitespace check. Full suite NOT_RUN for scoped layout correction. Files: FacultyClassesPage.jsx plus task/progress/ticket records and browser check artifact. Existing unrelated changes preserved; no commit/push. No further implementation authorization needed; next approval is owner visual acceptance.


## ADMISSIONS-COMPACT-TOOLBAR-20261020

Owner requests moving Admissions period controls to the right of search on the same row with smaller text. AdmissionsPage.jsx only application change: compact period buttons (10/11px text, reduced padding), search/period/status/export in one wrapping toolbar; custom dates remain below. Application-date/timezone explanation retained accessibly. No filtering/paging/export logic changed. PASS AdmissionsPage5/5, touched ESLint, production build (existing chunk warning), whitespace check. Isolated Edge PASS search/period same-row positioning at1600/1440/1280/1024, no page overflow at those widths or390mobile, mobile custom inputs visible and fit. Full suite NOT_RUN. IN_REVIEW pending owner visual acceptance. Docs TASKS/FEATURE_TICKETS/PROGRESS updated; artifacts/admissions-compact-toolbar-20261020 contains checks/screenshots. Existing unrelated edits preserved, no commit/push. Next approval: visual acceptance.


## FEES-PERIOD-TOOLBAR-20261020

CONFIRMED owner request: Fees ledger gains compact All/Daily/Weekly/Monthly/Yearly/Custom controls to the LEFT of a narrower search on the same desktop toolbar; mobile wraps. Filters use saved challan issueDate in Asia/Karachi, current Monday-Sunday week/month/year and inclusive custom endpoints. Incomplete/reversed custom ranges show no matches with guidance. Date/search/status filters intersect in active branch; chip counts match date scope; pagination and selection reset on filter changes. Shared selection receives current page rows. CSV/PDF use existing matching/selected scope; KPI calculations remain unchanged. Reset clears dates/search/status. Overdue View All and dashboard receipt navigation restore All dates to preserve their intended destination.

Extracted existing Admissions calendar logic unchanged into utils/reportingPeriod.js; admissionPeriod.js retains compatibility aliases. No financial formulas, payment authorization, persistence, Server or dependencies changed. Source files: FeesPage.jsx, utils/reportingPeriod.js, utils/admissionPeriod.js. Tests: new FeesPage.test.jsx plus financialService.test.js preload of Dashboard/Fees modules before receipt navigation assertions to exclude lazy module transformation timing; all original assertions preserved.

PASS31/31 final tests:26 across Fees page, Admissions page, calendar boundaries and KPI metrics; financial service5/5 including saved verified receipts/branch isolation/dashboard selected-payment navigation. Initial new-test selector mismatches corrected; initial service navigation timed out on Loading module, corrected harness preloads routes. PASS touched ESLint, production build (existing1171.90KB export chunk warning), whitespace check. Isolated Edge PASS period controls left of search/same row at1600/1440/1280/1024 and390mobile/custom no overflow; real service-created disposable demo challans verify all six periods, search, custom inclusive range, CSV date scope, Reset and zero JS errors. Owner browser data untouched. Artifacts: artifacts/fees-period-toolbar-20261020. Full repository suite NOT_RUN. IN_REVIEW pending visual acceptance; no commit/push; unrelated edits preserved. Updated TASKS/FEATURE_TICKETS/PROGRESS/MEMORY; next approval owner visual acceptance.


## SETTINGS-BRANDING-DESIGN-20261020

Owner authorizes visual polish of Branding & Visual Identity only. SettingsPage.jsx now uses a soft theme-tinted maroon/white gradient, icon-led header, three white identity/color/logo field cards, bordered color-swatch tiles and framed sidebar preview. Small sky/slate tint balances the sidebar section; primary accents still follow configured theme tokens. Responsive grids/wrapping preserve desktop/mobile fit. Added explicit input labels and semantic sidebar section. Original upload validation/file reader, save/cancel/reset handlers and hidden settings persistence are unchanged. No extra sections, packages or workflows introduced.

PASS12/12 AdminOperations/branding-context regression tests, touched ESLint, production build (existing export chunk warning), whitespace check. Isolated Edge verifies1440/1024/768/390 widths without page overflow, live color preview, Cancel, Save/reload, Reset and no JS errors; visually reviewed desktop screenshot. All browser changes used disposable demo storage, no owner records changed. Upload handler unchanged; additional file-upload browser regression NOT_RUN. Full repository suite NOT_RUN. IN_REVIEW pending owner visual acceptance. Application file: Client/src/pages/Settings/SettingsPage.jsx; task/progress/ticket/design records updated. Screenshots/check: artifacts/settings-branding-design-20261020. No commit/push; unrelated edits retained. Next approval: owner visual review.


## ADMISSIONS-DEFAULT-SUBJECTS-20261020

CONFIRMED owner change: selecting a course in the Admissions form selects all its currently available active subjects by default. Manual subject deselection/reselection remains available. Selecting an additional course adds only that course's active subjects, preserving manual exclusions in already selected courses. Removing a course removes its subjects; selecting it again defaults all its active subjects again. Legacy course-dropdown selection also defaults subjects. Opening an existing saved admission preserves its recorded subject subset, and unrelated field edits never reselect excluded subjects. Subject buttons now expose aria-pressed. No blanket effect, persistence change or new subject/fee records.

Application file: Client/src/components/Admissions/NewAdmissionForm.jsx. New focused tests: NewAdmissionForm.subjects.test.jsx. PASS53/53 across all nine Admissions page suites plus three subject-selection tests. Additional fee-total assertions PASS focused3/3: all active subjects default, inactive excluded, manual exclusions retained across multi-course changes, removed/reselected course behavior, dropdown, submitted selected IDs, saved subset preservation and total3,000->2,000 after manual unselect. PASS touched ESLint, production build (existing large export chunk warning), whitespace check. Isolated Edge using real service-created disposable demo subjects PASS default selection, manual unselect, unrelated edits, course removal/reselection. Initial browser locator ambiguity with batch label corrected; no application defect. Full repository suite NOT_RUN. Existing owner data and unrelated edits preserved. No commit/push. IN_REVIEW pending owner visual acceptance; next approval owner review. Artifacts: artifacts/admissions-default-subjects-20261020.


## SETTINGS-LOGO-COMPACT-20261020

Owner requests removing Settings Cancel and keeping the Academy logo card height stable when a logo is supplied. Removed Cancel button/unused cancel handler only. Logo format/size help, compact32px thumbnail and Remove share a reserved40px footer row; no conditional block extends the field card. Upload validation, Save, Remove, Reset and preview remain. Application file: Client/src/pages/Settings/SettingsPage.jsx. Existing unrelated changes preserved; no commit/push.

PASS touched ESLint, production build (existing export chunk warning), whitespace check. Isolated Edge PASS Cancel absent, PNG upload/preview/Remove, persisted logo restored after Save/reload, no page overflow and equal card heights before/after upload/remove at1440/1024 (150px) and768/390 (154px). Browser used disposable demo storage. Initial AdminOperations3/4 PASS; unrelated Assets creation test hit existing10000ms timeout during concurrent browser verification; sequential rerun result below. Full repository suite NOT_RUN. IN_REVIEW pending owner visual acceptance; next approval owner review. Docs TASKS/FEATURE_TICKETS/PROGRESS updated; evidence artifacts/settings-logo-compact-20261020.

Final sequential AdminOperations rerun: PASS4/4, zero failures; no test or application changes needed for interim timing failure.


## SETTINGS-BACKGROUND-20261020

Owner requests slightly more distinct light background so branding content stands out. SettingsPage.jsx only application change: soft rose/lavender/sky outer gradient, rose header and lavender/slate/sky sidebar-section background; existing white inner field cards and configured live sidebar preview colors retained. Dark-mode variants included. No layout/data/handler changes. PASS touched ESLint, production build (existing export chunk warning),1440desktop/390mobile browser fit and desktop screenshot visual review, whitespace check. Tests/full suite NOT_RUN for background-only edit. IN_REVIEW pending visual acceptance. TASKS/FEATURE_TICKETS/PROGRESS updated; screenshots in artifacts/settings-background-20261020. Existing edits preserved; no commit/push. Next approval: owner visual review.


## GLOBAL-TIME-12H-20261020

CONFIRMED owner-authorized global presentation change; IN_REVIEW pending owner acceptance. Central utils/timeFormat.js formats strict saved HH:mm/already12h clock values, whole known schedule ranges and user-facing timestamps with explicit Asia/Karachi timezone. Existing formatClassTime compatibility delegates to central formatter; class shift/period functions unchanged. Midnight/noon display12:00 AM/PM, afternoon/night numeric hour without leading zero. Invalid/missing values return explicit fallback; relative text stays unchanged. Timestamp offsets are respected; offset-free local ISO presentation is interpreted as Karachi; date-only fields never gain clock or shift day.

Shared Input delegates type=time to TimeInput: h:mm field plus AM/PM selector, returning canonical HH:mm to existing handlers. Partial/invalid input emits empty canonical value rather than retaining a stale valid time; disabled/required/read-only and existing labels remain. No persistence migration, schema/API representation, auth/branch policy, calculation, overlap, duration, date-filter, sorting, attendance/payment or countdown changes. Existing overnight validation remains unchanged (current create flows reject end<=start); formatting23:00->01:00 preserves endpoints without inventing a duration/date.

Presentation consumers updated: Dashboard class slots/enrollment timestamps/daily chart labels and role schedule labels; Faculty roster/timetable/saved assignment labels and room-conflict message; Courses/Batches tables/modals/CSV/PDF; Admissions subject/batch/clash timings and status history timestamps; Student profile subjects; Demo requested/scheduled/history timings and labels; Reports table time projections, human-readable enrollment CSV timestamps; PDF generated-at timestamp. Existing Faculty/profile/shift/demo export callers already using formatClassTime receive centralized output. Fees/Finance, Assets, Users and Settings audited: date-only fields remain date-only where no time was displayed. Raw API batchTiming and ISO dateTime attributes remain machine-compatible. No new dependencies, worktree/branch, Server changes or owner-data mutation. Existing performance/cache and unrelated edits preserved.

PASS focused tests 144/144: core35 (midnight/noon13:00/23:59, invalid/offset/date boundaries, input roundtrip, existing conflict/countdown/shift), modules92 (Faculty, Dashboard, Admissions, Reports, Students, Demos, daily classes and Word), export/form17 (Courses, PDF templates, default subject flow). Updated only two existing display assertions for new AM/PM labels/input8:00; storage assertions still expect08:00. PASS targeted ESLint on all24 scoped source/test files. ONE production build executed, PASS with existing1171.88KB export chunk warning. PASS whitespace check. Full repository suite NOT_RUN, as focused checks requested.

Isolated Edge: class assignment Create noon12:00 PM->1:30 PM saves12:00/13:30; Edit1:00 PM->2:15 PM saves13:00/14:15; Reload retains fields/PM. Actual teacher and room conflicts still reject; room error uses1:00 PM. Countdown at Karachi12:45 is Starting Soon with15 minutes. Same1:00 PM-2:15 PM displayed in Dashboard, Faculty, Admissions, Reports and batch directory. Batch CSV/PDF include AM/PM; profile print fires; enrollment CSV human timestamp12:45 PM while saved ISO remains unchanged. Mobile390 modal controls fit; desktop1440 checked. All four authorized roles and both allowed branches navigated without foreign branch data or JS errors. Browser scripts use only disposable demo storage. Initial browser harness selector/unsupported fixture-account mismatches corrected; no related application defects or workflow changes. Evidence/scripts/screenshot and complete24-file scope in artifacts/global-time-12h-20261020. No commit/push. Next approval: owner acceptance; STOP after authorized task.


## SETTINGS-MAROON-BG-20261020

Owner requests stronger light maroon Branding & Visual Identity background with white inner cards. SettingsPage.jsx presentation classes only: outer/header solid soft maroon #f3dfe4; identity fields/sidebar section/color tiles/preview frame white. Configured live sidebar preview color remains dynamic, preserving color controls. No layout or handler changes. PASS targeted ESLint, production build (existing chunk warning), whitespace check. Tests/browser NOT_RUN for color-only edit. IN_REVIEW pending visual acceptance. TASKS/FEATURE_TICKETS/PROGRESS updated; prior edits preserved; no commit/push. Next approval: owner visual review.


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


## SETTINGS-LIGHTER-BG-20261020

Owner-authorized color-only change: Branding section outer/header maroon tint lightened from #f3dfe4 to #f8edf0 in SettingsPage.jsx. Inner white cards/layout/handlers unchanged. Targeted ESLint result recorded below; build/tests/browser NOT_RUN for this color-only change. Existing edits preserved; no commit/push. IN_REVIEW pending visual acceptance.

Verification: targeted ESLint PASS.


## TIME-PICKER-DROPDOWN-POLISH-20261020

Owner explicitly authorizes continuation of shared Start/End Time dropdown polish. IN_REVIEW pending owner visual acceptance. Changed components/ui/time-input.jsx and its test only, plus documentation/evidence. Replaced oversized native96-option suggestions with compact scrollable top-layer popover, selected checkmark, quarter-hour labels, viewport clamping and upward placement when needed. Keyboard arrows/Home/End/Page keys/Enter/Tab, touch selection, outside dismissal and Escape supported. Escape closes only suggestions before modal listeners. Manual arbitrary-minute input, saved-value prefill, canonical HH:mm output and existing validation/scheduling policies retained. AM/PM select gets scoped spacing/background override to prevent global select styling clipping its text. Existing Input type=time consumers inherit the change; no dependencies, data migration or business-rule changes.

PASS29/29 focused tests (picker, assignment form and formatter), targeted ESLint and final production build (existing large export chunk warning). Initial runs exposed unsupported-popover test rendering and modal Escape propagation; corrected and rerun PASS. Isolated Edge1440 desktop/390 mobile verifies bounded top-layer dropdown, keyboard/touch, midnight/noon/invalid13:70, manual9:07 AM=>09:07, suggested2:15 PM=>14:15, create-save-edit-reload, existing teacher/room conflicts and15-minute countdown, Dashboard/Admissions/Faculty/Courses/Reports display, CSV/PDF/print, four roles/two authorized branches; zero page errors. Mobile screenshot visually inspected including unclipped AM/PM. Evidence artifacts/time-picker-dropdown-polish-20261020. Full suite NOT_RUN. Existing uncommitted/performance edits preserved; branch dev, no commit/push/reset/stash/clean. No blockers. Next approval: owner review.


## ADMISSION-BATCH-SHIFT-ONLY-20261020

Owner-approved minimal display change; IN_REVIEW. Removed exact clock range and clock icon from Admissions preferred batch cards in NewAdmissionForm.jsx. Existing optional Morning/Evening badge, name, days, room, seats and selection retained. No inferred shift, stored-time changes or schedule/calculation changes. Targeted ESLint PASS. Tests/build/browser NOT_RUN for removal-only presentation change. Prior uncommitted edits preserved; no commit/push. Next approval: owner visual review.


## SETTINGS-LIGHTEST-BG-20261020

Owner requests further lightening of Branding & Visual Identity section. IN_REVIEW: SettingsPage.jsx outer/header tint changed from #f8edf0 to #fcf5f7; inner white cards and all handlers/layout unchanged. Targeted ESLint PASS. Tests/build/browser NOT_RUN for color-only change. Existing edits preserved, no commit/push. Next approval: owner visual acceptance.


## BATCH-DURATION-20261020

CONFIRMED owner-authorized change; IN_REVIEW pending owner acceptance. Batch create/edit now accepts optional positive integer durationMonths (1 month,2 months,3 months,etc), blank=null and existing absent values preserved without guessed defaults or migrations. Validated at form, mock payload and stored-record boundaries. Existing branch/course name uniqueness, optional shift, immutable IDs and legacy clock metadata retained. Duration is descriptive months only; no automatic end date, fee calculation or schedule/countdown/permission changes.

Shared utils/batchDuration.js formats singular/plural. Batches table schedule cell shows labeled duration (Not configured for legacy absence); directory CSV/PDF include Duration; course-details batch cards, Admissions batch dropdown/cards, enrollment dropdown and saved admission batchLabel show configured duration. Exact timing remains removed from Admissions batch cards. Source/test scope9 files: BatchForm.jsx/test, mockDatabase.js, academicModule.test.js, NewAdmissionForm.jsx, AdmissionActions.jsx, CourseDetailsModal.jsx, CoursesBatchesPage.jsx, batchDuration.js.

PASS16/16 focused tests covering create/edit/clear/refresh duration, invalid zero/negative/fraction/string rejection without storage mutations, shift/uniqueness guards and Admissions subject-selection regression. Initial new service test omitted existing mandatory name/course fields; fixture corrected to existing save contract and rerun PASS. Targeted ESLint PASS; production build PASS (existing large export chunk warning). Isolated Edge desktop/mobile PASS actual3-month create/save/edit/reload, Batches table text, Admissions dropdown/card and actual submitted application's saved duration label, optional shift and duplicate-name guards; zero page errors. Browser harness modal-hidden row lookup corrected; final rerun PASS. Evidence artifacts/batch-duration-20261020. Full suite NOT_RUN; PDF/CSV duration source mapping inspected, additional export browser test NOT_RUN. All persistence remains browser-local mock. Existing uncommitted/performance edits preserved; dev unchanged; no commit/push/reset/stash/clean. Next approval owner review.


## BATCH-FACULTY-COLUMN-20261020

Owner-approved table presentation change; IN_REVIEW. CoursesBatchesPage.jsx Batches desktop table now has separate Schedule and Faculty columns; duration stays with Schedule, teacher names/empty state move to Faculty. Conditional seven-column widths total100%; Courses table retains original six columns, mobile cards and underlying services unchanged. Targeted ESLint and production build PASS (existing chunk warning). Tests/browser NOT_RUN for cell relocation. Existing edits preserved, no commit/push. Next approval owner visual review.


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


## FINANCE-OVERVIEW-MAROON-20261020

Owner-authorized color-only change; IN_REVIEW. FinancePage.jsx selected Finance Overview button now uses existing maroon #940016 background and white text/inherited icon, matching Teacher Payroll active style. No layout/handlers/data changes. Targeted ESLint PASS. Tests/build/browser NOT_RUN for class-only color change. Existing edits preserved; no commit/push. Next approval owner visual review.


## PAYROLL-FLOW-FIX ? 2026-10-21

Owner-authorized payroll analysis and repairs; IN_REVIEW pending owner acceptance. Fixed agreement teacher metadata, advance payment-method contract, shared pagination, month selection, Finance tab navigation and agreement deep-link reopening. Save-success/refresh-failure handling preserves the successful mutation and avoids duplicate retries. Accessible monetary/payment fields retained within existing layouts.

Payroll requires approval before payment; approved snapshots cannot be recalculated or adjusted. Whole positive PKR payments, valid methods and duplicate references within the same payroll line are validated. Each payment creates exactly one linked Finance expense. Advance recovery happens once, including partial payments and zero-cash settlement; other approved periods reserve recoverable balances. Scoped enabled teachers and agreement dates/rates are validated. Per-lecture calculation counts saved dated sessions after their end time; fee percentage joins the teacher's assigned batch enrollments to their challans and verified payments, excluding unrelated batches. Existing formulas and historical records are preserved. Karachi date boundaries used for defaults and payslip payment dates. This remains browser-local mock accounting, not a bank transfer or production backend.

Changed: Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, StaffAdvanceModal.jsx, DisbursePaymentModal.jsx, ManualAdjustmentModal.jsx, PayslipModal.jsx; pages/Finance/FinancePage.jsx; mock/mockDatabase.js payroll operation; services/payrollService.test.js.

PASS: 33 focused tests (payroll service/view/page, audit and financial regressions), targeted ESLint, production build and git diff --check. Build retains existing large export chunk warning. Disposable Edge desktop/mobile verified agreement create/save/reload, >10-row pagination, advance methods, bonus, approval lock, partial/full salary payments, single advance recovery and linked expenses, payslip PDF/print, CSV, month/tab navigation and deep-link save closure; no page errors. Browser scenario: 51,000 salary less 3,000 advance plus 500 bonus = 48,500; paid in two payments. Full repository suite and real backend integration NOT_RUN. Evidence: artifacts/payroll-flow-fix-20261021. Branch dev; unrelated dirty changes preserved; no commit/push. Next required approval: owner acceptance.


## PAYROLL-HEADER-EXPORTS - 2026-10-21

Owner-authorized minimal toolbar relocation; IN_REVIEW. FinancePage hides its Overview month/statement exports on Teacher Payroll and provides a header slot. TeacherPayrollView renders its existing PDF/CSV controls into that slot using a React portal, retaining current payroll month/filter data and handlers. Standalone payroll retains inline exports. Overview controls and payroll month input remain functional. Source files: pages/Finance/FinancePage.jsx, components/Finance/TeacherPayrollView.jsx. PASS: targeted ESLint, 6 payroll component/page tests, disposable Edge payroll workflow including CSV/downloads and tab navigation. Build NOT_RUN for this small relocation; no calculation/storage changes. Existing dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-TABLE-FIT - 2026-10-21

Owner-approved payroll table spacing/no-wrap change; IN_REVIEW. TeacherPayrollView.jsx uses compact horizontal cell padding below 1536px, wider padding on large screens, and single-line text. Calculation detail width cap removed; existing table-local horizontal scrolling accommodates unusually long records and mobile without overflowing the page. No data/actions/calculations changed. PASS targeted ESLint and disposable Edge normal-scale checks at 1920/1440/1366/390 CSS-pixel widths: all cells nowrap, no page overflow; representative desktop table fits its container at all three desktop widths. Mobile preserves local table scrolling. Browser evidence artifacts/payroll-flow-fix-20261021/table-fit.cjs. Build/unit tests NOT_RUN for styling-only change. Prior dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-EXPORT-STYLE - 2026-10-21

Owner-approved label/icon/color change; IN_REVIEW. TeacherPayrollView.jsx payroll export controls now say Export PDF and Export CSV, both with download icons, maroon #940016 backgrounds, white text and #7a0012 hover. Existing export handlers, loading/empty guards and header placement retained. Targeted ESLint PASS; tests/build/browser NOT_RUN for presentation-only change. Unrelated edits preserved; no commit/push. Next approval: owner visual acceptance.


## FINANCE-TABLE-FIT - 2026-10-21

Owner-approved Finance Overview table adjustment; IN_REVIEW. FinancePage.jsx defaults to 10 rows instead of 15, keeps date/category/method/amount and headings on one line, and uses compact cell padding. Long transaction descriptions truncate with full native title and keyboard-focus expansion; financial values are not truncated. Existing table-local mobile scrolling, filters, pagination and export handlers retained. PASS targeted ESLint and disposable Edge checks at 1920/1440/1366/390 widths: no page overflow, normal desktop rows fit, 16 actual mock expenses paginate 10 then 6. No browser page errors. Evidence artifacts/payroll-flow-fix-20261021/finance-table-fit.cjs. Build/unit tests NOT_RUN for scoped presentation/default-row change. Existing edits preserved, no commit/push. Next approval: owner visual acceptance.


## PAYROLL-EXPORT-ICONS - 2026-10-21

Owner-authorized distinct export icons; IN_REVIEW. TeacherPayrollView.jsx uses FileText for Export PDF and FileSpreadsheet for Export CSV, replacing identical download icons. Maroon styling, labels and handlers retained. Decorative icons hidden from accessibility tree; text labels preserved. Targeted ESLint PASS; build/tests/browser NOT_RUN for icon-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-REMOVE-INTRO - 2026-10-21

Owner-approved removal of Teacher Payroll & Compensation introduction, decorative icon, period badge and explanatory subtitle; IN_REVIEW. TeacherPayrollView.jsx retains right-aligned month/recalculate/approval/advance controls and existing export placement, with intro divider removed. No payroll state or accounting changes. TeacherPayrollPage.test.jsx locates the retained month control instead of removed heading. PASS targeted ESLint and 6 payroll component/page tests. Build/browser NOT_RUN for presentation-only removal. Unrelated edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-STYLE - 2026-10-21

Owner-approved larger tinted payroll KPI cards; IN_REVIEW. TeacherPayrollView.jsx six cards now have 150px minimum height, increased padding/value typography/spacing, and light sky/emerald/rose/maroon/teal/amber backgrounds matching existing ERP palette. Responsive grid retained; no amount/calculation/action changes. PASS targeted ESLint and disposable Edge 1440/390px checks: six 150px cards, distinct background colors, no page overflow. Build/unit tests NOT_RUN for styling-only change. Evidence artifacts/payroll-flow-fix-20261021/card-style.cjs. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-FILTER-STYLE - 2026-10-21

Owner-approved payroll progress/filter presentation; IN_REVIEW. TeacherPayrollView.jsx reuses existing CustomSelect for calculation method and payment status, with rounded controls, maroon selected menu styling/checkmark, method icons and payment status dots. Existing method/status values and page-reset filtering preserved. Progress card spacing, wrapping legend, search height and responsive filter layout adjusted locally. No accounting changes or shared component modifications. PASS targeted ESLint, 6 payroll component/page tests, isolated Edge 1440/390px checks: method/payment filters change results and restore rows, menus fit viewport, Escape closes, no page overflow/errors. Evidence artifacts/payroll-flow-fix-20261021/filter-style.cjs. Build NOT_RUN for localized UI change. Existing dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## FINANCE-TABLE-NO-SCROLL - 2026-10-21

Owner-approved Finance Overview no-horizontal-scroll layout; IN_REVIEW. FinancePage.jsx removes minimum table width and scroll wrapper; full Transaction Detail wraps with overflow-wrap:anywhere instead of truncation. Other columns stay single-line. Mobile uses labeled stacked rows to preserve every field without horizontal scrolling; scoped min-width override avoids shared mobile table minimum. Default 10 rows and pagination preserved. PASS targeted ESLint and isolated Edge 1920/1440/1366/390 checks with 16 actual mock expenses: table has no horizontal overflow, details wrap, page has no overflow/errors, pagination shows 10 then 6. Evidence artifacts/payroll-flow-fix-20261021/finance-no-scroll.cjs. Build/unit tests NOT_RUN for localized presentation change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-ACTIONS-POSITION - 2026-10-21

Owner-approved payroll action placement/month sizing; IN_REVIEW. FinancePage.jsx provides a responsive slot opposite Finance Overview/Teacher Payroll tabs; TeacherPayrollView.jsx portals its existing month/recalculate/approve/advance controls into that row, retaining inline standalone fallback. Month control reduced to 32px overall height and 128px inner width. Handlers/guards unchanged; narrow viewports wrap naturally. Targeted ESLint PASS. Focused payroll component/page tests recorded below. No commit/push; existing edits preserved. Next approval: owner visual acceptance.

Verification: 6 focused payroll component/page tests PASS. Build/browser NOT_RUN for this relocation.


## PAYROLL-PROGRESS-COMPACT - 2026-10-21

Owner-approved progress section height reduction; IN_REVIEW. TeacherPayrollView.jsx progress card vertical padding reduced from 20px to 12px, internal gaps tightened, bar 8px and method control 36px. Existing content, dropdown, responsive wrapping and calculations preserved. Targeted ESLint PASS; build/tests/browser NOT_RUN for spacing-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-VERTICAL-SPACING - 2026-10-21

Owner-approved tighter payroll vertical layout; IN_REVIEW. TeacherPayrollView.jsx section gaps reduced from 24px to 12px, progress card vertical padding from 12px to 8px, progress internal spacing from 6px to 4px and legend top padding removed. Cards, progress, search and table now sit closer together; existing controls/content/calculations preserved. Targeted ESLint PASS; tests/build/browser NOT_RUN for spacing-only change. No commit/push; unrelated edits preserved. Next approval: owner visual acceptance.


## PAYROLL-CARD-SIZING - 2026-10-21

Owner-approved KPI card text/size adjustment; IN_REVIEW. TeacherPayrollView.jsx KPI labels/help text increased from 10px to 12px and amounts from 20px to 24px. Minimum height reduced from 150px to 130px with compact padding/spacing. Grid gaps reduced from 12px to 8px, giving cards slightly more width within existing responsive grid. Backgrounds/data/calculations preserved. Targeted ESLint PASS; tests/build/browser NOT_RUN for styling-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-TEXT - 2026-10-21

Owner-approved smaller payroll card typography; IN_REVIEW. TeacherPayrollView.jsx KPI labels/help reduced from 12px to 11px, amounts from 24px to 20px, and heading letter spacing normalized to reduce wrapping. Card dimensions/colors and data unchanged. Targeted ESLint PASS; build/tests/browser NOT_RUN for typography-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-TEXT-GAPS - 2026-10-21

Owner-approved internal KPI text spacing; IN_REVIEW. TeacherPayrollView.jsx title-to-amount and amount-to-description margins increased from 6px to 12px across all six cards. Existing fonts/colors/minimum card height/data preserved. Targeted ESLint PASS; tests/build/browser NOT_RUN for spacing-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-COMPACT-GAPS - 2026-10-21

Owner-approved shorter KPI cards with greater text separation; IN_REVIEW. TeacherPayrollView.jsx reduces minimum height 130px to 120px and vertical padding 12px to 6px, uses justify-between and minimum 14px internal gaps instead of 12px margins. Fonts/colors/data unchanged; content can grow naturally. Targeted ESLint PASS; tests/build/browser NOT_RUN for styling-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CARD-COLORS - 2026-10-21

Owner-approved screenshot palette match; IN_REVIEW. TeacherPayrollView.jsx payroll KPI cards use existing Fees-style white-to-mint, cream/amber and pale blue gradients with matching borders, dark totals and muted supporting labels. Existing dimensions/spacing/data preserved; no shared KPI CSS/layout changes. Targeted ESLint PASS; tests/build/browser NOT_RUN for color-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## AUDIT-DROPDOWN-STYLE - 2026-10-21

Owner-approved Audit Log dropdown presentation; IN_REVIEW. AuditLogPage.jsx reuses CustomSelect for Module, Importance and Time filter with rounded controls, maroon selected rows/checkmarks, white shadowed menus and severity dots. Values/filter logic unchanged, Custom date range and Clear retained. Removed outer card overflow clipping for menus. PASS targeted ESLint, 9 audit constants/service tests and disposable Edge desktop/mobile menu selection, custom dates/Clear and viewport-fit checks at 1440/390px; no page errors. Evidence artifacts/payroll-flow-fix-20261021/audit-dropdown-style.cjs. Build NOT_RUN for localized UI change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## AUDIT-SEARCH-WIDTH - 2026-10-21

Owner-approved wider Audit Log search field; IN_REVIEW. AuditLogPage.jsx search flex basis/minimum increased to 320px on desktop with double flex growth, mobile retains full available width. Search/filter handlers unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for width-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## USERS-CARD-STYLE - 2026-10-21

Owner-approved larger Users summary cards; IN_REVIEW. UsersPage.jsx three cards use 120px minimum content height, increased padding, 12px labels/24px values and larger icon containers. Existing ERP pale blue, mint and cream gradients/borders applied, matching payroll/Fees palette. Counts, role policy labels and user workflows unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for presentation-only change. Existing dirty edits preserved; no commit/push. Next approval: owner visual acceptance.


## AUDIT-TOOLBAR-FIT - 2026-10-21

Owner-approved compact Audit Log dropdowns and wider single-row desktop search toolbar; IN_REVIEW. AuditLogPage.jsx uses desktop grid with flexible search, 160px Module and 130px Importance/Time controls plus Clear/Refresh columns. Desktop controls stay aligned in one row; mobile uses two-column layout/full-width search. Custom date range spans separate full row. Existing filters unchanged. PASS targeted ESLint and isolated Edge 1440/1366/390 viewport checks including desktop bottom alignment of search/dropdowns/Refresh, menu selection/custom dates/Clear and no overflow/errors. Evidence artifacts/payroll-flow-fix-20261021/audit-toolbar-fit.cjs. Build/unit tests NOT_RUN for layout-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.


## PAYROLL-CORRECTIONS - 2026-10-21 (REVERTED by owner)

Owner explicitly authorizes reasoned unpaid payroll reopening and separate additional bonus after salary payment; IN_REVIEW pending owner acceptance. Super Admin only in active authorized branch (mock service gate plus existing permission checks). Reopen Payroll clears approval and returns lines to draft if no period payments or settled advance recovery exist; saved reason/actor/time and journal preserve correction history. Existing adjustments can then be updated, recalculated and approved. Recalculation retains reopen metadata. Payroll with any salary payment or completed advance recovery cannot reopen, including zero-cash advance settlements.

Additional Bonus creates an approved separate payroll line linked to the original salary, with positive whole PKR amount, mandatory reason and request ID. Allowed only on settled approved periods and original salary lines. Original salary/paid records and expenses stay unchanged. Same request retries return the saved bonus; mismatched reused request IDs reject. Separate bonus has no advance deduction/recovery; newer advances remain untouched. Period payable/outstanding reflect the bonus; teacher count remains unchanged. Existing Pay supports partial/full bonus disbursement, one linked Finance expense per payment, and separate payslip/print/PDF. Payment is recorded locally; no bank transfer or backend implementation introduced.

UI: Reopen Payroll appears for approved unsettled periods; Additional Bonus appears on original teacher rows after settlement. Reason/amount dialog validates, disables busy submissions and preserves input on errors. Reopen and Additional bonus created audit actions record reason with actor/branch/time. Existing safe audit fields extended only for explicit correction metadata.

Files: services/payrollService.js and test; mock/mockDatabase.js and mockAudit.js; components/Finance/TeacherPayrollView.jsx and new PayrollCorrectionModal.jsx. PASS: 36 focused payroll service/view/page, audit and financial tests; targeted ESLint; production build; scoped git diff --check. Build retains existing large export chunk warning. Disposable Edge verifies reopen -> adjustment -> reapproval, partial original payment -> separate bonus -> Pay -> separate payslip -> reload, mobile dialog fit, audit actions and exactly one expense per linked payment. Browser evidence artifacts/payroll-flow-fix-20261021/corrections.cjs. Full repository suite/real backend integration NOT_RUN. Branch dev, unrelated dirty edits preserved, no commit/push. Next approval: owner acceptance.


## PAYROLL-CORRECTIONS-UNDO - 2026-10-21

Owner explicitly reverses PAYROLL-CORRECTIONS. Removed Reopen Payroll/Additional Bonus UI, modal, service operations, correction-specific audit extensions and three corresponding tests; prior approved payroll lock/payment workflow restored. Existing styling and unrelated edits preserved. No stored financial records or existing audit history deleted or migrated. Previous correction documentation marked REVERTED as historical evidence. PASS targeted ESLint, 33 focused payroll/audit/financial tests and scoped git diff --check. Build/browser NOT_RUN for undo. No commit/push. IN_REVIEW pending owner acceptance.


## PAYROLL-MONTH-BORDER - 2026-10-21

Owner-approved removal of maroon month input focus border; IN_REVIEW. TeacherPayrollView.jsx payroll month retains borderless input and uses subtle neutral slate keyboard focus ring with no offset. Other inputs/styles/handlers unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for focus-color-only change. No commit/push; existing edits preserved. Next approval: owner visual acceptance.


## PAYROLL-MONTH-NO-BORDER - 2026-10-21

Owner explicitly requests completely borderless payroll month control; IN_REVIEW. TeacherPayrollView.jsx removes outer container border and input focus ring/outline. Other controls unchanged. Targeted ESLint PASS; tests/build/browser NOT_RUN for styling-only change. Existing edits preserved; no commit/push. Next approval: owner visual acceptance.
## LOGIN-LOGO-MOTION - 2026-10-21

Owner-approved login logo motion refinement; IN_REVIEW. Rounded white logo surface, one-time 3D entry rotation and faster/wider vertical float implemented without changing login behavior. Reduced-motion users retain a static logo. PASS: 14 focused tests, targeted ESLint and production build; existing chunk warnings remain. No commit/push. Next approval: owner visual acceptance.

## REMOVE-DEMO-UI - 2026-10-21

Owner-approved frontend copy cleanup; IN_REVIEW. Acceptance: normal ERP screens no longer present themselves as a demo, while all Demo Classes labels and related workflow/report terminology remain intact. Built-in visible branch/course/batch/staff names now use operational labels; internal IDs and local mock persistence interfaces are preserved. PASS: 95 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## UPDATE-DEFAULT-PASSWORDS - 2026-10-21

Owner-approved browser-local initial password replacement; IN_REVIEW. Super Admin initial password is `admin@123`; staff initial password is `staff@123`. Previously changed account passwords are not reset. PASS: 21 focused authentication tests. No commit/push. Next approval: owner acceptance.

## LOGIN-LOGO-MOTION-FIX - 2026-10-21

Owner-approved animation lifecycle fix; IN_REVIEW. Login logo performs its one-time 3D spin and continuous vertical float reliably, protects the intro from early pointer cancellation, and uses a DOM animation fallback when WebGL cannot initialize. Reduced-motion accessibility is preserved. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-SECTION-HEIGHT - 2026-10-21

Owner-approved login card height reduction; IN_REVIEW. The existing login composition is more compact through smaller padding, gaps and logo dimensions, with responsive layout and functionality preserved. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-100-PERCENT-SCALE - 2026-10-21

Owner clarification supersedes LOGIN-SECTION-HEIGHT implementation details. Original internal proportions are restored and the complete desktop login card uses a uniform 90% visual scale at normal browser zoom; mobile is unchanged. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-BRANDING-LAYOUT - 2026-10-21

Owner-approved desktop login branding adjustment; IN_REVIEW. Academy name stays on one line, animated logo is larger, and desktop page scrolling is removed without changing mobile flow or login behavior. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-WIDTH-CORRECTION - 2026-10-21

Owner-approved correction; IN_REVIEW. Login card uses its normal width again while preserving a single-line desktop academy name, larger logo and no desktop scrollbar. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-ACADEMY-NAME-SIZE - 2026-10-21

Owner-approved login heading adjustment; IN_REVIEW. Only the academy-name typography was enlarged while retaining a single line and the existing card width. PASS: 10 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-ACADEMY-NAME-SIZE-2 - 2026-10-21

Owner-approved follow-up; IN_REVIEW. Academy name is slightly larger again while remaining one line inside the unchanged login section width. PASS: 10 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push. Next approval: owner acceptance.

## LOGIN-ACADEMY-NAME-SIZE-3 - 2026-10-21

Owner-approved typography-only follow-up; IN_REVIEW. Academy name is larger with subtle word spacing, remains responsive on one line, and does not change the login section dimensions. PASS: 10 focused auth tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-BACKGROUND - 2026-10-21

Owner-approved visual-only ticket; IN_REVIEW. The login branding panel now renders a subtle Three.js galaxy atmosphere beneath its existing content, preserves panel dimensions, ignores pointer input and respects reduced-motion preferences. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-PAGE-BACKDROP - 2026-10-21

Owner-approved visual-only follow-up; IN_REVIEW. The background outside the login card now uses a calm, low-opacity Three.js particle atmosphere with warm radial light. The login card dimensions and behavior are unchanged, pointer interaction passes through, and reduced-motion remains supported. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## BRANCH-SELECT-COMPACT-CARDS - 2026-10-21

Owner-approved auth UX refinement; IN_REVIEW. Multi-branch users now choose an authorized branch directly from accessible selection cards and then use `Open dashboard`; the redundant dropdown is removed. The selection panel is narrower and more compact while branch scoping remains unchanged. PASS: 10 focused auth tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-STARFIELD - 2026-10-21

Owner-approved visual-only follow-up; IN_REVIEW. The light area outside the login card now has a visible but calm Three.js star field with slow drift and soft twinkling in academy-aligned colors. Login card and section layout are unchanged. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-FULL-PAGE-SCENE - 2026-10-21

Owner-approved visual-only follow-up; IN_REVIEW. The full light page area outside the login card now combines the moving star field with three subtle orbital paths for a distinct celestial effect. The login card and both internal sections are unchanged. PASS: 14 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## LOGIN-THREE-VISIBILITY-FIX - 2026-10-21

Owner-reported visual defect; IN_REVIEW. Browser inspection showed the outer Three.js canvas working but too faint on the light background. Outer star, twinkle and orbit opacity were raised to a clearly visible restrained level; the login card and internal sections remain unchanged. PASS: Edge screenshot, 14 focused tests, targeted ESLint and production build. No commit/push.

## LOGIN-OUTER-THREE-REMOVE - 2026-10-21

Owner-approved visual rollback; IN_REVIEW. The login page's outer background is plain again. The internal maroon-panel Three.js atmosphere, login card dimensions and authentication behavior remain unchanged. PASS: Edge browser screenshot, 14 focused tests, targeted ESLint and production build. No commit/push.

## LOGIN-MAROON-NETWORK-BACKDROP - 2026-10-21

Owner-approved visual-only ticket; IN_REVIEW. The light background outside the login card now renders a maroon connected-node network using Three.js, with slow GSAP drift and opacity breathing. The login card and both internal sections are unchanged. PASS: Edge browser screenshot, 14 focused tests, targeted ESLint and production build. No commit/push.

## LOGIN-MAROON-PARTICLE-FLOW - 2026-10-21

Owner-approved visual-only follow-up; IN_REVIEW. Dense flowing particles in maroon shades now cover the complete outer light background and animate alongside the existing connected-node scene using Three.js and GSAP. The login card and internal sections are unchanged. PASS: Edge browser screenshot, 14 focused tests, targeted ESLint and production build. No commit/push.

## LOGIN-MAROON-CURVED-TRAILS - 2026-10-21

Owner-approved visual-only refinement; IN_REVIEW. The full outer background now uses glowing maroon particle trails curved across multiple directions, plus distributed depth particles and a softened connected-node layer. Three.js renders the scene and GSAP supplies restrained motion. The login card and sections are unchanged. PASS: Edge browser screenshot, 14 focused tests, targeted ESLint and production build. No commit/push.

## LOGIN-OUTER-THREE-REMOVE-MOBILE-NAME - 2026-10-21

Owner-approved visual rollback and responsive typography correction; IN_REVIEW. The page background is plain after removing the outer Three.js/GSAP component. The academy name uses a smaller mobile-only responsive clamp and remains a complete single line; tablet/desktop size and all section dimensions are unchanged. PASS: desktop/mobile Edge screenshots, 14 focused tests, targeted ESLint and production build. No commit/push.

## SETTINGS-REMOVE-FEATURE-MODULES - 2026-10-21

Owner-approved Settings-only removal; IN_REVIEW. The `Feature Modules & Extensions` section and its toggle UI/code no longer render in Settings. Finance Payroll remains governed by the existing stored setting and its implementation was not changed. PASS: 21 focused payroll tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## PAYROLL-MONTH-SELECTION-STABILITY - 2026-10-21

Owner-approved payroll behavior fix; IN_REVIEW. Acceptance: a month selected by the user remains selected while viewing that branch, including after the payroll view remounts; the current month appears initially only when the branch has no prior selection. A focused remount regression test covers the reported failure. PASS: 22 focused payroll tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F12-BRANCH-ADMIN-ROLE - 2026-10-21

Owner-approved frontend mock role ticket; IN_REVIEW. Acceptance: Super Admin can assign Admin; Admin receives every implemented module/tab permission inside its assigned branch, cannot select or access an unassigned branch, and the Users form/service allow Admin to create only Owner, Receptionist and Teacher. Permission and login/service regressions cover branch denial and privileged-role creation rejection. PASS: 50 focused tests, full 625-test suite, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F13-BRANCH-THEME-DARK-MODE - 2026-10-21

Owner-approved frontend theme ticket; IN_REVIEW. Acceptance: settings saved in one branch are visible to every role in that branch, remain isolated from other branches, global theme color changes system accents, sidebar colors remain independently configurable, and dark mode presents readable dark topbar/surfaces/text across shared UI. Added branch-isolation regression coverage. PASS: 57 focused tests, full 626-test suite, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F13-BRANCH-NOTIFICATIONS - 2026-10-21

Owner-approved frontend mock ticket; IN_REVIEW. Acceptance: topbar notifications belong to one recipient and one branch; Receptionist student/admission and challan actions notify branch Admin/Super Admin; Admin/Super Admin equivalents notify branch Receptionists; a class assignment notifies its assigned Teacher; Owner receives none. Duplicate events are suppressed. PASS: 14 focused tests, ESLint, production build and diff check. Full suite: 628 passed, 1 Demo Classes lazy-route timeout failed. Browser QA NOT_RUN. No commit/push.

## F02-ADMISSION-PRICING-DISPLAY - 2026-10-21

Owner-approved frontend ticket; IN_REVIEW. Acceptance: Admission subject cards display each configured subject fee for courses using `subjects` pricing and omit subject prices for courses using `course` pricing, including mixed multi-course selection. Existing configured total calculation remains authoritative. PASS: 23 Admission tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F03-F05-PROFILE-TAB-COLOR - 2026-10-21

Owner-approved visual ticket; IN_REVIEW. Acceptance: every active tab on Student and Teacher profiles uses the academy primary maroon surface and readable foreground while inactive tabs retain their existing presentation. PASS: targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F12-USERS-FILTER-ACTIONS - 2026-10-21

Owner-approved frontend ticket; IN_REVIEW. Acceptance: Users toolbar contains search plus one styled role dropdown whose default label is `All Roles`; the duplicate branch-wide `All` dropdown is absent; table Actions has no View control while existing management actions continue to work. PASS: 37 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## F12-USERS-DATA-LOAD-FIX - 2026-10-21

Owner-approved reliability fix; IN_REVIEW. Acceptance: current-branch staff rows appear after a successful Users load; loading is distinguishable from an empty result; load failures are visible and retryable instead of silently rendering an empty table. Existing branch authorization and account actions remain unchanged. PASS: 37 focused tests, targeted ESLint and production build. Browser QA NOT_RUN. No commit/push.

## DATA-LEGACY-FACULTY-LINK-REPAIR - 2026-10-21

Owner-approved compatibility repair; IN_REVIEW. Acceptance: retained faculty assignments linked to identities deleted by the earlier Users workflow load without blocking Dashboard or other tabs; deleted accounts cannot log in and do not reappear in Users; unrelated invalid teacher links still produce a validation error. No local data reset or history deletion is required. PASS: 70 focused service/database tests, targeted ESLint, production build and diff check. Browser QA NOT_RUN. No commit/push.

## DATA-LOAD-RECOVERY - 2026-10-21

Owner-reported persistent data-load failure traced to the actual localhost Chrome ERP snapshot: a saved faculty assignment references an existing disabled teacher. The earlier deleted-identity repair did not cover disabled identities. Historical assignment reads now check identity existence independently of current login status/role; new assignment writes retain the enabled branch Teacher requirement. No saved records are erased or reset. Added disabled/role-change regressions covering student reads, dashboard reports, unchanged storage, ineligible new assignments and rejection of arbitrary unknown teacher IDs. PASS: 72 focused service/database tests, targeted ESLint and production build (existing chunk warnings). Actual saved-data replay in a disposable Edge browser resolves the previously failing store and renders dashboard cards. IN_REVIEW; no commit/push.

Browser verification PASS: replayed the read-only localhost Chrome ERP snapshot in a disposable Edge context; Dashboard cards, Students, Admissions, Courses & Batches, Faculty, Fees and Finance loaded with no page errors. Source Chrome storage was never modified. Evidence script and dashboard screenshot: artifacts/data-load-recovery-20261021/. Scoped diff check PASS.

## PAYROLL-HEADER-CONTROLS-REMOVE - 2026-10-22

Owner explicitly approved removal of ONLY the Teacher Payroll header Month Selector, Recalculate and Staff Advance controls. Removed those controls and their now-unused UI handlers/icons, retaining automatic initial/month-change-after-agreement calculations, Approve Payroll, exports, salary agreements, adjustments, payment/balance/payslip flows, service operations and all historical data. Empty action wrappers are omitted when no remaining controls render. Finance Overview is unchanged. Updated component coverage for control absence, retained approval/exports and an empty approved-period action portal; removed the obsolete manual-month-selector test. PASS: 18 payroll component/service tests and 4 Finance Overview tests (isolated rerun after one initial lazy-module loading timeout), targeted ESLint and scoped diff check. Build and browser QA NOT_RUN for this UI-only removal. IN_REVIEW pending owner acceptance. No commit/push.

## PAYROLL-TWO-METHODS - 2026-10-22

Owner-approved focused payroll simplification; IN_REVIEW pending owner browser acceptance. New agreements support exactly Percentage (listed subject/course fee, explicit full-course authorization) and Fixed Monthly. Payroll eligibility comes only from saved active-branch Faculty course/batch/subject assignments, with immutable assignment/academic IDs and a fixed single-academy namespace. Assignment rows include course/batch/subject, eligible distinct active subject students, fee/rate, salary/paid/remaining/status/actions and teacher-combined totals. Missing fee/subject mapping/agreement blocks invalid percentage salary and approval. Pending/unrelated students are excluded. Agreements are effective by full calendar month (first day); new future versions close a previous open contract without rewriting approved salary snapshots. Overlapping conflicting versions reject.

New drafts omit bonuses, allowances, deductions, tax and automatic advance recovery. Historical approved/paid payroll and advances remain preserved. Legacy or removed/reassigned draft lines are retained with supersededAt rather than deleted; active views exclude superseded drafts. Historical approved teacher-only rows remain readable/payable under their original snapshot. The month/Recalculate/Staff Advance header controls remain absent; salary-period/history navigation is in the content area to meet the newly requested monthly workflow. Draft calculation refreshes through normal navigation and agreement changes. Six simplified KPIs show salary due/paid/remaining, assigned teachers, current agreements and pending assignment balances.

Payments retain original ledger/expense integration and add assignment scope, verified status and exact two-decimal PKR amounts. A branch-unique transaction reference prevents repeat posting, including across batches; overpayments/negative values/cross-branch actions reject. Only Admin/Super Admin manage payroll; Owner retains authorized read-only payroll overview and existing unrelated Finance permissions. Receptionist and Teacher payroll requests remain denied under current policy (Teacher self-service is not enabled). Branch guards and existing adapter serialization remain in effect. No Server changes, new packages, destructive migration, worktree, commit or push.

PASS: 66 unique focused/regression tests (57 payroll/component/faculty/academic/PDF/audit + 4 Finance Overview + 5 financial tests); targeted ESLint; one production build; diff check. A broader run had one receipt-navigation timeout; its isolated five-test file passed. Disposable Edge browser PASS: zero unassigned payroll rows, separate two-batch setup, 50 x 5000 x 30% = 75000, fixed 50000, approval, 25000/50000 partial/full batch payment, exactly one expense per payment, PDF/CSV with assignment details, future fixed-rate switch to 60000 without changing approved history, reload and mobile fit, zero page errors. Existing build chunk warnings remain. Full suite and real backend integration NOT_RUN. Evidence: artifacts/payroll-two-methods-20261022/.

Changed application files: mock/assignmentPayroll.js (new), mock/mockDatabase.js, components/Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, DisbursePaymentModal.jsx, PayslipModal.jsx, utils/pdfHelpers.js and services/payrollService.test.js. Existing unrelated uncommitted work preserved on dev. Next approval: owner browser acceptance.

## PAYROLL-RUNNING-BALANCE - 2026-10-22

Owner explicitly supersedes monthly payroll/approval and confirms ONE salary balance per assignment (no recurring Add Salary action). New workflow: save the assignment salary, then Add Payment for any actual payment date; remaining equals agreed salary less recorded payments. Example verified: PKR 15,000 salary, PKR 5,000 payment, PKR 10,000 remaining, settled months later. Calendar changes, idle time, focus and navigation never add salary or recalculate the balance. Agreement saves update the SAME balance, retain salary revisions/payment records, and reject amounts below money already paid. Percentage and fixed assignment methods remain available; fee/enrollment basis is evaluated only on explicit agreement save. No salary setup means no fabricated payable.

Root cause of visible reload: FinancePage's shared 60-second interval/focus/storage refresh invalidated its resource and unmounted Payroll. These triggers now run only for Finance Overview; Payroll performs one read per branch/mount and reloads only after explicit salary/payment actions or Retry. Loading never calculates salary. Approval UI/service method and active calculatePeriod service method are removed. Historic monthly period reads remain compatibility-only. Period selectors, effective-month fields, monthly labels and approval gates are absent from the active flow. Actions show Add Payment immediately for an owed balance, with amount/method/reference/actual date. Payment date is today or earlier; negative, overpayment, duplicate reference, malformed date and foreign-branch actions reject. Each payment posts exactly one Finance expense with its actual date.

Running balances use payrollVersion:3 in the SAME payrollLines datastore. Old source lines/periods/payments are not rewritten/deleted; pure reads aggregate carry-forward balances and the first explicit salary edit/payment materializes one scoped running record referencing sourcePayrollLineIds. Subsequent reads exclude covered source rows from active totals, and even a direct old-line payment ID resolves to the existing running balance to prevent duplicate settlement. Prior unallocated teacher-only balances remain distinguishable historical balances. Earned unpaid balances remain payable after assignment removal; no new unearned salary is created. Admin/Super Admin management, Owner read-only overview, Receptionist/Teacher denial and branch scope remain enforced.

PASS: 62 focused/regression tests (49 payroll/component/faculty/academic/PDF/audit + 9 Finance Overview/financial + 4 mounted payroll); targeted ESLint; production build; diff check. Disposable Edge PASS: salary 15,000 -> payment 5,000 -> remaining 10,000; 130 seconds idle and focus cause zero extra reads/remounts/writes; later January payment settles the same balance with no period creation; PDF, mobile dialog and Finance once-per-payment verified with zero page errors. Existing large-chunk build warnings remain non-blocking. Full repository suite and backend integration NOT_RUN. IN_REVIEW pending owner acceptance; dev branch, unrelated dirty work preserved, no commit/push. Evidence: artifacts/payroll-running-balance-20261022/.

Changed application files: mock/runningPayroll.js (new), mock/assignmentPayroll.js, mock/mockDatabase.js, services/payrollService.js and test, components/Finance/TeacherPayrollView.jsx and test, SalaryAgreementModal.jsx, DisbursePaymentModal.jsx, PayslipModal.jsx, pages/Finance/FinancePage.jsx, pages/Finance/TeacherPayrollPage.test.jsx, utils/pdfHelpers.js.
## PAYROLL-TABLE-CLEANUP - Teacher Payroll table presentation

**Status:** IN_REVIEW
**Authorized:** 2026-10-22

Acceptance evidence:

- The on-screen payroll table shows only Teacher, Course/Batch/Subject, Method, Salary Amount, Already Paid, Remaining, Status and Actions.
- Redundant calculation-detail columns and the duplicated Combined Teacher Summary are removed from the view; calculation metadata remains available to exports and payroll logic.
- The table has no forced minimum width or horizontal overflow container.
- Mobile payroll entries stack into readable two-column rows while preserving all actions.
- Salary records, payment history, agreement configuration, payslips, filters and pagination are unchanged.
- Focused tests (10), targeted ESLint, production build and scoped diff check pass.

## FACULTY-SYNTHETIC-ASSIGNMENT-CLEANUP - Saved faculty data only

**Status:** IN_REVIEW
**Authorized:** 2026-10-22

Acceptance evidence:

- Central and North branch faculty views do not project hardcoded timetable slots or fictional 120-student counts.
- Courses, batches, class slots and student reach display only from saved branch-scoped records.
- An unassigned faculty member displays no course, no batch, zero students and no classes.
- Unassigned built-in faculty profiles can be removed through the existing Delete Faculty flow.
- Seeded demo-class registrations do not block faculty profile removal; real recurring assignments, dated classes and asset links still block unsafe deletion.
- Removal hides the faculty profile while retaining a tombstoned identity for historical references.
- 27 focused tests, targeted ESLint, production build and scoped diff check pass.
## PAYSLIP-LAYOUT-REF - 2026-10-22 (IN_REVIEW)

Current salary earnings use full available width; calculation appears once in assignment context. Payslip/class IDs and long payment tokens use compact display-only references consistently in modal/PDF. Short supplied payment references remain readable. Original identifiers remain authoritative in storage. No financial calculation changes.
## PAYROLL-PROGRESS-FILTER - 2026-10-22 (IN_REVIEW)

Acceptance: reduced progress-section height, removed redundant explanatory paragraph, method label and paid percentage on the same line, accessible progressbar. Progress uses selected calculation method with zero-payable guard; overall KPI totals remain branch-wide. Test verifies 25% fixed, 75% percentage and 63% combined after switching each option. Seven focused tests and targeted ESLint PASS.
## PAYROLL-COURSE-BATCH-FILTERS - 2026-10-22 (IN_REVIEW)

Acceptance: shared accessible custom menus for All Courses/All Batches; batch choices depend on selected course; changing course resets batch/page; All Courses restores all assignment batches, labeled with their course. Table and exports honor selected IDs. Paid badges emerald, partial badges amber with textual labels and dark variants. Salary/payment persistence and progress calculation unchanged.
## PAYROLL-METHOD-MENU-WIDTH - 2026-10-22 (IN_REVIEW)

Compact All Methods menu uses 140–150px width and right alignment. Existing options/filter behavior retained; no shared component changes.
## PAYROLL-ACTIONS-MENU - 2026-10-22 (IN_REVIEW)

Acceptance: each row presents an accessible three-dot menu trigger; existing eligible actions appear inside a styled icon menu. Existing payments, agreement and payslip callbacks preserved. Menu positions above/below within viewport, supports arrow navigation, Escape, outside dismissal and focus restoration on selection.
## PAYROLL-TABLE-SPACING - 2026-10-22 (IN_REVIEW)

Acceptance: assignment/teacher columns receive additional space; three-dot Actions sits at the right edge; numeric columns align with matching headers; consistent header padding and tracking create separation. Assignment text wraps safely without forced table width.
## PAYROLL-TABLE-100-ZOOM - 2026-10-22 (IN_REVIEW)

Acceptance: compact normal-zoom desktop table, responsive text/padding, increased salary/status allocation, unbroken method labels, no forced horizontal width. Mobile stacked rows retained. Exact screenshot parity requires visual review at the owner's viewport.
## FINANCE-SHORT-REFERENCES - 2026-10-22 (IN_REVIEW)

Acceptance: transaction descriptions exclude bracketed payroll/advance tokens; Finance table and exports use compact EXP/RC display refs. Shared payslip/class/payment display refs have three digits. Stored keys, transaction references and financial links remain unchanged; short aliases are presentation only and may repeat.
## ROLE-MATRIX-UPDATE - 2026-10-22 (IN_REVIEW)

Authorization: owner-supplied final five-role matrix and attached instructions. Scope: existing Admin full module grants, Receptionist full supported admission workflow, restricted administration modules, operational reports/assets and safe existing-class editing. New classes.edit separates editing from create/delete. Admin may not modify, disable or delete Admin/Super Admin accounts or grant those roles through the existing standard staff flow. Receptionist reports exclude expenses and hide the Finance report tab. Owner assets readonly; branch reports allowed without cross-branch comparison. Teacher's unimplemented self-service modules stay denied; no new broad access is substituted for own-record scopes. Monthly approval/four salary methods in the illustration remain superseded by the explicit running-balance decisions. Final acceptance remains IN_REVIEW.
# ROLE-TAB-ACCESS-STRICT — Strict role-based module discovery and access

**Status:** IN_REVIEW — owner acceptance required.

Centralize visible modules, hide denied sidebar/mobile/search entries, protect direct routes including Teacher Payroll, preserve service/action/export authorization, re-evaluate permissions after branch changes, and clear transient sensitive cache on logout. Existing UI and domain calculations remain unchanged. Teacher remains dashboard-only until separately approved own-record route/query implementations exist; broad branch records were not exposed to simulate missing self-service screens.

## DASHBOARD-PREMIUM-THEME — Shared premium role-dashboard styling

**Status:** IN_REVIEW. Reuse the existing Super Admin KPI card primitive across five roles; align Owner, Receptionist and Teacher headers, content panels, spacing, borders, radii and shadows without changing data, calculations, actions or permissions. Preserve Super Admin presentation and responsive behavior.

## LOGIN-MOCK-CREDENTIAL-REPAIR - Local Super Admin sign-in

**Status:** IN_REVIEW. Ensure the ignored local Vite environment exposes the configured Super Admin email/password to the existing mock credential adapter, reload the dev server environment, preserve browser data and verify the login form in a disposable browser.

## PAYROLL-REPORTS-CACHE-20261022

**Status:** IN_REVIEW. Teacher Payroll & Salary Ledger is accessible to current-branch Admin/Super Admin and readonly/export Owner; Receptionist receives no payroll records, Teacher remains denied organization reports. Salary values project existing saved obligations; verified payments include linked source lines exactly once. Setup-only assignments are excluded. Existing report filters, row selection and PDF/CSV template are reused. Tenant remains the single academy namespace; source/session/organization signatures scope and invalidate the shared transient cache. Full validation evidence is recorded in PROGRESS.md.
## ROLE-DATA-FLOW-20261022 — Five-role authoritative dashboard data flow

**Status:** IN_REVIEW
**Authorization:** Owner approved, 2026-10-22.

Acceptance evidence: role dashboards no longer use invented KPI/activity/session values; one branch-scoped projection reads canonical saved records. Teacher results are intersected with the logged-in teacher's assignments, batches, subjects and active enrollments. Verified fee receipts, payroll rows and posted expenses are projected only to approved roles. Transient cache entries include account, branch, effective role and permission signatures and are invalidated by database, organization or session byte changes.

## ALL-ROLE-PREMIUM-RESPONSIVE-20261022 — Shared responsive presentation

**Status:** IN_REVIEW
**Authorization:** Owner approved, 2026-10-22.

Acceptance evidence: the existing Super Admin visual system is shared by all role dashboards without copying restricted content. The shell, mobile drawer, global search, KPI/action grids, forms, tables and dialogs fit the required phone, landscape, tablet and desktop widths. Narrow Receptionist cards and 1024px Teacher actions no longer create document-level horizontal overflow. Business logic, data, permissions and Super Admin design remain unchanged.

## TEACHER-PROFILE-DASHBOARD-CLEANUP-20261022 — Teacher self-service cleanup

**Status:** IN_REVIEW
**Authorization:** Owner approved, 2026-10-22.

Acceptance: Teacher My Profile omits Back to Dashboard, WhatsApp and Call actions; administrative faculty profiles retain their existing back/contact controls. Teacher Dashboard omits the complete Instructor Actions section. Profile KPIs and academic assignments use the permission-scoped own-record projection and never broaden Teacher access to branch-wide faculty or students.

## FINAL-FRONTEND-QA-DEV-PUSH-20261023 — Owner-authorized release QA

Scope: full ESLint, complete Vitest, production build, five-role saved-data and access checks, payroll/report/export reconciliation, cache invalidation, responsive browser QA and reviewed normal `dev` commit/push. Existing work, data and artifacts must survive. No new dependencies, disabled rules/tests, backend work, reset/stash/clean, rebase or forced push. Acceptance evidence is centralized in `FINAL_FRONTEND_QA_20261023.md`; Git publication is conditional on the final passing gates and unchanged remote ancestry.
