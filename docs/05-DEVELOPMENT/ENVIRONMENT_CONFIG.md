# ENVIRONMENT_CONFIG

<!-- > Purpose: Documents environment variables and safe development, testing and production configuration. -->

# TSA Academy ERP — Environment Configuration Specification

**Document:** ENVIRONMENT_CONFIG.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Proposed Configuration; Production Settings Not Finalized
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Repository Directories:** `Client/` and `Server/`

---

## 1. Purpose

This document establishes environment configuration standards for TSA Academy ERP.

Its purpose is to ensure that frontend and backend services operate correctly and securely across local development, automated testing, client demonstrations, staging and production environments.

The specification covers:

- Environment separation.
- Frontend configuration.
- Backend configuration.
- MongoDB connectivity.
- Authentication and session secrets.
- API connectivity.
- CORS and cookie configuration.
- Configuration validation.
- Logging settings.
- Testing configuration.
- Deployment secrets.
- Environment troubleshooting.
- Security requirements.

**Important:** This document defines proposed configuration standards. It does not authorize creating or modifying real `.env` files, changing credentials, installing dependencies or deploying services.

---

## 2. Configuration Principles

### ENV-001 — Separate Code and Configuration

Application source code must not contain production passwords, database credentials or private service secrets.

### ENV-002 — Environment Isolation

Development, testing, staging and production must use appropriately separated configuration and data.

### ENV-003 — Least Privilege

Each environment must have only the access required for its approved operations.

### ENV-004 — Validation at Startup

The backend must validate required configuration before accepting normal application traffic.

### ENV-005 — No Secret Exposure

Never expose backend secrets through Vite frontend environment variables, API responses or logs.

### ENV-006 — Explicit Defaults

Safe defaults may be used for local development, but sensitive production configuration must be explicitly provided.

### ENV-007 — Frontend Compatibility

Configuration changes must preserve the approved React frontend and its service interfaces.

### ENV-008 — Minimal Infrastructure

Do not require Redis, Cloudinary, queues or additional providers unless their features are separately approved.

### ENV-009 — Configuration Traceability

Environment variable additions and changes must be documented with their purpose and security classification.

### ENV-010 — No Unapproved Mutations

Documentation does not authorize modifying real credentials or deployment settings.

---

## 3. Environment Types

TSA Academy ERP may use the following environments.

| Environment | Purpose | Database |
|---|---|---|
| Local Development | Developer implementation and debugging | Local or dedicated development MongoDB |
| Automated Testing | Isolated unit and integration verification | Dedicated disposable test MongoDB |
| Preview / Client Demo | Hosted demonstration and client evaluation | Approved demo database if backend-integrated |
| Staging | Preproduction integration and release verification | Dedicated staging database |
| Production | Actual live academy operations | Protected production database |

### Requirements

- Do not share production database credentials with tests.
- Do not run destructive test fixtures in production.
- Do not assume preview data is production data.
- Avoid reusing sensitive session secrets across environments.
- Clearly identify which environment an application instance belongs to.
- Prevent accidental connections from a local development server to production resources.

### Demo Clarification

A frontend-only demo may still use browser-local mock persistence.

A backend-integrated demo must clearly identify its own authoritative database.

A hosted URL alone does not prove that real backend persistence is active.

---

## 4. Repository Configuration Structure

Preserve the existing directory names exactly.

```text
Academy/
├── Client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example       # Proposed example configuration
├── Server/
│   ├── src/
│   ├── package.json
│   └── .env.example       # Proposed example configuration
├── docs/
│   └── 05-DEVELOPMENT/
│       └── ENVIRONMENT_CONFIG.md
├── AGENTS.md
└── README.md
```

This is illustrative. The actual repository layout must be inspected before adding or moving files.

### Configuration Rules

- Keep frontend-specific configuration in `Client/`.
- Keep backend-specific configuration in `Server/`.
- Do not create multiple conflicting `.env` files without a clear environment purpose.
- Use example files for variable documentation without storing real credentials.
- Do not modify existing project folder capitalization.

---

## 5. Frontend Environment Configuration

The React frontend uses Vite.

Vite exposes variables prefixed with `VITE_` to browser-side application code.

**These variables must be treated as public.**

### 5.1 Proposed Frontend Variables

| Variable | Purpose | Sensitive? |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for backend REST APIs | No |
| `VITE_APP_ENV` | Public environment label | No |
| `VITE_APP_NAME` | Optional public application display name | No |

Only add variables actually required by the implementation.

Existing academy branding may come from authorized application Settings rather than an environment variable.

### 5.2 Example `Client/.env.example`

```env
# Public API endpoint used by the React application.
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Non-sensitive environment label.
VITE_APP_ENV=development
```

These are examples, not proof that the current frontend already reads these variables.

### 5.3 Frontend Security Rules

Never store:

- MongoDB URI.
- MongoDB password.
- Session signing secret.
- Staff password hashes.
- Private API tokens.
- Backup credentials.
- Production administrator credentials.

Anything bundled into frontend JavaScript must be assumed visible to users.

### 5.4 Build-Time Configuration

Vite client environment variables are generally incorporated into the frontend build.

Changing the configured API URL may require rebuilding or redeploying the frontend unless a separate runtime configuration mechanism is implemented.

Do not assume changing a hosting variable updates an already-generated static build automatically.

---

## 6. Backend Environment Configuration

The Node.js/Express backend must read sensitive configuration from its authorized server environment.

### 6.1 Proposed Backend Variables

| Variable | Purpose | Requirement |
|---|---|---|
| `NODE_ENV` | Runtime environment classification | Required in deployed environments |
| `PORT` | HTTP listener port | Provider-supplied or configured |
| `MONGODB_URI` | MongoDB connection string | Required for MongoDB-backed operations |
| `SESSION_SECRET` | Session-signing key if required by selected auth implementation | Required when applicable |
| `CLIENT_ORIGIN` | Approved frontend origin | Required for configured CORS policy |
| `LOG_LEVEL` | Logging verbosity | Optional |
| `TRUST_PROXY` | Trusted reverse-proxy behavior | Environment-specific |
| `SESSION_COOKIE_NAME` | Session cookie identifier | Optional/configurable |

These names are **PROPOSED**. Final definitions must match the implemented configuration module and authentication design.

### 6.2 Example `Server/.env.example`

```env
# Application execution environment.
NODE_ENV=development

# Local HTTP port. Production may supply its own PORT.
PORT=5000

# Use a dedicated local/development database.
MONGODB_URI=mongodb://127.0.0.1:27017/tsa_academy_dev

# Set securely in the real environment when the session library requires it.
SESSION_SECRET=REPLACE_WITH_SECURE_LOCAL_SECRET

# Approved local frontend origin.
CLIENT_ORIGIN=http://localhost:5173

# Application logging verbosity.
LOG_LEVEL=debug

# Trust reverse proxies only when correctly configured.
TRUST_PROXY=false
```

Do not deploy the placeholder session secret.

Do not copy this sample into production unchanged.

---

## 7. Local Development Configuration

### Frontend

The actual frontend development command must be obtained from `Client/package.json`.

The standard Vite development port is often `5173`, but the actual project configuration must be checked.

### Backend

The actual backend command must come from `Server/package.json`.

The previously used local API port may be `5000`, but the backend must honor its configured or assigned port.

### MongoDB

Local development may use a local MongoDB instance or a dedicated remote development database.

### Proposed Local Connection

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
API:      http://localhost:5000/api/v1
MongoDB:  mongodb://127.0.0.1:27017/tsa_academy_dev
```

These addresses are illustrative and must be verified against actual repository settings.

### Local Development Rules

1. Use development-only credentials.
2. Keep local configuration outside committed secret files.
3. Never point automated tests at the production database.
4. Confirm both frontend and backend origins.
5. Verify CORS and session transport.
6. Preserve existing frontend mock mode until the HTTP adapter is implemented and approved.
7. Do not assume the backend is empty; inspect existing `Server/` files.

---

## 8. MongoDB Configuration

MongoDB will become the authoritative backend persistence layer.

### Required Configuration

- Database connection URI.
- Connection authentication.
- Appropriate database selection.
- Connection timeout behavior.
- Connection pool configuration where justified.
- TLS settings for deployed databases.
- Error handling.
- Shutdown cleanup.

### Security Requirements

- Store database credentials only on the backend.
- Use a database user with appropriate least-privilege access.
- Restrict network connectivity where supported.
- Avoid exposing the database to browsers.
- Do not log the complete connection URI.
- Keep test and production databases separate.

### Transaction Support

The backend's financial and multi-record workflows require a transaction-capable MongoDB deployment.

The chosen local, test, staging and production database configurations must be verified for transaction support when transaction-dependent features are tested.

### Connection Failure Behavior

If an essential MongoDB connection is unavailable:

- The backend must not falsely report database readiness.
- Sensitive writes must not silently fall back to local memory.
- Errors must be logged safely.
- Health/readiness behavior must reflect the actual dependency state.

---

## 9. Configuration Validation

Backend configuration must be validated during application startup.

### Required Checks

- Missing required variables.
- Invalid port values.
- Invalid MongoDB URI format.
- Unsupported environment labels.
- Invalid approved frontend origin.
- Missing session secret when required.
- Incorrect proxy configuration where security depends on it.

### Failure Policy

Critical invalid configuration should prevent normal server startup or readiness, rather than silently disabling security controls.

### Sensitive Logging

Error messages may identify the missing variable name but must not print its secret value.

### Configuration Schema

A centralized configuration-validation module is recommended.

The final validation library must follow repository standards and an approved implementation ticket.

---

## 10. Environment Loading

The backend must use a consistent configuration-loading approach.

### Requirements

- Load configuration before initializing dependent services.
- Avoid reading unvalidated raw environment values throughout the application.
- Use a centralized configuration object or module.
- Apply safe environment-specific defaults.
- Keep secret values inaccessible to frontend components.
- Do not mutate `process.env` unpredictably during normal operations.

### Testing

Automated tests should inject or load isolated test configuration.

Tests must not depend on the developer's personal local `.env` file.

---

## 11. Session and Cookie Configuration

Production authentication is planned around secure server-managed sessions, subject to final technical approval.

### Proposed Session Configuration Categories

| Setting | Purpose |
|---|---|
| Session secret | Protect session integrity where required |
| Session storage | Maintain server-side session records |
| Cookie name | Identify the session cookie |
| HttpOnly | Prevent JavaScript from directly reading the cookie |
| Secure | Send cookie only over HTTPS where enabled |
| SameSite | Define browser cross-site cookie behavior |
| Lifetime | Define session expiration |
| Rolling renewal | Optional session refresh policy |
| Revocation | Invalidate existing sessions after selected events |

### Production Rules

- Use HTTPS.
- Configure Secure cookies.
- Use HttpOnly.
- Configure SameSite according to actual frontend/backend deployment.
- Avoid overly broad cookie domain settings.
- Support logout and session revocation.
- Never use placeholder secrets.

### Reverse Proxy Configuration

If the backend is behind a trusted HTTPS-terminating proxy, Express trust-proxy settings must match the actual hosting topology.

Do not enable unrestricted proxy trust without validating the deployment infrastructure.

---

## 12. CORS Configuration

The browser frontend may communicate with a separately hosted backend origin.

### Development Example

```text
Frontend origin: http://localhost:5173
Backend origin:  http://localhost:5000
```

### Production Example

```text
Frontend origin: https://academy.example.com
Backend origin:  https://api.example.com
```

Production URLs are placeholders.

### Requirements

- Allow only approved origins.
- Explicitly configure credentialed requests when session cookies are used.
- Do not combine wildcard origins with credentialed access.
- Allow only required methods and headers.
- Use environment-specific origin lists.
- Verify browser preflight requests.

### Important

CORS does not replace authentication, authorization or CSRF protection.

---

## 13. CSRF Configuration

Cookie-authenticated state-changing requests require an appropriate CSRF mitigation strategy.

### Security Requirements

- Protect relevant POST, PATCH, PUT and DELETE requests.
- Validate approved origin context where appropriate.
- Configure SameSite cookies as defense in depth.
- Use a suitable CSRF token or equivalent approved mitigation where required.
- Verify behavior across frontend and backend deployment origins.

The final mechanism must be selected when the actual authentication transport is implemented.

Do not invent a CSRF token environment variable until the implementation requires it.

---

## 14. Role and Branch Configuration

The application's current roles are business data and centralized authorization definitions, not secrets stored in `.env` files.

### Five Roles

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Mandatory Business Requirements

- Receptionist Full approved Admissions and Fees access.
- Receptionist denied independent Finance, Expenses and Payroll.
- Teacher access to own My Profile and compensation.
- Teacher denied another Teacher's salary.
- Admin privilege restrictions.
- Different roles across authorized branches.
- Same-branch unsupported multi-role combinations fail closed.
- Current branch creation pause.

### Configuration Rule

Do not use environment variables to silently grant a role broader permissions than the approved permission registry.

Branch assignments and business permissions must be managed through the authorized application data model.

---

## 15. Financial Configuration

Financial business behavior must not be changed through undocumented deployment settings.

### Fee Configuration

Course fees, subject fees and approved challan rules belong to the domain data model.

### Payroll Configuration

Teacher Payroll is assignment-based running remuneration.

Do not introduce environment variables such as:

```text
AUTO_GENERATE_MONTHLY_PAYROLL=true
```

Such a feature contradicts the current approved payroll model.

### Monetary Precision

The exact representation and rounding strategy must be approved in the database/API specifications.

Do not configure arbitrary environment-dependent rounding that changes financial results between development and production.

---

## 16. Logging Configuration

Logging behavior may vary by environment.

### Proposed `LOG_LEVEL`

Examples of candidate levels:

- `error`
- `warn`
- `info`
- `debug`

### Guidelines

**Development**

May use more detailed safe diagnostic logs.

**Testing**

Should produce deterministic, relevant failure information.

**Production**

Should use structured operational logging without exposing confidential data.

### Sensitive Values

Do not log:

- Passwords.
- Session secrets.
- MongoDB credentials.
- Full private tokens.
- Confidential salary records unnecessarily.
- Unneeded student personal information.

Logging configuration must not disable required security or audit functionality.

---

## 17. Frontend Mock Mode and Backend Mode

The current frontend uses local mock services.

The future frontend will use HTTP-backed services.

### Required Transition

```text
Current:
React Page → Domain Service → Mock Adapter → localStorage

Future:
React Page → Domain Service → HTTP Adapter → Express API → MongoDB
```

### Rules

- Preserve current frontend service contracts.
- Avoid changing component business behavior during adapter replacement.
- Do not mix mock and live financial sources in one authoritative view.
- Do not silently upload localStorage data.
- Keep environment-specific mode selection explicit if a temporary dual-mode arrangement is approved.
- Prevent production operation from accidentally falling back to mock persistence.

A mock/live mode variable should only be introduced if the actual integration design requires one.

---

## 18. Testing Environment Configuration

Automated backend tests must use isolated settings.

### Requirements

- Dedicated test database.
- Test-only credentials.
- Deterministic fixture configuration.
- Independent session settings.
- No production connection strings.
- Controlled test cleanup.
- Transaction-capable MongoDB environment for transaction tests.

### Suggested Naming

A database name such as `tsa_academy_test` may be used in examples, but the actual test configuration must be verified.

### Critical Safety Gate

Before destructive test setup or cleanup, verify that the database connection targets an explicitly approved test environment.

Never assume a name containing "test" is sufficient proof that a remote database is safe to delete.

---

## 19. Staging Configuration

Staging should approximate production where necessary for integration verification.

### Requirements

- Dedicated MongoDB data.
- HTTPS.
- Production-like authentication transport.
- Realistic CORS and cookie configuration.
- Safe fictional or authorized test fixtures.
- Separate deployment secrets.
- Relevant health checks.
- Controlled release verification.

### Staging Testing

Verify:

- Login/logout.
- Authorized branch switching.
- Five-role permissions.
- Admissions and Fees.
- Teacher My Profile.
- Running Teacher Payroll.
- Financial consistency.
- API errors and frontend integration.

No production data should be copied into staging without an approved protection procedure.

---

## 20. Production Configuration

Production must use explicit, secure configuration.

### Required Categories

- Approved frontend domain.
- Approved backend domain.
- MongoDB production connection.
- Secure session configuration.
- Correct CORS.
- CSRF controls.
- HTTPS.
- Logging.
- Health/readiness.
- Backup configuration.
- Relevant monitoring.

### Restrictions

- No default development passwords.
- No local test database.
- No placeholder session secret.
- No wildcard credentialed CORS.
- No browser-exposed backend secrets.
- No automatic fallback to localStorage for authoritative operations.
- No unapproved monthly payroll or financial correction features.

Production configuration must be tested rather than assumed correct.

---

## 21. Environment Secret Management

### Recommended Practices

1. Use a trusted hosting provider's secret configuration.
2. Limit who can read or change secrets.
3. Use separate secrets for different environments.
4. Rotate secrets after suspected compromise.
5. Avoid sharing secrets in chat logs or documentation.
6. Never commit `.env` files containing real secrets.
7. Review access when a staff member or service no longer requires it.

### Secret Rotation

Rotation procedures should consider:

- Session invalidation.
- Database credential changes.
- Application redeployment.
- Service continuity.
- Rollback implications.

Do not rotate live secrets automatically without an approved operational process.

---

## 22. Environment File Git Rules

### Recommended Policy

- Commit safe `.env.example` templates where needed.
- Ignore real `.env` secret files.
- Preserve the repository's existing `.gitignore` conventions.
- Do not delete existing configuration without inspection.
- Do not print secrets in Git diffs.
- Do not commit production database URIs with passwords.

If a secret is accidentally committed, removing it from the newest commit is not sufficient by itself. The exposed credential must be treated as compromised and rotated through an approved process.

---

## 23. Configuration and Build Validation

Before deploying:

### Frontend

- Verify the required public API URL.
- Verify the existing Vite build command.
- Verify correct environment selection.
- Verify client-side routing.
- Confirm no secrets are bundled into output assets.

### Backend

- Verify required environment variables.
- Verify MongoDB connectivity.
- Verify session configuration.
- Verify CORS/CSRF settings.
- Verify safe logging.
- Verify health/readiness.
- Verify the correct runtime command.

### Integration

- Confirm frontend requests reach the intended backend.
- Confirm sessions function across actual deployed origins.
- Confirm branch context is authorized.
- Confirm financial transactions use the intended database.

---

## 24. Configuration Testing

Future implementation tickets should verify:

| Test ID | Scenario | Expected result |
|---|---|---|
| ENV-001 | Valid local configuration | Application starts |
| ENV-002 | Missing required MongoDB URI | Safe startup/readiness failure |
| ENV-003 | Invalid configured port | Validation error |
| ENV-004 | Missing required session secret | Safe failure |
| ENV-005 | Unauthorized CORS origin | Browser access not authorized |
| ENV-006 | Approved origin | Intended request works |
| ENV-007 | Production cookie security | Correct security flags |
| ENV-008 | Disabled user session | Access denied |
| ENV-009 | Test database isolated | No production mutation |
| ENV-010 | Secret missing in production | No insecure placeholder fallback |
| ENV-011 | Incorrect frontend API URL | Clear connection failure |
| ENV-012 | Role/branch change | Updated server authorization enforced |
| ENV-013 | Backend database unavailable | No false successful financial writes |
| ENV-014 | Production built frontend | No private backend secrets exposed |

Actual assertions must match the final approved session and deployment design.

No test may be reported PASS without execution.

---

## 25. Configuration Troubleshooting

### Frontend Cannot Reach Backend

Check:

- Configured API base URL.
- Backend availability.
- HTTPS mixed-content issues.
- Browser network response.
- CORS.
- Deployment origin and routing.

### Login Works Locally but Not in Production

Check:

- Cookie Secure/SameSite policy.
- Credentialed frontend requests.
- Approved origins.
- CSRF handling.
- Trusted proxy configuration.
- Session storage and expiration.

### MongoDB Connection Failure

Check:

- URI presence and validity.
- Database user privileges.
- Network access.
- TLS configuration.
- Provider availability.
- Startup/readiness logs.

Do not print the complete secret-bearing MongoDB URI during troubleshooting.

### Branch Data Appears Incorrect

Check:

- Authenticated identity.
- Active branch selection.
- Current branch membership.
- Server-side scope filters.
- Frontend cache invalidation.
- Stale requests.

### Financial Totals Differ

Check:

- Connected database/environment.
- Verified Fee Payments.
- Posted Expenses.
- Assignment-based Payroll records.
- Calculation compatibility.
- Cache invalidation.

Do not silently alter transaction history to make totals match.

---

## 26. Deployment Environment Matrix

| Configuration area | Development | Testing | Staging | Production |
|---|---|---|---|---|
| Frontend host | Local Vite | Test runner | Preview/staging host | Approved production host |
| Backend host | Local Node.js | Isolated test server | Hosted API | Approved production API |
| MongoDB | Dev database | Disposable test database | Dedicated staging database | Protected production database |
| HTTPS | Optional local setup | Test-dependent | Required for realistic session verification | Required |
| Credentials | Dev only | Test only | Staging only | Production secrets |
| Logging | Debug-safe | Test-focused | Operational | Structured/safe |
| Financial test writes | Fictional dev data | Isolated fixtures | Authorized test data | No uncontrolled test writes |
| Backups | Optional dev strategy | Generally disposable | As approved | Required approved strategy |

Actual hosting arrangements must be verified before deployment.

---

## 27. Configuration Change Management

Every significant configuration change should include:

- Purpose.
- Affected environment.
- New or modified variable.
- Whether it is secret.
- Default behavior.
- Required deployment steps.
- Relevant tests.
- Rollback considerations.

### Sensitive Change Examples

- Session-secret rotation.
- MongoDB URI replacement.
- Frontend origin changes.
- Cookie domain configuration.
- New production environment.
- Authentication provider changes.

Configuration changes that affect security or financial persistence require additional verification.

---

## 28. Explicitly Deferred Configuration

Do not introduce environment variables or required services for:

- Cloudinary.
- Redis.
- RabbitMQ.
- Third-party SMS.
- Multi-client SaaS billing.
- Platform Admin provisioning.
- Automatic monthly salary generation.
- Unapproved refunds or financial reversals.
- Electron/LAN synchronization.

Such components require a separately approved product and implementation decision.

---

## 29. Environment Readiness Checklist

### Frontend

- [ ] Correct frontend host configured.
- [ ] Correct Vite build command verified.
- [ ] Correct API base URL configured.
- [ ] No private secrets exposed.
- [ ] Client-side routes work.

### Backend

- [ ] Correct Node.js runtime selected.
- [ ] Required environment variables validated.
- [ ] Backend starts successfully.
- [ ] MongoDB connection verified.
- [ ] Health/readiness behavior tested.
- [ ] Secure session configuration applied.
- [ ] CORS and CSRF configured.
- [ ] Sensitive logs protected.

### Database

- [ ] Correct target environment selected.
- [ ] Least-privilege credentials used.
- [ ] Network access restricted.
- [ ] Transaction support verified.
- [ ] Relevant backup policy available.

### Security and Business Behavior

- [ ] Five-role permissions verified.
- [ ] Branch isolation verified.
- [ ] Receptionist Admissions/Fees access verified.
- [ ] Teacher My Profile access verified.
- [ ] Financial write safety verified.
- [ ] Assignment-based Payroll preserved.
- [ ] No automatic monthly salary generation.
- [ ] No production fallback to mock financial data.

These checklist items are requirements, not completed implementation claims.

---

## 30. Open Decisions

The following remain to be finalized:

- Actual production frontend domain.
- Actual production backend domain.
- Backend hosting provider.
- MongoDB hosting provider and plan.
- Final session store.
- Session lifetime.
- Session signing/rotation configuration.
- Cookie domain and SameSite policy.
- Final CSRF implementation.
- Final CORS origin list.
- Exact Node.js version.
- Log retention and monitoring provider.
- Test database infrastructure.
- Production secrets management process.
- Backup schedule and retention.
- Final frontend mock-to-HTTP mode configuration.

Do not invent final production values.

---

## 31. Related Documentation

This specification must remain aligned with:

- `DEPLOYMENT.md` — Deployment and hosting strategy.
- `SETUP.md` — Local project setup.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication design.
- `SECURITY.md` — Security architecture.
- `ARCHITECTURE.md` — Backend structure.
- `DATABASE.md` — MongoDB design.
- `DATABASE_MIGRATIONS.md` — Migration procedures.
- `API.md` — REST API architecture.
- `API_CONTRACTS.md` — API communication contracts.
- `RBAC_PERMISSIONS.md` — Role authorization.
- `TENANT_BRANCH_ISOLATION.md` — Branch and record ownership.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Development sequence.
- `BACKEND_TESTING_STRATEGY.md` — Test requirements.
- `LOGGING_AND_MONITORING.md` — Operational visibility.
- `BUSINESS_RULES.md` — Business constraints.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial data integrity.
- `FRONTEND_INTEGRATION.md` — Frontend service mapping.
- `RULES.md` — Engineering standards.
- `AGENTS.md` — Agent instructions.
- `MEMORY.md` — Owner-approved decisions.
- `PROGRESS.md` — Verified development history.

Use actual repository locations when inserting relative Markdown links.

---

## 32. Final Implementation Boundary

### Confirmed

- Frontend uses React + Vite.
- Backend direction is Node.js + Express.
- Database is MongoDB + Mongoose.
- Repository directories are `Client/` and `Server/`.
- Five current frontend roles.
- Receptionist Full approved Admissions and Fees access.
- Teacher self-only profile and compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- Multiple authorized branches.
- Current branch creation pause.
- Initial hosted web deployment.

### Proposed

- `VITE_API_BASE_URL`.
- Backend MongoDB and session environment variables.
- Environment validation module.
- Separate testing/staging/production configuration.
- CORS and cookie deployment settings.
- Centralized configuration access.

### Deferred

- Multi-client SaaS.
- Platform Admin.
- Electron/offline configuration.
- Cloudinary.
- Redis and external queues.
- Unsupported financial workflows.

### Not Implemented or Verified

- Final production `.env` configuration.
- Production secrets management.
- Deployed backend authentication.
- Production MongoDB connection.
- Final cross-origin session behavior.
- Production environment readiness tests.

**Governing Principle:** TSA Academy ERP must use explicit, secure and environment-specific configuration while keeping browser-visible values separate from backend secrets and preserving authorized academic, financial and multi-branch behavior.

**Document Status:** DRAFT — Ready for environment configuration review. Actual configuration changes require separately approved implementation or deployment tickets.
