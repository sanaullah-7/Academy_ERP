# Classes Module

**Purpose:** Manages class schedules, rosters and teacher or room conflict validation.

**Files:**

- `class.routes.js` — Defines module API route registration.
- `class.controller.js` — Translates validated HTTP requests and service results.
- `class.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `class.repository.js` — Contains scoped persistence queries for this module.
- `class.model.js` — Reserves the persistent model boundary for this record type.
- `class.validation.js` — Defines request and domain input validation.
- `scheduleConflict.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** Faculty Assignments, Batches, Subjects, Teachers and enrolled Students.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
