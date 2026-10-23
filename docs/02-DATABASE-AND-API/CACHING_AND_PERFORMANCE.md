# CACHING_AND_PERFORMANCE

<!-- > Purpose: Documents browser/server caching, cache invalidation, indexing and performance targets. -->

# TSA Academy ERP — Caching & Performance Specification

**Document:** CACHING_AND_PERFORMANCE.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Proposed Backend Performance Design
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization, Multiple Branches

---

## 1. Purpose

This document defines the caching, performance optimization, data refresh and resource-efficiency requirements for TSA Academy ERP.

The primary objective is to deliver responsive frontend and backend operations without compromising:

- Authentication and authorization.
- Organization and branch isolation.
- Student and academic data integrity.
- Fee collection accuracy.
- Assignment-based Teacher Payroll.
- Financial reporting consistency.
- Historical record preservation.

Performance improvements must never create unauthorized data exposure, duplicate transactions or inaccurate balances.

This document describes the future backend design. It does not authorize installing caching packages, deploying Redis or changing application source code.

---

## 2. Performance Principles

**PERF-001 — Correctness First**

Business correctness and security take priority over faster responses.

**PERF-002 — Measure Before Optimizing**

Use actual query measurements and profiling to identify performance problems.

**PERF-003 — Minimal Infrastructure**

Begin with efficient MongoDB queries, bounded pagination and appropriate frontend state management.

**PERF-004 — Scoped Caching**

Cached protected data must remain isolated by user, organization, branch and applicable permissions.

**PERF-005 — Authoritative Financial Data**

Caches must not become independently editable sources of fee, expense or salary balances.

**PERF-006 — Targeted Invalidation**

Mutations must refresh or invalidate relevant derived data.

**PERF-007 — Incremental Optimization**

Introduce optimizations only when supported by demonstrated requirements.

**PERF-008 — Frontend Compatibility**

Performance changes must preserve the completed frontend's approved workflows.

---

## 3. Current and Future Architecture

### Current Frontend

```text
React Page
    |
    v
Frontend Domain Service
    |
    v
Mock Adapter
    |
    v
Browser localStorage
```

### Proposed Backend Integration

```text
React Page
    |
    v
Frontend Domain Service
    |
    v
HTTP API Adapter
    |
    v
Express API
    |
    v
Domain Service
    |
    v
Scoped Repository
    |
    v
MongoDB
```

An optional cache layer may be introduced later only when measurements demonstrate a need.

The initial backend must not depend on Redis or a distributed caching service.

---

## 4. Caching Layers

| Layer | Recommended purpose | Current decision |
|---|---|---|
| React component state | Temporary UI interaction state | Existing frontend pattern |
| Frontend server-state cache | Avoid repeated safe API reads | Optional, verify current architecture |
| Browser HTTP cache | Public static assets | Appropriate with correct headers |
| Backend in-process cache | Limited safe reference data | Optional, not required initially |
| MongoDB query optimization | Efficient persistent data reads | Required |
| Redis/distributed cache | Shared high-volume caching | Deferred |
| CDN | Frontend JS/CSS/static assets | Appropriate for hosting |
| Financial balance cache | Performance optimization only | Must preserve authoritative consistency |

### Important

Do not introduce multiple competing caching layers without a documented ownership and invalidation strategy.

---

## 5. Authentication and Permission-Aware Caching

Protected responses must be scoped to current authorization.

A cache entry may depend on:

- Authenticated user.
- Academy organization.
- Selected authorized branch.
- Effective role and permission version.
- Resource type.
- Applied filters.
- Pagination and sorting.

### Security Rules

1. Never share one user's confidential cached response with another user.
2. Never reuse Branch 1 data as Branch 2 data.
3. Invalidate protected caches after logout.
4. Refresh authorization-sensitive data after role changes.
5. Prevent stale privileged results after branch membership revocation.
6. Do not publicly cache authentication or salary responses.
7. Never use client-provided role information as trusted authorization evidence.

Backend authorization must be checked independently of cache hits.

---

## 6. Branch Switching and Cache Isolation

A user may have different roles in different branches.

### Required Flow

```text
User Selects Branch
        |
        v
Server Validates Branch Membership
        |
        v
Resolve Effective Permissions
        |
        v
Update Active Branch Context
        |
        v
Invalidate Previous Branch Queries
        |
        v
Load Authorized New Branch Data
```

### Rules

- Include branch context in relevant frontend query/cache keys.
- Invalidate or isolate previous-branch state.
- Prevent late responses from updating the newly selected branch.
- Recheck sensitive permissions after switching.
- Clear confidential temporary state when the authorized identity changes.
- Handle removed or inactive branches safely.

An All-Branches reporting view must use its own explicit authorization and query scope.

It must not reuse an unrestricted operational-data cache.

---

## 7. Module-Based Cache Strategy

| Module | Candidate cached data | Required invalidation |
|---|---|---|
| Dashboard | Authorized summary projections | Admissions, enrollment, payments, expenses and payroll changes |
| Admissions | Paginated admission lists | Admission create/edit/status/enrollment/delete |
| Students | Paginated student lists | Student and enrollment changes |
| Courses & Batches | Academic reference data | Course, batch, subject and stream mutations |
| Faculty & Classes | Assignments and schedules | Faculty assignment/timetable changes |
| Fees | Challans and ledger projections | Challan and verified payment changes |
| Finance | Authorized financial summaries | Verified collections and posted expenses |
| Expenses | Expense lists | Authorized expense changes and payroll posting |
| Teacher Payroll | Authorized running summaries | Agreement and payment changes |
| Demo Classes | Inquiry lists | Inquiry, attendance and conversion changes |
| Assets | Physical inventory lists | Asset and asset-event changes |
| Reports & Ledgers | Authorized calculated reports | Changes to relevant source records |
| Audit Log | Paginated history reads | New relevant audit events |
| Branches | Authorized branch lists | Branch state and assignment changes |
| Users | Authorized user lists | User, role and branch assignment changes |
| Settings | Permitted configuration | Approved settings updates |
| Teacher My Profile | Own profile, timetable and salary | Profile, assignment, payment and notification changes |

Caching is optional per module. Correct invalidation is mandatory whenever caching is used.

---

## 8. Financial Caching Restrictions

Financial records are high-integrity data.

### 8.1 Fees

The authoritative sources are:

- Challans.
- Valid verified fee payments.
- Approved fee calculation records.

Outstanding balances must use the approved source calculation.

A cached fee balance must not be trusted as the basis for accepting another payment.

The backend must revalidate the balance against authoritative state during the transaction.

### 8.2 Teacher Payroll

**CONFIRMED:** Teacher Payroll uses independent assignment-based running balances.

Authoritative records include:

- Faculty assignments.
- Salary agreements.
- Payable obligations or approved derived payable records.
- Valid salary payments.
- Matching posted expenses.

Do not create salary automatically because a new month begins.

Cached remuneration must not replace transaction-safe outstanding-balance checks.

### 8.3 Finance

Finance summaries derive from verified revenue and posted expenses.

A cached summary must be invalidated after relevant committed transactions.

### 8.4 Required Principle

**A cache may accelerate financial reads, but it must never independently authorize financial writes.**

---

## 9. Payroll Cache Invalidation

A successful salary payment affects multiple views.

```text
Committed Payroll Payment
          |
          v
Running Salary Balance
          |
          +--> Administrative Payroll
          +--> Teacher My Profile
          +--> Expenses
          +--> Finance Overview
          +--> Dashboard
          +--> Reports & Ledgers
          +--> Personal Notifications
```

### Mandatory Rules

- Refresh or invalidate the relevant Teacher's compensation.
- Refresh associated administrative payroll records.
- Refresh linked expense summaries.
- Refresh financial projections.
- Refresh authorized reports.
- Do not expose another Teacher's compensation through shared caches.
- Do not invalidate records by fabricating a new monthly salary period.

Notification data may refresh independently, but financial source records remain authoritative.

---

## 10. Admission and Enrollment Cache Invalidation

### Admission Created

Refresh relevant:

- Admission lists.
- Student lists when a linked student record is created.
- Dashboard admission counts.
- Applicable reports.

### Admission Approved or Returned to Pending

Refresh:

- Admission status.
- Dependent eligibility indicators.
- Authorized summary views.

### Enrollment Completed

Refresh:

- Student enrollment profile.
- Admission status.
- Batch occupancy.
- Challan/Fees information where generated.
- Dashboard and reports.

### Important

An invalid or rolled-back operation must not be displayed as successfully committed.

---

## 11. MongoDB Query Performance

Backend repositories must be designed around real application access patterns.

### Requirements

- Filter by trusted organization and relevant branch.
- Use suitable indexes.
- Apply bounded pagination.
- Retrieve only needed fields.
- Avoid unnecessary repeated lookups.
- Avoid unbounded nested populates.
- Inspect query execution plans for slow paths.
- Maintain correct authorization within aggregations.

### Mongoose Guidance

Prefer:

- Appropriate projections.
- `lean()` for suitable read-only queries.
- Explicit selection of required fields.
- Controlled population of related documents.
- Transaction-aware operations for related writes.

Do not use `lean()` for operations that rely on Mongoose document methods or middleware behavior.

### Performance Verification

Use realistic data distributions and explain-query evidence before changing database indexes or query strategy.

---

## 12. Indexing Strategy

Candidate index patterns include:

| Domain | Candidate query/index fields |
|---|---|
| Users | Organization, normalized email |
| Branch assignments | User, organization, branch |
| Admissions | Organization, branch, status, createdAt |
| Students | Organization, branch and searchable identifiers |
| Enrollments | Branch, student, course, batch |
| Batches | Branch, course, status |
| Faculty assignments | Branch, teacher, course, batch, subject |
| Challans | Branch, enrollment |
| Fee payments | Branch, challan, verification status, date |
| Salary agreements | Faculty assignment |
| Payroll payments | Assignment obligation, teacher, payment date |
| Expenses | Branch, category, posting date |
| Assets | Branch, asset identifier |
| Audit events | Organization, branch, timestamp |

These indexes are proposed candidates.

Final indexes belong to the approved database schema and must follow actual queries.

Excessive indexes can slow writes and consume storage.

---

## 13. Pagination and Search

Large collections must use bounded queries.

### Proposed Query Parameters

- `page`
- `pageSize`
- `search`
- `sortBy`
- `sortDirection`
- Approved module-specific filters.

### Rules

1. Enforce a server-side page-size limit.
2. Use stable sorting.
3. Validate filters and sort keys.
4. Apply authorization and ownership restrictions.
5. Avoid retrieving entire collections for one visible page.
6. Return pagination metadata where required.
7. Preserve existing frontend search behavior where feasible.

The final limit and pagination format must match the accepted API contract.

### Cursor Pagination

Cursor pagination may be considered for large or frequently changing datasets if offset pagination becomes inefficient.

Do not introduce it universally without a demonstrated need.

---

## 14. Database Aggregation Performance

Dashboard, Finance and Reports may require MongoDB aggregation pipelines.

### Requirements

- Apply organization/branch filtering early.
- Validate all report filters.
- Avoid unauthorized cross-branch lookups.
- Use supported indexes.
- Prevent duplicate counting after joins.
- Keep monetary calculations exact.
- Limit expensive unbounded date ranges where appropriate.
- Benchmark important reporting queries.

### Financial Accuracy

If a fee payment joins multiple related documents, the aggregation must not count the same payment more than once.

The same applies to salary payments and linked expenses.

---

## 15. Avoiding N+1 Queries

N+1 problems occur when the backend executes repeated queries for related entities.

Potential areas:

- Student lists with Course/Batch names.
- Admissions with student profiles.
- Faculty assignments with Subject/Batch information.
- Challans with payment summaries.
- Payroll obligations with salary payments.
- Asset lists with assigned staff information.

### Recommended Approach

- Identify required related data.
- Use bounded population or aggregation appropriately.
- Use batch lookups where beneficial.
- Avoid fetching unrelated confidential fields.
- Confirm query performance using actual measurements.

Do not introduce broad database joins that violate branch or record authorization.

---

## 16. HTTP Caching

HTTP caching may improve performance for safe responses.

### Static Assets

Built frontend assets may use long-lived caching when filenames are content-hashed.

### Private API Responses

Use appropriate private or no-store policies based on sensitivity.

Highly sensitive responses include:

- Sessions.
- User permissions.
- Student personal details.
- Fee payment records.
- Finance information.
- Teacher compensation.
- Payslips.
- Protected reports.

### Rules

- Do not publicly cache protected API responses.
- Do not use browser cache as proof of current authorization.
- Use appropriate conditional requests only where they preserve security and correctness.
- Avoid caching mutable payment balances across financial writes without safe invalidation.

---

## 17. API Response Efficiency

Responses should contain enough data for the requested frontend workflow without unnecessary fields.

### Requirements

- Use DTOs rather than exposing raw Mongoose documents.
- Exclude password hashes and internal secrets.
- Avoid unnecessary deeply nested records.
- Support pagination.
- Preserve stable IDs.
- Use consistent response envelopes.
- Avoid duplicated payload fields without a business need.
- Return only permitted information.

Large exports should use an appropriate streaming or controlled generation strategy.

The exact export implementation must match the approved API contracts.

---

## 18. React Frontend Performance

Backend integration must preserve the current frontend's responsive user experience.

### Guidelines

- Keep existing domain service interfaces where practical.
- Prevent repeated identical API calls.
- Handle loading and empty states.
- Cancel or ignore obsolete requests.
- Avoid unnecessary global refreshes.
- Keep branch-sensitive data isolated.
- Preserve approved optimistic UI behavior only where failure recovery is safe.

### Financial Mutations

Fee and payroll payment UIs must not optimistically report success before authoritative persistence succeeds.

Avoid automatic retries of non-idempotent payment operations.

---

## 19. Concurrent Users and Data Freshness

The production backend will introduce shared multi-user persistence.

Potential conflicts include:

- Simultaneous enrollment.
- Concurrent fee collection.
- Concurrent salary payments.
- Admission status changes.
- Assignment revisions.
- Role or branch membership changes.

### Requirements

- Use appropriate transaction and concurrency controls.
- Revalidate current state for sensitive mutations.
- Prevent stale financial balances from authorizing invalid payments.
- Return conflict errors for outdated writes.
- Refresh affected views after conflicts.
- Avoid hiding authorization failures behind cached data.

Caching cannot replace database transactions or optimistic concurrency.

---

## 20. Cache Invalidation Events

The following events must trigger appropriate refresh behavior.

| Event | Affected data |
|---|---|
| Login | Session, roles, authorized branches |
| Logout | All confidential user-scoped cached data |
| Branch switch | Branch-scoped operational and reporting data |
| Role change | Permissions, navigation and protected cached data |
| Admission mutation | Admissions, Students, Dashboard and related reports |
| Enrollment creation | Students, Batches, Fees and Reports |
| Challan creation | Fee ledger and related financial projections |
| Verified fee payment | Fees, Finance, Dashboard and Reports |
| Faculty assignment change | Faculty, Classes, Teacher Profile, Payroll eligibility |
| Salary agreement change | Payroll and Teacher Profile |
| Payroll disbursement | Payroll, Expenses, Finance, Teacher Profile and Reports |
| Expense mutation | Expenses, Finance and Reports |
| Demo conversion | Demo Classes and Admissions |
| Asset event | Inventory and asset reports |
| Settings mutation | Academy/Theme Context |
| Branch status change | Branch lists, sessions and permitted data |

Invalidation must occur after the authoritative write succeeds.

---

## 21. Redis and Distributed Caching

Redis is not required for the initial backend.

### Consider Redis Only When

- Multiple backend instances need a shared ephemeral cache.
- Verified query bottlenecks remain after database optimization.
- A justified session/cache requirement exists.
- Clear invalidation and authorization rules have been established.
- Infrastructure cost and complexity are approved.

### Restrictions

- Do not store financial balances in Redis as the only authoritative record.
- Do not introduce Redis queues without an approved workflow.
- Do not allow cached permissions to remain valid after revocation indefinitely.
- Do not expose confidential cache entries through shared keys.

Redis adoption requires a separate approved technical ticket.

---

## 22. Performance Monitoring

Monitor relevant operational indicators after backend implementation.

### Candidate Metrics

- HTTP request latency.
- HTTP error rate.
- Database query duration.
- MongoDB connection pool utilization.
- Slow aggregation queries.
- Pagination performance.
- Cache hit/miss rates if caching is implemented.
- Request concurrency.
- Application memory and CPU usage.
- Financial transaction conflicts.

### Important

Performance targets must be defined using actual expected client workload.

Do not invent service-level guarantees without approved requirements and measurement data.

---

## 23. Performance Testing

Future backend implementation should include targeted performance checks.

### Academic Workflows

- Large student directory.
- Admission searching.
- Batch occupancy calculations.
- Faculty timetable queries.

### Financial Workflows

- Challan listing.
- Verified payment history.
- Outstanding balances.
- Finance summaries.
- Payroll obligation summaries.
- Teacher payslip retrieval.

### Multi-Branch Workflows

- Branch selection.
- Branch-scoped records.
- Authorized cross-branch reporting.
- User with different roles across branches.

### Verification

Measure:

- Response time.
- Number of database queries.
- Query execution plan.
- Memory behavior.
- Concurrent request correctness.

Performance tests must not mutate production financial data.

---

## 24. Security Testing for Caches

Tests must verify that caching does not bypass authorization.

### Scenarios

1. User A cannot read User B's cached protected response.
2. Branch 1 data cannot appear in Branch 2's cache.
3. Role revocation invalidates protected access.
4. Teacher cannot retrieve another Teacher's cached salary.
5. Receptionist cannot retrieve cached Finance or Payroll results.
6. Logout clears confidential frontend state.
7. Direct API requests still enforce authorization.
8. Cross-branch reports include only explicitly permitted data.
9. Stale requests cannot overwrite newer branch state.

A fast response that violates access control is a failed implementation.

---

## 25. Cache Failure Handling

If an optional cache becomes unavailable:

- The application should remain correct.
- Protected authorization checks must still run.
- Authoritative MongoDB records must remain the source of truth.
- Financial writes must not depend on a cache being available.
- Errors must not expose sensitive data.
- Cache recovery must not resurrect invalidated confidential data.

Fallback behavior must be designed according to the implemented cache's responsibilities.

---

## 26. Implementation Strategy

When separately authorized, optimize in this order:

1. Verify correct functional behavior.
2. Measure actual query performance.
3. Apply proper database filters and projections.
4. Add necessary indexes.
5. Introduce bounded pagination.
6. Remove repeated unnecessary queries.
7. Optimize expensive aggregations.
8. Add safe frontend request reuse/invalidation where justified.
9. Consider narrowly scoped backend caching.
10. Consider Redis only if simpler approaches are insufficient.

### Engineering Restrictions

- Do not sacrifice authorization for performance.
- Do not duplicate business formulas in cache services.
- Do not introduce monthly salary generation.
- Do not add background financial mutation jobs without approval.
- Do not redesign the frontend unnecessarily.
- Do not introduce speculative dependencies.

---

## 27. Acceptance Criteria

Caching and performance implementation is acceptable only when:

- Backend responses remain correct.
- Role and branch isolation is preserved.
- Sensitive financial balances remain authoritative.
- Fee and payroll operations remain transaction-safe.
- Relevant collections are paginated.
- Required indexes are supported by query evidence.
- Dependent views refresh correctly.
- Branch switching does not leak stale data.
- Optional cache failure does not cause invalid business results.
- Relevant correctness, security and performance tests pass.

No performance claim is verified until measured.

---

## 28. Open Decisions

The following remain TBD:

- Expected concurrent staff count.
- Expected student and payment record volumes.
- Accepted API latency targets.
- Final pagination defaults and maximum limits.
- Cache library selection.
- Client-side request caching strategy.
- Financial read freshness requirements.
- Reporting cache lifetime.
- Redis adoption.
- Monitoring provider.
- Performance-test datasets.

Do not silently invent these parameters.

---

## 29. Related Documentation

This document must remain consistent with:

- `ARCHITECTURE.md` — Technical architecture.
- `DATABASE.md` — MongoDB design.
- `ERD.md` — Entity relationships and indexes.
- `API.md` — REST API architecture.
- `API_CONTRACTS.md` — Request/response contracts.
- `SECURITY.md` — Security requirements.
- `RBAC_PERMISSIONS.md` — Authorization.
- `TENANT_BRANCH_ISOLATION.md` — Branch and organization isolation.
- `DATA_FLOW.md` — Cross-module data movement.
- `BUSINESS_RULES.md` — Business constraints.
- `TRANSACTIONS_AND_INTEGRITY.md` — Concurrency and financial safety.
- `BACKEND_TESTING_STRATEGY.md` — Testing strategy.
- `FRONTEND_INTEGRATION.md` — Frontend service boundaries.
- `FRONTEND_AUDIT.md` — Existing frontend evidence.
- `BACKEND_GAPS_AND_RISKS.md` — Known risks.
- `RULES.md` — Engineering restrictions.
- `AGENTS.md` — AI coding-agent guidance.

Relative links must follow the actual repository directory structure.

---

## 30. Final Implementation Boundary

### Confirmed Business Requirements

- Five frontend roles.
- Receptionist full approved Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy with multiple authorized branches.
- Current branch creation pause.
- Physical Assets without media upload infrastructure.

### Proposed Technical Direction

- Database indexing and query optimization.
- Bounded pagination.
- Safe frontend caching.
- Targeted data invalidation.
- Query-performance monitoring.
- Optional future cache layer.

### Deferred

- Redis and distributed caching.
- Premature realtime infrastructure.
- Background salary generation.
- Multi-client SaaS performance architecture.
- Unnecessary microservices.

### Not Implemented or Verified

- Production API caching.
- Redis infrastructure.
- Backend performance benchmarks.
- Production performance monitoring.
- Final latency and throughput targets.

**Governing Principle:** Optimize TSA Academy ERP for responsive, secure and consistent operation while keeping MongoDB-backed business records authoritative and ensuring that caching never overrides role permissions, branch isolation or financial integrity.

**Document Status:** DRAFT — Ready for backend performance design review. Implementation requires separately approved technical tickets.
