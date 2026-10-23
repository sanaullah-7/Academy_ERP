# RBAC_PERMISSIONS

> Purpose: Defines authoritative role-based module, action and record-level permissions per tenant and branch.

# TSA Academy ERP — Role-Based Access Control & Permissions Specification

**Document:** RBAC_PERMISSIONS.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Status:** DRAFT — Approved Business Boundaries; Backend Implementation Pending
**Last Updated:** 2026-10-23
**Frontend:** React + Vite
**Backend:** Node.js + Express
**Database:** MongoDB + Mongoose
**Security Model:** Role-Based Access Control (RBAC) + Organization, Branch and Record-Level Authorization

---

## 1. Purpose

This document defines the Role-Based Access Control (RBAC) architecture for TSA Academy ERP.

It establishes which users may access particular modules, view information, execute actions, manage records and access confidential financial or academic data.

The purpose is to ensure that the future backend enforces the approved functionality of the completed frontend without granting additional privileges.

This specification covers:

- Five application roles.
- Role-specific module access.
- Action-level permissions.
- Multi-branch authorization.
- User and record ownership.
- Teacher self-service.
- Admissions and Fees permissions.
- Financial and payroll restrictions.
- Admin privilege escalation protection.
- Server-side authorization middleware.
- Permission testing and audit requirements.

**Important:** Frontend role guards are demonstration and user-experience controls. The future backend must independently enforce authorization.

---

## 2. Current Application Roles

The existing frontend supports five roles.

| Role | Primary responsibility |
|---|---|
| Super Admin | Overall academy administration and authorized branch operations |
| Admin | Operational and administrative management within authorized branches |
| Receptionist | Admissions and Fees management, plus approved front-desk activities |
| Owner | Authorized management reporting, financial information and limited approved operations |
| Teacher | Own teaching dashboard, assignments, schedule, profile and compensation |

### Mandatory Rules

1. Roles must use centralized definitions.
2. Roles must not be inferred from displayed user names or account titles.
3. Administrative authority must not be inferred from a role's name alone.
4. Effective permissions must account for branch and record restrictions.
5. Unknown roles and permissions must be denied.
6. Platform Admin is not an implemented application role.
7. Future SaaS roles require separate approval.

---

## 3. Authorization Architecture

Every protected backend operation must evaluate:

```text
Authenticated User
       |
       v
Account Status
       |
       v
Organization Scope
       |
       v
Authorized Branch
       |
       v
Effective Role
       |
       v
Required Permission
       |
       v
Record Ownership / Assignment
       |
       v
Business Rule Validation
       |
       v
ALLOW or DENY
```

An action is permitted only when all required conditions are satisfied.

### Security Principle

**Authentication identifies the user. Authorization determines what the user may do.**

A valid login does not automatically authorize access to all branches, records or financial information.

---

## 4. Current Effective Module Access Matrix

The following table documents the approved direction and currently reported frontend behavior.

Specific action-level grants must be verified against the effective frontend permission registry before backend implementation.

| Module | Super Admin | Admin | Receptionist | Owner | Teacher |
|---|---|---|---|---|---|
| Dashboard | Full authorized | Full authorized | Front-desk dashboard | Owner dashboard | Own dashboard |
| Admissions | Full | Full within branch | **Full** | View only | No access |
| Students | Full | Full within branch | Approved operational access | View only | Assigned records only |
| Courses & Batches | Full | Full within branch | Approved read access | View only | Assigned academic information |
| Faculty & Classes | Full | Full within branch | Approved operational access | View only | Own classes and timetable |
| Fees | Full | Full within branch | **Full** | Authorized read access | No general Fees management |
| Finance Overview | Full | Full within branch | No access | Authorized financial views | No access |
| Expenses | Full | Full within branch | No access | Existing approved expense permissions | No access |
| Teacher Payroll | Full | Full within branch | No access | Authorized read-only payroll overview | Own compensation via My Profile only |
| Demo Classes | Full | Full within branch | Approved front-desk operations | View only | No general management |
| Assets & Inventory | Full | Full within branch | Approved inventory operations | View only | No general access |
| Reports & Ledgers | Full | Full within branch | Authorized operational reports only | Authorized reports | Own teaching/compensation information only |
| Audit Log | Full within approved scope | Full within approved scope | No access | No access | No access |
| Branches | Approved management | Restricted branch administration | No access | No access | No access |
| Users | Full authorized management | Restricted user administration | No access | No access | No access |
| Settings | Full authorized management | Approved branch administration | No access | No access | No access |
| My Profile | Own account | Own account | Own account | Own account | **Full own-profile read access** |

### Interpretation

- **Full** means access to all currently approved and implemented actions within that module and the user's authorized scope.
- **View only** means read access without implied mutation privileges.
- **Approved operational access** must be resolved to actual permission identifiers and allowed actions from the frontend.
- **Assigned records only** requires server-side verification of teaching assignments.
- **No access** means deny the corresponding general module APIs.
- Self-service endpoints must remain distinct from administrative endpoints.
- This table does not authorize future features, refunds or unrestricted cross-branch actions.

### Important Qualification

This document records the latest approved direction, not proof that every operation listed above is implemented in production.

The backend must use the verified frontend permission registry and owner-approved changes when finalizing action-level grants.

---

## 5. Super Admin Permissions

### Purpose

Super Admin manages the academy and its authorized operational branches.

### Approved Direction

Super Admin may manage:

- Dashboard and institutional information.
- Admissions and Students.
- Academic programs, batches and subjects.
- Faculty and classes.
- Fees and authorized financial records.
- Teacher Payroll.
- Demo Classes.
- Assets.
- Reports.
- Users and approved staff assignments.
- Branch lifecycle operations.
- Settings.
- Authorized Audit Log records.

### Mandatory Restrictions

Super Admin must still comply with:

- Backend authentication.
- Organization ownership.
- Approved branch and reporting scope.
- Referential integrity.
- Financial transaction rules.
- Record-specific restrictions.
- Audit requirements.
- Current branch creation pause.

### Branch Creation Pause

New branch creation is currently disabled until the owner explicitly reauthorizes it.

The backend must not automatically enable branch creation because Super Admin normally has branch-management permissions.

### All-Branches Access

Where the frontend supports an approved cross-branch reporting capability, the backend must verify the specific reporting permission.

All-Branches selection must not become a general bypass for mutations or confidential record access.

---

## 6. Admin Permissions

### Purpose

Admin manages approved academy operations within explicitly authorized branches.

### Authorized Capabilities

Admin may use current operational and administrative modules to the extent supported by the verified frontend permission registry.

Admin must respect active-branch and record-level restrictions.

### Privilege Escalation Protection

Admin must not:

1. Create or assign Super Admin roles.
2. Grant Admin or Super Admin privileges beyond the current approved policy.
3. Modify or downgrade existing Super Admin accounts.
4. Modify protected Admin accounts through unauthorized operations.
5. Switch identity into a Super Admin account through administrative tools.
6. Read or mutate another branch's records without an explicit grant.
7. Bypass current branch creation restrictions.

These checks must be enforced by backend services and not only by hidden frontend controls.

### Privileged User Updates

Before editing another user, verify both:

- The acting Admin's current permissions.
- The target account's role and protected status.

Never permit a generic user-update request to modify protected authorization fields without explicit approval.

---

## 7. Receptionist Permissions

**Status: CONFIRMED — Owner Approved**

Receptionist must have **FULL access to the Admissions and Fees modules**.

These are two independent operational modules; their access does not authorize broader Finance or Administration privileges.

### 7.1 Admissions — Full Access

Receptionist may perform the currently approved and implemented Admissions operations, including:

- View admission lists.
- Search and filter admissions.
- Open admission details.
- Create new admissions.
- Edit existing admissions.
- Review admission information.
- Approve admissions.
- Return approved admissions to Pending where permitted.
- Complete valid enrollment operations.
- Use approved instant-admission workflows.
- Delete admissions where the existing admission-status and linked-record safeguards allow deletion.

### Admission Restrictions

Receptionist must still respect:

- Authorized branch.
- Valid student/course/batch references.
- Existing status-transition rules.
- Linked enrollment and financial-record protections.
- Duplicate admission/enrollment constraints.
- Confirmation requirements.
- Server-side validation and auditing.

Full access does not allow bypassing business invariants.

### 7.2 Fees — Full Access

Receptionist may perform approved existing Fees operations, including:

- View student fee records.
- View challans.
- Issue or manage authorized challans.
- Record fee collections.
- Record supported partial fee payments.
- View verified payments.
- Access payment receipts.
- Handle permitted fee operations associated with instant admissions.
- Use existing Fees module search, filtering and reporting views where authorized.

### Fee Restrictions

Receptionist must not:

- Access independent Finance Overview APIs.
- Manage academy operating expenses.
- Access Teacher Payroll.
- Approve unsupported refunds.
- Reverse or erase historical payments without a separately approved workflow.
- Modify another branch's financial records.
- Override amounts outside current approved fee rules.

### 7.3 Other Front-Desk Access

Receptionist may use other explicitly approved operational features such as:

- Authorized student views and edits.
- Permitted demo-class management.
- Existing permitted faculty/class views or limited actions.
- Permitted physical asset registration and editing.
- Authorized operational reports.

These are not blanket grants. Exact operations must match the frontend's effective permission registry.

### 7.4 Explicit Denied Modules

Receptionist cannot access:

- Independent Finance.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branch Management.
- User Management.
- Administrative Settings.

This restriction must be tested at the actual service and API boundaries.

---

## 8. Owner Permissions

### Purpose

Owner accesses authorized institutional, academic and financial information.

### Authorized Direction

Owner may access:

- Owner-specific dashboard.
- Approved read-only academic information.
- Admissions and Student views.
- Courses, batches and faculty information.
- Fee-related summaries.
- Finance overview.
- Authorized expense functions.
- Read-only Teacher Payroll overview.
- Approved Reports and Ledgers.
- Physical asset inventory views.
- Approved demo-class views.

### Restrictions

- No implied permission to edit academic records.
- No general staff account administration.
- No unrestricted branch management.
- No administrative Settings access.
- No Audit Log access under the current effective policy.
- No unauthorized payroll mutation.

### Expense Permissions

The existing frontend reportedly includes Owner expense-management capabilities.

Before backend implementation, verify the exact create, edit, delete, post and other expense permissions in the current source.

Do not silently grant unrestricted financial correction or reversal authority.

### Branch Scope

Owner may access only branches and cross-branch reporting contexts explicitly authorized by the effective permission policy.

---

## 9. Teacher Permissions

**Status: CONFIRMED — Self-Service Access**

### 9.1 Teacher Dashboard

Teacher may access their own dashboard and permitted assignment-related information.

Examples include:

- Assigned classes.
- Upcoming teaching sessions.
- Assigned batches.
- Teaching activity.
- Personal remuneration summaries.

Teacher must not receive branch-wide administrative access.

### 9.2 My Profile

**Frontend route:** `/my-profile`

The authenticated Teacher must be able to view their own profile.

The existing frontend includes four tabs:

1. **Overview & Bio**
2. **Class Schedule & Timetable**
3. **Academic Assignments**
4. **Salary & Compensation**

### 9.3 Overview & Bio

Teacher can view their own approved:

- Name and professional information.
- Contact details.
- Biography.
- Approved qualifications or credentials.
- Personal faculty information.

Sensitive fields must be limited to what is approved for self-display.

### 9.4 Class Schedule & Timetable

Teacher can view:

- Own classes.
- Assigned class timings.
- Course/batch details.
- Approved timetable information.
- Existing printable timetable.

The backend must verify the relevant teaching assignment.

### 9.5 Academic Assignments

Teacher can view:

- Own assigned courses.
- Own assigned batches.
- Own subjects.
- Associated teaching responsibilities.
- Permitted student information relating to actual assignments.

Access to another teacher's assignments must not be inferred from the shared branch.

### 9.6 Salary & Compensation

Teacher may view their own:

- Salary agreements.
- Assignment-based remuneration.
- Fixed/Percentage agreement type.
- Agreed salary totals.
- Verified payments.
- Outstanding salary.
- Payment dates and references.
- Payment methods.
- Payslip information.

The Teacher may view, print and export their own payslips according to the existing supported workflow.

### 9.7 Salary Notifications

Teacher may receive and view their own approved salary-payment notifications.

Notifications must not reveal another staff member's compensation.

### 9.8 Teacher Restrictions

Teacher cannot:

- Manage other faculty accounts.
- View other teachers' salaries.
- Modify salary agreements.
- Record payroll payments.
- Create operating expenses.
- Access general Teacher Payroll administration.
- Manage Users, Branches or Settings.
- Access the Audit Log.
- Obtain branch-wide student or financial data.

### Important Distinction

**Teacher self-compensation access is not the same as permission to view the administrative Teacher Payroll module.**

These must remain separate permissions and API authorization paths.

---

## 10. Teacher Payroll Authorization

The approved payroll model is **assignment/batch/subject-based running salary**, not automatic monthly salary.

### Administrative Access

Approved Admin and Super Admin roles may perform authorized salary management and payment operations within their assigned scope.

Owner may access the current authorized read-only payroll overview.

Receptionist has no payroll access.

Teacher can only access their own remuneration through My Profile.

### Payroll Security Requirements

- Verify the faculty assignment.
- Verify the salary agreement and linked teacher.
- Verify branch and organization ownership.
- Verify the actor's payroll permission.
- Enforce outstanding-balance constraints.
- Prevent duplicate payments.
- Prevent unauthorized edits to historical payments.
- Preserve assignment-specific salary records.
- Record matching posted expenses.
- Record required audit events.
- Prevent new salary obligations from being generated solely because a new month begins.

### Calculation Ownership

Exact Fixed/Percentage salary formulas must come from verified frontend source code.

Do not create role-specific copies of salary formulas.

---

## 11. Branch-Based RBAC

A user may be assigned to multiple branches.

Example:

```text
User A
  |
  +-- Branch 1: Teacher
  |
  +-- Branch 2: Receptionist
```

The user's permissions must be evaluated independently in each branch.

### Branch Switching Rules

1. Authenticate the user.
2. Load active branch-role assignments.
3. Permit selection only among authorized branches.
4. Recompute effective permissions after switching.
5. Reject inaccessible or inactive branches according to current policy.
6. Prevent previous-branch data from leaking through cached queries or responses.

### Cross-Branch Access

A user with access to Branch 1 must not automatically access Branch 2.

An academy-wide or multi-branch reporting privilege must be explicit.

All-Branches reporting must not authorize unrestricted writes.

---

## 12. Multiple Roles Within One Branch

Historical requirements propose allowing multiple roles within the same branch.

However, the current audited frontend fails closed on unsupported combinations.

### Current Effective Rule

Do not silently combine privileges from multiple same-branch roles.

Until the owner approves a definitive role-combination strategy:

- Treat ambiguous role combinations as unauthorized for affected operations.
- Do not automatically union all permissions.
- Do not permit one role to override an explicit restriction of another.
- Prevent privilege escalation through mixed-role assignments.

Different roles across separate branches remain supported.

### Future Decision

A final multi-role policy must specify:

- Whether permissions combine.
- Whether explicit denials take precedence.
- Whether sensitive operations require a selected active role.
- Whether some combinations are prohibited.
- How record scope is determined.

This remains unresolved.

---

## 13. Permission Naming Convention

Use centralized, stable permission identifiers.

Recommended pattern:

```text
resource.action
```

Examples:

| Permission | Responsibility |
|---|---|
| `dashboard.view` | View an authorized dashboard |
| `admissions.view` | View admission records |
| `admissions.create` | Create an admission |
| `admissions.edit` | Edit admission details |
| `admissions.decide` | Perform authorized admission decisions |
| `admissions.enroll` | Enroll an approved admission |
| `admissions.delete` | Delete an admission under approved rules |
| `students.view` | View authorized student records |
| `fees.view` | Read fee records |
| `fees.manage` | Perform permitted fee management |
| `fees.collect` | Record authorized fee payments |
| `classes.view` | Read permitted classes |
| `classes.edit` | Perform approved class edits |
| `expenses.manage` | Manage permitted expenses |
| `payroll.view` | View authorized payroll overview |
| `payroll.manage` | Manage authorized salary obligations/payments |
| `reports.view` | View authorized reports |
| `reports.compareBranches` | Perform authorized multi-branch comparisons |
| `assets.view` | Read inventory |
| `assets.manage` | Perform authorized inventory actions |
| `audit.view` | View authorized audit history |
| `branches.manage` | Manage allowed branch operations |
| `users.manage` | Manage permitted staff accounts |
| `settings.manage` | Modify approved settings |
| `profile.self.view` | View authenticated user's own profile |
| `payroll.self.view` | View authenticated teacher's own compensation |
| `payroll.self.payslip` | Access authenticated teacher's own payslip |

**Important:** These are proposed canonical identifiers. Exact names must be reconciled against current frontend constants and service guards.

Do not rename implemented permission identifiers arbitrarily.

---

## 14. Permission Evaluation Rules

The backend must use a centralized authorization mechanism.

### Standard Evaluation

An operation is allowed only if:

1. A valid authenticated session exists.
2. The user account is active.
3. The requested operation belongs to the authenticated organization.
4. The requested branch is authorized.
5. The current effective role allows the action.
6. The target resource belongs to the permitted branch and organization.
7. Record ownership or teaching assignment restrictions pass.
8. Domain-specific business rules pass.

### Deny-by-Default

Reject operations when:

- Permission identifier is unknown.
- User role is unknown.
- Branch assignment is missing or invalid.
- Target record lies outside authorized scope.
- Required teaching assignment cannot be verified.
- Sensitive action lacks explicit authorization.
- Same-branch role combination is unresolved.
- Client-provided identifiers conflict with stored ownership.

---

## 15. Record-Level Authorization

Module access is not sufficient for every record.

### Students

Teachers may access only student information supported by their approved teaching assignments.

### Faculty

Teachers may access their own profile and assignments through self-service boundaries.

### Salary

A Teacher must not see another Teacher's agreement, salary payments, balances or payslips.

### Fees

Receptionist may work with authorized branch fee records but cannot use those records to gain independent Finance or Payroll access.

### Users

Admin must not edit or assign privileged accounts outside the approved ceiling.

### Reports

Report results and exports must apply effective role, branch and record restrictions.

### IDOR Protection

Changing a URL parameter or resource ID must never provide unauthorized access to another user or branch's protected records.

---

## 16. Backend Middleware Responsibilities

The proposed backend structure includes:

| Middleware | Responsibility |
|---|---|
| `authenticate.js` | Validate authenticated session |
| `authorize.js` | Enforce named action permissions |
| `tenantScope.js` | Resolve and validate organization ownership |
| `branchScope.js` | Verify authorized branch context |
| `recordOwnership.js` | Enforce user/assignment/record restrictions |
| `validateRequest.js` | Validate request inputs |
| `rateLimiter.js` | Prevent relevant request abuse |
| `csrfProtection.js` | Protect cookie-authenticated mutations |
| `errorHandler.js` | Return safe normalized errors |

### Middleware Rules

- Do not trust browser-local user roles.
- Do not trust arbitrary client-provided organization IDs.
- Do not permit unscoped database updates.
- Do not skip record authorization after a role check.
- Do not allow unknown permissions to pass.
- Keep the permission registry centralized.

Controllers and services must not bypass authorization merely because the route already uses an authentication middleware.

---

## 17. Sensitive Financial Authorization

Financial actions require explicit action-level authorization.

These include:

- Fee collection.
- Challan management.
- Payroll payments.
- Expense creation.
- Expense modification.
- Payment reversal.
- Refunds.
- Financial exports.

### Current Restrictions

- Receptionist can use approved Fees actions but not independent Finance or Payroll.
- Teacher can read their own compensation but cannot disburse salary.
- Owner can use approved finance views and verified expense permissions.
- Admin/Super Admin may perform authorized finance and payroll operations.
- Refunds, reversals and unsupported adjustments must remain disabled until approved.

Financial mutations must use appropriate transactions, idempotency and audit records.

---

## 18. Authentication, Session and Permission Changes

The final backend must handle:

- Login.
- Logout.
- Session expiration.
- Disabled accounts.
- Branch assignment changes.
- Role changes.
- Session revocation.
- Password changes.

### Permission Change Rules

When an authorized administrator changes an account's role or branch membership:

1. Validate the acting administrator's permission.
2. Validate the target account's protected status.
3. Validate proposed new assignments.
4. Persist authorized changes.
5. Record required audit events.
6. Ensure future requests use updated permissions.
7. Invalidate or refresh relevant session/authorization caches.

An existing session must not permanently retain revoked permissions.

---

## 19. Audit Requirements

Sensitive permission and security changes require traceability.

Examples:

- User created.
- Role changed.
- Branch membership changed.
- User disabled.
- Protected account modification denied.
- Admission status changed.
- Fee payment recorded.
- Payroll payment disbursed.
- Sensitive financial report exported.

### Audit Data

Recommended metadata includes:

- Actor.
- Action.
- Timestamp.
- Organization.
- Branch.
- Resource type and identifier.
- Safe outcome details.
- Request reference.

Do not store passwords, session cookies, secret tokens or unnecessary personal details in audit entries.

Audit events must not be editable through ordinary application endpoints.

---

## 20. Frontend and Backend Authorization Alignment

### Current Frontend

```text
React Routes
   |
   v
ProtectedRoute
   |
   v
Module Access Registry
   |
   v
Domain Service Guards
   |
   v
Mock Database Authorization
```

### Future Backend

```text
Authenticated HTTP Request
   |
   v
Server Session
   |
   v
Organization + Branch Scope
   |
   v
Permission Registry
   |
   v
Record Ownership
   |
   v
Business Validation
   |
   v
Authorized Database Operation
```

The backend must not assume that the frontend has performed the necessary security checks.

### Compatibility Rule

The final permission registry must preserve the frontend's approved user experience while enforcing actual server-side authorization.

If frontend UI visibility and server authorization disagree, the secure server policy must control the operation, and the mismatch must be investigated.

---

## 21. RBAC Test Requirements

Future authorization implementation tickets must include both positive and negative tests.

### Role Tests

- Super Admin approved operations.
- Admin branch-scoped operations.
- Receptionist full Admissions.
- Receptionist full Fees.
- Receptionist denied Finance.
- Receptionist denied Teacher Payroll.
- Owner permitted views and verified expense operations.
- Teacher own My Profile.
- Teacher own salary and payslip.
- Teacher denied another Teacher's compensation.

### Branch Tests

- Valid branch assignment.
- Invalid branch assignment.
- Different roles in different branches.
- Same-branch unresolved multi-role fail-closed behavior.
- Unauthorized cross-branch record access.
- Authorized report comparison scope.
- Branch access revocation.

### Administrative Tests

- Admin denied Super Admin role creation.
- Admin denied modification of protected accounts.
- Unauthorized user-role updates.
- Branch creation pause enforcement.
- Unauthorized settings changes.

### Financial Tests

- Unauthorized payroll payment.
- Unauthorized fee payment.
- Valid Receptionist fee collection.
- Cross-branch financial denial.
- Unapproved refund/reversal denial.
- Duplicate payment protection.
- Teacher payroll history confidentiality.

### Session Tests

- Expired session.
- Disabled account.
- Role changes during active session.
- Branch revocation during active session.
- Invalid or manipulated identifiers.

A test must not be reported PASS unless it has actually been executed successfully.

---

## 22. Final Approval and Implementation Boundaries

### Confirmed Business Decisions

- Exactly five implemented frontend roles.
- Receptionist full approved Admissions access.
- Receptionist full approved Fees access.
- Receptionist denied independent Finance and Payroll management.
- Teacher access to own My Profile and compensation.
- Teacher cannot see another Teacher's salary.
- Payroll is assignment-based, not automatically monthly.
- Admin privilege restrictions.
- Branch-aware authorization.
- Existing branch creation pause.

### Proposed Backend Design

- Centralized permission identifiers and registry.
- Express authorization middleware.
- Record ownership policies.
- Database-backed session and branch assignment checks.
- Specific permission-to-endpoint mappings.
- Permission cache invalidation strategy.

### Unresolved / TBD

- Final same-branch multi-role permission-combination policy.
- Exact action-level permission identifiers where source verification is pending.
- Final production session policy.
- Role-specific financial reversal/refund approvals.
- Record-level reporting and export restrictions not already implemented.
- Future Platform Admin authorization.

### Deferred

- Multi-client SaaS administration.
- Unapproved financial overrides.
- New roles outside the existing five.
- Cloudinary/media access policies until uploads are approved.

### Not Implemented

- Production backend RBAC enforcement.
- Server-side sessions.
- MongoDB-backed authorization.
- Production record-ownership middleware.
- Backend authorization integration tests.

---

## 23. Related Documentation

This document must remain aligned with:

- `SECURITY.md` — Authentication, authorization and security requirements.
- `PRD.md` — Product functionality.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Backend architecture.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — Proposed MongoDB persistence design.
- `API.md` — Proposed API endpoints.
- `FRONTEND_INTEGRATION.md` — Current frontend service interfaces.
- `FRONTEND_AUDIT.md` — Audited module implementation.
- `ROLE_BRANCH_DATA_MATRIX.md` — Effective frontend role/branch access evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend transition requirements.
- `MEMORY.md` — Owner-approved decisions and changes.
- `RULES.md` — Engineering practices.
- `AGENTS.md` — Coding-agent instructions.
- `PROGRESS.md` — Verified implementation evidence.

Relative links must be checked against the actual repository structure.

---

## 24. Governing Principle

**Every request must be authenticated, authorized for its intended action and branch, checked against the actual target record, and validated against applicable business rules.**

Receptionist's Full Admissions/Fees access and Teacher's own-profile/compensation access must remain functional without exposing unauthorized financial, administrative or cross-user information.

No role may bypass underlying integrity checks.

**Document Status:** DRAFT — Business access boundaries confirmed; detailed backend RBAC implementation pending source-level contract reconciliation and separate implementation authorization.


**Status:** PURPOSE ONLY — DETAILED BACKEND RBAC CONTRACT NOT YET AUTHORED.

The current frontend-effective matrix is [ROLE_BRANCH_DATA_MATRIX.md](../ROLE_BRANCH_DATA_MATRIX.md), governed by [SECURITY.md](../SECURITY.md). It contains five roles and frontend behavior evidence; production enforcement still requires a separate backend-security ticket.
