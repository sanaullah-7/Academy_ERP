# ADR

<!-- > Purpose: ARD ka matlab yahan Application Requirements Document rakhenge. Ye TSA Academy ERP ki application-level requirements ka central reference hoga—PRD mein kya aur kyun, jabke ARD mein har module ko exactly kya karna chahiye document hoga. -->

# TSA Academy ERP — Application Requirements Document (ARD)

**Document:** ARD.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Requirements Baseline; Backend Acceptance Pending
**Document Category:** Core Requirements
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Product Scope:** Single Academy, Multiple Branches
**Repository:** `Client/`, `Server/`, `docs/`

---

## 1. Document Purpose

The Application Requirements Document (ARD) defines the functional, security, data, integration, operational and quality requirements of TSA Academy ERP.

Its purpose is to establish a central application-level requirements baseline for:

- Product owners.
- Frontend developers.
- Backend developers.
- Database engineers.
- Quality assurance engineers.
- Deployment operators.
- AI coding agents.
- Client acceptance reviewers.

This document describes expected application behavior rather than prescribing every implementation detail.

Technical implementation designs are maintained in the corresponding architecture, database, API, security and development specifications.

**Important:** Writing this document does not authorize application code changes, backend implementation, database migrations or deployment.

---

## 2. Product Overview

TSA Academy ERP is an academy management system for managing administrative, academic, financial and operational activities.

The system is intended initially for a single academy organization operating multiple authorized branches.

### Primary Capabilities

1. Academy operations management.
2. Role-based staff access.
3. Branch-aware administration.
4. Student admission management.
5. Student enrollment and academic records.
6. Courses, subjects and batches.
7. Faculty and class assignments.
8. Student fee collection.
9. Financial oversight and expenses.
10. Assignment-based Teacher Payroll.
11. Teacher self-service.
12. Demo class management.
13. Physical inventory.
14. Reports and ledgers.
15. Audit records.
16. Academy settings and branding.

### Current Delivery Direction

The initial product is a hosted web application.

The React frontend is the existing functional demonstration baseline. Backend integration is to be implemented and verified incrementally.

---

## 3. Scope Classification

Requirements must be classified using the following statuses.

| Classification | Meaning |
|---|---|
| CONFIRMED | Explicitly approved business requirement |
| EXISTING_FRONTEND | Behavior represented by the current frontend; verify source details |
| PROPOSED | Technical or product approach awaiting approval |
| TBD | Decision not finalized |
| DEFERRED | Outside initial approved scope |
| SUPERSEDED | Older rule replaced by a later decision |

### Interpretation Rules

- CONFIRMED does not imply backend implementation.
- EXISTING_FRONTEND does not imply production persistence.
- PROPOSED does not authorize implementation.
- TBD items must not be silently invented.
- DEFERRED items must not enter active development without approval.
- SUPERSEDED behavior must not be restored accidentally.

---

## 4. Business Objectives

The ERP must support the following business outcomes:

**ARD-OBJ-001:** Centralize academic and administrative records.

**ARD-OBJ-002:** Improve the management of multiple academy branches.

**ARD-OBJ-003:** Give staff access according to approved responsibilities.

**ARD-OBJ-004:** Track the student admission-to-enrollment lifecycle.

**ARD-OBJ-005:** Maintain accurate student fee obligations and collections.

**ARD-OBJ-006:** Track Teacher remuneration against individual teaching assignments.

**ARD-OBJ-007:** Maintain reliable Expense and Finance information.

**ARD-OBJ-008:** Allow Teachers to review their own professional and salary records.

**ARD-OBJ-009:** Provide meaningful operational reports.

**ARD-OBJ-010:** Protect personal, financial and historical data.

**ARD-OBJ-011:** Support client testing through a hosted web demonstration.

**ARD-OBJ-012:** Keep the architecture maintainable and extensible without unnecessary infrastructure.

---

## 5. Users and Roles

### Confirmed Roles

The application currently supports exactly five business roles:

| Role | Primary responsibility |
|---|---|
| Super Admin | Approved academy administration |
| Admin | Authorized administrative and operational functions |
| Receptionist | Full approved Admissions and Fees operations |
| Owner | Approved business oversight and financial access |
| Teacher | Own teaching, profile and compensation information |

### General Requirements

**ARD-RBAC-001:** Protected operations must require authentication.

**ARD-RBAC-002:** The backend must enforce effective action permissions independently of frontend navigation.

**ARD-RBAC-003:** Authorization must include organization, branch and record ownership as applicable.

**ARD-RBAC-004:** A user may have different roles in different branches.

**ARD-RBAC-005:** Unsupported same-branch multiple-role combinations must fail closed pending final policy.

**ARD-RBAC-006:** Unknown roles or permissions must not receive fallback privileges.

**ARD-RBAC-007:** Changes to user access must affect subsequent protected requests.

**ARD-RBAC-008:** Protected financial exports require the same relevant authorization as ordinary financial reads.

Detailed action-level grants must follow `RBAC_PERMISSIONS.md`.

---

## 6. Receptionist Requirements

**Status: CONFIRMED**

Receptionist has Full Access to the existing approved Admissions and Fees modules within the relevant authorized branch.

### Admissions

Receptionist must be able to perform approved:

- Viewing.
- Searching and filtering.
- Creation.
- Editing.
- Approval.
- Return to Pending.
- Enrollment.
- Instant admission completion.
- Guarded deletion.

### Fees

Receptionist must be able to perform approved:

- Challan operations.
- Student fee ledger viewing.
- Fee collection.
- Partial payments.
- Verified payment history viewing.
- Receipt operations.
- Applicable fee operations within instant admission.

### Explicit Restrictions

Receptionist must not receive independent access to:

- Finance Overview.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branches.
- Users.
- Administrative Settings.

### Business Constraints

Full module access does not bypass:

- Payment amount validation.
- Branch ownership.
- Duplicate-payment controls.
- Admission status rules.
- Enrollment capacity.
- Protected deletion restrictions.

Unsupported refunds and reversals are not automatically authorized.

---

## 7. Teacher Requirements

**Status: CONFIRMED**

Teachers must access their authorized self-service interface.

### Route

`/my-profile`

### Required Tabs

1. Overview & Bio.
2. Class Schedule & Timetable.
3. Academic Assignments.
4. Salary & Compensation.

### Functional Requirements

**ARD-TEA-001:** The authenticated Teacher may view their own profile.

**ARD-TEA-002:** The Teacher may view their own teaching timetable.

**ARD-TEA-003:** The Teacher may view their own academic assignments.

**ARD-TEA-004:** The Teacher may view their own approved Salary Agreements.

**ARD-TEA-005:** The Teacher may view agreed remuneration, paid amounts and outstanding amounts.

**ARD-TEA-006:** The Teacher may view verified salary payment history.

**ARD-TEA-007:** The Teacher may print or download approved payslips.

**ARD-TEA-008:** The Teacher may receive authorized salary-related notifications.

**ARD-TEA-009:** The Teacher must not access another Teacher's salary or payslip.

**ARD-TEA-010:** Self-service access must not grant administrative Teacher Payroll permissions.

### Security

Teacher identity must be derived from authenticated backend context.

A browser-supplied `teacherId` is not authorization to access another Teacher's information.

---

## 8. Academy and Branch Requirements

**Status: CONFIRMED**

The initial system serves one academy organization with multiple branches.

### Requirements

**ARD-BRN-001:** An authorized user may belong to one or more branches.

**ARD-BRN-002:** Users with multiple authorized branches may select an active branch.

**ARD-BRN-003:** The effective role must correspond to the selected branch.

**ARD-BRN-004:** Branch switching must update applicable permissions and displayed data.

**ARD-BRN-005:** Protected records must remain associated with their correct branch.

**ARD-BRN-006:** Unauthorized branch access must be denied.

**ARD-BRN-007:** Authorized cross-branch reports must use explicitly permitted scope.

**ARD-BRN-008:** Cross-branch reporting permission must not automatically grant cross-branch editing.

**ARD-BRN-009:** Unsupported same-branch multiple-role combinations must fail closed.

**ARD-BRN-010:** **Creation of new branches is currently paused for all roles, including Super Admin.**

### Deferred

Platform Admin and multi-academy SaaS provisioning are outside the initial scope.

---

# PART A — FUNCTIONAL MODULE REQUIREMENTS

## 9. Dashboard

**Module ID:** MOD-01

### Purpose

Present relevant academic, administrative and financial summaries to authorized users.

### Requirements

**ARD-DASH-001:** Display permitted dashboard information for the authenticated user.

**ARD-DASH-002:** Respect active branch context.

**ARD-DASH-003:** Display relevant Student and Admission summaries.

**ARD-DASH-004:** Display approved Enrollment and Batch information.

**ARD-DASH-005:** Show financial information only to authorized roles.

**ARD-DASH-006:** Calculate collected revenue from applicable verified Fee Payments.

**ARD-DASH-007:** Use applicable Posted Expenses for financial projections.

**ARD-DASH-008:** Refresh dependent summaries after successful committed changes.

**ARD-DASH-009:** Do not expose confidential Teacher remuneration to unauthorized users.

### Acceptance

Dashboard figures must agree with authoritative domain records.

---

## 10. Admissions

**Module ID:** MOD-02

### Purpose

Manage the applicant admission lifecycle and its connections to Students and Enrollments.

### Approved Status Model

- Pending.
- Approved.
- Permitted return to Pending.

The older Reject workflow is **SUPERSEDED**.

### Requirements

**ARD-ADM-001:** Authorized users may view and search Admissions.

**ARD-ADM-002:** Authorized users may create valid Admissions.

**ARD-ADM-003:** Required applicant information must be validated.

**ARD-ADM-004:** Valid relationships must be maintained with Student, Course and Batch records where applicable.

**ARD-ADM-005:** Authorized users may edit permitted fields.

**ARD-ADM-006:** Approved state transitions must be enforced.

**ARD-ADM-007:** Invalid state transitions must be rejected.

**ARD-ADM-008:** Authorized Receptionists must be able to perform the approved Admissions workflow.

**ARD-ADM-009:** Deletion must respect linked Enrollment and financial relationships.

**ARD-ADM-010:** Records must remain within permitted organization/branch scope.

**ARD-ADM-011:** Duplicate requests must not create unintended duplicate Admissions.

### Acceptance

A completed admission operation must leave valid records in the intended business state.

---

## 11. Students

**Module ID:** MOD-03

### Purpose

Maintain Student identities and related academic information.

### Requirements

**ARD-STU-001:** Authorized users may list Students.

**ARD-STU-002:** Authorized users may view Student details.

**ARD-STU-003:** Required student information must be validated.

**ARD-STU-004:** Student records must maintain their Admission relationships.

**ARD-STU-005:** Student records must maintain their Enrollment relationships.

**ARD-STU-006:** Search and approved filtering must work.

**ARD-STU-007:** Protected relationships must prevent unsafe deletion.

**ARD-STU-008:** Branch and record ownership must be enforced.

**ARD-STU-009:** Student updates must preserve associated valid financial history.

### Open Decision

The final rules for Student identity shared across branches require source and ERD verification.

Do not merge same-named Students automatically.

---

## 12. Courses & Batches

**Module ID:** MOD-04

### Purpose

Manage academic offerings and teaching groups.

### Entities

- Course.
- Batch.
- Subject.
- Stream, where applicable.

### Requirements

**ARD-ACD-001:** Authorized users may manage approved Course records.

**ARD-ACD-002:** Subjects and Streams must follow supported relationships.

**ARD-ACD-003:** Batches must reference valid academic entities.

**ARD-ACD-004:** Batch capacity must be validated.

**ARD-ACD-005:** Existing Enrollments must influence appropriate occupancy calculations.

**ARD-ACD-006:** Duplicate or incompatible academic references must be rejected.

**ARD-ACD-007:** Historical referenced records must be protected from unsafe deletion.

**ARD-ACD-008:** Branch ownership must be preserved.

### Acceptance

Academic references must remain valid across Admissions, Enrollment, Faculty and Fees.

---

## 13. Faculty & Classes

**Module ID:** MOD-05

### Purpose

Manage Teachers, academic assignments and class schedules.

### Requirements

**ARD-FAC-001:** Authorized users may view relevant Faculty records.

**ARD-FAC-002:** Teaching assignments must identify the correct Teacher.

**ARD-FAC-003:** Assignments must reference valid Course, Batch and Subject relationships.

**ARD-FAC-004:** Assignments must preserve branch ownership.

**ARD-FAC-005:** Approved timetable functionality must be supported.

**ARD-FAC-006:** Teacher self-service must display relevant own assignments.

**ARD-FAC-007:** Historical assignments must remain traceable where required by Payroll.

**ARD-FAC-008:** An assignment modification must not silently erase existing salary obligations.

### Acceptance

Academic assignment information must agree with Teacher My Profile and related Payroll records.

---

## 14. Fees

**Module ID:** MOD-06

### Purpose

Manage student fee obligations, challans, collections, receipts and ledgers.

### Requirements

**ARD-FEE-001:** Valid Enrollment records may produce approved Challans.

**ARD-FEE-002:** Preserve the approved one-Challan-per-Enrollment behavior where applicable.

**ARD-FEE-003:** Challan payable amounts must follow verified fee calculation rules.

**ARD-FEE-004:** Authorized users may view fee obligations.

**ARD-FEE-005:** Authorized users may record approved Fee Payments.

**ARD-FEE-006:** Partial payments must be supported.

**ARD-FEE-007:** Invalid amounts and unsupported overpayments must be rejected.

**ARD-FEE-008:** Duplicate payment submissions must not create unintended duplicate collections.

**ARD-FEE-009:** Payment verification status must be represented accurately.

**ARD-FEE-010:** Only applicable Verified Fee Payments may contribute to confirmed collected revenue.

**ARD-FEE-011:** Outstanding balances must be calculated accurately.

**ARD-FEE-012:** Receipts must reference actual committed payments.

**ARD-FEE-013:** Receptionist has full approved Fees access within scope.

**ARD-FEE-014:** Fee Payments must preserve their history and auditability.

**ARD-FEE-015:** Branch and Student/Challan relationships must be validated.

### Conceptual Balance

`Outstanding Fees = Approved Challan Payable − Valid Applied Verified Payments`

The final calculation must follow approved financial status, precision and adjustment rules.

### Restrictions

Do not introduce unapproved recurring Challans, refunds or reversal workflows.

---

## 15. Finance Overview

**Module ID:** MOD-07

### Purpose

Provide authorized financial summaries.

### Requirements

**ARD-FIN-001:** Show confirmed collected revenue using eligible Verified Fee Payments.

**ARD-FIN-002:** Show applicable Posted Expenses.

**ARD-FIN-003:** Include posted Teacher Payroll Expenses correctly.

**ARD-FIN-004:** Prevent duplicate counting.

**ARD-FIN-005:** Support approved date and branch filters.

**ARD-FIN-006:** Enforce financial viewing permissions.

**ARD-FIN-007:** Produce summaries consistent with Reports and Ledgers.

**ARD-FIN-008:** Do not use editable dashboard cache values as authoritative transaction balances.

### Access

Receptionist and Teacher do not receive independent Finance Overview access.

Owner permissions must follow the verified action-level registry.

---

## 16. Expenses

**Module ID:** MOD-08

### Purpose

Maintain approved operating and payroll-related expenses.

### Requirements

**ARD-EXP-001:** Authorized users may view permitted Expenses.

**ARD-EXP-002:** Authorized users may perform approved Expense creation and updates.

**ARD-EXP-003:** Amounts must be validated.

**ARD-EXP-004:** Expenses must belong to the correct branch.

**ARD-EXP-005:** Posting states must be respected.

**ARD-EXP-006:** Payroll-linked Expenses must reference the correct Salary Payment.

**ARD-EXP-007:** The same Payroll Payment must not produce duplicate Expenses.

**ARD-EXP-008:** Historical financial records must be protected.

**ARD-EXP-009:** Finance and Reports must reflect valid posted Expenses.

### Access

Receptionist does not have independent Expenses access.

Exact Owner write permissions require source-level verification.

---

## 17. Teacher Payroll

**Module ID:** MOD-09

**Status: CONFIRMED — Critical Business Requirement**

### Purpose

Manage Teacher remuneration using independent teaching assignment obligations and running outstanding balances.

### Fundamental Rule

Teacher Payroll is **assignment/batch/subject-based**, not automatically recurring monthly salary.

### Requirements

**ARD-PAY-001:** Salary Agreements must relate to valid Faculty Assignments.

**ARD-PAY-002:** Support approved Fixed remuneration.

**ARD-PAY-003:** Support approved Percentage remuneration.

**ARD-PAY-004:** Verify calculation formulas against existing frontend source and tests.

**ARD-PAY-005:** Preserve separate obligations for separate assignments.

**ARD-PAY-006:** Preserve historical Salary Agreements and payments.

**ARD-PAY-007:** Calculate the current running payable amount accurately.

**ARD-PAY-008:** Support approved partial Salary Payments.

**ARD-PAY-009:** Support approved full settlement.

**ARD-PAY-010:** Reject payment above applicable outstanding remuneration.

**ARD-PAY-011:** Prevent duplicate salary disbursement.

**ARD-PAY-012:** Prevent unsafe concurrent overpayment.

**ARD-PAY-013:** Preserve outstanding remuneration when an assignment ends.

**ARD-PAY-014:** Do not reset obligations merely because the calendar month changes.

**ARD-PAY-015:** Do not automatically generate monthly salary obligations.

**ARD-PAY-016:** Link each applicable committed Salary Payment to its correct Posted Expense.

**ARD-PAY-017:** Prevent orphaned Salary Payment/Expense outcomes.

**ARD-PAY-018:** Update authorized administrative Payroll and Teacher My Profile views.

**ARD-PAY-019:** Preserve appropriate Payslip and notification behavior.

**ARD-PAY-020:** Restrict Payroll management according to RBAC.

### Conceptual Calculation

`Outstanding Assignment Salary = Approved Assignment Payable − Valid Applied Salary Payments`

Final computations must respect actual agreement semantics, revisions and money precision.

### Source Verification

Inspect the current frontend salary implementation, including applicable discovered files such as:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`

These paths must be verified before relying on them.

### Critical Acceptance

A new calendar month must not create another payable salary obligation without a separately approved business event.

---

## 18. Demo Classes

**Module ID:** MOD-10

### Purpose

Manage demo inquiries and their approved progression toward admission.

### Requirements

**ARD-DEMO-001:** Authorized users may register demo inquiries.

**ARD-DEMO-002:** Required inquiry information must be validated.

**ARD-DEMO-003:** Approved attendance and status behavior must be supported.

**ARD-DEMO-004:** Existing cancellation and no-show behavior must be preserved where implemented.

**ARD-DEMO-005:** Approved conversion may prefill/link Admissions.

**ARD-DEMO-006:** Duplicate conversions must be prevented.

**ARD-DEMO-007:** Branch ownership must be enforced.

**ARD-DEMO-008:** Conversion must not fabricate payments or Enrollments.

---

## 19. Assets

**Module ID:** MOD-11

### Purpose

Maintain physical academy equipment inventory.

### Requirements

**ARD-AST-001:** Authorized users may manage approved physical Asset records.

**ARD-AST-002:** Assets must have valid identifiers.

**ARD-AST-003:** Assets must belong to the correct branch.

**ARD-AST-004:** Staff assignment and unassignment must follow approved workflows.

**ARD-AST-005:** Inspection history must be preserved.

**ARD-AST-006:** Maintenance history must be preserved.

**ARD-AST-007:** Asset condition/status must follow approved options.

**ARD-AST-008:** Inventory reports must agree with source records.

### Explicit Exclusions

Assets does not mean digital media management.

The initial scope excludes:

- Cloudinary.
- General image/video upload infrastructure.
- Automatic depreciation.
- Unapproved disposal.
- Automatic maintenance Expense posting.

---

## 20. Reports & Ledgers

**Module ID:** MOD-12

### Purpose

Provide authorized operational and financial reporting.

### Requirements

**ARD-REP-001:** Generate approved academic summaries.

**ARD-REP-002:** Support valid Admissions and Student reports.

**ARD-REP-003:** Support Enrollment and Batch reports.

**ARD-REP-004:** Support Faculty Assignment reports.

**ARD-REP-005:** Support student fee ledgers.

**ARD-REP-006:** Calculate Verified Fee collection totals correctly.

**ARD-REP-007:** Calculate applicable Expense totals correctly.

**ARD-REP-008:** Provide assignment-based Payroll information to authorized roles.

**ARD-REP-009:** Respect date and branch filters.

**ARD-REP-010:** Restrict sensitive Teacher compensation.

**ARD-REP-011:** Prevent duplicate aggregation counting.

**ARD-REP-012:** Preserve approved print/export functionality.

### Acceptance

Reports must reconcile with authoritative domain records and authorized scope.

---

## 21. Audit Log

**Module ID:** MOD-13

### Purpose

Provide protected history of important business and security activities.

### Requirements

**ARD-AUD-001:** Record required important committed business actions.

**ARD-AUD-002:** Associate events with the appropriate actor.

**ARD-AUD-003:** Preserve relevant organization/branch and resource references.

**ARD-AUD-004:** Restrict Audit Log viewing.

**ARD-AUD-005:** Protect events from ordinary unauthorized editing.

**ARD-AUD-006:** Avoid storing plaintext credentials and unnecessary confidential details.

**ARD-AUD-007:** Distinguish business Audit events from temporary diagnostic logs.

### Relevant Events

Examples include:

- Admission approval.
- Enrollment.
- Verified Fee Payment.
- Salary Agreement revision.
- Payroll disbursement.
- Posted Expense.
- Protected User/role update.

---

## 22. Branches

**Module ID:** MOD-14

### Purpose

Manage permitted branch information and authorized branch selection.

### Requirements

**ARD-BRA-001:** Authorized users may view relevant branches.

**ARD-BRA-002:** Staff members may select assigned branches.

**ARD-BRA-003:** Effective permissions must follow current branch context.

**ARD-BRA-004:** Unauthorized branch access must fail.

**ARD-BRA-005:** Relevant branch information must remain consistent.

**ARD-BRA-006:** **New branch creation must remain disabled for all roles until explicitly reapproved.**

### Important

Branch creation restrictions cannot be bypassed through direct backend API calls.

---

## 23. Users

**Module ID:** MOD-15

### Purpose

Manage authorized staff identities and branch-specific role assignments.

### Requirements

**ARD-USR-001:** Authorized administrators may view staff records.

**ARD-USR-002:** Approved account creation must use secure credential provisioning.

**ARD-USR-003:** User identity must remain stable across branch assignments.

**ARD-USR-004:** Different roles across branches must be supported.

**ARD-USR-005:** Protected privileged roles must not be escalated by unauthorized administrators.

**ARD-USR-006:** Account activation/deactivation must affect authentication.

**ARD-USR-007:** Role or branch assignment changes must update effective authorization.

**ARD-USR-008:** Unsupported same-branch multi-role combinations must fail closed.

**ARD-USR-009:** User edits must reject unapproved protected fields.

**ARD-USR-010:** User administration must not expose password hashes.

---

## 24. Settings

**Module ID:** MOD-16

### Purpose

Maintain authorized academy identity, branding and application configuration.

### Requirements

**ARD-SET-001:** Display existing approved Academy Settings.

**ARD-SET-002:** Support approved academy display-name customization.

**ARD-SET-003:** Preserve existing branding and theme behavior.

**ARD-SET-004:** Validate editable settings.

**ARD-SET-005:** Restrict Settings writes to authorized roles.

**ARD-SET-006:** Preserve branch-specific configuration ownership where applicable.

**ARD-SET-007:** Use safe defaults when optional appearance settings are unavailable.

**ARD-SET-008:** Changes to branding must not alter financial calculations, permissions or historical ownership.

### Media Restriction

Do not add general-purpose media upload infrastructure without separate approval.

---

# PART B — CROSS-MODULE WORKFLOWS

## 25. Student Admission-to-Fee Workflow

The approved workflow connects:

```text
Student
   |
   v
Admission
   |
   v
Enrollment
   |
   v
Challan
   |
   v
Optional Valid Verified Fee Payment
```

### Requirements

**ARD-FLOW-001:** Preserve correct linked identities.

**ARD-FLOW-002:** Validate academic eligibility.

**ARD-FLOW-003:** Validate Batch capacity.

**ARD-FLOW-004:** Prevent duplicate Enrollment.

**ARD-FLOW-005:** Preserve the approved one-Challan-per-Enrollment behavior.

**ARD-FLOW-006:** Protect payment verification.

**ARD-FLOW-007:** Prevent partial committed outcomes where coordinated atomicity is required.

**ARD-FLOW-008:** Handle repeated requests safely.

---

## 26. Faculty-to-Payroll Workflow

```text
Teacher
   |
   v
Faculty Assignment
   |
   v
Salary Agreement
   |
   v
Assignment-Specific Payable
   |
   v
Partial / Full Salary Payment
   |
   +--> Running Outstanding
   |
   +--> Linked Posted Expense
   |
   +--> Finance and Reports
   |
   +--> Teacher My Profile
```

### Requirements

- Use correct Teacher identity.
- Preserve independent assignment obligations.
- Apply verified Fixed/Percentage calculations.
- Preserve historical payments.
- Prevent duplicate Salary Payments.
- Ensure consistent Expense posting.
- Update relevant projections.
- Prevent unauthorized salary disclosure.

---

## 27. Demo-to-Admission Workflow

The Demo Classes module may link an approved inquiry to an Admission.

### Requirements

- Preserve inquiry identity.
- Validate eligibility for conversion.
- Prevent duplicate conversion.
- Maintain branch scope.
- Preserve current prefill behavior.
- Avoid creating unrelated payment records.

---

## 28. Financial Reporting Workflow

Finance and Reports must derive their figures from authoritative records.

### Verified Revenue

Eligible Verified Fee Payments.

### Expenses

Applicable Posted Expenses, including correct Payroll-linked Expenses.

### Payroll Outstanding

Approved assignment payables less valid applied Salary Payments.

### Critical

Cached or browser-computed summaries must not authorize payment acceptance.

---

# PART C — NON-FUNCTIONAL REQUIREMENTS

## 29. Security Requirements

**ARD-SEC-001:** Require backend authentication for protected APIs.

**ARD-SEC-002:** Hash passwords securely.

**ARD-SEC-003:** Use an approved secure session mechanism.

**ARD-SEC-004:** Support logout and session revocation.

**ARD-SEC-005:** Enforce five-role permissions server-side.

**ARD-SEC-006:** Enforce organization and branch ownership.

**ARD-SEC-007:** Enforce record-level ownership for confidential information.

**ARD-SEC-008:** Protect Teacher compensation.

**ARD-SEC-009:** Prevent privilege escalation.

**ARD-SEC-010:** Validate all writable API fields.

**ARD-SEC-011:** Protect against relevant injection and mass-assignment risks.

**ARD-SEC-012:** Use HTTPS in deployed authenticated environments.

**ARD-SEC-013:** Configure CORS and CSRF protections appropriately.

**ARD-SEC-014:** Prevent exposure of database credentials and session secrets.

**ARD-SEC-015:** Protect confidential report exports.

The final technical mechanisms are defined by security and deployment documents.

---

## 30. Data Integrity Requirements

**ARD-DATA-001:** Preserve stable entity identities.

**ARD-DATA-002:** Validate required foreign references.

**ARD-DATA-003:** Preserve correct academy/branch ownership.

**ARD-DATA-004:** Prevent unintended duplicate Enrollments.

**ARD-DATA-005:** Prevent duplicate Challans where uniqueness is required.

**ARD-DATA-006:** Preserve Verified Fee Payment history.

**ARD-DATA-007:** Preserve independent Payroll obligations.

**ARD-DATA-008:** Preserve Salary Payment/Expense relationships.

**ARD-DATA-009:** Protect relevant historical records from unsafe deletion.

**ARD-DATA-010:** Use appropriate transaction and concurrency safeguards.

**ARD-DATA-011:** Maintain valid audit and migration history where applicable.

---

## 31. Monetary Requirements

**ARD-MONEY-001:** Financial amounts must use a consistent approved representation.

**ARD-MONEY-002:** Rounding must follow the finalized business contract.

**ARD-MONEY-003:** Invalid negative payments must be rejected.

**ARD-MONEY-004:** Unsupported overpayments must be rejected.

**ARD-MONEY-005:** Duplicate financial submissions must be safely handled.

**ARD-MONEY-006:** Fee balances must reflect applicable verified payments.

**ARD-MONEY-007:** Salary balances must reflect valid assignment obligations and payments.

**ARD-MONEY-008:** Payroll-linked Expenses must remain consistent.

### Open Decisions

Exact stored monetary representation, Percentage salary semantics and rounding rules require verification and approval.

---

## 32. Performance Requirements

**ARD-PERF-001:** Support responsive authorized record access.

**ARD-PERF-002:** Use bounded pagination for large collections.

**ARD-PERF-003:** Use appropriate MongoDB indexes.

**ARD-PERF-004:** Avoid unnecessary repeated queries.

**ARD-PERF-005:** Optimize reporting through correct aggregation.

**ARD-PERF-006:** Prevent stale cache access after branch switches.

**ARD-PERF-007:** Invalidate financial projections after relevant committed changes.

**ARD-PERF-008:** Do not sacrifice correctness or authorization for speed.

Quantitative response-time targets remain TBD.

---

## 33. Reliability Requirements

**ARD-REL-001:** Prevent false success after failed database writes.

**ARD-REL-002:** Handle expected API errors consistently.

**ARD-REL-003:** Support safe transaction retries where appropriate.

**ARD-REL-004:** Do not automatically retry ambiguous payment writes without idempotency.

**ARD-REL-005:** Expose safe service health/readiness information where implemented.

**ARD-REL-006:** Preserve application stability during optional service failures.

**ARD-REL-007:** Maintain recoverability of authoritative data.

---

## 34. Usability Requirements

**ARD-UX-001:** Preserve approved React frontend navigation.

**ARD-UX-002:** Maintain role-appropriate module visibility.

**ARD-UX-003:** Display useful validation errors.

**ARD-UX-004:** Provide appropriate loading and empty states.

**ARD-UX-005:** Preserve relevant user form state after recoverable errors.

**ARD-UX-006:** Clearly distinguish payable, paid and outstanding amounts.

**ARD-UX-007:** Maintain usable responsive layouts.

**ARD-UX-008:** Maintain approved academy branding.

**ARD-UX-009:** Preserve accessible status and focus indications.

**ARD-UX-010:** Do not show success before required backend persistence.

---

## 35. Audit and Observability Requirements

**ARD-OBS-001:** Record safe operational errors.

**ARD-OBS-002:** Support request correlation.

**ARD-OBS-003:** Record important authorization failures appropriately.

**ARD-OBS-004:** Preserve required business Audit events.

**ARD-OBS-005:** Protect secrets from logs.

**ARD-OBS-006:** Detect meaningful database failures.

**ARD-OBS-007:** Support investigation of financial discrepancies.

**ARD-OBS-008:** Distinguish diagnostic logs from business Audit records.

---

## 36. Backup and Recovery Requirements

**ARD-BACK-001:** Establish an approved database backup strategy before production use.

**ARD-BACK-002:** Protect backups against unauthorized access.

**ARD-BACK-003:** Define recovery objectives.

**ARD-BACK-004:** Verify restoration in an appropriate isolated environment.

**ARD-BACK-005:** Preserve academic relationships after restore.

**ARD-BACK-006:** Reconcile Verified Fee Payments after restore.

**ARD-BACK-007:** Reconcile running Teacher Payroll after restore.

**ARD-BACK-008:** Reconcile Payroll-linked Expenses.

**ARD-BACK-009:** Prevent accidental reactivation of revoked account access.

**ARD-BACK-010:** Account for valid transactions occurring after the selected recovery point.

---

# PART D — INTEGRATION REQUIREMENTS

## 37. Frontend-to-Backend Integration

### Current Flow

```text
React Page
    |
    v
Domain Service
    |
    v
Mock Adapter
    |
    v
Browser localStorage
```

### Target Flow

```text
React Page
    |
    v
Domain Service
    |
    v
HTTP Adapter
    |
    v
Express API
    |
    v
Domain Service / Repository
    |
    v
MongoDB
```

### Requirements

**ARD-INT-001:** Preserve existing frontend service interfaces where practical.

**ARD-INT-002:** Match approved request/response contracts.

**ARD-INT-003:** Use authenticated backend identity and branch scope.

**ARD-INT-004:** Handle network and validation errors.

**ARD-INT-005:** Prevent stale data between branch switches.

**ARD-INT-006:** Prevent false financial success.

**ARD-INT-007:** Preserve printing and exports.

**ARD-INT-008:** Avoid automatic mock-data import.

**ARD-INT-009:** Maintain clear identification of mock-backed versus backend-backed modules during transition.

---

## 38. External Integration Policy

The initial system does not automatically require external services.

Potential future integrations include:

- Email.
- SMS.
- Payment gateways.
- External accounting.
- Attendance devices.
- File storage.

### Requirements

Every external integration must have:

- Approved purpose.
- Defined data contract.
- Explicit authorization.
- Secure credentials.
- Error and retry policy.
- Data privacy review.
- Testing plan.
- Operational ownership.

### Deferred

Cloudinary and general media uploads are not currently approved.

---

# PART E — TESTING AND ACCEPTANCE

## 39. Functional Acceptance

Every implemented module must demonstrate:

1. Approved operations function.
2. Required validation works.
3. Role permissions work.
4. Branch ownership is correct.
5. Data relationships remain valid.
6. Error handling is correct.
7. Relevant integrations behave consistently.
8. Actual tests have passed.

---

## 40. Security Acceptance

At minimum:

- Protected APIs reject unauthenticated requests.
- Unauthorized roles are denied.
- Cross-branch access is restricted.
- Admin escalation is blocked.
- Receptionist Admissions/Fees operations are allowed.
- Receptionist independent Finance/Payroll access is denied.
- Teacher accesses only their own salary.
- Protected exports remain secure.
- Branch creation remains paused.

---

## 41. Financial Acceptance

Critical scenarios include:

- Valid Challan creation.
- Correct payable calculation.
- Partial Fee Payment.
- Full Fee Payment.
- Duplicate collection prevention.
- Verified revenue accounting.
- Independent salary obligations.
- Fixed/Percentage salary calculation.
- Partial Salary Payment.
- Full Salary Payment.
- No monthly salary auto-generation.
- Historical outstanding preservation.
- Payment-to-Expense atomicity.
- Consistent Finance and Reports.

### Release Rule

Known critical financial inconsistencies must block release until resolved or handled through an explicitly approved risk process.

---

## 42. Regression Acceptance

Changes must not break:

- Login and roles.
- Branch selection.
- Admissions.
- Students.
- Courses and Batches.
- Faculty.
- Fees.
- Finance.
- Expenses.
- Payroll.
- Teacher My Profile.
- Demo Classes.
- Assets.
- Reports.
- Audit.
- Users.
- Settings.
- Relevant exports.

The actual regression test scope should follow change impact.

---

## 43. Client Acceptance

Client evaluation is separate from technical verification.

### Required Distinctions

- Feature implemented.
- Feature tested.
- Feature deployed.
- Feature demonstrated.
- Feature accepted.

Client feedback must be classified as:

- Defect.
- Approved change.
- New feature request.
- Unresolved requirement.
- Accepted behavior.

Do not treat a new feature request as proof that an existing feature was defective.

---

# PART F — IMPLEMENTATION GOVERNANCE

## 44. Development Boundaries

**ARD-DEV-001:** Read `AGENTS.md` before approved implementation.

**ARD-DEV-002:** Follow the active development ticket.

**ARD-DEV-003:** Inspect actual source rather than relying on assumptions.

**ARD-DEV-004:** Preserve existing explanatory comments.

**ARD-DEV-005:** Avoid unrelated refactoring.

**ARD-DEV-006:** Avoid unnecessary dependencies.

**ARD-DEV-007:** Use targeted relevant tests.

**ARD-DEV-008:** Preserve unrelated Git changes.

**ARD-DEV-009:** Do not automatically commit, push or deploy.

**ARD-DEV-010:** Report actual changed files and executed tests.

---

## 45. Prioritization

The proposed dependency-based implementation order is:

1. Backend foundation.
2. Authentication, roles and branch scope.
3. Academic reference entities.
4. Students and Admissions.
5. Enrollment and Challans.
6. Verified Fee Payments.
7. Faculty Assignments and Timetables.
8. Running Teacher Payroll.
9. Expenses and Finance.
10. Teacher My Profile.
11. Demo Classes and Assets.
12. Reports and Dashboard.
13. Audit, Notifications and Settings.
14. Full frontend HTTP integration.
15. Regression, deployment and client evaluation.

This is a proposed dependency sequence, not a record of completed implementation.

---

## 46. Requirement Traceability

Requirements should map to implementation and test evidence.

### Suggested Traceability Table

| Requirement ID | Module | Ticket | Test | Status |
|---|---|---|---|---|
| ARD-RBAC-002 | Authorization | TBD | RBAC API tests | PLANNED |
| ARD-ADM-006 | Admissions | TBD | Admission transition tests | PLANNED |
| ARD-FEE-010 | Fees/Finance | TBD | Verified revenue test | PLANNED |
| ARD-PAY-015 | Payroll | TBD | No monthly auto-generation test | PLANNED |
| ARD-PAY-016 | Payroll/Expenses | TBD | Transaction consistency test | PLANNED |
| ARD-TEA-009 | Teacher Profile | TBD | Salary ownership test | PLANNED |
| ARD-BRN-010 | Branches | TBD | Branch creation denial test | PLANNED |

Do not mark requirements COMPLETE without implementation and appropriate evidence.

---

## 47. Change Control

Any change to confirmed product requirements must:

1. Identify the existing requirement.
2. Explain the requested change.
3. Evaluate affected modules.
4. Identify security and financial impacts.
5. Obtain explicit owner approval.
6. Update relevant specifications.
7. Create or revise implementation tickets.
8. Add appropriate tests.
9. Record actual completion.

### Critical Rule

Do not silently replace an owner-approved requirement with an AI-generated assumption.

---

## 48. Open Requirements

The following remain unresolved or require source-level confirmation:

| ID | Decision |
|---|---|
| ARD-TBD-001 | Exact current frontend service contracts |
| ARD-TBD-002 | Final API response envelope |
| ARD-TBD-003 | Final MongoDB entity schemas |
| ARD-TBD-004 | Student identity model across branches |
| ARD-TBD-005 | Same-branch multiple-role policy |
| ARD-TBD-006 | Fixed/Percentage Payroll calculation details |
| ARD-TBD-007 | Monetary precision and rounding |
| ARD-TBD-008 | Salary Agreement revision treatment |
| ARD-TBD-009 | Owner action-level Expense permissions |
| ARD-TBD-010 | Financial correction/refund governance |
| ARD-TBD-011 | Production session configuration |
| ARD-TBD-012 | Mock-data migration/import policy |
| ARD-TBD-013 | Hosting providers and production domains |
| ARD-TBD-014 | Backup retention, RPO and RTO |
| ARD-TBD-015 | Performance targets |
| ARD-TBD-016 | Supported browser matrix |
| ARD-TBD-017 | Final client acceptance process |

These items must not be silently finalized by implementation agents.

---

## 49. Out-of-Scope Requirements

The following are deferred:

- Platform Admin.
- Multi-academy SaaS onboarding.
- Licensing and subscriptions.
- Electron desktop application.
- Offline/LAN synchronization.
- General-purpose Cloudinary/media upload integration.
- Automatic monthly Teacher Payroll.
- Unapproved payment reversals/refunds.
- Unapproved automated financial corrections.
- Full custom workflow builder.
- Arbitrary role-permission designer.
- Unnecessary microservices.
- Premature queues and distributed infrastructure.

Deferred items require a separately approved scope.

---

## 50. Related Documentation

This ARD works alongside the existing project documents.

### Core

- `PRD.md` — Product objectives and scope.
- `SYSTEM_DESIGN.md` — Business workflows.
- `RULES.md` — Engineering boundaries.
- `MEMORY.md` — Owner-approved decisions.
- `TASKS.md` — Work tracking.
- `PROGRESS.md` — Verified project progress.

### Architecture and Data

- `ARCHITECTURE.md`
- `ERD.md`
- `DATABASE.md`
- `BUSINESS_RULES.md`
- `DATA_FLOW.md`
- `TRANSACTIONS_AND_INTEGRITY.md`
- `TENANT_BRANCH_ISOLATION.md`

### API and Security

- `API.md`
- `API_CONTRACTS.md`
- `RBAC_PERMISSIONS.md`
- `SECURITY.md`
- `AUTHENTICATION_AND_SECURITY.md`

### Development

- `FRONTEND_INTEGRATION.md`
- `BACKEND_IMPLEMENTATION_PLAN.md`
- `FEATURE_DEVELOPMENT.md`
- `SETUP.md`
- `ENVIRONMENT_CONFIG.md`
- `BUGFIX.md`

### Operations and QA

- `DEPLOYMENT.md`
- `DEPLOYMENT_AND_DEVOPS.md`
- `BACKUP_AND_RECOVERY.md`
- `LOGGING_AND_MONITORING.md`
- `DEBUGGING.md`
- `INTEGRATIONS.md`
- `MCP_CONNECTIONS.md`
- `BACKEND_TESTING_STRATEGY.md`
- `TESTING_AND_QA.md`
- `BACKEND_GAPS_AND_RISKS.md`
- `FRONTEND_BACKEND_HANDOFF.md`

Actual file paths must be verified before adding relative links.

---

## 51. Master Requirements Checklist

### Product and Access

- [ ] Five current roles verified.
- [ ] Receptionist Admissions/Fees access verified.
- [ ] Teacher self-only compensation verified.
- [ ] Branch-specific roles verified.
- [ ] Branch creation pause enforced.

### Academics

- [ ] Admissions tested.
- [ ] Students tested.
- [ ] Courses/Batches tested.
- [ ] Enrollment tested.
- [ ] Faculty Assignments tested.

### Finance

- [ ] Challans tested.
- [ ] Verified Fee Payments tested.
- [ ] Outstanding Fees reconciled.
- [ ] Assignment Payroll tested.
- [ ] No monthly salary auto-generation.
- [ ] Payroll-linked Expenses reconciled.
- [ ] Finance and Reports verified.

### Supporting Operations

- [ ] Demo Classes tested.
- [ ] Physical Assets tested.
- [ ] Teacher My Profile tested.
- [ ] Audit tested.
- [ ] Users tested.
- [ ] Settings tested.

### Technical

- [ ] Backend authentication verified.
- [ ] MongoDB persistence verified.
- [ ] API contracts tested.
- [ ] Branch isolation tested.
- [ ] Transactions tested.
- [ ] Regression tests passed.
- [ ] Deployment verified.
- [ ] Recovery readiness reviewed.

### Acceptance

- [ ] Known critical issues resolved.
- [ ] Actual results documented.
- [ ] Client evaluation completed.
- [ ] Owner acceptance explicitly recorded.

All unchecked items are pending verification, not failed implementation claims.

---

## 52. Final Requirements Boundary

### Confirmed

- React/Vite frontend.
- Node.js/Express/MongoDB backend direction.
- Five application roles.
- Receptionist Full Admissions and Fees.
- Teacher My Profile with own compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy with multiple branches.
- Different roles across branches.
- Current branch creation pause.
- Physical Assets without media uploads.
- Hosted web demonstration direction.

### Proposed

- REST API integration.
- MongoDB authoritative persistence.
- Server-managed sessions.
- Modular backend services.
- Transaction and idempotency safeguards.
- Formal traceability and acceptance testing.

### Deferred

- Platform Admin and commercial SaaS.
- Electron/LAN/offline.
- Cloudinary/media infrastructure.
- Automatic monthly salaries.
- Unsupported financial corrections.
- Unnecessary distributed architecture.

### Not Verified by This Document

- Complete backend implementation.
- Production database connectivity.
- Full frontend HTTP integration.
- Executed backend security tests.
- Production deployment.
- Formal client acceptance.

**Governing Principle:** Every TSA Academy ERP feature must satisfy the approved application requirements, preserve existing frontend behavior, enforce effective role and branch security, maintain academic and financial integrity, and be accepted only on the basis of verified implementation and testing evidence.

**Document Status:** DRAFT — Application requirements baseline ready for source-level consistency review and separately approved implementation.
