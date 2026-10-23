# LOGGING_AND_MONITORING

<!-- > Purpose: Defines structured logging, observability, alerts and sensitive-data protection. -->

# TSA Academy ERP — Logging, Monitoring & Operational Observability Specification

**Document:** LOGGING_AND_MONITORING.md
**Project:** TSA Academy ERP
**Version:** 1.0
**Last Updated:** 2026-10-23
**Status:** DRAFT — Operational Monitoring Proposed; Production Monitoring Not Verified
**Frontend:** React + Vite
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Architecture:** Modular Monolith
**Initial Scope:** One Academy Organization with Multiple Branches
**Document Category:** Operations & Reliability

---

## 1. Purpose

This document defines the logging, monitoring, audit-event observation, incident detection and operational troubleshooting standards for TSA Academy ERP.

The primary objective is to make backend behavior observable and operational failures diagnosable without compromising confidential student records, staff information, Teacher Payroll or financial data.

The monitoring strategy must support:

- HTTP API operations.
- Authentication and sessions.
- Role-based authorization.
- Organization and branch isolation.
- Student Admissions.
- Enrollments.
- Challans and verified fee payments.
- Faculty assignments.
- Assignment-based Teacher Payroll.
- Payroll-linked Expenses.
- Finance and Reports.
- MongoDB connectivity.
- Database transactions.
- Error handling.
- Deployment health.
- Backup and recovery verification.

**Implementation boundary:** This document establishes proposed logging and monitoring requirements. It does not authorize installing services, uploading logs, modifying source code, enabling paid monitoring or connecting production accounts.

---

## 2. Core Observability Principles

### OBS-001 — Security Before Visibility

Logs must not expose passwords, credentials, private session tokens or unnecessary personal information.

### OBS-002 — Accurate Events

Record actual successful or failed operations. Never report a business operation as committed before the required database transaction succeeds.

### OBS-003 — Structured Logging

Prefer consistently structured event information that can be searched and correlated.

### OBS-004 — Request Correlation

Use an appropriate request identifier to connect related backend activity.

### OBS-005 — Branch and Organization Awareness

Operational diagnostics should support authorized investigation of relevant academy and branch operations.

### OBS-006 — Financial Traceability

Important verified fee payments and salary disbursements must be traceable without exposing confidential payroll details in ordinary application logs.

### OBS-007 — Separation of Logs and Audit Records

Temporary application logs and durable business audit records serve different purposes.

### OBS-008 — Meaningful Alerts

Alerts should identify actionable problems rather than create unnecessary noise.

### OBS-009 — Minimal Infrastructure

Begin with suitable application logging and hosting-provider monitoring.

### OBS-010 — Evidence-Based Reporting

A monitoring capability is not operational until it is configured and verified.

---

## 3. Observability Architecture

### Proposed Flow

```text
React Frontend
      |
      v
Express API
      |
      +----> Application Logs
      |
      +----> Security Events
      |
      +----> Business Audit Events
      |
      +----> Request Metrics
      |
      v
Domain Services
      |
      +----> Financial Transaction Results
      |
      +----> Business Rule Failures
      |
      v
MongoDB
      |
      +----> Database Health
      |
      +----> Query Performance
      |
      +----> Transaction Errors
      |
      v
Approved Monitoring / Alerting
```

This architecture is conceptual.

The actual monitoring provider, logging library, metrics infrastructure and alert delivery method remain TBD.

---

## 4. Logging Categories

The backend should distinguish different types of records.

| Category | Purpose | Example |
|---|---|---|
| Application | General server operation | Startup, shutdown |
| HTTP Access | Request outcome and duration | Successful API request |
| Error | Unexpected failures | Database operation failed |
| Security | Authentication and permission decisions | Unauthorized access attempt |
| Business Audit | Durable sensitive business history | Approved admission |
| Financial Operation | Safe payment processing diagnostics | Salary payment committed |
| Database | Connectivity and query diagnostics | Transaction conflict |
| Deployment | Release startup and readiness | New version started |
| Backup/Recovery | Recovery operations and failures | Backup verification failed |

Not every category requires a separate external service.

---

## 5. Log Levels

The proposed log levels are:

| Level | Meaning | Typical use |
|---|---|---|
| `error` | Failed operation requiring investigation | Unhandled exception |
| `warn` | Unexpected or potentially harmful situation | Repeated authentication failure |
| `info` | Important normal operation | Server started |
| `debug` | Detailed development diagnostics | Safe query timing |

### Production Guidance

Production should normally prioritize `info`, `warn` and `error` events.

`debug` logging must not be enabled broadly without considering:

- Confidentiality.
- Performance.
- Log volume.
- Retention.
- Operational purpose.

The exact final logging configuration depends on the chosen library and hosting provider.

---

## 6. Structured Log Format

A proposed application-log event may include:

```json
{
  "timestamp": "2026-10-23T12:00:00.000Z",
  "level": "info",
  "service": "tsa-academy-api",
  "environment": "development",
  "requestId": "example-request-id",
  "module": "admissions",
  "event": "admission.operation.completed",
  "result": "success",
  "durationMs": 42
}
```

This is an illustrative format, not an implemented event.

### Recommended Fields

- Timestamp.
- Severity.
- Application/service identifier.
- Environment.
- Request ID.
- Module.
- Event name.
- Safe result status.
- Duration where appropriate.
- Safe error code when applicable.

### Optional Restricted Metadata

An authorized operational log may also include limited internal identifiers such as:

- Actor identifier.
- Organization identifier.
- Branch identifier.
- Resource identifier.

These identifiers must not be used to expose personal records in general-purpose logs.

---

## 7. Request Correlation

Each inbound API request should receive or use a trustworthy request identifier.

### Purpose

Request IDs help connect:

- HTTP access events.
- Authentication decisions.
- Domain service activity.
- Database transaction failures.
- Error responses.

### Requirements

1. Validate or safely generate request identifiers.
2. Prevent unbounded attacker-controlled values.
3. Preserve correlation through relevant server layers.
4. Return a safe request identifier in error responses where useful.
5. Do not treat request IDs as authentication secrets or authorization evidence.

### Important

A request ID is for diagnostics.

It does not replace an idempotency key or a financial transaction identifier.

---

## 8. HTTP API Access Logging

HTTP logs should record relevant operational details.

### Candidate Fields

- Request ID.
- HTTP method.
- Normalized route.
- Response status.
- Response duration.
- Safe application error code.
- Authorized module category.

### Avoid Logging

- Password request bodies.
- Authentication cookies.
- Authorization tokens.
- Full financial payment payloads.
- Complete student records.
- Sensitive query parameters.
- Confidential salary agreement contents.

### Query Strings

Avoid capturing sensitive raw query strings by default.

Use normalized route templates where possible.

---

## 9. Authentication Logging

Important security events may include:

- Successful login.
- Failed login.
- Disabled-account login attempt.
- Session expiration.
- Logout.
- Session revocation.
- Password change.
- Protected-account modification.

### Requirements

- Record enough metadata for authorized investigation.
- Avoid revealing whether a login identifier exists through external error messages.
- Do not log plaintext credentials.
- Avoid leaking session IDs.
- Apply approved retention and access restrictions.

### Repeated Failures

High volumes of failed authentication may indicate:

- Incorrect client configuration.
- Forgotten credentials.
- Credential stuffing.
- Brute-force attempts.
- Application defects.

Alert policies should distinguish meaningful patterns from isolated failures.

---

## 10. Role-Based Authorization Monitoring

The backend supports exactly five current roles:

1. Super Admin.
2. Admin.
3. Receptionist.
4. Owner.
5. Teacher.

### Monitored Security Events

- Unauthorized action attempt.
- Unauthorized branch access.
- Unauthorized record access.
- Attempted privilege escalation.
- Invalid role assignment.
- Protected-account modification.
- Unsupported same-branch multi-role combination.
- Branch membership revocation.

### Current Business Restrictions

- Receptionist has full approved Admissions and Fees access.
- Receptionist has no independent Finance or Payroll access.
- Teacher has access only to their own compensation.
- Admin cannot escalate to unauthorized Super Admin privileges.
- Branch creation remains paused for all roles.

### Logging Principle

Authorization failures should be visible to authorized operators without including protected record contents.

---

## 11. Organization and Branch Monitoring

Every protected branch-owned operation must apply the authorized scope.

### Useful Events

- Authorized branch switch.
- Branch access rejected.
- Branch membership modified.
- Branch deactivated.
- Cross-branch report requested.
- Branch ownership mismatch detected.

### Requirements

- Record safe organization/branch identifiers when necessary.
- Avoid raw personal data in security logs.
- Distinguish permitted cross-branch reporting from prohibited cross-branch mutations.
- Monitor repeated unexpected branch-access failures.

### Important

A branch switch must not cause cached records from the previous branch to appear under the new branch.

This requires application correctness, not just logging.

---

## 12. Admissions Monitoring

Admissions events may include:

- Admission created.
- Admission updated.
- Admission approved.
- Admission returned to Pending.
- Enrollment completed.
- Instant admission failed.
- Admission deletion rejected by business rules.

### Requirements

- Record an actual committed event only after successful persistence.
- Preserve approved status-transition meaning.
- Correlate important operations with their request IDs.
- Record safe failure codes.
- Avoid logging full applicant personal details.

### Historical Rule

The previous Reject workflow has been superseded by the current approved Pending/Approved behavior.

Do not invent new rejection events as active product functionality.

---

## 13. Enrollment and Capacity Monitoring

Potential events include:

- Enrollment created.
- Duplicate enrollment rejected.
- Batch capacity reached.
- Concurrent enrollment conflict.
- Invalid Course/Batch relationship.
- Enrollment transaction aborted.

### Monitoring Goals

- Identify repeated capacity conflicts.
- Detect unexpected duplicate attempts.
- Identify transaction failures.
- Preserve accurate enrollment outcomes.
- Support investigation without revealing unnecessary student details.

### Critical Rule

A capacity conflict is not automatically a backend outage.

Business validation and infrastructure failures must be distinguishable.

---

## 14. Fee Payment Monitoring

Fee collection requires strong operational traceability.

### Candidate Events

- Payment request received.
- Payment validation rejected.
- Payment transaction committed.
- Duplicate request detected.
- Overpayment rejected.
- Payment verification status changed under an approved workflow.
- Receipt generated.
- Financial transaction failed.

### Data Protection

Ordinary application logs should not contain:

- Full student personal information.
- Unnecessary payment instrument details.
- Authentication credentials.
- Confidential payment attachments.

### Transaction Result Integrity

A payment must not be logged as financially successful until the required authoritative commit has completed.

If an API response times out after a possible commit, the operation must be investigated through authoritative transaction status, not assumed failed.

---

## 15. Teacher Payroll Monitoring

**CONFIRMED:** Payroll uses assignment-based running salary balances, not automatic monthly salary generation.

### Candidate Events

- Salary agreement created.
- Salary agreement revised.
- Assignment payable calculated.
- Partial salary payment committed.
- Full salary settlement committed.
- Duplicate salary payment rejected.
- Invalid overpayment rejected.
- Payroll transaction conflict.
- Linked expense posting failed.
- Salary-to-expense reconciliation discrepancy.

### Requirements

- Correlate relevant Payroll Payment and Expense records.
- Preserve historical assignment identities.
- Monitor duplicate payment risks.
- Monitor discrepancies in paid and outstanding amounts.
- Restrict access to detailed payroll diagnostics.
- Do not reveal one Teacher's remuneration to another.

### Prohibited Operational Behavior

Monitoring or scheduled jobs must not accidentally introduce automatic monthly payroll generation.

---

## 16. Payroll-to-Expense Consistency

A successfully posted salary payment must have the required matching financial expense.

### Reconciliation Concept

```text
Salary Payment
      |
      v
Linked Posted Expense
      |
      v
Finance / Reports
```

### Required Monitoring

Detect:

- Salary Payment without required Posted Expense.
- Posted Payroll Expense without valid Salary Payment.
- Multiple expenses linked to one payment where uniqueness is required.
- Amount mismatch.
- Branch mismatch.
- Incorrect Finance aggregation.
- Repeated payment under the same idempotency reference.

### Incident Handling

Do not silently create replacement financial records.

Flag discrepancies for investigation and approved correction.

---

## 17. Finance Monitoring

Finance summaries derive from authoritative financial records.

### Revenue

Only eligible verified Fee Payments count toward confirmed collection totals.

### Expenses

Only applicable posted expenses count according to the approved financial rules.

### Monitoring Checks

- Verified collections reconcile.
- Salary expense totals reconcile.
- Unexpected negative or inconsistent balances are detected.
- Reports agree with source records.
- Branch-scoped totals are accurate.
- Unauthorized Finance access is denied.

### Reporting Note

A cached summary mismatch must not trigger automatic modification of source financial transactions.

---

## 18. MongoDB Connectivity Monitoring

### Important Signals

- Connection established.
- Connection failure.
- Connection lost.
- Reconnection behavior.
- Database operation timeout.
- Connection pool pressure.
- Unhandled database error.

### Requirements

- Distinguish process availability from database readiness.
- Avoid logging full secret-bearing MongoDB URIs.
- Record safe errors.
- Prevent false successful financial writes during database outages.
- Expose appropriate readiness information.

### Database Dependency

The backend must not report itself ready for normal MongoDB-dependent operations when the required database connection is unavailable.

---

## 19. MongoDB Query Performance

Candidate metrics include:

- Slow query duration.
- Query volume.
- Aggregation execution time.
- Collection scan patterns.
- Index usage.
- Connection pool utilization.

### High-Priority Queries

- Student directory.
- Admission search.
- Enrollment capacity.
- Challan history.
- Verified collections.
- Finance reports.
- Teacher salary obligations.
- Payroll payment history.
- Branch-comparison reports.

### Important

Only add or adjust indexes after reviewing actual access patterns and query evidence.

Logging every database query in production may expose sensitive information and create excessive overhead.

---

## 20. Transaction Monitoring

MongoDB transactions may protect:

- Instant Admission.
- Enrollment and Challan creation.
- Fee payment coordination.
- Teacher Salary Payment with matching Expense.
- Approved multi-record administrative operations.

### Candidate Events

- Transaction started.
- Transaction committed.
- Transaction aborted.
- Transient transaction conflict.
- Retry performed.
- Retry exhausted.
- Commit result uncertain.

### Requirements

- Distinguish known failure from uncertain commit outcomes.
- Avoid duplicate payments during retries.
- Preserve correlation identifiers.
- Do not log a successful payment before the required commit.
- Monitor repeated transaction failures.

---

## 21. Idempotency Monitoring

Financial and other sensitive operations may use idempotency keys.

### Useful Events

- New idempotent request.
- Successful replay of an existing result.
- Duplicate concurrent request.
- Key reused with conflicting payload.
- Incomplete or uncertain operation.
- Idempotency storage failure.

### Rules

- Do not log private request contents unnecessarily.
- Do not confuse a repeated amount with a duplicate financial operation.
- Verify duplicate protection through actual persisted state.
- Treat idempotency failure as a significant reliability risk for payment APIs.

---

## 22. Application Error Handling

Errors should use safe normalized codes and appropriate HTTP statuses.

### Error Categories

- Validation error.
- Authentication failure.
- Authorization failure.
- Record not found.
- Business conflict.
- Concurrency conflict.
- External dependency failure.
- Database failure.
- Unexpected internal error.

### Logging Requirements

- Capture safe technical context.
- Record request correlation.
- Avoid duplicating the same error in every layer.
- Protect confidential stack traces from ordinary API clients.
- Preserve sufficient diagnostic detail for authorized developers.

### Important

Expected business validation failures should not automatically be treated as critical application incidents.

---

## 23. Frontend Error Monitoring

The React frontend may require visibility into:

- API connectivity failures.
- Authentication/session errors.
- Branch switch failures.
- Route rendering failures.
- Unexpected component exceptions.
- Export failures.
- Stale frontend data.
- Failed payment confirmation displays.

### Requirements

- Do not transmit confidential full UI state into error trackers.
- Avoid capturing passwords or private salary details.
- Keep error reporting consistent with the approved privacy policy.
- Confirm frontend errors correspond to actual network or application failures.

### Optional Service

A third-party frontend error tracker may be considered after approval.

It is not mandatory for the initial backend.

---

## 24. Audit Log Versus Application Log

These must remain distinct.

| Application Log | Business Audit Log |
|---|---|
| Diagnoses technical operations | Records important business/security actions |
| May be short-lived | Requires an approved retention policy |
| Primarily for developers/operators | For authorized accountability and investigation |
| May contain request timing | Should contain actor/action/resource metadata |
| Can record failed infrastructure attempts | Records approved business events and relevant security attempts |
| Must avoid unnecessary PII | Must follow restricted audit permissions |

### Critical Rule

Deleting temporary application logs must not delete durable business audit events.

Ordinary audit records must not be editable through general-purpose CRUD APIs.

---

## 25. Audit Events

Audit-relevant operations may include:

- User role changes.
- Branch assignments.
- Protected account changes.
- Admission approvals.
- Enrollment creation.
- Verified fee collections.
- Salary agreement changes.
- Payroll disbursements.
- Posted expense creation.
- Authorized settings changes.

### Event Fields

Candidate audit metadata:

- Event identifier.
- Timestamp.
- Actor.
- Organization and branch.
- Action.
- Resource type.
- Resource identifier.
- Relevant approved change summary.
- Outcome.

### Security Requirements

- No password values.
- No session secrets.
- Restricted access.
- Correct actor attribution.
- Consistent storage with critical operations where required.

---

## 26. Health and Readiness Monitoring

Proposed endpoints:

```http
GET /health
GET /ready
```

These paths are illustrative until implemented.

### Liveness

Indicates whether the application process is responding.

### Readiness

Indicates whether it is ready to handle requests requiring critical dependencies.

### Restrictions

Do not expose:

- Database credentials.
- Connection strings with passwords.
- Environment secrets.
- Full stack traces.
- Confidential user or salary records.

### Monitoring

Use appropriately configured hosting health checks after the endpoints are implemented.

---

## 27. API Performance Monitoring

Measure performance where it is useful.

### Candidate Metrics

- Request count.
- Response duration.
- HTTP error rate.
- Authentication failures.
- Business conflict rate.
- Slow API routes.
- Database query time.
- Transaction failure rate.

### Reporting Dimensions

Appropriate aggregated dimensions may include:

- Route template.
- Module.
- Environment.
- Response status class.
- Authorized branch grouping where needed and privacy-safe.

Avoid high-cardinality personal identifiers as unrestricted metric labels.

---

## 28. Performance Thresholds

Performance and alert thresholds must reflect real usage.

### Examples of Measurements

- Typical API latency.
- Slow requests.
- Sustained error-rate increases.
- Database connection failures.
- Repeated transaction conflicts.
- Resource exhaustion.

### Important

Do not invent hard service-level agreements or guaranteed response times without:

1. Expected workload.
2. Hosting capacity.
3. Baseline measurements.
4. Owner-approved targets.

The final performance limits remain TBD.

---

## 29. Monitoring Dashboard Design

A proposed operational dashboard may group indicators into the following areas.

### Application Health

- Service availability.
- API errors.
- Request latency.
- Deployment version.

### Authentication and Security

- Login failures.
- Authorization denials.
- Session problems.
- Protected role changes.

### Database

- Connection health.
- Slow queries.
- Transaction errors.
- Resource usage.

### Financial Integrity

- Failed fee operations.
- Duplicate request rejections.
- Payroll transaction failures.
- Salary-to-expense reconciliation discrepancies.

### Recovery

- Backup failures.
- Failed restore verification.
- Recovery incidents.

The dashboard should display operational metrics, not confidential individual salary records.

---

## 30. Alert Categories

| Severity | Meaning | Example |
|---|---|---|
| Critical | Service unavailable, security incident or serious financial-integrity risk | Database outage, confirmed salary double posting |
| High | Major feature failure or recurring protected-operation issue | Payment transaction failures |
| Medium | Degraded performance or elevated errors | Sustained slow queries |
| Low | Nonurgent operational observation | Intermittent recoverable warning |

### Rules

- Alert on meaningful conditions.
- Avoid excessive notifications from expected validation failures.
- Include safe context.
- Provide a clear investigation path.
- Do not disclose personal records in ordinary alert messages.

---

## 31. Alert Delivery

Potential alert channels include:

- Hosting-provider notifications.
- Approved email addresses.
- Approved incident-management services.
- Other authorized operational channels.

### Requirements

- Confirm alert recipients.
- Limit access to confidential details.
- Test delivery.
- Document escalation.
- Prevent repeated duplicate alerts where appropriate.

The final alert provider and recipients remain TBD.

---

## 32. Incident Detection and Response

A monitoring incident may involve:

- Authentication outage.
- API availability failure.
- MongoDB connectivity loss.
- Unauthorized cross-branch access.
- Duplicate verified payment.
- Payroll balance inconsistency.
- Missing posted salary expense.
- Failed deployment.
- Backup failure.

### Initial Response

1. Confirm the signal is genuine.
2. Identify affected systems.
3. Protect data and operational evidence.
4. Stop unsafe financial writes if necessary.
5. Review safe correlated logs.
6. Identify affected records.
7. Follow approved correction or recovery procedures.
8. Test the fix.
9. Document the incident.

### Financial Incidents

Do not silently change transaction history to clear an alert.

---

## 33. Deployment Monitoring

After an approved deployment, verify:

- Server starts correctly.
- Database connection succeeds.
- Readiness is reported accurately.
- Frontend reaches the intended API.
- Authentication works.
- Sessions work across deployed origins.
- Branch selection works.
- Protected APIs enforce permissions.
- Financial operations remain safe.
- No unexpected increase in critical errors.

### Release Identification

Logs should include a safe application/release identifier where available.

Do not expose repository credentials or secret deployment tokens.

---

## 34. Backup Monitoring

Monitor backup and recovery readiness according to the approved provider and plan.

### Candidate Events

- Backup completed.
- Backup failed.
- Backup missing.
- Storage capacity warning.
- Restore test passed.
- Restore test failed.
- Backup retention policy modified.

### Important

Do not claim that automated backups or point-in-time recovery exist until their configuration and actual status are verified.

---

## 35. Logging Storage and Retention

Retention policies must balance:

- Operational usefulness.
- Privacy.
- Security.
- Cost.
- Applicable requirements.

### Separate Retention Decisions

Define policies for:

- Application logs.
- Security events.
- Audit records.
- Financial transaction history.
- Backup/restore logs.

### Requirements

- Restrict access.
- Avoid unnecessary long-term personal data retention.
- Preserve legally or operationally required financial history.
- Prevent unauthorized log deletion.
- Establish appropriate deletion procedures.

Final retention durations remain TBD.

---

## 36. Log Access Security

Logs may include sensitive internal metadata.

### Requirements

- Use least-privilege access.
- Restrict security and payroll diagnostics.
- Separate developer access from unrestricted operational administration where feasible.
- Avoid public log-sharing links.
- Protect exports of logs.
- Review access when staff responsibilities change.

An application Receptionist or Teacher role does not automatically grant access to backend infrastructure logs.

---

## 37. Monitoring Privacy

Monitoring tools must not become a secondary unrestricted database of student or payroll information.

### Prohibited Practices

- Logging plaintext passwords.
- Sending entire student records to external trackers.
- Publishing Teacher salary details in alerts.
- Recording full payment request bodies unnecessarily.
- Embedding session cookies in request logs.
- Treating a request ID as proof of permission.
- Capturing confidential reports in screenshots without authorization.

### Preferred Practice

Use event types, safe identifiers, result codes and aggregated metrics.

---

## 38. Monitoring Tests

Future backend implementation should verify logging and monitoring behavior.

### Application Tests

- Request ID generated.
- Error logged safely.
- Correct HTTP status returned.
- No secret values included.
- Expected operation result accurately recorded.

### Security Tests

- Failed authentication event recorded.
- Unauthorized branch attempt recorded safely.
- Protected-role change audited.
- Teacher salary privacy preserved.

### Financial Tests

- Verified fee payment logs only after commit.
- Failed fee payment not logged as successful.
- Salary payment and expense correlation preserved.
- Duplicate payment does not create duplicate success audit events.
- Transaction rollback does not produce false success notifications.

### Infrastructure Tests

- Health endpoint behavior.
- Readiness failure during database outage.
- Monitoring detects the relevant failure.
- Backup failure alert works when configured.

No test may be reported passed unless actually executed.

---

## 39. Observability Implementation Sequence

When separately authorized, implement monitoring incrementally.

### Phase O1 — Basic Server Logging

- Safe request logging.
- Centralized error logging.
- Environment-aware log levels.
- Request correlation.

### Phase O2 — Authentication and Security Events

- Login/logout.
- Protected role changes.
- Authorization failures.
- Branch-access violations.

### Phase O3 — Business Audit

- Admission decisions.
- Fee payment history.
- Salary agreement changes.
- Payroll disbursement.
- Financial expense linkage.

### Phase O4 — Database and Transaction Health

- MongoDB readiness.
- Transaction failures.
- Slow query visibility.
- Connection errors.

### Phase O5 — Deployment and Alerts

- Hosting health checks.
- Critical alerts.
- Release verification.
- Backup monitoring.

### Phase O6 — Performance Optimization

- Baseline metrics.
- Targeted profiling.
- Evidence-based improvements.

Do not install all possible monitoring tools during the first phase.

---

## 40. Acceptance Criteria

Logging and monitoring implementation is technically acceptable when:

1. Important API failures are diagnosable.
2. Request correlation works.
3. Sensitive credentials are not logged.
4. Authentication and authorization failures are traceable.
5. Organization and branch context is handled safely.
6. Critical financial commits are accurately recorded.
7. Rolled-back operations are not presented as successful.
8. Payroll-to-expense discrepancies can be identified.
9. MongoDB availability is monitored.
10. Health/readiness endpoints work as designed.
11. Relevant operational tests pass.
12. Monitoring access follows approved security restrictions.

Formal operational acceptance requires separate approval.

---

## 41. Operational Readiness Checklist

- [ ] Logging library/approach approved.
- [ ] Request correlation implemented.
- [ ] Sensitive values redacted.
- [ ] Authentication events recorded safely.
- [ ] Authorization failures recorded safely.
- [ ] Business Audit separation implemented.
- [ ] Financial transaction outcome logging verified.
- [ ] Payroll-to-expense reconciliation monitoring verified.
- [ ] MongoDB health monitored.
- [ ] Slow-query monitoring configured where needed.
- [ ] Liveness/readiness verified.
- [ ] Hosting logs accessible to authorized operators.
- [ ] Alert rules approved.
- [ ] Alert delivery tested.
- [ ] Backup failure monitoring verified.
- [ ] Retention/access policy approved.
- [ ] Relevant tests executed.

Unchecked items indicate unfinished verification, not implemented capability.

---

## 42. Open Decisions

The following remain TBD:

- Logging library.
- Structured log schema.
- Request ID format.
- Monitoring hosting provider.
- Log storage location.
- Retention periods.
- Security-event access policy.
- Audit-event persistence design.
- Financial reconciliation alert thresholds.
- API latency targets.
- Database query warning limits.
- Alert recipients.
- Incident escalation procedures.
- Backup monitoring integration.
- External error tracking service.
- Production monitoring cost limits.

Do not treat proposed values as already implemented or approved.

---

## 43. Explicitly Deferred Monitoring

The current implementation does not require:

- Enterprise distributed tracing infrastructure.
- Multi-region telemetry collection.
- Redis monitoring without Redis.
- Microservice tracing without microservices.
- Kafka/RabbitMQ monitoring without those services.
- Cloudinary media-processing monitoring.
- Platform Admin SaaS analytics.
- Electron/LAN synchronization monitoring.
- Automatic monthly payroll monitoring.

These capabilities require corresponding approved features and infrastructure.

---

## 44. Related Documentation

This document must remain consistent with:

- `ARCHITECTURE.md` — Technical architecture.
- `SECURITY.md` — Security requirements.
- `AUTHENTICATION_AND_SECURITY.md` — Authentication and sessions.
- `RBAC_PERMISSIONS.md` — Role permissions.
- `TENANT_BRANCH_ISOLATION.md` — Organization and branch scope.
- `API.md` — API architecture.
- `API_CONTRACTS.md` — HTTP contracts.
- `DATABASE.md` — MongoDB schema.
- `ERD.md` — Entity relationships.
- `BUSINESS_RULES.md` — Domain invariants.
- `DATA_FLOW.md` — Cross-module events.
- `TRANSACTIONS_AND_INTEGRITY.md` — Financial atomicity.
- `CACHING_AND_PERFORMANCE.md` — Performance design.
- `BACKEND_TESTING_STRATEGY.md` — Testing requirements.
- `BACKEND_IMPLEMENTATION_PLAN.md` — Development roadmap.
- `DEPLOYMENT.md` — Hosting and releases.
- `ENVIRONMENT_CONFIG.md` — Configuration.
- `BACKUP_AND_RECOVERY.md` — Recovery procedures.
- `DATABASE_MIGRATIONS.md` — Data migrations.
- `FRONTEND_INTEGRATION.md` — Service integration.
- `AGENTS.md` — Agent instructions.
- `RULES.md` — Engineering standards.
- `MEMORY.md` — Approved decisions.
- `TASKS.md` — Development work.
- `PROGRESS.md` — Verified implementation status.

Relative Markdown links must match actual repository paths.

---

## 45. Final Implementation Boundary

### Confirmed Requirements

- Five frontend roles.
- Receptionist Full Admissions and Fees access.
- Teacher self-only compensation.
- Assignment-based running Teacher Payroll.
- No automatic monthly salary generation.
- One academy with multiple authorized branches.
- Current branch creation pause.
- Secure academic and financial records.

### Proposed Operational Capabilities

- Structured application logs.
- Request correlation.
- Security-event logging.
- Business Audit records.
- Financial transaction outcome monitoring.
- MongoDB health monitoring.
- API metrics and performance tracking.
- Deployment and backup alerts.
- Operational incident diagnostics.

### Deferred

- Enterprise distributed tracing.
- Multi-client SaaS monitoring.
- Redis/queue telemetry.
- Electron/offline monitoring.
- Cloudinary media telemetry.
- Automatic monthly payroll services.

### Not Implemented or Verified

- Production structured logging.
- Monitoring dashboards.
- Configured production alerts.
- Final retention policies.
- Verified financial reconciliation alerts.
- Operational monitoring acceptance.

**Governing Principle:** TSA Academy ERP must provide enough operational visibility to detect failures, investigate security events and verify financial integrity while protecting confidential data and avoiding unnecessary infrastructure complexity.

**Document Status:** DRAFT — Ready for operational observability review. Implementation requires separately approved technical tickets.
