# Audit Module

**Purpose:** Stores and queries protected server-side audit events for successful mutations.

**Files:**

- `audit.routes.js` — Defines module API route registration.
- `audit.controller.js` — Translates validated HTTP requests and service results.
- `audit.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `audit.repository.js` — Contains scoped persistence queries for this module.
- `auditEvent.model.js` — Reserves the persistent model boundary for this record type.

**Relationships:** Authenticated actors, Branches and successful domain mutations.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
