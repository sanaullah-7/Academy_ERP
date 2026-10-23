# Assets Module

**Purpose:** Manages branch assets, assignment, inspection and append-only maintenance events.

**Files:**

- `asset.routes.js` — Defines module API route registration.
- `asset.controller.js` — Translates validated HTTP requests and service results.
- `asset.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `asset.repository.js` — Contains scoped persistence queries for this module.
- `asset.model.js` — Reserves the persistent model boundary for this record type.
- `assetEvent.model.js` — Reserves the persistent model boundary for this record type.
- `asset.validation.js` — Defines request and domain input validation.

**Relationships:** Branches, Staff Users, Asset Assignments and Maintenance Events.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
