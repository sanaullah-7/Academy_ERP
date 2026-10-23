# TRANSACTIONS_AND_INTEGRITY

<!-- > Purpose: Specifies atomic financial operations, idempotency, concurrency handling and duplicate-record prevention. -->

# TSA Academy ERP — Transactions, Concurrency & Data Integrity Specification

**Document:** TRANSACTIONS_AND_INTEGRITY.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Status:** DRAFT — Backend Transaction Design; Not Implemented
**Last Updated:** 2026-10-23
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Scope:** Atomic Operations, Idempotency, Concurrency, Financial Integrity and Recovery

---

## 1. Purpose

This document defines the transaction and data-integrity requirements for the future TSA Academy ERP backend.

Its primary objective is to ensure that connected academic, administrative and financial operations are completed correctly, without duplicate records, partial writes, unauthorized changes or inconsistent balances.

It covers:

- MongoDB transaction boundaries.
- Atomic multi-record workflows.
- Concurrency and race-condition protection.
- Idempotent financial operations.
- Admission and enrollment consistency.
- Fee and challan integrity.
- Assignment-based Teacher Payroll.
- Payroll payment and expense reconciliation.
- Audit event consistency.
- Error handling and rollback.
- Historical record protection.
- Recovery and reconciliation.
- Database integrity testing.

**Implementation boundary:** This document defines the intended backend design. It does not authorize implementing controllers, services, models, database migrations or financial operations.

---

## 2. Core Integrity Principles

Every critical business operation must satisfy the following requirements.

### INT-001 — Atomicity

All durable records that must succeed together must be committed together or rolled back together.

### INT-002 — Consistency

A successful transaction must preserve every applicable domain invariant.

### INT-003 — Isolation

Concurrent operations must not produce invalid financial, enrollment or authorization outcomes.

### INT-004 — Durability

Once a successful financial operation is confirmed, its committed records must remain available according to the approved persistence and recovery guarantees.

### INT-005 — Authorization

Only an authenticated user with the required role, branch and record permission may initiate a protected operation.

### INT-006 — Idempotency

Repeating an equivalent sensitive request must not produce an unintended additional business effect.

### INT-007 — Historical Preservation

Verified payments, salary disbursements, required audit events and linked financial history must not be silently deleted or overwritten.

### INT-008 — Single Source of Truth

Financial amounts and outstanding balances must be derived from authoritative records or correctly maintained projections.

### INT-009 — Recoverable Failure

A failed operation must leave the system in a valid state and return a meaningful, safe error.

### INT-010 — Frontend Compatibility

The backend must preserve approved frontend behavior while enforcing security and concurrency requirements independently.

---

## 3. Transaction Architecture

The proposed backend uses domain services to coordinate MongoDB transactions.

```text
Authenticated HTTP Request
          |
          v
Permission and Branch Validation
          |
          v
Request Validation
          |
          v
Domain Business Service
          |
          v
Begin MongoDB Transaction
          |
          v
Read and Validate Current State
          |
          v
Apply Conditional Database Writes
          |
          v
Record Required Related Data
          |
          v
Commit Transaction
          |
          v
Return Success Response
          |
          v
Refresh Dependent Frontend Data
```

If a required operation fails before commit, the transaction must abort without creating a misleading partial success.

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| HTTP Controller | Accept request, invoke service, return outcome |
| Authentication Middleware | Establish authenticated identity |
| Authorization Middleware | Verify permissions and ownership |
| Validator | Validate request shape and fields |
| Domain Service | Coordinate business rules and transaction |
| Repository | Execute transaction-aware database operations |
| Mongoose Model | Enforce supported schema and index constraints |
| Audit Service | Record required durable events |
| Notification Service | Handle authorized post-commit notifications |
| Frontend Adapter | Translate responses and refresh affected views |

Do not place an entire multi-record transaction in a React component or an Express controller.

---

## 4. MongoDB Transaction Requirements

### 4.1 Deployment Prerequisite

Multi-document MongoDB transactions require a transaction-capable deployment, such as a replica set or sharded cluster.

The production and integration-test environments must support the chosen transaction strategy before transaction-dependent features are accepted.

### 4.2 Session Management

- Start a database session for a transaction requiring coordinated writes.
- Pass the transaction session through every related repository operation.
- Keep transaction lifetimes reasonably short.
- Commit only when all mandatory writes and validations succeed.
- Abort on validation, conflict or persistence failure.
- Release database sessions and resources reliably.
- Do not mix transactional and nontransactional writes when they form one required atomic business effect.

### 4.3 Transaction Scope

Use transactions when multiple durable records must remain consistent.

Do not wrap unrelated long-running operations into one transaction unnecessarily.

Avoid network calls, PDF generation and external delivery inside database transactions.

### 4.4 Retry Behavior

MongoDB may report transient transaction errors.

Controlled retries are permissible only when the operation is designed to remain safe.

A retried transaction must not create duplicate fees, salary payments, expenses, admission records or notifications.

### 4.5 Commit Uncertainty

If the client times out or a database commit result is uncertain, the system must not blindly replay a non-idempotent operation.

Resolve the transaction outcome through an approved idempotency or authoritative transaction-reference mechanism.

---

## 5. Critical Transaction Inventory

The following table defines intended consistency boundaries.

| Operation | Records involved | Integrity requirement |
|---|---|---|
| Standard admission creation | Admission and required Student relationship | No broken reciprocal references |
| Admission approval | Admission and required history/audit | Consistent status |
| Admission enrollment | Student, Admission, Enrollment | One valid enrollment transition |
| Instant admission completion | Student, Admission, Enrollment, Challan, optional Payment | No partial completed workflow |
| Challan issuance | Enrollment, Challan | No duplicate fee obligation |
| Fee collection | Challan, Fee Payment, required audit | No duplicate or excess verified collection |
| Salary agreement creation | Faculty Assignment, Salary Agreement, Running Obligation | Correct assignment ownership |
| Salary agreement revision | Agreement, Obligation, required revision history | Preserve paid amount and prior history |
| Payroll disbursement | Payroll Payment, Running Obligation, Expense, required audit | Financially consistent settlement |
| Demo conversion | Demo Inquiry and linked Admission | No duplicate conversion |
| Branch lifecycle mutation | Branch, relevant assignments and history | No unsafe cascade |
| Staff-role update | User, branch-role assignment, required audit | No privilege escalation |
| Asset event | Asset and assignment/maintenance/inspection history | Consistent inventory history |

The exact record set for each operation must match the approved data model and actual frontend workflow.

Not every single-record operation requires a multi-document transaction.

---

## 6. Admission Creation Integrity

### Purpose

Ensure an admission and its required linked student information remain consistent.

### Required Validations

- Authenticated actor.
- Effective Admissions permission.
- Authorized branch.
- Required applicant data.
- Valid selected Course and Batch.
- Valid existing or newly created Student relationship.
- Approved admission status.
- Duplicate and uniqueness restrictions.

### Data Flow

```text
Create Admission Request
         |
         v
Validate Applicant and Academic References
         |
         v
Check Existing Linked Records
         |
         v
Create Required Student / Admission Records
         |
         v
Validate Reciprocal Relationship
         |
         v
Commit
```

### Failure Rules

If student creation succeeds but the required admission write fails within the transaction, the combined operation must roll back.

If an admission references an invalid student, branch or course, the operation must be rejected.

Do not create orphan records and report admission success.

---

## 7. Admission Approval and Status Integrity

The approved current frontend uses Pending and Approved admissions, including an authorized return to Pending where business restrictions permit it.

### Requirements

- Verify the actor's actual Admissions status permission.
- Verify the admission's current state.
- Validate the requested status transition.
- Reject unauthorized or incompatible transitions.
- Preserve required status history or audit information.
- Prevent unsafe reversal of already enrolled or financially protected admissions.
- Keep transition behavior consistent under concurrent updates.

Historical Reject/Rejected rules must not become active without explicit reapproval.

### Concurrency

Two simultaneous status changes must not both succeed if they depend on contradictory initial states.

Use conditional state/version checks to detect stale decisions.

---

## 8. Enrollment Transaction

### Purpose

Ensure approved admission enrollment creates exactly the intended academic relationship.

### Required Relationships

- Admission.
- Student.
- Course.
- Batch.
- Enrollment.

### Business Rules

1. Admission must be eligible for enrollment.
2. Student must be correctly linked.
3. Course and Batch must exist and be compatible.
4. Branch ownership must match.
5. Applicable batch capacity must be respected.
6. Duplicate enrollment must be prevented.
7. The existing student activation behavior must be preserved.
8. Related records must remain consistent after commit.

### Concurrency Example

Two Receptionists may attempt the same enrollment simultaneously.

The backend must ensure only one valid enrollment is created.

A frontend-disabled button is not sufficient protection.

### Required Database Protection

Use appropriate unique constraints and conditional writes in addition to transactions.

---

## 9. Batch Capacity Concurrency

Batch capacity is vulnerable to concurrent enrollment races.

### Example

A batch has one remaining available seat.

Two authorized staff users attempt to enroll different students at the same time.

Both must not succeed if doing so would exceed the approved capacity.

### Requirements

- Read the authoritative capacity and active enrollment state.
- Apply a concurrency-safe capacity reservation or conditional update strategy.
- Prevent successful operations from exceeding capacity.
- Roll back any incomplete reservation/enrollment workflow.
- Reconcile actual enrollment counts with the stored or derived occupancy.
- Never trust a stale frontend occupancy number.

The exact capacity strategy must be documented before implementation.

---

## 10. Instant Admission Completion Transaction

The completed frontend includes an integrated admission workflow that can involve multiple linked records.

### Required Transaction

```text
Validate Instant Admission
          |
          v
Create Student
          |
          v
Create Admission
          |
          v
Create Enrollment
          |
          v
Create Challan
          |
          +--> Optional Verified Initial Payment
          |
          v
Commit Required Records Together
```

### Mandatory Rules

- Validate every submitted academic relationship.
- Prevent duplicate Student/Admission/Enrollment/Challan creation from repeated submissions.
- Preserve student identity and registration references.
- Preserve correct fee calculation.
- An optional payment must meet the supported verification rules.
- Do not report success if a required child record fails to persist.
- Keep Dashboard, Finance and Reports consistent with committed records.
- Return stable resource references for frontend navigation.

### Transaction Outcome

A successful response must identify the durable records created by the operation.

A failed operation must leave no inconsistent partial completed admission.

---

## 11. Challan Integrity

### Purpose

Ensure student fee obligations are generated consistently.

### Current Business Direction

Preserve the frontend's current one-challan-per-enrollment contract unless a later approved requirement explicitly changes it.

### Rules

- A challan must reference the correct eligible Enrollment.
- Student and branch references must be consistent.
- Fee calculation must follow current approved frontend logic.
- Prevent unintended duplicate challans.
- Do not create an additional challan merely because the issuance request is retried.
- Preserve settled challans and payment history.
- Restrict edits when associated verified payments make the change unsafe.

### Recommended Protection

Use a suitable uniqueness constraint for the approved enrollment-to-challan relationship.

Final index fields must match the verified ERD and actual implementation.

---

## 12. Fee Payment Integrity

**CONFIRMED:** Receptionist has Full Access to approved Fees operations within authorized branches.

### Payment Validation

Before recording a payment:

1. Authenticate the staff user.
2. Verify effective Fees collection permission.
3. Verify authorized branch.
4. Validate the target Student and Challan relationship.
5. Validate amount and payment method.
6. Verify the current outstanding balance.
7. Check supported verification status.
8. Apply duplicate-request protection.
9. Persist valid payment records.
10. Record required audit history.

### Valid Financial Relationship

```text
Challan Payable
      |
      v
Verified Payment 1
      +
Verified Payment 2
      +
Verified Payment 3
      |
      v
Remaining Outstanding Balance
```

### Conceptual Invariant

```text
Outstanding Fees =
Approved Challan Payable
- Valid Verified Applied Payments
```

Exact fee adjustments and rounding must follow approved business rules.

### Mandatory Constraints

- Payment amount must be valid.
- Reject unauthorized payments.
- Reject unsupported overpayments.
- Do not count unverified payments as settled revenue.
- Do not accept a payment for an unrelated branch's challan.
- Prevent duplicate records through retries.
- Preserve verified payment history.
- Ensure receipt amounts match their authoritative payments.

---

## 13. Duplicate Fee Payment Prevention

### Duplicate Sources

Duplicates can occur through:

- Double-clicking a payment button.
- Browser request retry.
- Network timeout and manual resubmission.
- Two staff users entering the same payment simultaneously.
- Backend retry after an uncertain commit.

### Required Safeguards

- Server-side idempotency for applicable payment requests.
- Unique payment/request references where appropriate.
- Outstanding balance revalidation.
- Concurrency-safe writes.
- Database transaction consistency.
- Clearly defined repeated-request behavior.
- Auditability of the final committed payment.

### Important Distinction

Two separate legitimate partial payments may have the same amount.

Therefore, payment amount alone must never be used as proof that two transactions are duplicates.

---

## 14. Verified Payment and Revenue Consistency

Student fee payments may have verification states defined by the approved frontend workflow.

### Rules

- Only payments recognized as Verified under the approved contract contribute to collected revenue.
- Payment verification must follow an authorized workflow.
- The same valid payment must not be counted more than once.
- Finance and Reports must derive collections from the same authoritative payment records.
- An unverified record must not reduce payable balances if the approved contract requires verification first.
- Any future payment reversal or refund workflow requires separate approval.

### Projection Model

```text
Authoritative Verified Fee Payments
                  |
                  +--> Student Fee Ledger
                  +--> Fees KPI
                  +--> Finance Revenue
                  +--> Dashboard Collection
                  +--> Reports & Exports
```

Reports are derived representations and must not create new payment transactions.

---

## 15. Faculty Assignment Integrity

Teaching assignments form the basis of the current salary agreement model.

### Required Relationship

```text
Teacher
   |
   v
Faculty Assignment
   |
   +--> Branch
   +--> Course
   +--> Batch
   +--> Subject
   |
   v
Salary Agreement Eligibility
```

### Rules

- Validate the Teacher identity and applicable branch assignment.
- Validate Course, Batch and Subject relationships.
- Reject invalid or prohibited duplicate assignments.
- Preserve relevant assignment history.
- Do not delete an assignment that is still required to identify an existing salary obligation.
- Prevent unrelated salary records from being attached to the wrong assignment.

Assignment status and salary obligation status must not be assumed to be identical.

A teaching assignment can end while an unpaid salary balance remains outstanding.

---

## 16. Salary Agreement Integrity

**CONFIRMED:** Teacher remuneration is managed through independent running balances tied to approved teaching assignments.

### Supported Agreement Methods

- Fixed.
- Percentage.

The exact calculation must be verified against current frontend source and tests.

### Salary Agreement Requirements

1. The agreement must reference a valid faculty assignment.
2. Teacher, organization and branch ownership must match.
3. Agreement parameters must be validated.
4. The payable amount must follow the existing approved formula.
5. The agreement must be saved explicitly.
6. Calendar-month changes must not generate salary automatically.
7. Old salary payments and obligations must remain preserved.
8. Agreement changes must not reduce total payable below already validly paid amounts.
9. Revisions must be traceable.
10. Unsupported salary advances or automatic adjustments must not be invented.

### Important Calculation Boundary

Before implementing actual salary logic, inspect:

- `Client/src/mock/assignmentPayroll.js`.
- `Client/src/mock/runningPayroll.js`.
- `Client/src/services/payrollService.js`.
- Relevant payroll tests.

Do not replace the existing calculation with a generic monthly salary formula.

---

## 17. Running Payroll Obligation Integrity

### Purpose

Track one independent payable obligation per eligible faculty assignment.

### Conceptual Relationship

```text
Faculty Assignment
       |
       v
Salary Agreement
       |
       v
Running Payable Obligation
       |
       +--> Payment 1
       +--> Payment 2
       +--> Payment 3
       |
       v
Remaining Outstanding Balance
```

### Conceptual Invariant

```text
Remaining Outstanding =
Current Agreed Payable
- Total Valid Applied Salary Payments
```

The implementation must preserve the source frontend's precise semantics.

### Mandatory Rules

- A new month does not create a new obligation.
- A new eligible assignment can have a separate obligation.
- One assignment's balance must not be used to settle another assignment automatically.
- Partial and full disbursements must be supported.
- Old unpaid balances must persist.
- No valid payment may be silently deleted.
- Outstanding balance must never become invalid through concurrent payments.
- Changing an agreement must preserve historical settlement records.

### Derived Versus Stored Balances

The backend must select a consistent strategy for payable, paid and outstanding figures.

If an outstanding balance is stored for efficiency, it must be transactionally consistent with the underlying agreement and payment records.

Do not allow multiple independently mutable salary totals.

---

## 18. Salary Payment and Expense Transaction

This is one of the most important financial-integrity requirements in TSA Academy ERP.

### Required Relationship

```text
Authorized Salary Disbursement
             |
             v
Validate Teacher and Assignment
             |
             v
Validate Salary Agreement
             |
             v
Check Outstanding Balance
             |
             v
Record Salary Payment
             |
             v
Create Matching Posted Expense
             |
             v
Record Required Audit Event
             |
             v
Commit Financial Transaction
             |
             v
Refresh Payroll, Finance, Reports
and Teacher My Profile
```

### Mandatory Rules

1. The actor must have approved Payroll payment permission.
2. The requested Teacher and assignment must match.
3. The payment must not exceed the valid outstanding balance.
4. No duplicate payment may be created by retry.
5. The salary payment must be durably recorded.
6. The corresponding Finance expense must be recorded exactly once.
7. Payment and expense records must retain a stable relationship.
8. Financial projections must not double-count the expense.
9. Required audit history must be preserved.
10. Failed operations must not leave a posted expense without the salary payment, or vice versa.

### Transactional Invariant

A committed payroll disbursement must have the corresponding authorized financial expense representation.

A failed payroll disbursement must not produce a posted expense.

### Expense Deduplication

Use a stable reference linking the Expense record to its source Payroll Payment.

A unique constraint or equivalent invariant must prevent multiple expenses for the same salary disbursement.

---

## 19. Salary Payment Concurrency

### Race Condition Example

A Teacher assignment has PKR 5,000 outstanding.

Two authorized administrators simultaneously attempt payments of PKR 4,000 each.

Both operations must not be committed because together they exceed the outstanding balance.

### Requirements

- Revalidate the current obligation during the write.
- Use conditional updates, appropriate concurrency control and/or suitable aggregate constraints.
- Ensure the sum of committed payments does not exceed the current payable amount.
- Reject the conflicting operation safely.
- Do not create an expense for a rejected payment.
- Preserve already committed valid payments.

A read-before-write check without concurrency protection is insufficient.

---

## 20. Salary Agreement Revision Concurrency

Two administrators may attempt to revise the same agreement at the same time.

### Requirements

- Detect stale agreement versions.
- Preserve the current total already paid.
- Validate the new agreement value against historical disbursements.
- Prevent lost updates.
- Preserve approved revision history.
- Recalculate the running obligation only under the explicit save action supported by the current frontend.
- Do not create new monthly salary cycles.

### Historical Preservation

Agreement revision must not rewrite past payment amounts or dates.

If a change is rejected, the previous valid agreement and running balance must remain intact.

---

## 21. Demo-to-Admission Conversion Integrity

### Purpose

Prevent duplicate or inconsistent conversion from a demo inquiry to an admission.

### Required Rules

- Validate the demo inquiry's existence and branch.
- Verify conversion eligibility.
- Preserve approved candidate information.
- Validate the new admission request.
- Ensure the resulting admission belongs to the correct branch.
- Prevent repeated conversion from creating unintended duplicate admissions.
- Preserve the original demo inquiry and its link to the resulting admission.

### Implementation Boundary

The exact source frontend workflow must determine whether conversion is a direct atomic creation or a prefilled Admissions form followed by confirmation.

Do not assume that opening a prefilled form means the admission has already been created.

---

## 22. User Role and Branch Assignment Integrity

Role changes are security-sensitive operations.

### Required Checks

1. Authenticate the acting administrator.
2. Verify user-management permission.
3. Verify the target user's protected status.
4. Validate permitted target roles.
5. Validate branch assignments.
6. Prevent Admin-to-Super-Admin escalation.
7. Preserve valid existing user identity.
8. Record required audit metadata.
9. Ensure subsequent requests use updated permissions.

### Transaction Considerations

If the approved workflow requires updating multiple related assignment records atomically, coordinate these writes consistently.

Session invalidation or permission-cache refresh must not be omitted.

### Important

A staff account may have different roles in separate branches.

Current unsupported same-branch multiple-role combinations must continue to fail closed.

---

## 23. Branch Lifecycle Integrity

### Branch Creation

**CONFIRMED:** Branch creation remains paused for every role until explicitly reauthorized.

### Branch Deactivation

Validate the current approved blockers, including applicable active records and the last usable branch.

### Branch Deletion

Do not allow unsafe deletion of branches with dependent operational or financial records.

### Required Rules

- Protect the selected active branch.
- Protect the last usable branch.
- Validate blocking admissions and enrollments.
- Validate unpaid challans and relevant operational history.
- Validate staff assignments.
- Preserve linked financial and audit records.
- Avoid accidental cascade deletion.
- Recheck blockers within the transaction or concurrency-safe operation.

The precise deletion policy must match the current frontend source.

---

## 24. Physical Asset Event Integrity

Physical asset records may have assignment, inspection and maintenance history.

### Requirements

- Validate the Asset and branch.
- Verify authorized staff assignment.
- Prevent invalid ownership changes.
- Preserve inspection and maintenance history.
- Keep asset status consistent with its approved lifecycle.
- Do not automatically generate Finance expenses from maintenance entries without explicit approval.
- Do not create automatic depreciation or disposal workflows.

The Assets module does not represent image/video storage.

Cloudinary and media uploads remain deferred.

---

## 25. Idempotency Architecture

Idempotency prevents one logical business action from being executed multiple times due to retries.

### Proposed Header

```http
Idempotency-Key: client-generated-unique-reference
```

The final header and storage contract must be approved in the API specification.

### Sensitive Operations

- Instant admission completion.
- Enrollment creation.
- Challan issuance.
- Fee payment.
- Payroll disbursement.
- Demo conversion.
- Other approved high-risk mutations.

### Idempotency Record

A proposed persisted record may include:

- Organization.
- Actor.
- Branch.
- Operation identifier.
- Idempotency key.
- Canonical request fingerprint.
- Processing status.
- Result reference or safe replay response.
- Creation and expiration metadata.

### Idempotency Rules

1. Scope keys to the correct trusted context.
2. Reject reuse of a key with a different request payload.
3. Protect against concurrent use of the same key.
4. Persist a successful operation outcome reliably.
5. Return a consistent result on equivalent retries.
6. Prevent duplicate financial effects.
7. Define safe recovery for interrupted or uncertain operations.
8. Never treat idempotency as a replacement for authorization.

The exact idempotency collection and retention duration remain proposed.

---

## 26. Unique Constraints and Referential Integrity

MongoDB does not automatically enforce ordinary relational foreign keys.

The backend must validate cross-collection relationships through domain services and transaction-aware repositories.

### Candidate Constraints

| Relationship | Required invariant |
|---|---|
| Student ↔ Admission | Approved stable linked identity |
| Enrollment ↔ Admission | No unintended duplicate enrollment transition |
| Batch ↔ Course | Valid compatible academic relationship |
| Challan ↔ Enrollment | No unintended duplicate challan |
| Fee Payment ↔ Challan | Correct ownership and balance |
| Faculty Assignment ↔ Teacher | Valid teaching authorization and branch |
| Salary Agreement ↔ Faculty Assignment | Correct agreement ownership |
| Running Obligation ↔ Agreement | One consistent payable relationship |
| Payroll Payment ↔ Obligation | Correct assignment settlement |
| Payroll Expense ↔ Payroll Payment | No duplicated linked expense |
| Demo Inquiry ↔ Admission | Correct conversion linkage |
| Asset Event ↔ Asset | Correct ownership and history |

### Index Policy

Unique indexes must reflect the actual approved cardinality.

Do not create a unique index based on an assumed relationship if the frontend permits legitimate multiple records.

Review existing data before applying unique constraints during migration.

---

## 27. Optimistic Concurrency and Version Control

Some operations require detection of stale edits.

### Candidates

- Admission status changes.
- Batch capacity updates.
- Student record updates.
- Salary agreement revisions.
- Branch status changes.
- User-role assignment changes.
- Other sensitive mutable records.

### Requirements

- Track an appropriate record version or equivalent concurrency token.
- Compare the expected current version during mutation.
- Reject stale modifications with a documented conflict response.
- Preserve previously committed changes.
- Avoid silently overwriting another authorized user's work.

The exact version-field representation belongs to the approved database and API contracts.

---

## 28. Financial Precision and Rounding

Financial integrity requires exact monetary handling.

### Applies To

- Course fees.
- Subject fees.
- Challans.
- Verified student payments.
- Expenses.
- Salary agreements.
- Payroll obligations.
- Payroll payments.
- Financial summaries.

### Requirements

- Use an approved exact-money representation.
- Avoid uncontrolled JavaScript floating-point arithmetic.
- Preserve the current frontend's displayed financial behavior.
- Define rounding once for each approved calculation.
- Prevent negative or unsupported balance states.
- Reconcile totals and individual records consistently.

### Formula Verification

The exact Teacher Fixed/Percentage calculations must be verified from current frontend payroll source and tests.

Do not invent or substitute salary calculations.

---

## 29. Audit and Transaction Consistency

Sensitive business mutations require appropriate audit records.

### Examples

- Admission status changes.
- Enrollment creation.
- Fee payment recording.
- Salary agreement changes.
- Payroll disbursement.
- Expense posting.
- Role/branch assignment changes.
- Branch lifecycle changes.

### Requirements

- Record the authenticated actor.
- Record the relevant branch and resource.
- Use safe approved metadata.
- Preserve required audit history.
- Do not expose sensitive secrets.
- Prevent ordinary users from editing audit events.

### Atomicity

If the business contract requires an audit event to exist for every successful financial mutation, persist that event within the required transaction boundary.

Do not report successful completion if a mandatory durable audit write fails.

---

## 30. Notifications and Post-Commit Side Effects

The frontend includes salary-payment notifications for Teachers.

### Critical Distinction

A salary payment is the authoritative financial event.

A notification is a secondary side effect.

### Correct Flow

```text
Commit Payroll Payment + Expense
              |
              v
Determine Notification Recipient
              |
              v
Create / Dispatch Notification
              |
              v
Teacher Notification Center
```

### Requirements

- Never send a success notification for an uncommitted payment.
- Never retry the financial payment simply because notification delivery failed.
- Prevent duplicate notifications where the delivery mechanism supports retry.
- Protect other teachers' salary confidentiality.
- Reconcile notification failures separately from committed financial records.

### Proposed Reliable Delivery

For reliable asynchronous notification delivery, a transactional outbox may be considered if justified and approved.

Do not automatically introduce message brokers, Redis queues or external notification providers.

If durable notification creation is mandatory, include it in the transaction design as an appropriate local record.

---

## 31. Failure and Rollback Policy

A failed operation must produce a predictable outcome.

### Validation Failure

No business write should occur.

Return field-level feedback where appropriate.

### Authorization Failure

No protected record should be exposed or mutated.

### Conflict

Return a documented conflict response and preserve the previously committed state.

### Database Write Failure

Abort required transactions.

Do not return success for incomplete operations.

### Network Timeout

Treat the outcome as potentially uncertain.

Use an idempotency/result-lookup mechanism rather than blindly repeating a financial write.

### Notification Failure

Do not reverse a valid committed salary payment solely because a secondary notification failed, unless an explicitly approved atomic notification-storage invariant requires it.

### Recovery

Preserve enough safe correlation information to investigate and reconcile interrupted operations.

---

## 32. Data Reconciliation

Even well-designed transactional systems require periodic verification of financial integrity.

### Suggested Reconciliation Checks

- Every verified fee payment references a valid challan.
- Fee paid totals do not exceed approved payable balances.
- Every active enrollment has valid Student, Course and Batch references.
- Every salary obligation references a valid faculty assignment/agreement.
- Payroll payments reference the correct salary obligations.
- Valid payroll paid totals do not exceed current approved payable amounts.
- Every committed salary disbursement has exactly one appropriate linked expense.
- Financial reports do not count the same payment twice.
- Required audit history exists for sensitive operations.

### Reconciliation Rules

- Checks must be read-only by default.
- Do not silently modify financial records.
- Report inconsistencies with safe references.
- Require a separate approved correction workflow to fix production data.
- Preserve evidence of any authorized repair.

Automatic financial repair jobs are not currently approved.

---

## 33. Recovery and Disaster Protection

Production recovery planning must address:

- Database backups.
- Restore verification.
- Recovery point and recovery time objectives.
- Transaction-history preservation.
- Safe replay of idempotent operations.
- Corrupt or inconsistent record detection.
- Protection against double posting after system recovery.

Do not claim backup or recovery compliance before the relevant procedures are implemented and tested.

Actual backup providers, schedules and retention periods remain TBD.

---

## 34. Security Requirements

Transactions must never bypass access-control checks.

### Mandatory Controls

- Authenticated identity.
- Active account verification.
- Organization ownership.
- Authorized branch.
- Required action permission.
- Record-level relationship validation.
- Mass-assignment protection.
- Financial amount validation.
- Safe audit logging.
- Protected database credentials.

### Role Requirements

- Receptionist has Full Admissions and Fees access only within approved scope.
- Receptionist has no independent Finance or Payroll access.
- Teacher can view only own compensation.
- Owner can perform only approved financial operations.
- Admin cannot escalate privileged accounts.
- Super Admin remains subject to business integrity and current branch-creation restrictions.

---

## 35. Transaction Testing Requirements

Future backend tickets must verify transaction behavior using a suitable isolated MongoDB test environment.

### Admission and Enrollment

- Successful admission creation.
- Failed linked student write.
- Duplicate enrollment attempt.
- Simultaneous enrollment.
- Full-batch rejection.
- Instant admission rollback.

### Fees

- Valid fee payment.
- Partial payment.
- Unverified payment handling.
- Duplicate submission.
- Same idempotency key with different body.
- Simultaneous payments exceeding outstanding amount.
- Database failure before commit.
- Uncertain result recovery.

### Payroll

- Correct assignment salary agreement.
- New-month non-generation.
- Separate assignment obligations.
- Fixed/Percentage source-formula compatibility.
- Partial and full disbursement.
- Overpayment denial.
- Simultaneous payment race.
- Agreement revision concurrency.
- Payroll payment and expense atomicity.
- No duplicate expense.
- Preserved salary history.

### Administration

- Role escalation rejection.
- Branch-scope denial.
- Role assignment concurrency.
- Branch deletion dependency checks.
- Audit-event consistency.

### Recovery

- Transaction rollback.
- Retry safety.
- Duplicate prevention after network timeout.
- Notification failure after financial commit.
- Reconciliation detects intentionally inconsistent test fixtures.

A successful test must verify both the API response and authoritative database state.

No test may be reported PASS unless it has actually been executed.

---

## 36. Implementation Guidelines

When backend implementation is separately authorized:

1. Inspect the verified frontend services and source data relationships.
2. Identify transaction boundaries for the active module.
3. Finalize applicable Mongoose schemas and indexes.
4. Define input and permission validation.
5. Implement transaction-aware repository operations.
6. Coordinate writes from domain services.
7. Add idempotency and concurrency protection where needed.
8. Record required durable audit events.
9. Define post-commit secondary effects.
10. Add success, failure, concurrency and retry tests.
11. Verify dependent financial/report projections.
12. Document any unresolved limitations.

### Engineering Restrictions

- Do not put database business workflows in controllers.
- Do not duplicate financial formulas across modules.
- Do not use an unrestricted update operation for protected financial fields.
- Do not delete verified payment records to correct balances.
- Do not introduce automatic monthly payroll.
- Do not add unapproved refund or reversal processes.
- Do not create complex distributed infrastructure without a justified requirement.

---

## 37. Open Decisions

The following require approval or source-level verification before affected implementation:

- Exact frontend fee calculation and rounding.
- Fixed/Percentage payroll calculation formula.
- Payroll agreement revision persistence model.
- Exact enrollment/challan cardinality.
- Batch capacity concurrency strategy.
- Student identity and duplicate-handling policy.
- Final MongoDB unique index definitions.
- Final idempotency record schema and retention.
- Payment verification semantics.
- Financial correction and reversal governance.
- Audit retention policy.
- Notification delivery reliability requirements.
- Production transaction deployment configuration.
- Backup and disaster recovery targets.

These must remain PROPOSED or TBD until confirmed.

---

## 38. Related Documentation

This document must remain consistent with:

- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `BUSINESS_RULES.md` — Domain invariants.
- `API.md` — Proposed API endpoints.
- `API_CONTRACTS.md` — Detailed request/response contracts.
- `DATABASE.md` — Proposed MongoDB design.
- `ERD.md` — Entity relationships and constraints.
- `SECURITY.md` — Authentication and security.
- `RBAC_PERMISSIONS.md` — Role/action authorization.
- `TENANT_BRANCH_ISOLATION.md` — Organization and branch ownership.
- `DATA_FLOW.md` — Cross-module data movement.
- `ARCHITECTURE.md` — Backend architectural structure.
- `FRONTEND_INTEGRATION.md` — Frontend service contracts.
- `FRONTEND_AUDIT.md` — Implemented frontend evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend handoff requirements.
- `MODULE_WORKFLOW_MAP.md` — Existing workflow map.
- `ROLE_BRANCH_DATA_MATRIX.md` — Effective role and branch evidence.
- `BACKEND_GAPS_AND_RISKS.md` — Known backend risks.
- `MEMORY.md` — Owner-approved decisions.
- `RULES.md` — Engineering restrictions.
- `AGENTS.md` — Coding-agent guidance.
- `PROGRESS.md` — Verified implementation results.

Use actual repository paths when adding relative Markdown links.

---

## 39. Final Implementation Boundary

### Confirmed Business Requirements

- Five existing frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only profile, assignment and compensation visibility.
- Assignment-based running Payroll without automatic monthly generation.
- Existing linked academic and fee workflows.
- Valid partial/full salary payments.
- No duplicate financial effects.
- Protected branch and record ownership.
- Historical financial record preservation.
- Current branch-creation pause.

### Proposed Technical Design

- MongoDB multi-document transactions.
- Transaction-aware Mongoose repositories.
- Idempotency records and retry handling.
- Conditional updates and optimistic concurrency.
- Linked payroll expense records.
- Durable audit-event coordination.
- Reconciliation and recovery checks.

### Deferred

- Automatic monthly salary generation.
- Unsupported financial refunds, reversals and corrections.
- Automatic production financial repair.
- Premature distributed queues and microservices.
- Multi-client SaaS infrastructure.

### Not Implemented

- Production MongoDB transaction workflows.
- Backend idempotency handling.
- Concurrency-safe payment services.
- Salary-expense atomic posting.
- Production reconciliation and recovery processes.

**Governing Principle:** Every critical business transaction must preserve valid ownership, correct relationships, exact financial amounts, historical records and authorized state transitions, while preventing duplicates, partial success and conflicting concurrent writes.

**Document Status:** DRAFT — Ready for backend transaction design review; implementation requires separately approved development tickets.
