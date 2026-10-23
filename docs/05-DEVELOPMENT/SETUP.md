# SETUP

<!-- > Purpose: Explains local development setup, prerequisites and application startup procedures. -->


# TSA Academy ERP — Local Development & Project Setup Guide

**Document:** SETUP.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Setup Guide; Commands Require Repository Verification
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Repository Directories:** `Client/` and `Server/`
**Primary Environment:** Windows Development; Other Platforms Supported Where Compatible

---

## 1. Purpose

This document defines the local development setup and startup procedures for TSA Academy ERP.

It guides developers through preparing the project, understanding its structure, configuring frontend and backend environments, connecting MongoDB, running available scripts, testing changes and troubleshooting common issues.

The objectives are to:

- Maintain a consistent development environment.
- Preserve the completed frontend's existing functionality.
- Prepare the backend for incremental implementation.
- Protect environment secrets and local data.
- Ensure safe MongoDB usage.
- Support the frontend mock-to-HTTP integration.
- Prevent unnecessary installation and configuration changes.
- Provide repeatable troubleshooting and verification steps.

**Important:** This guide documents setup procedures. It does not authorize running destructive commands, resetting databases, modifying application code, committing changes or deploying services.

---

## 2. Project Overview

TSA Academy ERP is an academy management system intended initially for one organization operating multiple authorized branches.

The current frontend is implemented with React and Vite.

The intended backend technology is Node.js, Express.js, MongoDB and Mongoose.

### Current Frontend Features

The frontend contains 16 principal modules:

1. Dashboard.
2. Admissions.
3. Students.
4. Courses & Batches.
5. Faculty & Classes.
6. Fees.
7. Finance Overview.
8. Expenses.
9. Teacher Payroll.
10. Demo Classes.
11. Assets.
12. Reports & Ledgers.
13. Audit Log.
14. Branches.
15. Users.
16. Settings.

Shared capabilities include:

- Authentication.
- Branch selection.
- Role-specific navigation.
- Academy theme and branding.
- Teacher My Profile.
- Notifications.
- Approved printing and exports.

### Current Application Roles

- Super Admin.
- Admin.
- Receptionist.
- Owner.
- Teacher.

These are frontend product roles, not operating-system roles.

---

## 3. Approved Product Constraints

Local setup and development must respect the project's current business boundaries.

### Receptionist

Full access to existing approved:

- Admissions.
- Fees.

No independent Finance, Expenses, Teacher Payroll, Audit Log, Branches, Users or Settings access.

### Teacher

Teacher may access their own:

- Profile.
- Timetable.
- Teaching assignments.
- Salary agreement and running balance.
- Verified salary payment history.
- Payslips.
- Personal notifications.

Teacher cannot access another Teacher's compensation.

### Teacher Payroll

Payroll is based on an assignment/batch/subject-specific running balance.

**Do not generate salary automatically at the start of each month.**

### Branches

- One staff user may have different roles in different branches.
- Unsupported same-branch multi-role combinations fail closed.
- New branch creation is currently paused for all roles.
- Organization, branch and record ownership must be enforced by the future backend.

### Assets

The Assets module manages physical academy inventory.

Digital media uploads and Cloudinary are not included in the current scope.

---

## 4. Prerequisites

Before starting development, verify the following tools.

| Tool | Purpose | Requirement |
|---|---|---|
| Git | Version control | Installed |
| Node.js | Frontend tooling and backend runtime | Repository-compatible supported version |
| Package manager | Dependency installation | Match repository lockfile |
| VS Code or another editor | Source and documentation editing | Recommended |
| MongoDB | Backend development persistence | Local or approved remote development database |
| Browser | Frontend verification | Modern supported browser |
| Terminal | Running project commands | PowerShell, CMD or compatible terminal |

### Important

Do not automatically install or upgrade tools when existing compatible versions are already available.

Check the project's actual package requirements before selecting a Node.js version.

---

## 5. Verify Tool Installation

On Windows, open PowerShell or the VS Code terminal.

### Check Git

```powershell
git --version
```

### Check Node.js

```powershell
node --version
```

### Check npm

```powershell
npm --version
```

These commands only inspect installed tools.

If the repository uses another package manager, follow its existing lockfile and scripts.

### Package Manager Selection

Inspect the repository for:

- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `bun.lockb` or equivalent

Use the selected package manager consistently.

Do not create unnecessary competing lockfiles.

---

## 6. Open the Project

The project has previously been used from this Windows workspace:

```text
C:\Users\Admin\Desktop\CLIENTS\Academy
```

Treat this as a previously supplied local path, not a universally required installation path.

### PowerShell

```powershell
cd "C:\Users\Admin\Desktop\CLIENTS\Academy"
```

### Open in VS Code

```powershell
code .
```

If the workspace has moved, use its actual current location.

---

## 7. Repository Structure

The exact source tree must be verified before implementing changes.

The established high-level structure is:

```text
Academy/
├── Client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── Server/
│   ├── package.json
│   └── ...
├── docs/
│   ├── 00-CORE/
│   ├── 01-ARCHITECTURE/
│   ├── 02-DATABASE-AND-API/
│   ├── 03-SECURITY/
│   ├── 04-FRONTEND/
│   ├── 05-DEVELOPMENT/
│   ├── 06-OPERATIONS/
│   └── 07-INTEGRATIONS-AND-QA/
├── AGENTS.md
└── ...
```

**Important:** Preserve the exact capitalized directory names `Client/` and `Server/`.

Do not rename or restructure existing folders simply to match an example.

---

## 8. Initial Repository Inspection

Before installing packages or editing code, inspect project status.

### Check Git Status

```powershell
git status
```

### Check Current Branch

```powershell
git branch --show-current
```

### Inspect Root Files

```powershell
Get-ChildItem
```

### Inspect Frontend

```powershell
Get-ChildItem Client
```

### Inspect Backend

```powershell
Get-ChildItem Server
```

### Check Package Scripts

```powershell
node -p "require('./Client/package.json').scripts"
```

For the backend, if its package file exists:

```powershell
node -p "require('./Server/package.json').scripts"
```

These commands are for inspection. Do not assume all scripts mentioned in generic setup guides exist in the current project.

---

## 9. Frontend Dependency Installation

The React/Vite frontend resides in `Client/`.

### Navigate to Frontend

```powershell
cd Client
```

### Install Dependencies

If the repository uses npm and has a compatible `package-lock.json`, the recommended reproducible install command is:

```powershell
npm ci
```

If no npm lockfile exists, review the repository's package management policy before using:

```powershell
npm install
```

Do not automatically rewrite dependency versions.

### Important

Dependency installation may modify local installed files. Run it only when actual setup is intended and authorized.

---

## 10. Frontend Development Server

Check the actual `Client/package.json` scripts before starting.

If the Vite development script is named `dev`, run:

```powershell
npm run dev
```

### Expected Behavior

The terminal should display the configured frontend local URL.

A common Vite default is:

```text
http://localhost:5173
```

The actual URL and port must be taken from the running terminal output.

### Verification

Open the frontend URL in a browser.

Confirm:

- Application renders.
- Login/demo access works as expected.
- Role-specific navigation loads.
- Branch selection works.
- Existing modules render without critical errors.

A frontend-only mock demo does not require a production Express API to exist.

---

## 11. Backend Dependency Installation

The backend belongs in `Server/`.

Before installation, verify whether the backend package and its required scripts already exist.

### Navigate to Backend

From the repository root:

```powershell
cd Server
```

If the backend uses npm with a valid lockfile:

```powershell
npm ci
```

If the backend is not yet fully initialized, do not create package manifests or dependencies without an approved backend foundation ticket.

### Important

An existing backend setup may already include a working Express server and MongoDB connection.

Inspect and preserve the actual implementation.

Do not replace existing working code with a generic starter template.

---

## 12. Backend Development Server

Check `Server/package.json` for the available scripts.

If it contains a `dev` script, the command may be:

```powershell
npm run dev
```

If it contains only a `start` script, use that script according to the environment.

### Local Port

The backend has previously used port `5000` during development.

A proposed local API address is:

```text
http://localhost:5000
```

Do not assume this port is currently available or hardcoded.

The server should honor its actual configuration.

### Verification

Use the health endpoint only if one is implemented.

A proposed future endpoint is:

```http
GET /health
```

Do not claim that this endpoint exists until verified in current backend code.

---

## 13. MongoDB Local Setup

The future authoritative database uses MongoDB with Mongoose.

Local development may use:

- An installed local MongoDB service.
- An approved Docker-based MongoDB environment.
- A dedicated remote MongoDB development cluster.

The actual setup method should match the developer's available tools.

### Proposed Local Connection

```text
mongodb://127.0.0.1:27017/tsa_academy_dev
```

This is an example, not a confirmed current database name.

### Requirements

- Use development-only data.
- Ensure MongoDB is running.
- Use approved authentication where applicable.
- Protect connection credentials.
- Verify correct database selection.
- Do not use the production database for experimentation.
- Do not automatically clear collections during startup.

### Transaction Support

MongoDB multi-document transactions require a transaction-capable deployment such as a replica set or sharded cluster.

A standalone local MongoDB process may be sufficient for some early development operations but is not evidence that multi-document transaction workflows will work.

---

## 14. Frontend Environment Configuration

The frontend may use environment variables to select its backend API.

### Proposed Example

`Client/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_ENV=development
```

### Important

These variable names are proposed until the actual HTTP adapter is implemented and verified.

Do not create variables that the application never reads.

### Vite Security Rule

Variables with the `VITE_` prefix may be exposed in the browser bundle.

Never put MongoDB credentials, private keys, session secrets or staff passwords in Vite environment variables.

---

## 15. Backend Environment Configuration

The future backend may use a `.env` file locally.

### Proposed Example

`Server/.env.example`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tsa_academy_dev
SESSION_SECRET=REPLACE_WITH_SECURE_LOCAL_SECRET
CLIENT_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

These names and values are illustrative.

### Requirements

- Read the actual implemented environment configuration before creating a real file.
- Never commit real secrets.
- Validate required settings during startup.
- Do not use placeholder secrets in deployed environments.
- Use separate values for development, testing and production.
- Do not log connection credentials.

Authentication/session variables become applicable only when the corresponding security implementation exists.

---

## 16. Run Frontend and Backend Together

For backend-integrated development, the frontend and backend will normally run in separate terminal sessions.

### Terminal 1 — Frontend

```powershell
cd "C:\Users\Admin\Desktop\CLIENTS\Academy\Client"
npm run dev
```

### Terminal 2 — Backend

```powershell
cd "C:\Users\Admin\Desktop\CLIENTS\Academy\Server"
npm run dev
```

### Preconditions

Only run these commands when the corresponding `dev` scripts exist.

The backend database service must be available where required.

### Expected Architecture

```text
Browser
   |
   v
React/Vite Frontend
   |
   v
Frontend HTTP Adapter
   |
   v
Express API
   |
   v
MongoDB
```

Until the HTTP adapter is implemented, the React frontend may continue using the mock service/database path.

---

## 17. Existing Mock Frontend Mode

The current frontend uses centralized mock persistence.

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
Mock Database
    |
    v
Browser localStorage
```

### Rules

- Preserve existing frontend services.
- Do not manually alter localStorage records without understanding the current schema.
- Avoid browser storage clearing unless explicitly intended.
- Do not claim mock records are stored in MongoDB.
- Do not automatically upload browser data to the backend.
- Preserve existing data-version migration behavior.

### Backend Integration

Replacing the mock adapter with HTTP requests is a separate approved development activity.

---

## 18. Authentication Setup

The frontend currently provides role-based demonstration behavior.

Production authentication must use trusted backend records.

### Future Requirements

- Secure password hashing.
- Login and logout.
- Secure sessions.
- Active account checks.
- Branch membership.
- Five-role authorization.
- Record ownership.
- Session revocation.

### Current Roles

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Important

Mock login credentials must not be reused blindly for production accounts.

Any first-time production account bootstrap must use a separately approved secure procedure.

---

## 19. Branch Configuration

The academy supports multiple authorized branches.

### Requirements

- A user may have different roles in different branches.
- Branch switching must reload the correct permissions.
- Unsupported same-branch multi-role combinations fail closed.
- Cross-branch data access must be authorized.
- New branch creation remains paused for all roles.
- Backend records must use correct organization and branch scope.

### Development Testing

Use representative branch fixtures rather than hardcoded production accounts.

---

## 20. Financial Development Setup

Financial test data must remain fictional or specifically authorized.

### Fees

Test datasets should cover:

- Valid student enrollment.
- Challan.
- Verified payment.
- Partial payment.
- Outstanding fee balance.
- Duplicate-payment rejection.

### Teacher Payroll

Test datasets should cover:

- Faculty assignment.
- Fixed salary agreement.
- Percentage salary agreement.
- Independent running payable balance.
- Partial salary payment.
- Historical unpaid obligation.
- Matching posted expense.

### Critical Rule

**Do not create automatic monthly salary records.**

The correct salary calculations must be verified from actual frontend source and existing tests before implementing backend logic.

---

## 21. Testing Commands

Do not assume a testing script exists without inspecting package scripts.

### Inspect Frontend Scripts

```powershell
node -p "require('./Client/package.json').scripts"
```

### Inspect Backend Scripts

```powershell
node -p "require('./Server/package.json').scripts"
```

### If Frontend Test Script Exists

From `Client/`:

```powershell
npm test
```

Use this only if the actual `package.json` defines a compatible `test` script.

### If Backend Test Script Exists

From `Server/`:

```powershell
npm test
```

### Testing Rules

- Prefer targeted relevant tests.
- Use isolated test data.
- Do not run destructive database tests against production.
- Report actual execution results.
- Do not label unwritten or unexecuted tests as passed.

---

## 22. Build Verification

The frontend may have an npm `build` script.

If present, run from `Client/`:

```powershell
npm run build
```

### Verification

- Build completes successfully.
- Required environment values are configured.
- Generated assets do not contain private backend secrets.
- React application routes remain functional when deployed.

### Backend Build

An Express backend may not require a separate compilation step if it uses standard JavaScript.

Do not invent a backend build process without checking its actual package scripts and deployment requirements.

---

## 23. Git Workflow

Before changing source files:

```powershell
git status
```

Check the current working branch:

```powershell
git branch --show-current
```

Review changes:

```powershell
git diff
```

Check whitespace errors:

```powershell
git diff --check
```

### Safety Rules

- Do not reset unrelated changes.
- Do not stash without authorization.
- Do not clean untracked files without authorization.
- Do not overwrite local work.
- Do not commit or push automatically.
- Keep edits scoped to the approved ticket.

The project's established branch strategy must be followed.

---

## 24. Development Documentation

Important project documentation is organized into dedicated folders.

### Core

`docs/00-CORE/`

Product requirements, decisions and development rules.

### Architecture

`docs/01-ARCHITECTURE/`

System architecture, business rules and data flows.

### Database and API

`docs/02-DATABASE-AND-API/`

Database, REST APIs, migrations, caching and backend testing documents.

### Security

`docs/03-SECURITY/`

Security, permissions and authentication.

### Frontend

`docs/04-FRONTEND/`

Frontend integration and design requirements.

### Development

`docs/05-DEVELOPMENT/`

Setup, environment configuration, feature workflow and implementation plan.

### Operations

`docs/06-OPERATIONS/`

Backup, recovery, logging and operational guidance.

### Integration and QA

`docs/07-INTEGRATIONS-AND-QA/`

Frontend audits, backend handoff, regression planning and known gaps.

Use actual repository paths when adding links. Do not create duplicate documentation directories unnecessarily.

---

## 25. Frontend Troubleshooting

### Frontend Server Does Not Start

Check:

- Node.js version.
- Installed dependencies.
- Current directory.
- Available npm scripts.
- Port conflicts.
- Vite configuration.

### Application Shows Blank Screen

Check:

- Browser console.
- Terminal errors.
- Route configuration.
- Missing imports.
- Environment values.
- Recent source changes.

### LocalStorage Data Appears Missing

Check:

- Browser origin and port.
- Browser profile.
- Storage version.
- Application data migration logic.
- Current authenticated demo account/branch.

Do not clear storage before confirming the consequences.

### Wrong Branch Data Appears

Check:

- Active branch context.
- Role assignment.
- Service filters.
- Cache invalidation.
- Stored mock organization data.

---

## 26. Backend Troubleshooting

### Server Does Not Start

Check:

- Backend package scripts.
- Dependencies.
- Environment configuration.
- Port availability.
- Database connection requirements.
- Safe application logs.

### Port Conflict

Identify the process occupying the configured local backend port before changing configuration or terminating anything.

Do not kill unrelated processes without verifying ownership.

### API Returns Authentication Error

Check:

- Current session.
- Cookie/credential settings.
- Account status.
- Session expiration.
- Intended API origin.

### API Returns Permission Error

Check:

- Effective role.
- Authorized branch.
- Required action permission.
- Target-record ownership.

Do not bypass authorization middleware to make a request appear successful.

---

## 27. MongoDB Troubleshooting

### Connection Failure

Check:

- MongoDB service state.
- Connection URI format.
- Database credentials.
- Network reachability.
- TLS requirements.
- Database provider availability.

Do not print complete credential-bearing URIs.

### Missing Records

Check:

- Connected database/environment.
- Organization/branch filters.
- Source import status.
- Query conditions.
- User permissions.

### Transaction Error

Check:

- MongoDB deployment supports transactions.
- Session handling is correct.
- Related writes use the same transaction.
- Conflict/retry behavior.
- Relevant indexes and constraints.

### Financial Data Mismatch

Inspect authoritative records and calculation logic.

Do not directly edit financial collections merely to make UI totals match.

---

## 28. Frontend-to-Backend Connectivity Troubleshooting

### Common Problems

- Incorrect API base URL.
- Backend not running.
- CORS rejection.
- HTTPS mixed-content blocking.
- Missing session cookies.
- Incorrect SameSite/Secure settings.
- CSRF validation failure.
- Backend validation mismatch.
- Wrong response envelope.

### Diagnostic Order

1. Confirm backend availability.
2. Confirm actual API URL.
3. Inspect browser network request.
4. Check response status and safe error.
5. Verify session handling.
6. Verify authorization scope.
7. Verify expected API contract.
8. Check relevant backend logs.

Do not disable security controls as a permanent workaround.

---

## 29. Developer Security Practices

### Required

- Keep credentials private.
- Use fictional test records.
- Validate environment selection.
- Follow role and branch rules.
- Use server-side validation.
- Protect financial transactions.
- Preserve audit-sensitive history.
- Review new dependencies.

### Prohibited Without Approval

- Production database resets.
- Importing browser records into production.
- Bypassing authentication.
- Removing branch scope checks.
- Exposing Teacher salary records.
- Creating automatic monthly payroll.
- Adding unsupported refunds.
- Adding Cloudinary/media uploads.
- Force-pushing shared branches.

---

## 30. Recommended Daily Development Workflow

A normal authorized development session should follow:

1. Open the actual project folder.
2. Inspect Git status.
3. Read the active ticket.
4. Review relevant documentation.
5. Inspect affected source files.
6. Start only required services.
7. Implement the approved change.
8. Run targeted tests.
9. Review the diff.
10. Report changed files and actual results.

Avoid modifying unrelated modules during one feature ticket.

---

## 31. Setup Verification Checklist

- [ ] Correct project folder opened.
- [ ] Git repository recognized.
- [ ] Frontend package scripts inspected.
- [ ] Backend package scripts inspected.
- [ ] Compatible Node.js installed.
- [ ] Dependencies installed where required.
- [ ] Development environment variables configured.
- [ ] Frontend starts successfully.
- [ ] Backend starts where implemented.
- [ ] MongoDB connectivity verified where required.
- [ ] Frontend mock/HTTP mode understood.
- [ ] Authentication behavior verified.
- [ ] Branch selection works.
- [ ] Relevant tests executed.
- [ ] No sensitive credentials committed.
- [ ] Git status reviewed.

Unchecked boxes indicate pending verification.

---

## 32. Open Setup Decisions

The following require actual repository inspection or later technical approval:

- Final supported Node.js version.
- Selected package manager.
- Actual frontend/backend npm scripts.
- Current Express backend status.
- Local MongoDB service or Atlas configuration.
- Final `.env` variable names.
- Production session store.
- CSRF and CORS implementation.
- Frontend HTTP adapter mode selection.
- Backend testing framework.
- Data seeding strategy.
- Migration/import policy.
- Hosting configuration.

Do not fill these gaps with unsupported assumptions.

---

## 33. Related Documentation

This document must remain consistent with:

- `AGENTS.md` — AI coding-agent instructions.
- `RULES.md` — Engineering standards.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `SECURITY.md` — Security requirements.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication architecture.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Data isolation.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Migration rules.
- `API.md` — REST API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATA_FLOW.md` — Data movement.
- `TRANSACTIONS_AND_INTEGRITY.md` — Transaction safety.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Development roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Testing strategy.
- `DEPLOYMENT.md` — Hosting and deployment.
- `ENVIRONMENT_CONFIG.md` — Environment variables.
- `FEATURE_DEVELOPMENT.md` — Feature development process.
- `PROGRESS.md` — Verified implementation status.

Use actual repository locations for relative Markdown links.

---

## 34. Final Setup Boundary

### Confirmed

- Existing React/Vite frontend.
- Node.js/Express/MongoDB backend direction.
- Capitalized `Client/` and `Server/` directories.
- Five current frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only My Profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Current branch creation pause.
- Physical inventory Assets without media uploads.

### Proposed

- Local development commands.
- Environment examples.
- HTTP adapter configuration.
- MongoDB test setup.
- Backend health-check conventions.
- Standardized verification checklist.

### Deferred

- Multi-client SaaS setup.
- Platform Admin.
- Electron desktop configuration.
- LAN/offline synchronization.
- Cloudinary/media infrastructure.
- Unnecessary distributed services.

### Not Verified by This Document

- Exact current npm scripts.
- Installed package versions.
- Local MongoDB state.
- Running backend API.
- Final deployed configuration.
- Production readiness.

**Governing Principle:** Set up TSA Academy ERP using its existing repository conventions, preserve approved frontend behavior, protect local and production data, and verify each environment before performing development operations.

**Document Status:** DRAFT — Ready for repository-specific setup verification.
