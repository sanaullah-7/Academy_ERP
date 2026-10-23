# DATA_FLOW

<!-- > Purpose: Documents authoritative data movement between ERP modules, roles, branches and dashboards. -->

# TSA Academy ERP — Data Flow & Cross-Module Integration Specification

**Document:** DATA_FLOW.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Status:** DRAFT — Frontend-Aligned Data Flow Design; Backend Not Implemented
**Last Updated:** 2026-10-23
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Scope:** Application Data Movement, Domain Workflows, Transactions and Synchronization

---

## 1. Purpose

This document defines how data moves between the TSA Academy ERP user interface, frontend services, backend APIs, domain services, database collections and related modules.

It establishes the intended transition from the existing browser-local mock implementation to secure, centralized MongoDB persistence.

Its primary objectives are to:

- Preserve the completed frontend's approved workflows.
- Keep frontend services independent of persistence technology.
- Enforce authentication, roles, branch access and record ownership on the backend.
- Define data ownership across academic, administrative and financial modules.
- Prevent inconsistent or duplicated records.
- Coordinate multi-module business transactions.
- Keep dashboards, reports and ledgers synchronized.
- Prevent stale or unauthorized data after account or branch switching.
- Provide clear error, retry, concurrency and recovery behavior.

**Implementation boundary:** This document describes application and integration architecture. It does not authorize implementing backend endpoints, MongoDB schemas, migrations or frontend changes.

---

## 2. Scope and Decision Classification

The existing frontend contains these 16 operational modules:

1. Dashboard
2. Admissions
3. Students
4. Courses & Batches
5. Faculty & Classes
6. Fees
7. Finance Overview
8. Expenses
9. Teacher Payroll
10. Demo Classes
11. Assets
12. Reports & Ledgers
13. Audit Log
14. Branches
15. Users
16. Settings

Shared capabilities include authentication, branch selection, academy branding, Teacher My Profile, notifications and PDF/print exports.

Use the following classifications throughout implementation planning:

| Classification | Meaning |
|---|---|
| CONFIRMED | Explicit owner-approved requirement |
| FRONTEND IMPLEMENTED | Existing frontend behavior supported by audit or implementation evidence |
| PROPOSED | Backend design not yet approved or implemented |
| TBD | Unresolved technical or business decision |
| DEFERRED | Outside the current development phase |
| SUPERSEDED | Historical requirement replaced by a newer decision |

An existing frontend screen is not proof that a corresponding production API exists.

---

## 3. Current Frontend Data Flow

The existing React frontend uses centralized mock services and browser demo persistence.

```text
User Interaction
       |
       v
React Page / Component
       |
       v
React State / Context
       |
       v
Frontend Domain Service
       |
       v
Mock API Adapter
       |
       v
Mock Database / Organization Layer
       |
       v
Browser localStorage
       |
       v
Updated Frontend Views
```

### Current Responsibilities

- Pages handle presentation, input, loading and feedback.
- Auth Context manages demo account/session state.
- Branch Context manages the selected branch and associated UI scope.
- Academy and Theme Context manage approved branding.
- Domain services implement frontend business operations.
- The mock adapter coordinates domain requests.
- The mock database owns shared fictional records and persistence.
- Reporting and dashboard services derive information from shared saved data.

### Current Limitations

Browser localStorage is:

- Local to a browser profile.
- Not a secure multi-user database.
- Not suitable for production authentication.
- Not inherently synchronized across devices.
- Not a reliable concurrency-control mechanism.
- Not an authoritative source for production financial transactions.

Current frontend behavior must be used as an integration reference, not presented as production security.

---

## 4. Proposed Backend Data Flow

After integration, the intended flow is:

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
Express Route
    |
    v
Authentication
    |
    v
Organization / Branch Scope
    |
    v
Action and Record Authorization
    |
    v
Request Validation
    |
    v
Controller
    |
    v
Domain Business Service
    |
    v
Repository / Mongoose
    |
    v
MongoDB
    |
    v
Normalized API Response
    |
    v
Frontend State Refresh
    |
    v
Updated Page / Dashboard / Reports
```

### Mandatory Boundaries

1. React components must not access MongoDB directly.
2. Domain services must provide stable frontend-facing interfaces.
3. API adapters must translate transport differences without changing approved business behavior.
4. Express controllers must handle HTTP concerns rather than duplicate complex domain rules.
5. Backend domain services must enforce business invariants.
6. Repositories must use authorized, appropriately scoped database access.
7. Related durable writes must use appropriate consistency mechanisms.
8. API errors must not expose confidential internal information.
9. Frontend success feedback must occur only after the authoritative operation succeeds.

---

## 5. Data Ownership and Sources of Truth

Each entity must have one authoritative persistence and business-logic owner.

| Data | Authoritative domain | Principal consumers |
|---|---|---|
| Authentication and sessions | Auth | All protected modules |
| Staff and branch assignments | Users / Branches / RBAC | Routing, administrative modules |
| Student identity | Students | Admissions, Fees, Reports |
| Admission state | Admissions | Students, Enrollment, Dashboard |
| Enrollment | Enrollment / Admissions workflow | Courses, Fees, Reports |
| Courses, subjects, streams and batches | Academics | Admissions, Faculty, Fees |
| Teaching assignments | Faculty | Classes, Teacher Profile, Payroll |
| Class schedules | Faculty & Classes | Teacher Profile, Dashboard |
| Fee obligations / challans | Fees | Student ledger, Finance, Reports |
| Verified student payments | Fees | Finance, Dashboard, Reports |
| Operating expense records | Expenses | Finance, Reports |
| Salary agreements and obligations | Payroll | Teacher Profile, Finance, Reports |
| Salary disbursements | Payroll | Expenses, Teacher Profile, Reports |
| Demo inquiries | Demo Classes | Admissions, Dashboard |
| Physical inventory | Assets | Inventory reports |
| Audit events | Audit | Authorized audit views |
| User notifications | Notifications | Notification Center, My Profile |
| Academy settings and branding | Settings | Shared layout and authorized settings views |

### Source-of-Truth Rule

A dashboard, ledger or report is a projection of authoritative records. It must not become an unrelated, independently editable copy of those records.

An export must use the same authorized data and metric definitions as the corresponding screen.

---

## 6. Authentication and Session Flow

### Proposed Login Flow

```text
Login Form
    |
    v
Auth Service
    |
    v
POST Authentication Request
    |
    v
Validate Credentials
    |
    v
Verify Account Status
    |
    v
Create Secure Session
    |
    v
Return Authorized User Context
    |
    v
Load Permitted Branches
    |
    v
Select Branch or Open Dashboard
```

### Session Requirements

- Resolve user identity from the authenticated server session.
- Use secure production authentication instead of trusting frontend mock accounts.
- Protect production session credentials.
- Reject disabled or expired sessions.
- Recheck effective permissions after role or branch-assignment changes.
- Clear confidential frontend state after logout or account switching.
- Avoid leaking protected data through session restoration.

Session transport, expiration and revocation settings must follow the approved security design.

---

## 7. Branch Selection and Role Switching

One user may have different roles in different branches.

### Branch Switching Flow

```text
Authenticated User
       |
       v
Authorized Branch List
       |
       v
User Selects Branch
       |
       v
Backend Validates Membership
       |
       v
Resolve Effective Role and Permissions
       |
       v
Update Active Branch Context
       |
       v
Invalidate Previous Branch Data
       |
       v
Load New Branch Dashboard and Records
```

### Required Behavior

- Users with one authorized branch may enter it automatically.
- Users with multiple branches may choose among permitted branches.
- A branch identifier supplied by the browser is not proof of authority.
- Different roles across separate branches are supported.
- Unresolved multiple roles within the same branch fail closed.
- A branch change must not carry old records into the new branch.
- Pending requests for the previous branch must be cancelled, ignored or otherwise safely separated.
- Backend queries must enforce the requested resource's actual branch ownership.

### Cross-Branch Reporting

Authorized cross-branch reports may aggregate explicitly permitted branches.

A cross-branch report capability does not authorize cross-branch writes.

---

## 8. Role-Based Data Flow

The current frontend has five roles:

- Super Admin
- Admin
- Receptionist
- Owner
- Teacher

### Receptionist

**CONFIRMED:** Receptionist has Full Access to existing approved Admissions and Fees workflows.

Receptionist must not receive independent Finance, Expenses, Teacher Payroll, Audit Log, Branches, Users or Settings access.

### Teacher

**CONFIRMED:** Teacher may open `/my-profile` and access only their own authorized profile, schedule, assignments, salary history, running balance, payslips and notifications.

Teacher self-service must be distinct from administrative Faculty/Payroll APIs.

### Admin and Super Admin

Administrative requests must enforce the effective action permission, authorized branch and any protected-account restrictions.

### Owner

Owner may access approved institutional, financial and academic information, with mutation authority restricted to actual verified grants.

**Every read and write must be authorized by the backend.**

---

# 9. Module-Wise Data Flows

## 9.1 Dashboard

```text
Dashboard Page
      |
      v
Dashboard Service
      |
      v
Authorized Aggregate API
      |
      v
Admissions + Enrollment + Fees
+ Expenses + Payroll + Academic Records
      |
      v
Role/Branch-Filtered Dashboard Projection
```

Rules:

- All metrics must use saved authoritative data.
- Student counts must follow approved active/enrollment definitions.
- Fee collections must use valid Verified payments.
- Expenses must use appropriately posted records.
- Payroll summaries must use assignment-based obligations and payments.
- Teacher dashboards must expose only own/assignment-scoped data.
- Receptionist dashboards must not reveal unrelated Finance or Payroll records.
- Do not use fictional seed totals as real operational statistics.

---

## 9.2 Admissions

### Standard Admission Flow

```text
New Admission Form
       |
       v
Validate Applicant Details
       |
       v
Validate Branch, Course and Batch
       |
       v
Create Admission and Required Student Link
       |
       v
Persist Authorized Admission State
       |
       v
Refresh Admissions / Students
```

### Approval and Enrollment Flow

```text
Pending Admission
       |
       v
Authorized Approval
       |
       v
Approved Admission
       |
       v
Validate Student + Academic References
       |
       v
Create Enrollment / Activate Student
       |
       v
Refresh Students, Batch Counts and Reports
```

### Important Rules

- Preserve existing approved Pending/Approved workflows.
- Do not reintroduce historical Reject actions without approval.
- Status and record mutations must respect current role restrictions.
- Enrollment must not be duplicated by repeated requests.
- Existing enrolled or financially protected records must not be unsafely edited or deleted.
- Admission display serials must not be used as database foreign keys.
- Receptionist has Full Admissions access within the approved business constraints.

---

## 9.3 Instant Admission — Integrated Transaction

The frontend has an integrated admission flow involving multiple domains.

### Logical Flow

```text
Submit Instant Admission
          |
          v
Validate User, Branch and Applicant
          |
          v
Validate Course / Stream / Batch
          |
          v
Calculate Approved Fee
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
          +----> Optional Verified Initial Payment
          |
          v
Commit Required Durable Records
          |
          v
Refresh Students, Admissions, Fees,
Dashboard, Finance and Reports
```

### Transaction Requirements

- All required related records must be consistent.
- A failed fee or enrollment step must not leave an unintended partial success.
- Repeated submissions must not create duplicate linked records.
- Batch capacity and academic references must be validated.
- Optional initial payment must follow verification and balance rules.
- Report updates must derive from the committed authoritative records.

### Final Integration Decision

Exact frontend request fields, record cardinality and fee calculation must be verified from current domain services before implementing the API.

---

## 9.4 Students

```text
Students Page
      |
      v
Student Service
      |
      v
Authorized Student API
      |
      v
Student Records + Related Admission/Enrollment
      |
      v
Student Directory / Student Profile
```

Rules:

- Stable internal student IDs remain authoritative.
- Branch-scoped gapless display serials are presentation values.
- Student edits must preserve linked academic and financial records.
- Teacher access to student details must be restricted to approved assigned relationships.
- Student duplicate/merge and cross-branch transfer policies remain unresolved.

---

## 9.5 Courses & Batches

```text
Course / Batch Management
       |
       v
Academic Service
       |
       v
Validate Course, Subject, Stream, Batch
       |
       v
Save Academic References
       |
       v
Refresh Admissions, Faculty, Enrollment
and Academic Directory Views
```

### Requirements

- Preserve branch ownership.
- Validate Course → Batch relationships.
- Validate supported Subject and Stream relationships.
- Maintain capacity restrictions where approved.
- Prevent deletion of referenced academic entities when history requires preservation.
- Use existing frontend fee rules for course/subject pricing.
- Do not guess missing prices or academic relationships.

---

## 9.6 Faculty & Classes

```text
Faculty Management
       |
       v
Teaching Assignment Service
       |
       v
Validate Teacher + Branch
       |
       v
Validate Course + Batch + Subject
       |
       v
Validate Timetable / Conflict Rules
       |
       v
Save Faculty Assignment
       |
       +----> Update Class Schedule
       |
       +----> Update Teacher My Profile
       |
       +----> Determine Payroll Agreement Eligibility
```

### Requirements

- Preserve existing teacher assignment relationships.
- Prevent incompatible teacher/batch/subject references.
- Preserve assignment history associated with remuneration.
- Do not independently fabricate attendance records.
- Keep schedule-related Teacher My Profile views synchronized.
- Salary agreement creation must follow the approved assignment workflow.

---

## 9.7 Teacher My Profile

**CONFIRMED — Self-Service Feature**

### Data Flow

```text
Teacher Login
      |
      v
My Profile
      |
      v
Authenticated Teacher Identity
      |
      v
Self-Scoped Backend Queries
      |
      +--> Overview & Bio
      |
      +--> Class Schedule & Timetable
      |
      +--> Academic Assignments
      |
      +--> Salary & Compensation
              |
              +--> Agreements
              +--> Running Balances
              +--> Payment History
              +--> Own Payslips
```

### Requirements

- Resolve Teacher identity from the authenticated session.
- Restrict queries to authorized own records.
- Restrict academic information to approved teaching relationships.
- Do not grant broad Faculty or administrative Payroll access.
- Teacher can view, print and export their own supported payslips.
- Teacher cannot view another teacher's salary or profile through self-service operations.
- Compensation and payment data must come from the same authoritative payroll sources used by administrative reports.

---

## 9.8 Fees and Challans

### Challan Flow

```text
Valid Enrollment
      |
      v
Approved Fee Calculation
      |
      v
Create Challan
      |
      v
Student Fee Ledger
      |
      v
Fee Balance Projection
```

### Fee Payment Flow

```text
Authorized Fee Collection
      |
      v
Validate Student / Challan / Branch
      |
      v
Check Outstanding Balance
      |
      v
Validate Payment Amount
      |
      v
Record Payment and Verification State
      |
      v
Apply Valid Verified Payment
      |
      v
Refresh Challan, Ledger, Finance,
Dashboard and Reports
```

### Requirements

- Preserve the existing one-challan-per-enrollment contract.
- Allow approved partial payments.
- Only valid Verified payments reduce the applicable fee balance.
- Reject unauthorized or excessive payments.
- Prevent duplicate submissions.
- Keep receipt records linked to the actual payment.
- Receptionist has Full Fees access within their authorized branch.
- Refunds and reversals require separately approved workflows.

---

## 9.9 Finance Overview

```text
Verified Fee Payments
          |
          v
       Revenue
          |
          +-------------------+
                              |
Posted Operating Expenses ---+---> Finance Aggregation
                              |
Posted Payroll Expenses -----+
                              |
                              v
                    Financial Overview
                              |
                              v
                    Authorized Reports
```

### Requirements

- Only verified student collections count as applicable revenue.
- Use actual posted expense records.
- Include salary expenses through the approved payroll-to-expense linkage.
- Avoid maintaining separate contradictory finance totals.
- Calculate summaries using consistent period and branch filters.
- Receptionist does not receive access to independent Finance APIs.

---

## 9.10 Expenses

```text
Authorized Expense Form
       |
       v
Validate Category, Amount and Branch
       |
       v
Create Posted Expense
       |
       v
Refresh Finance, Expense Directory
and Authorized Reports
```

### Requirements

- Use approved expense categories.
- Support existing permitted custom-category behavior.
- Validate amounts and descriptions.
- Enforce the actor's effective permission.
- Preserve historical transaction references.
- Do not allow duplicate payroll expenses.
- Do not invent unapproved reversal or refund workflows.

---

## 9.11 Teacher Payroll — Running Assignment Balance

**CONFIRMED:** Teacher Payroll is based on approved faculty assignments, not monthly salary periods.

### Agreement Creation Flow

```text
Approved Faculty Assignment
          |
          v
Salary Agreement
(Fixed or Percentage Method)
          |
          v
Calculate Agreed Remuneration
          |
          v
Independent Running Obligation
          |
          v
Teacher Profile + Payroll Ledger
```

### Salary Disbursement Flow

```text
Authorized Salary Payment
          |
          v
Validate Role, Branch and Teacher
          |
          v
Validate Assignment / Agreement
          |
          v
Check Running Outstanding Balance
          |
          v
Validate Payment Amount
          |
          v
Record Payroll Payment
          |
          v
Create Matching Posted Expense
          |
          v
Commit Required Financial Records
          |
          +--> Update Running Balance
          |
          +--> Refresh Teacher My Profile
          |
          +--> Refresh Finance and Reports
          |
          +--> Publish Personal Salary Notification
```

### Critical Rules

1. Every eligible assignment has its own remuneration agreement and running obligation.
2. A new month does not create a new salary.
3. A new batch/subject assignment may establish a separate obligation.
4. Older outstanding balances and verified payments must remain preserved.
5. Payments must be applied to the correct salary obligation.
6. Reject unsupported overpayment and duplicate disbursement.
7. Preserve the current frontend Fixed/Percentage formula and rounding.
8. Salary payment and matching expense must be durably consistent.
9. Reporting must use valid payments and running obligations.
10. Teacher self-service must display only their own remuneration.

### Formula Verification

Before backend implementation, inspect:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`
- Existing related tests.

Do not replace verified calculations with a generic monthly or percentage formula.

### Notification Consistency

A salary notification is a secondary effect of a successful payment.

A notification failure must not cause an already committed financial payment to be duplicated.

The final design should define a safe post-commit notification mechanism where reliability requires it.

---

## 9.12 Demo Classes

```text
Demo Inquiry
      |
      v
Trial Scheduling / Attendance
      |
      v
Approved Outcome
      |
      +--> Remain Inquiry
      |
      +--> Convert to Admission
                   |
                   v
             Admissions Form Prefill
                   |
                   v
             Validated Admission
```

### Requirements

- Maintain the original inquiry record.
- Preserve approved attendance/no-show and conversion states.
- Validate candidate data before admission submission.
- Prevent duplicate conversions.
- Respect branch and course/batch relationships.
- A demo inquiry does not automatically become an enrollment or verified payment.

---

## 9.13 Physical Assets

```text
Asset Registration
      |
      v
Physical Inventory Record
      |
      +--> Staff Assignment
      |
      +--> Condition Inspection
      |
      +--> Maintenance Event
      |
      v
Asset Directory and Reports
```

### Requirements

- Assets represent physical academy property.
- Preserve asset identifiers and branch ownership.
- Validate staff assignments.
- Preserve inspection and maintenance history.
- Do not automatically create Finance expenses from maintenance entries unless expressly approved.
- Do not implement unsupported depreciation, disposal or deletion.
- No media uploads or Cloudinary integration.

---

## 9.14 Reports & Ledgers

```text
Authenticated Report Request
          |
          v
Validate Report Permission
          |
          v
Resolve Authorized Branch Scope
          |
          v
Query Authoritative Domain Records
          |
          v
Apply Consistent Metrics / Filters
          |
          v
Report Projection
          |
          +--> Screen
          +--> CSV
          +--> PDF
          +--> Word / Print
```

### Requirements

- All reporting data must come from valid saved records.
- Fee collections must use verified payments.
- Payroll must use assignment-based remuneration and valid disbursements.
- Expense totals must use properly posted expenses.
- Apply the same authorization to exports as to report views.
- Cross-branch comparisons require explicit permissions.
- Do not display fictitious metrics as real business results.

---

## 9.15 Audit Log

```text
Sensitive Authorized Operation
          |
          v
Validated Business Action
          |
          v
Durable Audit Event
          |
          v
Authorized Audit Log View
```

### Requirements

- Record relevant actor, action, resource, scope and timestamp.
- Do not expose secret credentials or unnecessary confidential data.
- Audit history must not be editable through ordinary ERP endpoints.
- Audit records required for financial consistency must follow the transaction design.
- Receptionist, Owner and Teacher have no general Audit Log access under current approved policy.

---

## 9.16 Branches

```text
Authorized Branch Management
          |
          v
Validate Acting Role
          |
          v
Validate Target Branch / Dependencies
          |
          v
Apply Approved Operation
          |
          v
Refresh Branch List and Access Scope
```

### Requirements

- New branch creation remains paused.
- Protected branch editing/deactivation/deletion rules must be preserved.
- Do not delete a branch with blocking records.
- Preserve historical ownership.
- Ensure branch changes update relevant user scopes and session state.
- Do not automatically cascade deletion into financial history.

---

## 9.17 Users

```text
Authorized Staff Management
          |
          v
Validate Actor and Target Role
          |
          v
Validate Branch Assignment
          |
          v
Create / Update Approved User Data
          |
          v
Persist Role Assignment Changes
          |
          v
Invalidate Outdated Authorization Context
```

### Requirements

- Preserve one staff identity across multiple branch assignments.
- Support different roles across branches.
- Enforce Admin privilege ceilings.
- Reject unapproved protected-role changes.
- Revoke or refresh outdated permissions.
- Preserve audit history.

---

## 9.18 Settings and Branding

```text
Authorized Settings Update
          |
          v
Validate Organization / Branch Scope
          |
          v
Validate Setting Fields
          |
          v
Persist Approved Configuration
          |
          v
Refresh Academy / Theme Context
```

### Requirements

- Preserve academy name and approved theme settings.
- Respect organization- versus branch-level configuration.
- Do not allow Receptionist or Teacher to manage administrative Settings.
- Do not store application secrets as general settings.
- Do not introduce media upload infrastructure without approval.

---

## 10. Cross-Module Dependency Matrix

| Source operation | Modules requiring refreshed data |
|---|---|
| Admission created | Admissions, Students, Dashboard, Reports |
| Admission approved | Admissions, Students, Dashboard |
| Enrollment created | Students, Admissions, Batches, Fees, Reports |
| Challan created | Fees, Student Ledger, Dashboard |
| Verified fee payment | Fees, Finance, Dashboard, Reports |
| Course/Batch updated | Academics, Admissions, Faculty, relevant reports |
| Faculty assignment created | Faculty, Classes, Teacher Profile, Payroll eligibility |
| Salary agreement created | Payroll, Teacher Profile, Reports |
| Payroll payment recorded | Payroll, Teacher Profile, Expenses, Finance, Reports, Notifications |
| Expense created | Expenses, Finance, Dashboard, Reports |
| Demo converted | Demo Classes, Admissions, relevant summaries |
| Asset updated | Assets, Inventory Reports |
| User role changed | Users, Session/Permission Context, Navigation |
| Branch changed | Branch-scoped lists, dashboards, financial and academic views |
| Settings changed | Academy/Theme Context and relevant presentation |

Refreshing a projection means reloading or invalidating data derived from committed records. It does not automatically require another database write.

---

## 11. Transaction Boundaries

The backend must distinguish ordinary single-record operations from multi-record workflows requiring atomicity.

| Operation | Required behavior |
|---|---|
| Instant admission | Required linked records succeed or fail consistently |
| Enrollment | Prevent duplicate records and capacity overrun |
| Fee payment | Prevent duplicate and excessive collection |
| Payroll disbursement | Payment and matching expense remain durably consistent |
| Demo conversion | Preserve source/result linkage without duplicate conversion |
| Role assignment change | Maintain valid assignments and effective authorization |
| Branch deletion | Enforce blockers and preserve unrelated history |

### Mandatory Transaction Rules

- Never report success before required persistence completes.
- Do not leave orphaned financial records.
- Verify related record ownership.
- Prevent duplicate retries.
- Use appropriate unique constraints.
- Protect race-sensitive balances and batch capacity.
- Maintain required audit linkage.
- Return useful conflict errors for invalid concurrent operations.

MongoDB transactions are proposed for related durable writes. They must be combined with relevant conditional updates, idempotency and uniqueness constraints.

---

## 12. Idempotency and Retry Safety

Repeated network requests must not create duplicate business transactions.

### Sensitive Operations

- Instant admission.
- Enrollment creation.
- Challan issuance.
- Fee payment.
- Payroll payment.
- Demo conversion.

### Requirements

1. Identify requests eligible for idempotency protection.
2. Scope idempotency records by trusted identity, organization, branch and operation.
3. Reject conflicting reuse of the same idempotency key.
4. Return the approved previous result for an equivalent successful retry where appropriate.
5. Do not blindly retry non-idempotent writes.
6. Do not treat disabled frontend buttons as sufficient duplicate prevention.

Read operations may use controlled retries, cancellation and timeouts.

---

## 13. Data Consistency and Derived Values

### Fee Outstanding

Conceptually:

```text
Outstanding Fees =
Valid Challan Payable
- Valid Verified Applied Fee Payments
```

Final adjustments, rounding and historical data handling must follow approved financial contracts.

### Payroll Outstanding

Conceptually:

```text
Outstanding Teacher Remuneration =
Current Agreed Assignment Payable
- Valid Applied Salary Payments
```

The payable amount and actual Fixed/Percentage calculations must be verified from frontend source.

### Finance Net Position

Conceptually:

```text
Net Position =
Applicable Verified Revenue
- Applicable Posted Expenses
```

The exact period filters, accounting classification and approved dashboard terminology must remain consistent with the frontend.

### General Rules

- One authoritative calculation per business metric.
- No independently editable duplicated balance.
- No unsupported changes to financial formulas.
- Do not silently count unverified payments.
- Do not double-count payroll expenses.
- Preserve historical assignment and payment records.

---

## 14. Frontend Cache and State Invalidation

The frontend must not display stale, unauthorized or contradictory information after a backend operation.

### Requirements

- Revalidate relevant lists after successful mutations.
- Partition server-state cache by user and branch.
- Invalidate old branch state after switching.
- Clear protected state after logout or account switching.
- Prevent late responses from the previous branch from updating the new branch's view.
- Recheck permissions after a role or branch-assignment change.
- Invalidate related financial and payroll projections after committed payments.
- Avoid publicly caching confidential student or compensation data.

A dedicated caching library or Redis is not automatically required.

The implementation should use the smallest sufficient mechanism supported by the approved frontend integration approach.

---

## 15. Error and Recovery Flow

### Standard Failure Path

```text
User Action
    |
    v
Request Validation
    |
    +--> Invalid: Return Field-Level Feedback
    |
    v
Authentication / Authorization
    |
    +--> Denied: Return Safe Access Error
    |
    v
Business Validation
    |
    +--> Conflict: Return Recoverable Domain Error
    |
    v
Database Operation
    |
    +--> Failure: Roll Back Required Transaction
    |
    v
Success Response
    |
    v
Refresh Dependent Views
```

### Requirements

- Preserve user-entered form values when validation fails where feasible.
- Differentiate authentication, authorization, validation, missing-record and conflict errors.
- Never show a false success message.
- Keep the required transaction consistent on failure.
- Provide request correlation identifiers.
- Avoid leaking protected resource existence through error details.
- Do not expose backend stack traces or secrets.
- Permit safe recovery without duplicated financial writes.

---

## 16. Concurrency Handling

Multiple authorized staff members may operate simultaneously after the backend is introduced.

### Important Race Conditions

- Two users assigning the last available batch seat.
- Two Receptionists collecting against the same remaining fee balance.
- Two administrators paying the same Teacher obligation.
- A role being revoked during an active user session.
- A student being edited by two users.
- An admission being approved/enrolled simultaneously.
- A branch being deactivated while another operation attempts a write.

### Requirements

- Revalidate current state before sensitive writes.
- Use conditional updates and version checks where appropriate.
- Enforce uniqueness at database level.
- Reject conflicting operations consistently.
- Preserve historical records and relevant audit events.
- Do not rely on frontend localStorage behavior as a model for multi-user concurrency.

---

## 17. Read Versus Write Data Flows

### Reads

- Must authenticate and authorize.
- Must apply correct branch and record scope.
- May be paginated, filtered and cached safely.
- Must not expose unnecessary confidential fields.

### Writes

- Must authenticate and authorize.
- Must validate input and related resources.
- Must enforce business invariants.
- Must protect against duplicate submissions and stale updates.
- Must commit required related changes consistently.
- Must generate relevant audit records.
- Must trigger correct dependent-data refresh.

A wider read permission never implies a wider write permission.

---

## 18. Reporting and Export Flow

All reports and exports must obey the same data-scope rules.

### Required Steps

1. Authenticate the requesting user.
2. Verify report or export permission.
3. Resolve authorized organization and branches.
4. Validate filters and reporting period.
5. Query authoritative domain records.
6. Apply approved metric definitions.
7. Generate the response or export.
8. Return only authorized fields.
9. Record relevant sensitive export activity where required.

### Restrictions

- No cross-branch data leakage.
- No unrestricted financial exports.
- No Teacher access to organization-wide remuneration.
- No Receptionist access to independent Finance or Payroll reports.
- No fabricated totals.
- No report bypass through direct export URLs.

---

## 19. Notification Data Flow

The existing frontend includes teacher salary-payment notifications.

### Proposed Safe Flow

```text
Payroll Payment Successfully Committed
              |
              v
Record / Queue Notification Intent
              |
              v
Notification Service
              |
              v
Recipient Teacher
              |
              v
Personal Notification Center
```

### Requirements

- A notification must reference the actual successful payment.
- The recipient must be the correct authorized Teacher.
- Notification retries must not duplicate the payment.
- Notifications must not expose other staff compensation.
- Financial data remains authoritative even if notification delivery is delayed or fails.

The exact delivery mechanism, persistence and retry policy remain proposed.

---

## 20. Data Migration and Compatibility

The frontend currently persists demo information locally.

A future migration or import must be separately approved.

### Requirements

- Verify existing mock schema versions.
- Preserve stable identities and links.
- Inspect Student, Admission and Enrollment associations.
- Reconcile challans and verified payments.
- Preserve Faculty Assignments and Salary Agreements.
- Preserve running payroll and historical payment balances.
- Handle legacy missing/optional fields.
- Detect duplicate or inconsistent records.
- Validate branch ownership.
- Provide backup and rollback planning.
- Never silently overwrite existing browser data.

Changing persistence must not change approved frontend business behavior.

---

## 21. API Contract Requirements

The proposed backend uses REST APIs under `/api/v1`.

### Requirements

- Consistent request and response envelopes.
- Stable resource identifiers.
- Standardized field validation errors.
- Proper HTTP status codes.
- Explicit branch and identity context.
- Bounded pagination.
- Approved filtering and sorting.
- Idempotency for sensitive writes.
- Secure session transport.
- Protected exports.
- No leaking MongoDB internals into frontend components.

Specific routes and payloads belong in `API.md` and `API_CONTRACTS.md`.

All unimplemented endpoints must remain labeled PROPOSED.

---

## 22. Database Data Flow Requirements

MongoDB becomes the future authoritative persistence layer.

### Rules

- Use approved Mongoose models.
- Validate cross-collection references.
- Apply organization/branch scope.
- Maintain financial precision.
- Use appropriate indexes.
- Use transactions for coordinated durable writes.
- Preserve historical records.
- Enforce authenticated ownership on queries.
- Avoid unnecessary duplicated stored projections.

Detailed schemas and indexes belong in `ERD.md` and `DATABASE.md`.

---

## 23. Security Requirements

Every production data flow must protect:

- Authentication credentials.
- Staff personal information.
- Student information.
- Fee obligations and collections.
- Salary agreements and disbursements.
- Branch-level operational records.
- Authorized reports and exports.
- Session/permission changes.

### Mandatory Enforcement

- Server authentication.
- Role and action authorization.
- Organization ownership.
- Branch validation.
- Record ownership and assignment checks.
- Input validation.
- CSRF/CORS protections where applicable.
- Secure errors.
- Audit logging.
- Safe secrets handling.

Frontend route hiding and disabled actions are not substitutes for backend authorization.

---

## 24. Data Flow Testing Requirements

Future implementation tickets must include relevant verification.

| Test category | Required scenarios |
|---|---|
| Authentication | Login, logout, expired session, disabled account |
| Branch switching | Authorized switch, unauthorized switch, stale-response prevention |
| Roles | Five-role actions and denied operations |
| Admissions | Create, approve, enroll and guarded mutation |
| Students | Correct links, stable IDs and branch scope |
| Academics | Valid course/batch relationships and capacity |
| Fees | Verified payments, partial payments, no duplicates or overpayment |
| Finance | Correct revenue, expenses and net projections |
| Payroll | Assignment agreements, partial/full payments, running balances |
| Teacher My Profile | Own salary and schedule; other-teacher access denied |
| Demo Classes | Attendance, conversion and duplicate prevention |
| Assets | Correct inventory scope and preserved history |
| Reports | Consistent totals, authorization and exports |
| Audit | Correct sensitive action history |
| Concurrency | Simultaneous enrollment and financial submissions |
| Recovery | Rollback and recoverable errors |

Do not claim tests have passed unless they have actually been executed.

---

## 25. Proposed Implementation Sequence

1. Backend authentication and trusted request context.
2. Organization/branch authorization foundation.
3. Scoped data access and academic reference records.
4. Admissions, Students and Enrollments.
5. Challans, Fees and verified payments.
6. Faculty Assignments and Classes.
7. Teacher My Profile.
8. Assignment-based Payroll and linked Expenses.
9. Demo Classes and Physical Assets.
10. Dashboard, Reports, Audit, Notifications and Settings.
11. Frontend HTTP adapter integration.
12. Security, concurrency and regression verification.

This is a recommended sequence only.

Every implementation activity still requires its own approved technical ticket.

---

## 26. Open Decisions

The following must remain unresolved until supported by owner approval or verified source evidence:

- Final API response envelopes and payload fields.
- Exact Fixed/Percentage salary calculation and rounding.
- Money representation at HTTP/database boundaries.
- Student identity ownership across branches.
- Same-branch multiple-role authorization combination.
- Final attendance/session data contracts.
- Detailed fee refunds and reversals.
- Financial expense correction policies.
- Teacher My Profile cross-branch aggregation behavior.
- Exact cache invalidation implementation.
- Notification delivery strategy.
- Historical mock-data migration policy.
- Production retention, backup and recovery targets.

Do not silently replace TBD items with assumed implementations.

---

## 27. Related Documentation

This document must remain consistent with:

- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Approved business workflows.
- `BUSINESS_RULES.md` — Business invariants.
- `SECURITY.md` — Security requirements.
- `RBAC_PERMISSIONS.md` — Role/action permissions.
- `TENANT_BRANCH_ISOLATION.md` — Data ownership and branch isolation.
- `ARCHITECTURE.md` — Backend structure.
- `ERD.md` — Data relationships.
- `DATABASE.md` — MongoDB design.
- `API.md` — Proposed REST API design.
- `API_CONTRACTS.md` — Detailed endpoint payload contracts.
- `FRONTEND_INTEGRATION.md` — Frontend services and adapter interfaces.
- `FRONTEND_AUDIT.md` — Frontend implementation evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend integration handoff.
- `MODULE_WORKFLOW_MAP.md` — Cross-module workflow mapping.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role and branch behavior evidence.
- `BACKEND_GAPS_AND_RISKS.md` — Backend design risks.
- `MEMORY.md` — Approved decisions.
- `RULES.md` — Engineering rules.
- `AGENTS.md` — AI coding-agent instructions.
- `PROGRESS.md` — Verified development progress.

Use actual repository paths when establishing relative Markdown links.

---

## 28. Final Implementation Boundary

### Confirmed Requirements

- Five current frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation access.
- Assignment-based running Teacher Payroll without monthly generation.
- Multiple authorized branches.
- Current branch creation pause.
- Connected Admissions, Enrollment, Fees, Finance and Reports workflows.
- Physical Assets inventory without media uploads.

### Proposed Technical Design

- HTTP-based data transfer.
- Backend domain coordination.
- MongoDB transaction boundaries.
- Idempotency and concurrency mechanisms.
- Frontend cache invalidation strategy.
- Notification synchronization and error recovery.

### Deferred

- Platform Admin and commercial multi-client SaaS.
- Cloudinary and media uploads.
- Unsupported financial reversals.
- Automatic monthly salary generation.
- Unnecessary distributed infrastructure.

### Not Implemented

- Production API data flows.
- MongoDB-backed domain operations.
- Production session and branch authorization.
- Backend transaction handlers.
- Real multi-user synchronization.

**Governing Principle:** Every operation must update the correct authoritative records, preserve academic and financial integrity, enforce authorized user/branch scope and refresh dependent views without creating inconsistent or duplicated business data.

**Document Status:** DRAFT — Ready for integration design review; implementation requires separately approved backend tickets.
