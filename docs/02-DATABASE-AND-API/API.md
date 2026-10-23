# API

<!-- > **Purpose:** Placeholder for the future approved detailed HTTP API specification. -->

# TSA Academy ERP — Backend API Specification

**Document:** API.md
**Project:** TSA Academy ERP
**Version:** 1.0 — Initial Backend API Design
**Status:** DRAFT — API Contracts Proposed, Not Implemented
**Architecture:** Modular Monolith
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Frontend:** React + Vite
**API Version:** v1
**Proposed Base URL:** `/api/v1`

---

## 1. Purpose

This document defines the planned Backend REST API architecture for TSA Academy ERP.

Its purpose is to establish clear communication contracts between the completed React frontend and the future Node.js/Express backend.

The backend must preserve the existing frontend's approved features, business workflows, data relationships, salary calculations, role restrictions and user interactions.

This document covers:

- REST API organization and endpoint responsibilities.
- Authentication and session handling.
- Role-based and branch-based authorization.
- Request and response conventions.
- Input validation and error handling.
- Module-specific API contracts.
- Database transaction boundaries.
- Financial and payroll consistency.
- Frontend-to-backend integration.
- API performance, security and testing.

**Important:** Endpoints and payload structures in this document are proposed backend contracts unless explicitly marked approved. Their presence does not mean that an endpoint has already been implemented.

---

## 2. API Design Principles

The backend must follow these principles:

1. **Frontend compatibility:** Preserve approved frontend workflows and service behavior.
2. **REST architecture:** Use consistent HTTP methods and resource-oriented endpoints.
3. **Modularity:** Each backend module owns its relevant APIs and business operations.
4. **Separation of concerns:** Controllers must not contain complex business or database logic.
5. **Security:** Authenticate users and authorize every protected operation.
6. **Branch isolation:** Validate organization, branch and record ownership server-side.
7. **Data integrity:** Prevent invalid references, duplicates and partial financial transactions.
8. **Consistency:** Use shared authoritative records for Dashboard, Finance and Reports.
9. **Scalability:** Use bounded queries, appropriate indexes and pagination.
10. **Backward compatibility:** Avoid unexpected response changes that break existing frontend services.
11. **No invented functionality:** Unapproved actions must not be added simply because similar ERP applications support them.
12. **Incremental implementation:** Implement APIs module by module under separately approved tickets.

---

## 3. API Request Architecture

The planned request flow is:

```text
React Page / Component
        |
        v
Frontend Domain Service
        |
        v
HTTP API Adapter
        |
        v
Express API Route
        |
        v
Authentication Middleware
        |
        v
Organization / Branch Authorization
        |
        v
Action / Record-Level Permission Check
        |
        v
Request Validation
        |
        v
Controller
        |
        v
Business Service
        |
        v
Repository / Mongoose Model
        |
        v
MongoDB
        |
        v
Normalized API Response
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Routes | Define HTTP paths, methods and applicable middleware. |
| Controllers | Receive requests and return HTTP responses. |
| Validation | Validate request body, parameters and query values. |
| Services | Enforce business rules and coordinate workflows. |
| Repositories | Perform database reads and writes. |
| Models | Define database schemas and constraints. |
| Middleware | Enforce session, permissions, branch scope and request security. |
| API Adapter | Connect existing frontend services to HTTP endpoints. |

Business formulas must be implemented in domain services rather than duplicated across controllers, repositories or reporting endpoints.

---

## 4. API Versioning

**Proposed base path:**

```text
/api/v1
```

Examples:

```http
GET /api/v1/auth/session
GET /api/v1/branches
GET /api/v1/branches/:branchId/admissions
```

Rules:

- Preserve stable endpoint behavior within an API version.
- Breaking contract changes require documentation and compatibility review.
- Do not create new API versions for minor internal implementation changes.
- Use existing frontend service interfaces when defining the final HTTP adapter.
- Do not expose internal MongoDB collection structures directly to frontend components.

---

## 5. Authentication and Session APIs

Production authentication must replace browser-local mock authentication.

### Proposed Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate staff credentials. |
| GET | `/auth/session` | Return the authenticated user's current session and authorized context. |
| DELETE | `/auth/session` | Log out and invalidate the current session. |
| PATCH | `/auth/active-branch` | Change to another authorized branch. |
| PATCH | `/auth/password` | Change the authenticated user's password. |

All endpoint paths are relative to `/api/v1`.

### Authentication Requirements

- Use individual staff accounts.
- Verify active account status.
- Validate password credentials securely.
- Use a proposed server-managed session strategy with HttpOnly cookies.
- Protect cookie-authenticated state-changing requests against CSRF.
- Configure production HTTPS, secure cookie attributes and appropriate CORS.
- Apply login rate limiting.
- Recheck permissions after user-role or branch-assignment changes.
- Reject expired, revoked or invalid sessions.
- Never place production passwords or session secrets in frontend localStorage.

Session expiration durations, password recovery and concurrent-session rules require final security approval.

---

## 6. Roles and Authorization

TSA Academy ERP has five current frontend roles:

1. Super Admin
2. Admin
3. Receptionist
4. Owner
5. Teacher

Authorization is evaluated using the authenticated identity, selected authorized branch, required action and record ownership.

### 6.1 Super Admin

Super Admin has the system's implemented administrative capabilities, subject to approved organization/branch scope and specific action policies.

Super Admin is not exempt from record validation, business rules or financial integrity checks.

### 6.2 Admin

Admin has the approved operational and administrative capabilities within assigned branches.

Admin must not:

- Grant Super Admin privileges.
- Create or assign higher administrative roles outside the approved policy.
- Modify privileged user accounts contrary to existing frontend restrictions.
- Obtain unauthorized cross-branch access.

### 6.3 Receptionist

**CONFIRMED — Full Admissions and Fees Access**

Receptionist has full access to the currently approved and implemented actions in:

- Admissions.
- Fees.

Admissions permissions include applicable create, view, edit, review, approval, enrollment, status and deletion operations as defined by the latest frontend implementation.

Fees permissions include applicable fee/challan management, collections, verified payments, receipts and student fee-ledger operations.

The Receptionist must not receive independent access to:

- Finance and Expenses.
- Teacher Payroll.
- Audit Log.
- Branch Management.
- User Management.
- Administrative Settings.

Full Fees access does not automatically authorize refunds, reversals, chargebacks or unapproved adjustments.

### 6.4 Owner

Owner access follows the current verified frontend permissions.

The existing system includes authorized financial and payroll viewing capabilities, alongside permitted operational views.

Write permissions, including existing expense capabilities, must be verified against the effective frontend permission registry before backend implementation.

Do not infer unrestricted organization-wide authority from the Owner role.

### 6.5 Teacher

**CONFIRMED — My Profile Self-Service**

A Teacher can access their own account information through the `My Profile` workflow.

Authorized self-service information includes:

- Overview and biography.
- Contact and professional information.
- Class schedule and timetable.
- Assigned courses, batches and subjects.
- Related permitted student/teaching information.
- Assignment salary agreements.
- Total agreed remuneration.
- Verified salary paid.
- Outstanding salary.
- Payment history.
- Own payslips and PDF/print options.
- Personal salary payment notifications.

Teacher access must be limited to the authenticated teacher's own records and academic assignments.

Teachers cannot read other teachers' compensation or use administrative Faculty, Finance or Payroll Management APIs.

### 6.6 Multiple Branches and Roles

A user may have different roles in different branches.

Effective permissions must be recalculated for the selected authorized branch.

The current frontend fails closed for unresolved multiple-role combinations within one branch. The backend must not silently introduce permission union or privilege escalation.

### 6.7 Authorization Rules

Every protected API must:

1. Authenticate the request.
2. Verify account status.
3. Verify organization ownership.
4. Verify authorized branch membership or explicit approved wider scope.
5. Verify the required action permission.
6. Verify target record ownership and relevant business restrictions.
7. Reject unauthorized requests without leaking protected data.

The API must not accept client-submitted roles or permission lists as proof of authority.

---

## 7. Organization and Branch Context

The initial application serves one academy organization with multiple branches.

The architecture should retain clear organization ownership boundaries without implementing future Platform Admin or SaaS provisioning workflows.

### Branch API Rules

- Branch IDs identify the requested working scope; they are not authorization evidence.
- Validate each requested branch against the authenticated user's effective grants.
- Reject cross-branch access without explicit authorization.
- Ensure related records belong to the correct organization and branch.
- Revalidate authorization when assignments or branch status change.
- Prevent stale previous-branch results from appearing under a new branch context.

**Current product restriction:** New branch creation remains paused until separately reauthorized.

Existing authorized branch listing, editing, activation/deactivation and guarded deletion workflows must follow the latest frontend rules.

---

## 8. Standard API Responses

A consistent JSON response format should be used across modules.

The following envelope is **PROPOSED**, pending reconciliation with the current frontend integration specification.

### Successful Resource Response

```json
{
  "data": {
    "id": "resource-id"
  }
}
```

### Successful Collection Response

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 0
    }
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "fieldErrors": {},
    "requestId": "request-reference"
  }
}
```

The final API response envelope must be standardized before implementation. Existing documents contain alternative proposed formats and should not be treated as automatically compatible.

### HTTP Status Conventions

| HTTP status | Meaning |
|---|---|
| 200 | Successful read or update. |
| 201 | Resource successfully created. |
| 204 | Successful operation without response body. |
| 400 | Malformed request. |
| 401 | Authentication required or invalid session. |
| 403 | Permission denied. |
| 404 | Resource unavailable or not found within authorized scope. |
| 409 | Conflict, duplicate or stale version. |
| 422 | Request validation failure. |
| 429 | Rate limit exceeded. |
| 500 | Unexpected server failure. |

Do not return internal stack traces, secrets or unauthorized record details.

---

## 9. Validation Requirements

Every production API must perform authoritative server-side validation.

Validate:

- Required fields.
- Supported field types.
- Allowed values and formats.
- Numeric ranges and monetary amounts.
- Valid identifiers.
- Valid organization and branch associations.
- Existing referenced entities.
- Permitted record status transitions.
- Duplicate restrictions.
- Assignment and enrollment relationships.
- Request concurrency/version conditions.

### Input Safety

- Reject or safely handle unknown fields.
- Avoid unrestricted request-body-to-model updates.
- Apply explicit writable-field allowlists.
- Prevent user-controlled MongoDB query operators.
- Validate search, sorting and filter parameters.
- Separate input-shape validation from business authorization.

Frontend validation is for usability; it does not replace backend validation.

---

## 10. Pagination, Filtering and Search

Collection endpoints should support bounded retrieval.

Proposed query example:

```http
GET /api/v1/branches/:branchId/students?page=1&pageSize=20&search=
```

Requirements:

- Consistent stable ordering.
- Approved filter and sort fields.
- Appropriate default pagination.
- Server-enforced maximum page size.
- Branch-scoped queries.
- Indexed search paths where justified.
- No unbounded disclosure of confidential data.

The exact pagination strategy and limits remain proposed until the relevant integration contract is approved.

---

# 11. Module API Specification

All endpoints listed below are **PROPOSED**. They provide a design inventory, not confirmed implemented routes.

## 11.1 Dashboard

**Purpose:** Deliver role-aware academy statistics and permitted operational summaries.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/dashboard` | Return the authorized dashboard projection. |

Dashboard responses must reflect actual records and role-specific visibility.

Student counts, fee collections, outstanding balances, payroll statistics and teacher workload must use authoritative shared calculations.

Teachers receive only their permitted teaching context.

---

## 11.2 Admissions

**Purpose:** Manage admission applications and transitions to students, enrollment and fees.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/admissions` | List authorized admissions. |
| GET | `/branches/:branchId/admissions/:id` | View one admission. |
| POST | `/branches/:branchId/admissions` | Create an admission. |
| PATCH | `/branches/:branchId/admissions/:id` | Update permitted admission fields. |
| PATCH | `/branches/:branchId/admissions/:id/status` | Perform an approved admission status transition. |
| POST | `/branches/:branchId/admissions/:id/enroll` | Enroll an approved admission. |
| POST | `/branches/:branchId/admissions/complete` | Execute the approved instant admission completion flow. |
| DELETE | `/branches/:branchId/admissions/:id` | Apply guarded admission deletion rules. |

### Business Requirements

- Validate student identity and course/batch references.
- Respect batch capacity and duplicate enrollment rules.
- Preserve the relationship between Admission, Student and Enrollment.
- Enrollment must not automatically mean a fee payment was received.
- Instant admission completion can coordinate Student, Admission, Enrollment, Challan and optional Verified Payment according to the approved frontend transaction.
- Apply actual current status-transition rules; do not reinstate deprecated Reject behavior without approval.
- Receptionist has full access to implemented Admissions actions.
- Sensitive multi-record operations require atomicity and duplicate protection.

---

## 11.3 Students

**Purpose:** Manage student identities and authorized academic profiles.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/students` | List authorized student records. |
| GET | `/branches/:branchId/students/:id` | Read student details. |
| POST | `/branches/:branchId/students` | Create an authorized student record. |
| PATCH | `/branches/:branchId/students/:id` | Update approved student fields. |
| DELETE | `/branches/:branchId/students/:id` | Apply approved guarded deletion rules. |

Preserve linked enrollments, admissions and financial history.

Teacher access to relevant students must use assignment-based record filtering rather than broad branch-wide student permissions.

Display serial numbers must remain distinct from permanent internal identifiers.

---

## 11.4 Courses, Batches, Subjects and Streams

**Purpose:** Provide the academic structure used by Admissions, Faculty, Classes, Fees and Reports.

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/branches/:branchId/courses` | List or create courses. |
| GET/PATCH | `/branches/:branchId/courses/:id` | View or update a course. |
| GET/POST | `/branches/:branchId/batches` | List or create batches. |
| GET/PATCH | `/branches/:branchId/batches/:id` | View or update a batch. |
| GET/POST | `/branches/:branchId/subjects` | List or create subjects. |
| GET/PATCH | `/branches/:branchId/subjects/:id` | View or update a subject. |
| GET/POST | `/branches/:branchId/streams` | List or create streams. |
| GET/PATCH | `/branches/:branchId/streams/:id` | View or update a stream. |

Requirements:

- Preserve course-to-batch and subject relationships.
- Verify saved references, capacity and activity status.
- Preserve actual course-fee versus selected-subject-fee calculation behavior.
- Avoid duplicate or unrelated academic records.
- Prevent destructive changes to referenced historical data.

---

## 11.5 Faculty and Classes

**Purpose:** Manage teachers' academic assignments and class schedules.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/faculty-assignments` | List authorized teaching assignments. |
| POST | `/branches/:branchId/faculty-assignments` | Create an approved teaching assignment. |
| PATCH | `/branches/:branchId/faculty-assignments/:id` | Update a teaching assignment. |
| GET | `/branches/:branchId/classes` | List authorized class schedules. |
| GET | `/branches/:branchId/classes/:id` | View class details. |

A faculty assignment connects Teacher, Branch, Course, Batch and Subject.

Validate teacher eligibility, approved schedules and conflict rules.

Faculty assignment identifiers must also support the assignment-based Teacher Payroll workflow.

---

## 11.6 Fees and Challans

**Purpose:** Manage student fee obligations, verified payments and receipts.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/challans` | List challans. |
| GET | `/branches/:branchId/challans/:id` | View challan details. |
| POST | `/branches/:branchId/challans` | Create an approved fee obligation. |
| GET | `/branches/:branchId/payments` | List authorized student fee payments. |
| POST | `/branches/:branchId/payments` | Record an approved student fee payment. |
| GET | `/branches/:branchId/receipts/:paymentId` | Retrieve a verified payment receipt. |

### Mandatory Rules

- Preserve the frontend's one-challan-per-enrollment behavior unless later approved otherwise.
- Support approved partial fee payments.
- Do not count unverified payments as collected revenue.
- Prevent payment amounts from exceeding allowed outstanding balances.
- Prevent unintended duplicate payments.
- Preserve payment history and receipts.
- Keep Fees, Dashboard, Finance and Reports synchronized from the same authoritative records.
- Receptionist has full approved Fees module access.

The exact payment verification mechanism and any refund/reversal workflows require separate contract approval.

---

## 11.7 Finance and Expenses

**Purpose:** Present verified collections, posted expenses and authorized financial summaries.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/finance` | Return financial overview. |
| GET | `/branches/:branchId/expenses` | List authorized expenses. |
| POST | `/branches/:branchId/expenses` | Record an approved expense. |
| GET | `/branches/:branchId/expenses/:id` | View expense details. |

Finance must use verified fee payments and posted expenses.

Payroll payments must produce the corresponding posted expense through a consistent transaction workflow.

Do not automatically grant Receptionist Finance or Expenses permissions merely because Receptionist can collect fees.

Unapproved expense reversals, approvals and period-closing workflows must remain outside implementation.

---

## 11.8 Teacher Payroll

**Purpose:** Manage independent, assignment-based teacher salary obligations and settlement records.

**CONFIRMED BUSINESS RULE: RUNNING ASSIGNMENT PAYROLL — NOT MONTHLY PAYROLL.**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/payroll/agreements` | List authorized assignment salary agreements. |
| POST | `/branches/:branchId/payroll/agreements` | Establish an approved assignment salary agreement. |
| PATCH | `/branches/:branchId/payroll/agreements/:id` | Update an agreement within approved restrictions. |
| GET | `/branches/:branchId/payroll/running` | Retrieve assignment-level payable, paid and outstanding values. |
| POST | `/branches/:branchId/payroll/payments` | Record an authorized salary payment. |
| GET | `/branches/:branchId/payroll/payments` | List salary payment history. |
| GET | `/branches/:branchId/payroll/payslips/:paymentId` | Retrieve an authorized salary payslip. |

### Payroll Rules

1. Payroll is tied to an approved teacher assignment.
2. Every distinct eligible assignment has its own remuneration agreement and obligation.
3. The agreement may use the existing Fixed or Percentage salary method.
4. The calculation must match the actual frontend source exactly.
5. A calendar-month change must not automatically create salary.
6. New batch/subject assignments may establish new independent obligations.
7. Payments reduce the applicable assignment's outstanding balance.
8. Previous obligations, payments and outstanding balances remain preserved.
9. Payments cannot exceed the currently permitted payable balance.
10. Payroll disbursement must reconcile with a posted expense and authorized reports.
11. Teachers can read only their own permitted compensation records.
12. Receptionists cannot access Teacher Payroll.
13. Unsupported advances, adjustments or monthly-generation APIs must not be added.

### Formula Verification Gate

Before implementing actual calculations, inspect:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`
- Relevant existing tests.

Do not invent a formula or rounding policy.

---

## 11.9 Teacher My Profile

**Purpose:** Provide teacher self-service without exposing administrative faculty/payroll operations.

Proposed self-scoped endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/profile` | Own profile and biography. |
| GET | `/me/teaching-assignments` | Own academic assignments. |
| GET | `/me/timetable` | Own class schedule. |
| GET | `/me/compensation` | Own salary agreements and running balances. |
| GET | `/me/salary-payments` | Own verified salary payment history. |
| GET | `/me/payslips/:paymentId` | Own payslip. |
| GET | `/me/notifications` | Own authorized notifications. |

The backend must determine the Teacher identity from the authenticated session.

Never rely on a client-submitted teacher ID for self-only access.

The response must not include another Teacher's confidential profile or financial data.

---

## 11.10 Demo Classes

**Purpose:** Manage demo inquiries, attendance outcomes and conversion to Admissions.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/demo-inquiries` | List demo registrations. |
| POST | `/branches/:branchId/demo-inquiries` | Register a demo inquiry. |
| PATCH | `/branches/:branchId/demo-inquiries/:id` | Update permitted details. |
| POST | `/branches/:branchId/demo-inquiries/:id/attendance` | Record the approved attendance outcome. |
| POST | `/branches/:branchId/demo-inquiries/:id/cancel` | Apply approved cancellation. |
| POST | `/branches/:branchId/demo-inquiries/:id/convert` | Convert to an admission. |

Conversion must preserve source relationships and prevent duplicate conversion.

Do not automatically create unsupported class-session or scheduling workflows.

---

## 11.11 Assets and Inventory

**Purpose:** Manage physical academy inventory.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/assets` | List inventory. |
| POST | `/branches/:branchId/assets` | Register an inventory asset. |
| GET | `/branches/:branchId/assets/:id` | View asset information. |
| PATCH | `/branches/:branchId/assets/:id` | Update approved asset fields. |
| POST | `/branches/:branchId/assets/:id/assignments` | Record approved staff assignment. |
| POST | `/branches/:branchId/assets/:id/inspections` | Record inspection. |
| POST | `/branches/:branchId/assets/:id/maintenance` | Record maintenance. |

Examples include computers, projectors, furniture and other institutional equipment.

**Not included:** Image uploads, video uploads, digital asset management or Cloudinary integration.

Future media storage is deferred until separately approved.

---

## 11.12 Reports and Ledgers

**Purpose:** Generate authorized academic, financial and payroll reports from authoritative records.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/reports/:reportKey` | Retrieve an authorized report. |
| POST | `/branches/:branchId/exports` | Request an approved export. |

Reports must use consistent metric definitions and enforce the requesting user's permissions.

Cross-branch comparison is allowed only under the existing explicit reporting authorization.

Receipt, payroll and report export permissions must never be inferred from frontend tab visibility alone.

---

## 11.13 Audit Log

**Purpose:** Record and display authorized history of sensitive changes.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/audit-events` | Read authorized audit records. |

Production audit history must be server-controlled and protected against ordinary user editing.

Do not expose audit update or deletion endpoints as normal ERP operations.

Do not log passwords, session secrets or unnecessary sensitive personal information.

---

## 11.14 Branches

**Purpose:** Manage existing academy branches according to approved policies.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches` | List authorized branches. |
| GET | `/branches/:branchId` | Retrieve branch information. |
| PATCH | `/branches/:branchId` | Update permitted branch details. |
| PATCH | `/branches/:branchId/status` | Activate/deactivate under approved rules. |
| DELETE | `/branches/:branchId` | Guarded branch deletion. |

**Creation pause:** Do not enable an operational `POST /branches` workflow while the owner-approved creation pause remains active.

Existing branch deletion safeguards must be preserved.

---

## 11.15 Users

**Purpose:** Manage staff accounts and branch-specific role assignments.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/users` | List authorized staff accounts. |
| POST | `/branches/:branchId/users` | Create an approved staff account. |
| GET | `/branches/:branchId/users/:id` | View authorized staff details. |
| PATCH | `/branches/:branchId/users/:id` | Update permitted user information. |
| PATCH | `/users/:id/assignments` | Update approved branch-role assignments. |

Requirements:

- Preserve reusable user identities across branches.
- Restrict Admin from administrative privilege escalation.
- Apply updates to effective permissions and sessions.
- Protect credentials and account status.
- Prevent unauthorized modification of privileged accounts.

---

## 11.16 Settings

**Purpose:** Manage authorized academy/branch profile and operational configuration.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/settings` | Read authorized settings. |
| PATCH | `/branches/:branchId/settings` | Update approved settings. |

Preserve existing academy name, theme and branch-profile functionality.

Do not add file-upload handling or Cloudinary integration.

---

## 12. Cross-Module Transaction Requirements

Important multi-record operations must preserve consistency.

| Workflow | Required consistency |
|---|---|
| Instant Admission | Student, Admission, Enrollment, Challan and optional Verified Payment must be coordinated atomically. |
| Enrollment | Prevent duplicate enrollment, invalid batch references and inconsistent capacity. |
| Fee Payment | Prevent duplicate collections and invalid outstanding balances. |
| Payroll Payment | Salary payment, updated obligation and posted expense must remain consistent. |
| Demo Conversion | Preserve original inquiry and linked admission without duplication. |
| User Role Changes | Persist authorized assignments and invalidate outdated access appropriately. |

Use database transactions where needed, combined with suitable unique constraints, version checks and idempotency.

Transactions do not automatically solve all race conditions; business invariants must be verified.

---

## 13. Financial Data Rules

Money must never depend on uncontrolled floating-point calculations.

The proposed backend representation is integer minor units or another explicitly approved exact monetary representation.

Before implementation, define:

- Currency and precision.
- Input/output representation.
- Rounding conventions.
- Existing frontend salary formula compatibility.
- Payment verification semantics.
- Outstanding balance calculation.
- Transaction reference uniqueness.

Do not change visible financial results merely because the backend uses a different internal representation.

---

## 14. API Idempotency

Sensitive writes must prevent accidental duplicate processing.

Proposed `Idempotency-Key` header:

```http
Idempotency-Key: unique-client-request-reference
```

Appropriate workflows include:

- Instant admission completion.
- Enrollment creation.
- Fee payment.
- Payroll payment.
- Demo conversion.

The server must scope idempotency records appropriately to the authenticated actor, operation and organization/branch context.

A repeated equivalent request must not create an unintended second financial transaction.

---

## 15. Error Handling and Recovery

API errors must provide safe and useful information.

Requirements:

- Use stable error identifiers.
- Return suitable HTTP status codes.
- Support field-level validation errors.
- Distinguish conflict from authorization failure.
- Preserve operation integrity when persistence fails.
- Do not show success before completion.
- Do not blindly retry non-idempotent financial writes.
- Provide request IDs for operational investigation.
- Do not expose protected record existence unnecessarily.

Frontend services should translate server errors into the existing UI feedback conventions.

---

## 16. Frontend Integration Rules

The existing frontend uses a centralized service and mock persistence structure.

The planned transition is:

```text
Current:

React Page
  → Frontend Domain Service
  → Mock Adapter
  → Browser Local Storage

Future:

React Page
  → Frontend Domain Service
  → HTTP Adapter
  → Express API
  → MongoDB
```

### Integration Requirements

- Preserve existing page layouts and user actions.
- Preserve domain service interfaces wherever feasible.
- Replace mock persistence incrementally by domain.
- Normalize backend responses into expected frontend service results.
- Preserve stable internal identifiers and relationships.
- Revalidate authorization on the server.
- Prevent previous-branch responses from contaminating active-branch state.
- Keep migration/data import decisions separate from API implementation.

Do not rewrite the entire frontend to introduce the backend.

---

## 17. Data Refresh and Cache Consistency

Successful writes should invalidate relevant derived information.

Examples:

- Admissions changes affect Students, Enrollment and Dashboard.
- Enrollment changes affect Batch occupancy and Fees.
- Fee payments affect Challans, Finance, Dashboard and Reports.
- Faculty assignments affect Classes, Teacher My Profile and Payroll eligibility.
- Payroll payments affect Teacher Compensation, Finance Expenses and Reports.
- Role changes affect authorized navigation and data.
- Branch switching invalidates previous-branch transient data.

Caches must be isolated by authorized identity and branch.

Redis, realtime connections and background queues are optional future capabilities and must not be introduced without a demonstrated need and approved ticket.

---

## 18. API Security Requirements

Production APIs must enforce:

1. Server authentication.
2. Account status verification.
3. Role/action authorization.
4. Organization and branch isolation.
5. Record-level permissions.
6. Ownership checks for Teacher self-service.
7. Input validation and mass-assignment protection.
8. Safe CORS and CSRF configuration.
9. Secure session handling.
10. Appropriate rate limits.
11. Protected exports.
12. Financial transaction integrity.
13. Audit logging.
14. Safe error responses.
15. Sensitive data minimization.

Frontend route guards are not sufficient production security.

---

## 19. Performance and Scalability

The API should be designed for growing numbers of students, batches, branches and financial records.

Recommended practices:

- Paginated collection queries.
- Database indexes based on actual access patterns.
- Efficient MongoDB projections.
- Avoid unnecessary repeated database lookups.
- Bounded report queries.
- Targeted aggregation for dashboard statistics.
- Reasonable timeouts.
- Efficient authorization checks.
- Controlled cache invalidation.
- Avoid premature infrastructure complexity.

Quantitative latency, throughput and concurrency targets remain TBD.

---

## 20. Testing Requirements

Future implementation tickets must include relevant automated verification.

### Authentication Tests

- Valid and invalid login.
- Session expiration.
- Logout.
- Disabled user handling.

### Authorization Tests

- Five-role grants.
- Receptionist full Admissions/Fees.
- Receptionist denied Finance/Payroll.
- Admin privilege-escalation denial.
- Cross-branch authorization denial.
- Teacher own-profile access.
- Teacher access denied to another teacher's compensation.

### Business Workflow Tests

- Admission creation and enrollment.
- Challan generation.
- Verified payment and outstanding balance.
- Duplicate payment prevention.
- Faculty assignment restrictions.
- Running payroll calculations.
- Salary partial/full payment.
- Payroll expense consistency.
- Preserved historical salary obligations.
- Demo conversion.
- Authorized reporting and exports.

### API Contract Tests

- Request validation.
- Response compatibility.
- Missing/invalid records.
- Conflict handling.
- Pagination.
- Idempotency.
- Transaction rollback.
- Branch switching and stale responses.

No test should be reported PASS unless it has actually run successfully.

---

## 21. Proposed Backend API Implementation Order

The recommended sequence is:

| Phase | Scope |
|---|---|
| B01 | Backend foundation, configuration and database connectivity |
| B02 | Authentication, sessions, users, branch context and authorization |
| B03 | Courses, Batches, Subjects and academic reference data |
| B04 | Admissions, Students and Enrollments |
| B05 | Challans, Fee Payments and Receipts |
| B06 | Faculty Assignments and Classes |
| B07 | Assignment-Based Teacher Payroll and Finance |
| B08 | Demo Classes, Assets, Reports, Audit and Settings |
| B09 | Frontend HTTP Adapter Integration and Regression Testing |
| B10 | Security, performance, deployment and client acceptance verification |

This is a proposed sequence, not automatic authorization to implement every phase.

Each phase must be divided into appropriately sized approved development tickets.

---

## 22. Open Decisions

The following require verification or separate technical/product approval before affected implementation:

- Exact response envelope.
- Final pagination format and limits.
- Production session configuration.
- Same-branch multi-role permission combination.
- Monetary representation and rounding policy.
- Salary percentage formula verification from actual source.
- Final endpoint path compatibility with frontend services.
- Server timezone/date contract.
- Refunds, chargebacks, reversals and other financial adjustments.
- Expense correction or approval workflow.
- Historical mock payroll migration.
- Student transfer and merge policy.
- Data retention and audit policy.
- Hosting/domain configuration.
- Backup and disaster recovery requirements.

Unresolved decisions must not be silently invented.

---

## 23. Related Documentation

This API specification must remain consistent with:

- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `SECURITY.md` — Authentication and authorization.
- `ARCHITECTURE.md` — Technical architecture.
- `ERD.md` — Entity relationships and constraints.
- `FRONTEND_INTEGRATION.md` — Frontend service contracts.
- `FRONTEND_AUDIT.md` — Verified frontend module behavior.
- `FRONTEND_BACKEND_HANDOFF.md` — Proposed handoff endpoints and contracts.
- `MODULE_WORKFLOW_MAP.md` — Cross-module process mapping.
- `ROLE_BRANCH_DATA_MATRIX.md` — Frontend role and data scope evidence.
- `BACKEND_GAPS_AND_RISKS.md` — Unresolved backend risks.
- `RULES.md` — Engineering standards.
- `AGENTS.md` — AI development instructions.
- `MEMORY.md` — Approved decision history.
- `PROGRESS.md` — Verified implementation status.

Documentation links must be resolved according to the actual repository folder structure.

---

## 24. Final Implementation Boundary

**CONFIRMED:**

- Five frontend roles.
- Receptionist full approved Admissions and Fees access.
- Teacher self-only My Profile and compensation visibility.
- Assignment-based running Teacher Payroll.
- One initial academy with multiple branches.
- Node.js, Express, MongoDB and Mongoose.
- Preserve existing completed frontend workflows.

**PROPOSED:**

- REST endpoint paths.
- JSON response envelopes.
- Specific pagination contracts.
- Session transport design.
- Detailed backend implementation sequence.

**DEFERRED:**

- Platform Admin and multi-client SaaS provisioning.
- Cloudinary and media uploads.
- Unsupported financial reversals.
- Unnecessary realtime and distributed infrastructure.

**NOT IMPLEMENTED:**

- Production REST APIs.
- Backend authentication and authorization.
- MongoDB-backed operational services.
- Production data migration.

**Governing Principle:** The backend API must securely reproduce the existing approved frontend behavior, preserve financial and academic integrity, and introduce no unapproved business workflows.

**Document Status:** DRAFT — Ready for API contract review; backend implementation requires separate authorization.


**Status:** PURPOSE ONLY — FINAL CONTRACTS NOT AUTHORED OR APPROVED.

Current frontend operations are audited in [Frontend Audit](../FRONTEND_AUDIT.md). Suggested endpoints in [Frontend Backend Handoff](../FRONTEND_BACKEND_HANDOFF.md) are **PROPOSED**, not implemented APIs. Detailed authentication, request/response, validation, idempotency and error contracts require a separate documentation ticket.
