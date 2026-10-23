# Auth Module

**Purpose:** Authenticates accounts, manages secure sessions and changes active branch context.

**Files:**

- `auth.routes.js` — Defines module API route registration.
- `auth.controller.js` — Translates validated HTTP requests and service results.
- `auth.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `auth.repository.js` — Contains scoped persistence queries for this module.
- `auth.validation.js` — Defines request and domain input validation.
- `session.model.js` — Reserves the persistent model boundary for this record type.
- `auth.mapper.js` — Reserves the approved module responsibility represented by this filename.

**Relationships:** Users, Branches, Branch Role Assignments and Sessions.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
