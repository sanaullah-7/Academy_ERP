# Students Module

**Purpose:** Manages student profiles and their enrollment, guardian, academic and financial relationships.

**Files:**

- `student.routes.js` — Defines module API route registration.
- `student.controller.js` — Translates validated HTTP requests and service results.
- `student.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `student.repository.js` — Contains scoped persistence queries for this module.
- `student.model.js` — Reserves the persistent model boundary for this record type.
- `enrollment.model.js` — Reserves the persistent model boundary for this record type.
- `student.validation.js` — Defines request and domain input validation.
- `student.policy.js` — Defines module-specific authorization and state policies.

**Relationships:** Admissions, Enrollments, Courses, Batches, Fees and Classes.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
