# Database

<!-- > **Purpose:** Placeholder for the future approved MongoDB/Mongoose implementation specification. -->

# TSA Academy ERP — Database Architecture & MongoDB Specification

**Document:** DATABASE.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Status:** DRAFT — Proposed Database Design, Not Implemented
**Database:** MongoDB
**ODM:** Mongoose
**Backend:** Node.js + Express.js
**Architecture:** Modular Monolith
**Initial Scope:** One academy organization with multiple branches
**Document Owner:** Backend Database Design
**Last Updated:** 2026-10-23

---

## 1. Purpose

This document defines the proposed production database architecture for TSA Academy ERP.

The database must securely persist the academic, administrative, financial and operational information currently handled by the frontend's browser-local mock database.

The purpose is to establish consistent rules for:

- MongoDB collections and Mongoose schemas.
- Entity identities and relationships.
- Organization and branch isolation.
- Data ownership and role-based access.
- Financial and salary calculations.
- Referential integrity.
- Database transactions.
- Concurrency and duplicate prevention.
- Indexing and query performance.
- Audit logging.
- Data migration and backward compatibility.
- Backup, recovery and data protection.

The backend must preserve existing approved frontend workflows rather than inventing alternative business behavior.

**Important:** This document describes a proposed database design. It does not authorize creating MongoDB collections, executing migrations or changing application source code.

---

## 2. Database Technology and Architecture

The approved technology stack is:

| Component | Technology |
|---|---|
| Primary database | MongoDB |
| Object Document Mapper | Mongoose |
| Backend runtime | Node.js |
| HTTP framework | Express.js |
| Backend architecture | Modular monolith |
| Frontend | React + Vite |
| Current demo persistence | Browser localStorage |
| Future authoritative persistence | MongoDB |

### General Design Rules

1. Keep business data authoritative on the backend.
2. Use stable identifiers for every persistent entity.
3. Store references between related business records.
4. Preserve historical financial records.
5. Use strict server-side validation.
6. Enforce organization and branch ownership.
7. Protect sensitive data through authenticated access.
8. Prevent duplicate financial transactions.
9. Maintain consistency between related collections.
10. Introduce collections only when their associated backend modules are approved for implementation.

Do not automatically create every proposed collection.

---

## 3. Database Architecture

```text
React Frontend
      |
      v
Frontend Domain Services
      |
      v
HTTP API Adapter
      |
      v
Express API
      |
      v
Authentication & Authorization
      |
      v
Domain Business Services
      |
      v
Repository Layer
      |
      v
Mongoose Models
      |
      v
MongoDB
```

### Responsibilities

| Layer | Purpose |
|---|---|
| API routes | Define resource endpoints and middleware. |
| Controllers | Handle HTTP request and response processing. |
| Validation | Validate incoming request data. |
| Domain services | Enforce business workflows and transactions. |
| Repositories | Execute authorized database queries and writes. |
| Mongoose models | Define collections, schemas and database constraints. |
| MongoDB | Persist authoritative academy records. |

Repositories must not independently change business rules.

Business services must coordinate related writes and validate important cross-collection relationships.

---

## 4. Organization and Branch Model

### 4.1 Organization

**Proposed collection:** `organizations`

Represents the academy organization that owns branches and operational data.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Stable organization identifier |
| `name` | Academy name |
| `status` | Organization status |
| `settings` | Approved organization-level configuration |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last modification timestamp |

The initial application supports one academy organization.

The architecture may retain an organization identifier for data ownership and future extensibility, but no Platform Admin, tenant subscription or multi-client provisioning workflow is authorized.

### 4.2 Branches

**Proposed collection:** `branches`

Represents individual academy branches.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Branch identifier |
| `organizationId` | Owning organization |
| `code` | Stable branch code |
| `name` | Branch display name |
| `status` | Current branch status |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last modification timestamp |

### Branch Integrity Rules

- Branch codes must be unique within the organization.
- All branch-scoped records must reference an authorized existing branch.
- Inactive branches must follow the approved activity restrictions.
- Branch deactivation cannot silently delete records.
- Branch deletion must follow existing frontend safeguards.
- New branch creation remains paused until explicitly reauthorized.
- Historical records must preserve their original branch ownership.

An authenticated user selecting a branch does not automatically receive access to it.

---

## 5. Users, Roles and Session Data

### 5.1 Users

**Proposed collection:** `users`

Stores academy staff identities and account information.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | User identifier |
| `organizationId` | Organization ownership |
| `fullName` | Staff member name |
| `emailNormalized` | Normalized login email |
| `passwordHash` | Securely stored password hash |
| `status` | Active or disabled status |
| `createdAt` | Creation timestamp |
| `updatedAt` | Modification timestamp |

Never store plaintext passwords.

Never expose password hashes in standard API responses.

### 5.2 Branch Role Assignments

**Proposed collection:** `branchRoleAssignments`

Stores staff membership and role assignments for academy branches.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Assignment identifier |
| `organizationId` | Organization ownership |
| `userId` | Assigned staff member |
| `branchId` | Assigned branch |
| `roles` | Role identifiers |
| `status` | Assignment status |
| `createdAt` | Creation timestamp |
| `updatedAt` | Modification timestamp |

### Five Approved Roles

- Super Admin
- Admin
- Receptionist
- Owner
- Teacher

A user may belong to multiple branches with different effective roles.

The current frontend fails closed for unsupported multiple-role combinations within the same branch. The backend must not introduce an unapproved role-combination strategy.

### 5.3 Sessions

**Proposed collection:** `sessions`

Stores or supports secure server-side authentication sessions if the approved session architecture uses MongoDB-backed sessions.

Suggested information:

- User reference.
- Session identifier digest or appropriate secure reference.
- Creation time.
- Last activity.
- Expiration.
- Revocation metadata.

Do not store plaintext session credentials unnecessarily.

The exact session storage mechanism remains subject to `SECURITY.md`.

---

## 6. Database Collection Inventory

The following collections are proposed from the existing frontend workflows and backend handoff analysis.

| Domain | Proposed collection | Purpose |
|---|---|---|
| Organization | `organizations` | Academy identity |
| Branches | `branches` | Branch information |
| Users | `users` | Staff accounts |
| Authorization | `branchRoleAssignments` | Branch-specific roles |
| Authentication | `sessions` | Server-managed sessions |
| Students | `students` | Student profiles |
| Admissions | `admissions` | Admission records |
| Enrollments | `enrollments` | Student enrollment records |
| Academics | `courses` | Course catalog |
| Academics | `batches` | Teaching batches |
| Academics | `subjects` | Academic subjects |
| Academics | `streams` | Academic streams |
| Faculty | `facultyAssignments` | Teacher teaching assignments |
| Classes | `classes` | Class schedules or records |
| Fees | `challans` | Student fee obligations |
| Fees | `feePayments` | Recorded student fee payments |
| Finance | `expenses` | Operational and payroll-related expenses |
| Payroll | `salaryAgreements` | Assignment salary agreements |
| Payroll | `payrollObligations` | Running salary obligations |
| Payroll | `payrollPayments` | Salary payment history |
| Demo Classes | `demoInquiries` | Trial/demo student inquiries |
| Assets | `assets` | Physical academy inventory |
| Assets | `assetEvents` | Assignment, inspection and maintenance history |
| Settings | `settings` | Approved academy/branch preferences |
| Notifications | `notifications` | Authorized user notifications |
| Audit | `auditEvents` | Sensitive operation history |
| Infrastructure | `idempotencyRecords` | Duplicate request protection |

All collection names are **PROPOSED**.

Actual Mongoose schemas and indexes must be finalized after verifying relevant frontend records and the approved ERD.

Derived data such as receipts, report summaries and dashboards does not automatically require a separate collection.

---

## 7. Students

**Proposed collection:** `students`

### Purpose

Stores student identities and approved student profile information.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Stable student identifier |
| `organizationId` | Organization ownership |
| `branchId` | Branch scope, where required by actual student contract |
| `fullName` | Student name |
| `studentNumber` | Stable internal student reference |
| `status` | Student status |
| `contactDetails` | Approved contact information |
| `createdAt` | Creation timestamp |
| `updatedAt` | Modification timestamp |

### Important Rules

- Use stable internal student identifiers.
- Preserve connections to Admissions and Enrollments.
- Do not delete financial history when a student record is edited.
- Prevent unauthorized cross-branch access.
- Verify student identity/branch cardinality against current frontend behavior before final schema approval.

### Display Serial Numbers

The existing frontend uses branch-scoped gapless display serial numbers.

Display serial numbers may change after record deletion or reordering under the approved presentation rules.

**Never use display serials as permanent database primary keys or foreign keys.**

Stable internal IDs must remain authoritative.

---

## 8. Admissions

**Proposed collection:** `admissions`

### Purpose

Stores admissions, their academic selections, statuses and relationships.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Admission identifier |
| `organizationId` | Organization ownership |
| `branchId` | Admission branch |
| `studentId` | Linked student |
| `courseId` | Selected course |
| `batchId` | Selected/preferred batch where applicable |
| `status` | Current admission status |
| `createdAt` | Creation timestamp |
| `updatedAt` | Modification timestamp |

Additional actual admission form fields and historical metadata must be derived from the frontend source.

### Required Relationships

```text
Admission
   |
   +--> Student
   |
   +--> Course
   |
   +--> Batch
   |
   +--> Enrollment
```

### Integrity Rules

- Validate course, batch and branch references.
- Prevent invalid or duplicate enrollment.
- Preserve approved admission status transitions.
- Guard deletion when linked records or financial obligations exist.
- Maintain stable internal identifiers.
- Preserve branch-scoped display serial behavior.

### Instant Admission Completion

The completed frontend supports a workflow that may create:

1. Student.
2. Admission.
3. Enrollment.
4. Challan.
5. Optional Verified Fee Payment.

These changes must be coordinated safely when implemented in MongoDB.

Do not permit partial successful admissions with inconsistent linked financial records.

---

## 9. Enrollments

**Proposed collection:** `enrollments`

### Purpose

Represents a student's enrollment in a course and batch.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Enrollment identifier |
| `organizationId` | Organization ownership |
| `branchId` | Enrollment branch |
| `studentId` | Enrolled student |
| `admissionId` | Source admission |
| `courseId` | Selected course |
| `batchId` | Selected batch |
| `status` | Enrollment status |
| `enrolledAt` | Enrollment timestamp |

### Constraints

- Referenced Student, Admission, Course and Batch must exist.
- The selected Batch must belong to the permitted Course and Branch.
- Enrollment capacity rules must be enforced.
- Duplicate enrollment attempts must be prevented.
- Historical enrollment relationships must be preserved.
- One enrollment must not accidentally generate duplicate challans.

Exact uniqueness/cardinality rules must match the verified frontend workflow.

---

## 10. Courses, Batches, Subjects and Streams

### 10.1 Courses

**Collection:** `courses`

Stores courses and approved course-level fee settings.

Course identity must be independent of the course display name.

### 10.2 Batches

**Collection:** `batches`

Stores teaching groups associated with courses and branches.

Important information includes:

- Organization.
- Branch.
- Course.
- Batch name/code.
- Capacity.
- Approved status and schedule fields.

### 10.3 Subjects

**Collection:** `subjects`

Stores teaching subjects and their approved academic/fee associations.

### 10.4 Streams

**Collection:** `streams`

Stores approved academic streams or program subdivisions.

### Academic Integrity Rules

- Preserve valid Course → Batch relationships.
- Validate branch associations.
- Prevent invalid subject/course relationships.
- Preserve existing fee calculation behavior.
- Respect configured capacity and duplicate restrictions.
- Avoid deleting referenced historical academic records.

The exact pricing schema must be derived from the existing frontend's actual course-fee and selected-subject-fee behavior.

---

## 11. Faculty and Teaching Assignments

**Proposed collection:** `facultyAssignments`

### Purpose

Connects an authorized Teacher to assigned academic responsibilities.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Faculty assignment identifier |
| `organizationId` | Organization ownership |
| `branchId` | Assigned branch |
| `teacherUserId` | Assigned teacher |
| `courseId` | Assigned course |
| `batchId` | Assigned batch |
| `subjectId` | Assigned subject |
| `schedule` | Approved teaching schedule |
| `status` | Assignment status |
| `createdAt` | Creation timestamp |
| `updatedAt` | Modification timestamp |

### Rules

- Teacher must be a valid authorized staff member.
- Related course, batch and subject must be valid.
- Assignment conflicts must be prevented according to approved frontend rules.
- Teacher self-service queries must filter using authenticated teacher identity.
- Salary agreements must reference valid faculty assignments.
- Old assignment records required by salary history must not disappear when a new batch begins.

---

## 12. Classes and Timetables

**Proposed collection:** `classes`

### Purpose

Supports approved classes, teaching schedules and assignment-related timetable information.

Suggested relationships:

```text
Teacher
   |
Faculty Assignment
   |
   +--> Course
   +--> Batch
   +--> Subject
   |
   v
Class Schedule
```

### Rules

- Class records must belong to the authorized branch.
- Scheduling must respect existing assignment restrictions.
- Teacher can access only permitted own class records.
- Do not fabricate attendance records or class-session collections that are not required by the implemented frontend.
- Preserve the Teacher My Profile timetable and printable views.

Attendance functionality beyond the current verified implementation requires separate approval.

---

## 13. Student Fees and Challans

**Proposed collection:** `challans`

### Purpose

Stores student fee obligations associated with enrollment.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Challan identifier |
| `organizationId` | Organization ownership |
| `branchId` | Owning branch |
| `enrollmentId` | Related enrollment |
| `studentId` | Related student |
| `amount` | Exact payable amount |
| `status` | Challan state |
| `createdAt` | Creation timestamp |

### Required Rules

- Preserve the current one-challan-per-enrollment behavior.
- Validate the related student/enrollment relationship.
- Preserve approved fee calculation.
- Do not duplicate challans for the same enrollment.
- Derive paid and outstanding balances consistently.
- Prevent unauthorized edits to settled financial obligations.
- Use exact monetary representation.

The frontend's term **Challan** must not be silently replaced with an incompatible generic invoice workflow.

---

## 14. Fee Payments

**Proposed collection:** `feePayments`

### Purpose

Stores recorded student fee transactions and their verification status.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Payment identifier |
| `organizationId` | Organization ownership |
| `branchId` | Branch ownership |
| `challanId` | Related challan |
| `studentId` | Student reference |
| `amount` | Payment amount |
| `method` | Approved payment method |
| `reference` | Payment reference |
| `status` | Verification/payment status |
| `recordedBy` | Authorized staff user |
| `createdAt` | Transaction timestamp |

### Financial Integrity

- Payment amount must be valid and positive.
- Support approved partial payments.
- Only Verified payments count as collected revenue.
- Do not accept payments exceeding permitted outstanding fees.
- Prevent accidental duplicate transactions.
- Preserve payment history.
- Receipts must reference the corresponding recorded payments.
- Finance and Reports must use the same verified payment source.

### Receptionist Access

Receptionist has owner-approved full access to the existing Fees module.

This allows approved challan and payment workflows but does not grant access to independent Finance, Expenses or Teacher Payroll operations.

---

## 15. Finance and Expenses

**Proposed collection:** `expenses`

### Purpose

Stores operational expenses and salary-related posted expenses.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Expense identifier |
| `organizationId` | Organization ownership |
| `branchId` | Expense branch |
| `category` | Approved expense category |
| `amount` | Expense amount |
| `description` | Approved transaction description |
| `status` | Posting status |
| `sourceType` | Manual expense or related approved source |
| `sourceId` | Linked source transaction where applicable |
| `createdBy` | Authorized actor |
| `createdAt` | Creation timestamp |

The `sourceType` and `sourceId` fields are proposed mechanisms for preventing duplicated linked expense records.

### Finance Calculation Direction

```text
Verified Fee Payments
          |
          v
       Revenue

Posted Operating Expenses
          +
Posted Payroll Expenses
          |
          v
       Expenses

Revenue - Expenses = Net Position
```

The actual frontend finance projection must be preserved.

Do not introduce a new accounting method or expense reversal lifecycle without approval.

---

## 16. Teacher Payroll — Assignment-Based Running Balance

**Status:** CONFIRMED BUSINESS MODEL

Teacher salary is based on the assigned teaching responsibility, not automatic calendar-month salary generation.

The database must support independent salary obligations for separate approved teaching assignments.

### 16.1 Salary Agreements

**Proposed collection:** `salaryAgreements`

Purpose: Records the remuneration agreement associated with a faculty assignment.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Agreement identifier |
| `organizationId` | Organization ownership |
| `branchId` | Branch |
| `facultyAssignmentId` | Linked faculty assignment |
| `teacherUserId` | Teacher |
| `method` | Existing Fixed or Percentage method |
| `agreedTerms` | Verified agreement parameters |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last authorized revision |

### 16.2 Payroll Obligations

**Proposed collection:** `payrollObligations`

Purpose: Represents the running amount payable against an approved faculty assignment.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Obligation identifier |
| `organizationId` | Organization ownership |
| `branchId` | Branch |
| `facultyAssignmentId` | Assignment |
| `salaryAgreementId` | Salary agreement |
| `teacherUserId` | Teacher |
| `payableAmount` | Total currently agreed payable |
| `status` | Running settlement status |
| `updatedAt` | Last change |

The exact persistence strategy for payable amount versus computed projection must be finalized to avoid duplicate sources of truth.

### 16.3 Payroll Payments

**Proposed collection:** `payrollPayments`

Purpose: Stores individual verified salary disbursements.

Suggested fields:

| Field | Description |
|---|---|
| `_id` | Payroll payment identifier |
| `organizationId` | Organization ownership |
| `branchId` | Branch |
| `payrollObligationId` | Settled obligation |
| `teacherUserId` | Teacher |
| `amount` | Disbursed amount |
| `paymentMethod` | Approved payment method |
| `reference` | Stable payment reference |
| `status` | Payment status |
| `createdAt` | Payment timestamp |

### 16.4 Running Balance

The logical relationship is:

```text
Faculty Assignment
        |
        v
Salary Agreement
        |
        v
Running Payroll Obligation
        |
        +--> Payroll Payment 1
        +--> Payroll Payment 2
        +--> Payroll Payment 3
        |
        v
Remaining Outstanding Balance
```

**Conceptual invariant:**

```text
Outstanding Amount =
Current Payable Amount
- Valid Applied Salary Payments
```

Actual terms, computation, revisions and rounding must follow the verified frontend implementation.

### 16.5 Payroll Rules

1. One assignment's balance must remain independent of another assignment.
2. Starting a new month must not generate another salary obligation.
3. A new batch/subject teaching assignment may establish an independent salary agreement.
4. Partial and full salary payments must be supported.
5. Payment history must remain preserved.
6. An old batch ending must not automatically clear unpaid outstanding salary.
7. New salary agreements must not overwrite previous assignment records.
8. A payment must not be applied to an unrelated assignment.
9. Overpayments must be rejected under the current frontend restrictions.
10. Salary payment and associated posted expense must remain consistent.
11. Authorized reports must include the appropriate outstanding amounts.
12. Teacher self-profile must display only that teacher's compensation.

### 16.6 Formula Verification

Before finalizing the salary schema or calculation:

Verify actual frontend logic in:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`
- Relevant salary calculation and agreement tests.

**Never invent the Fixed or Percentage calculation formula.**

### 16.7 No Monthly Payroll Generator

Do not create:

- Monthly payroll generation jobs.
- Automatic new-month salary obligations.
- Unapproved advance/adjustment workflows.
- Automatic historical settlement.
- New payment logic that modifies prior agreements incorrectly.

### 16.8 Payroll and Finance Transaction

A valid salary disbursement must coordinate:

```text
Authorized Payroll Payment
           |
           v
Validate Assignment & Outstanding
           |
           v
Record Payroll Payment
           |
           v
Create Matching Posted Expense
           |
           v
Update Financial Projections
           |
           v
Record Required Audit Event
```

The durable payment and expense records must be transactionally consistent. Derived reports should query authoritative records or use correctly invalidated projections.

---

## 17. Teacher My Profile Data Access

Teacher self-service is an approved frontend feature.

The database must support queries for the authenticated teacher's own:

- Profile and bio.
- Classes and timetable.
- Courses, batches and subjects.
- Approved student/teaching relationships.
- Salary agreements.
- Running remuneration obligations.
- Verified salary payments.
- Outstanding balances.
- Payslips.
- Notifications.

### Mandatory Data Security

- Derive teacher identity from the authenticated session.
- Never accept arbitrary teacher identity as self-access authority.
- Enforce assignment ownership on all linked academic records.
- Filter payroll records by authenticated teacher identity and authorized scope.
- Never expose another teacher's salary.
- Do not grant teachers general Payroll Management or Finance access.

Payslips may be generated from payment records rather than saved as separate MongoDB documents.

---

## 18. Demo Classes

**Proposed collection:** `demoInquiries`

### Purpose

Stores prospective student trial/demo inquiries and their approved statuses.

Suggested relationships:

```text
Demo Inquiry
      |
      +--> Course / Batch Interest
      |
      +--> Trial Attendance Outcome
      |
      v
Optional Admission Conversion
      |
      v
Admission
```

### Rules

- Validate current branch ownership.
- Preserve the original inquiry.
- Prevent duplicate conversion.
- Preserve links to the created admission.
- Follow actual frontend attendance/cancellation states.
- Do not create unsupported scheduling structures.

---

## 19. Physical Assets and Inventory

**Proposed collections:**

- `assets`
- `assetEvents`

### Purpose

Manage physical academy property such as furniture, computers, projectors and equipment.

### Asset Fields

Suggested information:

- Organization and branch.
- Stable asset identifier/code.
- Name and category.
- Condition.
- Status.
- Location.
- Assignment relationship.
- Approved acquisition information.

### Asset Events

May include approved:

- Assignments and unassignments.
- Inspections.
- Maintenance entries.
- Historical status changes.

### Explicit Scope Restriction

The Assets module is **not** a digital-media management system.

Do not implement:

- Image uploads.
- Video uploads.
- Cloudinary storage.
- Media galleries.
- Automatic media database collections.

Existing static academy branding assets may remain in the frontend.

Future Cloudinary/media support requires separate owner approval.

---

## 20. Settings

**Proposed collection:** `settings`

The schema may store approved organization- or branch-specific settings.

Potential data includes:

- Academy display name.
- Branch profile details.
- Theme configuration.
- Approved operational settings.
- Payroll availability configuration.

Settings must not contain production database passwords, secret tokens or private application credentials.

Separate organization-level values from branch-level overrides.

Do not invent additional settings not supported by existing frontend behavior.

---

## 21. Notifications

**Proposed collection:** `notifications`

### Purpose

Stores relevant authenticated-user notifications if persistence is required by the approved backend workflow.

The frontend currently includes salary-payment notification behavior.

A proposed notification record may include:

- Organization.
- Branch where applicable.
- Recipient user.
- Notification type.
- Related resource reference.
- Message metadata.
- Read status.
- Timestamp.

### Rules

- Only the intended recipient may access personal notifications.
- Never expose another teacher's compensation in notification content.
- Notifications must not be used as the authoritative financial transaction record.
- Do not introduce email, SMS or third-party messaging integrations without separate approval.

---

## 22. Audit Events

**Proposed collection:** `auditEvents`

### Purpose

Stores security-relevant and sensitive operational history.

Suggested fields:

| Field | Purpose |
|---|---|
| `_id` | Audit event identifier |
| `organizationId` | Owning organization |
| `branchId` | Relevant branch |
| `actorUserId` | Performing user |
| `action` | Recorded action |
| `resourceType` | Affected resource |
| `resourceId` | Resource identifier |
| `occurredAt` | Timestamp |
| `requestId` | Correlation reference |
| `metadata` | Approved safe metadata |

### Rules

- Production audit logs should be append-only through controlled backend operations.
- Normal users must not edit or delete audit events.
- Do not store plaintext passwords, cookies or secrets.
- Limit exposure of confidential student/staff information.
- Record sensitive financial, role and administrative changes.
- Preserve audit history after ordinary account deactivation.

Audit retention and archival policy remain TBD.

---

## 23. Referential Integrity

MongoDB does not automatically enforce cross-collection foreign-key relationships.

Backend services must verify referenced records and ownership.

Examples:

- Admission references an existing Student where required.
- Enrollment references valid Student, Course and Batch records.
- Challan references its correct Enrollment.
- Fee Payment references its actual Challan.
- Faculty Assignment references a valid Teacher and academic records.
- Salary Agreement references its correct Faculty Assignment.
- Payroll Payment references its correct Payroll Obligation.
- Payroll-linked Expense references the actual Salary Payment.
- Demo conversion references its resulting Admission.
- Asset assignment references an allowed staff member.

Important relationships must be checked within appropriate transaction boundaries.

Do not assume matching ID values alone prove authorization.

---

## 24. Indexing Strategy

Indexes must be selected based on actual query patterns.

### Suggested Index Categories

| Domain | Candidate index |
|---|---|
| Branches | `organizationId + code` unique |
| Users | Normalized login email unique within approved identity scope |
| Role assignments | `organizationId + userId + branchId` |
| Students | Organization/branch and searchable identifiers |
| Admissions | `organizationId + branchId + status + createdAt` |
| Enrollments | Student, course, batch and applicable uniqueness conditions |
| Batches | Branch/course and approved uniqueness rules |
| Faculty assignments | Branch/teacher/batch/subject associations |
| Challans | Unique enrollment reference under approved contract |
| Fee payments | Branch, challan and transaction reference |
| Salary agreements | Faculty assignment and approved revision scope |
| Payroll obligations | Faculty assignment/agreement relationship |
| Payroll payments | Obligation, teacher and unique payment reference |
| Expenses | Branch, posting date and source reference |
| Assets | Branch + asset code unique |
| Audit events | Organization/branch, actor and timestamp |

### Index Rules

- Prefer compound indexes aligned with organization and branch isolation.
- Define unique constraints for actual business invariants.
- Do not create speculative indexes without a query need.
- Validate existing records before introducing unique indexes.
- Explain added indexes in the implementing ticket.
- Verify performance using realistic queries.

Index definitions remain proposed until schemas and operations are approved.

---

## 25. Database Transactions

MongoDB transactions must be used for workflows requiring multiple related durable writes.

### Proposed Transaction Boundaries

| Workflow | Required consistency |
|---|---|
| Instant admission completion | Student, Admission, Enrollment, Challan and optional Payment |
| Enrollment and challan creation | Correct links and no duplicate challans |
| Fee collection | Payment and related transaction state |
| Payroll disbursement | Payroll Payment and matching Posted Expense |
| Demo conversion | Inquiry conversion state and new Admission |
| Certain user/branch changes | Related assignment updates and audit metadata |

### Transaction Rules

- Reject partial financial outcomes.
- Validate branch and user authorization before and during sensitive operations as needed.
- Use atomic conditional updates for race-sensitive rules.
- Use appropriate session/transaction boundaries.
- Preserve record history where required.
- Avoid sending irreversible external side effects inside retried database transactions.
- Return meaningful conflict information.

Multi-document MongoDB transactions require a suitable transaction-capable deployment, such as a replica set or sharded cluster.

---

## 26. Concurrency and Idempotency

The production ERP may have multiple staff members updating the same records.

Potential conflicts include:

- Two users enrolling the last available batch seat.
- Duplicate admission completion requests.
- Two payments against the same outstanding challan.
- Two payroll payments against the same remaining salary.
- Concurrent salary agreement revisions.
- Simultaneous branch/user permission changes.

### Requirements

1. Prevent invalid duplicate business records.
2. Use database uniqueness constraints where applicable.
3. Support idempotency for sensitive writes.
4. Use version checks or conditional updates where appropriate.
5. Detect stale updates.
6. Enforce financial limits under concurrent requests.
7. Record actual request outcomes consistently.

**Proposed collection:** `idempotencyRecords`

Its key must be scoped to the authenticated actor, organization, relevant branch and operation.

Do not treat idempotency as a replacement for authorization, schema validation or transaction integrity.

---

## 27. Monetary Precision

Financial values must be stored and calculated without uncontrolled floating-point inaccuracies.

**Proposed approach:** Integer minor units or another approved exact-decimal representation.

Applies to:

- Course fees.
- Subject fees.
- Challans.
- Student payments.
- Discounts if later approved.
- Expenses.
- Salary agreements.
- Payroll obligations.
- Payroll payments.
- Financial summaries.

### Required Approval Before Implementation

- Supported currency.
- Decimal precision.
- Rounding strategy.
- Frontend compatibility format.
- Fixed/Percentage salary formula.
- Handling of historical mock financial values.

The backend must preserve approved visible financial calculations.

Do not silently round, truncate or recalculate values differently from the current frontend.

---

## 28. Date and Time Handling

The system operates in Pakistan and must correctly distinguish calendar dates from event timestamps.

### Proposed Approach

- Store event timestamps consistently in UTC.
- Display applicable dates/times using the approved academy time zone.
- Use `Asia/Karachi` as the proposed business time zone.
- Represent date-only values separately from timestamps.
- Handle scheduling and financial report periods consistently.
- Do not assume UTC midnight represents the same local business date.

Exact business-date policies must be finalized before implementation.

---

## 29. Data Security and Isolation

Production database access must enforce:

- Authenticated organization ownership.
- Authorized branch scope.
- Role/action permission.
- Record-level ownership.
- Teacher self-only access.
- Financial record restrictions.
- Sensitive field filtering.
- Safe error handling.
- Protected exports.
- Audit of sensitive operations.

### Mandatory Rules

- Never expose MongoDB directly to the browser.
- Never trust client-submitted organization IDs as authority.
- Never trust branch IDs without checking membership and record ownership.
- Never use arbitrary unscoped `findById` results as proof of access.
- Never allow users to change protected role or finance fields through mass assignment.
- Never log database connection secrets.

Frontend mock guards are not production authorization controls.

---

## 30. Reporting Data Integrity

Reports must use authoritative business records.

### Important Derived Values

| Report | Source |
|---|---|
| Active Students | Student/Enrollment records |
| Admission Counts | Admissions |
| Batch Enrollment | Enrollments |
| Fee Collection | Verified Fee Payments |
| Outstanding Fees | Challans and valid applied payments |
| Operating Expenses | Posted Expenses |
| Teacher Salary Payable | Approved assignment remuneration |
| Teacher Salary Paid | Valid Payroll Payments |
| Teacher Salary Outstanding | Running obligations minus valid payments |
| Net Financial Position | Verified collections minus posted expenses |

Avoid storing duplicate totals that can drift from their source records.

If materialized summaries or caches are introduced later, define explicit invalidation and reconciliation behavior.

---

## 31. Migration From Frontend Mock Storage

The existing frontend uses browser-local mock data.

MongoDB integration must not assume that every browser contains identical records.

### Migration Planning Requirements

1. Inspect current frontend mock schema and version.
2. Identify authoritative entities and IDs.
3. Identify optional legacy fields.
4. Verify student/admission/enrollment relationships.
5. Verify challan and payment history.
6. Verify faculty assignments.
7. Verify salary agreements and running payroll records.
8. Identify duplicate or inconsistent records.
9. Define controlled import and mapping rules.
10. Define backup and rollback procedures.
11. Obtain explicit approval before real data migration.

### Important

Do not silently upload localStorage data into MongoDB.

Do not reset or overwrite the frontend's existing user-edited demo records without approval.

Do not rewrite historical salary obligations during migration.

Actual migration is a separate, approved development task.

---

## 32. Data Retention and Deletion

The backend must distinguish between safe deletable records and records whose history must be preserved.

### Rules

- Keep financial transaction history unless an approved retention policy states otherwise.
- Restrict deletion of referenced enrollments and payments.
- Preserve payroll payment history.
- Prevent deleting teacher records in ways that destroy linked compensation information.
- Preserve relevant audit records.
- Use controlled inactive/archived states when appropriate.
- Follow existing frontend's guarded branch deletion behavior.

Final retention periods, archival processes and privacy-deletion mechanisms remain TBD.

---

## 33. Backup, Restore and Recovery

Production database deployments must use an approved backup strategy.

Requirements include:

- Backup schedule.
- Backup retention.
- Secure backup storage.
- Restricted restore permissions.
- Tested restore procedures.
- Recovery Point Objective (RPO).
- Recovery Time Objective (RTO).
- Monitoring of backup failures.

Do not claim the system has verified disaster recovery until actual restore tests have been completed.

---

## 34. Performance and Scalability

Use a practical architecture suitable for the current academy while supporting future growth.

### Requirements

- Efficient branch-scoped queries.
- Bounded pagination.
- Selective projections.
- Appropriate indexes.
- Avoiding N+1 query patterns.
- Reasonable aggregation pipelines.
- Controlled data loading.
- Query profiling when performance problems appear.
- Limited duplication of authoritative records.

Do not introduce sharding, distributed databases or unnecessary caching infrastructure without a demonstrated need.

Redis is optional future infrastructure, not a current requirement.

---

## 35. Database Testing Requirements

Future database implementation tickets must test:

### Structure and Relationships

- Schema validation.
- Required references.
- Invalid identifiers.
- Unique constraints.
- Organization and branch ownership.
- Student/admission/enrollment consistency.

### Financial Integrity

- Challan uniqueness.
- Verified payment totals.
- Duplicate payment prevention.
- Partial payment handling.
- No overpayment.
- Payroll calculation compatibility.
- Separate assignment salary obligations.
- Preserved historical outstanding balances.
- Payroll payment/expense atomicity.

### Security

- Cross-branch access denial.
- Unauthorized record access.
- Teacher self-only salary reads.
- Receptionist full Fees/Admissions authorization.
- Forbidden financial and administrative operations.
- Role assignment restrictions.

### Concurrency and Recovery

- Simultaneous enrollment.
- Simultaneous payment.
- Stale updates.
- Transaction rollback.
- Idempotent repeated requests.
- Migration validation.
- Backup/restore verification when deployed.

Tests must use isolated test data and must never destructively operate on production records.

---

## 36. Implementation Responsibilities

Database implementation must be incremental.

Suggested sequence:

1. Database connection and configuration.
2. Organization/Branch/User/Role foundation.
3. Academic reference collections.
4. Students and Admissions.
5. Enrollments.
6. Challans and Fee Payments.
7. Faculty Assignments and Classes.
8. Salary Agreements, Running Obligations and Payroll Payments.
9. Expenses and financial integrity.
10. Demo Inquiries, Assets, Reports, Settings, Notifications and Audit.
11. Index review, integration tests and data migration preparation.

Each collection must be introduced through a separately approved module ticket.

Do not create all Mongoose schemas merely because they are listed in this document.

---

## 37. Open Technical and Business Decisions

The following must be resolved before affected implementation:

- Final collection naming conventions.
- Exact source-to-schema field mapping.
- Stable frontend ID and MongoDB ObjectId strategy.
- Student identity sharing across branches.
- Guardian data structure.
- Enrollment uniqueness rules.
- Payroll salary formula and rounding.
- Payroll agreement revision/history representation.
- Production session storage and expiration.
- Same-branch multiple-role authorization policy.
- Payment verification lifecycle.
- Refund and reversal governance.
- Expense correction/approval lifecycle.
- Reporting definitions.
- Retention periods.
- Production hosting configuration.
- Backup and recovery targets.

Unresolved items remain `TBD` or `PROPOSED`; coding agents must not invent answers.

---

## 38. Cross-Document Relationships

This document must remain consistent with:

- `PRD.md` — Product functionality.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ERD.md` — Authoritative entity relationships.
- `API.md` — Backend HTTP contracts.
- `SECURITY.md` — Authentication and authorization.
- `ARCHITECTURE.md` — Technical architecture.
- `FRONTEND_INTEGRATION.md` — Existing frontend service interfaces.
- `FRONTEND_AUDIT.md` — Audited frontend functionality.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend handoff proposals.
- `MODULE_WORKFLOW_MAP.md` — Cross-module dependencies.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role and branch access evidence.
- `BACKEND_GAPS_AND_RISKS.md` — Backend integrity and implementation risks.
- `RULES.md` — Engineering standards.
- `AGENTS.md` — Coding-agent instructions.
- `MEMORY.md` — Approved decisions.
- `PROGRESS.md` — Verified implementation history.

Relative Markdown links must be adjusted to the actual repository structure.

---

## 39. Final Implementation Boundary

**CONFIRMED BUSINESS REQUIREMENTS**

- Five existing frontend roles.
- Receptionist full approved Admissions and Fees access.
- Teacher self-only My Profile, timetable, academic assignments and compensation.
- Assignment-based running Teacher Payroll, without automatic monthly generation.
- One initial academy and multiple authorized branches.
- Physical academy inventory in Assets.
- Preserve existing frontend workflows and financial results.

**PROPOSED DATABASE DESIGN**

- MongoDB collection names and field structures.
- Mongoose models and indexes.
- Transaction and persistence implementation details.
- Monetary storage representation.
- Database migration strategy.

**DEFERRED**

- Platform Admin and multi-client SaaS provisioning.
- Cloudinary/media uploads.
- Unapproved financial refund/reversal processes.
- Automatic monthly salary generation.
- Unnecessary distributed infrastructure.

**NOT IMPLEMENTED**

- Production MongoDB schemas.
- Database migrations.
- Secure backend persistence.
- Production transaction handlers.
- Database-backed role authorization.

**Governing Principle:** MongoDB must become the secure authoritative persistence layer while preserving the exact approved academic, administrative, fee and assignment-based salary behavior of the existing TSA Academy ERP frontend.

**Document Status:** DRAFT — Ready for database design review; implementation requires a separately approved backend ticket.


**Status:** PURPOSE ONLY — FINAL SCHEMAS AND MIGRATIONS NOT AUTHORED OR APPROVED.

Use [ERD](../01-ARCHITECTURE/ERD.md), [Module Workflow Map](../MODULE_WORKFLOW_MAP.md) and [Backend Gaps and Risks](../BACKEND_GAPS_AND_RISKS.md) as reconciliation inputs. Do not infer final collection fields, retention, migration or deletion rules from this placeholder.
