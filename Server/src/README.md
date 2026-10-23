# Backend Source

**Purpose:** Application composition, bootstrap, infrastructure boundaries and future domain modules.

- `app.js` composes BE-001 middleware and versioned health/readiness routes.
- `server.js` connects MongoDB, starts HTTP and performs graceful shutdown.
- `config/`, `middleware/`, `routes/` and `shared/` hold cross-cutting foundation code.
- `modules/` remains non-executable scaffolding for later approved business tickets.

**Status:** FOUNDATION IMPLEMENTED; domain modules remain placeholders.
