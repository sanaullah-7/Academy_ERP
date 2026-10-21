<!-- Frontend & Integration Specification — har page ka behavior, mock data aur future API contracts -->

# Academy Management ERP — Frontend & Integration Specification

**Document:** FRONTEND_INTEGRATION.md
**Version:** 1.0
**Status:** DRAFT — Pending Integration Contract Review
**Last Updated:** 2026-10-09
**Project:** Academy Management ERP
**Frontend:** React + Vite
**Future Backend:** Node.js + Express
**Future Database:** MongoDB + Mongoose
**Development Strategy:** Frontend First, Backend Integration Later

---

## F00-010 Current Mock Integration Boundary (2026-10-09)

Current verified chain remains Page -> Hook/Context -> Domain Service -> Mock Adapter. Auth/Branch contexts and scopeKey are shared; future branch-scoped consumers must invalidate/remount their transient UI and re-query when scopeKey changes. This foundation does not add a query cache or ERP module state.

Current independent versioned keys: academyERP:mock:auth:v1, academyERP:mock:data:v1, academyERP:mock:branding:v1. studentService/courseService expose async list/getById/create/update with concrete branchId query; only provisional id/branchId/name exists. Corrupt/unsupported ERP data errors preserve saved bytes; no reset/migration UI is delivered. Branding service get/save is synchronous for minimal native storage, separate from auth/data; Academy/Theme providers share validated state and safely fall back without silently deleting corrupt branding.

Replacement boundary: mockApi.request(collection, operation, args) for data, brandingService adapter for academy appearance, existing authService for session operations. Future HTTP/auth behavior requires separately approved contracts and server authorization; known-branch filtering alone is not user authorization. Dashboard statistics need separately approved data contracts; current seed names must not be presented as invented financial/attendance metrics. [Current checks, comments and pending acceptance](PROGRESS.md#f00-010--foundation-verification-delivery-2026-10-09).

---

## 1. Purpose

This document defines the frontend screens, component responsibilities, frontend state, mock data architecture, service interfaces, proposed API contracts, integration boundaries, validation behavior and error-handling standards for the Academy Management ERP.

It ensures that Codex, Antigravity and future developers implement consistent, testable, reliable and maintainable frontend features.

The main objective is to build a functional frontend using mock services first, while preparing stable interfaces for future integration with the real backend.

The frontend should not require substantial page rewrites when backend integration begins.

This document defines integration requirements and proposed contracts. It does not authorize implementation of unapproved functionality.

## 2. Decision Classification

Every requirement must use the following classification:

- **CONFIRMED:** Explicitly supplied or approved project requirement.
- **PROPOSED:** Recommended engineering decision awaiting approval.
- **TBD:** Missing or unresolved requirement.
- **DEFERRED:** Outside the current development scope.

Do not silently convert proposed endpoints, fields or business rules into confirmed requirements.

General client approval of the system proposal does not automatically resolve detailed technical decisions.

## 3. Confirmed Project Context

The Academy Management ERP is initially intended for one academy organization with multiple branches.

The application is web-based.

The initial frontend is built in the existing capitalized `Client/` directory.

The backend exists in the capitalized `Server/` directory.

### Confirmed Technologies

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Source Control | Git and private GitHub repository |
| AI Development Tools | Codex and Antigravity |

### Confirmed Roles

- Super Admin
- Owner
- Receptionist
- Teacher

Staff may have different roles in different branches and multiple assigned roles in the same branch.

### Confirmed Development Direction

- Frontend-first development.
- Mock services during early development.
- Centralized browser demo storage.
- Reusable components.
- Modular application architecture.
- Centralized role and branch contexts.
- Consistent validation and UI states.
- Real backend integration later.
- Backend-enforced authorization before production use.

### Deferred

- Multi-client SaaS.
- Subscription management.
- Electron desktop application.
- Dedicated native mobile applications.

---

# 4. Frontend Architecture

## 4.1 Architectural Layers

The frontend must separate the following responsibilities:

1. Route-level pages.
2. Reusable presentation components.
3. Page and application state.
4. Domain services.
5. Data adapters.
6. Mock or HTTP persistence.

### Required Data Flow

```text
User Interaction
       |
       v
React Page / Component
       |
       v
Page State / Hook
       |
       v
Domain Service
       |
       v
Data Adapter
       |
       +-------------------+
       |                   |
       v                   v
Mock Adapter          HTTP Adapter
       |                   |
       v                   v
Demo Storage          Express REST API
                           |
                           v
                      MongoDB
```

The mock adapter is used during frontend development.

The HTTP adapter is introduced during backend integration.

Pages must not depend directly on database implementation details.

## 4.2 Frontend Directory Organization

The existing `Client/` project must follow the approved page-based structure.

```text
Client/src/
├── pages/
├── components/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Admissions/
│   ├── Students/
│   ├── CoursesBatches/
│   ├── FacultyClasses/
│   ├── Fees/
│   ├── Finance/
│   ├── DemoClasses/
│   ├── Assets/
│   ├── Reports/
│   ├── Settings/
│   ├── BranchManagement/
│   ├── UserManagement/
│   ├── Profile/
│   ├── Layout/
│   ├── Shared/
│   └── ui/
├── layouts/
├── routes/
├── contexts/
├── hooks/
├── services/
├── mock/
├── constants/
├── utils/
├── styles/
├── assets/
├── App.jsx
└── main.jsx
```

Every route-level page should be placed inside its appropriate module folder in `pages/`.

Every module-specific reusable component should be placed inside its corresponding `components/` folder.

Shared components must not be unnecessarily duplicated.

Only create files that are needed for the active approved ticket.

Comment-only source files are architectural placeholders and are not implemented functionality.

---

# 5. Frontend State Management

## 5.1 Application-Wide State

The frontend requires centralized access to:

- Current user.
- Authentication/session state.
- Active branch.
- User roles in the active branch.
- Academy settings.
- Theme configuration.

### Proposed Contexts

| Context | Responsibility |
|---|---|
| AuthContext | Current user and demo authentication state |
| BranchContext | Current authorized branch selection |
| AcademyContext | Academy identity and branding |
| ThemeContext | Appearance and theme settings |

React Context is PROPOSED for relatively stable shared application state.

Do not store every table, form and frequently changing server record in a single global context.

## 5.2 Local Component State

Use local state for:

- Dialog visibility.
- Input values.
- Search terms.
- Selected tabs.
- Temporary form edits.
- UI-only selections.

State should be lifted or shared only when necessary.

## 5.3 Service-Backed Data

Student, admission, invoice, payment and related records must be accessed through domain services.

Components must not maintain unrelated copies of authoritative records.

### Proposed Future Server-State Strategy

TanStack Query is a candidate for server data fetching, caching and invalidation.

Its adoption requires dependency and architecture review.

Do not introduce additional state-management libraries without approval.

---

# 6. Data Adapter Strategy

## 6.1 Principle

The frontend must support two implementations behind consistent service interfaces:

- Mock adapter.
- HTTP adapter.

The same page should work with either implementation when the agreed contract is honored.

## 6.2 Service Interface Example

**Status: PROPOSED**

```javascript
studentService.list(filters)
studentService.getById(studentId)
studentService.create(payload)
studentService.update(studentId, payload)
```

All methods should return Promise-based results for consistent asynchronous behavior.

The mock implementation must not force UI components to use synchronous browser-storage behavior.

## 6.3 Adapter Selection

The implementation should be selected through explicit application configuration.

Suggested configuration values:

```text
VITE_DATA_MODE=mock
VITE_API_BASE_URL=/api/v1
```

These names are PROPOSED.

Avoid switching modes through scattered conditions inside individual components.

Never put secret database credentials or private API keys into Vite environment variables exposed to the browser.

## 6.4 Centralized Error Translation

Domain services or a shared adapter utility must normalize infrastructure failures into a consistent error representation.

Examples:

- Validation failure.
- Not found.
- Unauthorized.
- Permission denied.
- Conflict.
- Network unavailable.
- Unexpected server failure.

Components should respond consistently regardless of whether errors originate from mock services or HTTP requests.

---

# 7. Mock Data Architecture

## 7.1 Purpose

The mock layer supports frontend implementation without requiring the real backend to run.

The mock environment must simulate meaningful business workflows rather than providing disconnected hardcoded arrays.

## 7.2 Proposed Files

```text
Client/src/mock/
├── seedData.js
├── mockDatabase.js
├── mockAuth.js
└── mockApi.js
```

## 7.3 Seed Data

Seed data should provide realistic but fictional examples of:

- Academy.
- Branches.
- Staff users.
- Role assignments.
- Students.
- Courses.
- Batches.
- Admissions.
- Enrollments.
- Invoices.
- Payments.
- Demo classes.
- Assets.

Seed data must not contain actual client student records or real staff passwords.

## 7.4 Browser Storage

**Status: PROPOSED**

Use localStorage as temporary persistence for the frontend demo.

All access must be centralized in the mock persistence layer.

Do not call localStorage independently inside every page.

### Storage Rules

- Use a namespaced storage key.
- Use a schema version.
- Initialize demo data only when appropriate.
- Avoid overwriting valid existing demo changes during refresh.
- Validate loaded records.
- Handle malformed or unavailable storage safely.
- Provide a controlled reset-to-demo-data function.
- Do not store production credentials.
- Do not treat browser storage as a secure database.

### Proposed Example

```text
academyERP:mock:v1
```

Final key and reset behavior remain subject to approval.

## 7.5 Mock Data Isolation

Mock APIs must follow the same branch filtering and service contract expectations as the future backend.

However, frontend mock restrictions are not security controls.

Do not use actual sensitive client data in frontend mocks.

## 7.6 Mock Record Relationships

Shared records must use consistent identifiers.

Example:

```json
{
  "id": "enrollment_001",
  "studentId": "student_001",
  "branchId": "branch_001",
  "courseId": "course_001",
  "batchId": "batch_001",
  "status": "active"
}
```

IDs above are fictional demo identifiers.

The final persistence type and field constraints must follow approved ERD.md.

## 7.7 Storage Limitations

Browser localStorage:

- Is browser-specific.
- Is not shared across devices.
- May be cleared or manually modified.
- Has limited capacity.
- Does not provide safe multi-user concurrency.
- Is unsuitable as the authoritative production database.

Use it only for controlled frontend demo development.

---

# 8. Authentication Integration

## 8.1 Mock Authentication

During frontend-only development, authentication may be simulated using fictional user accounts.

The mock implementation should expose:

```javascript
authService.login(credentials)
authService.logout()
authService.getCurrentUser()
```

Exact login parameters and session representation are PROPOSED.

### Requirements

- Current demo user is accessible through AuthContext.
- User account switching updates branch and role context.
- Logout clears the mock session.
- Invalid state is handled.
- No real passwords are embedded in the frontend.
- The interface clearly distinguishes demonstration from secure production authentication.

## 8.2 Production Authentication

The real backend must authenticate users securely.

**Proposed:**

HTTP-only cookie-based sessions with appropriate session, CSRF, CORS and cookie security policies.

The exact mechanism belongs in SECURITY.md.

The frontend must not assume that a hidden navigation item provides real access control.

## 8.3 Session States

The application should handle:

- Unknown/loading session.
- Authenticated.
- Unauthenticated.
- Session expired.
- Access denied.
- Account disabled.

Actual account lifecycle rules must follow the approved Security Specification.

---

# 9. Branch and Role Integration

## 9.1 Active Branch

Every branch-aware module must obtain its current branch context from the centralized BranchContext.

Do not hardcode:

```text
branch_1
branch_2
```

inside individual business modules.

Demo records may contain fictional branch identifiers, but screens should not depend on fixed branch counts.

## 9.2 Branch Selection

Required behavior:

- One authorized branch: select automatically.
- Multiple authorized branches: allow selection.
- Invalid previously selected branch: recover safely.
- Unauthorized branch: prevent selection in the normal UI.
- Authorized All Branches mode: allow aggregated views.

All Branches must not automatically permit every create or update action. Write operations generally require a concrete permitted branch.

## 9.3 Multiple Roles

A single user may have different roles in different branches.

Example:

```json
{
  "userId": "user_101",
  "assignments": [
    {
      "branchId": "branch_001",
      "roles": ["teacher"]
    },
    {
      "branchId": "branch_002",
      "roles": ["teacher", "receptionist"]
    }
  ]
}
```

Role and branch changes must trigger appropriate frontend navigation, data filtering and query invalidation.

## 9.4 Backend Verification

When integrated, the backend must verify actual branch and role permissions independently.

The frontend branch selection is a request context, not proof of permission.

Teacher data access must also respect assigned teaching relationships.

The exact permission matrix is owned by SECURITY.md.

---

# 10. Proposed Service Registry

The following frontend services are candidates for implementation.

| Service | Responsibilities |
|---|---|
| authService | Authentication and current account |
| branchService | Branch listing and administration |
| userService | Staff account and role assignments |
| studentService | Student profiles and records |
| admissionService | Admission workflows |
| courseService | Course catalog |
| batchService | Batches and assignments |
| facultyService | Teacher profiles and assignments |
| feeService | Fee plans, invoices, payments and receipts |
| financeService | Expenses and authorized financial summaries |
| demoService | Demo registrations and sessions |
| assetService | Asset records |
| reportService | Reporting and export preparation |
| settingsService | Academy settings and branding |

Each service must follow a consistent asynchronous interface.

Do not implement unused methods simply to fill out the registry.

For complex domains, a service may later be split into smaller domain-specific services if justified and approved.

---

# 11. API Integration Conventions

**Status: PROPOSED**

## 11.1 Protocol

Use HTTPS for production communication.

Use a consistent REST-style API.

## 11.2 Proposed Base Path

```text
/api/v1
```

Actual endpoint contracts require approval before backend implementation.

## 11.3 Identifiers

Frontend services should expose stable string IDs.

The real backend may use MongoDB ObjectIds internally.

Do not expose database implementation details unnecessarily to UI components.

## 11.4 Dates

Use clearly defined date representations.

**Proposed:**

- ISO 8601 timestamps for events.
- Explicit time zone handling.
- Separate date-only values where a calendar date is intended.

Do not interpret all dates as UTC midnight without considering academy business rules.

## 11.5 Money

**Proposed:**

Represent currency amounts as integer minor units within service contracts.

Use centralized formatting utilities.

Money precision and accepted currencies must align with the approved ERD and financial rules.

## 11.6 Pagination

**Proposed list request:**

```json
{
  "page": 1,
  "pageSize": 20,
  "search": "",
  "sortBy": "createdAt",
  "sortDirection": "desc"
}
```

The exact maximum page size, sorting fields and filtering contract remain TBD.

## 11.7 Proposed List Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

The same shape should be supported by mock and HTTP adapters if approved.

## 11.8 Proposed Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "details": []
  }
}
```

### Proposed Error Codes

- VALIDATION_ERROR
- UNAUTHENTICATED
- PERMISSION_DENIED
- BRANCH_ACCESS_DENIED
- NOT_FOUND
- CONFLICT
- NETWORK_ERROR
- RATE_LIMITED
- INTERNAL_ERROR

Do not display backend stack traces to end users.

## 11.9 HTTP Error Mapping

Proposed conventions:

| HTTP Code | Meaning |
|---|---|
| 400 | Malformed request |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | State or uniqueness conflict |
| 422 | Validation failure |
| 429 | Too many requests |
| 500 | Unexpected server failure |

Exact server behavior must be documented in the approved API contract.

---

# 12. Proposed Endpoint Inventory

The following endpoints are planning candidates and must not be treated as implemented routes.

| Method | Endpoint | Intended responsibility |
|---|---|---|
| POST | /api/v1/auth/login | Staff authentication |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/auth/me | Current user |
| GET | /api/v1/branches | Authorized branches |
| POST | /api/v1/branches | Create branch |
| GET | /api/v1/users | Authorized user directory |
| POST | /api/v1/users | Create staff account |
| GET | /api/v1/students | Student listing |
| POST | /api/v1/students | Create student |
| GET | /api/v1/students/:id | Student details |
| PATCH | /api/v1/students/:id | Update student |
| GET | /api/v1/admissions | Admissions listing |
| POST | /api/v1/admissions | Create admission |
| GET | /api/v1/courses | Course catalog |
| GET | /api/v1/batches | Batch listing |
| GET | /api/v1/faculty | Authorized faculty records |
| GET | /api/v1/classes | Authorized classes |
| GET | /api/v1/invoices | Fee invoice listing |
| POST | /api/v1/payments | Record payment |
| GET | /api/v1/expenses | Expense listing |
| POST | /api/v1/expenses | Create expense |
| GET | /api/v1/demo-classes | Demo class listing |
| POST | /api/v1/demo-classes | Register demo class |
| GET | /api/v1/assets | Assets listing |
| GET | /api/v1/reports | Available reports |
| GET | /api/v1/settings | Academy settings |
| PATCH | /api/v1/settings | Update permitted settings |

Actual permissions, required fields, query parameters and route granularity remain subject to approval.

Do not create backend endpoints during the frontend-only phase without an approved backend ticket.

---

# 13. API Client Requirements

A centralized API client must eventually handle:

- Base URL configuration.
- Authentication/session transport.
- Request and response processing.
- Safe error normalization.
- Network failure handling.
- Timeouts.
- Cancellation.
- Authorized retries.
- Appropriate credentials handling.

Avoid adding an Authorization header strategy before the session design is approved.

### Retry Safety

Read requests may be eligible for controlled retries.

Financial writes, enrollment creation and other non-idempotent operations must not be blindly retried.

When needed, use approved idempotency keys and server-side duplicate protection.

### Request Cancellation

Use request cancellation where applicable to avoid stale UI results after navigation, branch switching or rapid searches.

### API Versioning

The proposed `/api/v1` scheme should allow controlled future contract evolution.

---

# 14. Screen-to-Service Mapping

The following mapping represents proposed frontend integration responsibilities.

## 14.1 Dashboard

**Pages:**

- DashboardPage.jsx
- SuperAdminDashboard.jsx
- OwnerDashboard.jsx
- ReceptionistDashboard.jsx
- TeacherDashboard.jsx

**Primary Data:**

- Student/enrollment counts.
- Admission summaries.
- Batch summaries.
- Fee collection summaries.
- Authorized role-specific operational data.

**Service Dependencies:**

- Student service.
- Admission service.
- Batch service.
- Fee service.
- User/branch services.

### Rules

- Every metric must derive from consistent source records.
- Active branch filters must apply.
- Role permissions must determine visible information.
- Loading and empty states must be supported.
- Mock numbers must not be represented as real production totals.

The eventual backend may expose specialized aggregate endpoints for efficiency.

## 14.2 Admissions

**Pages:**

- AdmissionsPage.jsx
- NewAdmissionPage.jsx
- AdmissionDetailsPage.jsx
- PendingAdmissionsPage.jsx

**Primary Service:** admissionService

**Supporting Services:**

- studentService
- courseService
- batchService
- feeService, when approved

### Expected Operations

- List admissions.
- Search and filter.
- Create admission.
- View details.
- Update approved status fields.
- Link admission to student and enrollment records when appropriate.

### Validation

- Required personal information.
- Guardian/contact information.
- Valid course and batch references.
- Valid branch association.
- Approved status transitions.

### Integration Constraint

Admission creation must not independently fabricate student, enrollment and financial records.

Those relationships must follow approved business rules.

## 14.3 Students

**Pages:**

- StudentsPage.jsx
- StudentProfilePage.jsx
- EditStudentPage.jsx

**Primary Service:** studentService

### Expected Operations

- List students.
- Search and filter.
- View student.
- Create student where permitted.
- Update student profile.
- Display related enrollment information.
- Display authorized attendance/fee information.

### Rules

- Student identity must remain consistent across enrollments.
- Branch filters must follow approved record-access rules.
- Sensitive personal information must be restricted.
- Empty states and validation errors are required.

## 14.4 Courses & Batches

**Primary Services:**

- courseService
- batchService

### Operations

- List courses.
- View course details.
- Create/edit approved course details.
- List batches.
- Create/edit batches.
- Display assigned staff.
- Display enrolled students.
- View timetable and capacity.

### Rules

- Use the approved course/batch relationship.
- Prevent invalid branch/course associations.
- Do not invent enrollment capacity rules.
- Handle empty course/batch catalogs.

## 14.5 Faculty & Classes

**Primary Service:** facultyService

### Operations

- List faculty.
- View profiles.
- Display approved teaching assignments.
- Display class schedules.
- View authorized class students.

### Rules

- Avoid duplicating login identities in unrelated teacher records.
- Respect teaching assignments.
- Do not expose other teachers' financial information.
- Keep scheduling behavior consistent with approved academic rules.

## 14.6 Fees

**Primary Service:** feeService

### Operations

- List invoices.
- View student fee ledgers.
- Display installments.
- Record mock payments.
- Display receipt preview.
- Display balances.
- Handle approved adjustments.

### Rules

- Invoice amount and payment amount are different concepts.
- Totals must be calculated consistently.
- Discounts and refunds must follow approved rules.
- Financial amounts must use consistent precision.
- Duplicate payment submissions must be prevented in production.
- Mock workflows must disclose that transactions are simulated.

Final fee and refund policies remain TBD.

## 14.7 Finance

**Primary Service:** financeService

### Operations

- View financial summaries.
- List permitted transactions.
- View expenses.
- Record expenses in mock mode.
- Display period and branch-based totals.

### Rules

- Reuse recorded fee/payment data.
- Do not maintain unrelated duplicated collection totals.
- Respect financial permissions.
- Apply consistent dates and branch filters.

## 14.8 Demo Classes

**Primary Service:** demoService

### Operations

- Register demo request.
- List demo sessions.
- Schedule/reschedule.
- Update authorized status.
- Record attendance where applicable.
- Convert to admission according to approved rules.

### Rules

- Demo registration does not automatically enroll a student.
- Conversion must avoid duplicate applicant/admission records.
- Scheduled teacher and branch references must be valid.

## 14.9 Assets

**Primary Service:** assetService

### Operations

- List assets.
- Filter by branch and status.
- Create and update asset details.
- Show maintenance history.
- Display assigned location and user where appropriate.

### Rules

- Preserve asset identity.
- Record meaningful status transitions.
- Do not invent depreciation policy.

## 14.10 Reports

**Primary Service:** reportService

### Operations

- Select report.
- Set filters.
- Preview data.
- Print/export where approved.

### Rules

- Reports must use authoritative mock records.
- Role and branch access must apply.
- Totals must match the related operational modules.
- Do not invent missing or unavailable metrics.

## 14.11 Branch Management

**Primary Service:** branchService

### Operations

- List branches.
- View branch details.
- Create branch.
- Update branch.
- Activate/deactivate according to approved rules.

### Rules

- Dynamic branch count.
- Properly validate identifiers.
- Preserve historical branch references.
- Only authorized users can perform administration.

## 14.12 User Management

**Primary Service:** userService

### Operations

- List staff users.
- Create mock staff accounts.
- Edit staff profiles.
- Manage branch assignments.
- Assign one or multiple roles per branch.
- Show approved permission summaries.

### Rules

- One identity may have multiple branch assignments.
- Permission rules must be centrally defined.
- Do not store real passwords in frontend mocks.
- Changing assignments must refresh role and branch context.
- Sensitive account actions require production backend authorization.

## 14.13 Settings

**Primary Service:** settingsService

### Operations

- View academy settings.
- Update approved branding fields.
- Update permitted operational settings.
- Display theme preview.
- Persist mock settings.

### Rules

- Academy identity is centrally sourced.
- Brand changes must affect all relevant screens.
- Validate themes and uploaded asset references.
- Restrict sensitive settings to approved roles.

---

# 15. Form Integration Standards

All forms must follow consistent interaction rules.

### Form Lifecycle

1. Initialize values.
2. Load required reference data.
3. Validate user input.
4. Show useful field-level errors.
5. Submit through a domain service.
6. Display loading state.
7. Handle success or failure.
8. Update relevant view state.
9. Prevent accidental duplicate submissions.

### Validation Rules

- Validate required fields.
- Validate field formats.
- Validate cross-field dependencies.
- Display accessible errors.
- Do not clear valid input after a recoverable failure.
- Do not trust frontend validation for production security.

### Backend Integration

The backend must independently validate all protected writes.

Frontend validation improves usability but is not authoritative.

---

# 16. Required UI States

Every applicable screen must support:

### Loading

Show skeletons or a loading indicator while data is being retrieved.

### Empty

Show a clear empty-state message.

Example:

"No students found for the selected branch."

### Success

Display confirmation after successful completion.

### Error

Display useful, safe feedback.

### Validation Error

Identify invalid fields and their correction requirements.

### Unauthorized

Redirect to or display an appropriate permission-denied state.

### Network Unavailable

Distinguish connectivity failures from other errors.

### Disabled

Explain why an action is unavailable where appropriate.

### Unsaved Changes

For forms with significant user input, warn before discarding unsaved changes where approved.

---

# 17. Search, Filtering, Sorting and Pagination

**Status: PROPOSED**

Large datasets should not be rendered as unlimited arrays.

List interfaces should define:

- Searchable fields.
- Supported filters.
- Default sort.
- Page size.
- Pagination behavior.
- Empty results.
- Loading behavior.

### Branch Filter

Branch selection must consistently affect relevant list data.

### Search

Search should handle whitespace, empty queries and rapid repeated input.

Debouncing may be used when appropriate.

### Pagination

Mock and backend list interfaces should follow a consistent result format.

### Sorting

Do not allow arbitrary backend field names without validation.

---

# 18. Navigation and Deep Linking

Use centralized route definitions.

Expected behavior:

- Sidebar navigation opens the correct module.
- Browser Back and Forward work.
- Refreshing an authorized nested route works.
- Invalid URLs show Not Found.
- Unauthorized routes show a controlled access-denied experience.
- Branch context persists or safely resets.
- Navigation does not unexpectedly discard user-entered data.

Do not hardcode route strings throughout unrelated components.

---

# 19. Performance Requirements

**Status: PROPOSED**

Frontend implementation should avoid:

- Unnecessary repeated API requests.
- Entire app re-renders caused by unrelated state.
- Unbounded table rendering.
- Excessive chart recalculations.
- Duplicate data fetching.
- Large eager-loaded module bundles.
- Expensive filtering on every keystroke when unnecessary.

Recommended strategies include:

- Lazy loading approved route-level pages.
- Appropriate memoization based on measured need.
- Pagination.
- Request cancellation.
- Consistent cache invalidation.
- Efficient shared state.

Specific performance targets remain TBD.

Do not add performance libraries without evidence of need.

---

# 20. Accessibility and Responsive Requirements

Follow approved DESIGN.md.

Proposed accessibility target:

WCAG 2.2 Level AA.

Apply:

- Semantic HTML.
- Keyboard navigation.
- Visible focus.
- Accessible labels.
- Appropriate contrast.
- Correct dialog focus management.
- Screen-reader-friendly feedback.
- Meaningful validation messages.

Desktop is the primary proposed usage environment.

Tablet and mobile-browser support must follow confirmed client requirements and approved breakpoints.

---

# 21. Testing Strategy

Testing must be planned for each approved ticket.

## 21.1 Unit Tests

Test:

- Formatters.
- Validation helpers.
- Branch and role helpers.
- Business calculations.
- Mock service logic.

## 21.2 Component Tests

Test:

- Form interactions.
- Tables.
- Filters.
- Loading states.
- Error states.
- Role-aware UI behavior.
- Branch switcher.

## 21.3 Integration Tests

Test interactions between:

- Pages and services.
- Shared state and components.
- Mock data records across modules.
- Navigation and role context.

## 21.4 End-to-End Tests

Critical workflows should include:

- Demo login and branch selection.
- Admission workflow.
- Student enrollment.
- Fee invoice/collection simulation.
- Dashboard/report update.
- Role and branch transitions.

## 21.5 Regression Tests

Previously completed modules must remain functional after later changes.

Test results must be recorded honestly.

A visual page alone does not satisfy feature acceptance criteria.

---

# 22. Integration Migration Strategy

The migration from mock services to the real backend must be incremental.

### Stage 1 — Mock Frontend

- Use centralized demo data.
- Build approved UI features.
- Verify mock service contracts.
- Test branch/role UI behavior.

### Stage 2 — Backend Foundations

- Implement authentication.
- Implement authorization.
- Implement database connection.
- Implement approved API contracts.
- Add backend validation and audit foundations.

### Stage 3 — Module Integration

For each approved module:

1. Review the existing mock contract.
2. Implement corresponding backend endpoints.
3. Replace or configure the HTTP adapter.
4. Verify request/response compatibility.
5. Run module integration tests.
6. Run role and branch authorization tests.
7. Run relevant regression tests.

### Stage 4 — Integrated Application

- Verify all critical cross-module workflows.
- Remove production dependence on localStorage mock records.
- Secure sensitive data operations.
- Validate real reporting calculations.
- Verify data integrity.
- Prepare staging/client review.

### Stage 5 — Production Readiness

- Secure environment configuration.
- Backup and recovery.
- Monitoring and logging.
- Deployment verification.
- Authentication and authorization testing.
- Client acceptance testing.

No module should be declared production-ready while its required backend integration is missing.

---

# 23. Phase-Based Frontend Implementation

The implementation phases are:

| Phase | Module |
|---|---|
| F00 | Shared frontend foundation |
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
| F13 | Settings and integrated frontend QA |

Every phase must be divided into small approved tickets.

### Important Dependency Rule

Early modules may need reference data from later modules.

For example:

- Admissions requires courses and batches.
- Dashboard requires records from multiple modules.
- Fees requires students/enrollments.
- Reports requires records from operational modules.

Provide minimal shared mock contracts before their full UI modules are built.

Do not create disconnected hardcoded records to bypass these dependencies.

---

# 24. Definition of Done

A frontend integration ticket may be marked DONE only when:

1. Approved functionality is implemented.
2. The relevant service contract is followed.
3. Loading, empty, error and success states are handled.
4. Validation is implemented.
5. Role and branch UI rules work in mock mode.
6. Relevant tests pass.
7. Existing completed features remain functional.
8. No unrelated code changes were introduced.
9. Documentation reflects actual progress.
10. Known limitations are recorded.
11. Mock-only behavior is clearly distinguished from production-ready behavior.

If a required test fails, document the failure and do not falsely mark the ticket complete.

---

# 25. AI Coding Agent Instructions

Before modifying frontend code:

1. Read `AGENTS.md`.
2. Read the current approved ticket.
3. Read relevant PRD, DESIGN, SECURITY, ERD, ARCHITECTURE and this specification.
4. Inspect existing implementations.
5. List intended file changes.
6. Check for unresolved requirements.

During implementation:

1. Implement only the approved ticket.
2. Reuse shared components.
3. Use services for data operations.
4. Do not access localStorage directly inside pages.
5. Do not invent API contracts.
6. Do not implement real backend functionality without authorization.
7. Do not modify unrelated modules.
8. Do not overwrite working code unnecessarily.
9. Keep role and branch behavior consistent.
10. Follow accessible UI patterns.

After implementation:

1. Run relevant tests.
2. Run lint/build checks.
3. Report changed files.
4. Record failed checks honestly.
5. Update TASKS.md and PROGRESS.md.
6. Stop and request approval for the next ticket.

---

# 26. Open Questions (TBD)

The following items require approval or technical review:

1. Exact API route and query conventions.
2. Identifier format and frontend DTO naming.
3. Pagination limits.
4. Searchable and sortable fields.
5. Complete role-permission matrix.
6. Final branch context transport mechanism.
7. Login/session implementation.
8. Mock storage version and reset policy.
9. Retry and timeout configuration.
10. Required form validation schemas.
11. Complete admissions workflow.
12. Approved financial calculation rules.
13. Allowed payment methods.
14. Report formats and download mechanisms.
15. Upload and file storage requirements.
16. Supported browsers and minimum viewport widths.
17. Final error-code catalog.
18. Testing framework selection.
19. Production hosting configuration.
20. Performance and operational targets.

Unresolved items must remain TBD.

Do not let AI coding agents silently invent the answers.

---

# 27. Related Documentation

- [Documentation Index](README.md)
- [Product Requirements](PRD.md)
- [System Design](SYSTEM_DESIGN.md)
- [Technical Architecture](ARCHITECTURE.md)
- [Database Design](ERD.md)
- [Visual Design](DESIGN.md)
- [Security Specification](SECURITY.md)
- [Engineering Rules](RULES.md)
- [Feature Tickets](FEATURE_TICKETS.md)
- [Current Tasks](TASKS.md)
- [Project Decisions](MEMORY.md)
- [Progress](PROGRESS.md)

This document owns frontend interaction and integration contracts.

The ERD owns persisted data structure.

The Security Specification owns authorization rules.

The PRD owns product requirements.

The Design document owns visual standards.

When documentation conflicts, stop and request clarification before implementing affected functionality.

---

# 28. Approval and Change Control

The client has approved the general Academy ERP proposal.

Detailed integration contracts remain subject to technical review.

When an approved client change affects frontend or backend integration:

1. Record the requested change.
2. Identify affected requirements.
3. Identify affected pages and components.
4. Identify service and API contract changes.
5. Identify data model impact.
6. Update relevant authoritative documentation.
7. Update impacted feature tickets.
8. Implement only the approved changes.
9. Run integration and regression tests.
10. Update project decision and progress records.

A minor frontend change must not trigger unnecessary application-wide redesign.

---

**Document Status:** DRAFT — Pending Integration Contract Review

**Implementation Authorization:** Documentation review and approved frontend mock tickets only.

This document must not be used to claim that proposed endpoints, storage formats, data structures or backend security controls have already been implemented.
## F02-003 linked admission service boundary (2026-10-10)

NewAdmissionForm -> admissionService.createWithStudent(record, { branchId }) -> mockApi.createAdmission -> mockDatabase.createAdmission -> one localStorage setItem. AdmissionsPage's Radix dialog and NewAdmissionPage reuse the form. Service revalidates live mock identity/active assigned branch immediately before commit, including after asynchronous lock waits.

Result includes internal id, formatted admissionId, admissionNumber, studentId and student. Collection contracts stay async. Native Web Locks serialize cooperating tabs where available; fallback guarantees one JS context only. Key academyERP:mock:data:v1 and envelope version 2 stay separate from auth. Failed normalization/transactions preserve saved bytes and consume no counter number. Test-only failure simulation is not exposed in UI. Future HTTP adapter requires server transactions, authorization and durable numbering.

## F02-003 approved DEMO CRUD extension (2026-10-10)

Latest branch-wise owner scope supersedes historical academy-wide allocation. Page -> AdmissionActions/shared NewAdmissionForm -> admissionService -> mockApi -> mockDatabase -> one localStorage commit. NewAdmissionPage still shares the same form. Pages never read/write persistence directly.

Service contracts: list(query), getById(id, query) with saved linked student, create/createWithStudent(record, query), update(id, record, query), delete(id, query). Every contract validates active canonical mock identity/assigned selected branch, also inside the native lock before commit. Update returns admission + linked student; delete returns id/admissionId/deletedStudentId. All reject explicit mock errors. Immutable internal IDs remain distinct from per-branch admissionNumber/admissionId and studentNumber. Native Web Locks/single-context fallback and future HTTP replacement boundary remain unchanged.

Unknown ownership returns UNVERIFIED_OWNERSHIP; linked non-Provisional records return UNSAFE_LINK; branch lookup failures return NOT_FOUND or INVALID_SCOPE. Corrupt storage, ID conflicts, unsupported versions and failed writes preserve original bytes. Future backend must provide real authorization, transactions, ownership and durable branch sequences.

## F02-003 latest simple legacy deletion rule (2026-10-10)

The owner's latest simple CRUD instruction SUPERSEDES the earlier requirement that both linked records carry createdByAdmissionFlow markers. A uniquely linked same-branch Provisional student may be removed atomically with its admission, including unmarked legacy pairs. Reciprocal links, branch matching, uniqueness and status are validated; ambiguous/broken/Active links are denied without a write. No unrelated records or sequence counters are removed. Existing markers remain optional historical metadata, not a deletion prerequisite. No data-reset/migration framework, production permission, backend or fees/enrollment changes. F02-003 IN_REVIEW; final 176/176 regressions PASS. [Evidence](PROGRESS.md#f02-003-simple-crud-completion---legacy-deletion-correction-2026-10-10).

## F02-003 latest gapless display serial contract (2026-10-10)

Latest owner instruction SUPERSEDES earlier permanent-counter values as visible serials. A response-only projection derives independent Student displaySerial and Admission displaySerial/displayAdmissionId from complete branch insertion order, before search/filter/sort. Linked Student admissionDisplaySerialId reflects the admission's current serial. Create appends; edit retains order; deletion closes gaps; reload retains persisted array order. Projection fields are never stored or used as lookup keys.

Immutable internal id/studentId/student.admissionId foreign keys and historical admissionId/admissionNumber/studentNumber/admissionDisplayId metadata remain untouched, including legacy ADM-* internal IDs. Existing durable counters remain historical allocation metadata, not visible list positions. Admissions View distinguishes current serial from permanent reference; actions continue using internal IDs. Student serials cover all branch students, including legacy/unrelated records. No schema migration, reset, backend, production permission, fees/enrollment or new Student page. Future HTTP responses must preserve deterministic full-branch serial semantics. [Verified evidence](PROGRESS.md#f02-003-gapless-branch-display-numbering-correction-2026-10-10).

## F03-001 limited directory order exception (2026-10-11)

CONFIRMED owner authorization: read-only DEMO Students Directory before F02-004; defer enrollment dependency only for listing. /students and sidebar now display saved branch students, gapless serials and linked Admission references. Missing legacy status is Active presentation only; stored records unchanged by directory reads. Existing workspace.view only; no production permissions. IN_REVIEW, acceptance pending. F02-002/F02-003 acceptance remains pending. Final 198/198 tests (19 files), lint/build and local Edge four-viewport/keyboard/admission-link/refresh/branch/logout checks PASS; actual CI/deployment/backend/formal accessibility NOT_RUN. No dependencies installed. [Full evidence](PROGRESS.md#f03-001-limited-demo-students-directory-2026-10-11). Next F02-004 requires separate approval; all remaining tickets preserved.
## F02-004 approved DEMO course/batch selection (2026-10-12)

CONFIRMED scope: branch-specific mock courses retained; Course required, Batch optional; minimal batch {id, branchId, courseId, name}; same shared popup/standalone form; admission courseId and optional preferredBatchId with legacy course text retained. No automatic name-to-ID mapping. Safe additive version-3 envelope behind existing mock storage key adds minimum batches from saved courses, preserves valid records/links/counters and never reseeds existing valid batches. New/changed selections validate branch/course/batch relations atomically; unchanged legacy/unresolved references may survive unrelated edits and display explicit unresolved labels. Session/branch guards remain DEMO UX safeguards; workspace.view unchanged. No backend, permissions, fees/enrollment/schedules/capacity rules or dependencies added.

IN_REVIEW; acceptance pending. F02-002/F02-003/F03-001 also remain acceptance pending. Baseline 198/198 PASS; final 223/223 tests (21 files; 25 new), lint/build and local Edge shared popup/View/Edit/optional batch/refresh/branch/keyboard/360-768-1024-1440 checks PASS. Existing lint/bundle warnings remain; actual CI/deployment/backend/formal accessibility NOT_RUN. [Full files, libraries, migration limitations and evidence](PROGRESS.md#f02-004-program-and-batch-selection-delivery-2026-10-12). Next F02-005 Admission Status Workflow needs separate owner decisions/approval; no following ticket started.
## F02-005 owner-approved DEMO status decisions (2026-10-12)

CONFIRMED owner approval: Pending -> Approved/Rejected only, explicit confirmation, same-status idempotency, no opposite transitions/reopening; canonical active-branch Owner/Super Admin only (any approved eligible role membership, never dashboard preview authority). Unique reciprocal same-branch linked Provisional student required; legacy unlinked/unsafe records refuse without changes. Student remains Provisional. Optional rejection reason; status plus append-only actor/time history committed atomically. Decided admissions, including existing Approved/Rejected records, are read-only and cannot be physically deleted. These latest rules supersede prior generic Edit/Delete availability for decided DEMO records only; existing comments/history preserved. workspace.view remains sole production-independent demo baseline, no real permission grant/bypass/backend change.

Implemented IN_REVIEW; acceptance pending, as are F02-002/F02-003/F02-004/F03-001. Existing version-3 storage accepts optional embedded statusHistory without reset/backfill; current identity/branch and policy validated at service/database boundaries, stale/conflicting operations fail without writes. Final 248/248 tests (23 files; 25 new), lint/build and local Edge status/keyboard/four-viewport/persistence checks PASS; existing warnings remain. Actual CI/deployment/backend/formal accessibility NOT_RUN. [Exact files/libraries/history contract/evidence](PROGRESS.md#f02-005-admission-status-workflow-delivery-2026-10-12). Next F02-006 Admission-to-Enrollment Mock Integration requires separate scope and owner approval. Stop after F02-005.

## F02-005 final action integration boundary (2026-10-12)

CONFIRMED: active-branch Super Admin has named `admissions.decide` and `admissions.delete` grants in addition to View/Create/Edit. Receptionist retains View/Create/Edit, Owner retains View and Teacher remains denied. The page derives visible actions from canonical Auth/Branch context; `admissionService` repeats the permission and session/branch check; the mock database independently reads the canonical session before status or delete mutation. Dashboard preview state is never consulted.

Status changes retain the existing atomic status/history contract and preserve the linked Provisional Student. Pending Delete retains the verified same-branch reciprocal Provisional-link transaction. Decided records reject Edit/Delete and display View only. The adapter contract remains replaceable, but browser-local checks are DEMO safeguards and must be reimplemented as backend authorization later. Final evidence: 246/246 tests, lint and build PASS with existing warnings; no package or backend change. F02-005 remains IN_REVIEW pending owner acceptance.


## DEMO-REGISTER-CLASSES-20261018 - Saved timetable read integration

DemoRegistrationForm reads classScheduleService.list and facultyService.listAssignments under existing active-branch permission checks while open. A pure demoRegistrationClasses utility narrows records to an active selected batch belonging to the selected course/branch, computes recurring date-only occurrences, includes dated occurrences on/after the preferred date, validates timing and deduplicates equivalent occurrences. Cards use projected actual subject/teacher/room. Focus/storage/minute refresh discards stale results and preserves drafts; page refresh no longer changes the open form's key. Selecting a timing only fills the existing preferred request date/time. Existing demoClassService.register payload, schema and Registered -> Scheduled lifecycle remain unchanged. No direct component persistence or backend changes.


## DEMO-MULTI-CLASS-20261018

DEMO-MULTI-CLASS-20261018: register accepts optional requestedClasses [{key, classDate}]. Adapter resolves each reference against saved classes in the same active branch/course/batch, rejects stale/invalid/duplicate references, and stores canonical timing/subject/teacher/room snapshots. Legacy inquiries lacking this field remain supported. No backend integration or new confirmed-session model.


## DEMO-DIRECT-ATTENDANCE-20261019

Owner explicitly replaces the separate Demo scheduling UI with direct attendance after registration. Removed scheduling menu actions and page dialog/data wiring. Registered, Scheduled, Attended and Missed inquiries can use the existing attendance dialog; converted/cancelled records remain blocked. Attendance is inquiry-level, not per-class tracking. Registration-selected classes now appear inside Scheduled Trial Class Session in Details, with legacy scheduled-session fallback; no fabricated sessions. Attendance modal remounts per candidate to avoid stale outcomes. Expanded status column and compact table badges prevent clipping. PASS:42 targeted service/page/registration tests, full lint0/0, build (existing chunk warning), isolated Edge360/1366/1440 direct attendance and status badge bounds, git diff --check. Full suite NOT_RUN. IN_REVIEW; no owner data edits, no commit/push.


## REPORTS-LEFT-TREND-20261019 - Left analytics card redesign

Uses existing reportService.overview and filtered ledger IDs. Sources: fees linked Verified payments.paidAt; students saved enrollment date; admissions.createdAt; courses dated enrollments in selected batches; faculty saved classes.classDate matching teacher/batch (no invented recurring classes); finance transaction dates; demos.createdAt; assets history.occurredAt and deduplicated maintenanceHistory.date. Raw collections recheck branchId; selected dimensions reject missing/mismatched references; event dates obey window lower bound. Monday weeks/Karachi calendar dates. Custom range inclusive and chart-only. Session boundaries remain unconfigured and explicitly disclosed. No service/schema/backend changes.


## BRANCH-CREATION-PAUSE-20261019

CONFIRMED: New branch creation is temporarily disabled for every role, including Super Admin, until explicit owner reauthorization. All currently saved branches and existing view/edit/lifecycle behavior remain preserved. Central branch policy gates UI and organization service; unknown IDs cannot create records disguised as edit. No user-facing enable toggle. Frontend/mock enforcement only; the eventual backend must independently enforce this rule. No license migration or branch deletion authorized. Verification in PROGRESS.md.


## BRANCH-EDIT-DELETE-20261019

Branches Edit now supports core display metadata through optional organization.branchOverrides; getDemoBranches merges saved display fields while preserving branch IDs. Optional deletedBranchIds persist deletion visibility. Existing organization version/data remain compatible; no reset. Page refreshes auth/branch context after save/delete so names update in header and access selectors. organizationService.deleteBranch calls serialized mockApi.deleteEmptyBranch, whose canonical adapter checks all operational collections/staff before removal. Confirm/cancel/error/busy states provided. Core lifecycle remains protected and Add Branch stays paused. Evidence in PROGRESS.md.


## BRANCH-STATUS-NAME-20261019

Branch Edit now submits only name and service ignores other submitted metadata while preserving saved fields; valid trimmed name1-120 characters and uniqueness required. Core branch name/status overrides merge independently. Status action now supports both core/custom branches and refreshes auth context; busy guard prevents duplicate clicks, errors use an alert instead of a success banner. No core read-only toggle disablement. Existing operation/current-branch safeguards remain; activation checks/persistence reflected after reload. Evidence: PROGRESS.md.


## BRANCH-DELETE-ADMIN-EXCEPTION-20261019

Delete confirmation now explains Super Admin assignment exception and non-admin/record blockers. Adapter removes the deleted branch from organization assignmentOverrides and saved user assignments; auth fixture projection filters deleted-branch assignments for base identities. Parent context refresh remains in place. No user account or linked operational data is deleted. Inactive branch requirement, Add Branch pause and name-only edit preserved. See PROGRESS.md.


## Entry flow update - 2026-10-19

REMOVE-WORKSPACE-FLOW-20261019 supersedes the former Workspace entry flow. Root opens login even with a saved demo session; successful login and branch selection open Dashboard. The baseline permission identifier is dashboard.view (formerly workspace.view); role/branch checks and deny-by-default behavior are preserved. Authentication remains frontend mock authentication. No backend security claim or owner data migration.


## FRONTEND-PERF-20261019 - adapter/route optimization

Protected route components load lazily only after guards; authorized sidebar hover/focus may preload code, not branch data. Global providers remain mounted. Database read snapshots compare current raw database and organization storage plus storage identity and existing read flags; writes clear snapshots. Organization snapshots compare raw storage on every read. Snapshots are bounded, detached and disposable; localStorage remains canonical. Cross-tab writes require no event delivery to invalidate a subsequent read. Services, Web Locks, mutation validation and branch-scoped permission rechecks are unchanged. No schema/version migration added. Reports payment totals index changes algorithmic cost without changing calculation semantics.


## TAB-LOADING-FIX-20261020 - transient page initialization

localPageResources caches at most24 detached completed page data snapshots. peek synchronously checks current raw database/organization/session and Karachi/UTC date; changes clear all snapshots. remember accepts only the same version captured before starting the async read, so an older completion cannot cache data after a write/branch change. Local state receives current scope/request markers; filters/dialog state is not cached. Existing domain services and Web Locks still execute on mount; errors remain visible. Logout clears retained page data explicitly. No storage writes, schema, service interface or backend changes. Cold/invalidated scope still uses genuine loading; lazy chunk fallback now says Loading module rather than Restoring demo session.


### Admissions default subject selection - 2026-10-20
Owner-confirmed: on explicit course selection, all available active course subjects default selected. Users can unselect any subject; other selected courses and saved admission subsets retain their existing choices. Selected IDs feed existing fee calculation and submit flow.


### GLOBAL-TIME-12H-20261020 ? confirmed presentation contract
User-facing clocks use h:mm AM/PM through timeFormat.js; shared time entry converts h:mm + AM/PM to existing HH:mm before handlers save. ISO timestamps and clock/date fields remain unchanged in services/storage. Asia/Karachi applies to timestamp presentation; date-only values stay date-only. No overnight policy or computation changes.


### GLOBAL-TIME-PICKER-20261020 ? confirmed entry contract
Shared TimePicker accepts complete h:mm AM/PM or clock plus meridiem, any valid minute and quarter-hour native suggestions. Emits existing HH:mm, never migrates records. Native popup avoids modal clipping. Invalid clocks return empty canonical value; existing start/end and overnight policies continue in scheduling handlers.


### BATCH-SHIFT-NAMES-20261020 ? confirmed batch contract
Optional batch.shift: null/absent, Morning or Evening. Batch form chooses shift instead of clock fields; existing clock metadata and Faculty schedules remain. Batch names unique per branch+course, case-insensitive after trimming; identical names in different courses are allowed. Admissions displays optional shift while saving/reference resolution continues by immutable batch ID. No legacy-data migration or production Server changes.


### TIME-PICKER-DROPDOWN-POLISH-20261020
Shared TimePicker now uses a compact viewport-bounded HTML Popover suggestions list (ordinary positioned fallback when unsupported), replacing native96-option popup. Canonical HH:mm/event contract and all scheduling rules unchanged. Manual input plus AM/PM and15-minute suggestions retained. Escape dismisses menu without closing parent dialog. IN_REVIEW.


### BATCH-DURATION-20261020
Optional batch.durationMonths is null/absent or positive safe integer. Presentation uses shared formatBatchDuration for singular/plural. No automatic calendar/end-date or financial semantics. Existing IDs/time fields unchanged. IN_REVIEW.


### STAFF-LOGIN-BRANCH-20261020
Browser-local authService.login accepts {email,password}; AuthContext forwards credentials and retains string userId compatibility only for mock fixtures. mockCredentials supplies normalized loginEmail, initial local config checks and salted changed-password records in organization adapter. Created staff login field stores normalized email; assignments limited to one current-branch role, legacy foreign assignments preserved during edits. Users page uses staffOverview, not global organization overview. Organization overview/mutations restrict explicit branch-management assignments. Topbar/profile changePassword verifies current password and replaces initial credentials per immutable user ID. No production backend/API/security claim. IN_REVIEW; proof in PROGRESS.md.


### USERS-ACCESS-ONLY-DELETE-20261020
Users Delete now sets accessRevoked on retained professional identities. Authentication and authorized-branch resolution deny revoked users; staffOverview hides them. getDemoUsers keeps historical identities for Faculty/assignment/record resolution, and Users action never deletes operational database records. Existing role membership is professional mapping only once accessRevoked; no login permission follows from it. IN_REVIEW.


### AUDIT-LOG-20261020
Optional auditLogs metadata arrays in existing mock database and organization envelopes; no domain-record migration or envelope version downgrade. mockAudit.appendAudit derives real successful changes and actor snapshots, preserves previous history, excludes initial/read/no-op events, redacts sensitive values and uses monotonic sequence for identical timestamps. Persistence writes domain + journal together; existing cross-store rollback restores old journal as part of original bytes. auditService.list({branchId}) enforces canonical active Super Admin scope and merges detached branch records. UI /audit-log is lazy, readonly, filtered/paginated and responsive. No fabricated old history. Users access removal and guarded Faculty profile deletion remain separate modes. IN_REVIEW.


## Payroll boundary corrections ? 2026-10-21 (IN_REVIEW)

PAYROLL-FLOW-FIX retains centralized mock payroll persistence. Agreement forms consume teacherId/teacherName metadata; advances submit method. Approved payroll is immutable to recalculation/adjustments; payment references are unique per payroll line. Advances track recovered amounts and reservations across approved periods. Dated lecture sessions must have ended; fee percentage follows assigned-batch enrollment/challan payment links. No backend integration or record migration introduced. See PROGRESS.md for verification.


## Payroll correction contract - 2026-10-21 (REVERTED by owner)

Confirmed owner scope: reopenPeriod({periodId,reason},query) returns unpaid approved payroll to draft; disallows payments or settled advance recovery. addSupplement({periodId,payrollLineId,amount,reason,requestId},query) creates a separate linked bonus line after settlement, idempotent by period/request ID. Active-branch Super Admin only. Original lines/payments unchanged, advance recovery zero for bonus. Existing payment/expense/payslip contracts reused. Browser-local mock only; no Server changes. See PAYROLL-CORRECTIONS in PROGRESS.md for evidence.


## PAYROLL-CORRECTIONS-UNDO - 2026-10-21

Owner explicitly reverses PAYROLL-CORRECTIONS. Removed Reopen Payroll/Additional Bonus UI, modal, service operations, correction-specific audit extensions and three corresponding tests; prior approved payroll lock/payment workflow restored. Existing styling and unrelated edits preserved. No stored financial records or existing audit history deleted or migrated. Previous correction documentation marked REVERTED as historical evidence. PASS targeted ESLint, 33 focused payroll/audit/financial tests and scoped git diff --check. Build/browser NOT_RUN for undo. No commit/push. IN_REVIEW pending owner acceptance.
