# DEPLOYMENT_AND_DEVOPS

<!-- > Purpose: Defines deployment, CI/CD, hosting, environment promotion and rollback procedures. -->


# TSA Academy ERP — Deployment, DevOps & CI/CD Operations Specification

**Document:** DEPLOYMENT_AND_DEVOPS.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — DevOps Strategy Proposed; Production Deployment Not Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Repository:** `Client/`, `Server/`, `docs/`
**Initial Delivery:** Hosted Web Demo and Controlled Client Evaluation
**Document Category:** Operations & DevOps

---

## 1. Purpose

This document defines the complete DevOps, continuous integration, deployment, release management and operational delivery strategy for TSA Academy ERP.

The primary objective is to establish a safe and repeatable process for building, testing, deploying, monitoring and recovering the application while preserving the approved academy management workflows.

This specification covers:

- GitHub repository practices.
- Development branches and release controls.
- Continuous Integration (CI).
- Continuous Deployment/Delivery (CD).
- Frontend deployment through Vercel.
- Backend hosting.
- MongoDB Atlas or an approved alternative.
- Environment variables and secret management.
- Database migration safety.
- Automated and manual release gates.
- Preview/staging environments.
- Client demo deployment.
- Production release procedures.
- Rollbacks and recovery.
- Security and financial-integrity verification.
- Logging and monitoring.
- Operational responsibilities.

**Implementation boundary:** This document establishes proposed DevOps policies. It does not authorize creating cloud resources, connecting accounts, installing dependencies, modifying CI workflows, committing code, pushing branches or deploying the application.

---

## 2. DevOps Principles

### DEVOPS-001 — Reproducible Builds

An approved source revision must produce a traceable deployment artifact.

### DEVOPS-002 — Security by Default

Credentials, database connections and deployment permissions must remain protected.

### DEVOPS-003 — Separate Environments

Development, testing, staging and production must use appropriately isolated resources.

### DEVOPS-004 — Test Before Release

Required checks must pass before a release is promoted.

### DEVOPS-005 — Financial Integrity First

Deployment must not corrupt verified fee collections, payroll obligations, salary payments or posted expenses.

### DEVOPS-006 — Controlled Automation

Automated pipelines may perform only explicitly authorized actions.

### DEVOPS-007 — Traceable Releases

Every deployed version must be identifiable and linked to a source revision.

### DEVOPS-008 — Safe Recovery

Deployment and migration changes must have an appropriate rollback or recovery strategy.

### DEVOPS-009 — Minimal Infrastructure

Do not introduce unnecessary containers, queues, caches or orchestration systems.

### DEVOPS-010 — Accurate Status Reporting

Do not claim that CI, deployment, backups or tests succeeded without actual execution evidence.

---

## 3. Current Project Baseline

### 3.1 Frontend

The current frontend uses React and Vite.

It includes domain services, mock adapters and browser-local persistence for demonstration workflows.

### 3.2 Backend

The proposed backend uses Node.js, Express.js, MongoDB and Mongoose.

The actual existing `Server/` implementation must be inspected before configuring deployment.

### 3.3 Repository

The project uses the capitalized directories:

- `Client/`
- `Server/`

It also contains organized documentation under `docs/`.

### 3.4 CI History

CI infrastructure has previously been started for the repository.

Do not assume its exact current workflow configuration or execution status without inspecting `.github/workflows/` and actual pipeline results.

### 3.5 Deployment Status

The original delivery direction is a hosted web demonstration.

A Vercel URL does not by itself establish that the Express backend or MongoDB persistence is deployed.

---

## 4. Approved Product Boundaries

The deployment must preserve current business behavior.

### Five Roles

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Receptionist

Full approved access to:

- Admissions.
- Fees.

No independent access to:

- Finance Overview.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branches.
- Users.
- Administrative Settings.

### Teacher

Teacher can access their own:

- My Profile.
- Timetable.
- Academic Assignments.
- Salary Agreements.
- Verified Salary Payments.
- Outstanding Running Balance.
- Payslips.
- Notifications.

Teacher must not access another Teacher's confidential compensation.

### Teacher Payroll

Salary is assignment/batch/subject-based running remuneration.

**Do not implement automatic monthly salary generation.**

### Branches

- One academy organization with multiple branches.
- Different roles across branches are supported.
- Unsupported same-branch multiple-role combinations fail closed.
- New branch creation remains paused for all roles.

### Assets

Assets represents physical academy inventory.

Cloudinary/media-upload infrastructure is deferred.

---

## 5. Proposed Infrastructure Architecture

```text
                         Internet
                            |
                            v
                    Approved HTTPS Domain
                            |
                +-----------+-----------+
                |                       |
                v                       v
         React/Vite Frontend       Express REST API
              Vercel              Approved Node Host
                |                       |
                |      HTTPS API        |
                +---------------------->|
                                        |
                                        v
                                    Mongoose
                                        |
                                        v
                                     MongoDB
                                        |
                                        v
                                Approved Backups
```

### Infrastructure Responsibilities

| Component | Responsibility |
|---|---|
| GitHub | Source control and approved CI workflows |
| Vercel | Frontend build and static hosting |
| Backend host | Execute Express API |
| MongoDB | Authoritative persistent application records |
| Secret management | Protect production credentials |
| CI/CD | Validate and deliver approved revisions |
| Monitoring | Detect errors and operational degradation |
| Backup service | Support approved recovery objectives |

Final providers and service plans remain TBD unless verified from the actual deployment.

---

# PART A — SOURCE CONTROL AND DEVELOPMENT FLOW

## 6. Git Repository Rules

The repository must preserve source history and existing work.

### Requirements

- Inspect current Git status before modifications.
- Preserve unrelated tracked and untracked changes.
- Avoid destructive resets.
- Review diffs before release.
- Keep feature changes scoped.
- Follow existing branch conventions.
- Do not commit or push automatically without authorization.

### Inspection Commands

From the actual repository root:

```powershell
git status
git branch --show-current
git diff
git diff --check
```

These commands are observational and do not change the repository.

### Important

Never assume the working tree is clean.

Do not run `git reset --hard`, `git clean -fd` or force-push as a routine deployment preparation step.

---

## 7. Git Branch Strategy

The final branch naming convention must follow the actual repository.

A proposed approach may distinguish:

- Main or production branch.
- Development/integration branch, if used.
- Feature branches.
- Bug-fix branches.
- Release or hotfix branches where required.

### Rules

- Do not create unnecessary long-lived branches.
- Avoid merging unreviewed financial changes.
- Protect the approved production deployment source.
- Require review for critical security and financial functionality.
- Keep feature scope traceable through commits or pull requests.

### Current Status

The actual active branches and protection rules must be verified.

---

## 8. Pull Request Standards

When the project uses pull requests, each should identify:

- Purpose.
- Affected modules.
- Actual changed files.
- Business rules affected.
- Security implications.
- Database changes.
- Relevant tests.
- Known limitations.
- Deployment considerations.

### Financial Changes

Pull requests affecting Fees or Teacher Payroll should explicitly address:

- Money precision.
- Duplicate-payment protection.
- Outstanding-balance validation.
- Historical record preservation.
- Transaction consistency.
- Salary-to-expense linkage.
- Role and branch permissions.

---

## 9. Dependency Management

### Requirements

- Inspect existing dependencies.
- Preserve the selected package manager and lockfile.
- Prefer maintained, necessary packages.
- Avoid multiple libraries for identical purposes.
- Review dependency changes for compatibility.
- Run appropriate tests after updates.

### Deferred Dependencies

Do not install by default:

- Redis.
- RabbitMQ.
- Kafka.
- Cloudinary SDK.
- Microservice frameworks.
- Electron.
- Unnecessary deployment orchestration systems.

Dependencies require an approved use case.

---

# PART B — CONTINUOUS INTEGRATION

## 10. CI Objectives

Continuous Integration should detect problems before deployment.

### Main Checks

- Source consistency.
- Dependency installation.
- Frontend tests.
- Backend tests, when implemented.
- Security-sensitive validation.
- Build correctness.
- Relevant integration tests.

### Important

The actual CI configuration must be inspected before changing it.

An existing CI workflow should be extended carefully rather than replaced without justification.

---

## 11. Proposed CI Pipeline

```text
Code Change / Pull Request
            |
            v
      GitHub Actions
            |
            v
      Dependency Setup
            |
            v
   Relevant Static Checks
            |
            v
        Unit Tests
            |
            v
  Integration / API Tests
            |
            v
     Frontend Build
            |
            v
      CI Result
            |
       +----+----+
       |         |
       v         v
     Passed    Failed
       |         |
       v         v
 Review Gate   Fix Required
```

The exact jobs depend on the existing scripts and project implementation stage.

---

## 12. Frontend CI

The `Client/` application uses React and Vite.

### Candidate Checks

- Dependency installation using the selected lockfile.
- Existing frontend tests.
- Build verification.
- Relevant lint/static checks if configured.

### Requirements

- Execute from the correct directory.
- Use the actual `Client/package.json` scripts.
- Preserve the current frontend design and workflows.
- Do not introduce a second test framework unnecessarily.
- Avoid exposing backend secrets to frontend build jobs.

### Important

A successful build does not prove that Admissions, Fees or Payroll operate correctly.

Functional and regression tests remain necessary.

---

## 13. Backend CI

The `Server/` application will use Node.js/Express and MongoDB.

### Candidate Checks

- Dependency installation.
- Server startup/configuration validation.
- Unit tests.
- API contract tests.
- MongoDB integration tests.
- RBAC and branch-isolation tests.
- Transaction tests.
- Financial reconciliation tests.

### Database Safety

- Use a dedicated test database.
- Do not share production credentials.
- Verify test database target before cleanup.
- Use a transaction-capable MongoDB environment for transaction tests.

### Important

Mock database tests are not sufficient evidence of real MongoDB transaction safety.

---

## 14. CI Test Selection

Prefer efficient, impact-based testing.

### Small Changes

Run relevant targeted tests.

### Shared Infrastructure Changes

Expand testing to affected modules.

### Authentication or Authorization Changes

Run applicable role, branch and record-access tests.

### Financial Changes

Run related:

- Unit calculations.
- Integration tests.
- Idempotency tests.
- Concurrency tests.
- Reconciliation tests.

### Release Candidate

Run the full required release verification scope.

Do not skip critical tests solely to make the pipeline faster.

---

## 15. CI Secrets Security

CI workflows must use least-privilege credentials.

### Rules

- Store secrets in approved CI secret management.
- Restrict access by environment.
- Avoid printing secret values.
- Do not expose production secrets to untrusted pull requests.
- Do not commit service-account credentials.
- Use short-lived credentials where supported.
- Limit deployment permissions.

### Important

Frontend build variables prefixed `VITE_` are not secret storage.

Never inject private MongoDB or authentication secrets into browser bundles.

---

## 16. CI Status and Evidence

A CI job may be classified as:

- NOT_CONFIGURED.
- CONFIGURED.
- RUNNING.
- PASSED.
- FAILED.
- CANCELLED.
- BLOCKED.

### Reporting Requirement

Record:

- Workflow name.
- Source revision.
- Actual run identifier, if available.
- Test jobs executed.
- Results.
- Relevant failures.

Do not mark CI passed because configuration files exist.

---

# PART C — CONTINUOUS DELIVERY AND DEPLOYMENT

## 17. Continuous Delivery Policy

Continuous Delivery means an approved source revision can be prepared for deployment after required checks.

Production deployment must remain subject to the project's approval policy.

### Requirements

- Traceable build.
- Relevant test results.
- Environment-specific configuration.
- Appropriate access control.
- Deployment approval where required.
- Post-deployment verification.
- Rollback readiness.

### Important

An automated deployment workflow does not authorize every source change to be promoted to production.

---

## 18. Deployment Environments

| Environment | Purpose |
|---|---|
| Local Development | Build and debug features |
| Automated Testing | Execute isolated tests |
| Preview / Demo | Demonstrate approved functionality |
| Staging | Validate backend-integrated release |
| Production | Operate the accepted application |

### Separation Requirements

- Different database resources where necessary.
- Separate secrets.
- Clearly identified domains.
- Controlled user access.
- No uncontrolled production test writes.
- Appropriate logging and monitoring.

---

## 19. Frontend Hosting — Vercel

Vercel is the preferred initial frontend hosting direction.

### Proposed Build Settings

| Item | Proposed configuration |
|---|---|
| Root Directory | `Client` |
| Framework | Vite |
| Build Command | Existing frontend build script |
| Output Directory | `dist` |
| Environment Variables | Public `VITE_` configuration only |

### Requirements

- Verify the actual project scripts.
- Preserve client-side routing.
- Configure the correct backend API URL.
- Use HTTPS.
- Verify assets and route refresh behavior.
- Do not expose private credentials.

### SPA Routing

Direct navigation to supported routes must load the React application correctly.

The final rewrite configuration must match the actual frontend router.

---

## 20. Backend Hosting

The Express API requires hosting compatible with the chosen server runtime.

Possible providers include:

- Render.
- Railway.
- An approved VPS.
- Another suitable Node.js host.

These are candidates, not confirmed selections.

### Required Capabilities

- Supported Node.js runtime.
- Environment secrets.
- HTTPS.
- MongoDB connectivity.
- Reliable startup.
- Logs.
- Health checks.
- Appropriate process lifecycle.

### Port Configuration

The backend must respect its configured or provider-supplied port.

Do not hardcode local port `5000` as a universal production requirement.

---

## 21. MongoDB Hosting

MongoDB Atlas is a proposed managed database option.

### Requirements

- Dedicated approved database.
- Least-privilege credentials.
- Secure connection.
- Suitable network restrictions.
- Required indexes.
- Transaction-capable deployment.
- Appropriate backup support.
- Environment separation.

### Critical

The frontend must never connect directly to MongoDB.

All protected operations must pass through the authenticated backend.

---

## 22. Production Domains and HTTPS

A possible deployment arrangement is:

```text
academy.example.com
    → React Frontend

api.example.com
    → Express Backend
```

These are placeholders.

### HTTPS Requirements

- Encrypt authenticated browser traffic.
- Verify certificates.
- Avoid mixed-content requests.
- Configure cookies appropriately.
- Use correct backend/frontend origins.
- Validate credentialed requests.

### Security

CORS does not replace authorization or CSRF protection.

---

## 23. Environment Configuration

Use environment-specific settings.

### Proposed Frontend Variables

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_APP_ENV=production
```

### Proposed Backend Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<securely-configured-secret>
SESSION_SECRET=<securely-configured-secret>
CLIENT_ORIGIN=https://academy.example.com
LOG_LEVEL=info
```

These names and values are illustrative.

### Rules

- Use the actual implemented configuration module.
- Never deploy placeholder secrets.
- Validate required variables.
- Store private credentials securely.
- Do not print secrets in CI logs.
- Do not put backend secrets in frontend variables.

---

# PART D — DATABASE AND RELEASE SAFETY

## 24. Database Migration Policy

Schema and data migrations must be handled separately from ordinary application builds.

### Required Steps

1. Review the approved migration.
2. Confirm target environment.
3. Verify current database schema.
4. Assess affected records.
5. Prepare recovery.
6. Run appropriate staging tests.
7. Obtain production execution approval.
8. Apply migration safely.
9. Verify data integrity.
10. Record outcome.

### Restrictions

- Never automatically delete collections on deployment.
- Never import browser localStorage without approval.
- Never run destructive test seeds against production.
- Never silently rewrite historical payments.
- Never duplicate salary expenses.

---

## 25. Application and Database Compatibility

Every release must be compatible with its database schema.

### Recommended Strategy

Use backward-compatible migrations where practical.

### Expand-and-Contract Approach

1. Introduce compatible schema additions.
2. Deploy code able to read the required structures.
3. Backfill approved data.
4. Verify functionality.
5. Switch dependent logic.
6. Remove obsolete structures in a separate approved migration.

### Important

A code rollback cannot always reverse a database schema migration.

Release plans must address this distinction.

---

## 26. Financial Release Safety

Financial workflows are critical.

### Student Fees

Verify:

- Approved challan calculations.
- Correct verified payment state.
- Accurate outstanding balance.
- Duplicate prevention.
- Receipt integrity.
- Correct Finance revenue.

### Teacher Payroll

Verify:

- Assignment-based running obligations.
- Correct Fixed/Percentage calculations.
- Historical balance preservation.
- Partial/full salary payments.
- No automatic monthly salary generation.
- Correct linked Posted Expense.
- No duplicate expense.
- Teacher self-only access.

### Release Gate

Do not promote changes that introduce known critical financial inconsistency.

---

## 27. Deployment Approval Gates

### Gate D1 — Source Review

- Scope approved.
- Git diff reviewed.
- Dependencies understood.

### Gate D2 — CI Verification

- Required checks passed.
- Relevant tests executed.

### Gate D3 — Database Readiness

- Schema compatibility verified.
- Migration/recovery requirements addressed.

### Gate D4 — Security Review

- Authentication, role and branch protections verified.

### Gate D5 — Staging Verification

- Connected frontend/backend workflows tested.

### Gate D6 — Release Authorization

- Authorized operator approves promotion.

### Gate D7 — Production Smoke Test

- Deployed application behavior verified.

Technical test completion is not equivalent to owner acceptance.

---

# PART E — DEMONSTRATION AND RELEASE MANAGEMENT

## 28. Client Demo Delivery

The initial product direction includes a hosted demonstration for client evaluation.

### Demo Priorities

- Application availability.
- User login and branch selection.
- Approved role-specific navigation.
- Admissions.
- Students and Enrollment.
- Fees.
- Faculty Assignments.
- Teacher My Profile.
- Running Teacher Payroll.
- Finance reporting.
- Academy branding.

### Demo Environment Requirements

- Use authorized or fictional data.
- Protect demo credentials.
- Avoid exposing infrastructure secrets.
- Label frontend-only mock behavior accurately.
- Do not imply shared MongoDB persistence unless integrated and verified.

---

## 29. Release Identification

Every release should have a traceable identity.

### Candidate Metadata

- Application version.
- Source revision.
- Build identifier.
- Environment.
- Deployment timestamp.
- Database migration version.
- Release status.

### Purpose

Enable investigation of defects and identification of the deployed source.

Do not invent deployment versions in progress reports.

---

## 30. Release Notes

Release notes should summarize:

- Implemented features.
- Bug fixes.
- Relevant security changes.
- Database migrations.
- Compatibility changes.
- Known limitations.
- Testing evidence.
- Rollback considerations.

### Writing Rule

Differentiate:

- PLANNED.
- IMPLEMENTED.
- TESTED.
- DEPLOYED.
- OWNER_ACCEPTED.

A feature listed in documentation is not automatically implemented.

---

## 31. Deployment Procedure

### Step 1 — Identify Release

Confirm the approved source revision and intended environment.

### Step 2 — Review Repository

Inspect current Git status and changes.

### Step 3 — Verify CI

Confirm required jobs actually passed.

### Step 4 — Prepare Database

Review schema compatibility, migrations and recovery readiness.

### Step 5 — Configure Backend

Verify runtime variables, session security and database connectivity.

### Step 6 — Deploy Backend

Deploy the approved backend revision to the selected environment.

### Step 7 — Verify Backend

Check startup, readiness, authentication and protected API behavior.

### Step 8 — Configure Frontend

Ensure the frontend uses the intended API URL.

### Step 9 — Deploy Frontend

Deploy the matching approved React build.

### Step 10 — Run Smoke Tests

Verify critical paths.

### Step 11 — Monitor

Review logs, errors, authentication and database health.

### Step 12 — Record Outcome

Document release, environment, tests and issues.

No step implies authority to execute production changes without approval.

---

## 32. Smoke Testing Checklist

### Core

- [ ] Frontend loads.
- [ ] Backend responds.
- [ ] Database connection healthy.
- [ ] Login/logout works.
- [ ] Authorized branch selection works.

### Security

- [ ] Role permissions enforced.
- [ ] Cross-branch access blocked.
- [ ] Admin privilege escalation denied.
- [ ] Teacher salary confidentiality enforced.
- [ ] Branch creation pause enforced.

### Academics

- [ ] Admissions load.
- [ ] Student records load.
- [ ] Enrollment relationships work.
- [ ] Courses and Batches load.
- [ ] Faculty assignments load.

### Finance

- [ ] Challan data correct.
- [ ] Verified collections reconcile.
- [ ] Running Teacher Payroll correct.
- [ ] Salary-to-expense relationship valid.
- [ ] Finance totals accurate.

### Supporting Features

- [ ] Teacher My Profile loads.
- [ ] Demo Classes load.
- [ ] Assets load.
- [ ] Reports work.
- [ ] Settings/branding work.

The checklist records required verification, not current successful results.

---

## 33. Deployment Rollback

Rollback may be needed after a failed release.

### Application Rollback

Restore a compatible previously approved frontend/backend revision.

### Database Recovery

Use a separately approved migration rollback or forward-repair process.

### Critical Financial Rule

Do not blindly restore an old database backup if valid transactions occurred after that backup.

### Required Actions

- Identify affected release.
- Preserve evidence.
- Assess business impact.
- Check database schema compatibility.
- Choose the least disruptive authorized recovery.
- Verify financial records.
- Run relevant tests.
- Document outcome.

---

## 34. Backup and Disaster Recovery

The database requires an approved backup strategy before production operation.

### Requirements

- Backup frequency.
- Retention.
- Protected storage.
- Restricted access.
- Restore testing.
- Recovery objectives.
- Financial reconciliation.

### Critical Records

- Verified Fee Payments.
- Challans.
- Salary Agreements.
- Payroll Payments.
- Posted Expenses.
- Students and Enrollments.
- User/Branch permissions.
- Audit history.

### Important

A backup job reporting success does not prove full application recovery readiness.

Restoration must be tested in an appropriate isolated environment.

---

# PART F — SECURITY AND OPERATIONS

## 35. Production Security

### Required Controls

- HTTPS.
- Secure backend credentials.
- Password hashing.
- Secure sessions.
- Appropriate cookie configuration.
- CSRF mitigation.
- Restricted CORS.
- Server-side RBAC.
- Branch and record ownership.
- Protected API validation.
- Rate limiting where needed.
- Safe errors and logs.

### Protected Data

- Student personal information.
- Staff credentials.
- Teacher salary records.
- Payment transactions.
- Financial reports.
- Audit events.

Do not expose confidential data through frontend environment variables, CI logs or publicly accessible exports.

---

## 36. Monitoring and Logging

Monitor:

- Application availability.
- Request errors.
- Authentication failures.
- Authorization denials.
- MongoDB connectivity.
- Transaction failures.
- Slow queries.
- Financial reconciliation discrepancies.
- Backup failures.

### Logging Security

Never log plaintext passwords, private session tokens, database credentials or unnecessary confidential salary details.

### Status

Monitoring provider and alert thresholds remain TBD.

---

## 37. Incident Response

Potential incidents include:

- Frontend unavailable.
- Backend outage.
- Database connection failure.
- Unauthorized data access.
- Duplicate Fee Payment.
- Incorrect Payroll balance.
- Missing Payroll Expense.
- Failed migration.

### Response Sequence

1. Confirm the incident.
2. Protect confidential data.
3. Preserve technical evidence.
4. Identify affected services/records.
5. Stop unsafe operations if necessary.
6. Apply authorized correction/recovery.
7. Test results.
8. Document the incident.

Do not silently change financial history.

---

## 38. Performance and Scaling

Initial optimization should focus on:

- Efficient MongoDB queries.
- Correct indexes.
- Bounded pagination.
- Controlled aggregation.
- Appropriate frontend cache invalidation.
- Safe connection handling.

### Scaling Strategy

Measure actual resource usage before introducing additional infrastructure.

### Deferred

- Kubernetes.
- Microservices.
- Redis.
- Message brokers.
- Multi-region deployment.
- Unnecessary realtime services.

Scaling must not weaken branch isolation or financial consistency.

---

## 39. DevOps Roles and Responsibilities

### Product Owner

Approves:

- Business scope.
- Production-impacting changes.
- Sensitive data repair.
- Release acceptance.

### Authorized Developer

Implements approved code and test changes.

### Authorized Deployment Operator

Executes approved releases and operational procedures.

### Database Operator

Manages approved migrations, backups and restores.

### Security Reviewer

Verifies access, credentials and confidential-data controls.

These responsibilities may be fulfilled by the same authorized individual in a small project, but the approval boundaries must remain clear.

An ERP Super Admin account does not automatically provide cloud-hosting administrator rights.

---

## 40. Documentation and Progress Reporting

### `TASKS.md`

Maintain implementation work and blockers.

### `PROGRESS.md`

Record actual changes and tests.

### `MEMORY.md`

Preserve lasting approved decisions.

### `BACKEND_GAPS_AND_RISKS.md`

Record unresolved risks.

### Deployment Records

Record:

- Environment.
- Release.
- Source revision.
- Actual deployment result.
- Tests performed.
- Relevant incident or rollback information.

### Important

Do not claim that a release is live without verified deployment evidence.

---

## 41. CI/CD Failure Troubleshooting

### Dependency Failure

Check package manager and lockfile consistency.

### Frontend Build Failure

Check actual frontend scripts, imports and Vite environment configuration.

### Backend Test Failure

Check domain tests, database setup and environment isolation.

### MongoDB Integration Failure

Check transaction support, connection and test fixtures.

### Deployment Failure

Check provider logs, runtime configuration, environment variables and application health.

### Authentication Failure After Deployment

Check HTTPS, session cookies, CORS, CSRF and trusted proxies.

### Rule

Do not disable critical tests or security controls solely to make CI green.

---

## 42. DevOps Acceptance Criteria

The DevOps implementation is technically acceptable when:

1. Builds are reproducible.
2. Required CI checks execute successfully.
3. Secrets are protected.
4. Environments are appropriately isolated.
5. Frontend deployment works.
6. Backend deployment works where implemented.
7. MongoDB connectivity is verified.
8. Protected authentication works.
9. Branch and role restrictions work.
10. Financial integrity checks pass.
11. Deployment is traceable.
12. Recovery procedures match approved requirements.
13. Monitoring detects relevant critical failures.
14. Actual deployment status is documented.

Owner acceptance remains separate.

---

## 43. Open DevOps Decisions

The following remain TBD:

- Production Git branch.
- Pull request approval rules.
- Backend hosting provider.
- MongoDB provider and plan.
- Domain names.
- Runtime versions.
- Final CI workflow structure.
- Deployment trigger policy.
- Production release approval process.
- Database migration runner.
- Session store.
- Backup frequency and retention.
- Monitoring provider.
- Incident escalation.
- Client acceptance procedure.

Do not silently invent production configuration.

---

## 44. Explicitly Deferred Work

The initial DevOps scope excludes:

- Platform Admin infrastructure.
- Multi-academy SaaS provisioning.
- Electron packaging.
- LAN/offline synchronization.
- Cloudinary/media hosting.
- Kubernetes.
- Unnecessary microservices.
- Redis and message queues without a verified need.
- Automatic monthly Teacher Payroll.
- Unsupported financial refund/reversal infrastructure.

Deferred capabilities require separate approval.

---

## 45. Related Documentation

This document must remain consistent with:

- `AGENTS.md` — Coding-agent instructions.
- `RULES.md` — Engineering standards.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — Technical architecture.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Migration procedures.
- `API.md` — REST API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `SECURITY.md` — Security requirements.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication and sessions.
- `RBAC_PERMISSIONS.md` — Role authorization.
- `TENANT_BRANCH_ISOLATION.md` — Branch ownership.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATA_FLOW.md` — Cross-module flows.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial transactions.
- `CACHING_AND_PERFORMANCE.md` — Performance strategy.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Implementation roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Testing strategy.
- `DEPLOYMENT.md` — General deployment specification.
- `ENVIRONMENT_CONFIG.md` — Environment settings.
- `SETUP.md` — Local project setup.
- `FEATURE_DEVELOPMENT.md` — Feature engineering workflow.
- `BACKUP_AND_RECOVERY.md` — Recovery procedures.
- `LOGGING_AND_MONITORING.md` — Operational observability.
- `DEBUGGING.md` — Troubleshooting.
- `TESTING_AND_QA.md` — Project quality assurance.
- `FRONTEND_INTEGRATION.md` — Frontend service integration.
- `FRONTEND_BACKEND_HANDOFF.md` — Integration handoff.
- `BACKEND_GAPS_AND_RISKS.md` — Risks and blockers.
- `TASKS.md` — Implementation tasks.
- `PROGRESS.md` — Verified progress.
- `MEMORY.md` — Owner-approved decisions.

Relative links must match actual repository paths.

---

## 46. Final DevOps Boundary

### Confirmed Requirements

- React/Vite frontend.
- Node.js/Express/MongoDB backend direction.
- Existing `Client/` and `Server/` folders.
- Five frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher own-profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy with multiple authorized branches.
- Current branch creation pause.
- Initial hosted web demonstration.

### Proposed DevOps Architecture

- GitHub CI.
- Vercel frontend hosting.
- Approved Node.js backend host.
- MongoDB deployment.
- Environment-specific secret management.
- Controlled CI/CD release gates.
- Database migration safeguards.
- Logging and monitoring.
- Backup and recovery procedures.

### Deferred

- Platform Admin and SaaS hosting.
- Electron/offline infrastructure.
- Cloudinary/media pipeline.
- Premature distributed systems.
- Unsupported financial workflows.

### Not Implemented or Verified by This Document

- Production CI/CD workflows.
- Live frontend/backend deployment.
- Final MongoDB hosting.
- Configured production secrets.
- Verified backup/restore process.
- Production monitoring.
- Owner release acceptance.

**Governing Principle:** TSA Academy ERP must use secure, reproducible and controlled deployment processes while preserving existing frontend behavior, role and branch isolation, academic relationships and authoritative financial history.

**Document Status:** DRAFT — Ready for DevOps implementation planning and later approved deployment execution.
