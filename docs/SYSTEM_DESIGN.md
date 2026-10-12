# Academy Management ERP — System Design & Business Workflow Specification

**Document:** SYSTEM_DESIGN.md
**Version:** 1.0
**Status:** DRAFT — Pending Workflow and Cross-Document Review
**Updated:** 2026-10-09
**Project:** Academy Management ERP
**Platform:** Web Application
**Organization Model:** Single Academy, Multiple Branches
**Development Strategy:** Frontend First, Modular Implementation

---

## 1. Purpose

This document defines the functional system design, operational workflows, user journeys, module responsibilities, data movement, cross-module interactions, exceptional scenarios and business behavior of the Academy Management ERP.

Its objective is to ensure that all ERP modules work together as one coherent application rather than as unrelated screens.

It guides:

- Product implementation.
- Frontend and backend integration.
- Business workflow validation.
- User and branch interactions.
- Module-level feature tickets.
- System and integration testing.
- Future approved changes.

This document describes system behavior.

It does not replace the PRD, Security Specification, Database ERD or Technical Architecture.

It does not authorize unapproved business rules.

---

## 2. Decision Classification

Use the following labels:

**CONFIRMED:** Explicitly supplied or approved.

**PROPOSED:** Recommended behavior awaiting approval.

**TBD:** Missing or unresolved decision.

**DEFERRED:** Intentionally outside current scope.

**REJECTED:** Explicitly excluded.

Client acceptance of the general system proposal establishes the overall product direction, not approval of every detailed operational rule.

Proposed workflows must remain distinguishable from confirmed behavior.

---

## 3. System Overview

### 3.1 Product Description

The Academy Management ERP is a centralized web-based management application for a single academy organization operating multiple branches.

The application is intended to connect student admission, academic management, staff operations, fee collection, financial information and reporting.

### 3.2 Confirmed Scope

- One academy organization.
- Multiple configurable branches.
- Web-based application.
- Four primary roles.
- Different roles for a user across branches.
- Multiple permitted roles within one branch.
- Configurable academy branding.
- Frontend-first development.
- Mock services before backend integration.
- Backend-enforced access control for production.

### 3.3 Deferred Scope

- Multi-client SaaS administration.
- Subscription or license-management infrastructure.
- Electron desktop application.
- Dedicated native mobile applications.
- Unapproved third-party integrations.

---

## 4. System Actors

### 4.1 Super Admin

**CONFIRMED:**

Super Admin is responsible for academy-wide administration of branches and staff assignments.

The system must support authorized all-branches reporting views.

**PROPOSED responsibilities:**

- Manage academy configuration.
- Manage branches.
- Manage staff accounts.
- Configure branch-role assignments.
- Review authorized operational summaries.

Sensitive financial authority remains TBD.

### 4.2 Owner

**CONFIRMED:** Owner is a primary user role.

**PROPOSED responsibilities:**

- View authorized business performance.
- Review financial summaries.
- Monitor admissions and student activity.
- View permitted branch reports.

Academy-wide versus branch-specific access remains TBD.

### 4.3 Receptionist

**CONFIRMED:** Receptionist is a primary user role.

**PROPOSED responsibilities:**

- Register admissions.
- Manage permitted student information.
- Register demo classes.
- Support approved fee collection.
- Complete front-desk operational tasks.

Financial approval and admission approval authority remain TBD.

### 4.4 Teacher

**CONFIRMED:** Teacher is a primary user role.

**PROPOSED responsibilities:**

- View assigned classes.
- View assigned batches.
- View relevant students.
- Review teaching schedules.
- Record attendance if approved.
- View own earnings if approved.

Teacher access should be limited to authorized assignments and records.

---

## 5. Core Operational Domains

The system is divided into functional domains.

| Domain | Modules |
|---|---|
| Foundation | Authentication context, branch selection, roles, navigation |
| Academic | Admissions, Students, Courses, Batches, Faculty, Classes |
| Financial | Fees, Invoices, Payments, Finance |
| Operational | Demo Classes, Assets |
| Administration | Branch Management, User Management, Settings |
| Analytics | Dashboard, Reports |

### Domain Boundary Rule

Each module has its own responsibilities.

However, shared business entities must be connected through consistent identifiers and service contracts.

Do not maintain independent copies of the same authoritative student, enrollment or payment records across modules.

---

# 6. High-Level Functional Flow

The principal proposed academy workflow is:

```text
Student Inquiry / Admission
           |
           v
Student Identity Verification
           |
           v
Course and Batch Selection
           |
           v
Admission Decision
           |
           v
Student Enrollment
           |
           v
Approved Fee Obligation
           |
           v
Invoice / Installment Schedule
           |
           v
Payment Collection
           |
           v
Receipt and Outstanding Balance
           |
           v
Dashboard / Finance / Reports
```

**Status: PROPOSED**

The exact point at which student profiles, enrollments and invoices are created must be confirmed.

A successful admission must not automatically imply that payment has been collected.

An invoice must not automatically imply that a payment exists.

Each operation must have an explicit business outcome.

---

# 7. Branch and Role Context Workflow

## 7.1 Purpose

The ERP must allow users to work within their authorized branch and role context.

## 7.2 Confirmed Behavior

- One user may have access to one or multiple branches.
- A user may hold different roles across branches.
- A user may hold multiple permitted roles in the same branch.
- A single-branch user should enter their assigned branch automatically.
- A multi-branch user may select from assigned branches.
- Super Admin may use authorized all-branches views.

## 7.3 Proposed Workflow

1. User establishes a valid session or demo identity.
2. System obtains the user's permitted branch assignments.
3. System determines whether the user has one or multiple authorized branches.
4. For one branch, the system selects that branch.
5. For multiple branches, the system provides a branch-selection experience.
6. The interface loads the user's effective permissions.
7. Navigation and permitted actions update.
8. Relevant records are loaded for the selected branch.

## 7.4 Branch Switching

When a user switches branches:

1. Validate the new branch against available assignments.
2. Update active branch context.
3. Reevaluate relevant role permissions.
4. Clear or invalidate branch-scoped displayed data.
5. Request data for the new branch.
6. Prevent stale responses from the previous branch appearing as current data.
7. Handle any unsaved form changes appropriately.

## 7.5 Multiple Roles

Example:

A user may hold:

- Teacher in Branch A.
- Teacher and Receptionist in Branch B.

The system must use the permissions valid for the selected branch.

### TBD

- Whether the interface shows a combined-role experience.
- Whether users explicitly select one active role.
- How sensitive permissions are combined.
- Whether Owner has academy-wide rights.

Final rules belong in SECURITY.md.

---

# 8. Authentication and User Access

## 8.1 Frontend Mock Stage

During frontend development, the application may simulate:

- Current user.
- Login/logout.
- Branch assignments.
- Role-aware navigation.
- Unauthorized screens.

This is for UI and workflow testing only.

Mock authentication must never be presented as production security.

## 8.2 Production Stage

The backend must enforce:

- Real authentication.
- Active account status.
- Approved role permissions.
- Branch access.
- Record-level access.
- Session lifecycle.
- Sensitive operation restrictions.

## 8.3 Access Failure Scenarios

The system must handle:

- Unknown user.
- Invalid session.
- Expired session.
- Disabled account.
- No authorized branches.
- Removed branch assignment.
- Unauthorized module.
- Unauthorized specific record.

Use appropriate safe messages and navigation behavior.

Detailed session requirements are owned by SECURITY.md.

---

# 9. Dashboard Workflow

## 9.1 Purpose

The Dashboard provides users with relevant operational information according to their role and branch.

## 9.2 Proposed Workflow

1. User opens Dashboard.
2. System identifies the active user and authorized scope.
3. System loads relevant module summaries.
4. Summary cards display approved metrics.
5. Charts display approved trends.
6. Lists or quick actions provide access to permitted workflows.
7. Changing branch or approved date filters updates the information.

## 9.3 Role-Specific Views

### Super Admin

Proposed:

- Academy-wide overview.
- Branch comparison.
- Admissions overview.
- Student and enrollment summaries.
- Authorized financial information.

### Owner

Proposed:

- Authorized financial summaries.
- Enrollment statistics.
- Business and branch trends.

### Receptionist

Proposed:

- Pending admissions.
- Recent registrations.
- Demo follow-ups.
- Permitted front-desk tasks.

### Teacher

Proposed:

- Assigned teaching schedule.
- Assigned batches.
- Assigned classes.
- Relevant student summaries.

## 9.4 Dashboard Data Integrity

Dashboard metrics must derive from consistent shared records.

For example:

- Student count must follow an approved definition.
- Fee collected must come from valid payment records.
- Outstanding fees must follow invoice and payment rules.
- Teacher class counts must follow actual assignments.

Do not create arbitrary chart values unrelated to the system's mock records.

## 9.5 Edge Cases

- No data.
- No assigned branch.
- Multiple branches.
- Unavailable metrics.
- Changed permissions.
- Slow data retrieval.
- Failed summary request.

### TBD

- Exact metrics.
- Date periods.
- Charts.
- Aggregation rules.
- Owner and Teacher financial visibility.

---

# 10. Admissions Workflow

## 10.1 Purpose

Admissions manages prospective student registration and the approved admission lifecycle.

## 10.2 Proposed Workflow

1. Authorized user opens Admissions.
2. User selects New Admission.
3. System displays the approved admission form.
4. User enters applicant information.
5. User enters required guardian/contact information.
6. User selects course and branch.
7. User selects a batch if required.
8. System performs frontend validation.
9. Admission service creates a mock application.
10. System displays the saved application.
11. Authorized user processes the admission decision.
12. Where approved, admission is linked to student and enrollment records.

## 10.3 Proposed Admission States

- Draft.
- Submitted.
- Pending.
- Approved.
- Rejected.
- Cancelled.

**Status: PROPOSED**

The final states and allowed transitions require client approval.

## 10.4 Admission Record Ownership

An admission must have an identifiable academy and relevant branch.

The application must preserve the source admission when it is converted into later business records.

## 10.5 Admission-to-Student Relationship

**PROPOSED:**

Use an existing student identity where appropriate rather than always creating a duplicate student.

Do not automatically create a new student profile from every admission without approved identity-matching rules.

## 10.6 Admission-to-Enrollment Relationship

**TBD:**

- Whether approval creates enrollment immediately.
- Whether enrollment is a separate staff action.
- Whether a fee must be paid before enrollment.
- Whether one admission can produce multiple enrollments.

## 10.7 Edge Cases

- Missing required fields.
- Duplicate applicant.
- Invalid course.
- Inactive branch.
- Full batch.
- Admission already processed.
- Two users process the same admission.
- Form submission interrupted.
- Enrollment creation fails.

These scenarios must be handled according to approved policies.

---

# 11. Student Management Workflow

## 11.1 Purpose

Maintain consistent student identity and related academic history.

## 11.2 Proposed Workflow

1. Authorized staff opens Students.
2. System loads records permitted for the active context.
3. User searches or filters students.
4. User opens a student profile.
5. System displays student information.
6. Related enrollments, classes and financial records are retrieved where authorized.
7. Permitted edits are submitted through student services.
8. Updated information is reflected in related screens.

## 11.3 Student Identity

**PROPOSED:**

Maintain one academy-level master student identity with separate branch-specific enrollment records.

This avoids unnecessary duplication when a student joins multiple courses.

### TBD

- Student identification format.
- Duplicate matching rules.
- Student branch transfers.
- Multiple simultaneous branch enrollment.
- Guardian record design.

## 11.4 Data Consistency

Updating a student's permitted contact information should not create new student identities or unrelated enrollment records.

Related modules should reference the same approved student ID.

## 11.5 Edge Cases

- Duplicate registration.
- Student without active enrollment.
- Student with several enrollments.
- Enrollment in another branch.
- Archived student.
- Unauthorized profile access.
- Concurrent edits.

---

# 12. Courses and Batches Workflow

## 12.1 Purpose

Define academy educational offerings and branch-specific teaching batches.

## 12.2 Proposed Course Workflow

1. Authorized staff opens Courses & Batches.
2. System displays available courses.
3. User creates or edits approved course details.
4. Course information becomes available to relevant modules.

## 12.3 Proposed Batch Workflow

1. Authorized staff selects a course.
2. User selects an authorized branch.
3. User enters batch information.
4. System validates required fields.
5. Batch record is created.
6. Approved teacher, subject and timetable relationships are configured.
7. The batch becomes available for eligible enrollment operations.

## 12.4 Batch Capacity

**TBD:**

The client must confirm:

- Whether every batch has a maximum capacity.
- Whether pending admissions reserve seats.
- Whether capacity can be overridden.
- Which roles may approve an override.

## 12.5 Scheduling

**TBD:**

Define:

- Academic days.
- Time slots.
- Duration.
- Teacher conflicts.
- Room conflicts, if applicable.
- Rescheduling rules.

Do not implement arbitrary timetable restrictions without approval.

## 12.6 Edge Cases

- Duplicate batch code.
- Invalid course/branch association.
- Batch becomes inactive.
- Capacity reached.
- Teacher schedule conflict.
- Batch contains existing enrollments during deactivation.

---

# 13. Faculty and Classes Workflow

## 13.1 Purpose

Manage teaching assignments and class schedules.

## 13.2 Faculty Identity

The proposed data model links teachers to existing staff user identities.

Avoid duplicating login credentials inside faculty records.

## 13.3 Proposed Teacher Assignment Workflow

1. Authorized administrator identifies the teacher.
2. System verifies applicable branch assignment.
3. Administrator selects a subject, course or batch.
4. Assignment is validated.
5. Assignment is saved.
6. Teacher dashboard reflects permitted teaching responsibilities.

## 13.4 Proposed Class Workflow

1. Authorized staff schedules a class.
2. System associates the relevant batch and teacher.
3. Scheduled class appears on authorized calendars.
4. Teacher views the assigned class.
5. Approved attendance or completion data is recorded.

## 13.5 Teacher Access

Teacher access must be restricted according to approved assignment rules.

A teacher assigned to one batch must not automatically access every student in every branch.

## 13.6 Edge Cases

- Teacher deactivated.
- Teacher assignment removed.
- Class cancelled.
- Timetable overlap.
- Student withdrawn.
- Unauthorized attendance correction.

### TBD

- Teacher subject assignment rules.
- Attendance policies.
- Substitute teaching.
- Class rescheduling.
- Earnings calculation and visibility.

---

# 14. Enrollment Workflow

## 14.1 Purpose

Enrollment connects a student to an approved course and batch within an academy branch.

## 14.2 Proposed Workflow

1. A valid student identity exists.
2. An eligible course and batch are selected.
3. Applicable prerequisites are checked.
4. Approved enrollment action is requested.
5. System validates related records.
6. Enrollment is created.
7. Batch and student views update.
8. Applicable fee obligations are initiated according to approved policies.

## 14.3 Enrollment States

**PROPOSED:**

- Pending.
- Active.
- Completed.
- Withdrawn.
- Cancelled.

Final status vocabulary and transitions remain TBD.

## 14.4 Enrollment Integrity

The system must avoid:

- Invalid student references.
- Invalid batch references.
- Incorrect branch ownership.
- Unapproved duplicate active enrollments.
- Silent removal of enrollment history.

## 14.5 Capacity and Concurrency

If batch capacity is enforced, the backend must prevent two concurrent enrollment requests from exceeding the approved limit.

The final reservation/capacity algorithm depends on client policy.

---

# 15. Fees and Invoice Workflow

## 15.1 Purpose

Manage student financial obligations and related fee records.

## 15.2 Distinct Concepts

The system must distinguish:

**Fee Plan:** The applicable pricing or payment schedule.

**Invoice:** The amount charged to a student.

**Payment:** Money actually recorded as received.

**Outstanding Balance:** Amount remaining after valid allocations and adjustments.

**Receipt:** Evidence of an approved payment record.

These concepts must not be incorrectly treated as interchangeable.

## 15.3 Proposed Invoice Workflow

1. Identify an eligible student or enrollment.
2. Determine the approved fee plan.
3. Apply approved charges and authorized adjustments.
4. Calculate the amount due.
5. Validate the invoice.
6. Generate an invoice record.
7. Display the invoice in the Fees module.
8. Make the obligation available for authorized collection.

## 15.4 Proposed Fee Collection Workflow

1. Authorized user opens an invoice or student fee ledger.
2. System displays current authorized charges and recorded payments.
3. User selects an approved payment method.
4. User enters the payment amount.
5. System validates the request.
6. Payment operation is submitted.
7. Successful payment is recorded.
8. Corresponding balances update.
9. Receipt is generated or made available where approved.
10. Financial summaries reflect the valid payment.

## 15.5 Payment Result Rules

A successful payment must not be reported before the underlying operation succeeds.

An interrupted or failed payment submission must not produce a false receipt.

A repeated request must not result in unintended duplicate collections.

## 15.6 Partial and Advance Payments

**TBD:**

- Are partial payments allowed?
- Are advance deposits allowed?
- Can a payment settle multiple invoices?
- Can an invoice have multiple payments?
- Are installments fixed or configurable?

## 15.7 Discounts, Refunds and Reversals

**TBD:**

The client must confirm:

- Authorized roles.
- Approval requirements.
- Maximum discount amounts.
- Refund conditions.
- Reversal reasons.
- Audit requirements.
- Receipt implications.

Until resolved, these actions must not be implemented as operational financial workflows.

## 15.8 Financial Accuracy

Use consistent approved monetary precision and calculation rules.

Backend financial changes must preserve integrity and appropriate audit history.

---

# 16. Finance Workflow

## 16.1 Purpose

Provide controlled visibility into academy financial operations.

## 16.2 Proposed Finance Inputs

- Valid student payments.
- Approved expense records.
- Other approved financial adjustments.
- Financial reporting periods.
- Branch ownership and permitted scope.

## 16.3 Proposed Expense Workflow

1. Authorized user opens Finance.
2. User selects Add Expense.
3. User enters required details.
4. System validates the information.
5. Expense is saved under an approved branch or academy scope.
6. Financial summaries update according to the approved reporting definition.

## 16.4 Finance and Fees Relationship

The Finance module must use authoritative payment records from the Fees/payment workflow.

It must not create unrelated copies of fee-collection totals.

## 16.5 Edge Cases

- Duplicate expense.
- Incorrect branch.
- Unauthorized adjustment.
- Backdated transaction.
- Changed reporting period.
- Payment reversed.
- Expense awaiting approval.

### TBD

- Expense categories.
- Approval process.
- Cash closing.
- Reconciliation.
- Accounting basis.
- Branch-wide versus academy-wide expenses.

---

# 17. Demo Classes Workflow

## 17.1 Purpose

Manage prospective student trial class activity.

## 17.2 Proposed Workflow

1. Authorized staff registers a demo request.
2. Applicant contact and course interest are recorded.
3. A suitable branch and session are selected.
4. Demo is scheduled.
5. Applicable staff are assigned.
6. Demo session occurs.
7. Outcome is recorded.
8. Staff may initiate admission conversion if permitted.

## 17.3 Demo-to-Admission Integration

Conversion must preserve the relationship with the original demo record.

Do not create duplicate admission or student records through repeated conversion.

## 17.4 Edge Cases

- Demo cancelled.
- Student absent.
- Rescheduling.
- Teacher unavailable.
- Duplicate inquiry.
- Repeat demo.
- Conversion already completed.

### TBD

- Demo fees.
- Attendance rules.
- Scheduling restrictions.
- Conversion status.
- Follow-up responsibilities.

---

# 18. Assets Workflow

## 18.1 Purpose

Maintain records of academy-owned operational assets.

## 18.2 Proposed Workflow

1. Authorized user opens Assets.
2. User creates an asset record.
3. Asset is associated with the relevant branch.
4. Asset details and condition are recorded.
5. Authorized staff may update permitted information.
6. Maintenance or transfer history is retained where required.

## 18.3 Edge Cases

- Duplicate asset code.
- Transfer between branches.
- Lost or damaged asset.
- Asset under repair.
- Asset retired.
- Unauthorized deletion.

### TBD

- Asset categories.
- Branch transfer approval.
- Purchase accounting.
- Maintenance schedules.
- Depreciation requirements.

---

# 19. Reporting Workflow

## 19.1 Purpose

Provide role-aware access to operational and financial information.

## 19.2 Proposed Workflow

1. Authorized user opens Reports.
2. System displays permitted report categories.
3. User selects a report.
4. User selects approved date and branch filters.
5. System evaluates applicable scope.
6. Data is retrieved from authoritative records.
7. Results are displayed.
8. Approved export or print functionality is offered where permitted.

## 19.3 Report Integrity

- Enrollment reports must use enrollment records.
- Payment collection reports must use valid payment records.
- Outstanding fee reports must follow approved financial calculations.
- Teacher workload must reflect authorized assignments.
- Branch comparison must use consistent definitions.

## 19.4 Security

A report must not bypass normal role and branch restrictions.

Exporting a report must not reveal more information than the user is authorized to read.

## 19.5 Edge Cases

- No records.
- Large datasets.
- Unauthorized branch filter.
- Incomplete financial data.
- Export failure.
- Changed permissions during report generation.

### TBD

- Required reports.
- Export formats.
- Reporting definitions.
- Financial reporting periods.
- Export permissions.

---

# 20. Branch Management Workflow

## 20.1 Purpose

Support dynamic branch administration.

## 20.2 Confirmed Behavior

Super Admin can manage academy branches.

The ERP must support multiple branches without hardcoded limits.

## 20.3 Proposed Branch Creation Workflow

1. Authorized Super Admin opens Branch Management.
2. User selects Create Branch.
3. Required details are entered.
4. Input is validated.
5. New branch is created.
6. Branch becomes available to authorized administrative operations.
7. Staff assignments may be added separately.
8. Existing branch data remains unaffected.

## 20.4 Branch Deactivation

**TBD:**

Define behavior for:

- Active students.
- Active batches.
- Outstanding invoices.
- Staff assignments.
- Historical reports.
- Pending admission applications.

Branch deactivation must not silently delete historical records.

## 20.5 Branch Transfer

**TBD:**

The client must define whether students, batches, staff or assets may transfer between branches and which approvals apply.

---

# 21. User Management Workflow

## 21.1 Purpose

Manage staff accounts and branch-role assignments.

## 21.2 Proposed User Creation Workflow

1. Authorized administrator opens User Management.
2. Administrator enters approved user profile information.
3. Account details are validated.
4. User account is created.
5. Authorized branch assignments are selected.
6. Approved roles are associated with each branch.
7. The user receives an approved account activation process.

## 21.3 Multiple Branch Assignment

A user may have different roles in different branches.

Example:

```text
User A
 |
 +-- Branch 1: Teacher
 |
 +-- Branch 2: Receptionist
 |
 +-- Branch 3: Teacher + Receptionist
```

## 21.4 Assignment Changes

When an authorized administrator changes assignments:

1. Confirm authority.
2. Validate user and branch.
3. Validate the proposed role combination.
4. Save the approved change.
5. Refresh effective permissions.
6. Prevent stale authorization from granting removed access.
7. Record relevant audit history.

## 21.5 Edge Cases

- Duplicate account.
- Invalid email.
- Branch removed.
- Role revoked.
- Account disabled.
- Last administrator disabled.
- Two administrators changing the same assignment.

Detailed provisioning and security rules belong in SECURITY.md.

---

# 22. Settings and Branding Workflow

## 22.1 Purpose

Manage academy identity and approved operational settings.

## 22.2 Confirmed Requirements

The system must allow authorized configuration of:

- Academy name.
- Academy logo.
- Primary theme colors.

## 22.3 Proposed Workflow

1. Authorized administrator opens Settings.
2. Current branding is displayed.
3. Administrator edits approved fields.
4. System validates inputs.
5. User previews changes where supported.
6. Approved settings are saved.
7. Shared application components reflect updated branding.

## 22.4 Consistency

Branding must come from a centralized configuration source.

Do not independently hardcode academy names or brand colors in multiple components.

## 22.5 Edge Cases

- Invalid color.
- Missing logo.
- Unsupported file.
- Upload failure.
- Branding update interrupted.
- Concurrent settings changes.

Additional settings require client approval.

---

# 23. Cross-Module Interaction Matrix

| Source | Destination | Proposed interaction |
|---|---|---|
| Branch Management | All Modules | Defines available authorized branch contexts |
| User Management | All Modules | Defines identity and role assignments |
| Admissions | Students | Links applicant to student identity |
| Admissions | Enrollments | Creates or links enrollment after approved event |
| Courses & Batches | Admissions | Supplies valid academic choices |
| Courses & Batches | Enrollments | Defines the student's teaching group |
| Faculty & Classes | Teacher Dashboard | Supplies assigned teaching workload |
| Enrollments | Fees | Supplies eligible fee obligations |
| Fees | Finance | Supplies recorded valid payment information |
| Fees | Reports | Supplies invoice and collection records |
| Demo Classes | Admissions | Supports approved conversion |
| Settings | Shared UI | Supplies branding and appearance |
| Operational Modules | Dashboard | Supplies authorized summary metrics |
| Operational Modules | Reports | Supplies authoritative report records |

These integrations are conceptual.

Their exact events, fields and persistence behavior must follow the approved PRD, ERD, Security and Frontend Integration specifications.

---

# 24. Data Ownership and Source of Truth

Each core entity must have one authoritative ownership boundary.

### Proposed Ownership

- Academy and Branch Management: Academy and branches.
- User Management: Staff accounts and branch-role assignments.
- Admissions: Admission applications and decisions.
- Students: Student master identity.
- Courses & Batches: Academic catalog and batches.
- Enrollment domain: Student-to-batch enrollment relationships.
- Faculty & Classes: Teaching assignments and class sessions.
- Fees: Invoices, fee plans and payments.
- Finance: Operating expenses and financial presentation.
- Demo Classes: Demo requests and sessions.
- Assets: Equipment records.
- Settings: Configuration.
- Reports: Read-only derived information.

### Important Rule

A module may display data owned by another domain, but must not maintain a competing authoritative copy.

For example:

Finance may display fee payments, but Fees/payment services remain responsible for payment records.

---

# 25. Frontend-First Data Flow

During the initial frontend implementation:

```text
User
 |
 v
React Page
 |
 v
Component / Hook
 |
 v
Domain Service
 |
 v
Mock Adapter
 |
 v
Central Demo Storage
```

### Confirmed Principles

- Pages use services for data operations.
- Browser storage is centralized.
- Shared records are referenced consistently.
- Mock functionality is distinguished from production security.

### Proposed Safeguards

- Versioned mock records.
- Fictional demo data.
- Safe handling of invalid storage.
- Predictable Promise-based services.
- Controlled reset operations.
- Shared record identifiers.
- Consistent errors and results.

The detailed contracts belong in FRONTEND_INTEGRATION.md.

---

# 26. Future Backend Data Flow

After backend implementation is authorized:

```text
React Frontend
      |
      v
HTTP Service Adapter
      |
      v
Express API
      |
      v
Authentication
      |
      v
Role + Branch + Record Authorization
      |
      v
Business Validation
      |
      v
Domain Service
      |
      v
Mongoose
      |
      v
MongoDB
```

The frontend must never connect directly to MongoDB.

The backend must not trust client-supplied permissions or branch context without verification.

Actual backend module boundaries belong in ARCHITECTURE.md.

---

# 27. Business Event and Data Consistency Model

**Status: PROPOSED**

Important business actions should have explicit outcomes.

Examples:

- Admission submitted.
- Admission approved.
- Enrollment activated.
- Payment recorded.
- Branch assignment changed.
- Demo converted.
- Class cancelled.

These are conceptual business events.

They do not require an event bus or event-driven microservice infrastructure.

A modular monolith can coordinate related actions through application services and database operations.

### Consistency Requirements

- Related records must not become silently inconsistent.
- Important multi-record writes must be coordinated appropriately.
- Failed operations must report an accurate result.
- Repeated operations must not create unapproved duplicates.
- Financial totals must remain reconcilable.
- Sensitive state changes must produce appropriate audit records.

---

# 28. Failure and Recovery Design

## 28.1 General Principles

The system must not display false success.

Operations should either complete according to the approved business rule or produce a clear failure outcome.

## 28.2 Validation Failure

Display field-level or operation-level feedback.

Preserve valid user input where reasonable.

## 28.3 Network Failure

Display a recoverable error.

Do not assume that an interrupted response always means the server did not process the operation.

Avoid blindly repeating financial writes.

## 28.4 Storage Failure

The mock storage layer must handle unavailable or malformed local browser storage without silently corrupting data.

## 28.5 Permission Change

If access is revoked during an active session, subsequent protected operations must respect the updated authorization state.

## 28.6 Branch Change During Request

Old-branch data must not be presented as if it belongs to the newly selected branch.

Use appropriate cancellation or stale-response protection.

## 28.7 Concurrent Operations

Important conflicts may include:

- Two staff members editing the same student.
- Two users assigning the last batch seat.
- Duplicate payment submission.
- Concurrent role-assignment changes.
- Two administrators editing settings.

The approved backend design must provide suitable conflict detection or atomic operations.

---

# 29. System State and Lifecycle Governance

Every business entity requiring a workflow must have an approved lifecycle.

### Candidate Lifecycles

- Admission.
- Enrollment.
- Batch.
- Class.
- Invoice.
- Payment.
- Demo registration.
- Asset.
- User account.
- Branch.

### State Machine Requirements

Before implementing a state-changing workflow, define:

1. Allowed states.
2. Allowed transitions.
3. Required user permission.
4. Required input.
5. Applicable business rules.
6. Related record updates.
7. Failure behavior.
8. Audit requirements.
9. Reversal or correction behavior.

### Example — Conceptual Admission Lifecycle

```text
Draft
  |
  v
Submitted
  |
  v
Pending Review
  |
  +------> Rejected
  |
  +------> Approved
```

This diagram is PROPOSED.

It must not be implemented as the final admission policy until the client approves its states and transitions.

---

# 30. Reporting and Aggregate Consistency

The Dashboard, Fees, Finance and Reports modules must agree on common metric definitions.

### Examples

**Active Students:** Must use one approved definition of active status.

**Fee Collected:** Must use valid payment records for the selected reporting period.

**Outstanding Amount:** Must follow the approved invoice/allocation/adjustment model.

**Batch Occupancy:** Must use eligible enrollments according to the approved capacity rules.

**Teacher Workload:** Must use actual teaching assignments and relevant scheduled sessions.

### Requirement

Do not independently calculate the same metric using contradictory formulas in different modules.

Centralize approved metric definitions.

---

# 31. System Quality Attributes

The ERP must be designed for the following qualities.

| Quality | Functional implication |
|---|---|
| Scalability | Modules and queries support growing records and branches |
| Reliability | Operations have validated, predictable outcomes |
| Stability | Completed workflows survive unrelated feature changes |
| Maintainability | Module responsibilities remain understandable |
| Testability | Business workflows can be verified independently |
| Flexibility | Approved changes can be localized |
| Security | Access is restricted to authorized users and records |
| Performance | Large lists and summaries use efficient retrieval |
| Consistency | Shared entities and metrics remain aligned |
| Extensibility | New workflows can be added without widespread rewrites |
| Accessibility | Interfaces support accessible interaction |
| Observability | Operational failures can be diagnosed safely |

Quantitative service and performance targets remain TBD.

---

# 32. End-to-End Test Scenarios

The following scenarios represent proposed future verification cases.

## E2E-001 — Single-Branch User

A user with one authorized branch enters the correct branch context.

## E2E-002 — Multi-Branch User

A user selects among authorized branches and sees appropriate records.

## E2E-003 — Multiple Roles

A user has different permissions according to their active branch and approved role policy.

## E2E-004 — Admission Creation

A valid admission is submitted and its record is retrievable.

## E2E-005 — Admission to Enrollment

An approved transition creates or links the intended enrollment without duplication.

## E2E-006 — Enrollment to Fees

Approved fee obligations are associated with the correct student/enrollment.

## E2E-007 — Payment and Reporting

A valid recorded payment updates relevant fee and financial summaries consistently.

## E2E-008 — Teacher Assignment

Teacher dashboard displays only authorized teaching records.

## E2E-009 — Demo Conversion

Approved demo conversion creates or links the appropriate admission without duplication.

## E2E-010 — Branch Access Denial

An unauthorized branch or record operation is denied by the real backend.

## E2E-011 — Duplicate Submission

A repeated sensitive operation does not produce unapproved duplicate records.

## E2E-012 — Client Context Change

Switching branches during an active request does not display stale or unauthorized data.

## E2E-013 — Settings Update

Approved branding changes propagate consistently to shared UI components.

## E2E-014 — Regression

A later module change does not break previously accepted core workflows.

These scenarios require approved detailed business rules before being turned into executable acceptance tests.

---

# 33. Frontend Development Dependencies

The planned frontend phases are:

| Phase | Module |
|---|---|
| F00 | Foundation |
| F01 | Dashboard |
| F02 | Admissions |
| F03 | Students |
| F04 | Courses & Batches |
| F05 | Faculty & Classes |
| F06 | Fees |
| F07 | Finance |
| F08 | Demo Classes |
| F09 | Assets |
| F10 | Reports |
| F11 | Branch Management |
| F12 | User Management |
| F13 | Settings & Integrated QA |

### Dependency Policy

Development order is not the same as data dependency order.

For example:

- Dashboard requires sample records from other modules.
- Admissions requires courses and batches.
- Students requires enrollment relationships.
- Fees requires valid academic/financial references.
- Reports requires shared authoritative records.

Create minimal approved mock services and reference contracts as necessary.

Do not implement large future modules merely to satisfy one early dependency.

---

# 34. Workflow Approval Gates

A workflow is ready for implementation only when:

1. Its required product behavior is approved.
2. Required user permissions are known.
3. Input and output contracts are defined.
4. Related records are identified.
5. Required validations are documented.
6. Relevant error cases are identified.
7. Acceptance tests are specified.
8. Important dependencies are available.
9. The appropriate feature ticket is approved.

If a business-critical requirement remains TBD, the affected ticket must be blocked or reduced to a separately approved safe scope.

An unrelated approved task may proceed.

---

# 35. Client Change Management

The client may request modifications after reviewing the initial implementation.

When a change is requested:

1. Record the request.
2. Identify the affected workflow.
3. Identify the applicable PRD requirement.
4. Determine affected screens and modules.
5. Check role and branch access implications.
6. Check data-model and integration impacts.
7. Obtain required approval.
8. Update the relevant authoritative specifications.
9. Update affected feature tickets.
10. Implement the change.
11. Run relevant workflow and regression tests.
12. Record the outcome in MEMORY.md and PROGRESS.md.

A small UI refinement must not trigger unrelated business-logic changes.

---

# 36. Open System Design Questions

## User Access

1. How are multiple roles combined?
2. Can users select a specific active role?
3. Does Owner have academy-wide access?
4. What happens when a branch assignment is revoked?

## Admissions and Students

5. Which admission states are final?
6. Who approves admission decisions?
7. When is a student profile created?
8. When is enrollment activated?
9. How are duplicate students identified?
10. Can students enroll in multiple branches?

## Academic Management

11. What batch capacity policy applies?
12. Do pending admissions reserve seats?
13. What timetable conflicts must be prevented?
14. Which roles assign teachers?
15. What attendance corrections are allowed?
16. How are teacher earnings calculated?

## Fees and Finance

17. When are invoices generated?
18. Are partial payments supported?
19. Are advance deposits allowed?
20. Can one payment apply to several invoices?
21. Who approves discounts?
22. Who approves refunds and reversals?
23. Is expense approval required?
24. How are cash closing and reconciliation performed?

## Demo Classes

25. Are demo classes free or paid?
26. Which demo statuses are required?
27. When does demo conversion produce an admission?

## Operations and Reporting

28. Which asset lifecycle states are needed?
29. Which reports are required?
30. Which exports are approved?
31. How are branch transfers handled?
32. Which operational settings are configurable?

## Technical Integration

33. What exact service contracts are approved?
34. What production session policy applies?
35. What expected data volumes must be supported?
36. Which external integrations are required, if any?
37. What backup and recovery requirements apply?

Unresolved questions must remain TBD.

Do not let AI coding agents invent business policy.

---

# 37. AI Coding Agent Instructions

All AI coding tools must:

1. Read root AGENTS.md.
2. Read the active approved feature ticket.
3. Read applicable PRD and System Design sections.
4. Read SECURITY.md for user access.
5. Read ERD.md for relevant entity relationships.
6. Read FRONTEND_INTEGRATION.md for service contracts.
7. Read DESIGN.md for frontend appearance.
8. Read RULES.md for engineering standards.
9. Inspect existing source files.
10. Identify unresolved dependencies.
11. Implement only approved ticket scope.
12. Preserve working functionality.
13. Avoid inventing workflows.
14. Use shared data services.
15. Keep branch and role behavior consistent.
16. Test relevant success and failure cases.
17. Report actual verification results.
18. Update TASKS.md and PROGRESS.md.
19. Stop before starting another unapproved ticket.

System Design describes intended business behavior; it is not blanket implementation authorization.

---

# 38. Related Documents

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [Technical Architecture](ARCHITECTURE.md)
- [Database ERD](ERD.md)
- [Visual Design](DESIGN.md)
- [Security Specification](SECURITY.md)
- [Frontend Integration](FRONTEND_INTEGRATION.md)
- [Engineering Rules](RULES.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Current Tasks](TASKS.md)
- [Project Memory](MEMORY.md)
- [Verified Progress](PROGRESS.md)

### Document Ownership

PRD.md defines product functionality.

SYSTEM_DESIGN.md defines business workflows and module interactions.

ARCHITECTURE.md defines technical implementation structure.

ERD.md defines database entities.

SECURITY.md defines protected operations and authorization.

FRONTEND_INTEGRATION.md defines service and API contracts.

DESIGN.md defines visual standards.

RULES.md defines mandatory development rules.

FEATURE_TICKETS.md defines approved executable scope.

---

# 39. Approval and Implementation Boundary

### Confirmed

- Single-academy system.
- Multiple branches.
- Four user roles.
- Multiple roles and branches per user.
- Frontend-first development.
- Mock services followed by secured backend integration.
- Connected ERP module approach.

### Proposed

- Detailed module workflows.
- Lifecycle state models.
- Module ownership boundaries.
- Cross-module events and relationships.
- Failure recovery behavior.
- Detailed end-to-end scenarios.

### TBD

- Admission and enrollment transitions.
- Financial policies.
- Teacher assignment and earnings rules.
- Exact permission combinations.
- Report definitions.
- Branch transfer and deactivation behavior.
- Operational approval workflows.

### Implementation Restriction

Only specifically approved feature tickets may be implemented.

This document does not authorize changes to the application merely because a workflow is described here.

---

**Document Status:** DRAFT — Pending System Workflow Review
**Version:** 1.0
**Next Required Action:** Review cross-document consistency and resolve the minimum business rules needed for F00 and F01.

**Governing Principle:** Every ERP workflow must have clear actors, valid states, consistent data ownership, enforceable permissions, predictable outcomes and verifiable acceptance criteria.