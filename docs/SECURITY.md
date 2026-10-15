<!-- Security & Access Control Specification — Super Admin, Owner, Receptionist aur Teacher kya dekh aur change kar sakte hain -->


# Academy Management ERP — Security & Access Control Specification

**Document:** SECURITY.md
**Version:** 1.0
**Status:** DRAFT — Pending Security and Permission Approval
**Updated:** 2026-10-10
**Project:** Academy Management ERP
**Application:** React + Vite, Node.js + Express, MongoDB + Mongoose
**Security Strategy:** Least Privilege, Server-Side Authorization, Branch Isolation and Defense in Depth

---

## Accepted Foundation / F01-001 Demo Route (2026-10-10)

Owner accepted F00's implemented mock access scope and separately authorized /dashboard shared skeleton under the existing workspace.view guard. No new permission or Super Admin bypass is granted. Sidebar navigation is available only with valid selected authorized branch context; invalid sessions/assignments retain existing recovery/denial flows. The page shows no real metrics or executable ERP actions.

Mock route access is not production security. Final role dashboard selection/combining, metric visibility, sensitive actions, All Branches and server authorization remain separately approval-gated. [Current evidence and limitations](PROGRESS.md#f01-001--dashboard-skeleton-delivery-2026-10-10).

---

## F00-010 Verified Mock Boundary (2026-10-09)

F00-005/006/007 implementations now exist and their current regression checks passed; earlier future-work wording is historical. F00-010 grants no additional permission: workspace.view remains the sole baseline for a valid assigned branch/recognized role. Unknown, ERP and sensitive operations remain denied to every role, including Super Admin. hasRole is informational and must never substitute for can(permission).

Mock storage/identity and branch filtering are not production authorization. Real backend enforcement, session revocation and privacy/integration validation remain unimplemented/unverified. Broad matrix, role-combining/deny policy, financial visibility, record scope and All Branches require approval before affected F01/ERP behavior. Full WCAG/security/remote CI audits were not performed. [Current evidence and readiness limitations](PROGRESS.md#f00-010--foundation-verification-delivery-2026-10-09).

---

## F00-005 — Approved Mock Permission Baseline (2026-10-09)

**Status:** CONFIRMED for frontend demo only, explicitly approved by the project owner.

Only `workspace.view` is allowed for a valid fictional enabled user with a concrete authorized branch and recognized branch-scoped role assignment. Every other permission is denied: unknown identifiers, ERP reads/writes, sensitive finance operations and administrative actions, including for Super Admin. Roles cannot bypass this allowlist. No All Branches capability or general permission-combination policy is introduced.

Mock persistence contains only user/branch IDs and a schema version; roles are reconstructed from canonical fictional fixtures. Malformed sessions, disabled users and unauthorized branches do not confer workspace access. Mock browser storage/route guards remain forgeable frontend UX and are not production authentication or authorization.

The broad proposed matrix and role-combination TBD later in this document remain unapproved for ERP/production use. This minimal baseline does not resolve them. F00-006/F00-007 remain separately approved future work. [Executed tests](PROGRESS.md#f00-005--completed-implementation-evidence-2026-10-09).

---

## 1. Purpose

This document defines the security requirements, authentication architecture, authorization rules, staff access, branch restrictions, sensitive information protections, financial controls, audit logging and security verification requirements for the Academy Management ERP.

It establishes security boundaries for the four primary roles:

- Super Admin
- Owner
- Receptionist
- Teacher

The initial application serves one academy organization with multiple branches.

This specification aims to protect student records, staff information, operational data and financial transactions from unauthorized access or modification.

This document must be reviewed before production authentication or authorization is implemented.

It does not authorize implementation of unapproved security decisions.

---

## 2. Decision Classification

Every security decision must be classified as:

**CONFIRMED:** Explicitly supplied or approved.

**PROPOSED:** Recommended security implementation awaiting approval.

**TBD:** A decision requiring clarification.

**DEFERRED:** Outside the present development stage.

**REJECTED:** Explicitly declined.

An unapproved permission must never be assumed simply because a user holds a role with an administrative-sounding name.

When a security-sensitive decision is unresolved, use deny-by-default behavior in the proposed design and flag the affected functionality as blocked until approval.

Do not invent permission grants.

---

## 3. Confirmed Security Requirements

### SEC-001 — Named Roles

The application supports four primary roles:

1. Super Admin
2. Owner
3. Receptionist
4. Teacher

### SEC-002 — Multiple Branch Assignments

One user may be assigned to multiple academy branches.

### SEC-003 — Different Roles by Branch

One user may hold different roles in different branches.

### SEC-004 — Multiple Roles in One Branch

One user may hold multiple permitted roles within the same branch.

### SEC-005 — Individual Staff Accounts

Staff accounts must be individually associated with users.

### SEC-006 — Branch-Sensitive Access

Access to protected information must respect authorized branch scope.

### SEC-007 — Backend Security Enforcement

Production authorization must be enforced by the backend.

React route guards and conditional navigation are not security boundaries.

### SEC-008 — Least Privilege

Users must receive only the access necessary for their approved duties.

### SEC-009 — Secure Authentication

Production access requires an appropriate secure authentication mechanism.

### SEC-010 — Sensitive Financial Controls

Sensitive financial operations must have explicit authorization and suitable audit trails.

### SEC-011 — No Hardcoded Credentials

Production passwords, tokens and secrets must never be hardcoded in source code.

### SEC-012 — Controlled Super Admin Access

Super Admin has approved branch-management responsibilities and an authorized all-branches reporting context.

Detailed sensitive-operation privileges still require explicit approval.

---

# 4. Security Architecture

## 4.1 Security Layers

The system must distinguish:

1. Authentication — identifying the user.
2. Account status — whether the account may access the system.
3. Branch authorization — determining permitted branches.
4. Role authorization — determining permitted action categories.
5. Record authorization — determining which specific records may be accessed.
6. Business-rule authorization — checking the action against domain rules.
7. Audit — recording sensitive changes.
8. Data protection — protecting information at rest and in transit.

### Proposed Request Flow

```text
Browser
   |
   v
HTTPS Request
   |
   v
Express Backend
   |
   v
Authenticate Session
   |
   v
Check Account Status
   |
   v
Determine Authorized Branch Scope
   |
   v
Check Effective Permissions
   |
   v
Check Record Ownership / Assignment
   |
   v
Validate Business Rules
   |
   v
Execute Authorized Operation
   |
   v
Record Required Audit Event
   |
   v
Return Safe Response
```

A request must not succeed solely because the frontend displays the relevant action.

---

# 5. Authorization Model

## 5.1 Core Model

**Status: PROPOSED**

Use branch-aware Role-Based Access Control (RBAC) together with record-level authorization checks.

RBAC determines which categories of actions a user is permitted to perform.

Record-level authorization determines which actual records that user may access.

### Example Permission Identifiers

- `dashboard.view`
- `students.read`
- `students.create`
- `students.update`
- `admissions.read`
- `admissions.create`
- `admissions.approve`
- `batches.read`
- `batches.manage`
- `classes.read`
- `classes.manage`
- `attendance.record`
- `invoices.read`
- `invoices.create`
- `payments.record`
- `payments.reverse`
- `discounts.approve`
- `expenses.read`
- `expenses.create`
- `reports.read`
- `branches.manage`
- `users.manage`
- `settings.manage`
- `audit.read`

These names are PROPOSED examples, not an approved complete permission catalog.

Use one centralized permission registry once approved.

Do not scatter permission definitions throughout unrelated components.

---

## 5.2 Authorization Scope

**Status: PROPOSED**

Permissions must operate within an explicitly defined scope.

Suggested scopes:

- `academy` — academy-wide administrative capability.
- `branch` — access limited to one authorized branch.
- `assigned` — access limited to assigned classes, students or other resources.
- `self` — access limited to the user's own profile or information.

Scope must be checked independently from the permission name.

For example, permission to read students does not necessarily permit reading every student in the academy.

---

## 5.3 Academy-Wide Super Admin

**Confirmed business direction:**

Super Admin can manage academy branches and staff assignments and use authorized All Branches views.

**Proposed implementation:**

Represent Super Admin academy-wide capabilities independently of ordinary branch assignments.

This allows legitimate access to newly created branches without manually inserting an unrestricted branch assignment for every branch.

All such capabilities must be explicitly defined in the approved permission policy.

Do not implement global Super Admin access merely through:

- A frontend Boolean flag.
- A hardcoded username.
- A special email address.
- A user-controlled role field.
- A client-supplied branch identifier.

---

# 6. Proposed Role-Permission Matrix

**IMPORTANT: THIS MATRIX IS A DESIGN PROPOSAL, NOT CLIENT-APPROVED AUTHORIZATION.**

Symbols:

- **P** — Proposed allowed.
- **C** — Conditional; requires explicit scope or business-rule approval.
- **—** — Not proposed for this role.
- **TBD** — Requires a client decision.

| Operation | Super Admin | Owner | Receptionist | Teacher |
|---|---|---|---|---|
| View own dashboard | P | P | P | P |
| View academy-wide summaries | P | TBD | — | — |
| View assigned branch summaries | P | P | P | C |
| Create/manage branches | P | TBD | — | — |
| Create/manage staff accounts | P | TBD | — | — |
| Assign staff roles | P | TBD | — | — |
| View student records | P | C | P | C |
| Create admission | C | C | P | — |
| Approve admission | TBD | TBD | TBD | — |
| Edit student information | C | C | P | — |
| Manage courses and batches | C | C | TBD | — |
| View assigned classes | P | C | C | P |
| Record attendance | C | C | TBD | TBD |
| View fee invoices | C | C | P | — |
| Record fee payments | TBD | TBD | TBD | — |
| Approve discounts | TBD | TBD | TBD | — |
| Reverse payments/refunds | TBD | TBD | TBD | — |
| View finance summaries | C | C | TBD | — |
| Record expenses | TBD | TBD | TBD | — |
| Register demo classes | C | C | P | C |
| Manage assets | C | C | TBD | — |
| View authorized reports | P | C | C | C |
| Change academy branding | P | TBD | — | — |
| View audit records | TBD | TBD | — | — |

### Interpretation Rules

The letter P does not grant implementation authorization.

Conditional permission C is not a grant until the required scope and restrictions are approved.

A dash represents the proposed default absence of permission, not a final client policy.

TBD must remain denied by default in production until the permission has been resolved.

### Required Approval

Before implementing the final permission registry, confirm:

- Super Admin sensitive financial authority.
- Owner's branch and academy-wide scope.
- Receptionist's collection and editing responsibilities.
- Teacher attendance and earnings access.
- Discount/refund/reversal approval authority.
- Audit-log visibility.
- Whether some actions require a second approver.

The approved matrix must replace this provisional matrix before the affected backend functionality becomes operational.

---

# 7. Multiple Roles and Effective Permissions

A user may have more than one role within the same branch.

Example:

```json
{
  "userId": "user_101",
  "branchId": "branch_002",
  "roles": ["teacher", "receptionist"]
}
```

This is fictional mock data.

## 7.1 Proposed Evaluation Rules

1. Authenticate the user.
2. Load current active assignments.
3. Identify the resource's actual branch.
4. Determine roles valid for that branch.
5. Evaluate the approved permission policy.
6. Apply record-level restrictions.
7. Apply sensitive-operation and business-rule restrictions.
8. Deny unless all required checks pass.

## 7.2 Permission Combining — TBD

The client must approve how multiple roles combine.

A possible design is to combine explicitly allowed non-sensitive capabilities, while continuing to enforce record scope and action-specific restrictions.

Sensitive permissions must not be granted simply by combining unrelated roles.

For example, having both Teacher and Receptionist roles must not automatically authorize refunds.

### Critical Rule

No role-combination strategy may bypass an explicit security restriction.

---

# 8. Branch Isolation

## 8.1 Active Branch Context

The frontend may allow the user to select an authorized branch.

The selection must be treated as a request context.

It is not security evidence.

## 8.2 Backend Branch Verification

For every branch-scoped operation, the backend must:

1. Authenticate the user.
2. Confirm the requested branch exists.
3. Confirm the user has valid access to the branch or an approved academy-wide capability.
4. Confirm permission for the requested action.
5. Confirm the target record belongs to the authorized scope.
6. Reject unauthorized access.

## 8.3 Avoid Client-Controlled Scope Escalation

Do not trust arbitrary `branchId` values supplied through:

- Query parameters.
- Request body.
- HTTP headers.
- Route parameters.
- Browser storage.
- Frontend context.

All provided identifiers must be validated against the authenticated user's current rights.

## 8.4 All Branches

An All Branches reporting context may combine information from multiple authorized branches.

PROPOSED:

Read-only aggregate views should use an explicitly authorized academy-wide or multi-branch scope.

Write operations should normally target one concrete authorized branch.

Do not interpret All Branches selection as permission to perform unrestricted bulk mutations.

---

# 9. Record-Level Authorization

Role permission alone may not be sufficient.

### Student Records

Access must respect approved academy, branch and staff relationships.

### Teacher Records

A teacher should only access student and teaching information associated with permitted assignments.

### Financial Records

Access must respect branch scope and specific finance permissions.

### Staff Accounts

Staff may access their own permitted profile information.

Other staff-account changes require administrative authority.

### Audit Records

Audit logs must be accessible only to explicitly authorized users.

### Anti-IDOR Requirement

An authenticated user must not be able to access a protected record simply by changing its identifier in a URL or API request.

Every relevant read, update, delete and export operation must enforce the actual resource scope.

---

# 10. Authentication Architecture

**Status: PROPOSED — Production Mechanism Pending Approval**

## 10.1 Authentication Requirements

Production authentication must support:

- Individual accounts.
- Secure login.
- Logout.
- Session validation.
- Session expiration.
- Disabled account handling.
- Controlled credential recovery.
- Protection against repeated authentication abuse.

## 10.2 Proposed Session Strategy

Use secure server-managed sessions with cookies carrying a session identifier.

Recommended cookie properties where applicable:

- `HttpOnly`
- `Secure` in production
- Appropriate `SameSite`
- Restricted `Path`
- No unnecessarily broad `Domain`

Session identifiers must be unpredictable and protected.

Session creation and rotation should follow secure lifecycle rules.

### Cross-Origin Requirements

If frontend and API are deployed on different origins, configure CORS and cookies appropriately.

Cookie-based state-changing requests require suitable CSRF protection.

SameSite alone must not be assumed sufficient for every deployment configuration.

The final design depends on actual hosting domains and approved security architecture.

## 10.3 Password Storage

Use a modern, well-maintained password hashing mechanism.

**Proposed:** Argon2id, subject to compatibility and implementation review.

Where another established secure hashing mechanism is selected, document the reason.

Never:

- Store plaintext passwords.
- Log passwords.
- Store reversible passwords.
- Include password hashes in normal API responses.
- Commit real credential values to Git.

## 10.4 Login Abuse Protection

Implement appropriate:

- Rate limiting.
- Generic authentication failure messages.
- Login abuse monitoring.
- Temporary restrictions when justified.
- Secure recovery mechanisms.

Avoid responses that unnecessarily reveal whether a particular account exists.

## 10.5 Password Recovery

**Status: TBD**

Confirm whether the ERP requires:

- Email-based recovery.
- Admin-provisioned password reset.
- First-login password setup.
- Expiring reset links.
- Additional identity verification.

Reset tokens must be short-lived, single-use and appropriately protected if that approach is approved.

---

# 11. Session Lifecycle

The real application must handle:

- New login.
- Existing valid session.
- Session expiration.
- Explicit logout.
- Account disablement.
- Role changes.
- Branch access removal.
- Credential reset.
- Session revocation.

### Proposed Requirements

- Regenerate or rotate session identifiers when appropriate.
- Invalidate sessions on logout.
- Apply reasonable idle and absolute session limits.
- Ensure access revocation becomes effective within an approved period.
- Reevaluate authorization for every protected operation.
- Protect against session fixation.

### TBD

- Session idle timeout.
- Absolute lifetime.
- Remember-me support.
- Concurrent sessions.
- Device management.
- Reauthentication for sensitive actions.

---

# 12. User Provisioning and Account Management

## 12.1 User Creation

Authorized administrators may create staff identities according to the approved permission matrix.

Production account creation must not expose temporary credentials through insecure channels.

## 12.2 Branch Assignments

Authorized administrators may assign users to branches.

Assignments must include:

- User identity.
- Branch identity.
- Approved roles.
- Assignment status.
- Relevant audit metadata.

## 12.3 Role Updates

When a user's role or branch assignment changes:

- Validate the administrator's authority.
- Validate the new assignment.
- Persist the change safely.
- Record the appropriate audit event.
- Ensure subsequent requests use updated permissions.
- Invalidate or refresh authorization caches as required.

## 12.4 Account Disablement

Disabled users must not retain unauthorized operational access through existing sessions.

Account disablement must not erase required audit history.

## 12.5 Last-Administrator Protection

**Status: PROPOSED**

Prevent accidental removal or disabling of the last account with the capability to administer the academy.

The exact recovery and break-glass procedure must be approved.

---

# 13. Financial Security Controls

Financial operations require explicit security rules.

## 13.1 Protected Operations

Examples include:

- Creating invoices.
- Recording payments.
- Applying discounts.
- Changing fee plans.
- Reversing payments.
- Refunding amounts.
- Cancelling invoices.
- Editing expenses.
- Approving expenses.
- Exporting financial reports.

## 13.2 Permission Separation

**Status: PROPOSED**

Separate ordinary viewing and recording permissions from sensitive approval and reversal permissions.

Example:

- `payments.read`
- `payments.record`
- `payments.reverse`
- `discounts.request`
- `discounts.approve`

Permission names and workflows must be approved.

## 13.3 Financial Integrity

The backend must:

- Validate money amounts.
- Validate references.
- Prevent duplicate records where required.
- Protect against unauthorized modifications.
- Maintain consistent balances.
- Preserve relevant historical records.
- Use appropriate transactions and concurrency controls.
- Log sensitive operations.

## 13.4 Refunds and Reversals

**Status: TBD**

The client must specify:

- Who can request a refund.
- Who can approve it.
- Whether a second approver is required.
- Whether there are approval thresholds.
- Which payment methods support refunds.
- Required reversal reasons.
- Receipt and ledger consequences.

Until resolved, refund and reversal actions must not be made operational.

### Critical Rule

Do not implement permanent deletion of financial history as a substitute for a controlled refund or reversal.

---

# 14. Input Validation and API Protection

## 14.1 Server Validation

All real API inputs must be validated for:

- Expected fields.
- Type.
- Format.
- Allowed values.
- Length and size.
- Required relationships.
- Authorization.
- Business-rule constraints.

Client-side validation is useful but cannot replace server validation.

## 14.2 Mass Assignment Protection

Do not pass an unrestricted request body directly into sensitive database updates.

Allow only explicitly permitted fields.

Users must not be able to change their own:

- Roles.
- Branch assignments.
- Administrative flags.
- Financial approval limits.
- Account status.

unless the specific operation is authorized.

## 14.3 Query Safety

Validate query parameters and allowed sort/filter fields.

Avoid untrusted dynamic MongoDB operators.

Apply appropriate MongoDB query-selector protections.

## 14.4 Output Protection

Return only required fields.

Do not expose:

- Password hashes.
- Session secrets.
- Internal configuration secrets.
- Unnecessary private student data.
- Restricted financial information.
- Full error stack traces.

## 14.5 Pagination and Rate Limiting

Use bounded list queries.

Apply appropriate endpoint and authentication rate limits.

Production limits remain TBD.

---

# 15. Cross-Site and Browser Security

The frontend and backend must be protected against common browser-based attacks.

### Required Controls

- Safe output rendering.
- Avoid unsafe HTML injection.
- Validate and sanitize relevant user-provided content.
- Appropriate Content Security Policy.
- Appropriate cookie security.
- CSRF defenses for cookie-authenticated state changes.
- Appropriate CORS allowlists.
- Security-related HTTP headers.

### React-Specific Rule

Do not insert untrusted content through `dangerouslySetInnerHTML` without a reviewed sanitization requirement.

### Third-Party Content

External scripts, fonts and libraries should be reviewed for necessity and security implications.

---

# 16. Sensitive Student and Staff Data

## 16.1 Data Minimization

Collect only information necessary for approved business requirements.

Do not add sensitive personal attributes merely because they are common in other school systems.

## 16.2 Access Restrictions

Restrict personal records based on:

- Role.
- Branch.
- Assignment.
- Purpose of the operation.
- Approved business rules.

## 16.3 Storage

Production records must be stored through the approved backend database and storage services.

Browser localStorage is not an appropriate authoritative store for confidential operational data.

## 16.4 Privacy

Actual privacy and legal requirements must be confirmed for the academy's jurisdiction and operations.

### TBD

- Applicable laws and contractual requirements.
- Guardian consent requirements where applicable.
- Required student data fields.
- Retention durations.
- Deletion/correction requests.
- Export permissions.
- Data breach reporting responsibilities.

Do not assume a particular compliance certification has been achieved.

---

# 17. Mock Frontend Security Boundaries

The initial frontend will use mock accounts and browser storage.

### Mandatory Rules

1. Mock sessions are only demonstrations.
2. Mock role restrictions are for UX development.
3. Mock data must be fictional or appropriately sanitized.
4. Do not store real passwords.
5. Do not store live student records in mock seed files.
6. Do not present mock authentication as production security.
7. Do not use mock financial operations with real money.
8. Do not deploy mock-only permissions as protection for confidential client data.
9. Clearly distinguish demo environments from production environments.
10. Keep future backend authorization contracts consistent with approved policies.

### Security Boundary

A browser user can inspect or alter frontend mock state.

Therefore, client-side restrictions cannot provide meaningful protection against a determined user.

---

# 18. Audit Logging

**Status: PROPOSED**

Sensitive actions should generate audit records.

## 18.1 Recommended Audit Fields

- Event identifier.
- Timestamp.
- Actor user identifier.
- Action identifier.
- Resource type.
- Resource identifier.
- Relevant branch identifier.
- Outcome.
- Request/correlation identifier.
- Relevant approved metadata.

Optional information such as IP address or user agent requires appropriate privacy handling and retention rules.

## 18.2 Recommended Audit Events

- User account created.
- Role assignment changed.
- Branch created.
- Branch deactivated.
- User account disabled.
- Sensitive settings changed.
- Fee discount approved.
- Payment reversed.
- Invoice cancelled.
- Expense approved.
- Sensitive export performed.

### Audit Safety

Audit logs must not include:

- Passwords.
- Session cookies.
- Access tokens.
- Full confidential form payloads.
- Unnecessary sensitive student details.

## 18.3 Audit Protection

Audit records must have restricted access.

Ordinary users must not edit audit history.

Production retention and integrity protections must be defined before deployment.

---

# 19. Security Logging and Monitoring

The backend must produce useful diagnostic information without exposing protected data.

### Proposed Controls

- Structured application errors.
- Authentication failure monitoring.
- Permission-denied event tracking.
- Financial operation failure visibility.
- Rate-limit event monitoring.
- Critical backend exception reporting.
- Relevant request correlation identifiers.

### Restrictions

- Avoid secrets in logs.
- Avoid unnecessary sensitive payloads.
- Avoid unrestricted access to production logs.
- Do not expose internal stack traces to frontend users.

Specific monitoring tools remain TBD.

---

# 20. File Upload and Export Security

**Status: CONDITIONAL — If File Uploads Are Approved**

Potential uploads may include:

- Academy logo.
- Student documents.
- Staff documents.
- Expense attachments.
- Asset images.

### Requirements

- Authenticate and authorize uploads.
- Restrict permitted file types.
- Enforce appropriate file-size limits.
- Validate actual file content where practical.
- Use safe filenames and storage keys.
- Avoid executing uploaded content.
- Apply appropriate malware scanning where required.
- Protect private files from unauthorized public access.
- Control download URLs and permissions.

### Exports

Data exports must:

- Enforce the requesting user's permissions.
- Respect branch and record scope.
- Avoid unnecessary personal information.
- Apply safe CSV/spreadsheet encoding practices where applicable.
- Be auditable when sensitive.

File uploads and exports must not be implemented merely because a UI control exists; their requirements must be approved.

---

# 21. Database Security

MongoDB security requirements include:

- Protected database credentials.
- Restricted network access.
- Least-privilege application database accounts.
- Encrypted transport.
- Appropriate managed storage encryption.
- Separate development/test/production data.
- Approved indexes and constraints.
- Validated data operations.
- Controlled database access.
- Backup protection.

### Prohibited

- Exposing MongoDB directly to the browser.
- Embedding connection strings in frontend bundles.
- Committing production database credentials.
- Running destructive operations without authorization.
- Using unrestricted administrative database accounts for routine application operations.

---

# 22. Environment and Secrets Management

Separate environments should be maintained appropriately.

### Proposed Environments

- Local Development.
- Staging / Client Review.
- Production.

### Mandatory Rules

- Keep secrets outside source control.
- Use environment configuration.
- Commit only sanitized `.env.example` files.
- Separate production credentials from development credentials.
- Do not log or expose secret values.
- Limit who can access deployment credentials.
- Rotate compromised credentials promptly.

### Git Rules

The repository must exclude:

- `.env` files containing secrets.
- Private credential files.
- Database dumps containing real records.
- Sensitive backups.
- Private keys.

Project documentation itself must remain tracked in Git.

---

# 23. Backup, Recovery and Availability

**Status: PROPOSED — Targets TBD**

Before production release, define:

- Backup frequency.
- Backup retention.
- Backup access restrictions.
- Recovery Point Objective (RPO).
- Recovery Time Objective (RTO).
- Restoration testing.
- Incident response ownership.

Backups must be protected from unauthorized access.

Do not claim the system is recoverable merely because a hosting provider advertises backups.

A restore procedure must be tested.

---

# 24. Security Testing Requirements

The system must include security verification relevant to each implementation stage.

## 24.1 Mock Frontend Tests

Verify:

- Role-aware navigation.
- Branch switcher restrictions in the UI.
- User role changes.
- Invalid stored branch recovery.
- Permission-denied screens.
- Teacher-assignment filtering.
- Demo session state changes.

These are UI behavior tests, not proof of production security.

## 24.2 Authentication Tests

When the real backend is implemented:

- Valid login.
- Invalid credentials.
- Disabled account.
- Expired session.
- Logout.
- Session revocation.
- Password reset, if approved.
- Login rate limiting.

## 24.3 Authorization Tests

Test:

- Authorized access.
- Unauthorized access.
- Cross-branch access.
- Record-level access.
- Missing permission.
- Multiple roles in one branch.
- Different roles across branches.
- Role changes during an active session.
- Branch deactivation.
- Super Admin academy-wide scope.

## 24.4 Financial Security Tests

Test:

- Unauthorized discount attempts.
- Unauthorized refund attempts.
- Invalid payment amounts.
- Duplicate payment submission.
- Cross-branch financial access.
- Reversal/audit behavior.
- Payment and invoice relationship integrity.

Tests for unapproved workflows must wait until those workflows are specified.

## 24.5 API Security Tests

Test:

- Invalid identifiers.
- Missing session.
- Invalid payloads.
- Mass-assignment attempts.
- Injection attempts.
- Unauthorized exports.
- Oversized requests.
- Unsafe sort/filter parameters.
- Rate-limit behavior.

## 24.6 Dependency and Deployment Checks

Before production deployment:

- Review vulnerable dependencies.
- Verify security headers.
- Verify HTTPS configuration.
- Verify cookies and CORS.
- Verify secret handling.
- Verify database exposure restrictions.
- Verify backups.
- Review appropriate application logs.

No unexecuted test may be marked PASS.

---

# 25. Security Acceptance Criteria

A production-security feature is complete only when:

1. Relevant security requirements are approved.
2. Authentication works as specified.
3. Server authorization is implemented.
4. Branch access is enforced.
5. Record access is enforced where required.
6. Sensitive business rules are checked.
7. Validation prevents unauthorized changes.
8. Tests cover permitted and denied scenarios.
9. Audit behavior works where required.
10. Sensitive information is not unnecessarily exposed.
11. Relevant tests pass.
12. Known blocking issues are resolved.
13. Evidence is recorded in PROGRESS.md.

Frontend mock guards alone do not meet production-security acceptance criteria.

---

# 26. Security Incident Handling

**Status: PROPOSED**

The academy must eventually have a defined process for security incidents.

Suggested stages:

1. Detect and record the incident.
2. Restrict further unauthorized access.
3. Preserve appropriate evidence.
4. Assess affected users and records.
5. Revoke compromised credentials or sessions.
6. Correct the root cause.
7. Verify the fix.
8. Restore affected operations safely.
9. Determine required notifications.
10. Record lessons learned.

Detailed incident responsibility and notification obligations remain TBD.

---

# 27. AI Coding Agent Security Instructions

All AI coding agents must follow these rules.

### Before Security-Sensitive Code

1. Read AGENTS.md.
2. Read approved SECURITY.md.
3. Read the active approved ticket.
4. Read relevant PRD, ERD and integration requirements.
5. Inspect existing authentication and authorization code.
6. Identify affected roles and branches.
7. Identify sensitive information involved.
8. Report unresolved security decisions.

### During Implementation

1. Implement only approved security behavior.
2. Deny unauthorized operations by default.
3. Do not trust frontend permission flags.
4. Do not trust user-controlled role or branch values.
5. Preserve security boundaries.
6. Use validated inputs.
7. Do not expose secrets.
8. Avoid unnecessary dependencies.
9. Keep security logic centralized.
10. Add relevant permitted and denied tests.

### After Implementation

1. Run relevant tests.
2. Report actual outcomes.
3. Check for security regressions.
4. Report changed files.
5. Record unresolved risks.
6. Update TASKS.md and PROGRESS.md.
7. Stop before the next unapproved ticket.

### Explicitly Prohibited

- Hardcoded administrator credentials.
- Hardcoded secret keys.
- Publicly exposed production student data.
- Direct browser access to MongoDB.
- Trusting a client-submitted permission list.
- Bypassing backend authorization.
- Failing open on unknown permissions.
- Treating authentication as equivalent to authorization.
- Using simple URL hiding as record protection.
- Silently enabling refunds or financial overrides.
- Falsely claiming security compliance.

---

# 28. Security Change Management

When a client requests a permission or security change:

1. Record the request.
2. Identify the affected role.
3. Identify the affected branch and resource scope.
4. Evaluate sensitive operations.
5. Assess impacts on data models and APIs.
6. Review possible privilege escalation.
7. Obtain approval.
8. Update SECURITY.md.
9. Update affected tickets.
10. Implement the approved behavior.
11. Test allowed and denied scenarios.
12. Record the change in MEMORY.md and PROGRESS.md.

A permission change must not be treated as an ordinary cosmetic UI update.

---

# 29. Open Security Questions (TBD)

## Role Permissions

1. Can Owner manage all branches or only assigned branches?
2. Can Owner create staff accounts?
3. Can Receptionist edit existing admissions?
4. Who may approve admissions?
5. Who may configure courses and batches?
6. Who may mark or correct attendance?
7. Can Teacher view earnings?
8. Can Teacher edit student personal records?
9. Who can export financial information?
10. Who can view audit logs?

## Multiple Roles

11. Are permissions combined as a union within the same branch?
12. Can explicit restrictions override other role grants?
13. Are roles customizable by Super Admin or fixed?
14. Can users switch active role, or does the UI display combined authorized capabilities?

## Finance

15. Who can record fee payments?
16. Who can approve discounts?
17. Who can cancel invoices?
18. Who can reverse or refund payments?
19. Are second approvals required?
20. Are financial thresholds required?
21. Who can add, edit or approve expenses?

## Authentication

22. How are staff accounts invited or provisioned?
23. How are passwords reset?
24. Is multi-factor authentication required?
25. What are the session lifetime rules?
26. Should concurrent sessions be allowed?
27. What happens to existing sessions after role changes?

## Data Protection

28. What personal information may each role access?
29. Which reports may be exported?
30. What are the retention requirements?
31. How are student/guardian information changes approved?
32. Are uploaded documents required?
33. Who may download uploaded documents?

## Operations

34. What hosting and domain configuration will be used?
35. What log retention period is required?
36. Who reviews security incidents?
37. What backups and recovery targets are required?
38. What is the required production security review process?

Unresolved questions must not be silently answered by coding agents.

---

# 30. Cross-Document Relationships

This document owns authentication, authorization and data protection requirements.

Related documentation:

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](ARCHITECTURE.md)
- [Database ERD](ERD.md)
- [Visual Design](DESIGN.md)
- [Frontend Integration](FRONTEND_INTEGRATION.md)
- [Engineering Rules](RULES.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Current Tasks](TASKS.md)
- [Project Memory](MEMORY.md)
- [Verified Progress](PROGRESS.md)

### Ownership Rules

PRD.md defines what users must be able to do.

SECURITY.md defines whether and under what scope they are allowed to do it.

SYSTEM_DESIGN.md defines the business workflow.

ERD.md defines persisted entities.

FRONTEND_INTEGRATION.md defines UI/service/API contracts.

RULES.md defines engineering enforcement practices.

When documents conflict, report the contradiction before implementing affected features.

---

# 31. Approval and Implementation Boundary

### Confirmed

- Four roles.
- Multiple branches.
- Different and multiple roles per branch.
- Backend-enforced security.
- Least privilege.
- Branch-aware access.
- Appropriate financial audit controls.

### Proposed

- Detailed permission matrix.
- Branch-aware RBAC plus record-scoped checks.
- Academy-wide capabilities for Super Admin.
- Cookie-based sessions.
- Password hashing strategy.
- Specific audit event catalog.
- Security testing methods.

### TBD

- Final role-permission grants.
- Effective multiple-role policy.
- Owner scope.
- Financial approvals.
- Session configuration.
- Data retention.
- Operational security responsibilities.

### Current Implementation Boundary

Frontend-first mock development may implement role-aware interface behavior using clearly identified demo permissions.

It must not claim production authorization.

Production backend security features require approved security requirements and separate implementation tickets.

---

**Document Status:** DRAFT — Pending Detailed Security Review
**Version:** 1.0
**Implementation Authorization:** No security implementation authorization is granted by this document alone.

**Governing Principle:** Authenticate the user, verify their current permissions, validate branch and record scope, enforce the business rule, and deny access whenever required authorization is absent.
## F02-003 mock boundary and unresolved policies (2026-10-10)

Popup creates fictional browser-local Pending admissions and Provisional students only. No new permission: workspace.view stays the demo baseline; unknown/sensitive permissions remain denied. Historical admissions permission proposals do not grant production access. Service checks current mock identity/active branch; browser storage/frontend guards remain tamperable.

Approval authority, role policies, status transitions, duplicate-person matching, real program/batch assignment, fees, enrollment and production numbering remain unresolved/deferred. Native locks coordinate cooperating tabs where supported; no distributed concurrency claim. Corrupt/unsupported/conflicting data raises explicit errors and stays untouched for deliberate recovery. No silent reset, real credentials or backend security added.

## F02-003 owner-approved DEMO actions extension (2026-10-10)

Explicit owner approval now permits fictional local View/Edit/Delete and independent branch numbering through existing service boundaries. Historical statements deferring DEMO actions/academy-wide numbering are superseded only for this scope. workspace.view remains the sole demo baseline; no production permission grants or Super Admin bypass.

Every admission read/write checks current mock identity and active assigned branch. Browser storage remains forgeable; these checks are UX safeguards only. Confirmed deletion may remove only a verified same-branch reciprocal Provisional student explicitly marked createdByAdmissionFlow on both records. Legacy status/link alone does not prove ownership: refuse cascade and preserve data until explicit owner determination. No unrelated student, enrollment, fee or backend record is deleted. IDs/counter high-water remain reserved after deletion. Production retention, audit, role policies and business status permissions remain unresolved.

## F02-003 latest simple legacy deletion rule (2026-10-10)

The owner's latest simple CRUD instruction SUPERSEDES the earlier requirement that both linked records carry createdByAdmissionFlow markers. A uniquely linked same-branch Provisional student may be removed atomically with its admission, including unmarked legacy pairs. Reciprocal links, branch matching, uniqueness and status are validated; ambiguous/broken/Active links are denied without a write. No unrelated records or sequence counters are removed. Existing markers remain optional historical metadata, not a deletion prerequisite. No data-reset/migration framework, production permission, backend or fees/enrollment changes. F02-003 IN_REVIEW; final 176/176 regressions PASS. [Evidence](PROGRESS.md#f02-003-simple-crud-completion---legacy-deletion-correction-2026-10-10).

## F02-003 latest gapless display serial contract (2026-10-10)

Latest owner instruction SUPERSEDES earlier permanent-counter values as visible serials. A response-only projection derives independent Student displaySerial and Admission displaySerial/displayAdmissionId from complete branch insertion order, before search/filter/sort. Linked Student admissionDisplaySerialId reflects the admission's current serial. Create appends; edit retains order; deletion closes gaps; reload retains persisted array order. Projection fields are never stored or used as lookup keys.

Immutable internal id/studentId/student.admissionId foreign keys and historical admissionId/admissionNumber/studentNumber/admissionDisplayId metadata remain untouched, including legacy ADM-* internal IDs. Existing durable counters remain historical allocation metadata, not visible list positions. Admissions View distinguishes current serial from permanent reference; actions continue using internal IDs. Student serials cover all branch students, including legacy/unrelated records. No schema migration, reset, backend, production permission, fees/enrollment or new Student page. Future HTTP responses must preserve deterministic full-branch serial semantics. [Verified evidence](PROGRESS.md#f02-003-gapless-branch-display-numbering-correction-2026-10-10).

## F03-001 limited directory order exception (2026-10-11)

CONFIRMED owner authorization: read-only DEMO Students Directory before F02-004; defer enrollment dependency only for listing. /students and sidebar now display saved branch students, gapless serials and linked Admission references. Missing legacy status is Active presentation only; stored records unchanged by directory reads. Existing workspace.view only; no production permissions. IN_REVIEW, acceptance pending. F02-002/F02-003 acceptance remains pending. Final 198/198 tests (19 files), lint/build and local Edge four-viewport/keyboard/admission-link/refresh/branch/logout checks PASS; actual CI/deployment/backend/formal accessibility NOT_RUN. No dependencies installed. [Full evidence](PROGRESS.md#f03-001-limited-demo-students-directory-2026-10-11). Next F02-004 requires separate approval; all remaining tickets preserved.
## F02-004 approved DEMO course/batch selection (2026-10-12)

CONFIRMED scope: branch-specific mock courses retained; Course required, Batch optional; minimal batch {id, branchId, courseId, name}; same shared popup/standalone form; admission courseId and optional preferredBatchId with legacy course text retained. No automatic name-to-ID mapping. Safe additive version-3 envelope behind existing mock storage key adds minimum batches from saved courses, preserves valid records/links/counters and never reseeds existing valid batches. New/changed selections validate branch/course/batch relations atomically; unchanged legacy/unresolved references may survive unrelated edits and display explicit unresolved labels. Session/branch guards remain DEMO UX safeguards; workspace.view unchanged. No backend, permissions, fees/enrollment/schedules/capacity rules or dependencies added.

IN_REVIEW; acceptance pending. F02-002/F02-003/F03-001 also remain acceptance pending. Baseline 198/198 PASS; final 223/223 tests (21 files; 25 new), lint/build and local Edge shared popup/View/Edit/optional batch/refresh/branch/keyboard/360-768-1024-1440 checks PASS. Existing lint/bundle warnings remain; actual CI/deployment/backend/formal accessibility NOT_RUN. [Full files, libraries, migration limitations and evidence](PROGRESS.md#f02-004-program-and-batch-selection-delivery-2026-10-12). Next F02-005 Admission Status Workflow needs separate owner decisions/approval; no following ticket started.
## F02-005 owner-approved DEMO status decisions (2026-10-12)

CONFIRMED owner approval: Pending -> Approved/Rejected only, explicit confirmation, same-status idempotency, no opposite transitions/reopening; canonical active-branch Owner/Super Admin only (any approved eligible role membership, never dashboard preview authority). Unique reciprocal same-branch linked Provisional student required; legacy unlinked/unsafe records refuse without changes. Student remains Provisional. Optional rejection reason; status plus append-only actor/time history committed atomically. Decided admissions, including existing Approved/Rejected records, are read-only and cannot be physically deleted. These latest rules supersede prior generic Edit/Delete availability for decided DEMO records only; existing comments/history preserved. workspace.view remains sole production-independent demo baseline, no real permission grant/bypass/backend change.

Implemented IN_REVIEW; acceptance pending, as are F02-002/F02-003/F02-004/F03-001. Existing version-3 storage accepts optional embedded statusHistory without reset/backfill; current identity/branch and policy validated at service/database boundaries, stale/conflicting operations fail without writes. Final 248/248 tests (23 files; 25 new), lint/build and local Edge status/keyboard/four-viewport/persistence checks PASS; existing warnings remain. Actual CI/deployment/backend/formal accessibility NOT_RUN. [Exact files/libraries/history contract/evidence](PROGRESS.md#f02-005-admission-status-workflow-delivery-2026-10-12). Next F02-006 Admission-to-Enrollment Mock Integration requires separate scope and owner approval. Stop after F02-005.

## Owner Role Matrix Reconciliation (2026-10-12)


## F02-005 Pending Delete owner extension (2026-10-12)

CONFIRMED: the owner's follow-up request enables Delete in the three-dots Admissions Actions menu for Super Admin in the active authorized branch, following the preceding Super Admin-only proposal. Receptionist/Owner/Teacher and unresolved multi-role assignments remain denied. Approve/Reject authority remains unresolved and denied. Only Pending admissions can be deleted; decided records remain read-only. Existing confirmation/Cancel/Escape, pending-submit lock, error/retry, atomic linked Provisional deletion, unrelated-record preservation and response-only gapless renumbering are reused. Permanent IDs and historical counters are retained. No storage reset, backend or dependency change.

**Status: IN_REVIEW; owner acceptance pending.** Full tests PASS: 240/240 in 23 files. Lint PASS (0 errors, 1 existing DashboardPage warning); build PASS (existing large-chunk warning). Manual browser viewport inspection, CI, deployment and backend/security verification NOT_RUN. This entry supersedes historical Pending Delete denial only; previous evidence and explanatory comments are retained.


The following module matrix is **CONFIRMED** as the owner-provided source of truth. Its labels are recorded verbatim. They define module-level direction; they do not silently resolve action, record, branch, approval or production-backend details hidden inside broad labels.

| Module | Super Admin | Receptionist | Owner | Teacher |
|---|---|---|---|---|
| Dashboard | Full | Operational | Owner summary | Teacher summary |
| Admissions | Full | Add/Edit/View | View | None |
| Students | Full | Add/Edit/View | View | Assigned students only |
| Courses & Batches | Full | View | View | Assigned courses/batches |
| Faculty & Classes | Full | View/Edit | View | Own classes only |
| Fees | Full | Collect/View | View | Own payment summary |
| Finance | Full | None/limited | Full | Own earnings |
| Demo Classes | Full | Full | View | None |
| Assets | Full | Add/Edit/View | View | None |
| Reports | Full | Operational reports | Full | Own teaching/payment reports |
| Settings | Full | None | None | None |

### Confirmed implementation meaning for current screens

- Admissions: Super Admin View/Create/Edit; Receptionist View/Create/Edit; Owner View only; Teacher no access.
- Students: Super Admin, Receptionist and Owner may view the current directory. Teacher's `Assigned students only` needs an approved assignment model and record filter, so Teacher access remains denied for now. Student Create/Edit UI remains outside the current read-only directory ticket.
- Dashboard role summaries remain available as already implemented. Super Admin preview changes presentation only and never changes identity, branch assignment or effective permissions.
- No broad Super Admin bypass exists. Only named, implemented permission keys may pass.

### Explicit unresolved details — deny by default

`Full`, `Operational`, `Owner summary`, `Teacher summary`, `limited`, `assigned only`, `own`, `Collect`, and report labels require action- and record-level rules before their dependent features are implemented. `None/limited` does not grant Finance access until the limited operations are named. All Branches, multi-role permission combination and final record-level restrictions remain deferred.

Admission Approve/Reject and Pending Delete are **PROPOSED for Super Admin only and are not confirmed**. They are denied to every role in the UI and service boundary pending explicit owner confirmation. Receptionist has no Delete or status-decision authority; Owner is read-only; Teacher has no Admissions route. Existing Approved/Rejected records remain readable but immutable, and their saved linked Provisional Student/status history/localStorage data is preserved. This current matrix correction **SUPERSEDES** the earlier F02-005 Owner/Super Admin decision-authority grant; historical evidence remains recorded above and the ticket remains IN_REVIEW.

## F02-005 final confirmed Admissions action authority (2026-10-12)

CONFIRMED and superseding the unresolved proposal immediately above: Super Admin may View, Create, Edit, Approve, Reject and delete Pending admissions only while assigned to the active authorized branch. Receptionist may View/Create/Edit only, Owner may View only, and Teacher has no Admissions access. Dashboard role preview never changes identity or authority. Unknown permissions, unresolved multi-role combinations, All Branches access and broad Super Admin bypass remain denied.

## F02-006 mock enrollment authorization (2026-10-12)

CONFIRMED only for the browser-local DEMO enrollment ticket: **Enroll Student** is visible to a Super Admin with the existing `admissions.decide` permission in the active authorized branch. The service rechecks session identity/branch and permission, and the mock database independently checks its canonical current mock session and branch before creating an enrollment. No All Branches bypass, new permission or production authorization grant is introduced. These controls are mock UX/data-integrity safeguards, not server-side security; real backend enforcement remains deferred. Implementation is IN_REVIEW pending owner acceptance; targeted tests/lint pass, full suite/build NOT_RUN.

Approve/Reject remains Pending-only with confirmation, same-status idempotency, stale/opposite/reopen denial and an atomic append-only actor/time history. The unique reciprocal same-branch linked Student remains Provisional. Approved/Rejected admissions are read-only and cannot be deleted. Pending Delete requires the existing verified Provisional link and atomically deletes only that linked pair. UI, service and mock-database boundaries enforce the named permissions. This is browser-local DEMO policy, not production security; backend authorization remains deferred.
