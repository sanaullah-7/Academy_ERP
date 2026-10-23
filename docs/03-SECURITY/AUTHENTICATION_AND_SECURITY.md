# AUTHENTICATION_AND_SECURITY

<!-- > Purpose: Defines secure login, sessions, credential protection, server validation and security controls. -->


# TSA Academy ERP — Authentication & Security Specification

**Document:** AUTHENTICATION_AND_SECURITY.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Security Architecture Proposed; Backend Implementation Pending
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization, Multiple Branches

---

## 1. Purpose

This document defines the authentication, session management, authorization and application security requirements for TSA Academy ERP.

The objective is to protect student information, staff accounts, financial transactions, teacher compensation and branch-owned records while preserving the existing frontend's approved workflows.

This specification covers:

- User authentication and logout.
- Password hashing and credential protection.
- Secure server-side sessions.
- Account activation and deactivation.
- Role-based access control.
- Organization and branch authorization.
- Teacher self-service data privacy.
- Administrative privilege restrictions.
- CSRF and CORS protection.
- API and database security.
- Payment and payroll security.
- Audit logging.
- Security testing and deployment safeguards.

**Implementation boundary:** This document defines security requirements and proposed technical mechanisms. It does not authorize changing application code, creating accounts, rotating secrets or deploying authentication services.

---

## 2. Security Principles

### SEC-001 — Deny by Default

Unknown users, roles, permissions, branches and unsupported actions must be denied.

### SEC-002 — Server-Side Authorization

Frontend route guards and hidden buttons are not sufficient for production security.

### SEC-003 — Least Privilege

Each user receives only the permissions required for approved responsibilities.

### SEC-004 — Organization and Branch Isolation

Every protected operation must enforce the applicable organization, branch and record scope.

### SEC-005 — Record Ownership

Access to one module does not automatically authorize access to every record within that module.

### SEC-006 — Credential Confidentiality

Passwords, password hashes and session secrets must be protected.

### SEC-007 — Financial Integrity

Fee and salary operations must protect amounts, payment history, balances and authorized financial relationships.

### SEC-008 — Auditable Sensitive Operations

Important administrative and financial actions must be traceable.

### SEC-009 — Secure Failure

Authentication and authorization failures must not expose protected data.

### SEC-010 — No Unapproved Security Features

Do not invent account recovery, identity providers or permission grants without an approved product and technical contract.

---

## 3. Authentication Architecture

### Current Frontend

The existing frontend uses a mock authentication flow for demonstration and development.

Browser-local mock authentication does not provide production identity verification.

### Proposed Backend Authentication

```text
User Login
    |
    v
React Login Form
    |
    v
Authentication API
    |
    v
Validate Credentials
    |
    v
Verify Active Staff Account
    |
    v
Create Secure Session
    |
    v
Load Authorized Branch Assignments
    |
    v
Resolve Effective Role
    |
    v
Open Authorized Dashboard
```

### Mandatory Requirements

1. Authenticate staff against trusted backend records.
2. Never trust a browser-supplied role as evidence of authorization.
3. Validate account status.
4. Protect credential transport using HTTPS.
5. Establish a secure session.
6. Resolve authorized branches.
7. Enforce permissions on all protected APIs.
8. Reject expired or revoked sessions.

The backend must not reuse insecure mock credentials as production account credentials.

---

## 4. User Identity Model

The application supports individual staff accounts.

### Proposed Identity Fields

| Field | Purpose |
|---|---|
| `id` | Stable internal user identity |
| `organizationId` | Academy ownership |
| `fullName` | Staff display name |
| `emailNormalized` | Normalized login identifier, where used |
| `passwordHash` | Secure credential hash |
| `status` | Active or disabled account state |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last modification timestamp |

The final identity schema must match the approved `ERD.md`, `DATABASE.md` and frontend login contract.

### Requirements

- User identities must remain stable across branches.
- An account may belong to multiple authorized branches.
- Different roles across branches are supported.
- Disabling an account must prevent protected access.
- Protected users must not be modified by unauthorized administrators.

---

## 5. Password Security

### Hashing

Store passwords using a suitable password-hashing algorithm such as Argon2id or an appropriately configured bcrypt implementation.

The final library and parameters must follow the approved backend environment and current security guidance.

### Mandatory Rules

- Never store plaintext passwords.
- Never store reversibly encrypted passwords as the normal authentication credential.
- Use library-generated salts.
- Do not implement custom password hashing.
- Do not log submitted passwords.
- Do not send password hashes to the frontend.
- Avoid committing test/demo credentials that can access a deployed environment.
- Use an approved process for first-time account provisioning.

### Password Changes

A password-change operation must:

1. Authenticate the user.
2. Verify the existing credential or another approved reauthentication method.
3. Validate the new password.
4. Hash and persist the replacement securely.
5. Apply the approved session revocation policy.
6. Record appropriate safe security metadata.

### Password Recovery

Password reset by email, SMS or another recovery mechanism remains **TBD** until explicitly designed and approved.

Do not add an insecure default password-reset endpoint.

---

## 6. Secure Session Management

### Proposed Strategy

Use secure server-managed sessions with an HttpOnly browser cookie.

This is a proposed architecture, not proof of an implemented authentication mechanism.

### Session Requirements

- Generate unpredictable session identifiers.
- Do not expose session signing secrets.
- Use HttpOnly cookies.
- Use Secure cookies over production HTTPS.
- Configure SameSite based on the actual frontend/backend hosting relationship.
- Limit session lifetime.
- Support explicit logout.
- Reject revoked sessions.
- Verify active account status.
- Refresh or invalidate outdated permissions after account changes.

### Session Storage

A suitable secure backend session store must be selected.

Avoid using production memory-only sessions if they cannot meet reliability, restart and revocation requirements.

The exact session provider, expiry policy and rotation strategy remain proposed.

### Session Fixation Protection

Create or regenerate the authenticated session identity at the appropriate authentication boundary.

A previously unauthenticated session must not become a reusable authentication bypass.

### Session Cookies

Do not store:

- Passwords.
- Full role-permission maps as untrusted authority.
- Confidential salary data.
- Unnecessary student information.

---

## 7. Login Security

### Proposed Login Endpoint

`POST /api/v1/auth/login`

### Requirements

- Validate credential inputs.
- Reject invalid credentials.
- Reject disabled users.
- Use safe, nonrevealing failure messages.
- Apply rate limiting.
- Establish the approved secure session.
- Return only required user and branch context.
- Record relevant security events.

### Authentication Enumeration

Invalid login responses should not unnecessarily reveal whether a specific staff account exists.

### Brute-Force Protection

Use appropriate:

- Rate limits.
- Repeated-failure controls.
- Security logging.
- Monitoring.

Account lockout policy must be designed carefully to avoid easy denial-of-service against legitimate staff.

---

## 8. Logout and Session Revocation

### Proposed Logout Endpoint

`DELETE /api/v1/auth/session`

### Requirements

- Invalidate the session server-side.
- Clear the applicable authentication cookie.
- Clear protected frontend session state.
- Prevent access using revoked session credentials.

### Revocation Triggers

Potential triggers include:

- Explicit logout.
- Account disabled.
- Password changed.
- Privileged access removed.
- Security-related account reset.
- Administrative session revocation, if approved.

### Role Changes

A session must not indefinitely retain permissions removed from the staff account.

Subsequent protected requests must use current effective permissions.

---

## 9. Five-Role Authorization Model

TSA Academy ERP has five current application roles.

| Role | Main authorization scope |
|---|---|
| Super Admin | Approved academy-wide administrative functions |
| Admin | Authorized operational and administrative branch functions |
| Receptionist | Full approved Admissions and Fees access |
| Owner | Approved management and financial access |
| Teacher | Own teaching data, profile and compensation |

The effective action-level permission matrix belongs to `RBAC_PERMISSIONS.md`.

### Authorization Principle

A role grants only the approved actions and data scope associated with that role.

A valid role does not bypass:

- Branch ownership.
- Record ownership.
- Academic business rules.
- Financial validations.
- Protected account restrictions.
- Current branch creation restrictions.

---

## 10. Receptionist Authorization

**Status: CONFIRMED — Owner Approved**

Receptionist has Full Access to the currently implemented and approved:

1. Admissions module.
2. Fees module.

### Admissions

Permitted actions include relevant:

- View.
- Create.
- Edit.
- Review.
- Approve.
- Return to Pending.
- Enroll.
- Instant admission completion.
- Guarded deletion.

### Fees

Permitted actions include relevant:

- Challan management.
- Student fee ledger viewing.
- Fee collection.
- Partial payments.
- Verified payment history.
- Receipts.
- Approved payment operations during admission completion.

### Explicit Restrictions

Receptionist must not access independent:

- Finance Overview.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branch Management.
- User Management.
- Administrative Settings.

Full Fees access does not authorize unsupported refunds, reversals or salary payments.

All operations remain branch-scoped and subject to business validation.

---

## 11. Admin and Super Admin Security

### Super Admin

May perform approved administrative operations while respecting organization, branch, financial and record-level restrictions.

**Current restriction:** Branch creation remains paused for Super Admin and every other role.

### Admin

Admin must respect the verified privilege ceiling.

Admin must not:

- Create Super Admin access.
- Grant unauthorized Admin or Super Admin roles.
- Modify protected privileged accounts without authority.
- Bypass branch assignments.
- Use role updates for privilege escalation.
- Bypass protected financial workflows.

### Protected Account Updates

Authorization must consider:

1. The acting user's effective permission.
2. The target account's protected role/status.
3. The requested change.
4. Applicable branch ownership.
5. Specific business restrictions.

A generic user-edit permission must not automatically grant permission to modify role assignments or password credentials.

---

## 12. Owner Security

Owner may access approved management and financial views.

The existing frontend reportedly includes certain permitted expense-management operations.

Exact Owner write permissions must be verified against the current frontend permission registry before implementation.

### Restrictions

- No unrestricted user administration.
- No automatically granted branch management.
- No general Audit Log access under current policy.
- No unapproved Payroll mutation.
- No blanket administrative authority inferred from the title Owner.

Sensitive financial reports and exports must apply the correct authorized branch scope.

---

## 13. Teacher Self-Service Security

**Status: CONFIRMED — Implemented Frontend Feature**

### Frontend Route

`/my-profile`

### Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Permitted Own Data

Teacher may access their own:

- Personal profile and biography.
- Professional information.
- Teaching timetable.
- Assigned courses and batches.
- Assigned subjects.
- Permitted teaching/student relationships.
- Salary agreements.
- Agreed remuneration.
- Valid paid amounts.
- Outstanding remuneration.
- Verified salary payment history.
- Payslips.
- Salary notifications.

### Security Requirements

- Determine Teacher identity from the authenticated backend session.
- Verify each relevant teaching assignment.
- Restrict salary records to the authenticated Teacher.
- Do not trust a submitted `teacherId` as self-access authority.
- Do not expose other staff remuneration.
- Protect payslip URLs and downloaded documents.
- Do not grant general Faculty Management or Payroll Administration privileges.

### Critical Separation

**Teacher own-salary access does not imply permission to manage or view other teachers' payroll.**

---

## 14. Multi-Branch Authorization

The academy has multiple branches.

A single staff account may have different roles across branches.

Example:

```text
Staff Member A
    |
    +-- Branch 1: Teacher
    |
    +-- Branch 2: Receptionist
```

### Requirements

1. Authenticate the staff member.
2. Load active authorized branch assignments.
3. Validate requested branch.
4. Determine the effective branch role.
5. Enforce the action permission.
6. Verify target record ownership.
7. Deny access to unassigned branches.

### Branch Switching

When changing branches:

- Revalidate branch authorization.
- Recalculate effective permissions.
- Refresh protected frontend state.
- Prevent previous-branch records from appearing.
- Reject outstanding requests that no longer match the active authorization context.

### All-Branches Views

Authorized cross-branch reporting must require explicit permission.

All-Branches reporting does not automatically grant cross-branch mutations.

---

## 15. Same-Branch Multiple Roles

Historical requirements discuss assigning multiple roles within the same branch.

The current frontend fails closed for unresolved same-branch combinations.

### Current Effective Rule

- Do not silently union permissions.
- Do not infer privilege priority.
- Do not allow one role to bypass another role's explicit restrictions.
- Reject unsupported combinations for affected operations.

### Future Decision

The final combination policy remains TBD.

Different roles in different branches are already supported.

---

## 16. Organization and Record Ownership

### Organization Scope

The backend must derive organization ownership from trusted authenticated context.

Do not trust browser-supplied organization identifiers as authority.

### Branch Scope

For branch-owned resources, verify the stored branch relationship.

### Record Scope

Authorization must also check relevant:

- Student relationships.
- Admissions.
- Enrollments.
- Faculty assignments.
- Fee payments.
- Salary obligations.
- Payslips.
- Expense records.

### IDOR Protection

Direct manipulation of record IDs must not allow a user to access another branch's or another Teacher's protected information.

Use scoped database queries and explicit relationship checks.

---

## 17. API Security Architecture

### Proposed Request Lifecycle

```text
HTTP Request
     |
     v
Request Identification
     |
     v
Authentication
     |
     v
Organization and Branch Resolution
     |
     v
Permission Check
     |
     v
Record Ownership Check
     |
     v
Request Validation
     |
     v
Business Rules
     |
     v
Authorized Database Operation
     |
     v
Safe API Response
```

This is a conceptual lifecycle. Actual middleware ordering must preserve security and permit validated identification of requested resources.

### Required Controls

- Authentication.
- Permission validation.
- Branch ownership.
- Record ownership.
- Input validation.
- Mass-assignment protection.
- Safe response serialization.
- Error normalization.
- Rate limiting on relevant operations.

---

## 18. CSRF Protection

Cookie-authenticated state-changing requests may be vulnerable to Cross-Site Request Forgery.

### Requirements

- Use an appropriate CSRF mitigation strategy.
- Configure SameSite cookies as defense in depth.
- Validate trusted origins where appropriate.
- Protect sensitive POST, PATCH, PUT and DELETE operations.
- Avoid relying solely on CORS as CSRF protection.
- Test the actual deployed frontend/backend origin configuration.

The final CSRF mechanism must be selected alongside the authentication transport.

---

## 19. CORS Security

Cross-Origin Resource Sharing must be configured for actual approved frontend origins.

### Rules

- Avoid wildcard origins for credentialed protected requests.
- Allow only required HTTP methods and headers.
- Configure credentials deliberately.
- Separate development and production origins.
- Do not reflect arbitrary request origins.
- Verify preview-environment policies before allowing credentialed access.

CORS controls browser access; it does not replace authentication or authorization.

---

## 20. Input Validation and Injection Protection

Every backend endpoint must validate its inputs.

### Requirements

- Required fields.
- Supported types.
- Maximum lengths.
- Allowed values.
- Monetary ranges.
- Valid identifiers.
- Approved status transitions.
- Valid relationships.
- Authorized branch ownership.

### MongoDB Injection Protection

- Never trust raw client query objects.
- Reject unexpected MongoDB query operators.
- Use explicit filter allowlists.
- Validate identifiers before use.
- Avoid mass-assignment of database documents.
- Use safe Mongoose query practices.

### Output Security

- Safely serialize text.
- Avoid exposing unnecessary confidential fields.
- Preserve frontend protections against untrusted content.
- Apply suitable security headers.

---

## 21. Financial Transaction Security

Fees, Expenses and Payroll involve sensitive operations.

### Fee Collection Security

Before accepting a fee payment:

1. Authenticate the user.
2. Verify approved Fees collection permission.
3. Verify organization and branch.
4. Verify the Student/Challan relationship.
5. Validate the amount.
6. Confirm outstanding balance.
7. Enforce duplicate-request protection.
8. Commit the approved financial operation.
9. Preserve necessary audit history.

### Payroll Payment Security

Before accepting salary disbursement:

1. Verify approved Payroll payment permission.
2. Validate Teacher and Faculty Assignment.
3. Validate the Salary Agreement.
4. Check the running outstanding amount.
5. Validate the payment.
6. Prevent duplicates and overpayments.
7. Persist the Salary Payment and linked Posted Expense consistently.
8. Preserve required audit records.
9. Refresh authorized compensation views.

### Confirmed Payroll Model

Teacher remuneration is based on **independent teaching assignments and running balances**, not automatically generated monthly salary.

Do not build monthly salary-generation or unsupported correction endpoints.

---

## 22. Monetary Data Protection

Financial records must preserve accurate amounts.

### Requirements

- Use an approved exact monetary representation.
- Validate currency and precision.
- Avoid uncontrolled floating-point calculations.
- Preserve the verified frontend Fixed/Percentage salary formula.
- Prevent negative or unsupported balances.
- Reject payments exceeding applicable outstanding amounts.
- Preserve historical financial records.
- Restrict changes to protected financial fields.
- Audit sensitive financial actions.

Financial correctness must be verified under concurrent requests.

---

## 23. Sensitive Data Classification

The backend processes data with different confidentiality requirements.

| Data category | Examples | Protection |
|---|---|---|
| Public or approved presentation | Academy name and public branding | Normal integrity controls |
| Internal operational | Course and batch administration | Role and branch access |
| Personal | Student/staff identity and contacts | Authorized field/record access |
| Financial | Challans, fee collections, expenses | Restricted financial access |
| Highly confidential staff financial | Teacher remuneration and payslips | Strict administrative or self-only access |
| Authentication secrets | Password hashes, session credentials | Never expose through normal APIs |
| Security/audit | Privileged changes and audit records | Restricted administrative access |

Do not send an entire database document to the frontend when only a few fields are required.

---

## 24. Data Protection in Transit and at Rest

### In Transit

- Use HTTPS in deployed environments.
- Protect backend-to-database connections according to provider capabilities.
- Avoid insecure redirects that expose credentials.
- Do not send secrets in URL query parameters.

### At Rest

- Use approved database access controls.
- Restrict database users.
- Use provider-supported storage encryption.
- Secure backups.
- Keep secrets outside source code.
- Limit access to sensitive exports.

Exact encryption and data retention policies must be established for the selected deployment environment.

---

## 25. Environment and Secret Security

### Backend Secrets

Potential secrets include:

- MongoDB URI and password.
- Session signing secret.
- Password-reset tokens if a reset workflow is approved.
- Private service credentials.

### Rules

- Use environment-based secret configuration.
- Do not commit `.env` secrets.
- Do not expose secrets through `VITE_` frontend variables.
- Do not include secrets in error responses.
- Do not print credentials in logs.
- Use separate credentials for test, staging and production.
- Rotate compromised credentials through approved procedures.

Frontend environment variables are not private secret storage.

---

## 26. Security Headers

The deployed Express API should apply appropriate HTTP security headers.

A maintained middleware library may be considered if needed and approved.

Relevant controls include:

- Content-Type sniffing protection.
- Appropriate content security policy where applicable.
- HTTPS enforcement strategy.
- Frame embedding restrictions appropriate to the application's use.
- Referrer policy.
- Other current browser security protections.

Headers must be configured for the actual application architecture and not copied blindly from unrelated systems.

---

## 27. Rate Limiting and Abuse Prevention

Protect important endpoints from repeated abusive requests.

### Candidate Areas

- Login.
- Password change.
- Account recovery if later approved.
- Sensitive exports.
- Resource-intensive searches.
- Repeated financial submissions.

### Requirements

- Choose limits based on actual expected usage.
- Do not rely exclusively on client IP for identity-sensitive operations.
- Avoid easy lockout attacks.
- Record meaningful abuse indicators.
- Do not permit duplicate payments merely because requests are below rate limits.

Rate limiting is not equivalent to idempotency.

---

## 28. Secure Logging and Audit

### Security Logs

Relevant events may include:

- Login success/failure.
- Logout.
- Disabled-account access attempt.
- Protected-role update.
- Branch-role membership change.
- Unauthorized sensitive request.
- Session revocation.

### Business Audit

Relevant operations include:

- Admission decisions.
- Enrollment.
- Verified fee payment.
- Salary agreement changes.
- Payroll disbursement.
- Expense posting.
- Branch lifecycle changes.

### Logging Restrictions

Do not log:

- Plaintext passwords.
- Session cookies.
- Authentication secrets.
- Full confidential student profiles unnecessarily.
- Other teachers' salary details in broadly accessible logs.

Audit visibility must follow current effective permissions.

---

## 29. Secure Exports and Documents

The frontend supports approved printing and downloadable documents.

### Protected Outputs

- Student records.
- Fee receipts.
- Salary payslips.
- Financial ledgers.
- Staff reports.

### Requirements

- Authenticate the request before generating protected documents.
- Verify export permission.
- Apply record ownership.
- Apply branch scope.
- Use current authoritative data.
- Do not generate another Teacher's payslip for a Teacher self-service request.
- Avoid predictable public URLs for confidential documents.
- Prevent unauthorized caching or indexing of sensitive exports.

PDF or CSV generation must not bypass the permission policy applied to normal API reads.

---

## 30. Browser Storage Security

The current frontend uses localStorage as demo persistence.

After backend integration:

- Do not use browser localStorage as the authoritative database.
- Do not store production passwords in localStorage.
- Do not store session secrets in localStorage under the proposed server-managed session design.
- Clear sensitive session-specific UI state after logout.
- Avoid retaining another user's confidential financial information across account switches.
- Handle legacy mock data through an approved migration/import decision.

Do not silently transfer browser demo records into the production database.

---

## 31. Database Security

MongoDB is accessed through the backend only.

### Requirements

- Use dedicated least-privilege database credentials.
- Restrict network access.
- Validate organization and branch scope in repositories.
- Validate referenced records.
- Enforce appropriate unique constraints.
- Use transactions for related durable financial writes.
- Protect payment and salary history.
- Avoid arbitrary unscoped updates.
- Back up operational records according to the approved policy.

### Important

Knowing a valid MongoDB ObjectId does not authorize access to the corresponding record.

Authorization must be enforced before protected data is returned or changed.

---

## 32. Dependency and Supply Chain Security

### Requirements

- Use supported Node.js versions.
- Prefer maintained dependencies.
- Preserve the existing package manager and lockfile.
- Review newly proposed libraries before installation.
- Avoid unnecessary overlapping packages.
- Check dependency vulnerabilities using approved tooling.
- Do not automatically introduce major dependency upgrades during unrelated tickets.
- Avoid executing untrusted scripts without review.

Security dependency changes require appropriate testing.

---

## 33. Security Incident Handling

Potential incidents include:

- Unauthorized login.
- Compromised session.
- Cross-branch data leakage.
- Privilege escalation.
- Exposed database credentials.
- Unauthorized salary disclosure.
- Duplicate fee collection.
- Duplicate payroll payment.
- Missing linked salary expense.

### Response Principles

1. Prevent further unauthorized activity.
2. Preserve evidence.
3. Identify affected records and users.
4. Revoke affected credentials or sessions where required.
5. Verify financial integrity.
6. Apply approved correction or recovery procedures.
7. Record the incident appropriately.
8. Validate the implemented fix.

Do not silently alter verified financial history during incident recovery.

The formal incident response and notification process remains to be finalized.

---

## 34. Security Testing Strategy

Future backend tickets must test both permitted and denied operations.

### Authentication Tests

- Valid login.
- Invalid credentials.
- Disabled account.
- Expired session.
- Logout.
- Revoked session.
- Password change.

### RBAC Tests

- Five-role effective permissions.
- Receptionist full Admissions and Fees.
- Receptionist denied Finance and Payroll.
- Owner permitted financial operations.
- Admin privilege escalation denial.
- Teacher self-only profile and salary.
- Unknown permission rejection.

### Branch Tests

- Authorized branch access.
- Unauthorized branch access.
- Different roles across branches.
- Same-branch unresolved multiple-role fail-closed behavior.
- Cross-branch report restrictions.
- Current branch creation pause.

### Record Ownership Tests

- Teacher accessing own payslip.
- Teacher denied another Teacher's payslip.
- Unauthorized student record access.
- Cross-branch challan access.
- Cross-branch payroll payment.
- Protected user account mutation.

### Financial Tests

- Valid fee collection.
- Duplicate fee payment prevention.
- Overpayment rejection.
- Correct running payroll balance.
- No automatic monthly salary generation.
- Payroll payment/expense consistency.
- Payment concurrency protection.

### Web Security Tests

- CSRF protections.
- Restrictive CORS.
- Cookie flags.
- Input validation.
- Rate limiting.
- Mass-assignment rejection.
- Safe error responses.
- Protected export authorization.

A security test cannot be reported PASS without actual execution.

---

## 35. Security Acceptance Criteria

Authentication and security implementation is acceptable only when:

- Users authenticate against trusted backend records.
- Sessions are secure and revocable.
- All protected APIs enforce authentication.
- Five-role access follows approved permissions.
- Branch and record isolation work.
- Privileged account restrictions are enforced.
- Receptionist's approved Admissions/Fees access works.
- Teacher self-only salary access works.
- Other-teacher compensation access is denied.
- Sensitive finance and payroll operations are protected.
- Duplicate and excessive financial payments are prevented.
- Sensitive exports remain authorized.
- Environment secrets are protected.
- Relevant security tests actually pass.

Frontend route visibility alone is not sufficient acceptance evidence.

---

## 36. Production Security Checklist

- [ ] Production HTTPS enabled.
- [ ] Secure credential hashing implemented.
- [ ] Secure sessions configured.
- [ ] HttpOnly session cookies configured.
- [ ] Appropriate Secure/SameSite cookie settings applied.
- [ ] CSRF protection verified.
- [ ] CORS restricted to approved origins.
- [ ] Authentication rate limiting verified.
- [ ] Disabled users denied.
- [ ] Session revocation verified.
- [ ] Five-role backend authorization tested.
- [ ] Admin privilege escalation denied.
- [ ] Branch isolation tested.
- [ ] Record ownership tested.
- [ ] Teacher salary privacy tested.
- [ ] Receptionist Fees/Admissions permission tested.
- [ ] Receptionist Finance/Payroll denial tested.
- [ ] Current branch creation pause enforced.
- [ ] MongoDB credentials protected.
- [ ] Financial transactions and idempotency tested.
- [ ] Protected exports tested.
- [ ] Logs and audits avoid leaking secrets.
- [ ] Relevant integration tests passed.

Unchecked items indicate pending verification, not completed security work.

---

## 37. Open Security Decisions

The following remain TBD or subject to source-level verification:

- Final production authentication/session library.
- Session lifetime and inactivity timeout.
- Session revocation policy.
- Password policy.
- Password reset/recovery process.
- CSRF mechanism.
- Hosting-specific cookie configuration.
- Final action-level permission registry.
- Same-branch multi-role combination.
- Owner expense-write permissions.
- Sensitive data retention policy.
- Audit retention.
- Security monitoring and alerting.
- Backup encryption and access.
- Optional future multifactor authentication.

Do not silently invent these decisions.

---

## 38. Explicitly Deferred Security Features

The initial backend does not automatically include:

- Platform Admin authentication.
- Multi-client SaaS identity provisioning.
- Third-party social login.
- External SSO or enterprise identity providers.
- SMS authentication.
- Multifactor authentication.
- Public user self-registration.
- Unapproved password recovery services.
- Unapproved media upload security infrastructure.

These require separately approved product and implementation decisions.

---

## 39. Related Documentation

This specification must remain consistent with:

- `SECURITY.md` — Current authoritative security requirements.
- `RBAC_PERMISSIONS.md` — Role/action permission matrix.
- `TENANT_BRANCH_ISOLATION.md` — Organization and branch ownership.
- `API.md` — Proposed API architecture.
- `API_CONTRACTS.md` — HTTP request/response contracts.
- `DATABASE.md` — MongoDB design.
- `ERD.md` — Entity relationships.
- `BUSINESS_RULES.md` — Domain invariants.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial consistency.
- `DATA_FLOW.md` — Data movement.
- `ARCHITECTURE.md` — Technical architecture.
- `FRONTEND_INTEGRATION.md` — Frontend service boundaries.
- `BACKEND_TESTING_STRATEGY.md` — Testing requirements.
- `DEPLOYMENT.md` — Deployment security.
- `ENVIRONMENT_CONFIG.md` — Environment and secrets.
- `LOGGING_AND_MONITORING.md` — Operational security events.
- `AGENTS.md` — Coding-agent instructions.
- `RULES.md` — Engineering standards.
- `MEMORY.md` — Owner-approved decisions.
- `PROGRESS.md` — Verified implementation history.

Use actual repository paths when creating relative Markdown links.

---

## 40. Final Implementation Boundary

### Confirmed Business Requirements

- Five current frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Different roles across authorized branches.
- Current branch creation pause.
- Admin privilege restrictions.
- Physical Assets without media uploads.

### Proposed Security Architecture

- Secure server-managed sessions.
- HttpOnly cookies.
- Password hashing.
- Centralized authorization middleware.
- Branch and record ownership enforcement.
- CSRF/CORS protection.
- Rate limiting.
- Secure secrets management.
- Audit logging and security monitoring.

### Deferred

- Multi-client SaaS authentication.
- Platform Admin.
- Third-party identity providers.
- Multifactor authentication.
- Unapproved financial override workflows.
- Cloudinary/media security architecture.

### Not Implemented or Verified

- Production authentication services.
- MongoDB-backed sessions.
- Backend role and record authorization.
- Deployed CSRF/CORS configuration.
- Production security integration tests.
- Formal security acceptance.

**Governing Principle:** Every TSA Academy ERP request must be authenticated where required, authorized by current effective role and branch scope, validated against actual record ownership, and executed without compromising student information, staff confidentiality or financial integrity.

**Document Status:** DRAFT — Ready for backend authentication and security design review. Implementation requires separately approved development tickets.
