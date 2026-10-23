# TENANT_BRANCH_ISOLATION


<!-- > Purpose: Specifies tenant ownership, branch-scoped data access, multi-branch memberships and cross-tenant protection. -->

# TSA Academy ERP — Tenant & Branch Data Isolation Specification

**Document:** TENANT_BRANCH_ISOLATION.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Status:** DRAFT — Approved Branch Requirements; Backend Design Proposed
**Last Updated:** 2026-10-23
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Branch-Aware Modular Monolith
**Initial Deployment:** One Academy Organization, Multiple Branches

---

## 1. Purpose

This document establishes how TSA Academy ERP must separate and protect information belonging to different organizations, branches, users and teaching assignments.

It defines the security and data-isolation requirements for the future backend while preserving the existing frontend's approved multi-branch experience.

Its primary objectives are:

- Prevent unauthorized cross-branch data access.
- Preserve different user roles across branches.
- Enforce server-side organization and branch ownership.
- Protect student, admission, fee and salary records.
- Support authorized branch switching.
- Prevent cross-branch data contamination in APIs, reports and caches.
- Protect administrative operations.
- Maintain financial and historical record integrity.
- Allow future architectural growth without implementing unapproved SaaS features.

**Important:** Frontend branch selection and mock-data filtering do not provide production security. Isolation must be enforced independently by the backend.

---

## 2. Current Organization Model

**CONFIRMED:** The current ERP is intended for one academy organization operating multiple branches.

The backend may represent the academy using a stable `organizationId` or equivalent approved ownership identifier.

### Current Scope

- One academy organization.
- Multiple branches.
- Individual staff accounts.
- Different roles per authorized branch.
- Branch-scoped operational records.
- Authorized multi-branch reporting where supported.
- Shared academic information only where the verified data contract permits it.

### Deferred Scope

The following are not part of the current implementation:

- Platform Admin account.
- Multi-client SaaS provisioning.
- Subscription or license billing platform.
- Automated organization onboarding.
- Cross-organization staff administration.
- Tenant migration between organizations.

An organization ownership field is an isolation mechanism, not authorization to build a multi-tenant commercial platform.

---

## 3. Ownership Hierarchy

The proposed ownership model is:

```text
Academy Organization
         |
         +-- Branch 1
         |      |
         |      +-- Admissions
         |      +-- Enrollments
         |      +-- Students / permitted associations
         |      +-- Batches and Classes
         |      +-- Fee Challans and Payments
         |      +-- Faculty Assignments
         |      +-- Payroll and Expenses
         |      +-- Physical Inventory
         |
         +-- Branch 2
                |
                +-- Its own authorized operational records
```

Some identities and catalog entities may exist at organization level while their operational relationships remain branch-scoped.

For example, a User may have one identity with assignments to several branches. A Student's final organization-wide versus branch-specific identity design must follow the approved ERD and verified frontend data model.

**Do not duplicate identities or introduce cross-branch relationships without an approved reason.**

---

## 4. Ownership Scope Categories

Every persistent model must explicitly declare its approved ownership scope.

| Scope | Meaning | Typical candidates |
|---|---|---|
| Organization | Belongs to the academy as a whole | Organization settings, shared identities |
| Branch | Belongs to one academy branch | Admissions, batches, challans, expenses |
| Assignment | Restricted to a verified relationship | Teacher assignments and linked academic records |
| Self | Restricted to authenticated user identity | Teacher My Profile and own payslips |
| Authorized multi-branch | Explicitly approved read aggregation | Selected institutional reports |

These are scope categories, not role permissions.

Having permission to view a resource type does not mean a user may view every record of that type.

### Required Model Review

Before implementing each Mongoose model, document:

1. Owning organization.
2. Owning branch, if applicable.
3. Related user or assignment owner.
4. Allowed read scopes.
5. Allowed write scopes.
6. Historical ownership behavior.
7. Applicable unique/index constraints.
8. Whether cross-branch relationships are supported.

Unknown ownership requirements must remain `TBD`, not be guessed.

---

## 5. User and Branch Role Assignments

**CONFIRMED:** One staff user may belong to multiple branches and have different roles in different branches.

Example:

```text
User: Staff Member A

Branch 1:
  Role: Teacher

Branch 2:
  Role: Receptionist
```

The same user must receive different effective permissions when accessing each branch.

### Proposed Assignment Representation

A branch-role assignment may reference:

- Organization.
- User.
- Branch.
- Approved role or roles.
- Assignment status.
- Administrator responsible for the assignment.
- Creation and modification timestamps.

The authoritative data model belongs to `ERD.md` and `DATABASE.md`.

### Integrity Requirements

- Prevent duplicate or conflicting active assignments.
- Reject references to missing organizations, users or branches.
- Validate role identifiers against the approved role registry.
- Reject unauthorized role changes.
- Ensure changes take effect for subsequent protected requests.
- Preserve audit history.

### Same-Branch Multiple Roles

Historical specifications allow multiple roles within one branch, but the current audited frontend fails closed for unresolved combinations.

The backend must not silently combine role privileges.

Until a final policy is approved, ambiguous same-branch combinations must remain denied for affected operations.

---

## 6. Five-Role Branch Authorization

The application has five current roles.

| Role | Branch-scope requirements |
|---|---|
| Super Admin | Use only approved branch/academy-wide capabilities and reporting scope |
| Admin | Operate within explicitly authorized branches and protected role ceilings |
| Receptionist | Full approved Admissions and Fees within authorized branches |
| Owner | Read and operate only within verified financial/operational grants |
| Teacher | Access assigned teaching information and own profile/compensation |

### Receptionist

Full Admissions and Fees access does not grant unrestricted access to another branch.

A Receptionist assigned to Branch 1 cannot automatically read Branch 2 challans, admissions or payments.

### Admin

An Admin must not use a valid branch assignment to gain unauthorized Super Admin privileges or cross-branch mutation capabilities.

### Teacher

A Teacher may access their own self-service records, but assignment-based educational information must still respect verified teaching relationships and authorized scope.

### Super Admin

Broader administrative or multi-branch capabilities must be represented through explicit approved permissions, not arbitrary bypass rules.

---

## 7. Active Branch Selection

The frontend allows users to select an authorized active branch.

The selected branch is **request context**, not proof of authorization.

### Required Behavior

1. Authenticate the user.
2. Load currently active branch assignments.
3. Determine the available authorized branches.
4. Accept only a branch that the user is permitted to enter.
5. Recompute effective permissions for that branch.
6. Validate all subsequent resource operations against current server-side rights.
7. Prevent data from the previous branch from appearing in the new branch's UI state.

### Important Security Rule

A browser-controlled `branchId` must never be trusted without backend verification.

This applies whether the identifier appears in:

- URL parameters.
- Request body.
- Query parameters.
- Headers.
- Browser storage.
- Frontend context.

### Branch Switch Failure

If a previously authorized branch becomes inaccessible, the system must reject protected operations and provide a safe recovery path to an authorized branch or logout.

Do not silently switch the user into an unauthorized branch.

---

## 8. Backend Scope Resolution

A protected request must resolve its authorization context through trusted server information.

### Proposed Request Lifecycle

```text
Incoming API Request
         |
         v
Validate Session
         |
         v
Resolve Authenticated User
         |
         v
Resolve Trusted Organization
         |
         v
Load Current Branch Assignments
         |
         v
Validate Requested Branch
         |
         v
Evaluate Role and Action Permission
         |
         v
Check Target Record Ownership
         |
         v
Validate Domain Business Rules
         |
         v
Execute Scoped Database Operation
```

### Requirements

- Resolve identity from the authenticated session.
- Do not use client-supplied organization identifiers as authority.
- Verify actual branch membership or an explicitly approved wider capability.
- Revalidate target record ownership.
- Deny operations where scope cannot be verified.
- Do not reveal protected records through error messages.

The effective authorization context must be treated as trusted server-derived state only after the relevant checks succeed.

---

## 9. MongoDB Query Isolation

Every operational repository query must enforce the applicable organization and branch restrictions.

### Branch-Scoped Reads

Queries must include the approved ownership conditions.

Conceptual query:

```javascript
// Conceptual example only — not an implementation contract.
{
  organizationId: authenticatedOrganizationId,
  branchId: authorizedBranchId
}
```

### Record Reads

A record identifier alone is insufficient.

For example, a request for a challan must confirm both:

- The challan exists within the user's authorized organization/branch.
- The user has permission to view the corresponding financial record.

### Updates and Deletes

Sensitive mutations must use scoped conditions and appropriate version/transaction checks.

Never perform an unrestricted operation merely because the caller supplied a valid MongoDB ObjectId.

### Aggregations

MongoDB aggregation pipelines must apply trusted ownership filtering before exposing or combining protected records.

Joins/lookups must not accidentally import records from another organization or unauthorized branch.

### Cross-Collection Relationships

A valid `studentId`, `batchId`, `paymentId` or `teacherUserId` does not prove that the related record belongs to the correct scope.

Validate the actual relationship and ownership.

---

## 10. Organization-Level and Branch-Level Data

Not every entity necessarily belongs to one branch.

### Organization-Level Candidates

- Academy identity.
- Shared user identity.
- Approved organization branding.
- Shared catalog definitions where verified.

### Branch-Level Candidates

- Admissions.
- Enrollment activity.
- Teaching batches.
- Faculty assignments.
- Classes.
- Challans.
- Fee payments.
- Expenses.
- Physical inventory.
- Branch-specific reports and audit events.

### Conditional Entities

- Students.
- Courses.
- Subjects.
- Streams.
- Settings.
- Salary agreements that depend on branch-linked faculty assignments.

Their exact scope must be verified against current frontend behavior and finalized in the ERD.

**Do not apply a branch filter blindly to organization-level entities, and do not expose branch-owned records through unscoped organization-level queries.**

---

## 11. Cross-Branch Record References

Relationships across branches require explicit support.

Examples of potential problems:

- An admission in Branch 1 referencing an unauthorized Batch in Branch 2.
- A payment in Branch 2 attempting to settle Branch 1's challan.
- A faculty assignment referencing a teacher without valid branch access.
- A payroll obligation referencing another branch's salary agreement.
- An asset assignment referencing an unauthorized staff member.

### Required Rules

- Validate both sides of a relationship.
- Verify the owning organization.
- Verify branch compatibility.
- Reject unsupported transfers.
- Preserve historical branch references when records become inactive.
- Do not automatically change ownership when users switch branches.

Cross-branch student enrollment, branch transfer and shared-course policies remain subject to the approved data model.

---

## 12. Admissions and Student Isolation

Admissions must belong to an explicitly authorized branch.

The backend must validate:

- Admission branch.
- Related student identity.
- Selected course and batch.
- Enrollment branch.
- Linked challan.
- Any initial payment.

### Admission Workflow

```text
Authorized Branch
        |
        v
Admission
        |
        v
Student / Enrollment
        |
        v
Challan
        |
        v
Optional Verified Payment
```

All linked operations must maintain valid branch relationships.

### Receptionist Access

Receptionist has full approved Admissions access only within their permitted scope.

### Teacher Access

Teacher must not receive general Admissions access through teaching assignments.

Student information available to Teacher must be limited to separately authorized teaching relationships.

---

## 13. Fees and Finance Isolation

Student fee records are sensitive branch-owned operational data.

### Fee Isolation Rules

- Challans must be read only within approved scope.
- Payments must reference authorized challans.
- Payment recording must not settle another branch's unrelated obligation.
- Only verified payments contribute to approved collection totals.
- Financial reports must apply authorization independently.
- Sensitive exports must enforce current branch and role permissions.

### Receptionist Boundary

Receptionist may perform the approved full Fees workflow.

However, access to Fees does not grant independent Finance, Expenses or Teacher Payroll access.

### Finance Data Sources

Authorized Finance summaries must derive from verified payments and posted expenses with correct branch ownership.

Do not combine multiple branches unless the requester has a specific approved multi-branch reporting capability.

---

## 14. Faculty Assignment Isolation

Teaching assignments define the relationship between:

- Teacher.
- Organization.
- Branch.
- Course.
- Batch.
- Subject.
- Approved schedule.

### Requirements

- Validate the teacher's current authorized branch relationship.
- Validate course, batch and subject ownership.
- Verify teaching assignment status.
- Prevent an assignment from granting broader academic or administrative access.
- Preserve assignment history required by salary records.
- Apply assignment-specific filters when retrieving teaching information.

A teacher assigned to one batch must not automatically gain access to all students and classes within the branch.

---

## 15. Teacher My Profile Isolation

**CONFIRMED:** Teachers may view their own profile, schedule, academic assignments, salary and payment history.

### Self-Scoped Access

Teacher identity must be derived from the authenticated session.

Proposed resources:

- Own profile and biography.
- Own timetable.
- Own academic assignments.
- Own authorized teaching records.
- Own salary agreements.
- Own running payroll obligations.
- Own verified payments.
- Own payslips.
- Own personal notifications.

### Mandatory Rules

1. Never use a client-supplied teacher ID as proof of self-access.
2. Prevent one Teacher from accessing another Teacher's compensation.
3. Do not expose administrative salary ledgers through self-profile endpoints.
4. Apply organization and relevant branch checks to linked assignments.
5. Prevent unrestricted access to students or classes outside teaching assignments.
6. Keep teacher self-service separate from payroll-management permissions.

### Multiple Authorized Branches

If a Teacher works in more than one branch, the self-profile data scope must follow the approved frontend presentation and server policy.

Do not automatically aggregate confidential records across branches where the active-branch contract requires filtering.

---

## 16. Payroll Branch Isolation

**CONFIRMED BUSINESS MODEL:** Assignment/batch/subject-based running payroll, not automatically generated monthly payroll.

### Payroll Relationships

```text
Teacher
   |
   v
Authorized Branch
   |
   v
Faculty Assignment
   |
   v
Salary Agreement
   |
   v
Running Payroll Obligation
   |
   +--> Verified Payroll Payments
   |
   v
Outstanding Balance
```

### Isolation Requirements

- Salary agreement must belong to the correct teacher and assignment.
- Obligation must reference the correct salary agreement.
- Payment must reference the correct obligation.
- All linked records must have consistent organization/branch ownership.
- A payment from one branch must not silently settle another branch's obligation.
- Historical obligations remain linked to their original assignments.
- Teacher self-service must not reveal another Teacher's remuneration.
- Receptionist has no payroll access.
- Owner payroll access is read-only under the current effective policy.
- Admin and Super Admin payroll management must follow authorized branch scope.

### Historical Data

Changing a teacher's branch access must not erase existing remuneration history.

Historical payment records retain original branch and assignment associations.

Revoking current branch access affects future viewing/operations according to the approved authorization policy; it does not transfer record ownership.

### No Monthly Generator

Do not create salary obligations merely because a new calendar month begins.

Each new eligible faculty assignment requires its own approved remuneration agreement or obligation according to the verified payroll rules.

---

## 17. Physical Assets and Branch Ownership

The Assets module manages physical academy inventory.

### Examples

- Computers.
- Laptops.
- Projectors.
- Furniture.
- Whiteboards.
- Institutional equipment.

### Isolation Requirements

- Assets belong to an approved organization/branch scope.
- Inventory codes must respect appropriate uniqueness constraints.
- Staff assignments must be validated.
- Inspections and maintenance must preserve history.
- Unauthorized users cannot modify another branch's inventory.
- Branch transfers require an explicitly approved workflow.

### Explicit Exclusions

No digital media storage is authorized.

Do not introduce:

- Cloudinary integration.
- Image uploads.
- Video uploads.
- Media galleries.
- Digital-file inventory services.

---

## 18. Branch Lifecycle Security

The existing frontend has approved branch management restrictions.

### Branch Creation

**Currently paused for all roles**, including Super Admin, until explicitly reauthorized.

### Branch Editing

Only approved editable fields may change.

Protected branch identifiers and historical ownership references must not be changed through generic edits.

### Branch Activation and Deactivation

Apply existing safeguards, including restrictions concerning:

- Current active branch.
- Last usable branch.
- Pending admissions.
- Active enrollments.
- Unpaid challans.

Exact conditions must match the current frontend's effective branch policy.

### Branch Deletion

Guarded deletion must respect:

- Inactive target status.
- Not deleting the current active branch.
- Absence of blocking operational records.
- Staff-assignment restrictions and approved exceptions.
- No cascading deletion of unrelated operational history.
- Safe atomic updates.

Backend implementation must verify the complete current branch policy before building these operations.

---

## 19. Cross-Branch Reporting

Multi-branch reporting is not the same as unlimited branch access.

### Reporting Requirements

- Require explicit `reports.compareBranches` or the current verified equivalent permission.
- Include only the branches authorized for that operation.
- Apply report-specific financial and personal-data restrictions.
- Restrict reports to read-oriented operations unless a separate mutation is explicitly approved.
- Prevent unapproved user-supplied branch lists from expanding scope.
- Verify export permissions separately.

### Super Admin

The current frontend includes selected authorized cross-branch reporting features. The exact permissible scope must be confirmed from the existing implementation.

### Admin

Admin must not automatically receive all-branch reporting because of broad within-branch administrative permissions.

### Owner

Owner's authorized reports must respect the effective branch access policy.

### Receptionist

Only explicitly permitted operational reports are available. Independent Finance reports must remain restricted.

### Teacher

Only approved own teaching and compensation information can be reported through self-service or assignment-specific access.

---

## 20. Cache and Frontend State Isolation

The backend and frontend must prevent stale or unauthorized cross-branch data reuse.

### Current Frontend

Branch switching triggers changes to active context and relevant service/route queries.

### Future HTTP Integration

Requirements:

1. Partition cached data by authenticated user and authorized scope.
2. Include branch context in relevant query/cache keys.
3. Invalidate protected data after logout.
4. Invalidate previous-branch data after branch switching.
5. Recheck permissions after role changes.
6. Prevent out-of-order responses from displaying data from a previously selected branch.
7. Avoid sharing confidential cached salary/financial responses across users.
8. Do not cache security-sensitive responses publicly.

Redis and realtime infrastructure are not mandatory for the initial backend.

Use simple, correct cache behavior before introducing more complex solutions.

---

## 21. Authorization Changes and Revocation

User access must reflect current authoritative assignments.

Examples:

- Staff member disabled.
- Teacher removed from a branch.
- Receptionist role revoked.
- Admin privileges reduced.
- Branch deactivated.
- Account password changed.

### Required Behavior

- Validate effective authorization on protected operations.
- Reevaluate current role and branch membership.
- Invalidate or refresh authorization caches.
- Revoke sessions where required by the approved security policy.
- Reject stale requests that no longer have permission.
- Preserve historical records and relevant audit history.

Do not allow a previously valid browser-selected branch to remain an authorization bypass after permission revocation.

---

## 22. Transactions and Multi-Record Consistency

Cross-collection operations must preserve ownership and business invariants.

### Sensitive Transactions

| Workflow | Required scope and consistency |
|---|---|
| Instant admission | Same approved branch across Admission, Student association, Enrollment, Challan and optional Payment |
| Enrollment | Correct Course/Batch/Branch and capacity |
| Fee payment | Authorized Challan and valid balance |
| Payroll payment | Correct assignment, obligation, teacher, branch and posted expense |
| Demo conversion | Correct inquiry and resulting Admission |
| Branch deletion | No blocking records and safe related assignment cleanup |
| User role updates | Authorized changes and appropriate session/permission refresh |

Use MongoDB transactions where related durable writes must succeed or fail together.

Transactions must be combined with appropriate validation, unique constraints, idempotency and concurrency checks.

---

## 23. Database Index and Constraint Strategy

Suggested index patterns must reflect organization and branch scope.

Examples:

| Data | Candidate strategy |
|---|---|
| Branches | Unique organization + branch code |
| Staff assignments | Organization + user + branch |
| Admissions | Organization + branch + status |
| Enrollments | Branch + student + course/batch relationship |
| Challans | Organization + branch + enrollment uniqueness |
| Fee payments | Organization + branch + challan/payment reference |
| Faculty assignments | Organization + branch + teacher + batch/subject |
| Payroll obligations | Assignment/agreement unique constraints |
| Payroll payments | Organization + branch + obligation/reference |
| Assets | Organization + branch + asset code |
| Audit events | Organization + branch + event timestamp |

These are candidates, not finalized index declarations.

Do not add indexes automatically without verifying the actual data model and query patterns.

### Important

Database indexes support isolation and integrity, but they do not replace application authorization.

---

## 24. Multi-Tenant Readiness Without Premature SaaS

The architecture may support organization ownership consistently so future organizational separation is possible.

However, the current product remains a single-academy application.

### Allowed Architectural Preparation

- Stable organization ownership.
- Consistent branch ownership fields.
- Scoped repository contracts.
- Secure identity/permission boundaries.
- Modular domain separation.
- Avoidance of hardcoded branch counts.

### Not Authorized

- Platform Admin dashboard.
- Tenant sign-up APIs.
- Subscription billing.
- Multi-academy onboarding.
- License management implementation.
- Tenant data transfer features.
- Separate tenant database provisioning.
- Cross-tenant sharing.

Do not build a multi-client platform prematurely.

---

## 25. Security Testing Requirements

Future backend isolation tests must include both allowed and denied cases.

### Organization Scope

- Valid organization-owned record access.
- Unauthorized organization ID injection.
- Cross-organization record denial if multi-organization test fixtures are available.
- Missing or malformed organization context.

### Branch Scope

- Authorized branch list.
- Unauthorized branch selection.
- Cross-branch student/admission access.
- Cross-branch challan access.
- Cross-branch fee payment rejection.
- Cross-branch asset modification denial.
- Branch deactivation and deletion safeguards.

### Role Scope

- Five-role effective permissions.
- Admin privilege ceiling.
- Receptionist full Admissions.
- Receptionist full Fees.
- Receptionist denied Finance and Payroll.
- Owner permitted views and approved expenses.
- Teacher own My Profile.
- Teacher denied other teachers' data.

### Assignment Scope

- Teacher own course/batch information.
- Teacher denied unrelated students/classes.
- Teacher own salary and payments.
- Teacher denied another assignment's compensation where not personally authorized.

### Concurrency and Revocation

- Role revoked during an active session.
- Branch assignment revoked during an active session.
- Stale branch-switch response.
- Simultaneous scoped financial writes.
- Duplicate payment submission.
- Unauthorized cached-data reuse.

No test may be labeled PASS without actual execution.

---

## 26. Implementation Guidelines

Backend implementation must proceed in small approved tickets.

Suggested order:

1. Organization/Branch foundation.
2. User identities and secure sessions.
3. Branch-role assignments and permission registry.
4. Scoped repository/query conventions.
5. Academic reference data.
6. Admissions, Students and Enrollments.
7. Fees and verified payments.
8. Faculty assignments and Teacher My Profile.
9. Assignment-based Payroll and Finance.
10. Demo Classes, Assets and Reports.
11. Audit, revocation, cross-branch verification and integrated security testing.

The presence of this plan does not authorize implementing all modules simultaneously.

---

## 27. Open Decisions

The following require further approval or source-level verification:

- Final same-branch multi-role combination policy.
- Whether Student identity is organization-level or branch-owned.
- Which academic catalog entities are shared.
- Exact teacher self-profile cross-branch presentation.
- Exact authorized cross-branch report semantics.
- Final database index choices.
- Production session invalidation intervals.
- Final account/branch archival rules.
- Student branch-transfer policy.
- Future SaaS isolation mechanisms.

Any unresolved access decision must fail closed for affected protected operations.

---

## 28. Related Documentation

This specification must remain consistent with:

- `PRD.md` — Product scope.
- `SYSTEM_DESIGN.md` — Approved workflows.
- `SECURITY.md` — Security architecture.
- `RBAC_PERMISSIONS.md` — Role/action permissions.
- `ARCHITECTURE.md` — Technical boundaries.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — Proposed MongoDB design.
- `API.md` — API structure.
- `FRONTEND_INTEGRATION.md` — Frontend service integration.
- `FRONTEND_AUDIT.md` — Implemented frontend evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend handoff mapping.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role/branch scope evidence.
- `MODULE_WORKFLOW_MAP.md` — Cross-module relationships.
- `BACKEND_GAPS_AND_RISKS.md` — Known backend risks.
- `RULES.md` — Engineering standards.
- `AGENTS.md` — Coding-agent rules.
- `MEMORY.md` — Approved decisions.
- `PROGRESS.md` — Verified functionality.

Adjust relative Markdown links according to actual file locations.

---

## 29. Final Implementation Boundary

### Confirmed Requirements

- One initial academy organization with multiple branches.
- Five implemented frontend roles.
- Different roles per authorized branch.
- Receptionist full approved Admissions and Fees access.
- Teacher self-only profile and remuneration access.
- Assignment-based running Payroll, without monthly salary generation.
- Current branch creation pause.
- Backend-enforced branch and record authorization.
- Physical inventory Assets, without media uploads.

### Proposed Technical Design

- Organization/branch ownership fields.
- Scoped database repository conventions.
- Specific middleware flow.
- Transaction and index strategy.
- Permission invalidation mechanisms.
- Exact cross-branch API behavior.

### Deferred

- Platform Admin and commercial SaaS provisioning.
- Cloudinary/media storage.
- Unapproved branch transfers.
- Unnecessary distributed infrastructure.

### Not Implemented

- Production tenant/branch isolation middleware.
- MongoDB-backed role assignments.
- Server-enforced multi-branch record filtering.
- Production secure sessions.
- Backend authorization integration tests.

**Governing Principle:** A user may access only the data and operations authorized for their authenticated identity, organization, branch, role and actual record relationship. A valid resource ID or selected branch alone must never grant access.

**Document Status:** DRAFT — Ready for backend isolation design review; implementation requires a separately approved development ticket.
