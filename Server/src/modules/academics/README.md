# Academics Module

**Purpose:** Manages courses, batches, subjects, streams and the pricing references consumed by admissions.

**Files:**

- `academic.routes.js` — Defines module API route registration.
- `academic.controller.js` — Translates validated HTTP requests and service results.
- `academic.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `academic.repository.js` — Contains scoped persistence queries for this module.
- `course.model.js` — Reserves the persistent model boundary for this record type.
- `batch.model.js` — Reserves the persistent model boundary for this record type.
- `subject.model.js` — Reserves the persistent model boundary for this record type.
- `stream.model.js` — Reserves the persistent model boundary for this record type.
- `academic.validation.js` — Defines request and domain input validation.
- `pricing.service.js` — Coordinates the named domain workflow without HTTP concerns.

**Relationships:** Admissions, Enrollments, Faculty Assignments, Classes, Fees and Payroll.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
