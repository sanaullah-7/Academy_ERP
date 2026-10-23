# Branches Module

**Purpose:** Manages branch lifecycle while enforcing server-side organization and branch isolation.

**Files:**

- `branch.routes.js` — Defines module API route registration.
- `branch.controller.js` — Translates validated HTTP requests and service results.
- `branch.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `branch.repository.js` — Contains scoped persistence queries for this module.
- `branch.model.js` — Reserves the persistent model boundary for this record type.
- `branch.validation.js` — Defines request and domain input validation.
- `branch.policy.js` — Defines module-specific authorization and state policies.

**Relationships:** Organizations, Users and every branch-owned operational record.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
