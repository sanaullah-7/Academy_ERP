# Academy Management ERP

**A modular, web-based Academy Management System for multiple branches of a single academy organization.**

**Version:** 1.0 — Documentation Baseline
**Status:** Under Development
**Last Updated:** 2026-10-09
**Development Strategy:** Frontend First, Backend Integration Later

---

## 1. Project Overview

Academy Management ERP is a web-based application designed to support the academic, administrative, operational and financial activities of an academy.

The initial release is intended for **one academy organization operating multiple branches**.

The system is being developed using a modular architecture so that individual modules can be implemented, tested, maintained and improved without unnecessarily affecting unrelated features.

The project follows a frontend-first development approach using mock data and centralized services before integrating the production backend.

### Primary Objectives

- Centralize academy operations.
- Manage multiple branches.
- Support branch-specific staff roles.
- Connect student admissions, enrollments and fee records.
- Provide role-aware dashboards.
- Support academic and operational workflows.
- Improve maintainability and development consistency.
- Allow approved client changes without major rewrites.
- Establish secure backend authorization before production use.

This README introduces the project and development workflow.

Detailed requirements are maintained in the [documentation directory](docs/README.md).

---

## 2. Project Scope

### Confirmed Scope

- One academy organization.
- Multiple dynamically managed branches.
- Web application.
- Role-aware access.
- Configurable academy branding.
- Frontend-first development.
- Future real backend and database integration.

### Primary User Roles

1. **Super Admin** — Academy administration and approved branch management.
2. **Owner** — Approved business and operational access.
3. **Receptionist** — Approved front-desk and student-related operations.
4. **Teacher** — Approved teaching and assigned student/class information.

A staff account may have:

- Access to multiple branches.
- Different roles in different branches.
- Multiple permitted roles within the same branch.

Detailed role permissions are defined in [SECURITY.md](docs/SECURITY.md).

Do not assume a role has unrestricted access based solely on its name.

### Excluded From the Initial Release

- Multi-client SaaS infrastructure.
- Subscription and license management.
- Electron desktop application.
- Native Android/iOS applications.
- Unapproved third-party integrations.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Frontend Language | JavaScript / JSX |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Version Control | Git |
| Remote Repository | Private GitHub |
| Coding Tools | Codex and Antigravity |

### Proposed Architecture

The backend follows a modular-monolith design.

The frontend separates route-level pages, reusable UI components, shared application state, domain services and data adapters.

During frontend development, mock adapters supply fictional demo data.

During backend integration, HTTP adapters connect the frontend to authorized Express API endpoints.

Refer to [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 4. Repository Structure

```text
Academy-ERP/
│
├── Client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── mock/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── assets/
│   ├── package.json
│   └── ...
│
├── Server/
│   ├── package.json
│   └── ...
│
├── docs/
│   ├── README.md
│   ├── PRD.md
│   ├── SYSTEM_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── ERD.md
│   ├── DESIGN.md
│   ├── SECURITY.md
│   ├── FRONTEND_INTEGRATION.md
│   ├── RULES.md
│   ├── FEATURE_TICKETS.md
│   ├── TASKS.md
│   ├── MEMORY.md
│   └── PROGRESS.md
│
├── AGENTS.md
├── README.md
├── .gitignore
└── .github/
    └── workflows/
        └── ci.yml
```

This diagram represents the intended or documented project organization.

Some module files may currently be placeholders or comment-only stubs.

The actual repository state must be inspected before claiming that every planned component is implemented.

**Important:** Preserve the exact directory names `Client/` and `Server/`.

---

## 5. Prerequisites

Before running the project locally, install:

- Node.js.
- npm.
- Git.
- A code editor such as VS Code.

MongoDB is required for backend database functionality.

### Node.js Version

The existing CI configuration was previously reported as using Node.js 22.

**Runtime policy: TBD.**

Until the runtime policy is finalized, review the actual CI workflow, package requirements and installed Node.js version for compatibility.

Check installed versions:

```bash
node --version
npm --version
git --version
```

---

## 6. First-Time Installation

The frontend and backend have separate dependencies.

Install them independently.

### Install Frontend Dependencies

From the repository root:

```bash
cd Client
npm ci
```

### Install Backend Dependencies

Return to the repository root and enter Server:

```bash
cd ../Server
npm ci
```

### Important

`npm ci` requires an existing compatible lockfile.

If dependency installation fails, inspect package.json, the lockfile and the actual error.

Do not delete or regenerate lockfiles blindly.

Do not install additional libraries without an approved implementation requirement.

---

## 7. Running the Frontend

From the repository root:

```bash
cd Client
npm run dev
```

The Vite development server will print its local URL in the terminal.

Open the displayed URL in a browser.

Do not assume a particular port unless confirmed by the current Vite configuration.

### Frontend Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the frontend development server |
| `npm run lint` | Run configured frontend lint checks |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the built frontend |

Run these commands inside the `Client/` directory.

The commands are documented from the existing project draft; their latest execution results must be verified in the repository.

---

## 8. Running the Backend

From the repository root:

```bash
cd Server
npm start
```

The current project draft reports a backend startup/database-connection skeleton.

This does not establish that the complete ERP backend exists.

### Syntax Check

The current draft documents:

```bash
node --check server.js
```

Run this command only if `Server/server.js` is the current entry file.

If the repository uses a different entry file, inspect package.json and the actual files before updating the documented command.

### Backend Dependencies

Backend startup may require MongoDB connectivity and environment configuration.

Do not publish database connection strings.

Do not claim backend API functionality is complete merely because the server starts.

---

## 9. Environment Configuration

The project may require environment variables for local development and future deployment.

### Backend Configuration

The existing draft identifies:

`MONGODB_URI`

as a required MongoDB connection setting.

Other backend variables must be confirmed from the actual application code and configuration.

### Frontend Configuration

The proposed frontend adapter configuration may include:

```env
VITE_DATA_MODE=mock
VITE_API_BASE_URL=/api/v1
```

These variable names are PROPOSED and must be approved before being treated as required.

### Security Rules

- Never commit real `.env` files containing secrets.
- Do not place database credentials in frontend environment variables.
- Do not place passwords or private keys in source files.
- Use sanitized `.env.example` files for required setting names.
- Do not commit production database dumps.
- Do not expose client student information in mock data.

### Important Vite Limitation

Variables prefixed with `VITE_` may be exposed to the browser.

Never use them for confidential server credentials.

---

## 10. Frontend-First Development

The initial development stage focuses on the React frontend.

### Frontend Mock Mode

Approved features may use:

- Fictional student records.
- Demo staff accounts.
- Mock branch assignments.
- Mock admissions.
- Mock courses and batches.
- Mock fee and invoice records.
- Centralized browser demo storage.

### Data Access Pattern

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
Central Demo Storage
```

### Future Backend Integration

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
Authorization + Business Services
    |
    v
MongoDB
```

The frontend must not connect directly to MongoDB.

Do not scatter localStorage operations across page components.

Mock authentication is not secure production authentication.

Detailed contracts belong in [FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md).

---

## 11. Development Phases

The frontend is divided into controlled development phases.

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
| F13 | Settings & Integrated Frontend QA |

### Implementation Rules

- Each phase contains small feature tickets.
- Work on one approved ticket at a time.
- Preserve existing working code.
- Do not implement unrelated modules.
- Complete required verification before progressing.
- Update project progress honestly.
- Do not automatically begin the next phase.

Detailed implementation plans belong in [FEATURE_TICKETS.md](docs/FEATURE_TICKETS.md).

---

## 12. AI-Assisted Development

This project uses Codex and Antigravity for development assistance.

Both tools must follow:

- [AGENTS.md](AGENTS.md).
- [RULES.md](docs/RULES.md).
- The active approved ticket.
- Relevant authoritative specifications.

### Before Coding

1. Read agent instructions.
2. Read the approved task.
3. Inspect the current repository.
4. Identify dependencies and blockers.
5. List planned file changes.

### During Coding

1. Work only on approved scope.
2. Reuse existing components.
3. Follow approved architecture.
4. Avoid unnecessary dependencies.
5. Preserve working functionality.
6. Do not invent unresolved business rules.

### After Coding

1. Run relevant checks.
2. Report actual results.
3. Record changed files.
4. Update TASKS.md.
5. Update PROGRESS.md.
6. Stop before the next unapproved ticket.

Reading this README does not independently authorize coding.

---

## 13. Testing and Quality Assurance

The project must use appropriate testing for each approved implementation ticket.

### Testing Categories

- Lint checks.
- Build checks.
- Unit tests.
- React component tests.
- Mock service tests.
- API integration tests.
- Role and branch authorization tests.
- End-to-end workflow tests.
- Regression tests.
- Manual client acceptance tests.

### Current Testing Limitations

The previous repository report indicated:

- Frontend lint and build scripts were present.
- Frontend did not have a test script configured.
- Backend test script was a failing placeholder.
- Existing CI built the frontend and checked backend syntax.

These are historical observations, not fresh verification of the current repository.

An actual test framework and meaningful test scripts must be reviewed and approved before claiming automated feature coverage.

### Commands

Frontend:

```bash
cd Client
npm run lint
npm run build
```

Backend syntax, if the documented entry file exists:

```bash
cd Server
node --check server.js
```

Do not claim these checks passed without executing them.

A successful build does not prove that the ERP workflows or permissions are correct.

---

## 14. CI and Git Workflow

The project is intended to use a private GitHub repository.

The previously reported CI path is:

`.github/workflows/ci.yml`

### Intended CI Responsibilities

- Install dependencies from lockfiles.
- Check frontend build.
- Run applicable lint checks.
- Check backend syntax.
- Run relevant tests after test infrastructure is configured.

The actual CI commands must be verified from the current workflow file.

### Git Safety

- Preserve unrelated changes.
- Avoid destructive Git commands.
- Do not force-push without authorization.
- Do not overwrite working code unnecessarily.
- Keep commits focused.
- Do not commit credentials.
- Track documentation in Git.

---

## 15. Security Overview

Production security must include:

- Individual user authentication.
- Backend-enforced permissions.
- Branch-level access control.
- Record-level restrictions.
- Appropriate input validation.
- Sensitive financial operation controls.
- Secure session handling.
- Suitable audit logging.
- Protection of private student and staff records.

Frontend route guards provide user-interface restrictions only.

Detailed requirements are maintained in [SECURITY.md](docs/SECURITY.md).

---

## 16. Client Design Reference

The project uses the existing Lovable prototype as its primary visual reference:

https://sunbeam-styler.lovable.app/

The client has accepted the general system direction according to the project owner's report.

Frontend implementation must follow the approved visual design rather than introducing an unrelated theme.

Exact colors, font choices, layout dimensions and detailed interactions require verification against approved screenshots or source files.

See [DESIGN.md](docs/DESIGN.md).

---

## 17. Documentation Index

All central project specifications are stored under the root `docs/` directory.

| Document | Purpose |
|---|---|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) | System workflows |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture |
| [docs/ERD.md](docs/ERD.md) | Database design |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual and UX standards |
| [docs/SECURITY.md](docs/SECURITY.md) | Security and permissions |
| [docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md) | Frontend/service/API contracts |
| [docs/RULES.md](docs/RULES.md) | Engineering rules |
| [docs/FEATURE_TICKETS.md](docs/FEATURE_TICKETS.md) | Implementation tickets |
| [docs/TASKS.md](docs/TASKS.md) | Active work |
| [docs/MEMORY.md](docs/MEMORY.md) | Decision history |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Verified progress |

Do not duplicate conflicting central specifications in the application folders.

---

## 18. Documentation Approval and Change Control

Documentation must distinguish:

- CONFIRMED requirements.
- PROPOSED decisions.
- TBD questions.
- DEFERRED features.

### When the Client Requests a Change

1. Record the requested change.
2. Identify the affected PRD requirement.
3. Assess impacted workflows.
4. Check permissions and data contracts.
5. Update the authoritative document after approval.
6. Update affected tickets.
7. Implement only the approved change.
8. Run relevant regression tests.
9. Update MEMORY.md and PROGRESS.md.

The presence of a requirement in a draft does not authorize implementation.

---

## 19. Current Project Status

**As of the supplied documentation context dated 2026-10-09:**

- General project direction has been accepted by the client, as reported by the project owner.
- Documentation is being expanded and reviewed.
- The frontend-first approach has been established.
- The application is not independently verified as production-ready.
- Detailed business rules and security permissions remain partly unresolved.
- A fresh repository audit is required before implementing F00.

Refer to [PROGRESS.md](docs/PROGRESS.md) for verified status.

Do not use this introductory README as a substitute for implementation evidence.

---

## 20. Quick Start for a New Developer

1. Read this README.
2. Read [AGENTS.md](AGENTS.md).
3. Read [docs/README.md](docs/README.md).
4. Review [RULES.md](docs/RULES.md).
5. Read the active approved task in [TASKS.md](docs/TASKS.md).
6. Read the corresponding ticket in [FEATURE_TICKETS.md](docs/FEATURE_TICKETS.md).
7. Review the relevant specifications.
8. Inspect the existing project and Git status.
9. Install dependencies if required and approved.
10. Implement only the authorized ticket.
11. Run applicable checks.
12. Document actual results.
13. Stop for review.

---

## 21. Current Open Questions

The following items remain under review:

- Detailed permission matrix.
- Academic and admission rules.
- Fee structures and financial approvals.
- Exact dashboard widgets.
- Final branding tokens.
- Testing framework selection.
- Node.js runtime policy.
- Production session architecture.
- Hosting and domain configuration.
- Expected data volumes.
- Backup and recovery targets.
- First-release acceptance criteria.

Unresolved decisions must not be silently invented.

---

## 22. Project Development Principle

**Build the smallest correct and approved feature, verify it, preserve completed functionality and then proceed to the next ticket.**

The objective is not maximum code generation.

The objective is a reliable, secure, maintainable, scalable and testable academy management application.

---

**Project Status:** Under Development
**Documentation Status:** Under Review
**Implementation Authorization:** Controlled through approved feature tickets, not this README.