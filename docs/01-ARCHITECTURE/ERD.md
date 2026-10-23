<!-- Entity Relationship Diagram — database mein Student, Branch, User, Enrollment, Invoice, Payment ke records aur unke relations -->

# Academy Management ERP — Database Design & Entity Relationship Specification

**Document:** ERD.md
**Version:** 1.0
**Status:** DRAFT — Pending Data Model and Business Rule Approval
**Updated:** 2026-10-09
**Database:** MongoDB
**ODM:** Mongoose
**Architecture:** Single-Academy Modular Monolith
**Development Strategy:** Frontend First, Backend Integration Later

---

## CURRENT EFFECTIVE REQUIREMENTS — 2026-10-23

Current frontend entities that the backend design must reconcile include Organization, Branch, User, BranchRoleAssignment, Session, Student, Admission, Enrollment, Course, Batch, Subject, Stream, FacultyAssignment, Class, Challan, FeePayment, Expense, SalaryAgreement, running PayrollObligation, PayrollPayment, DemoInquiry, Asset, AssetEvent, Notification and AuditEvent.

Operational records require organization and branch ownership. Relationships use immutable internal IDs; display serials/names are presentation or historical snapshots. Admission completion, demo conversion and payroll payment plus posted expense require transactions. Exact money storage must use an approved integer-minor-unit or Decimal128 convention. Unique constraints are required for normalized login, scoped display counters, course/batch naming, assignment identity, challan per enrollment and payment/idempotency references.

Teacher Payroll is assignment/batch/subject-based running balance, not a monthly period generator. Historical payroll periods remain compatibility records. Final field-level schemas, retention, refunds/reversals, student transfer and historical payroll migration remain PROPOSED/TBD and must not be inferred from this summary.

---

## 1. Purpose

This document defines the proposed database entities, MongoDB collections, relationships, field structures, indexes, constraints and data integrity rules for the Academy Management ERP.

It will serve as the authoritative data-model specification once approved.

The objective is to ensure that frontend mock data, backend APIs, Mongoose schemas, validation rules and reporting queries follow consistent data contracts.

This document must support:

- Data integrity
- Branch-level isolation
- Secure role assignments
- Scalable querying
- Consistent business workflows
- Accurate financial records
- Reliable reporting
- Maintainability
- Testability
- Auditing
- Controlled future schema evolution

This document does not authorize database implementation or migration.

## 2. Decision Classification

**CONFIRMED:** Explicitly supplied or approved requirement.

**PROPOSED:** Engineering recommendation awaiting approval.

**TBD:** Unresolved decision requiring clarification.

**DEFERRED:** Requirement excluded from the current development phase.

The presence of a field or collection in this draft does not mean that its design has been approved or implemented.

## 3. Confirmed Database Requirements

The following requirements are confirmed:

- MongoDB is the primary database.
- Mongoose is the database modeling layer.
- The initial system supports one academy organization.
- The academy may have multiple branches.
- The four core roles are Super Admin, Owner, Receptionist and Teacher.
- Staff may belong to multiple branches.
- Staff may have different or multiple roles in each branch.
- Super Admin can administer branches and staff accounts.
- Branch-specific data access must be enforced by the backend.
- The frontend will initially use mock data.
- Real database integration will happen in a later phase.

Detailed business rules remain subject to the approved PRD, System Design and Security documents.

## 4. Database Design Philosophy

**Status: PROPOSED**

Use a normalized-by-reference design for important business entities, with selective embedding where it improves clarity and does not introduce conflicting sources of truth.

### Core Principles

1. Maintain a clear distinction between user identity and branch permissions.
2. Separate student identity from course enrollment.
3. Separate admission applications from finalized enrollments.
4. Separate invoices from payments.
5. Keep branch ownership explicit on branch-specific records.
6. Avoid storing duplicate authoritative financial balances.
7. Track critical administrative and financial changes.
8. Use appropriate validation, indexes and unique constraints.
9. Design related writes to avoid partial business transactions.
10. Do not physically delete historical records when retention or audit requirements prohibit it.
11. Do not introduce multi-client SaaS data structures before they are required and approved.
12. Use stable document identifiers rather than depending on names or display labels.

MongoDB ObjectIds are the proposed persisted identifiers.

Frontend mock records may use stable string representations of IDs, but must follow agreed data contracts.

## 5. Proposed Collection Inventory

| Domain | Collection | Purpose |
|---|---|---|
| Organization | academies | Academy profile and branding |
| Organization | branches | Individual branches |
| Identity | users | Staff identities and accounts |
| Identity | userBranchRoles | Branch-specific user role assignments |
| Academic | students | Student master profiles |
| Academic | guardians | Reusable parent/guardian profiles, if needed |
| Academic | admissions | Admission applications |
| Academic | courses | Academy course/program catalog |
| Academic | subjects | Subject catalog |
| Academic | batches | Branch-specific teaching batches |
| Academic | enrollments | Student participation in courses/batches |
| Academic | classes | Scheduled or delivered teaching sessions |
| Academic | attendance | Student attendance records |
| Academic | demoClasses | Demo registrations and sessions |
| Finance | feePlans | Fee structures and installment definitions |
| Finance | invoices | Amounts charged |
| Finance | payments | Recorded amounts received |
| Finance | paymentAllocations | Links payments to invoices, if partial/multi-invoice allocation is required |
| Finance | creditAdjustments | Approved financial credits/refunds/reversals |
| Finance | expenses | Recorded operating expenses |
| Operations | assets | Equipment and asset records |
| Configuration | academySettings | Operational settings, if separate from academy profile |
| Audit | auditLogs | History of sensitive changes |

All collection names and detailed fields are PROPOSED until approved.

Do not create all collections simply because they appear in this inventory. Implement them only when their approved module requires them.

---

# 6. Organization Data Model

## 6.1 Academy

**Collection:** `academies`
**Status:** PROPOSED

Purpose: Stores the organization identity and configurable academy branding.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Academy identifier |
| name | String | Academy display name |
| logoUrl | String / null | Logo storage reference |
| primaryColor | String | Approved primary brand color |
| contactEmail | String / null | Academy contact email |
| contactPhone | String / null | Academy phone number |
| address | String / null | Main contact address |
| status | String | Active or inactive |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Relationships

- One academy has many branches.
- One academy has many staff accounts.
- Academy branding settings are shared across authorized branches.

### Constraints

- Academy name is required.
- Branding values must be validated.
- Do not assume public URL-based logo values are inherently safe.
- Only authorized administrators may update academy settings.
- Keep one initial academy organization without implementing SaaS billing.

## 6.2 Branch

**Collection:** `branches`
**Status:** PROPOSED

Purpose: Stores individual academy locations.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Branch identifier |
| academyId | ObjectId | Owning academy |
| code | String | Branch reference code |
| name | String | Branch display name |
| address | String / null | Branch address |
| phone | String / null | Contact phone |
| status | String | Active/inactive |
| createdAt | Date | Created date |
| updatedAt | Date | Modified date |

### Relationships

- Academy 1:N Branches.
- Branch 1:N Batches.
- Branch 1:N Admissions.
- Branch 1:N Enrollments.
- Branch 1:N Invoices and related operational records.
- Branch 1:N User branch assignments.

### Proposed Indexes

- Unique academyId + code.
- academyId + status.
- academyId + name, nonunique unless naming rules require otherwise.

### Integrity Rules

- A branch cannot reference an academy that does not exist.
- Inactive branches should not receive unauthorized new operations.
- Historical records should retain their original branch references.
- Branch deactivation must not erase financial or academic history.

---

# 7. Identity and Access Control Data Model

## 7.1 User

**Collection:** `users`
**Status:** PROPOSED

Purpose: Stores staff identities and account status.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | User identifier |
| academyId | ObjectId | Academy association |
| fullName | String | Employee name |
| emailNormalized | String | Normalized login email |
| passwordHash | String | Secure password hash |
| phone | String / null | Contact phone |
| accountStatus | String | Active, disabled, invited, etc. |
| lastLoginAt | Date / null | Last successful login |
| createdAt | Date | Created date |
| updatedAt | Date | Updated date |

### Rules

- Store password hashes only, never plaintext passwords.
- Do not return password hashes in normal API responses.
- Email normalization must be consistent.
- Do not store login passwords in frontend mock records.
- Account disablement must invalidate or restrict active sessions according to SECURITY.md.

### Proposed Unique Index

- Unique normalized login email across the initial academy application.

## 7.2 User Branch Role Assignment

**Collection:** `userBranchRoles`
**Status:** PROPOSED

Purpose: Maps one user to an authorized branch and its assigned roles.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Assignment identifier |
| userId | ObjectId | Assigned user |
| branchId | ObjectId | Assigned branch |
| roles | Array of strings | One or more authorized roles |
| status | String | Active/inactive assignment |
| assignedBy | ObjectId | Administrator who assigned it |
| createdAt | Date | Creation time |
| updatedAt | Date | Last modification |

### Example

```json
{
  "userId": "user_101",
  "branchId": "branch_2",
  "roles": ["teacher", "receptionist"],
  "status": "active"
}
```

Example IDs above are conceptual frontend mock IDs, not real MongoDB ObjectIds.

### Relationships

- One user has many branch assignments.
- One branch has many assigned users.
- One assignment contains one or multiple valid role identifiers.

### Proposed Indexes

- Unique userId + branchId.
- branchId + status.
- userId + status.

### Important Rules

- A user must not have duplicate active assignments for the same branch.
- Roles must be drawn from an approved role catalog.
- Role assignments must be modified only by authorized administrators.
- Branch membership alone does not authorize every record in that branch.
- Teacher record access must also consider assigned classes, batches or students.
- All-branches access must be explicitly authorized.

### Global Super Admin Scope — TBD

A dedicated academy-wide assignment or capability model is needed so Super Admin can access all branches, including newly created ones.

Do not implement this through arbitrary frontend-selected branch IDs.

The exact representation must be finalized in SECURITY.md before backend implementation.

---

# 8. Student and Guardian Data Model

## 8.1 Student

**Collection:** `students`
**Status:** PROPOSED

Purpose: Stores a student's master identity independently of individual course enrollments.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Student identifier |
| academyId | ObjectId | Owning academy |
| studentNumber | String | Internal student reference |
| fullName | String | Student name |
| dateOfBirth | Date / null | Birth date, if required |
| gender | String / null | Optional profile field, subject to requirements |
| phone | String / null | Student contact |
| email | String / null | Student email |
| address | String / null | Contact address |
| status | String | Profile status |
| createdAt | Date | Created date |
| updatedAt | Date | Updated date |

### Design Decision

Student identity is academy-level in the proposed model.

Course and branch associations belong in enrollment records.

This allows one student to enroll in multiple batches without duplicating the student master profile.

### Proposed Indexes

- Unique academyId + studentNumber.
- Search-supporting name fields after query requirements are finalized.

### TBD

- Official admission/student number format.
- Student uniqueness and duplicate detection rules.
- Whether student identity can be shared across branches.
- Final required personal information.
- Privacy and retention obligations.

## 8.2 Guardian

**Collection:** `guardians`
**Status:** PROPOSED / OPTIONAL

Purpose: Stores parent or guardian information when reusable relationships are required.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Guardian identifier |
| academyId | ObjectId | Academy |
| fullName | String | Guardian name |
| phone | String | Contact number |
| email | String / null | Optional contact |
| address | String / null | Address |
| createdAt | Date | Creation timestamp |

### Relationship

Student M:N Guardians, if one guardian can be linked to multiple students and a student can have multiple guardians.

A relationship structure would be needed to store relationship type and primary contact status.

### Alternative

If the product requires only one or two guardian contacts per student with no independent guardian management, embedding guardian contact details inside students may be simpler.

**Decision: TBD.**

Do not build a separate collection without confirming the use case.

---

# 9. Admissions and Enrollment

## 9.1 Admission

**Collection:** `admissions`
**Status:** PROPOSED

Purpose: Stores student applications and admission decisions.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Admission identifier |
| academyId | ObjectId | Academy |
| branchId | ObjectId | Admission branch |
| studentId | ObjectId / null | Linked student profile, if created |
| applicantSnapshot | Object | Submitted applicant details |
| courseId | ObjectId | Requested course |
| preferredBatchId | ObjectId / null | Requested batch |
| status | String | Admission state |
| submittedAt | Date | Submission date |
| processedBy | ObjectId / null | Handling staff |
| createdAt | Date | Creation date |
| updatedAt | Date | Update date |

### Proposed Statuses

- Draft
- Submitted
- Pending
- Approved
- Rejected
- Cancelled

Exact allowed statuses and transitions require PRD approval.

### Rules

- An admission does not automatically imply active enrollment.
- Admission status transitions must follow approved workflow rules.
- Student identity creation must not result in uncontrolled duplicates.
- Admission documents must be handled according to privacy rules.

## 9.2 Enrollment

**Collection:** `enrollments`
**Status:** PROPOSED

Purpose: Connects students to a course and branch-specific batch.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Enrollment identifier |
| academyId | ObjectId | Academy |
| branchId | ObjectId | Enrollment branch |
| studentId | ObjectId | Student |
| courseId | ObjectId | Course |
| batchId | ObjectId | Assigned batch |
| admissionId | ObjectId / null | Source admission |
| enrolledAt | Date | Enrollment date |
| status | String | Active, completed, withdrawn, etc. |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

### Relationships

- Student 1:N Enrollments.
- Course 1:N Enrollments.
- Batch 1:N Enrollments.
- Admission 0..1 or 1:N Enrollments depending on final admission rules.

### Integrity Rules

- Referenced student, course and batch must exist.
- Enrollment branch must match the selected batch branch.
- Duplicate active enrollment restrictions must be explicitly defined.
- Withdrawal/completion must preserve enrollment history.
- Batch capacity constraints should be checked during enrollment.

**TBD:** Whether one admission may produce multiple enrollments.

**F02-006 frontend DEMO implementation only (owner-approved; not a production schema decision):** the local mock enrollment record is exactly `{id, branchId, admissionId, studentId, courseId, batchId, status, enrolledAt}`. Its `status` is `Active`; each Admission may be enrolled once in this flow, and activation of the linked Student is committed atomically with the record. The broader production cardinality/status/index decisions above remain TBD.

---

# 10. Course, Subject and Batch Models

## 10.1 Course

**Collection:** `courses`
**Status:** PROPOSED

Purpose: Stores academy courses and educational programs.

### Proposed Fields

- _id
- academyId
- code
- name
- description
- duration
- status
- createdAt
- updatedAt

### Proposed Constraints

- Course code unique within academy.
- Course names and duration must follow approved validation.
- Do not delete historical courses required by existing enrollments.

## 10.2 Subject

**Collection:** `subjects`
**Status:** PROPOSED

Purpose: Stores teaching subjects.

### Proposed Fields

- _id
- academyId
- code
- name
- status
- createdAt
- updatedAt

Course-to-subject relationships must be finalized based on actual program structures.

## 10.3 Batch

**Collection:** `batches`
**Status:** PROPOSED

Purpose: Represents a branch-specific teaching group.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Batch identifier |
| academyId | ObjectId | Academy |
| branchId | ObjectId | Owning branch |
| courseId | ObjectId | Course |
| code | String | Batch code |
| name | String | Batch name |
| capacity | Number | Maximum seats |
| startDate | Date / null | Start date |
| endDate | Date / null | End date |
| status | String | Batch status |
| createdAt | Date | Created |
| updatedAt | Date | Updated |

### Indexes

- Unique branchId + code.
- branchId + courseId + status.

### Rules

- Capacity must be nonnegative and an integer.
- Enrollments must respect the approved capacity policy.
- Inactive batches should not accept new enrollment unless specifically permitted.

---

# 11. Faculty, Classes and Attendance

## 11.1 Teacher Identity

Teacher authentication identity should remain in the users collection.

A teacher-specific profile may be added if the academy requires qualifications, specialization, employment terms or compensation settings.

Do not duplicate user names, emails or passwords across independent faculty records.

## 11.2 Teaching Assignment

**Proposed Collection:** `teachingAssignments`

Purpose: Connects a teacher to a branch, batch, course or subject.

Proposed fields:

- _id
- teacherUserId
- branchId
- batchId
- subjectId
- status
- assignedAt
- assignedBy

This association is important for teacher-level authorization.

The exact assignment granularity remains TBD.

## 11.3 Class

**Collection:** `classes`
**Status:** PROPOSED

Purpose: Stores planned or completed teaching sessions.

Proposed fields:

- _id
- branchId
- batchId
- teacherUserId
- subjectId
- startAt
- endAt
- status
- createdAt
- updatedAt

### Rules

- Class end time must be after start time.
- Teachers must have an authorized assignment.
- Scheduling conflict rules are TBD.
- Completed classes must retain historical records.

## 11.4 Attendance

**Collection:** `attendance`
**Status:** PROPOSED

Purpose: Stores student attendance for a class session.

Proposed fields:

- _id
- classId
- enrollmentId
- status
- markedBy
- markedAt
- updatedAt

### Proposed Constraints

- Unique classId + enrollmentId.
- Attendance must reference an authorized class and enrollment.
- Students must belong to the relevant teaching group.
- Attendance corrections should be traceable.

---

# 12. Fee Structure and Financial Records

Financial modeling requires stronger consistency rules than ordinary display records.

## 12.1 Fee Plan

**Collection:** `feePlans`
**Status:** PROPOSED

Purpose: Defines approved course/batch fee structures.

Potential fields:

- _id
- academyId
- branchId or applicable scope
- courseId
- batchId
- name
- currency
- installmentRules
- effectiveFrom
- effectiveTo
- status
- createdAt
- updatedAt

Exact installment and fee calculation rules remain TBD.

## 12.2 Invoice

**Collection:** `invoices`
**Status:** PROPOSED

Purpose: Records an amount legally or operationally charged to a student.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Invoice identifier |
| branchId | ObjectId | Owning branch |
| studentId | ObjectId | Student |
| enrollmentId | ObjectId / null | Related enrollment |
| invoiceNumber | String | Human-readable reference |
| currency | String | Currency |
| lineItems | Array | Charge descriptions and amounts |
| subtotalMinor | Integer | Amount before adjustments |
| discountMinor | Integer | Approved discount |
| totalMinor | Integer | Total payable amount |
| dueDate | Date | Due date |
| status | String | Invoice state |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

### Financial Precision

PROPOSED:

Represent monetary amounts as integer minor units rather than ordinary floating-point currency values.

Currency precision must be implemented consistently in frontend services, backend validations and reporting.

### Proposed Index

Unique branchId + invoiceNumber.

### Integrity

- Invoice totals must be derived from validated line items and adjustments.
- Discounts require authorized approval.
- Payments must not silently overwrite invoice charge history.
- Paid and cancelled invoices require controlled mutation rules.
- Reported outstanding balance must be derived from valid invoice, allocation and adjustment records.

## 12.3 Payment

**Collection:** `payments`
**Status:** PROPOSED

Purpose: Stores recorded payments received from students.

### Proposed Fields

| Field | Type | Purpose |
|---|---|---|
| _id | ObjectId | Payment identifier |
| branchId | ObjectId | Receiving branch |
| studentId | ObjectId | Student |
| receiptNumber | String | Receipt reference |
| amountMinor | Integer | Collected amount |
| currency | String | Currency |
| method | String | Cash, bank, etc. |
| reference | String / null | External payment reference |
| receivedAt | Date | Collection time |
| receivedBy | ObjectId | Authorized receiving user |
| status | String | Payment status |
| createdAt | Date | Created |
| updatedAt | Date | Updated |

### Proposed Indexes

- Unique branchId + receiptNumber.
- branchId + receivedAt.
- studentId + receivedAt.

### Payment Integrity Rules

- Payment amount must be positive.
- Duplicate recording must be prevented.
- Sensitive operations must have audit history.
- Rejected or reversed payments must not count as collected cash.
- Payment method and reference requirements are TBD.
- Payment creation must be idempotent where retries could create duplicate collections.

## 12.4 Payment Allocation

**Collection:** `paymentAllocations`
**Status:** PROPOSED / CONDITIONAL

Purpose: Records how one payment is applied against one or more invoices.

Potential fields:

- paymentId
- invoiceId
- amountMinor
- createdAt

### Important

If the client confirms that each payment always belongs to exactly one invoice, a simpler direct payment-to-invoice relationship may be sufficient.

If partial payments, advance deposits or multi-invoice payments are supported, a separate allocation model is recommended.

**Final decision: TBD.**

## 12.5 Financial Adjustments and Refunds

**Proposed Collection:** `creditAdjustments`

Purpose: Stores controlled discounts, credits, refunds or reversals when required.

Exact operations and schema depend on approved financial workflows.

Rules:

- Never silently erase historical money movements.
- Maintain a clear reference to the original invoice/payment.
- Restrict sensitive actions to explicitly authorized roles.
- Track who performed and approved each adjustment.
- Prevent adjustments from producing invalid balances.
- Preserve audit records.

## 12.6 Expenses

**Collection:** `expenses`
**Status:** PROPOSED

Purpose: Tracks authorized academy operating expenses.

Potential fields:

- _id
- branchId
- category
- amountMinor
- currency
- description
- expenseDate
- createdBy
- approvedBy
- status
- createdAt
- updatedAt

TBD:

- Expense approval hierarchy.
- Category system.
- Attachment requirements.
- Branch versus academy-wide expenses.

---

# 13. Demo Classes

**Collection:** `demoClasses`
**Status:** PROPOSED

Purpose: Tracks demo registrations and scheduled trial sessions.

Proposed fields:

- _id
- branchId
- applicantName or linked studentId
- guardianContact
- courseId
- batchId
- teacherUserId
- scheduledAt
- status
- outcome
- convertedAdmissionId
- createdAt
- updatedAt

### Rules

- Demo registration is not automatically an enrollment.
- Conversion to admission must not create duplicate applications.
- Teacher assignments and branch access must be validated.
- Schedule conflicts should follow approved rules.

---

# 14. Assets

**Collection:** `assets`
**Status:** PROPOSED

Purpose: Stores academy asset records.

Proposed fields:

- _id
- branchId
- assetCode
- name
- category
- description
- condition
- location
- purchaseDate
- purchaseAmountMinor
- assignedTo
- status
- createdAt
- updatedAt

### Proposed Index

Unique branchId + assetCode.

### Rules

- Asset transfers between branches require controlled updates.
- Asset status changes should be recorded.
- Maintenance history may be embedded or stored separately depending on expected volume.
- Deleting an asset must not erase required financial history.

---

# 15. Settings

**Proposed Collection:** `academySettings`

Settings may alternatively be embedded in the academy document.

This is an architectural decision to finalize based on actual configuration requirements.

Potential settings include:

- Academy branding.
- Academic sessions.
- Allowed fee settings.
- Receipt settings.
- Notification preferences.
- Operational feature configuration.

### Rules

- Validate all setting values.
- Restrict sensitive setting changes.
- Avoid storing database secrets in general settings collections.
- Keep configuration changes auditable when operationally significant.

---

# 16. Audit Logs

**Collection:** `auditLogs`
**Status:** PROPOSED

Purpose: Records sensitive operations.

### Proposed Fields

- _id
- actorUserId
- branchId, where relevant
- action
- resourceType
- resourceId
- timestamp
- requestId
- metadata

### Audit Events

Examples:

- User role assignment changed.
- Branch created or deactivated.
- Staff account disabled.
- Financial discount approved.
- Invoice cancelled.
- Payment reversed.
- Sensitive configuration changed.

### Security Rules

- Audit records must not expose passwords, authentication secrets or unnecessary personal data.
- Access to audit records must be restricted.
- Audit retention requirements are TBD.
- Audit logs must not be casually editable through ordinary ERP endpoints.

---

# 17. Relationship Summary

The following cardinalities are proposed:

| Entity A | Relationship | Entity B |
|---|---|---|
| Academy | 1:N | Branch |
| Academy | 1:N | User |
| User | 1:N | UserBranchRole |
| Branch | 1:N | UserBranchRole |
| Academy | 1:N | Student |
| Student | 1:N | Admission |
| Student | 1:N | Enrollment |
| Branch | 1:N | Batch |
| Course | 1:N | Batch |
| Batch | 1:N | Enrollment |
| Batch | 1:N | Class |
| User/Teacher | 1:N | TeachingAssignment |
| Class | 1:N | Attendance |
| Enrollment | 1:N | Attendance |
| Student | 1:N | Invoice |
| Student | 1:N | Payment |
| Invoice | 1:N | PaymentAllocation, if used |
| Payment | 1:N | PaymentAllocation, if used |
| Branch | 1:N | Expense |
| Branch | 1:N | Asset |

These relationships require validation before implementation.

---

# 18. Database Indexing Strategy

**Status: PROPOSED**

Indexes must be driven by actual query requirements.

Recommended patterns:

### Branch-Scoped Queries

- `branchId`
- `branchId + status`
- `branchId + createdAt`

### Student Queries

- `academyId + studentNumber` unique.
- Other student lookup indexes based on approved search requirements.

### Enrollment Queries

- `studentId + status`
- `batchId + status`
- `branchId + status`

### Finance Queries

- `branchId + invoiceNumber` unique.
- `branchId + receiptNumber` unique.
- `branchId + receivedAt`.
- `studentId + receivedAt`.

### Authorization Queries

- `userId + branchId` unique.
- `teacherUserId + batchId`, if teaching assignments require it.

Avoid blindly adding every possible index. Indexes consume storage and add write overhead.

Verify actual query patterns and explain any index additions.

---

# 19. Referential Integrity

MongoDB does not enforce ordinary cross-collection foreign keys automatically.

The backend must enforce referential integrity through services, validation and appropriate transactions.

Required design behaviors include:

- Do not create an enrollment for a nonexistent student.
- Do not enroll a student in a nonexistent batch.
- Do not reference an inactive or unauthorized branch improperly.
- Do not create an invoice for an unrelated student/enrollment.
- Do not record attendance for an unrelated student/class.
- Do not assign a teacher to a branch or class outside their authorized scope.
- Prevent duplicate payments caused by request retries.
- Restrict destructive updates to financial records.
- Preserve referenced historical entities where required.

---

# 20. Concurrency and Transactions

**Status: PROPOSED**

The application must anticipate multiple staff users accessing the same records.

Examples:

- Two receptionists attempting to assign the last batch seat.
- Two staff members editing one student's details.
- A payment request being submitted twice.
- A user losing branch access during an active session.
- Invoice creation failing after an admission is completed.

Recommended protections:

- Appropriate database transactions for related operations.
- Version checks or optimistic concurrency where useful.
- Atomic conditional updates for capacity constraints.
- Unique indexes for duplicate prevention.
- Idempotency mechanisms for financial writes.
- Backend revalidation before writes.
- Meaningful conflict responses.

Transactions alone do not automatically solve every race condition. Business invariants must be tested under concurrent requests.

---

# 21. Security and Data Isolation

**Status: MANDATORY ARCHITECTURAL REQUIREMENT**

The backend must enforce:

- Authentication.
- Role-based authorization.
- Branch-level authorization.
- Record-level access where required.
- Input validation.
- Sensitive field filtering.
- Safe errors.
- Authorized data export.
- Auditing of sensitive operations.

Never assume a user can access a record merely because its identifier is known.

Never trust browser-selected branch identifiers without verification.

Do not expose full student, user or financial collections through unrestricted endpoints.

Frontend mock data does not provide security.

The authoritative permission rules belong in SECURITY.md.

---

# 22. Mock Data Alignment

Frontend development will precede backend integration.

To avoid unnecessary rework:

- Mock records must use stable entity types.
- IDs must be treated consistently.
- Branch and role assignments must follow the proposed relationship model.
- Shared business entities must not be duplicated independently across pages.
- Services must abstract persistence.
- Financial mock calculations must follow approved fee rules.
- Mock data must never be presented as production data.

Example conceptual student enrollment:

```json
{
  "id": "enrollment_1001",
  "studentId": "student_101",
  "branchId": "branch_1",
  "courseId": "course_fsc",
  "batchId": "batch_morning",
  "status": "active"
}
```

This is a frontend mock example, not an approved Mongoose schema.

---

# 23. Schema Evolution and Migration

Changes to approved database structures must be controlled.

Before introducing a schema change:

1. Identify affected collections.
2. Identify related API contracts.
3. Identify affected frontend mock services.
4. Assess existing records.
5. Determine backward compatibility.
6. Define migration or data transformation requirements.
7. Create appropriate tests.
8. Plan backup and rollback procedures.
9. Update ERD.md.
10. Update impacted feature tickets.

Never silently rename fields that are already used by multiple modules.

Do not run destructive migrations without explicit approval.

---

# 24. Data Retention, Archiving and Deletion

**Status: TBD**

The client must confirm retention periods and applicable operational or legal obligations.

Proposed default design rules:

- Prefer inactive/archived states where historical references must survive.
- Restrict deletion of financial and audited records.
- Support controlled deactivation of user accounts.
- Define procedures for privacy-related data correction or deletion requests.
- Ensure exports and backups follow retention requirements.
- Do not place production records in Git repositories or frontend bundles.

Actual deletion/retention policies must be approved before real-data deployment.

---

# 25. Reporting Data Integrity

Reports must derive values from authoritative collections.

Examples:

### Student Counts

Use enrollment/student status based on the report's approved definition.

### Fee Collection

Use valid payment transactions, not invoice totals.

### Outstanding Fees

Calculate from approved charges, allocations, credits and reversals.

### Branch Performance

Only include records belonging to permitted branches and reporting periods.

### Teacher Workload

Use approved teaching assignments and class records.

Avoid maintaining unrelated duplicated totals that can drift out of sync.

Materialized summaries or caches may be introduced later if necessary and appropriately maintained.

---

# 26. Database Testing Requirements

Before real backend deployment, tests must cover:

- Unique constraint enforcement.
- Invalid reference rejection.
- Cross-branch access denial.
- Multi-role assignment correctness.
- Duplicate enrollment restrictions.
- Batch capacity concurrency.
- Invoice total consistency.
- Duplicate payment prevention.
- Payment allocation integrity.
- Refund/reversal accounting.
- Unauthorized modifications.
- Audit record generation.
- Data retrieval and pagination.
- Migration compatibility.
- Backup and restore verification.

Tests must use isolated test data.

Never run destructive integration tests against production records.

---

# 27. Performance and Scalability

The proposed database should support growing academy records without premature infrastructure complexity.

Recommended practices:

- Appropriate indexes.
- Pagination for large lists.
- Projection of required fields only.
- Efficient aggregation pipelines.
- Avoiding unnecessary repeated lookups.
- Controlled embedding.
- Archiving strategies where appropriate.
- Query performance monitoring after backend deployment.

Do not introduce sharding or distributed databases without a demonstrated need.

Specific performance and capacity targets remain TBD.

---

# 28. Frontend-to-Database Data Flow

During the frontend-first phase:

```text
React Page
   |
   v
Domain Service
   |
   v
Mock Data Adapter
   |
   v
Browser Demo Storage
```

After backend integration:

```text
React Page
   |
   v
Domain Service
   |
   v
HTTP Client
   |
   v
Express API
   |
   v
Authentication + Authorization
   |
   v
Business Service
   |
   v
Mongoose Data Access
   |
   v
MongoDB
```

The frontend must not communicate directly with MongoDB.

All real data access must pass through backend-enforced validation and authorization.

---

# 29. Implementation Order

The ERD is a design specification, not approval to create all collections simultaneously.

Recommended implementation sequence:

1. Academy and Branch foundations.
2. User identities and branch-role assignments.
3. Courses, Subjects and Batches.
4. Students and Admissions.
5. Enrollments.
6. Teachers, Classes and Attendance.
7. Fee Plans and Invoices.
8. Payments and financial allocation rules.
9. Expenses.
10. Demo Classes and Assets.
11. Reports, Settings and Audit integrations.

This sequence is proposed and may be adjusted for actual approved feature dependencies.

---

# 30. Open Questions (TBD)

The following questions must be resolved before implementing their affected database modules.

### Organization and Branches

1. Can one student enroll in multiple academy branches?
2. Are course catalogs shared across branches?
3. Are fees configured globally or separately per branch?
4. Can an inactive branch retain active enrollments?

### Users and Permissions

5. Does Super Admin have global academy-level access or explicit branch assignments?
6. Can Owner access all branches or only assigned ones?
7. Can staff have more than one role within one branch?
8. What account status and password recovery rules are required?

### Students

9. What is the student identification/registration-number format?
10. Which student and guardian fields are mandatory?
11. How should duplicate student profiles be identified?
12. Should guardians have reusable independent records?

### Academic Operations

13. Can one student have multiple active enrollments?
14. What are the exact admission status transitions?
15. How should batch seat capacity and reservations work?
16. What are the attendance correction rules?
17. Are teaching assignments per subject, batch or class?

### Finance

18. Are fees monthly, course-based, installment-based or mixed?
19. Are advance payments allowed?
20. Can one payment settle multiple invoices?
21. What discounts are allowed and who approves them?
22. How are refunds and reversals approved?
23. What are the invoice and receipt numbering rules?
24. What currency and money precision rules apply?
25. How are teacher compensation and payroll handled, if included?

### Operations

26. What asset depreciation or maintenance rules are required?
27. Are file attachments required?
28. What notifications must be stored?

### Governance

29. What are the data retention requirements?
30. Who can export or delete sensitive records?
31. What are the expected student and transaction volumes?
32. What backup and recovery objectives are required?

Missing decisions must remain TBD. Do not let coding agents invent answers.

---

# 31. Documentation Relationships

This document owns database structure and entity relationships.

Related documentation:

- [Documentation Index](../00-CORE/README.md)
- [Product Requirements](../00-CORE/PRD.md)
- [System Design](../00-CORE/SYSTEM_DESIGN.md)
- [Technical Architecture](ARCHITECTURE.md)
- [Visual Design](../04-FRONTEND/DESIGN.md)
- [Security Specification](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)
- [Engineering Rules](../00-CORE/RULES.md)
- [Feature Tickets](../00-CORE/FEATURE_TICKETS.md)
- [Tasks](../00-CORE/TASKS.md)
- [Project Decisions](../00-CORE/MEMORY.md)
- [Progress](../00-CORE/PROGRESS.md)

When documents disagree, stop and report the conflict.

---

# 32. Approval and Change Control

The client has approved the general Academy ERP system proposal.

The database schema requires a separate technical review before implementation.

Any approved data-model change must be reflected in:

1. ERD.md.
2. Related technical architecture.
3. API contracts.
4. Frontend service interfaces.
5. Affected feature tickets.
6. Tests.
7. Progress and decision records.

Do not implement destructive or incompatible data changes without explicit authorization.

---

**Document Status:** DRAFT — Pending Data Model Approval

**Current Authorization:** Documentation and frontend mock-contract preparation only.

This specification does not authorize changing the existing MongoDB database, creating production Mongoose schemas or running migrations.
## F02-003 provisional mock data contract (2026-10-10)

DEMO metadata only, not an approved MongoDB schema. Version-2 envelope gains admissionCounter (last-used academy-wide safe integer). Admission id stays immutable internal ID; admissionNumber and formatted admissionId are immutable sequence metadata; studentId references its linked student. Student admissionId remains the internal admission ID. Optional admissionDisplayId is the readable reference; status/admissionId stay optional for legacy students.

New Pending admissions and Provisional students have reciprocal links in the same branch, validated before one commit. Existing unlinked admissions remain historical readable records; new admissions require students. Safe v1/v2 normalization preserves records/internal IDs and reserves existing numeric references; ambiguous data is rejected without erasure. No enrollment, finance or delete schema added.

## F02-003 approved branch numbering and deletion metadata (2026-10-10)

Latest owner scope supersedes the earlier academy-wide provisional allocation for new records. Version-2 envelope retains its historical admissionCounter and adds branchCounters[branchId] = { admission, student }, both last-used safe integers. Existing Admission display/internal IDs remain unchanged; Student gains stable studentNumber assigned within its branch. Missing legacy Student numbers are assigned deterministically above existing Student high-water. Migration reserves historical global admission high-water in each branch because deleted legacy branch provenance is unknown. Once persisted, branch counters advance independently; deleting records never decreases them.

New admission-flow pairs carry createdByAdmissionFlow=true on both records. This marker is not backfilled onto legacy records. Reciprocal internal links and matching branches are validated. Delete may remove only the admission and its marked same-branch Provisional student in one commit; unlinked admissions remove no student. Active/unknown-ownership linked students block deletion without data loss. Edit preserves sequence metadata and updates linked Provisional student name atomically. No enrollment/financial schema added; this remains provisional DEMO storage, not a production MongoDB schema.

## F02-003 latest simple legacy deletion rule (2026-10-10)

The owner's latest simple CRUD instruction SUPERSEDES the earlier requirement that both linked records carry createdByAdmissionFlow markers. A uniquely linked same-branch Provisional student may be removed atomically with its admission, including unmarked legacy pairs. Reciprocal links, branch matching, uniqueness and status are validated; ambiguous/broken/Active links are denied without a write. No unrelated records or sequence counters are removed. Existing markers remain optional historical metadata, not a deletion prerequisite. No data-reset/migration framework, production permission, backend or fees/enrollment changes. F02-003 IN_REVIEW; final 176/176 regressions PASS. [Evidence](../00-CORE/PROGRESS.md#f02-003-simple-crud-completion---legacy-deletion-correction-2026-10-10).

## F02-003 latest gapless display serial contract (2026-10-10)

Latest owner instruction SUPERSEDES earlier permanent-counter values as visible serials. A response-only projection derives independent Student displaySerial and Admission displaySerial/displayAdmissionId from complete branch insertion order, before search/filter/sort. Linked Student admissionDisplaySerialId reflects the admission's current serial. Create appends; edit retains order; deletion closes gaps; reload retains persisted array order. Projection fields are never stored or used as lookup keys.

Immutable internal id/studentId/student.admissionId foreign keys and historical admissionId/admissionNumber/studentNumber/admissionDisplayId metadata remain untouched, including legacy ADM-* internal IDs. Existing durable counters remain historical allocation metadata, not visible list positions. Admissions View distinguishes current serial from permanent reference; actions continue using internal IDs. Student serials cover all branch students, including legacy/unrelated records. No schema migration, reset, backend, production permission, fees/enrollment or new Student page. Future HTTP responses must preserve deterministic full-branch serial semantics. [Verified evidence](../00-CORE/PROGRESS.md#f02-003-gapless-branch-display-numbering-correction-2026-10-10).

## F03-001 limited directory order exception (2026-10-11)

CONFIRMED owner authorization: read-only DEMO Students Directory before F02-004; defer enrollment dependency only for listing. /students and sidebar now display saved branch students, gapless serials and linked Admission references. Missing legacy status is Active presentation only; stored records unchanged by directory reads. Existing workspace.view only; no production permissions. IN_REVIEW, acceptance pending. F02-002/F02-003 acceptance remains pending. Final 198/198 tests (19 files), lint/build and local Edge four-viewport/keyboard/admission-link/refresh/branch/logout checks PASS; actual CI/deployment/backend/formal accessibility NOT_RUN. No dependencies installed. [Full evidence](../00-CORE/PROGRESS.md#f03-001-limited-demo-students-directory-2026-10-11). Next F02-004 requires separate approval; all remaining tickets preserved.
## F02-004 approved DEMO course/batch selection (2026-10-12)

CONFIRMED scope: branch-specific mock courses retained; Course required, Batch optional; minimal batch {id, branchId, courseId, name}; same shared popup/standalone form; admission courseId and optional preferredBatchId with legacy course text retained. No automatic name-to-ID mapping. Safe additive version-3 envelope behind existing mock storage key adds minimum batches from saved courses, preserves valid records/links/counters and never reseeds existing valid batches. New/changed selections validate branch/course/batch relations atomically; unchanged legacy/unresolved references may survive unrelated edits and display explicit unresolved labels. Session/branch guards remain DEMO UX safeguards; workspace.view unchanged. No backend, permissions, fees/enrollment/schedules/capacity rules or dependencies added.

IN_REVIEW; acceptance pending. F02-002/F02-003/F03-001 also remain acceptance pending. Baseline 198/198 PASS; final 223/223 tests (21 files; 25 new), lint/build and local Edge shared popup/View/Edit/optional batch/refresh/branch/keyboard/360-768-1024-1440 checks PASS. Existing lint/bundle warnings remain; actual CI/deployment/backend/formal accessibility NOT_RUN. [Full files, libraries, migration limitations and evidence](../00-CORE/PROGRESS.md#f02-004-program-and-batch-selection-delivery-2026-10-12). Next F02-005 Admission Status Workflow needs separate owner decisions/approval; no following ticket started.
## F02-005 owner-approved DEMO status decisions (2026-10-12)

CONFIRMED owner approval: Pending -> Approved/Rejected only, explicit confirmation, same-status idempotency, no opposite transitions/reopening; canonical active-branch Owner/Super Admin only (any approved eligible role membership, never dashboard preview authority). Unique reciprocal same-branch linked Provisional student required; legacy unlinked/unsafe records refuse without changes. Student remains Provisional. Optional rejection reason; status plus append-only actor/time history committed atomically. Decided admissions, including existing Approved/Rejected records, are read-only and cannot be physically deleted. These latest rules supersede prior generic Edit/Delete availability for decided DEMO records only; existing comments/history preserved. workspace.view remains sole production-independent demo baseline, no real permission grant/bypass/backend change.

Implemented IN_REVIEW; acceptance pending, as are F02-002/F02-003/F02-004/F03-001. Existing version-3 storage accepts optional embedded statusHistory without reset/backfill; current identity/branch and policy validated at service/database boundaries, stale/conflicting operations fail without writes. Final 248/248 tests (23 files; 25 new), lint/build and local Edge status/keyboard/four-viewport/persistence checks PASS; existing warnings remain. Actual CI/deployment/backend/formal accessibility NOT_RUN. [Exact files/libraries/history contract/evidence](../00-CORE/PROGRESS.md#f02-005-admission-status-workflow-delivery-2026-10-12). Next F02-006 Admission-to-Enrollment Mock Integration requires separate scope and owner approval. Stop after F02-005.
