# Demos Module

**Purpose:** Manages demo inquiries, selected class snapshots, attendance and conversion to admission.

**Files:**

- `demo.routes.js` — Defines module API route registration.
- `demo.controller.js` — Translates validated HTTP requests and service results.
- `demo.service.js` — Coordinates the named domain workflow without HTTP concerns.
- `demo.repository.js` — Contains scoped persistence queries for this module.
- `demoInquiry.model.js` — Reserves the persistent model boundary for this record type.
- `demo.validation.js` — Defines request and domain input validation.

**Relationships:** Courses, Batches, Classes, Faculty, Admissions and Students.

**Status:** STRUCTURE ONLY — NOT IMPLEMENTED.
