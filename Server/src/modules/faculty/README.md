# Faculty Module

**Purpose:** Connects Teacher identities to courses, batches, subjects and assignment salary eligibility.

**Files:**

- `faculty.routes.js` — Defines module API route registration.
- `faculty.controller.js` — Translates validated HTTP requests and service results.
- `faculty.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `faculty.repository.js` — Contains scoped persistence queries for this module.
- `facultyAssignment.model.js` — Reserves the persistent model boundary for this record type.
- `faculty.validation.js` — Defines request and domain input validation.
- `assignment.policy.js` — Defines module-specific authorization and state policies.

**Relationships:** Users, Courses, Batches, Subjects, Classes and Payroll.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
