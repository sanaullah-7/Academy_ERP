# BACKUP_AND_RECOVERY

<!-- > Purpose: Defines data backup, restoration, disaster recovery and verification requirements. -->


# TSA Academy ERP — Backup, Restore & Disaster Recovery Specification

**Document:** BACKUP_AND_RECOVERY.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Backup and Recovery Design Proposed; Operational Verification Pending
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization with Multiple Branches
**Document Category:** Operations & Business Continuity

---

## 1. Purpose

This document defines the backup, recovery, disaster recovery and business continuity requirements for TSA Academy ERP.

The objective is to protect the academy's academic, administrative and financial records against accidental deletion, database corruption, infrastructure failure, application defects and unauthorized changes.

The recovery strategy must preserve:

- Academy and branch records.
- Staff accounts and branch assignments.
- Student profiles.
- Admissions and enrollments.
- Courses, batches and subjects.
- Fee challans.
- Verified fee payments.
- Outstanding student fee balances.
- Faculty assignments.
- Teacher salary agreements.
- Assignment-based running payroll.
- Salary payment history.
- Linked financial expenses.
- Physical assets.
- Audit records.
- Academy settings.

**Critical rule:** A successful database restore is not sufficient if valid financial records, branch relationships or authorization rules are corrupted or missing.

**Implementation boundary:** This document defines operational requirements. It does not authorize taking production backups, restoring databases, deleting collections, rotating credentials or changing infrastructure.

---

## 2. Backup and Recovery Principles

### BAK-001 — Protect Authoritative Data

MongoDB-backed operational records must be protected through an approved backup strategy.

### BAK-002 — Preserve Financial Integrity

Recovery must maintain valid fee collections, salary payments, expenses and outstanding balances.

### BAK-003 — Separate Environments

Development, testing, staging and production must not share unrestricted restore procedures.

### BAK-004 — Verify Recoverability

A backup is not proven recoverable until an appropriate restore test has succeeded.

### BAK-005 — Restrict Access

Backup creation, download, deletion and restore permissions must follow least-privilege principles.

### BAK-006 — Protect Confidential Information

Backup files must be secured against unauthorized access.

### BAK-007 — Preserve Historical Relationships

Recovery must maintain links between related academic and financial records.

### BAK-008 — Document Recovery Actions

Important restore and incident operations must be traceable.

### BAK-009 — Avoid Destructive Shortcuts

Do not clear production collections or overwrite databases without explicit authorization and a verified recovery plan.

### BAK-010 — Business Continuity

Recovery planning must account for ongoing academy operations and any valid transactions recorded after the selected backup point.

---

## 3. System Data Classification

Different data categories require appropriate protection.

| Category | Examples | Recovery priority |
|---|---|---|
| Authentication | User accounts, password hashes, branch memberships | Critical |
| Academic | Courses, subjects, batches, schedules | High |
| Student | Student profiles, admissions, enrollments | Critical |
| Fees | Challans, verified payments, balances | Critical |
| Payroll | Agreements, running obligations, salary payments | Critical |
| Finance | Posted expenses, verified revenue relationships | Critical |
| Audit | Administrative and financial history | High |
| Assets | Physical inventory, assignment history | High |
| Demo Classes | Inquiries, attendance and conversion references | Medium–High |
| Settings | Academy identity, branch configuration, themes | High |
| Temporary caches | Rebuildable application data | Low, if safely reconstructable |

These priorities are qualitative. Formal recovery objectives remain subject to owner approval.

---

## 4. Authoritative Data Sources

### Current Frontend Demo

The existing React frontend uses browser-local mock persistence.

```text
React Frontend
     |
     v
Mock Database
     |
     v
Browser localStorage
```

Browser-local data is not automatically protected by future MongoDB backups.

### Future Backend

```text
React Frontend
     |
     v
Express API
     |
     v
MongoDB
     |
     v
Approved Backup Service
     |
     v
Protected Backup Storage
```

### Important Distinction

A database backup protects the MongoDB data included in that backup.

It does not automatically protect:

- Unimported browser-local demo data.
- Uncommitted frontend form entries.
- Files stored outside MongoDB.
- Hosting configuration secrets.
- Separate external integrations.

Each additional authoritative data source requires an explicit protection strategy.

---

## 5. Backup Scope

The approved backup strategy should consider the following collections or their actual implemented equivalents.

### Core Records

- Organizations.
- Branches.
- Users.
- Branch role assignments.
- Academy settings.

### Academic Records

- Courses.
- Subjects.
- Streams.
- Batches.
- Students.
- Admissions.
- Enrollments.
- Faculty assignments.
- Timetables.

### Financial Records

- Challans.
- Fee payments.
- Salary agreements.
- Payroll obligations.
- Salary payments.
- Expenses.

### Supporting Records

- Demo Classes.
- Physical Assets.
- Asset events.
- Notifications.
- Audit events.
- Migration history.
- Session records where operationally relevant.

Collection names must be verified against the actual implemented MongoDB schema.

Do not assume these proposed names already exist.

---

## 6. Backup Types

### 6.1 Full Backup

Captures the relevant database state at a defined recovery point.

### 6.2 Incremental Backup

Captures changes since the relevant earlier backup, if supported by the selected provider.

### 6.3 Point-in-Time Recovery

Restores database state to a supported point within an approved retention window.

Availability depends on the selected MongoDB hosting plan and backup configuration.

### 6.4 Logical Database Export

Produces an appropriate portable database backup or export.

### 6.5 Configuration Backup

Preserves non-secret deployment settings, infrastructure configuration references and operational documentation.

### Selection Rules

- Prefer provider-supported reliable backup mechanisms.
- Verify whether the plan actually supports incremental or point-in-time recovery.
- Do not claim a capability exists merely because the provider offers it on another plan.
- Select backup methods according to recovery objectives and operational risk.

---

## 7. Proposed Backup Architecture

```text
                  TSA Academy ERP
                         |
                         v
                  Express Backend
                         |
                         v
                      MongoDB
                         |
             +-----------+-----------+
             |                       |
             v                       v
       Primary Database       Approved Backup
                                     |
                                     v
                              Protected Storage
                                     |
                                     v
                              Restore Verification
```

### Security Requirements

- Restrict access to backup storage.
- Use encryption where supported and required.
- Protect access credentials.
- Keep backups separate from ordinary frontend access.
- Monitor backup failures.
- Ensure a single compromised app account does not automatically gain unrestricted backup deletion authority.

The exact provider and storage topology remain TBD.

---

## 8. Backup Schedule

The final backup frequency must reflect operational risk and the approved Recovery Point Objective.

### Proposed Planning Categories

| Backup category | Possible approach | Final setting |
|---|---|---|
| Production database | Provider-managed scheduled backup | TBD |
| Critical financial recovery | Point-in-time capability, if available | TBD |
| Staging database | Scheduled or pre-release backup | TBD |
| Development database | Optional controlled backup | TBD |
| Before migrations | Verified recovery point | Required where relevant |
| Before major releases | Risk-based recovery preparation | Required where relevant |

### Important

No exact schedule, retention period or recovery guarantee should be invented without confirming business requirements and hosting-plan capabilities.

A scheduled backup must also be monitored for actual successful completion.

---

## 9. Recovery Point Objective

**RPO — Recovery Point Objective**

RPO defines the maximum acceptable amount of data loss measured as time between the recovery point and the failure.

For TSA Academy ERP, this is particularly important for:

- Verified fee collections.
- Payroll disbursements.
- Posted expenses.
- New enrollments.
- Admission approvals.

### Requirements

- Agree on an acceptable RPO before production launch.
- Confirm the selected backup provider can support it.
- Document whether point-in-time recovery is required.
- Identify any transaction records that may need independent reconciliation.
- Do not promise zero data loss without a verified architecture that supports it.

**Current RPO:** TBD.

---

## 10. Recovery Time Objective

**RTO — Recovery Time Objective**

RTO defines the target duration for restoring service after an incident.

### Factors

- Database size.
- Backup retrieval time.
- Hosting provider capabilities.
- Server deployment time.
- Schema compatibility.
- Financial reconciliation.
- Authentication and branch verification.
- Availability of operational staff.

### Requirements

- Define the recovery target with the owner.
- Verify restore procedures against representative data.
- Include application verification in recovery planning.
- Do not confuse database restore completion with full business-service recovery.

**Current RTO:** TBD.

---

## 11. Backup Retention

Backup retention must be approved according to business needs and applicable obligations.

### Considerations

- Historical student records.
- Financial transaction history.
- Payroll payment records.
- Required audit history.
- Storage capacity and cost.
- Data privacy requirements.
- Regulatory and contractual obligations.

### Security

- Restrict backup deletion.
- Protect older archives.
- Monitor retention policy changes.
- Do not delete backups solely to reduce storage without assessing recovery requirements.

**Final retention policy:** TBD.

---

## 12. Backup Access Control

Backup access must not be granted merely because a staff member has a business application role.

### Separate Permissions

Distinguish:

- Viewing operational application records.
- Creating database backups.
- Downloading backup archives.
- Restoring database snapshots.
- Deleting backups.
- Modifying retention policies.

### Requirements

- Use dedicated infrastructure permissions.
- Limit access to authorized operators.
- Require approval for production restore.
- Log relevant backup and restore operations.
- Keep credentials outside source code.
- Review administrative access periodically.

Super Admin within the ERP does not automatically imply unrestricted MongoDB infrastructure administrator rights.

---

## 13. Backup Encryption and Confidentiality

Backups may contain:

- Student personal information.
- Staff account records.
- Password hashes.
- Salary agreements.
- Financial transactions.
- Private academy records.

### Requirements

- Protect backups during transfer.
- Encrypt stored backups where supported and required.
- Protect encryption keys.
- Limit archive downloads.
- Avoid public backup URLs.
- Keep temporary restore files secured.
- Do not include secrets in backup logs.

### Important

Password hashes are sensitive even though they are not plaintext passwords.

Treat database backups as confidential operational assets.

---

## 14. Backup Verification

A backup process must confirm more than an attempted job.

### Verification Checks

1. Backup operation completed.
2. Expected database or collections were included.
3. Backup metadata is available.
4. Backup artifact or snapshot is accessible to authorized operators.
5. Reported failures are investigated.
6. Recovery compatibility is documented.
7. Periodic restore testing succeeds.

### Backup Success Versus Restore Success

A provider reporting backup success does not prove application-level recovery readiness.

A representative restoration must verify academic and financial records.

---

## 15. Restore Environments

### Development Restore

Used for safe development and testing with authorized data.

### Staging Restore

Used to validate recovery procedures without affecting live users.

### Production Restore

Used only through approved incident/recovery procedures.

### Critical Restrictions

- Never restore a production backup over active production without explicit authorization.
- Never run destructive restore tests on the live database.
- Do not expose confidential production data in an unsecured test environment.
- Do not assume a database named `test` is safe to overwrite without verifying its actual connection and ownership.

---

## 16. Standard Restore Procedure

The proposed recovery process follows these stages.

### Step 1 — Identify the Incident

Determine:

- What failed.
- When the incident started.
- Affected environments.
- Affected collections.
- Potential financial impact.
- Whether new valid transactions continued after the incident.

### Step 2 — Protect Current Evidence

Preserve logs, relevant database state and deployment metadata where feasible.

### Step 3 — Confirm Recovery Authority

Obtain required approval and identify authorized operators.

### Step 4 — Select a Recovery Point

Choose a verified backup or point-in-time recovery target.

### Step 5 — Assess Data Loss Risk

Identify valid transactions after the recovery point.

### Step 6 — Restore Safely

Prefer an isolated recovery environment when feasible.

### Step 7 — Validate Database Integrity

Check entities, references, indexes and financial relationships.

### Step 8 — Validate Application Functionality

Verify login, branch selection and critical workflows.

### Step 9 — Reconcile Missing Transactions

Follow separately approved recovery and financial correction procedures.

### Step 10 — Return to Service

Resume operations only after the required technical and business checks succeed.

### Step 11 — Document the Incident

Record recovery actions, validation outcomes and unresolved limitations.

---

## 17. Financial Recovery Restrictions

Financial data requires stronger protection than ordinary cached or temporary data.

### Never Automatically

- Delete verified payments.
- Recreate historical payments.
- Generate duplicate challans.
- Mark unverified payments as verified.
- Clear payroll outstanding balances.
- Generate new monthly salaries.
- Duplicate salary payment expenses.
- Rewrite expense history to force totals to match.

### Required Principle

**Restore operations must preserve or explicitly reconcile valid committed business transactions.**

A database backup taken before a valid payment does not contain that later payment.

Restoring that backup without reconciliation may create incorrect financial balances.

---

## 18. Student Fee Recovery

### Records to Verify

- Student.
- Admission.
- Enrollment.
- Challan.
- Verified Fee Payments.
- Outstanding Fee Balance.
- Receipt references.

### Reconciliation Checks

For each relevant challan:

```text
Approved Payable
      -
Valid Applied Verified Payments
      =
Outstanding Fee Balance
```

The exact implementation must follow approved business rules and monetary precision.

### Critical Checks

- No duplicate verified payment.
- No lost valid payment.
- No unexpected overpayment.
- Correct branch ownership.
- Correct student reference.
- Correct challan reference.
- Correct Finance revenue reporting.

Do not fabricate missing receipts or transactions.

---

## 19. Teacher Payroll Recovery

**CONFIRMED OWNER RULE:** Teacher Payroll is assignment-based running remuneration.

It is not an automatically generated monthly payroll system.

### Records to Verify

- Teacher.
- Faculty Assignment.
- Salary Agreement.
- Running Payable Obligation.
- Salary Payment.
- Linked Posted Expense.
- Outstanding Balance.

### Required Reconciliation

For each independent assignment obligation:

```text
Approved Assignment Payable
             -
Valid Applied Salary Payments
             =
Outstanding Running Balance
```

The exact amount calculations must follow the verified Fixed/Percentage remuneration rules.

### Recovery Restrictions

- Do not merge unrelated assignments.
- Do not reset balances at month-end.
- Do not recreate previous salary payments.
- Do not overwrite historical agreements.
- Do not fabricate settlement records.
- Do not create duplicate expenses.

### Teacher My Profile

After recovery, Teacher My Profile must still display only the authenticated Teacher's approved salary agreements, verified payments, outstanding amounts and payslips.

---

## 20. Salary Payment and Expense Reconciliation

A successful payroll disbursement must correspond to the approved financial posting.

### Required Checks

1. Salary Payment exists.
2. The payment references the correct Teacher/Assignment.
3. The approved amount is correct.
4. The corresponding Posted Expense exists.
5. The expense references the correct salary payment.
6. The payment/expense combination is not duplicated.
7. Finance totals include the expense exactly once.
8. Teacher compensation reflects the valid payment.

### Recovery Exception

If records are inconsistent after an incident:

- Identify the affected transaction.
- Preserve available evidence.
- Determine whether money was actually paid.
- Obtain approval for the repair.
- Apply a documented corrective procedure.
- Reconcile related summaries.

Do not silently create or delete financial entries.

---

## 21. Academic Recovery

Restore and verify:

- Courses.
- Subjects.
- Streams.
- Batches.
- Students.
- Admissions.
- Enrollments.
- Faculty assignments.
- Timetables.

### Referential Integrity

Verify:

- Every valid Enrollment references the intended Student.
- Every valid Enrollment references the correct Batch.
- Admissions preserve approved status/history.
- Faculty assignments reference the correct Teacher.
- Academic relationships match branch ownership.
- Historical data remains available where required by Payroll and Fees.

### Capacity Considerations

Recovered historical enrollment records must not be silently deleted if their count exceeds a later-modified batch capacity.

Flag legitimate inconsistencies for review.

---

## 22. Role and Branch Recovery

Restore must preserve the five-role authorization model.

### Current Roles

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Required Checks

- User identities remain valid.
- Disabled users remain disabled.
- Branch memberships remain accurate.
- Effective roles remain branch-specific.
- Protected privileged accounts remain protected.
- Unsupported same-branch multiple-role combinations fail closed.
- Branch creation pause remains enforced.

### Security Tests

Verify that:

- Receptionist retains full approved Admissions and Fees access.
- Receptionist cannot access independent Finance/Payroll.
- Teacher accesses only own salary.
- Admin cannot escalate privileges.
- Cross-branch unauthorized requests remain denied.

Database restoration must not accidentally re-enable revoked staff access.

---

## 23. Restoring Revoked Credentials

A backup may contain an older version of user permissions or session information.

### Risk

Restoring older authentication records could reinstate:

- Disabled accounts.
- Previously revoked branch access.
- Old role assignments.
- Obsolete sessions.
- Invalid credentials.

### Required Controls

- Reconcile account states against available authoritative post-backup security changes.
- Invalidate sessions where required.
- Apply current approved privilege restrictions.
- Review protected account assignments.
- Confirm active authorized users before reopening access.

Do not blindly treat an older backup's permissions as the current correct security state.

---

## 24. Audit Log Recovery

Audit records are important for incident investigation and financial traceability.

### Requirements

- Preserve available valid audit records.
- Protect actor/action/resource references.
- Avoid rewriting historical events.
- Record recovery operations separately.
- Restrict audit access.
- Preserve event ordering and timestamps where possible.

### Missing Audit History

Do not fabricate historical audit events after restoring an older snapshot.

Document any known missing interval and available external evidence.

---

## 25. Asset and Demo Class Recovery

### Physical Assets

Verify:

- Asset identity.
- Branch ownership.
- Staff assignment.
- Condition/status.
- Inspection and maintenance history.

### Demo Classes

Verify:

- Inquiry records.
- Attendance/status.
- Admission conversions.
- Linked applicant/student references.
- Duplicate conversion prevention.

### Restriction

Recovery must not automatically create new Admissions, Enrollments, payments or maintenance expenses from restored supporting records.

---

## 26. Application and Database Version Compatibility

Restored database state must be compatible with the deployed application version.

### Requirements

- Record the application release identifier.
- Record relevant database migration versions.
- Identify the database schema expected by the backend.
- Verify required indexes.
- Check data transformations.
- Avoid rolling back the application to code that cannot read the current schema.
- Avoid restoring an old database into a newer incompatible application without a migration/recovery plan.

### Related Document

`DATABASE_MIGRATIONS.md` defines controlled schema evolution and data transformation requirements.

---

## 27. Application Release Rollback

Application rollback and database restore are different operations.

### Application Rollback

May restore a previously working frontend or backend release without changing database records.

### Database Restore

Replaces or reconstructs data and may affect transactions recorded after the selected recovery point.

### Required Rule

Prefer the least disruptive authorized recovery action.

Do not restore a database snapshot merely because a recent frontend deployment introduced a rendering bug.

---

## 28. Backup Before Migrations

Before an approved high-risk database migration:

1. Verify the target environment.
2. Confirm the migration scope.
3. Assess current data.
4. Create an appropriate backup/recovery point.
5. Verify backup availability.
6. Test the migration in a safe environment.
7. Define rollback or forward-repair.
8. Obtain execution approval.
9. Run the migration.
10. Verify relationships and financial integrity.

### Critical

A backup does not excuse an unsafe migration.

The migration itself must still validate data and preserve approved business invariants.

---

## 29. Database Corruption Response

Potential corruption symptoms include:

- Missing related records.
- Duplicate financial payments.
- Broken student/enrollment links.
- Inaccurate payroll outstanding.
- Missing expense references.
- Invalid branch ownership.
- Failed application queries.

### Response Procedure

- Stop unsafe writes when necessary.
- Preserve diagnostic evidence.
- Identify the affected records.
- Determine whether corruption originated from code, migration or infrastructure.
- Compare against trustworthy recovery points.
- Use an approved repair/restore plan.
- Reconcile financial data.
- Run relevant tests before resuming normal operations.

Do not directly edit production MongoDB documents without a documented and authorized correction procedure.

---

## 30. Accidental Deletion Recovery

### Examples

- Student accidentally deleted.
- Admission removed.
- Batch record lost.
- Expense deleted improperly.
- Payroll payment removed.
- Asset history deleted.

### Response Requirements

1. Determine whether deletion was actually committed.
2. Identify related dependencies.
3. Preserve current state.
4. Determine appropriate recovery source.
5. Avoid overwriting unrelated recent records.
6. Restore or repair the affected relationship through an approved process.
7. Verify dependent calculations.

### Financial Records

Financial payment deletion is especially sensitive and must not be corrected through unsupported fabricated replacement entries.

---

## 31. Hosting Outage Recovery

A hosting outage may affect:

- Frontend hosting.
- Express API hosting.
- MongoDB.
- DNS.
- Network connectivity.

### Required Diagnosis

- Identify the unavailable component.
- Check hosting status and safe logs.
- Determine whether data was lost or merely unavailable.
- Avoid repeated unsafe financial submissions.
- Restore service according to provider capabilities.
- Verify transactions that may have completed before a timeout.

### Duplicate Payment Risk

When a payment request times out, the frontend must not assume it failed before checking the authoritative transaction result.

Idempotency and reconciliation are required for sensitive retry handling.

---

## 32. Recovery Testing Strategy

Restore procedures must be tested using an appropriately isolated environment.

### Test Categories

- Backup artifact accessibility.
- Complete database restore.
- Schema compatibility.
- Missing reference detection.
- Fee reconciliation.
- Payroll reconciliation.
- Expense linkage.
- User authentication.
- Branch authorization.
- Report accuracy.

### Important

Do not use live production data in an unsecured test environment.

Do not run destructive restore commands against production.

---

## 33. Recovery Test Scenarios

| Test ID | Scenario | Expected result |
|---|---|---|
| REC-001 | Restore valid backup | Required collections recover |
| REC-002 | Restore with matching application schema | Application can read records |
| REC-003 | Verify student references | No unintended broken relationships |
| REC-004 | Verify Admission and Enrollment | Correct linked records |
| REC-005 | Reconcile verified fee payments | Totals match recoverable records |
| REC-006 | Reconcile outstanding fees | Correct balances |
| REC-007 | Restore separate Teacher obligations | Assignment balances preserved |
| REC-008 | Verify partial salary payments | Paid/outstanding correct |
| REC-009 | Verify salary-expense linkage | One correct expense per applicable payment |
| REC-010 | Check another Teacher's payslip access | Denied |
| REC-011 | Check cross-branch access | Denied |
| REC-012 | Check disabled user access | Denied |
| REC-013 | Check active role assignments | Current approved access preserved/reconciled |
| REC-014 | Validate audit records | Available history remains accessible to authorized users |
| REC-015 | Restore with incompatible schema | Controlled failure or approved migration |
| REC-016 | Simulate missing backup | Failure reported without destructive action |

Tests must be marked PASSED only after actual successful execution.

---

## 34. Post-Recovery Application Checklist

### Core Operations

- [ ] Express backend starts.
- [ ] MongoDB connectivity works.
- [ ] Authentication works.
- [ ] Session revocation remains effective.
- [ ] Branch selection works.
- [ ] Five-role authorization works.
- [ ] Academy settings load.

### Academic Records

- [ ] Students exist as expected.
- [ ] Admissions have valid relationships.
- [ ] Enrollments reference correct Batches.
- [ ] Faculty assignments remain valid.
- [ ] Timetables load correctly.

### Financial Records

- [ ] Challan amounts are accurate.
- [ ] Verified fee payments reconcile.
- [ ] Outstanding fee balances reconcile.
- [ ] Assignment salary agreements remain intact.
- [ ] Salary payment history is preserved.
- [ ] Running payroll outstanding is correct.
- [ ] No automatic monthly payroll has been introduced.
- [ ] Payroll-linked expenses reconcile.
- [ ] Finance and Reports match authoritative records.

### Security and Operations

- [ ] Teacher self-only access is enforced.
- [ ] Receptionist restrictions remain enforced.
- [ ] Cross-branch requests are restricted.
- [ ] Audit history is preserved where available.
- [ ] No secrets appear in logs.
- [ ] Recovery event is documented.

Unchecked items are pending verification.

---

## 35. Business Continuity During Outages

If the application is unavailable, the academy may need a separately approved temporary operational procedure.

### Requirements

- Avoid unauthorized manual financial recording.
- Maintain a clear record of any authorized offline transactions.
- Prevent double-entry when service returns.
- Verify actual bank/cash receipts through approved business evidence.
- Reconcile temporary records before posting into the restored system.
- Preserve staff/student confidentiality.

### Important

This document does not authorize a new offline synchronization system.

Electron/LAN/offline automation remains deferred.

---

## 36. Backup Monitoring and Alerts

Operational monitoring should detect:

- Failed scheduled backups.
- Missing backup execution.
- Storage exhaustion.
- Backup retention failures.
- Unauthorized backup access.
- Failed restore verification.
- Database availability incidents.

### Alert Configuration

Final alert channels and frequencies remain TBD.

A backup policy is incomplete operationally if failures can occur indefinitely without detection.

---

## 37. Disaster Recovery Drill

A controlled recovery drill should establish whether documented procedures work.

### Drill Activities

1. Select an authorized test environment.
2. Identify a recent approved backup.
3. Restore into an isolated environment.
4. Verify application/database compatibility.
5. Check academic references.
6. Reconcile Fees.
7. Reconcile Payroll.
8. Verify security and branch restrictions.
9. Record recovery duration.
10. Identify gaps and remediation tasks.

### Drill Reporting

Document:

- Backup version.
- Environment.
- Restore method.
- Tests executed.
- Actual recovery time.
- Data inconsistencies.
- Corrective actions.

Do not report a recovery target achieved without measured evidence.

---

## 38. Operational Incident Report

A backup/recovery incident report should contain:

- Incident ID.
- Date and time.
- Affected environment.
- Affected systems.
- Initial symptoms.
- Root cause, when known.
- Data integrity impact.
- Financial impact.
- Selected recovery point.
- Restore steps.
- Tests actually performed.
- Remaining discrepancies.
- Authorized operator.
- Final status.

Do not include production passwords or unnecessary confidential student/staff records in incident reports.

---

## 39. Roles and Responsibilities

Technical backup permissions are separate from ERP business roles.

### Product Owner

Approves business-impacting recovery actions and data-loss decisions.

### Authorized Technical Operator

Executes approved backup and recovery procedures.

### Development Team

Investigates application defects, validates schema compatibility and implements separately approved fixes.

### Academy Operations

Validates recovered academic and financial records through authorized business users.

### Security Responsibility

Protects credentials, backup access and confidential records.

A Super Admin account inside the ERP must not automatically confer unrestricted infrastructure restore privileges.

---

## 40. Recovery Acceptance Criteria

A recovery operation may be accepted when:

1. Required application services are available.
2. Database structure is compatible.
3. Required records exist.
4. Academic references are valid.
5. Financial records reconcile.
6. Payroll obligations remain assignment-based.
7. Salary-to-expense relationships are correct.
8. Authentication and role restrictions work.
9. Branch isolation works.
10. Relevant tests were executed successfully.
11. Known data-loss intervals are documented.
12. Required business approval has been obtained.

A database connection becoming available is not sufficient evidence of recovery completion.

---

## 41. Explicitly Deferred Recovery Features

The current scope does not automatically include:

- Multi-region active-active deployment.
- Automated cross-region failover.
- Redis cache replication.
- Distributed database synchronization.
- Electron offline synchronization.
- Multi-client SaaS tenant recovery infrastructure.
- Cloudinary media archive recovery.
- Unapproved automated financial correction services.

These require separate requirements, architecture decisions and authorization.

---

## 42. Open Recovery Decisions

The following remain TBD:

- Final database hosting provider.
- Backup provider and service tier.
- Production RPO.
- Production RTO.
- Backup frequency.
- Retention duration.
- Point-in-time recovery availability.
- Offsite backup policy.
- Backup encryption/key ownership.
- Restore authorization process.
- Recovery operator assignments.
- Incident escalation process.
- Recovery drill frequency.
- Financial reconciliation ownership.
- Data-loss communication policy.
- Final regulatory/data-retention requirements.

Do not present any of these as finalized without approval and supporting evidence.

---

## 43. Related Documentation

This specification must remain consistent with:

- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Schema and data migrations.
- `ERD.md` — Entity relationships.
- `ARCHITECTURE.md` — Technical architecture.
- `DEPLOYMENT.md` — Hosting and release processes.
- `ENVIRONMENT_CONFIG.md` — Configuration and secrets.
- `SECURITY.md` — Security requirements.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication and sessions.
- `RBAC_PERMISSIONS.md` — Role/action permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization and branch ownership.
- `BUSINESS_RULES.md` — Domain invariants.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial and transaction integrity.
- `BACKEND_TESTING_STRATEGY.md` — Testing standards.
- `LOGGING_AND_MONITORING.md` — Incident logging and alerts.
- `FRONTEND_INTEGRATION.md` — Frontend/backend compatibility.
- `API_CONTRACTS.md` — API contracts.
- `AGENTS.md` — Coding-agent guidance.
- `RULES.md` — Engineering standards.
- `MEMORY.md` — Owner-approved decisions.
- `TASKS.md` — Active work tracking.
- `PROGRESS.md` — Verified implementation history.

Relative Markdown links must match actual repository file locations.

---

## 44. Final Implementation Boundary

### Confirmed Business Requirements

- One academy organization with multiple branches.
- Five current roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only compensation visibility.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Preservation of financial history and outstanding balances.
- Financial reconciliation.
- Current branch creation pause.
- Physical Assets without media upload infrastructure.

### Proposed Operational Design

- Managed database backup strategy.
- Secure backup storage.
- Recovery-point verification.
- Isolated restore testing.
- Financial reconciliation procedures.
- Operational incident reporting.
- Disaster recovery drills.
- Role-separated backup access.

### Deferred

- Multi-region active-active infrastructure.
- SaaS tenant recovery architecture.
- Electron/LAN/offline synchronization.
- Cloudinary media recovery.
- Unsupported automated financial repairs.

### Not Implemented or Verified

- Production backup schedules.
- Production retention policy.
- Configured point-in-time recovery.
- Tested restore procedures.
- Final RPO/RTO.
- Completed disaster recovery drills.
- Formal recovery acceptance.

**Governing Principle:** TSA Academy ERP must protect its authoritative MongoDB records through verified backups and controlled recovery procedures while preserving academic relationships, branch security, verified financial transactions and assignment-based payroll history.

**Document Status:** DRAFT — Ready for operations and disaster recovery review. Actual backup or restore actions require separately approved operational execution.
