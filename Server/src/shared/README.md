# Shared Backend Services

**Purpose:** Holds narrowly reusable infrastructure that contains no module business policy.

**Files:**

- `caching/` — Permission-aware caching and invalidation.
- `database/` — Transactions, indexes and pagination.
- `errors/` — Stable errors and safe responses.
- `events/` — Internal events and reserved realtime gateway.
- `idempotency/` — Durable mutation deduplication.
- `money/` — Exact money representation and rounding.
- `utils/` — Date, identifier and sanitization helpers.

**Relationships:** Used by domain services and HTTP composition.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
