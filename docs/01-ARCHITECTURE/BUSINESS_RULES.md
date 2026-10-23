# BUSINESS_RULES

<!-- > Purpose: Defines approved business logic, calculations, workflows and state transitions. -->

# TSA Academy ERP — Business Rules & Domain Validation Specification

**Document:** BUSINESS_RULES.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Status:** DRAFT — Confirmed Business Boundaries; Detailed Backend Contracts Under Review
**Last Updated:** 2026-10-23
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Scope:** Academic, Administrative, Financial and Operational Business Rules

---

## 1. Purpose

This document defines the business rules, operational constraints, validation requirements, state transitions and cross-module invariants for TSA Academy ERP.

It specifies how the future backend must preserve and enforce the approved behavior of the existing React frontend.

The objective is to ensure that business operations remain correct, consistent, secure and predictable regardless of whether they are initiated by Super Admin, Admin, Receptionist, Owner or Teacher.

The document covers:

- Organization and branch operations.
- User management and role assignments.
- Admissions and student registration.
- Courses, streams, subjects and batches.
- Enrollment and academic relationships.
- Faculty assignments and class scheduling.
- Student fees, challans and payments.
- Finance and expenses.
- Assignment-based running Teacher Payroll.
- Demo classes and conversion.
- Physical assets and inventory.
- Reports, dashboards and audit records.
- Settings, notifications and Teacher My Profile.
- Cross-module transactions and data integrity.
- Validation failures and concurrency handling.

**Implementation boundary:** This document defines business requirements and proposed backend enforcement. It does not authorize implementing routes, services, models or database migrations.

---

## 2. Business Rule Classification

Every business rule must be classified accurately.

| Status | Meaning |
|---|---|
| CONFIRMED | Explicitly approved by the project owner |
| FRONTEND IMPLEMENTED | Behavior reported as implemented in the existing frontend |
| PROPOSED | Recommended for backend design but not yet approved |
| TBD | Exact business decision still unresolved |
| DEFERRED | Outside the current implementation scope |
| SUPERSEDED | Replaced by a later owner-approved rule |

### Rule Precedence

When documentation conflicts:

1. Follow the latest explicit owner-approved business decision.
2. Verify current frontend implementation and relevant tests.
3. Consult the authoritative domain specifications.
4. Preserve historical decisions but mark superseded behavior clearly.
5. Do not introduce a new rule simply because an older specification lists it.

The following documents own detailed technical behavior:

- `PRD.md` — Product functionality.
- `SYSTEM_DESIGN.md` — Business workflows.
- `SECURITY.md` and `RBAC_PERMISSIONS.md` — Authorization.
- `ERD.md` and `DATABASE.md` — Data persistence.
- `API.md` — Proposed API contracts.

This document is the consolidated reference for domain rules and invariants.

---

## 3. Global Business Invariants

The following principles apply to all ERP modules.

**BR-GLOBAL-001 — Trusted Identity**

Every protected operation must be associated with an authenticated and authorized user.

**BR-GLOBAL-002 — Organization Ownership**

Operational records must belong to the correct academy organization.

**BR-GLOBAL-003 — Branch Scope**

Branch-specific records may only be read or changed within the user's approved scope.

**BR-GLOBAL-004 — Valid References**

Related Student, Course, Batch, Teacher, Admission, Challan and Payment identifiers must reference appropriate existing records.

**BR-GLOBAL-005 — Permission Enforcement**

A visible frontend button or tab does not independently authorize a backend operation.

**BR-GLOBAL-006 — Atomic Operations**

Operations that must succeed together must not leave partially committed academic or financial records.

**BR-GLOBAL-007 — Historical Preservation**

Approved financial, payroll and audit records must remain traceable after ordinary record updates or lifecycle changes.

**BR-GLOBAL-008 — No Duplicate Financial Writes**

Repeated submissions must not create unintended duplicate fee collections or payroll disbursements.

**BR-GLOBAL-009 — Consistent Calculations**

The same business calculation must be used for operational screens, dashboards, reports, receipts and exports.

**BR-GLOBAL-010 — No Unapproved Features**

Refunds, arbitrary financial reversals, automatic monthly payroll and unsupported entity transfers must not be enabled without explicit approval.

---

## 4. Organization and Branch Rules

### BR-BRANCH-001 — Multiple Branches

One academy organization may operate multiple branches.

Branch counts must not be hardcoded into business logic.

### BR-BRANCH-002 — Authorized Branch Access

A user may only select and operate within an authorized branch.

The backend must verify branch membership or another explicitly approved access capability.

### BR-BRANCH-003 — Branch-Specific Roles

A user may have different roles in different branches.

Effective permissions must be recalculated after changing branches.

### BR-BRANCH-004 — Branch Creation Pause

**CONFIRMED:** New branch creation is currently paused for all roles, including Super Admin.

No backend branch-creation operation may become active until the owner explicitly reauthorizes it.

### BR-BRANCH-005 — Branch Editing

Only fields permitted by the current frontend branch policy may be modified.

Protected branch identity fields must not change through generic edit operations.

### BR-BRANCH-006 — Branch Deactivation

An active branch must not be deactivated if the existing approved safeguards prohibit the operation.

The current policy protects the selected active branch, the last usable branch and relevant pending admissions, active enrollments and unpaid challans.

### BR-BRANCH-007 — Branch Deletion

Deletion requires all current approved conditions to pass, including:

- The branch is inactive.
- It is not the currently selected branch.
- There are no blocking operational records.
- Staff assignment blockers and approved exceptions have been checked.
- No unrelated records will be deleted.
- The operation preserves required historical references.

The exact final checks must be verified against the current frontend branch-management service.

### BR-BRANCH-008 — Cross-Branch Reporting

Multi-branch comparison must only include branches authorized for the relevant reporting operation.

Cross-branch reporting is not permission to perform unrestricted cross-branch mutations.

---

## 5. User Accounts and Roles

### BR-USER-001 — Five Roles

The existing application supports exactly five current roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

Future Platform Admin is deferred.

### BR-USER-002 — Individual Accounts

Each staff member must have an individual account identity.

### BR-USER-003 — Multiple Branch Assignments

One account may be assigned to multiple authorized branches.

### BR-USER-004 — Different Roles Per Branch

Different effective roles are permitted across separate branches.

### BR-USER-005 — Same-Branch Multiple Roles

Historical requirements describe multiple roles within one branch, but the current frontend fails closed on unresolved combinations.

Do not automatically combine same-branch role permissions until an explicit final policy is approved.

### BR-USER-006 — Admin Privilege Ceiling

Admin may perform approved administrative operations but cannot grant unauthorized higher privileges or modify protected privileged accounts.

### BR-USER-007 — Account Deactivation

Disabled accounts must lose protected operational access according to the approved security/session policy.

Deactivation must not erase necessary audit or financial history.

### BR-USER-008 — Authorization Changes

Changes to roles, branch assignments or account status must cause subsequent operations to use the updated permissions.

---

## 6. Module Access Rules

**CONFIRMED — Owner-Approved Access Boundaries**

### Super Admin

May use the currently implemented authorized administrative and operational modules, subject to action and data-scope restrictions.

### Admin

May use the approved operational and administrative modules within assigned branches, while respecting privilege-escalation restrictions.

### Receptionist

Has **FULL access to Admissions and Fees**, including existing approved actions.

Receptionist must not receive access to independent:

- Finance.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branch Management.
- User Management.
- Administrative Settings.

### Owner

May use approved read-oriented academic/financial functionality and the existing authorized expense capabilities.

Exact write permissions must match the frontend permission registry.

### Teacher

May access their own dashboard, My Profile, assigned teaching information, own salary details and authorized payslips.

Teacher may not manage other teachers' salaries or use administrative modules.

Full module access never overrides branch, record, status or financial-integrity rules.

---

## 7. Courses and Academic Programs

### BR-COURSE-001 — Valid Course Records

Every course must use a stable identifier.

Names or display labels must not act as permanent relationship keys.

### BR-COURSE-002 — Branch Ownership

Courses, subjects, streams and batches must follow their approved ownership model.

Do not assume all academic catalogs are globally shared.

### BR-COURSE-003 — Batch-Course Relationship

A batch must reference the correct course and permitted branch.

### BR-COURSE-004 — Valid Academic Selection

Admissions and enrollments must reject newly selected invalid or unrelated courses/batches.

### BR-COURSE-005 — Subject and Stream Relationships

Subject and stream selections must follow the existing frontend academic structure.

### BR-COURSE-006 — Referenced Record Protection

A course or batch used by existing enrollments, assignments or financial records must not be deleted in a way that breaks historical relationships.

### BR-COURSE-007 — Batch Capacity

Enrollment must respect configured batch capacity where that rule is implemented and approved.

Concurrency must not allow multiple simultaneous requests to exceed capacity.

### BR-COURSE-008 — Fee Calculation

The backend must reproduce the existing course-fee and selected-subject-fee logic.

Exact formulas must be verified from the frontend services before implementation.

No fee amount may be inferred solely from an academic label.

---

## 8. Admissions Business Rules

### BR-ADM-001 — Required Applicant Data

An admission must contain the required student, contact and academic selection information defined by the existing frontend form and validation rules.

### BR-ADM-002 — Valid Branch

Admission records must belong to an authorized branch.

### BR-ADM-003 — Valid Course and Batch

A newly selected course or batch must exist and satisfy the approved branch/course relationship.

### BR-ADM-004 — Student Linkage

Where the workflow creates or links a student, the admission and student references must remain consistent.

### BR-ADM-005 — Admission Status

The current frontend approval workflow uses **Pending** and **Approved**, with an approved return-to-Pending action where permitted.

Historical Reject/Rejected behavior must not be reintroduced as an active operation without a new decision.

Legacy status handling must be verified before production migration.

### BR-ADM-006 — Admission Approval

Only users with the current approved permission may approve an admission.

Receptionist has full Admissions permission under the owner's latest decision.

### BR-ADM-007 — Return to Pending

Returning an Approved admission to Pending is allowed only when current record conditions and permissions permit it.

Already enrolled or financially protected records must respect the existing mutation restrictions.

### BR-ADM-008 — Admission Editing

Editing must preserve:

- Stable admission identity.
- Correct linked student relationship.
- Academic reference validity.
- Approved status restrictions.
- Relevant historical metadata.

### BR-ADM-009 — Admission Deletion

Deletion is permitted only under the current approved action and record-state restrictions.

Linked active enrollments, financial records or protected history must not be erased through unsafe cascading deletion.

### BR-ADM-010 — Display Numbering

Admission and Student visible serials follow the existing branch-scoped, gapless display-number behavior.

Visible serials are projections, not permanent foreign keys.

### BR-ADM-011 — Instant Admission

The approved frontend supports an integrated admission completion workflow involving Student, Admission, Enrollment, Challan and an optional verified payment.

The backend must coordinate required durable writes consistently.

### BR-ADM-012 — Duplicate Prevention

Repeated submissions must not create unintended duplicate enrollments, challans or fee payments.

---

## 9. Student Business Rules

### BR-STU-001 — Stable Identity

Every student must have a stable internal identifier.

### BR-STU-002 — Student Profile

The student profile must preserve the approved student details and relevant academic links.

### BR-STU-003 — Authorized Editing

Only users with the required permission may update the student's approved editable fields.

### BR-STU-004 — Enrollment History

Editing a student must not remove associated enrollments or financial history.

### BR-STU-005 — Branch Visibility

Student access must respect the current organization/branch data model.

### BR-STU-006 — Teacher Visibility

Teachers may access only student information related to their authorized teaching assignments, where that access is supported by the approved self-service workflow.

Teachers do not receive general branch-wide student directory access.

### BR-STU-007 — Duplicate Identity

Duplicate detection and student identity sharing across branches require an approved technical/business contract.

Do not invent automatic student merging.

---

## 10. Enrollment Business Rules

### BR-ENR-001 — Valid Admission

Enrollment through the admission workflow requires the admission to be in an eligible approved state.

### BR-ENR-002 — Valid Student

The linked student must exist and satisfy the required admission relationship.

### BR-ENR-003 — Valid Academic References

Course and Batch must belong to the approved academic scope.

### BR-ENR-004 — Duplicate Enrollment Prevention

Prevent a repeated admission enrollment operation from creating an unintended second enrollment.

### BR-ENR-005 — Batch Capacity

Respect approved capacity restrictions under concurrent requests.

### BR-ENR-006 — Student Activation

The admission-to-enrollment workflow must preserve the existing student activation behavior.

### BR-ENR-007 — Historical Preservation

Enrollment history must not be removed when a batch closes or a student's active state changes.

### BR-ENR-008 — Challan Relationship

A successful instant admission/enrollment workflow must maintain the correct associated fee obligation where required.

### BR-ENR-009 — Transaction Integrity

Do not commit an incomplete multi-record enrollment workflow as a success.

---

## 11. Faculty and Class Rules

### BR-FAC-001 — Valid Teacher

A faculty assignment must reference an authorized Teacher identity.

### BR-FAC-002 — Valid Teaching Relationship

The assignment must connect an eligible Teacher, Branch, Course, Batch and Subject as required by the implemented frontend.

### BR-FAC-003 — Class Scheduling

Class schedules must follow the saved assignment details and the approved timetable rules.

### BR-FAC-004 — Schedule Conflict

Conflicting teaching assignments or timetable entries must be rejected where the approved frontend policy defines conflict restrictions.

### BR-FAC-005 — Student Reach

Faculty student counts must derive from valid assigned batches/enrollments.

### BR-FAC-006 — Assignment History

Removing or ending a teaching assignment must not erase financial agreements or salary payment history that depend on it.

### BR-FAC-007 — Teacher Self Access

A Teacher can view only their own authorized teaching information.

---

## 12. Teacher My Profile

**CONFIRMED — Implemented Frontend Self-Service**

### BR-PROFILE-001 — Identity

The `My Profile` workflow must resolve the Teacher from the authenticated session.

### BR-PROFILE-002 — Profile Information

Teacher may view their own bio, professional details and approved contact information.

### BR-PROFILE-003 — Timetable

Teacher may view their own class schedule and approved printable timetable.

### BR-PROFILE-004 — Academic Assignments

Teacher may view their own courses, batches, subjects and permitted teaching relationships.

### BR-PROFILE-005 — Salary and Compensation

Teacher may view:

- Agreed remuneration.
- Verified amount paid.
- Remaining outstanding amount.
- Assignment-level remuneration.
- Salary payment history.
- Own payslips.

### BR-PROFILE-006 — Payslip

Teacher may view, print or export only their own supported payslips.

### BR-PROFILE-007 — Data Confidentiality

Teacher may not view another Teacher's profile or compensation through self-service endpoints.

### BR-PROFILE-008 — Administrative Separation

My Profile access does not authorize general Faculty Management, Finance or Teacher Payroll administration.

---

## 13. Student Fees and Challans

### BR-FEE-001 — Valid Enrollment

A challan must reference a valid eligible student/enrollment relationship.

### BR-FEE-002 — Challan Uniqueness

The existing frontend's one-challan-per-enrollment contract must be preserved unless an updated approved fee model replaces it.

### BR-FEE-003 — Fee Calculation

Challan totals must use approved course/subject fee calculations.

### BR-FEE-004 — Exact Money

Financial calculations must use a consistent exact monetary representation.

The production representation and rounding policy require final technical approval.

### BR-FEE-005 — Partial Payments

Approved partial fee collections must be supported.

### BR-FEE-006 — Verified Collections

Only valid **Verified** payments must count toward collected revenue and settled balances.

### BR-FEE-007 — No Overpayment

A payment must not exceed the applicable remaining fee balance under the approved workflow.

### BR-FEE-008 — Payment History

Fee payments must remain traceable through references, dates, amounts and relevant authorized staff metadata.

### BR-FEE-009 — Receipt Integrity

Receipts must represent the corresponding verified payment, not an unrelated or fabricated amount.

### BR-FEE-010 — Financial Projections

Fees, Finance, Dashboard and Reports must use consistent authoritative payment data.

### BR-FEE-011 — Receptionist Access

Receptionist has full approved access to the Fees module.

This does not grant independent access to Expenses, Finance or Teacher Payroll.

### BR-FEE-012 — Refunds and Reversals

Refunds, reversals and unapproved adjustments remain disabled until explicitly specified and authorized.

---

## 14. Finance and Expense Rules

### BR-FIN-001 — Verified Revenue

Revenue projections must derive from applicable verified student fee payments.

### BR-FIN-002 — Posted Expenses

Operational expense totals must derive from appropriately posted and authorized expense records.

### BR-FIN-003 — Salary Expense Link

A valid teacher salary disbursement must be represented consistently in the approved expense and financial reporting records.

### BR-FIN-004 — No Duplicate Salary Expense

A payroll payment must not create multiple independent financial expenses through retries or repeated processing.

### BR-FIN-005 — Expense Categories

Expense categories, including approved custom-category behavior, must follow existing frontend validation.

### BR-FIN-006 — Expense Authorization

Super Admin and Admin may manage approved expenses within permitted scope.

Owner's specific approved expense actions must match the current frontend permission registry.

Receptionist and Teacher must not receive independent expense-management access.

### BR-FIN-007 — Consistent Net Position

The Finance overview must calculate its net position using the same approved revenue and expense definitions as other reporting modules.

### BR-FIN-008 — Historical Financial Records

Ordinary updates must not silently erase or rewrite historical fee or salary transactions.

### BR-FIN-009 — Corrections

Expense reversal, refund, adjustment and deletion policies not established by the existing approved workflow remain TBD.

---

## 15. Teacher Payroll — Assignment-Based Running Salary

**Status: CONFIRMED — Owner Approved**

This is a critical business model and supersedes historical assumptions about automatically generated monthly teacher salaries.

### BR-PAY-001 — Assignment-Based Obligation

Teacher remuneration is connected to an approved Faculty Assignment and its Salary Agreement.

### BR-PAY-002 — Independent Agreements

Each eligible assignment may establish its own independent remuneration obligation.

A new batch or subject assignment must not overwrite an older salary agreement.

### BR-PAY-003 — No Automatic Monthly Salary

Changing the calendar month must not create a new salary obligation.

Do not implement a monthly payroll generator.

### BR-PAY-004 — Existing Compensation Methods

The current frontend supports Fixed and Percentage agreement methods.

The exact salary calculation must match the existing frontend implementation.

Verify the source and relevant tests before finalizing backend calculations.

### BR-PAY-005 — Running Payable

An assignment's agreed payable amount must be computed or persisted according to one consistent approved business contract.

### BR-PAY-006 — Partial and Full Payments

Authorized administrators may record approved partial or full salary payments.

### BR-PAY-007 — Outstanding Balance

Conceptually:

```text
Outstanding Salary = Agreed Payable - Valid Applied Salary Payments
```

The precise formula, revisions, rounding and status semantics must remain consistent with the current frontend.

### BR-PAY-008 — No Overpayment

A salary payment must not exceed the allowed outstanding balance for its target obligation.

### BR-PAY-009 — Assignment Identity

Every payment must reference its actual eligible faculty assignment or associated salary obligation.

### BR-PAY-010 — Historical Preservation

Previous agreements, salary payments, balances and related audit records must remain available after a new teaching assignment starts.

### BR-PAY-011 — Batch Completion

Ending a batch must not erase an unpaid historical balance.

No new monthly salary is generated solely because the previous batch has ended.

### BR-PAY-012 — Payroll Expense Posting

Salary payment and matching expense must be durably linked and remain consistent.

### BR-PAY-013 — Idempotency

Repeated payroll-payment submissions must not create duplicate salary disbursements or expenses.

### BR-PAY-014 — Administrative Authorization

Admin and Super Admin may perform approved salary management actions within authorized scope.

Owner may access the currently approved read-only payroll overview.

Receptionist may not access payroll.

### BR-PAY-015 — Teacher Self-Compensation

Teacher may view only their own agreement amounts, running balances, verified payments and payslips.

Teacher may not modify obligations or record disbursements.

### BR-PAY-016 — Reporting Consistency

Payroll reports, Finance expenses and Teacher My Profile must derive from consistent authoritative salary/payment records.

### BR-PAY-017 — Formula Verification Gate

Before implementing the backend's Fixed/Percentage calculations, verify:

- `Client/src/mock/assignmentPayroll.js`
- `Client/src/mock/runningPayroll.js`
- `Client/src/services/payrollService.js`
- Relevant payroll tests.

Do not invent or substitute a generic salary formula.

### BR-PAY-018 — Unsupported Payroll Functions

Do not implement unapproved:

- Monthly payroll generation.
- Automatic calendar-period salary renewal.
- Salary advance processing.
- Arbitrary historical balance adjustment.
- Uncontrolled payment reversal.
- Automatic settlement on batch closure.

---

## 16. Demo Classes

### BR-DEMO-001 — Valid Inquiry

A demo inquiry must contain the required candidate and academic interest data.

### BR-DEMO-002 — Authorized Branch

The inquiry and any resulting admission must follow approved branch ownership.

### BR-DEMO-003 — Trial Outcomes

Attendance, absence/no-show, scheduling and cancellation states must follow the implemented frontend workflow.

### BR-DEMO-004 — Admission Conversion

A demo inquiry may be converted into an admission through the approved process.

### BR-DEMO-005 — No Duplicate Conversion

Repeated conversion attempts must not create duplicate linked admissions.

### BR-DEMO-006 — Prefill Integrity

Candidate information transferred to the Admissions form must be validated before final submission.

### BR-DEMO-007 — Financial Separation

A demo inquiry does not itself create a verified fee payment.

### BR-DEMO-008 — Historical Context

Preserve relevant demo history after conversion where required by the approved model.

---

## 17. Physical Assets and Inventory

### BR-ASSET-001 — Physical Inventory

The Assets module represents physical academy property, not digital files.

### BR-ASSET-002 — Stable Asset Code

An asset must have a stable identifier and appropriate branch-unique code where approved.

### BR-ASSET-003 — Authorized Registration

Only permitted users may register or update assets.

### BR-ASSET-004 — Asset Assignments

Assignments must reference valid authorized staff and permitted branches.

### BR-ASSET-005 — Inspections

Approved condition/inspection records must preserve relevant history.

### BR-ASSET-006 — Maintenance

Maintenance events must reference the correct asset and preserve approved history.

### BR-ASSET-007 — Financial Separation

A maintenance cost entry must not automatically create an operating expense unless the frontend's approved business contract explicitly requires it.

### BR-ASSET-008 — No Unapproved Deletion

Do not add destructive asset deletion, automatic depreciation or disposal processes without approval.

### BR-ASSET-009 — No Media Storage

Cloudinary, image uploads, video uploads and digital media management remain deferred.

---

## 18. Dashboard Business Rules

### BR-DASH-001 — Real Data

Dashboard KPIs must derive from authorized saved operational data rather than invented fixed numbers.

### BR-DASH-002 — Role Visibility

Each role receives only its authorized dashboard information.

### BR-DASH-003 — Branch Scope

Dashboard metrics must respect active branch and approved cross-branch reporting scope.

### BR-DASH-004 — Shared Calculations

Student counts, admissions, collection amounts, expenses and payroll figures must use the same authoritative definitions as their source modules.

### BR-DASH-005 — Teacher Dashboard

Teacher receives only own or assignment-scoped teaching information and approved remuneration summaries.

### BR-DASH-006 — No Unauthorized Finance Exposure

Receptionist dashboard may include permitted front-desk operational information but must not reveal unrelated Finance or Payroll records.

---

## 19. Reports and Ledgers

### BR-REPORT-001 — Authorized Reports

Reports must require the applicable report-level permission.

### BR-REPORT-002 — Branch Filtering

Only authorized branches may contribute records to a report.

### BR-REPORT-003 — Operational Versus Financial Reports

Receptionist may access explicitly permitted operational reports without gaining full Finance reporting access.

### BR-REPORT-004 — Payroll Reporting

Payroll reports must use assignment-based running salary obligations and valid salary payments.

### BR-REPORT-005 — Verified Fee Collection

Fee collection reports must count only payments meeting the approved verified state.

### BR-REPORT-006 — Outstanding Balances

Outstanding fees and salary balances must use consistent authoritative calculations.

### BR-REPORT-007 — Safe Export

CSV, PDF, Word and print exports must respect the same permissions and data scope as their source reports.

### BR-REPORT-008 — No False Totals

Do not use demo placeholder figures as actual institution totals.

### BR-REPORT-009 — Cross-Branch Comparison

Cross-branch reports require explicit approved comparison permissions.

---

## 20. Audit Log

### BR-AUDIT-001 — Protected History

Sensitive operations must generate appropriate audit history.

### BR-AUDIT-002 — Restricted Visibility

Audit Log access is restricted to the currently approved administrative roles.

### BR-AUDIT-003 — No Ordinary Editing

Audit records must not be freely edited or deleted through general ERP actions.

### BR-AUDIT-004 — Sensitive Data Protection

Do not store passwords, session cookies, secret values or unnecessary personal information in audit payloads.

### BR-AUDIT-005 — Transaction Consistency

When an audit record is essential to a successful financial or administrative operation, the durable transaction strategy must preserve the required audit linkage.

### BR-AUDIT-006 — Historical Preservation

Role changes and account deactivation must not erase audit records.

---

## 21. Settings and Branding

### BR-SET-001 — Authorized Changes

Only roles with approved Settings permissions may change protected configuration.

### BR-SET-002 — Academy Branding

Preserve existing academy name and color/theme configuration.

### BR-SET-003 — Branch-Specific Settings

Branch-specific overrides must not improperly change unrelated branches.

### BR-SET-004 — Valid Configuration

All saved settings must pass suitable validation.

### BR-SET-005 — Secrets

Passwords, database credentials and private API secrets must not be stored in normal academy settings.

### BR-SET-006 — Media Scope

Do not introduce a new logo/file-upload platform or Cloudinary integration without approval. Existing bundled branding assets may remain.

---

## 22. Notifications

### BR-NOTIF-001 — Authorized Recipient

Notifications belong to specific authorized users or other explicitly approved audiences.

### BR-NOTIF-002 — Payroll Payment Notification

The existing frontend supports notifying a Teacher when an authorized salary disbursement is recorded.

### BR-NOTIF-003 — Privacy

Notification content must not expose another Teacher's confidential compensation.

### BR-NOTIF-004 — Transaction Authority

Notification delivery is not the source of truth for a salary payment.

### BR-NOTIF-005 — No Unsupported Channels

Email, SMS, WhatsApp and external messaging integrations remain outside scope unless approved.

---

## 23. Cross-Module Transaction Rules

The following workflows require coordinated consistency.

| Business operation | Required consistency |
|---|---|
| Instant admission | Student, Admission, Enrollment, Challan and optional Verified Payment |
| Enrollment | Valid Student/Course/Batch, capacity and duplicate protection |
| Challan creation | Correct enrollment and no unintended duplicate obligation |
| Fee collection | Valid payment, challan balance and verification state |
| Payroll payment | Correct obligation, valid amount, posted expense and required audit |
| Demo conversion | Valid inquiry/admission linkage without duplication |
| Branch deletion | Ownership, operational blockers and related assignment safety |
| Role assignment change | Authorized permissions, persistence and revocation |

### Transaction Requirements

- No partial successful business transactions.
- Use idempotency for appropriate sensitive writes.
- Validate unique references.
- Protect against concurrent overpayment or over-enrollment.
- Recheck affected record state before committing.
- Preserve required audit metadata.
- Return clear conflict errors when concurrent modifications invalidate an operation.

MongoDB transactions must be complemented by indexes and business invariant checks.

---

## 24. Validation and Error Rules

### BR-VAL-001 — Required Fields

Reject missing required data.

### BR-VAL-002 — Data Types

Validate submitted values against approved types and formats.

### BR-VAL-003 — Relationship Integrity

Reject invalid foreign references or incompatible organization/branch relationships.

### BR-VAL-004 — Money Validation

Reject invalid, negative or otherwise unsupported financial amounts.

### BR-VAL-005 — State Transitions

Reject transitions outside the current approved workflow.

### BR-VAL-006 — Permission Failure

Reject operations without applicable role, branch or record authority.

### BR-VAL-007 — Duplicate Requests

Prevent unintended duplicate creation when requests are retried.

### BR-VAL-008 — Concurrency Conflict

Reject stale actions where the relevant record state has changed.

### BR-VAL-009 — Unknown Fields

Prevent unauthorized changes through extra submitted fields.

### BR-VAL-010 — Safe Errors

Do not expose confidential records, passwords, stack traces or internal database details through business errors.

---

## 25. Historical Records and Deletion

Business data is not automatically disposable because a corresponding frontend row supports a delete action.

### Mandatory Rules

- Preserve historical payments and payroll records.
- Prevent unsafe cascading deletion.
- Preserve permanent internal record identifiers.
- Keep audit-sensitive changes traceable.
- Apply current admission deletion safeguards.
- Apply strict branch deletion rules.
- Do not silently erase linked historical data.
- Distinguish logical deactivation from physical deletion.

Retention and archival policies not explicitly established remain TBD.

---

## 26. Performance-Related Business Constraints

Performance optimization must not alter business correctness.

Requirements:

- Use pagination on large operational lists.
- Avoid recalculating unrelated records unnecessarily.
- Use stable ordering for serial projections.
- Protect financial calculations from stale caches.
- Invalidate related dashboards/reports after successful writes.
- Scope cached information by authorized user/branch.
- Never trade branch isolation or transaction integrity for faster queries.

Redis, realtime sockets and background workers are optional future enhancements, not automatic requirements.

---

## 27. Business Rule Testing

Future backend implementation must verify relevant rules with both successful and denied scenarios.

### Authentication and Scope

- Active authenticated user.
- Disabled user rejection.
- Wrong-branch denial.
- Role changes during sessions.
- Unresolved same-branch multi-role rejection.

### Admissions and Academics

- Valid admission creation.
- Invalid course/batch rejection.
- Approved status transitions.
- Guarded deletion.
- Valid enrollment.
- Duplicate enrollment prevention.
- Batch capacity concurrency.

### Fees and Finance

- Correct challan amounts.
- Partial payments.
- Verified collection behavior.
- Duplicate payment prevention.
- Overpayment rejection.
- Expense authorization.
- Consistent Finance projections.

### Teacher Payroll

- Correct Fixed agreement calculation.
- Correct Percentage agreement calculation.
- Separate assignment obligations.
- New-month non-generation.
- Partial/full salary payments.
- Historical outstanding preservation.
- Salary-expense consistency.
- Teacher self-only salary visibility.

### Role Permissions

- Receptionist full Admissions and Fees.
- Receptionist denied Finance and Payroll.
- Owner approved read/expense operations.
- Admin privilege restrictions.
- Teacher own-profile access.
- Teacher cross-profile denial.

### Reports and Operations

- Report branch filtering.
- Export permissions.
- Demo conversion.
- Asset history integrity.
- Audit event restrictions.

No unexecuted test may be marked PASS.

---

## 28. Unresolved Business Decisions

The following remain TBD or subject to source-level confirmation:

- Exact Fixed/Percentage salary formula and rounding.
- Monetary persistence and response precision.
- Student identity sharing between branches.
- Student duplicate/merge policy.
- Exact enrollment uniqueness across multiple programs.
- Final capacity and reservation semantics.
- Same-branch multi-role combination policy.
- Refund, reversal and chargeback approval workflow.
- Expense corrections and historical adjustments.
- Production session lifetime and revocation configuration.
- Cross-branch Teacher self-profile aggregation.
- Retention and archival periods.
- Final migration of historical mock data.
- Deployment and backup/recovery policies.

Do not invent decisions where current frontend evidence and owner approvals do not establish a rule.

---

## 29. Backend Implementation Guidelines

Backend domain services must enforce the approved business rules independently from frontend validation.

### Responsibilities

- Controllers handle HTTP transport.
- Validators check request shape, formats and permitted fields.
- Business services enforce state transitions, calculations and cross-module invariants.
- Repositories handle appropriately scoped MongoDB operations.
- Models define approved schemas and indexes.
- Transaction coordinators or domain services manage multi-record consistency.
- Authorization middleware checks identity and permissions.
- Audit services record relevant sensitive operations.

Avoid duplicating domain rules across multiple modules.

Before implementing a rule, inspect current frontend domain services and related tests to identify its actual existing behavior.

---

## 30. Documentation Dependencies

This specification must remain aligned with:

- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Detailed business workflows.
- `SECURITY.md` — Security and authorization.
- `RBAC_PERMISSIONS.md` — Role-based permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization and branch ownership.
- `ARCHITECTURE.md` — Technical architecture.
- `ERD.md` — Entity relationships.
- `DATABASE.md` — MongoDB design.
- `API.md` — Proposed API endpoints.
- `FRONTEND_INTEGRATION.md` — Existing frontend service contracts.
- `FRONTEND_AUDIT.md` — Frontend functionality evidence.
- `MODULE_WORKFLOW_MAP.md` — Cross-module workflow evidence.
- `ROLE_BRANCH_DATA_MATRIX.md` — Role/scope evidence.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend handoff.
- `BACKEND_GAPS_AND_RISKS.md` — Remaining backend risks.
- `MEMORY.md` — Approved decisions.
- `PROGRESS.md` — Verified implementation progress.
- `RULES.md` — Engineering rules.
- `AGENTS.md` — AI coding instructions.

Use the actual repository locations when creating relative Markdown links.

---

## 31. Final Implementation Boundary

### Confirmed Requirements

- Five existing frontend roles.
- Receptionist full approved Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll without monthly generation.
- Multiple authorized branches.
- Current branch creation pause.
- Existing connected academic and financial workflows.
- Physical inventory Assets with no media upload implementation.

### Proposed Technical Enforcement

- Backend validators and domain services.
- MongoDB transactions.
- API idempotency.
- Precise financial data representation.
- Index and concurrency mechanisms.
- Backend audit and authorization enforcement.

### Deferred

- Platform Admin and multi-client SaaS operations.
- Cloudinary and image/video uploads.
- Unsupported refunds/reversals.
- Unapproved financial adjustments.
- Automatic monthly payroll generation.
- Unnecessary distributed infrastructure.

### Not Implemented

- Production domain services.
- Server-enforced business validation.
- MongoDB transaction workflows.
- Backend business-rule integration tests.

**Governing Principle:** Every business operation must preserve the approved academic relationships, financial accuracy, teacher assignment remuneration, role access and branch ownership while rejecting invalid or unauthorized changes.

**Document Status:** DRAFT — Ready for detailed backend business-rule review. Implementation requires separately approved development tickets.
