# API_CONTRACTS

<!-- > Purpose: Defines API request/response contracts, validation, pagination and standardized errors. -->

# TSA Academy ERP — REST API Contracts & Integration Specification

**Document:** API_CONTRACTS.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Proposed Contracts; Backend Not Implemented
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Proposed API Base Path:** `/api/v1`

---

## 1. Purpose

This document defines the proposed HTTP contracts between the existing TSA Academy ERP frontend and its future backend.

It specifies:

- Authentication and session contracts.
- HTTP methods and resource paths.
- Request body formats.
- Response envelopes.
- Query parameters and pagination.
- Role and branch authorization.
- Validation and error responses.
- Cross-module transaction contracts.
- Financial and payroll API safety.
- Frontend service-to-HTTP mappings.
- Contract testing and compatibility rules.

The primary objective is to replace the frontend's centralized mock adapter with a secure HTTP adapter while preserving approved frontend behavior.

**All endpoints, request fields and response shapes below are PROPOSED until reconciled against the exact current frontend service signatures and accepted for implementation. They are not operational APIs.**

---

## 2. Contract Governance

### Decision Classification

| Label | Meaning |
|---|---|
| CONFIRMED | Explicit owner-approved requirement |
| FRONTEND IMPLEMENTED | Evidenced by existing source or verification reports |
| PROPOSED | Suggested future backend contract |
| TBD | Requires further decision or source inspection |
| DEFERRED | Outside current release |
| SUPERSEDED | Replaced historical behavior |

### Source-of-Truth Rules

1. Preserve the latest owner-approved business decisions.
2. Inspect existing frontend domain services before finalizing request fields.
3. Use `SECURITY.md` and `RBAC_PERMISSIONS.md` for effective authorization.
4. Use `ERD.md` and `DATABASE.md` for finalized persistence relationships.
5. Use `BUSINESS_RULES.md` for business invariants.
6. Use `API.md` for endpoint architecture.
7. Do not treat an example JSON payload as a confirmed production schema.
8. Do not implement unapproved features to fill gaps in this document.

### Status Distinction

- Existing React pages and mock services are implemented frontend functionality.
- HTTP endpoint examples are design proposals.
- Mongoose schemas, real authentication and production transactions are not yet implemented.
- Backend implementation requires separately approved tickets.

---

## 3. General HTTP Conventions

### Base Path

`/api/v1`

### HTTP Methods

| Method | Purpose |
|---|---|
| GET | Retrieve permitted resources |
| POST | Create records or execute approved actions |
| PATCH | Modify approved fields or perform controlled transitions |
| DELETE | Perform explicitly approved deletion or session termination |

Use resource-oriented endpoints where possible.

Action endpoints are acceptable for business transitions requiring validation and atomicity, such as enrollment and salary disbursement.

### Content Types

Default JSON requests and responses:

`Content-Type: application/json`

CSV/PDF/Word exports may use another approved response content type.

### Resource Identifiers

Use stable string IDs in frontend-facing contracts.

The backend may use MongoDB ObjectIds internally, but React pages must not depend on MongoDB-specific methods or data structures.

### Dates

Proposed:

- ISO 8601 timestamps for events.
- Date-only values for business calendar dates.
- Explicit time-zone handling.

The exact server timezone and date serialization contract remains TBD.

### Money

Use a consistently approved exact monetary representation.

Examples below use illustrative numeric values expressed in PKR for readability, but **do not establish the final minor-unit, Decimal128 or rounding policy**.

The final API monetary contract must be finalized before financial endpoints are implemented.

---

## 4. Authentication Transport

### Proposed Strategy

Production authentication should use server-managed sessions with secure HttpOnly cookies.

Security measures include:

- HTTPS in production.
- Secure cookie attributes.
- CSRF protection for cookie-authenticated mutations.
- Restrictive CORS configuration.
- Login rate limiting.
- Session expiration and revocation.
- Account-status validation.
- Permission refresh after role changes.

Do not expose production passwords or session secrets to browser storage.

### Frontend Request Credentials

HTTP adapters should use the approved browser credential transport rather than inventing bearer tokens.

### Important

Frontend mock credentials are not production authentication.

The final transport design must be approved under `SECURITY.md`.

---

## 5. Standard Successful Response

**Status: PROPOSED**

### Single Resource

```json
{
  "data": {
    "id": "resource-id"
  }
}
```

### Collection

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

### Mutation

```json
{
  "data": {
    "id": "resource-id",
    "status": "saved"
  }
}
```

### Rules

- Use one consistent envelope across backend modules.
- Do not expose Mongoose internal properties unintentionally.
- Preserve stable identifiers and frontend-required fields.
- Include only authorized information.
- Do not return a successful mutation response before required database operations commit.

The project also contains an earlier proposed `{ "success": true, "data": ... }` format. The final choice must be reconciled before implementation.

---

## 6. Standard Error Response

**Status: PROPOSED**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fieldErrors": {
      "fullName": "This field is required."
    },
    "requestId": "req-example"
  }
}
```

### HTTP Statuses

| Status | Usage |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful no-content operation |
| 400 | Malformed request |
| 401 | Missing, expired or invalid authentication |
| 403 | Permission denied |
| 404 | Missing or inaccessible resource |
| 409 | Duplicate, stale update or business-state conflict |
| 422 | Field or business validation failure |
| 429 | Rate limit reached |
| 500 | Unexpected server failure |

### Proposed Error Codes

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `PERMISSION_DENIED`
- `BRANCH_ACCESS_DENIED`
- `RECORD_ACCESS_DENIED`
- `NOT_FOUND`
- `CONFLICT`
- `DUPLICATE_RECORD`
- `STALE_VERSION`
- `OVERPAYMENT_NOT_ALLOWED`
- `INVALID_STATUS_TRANSITION`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

Error codes are candidates and must be reconciled with the existing frontend's error translation conventions.

Do not expose password hashes, confidential record details, database stack traces or secrets.

---

## 7. Shared Query Parameters

### Proposed Pagination

| Parameter | Type | Purpose |
|---|---|---|
| `page` | Positive integer | Requested page |
| `pageSize` | Positive integer | Page size |
| `search` | String | Approved searchable fields |
| `sortBy` | String | Allowlisted sorting field |
| `sortDirection` | `asc` / `desc` | Sort direction |

Example:

`GET /api/v1/branches/:branchId/students?page=1&pageSize=20`

### Rules

- Pagination limits must be server enforced.
- Search and sorting fields must be explicitly allowlisted.
- The backend must apply trusted branch restrictions.
- Stable ordering must be used.
- Filtering must not permit arbitrary MongoDB query operators.
- Role-specific data scopes apply before results are returned.

Final limits and sorting conventions remain proposed.

---

## 8. Authentication Contracts

### 8.1 Login

**POST** `/auth/login`

**Permission:** Public login entry, subject to rate limiting.

Illustrative request:

```json
{
  "email": "staff@example.test",
  "password": "submitted-password"
}
```

Illustrative response:

```json
{
  "data": {
    "user": {
      "id": "user-1",
      "name": "Staff Member",
      "status": "active"
    },
    "branches": [
      {
        "id": "branch-1",
        "name": "Main Branch",
        "role": "teacher"
      }
    ]
  }
}
```

A successful login must establish the approved secure session.

Never include passwords, hashes or secret session tokens in the JSON response.

The existing frontend's exact credential fields and account bootstrap contract must be verified.

### 8.2 Current Session

**GET** `/auth/session`

**Permission:** Authenticated user.

Response should include only the permitted current user, active branch and safe role/permission context required by the frontend.

The authenticated session is the trusted source of identity.

### 8.3 Logout

**DELETE** `/auth/session`

**Permission:** Authenticated user.

Invalidate the current session.

The frontend must clear associated protected state.

### 8.4 Active Branch

**PATCH** `/auth/active-branch`

Illustrative request:

```json
{
  "branchId": "branch-2"
}
```

The backend must reject unauthorized branch selection.

Changing branches must recalculate permissions and invalidate stale branch-specific frontend data.

### 8.5 Password Change

**PATCH** `/auth/password`

A password change requires the approved current-password/session verification and credential security policy.

Password recovery is not automatically authorized.

---

## 9. Authorization Contract

Every protected endpoint must validate:

1. Authenticated user.
2. Active account.
3. Trusted organization.
4. Requested branch where applicable.
5. Effective branch role.
6. Required action permission.
7. Actual target-record ownership.
8. Business state and references.

### Five Current Roles

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher.

### Receptionist

**CONFIRMED:** Full approved Admissions and Fees workflows.

Denied independent Finance, Expenses, Teacher Payroll, Audit Log, Branches, Users and Settings.

### Teacher

Can access own My Profile, teaching assignments, timetable, salary agreement, salary payment history and payslips through self-scoped endpoints.

Cannot access another Teacher's compensation.

### Admin

Must respect the existing privilege ceiling, including restrictions on modifying privileged users or granting Admin/Super Admin roles.

### Multiple Roles

Different roles across separate branches are supported.

Unsupported multiple-role combinations within one branch must fail closed until explicitly resolved.

---

# 10. Module Contract Inventory

All routes in Sections 10–26 are proposed and use the `/api/v1` prefix.

Exact service method mappings must be checked against the actual frontend source before code implementation.

## 10.1 Dashboard

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| GET | `/branches/:branchId/dashboard` | Role-aware dashboard projection | Authenticated + permitted dashboard + branch scope |

### Proposed Response

```json
{
  "data": {
    "scope": {
      "branchId": "branch-1"
    },
    "metrics": {},
    "recentActivity": []
  }
}
```

Metrics must be derived from authoritative, authorized data.

Do not expose unrelated payroll/finance records in Receptionist or Teacher dashboards.

---

## 11. Admissions Contracts

### Proposed Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/admissions` | List admissions |
| GET | `/branches/:branchId/admissions/:id` | View an admission |
| POST | `/branches/:branchId/admissions` | Create admission |
| PATCH | `/branches/:branchId/admissions/:id` | Edit permitted fields |
| PATCH | `/branches/:branchId/admissions/:id/status` | Approved status transition |
| POST | `/branches/:branchId/admissions/:id/enroll` | Enroll eligible admission |
| POST | `/branches/:branchId/admissions/complete` | Instant admission completion |
| DELETE | `/branches/:branchId/admissions/:id` | Guarded deletion |

### Permissions

Super Admin, Admin and Receptionist may perform their currently approved Admissions operations.

Owner has permitted read-only access.

Teacher has no general Admissions module access.

### Admission Creation

Illustrative request:

```json
{
  "student": {
    "fullName": "Example Student"
  },
  "courseId": "course-1",
  "preferredBatchId": "batch-1"
}
```

The actual frontend admission form contains more fields. Required/optional fields must be derived from current source before final implementation.

### Status Transition

Illustrative request:

```json
{
  "status": "approved",
  "expectedVersion": 3
}
```

Current workflow supports approved Pending/Approved transitions.

Do not reintroduce deprecated Reject actions.

### Enrollment

Illustrative request:

```json
{
  "batchId": "batch-1"
}
```

The backend must validate:

- Admission eligibility.
- Student relationship.
- Course/Batch compatibility.
- Authorized branch.
- Capacity.
- Duplicate enrollment.
- Current record version/state.

### Instant Admission

One approved transaction coordinates the required:

- Student.
- Admission.
- Enrollment.
- Challan.
- Optional Verified Payment.

Do not report success for a partially committed operation.

---

## 12. Students Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/students` | Student directory |
| GET | `/branches/:branchId/students/:id` | Student profile |
| POST | `/branches/:branchId/students` | Authorized student creation |
| PATCH | `/branches/:branchId/students/:id` | Approved student edit |
| DELETE | `/branches/:branchId/students/:id` | Guarded deletion where supported |

### Response Requirements

Student response fields should include approved identity, status and academic linkage information.

Avoid exposing confidential fields not required by the current view.

### Important

Stable record IDs remain authoritative.

Branch-scoped gapless display serials are response/display projections, not permanent database primary keys.

Teacher student access, where approved, must be assignment-scoped.

---

## 13. Courses & Batches Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/branches/:branchId/courses` | List/create courses |
| GET/PATCH | `/branches/:branchId/courses/:id` | View/update course |
| GET/POST | `/branches/:branchId/batches` | List/create batches |
| GET/PATCH | `/branches/:branchId/batches/:id` | View/update batch |
| GET/POST | `/branches/:branchId/subjects` | List/create subjects |
| GET/PATCH | `/branches/:branchId/subjects/:id` | View/update subject |
| GET/POST | `/branches/:branchId/streams` | List/create streams |
| GET/PATCH | `/branches/:branchId/streams/:id` | View/update stream |

### Illustrative Batch Creation

```json
{
  "courseId": "course-1",
  "name": "Batch A",
  "capacity": 30
}
```

The final schema must reflect actual frontend fields and validation rules.

### Invariants

- Valid course, subject and stream references.
- Authorized branch scope.
- Configured capacity handling.
- Protected historical references.
- Compatible course/subject fee calculations.

Do not invent arbitrary academic program structures.

---

## 14. Faculty & Classes Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/faculty-assignments` | List authorized assignments |
| POST | `/branches/:branchId/faculty-assignments` | Create approved assignment |
| PATCH | `/branches/:branchId/faculty-assignments/:id` | Update assignment |
| GET | `/branches/:branchId/classes` | List classes |
| GET | `/branches/:branchId/classes/:id` | View class details |

### Illustrative Assignment

```json
{
  "teacherUserId": "user-teacher-1",
  "courseId": "course-1",
  "batchId": "batch-1",
  "subjectId": "subject-1"
}
```

Actual assignment fields and timetable behavior must match the frontend.

### Requirements

- Validate Teacher and branch assignment.
- Validate Course/Batch/Subject relationships.
- Apply approved schedule restrictions.
- Preserve historical assignments used by Payroll.
- Restrict Teacher reads to own authorized assignments.

---

## 15. Fees & Challans Contracts

**CONFIRMED:** Receptionist has Full Access to approved Fees workflows.

### Proposed Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/challans` | List challans |
| GET | `/branches/:branchId/challans/:id` | View challan |
| POST | `/branches/:branchId/challans` | Issue approved challan |
| GET | `/branches/:branchId/fee-payments` | View permitted payments |
| POST | `/branches/:branchId/fee-payments` | Record fee payment |
| GET | `/branches/:branchId/fee-payments/:id` | View payment details |
| GET | `/branches/:branchId/fee-payments/:id/receipt` | Get verified receipt |

### Challan Response

Illustrative response:

```json
{
  "data": {
    "id": "challan-1",
    "studentId": "student-1",
    "enrollmentId": "enrollment-1",
    "totalPayable": 12000,
    "verifiedPaid": 5000,
    "outstanding": 7000,
    "status": "partially-paid"
  }
}
```

All money values are illustrative PKR amounts, not final storage-unit contracts.

### Fee Payment Request

Illustrative request:

```json
{
  "challanId": "challan-1",
  "amount": 3000,
  "method": "cash",
  "reference": "payment-reference"
}
```

The final verification mechanism and field requirements must match the frontend.

### Fee Payment Validation

- Authenticated authorized actor.
- Permitted branch.
- Valid Student/Enrollment/Challan relationship.
- Positive approved amount.
- Current outstanding balance.
- Duplicate-request protection.
- Correct verified status.
- Consistent Finance and Reports projections.

Refund and reversal APIs are not authorized.

---

## 16. Finance Overview Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/finance` | Financial overview |

### Proposed Response

```json
{
  "data": {
    "revenue": 0,
    "expenses": 0,
    "netPosition": 0,
    "pendingFees": 0
  }
}
```

Metrics must be derived from:

- Verified Fee Payments.
- Posted Operating Expenses.
- Posted Payroll Expenses.
- Approved outstanding fee definitions.

The final date filters and metric names must match the frontend reporting implementation.

Receptionist and Teacher have no independent Finance access.

---

## 17. Expenses Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/expenses` | Expense directory |
| GET | `/branches/:branchId/expenses/:id` | View expense |
| POST | `/branches/:branchId/expenses` | Create approved expense |

### Illustrative Request

```json
{
  "category": "Utilities",
  "amount": 2500,
  "description": "Approved operating expense"
}
```

### Requirements

- Validate financial amounts.
- Validate approved/custom categories.
- Enforce verified Owner/Admin/Super Admin permissions.
- Protect payroll-linked expenses against duplicate or unauthorized edits.
- Preserve historical expense references.
- Do not introduce unapproved expense reversals.

---

## 18. Teacher Payroll Contracts

**CONFIRMED BUSINESS MODEL: Assignment-based running salary, not automatic monthly payroll.**

### Proposed Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/payroll/agreements` | List authorized agreements |
| POST | `/branches/:branchId/payroll/agreements` | Create agreement |
| PATCH | `/branches/:branchId/payroll/agreements/:id` | Approved agreement revision |
| GET | `/branches/:branchId/payroll/obligations` | View running payable balances |
| GET | `/branches/:branchId/payroll/payments` | Payment history |
| POST | `/branches/:branchId/payroll/payments` | Record salary disbursement |
| GET | `/branches/:branchId/payroll/payments/:id/payslip` | View authorized payslip |

### Agreement Request

Illustrative:

```json
{
  "facultyAssignmentId": "assignment-1",
  "method": "fixed",
  "agreementTerms": {}
}
```

The exact Fixed/Percentage parameters must come from verified frontend logic.

### Running Obligation Response

Illustrative:

```json
{
  "data": {
    "facultyAssignmentId": "assignment-1",
    "teacherUserId": "teacher-1",
    "agreedPayable": 15000,
    "verifiedPaid": 6000,
    "outstanding": 9000,
    "status": "partially-paid"
  }
}
```

### Payment Request

Illustrative:

```json
{
  "payrollObligationId": "obligation-1",
  "amount": 3000,
  "paymentMethod": "bank-transfer",
  "reference": "salary-payment-reference"
}
```

### Mandatory Rules

1. Validate authorized Payroll permission.
2. Resolve the correct Teacher and Faculty Assignment.
3. Validate Salary Agreement and current payable.
4. Preserve the existing Fixed/Percentage calculation.
5. Do not generate salary automatically at month boundaries.
6. Permit valid partial/full payments.
7. Do not exceed outstanding remuneration.
8. Prevent duplicate payments and duplicate linked expenses.
9. Record Salary Payment and Posted Expense consistently.
10. Preserve historical agreements and payments.
11. Refresh Teacher My Profile, Payroll, Finance and Reports.
12. Notify the appropriate Teacher after successful payment according to approved notification behavior.

### Formula Verification Gate

Inspect:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`
- Existing payroll tests.

No assumed formula or rounding policy may replace verified behavior.

### Role Boundaries

- Admin/Super Admin: Approved payroll management.
- Owner: Authorized payroll read-only views.
- Receptionist: Denied.
- Teacher: Own compensation through self-service endpoints only.

---

## 19. Teacher My Profile Contracts

**CONFIRMED FRONTEND ROUTE:** `/my-profile`

### Proposed Self-Service Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/profile` | Own bio and professional details |
| GET | `/me/timetable` | Own class schedule |
| GET | `/me/teaching-assignments` | Own assignments |
| GET | `/me/compensation` | Own running salary summary |
| GET | `/me/salary-payments` | Own verified salary payments |
| GET | `/me/payslips/:paymentId` | Own payslip |
| GET | `/me/notifications` | Own notifications |

### Own Compensation Response

Illustrative:

```json
{
  "data": {
    "teacherId": "authenticated-teacher",
    "totalAgreed": 15000,
    "verifiedPaid": 6000,
    "outstanding": 9000,
    "assignments": [],
    "payments": []
  }
}
```

### Mandatory Security

The Teacher identity must come from the authenticated server session.

A client-submitted teacher ID must not grant another Teacher's data.

Every related compensation record must be checked for ownership.

Teacher may not modify salary agreements or record payroll payments.

---

## 20. Demo Classes Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/demo-inquiries` | List demo inquiries |
| POST | `/branches/:branchId/demo-inquiries` | Register inquiry |
| PATCH | `/branches/:branchId/demo-inquiries/:id` | Update approved fields |
| POST | `/branches/:branchId/demo-inquiries/:id/attendance` | Record outcome |
| POST | `/branches/:branchId/demo-inquiries/:id/cancel` | Cancel under approved rules |
| POST | `/branches/:branchId/demo-inquiries/:id/convert` | Start approved admission conversion |

### Requirements

- Validate branch, applicant and academic references.
- Preserve demo inquiry history.
- Prevent duplicate conversion.
- Follow current frontend attendance and conversion states.
- Do not equate form prefill with successful admission creation.
- Do not fabricate enrollment or payment solely from a demo inquiry.

---

## 21. Physical Assets Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/assets` | List physical inventory |
| GET | `/branches/:branchId/assets/:id` | View asset |
| POST | `/branches/:branchId/assets` | Register asset |
| PATCH | `/branches/:branchId/assets/:id` | Update asset |
| POST | `/branches/:branchId/assets/:id/assignments` | Approved staff assignment |
| POST | `/branches/:branchId/assets/:id/inspections` | Condition inspection |
| POST | `/branches/:branchId/assets/:id/maintenance` | Maintenance event |

### Requirements

- Validate branch ownership.
- Preserve unique physical asset references.
- Preserve inspection and maintenance history.
- Do not create expenses automatically from maintenance unless approved.
- Do not add unapproved asset deletion/disposal/depreciation.
- No Cloudinary or image/video upload API.

---

## 22. Reports & Ledgers Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/reports/:reportKey` | Authorized report |
| POST | `/branches/:branchId/exports` | Approved report export |

### Proposed Filters

- Date range.
- Search.
- Applicable status.
- Course/Batch.
- Permitted branch.
- Approved report-specific fields.

### Requirements

- Apply authorization before querying protected data.
- Verify cross-branch reporting privileges independently.
- Use authoritative records.
- Exclude unrelated salary/financial data.
- Apply the same restrictions to PDF, CSV, Word and print exports.
- Preserve actual current frontend report definitions.

---

## 23. Audit Log Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/audit-events` | Read permitted audit history |

### Requirements

- Audit events are server-controlled.
- Restrict visibility to the effective approved administrative access policy.
- Do not expose unnecessary confidential values.
- Do not implement ordinary edit/delete audit endpoints.
- Preserve required financial and administrative history.

---

## 24. Branch Management Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches` | Authorized branch list |
| GET | `/branches/:branchId` | Branch details |
| PATCH | `/branches/:branchId` | Permitted edit |
| PATCH | `/branches/:branchId/status` | Guarded status update |
| DELETE | `/branches/:branchId` | Guarded deletion |

**CONFIRMED:** New branch creation is paused for every role.

Do not enable `POST /branches` until explicitly reauthorized.

### Branch Deletion Rules

The backend must verify the existing approved blockers, including relevant active records, current branch restrictions and user assignments.

Do not cascade-delete unrelated operational or historical financial data.

---

## 25. User Management Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/users` | Authorized user directory |
| GET | `/branches/:branchId/users/:id` | Authorized user details |
| POST | `/branches/:branchId/users` | Create permitted staff user |
| PATCH | `/branches/:branchId/users/:id` | Update permitted user fields |
| PATCH | `/users/:id/assignments` | Manage approved branch-role assignments |

### Requirements

- Preserve one user identity across multiple branches.
- Support different roles in different branches.
- Reject unapproved same-branch role combinations.
- Block Admin privilege escalation.
- Protect Super Admin and other privileged accounts.
- Invalidate outdated authorization context after role changes.
- Preserve audit history.

---

## 26. Settings Contracts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/branches/:branchId/settings` | Read authorized settings |
| PATCH | `/branches/:branchId/settings` | Update approved settings |

### Requirements

- Preserve existing academy name and branding behavior.
- Validate branch-specific configuration.
- Prevent unauthorized administrative changes.
- Do not store application secrets in ordinary settings.
- No new Cloudinary/media workflow.

---

## 27. Notifications Contracts

### Proposed Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/notifications` | Read own notifications |
| PATCH | `/me/notifications/:id/read` | Mark own notification as read where supported |

### Requirements

- User identity derived from session.
- Only recipient may read or update their notification.
- Salary notification references a successful payment.
- Notification failures must not duplicate salary disbursements.
- No unapproved SMS, WhatsApp or email integrations.

---

## 28. Idempotency Contract

Sensitive business writes should support duplicate-request protection.

### Proposed Header

`Idempotency-Key: unique-request-reference`

### Candidate Operations

- Instant admission.
- Enrollment.
- Challan issuance.
- Fee collection.
- Payroll disbursement.
- Demo conversion.

### Rules

1. Scope key to the authenticated actor and relevant operation/organization/branch.
2. Store a canonical request fingerprint.
3. Reject conflicting reuse with a different payload.
4. Prevent simultaneous duplicate processing.
5. Return the previous successful result when repeating an equivalent request.
6. Define safe recovery for uncertain commits.
7. Preserve exactly one intended financial effect.

The exact key retention and response-replay behavior remain proposed.

---

## 29. Cross-Module Transaction Contracts

| Workflow | Required outcome |
|---|---|
| Instant Admission | Linked Student/Admission/Enrollment/Challan/optional Payment remain consistent |
| Enrollment | Valid links, capacity and no duplicate enrollment |
| Fee Payment | Valid verified collection and outstanding balance |
| Salary Payment | Payroll payment, linked Expense and required Audit remain consistent |
| Demo Conversion | No duplicate conversion; correct inquiry/admission linkage |
| User Permission Change | Authorized assignment update and effective access refresh |
| Branch Deletion | No blocked records or unsafe cascade |

### Rules

- Commit all required durable changes before responding with success.
- Use transactions where coordinated MongoDB writes are required.
- Use unique constraints and conditional updates for concurrency protection.
- Do not blindly retry non-idempotent writes.
- Treat secondary notifications separately from committed financial authority.

---

## 30. API Response Compatibility

The future HTTP adapter must preserve the behavior expected by the existing frontend services.

### Requirements

- Stable string IDs.
- Consistent normalized errors.
- Existing branch filtering.
- Existing admission status semantics.
- Approved fee and payroll calculations.
- Relevant loading/empty/error UI behavior.
- Correct connected module refresh.
- No visible behavioral regression merely because persistence changed.

### Important

Do not directly rewrite frontend pages to consume raw Mongoose documents.

Map backend payloads through the existing domain service/adapter boundary.

---

## 31. Contract Testing Requirements

Before an endpoint is accepted for integration, test:

### Authentication

- Valid login.
- Invalid login.
- Session restoration.
- Logout.
- Expired session.
- Disabled account.

### Authorization

- Five-role matrix.
- Receptionist full Admissions/Fees.
- Receptionist denied Finance/Payroll.
- Owner approved financial access.
- Admin privilege-ceiling restrictions.
- Teacher self-only compensation.
- Cross-branch/record denial.

### Academic Operations

- Admission creation.
- Approval and return to Pending.
- Enrollment.
- Duplicate prevention.
- Batch capacity.
- Student and course reference validation.

### Financial Operations

- Challan generation.
- Verified fee collection.
- Partial payments.
- Duplicate-payment prevention.
- No overpayment.
- Correct Finance/Reports projections.

### Payroll

- Fixed/Percentage agreement compatibility.
- Independent assignment obligations.
- No monthly auto-generation.
- Partial/full salary payments.
- Outstanding balance consistency.
- Salary-expense atomicity.
- Teacher personal payslips.

### General API Behavior

- Response schema validation.
- Error-code normalization.
- Pagination.
- Sorting and search.
- Date and monetary serialization.
- Idempotency.
- Stale update conflicts.
- Safe export and authorization.

Tests must verify persisted database state, not only HTTP response status.

No test should be reported PASS unless actually executed.

---

## 32. Implementation Sequence

Suggested future development order:

1. Authentication, sessions and trusted branch context.
2. Five-role authorization middleware.
3. Shared validation, errors and API response conventions.
4. Academic reference data.
5. Admissions, Students and Enrollment.
6. Challans, Fees and Verified Payments.
7. Faculty, Classes and Teacher My Profile.
8. Assignment-based Teacher Payroll, Expenses and Finance.
9. Demo Classes and Physical Assets.
10. Reports, Audit, Notifications and Settings.
11. Frontend HTTP adapter integration.
12. End-to-end, concurrency, security and regression testing.

This is a planning sequence, not authorization to implement all endpoints simultaneously.

---

## 33. Open Contract Decisions

The following remain unresolved:

- Final request/response envelope.
- Exact current frontend service method-to-endpoint mappings.
- Final DTO field definitions.
- Monetary units and rounding behavior.
- Salary percentage calculation details.
- Production session transport and expiration.
- Same-branch multi-role combination.
- Pagination defaults and limits.
- Date/time serialization.
- Payment verification and reversal governance.
- Export streaming and file lifecycle.
- Contract versioning policy.
- Historical mock-data migration.

Do not silently turn TBD items into confirmed requirements.

---

## 34. Related Documentation

This document must remain aligned with:

- `API.md` — API architecture and endpoint inventory.
- `FRONTEND_INTEGRATION.md` — Frontend domain services.
- `FRONTEND_BACKEND_HANDOFF.md` — Integration handoff.
- `FRONTEND_AUDIT.md` — Actual frontend implementation evidence.
- `MODULE_WORKFLOW_MAP.md` — Cross-module behavior.
- `ROLE_BRANCH_DATA_MATRIX.md` — Effective role/branch data access.
- `SECURITY.md` — Authentication and security.
- `RBAC_PERMISSIONS.md` — Effective permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization/branch ownership.
- `BUSINESS_RULES.md` — Business invariants.
- `DATA_FLOW.md` — Cross-module data movement.
- `TRANSACTIONS_AND_INTEGRITY.md` — Atomicity and concurrency.
- `DATABASE.md` — Proposed persistence design.
- `ERD.md` — Entity relationships.
- `ARCHITECTURE.md` — Technical structure.
- `PRD.md` — Product scope.
- `SYSTEM_DESIGN.md` — Workflows.
- `MEMORY.md` — Approved decisions.
- `RULES.md` — Engineering rules.
- `AGENTS.md` — Coding-agent instructions.
- `PROGRESS.md` — Verified implementation evidence.

Use actual repository paths when adding relative Markdown links.

---

## 35. Final Implementation Boundary

### Confirmed Business Requirements

- Five current frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and salary access.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Authorized multiple branches.
- Current branch creation pause.
- Connected academic, fee and financial workflows.
- Physical Assets without Cloudinary/media uploads.

### Proposed Technical Contracts

- Endpoint paths and HTTP methods.
- Request and response DTOs.
- Error-envelope conventions.
- Pagination contracts.
- Idempotency headers and replay behavior.
- Session transport.
- API-to-frontend adapter mapping.

### Deferred

- Platform Admin/multi-client SaaS.
- Unapproved refunds and financial reversals.
- Unapproved media uploads.
- Unnecessary realtime or distributed infrastructure.

### Not Implemented

- Production REST API contracts in application code.
- HTTP-to-MongoDB integrations.
- Real session/RBAC middleware.
- Production financial transaction APIs.
- Contract tests against a running backend.

**Governing Principle:** Every future API must map to an approved frontend workflow, enforce server-side authorization and branch isolation, preserve academic and financial integrity, and expose stable, validated contracts without inventing unsupported business behavior.

**Document Status:** DRAFT — Ready for API contract review and source-level field reconciliation before backend implementation.
