# HTTP Middleware

**Purpose:** Cross-cutting HTTP request boundaries.

Implemented in BE-001:

- `requestLogger.js` attaches a generated request correlation ID.
- `notFound.js` creates the canonical unknown-route error.
- `errorHandler.js` maps foundation errors to safe correlated JSON responses.

Authentication, authorization, branch/tenant scope, CSRF, durable idempotency, rate limiting, record ownership and request-schema validation remain placeholders for later approved tickets.

**Status:** BE-001 request/error foundation implemented.
