# Backend Gaps and Risks

**Purpose:** Evidence-based risks found while auditing the completed mock frontend. This file does not authorize backend implementation or change salary/business rules.

## Critical

1. **No production authentication/authorization.** Credentials, session, roles and permission checks are browser-controlled (`mockCredentials.js`, `mockAuth.js`, `permissions.js`). Backend must authenticate and authorize every route/query/action/export.
2. **No shared authoritative datastore.** Whole database/organization envelopes live in localStorage. Separate browsers/devices diverge; users can edit data. Mongo persistence, migrations, backups and restore testing are absent.
3. **Financial atomicity exists only as an in-process mock transaction.** Admissions, payments and payroll need Mongo transactions, idempotency and durable ledger/audit writes.
4. **Tenant/branch trust boundary is absent.** `branchId` is frontend-selected. Backend must derive organization from session and verify assignment/record ownership for every ID.
5. **Audit log is mutable.** Current audit arrays are useful UI prototypes but are not tamper-evident or independently retained.

## High

| Risk | Actual condition | Required decision/control |
|---|---|---|
| Money precision | JavaScript Number with two-decimal checks | Decimal128/minor units and rounding policy |
| Concurrent writes | Web Locks/fallback queue in one browser | transactions, unique indexes, optimistic concurrency |
| Counter collisions | branch counters in envelope | atomic counters/unique display ID indexes |
| Payroll compatibility | legacy periods plus running v3 obligation | approved migration and immutable history mapping |
| Permission ambiguity | multi-role assignment fails closed despite product docs allowing multiples | approve combination/precedence policy |
| Teacher navigation mismatch | own data is dashboard/profile special case, modules hidden | approve final route/API surface |
| Expense lifecycle | create/posted only; reversal/update policy absent | accounting correction policy |
| Refunds/discount approvals | no complete refund/reversal workflow | explicit fee governance ticket |
| Browser date authority | academy date/report/payment checks use client clock | server time and Asia/Karachi cutoff policy |
| Export leakage | currently safe only because projection is prefiltered | independent export authorization and row scope |

## Medium

- Repeated snapshot fields such as teacher/course/batch names may become stale; define immutable historical snapshots versus live labels.
- Several UI totals are derived across collections; move shared formulas to backend domain services and add invariant tests.
- Search is in-memory and unbounded. Add normalized searchable fields, indexes, cursor pagination and minimum query length.
- Notifications are browser-local and owner suppression is UI/service behavior; define durable recipient rules, read state and delivery expectations.
- Asset quantities/history and class conflict checks need concurrency-safe models.
- Images are data URLs in local storage; use validated object storage, malware/content checks and signed URLs.
- Error messages currently expose mock validation wording. Define stable error codes and safe production logs.
- Cache invalidation uses raw-storage signatures. Backend needs explicit data versions/events and user/branch/permission-aware keys.

## Document/source inconsistencies

- Multiple source headers/README files still say “Planned” although implementation exists.
- Existing architecture/ERD/API drafts contain intended structures that do not always match late owner-approved frontend behavior, especially Admin role, running payroll and role matrix. Backend tickets must reconcile rather than copy either source blindly.
- `payrollService` still exports advance/adjustment methods, but `mockDatabase.payrollOperation` rejects new operations; treat them as compatibility residue.
- Legacy demo scheduling operations/components remain while current UI uses direct attendance. Do not expose a backend scheduling workflow without approval.

## UNVERIFIED / blocked policy decisions

1. Multi-role permissions within the same branch.
2. Production Platform Admin and tenant provisioning.
3. Refund, void, chargeback, fee waiver and payment verification governance.
4. Expense reversal/approval and accounting period close.
5. Student transfer/merge/archive and guardian normalization.
6. Admission rejection/reopen retention and duplicate-person policy.
7. Attendance granularity and teacher attendance/earnings relationship.
8. Payroll agreement correction, termination and historical migration rules.
9. Record retention, legal/privacy periods and audit immutability target.
10. Backup RPO/RTO, disaster recovery, capacity and performance SLOs.

## Backend readiness gate

Before implementation, approve the reconciled RBAC matrix, data model/version plan, monetary/date conventions, mutation idempotency standard, error envelope and the first small backend ticket. Build contract tests against existing service behavior, then replace one adapter domain at a time. The frontend is mock-ready and suitable as behavioral evidence; it is not production-secure or multi-device ready.
