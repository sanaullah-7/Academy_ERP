# Notifications Module

**Purpose:** Stores branch-scoped role recipients, read state and workflow notifications.

**Files:**

- `notification.routes.js` — Defines module API route registration.
- `notification.controller.js` — Translates validated HTTP requests and service results.
- `notification.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `notification.repository.js` — Contains scoped persistence queries for this module.
- `notification.model.js` — Reserves the persistent model boundary for this record type.

**Relationships:** Users, Branches, Roles, Admissions, Fees and Class Assignments.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
