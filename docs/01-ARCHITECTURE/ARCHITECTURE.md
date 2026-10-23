<!-- Technical Architecture — React, Node, MongoDB, folder structure, state management aur API patterns kaise kaam karenge -->



# Academy Management ERP — Technical Architecture

**Version:** 1.0
**Status:** DRAFT — Pending Technical Review
**Last Updated:** 2026-10-09
**Architecture Style:** Modular Monolith
**Development Strategy:** Frontend First

---

## CURRENT EFFECTIVE REQUIREMENTS — 2026-10-23

The approved direction remains a Node.js + Express + MongoDB/Mongoose modular monolith. `Server/src/modules/` is organized by auth, organizations, branches, users, dashboard, admissions, students, academics, faculty, classes, fees, finance, payroll, demos, assets, reports, audit, settings and notifications. Routes/controllers handle HTTP, services own workflows, repositories own persistence, models define records, validation rejects input and policies enforce module rules.

Cross-cutting middleware must authenticate, authorize, enforce organization/branch/record scope, validate requests, rate-limit, protect cookie mutations, support idempotency and map safe errors. Mongo transactions replace browser-local serialized writes. Redis, realtime and background jobs are reserved optional components, not required implementation. The system supports five roles: Super Admin, Admin, Receptionist, Owner and Teacher; Platform Admin/SaaS remains deferred.

The frontend stays behind `Page → service → adapter`; HTTP adapters will replace mock adapters incrementally without rewriting approved UI workflows.

---

## 1. Purpose

This document defines the proposed technical architecture of the Academy Management ERP.

Its purpose is to ensure that Codex, Antigravity and future developers implement the application using consistent architectural patterns, coding standards, integration contracts and engineering practices.

The architecture must support:

- Scalability
- Reliability
- Stability
- Maintainability
- Testability
- Flexibility
- Security
- Performance
- Extensibility
- Accessibility
- Observability

These are engineering goals that must be validated through implementation and testing.

## 2. Project Scope

### Confirmed

The initial release is a web-based ERP for one academy organization with multiple branches.

The application supports five primary roles:

1. Super Admin
2. Admin
3. Owner
4. Receptionist
5. Teacher

Users may have multiple branch assignments and different or multiple roles within each assigned branch.

### Current Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Version Control | Git + private GitHub repository |
| Development Tools | Codex and Antigravity |

### Deferred

- Multi-client SaaS architecture
- Subscription and license management
- Electron desktop application
- Dedicated native mobile applications

## 3. Architecture Principles

The application must follow these principles:

**Separation of Concerns:** UI, business logic, authorization and data persistence must remain separate.

**Modular Design:** Every ERP module must have clearly defined responsibilities.

**Single Source of Truth:** Shared data and business rules must not be duplicated across unrelated modules.

**Consistent Contracts:** Frontend and backend must use agreed request, response and error formats.

**Secure by Design:** Backend authorization is mandatory for protected operations.

**Incremental Development:** Implement one approved feature ticket at a time.

**Backward Compatibility:** Approved changes should avoid breaking existing interfaces unnecessarily.

**Avoid Premature Complexity:** Do not introduce microservices, excessive abstractions or unnecessary dependencies.

## 4. High-Level System Architecture

```text
                      USERS
                        |
                   Web Browser
                        |
                        v
               React + Vite Client
                        |
              Frontend Service Layer
                        |
                        v
                 REST API / HTTPS
                        |
                        v
                 Express Backend
                        |
              Authentication Layer
                        |
              Authorization Layer
                        |
                Business Services
                        |
                Data Access Layer
                        |
                        v
                 MongoDB Database
```

The browser must never connect directly to MongoDB.

All production data operations must pass through the authorized backend API.

## 5. Frontend Architecture

### 5.1 Directory Structure

The existing capitalized `Client/` directory is the frontend project root.

```text
Client/src/
├── pages/
├── components/
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

### 5.2 Pages

Each ERP module has a dedicated folder in `pages/`.

Examples:

- Dashboard
- Admissions
- Students
- CoursesBatches
- FacultyClasses
- Fees
- Finance
- DemoClasses
- Assets
- Reports
- Settings
- BranchManagement
- UserManagement

A page represents a route-level screen.

### 5.3 Components

Each module must have corresponding page-specific components inside `components/`.

Example:

```text
pages/Students/StudentsPage.jsx

components/Students/
├── StudentsTable.jsx
├── StudentFilters.jsx
├── StudentSearch.jsx
└── StudentSummaryCards.jsx
```

Reusable application components belong in `components/Shared/` or the existing UI component library.

Avoid duplicating tables, buttons, dialogs and other common interface patterns.

### 5.4 Layouts

Layouts manage application-level structure:

- Dashboard layout
- Authentication layout
- Print layout

Shared layout components include the Sidebar, Header, BranchSwitcher and UserMenu.

### 5.5 State Management

Confirmed shared state requirements:

- Authenticated user context
- Active branch context
- Academy branding and settings
- Theme state

**Proposed approach:**

Use React Context for relatively low-frequency shared application state.

Use component-level state for local forms, selections and dialogs.

Use a consistent data-fetching/cache layer when integrating backend data. TanStack Query is a candidate, subject to project inspection and approval.

Avoid introducing multiple competing state-management libraries without justification.

## 6. Frontend Data Service Architecture

Frontend pages must not directly depend on localStorage or fetch endpoints scattered across components.

Use a service abstraction:

```text
React Page
    |
    v
React Hook / Page State
    |
    v
Domain Service
    |
    +-- Mock Adapter
    |      |
    |      v
    |  Demo Storage
    |
    +-- HTTP Adapter
           |
           v
       Express API
```

### Development Mode

Use mock data and browser storage for frontend development.

All mock records must follow agreed data contracts.

### Production Mode

Replace mock adapters with HTTP adapters.

Do not use localStorage as the authoritative storage mechanism for real multi-user academy data.

Do not store production passwords, session secrets or sensitive student records in mock storage.

## 7. Authentication and Authorization

Authentication identifies the user.

Authorization determines which actions and records that user may access.

### Confirmed Requirements

- Five primary roles: Super Admin, Admin, Receptionist, Owner and Teacher
- Multiple branches
- Branch-specific role assignments
- Same-branch multi-role combinations currently fail closed; final combination policy is TBD
- Authorized All Branches view for Super Admin

### Required Production Controls

- Secure password hashing
- Protected login/session management
- Server-side role validation
- Server-side branch validation
- Record-level authorization
- Administrative action auditing
- Secure error responses

**Proposed:** Secure HttpOnly cookie-based session authentication, subject to deployment and security review.

Frontend route guards are for user experience only and must never replace backend authorization.

The detailed permission matrix belongs in `SECURITY.md`.

## 8. Backend Architecture

The initial backend must follow a modular monolith architecture.

The existing `Server/` project must be preserved and incrementally refactored when backend development is authorized.

### Proposed Structure

```text
Server/src/
├── app.js
├── server.js
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── branches/
│   ├── admissions/
│   ├── students/
│   ├── courses/
│   ├── batches/
│   ├── enrollments/
│   ├── faculty/
│   ├── classes/
│   ├── fees/
│   ├── finance/
│   ├── demoClasses/
│   ├── assets/
│   ├── reports/
│   ├── settings/
│   └── audit/
├── shared/
└── tests/
```

### Module Responsibilities

Each module may contain:

- Routes
- Controllers
- Services
- Repositories
- Mongoose models
- Request validation
- Tests

Controllers must remain relatively thin.

Business rules must be implemented in services.

Data access logic should remain separate from HTTP request handling.

Avoid creating unnecessary layers for trivial functionality.

## 9. Database Architecture

MongoDB is the primary operational database.

Mongoose is used for schema definitions and data access.

### Proposed Core Collections

- academies
- branches
- users
- userBranchRoles
- students
- admissions
- courses
- subjects
- batches
- enrollments
- classes
- attendance
- feePlans
- invoices
- payments
- expenses
- demoClasses
- assets
- auditLogs

The final collection names, fields, relationships, indexes and constraints must be approved in `ERD.md`.

### Data Integrity

- Use stable identifiers.
- Index frequently queried branch and relationship fields.
- Define appropriate unique constraints.
- Validate data on the backend.
- Use database transactions when multiple related writes require atomicity.
- Prevent silent modification of historical financial records.
- Establish appropriate backup and restore procedures.

## 10. API Architecture

**Proposed API style:** REST over HTTPS.

**Proposed base path:**

`/api/v1`

### Proposed API Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Proposed API Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid."
  }
}
```

API design must follow these rules:

- Consistent endpoint naming
- Predictable HTTP status codes
- Explicit request validation
- Server-side authorization
- Pagination for large collections
- Filtering and sorting
- Appropriate duplicate-request protection for financial operations
- No leakage of stack traces or secrets
- Consistent error handling

The detailed endpoint contracts must be defined in `FRONTEND_INTEGRATION.md` before backend implementation.

## 11. Error Handling and Logging

### Frontend

Display meaningful:

- Loading states
- Empty states
- Validation errors
- Network failures
- Permission-denied screens
- Success feedback

### Backend

Use centralized error handling and structured logging.

Logs must not contain passwords, access tokens, private secrets or unnecessary sensitive student information.

Critical administrative and financial changes should have suitable audit records.

## 12. Performance and Scalability

The application must support increasing student, staff, branch and transaction records.

Recommended practices include:

- Database indexing
- Server-side pagination
- Efficient filtering
- Lazy loading where appropriate
- Route-based frontend code splitting
- Avoiding unnecessary React re-renders
- Efficient dashboard queries
- Appropriate caching where safe

Specific performance targets remain TBD until expected data volumes and usage are confirmed.

Do not introduce distributed systems solely for hypothetical future scaling.

## 13. Environments and Deployment

### Local Development

React development server, backend development server and mock/disposable data.

### Staging

Private hosted environment for client review using controlled test data.

### Production

Final client environment with persistent database, secure accounts, monitoring and backups.

### Proposed Hosting

- Frontend: Vercel
- Backend: Render or an equivalent managed Node.js host
- Database: MongoDB Atlas
- File uploads: Managed object storage, if required

Hosting choices remain subject to approval.

The seven-day client review is a testing period, not a requirement to implement subscription or license expiry.

## 14. CI/CD and Quality Assurance

The project should maintain automatic checks for frontend and backend development.

Required quality practices:

- Linting
- Production build verification
- Unit tests for business logic
- Frontend component tests
- Backend integration tests
- Role and branch authorization tests
- Critical end-to-end workflow tests
- Regression testing
- Manual client acceptance testing

CI passing alone does not mean an ERP feature is complete.

## 15. Engineering Quality Gates

A feature can be marked complete only when:

1. The approved ticket requirements are implemented.
2. Relevant functionality works.
3. Validation and error states are handled.
4. Applicable authorization rules are respected.
5. Tests pass or failures are explicitly reported.
6. Existing functionality has been checked for regressions.
7. No unrelated files were modified unnecessarily.
8. Documentation is updated.
9. Remaining limitations are disclosed.

## 16. Development Phases

The approved frontend-first strategy uses the following proposed phases:

- F00 — Frontend Foundation
- F01 — Dashboard
- F02 — Admissions
- F03 — Students
- F04 — Courses and Batches
- F05 — Faculty and Classes
- F06 — Fees
- F07 — Finance
- F08 — Demo Classes
- F09 — Assets
- F10 — Reports
- F11 — Branch Management
- F12 — User Management
- F13 — Settings and Integrated Frontend QA

Each phase must be divided into smaller, testable feature tickets.

A future backend implementation plan must be created before real API development starts.

## 17. Architecture Governance

Before implementation, AI coding agents must:

1. Read `AGENTS.md`.
2. Read the relevant approved documentation.
3. Inspect existing source code.
4. Identify the active approved feature ticket.
5. Explain intended changes.
6. Report conflicting or unresolved requirements.

After implementation, agents must:

1. Run relevant tests.
2. Report changed files.
3. Document incomplete work.
4. Update `TASKS.md`.
5. Update `PROGRESS.md`.
6. Stop before starting another unapproved ticket.

## 18. Proposed Decisions Awaiting Approval

- React Context for shared low-frequency application state.
- A consistent server-state caching strategy for real API data.
- Modular monolith backend organization.
- REST API conventions and versioned routes.
- Secure cookie-based session authentication.
- Specific production hosting providers.
- Centralized structured logging and monitoring.

## 19. Open Questions (TBD)

- Exact production hosting and domain configuration.
- Session lifetime and password recovery requirements.
- Number of branches and expected concurrent users.
- Expected student and transaction volumes.
- Final fee, discount, refund and receipt rules.
- File upload and document retention requirements.
- Final reporting and export requirements.
- Backup frequency, recovery targets and operational responsibility.
- Performance targets and deployment budget.

## 20. Related Documents

- [Documentation Index](../00-CORE/README.md)
- [Product Requirements](../00-CORE/PRD.md)
- [System Design](../00-CORE/SYSTEM_DESIGN.md)
- [Database ERD](ERD.md)
- [Design System](../04-FRONTEND/DESIGN.md)
- [Security Specification](../SECURITY.md)
- [Frontend Integration](../04-FRONTEND/FRONTEND_INTEGRATION.md)
- [Engineering Rules](../00-CORE/RULES.md)
- [Feature Tickets](../00-CORE/FEATURE_TICKETS.md)
- [Current Tasks](../00-CORE/TASKS.md)
- [Project Decisions](../00-CORE/MEMORY.md)
- [Progress](../00-CORE/PROGRESS.md)

---

**Document Status:** DRAFT — Pending Technical Review

This document provides the proposed engineering architecture. It does not authorize implementation of unapproved requirements or override client-confirmed product decisions.
