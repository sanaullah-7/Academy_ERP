# Frontend to Backend Handoff

Everything in this document is **PROPOSED**. No API described here exists yet. Contracts must preserve current frontend service method shapes or be introduced behind adapters.

## 1. Common contract

- Base `/api/v1`; JSON; authenticated secure HttpOnly session cookie (or approved equivalent); CSRF protection for cookie mutations.
- Server derives organization/user; request supplies active branch through a validated header or path. Responses use `{ data, meta? }`; errors use `{ error: { code, message, fieldErrors?, requestId } }`.
- Mutations accept `Idempotency-Key`; records expose `id`, `version`, timestamps and branch ownership. Monetary values use integer minor units or Mongo Decimal128 and serialize as decimal strings.
- List endpoints use cursor pagination, bounded limit, normalized search/filter/sort. Exports repeat authorization and may return an asynchronous job.

## 2. Endpoint map

| Existing service operation | PROPOSED endpoint | Core checks/transaction |
|---|---|---|
| auth login/logout/session/selectBranch/changePassword | `POST /auth/login`, `DELETE /auth/session`, `GET /auth/session`, `PUT /auth/active-branch`, `PUT /auth/password` | rate limit, secure hash, session rotation/revocation, assigned active branch |
| dashboard overview | `GET /branches/:branchId/dashboard` | role-shaped server projection; ETag/cache private by user+scope |
| admission list/get/create/update/status/delete | `/branches/:branchId/admissions[/:id]` | admission grants, version check, branch references, lifecycle |
| admission enroll/complete | `POST .../:id/enrollment`, `POST .../complete` | transaction across counters/student/admission/enrollment/challan/payment |
| students CRUD/profile | `/branches/:branchId/students[/:id]` | record scope, linked-record delete rule |
| academic overview/CRUD | `/branches/:branchId/{courses|batches|subjects|streams}` | normalized uniqueness and dependency protection |
| faculty assignments/classes | `/branches/:branchId/faculty-assignments`, `/classes` | enabled teacher, related IDs, unique assignment and schedule conflict transaction |
| fees overview/challan/payment/receipt | `/branches/:branchId/fees`, `/challans`, `/payments`, `/receipts/:id` | fee snapshot, unique challan, payment idempotency, no overpay |
| finance/expense | `/branches/:branchId/finance`, `/expenses` | verified/posted ledger, finance grants |
| payroll agreement/running/payment/payslip | `/branches/:branchId/payroll/{agreements,running,payments,payslips}` | Admin mutation; owner/teacher scoped reads; payment+expense transaction |
| demo CRUD/attendance/cancel/convert | `/branches/:branchId/demo-inquiries` and action subresources | lifecycle, duplicate prevention, conversion transaction |
| assets operations | `/branches/:branchId/assets` plus `/assignments`, `/inspections`, `/maintenance` | asset status/version and branch staff references |
| reports | `/branches/:branchId/reports/:reportKey`; `POST /exports` | report permission, authorized branch set, snapshot timestamp |
| audit | `/branches/:branchId/audit-events` | Admin/Super Admin only, immutable server events |
| branches | `/branches` | assigned management scope, deactivate/delete invariants |
| users/assignments | `/branches/:branchId/users`, `/users/:id/assignments` | privilege ceiling, unique login, last-admin rule |
| settings/theme/profile | `/branches/:branchId/settings`, `/me/profile` | settings grant or self-only; image object storage |

## 3. Model boundaries

PROPOSED collections: organizations, branches, users, branchRoleAssignments, sessions, students, guardians (or embedded approved snapshot), admissions, enrollments, courses, batches, subjects, facultyAssignments, classes, challans, payments, expenses, salaryAgreements, payrollObligations, payrollPayments, demoInquiries, assets, assetEvents, notifications and auditEvents.

Required unique/index candidates:

- user normalized email; branch code within organization; one role-assignment document per user+branch.
- display counter tuple organization+branch+entity+sequence.
- course normalized name per branch; batch normalized name per branch+course; subject normalized name per course.
- active enrollment uniqueness per admission and appropriate student/course policy.
- challan enrollment ID; payment idempotency/reference; payroll payment reference per branch.
- faculty assignment branch+batch+subject active uniqueness; query indexes on teacher/days/time.
- every operational collection starts with organizationId+branchId in common query indexes.

Final schema cardinality, retention and delete behavior remain subject to backend tickets and approved ERD reconciliation.

## 4. Transactions and concurrency

Mongo transactions are required for instant admission completion, demo conversion, payroll payment+expense, destructive branch checks/removal, and any counter allocation. Use `version`/If-Match or equivalent optimistic concurrency for edits. Idempotency records must bind actor, scope, endpoint and request hash and return the original result on safe retry.

## 5. Cache and events

Redis is suitable for short-lived permission/branch settings and expensive read aggregates only after correctness is established. Cache keys must include organization, branch set, user/effective permissions, query and data version. Mutations publish invalidation events by affected aggregate. Sensitive responses remain private and bounded. Cross-device freshness requires backend version/event delivery (SSE/WebSocket optional); localStorage events are not a solution.

## 6. Frontend adapter behavior

Keep `Page -> service -> adapter`; replace `mockApi` with an HTTP adapter. Map non-2xx error codes to current field/banner states. Abort stale requests on branch changes, discard responses whose scope no longer matches, preserve loading/empty/error states, and invalidate React/page caches from mutation responses. Do not expose unauthorized rows for client filtering.

## 7. Suggested implementation order

1. Organization/branch/user/auth/session/RBAC foundation.
2. Academic reference data, students and admissions transaction.
3. Fees/payments/finance ledger.
4. Faculty/classes and teacher-owned queries.
5. Payroll running balance and expenses.
6. Demo, assets, reports/exports, notifications and audit.
7. Mock-vs-API contract tests, migration/import plan and five-role browser integration.
