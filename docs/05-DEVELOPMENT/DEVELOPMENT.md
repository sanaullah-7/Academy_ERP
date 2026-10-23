# TSA Academy ERP — Deployment, Hosting & Release Management Specification

**Document:** DEPLOYMENT.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Deployment Architecture Proposed; Production Deployment Not Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Product:** Single Academy, Multiple Branches
**Deployment Target:** Hosted Web Application
**Desktop / LAN:** Deferred

---

## 1. Purpose

This document defines the deployment architecture, hosting requirements, configuration standards, release procedures and operational safeguards for TSA Academy ERP.

Its purpose is to ensure that the application can be deployed as a secure, reliable and maintainable hosted web system without compromising existing frontend behavior or academic and financial data.

This document covers:

- Frontend deployment.
- Backend hosting.
- MongoDB deployment.
- Environment configuration.
- Authentication and security.
- CI/CD.
- Database migrations.
- Backup and recovery.
- Logging and monitoring.
- Domain and HTTPS configuration.
- Rollback procedures.
- Client demonstration.
- Production readiness.
- Post-deployment verification.

**Important:** This document is a deployment specification, not authorization to deploy the application or modify hosting services.

---

## 2. Deployment Objectives

The deployment must satisfy the following objectives:

1. Host the existing React frontend.
2. Run the Express backend on a suitable hosting platform.
3. Connect the backend to an authorized MongoDB database.
4. Use secure environment variables.
5. Support authentication and branch-aware authorization.
6. Preserve all approved frontend workflows.
7. Maintain financial transaction integrity.
8. Support multiple authorized staff users.
9. Prevent unauthorized database access.
10. Provide reliable deployment and rollback procedures.
11. Keep demonstration and production environments logically separated.
12. Avoid unnecessary infrastructure complexity.

The initial deployment does not require enterprise-scale distributed infrastructure.

---

## 3. Deployment Scope

### 3.1 Included

The initial hosted web deployment may include:

- React/Vite frontend.
- Node.js/Express backend.
- MongoDB database.
- Secure application sessions.
- Role and branch authorization.
- HTTPS.
- Environment configuration.
- Basic logging.
- Database backup strategy.
- CI/CD checks.
- Application health checks.
- Authorized client testing.

### 3.2 Deferred

The following are outside the initial deployment scope:

- Electron desktop application.
- LAN-only application.
- Offline-first synchronization.
- Multi-client SaaS platform.
- Platform Admin provisioning.
- Kubernetes.
- Microservices.
- Unnecessary distributed caches.
- Cloudinary/media upload infrastructure.
- Automatic monthly teacher payroll.
- Unapproved financial refund or reversal services.

Deferred infrastructure requires a separately approved implementation ticket.

---

## 4. Proposed Deployment Architecture

The application should use a simple hosted architecture.

```text
                         Internet
                            |
                            v
                   HTTPS / Public Domain
                            |
             +--------------+--------------+
             |                             |
             v                             v
       React Frontend                 Express Backend
      Static Web Hosting               API Hosting
         (Vercel)                     (TBD Provider)
             |                             |
             |        HTTPS API            |
             +---------------------------->|
                                           |
                                           v
                                    Mongoose ODM
                                           |
                                           v
                                     MongoDB Atlas
                                           |
                                           v
                                  Persistent ERP Data
```

### Responsibilities

| Component | Responsibility |
|---|---|
| Frontend host | Deliver compiled React assets |
| Backend host | Run Express API and business services |
| MongoDB | Persist authoritative records |
| DNS | Resolve approved application domains |
| HTTPS | Encrypt network communication |
| CI/CD | Validate and deliver approved changes |
| Monitoring | Identify failures and service health |
| Backup system | Support approved recovery requirements |

The backend hosting provider must support the application's chosen execution model.

A traditional long-running Express server must not be assumed to work unchanged on every serverless platform.

---

## 5. Frontend Deployment

### 5.1 Recommended Hosting

**Vercel** is the preferred initial frontend hosting direction, consistent with the existing hosted demonstration plan.

The frontend is a React application built with Vite.

### 5.2 Repository Structure

```text
Academy/
├── Client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── Server/
│   ├── src/
│   └── package.json
└── docs/
```

Preserve the capitalized `Client/` and `Server/` directory names.

### 5.3 Proposed Build Configuration

| Setting | Proposed value |
|---|---|
| Root Directory | `Client` |
| Framework | Vite |
| Install Command | Derived from actual lockfile and package manager |
| Build Command | Existing `Client/package.json` build script |
| Output Directory | `dist` |
| Environment | Separate preview and production settings |

Do not hardcode build commands until they are verified against the current repository.

### 5.4 SPA Routing

The frontend uses client-side React routes.

The hosting configuration must ensure that direct navigation to supported application routes loads the React application rather than returning an unexpected 404.

Examples include:

- `/dashboard`
- `/admissions`
- `/students`
- `/fees`
- `/my-profile`

The exact router configuration must be inspected before creating rewrites.

### 5.5 Frontend API URL

The frontend should use an environment-configured backend base URL.

Proposed variable:

`VITE_API_BASE_URL`

Example:

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

This is a placeholder, not the project's confirmed production address.

### Frontend Environment Security

Variables exposed through Vite's client environment system are included in browser-accessible code.

Never place the following in frontend environment variables:

- MongoDB connection strings.
- Database passwords.
- Session signing secrets.
- API private keys.
- Administrative bootstrap credentials.
- Private service credentials.

Only explicitly public application configuration may be included.

---

## 6. Backend Deployment

### 6.1 Required Runtime

- Supported Node.js LTS runtime.
- Express.js API application.
- MongoDB connection through Mongoose.
- Secure environment configuration.
- Process startup and shutdown handling.
- Health checks.
- Logging and error handling.

The exact Node.js version must be selected after inspecting the repository's package requirements and deployment provider support.

### 6.2 Hosting Selection

Potential providers may include an appropriate Node.js application host, such as:

- Render.
- Railway.
- A suitable VPS.
- Another approved Node.js hosting service.

These are candidates, not an approved provider decision.

The hosting platform must support:

- Reliable Node.js execution.
- HTTPS access.
- Environment secrets.
- MongoDB connectivity.
- Deployment logs.
- Health monitoring.
- Predictable process lifecycle.
- Suitable application resource limits.

### 6.3 Server Binding

The backend must use the hosting provider's assigned port when supplied.

A fixed local development port such as `5000` must not be assumed to be valid in production.

### 6.4 Process Lifecycle

The server must:

1. Validate required environment configuration.
2. Initialize application dependencies.
3. Establish required database connectivity.
4. Start accepting requests when ready.
5. Expose safe health/readiness information.
6. Handle termination signals appropriately.
7. Close resources cleanly.
8. Avoid logging secrets during failures.

Do not require connection to optional services that are not part of the approved deployment.

---

## 7. MongoDB Deployment

### 7.1 Proposed Provider

MongoDB Atlas is a suitable candidate for managed MongoDB hosting.

Final provider, plan, region and capacity must be selected according to the actual application requirements.

### 7.2 Database Separation

Use separate logical environments for:

- Local development.
- Automated testing.
- Client demonstration/staging.
- Production, when applicable.

Never run destructive automated tests against the production database.

### 7.3 Database Authentication

- Create a dedicated database user with only the required privileges.
- Use a strong credential.
- Store credentials in the backend host's secret configuration.
- Do not embed connection strings containing passwords in source code.
- Rotate compromised credentials.
- Review access after staff or infrastructure changes.

### 7.4 Network Access

Restrict MongoDB network access to approved backend infrastructure wherever supported.

Do not expose MongoDB directly to the React frontend.

Avoid unrestricted public database access as a permanent production configuration.

Provider-specific IP allowlisting, private networking and connectivity settings must be configured according to actual hosting capabilities.

### 7.5 Transaction Support

The database deployment must support MongoDB transactions required by multi-record business operations.

Critical examples:

- Instant admission.
- Enrollment and challan creation.
- Fee payment operations requiring coordinated writes.
- Teacher salary payment and linked expense.
- Approved multi-record administrative updates.

A transaction-capable MongoDB configuration must be verified through integration testing before accepting these workflows.

---

## 8. Environment Variables

All environment variables must be documented and validated.

### 8.1 Backend Variables

Proposed examples:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Application execution environment |
| `PORT` | Backend listening port |
| `MONGODB_URI` | MongoDB connection address |
| `SESSION_SECRET` | Session-signing secret if required by selected session library |
| `SESSION_COOKIE_NAME` | Session cookie name |
| `CLIENT_ORIGIN` | Approved frontend origin |
| `LOG_LEVEL` | Application logging verbosity |
| `TRUST_PROXY` | Trusted reverse-proxy configuration where needed |

These variable names are proposed and must be reconciled with the actual backend architecture.

### 8.2 Frontend Variables

Proposed:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Public backend API base URL |
| `VITE_APP_ENV` | Non-sensitive application environment label |

Only add variables that the implemented application actually needs.

### 8.3 Example Backend Environment

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<configured-in-host-secret-manager>
SESSION_SECRET=<configured-in-host-secret-manager>
CLIENT_ORIGIN=https://academy.example.com
LOG_LEVEL=info
```

These values are illustrative.

Do not copy placeholders into a live deployment without replacing them through the approved configuration system.

### 8.4 Required Security Rules

- Do not commit `.env` secrets.
- Do not expose secrets through frontend builds.
- Do not print connection strings in deployment logs.
- Do not share production credentials through documentation.
- Maintain distinct secrets for separate environments.
- Validate required variables during server startup.

---

## 9. Domain and HTTPS Configuration

### 9.1 Domain Structure

A proposed domain arrangement is:

```text
academy.example.com       → React Frontend
api.example.com           → Express Backend
```

The final domain names are TBD.

### 9.2 HTTPS

All authenticated production traffic must use HTTPS.

### 9.3 Cookies and Sessions

For cookie-based authentication:

- Use HttpOnly cookies.
- Enable Secure cookies in production.
- Configure SameSite appropriately for the actual frontend/API origin relationship.
- Configure CSRF protection for applicable state-changing requests.
- Avoid unnecessary wildcard CORS configurations.
- Explicitly authorize credentialed frontend origins.
- Configure reverse-proxy trust only for trusted infrastructure.

### 9.4 Cross-Origin Deployment

Different frontend and backend origins require carefully configured:

- CORS.
- Cookie attributes.
- Credentialed requests.
- CSRF protection.
- Session expiration.
- HTTPS.

A successful local login does not prove that production cross-origin sessions work correctly.

---

## 10. Authentication and Authorization Deployment

The production backend must enforce the approved five-role policy.

### Current Roles

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Receptionist

**CONFIRMED:** Full approved Admissions and Fees access.

No independent access to:

- Finance.
- Expenses.
- Teacher Payroll.
- Audit Log.
- Branches.
- Users.
- Settings.

### Teacher

**CONFIRMED:** Access to own My Profile, timetable, assignments, salary, verified payments and payslips.

No access to another Teacher's confidential compensation.

### Multi-Branch Security

- Verify organization and branch ownership server-side.
- Support different roles in different branches.
- Fail closed for unsupported same-branch multiple-role combinations.
- Protect cross-branch records and exports.
- Revalidate permissions after role changes.

### Production Verification

Deployment is not ready merely because frontend navigation hides restricted modules.

Protected API requests must be tested directly.

---

## 11. Financial Deployment Requirements

Financial integrity is a release-critical area.

### Fees

- Use authoritative challan records.
- Count only applicable verified payments.
- Prevent duplicate collections.
- Preserve partial payments.
- Reject unsupported overpayments.
- Preserve receipts and payment history.

### Teacher Payroll

**CONFIRMED:** Salary is assignment/batch/subject-based, using a running payable balance.

- No automatic monthly salary generation.
- Preserve independent obligations.
- Preserve old agreements and payments.
- Use verified Fixed/Percentage formulas.
- Support approved partial/full payments.
- Reject duplicate salary disbursements.
- Maintain salary-to-expense consistency.
- Preserve Teacher self-only visibility.

### Financial Release Gate

Do not approve deployment of the financial backend unless relevant transaction, authorization, idempotency and reconciliation tests pass.

A rendered financial dashboard is not sufficient evidence of correct financial persistence.

---

## 12. CI/CD Architecture

The repository already has a CI history, so actual workflow files must be inspected before changes.

### Proposed Pipeline

```text
Developer Changes
       |
       v
Git Repository
       |
       v
CI Validation
       |
       +--> Dependency / Lockfile Checks
       +--> Relevant Tests
       +--> Build Verification
       +--> Security-Sensitive Configuration Checks
       |
       v
Approved Deployment Trigger
       |
       v
Preview / Staging Deployment
       |
       v
Smoke Tests
       |
       v
Approved Production Promotion
```

### CI Requirements

- Use repository-compatible package manager commands.
- Respect actual `Client/` and `Server/` paths.
- Fail on required test failures.
- Avoid unauthorized database migrations.
- Never expose secrets in workflow output.
- Do not automatically deploy unreviewed changes to production.
- Keep jobs efficient and appropriately scoped.

### Deployment Permissions

The deployment pipeline must only possess credentials required for its approved environment and actions.

Avoid using broad administrator credentials for ordinary CI tasks.

---

## 13. Git Branch and Release Strategy

The repository's existing branch conventions must be verified.

### General Rules

- Develop on the approved working branch.
- Preserve unrelated changes.
- Review the actual Git diff.
- Run relevant tests.
- Record the implementation status.
- Use approved release and deployment procedures.
- Do not force-push shared branches without explicit authorization.

### Important

Coding agents must not automatically commit, push or deploy unless the current ticket explicitly authorizes those actions.

Documentation completion does not authorize production deployment.

---

## 14. Preview and Staging Environment

A staging environment should be used to validate application integration before production.

### Staging Objectives

- Verify frontend-to-backend connectivity.
- Test real authentication.
- Test multi-branch role switching.
- Verify MongoDB persistence.
- Verify financial operations.
- Verify Teacher My Profile.
- Test reports and exports.
- Verify browser routing.
- Validate production-like CORS and cookies.
- Test rollback readiness.

### Staging Data

Use fictional or appropriately authorized test data.

Do not copy sensitive production records into staging without an approved data-protection procedure.

### Environment Separation

Staging and production must not accidentally share:

- Writable database resources.
- Session secrets.
- Test credentials with administrative authority.
- Backup deletion access.
- Unrestricted deployment permissions.

---

## 15. Client Demo Deployment

The initial project delivery includes a hosted demonstration for client testing.

### Demo Objectives

- Allow client access through an approved hosted URL.
- Preserve working frontend screens and workflows.
- Demonstrate five-role behavior.
- Demonstrate multiple branches.
- Demonstrate Admissions and Fees.
- Demonstrate faculty assignments.
- Demonstrate assignment-based Teacher Payroll.
- Demonstrate Teacher self-profile.
- Show financial summaries based on the available authoritative environment data.

### Demo Status Transparency

The deployment must clearly distinguish between:

- Frontend-only mock demonstration.
- Backend-integrated demonstration.
- Production-ready system.

Do not describe localStorage-backed operations as real multi-user server persistence.

### Demo Security

- Use fictional or authorized client test records.
- Avoid exposing production secrets.
- Use least-privilege demo accounts where possible.
- Protect administrative accounts.
- Do not present unsupported functionality as completed.

---

## 16. Application Health Checks

The backend should expose minimal health/readiness information.

### Proposed Endpoints

```http
GET /health
GET /ready
```

Exact endpoint paths are proposed.

### Liveness Check

Verifies that the application process is responding.

### Readiness Check

Verifies that the application can accept requests requiring its critical dependencies.

### Security Requirements

Health endpoints must not expose:

- Database passwords.
- Session secrets.
- Full environment configuration.
- Internal stack traces.
- Confidential operational records.

Monitoring providers may use these endpoints according to the approved deployment configuration.

---

## 17. Logging and Monitoring

The deployment must support investigation of failures without revealing confidential information.

### Application Logs

Useful metadata includes:

- Timestamp.
- Request ID.
- Route or operation.
- HTTP status.
- Duration.
- Safe error code.
- Relevant module.
- Authorized operational correlation information.

### Sensitive Information Restrictions

Do not log:

- Passwords.
- Session cookies.
- Secret tokens.
- MongoDB credentials.
- Full confidential student profiles.
- Unnecessary staff salary details.

### Monitoring Priorities

- Application availability.
- API errors.
- Database connectivity.
- Unhandled exceptions.
- Authentication failures.
- Failed financial operations.
- Slow database queries.
- Backup failures.
- Deployment failures.

### Alerting

Alert thresholds and delivery channels remain TBD.

Do not introduce paid monitoring services without a demonstrated need and approval.

---

## 18. Database Migration Management

Database schema changes and data migration require controlled procedures.

### Migration Requirements

1. Document the schema change.
2. Identify affected collections.
3. Review existing data.
4. Confirm required indexes.
5. Evaluate backward compatibility.
6. Prepare a backup where appropriate.
7. Test the migration in a safe environment.
8. Define rollback or forward-repair procedures.
9. Obtain required approval.
10. Execute and verify the change.

### Financial Migration

Migration must not:

- Recreate verified fee payments.
- Duplicate salary disbursements.
- Erase outstanding payroll obligations.
- Rewrite historical agreements without an approved mapping.
- Change course/subject fee results silently.
- Lose links between Payroll Payments and Expenses.

### Browser Mock Data

Importing browser localStorage data into MongoDB is not automatic.

It requires a separately approved migration/import workflow.

---

## 19. Backup Strategy

A production database must have a documented backup strategy.

### Backup Requirements

- Appropriate backup frequency.
- Retention policy.
- Secured storage.
- Restricted access.
- Encryption where supported.
- Recovery verification.
- Failure monitoring.
- Clearly assigned operational responsibility.

### Proposed Backup Categories

- Provider-managed database backups.
- Approved periodic database exports.
- Configuration/documentation backups.
- Application source history through Git.

Git is not a substitute for operational database backups.

### Important

Actual backup schedules and retention durations depend on the selected hosting/database plan and client recovery requirements.

No backup mechanism should be described as operational until configured and verified.

---

## 20. Restore and Disaster Recovery

### Recovery Objectives

Define:

- Recovery Point Objective (RPO).
- Recovery Time Objective (RTO).
- Restore permissions.
- Recovery environment.
- Data verification procedures.
- Service restart procedures.

### Restore Verification

A restore test should confirm:

1. Database can be restored.
2. Core records are accessible.
3. Student and enrollment links remain valid.
4. Verified payments remain consistent.
5. Payroll balances remain intact.
6. Salary Payment ↔ Expense relationships remain correct.
7. Application can reconnect safely.
8. Relevant audit history is preserved.

### Restrictions

Do not perform destructive restore tests against the active production database.

Do not claim disaster recovery readiness without actual recovery verification.

---

## 21. Rollback Strategy

Every production release should have a safe rollback or forward-recovery plan.

### Application Rollback

Where supported:

- Retain a known-good frontend build.
- Retain a known-good backend release.
- Preserve deployment metadata.
- Verify compatibility with the current database schema.

### Database Rollback

Database rollback is more complex because live transactions may have occurred after release.

Do not blindly restore an older database backup and discard valid recent payments.

### Financial Safety

A rollback must not silently remove:

- Verified fee collections.
- Valid salary payments.
- Posted payroll expenses.
- Admissions or enrollments completed during the deployment window.
- Required audit history.

Use an approved migration recovery strategy that preserves committed business data.

---

## 22. Deployment Security Checklist

Before accepting a production deployment, verify:

- [ ] HTTPS is enabled.
- [ ] Production secrets are stored securely.
- [ ] MongoDB is not publicly exposed to browsers.
- [ ] Database permissions are appropriately restricted.
- [ ] Authentication works.
- [ ] Session expiration and logout work.
- [ ] CSRF protection is configured where needed.
- [ ] CORS allows only approved origins.
- [ ] Five-role authorization is enforced.
- [ ] Admin privilege escalation is blocked.
- [ ] Receptionist Admissions/Fees permissions work.
- [ ] Receptionist independent Finance/Payroll access is denied.
- [ ] Teacher own-profile access works.
- [ ] Another Teacher's salary is inaccessible.
- [ ] Cross-branch unauthorized access is denied.
- [ ] Branch creation pause is enforced.
- [ ] Inputs and financial amounts are validated.
- [ ] Sensitive error messages are safe.
- [ ] Sensitive exports enforce authorization.
- [ ] Audit requirements are satisfied.

These checkboxes are acceptance requirements, not claims of completion.

---

## 23. Financial Integrity Checklist

Before enabling financial workflows:

- [ ] Valid challans are created once.
- [ ] Fee calculation matches the frontend.
- [ ] Verified payments are recorded correctly.
- [ ] Unverified payments do not inflate revenue.
- [ ] Partial payments are supported.
- [ ] Fee overpayment is prevented.
- [ ] Duplicate collection is prevented.
- [ ] Fixed/Percentage salary calculation matches existing source.
- [ ] Payroll remains assignment-based.
- [ ] New months do not auto-generate salary.
- [ ] Previous outstanding balances are preserved.
- [ ] Salary partial/full payments work.
- [ ] Duplicate payroll disbursement is prevented.
- [ ] Salary Payments and Posted Expenses reconcile.
- [ ] Finance and Reports agree with authoritative records.
- [ ] Financial concurrency tests pass.

---

## 24. Frontend Integration Checklist

Before considering backend integration complete:

- [ ] Existing frontend services use approved HTTP adapters.
- [ ] API URL configuration is correct.
- [ ] Authentication is backend-enforced.
- [ ] Active branch switching works.
- [ ] Previous-branch records do not leak.
- [ ] Admissions workflows remain compatible.
- [ ] Student and Enrollment relationships remain correct.
- [ ] Courses and Batches load correctly.
- [ ] Fees and receipts work.
- [ ] Faculty assignments and schedules work.
- [ ] Teacher Payroll calculations remain compatible.
- [ ] Teacher My Profile works.
- [ ] Expenses and Finance totals are correct.
- [ ] Demo Classes work.
- [ ] Physical Assets work.
- [ ] Reports and exports work.
- [ ] Settings and branding remain functional.
- [ ] Relevant regression tests pass.

---

## 25. Deployment Procedure

The following is the proposed controlled deployment sequence.

### Step 1 — Confirm Scope

- Confirm the target environment.
- Confirm the approved release.
- Verify Git status.
- Review relevant changed files.
- Confirm required credentials and access.

### Step 2 — Verify Code

- Run targeted tests.
- Run required build checks.
- Review security-sensitive changes.
- Verify API contract compatibility.
- Check unresolved blockers.

### Step 3 — Prepare Database

- Confirm database accessibility.
- Confirm environment isolation.
- Verify indexes and migration requirements.
- Create the approved backup where appropriate.
- Do not import mock data without approval.

### Step 4 — Deploy Backend

- Configure server environment variables.
- Deploy the approved backend revision.
- Verify startup and database connectivity.
- Check liveness/readiness.
- Verify authentication and protected API behavior.

### Step 5 — Deploy Frontend

- Configure the correct API URL.
- Build the approved React revision.
- Deploy frontend assets.
- Verify SPA routing and static assets.
- Test frontend/backend cookie and CORS behavior.

### Step 6 — Run Smoke Tests

Check:

- Login/logout.
- Branch selection.
- Role-specific dashboard.
- Basic academic data reads.
- Admissions.
- Fees.
- Teacher My Profile.
- Approved salary information.
- Reports.
- Health endpoint.

Do not perform irreversible financial test operations against production unless specifically authorized.

### Step 7 — Verify Monitoring

- Review application errors.
- Review database connectivity.
- Verify logs are safe.
- Check resource utilization.
- Confirm backup/rollback readiness.

### Step 8 — Record Outcome

Document:

- Release identifier.
- Target environment.
- Deployed frontend/backend revisions.
- Actual tests performed.
- Results.
- Known issues.
- Rollback decision, if relevant.

---

## 26. Smoke Testing

Smoke tests should establish that the deployed application is usable.

### Minimum Critical Paths

| Module | Verification |
|---|---|
| Authentication | Authorized login and logout |
| Branches | Authorized branch selection |
| Dashboard | Role-appropriate data loads |
| Admissions | Read and permitted workflow |
| Students | Correct permitted records |
| Fees | Authorized challan/payment information |
| Faculty | Teaching assignment information |
| Payroll | Assignment-based running balance |
| Teacher Profile | Own schedule, salary and payslip |
| Finance | Correct authorized summary |
| Reports | Scoped results and exports |
| Settings | Existing approved branding works |

A smoke test is not a replacement for full transaction and security testing.

---

## 27. Release Readiness Levels

Use clear status labels.

### FRONTEND_DEMO

The React frontend is hosted and may still use mock/local persistence.

### BACKEND_STAGING

The application is connected to a nonproduction backend/database and undergoing integration testing.

### RELEASE_CANDIDATE

The targeted application version has passed its required technical verification.

### PRODUCTION_DEPLOYED

The approved production release has actually been deployed.

### OWNER_ACCEPTED

The product owner has explicitly accepted the relevant delivered scope.

### Important

Do not label a frontend-only demo as a production backend.

Do not claim client acceptance from automated testing alone.

---

## 28. Operational Maintenance

Once deployed, ongoing responsibilities may include:

- Security updates.
- Dependency updates.
- Database health review.
- Backup verification.
- Controlled releases.
- Log monitoring.
- Incident investigation.
- Permission audits.
- Periodic financial reconciliation.
- Capacity monitoring.

These activities require suitable operational ownership and approved procedures.

---

## 29. Deployment Incident Management

An incident may include:

- Backend unavailable.
- Database connectivity failure.
- Authentication outage.
- Unauthorized data exposure.
- Duplicate fee collection.
- Incorrect payroll balance.
- Failed salary-to-expense posting.
- Corrupt or inconsistent data.
- Failed deployment.

### Incident Response Priorities

1. Protect confidential data and preserve evidence.
2. Stop unsafe operations where needed.
3. Identify affected services and records.
4. Assess financial integrity.
5. Apply approved recovery procedures.
6. Verify corrected behavior.
7. Record the incident and relevant changes.
8. Avoid making silent financial corrections.

Any financial repair must follow a separately approved correction workflow.

---

## 30. Cost and Resource Management

The initial deployment should be appropriate for a single academy with multiple branches.

### Cost Considerations

- Frontend hosting.
- Backend hosting.
- MongoDB plan.
- Domain registration.
- Backup retention.
- Monitoring.
- Network transfer.
- Optional third-party services.

### Rules

- Avoid unnecessary infrastructure.
- Prefer predictable operating costs.
- Check plan-specific limits before selection.
- Do not assume free-tier services guarantee uptime or persistent execution.
- Do not add paid providers without approval.

Actual hosting costs and plan capabilities must be verified at the time of provider selection.

---

## 31. Environment Promotion Policy

Changes should move through approved environments.

```text
Development
     |
     v
Automated Tests
     |
     v
Preview / Staging
     |
     v
Integration and Security Checks
     |
     v
Approved Release
     |
     v
Production
```

### Requirements

- Separate credentials.
- Separate operational data.
- Reproducible builds.
- Traceable release revision.
- Verified database compatibility.
- Controlled deployment permissions.

Do not automatically promote failing or unreviewed builds.

---

## 32. Deferred Deployment Architectures

The following are deferred until separately justified and approved.

### Electron

Desktop packaging of the academy system.

### LAN/Offline

Local-network access, offline data storage and synchronization.

### Multi-Client SaaS

Organization onboarding, license/subscription management and Platform Admin.

### Realtime Services

WebSocket-based live updates.

### Redis or Queues

Caching and background jobs where needed.

### Cloudinary

Digital media and file-upload services.

The initial hosted ERP should not require these components by default.

---

## 33. Testing and Acceptance Requirements

Before a backend-integrated release is considered ready:

- Relevant unit tests must pass.
- Relevant API tests must pass.
- Database transaction tests must pass.
- Authentication and RBAC tests must pass.
- Branch isolation tests must pass.
- Financial integrity tests must pass.
- Teacher My Profile security tests must pass.
- Frontend regression tests must pass.
- Deployment smoke tests must pass.
- Critical known issues must be addressed or explicitly accepted.
- Backup/recovery procedures must meet the environment's approved requirements.

Only actual executed checks may be reported as passed.

---

## 34. Open Deployment Decisions

The following remain TBD:

- Backend hosting provider.
- MongoDB hosting provider and plan.
- Domain and DNS ownership.
- Exact Node.js runtime version.
- Environment naming.
- Production session secret rotation policy.
- Production session and cookie configuration.
- CI/CD release triggers.
- Deployment approvals.
- Backup frequency.
- Retention durations.
- RPO and RTO.
- Monitoring and alerting provider.
- Final data migration policy.
- Production launch timing.
- Client acceptance process.

Do not treat proposed configuration as finalized.

---

## 35. Related Documentation

This document must remain consistent with:

- `AGENTS.md` — Coding-agent instructions.
- `RULES.md` — Engineering standards.
- `PRD.md` — Product requirements.
- `SYSTEM_DESIGN.md` — Business workflows.
- `ARCHITECTURE.md` — System architecture.
- `SECURITY.md` — Authentication and security.
- `RBAC_PERMISSIONS.md` — Role authorization.
- `TENANT_BRANCH_ISOLATION.md` — Data isolation.
- `DATABASE.md` — MongoDB design.
- `ERD.md` — Entity relationships.
- `API.md` — REST API design.
- `API_CONTRACTS.md` — HTTP contracts.
- `BUSINESS_RULES.md` — Domain rules.
- `DATA_FLOW.md` — Cross-module data flow.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial atomicity.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Development roadmap.
- `BACKEND_TESTING_STRATEGY.md` — Testing requirements.
- `FRONTEND_INTEGRATION.md` — Frontend integration.
- `FRONTEND_BACKEND_HANDOFF.md` — Backend handoff.
- `BACKEND_GAPS_AND_RISKS.md` — Known risks.
- `TASKS.md` — Development tracking.
- `MEMORY.md` — Owner decisions.
- `PROGRESS.md` — Verified implementation history.

Relative Markdown links must be adjusted to the actual repository file structure.

---

## 36. Final Implementation Boundary

### Confirmed

- React/Vite frontend.
- Node.js/Express backend direction.
- MongoDB/Mongoose database.
- One academy with multiple branches.
- Five frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only profile and salary access.
- Assignment-based running Payroll.
- No automatic monthly salary generation.
- Existing hosted web demo direction.
- Current branch creation pause.
- Physical Assets without media uploads.

### Proposed

- Vercel frontend configuration.
- Separate Node.js backend hosting.
- MongoDB Atlas hosting.
- Secure session/cookie deployment.
- CI/CD release workflow.
- Backup and recovery procedures.
- Monitoring and operational processes.

### Deferred

- Platform Admin and multi-client SaaS.
- Electron desktop deployment.
- LAN/offline synchronization.
- Cloudinary/media uploads.
- Premature distributed infrastructure.

### Not Verified

- Final production hosting providers.
- Live Express API deployment.
- Production MongoDB connectivity.
- Configured production authentication.
- Tested production backups.
- Production release acceptance.

**Governing Principle:** Deploy TSA Academy ERP as a secure, maintainable hosted web application that preserves approved frontend behavior, protects academic and financial records, enforces authorization and branch isolation, and supports safe releases and recovery.

**Document Status:** DRAFT — Ready for deployment architecture review. Deployment requires separately approved implementation and release actions.
