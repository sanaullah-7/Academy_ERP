# TSA ERP Backend

**Purpose:** Modular Node.js, Express and MongoDB backend. BE-001 implements only the executable foundation; business modules and frontend integration remain unimplemented.

**Implemented foundation:**

- `src/app.js` creates the Express app without starting a listener.
- `src/server.js` validates startup dependencies, connects MongoDB, starts HTTP and performs graceful shutdown.
- `src/config/` contains validated environment, Mongoose lifecycle, security headers and redacted logging.
- `src/routes/index.js` exposes `GET /api/v1/health` and `GET /api/v1/ready`.
- `src/middleware/` contains request correlation, 404 and centralized error handling.
- `tests/unit/` verifies the BE-001 behavior without connecting to a real database.

Authentication, sessions, RBAC, CORS policy, CSRF, rate limiting, domain models and business routes remain reserved for later approved tickets.

**Status:** BE-001 FOUNDATION IMPLEMENTED.
