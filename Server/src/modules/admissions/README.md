# Admissions Module

**Purpose:** Manages admissions, approval, enrollment and transition into student and fee records.

**Files:**

- `admission.routes.js` — Defines module API route registration.
- `admission.controller.js` — Translates validated HTTP requests and service results.
- `admission.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `admission.repository.js` — Contains scoped persistence queries for this module.
- `admission.model.js` — Reserves the persistent model boundary for this record type.
- `admission.validation.js` — Defines request and domain input validation.
- `admission.policy.js` — Defines module-specific authorization and state policies.
- `enrollment.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** Students, Enrollments, Courses, Batches, Subjects, Fees and Finance.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
