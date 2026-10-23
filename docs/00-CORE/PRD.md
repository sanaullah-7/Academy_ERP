<!-- Product Requirements Document — Academy ERP kya karega, kis ke liye ban raha hai, aur kaunse features zaroori hain -->

# Academy Management ERP — Product Requirements Document (PRD)

**Document:** PRD.md
**Version:** 1.0
**Status:** DRAFT — Detailed Requirements Pending Review
**Last Updated:** 2026-10-09
**Product:** Academy Management ERP
**Platform:** Web Application
**Initial Customer:** One Academy Organization
**Development Strategy:** Frontend First, Phase-Based Implementation

---

## CURRENT EFFECTIVE REQUIREMENTS — 2026-10-23

The completed frontend covers 16 functional areas: Dashboard, Admissions, Students, Courses & Batches, Faculty & Classes, Fees, Finance Overview, Expenses, Teacher Payroll, Demo Classes, Assets, Reports & Ledgers, Audit Log, Branches, Users and Settings. The initial deployment is one academy organization with multiple branches.

Exactly five frontend roles are active: Super Admin, Admin, Receptionist, Owner and Teacher. Receptionist has the implemented full Admissions and Fees workflows but no independent Finance, Expenses, Payroll, Audit, Branch, User or Settings access. Teacher uses `/my-profile` for self-only bio, timetable, assignments, compensation, verified payment history and payslips; this grants no broad Faculty or Finance access.

Payroll is one running obligation per approved faculty assignment using the existing Fixed or Percentage calculation. Payments reduce that balance and post the corresponding expense; no automatic monthly salary, approval cycle, new advance/adjustment/correction workflow or fabricated obligation is required. Branch creation remains paused. Platform Admin/SaaS, refunds/reversals, student transfers and payroll migration remain deferred or TBD.

The detailed actual module behavior is recorded in [Frontend Audit](../FRONTEND_AUDIT.md) and [Workflow Map](../MODULE_WORKFLOW_MAP.md).

---

## 1. Document Purpose

This Product Requirements Document defines the goals, users, functional modules, user journeys, business requirements, scope boundaries, acceptance criteria and unresolved product decisions for the Academy Management ERP.

The document is intended for:

- The academy client and project owner.
- Product reviewers.
- UI/UX designers.
- Frontend developers.
- Backend developers.
- Quality assurance engineers.
- AI development agents, including Codex and Antigravity.

The PRD defines **what the product must accomplish**.

It does not independently authorize implementation, prescribe all technical implementation details or override the approved Security Specification.

Technical implementation decisions belong in ARCHITECTURE.md.

Detailed database design belongs in ERD.md.

Visual standards belong in DESIGN.md.

---

## 2. Decision Classification

All specifications use the following status labels.

**CONFIRMED:** Explicitly supplied or approved project requirement.

**PROPOSED:** Recommended functionality or behavior awaiting approval.

**TBD:** Missing decision that must be clarified.

**DEFERRED:** Outside the current release or intentionally postponed.

**REJECTED:** Explicitly excluded approach.

A detailed requirement must not be treated as confirmed merely because it is described in this document.

Client approval of the general system proposal does not automatically finalize every detailed workflow.

---

## 3. Executive Summary

### 3.1 Product Overview

The Academy Management ERP is a centralized web-based management application for one academy organization operating one or more branches.

The system is intended to support academic administration, student records, staff access, fee operations, financial visibility and operational reporting.

The application must provide connected workflows rather than a collection of unrelated screens.

### 3.2 Confirmed Product Direction

The initial ERP includes:

- One academy organization.
- Multiple configurable branches.
- Role-aware dashboards.
- Individual staff user accounts.
- Branch-specific role assignments.
- Academic management modules.
- Student admission and management modules.
- Fee and finance modules.
- Operational modules.
- Reports and academy settings.
- Configurable academy branding.

### 3.3 Initial Development Strategy

CONFIRMED:

The React frontend will be developed first using mock services and demo data.

The backend will subsequently provide real authentication, authorization and persistent data operations using Node.js and MongoDB.

The final client-facing application must not rely on frontend-only authorization or browser-local storage for real operational security and shared records.

### 3.4 Client Review

CONFIRMED:

The project owner reported that the client reviewed the general System Design and Architecture proposal and requested implementation.

Minor design and business-logic refinements may be requested during development.

Detailed, unresolved requirements must still be documented and confirmed when necessary.

---

## 4. Problem Statement

Academies commonly manage operational information across multiple processes such as admissions, student records, teaching batches, fee collection, staff responsibilities and financial reporting.

Without a centralized system, these processes can become fragmented and difficult to coordinate.

The proposed ERP addresses the need for a connected administration interface that can support authorized staff across multiple academy branches.

### Intended Problems to Address

PROPOSED:

- Repeated entry of student information.
- Disconnected admission and enrollment records.
- Difficult tracking of course and batch assignments.
- Inconsistent fee and payment visibility.
- Limited branch-specific operational reporting.
- Difficulty managing staff access across branches.
- Inconsistent tracking of demo classes and assets.
- Excessive manual reconciliation between modules.

These are proposed product motivations, not independently verified claims about the client's current operations.

---

## 5. Product Goals

### Goal G-01 — Centralized Academy Management

Provide a unified platform for the approved academy modules.

### Goal G-02 — Multiple Branch Support

Allow authorized administrators to manage academy branches without hardcoding a fixed number of locations.

### Goal G-03 — Role-Aware Experiences

Provide appropriate navigation, screens and actions for authorized users.

### Goal G-04 — Connected Academic Workflows

Support relationships between admissions, student profiles, courses, batches, enrollments and teaching assignments.

### Goal G-05 — Connected Financial Workflows

Support consistent relationships between invoices, payment records, balances and financial reporting.

Detailed financial rules remain TBD.

### Goal G-06 — Consistent User Experience

Follow the client's approved Lovable reference and shared design standards.

### Goal G-07 — Adaptability

Allow approved future changes without unnecessarily rewriting unrelated modules.

### Goal G-08 — Reliable Operation

Require appropriate validation, error handling, testing and data integrity controls before production release.

---

## 6. Product Non-Goals

The initial product does not include:

- Multi-client SaaS onboarding.
- Multi-client subscription billing.
- Commercial license management infrastructure.
- Electron desktop applications.
- Native Android or iOS applications.
- LAN-only deployment.
- Unapproved third-party integrations.
- Unapproved payroll, examinations, LMS or parent/student portals.

These capabilities require separate scope confirmation before implementation.

The architecture should remain maintainable without introducing infrastructure for hypothetical future requirements.

---

# 7. User Roles and User Scope

The system has five primary roles.

## 7.1 Super Admin

CONFIRMED:

The Super Admin can manage academy branches and individual staff user accounts.

The interface should support academy-wide administration and authorized all-branch visibility.

## 7.1A Admin

CONFIRMED — 2026-10-21:

Admin has the same module and tab access as Super Admin within one explicitly assigned branch. Admin cannot access or switch to another branch unless separately assigned there. In User Management, Admin may create only Owner, Receptionist and Teacher accounts; Admin and Super Admin accounts may be created only by Super Admin.

### Proposed Functional Areas

- Academy and branch configuration.
- Staff account management.
- Role and branch assignment management.
- Authorized academy-level dashboards.
- Authorized reporting.
- Academy branding and settings.

Exact administrative privileges and sensitive operations must be defined in SECURITY.md.

## 7.2 Owner

CONFIRMED:

Owner is a primary role.

### Proposed Functional Areas

- Authorized academy performance overview.
- Authorized financial reports.
- Admissions and enrollment summaries.
- Branch performance visibility.

TBD:

- Whether Owner has academy-wide access or only assigned branches.
- Whether Owner may create, edit, approve or reverse transactions.
- Whether Owner may manage staff.

Do not infer full administrative privileges from the word Owner.

## 7.3 Receptionist

CONFIRMED:

Receptionist is a primary role.

### Proposed Functional Areas

- Student inquiries.
- Admission registration.
- Student information management.
- Demo class registration.
- Authorized fee collection.
- Operational front-desk tasks.

TBD:

- Exact edit permissions.
- Discount authority.
- Admission approval authority.
- Access to payment reversal or refund operations.

## 7.4 Teacher

CONFIRMED:

Teacher is a primary role.

### Proposed Functional Areas

- Assigned classes.
- Assigned batches.
- Relevant students.
- Teaching schedules.
- Attendance, if approved.
- Own earnings information, if approved.

Teacher access must be appropriately limited.

Teachers must not automatically gain access to unrelated student records or academy-wide financial information.

---

# 8. Multi-Branch and Multi-Role Requirements

## PRD-BR-001 — Branch Creation

CONFIRMED:

The Super Admin must be able to create and manage academy branches.

## PRD-BR-002 — Dynamic Branch Count

CONFIRMED:

The number of branches must not be permanently hardcoded.

## PRD-BR-003 — Individual User Accounts

CONFIRMED:

Each staff member must have an individual account.

## PRD-BR-004 — Multiple Branch Assignments

CONFIRMED:

One user may be assigned to multiple branches.

## PRD-BR-005 — Different Roles Across Branches

CONFIRMED:

A staff member may hold different roles in different branches.

Example:

- Branch A: Teacher.
- Branch B: Receptionist.

## PRD-BR-006 — Multiple Roles in One Branch

CONFIRMED:

A staff member may hold multiple permitted roles within the same branch.

## PRD-BR-007 — Single-Branch Experience

CONFIRMED:

Users assigned to one branch should enter that branch context automatically.

## PRD-BR-008 — Multiple-Branch Selection

CONFIRMED:

Users assigned to multiple branches must be able to select among authorized branches.

## PRD-BR-009 — All-Branches Visibility

CONFIRMED — General Requirement:

Super Admin can access an all-branches perspective.

Other roles require explicit authorization before aggregated branch information is displayed.

## PRD-BR-010 — Branch-Specific Data

CONFIRMED:

The application must support branch-sensitive data access.

Production backend authorization must enforce actual branch restrictions.

### Proposed Acceptance Scenarios

- A single-branch employee is directed to the assigned branch.
- A multi-branch employee can select authorized branches.
- Changing branches updates relevant records and dashboard information.
- Different role assignments produce different permitted UI actions.
- An unauthorized branch is not available through normal navigation.
- The backend denies unauthorized branch or record access.

---

# 9. Core Functional Modules

## 9.1 Dashboard

**Module ID:** PRD-DASH
**Frontend Phase:** F01
**Status:** CONFIRMED — Module Scope; Detailed Widgets PROPOSED

### Purpose

Provide a role-aware overview of relevant academy information.

### Proposed Functional Requirements

**PRD-DASH-001:** Display the current academy identity.

**PRD-DASH-002:** Display the active branch or authorized all-branches context.

**PRD-DASH-003:** Provide role-specific dashboard experiences.

**PRD-DASH-004:** Display relevant summary statistics.

**PRD-DASH-005:** Provide approved charts and trends.

**PRD-DASH-006:** Provide appropriate quick actions.

**PRD-DASH-007:** Update displayed information when the active branch changes.

**PRD-DASH-008:** Handle empty, loading and error states.

### Role-Specific Views

Super Admin:

- Academy overview.
- Branch comparison.
- Admissions and student summaries.
- Authorized financial summaries.

Owner:

- Authorized academy performance.
- Financial and operational summaries according to permissions.

Receptionist:

- Relevant admissions.
- Pending inquiries.
- Demo follow-ups.
- Authorized collection information.

Teacher:

- Assigned classes.
- Assigned batches.
- Teaching schedule.
- Assigned students.

### Acceptance Criteria

- Each role receives the appropriate dashboard experience.
- Branch context is reflected correctly.
- Statistics derive from shared mock records during frontend development.
- Charts do not invent disconnected totals.
- Responsive and accessibility expectations are met.

### TBD

- Exact approved dashboard metrics.
- Date-range controls.
- Financial visibility by role.
- Chart types and reporting periods.

---

## 9.2 Admissions

**Module ID:** PRD-ADM
**Frontend Phase:** F02

### Purpose

Manage student admission applications and approved admission workflows.

### Proposed Functional Requirements

**PRD-ADM-001:** List admissions.

**PRD-ADM-002:** Search and filter admissions.

**PRD-ADM-003:** Create a new admission application.

**PRD-ADM-004:** Capture required student information.

**PRD-ADM-005:** Capture required guardian information.

**PRD-ADM-006:** Select an available course or program.

**PRD-ADM-007:** Select a valid branch and batch where applicable.

**PRD-ADM-008:** View admission details.

**PRD-ADM-009:** Update admission status according to approved rules.

**PRD-ADM-010:** Support an approved transition from admission to student enrollment.

**PRD-ADM-011:** Display appropriate validation and confirmation messages.

### Proposed User Journey

1. Authorized staff opens Admissions.
2. Staff creates a new application.
3. Student and guardian information is entered.
4. Course and branch/batch details are selected.
5. Application is validated and saved.
6. Authorized users process the application.
7. Successful processing results in the appropriate student/enrollment records, according to approved workflow rules.

### Acceptance Criteria

- Admission records belong to a valid branch.
- Invalid submissions show useful errors.
- Course and batch references are valid.
- Admission status is visible.
- Relevant data is available to authorized downstream modules.
- Repeating an operation does not create unintended duplicate records.

### TBD

- Required admission fields.
- Admission approval responsibility.
- Registration number format.
- Admission fees.
- Required documents.
- Status transition rules.
- Duplicate applicant handling.

---

## 9.3 Students

**Module ID:** PRD-STU
**Frontend Phase:** F03

### Purpose

Manage student profiles and provide access to authorized academic and financial history.

### Proposed Functional Requirements

**PRD-STU-001:** Display a student directory.

**PRD-STU-002:** Search students.

**PRD-STU-003:** Filter students by authorized branch and relevant status.

**PRD-STU-004:** View a student profile.

**PRD-STU-005:** Edit permitted student information.

**PRD-STU-006:** Display guardian information.

**PRD-STU-007:** Display enrollment history.

**PRD-STU-008:** Display authorized fee history.

**PRD-STU-009:** Display attendance information if included in the approved scope.

**PRD-STU-010:** Provide appropriate student status indicators.

### Acceptance Criteria

- Student identity is represented consistently.
- Related enrollment records are displayed correctly.
- Filters and search work.
- Branch restrictions are applied.
- Missing data is handled gracefully.
- Unauthorized information is not exposed.

### TBD

- Student identifier format.
- Mandatory personal information.
- Student transfer rules.
- Student status lifecycle.
- Guardian relationship rules.
- Record correction/deletion policies.

---

## 9.4 Courses and Batches

**Module ID:** PRD-CB
**Frontend Phase:** F04

### Purpose

Manage educational programs, courses, subjects, batches and approved scheduling information.

### Proposed Functional Requirements

**PRD-CB-001:** Display available courses.

**PRD-CB-002:** Create and edit authorized course records.

**PRD-CB-003:** Manage course-associated subjects.

**PRD-CB-004:** Display batches.

**PRD-CB-005:** Create and edit branch-specific batches.

**PRD-CB-006:** Display batch enrollment counts.

**PRD-CB-007:** Display seat capacity when required.

**PRD-CB-008:** Assign authorized teachers or subjects.

**PRD-CB-009:** Display batch timetable information.

**PRD-CB-010:** Support permitted student batch changes.

### Acceptance Criteria

- Every batch belongs to a valid branch.
- Courses and batches remain distinguishable.
- Related student counts use shared enrollment data.
- Invalid course/batch combinations are rejected.
- Authorized role behavior is respected.

### TBD

- Academic streams and program structure.
- Batch capacity rules.
- Subject relationships.
- Scheduling conflicts.
- Batch transfers.
- Academic calendars.

---

## 9.5 Faculty and Classes

**Module ID:** PRD-FAC
**Frontend Phase:** F05

### Purpose

Support teacher profiles, authorized teaching assignments and class information.

### Proposed Functional Requirements

**PRD-FAC-001:** Display faculty directory.

**PRD-FAC-002:** View faculty profile.

**PRD-FAC-003:** Maintain approved faculty details.

**PRD-FAC-004:** Link teachers to authorized branches.

**PRD-FAC-005:** Assign teachers to subjects and batches.

**PRD-FAC-006:** Display class schedules.

**PRD-FAC-007:** Display authorized class student lists.

**PRD-FAC-008:** Support class status and attendance functionality if approved.

### Acceptance Criteria

- Teacher identities are linked consistently to staff accounts.
- Teacher dashboards reflect assigned work.
- Branch and assignment relationships are valid.
- Unauthorized student information is not displayed.

### TBD

- Faculty profile fields.
- Class duration and scheduling rules.
- Attendance authority.
- Teacher compensation policies.
- Substitution and cancellation workflows.

---

## 9.6 Fees

**Module ID:** PRD-FEE
**Frontend Phase:** F06

### Purpose

Manage student fee obligations and authorized payment collection.

### Proposed Functional Requirements

**PRD-FEE-001:** Display fee summaries.

**PRD-FEE-002:** Display student invoices.

**PRD-FEE-003:** Display outstanding amounts.

**PRD-FEE-004:** Provide fee collection interface.

**PRD-FEE-005:** Support installments if approved.

**PRD-FEE-006:** Show authorized discounts and adjustments.

**PRD-FEE-007:** Display student fee ledger.

**PRD-FEE-008:** Generate printable receipt previews.

**PRD-FEE-009:** List overdue or outstanding fees according to approved rules.

**PRD-FEE-010:** Reflect valid recorded payments in related reports.

### Critical Business Principles

- Invoice amounts and payment amounts are separate concepts.
- Recorded payments must not silently modify original invoice history.
- Discounts and refunds must follow approved authorization.
- Financial totals must derive from consistent underlying records.
- Invalid duplicate payments must be prevented.

### Acceptance Criteria

- Payment and invoice records remain logically connected.
- Branch and student references are valid.
- Amount formatting is consistent.
- Outstanding amounts are calculated according to approved rules.
- Appropriate error and confirmation states are displayed.

### TBD

- Fee structures.
- Due dates.
- Installment policies.
- Late penalties.
- Refunds.
- Discounts.
- Payment methods.
- Receipt numbering.
- Approval responsibilities.

**Do not finalize financial business logic before these rules are approved.**

---

## 9.7 Finance

**Module ID:** PRD-FIN
**Frontend Phase:** F07

### Purpose

Provide authorized financial visibility and operating-expense management.

### Proposed Functional Requirements

**PRD-FIN-001:** Display financial overview.

**PRD-FIN-002:** List authorized transactions.

**PRD-FIN-003:** Record operating expenses.

**PRD-FIN-004:** Categorize expenses.

**PRD-FIN-005:** Display income and expense summaries.

**PRD-FIN-006:** Filter by authorized branch and reporting period.

**PRD-FIN-007:** Display relevant financial charts.

**PRD-FIN-008:** Support approved cash-closing processes.

### Acceptance Criteria

- Financial totals agree with underlying fee/payment/expense records.
- Branch filters are respected.
- Unauthorized roles cannot access restricted financial information.
- Missing or inconsistent data is handled clearly.

### TBD

- Expense categories.
- Approval workflows.
- Cash closing.
- Bank reconciliation.
- Reporting definitions.
- Owner and Receptionist financial authority.

---

## 9.8 Demo Classes

**Module ID:** PRD-DEMO
**Frontend Phase:** F08

### Purpose

Manage prospective students attending or requesting demo classes.

### Proposed Functional Requirements

**PRD-DEMO-001:** Register demo inquiries.

**PRD-DEMO-002:** Display demo registrations.

**PRD-DEMO-003:** Schedule demo sessions.

**PRD-DEMO-004:** Reschedule where permitted.

**PRD-DEMO-005:** Record demo attendance/outcomes when approved.

**PRD-DEMO-006:** Track demo status.

**PRD-DEMO-007:** Support conversion to admission.

### Acceptance Criteria

- Demo registrations reference valid branch/course data.
- Scheduling information is consistent.
- Conversion avoids unnecessary duplicate student/admission records.
- Authorized roles can perform approved actions.

### TBD

- Demo duration.
- Scheduling restrictions.
- Fee or free-demo policies.
- Conversion rules.
- Follow-up process.

---

## 9.9 Assets

**Module ID:** PRD-ASSET
**Frontend Phase:** F09

### Purpose

Track academy assets and their branch-level ownership or assignment.

### Proposed Functional Requirements

**PRD-ASSET-001:** Display asset directory.

**PRD-ASSET-002:** Add authorized asset records.

**PRD-ASSET-003:** Edit asset information.

**PRD-ASSET-004:** Display asset category and condition.

**PRD-ASSET-005:** Track relevant assignment or location.

**PRD-ASSET-006:** Display maintenance history where approved.

### TBD

- Asset categories.
- Purchase information.
- Asset code policy.
- Maintenance lifecycle.
- Transfer and depreciation rules.

---

## 9.10 Reports

**Module ID:** PRD-REP
**Frontend Phase:** F10

### Purpose

Provide consistent and authorized operational and financial reports.

### Proposed Functional Requirements

**PRD-REP-001:** Display report categories.

**PRD-REP-002:** Select a report.

**PRD-REP-003:** Filter by period.

**PRD-REP-004:** Filter by authorized branch.

**PRD-REP-005:** Preview report data.

**PRD-REP-006:** Export and print approved reports.

**PRD-REP-007:** Apply role and record-level restrictions.

### Proposed Report Categories

- Admissions.
- Student enrollment.
- Courses and batches.
- Fee collection.
- Outstanding balances.
- Expenses.
- Branch performance.
- Faculty/class information.

### Acceptance Criteria

- Report totals match their authoritative source records.
- Branch filtering produces consistent data.
- Unauthorized users cannot retrieve restricted reports.
- Empty results are represented accurately.

### TBD

- Exact mandatory reports.
- PDF/Excel/CSV export requirements.
- Report templates.
- Scheduled reporting.
- Financial reporting periods.

---

## 9.11 Branch Management

**Module ID:** PRD-BRANCH
**Frontend Phase:** F11

### Purpose

Enable authorized management of academy locations.

### Proposed Functional Requirements

**PRD-BRANCH-001:** List branches.

**PRD-BRANCH-002:** Create a new branch.

**PRD-BRANCH-003:** Edit branch details.

**PRD-BRANCH-004:** View branch information.

**PRD-BRANCH-005:** Activate or deactivate a branch according to approved policy.

**PRD-BRANCH-006:** Display staff branch assignments.

### Confirmed Rules

Super Admin can manage branches.

Branch count must be configurable.

### Acceptance Criteria

- New valid branches can be created in the frontend mock system.
- Branch selectors update dynamically.
- Existing record references are preserved.
- Invalid or unauthorized branch operations are handled.

### TBD

- Required branch fields.
- Branch code format.
- Deactivation restrictions.
- Branch-specific settings.

---

## 9.12 User Management

**Module ID:** PRD-USER
**Frontend Phase:** F12

### Purpose

Manage staff identities and authorized role/branch assignments.

### Proposed Functional Requirements

**PRD-USER-001:** List staff accounts.

**PRD-USER-002:** Create individual staff accounts.

**PRD-USER-003:** Edit permitted staff information.

**PRD-USER-004:** Assign a user to multiple branches.

**PRD-USER-005:** Assign different roles across branches.

**PRD-USER-006:** Assign multiple roles within a branch.

**PRD-USER-007:** Display role and permission information.

**PRD-USER-008:** Enable/disable accounts according to approved rules.

**PRD-USER-009:** Support secure credential management in the eventual backend.

### Acceptance Criteria

- One staff identity can have multiple branch-role assignments.
- Assignment changes are reflected in the corresponding mock dashboard experience.
- Unauthorized roles cannot manage users.
- Valid user accounts are not unnecessarily duplicated.

### TBD

- Staff account creation workflow.
- Default role permissions.
- Password setup/recovery.
- Account lifecycle.
- Approval requirements.
- Conflict handling for multiple roles.

---

## 9.13 Settings and Branding

**Module ID:** PRD-SET
**Frontend Phase:** F13

### Purpose

Provide centralized academy configuration.

### Confirmed Functional Requirements

**PRD-SET-001:** Configure academy display name.

**PRD-SET-002:** Configure academy logo.

**PRD-SET-003:** Configure primary theme colors.

### Proposed Functional Requirements

**PRD-SET-004:** Configure academic sessions.

**PRD-SET-005:** Manage approved operational preferences.

**PRD-SET-006:** Preview branding changes.

**PRD-SET-007:** Persist approved settings through the data service layer.

### Acceptance Criteria

- Branding updates affect relevant shared UI.
- Invalid colors or inputs are handled.
- Configurable information is not hardcoded across unrelated pages.
- Unauthorized settings changes are restricted.

### TBD

- Complete branding fields.
- Academic-year/session rules.
- Date/time and locale configuration.
- Notification settings.
- Additional academy configuration.

---

# 10. Authentication and Account Access

Authentication is a cross-cutting requirement.

### Initial Frontend Phase

CONFIRMED:

Use mock user accounts and simulated session state for frontend development.

The demo must not imply that it provides production-level security.

### Production Integration

REQUIRED:

- Secure authentication.
- Individual staff credentials.
- Backend verification.
- Role authorization.
- Branch authorization.
- Session lifecycle management.
- Controlled account disablement.

### Detailed Requirements

TBD:

- Password recovery.
- Session expiration.
- Account invitation.
- Password requirements.
- Multi-factor authentication.
- Concurrent session policy.

The detailed security model must be approved in SECURITY.md.

---

# 11. Cross-Module Business Workflows

## 11.1 Admission-to-Enrollment

**Status:** PROPOSED — Details TBD

1. Admission application is created.
2. Student identity is registered or matched.
3. Course and batch are selected.
4. Admission receives an approved status.
5. Enrollment is created according to approved rules.
6. Related fee obligations are established where applicable.
7. Dashboard and reports reflect updated records.

## 11.2 Demo-to-Admission

**Status:** PROPOSED — Details TBD

1. Demo registration is created.
2. Session is scheduled.
3. Outcome is recorded.
4. Authorized staff initiates admission conversion.
5. Related records are linked without uncontrolled duplicates.

## 11.3 Enrollment-to-Fee Collection

**Status:** PROPOSED — Financial Rules TBD

1. Student enrollment is identified.
2. Applicable fee obligation is determined.
3. Invoice is generated or associated.
4. Authorized collection is recorded.
5. Receipt becomes available.
6. Outstanding balance is updated consistently.
7. Financial reports reflect valid transactions.

## 11.4 Teacher Assignment-to-Dashboard

**Status:** PROPOSED

1. Teacher is assigned to a valid branch.
2. Teacher receives approved course/batch/class assignments.
3. Dashboard displays authorized teaching information.
4. Branch changes update available teaching information.

---

# 12. Core Data Requirements

The system requires consistent identifiers and references for key business entities.

### Proposed Entity Groups

- Academy.
- Branches.
- Users.
- User-branch-role assignments.
- Students.
- Guardians, if required.
- Admissions.
- Courses.
- Subjects.
- Batches.
- Enrollments.
- Classes.
- Attendance, if approved.
- Fee plans.
- Invoices.
- Payments.
- Expenses.
- Demo classes.
- Assets.
- Settings.
- Audit records.

Detailed schemas, fields, indexes and relationships must follow ERD.md.

Do not assume every entity requires an independent collection.

---

# 13. Frontend UX Requirements

CONFIRMED — General Direction:

Use the client-approved Lovable reference as the primary visual direction.

Reference:

https://sunbeam-styler.lovable.app/

### Required General UX Standards

- Shared navigation.
- Consistent page layout.
- Reusable tables.
- Reusable forms.
- Reusable dialogs.
- Consistent validation.
- Loading states.
- Empty states.
- Success feedback.
- Error feedback.
- Appropriate permission-denied experiences.
- Branch context visibility.
- Configurable branding.

Exact visual tokens and viewport requirements are owned by DESIGN.md.

---

# 14. Frontend-First Implementation Requirements

## PRD-DEV-001 — Mock Services

CONFIRMED:

Early frontend modules use mock services rather than requiring the real backend.

## PRD-DEV-002 — Centralized Demo Storage

CONFIRMED:

Demo persistence must be centralized, rather than using unrelated localStorage operations throughout individual pages.

## PRD-DEV-003 — Stable Contracts

CONFIRMED — General Principle:

Frontend pages should use service interfaces that can later be replaced with backend-connected implementations.

Specific service methods and request/response formats remain subject to FRONTEND_INTEGRATION.md.

## PRD-DEV-004 — Real Security Later

CONFIRMED:

Production security and data access must be implemented in the backend before deployment with real client data.

## PRD-DEV-005 — Connected Mock Workflows

PROPOSED:

Mock modules should use shared records, so related information remains consistent across pages.

## PRD-DEV-006 — No Misleading Completion Claims

REQUIRED:

A mock-only feature must not be labelled production-ready.

---

# 15. Development Phases

The proposed phase order is:

| Phase | Focus |
|---|---|
| F00 | Foundation, routing, layouts, mock roles and branch context |
| F01 | Dashboard |
| F02 | Admissions |
| F03 | Students |
| F04 | Courses and Batches |
| F05 | Faculty and Classes |
| F06 | Fees |
| F07 | Finance |
| F08 | Demo Classes |
| F09 | Assets |
| F10 | Reports |
| F11 | Branch Management |
| F12 | User Management |
| F13 | Settings and Integrated Frontend QA |

### Phase Rules

1. Implement only approved tickets.
2. Do not build all modules at once.
3. Reuse approved architecture.
4. Preserve existing working features.
5. Verify module behavior before proceeding.
6. Record actual test results.
7. Keep unresolved business rules clearly documented.

### Dependencies

Earlier screens may require minimal mock data contracts for modules whose full UI is developed later.

For example:

- Dashboard requires sample records from several domains.
- Admissions requires course and batch reference data.
- Fees requires student/enrollment/invoice relationships.
- Reports requires consistent operational records.

These prerequisites may be implemented as focused foundation or dependency tickets.

---

# 16. Non-Functional Requirements

Non-functional requirements describe how well the ERP must operate.

## 16.1 Maintainability

The codebase must support clear module boundaries, readable code, reusable components and consistent interfaces.

## 16.2 Reliability

Important operations must validate data and provide predictable outcomes.

## 16.3 Stability

Approved changes must avoid unnecessary regressions in completed modules.

## 16.4 Scalability

The initial architecture should support growing records and branches without premature infrastructure complexity.

Specific volumes remain TBD.

## 16.5 Security

Protected operations must use backend-enforced authorization in production.

## 16.6 Performance

The application should use appropriate pagination, efficient queries and responsive interactions.

Measurable performance budgets remain TBD.

## 16.7 Testability

Business rules and services must be testable without requiring every UI screen to run.

## 16.8 Flexibility

Client-approved changes should be handled through controlled updates rather than scattered hardcoded logic.

## 16.9 Accessibility

Use semantic controls, keyboard navigation, accessible validation and sufficient visual contrast.

The formal accessibility conformance target remains subject to DESIGN.md approval.

## 16.10 Observability

Production errors and operational failures should be diagnosable using appropriate logs and monitoring.

## 16.11 Data Integrity

Related academic and financial records must remain logically consistent.

These are required quality goals, not claims that the current implementation already satisfies them.

---

# 17. Testing and Quality Acceptance

Each implemented feature must be verified against its approved feature ticket.

### Required Testing Categories

- Build and lint.
- Business logic/unit tests.
- Relevant component tests.
- Mock service tests.
- Role and branch interaction tests.
- API integration tests during backend development.
- Production backend authorization tests.
- Critical workflow tests.
- Regression tests.
- Client user acceptance testing.

### Core Acceptance Scenarios

**PRD-ACC-001:** Staff sees appropriate role-specific navigation.

**PRD-ACC-002:** A user assigned to multiple branches can select authorized branches.

**PRD-ACC-003:** Switching branches updates relevant records and summaries.

**PRD-ACC-004:** Mock data operations are persistent within the configured demo storage behavior.

**PRD-ACC-005:** Admission and enrollment data remain logically connected.

**PRD-ACC-006:** Fee reports agree with recorded financial data.

**PRD-ACC-007:** Unauthorized API operations are rejected by the real backend.

**PRD-ACC-008:** Critical workflows remain functional after integration.

**PRD-ACC-009:** Production secrets are never exposed through frontend code.

**PRD-ACC-010:** Known release-blocking defects are resolved before client production use.

Exact quantitative pass thresholds and acceptance ownership remain TBD.

---

# 18. MVP and Release Boundaries

### Confirmed Initial Product Direction

One academy client with multiple branches and the agreed ERP modules.

### MVP Depth

**Status: TBD**

The exact minimum feature depth for first delivery has not been fully confirmed.

A listed module does not automatically mean that every possible advanced feature within that module is required.

### Proposed Release Stages

**Stage A — Frontend Foundation**

Application shell, navigation, shared design, mock roles and branches.

**Stage B — Frontend Functional Demonstration**

Approved module-by-module UI workflows using fictional demo data.

**Stage C — Backend Integration**

Real APIs, database operations, secure accounts and backend authorization.

**Stage D — Integrated Quality Assurance**

End-to-end workflow testing, financial integrity and permission verification.

**Stage E — Client Review**

Private hosted application available for the agreed seven-day review period.

### Release Principle

A production-ready multi-user ERP requires functioning real backend authentication, authorization and persistent database integration.

A frontend mock demonstration is not equivalent to production completion.

---

# 19. Risks and Dependencies

## Risk R-001 — Unresolved Business Rules

Missing fee, enrollment or role policies may cause rework.

**Mitigation:** Keep TBD decisions visible and resolve them before implementing affected workflows.

## Risk R-002 — Design Drift

AI agents may introduce inconsistent layouts.

**Mitigation:** Follow approved DESIGN.md and reuse shared components.

## Risk R-003 — Mock/Backend Contract Differences

Frontend records may not match future APIs.

**Mitigation:** Approve consistent service contracts and data structures.

## Risk R-004 — Weak Authorization

Frontend-only UI restrictions could be mistaken for security.

**Mitigation:** Require backend and record-level authorization tests.

## Risk R-005 — Cross-Module Inconsistency

Admissions, enrollments and financial totals could become disconnected.

**Mitigation:** Use shared entity references and workflow tests.

## Risk R-006 — Uncontrolled Code Generation

Large AI coding tasks may introduce conflicts and regressions.

**Mitigation:** Use small approved feature tickets and frequent verification.

## Risk R-007 — Scope Growth

Minor client changes may gradually expand the project.

**Mitigation:** Record and evaluate changes before implementation.

## Risk R-008 — Delivery Constraints

Time, budget and operational requirements may restrict feature depth.

**Mitigation:** Confirm actual first-release priorities and milestone acceptance criteria.

---

# 20. Change Management

When the client requests a change:

1. Record the request.
2. Identify the existing requirement.
3. Assess affected modules and workflows.
4. Determine whether the change affects permissions, data or APIs.
5. Classify it as a correction, enhancement or scope change.
6. Obtain appropriate approval.
7. Update this PRD if product behavior changes.
8. Update affected technical specifications.
9. Update impacted feature tickets.
10. Implement and test the approved change.
11. Record the outcome in MEMORY.md and PROGRESS.md.

A minor frontend change must not trigger an unrelated ERP redesign.

---

# 21. Open Product Questions (TBD)

## Product Scope

1. What exact feature depth is required for the first client release?
2. Which optional capabilities are explicitly excluded?
3. Who is responsible for approving detailed feature behavior?

## Branch and Users

4. Can Owner access every branch or only assigned branches?
5. How should conflicting permissions be handled when one user has multiple roles?
6. Are user permissions fixed by role or customizable by Super Admin?
7. What happens when an assigned branch is deactivated?

## Admissions and Students

8. Which admission fields are mandatory?
9. What is the admission approval process?
10. What is the student registration number format?
11. Can a student enroll in multiple branches simultaneously?
12. How should duplicate student identities be detected?

## Courses and Teaching

13. Which academic programs and streams are required?
14. What are batch capacity rules?
15. Are timetable conflict checks required?
16. What teaching attendance records are required?
17. How are teacher earnings calculated, if included?

## Fees and Finance

18. Which fees are monthly, course-based or installment-based?
19. Who may approve fee discounts?
20. Are partial and advance payments allowed?
21. How are refunds and reversals handled?
22. Which payment methods are supported?
23. How are receipts and invoices numbered?
24. Is cash closing or reconciliation required?
25. What currency and financial reporting periods apply?

## Demo Classes and Assets

26. What is the demo class registration and conversion policy?
27. What asset categories and maintenance rules are needed?

## Reporting and Settings

28. Which reports are mandatory?
29. Which export formats are required?
30. Which academy settings are editable?
31. What language and date/time formats are required?

## Operations and Delivery

32. What are the expected staff and student volumes?
33. What browsers and devices must be supported?
34. What hosting and domain decisions are approved?
35. What backup, privacy and retention requirements apply?
36. What are the production launch acceptance criteria?

Do not silently answer unresolved questions.

---

# 22. Requirements Traceability

Every executable feature ticket must reference relevant PRD requirement IDs.

Example:

**Ticket:** F01-002 — Dashboard Statistics Cards

**Requirements:**

- PRD-DASH-004
- PRD-DASH-007
- PRD-BR-009

**Testing Evidence:**

- Branch-scoped metric calculations.
- Role-aware display.
- Empty-data state.
- Component and integration tests.

A feature should not be considered complete until its relevant acceptance criteria have been verified.

---

# 23. Documentation Relationships

This PRD owns product requirements and scope.

Related documents:

- [Documentation Index](README.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](../01-ARCHITECTURE/ARCHITECTURE.md)
- [Database ERD](../01-ARCHITECTURE/ERD.md)
- [Visual Design](../04-FRONTEND/DESIGN.md)
- [Security Specification](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)
- [Engineering Rules](RULES.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Current Tasks](TASKS.md)
- [Project Decisions](MEMORY.md)
- [Progress](PROGRESS.md)

If a technical document introduces new product behavior not present in the approved PRD, the change must be reviewed before implementation.

---

# 24. Approval Status

### General Product Direction

**CONFIRMED:** The project owner reports that the client approved the general system proposal and requested implementation.

### Detailed Functional Requirements

**DRAFT:** Proposed behaviors and unresolved business rules require review.

### Implementation Authorization

Only specifically approved and sufficiently defined development tickets may be implemented.

A module name or requirement entry alone is not blanket implementation permission.

---

**Document Status:** DRAFT — Pending Detailed Product Review
**Version:** 1.0
**Next Step:** Review with SYSTEM_DESIGN.md and SECURITY.md, resolve requirements needed for F00/F01, then approve relevant feature tickets.

## PAYROLL-TWO-METHODS - 2026-10-22

CONFIRMED by the owner's attached two-method payroll request: new salary agreements are assignment/batch-specific and support Fixed Monthly or Percentage only. Percentage uses eligible distinct active subject enrollment times the saved listed subject/course fee times agreed percentage, independently of cash receipts or student discounts. Full-course fee use requires separate explicit authorization for each assignment. Missing participation mapping or required fee must be flagged. No assignment means no eligible salary. New active payroll excludes bonuses, allowances, deductions/tax and advance recovery; legacy financial history must survive unchanged. Monthly effective versions and frozen approved salary/payment snapshots govern future method changes. Earlier four-method/new-advance workflows and teacher-account-based eligibility are SUPERSEDED for new payroll. The prior header control removal remains in effect; content-level salary-period navigation fulfills this newer request's selected-month and history workflow. Full monthly salaries use first-day-effective agreements without guessed mid-month proration; PKR amounts round to two decimals. A known explicitly configured zero listed fee yields zero percentage salary; missing fee is never inferred as zero.

## PAYROLL-RUNNING-BALANCE - 2026-10-22

CONFIRMED by the owner's latest request and clarification: retain only one running salary balance per assignment, without automatic monthly renewals, Add Salary cycles or approval. Partial/full salary payments may be recorded on their actual dates, and unpaid balance persists indefinitely. Explicit agreement saves adjust the same total payable while preserving all recorded payments and salary revisions; total payable cannot fall below already-paid money. Percentage fees/enrollment calculations occur on explicit salary save rather than time/navigation. Prior PAYROLL-TWO-METHODS monthly effective dates, draft recalculation and approval/locking policies are SUPERSEDED for active payroll; original historical sources remain preserved. No automatic Payroll idle/focus/storage refresh. Finance Overview keeps its existing behavior.
