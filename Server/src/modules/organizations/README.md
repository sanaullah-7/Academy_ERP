# Organizations Module

**Purpose:** Owns academy organization identity and organization-level configuration boundaries.

**Files:**

- `organization.routes.js` — Defines module API route registration.
- `organization.controller.js` — Translates validated HTTP requests and service results.
- `organization.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `organization.repository.js` — Contains scoped persistence queries for this module.
- `organization.model.js` — Reserves the persistent model boundary for this record type.
- `organization.validation.js` — Defines request and domain input validation.

**Relationships:** Branches, Users and Settings.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
