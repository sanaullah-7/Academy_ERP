# DATABASE_MIGRATIONS

<!-- > Purpose: Defines safe database schema/index changes, migration procedures and backward compatibility. -->

# TSA Academy ERP — Database Migrations & Data Migration Specification

**Document:** DATABASE_MIGRATIONS.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Migration Strategy Proposed; No Migration Executed
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization with Multiple Branches

---

## 1. Purpose

This document defines the database migration, data import, schema evolution, rollback and verification requirements for TSA Academy ERP.

The existing frontend uses browser-local mock persistence, while the future backend will use MongoDB as the authoritative shared database.

The migration strategy must preserve approved business behavior and avoid losing or corrupting academic, administrative or financial records.

This specification covers:

- MongoDB schema changes.
- Migration version tracking.
- Frontend mock-data assessment.
- LocalStorage-to-MongoDB migration planning.
- Stable identifier mapping.
- Organization and branch ownership.
- Student and admission relationships.
- Enrollment and challan relationships.
- Verified fee payments.
- Faculty assignments.
- Assignment-based running Teacher Payroll.
- Expenses and financial reconciliation.
- Audit history.
- Migration validation.
- Backups, recovery and rollback.
- Safe release procedures.

**Critical boundary:** This document does not authorize running migrations, importing browser data, resetting databases, changing schemas or modifying application code.

---

## 2. Migration Principles

### MIG-001 — Preserve Existing Data

Never delete, overwrite or replace existing records without explicit authorization.

### MIG-002 — Verify Source Structure

Inspect the actual frontend mock-data schema and version before writing a migration.

### MIG-003 — Preserve Business Relationships

Student, Admission, Enrollment, Challan, Payment, Faculty Assignment and Payroll links must remain valid.

### MIG-004 — Preserve Financial History

Verified payments, salary disbursements and linked expenses must remain traceable.

### MIG-005 — No Invented Records

Do not fabricate missing verified payments, salary settlements or admission approvals.

### MIG-006 — Idempotent Migration

A safely repeatable migration must not create unintended duplicate records.

### MIG-007 — Environment Isolation

Never run destructive migration tests against production or shared client demonstration data.

### MIG-008 — Validate Before Commit

Verify source data, mappings and target constraints before applying irreversible changes.

### MIG-009 — Auditable Changes

Track applied migration versions, execution outcomes and safe operational metadata.

### MIG-010 — Explicit Approval

Real data imports, destructive schema changes and production migrations require separately approved execution.

---

## 3. Current and Target Persistence

### Current Frontend

```text
React Application
       |
       v
Frontend Domain Services
       |
       v
Mock Adapter / Mock Database
       |
       v
Browser localStorage
```

### Target Backend

```text
React Application
       |
       v
Frontend Domain Services
       |
       v
HTTP Adapter
       |
       v
Express Domain Services
       |
       v
Mongoose Models
       |
       v
MongoDB
```

### Important Difference

Browser localStorage is associated with a particular browser profile and origin.

Different staff accounts or browsers may contain different demo records.

A migration must not assume that all frontend browsers contain the same authoritative dataset.

The approved deployment may instead begin with new backend seed data or a controlled import, depending on a separate owner decision.

---

## 4. Migration Categories

The project distinguishes several types of migrations.

| Category | Description |
|---|---|
| Schema migration | Add or modify MongoDB fields, collections or indexes |
| Data migration | Transform existing records into an approved structure |
| Initial import | Import selected frontend demo data into MongoDB |
| Reference migration | Update linked identifiers while preserving relationships |
| Financial migration | Transfer verified fee, payroll and expense history |
| Security migration | Change user/role/branch assignment representation |
| Backfill | Populate a new field using validated existing information |
| Repair migration | Correct an identified data inconsistency under explicit approval |

Each category has distinct safety and testing requirements.

**Do not use the term migration to hide an unapproved business rule change.**

---

## 5. Migration Status Classification

Use precise statuses.

| Status | Meaning |
|---|---|
| PROPOSED | Migration idea documented |
| READY_FOR_REVIEW | Plan and expected impact documented |
| APPROVED | Execution explicitly authorized |
| TESTED | Executed successfully against a suitable test environment |
| STAGING_APPLIED | Applied to the approved staging environment |
| PRODUCTION_APPLIED | Applied to production with verified results |
| FAILED | Execution failed |
| ROLLED_BACK | Approved rollback completed and verified |
| BLOCKED | Required data, dependency or approval missing |

A migration document existing does not mean the migration was executed.

Do not mark a migration successful without execution evidence.

---

## 6. Migration Version Tracking

The future backend should maintain an authoritative migration history.

### Proposed Collection

`schemaMigrations`

This is a proposed infrastructure collection, not an already implemented model.

Suggested metadata:

| Field | Purpose |
|---|---|
| `id` | Migration record identifier |
| `version` | Stable migration version |
| `name` | Migration description |
| `checksum` | Identity of executed migration definition |
| `status` | Recorded execution state |
| `startedAt` | Execution start time |
| `completedAt` | Successful completion time |
| `environment` | Target environment |
| `result` | Safe execution summary |

### Rules

- Apply migrations in an approved deterministic order.
- Prevent conflicting simultaneous migration runners.
- Record successful completion only after required verification.
- Do not silently modify already applied migration definitions.
- If a previously executed migration must change, create an approved follow-up migration.
- Preserve appropriate error evidence without exposing secrets.

Migration tracking must not be treated as a substitute for database backups.

---

## 7. Migration File Organization

A possible backend directory structure is:

```text
Server/
└── src/
    └── database/
        └── migrations/
            ├── README.md
            └── <version>-<description>.js
```

The actual structure must follow the repository's approved `Server/` architecture.

### Naming Requirements

Migration names should identify:

- Order or version.
- Operation purpose.
- Affected domain.

Examples of **illustrative names only**:

- `001-initialize-academy-ownership`
- `002-add-branch-scoped-assignments`
- `003-create-enrollment-constraints`
- `004-introduce-assignment-payroll`

Do not generate these files automatically.

A migration runner or third-party migration package is not approved solely by this document.

---

## 8. Migration Preparation

Before implementing or executing a migration:

1. Read `AGENTS.md` and applicable engineering rules.
2. Inspect the actual Git state.
3. Confirm the target environment.
4. Confirm database connection details securely.
5. Identify all affected collections.
6. Identify active frontend/backend dependencies.
7. Review current schema and indexes.
8. Inspect representative existing records.
9. Identify relationships and migration cardinality.
10. Document expected changes.
11. Identify rollback and recovery options.
12. Prepare backup requirements.
13. Define validation queries.
14. Obtain required approval.

The implementation must not assume that a proposed schema matches existing data.

---

## 9. Source Data Discovery

The current frontend may contain:

- Initial mock records.
- User-edited localStorage records.
- Versioned browser persistence.
- Multiple branch datasets.
- Historical records associated with earlier frontend behavior.
- Records from previous mock schema revisions.

### Required Discovery

Determine:

- Actual localStorage keys.
- Current mock database version.
- Available migration helpers.
- Entity identifiers.
- Existing indexes or lookup structures in the mock adapter.
- Record relationships.
- Optional and legacy fields.
- Deleted/archived record behavior.
- Current fee/payroll calculation source.

### Important

Do not hardcode unverified storage keys or assume a browser export is a trusted production dataset.

---

## 10. Frontend Data Import Policy

Importing localStorage data into MongoDB is **not automatically authorized**.

### Available Future Options

**Option A — Fresh Demo Seed**

Create an approved fictional MongoDB dataset without transferring browser-edited records.

**Option B — Controlled Import**

Import a specifically selected and approved frontend dataset.

**Option C — Clean Production Start**

Begin with an empty production operational database and register authentic records through the application's approved workflows.

The choice must be approved before execution.

### Import Requirements

- Identify the exact source.
- Verify source ownership and integrity.
- Validate schema version.
- Preview mapped records.
- Detect duplicates.
- Verify financial totals.
- Define rollback.
- Obtain approval.

Do not automatically upload localStorage records when the user logs in.

---

## 11. Organization and Branch Mapping

The initial ERP serves one academy organization with multiple branches.

### Required Mapping

Each imported branch-owned record must map to:

- The correct academy organization.
- The correct branch.
- Its correct linked business records.

### Branch Mapping Table

A controlled import should maintain mappings between source and target identifiers.

| Source entity | Target entity | Required check |
|---|---|---|
| Mock academy | MongoDB organization | Correct ownership |
| Mock branch | MongoDB branch | Correct branch identity |
| Mock user | MongoDB user | Correct staff identity |
| Mock role assignment | Backend role assignment | Correct branch-specific role |
| Mock academic entity | Backend academic entity | Valid ownership/reference |

### Rules

- Do not merge branches based only on similar names.
- Preserve original branch identity wherever possible.
- Reject unknown source branches until mapping is resolved.
- Do not silently transfer financial transactions across branches.

---

## 12. Identifier Mapping

The frontend may use string identifiers that differ from MongoDB ObjectIds.

### Requirements

- Preserve stable logical identity.
- Maintain a source-to-target ID mapping.
- Update related foreign references consistently.
- Avoid relying on display names or serial numbers.
- Prevent collisions.
- Keep imports deterministic.

### Display Serial Restriction

Branch-scoped gapless display serials are presentation values.

They must not become permanent database primary keys.

A visible serial changing after deletion must not break historical relationships.

### Mapping Verification

Every imported reference must resolve to the intended target record.

Unmapped references must be reported as errors or handled through an explicitly approved policy.

---

## 13. Student Migration

### Data to Preserve

- Stable student identity.
- Approved personal/contact information.
- Organization/branch relationship.
- Enrollment references.
- Admission references.
- Relevant status.
- Historical dates where valid.

### Required Validations

- Required fields are present.
- Identifiers are unique under approved rules.
- Branch ownership is consistent.
- Academic relationships resolve.
- Existing financial history remains linked.

### Unresolved Policy

Whether Student identity is organization-level or branch-specific requires final ERD/source verification.

Do not merge same-named students across branches automatically.

---

## 14. Admissions Migration

### Data to Preserve

- Admission identity.
- Linked Student.
- Branch.
- Course/Batch selection.
- Approved current status.
- Creation and decision history where available.

### Status Compatibility

The latest approved frontend workflow uses Pending and Approved, including a permitted return to Pending.

Older records may contain historical statuses.

### Migration Rules

- Do not silently convert every legacy status to Approved.
- Do not delete historical status information without a mapping decision.
- Identify unsupported legacy statuses.
- Document the approved conversion or archival policy.
- Preserve valid linked enrollments.

### Admission Deletion

Do not reconstruct previously deleted admission records unless an approved source and restoration policy exist.

---

## 15. Enrollment Migration

### Data to Preserve

- Student relationship.
- Admission relationship.
- Course.
- Batch.
- Branch.
- Enrollment status.
- Enrollment date.

### Required Validations

- Student exists.
- Admission relationship is valid where required.
- Course and Batch are compatible.
- Branch ownership is correct.
- No unintended duplicate enrollment exists.
- Required historical data remains intact.

### Capacity Considerations

Legacy enrollment data may exceed current capacity after later configuration changes.

Do not automatically delete historical enrollments to make capacity numbers match.

Flag inconsistencies for review.

---

## 16. Academic Reference Migration

Applicable entities may include:

- Courses.
- Batches.
- Subjects.
- Streams.

### Requirements

- Preserve stable identities.
- Validate Course → Batch relationships.
- Verify Subject/Stream relationships.
- Preserve approved fee parameters.
- Preserve historical referenced entities.
- Avoid destructive deduplication.
- Respect organization versus branch ownership.

Academic records used by historical financial transactions must remain traceable.

---

## 17. Challan Migration

### Purpose

Transfer existing fee obligations without changing their meaning.

### Data to Preserve

- Challan identifier.
- Student.
- Enrollment.
- Branch.
- Original approved payable amount.
- Supported status.
- Creation/reference information.

### Required Validations

- Valid Enrollment reference.
- Correct Student relationship.
- Correct Branch.
- No unintended duplicate Challan.
- Accurate payable amount.
- Correct linked payment history.

### Important Contract

Preserve the existing one-challan-per-enrollment behavior where applicable.

Do not introduce recurring monthly challans or unrelated invoice structures during migration.

---

## 18. Fee Payment Migration

Financial migration requires a higher level of verification.

### Data to Preserve

- Payment identity.
- Challan and Student references.
- Amount.
- Payment method.
- Transaction reference.
- Verification state.
- Payment date.
- Relevant recording staff/branch metadata.

### Required Rules

1. Do not fabricate Verified payments.
2. Do not mark unverified payments Verified automatically.
3. Do not duplicate payment records.
4. Do not rewrite historical payment dates arbitrarily.
5. Preserve partial payments.
6. Preserve receipt references.
7. Prevent invalid cross-branch relationships.
8. Verify that outstanding balances reconcile.

### Financial Reconciliation

Conceptually:

```text
Outstanding Fees =
Approved Challan Payable
- Valid Applied Verified Payments
```

The exact approved calculation and historical adjustment behavior must be respected.

### Critical Gate

Any mismatch in source and target verified collection totals must block final acceptance until investigated.

---

## 19. Faculty Assignment Migration

Faculty assignments connect Teachers, Branches, Courses, Batches and Subjects.

### Data to Preserve

- Teacher identity.
- Assignment identity.
- Branch relationship.
- Course/Batch/Subject relationships.
- Approved schedule.
- Assignment status.
- Historical context needed by Payroll.

### Important

Do not delete or merge historical faculty assignments simply because their related teaching batch is no longer active.

An ended assignment may still have an unpaid salary obligation.

The migration must preserve the salary relationship.

---

## 20. Teacher Payroll Migration

**CONFIRMED OWNER RULE:** Salary follows an assignment/batch/subject-based running balance.

The system must not generate salary automatically for each calendar month.

### Payroll Entities

Potential backend entities include:

- Faculty Assignment.
- Salary Agreement.
- Running Payroll Obligation.
- Salary Payment.
- Linked Posted Expense.

Final schemas must be reconciled with frontend source and approved ERD.

### Required Preservation

- Assignment-specific agreement.
- Fixed or Percentage agreement method.
- Actual approved remuneration.
- Valid salary payments.
- Payment dates.
- Paid amount.
- Outstanding amount.
- Historical assignment references.
- Linked financial expense.
- Teacher-specific visibility.

### Source Verification

Before migration calculations, inspect the actual frontend payroll implementation, including relevant discovered files such as:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

Verify file locations and the actual calculation source.

### Nonmonthly Payroll Rules

- Do not construct monthly payroll periods.
- Do not create automatic monthly salary obligations.
- Do not overwrite prior agreements.
- Do not clear outstanding balances when a new month starts.
- Do not merge separate assignment obligations without approval.
- Do not create missing salary payments to force reconciliation.
- Do not fabricate salary expenses.

### Payroll Reconciliation

For each assignment:

```text
Current Approved Payable
        -
Valid Applied Salary Payments
        =
Outstanding Assignment Balance
```

This conceptual relationship must be interpreted using the existing frontend's actual formulas, agreement revisions and status rules.

### Critical Acceptance Criteria

- Total valid payments are preserved.
- Historical outstanding remains correct.
- Every migrated salary payment references the correct assignment or obligation.
- Payroll-linked expenses are not duplicated.
- Teacher My Profile displays only the correct Teacher's records.

---

## 21. Expense Migration

### Data to Preserve

- Expense identifier.
- Branch.
- Category.
- Amount.
- Description.
- Posting state.
- Date.
- Source relationship, if any.

### Payroll-Linked Expenses

Where the frontend contains a salary payment linked to an expense:

- Preserve the relationship.
- Avoid importing the same expense twice.
- Do not independently generate another expense for an already represented salary payment.
- Flag missing or conflicting relationships for review.
- Preserve valid finance totals.

### Unsupported Operations

Do not create reversal/adjustment transactions merely to make the imported data appear balanced.

Any repair requires explicit approval.

---

## 22. Demo Classes Migration

### Data to Preserve

- Demo inquiry.
- Branch.
- Student/applicant information.
- Selected course/batch interest.
- Approved attendance/status.
- Conversion reference.
- Relevant history.

### Rules

- Preserve existing converted admissions.
- Do not convert inquiries again during migration.
- Prevent duplicate links.
- Validate the corresponding target admission.
- Do not create a new student payment from a demo record.

---

## 23. Physical Assets Migration

The Assets module represents physical inventory.

### Data to Preserve

- Asset identifier.
- Branch ownership.
- Asset category.
- Condition/status.
- Staff assignment.
- Inspection history.
- Maintenance history.

### Rules

- Preserve historical asset events.
- Validate related staff identities.
- Do not automatically generate expenses from maintenance events.
- Do not introduce depreciation or disposal workflows without approval.

### Excluded

- Cloudinary.
- Digital media uploads.
- Video storage.
- Image galleries.

---

## 24. Users, Roles and Authentication Migration

### Five Roles

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher.

### Branch Role Mapping

Preserve:

- Staff identity.
- Authorized branch memberships.
- Effective role per branch.
- Active/disabled status.

### Same-Branch Multiple Roles

Unsupported same-branch combinations must remain fail-closed until the owner approves a final policy.

### Password Migration

Mock frontend credentials must not automatically become production credentials.

Use an approved secure account provisioning/password setup strategy.

Never migrate plaintext demo passwords into production user records.

### Security Verification

Confirm that:

- Admin cannot escalate to Super Admin.
- Receptionist has full approved Admissions and Fees access.
- Receptionist has no independent Finance or Payroll access.
- Teacher can view only own authorized profile and compensation.

---

## 25. Settings and Branding Migration

Preserve current approved:

- Academy display name.
- Branch profile information.
- Theme/color preferences.
- Other supported configuration.

### Rules

- Respect organization/branch ownership.
- Validate field formats.
- Avoid overwriting another branch's preferences.
- Do not import environment secrets as ordinary settings.
- Do not introduce Cloudinary/media infrastructure.

---

## 26. Audit and Notification Migration

### Audit

Preserve available historical audit information where its source can be trusted and its structure can be mapped accurately.

Do not invent missing past audit events.

Do not change original actor/action metadata without an explicit mapping.

### Notifications

Preserve applicable existing notifications if an approved import requires them.

Salary-payment notifications must remain linked to actual committed payments.

Do not generate duplicate salary payments as a side effect of restoring notifications.

---

## 27. Data Validation Before Migration

Before executing a migration, validate source records.

### Structural Checks

- Required fields.
- Data types.
- Valid identifiers.
- Allowed status values.
- Unique constraints.
- Supported schema version.

### Relationship Checks

- Organization and Branch links.
- Student and Admission links.
- Enrollment and Batch links.
- Challan and Enrollment links.
- Payment and Challan links.
- Faculty Assignment and Teacher links.
- Payroll Agreement/Payment/Expense links.

### Financial Checks

- Fee payable and paid totals.
- Verified payment status.
- Salary agreement payable.
- Applied salary payments.
- Outstanding payroll balances.
- Linked payroll expenses.

### Security Checks

- User status.
- Role validity.
- Branch membership.
- Protected account assignments.
- Confidential record ownership.

Invalid data must be reported before import rather than silently repaired.

---

## 28. Dry-Run Mode

Where practical, migration tools should support a read-only dry run.

### Dry-Run Responsibilities

- Load and validate source records.
- Calculate source-to-target mappings.
- Identify duplicates.
- Identify missing relationships.
- Identify financial inconsistencies.
- Estimate required database changes.
- Report conflicts and blockers.

### Required Output

A dry-run report may include:

| Metric | Description |
|---|---|
| Source records | Records read |
| Valid records | Records eligible for import |
| Invalid records | Records requiring correction |
| Duplicate candidates | Potential conflicting identities |
| Missing references | Unresolved linked records |
| Financial mismatches | Differences requiring investigation |
| Planned writes | Number and type of expected target mutations |

Dry run must not modify operational data.

---

## 29. Migration Execution Procedure

The proposed sequence is:

### Step 1 — Approval

Confirm the exact migration scope and target environment.

### Step 2 — Backup

Create and verify an appropriate backup or recovery point.

### Step 3 — Preflight Checks

Verify:

- Database connectivity.
- Migration version.
- Existing indexes.
- Required collections.
- No conflicting migration runner.
- Current application/schema compatibility.

### Step 4 — Source Validation

Inspect source records and run approved integrity checks.

### Step 5 — Identifier Mapping

Build deterministic source-to-target references.

### Step 6 — Apply Migration

Execute the approved, scoped transformation.

Use transactions or a staged migration strategy where appropriate.

### Step 7 — Verify Results

Compare source and target counts, relationships and financial totals.

### Step 8 — Record Outcome

Record actual migration version, environment, outcome and validation evidence.

### Step 9 — Application Verification

Run relevant API and frontend compatibility tests.

### Step 10 — Release Completion

Declare success only after required data and application checks pass.

---

## 30. Transaction and Batch Processing

Not every large data migration should run as one long MongoDB transaction.

### Requirements

- Keep transactions appropriately scoped.
- Use safe batches for large datasets.
- Support checkpoints where justified.
- Protect idempotency.
- Preserve relationship ordering.
- Stop on critical financial mismatches.
- Maintain a safe restart strategy.
- Avoid partial irreversible success without a documented recovery plan.

### Dependency Order

A proposed import order is:

1. Organization and Branch references.
2. Users and authorized branch assignments.
3. Academic catalogs.
4. Students.
5. Admissions.
6. Enrollments.
7. Challans.
8. Fee Payments.
9. Faculty Assignments.
10. Salary Agreements and Obligations.
11. Payroll Payments.
12. Expenses and linked financial records.
13. Demo Classes and Physical Assets.
14. Settings, Notifications and available Audit records.
15. Derived reports and validation.

The exact order must adapt to the real entity dependencies and any cyclic references.

---

## 31. Index Migration

Adding or changing indexes requires special consideration.

### Required Checks

- Existing data uniqueness.
- Expected query patterns.
- Storage and write-performance impact.
- Index build timing.
- Production environment capabilities.
- Rollback/remediation policy.

### Unique Index Safety

Do not create a unique index if existing legitimate records violate the proposed uniqueness condition.

Identify and resolve such conflicts through an approved data policy before applying the index.

Index names and definitions must match the finalized database specification.

---

## 32. Backward-Compatible Schema Changes

Prefer changes that permit safe application deployment.

### Expand-and-Contract Strategy

Where applicable:

1. Add new optional fields or structures.
2. Deploy compatible readers/writers.
3. Backfill validated historical data.
4. Verify new records and behavior.
5. Switch dependent application logic.
6. Remove obsolete fields only in a separate approved cleanup.

### Important

Do not remove existing fields before verifying that all application versions and migrations no longer depend on them.

A migration must account for deployment ordering.

---

## 33. Rollback and Recovery

Rollback is not always equivalent to reversing every database write.

### Application Failure

Rollback the application where possible without discarding valid data.

### Schema Migration Failure

Use an approved rollback or forward-repair procedure.

### Data Import Failure

Restore or remove only the explicitly identified imported records when safe and approved.

### Financial Safety

Never blindly restore an old database snapshot if doing so would delete valid later:

- Fee payments.
- Salary payments.
- Expenses.
- Enrollments.
- Audit history.

### Recovery Requirements

- Document the failure.
- Preserve logs and transaction references.
- Identify affected records.
- Reconcile financial totals.
- Select an authorized recovery method.
- Verify the corrected state.

---

## 34. Idempotency and Safe Re-Execution

A migration may be restarted or retried after interruption.

### Requirements

- Recognize already migrated records.
- Avoid duplicate insertion.
- Avoid duplicate payment creation.
- Avoid duplicate linked salary expense generation.
- Preserve stable identifier mappings.
- Reject conflicting reruns.
- Verify partial progress before continuation.

### Important

Repeatability must be designed explicitly.

A migration script being rerun does not automatically mean it is idempotent.

---

## 35. Financial Reconciliation Report

Financial migration must produce an inspectable reconciliation result.

### Fee Reconciliation

Compare:

- Number of challans.
- Total approved payable.
- Number of verified payments.
- Total verified paid amount.
- Outstanding fee totals.
- Invalid payment references.

### Payroll Reconciliation

Compare:

- Number of salary agreements.
- Number of independent assignment obligations.
- Agreed payable totals.
- Valid salary payments.
- Total amount paid.
- Outstanding running balances.
- Linked expense counts and totals.

### Expense Reconciliation

Compare:

- Operating expense totals.
- Payroll-linked expense totals.
- Missing payroll-to-expense links.
- Duplicate source references.

### Acceptance Principle

Every unexplained financial mismatch must be treated as a blocker, not silently rounded away.

---

## 36. Migration Security

Migration tooling may access sensitive data and must follow restricted security procedures.

### Requirements

- Use least-privilege credentials.
- Restrict access to approved environments.
- Protect source exports.
- Avoid printing secrets.
- Avoid logging unnecessary student/staff personal details.
- Encrypt sensitive transfer/storage where required.
- Keep temporary files controlled.
- Remove temporary exports only under an approved data-retention and cleanup procedure.
- Record authorized migration execution.

### Developer Safety

Do not include real personal data or production database credentials in committed migration fixtures.

---

## 37. Migration Testing Strategy

### Unit Tests

Test deterministic mapping and transformation functions.

### Integration Tests

Test actual MongoDB writes, indexes and relationships in an isolated environment.

### Failure Tests

Simulate invalid references, duplicate records and interrupted operations.

### Financial Tests

Verify exact source-to-target fee/payroll reconciliation.

### Security Tests

Verify resulting branch and role assignments.

### Regression Tests

Verify existing frontend workflows against the migrated backend.

### Required Scenarios

- Empty database initialization.
- Valid import.
- Missing reference.
- Duplicate source record.
- Duplicate migration attempt.
- Invalid financial record.
- Legacy admission status.
- Unmapped branch.
- Partially completed previous attempt.
- Historical salary obligation preservation.
- Payroll payment/expense reconciliation.

No migration may be described as tested without actual execution evidence.

---

## 38. Post-Migration Verification

After an approved migration, verify:

- Required collections exist.
- Records match expected counts.
- Stable identifiers resolve correctly.
- Organization and Branch ownership is correct.
- Authorized User roles are correct.
- Admissions and Students are linked.
- Enrollments reference valid Batches.
- Challans and verified Payments reconcile.
- Faculty Assignments remain intact.
- Teacher salary agreements and running balances are correct.
- No unintended monthly Payroll obligations exist.
- Salary Payments and Expenses reconcile.
- Reports derive correct totals.
- Teacher My Profile exposes only own records.
- Unauthorized cross-branch API requests are denied.
- Relevant frontend/API tests pass.

Migration completion requires verified data correctness, not merely successful script termination.

---

## 39. Migration Documentation and Reporting

Every migration execution should record:

- Migration name and version.
- Purpose.
- Target environment.
- Operator or authorized automation.
- Execution timestamp.
- Source and target schema versions.
- Affected collections.
- Records read/created/updated.
- Records skipped or rejected.
- Relevant financial reconciliation results.
- Tests actually performed.
- Errors and recovery actions.
- Final execution status.

### Progress Reporting

`PROGRESS.md` must report only actual completed work.

`TASKS.md` should reflect remaining migration items.

`MEMORY.md` should record lasting approved migration decisions where necessary.

Do not report owner acceptance without explicit owner approval.

---

## 40. Production Migration Checklist

- [ ] Migration scope approved.
- [ ] Target environment confirmed.
- [ ] Source data ownership verified.
- [ ] Schema changes reviewed.
- [ ] Dependency order verified.
- [ ] Pre-migration backup ready.
- [ ] Recovery procedure documented.
- [ ] Source records validated.
- [ ] Identifier mappings validated.
- [ ] Unique index conflicts reviewed.
- [ ] Dry-run results reviewed where applicable.
- [ ] Financial reconciliation criteria approved.
- [ ] Migration tested in a safe environment.
- [ ] Production execution authorized.
- [ ] Post-migration relationship checks passed.
- [ ] Fee collection totals reconciled.
- [ ] Payroll running balances reconciled.
- [ ] Payroll expenses reconciled.
- [ ] Role and branch authorization verified.
- [ ] Relevant API/frontend regression tests passed.
- [ ] Final outcome documented.

Unchecked items indicate pending verification, not successful completion.

---

## 41. Open Decisions

The following require further verification or approval:

- Whether to import browser mock data at all.
- Which browser dataset, if any, is authoritative.
- Final MongoDB collection schemas.
- Student identity model across branches.
- Source-to-target ID policy.
- Exact legacy admission-status mapping.
- Final payment verification semantics.
- Monetary representation and rounding.
- Fixed/Percentage salary formula and agreement revision handling.
- Treatment of inconsistent legacy payroll records.
- Historical payroll expense linkage policy.
- Migration runner and versioning mechanism.
- Production migration execution window.
- Backup provider and retention.
- Recovery objectives and rollback procedure.
- Required post-migration acceptance authority.

Unresolved decisions must not be silently invented during implementation.

---

## 42. Related Documentation

This document must remain consistent with:

- `DATABASE.md` — Proposed MongoDB schema and collections.
- `ERD.md` — Entity relationships.
- `API.md` — Proposed REST API architecture.
- `API_CONTRACTS.md` — Request and response contracts.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATA_FLOW.md` — Cross-module data flow.
- `TRANSACTIONS_AND_INTEGRITY.md` — Transaction and concurrency rules.
- `TENANT_BRANCH_ISOLATION.md` — Organization and branch ownership.
- `SECURITY.md` — Authentication and data security.
- `RBAC_PERMISSIONS.md` — Effective permissions.
- `CACHING_AND_PERFORMANCE.md` — Query and caching strategy.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Backend module roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Test requirements.
- `DEPLOYMENT.md` — Release and operational procedures.
- `FRONTEND_INTEGRATION.md` — Existing frontend service interfaces.
- `FRONTEND_AUDIT.md` — Existing frontend behavior.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend integration handoff.
- `MODULE_WORKFLOW_MAP.md` — Cross-module relationships.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role and branch evidence.
- `BACKEND_GAPS_AND_RISKS.md` — Known unresolved risks.
- `RULES.md` — Engineering boundaries.
- `AGENTS.md` — Agent instructions.
- `MEMORY.md` — Approved decisions.
- `TASKS.md` — Work tracking.
- `PROGRESS.md` — Verified progress.

Relative links must be checked against actual repository locations.

---

## 43. Final Implementation Boundary

### Confirmed Business Requirements

- One academy organization with multiple branches.
- Five existing frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only profile and salary visibility.
- Assignment-based running Payroll.
- No automatic monthly salary generation.
- Preservation of verified payments and historical balances.
- No unintended duplicate financial records.
- Current branch creation pause.
- Physical inventory Assets without media upload functionality.

### Proposed Technical Design

- Versioned MongoDB migrations.
- Controlled frontend-data import.
- Stable identifier mapping.
- Migration execution tracking.
- Dry-run validation.
- Financial reconciliation reports.
- Safe schema evolution.
- Backup and rollback planning.

### Deferred

- Multi-client SaaS migration.
- Automatic localStorage synchronization.
- Unapproved student merge/transfer workflows.
- Unapproved financial reversals.
- Unnecessary distributed migration infrastructure.

### Not Implemented or Verified

- Production migration runner.
- Applied MongoDB schema migrations.
- Browser-local data import.
- Historical financial migration.
- Production rollback and recovery procedures.
- Completed post-migration verification.

**Governing Principle:** Every database migration must preserve existing valid records, maintain academic and financial relationships, protect authorized branch ownership, and provide verifiable results without silently altering business history.

**Document Status:** DRAFT — Ready for migration design review. Migration execution requires separate approval.
