# Users Module

**Purpose:** Manages staff accounts and branch-role assignments for the five approved roles.

**Files:**

- `user.routes.js` — Defines module API route registration.
- `user.controller.js` — Translates validated HTTP requests and service results.
- `user.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `user.repository.js` — Contains scoped persistence queries for this module.
- `user.model.js` — Reserves the persistent model boundary for this record type.
- `branchRoleAssignment.model.js` — Reserves the persistent model boundary for this record type.
- `user.validation.js` — Defines request and domain input validation.
- `user.policy.js` — Defines module-specific authorization and state policies.

**Relationships:** Branches, Roles, Faculty profiles, Sessions and Audit.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
